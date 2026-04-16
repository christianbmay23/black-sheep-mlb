#!/usr/bin/env python3
"""Backtest MLB prop targets using batter outlook exports + manual prop results."""
from __future__ import annotations

import argparse
import csv
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from statistics import mean

OUT_DIR = Path(__file__).resolve().parent
DEFAULT_OUTLOOK_CSV = OUT_DIR / "mlb-pregame-intel-apr15-batter-outlooks.csv"
DEFAULT_RESULTS_CSV = OUT_DIR / "prop_results_apr15.csv"
TRACKER_CSV = OUT_DIR / "model_prop_performance_tracker_apr15.csv"
SUMMARY_MD = OUT_DIR / "model_prop_performance_summary_apr15.md"

SUPPORTED_PROP_TYPES = {"HR", "2+ TB", "K", "OUTS", "HIT", "RBI", "RUN"}
TEMPLATE_HEADERS = [
    "date",
    "game",
    "player",
    "team",
    "prop_type",
    "line",
    "market_odds",
    "closing_odds",
    "result",
    "notes",
]


@dataclass
class ModelProp:
    date: str
    game: str
    player: str
    team: str
    prop_type: str
    model_probability: float | None
    fair_odds: str
    tier: str
    confidence: str


@dataclass
class TrackerRow:
    date: str
    game: str
    player: str
    team: str
    prop_type: str
    model_probability: float | None
    fair_odds: str
    market_odds: str
    market_implied_probability: float | None
    edge_percent: float | None
    tier: str
    confidence: str
    result: str
    outcome: str
    profit_loss_units: float | None
    closing_odds: str
    closing_line_value: float | None
    notes: str
    eval_mode: str


def normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (value or "").lower())


def parse_american(odds_value: str) -> int | None:
    text = (odds_value or "").strip().replace("−", "-")
    if text in {"", "—", "NA", "N/A", "None", "none", "null"}:
        return None
    try:
        return int(text)
    except ValueError:
        return None


def implied_probability_from_american(odds: int | None) -> float | None:
    if odds is None:
        return None
    if odds > 0:
        return 100 / (odds + 100)
    return abs(odds) / (abs(odds) + 100)


def normalize_result(result_value: str) -> str:
    text = (result_value or "").strip().lower()
    if text in {"w", "win", "won", "yes", "y", "1", "over", "hit"}:
        return "W"
    if text in {"l", "loss", "lost", "no", "n", "0", "under", "miss"}:
        return "L"
    if text in {"p", "push", "void", "cancelled", "canceled", "tie"}:
        return "P"
    return ""


def profit_loss_units(outcome: str, market_odds: int | None) -> float | None:
    if market_odds is None or outcome not in {"W", "L", "P"}:
        return None
    if outcome == "P":
        return 0.0
    if outcome == "L":
        return -1.0
    if market_odds > 0:
        return market_odds / 100
    return 100 / abs(market_odds)


def build_template(results_csv: Path) -> None:
    with results_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(TEMPLATE_HEADERS)


def load_model_props(outlook_csv: Path) -> dict[tuple[str, str, str, str], ModelProp]:
    with outlook_csv.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        raise ValueError("Batter outlook CSV is empty.")

    model_map: dict[tuple[str, str, str, str], ModelProp] = {}
    for row in rows:
        date = row.get("report_date", "").strip()
        game = row.get("game", "").strip().upper()
        player = row.get("batter", "").strip()
        team = row.get("team", "").strip().upper()
        tier = row.get("tier", "").strip()
        confidence = row.get("data_confidence", "").strip()

        hr_prob = float(row.get("hr_prob_pct") or 0)
        hr_fair = row.get("fair_hr_american", "").strip()
        key_hr = (game, normalize_name(player), team, "HR")
        model_map[key_hr] = ModelProp(date, game, player, team, "HR", hr_prob, hr_fair, tier, confidence)

        tb_prob = float(row.get("tb2_prob_pct") or 0)
        tb_fair = row.get("fair_2tb_american", "").strip()
        key_tb = (game, normalize_name(player), team, "2+ TB")
        model_map[key_tb] = ModelProp(date, game, player, team, "2+ TB", tb_prob, tb_fair, tier, confidence)

    return model_map


