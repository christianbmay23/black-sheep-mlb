"""EchoIQ postgame learning engine.

This module grades research/watchlist signals against final boxscore artifacts.
It writes learning artifacts only; it does not create official bets or EV rows.
"""

from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from .config import AgentPaths
from .data_sources import NightShiftDataSources
from .postgame_audit import run_postgame_audit
from .schemas import DailyAgentRunResult, FINAL_ECHOIQ_PREDICTIONS_FIELDS, GameResult, PitcherUsage, PlayerPerformance, clean_csv_value


PROCESS_LABELS = {
    "CORRECT_PROCESS_GOOD_RESULT",
    "CORRECT_PROCESS_BAD_RESULT",
    "BAD_PROCESS_GOOD_RESULT",
    "BAD_PROCESS_BAD_RESULT",
    "MIXED_PROCESS_BAD_RESULT",
    "RIGHT_TEAM_WRONG_PLAYER",
    "RIGHT_PLAYER_WRONG_PROP_SUBTYPE",
    "HIDDEN_SUPPORTING_CAST_WINNER",
    "STALE_ASSUMPTION",
    "INCONCLUSIVE",
}

PREDICTION_GRADES_FIELDS = [
    "slate_date",
    "prediction_id",
    "prediction_source_file",
    "prediction_source",
    "prediction_phase",
    "prediction_type",
    "player_name",
    "team",
    "opponent",
    "game",
    "lineup_slot",
    "pregame_tier",
    "pregame_reason",
    "pick",
    "signal_tags",
    "final_result_hit",
    "actual_ab",
    "actual_h",
    "actual_2b",
    "actual_3b",
    "actual_hr",
    "actual_tb",
    "actual_rbi",
    "actual_r",
    "actual_bb",
    "actual_k",
    "team_final_score",
    "opponent_final_score",
    "game_lean_result",
    "process_label",
    "result_label",
    "miss_reason",
    "model_lesson",
    "confidence_after_review",
    "notes",
]

GAME_GRADES_FIELDS = [
    "slate_date",
    "game",
    "pregame_lean",
    "final_score",
    "lean_result",
    "process_grade",
    "result_grade",
    "team_environment_validated",
    "bullpen_thesis_validated",
    "pitcher_vulnerability_validated",
    "lineup_depth_validated",
    "hidden_winners",
    "major_misses",
    "model_lesson",
]

HIDDEN_WINNERS_FIELDS = [
    "player_name",
    "team",
    "game",
    "lineup_slot",
    "actual_h",
    "actual_hr",
    "actual_tb",
    "prediction_context_team_had_missed_star",
    "missed_star_players",
    "hidden_winner_lineup_band",
    "hidden_winner_result_type",
    "same_team_environment_validated",
    "supporting_cast_reason",
    "future_search_rule",
    "why_hidden",
    "missed_signal_type",
    "future_rule",
]

WATCHLIST_SOURCES = [
    ("hr_watchlist.csv", "HR"),
    ("total_bases_watchlist.csv", "TB"),
    ("hits_watchlist.csv", "HIT"),
    ("game_line_leans.csv", "GAME_LEAN"),
]

OFFICIAL_BET_WORDS = {"BET", "LOCK", "GUARANTEED", "MAX", "FREE MONEY"}


@dataclass
class LearningPrediction:
    prediction_id: str
    source_file: str
    prediction_type: str
    player_name: str
    team: str
    opponent: str
    game_id: str
    game: str
    market: str
    signal_type: str
    confidence: str
    pregame_tier: str
    pregame_reason: str
    supporting_factors: str
    risk_flags: str
    data_gaps: str
    current_status: str = ""
    lineup_slot: str = ""
    prediction_source: str = "repo_generated_watchlist"
    prediction_phase: str = "repo_generated_watchlist"
    pick: str = ""
    signal_tags: str = ""
    notes: str = ""


@dataclass
class LearningInputs:
    predictions: list[LearningPrediction]
    games: list[GameResult]
    players: list[PlayerPerformance]
    pitchers: list[PitcherUsage]
    gaps: list[str]


def run_postgame_learning_mode(
    *,
    paths: AgentPaths,
    slate_date: str,
    repo_root: Path,
    data_sources: NightShiftDataSources | None,
    dry_run: bool,
    offline: bool,
    force_refresh: bool,
) -> DailyAgentRunResult:
    planned = [
        paths.prediction_grades_csv,
        paths.game_grades_csv,
        paths.hidden_winners_csv,
        paths.signal_performance_json,
        paths.postgame_learning_report,
        paths.next_slate_prompt_rules,
    ]
    if dry_run:
        return DailyAgentRunResult(
            slate_date=slate_date,
            postgame_date=slate_date,
            output_dir=str(paths.slate_dir),
            dry_run=True,
            only="postgame-learning",
            files_written=[str(path) for path in planned],
            warnings=["Dry run: no files were written and no external sources were called."],
            summary=_empty_summary(),
        )

    inputs = _load_learning_inputs(
        paths=paths,
        slate_date=slate_date,
        repo_root=repo_root,
        data_sources=data_sources,
        offline=offline,
        force_refresh=force_refresh,
    )
    prediction_grades = _grade_predictions(inputs)
    hidden_winners = _detect_hidden_winners(inputs, prediction_grades)
    hidden_prediction_rows = _hidden_winner_prediction_rows(slate_date, hidden_winners)
    prediction_grades.extend(hidden_prediction_rows)
    game_grades = _grade_games(slate_date, inputs, prediction_grades, hidden_winners)
    signal_performance = _signal_performance(inputs, prediction_grades, game_grades, hidden_winners)
    report = _learning_report(slate_date, prediction_grades, game_grades, hidden_winners, signal_performance, inputs.gaps)
    rules = _next_slate_rules(signal_performance, hidden_winners, inputs.gaps)

    paths.postgame_learning_dir.mkdir(parents=True, exist_ok=True)
    _write_csv(paths.prediction_grades_csv, PREDICTION_GRADES_FIELDS, prediction_grades)
    _write_csv(paths.game_grades_csv, GAME_GRADES_FIELDS, game_grades)
    _write_csv(paths.hidden_winners_csv, HIDDEN_WINNERS_FIELDS, hidden_winners)
    _write_json(paths.signal_performance_json, signal_performance)
    paths.postgame_learning_report.write_text(report, encoding="utf-8")
    paths.next_slate_prompt_rules.write_text(rules, encoding="utf-8")

    return DailyAgentRunResult(
        slate_date=slate_date,
        postgame_date=slate_date,
        output_dir=str(paths.slate_dir),
        dry_run=False,
        only="postgame-learning",
        files_written=[str(path) for path in planned],
        warnings=inputs.gaps,
        summary=signal_performance["summary"],
    )


def _load_learning_inputs(
    *,
    paths: AgentPaths,
    slate_date: str,
    repo_root: Path,
    data_sources: NightShiftDataSources | None,
    offline: bool,
    force_refresh: bool,
) -> LearningInputs:
    gaps: list[str] = []
    predictions = _load_predictions(paths, slate_date, gaps)
    games, players, pitchers = _load_local_postgame_artifacts(paths, slate_date, gaps)
    if not games and not players and not offline and data_sources is not None:
        try:
            audit = run_postgame_audit(
                postgame_date=slate_date,
                repo_root=repo_root,
                data_sources=data_sources,
                force_refresh=force_refresh,
            )
            games = audit.game_results
            players = audit.player_performance
            pitchers = audit.pitcher_usage
        except Exception as exc:  # pragma: no cover - defensive live-source guard
            gaps.append(f"MLB_STATS_POSTGAME_FETCH_FAILED: {exc}")
    if not games:
        gaps.append("FINAL_GAME_RESULTS_MISSING: game_grades will be inconclusive.")
    if not players:
        gaps.append("FINAL_PLAYER_PERFORMANCE_MISSING: player predictions will be inconclusive.")
    if players:
        _resolve_prediction_teams_from_players(predictions, players)
    return LearningInputs(predictions=predictions, games=games, players=players, pitchers=pitchers, gaps=_dedupe(gaps))


def _load_predictions(paths: AgentPaths, slate_date: str, gaps: list[str]) -> list[LearningPrediction]:
    survival = _watchlist_survival(paths.watchlist_survival_csv)
    predictions: list[LearningPrediction] = []
    for filename, prediction_type in WATCHLIST_SOURCES:
        path = paths.watchlists_dir / filename
        rows = _read_csv(path, gaps, missing_ok=True)
        if not rows:
            if not path.exists():
                gaps.append(f"PREDICTION_ARTIFACT_MISSING: {path.relative_to(paths.slate_dir)}")
            continue
        for index, row in enumerate(rows, start=1):
            if not any(str(value or "").strip() for value in row.values()):
                continue
            player_name = _clean(row.get("player_name") or row.get("player") or row.get("player_or_team"))
            team = _clean(row.get("team"))
            opponent = _clean(row.get("opponent"))
            game_id = _clean(row.get("game_id"))
            market = _clean(row.get("market")) or prediction_type
            key = _survival_key(game_id, player_name or team, team, market)
            survival_row = survival.get(key, {})
            pregame_tier = _safe_tier(row.get("label") or row.get("confidence") or survival_row.get("prior_label") or "")
            predictions.append(
                LearningPrediction(
                    prediction_id=f"{Path(filename).stem}:{index}",
                    source_file=str(path),
                    prediction_type=prediction_type,
                    player_name=player_name,
                    team=team,
                    opponent=opponent,
                    game_id=game_id,
                    game=_game_label(team, opponent),
                    market=market,
                    signal_type=_clean(row.get("signal_type")),
                    confidence=_clean(row.get("confidence")),
                    pregame_tier=pregame_tier,
                    pregame_reason=_clean(row.get("reason")),
                    supporting_factors=_clean(row.get("supporting_factors")),
                    risk_flags=_clean(row.get("risk_flags")),
                    data_gaps=_clean(row.get("data_gaps")),
                    current_status=_clean(survival_row.get("current_status")),
                    lineup_slot=_clean(survival_row.get("lineup_slot")),
                    prediction_source="repo_generated_watchlist",
                    prediction_phase="repo_watchlist",
                    pick=_clean(row.get("market")) or prediction_type,
                    signal_tags=_clean(row.get("signal_type")),
                )
            )
    predictions.extend(_matchup_note_predictions(paths.matchup_notes_json, slate_date, gaps))
    predictions.extend(_final_echoiq_predictions(paths, slate_date, gaps))
    predictions = _dedupe_predictions(predictions, gaps)
    if not predictions:
        gaps.append("PREDICTION_ROWS_MISSING: no watchlist or matchup-note signals were available to grade.")
    return predictions


