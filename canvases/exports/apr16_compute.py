"""Compute dated slate games + props from shared models; update canvas markers + SLATE."""
from __future__ import annotations

import csv
import importlib
import json
import re
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from collections.abc import Callable
from datetime import date, datetime, timedelta
from io import StringIO
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from live_mlb_data import (  # noqa: E402
    GameOdds,
    LiveDataError,
    PropMarketLine,
    RotoWireGame,
    WeatherSnapshot,
    fetch_live_game_odds,
    fetch_rotowire_lineups,
    fetch_slate_prop_markets,
    fetch_weather_snapshot,
    get_runtime_diagnostics,
    normalize_player_name,
    reset_runtime_diagnostics,
    strip_accents,
)
from models.game_model import (  # noqa: E402
    DEFAULT_MARKET_BLEND_ALPHA,
    american_to_implied,
    blended_win_probabilities,
    clamp,
    devig_two_way,
    tier_from_edge,
    win_probability_model,
)
from models.prop_model import batter_hr_two_tb, lineup_match_key, stronger_tier  # noqa: E402

# --- Extracted pure pipeline modules (pipeline/*) ---------------------------
# The symbols below are re-exported at the bottom of this module so existing
# callers (build_ml_exports.py, bootstrap_live_slate.py, _gen_apr*_canvas.py)
# and any stray imports keep working unchanged.
from pipeline.canvas_io import (  # noqa: E402
    assert_no_comment_breaker,
    canvas_slug,
    csv_block,
    extract_game_block,
    find_field_array_span,
    insert_field_after,
    parse_canvas_games as _parse_canvas_games_pure,
    parse_lineup_rows,
    patch_float_field,
    patch_string_field,
    render_json_string,
    render_lineup_rows,
    render_prop_rows,
    replace_array_field,
    replace_marker_region,
    round_or_blank,
    rows_to_dicts,
    upsert_literal_field,
    upsert_string_field,
)
from pipeline.markets import (  # noqa: E402
    HR_EDGE_GATE_PCT,
    PROP_TIER_RANK,
    TB_EDGE_GATE_PCT,
    TB_PARTIAL_RECOMMEND_MIN_PROB_PCT,
    TB_RECOMMEND_MIN_PROB_PCT,
    TB_TARGET_LINE,
    choose_recommended_prop,
    classify_hr_market_status,
    classify_tb_market_status,
    has_any_tb_market,
    has_hr_market_price,
    is_aligned_tb_market,
    prop_tier_rank,
    summarize_prop_market_coverage as _summarize_prop_market_coverage_pure,
)
from pipeline.snapshots import (  # noqa: E402
    SCORING_STATUS_NOT_SCORED,
    SCORING_STATUS_SCORED,
    scoring_status_for_bucket,
    serialize_game_odds,
    serialize_prop_market,
    serialize_weather,
    summarize_snapshot_evaluation,
    write_run_snapshot as _write_run_snapshot_pure,
)
from pipeline.status import (  # noqa: E402
    current_inning_label,
    innings_text_to_outs,
    parse_stat_date,
    run_environment_label,
    summarize_game_status,
)

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
SNAPSHOT_ROOT = ROOT / "canvases" / "exports" / "snapshots"


def parse_canvas_games(source: str) -> dict[str, dict[str, Any]]:
    """Back-compat wrapper: uses the module-level GAME_SPECS."""
    return _parse_canvas_games_pure(source, GAME_SPECS)


def summarize_prop_market_coverage(
    game_key: str,
    ctx: dict[str, Any],
    markets: dict[tuple[str, str], PropMarketLine],
) -> dict[str, Any]:
    """Back-compat wrapper: injects `normalize_player_name` from live_mlb_data."""
    return _summarize_prop_market_coverage_pure(
        game_key, ctx, markets, normalize_player_name=normalize_player_name
    )


def write_run_snapshot(
    path: Path,
    *,
    allow_partial: bool,
    lineup_context: dict[str, dict[str, Any]],
    games_rows: list[list[str]],
    batter_rows: list[list[str]],
    game_feature_rows: list[dict[str, Any]],
    prop_feature_rows: list[dict[str, Any]],
    team_bullpen_scores: dict[str, dict[str, Any]],
    runtime_diagnostics: list[dict[str, Any]],
    prop_market_coverage: list[dict[str, Any]],
) -> Path:
    """Back-compat wrapper: supplies the globals the pure writer needs."""
    return _write_run_snapshot_pure(
        path,
        snapshot_root=SNAPSHOT_ROOT,
        report_date=REPORT_DATE,
        market_blend_alpha=DEFAULT_MARKET_BLEND_ALPHA,
        allow_partial=allow_partial,
        lineup_context=lineup_context,
        games_rows=games_rows,
        batter_rows=batter_rows,
        game_feature_rows=game_feature_rows,
        prop_feature_rows=prop_feature_rows,
        team_bullpen_scores=team_bullpen_scores,
        runtime_diagnostics=runtime_diagnostics,
        prop_market_coverage=prop_market_coverage,
        game_odds_cls=GameOdds,
        prop_market_cls=PropMarketLine,
        weather_cls=WeatherSnapshot,
    )


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_csv_rows(url: str) -> list[dict[str, str]]:
    req = urllib.request.Request(url, headers=SAVANT_HEADERS)
    with urllib.request.urlopen(req, timeout=60) as response:
        text = response.read().decode("utf-8-sig", "ignore")
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


def safe_div(num: float, den: float) -> float | None:
    if den == 0:
        return None
    return num / den


def report_date_value() -> date:
    return datetime.strptime(REPORT_DATE, "%Y-%m-%d").date()


def fetch_team_meta(team_ids: dict[str, int], season: str) -> dict[str, dict[str, str]]:
    out: dict[str, dict[str, str]] = {}
    for abbr, team_id in team_ids.items():
        data = fetch_json(
            f"https://statsapi.mlb.com/api/v1/teams/{team_id}?season={season}&hydrate=venue(fieldInfo,timeZone)"
        )
        teams = data.get("teams") or []
        if not teams:
            continue
        team = teams[0]
        venue = team.get("venue") or {}
        field_info = venue.get("fieldInfo") or {}
        out[abbr] = {
            "location_name": str(team.get("locationName") or ""),
            "team_name": str(team.get("name") or ""),
            "venue_name": str(venue.get("name") or ""),
            "roof_type": str(field_info.get("roofType") or "Open"),
        }
    return out


