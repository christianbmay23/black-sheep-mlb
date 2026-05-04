#!/usr/bin/env python3
"""Validate EchoIQ manual/free input files before a slate run."""
from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass, field
from datetime import date as date_cls
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from black_sheep_mlb.pipelines.echoiq_slate import MANUAL_SCHEMAS, RECOMMENDATION_LABELS  # noqa: E402

DATA_TYPES = ("odds", "props", "weather", "ballpark", "lineups")
JSON_ALIASES = {"ballpark_pal": "ballpark"}

VALID_MARKET_TYPES = {
    "moneyline",
    "run_line",
    "full_game_total",
    "team_total",
    "first_five_moneyline",
    "first_five_total",
}
VALID_PROP_TYPES = {
    "total_bases",
    "hits",
    "home_runs",
    "home_run",
    "rbi",
    "runs",
    "walks",
    "strikeouts",
    "pitcher_strikeouts",
    "pitcher_outs",
    "pitcher_earned_runs",
    "pitcher_hits_allowed",
    "pitcher_walks_allowed",
}
VALID_LINEUP_STATUS = {"confirmed", "projected", "unavailable"}
VALID_CONFIDENCE = {"high", "medium", "low"}
VALID_RECOMMENDATIONS = {label.lower() for label in RECOMMENDATION_LABELS}


@dataclass
class ValidationIssue:
    severity: str
    source: str
    message: str
    row: int | None = None

    def format(self) -> str:
        loc = self.source if self.row is None else f"{self.source} row {self.row}"
        return f"- {loc}: {self.message}"


@dataclass
class FileReport:
    label: str
    rows: int = 0
    errors: list[ValidationIssue] = field(default_factory=list)
    warnings: list[ValidationIssue] = field(default_factory=list)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate EchoIQ manual/free input files.")
    parser.add_argument("--date", default=None)
    parser.add_argument("--manual-odds", default=None)
    parser.add_argument("--manual-props", default=None)
    parser.add_argument("--manual-weather", default=None)
    parser.add_argument("--manual-ballpark", default=None)
    parser.add_argument("--manual-lineups", default=None)
    parser.add_argument("--manual-inputs", default=None)
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args(argv)

    paths = {
        "odds": Path(args.manual_odds) if args.manual_odds else None,
        "props": Path(args.manual_props) if args.manual_props else None,
        "weather": Path(args.manual_weather) if args.manual_weather else None,
        "ballpark": Path(args.manual_ballpark) if args.manual_ballpark else None,
        "lineups": Path(args.manual_lineups) if args.manual_lineups else None,
    }
    inputs_json = Path(args.manual_inputs) if args.manual_inputs else None
    if not any(paths.values()) and inputs_json is None:
        parser.print_usage(sys.stderr)
        print("error: pass at least one manual input file", file=sys.stderr)
        return 2

    reports: list[FileReport] = []
    for data_type, path in paths.items():
        if path is None:
            continue
        if not path.exists():
            reports.append(_missing_file_report(data_type, path))
            continue
        reports.append(validate_csv_file(data_type, path, slate_date=args.date))

    if inputs_json is not None:
        if not inputs_json.exists():
            reports.append(_missing_file_report("manual_inputs_json", inputs_json))
        else:
            reports.extend(validate_json_file(inputs_json, slate_date=args.date))

    print(_render_reports(reports, strict=args.strict))
    has_errors = any(report.errors for report in reports)
    has_warnings = any(report.warnings for report in reports)
    return 1 if has_errors or (args.strict and has_warnings) else 0


def validate_csv_file(data_type: str, path: Path, *, slate_date: str | None = None) -> FileReport:
    report = FileReport(label=path.name)
    try:
        with path.open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            columns = reader.fieldnames or []
            _validate_columns(data_type, columns, str(path), report)
            rows = [_normalize_row(row) for row in reader]
    except UnicodeDecodeError as exc:
        report.errors.append(ValidationIssue("error", str(path), f"could not read UTF-8 CSV: {exc}"))
        return report
    report.rows = len(rows)
    for idx, row in enumerate(rows, start=2):
        _validate_row(data_type, row, str(path), idx, report, slate_date=slate_date)
    return report


