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
SUMMARIZE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "summarize_slate.py"


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


create_slate_module = _load_module("create_slate_for_summarize_tests", CREATE_SCRIPT)
summarize_slate_module = _load_module("summarize_slate_for_tests", SUMMARIZE_SCRIPT)


class EchoIQV3SummarizeSlateTests(unittest.TestCase):
    def test_blank_created_slate_is_empty_not_failure(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            summary = summarize_slate_module.summarize_slate(slate_dir)

            self.assertEqual(summary.readiness_status, "EMPTY")
            self.assertEqual(summary.errors, [])
            self.assertIn("No official BETs yet", summary.next_actions)

    def test_valid_bet_row_is_ready_and_counted(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            _write_prediction_rows(slate_dir / "04_final_card" / "official_card.csv", [_base_row(label="BET")])

            summary = summarize_slate_module.summarize_slate(slate_dir)

            self.assertEqual(summary.readiness_status, "READY")
            self.assertEqual(summary.label_counts["BET"], 1)
            self.assertEqual(summary.market_counts["HR"], 1)
            self.assertEqual(summary.source_confidence_counts["A"], 1)

    def test_bet_missing_fair_probability_is_not_ready(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="BET")
            row["fair_probability"] = ""
            _write_prediction_rows(slate_dir / "04_final_card" / "official_card.csv", [row])

            summary = summarize_slate_module.summarize_slate(slate_dir)

            self.assertEqual(summary.readiness_status, "NOT READY")
            self.assertTrue(any("BET missing fair_probability" in error for error in summary.errors))

    def test_watchlist_positive_stake_is_not_ready(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="WATCHLIST", prediction_bucket="watchlist")
            row["stake_units"] = "0.25"
            _write_prediction_rows(slate_dir / "04_final_card" / "watchlist.csv", [row])

            summary = summarize_slate_module.summarize_slate(slate_dir)

            self.assertEqual(summary.readiness_status, "NOT READY")
            self.assertTrue(any("WATCHLIST cannot have stake_units > 0" in error for error in summary.errors))

    def test_external_in_official_card_is_not_ready(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            row = _base_row(label="EXTERNAL", prediction_bucket="external_public")
            row["stake_units"] = ""
            _write_prediction_rows(slate_dir / "04_final_card" / "official_card.csv", [row])

            summary = summarize_slate_module.summarize_slate(slate_dir)

            self.assertEqual(summary.readiness_status, "NOT READY")
            self.assertTrue(any("EXTERNAL appears in official_card" in error for error in summary.errors))

    def test_json_cli_returns_parseable_json(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            result = subprocess.run(
                [sys.executable, str(SUMMARIZE_SCRIPT), str(slate_dir), "--json"],
                cwd=REPO_ROOT,
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            payload = json.loads(result.stdout)
            self.assertEqual(payload["readiness_status"], "EMPTY")

    def test_write_report_creates_markdown_report(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            summary = summarize_slate_module.summarize_slate(slate_dir, write_report=True)

            report = slate_dir / "03_verification" / "slate_readiness_report.md"
            self.assertEqual(summary.report_path, report)
            self.assertTrue(report.exists())
            self.assertIn("EchoIQ v3 Slate Readiness Report", report.read_text(encoding="utf-8"))


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
