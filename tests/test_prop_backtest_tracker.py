"""Unit tests for prop backtest result parsing and odds validation."""
from __future__ import annotations

import sys
import csv
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
EXPORTS_DIR = REPO_ROOT / "canvases" / "exports"
for path in (REPO_ROOT, EXPORTS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from prop_backtest_tracker import (  # noqa: E402
    ModelProp,
    build_tracker_rows,
    parse_american,
    profit_loss_units,
    validate_rows,
    write_tracker,
)


class PropBacktestTrackerTests(unittest.TestCase):
    def test_parse_american_rejects_non_american_odds(self):
        self.assertEqual(parse_american("-110"), -110)
        self.assertEqual(parse_american("+150"), 150)
        self.assertIsNone(parse_american("-2"))
        self.assertIsNone(parse_american("50"))
        self.assertIsNone(parse_american("NA"))
        self.assertIsNone(parse_american("n/a"))

    def test_invalid_market_odds_are_excluded_from_roi(self):
        model = ModelProp(
            date="2026-04-18",
            game="SF@WSH",
            player="Drew Gilbert",
            team="SF",
            prop_type="2+ TB",
            model_probability=35.25,
            fair_odds="+184",
            tier="A",
            confidence="Medium",
            recommended_selection=True,
        )
        rows, warnings, unmatched = build_tracker_rows(
            [
                {
                    "date": "2026-04-18",
                    "game": "SF@WSH",
                    "player": "Drew Gilbert",
                    "team": "SF",
                    "prop_type": "2+ TB",
                    "line": "1.5",
                    "market_odds": "-2",
                    "closing_odds": "",
                    "result": "W",
                    "notes": "2 H, 2 TB",
                }
            ],
            {("SF@WSH", "drewgilbert", "SF", "2+ TB"): model},
        )

        self.assertEqual(unmatched, [])
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].eval_mode, "invalid_market_odds")
        self.assertIsNone(rows[0].profit_loss_units)
        self.assertIn("invalid_market_odds=-2", rows[0].notes)
        self.assertTrue(any("invalid market_odds '-2'" in warning for warning in warnings))
        self.assertEqual(validate_rows(rows, unmatched), [])

    def test_profit_loss_units_does_not_pay_invalid_odds(self):
        self.assertIsNone(profit_loss_units("W", parse_american("-2")))

    def test_write_tracker_preserves_audit_columns(self):
        model = ModelProp(
            date="2026-04-18",
            game="SF@WSH",
            player="Drew Gilbert",
            team="SF",
            prop_type="2+ TB",
            model_probability=35.25,
            fair_odds="+184",
            tier="A",
            confidence="Medium",
            recommended_selection=True,
        )
        rows, _, _ = build_tracker_rows(
            [
                {
                    "date": "2026-04-18",
                    "game": "SF@WSH",
                    "player": "Drew Gilbert",
                    "team": "SF",
                    "prop_type": "2+ TB",
                    "line": "1.5",
                    "market_odds": "180",
                    "closing_odds": "160",
                    "result": "W",
                    "notes": "2 H, 2 TB",
                    "market_odds_time": "pregame",
                    "result_source": "mlb_stats_api",
                    "result_source_detail": "/tmp/box.json",
                }
            ],
            {("SF@WSH", "drewgilbert", "SF", "2+ TB"): model},
        )
        with tempfile.TemporaryDirectory() as tmp:
            tracker = Path(tmp) / "tracker.csv"
            write_tracker(rows, tracker)
            with tracker.open(newline="", encoding="utf-8") as fh:
                written = list(csv.DictReader(fh))
        self.assertEqual(written[0]["market_odds_time"], "pregame")
        self.assertEqual(written[0]["result_source"], "mlb_stats_api")
        self.assertEqual(written[0]["result_source_detail"], "/tmp/box.json")


if __name__ == "__main__":
    unittest.main()
