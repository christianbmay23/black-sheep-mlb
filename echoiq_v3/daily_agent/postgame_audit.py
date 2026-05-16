"""Previous-day postgame audit generation for EchoIQ Night Shift."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .bullpen_tracker import build_bullpen_fatigue
from .data_sources import NightShiftDataSources
from .mlb_stats_client import is_final_status, winner_from_scores
from .player_form import hitter_signal_summary, pitcher_signal_summary
from .prediction_grader import grade_prior_predictions
from .schemas import BullpenFatigue, GameResult, PitcherUsage, PlayerPerformance, SourceResult
from .statcast_client import NightShiftStatcastClient
from .statcast_enrichment import StatcastDailySummary, build_match_diagnostics, enrich_pitcher_usage, enrich_player_performance


@dataclass
class PostgameAuditResult:
    date: str
    generated_at: str
    game_results: list[GameResult]
    player_performance: list[PlayerPerformance]
    pitcher_usage: list[PitcherUsage]
    bullpen_fatigue: list[BullpenFatigue]
    model_grading: dict[str, Any]
    hitter_signals: dict[str, list[str]]
    pitcher_signals: dict[str, list[str]]
    statcast_summary: StatcastDailySummary
    data_completeness: str


def run_postgame_audit(
    *,
    postgame_date: str,
    repo_root: Path,
    data_sources: NightShiftDataSources,
    force_refresh: bool = False,
) -> PostgameAuditResult:
    schedule = data_sources.fetch_schedule(postgame_date, affected_artifact="01_postgame_audit/game_results.csv")
    game_results: list[GameResult] = []
    player_rows: list[PlayerPerformance] = []
    pitcher_rows: list[PitcherUsage] = []

    for game in schedule.games:
        winner = winner_from_scores(game["away_team"], game["home_team"], game["away_score"], game["home_score"])
        game_results.append(
            GameResult(
                game_id=game["game_id"],
                date=postgame_date,
                away_team=game["away_team"],
                home_team=game["home_team"],
                away_score=game["away_score"],
                home_score=game["home_score"],
                winner=winner if is_final_status(game["status"]) else "",
                status=game["status"],
                venue=game["venue"],
                game_start_time=game["game_time"],
                source="MLB Stats API schedule",
                retrieved_at=schedule.retrieved_at,
            )
        )
        boxscore = data_sources.fetch_boxscore(game["game_id"], affected_artifact="01_postgame_audit/player_performance.csv")
        if boxscore is None:
            continue
        player_rows.extend(_parse_player_performance(game, boxscore, postgame_date, schedule.retrieved_at))
        pitcher_rows.extend(_parse_pitcher_usage(game, boxscore, postgame_date, schedule.retrieved_at))

    statcast_summary = NightShiftStatcastClient(cache_dir="data/cache/pybaseball").fetch_daily_summary(
        date_str=postgame_date,
        tracker=data_sources.tracker,
        offline=data_sources.offline,
        force_refresh=force_refresh,
    )
    enrich_player_performance(player_rows, statcast_summary)
    enrich_pitcher_usage(pitcher_rows, statcast_summary)
    _record_statcast_match_diagnostics(data_sources, player_rows, pitcher_rows, statcast_summary)

    bullpen_rows = build_bullpen_fatigue(postgame_date, pitcher_rows, retrieved_at=schedule.retrieved_at)
    generated_at = data_sources.tracker.now()
    model_grading = grade_prior_predictions(
        repo_root=repo_root,
        postgame_date=postgame_date,
        game_results=game_results,
        player_performance=player_rows,
        generated_at=generated_at,
    )

    return PostgameAuditResult(
        date=postgame_date,
        generated_at=generated_at,
        game_results=game_results,
        player_performance=player_rows,
        pitcher_usage=pitcher_rows,
        bullpen_fatigue=bullpen_rows,
        model_grading=model_grading,
        hitter_signals=hitter_signal_summary(player_rows),
        pitcher_signals=pitcher_signal_summary(pitcher_rows),
        statcast_summary=statcast_summary,
        data_completeness=_postgame_completeness(game_results, player_rows),
    )


def _parse_player_performance(
    game: dict[str, Any],
    boxscore: dict[str, Any],
    date_str: str,
    retrieved_at: str,
) -> list[PlayerPerformance]:
    rows: list[PlayerPerformance] = []
    teams = boxscore.get("teams") or {}
    sides = {
        "away": (game["away_team"], game["home_team"]),
        "home": (game["home_team"], game["away_team"]),
    }
    for side, (team, opponent) in sides.items():
        team_block = teams.get(side) or {}
        for player in (team_block.get("players") or {}).values():
            stats = ((player.get("stats") or {}).get("batting") or {})
            if not stats:
                continue
            person = player.get("person") or {}
            rows.append(
                PlayerPerformance(
                    game_id=game["game_id"],
                    date=date_str,
                    player_id=str(person.get("id") or ""),
                    player_name=str(person.get("fullName") or ""),
                    team=team,
                    opponent=opponent,
                    batting_order=_batting_order(player.get("battingOrder")),
                    position=str((player.get("position") or {}).get("abbreviation") or ""),
                    at_bats=_int(stats.get("atBats")),
                    hits=_int(stats.get("hits")),
                    total_bases=_int(stats.get("totalBases")),
                    home_runs=_int(stats.get("homeRuns")),
                    runs=_int(stats.get("runs")),
                    rbi=_int(stats.get("rbi")),
                    walks=_int(stats.get("baseOnBalls")),
                    strikeouts=_int(stats.get("strikeOuts")),
                    doubles=_int(stats.get("doubles")),
                    triples=_int(stats.get("triples")),
                    stolen_bases=_int(stats.get("stolenBases")),
                    exit_velocity_avg=None,
                    exit_velocity_max=None,
                    launch_angle_avg=None,
                    hard_hit_count=None,
                    hard_hit_rate=None,
                    barrel_count=None,
                    barrel_rate=None,
                    sweet_spot_count=None,
                    sweet_spot_rate=None,
                    xba=None,
                    xslg=None,
                    xwoba=None,
                    estimated_hr_distance_max=None,
                    batted_ball_events=None,
                    pulled_air_contact_count=None,
                    opposite_field_contact_count=None,
                    statcast_signal_tags="INSUFFICIENT_STATCAST_DATA",
                    statcast_signal_note="Statcast enrichment pending.",
                    statcast_data_status="pending",
                    notes="Boxscore row awaiting Statcast quality-of-contact enrichment.",
                    source="MLB Stats API boxscore",
                    retrieved_at=retrieved_at,
                )
            )
    return rows


def _parse_pitcher_usage(
    game: dict[str, Any],
    boxscore: dict[str, Any],
    date_str: str,
    retrieved_at: str,
) -> list[PitcherUsage]:
    rows: list[PitcherUsage] = []
    teams = boxscore.get("teams") or {}
    sides = {
        "away": (game["away_team"], game["home_team"]),
        "home": (game["home_team"], game["away_team"]),
    }
    for side, (team, opponent) in sides.items():
        team_block = teams.get(side) or {}
        pitcher_ids = [str(value) for value in (team_block.get("pitchers") or [])]
        starter_id = pitcher_ids[0] if pitcher_ids else ""
        for player in (team_block.get("players") or {}).values():
            stats = ((player.get("stats") or {}).get("pitching") or {})
            if not stats:
                continue
            person = player.get("person") or {}
            pitcher_id = str(person.get("id") or "")
            innings = str(stats.get("inningsPitched") or "")
            pitches = _int(stats.get("numberOfPitches"))
            rows.append(
                PitcherUsage(
                    game_id=game["game_id"],
                    date=date_str,
                    pitcher_id=pitcher_id,
                    pitcher_name=str(person.get("fullName") or ""),
                    team=team,
                    opponent=opponent,
                    starter_or_reliever="starter" if pitcher_id == starter_id else "reliever",
                    innings_pitched=innings,
                    pitches=pitches,
                    batters_faced=_int(stats.get("battersFaced")),
                    hits_allowed=_int(stats.get("hits")),
                    earned_runs=_int(stats.get("earnedRuns")),
                    walks=_int(stats.get("baseOnBalls")),
                    strikeouts=_int(stats.get("strikeOuts")),
                    home_runs_allowed=_int(stats.get("homeRuns")),
                    velocity_note="not_available_v1",
                    workload_note=_workload_note(innings, pitches),
                    avg_exit_velocity_allowed=None,
                    max_exit_velocity_allowed=None,
                    hard_hit_allowed=None,
                    barrels_allowed=None,
                    xba_allowed=None,
                    xslg_allowed=None,
                    xwoba_allowed=None,
                    whiff_rate=None,
                    called_strike_whiff_rate=None,
                    pitch_mix_note="pending_statcast",
                    contact_quality_allowed_note="Statcast enrichment pending.",
                    statcast_signal_tags="INSUFFICIENT_STATCAST_DATA",
                    statcast_data_status="pending",
                    source="MLB Stats API boxscore",
                    retrieved_at=retrieved_at,
                )
            )
    return rows


def _batting_order(value: object) -> str:
    if value is None:
        return ""
    text = str(value)
    if len(text) >= 3 and text.isdigit():
        return str(int(text) // 100)
    return text


def _int(value: object) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _workload_note(innings: str, pitches: int | None) -> str:
    if pitches is None:
        return "pitch_count_unavailable"
    if pitches >= 100:
        return "heavy_starter_workload" if innings else "heavy_workload"
    if pitches >= 30:
        return "notable_reliever_workload"
    return "normal_boxscore_workload"


def _postgame_completeness(games: list[GameResult], players: list[PlayerPerformance]) -> str:
    if not games:
        return "INCOMPLETE"
    finals = [game for game in games if is_final_status(game.status)]
    if not finals:
        return "LOW"
    if players:
        return "MEDIUM"
    return "LOW"


def _record_statcast_match_diagnostics(
    data_sources: NightShiftDataSources,
    players: list[PlayerPerformance],
    pitchers: list[PitcherUsage],
    summary: StatcastDailySummary,
) -> None:
    diagnostics = build_match_diagnostics(players, pitchers, summary)
    notes = (
        f"{diagnostics.status_classification}: hitter_rows={diagnostics.player_performance_rows}, "
        f"hitter_rows_with_id={diagnostics.player_rows_with_id}, matched_batter_ids={diagnostics.matched_batter_ids}, "
        f"unmatched_hitter_rows={diagnostics.unmatched_batter_rows}, pitcher_rows={diagnostics.pitcher_usage_rows}, "
        f"pitcher_rows_with_id={diagnostics.pitcher_rows_with_id}, matched_pitcher_ids={diagnostics.matched_pitcher_ids}, "
        f"unmatched_pitcher_rows={diagnostics.unmatched_pitcher_rows}."
    )
    data_sources.tracker.record_result(
        SourceResult(
            source_name="Statcast player ID match diagnostics",
            endpoint="MLB Stats API player_id vs Statcast batter/pitcher ids",
            success=diagnostics.status_classification in {"PLAYER_ID_MATCH_OK", "PARTIAL_PLAYER_ID_MATCH", "STATCAST_UNAVAILABLE"},
            retrieved_at=data_sources.tracker.now(),
            record_count=diagnostics.matched_batter_ids + diagnostics.matched_pitcher_ids,
            notes=notes,
            error_summary="" if diagnostics.status_classification != "PLAYER_ID_MAPPING_MISS" else "PLAYER_ID_MAPPING_MISS",
        )
    )
    if diagnostics.status_classification == "PLAYER_ID_MAPPING_MISS":
        data_sources.tracker.record_gap(
            missing_source="Statcast player ID mapping",
            affected_artifact="01_postgame_audit/player_performance.csv, 01_postgame_audit/pitcher_usage.csv",
            affected_games_players=", ".join(diagnostics.sample_unmatched_batters + diagnostics.sample_unmatched_pitchers) or "all",
            severity="HIGH",
            recommended_fix="Verify MLBAM ID compatibility between MLB Stats API boxscores and Statcast batter/pitcher ids before relying on enrichment.",
            output_degraded=True,
        )
