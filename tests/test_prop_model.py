from __future__ import annotations

import unittest

from models.prop_model import batter_hr_two_tb, intrinsic_tier_2tb


class PropModelBvpThresholdTests(unittest.TestCase):
    def test_small_bvp_sample_does_not_move_probs(self):
        lineup = [["1", "Test Batter", "OF", ".285", ".510", ".360", "14"]]
        opp_profile = [["ERA / xERA", "4.60 / 4.20"]]
        base = batter_hr_two_tb(
            "NYY",
            "BOS",
            True,
            "Test Batter",
            lineup,
            opp_profile,
            batter_hand="L",
            pitcher_hand="R",
            xslg_override=0.51,
            barrel_rate=0.14,
            actual_slg=0.48,
            hard_hit_rate=0.44,
            avg_hit_speed=91.0,
            est_ba=0.275,
            plate_appearances=80,
            home_runs=5,
            opp_xera_override=4.2,
            recent_slg=0.49,
            recent_ops=0.84,
            recent_hr_rate=0.06,
            recent_tb_rate=0.23,
        )
        small_bvp = batter_hr_two_tb(
            "NYY",
            "BOS",
            True,
            "Test Batter",
            lineup,
            opp_profile,
            batter_hand="L",
            pitcher_hand="R",
            xslg_override=0.51,
            barrel_rate=0.14,
            actual_slg=0.48,
            hard_hit_rate=0.44,
            avg_hit_speed=91.0,
            est_ba=0.275,
            plate_appearances=80,
            home_runs=5,
            opp_xera_override=4.2,
            recent_slg=0.49,
            recent_ops=0.84,
            recent_hr_rate=0.06,
            recent_tb_rate=0.23,
            vs_pitcher_pa=8,
            vs_pitcher_ab=7,
            vs_pitcher_hits=5,
            vs_pitcher_hr=2,
            vs_pitcher_total_bases=11,
        )
        self.assertEqual(base[:2], small_bvp[:2])
        self.assertEqual(base[4:], small_bvp[4:])

    def test_bvp_can_be_disabled_for_asof_safety(self):
        lineup = [["1", "Test Batter", "OF", ".285", ".510", ".360", "14"]]
        opp_profile = [["ERA / xERA", "4.60 / 4.20"]]
        kwargs = {
            "batter_hand": "L",
            "pitcher_hand": "R",
            "xslg_override": 0.51,
            "barrel_rate": 0.14,
            "actual_slg": 0.48,
            "hard_hit_rate": 0.44,
            "avg_hit_speed": 91.0,
            "est_ba": 0.275,
            "plate_appearances": 80,
            "home_runs": 5,
            "opp_xera_override": 4.2,
            "recent_slg": 0.49,
            "recent_ops": 0.84,
            "recent_hr_rate": 0.06,
            "recent_tb_rate": 0.23,
            "weather_factor": 1.02,
            "vs_pitcher_pa": 40,
            "vs_pitcher_ab": 35,
            "vs_pitcher_hits": 15,
            "vs_pitcher_hr": 5,
            "vs_pitcher_total_bases": 32,
        }
        disabled = batter_hr_two_tb("NYY", "BOS", True, "Test Batter", lineup, opp_profile, **kwargs, include_bvp=False)
        enabled = batter_hr_two_tb("NYY", "BOS", True, "Test Batter", lineup, opp_profile, **kwargs, include_bvp=True)
        self.assertNotEqual(disabled[:2], enabled[:2])
        self.assertEqual(disabled[6], "High")

    def test_rich_feature_path_allows_high_confidence_with_twelve_features(self):
        lineup = [["1", "Test Batter", "OF", ".285", ".510", ".360", "14"]]
        opp_profile = [["ERA / xERA", "4.60 / 4.20"]]
        result = batter_hr_two_tb(
            "NYY",
            "BOS",
            True,
            "Test Batter",
            lineup,
            opp_profile,
            xslg_override=0.51,
            barrel_rate=0.14,
            actual_slg=0.48,
            hard_hit_rate=0.44,
            avg_hit_speed=91.0,
            est_ba=0.275,
            plate_appearances=80,
            home_runs=5,
            opp_xera_override=4.2,
            recent_slg=0.49,
            recent_ops=0.84,
            recent_hr_rate=0.06,
            recent_tb_rate=0.23,
            weather_factor=1.02,
        )
        self.assertEqual(result[6], "High")

    def test_intrinsic_tier_2tb_thresholds_are_more_selective(self):
        self.assertEqual(intrinsic_tier_2tb(0.43), "A+")
        self.assertEqual(intrinsic_tier_2tb(0.39), "A")
        self.assertEqual(intrinsic_tier_2tb(0.31), "B")
        self.assertEqual(intrinsic_tier_2tb(0.24), "C")
        self.assertEqual(intrinsic_tier_2tb(0.19), "D")


if __name__ == "__main__":
    unittest.main()
