"""Compute Apr 16 games + props from shared models; update canvas markers + SLATE."""
from __future__ import annotations

import csv
import json
import re
import sys
import urllib.request
from io import StringIO
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from models.apr16_inputs import (  # noqa: E402
    CANVAS_SLUG,
    GAME_SPECS,
    PROP_TARGETS,
    REPORT_DATE,
    make_sp_profile,
)
from models.game_model import (  # noqa: E402
    devig_two_way,
    tier_from_edge,
    win_probability_model,
)
from models.prop_model import batter_hr_two_tb  # noqa: E402

CANVAS = ROOT / "canvases" / f"mlb-pregame-intel-{CANVAS_SLUG}.canvas.tsx"


def fetch_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def pad_lineup_to_model_rows(names: list[str]) -> list[list[str]]:
    """Build 7-column Savant-style rows; metrics default to em dash until props overlay."""
    out: list[list[str]] = []
    for i, name in enumerate(names):
        out.append(
            [
                str(i + 1),
                name,
                "—",
                "—",
                "—",
                "—",
                "—",
            ]
        )
    return out


def merge_prop_features(
    lineup: list[list[str]],
    batter: str,
    brl: float,
    xslg: float,
) -> list[list[str]]:
    lu = [row[:] for row in lineup]
    brl_cell = str(int(round(brl * 100)))
    xslg_cell = f"{xslg:.3f}"
    for i, row in enumerate(lu):
        if len(row) > 1 and row[1] == batter:
            while len(row) < 7:
                row.append("—")
            row[4] = xslg_cell
            row[6] = brl_cell
            lu[i] = row
            return lu
    lu.append(
        [
            "1",
            batter,
            "DH",
            "0.330",
            xslg_cell,
            "40",
            brl_cell,
        ]
    )
    return lu


def fetch_schedule_lineups(date: str) -> dict[str, tuple[list[str], list[str], str, str]]:
    sched = fetch_json(
        f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={date}&hydrate=probablePitcher,lineups,team"
    )
    posted: dict[str, tuple[list[str], list[str], str, str]] = {}
    for block in sched.get("dates", []):
        for g in block.get("games", []):
            away = g["teams"]["away"]["team"]["abbreviation"]
            home = g["teams"]["home"]["team"]["abbreviation"]
            key = f"{away}@{home}"
            pp_a = (g["teams"]["away"].get("probablePitcher") or {}).get("fullName", "TBD")
            pp_h = (g["teams"]["home"].get("probablePitcher") or {}).get("fullName", "TBD")
            lu = g.get("lineups") or {}
            aw = [p["fullName"] for p in lu.get("awayPlayers", [])]
            hm = [p["fullName"] for p in lu.get("homePlayers", [])]
            posted[key] = (aw, hm, pp_a, pp_h)
    return posted


def replace_marker_region(source: str, marker_name: str, csv_text: str) -> str:
    start = f"<!-- {marker_name}:start -->"
    end = f"<!-- {marker_name}:end -->"
    pattern = re.compile(
        re.escape(start) + r"\r?\n" + r".*?" + r"\r?\n" + re.escape(end),
        re.DOTALL,
    )
    replacement = start + "\n" + csv_text + "\n" + end
    new_source, n = pattern.subn(replacement, source, count=1)
    if n != 1:
        raise ValueError(f"Expected one {marker_name} block, found {n}")
    return new_source


def assert_no_comment_breaker(text: str, label: str) -> None:
    if "*/" in text:
        raise ValueError(f"{label} contains */ — refuse to write")


def csv_block(rows: list[list[str]]) -> str:
    buf = StringIO()
    writer = csv.writer(buf, lineterminator="\n")
    writer.writerows(rows)
    return buf.getvalue().strip()


def extract_game_block(text: str, game_key: str) -> tuple[int, int] | None:
    needle = f'gameKey: "{game_key}"'
    i = text.find(needle)
    if i < 0:
        return None
    j = i
    while j > 0 and text[j] != "{":
        j -= 1
    start = j
    depth = 0
    k = start
    while k < len(text):
        if text[k] == "{":
            depth += 1
        elif text[k] == "}":
            depth -= 1
            if depth == 0:
                return (start, k + 1)
        k += 1
    return None


