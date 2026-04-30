"""Offline manual market CSV provider using normalized market schema."""
from __future__ import annotations

import csv
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from black_sheep_mlb.markets.schema import (
    MANUAL_MARKET_CSV_COLUMNS,
    GameMarket,
    MarketBackedStatus,
    MarketCoverageStatus,
    MarketFreshness,
    MarketSide,
    MarketSnapshot,
    MarketType,
    PlayerPropMarket,
    ProviderEventRef,
)
from black_sheep_mlb.markets.status import classify_manual_market


class ManualMarketCSVProvider:
    """Read game odds and player props from an offline CSV snapshot."""

    provider_name = "manual_csv"
    csv_columns = MANUAL_MARKET_CSV_COLUMNS

    def __init__(
        self,
        csv_path: str | Path = "data/manual/market_snapshot.csv",
        *,
        stale_minutes: int | None = 240,
        now_utc: datetime | None = None,
    ):
        self.csv_path = Path(csv_path)
        self.stale_minutes = stale_minutes
        self.now_utc = now_utc

    def get_game_markets(self, date: str, game_keys: list[str] | None = None) -> list[GameMarket]:
        allowed_games = set(game_keys or [])
        out: list[GameMarket] = []
        for row in self._rows_for_date(date):
            game_key = str(row.get("game_key") or "").strip().upper()
            if allowed_games and game_key not in allowed_games:
                continue
            market_type = normalize_market_type(row.get("market_type"))
            if market_type not in {MarketType.MONEYLINE, MarketType.SPREAD, MarketType.TOTAL}:
                continue
            out.append(self._game_market_from_row(row, game_key, market_type))
        return out

    def get_player_prop_markets(
        self,
        date: str,
        game_keys: list[str] | None = None,
        markets: list[str] | None = None,
    ) -> list[PlayerPropMarket]:
        allowed_games = set(game_keys or [])
        allowed_markets = {normalize_market_type(market) for market in (markets or [])}
        out: list[PlayerPropMarket] = []
        for row in self._rows_for_date(date):
            game_key = str(row.get("game_key") or "").strip().upper()
            if allowed_games and game_key not in allowed_games:
                continue
            market_type = normalize_market_type(row.get("market_type"))
            if market_type not in {MarketType.BATTER_HOME_RUNS, MarketType.BATTER_TOTAL_BASES}:
                continue
            if allowed_markets and market_type not in allowed_markets:
                continue
            out.append(self._player_prop_market_from_row(row, game_key, market_type))
        return out

    def get_market_snapshot(
        self,
        date: str,
        game_keys: list[str] | None = None,
        markets: list[str] | None = None,
    ) -> MarketSnapshot:
        game_markets = self.get_game_markets(date, game_keys=game_keys)
        prop_markets = self.get_player_prop_markets(date, game_keys=game_keys, markets=markets)
        event_refs = {
            (market.provider, str(market.provider_event_id or ""), market.game_key)
            for market in [*game_markets, *prop_markets]
            if market.provider_event_id
        }
        return MarketSnapshot(
            report_date=date,
            provider_events=[
                ProviderEventRef(provider=provider, provider_event_id=event_id, game_key=game_key)
                for provider, event_id, game_key in sorted(event_refs)
            ],
            game_markets=game_markets,
            player_prop_markets=prop_markets,
            generated_at=(self.now_utc or datetime.now(timezone.utc)).isoformat(),
            diagnostics=[] if self.csv_path.is_file() else [
                {
                    "code": "manual_market_csv_missing",
                    "message": f"manual market CSV not found: {self.csv_path}",
                    "severity": "warning",
                }
            ],
            raw_provider_metadata={
                "provider": self.provider_name,
                "csv_path": str(self.csv_path),
                "market_count": len(game_markets) + len(prop_markets),
            },
        )

    def _rows_for_date(self, date: str) -> list[dict[str, str]]:
        if not self.csv_path.is_file():
            return []
        rows: list[dict[str, str]] = []
        with self.csv_path.open(newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                if str(row.get("date") or "").strip() == date:
                    rows.append({str(key): str(value or "") for key, value in row.items()})
        return rows

    def _game_market_from_row(
        self,
        row: dict[str, str],
        game_key: str,
        market_type: MarketType,
    ) -> GameMarket:
        price = parse_number(row.get("price"))
        stale = self._is_stale(row.get("timestamp"))
        freshness = MarketFreshness.STALE if stale else MarketFreshness.FRESH
        coverage = _coverage_for_manual_price(price, stale=stale)
        backed = classify_manual_market(price is not None, stale=stale)
        return GameMarket(
            game_key=game_key,
            provider=str(row.get("provider") or self.provider_name),
            provider_event_id=str(row.get("provider_event_id") or f"manual:{row.get('date')}:{game_key}"),
            sportsbook=str(row.get("sportsbook") or "manual"),
            market_type=market_type,
            participant=str(row.get("participant") or row.get("team") or ""),
            team=str(row.get("team") or row.get("participant") or ""),
            side=normalize_market_side(row.get("side")),
            line=parse_number(row.get("line")),
            price=price,
            timestamp=str(row.get("timestamp") or "") or None,
            freshness=freshness,
            coverage_status=coverage,
            backed_status=backed,
            source_confidence=str(row.get("source_confidence") or "manual"),
            raw_provider_metadata=_raw_row(row),
        )

    def _player_prop_market_from_row(
        self,
        row: dict[str, str],
        game_key: str,
        market_type: MarketType,
    ) -> PlayerPropMarket:
        price = parse_number(row.get("price"))
        stale = self._is_stale(row.get("timestamp"))
        freshness = MarketFreshness.STALE if stale else MarketFreshness.FRESH
        coverage = _coverage_for_manual_price(price, stale=stale)
        backed = classify_manual_market(price is not None, stale=stale)
        return PlayerPropMarket(
            game_key=game_key,
            provider=str(row.get("provider") or self.provider_name),
            provider_event_id=str(row.get("provider_event_id") or f"manual:{row.get('date')}:{game_key}"),
            sportsbook=str(row.get("sportsbook") or "manual"),
            market_type=market_type,
            player_name=str(row.get("player_name") or row.get("participant") or ""),
            player_id=str(row.get("player_id") or "") or None,
            team=str(row.get("team") or ""),
            side=normalize_market_side(row.get("side")),
            line=parse_number(row.get("line")),
            price=price,
            timestamp=str(row.get("timestamp") or "") or None,
            freshness=freshness,
            coverage_status=coverage,
            backed_status=backed,
            source_confidence=str(row.get("source_confidence") or "manual"),
            raw_provider_metadata=_raw_row(row),
        )

    def _is_stale(self, timestamp: object) -> bool:
        if self.stale_minutes is None:
            return False
        parsed = parse_datetime(timestamp)
        if parsed is None:
            return False
        now = self.now_utc or datetime.now(timezone.utc)
        return (now - parsed).total_seconds() / 60 > self.stale_minutes


def normalize_market_type(value: object) -> MarketType:
    raw = str(value or "").strip().lower().replace("-", "_").replace(" ", "_")
    aliases = {
        "h2h": MarketType.MONEYLINE,
        "ml": MarketType.MONEYLINE,
        "moneyline": MarketType.MONEYLINE,
        "runline": MarketType.SPREAD,
        "run_line": MarketType.SPREAD,
        "spread": MarketType.SPREAD,
        "spreads": MarketType.SPREAD,
        "total": MarketType.TOTAL,
        "totals": MarketType.TOTAL,
        "over_under": MarketType.TOTAL,
        "hr": MarketType.BATTER_HOME_RUNS,
        "home_run": MarketType.BATTER_HOME_RUNS,
        "home_runs": MarketType.BATTER_HOME_RUNS,
        "batter_home_runs": MarketType.BATTER_HOME_RUNS,
        "2tb": MarketType.BATTER_TOTAL_BASES,
        "2_tb": MarketType.BATTER_TOTAL_BASES,
        "2+tb": MarketType.BATTER_TOTAL_BASES,
        "2+_tb": MarketType.BATTER_TOTAL_BASES,
        "total_bases": MarketType.BATTER_TOTAL_BASES,
        "batter_total_bases": MarketType.BATTER_TOTAL_BASES,
    }
    return aliases.get(raw, MarketType.UNKNOWN)


def normalize_market_side(value: object) -> MarketSide:
    raw = str(value or "").strip().lower()
    aliases = {
        "away": MarketSide.AWAY,
        "home": MarketSide.HOME,
        "over": MarketSide.OVER,
        "under": MarketSide.UNDER,
        "yes": MarketSide.YES,
        "no": MarketSide.NO,
        "participant": MarketSide.PARTICIPANT,
    }
    return aliases.get(raw, MarketSide.UNKNOWN)


def parse_number(value: object) -> int | float | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        number = float(raw)
    except ValueError:
        return None
    return int(number) if number.is_integer() else number


def parse_datetime(value: object) -> datetime | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    if raw.endswith("Z"):
        raw = raw[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(raw)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _coverage_for_manual_price(price: int | float | None, *, stale: bool) -> MarketCoverageStatus:
    if stale:
        return MarketCoverageStatus.STALE
    if price is None:
        return MarketCoverageStatus.UNPRICED
    return MarketCoverageStatus.MANUAL_ONLY


def _raw_row(row: dict[str, str]) -> dict[str, Any]:
    return {key: row.get(key, "") for key in MANUAL_MARKET_CSV_COLUMNS if key in row}
