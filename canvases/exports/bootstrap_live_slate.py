#!/usr/bin/env python3
"""Generate a date-specific input module + canvas scaffold from live schedule and odds."""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
EXPORTS_DIR = Path(__file__).resolve().parent
for path in (ROOT, EXPORTS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from apr16_compute import fetch_schedule_lineups  # noqa: E402
from live_mlb_data import fetch_live_game_odds  # noqa: E402

TEMPLATE_CANVAS = ROOT / "canvases" / "mlb-pregame-intel-apr19.canvas.tsx"
MODELS_DIR = ROOT / "models"
CANVAS_DIR = ROOT / "canvases"
ET = ZoneInfo("America/New_York")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bootstrap a dated live MLB slate scaffold from schedule + live odds."
    )
    parser.add_argument(
        "--date",
        required=True,
        help="Date selector in YYYY-MM-DD format.",
    )
    parser.add_argument(
        "--include-live",
        action="store_true",
        help="Include in-progress games when odds are available.",
    )
    parser.add_argument(
        "--include-final",
        action="store_true",
        help="Include final games for full-day schedule coverage even when odds are unavailable.",
    )
    return parser.parse_args()


def resolve_slug(date_str: str) -> str:
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.strftime("%b").lower() + str(dt.day)


def format_time_et(game_date_utc: str) -> str:
    dt = datetime.fromisoformat(game_date_utc.replace("Z", "+00:00")).astimezone(ET)
    return dt.strftime("%I:%M %p").lstrip("0")


def component_name_for_slug(slug: str) -> str:
    return "".join(part.capitalize() for part in re.findall(r"[a-z]+|\d+", slug)) + "Canvas"


def human_date(date_str: str) -> str:
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.strftime("%b %d, %Y").replace(" 0", " ")


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def build_specs(date_str: str, *, include_live: bool, include_final: bool) -> list[dict[str, object]]:
    schedule_games = fetch_schedule_lineups(date_str)
    live_odds = fetch_live_game_odds(schedule_games, date_str, required=False)
    specs: list[dict[str, object]] = []
    for game_key, game in sorted(
        schedule_games.items(),
        key=lambda item: item[1].get("game_date_utc") or "",
    ):
        bucket = str(game.get("game_status_bucket") or "").strip().lower()
        if bucket == "final" and not include_final:
            continue
        if bucket == "live" and not include_live:
            continue
        odds = live_odds.get(game_key)
        if bucket == "pregame" and (odds is None or odds.away_moneyline is None or odds.home_moneyline is None):
            continue
        away, home = game_key.split("@", 1)
        away_pitcher = str((game.get("away_pitcher") or {}).get("name") or "TBD")
        home_pitcher = str((game.get("home_pitcher") or {}).get("name") or "TBD")
        flags = ["auto_scaffold_live_odds"]
        if odds is None or odds.away_moneyline is None or odds.home_moneyline is None:
            flags.append("market_odds_unavailable")
        if away_pitcher == "TBD" or home_pitcher == "TBD":
            flags.append("probable_pitcher_missing")
        analyst_confidence = "Low" if "probable_pitcher_missing" in flags else "Medium"
        rationale = (
            f"Auto-generated live scaffold from MLB schedule + market odds: {away_pitcher} vs {home_pitcher}. "
            "Run compute to refresh lineups, weather, and model outputs before staking."
        )
        specs.append(
            {
                "away": away,
                "home": home,
                "time_et": format_time_et(str(game.get("game_date_utc") or "")),
                "away_a": int(odds.away_moneyline) if odds and odds.away_moneyline is not None else None,
                "home_a": int(odds.home_moneyline) if odds and odds.home_moneyline is not None else None,
                "weather": "Live weather via compute",
                "run_env": "Medium",
                "away_xera": 4.15,
                "home_xera": 4.15,
                "analyst_confidence": analyst_confidence,
                "rationale": rationale,
                "extra_flags": flags,
            }
        )
    return specs


def emit_inputs_module(date_str: str, slug: str, specs: list[dict[str, object]]) -> str:
    lines = [
        f'"""Auto-generated {human_date(date_str)} slate scaffold from live schedule + odds."""',
        "",
        "from __future__ import annotations",
        "",
        f'REPORT_DATE = "{date_str}"',
        f'CANVAS_SLUG = "{slug}"',
        "",
        "",
        "def make_sp_profile(xera: float) -> list[list[str]]:",
        '    """Minimal Baseball Savant-style table; xERA is parsed by game_model.parse_xera."""',
        "    return [",
        '        ["ERA / xERA", f"4.60 / {xera:.2f}"],',
        '        ["xwOBA allowed", ".335"],',
        '        ["K%tile", "52"],',
        '        ["Whiff%tile", "48"],',
        '        ["Chase%tile", "52"],',
        '        ["Top pitch", "Mix / multi"],',
        "    ]",
        "",
        "",
        "GAME_SPECS: list[dict] = [",
    ]
    for spec in specs:
        lines.extend(
            [
                "    {",
                f'        "away": "{spec["away"]}",',
                f'        "home": "{spec["home"]}",',
                f'        "time_et": "{spec["time_et"]}",',
                f'        "away_a": {repr(spec["away_a"])},',
                f'        "home_a": {repr(spec["home_a"])},',
                f'        "weather": "{spec["weather"]}",',
                f'        "run_env": "{spec["run_env"]}",',
                f'        "away_xera": {float(spec["away_xera"]):.2f},',
                f'        "home_xera": {float(spec["home_xera"]):.2f},',
                f'        "analyst_confidence": "{spec["analyst_confidence"]}",',
                f'        "rationale": {json.dumps(str(spec["rationale"]), ensure_ascii=False)},',
                f'        "extra_flags": {json.dumps(list(spec["extra_flags"]))},',
                "    },",
            ]
        )
    lines.append("]")
    lines.append("")
    return "\n".join(lines)


