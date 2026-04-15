#!/usr/bin/env python3
"""Export MLB pregame intel: game probabilities + batter props (mirrors canvas engine)."""
from __future__ import annotations

import csv
import html as html_lib
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent
DATE = "2026-04-15"

# Odds API / book snapshot [away American, home American]
BOOK_AMERICAN: dict[str, tuple[int, int]] = {
    "CHC@PHI": (128, -140),
    "KC@DET": (115, -130),
    "SF@CIN": (-110, 102),
    "WSH@PIT": (152, -180),
    "LAA@NYY": (158, -190),
    "MIA@ATL": (140, -166),
    "TB@CWS": (-112, 102),
    "TOR@MIL": (-122, 104),
    "COL@HOU": (168, -190),
    "SEA@SD": (-108, 100),
    "TEX@ATH": (108, -120),
    "NYM@LAD": (164, -192),
}

# Savant xERA (second number in ERA/xERA row) per SP — used when lineup stats missing
GAME_XERA: dict[str, tuple[float | None, float | None]] = {
    "CHC@PHI": (2.71, 2.82),
    "KC@DET": (4.89, 6.65),
    "SF@CIN": (5.68, 4.42),
    "WSH@PIT": (5.46, 3.77),
    "LAA@NYY": (6.05, 5.57),
    "MIA@ATL": (4.30, 2.35),
    "TB@CWS": (3.08, 3.20),
    "TOR@MIL": (2.95, 3.69),
    "COL@HOU": (5.86, None),
    "SEA@SD": (2.39, 4.21),
    "TEX@ATH": (4.07, 2.41),
    "NYM@LAD": (3.59, 2.43),
}


def american_to_implied(a: int) -> float:
    if a > 0:
        return 100 / (a + 100)
    return abs(a) / (abs(a) + 100)


def devig_two_way(away_a: int, home_a: int) -> tuple[float, float]:
    ia, ih = american_to_implied(away_a), american_to_implied(home_a)
    s = ia + ih
    if s <= 0:
        return 0.5, 0.5
    return ia / s, ih / s


def clamp(n: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, n))


def starter_score(xera: float | None) -> float:
    if xera is None or math.isnan(xera):
        return 0.5
    return clamp((4.85 - xera) / 2.85, 0.0, 1.0)


def lineup_score_placeholder(has_lineup: bool) -> float:
    return 0.55 if has_lineup else 0.44


def park_split(weather: str, run_env: str) -> tuple[float, float]:
    mid = 0.5
    if "dome" in weather.lower():
        mid = 0.52
    if run_env == "High":
        mid = 0.54
    if run_env in ("Low", "Low-Medium"):
        mid = 0.47
    return mid - 0.012, mid + 0.012


def variance_score(flags: list[str]) -> float:
    blob = " ".join(flags)
    if "savant" in blob.lower() or "no data" in blob.lower():
        return 0.38
    if "17 pa" in blob.lower() or "tiny" in blob.lower() or "36 pa" in blob.lower():
        return 0.4
    return 0.52


def win_probability_model(
    away_x: float | None,
    home_x: float | None,
    weather: str,
    run_env: str,
    has_away_lu: bool,
    has_home_lu: bool,
    flags: list[str],
) -> tuple[float, float, str, list[str]]:
    miss: list[str] = []
    if away_x is None:
        miss.append("away SP xERA")
    if home_x is None:
        miss.append("home SP xERA")
    if not has_away_lu:
        miss.append("away LU")
    if not has_home_lu:
        miss.append("home LU")
    pa, ph = park_split(weather, run_env)
    v = variance_score(flags)
    sa = (
        0.4 * starter_score(away_x)
        + 0.2 * 0.5
        + 0.25 * lineup_score_placeholder(has_away_lu)
        + 0.1 * pa
        + 0.05 * v
    )
    sh = (
        0.4 * starter_score(home_x)
        + 0.2 * 0.5
        + 0.25 * lineup_score_placeholder(has_home_lu)
        + 0.1 * ph
        + 0.05 * v
    )
    d = sh - sa
    p_home = 1 / (1 + math.exp(-3.1 * d))
    p_away = 1 - p_home
    conf = "Medium"
    if len(miss) >= 2:
        conf = "Low"
    elif len(miss) == 0 and has_away_lu and has_home_lu:
        conf = "High"
    return p_away, p_home, conf, miss


