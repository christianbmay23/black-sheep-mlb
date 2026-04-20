#!/usr/bin/env python3
"""Backtest prior MLB predictions and generate a performance tracker."""
from __future__ import annotations

import argparse
import csv
import json
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from statistics import mean

OUT_DIR = Path(__file__).resolve().parent
DEFAULT_SLUG = "apr15"

MLB_TEAM_ALIASES = {
    "AZ": "ARI",
    "WSN": "WSH",
    "SDP": "SD",
    "SFG": "SF",
    "KCR": "KC",
    "TBR": "TB",
    "CHW": "CWS",
    "NYY": "NYY",
    "NYM": "NYM",
    "LAD": "LAD",
    "LAA": "LAA",
    "SEA": "SEA",
    "ATH": "ATH",
    "OAK": "ATH",
}

MANUAL_RESULTS_BY_DATE: dict[str, dict[str, str]] = {
    "2026-04-15": {
        "WSH@PIT": "PIT",
        "SF@CIN": "CIN",
        "KC@DET": "DET",
        "CHC@PHI": "CHC",
        "LAA@NYY": "NYY",
        "MIA@ATL": "ATL",
        "TOR@MIL": "MIL",
        "TB@CWS": "TB",
        "COL@HOU": "HOU",
        "TEX@ATH": "ATH",
        "SEA@SD": "SD",
        "NYM@LAD": "LAD",
    }
}


@dataclass
class BacktestRow:
    matchup: str
    predicted_winner: str
    market_favorite: str
    actual_winner: str
    was_correct: bool
    baseline_was_correct: bool
    model_confidence: str
    decision_tier: str
    edge_on_pick_pct: float
    missing_data_flags: str
    rationale_summary: str


def slug_from_date_input(date_input: str) -> str:
    clean = (date_input or "").strip().lower()
    if not clean:
        return DEFAULT_SLUG
    try:
        dt = datetime.strptime(clean, "%Y-%m-%d")
        return f"{dt.strftime('%b').lower()}{dt.day}"
    except ValueError:
        return clean


def normalize_team(team: str) -> str:
    value = (team or "").strip().upper()
    return MLB_TEAM_ALIASES.get(value, value)


def parse_float(value: str) -> float | None:
    text = (value or "").strip()
    if text in {"", "NA", "N/A", "None", "null"}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def implied_probability_from_american(odds: float | None) -> float | None:
    if odds is None:
        return None
    if odds > 0:
        return 100 / (odds + 100)
    return abs(odds) / (abs(odds) + 100)


def is_scored_prediction_row(row: dict[str, str]) -> bool:
    scoring_status = (row.get("scoring_status") or "").strip().lower()
    if scoring_status:
        return scoring_status == "scored"
    return (row.get("game_status_bucket") or "pregame").strip().lower() == "pregame"


def market_favorite_pick(row: dict[str, str]) -> str:
    away = normalize_team(row.get("away", ""))
    home = normalize_team(row.get("home", ""))
    away_prob = parse_float(row.get("implied_away_pct_nv", ""))
    home_prob = parse_float(row.get("implied_home_pct_nv", ""))
    if away_prob is not None and home_prob is not None:
        return away if away_prob >= home_prob else home

    away_odds = implied_probability_from_american(parse_float(row.get("away_american", "")))
    home_odds = implied_probability_from_american(parse_float(row.get("home_american", "")))
    if away_odds is None or home_odds is None:
        return ""
    return away if away_odds >= home_odds else home

def fetch_completed_game_winners(date_str: str) -> dict[str, str]:
    query = urllib.parse.urlencode(
        {
            "sportId": 1,
            "date": date_str,
            "hydrate": "team,linescore",
        }
    )
    url = f"https://statsapi.mlb.com/api/v1/schedule?{query}"
    with urllib.request.urlopen(url, timeout=30) as response:
        payload = json.load(response)

    winners: dict[str, str] = {}
    for date_block in payload.get("dates", []):
        for game in date_block.get("games", []):
            status = game.get("status", {}).get("detailedState", "")
            if status != "Final":
                continue
            teams = game.get("teams", {})
            away = normalize_team(teams.get("away", {}).get("team", {}).get("abbreviation", ""))
            home = normalize_team(teams.get("home", {}).get("team", {}).get("abbreviation", ""))
            if not away or not home:
                continue
            away_won = teams.get("away", {}).get("isWinner", False)
            home_won = teams.get("home", {}).get("isWinner", False)
            if away_won == home_won:
                continue
            winners[f"{away}@{home}"] = away if away_won else home
    return winners


