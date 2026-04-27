"""Auto-generated Apr 26, 2026 slate scaffold from live schedule + odds."""

from __future__ import annotations

REPORT_DATE = "2026-04-26"
CANVAS_SLUG = "apr26"


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
        "away": "COL",
        "home": "NYM",
        "time_et": "1:45 PM",
        "away_a": -151,
        "home_a": 119,
        "weather": "Live weather via compute",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.15,
        "analyst_confidence": "Low",
        "rationale": "Auto-generated live scaffold from MLB schedule + market odds: TBD vs Kodai Senga. Run compute to refresh lineups, weather, and model outputs before staking.",
        "extra_flags": ["auto_scaffold_live_odds", "probable_pitcher_missing"],
    },
    {
        "away": "SD",
        "home": "AZ",
        "time_et": "4:05 PM",
        "away_a": -134,
        "home_a": 113,
        "weather": "Live weather via compute",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.15,
        "analyst_confidence": "Medium",
        "rationale": "Auto-generated live scaffold from MLB schedule + market odds: Michael King vs Ryne Nelson. Run compute to refresh lineups, weather, and model outputs before staking.",
        "extra_flags": ["auto_scaffold_live_odds"],
    },
    {
        "away": "MIA",
        "home": "SF",
        "time_et": "4:05 PM",
        "away_a": 107,
        "home_a": -123,
        "weather": "Live weather via compute",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.15,
        "analyst_confidence": "Medium",
        "rationale": "Auto-generated live scaffold from MLB schedule + market odds: Max Meyer vs Landen Roupp. Run compute to refresh lineups, weather, and model outputs before staking.",
        "extra_flags": ["auto_scaffold_live_odds"],
    },
    {
        "away": "LAA",
        "home": "KC",
        "time_et": "4:10 PM",
        "away_a": -101,
        "home_a": -114,
        "weather": "Live weather via compute",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.15,
        "analyst_confidence": "Medium",
        "rationale": "Auto-generated live scaffold from MLB schedule + market odds: Reid Detmers vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",
        "extra_flags": ["auto_scaffold_live_odds"],
    },
    {
        "away": "CHC",
        "home": "LAD",
        "time_et": "4:10 PM",
        "away_a": 104,
        "home_a": -121,
        "weather": "Live weather via compute",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.15,
        "analyst_confidence": "Medium",
        "rationale": "Auto-generated live scaffold from MLB schedule + market odds: Shota Imanaga vs Justin Wrobleski. Run compute to refresh lineups, weather, and model outputs before staking.",
        "extra_flags": ["auto_scaffold_live_odds"],
    },
]