def tier_from_edge(edge_pct: float) -> str:
    if edge_pct >= 8:
        return "A+"
    if edge_pct >= 5:
        return "A"
    if edge_pct >= 2:
        return "B"
    if edge_pct > 0:
        return "C"
    return "D"


def prob_to_american(p: float) -> str:
    if p <= 0.001 or p >= 0.999:
        return "—"
    if p >= 0.5:
        m = -round((p / (1 - p)) * 100)
        return str(m)
    return f"+{round(((1 - p) / p) * 100)}"


def park_hr_factor(away: str, home: str) -> float:
    if "COL" in (away, home):
        return 1.12
    if "NYY" in (away, home):
        return 1.04
    if "CIN" in (away, home):
        return 1.06
    return 1.0


def batter_prop(
    brl: float | None,
    xslg: float | None,
    opp_xera: float | None,
    away: str,
    home: str,
) -> tuple[float, float, str, str, str]:
    brl = 0.52 if brl is None else brl
    xslg = 0.38 if xslg is None else xslg
    ox = 4.15 if opp_xera is None else opp_xera
    pk = park_hr_factor(away, home)
    base_hr = 0.028
    brl_adj = (brl - 0.52) * 0.09
    xslg_adj = clamp((xslg - 0.4) * 0.1, -0.02, 0.09)
    pit_adj = clamp((ox - 4.15) * 0.009, -0.018, 0.028)
    hr = clamp(base_hr + brl_adj + xslg_adj + pit_adj + (pk - 1) * 0.022, 0.006, 0.24)
    base2 = 0.2
    tb2 = clamp(
        base2 + (brl - 0.5) * 0.16 + (xslg - 0.38) * 0.18 + pit_adj * 0.6,
        0.07,
        0.52,
    )
    def intr_hr(h: float) -> str:
        if h >= 0.132:
            return "A+"
        if h >= 0.102:
            return "A"
        if h >= 0.078:
            return "B"
        if h >= 0.058:
            return "C"
        return "D"

    def intr_2(p: float) -> str:
        if p >= 0.38:
            return "A+"
        if p >= 0.32:
            return "A"
        if p >= 0.26:
            return "B"
        if p >= 0.2:
            return "C"
        return "D"

    th, t2 = intr_hr(hr), intr_2(tb2)
    rank = {"A+": 5, "A": 4, "B": 3, "C": 2, "D": 1}
    tier = th if rank[th] >= rank[t2] else t2
    return hr, tb2, prob_to_american(hr), prob_to_american(tb2), tier


# Optional: barrel (0-1) and xSLG for specific batters (Savant / MLB Stats) — defaults used if absent
BATTER_STATS: dict[tuple[str, str], tuple[float, float]] = {
    ("MIA@ATL", "Ronald Acuña Jr."): (0.91, 0.598),
    ("MIA@ATL", "R. Acuña Jr."): (0.91, 0.598),
    ("SF@CIN", "C. Schmitt"): (0.67, 0.429),
    ("SF@CIN", "W. Adames"): (0.73, 0.459),
    ("SF@CIN", "R. Devers"): (0.67, 0.399),
    ("SF@CIN", "D. Susac"): (0.5, 0.605),
    ("SF@CIN", "S. Stewart"): (0.96, 0.629),
    ("SF@CIN", "E. De La Cruz"): (0.87, 0.538),
    ("SF@CIN", "S. Steer"): (0.93, 0.485),
    ("LAA@NYY", "M. Trout"): (0.99, 0.727),
    ("LAA@NYY", "Z. Neto"): (0.76, 0.421),
    ("LAA@NYY", "J. Adell"): (0.31, 0.439),
    ("LAA@NYY", "B. Rice"): (0.98, 0.68),
    ("LAA@NYY", "A. Judge"): (1.0, 0.653),
    ("TOR@MIL", "G. Sanchez"): (1.0, 0.7),
    ("SEA@SD", "L. Raley"): (0.94, 0.587),
    ("NYM@LAD", "F. Alvarez"): (0.97, 0.703),
}