def fetch_schedule_lineups(date_str: str) -> dict[str, dict[str, Any]]:
    sched = fetch_json(
        f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={date_str}&hydrate=probablePitcher,lineups,team,venue,linescore"
    )
    team_ids: dict[str, int] = {}
    for block in sched.get("dates", []):
        for game in block.get("games", []):
            away_team = game["teams"]["away"]["team"]
            home_team = game["teams"]["home"]["team"]
            team_ids[str(away_team["abbreviation"])] = int(away_team["id"])
            team_ids[str(home_team["abbreviation"])] = int(home_team["id"])
    team_meta = fetch_team_meta(team_ids, date_str[:4])

    posted: dict[str, dict[str, Any]] = {}
    for block in sched.get("dates", []):
        for game in block.get("games", []):
            away_team = game["teams"]["away"]["team"]
            home_team = game["teams"]["home"]["team"]
            away = str(away_team["abbreviation"])
            home = str(home_team["abbreviation"])
            key = f"{away}@{home}"
            pp_a = game["teams"]["away"].get("probablePitcher") or {}
            pp_h = game["teams"]["home"].get("probablePitcher") or {}
            lineups = game.get("lineups") or {}
            away_players = [
                {
                    "order": idx + 1,
                    "id": p.get("id"),
                    "name": p.get("fullName", ""),
                    "pos": (p.get("primaryPosition") or {}).get("abbreviation", ""),
                }
                for idx, p in enumerate(lineups.get("awayPlayers", []))
            ]
            home_players = [
                {
                    "order": idx + 1,
                    "id": p.get("id"),
                    "name": p.get("fullName", ""),
                    "pos": (p.get("primaryPosition") or {}).get("abbreviation", ""),
                }
                for idx, p in enumerate(lineups.get("homePlayers", []))
            ]
            home_meta = team_meta.get(home, {})
            away_meta = team_meta.get(away, {})
            game_status = summarize_game_status(game)
            posted[key] = {
                "away_team_id": away_team.get("id"),
                "home_team_id": home_team.get("id"),
                "away_team_name": away_meta.get("team_name") or away_team.get("name", ""),
                "home_team_name": home_meta.get("team_name") or home_team.get("name", ""),
                "away_location_name": away_meta.get("location_name") or away_team.get("locationName", ""),
                "home_location_name": home_meta.get("location_name") or home_team.get("locationName", ""),
                "away_players": away_players,
                "home_players": home_players,
                "away_pitcher": {
                    "id": pp_a.get("id"),
                    "name": pp_a.get("fullName", "TBD"),
                    "team": away,
                },
                "home_pitcher": {
                    "id": pp_h.get("id"),
                    "name": pp_h.get("fullName", "TBD"),
                    "team": home,
                },
                "venue_name": str((game.get("venue") or {}).get("name") or home_meta.get("venue_name") or ""),
                "roof_type": home_meta.get("roof_type") or "Open",
                "game_date_utc": str(game.get("gameDate") or ""),
                **game_status,
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
            f"&hydrate=stats(group=[hitting,pitching],type=[season,gameLog],season={season})"
        )
        data = fetch_json(url)
        for person in data.get("people", []):
            out[int(person["id"])] = person
    return out


def extract_group_splits(person: dict[str, Any], group_name: str, type_name: str = "season") -> list[dict[str, Any]]:
    want_group = group_name.lower()
    want_type = type_name.lower()
    for block in person.get("stats", []):
        group = ((block.get("group") or {}).get("displayName") or "").lower()
        stat_type = ((block.get("type") or {}).get("displayName") or "").lower()
        if group == want_group and stat_type == want_type:
            return list(block.get("splits") or [])
    return []


