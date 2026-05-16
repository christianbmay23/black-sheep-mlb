"""Pregame verification refresh mode for EchoIQ Night Shift v4."""

from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from .change_detection import detect_changes_since_morning, missing_morning_artifacts
from .config import AgentPaths
from .data_sources import NightShiftDataSources, SourceTracker
from .id_mapping import normalize_player_name, normalize_team_code
from .manual_inputs import (
    MANUAL_INPUT_VALIDATION_FIELDS,
    load_manual_operator_inputs,
    manual_input_paths,
)
from .market_context import update_slate_odds_status
from .odds_client import fetch_odds_enrichment
from .report_writer import _source_log, _unresolved_gaps
from .schemas import DailyAgentRunResult, SlateGame, SourceResult, clean_csv_value, dataclass_row
from .sportsradar_client import fetch_sportsradar_enrichment
from .verification_gates import (
    VerificationGateInput,
    WatchlistGateInput,
    classify_watchlist_survival,
    evaluate_game_gates,
)


VERIFICATION_MATRIX_FIELDS = [
    "slate_date",
    "game_id",
    "away_team",
    "home_team",
    "game_time",
    "game_status",
    "starters_confirmed",
    "lineups_confirmed",
    "weather_verified",
    "roof_status_verified",
    "odds_verified",
    "player_props_verified",
    "news_checked",
    "no_major_scratch_risk",
    "official_bet_eligible",
    "verification_completeness",
    "missing_gates",
    "source_summary",
    "retrieved_at",
]

WATCHLIST_SURVIVAL_FIELDS = [
    "slate_date",
    "game_id",
    "player_or_team",
    "team",
    "opponent",
    "market",
    "prior_label",
    "current_status",
    "survival_reason",
    "kill_reason",
    "missing_gates",
    "odds_available",
    "best_price",
    "implied_probability",
    "player_in_lineup",
    "lineup_slot",
    "starter_confirmed",
    "weather_verified",
    "news_risk",
    "official_bet_eligible",
    "retrieved_at",
]

LINEUP_VERIFICATION_FIELDS = [
    "slate_date",
    "game_id",
    "team",
    "lineup_status",
    "confirmed_lineup_available",
    "player_name",
    "player_id",
    "lineup_slot",
    "position",
    "is_starting",
    "scratch_flag",
    "source",
    "retrieved_at",
]

STARTER_VERIFICATION_FIELDS = [
    "slate_date",
    "game_id",
    "team",
    "opponent",
    "listed_probable_sp",
    "current_sp",
    "sp_confirmed",
    "starter_changed",
    "handedness",
    "source",
    "retrieved_at",
]

MARKET_REFRESH_FIELDS = [
    "slate_date",
    "game_id",
    "market_type",
    "market",
    "player_or_team",
    "line",
    "price",
    "implied_probability",
    "sportsbook",
    "market_status",
    "last_updated",
    "source",
    "retrieved_at",
]

PLAYER_PROP_AVAILABILITY_FIELDS = [
    "slate_date",
    "game_id",
    "player_name",
    "player_id",
    "team",
    "market",
    "line",
    "price",
    "sportsbook",
    "available",
    "implied_probability",
    "last_updated",
    "source",
    "retrieved_at",
]

WEATHER_REFRESH_FIELDS = [
    "slate_date",
    "game_id",
    "venue",
    "roof_status",
    "temperature",
    "wind_speed",
    "wind_direction",
    "humidity",
    "precipitation_risk",
    "weather_verified",
    "weather_risk",
    "source",
    "retrieved_at",
]

NEWS_REFRESH_FIELDS = [
    "slate_date",
    "game_id",
    "player_name",
    "player_id",
    "team",
    "news_type",
    "status",
    "headline",
    "summary",
    "lineup_impact",
    "prop_impact",
    "source",
    "published_at",
    "retrieved_at",
]


@dataclass
class PregameRefreshResult:
    slate_date: str
    generated_at: str
    as_of: str
    refresh_mode: str
    data_completeness: str
    games: list[dict[str, object]]
    verification_matrix: list[dict[str, object]]
    watchlist_survival: list[dict[str, object]]
    lineup_verification: list[dict[str, object]]
    starter_verification: list[dict[str, object]]
    market_refresh: list[dict[str, object]]
    player_prop_availability: list[dict[str, object]]
    weather_refresh: list[dict[str, object]]
    news_refresh: list[dict[str, object]]
    manual_input_validation: list[dict[str, object]]
    change_log: dict[str, object]


def planned_pregame_refresh_paths(paths: AgentPaths) -> list[Path]:
    return [
        paths.pregame_refresh_report,
        paths.verification_matrix_csv,
        paths.watchlist_survival_csv,
        paths.lineup_verification_csv,
        paths.starter_verification_csv,
        paths.market_refresh_csv,
        paths.player_prop_availability_csv,
        paths.weather_refresh_csv,
        paths.news_refresh_csv,
        paths.manual_input_validation_csv,
        paths.change_log_json,
        paths.source_log,
        paths.unresolved_gaps,
    ]


def run_pregame_refresh_mode(
    *,
    paths: AgentPaths,
    slate_date: str,
    postgame_date: str,
    data_sources: NightShiftDataSources,
    tracker: SourceTracker,
    repo_root: Path,
    dry_run: bool,
    offline: bool,
    force_refresh: bool,
    as_of: str,
    game_id: str | None,
    sportsradar_enabled: bool,
    sportsradar_api_key_present: bool,
    sportsradar_base_url: str,
    sportsradar_access_level: str,
    odds_api_key_present: bool,
    weather_api_key_present: bool,
) -> DailyAgentRunResult:
    if dry_run:
        missing = missing_morning_artifacts(paths.slate_dir)
        warnings = [
            "Dry run: no files were written.",
            f"Would read morning artifacts under {paths.preview_dir} and {paths.watchlists_dir}.",
            "Would call MLB Stats API schedule unless --offline is set.",
            "Would call optional odds/news adapters only when configured and not offline.",
            "Would read optional manual operator CSVs from data/manual/ or ECHOIQ_*_CSV overrides.",
            f"Would write {len(planned_pregame_refresh_paths(paths))} pregame refresh/log artifacts.",
        ]
        if offline:
            warnings.append("Offline mode: would use morning artifacts/cache only and skip external APIs.")
        if missing:
            warnings.append("Morning change detection would be limited; missing: " + ", ".join(missing))
        warnings.append("Manual input paths: " + ", ".join(str(path) for path in manual_input_paths(repo_root)))
        return DailyAgentRunResult(
            slate_date=slate_date,
            postgame_date=postgame_date,
            output_dir=str(paths.slate_dir),
            dry_run=True,
            only="pregame-refresh",
            files_written=[str(path) for path in planned_pregame_refresh_paths(paths)],
            source_events=tracker.events,
            unresolved_gaps=tracker.gaps,
            warnings=warnings,
        )

    paths.pregame_refresh_dir.mkdir(parents=True, exist_ok=True)
    paths.logs_dir.mkdir(parents=True, exist_ok=True)
    result = build_pregame_refresh(
        paths=paths,
        slate_date=slate_date,
        data_sources=data_sources,
        tracker=tracker,
        repo_root=repo_root,
        offline=offline,
        force_refresh=force_refresh,
        as_of=as_of,
        game_id=game_id,
        sportsradar_enabled=sportsradar_enabled,
        sportsradar_api_key_present=sportsradar_api_key_present,
        sportsradar_base_url=sportsradar_base_url,
        sportsradar_access_level=sportsradar_access_level,
        odds_api_key_present=odds_api_key_present,
        weather_api_key_present=weather_api_key_present,
    )
    files_written = write_pregame_refresh_outputs(paths=paths, result=result, tracker=tracker)
    return DailyAgentRunResult(
        slate_date=slate_date,
        postgame_date=postgame_date,
        output_dir=str(paths.slate_dir),
        dry_run=False,
        only="pregame-refresh",
        files_written=files_written,
        source_events=tracker.events,
        unresolved_gaps=tracker.gaps,
    )


