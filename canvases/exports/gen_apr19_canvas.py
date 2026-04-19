#!/usr/bin/env python3
"""One-shot: build mlb-pregame-intel-apr19.canvas.tsx from GAME_SPECS + Apr 16 UI tail."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from models.apr19_inputs import GAME_SPECS  # noqa: E402

VENUES: dict[str, str] = {
    "NYY": "Yankee Stadium",
    "MIN": "Target Field",
    "CHC": "Wrigley Field",
    "PIT": "PNC Park",
    "WSH": "Nationals Park",
    "ATH": "Sutter Health Park",
    "BOS": "Fenway Park",
    "MIA": "loanDepot park",
    "CLE": "Progressive Field",
    "HOU": "Daikin Park",
    "SEA": "T-Mobile Park",
    "PHI": "Citizens Bank Park",
    "COL": "Coors Field",
    "AZ": "Chase Field",
    "LAA": "Angel Stadium",
}


def ts_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_slate() -> str:
    parts: list[str] = ["const SLATE: SlateGame[] = ["]
    for spec in GAME_SPECS:
        away = spec["away"]
        home = spec["home"]
        key = f"{away}@{home}"
        venue = VENUES.get(home, "MLB Park")
        rationale = str(spec["rationale"]).replace("\n", " ")
        parts.append("  {")
        parts.append(f'    gameKey: {ts_string(key)},')
        parts.append(f'    venue: {ts_string(venue)},')
        parts.append(f'    away: {ts_string(away)},')
        parts.append(f'    home: {ts_string(home)},')
        parts.append(f'    timeEt: {ts_string(spec["time_et"])},')
        parts.append('    gameStatusBucket: "pregame",')
        parts.append('    gameState: "Yet To Begin",')
        parts.append('    gameStateDetail: "Pre-Game",')
        parts.append('    gameStatusNote: "Yet to begin",')
        parts.append("    awayScore: null,")
        parts.append("    homeScore: null,")
        parts.append('    awaySp: "TBD",')
        parts.append('    homeSp: "TBD",')
        parts.append(f'    awayAmerican: {int(spec["away_a"])},')
        parts.append(f'    homeAmerican: {int(spec["home_a"])},')
        parts.append("    impliedAwayPct: 50.0,")
        parts.append("    impliedHomePct: 50.0,")
        parts.append("    modelAwayPct: 50.0,")
        parts.append("    modelHomePct: 50.0,")
        parts.append("    edgeAwayPct: 0.0,")
        parts.append("    edgeHomePct: 0.0,")
        parts.append(f'    prediction: {ts_string(home)},')
        parts.append('    decisionTier: "C",')
        parts.append("    edgeOnPickPct: 0.0,")
        parts.append('    modelConfidence: "Medium",')
        parts.append(f'    analystConfidence: {ts_string(str(spec["analyst_confidence"]))},')
        parts.append(f'    flags: {ts_string(";".join(spec.get("extra_flags", [])))},')
        parts.append(f'    rationale: {ts_string(rationale)},')
        parts.append('    awayLuLabel: "Projected — run compute",')
        parts.append('    homeLuLabel: "Projected — run compute",')
        parts.append("    awayLineup: [],")
        parts.append("    homeLineup: [],")
        parts.append(
            "    spAwayNotes: ["
            '"Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."'
            "],"
        )
        parts.append(
            "    spHomeNotes: ["
            '"Home starter matchup — verify pitch mix vs lineup handedness before staking a side."'
            "],"
        )
        parts.append(
            "    matchupBullets: ["
            f'"Park: {venue}. Weather/run environment from inputs: {spec.get("weather", "")} / {spec.get("run_env", "")}."'
            "],"
        )
        parts.append("    propsAway: [],")
        parts.append("    propsHome: [],")
        parts.append("  },")
    parts.append("];")
    return "\n".join(parts)


def main() -> None:
    apr16_path = ROOT / "canvases" / "mlb-pregame-intel-apr16.canvas.tsx"
    out_path = ROOT / "canvases" / "mlb-pregame-intel-apr19.canvas.tsx"
    text = apr16_path.read_text(encoding="utf-8")
    head, rest = text.split("const SLATE: SlateGame[] = [", 1)
    _old_slate, tail = rest.split("];\n\nconst ACTIONABLE_EDGE_PCT", 1)
    new_body = emit_slate() + "\n\nconst ACTIONABLE_EDGE_PCT" + tail
    new_body = new_body.replace("Apr16Canvas", "Apr19Canvas")
    new_body = new_body.replace("Apr 16, 2026", "Apr 19, 2026")
    new_body = new_body.replace("2026-04-16", "2026-04-19")
    new_body = new_body.replace(
        "Probables and posted lineups from MLB Stats API where available; late games show\n"
        "        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live\n"
        "        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-16",
        "Apr 19 slate scaffold — run model refresh: python3 canvases/exports/build_ml_exports.py --date 2026-04-19 --compute --allow-partial\n"
        "        (pulls probables/lineups from MLB Stats API + Savant, updates SLATE + CSV markers). Moneylines in inputs are approximate.",
    )
    marker = """
/*
<!-- games-csv:start -->
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,game_status_bucket,game_state,game_state_detail,game_status_note,away_score,home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status
<!-- batter-outlooks-csv:end -->
*/
"""
    if "/*\nExport marker blocks" in new_body:
        pre, _post = new_body.split("/*\nExport marker blocks", 1)
        new_body = pre.rstrip() + "\n" + marker + "\n"
    else:
        new_body = new_body.rstrip() + "\n" + marker + "\n"

    out = head + new_body
    out_path.write_text(out, encoding="utf-8")
    print("Wrote", out_path)


if __name__ == "__main__":
    main()