def extract_group_stats(person: dict[str, Any], group_name: str, type_name: str = "season") -> dict[str, Any]:
    splits = extract_group_splits(person, group_name, type_name=type_name)
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
    rows = fetch_csv_rows(f"https://baseballsavant.mlb.com/leaderboard/statcast?type={kind}&year={year}&csv=true")
    out: dict[int, dict[str, Any]] = {}
    for row in rows:
        pid = parse_int(row.get("player_id"))
        if pid is None:
            continue
        out[pid] = {
            "attempts": parse_int(row.get("attempts")),
            "avg_hit_speed": parse_float(row.get("avg_hit_speed")),
            "ev95percent": (parse_float(row.get("ev95percent")) or 0.0) / 100
            if row.get("ev95percent") not in {None, ""}
            else None,
            "brl_percent": (parse_float(row.get("brl_percent")) or 0.0) / 100
            if row.get("brl_percent") not in {None, ""}
            else None,
            "brl_pa": (parse_float(row.get("brl_pa")) or 0.0) / 100
            if row.get("brl_pa") not in {None, ""}
            else None,
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
                        "id": int(pid),
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


def lineup_quality_score(features: dict[str, Any]) -> float:
    est_ba = features.get("est_ba")
    xslg = features.get("xslg")
    barrel_rate = features.get("barrel_rate")
    ev95_rate = features.get("ev95_rate")
    recent_form = features.get("recent_form_score")
    score = 0.44
    if est_ba is not None:
        score += (est_ba - 0.245) * 1.2
    if xslg is not None:
        score += (xslg - 0.4) * 0.8
    if barrel_rate is not None:
        score += (barrel_rate - 0.08) * 1.6
    if ev95_rate is not None:
        score += (ev95_rate - 0.35) * 0.5
    score = clamp(score, 0.18, 0.95)
    if recent_form is not None:
        score = clamp(score * 0.75 + recent_form * 0.25, 0.18, 0.95)
    return score


def build_model_lineup(players: list[dict[str, Any]], batter_features: dict[int, dict[str, Any]]) -> list[list[str]]:
    out: list[list[str]] = []
    for idx, player in enumerate(players):
        feats = batter_features.get(int(player["id"]), {})
        est_ba = feats.get("est_ba")
        xslg = feats.get("xslg")
        obp = feats.get("recent_obp") if feats.get("recent_pa", 0) >= 12 else feats.get("obp")
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


def resolve_named_players(
    team_abbr: str,
    rows: list[dict[str, Any]],
    rosters: dict[str, dict[str, dict[str, Any]]],
) -> list[dict[str, Any]]:
    resolved: list[dict[str, Any]] = []
    roster = rosters.get(team_abbr, {})
    for idx, row in enumerate(rows):
        key = lineup_match_key(str(row["name"]))
        player = roster.get(key)
        if player is None:
            player = search_player(str(row["name"]))
        if player is None or not player.get("id"):
            raise ValueError(f"Unable to resolve lineup player {team_abbr} {row['name']}")
        resolved.append(
            {
                "order": idx + 1,
                "id": int(player["id"]),
                "name": str(player.get("name", row["name"])),
                "pos": str(row.get("pos") or player.get("pos") or "DH"),
            }
        )
    return resolved


def lineup_players_match(api_players: list[dict[str, Any]], rotowire_players: list[dict[str, str]]) -> bool:
    if len(api_players) != len(rotowire_players):
        return False
    api_keys = [normalize_player_name(str(player.get("name") or "")) for player in api_players]
    rotowire_keys = [normalize_player_name(str(player.get("name") or "")) for player in rotowire_players]
    return api_keys == rotowire_keys


def starter_names_match(api_name: str, rotowire_name: str) -> bool:
    api_key = normalize_player_name(api_name)
    rotowire_key = normalize_player_name(rotowire_name)
    if api_key and api_key == rotowire_key:
        return True

    def tokens(name: str) -> list[str]:
        return re.findall(r"[a-z]+", strip_accents(name).lower())

    api_tokens = tokens(api_name)
    rw_tokens = tokens(rotowire_name)
    if len(api_tokens) < 2 or len(rw_tokens) < 2:
        return False
    if api_tokens[-1] != rw_tokens[-1]:
        return False
    return api_tokens[0][:1] == rw_tokens[0][:1]


def choose_lineup_side(
    team_abbr: str,
    api_players: list[dict[str, Any]],
    canvas_rows: list[dict[str, Any]],
    canvas_label: str,
    rotowire_game: RotoWireGame | None,
    side: str,
    rosters: dict[str, dict[str, dict[str, Any]]],
    *,
    allow_canvas_fallback: bool,
) -> tuple[list[dict[str, Any]], str, list[str]]:
    issues: list[str] = []
    rotowire_side = rotowire_game.away_side if rotowire_game and side == "away" else rotowire_game.home_side if rotowire_game else None

    if api_players:
        label = "Posted (MLB API)"
        if rotowire_side is None:
            issues.append("rotowire_missing")
        else:
            if not rotowire_side.confirmed:
                issues.append("rotowire_unconfirmed")
            elif not lineup_players_match(api_players, rotowire_side.players):
                issues.append("rotowire_lineup_mismatch")
            else:
                label = "Confirmed (MLB API + RotoWire)"
        return api_players, label, issues

    if rotowire_side and rotowire_side.confirmed:
        resolved = resolve_named_players(
            team_abbr,
            [{"name": player["name"], "pos": player["pos"]} for player in rotowire_side.players],
            rosters,
        )
        return resolved, "Confirmed (RotoWire)", ["lineup_not_posted_api"]

    if allow_canvas_fallback and canvas_rows:
        resolved = resolve_named_players(team_abbr, canvas_rows, rosters)
        return resolved, canvas_label, ["lineup_projected_canvas", "lineup_not_posted_api"]

    return [], "Not Posted", ["lineup_not_posted_api"]


def starter_matches(api_pitcher: dict[str, Any], rotowire_game: RotoWireGame | None, side: str) -> list[str]:
    if rotowire_game is None:
        return ["rotowire_missing"]
    rotowire_side = rotowire_game.away_side if side == "away" else rotowire_game.home_side
    api_name = str(api_pitcher.get("name") or "")
    rotowire_name = rotowire_side.pitcher_name
    issues: list[str] = []
    if not rotowire_side.confirmed:
        issues.append("rotowire_unconfirmed")
    if not api_name or not rotowire_name:
        issues.append("starter_missing")
    elif not starter_names_match(api_name, rotowire_name):
        issues.append("starter_mismatch_rotowire")
    return issues


def collect_recent_splits(
    person: dict[str, Any],
    group_name: str,
    *,
    window_days: int,
    type_name: str = "gameLog",
    max_entries: int | None = None,
) -> list[dict[str, Any]]:
    end_date = report_date_value()
    start_date = end_date - timedelta(days=window_days)
    splits = []
    for split in extract_group_splits(person, group_name, type_name=type_name):
        split_date = parse_stat_date(split.get("date"))
        if split_date is None or split_date >= end_date or split_date < start_date:
            continue
        splits.append(split)
    splits.sort(key=lambda split: str(split.get("date") or ""), reverse=True)
    if max_entries is not None:
        return splits[:max_entries]
    return splits


def summarize_recent_hitter_form(person: dict[str, Any] | None) -> dict[str, Any]:
    person = person or {}
    splits = collect_recent_splits(person, "hitting", window_days=14)
    ab = pa = hits = walks = hit_by_pitch = sac_flies = total_bases = home_runs = 0
    for split in splits:
        stat = split.get("stat") or {}
        ab += parse_int(stat.get("atBats")) or 0
        pa += parse_int(stat.get("plateAppearances")) or 0
        hits += parse_int(stat.get("hits")) or 0
        walks += parse_int(stat.get("baseOnBalls")) or 0
        hit_by_pitch += parse_int(stat.get("hitByPitch")) or 0
        sac_flies += parse_int(stat.get("sacFlies")) or 0
        total_bases += parse_int(stat.get("totalBases")) or 0
        home_runs += parse_int(stat.get("homeRuns")) or 0
    if pa == 0 or ab == 0:
        return {"recent_pa": 0, "recent_form_score": None}
    obp = safe_div(hits + walks + hit_by_pitch, ab + walks + hit_by_pitch + sac_flies)
    slg = safe_div(total_bases, ab)
    ops = (obp or 0.0) + (slg or 0.0)
    hr_rate = safe_div(home_runs, pa)
    tb_rate = safe_div(total_bases, pa)
    score = clamp(
        0.45
        + ((ops - 0.72) * 0.55 if ops is not None else 0.0)
        + ((hr_rate - 0.03) * 1.5 if hr_rate is not None else 0.0)
        + ((tb_rate - 0.17) * 0.3 if tb_rate is not None else 0.0),
        0.18,
        0.95,
    )
    return {
        "recent_pa": pa,
        "recent_obp": obp,
        "recent_slg": slg,
        "recent_ops": ops,
        "recent_hr_rate": hr_rate,
        "recent_tb_rate": tb_rate,
        "recent_form_score": score,
    }


def summarize_recent_pitcher_form(person: dict[str, Any] | None, *, reliever: bool = False) -> dict[str, Any]:
    person = person or {}
    splits = collect_recent_splits(person, "pitching", window_days=21, max_entries=5 if reliever else 3)
    outs = earned_runs = hits = walks = strikeouts = pitches = appearances_last3 = 0
    pitched_yesterday = False
    last_date: date | None = None
    yesterday = report_date_value() - timedelta(days=1)
    three_days_ago = report_date_value() - timedelta(days=3)
    for split in splits:
        stat = split.get("stat") or {}
        split_date = parse_stat_date(split.get("date"))
        if last_date is None and split_date is not None:
            last_date = split_date
        outs += innings_text_to_outs(str(stat.get("inningsPitched") or ""))
        earned_runs += parse_int(stat.get("earnedRuns")) or 0
        hits += parse_int(stat.get("hits")) or 0
        walks += parse_int(stat.get("baseOnBalls")) or 0
        strikeouts += parse_int(stat.get("strikeOuts")) or 0
        pitches += parse_int(stat.get("numberOfPitches")) or 0
        if split_date and split_date >= three_days_ago:
            appearances_last3 += 1
        if split_date == yesterday:
            pitched_yesterday = True
    if outs == 0:
        return {
            "recent_form_score": None,
            "recent_appearances_last3": appearances_last3,
            "recent_pitches_last3": pitches,
            "pitched_yesterday": pitched_yesterday,
            "days_since_last": None,
        }
    ip = outs / 3
    era = earned_runs * 9 / ip if ip else None
    whip = (hits + walks) / ip if ip else None
    k9 = strikeouts * 9 / ip if ip else None
    bb9 = walks * 9 / ip if ip else None
    score = clamp(
        0.55
        + ((4.15 - (era or 4.15)) * 0.08)
        + (((k9 or 8.0) - 8.0) * 0.015)
        - (((bb9 or 3.0) - 3.0) * 0.02)
        - (((whip or 1.25) - 1.25) * 0.12),
        0.18,
        0.95,
    )
    return {
        "recent_era": era,
        "recent_whip": whip,
        "recent_k9": k9,
        "recent_bb9": bb9,
        "recent_form_score": score,
        "recent_appearances_last3": appearances_last3,
        "recent_pitches_last3": pitches,
        "pitched_yesterday": pitched_yesterday,
        "days_since_last": (report_date_value() - last_date).days if last_date else None,
    }


def summarize_hitter_features(
    person: dict[str, Any] | None,
    expected: dict[str, Any] | None,
    statcast: dict[str, Any] | None,
) -> dict[str, Any]:
    person = person or {}
    expected = expected or {}
    statcast = statcast or {}
    hitting = extract_group_stats(person, "hitting", type_name="season")
    recent = summarize_recent_hitter_form(person)
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
        **recent,
    }


def summarize_pitcher_features(
    person: dict[str, Any] | None,
    expected: dict[str, Any] | None,
    statcast: dict[str, Any] | None,
    fallback_xera: float,
    *,
    reliever: bool = False,
) -> dict[str, Any]:
    person = person or {}
    expected = expected or {}
    statcast = statcast or {}
    pitching = extract_group_stats(person, "pitching", type_name="season")
    recent = summarize_recent_pitcher_form(person, reliever=reliever)
    era = parse_float(pitching.get("era"))
    xera = expected.get("xera")
    if xera is None:
        xera = era if era is not None else fallback_xera
    recent_score = recent.get("recent_form_score")
    base_score = clamp(0.5 + ((4.15 - xera) / 2.85) * 0.45, 0.18, 0.95)
    final_recent_score = clamp(base_score * 0.5 + (recent_score or base_score) * 0.5, 0.18, 0.95)
    return {
        "pitch_hand": ((person.get("pitchHand") or {}).get("code") or "")[:1],
        "xera": xera,
        "season_era": era,
        "est_slg": expected.get("est_slg"),
        "barrel_rate": statcast.get("brl_percent"),
        "hard_hit_rate": statcast.get("ev95percent"),
        "recent_form_score": final_recent_score,
        **recent,
    }


def team_recent_form_score(players: list[dict[str, Any]], batter_features: dict[int, dict[str, Any]]) -> float | None:
    scores: list[float] = []
    for player in players:
        feats = batter_features.get(int(player["id"]), {})
        score = feats.get("recent_form_score")
        if score is None:
            score = lineup_quality_score(feats)
        scores.append(float(score))
    if not scores:
        return None
    return clamp(sum(scores) / len(scores), 0.18, 0.95)