def build_pregame_refresh(
    *,
    paths: AgentPaths,
    slate_date: str,
    data_sources: NightShiftDataSources,
    tracker: SourceTracker,
    repo_root: Path,
    offline: bool,
    force_refresh: bool,
    as_of: str,
    game_id: str | None,
    sportsradar_enabled: bool,
    sportsradar_api_key_present: bool,
    sportsradar_base_url: str,
    sportsradar_access_level: str,
    odds_api_key_present: bool,
    weather_api_key_present: bool,
) -> PregameRefreshResult:
    generated_at = tracker.now()
    tracker.record_result(
        SourceResult(
            source_name="EchoIQ Pregame Refresh",
            endpoint="pregame-refresh",
            success=True,
            retrieved_at=generated_at,
            notes="PREGAME_REFRESH_STARTED",
        )
    )
    if offline:
        tracker.record_result(
            SourceResult(
                source_name="EchoIQ Pregame Refresh",
                endpoint="offline/cache-only",
                success=True,
                retrieved_at=tracker.now(),
                notes="OFFLINE_MODE: external source calls skipped for pregame refresh.",
            )
        )

    morning = _read_morning_artifacts(paths, tracker)
    current_games, slate_games, schedule_payload = _current_slate_games(
        slate_date=slate_date,
        data_sources=data_sources,
        morning=morning,
        game_id=game_id,
        offline=offline,
    )
    watchlist_input_rows = _read_watchlists(paths)
    lineup_rows = _current_lineups(
        slate_date=slate_date,
        games=current_games,
        schedule_payload=schedule_payload,
        data_sources=data_sources,
        offline=offline,
    )
    starter_rows = _current_starters(slate_games, morning.get("probable_pitchers", []))
    _record_lineup_and_starter_status(tracker, lineup_rows, starter_rows)
    manual_inputs = load_manual_operator_inputs(
        slate_date=slate_date,
        slate_games=slate_games,
        repo_root=repo_root,
        tracker=tracker,
        retrieved_at=tracker.now(),
    )
    if manual_inputs.weather_rows:
        weather_rows = manual_inputs.weather_rows
    else:
        weather_rows = _current_weather_rows(
            slate_date=slate_date,
            games=current_games,
            morning_rows=morning.get("weather", []),
            tracker=tracker,
            weather_api_key_present=weather_api_key_present,
            offline=offline,
        )

    market_snapshot = []
    news_rows_raw = []
    sportsradar_news_status = "NEWS_NOT_VERIFIED"
    if offline:
        market_snapshot = _market_snapshot_from_morning(morning.get("market_snapshot", []))
        news_rows_raw = _news_from_morning(morning.get("injury_news", []), slate_games)
        sportsradar_news_status = "NEWS_EMPTY" if news_rows_raw else "NEWS_NOT_VERIFIED"
    else:
        market_snapshot = fetch_odds_enrichment(
            slate_date=slate_date,
            slate_games=slate_games,
            data_sources=data_sources,
            api_key_present=odds_api_key_present,
            repo_root=repo_root,
            force_refresh=force_refresh,
        )
        sportsradar = fetch_sportsradar_enrichment(
            slate_date=slate_date,
            slate_games=slate_games,
            data_sources=data_sources,
            enabled=sportsradar_enabled,
            api_key_present=sportsradar_api_key_present,
            base_url=sportsradar_base_url,
            access_level=sportsradar_access_level,
        )
        news_rows_raw = sportsradar.injury_news
        sportsradar_news_status = sportsradar.news_status
    update_slate_odds_status(slate_games, market_snapshot)

    market_rows = _market_refresh_rows(market_snapshot)
    if manual_inputs.market_rows:
        market_rows = _replace_market_rows(market_rows, manual_inputs.market_rows)
    if market_rows:
        tracker.record_result(
            SourceResult(
                source_name="Odds/Props API",
                endpoint="pregame-refresh market rows",
                success=True,
                retrieved_at=tracker.now(),
                record_count=len(market_rows),
                notes="ODDS_VERIFIED",
            )
        )
    _record_market_mapping_gaps(market_rows, tracker)
    prop_rows = _player_prop_rows(market_snapshot, tracker, offline=offline, lineup_rows=lineup_rows)
    if manual_inputs.player_prop_rows:
        prop_rows = _replace_prop_rows(prop_rows, manual_inputs.player_prop_rows)
    news_rows = _news_refresh_rows(
        news_rows_raw,
        slate_games,
        tracker,
        lineup_rows=lineup_rows,
        news_status=sportsradar_news_status,
    )
    if manual_inputs.news_rows:
        news_rows = _replace_news_rows(news_rows, manual_inputs.news_rows)
    verification_matrix = _verification_matrix_rows(
        slate_date=slate_date,
        games=current_games,
        lineup_rows=lineup_rows,
        starter_rows=starter_rows,
        weather_rows=weather_rows,
        market_rows=market_rows,
        prop_rows=prop_rows,
        news_rows=news_rows,
        retrieved_at=tracker.now(),
    )
    watchlist_survival = _watchlist_survival_rows(
        slate_date=slate_date,
        watchlist_rows=watchlist_input_rows,
        verification_rows=verification_matrix,
        lineup_rows=lineup_rows,
        starter_rows=starter_rows,
        weather_rows=weather_rows,
        market_rows=market_rows,
        news_rows=news_rows,
        retrieved_at=tracker.now(),
    )

    change_base = detect_changes_since_morning(
        slate_date=slate_date,
        slate_dir=paths.slate_dir,
        morning=morning,
        current_games=current_games,
        current_starters=starter_rows,
        current_lineups=lineup_rows,
        current_markets=market_rows,
        current_news=news_rows,
        current_weather=weather_rows,
    )
    summary = Counter(str(row["current_status"]).lower() for row in watchlist_survival)
    change_log = {
        "slate_date": slate_date,
        "generated_at": generated_at,
        "changes_since_morning": change_base["changes_since_morning"],
        "watchlist_survival_summary": {
            "alive": summary.get("alive", 0),
            "conditional": summary.get("conditional", 0),
            "killed": summary.get("killed", 0),
            "pass": summary.get("pass", 0),
            "needs_final_check": summary.get("needs_final_check", 0),
        },
        "unresolved_gaps": change_base["unresolved_gaps"],
    }
    if change_base["unresolved_gaps"]:
        tracker.record_gap(
            missing_source="MORNING_ARTIFACTS_MISSING",
            affected_artifact="04_pregame_refresh/change_log.json",
            severity="MEDIUM",
            recommended_fix="Run the morning Night Shift preview first or provide the missing 02/03 artifacts.",
            output_degraded=True,
        )
        tracker.record_result(
            SourceResult(
                source_name="EchoIQ Pregame Refresh",
                endpoint="morning-artifact-comparison",
                success=False,
                retrieved_at=tracker.now(),
                notes="CHANGE_DETECTION_LIMITED",
                error_summary="MORNING_ARTIFACTS_MISSING",
            )
        )

    tracker.record_result(
        SourceResult(
            source_name="EchoIQ Pregame Refresh",
            endpoint="watchlist-survival",
            success=True,
            retrieved_at=tracker.now(),
            record_count=len(watchlist_survival),
            notes="WATCHLIST_SURVIVAL_COMPLETE",
        )
    )
    tracker.record_result(
        SourceResult(
            source_name="EchoIQ Pregame Refresh",
            endpoint="pregame-refresh",
            success=True,
            retrieved_at=tracker.now(),
            record_count=len(current_games),
            notes="PREGAME_REFRESH_COMPLETE",
        )
    )

    return PregameRefreshResult(
        slate_date=slate_date,
        generated_at=generated_at,
        as_of=as_of,
        refresh_mode="pregame-refresh",
        data_completeness=_data_completeness(verification_matrix),
        games=current_games,
        verification_matrix=verification_matrix,
        watchlist_survival=watchlist_survival,
        lineup_verification=lineup_rows,
        starter_verification=starter_rows,
        market_refresh=market_rows,
        player_prop_availability=prop_rows,
        weather_refresh=weather_rows,
        news_refresh=news_rows,
        manual_input_validation=manual_inputs.validation_rows,
        change_log=change_log,
    )