def validate_json_file(path: Path, *, slate_date: str | None = None) -> list[FileReport]:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [FileReport(label=path.name, errors=[ValidationIssue("error", str(path), f"invalid JSON: {exc}")])]
    if not isinstance(raw, dict):
        return [FileReport(label=path.name, errors=[ValidationIssue("error", str(path), "top-level JSON must be an object")])]

    reports: list[FileReport] = []
    for key, value in raw.items():
        data_type = JSON_ALIASES.get(key, key)
        if data_type not in DATA_TYPES:
            report = FileReport(label=f"{path.name}:{key}")
            report.warnings.append(ValidationIssue("warning", f"{path}:{key}", "unknown JSON input section ignored"))
            reports.append(report)
            continue
        report = FileReport(label=f"{path.name}:{key}")
        if not isinstance(value, list):
            report.errors.append(ValidationIssue("error", f"{path}:{key}", "section must be a list of row objects"))
            reports.append(report)
            continue
        rows = [_normalize_row(row) for row in value if isinstance(row, dict)]
        bad_count = len([row for row in value if not isinstance(row, dict)])
        if bad_count:
            report.errors.append(ValidationIssue("error", f"{path}:{key}", f"{bad_count} row(s) are not objects"))
        report.rows = len(rows)
        columns = sorted({column for row in rows for column in row})
        if rows:
            _validate_columns(data_type, columns, f"{path}:{key}", report)
        for idx, row in enumerate(rows, start=1):
            _validate_row(data_type, row, f"{path}:{key}", idx, report, slate_date=slate_date)
        reports.append(report)
    return reports


def _validate_columns(data_type: str, columns: list[str], source: str, report: FileReport) -> None:
    schema = MANUAL_SCHEMAS[data_type]
    column_set = set(columns)
    if "" in column_set:
        report.errors.append(ValidationIssue("error", source, "blank column header found"))
    for column in schema["required"]:
        if column not in column_set:
            report.errors.append(ValidationIssue("error", source, f"missing required column {column}"))
    expected = set(schema["expected"])
    for column in sorted(column_set - expected):
        if column:
            report.warnings.append(ValidationIssue("warning", source, f"unknown column {column}"))


def _validate_row(
    data_type: str,
    row: dict[str, str],
    source: str,
    row_number: int,
    report: FileReport,
    *,
    slate_date: str | None,
) -> None:
    if not _has_game_identifier(data_type, row):
        report.errors.append(
            ValidationIssue("error", source, "missing game identifier: provide game_id, away_team/home_team, or venue where allowed", row_number)
        )
    if not row.get("source"):
        report.warnings.append(ValidationIssue("warning", source, "missing source", row_number))
    if "source_url" in row and not row.get("source_url"):
        report.warnings.append(ValidationIssue("warning", source, "missing source_url", row_number))
    if not row.get("timestamp"):
        report.warnings.append(ValidationIssue("warning", source, "missing timestamp", row_number))
    else:
        _validate_timestamp(row["timestamp"], source, row_number, report, slate_date=slate_date)
    confidence = _lower(row.get("confidence"))
    if not confidence:
        report.warnings.append(ValidationIssue("warning", source, "missing confidence", row_number))
    elif confidence not in VALID_CONFIDENCE:
        report.errors.append(ValidationIssue("error", source, f"invalid confidence {row.get('confidence')}", row_number))
    if row.get("recommendation") and _lower(row.get("recommendation")) not in VALID_RECOMMENDATIONS:
        report.errors.append(ValidationIssue("error", source, f"invalid recommendation label {row.get('recommendation')}", row_number))

    if data_type == "odds":
        _validate_odds_row(row, source, row_number, report)
    elif data_type == "props":
        _validate_props_row(row, source, row_number, report)
    elif data_type == "lineups":
        _validate_lineup_row(row, source, row_number, report)
    elif data_type in {"weather", "ballpark"}:
        _validate_numeric_context(row, data_type, source, row_number, report)


def _validate_odds_row(row: dict[str, str], source: str, row_number: int, report: FileReport) -> None:
    market_type = _lower(row.get("market_type"))
    if market_type and market_type not in VALID_MARKET_TYPES:
        report.errors.append(ValidationIssue("error", source, f"invalid market_type {row.get('market_type')}", row_number))
    if not row.get("current_price") and not row.get("best_price"):
        report.warnings.append(ValidationIssue("warning", source, "missing current_price/best_price", row_number))
    for field_name in ("current_price", "best_price", "opening_price", "consensus_price"):
        _validate_price(row, field_name, source, row_number, report)
    _validate_probability(row, "model_probability", source, row_number, report)
    _validate_probability(row, "raw_probability", source, row_number, report)


def _validate_props_row(row: dict[str, str], source: str, row_number: int, report: FileReport) -> None:
    prop_type = _lower(row.get("prop_type"))
    if prop_type and prop_type not in VALID_PROP_TYPES:
        report.errors.append(ValidationIssue("error", source, f"invalid prop_type {row.get('prop_type')}", row_number))
    if not row.get("player"):
        report.errors.append(ValidationIssue("error", source, "missing player value", row_number))
    for field_name in ("over_price", "under_price", "best_price", "consensus_price"):
        _validate_price(row, field_name, source, row_number, report)
    _validate_probability(row, "raw_probability", source, row_number, report)


