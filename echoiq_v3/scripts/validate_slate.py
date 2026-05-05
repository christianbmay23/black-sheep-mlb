#!/usr/bin/env python3
"""
Validate an EchoIQ v3 slate artifact folder.

Usage:
    python3 echoiq_v3/scripts/validate_slate.py slates/2026-05-05
    python3 echoiq_v3/scripts/validate_slate.py slates/2026-05-05 --strict
"""

from __future__ import annotations

import argparse
import csv
import sys
from dataclasses import dataclass, field
from pathlib import Path

from validate_prediction_rows import (
    VALID_LABELS,
    VALID_RESULTS,
    VALID_SOURCE_CONF,
    as_float,
    is_blank,
)


REQUIRED_FOLDERS = [
    "00_inputs",
    "01_raw_research",
    "02_candidates",
    "03_verification",
    "04_final_card",
    "05_postgame",
    "06_archive",
]

REQUIRED_FILES = {
    "00_inputs": [
        "external_public_predictions.csv",
        "source_compliance.csv",
        "INPUTS_README.md",
    ],
    "01_raw_research": [
        "raw_research_board.csv",
        "external_public_predictions.csv",
        "weather_park_board.csv",
        "pitcher_vulnerability_board.csv",
        "lineup_cluster_board.csv",
    ],
    "02_candidates": [
        "candidate_board.csv",
    ],
    "03_verification": [
        "verification_board.csv",
        "source_compliance.csv",
        "pass_avoid.csv",
    ],
    "04_final_card": [
        "official_card.csv",
        "lottery_card.csv",
        "conditional_card.csv",
        "watchlist.csv",
        "final_card_report.md",
    ],
    "05_postgame": [
        "postgame_grade.csv",
        "error_ledger.csv",
        "model_lessons.csv",
        "postgame_report.md",
    ],
    "06_archive": [
        "README.md",
    ],
}

PREDICTION_COLUMNS = {
    "slate_date",
    "game",
    "source",
    "source_type",
    "prediction_bucket",
    "label",
    "market_type",
    "status",
}
PLAYER_MARKETS = {"HR", "TB", "HIT", "RBI", "RUN", "PITCHER_PROP"}
BET_GATE_STATUSES = {"PASSED", "CLEARED"}
LOTTERY_BUCKETS = {"lottery", "lottery_card"}
PREDICTION_RULE_EXCLUDED_PARTS = {"/05_postgame/"}


@dataclass
class SlateValidationResult:
    slate_path: Path
    strict: bool
    folders_checked: list[Path] = field(default_factory=list)
    files_checked: list[Path] = field(default_factory=list)
    csvs_checked: list[Path] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    @property
    def status(self) -> str:
        if self.errors:
            return "FAIL"
        if self.warnings:
            return "WARN"
        return "PASS"


def validate_slate(slate_path: Path | str, *, strict: bool = False) -> SlateValidationResult:
    slate_path = Path(slate_path)
    result = SlateValidationResult(slate_path=slate_path, strict=strict)

    if not slate_path.exists():
        result.errors.append(f"Slate path does not exist: {slate_path}")
        return result
    if not slate_path.is_dir():
        result.errors.append(f"Slate path is not a directory: {slate_path}")
        return result

    _check_folders(result)
    _check_files(result)
    return result


def _check_folders(result: SlateValidationResult) -> None:
    for folder in REQUIRED_FOLDERS:
        folder_path = result.slate_path / folder
        result.folders_checked.append(folder_path)
        if not folder_path.is_dir():
            result.errors.append(f"Missing required folder: {folder_path}")


def _check_files(result: SlateValidationResult) -> None:
    for folder, filenames in REQUIRED_FILES.items():
        for filename in filenames:
            path = result.slate_path / folder / filename
            result.files_checked.append(path)
            if not path.exists():
                message = f"Missing required file: {path}"
                if result.strict:
                    result.errors.append(message)
                else:
                    result.warnings.append(message)
                continue
            if path.suffix.lower() == ".csv":
                _check_csv(result, path)


def _check_csv(result: SlateValidationResult, path: Path) -> None:
    result.csvs_checked.append(path)
    try:
        with path.open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            headers = reader.fieldnames
            if not headers:
                result.errors.append(f"CSV missing header row: {path}")
                return
            if any(is_blank(header) for header in headers):
                result.errors.append(f"CSV has blank header name: {path}")
            for idx, row in enumerate(reader, start=2):
                if not _skip_prediction_rules(path):
                    _check_prediction_row(result, path, row, idx)
    except UnicodeDecodeError as exc:
        result.errors.append(f"CSV is not UTF-8 readable: {path}: {exc}")
    except csv.Error as exc:
        result.errors.append(f"CSV parsing error: {path}: {exc}")
    except OSError as exc:
        result.errors.append(f"CSV read error: {path}: {exc}")


def _skip_prediction_rules(path: Path) -> bool:
    path_text = path.as_posix()
    return any(part in path_text for part in PREDICTION_RULE_EXCLUDED_PARTS)