GAMES_SUMMARY = [
  {"away":"CHC","home":"PHI","time":"6:40 PM","awaySP":"Shota Imanaga","homeSP":"Jesus Luzardo","spStatus":"Strongly Corroborated","awayLuStatus":"Projected","homeLuStatus":"Projected","line":"PHI -140","total":"9.0","weather":"89F / wind 10mph Out","prediction":"PHI","runEnv":"Medium-High","confidence":"Low","why":"Luzardo xERA (2.82) far better than surface ERA (6.23) — elite whiff/chase profile. Imanaga strong but lower velo limits ceiling. Hot weather + wind out elevates total. Lineups projected, not confirmed.","bestAngle":"PHI ML at -140 (Luzardo xERA regression play) — LEAN","bestBatter":"Waiting for lineups","bestProp":"Luzardo Ks Over — WATCHLIST","biggestRisk":"Both lineups unconfirmed","gameConf":"Low"},
  {"away":"KC","home":"DET","time":"6:40 PM","awaySP":"Seth Lugo","homeSP":"Jack Flaherty","spStatus":"Strongly Corroborated","awayLuStatus":"Projected","homeLuStatus":"Projected","line":"DET -130","total":"8.5","weather":"66F / wind 12mph R-L","prediction":"KC","runEnv":"Medium","confidence":"Low","why":"Lugo surface ERA (1.53) masks xERA (4.89) regression risk, but Flaherty's profile is worse across the board (xERA 6.65, 6th %tile hard-hit suppression, 7th %tile chase). Market prices DET as favorite — potential value on KC if lineups confirm.","bestAngle":"KC ML +112 — WATCHLIST (needs lineup confirmation)","bestBatter":"Waiting for lineups","bestProp":"Flaherty ER Over — WATCHLIST","biggestRisk":"Both lineups unconfirmed; Lugo regression risk","gameConf":"Low"},
  {"away":"SF","home":"CIN","time":"6:40 PM","awaySP":"Tyler Mahle","homeSP":"Rhett Lowder","spStatus":"Strongly Corroborated","awayLuStatus":"Confirmed","homeLuStatus":"Confirmed","line":"SF -110","total":"9.0","weather":"84F / wind 11mph R-L","prediction":"SF","runEnv":"High","confidence":"Medium","why":"SF lineup confirmed with quality contact profiles (Schmitt 90th HH%tile, Devers 72nd). Lowder low-K profile (17th %tile) means more balls in play. CIN has power (De La Cruz, Stewart elite vs FF) but Mahle's splitter provides swing-miss floor. GABP + heat = runs.","bestAngle":"SF ML -110 — LEAN (lineup quality edge, high run env)","bestBatter":"S. Stewart vs Mahle (elite power vs FF) — LEAN","bestProp":"Stewart 2+ TB — LEAN","biggestRisk":"GABP + heat = variance; Mahle hard-hit risk","gameConf":"Medium"},
  {"away":"WSH","home":"PIT","time":"6:40 PM","awaySP":"Jake Irvin","homeSP":"Mason Montgomery","spStatus":"Strongly Corroborated","awayLuStatus":"Projected","homeLuStatus":"Projected","line":"PIT -180","total":"9.5","weather":"82F / wind 10mph R-L","prediction":"PIT","runEnv":"Medium-High","confidence":"Low","why":"Montgomery elite K profile (99th %tile, 97th velo) despite rough ERA. Irvin leaking hard contact (10th %tile HH suppression, 20% barrel rate). Heavy PIT price (-180) may be justified but limits value. Lineups projected.","bestAngle":"PIT -180 — PASS (price too steep without confirmed LU)","bestBatter":"Waiting for lineups","bestProp":"Montgomery Ks Over — WATCHLIST","biggestRisk":"Price too high; Montgomery small sample (36 PA)","gameConf":"Low"},
  {"away":"LAA","home":"NYY","time":"7:05 PM","awaySP":"Jack Kochanowicz","homeSP":"Luis Gil","spStatus":"Strongly Corroborated","awayLuStatus":"Confirmed","homeLuStatus":"Confirmed","line":"NYY -190","total":"10.5","weather":"85F / wind 10mph Out","prediction":"NYY","runEnv":"High","confidence":"Medium","why":"Both SPs project poorly (Kochanowicz xERA 6.05, Gil xERA 5.57). NYY lineup confirmed with elite contact cluster (Ben Rice 100th HH, Judge 100th BRL). Hot weather + wind out at Yankee Stadium. Total 10.5 reflects high-scoring environment. NYY lineup quality >> LAA lineup quality.","bestAngle":"Over 10.5 — LEAN (both SPs regressing, weather, Yankee Stadium)","bestBatter":"B. Rice vs Kochanowicz — LEAN (elite contact profile)","bestProp":"Trout HR — WATCHLIST (99th BRL vs weak SP + hot conditions)","biggestRisk":"NYY -190 steep; Gil could get pulled early making bullpen key","gameConf":"Medium"},
  {"away":"MIA","home":"ATL","time":"7:15 PM","awaySP":"Chris Paddack","homeSP":"Bryce Elder","spStatus":"Strongly Corroborated","awayLuStatus":"Confirmed","homeLuStatus":"Confirmed","line":"ATL -166","total":"9.0","weather":"85F / wind 6mph Out","prediction":"ATL","runEnv":"Medium","confidence":"Medium","why":"Elder xERA (2.35) backs up surface ERA (1.02) — legitimate run prevention with 88th xwOBA %tile. Paddack's underlying indicators weaker (xERA 4.30). ATL lineup has D. Smith (.599 xSLG), D. Baldwin (.583 xSLG), Olson elite BRL profiles vs Paddack FF.","bestAngle":"ATL ML -166 — LEAN (Elder real, Paddack hittable, but price steep)","bestBatter":"D. Smith / D. Baldwin / M. Olson cluster vs Paddack FF — LEAN","bestProp":"ATL team total Over — WATCHLIST","biggestRisk":"ATL -166 steep; MIA has some SL matchup spots vs Elder","gameConf":"Medium"},
  {"away":"TB","home":"CWS","time":"7:40 PM","awaySP":"Jesse Scholtens","homeSP":"Sean Burke","spStatus":"Strongly Corroborated","awayLuStatus":"Confirmed","homeLuStatus":"Confirmed","line":"TB -112","total":"8.5","weather":"71F / rain 58% / wind 13mph R-L","prediction":"TB","runEnv":"Low-Medium","confidence":"Low","why":"Scholtens tiny sample (17 PA) makes analysis difficult. Burke has quality underlying numbers (xERA 3.20, 70th xwOBA %tile). CWS lineup is one of weakest in MLB. Rain risk (58%) could delay or suspend.","bestAngle":"PASS — rain risk + Scholtens unknown sample","bestBatter":"Murakami power upside — WATCHLIST","bestProp":"No clear prop edge","biggestRisk":"58% rain probability; Scholtens 17-PA sample","gameConf":"Low"},
  {"away":"TOR","home":"MIL","time":"7:40 PM","awaySP":"Dylan Cease","homeSP":"Chad Patrick","spStatus":"Strongly Corroborated","awayLuStatus":"Confirmed","homeLuStatus":"Confirmed","line":"TOR -122","total":"7.5","weather":"Dome","prediction":"TOR","runEnv":"Low-Medium","confidence":"Medium","why":"Cease elite swing-miss profile (97th K, 98th whiff, 85th chase) vs MIL lineup with exploitable chase/whiff holes. Patrick xERA (3.69) reveals regression from 0.73 ERA — low K (11th %tile), low whiff (31st). Dome removes weather noise. TOR lineup has enough contact (Guerrero, Sanchez, Varsho).","bestAngle":"TOR ML -122 — BET (Cease dominance profile vs Patrick regression)","bestBatter":"G. Sanchez vs Cease — WATCHLIST (power but high K risk)","bestProp":"Cease Ks Over — BET (elite profile, dome, chase-heavy lineup)","biggestRisk":"Cease walk rate can raise pitch count; TOR lineup thin at bottom","gameConf":"Medium"},
  {"away":"COL","home":"HOU","time":"8:10 PM","awaySP":"Jose Quintana","homeSP":"Spencer Arrighetti","spStatus":"Strongly Corroborated","awayLuStatus":"Confirmed","homeLuStatus":"Confirmed","line":"HOU -190","total":"8.5","weather":"Dome","prediction":"HOU","runEnv":"Medium","confidence":"Medium","why":"Quintana xERA (5.86) weak. HOU lineup has elite contact cluster: Y. Alvarez (100th xwOBA %tile, .799 xSLG), C. Walker (86th BRL), Cam Smith (92nd BRL). Arrighetti no Savant data available. Dome neutralizes environment. -190 price is steep.","bestAngle":"HOU -190 — PASS (price too steep, Arrighetti unknown)","bestBatter":"Y. Alvarez vs Quintana — LEAN (elite profile vs hittable SP)","bestProp":"Alvarez 2+ TB — LEAN","biggestRisk":"HOU -190 price; Arrighetti no data; Quintana small sample","gameConf":"Low"},
  {"away":"SEA","home":"SD","time":"9:40 PM","awaySP":"Emerson Hancock","homeSP":"Randy Vasquez","spStatus":"Strongly Corroborated","awayLuStatus":"Confirmed","homeLuStatus":"Confirmed","line":"SEA -108","total":"8.0","weather":"65F / wind 9mph L-R","prediction":"SEA","runEnv":"Low","confidence":"Medium","why":"Hancock quality run prevention (xERA 2.39, 87th xwOBA %tile, 86th HH suppression). Vasquez surface ERA (1.02) masks xERA (4.21) — regression candidate. SEA lineup has L. Raley (94th BRL, .470 vs FF) and D. Canzone (83rd BRL). Petco Park + cool weather suppresses offense.","bestAngle":"SEA ML -108 — BET (Hancock real, Vasquez regressing, Petco)","bestBatter":"L. Raley vs Vasquez — LEAN (94th BRL vs regression pitcher)","bestProp":"Under 8.0 — LEAN (Petco, cool, both bullpens strong)","biggestRisk":"SEA lineup has cold bats at top (Raleigh, J-Rod, Naylor)","gameConf":"Medium"},
  {"away":"TEX","home":"ATH","time":"9:40 PM","awaySP":"Kumar Rocker","homeSP":"J.T. Ginn","spStatus":"Strongly Corroborated","awayLuStatus":"Expected","homeLuStatus":"Confirmed","line":"ATH -120","total":"9.5","weather":"70F / wind 8mph","prediction":"ATH","runEnv":"Medium-High","confidence":"Low","why":"Ginn xERA (2.41) and 87th xwOBA %tile back quality profile. Rocker more hittable (xwOBA .321 vs Ginn .250). ATH lineup has Max Muncy (99th HH, .514 vs SL), Langeliers (74th BRL). TEX lineup has power (Burger .640 vs SI, Seager 90th BRL). TEX lineup only Expected.","bestAngle":"ATH -120 — LEAN (Ginn quality edge, Rocker hittable, but TEX LU only Expected)","bestBatter":"J. Burger vs Ginn sinker — LEAN (.640 wOBA vs SI)","bestProp":"Burger 2+ TB — WATCHLIST","biggestRisk":"TEX lineup only Expected; Sutter Health Park inflates offense","gameConf":"Low"},
  {"away":"NYM","home":"LAD","time":"10:00 PM","awaySP":"Clay Holmes","homeSP":"Shohei Ohtani","spStatus":"Strongly Corroborated","awayLuStatus":"Confirmed","homeLuStatus":"Confirmed","line":"LAD -192","total":"8.0","weather":"65F / wind 8mph Out","prediction":"LAD","runEnv":"Low-Medium","confidence":"Medium","why":"Ohtani xERA (2.43), 87th xwOBA %tile, 88th velo — legitimate ace profile. Holmes surface ERA (1.50) masks xERA (3.59) — regression risk vs LAD contact quality. LAD lineup has Freeman (91st BRL), Muncy (99th HH, .613 vs SI), Pages (93rd HH). NYM lineup thin beyond Alvarez. Price at -192 is steep.","bestAngle":"LAD -192 — PASS (price too steep). NYM +1.5 -131 — LEAN (Holmes keeps it close early)","bestBatter":"F. Alvarez vs Ohtani — LEAN (elite power matchup)","bestProp":"Muncy/Freeman 2+ TB vs Holmes sinker — LEAN","biggestRisk":"LAD -192 price; Holmes can limit damage via groundballs despite weak profile","gameConf":"Medium"},
]