def load_results(results_csv: Path) -> tuple[list[dict[str, str]], list[str]]:
    with results_csv.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        headers = reader.fieldnames or []
    warnings: list[str] = []
    missing_headers = [h for h in TEMPLATE_HEADERS if h not in headers]
    if missing_headers:
        warnings.append(
            f"results CSV missing headers: {', '.join(missing_headers)}"
        )
    return rows, warnings


def build_tracker_rows(
    results_rows: list[dict[str, str]],
    model_props: dict[tuple[str, str, str, str], ModelProp],
) -> tuple[list[TrackerRow], list[str]]:
    warnings: list[str] = []
    output: list[TrackerRow] = []

    for idx, row in enumerate(results_rows, start=2):
        date = (row.get("date") or "").strip()
        game = (row.get("game") or "").strip().upper()
        player = (row.get("player") or "").strip()
        team = (row.get("team") or "").strip().upper()
        prop_type = (row.get("prop_type") or "").strip().upper()
        if prop_type == "2TB":
            prop_type = "2+ TB"

        if prop_type not in SUPPORTED_PROP_TYPES:
            warnings.append(f"row {idx}: unsupported prop_type '{prop_type}'")
            continue

        key = (game, normalize_name(player), team, prop_type)
        model = model_props.get(key)

        result_raw = (row.get("result") or "").strip()
        outcome = normalize_result(result_raw)
        if not outcome and result_raw:
            warnings.append(f"row {idx}: unrecognized result '{result_raw}'")

        market_odds_raw = (row.get("market_odds") or "").strip()
        closing_odds_raw = (row.get("closing_odds") or "").strip()
        market_odds = parse_american(market_odds_raw)
        closing_odds = parse_american(closing_odds_raw)

        model_probability = model.model_probability if model else None
        fair_odds = model.fair_odds if model else ""
        tier = model.tier if model else ""
        confidence = model.confidence if model else ""

        if model is None and prop_type in {"HR", "2+ TB"}:
            warnings.append(
                f"row {idx}: could not match model row for {game} {player} {team} {prop_type}"
            )

        market_implied_prob = implied_probability_from_american(market_odds)
        edge_percent = None
        if model_probability is not None and market_implied_prob is not None:
            edge_percent = model_probability - (market_implied_prob * 100)

        clv = None
        if market_odds is not None and closing_odds is not None:
            open_ip = implied_probability_from_american(market_odds)
            close_ip = implied_probability_from_american(closing_odds)
            if open_ip is not None and close_ip is not None:
                clv = (open_ip - close_ip) * 100

        pnl = profit_loss_units(outcome, market_odds)
        eval_mode = "betting_roi" if market_odds is not None else "target_accuracy"

        output.append(
            TrackerRow(
                date=date or (model.date if model else ""),
                game=game,
                player=player or (model.player if model else ""),
                team=team or (model.team if model else ""),
                prop_type=prop_type,
                model_probability=model_probability,
                fair_odds=fair_odds,
                market_odds=market_odds_raw,
                market_implied_probability=market_implied_prob,
                edge_percent=edge_percent,
                tier=tier,
                confidence=confidence,
                result=result_raw,
                outcome=outcome,
                profit_loss_units=pnl,
                closing_odds=closing_odds_raw,
                closing_line_value=clv,
                notes=(row.get("notes") or "").strip(),
                eval_mode=eval_mode,
            )
        )

    return output, warnings


def write_tracker(rows: list[TrackerRow]) -> None:
    with TRACKER_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "date",
                "game",
                "player",
                "team",
                "prop_type",
                "model_probability",
                "fair_odds",
                "market_odds",
                "market_implied_probability",
                "edge_percent",
                "tier",
                "confidence",
                "result",
                "win_loss_push",
                "profit_loss_units",
                "closing_odds",
                "closing_line_value",
                "notes",
                "evaluation_mode",
            ]
        )
        for r in rows:
            writer.writerow(
                [
                    r.date,
                    r.game,
                    r.player,
                    r.team,
                    r.prop_type,
                    "" if r.model_probability is None else f"{r.model_probability:.2f}",
                    r.fair_odds,
                    r.market_odds,
                    "" if r.market_implied_probability is None else f"{r.market_implied_probability * 100:.2f}",
                    "" if r.edge_percent is None else f"{r.edge_percent:.2f}",
                    r.tier,
                    r.confidence,
                    r.result,
                    r.outcome,
                    "" if r.profit_loss_units is None else f"{r.profit_loss_units:.3f}",
                    r.closing_odds,
                    "" if r.closing_line_value is None else f"{r.closing_line_value:.2f}",
                    r.notes,
                    r.eval_mode,
                ]
            )


