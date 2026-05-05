from __future__ import annotations

import csv
import importlib.util
import shutil
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SAMPLE_SLATE = REPO_ROOT / "slates" / "_sample_2026-05-04"
VALIDATE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "validate_slate.py"
SUMMARIZE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "summarize_slate.py"
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


validate_slate_module = _load_module("validate_slate_for_may4_sample_tests", VALIDATE_SCRIPT)
summarize_slate_module = _load_module("summarize_slate_for_may4_sample_tests", SUMMARIZE_SCRIPT)
grade_slate_module = _load_module("grade_slate_for_may4_sample_tests", GRADE_SCRIPT)


class EchoIQV3May4SampleTests(unittest.TestCase):
    def test_sample_slate_validates_strict(self):
        result = validate_slate_module.validate_slate(SAMPLE_SLATE, strict=True)

        self.assertEqual(result.status, "PASS")
        self.assertEqual(result.errors, [])

    def test_sample_slate_summarizes_expected_labels(self):
        summary = summarize_slate_module.summarize_slate(SAMPLE_SLATE)

        self.assertEqual(summary.readiness_status, "READY")
        self.assertEqual(summary.label_counts["BET"], 3)
        self.assertEqual(summary.label_counts["LOTTERY"], 1)
        self.assertEqual(summary.label_counts["WATCHLIST"], 1)
        self.assertEqual(summary.label_counts["EXTERNAL"], 1)
        self.assertEqual(summary.label_counts["CONDITIONAL"], 1)

    def test_sample_slate_grades_bucketed_results_and_roi(self):
        summary = grade_slate_module.grade_slate(SAMPLE_SLATE)

        self.assertEqual(summary.grading_status, "GRADED")
        self.assertEqual(summary.bucket_counts["official_bet"], 3)
        self.assertEqual(summary.bucket_counts["lottery"], 1)
        self.assertEqual(summary.bucket_counts["watchlist"], 1)
        self.assertEqual(summary.bucket_counts["external"], 1)
        self.assertEqual(summary.bucket_counts["conditional"], 1)
        self.assertEqual(summary.bucket_counts["cleared_conditional"], 0)
        self.assertEqual(summary.result_counts["HIT"], 3)
        self.assertEqual(summary.result_counts["LOSS"], 1)
        self.assertEqual(summary.result_counts["VOID"], 1)
        self.assertEqual(summary.result_counts["WATCHLIST-HIT"], 1)
        self.assertEqual(summary.result_counts["EXTERNAL-HIT"], 1)
        self.assertAlmostEqual(summary.roi["official_bet"].profit_units, 2.15)
        self.assertAlmostEqual(summary.roi["lottery"].profit_units, 2.4)
        self.assertEqual(summary.roi["cleared_conditional"].rows, 0)

    def test_wrong_player_invalid_fixture_fails_grader(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate = _copy_sample(Path(tmp))
            row = _invalid_fixture_row("wrong_player_hit")
            _write_rows(slate / "04_final_card" / "official_card.csv", [row])

            summary = grade_slate_module.grade_slate(slate)

            self.assertEqual(summary.grading_status, "FAIL")
            self.assertTrue(any("Player-specific HIT credited to wrong player" in error for error in summary.errors))

    def test_watchlist_stake_invalid_fixture_fails_validator_and_grader(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate = _copy_sample(Path(tmp))
            row = _invalid_fixture_row("watchlist_stake")
            _write_rows(slate / "04_final_card" / "watchlist.csv", [row])

            validation = validate_slate_module.validate_slate(slate, strict=True)
            grading = grade_slate_module.grade_slate(slate)

            self.assertEqual(validation.status, "FAIL")
            self.assertTrue(any("WATCHLIST cannot have stake_units > 0" in error for error in validation.errors))
            self.assertEqual(grading.grading_status, "FAIL")
            self.assertTrue(any("WATCHLIST with stake" in error for error in grading.errors))


def _copy_sample(tmp_root: Path) -> Path:
    destination = tmp_root / "_sample_2026-05-04"
    shutil.copytree(SAMPLE_SLATE, destination)
    return destination


def _invalid_fixture_row(fixture_case: str) -> dict[str, str]:
    with (SAMPLE_SLATE / "06_archive" / "invalid_safety_cases.csv").open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            if row["fixture_case"] == fixture_case:
                return row
    raise AssertionError(f"missing fixture case {fixture_case}")


def _write_rows(path: Path, rows: list[dict[str, str]]) -> None:
    fieldnames = list(rows[0])
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    unittest.main()