def write_pregame_refresh_outputs(*, paths: AgentPaths, result: PregameRefreshResult, tracker: SourceTracker) -> list[str]:
    _write_csv(paths.verification_matrix_csv, VERIFICATION_MATRIX_FIELDS, result.verification_matrix)
    _write_csv(paths.watchlist_survival_csv, WATCHLIST_SURVIVAL_FIELDS, result.watchlist_survival)
    _write_csv(paths.lineup_verification_csv, LINEUP_VERIFICATION_FIELDS, result.lineup_verification)
    _write_csv(paths.starter_verification_csv, STARTER_VERIFICATION_FIELDS, result.starter_verification)
    _write_csv(paths.market_refresh_csv, MARKET_REFRESH_FIELDS, result.market_refresh)
    _write_csv(paths.player_prop_availability_csv, PLAYER_PROP_AVAILABILITY_FIELDS, result.player_prop_availability)
    _write_csv(paths.weather_refresh_csv, WEATHER_REFRESH_FIELDS, result.weather_refresh)
    _write_csv(paths.news_refresh_csv, NEWS_REFRESH_FIELDS, result.news_refresh)
    _write_csv(paths.manual_input_validation_csv, MANUAL_INPUT_VALIDATION_FIELDS, result.manual_input_validation)
    paths.change_log_json.write_text(json.dumps(result.change_log, indent=2, ensure_ascii=False), encoding="utf-8")
    paths.pregame_refresh_report.write_text(_pregame_refresh_report(result), encoding="utf-8")
    paths.source_log.write_text(_source_log(tracker.events), encoding="utf-8")
    paths.unresolved_gaps.write_text(_unresolved_gaps(tracker.gaps), encoding="utf-8")
    return [str(path) for path in planned_pregame_refresh_paths(paths)]


def _read_morning_artifacts(paths: AgentPaths, tracker: SourceTracker) -> dict[str, list[dict[str, str]]]:
    files = {
        "verified_slate": paths.verified_slate_csv,
        "probable_pitchers": paths.probable_pitchers_csv,
        "lineup_status": paths.lineup_status_csv,
        "market_snapshot": paths.market_snapshot_csv,
        "injury_news": paths.injury_news_csv,
        "weather": paths.weather_csv,
    }
    out: dict[str, list[dict[str, str]]] = {}
    for name, path in files.items():
        if path.exists():
            rows = _read_csv(path)
            out[name] = rows
            tracker.record_result(
                SourceResult(
                    source_name="Morning Artifact",
                    endpoint=str(path),
                    success=True,
                    retrieved_at=tracker.now(),
                    record_count=len(rows),
                    notes=f"Read morning artifact {name}.",
                )
            )
        else:
            out[name] = []
            tracker.record_result(
                SourceResult(
                    source_name="Morning Artifact",
                    endpoint=str(path),
                    success=False,
                    retrieved_at=tracker.now(),
                    notes="MORNING_ARTIFACTS_MISSING",
                    error_summary="file_missing",
                )
            )
    return out


def _current_slate_games(
    *,
    slate_date: str,
    data_sources: NightShiftDataSources,
    morning: dict[str, list[dict[str, str]]],
    game_id: str | None,
    offline: bool,
) -> tuple[list[dict[str, object]], list[SlateGame], dict[str, object]]:
    schedule_payload: dict[str, object] = {}
    raw_games: list[dict[str, object]]
    if offline:
        raw_games = [_game_from_morning(row) for row in morning.get("verified_slate", [])]
    else:
        schedule = data_sources.fetch_schedule(slate_date, affected_artifact="04_pregame_refresh/verification_matrix.csv")
        raw_games = schedule.games
        schedule_payload = schedule.payload
        if not raw_games:
            raw_games = [_game_from_morning(row) for row in morning.get("verified_slate", [])]
    if game_id:
        raw_games = [row for row in raw_games if str(row.get("game_id", "")) == str(game_id)]
    slate_games = [_slate_game_from_raw(slate_date, row) for row in raw_games]
    return [_game_row_from_slate(game) for game in slate_games], slate_games, schedule_payload


def _current_lineups(
    *,
    slate_date: str,
    games: list[dict[str, object]],
    schedule_payload: dict[str, object],
    data_sources: NightShiftDataSources,
    offline: bool,
) -> list[dict[str, object]]:
    parsed = _lineup_player_rows_from_schedule_payload(slate_date, schedule_payload)
    if not offline:
        for game in games:
            game_id = str(game.get("game_id", ""))
            if not game_id:
                continue
            payload = data_sources.fetch_game_feed(
                game_id,
                affected_artifact="04_pregame_refresh/lineup_verification.csv",
            )
            if payload:
                parsed.extend(
                    _lineup_player_rows_from_game_feed(
                        slate_date=slate_date,
                        game=game,
                        payload=payload,
                        retrieved_at=data_sources.tracker.now(),
                    )
                )

    parsed = _dedupe_confirmed_lineup_rows(parsed)
    rows: list[dict[str, object]] = []
    for game in games:
        for team in [game["away_team"], game["home_team"]]:
            if any(str(row.get("game_id", "")) == str(game["game_id"]) and str(row.get("team", "")) == str(team) for row in parsed):
                continue
            rows.append(
                {
                    "slate_date": slate_date,
                    "game_id": game["game_id"],
                    "team": team,
                    "lineup_status": "LINEUPS_NOT_POSTED",
                    "confirmed_lineup_available": False,
                    "player_name": "",
                    "player_id": "",
                    "lineup_slot": "",
                    "position": "",
                    "is_starting": "",
                    "scratch_flag": False,
                    "source": "MLB Stats API live feed" if not offline else "offline/cache-only",
                    "retrieved_at": game["retrieved_at"],
                }
            )
    return [*parsed, *rows]


def _current_weather_rows(
    *,
    slate_date: str,
    games: list[dict[str, object]],
    morning_rows: list[dict[str, str]],
    tracker: SourceTracker,
    weather_api_key_present: bool,
    offline: bool,
) -> list[dict[str, object]]:
    weather_by_game = {str(row.get("game_id", "")): row for row in morning_rows}
    rows: list[dict[str, object]] = []
    for game in games:
        source = weather_by_game.get(str(game.get("game_id", "")), {})
        if not source:
            continue
        source_name = str(source.get("source", ""))
        verified = bool(source_name and not source_name.startswith("not_available") and source.get("confidence", "").upper() not in {"", "LOW", "UNVERIFIED"})
        rows.append(
            {
                "slate_date": slate_date,
                "game_id": game.get("game_id", ""),
                "venue": source.get("venue") or game.get("venue", ""),
                "roof_status": source.get("roof_status", "") or "unverified",
                "temperature": source.get("temperature", ""),
                "wind_speed": source.get("wind_speed", ""),
                "wind_direction": source.get("wind_direction", ""),
                "humidity": source.get("humidity", ""),
                "precipitation_risk": source.get("precipitation_risk", ""),
                "weather_verified": verified,
                "weather_risk": _weather_risk(source, verified),
                "source": source_name or "morning_weather_artifact",
                "retrieved_at": source.get("retrieved_at", "") or game.get("retrieved_at", ""),
            }
        )
    if rows and any(_truthy(row.get("weather_verified")) for row in rows):
        tracker.record_result(
            SourceResult(
                source_name="Weather API",
                endpoint="morning weather artifact",
                success=True,
                retrieved_at=tracker.now(),
                record_count=len(rows),
                notes="WEATHER_VERIFIED_FROM_EXISTING_ARTIFACT",
            )
        )
        return rows

    note = (
        "WEATHER_SOURCE_UNAVAILABLE: WEATHER_API_KEY is present but no supported v4 weather adapter or verified weather artifact is available."
        if weather_api_key_present
        else "WEATHER_SOURCE_UNAVAILABLE: no WEATHER_API_KEY, supported free weather adapter, or verified weather artifact is available."
    )
    tracker.record_result(
        SourceResult(
            source_name="Weather API",
            endpoint="offline/cache-only" if offline else "not_called",
            success=False,
            retrieved_at=tracker.now(),
            record_count=len(rows),
            notes=note,
            error_summary="WEATHER_SOURCE_UNAVAILABLE",
        )
    )
    tracker.record_gap(
        missing_source="WEATHER_SOURCE_UNAVAILABLE",
        affected_artifact="04_pregame_refresh/weather_refresh.csv",
        severity="MEDIUM",
        recommended_fix="Configure a supported venue weather source or provide data/manual/weather_roof.csv rows with temperature, wind, precipitation, and roof status.",
        output_degraded=True,
    )
    return rows


def _current_starters(slate_games: list[SlateGame], morning_rows: list[dict[str, str]]) -> list[dict[str, object]]:
    prior = {(row.get("game_id", ""), row.get("team", "")): row for row in morning_rows}
    rows: list[dict[str, object]] = []
    for game in slate_games:
        for team, opponent, name in [
            (game.away_team, game.home_team, game.away_probable_sp),
            (game.home_team, game.away_team, game.home_probable_sp),
        ]:
            old = prior.get((game.game_id, team), {})
            old_name = old.get("pitcher_name", "")
            current = name or "TBD"
            changed = bool(old_name and old_name != "TBD" and current != "TBD" and old_name != current)
            rows.append(
                {
                    "slate_date": game.slate_date,
                    "game_id": game.game_id,
                    "team": team,
                    "opponent": opponent,
                    "listed_probable_sp": old_name or current,
                    "current_sp": current,
                    "sp_confirmed": bool(name),
                    "starter_changed": changed,
                    "handedness": old.get("handedness", ""),
                    "source": game.source,
                    "retrieved_at": game.retrieved_at,
                }
            )
    return rows


