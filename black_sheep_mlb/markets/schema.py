"""Provider-agnostic market records for odds and prop feeds.

These types are infrastructure only. They intentionally do not select a
provider, fetch live data, or change prediction behavior.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class MarketFreshness(str, Enum):
    FRESH = "fresh"
    STALE = "stale"
    UNKNOWN = "unknown"


class MarketCoverageStatus(str, Enum):
    FULL = "full"
    PARTIAL = "partial"
    ONE_SIDED = "one_sided"
    UNPRICED = "unpriced"
    PROJECTION_ONLY = "projection_only"
    DATA_BLOCKED = "data_blocked"
    MANUAL_ONLY = "manual_only"
    STALE = "stale"


class MarketBackedStatus(str, Enum):
    MARKET_BACKED_EV = "market_backed_ev"
    DISPLAY_ONLY = "display_only"
    PROJECTION_ONLY = "projection_only"
    DATA_BLOCKED = "data_blocked"
    MANUAL_ONLY = "manual_only"
    STALE = "stale"
    UNPRICED = "unpriced"


class MarketType(str, Enum):
    MONEYLINE = "moneyline"
    SPREAD = "spread"
    TOTAL = "total"
    BATTER_HOME_RUNS = "batter_home_runs"
    BATTER_TOTAL_BASES = "batter_total_bases"
    UNKNOWN = "unknown"


class MarketSide(str, Enum):
    HOME = "home"
    AWAY = "away"
    OVER = "over"
    UNDER = "under"
    YES = "yes"
    NO = "no"
    PARTICIPANT = "participant"
    UNKNOWN = "unknown"


MANUAL_MARKET_CSV_COLUMNS: tuple[str, ...] = (
    "date",
    "game_key",
    "provider_event_id",
    "provider",
    "sportsbook",
    "market_type",
    "participant",
    "player_name",
    "player_id",
    "team",
    "line",
    "side",
    "price",
    "timestamp",
    "source_confidence",
)


@dataclass(frozen=True)
class ProviderEventRef:
    provider: str
    provider_event_id: str
    game_key: str
    commence_time: str | None = None
    raw_provider_metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class BaseMarket:
    game_key: str
    provider: str
    sportsbook: str
    market_type: MarketType | str
    side: MarketSide | str
    price: int | float | None
    timestamp: str | None = None
    provider_event_id: str | None = None
    line: float | None = None
    freshness: MarketFreshness = MarketFreshness.UNKNOWN
    coverage_status: MarketCoverageStatus = MarketCoverageStatus.PARTIAL
    backed_status: MarketBackedStatus = MarketBackedStatus.DISPLAY_ONLY
    source_confidence: str = "unknown"
    raw_provider_metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def has_price(self) -> bool:
        return self.price is not None


@dataclass(frozen=True)
class GameMarket(BaseMarket):
    participant: str = ""
    team: str = ""


@dataclass(frozen=True)
class PlayerPropMarket(BaseMarket):
    player_name: str = ""
    player_id: str | int | None = None
    team: str = ""


@dataclass(frozen=True)
class MarketSnapshot:
    report_date: str
    provider_events: list[ProviderEventRef] = field(default_factory=list)
    game_markets: list[GameMarket] = field(default_factory=list)
    player_prop_markets: list[PlayerPropMarket] = field(default_factory=list)
    generated_at: str | None = None
    diagnostics: list[dict[str, Any]] = field(default_factory=list)
    raw_provider_metadata: dict[str, Any] = field(default_factory=dict)

    def markets_for_game(self, game_key: str) -> list[GameMarket | PlayerPropMarket]:
        return [
            market
            for market in [*self.game_markets, *self.player_prop_markets]
            if market.game_key == game_key
        ]


def game_markets_from_legacy_game_odds(odds: Any) -> list[GameMarket]:
    """Bridge package ``GameOdds``-like records into normalized game markets."""
    provider = str(getattr(odds, "provider", "") or "")
    event_id = str(getattr(odds, "game_id", "") or getattr(odds, "event_id", "") or "")
    fetched_at = str(getattr(odds, "fetched_at", "") or getattr(odds, "last_update", "") or "") or None
    away = str(getattr(odds, "away_team", "") or getattr(odds, "away_abbr", "") or "")
    home = str(getattr(odds, "home_team", "") or getattr(odds, "home_abbr", "") or "")
    game_key = f"{away}@{home}" if away and home else ""
    markets: list[GameMarket] = []

    # black_sheep_mlb.data_sources.odds_provider.GameOdds shape.
    for book_market in list(getattr(odds, "markets", []) or []):
        sportsbook = str(getattr(book_market, "bookmaker", "") or "")
        market_type = _normalize_market_type(getattr(book_market, "market", ""))
        for outcome in list(getattr(book_market, "outcomes", []) or []):
            participant = str(getattr(outcome, "name", "") or "")
            markets.append(
                GameMarket(
                    game_key=game_key,
                    provider=provider,
                    provider_event_id=event_id,
                    sportsbook=sportsbook,
                    market_type=market_type,
                    participant=participant,
                    team=participant,
                    side=_side_from_participant(participant, away, home),
                    price=getattr(outcome, "price", None),
                    line=getattr(outcome, "point", None),
                    timestamp=fetched_at,
                    coverage_status=MarketCoverageStatus.FULL,
                    backed_status=MarketBackedStatus.DISPLAY_ONLY,
                    source_confidence="provider",
                    raw_provider_metadata={"legacy_source": odds.__class__.__name__},
                )
            )

    # canvases.exports.live_mlb_data.GameOdds shape.
    if not markets and game_key:
        source = str(getattr(odds, "source", "") or provider or "legacy")
        rows = [
            (MarketType.MONEYLINE, MarketSide.AWAY, away, getattr(odds, "away_moneyline", None), None),
            (MarketType.MONEYLINE, MarketSide.HOME, home, getattr(odds, "home_moneyline", None), None),
            (MarketType.TOTAL, MarketSide.OVER, "Over", getattr(odds, "over_price", None), getattr(odds, "total_line", None)),
            (MarketType.TOTAL, MarketSide.UNDER, "Under", getattr(odds, "under_price", None), getattr(odds, "total_line", None)),
        ]
        for market_type, side, participant, price, line in rows:
            markets.append(
                GameMarket(
                    game_key=game_key,
                    provider=source,
                    provider_event_id=event_id,
                    sportsbook=source,
                    market_type=market_type,
                    participant=participant,
                    team=participant if side in {MarketSide.AWAY, MarketSide.HOME} else "",
                    side=side,
                    price=price,
                    line=line,
                    timestamp=fetched_at,
                    coverage_status=MarketCoverageStatus.FULL if price is not None else MarketCoverageStatus.UNPRICED,
                    backed_status=MarketBackedStatus.DISPLAY_ONLY,
                    source_confidence="provider",
                    raw_provider_metadata={"legacy_source": odds.__class__.__name__},
                )
            )
    return markets


def player_prop_market_from_legacy_line(game_key: str, line: Any) -> PlayerPropMarket:
    """Bridge a ``PropMarketLine``-like object into a normalized prop market."""
    return PlayerPropMarket(
        game_key=game_key,
        provider=str(getattr(line, "source", "") or ""),
        provider_event_id=str(getattr(line, "event_id", "") or ""),
        sportsbook=str(getattr(line, "source", "") or ""),
        market_type=_normalize_market_type(getattr(line, "market_key", "")),
        player_name=str(getattr(line, "player_name", "") or ""),
        player_id=getattr(line, "player_id", None),
        side=MarketSide.OVER,
        line=getattr(line, "point", None),
        price=getattr(line, "over_price", None),
        timestamp=str(getattr(line, "last_update", "") or "") or None,
        coverage_status=(
            MarketCoverageStatus.FULL
            if getattr(line, "over_price", None) is not None
            else MarketCoverageStatus.UNPRICED
        ),
        backed_status=MarketBackedStatus.DISPLAY_ONLY,
        source_confidence="provider",
        raw_provider_metadata={"legacy_source": line.__class__.__name__},
    )


def _normalize_market_type(value: object) -> MarketType | str:
    raw = str(value or "").strip().lower()
    aliases = {
        "h2h": MarketType.MONEYLINE,
        "moneyline": MarketType.MONEYLINE,
        "spreads": MarketType.SPREAD,
        "spread": MarketType.SPREAD,
        "totals": MarketType.TOTAL,
        "total": MarketType.TOTAL,
        "batter_home_runs": MarketType.BATTER_HOME_RUNS,
        "batter_total_bases": MarketType.BATTER_TOTAL_BASES,
    }
    return aliases.get(raw, raw or MarketType.UNKNOWN)


def _side_from_participant(participant: str, away: str, home: str) -> MarketSide:
    normalized = participant.strip().lower()
    if normalized and normalized == away.strip().lower():
        return MarketSide.AWAY
    if normalized and normalized == home.strip().lower():
        return MarketSide.HOME
    return MarketSide.PARTICIPANT
