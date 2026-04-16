"""Apr 16 slate: market inputs, Savant-style starter stubs, and prop feature rows (inputs to prop_model).

Model *outputs* are computed by models.game_model / models.prop_model — not stored here.
"""
from __future__ import annotations

REPORT_DATE = "2026-04-16"
CANVAS_SLUG = "apr16"


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


# Per-game metadata + approximate two-way moneylines (same as prior workflow).
# away_xera / home_xera: pitcher quality inputs for win model + opponent xERA for props.
GAME_SPECS: list[dict] = [
    {
        "away": "WSH",
        "home": "PIT",
        "time_et": "12:35 PM",
        "away_a": 118,
        "home_a": -132,
        "weather": "68F / clear",
        "run_env": "Low-Medium",
        "away_xera": 5.05,
        "home_xera": 4.35,
        "analyst_confidence": "Medium",
        "rationale": (
            "Probables Griffin (WSH) and Ashcraft (PIT) look like swing/spot roles without big "
            "separator stuff. PNC is slightly pitcher-friendly; Pirates get a small home edge but "
            "the price is close to fair."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "SF",
        "home": "CIN",
        "time_et": "12:40 PM",
        "away_a": 128,
        "home_a": -148,
        "weather": "84F / wind out",
        "run_env": "High",
        "away_xera": 4.75,
        "home_xera": 3.45,
        "analyst_confidence": "Medium-High",
        "rationale": (
            "Burns at home brings premium velocity; Roupp works contact and weak barrels. GABP "
            "raises HR/TB volatility — lean Reds, but mostly a props/team-total environment."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "KC",
        "home": "DET",
        "time_et": "1:10 PM",
        "away_a": 108,
        "home_a": -124,
        "weather": "66F / mild",
        "run_env": "Medium",
        "away_xera": 4.35,
        "home_xera": 4.55,
        "analyst_confidence": "Medium",
        "rationale": (
            "Bubic vs Montero is young-starter volatility; Comerica trims some extra-base noise. "
            "Slight DET home lean without a commanding pitching edge."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "LAA",
        "home": "NYY",
        "time_et": "1:35 PM",
        "away_a": 205,
        "home_a": -245,
        "weather": "72F / clear",
        "run_env": "High",
        "away_xera": 5.35,
        "home_xera": 3.15,
        "analyst_confidence": "High",
        "rationale": (
            "Suter vs Fried is a massive talent mismatch; short porch amplifies fly-ball damage. "
            "Market already prices a big NYY edge — PASS on ML unless you have a materially better number."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "TOR",
        "home": "MIL",
        "time_et": "1:40 PM",
        "away_a": -102,
        "home_a": -108,
        "weather": "dome / mild",
        "run_env": "Medium",
        "away_xera": 4.65,
        "home_xera": 4.55,
        "analyst_confidence": "Low",
        "rationale": (
            "Corbin vs Sproat is command volatility on both sides; Milwaukee navigation is a hair "
            "better at home, but this is effectively a coin flip for betting."
        ),
        "extra_flags": ["approx_market_ml", "corbin_platoons"],
    },
    {
        "away": "TB",
        "home": "CWS",
        "time_et": "2:10 PM",
        "away_a": -142,
        "home_a": 124,
        "weather": "62F / clear",
        "run_env": "Medium",
        "away_xera": 4.05,
        "home_xera": 4.85,
        "analyst_confidence": "Medium",
        "rationale": (
            "Matz’s LHP shape matters against Chicago’s lefty bats; Leasure stretched as a starter "
            "adds volatility. Rays are the cleaner roster spot — edge is modest."
        ),
        "extra_flags": ["approx_market_ml"],
    },
    {
        "away": "TEX",
        "home": "ATH",
        "time_et": "3:05 PM",
        "away_a": -118,
        "home_a": 108,
        "weather": "72F / clear",
        "run_env": "Medium",
        "away_xera": 4.25,
        "home_xera": 4.35,
        "analyst_confidence": "Low",
        "rationale": (
            "Leiter vs Lopez profiles as short-leash, high-volatility. No compelling gap vs a tight "
            "market without a better posted price."
        ),
        "extra_flags": ["approx_market_ml", "oak_coliseum_env"],
    },
    {
        "away": "BAL",
        "home": "CLE",
        "time_et": "6:10 PM",
        "away_a": -128,
        "home_a": 118,
        "weather": "58F / clear",
        "run_env": "Medium",
        "away_xera": 3.85,
        "home_xera": 4.45,
        "analyst_confidence": "Medium",
        "rationale": (
            "Baz’s stuff plays when the heater is elevated; Messick needs to limit barrels. Small "
            "lean to Baltimore’s lineup ceiling if Baz holds a normal starter workload."
        ),
        "extra_flags": ["approx_market_ml", "lineup_not_posted_api"],
    },
    {
        "away": "COL",
        "home": "HOU",
        "time_et": "8:10 PM",
        "away_a": 240,
        "home_a": -290,
        "weather": "retractable roof / warm",
        "run_env": "High",
        "away_xera": 5.65,
        "home_xera": 4.25,
        "analyst_confidence": "High",
        "rationale": (
            "Road Rockies vs Houston’s overall talent is a steep mismatch; Crawford Boxes pull-side "
            "HRs matter. Chalk is heavy — PASS unless you model innings/hooks differently."
        ),
        "extra_flags": ["approx_market_ml", "lineup_not_posted_api"],
    },
    {
        "away": "SEA",
        "home": "SD",
        "time_et": "8:40 PM",
        "away_a": -104,
        "home_a": -112,
        "weather": "66F / marine layer",
        "run_env": "Low-Medium",
        "away_xera": 3.55,
        "home_xera": 3.65,
        "analyst_confidence": "Medium",
        "rationale": (
            "Castillo vs Buehler is a true ace duel; Petco suppresses offense. Side market is "
            "rightfully tight — prefer game props over ML."
        ),
        "extra_flags": ["approx_market_ml", "lineup_not_posted_api"],
    },
]


# Prop targets: same coverage as prior slate. brl = barrel rate 0–1, xslg = expected slugging.
# batter_hand / opp_pitcher_hand: L/R/S for platoon bump in prop_model.
PROP_TARGETS: list[dict] = [
    {"game": "WSH@PIT", "team": "WSH", "batter": "James Wood", "note": "LHB power vs RHP spot starter", "brl": 0.54, "xslg": 0.44, "bh": "L", "ph": "R"},
    {"game": "WSH@PIT", "team": "PIT", "batter": "Oneil Cruz", "note": "Barrels vs contact-oriented arm", "brl": 0.52, "xslg": 0.42, "bh": "R", "ph": "L"},
    {"game": "WSH@PIT", "team": "PIT", "batter": "Marcell Ozuna", "note": "Lift path vs FB-heavy approach", "brl": 0.53, "xslg": 0.43, "bh": "R", "ph": "L"},
    {"game": "SF@CIN", "team": "CIN", "batter": "Elly De La Cruz", "note": "Elite tools + GABP", "brl": 0.58, "xslg": 0.48, "bh": "R", "ph": "L"},
    {"game": "SF@CIN", "team": "CIN", "batter": "Spencer Steer", "note": "Lift vs LHP", "brl": 0.48, "xslg": 0.40, "bh": "R", "ph": "L"},
    {"game": "SF@CIN", "team": "SF", "batter": "Matt Chapman", "note": "Fly-ball power vs power RHP", "brl": 0.50, "xslg": 0.42, "bh": "R", "ph": "R"},
    {"game": "KC@DET", "team": "DET", "batter": "Gleyber Torres", "note": "RHB vs LHP", "brl": 0.46, "xslg": 0.39, "bh": "R", "ph": "L"},
    {"game": "KC@DET", "team": "KC", "batter": "Vinnie Pasquantino", "note": "LHB power vs RHP", "brl": 0.52, "xslg": 0.43, "bh": "L", "ph": "R"},
    {"game": "KC@DET", "team": "KC", "batter": "Bobby Witt Jr.", "note": "Speed + XB upside", "brl": 0.48, "xslg": 0.41, "bh": "R", "ph": "R"},
    {"game": "LAA@NYY", "team": "NYY", "batter": "Aaron Judge", "note": "RHB vs soft LHP", "brl": 0.62, "xslg": 0.52, "bh": "R", "ph": "L"},
    {"game": "LAA@NYY", "team": "NYY", "batter": "Giancarlo Stanton", "note": "Short porch path", "brl": 0.55, "xslg": 0.46, "bh": "R", "ph": "L"},
    {"game": "LAA@NYY", "team": "LAA", "batter": "Mike Trout", "note": "K watch vs Fried’s swing-miss", "brl": 0.54, "xslg": 0.45, "bh": "R", "ph": "L"},
    {"game": "TOR@MIL", "team": "TOR", "batter": "Vladimir Guerrero Jr.", "note": "Hard contact vs volatile RHP", "brl": 0.56, "xslg": 0.46, "bh": "R", "ph": "R"},
    {"game": "TOR@MIL", "team": "TOR", "batter": "Daulton Varsho", "note": "K spot — swing-and-miss risk", "brl": 0.42, "xslg": 0.36, "bh": "L", "ph": "R"},
    {"game": "TOR@MIL", "team": "MIL", "batter": "William Contreras", "note": "RHB vs LHP", "brl": 0.51, "xslg": 0.43, "bh": "R", "ph": "L"},
    {"game": "TB@CWS", "team": "TB", "batter": "Junior Caminero", "note": "Raw power vs opener/stretched SP", "brl": 0.53, "xslg": 0.44, "bh": "R", "ph": "R"},
    {"game": "TB@CWS", "team": "TB", "batter": "Yandy Díaz", "note": "Contact > lift", "brl": 0.44, "xslg": 0.38, "bh": "R", "ph": "L"},
    {"game": "TB@CWS", "team": "CWS", "batter": "Andrew Benintendi", "note": "K spot vs LHP shape", "brl": 0.38, "xslg": 0.34, "bh": "L", "ph": "L"},
    {"game": "TEX@ATH", "team": "TEX", "batter": "Wyatt Langford", "note": "Lift vs RHP", "brl": 0.50, "xslg": 0.42, "bh": "R", "ph": "R"},
    {"game": "TEX@ATH", "team": "TEX", "batter": "Josh Jung", "note": "Pull power", "brl": 0.49, "xslg": 0.41, "bh": "R", "ph": "R"},
    {"game": "TEX@ATH", "team": "ATH", "batter": "Lawrence Butler", "note": "Athletic RH power", "brl": 0.48, "xslg": 0.40, "bh": "L", "ph": "R"},
    {"game": "BAL@CLE", "team": "BAL", "batter": "Gunnar Henderson", "note": "Power SS vs LHP", "brl": 0.52, "xslg": 0.43, "bh": "L", "ph": "L"},
    {"game": "BAL@CLE", "team": "BAL", "batter": "Coby Mayo", "note": "K risk — chase profile", "brl": 0.45, "xslg": 0.38, "bh": "R", "ph": "L"},
    {"game": "BAL@CLE", "team": "CLE", "batter": "David Fry", "note": "RHB vs Baz (stuff game)", "brl": 0.46, "xslg": 0.39, "bh": "R", "ph": "R"},
    {"game": "COL@HOU", "team": "HOU", "batter": "Yordan Alvarez", "note": "LHB vs RHP spot starter", "brl": 0.60, "xslg": 0.50, "bh": "L", "ph": "R"},
    {"game": "COL@HOU", "team": "HOU", "batter": "Christian Walker", "note": "Lift vs FB", "brl": 0.48, "xslg": 0.40, "bh": "R", "ph": "R"},
    {"game": "COL@HOU", "team": "COL", "batter": "Hunter Goodman", "note": "Power path only — tough spot", "brl": 0.51, "xslg": 0.42, "bh": "R", "ph": "R"},
    {"game": "SEA@SD", "team": "SD", "batter": "Fernando Tatis Jr.", "note": "Athleticism vs elite stuff", "brl": 0.52, "xslg": 0.43, "bh": "R", "ph": "R"},
    {"game": "SEA@SD", "team": "SD", "batter": "Manny Machado", "note": "Contact-over-HR vs Castillo", "brl": 0.46, "xslg": 0.39, "bh": "R", "ph": "R"},
    {"game": "SEA@SD", "team": "SEA", "batter": "Julio Rodríguez", "note": "K watch vs Buehler", "brl": 0.50, "xslg": 0.42, "bh": "R", "ph": "R"},
]
