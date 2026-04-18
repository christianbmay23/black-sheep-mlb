"""Compute dated slate games + props from shared models; update canvas markers + SLATE."""
from __future__ import annotations

import csv
import importlib
import json
import re
import sys
import urllib.parse
import urllib.request
from collections.abc import Callable
from io import StringIO
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from models.game_model import (  # noqa: E402
    clamp,
    devig_two_way,
    tier_from_edge,
    win_probability_model,
)
from models.prop_model import batter_hr_two_tb, lineup_match_key  # noqa: E402

GAME_SPECS: list[dict[str, Any]] = []
REPORT_DATE = ""
CANVAS: Path = ROOT / "canvases" / "mlb-pregame-intel-apr16.canvas.tsx"


def _make_sp_profile_unbound(_x: float) -> list[list[str]]:
    raise RuntimeError("bind_slate_inputs() must run before model pipeline")


make_sp_profile: Callable[[float], list[list[str]]] = _make_sp_profile_unbound

SAVANT_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "text/csv,text/html;q=0.9,*/*;q=0.8",
}


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_csv_rows(url: str) -> list[dict[str, str]]:
    req = urllib.request.Request(url, headers=SAVANT_HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        text = r.read().decode("utf-8-sig", "ignore")
    return list(csv.DictReader(StringIO(text)))


def parse_float(value: Any) -> float | None:
    if value in {None, "", "—"}:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        if text.startswith("."):
            try:
                return float(f"0{text}")
            except ValueError:
                return None
    return None


def parse_int(value: Any) -> int | None:
    if value in {None, "", "—"}:
        return None
    try:
        return int(str(value).strip())
    except ValueError:
        return None


def fetch_schedule_lineups(date: str) -> dict[str, dict[str, Any]]:
    sched = fetch_json(
        f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={date}&hydrate=probablePitcher,lineups,team"
    )
    posted: dict[str, dict[str, Any]] = {}
    for block in sched.get("dates", []):
        for g in block.get("games", []):
            away = g["teams"]["away"]["team"]["abbreviation"]
            home = g["teams"]["home"]["team"]["abbreviation"]
            key = f"{away}@{home}"
            away_team = g["teams"]["away"]["team"]
            home_team = g["teams"]["home"]["team"]
            pp_a = g["teams"]["away"].get("probablePitcher") or {}
            pp_h = g["teams"]["home"].get("probablePitcher") or {}
            lu = g.get("lineups") or {}
            aw = [
                {
                    "order": idx + 1,
                    "id": p.get("id"),
                    "name": p.get("fullName", ""),
                    "pos": (p.get("primaryPosition") or {}).get("abbreviation", ""),
                }
                for idx, p in enumerate(lu.get("awayPlayers", []))
            ]
            hm = [
                {
                    "order": idx + 1,
                    "id": p.get("id"),
                    "name": p.get("fullName", ""),
                    "pos": (p.get("primaryPosition") or {}).get("abbreviation", ""),
                }
                for idx, p in enumerate(lu.get("homePlayers", []))
            ]
            posted[key] = {
                "away_team_id": away_team.get("id"),
                "home_team_id": home_team.get("id"),
                "away_players": aw,
                "home_players": hm,
                "away_pitcher": {
                    "id": pp_a.get("id"),
                    "name": pp_a.get("fullName", "TBD"),
                },
                "home_pitcher": {
                    "id": pp_h.get("id"),
                    "name": pp_h.get("fullName", "TBD"),
                },
            }
    return posted


def fetch_people_map(person_ids: set[int], season: str) -> dict[int, dict[str, Any]]:
    out: dict[int, dict[str, Any]] = {}
    ids = sorted(pid for pid in person_ids if pid)
    for start in range(0, len(ids), 40):
        chunk = ids[start : start + 40]
        if not chunk:
            continue
        url = (
            "https://statsapi.mlb.com/api/v1/people"
            f"?personIds={','.join(str(pid) for pid in chunk)}"
            f"&hydrate=stats(group=[hitting,pitching],type=[season],season={season})"
        )
        data = fetch_json(url)
        for person in data.get("people", []):
            out[person["id"]] = person
    return out


def extract_group_stats(person: dict[str, Any], group_name: str) -> dict[str, Any]:
    want = group_name.lower()
    for block in person.get("stats", []):
        group = (block.get("group") or {}).get("displayName", "").lower()
        if group != want:
            continue
        splits = block.get("splits") or []
        if splits:
            return splits[0].get("stat") or {}
    return {}


def fetch_savant_expected_stats(kind: str, year: str) -> dict[int, dict[str, Any]]:
    rows = fetch_csv_rows(
        f"https://baseballsavant.mlb.com/leaderboard/expected_statistics?type={kind}&year={year}&csv=true"
    )
    out: dict[int, dict[str, Any]] = {}
    for row in rows:
        pid = parse_int(row.get("player_id"))
        if pid is None:
            continue
        out[pid] = {
            "est_ba": parse_float(row.get("est_ba")),
            "est_slg": parse_float(row.get("est_slg")),
            "xera": parse_float(row.get("xera")),
            "slg": parse_float(row.get("slg")),
            "era": parse_float(row.get("era")),
        }
    return out


def fetch_savant_statcast(kind: str, year: str) -> dict[int, dict[str, Any]]:
    rows = fetch_csv_rows(
        f"https://baseballsavant.mlb.com/leaderboard/statcast?type={kind}&year={year}&csv=true"
    )
    out: dict[int, dict[str, Any]] = {}
    for row in rows:
        pid = parse_int(row.get("player_id"))
        if pid is None:
            continue
        out[pid] = {
            "attempts": parse_int(row.get("attempts")),
            "avg_hit_speed": parse_float(row.get("avg_hit_speed")),
            "ev95percent": (parse_float(row.get("ev95percent")) or 0.0) / 100 if row.get("ev95percent") not in {None, ""} else None,
            "brl_percent": (parse_float(row.get("brl_percent")) or 0.0) / 100 if row.get("brl_percent") not in {None, ""} else None,
            "brl_pa": (parse_float(row.get("brl_pa")) or 0.0) / 100 if row.get("brl_pa") not in {None, ""} else None,
        }
    return out


def fetch_team_rosters(team_ids: dict[str, int], season: str) -> dict[str, dict[str, dict[str, Any]]]:
    rosters: dict[str, dict[str, dict[str, Any]]] = {}
    for abbr, team_id in team_ids.items():
        lookup: dict[str, dict[str, Any]] = {}
        for roster_type in ("active", "40Man"):
            data = fetch_json(
                f"https://statsapi.mlb.com/api/v1/teams/{team_id}/roster?season={season}&rosterType={roster_type}"
            )
            for row in data.get("roster", []):
                person = row.get("person") or {}
                name = person.get("fullName")
                pid = person.get("id")
                if not name or not pid:
                    continue
                lookup.setdefault(
                    lineup_match_key(name),
                    {
                        "id": pid,
                        "name": name,
                        "pos": (row.get("position") or {}).get("abbreviation", ""),
                    },
                )
        rosters[abbr] = lookup
    return rosters


def search_player(name: str) -> dict[str, Any] | None:
    url = f"https://statsapi.mlb.com/api/v1/people/search?names={urllib.parse.quote(name)}"
    data = fetch_json(url)
    people = data.get("people") or []
    if not people:
        return None
    person = people[0]
    return {
        "id": person.get("id"),
        "name": person.get("fullName", name),
        "pos": (person.get("primaryPosition") or {}).get("abbreviation", ""),
    }


def aggregate_vs_pitcher_block(stats_blocks: list[dict[str, Any]], pitcher_id: int) -> dict[str, int] | None:
    for block in stats_blocks:
        stat_type = ((block.get("type") or {}).get("displayName") or "").lower()
        group = ((block.get("group") or {}).get("displayName") or "").lower()
        if stat_type != "vsplayer" or group != "hitting":
            continue
        totals = {"pa": 0, "ab": 0, "hits": 0, "home_runs": 0, "total_bases": 0}
        for split in block.get("splits") or []:
            pitcher = split.get("pitcher") or {}
            if parse_int(pitcher.get("id")) != pitcher_id:
                continue
            stat = split.get("stat") or {}
            totals["pa"] += parse_int(stat.get("plateAppearances")) or 0
            totals["ab"] += parse_int(stat.get("atBats")) or 0
            totals["hits"] += parse_int(stat.get("hits")) or 0
            totals["home_runs"] += parse_int(stat.get("homeRuns")) or 0
            totals["total_bases"] += parse_int(stat.get("totalBases")) or 0
        return totals if totals["pa"] > 0 else None
    return None


def fetch_vs_pitcher_stats(matchups: dict[int, set[int]]) -> dict[tuple[int, int], dict[str, int]]:
    out: dict[tuple[int, int], dict[str, int]] = {}
    for pitcher_id, batter_ids in matchups.items():
        batters = sorted(pid for pid in batter_ids if pid)
        for start in range(0, len(batters), 25):
            chunk = batters[start : start + 25]
            if not chunk:
                continue
            url = (
                "https://statsapi.mlb.com/api/v1/people"
                f"?personIds={','.join(str(pid) for pid in chunk)}"
                f"&hydrate=stats(group=[hitting],type=[vsPlayer],opposingPlayerId={pitcher_id})"
            )
            data = fetch_json(url)
            for person in data.get("people", []):
                batter_id = parse_int(person.get("id"))
                if batter_id is None:
                    continue
                totals = aggregate_vs_pitcher_block(person.get("stats") or [], pitcher_id)
                if totals is not None:
                    out[(batter_id, pitcher_id)] = totals
    return out


def render_json_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def lineup_quality_score(features: dict[str, Any]) -> float:
    est_ba = features.get("est_ba")
    xslg = features.get("xslg")
    barrel_rate = features.get("barrel_rate")
    ev95_rate = features.get("ev95_rate")
    score = 0.44
    if est_ba is not None:
        score += (est_ba - 0.245) * 1.2
    if xslg is not None:
        score += (xslg - 0.4) * 0.8
    if barrel_rate is not None:
        score += (barrel_rate - 0.08) * 1.6
    if ev95_rate is not None:
        score += (ev95_rate - 0.35) * 0.5
    return clamp(score, 0.18, 0.95)


def build_model_lineup(players: list[dict[str, Any]], batter_features: dict[int, dict[str, Any]]) -> list[list[str]]:
    out: list[list[str]] = []
    for idx, player in enumerate(players):
        feats = batter_features.get(player["id"], {})
        est_ba = feats.get("est_ba")
        xslg = feats.get("xslg")
        obp = feats.get("obp")
        power_score = lineup_quality_score(feats)
        out.append(
            [
                str(idx + 1),
                player["name"],
                player.get("pos") or "DH",
                f"{est_ba:.3f}" if est_ba is not None else "—",
                f"{xslg:.3f}" if xslg is not None else "—",
                f"{obp:.3f}" if obp is not None else "—",
                str(int(round(power_score * 100))),
            ]
        )
    return out


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


def find_field_array_span(block: str, field: str) -> tuple[int, int] | None:
    needle = f"{field}:"
    start = block.find(needle)
    if start < 0:
        return None
    arr_start = block.find("[", start)
    if arr_start < 0:
        return None
    depth = 0
    for idx in range(arr_start, len(block)):
        ch = block[idx]
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return arr_start, idx + 1
    return None


def parse_lineup_rows(block: str, field: str) -> list[dict[str, Any]]:
    span = find_field_array_span(block, field)
    if not span:
        return []
    out: list[dict[str, Any]] = []
    for order, name, pos in re.findall(r'\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]', block[span[0] : span[1]]):
        out.append(
            {
                "order": parse_int(order) or (len(out) + 1),
                "name": name,
                "pos": pos,
            }
        )
    return out


def parse_canvas_games(source: str) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        span = extract_game_block(source, game_key)
        if not span:
            continue
        block = source[span[0] : span[1]]
        away_label = re.search(r'awayLuLabel:\s*"([^"]+)"', block)
        home_label = re.search(r'homeLuLabel:\s*"([^"]+)"', block)
        out[game_key] = {
            "away_label": away_label.group(1) if away_label else "Projected (canvas fallback)",
            "home_label": home_label.group(1) if home_label else "Projected (canvas fallback)",
            "away_lineup": parse_lineup_rows(block, "awayLineup"),
            "home_lineup": parse_lineup_rows(block, "homeLineup"),
        }
    return out


def replace_array_field(block: str, field: str, rendered_array: str) -> str:
    span = find_field_array_span(block, field)
    if not span:
        raise ValueError(f"Missing {field} array")
    return block[: span[0]] + rendered_array + block[span[1] :]


def render_lineup_rows(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return "[]"
    pieces = ["["]
    for row in rows:
        pieces.append(
            "\n      ["
            f"{render_json_string(str(row['order']))}, "
            f"{render_json_string(row['name'])}, "
            f"{render_json_string(row['pos'])}"
            "],"
        )
    pieces.append("\n    ]")
    return "".join(pieces)


def render_prop_rows(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return "[]"
    pieces = ["["]
    for row in rows:
        pieces.append(
            "\n      { "
            f'batter: {render_json_string(row["batter"])}, '
            f'team: {render_json_string(row["team"])}, '
            f'hrPct: {row["hrPct"]:.1f}, '
            f'tb2Pct: {row["tb2Pct"]:.1f}, '
            f'tier: {render_json_string(row["tier"])}, '
            f'note: {render_json_string(row["note"])}'
            " },"
        )
    pieces.append("\n    ]")
    return "".join(pieces)


def patch_float_field(block: str, field: str, value: float, decimals: int = 2) -> str:
    return re.sub(rf"({re.escape(field)}:\s*)[\d.+-]+", rf"\g<1>{value:.{decimals}f}", block, count=1)


def patch_string_field(block: str, field: str, value: str) -> str:
    return re.sub(rf'({re.escape(field)}:\s*")([^"]*)(")', rf'\1{value}\3', block, count=1)


def resolve_canvas_lineup(
    team_abbr: str,
    rows: list[dict[str, Any]],
    rosters: dict[str, dict[str, dict[str, Any]]],
) -> list[dict[str, Any]]:
    resolved: list[dict[str, Any]] = []
    roster = rosters.get(team_abbr, {})
    for idx, row in enumerate(rows):
        key = lineup_match_key(row["name"])
        player = roster.get(key)
        if player is None:
            player = search_player(row["name"])
        if player is None or not player.get("id"):
            raise ValueError(f"Unable to resolve projected lineup player {team_abbr} {row['name']}")
        resolved.append(
            {
                "order": idx + 1,
                "id": player["id"],
                "name": player.get("name", row["name"]),
                "pos": row.get("pos") or player.get("pos") or "DH",
            }
        )
    return resolved


def choose_lineup_side(
    team_abbr: str,
    api_players: list[dict[str, Any]],
    canvas_rows: list[dict[str, Any]],
    canvas_label: str,
    rosters: dict[str, dict[str, dict[str, Any]]],
) -> tuple[list[dict[str, Any]], str]:
    label_lower = canvas_label.lower()
    use_canvas = "projected" in label_lower or "not posted" in label_lower
    if api_players and not use_canvas:
        return api_players, "Posted (MLB API)"
    if canvas_rows:
        return resolve_canvas_lineup(team_abbr, canvas_rows, rosters), canvas_label
    if api_players:
        return api_players, "Posted (MLB API)"
    return [], canvas_label


def summarize_hitter_features(
    person: dict[str, Any] | None,
    expected: dict[str, Any] | None,
    statcast: dict[str, Any] | None,
) -> dict[str, Any]:
    person = person or {}
    expected = expected or {}
    statcast = statcast or {}
    hitting = extract_group_stats(person, "hitting")
    avg = parse_float(hitting.get("avg"))
    obp = parse_float(hitting.get("obp"))
    slg = parse_float(hitting.get("slg"))
    pa = parse_int(hitting.get("plateAppearances"))
    hr = parse_int(hitting.get("homeRuns"))
    sb = parse_int(hitting.get("stolenBases"))
    xslg = expected.get("est_slg") if expected.get("est_slg") is not None else slg
    est_ba = expected.get("est_ba") if expected.get("est_ba") is not None else avg
    barrel_rate = statcast.get("brl_percent")
    ev95_rate = statcast.get("ev95percent")
    avg_hit_speed = statcast.get("avg_hit_speed")
    return {
        "bat_hand": ((person.get("batSide") or {}).get("code") or "")[:1],
        "avg": avg,
        "obp": obp,
        "slg": slg,
        "xslg": xslg,
        "est_ba": est_ba,
        "plate_appearances": pa,
        "home_runs": hr,
        "stolen_bases": sb,
        "barrel_rate": barrel_rate,
        "ev95_rate": ev95_rate,
        "avg_hit_speed": avg_hit_speed,
        "hard_hit_rate": ev95_rate,
    }


def summarize_pitcher_features(
    person: dict[str, Any] | None,
    expected: dict[str, Any] | None,
    statcast: dict[str, Any] | None,
    fallback_xera: float,
) -> dict[str, Any]:
    person = person or {}
    expected = expected or {}
    statcast = statcast or {}
    pitching = extract_group_stats(person, "pitching")
    era = parse_float(pitching.get("era"))
    xera = expected.get("xera")
    if xera is None:
        xera = era if era is not None else fallback_xera
    return {
        "pitch_hand": ((person.get("pitchHand") or {}).get("code") or "")[:1],
        "xera": xera,
        "est_slg": expected.get("est_slg"),
        "barrel_rate": statcast.get("brl_percent"),
        "hard_hit_rate": statcast.get("ev95percent"),
    }


def build_prop_note(
    batter: dict[str, Any],
    pitcher: dict[str, Any],
    away: str,
    home: str,
    vs_pitcher: dict[str, int] | None = None,
) -> str:
    park = "favorable park" if away in {"COL", "NYY", "CIN"} or home in {"COL", "NYY", "CIN"} else ""
    hand = ""
    if batter.get("bat_hand") and pitcher.get("pitch_hand"):
        bat = batter["bat_hand"]
        if bat == "S":
            bat = "L" if pitcher["pitch_hand"] == "R" else "R"
        hand = f"{bat}HB vs {pitcher['pitch_hand']}HP"

    power = "contact-driven profile"
    xslg = batter.get("xslg")
    barrel_rate = batter.get("barrel_rate")
    hard_hit_rate = batter.get("hard_hit_rate")
    if (xslg is not None and xslg >= 0.5) or (barrel_rate is not None and barrel_rate >= 0.15):
        power = "elite power indicators"
    elif (xslg is not None and xslg >= 0.45) or (barrel_rate is not None and barrel_rate >= 0.1):
        power = "above-average damage"
    elif (hard_hit_rate is not None and hard_hit_rate >= 0.45) or (batter.get("avg_hit_speed") or 0) >= 91:
        power = "hard-contact profile"
    elif (xslg is not None and xslg <= 0.36) and (barrel_rate is not None and barrel_rate <= 0.06):
        power = "limited power profile"

    matchup = "neutral pitcher matchup"
    if (pitcher.get("xera") or 0) >= 4.7 or (pitcher.get("est_slg") or 0) >= 0.43:
        matchup = "vs vulnerable pitcher"
    elif (pitcher.get("xera") or 9) <= 3.6 or ((pitcher.get("est_slg") or 1) <= 0.37 and pitcher.get("est_slg") is not None):
        matchup = "vs tough pitcher"

    speed = ""
    if (batter.get("stolen_bases") or 0) >= 5 and (batter.get("barrel_rate") or 0) < 0.1:
        speed = "speed boosts TB path"

    vs_note = ""
    if vs_pitcher and (vs_pitcher.get("pa") or 0) >= 4:
        ab = vs_pitcher.get("ab") or 0
        hits = vs_pitcher.get("hits") or 0
        hr = vs_pitcher.get("home_runs") or 0
        if ab > 0:
            vs_note = f"vs starter {hits}-{ab}"
            if hr:
                vs_note += f", {hr} HR"

    parts = [part for part in [hand, power, matchup, vs_note or speed or park] if part]
    return "; ".join(parts[:3])


def build_data_confidence(prop_conf: str, lineup_label: str) -> str:
    label = "posted lineup" if "posted" in lineup_label.lower() and "not posted" not in lineup_label.lower() else "projected lineup"
    return f"{prop_conf} — real stats+savant, {label}"


def bind_slate_inputs(slug: str) -> None:
    """Load `models.<slug>_inputs` (e.g. apr16 → models.apr16_inputs)."""
    global GAME_SPECS, REPORT_DATE, CANVAS
    global make_sp_profile
    mod = importlib.import_module(f"models.{slug}_inputs")
    GAME_SPECS = mod.GAME_SPECS
    REPORT_DATE = mod.REPORT_DATE
    make_sp_profile = mod.make_sp_profile
    CANVAS = ROOT / "canvases" / f"mlb-pregame-intel-{mod.CANVAS_SLUG}.canvas.tsx"


def run_slate_pipeline(slug: str, canvas_path: Path | None = None) -> None:
    bind_slate_inputs(slug)
    _run_model_pipeline(canvas_path)


def run_apr16_pipeline(canvas_path: Path | None = None) -> None:
    run_slate_pipeline("apr16", canvas_path)


def _run_model_pipeline(canvas_path: Path | None = None) -> None:
    path = canvas_path or CANVAS
    if not path.is_file():
        raise FileNotFoundError(path)

    original = path.read_text(encoding="utf-8")
    canvas_games = parse_canvas_games(original)
    api = fetch_schedule_lineups(REPORT_DATE)
    season = REPORT_DATE[:4]

    projected_team_ids: dict[str, int] = {}
    for game_key, game in api.items():
        away, home = game_key.split("@", 1)
        canvas_ctx = canvas_games.get(game_key, {})
        away_label = str(canvas_ctx.get("away_label", ""))
        home_label = str(canvas_ctx.get("home_label", ""))
        if "projected" in away_label.lower() or "not posted" in away_label.lower():
            projected_team_ids[away] = int(game["away_team_id"])
        if "projected" in home_label.lower() or "not posted" in home_label.lower():
            projected_team_ids[home] = int(game["home_team_id"])

    rosters = fetch_team_rosters(projected_team_ids, season)
    lineup_context: dict[str, dict[str, Any]] = {}
    batter_ids: set[int] = set()
    pitcher_ids: set[int] = set()

    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        schedule_game = api.get(game_key, {})
        canvas_ctx = canvas_games.get(game_key, {})
        away_players, away_label = choose_lineup_side(
            str(spec["away"]),
            list(schedule_game.get("away_players", [])),
            list(canvas_ctx.get("away_lineup", [])),
            str(canvas_ctx.get("away_label", "Projected (canvas fallback)")),
            rosters,
        )
        home_players, home_label = choose_lineup_side(
            str(spec["home"]),
            list(schedule_game.get("home_players", [])),
            list(canvas_ctx.get("home_lineup", [])),
            str(canvas_ctx.get("home_label", "Projected (canvas fallback)")),
            rosters,
        )
        away_pitcher = dict(schedule_game.get("away_pitcher") or {"id": None, "name": "TBD"})
        home_pitcher = dict(schedule_game.get("home_pitcher") or {"id": None, "name": "TBD"})
        lineup_context[game_key] = {
            "away_players": away_players,
            "home_players": home_players,
            "away_label": away_label,
            "home_label": home_label,
            "away_pitcher": away_pitcher,
            "home_pitcher": home_pitcher,
        }
        batter_ids.update(int(player["id"]) for player in away_players + home_players if player.get("id"))
        if away_pitcher.get("id"):
            pitcher_ids.add(int(away_pitcher["id"]))
        if home_pitcher.get("id"):
            pitcher_ids.add(int(home_pitcher["id"]))

    matchup_pairs: dict[int, set[int]] = {}
    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        ctx = lineup_context[game_key]
        if ctx["home_pitcher"].get("id"):
            matchup_pairs.setdefault(int(ctx["home_pitcher"]["id"]), set()).update(
                int(player["id"]) for player in ctx["away_players"] if player.get("id")
            )
        if ctx["away_pitcher"].get("id"):
            matchup_pairs.setdefault(int(ctx["away_pitcher"]["id"]), set()).update(
                int(player["id"]) for player in ctx["home_players"] if player.get("id")
            )

    people_map = fetch_people_map(batter_ids | pitcher_ids, season)
    batter_expected = fetch_savant_expected_stats("batter", season)
    batter_statcast = fetch_savant_statcast("batter", season)
    pitcher_expected = fetch_savant_expected_stats("pitcher", season)
    pitcher_statcast = fetch_savant_statcast("pitcher", season)
    vs_pitcher_stats = fetch_vs_pitcher_stats(matchup_pairs)

    batter_features = {
        pid: summarize_hitter_features(
            people_map.get(pid),
            batter_expected.get(pid),
            batter_statcast.get(pid),
        )
        for pid in batter_ids
    }
    pitcher_features: dict[int, dict[str, Any]] = {}
    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        away_pitcher = lineup_context[game_key]["away_pitcher"]
        home_pitcher = lineup_context[game_key]["home_pitcher"]
        if away_pitcher.get("id"):
            pid = int(away_pitcher["id"])
            pitcher_features[pid] = summarize_pitcher_features(
                people_map.get(pid),
                pitcher_expected.get(pid),
                pitcher_statcast.get(pid),
                float(spec["away_xera"]),
            )
        if home_pitcher.get("id"):
            pid = int(home_pitcher["id"])
            pitcher_features[pid] = summarize_pitcher_features(
                people_map.get(pid),
                pitcher_expected.get(pid),
                pitcher_statcast.get(pid),
                float(spec["home_xera"]),
            )

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

    computed_games: list[dict[str, Any]] = []
    prop_arrays: dict[str, dict[str, list[dict[str, Any]]]] = {}

    for spec in GAME_SPECS:
        key = f"{spec['away']}@{spec['home']}"
        ctx = lineup_context[key]
        away_pitcher = ctx["away_pitcher"]
        home_pitcher = ctx["home_pitcher"]
        away_pitch_feats = pitcher_features.get(int(away_pitcher["id"])) if away_pitcher.get("id") else None
        home_pitch_feats = pitcher_features.get(int(home_pitcher["id"])) if home_pitcher.get("id") else None
        away_prof = make_sp_profile(float((away_pitch_feats or {}).get("xera") or spec["away_xera"]))
        home_prof = make_sp_profile(float((home_pitch_feats or {}).get("xera") or spec["home_xera"]))
        away_lu = build_model_lineup(ctx["away_players"], batter_features)
        home_lu = build_model_lineup(ctx["home_players"], batter_features)

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
                away_pitcher.get("name", "TBD"),
                home_pitcher.get("name", "TBD"),
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
        away_props: list[dict[str, Any]] = []
        home_props: list[dict[str, Any]] = []
        for team_is_away, players, opp_pitcher, opp_pitch_feats, lineup_label in (
            (True, ctx["away_players"], home_pitcher, home_pitch_feats, ctx["away_label"]),
            (False, ctx["home_players"], away_pitcher, away_pitch_feats, ctx["home_label"]),
        ):
            opp_prof = make_sp_profile(float((opp_pitch_feats or {}).get("xera") or 4.15))
            side_rows = away_props if team_is_away else home_props
            for player in players:
                feats = batter_features.get(int(player["id"]), {})
                vs_pitcher = (
                    vs_pitcher_stats.get((int(player["id"]), int(opp_pitcher["id"])))
                    if opp_pitcher.get("id") and player.get("id")
                    else None
                )
                hr, tb2, fair_hr, fair_2tb, tier, pconf = batter_hr_two_tb(
                    str(spec["away"]),
                    str(spec["home"]),
                    team_is_away,
                    player["name"],
                    away_lu if team_is_away else home_lu,
                    opp_prof,
                    batter_hand=str(feats.get("bat_hand") or ""),
                    pitcher_hand=str((opp_pitch_feats or {}).get("pitch_hand") or ""),
                    xslg_override=feats.get("xslg"),
                    barrel_rate=feats.get("barrel_rate"),
                    actual_slg=feats.get("slg"),
                    hard_hit_rate=feats.get("hard_hit_rate"),
                    avg_hit_speed=feats.get("avg_hit_speed"),
                    est_ba=feats.get("est_ba"),
                    plate_appearances=feats.get("plate_appearances"),
                    home_runs=feats.get("home_runs"),
                    opp_xera_override=(opp_pitch_feats or {}).get("xera"),
                    opp_est_slg=(opp_pitch_feats or {}).get("est_slg"),
                    opp_barrel_rate=(opp_pitch_feats or {}).get("barrel_rate"),
                    opp_hard_hit_rate=(opp_pitch_feats or {}).get("hard_hit_rate"),
                    vs_pitcher_pa=(vs_pitcher or {}).get("pa"),
                    vs_pitcher_ab=(vs_pitcher or {}).get("ab"),
                    vs_pitcher_hits=(vs_pitcher or {}).get("hits"),
                    vs_pitcher_hr=(vs_pitcher or {}).get("home_runs"),
                    vs_pitcher_total_bases=(vs_pitcher or {}).get("total_bases"),
                )
                note = build_prop_note(
                    feats,
                    opp_pitch_feats or {},
                    str(spec["away"]),
                    str(spec["home"]),
                    vs_pitcher,
                )
                dc = build_data_confidence(pconf, lineup_label)
                batter_rows.append(
                    [
                        REPORT_DATE,
                        key,
                        str(spec["away"] if team_is_away else spec["home"]),
                        player["name"],
                        opp_pitcher.get("name", "TBD"),
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
                side_rows.append(
                    {
                        "batter": player["name"],
                        "team": str(spec["away"] if team_is_away else spec["home"]),
                        "hrPct": hr * 100,
                        "tb2Pct": tb2 * 100,
                        "tier": tier,
                        "note": note,
                    }
                )
        prop_arrays[key] = {"away": away_props, "home": home_props}

    gcsv = csv_block(games_rows)
    bcsv = csv_block(batter_rows)
    assert_no_comment_breaker(gcsv, "games CSV")
    assert_no_comment_breaker(bcsv, "batter outlooks CSV")

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
        ctx = lineup_context[cg["gameKey"]]
        block = patch_string_field(block, "awayLuLabel", ctx["away_label"])
        block = patch_string_field(block, "homeLuLabel", ctx["home_label"])
        block = replace_array_field(block, "awayLineup", render_lineup_rows(ctx["away_players"]))
        block = replace_array_field(block, "homeLineup", render_lineup_rows(ctx["home_players"]))
        block = replace_array_field(block, "propsAway", render_prop_rows(prop_arrays[cg["gameKey"]]["away"]))
        block = replace_array_field(block, "propsHome", render_prop_rows(prop_arrays[cg["gameKey"]]["home"]))
        updated = updated[:a] + block + updated[b:]

    path.write_text(updated, encoding="utf-8")
    print("Updated model-driven markers + SLATE:", path)
