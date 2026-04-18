"""Apr 18, 2026 slate: market inputs and game metadata (model outputs come from compute + shared models)."""

from __future__ import annotations

REPORT_DATE = "2026-04-18"
CANVAS_SLUG = "apr18"


def make_sp_profile(xera: float) -> list[list[str]]:
    """Minimal Baseball Savant–style table; xERA is parsed by game_model.parse_xera."""
    return [
        ["ERA / xERA", f"4.60 / {xera:.2f}"],
        ["xwOBA allowed", ".335"],
        ["K%tile", "52"],
        ["Whiff%tile", "48"],
        ["Chase%tile", "52"],
        ["Top pitch", "Mix / multi"],
    ]


# Schedule from MLB Stats API for 2026-04-18 (ET times). Moneylines are approximate modeling inputs — refine by hand.
GAME_SPECS: list[dict] = [
    {
        "away": "KC",
        "home": "NYY",
        "time_et": "1:35 PM",
        "away_a": 142,
        "home_a": -158,
        "weather": "72F / clear",
        "run_env": "Medium",
        "away_xera": 4.45,
        "home_xera": 3.85,
        "analyst_confidence": "Medium",
        "rationale": (
            "Yankee Stadium short porch vs contact-oriented Royals road lineup — price the chalk carefully; "
            "props and team totals often clearer than ML."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "CIN",
        "home": "MIN",
        "time_et": "2:10 PM",
        "away_a": 108,
        "home_a": -124,
        "weather": "58F / roof likely",
        "run_env": "Medium",
        "away_xera": 4.55,
        "home_xera": 4.15,
        "analyst_confidence": "Medium",
        "rationale": (
            "Target Field leans pitcher-friendly early season; lean on probables and bullpen paths before "
            "trusting a big ML edge."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "NYM",
        "home": "CHC",
        "time_et": "2:20 PM",
        "away_a": -102,
        "home_a": -108,
        "weather": "52F / wind in",
        "run_env": "Low-Medium",
        "away_xera": 4.25,
        "home_xera": 4.35,
        "analyst_confidence": "Low",
        "rationale": (
            "Wrigley wind and cold can suppress HRs — tight market; verify probables and late lineup news."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "TB",
        "home": "PIT",
        "time_et": "3:30 PM",
        "away_a": -138,
        "home_a": 118,
        "weather": "62F / clear",
        "run_env": "Medium",
        "away_xera": 3.95,
        "home_xera": 4.65,
        "analyst_confidence": "Medium",
        "rationale": (
            "Rays talent vs Pirates home spot — check opener/bulk roles; modest ML edge only if price is wrong."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "SF",
        "home": "WSH",
        "time_et": "4:05 PM",
        "away_a": -112,
        "home_a": 102,
        "weather": "68F / clear",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.75,
        "analyst_confidence": "Medium",
        "rationale": (
            "Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "CWS",
        "home": "ATH",
        "time_et": "4:05 PM",
        "away_a": 108,
        "home_a": -124,
        "weather": "66F / marine air",
        "run_env": "Low-Medium",
        "away_xera": 4.85,
        "home_xera": 4.35,
        "analyst_confidence": "Low",
        "rationale": (
            "Oakland environment and travel spot — volatility; prefer game props unless you have a clear "
            "pitching mismatch."
        ),
        "extra_flags": ["approx_market_ml", "oak_coliseum_env"],
    },
    {
        "away": "DET",
        "home": "BOS",
        "time_et": "4:10 PM",
        "away_a": 118,
        "home_a": -132,
        "weather": "58F / clear",
        "run_env": "Medium",
        "away_xera": 4.35,
        "home_xera": 4.05,
        "analyst_confidence": "Medium",
        "rationale": (
            "Fenway doubles and wall-ball noise — model park correctly before trusting a big ML number."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "MIL",
        "home": "MIA",
        "time_et": "4:10 PM",
        "away_a": -118,
        "home_a": 108,
        "weather": "retractable roof / humid",
        "run_env": "Low-Medium",
        "away_xera": 4.05,
        "home_xera": 4.55,
        "analyst_confidence": "Medium",
        "rationale": (
            "Miami run suppression helps pitching — lean Brewers only if the price matches your starter read."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "BAL",
        "home": "CLE",
        "time_et": "6:10 PM",
        "away_a": -108,
        "home_a": -102,
        "weather": "52F / clear",
        "run_env": "Medium",
        "away_xera": 4.15,
        "home_xera": 4.25,
        "analyst_confidence": "Low",
        "rationale": (
            "Progressive Field — coin-flip pricing common; prioritize handedness and bullpen availability."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "STL",
        "home": "HOU",
        "time_et": "7:10 PM",
        "away_a": 155,
        "home_a": -175,
        "weather": "retractable roof / warm",
        "run_env": "Medium",
        "away_xera": 4.45,
        "home_xera": 3.65,
        "analyst_confidence": "Medium-High",
        "rationale": (
            "Astros home talent vs Cardinals road — market often prices Houston heavy; PASS unless you see "
            "a real innings edge."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "TEX",
        "home": "SEA",
        "time_et": "7:15 PM",
        "away_a": 108,
        "home_a": -124,
        "weather": "54F / roof closed likely",
        "run_env": "Low-Medium",
        "away_xera": 4.25,
        "home_xera": 3.85,
        "analyst_confidence": "Medium",
        "rationale": (
            "T-Mobile Park suppresses offense — pitching duel pricing; props and totals often cleaner."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "ATL",
        "home": "PHI",
        "time_et": "7:15 PM",
        "away_a": 105,
        "home_a": -115,
        "weather": "62F / clear",
        "run_env": "Medium-High",
        "away_xera": 3.75,
        "home_xera": 4.05,
        "analyst_confidence": "Medium",
        "rationale": (
            "NL East heavyweight pricing — small edges only; watch weather and late scratches."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "LAD",
        "home": "COL",
        "time_et": "8:10 PM",
        "away_a": -185,
        "home_a": 165,
        "weather": "52F / thin air",
        "run_env": "High",
        "away_xera": 3.45,
        "home_xera": 5.25,
        "analyst_confidence": "Medium",
        "rationale": (
            "Coors elevates variance — Dodgers talent priced in; Rockies bats can still pop in chunks."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "TOR",
        "home": "AZ",
        "time_et": "8:10 PM",
        "away_a": -112,
        "home_a": 102,
        "weather": "retractable roof",
        "run_env": "Medium",
        "away_xera": 4.05,
        "home_xera": 4.35,
        "analyst_confidence": "Medium",
        "rationale": (
            "Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "SD",
        "home": "LAA",
        "time_et": "9:38 PM",
        "away_a": -128,
        "home_a": 118,
        "weather": "68F / clear",
        "run_env": "Medium",
        "away_xera": 3.95,
        "home_xera": 4.65,
        "analyst_confidence": "Medium",
        "rationale": (
            "Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster."
        ),
        "extra_flags": ["approx_market_ml"],
    },
]
