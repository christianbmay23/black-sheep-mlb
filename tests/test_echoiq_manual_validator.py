from __future__ import annotations

import csv
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = REPO_ROOT / "scripts" / "validate_echoiq_manual_inputs.py"
EXAMPLE_DIR = REPO_ROOT / "data" / "manual" / "example"


class EchoIQManualValidatorTests(unittest.TestCase):
    def test_valid_example_csv_files_pass(self):
        result = _run_validator(
            "--date",
            "2026-04-24",
            "--manual-odds",
            "data/manual/example/odds.csv",
            "--manual-props",
            "data/manual/example/props.csv",
            "--manual-weather",
            "data/manual/example/weather.csv",
            "--manual-ballpark",
            "data/manual/example/ballpark_pal.csv",
            "--manual-lineups",
            "data/manual/example/lineups.csv",
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("- VALID", result.stdout)

    def test_missing_required_column_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "props.csv"
            _write_csv(path, ["date", "game_id", "team", "prop_type"], [{"date": "2026-04-24", "game_id": "1", "team": "NYY", "prop_type": "total_bases"}])

            result = _run_validator("--manual-props", str(path))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing required column player", result.stdout)

    def test_missing_source_url_warns_but_does_not_fail(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "props.csv"
            row = _valid_prop_row()
            row["source_url"] = ""
            _write_csv(path, list(row), [row])

            result = _run_validator("--manual-props", str(path))

        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn("missing source_url", result.stdout)
        self.assertIn("- VALID", result.stdout)

    def test_invalid_prop_type_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "props.csv"
            row = _valid_prop_row()
            row["prop_type"] = "moon_shots"
            _write_csv(path, list(row), [row])

            result = _run_validator("--manual-props", str(path))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("invalid prop_type moon_shots", result.stdout)

    def test_invalid_market_type_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "odds.csv"
            row = _valid_odds_row()
            row["market_type"] = "series_price"
            _write_csv(path, list(row), [row])

            result = _run_validator("--manual-odds", str(path))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("invalid market_type series_price", result.stdout)

    def test_invalid_lineup_status_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "lineups.csv"
            row = _valid_lineup_row()
            row["lineup_status"] = "maybe"
            _write_csv(path, list(row), [row])

            result = _run_validator("--manual-lineups", str(path))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("invalid lineup_status maybe", result.stdout)

    def test_raw_probability_percent_warns(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "props.csv"
            row = _valid_prop_row()
            row["raw_probability"] = "57"
            _write_csv(path, list(row), [row])

            result = _run_validator("--manual-props", str(path))

        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn("appears to be percent 57", result.stdout)

    def test_raw_probability_outside_range_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "props.csv"
            row = _valid_prop_row()
            row["raw_probability"] = "150"
            _write_csv(path, list(row), [row])

            result = _run_validator("--manual-props", str(path))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("outside 0-1 or 0-100 range", result.stdout)

    def test_json_manual_inputs_validate(self):
        result = _run_validator("--date", "2026-04-24", "--manual-inputs", "data/manual/example/echoiq_inputs.json")

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("echoiq_inputs.json:props", result.stdout)

    def test_strict_fails_on_warnings(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "props.csv"
            row = _valid_prop_row()
            row["source_url"] = ""
            _write_csv(path, list(row), [row])

            result = _run_validator("--strict", "--manual-props", str(path))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("strict mode treats warnings as failures", result.stdout)

    def test_no_input_files_exits_nonzero(self):
        result = _run_validator()

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("pass at least one manual input file", result.stderr)


def _run_validator(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(VALIDATOR), *args],
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
        check=False,
    )


def _write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _valid_prop_row() -> dict[str, str]:
    return {
        "date": "2026-04-24",
        "game_id": "123",
        "player": "Aaron Judge",
        "team": "NYY",
        "prop_type": "total_bases",
        "raw_probability": "0.57",
        "source": "manual",
        "source_url": "https://example.test",
        "timestamp": "2026-04-24T10:00:00Z",
        "confidence": "High",
    }


def _valid_odds_row() -> dict[str, str]:
    return {
        "date": "2026-04-24",
        "game_id": "123",
        "market_type": "moneyline",
        "current_price": "+120",
        "source": "manual",
        "source_url": "https://example.test",
        "timestamp": "2026-04-24T10:00:00Z",
        "confidence": "High",
    }


def _valid_lineup_row() -> dict[str, str]:
    return {
        "date": "2026-04-24",
        "game_id": "123",
        "team": "NYY",
        "player": "Aaron Judge",
        "batting_order": "2",
        "lineup_status": "confirmed",
        "source": "manual",
        "source_url": "https://example.test",
        "timestamp": "2026-04-24T10:00:00Z",
        "confidence": "High",
    }


if __name__ == "__main__":
    unittest.main()