def _market_refresh_rows(rows: Iterable[object]) -> list[dict[str, object]]:
    out = []
    for row in rows:
        payload = _object_payload(row, ["slate_date", "game_id", "market_type", "market", "player_name", "team", "line", "price", "implied_probability", "sportsbook", "status", "last_updated", "source", "retrieved_at"])
        out.append(
            {
                "slate_date": payload["slate_date"],
                "game_id": payload["game_id"],
                "market_type": payload["market_type"],
                "market": payload["market"],
                "player_or_team": payload["player_name"] or payload["team"],
                "team": payload["team"],
                "line": payload["line"],
                "price": payload["price"],
                "implied_probability": payload["implied_probability"],
                "sportsbook": payload["sportsbook"],
                "market_status": payload["status"],
                "last_updated": payload["last_updated"],
                "source": payload["source"],
                "retrieved_at": payload["retrieved_at"],
            }
        )
    return out


def _player_prop_rows(
    rows: Iterable[object],
    tracker: SourceTracker,
    *,
    offline: bool,
    lineup_rows: list[dict[str, object]],
) -> list[dict[str, object]]:
    out = []
    player_lookup = _player_lookup(lineup_rows)
    for row in _market_refresh_rows(rows):
        if _is_player_prop_market_row(row):
            mapped = player_lookup.get((str(row["game_id"]), normalize_player_name(row["player_or_team"])))
            player_id = (mapped or {}).get("player_id", "")
            team = row.get("team", "") or (mapped or {}).get("team", "")
            if not player_id:
                tracker.record_gap(
                    missing_source="PLAYER_ID_MAPPING_MISSING",
                    affected_artifact="04_pregame_refresh/player_prop_availability.csv",
                    affected_games_players=f"{row['game_id']}:{row['player_or_team']}",
                    severity="LOW",
                    recommended_fix="Map provider player IDs to MLBAM IDs or wait for confirmed MLB lineup rows.",
                    output_degraded=False,
                )
            out.append(
                {
                    "slate_date": row["slate_date"],
                    "game_id": row["game_id"],
                    "player_name": row["player_or_team"],
                    "player_id": player_id,
                    "team": team,
                    "market": row["market"],
                    "line": row["line"],
                    "price": row["price"],
                    "sportsbook": row["sportsbook"],
                    "available": row["market_status"] == "available",
                    "implied_probability": row["implied_probability"],
                    "last_updated": row["last_updated"],
                    "source": row["source"],
                    "retrieved_at": row["retrieved_at"],
                }
            )
    if not out:
        tracker.record_result(
            SourceResult(
                source_name="Player Props",
                endpoint="not_configured" if not offline else "offline/cache-only",
                success=False,
                retrieved_at=tracker.now(),
                notes="PLAYER_PROPS_UNAVAILABLE",
                error_summary="PLAYER_PROPS_UNAVAILABLE",
            )
        )
        tracker.record_gap(
            missing_source="PLAYER_PROPS_UNAVAILABLE",
            affected_artifact="04_pregame_refresh/player_prop_availability.csv",
            severity="MEDIUM",
            recommended_fix="Wire a verified player-prop source before final-card price review.",
            output_degraded=True,
        )
    else:
        tracker.record_result(
            SourceResult(
                source_name="Player Props",
                endpoint="pregame-refresh player props",
                success=True,
                retrieved_at=tracker.now(),
                record_count=len(out),
                notes="PLAYER_PROPS_AVAILABLE",
            )
        )
    return out


def _is_player_prop_market_row(row: dict[str, object]) -> bool:
    market_type = str(row.get("market_type", ""))
    market = str(row.get("market", ""))
    return bool(row.get("player_or_team")) and (
        market_type.startswith("player_")
        or market in {"home_run", "total_bases", "hits", "rbi", "runs", "player_home_run", "player_total_bases", "player_hits", "player_rbi", "player_runs"}
    )


def _news_refresh_rows(
    rows: Iterable[object],
    slate_games: list[SlateGame],
    tracker: SourceTracker,
    *,
    lineup_rows: list[dict[str, object]],
    news_status: str,
) -> list[dict[str, object]]:
    game_by_team = {game.away_team: game for game in slate_games} | {game.home_team: game for game in slate_games}
    player_lookup = _player_lookup(lineup_rows)
    out = []
    for row in rows:
        payload = _object_payload(row, ["slate_date", "player_name", "player_id", "team", "status", "injury_or_news_type", "headline", "summary", "source", "published_at", "retrieved_at"])
        team = normalize_team_code(payload["team"])
        game = game_by_team.get(team)
        mapped_player = player_lookup.get((game.game_id if game is not None else "", normalize_player_name(payload["player_name"])))
        player_id = payload["player_id"] or (mapped_player or {}).get("player_id", "")
        status_text = " ".join(str(payload.get(field, "")) for field in ["status", "injury_or_news_type", "headline", "summary"]).lower()
        impact = "RISK" if any(token in status_text for token in ["out", "doubt", "scratch", "injur", "il"]) else "UNVERIFIED"
        out.append(
            {
                "slate_date": payload["slate_date"],
                "game_id": game.game_id if game is not None else "",
                "player_name": payload["player_name"],
                "player_id": player_id,
                "team": team,
                "news_type": payload["injury_or_news_type"],
                "status": payload["status"],
                "headline": payload["headline"],
                "summary": payload["summary"],
                "lineup_impact": impact,
                "prop_impact": impact,
                "source": payload["source"],
                "published_at": payload["published_at"],
                "retrieved_at": payload["retrieved_at"],
            }
        )
        if payload["player_name"] and not player_id:
            tracker.record_gap(
                missing_source="PLAYER_ID_MAPPING_MISSING",
                affected_artifact="04_pregame_refresh/news_refresh.csv",
                affected_games_players=f"{team}:{payload['player_name']}",
                severity="LOW",
                recommended_fix="Join SportsRadar player IDs to MLBAM IDs through confirmed MLB lineup rows or a durable ID crosswalk.",
                output_degraded=False,
            )
        if team and game is None:
            tracker.record_gap(
                missing_source="TEAM_ID_MAPPING_MISSING",
                affected_artifact="04_pregame_refresh/news_refresh.csv",
                affected_games_players=team,
                severity="LOW",
                recommended_fix="Add a SportsRadar-to-MLB team alias for this source value.",
                output_degraded=True,
            )
    if not out and news_status == "NEWS_EMPTY":
        retrieved_at = tracker.now()
        for game in slate_games:
            out.append(
                {
                    "slate_date": game.slate_date,
                    "game_id": game.game_id,
                    "player_name": "",
                    "player_id": "",
                    "team": "",
                    "news_type": "injury_feed_check",
                    "status": "NO_RELEVANT_NEWS",
                    "headline": "SportsRadar injury feed checked for slate teams",
                    "summary": "",
                    "lineup_impact": "CHECKED",
                    "prop_impact": "CHECKED",
                    "source": "SportsRadar MLB API",
                    "published_at": "",
                    "retrieved_at": retrieved_at,
                }
            )
    if out:
        tracker.record_result(
            SourceResult(
                source_name="News Refresh",
                endpoint="injury/news rows",
                success=True,
                retrieved_at=tracker.now(),
                record_count=len(out),
                notes="NEWS_REFRESH_AVAILABLE",
            )
        )
    else:
        tracker.record_result(
            SourceResult(
                source_name="News Refresh",
                endpoint="not_available_or_empty",
                success=False,
                retrieved_at=tracker.now(),
                notes="NEWS_REFRESH_UNAVAILABLE",
                error_summary="NEWS_REFRESH_UNAVAILABLE",
            )
        )
    return out


