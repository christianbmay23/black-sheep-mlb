"""Runner for EchoIQ HR Intelligence v1."""
from __future__ import annotations

import csv
import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from black_sheep_mlb.hr_intelligence.config import (
    DEFAULT_OUTPUT_DIR,
    OUTPUT_COLUMNS,
    OUTPUT_FILENAMES,
    SCORING_WEIGHTS,
)
from black_sheep_mlb.hr_intelligence.fixtures import default_fixture_path, load_fixture_rows
from black_sheep_mlb.hr_intelligence.market import (
    american_odds_to_implied_probability,
    calculate_edge,
    fair_odds_from_probability,
    fair_probability_from_score,
)
from black_sheep_mlb.hr_intelligence.schema import BoardRow, HitterInput
from black_sheep_mlb.hr_intelligence.scoring import assign_tier, hr_threat_score, score_components
from black_sheep_mlb.hr_intelligence.verification import assign_action, kill_flags, missing_fields, short_reason


def build_board(rows: list[HitterInput]) -> list[BoardRow]:
    board = []
    for row in rows:
        preliminary_score = hr_threat_score(row, edge_pct=None)
        fair_probability = fair_probability_from_score(preliminary_score)
        implied_probability = american_odds_to_implied_probability(row.hr_odds)
        edge_pct = calculate_edge(fair_probability, implied_probability)
        final_score = hr_threat_score(row, edge_pct=edge_pct)
        fair_probability = fair_probability_from_score(final_score)
        edge_pct = calculate_edge(fair_probability, implied_probability)
        flags = kill_flags(row, edge_pct)
        action = assign_action(final_score, edge_pct, row, flags)
        board.append(
            BoardRow(
                input=row,
                implied_prob=implied_probability,
                echoiq_fair_prob=fair_probability,
                fair_odds=fair_odds_from_probability(fair_probability),
                edge_pct=edge_pct,
                hr_threat_score=final_score,
                tier=assign_tier(final_score),
                action=action,
                kill_flags=flags,
                missing_fields=missing_fields(row),
                short_reason=short_reason(final_score, edge_pct, flags, action),
            )
        )
    board.sort(key=lambda item: item.hr_threat_score, reverse=True)
    return board


def run_daily_hr_pipeline(
    *,
    date: str,
    fixture: bool = False,
    fixture_file: Path | None = None,
    output_dir: Path | None = None,
    root: Path | None = None,
) -> dict[str, Any]:
    repo_root = root or Path.cwd()
    if not fixture:
        raise ValueError("EchoIQ HR Intelligence v1 currently supports fixture/demo mode only. Pass --fixture.")
    input_path = fixture_file or default_fixture_path(repo_root)
    rows, fixture_metadata = load_fixture_rows(input_path, date=date)
    board = build_board(rows)
    target_dir = output_dir or repo_root / DEFAULT_OUTPUT_DIR
    target_dir.mkdir(parents=True, exist_ok=True)

    full_board_path = target_dir / OUTPUT_FILENAMES["full_board"].format(date=date)
    final_card_path = target_dir / OUTPUT_FILENAMES["final_card"].format(date=date)
    lottery_card_path = target_dir / OUTPUT_FILENAMES["lottery_card"].format(date=date)
    watchlist_path = target_dir / OUTPUT_FILENAMES["watchlist"].format(date=date)
    audit_path = target_dir / OUTPUT_FILENAMES["audit_log"].format(date=date)

    _write_csv(full_board_path, [item.to_csv_row() for item in board])
    _write_csv(final_card_path, [item.to_csv_row() for item in board if item.action in {"BET", "LEAN"}])
    _write_csv(lottery_card_path, [item.to_csv_row() for item in board if item.action == "LOTTERY"])
    _write_csv(watchlist_path, [item.to_csv_row() for item in board if item.action == "WATCHLIST"])
    _write_audit_log(audit_path, date, board, fixture_metadata)

    return {
        "date": date,
        "mode": "fixture",
        "hitters_scored": len(board),
        "actions": _count_actions(board),
        "top_10": [item.to_csv_row() for item in board[:10]],
        "missing_data_warnings": _missing_data_warnings(board),
        "outputs": {
            "full_board": str(full_board_path),
            "final_card": str(final_card_path),
            "lottery_card": str(lottery_card_path),
            "watchlist": str(watchlist_path),
            "audit_log": str(audit_path),
        },
    }


def _write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def _write_audit_log(path: Path, date: str, board: list[BoardRow], fixture_metadata: dict[str, Any]) -> None:
    payload = {
        "date": date,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "mode": "fixture",
        "source_status": "fixture_only",
        "fixture_metadata": fixture_metadata,
        "strategy_context": {
            "documents_used_as_context_only": [
                "Claude EchoIQ Competitive Intelligence_ MLB Home Run and Batter Prop Tooling Ecosystem Analysis.pdf",
                "GPT MARKET MAP.pdf",
            ],
            "v1_positioning": "transparent HR threat score plus market edge, verification flags, and auditable outputs",
        },
        "scoring_weights": SCORING_WEIGHTS,
        "counts": {
            "hitters": len(board),
            "actions": _count_actions(board),
        },
        "rows": [
            {
                "input": asdict(item.input),
                "components": score_components(item.input, item.edge_pct),
                "implied_prob": item.implied_prob,
                "echoiq_fair_prob": item.echoiq_fair_prob,
                "fair_odds": item.fair_odds,
                "edge_pct": item.edge_pct,
                "hr_threat_score": item.hr_threat_score,
                "tier": item.tier,
                "action": item.action,
                "kill_flags": item.kill_flags,
                "missing_fields": item.missing_fields,
                "short_reason": item.short_reason,
            }
            for item in board
        ],
    }
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")


def _count_actions(board: list[BoardRow]) -> dict[str, int]:
    counts = {label: 0 for label in ["BET", "LEAN", "LOTTERY", "WATCHLIST", "PASS"]}
    for item in board:
        counts[item.action] = counts.get(item.action, 0) + 1
    return counts


def _missing_data_warnings(board: list[BoardRow]) -> list[str]:
    warnings = []
    no_odds = sum(1 for item in board if "NO_HR_ODDS" in item.kill_flags)
    missing_critical = sum(1 for item in board if "MISSING_CRITICAL_DATA" in item.kill_flags)
    lineup_unconfirmed = sum(1 for item in board if "LINEUP_UNCONFIRMED" in item.kill_flags)
    if no_odds:
        warnings.append(f"{no_odds} hitter rows have no fixture HR odds.")
    if missing_critical:
        warnings.append(f"{missing_critical} hitter rows are missing critical scoring fields.")
    if lineup_unconfirmed:
        warnings.append(f"{lineup_unconfirmed} hitter rows have unconfirmed fixture lineups.")
    return warnings
