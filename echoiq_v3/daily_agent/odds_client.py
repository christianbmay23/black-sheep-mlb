"""Optional odds enrichment for EchoIQ Night Shift v3."""

from __future__ import annotations

import os
import csv
from datetime import datetime, timezone
from pathlib import Path

from black_sheep_mlb.data_sources.cached_odds_provider import CachedOddsProvider
from black_sheep_mlb.data_sources.the_odds_api_provider import TheOddsAPIProvider
from black_sheep_mlb.markets.schema import GameMarket, game_markets_from_legacy_game_odds

from .data_sources import NightShiftDataSources
from .id_mapping import game_key, map_game, normalize_game_key, normalize_player_name, normalize_team_code
from .schemas import MarketSnapshotRow, SlateGame, SourceResult


ODDS_SOURCE = "Odds/Props API"
GAME_MARKETS = ["h2h", "spreads", "totals"]
MARKET_NOTE_NO_FAIR_PROB = "Market available; no fair-probability edge calculated in v3."


def implied_probability_from_american(odds: int | float | str | None) -> float | None:
    if odds in (None, ""):
        return None
    try:
        value = float(odds)
    except (TypeError, ValueError):
        return None
    if value == 0 or -100 < value < 100:
        return None
    if value < 0:
        return round(abs(value) / (abs(value) + 100), 6)
    return round(100 / (value + 100), 6)