def _verification_matrix_rows(
    *,
    slate_date: str,
    games: list[dict[str, object]],
    lineup_rows: list[dict[str, object]],
    starter_rows: list[dict[str, object]],
    weather_rows: list[dict[str, object]],
    market_rows: list[dict[str, object]],
    prop_rows: list[dict[str, object]],
    news_rows: list[dict[str, object]],
    retrieved_at: str,
) -> list[dict[str, object]]:
    lineups_by_game = _group(lineup_rows, "game_id")
    starters_by_game = _group(starter_rows, "game_id")
    weather_by_game = _group(weather_rows, "game_id")
    markets_by_game = _group(market_rows, "game_id")
    props_by_game = _group(prop_rows, "game_id")
    news_by_game = _group(news_rows, "game_id")
    rows = []
    for game in games:
        gid = str(game["game_id"])
        starters_confirmed = bool(starters_by_game.get(gid)) and all(_truthy(row.get("sp_confirmed")) for row in starters_by_game[gid])
        lineups_confirmed = _game_lineups_confirmed(lineups_by_game.get(gid, []), game)
        weather_verified = any(_truthy(row.get("weather_verified")) for row in weather_by_game.get(gid, []))
        roof_verified = any(str(row.get("roof_status", "")).lower() not in {"", "unverified", "unknown", "retractable_unknown"} for row in weather_by_game.get(gid, []))
        odds_verified = any(str(row.get("market_status", "")) == "available" for row in markets_by_game.get(gid, []))
        props_verified = any(_truthy(row.get("available")) for row in props_by_game.get(gid, []))
        news_checked = bool(news_by_game.get(gid))
        no_scratch = not any(_truthy(row.get("scratch_flag")) for row in lineups_by_game.get(gid, [])) and not any(str(row.get("lineup_impact", "")).upper() == "RISK" for row in news_by_game.get(gid, []))
        evaluation = evaluate_game_gates(
            VerificationGateInput(
                game_status=str(game.get("game_status", "")),
                starters_confirmed=starters_confirmed,
                lineups_confirmed=lineups_confirmed,
                weather_verified=weather_verified,
                roof_status_verified=roof_verified,
                odds_verified=odds_verified,
                player_props_verified=props_verified,
                news_checked=news_checked,
                no_major_scratch_risk=no_scratch,
            )
        )
        rows.append(
            {
                "slate_date": slate_date,
                "game_id": gid,
                "away_team": game.get("away_team", ""),
                "home_team": game.get("home_team", ""),
                "game_time": game.get("game_time", ""),
                "game_status": game.get("game_status", ""),
                "starters_confirmed": starters_confirmed,
                "lineups_confirmed": lineups_confirmed,
                "weather_verified": weather_verified,
                "roof_status_verified": roof_verified,
                "odds_verified": odds_verified,
                "player_props_verified": props_verified,
                "news_checked": news_checked,
                "no_major_scratch_risk": no_scratch,
                "official_bet_eligible": False,
                "verification_completeness": evaluation.verification_completeness,
                "missing_gates": "; ".join(evaluation.missing_gates),
                "source_summary": _source_summary_for_game(gid, starter_rows, lineup_rows, weather_rows, market_rows, news_rows),
                "retrieved_at": retrieved_at,
            }
        )
    return rows


def _watchlist_survival_rows(
    *,
    slate_date: str,
    watchlist_rows: list[dict[str, str]],
    verification_rows: list[dict[str, object]],
    lineup_rows: list[dict[str, object]],
    starter_rows: list[dict[str, object]],
    weather_rows: list[dict[str, object]],
    market_rows: list[dict[str, object]],
    news_rows: list[dict[str, object]],
    retrieved_at: str,
) -> list[dict[str, object]]:
    verification_by_game = {str(row["game_id"]): row for row in verification_rows}
    lineup_lookup = _lineup_lookup(lineup_rows)
    starters_by_game = _group(starter_rows, "game_id")
    market_lookup = _market_lookup(market_rows)
    news_risk_by_player = _news_risk_by_player(news_rows)
    out = []
    for row in watchlist_rows:
        gid = row.get("game_id", "")
        game_verification = verification_by_game.get(gid, {})
        player_or_team = row.get("player_name") or row.get("team") or ""
        lineup = lineup_lookup.get((normalize_player_name(row.get("player_name", "")), row.get("team", ""), gid))
        lineups_confirmed = _truthy(game_verification.get("lineups_confirmed"))
        player_in_lineup = None
        if row.get("market") == "Game line":
            player_in_lineup = True
        elif lineups_confirmed:
            player_in_lineup = lineup is not None
        starter_changed = any(_truthy(item.get("starter_changed")) for item in starters_by_game.get(gid, []))
        market = market_lookup.get((gid, _norm(player_or_team), row.get("market", "")))
        odds_available = market is not None and str(market.get("market_status", "")) == "available"
        is_prop_market = row.get("market") != "Game line"
        player_prop_available = odds_available if is_prop_market else False
        news_risk = news_risk_by_player.get((normalize_player_name(row.get("player_name", "")), row.get("team", "")), "UNVERIFIED")
        survival = classify_watchlist_survival(
            WatchlistGateInput(
                market=row.get("market", ""),
                prior_label=row.get("label", ""),
                game_not_started=_truthy(game_verification.get("game_status_is_pregame", True))
                if "game_status_is_pregame" in game_verification
                else "GAME_NOT_STARTED" not in str(game_verification.get("missing_gates", "")),
                starters_confirmed=_truthy(game_verification.get("starters_confirmed")),
                lineups_confirmed=lineups_confirmed,
                player_in_lineup=player_in_lineup,
                starter_changed=starter_changed,
                starter_thesis_dependent="starter" in _combined_text(row).lower() or "matchup" in _combined_text(row).lower(),
                weather_verified=_truthy(game_verification.get("weather_verified")),
                odds_available=odds_available or _truthy(row.get("odds_available")),
                player_prop_available=player_prop_available,
                news_checked=_truthy(game_verification.get("news_checked")),
                scratch_flag=bool(lineup and _truthy(lineup.get("scratch_flag"))),
                major_news_risk=news_risk == "RISK",
                uncertain_news_risk=news_risk == "CONDITIONAL",
                definite_market_unavailable=False,
            )
        )
        out.append(
            {
                "slate_date": slate_date,
                "game_id": gid,
                "player_or_team": player_or_team,
                "team": row.get("team", ""),
                "opponent": row.get("opponent", ""),
                "market": row.get("market", ""),
                "prior_label": row.get("label", ""),
                "current_status": survival.current_status,
                "survival_reason": survival.survival_reason,
                "kill_reason": survival.kill_reason,
                "missing_gates": "; ".join(survival.missing_gates),
                "odds_available": odds_available or _truthy(row.get("odds_available")),
                "best_price": (market or {}).get("price", row.get("best_price", "")),
                "implied_probability": (market or {}).get("implied_probability", row.get("implied_probability", "")),
                "player_in_lineup": "" if player_in_lineup is None else player_in_lineup,
                "lineup_slot": (lineup or {}).get("lineup_slot", ""),
                "starter_confirmed": _truthy(game_verification.get("starters_confirmed")),
                "weather_verified": _truthy(game_verification.get("weather_verified")),
                "news_risk": news_risk,
                "official_bet_eligible": False,
                "retrieved_at": retrieved_at,
            }
        )
    return out


