"""Compact terminal summaries for EchoIQ pregame refresh artifacts."""

from __future__ import annotations

import csv
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class PregameRefreshArtifactSummary:
    games_checked: int = 0
    lineups_confirmed: int = 0
    lineups_missing: int = 0
    weather_rows_loaded: int = 0
    weather_verified: int = 0
    market_rows_loaded: int = 0
    player_prop_rows_loaded: int = 0
    news_rows_loaded: int = 0
    watchlist_survival_counts: dict[str, int] = field(default_factory=dict)
    official_bet_eligible_true_count: int = 0
    unresolved_gaps_count: int = 0
    top_gap_classifications: list[str] = field(default_factory=list)
    missing_artifacts: list[str] = field(default_factory=list)


def summarize_pregame_refresh_artifacts(slate_dir: Path) -> PregameRefreshArtifactSummary:
    pregame_dir = Path(slate_dir) / "04_pregame_refresh"
    logs_dir = Path(slate_dir) / "logs"
    missing: list[str] = []

    matrix = _read_csv(pregame_dir / "verification_matrix.csv", missing)
    weather = _read_csv(pregame_dir / "weather_refresh.csv", missing)
    markets = _read_csv(pregame_dir / "market_refresh.csv", missing)
    props = _read_csv(pregame_dir / "player_prop_availability.csv", missing)
    news = _read_csv(pregame_dir / "news_refresh.csv", missing)
    survival = _read_csv(pregame_dir / "watchlist_survival.csv", missing)
    gap_classifications = _read_gap_classifications(logs_dir / "unresolved_gaps.md", missing)

    lineups_confirmed = _count_true(matrix, "lineups_confirmed")
    official_true = _count_true(matrix, "official_bet_eligible") + _count_true(survival, "official_bet_eligible")
    survival_counts = Counter(str(row.get("current_status", "") or "UNKNOWN") for row in survival)
    return PregameRefreshArtifactSummary(
        games_checked=len(matrix),
        lineups_confirmed=lineups_confirmed,
        lineups_missing=max(len(matrix) - lineups_confirmed, 0),
        weather_rows_loaded=len(weather),
        weather_verified=_count_true(weather, "weather_verified"),
        market_rows_loaded=len(markets),
        player_prop_rows_loaded=len(props),
        news_rows_loaded=len(news),
        watchlist_survival_counts=dict(sorted(survival_counts.items())),
        official_bet_eligible_true_count=official_true,
        unresolved_gaps_count=len(gap_classifications),
        top_gap_classifications=gap_classifications[:5],
        missing_artifacts=missing,
    )


def format_pregame_refresh_summary(summary: PregameRefreshArtifactSummary) -> list[str]:
    lines = [
        "Pregame Refresh Compact Summary",
        f"- games checked: {summary.games_checked}",
        f"- lineups confirmed: {summary.lineups_confirmed}",
        f"- lineups missing: {summary.lineups_missing}",
        f"- weather rows loaded: {summary.weather_rows_loaded}",
        f"- weather verified: {summary.weather_verified}",
        f"- market rows loaded: {summary.market_rows_loaded}",
        f"- player prop rows loaded: {summary.player_prop_rows_loaded}",
        f"- news rows loaded: {summary.news_rows_loaded}",
        f"- watchlist survival: {_format_counts(summary.watchlist_survival_counts)}",
        f"- official_bet_eligible true count: {summary.official_bet_eligible_true_count}",
        f"- unresolved gaps count: {summary.unresolved_gaps_count}",
        f"- top 5 gap classifications: {_format_list(summary.top_gap_classifications)}",
    ]
    if summary.missing_artifacts:
        lines.append(f"- missing summary artifacts: {_format_list(summary.missing_artifacts)}")
    return lines


def _read_csv(path: Path, missing: list[str]) -> list[dict[str, str]]:
    if not path.is_file():
        missing.append(str(path))
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def _read_gap_classifications(path: Path, missing: list[str]) -> list[str]:
    if not path.is_file():
        missing.append(str(path))
        return []
    classifications: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped.startswith("|") or "Missing Source" in stripped or "---" in stripped:
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if cells and cells[0]:
            classifications.append(cells[0])
    return classifications


def _count_true(rows: list[dict[str, str]], field: str) -> int:
    return sum(1 for row in rows if str(row.get(field, "")).strip().lower() in {"true", "1", "yes", "y"})


def _format_counts(counts: dict[str, int]) -> str:
    if not counts:
        return "none"
    return ", ".join(f"{key}={value}" for key, value in counts.items())


def _format_list(values: list[str]) -> str:
    if not values:
        return "none"
    return ", ".join(values)
