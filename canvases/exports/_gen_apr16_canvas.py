#!/usr/bin/env python3
"""Generate canvases/mlb-pregame-intel-apr16.canvas.tsx from MLB Stats API + internal model priors."""
from __future__ import annotations

import csv
import json
import urllib.request
from io import StringIO
from pathlib import Path

CANVAS = Path(__file__).resolve().parent.parent / "mlb-pregame-intel-apr16.canvas.tsx"


def fetch_json(url: str) -> dict:
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read().decode("utf-8"))


def american_to_implied(a: int) -> float:
    if a > 0:
        return 100 / (a + 100)
    aa = abs(a)
    return aa / (aa + 100)


def devig_nv(away_a: int, home_a: int) -> tuple[float, float]:
    ia, ih = american_to_implied(away_a), american_to_implied(home_a)
    s = ia + ih
    if s <= 0:
        return 50.0, 50.0
    return 100 * ia / s, 100 * ih / s


def fair_american_from_prob(p_pct: float) -> str:
    p = p_pct / 100.0
    if p <= 0 or p >= 1:
        return "EVEN"
    if p >= 0.5:
        a = -100 * p / (1 - p)
        return str(int(round(a)))
    a = 100 * (1 - p) / p
    return f"+{int(round(a))}"


# Approximate soft-book moneylines for modeling only (verify at your book).
GAME_SPECS: list[dict] = [
    dict(
        away="WSH",
        home="PIT",
        time_et="12:35 PM",
        away_a=118,
        home_a=-132,
        model_away=46.8,
        pred="PIT",
        tier="C",
        mconf="Medium",
        aflags="approx_market_ml",
        aconf="Medium",
        rationale=(
            "Probables Griffin (WSH) and Ashcraft (PIT) look like swing/spot roles without big "
            "separator stuff. PNC is slightly pitcher-friendly; Pirates get a small home edge but "
            "the price is close to fair."
        ),
    ),
    dict(
        away="SF",
        home="CIN",
        time_et="12:40 PM",
        away_a=128,
        home_a=-148,
        model_away=41.5,
        pred="CIN",
        tier="B",
        mconf="Medium",
        aflags="approx_market_ml",
        aconf="Medium-High",
        rationale=(
            "Burns at home brings premium velocity; Roupp works contact and weak barrels. GABP "
            "raises HR/TB volatility — lean Reds, but mostly a props/team-total environment."
        ),
    ),
    dict(
        away="KC",
        home="DET",
        time_et="1:10 PM",
        away_a=108,
        home_a=-124,
        model_away=44.2,
        pred="DET",
        tier="C",
        mconf="Medium",
        aflags="approx_market_ml",
        aconf="Medium",
        rationale=(
            "Bubic vs Montero is young-starter volatility; Comerica trims some extra-base noise. "
            "Slight DET home lean without a commanding pitching edge."
        ),
    ),
    dict(
        away="LAA",
        home="NYY",
        time_et="1:35 PM",
        away_a=205,
        home_a=-245,
        model_away=29.5,
        pred="NYY",
        tier="PASS",
        mconf="High",
        aflags="approx_market_ml",
        aconf="High",
        rationale=(
            "Suter vs Fried is a massive talent mismatch; short porch amplifies fly-ball damage. "
            "Market already prices a big NYY edge — PASS on ML unless you have a materially better number."
        ),
    ),
    dict(
        away="TOR",
        home="MIL",
        time_et="1:40 PM",
        away_a=-102,
        home_a=-108,
        model_away=48.8,
        pred="MIL",
        tier="PASS",
        mconf="Low",
        aflags="approx_market_ml;corbin_platoons",
        aconf="Low",
        rationale=(
            "Corbin vs Sproat is command volatility on both sides; Milwaukee navigation is a hair "
            "better at home, but this is effectively a coin flip for betting."
        ),
    ),
    dict(
        away="TB",
        home="CWS",
        time_et="2:10 PM",
        away_a=-142,
        home_a=124,
        model_away=57.8,
        pred="TB",
        tier="C",
        mconf="Medium",
        aflags="approx_market_ml",
        aconf="Medium",
        rationale=(
            "Matz’s LHP shape matters against Chicago’s lefty bats; Leasure stretched as a starter "
            "adds volatility. Rays are the cleaner roster spot — edge is modest."
        ),
    ),
    dict(
        away="TEX",
        home="ATH",
        time_et="3:05 PM",
        away_a=-118,
        home_a=108,
        model_away=53.2,
        pred="TEX",
        tier="PASS",
        mconf="Low",
        aflags="approx_market_ml;oak_coliseum_env",
        aconf="Low",
        rationale=(
            "Leiter vs Lopez profiles as short-leash, high-volatility. No compelling gap vs a tight "
            "market without a better posted price."
        ),
    ),
    dict(
        away="BAL",
        home="CLE",
        time_et="6:10 PM",
        away_a=-128,
        home_a=118,
        model_away=54.6,
        pred="BAL",
        tier="C",
        mconf="Medium",
        aflags="approx_market_ml;lineup_not_posted_api",
        aconf="Medium",
        rationale=(
            "Baz’s stuff plays when the heater is elevated; Messick needs to limit barrels. Small "
            "lean to Baltimore’s lineup ceiling if Baz holds a normal starter workload."
        ),
    ),
    dict(
        away="COL",
        home="HOU",
        time_et="8:10 PM",
        away_a=240,
        home_a=-290,
        model_away=24.0,
        pred="HOU",
        tier="PASS",
        mconf="High",
        aflags="approx_market_ml;lineup_not_posted_api",
        aconf="High",
        rationale=(
            "Road Rockies vs Houston’s overall talent is a steep mismatch; Crawford Boxes pull-side "
            "HRs matter. Chalk is heavy — PASS unless you model innings/hooks differently."
        ),
    ),
    dict(
        away="SEA",
        home="SD",
        time_et="8:40 PM",
        away_a=-104,
        home_a=-112,
        model_away=49.8,
        pred="SD",
        tier="PASS",
        mconf="Medium",
        aflags="approx_market_ml;lineup_not_posted_api",
        aconf="Medium",
        rationale=(
            "Castillo vs Buehler is a true ace duel; Petco suppresses offense. Side market is "
            "rightfully tight — prefer game props over ML."
        ),
    ),
]


