"""Apr 19, 2026 slate: market inputs and game metadata (model outputs come from compute + shared models)."""

from __future__ import annotations

REPORT_DATE = "2026-04-19"
CANVAS_SLUG = "apr19"


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
        "away": "SF",
        "home": "WSH",
        "time_et": "1:35 PM",
        "away_a": -135,
        "home_a": 112,
        "weather": "66F / mild breeze",
        "run_env": "Medium",
        "away_xera": 3.45,
        "home_xera": 5.35,
        "analyst_confidence": "Medium",
        "rationale": (
            "Robbie Ray gives the Giants the cleaner starting edge, but Nationals Park can flatten a modest road-favorite number "
            "if the Washington lineup posts a full contact-heavy order."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "TB",
        "home": "PIT",
        "time_et": "1:35 PM",
        "away_a": 100,
        "home_a": -133,
        "weather": "61F / light wind",
        "run_env": "Low-Medium",
        "away_xera": 3.10,
        "home_xera": 4.05,
        "analyst_confidence": "Medium",
        "rationale": (
            "McClanahan vs Keller sets up as a run-suppressed duel at PNC; pricing is driven more by home field and bullpen path "
            "than by a huge early-offense expectation."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "KC",
        "home": "NYY",
        "time_et": "1:35 PM",
        "away_a": 131,
        "home_a": -150,
        "weather": "65F / clear",
        "run_env": "Medium-High",
        "away_xera": 3.25,
        "home_xera": 4.45,
        "analyst_confidence": "Medium",
        "rationale": (
            "Ragans keeps Kansas City live, but Yankee Stadium still punishes mistakes and the market leans to New York's lineup ceiling "
            "over the full nine."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "BAL",
        "home": "CLE",
        "time_et": "1:40 PM",
        "away_a": 104,
        "home_a": -115,
        "weather": "57F / cool",
        "run_env": "Medium",
        "away_xera": 4.40,
        "home_xera": 4.65,
        "analyst_confidence": "Low",
        "rationale": (
            "Guardians get a light home lean in a contact-oriented matchup; this profiles more like a bullpen and sequencing game than a "
            "dominant starter mismatch."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "MIL",
        "home": "MIA",
        "time_et": "1:40 PM",
        "away_a": 104,
        "home_a": -140,
        "weather": "retractable roof / humid",
        "run_env": "Low-Medium",
        "away_xera": 3.70,
        "home_xera": 3.40,
        "analyst_confidence": "Medium",
        "rationale": (
            "Misiorowski and Eury Perez bring big raw stuff, so Miami's edge is more about home run prevention and run environment than "
            "a market-wide offensive gap."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "STL",
        "home": "HOU",
        "time_et": "2:10 PM",
        "away_a": 120,
        "home_a": -140,
        "weather": "retractable roof / warm",
        "run_env": "Medium",
        "away_xera": 4.10,
        "home_xera": 4.55,
        "analyst_confidence": "Medium",
        "rationale": (
            "Houston is priced as the steadier home side, but neither starter carries a massive separator, so this stays in the range where "
            "late lineup quality and bullpen leverage matter."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "CIN",
        "home": "MIN",
        "time_et": "2:10 PM",
        "away_a": -101,
        "home_a": -113,
        "weather": "52F / roof likely",
        "run_env": "Medium",
        "away_xera": 4.30,
        "home_xera": 3.75,
        "analyst_confidence": "Medium",
        "rationale": (
            "Singer vs Ober keeps this near pick'em territory, with Minnesota getting a small home bump if the roof holds down early extra-base variance."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "NYM",
        "home": "CHC",
        "time_et": "2:20 PM",
        "away_a": 120,
        "home_a": -140,
        "weather": "54F / Wrigley breeze",
        "run_env": "Medium",
        "away_xera": 4.40,
        "home_xera": 4.15,
        "analyst_confidence": "Medium",
        "rationale": (
            "Wrigley remains sensitive to weather and late lineup shape; the Cubs are favored, but not by enough to ignore any wind or scratch changes."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "LAD",
        "home": "COL",
        "time_et": "3:10 PM",
        "away_a": -225,
        "home_a": 190,
        "weather": "58F / thin air",
        "run_env": "High",
        "away_xera": 3.30,
        "home_xera": 4.85,
        "analyst_confidence": "Medium-High",
        "rationale": (
            "Coors Field keeps the run environment elevated, but the Dodgers still bring the most complete roster edge on the board with Sasaki over Lorenzen."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "CWS",
        "home": "ATH",
        "time_et": "4:05 PM",
        "away_a": 133,
        "home_a": -156,
        "weather": "69F / river breeze",
        "run_env": "Medium",
        "away_xera": 3.75,
        "home_xera": 4.15,
        "analyst_confidence": "Low",
        "rationale": (
            "Sutter Health Park still carries park-model uncertainty, so even with the Athletics favored this is a slate where props and late verification may be cleaner than the side."
        ),
        "extra_flags": ["approx_market_ml", "oak_coliseum_env"],
    },
    {
        "away": "SD",
        "home": "LAA",
        "time_et": "4:07 PM",
        "away_a": -142,
        "home_a": 120,
        "weather": "70F / clear",
        "run_env": "Medium",
        "away_xera": 3.35,
        "home_xera": 5.20,
        "analyst_confidence": "Medium-High",
        "rationale": (
            "Michael King vs a vulnerable Angels starter gives San Diego the cleaner pitching baseline; the main question is how much the market already prices that edge."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "TEX",
        "home": "SEA",
        "time_et": "4:10 PM",
        "away_a": 120,
        "home_a": -142,
        "weather": "62F / roof likely",
        "run_env": "Low-Medium",
        "away_xera": 3.55,
        "home_xera": 3.45,
        "analyst_confidence": "Medium",
        "rationale": (
            "Gore and Woo can both miss bats, so this is another total-and-props environment unless the market drifts far enough off Seattle's home edge."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "TOR",
        "home": "AZ",
        "time_et": "4:10 PM",
        "away_a": -110,
        "home_a": -104,
        "weather": "retractable roof",
        "run_env": "Medium",
        "away_xera": 3.85,
        "home_xera": 4.60,
        "analyst_confidence": "Low",
        "rationale": (
            "Gausman gives Toronto the sharper top-end starter case, but Chase Field often compresses edges once bullpens and roof settings are baked in."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "DET",
        "home": "BOS",
        "time_et": "4:35 PM",
        "away_a": 128,
        "home_a": -150,
        "weather": "55F / cool Fenway",
        "run_env": "Medium",
        "away_xera": 3.25,
        "home_xera": 2.95,
        "analyst_confidence": "Medium",
        "rationale": (
            "Valdez vs Crochet is an ace-caliber setup, so the Red Sox lean is more about home context and price efficiency than any expectation of crooked numbers."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "ATL",
        "home": "PHI",
        "time_et": "7:20 PM",
        "away_a": -102,
        "home_a": -118,
        "weather": "63F / clear",
        "run_env": "Medium-High",
        "away_xera": 4.35,
        "home_xera": 3.80,
        "analyst_confidence": "Medium",
        "rationale": (
            "Painter gives Philadelphia the higher-ceiling arm, but NL East pricing between these lineups rarely leaves much margin without full lineup confirmation."
        ),
        "extra_flags": ["approx_market_ml"],
    },
]
