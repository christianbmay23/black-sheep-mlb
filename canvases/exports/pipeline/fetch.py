"""HTTP and remote data fetching for the MLB pregame intel pipeline.

Schedule, roster, people/stats hydration, Baseball Savant CSVs, and vs-pitcher
blocks. Pure orchestration remains in apr16_compute.py.
"""
from __future__ import annotations

import csv
import json
import urllib.parse
import urllib.request
from io import StringIO
from typing import Any

from models.prop_model import lineup_match_key

from .parseutil import parse_float, parse_int
from .status import summarize_game_status

SAVANT_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "text/csv,text/html;q=0.9,*/*;q=0.8",
}


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_csv_rows(url: str) -> list[dict[str, str]]:
    req = urllib.request.Request(url, headers=SAVANT_HEADERS)
    with urllib.request.urlopen(req, timeout=60) as response:
        text = response.read().decode("utf-8-sig", "ignore")
    return list(csv.DictReader(StringIO(text)))


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
