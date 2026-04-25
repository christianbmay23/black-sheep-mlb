"""Tests for boxscore-driven prop result generation."""
from __future__ import annotations

import csv
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
EXPORTS_DIR = REPO_ROOT / "canvases" / "exports"
for path in (REPO_ROOT, EXPORTS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from generate_boxscore_backtest_inputs import build_prop_results  # noqa: E402


class BoxscorePropResultsTests(unittest.TestCase):
    def test_build_prop_results_writes_audit_columns_and_outcomes(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            outlook = tmp_path / "outlook.csv"
            results = tmp_path / "results.csv"
            with outlook.open("w", newline="", encoding="utf-8") as fh:
                writer = csv.DictWriter(
                    fh,
                    fieldnames=[
                        "report_date",
                        "game",
                        "team",
                        "batter",
                        "market_hr_american",
                        "market_tb_line",
                        "market_tb_over_american",
                    ],
                )
                writer.writeheader()
                writer.writerow(
                    {
                        "report_date": "2026-04-18",
                        "game": "DET@BOS",
                        "team": "DET",
                        "batter": "Test Hitter",
                        "market_hr_american": "450",
                        "market_tb_line": "1.5",
                        "market_tb_over_american": "-120",
                    }
                )
                writer.writerow(
                    {
                        "report_date": "2026-04-18",
                        "game": "DET@BOS",
                        "team": "DET",
                        "batter": "Bench Player",
                        "market_hr_american": "",
                        "market_tb_line": "0.5",
                        "market_tb_over_american": "-250",
                    }
                )

            boxscore = {
                "teams": {
                    "away": {
                        "team": {"abbreviation": "DET"},
                        "players": {
                            "ID1": {
                                "person": {"fullName": "Test Hitter"},
                                "stats": {"batting": {"hits": 2, "homeRuns": 1, "totalBases": 5, "atBats": 4, "runs": 1, "rbi": 2}},
                            }
                        },
                    },
                    "home": {"team": {"abbreviation": "BOS"}, "players": {}},
                }
            }

            rows_written, roi_eligible = build_prop_results(
                outlook,
                results,
                "2026-04-18",
                {"DET@BOS": boxscore},
                {"DET@BOS": "/tmp/DET_BOS.json"},
            )
            self.assertEqual(rows_written, 4)
            self.assertEqual(roi_eligible, 2)

            with results.open(newline="", encoding="utf-8") as fh:
                rows = list(csv.DictReader(fh))
            self.assertIn("market_odds_time", rows[0])
            self.assertIn("result_source", rows[0])
            self.assertEqual(rows[0]["prop_type"], "HR")
            self.assertEqual(rows[0]["result"], "W")
            self.assertEqual(rows[0]["result_source"], "mlb_stats_api")
            self.assertEqual(rows[1]["prop_type"], "2+ TB")
            self.assertEqual(rows[1]["result"], "W")
            self.assertEqual(rows[3]["market_odds"], "")
            self.assertIn("market line 0.5 excluded", rows[3]["notes"])
            self.assertEqual(rows[2]["result"], "P")
            self.assertEqual(rows[2]["result_source_detail"], "player_not_in_boxscore")


if __name__ == "__main__":
    unittest.main()
