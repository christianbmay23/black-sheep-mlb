#!/usr/bin/env python3
"""
Create a bucketed EchoIQ v3 postgame grading summary from local slate artifacts.

This script does not fetch live data, infer outcomes, generate picks, or mutate
pregame artifacts. It only reads local CSV rows and optionally writes a markdown
postgame report.

Usage:
    python3 echoiq_v3/scripts/grade_slate.py slates/2026-05-05
    python3 echoiq_v3/scripts/grade_slate.py slates/2026-05-05 --json
    python3 echoiq_v3/scripts/grade_slate.py slates/2026-05-05 --markdown
    python3 echoiq_v3/scripts/grade_slate.py slates/2026-05-05 --write-report --allow-incomplete
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

from validate_prediction_rows import as_float, is_blank
from validate_slate import validate_slate


ACTIONABLE_GATE_STATUSES = {"PASSED", "CLEARED", "MET"}
FAILED_GATE_STATUSES = {"FAILED", "NOT_MET", "NOT MET", "NO_ACTION", "NO ACTION", "VOID"}
PLAYER_MARKETS = {"HR", "TB", "HIT", "RBI", "RUN", "PITCHER_PROP"}
RESULT_BUCKETS = [
    "HIT",
    "LOSS",
    "PUSH",
    "VOID",
    "UNKNOWN",
    "WATCHLIST-HIT",
    "WATCHLIST-LOSS",
    "EXTERNAL-HIT",
    "EXTERNAL-LOSS",
    "EXTERNAL-UNKNOWN",
    "PASS-CORRECT",
    "PASS-MISSED-OPPORTUNITY",
    "AVOID-CORRECT",
    "AVOID-MISSED-OPPORTUNITY",
]
LESSON_PLACEHOLDERS = [
    "false positive",
    "false negative",
    "good process / bad outcome",
    "bad process / good outcome",
    "source issue",
    "market issue",
    "weather/park issue",
    "pitcher volatility issue",
    "lineup/availability issue",
]

BUCKET_FILES = {
    "official": "04_final_card/official_card.csv",
    "conditional": "04_final_card/conditional_card.csv",
    "lottery": "04_final_card/lottery_card.csv",
    "watchlist": "04_final_card/watchlist.csv",
    "external": "01_raw_research/external_public_predictions.csv",
    "pass_avoid": "03_verification/pass_avoid.csv",
}
SUPPORT_FILES = {
    "postgame_grade": "05_postgame/postgame_grade.csv",
    "error_ledger": "05_postgame/error_ledger.csv",
    "model_lessons": "05_postgame/model_lessons.csv",
}
POSTGAME_GRADE_COLUMNS = [
    "slate_date",
    "source_file",
    "source_bucket",
    "label",
    "market_type",
    "game",
    "team",
    "player",
    "opponent",
    "pitcher",
    "line",
    "odds",
    "odds_is_estimated",
    "stake_units",
    "gate_status",
    "result",
    "normalized_result",
    "grade_bucket",
    "profit_units",
    "counts_toward_official_roi",
    "counts_toward_conditional_roi",
    "counts_toward_lottery_roi",
    "counts_toward_external_accuracy",
    "warning_count",
    "error_count",
    "grading_notes",
]
ERROR_LEDGER_COLUMNS = [
    "slate_date",
    "severity",
    "source_file",
    "row_number",
    "label",
    "player",
    "market_type",
    "error_type",
    "message",
    "suggested_fix",
]
MODEL_LESSONS_COLUMNS = [
    "slate_date",
    "lesson_type",
    "source_bucket",
    "label",
    "market_type",
    "game",
    "player",
    "pitcher",
    "outcome",
    "process_grade",
    "lesson",
    "next_action",
]


@dataclass
class GradedRow:
    bucket: str
    source_file: str
    line_number: int
    label: str
    normalized_result: str
    roi_bucket: str
    profit_units: float | None
    is_roi_counted: bool
    is_unknown: bool
    row: dict[str, str]


@dataclass
class RoiSummary:
    rows: int = 0
    graded_rows: int = 0
    profit_units: float = 0.0
    stake_units: float = 0.0

    @property
    def roi_per_unit(self) -> float | None:
        if self.stake_units <= 0:
            return None
        return self.profit_units / self.stake_units


@dataclass
class GradeSummary:
    slate_path: Path
    validation_status: str
    grading_status: str
    rows: list[GradedRow]
    bucket_counts: Counter[str]
    result_counts: Counter[str]
    roi: dict[str, RoiSummary]
    warnings: list[str]
    errors: list[str]
    error_ledger: list[str]
    model_lessons: list[str]
    support_file_counts: dict[str, int]
    report_path: Path | None = None
    written_artifacts: list[Path] = field(default_factory=list)

    @property
    def total_rows(self) -> int:
        return len(self.rows)

    @property
    def unknown_rows(self) -> int:
        return sum(1 for row in self.rows if row.is_unknown)


def grade_slate(
    slate_path: Path | str,
    *,
    allow_incomplete: bool = False,
    write_report: bool = False,
    write_artifacts: bool = False,
) -> GradeSummary:
    slate_path = Path(slate_path)
    validation = validate_slate(slate_path, strict=True)
    warnings = list(validation.warnings)
    errors = list(validation.errors)
    error_ledger: list[str] = []
    rows: list[GradedRow] = []

    for bucket, relative_path in BUCKET_FILES.items():
        rows.extend(_read_and_grade_file(slate_path, bucket, relative_path, warnings, errors, error_ledger))

    support_file_counts = _read_support_file_counts(slate_path, warnings)
    bucket_counts = Counter({bucket: 0 for bucket in ["official_bet", "conditional", "cleared_conditional", "lottery", "watchlist", "external", "pass_avoid"]})
    result_counts = Counter({result: 0 for result in RESULT_BUCKETS})
    roi = {
        "official_bet": RoiSummary(),
        "cleared_conditional": RoiSummary(),
        "lottery": RoiSummary(),
        "combined_actionable": RoiSummary(),
    }

    for row in rows:
        _count_bucket(row, bucket_counts)
        result_counts[row.normalized_result] += 1
        if row.is_roi_counted:
            _add_roi(roi[row.roi_bucket], row)
            if row.roi_bucket in {"official_bet", "cleared_conditional", "lottery"}:
                _add_roi(roi["combined_actionable"], row)

    has_unknown_rows = any(row.is_unknown for row in rows)
    if not allow_incomplete and has_unknown_rows:
        warnings.append("Rows exist with missing result fields; rerun with --allow-incomplete to explicitly allow UNKNOWN/UNVERIFIED rows.")

    grading_status = _grading_status(rows, errors, warnings)
    model_lessons = list(LESSON_PLACEHOLDERS)
    summary = GradeSummary(
        slate_path=slate_path,
        validation_status=validation.status,
        grading_status=grading_status,
        rows=rows,
        bucket_counts=bucket_counts,
        result_counts=result_counts,
        roi=roi,
        warnings=warnings,
        errors=errors,
        error_ledger=error_ledger,
        model_lessons=model_lessons,
        support_file_counts=support_file_counts,
    )

    if write_report:
        report_path = slate_path / "05_postgame" / "postgame_report.md"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(format_markdown(summary), encoding="utf-8")
        summary.report_path = report_path
        summary.written_artifacts.append(report_path)

    if write_artifacts:
        if has_unknown_rows and not allow_incomplete:
            summary.errors.append("Refusing --write-artifacts because UNKNOWN/UNVERIFIED rows exist. Use --allow-incomplete to write explicit UNKNOWN artifacts.")
            summary.grading_status = "FAIL"
        else:
            _write_postgame_artifacts(summary)

    return summary


def _read_and_grade_file(
    slate_path: Path,
    bucket: str,
    relative_path: str,
    warnings: list[str],
    errors: list[str],
    error_ledger: list[str],
) -> list[GradedRow]:
    path = slate_path / relative_path
    if not path.exists():
        warnings.append(f"Missing grading artifact: {relative_path}")
        return []

    graded: list[GradedRow] = []
    try:
        with path.open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            for idx, row in enumerate(reader, start=2):
                graded.append(_grade_row(bucket, relative_path, idx, row, warnings, errors, error_ledger))
    except (csv.Error, OSError, UnicodeDecodeError) as exc:
        errors.append(f"{relative_path}: unable to read grading artifact: {exc}")
    return graded


def _grade_row(
    bucket: str,
    relative_path: str,
    line_number: int,
    row: dict[str, str],
    warnings: list[str],
    errors: list[str],
    error_ledger: list[str],
) -> GradedRow:
    row_ref = f"{relative_path}:{line_number}"
    label = (row.get("label") or "").strip()
    raw_result = _raw_result(row)
    normalized_result = _normalize_result(bucket, label, raw_result, row)
    roi_bucket = "none"
    is_roi_counted = False
    is_unknown = normalized_result.endswith("UNKNOWN") or normalized_result == "UNKNOWN"
    profit_units = _profit_units(row, normalized_result, row_ref, warnings)

    _check_safety(row, bucket, label, normalized_result, row_ref, warnings, errors, error_ledger)

    if bucket == "official" and label == "BET":
        roi_bucket = "official_bet"
        is_roi_counted = normalized_result in {"HIT", "LOSS", "PUSH"}
    elif bucket == "conditional" and label == "CONDITIONAL" and _gate_cleared(row):
        roi_bucket = "cleared_conditional"
        is_roi_counted = normalized_result in {"HIT", "LOSS", "PUSH"}
    elif bucket == "lottery" and label == "LOTTERY":
        roi_bucket = "lottery"
        is_roi_counted = normalized_result in {"HIT", "LOSS", "PUSH"}

    if bucket == "conditional" and label == "CONDITIONAL" and not _gate_cleared(row):
        normalized_result = "VOID"
        profit_units = 0.0
        is_roi_counted = False
        is_unknown = False

    return GradedRow(
        bucket=bucket,
        source_file=relative_path,
        line_number=line_number,
        label=label,
        normalized_result=normalized_result,
        roi_bucket=roi_bucket,
        profit_units=profit_units,
        is_roi_counted=is_roi_counted,
        is_unknown=is_unknown,
        row=row,
    )


def _raw_result(row: dict[str, str]) -> str:
    for field in ["result", "actual_result", "grade"]:
        value = (row.get(field) or "").strip()
        if value:
            return value.upper().replace("_", "-")
    status = (row.get("status") or "").strip().upper()
    if status == "VOID":
        return "VOID"
    return ""


def _normalize_result(bucket: str, label: str, raw_result: str, row: dict[str, str]) -> str:
    if bucket == "conditional" and label == "CONDITIONAL" and not _gate_cleared(row):
        return "VOID"
    if not raw_result:
        return "UNKNOWN"
    if raw_result in {"WIN", "WON", "HIT", "YES"}:
        if bucket == "watchlist":
            return "WATCHLIST-HIT"
        if bucket == "external" or label == "EXTERNAL":
            return "EXTERNAL-HIT"
        if bucket == "pass_avoid" and label == "PASS":
            return "PASS-MISSED-OPPORTUNITY"
        if bucket == "pass_avoid" and label == "AVOID":
            return "AVOID-MISSED-OPPORTUNITY"
        return "HIT"
    if raw_result in {"LOSE", "LOST", "LOSS", "MISS", "NO"}:
        if bucket == "watchlist":
            return "WATCHLIST-LOSS"
        if bucket == "external" or label == "EXTERNAL":
            return "EXTERNAL-LOSS"
        if bucket == "pass_avoid" and label == "PASS":
            return "PASS-CORRECT"
        if bucket == "pass_avoid" and label == "AVOID":
            return "AVOID-CORRECT"
        return "LOSS"
    if raw_result in {"PUSH", "TIE"}:
        return "PUSH"
    if raw_result in {"VOID", "NO-ACTION", "NO ACTION", "N/A", "NA"}:
        return "VOID"
    if raw_result in {"WATCHLIST-HIT", "WATCHLIST-LOSS", "EXTERNAL-HIT", "EXTERNAL-LOSS", "EXTERNAL-UNKNOWN"}:
        return raw_result
    if raw_result in {"PASS-CORRECT", "PASS-MISSED-OPPORTUNITY", "AVOID-CORRECT", "AVOID-MISSED-OPPORTUNITY"}:
        return raw_result
    return "UNKNOWN"


def _check_safety(
    row: dict[str, str],
    bucket: str,
    label: str,
    normalized_result: str,
    row_ref: str,
    warnings: list[str],
    errors: list[str],
    error_ledger: list[str],
) -> None:
    if bucket == "official" and label != "BET":
        if label == "LOTTERY":
            warnings.append(f"{row_ref}: LOTTERY appears in official_card; lottery ROI remains separate")
        elif label == "EXTERNAL":
            errors.append(f"{row_ref}: EXTERNAL in official ROI")
            error_ledger.append(f"{row_ref}: EXTERNAL in official ROI")
        elif label == "WATCHLIST":
            errors.append(f"{row_ref}: WATCHLIST mixed into official_card")
            error_ledger.append(f"{row_ref}: WATCHLIST mixed into official_card")

    stake = as_float(row.get("stake_units"))
    if label == "WATCHLIST" and stake is not None and stake > 0:
        errors.append(f"{row_ref}: WATCHLIST with stake")
        error_ledger.append(f"{row_ref}: WATCHLIST with stake")

    if label == "EXTERNAL" and _truthy(row.get("counts_for_echoiq_roi")):
        errors.append(f"{row_ref}: EXTERNAL counted toward EchoIQ ROI")
        error_ledger.append(f"{row_ref}: EXTERNAL counted toward EchoIQ ROI")

    if label == "CONDITIONAL" and normalized_result in {"HIT", "LOSS", "PUSH"} and not _gate_cleared(row):
        errors.append(f"{row_ref}: conditional graded without gate cleared")
        error_ledger.append(f"{row_ref}: conditional graded without gate cleared")

    if _estimated_odds(row):
        warnings.append(f"{row_ref}: estimated odds flagged; ROI is not exact")

    if _is_player_specific(row) and normalized_result in {"HIT", "WATCHLIST-HIT", "EXTERNAL-HIT"}:
        player = (row.get("player") or "").strip()
        result_player = (row.get("result_player") or "").strip()
        if result_player and player and result_player.casefold() != player.casefold():
            errors.append(f"{row_ref}: Player-specific HIT credited to wrong player.")
            error_ledger.append(f"{row_ref}: Player-specific HIT credited to wrong player.")

    if _truthy(row.get("early_game_na")) and (row.get("game_scope") or row.get("slate_scope") or "").strip().lower() == "full_slate":
        errors.append(f"{row_ref}: full-slate row marked N/A because game was early")
        error_ledger.append(f"{row_ref}: full-slate row marked N/A because game was early")


def _gate_cleared(row: dict[str, str]) -> bool:
    return (row.get("gate_status") or "").strip().upper() in ACTIONABLE_GATE_STATUSES


def _gate_failed(row: dict[str, str]) -> bool:
    return (row.get("gate_status") or "").strip().upper() in FAILED_GATE_STATUSES


def _is_player_specific(row: dict[str, str]) -> bool:
    market = (row.get("market_type") or "").strip().upper()
    return market in PLAYER_MARKETS or bool((row.get("player") or "").strip())


def _estimated_odds(row: dict[str, str]) -> bool:
    return _truthy(row.get("odds_is_estimated")) or _truthy(row.get("odds_estimated"))


def _profit_units(row: dict[str, str], normalized_result: str, row_ref: str, warnings: list[str]) -> float | None:
    explicit_profit = as_float(row.get("profit_units"))
    if explicit_profit is not None:
        return explicit_profit
    if normalized_result in {"PUSH", "VOID"}:
        return 0.0
    if normalized_result not in {"HIT", "LOSS"}:
        return None

    stake = as_float(row.get("stake_units"))
    odds = as_float(row.get("odds"))
    if stake is None or odds is None:
        warnings.append(f"{row_ref}: missing profit_units and insufficient odds/stake for ROI")
        return None
    if normalized_result == "LOSS":
        return -stake
    if odds > 0:
        return stake * odds / 100.0
    if odds < 0:
        return stake * 100.0 / abs(odds)
    warnings.append(f"{row_ref}: invalid odds for ROI")
    return None


def _add_roi(summary: RoiSummary, row: GradedRow) -> None:
    summary.rows += 1
    stake = as_float(row.row.get("stake_units"))
    if stake is not None and row.normalized_result in {"HIT", "LOSS"}:
        summary.stake_units += stake
    if row.profit_units is not None:
        summary.graded_rows += 1
        summary.profit_units += row.profit_units


def _count_bucket(row: GradedRow, counts: Counter[str]) -> None:
    if row.bucket == "official" and row.label == "BET":
        counts["official_bet"] += 1
    elif row.bucket == "conditional":
        counts["conditional"] += 1
        if _gate_cleared(row.row):
            counts["cleared_conditional"] += 1
    elif row.bucket == "lottery":
        counts["lottery"] += 1
    elif row.bucket == "watchlist":
        counts["watchlist"] += 1
    elif row.bucket == "external":
        counts["external"] += 1
    elif row.bucket == "pass_avoid":
        counts["pass_avoid"] += 1


def _read_support_file_counts(slate_path: Path, warnings: list[str]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for key, relative_path in SUPPORT_FILES.items():
        path = slate_path / relative_path
        if not path.exists():
            counts[key] = 0
            continue
        try:
            with path.open(newline="", encoding="utf-8") as handle:
                counts[key] = sum(1 for _ in csv.DictReader(handle))
        except (csv.Error, OSError, UnicodeDecodeError) as exc:
            warnings.append(f"{relative_path}: unable to read support file: {exc}")
            counts[key] = 0
    return counts


def _write_postgame_artifacts(summary: GradeSummary) -> None:
    postgame_dir = summary.slate_path / "05_postgame"
    postgame_dir.mkdir(parents=True, exist_ok=True)

    postgame_grade = postgame_dir / "postgame_grade.csv"
    error_ledger = postgame_dir / "error_ledger.csv"
    model_lessons = postgame_dir / "model_lessons.csv"
    postgame_report = postgame_dir / "postgame_report.md"

    _write_csv(postgame_grade, POSTGAME_GRADE_COLUMNS, _postgame_grade_rows(summary))
    _write_csv(error_ledger, ERROR_LEDGER_COLUMNS, _error_ledger_rows(summary))
    _write_csv(model_lessons, MODEL_LESSONS_COLUMNS, _model_lesson_rows(summary))
    summary.report_path = postgame_report
    summary.written_artifacts.extend([postgame_grade, error_ledger, model_lessons, postgame_report])
    postgame_report.write_text(format_markdown(summary), encoding="utf-8")


def _write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _postgame_grade_rows(summary: GradeSummary) -> list[dict[str, str]]:
    return [_postgame_grade_row(summary.slate_path.name, row, summary.warnings, summary.errors) for row in summary.rows]


def _postgame_grade_row(slate_date: str, graded: GradedRow, warnings: list[str], errors: list[str]) -> dict[str, str]:
    row_ref = f"{graded.source_file}:{graded.line_number}"
    row = graded.row
    external_accuracy = graded.bucket == "external" and graded.normalized_result in {"EXTERNAL-HIT", "EXTERNAL-LOSS"}
    return {
        "slate_date": row.get("slate_date") or slate_date,
        "source_file": graded.source_file,
        "source_bucket": graded.bucket,
        "label": graded.label,
        "market_type": row.get("market_type", ""),
        "game": row.get("game", ""),
        "team": row.get("team", ""),
        "player": row.get("player", ""),
        "opponent": row.get("opponent", ""),
        "pitcher": row.get("pitcher", ""),
        "line": row.get("line", ""),
        "odds": row.get("odds", ""),
        "odds_is_estimated": _bool_text(_estimated_odds(row)),
        "stake_units": row.get("stake_units", ""),
        "gate_status": row.get("gate_status", ""),
        "result": _raw_result(row) or "UNKNOWN",
        "normalized_result": graded.normalized_result,
        "grade_bucket": graded.roi_bucket,
        "profit_units": "" if graded.profit_units is None else str(round(graded.profit_units, 6)),
        "counts_toward_official_roi": _bool_text(graded.roi_bucket == "official_bet" and graded.is_roi_counted),
        "counts_toward_conditional_roi": _bool_text(graded.roi_bucket == "cleared_conditional" and graded.is_roi_counted),
        "counts_toward_lottery_roi": _bool_text(graded.roi_bucket == "lottery" and graded.is_roi_counted),
        "counts_toward_external_accuracy": _bool_text(external_accuracy),
        "warning_count": str(_count_messages_for_ref(warnings, row_ref)),
        "error_count": str(_count_messages_for_ref(errors, row_ref)),
        "grading_notes": row.get("grading_notes", ""),
    }


def _error_ledger_rows(summary: GradeSummary) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for warning in summary.warnings:
        rows.append(_ledger_row(summary.slate_path.name, "WARNING", warning, summary.rows))
    for error in summary.errors:
        rows.append(_ledger_row(summary.slate_path.name, "ERROR", error, summary.rows))
    for graded in summary.rows:
        if graded.is_unknown:
            rows.append(_row_ledger_row(summary.slate_path.name, "WARNING", graded, "unknown/unverified result", "Enter verified result fields or rerun with complete local postgame data."))
        if graded.is_roi_counted and graded.profit_units is None:
            rows.append(_row_ledger_row(summary.slate_path.name, "WARNING", graded, "missing profit fields where ROI cannot be calculated", "Populate profit_units or odds/stake/result fields."))
    return rows


def _ledger_row(slate_date: str, severity: str, message: str, graded_rows: list[GradedRow]) -> dict[str, str]:
    source_file, row_number = _parse_message_location(message)
    graded = _find_graded_row(graded_rows, source_file, row_number)
    error_type = _error_type(message)
    return {
        "slate_date": slate_date,
        "severity": severity,
        "source_file": source_file,
        "row_number": row_number,
        "label": graded.label if graded else "",
        "player": graded.row.get("player", "") if graded else "",
        "market_type": graded.row.get("market_type", "") if graded else "",
        "error_type": error_type,
        "message": message,
        "suggested_fix": _suggested_fix(error_type),
    }


def _row_ledger_row(slate_date: str, severity: str, graded: GradedRow, error_type: str, suggested_fix: str) -> dict[str, str]:
    return {
        "slate_date": slate_date,
        "severity": severity,
        "source_file": graded.source_file,
        "row_number": str(graded.line_number),
        "label": graded.label,
        "player": graded.row.get("player", ""),
        "market_type": graded.row.get("market_type", ""),
        "error_type": error_type,
        "message": f"{graded.source_file}:{graded.line_number}: {error_type}",
        "suggested_fix": suggested_fix,
    }


def _model_lesson_rows(summary: GradeSummary) -> list[dict[str, str]]:
    lessons: list[dict[str, str]] = []
    for graded in summary.rows:
        lesson_type = _lesson_type(graded)
        if not lesson_type:
            continue
        lessons.append({
            "slate_date": graded.row.get("slate_date") or summary.slate_path.name,
            "lesson_type": lesson_type,
            "source_bucket": graded.bucket,
            "label": graded.label,
            "market_type": graded.row.get("market_type", ""),
            "game": graded.row.get("game", ""),
            "player": graded.row.get("player", ""),
            "pitcher": graded.row.get("pitcher", ""),
            "outcome": graded.normalized_result,
            "process_grade": _process_grade(graded),
            "lesson": _lesson_text(lesson_type),
            "next_action": _lesson_next_action(lesson_type),
        })
    return lessons


def _lesson_type(graded: GradedRow) -> str:
    if graded.normalized_result in {"WATCHLIST-HIT", "WATCHLIST-LOSS"}:
        return "watchlist_hit_not_bet" if graded.normalized_result == "WATCHLIST-HIT" else "false_positive"
    if graded.normalized_result in {"EXTERNAL-HIT", "EXTERNAL-LOSS"}:
        return "external_only_signal"
    if graded.normalized_result == "HIT" and graded.roi_bucket in {"official_bet", "cleared_conditional", "lottery"}:
        return "bad_process_good_outcome" if _estimated_odds(graded.row) else "good_process_bad_outcome"
    if graded.normalized_result == "LOSS" and graded.roi_bucket in {"official_bet", "cleared_conditional", "lottery"}:
        return "false_positive"
    if graded.normalized_result in {"PASS-MISSED-OPPORTUNITY", "AVOID-MISSED-OPPORTUNITY"}:
        return "false_negative"
    if graded.normalized_result == "UNKNOWN":
        return "grading_safety_issue"
    return ""


def _process_grade(graded: GradedRow) -> str:
    if _estimated_odds(graded.row):
        return "review"
    if graded.normalized_result in {"UNKNOWN", "VOID"}:
        return "incomplete"
    if graded.roi_bucket in {"official_bet", "cleared_conditional", "lottery"}:
        return "review"
    return "informational"


def _lesson_text(lesson_type: str) -> str:
    messages = {
        "false_positive": "Local graded outcome was negative for a tracked signal.",
        "false_negative": "A passed or avoided row appears to have been a missed opportunity based on local result fields.",
        "good_process_bad_outcome": "Actionable row won locally; retain bucket separation before drawing model conclusions.",
        "bad_process_good_outcome": "Actionable row won but used an audit flag such as estimated odds.",
        "grading_safety_issue": "Insufficient local grading fields to verify outcome.",
        "external_only_signal": "External/public signal is tracked outside EchoIQ official ROI.",
        "watchlist_hit_not_bet": "Watchlist result is informational only and not official ROI.",
    }
    return messages.get(lesson_type, "Conservative local lesson placeholder.")


def _lesson_next_action(lesson_type: str) -> str:
    actions = {
        "false_positive": "Review gate inputs and source confidence before future promotion.",
        "false_negative": "Review whether pass/avoid gate was too strict after official verification.",
        "good_process_bad_outcome": "Keep evidence trail; do not overfit one outcome.",
        "bad_process_good_outcome": "Resolve audit flag before treating as repeatable edge.",
        "grading_safety_issue": "Add verified local result fields before final grading.",
        "external_only_signal": "Keep external source separate from EchoIQ ROI.",
        "watchlist_hit_not_bet": "Review whether watchlist gate should become a future candidate rule.",
    }
    return actions.get(lesson_type, "Review manually.")


def _parse_message_location(message: str) -> tuple[str, str]:
    first = message.split(":", 2)
    if len(first) >= 2 and "/" in first[0] and first[1].isdigit():
        return first[0], first[1]
    return "", ""


def _find_graded_row(rows: list[GradedRow], source_file: str, row_number: str) -> GradedRow | None:
    if not source_file or not row_number:
        return None
    for row in rows:
        if row.source_file == source_file and str(row.line_number) == row_number:
            return row
    return None


def _error_type(message: str) -> str:
    lowered = message.lower()
    if "bet missing" in lowered or "bet requires" in lowered:
        return "invalid BET row"
    if "watchlist with stake" in lowered or "watchlist cannot have stake" in lowered:
        return "WATCHLIST with stake"
    if "external in official" in lowered or "external counted" in lowered:
        return "EXTERNAL in official ROI"
    if "wrong player" in lowered:
        return "wrong-player HIT"
    if "conditional graded without gate" in lowered:
        return "CONDITIONAL graded without gate cleared"
    if "estimated odds" in lowered:
        return "estimated odds treated as exact"
    if "unknown" in lowered or "unverified" in lowered:
        return "unknown/unverified result"
    if "profit_units" in lowered or "roi" in lowered:
        return "missing profit fields where ROI cannot be calculated"
    return "grading_safety_issue"


def _suggested_fix(error_type: str) -> str:
    fixes = {
        "invalid BET row": "Complete BET-required local fields or remove from official ROI.",
        "WATCHLIST with stake": "Set watchlist stake_units to blank or 0.",
        "EXTERNAL in official ROI": "Move external/public row out of official_card.csv.",
        "wrong-player HIT": "Correct result_player or change result to LOSS/UNKNOWN.",
        "CONDITIONAL graded without gate cleared": "Set cleared gate_status or grade as VOID/NO ACTION.",
        "estimated odds treated as exact": "Keep estimated odds flagged and exclude from exact ROI.",
        "unknown/unverified result": "Populate verified local result fields.",
        "missing profit fields where ROI cannot be calculated": "Populate profit_units or sufficient odds/stake/result.",
    }
    return fixes.get(error_type, "Review row manually.")


def _count_messages_for_ref(messages: list[str], row_ref: str) -> int:
    return sum(1 for message in messages if message.startswith(row_ref))


def _bool_text(value: bool) -> str:
    return "true" if value else "false"


def _grading_status(rows: list[GradedRow], errors: list[str], warnings: list[str]) -> str:
    if errors:
        return "FAIL"
    if not rows:
        return "EMPTY"
    if any(row.is_unknown for row in rows):
        return "READY_TO_GRADE"
    if warnings:
        return "WARN"
    return "GRADED"


def _truthy(value: str | None) -> bool:
    if value is None:
        return False
    return str(value).strip().lower() in {"1", "true", "yes", "y", "counted", "included", "estimated"}


def summary_to_dict(summary: GradeSummary) -> dict[str, Any]:
    return {
        "slate_path": str(summary.slate_path),
        "validation_status": summary.validation_status,
        "grading_status": summary.grading_status,
        "row_count": summary.total_rows,
        "unknown_rows": summary.unknown_rows,
        "bucket_counts": dict(summary.bucket_counts),
        "result_counts": dict(summary.result_counts),
        "roi": {key: _roi_to_dict(value) for key, value in summary.roi.items()},
        "warnings": summary.warnings,
        "errors": summary.errors,
        "error_ledger": summary.error_ledger,
        "model_lessons_placeholders": summary.model_lessons,
        "support_file_counts": summary.support_file_counts,
        "report_path": str(summary.report_path) if summary.report_path else "",
        "written_artifacts": [str(path) for path in summary.written_artifacts],
    }


def _roi_to_dict(summary: RoiSummary) -> dict[str, Any]:
    return {
        "rows": summary.rows,
        "graded_rows": summary.graded_rows,
        "profit_units": round(summary.profit_units, 6),
        "stake_units": round(summary.stake_units, 6),
        "roi_per_unit": round(summary.roi_per_unit, 6) if summary.roi_per_unit is not None else None,
    }


def format_text(summary: GradeSummary) -> str:
    data = summary_to_dict(summary)
    lines = [
        "EchoIQ v3 bucketed postgame grading summary",
        f"Slate path: {summary.slate_path}",
        f"Validation status: {summary.validation_status}",
        f"Grading status: {summary.grading_status}",
        f"Rows graded/read: {summary.total_rows}",
        f"Unknown/unverified rows: {summary.unknown_rows}",
        "",
        "Bucket counts:",
    ]
    lines.extend(_counter_lines(data["bucket_counts"]))
    lines.extend(["", "Result counts:"])
    lines.extend(_counter_lines(data["result_counts"]))
    lines.extend(["", "ROI sections:"])
    for key, value in data["roi"].items():
        lines.append(f"- `{key}`: rows={value['rows']}, graded_rows={value['graded_rows']}, profit_units={value['profit_units']}, stake_units={value['stake_units']}, roi_per_unit={value['roi_per_unit']}")
    lines.extend(["", "Error ledger:"])
    lines.extend(_list_lines(summary.error_ledger))
    lines.extend(["", "Artifacts written:"])
    lines.extend(_list_lines([str(path) for path in summary.written_artifacts]))
    lines.extend(["", "Warnings:"])
    lines.extend(_list_lines(summary.warnings))
    lines.extend(["", "Errors:"])
    lines.extend(_list_lines(summary.errors))
    lines.extend(["", "Model lessons placeholders:"])
    lines.extend(_list_lines(summary.model_lessons))
    if summary.report_path:
        lines.extend(["", f"Report written: {summary.report_path}"])
    return "\n".join(lines)


def format_markdown(summary: GradeSummary) -> str:
    data = summary_to_dict(summary)
    lines = [
        "# EchoIQ v3 Bucketed Postgame Report",
        "",
        f"- Slate path: `{summary.slate_path}`",
        f"- Validation status: `{summary.validation_status}`",
        f"- Grading status: `{summary.grading_status}`",
        f"- Rows graded/read: {summary.total_rows}",
        f"- Unknown/unverified rows: {summary.unknown_rows}",
        "",
        "## Bucket Counts",
    ]
    lines.extend(_counter_lines(data["bucket_counts"]))
    lines.extend(["", "## Result Counts"])
    lines.extend(_counter_lines(data["result_counts"]))
    lines.extend(["", "## ROI Sections"])
    for key, value in data["roi"].items():
        lines.append(f"- `{key}`: rows={value['rows']}, graded_rows={value['graded_rows']}, profit_units={value['profit_units']}, stake_units={value['stake_units']}, roi_per_unit={value['roi_per_unit']}")
    lines.extend(["", "## Error Ledger"])
    lines.extend(_list_lines(summary.error_ledger))
    lines.extend(["", "## Artifacts Written"])
    lines.extend(_list_lines([str(path) for path in summary.written_artifacts]))
    lines.extend(["", "## Warnings"])
    lines.extend(_list_lines(summary.warnings))
    lines.extend(["", "## Errors"])
    lines.extend(_list_lines(summary.errors))
    lines.extend(["", "## Model Lessons Placeholders"])
    lines.extend(_list_lines(summary.model_lessons))
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
    parser = argparse.ArgumentParser(description="Grade EchoIQ v3 slate rows from local artifacts only.")
    parser.add_argument("slate_path", help="Path to a slate folder, for example slates/2026-05-05.")
    output = parser.add_mutually_exclusive_group()
    output.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    output.add_argument("--markdown", action="store_true", help="Print markdown report.")
    parser.add_argument("--write-report", action="store_true", help="Write 05_postgame/postgame_report.md.")
    parser.add_argument("--write-artifacts", action="store_true", help="Write postgame_grade.csv, error_ledger.csv, model_lessons.csv, and postgame_report.md.")
    parser.add_argument("--allow-incomplete", action="store_true", help="Allow UNKNOWN/UNVERIFIED rows without adding incomplete warning.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    summary = grade_slate(args.slate_path, allow_incomplete=args.allow_incomplete, write_report=args.write_report, write_artifacts=args.write_artifacts)
    if args.json:
        print(json.dumps(summary_to_dict(summary), indent=2, sort_keys=True))
    elif args.markdown:
        print(format_markdown(summary))
    else:
        print(format_text(summary))
    return 1 if summary.grading_status == "FAIL" else 0


if __name__ == "__main__":
    sys.exit(main())
