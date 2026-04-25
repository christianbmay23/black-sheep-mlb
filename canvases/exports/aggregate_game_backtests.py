#!/usr/bin/env python3
"""Aggregate generated game backtest trackers, strict-current rows by default."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

from backtest_tracker import brier_score, format_metric, format_record, log_loss, BacktestRow

OUT_DIR = Path(__file__).resolve().parent


def load_tracker(path: Path, *, include_legacy: bool) -> list[BacktestRow]:
    out: list[BacktestRow] = []
    with path.open(newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            provenance_mode = (row.get("provenance_mode") or "legacy_compatibility").strip()
            if provenance_mode != "strict_current" and not include_legacy:
                continue
            prob_raw = (row.get("predicted_win_prob") or "").strip()
            out.append(
                BacktestRow(
                    matchup=row.get("matchup", ""),
                    predicted_winner=row.get("predicted_winner", ""),
                    market_favorite=row.get("market_favorite", ""),
                    actual_winner=row.get("actual_winner", ""),
                    was_correct=(row.get("was_correct") == "Y"),
                    baseline_was_correct=(row.get("baseline_was_correct") == "Y"),
                    predicted_win_prob=float(prob_raw) if prob_raw else None,
                    model_confidence=row.get("model_confidence", ""),
                    decision_tier=row.get("decision_tier", ""),
                    edge_on_pick_pct=float(row.get("edge_on_pick_pct") or 0),
                    missing_data_flags=row.get("missing_data_flags", ""),
                    rationale_summary="",
                    provenance_mode=provenance_mode,
                )
            )
    return out


def write_report(rows: list[BacktestRow], output: Path, *, include_legacy: bool) -> None:
    settled = [row for row in rows if row.actual_winner]
    model_wins = sum(row.was_correct for row in settled)
    baseline_wins = sum(row.baseline_was_correct for row in settled)
    mode = "strict_current_plus_legacy" if include_legacy else "strict_current_only"
    lines = [
        f"# Aggregate Game Backtest — {mode}",
        "",
        f"- Rows: **{len(rows)}**",
        f"- Settled rows: **{len(settled)}**",
        f"- Model record: **{format_record(settled)}**",
        f"- Market-favorite baseline: **{baseline_wins}-{len(settled) - baseline_wins}**",
        f"- Delta vs baseline: **{model_wins - baseline_wins:+d} games**",
        f"- Brier score: **{format_metric(brier_score(settled))}**",
        f"- Log loss: **{format_metric(log_loss(settled))}**",
        "",
        "Only `strict_current` rows are included by default. Legacy rows require `--include-legacy`.",
    ]
    output.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--include-legacy", action="store_true", help="Include legacy compatibility trackers.")
    parser.add_argument("--output", type=Path, default=OUT_DIR / "model_performance_aggregate.md")
    args = parser.parse_args()

    rows: list[BacktestRow] = []
    for path in sorted(OUT_DIR.glob("model_performance_tracker_*.csv")):
        rows.extend(load_tracker(path, include_legacy=args.include_legacy))
    write_report(rows, args.output, include_legacy=args.include_legacy)
    print(f"Aggregate written: {args.output}")
    print(f"Rows included: {len(rows)}")


if __name__ == "__main__":
    main()
