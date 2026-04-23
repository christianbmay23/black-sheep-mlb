"""Unit tests for models.game_model win probability (no network)."""
from __future__ import annotations

import unittest

from models import game_model


def _sp(xera: float) -> game_model.Profile:
    # Value must not use "a / b" — parse_xera takes the number after "/" when present.
    return [["xERA", f"{xera:.2f}"]]


def _lineup(rows: int = 5) -> list[list[str]]:
    # Minimal rows: [..., xwOBA col, ..., barrel col]
    out: list[list[str]] = []
    for _ in range(rows):
        out.append(["", "", "", "0.32", "", "", "8"])
    return out


class WinProbabilityModelTests(unittest.TestCase):
    def test_strong_sp_mismatch_increases_win_pct_for_better_sp(self):
        """Away SP much stronger (lower xERA) => away win prob meaningfully above 0.5."""
        lu = _lineup()
        xa, xh = 3.05, 5.85
        p_away, p_home, conf, miss = game_model.win_probability_model(
            lu,
            lu,
            _sp(xa),
            _sp(xh),
            "outdoor",
            "Medium",
            away_bullpen_score=0.5,
            home_bullpen_score=0.5,
            away_recent_form_score=0.5,
            home_recent_form_score=0.5,
            weather_factor=1.0,
        )
        self.assertGreater(p_away, 0.54)
        self.assertLess(p_home, 0.46)
        self.assertAlmostEqual(p_away + p_home, 1.0, places=6)

    def test_equal_inputs_stay_near_fifty_fifty(self):
        lu = _lineup()
        x = 4.25
        p_away, p_home, _, miss = game_model.win_probability_model(
            lu,
            lu,
            _sp(x),
            _sp(x),
            "outdoor",
            "Medium",
            away_bullpen_score=0.5,
            home_bullpen_score=0.5,
            away_recent_form_score=0.5,
            home_recent_form_score=0.5,
            weather_factor=1.0,
        )
        self.assertLess(abs(p_home - 0.5), 0.06)
        self.assertLess(abs(p_away - 0.5), 0.06)

    def test_no_extreme_outputs_within_hard_cap(self):
        lu = _lineup()
        # Extreme mismatch + lopsided lineups / bullpens / form (still capped).
        p_away, p_home, _, _ = game_model.win_probability_model(
            _lineup(8),
            _lineup(2),
            _sp(2.60),
            _sp(6.40),
            "outdoor",
            "High",
            away_bullpen_score=0.92,
            home_bullpen_score=0.08,
            away_recent_form_score=0.95,
            home_recent_form_score=0.05,
            weather_factor=1.12,
        )
        self.assertGreaterEqual(p_home, 0.25)
        self.assertLessEqual(p_home, 0.75)
        self.assertGreaterEqual(p_away, 0.25)
        self.assertLessEqual(p_away, 0.75)

    def test_xera_nonlinear_margin_respects_sign(self):
        """Larger |ΔxERA| should move margin more than linear scaling of same small Δ."""
        m_small = game_model.xera_nonlinear_margin(4.2, 4.5)
        m_large = game_model.xera_nonlinear_margin(3.0, 6.0)
        self.assertLess(m_large, m_small)
        self.assertLess(m_large, 0.0)

    def test_recalibrate_pulls_mild_edges_toward_half(self):
        p_in = 0.535
        p_out = game_model.recalibrate_win_probability(p_in)
        self.assertLess(abs(p_out - 0.5), abs(p_in - 0.5))

    def test_recent_form_weight_is_light(self):
        """Same SP/lineup/park; form tilt alone should move prob only modestly."""
        lu = _lineup()
        x = 4.30
        p_neutral_a, p_neutral_h, _, _ = game_model.win_probability_model(
            lu,
            lu,
            _sp(x),
            _sp(x),
            "outdoor",
            "Medium",
            away_bullpen_score=0.5,
            home_bullpen_score=0.5,
            away_recent_form_score=0.5,
            home_recent_form_score=0.5,
            weather_factor=1.0,
        )
        p_form_a, p_form_h, _, _ = game_model.win_probability_model(
            lu,
            lu,
            _sp(x),
            _sp(x),
            "outdoor",
            "Medium",
            away_bullpen_score=0.5,
            home_bullpen_score=0.5,
            away_recent_form_score=0.62,
            home_recent_form_score=0.38,
            weather_factor=1.0,
        )
        shift = abs(p_form_h - p_neutral_h)
        self.assertLess(shift, 0.09)


if __name__ == "__main__":
    unittest.main()