def resolve_actual_winners(date_str: str) -> tuple[dict[str, str], str]:
    try:
        winners = fetch_completed_game_winners(date_str)
        if winners:
            return winners, "mlb_stats_api"
    except Exception:
        pass
    fallback = MANUAL_RESULTS_BY_DATE.get(date_str, {})
    if fallback:
        return fallback, "manual_fallback"
    return {}, "unavailable"


def load_predictions(csv_path: Path) -> tuple[str, list[dict[str, str]], int]:
    with csv_path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        raise ValueError("Predictions CSV is empty.")
    date_str = rows[0]["report_date"]
    return date_str, [row for row in rows if is_scored_prediction_row(row)], len(rows)


def build_backtest_rows(predictions: list[dict[str, str]], actual_winners: dict[str, str]) -> list[BacktestRow]:
    rows: list[BacktestRow] = []
    for pred in predictions:
        away = normalize_team(pred["away"])
        home = normalize_team(pred["home"])
        matchup = f"{away}@{home}"
        predicted_winner = normalize_team(pred["prediction"])
        market_favorite = market_favorite_pick(pred)
        actual_winner = actual_winners.get(matchup, "")
        was_correct = predicted_winner == actual_winner if actual_winner else False
        baseline_was_correct = market_favorite == actual_winner if actual_winner and market_favorite else False
        rows.append(
            BacktestRow(
                matchup=matchup,
                predicted_winner=predicted_winner,
                market_favorite=market_favorite,
                actual_winner=actual_winner,
                was_correct=was_correct,
                baseline_was_correct=baseline_was_correct,
                model_confidence=pred["model_confidence"],
                decision_tier=pred["decision_tier_vs_market"],
                edge_on_pick_pct=parse_float(pred.get("edge_on_pick_pct", "")) or 0.0,
                missing_data_flags=pred["missing_data_flags"],
                rationale_summary=pred["rationale_summary"],
            )
        )
    return rows


def write_tracker_csv(rows: list[BacktestRow], date_str: str, tracker_csv: Path) -> None:
    with tracker_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "report_date",
                "matchup",
                "predicted_winner",
                "market_favorite",
                "actual_winner",
                "was_correct",
                "baseline_was_correct",
                "model_confidence",
                "decision_tier",
                "edge_on_pick_pct",
                "missing_data_flags",
            ]
        )
        for r in rows:
            writer.writerow(
                [
                    date_str,
                    r.matchup,
                    r.predicted_winner,
                    r.market_favorite,
                    r.actual_winner,
                    "Y" if r.was_correct else "N",
                    "Y" if r.baseline_was_correct else "N",
                    r.model_confidence,
                    r.decision_tier,
                    f"{r.edge_on_pick_pct:.2f}",
                    r.missing_data_flags,
                ]
            )