def _validate_lineup_row(row: dict[str, str], source: str, row_number: int, report: FileReport) -> None:
    status = _lower(row.get("lineup_status"))
    if status and status not in VALID_LINEUP_STATUS:
        report.errors.append(ValidationIssue("error", source, f"invalid lineup_status {row.get('lineup_status')}", row_number))
    if row.get("batting_order"):
        try:
            order = int(float(row["batting_order"]))
        except ValueError:
            report.errors.append(ValidationIssue("error", source, f"invalid batting_order {row['batting_order']}", row_number))
            return
        if order < 1 or order > 9:
            report.warnings.append(ValidationIssue("warning", source, f"batting_order outside 1-9: {row['batting_order']}", row_number))


def _validate_numeric_context(row: dict[str, str], data_type: str, source: str, row_number: int, report: FileReport) -> None:
    fields = {
        "weather": ["temperature", "wind_speed", "humidity", "dew_point", "precipitation_risk"],
        "ballpark": ["run_factor", "hr_factor", "weather_factor", "rh_hr_factor", "lh_hr_factor"],
    }[data_type]
    for field_name in fields:
        if row.get(field_name) and _to_float(row[field_name]) is None:
            report.errors.append(ValidationIssue("error", source, f"invalid numeric {field_name}: {row[field_name]}", row_number))


def _validate_probability(row: dict[str, str], field_name: str, source: str, row_number: int, report: FileReport) -> None:
    if not row.get(field_name):
        return
    value = _to_float(row[field_name])
    if value is None:
        report.errors.append(ValidationIssue("error", source, f"invalid {field_name}: {row[field_name]}", row_number))
        return
    if value < 0 or value > 100:
        report.errors.append(ValidationIssue("error", source, f"{field_name} outside 0-1 or 0-100 range: {row[field_name]}", row_number))
    elif value > 1:
        report.warnings.append(
            ValidationIssue("warning", source, f"{field_name} appears to be percent {row[field_name]}; use 0.57 format when possible", row_number)
        )


def _validate_price(row: dict[str, str], field_name: str, source: str, row_number: int, report: FileReport) -> None:
    if not row.get(field_name):
        return
    if _to_float(str(row[field_name]).replace("+", "")) is None:
        report.errors.append(ValidationIssue("error", source, f"invalid price {field_name}: {row[field_name]}", row_number))


def _validate_timestamp(value: str, source: str, row_number: int, report: FileReport, *, slate_date: str | None) -> None:
    parsed = _parse_datetime(value)
    if parsed is None:
        report.warnings.append(ValidationIssue("warning", source, f"timestamp is not ISO-like: {value}", row_number))
        return
    if slate_date:
        try:
            target = date_cls.fromisoformat(slate_date)
        except ValueError:
            return
        if abs((parsed.date() - target).days) > 2:
            report.warnings.append(
                ValidationIssue("warning", source, f"timestamp {value} is more than 2 days from slate date {slate_date}", row_number)
            )


def _has_game_identifier(data_type: str, row: dict[str, str]) -> bool:
    if row.get("game_id"):
        return True
    if row.get("away_team") and row.get("home_team"):
        return True
    return data_type in {"weather", "ballpark"} and bool(row.get("venue"))


def _normalize_row(row: dict[str, Any]) -> dict[str, str]:
    return {str(key).strip(): "" if value is None else str(value).strip() for key, value in row.items()}


def _missing_file_report(data_type: str, path: Path) -> FileReport:
    return FileReport(label=path.name, errors=[ValidationIssue("error", str(path), f"{data_type} file not found")])


def _render_reports(reports: list[FileReport], *, strict: bool) -> str:
    errors = [issue for report in reports for issue in report.errors]
    warnings = [issue for report in reports for issue in report.warnings]
    lines = ["EchoIQ Manual Input Validation", "", "Files checked:"]
    for report in reports:
        lines.append(f"- {report.label}: {report.rows} rows, {len(report.errors)} errors, {len(report.warnings)} warnings")
    lines.extend(["", "Errors:"])
    lines.extend(issue.format() for issue in errors) if errors else lines.append("- none")
    lines.extend(["", "Warnings:"])
    lines.extend(issue.format() for issue in warnings) if warnings else lines.append("- none")
    invalid = bool(errors) or (strict and bool(warnings))
    lines.extend(["", "Final status:", "- INVALID" if invalid else "- VALID"])
    if strict and warnings and not errors:
        lines.append("- strict mode treats warnings as failures")
    return "\n".join(lines)


def _lower(value: str | None) -> str:
    return (value or "").strip().lower()


def _to_float(value: str | None) -> float | None:
    if value is None:
        return None
    text = str(value).strip().replace("%", "").replace(",", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _parse_datetime(value: str) -> datetime | None:
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        try:
            return datetime.combine(date_cls.fromisoformat(value[:10]), datetime.min.time())
        except ValueError:
            return None


if __name__ == "__main__":
    raise SystemExit(main())
