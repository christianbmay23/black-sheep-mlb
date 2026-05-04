from __future__ import annotations

import csv
import json
import tempfile
import unittest
from pathlib import Path

from black_sheep_mlb.hr_intelligence.market import (
    american_odds_to_implied_probability,
    calculate_edge,
    fair_odds_from_probability,
    fair_probability_from_score,
)
from black_sheep_mlb.hr_intelligence.runner import run_daily_hr_pipeline
from black_sheep_mlb.hr_intelligence.schema import HitterInput
from black_sheep_mlb.hr_intelligence.scoring import assign_tier, hr_threat_score, normalize
from black_sheep_mlb.hr_intelligence.verification import assign_action, kill_flags


class EchoIQHRIntelligenceTests(unittest.TestCase):
    def test_market_math_is_conservative_and_reversible(self):
        self.assertAlmostEqual(american_odds_to_implied_probability("+900"), 0.10)
        self.assertAlmostEqual(american_odds_to_implied_probability("-150"), 0.60)
        self.assertEqual(fair_odds_from_probability(0.10), 900)
        self.assertEqual(fair_odds_from_probability(0.60), -150)
        self.assertAlmostEqual(fair_probability_from_score(50), 0.020)
        self.assertAlmostEqual(fair_probability_from_score(80), 0.080)

    def test_edge_pct_is_relative_not_absolute_delta(self):
        self.assertAlmostEqual(calculate_edge(0.115, 0.100), 0.15)
        self.assertNotAlmostEqual(calculate_edge(0.115, 0.100), 0.015)
        self.assertAlmostEqual(calculate_edge(0.080, 0.100), -0.20)

    def test_normalization_score_and_tier_assignment(self):
        self.assertEqual(normalize(None, 0, 10), 50)
        self.assertEqual(normalize(15, 0, 10), 100)
        self.assertEqual(normalize(-2, 0, 10), 0)
        row = _row(hr_odds=1200)
        score = hr_threat_score(row, edge_pct=0.20)
        self.assertGreaterEqual(score, 80)
        self.assertEqual(assign_tier(score), "Strong HR Target")

    def test_kill_flags_and_action_assignment_block_missing_or_bad_rows(self):
        no_odds = _row(hr_odds=None)
        flags = kill_flags(no_odds, edge_pct=None)
        self.assertIn("NO_HR_ODDS", flags)
        self.assertEqual(assign_action(82, None, no_odds, flags), "PASS")

        not_in_lineup = _row(lineup_status="not_in_lineup", hr_odds=1200)
        flags = kill_flags(not_in_lineup, edge_pct=0.20)
        self.assertIn("NOT_IN_LINEUP", flags)
        self.assertEqual(assign_action(90, 0.20, not_in_lineup, flags), "PASS")

        playable = _row(hr_odds=1200)
        flags = kill_flags(playable, edge_pct=0.20)
        self.assertEqual(assign_action(84, 0.20, playable, flags), "BET")

    def test_action_gates_match_documented_v1_contract(self):
        playable = _row(hr_odds=1200)
        flags = kill_flags(playable, edge_pct=0.15)
        self.assertEqual(assign_action(80, 0.15, playable, flags), "BET")
        self.assertEqual(assign_action(80, 0.14, playable, flags), "LEAN")
        self.assertEqual(assign_action(70, 0.00, playable, flags), "LEAN")
        self.assertEqual(assign_action(60, 0.00, playable, flags), "LOTTERY")
        self.assertEqual(assign_action(60, -0.02, playable, flags), "PASS")
        self.assertEqual(assign_action(59, 0.20, playable, flags), "PASS")

        watchlist = _row(lineup_status="unconfirmed", starter_status="unconfirmed", hr_odds=1200)
        flags = kill_flags(watchlist, edge_pct=0.20)
        self.assertIn("LINEUP_UNCONFIRMED", flags)
        self.assertIn("STARTER_UNCONFIRMED", flags)
        self.assertEqual(assign_action(80, 0.20, watchlist, flags), "WATCHLIST")

    def test_fixture_pipeline_writes_auditable_outputs(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path.cwd()
            out = Path(tmp) / "hr_boards"
            summary = run_daily_hr_pipeline(date="2026-04-24", fixture=True, output_dir=out, root=root)

            self.assertEqual(summary["hitters_scored"], 6)
            self.assertGreaterEqual(summary["actions"]["PASS"], 1)
            expected = [
                "2026-04-24_hr_full_board.csv",
                "2026-04-24_hr_final_card.csv",
                "2026-04-24_hr_lottery_card.csv",
                "2026-04-24_hr_watchlist.csv",
                "2026-04-24_hr_audit_log.json",
            ]
            for filename in expected:
                self.assertTrue((out / filename).exists(), filename)

            rows = _read_csv(out / "2026-04-24_hr_full_board.csv")
            self.assertEqual(rows[0]["source_status"], "fixture_only")
            self.assertTrue(rows[0]["kill_flags"] == "" or isinstance(rows[0]["kill_flags"], str))
            audit = json.loads((out / "2026-04-24_hr_audit_log.json").read_text(encoding="utf-8"))
            self.assertEqual(audit["source_status"], "fixture_only")
            self.assertIn("scoring_weights", audit)


def _row(**overrides) -> HitterInput:
    data = {
        "date": "2026-04-24",
        "game": "NYY@BOS",
        "player_name": "Fixture Power Bat",
        "team": "NYY",
        "opponent": "BOS",
        "opposing_pitcher": "Fixture Pitcher",
        "lineup_status": "confirmed",
        "lineup_spot": 2,
        "starter_status": "confirmed",
        "barrel_pct": 18.0,
        "hardhit_pct": 56.0,
        "iso": 0.320,
        "xslg": 0.650,
        "pull_air_pct": 40.0,
        "last14_barrel_pct": 20.0,
        "last14_hardhit_pct": 58.0,
        "last14_avg_ev": 94.0,
        "last14_sweetspot_pct": 42.0,
        "pitcher_hr9": 1.8,
        "pitcher_barrel_allowed_pct": 12.0,
        "pitcher_hardhit_allowed_pct": 46.0,
        "pitcher_fb_pct": 50.0,
        "platoon_xslg_allowed": 0.540,
        "pitch_matchup_score": 86.0,
        "park_weather_hr_boost": 16.0,
        "pa_expectation": 4.6,
        "hr_odds": 1200,
        "risk_score": 15.0,
    }
    data.update(overrides)
    return HitterInput(**data)


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


if __name__ == "__main__":
    unittest.main()
