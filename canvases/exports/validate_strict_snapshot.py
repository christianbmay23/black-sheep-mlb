#!/usr/bin/env python3
"""Validate that a snapshot is usable as strict pregame proof."""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any

OUT_DIR = Path(__file__).resolve().parent
REQUIRED_GAME_FIELDS = {
    "raw_model_away_win_pct",
    "raw_model_home_win_pct",
    "final_away_win_pct",
    "final_home_win_pct",
}


def default_snapshot_path(slug: str) -> Path:
    return OUT_DIR / "snapshots" / slug / f"{slug}-latest.json"


def default_games_csv_path(slug: str) -> Path:
    return OUT_DIR / f"mlb-pregame-intel-{slug}-games.csv"


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def csv_fields(path: Path) -> set[str]:
    with path.open(newline="", encoding="utf-8") as fh:
        return set(csv.DictReader(fh).fieldnames or [])


def validate_snapshot_payload(payload: dict[str, Any], game_fields: set[str]) -> list[str]:
    errors: list[str] = []
    evaluation = payload.get("evaluation") if isinstance(payload.get("evaluation"), dict) else {}
    summary = payload.get("summary") if isinstance(payload.get("summary"), dict) else {}
    games = payload.get("games") if isinstance(payload.get("games"), list) else []

    if payload.get("allow_partial") is not False:
        errors.append("allow_partial must be false")
    if payload.get("evaluation_eligible") is not True:
        errors.append("evaluation_eligible must be true")
    if evaluation.get("status") != "eligible":
        errors.append("evaluation.status must be eligible")
    if int(summary.get("scored_games") or evaluation.get("scored_games") or 0) <= 0:
        errors.append("scored_games must be greater than 0")

    for row in games:
        if not isinstance(row, dict):
            continue
        scoring_status = str(row.get("scoring_status") or "").strip().lower()
        bucket = str(row.get("game_status_bucket") or "").strip().lower()
        if scoring_status == "scored" and bucket != "pregame":
            game = f"{row.get('away', '')}@{row.get('home', '')}".strip("@")
            errors.append(f"scored non-pregame game found: {game or '<unknown>'}")

    missing = sorted(REQUIRED_GAME_FIELDS - game_fields)
    if missing:
        errors.append(f"games CSV missing required fields: {', '.join(missing)}")

    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", required=True, help="Slate slug, e.g. apr24.")
    parser.add_argument("--snapshot", type=Path, default=None, help="Override snapshot path.")
    parser.add_argument("--games-csv", type=Path, default=None, help="Override games CSV path.")
    args = parser.parse_args()

    snapshot_path = args.snapshot or default_snapshot_path(args.slug)
    games_csv_path = args.games_csv or default_games_csv_path(args.slug)

    missing_inputs = []
    if not snapshot_path.exists():
        missing_inputs.append(f"snapshot not found: {snapshot_path}")
    if not games_csv_path.exists():
        missing_inputs.append(f"games CSV not found: {games_csv_path}")
    if missing_inputs:
        print(f"Strict snapshot validation failed for {args.slug}:")
        for error in missing_inputs:
            print(f"- {error}")
        raise SystemExit(1)

    payload = load_json(snapshot_path)
    errors = validate_snapshot_payload(payload, csv_fields(games_csv_path))
    if errors:
        print(f"Strict snapshot validation failed for {args.slug}:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print(f"Strict snapshot validation passed for {args.slug}: {snapshot_path}")


if __name__ == "__main__":
    main()