def _pregame_refresh_report(result: PregameRefreshResult) -> str:
    status_counts = Counter(str(row["current_status"]) for row in result.watchlist_survival)
    games_with = lambda field: sum(1 for row in result.verification_matrix if _truthy(row.get(field)))  # noqa: E731
    lines = [
        "# EchoIQ Night Shift Pregame Verification Refresh",
        "",
        f"- Slate date: {result.slate_date}",
        f"- Generated timestamp: {result.generated_at}",
        f"- Refresh mode: {result.refresh_mode}",
        f"- As-of time: {result.as_of or 'not specified'}",
        f"- Data completeness: {result.data_completeness}",
        "- Official bet status: disabled / no official bets generated",
        "",
        "No official bets were generated. This refresh only verifies whether morning watchlist items remain alive for later final-card review.",
        "",
        "## Executive Summary",
        "",
        f"- Games checked: {len(result.verification_matrix)}",
        f"- Games with confirmed starters: {games_with('starters_confirmed')}",
        f"- Games with confirmed lineups: {games_with('lineups_confirmed')}",
        f"- Games with market data: {games_with('odds_verified')}",
        f"- Games with player prop availability: {games_with('player_props_verified')}",
        f"- Games with weather verified: {games_with('weather_verified')}",
        f"- Games with major unresolved gaps: {sum(1 for row in result.verification_matrix if row.get('missing_gates'))}",
        f"- Watchlist items alive/killed/conditional: {status_counts.get('ALIVE', 0)} alive, {status_counts.get('KILLED', 0)} killed, {status_counts.get('CONDITIONAL', 0)} conditional, {status_counts.get('NEEDS_FINAL_CHECK', 0)} needs final check, {status_counts.get('PASS', 0)} pass",
        "",
        "## Game Status Table",
        "",
        "| Away | Home | Game Time | Status | Starter Status | Lineup Status | Weather Status | Market Status | Props Status | News Status | Verification Completeness |",
        "|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for row in result.verification_matrix:
        lines.append(
            f"| {row['away_team']} | {row['home_team']} | {row['game_time'] or 'NA'} | {row['game_status'] or 'NA'} | "
            f"{_status(row['starters_confirmed'])} | {_status(row['lineups_confirmed'])} | {_status(row['weather_verified'])} | "
            f"{_status(row['odds_verified'])} | {_status(row['player_props_verified'])} | {_status(row['news_checked'])} | {row['verification_completeness']} |"
        )
    if not result.verification_matrix:
        lines.append("| No games found | NA | NA | NA | missing | missing | missing | missing | missing | missing | INCOMPLETE |")

    lines.extend(["", "## Verification Matrix", ""])
    lines.append("| Game | GAME_NOT_STARTED | STARTERS_CONFIRMED | LINEUPS_CONFIRMED | WEATHER_VERIFIED | ROOF_STATUS_VERIFIED | ODDS_VERIFIED | PLAYER_PROPS_VERIFIED | NEWS_CHECKED | NO_MAJOR_SCRATCH_RISK | OFFICIAL_BET_ELIGIBLE |")
    lines.append("|---|---|---|---|---|---|---|---|---|---|---|")
    for row in result.verification_matrix:
        game = f"{row['away_team']}@{row['home_team']}"
        game_not_started = "GAME_NOT_STARTED" not in str(row.get("missing_gates", ""))
        lines.append(
            f"| {game} | {_yes_no(game_not_started)} | {_yes_no(row['starters_confirmed'])} | {_yes_no(row['lineups_confirmed'])} | "
            f"{_yes_no(row['weather_verified'])} | {_yes_no(row['roof_status_verified'])} | {_yes_no(row['odds_verified'])} | "
            f"{_yes_no(row['player_props_verified'])} | {_yes_no(row['news_checked'])} | {_yes_no(row['no_major_scratch_risk'])} | false |"
        )

    lines.extend(["", "## Watchlist Survival Report", ""])
    if result.watchlist_survival:
        lines.append("| Candidate | Market | Prior Label | Current Status | Kill Reason | Missing Gates | Market Context | Lineup/Starter/Weather/News Context |")
        lines.append("|---|---|---|---|---|---|---|---|")
        for row in result.watchlist_survival:
            context = f"odds={_yes_no(row['odds_available'])}; price={row.get('best_price') or 'NA'}; imp={row.get('implied_probability') or 'NA'}"
            checks = f"lineup={row.get('player_in_lineup') or 'unknown'}; starter={_yes_no(row['starter_confirmed'])}; weather={_yes_no(row['weather_verified'])}; news={row.get('news_risk') or 'UNVERIFIED'}"
            lines.append(
                f"| {row['player_or_team']} | {row['market']} | {row['prior_label']} | {row['current_status']} | "
                f"{row['kill_reason'] or 'NA'} | {row['missing_gates'] or 'none'} | {context} | {checks} |"
            )
    else:
        lines.append("No prior watchlist rows were available under 03_watchlists.")

    lines.extend(["", "## Major Changes Since Morning", ""])
    changes = result.change_log["changes_since_morning"]
    for title, key in [
        ("Starter changes", "starter_changes"),
        ("Lineup confirmations", "lineup_changes"),
        ("Scratches", "scratches"),
        ("Injuries/news", "news_changes"),
        ("Odds/market changes", "market_changes"),
        ("Weather shifts", "weather_changes"),
        ("Player prop availability changes", "prop_availability_changes"),
    ]:
        lines.append(f"- {title}: {len(changes.get(key, []))}")
    moved = [row for row in result.verification_matrix if "GAME_NOT_STARTED" in str(row.get("missing_gates", ""))]
    lines.append(f"- Games moved/postponed/delayed/live/final: {len(moved)}")

    survival_by_game: dict[str, list[dict[str, object]]] = defaultdict(list)
    for row in result.watchlist_survival:
        survival_by_game[str(row["game_id"])].append(row)
    lines.extend(["", "## Game-By-Game Refresh Notes", ""])
    for game in result.verification_matrix:
        rows = survival_by_game.get(str(game["game_id"]), [])
        alive = [row["player_or_team"] for row in rows if row["current_status"] in {"ALIVE", "NEEDS_FINAL_CHECK", "CONDITIONAL"}]
        killed = [row["player_or_team"] for row in rows if row["current_status"] == "KILLED"]
        lines.extend(
            [
                f"### {game['away_team']}@{game['home_team']}",
                "",
                f"- Current state: {game['game_status'] or 'NA'} at {game['game_time'] or 'NA'}.",
                f"- Starter verification: {_status(game['starters_confirmed'])}.",
                f"- Lineup verification: {_status(game['lineups_confirmed'])}.",
                f"- Weather/roof note: weather={_status(game['weather_verified'])}; roof={_status(game['roof_status_verified'])}.",
                f"- Market/player prop note: game markets={_status(game['odds_verified'])}; player props={_status(game['player_props_verified'])}.",
                f"- Injury/news note: {_status(game['news_checked'])}.",
                f"- Watchlist candidates that survive: {', '.join(str(item) for item in alive) if alive else 'none'}",
                f"- Watchlist candidates killed: {', '.join(str(item) for item in killed) if killed else 'none'}",
                f"- Unresolved gaps: {game['missing_gates'] or 'none'}",
                "- What to check before final card: official lineup, starter, weather/roof, exact market price, player-prop availability, and current news.",
                "",
            ]
        )

    close_games = [f"{row['away_team']}@{row['home_team']}" for row in result.verification_matrix if row["verification_completeness"] in {"HIGH", "MEDIUM"}]
    uncertain_games = [f"{row['away_team']}@{row['home_team']}" for row in result.verification_matrix if row["verification_completeness"] in {"LOW", "INCOMPLETE"}]
    props_needed = [row["player_or_team"] for row in result.watchlist_survival if "PLAYER_PROP_AVAILABLE" in str(row.get("missing_gates", ""))]
    lineup_needed = [row["player_or_team"] for row in result.watchlist_survival if "PLAYER_IN_LINEUP" in str(row.get("missing_gates", "")) or "LINEUPS_CONFIRMED" in str(row.get("missing_gates", ""))]
    lines.extend(
        [
            "## Final Operator Checklist",
            "",
            "- What Christian should check next: unresolved official lineups, starter changes, roof/weather context, current odds, exact player prop availability, and late injury/news alerts.",
            f"- Games close to final-card review: {', '.join(close_games) if close_games else 'none'}",
            f"- Games too uncertain: {', '.join(uncertain_games) if uncertain_games else 'none'}",
            f"- Props needing prices: {', '.join(props_needed[:25]) if props_needed else 'none'}",
            f"- Players needing lineup confirmation: {', '.join(lineup_needed[:25]) if lineup_needed else 'none'}",
        ]
    )
    return "\n".join(lines).rstrip() + "\n"


def _read_watchlists(paths: AgentPaths) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for path in [paths.hr_watchlist_csv, paths.total_bases_watchlist_csv, paths.hits_watchlist_csv, paths.game_line_leans_csv]:
        if path.exists():
            rows.extend(_read_csv(path))
    return rows


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return [dict(row) for row in csv.DictReader(handle)]


def _write_csv(path: Path, fieldnames: list[str], rows: Iterable[object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            payload = row if isinstance(row, dict) else _object_payload(row, fieldnames)
            writer.writerow({field: clean_csv_value(payload.get(field, "")) for field in fieldnames})


def _object_payload(row: object, fieldnames: list[str]) -> dict[str, object]:
    if isinstance(row, dict):
        return {field: row.get(field, "") for field in fieldnames}
    if hasattr(row, "__dataclass_fields__"):
        return dataclass_row(row, fieldnames)
    raw = getattr(row, "__dict__", {})
    return {field: raw.get(field, "") for field in fieldnames}


def _record_lineup_and_starter_status(
    tracker: SourceTracker,
    lineup_rows: list[dict[str, object]],
    starter_rows: list[dict[str, object]],
) -> None:
    confirmed_lineup_teams = {f"{row.get('game_id')}:{row.get('team')}" for row in lineup_rows if _truthy(row.get("confirmed_lineup_available"))}
    unposted_lineup_teams = {f"{row.get('game_id')}:{row.get('team')}" for row in lineup_rows if not _truthy(row.get("confirmed_lineup_available"))}
    if confirmed_lineup_teams:
        tracker.record_result(
            SourceResult(
                source_name="MLB Stats API",
                endpoint="schedule hydrate=lineups",
                success=True,
                retrieved_at=tracker.now(),
                record_count=len(confirmed_lineup_teams),
                notes="LINEUPS_CONFIRMED",
            )
        )
    if unposted_lineup_teams:
        tracker.record_result(
            SourceResult(
                source_name="MLB Stats API",
                endpoint="schedule hydrate=lineups + game feed",
                success=False,
                retrieved_at=tracker.now(),
                record_count=len(unposted_lineup_teams),
                notes="LINEUPS_NOT_POSTED",
                error_summary="LINEUPS_NOT_POSTED",
            )
        )
        tracker.record_gap(
            missing_source="LINEUPS_NOT_POSTED",
            affected_artifact="04_pregame_refresh/lineup_verification.csv",
            affected_games_players=", ".join(sorted(unposted_lineup_teams)),
            severity="MEDIUM",
            recommended_fix="Refresh closer to first pitch or verify official posted lineups manually.",
            output_degraded=True,
        )

    confirmed_starters = [row for row in starter_rows if _truthy(row.get("sp_confirmed"))]
    tracker.record_result(
        SourceResult(
            source_name="MLB Stats API",
            endpoint="schedule hydrate=probablePitcher",
            success=bool(confirmed_starters),
            retrieved_at=tracker.now(),
            record_count=len(confirmed_starters),
            notes="STARTERS_CONFIRMED" if confirmed_starters else "STARTERS_NOT_CONFIRMED",
        )
    )
    changed = [row for row in starter_rows if _truthy(row.get("starter_changed"))]
    if changed:
        tracker.record_result(
            SourceResult(
                source_name="EchoIQ Pregame Refresh",
                endpoint="starter-change-detection",
                success=True,
                retrieved_at=tracker.now(),
                record_count=len(changed),
                notes="STARTER_CHANGE_DETECTED",
            )
        )


def _game_from_morning(row: dict[str, str]) -> dict[str, object]:
    return {
        "game_id": row.get("game_id", ""),
        "away_team": row.get("away_team", ""),
        "home_team": row.get("home_team", ""),
        "venue": row.get("venue", ""),
        "game_time": row.get("game_time", ""),
        "status": row.get("game_status", ""),
        "away_probable_sp": row.get("away_probable_sp", ""),
        "home_probable_sp": row.get("home_probable_sp", ""),
        "away_probable_sp_id": "",
        "home_probable_sp_id": "",
        "away_lineup_count": 0,
        "home_lineup_count": 0,
        "retrieved_at": row.get("retrieved_at", ""),
    }


def _slate_game_from_raw(slate_date: str, raw: dict[str, object]) -> SlateGame:
    lineup_status = "CONFIRMED" if int(raw.get("away_lineup_count") or 0) >= 9 and int(raw.get("home_lineup_count") or 0) >= 9 else "PARTIAL" if int(raw.get("away_lineup_count") or 0) >= 9 or int(raw.get("home_lineup_count") or 0) >= 9 else "UNVERIFIED"
    return SlateGame(
        slate_date=slate_date,
        game_id=str(raw.get("game_id", "")),
        away_team=str(raw.get("away_team", "")),
        home_team=str(raw.get("home_team", "")),
        venue=str(raw.get("venue", "")),
        game_time=str(raw.get("game_time", "")),
        game_status=str(raw.get("status", "")),
        away_probable_sp=str(raw.get("away_probable_sp", "")),
        home_probable_sp=str(raw.get("home_probable_sp", "")),
        away_probable_sp_id=str(raw.get("away_probable_sp_id", "")),
        home_probable_sp_id=str(raw.get("home_probable_sp_id", "")),
        probable_sp_confidence="MEDIUM" if raw.get("away_probable_sp") and raw.get("home_probable_sp") else "LOW_TO_MEDIUM",
        lineup_status=lineup_status,
        weather_status="UNVERIFIED",
        odds_status="UNVERIFIED",
        data_completeness="MEDIUM" if raw.get("away_probable_sp") and raw.get("home_probable_sp") else "LOW",
        source="MLB Stats API schedule" if raw.get("retrieved_at") else "morning_artifact",
        retrieved_at=str(raw.get("retrieved_at", "")),
    )


def _game_row_from_slate(game: SlateGame) -> dict[str, object]:
    return {
        "slate_date": game.slate_date,
        "game_id": game.game_id,
        "away_team": game.away_team,
        "home_team": game.home_team,
        "venue": game.venue,
        "game_time": game.game_time,
        "game_status": game.game_status,
        "retrieved_at": game.retrieved_at,
    }


def _lineup_player_rows_from_schedule_payload(slate_date: str, payload: dict[str, object]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for date_block in payload.get("dates", []) or []:
        for game in date_block.get("games", []) or []:
            game_id = str(game.get("gamePk") or "")
            teams = game.get("teams") or {}
            lineups = game.get("lineups") or {}
            for side, key in [("away", "awayPlayers"), ("home", "homePlayers")]:
                team = _team_code(((teams.get(side) or {}).get("team") or {}))
                players = lineups.get(key) or []
                if not players:
                    continue
                for index, player in enumerate(players, start=1):
                    player_payload = player if isinstance(player, dict) else {"id": player}
                    rows.append(
                        {
                            "slate_date": slate_date,
                            "game_id": game_id,
                            "team": team,
                            "lineup_status": "CONFIRMED",
                            "confirmed_lineup_available": True,
                            "player_name": _text(player_payload, "fullName", "full_name", "name"),
                            "player_id": _text(player_payload, "id", "personId", "playerId"),
                            "lineup_slot": _text(player_payload, "battingOrder", "batting_order") or str(index),
                            "position": _position(player_payload),
                            "is_starting": True,
                            "scratch_flag": False,
                            "source": "MLB Stats API schedule hydrate=lineups",
                            "retrieved_at": "",
                        }
                    )
    return rows


def _lineup_player_rows_from_game_feed(
    *,
    slate_date: str,
    game: dict[str, object],
    payload: dict[str, object],
    retrieved_at: str,
) -> list[dict[str, object]]:
    boxscore = ((payload.get("liveData") or {}).get("boxscore") or {})
    teams = boxscore.get("teams") or {}
    out: list[dict[str, object]] = []
    for side in ["away", "home"]:
        team_payload = teams.get(side) or {}
        team = normalize_team_code(_team_code(team_payload.get("team") or {}) or game.get(f"{side}_team", ""))
        batting_order = [str(item) for item in (team_payload.get("battingOrder") or []) if str(item)]
        players = team_payload.get("players") or {}
        if len(batting_order) < 9:
            continue
        for index, player_id in enumerate(batting_order[:9], start=1):
            player_payload = players.get(f"ID{player_id}") or players.get(player_id) or {}
            person = player_payload.get("person") if isinstance(player_payload.get("person"), dict) else {}
            out.append(
                {
                    "slate_date": slate_date,
                    "game_id": str(game.get("game_id", "")),
                    "team": team,
                    "lineup_status": "CONFIRMED",
                    "confirmed_lineup_available": True,
                    "player_name": _text(player_payload, "fullName", "full_name", "name") or _text(person, "fullName", "full_name", "name"),
                    "player_id": _text(player_payload, "id", "personId", "playerId") or _text(person, "id", "personId", "playerId") or player_id,
                    "lineup_slot": _lineup_slot(player_payload, index),
                    "position": _position(player_payload),
                    "is_starting": True,
                    "scratch_flag": False,
                    "source": "MLB Stats API live feed",
                    "retrieved_at": retrieved_at,
                }
            )
    return out


def _dedupe_confirmed_lineup_rows(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    by_team: dict[tuple[str, str], list[dict[str, object]]] = defaultdict(list)
    for row in rows:
        by_team[(str(row.get("game_id", "")), str(row.get("team", "")))].append(row)
    out: list[dict[str, object]] = []
    for group in by_team.values():
        live = [row for row in group if row.get("source") == "MLB Stats API live feed"]
        chosen = live or group
        seen_ids: set[str] = set()
        for row in chosen:
            key = str(row.get("player_id") or normalize_player_name(row.get("player_name", "")))
            if key in seen_ids:
                continue
            seen_ids.add(key)
            out.append(row)
    return out


def _lineup_slot(player_payload: dict[str, object], fallback: int) -> str:
    raw = _text(player_payload, "battingOrder", "batting_order")
    if raw and raw.isdigit() and len(raw) > 1:
        return str(int(raw) // 100)
    return raw or str(fallback)


def _weather_risk(row: dict[str, str], verified: bool) -> str:
    if not verified:
        return "UNVERIFIED"
    text = " ".join(str(row.get(field, "")) for field in ["precipitation_risk", "run_environment_note", "hr_environment_note"]).lower()
    if any(token in text for token in ["delay", "rain", "storm", "wind risk", "high"]):
        return "RISK"
    return "LOW"


def _market_snapshot_from_morning(rows: list[dict[str, str]]) -> list[object]:
    return [_SimpleRow(**row) for row in rows]


def _news_from_morning(rows: list[dict[str, str]], slate_games: list[SlateGame]) -> list[object]:
    return [_SimpleRow(**row) for row in rows]


class _SimpleRow:
    def __init__(self, **kwargs: object) -> None:
        self.__dict__.update(kwargs)


def _group(rows: list[dict[str, object]], field: str) -> dict[str, list[dict[str, object]]]:
    grouped: dict[str, list[dict[str, object]]] = defaultdict(list)
    for row in rows:
        grouped[str(row.get(field, ""))].append(row)
    return grouped


def _game_lineups_confirmed(rows: list[dict[str, object]], game: dict[str, object]) -> bool:
    teams = {str(game.get("away_team", "")), str(game.get("home_team", ""))}
    confirmed = {str(row.get("team", "")) for row in rows if _truthy(row.get("confirmed_lineup_available"))}
    return bool(teams) and teams.issubset(confirmed)


def _lineup_lookup(rows: list[dict[str, object]]) -> dict[tuple[str, str, str], dict[str, object]]:
    return {(normalize_player_name(row.get("player_name", "")), str(row.get("team", "")), str(row.get("game_id", ""))): row for row in rows if row.get("player_name")}


def _player_lookup(rows: list[dict[str, object]]) -> dict[tuple[str, str], dict[str, object]]:
    return {
        (str(row.get("game_id", "")), normalize_player_name(row.get("player_name", ""))): row
        for row in rows
        if row.get("player_name")
    }


def _market_lookup(rows: list[dict[str, object]]) -> dict[tuple[str, str, str], dict[str, object]]:
    lookup = {}
    for row in rows:
        key = (str(row.get("game_id", "")), _norm(str(row.get("player_or_team", ""))), _watchlist_market_name(str(row.get("market", ""))))
        lookup[key] = row
    return lookup


def _watchlist_market_name(market: str) -> str:
    value = market.lower()
    if "home" in value:
        return "HR"
    if "total_base" in value or "total bases" in value:
        return "2+ TB"
    if "hit" in value:
        return "Hit"
    if "moneyline" in value or "spread" in value or "total" in value:
        return "Game line"
    return market


def _news_risk_by_player(rows: list[dict[str, object]]) -> dict[tuple[str, str], str]:
    out = defaultdict(lambda: "UNVERIFIED")
    for row in rows:
        key = (normalize_player_name(row.get("player_name", "")), str(row.get("team", "")))
        if str(row.get("lineup_impact", "")).upper() == "RISK":
            out[key] = "RISK"
        elif str(row.get("lineup_impact", "")).upper() == "CONDITIONAL" and out[key] != "RISK":
            out[key] = "CONDITIONAL"
        elif key not in out:
            out[key] = "CHECKED"
    return out


def _replace_rows_by_game(base_rows: list[dict[str, object]], manual_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    manual_games = {str(row.get("game_id", "")) for row in manual_rows if row.get("game_id")}
    return [row for row in base_rows if str(row.get("game_id", "")) not in manual_games] + manual_rows


def _replace_market_rows(base_rows: list[dict[str, object]], manual_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    manual_keys = {
        (
            str(row.get("game_id", "")),
            str(row.get("market_type", "")),
            str(row.get("market", "")),
            _norm(str(row.get("player_or_team", ""))),
            str(row.get("team", "")),
        )
        for row in manual_rows
    }
    return [
        row
        for row in base_rows
        if (
            str(row.get("game_id", "")),
            str(row.get("market_type", "")),
            str(row.get("market", "")),
            _norm(str(row.get("player_or_team", ""))),
            str(row.get("team", "")),
        )
        not in manual_keys
    ] + manual_rows


def _replace_prop_rows(base_rows: list[dict[str, object]], manual_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    manual_keys = {
        (
            str(row.get("game_id", "")),
            normalize_player_name(row.get("player_name", "")),
            str(row.get("market", "")),
        )
        for row in manual_rows
    }
    return [
        row
        for row in base_rows
        if (
            str(row.get("game_id", "")),
            normalize_player_name(row.get("player_name", "")),
            str(row.get("market", "")),
        )
        not in manual_keys
    ] + manual_rows


def _replace_news_rows(base_rows: list[dict[str, object]], manual_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    manual_keys = {
        (
            str(row.get("game_id", "")),
            normalize_player_name(row.get("player_name", "")),
            str(row.get("team", "")),
            str(row.get("news_type", "")),
            str(row.get("status", "")),
        )
        for row in manual_rows
    }
    return [
        row
        for row in base_rows
        if (
            str(row.get("game_id", "")),
            normalize_player_name(row.get("player_name", "")),
            str(row.get("team", "")),
            str(row.get("news_type", "")),
            str(row.get("status", "")),
        )
        not in manual_keys
    ] + manual_rows


def _record_market_mapping_gaps(market_rows: list[dict[str, object]], tracker: SourceTracker) -> None:
    unmapped_events = sorted({
        str(row.get("player_or_team", "") or row.get("market", ""))
        for row in market_rows
        if "@" in str(row.get("game_id", ""))
    })
    for event in unmapped_events:
        tracker.record_gap(
            missing_source="EVENT_ID_MAPPING_MISSING",
            affected_artifact="04_pregame_refresh/market_refresh.csv",
            affected_games_players=event,
            severity="MEDIUM",
            recommended_fix="Add source team aliases or provider event IDs so odds rows map to MLB Stats API gamePk.",
            output_degraded=True,
        )
    prop_unmapped = sorted({
        str(row.get("player_or_team", ""))
        for row in market_rows
        if "@" in str(row.get("game_id", "")) and row.get("market_type") not in {"moneyline", "spread", "total"}
    })
    for player in prop_unmapped:
        tracker.record_gap(
            missing_source="PLAYER_PROP_EVENT_MAPPING_MISSING",
            affected_artifact="04_pregame_refresh/player_prop_availability.csv",
            affected_games_players=player or "unknown_player",
            severity="MEDIUM",
            recommended_fix="Map provider prop event/team IDs to the MLB game before using prop availability in gates.",
            output_degraded=True,
        )


def _source_summary_for_game(gid: str, *row_groups: list[dict[str, object]]) -> str:
    sources = sorted({str(row.get("source", "")) for rows in row_groups for row in rows if str(row.get("game_id", "")) == gid and row.get("source")})
    return "; ".join(sources) if sources else "No source rows available."


def _data_completeness(rows: list[dict[str, object]]) -> str:
    if not rows:
        return "INCOMPLETE"
    counts = Counter(str(row.get("verification_completeness", "INCOMPLETE")) for row in rows)
    if counts.get("HIGH", 0) == len(rows):
        return "HIGH"
    if counts.get("HIGH", 0) + counts.get("MEDIUM", 0) >= max(1, len(rows) // 2):
        return "MEDIUM"
    return "LOW"


def _combined_text(row: dict[str, str]) -> str:
    return " ".join(str(row.get(field, "")) for field in ["signal_type", "reason", "supporting_factors", "risk_flags", "data_gaps", "verification_gates_missing"])


def _truthy(value: object) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def _norm(value: str) -> str:
    return " ".join(str(value or "").lower().split())


def _status(value: object) -> str:
    return "confirmed" if _truthy(value) else "unverified"


def _yes_no(value: object) -> str:
    return "yes" if _truthy(value) else "no"


def _team_code(team: dict[str, object]) -> str:
    return str(team.get("abbreviation") or team.get("teamCode") or team.get("fileCode") or team.get("name") or "")


def _text(payload: dict[str, object], *keys: str) -> str:
    for key in keys:
        value = payload.get(key)
        if value not in (None, ""):
            return str(value)
    person = payload.get("person")
    if isinstance(person, dict):
        for key in keys:
            value = person.get(key)
            if value not in (None, ""):
                return str(value)
    return ""


def _position(payload: dict[str, object]) -> str:
    for key in ["position", "primaryPosition"]:
        value = payload.get(key)
        if isinstance(value, dict):
            return _text(value, "abbreviation", "code", "name")
        if value:
            return str(value)
    return ""