OUTLOOK_NAMES: dict[str, tuple[list[list[str]], list[list[str]]]] = {
    "CHC@PHI": ([["Lineups projected — no outlooks"]], [["Lineups projected — no outlooks"]]),
    "KC@DET": ([["Lineups projected — no outlooks"]], [["Lineups projected — no outlooks"]]),
    "SF@CIN": (
        [["C. Schmitt"], ["W. Adames"], ["D. Susac"], ["R. Devers"]],
        [["S. Stewart"], ["E. De La Cruz"], ["S. Steer"]],
    ),
    "WSH@PIT": ([["—"]], [["—"]]),
    "LAA@NYY": (
        [["M. Trout"], ["Z. Neto"], ["J. Adell"], ["B. Rice"], ["A. Judge"]],
        [["M. Trout"], ["Z. Neto"]],
    ),
    "MIA@ATL": (
        [["O. Caissie"], ["O. Lopez"]],
        [["Ronald Acuña Jr."], ["D. Smith"], ["D. Baldwin"], ["M. Olson"]],
    ),
    "TB@CWS": ([["Y. Diaz"], ["J. Caminero"]], [["M. Murakami"]]),
    "TOR@MIL": (
        [["J. Sanchez"], ["V. Guerrero"]],
        [["G. Sanchez"], ["B. Turang"], ["G. Mitchell"]],
    ),
    "COL@HOU": ([["—"]], [["Y. Alvarez"], ["Cam Smith"], ["C. Walker"]]),
    "SEA@SD": ([["L. Raley"], ["D. Canzone"], ["B. Donovan"]], [["R. Laureano"], ["J. Merrill"]]),
    "TEX@ATH": (
        [["J. Burger"], ["C. Seager"], ["E. Carter"]],
        [["M. Muncy"], ["N. Kurtz"], ["S. Langeliers"]],
    ),
    "NYM@LAD": (
        [["F. Alvarez"], ["F. Lindor"]],
        [["M. Muncy"], ["F. Freeman"], ["A. Pages"], ["D. Rushing"]],
    ),
}