def fetch_odds_enrichment(
    *,
    slate_date: str,
    slate_games: list[SlateGame],
    data_sources: NightShiftDataSources,
    api_key_present: bool,
    repo_root: Path,
    force_refresh: bool = False,
) -> list[MarketSnapshotRow]:
    retrieved_at = data_sources.tracker.now()
    manual_rows = _manual_market_rows(
        slate_date=slate_date,
        slate_games=slate_games,
        repo_root=repo_root,
        retrieved_at=retrieved_at,
    )
    if manual_rows:
        data_sources.tracker.record_result(
            SourceResult(
                source_name=ODDS_SOURCE,
                endpoint=_manual_market_csv_path(repo_root),
                success=True,
                retrieved_at=retrieved_at,
                record_count=len(manual_rows),
                notes="MANUAL_MARKET_ROWS_AVAILABLE: configured/manual market rows loaded for research-only gates.",
            )
        )

    if data_sources.offline:
        if not manual_rows:
            _record_gap(
                data_sources,
                classification="ODDS_EMPTY_FOR_SLATE",
                notes="ODDS_EMPTY_FOR_SLATE: offline mode enabled; live odds/player props skipped and no manual market CSV rows were loaded.",
                recommended_fix="Rerun without --offline when market enrichment is intended or provide ECHOIQ_MARKET_CSV.",
            )
        return manual_rows
    live_rows: list[MarketSnapshotRow] = []
    if not api_key_present:
        _record_gap(
            data_sources,
            classification="ODDS_KEY_MISSING",
            notes="ODDS_KEY_MISSING: no ODDS_API_KEY or THE_ODDS_API_KEY in this process.",
            recommended_fix="Set ODDS_API_KEY or THE_ODDS_API_KEY before running live market enrichment, or provide ECHOIQ_MARKET_CSV for manual research-only rows.",
        )
        return manual_rows

    provider = TheOddsAPIProvider(api_key=os.getenv("ODDS_API_KEY") or os.getenv("THE_ODDS_API_KEY"))
    wrapped = provider
    if not force_refresh:
        wrapped = CachedOddsProvider(
            provider,
            cache_db_path=repo_root / "data" / "cache" / "night_shift" / "odds_cache.sqlite",
            stale_minutes=20,
        )
    endpoint = "TheOddsAPIProvider.get_game_odds(baseball_mlb:h2h,spreads,totals)"
    try:
        game_odds = wrapped.get_game_odds(slate_date, GAME_MARKETS)
    except Exception as exc:  # noqa: BLE001
        data_sources.tracker.record_result(
            SourceResult(
                source_name=ODDS_SOURCE,
                endpoint=endpoint,
                success=False,
                retrieved_at=retrieved_at,
                notes="ODDS_QUERY_EXCEPTION: existing repo odds adapter raised.",
                error_summary=str(exc),
            )
        )
        data_sources.tracker.record_gap(
            missing_source="ODDS_QUERY_EXCEPTION",
            affected_artifact="02_next_slate_research/market_snapshot.csv, 03_watchlists",
            severity="HIGH",
            recommended_fix="Check odds provider entitlement, network status, and request shape.",
            output_degraded=True,
        )
        return manual_rows

    live_rows = _rows_from_game_odds(slate_date, slate_games, game_odds, retrieved_at)
    combined = [*manual_rows, *live_rows]
    if combined:
        if any(row.player_name for row in combined):
            data_sources.tracker.record_result(
                SourceResult(
                    source_name=ODDS_SOURCE,
                    endpoint="configured player prop rows",
                    success=True,
                    retrieved_at=data_sources.tracker.now(),
                    record_count=sum(1 for row in combined if row.player_name),
                    notes="PLAYER_PROPS_AVAILABLE: player prop market rows loaded for availability gates.",
                )
            )
        else:
            data_sources.tracker.record_result(
                SourceResult(
                    source_name=ODDS_SOURCE,
                    endpoint="configured player prop rows",
                    success=False,
                    retrieved_at=data_sources.tracker.now(),
                    notes="PLAYER_PROPS_UNAVAILABLE: no configured player prop rows were returned by the active source set.",
                    error_summary="PLAYER_PROPS_UNAVAILABLE",
                )
            )
        data_sources.tracker.record_result(
            SourceResult(
                source_name=ODDS_SOURCE,
                endpoint=endpoint,
                success=True,
                retrieved_at=retrieved_at,
                record_count=len(combined),
                notes="ODDS_AVAILABLE: market rows normalized for research context.",
                payload={"market_snapshot_rows": len(combined), "manual_rows": len(manual_rows), "live_rows": len(live_rows)},
            )
        )
        return combined

    classification = "ODDS_EMPTY_FOR_SLATE"
    error_summary = getattr(provider, "last_error", "") or classification
    data_sources.tracker.record_result(
        SourceResult(
            source_name=ODDS_SOURCE,
            endpoint=endpoint,
            success=False,
            retrieved_at=retrieved_at,
            record_count=0,
            notes=f"{classification}: no game market rows returned for slate.",
            error_summary=error_summary,
        )
    )
    data_sources.tracker.record_gap(
        missing_source=classification,
        affected_artifact="02_next_slate_research/market_snapshot.csv, 03_watchlists",
        severity="HIGH",
        recommended_fix="Verify the odds API key, coverage window, provider credits, and slate date.",
        output_degraded=True,
    )
    return manual_rows


def diagnose_markets(
    *,
    slate_date: str,
    odds_key_present: bool,
    sportsradar_enabled: bool,
    sportsradar_key_present: bool,
) -> dict[str, object]:
    return {
        "slate_date": slate_date,
        "odds_key_present": odds_key_present,
        "sportsradar_key_present": sportsradar_key_present,
        "sportsradar_enabled": sportsradar_enabled,
        "game_market_provider": "TheOddsAPIProvider" if odds_key_present else "not_configured",
        "player_props_provider": "not_configured",
        "status_classifications": [
            "ODDS_AVAILABLE" if odds_key_present else "ODDS_KEY_MISSING",
            "SPORTSRADAR_AVAILABLE"
            if sportsradar_enabled and sportsradar_key_present
            else "SPORTSRADAR_KEY_MISSING"
            if not sportsradar_key_present
            else "SPORTSRADAR_DISABLED",
            "PLAYER_PROPS_EMPTY",
        ],
        "would_call_live_odds": bool(odds_key_present),
        "would_call_live_sportsradar": bool(sportsradar_enabled and sportsradar_key_present),
    }