def _matchup_note_predictions(path: Path, slate_date: str, gaps: list[str]) -> list[LearningPrediction]:
    if not path.exists():
        gaps.append(f"MATCHUP_NOTES_MISSING: {path.name}")
        return []
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        gaps.append(f"MATCHUP_NOTES_UNREADABLE: {exc}")
        return []
    rows: list[LearningPrediction] = []
    for index, note in enumerate(payload.get("games") or [], start=1):
        game_id = _clean(note.get("game_id"))
        game = _clean(note.get("game"))
        for suffix, prediction_type, fields in [
            ("pitcher", "PITCHER_VULNERABILITY", ["sp_context", "hitter_matchup_context", "pitch_type_context"]),
            ("bullpen", "BULLPEN_CONTEXT", ["bullpen_context"]),
            ("environment", "TEAM_ENVIRONMENT", ["team_context", "weather_park_context"]),
        ]:
            parts: list[str] = []
            for field in fields:
                values = note.get(field) or []
                if isinstance(values, list):
                    parts.extend(str(value) for value in values if str(value).strip())
            if not parts:
                continue
            rows.append(
                LearningPrediction(
                    prediction_id=f"matchup_notes:{index}:{suffix}",
                    source_file=str(path),
                    prediction_type=prediction_type,
                    player_name="",
                    team="",
                    opponent="",
                    game_id=game_id,
                    game=game,
                    market=prediction_type,
                    signal_type=suffix,
                    confidence="RESEARCH_CONTEXT",
                    pregame_tier="WATCHLIST",
                    pregame_reason=" | ".join(parts[:4]),
                    supporting_factors="; ".join(parts),
                    risk_flags="",
                    data_gaps="",
                    prediction_source="repo_matchup_notes",
                    prediction_phase="repo_research_context",
                    pick=prediction_type,
                    signal_tags=suffix,
                )
            )
    return rows


def _final_echoiq_predictions(paths: AgentPaths, slate_date: str, gaps: list[str]) -> list[LearningPrediction]:
    path = paths.final_predictions_csv
    if not path.exists():
        return []
    rows = _read_csv(path, gaps, missing_ok=True)
    if not rows:
        gaps.append(f"FINAL_ECHOIQ_PREDICTIONS_EMPTY: {path.relative_to(paths.slate_dir)}")
        return []

    missing_fields = [field for field in FINAL_ECHOIQ_PREDICTIONS_FIELDS if field not in rows[0]]
    if missing_fields:
        gaps.append(f"FINAL_ECHOIQ_PREDICTIONS_SCHEMA_GAP: missing fields {','.join(missing_fields)}")

    game_lookup = _final_prediction_game_lookup(paths)
    predictions: list[LearningPrediction] = []
    for index, row in enumerate(rows, start=1):
        if not any(str(value or "").strip() for value in row.values()):
            continue
        row_date = _clean(row.get("slate_date"))
        if row_date and row_date != slate_date:
            gaps.append(f"FINAL_ECHOIQ_PREDICTION_DATE_MISMATCH: row {index} has slate_date={row_date}")
            continue
        prediction_type = _clean(row.get("prediction_type")).upper()
        if prediction_type not in {"HR", "TB", "HIT", "GAME_LEAN", "TEAM_ENVIRONMENT", "PITCHER_VULNERABILITY", "BULLPEN_CONTEXT"}:
            gaps.append(f"FINAL_ECHOIQ_PREDICTION_TYPE_UNSUPPORTED: row {index} prediction_type={prediction_type or 'blank'}")
            continue
        prediction_id = _clean(row.get("prediction_id")) or f"final_echoiq_predictions:{index}"
        game_label = _normal_game_label(_clean(row.get("game")))
        game_meta = game_lookup.get(game_label, {})
        team = _clean(row.get("team"))
        opponent = _clean(row.get("opponent"))
        if prediction_type == "GAME_LEAN" and not team:
            team = _lean_team(_clean(row.get("pick")))
        if not opponent and team and game_meta:
            opponent = _opponent_for_team(team, game_meta)
        predictions.append(
            LearningPrediction(
                prediction_id=prediction_id,
                source_file=str(path),
                prediction_type=prediction_type,
                player_name=_clean(row.get("player_name")),
                team=team,
                opponent=opponent,
                game_id=_clean(game_meta.get("game_id")),
                game=game_label,
                market=prediction_type,
                signal_type=_clean(row.get("signal_tags")) or _clean(row.get("prediction_phase")),
                confidence=_clean(row.get("confidence_tier")),
                pregame_tier=_safe_tier(row.get("confidence_tier") or row.get("prediction_phase") or ""),
                pregame_reason=_clean(row.get("primary_reason")),
                supporting_factors=_clean(row.get("secondary_reason")),
                risk_flags=_clean(row.get("risk_flag")),
                data_gaps="",
                current_status=_clean(row.get("prediction_phase")),
                lineup_slot=_clean(row.get("lineup_slot")),
                prediction_source=_clean(row.get("prediction_source")) or "final_echoiq_predictions",
                prediction_phase=_clean(row.get("prediction_phase")) or "final_chat_board",
                pick=_clean(row.get("pick")),
                signal_tags=_clean(row.get("signal_tags")),
                notes=_clean(row.get("notes")),
            )
        )
    if predictions and paths.final_prediction_parsing_gaps.exists():
        gaps.extend(_final_prediction_gap_lines(paths.final_prediction_parsing_gaps))
    return predictions


def _final_prediction_game_lookup(paths: AgentPaths) -> dict[str, dict[str, str]]:
    lookup: dict[str, dict[str, str]] = {}
    for path in [paths.verified_slate_csv, paths.game_results_csv]:
        for row in _read_csv(path, [], missing_ok=True):
            away = _clean(row.get("away_team"))
            home = _clean(row.get("home_team"))
            game = _normal_game_label(f"{away} @ {home}")
            if away and home and game not in lookup:
                lookup[game] = {"game_id": _clean(row.get("game_id")), "away_team": away, "home_team": home}
    return lookup


def _normal_game_label(value: str) -> str:
    text = _clean(value).replace(" @ ", "@").replace(" vs ", "@").replace(" VS ", "@")
    return text


def _lean_team(pick: str) -> str:
    tokens = _clean(pick).replace("/", " ").split()
    return tokens[0].upper() if tokens else ""


def _opponent_for_team(team: str, game_meta: dict[str, str]) -> str:
    team_upper = team.upper()
    away = _clean(game_meta.get("away_team")).upper()
    home = _clean(game_meta.get("home_team")).upper()
    if team_upper == away:
        return home
    if team_upper == home:
        return away
    return ""


def _final_prediction_gap_lines(path: Path) -> list[str]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return []
    gaps: list[str] = []
    for line in lines:
        text = line.strip().lstrip("- ").strip()
        if not text or text.startswith("#"):
            continue
        if text.startswith("No unresolved parsing gaps") or text.startswith("Skipped non-prediction"):
            continue
        if text:
            gaps.append(f"FINAL_ECHOIQ_PARSING_GAP: {text}")
    return gaps


def _dedupe_predictions(predictions: list[LearningPrediction], gaps: list[str]) -> list[LearningPrediction]:
    output: list[LearningPrediction] = []
    seen: set[str] = set()
    for prediction in predictions:
        if prediction.prediction_id in seen:
            gaps.append(f"DUPLICATE_PREDICTION_ID_SKIPPED: {prediction.prediction_id}")
            continue
        seen.add(prediction.prediction_id)
        output.append(prediction)
    return output


def _load_local_postgame_artifacts(
    paths: AgentPaths,
    slate_date: str,
    gaps: list[str],
) -> tuple[list[GameResult], list[PlayerPerformance], list[PitcherUsage]]:
    game_rows = _read_csv(paths.game_results_csv, gaps, missing_ok=True)
    player_rows = _read_csv(paths.player_performance_csv, gaps, missing_ok=True)
    pitcher_rows = _read_csv(paths.pitcher_usage_csv, gaps, missing_ok=True)
    if game_rows and not any(_clean(row.get("date")) == slate_date for row in game_rows):
        gaps.append("FINAL_GAME_RESULTS_DATE_MISMATCH: local 01_postgame_audit rows do not match slate date.")
        game_rows = []
    if player_rows and not any(_clean(row.get("date")) == slate_date for row in player_rows):
        gaps.append("FINAL_PLAYER_PERFORMANCE_DATE_MISMATCH: local 01_postgame_audit rows do not match slate date.")
        player_rows = []
    if pitcher_rows and not any(_clean(row.get("date")) == slate_date for row in pitcher_rows):
        pitcher_rows = []
    return (
        [_game_from_row(row) for row in game_rows],
        [_player_from_row(row) for row in player_rows],
        [_pitcher_from_row(row) for row in pitcher_rows],
    )


def _resolve_prediction_teams_from_players(predictions: list[LearningPrediction], players: list[PlayerPerformance]) -> None:
    by_player: dict[str, list[PlayerPerformance]] = defaultdict(list)
    for player in players:
        if player.player_name:
            by_player[_norm(player.player_name)].append(player)
    for prediction in predictions:
        if prediction.team or not prediction.player_name:
            continue
        matches = by_player.get(_norm(prediction.player_name), [])
        if not matches:
            continue
        if prediction.game_id:
            same_game = [match for match in matches if match.game_id == prediction.game_id]
            if same_game:
                matches = same_game
        if len({match.team for match in matches if match.team}) == 1:
            match = matches[0]
            prediction.team = match.team
            prediction.opponent = prediction.opponent or match.opponent


def _grade_predictions(inputs: LearningInputs) -> list[dict[str, object]]:
    players = _player_index(inputs.players)
    team_players = _team_game_players(inputs.players)
    games = _game_index(inputs.games)
    rows: list[dict[str, object]] = []
    for prediction in inputs.predictions:
        if prediction.prediction_type == "GAME_LEAN":
            rows.append(_grade_game_prediction(prediction, games))
            continue
        if prediction.prediction_type in {"PITCHER_VULNERABILITY", "BULLPEN_CONTEXT", "TEAM_ENVIRONMENT"}:
            rows.append(_grade_context_prediction(prediction, games, inputs.players, inputs.pitchers))
            continue
        perf = _find_player(prediction, players)
        teammate_winner = _qualifying_teammate_winner(prediction, team_players)
        rows.append(_grade_player_prediction(prediction, perf, teammate_winner, games))
    return rows


