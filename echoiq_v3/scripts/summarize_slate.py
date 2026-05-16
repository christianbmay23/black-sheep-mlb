#!/usr/bin/env python3
"""
Summarize an EchoIQ v3 slate folder without fetching data or generating picks.

Usage:
    python3 echoiq_v3/scripts/summarize_slate.py slates/2026-05-05
    python3 echoiq_v3/scripts/summarize_slate.py slates/2026-05-05 --json
    python3 echoiq_v3/scripts/summarize_slate.py slates/2026-05-05 --markdown
    python3 echoiq_v3/scripts/summarize_slate.py slates/2026-05-05 --write-report
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from validate_prediction_rows import VALID_LABELS, as_float, is_blank
from validate_slate import REQUIRED_FILES, validate_slate


LABELS = ["BET", "LEAN", "CONDITIONAL", "WATCHLIST", "LOTTERY", "PASS", "AVOID", "EXTERNAL"]
MARKETS = ["HR", "TB", "HIT", "RBI", "RUN", "ML", "RL", "TOTAL", "PITCHER_PROP"]
SOURCE_CONFIDENCE = ["A", "B", "C", "D", "F", "missing"]
BET_REQUIRED_FIELDS = [
    "odds",
    "implied_probability",
    "fair_probability",
    "edge",
    "stake_units",
    "source_confidence",
    "gate_status",
    "kill_switch",
]
BET_GATE_STATUSES = {"PASSED", "CLEARED"}


@dataclass
class CsvArtifact:
    relative_path: str
    exists: bool
    headers: list[str] = field(default_factory=list)
    row_count: int = 0
    read_error: str = ""


@dataclass
class SlateSummary:
    slate_path: Path
    validation_status: str
    readiness_status: str
    csv_artifacts: dict[str, CsvArtifact]
    label_counts: Counter[str]
    bucket_counts: Counter[str]
    market_counts: Counter[str]
    source_confidence_counts: Counter[str]
    warnings: list[str]
    errors: list[str]
    next_actions: list[str]
    report_path: Path | None = None

    @property
    def total_rows(self) -> int:
        return sum(artifact.row_count for artifact in self.csv_artifacts.values())

    @property
    def files_missing(self) -> list[str]:
        return [path for path, artifact in self.csv_artifacts.items() if not artifact.exists]

    @property
    def files_empty(self) -> list[str]:
        return [path for path, artifact in self.csv_artifacts.items() if artifact.exists and artifact.row_count == 0]


def summarize_slate(slate_path: Path | str, *, write_report: bool = False) -> SlateSummary:
    slate_path = Path(slate_path)
    validation = validate_slate(slate_path, strict=True)
    csv_artifacts = _read_known_csvs(slate_path)

    label_counts: Counter[str] = Counter({label: 0 for label in LABELS})
    bucket_counts: Counter[str] = Counter()
    market_counts: Counter[str] = Counter({market: 0 for market in MARKETS})
    source_confidence_counts: Counter[str] = Counter({value: 0 for value in SOURCE_CONFIDENCE})
    warnings = list(validation.warnings)
    errors = list(validation.errors)

    for relative_path, artifact in csv_artifacts.items():
        if artifact.read_error:
            errors.append(f"{relative_path}: {artifact.read_error}")
            continue
        if not artifact.exists:
            continue
        _collect_counts_and_readiness(
            slate_path / relative_path,
            relative_path,
            label_counts,
            bucket_counts,
            market_counts,
            source_confidence_counts,
            warnings,
            errors,
        )

    _check_file_level_readiness(slate_path, csv_artifacts, label_counts, warnings, errors)
    readiness_status = _readiness_status(csv_artifacts, label_counts, warnings, errors)
    next_actions = _next_actions(csv_artifacts, label_counts, warnings, errors, readiness_status)

    summary = SlateSummary(
        slate_path=slate_path,
        validation_status=validation.status,
        readiness_status=readiness_status,
        csv_artifacts=csv_artifacts,
        label_counts=label_counts,
        bucket_counts=bucket_counts,
        market_counts=market_counts,
        source_confidence_counts=source_confidence_counts,
        warnings=warnings,
        errors=errors,
        next_actions=next_actions,
    )

    if write_report:
        report_path = slate_path / "03_verification" / "slate_readiness_report.md"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(format_markdown(summary), encoding="utf-8")
        summary.report_path = report_path

    return summary


def _read_known_csvs(slate_path: Path) -> dict[str, CsvArtifact]:
    artifacts: dict[str, CsvArtifact] = {}
    for folder, filenames in REQUIRED_FILES.items():
        for filename in filenames:
            if not filename.endswith(".csv"):
                continue
            relative_path = f"{folder}/{filename}"
            path = slate_path / relative_path
            artifact = CsvArtifact(relative_path=relative_path, exists=path.exists())
            if path.exists():
                try:
                    with path.open(newline="", encoding="utf-8") as handle:
                        reader = csv.DictReader(handle)
                        artifact.headers = list(reader.fieldnames or [])
                        artifact.row_count = sum(1 for _ in reader)
                except (csv.Error, OSError, UnicodeDecodeError) as exc:
                    artifact.read_error = str(exc)
            artifacts[relative_path] = artifact
    return artifacts


def _collect_counts_and_readiness(
    path: Path,
    relative_path: str,
    label_counts: Counter[str],
    bucket_counts: Counter[str],
    market_counts: Counter[str],
    source_confidence_counts: Counter[str],
    warnings: list[str],
    errors: list[str],
) -> None:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for idx, row in enumerate(reader, start=2):
            label = (row.get("label") or "").strip()
            bucket = (row.get("prediction_bucket") or "").strip()
            market = (row.get("market_type") or "").strip()
            source_confidence = (row.get("source_confidence") or "").strip() or "missing"
            row_ref = f"{relative_path}:{idx}"

            if label:
                if label in VALID_LABELS:
                    label_counts[label] += 1
                else:
                    errors.append(f"{row_ref}: invalid label {label}")
            if bucket:
                bucket_counts[bucket] += 1
            if market:
                if market in MARKETS:
                    market_counts[market] += 1
                else:
                    warnings.append(f"{row_ref}: unrecognized market_type {market}")
            if source_confidence in source_confidence_counts:
                source_confidence_counts[source_confidence] += 1
            elif source_confidence != "missing":
                warnings.append(f"{row_ref}: unrecognized source_confidence {source_confidence}")

            _check_row_readiness(row, relative_path, row_ref, warnings, errors)


def _check_row_readiness(row: dict[str, str], relative_path: str, row_ref: str, warnings: list[str], errors: list[str]) -> None:
    label = (row.get("label") or "").strip()
    if not label:
        return

    stake = as_float(row.get("stake_units"))
    gate_status = (row.get("gate_status") or "").strip().upper()

    if label == "BET":
        for field in BET_REQUIRED_FIELDS:
            if is_blank(row.get(field)):
                errors.append(f"{row_ref}: BET missing {field}")
        if (row.get("source_confidence") or "").strip() not in {"A", "B"}:
            errors.append(f"{row_ref}: BET requires source_confidence A or B")
        if gate_status not in BET_GATE_STATUSES:
            errors.append(f"{row_ref}: BET requires gate_status PASSED or CLEARED")
        if stake is None or stake <= 0:
            errors.append(f"{row_ref}: BET requires positive stake_units")

    if label == "WATCHLIST" and stake is not None and stake > 0:
        errors.append(f"{row_ref}: WATCHLIST cannot have stake_units > 0")

    if label in {"PASS", "AVOID"} and stake is not None and stake > 0:
        errors.append(f"{row_ref}: {label} must not have stake_units > 0")

    if label == "CONDITIONAL":
        if is_blank(row.get("gate_conditions")) and is_blank(row.get("gate_status")):
            warnings.append(f"{row_ref}: CONDITIONAL missing gate_conditions or gate_status")
        if relative_path == "04_final_card/official_card.csv" and gate_status not in BET_GATE_STATUSES:
            warnings.append(f"{row_ref}: CONDITIONAL appears in official_card without cleared gate")

    if label == "LOTTERY" and relative_path == "04_final_card/official_card.csv":
        warnings.append(f"{row_ref}: LOTTERY appears in official_card; keep separate from main-card ROI")

    if label == "EXTERNAL" and relative_path == "04_final_card/official_card.csv":
        errors.append(f"{row_ref}: EXTERNAL appears in official_card; move out of EchoIQ official ROI")

    if _truthy(row.get("counts_for_echoiq_roi")) and label == "EXTERNAL":
        errors.append(f"{row_ref}: EXTERNAL cannot count toward EchoIQ official ROI")

    if "odds_is_estimated" in row and _truthy(row.get("odds_is_estimated")):
        warnings.append(f"{row_ref}: estimated odds flagged via odds_is_estimated")
    if "odds_estimated" in row and _truthy(row.get("odds_estimated")):
        warnings.append(f"{row_ref}: estimated odds flagged via odds_estimated")


def _check_file_level_readiness(
    slate_path: Path,
    csv_artifacts: dict[str, CsvArtifact],
    label_counts: Counter[str],
    warnings: list[str],
    errors: list[str],
) -> None:
    official = csv_artifacts.get("04_final_card/official_card.csv")
    lottery = csv_artifacts.get("04_final_card/lottery_card.csv")
    candidate = csv_artifacts.get("02_candidates/candidate_board.csv")

    if official is None or not official.exists:
        errors.append("official_card.csv is missing")
    elif official.row_count == 0:
        warnings.append("No official BETs yet.")

    if lottery is None or not lottery.exists:
        warnings.append("lottery_card.csv is missing; lottery ROI separation cannot be checked")

    if candidate is not None and candidate.exists and candidate.row_count == 0 and label_counts["BET"] == 0:
        warnings.append("candidate_board.csv is blank; populate candidates before promotion review")

    if not (slate_path / "03_verification" / "verification_board.csv").exists():
        warnings.append("verification_board.csv is missing; late-market verification cannot be summarized")


def _readiness_status(
    csv_artifacts: dict[str, CsvArtifact],
    label_counts: Counter[str],
    warnings: list[str],
    errors: list[str],
) -> str:
    if errors:
        return "NOT READY"
    if sum(artifact.row_count for artifact in csv_artifacts.values()) == 0:
        return "EMPTY"
    if warnings:
        return "WARN"
    if label_counts["BET"] > 0:
        return "READY"
    return "WARN"


def _next_actions(
    csv_artifacts: dict[str, CsvArtifact],
    label_counts: Counter[str],
    warnings: list[str],
    errors: list[str],
    readiness_status: str,
) -> list[str]:
    actions: list[str] = []
    if errors:
        for error in errors:
            if "BET missing" in error:
                actions.append(f"Resolve {error}")
            if "EXTERNAL appears in official_card" in error:
                actions.append("Move EXTERNAL rows out of official_card.csv")
            if "WATCHLIST cannot have stake_units" in error:
                actions.append("Set WATCHLIST stake_units to 0 or blank")
    if label_counts["BET"] == 0:
        actions.append("No official BETs yet")
    if csv_artifacts.get("00_inputs/external_public_predictions.csv", CsvArtifact("", False)).row_count == 0:
        actions.append("Add morning research to 00_inputs/")
    if csv_artifacts.get("02_candidates/candidate_board.csv", CsvArtifact("", False)).row_count == 0:
        actions.append("Populate candidate_board.csv")
    if csv_artifacts.get("03_verification/verification_board.csv", CsvArtifact("", False)).row_count == 0:
        actions.append("Run late-market verification")
    if any("estimated odds" in warning.lower() for warning in warnings):
        actions.append("Resolve or preserve estimated-odds flags before ROI reporting")
    if readiness_status == "READY":
        actions.append("Slate is locally ready for human review; do not treat as live-verified without source evidence")
    return _dedupe(actions)


def _dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    deduped: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            deduped.append(value)
    return deduped


def _truthy(value: str | None) -> bool:
    if value is None:
        return False
    return str(value).strip().lower() in {"1", "true", "yes", "y", "counted", "included"}


def summary_to_dict(summary: SlateSummary) -> dict[str, Any]:
    final_card = summary.csv_artifacts.get("04_final_card/official_card.csv")
    lottery_card = summary.csv_artifacts.get("04_final_card/lottery_card.csv")
    estimated_odds_warnings = [warning for warning in summary.warnings if "estimated odds" in warning.lower()]
    bet_rule_errors = [error for error in summary.errors if ": BET " in error or "BET requires" in error]
    return {
        "slate_path": str(summary.slate_path),
        "validation_status": summary.validation_status,
        "readiness_status": summary.readiness_status,
        "final_card_readiness": {
            "official_card_exists": bool(final_card and final_card.exists),
            "official_card_rows": final_card.row_count if final_card else 0,
            "bet_rows": summary.label_counts.get("BET", 0),
            "bet_rule_errors": bet_rule_errors,
            "message": _final_card_message(final_card, summary.label_counts, bet_rule_errors),
        },
        "lottery_readiness": {
            "lottery_card_exists": bool(lottery_card and lottery_card.exists),
            "lottery_card_rows": lottery_card.row_count if lottery_card else 0,
            "lottery_rows": summary.label_counts.get("LOTTERY", 0),
        },
        "estimated_odds_warning_count": len(estimated_odds_warnings),
        "artifact_counts": {
            "csv_files_known": len(summary.csv_artifacts),
            "csv_files_present": sum(1 for artifact in summary.csv_artifacts.values() if artifact.exists),
            "csv_files_missing": len(summary.files_missing),
            "csv_files_empty": len(summary.files_empty),
            "total_rows": summary.total_rows,
        },
        "row_counts": {path: artifact.row_count for path, artifact in summary.csv_artifacts.items()},
        "label_counts": {label: summary.label_counts.get(label, 0) for label in LABELS},
        "bucket_counts": dict(sorted(summary.bucket_counts.items())),
        "market_counts": {market: summary.market_counts.get(market, 0) for market in MARKETS},
        "source_confidence_counts": {value: summary.source_confidence_counts.get(value, 0) for value in SOURCE_CONFIDENCE},
        "files_missing": summary.files_missing,
        "files_empty": summary.files_empty,
        "warnings": summary.warnings,
        "errors": summary.errors,
        "next_actions": summary.next_actions,
        "report_path": str(summary.report_path) if summary.report_path else "",
    }


def _final_card_message(final_card: CsvArtifact | None, label_counts: Counter[str], bet_rule_errors: list[str]) -> str:
    if final_card is None or not final_card.exists:
        return "official_card.csv is missing."
    if final_card.row_count == 0:
        return "No official BETs yet."
    if bet_rule_errors:
        return "Official card has local BET rule errors."
    if label_counts.get("BET", 0) > 0:
        return "Official BET rows pass local readiness checks."
    return "Official card has rows but no BET rows."


def format_text(summary: SlateSummary) -> str:
    data = summary_to_dict(summary)
    lines = [
        "EchoIQ v3 slate readiness summary",
        f"Slate path: {summary.slate_path}",
        f"Validation status: {summary.validation_status}",
        f"Readiness Status: {summary.readiness_status}",
        "",
        "Artifact counts:",
    ]
    for key, value in data["artifact_counts"].items():
        lines.append(f"- {key}: {value}")
    lines.extend(["", "Final-card readiness:"])
    for key, value in data["final_card_readiness"].items():
        if key == "bet_rule_errors":
            continue
        lines.append(f"- {key}: {value}")
    lines.extend(["", "Lottery readiness:"])
    for key, value in data["lottery_readiness"].items():
        lines.append(f"- {key}: {value}")
    lines.extend(["", f"Estimated-odds warning count: {data['estimated_odds_warning_count']}"])
    lines.extend(["", "Label counts:"])
    lines.extend(_counter_lines(data["label_counts"]))
    lines.extend(["", "Bucket counts:"])
    lines.extend(_counter_lines(data["bucket_counts"]))
    lines.extend(["", "Market counts:"])
    lines.extend(_counter_lines(data["market_counts"]))
    lines.extend(["", "Source confidence:"])
    lines.extend(_counter_lines(data["source_confidence_counts"]))
    lines.extend(["", "Missing files:"])
    lines.extend(_list_lines(summary.files_missing))
    lines.extend(["", "Empty files:"])
    lines.extend(_list_lines(summary.files_empty))
    lines.extend(["", "Warnings:"])
    lines.extend(_list_lines(summary.warnings))
    lines.extend(["", "Errors:"])
    lines.extend(_list_lines(summary.errors))
    lines.extend(["", "Recommended next actions:"])
    lines.extend(_list_lines(summary.next_actions))
    if summary.report_path:
        lines.extend(["", f"Report written: {summary.report_path}"])
    return "\n".join(lines)


def format_markdown(summary: SlateSummary) -> str:
    data = summary_to_dict(summary)
    lines = [
        "# EchoIQ v3 Slate Readiness Report",
        "",
        f"- Slate path: `{summary.slate_path}`",
        f"- Validation status: `{summary.validation_status}`",
        f"- Readiness Status: `{summary.readiness_status}`",
        "",
        "## Artifact Counts",
    ]
    for key, value in data["artifact_counts"].items():
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Final-card Readiness"])
    for key, value in data["final_card_readiness"].items():
        if key == "bet_rule_errors":
            continue
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Lottery Readiness"])
    for key, value in data["lottery_readiness"].items():
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Estimated Odds"])
    lines.append(f"- `estimated_odds_warning_count`: {data['estimated_odds_warning_count']}")
    lines.extend(["", "## Row Counts"])
    lines.extend(_counter_lines(data["row_counts"]))
    lines.extend(["", "## Label Counts"])
    lines.extend(_counter_lines(data["label_counts"]))
    lines.extend(["", "## Bucket Counts"])
    lines.extend(_counter_lines(data["bucket_counts"]))
    lines.extend(["", "## Market Counts"])
    lines.extend(_counter_lines(data["market_counts"]))
    lines.extend(["", "## Source Confidence"])
    lines.extend(_counter_lines(data["source_confidence_counts"]))
    lines.extend(["", "## Missing Files"])
    lines.extend(_list_lines(summary.files_missing))
    lines.extend(["", "## Empty Files"])
    lines.extend(_list_lines(summary.files_empty))
    lines.extend(["", "## Warnings"])
    lines.extend(_list_lines(summary.warnings))
    lines.extend(["", "## Errors"])
    lines.extend(_list_lines(summary.errors))
    lines.extend(["", "## Recommended Next Actions"])
    lines.extend(_list_lines(summary.next_actions))
    lines.append("")
    return "\n".join(lines)


def _counter_lines(values: dict[str, int]) -> list[str]:
    if not values:
        return ["- none"]
    return [f"- `{key}`: {value}" for key, value in values.items()]


def _list_lines(values: list[str]) -> list[str]:
    if not values:
        return ["- none"]
    return [f"- {value}" for value in values]


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Summarize an EchoIQ v3 slate readiness state.")
    parser.add_argument("slate_path", help="Path to a slate folder, for example slates/2026-05-05.")
    output = parser.add_mutually_exclusive_group()
    output.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    output.add_argument("--markdown", action="store_true", help="Print markdown summary.")
    parser.add_argument("--write-report", action="store_true", help="Write 03_verification/slate_readiness_report.md.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    summary = summarize_slate(args.slate_path, write_report=args.write_report)
    if args.json:
        print(json.dumps(summary_to_dict(summary), indent=2, sort_keys=True))
    elif args.markdown:
        print(format_markdown(summary))
    else:
        print(format_text(summary))
    return 1 if summary.readiness_status == "NOT READY" else 0


if __name__ == "__main__":
    sys.exit(main())