def summarize(rows: list[BacktestRow]) -> dict[str, object]:
    settled = [r for r in rows if r.actual_winner]
    correct = [r for r in settled if r.was_correct]
    baseline_correct = [r for r in settled if r.baseline_was_correct]

    by_tier: dict[str, list[BacktestRow]] = defaultdict(list)
    by_conf: dict[str, list[BacktestRow]] = defaultdict(list)
    flagged: list[BacktestRow] = []
    clean: list[BacktestRow] = []

    for r in settled:
        by_tier[r.decision_tier].append(r)
        by_conf[r.model_confidence].append(r)
        if r.missing_data_flags.strip():
            flagged.append(r)
        else:
            clean.append(r)

    misses = [r for r in settled if not r.was_correct]
    top_hits = sorted(correct, key=lambda r: r.edge_on_pick_pct, reverse=True)[:3]
    top_misses = sorted(misses, key=lambda r: r.edge_on_pick_pct, reverse=True)[:3]

    miss_reasons = Counter()
    for miss in misses:
        flags = [f.strip() for f in miss.missing_data_flags.split(";") if f.strip()]
        if not flags:
            miss_reasons["No missing-data flags"] += 1
        for f in flags:
            miss_reasons[f] += 1

    return {
        "total": len(rows),
        "settled": len(settled),
        "correct": len(correct),
        "accuracy": (len(correct) / len(settled) * 100) if settled else 0,
        "baseline_correct": len(baseline_correct),
        "baseline_accuracy": (len(baseline_correct) / len(settled) * 100) if settled else 0,
        "accuracy_vs_baseline_pct": ((len(correct) - len(baseline_correct)) / len(settled) * 100) if settled else 0,
        "avg_edge_all": mean(r.edge_on_pick_pct for r in settled) if settled else 0,
        "avg_edge_correct": mean(r.edge_on_pick_pct for r in correct) if correct else 0,
        "by_tier": by_tier,
        "by_conf": by_conf,
        "flagged": flagged,
        "clean": clean,
        "top_hits": top_hits,
        "top_misses": top_misses,
        "miss_reasons": miss_reasons,
    }


def format_record(rows: list[BacktestRow]) -> str:
    wins = sum(1 for r in rows if r.was_correct)
    total = len(rows)
    if total == 0:
        return "0-0 (0.0%)"
    return f"{wins}-{total - wins} ({wins / total * 100:.1f}%)"


def recommendations(summary: dict[str, object]) -> list[str]:
    recs: list[str] = []
    flagged = summary["flagged"]
    clean = summary["clean"]
    top_misses = summary["top_misses"]
    by_tier = summary["by_tier"]

    if summary["accuracy"] <= summary["baseline_accuracy"]:
        recs.append(
            "Do not claim improvement yet: the model failed to beat the simple market-favorite baseline on this sample."
        )

    if flagged and clean:
        flagged_acc = sum(r.was_correct for r in flagged) / len(flagged)
        clean_acc = sum(r.was_correct for r in clean) / len(clean)
        if flagged_acc < clean_acc:
            recs.append(
                "Tighten pregame quality gates: downgrade or avoid picks with missing lineup/SP data until 60-90 minutes before first pitch."
            )

    a_plus_rows = by_tier.get("A+", [])
    if a_plus_rows:
        a_plus_acc = sum(r.was_correct for r in a_plus_rows) / len(a_plus_rows)
        if a_plus_acc < 0.6:
            recs.append(
                "Recalibrate high-edge (A+) thresholds; require agreement between model edge and at least one market/line-movement confirmation before labeling top tier."
            )

    if top_misses:
        recs.append(
            "Add a post-lineup re-score pass that updates win probabilities using confirmed batting orders and bullpen availability to reduce late-information misses."
        )

    recs.append(
        "Track results daily by tier/confidence and pause any segment (tier or confidence bucket) that falls below 45% over a rolling 7-day window."
    )
    return recs


