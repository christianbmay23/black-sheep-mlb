"""Prior EchoIQ prediction discovery and first-pass grading."""

from __future__ import annotations

import csv
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from .schemas import GameResult, PlayerPerformance


PREDICTION_FILES = [
    "04_final_card/official_card.csv",
    "04_final_card/conditional_card.csv",
    "04_final_card/lottery_card.csv",
    "04_final_card/watchlist.csv",
    "03_watchlists/hr_watchlist.csv",
    "03_watchlists/total_bases_watchlist.csv",
    "03_watchlists/hits_watchlist.csv",
    "03_watchlists/game_line_leans.csv",
    "03_verification/pass_avoid.csv",
]


def grade_prior_predictions(
    *,
    repo_root: Path,
    postgame_date: str,
    game_results: list[GameResult],
    player_performance: list[PlayerPerformance],
    generated_at: str,
) -> dict[str, Any]:
    artifacts = find_prior_prediction_artifacts(repo_root=repo_root, postgame_date=postgame_date)
    parsed_rows = _load_prediction_rows(artifacts)

    player_index = {
        (_norm(row.player_name), row.team): row
        for row in player_performance
        if row.player_name and row.team
    }
    winner_by_game: dict[str, str] = {}
    for game in game_results:
        winner_by_game[f"{game.away_team}@{game.home_team}".upper()] = game.winner
        winner_by_game[str(game.game_id)] = game.winner

    grades_by_market: dict[str, Counter[str]] = defaultdict(Counter)
    grades_by_game: dict[str, Counter[str]] = defaultdict(Counter)
    misses: list[dict[str, Any]] = []
    wins: list[dict[str, Any]] = []
    limited_rows: list[dict[str, str]] = []

    for item in parsed_rows:
        row = item["row"]
        market = _market(row)
        game = str(row.get("game") or row.get("game_id") or "")
        team = str(row.get("team") or "")
        player = str(row.get("player") or row.get("player_name") or "")
        grade, qualitative, reason = _grade_row(row, market, game, team, player, player_index, winner_by_game)
        grades_by_market[market][grade] += 1
        grades_by_game[game or "unknown"][grade] += 1
        payload = {
            "source_file": item["source_file"],
            "market": market,
            "game": game,
            "team": team,
            "player": player,
            "grade": grade,
            "qualitative_grade": qualitative,
            "reason_tag": reason,
        }
        if grade == "WIN":
            wins.append(payload)
        elif grade == "LOSS":
            misses.append(payload)
        elif grade in {"UNKNOWN", "NOT_GRADED"}:
            limited_rows.append(payload)

    improvement_notes = _model_improvement_notes(parsed_rows, player_performance, limited_rows)

    if not artifacts:
        improvement_notes.append("No prior prediction artifact found; no model-performance conclusion is available.")
    elif not parsed_rows:
        improvement_notes.append("Prior prediction files were present but contained no rows to grade.")

    return {
        "date": postgame_date,
        "generated_at": generated_at,
        "prior_prediction_artifacts_found": [str(path) for path in artifacts],
        "prior_prediction_rows_found": len(parsed_rows),
        "grading_status": "graded" if parsed_rows else "limited",
        "grades_by_market": {market: dict(counter) for market, counter in sorted(grades_by_market.items())},
        "grades_by_game": {game: dict(counter) for game, counter in sorted(grades_by_game.items())},
        "misses": misses,
        "wins": wins,
        "limited_rows": limited_rows,
        "model_improvement_notes": improvement_notes,
        "unresolved_gaps": _grading_gaps(artifacts, parsed_rows, player_performance),
    }


def find_prior_prediction_artifacts(*, repo_root: Path, postgame_date: str) -> list[Path]:
    roots = [
        repo_root / "slates" / postgame_date,
        repo_root / "reports" / postgame_date,
    ]
    artifacts: list[Path] = []
    for root in roots:
        if not root.exists():
            continue
        for relative in PREDICTION_FILES:
            path = root / relative
            if path.exists():
                artifacts.append(path)
        for path in root.rglob("final_betting_card*.csv"):
            if path not in artifacts:
                artifacts.append(path)
    return sorted(artifacts)


