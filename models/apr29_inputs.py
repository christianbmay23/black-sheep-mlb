"""Auto-generated Apr 29, 2026 slate scaffold from live schedule + odds."""

from __future__ import annotations

REPORT_DATE = "2026-04-29"
CANVAS_SLUG = "apr29"


def make_sp_profile(xera: float) -> list[list[str]]:
    """Minimal Baseball Savant-style table; xERA is parsed by game_model.parse_xera."""
    return [
        ["ERA / xERA", f"4.60 / {xera:.2f}"],
        ["xwOBA allowed", ".335"],
        ["K%tile", "52"],
        ["Whiff%tile", "48"],
        ["Chase%tile", "52"],
        ["Top pitch", "Mix / multi"],
    ]


GAME_SPECS: list[dict] = [
    {
        "away": "AZ",
        "home": "MIL",
        "time_et": "7:40 PM",
        "away_a": 110,
        "home_a": -130,
        "weather": "Live weather via compute",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.15,
        "analyst_confidence": "Medium",
        "rationale": "Auto-generated live scaffold from MLB schedule + market odds: Eduardo Rodriguez vs Brandon Sproat. Run compute to refresh lineups, weather, and model outputs before staking.",
        "extra_flags": ["auto_scaffold_live_odds"],
    },
    {
        "away": "KC",
        "home": "ATH",
        "time_et": "9:40 PM",
        "away_a": 100,
        "home_a": -120,
        "weather": "Live weather via compute",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.15,
        "analyst_confidence": "Medium",
        "rationale": "Auto-generated live scaffold from MLB schedule + market odds: Michael Wacha vs Luis Severino. Run compute to refresh lineups, weather, and model outputs before staking.",
        "extra_flags": ["auto_scaffold_live_odds"],
    },
]