def gid(g: dict) -> str:
    return f"{g['away']}@{g['home']}"


def write_games_csv() -> Path:
    p = OUT / "mlb-pregame-intel-apr15-games.csv"
    with p.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([
            "report_date", "away", "home", "start_time_et", "away_sp", "home_sp",
            "away_american", "home_american", "implied_away_pct_nv", "implied_home_pct_nv",
            "model_away_win_pct", "model_home_win_pct", "edge_away_pct", "edge_home_pct",
            "prediction", "decision_tier_vs_market", "edge_on_pick_pct", "model_confidence",
            "missing_data_flags", "analyst_confidence", "rationale_summary",
        ])
        for g in GAMES_SUMMARY:
            gk = gid(g)
            book = BOOK_AMERICAN.get(gk, (100, -110))
            ia, ih = devig_two_way(book[0], book[1])
            ax, hx = GAME_XERA.get(gk, (None, None))
            flags: list[str] = []
            if gk == "COL@HOU" and hx is None:
                flags.append("home SP no Savant")
            if "rain" in g["weather"].lower():
                flags.append("weather risk")
            p_away, p_home, mconf, miss = win_probability_model(
                ax,
                hx,
                g["weather"],
                g["runEnv"],
                g["awayLuStatus"] == "Confirmed",
                g["homeLuStatus"] == "Confirmed",
                flags,
            )
            e_away = (p_away - ia) * 100
            e_home = (p_home - ih) * 100
            pick_home = g["prediction"] == g["home"]
            edge_pick = e_home if pick_home else e_away
            tier = tier_from_edge(edge_pick)
            w.writerow([
                DATE, g["away"], g["home"], g["time"], g["awaySP"], g["homeSP"],
                book[0], book[1], f"{ia*100:.2f}", f"{ih*100:.2f}",
                f"{p_away*100:.2f}", f"{p_home*100:.2f}", f"{e_away:.2f}", f"{e_home:.2f}",
                g["prediction"], tier, f"{edge_pick:.2f}", mconf,
                "; ".join(miss + flags) if miss or flags else "",
                g["confidence"], g["why"][:180],
            ])
    return p