def _record_gap(
    data_sources: NightShiftDataSources,
    *,
    classification: str,
    notes: str,
    recommended_fix: str,
) -> None:
    data_sources.tracker.record_result(
        SourceResult(
            source_name=ODDS_SOURCE,
            endpoint="not_called",
            success=False,
            retrieved_at=data_sources.tracker.now(),
            notes=notes,
            error_summary=classification,
        )
    )
    data_sources.tracker.record_gap(
        missing_source=classification,
        affected_artifact="02_next_slate_research/market_snapshot.csv, 03_watchlists",
        severity="HIGH",
        recommended_fix=recommended_fix,
        output_degraded=True,
    )


def _rows_from_game_odds(
    slate_date: str,
    slate_games: list[SlateGame],
    game_odds: object,
    retrieved_at: str,
) -> list[MarketSnapshotRow]:
    rows: list[MarketSnapshotRow] = []
    for odds in list(game_odds or []):
        for market in game_markets_from_legacy_game_odds(odds):
            game = _game_for_market(slate_games, market)
            rows.append(_row_from_market(slate_date, game, market, retrieved_at))
    return rows


def _manual_market_csv_path(repo_root: Path) -> str:
    return os.getenv("ECHOIQ_MARKET_CSV") or str(repo_root / "data" / "manual" / "market_snapshot.csv")


def _manual_market_rows(
    *,
    slate_date: str,
    slate_games: list[SlateGame],
    repo_root: Path,
    retrieved_at: str,
) -> list[MarketSnapshotRow]:
    path = Path(_manual_market_csv_path(repo_root))
    if not path.is_file():
        return []
    rows: list[MarketSnapshotRow] = []
    with path.open(newline="", encoding="utf-8") as handle:
        for raw in csv.DictReader(handle):
            if str(raw.get("date", "")).strip() != slate_date:
                continue
            mapped = map_game(slate_games, game_key_value=raw.get("game_key", ""))
            market_type = _manual_market_type(raw.get("market_type", ""))
            if market_type == "unknown":
                continue
            price = _parse_number(raw.get("price"))
            implied = implied_probability_from_american(price)
            timestamp = str(raw.get("timestamp") or "").strip()
            status = _market_status(price=price, implied=implied, last_updated=timestamp)
            rows.append(
                MarketSnapshotRow(
                    slate_date=slate_date,
                    game_id=mapped.game_id if mapped.matched else normalize_game_key(raw.get("game_key", "")),
                    away_team=mapped.away_team,
                    home_team=mapped.home_team,
                    market_type=market_type,
                    market=_manual_market_display(raw.get("market_type", ""), raw.get("side", "")),
                    player_name=str(raw.get("player_name") or raw.get("participant") or "") if _is_prop_market(market_type) else "",
                    team=normalize_team_code(raw.get("team", "")),
                    line=_parse_number(raw.get("line")),
                    price=price,
                    implied_probability=implied,
                    sportsbook=str(raw.get("sportsbook") or raw.get("provider") or "manual"),
                    status=status,
                    source=str(raw.get("provider") or "manual_csv"),
                    last_updated=timestamp,
                    retrieved_at=retrieved_at,
                )
            )
    return rows


def _row_from_market(
    slate_date: str,
    game: SlateGame | None,
    market: GameMarket,
    retrieved_at: str,
) -> MarketSnapshotRow:
    market_type = _value(market.market_type)
    market_name = _display_market(market_type, _value(market.side))
    price = market.price
    implied = implied_probability_from_american(price)
    status = _market_status(price=price, implied=implied, last_updated=market.timestamp)
    return MarketSnapshotRow(
        slate_date=slate_date,
        game_id=game.game_id if game is not None else market.game_key,
        away_team=game.away_team if game is not None else _away_from_key(market.game_key),
        home_team=game.home_team if game is not None else _home_from_key(market.game_key),
        market_type=market_type,
        market=market_name,
        player_name="",
        team=market.team,
        line=market.line,
        price=price,
        implied_probability=implied,
        sportsbook=market.sportsbook,
        status=status,
        source=market.provider or ODDS_SOURCE,
        last_updated=market.timestamp or retrieved_at,
        retrieved_at=retrieved_at,
    )