def patch_float_field(block: str, field: str, value: float, decimals: int = 2) -> str:
    return re.sub(rf"({re.escape(field)}:\s*)[\d.+-]+", rf"\g<1>{value:.{decimals}f}", block, count=1)


def patch_string_field(block: str, field: str, value: str) -> str:
    return re.sub(rf'({re.escape(field)}:\s*")([^"]*)(")', rf'\1{value}\3', block, count=1)


def patch_prop_line(
    block: str,
    batter: str,
    team: str,
    hr_pct: float,
    tb2_pct: float,
    tier: str,
) -> tuple[str, bool]:
    batter_pat = re.compile(rf'\bbatter\s*:\s*"{re.escape(batter)}"')
    team_pat = re.compile(rf'\bteam\s*:\s*"{re.escape(team)}"')
    matches = []

    for m in re.finditer(r"\{[^{}]*\}", block, re.DOTALL):
        obj = m.group(0)
        if batter_pat.search(obj) and team_pat.search(obj):
            matches.append(m)

    if len(matches) != 1:
        return block, False

    start, end = matches[0].span()
    prop_obj = block[start:end]
    updated_obj = patch_float_field(prop_obj, "hrPct", hr_pct, decimals=1)
    updated_obj = patch_float_field(updated_obj, "tb2Pct", tb2_pct, decimals=1)
    updated_obj = patch_string_field(updated_obj, "tier", tier)
    return block[:start] + updated_obj + block[end:], True