def emit_slate(specs: list[dict[str, object]], date_str: str) -> str:
    parts: list[str] = ["const SLATE: SlateGame[] = ["]
    for spec in specs:
        away = str(spec["away"])
        home = str(spec["home"])
        key = f"{away}@{home}"
        rationale = str(spec["rationale"]).replace("\n", " ")
        flags = ";".join(spec.get("extra_flags", []))
        away_a_literal = "null" if spec["away_a"] is None else str(int(spec["away_a"]))
        home_a_literal = "null" if spec["home_a"] is None else str(int(spec["home_a"]))
        parts.extend(
            [
                "  {",
                f"    gameKey: {ts_string(key)},",
                '    venue: "MLB Park",',
                f"    away: {ts_string(away)},",
                f"    home: {ts_string(home)},",
                f"    timeEt: {ts_string(str(spec['time_et']))},",
                '    gameStatusBucket: "pregame",',
                '    gameState: "Yet To Begin",',
                '    gameStateDetail: "Pre-Game",',
                '    gameStatusNote: "Yet to begin",',
                "    awayScore: null,",
                "    homeScore: null,",
                '    awaySp: "TBD",',
                '    homeSp: "TBD",',
                f"    awayAmerican: {away_a_literal},",
                f"    homeAmerican: {home_a_literal},",
                "    impliedAwayPct: 50.0,",
                "    impliedHomePct: 50.0,",
                "    modelAwayPct: 50.0,",
                "    modelHomePct: 50.0,",
                "    edgeAwayPct: 0.0,",
                "    edgeHomePct: 0.0,",
                f"    prediction: {ts_string(home)},",
                '    decisionTier: "C",',
                "    edgeOnPickPct: 0.0,",
                '    modelConfidence: "Medium",',
                f"    analystConfidence: {ts_string(str(spec['analyst_confidence']))},",
                f"    flags: {ts_string(flags)},",
                f"    rationale: {ts_string(rationale)},",
                '    awayLuLabel: "Projected — run compute",',
                '    homeLuLabel: "Projected — run compute",',
                "    awayLineup: [],",
                "    homeLineup: [],",
                f'    spAwayNotes: [{ts_string(f"Auto-generated {date_str} scaffold — run compute for live probable + stats.")}],',
                '    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],',
                '    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],',
                "    propsAway: [],",
                "    propsHome: [],",
                "  },",
            ]
        )
    parts.append("];")
    return "\n".join(parts)


def export_marker_block() -> str:
    return """
/*
<!-- games-csv:start -->
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,game_status_bucket,game_state,game_state_detail,game_status_note,away_score,home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,raw_model_away_win_pct,raw_model_home_win_pct,final_away_win_pct,final_home_win_pct,market_blend_alpha,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary,scoring_status
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status,scoring_status
<!-- batter-outlooks-csv:end -->
*/
""".strip()


def write_canvas(date_str: str, slug: str, specs: list[dict[str, object]]) -> Path:
    text = TEMPLATE_CANVAS.read_text(encoding="utf-8")
    head, rest = text.split("const SLATE: SlateGame[] = [", 1)
    _old_slate, tail = rest.split("];\n\nconst ACTIONABLE_EDGE_PCT", 1)
    new_body = emit_slate(specs, date_str) + "\n\nconst ACTIONABLE_EDGE_PCT" + tail
    new_body = new_body.replace("Apr19Canvas", component_name_for_slug(slug))
    new_body = new_body.replace("Apr 19, 2026", human_date(date_str))
    new_body = new_body.replace("2026-04-19", date_str)
    new_body = new_body.replace("apr19", slug)
    marker_pattern = re.compile(
        r"/\*\s*<!-- games-csv:start -->.*?<!-- batter-outlooks-csv:end -->\s*\*/",
        flags=re.DOTALL,
    )
    if marker_pattern.search(new_body):
        new_body = marker_pattern.sub(export_marker_block(), new_body, count=1)
    elif "/*\nExport marker blocks" in new_body:
        pre, _post = new_body.split("/*\nExport marker blocks", 1)
        new_body = pre.rstrip() + "\n" + export_marker_block() + "\n"
    out_path = CANVAS_DIR / f"mlb-pregame-intel-{slug}.canvas.tsx"
    out_path.write_text(head + new_body, encoding="utf-8")
    return out_path


def main() -> None:
    args = parse_args()
    slug = resolve_slug(args.date)
    specs = build_specs(args.date, include_live=args.include_live, include_final=args.include_final)
    if not specs:
        raise SystemExit("No eligible non-final games with live odds were found for this date.")
    input_path = MODELS_DIR / f"{slug}_inputs.py"
    input_path.write_text(emit_inputs_module(args.date, slug, specs), encoding="utf-8")
    canvas_path = write_canvas(args.date, slug, specs)
    print(f"Wrote {input_path}")
    print(f"Wrote {canvas_path}")
    print(f"Games scaffolded: {len(specs)}")


if __name__ == "__main__":
    main()
