"""SportsGameOdds market provider scaffold.

This adapter is intentionally fixture/offline first. It normalizes supplied
SportsGameOdds-like payloads into the provider-agnostic market schema, but it
does not perform live HTTP requests by default and is not wired into strict
compute.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from black_sheep_mlb.data_sources.manual_market_provider import (
    normalize_market_side,
    normalize_market_type,
    parse_datetime,
    parse_number,
)
from black_sheep_mlb.markets.health import (
    ProviderAvailability,
    ProviderDiagnostic,
    ProviderHealth,
    ProviderIssueCode,
)
from black_sheep_mlb.markets.schema import (
    GameMarket,
    MarketCoverageStatus,
    MarketFreshness,
    MarketSide,
    MarketSnapshot,
    MarketType,
    PlayerPropMarket,
    ProviderEventRef,
)
from black_sheep_mlb.markets.status import classify_coverage, classify_market_backing


SUPPORTED_GAME_MARKETS = {MarketType.MONEYLINE, MarketType.SPREAD, MarketType.TOTAL}
SUPPORTED_PROP_MARKETS = {MarketType.BATTER_HOME_RUNS, MarketType.BATTER_TOTAL_BASES}


class SportsGameOddsProvider:
    """Normalize SportsGameOdds payloads without making live calls by default."""

    provider_name = "sportsgameodds"

    def __init__(
        self,
        api_key: str | None = None,
        *,
        base_url: str = "https://api.sportsgameodds.com",
        enable_live: bool = False,
        stale_minutes: int | None = 45,
        now_utc: datetime | None = None,
    ):
        self.api_key = api_key if api_key is not None else os.environ.get("SPORTSGAMEODDS_API_KEY")
        self.base_url = base_url.rstrip("/")
        self.enable_live = enable_live
        self.stale_minutes = stale_minutes
        self.now_utc = now_utc

    def get_game_markets(self, date: str, game_keys: list[str] | None = None) -> list[GameMarket]:
        """Provider-registry contract.

        Live fetches are disabled for this scaffold. Future live integration
        should add an explicit fetch path and tests that keep default behavior
        non-networked.
        """
        if not self.enable_live:
            return []
        raise NotImplementedError("SportsGameOdds live fetch is not implemented")

    def get_player_prop_markets(
        self,
        date: str,
        game_keys: list[str] | None = None,
        markets: list[str] | None = None,
    ) -> list[PlayerPropMarket]:
        if not self.enable_live:
            return []
        raise NotImplementedError("SportsGameOdds live fetch is not implemented")

    def get_market_snapshot_from_payloads(
        self,
        date: str,
        *,
        game_payload: dict[str, Any] | list[Any] | None = None,
        props_payload: dict[str, Any] | list[Any] | None = None,
        game_keys: list[str] | None = None,
        markets: list[str] | None = None,
    ) -> MarketSnapshot:
        game_markets, game_diagnostics = self.parse_game_odds_payload(
            game_payload or {},
            game_keys=game_keys,
        )
        prop_markets, prop_diagnostics = self.parse_player_props_payload(
            props_payload or {},
            game_keys=game_keys,
            markets=markets,
        )
        provider_events = _event_refs([*game_markets, *prop_markets])
        return MarketSnapshot(
            report_date=date,
            provider_events=provider_events,
            game_markets=game_markets,
            player_prop_markets=prop_markets,
            generated_at=(self.now_utc or datetime.now(timezone.utc)).isoformat(),
            diagnostics=[_diagnostic_to_dict(item) for item in [*game_diagnostics, *prop_diagnostics]],
            raw_provider_metadata={
                "provider": self.provider_name,
                "mode": "fixture",
                "live_enabled": self.enable_live,
                "game_market_count": len(game_markets),
                "player_prop_market_count": len(prop_markets),
            },
        )

    def parse_game_odds_payload(
        self,
        payload: dict[str, Any] | list[Any],
        *,
        game_keys: list[str] | None = None,
    ) -> tuple[list[GameMarket], list[ProviderDiagnostic]]:
        allowed_games = {_normalize_game_key(key) for key in (game_keys or [])}
        diagnostics: list[ProviderDiagnostic] = []
        markets: list[GameMarket] = []
        for event in _items(payload):
            if not isinstance(event, dict):
                continue
            game_key = _event_game_key(event)
            if allowed_games and game_key not in allowed_games:
                continue
            event_id = _event_id(event)
            away = _text(event, "away_team", "awayTeam", "away", "away_abbr", "awayAbbr")
            home = _text(event, "home_team", "homeTeam", "home", "home_abbr", "homeAbbr")
            for book in _bookmakers(event):
                sportsbook = _sportsbook(book)
                for market in _markets(book):
                    freshness = self._freshness(_timestamp(market, book, event))
                    market_type = normalize_market_type(_text(market, "market_type", "market", "type", "key", "name"))
                    if market_type not in SUPPORTED_GAME_MARKETS:
                        diagnostics.append(_unsupported_market_diagnostic(market_type, event_id, game_key))
                        continue
                    outcomes = _outcomes(market)
                    coverage = _coverage_for_market(
                        expected_count=2,
                        outcomes=outcomes,
                        freshness=freshness,
                    )
                    for outcome in outcomes:
                        side = _game_side(outcome, away=away, home=home)
                        price = _price(outcome)
                        row_coverage = coverage if price is not None else MarketCoverageStatus.UNPRICED
                        markets.append(
                            GameMarket(
                                game_key=game_key,
                                provider=self.provider_name,
                                provider_event_id=event_id,
                                sportsbook=sportsbook,
                                market_type=market_type,
                                participant=_participant(outcome, side=side, away=away, home=home),
                                team=_team(outcome, side=side, away=away, home=home),
                                side=side,
                                line=_line(outcome),
                                price=price,
                                timestamp=_timestamp(outcome, market, book, event),
                                freshness=freshness,
                                coverage_status=row_coverage,
                                backed_status=classify_market_backing(
                                    coverage_status=row_coverage,
                                    freshness=freshness,
                                    has_price=price is not None,
                                ),
                                source_confidence="provider_fixture",
                                raw_provider_metadata={
                                    "provider_event_id": event_id,
                                    "sportsbook": sportsbook,
                                    "source": "sportsgameodds_fixture",
                                    "raw_market": _text(market, "market_type", "market", "type", "key", "name"),
                                },
                            )
                        )
        return markets, diagnostics

    def parse_player_props_payload(
        self,
        payload: dict[str, Any] | list[Any],
        *,
        game_keys: list[str] | None = None,
        markets: list[str] | None = None,
    ) -> tuple[list[PlayerPropMarket], list[ProviderDiagnostic]]:
        allowed_games = {_normalize_game_key(key) for key in (game_keys or [])}
        allowed_markets = {normalize_market_type(market) for market in (markets or [])}
        diagnostics: list[ProviderDiagnostic] = []
        out: list[PlayerPropMarket] = []
        for event in _items(payload):
            if not isinstance(event, dict):
                continue
            game_key = _event_game_key(event)
            if allowed_games and game_key not in allowed_games:
                continue
            event_id = _event_id(event)
            for book in _bookmakers(event):
                sportsbook = _sportsbook(book)
                for market in _markets(book):
                    market_type = normalize_market_type(_text(market, "market_type", "market", "type", "key", "name"))
                    if allowed_markets and market_type not in allowed_markets:
                        continue
                    if market_type not in SUPPORTED_PROP_MARKETS:
                        diagnostics.append(_unsupported_market_diagnostic(market_type, event_id, game_key))
                        continue
                    outcomes = _outcomes(market)
                    freshness = self._freshness(_timestamp(market, book, event))
                    coverage = _coverage_for_market(
                        expected_count=max(1, len(outcomes)),
                        outcomes=outcomes,
                        freshness=freshness,
                    )
                    for outcome in outcomes:
                        price = _price(outcome)
                        player_name = _player_name(outcome)
                        provider_player_id = _player_id(outcome)
                        mapping_failed = not player_name
                        row_coverage = coverage
                        if mapping_failed:
                            row_coverage = MarketCoverageStatus.DATA_BLOCKED
                            diagnostics.append(
                                ProviderDiagnostic(
                                    code=ProviderIssueCode.MAPPING_FAILURE,
                                    message="SportsGameOdds player mapping missing player name",
                                    severity="warning",
                                    context={
                                        "provider_event_id": event_id,
                                        "provider_player_id": provider_player_id,
                                        "game_key": game_key,
                                    },
                                )
                            )
                        elif price is None:
                            row_coverage = MarketCoverageStatus.UNPRICED
                        out.append(
                            PlayerPropMarket(
                                game_key=game_key,
                                provider=self.provider_name,
                                provider_event_id=event_id,
                                sportsbook=sportsbook,
                                market_type=market_type,
                                player_name=player_name,
                                player_id=provider_player_id,
                                team=_player_team(outcome),
                                side=_prop_side(outcome),
                                line=_line(outcome),
                                price=price,
                                timestamp=_timestamp(outcome, market, book, event),
                                freshness=freshness,
                                coverage_status=row_coverage,
                                backed_status=classify_market_backing(
                                    coverage_status=row_coverage,
                                    freshness=freshness,
                                    has_price=price is not None,
                                ),
                                source_confidence="provider_fixture",
                                raw_provider_metadata={
                                    "provider_event_id": event_id,
                                    "provider_player_id": provider_player_id,
                                    "player_id_namespace": "sportsgameodds",
                                    "mapping_status": "mapping_failed" if mapping_failed else "provider_only",
                                    "sportsbook": sportsbook,
                                    "source": "sportsgameodds_fixture",
                                    "raw_market": _text(market, "market_type", "market", "type", "key", "name"),
                                },
                            )
                        )
        return out, diagnostics

    def health_from_payload(self, payload: dict[str, Any]) -> ProviderHealth:
        status = int(parse_number(payload.get("status") or payload.get("status_code")) or 200)
        error = payload.get("error") if isinstance(payload.get("error"), dict) else {}
        code = str(error.get("code") or payload.get("code") or "").strip().lower()
        message = str(error.get("message") or payload.get("message") or "")
        checked_at = str(payload.get("checked_at") or payload.get("checkedAt") or "") or None

        if status in {401, 403} or code in {"auth", "unauthorized", "authentication_failure", "invalid_api_key"}:
            return _health_unavailable(
                checked_at=checked_at,
                issue_code=ProviderIssueCode.AUTHENTICATION_FAILURE,
                message=message or "SportsGameOdds authentication failed",
            )
        if status == 429 or code in {"quota", "quota_exhausted", "rate_limited", "too_many_requests"}:
            issue_code = (
                ProviderIssueCode.RATE_LIMITED
                if status == 429 or code == "rate_limited"
                else ProviderIssueCode.QUOTA_EXHAUSTED
            )
            return _health_unavailable(
                checked_at=checked_at,
                issue_code=issue_code,
                message=message or "SportsGameOdds quota or rate limit reached",
            )
        if status == 422 or code in {"unsupported_market", "market_not_supported"}:
            return ProviderHealth(
                provider=self.provider_name,
                availability=ProviderAvailability.DEGRADED,
                checked_at=checked_at,
                diagnostics=[
                    ProviderDiagnostic(
                        code=ProviderIssueCode.UNSUPPORTED_MARKET,
                        message=message or "SportsGameOdds market is not supported",
                        severity="warning",
                    )
                ],
                raw_provider_metadata={"status": status, "code": code},
            )
        if code == "partial_coverage" or payload.get("partial_coverage") is True:
            return ProviderHealth(
                provider=self.provider_name,
                availability=ProviderAvailability.DEGRADED,
                checked_at=checked_at,
                diagnostics=[
                    ProviderDiagnostic(
                        code=ProviderIssueCode.PARTIAL_COVERAGE,
                        message=message or "SportsGameOdds returned partial coverage",
                        severity="warning",
                    )
                ],
                raw_provider_metadata={"status": status, "code": code},
            )
        if status >= 500:
            return _health_unavailable(
                checked_at=checked_at,
                issue_code=ProviderIssueCode.PROVIDER_ERROR,
                message=message or f"SportsGameOdds provider error HTTP {status}",
            )
        return ProviderHealth.available_result(self.provider_name, checked_at=checked_at)

    def _freshness(self, timestamp: object) -> MarketFreshness:
        if self.stale_minutes is None:
            return MarketFreshness.FRESH
        parsed = parse_datetime(timestamp)
        if parsed is None:
            return MarketFreshness.UNKNOWN
        now = self.now_utc or datetime.now(timezone.utc)
        if (now - parsed).total_seconds() / 60 > self.stale_minutes:
            return MarketFreshness.STALE
        return MarketFreshness.FRESH


def _items(payload: dict[str, Any] | list[Any]) -> list[Any]:
    if isinstance(payload, list):
        return payload
    for key in ("data", "events", "games", "odds", "markets"):
        value = payload.get(key)
        if isinstance(value, list):
            return value
    return [payload] if payload else []


def _bookmakers(event: dict[str, Any]) -> list[dict[str, Any]]:
    books = event.get("sportsbooks") or event.get("bookmakers") or event.get("books")
    if isinstance(books, list):
        return [book for book in books if isinstance(book, dict)]
    return [event]


def _markets(book: dict[str, Any]) -> list[dict[str, Any]]:
    markets = book.get("markets") or book.get("odds") or book.get("props")
    if isinstance(markets, list):
        return [market for market in markets if isinstance(market, dict)]
    if any(key in book for key in ("market", "market_type", "type", "key", "outcomes")):
        return [book]
    return []


def _outcomes(market: dict[str, Any]) -> list[dict[str, Any]]:
    outcomes = market.get("outcomes") or market.get("lines") or market.get("prices")
    if isinstance(outcomes, list):
        return [outcome for outcome in outcomes if isinstance(outcome, dict)]
    if "price" in market or "odds" in market:
        return [market]
    return []


def _event_refs(markets: list[GameMarket | PlayerPropMarket]) -> list[ProviderEventRef]:
    refs = {
        (market.provider, str(market.provider_event_id or ""), market.game_key)
        for market in markets
        if market.provider_event_id
    }
    return [
        ProviderEventRef(provider=provider, provider_event_id=event_id, game_key=game_key)
        for provider, event_id, game_key in sorted(refs)
    ]


def _event_game_key(event: dict[str, Any]) -> str:
    explicit = _text(event, "game_key", "gameKey", "event_key", "eventKey")
    if explicit:
        return _normalize_game_key(explicit)
    away = _text(event, "away_team", "awayTeam", "away", "away_abbr", "awayAbbr")
    home = _text(event, "home_team", "homeTeam", "home", "home_abbr", "homeAbbr")
    return _normalize_game_key(f"{away}@{home}" if away and home else "")


def _normalize_game_key(value: object) -> str:
    return str(value or "").strip().upper()


def _event_id(event: dict[str, Any]) -> str:
    return _text(event, "provider_event_id", "eventID", "eventId", "event_id", "id")


def _sportsbook(book: dict[str, Any]) -> str:
    return _text(book, "sportsbook", "bookmaker", "book", "bookKey", "book_key", "key", "name") or "unknown"


def _timestamp(*rows: dict[str, Any]) -> str | None:
    for row in rows:
        value = row.get("lastUpdated") or row.get("last_update") or row.get("timestamp") or row.get("updatedAt")
        if value:
            return str(value)
    return None


def _coverage_for_market(
    *,
    expected_count: int,
    outcomes: list[dict[str, Any]],
    freshness: MarketFreshness,
) -> MarketCoverageStatus:
    if freshness == MarketFreshness.STALE:
        return MarketCoverageStatus.STALE
    explicit = next(
        (
            str(outcome.get("coverage_status") or outcome.get("coverageStatus") or "").strip().lower()
            for outcome in outcomes
            if outcome.get("coverage_status") or outcome.get("coverageStatus")
        ),
        "",
    )
    if explicit == MarketCoverageStatus.PARTIAL.value:
        return MarketCoverageStatus.PARTIAL
    priced = [outcome for outcome in outcomes if _price(outcome) is not None]
    sides = [_side_value(outcome) for outcome in outcomes]
    return classify_coverage(expected_count=expected_count, priced_count=len(priced), sides_present=sides)


def _game_side(outcome: dict[str, Any], *, away: str, home: str) -> MarketSide:
    side = normalize_market_side(_side_value(outcome))
    if side != MarketSide.UNKNOWN:
        return side
    participant = _text(outcome, "participant", "name", "team", "label")
    if participant.strip().lower() == away.strip().lower():
        return MarketSide.AWAY
    if participant.strip().lower() == home.strip().lower():
        return MarketSide.HOME
    return MarketSide.PARTICIPANT


def _prop_side(outcome: dict[str, Any]) -> MarketSide:
    side = normalize_market_side(_side_value(outcome))
    return side if side != MarketSide.UNKNOWN else MarketSide.OVER


def _side_value(outcome: dict[str, Any]) -> str:
    return _text(outcome, "side", "bet_side", "betSide", "selection", "label")


def _participant(outcome: dict[str, Any], *, side: MarketSide, away: str, home: str) -> str:
    explicit = _text(outcome, "participant", "name", "team", "label")
    if explicit:
        return explicit
    if side == MarketSide.AWAY:
        return away
    if side == MarketSide.HOME:
        return home
    if side in {MarketSide.OVER, MarketSide.UNDER}:
        return side.value.title()
    return ""


def _team(outcome: dict[str, Any], *, side: MarketSide, away: str, home: str) -> str:
    explicit = _text(outcome, "team", "team_abbr", "teamAbbr")
    if explicit:
        return explicit
    if side == MarketSide.AWAY:
        return away
    if side == MarketSide.HOME:
        return home
    return ""


def _player_name(outcome: dict[str, Any]) -> str:
    player = outcome.get("player") if isinstance(outcome.get("player"), dict) else {}
    return _text(outcome, "player_name", "playerName", "participant", "name") or _text(player, "name", "fullName")


def _player_id(outcome: dict[str, Any]) -> str | None:
    player = outcome.get("player") if isinstance(outcome.get("player"), dict) else {}
    value = _text(outcome, "provider_player_id", "player_id", "playerId") or _text(player, "id", "playerID", "playerId")
    return value or None


def _player_team(outcome: dict[str, Any]) -> str:
    player = outcome.get("player") if isinstance(outcome.get("player"), dict) else {}
    return _text(outcome, "team", "team_abbr", "teamAbbr") or _text(player, "team", "teamAbbr")


def _price(outcome: dict[str, Any]) -> int | float | None:
    return parse_number(outcome.get("price") if "price" in outcome else outcome.get("odds"))


def _line(outcome: dict[str, Any]) -> int | float | None:
    return parse_number(outcome.get("line") if "line" in outcome else outcome.get("point"))


def _text(row: dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = row.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def _unsupported_market_diagnostic(
    market_type: MarketType | str,
    event_id: str,
    game_key: str,
) -> ProviderDiagnostic:
    return ProviderDiagnostic(
        code=ProviderIssueCode.UNSUPPORTED_MARKET,
        message=f"SportsGameOdds unsupported market: {market_type}",
        severity="warning",
        context={"provider_event_id": event_id, "game_key": game_key, "market_type": str(market_type)},
    )


def _health_unavailable(
    *,
    checked_at: str | None,
    issue_code: ProviderIssueCode,
    message: str,
) -> ProviderHealth:
    return ProviderHealth(
        provider=SportsGameOddsProvider.provider_name,
        availability=ProviderAvailability.UNAVAILABLE,
        checked_at=checked_at,
        diagnostics=[
            ProviderDiagnostic(
                code=issue_code,
                message=message,
                severity="error",
            )
        ],
    )


def _diagnostic_to_dict(diagnostic: ProviderDiagnostic) -> dict[str, Any]:
    code = diagnostic.code.value if isinstance(diagnostic.code, ProviderIssueCode) else str(diagnostic.code)
    return {
        "code": code,
        "message": diagnostic.message,
        "severity": diagnostic.severity,
        "context": dict(diagnostic.context),
    }