def _load_prediction_rows(paths: list[Path]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in paths:
        try:
            with path.open(newline="", encoding="utf-8") as handle:
                reader = csv.DictReader(handle)
                for row in reader:
                    if any(str(value or "").strip() for value in row.values()):
                        rows.append({"source_file": str(path), "row": row})
        except (OSError, csv.Error):
            continue
    return rows


def _grade_row(
    row: dict[str, str],
    market: str,
    game: str,
    team: str,
    player: str,
    player_index: dict[tuple[str, str], PlayerPerformance],
    winner_by_game: dict[str, str],
) -> tuple[str, str, str]:
    if not market:
        return "NOT_GRADED", "DATA_GAP", "DATA_GAP"
    market_upper = market.upper()
    if "HR" in market_upper or "HOME RUN" in market_upper:
        perf = _find_player(player, team, player_index)
        if perf is None:
            return "UNKNOWN", "DATA_GAP", "INJURY_OR_SCRATCH"
        return ("WIN", "GOOD_PROCESS_GOOD_RESULT", "UNKNOWN") if int(perf.home_runs or 0) > 0 else (
            "LOSS",
            "GOOD_PROCESS_BAD_RESULT",
            "UNKNOWN",
        )
    if "TB" in market_upper or "TOTAL BASE" in market_upper:
        perf = _find_player(player, team, player_index)
        if perf is None:
            return "UNKNOWN", "DATA_GAP", "INJURY_OR_SCRATCH"
        line = _line(row, default=1.5)
        return ("WIN", "GOOD_PROCESS_GOOD_RESULT", "UNKNOWN") if float(perf.total_bases or 0) > line else (
            "LOSS",
            "GOOD_PROCESS_BAD_RESULT",
            "UNKNOWN",
        )
    if "HIT" in market_upper:
        perf = _find_player(player, team, player_index)
        if perf is None:
            return "UNKNOWN", "DATA_GAP", "INJURY_OR_SCRATCH"
        line = _line(row, default=0.5)
        return ("WIN", "GOOD_PROCESS_GOOD_RESULT", "UNKNOWN") if float(perf.hits or 0) > line else (
            "LOSS",
            "GOOD_PROCESS_BAD_RESULT",
            "UNKNOWN",
        )
    if any(token in market_upper for token in ("MONEYLINE", "RUNLINE", "TOTAL", "GAME")):
        winner = winner_by_game.get(game.upper()) or winner_by_game.get(str(row.get("game_id") or ""))
        if not winner:
            return "UNKNOWN", "DATA_GAP", "DATA_GAP"
        if team and winner.upper() == team.upper():
            return "WIN", "GOOD_PROCESS_GOOD_RESULT", "UNKNOWN"
        return "LOSS", "GOOD_PROCESS_BAD_RESULT", "UNKNOWN"
    return "NOT_GRADED", "NOT_APPLICABLE", "UNKNOWN"


def _find_player(player: str, team: str, player_index: dict[tuple[str, str], PlayerPerformance]) -> PlayerPerformance | None:
    if not player:
        return None
    if team:
        found = player_index.get((_norm(player), team))
        if found is not None:
            return found
    for (name, _team), row in player_index.items():
        if name == _norm(player):
            return row
    return None


def _market(row: dict[str, str]) -> str:
    return str(row.get("market_type") or row.get("market") or row.get("prop_type") or "unknown").strip()


def _line(row: dict[str, str], *, default: float) -> float:
    value = row.get("line") or row.get("market_line")
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return default


def _norm(value: str) -> str:
    return " ".join(value.lower().strip().split())


def _model_improvement_notes(
    rows: list[dict[str, Any]],
    player_performance: list[PlayerPerformance],
    limited_rows: list[dict[str, str]],
) -> list[str]:
    notes: list[str] = []
    if player_performance and all(row.exit_velocity_max is None for row in player_performance):
        notes.append("Add Statcast quality-of-contact fields so HR/hits misses can separate weak contact from hard outs.")
    if limited_rows:
        notes.append("Add a stricter prior-card schema map so every market row has explicit game, team, player, market, line, and odds fields.")
    if rows:
        notes.append("Add late lineup/scratch reason capture before final grading so INJURY_OR_SCRATCH can be verified instead of inferred.")
    return notes


def _grading_gaps(
    artifacts: list[Path],
    rows: list[dict[str, Any]],
    player_performance: list[PlayerPerformance],
) -> list[str]:
    gaps: list[str] = []
    if not artifacts:
        gaps.append("No prior EchoIQ prediction artifact found.")
    if artifacts and not rows:
        gaps.append("Prediction artifact files existed but no prediction rows were present.")
    if player_performance and all(row.exit_velocity_max is None for row in player_performance):
        gaps.append("Statcast quality-of-contact data unavailable; process grading falls back to boxscore-only.")
    return gaps
