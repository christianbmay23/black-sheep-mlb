from __future__ import annotations

import csv
import importlib.util
import shutil
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CREATE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "create_slate.py"
VALIDATE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "validate_slate.py"


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


create_slate_module = _load_module("create_slate_for_validate_tests", CREATE_SCRIPT)
validate_slate_module = _load_module("validate_slate_for_tests", VALIDATE_SCRIPT)


class EchoIQV3ValidateSlateTests(unittest.TestCase):
    def test_valid_slate_created_by_create_slate_passes(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            result = validate_slate_module.validate_slate(slate_dir)

            self.assertEqual(result.status, "PASS")
            self.assertEqual(result.errors, [])
            self.assertEqual(result.warnings, [])

    def test_missing_required_folder_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            shutil.rmtree(slate_dir / "03_verification")

            result = validate_slate_module.validate_slate(slate_dir)

            self.assertEqual(result.status, "FAIL")
            self.assertTrue(any("Missing required folder" in error for error in result.errors))

    def test_missing_required_file_warns_normal_and_fails_strict(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            (slate_dir / "04_final_card" / "official_card.csv").unlink()

            normal = validate_slate_module.validate_slate(slate_dir)
            strict = validate_slate_module.validate_slate(slate_dir, strict=True)

            self.assertEqual(normal.status, "WARN")
            self.assertTrue(any("official_card.csv" in warning for warning in normal.warnings))
            self.assertEqual(normal.errors, [])
            self.assertEqual(strict.status, "FAIL")
            self.assertTrue(any("official_card.csv" in error for error in strict.errors))

    def test_csv_with_invalid_label_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            _write_prediction_rows(slate_dir / "04_final_card" / "watchlist.csv", [_base_row(label="MAYBE")])

            result = validate_slate_module.validate_slate(slate_dir)

            self.assertEqual(result.status, "FAIL")
            self.assertTrue(any("invalid label MAYBE" in error for error in result.errors))

    def test_watchlist_with_positive_stake_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="WATCHLIST", prediction_bucket="watchlist")
            row["stake_units"] = "0.25"
            _write_prediction_rows(slate_dir / "04_final_card" / "watchlist.csv", [row])

            result = validate_slate_module.validate_slate(slate_dir)

            self.assertEqual(result.status, "FAIL")
            self.assertTrue(any("WATCHLIST cannot have stake_units > 0" in error for error in result.errors))

    def test_bet_missing_fair_probability_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="BET", prediction_bucket="official_card")
            row["fair_probability"] = ""
            _write_prediction_rows(slate_dir / "04_final_card" / "official_card.csv", [row])

            result = validate_slate_module.validate_slate(slate_dir)

            self.assertEqual(result.status, "FAIL")
            self.assertTrue(any("BET missing fair_probability" in error for error in result.errors))

    def test_existing_blank_template_slate_passes(self):
        result = validate_slate_module.validate_slate(REPO_ROOT / "slates" / "2026-05-05")

        self.assertEqual(result.status, "PASS")
        self.assertEqual(result.errors, [])


def _create_test_slate(tmp_root: Path) -> Path:
    source_template = REPO_ROOT / "slates" / "_template"
    source_templates = REPO_ROOT / "echoiq_v3" / "templates"
    (tmp_root / "slates").mkdir()
    shutil.copytree(source_template, tmp_root / "slates" / "_template")
    shutil.copytree(source_templates, tmp_root / "echoiq_v3" / "templates")
    create_slate_module.create_slate("2026-05-05", repo_root=tmp_root)
    return tmp_root / "slates" / "2026-05-05"


def _write_prediction_rows(path: Path, rows: list[dict[str, str]]) -> None:
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
        "profit_units",
        "grading_notes",
        "source_urls",
        "timestamp",
    ]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _base_row(label: str, prediction_bucket: str = "official_card") -> dict[str, str]:
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
        "opponent": "BOS",
        "pitcher": "Sample Pitcher",
        "line": "0.5",
        "odds": "+300",
        "odds_estimated": "false",
        "implied_probability": "0.25",
        "fair_probability": "0.30",
        "edge": "0.05",
        "stake_units": "0.25",
        "confidence_tier": "B",
        "source_confidence": "A",
        "gates_passed": "true",
        "gate_status": "PASSED",
        "gate_conditions": "",
        "kill_switch": "Void if not starting",
        "rationale_short": "Test row",
        "rationale_full": "Test row",
        "status": "PREGAME",
        "result": "",
        "profit_units": "",
        "grading_notes": "",
        "source_urls": "https://example.test",
        "timestamp": "2026-05-05T10:00:00Z",
    }


if __name__ == "__main__":
    unittest.main()