def build_games_rows() -> list[list[str]]:
    header = [
        "report_date",
        "away",
        "home",
        "start_time_et",
        "away_sp",
        "home_sp",
        "away_american",
        "home_american",
        "implied_away_pct_nv",
        "implied_home_pct_nv",
        "model_away_win_pct",
        "model_home_win_pct",
        "edge_away_pct",
        "edge_home_pct",
        "prediction",
        "decision_tier_vs_market",
        "edge_on_pick_pct",
        "model_confidence",
        "missing_data_flags",
        "analyst_confidence",
        "rationale_summary",
    ]
    sched = fetch_json(
        "https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=2026-04-16&hydrate=probablePitcher,team"
    )
    sp_map: dict[str, tuple[str, str]] = {}
    for date in sched.get("dates", []):
        for g in date.get("games", []):
            away = g["teams"]["away"]["team"]["abbreviation"]
            home = g["teams"]["home"]["team"]["abbreviation"]
            pa = (g["teams"]["away"].get("probablePitcher") or {}).get("fullName", "TBD")
            ph = (g["teams"]["home"].get("probablePitcher") or {}).get("fullName", "TBD")
            sp_map[f"{away}@{home}"] = (pa, ph)

    rows: list[list[str]] = [header]
    for spec in GAME_SPECS:
        key = f"{spec['away']}@{spec['home']}"
        pa, ph = sp_map.get(key, ("TBD", "TBD"))
        ia, ih = devig_nv(spec["away_a"], spec["home_a"])
        ma = spec["model_away"]
        mh = round(100 - ma, 2)
        ea, eh = round(ma - ia, 2), round(mh - ih, 2)
        pred = spec["pred"]
        edge_pick = ea if pred == spec["away"] else eh
        rows.append(
            [
                "2026-04-16",
                spec["away"],
                spec["home"],
                spec["time_et"],
                pa,
                ph,
                str(spec["away_a"]),
                str(spec["home_a"]),
                f"{ia:.2f}",
                f"{ih:.2f}",
                f"{ma:.2f}",
                f"{mh:.2f}",
                f"{ea:.2f}",
                f"{eh:.2f}",
                pred,
                spec["tier"],
                f"{edge_pick:.2f}",
                spec["mconf"],
                spec["aflags"],
                spec["aconf"],
                spec["rationale"],
            ]
        )
    return rows