def write_batter_csv() -> Path:
    p = OUT / "mlb-pregame-intel-apr15-batter-outlooks.csv"
    with p.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([
            "report_date", "game", "team", "batter", "opponent_pitcher",
            "hr_prob_pct", "tb2_prob_pct", "fair_hr_american", "fair_2tb_american",
            "market_hr_american", "edge_hr_pct", "tier", "data_confidence",
        ])
        for g in GAMES_SUMMARY:
            gk = gid(g)
            on = OUTLOOK_NAMES.get(gk)
            if not on:
                continue
            ax, hx = GAME_XERA.get(gk, (None, None))
            away_names, home_names = on
            for row in away_names:
                name = row[0]
                if "Lineups" in name or name == "—":
                    continue
                brl, xsl = BATTER_STATS.get((gk, name), (None, None))
                hr, tb2, fh, f2, tier = batter_prop(brl, xsl, hx, g["away"], g["home"])
                dc = "High" if (gk, name) in BATTER_STATS else "Low"
                w.writerow([
                    DATE, gk, g["away"], name, g["homeSP"],
                    f"{hr*100:.2f}", f"{tb2*100:.2f}", fh, f2, "—", "—", tier, dc,
                ])
            for row in home_names:
                name = row[0]
                if "Lineups" in name or name == "—":
                    continue
                brl, xsl = BATTER_STATS.get((gk, name), (None, None))
                hr, tb2, fh, f2, tier = batter_prop(brl, xsl, ax, g["away"], g["home"])
                dc = "High" if (gk, name) in BATTER_STATS else "Low"
                w.writerow([
                    DATE, gk, g["home"], name, g["awaySP"],
                    f"{hr*100:.2f}", f"{tb2*100:.2f}", fh, f2, "—", "—", tier, dc,
                ])
    return p


