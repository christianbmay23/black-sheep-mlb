from __future__ import annotations

import csv
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CREATE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "create_slate.py"
GRADE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "grade_slate.py"


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    sys.path.insert(0, str(path.parent))
    try:
        spec.loader.exec_module(module)
    finally:
        sys.path.pop(0)
    return module


create_slate_module = _load_module("create_slate_for_grade_tests", CREATE_SCRIPT)
grade_slate_module = _load_module("grade_slate_for_tests", GRADE_SCRIPT)


class EchoIQV3GradeSlateTests(unittest.TestCase):
    def test_blank_slate_grades_empty(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertEqual(summary.grading_status, "EMPTY")
            self.assertEqual(summary.total_rows, 0)
            self.assertEqual(summary.errors, [])

    def test_valid_official_bet_hit_contributes_to_official_roi(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="BET", result="HIT", profit_units="1.5")
            _write_rows(slate_dir / "04_final_card" / "official_card.csv", [row])

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertEqual(summary.grading_status, "GRADED")
            self.assertEqual(summary.bucket_counts["official_bet"], 1)
            self.assertEqual(summary.result_counts["HIT"], 1)
            self.assertEqual(summary.roi["official_bet"].profit_units, 1.5)

    def test_watchlist_hit_does_not_contribute_to_roi(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="WATCHLIST", prediction_bucket="watchlist", result="HIT", profit_units="1.5")
            row["stake_units"] = ""
            _write_rows(slate_dir / "04_final_card" / "watchlist.csv", [row])

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertEqual(summary.result_counts["WATCHLIST-HIT"], 1)
            self.assertEqual(summary.roi["official_bet"].rows, 0)
            self.assertEqual(summary.roi["combined_actionable"].rows, 0)

    def test_external_hit_does_not_contribute_to_echoiq_roi(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="EXTERNAL", prediction_bucket="external_public", result="HIT", profit_units="1.5")
            row["stake_units"] = ""
            _write_rows(slate_dir / "01_raw_research" / "external_public_predictions.csv", [row])

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertEqual(summary.result_counts["EXTERNAL-HIT"], 1)
            self.assertEqual(summary.roi["official_bet"].rows, 0)
            self.assertEqual(summary.roi["combined_actionable"].rows, 0)

    def test_pending_conditional_is_void_not_loss(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="CONDITIONAL", prediction_bucket="conditional_card", result="LOSS")
            row["gate_status"] = "PENDING"
            row["gate_conditions"] = "Lineup confirmation"
            _write_rows(slate_dir / "04_final_card" / "conditional_card.csv", [row])

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertEqual(summary.result_counts["VOID"], 1)
            self.assertEqual(summary.roi["cleared_conditional"].rows, 0)

    def test_cleared_conditional_counts_separately(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="CONDITIONAL", prediction_bucket="conditional_card", result="HIT", profit_units="0.75")
            row["gate_status"] = "CLEARED"
            row["gate_conditions"] = "Lineup confirmed"
            _write_rows(slate_dir / "04_final_card" / "conditional_card.csv", [row])

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertEqual(summary.bucket_counts["cleared_conditional"], 1)
            self.assertEqual(summary.roi["cleared_conditional"].profit_units, 0.75)
            self.assertEqual(summary.roi["official_bet"].rows, 0)

    def test_lottery_roi_is_separate(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="LOTTERY", prediction_bucket="lottery_card", result="HIT", profit_units="2.0")
            _write_rows(slate_dir / "04_final_card" / "lottery_card.csv", [row])

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertEqual(summary.bucket_counts["lottery"], 1)
            self.assertEqual(summary.roi["lottery"].profit_units, 2.0)
            self.assertEqual(summary.roi["official_bet"].rows, 0)

    def test_wrong_player_hit_produces_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="BET", result="HIT")
            row["result_player"] = "Different Player"
            _write_rows(slate_dir / "04_final_card" / "official_card.csv", [row])

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertEqual(summary.grading_status, "FAIL")
            self.assertTrue(any("Player-specific HIT credited to wrong player" in error for error in summary.errors))

    def test_estimated_odds_are_flagged(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="BET", result="HIT")
            row["odds_is_estimated"] = "true"
            _write_rows(slate_dir / "04_final_card" / "official_card.csv", [row], extra_fields=["odds_is_estimated"])

            summary = grade_slate_module.grade_slate(slate_dir)

            self.assertTrue(any("estimated odds flagged" in warning for warning in summary.warnings))

    def test_json_cli_returns_parseable_json(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            result = subprocess.run(
                [sys.executable, str(GRADE_SCRIPT), str(slate_dir), "--json"],
                cwd=REPO_ROOT,
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            payload = json.loads(result.stdout)
            self.assertEqual(payload["grading_status"], "EMPTY")

    def test_write_report_creates_postgame_report(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            summary = grade_slate_module.grade_slate(slate_dir, write_report=True, allow_incomplete=True)

            report = slate_dir / "05_postgame" / "postgame_report.md"
            self.assertEqual(summary.report_path, report)
            self.assertTrue(report.exists())
            self.assertIn("EchoIQ v3 Bucketed Postgame Report", report.read_text(encoding="utf-8"))

    def test_blank_slate_write_artifacts_creates_header_only_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            summary = grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            self.assertEqual(summary.grading_status, "EMPTY")
            for relative_path in [
                "05_postgame/postgame_grade.csv",
                "05_postgame/error_ledger.csv",
                "05_postgame/model_lessons.csv",
                "05_postgame/postgame_report.md",
            ]:
                self.assertTrue((slate_dir / relative_path).exists(), relative_path)
            self.assertEqual(_read_csv(slate_dir / "05_postgame" / "postgame_grade.csv"), [])
            self.assertEqual(_read_csv(slate_dir / "05_postgame" / "error_ledger.csv"), [])
            self.assertEqual(_read_csv(slate_dir / "05_postgame" / "model_lessons.csv"), [])

    def test_write_artifacts_official_bet_hit_flags_official_roi(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="BET", result="HIT", profit_units="1.5")
            _write_rows(slate_dir / "04_final_card" / "official_card.csv", [row])

            grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            rows = _read_csv(slate_dir / "05_postgame" / "postgame_grade.csv")
            self.assertEqual(rows[0]["normalized_result"], "HIT")
            self.assertEqual(rows[0]["counts_toward_official_roi"], "true")
            self.assertEqual(rows[0]["counts_toward_lottery_roi"], "false")

    def test_write_artifacts_watchlist_hit_does_not_flag_official_roi(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="WATCHLIST", prediction_bucket="watchlist", result="HIT")
            row["stake_units"] = ""
            _write_rows(slate_dir / "04_final_card" / "watchlist.csv", [row])

            grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            rows = _read_csv(slate_dir / "05_postgame" / "postgame_grade.csv")
            self.assertEqual(rows[0]["normalized_result"], "WATCHLIST-HIT")
            self.assertEqual(rows[0]["counts_toward_official_roi"], "false")

    def test_write_artifacts_external_hit_counts_external_accuracy_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="EXTERNAL", prediction_bucket="external_public", result="HIT")
            row["stake_units"] = ""
            _write_rows(slate_dir / "01_raw_research" / "external_public_predictions.csv", [row])

            grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            rows = _read_csv(slate_dir / "05_postgame" / "postgame_grade.csv")
            self.assertEqual(rows[0]["normalized_result"], "EXTERNAL-HIT")
            self.assertEqual(rows[0]["counts_toward_external_accuracy"], "true")
            self.assertEqual(rows[0]["counts_toward_official_roi"], "false")

    def test_write_artifacts_wrong_player_hit_writes_error_ledger(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="BET", result="HIT")
            row["result_player"] = "Different Player"
            _write_rows(slate_dir / "04_final_card" / "official_card.csv", [row])

            grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            rows = _read_csv(slate_dir / "05_postgame" / "error_ledger.csv")
            self.assertTrue(any(row["error_type"] == "wrong-player HIT" for row in rows))

    def test_write_artifacts_unknown_result_with_allow_incomplete_writes_ledger(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="BET", result="")
            _write_rows(slate_dir / "04_final_card" / "official_card.csv", [row])

            summary = grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            self.assertEqual(summary.grading_status, "READY_TO_GRADE")
            rows = _read_csv(slate_dir / "05_postgame" / "error_ledger.csv")
            self.assertTrue(any(row["error_type"] == "unknown/unverified result" for row in rows))

    def test_write_artifacts_pending_conditional_is_void_no_action(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="CONDITIONAL", prediction_bucket="conditional_card", result="LOSS")
            row["gate_status"] = "PENDING"
            row["gate_conditions"] = "Lineup confirmation"
            _write_rows(slate_dir / "04_final_card" / "conditional_card.csv", [row])

            grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            rows = _read_csv(slate_dir / "05_postgame" / "postgame_grade.csv")
            self.assertEqual(rows[0]["normalized_result"], "VOID")
            self.assertEqual(rows[0]["counts_toward_conditional_roi"], "false")

    def test_write_artifacts_lottery_flags_lottery_roi_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="LOTTERY", prediction_bucket="lottery_card", result="HIT", profit_units="2.0")
            _write_rows(slate_dir / "04_final_card" / "lottery_card.csv", [row])

            grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            rows = _read_csv(slate_dir / "05_postgame" / "postgame_grade.csv")
            self.assertEqual(rows[0]["counts_toward_lottery_roi"], "true")
            self.assertEqual(rows[0]["counts_toward_official_roi"], "false")

    def test_write_artifacts_does_not_modify_official_card(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            official_card = slate_dir / "04_final_card" / "official_card.csv"
            before = official_card.read_text(encoding="utf-8")

            grade_slate_module.grade_slate(slate_dir, write_artifacts=True, allow_incomplete=True)

            self.assertEqual(official_card.read_text(encoding="utf-8"), before)


def _create_test_slate(tmp_root: Path) -> Path:
    source_template = REPO_ROOT / "slates" / "_template"
    source_templates = REPO_ROOT / "echoiq_v3" / "templates"
    (tmp_root / "slates").mkdir()
    shutil.copytree(source_template, tmp_root / "slates" / "_template")
    shutil.copytree(source_templates, tmp_root / "echoiq_v3" / "templates")
    create_slate_module.create_slate("2026-05-05", repo_root=tmp_root)
    return tmp_root / "slates" / "2026-05-05"


def _write_rows(path: Path, rows: list[dict[str, str]], extra_fields: list[str] | None = None) -> None:
    fieldnames = [
        "slate_date",
        "game_id",
        "game",
        "source",
        "source_type",
        "prediction_bucket",
        "label",
        "market_type",
        "team",
        "player",
        "result_player",
        "opponent",
        "pitcher",
        "line",
        "odds",
        "odds_estimated",
        "implied_probability",
        "fair_probability",
        "edge",
        "stake_units",
        "confidence_tier",
        "source_confidence",
        "gates_passed",
        "gate_status",
        "gate_conditions",
        "kill_switch",
        "rationale_short",
        "rationale_full",
        "status",
        "result",
        "actual_result",
        "actual_stat",
        "grade",
        "profit_units",
        "grading_notes",
        "source_urls",
        "timestamp",
    ]
    if extra_fields:
        fieldnames.extend(field for field in extra_fields if field not in fieldnames)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def _base_row(label: str, prediction_bucket: str = "official_card", result: str = "", profit_units: str = "") -> dict[str, str]:
    return {
        "slate_date": "2026-05-05",
        "game_id": "sample-game",
        "game": "NYY@BOS",
        "source": "EchoIQ",
        "source_type": "ECHOIQ",
        "prediction_bucket": prediction_bucket,
        "label": label,
        "market_type": "HR",
        "team": "NYY",
        "player": "Aaron Judge",
        "result_player": "",
        "opponent": "BOS",
        "pitcher": "Sample Pitcher",
        "line": "0.5",
        "odds": "+300",
        "odds_estimated": "false",
        "implied_probability": "0.25",
        "fair_probability": "0.30",
        "edge": "0.05",
        "stake_units": "0.5",
        "confidence_tier": "B",
        "source_confidence": "A",
        "gates_passed": "true",
        "gate_status": "PASSED",
        "gate_conditions": "",
        "kill_switch": "Void if not starting",
        "rationale_short": "Test row",
        "rationale_full": "Test row",
        "status": "PREGAME",
        "result": result,
        "actual_result": "",
        "actual_stat": "",
        "grade": "",
        "profit_units": profit_units,
        "grading_notes": "",
        "source_urls": "https://example.test",
        "timestamp": "2026-05-05T10:00:00Z",
    }


if __name__ == "__main__":
    unittest.main()