def summarize_team_bullpen(
    team_abbr: str,
    rosters: dict[str, dict[str, dict[str, Any]]],
    people_map: dict[int, dict[str, Any]],
    pitcher_expected: dict[int, dict[str, Any]],
    pitcher_statcast: dict[int, dict[str, Any]],
    excluded_pitcher_id: int | None,
) -> dict[str, Any]:
    weighted_scores = 0.0
    weights = 0.0
    available = 0
    arms = 0
    for player in rosters.get(team_abbr, {}).values():
        pid = int(player["id"])
        if excluded_pitcher_id and pid == excluded_pitcher_id:
            continue
        if str(player.get("pos") or "") != "P":
            continue
        person = people_map.get(pid)
        if person is None:
            continue
        pitching = extract_group_stats(person, "pitching", type_name="season")
        games_pitched = parse_int(pitching.get("gamesPitched")) or 0
        games_started = parse_int(pitching.get("gamesStarted")) or 0
        if games_pitched == 0 or games_started >= games_pitched:
            continue
        feats = summarize_pitcher_features(
            person,
            pitcher_expected.get(pid),
            pitcher_statcast.get(pid),
            4.15,
            reliever=True,
        )
        holds = parse_int(pitching.get("holds")) or 0
        saves = parse_int(pitching.get("saves")) or 0
        games_finished = parse_int(pitching.get("gamesFinished")) or 0
        role_weight = 1.0 + (holds * 0.05) + (saves * 0.08) + (games_finished * 0.015)
        availability = 1.0
        if feats.get("pitched_yesterday"):
            availability -= 0.18
        if (feats.get("recent_appearances_last3") or 0) >= 2:
            availability -= 0.12
        if (feats.get("recent_pitches_last3") or 0) >= 35:
            availability -= 0.15
        availability = clamp(availability, 0.4, 1.0)
        quality = clamp(
            0.55 * clamp(0.5 + ((4.15 - float(feats["xera"])) / 2.85) * 0.45, 0.18, 0.95)
            + 0.45 * float(feats.get("recent_form_score") or 0.5),
            0.18,
            0.95,
        )
        weighted_scores += quality * availability * role_weight
        weights += role_weight
        available += 1 if availability >= 0.75 else 0
        arms += 1
    if weights == 0:
        return {"score": None, "available_arms": 0, "total_arms": 0}
    return {
        "score": clamp(weighted_scores / weights, 0.18, 0.95),
        "available_arms": available,
        "total_arms": arms,
    }