def _game_for_market(slate_games: list[SlateGame], market: GameMarket) -> SlateGame | None:
    mapped = map_game(slate_games, game_key_value=_game_key_from_market(market))
    if not mapped.matched:
        return None
    for game in slate_games:
        if game.game_id == mapped.game_id:
            return game
    return None


def _game_key_from_market(market: GameMarket) -> str:
    away, home = _away_from_key(market.game_key), _home_from_key(market.game_key)
    return game_key(away, home)


def _away_from_key(game_key: str) -> str:
    return str(game_key).split("@", 1)[0] if "@" in str(game_key) else ""


def _home_from_key(game_key: str) -> str:
    return str(game_key).split("@", 1)[1] if "@" in str(game_key) else ""


def _value(value: object) -> str:
    return str(getattr(value, "value", value) or "")


def _display_market(market_type: str, side: str) -> str:
    if market_type == "moneyline":
        return "moneyline"
    if market_type == "spread":
        return "run_line"
    if market_type == "total":
        return f"total_{side}" if side in {"over", "under"} else "total"
    if market_type in {"h2h_1st_5_innings", "first_five_moneyline"}:
        return "first_five_moneyline"
    if market_type in {"spreads_1st_5_innings", "first_five_spread"}:
        return "first_five_run_line"
    if market_type in {"totals_1st_5_innings", "first_five_total"}:
        return f"first_five_total_{side}" if side in {"over", "under"} else "first_five_total"
    return market_type or "unknown"


def _manual_market_type(value: object) -> str:
    raw = str(value or "").strip().lower().replace("-", "_").replace(" ", "_")
    aliases = {
        "h2h": "moneyline",
        "ml": "moneyline",
        "moneyline": "moneyline",
        "runline": "spread",
        "run_line": "spread",
        "spread": "spread",
        "spreads": "spread",
        "total": "total",
        "totals": "total",
        "first_five_moneyline": "first_five_moneyline",
        "h2h_1st_5_innings": "first_five_moneyline",
        "first_five_run_line": "first_five_spread",
        "spreads_1st_5_innings": "first_five_spread",
        "first_five_total": "first_five_total",
        "totals_1st_5_innings": "first_five_total",
        "hr": "player_home_run",
        "home_run": "player_home_run",
        "home_runs": "player_home_run",
        "batter_home_runs": "player_home_run",
        "2tb": "player_total_bases",
        "2+tb": "player_total_bases",
        "2+_tb": "player_total_bases",
        "total_bases": "player_total_bases",
        "batter_total_bases": "player_total_bases",
        "hit": "player_hits",
        "hits": "player_hits",
        "batter_hits": "player_hits",
        "rbi": "player_rbi",
        "rbis": "player_rbi",
        "runs": "player_runs",
        "run": "player_runs",
    }
    return aliases.get(raw, "unknown")


def _manual_market_display(market_type: object, side: object) -> str:
    mapped = _manual_market_type(market_type)
    if mapped == "spread":
        return "run_line"
    if mapped == "total":
        return f"total_{str(side or '').strip().lower()}" if side else "total"
    return mapped


def _is_prop_market(market_type: str) -> bool:
    return market_type.startswith("player_")


def _market_status(*, price: object, implied: object, last_updated: object) -> str:
    if price is None or implied is None:
        return "invalid_or_unpriced"
    if not str(last_updated or "").strip():
        return "stale"
    parsed = _parse_datetime(last_updated)
    if parsed is None:
        return "stale"
    age_minutes = (datetime.now(timezone.utc) - parsed).total_seconds() / 60
    return "stale" if age_minutes > 45 else "available"


def _parse_number(value: object) -> int | float | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        number = float(raw)
    except ValueError:
        return None
    return int(number) if number.is_integer() else number


def _parse_datetime(value: object) -> datetime | None:
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
