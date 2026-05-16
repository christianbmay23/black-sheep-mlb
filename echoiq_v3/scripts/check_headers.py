#!/usr/bin/env python3
"""
Check EchoIQ v3 slate CSV headers for schema drift.

This script is local-only. It does not fetch data, generate picks, or modify
slate data rows. With --fix-empty it may repair only empty or header-only CSVs.

Usage:
    python3 echoiq_v3/scripts/check_headers.py slates/2026-05-05
    python3 echoiq_v3/scripts/check_headers.py slates/2026-05-05 --fix-empty
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from grade_slate import ERROR_LEDGER_COLUMNS, MODEL_LESSONS_COLUMNS, POSTGAME_GRADE_COLUMNS
from validate_slate import REQUIRED_FILES


REPO_ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_DIR = REPO_ROOT / "echoiq_v3" / "templates"
POSTGAME_WRITER_SCHEMAS = {
    "05_postgame/postgame_grade.csv": POSTGAME_GRADE_COLUMNS,
    "05_postgame/error_ledger.csv": ERROR_LEDGER_COLUMNS,
    "05_postgame/model_lessons.csv": MODEL_LESSONS_COLUMNS,
}
SAMPLE_COMPATIBILITY_WARN_PATHS = {
    "00_inputs/external_public_predictions.csv",
    "00_inputs/source_compliance.csv",
    "01_raw_research/external_public_predictions.csv",
    "01_raw_research/weather_park_board.csv",
    "01_raw_research/pitcher_vulnerability_board.csv",
    "01_raw_research/lineup_cluster_board.csv",
    "03_verification/source_compliance.csv",
}


@dataclass
class HeaderCheck:
    relative_path: str
    exists: bool
    expected_headers: list[str] = field(default_factory=list)
    actual_headers: list[str] = field(default_factory=list)
    data_row_count: int = 0
    missing_columns: list[str] = field(default_factory=list)
    extra_columns: list[str] = field(default_factory=list)
    order_matches: bool = True
    fixed: bool = False
    status: str = "PASS"
    message: str = ""


@dataclass
class HeaderCheckResult:
    slate_path: Path
    checks: list[HeaderCheck] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    fixed_files: list[Path] = field(default_factory=list)
    report_path: Path | None = None

    @property
    def status(self) -> str:
        if self.errors:
            return "FAIL"
        if self.warnings:
            return "WARN"
        return "PASS"


def check_headers(
    slate_path: Path | str,
    *,
    fix_empty: bool = False,
    write_report: bool = False,
) -> HeaderCheckResult:
    slate_path = Path(slate_path)
    result = HeaderCheckResult(slate_path=slate_path)

    if not slate_path.exists():
        result.errors.append(f"Slate path does not exist: {slate_path}")
        return result
    if not slate_path.is_dir():
        result.errors.append(f"Slate path is not a directory: {slate_path}")
        return result

    for relative_path in _known_csv_paths():
        expected_headers = _expected_headers(relative_path)
        if not expected_headers:
            result.errors.append(f"Canonical header template missing or empty for {relative_path}")
            continue
        check = _check_one_csv(slate_path, relative_path, expected_headers, fix_empty=fix_empty)
        _downgrade_expected_sample_drift(slate_path, check)
        result.checks.append(check)
        if check.fixed:
            result.fixed_files.append(slate_path / relative_path)
        if check.status == "FAIL":
            result.errors.append(f"{relative_path}: {check.message}")
        elif check.status == "WARN":
            result.warnings.append(f"{relative_path}: {check.message}")

    if write_report:
        report_path = slate_path / "03_verification" / "header_drift_report.md"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(render_markdown(result), encoding="utf-8")
        result.report_path = report_path

    return result


def _known_csv_paths() -> list[str]:
    paths: list[str] = []
    for folder, filenames in REQUIRED_FILES.items():
        for filename in filenames:
            if filename.endswith(".csv"):
                paths.append(f"{folder}/{filename}")
    return paths


def _expected_headers(relative_path: str) -> list[str]:
    if relative_path in POSTGAME_WRITER_SCHEMAS:
        return list(POSTGAME_WRITER_SCHEMAS[relative_path])
    return _read_header(TEMPLATE_DIR / Path(relative_path).name)[0]


def _check_one_csv(slate_path: Path, relative_path: str, expected_headers: list[str], *, fix_empty: bool) -> HeaderCheck:
    path = slate_path / relative_path
    if not path.exists():
        return HeaderCheck(
            relative_path=relative_path,
            exists=False,
            expected_headers=expected_headers,
            status="FAIL",
            message="required CSV is missing",
        )

    try:
        actual_headers, data_row_count = _read_header(path)
    except UnicodeDecodeError as exc:
        return HeaderCheck(
            relative_path=relative_path,
            exists=True,
            expected_headers=expected_headers,
            status="FAIL",
            message=f"CSV is not UTF-8 readable: {exc}",
        )
    except csv.Error as exc:
        return HeaderCheck(
            relative_path=relative_path,
            exists=True,
            expected_headers=expected_headers,
            status="FAIL",
            message=f"CSV parsing error: {exc}",
        )
    except OSError as exc:
        return HeaderCheck(
            relative_path=relative_path,
            exists=True,
            expected_headers=expected_headers,
            status="FAIL",
            message=f"CSV read error: {exc}",
        )

    check = _compare_headers(relative_path, expected_headers, actual_headers, data_row_count)
    if check.status == "PASS":
        return check

    if fix_empty and data_row_count == 0:
        _write_header(path, expected_headers)
        fixed_check = _compare_headers(relative_path, expected_headers, expected_headers, 0)
        fixed_check.fixed = True
        fixed_check.message = "fixed empty/header-only CSV header"
        return fixed_check

    if fix_empty and data_row_count > 0:
        check.message = f"{check.message}; refused --fix-empty because CSV has data rows"
    return check


def _downgrade_expected_sample_drift(slate_path: Path, check: HeaderCheck) -> None:
    if not slate_path.name.startswith("_sample_"):
        return
    if check.relative_path not in SAMPLE_COMPATIBILITY_WARN_PATHS:
        return
    if check.status != "FAIL":
        return
    check.status = "WARN"
    check.message = f"sample compatibility drift detected: {check.message}"


def _compare_headers(
    relative_path: str,
    expected_headers: list[str],
    actual_headers: list[str],
    data_row_count: int,
) -> HeaderCheck:
    if not actual_headers:
        return HeaderCheck(
            relative_path=relative_path,
            exists=True,
            expected_headers=expected_headers,
            actual_headers=actual_headers,
            data_row_count=data_row_count,
            status="FAIL",
            message="CSV is empty or missing a header row",
        )

    missing = [header for header in expected_headers if header not in actual_headers]
    extra = [header for header in actual_headers if header not in expected_headers]
    order_matches = actual_headers == expected_headers
    if missing or extra or not order_matches:
        parts = []
        if missing:
            parts.append(f"missing columns: {', '.join(missing)}")
        if extra:
            parts.append(f"extra columns: {', '.join(extra)}")
        if not order_matches and not missing and not extra:
            parts.append("column order differs")
        elif not order_matches:
            parts.append("column order differs from canonical schema")
        return HeaderCheck(
            relative_path=relative_path,
            exists=True,
            expected_headers=expected_headers,
            actual_headers=actual_headers,
            data_row_count=data_row_count,
            missing_columns=missing,
            extra_columns=extra,
            order_matches=order_matches,
            status="FAIL",
            message="; ".join(parts),
        )

    return HeaderCheck(
        relative_path=relative_path,
        exists=True,
        expected_headers=expected_headers,
        actual_headers=actual_headers,
        data_row_count=data_row_count,
        order_matches=True,
        status="PASS",
        message="header matches canonical schema",
    )


def _read_header(path: Path) -> tuple[list[str], int]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle)
        try:
            headers = next(reader)
        except StopIteration:
            return [], 0
        row_count = sum(1 for _ in reader)
    return [header.strip() for header in headers], row_count


def _write_header(path: Path, headers: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)


def result_to_dict(result: HeaderCheckResult) -> dict[str, Any]:
    return {
        "slate_path": str(result.slate_path),
        "status": result.status,
        "files_checked": len(result.checks),
        "warnings": result.warnings,
        "errors": result.errors,
        "fixed_files": [str(path) for path in result.fixed_files],
        "report_path": str(result.report_path) if result.report_path else None,
        "checks": [
            {
                "relative_path": check.relative_path,
                "status": check.status,
                "exists": check.exists,
                "data_row_count": check.data_row_count,
                "missing_columns": check.missing_columns,
                "extra_columns": check.extra_columns,
                "order_matches": check.order_matches,
                "fixed": check.fixed,
                "message": check.message,
                "expected_headers": check.expected_headers,
                "actual_headers": check.actual_headers,
            }
            for check in result.checks
        ],
    }


def render_text(result: HeaderCheckResult) -> str:
    lines = [
        "EchoIQ v3 Header Drift Check",
        f"Slate path: {result.slate_path}",
        f"Status: {result.status}",
        f"CSV files checked: {len(result.checks)}",
        f"Warnings: {len(result.warnings)}",
        f"Errors: {len(result.errors)}",
    ]
    if result.fixed_files:
        lines.append("Fixed files:")
        lines.extend(f"- {path}" for path in result.fixed_files)
    failed = [check for check in result.checks if check.status == "FAIL"]
    if failed:
        lines.append("Drift detected:")
        lines.extend(f"- {check.relative_path}: {check.message}" for check in failed)
    if result.report_path:
        lines.append(f"Report written: {result.report_path}")
    return "\n".join(lines)


def render_markdown(result: HeaderCheckResult) -> str:
    lines = [
        "# EchoIQ v3 Header Drift Report",
        "",
        f"- Slate path: `{result.slate_path}`",
        f"- Status: `{result.status}`",
        f"- CSV files checked: `{len(result.checks)}`",
        f"- Warnings: `{len(result.warnings)}`",
        f"- Errors: `{len(result.errors)}`",
        "",
        "## File Checks",
        "",
        "| File | Status | Rows | Message |",
        "| --- | --- | ---: | --- |",
    ]
    for check in result.checks:
        lines.append(f"| `{check.relative_path}` | `{check.status}` | {check.data_row_count} | {check.message} |")
    lines.extend(["", "## Fixed Files", ""])
    if result.fixed_files:
        lines.extend(f"- `{path}`" for path in result.fixed_files)
    else:
        lines.append("- None")
    lines.extend(["", "## Errors", ""])
    if result.errors:
        lines.extend(f"- {error}" for error in result.errors)
    else:
        lines.append("- None")
    lines.extend(["", "## Warnings", ""])
    if result.warnings:
        lines.extend(f"- {warning}" for warning in result.warnings)
    else:
        lines.append("- None")
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check EchoIQ v3 slate CSV headers for schema drift.")
    parser.add_argument("slate_path", type=Path, help="Path to slate folder, such as slates/2026-05-05")
    parser.add_argument("--fix-empty", action="store_true", help="Repair only empty or header-only CSVs.")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON.")
    parser.add_argument("--markdown", action="store_true", help="Emit markdown summary.")
    parser.add_argument("--write-report", action="store_true", help="Write 03_verification/header_drift_report.md.")
    args = parser.parse_args(argv)

    result = check_headers(args.slate_path, fix_empty=args.fix_empty, write_report=args.write_report)
    if args.json:
        print(json.dumps(result_to_dict(result), indent=2, sort_keys=True))
    elif args.markdown:
        print(render_markdown(result), end="")
    else:
        print(render_text(result))
    return 1 if result.status == "FAIL" else 0


if __name__ == "__main__":
    sys.exit(main())