def format_record(rows: list[TrackerRow]) -> str:
    settled = [r for r in rows if r.outcome in {"W", "L", "P"}]
    wins = sum(1 for r in settled if r.outcome == "W")
    losses = sum(1 for r in settled if r.outcome == "L")
    pushes = sum(1 for r in settled if r.outcome == "P")
    if not settled:
        return "0-0-0"
    return f"{wins}-{losses}-{pushes}"


def roi(rows: list[TrackerRow]) -> float | None:
    bet_rows = [r for r in rows if r.eval_mode == "betting_roi" and r.profit_loss_units is not None and r.outcome in {"W", "L", "P"}]
    if not bet_rows:
        return None
    units = sum(r.profit_loss_units or 0 for r in bet_rows)
    risked = sum(1 for r in bet_rows if r.outcome in {"W", "L"})
    if risked == 0:
        return None
    return units / risked * 100


def summarize(rows: list[TrackerRow], warnings: list[str]) -> str:
    settled = [r for r in rows if r.outcome in {"W", "L", "P"}]
    hr = [r for r in rows if r.prop_type == "HR"]
    tb = [r for r in rows if r.prop_type == "2+ TB"]
    ks = [r for r in rows if r.prop_type == "K"]

    by_type: dict[str, list[TrackerRow]] = defaultdict(list)
    by_tier: dict[str, list[TrackerRow]] = defaultdict(list)
    by_conf: dict[str, list[TrackerRow]] = defaultdict(list)
    for r in rows:
        by_type[r.prop_type].append(r)
        if r.tier:
            by_tier[r.tier].append(r)
        if r.confidence:
            by_conf[r.confidence].append(r)

    best_hits = sorted(
        [r for r in rows if r.outcome == "W" and r.edge_percent is not None],
        key=lambda x: x.edge_percent,
        reverse=True,
    )[:5]
    worst_misses = sorted(
        [r for r in rows if r.outcome == "L" and r.edge_percent is not None],
        key=lambda x: x.edge_percent,
        reverse=True,
    )[:5]

    miss_patterns = Counter()
    for r in rows:
        if r.outcome == "L":
            if r.prop_type == "HR":
                miss_patterns["HR variance"] += 1
            if r.eval_mode == "target_accuracy":
                miss_patterns["No market odds (target-only tracking)"] += 1
            if not r.tier:
                miss_patterns["Missing tier/model linkage"] += 1
            if r.edge_percent is not None and r.edge_percent < 0:
                miss_patterns["Negative edge at open"] += 1

    lines: list[str] = []
    lines.append("# Model Prop Performance Summary — 2026-04-15")
    lines.append("")
    lines.append("## Core separation: target accuracy vs betting ROI")
    lines.append("- **Target accuracy** = whether the prop target hit, regardless of market price.")
    lines.append("- **Betting ROI** = unit profitability, only when market odds exist.")
    lines.append("- Props without market odds are tracked as target accuracy only (never labeled +EV).")
    lines.append("")

    lines.append("## Record snapshot")
    lines.append(f"- Overall prop record: **{format_record(rows)}**")
    lines.append(f"- HR record: **{format_record(hr)}**")
    lines.append(f"- 2+ TB record: **{format_record(tb)}**")
    lines.append(f"- Pitcher K record: **{format_record(ks)}**")
    lines.append(f"- Betting ROI (all priced props): **{'N/A' if roi(rows) is None else f'{roi(rows):.2f}%'}**")
    lines.append(f"- Target-only tracked props (no odds): **{sum(1 for r in rows if r.eval_mode == 'target_accuracy')}**")
    lines.append("")

    lines.append("## ROI by prop type")
    for prop in sorted(by_type):
        value = roi(by_type[prop])
        lines.append(f"- {prop}: {'N/A' if value is None else f'{value:.2f}%'}")
    lines.append("")

    lines.append("## ROI by tier")
    for tier in ["A+", "A", "B", "C", "D"]:
        bucket = by_tier.get(tier, [])
        if bucket:
            value = roi(bucket)
            lines.append(f"- {tier}: {'N/A' if value is None else f'{value:.2f}%'}")
    lines.append("")

    lines.append("## ROI by confidence")
    for conf in ["High", "Medium", "Low"]:
        bucket = by_conf.get(conf, [])
        if bucket:
            value = roi(bucket)
            lines.append(f"- {conf}: {'N/A' if value is None else f'{value:.2f}%'}")
    lines.append("")

    lines.append("## Best hits")
    if best_hits:
        for r in best_hits:
            lines.append(
                f"- {r.game} {r.player} {r.prop_type}: outcome {r.outcome}, edge {r.edge_percent:.2f}%, mode {r.eval_mode}."
            )
    else:
        lines.append("- No priced winning edges available yet.")
    lines.append("")

    lines.append("## Worst misses")
    if worst_misses:
        for r in worst_misses:
            lines.append(
                f"- {r.game} {r.player} {r.prop_type}: outcome {r.outcome}, edge {r.edge_percent:.2f}%, mode {r.eval_mode}."
            )
    else:
        lines.append("- No priced losing edges available yet.")
    lines.append("")

    lines.append("## Failure patterns")
    if miss_patterns:
        for reason, count in miss_patterns.most_common():
            lines.append(f"- {reason}: {count}")
    else:
        lines.append("- No settled losses available to classify.")
    lines.append("")

    lines.append("## Model improvement recommendations")
    lines.append("1. Split evaluation dashboards by prop family: keep HR in a high-variance bucket and treat 2+ TB and K props as core stability buckets.")
    lines.append("2. Enforce a price gate: no +EV label unless market odds are present and model probability exceeds market implied probability by a configured threshold.")
    lines.append("3. Re-run player name normalization checks each slate and maintain alias mapping for recurring mismatches to reduce unlinked rows.")
    lines.append("4. Add rolling 7-day ROI and hit-rate control limits per tier/confidence, and auto-downgrade buckets that underperform.")
    lines.append("")

    if warnings:
        lines.append("## Data-quality warnings")
        for warning in warnings:
            lines.append(f"- {warning}")
        lines.append("")

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--outlook", type=Path, default=DEFAULT_OUTLOOK_CSV, help="Batter outlook export CSV.")
    parser.add_argument("--results", type=Path, default=DEFAULT_RESULTS_CSV, help="Manual prop results CSV.")
    args = parser.parse_args()

    if not args.results.exists():
        build_template(args.results)
        print(f"Created template: {args.results}")
        print("Fill this file with final prop results, then rerun:")
        print("python3 canvases/exports/prop_backtest_tracker.py")
        return

    model_props = load_model_props(args.outlook)
    results_rows, load_warnings = load_results(args.results)
    if not results_rows:
        print(f"No rows in {args.results}. Add props and rerun.")
        return

    tracker_rows, warnings = build_tracker_rows(results_rows, model_props)
    warnings = [*load_warnings, *warnings]
    write_tracker(tracker_rows)

    summary = summarize(tracker_rows, warnings)
    SUMMARY_MD.write_text(summary, encoding="utf-8")

    priced = sum(1 for r in tracker_rows if r.eval_mode == "betting_roi")
    target_only = sum(1 for r in tracker_rows if r.eval_mode == "target_accuracy")
    print(f"Backtest complete. Tracker: {TRACKER_CSV}")
    print(f"Summary: {SUMMARY_MD}")
    print(f"Rows: {len(tracker_rows)} (priced={priced}, target_only={target_only})")
    if warnings:
        print("Warnings:")
        for w in warnings:
            print(f"- {w}")


if __name__ == "__main__":
    main()