def _grade_player_prediction(
    prediction: LearningPrediction,
    perf: PlayerPerformance | None,
    teammate_winner: PlayerPerformance | None,
    games: dict[str, GameResult],
) -> dict[str, object]:
    game = games.get(prediction.game_id)
    base = _base_grade_row(prediction, game)
    if perf is None:
        base.update(
            {
                "final_result_hit": "unknown",
                "process_label": "INCONCLUSIVE",
                "result_label": "UNKNOWN",
                "miss_reason": "PLAYER_BOXSCORE_MISSING",
                "model_lesson": "Require final boxscore row before grading player-specific predictions.",
                "confidence_after_review": "LOW",
                "notes": "No matching final player row.",
            }
        )
        return base

    _add_actuals(base, perf)
    result_hit, result_label = _player_result(prediction.prediction_type, perf)
    process_label = _process_label_for_player_prediction(prediction, perf, result_hit, teammate_winner, game)
    miss_reason = _miss_reason(prediction, perf, result_hit, teammate_winner, process_label)
    base.update(
        {
            "final_result_hit": result_hit,
            "process_label": process_label,
            "result_label": result_label,
            "miss_reason": miss_reason,
            "model_lesson": _model_lesson(prediction, perf, process_label, result_label),
            "confidence_after_review": _confidence_after_review(process_label, result_label),
            "notes": _player_notes(prediction, perf, teammate_winner),
        }
    )
    return base


def _grade_game_prediction(prediction: LearningPrediction, games: dict[str, GameResult]) -> dict[str, object]:
    game = games.get(prediction.game_id)
    base = _base_grade_row(prediction, game)
    if game is None or not game.winner:
        base.update(
            {
                "final_result_hit": "unknown",
                "game_lean_result": "UNKNOWN",
                "process_label": "INCONCLUSIVE",
                "result_label": "UNKNOWN",
                "miss_reason": "FINAL_SCORE_MISSING",
                "model_lesson": "Require final score before grading game/team leans.",
                "confidence_after_review": "LOW",
            }
        )
        return base
    hit = _same_team(prediction.team, game.winner)
    flaw = _game_lean_process_flaw(prediction)
    label = "CORRECT_PROCESS_GOOD_RESULT" if hit else "CORRECT_PROCESS_BAD_RESULT"
    if flaw and not hit:
        label = "MIXED_PROCESS_BAD_RESULT"
    if _is_stale(prediction):
        label = "STALE_ASSUMPTION"
    base.update(
        {
            "final_result_hit": "true" if hit else "false",
            "game_lean_result": "HIT" if hit else "MISS",
            "process_label": label,
            "result_label": "WON" if hit else "LOST",
            "miss_reason": "" if hit else (flaw or "LEANED_TEAM_LOST"),
            "model_lesson": _game_lean_model_lesson(prediction, hit, flaw),
            "confidence_after_review": "MEDIUM" if hit and not flaw else "LOW_TO_MEDIUM",
        }
    )
    return base


def _grade_context_prediction(
    prediction: LearningPrediction,
    games: dict[str, GameResult],
    players: list[PlayerPerformance],
    pitchers: list[PitcherUsage],
) -> dict[str, object]:
    game = games.get(prediction.game_id)
    base = _base_grade_row(prediction, game)
    if game is None:
        base.update(
            {
                "final_result_hit": "unknown",
                "process_label": "INCONCLUSIVE",
                "result_label": "UNKNOWN",
                "miss_reason": "FINAL_SCORE_MISSING",
                "model_lesson": "Context calls need final game state before review.",
                "confidence_after_review": "LOW",
            }
        )
        return base
    players_in_game = [row for row in players if row.game_id == prediction.game_id]
    pitchers_in_game = [row for row in pitchers if row.game_id == prediction.game_id]
    total_runs = int(game.away_score or 0) + int(game.home_score or 0)
    vulnerable_pitcher = any(int(row.earned_runs or 0) >= 4 or int(row.home_runs_allowed or 0) >= 1 for row in pitchers_in_game)
    hidden_depth = any(int(row.total_bases or 0) >= 4 or int(row.home_runs or 0) >= 1 for row in players_in_game)
    validated = (
        vulnerable_pitcher
        if prediction.prediction_type == "PITCHER_VULNERABILITY"
        else hidden_depth
        if prediction.prediction_type == "TEAM_ENVIRONMENT"
        else total_runs >= 8
    )
    base.update(
        {
            "final_result_hit": "true" if validated else "false",
            "process_label": "CORRECT_PROCESS_GOOD_RESULT" if validated else "CORRECT_PROCESS_BAD_RESULT",
            "result_label": "VALIDATED" if validated else "NOT_VALIDATED",
            "miss_reason": "" if validated else "CONTEXT_THESIS_NOT_VISIBLE_IN_BOX_SCORE",
            "model_lesson": "Context calls need exact player/team hooks in future artifacts.",
            "confidence_after_review": "MEDIUM" if validated else "LOW_TO_MEDIUM",
        }
    )
    return base


def _player_result(prediction_type: str, perf: PlayerPerformance) -> tuple[str, str]:
    hits = int(perf.hits or 0)
    total_bases = int(perf.total_bases or 0)
    home_runs = int(perf.home_runs or 0)
    walks = int(perf.walks or 0)
    if prediction_type == "HR":
        return ("true", "HIT") if home_runs >= 1 else ("false", "MISS")
    if prediction_type == "TB":
        if total_bases >= 2:
            return "true", "HIT"
        if hits >= 1:
            return "partial", "PARTIAL_SINGLE_ONLY"
        return "false", "MISS"
    if prediction_type == "HIT":
        if hits >= 2:
            return "true", "STRONG_HIT"
        if hits >= 1:
            return "true", "HIT"
        if walks >= 1:
            return "partial", "REACHED_BUT_NO_HIT"
        return "false", "MISS"
    return "unknown", "UNKNOWN"


def _process_label_for_player_prediction(
    prediction: LearningPrediction,
    perf: PlayerPerformance,
    result_hit: str,
    teammate_winner: PlayerPerformance | None,
    game: GameResult | None,
) -> str:
    if _is_stale(prediction):
        return "STALE_ASSUMPTION"
    if prediction.prediction_type == "HR" and int(perf.home_runs or 0) == 0 and int(perf.total_bases or 0) >= 2:
        if _reason_supports_tb(prediction):
            return "RIGHT_PLAYER_WRONG_PROP_SUBTYPE"
    if result_hit == "true":
        return "CORRECT_PROCESS_GOOD_RESULT"
    if _right_team_wrong_player_applies(prediction, result_hit, teammate_winner, game):
        return "RIGHT_TEAM_WRONG_PLAYER"
    if result_hit == "partial":
        return "CORRECT_PROCESS_BAD_RESULT"
    if _weak_process(prediction):
        return "BAD_PROCESS_BAD_RESULT"
    return "CORRECT_PROCESS_BAD_RESULT"


def _right_team_wrong_player_applies(
    prediction: LearningPrediction,
    result_hit: str,
    teammate_winner: PlayerPerformance | None,
    game: GameResult | None,
) -> bool:
    if result_hit not in {"false", "partial"}:
        return False
    if teammate_winner is None:
        return False
    if not _team_environment_validated(prediction, game, teammate_winner):
        return False
    if not _reason_supports_team_context(prediction):
        return False
    return True


def _detect_hidden_winners(inputs: LearningInputs, prediction_grades: list[dict[str, object]]) -> list[dict[str, object]]:
    predicted = {_player_key(str(row.get("player_name") or ""), str(row.get("team") or "")) for row in prediction_grades}
    games_with_predictions = {prediction.game_id for prediction in inputs.predictions if prediction.game_id}
    game_index = _game_index(inputs.games)
    rows: list[dict[str, object]] = []
    for player in inputs.players:
        if not player.player_name or _player_key(player.player_name, player.team) in predicted:
            continue
        if player.game_id not in games_with_predictions:
            continue
        hits = int(player.hits or 0)
        total_bases = int(player.total_bases or 0)
        home_runs = int(player.home_runs or 0)
        if home_runs < 1 and total_bases < 4 and hits < 2:
            continue
        slot = _int_or_none(player.batting_order)
        missed_signal = "supporting_cast"
        if slot is not None and slot >= 6:
            missed_signal = "lineup_depth"
        elif hits >= 2 and home_runs == 0:
            missed_signal = "contact_floor"
        elif total_bases >= 4 or home_runs >= 1:
            missed_signal = "pitch_fit"
        missed_stars = _missed_star_players(player, prediction_grades)
        result_type = _hidden_result_type(hits, total_bases, home_runs)
        lineup_band = _lineup_band(slot)
        same_team_env = _hidden_team_environment_validated(player, game_index.get(player.game_id), hits, total_bases, home_runs)
        supporting_reason = _supporting_cast_reason(player, missed_stars, lineup_band, result_type, same_team_env)
        future_rule = _hidden_future_rule(missed_signal, lineup_band, result_type)
        rows.append(
            {
                "player_name": player.player_name,
                "team": player.team,
                "game": _game_label(player.team, player.opponent),
                "lineup_slot": player.batting_order,
                "actual_h": hits,
                "actual_hr": home_runs,
                "actual_tb": total_bases,
                "prediction_context_team_had_missed_star": "true" if missed_stars else "false",
                "missed_star_players": "; ".join(missed_stars),
                "hidden_winner_lineup_band": lineup_band,
                "hidden_winner_result_type": result_type,
                "same_team_environment_validated": "true" if same_team_env else "false",
                "supporting_cast_reason": supporting_reason,
                "future_search_rule": future_rule,
                "why_hidden": "Not prioritized in HR/TB/hits watchlists despite strong final production.",
                "missed_signal_type": missed_signal,
                "future_rule": future_rule,
            }
        )
    return rows