def run_apr16_pipeline(canvas_path: Path | None = None) -> None:
    path = canvas_path or CANVAS
    if not path.is_file():
        raise FileNotFoundError(path)

    api = fetch_schedule_lineups(REPORT_DATE)
    games_rows: list[list[str]] = [
        [
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
    ]

    computed_games: list[dict[str, Any]] = []

    for spec in GAME_SPECS:
        key = f"{spec['away']}@{spec['home']}"
        aw_n, hm_n, pp_a, pp_h = api.get(key, ([], [], "TBD", "TBD"))
        away_lu = pad_lineup_to_model_rows(aw_n) if aw_n else []
        home_lu = pad_lineup_to_model_rows(hm_n) if hm_n else []

        away_prof = make_sp_profile(float(spec["away_xera"]))
        home_prof = make_sp_profile(float(spec["home_xera"]))

        p_away, p_home, mconf, miss = win_probability_model(
            away_lu,
            home_lu,
            away_prof,
            home_prof,
            str(spec["weather"]),
            str(spec["run_env"]),
        )
        ia, ih = devig_two_way(float(spec["away_a"]), float(spec["home_a"]))
        imp_a, imp_h = ia * 100, ih * 100
        ma, mh = p_away * 100, p_home * 100
        ea, eh = ma - imp_a, mh - imp_h
        pred = spec["away"] if p_away > p_home else spec["home"]
        edge_pick = ea if pred == spec["away"] else eh
        tier = tier_from_edge(edge_pick)
        extra = list(spec.get("extra_flags", []))
        flag_parts = extra + miss
        flags = ";".join(flag_parts)

        games_rows.append(
            [
                REPORT_DATE,
                spec["away"],
                spec["home"],
                spec["time_et"],
                pp_a,
                pp_h,
                str(spec["away_a"]),
                str(spec["home_a"]),
                f"{imp_a:.2f}",
                f"{imp_h:.2f}",
                f"{ma:.2f}",
                f"{mh:.2f}",
                f"{ea:.2f}",
                f"{eh:.2f}",
                pred,
                tier,
                f"{edge_pick:.2f}",
                mconf,
                flags,
                str(spec["analyst_confidence"]),
                str(spec["rationale"]).replace("\n", " "),
            ]
        )
        computed_games.append(
            {
                "gameKey": key,
                "impliedAwayPct": imp_a,
                "impliedHomePct": imp_h,
                "modelAwayPct": ma,
                "modelHomePct": mh,
                "edgeAwayPct": ea,
                "edgeHomePct": eh,
                "prediction": pred,
                "decisionTier": tier,
                "edgeOnPickPct": edge_pick,
                "modelConfidence": mconf,
                "flags": flags,
            }
        )

    batter_header = [
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
    batter_rows: list[list[str]] = [batter_header]

    prop_results: list[dict[str, Any]] = []

    for p in PROP_TARGETS:
        gk = p["game"]
        spec = next(s for s in GAME_SPECS if f"{s['away']}@{s['home']}" == gk)
        away, home = spec["away"], spec["home"]
        away_prof = make_sp_profile(float(spec["away_xera"]))
        home_prof = make_sp_profile(float(spec["home_xera"]))
        aw_n, hm_n, pp_a, pp_h = api.get(gk, ([], [], "TBD", "TBD"))
        away_lu = pad_lineup_to_model_rows(aw_n) if aw_n else []
        home_lu = pad_lineup_to_model_rows(hm_n) if hm_n else []
        team_is_away = p["team"] == away
        lu = away_lu if team_is_away else home_lu
        lu_m = merge_prop_features(lu, p["batter"], float(p["brl"]), float(p["xslg"]))
        opp_prof = home_prof if team_is_away else away_prof
        opp_name = pp_h if team_is_away else pp_a
        hr, tb2, fair_hr, fair_2tb, tier, pconf = batter_hr_two_tb(
            away,
            home,
            team_is_away,
            p["batter"],
            lu_m,
            opp_prof,
            batter_hand=str(p.get("bh") or ""),
            pitcher_hand=str(p.get("ph") or ""),
        )
        dc = f"{pconf} — model+features"
        batter_rows.append(
            [
                REPORT_DATE,
                gk,
                p["team"],
                p["batter"],
                opp_name,
                f"{hr * 100:.2f}",
                f"{tb2 * 100:.2f}",
                fair_hr,
                fair_2tb,
                "NA",
                "0.00",
                tier,
                dc,
            ]
        )
        prop_results.append(
            {
                "gameKey": gk,
                "team": p["team"],
                "batter": p["batter"],
                "hrPct": hr * 100,
                "tb2Pct": tb2 * 100,
                "tier": tier,
            }
        )

    gcsv = csv_block(games_rows)
    bcsv = csv_block(batter_rows)
    assert_no_comment_breaker(gcsv, "games CSV")
    assert_no_comment_breaker(bcsv, "batter outlooks CSV")

    original = path.read_text(encoding="utf-8")
    updated = replace_marker_region(original, "games-csv", gcsv)
    updated = replace_marker_region(updated, "batter-outlooks-csv", bcsv)

    for cg in computed_games:
        span = extract_game_block(updated, cg["gameKey"])
        if not span:
            raise ValueError(f"Missing SLATE game block for {cg['gameKey']}")
        a, b = span
        block = updated[a:b]
        block = patch_float_field(block, "impliedAwayPct", cg["impliedAwayPct"])
        block = patch_float_field(block, "impliedHomePct", cg["impliedHomePct"])
        block = patch_float_field(block, "modelAwayPct", cg["modelAwayPct"])
        block = patch_float_field(block, "modelHomePct", cg["modelHomePct"])
        block = patch_float_field(block, "edgeAwayPct", cg["edgeAwayPct"])
        block = patch_float_field(block, "edgeHomePct", cg["edgeHomePct"])
        block = patch_string_field(block, "prediction", cg["prediction"])
        block = patch_string_field(block, "decisionTier", cg["decisionTier"])
        block = patch_float_field(block, "edgeOnPickPct", cg["edgeOnPickPct"])
        block = patch_string_field(block, "modelConfidence", cg["modelConfidence"])
        block = patch_string_field(block, "flags", cg["flags"])
        updated = updated[:a] + block + updated[b:]

    for pr in prop_results:
        span = extract_game_block(updated, pr["gameKey"])
        if not span:
            continue
        a, b = span
        block = updated[a:b]
        nb, matched = patch_prop_line(
            block,
            pr["batter"],
            pr["team"],
            pr["hrPct"],
            pr["tb2Pct"],
            pr["tier"],
        )
        if not matched:
            raise ValueError(f"Failed to patch prop for {pr['gameKey']} {pr['team']} {pr['batter']}")
        updated = updated[:a] + nb + updated[b:]

    path.write_text(updated, encoding="utf-8")
    print("Updated model-driven markers + SLATE:", path)
