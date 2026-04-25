"""Tests for game backtest metrics and provenance labeling."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

REPO_ROOT = Path(__file__).resolve().parents[1]
EXPORTS_DIR = REPO_ROOT / "canvases" / "exports"
for path in (REPO_ROOT, EXPORTS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from backtest_tracker import BacktestRow, brier_score, build_backtest_rows, log_loss, snapshot_provenance_mode  # noqa: E402


class GameBacktestMetricTests(unittest.TestCase):
    def test_build_backtest_rows_marks_provenance(self):
        rows = build_backtest_rows(
            [
                {
                    "away": "DET",
                    "home": "BOS",
                    "prediction": "DET",
                    "implied_away_pct_nv": "55",
                    "implied_home_pct_nv": "45",
                    "final_away_win_pct": "60",
                    "final_home_win_pct": "40",
                    "model_confidence": "High",
                    "decision_tier_vs_market": "A",
                    "edge_on_pick_pct": "5.0",
                    "missing_data_flags": "",
                    "rationale_summary": "",
                }
            ],
            {"DET@BOS": "DET"},
            allow_legacy_game_probs=False,
            provenance_mode="strict_current",
        )
        self.assertEqual(rows[0].provenance_mode, "strict_current")
        self.assertTrue(rows[0].baseline_was_correct)

    def test_brier_and_log_loss_are_finite_with_extreme_probs(self):
        rows = [
            BacktestRow(
                matchup="DET@BOS",
                predicted_winner="DET",
                market_favorite="DET",
                actual_winner="BOS",
                was_correct=False,
                baseline_was_correct=False,
                predicted_win_prob=0.999999,
                model_confidence="High",
                decision_tier="A",
                edge_on_pick_pct=5.0,
                missing_data_flags="",
                rationale_summary="",
                provenance_mode="strict_current",
            )
        ]
        self.assertGreater(brier_score(rows) or 0, 0.99)
        self.assertLess(log_loss(rows) or 999, 7.0)

    def test_snapshot_provenance_rejects_partial_current_schema(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            snap_dir = root / "snapshots" / "apr24"
            snap_dir.mkdir(parents=True)
            (snap_dir / "apr24-latest.json").write_text(
                json.dumps({"allow_partial": True, "evaluation_eligible": False}),
                encoding="utf-8",
            )
            with mock.patch("backtest_tracker.OUT_DIR", root):
                self.assertEqual(snapshot_provenance_mode("apr24"), "partial_not_evaluable")


if __name__ == "__main__":
    unittest.main()