def _check_prediction_row(result: SlateValidationResult, path: Path, row: dict[str, str], idx: int) -> None:
    label = (row.get("label") or "").strip()
    if not label:
        return

    row_ref = f"{path}:{idx}"
    headers = set(row.keys())
    if "label" in headers and not PREDICTION_COLUMNS.issubset(headers):
        missing = ", ".join(sorted(PREDICTION_COLUMNS - headers))
        result.warnings.append(f"{row_ref}: label present but prediction-row columns are incomplete: {missing}")

    if label not in VALID_LABELS:
        result.errors.append(f"{row_ref}: invalid label {label}")
        return

    source_confidence = (row.get("source_confidence") or "").strip()
    if source_confidence not in VALID_SOURCE_CONF:
        result.errors.append(f"{row_ref}: invalid source_confidence {source_confidence}")

    row_result = (row.get("result") or "").strip()
    if row_result and row_result not in VALID_RESULTS:
        result.errors.append(f"{row_ref}: invalid result {row_result}")

    stake = as_float(row.get("stake_units"))
    prediction_bucket = (row.get("prediction_bucket") or "").strip()
    market_type = (row.get("market_type") or "").strip()
    gate_status = (row.get("gate_status") or "").strip().upper()

    if label == "BET":
        for field in [
            "odds",
            "implied_probability",
            "fair_probability",
            "edge",
            "stake_units",
            "source_confidence",
            "gate_status",
            "kill_switch",
        ]:
            if is_blank(row.get(field)):
                result.errors.append(f"{row_ref}: BET missing {field}")
        if source_confidence not in {"A", "B"}:
            result.errors.append(f"{row_ref}: BET requires source_confidence A or B")
        if gate_status not in BET_GATE_STATUSES:
            result.errors.append(f"{row_ref}: BET requires gate_status PASSED or CLEARED")
        if stake is None or stake <= 0:
            result.errors.append(f"{row_ref}: BET requires positive stake_units")

    if label == "CONDITIONAL":
        if is_blank(row.get("gate_conditions")) and is_blank(row.get("gate_status")):
            result.errors.append(f"{row_ref}: CONDITIONAL requires gate_conditions or explanatory gate_status")
        if stake is not None and stake > 0:
            result.errors.append(f"{row_ref}: CONDITIONAL should not have stake_units > 0 until gate clears")

    if label == "WATCHLIST" and stake is not None and stake > 0:
        result.errors.append(f"{row_ref}: WATCHLIST cannot have stake_units > 0")

    if label == "EXTERNAL":
        if prediction_bucket != "external_public":
            result.errors.append(f"{row_ref}: EXTERNAL should use prediction_bucket external_public")
        if _truthy(row.get("counts_for_echoiq_roi")):
            result.errors.append(f"{row_ref}: EXTERNAL cannot count toward EchoIQ official ROI")

    if label in {"PASS", "AVOID"} and stake is not None and stake > 0:
        result.errors.append(f"{row_ref}: {label} must not have stake_units > 0")

    if label == "LOTTERY" and prediction_bucket not in LOTTERY_BUCKETS:
        result.errors.append(f"{row_ref}: LOTTERY must use lottery or lottery_card prediction_bucket")

    if "odds_is_estimated" in row and _truthy(row.get("odds_is_estimated")) and is_blank(row.get("odds_estimated")):
        result.warnings.append(f"{row_ref}: odds_is_estimated is set; keep estimated odds out of verified ROI")
    if "odds_estimated" in row and _truthy(row.get("odds_estimated")):
        result.warnings.append(f"{row_ref}: estimated odds flagged; do not treat as verified price")

    if row_result == "HIT" and market_type in PLAYER_MARKETS and is_blank(row.get("player")):
        result.errors.append(f"{row_ref}: player-specific HIT requires player column value for exact-player validation")


def _truthy(value: str | None) -> bool:
    if value is None:
        return False
    return str(value).strip().lower() in {"1", "true", "yes", "y", "counted", "included"}


def print_summary(result: SlateValidationResult) -> None:
    print("EchoIQ v3 slate artifact validator")
    print(f"Slate path: {result.slate_path}")
    print(f"Strict: {result.strict}")
    print(f"Folders checked: {len(result.folders_checked)}")
    print(f"Files checked: {len(result.files_checked)}")
    print(f"CSVs checked: {len(result.csvs_checked)}")
    print("")

    print("Warnings:")
    if result.warnings:
        for warning in result.warnings:
            print(f"- {warning}")
    else:
        print("- none")
    print("")

    print("Errors:")
    if result.errors:
        for error in result.errors:
            print(f"- {error}")
    else:
        print("- none")
    print("")
    print(f"Final status: {result.status}")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate an EchoIQ v3 slate artifact folder.")
    parser.add_argument("slate_path", help="Path to a slate folder, for example slates/2026-05-05.")
    parser.add_argument("--strict", action="store_true", help="Treat missing required files as errors.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    result = validate_slate(args.slate_path, strict=args.strict)
    print_summary(result)
    return 1 if result.errors else 0


if __name__ == "__main__":
    sys.exit(main())