def write_summary(date_str: str, summary: dict[str, object], summary_md: Path) -> None:
    by_tier = summary["by_tier"]
    by_conf = summary["by_conf"]
    top_hits = summary["top_hits"]
    top_misses = summary["top_misses"]
    miss_reasons: Counter = summary["miss_reasons"]

    lines: list[str] = []
    lines.append(f"# Model Performance Backtest — {date_str}")
    lines.append("")
    lines.append("## Headline")
    lines.append(
        f"- Settled scored picks: **{summary['settled']}** / {summary['total']}"
    )
    lines.append(
        f"- Model record: **{summary['correct']}-{summary['settled'] - summary['correct']}**"
    )
    lines.append(f"- Model accuracy: **{summary['accuracy']:.1f}%**")
    lines.append(
        f"- Market-favorite baseline: **{summary['baseline_correct']}-{summary['settled'] - summary['baseline_correct']}** (**{summary['baseline_accuracy']:.1f}%**)"
    )
    lines.append(f"- Delta vs baseline: **{summary['accuracy_vs_baseline_pct']:+.1f} pts**")
    lines.append(f"- Avg model edge on picks: **{summary['avg_edge_all']:.2f}%**")
    lines.append("- Standard: current model performance must beat the market-favorite baseline before improvement claims are credible.")
    lines.append("")

    lines.append("## Tracker by tier")
    for tier in ["A+", "A", "B", "C", "D"]:
        rows = by_tier.get(tier, [])
        if rows:
            lines.append(f"- {tier}: {format_record(rows)}")
    lines.append("")

    lines.append("## Tracker by confidence")
    for conf in ["High", "Medium", "Low"]:
        rows = by_conf.get(conf, [])
        if rows:
            lines.append(f"- {conf}: {format_record(rows)}")
    lines.append("")

    lines.append("## Where the model performed well")
    if top_hits:
        for hit in top_hits:
            lines.append(
                f"- {hit.matchup}: picked **{hit.predicted_winner}**, result **{hit.actual_winner}**, edge {hit.edge_on_pick_pct:.2f}% ({hit.decision_tier} / {hit.model_confidence})."
            )
    else:
        lines.append("- No winning picks were recorded.")
    lines.append("")

    lines.append("## Where the model performed poorly")
    if top_misses:
        for miss in top_misses:
            missing = miss.missing_data_flags if miss.missing_data_flags else "none"
            lines.append(
                f"- {miss.matchup}: picked **{miss.predicted_winner}**, actual **{miss.actual_winner}**, edge {miss.edge_on_pick_pct:.2f}% ({miss.decision_tier} / {miss.model_confidence}), missing-data flags: {missing}."
            )
    else:
        lines.append("- No misses were recorded.")
    lines.append("")

    lines.append("## Miss-pattern diagnostics")
    if miss_reasons:
        for reason, count in miss_reasons.most_common():
            lines.append(f"- {reason}: {count} misses")
    else:
        lines.append("- No misses to diagnose.")
    lines.append("")

    lines.append("## Steps going forward")
    for idx, rec in enumerate(recommendations(summary), start=1):
        lines.append(f"{idx}. {rec}")
    lines.append("")

    summary_md.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--date",
        default=DEFAULT_SLUG,
        help="Date slug (apr15) or YYYY-MM-DD; controls derived file paths.",
    )
    parser.add_argument("--csv", type=Path, default=None, help="Predictions CSV file.")
    parser.add_argument("--tracker", type=Path, default=None, help="Tracker CSV output path.")
    parser.add_argument("--summary", type=Path, default=None, help="Summary markdown output path.")
    args = parser.parse_args()

    slug = slug_from_date_input(args.date)
    csv_path = args.csv or (OUT_DIR / f"mlb-pregame-intel-{slug}-games.csv")
    tracker_csv = args.tracker or (OUT_DIR / f"model_performance_tracker_{slug}.csv")
    summary_md = args.summary or (OUT_DIR / f"model_performance_summary_{slug}.md")

    date_str, predictions, total_rows = load_predictions(csv_path)
    actual_winners, source = resolve_actual_winners(date_str)
    backtest_rows = build_backtest_rows(predictions, actual_winners)

    write_tracker_csv(backtest_rows, date_str, tracker_csv)
    summary = summarize(backtest_rows)
    write_summary(date_str, summary, summary_md)

    print(f"Backtest complete for {date_str} ({slug}).")
    print(f"Tracker: {tracker_csv}")
    print(f"Summary: {summary_md}")
    print(f"Scored rows considered: {len(predictions)} / {total_rows}")
    print(f"Model accuracy: {summary['accuracy']:.1f}% ({summary['correct']}/{summary['settled']})")
    print(f"Baseline accuracy: {summary['baseline_accuracy']:.1f}% ({summary['baseline_correct']}/{summary['settled']})")
    print(f"Results source: {source}")


if __name__ == "__main__":
    main()
