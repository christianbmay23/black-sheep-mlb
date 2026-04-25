"""Tests for strict snapshot proof-gate validation."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
EXPORTS_DIR = REPO_ROOT / "canvases" / "exports"
for path in (REPO_ROOT, EXPORTS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from validate_strict_snapshot import REQUIRED_GAME_FIELDS, validate_snapshot_payload  # noqa: E402


class StrictSnapshotValidatorTests(unittest.TestCase):
    def test_valid_strict_snapshot_passes(self):
        payload = {
            "allow_partial": False,
            "evaluation_eligible": True,
            "evaluation": {"status": "eligible", "scored_games": 1},
            "summary": {"scored_games": 1},
            "games": [{"away": "DET", "home": "BOS", "game_status_bucket": "pregame", "scoring_status": "scored"}],
        }
        self.assertEqual(validate_snapshot_payload(payload, set(REQUIRED_GAME_FIELDS)), [])

    def test_partial_or_non_pregame_scored_snapshot_fails(self):
        payload = {
            "allow_partial": True,
            "evaluation_eligible": False,
            "evaluation": {"status": "not_evaluable", "scored_games": 1},
            "summary": {"scored_games": 1},
            "games": [{"away": "DET", "home": "BOS", "game_status_bucket": "final", "scoring_status": "scored"}],
        }
        errors = validate_snapshot_payload(payload, {"raw_model_away_win_pct"})
        self.assertIn("allow_partial must be false", errors)
        self.assertTrue(any("scored non-pregame game" in error for error in errors))
        self.assertTrue(any("games CSV missing required fields" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