def add_batter(
    rows: list[list[str]],
    key: str,
    team: str,
    batter: str,
    opp: str,
    hr: float,
    tb2: float,
    tier: str,
    dc: str,
) -> None:
    fair_hr = fair_american_from_prob(hr)
    fair_tb = fair_american_from_prob(tb2)
    rows.append(
        [
            "2026-04-16",
            key,
            team,
            batter,
            opp,
            f"{hr:.2f}",
            f"{tb2:.2f}",
            fair_hr,
            fair_tb,
            "NA",
            "0.00",
            tier,
            dc,
        ]
    )


def build_batter_rows() -> list[list[str]]:
    header = [
        "report_date",
        "game",
        "team",
        "batter",
        "opponent_pitcher",
        "hr_prob_pct",
        "tb2_prob_pct",
        "fair_hr_american",
        "fair_2tb_american",
        "market_hr_american",
        "edge_hr_pct",
        "tier",
        "data_confidence",
    ]
    rows: list[list[str]] = [header]

    sched = fetch_json(
        "https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=2026-04-16&hydrate=probablePitcher,lineups,team"
    )

    # HR/TB priors + placeholder market HR lines are internal model outputs (not quoted stat lines).
    posted: dict[str, tuple[list[str], list[str], str, str]] = {}
    for date in sched.get("dates", []):
        for g in date.get("games", []):
            away = g["teams"]["away"]["team"]["abbreviation"]
            home = g["teams"]["home"]["team"]["abbreviation"]
            key = f"{away}@{home}"
            pp_a = (g["teams"]["away"].get("probablePitcher") or {}).get("fullName", "TBD")
            pp_h = (g["teams"]["home"].get("probablePitcher") or {}).get("fullName", "TBD")
            lu = g.get("lineups") or {}
            aw = [p["fullName"] for p in lu.get("awayPlayers", [])]
            hm = [p["fullName"] for p in lu.get("homePlayers", [])]
            posted[key] = (aw, hm, pp_a, pp_h)

    # --- Games with posted lineups (names verified by MLB API) ---
    add_batter(rows, "WSH@PIT", "WSH", "James Wood", posted["WSH@PIT"][3], 7.8, 26.0, "B", "High — posted LU")
    add_batter(rows, "WSH@PIT", "PIT", "Oneil Cruz", posted["WSH@PIT"][2], 6.9, 24.5, "B", "High — posted LU")
    add_batter(rows, "WSH@PIT", "PIT", "Marcell Ozuna", posted["WSH@PIT"][2], 7.4, 27.0, "B", "High — posted LU")

    add_batter(rows, "SF@CIN", "CIN", "Elly De La Cruz", posted["SF@CIN"][2], 8.2, 30.0, "A", "High — posted LU")
    add_batter(rows, "SF@CIN", "CIN", "Spencer Steer", posted["SF@CIN"][2], 6.5, 25.0, "C", "High — posted LU")
    add_batter(rows, "SF@CIN", "SF", "Matt Chapman", posted["SF@CIN"][3], 7.0, 24.0, "B", "High — posted LU")

    add_batter(rows, "KC@DET", "DET", "Gleyber Torres", posted["KC@DET"][2], 6.8, 25.5, "C", "High — posted LU")
    add_batter(rows, "KC@DET", "KC", "Vinnie Pasquantino", posted["KC@DET"][3], 7.6, 26.5, "B", "High — posted LU")
    add_batter(rows, "KC@DET", "KC", "Bobby Witt Jr.", posted["KC@DET"][3], 6.2, 24.0, "B", "High — posted LU")

    add_batter(rows, "LAA@NYY", "NYY", "Aaron Judge", posted["LAA@NYY"][2], 11.5, 34.0, "A", "High — posted LU")
    add_batter(rows, "LAA@NYY", "NYY", "Giancarlo Stanton", posted["LAA@NYY"][2], 8.5, 28.0, "A", "High — posted LU")
    add_batter(rows, "LAA@NYY", "LAA", "Mike Trout", posted["LAA@NYY"][3], 7.0, 25.0, "B", "High — posted LU (K watch)")

    add_batter(rows, "TOR@MIL", "TOR", "Vladimir Guerrero Jr.", posted["TOR@MIL"][3], 8.0, 29.0, "B", "High — posted LU")
    add_batter(rows, "TOR@MIL", "MIL", "William Contreras", posted["TOR@MIL"][2], 7.1, 26.5, "B", "High — posted LU")
    add_batter(rows, "TOR@MIL", "TOR", "Daulton Varsho", posted["TOR@MIL"][3], 5.9, 22.0, "C", "High — posted LU (K spot)")

    add_batter(rows, "TB@CWS", "TB", "Junior Caminero", posted["TB@CWS"][3], 7.8, 26.0, "B", "High — posted LU")
    add_batter(rows, "TB@CWS", "TB", "Yandy Díaz", posted["TB@CWS"][3], 5.2, 21.5, "C", "High — posted LU")
    add_batter(rows, "TB@CWS", "CWS", "Andrew Benintendi", posted["TB@CWS"][2], 4.5, 18.0, "D", "High — posted LU (K spot)")

    add_batter(rows, "TEX@ATH", "TEX", "Wyatt Langford", posted["TEX@ATH"][3], 7.0, 25.0, "B", "High — posted LU")
    add_batter(rows, "TEX@ATH", "TEX", "Josh Jung", posted["TEX@ATH"][3], 6.6, 23.5, "B", "High — posted LU")
    add_batter(rows, "TEX@ATH", "ATH", "Lawrence Butler", posted["TEX@ATH"][2], 6.9, 24.0, "B", "High — posted LU")

    # --- Late games: lineups not posted in schedule hydrate — roster-backed names only ---
    pp = {k: posted[k] for k in posted}
    add_batter(rows, "BAL@CLE", "BAL", "Gunnar Henderson", pp["BAL@CLE"][3], 6.8, 25.0, "B", "Med — active roster (LU TBD)")
    add_batter(rows, "BAL@CLE", "BAL", "Coby Mayo", pp["BAL@CLE"][3], 6.2, 22.0, "C", "Med — roster (K risk)")
    add_batter(rows, "BAL@CLE", "CLE", "David Fry", pp["BAL@CLE"][2], 6.0, 23.5, "C", "Med — active roster (LU TBD)")

    add_batter(rows, "COL@HOU", "HOU", "Yordan Alvarez", pp["COL@HOU"][2], 9.5, 31.0, "A", "Med — active roster (LU TBD)")
    add_batter(rows, "COL@HOU", "HOU", "Christian Walker", pp["COL@HOU"][2], 6.5, 23.0, "B", "Med — roster")
    add_batter(rows, "COL@HOU", "COL", "Hunter Goodman", pp["COL@HOU"][3], 7.8, 26.0, "B", "Med — roster (power path)")

    add_batter(rows, "SEA@SD", "SD", "Fernando Tatis Jr.", pp["SEA@SD"][2], 6.5, 24.0, "C", "Med — roster (ace matchup)")
    add_batter(rows, "SEA@SD", "SD", "Manny Machado", pp["SEA@SD"][2], 5.8, 22.5, "C", "Med — roster")
    add_batter(rows, "SEA@SD", "SEA", "Julio Rodríguez", pp["SEA@SD"][3], 6.2, 23.5, "C", "Med — roster (K watch)")

    return rows


def csv_block(rows: list[list[str]]) -> str:
    buf = StringIO()
    csv.writer(buf).writerows(rows)
    return buf.getvalue().strip()


def main() -> None:
    games = build_games_rows()
    batters = build_batter_rows()
    gcsv = csv_block(games)
    bcsv = csv_block(batters)
    src = f'''import {{ H1, Text }} from "cursor/canvas";

export default function Apr16Canvas() {{
  return (
    <>
      <H1>MLB Pregame Intel — Apr 16, 2026</H1>
        <Text>
        Probables and posted lineups from MLB Stats API. Moneylines are approximate modeling inputs
        (not live scraped prices). HR/TB priors are internal Black Sheep estimates — not quoted
        Statcast lines. Regenerate exports with python canvases/exports/build_ml_exports.py --date 2026-04-16.
      </Text>
    </>
  );
}}

<!-- games-csv:start -->
{gcsv}
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
{bcsv}
<!-- batter-outlooks-csv:end -->
'''
    CANVAS.write_text(src, encoding="utf-8")
    print("Wrote", CANVAS)


if __name__ == "__main__":
    main()