def build_prop_note(
    batter: dict[str, Any],
    pitcher: dict[str, Any],
    away: str,
    home: str,
    *,
    vs_pitcher: dict[str, int] | None = None,
    weather_factor: float | None = None,
    opp_bullpen_score: float | None = None,
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
    elif (pitcher.get("xera") or 9) <= 3.6 or (
        (pitcher.get("est_slg") or 1) <= 0.37 and pitcher.get("est_slg") is not None
    ):
        matchup = "vs tough pitcher"

    recent = ""
    if (batter.get("recent_form_score") or 0) >= 0.68:
        recent = "hot recent form"
    elif (batter.get("recent_form_score") or 1) <= 0.34:
        recent = "cold recent form"

    weather = ""
    if weather_factor is not None and weather_factor >= 1.04:
        weather = "weather boosts carry"
    elif weather_factor is not None and weather_factor <= 0.97:
        weather = "weather suppresses carry"

    bullpen = ""
    if opp_bullpen_score is not None and opp_bullpen_score <= 0.42:
        bullpen = "late innings favorable"
    elif opp_bullpen_score is not None and opp_bullpen_score >= 0.65:
        bullpen = "late innings tougher"

    vs_note = ""
    if vs_pitcher and (vs_pitcher.get("pa") or 0) >= 8:
        ab = vs_pitcher.get("ab") or 0
        hits = vs_pitcher.get("hits") or 0
        hr = vs_pitcher.get("home_runs") or 0
        if ab > 0:
            vs_note = f"vs starter {hits}-{ab}"
            if hr:
                vs_note += f", {hr} HR"

    parts = [part for part in [hand, power, matchup, vs_note or recent or weather or bullpen or park] if part]
    return "; ".join(parts[:3])


def build_data_confidence(prop_conf: str, lineup_label: str, market_status: str) -> str:
    label_lower = lineup_label.lower()
    if "confirmed" in label_lower:
        lineup_desc = "confirmed lineup"
    elif "posted" in label_lower and "not posted" not in label_lower:
        lineup_desc = "posted lineup"
    else:
        lineup_desc = "projected lineup"
    market_desc = {
        "full": "live markets matched",
        "partial": "limited or misaligned live markets",
        "none": "no live markets",
    }.get(market_status, "market status unknown")
    return f"{prop_conf} — stats+savant+recent+BvP, {lineup_desc}, {market_desc}"


def bind_slate_inputs(slug: str) -> None:
    global GAME_SPECS, REPORT_DATE, CANVAS
    global make_sp_profile
    mod = importlib.import_module(f"models.{slug}_inputs")
    GAME_SPECS = mod.GAME_SPECS
    REPORT_DATE = mod.REPORT_DATE
    make_sp_profile = mod.make_sp_profile
    CANVAS = ROOT / "canvases" / f"mlb-pregame-intel-{mod.CANVAS_SLUG}.canvas.tsx"


def run_slate_pipeline(slug: str, canvas_path: Path | None = None, *, allow_partial: bool = False) -> None:
    bind_slate_inputs(slug)
    _run_model_pipeline(canvas_path, allow_partial=allow_partial)


def run_apr16_pipeline(canvas_path: Path | None = None, *, allow_partial: bool = False) -> None:
    run_slate_pipeline("apr16", canvas_path, allow_partial=allow_partial)


def _run_model_pipeline(canvas_path: Path | None = None, *, allow_partial: bool = False) -> None:
    path = canvas_path or CANVAS
    if not path.is_file():
        raise FileNotFoundError(path)

    reset_runtime_diagnostics()
    original = path.read_text(encoding="utf-8")
    canvas_games = parse_canvas_games(original)
    api = fetch_schedule_lineups(REPORT_DATE)
    season = REPORT_DATE[:4]
    rotowire_games = fetch_rotowire_lineups(REPORT_DATE)
    live_game_odds = fetch_live_game_odds(api, REPORT_DATE, required=not allow_partial)

    team_ids: dict[str, int] = {}
    for game_key, game in api.items():
        away, home = game_key.split("@", 1)
        team_ids[away] = int(game["away_team_id"])
        team_ids[home] = int(game["home_team_id"])
    rosters = fetch_team_rosters(team_ids, season)

    lineup_context: dict[str, dict[str, Any]] = {}
    blocking_issues: list[str] = []

    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        schedule_game = api.get(game_key)
        if schedule_game is None:
            blocking_issues.append(f"{game_key}: missing from MLB schedule")
            continue
        is_pregame = str(schedule_game.get("game_status_bucket") or "pregame") == "pregame"
        rotowire_game = rotowire_games.get(game_key)
        canvas_ctx = canvas_games.get(game_key, {})
        away_players, away_label, away_issues = choose_lineup_side(
            str(spec["away"]),
            list(schedule_game.get("away_players", [])),
            list(canvas_ctx.get("away_lineup", [])),
            str(canvas_ctx.get("away_label", "Projected (canvas fallback)")),
            rotowire_game,
            "away",
            rosters,
            allow_canvas_fallback=allow_partial or not is_pregame,
        )
        home_players, home_label, home_issues = choose_lineup_side(
            str(spec["home"]),
            list(schedule_game.get("home_players", [])),
            list(canvas_ctx.get("home_lineup", [])),
            str(canvas_ctx.get("home_label", "Projected (canvas fallback)")),
            rotowire_game,
            "home",
            rosters,
            allow_canvas_fallback=allow_partial or not is_pregame,
        )

        away_pitcher = dict(schedule_game.get("away_pitcher") or {"id": None, "name": "TBD"})
        home_pitcher = dict(schedule_game.get("home_pitcher") or {"id": None, "name": "TBD"})
        issues = away_issues + home_issues
        issues.extend(starter_matches(away_pitcher, rotowire_game, "away"))
        issues.extend(starter_matches(home_pitcher, rotowire_game, "home"))

        weather_snapshot: WeatherSnapshot | None = None
        try:
            weather_snapshot = fetch_weather_snapshot(
                str(schedule_game.get("venue_name") or ""),
                str(schedule_game.get("home_location_name") or ""),
                str(schedule_game.get("roof_type") or "Open"),
                str(schedule_game.get("game_date_utc") or ""),
            )
        except Exception as exc:
            if is_pregame and allow_partial:
                issues.append("weather_live_missing")
            elif is_pregame:
                blocking_issues.append(f"{game_key}: live weather unavailable ({exc})")

        odds = live_game_odds.get(game_key)
        away_moneyline = odds.away_moneyline if odds and odds.away_moneyline is not None else parse_int(spec["away_a"])
        home_moneyline = odds.home_moneyline if odds and odds.home_moneyline is not None else parse_int(spec["home_a"])
        if is_pregame and (odds is None or away_moneyline is None or home_moneyline is None):
            if allow_partial:
                issues.append("approx_market_ml")
            else:
                blocking_issues.append(f"{game_key}: live moneyline odds unavailable")
        if is_pregame and (odds is None or odds.total_line is None or odds.over_price is None or odds.under_price is None):
            if allow_partial:
                issues.append("market_total_missing")
            else:
                blocking_issues.append(f"{game_key}: live totals market unavailable")

        if not allow_partial and is_pregame:
            critical = {
                "lineup_not_posted_api",
                "rotowire_missing",
                "rotowire_unconfirmed",
                "rotowire_lineup_mismatch",
                "starter_mismatch_rotowire",
                "starter_missing",
                "weather_live_missing",
                "approx_market_ml",
                "market_total_missing",
            }
            hard = [issue for issue in issues if issue in critical]
            if hard:
                blocking_issues.append(f"{game_key}: {';'.join(sorted(set(hard)))}")

        lineup_context[game_key] = {
            "away_players": away_players,
            "home_players": home_players,
            "away_label": away_label,
            "home_label": home_label,
            "away_pitcher": away_pitcher,
            "home_pitcher": home_pitcher,
            "away_moneyline": away_moneyline,
            "home_moneyline": home_moneyline,
            "odds": odds,
            "weather": weather_snapshot,
            "issues": sorted(set(issues)),
            "venue_name": schedule_game.get("venue_name", ""),
            "roof_type": schedule_game.get("roof_type", ""),
            "game_status_bucket": schedule_game.get("game_status_bucket", "pregame"),
            "game_state": schedule_game.get("game_state", "Yet To Begin"),
            "game_state_detail": schedule_game.get("game_state_detail", "Pre-Game"),
            "game_status_note": schedule_game.get("game_status_note", "Yet to begin"),
            "inning_label": schedule_game.get("inning_label", ""),
            "away_score": schedule_game.get("away_score"),
            "home_score": schedule_game.get("home_score"),
        }

    if blocking_issues and not allow_partial:
        raise LiveDataError("Full-data requirements not satisfied:\n- " + "\n- ".join(blocking_issues))

    batter_ids: set[int] = set()
    pitcher_ids: set[int] = set()
    bullpen_pitcher_ids: set[int] = set()
    for game_key, ctx in lineup_context.items():
        batter_ids.update(int(player["id"]) for player in ctx["away_players"] + ctx["home_players"] if player.get("id"))
        if ctx["away_pitcher"].get("id"):
            pitcher_ids.add(int(ctx["away_pitcher"]["id"]))
        if ctx["home_pitcher"].get("id"):
            pitcher_ids.add(int(ctx["home_pitcher"]["id"]))
        away, home = game_key.split("@", 1)
        for team_abbr, excluded_id in ((away, ctx["away_pitcher"].get("id")), (home, ctx["home_pitcher"].get("id"))):
            for player in rosters.get(team_abbr, {}).values():
                if str(player.get("pos") or "") == "P" and player.get("id") != excluded_id:
                    bullpen_pitcher_ids.add(int(player["id"]))

    matchup_pairs: dict[int, set[int]] = {}
    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        ctx = lineup_context.get(game_key)
        if not ctx:
            continue
        if ctx["home_pitcher"].get("id"):
            matchup_pairs.setdefault(int(ctx["home_pitcher"]["id"]), set()).update(
                int(player["id"]) for player in ctx["away_players"] if player.get("id")
            )
        if ctx["away_pitcher"].get("id"):
            matchup_pairs.setdefault(int(ctx["away_pitcher"]["id"]), set()).update(
                int(player["id"]) for player in ctx["home_players"] if player.get("id")
            )

    people_map = fetch_people_map(batter_ids | pitcher_ids | bullpen_pitcher_ids, season)
    batter_expected = fetch_savant_expected_stats("batter", season)
    batter_statcast = fetch_savant_statcast("batter", season)
    pitcher_expected = fetch_savant_expected_stats("pitcher", season)
    pitcher_statcast = fetch_savant_statcast("pitcher", season)
    vs_pitcher_stats = fetch_vs_pitcher_stats(matchup_pairs)

    batter_features = {
        pid: summarize_hitter_features(people_map.get(pid), batter_expected.get(pid), batter_statcast.get(pid))
        for pid in batter_ids
    }
    pitcher_features: dict[int, dict[str, Any]] = {}
    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        ctx = lineup_context.get(game_key)
        if not ctx:
            continue
        if ctx["away_pitcher"].get("id"):
            pid = int(ctx["away_pitcher"]["id"])
            pitcher_features[pid] = summarize_pitcher_features(
                people_map.get(pid),
                pitcher_expected.get(pid),
                pitcher_statcast.get(pid),
                float(spec["away_xera"]),
            )
        if ctx["home_pitcher"].get("id"):
            pid = int(ctx["home_pitcher"]["id"])
            pitcher_features[pid] = summarize_pitcher_features(
                people_map.get(pid),
                pitcher_expected.get(pid),
                pitcher_statcast.get(pid),
                float(spec["home_xera"]),
            )

    starter_ids_by_team: dict[str, int | None] = {}
    for ctx in lineup_context.values():
        away_team = str((ctx.get("away_pitcher") or {}).get("team") or "")
        home_team = str((ctx.get("home_pitcher") or {}).get("team") or "")
        starter_ids_by_team[away_team] = parse_int((ctx.get("away_pitcher") or {}).get("id"))
        starter_ids_by_team[home_team] = parse_int((ctx.get("home_pitcher") or {}).get("id"))

    team_bullpen_scores: dict[str, dict[str, Any]] = {}
    for team_abbr in rosters:
        team_bullpen_scores[team_abbr] = summarize_team_bullpen(
            team_abbr,
            rosters,
            people_map,
            pitcher_expected,
            pitcher_statcast,
            starter_ids_by_team.get(team_abbr),
        )

    event_ids_by_game = {
        game_key: (ctx["odds"].event_id if isinstance(ctx.get("odds"), GameOdds) else "")
        for game_key, ctx in lineup_context.items()
    }
    prop_market_map = fetch_slate_prop_markets(REPORT_DATE, event_ids_by_game)
    prop_market_coverage: list[dict[str, Any]] = []
    coverage_by_game: dict[str, dict[str, Any]] = {}
    for spec in GAME_SPECS:
        key = f"{spec['away']}@{spec['home']}"
        coverage = summarize_prop_market_coverage(key, lineup_context[key], prop_market_map.get(key, {}))
        coverage_by_game[key] = coverage
        prop_market_coverage.append(coverage)
        if "rotowire_hr_home_side_missing" in coverage["notes"]:
            lineup_context[key]["issues"] = sorted(set(list(lineup_context[key].get("issues") or []) + ["rotowire_hr_home_side_missing"]))
        if "rotowire_hr_away_side_missing" in coverage["notes"]:
            lineup_context[key]["issues"] = sorted(set(list(lineup_context[key].get("issues") or []) + ["rotowire_hr_away_side_missing"]))
        if "market_odds_unavailable" in coverage["notes"]:
            lineup_context[key]["issues"] = sorted(set(list(lineup_context[key].get("issues") or []) + ["market_odds_unavailable"]))
        note_text = ", ".join(coverage["notes"]) or "ok"
        print(
            f"Prop coverage {key}: "
            f"HR away {coverage['away_hr_covered']}/{coverage['away_lineup_size']} "
            f"home {coverage['home_hr_covered']}/{coverage['home_lineup_size']} | "
            f"TB away {coverage['away_tb_covered']}/{coverage['away_lineup_size']} "
            f"home {coverage['home_tb_covered']}/{coverage['home_lineup_size']} | "
            f"notes={note_text}"
        )
    for diagnostic in get_runtime_diagnostics():
        print(
            f"Data warning [{diagnostic.get('code', 'unknown')}]: "
            f"{diagnostic.get('message', '')}"
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
            "market_total",
            "market_over_american",
            "market_under_american",
            "weather_summary",
            "weather_temp_f",
            "weather_wind_mph",
            "weather_precip_pct",
            "bullpen_away_score",
            "bullpen_home_score",
            "recent_form_away_score",
            "recent_form_home_score",
            "game_status_bucket",
            "game_state",
            "game_state_detail",
            "game_status_note",
            "away_score",
            "home_score",
            "verification_status",
            "verification_notes",
            "implied_away_pct_nv",
            "implied_home_pct_nv",
            "raw_model_away_win_pct",
            "raw_model_home_win_pct",
            "final_away_win_pct",
            "final_home_win_pct",
            "market_blend_alpha",
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
            "scoring_status",
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
        "market_tb_line",
        "market_tb_over_american",
        "edge_tb_pct",
        "recent_form_score",
        "bvp_pa",
        "tier",
        "hr_tier",
        "tb2_tier",
        "recommended_prop",
        "recommended_tier",
        "hr_market_status",
        "tb2_market_status",
        "data_confidence",
        "market_data_status",
        "scoring_status",
    ]
    batter_rows: list[list[str]] = [batter_header]

    computed_games: list[dict[str, Any]] = []
    prop_arrays: dict[str, dict[str, list[dict[str, Any]]]] = {}
    late_blocking_issues: list[str] = []
    game_feature_rows: list[dict[str, Any]] = []
    prop_feature_rows: list[dict[str, Any]] = []

    for spec in GAME_SPECS:
        key = f"{spec['away']}@{spec['home']}"
        ctx = lineup_context[key]
        game_status_bucket = str(ctx.get("game_status_bucket") or "")
        scoring_status = scoring_status_for_bucket(game_status_bucket)
        is_scored = scoring_status == SCORING_STATUS_SCORED
        away_pitcher = ctx["away_pitcher"]
        home_pitcher = ctx["home_pitcher"]
        away_pitch_feats = pitcher_features.get(int(away_pitcher["id"])) if away_pitcher.get("id") else None
        home_pitch_feats = pitcher_features.get(int(home_pitcher["id"])) if home_pitcher.get("id") else None
        weather_snapshot = ctx.get("weather")
        is_pregame = game_status_bucket == "pregame"
        away_recent_score = team_recent_form_score(ctx["away_players"], batter_features)
        home_recent_score = team_recent_form_score(ctx["home_players"], batter_features)
        away_bullpen_score = team_bullpen_scores.get(str(spec["away"]), {}).get("score")
        home_bullpen_score = team_bullpen_scores.get(str(spec["home"]), {}).get("score")
        if not allow_partial and is_pregame:
            if away_recent_score is None:
                late_blocking_issues.append(f"{key}: away recent form unavailable")
            if home_recent_score is None:
                late_blocking_issues.append(f"{key}: home recent form unavailable")
            if away_bullpen_score is None:
                late_blocking_issues.append(f"{key}: away bullpen unavailable")
            if home_bullpen_score is None:
                late_blocking_issues.append(f"{key}: home bullpen unavailable")

        away_prof = make_sp_profile(float((away_pitch_feats or {}).get("xera") or spec["away_xera"]))
        home_prof = make_sp_profile(float((home_pitch_feats or {}).get("xera") or spec["home_xera"]))
        away_lu = build_model_lineup(ctx["away_players"], batter_features)
        home_lu = build_model_lineup(ctx["home_players"], batter_features)

        away_moneyline = parse_int(ctx.get("away_moneyline"))
        home_moneyline = parse_int(ctx.get("home_moneyline"))
        if away_moneyline is not None and home_moneyline is not None:
            ia, ih = devig_two_way(away_moneyline, home_moneyline)
        else:
            ia, ih = 0.5, 0.5
        imp_a, imp_h = ia * 100, ih * 100
        raw_ma: float | None = None
        raw_mh: float | None = None
        ma: float | None = None
        mh: float | None = None
        ea: float | None = None
        eh: float | None = None
        edge_pick: float | None = None
        pred = ""
        tier = "not_scored"
        mconf = ""
        miss: list[str] = []
        if is_scored:
            p_away, p_home, mconf, miss = win_probability_model(
                away_lu,
                home_lu,
                away_prof,
                home_prof,
                weather_snapshot.summary if weather_snapshot else str(spec["weather"]),
                run_environment_label(weather_snapshot.run_factor if weather_snapshot else None),
                away_bullpen_score=away_bullpen_score,
                home_bullpen_score=home_bullpen_score,
                away_recent_form_score=away_recent_score,
                home_recent_form_score=home_recent_score,
                weather_factor=weather_snapshot.run_factor if weather_snapshot else None,
            )
            raw_ma, raw_mh = p_away * 100, p_home * 100
            final_away, final_home = blended_win_probabilities(
                p_away,
                p_home,
                ia,
                ih,
                alpha=DEFAULT_MARKET_BLEND_ALPHA,
            )
            ma, mh = final_away * 100, final_home * 100
            ea, eh = ma - imp_a, mh - imp_h
            pred = spec["away"] if final_away > final_home else spec["home"]
            edge_pick = ea if pred == spec["away"] else eh
            tier = tier_from_edge(edge_pick)
        issues = list(ctx["issues"]) + miss
        flags = ";".join(sorted(set(filter(None, issues))))
        verification_status = "Verified" if not ctx["issues"] else "Partial"

        odds = ctx.get("odds")
        games_rows.append(
            [
                REPORT_DATE,
                str(spec["away"]),
                str(spec["home"]),
                str(spec["time_et"]),
                away_pitcher.get("name", "TBD"),
                home_pitcher.get("name", "TBD"),
                str(away_moneyline) if away_moneyline is not None else "",
                str(home_moneyline) if home_moneyline is not None else "",
                str(odds.total_line) if isinstance(odds, GameOdds) and odds.total_line is not None else "",
                str(odds.over_price) if isinstance(odds, GameOdds) and odds.over_price is not None else "",
                str(odds.under_price) if isinstance(odds, GameOdds) and odds.under_price is not None else "",
                weather_snapshot.summary if weather_snapshot else str(spec["weather"]),
                round_or_blank(weather_snapshot.temperature_f if weather_snapshot else None, 1),
                round_or_blank(weather_snapshot.wind_speed_mph if weather_snapshot else None, 1),
                round_or_blank(weather_snapshot.precipitation_probability_pct if weather_snapshot else None, 0),
                round_or_blank(away_bullpen_score, 3),
                round_or_blank(home_bullpen_score, 3),
                round_or_blank(away_recent_score, 3),
                round_or_blank(home_recent_score, 3),
                str(ctx.get("game_status_bucket") or ""),
                str(ctx.get("game_state") or ""),
                str(ctx.get("game_state_detail") or ""),
                str(ctx.get("game_status_note") or ""),
                "" if ctx.get("away_score") is None else str(ctx.get("away_score")),
                "" if ctx.get("home_score") is None else str(ctx.get("home_score")),
                verification_status,
                "|".join(sorted(set(ctx["issues"]))),
                f"{imp_a:.2f}",
                f"{imp_h:.2f}",
                round_or_blank(raw_ma, 2),
                round_or_blank(raw_mh, 2),
                round_or_blank(ma, 2),
                round_or_blank(mh, 2),
                f"{DEFAULT_MARKET_BLEND_ALPHA:.2f}" if is_scored else "",
                round_or_blank(ma, 2),
                round_or_blank(mh, 2),
                round_or_blank(ea, 2),
                round_or_blank(eh, 2),
                pred,
                tier,
                round_or_blank(edge_pick, 2),
                mconf if is_scored else "not_scored",
                flags,
                str(spec["analyst_confidence"]),
                str(spec["rationale"]).replace("\n", " "),
                scoring_status,
            ]
        )
        computed_games.append(
            {
                "gameKey": key,
                "impliedAwayPct": imp_a,
                "impliedHomePct": imp_h,
                "modelAwayPct": ma if ma is not None else 0.0,
                "modelHomePct": mh if mh is not None else 0.0,
                "edgeAwayPct": ea if ea is not None else 0.0,
                "edgeHomePct": eh if eh is not None else 0.0,
                "prediction": pred if is_scored else "Not Scored",
                "decisionTier": tier if is_scored else "Not Scored",
                "edgeOnPickPct": edge_pick if edge_pick is not None else 0.0,
                "modelConfidence": mconf if is_scored else "Not Scored",
                "flags": flags if is_scored else ";".join(filter(None, [flags, "not_scored_non_pregame"])),
                "scoringStatus": scoring_status,
            }
        )
        game_feature_rows.append(
            {
                "game": key,
                "away": str(spec["away"]),
                "home": str(spec["home"]),
                "away_pitcher": away_pitcher,
                "home_pitcher": home_pitcher,
                "away_pitcher_features": away_pitch_feats,
                "home_pitcher_features": home_pitch_feats,
                "away_bullpen_score": away_bullpen_score,
                "home_bullpen_score": home_bullpen_score,
                "away_recent_form_score": away_recent_score,
                "home_recent_form_score": home_recent_score,
                "weather": serialize_weather(weather_snapshot if isinstance(weather_snapshot, WeatherSnapshot) else None),
                "odds": serialize_game_odds(odds if isinstance(odds, GameOdds) else None),
                "market_blend_alpha": DEFAULT_MARKET_BLEND_ALPHA if is_scored else None,
                "raw_model_away_win_pct": raw_ma,
                "raw_model_home_win_pct": raw_mh,
                "final_away_win_pct": ma,
                "final_home_win_pct": mh,
                "final_model_away_win_pct": ma,
                "final_model_home_win_pct": mh,
                "game_status_bucket": ctx.get("game_status_bucket"),
                "game_state": ctx.get("game_state"),
                "game_state_detail": ctx.get("game_state_detail"),
                "game_status_note": ctx.get("game_status_note"),
                "inning_label": ctx.get("inning_label"),
                "away_score": ctx.get("away_score"),
                "home_score": ctx.get("home_score"),
                "away_lineup_label": ctx["away_label"],
                "home_lineup_label": ctx["home_label"],
                "issues": sorted(set(ctx["issues"])),
                "missing_data_flags": flags,
                "scoring_status": scoring_status,
                "prediction": pred,
                "decision_tier": tier,
                "edge_on_pick_pct": edge_pick,
            }
        )

        away_props: list[dict[str, Any]] = []
        home_props: list[dict[str, Any]] = []
        player_markets = prop_market_map.get(key, {})
        for team_is_away, players, opp_pitcher, opp_pitch_feats, lineup_label, opp_bullpen in (
            (True, ctx["away_players"], home_pitcher, home_pitch_feats, ctx["away_label"], home_bullpen_score),
            (False, ctx["home_players"], away_pitcher, away_pitch_feats, ctx["home_label"], away_bullpen_score),
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
                player_key = normalize_player_name(player["name"])
                hr_market = player_markets.get((player_key, "batter_home_runs"))
                tb_market = player_markets.get((player_key, "batter_total_bases"))
                hr_market_priced = has_hr_market_price(hr_market)
                tb_market_any = has_any_tb_market(tb_market)
                tb_market_aligned = is_aligned_tb_market(tb_market)
                market_status = "full" if hr_market_priced and tb_market_aligned else "partial" if hr_market_priced or tb_market_any else "none"
                hr: float | None = None
                tb2: float | None = None
                fair_hr = ""
                fair_2tb = ""
                hr_tier = ""
                tb2_tier = ""
                pconf = ""
                edge_hr_pct: float | None = None
                edge_tb_pct: float | None = None
                hr_market_status = "not_scored"
                tb2_market_status = "not_scored"
                recommended_prop = ""
                recommended_tier = ""
                display_tier = ""
                should_render_prop_projection = game_status_bucket != "final"
                if should_render_prop_projection:
                    hr, tb2, fair_hr, fair_2tb, hr_tier, tb2_tier, pconf = batter_hr_two_tb(
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
                        recent_slg=feats.get("recent_slg"),
                        recent_ops=feats.get("recent_ops"),
                        recent_hr_rate=feats.get("recent_hr_rate"),
                        recent_tb_rate=feats.get("recent_tb_rate"),
                        weather_factor=weather_snapshot.run_factor if weather_snapshot else None,
                        opp_bullpen_score=opp_bullpen,
                        starter_recent_form_score=(opp_pitch_feats or {}).get("recent_form_score"),
                        vs_pitcher_pa=(vs_pitcher or {}).get("pa"),
                        vs_pitcher_ab=(vs_pitcher or {}).get("ab"),
                        vs_pitcher_hits=(vs_pitcher or {}).get("hits"),
                        vs_pitcher_hr=(vs_pitcher or {}).get("home_runs"),
                        vs_pitcher_total_bases=(vs_pitcher or {}).get("total_bases"),
                    )
                    edge_hr_pct = (
                        (hr * 100) - (american_to_implied(hr_market.over_price) * 100)
                        if hr_market_priced and hr is not None
                        else None
                    )
                    edge_tb_pct = (
                        (tb2 * 100) - (american_to_implied(tb_market.over_price) * 100)
                        if tb_market_aligned and tb_market and tb_market.over_price is not None and tb2 is not None
                        else None
                    )
                    hr_market_status = classify_hr_market_status(edge_hr_pct, hr_tier, pconf, hr_market)
                    tb2_market_status = classify_tb_market_status(
                        edge_tb_pct,
                        tb2,
                        tb2_tier,
                        pconf,
                        tb_market,
                        market_status,
                    )
                    recommended_prop, recommended_tier = choose_recommended_prop(
                        hr_market_status,
                        tb2_market_status,
                        edge_hr_pct,
                        edge_tb_pct,
                        hr_tier,
                        tb2_tier,
                    )
                    display_tier = recommended_tier or stronger_tier(hr_tier, tb2_tier)
                if not allow_partial and is_pregame:
                    if not hr_market_priced:
                        coverage_notes = list(coverage_by_game.get(key, {}).get("notes") or [])
                        reason = ""
                        if "rotowire_hr_home_side_missing" in coverage_notes and not team_is_away:
                            reason = " (Rotowire fallback returned no home-side HR markets for this game)"
                        elif "rotowire_hr_away_side_missing" in coverage_notes and team_is_away:
                            reason = " (Rotowire fallback returned no away-side HR markets for this game)"
                        late_blocking_issues.append(f"{key}: missing HR market for {player['name']}{reason}")
                    if tb_market is None or tb_market.over_price is None:
                        late_blocking_issues.append(f"{key}: missing TB market for {player['name']}")
                    elif not tb_market_aligned:
                        point_label = f"{tb_market.point:g}" if tb_market.point is not None else "unknown"
                        late_blocking_issues.append(
                            f"{key}: TB market not 1.5 for {player['name']} (got {point_label})"
                        )
                if is_scored:
                    note = build_prop_note(
                        feats,
                        opp_pitch_feats or {},
                        str(spec["away"]),
                        str(spec["home"]),
                        vs_pitcher=vs_pitcher,
                        weather_factor=weather_snapshot.run_factor if weather_snapshot else None,
                        opp_bullpen_score=opp_bullpen,
                    )
                    if tb_market_any and not tb_market_aligned and tb_market and tb_market.point is not None:
                        note = f"{note}; TB book at {tb_market.point:g}, not 1.5-aligned"
                    if recommended_prop and recommended_tier:
                        note = f"{note}; priced lean: {recommended_prop} ({recommended_tier})"
                    dc = build_data_confidence(pconf, lineup_label, market_status)
                else:
                    status_note = str(ctx.get("game_status_note") or ctx.get("game_state_detail") or "game no longer pregame")
                    note = f"Not scored — {status_note}"
                    if should_render_prop_projection:
                        display_note = build_prop_note(
                            feats,
                            opp_pitch_feats or {},
                            str(spec["away"]),
                            str(spec["home"]),
                            vs_pitcher=vs_pitcher,
                            weather_factor=weather_snapshot.run_factor if weather_snapshot else None,
                            opp_bullpen_score=opp_bullpen,
                        )
                        if tb_market_any and not tb_market_aligned and tb_market and tb_market.point is not None:
                            display_note = f"{display_note}; TB book at {tb_market.point:g}, not 1.5-aligned"
                        if recommended_prop and recommended_tier:
                            display_note = f"{display_note}; priced lean: {recommended_prop} ({recommended_tier})"
                        if display_note:
                            note = f"Display only — {status_note}; {display_note}"
                        else:
                            note = f"Display only — {status_note}"
                    dc = "Display only"
                batter_rows.append(
                    [
                        REPORT_DATE,
                        key,
                        str(spec["away"] if team_is_away else spec["home"]),
                        player["name"],
                        opp_pitcher.get("name", "TBD"),
                        f"{hr * 100:.2f}" if hr is not None else "",
                        f"{tb2 * 100:.2f}" if tb2 is not None else "",
                        fair_hr,
                        fair_2tb,
                        str(hr_market.over_price) if hr_market and hr_market.over_price is not None else "NA",
                        round_or_blank(edge_hr_pct, 2) if edge_hr_pct is not None else "",
                        str(tb_market.point) if tb_market and tb_market.point is not None else "",
                        str(tb_market.over_price) if tb_market and tb_market.over_price is not None else "",
                        round_or_blank(edge_tb_pct, 2) if edge_tb_pct is not None else "",
                        round_or_blank(feats.get("recent_form_score"), 3),
                        str((vs_pitcher or {}).get("pa") or 0),
                        display_tier,
                        hr_tier,
                        tb2_tier,
                        recommended_prop,
                        recommended_tier,
                        hr_market_status,
                        tb2_market_status,
                        dc,
                        market_status,
                        scoring_status,
                    ]
                )
                prop_feature_rows.append(
                    {
                        "game": key,
                        "team": str(spec["away"] if team_is_away else spec["home"]),
                        "batter": player["name"],
                        "opponent_pitcher": opp_pitcher.get("name", "TBD"),
                        "lineup_label": lineup_label,
                        "batter_features": feats,
                        "pitcher_features": opp_pitch_feats,
                        "vs_pitcher": vs_pitcher,
                        "weather": serialize_weather(weather_snapshot if isinstance(weather_snapshot, WeatherSnapshot) else None),
                        "opp_bullpen_score": opp_bullpen,
                        "game_status_bucket": ctx.get("game_status_bucket"),
                        "game_state": ctx.get("game_state"),
                        "game_state_detail": ctx.get("game_state_detail"),
                        "game_status_note": ctx.get("game_status_note"),
                        "market_hr": serialize_prop_market(hr_market if isinstance(hr_market, PropMarketLine) else None),
                        "market_tb": serialize_prop_market(tb_market if isinstance(tb_market, PropMarketLine) else None),
                        "hr_prob": hr,
                        "tb2_prob": tb2,
                        "fair_hr": fair_hr,
                        "fair_2tb": fair_2tb,
                        "tier": display_tier,
                        "hr_tier": hr_tier,
                        "tb2_tier": tb2_tier,
                        "scoring_status": scoring_status,
                        "recommended_prop": recommended_prop,
                        "recommended_tier": recommended_tier,
                        "edge_hr_pct": edge_hr_pct,
                        "edge_tb_pct": edge_tb_pct,
                        "hr_market_status": hr_market_status,
                        "tb2_market_status": tb2_market_status,
                        "model_confidence": pconf,
                        "data_confidence": dc,
                        "market_status": market_status,
                    }
                )
                side_rows.append(
                    {
                        "batter": player["name"],
                        "team": str(spec["away"] if team_is_away else spec["home"]),
                        "hrPct": (hr or 0.0) * 100,
                        "tb2Pct": (tb2 or 0.0) * 100,
                        "tier": (
                            f"HR {hr_tier} / TB {tb2_tier}"
                            if (hr_tier or tb2_tier)
                            else ("Not Scored" if not should_render_prop_projection else "Display only")
                        ),
                        "note": note,
                    }
                )
        prop_arrays[key] = {"away": away_props, "home": home_props}

    if late_blocking_issues and not allow_partial:
        raise LiveDataError("Full-data requirements not satisfied:\n- " + "\n- ".join(sorted(set(late_blocking_issues))))

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
        start, end = span
        block = updated[start:end]
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
        block = upsert_string_field(block, "gameStatusBucket", str(ctx["game_status_bucket"]), after_field="timeEt")
        block = upsert_string_field(block, "gameState", str(ctx["game_state"]), after_field="gameStatusBucket")
        block = upsert_string_field(block, "gameStateDetail", str(ctx["game_state_detail"]), after_field="gameState")
        block = upsert_string_field(block, "gameStatusNote", str(ctx["game_status_note"]), after_field="gameStateDetail")
        block = upsert_literal_field(
            block,
            "awayScore",
            "null" if ctx.get("away_score") is None else str(int(ctx["away_score"])),
            after_field="gameStatusNote",
        )
        block = upsert_literal_field(
            block,
            "homeScore",
            "null" if ctx.get("home_score") is None else str(int(ctx["home_score"])),
            after_field="awayScore",
        )
        block = patch_string_field(block, "awayLuLabel", ctx["away_label"])
        block = patch_string_field(block, "homeLuLabel", ctx["home_label"])
        block = replace_array_field(block, "awayLineup", render_lineup_rows(ctx["away_players"]))
        block = replace_array_field(block, "homeLineup", render_lineup_rows(ctx["home_players"]))
        block = replace_array_field(block, "propsAway", render_prop_rows(prop_arrays[cg["gameKey"]]["away"]))
        block = replace_array_field(block, "propsHome", render_prop_rows(prop_arrays[cg["gameKey"]]["home"]))
        updated = updated[:start] + block + updated[end:]

    path.write_text(updated, encoding="utf-8")
    snapshot_path = write_run_snapshot(
        path,
        allow_partial=allow_partial,
        lineup_context=lineup_context,
        games_rows=games_rows,
        batter_rows=batter_rows,
        game_feature_rows=game_feature_rows,
        prop_feature_rows=prop_feature_rows,
        team_bullpen_scores=team_bullpen_scores,
        runtime_diagnostics=get_runtime_diagnostics(),
        prop_market_coverage=prop_market_coverage,
    )
    print("Updated model-driven markers + SLATE:", path)
    print("Wrote snapshot:", snapshot_path)
