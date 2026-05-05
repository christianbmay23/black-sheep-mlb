#!/usr/bin/env python3
"""
Lightweight EchoIQ v3 CSV validator.

Usage:
    python scripts/validate_prediction_rows.py examples/may4_style_sample_rows.csv
"""

import csv
import sys
from pathlib import Path

VALID_LABELS = {"BET","LEAN","CONDITIONAL","WATCHLIST","LOTTERY","PASS","AVOID","EXTERNAL"}
VALID_SOURCE_CONF = {"A","B","C","D","F",""}
VALID_RESULTS = {"HIT","LOSS","PUSH","VOID","WATCHLIST_HIT","WATCHLIST_LOSS","EXTERNAL_HIT","EXTERNAL_LOSS","UNKNOWN",""}

REQUIRED = ["slate_date","game","source","source_type","prediction_bucket","label","market_type","status"]


def is_blank(value):
    return value is None or str(value).strip() == ""


def as_float(value):
    if is_blank(value):
        return None
    try:
        return float(str(value).replace("+", ""))
    except ValueError:
        return None


def validate_row(row, idx):
    errors = []
    for field in REQUIRED:
        if is_blank(row.get(field)):
            errors.append(f"row {idx}: missing required field {field}")

    label = row.get("label", "")
    if label not in VALID_LABELS:
        errors.append(f"row {idx}: invalid label {label}")

    sc = row.get("source_confidence", "")
    if sc not in VALID_SOURCE_CONF:
        errors.append(f"row {idx}: invalid source_confidence {sc}")

    result = row.get("result", "")
    if result not in VALID_RESULTS:
        errors.append(f"row {idx}: invalid result {result}")

    stake = as_float(row.get("stake_units"))

    if label == "BET":
        for field in ["odds","implied_probability","fair_probability","edge","stake_units","source_confidence","gate_status","kill_switch"]:
            if is_blank(row.get(field)):
                errors.append(f"row {idx}: BET missing {field}")
        if sc not in {"A","B"}:
            errors.append(f"row {idx}: BET requires source_confidence A or B")
        if row.get("gate_status") != "PASSED":
            errors.append(f"row {idx}: BET requires gate_status PASSED")
        if stake is None or stake <= 0:
            errors.append(f"row {idx}: BET requires positive stake_units")

    if label == "CONDITIONAL":
        if is_blank(row.get("gate_conditions")):
            errors.append(f"row {idx}: CONDITIONAL requires gate_conditions")
        if stake is not None and stake > 0:
            errors.append(f"row {idx}: CONDITIONAL should not have stake_units > 0 until gate clears")

    if label == "WATCHLIST" and stake is not None and stake > 0:
        errors.append(f"row {idx}: WATCHLIST cannot have stake_units > 0")

    if label == "EXTERNAL" and row.get("prediction_bucket") != "external_public":
        errors.append(f"row {idx}: EXTERNAL should use prediction_bucket external_public")

    if result == "HIT" and label == "EXTERNAL":
        errors.append(f"row {idx}: EXTERNAL result should be EXTERNAL_HIT/EXTERNAL_LOSS or stay separate from EchoIQ ROI")

    return errors


def main(path):
    p = Path(path)
    if not p.exists():
        print(f"File not found: {p}", file=sys.stderr)
        return 2

    all_errors = []
    with p.open(newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=2):
            all_errors.extend(validate_row(row, idx))

    if all_errors:
        print("VALIDATION FAILED")
        for err in all_errors:
            print(f"- {err}")
        return 1

    print("VALIDATION PASSED")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python validate_prediction_rows.py <csv_file>", file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