def esc(s: str) -> str:
    return html_lib.escape(s, quote=True)


def write_html() -> Path:
    p = OUT / "mlb-pregame-intel-apr15-report.html"
    parts: list[str] = []
    parts.append("""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>MLB Probability Export</title>
<style>
body{font-family:system-ui,sans-serif;background:#0f1419;color:#e8eef5;padding:24px;line-height:1.5}
table{border-collapse:collapse;width:100%;font-size:0.85rem;margin:12px 0}
th,td{border:1px solid #2a3a4d;padding:8px;text-align:left}
th{background:#121a26}
h1{font-size:1.4rem}
.meta{color:#8b9cb3;font-size:0.9rem;max-width:900px}
</style></head><body>""")
    parts.append(f"<h1>BLACK SHEEP — Probability Engine ({esc(DATE)})</h1>")
    parts.append(
        '<p class="meta">Win model: 40% starters (Savant xERA) / 20% bullpens (neutral) / 25% lineups '
        "(placeholder when unconfirmed) / 10% park–weather / 5% variance. "
        "Implied = two-way no-vig from Odds API moneylines. Batter props: barrel/xSLG where seeded; else league-average prior (confidence Low). "
        "FanGraphs not used.</p>"
    )
    parts.append("<h2>Games</h2><table><thead><tr>")
    for h in [
        "Game", "Away impl%", "Home impl%", "Model away%", "Model home%",
        "Edge away", "Edge home", "Pick", "Tier", "Edge pick%", "Model conf",
    ]:
        parts.append(f"<th>{esc(h)}</th>")
    parts.append("</tr></thead><tbody>")
    for g in GAMES_SUMMARY:
        gk = gid(g)
        book = BOOK_AMERICAN.get(gk, (100, -110))
        ia, ih = devig_two_way(book[0], book[1])
        ax, hx = GAME_XERA.get(gk, (None, None))
        flags = []
        if gk == "COL@HOU" and hx is None:
            flags.append("home SP no Savant")
        if "rain" in g["weather"].lower():
            flags.append("weather risk")
        p_away, p_home, mconf, miss = win_probability_model(
            ax, hx, g["weather"], g["runEnv"],
            g["awayLuStatus"] == "Confirmed",
            g["homeLuStatus"] == "Confirmed",
            flags,
        )
        e_away = (p_away - ia) * 100
        e_home = (p_home - ih) * 100
        pick_home = g["prediction"] == g["home"]
        edge_pick = e_home if pick_home else e_away
        tier = tier_from_edge(edge_pick)
        parts.append("<tr>")
        for cell in [
            gk,
            f"{ia*100:.1f}",
            f"{ih*100:.1f}",
            f"{p_away*100:.1f}",
            f"{p_home*100:.1f}",
            f"{e_away:.1f}",
            f"{e_home:.1f}",
            g["prediction"],
            tier,
            f"{edge_pick:.1f}",
            mconf,
        ]:
            parts.append(f"<td>{esc(str(cell))}</td>")
        parts.append("</tr>")
    parts.append("</tbody></table>")
    parts.append("<p class='meta'>See mlb-pregame-intel-apr15-batter-outlooks.csv for HR / 2+ TB fair odds.</p></body></html>")
    p.write_text("".join(parts), encoding="utf-8")
    return p


def main() -> None:
    write_games_csv()
    write_batter_csv()
    write_html()
    print("Wrote:", OUT / "mlb-pregame-intel-apr15-games.csv")
    print("Wrote:", OUT / "mlb-pregame-intel-apr15-batter-outlooks.csv")
    print("Wrote:", OUT / "mlb-pregame-intel-apr15-report.html")


if __name__ == "__main__":
    main()