def _hidden_winner_prediction_rows(slate_date: str, hidden_winners: list[dict[str, object]]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for index, winner in enumerate(hidden_winners, start=1):
        rows.append(
            {
                "slate_date": slate_date,
                "prediction_id": f"hidden_winner:{index}",
                "prediction_source_file": "derived_hidden_winner_scan",
                "prediction_source": "postgame_learning_derived",
                "prediction_phase": "derived_hidden_winner",
                "prediction_type": "TEAM_ENVIRONMENT",
                "player_name": winner["player_name"],
                "team": winner["team"],
                "opponent": "",
                "game": winner["game"],
                "lineup_slot": winner["lineup_slot"],
                "pregame_tier": "WATCHLIST",
                "pregame_reason": "Derived postgame learning row for a supporting-cast winner.",
                "pick": "hidden supporting-cast winner",
                "signal_tags": winner["missed_signal_type"],
                "final_result_hit": "true",
                "actual_ab": "",
                "actual_h": winner["actual_h"],
                "actual_2b": "",
                "actual_3b": "",
                "actual_hr": winner["actual_hr"],
                "actual_tb": winner["actual_tb"],
                "prediction_context_team_had_missed_star": winner["prediction_context_team_had_missed_star"],
                "missed_star_players": winner["missed_star_players"],
                "hidden_winner_lineup_band": winner["hidden_winner_lineup_band"],
                "hidden_winner_result_type": winner["hidden_winner_result_type"],
                "same_team_environment_validated": winner["same_team_environment_validated"],
                "supporting_cast_reason": winner["supporting_cast_reason"],
                "future_search_rule": winner["future_search_rule"],
                "actual_rbi": "",
                "actual_r": "",
                "actual_bb": "",
                "actual_k": "",
                "team_final_score": "",
                "opponent_final_score": "",
                "game_lean_result": "",
                "process_label": "HIDDEN_SUPPORTING_CAST_WINNER",
                "result_label": "HIDDEN_WINNER",
                "miss_reason": winner["missed_signal_type"],
                "model_lesson": winner["future_rule"],
                "confidence_after_review": "MEDIUM",
                "notes": winner["why_hidden"],
            }
        )
    return rows


def _grade_games(
    slate_date: str,
    inputs: LearningInputs,
    prediction_grades: list[dict[str, object]],
    hidden_winners: list[dict[str, object]],
) -> list[dict[str, object]]:
    by_game: dict[str, list[dict[str, object]]] = defaultdict(list)
    for row in prediction_grades:
        by_game[str(row.get("game") or "")].append(row)
    hidden_by_game: dict[str, list[str]] = defaultdict(list)
    for row in hidden_winners:
        hidden_by_game[str(row.get("game") or "")].append(str(row.get("player_name") or ""))
    games = inputs.games or _games_from_predictions(inputs.predictions)
    rows: list[dict[str, object]] = []
    for game in games:
        game_label = _game_label(game.away_team, game.home_team)
        grades = by_game.get(game_label, [])
        leans = [row for row in grades if row.get("prediction_type") == "GAME_LEAN"]
        lean_text = "; ".join(f"{row.get('team')} {row.get('result_label')}" for row in leans) or "none"
        misses = [str(row.get("player_name") or row.get("team") or row.get("prediction_id")) for row in grades if row.get("result_label") in {"MISS", "LOST"}]
        process_grade = _game_process_grade(grades)
        total_runs = int(game.away_score or 0) + int(game.home_score or 0)
        rows.append(
            {
                "slate_date": slate_date,
                "game": game_label,
                "pregame_lean": lean_text,
                "final_score": _score(game),
                "lean_result": _lean_result(leans),
                "process_grade": process_grade,
                "result_grade": _game_result_grade(leans),
                "team_environment_validated": "true" if total_runs >= 8 or hidden_by_game.get(game_label) else "false",
                "bullpen_thesis_validated": _validated_text(grades, "BULLPEN_CONTEXT"),
                "pitcher_vulnerability_validated": _validated_text(grades, "PITCHER_VULNERABILITY"),
                "lineup_depth_validated": "true" if hidden_by_game.get(game_label) else "false",
                "hidden_winners": "; ".join(hidden_by_game.get(game_label, [])),
                "major_misses": "; ".join(misses[:5]),
                "model_lesson": _game_lesson(grades, hidden_by_game.get(game_label, [])),
            }
        )
    return rows


def _signal_performance(
    inputs: LearningInputs,
    prediction_grades: list[dict[str, object]],
    game_grades: list[dict[str, object]],
    hidden_winners: list[dict[str, object]],
) -> dict[str, object]:
    by_type: dict[str, Counter[str]] = defaultdict(Counter)
    by_source: dict[str, Counter[str]] = defaultdict(Counter)
    by_phase: dict[str, Counter[str]] = defaultdict(Counter)
    confidence: dict[str, Counter[str]] = defaultdict(Counter)
    successful_signals: Counter[str] = Counter()
    failing_signals: Counter[str] = Counter()
    predictions_by_id = {prediction.prediction_id: prediction for prediction in inputs.predictions}
    for row in prediction_grades:
        prediction_type = str(row.get("prediction_type") or "UNKNOWN")
        result_label = str(row.get("result_label") or "UNKNOWN")
        by_type[prediction_type][result_label] += 1
        by_source[str(row.get("prediction_source") or "UNKNOWN")][result_label] += 1
        by_phase[str(row.get("prediction_phase") or "UNKNOWN")][result_label] += 1
        confidence[str(row.get("pregame_tier") or "UNKNOWN")][result_label] += 1
        prediction = predictions_by_id.get(str(row.get("prediction_id") or ""))
        signal = prediction.signal_type if prediction else str(row.get("miss_reason") or "derived")
        if result_label in {"HIT", "STRONG_HIT", "WON", "VALIDATED", "HIDDEN_WINNER"}:
            successful_signals[signal or prediction_type] += 1
        elif result_label in {"MISS", "LOST", "NOT_VALIDATED"}:
            failing_signals[signal or prediction_type] += 1
    all_game_record = _game_lean_record(prediction_grades)
    final_chat_game_record = _game_lean_record(
        prediction_grades,
        lambda row: row.get("prediction_source") == "final_echoiq_predictions",
    )
    repo_watchlist_game_record = _game_lean_record(
        prediction_grades,
        lambda row: row.get("prediction_source") == "repo_generated_watchlist",
    )
    lottery_game_record = _game_lean_record(
        prediction_grades,
        lambda row: row.get("prediction_phase") == "lottery_discussion",
    )
    summary = {
        "games_graded": len(game_grades),
        "player_predictions_graded": sum(1 for row in prediction_grades if row.get("player_name") and not str(row.get("prediction_id")).startswith("hidden_winner:")),
        "final_echoiq_predictions_graded": sum(1 for row in prediction_grades if _is_final_echoiq_row(row)),
        "lottery_discussion_predictions_graded": sum(1 for row in prediction_grades if row.get("prediction_phase") == "lottery_discussion"),
        "hr_hit_rate": _hit_rate(by_type["HR"]["HIT"], by_type["HR"]["HIT"] + by_type["HR"]["MISS"]),
        "tb_hit_rate": _hit_rate(by_type["TB"]["HIT"], by_type["TB"]["HIT"] + by_type["TB"]["MISS"] + by_type["TB"]["PARTIAL_SINGLE_ONLY"]),
        "game_lean_record": all_game_record["record"],
        "all_game_lean_rows_record": all_game_record["record"],
        "final_chat_board_game_lean_record": final_chat_game_record["record"],
        "repo_watchlist_game_lean_record": repo_watchlist_game_record["record"],
        "lottery_discussion_game_lean_record": lottery_game_record["record"],
        "right_team_wrong_player_count": _count_process(prediction_grades, "RIGHT_TEAM_WRONG_PLAYER"),
        "right_player_wrong_prop_count": _count_process(prediction_grades, "RIGHT_PLAYER_WRONG_PROP_SUBTYPE"),
        "hidden_winners_count": len(hidden_winners),
        "stale_assumption_count": _count_process(prediction_grades, "STALE_ASSUMPTION"),
        "top_5_lessons": _top_lessons(prediction_grades, hidden_winners),
    }
    return {
        "slate_date": inputs.games[0].date if inputs.games else "",
        "summary": summary,
        "by_prediction_type": {key: dict(counter) for key, counter in sorted(by_type.items())},
        "by_prediction_source": {key: dict(counter) for key, counter in sorted(by_source.items())},
        "by_prediction_phase": {key: dict(counter) for key, counter in sorted(by_phase.items())},
        "HR": {"hits": by_type["HR"]["HIT"], "misses": by_type["HR"]["MISS"]},
        "TB": {"hits": by_type["TB"]["HIT"], "misses": by_type["TB"]["MISS"]},
        "game_leans": all_game_record,
        "game_lean_records": {
            "all_game_lean_rows_record": all_game_record,
            "final_chat_board_game_lean_record": final_chat_game_record,
            "repo_watchlist_game_lean_record": repo_watchlist_game_record,
            "lottery_discussion_game_lean_record": lottery_game_record,
        },
        "top_successful_signal_types": dict(successful_signals.most_common(10)),
        "failing_signal_types": dict(failing_signals.most_common(10)),
        "right_team_wrong_player_count": summary["right_team_wrong_player_count"],
        "right_player_wrong_prop_count": summary["right_player_wrong_prop_count"],
        "hidden_supporting_cast_count": len(hidden_winners),
        "stale_assumption_count": summary["stale_assumption_count"],
        "confidence_tier_performance": {key: dict(counter) for key, counter in sorted(confidence.items())},
        "gaps": inputs.gaps,
    }


def _learning_report(
    slate_date: str,
    prediction_grades: list[dict[str, object]],
    game_grades: list[dict[str, object]],
    hidden_winners: list[dict[str, object]],
    signal_performance: dict[str, object],
    gaps: list[str],
) -> str:
    summary = signal_performance["summary"]
    best = _rows_with_results(prediction_grades, {"HIT", "STRONG_HIT", "WON", "VALIDATED"})[:5]
    worst = _rows_with_results(prediction_grades, {"MISS", "LOST", "NOT_VALIDATED"})[:5]
    right_team = [row for row in prediction_grades if row.get("process_label") == "RIGHT_TEAM_WRONG_PLAYER"]
    wrong_prop = [row for row in prediction_grades if row.get("process_label") == "RIGHT_PLAYER_WRONG_PROP_SUBTYPE"]
    correct_bad = [row for row in prediction_grades if row.get("process_label") == "CORRECT_PROCESS_BAD_RESULT"]
    bad_good = [row for row in prediction_grades if row.get("process_label") == "BAD_PROCESS_GOOD_RESULT"]
    final_rows = [row for row in prediction_grades if _is_final_echoiq_row(row)]
    lottery_rows = [row for row in prediction_grades if row.get("prediction_phase") == "lottery_discussion"]
    lines = [
        "# EchoIQ Postgame Learning Report",
        "",
        "This is learning infrastructure only. It does not create official bets, wager recommendations, staking advice, or EV conclusions.",
        "",
        "## Executive diagnosis",
        "",
        f"- Slate date: {slate_date}",
        f"- Games graded: {summary['games_graded']}",
        f"- Player predictions graded: {summary['player_predictions_graded']}",
        f"- Final EchoIQ predictions graded: {summary['final_echoiq_predictions_graded']}",
        f"- Lottery discussion rows graded: {summary['lottery_discussion_predictions_graded']}",
        f"- HR hit rate: {summary['hr_hit_rate']}",
        f"- TB hit rate: {summary['tb_hit_rate']}",
        f"- Final chat-board game lean record: {summary['final_chat_board_game_lean_record']}",
        f"- All game-lean rows record: {summary['all_game_lean_rows_record']}",
        f"- Repo watchlist game lean record: {summary['repo_watchlist_game_lean_record']}",
        f"- Lottery discussion game lean record: {summary['lottery_discussion_game_lean_record']}",
        f"- Right team / wrong player count: {summary['right_team_wrong_player_count']}",
        f"- Hidden supporting-cast winners: {summary['hidden_winners_count']}",
        "",
        "## What EchoIQ got right",
        "",
        *_bullet_rows(best, "No validated calls available."),
        "",
        "## What EchoIQ got wrong",
        "",
        *_bullet_rows(worst, "No graded misses available."),
        "",
        "## Best calls",
        "",
        *_bullet_rows(best, "No best calls available."),
        "",
        "## Worst misses",
        "",
        *_bullet_rows(worst, "No worst misses available."),
        "",
        "## Final EchoIQ Chat Board Results",
        "",
        *_final_board_bullets(final_rows, lottery_rows),
        "",
        "## Correct process / bad result",
        "",
        *_bullet_rows(correct_bad, "No rows classified here."),
        "",
        "## Bad process / good result",
        "",
        *_bullet_rows(bad_good, "No rows classified here."),
        "",
        "## Right team / wrong player outcomes",
        "",
        *_capped_bullet_rows(right_team, "No right-team/wrong-player outcomes detected.", limit=10),
        "",
        "## Where EchoIQ Was Right About The Game But Wrong About The Bat",
        "",
        *_right_game_wrong_bat_table(right_team, hidden_winners),
        "",
        "## Where EchoIQ Process Was Actually Flawed",
        "",
        *_flawed_process_table(_mixed_or_bad_process_rows(prediction_grades)),
        "",
        "## Hidden supporting-cast winners",
        "",
        *_bullet_hidden(hidden_winners[:10]),
        "",
        "## HR model lessons",
        "",
        *_lesson_bullets(prediction_grades, "HR"),
        "",
        "## TB/XBH model lessons",
        "",
        *_lesson_bullets(prediction_grades, "TB"),
        "",
        "## Hits/contact model lessons",
        "",
        *_lesson_bullets(prediction_grades, "HIT"),
        "",
        "## Game/team model lessons",
        "",
        *_game_lesson_bullets(game_grades),
        "",
        "## New rules for next slate",
        "",
        *_bullet_or_default(summary["top_5_lessons"], "No slate-specific rules were produced."),
        "",
        "## Data fields needed",
        "",
        *_bullet_or_default(gaps + _known_limitations(), "No data gaps logged."),
        "",
        "## Recommended next build steps",
        "",
        "- Add pitch-level and hard-contact enrichment to separate good process from noisy outs.",
        "- Add exact predicted-signal tags so process labels do not depend on free-text rationale.",
        "- Feed hidden-winner rows into the next-slate research prompt as supporting-cast search rules.",
        "- Preserve this deterministic layer before training any model on the labels.",
    ]
    return "\n".join(lines).rstrip() + "\n"


def _next_slate_rules(signal_performance: dict[str, object], hidden_winners: list[dict[str, object]], gaps: list[str]) -> str:
    rules = [
        "# EchoIQ Next Slate Prompt Rules",
        "",
        "- Lineup slot outranks yesterday's contact tag when the player is absent or moved into a weak role.",
        "- Do not let one elite hitter drive a team lean.",
        "- Separate HR, TB, hits, game, and pitcher/K signals before grading or promoting any row.",
        "- Bullpen fatigue is contextual, not automatic.",
        "- Add a star-gravity penalty when supporting-cast bats fit the same environment better.",
        "- Search for supporting-cast winners inside strong team environments.",
        "- Downgrade HRs in suppressive parks unless pitch/hitter fit is overwhelming.",
        "- Treat weak-brand offenses seriously when contact cluster plus pitcher vulnerability align.",
    ]
    if hidden_winners:
        rules.append("- Re-scan lineup slots 5-9 for contact-floor and XBH profiles before finalizing star-heavy boards.")
    if gaps:
        rules.append("- Mark any row with missing final boxscore or contact-quality data as inconclusive, not as proof.")
    return "\n".join(rules).rstrip() + "\n"


def _read_csv(path: Path, gaps: list[str], *, missing_ok: bool) -> list[dict[str, str]]:
    if not path.exists():
        if not missing_ok:
            gaps.append(f"CSV_MISSING: {path}")
        return []
    try:
        with path.open(newline="", encoding="utf-8") as handle:
            return [dict(row) for row in csv.DictReader(handle)]
    except (OSError, csv.Error) as exc:
        gaps.append(f"CSV_UNREADABLE: {path}: {exc}")
        return []


def _write_csv(path: Path, fieldnames: list[str], rows: Iterable[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: clean_csv_value(row.get(field, "")) for field in fieldnames})


def _write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def _watchlist_survival(path: Path) -> dict[tuple[str, str, str, str], dict[str, str]]:
    rows = _read_csv(path, [], missing_ok=True)
    index: dict[tuple[str, str, str, str], dict[str, str]] = {}
    for row in rows:
        index[_survival_key(row.get("game_id"), row.get("player_or_team"), row.get("team"), row.get("market"))] = row
    return index


def _survival_key(game_id: object, player_or_team: object, team: object, market: object) -> tuple[str, str, str, str]:
    return (_clean(game_id), _norm(_clean(player_or_team)), _clean(team).upper(), _clean(market).upper())


def _game_from_row(row: dict[str, str]) -> GameResult:
    return GameResult(
        game_id=_clean(row.get("game_id")),
        date=_clean(row.get("date")),
        away_team=_clean(row.get("away_team")),
        home_team=_clean(row.get("home_team")),
        away_score=_int_or_none(row.get("away_score")),
        home_score=_int_or_none(row.get("home_score")),
        winner=_clean(row.get("winner")),
        status=_clean(row.get("status")),
        venue=_clean(row.get("venue")),
        game_start_time=_clean(row.get("game_start_time")),
        source=_clean(row.get("source")),
        retrieved_at=_clean(row.get("retrieved_at")),
    )


def _player_from_row(row: dict[str, str]) -> PlayerPerformance:
    data = {field: row.get(field, "") for field in PlayerPerformance.__dataclass_fields__}
    for field in [
        "at_bats",
        "hits",
        "total_bases",
        "home_runs",
        "runs",
        "rbi",
        "walks",
        "strikeouts",
        "doubles",
        "triples",
        "stolen_bases",
        "hard_hit_count",
        "barrel_count",
        "sweet_spot_count",
        "batted_ball_events",
        "pulled_air_contact_count",
        "opposite_field_contact_count",
    ]:
        data[field] = _int_or_none(data[field])
    for field in [
        "exit_velocity_avg",
        "exit_velocity_max",
        "launch_angle_avg",
        "hard_hit_rate",
        "barrel_rate",
        "sweet_spot_rate",
        "xba",
        "xslg",
        "xwoba",
        "estimated_hr_distance_max",
    ]:
        data[field] = _float_or_none(data[field])
    return PlayerPerformance(**data)


def _pitcher_from_row(row: dict[str, str]) -> PitcherUsage:
    data = {field: row.get(field, "") for field in PitcherUsage.__dataclass_fields__}
    for field in [
        "pitches",
        "batters_faced",
        "hits_allowed",
        "earned_runs",
        "walks",
        "strikeouts",
        "home_runs_allowed",
        "hard_hit_allowed",
        "barrels_allowed",
    ]:
        data[field] = _int_or_none(data[field])
    for field in [
        "avg_exit_velocity_allowed",
        "max_exit_velocity_allowed",
        "xba_allowed",
        "xslg_allowed",
        "xwoba_allowed",
        "whiff_rate",
        "called_strike_whiff_rate",
    ]:
        data[field] = _float_or_none(data[field])
    return PitcherUsage(**data)


def _base_grade_row(prediction: LearningPrediction, game: GameResult | None) -> dict[str, object]:
    team_score, opponent_score = _team_scores(prediction.team, game)
    return {
        "slate_date": game.date if game is not None else "",
        "prediction_id": prediction.prediction_id,
        "prediction_source_file": prediction.source_file,
        "prediction_source": prediction.prediction_source,
        "prediction_phase": prediction.prediction_phase,
        "prediction_type": prediction.prediction_type,
        "player_name": prediction.player_name,
        "team": prediction.team,
        "opponent": prediction.opponent,
        "game": _resolved_game(prediction, game),
        "lineup_slot": prediction.lineup_slot,
        "pregame_tier": prediction.pregame_tier,
        "pregame_reason": prediction.pregame_reason,
        "pick": prediction.pick,
        "signal_tags": prediction.signal_tags,
        "final_result_hit": "unknown",
        "actual_ab": "",
        "actual_h": "",
        "actual_2b": "",
        "actual_3b": "",
        "actual_hr": "",
        "actual_tb": "",
        "actual_rbi": "",
        "actual_r": "",
        "actual_bb": "",
        "actual_k": "",
        "team_final_score": team_score,
        "opponent_final_score": opponent_score,
        "game_lean_result": "",
        "process_label": "INCONCLUSIVE",
        "result_label": "UNKNOWN",
        "miss_reason": "",
        "model_lesson": "",
        "confidence_after_review": "LOW",
        "notes": "",
    }


def _add_actuals(row: dict[str, object], perf: PlayerPerformance) -> None:
    row.update(
        {
            "actual_ab": perf.at_bats,
            "actual_h": perf.hits,
            "actual_2b": perf.doubles,
            "actual_3b": perf.triples,
            "actual_hr": perf.home_runs,
            "actual_tb": perf.total_bases,
            "actual_rbi": perf.rbi,
            "actual_r": perf.runs,
            "actual_bb": perf.walks,
            "actual_k": perf.strikeouts,
        }
    )


def _player_index(players: list[PlayerPerformance]) -> dict[tuple[str, str], PlayerPerformance]:
    return {_player_key(row.player_name, row.team): row for row in players if row.player_name}


def _team_game_players(players: list[PlayerPerformance]) -> dict[tuple[str, str], list[PlayerPerformance]]:
    rows: dict[tuple[str, str], list[PlayerPerformance]] = defaultdict(list)
    for player in players:
        rows[(player.game_id, player.team)].append(player)
    return rows


def _game_index(games: list[GameResult]) -> dict[str, GameResult]:
    return {game.game_id: game for game in games}


def _find_player(prediction: LearningPrediction, players: dict[tuple[str, str], PlayerPerformance]) -> PlayerPerformance | None:
    if not prediction.player_name:
        return None
    if prediction.team:
        found = players.get(_player_key(prediction.player_name, prediction.team))
        if found is not None:
            return found
    matches = [row for (name, _team), row in players.items() if name == _norm(prediction.player_name)]
    return matches[0] if matches else None


def _qualifying_teammate_winner(
    prediction: LearningPrediction,
    team_players: dict[tuple[str, str], list[PlayerPerformance]],
) -> PlayerPerformance | None:
    candidates = [row for row in team_players.get((prediction.game_id, prediction.team), []) if _norm(row.player_name) != _norm(prediction.player_name)]
    candidates = [
        row
        for row in candidates
        if int(row.home_runs or 0) >= 1 or int(row.total_bases or 0) >= 2 or int(row.hits or 0) >= 2
    ]
    return sorted(candidates, key=lambda row: (int(row.home_runs or 0), int(row.total_bases or 0), int(row.hits or 0)), reverse=True)[0] if candidates else None


def _team_environment_validated(
    prediction: LearningPrediction,
    game: GameResult | None,
    teammate_winner: PlayerPerformance | None,
) -> bool:
    if teammate_winner is None:
        return False
    if int(teammate_winner.home_runs or 0) >= 1 or int(teammate_winner.total_bases or 0) >= 2 or int(teammate_winner.hits or 0) >= 2:
        return True
    if game is None or not prediction.team:
        return False
    team_score, _opponent_score = _team_scores(prediction.team, game)
    return _int_or_none(team_score) is not None and int(team_score) >= 5


def _reason_supports_team_context(prediction: LearningPrediction) -> bool:
    text = " ".join(
        [
            prediction.pregame_reason,
            prediction.supporting_factors,
            prediction.signal_type,
            prediction.signal_tags,
            prediction.pick,
            prediction.notes,
        ]
    ).upper()
    tokens = [
        "TEAM_ENVIRONMENT",
        "TEAM STACK",
        "TEAM_STACK",
        "STACK",
        "LINEUP",
        "ORDER",
        "SLOT",
        "CORE",
        "CLUSTER",
        "DEPTH",
        "RUN ENVIRONMENT",
        "PARK",
        "COORS",
        "BULLPEN",
        "PEN",
        "PROTECTION",
        "RBI CONTEXT",
        "LOADED",
        "TOP-ORDER",
        "TOP ORDER",
        "HOME CONTEXT",
        "CONTACT/TB OVER HR",
    ]
    return any(token in text for token in tokens)


def _game_lean_process_flaw(prediction: LearningPrediction) -> str:
    text = " ".join(
        [
            prediction.pregame_reason,
            prediction.supporting_factors,
            prediction.risk_flags,
            prediction.signal_tags,
            prediction.pick,
            prediction.notes,
        ]
    ).upper()
    if "UNDERWEIGHT" in text:
        return "CONTACT_CLUSTER_UNDERWEIGHTED"
    if "SP EDGE" in text or "PITCHER/K EDGE" in text or "K EDGE" in text:
        return "SP_EDGE_CONVERTED_TO_TEAM_EDGE"
    if "BULLPEN" in text or " PEN " in f" {text} " or "PEN FATIGUE" in text:
        return "BULLPEN_FATIGUE_OVERGENERALIZED"
    if "WIND-DEPENDENT" in text or "WEATHER" in text or "PARK" in text or "SUPPRESSIVE" in text:
        return "PARK_WEATHER_UNDERVERIFIED"
    if "ONE-STAR" in text or "ONE STAR" in text or "SUPERSTAR" in text:
        return "ONE_STAR_CARRYING_TEAM_LEAN"
    if "CONFIDENCE" in text and ("OVERSTAT" in text or "HIGH" in text or "STRONG LEAN" in text):
        return "CONFIDENCE_OVERSTATED"
    if ("HIGH" in text or "STRONG LEAN" in text) and ("VOLATILITY" in text or "VULNERABILITY" in text or "ZERO-REST" in text):
        return "CONFIDENCE_OVERSTATED"
    if "MISTAKE" in text or "VOLATILE" in text or "WATCH-ONLY" in text:
        return "MIXED_WEIGHTING"
    return ""


def _game_lean_model_lesson(prediction: LearningPrediction, hit: bool, flaw: str) -> str:
    if flaw == "CONTACT_CLUSTER_UNDERWEIGHTED":
        return "Do not bury opponent contact clusters when they directly challenge the side lean."
    if flaw == "SP_EDGE_CONVERTED_TO_TEAM_EDGE":
        return "Keep pitcher/K edge separate from a full team-side lean unless bats and bullpen also support it."
    if flaw == "BULLPEN_FATIGUE_OVERGENERALIZED":
        return "Bullpen fatigue needs exact leverage and availability context before it carries a side."
    if flaw == "PARK_WEATHER_UNDERVERIFIED":
        return "Park/weather context can validate environment while still making team/player allocation fragile."
    if flaw == "ONE_STAR_CARRYING_TEAM_LEAN":
        return "Do not let one star or one power cluster carry a team lean without lineup-depth confirmation."
    if flaw == "CONFIDENCE_OVERSTATED":
        return "Volatility can be a real signal while still requiring lower confidence."
    if flaw:
        return "Some game reasoning was useful, but the weighting rule was wrong."
    if hit:
        return "Keep game/team process separate from prop/player process."
    return "Losing side lean had no explicit partial-valid process hook; review the original weighting."


def _is_stale(prediction: LearningPrediction) -> bool:
    text = " ".join([prediction.current_status, prediction.risk_flags, prediction.data_gaps]).upper()
    return "KILLED" in text or "STARTER_CHANGE" in text or "LINEUP_CHANGE" in text or "NOT_STARTING" in text


def _reason_supports_tb(prediction: LearningPrediction) -> bool:
    text = " ".join([prediction.pregame_reason, prediction.supporting_factors, prediction.signal_type]).upper()
    return any(token in text for token in ["TB", "TOTAL BASE", "XBH", "LOUD", "CONTACT"])


def _weak_process(prediction: LearningPrediction) -> bool:
    text = " ".join([prediction.confidence, prediction.data_gaps, prediction.risk_flags]).upper()
    return "LOW" in text and ("UNVERIFIED" in text or "MISSING" in text)


def _miss_reason(
    prediction: LearningPrediction,
    perf: PlayerPerformance,
    result_hit: str,
    teammate_winner: PlayerPerformance | None,
    process_label: str,
) -> str:
    if process_label == "STALE_ASSUMPTION":
        return "STALE_ASSUMPTION_INVALIDATED_INPUT"
    if process_label == "RIGHT_PLAYER_WRONG_PROP_SUBTYPE":
        return "HR_PROFILE_CONFUSED_WITH_TB_PROFILE"
    if process_label == "RIGHT_TEAM_WRONG_PLAYER" and teammate_winner is not None:
        return f"RIGHT_TEAM_WRONG_PLAYER:{teammate_winner.player_name}"
    if result_hit == "true":
        return ""
    if int(perf.hits or 0) == 0 and int(perf.strikeouts or 0) >= 2:
        return "ZERO_HIT_MULTI_K_MISS"
    if result_hit == "partial":
        return "PARTIAL_CONTACT_ONLY"
    return "BOX_SCORE_MISS"


def _model_lesson(prediction: LearningPrediction, perf: PlayerPerformance, process_label: str, result_label: str) -> str:
    if process_label == "RIGHT_PLAYER_WRONG_PROP_SUBTYPE":
        return "Separate HR ceiling from TB/XBH profile when contact supports bases but not lift."
    if process_label == "RIGHT_TEAM_WRONG_PLAYER":
        return "Search supporting-cast bats in the same team environment before overweighting one target."
    if process_label == "STALE_ASSUMPTION":
        return "Downgrade or kill rows when lineup, starter, or verification inputs invalidate the pregame read."
    if result_label in {"HIT", "STRONG_HIT"}:
        return "Carry forward the signal only with the exact market subtype that paid off."
    if int(perf.hits or 0) == 0 and int(perf.strikeouts or 0) >= 2:
        return "Add contact-floor and strikeout-risk checks before elevating the player."
    return "Review whether the rationale was player-specific or merely team-environment driven."


def _confidence_after_review(process_label: str, result_label: str) -> str:
    if process_label in {"CORRECT_PROCESS_GOOD_RESULT", "RIGHT_PLAYER_WRONG_PROP_SUBTYPE"}:
        return "MEDIUM_TO_HIGH"
    if process_label in {"RIGHT_TEAM_WRONG_PLAYER", "HIDDEN_SUPPORTING_CAST_WINNER"}:
        return "MEDIUM"
    if process_label == "MIXED_PROCESS_BAD_RESULT":
        return "LOW_TO_MEDIUM"
    if result_label in {"UNKNOWN", "NOT_VALIDATED"}:
        return "LOW"
    return "LOW_TO_MEDIUM"


def _player_notes(prediction: LearningPrediction, perf: PlayerPerformance, teammate_winner: PlayerPerformance | None) -> str:
    parts = [
        f"status={prediction.current_status or 'not refreshed'}",
        f"box={perf.hits or 0} H/{perf.total_bases or 0} TB/{perf.home_runs or 0} HR",
    ]
    if teammate_winner is not None:
        parts.append(f"teammate winner={teammate_winner.player_name}")
    if perf.statcast_data_status:
        parts.append(f"statcast={perf.statcast_data_status}")
    return "; ".join(parts)


def _team_scores(team: str, game: GameResult | None) -> tuple[object, object]:
    if game is None or not team:
        return "", ""
    if _same_team(team, game.away_team):
        return game.away_score if game.away_score is not None else "", game.home_score if game.home_score is not None else ""
    if _same_team(team, game.home_team):
        return game.home_score if game.home_score is not None else "", game.away_score if game.away_score is not None else ""
    return "", ""


def _games_from_predictions(predictions: list[LearningPrediction]) -> list[GameResult]:
    games: list[GameResult] = []
    seen: set[str] = set()
    for prediction in predictions:
        if not prediction.game_id or prediction.game_id in seen:
            continue
        seen.add(prediction.game_id)
        games.append(
            GameResult(
                game_id=prediction.game_id,
                date="",
                away_team=prediction.opponent,
                home_team=prediction.team,
                away_score=None,
                home_score=None,
                winner="",
                status="UNKNOWN",
                venue="",
                game_start_time="",
                source="prediction_artifact",
                retrieved_at="",
            )
        )
    return games


def _game_process_grade(grades: list[dict[str, object]]) -> str:
    labels = {str(row.get("process_label")) for row in grades}
    if "CORRECT_PROCESS_GOOD_RESULT" in labels:
        return "CORRECT_PROCESS_GOOD_RESULT"
    if "RIGHT_TEAM_WRONG_PLAYER" in labels:
        return "RIGHT_TEAM_WRONG_PLAYER"
    if "MIXED_PROCESS_BAD_RESULT" in labels:
        return "MIXED_PROCESS_BAD_RESULT"
    if "CORRECT_PROCESS_BAD_RESULT" in labels:
        return "CORRECT_PROCESS_BAD_RESULT"
    if labels:
        return sorted(labels)[0]
    return "INCONCLUSIVE"


def _game_result_grade(leans: list[dict[str, object]]) -> str:
    if any(row.get("result_label") == "WON" for row in leans):
        return "HIT"
    if any(row.get("result_label") == "LOST" for row in leans):
        return "MISS"
    return "UNKNOWN"


def _lean_result(leans: list[dict[str, object]]) -> str:
    if not leans:
        return "NO_LEAN"
    return "; ".join(str(row.get("game_lean_result") or row.get("result_label") or "UNKNOWN") for row in leans)


def _validated_text(grades: list[dict[str, object]], prediction_type: str) -> str:
    rows = [row for row in grades if row.get("prediction_type") == prediction_type]
    if not rows:
        return "not_called"
    return "true" if any(row.get("result_label") == "VALIDATED" for row in rows) else "false"


def _game_lesson(grades: list[dict[str, object]], hidden: list[str]) -> str:
    if hidden:
        return "Team environment produced supporting-cast winners; widen the player search next slate."
    if any(row.get("process_label") == "RIGHT_TEAM_WRONG_PLAYER" for row in grades):
        return "Team read was useful, but player selection was too narrow."
    if any(row.get("process_label") == "MIXED_PROCESS_BAD_RESULT" for row in grades):
        return "Game read had partial signal support, but the weighting rule was flawed."
    if any(row.get("result_label") == "LOST" for row in grades):
        return "Keep team lean result separate from player prop confidence."
    return "No strong game-level lesson available."


def _top_lessons(prediction_grades: list[dict[str, object]], hidden_winners: list[dict[str, object]]) -> list[str]:
    lessons: list[str] = []
    if any(row.get("process_label") == "RIGHT_PLAYER_WRONG_PROP_SUBTYPE" for row in prediction_grades):
        lessons.append("Separate HR, TB/XBH, and hits/contact profiles before carrying a player across markets.")
    if any(row.get("process_label") == "RIGHT_TEAM_WRONG_PLAYER" for row in prediction_grades):
        lessons.append("When the team environment is right but the player misses, scan the supporting cast before calling the thesis wrong.")
    if any(row.get("process_label") == "MIXED_PROCESS_BAD_RESULT" for row in prediction_grades):
        lessons.append("Separate partial-valid game context from flawed weighting before calling a lean good process.")
    if hidden_winners:
        lessons.append("Add a supporting-cast search pass for productive lineup-depth bats in strong environments.")
    if any(row.get("process_label") == "STALE_ASSUMPTION" for row in prediction_grades):
        lessons.append("Invalidate stale rows when lineup, starter, injury, weather, or prop availability changes.")
    lessons.append("Do not overfit process labels to final score; keep result and baseball reasoning separate.")
    return lessons[:5]


def _known_limitations() -> list[str]:
    return [
        "Contact-quality process grading is limited unless final Statcast data is available.",
        "Some good-process/bad-result labels require future pitch-level and hard-contact enrichment.",
        "v1 is deterministic and rule-based, not a trained model.",
        "Treat these artifacts as learning infrastructure, not final truth.",
    ]


def _bullet_rows(rows: list[dict[str, object]], empty: str) -> list[str]:
    if not rows:
        return [f"- {empty}"]
    return [
        f"- {row.get('prediction_type')} {row.get('player_name') or row.get('team') or row.get('game')}: "
        f"{row.get('process_label')} / {row.get('result_label')} - {row.get('model_lesson')}"
        for row in rows
    ]


def _capped_bullet_rows(rows: list[dict[str, object]], empty: str, *, limit: int) -> list[str]:
    if not rows:
        return [f"- {empty}"]
    capped = _bullet_rows(rows[:limit], empty)
    remaining = len(rows) - limit
    if remaining > 0:
        capped.append(f"- Additional examples capped: {remaining} rows remain in prediction_grades.csv.")
    return capped


def _bullet_hidden(rows: list[dict[str, object]]) -> list[str]:
    if not rows:
        return ["- No hidden supporting-cast winners detected."]
    return [
        f"- {row['player_name']} ({row['team']}): {row['actual_h']} H, {row['actual_tb']} TB, {row['actual_hr']} HR; "
        f"{row.get('hidden_winner_lineup_band', 'UNKNOWN')} / {row.get('hidden_winner_result_type', 'CONTACT')} - "
        f"{row.get('future_search_rule') or row['future_rule']}"
        for row in rows
    ]


def _right_game_wrong_bat_table(right_team_rows: list[dict[str, object]], hidden_winners: list[dict[str, object]]) -> list[str]:
    if not right_team_rows:
        return ["- No rows cleared the stricter right-game/wrong-bat gate."]
    hidden_by_team_game: dict[tuple[str, str], list[dict[str, object]]] = defaultdict(list)
    hidden_by_team: dict[str, list[dict[str, object]]] = defaultdict(list)
    for winner in hidden_winners:
        team = str(winner.get("team") or "")
        game = str(winner.get("game") or "")
        hidden_by_team_game[(team, game)].append(winner)
        hidden_by_team[team].append(winner)

    grouped: dict[tuple[str, str], list[dict[str, object]]] = defaultdict(list)
    for row in right_team_rows:
        grouped[(str(row.get("game") or ""), str(row.get("team") or ""))].append(row)

    lines = [
        "| Game/team environment | Missed/overweighted target(s) | Actual supporting-cast winner(s) | What EchoIQ got right | What EchoIQ got wrong | Next-slate search rule |",
        "|---|---|---|---|---|---|",
    ]
    for (game, team), rows in sorted(grouped.items(), key=lambda item: (-len(item[1]), item[0][0], item[0][1]))[:10]:
        winners = _mapped_hidden_winners(team, game, rows, hidden_by_team_game, hidden_by_team)
        targets = _dedupe([str(row.get("player_name") or row.get("team") or "") for row in rows if row.get("player_name") or row.get("team")])[:6]
        winner_names = _dedupe([str(row.get("player_name") or "") for row in winners if row.get("player_name")])
        if not winner_names:
            winner_names = _dedupe([_teammate_from_miss_reason(str(row.get("miss_reason") or "")) for row in rows])[:5]
        lines.append(
            "| "
            + " | ".join(
                _md_cell(value)
                for value in [
                    f"{game} / {team}",
                    "; ".join(targets) or "no target mapped",
                    "; ".join([name for name in winner_names if name]) or "supporting-cast winner not mapped",
                    _right_bat_got_right(team, winners),
                    _right_bat_got_wrong(targets, winners),
                    _right_bat_next_rule(winners),
                ]
            )
            + " |"
        )
    remaining = len(grouped) - 10
    if remaining > 0:
        lines.append("")
        lines.append(f"- Additional game/team groups capped: {remaining} remain in prediction_grades.csv.")
    return lines


def _mapped_hidden_winners(
    team: str,
    game: str,
    rows: list[dict[str, object]],
    hidden_by_team_game: dict[tuple[str, str], list[dict[str, object]]],
    hidden_by_team: dict[str, list[dict[str, object]]],
) -> list[dict[str, object]]:
    winners = list(hidden_by_team_game.get((team, game), []))
    if not winners:
        winners = [winner for winner in hidden_by_team.get(team, []) if _same_game_text(game, str(winner.get("game") or ""))]
    teammate_names = _dedupe([_teammate_from_miss_reason(str(row.get("miss_reason") or "")) for row in rows])
    for teammate in teammate_names:
        if not teammate:
            continue
        if not any(_norm(str(winner.get("player_name") or "")) == _norm(teammate) for winner in winners):
            winners.append({"player_name": teammate, "future_search_rule": "", "hidden_winner_lineup_band": "", "hidden_winner_result_type": ""})
    return winners[:6]


def _same_game_text(left: str, right: str) -> bool:
    left_parts = set(left.replace("@", " ").split())
    right_parts = set(right.replace("@", " ").split())
    return bool(left_parts and right_parts and len(left_parts.intersection(right_parts)) >= 2)


def _teammate_from_miss_reason(value: str) -> str:
    marker = "RIGHT_TEAM_WRONG_PLAYER:"
    return value.split(marker, 1)[1].strip() if marker in value else ""


def _right_bat_got_right(team: str, winners: list[dict[str, object]]) -> str:
    if winners:
        result_types = _dedupe([str(winner.get("hidden_winner_result_type") or "") for winner in winners if winner.get("hidden_winner_result_type")])
        return f"{team} environment produced supporting-cast payoff" + (f" ({', '.join(result_types[:3])})" if result_types else "")
    return f"{team} environment signal had teammate support"


def _right_bat_got_wrong(targets: list[str], winners: list[dict[str, object]]) -> str:
    if winners:
        bands = _dedupe([str(winner.get("hidden_winner_lineup_band") or "") for winner in winners if winner.get("hidden_winner_lineup_band")])
        band_text = f"; missed {', '.join(bands[:3])} bats" if bands else ""
        return f"Overweighted {', '.join(targets[:3]) or 'primary targets'}{band_text}"
    return f"Overweighted {', '.join(targets[:3]) or 'primary targets'} without mapping the payoff bat"


def _right_bat_next_rule(winners: list[dict[str, object]]) -> str:
    rules = _dedupe([str(winner.get("future_search_rule") or winner.get("future_rule") or "") for winner in winners if winner.get("future_search_rule") or winner.get("future_rule")])
    return rules[0] if rules else "Map same-team payoff bats before using right-team/wrong-player as a process credit."


def _flawed_process_table(rows: list[dict[str, object]]) -> list[str]:
    if not rows:
        return ["- No mixed or bad-process rows detected."]
    lines = [
        "| Game/prediction | Process flaw label | What was partly right | What was wrong | Rule change |",
        "|---|---|---|---|---|",
    ]
    for row in rows[:10]:
        flaw = str(row.get("miss_reason") or row.get("process_label") or "")
        lines.append(
            "| "
            + " | ".join(
                _md_cell(value)
                for value in [
                    f"{row.get('game') or ''} / {row.get('team') or row.get('player_name') or row.get('prediction_id')}",
                    flaw,
                    _flawed_partly_right(row),
                    _flawed_wrong(row, flaw),
                    _flawed_rule_change(flaw, str(row.get("model_lesson") or "")),
                ]
            )
            + " |"
        )
    remaining = len(rows) - 10
    if remaining > 0:
        lines.append("")
        lines.append(f"- Additional flawed-process examples capped: {remaining} rows remain in prediction_grades.csv.")
    return lines


def _flawed_partly_right(row: dict[str, object]) -> str:
    reason = str(row.get("pregame_reason") or "")
    if "contact" in reason.lower():
        return "Contact or environment signal existed."
    if "bullpen" in reason.lower() or "pen" in reason.lower():
        return "Bullpen/context concern was visible."
    if "pitcher" in reason.lower() or "sp" in reason.lower():
        return "Pitcher edge was part of the read."
    if "weather" in reason.lower() or "park" in reason.lower() or "wind" in reason.lower():
        return "Environment risk was part of the read."
    return "Some input signal was directionally useful."


def _flawed_wrong(row: dict[str, object], flaw: str) -> str:
    mapping = {
        "CONTACT_CLUSTER_UNDERWEIGHTED": "Opponent contact cluster was seen but not weighted enough.",
        "CONFIDENCE_OVERSTATED": "Volatility was real but confidence was too high.",
        "SP_EDGE_CONVERTED_TO_TEAM_EDGE": "Pitcher edge was converted into a side without enough team support.",
        "PARK_WEATHER_UNDERVERIFIED": "Park/weather context was not enough to justify side or player allocation.",
        "BULLPEN_FATIGUE_OVERGENERALIZED": "Bullpen fatigue was overgeneralized without enough leverage detail.",
        "ONE_STAR_CARRYING_TEAM_LEAN": "One star or cluster carried too much of the side thesis.",
    }
    return mapping.get(flaw, str(row.get("model_lesson") or "Weighting rule did not survive review."))


def _flawed_rule_change(flaw: str, lesson: str) -> str:
    mapping = {
        "CONTACT_CLUSTER_UNDERWEIGHTED": "Promote opponent contact clusters to a side-lean veto check.",
        "CONFIDENCE_OVERSTATED": "Cap confidence when the edge comes from volatility rather than stable superiority.",
        "SP_EDGE_CONVERTED_TO_TEAM_EDGE": "Keep pitcher/K edge separate from team-side confidence unless bats also clear.",
        "PARK_WEATHER_UNDERVERIFIED": "Require verified park/weather plus player allocation before using environment as a side edge.",
        "BULLPEN_FATIGUE_OVERGENERALIZED": "Require exact leverage/availability before bullpen fatigue can drive a side.",
        "ONE_STAR_CARRYING_TEAM_LEAN": "Add a lineup-depth confirmation before one star can carry a team lean.",
    }
    return mapping.get(flaw, lesson or "Make the weighting flaw explicit before reusing this signal.")


def _md_cell(value: object) -> str:
    return str(value or "").replace("|", "/").replace("\n", " ").strip()


def _mixed_or_bad_process_rows(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    labels = {"MIXED_PROCESS_BAD_RESULT", "BAD_PROCESS_BAD_RESULT", "BAD_PROCESS_GOOD_RESULT"}
    return [row for row in rows if row.get("process_label") in labels]


def _final_board_bullets(final_rows: list[dict[str, object]], lottery_rows: list[dict[str, object]]) -> list[str]:
    if not final_rows and not lottery_rows:
        return ["- No final EchoIQ chat-board CSV rows were present."]
    source_counts = Counter(str(row.get("prediction_source") or "UNKNOWN") for row in final_rows)
    phase_counts = Counter(str(row.get("prediction_phase") or "UNKNOWN") for row in final_rows)
    rows = [
        f"- Final/repo separation: final EchoIQ rows={len(final_rows)}, lottery discussion rows={len(lottery_rows)}.",
        f"- Final row sources: {_counter_text(source_counts)}.",
        f"- Final row phases: {_counter_text(phase_counts)}.",
    ]
    rows.extend(_bullet_rows(_rows_with_results(final_rows, {"HIT", "STRONG_HIT", "WON", "VALIDATED"})[:5], "No final chat-board hits detected."))
    rows.extend(_bullet_rows(_rows_with_results(final_rows, {"MISS", "LOST", "NOT_VALIDATED"})[:5], "No final chat-board misses detected."))
    return rows


def _lesson_bullets(rows: list[dict[str, object]], prediction_type: str) -> list[str]:
    lessons = _dedupe([str(row.get("model_lesson") or "") for row in rows if row.get("prediction_type") == prediction_type and row.get("model_lesson")])
    return _bullet_or_default(lessons[:5], "No rows available for this model lane.")


def _game_lesson_bullets(rows: list[dict[str, object]]) -> list[str]:
    lessons = _dedupe([str(row.get("model_lesson") or "") for row in rows if row.get("model_lesson")])
    return _bullet_or_default(lessons[:5], "No game/team lessons available.")


def _bullet_or_default(values: list[str], empty: str) -> list[str]:
    return [f"- {value}" for value in values] if values else [f"- {empty}"]


def _rows_with_results(rows: list[dict[str, object]], labels: set[str]) -> list[dict[str, object]]:
    return [row for row in rows if str(row.get("result_label")) in labels and not str(row.get("prediction_id")).startswith("hidden_winner:")]


def _is_final_echoiq_row(row: dict[str, object]) -> bool:
    return str(row.get("prediction_source") or "").startswith("final_echoiq") or str(row.get("prediction_phase") or "") in {"final_chat_board", "lottery_discussion"}


def _counter_text(counter: Counter[str]) -> str:
    return ", ".join(f"{key}={value}" for key, value in counter.most_common()) or "none"


def _safe_tier(value: object) -> str:
    text = _clean(value).upper()
    if text in OFFICIAL_BET_WORDS:
        return "OFFICIAL_LABEL_NOT_PROMOTED"
    return text


def _missed_star_players(player: PlayerPerformance, prediction_grades: list[dict[str, object]]) -> list[str]:
    missed: list[str] = []
    for row in prediction_grades:
        if row.get("team") != player.team:
            continue
        if row.get("game") != _game_label(player.team, player.opponent):
            continue
        if row.get("player_name") == player.player_name:
            continue
        if row.get("result_label") not in {"MISS", "PARTIAL_SINGLE_ONLY", "REACHED_BUT_NO_HIT"}:
            continue
        name = str(row.get("player_name") or "").strip()
        if name:
            missed.append(name)
    return _dedupe(missed)[:5]


def _lineup_band(slot: int | None) -> str:
    if slot is None:
        return "UNKNOWN"
    if slot <= 4:
        return "TOP_4"
    if slot <= 6:
        return "MIDDLE_5_6"
    return "LOWER_7_9"


def _hidden_result_type(hits: int, total_bases: int, home_runs: int) -> str:
    if home_runs >= 1:
        return "HR"
    if total_bases >= 2:
        return "TB"
    if hits >= 2:
        return "MULTI_HIT"
    return "CONTACT"


def _hidden_team_environment_validated(
    player: PlayerPerformance,
    game: GameResult | None,
    hits: int,
    total_bases: int,
    home_runs: int,
) -> bool:
    if home_runs >= 1 or total_bases >= 2 or hits >= 2:
        return True
    if game is None:
        return False
    team_score, _opponent_score = _team_scores(player.team, game)
    score = _int_or_none(team_score)
    return score is not None and score >= 5


def _supporting_cast_reason(
    player: PlayerPerformance,
    missed_stars: list[str],
    lineup_band: str,
    result_type: str,
    same_team_environment_validated: bool,
) -> str:
    parts = [f"{result_type} production from {lineup_band} lineup band"]
    if missed_stars:
        parts.append(f"missed predicted teammate(s): {', '.join(missed_stars[:3])}")
    if same_team_environment_validated:
        parts.append("same-team environment produced usable boxscore support")
    if player.statcast_signal_tags:
        parts.append(f"statcast={player.statcast_signal_tags}")
    return "; ".join(parts)


def _hidden_future_rule(missed_signal: str, lineup_band: str = "", result_type: str = "") -> str:
    if lineup_band in {"MIDDLE_5_6", "LOWER_7_9"}:
        return f"Run a supporting-cast scan for {lineup_band} bats when top targets depend on the same environment."
    if result_type == "MULTI_HIT":
        return "Treat multi-hit contact floors as separate from HR ceilings."
    if missed_signal == "lineup_depth":
        return "Search lineup-depth bats when the game environment is strong."
    if missed_signal == "contact_floor":
        return "Treat multi-hit contact floors as separate from HR ceilings."
    if missed_signal == "pitch_fit":
        return "Run a pitch-fit scan for non-star bats before finalizing power watchlists."
    return "Do not let star names crowd out supporting-cast winners."


def _hit_rate(hits: int, total: int) -> str:
    if total <= 0:
        return "NA"
    return f"{hits}/{total} ({hits / total:.1%})"


def _count_process(rows: list[dict[str, object]], label: str) -> int:
    return sum(1 for row in rows if row.get("process_label") == label)


def _game_lean_record(
    rows: list[dict[str, object]],
    predicate: Any | None = None,
) -> dict[str, object]:
    game_rows = [
        row
        for row in rows
        if row.get("prediction_type") == "GAME_LEAN" and (predicate is None or predicate(row))
    ]
    wins = sum(1 for row in game_rows if row.get("result_label") == "WON")
    losses = sum(1 for row in game_rows if row.get("result_label") == "LOST")
    mixed = sum(1 for row in game_rows if row.get("process_label") == "MIXED_PROCESS_BAD_RESULT")
    return {"wins": wins, "losses": losses, "mixed_process": mixed, "rows": len(game_rows), "record": f"{wins}-{losses}"}


def _score(game: GameResult) -> str:
    if game.away_score is None or game.home_score is None:
        return "NA"
    return f"{game.away_team} {game.away_score}, {game.home_team} {game.home_score}"


def _resolved_game(prediction: LearningPrediction, game: GameResult | None) -> str:
    if game is not None:
        return _game_label(game.away_team, game.home_team)
    return prediction.game or _game_label(prediction.team, prediction.opponent)


def _game_label(left: str, right: str) -> str:
    if left and right:
        return f"{left}@{right}"
    return left or right or ""


def _same_team(left: str, right: str) -> bool:
    return _clean(left).upper() == _clean(right).upper()


def _player_key(player: str, team: str) -> tuple[str, str]:
    return (_norm(player), _clean(team).upper())


def _norm(value: str) -> str:
    return " ".join(_clean(value).lower().split())


def _clean(value: object) -> str:
    return str(value or "").strip()


def _int_or_none(value: object) -> int | None:
    text = _clean(value)
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def _float_or_none(value: object) -> float | None:
    text = _clean(value)
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _dedupe(values: Iterable[str]) -> list[str]:
    output: list[str] = []
    seen: set[str] = set()
    for value in values:
        text = str(value or "").strip()
        if text and text not in seen:
            seen.add(text)
            output.append(text)
    return output


def _empty_summary() -> dict[str, object]:
    return {
        "games_graded": 0,
        "player_predictions_graded": 0,
        "final_echoiq_predictions_graded": 0,
        "lottery_discussion_predictions_graded": 0,
        "hr_hit_rate": "NA",
        "tb_hit_rate": "NA",
        "game_lean_record": "0-0",
        "right_team_wrong_player_count": 0,
        "right_player_wrong_prop_count": 0,
        "hidden_winners_count": 0,
        "top_5_lessons": [],
    }
