#!/usr/bin/env python3
"""Build the May 1, 2026 EchoIQ cold-hard enrichment artifacts.

This is a scoped research artifact builder. It does not run strict compute,
does not use paid/secret-backed APIs, and does not mutate the existing May 1
artifact bundle.
"""
from __future__ import annotations

import csv
import json
import math
import re
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from dataclasses import asdict, is_dataclass
from datetime import date, datetime, timedelta, timezone
from io import StringIO
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
EXPORT_DIR = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(EXPORT_DIR) not in sys.path:
    sys.path.insert(0, str(EXPORT_DIR))

from live_mlb_data import (  # noqa: E402
    fetch_rotowire_game_odds,
    fetch_rotowire_prop_markets,
    normalize_player_name,
)
from models.game_model import american_to_implied, devig_two_way  # noqa: E402
from models.prop_model import batter_hr_two_tb  # noqa: E402

DATE_STR = "2026-05-01"
SEASON = "2026"
AUDIT_PREFIX = "mlb-full-slate-may01-2026"
RUN_TIMESTAMP = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

SOURCE_LOG: list[dict[str, Any]] = []


TEAM_ABBR_FIX = {
    "ARI": "AZ",
    "AZ": "AZ",
    "ATH": "ATH",
    "OAK": "ATH",
    "CHW": "CWS",
    "CWS": "CWS",
    "KCR": "KC",
    "KC": "KC",
    "SDP": "SD",
    "SD": "SD",
    "SFG": "SF",
    "SF": "SF",
    "TBR": "TB",
    "TB": "TB",
    "WSN": "WSH",
    "WSH": "WSH",
}


def now_date() -> date:
    return date.fromisoformat(DATE_STR)


def log_source(
    name: str,
    url: str,
    status: str,
    *,
    fields: list[str] | None = None,
    detail: str = "",
    row_count: int | None = None,
) -> None:
    SOURCE_LOG.append(
        {
            "name": name,
            "url": url,
            "status": status,
            "fields": fields or [],
            "detail": detail,
            "row_count": row_count,
            "accessed_at": RUN_TIMESTAMP,
        }
    )


def fetch_text(url: str, *, source_name: str, fields: list[str] | None = None) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 black-sheep-mlb-cold-hard/1.0",
            "Accept": "application/json,text/csv,text/html,*/*",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            raw = response.read().decode("utf-8-sig", "ignore")
        log_source(source_name, url, "ok", fields=fields, row_count=None)
        return raw
    except Exception as exc:
        log_source(source_name, url, "failed", fields=fields, detail=str(exc))
        raise


def fetch_json(url: str, *, source_name: str, fields: list[str] | None = None) -> dict[str, Any]:
    return json.loads(fetch_text(url, source_name=source_name, fields=fields))


def fetch_csv(url: str, *, source_name: str, fields: list[str] | None = None) -> list[dict[str, str]]:
    text = fetch_text(url, source_name=source_name, fields=fields)
    rows = list(csv.DictReader(StringIO(text)))
    if SOURCE_LOG:
        SOURCE_LOG[-1]["row_count"] = len(rows)
    return rows


def parse_float(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and math.isnan(value):
            return None
        return float(value)
    text = str(value).strip()
    if not text or text in {"-", "--", "NA", "N/A", "None", "null", "unavailable"}:
        return None
    try:
        return float(text.replace(",", "").replace("%", ""))
    except ValueError:
        return None


def parse_int(value: Any) -> int | None:
    parsed = parse_float(value)
    return int(parsed) if parsed is not None else None


def pct(value: Any) -> float | None:
    parsed = parse_float(value)
    if parsed is None:
        return None
    return parsed / 100.0 if parsed > 1.0 else parsed


def fmt(value: Any, digits: int = 3) -> str:
    parsed = parse_float(value)
    if parsed is None:
        return ""
    return f"{parsed:.{digits}f}"


def fmt_pct(value: Any, digits: int = 1) -> str:
    parsed = parse_float(value)
    if parsed is None:
        return ""
    return f"{parsed * 100:.{digits}f}"


def fair_american(probability: float | None) -> str:
    if probability is None or probability <= 0 or probability >= 1:
        return ""
    if probability == 0.5:
        return "+100"
    if probability > 0.5:
        return str(round(-100 * probability / (1 - probability)))
    return f"+{round(100 * (1 - probability) / probability)}"


def american_to_str(value: Any) -> str:
    parsed = parse_int(value)
    if parsed is None:
        return ""
    return f"+{parsed}" if parsed > 0 else str(parsed)


def implied_probability(odds: int | None) -> float | None:
    if odds is None:
        return None
    return american_to_implied(float(odds))


def valid_american_odds(odds: int | None) -> bool:
    if odds is None:
        return False
    return odds >= 100 or odds <= -100


def valid_tb_over_odds(odds: int | None, point: Any) -> bool:
    if not valid_american_odds(odds):
        return False
    parsed_point = parse_float(point)
    if parsed_point is not None and parsed_point <= 1.5 and odds is not None and odds > 300:
        return False
    return True


def edge_pp(fair_probability: float | None, market_probability: float | None) -> float | None:
    if fair_probability is None or market_probability is None:
        return None
    return round((fair_probability - market_probability) * 100, 2)


def normalize_abbr(abbr: str) -> str:
    text = str(abbr or "").upper().strip()
    return TEAM_ABBR_FIX.get(text, text)


def stat_value(stat: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in stat and stat.get(key) not in {None, ""}:
            return stat.get(key)
    return None


def innings_to_float(value: Any) -> float:
    text = str(value or "0").strip()
    if not text:
        return 0.0
    if "." not in text:
        return float(parse_int(text) or 0)
    whole, frac = text.split(".", 1)
    outs = parse_int(whole) or 0
    extra = parse_int(frac[:1]) or 0
    return outs + (extra / 3.0)


def get_stat_block(person: dict[str, Any], group_name: str, type_name: str) -> dict[str, Any]:
    for block in person.get("stats") or []:
        group = ((block.get("group") or {}).get("displayName") or "").lower()
        typ = ((block.get("type") or {}).get("displayName") or "").lower()
        if group == group_name and typ == type_name:
            splits = block.get("splits") or []
            if splits:
                return splits[0].get("stat") or {}
    return {}


def get_game_log(person: dict[str, Any], group_name: str) -> list[dict[str, Any]]:
    for block in person.get("stats") or []:
        group = ((block.get("group") or {}).get("displayName") or "").lower()
        typ = ((block.get("type") or {}).get("displayName") or "").lower()
        if group == group_name and typ == "gamelog":
            return block.get("splits") or []
    return []


def aggregate_hitting_logs(logs: list[dict[str, Any]], days: int) -> dict[str, Any]:
    cutoff = now_date() - timedelta(days=days)
    totals = defaultdict(float)
    games = 0
    for split in logs:
        game_date = date.fromisoformat(str(split.get("date")))
        if not (cutoff <= game_date < now_date()):
            continue
        stat = split.get("stat") or {}
        games += 1
        for key in (
            "plateAppearances",
            "atBats",
            "hits",
            "doubles",
            "triples",
            "homeRuns",
            "totalBases",
            "baseOnBalls",
            "strikeOuts",
        ):
            totals[key] += parse_float(stat.get(key)) or 0.0
    ab = totals["atBats"]
    pa = totals["plateAppearances"]
    hits = totals["hits"]
    tb = totals["totalBases"]
    bb = totals["baseOnBalls"]
    avg = hits / ab if ab else None
    obp = (hits + bb) / pa if pa else None
    slg = tb / ab if ab else None
    ops = (obp + slg) if obp is not None and slg is not None else None
    return {
        "games": games,
        "pa": int(pa),
        "avg": avg,
        "slg": slg,
        "ops": ops,
        "hr_rate": totals["homeRuns"] / pa if pa else None,
        "tb_rate": tb / pa if pa else None,
    }


def aggregate_pitching_logs(logs: list[dict[str, Any]], starts: int = 3) -> dict[str, Any]:
    filtered = []
    for split in logs:
        game_date = date.fromisoformat(str(split.get("date")))
        if game_date < now_date():
            filtered.append(split)
    filtered.sort(key=lambda row: row.get("date") or "", reverse=True)
    totals = defaultdict(float)
    used = filtered[:starts]
    for split in used:
        stat = split.get("stat") or {}
        for key in ("inningsPitched", "earnedRuns", "strikeOuts", "baseOnBalls", "homeRuns", "pitchesThrown"):
            if key == "inningsPitched":
                totals[key] += innings_to_float(stat.get(key))
            else:
                totals[key] += parse_float(stat.get(key)) or 0.0
    ip = totals["inningsPitched"]
    return {
        "starts": len(used),
        "ip": ip,
        "era": (totals["earnedRuns"] * 9 / ip) if ip else None,
        "k": int(totals["strikeOuts"]),
        "bb": int(totals["baseOnBalls"]),
        "hr": int(totals["homeRuns"]),
        "pitches": int(totals["pitchesThrown"]),
    }


def pitcher_form_score(recent: dict[str, Any]) -> float | None:
    era = parse_float(recent.get("era"))
    if era is None:
        return None
    return max(0.05, min(0.95, (6.2 - era) / 5.2))


def person_name(person: dict[str, Any], fallback: str = "") -> str:
    return str(person.get("fullName") or person.get("boxscoreName") or fallback or "")


def load_existing() -> tuple[dict[str, Any], list[dict[str, str]], list[dict[str, str]]]:
    audit = json.loads((EXPORT_DIR / f"{AUDIT_PREFIX}-audit.json").read_text())
    hr_rows = list(csv.DictReader((EXPORT_DIR / f"{AUDIT_PREFIX}-hr-board.csv").open(newline="", encoding="utf-8")))
    prop_rows = list(csv.DictReader((EXPORT_DIR / f"{AUDIT_PREFIX}-prop-board.csv").open(newline="", encoding="utf-8")))
    log_source(
        "Existing Codex May 1 audit bundle",
        str(EXPORT_DIR / f"{AUDIT_PREFIX}-audit.json"),
        "ok",
        fields=["games", "projections", "odds", "hr_candidates", "batter_props"],
        detail="Read local prior artifact as hypothesis/baseline, not source truth.",
    )
    for source in audit.get("sources") or []:
        log_source(
            f"Prior artifact source: {source.get('source_name') or 'unnamed'}",
            source.get("url") or "",
            "prior_artifact_not_refetched",
            fields=[str(source.get("data_used") or "")],
            detail=str(source.get("notes") or ""),
        )
    return audit, hr_rows, prop_rows


def load_schedule() -> dict[str, dict[str, Any]]:
    url = (
        "https://statsapi.mlb.com/api/v1/schedule?"
        + urllib.parse.urlencode(
            {
                "sportId": 1,
                "date": DATE_STR,
                "hydrate": "probablePitcher,lineups,team,venue,linescore",
            }
        )
    )
    data = fetch_json(
        url,
        source_name="MLB Stats API schedule",
        fields=["gamePk", "status", "probablePitcher", "lineups", "venue", "linescore"],
    )
    out: dict[str, dict[str, Any]] = {}
    for block in data.get("dates", []):
        for game in block.get("games", []):
            away_team = game["teams"]["away"]["team"]
            home_team = game["teams"]["home"]["team"]
            away = normalize_abbr(away_team.get("abbreviation") or "")
            home = normalize_abbr(home_team.get("abbreviation") or "")
            key = f"{away}@{home}"
            lineups = game.get("lineups") or {}
            out[key] = {
                "game_pk": int(game.get("gamePk")),
                "game_date_utc": game.get("gameDate"),
                "status": (game.get("status") or {}).get("detailedState") or "",
                "away": away,
                "home": home,
                "away_team_id": away_team.get("id"),
                "home_team_id": home_team.get("id"),
                "away_name": away_team.get("name") or "",
                "home_name": home_team.get("name") or "",
                "venue": ((game.get("venue") or {}).get("name") or ""),
                "away_probable": game["teams"]["away"].get("probablePitcher") or {},
                "home_probable": game["teams"]["home"].get("probablePitcher") or {},
                "away_lineup": lineups.get("awayPlayers") or [],
                "home_lineup": lineups.get("homePlayers") or [],
            }
    return out


def load_feeds(schedule: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    feeds = {}
    for key, game in schedule.items():
        url = f"https://statsapi.mlb.com/api/v1.1/game/{game['game_pk']}/feed/live"
        try:
            feeds[key] = fetch_json(
                url,
                source_name="MLB Stats API live game feed",
                fields=["boxscore", "officials", "probablePitchers", "gameData.players"],
            )
        except Exception:
            feeds[key] = {}
    return feeds


def load_people(person_ids: set[int]) -> dict[int, dict[str, Any]]:
    out: dict[int, dict[str, Any]] = {}
    ids = sorted(pid for pid in person_ids if pid)
    for start in range(0, len(ids), 40):
        chunk = ids[start : start + 40]
        url = (
            "https://statsapi.mlb.com/api/v1/people?"
            + urllib.parse.urlencode(
                {
                    "personIds": ",".join(str(pid) for pid in chunk),
                    "hydrate": f"stats(group=[hitting,pitching],type=[season,gameLog],season={SEASON})",
                }
            )
        )
        data = fetch_json(
            url,
            source_name="MLB Stats API people/stats",
            fields=["person", "hitting season", "pitching season", "gameLog"],
        )
        for person in data.get("people", []):
            out[int(person["id"])] = person
    return out


def load_savant_tables() -> dict[str, dict[int, dict[str, Any]]]:
    tables: dict[str, dict[int, dict[str, Any]]] = {}
    endpoints = {
        "batter_expected": "https://baseballsavant.mlb.com/leaderboard/expected_statistics?type=batter&year=2026&csv=true",
        "pitcher_expected": "https://baseballsavant.mlb.com/leaderboard/expected_statistics?type=pitcher&year=2026&csv=true",
        "batter_statcast": "https://baseballsavant.mlb.com/leaderboard/statcast?type=batter&year=2026&csv=true",
        "pitcher_statcast": "https://baseballsavant.mlb.com/leaderboard/statcast?type=pitcher&year=2026&csv=true",
        "batter_pitch_arsenal": "https://baseballsavant.mlb.com/leaderboard/pitch-arsenal-stats?type=batter&year=2026&team=&min=1&minPitches=1&pitchType=&sort=4&sortDir=desc&csv=true",
        "pitcher_pitch_arsenal": "https://baseballsavant.mlb.com/leaderboard/pitch-arsenal-stats?type=pitcher&year=2026&team=&min=1&minPitches=1&pitchType=&sort=4&sortDir=desc&csv=true",
        "pitch_speeds": "https://baseballsavant.mlb.com/pitch-arsenals?year=2026&min=1&csv=true",
    }
    for name, url in endpoints.items():
        try:
            rows = fetch_csv(url, source_name=f"Baseball Savant {name}", fields=["Statcast leaderboards"])
        except Exception:
            tables[name] = {}
            continue
        if name in {"batter_pitch_arsenal", "pitcher_pitch_arsenal"}:
            grouped: dict[int, dict[str, Any]] = defaultdict(lambda: {"pitches": []})
            for row in rows:
                pid = parse_int(row.get("player_id"))
                if not pid:
                    continue
                grouped[pid]["pitches"].append(row)
            tables[name] = dict(grouped)
        elif name == "pitch_speeds":
            out = {}
            for row in rows:
                pid = parse_int(row.get("pitcher"))
                if pid:
                    out[pid] = row
            tables[name] = out
        else:
            out = {}
            for row in rows:
                pid = parse_int(row.get("player_id"))
                if pid:
                    out[pid] = row
            tables[name] = out
    return tables


def schedule_for_range(start: date, end: date) -> dict[str, Any]:
    url = (
        "https://statsapi.mlb.com/api/v1/schedule?"
        + urllib.parse.urlencode(
            {
                "sportId": 1,
                "startDate": start.isoformat(),
                "endDate": end.isoformat(),
                "hydrate": "team,linescore,probablePitcher",
            }
        )
    )
    return fetch_json(
        url,
        source_name="MLB Stats API historical schedule",
        fields=["team recent form", "bullpen usage game list"],
    )


def compute_team_recent_form(schedule_data: dict[str, Any]) -> dict[int, dict[str, Any]]:
    today = now_date()
    windows = {7: defaultdict(lambda: {"games": 0, "runs": 0, "allowed": 0, "wins": 0}), 14: defaultdict(lambda: {"games": 0, "runs": 0, "allowed": 0, "wins": 0}), 30: defaultdict(lambda: {"games": 0, "runs": 0, "allowed": 0, "wins": 0})}
    for block in schedule_data.get("dates", []):
        game_date = date.fromisoformat(block.get("date"))
        if game_date >= today:
            continue
        for game in block.get("games", []):
            status = ((game.get("status") or {}).get("detailedState") or "").lower()
            if "final" not in status and "completed" not in status:
                continue
            teams = game.get("teams") or {}
            rows = [
                ("away", teams.get("away") or {}, teams.get("home") or {}),
                ("home", teams.get("home") or {}, teams.get("away") or {}),
            ]
            for _, side, opp in rows:
                team = side.get("team") or {}
                tid = parse_int(team.get("id"))
                runs = parse_int(side.get("score"))
                allowed = parse_int(opp.get("score"))
                if not tid or runs is None or allowed is None:
                    continue
                for days, store in windows.items():
                    if game_date < today - timedelta(days=days):
                        continue
                    item = store[tid]
                    item["games"] += 1
                    item["runs"] += runs
                    item["allowed"] += allowed
                    item["wins"] += 1 if runs > allowed else 0
    out: dict[int, dict[str, Any]] = defaultdict(dict)
    for days, store in windows.items():
        for tid, item in store.items():
            games = item["games"]
            out[tid][f"last_{days}_games"] = games
            out[tid][f"last_{days}_runs_per_game"] = round(item["runs"] / games, 2) if games else None
            out[tid][f"last_{days}_allowed_per_game"] = round(item["allowed"] / games, 2) if games else None
            out[tid][f"last_{days}_win_pct"] = round(item["wins"] / games, 3) if games else None
    return dict(out)


def compute_bullpen_usage(schedule_data: dict[str, Any], target_team_ids: set[int]) -> dict[int, dict[str, Any]]:
    today = now_date()
    usage: dict[int, dict[str, Any]] = defaultdict(
        lambda: {
            "relief_ip_last_1d": 0.0,
            "relief_ip_last_2d": 0.0,
            "relief_ip_last_3d": 0.0,
            "relief_pitches_last_1d": 0,
            "relief_pitches_last_2d": 0,
            "relief_pitches_last_3d": 0,
            "source_games": [],
        }
    )
    for block in schedule_data.get("dates", []):
        game_date = date.fromisoformat(block.get("date"))
        days_back = (today - game_date).days
        if days_back not in {1, 2, 3}:
            continue
        for game in block.get("games", []):
            status = ((game.get("status") or {}).get("detailedState") or "").lower()
            if "final" not in status and "completed" not in status:
                continue
            teams = game.get("teams") or {}
            involved = {
                parse_int(((teams.get("away") or {}).get("team") or {}).get("id")),
                parse_int(((teams.get("home") or {}).get("team") or {}).get("id")),
            }
            if not (involved & target_team_ids):
                continue
            game_pk = parse_int(game.get("gamePk"))
            if not game_pk:
                continue
            url = f"https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live"
            try:
                feed = fetch_json(
                    url,
                    source_name="MLB Stats API prior game feed",
                    fields=["bullpen usage", "boxscore pitching lines"],
                )
            except Exception:
                continue
            box = ((feed.get("liveData") or {}).get("boxscore") or {}).get("teams") or {}
            for side_name in ("away", "home"):
                team_info = (((feed.get("gameData") or {}).get("teams") or {}).get(side_name) or {})
                tid = parse_int(team_info.get("id"))
                if tid not in target_team_ids:
                    continue
                side = box.get(side_name) or {}
                pitchers = side.get("pitchers") or []
                players = side.get("players") or {}
                for idx, pitcher_id in enumerate(pitchers):
                    if idx == 0:
                        continue
                    player = players.get(f"ID{pitcher_id}") or {}
                    stat = ((player.get("stats") or {}).get("pitching") or {})
                    ip = innings_to_float(stat.get("inningsPitched"))
                    pitches = parse_int(stat.get("pitchesThrown")) or 0
                    for window in (1, 2, 3):
                        if days_back <= window:
                            usage[tid][f"relief_ip_last_{window}d"] += ip
                            usage[tid][f"relief_pitches_last_{window}d"] += pitches
                    usage[tid]["source_games"].append(game_pk)
    for tid, item in usage.items():
        weighted_ip = item["relief_ip_last_1d"] * 1.5 + (item["relief_ip_last_2d"] - item["relief_ip_last_1d"]) * 0.8 + (item["relief_ip_last_3d"] - item["relief_ip_last_2d"]) * 0.4
        weighted_pitches = item["relief_pitches_last_1d"] * 0.025 + (item["relief_pitches_last_2d"] - item["relief_pitches_last_1d"]) * 0.012 + (item["relief_pitches_last_3d"] - item["relief_pitches_last_2d"]) * 0.006
        fatigue = max(0.0, min(10.0, weighted_ip + weighted_pitches))
        item["bullpen_fatigue_score"] = round(fatigue, 2)
        item["availability_score_for_model"] = round(max(0.05, min(0.95, 1 - fatigue / 10)), 3)
        item["source_games"] = sorted(set(item["source_games"]))
        for key, value in list(item.items()):
            if key.startswith("relief_ip"):
                item[key] = round(value, 2)
    return dict(usage)


def extract_officials(feed: dict[str, Any]) -> str:
    officials = ((feed.get("gameData") or {}).get("officials") or [])
    for official in officials:
        if str(official.get("officialType") or "").lower() == "home plate":
            return ((official.get("official") or {}).get("fullName") or "")
    return ""


def build_lineup_from_mlb(players: list[dict[str, Any]], status: str) -> list[dict[str, Any]]:
    out = []
    for idx, player in enumerate(players):
        out.append(
            {
                "spot": idx + 1,
                "id": player.get("id"),
                "name": player.get("fullName") or "",
                "position": ((player.get("primaryPosition") or {}).get("abbreviation") or ""),
                "lineup_status": status,
            }
        )
    return out


def build_lineups(existing_game: dict[str, Any], schedule_game: dict[str, Any] | None) -> dict[str, Any]:
    result = {"away": [], "home": [], "status": "", "gaps": []}
    for side in ("away", "home"):
        mlb_players = (schedule_game or {}).get(f"{side}_lineup") or []
        if len(mlb_players) >= 9:
            result[side] = build_lineup_from_mlb(mlb_players[:9], "official_mlb_schedule")
        else:
            fallback = ((existing_game.get("lineups") or {}).get(side) or [])
            result[side] = [
                {
                    "spot": row.get("spot"),
                    "id": row.get("id"),
                    "name": row.get("name") or "",
                    "position": row.get("position") or "",
                    "lineup_status": row.get("status") or "projected_existing_artifact",
                }
                for row in fallback
            ]
            result["gaps"].append(f"{side}_official_lineup_missing")
    statuses = {row.get("lineup_status") for side in ("away", "home") for row in result[side]}
    if statuses == {"official_mlb_schedule"}:
        result["status"] = "official_mlb_schedule"
    elif "official_mlb_schedule" in statuses:
        result["status"] = "partial_official_with_projected_fallback"
    else:
        result["status"] = "projected_existing_artifact"
    return result


def collect_ids(games: list[dict[str, Any]], schedule: dict[str, dict[str, Any]]) -> set[int]:
    ids: set[int] = set()
    for game in games:
        key = game["game_key"]
        for side in ("away", "home"):
            for player in game["resolved_lineups"][side]:
                pid = parse_int(player.get("id"))
                if pid:
                    ids.add(pid)
        sched = schedule.get(key) or {}
        for side in ("away", "home"):
            pp = sched.get(f"{side}_probable") or {}
            pid = parse_int(pp.get("id"))
            if pid:
                ids.add(pid)
            fallback = (((game.get("starters") or {}).get(side) or {}).get("id"))
            pid = parse_int(fallback)
            if pid:
                ids.add(pid)
    return ids


def season_hitting_profile(person: dict[str, Any]) -> dict[str, Any]:
    stat = get_stat_block(person, "hitting", "season")
    pa = parse_int(stat_value(stat, "plateAppearances"))
    ab = parse_int(stat_value(stat, "atBats"))
    hits = parse_int(stat_value(stat, "hits"))
    tb = parse_int(stat_value(stat, "totalBases"))
    return {
        "avg": parse_float(stat_value(stat, "avg")),
        "obp": parse_float(stat_value(stat, "obp")),
        "slg": parse_float(stat_value(stat, "slg")),
        "ops": parse_float(stat_value(stat, "ops")),
        "iso": (parse_float(stat_value(stat, "slg")) - parse_float(stat_value(stat, "avg"))) if parse_float(stat_value(stat, "slg")) is not None and parse_float(stat_value(stat, "avg")) is not None else None,
        "hr": parse_int(stat_value(stat, "homeRuns")),
        "pa": pa,
        "k_pct": (parse_int(stat_value(stat, "strikeOuts")) / pa) if pa else None,
        "bb_pct": (parse_int(stat_value(stat, "baseOnBalls")) / pa) if pa else None,
        "tb_per_ab": (tb / ab) if tb is not None and ab else None,
        "woba": None,
        "wrc_plus": None,
    }


def season_pitching_profile(person: dict[str, Any]) -> dict[str, Any]:
    stat = get_stat_block(person, "pitching", "season")
    bf = parse_int(stat_value(stat, "battersFaced"))
    k = parse_int(stat_value(stat, "strikeOuts"))
    bb = parse_int(stat_value(stat, "baseOnBalls"))
    ip = innings_to_float(stat_value(stat, "inningsPitched"))
    return {
        "era": parse_float(stat_value(stat, "era")),
        "whip": parse_float(stat_value(stat, "whip")),
        "ip": ip,
        "k_pct": (k / bf) if bf else None,
        "bb_pct": (bb / bf) if bf else None,
        "k_minus_bb_pct": ((k - bb) / bf) if bf and k is not None and bb is not None else None,
        "hr9": ((parse_int(stat_value(stat, "homeRuns")) or 0) * 9 / ip) if ip else None,
        "ground_ball_pct": None,
        "fly_ball_pct": None,
        "fip": None,
        "xfip": None,
        "siera": None,
    }


def top_pitch_rows(arsenal: dict[str, Any], limit: int = 3) -> list[dict[str, Any]]:
    rows = arsenal.get("pitches") or []
    rows = sorted(rows, key=lambda row: parse_float(row.get("pitch_usage")) or 0.0, reverse=True)
    return rows[:limit]


def pitch_mix_summary(pitcher_id: int | None, savant: dict[str, dict[int, dict[str, Any]]]) -> str:
    if not pitcher_id:
        return ""
    rows = top_pitch_rows(savant.get("pitcher_pitch_arsenal", {}).get(pitcher_id, {}), 4)
    parts = []
    for row in rows:
        usage = parse_float(row.get("pitch_usage"))
        name = row.get("pitch_name") or row.get("pitch_type") or ""
        if usage is not None:
            parts.append(f"{name} {usage:.1f}%")
    return "; ".join(parts)


def pitch_speed_summary(pitcher_id: int | None, savant: dict[str, dict[int, dict[str, Any]]]) -> str:
    if not pitcher_id:
        return ""
    row = savant.get("pitch_speeds", {}).get(pitcher_id, {})
    parts = []
    labels = [
        ("FF", "ff_avg_speed"),
        ("SI", "si_avg_speed"),
        ("FC", "fc_avg_speed"),
        ("SL", "sl_avg_speed"),
        ("CH", "ch_avg_speed"),
        ("CU", "cu_avg_speed"),
        ("ST", "st_avg_speed"),
    ]
    for label, key in labels:
        value = parse_float(row.get(key))
        if value is not None:
            parts.append(f"{label} {value:.1f}")
    return "; ".join(parts[:4])


def pitch_type_matchup(
    batter_id: int | None,
    pitcher_id: int | None,
    savant: dict[str, dict[int, dict[str, Any]]],
) -> tuple[str, str]:
    if not batter_id or not pitcher_id:
        return "unavailable", "missing player id"
    pitcher_rows = top_pitch_rows(savant.get("pitcher_pitch_arsenal", {}).get(pitcher_id, {}), 2)
    batter_rows = savant.get("batter_pitch_arsenal", {}).get(batter_id, {}).get("pitches") or []
    if not pitcher_rows or not batter_rows:
        return "unavailable", "pitch-type rows missing from Savant"
    batter_by_type = {row.get("pitch_type"): row for row in batter_rows}
    notes = []
    scores = []
    for prow in pitcher_rows:
        pitch_type = prow.get("pitch_type")
        usage = parse_float(prow.get("pitch_usage")) or 0.0
        pitcher_est_woba = parse_float(prow.get("est_woba"))
        brow = batter_by_type.get(pitch_type)
        if not brow:
            notes.append(f"{prow.get('pitch_name') or pitch_type}: batter split unavailable")
            continue
        batter_est_woba = parse_float(brow.get("est_woba"))
        batter_est_slg = parse_float(brow.get("est_slg"))
        if batter_est_woba is None:
            notes.append(f"{prow.get('pitch_name') or pitch_type}: batter est_wOBA unavailable")
            continue
        batter_slg_text = f"{batter_est_slg:.3f}" if batter_est_slg is not None else "unavailable"
        pitcher_woba_text = f"{pitcher_est_woba:.3f}" if pitcher_est_woba is not None else "unavailable"
        score = batter_est_woba - 0.320
        if pitcher_est_woba is not None:
            score += (pitcher_est_woba - 0.320) * 0.55
        scores.append(score * max(0.1, usage / 50.0))
        notes.append(
            f"{prow.get('pitch_name') or pitch_type}: batter est_wOBA {batter_est_woba:.3f}, est_SLG {batter_slg_text}, pitcher allowed est_wOBA {pitcher_woba_text}"
        )
    if not scores:
        return "unavailable", "; ".join(notes)
    score = sum(scores) / len(scores)
    if score >= 0.045:
        label = "favorable"
    elif score <= -0.045:
        label = "unfavorable"
    else:
        label = "neutral"
    return label, "; ".join(notes)


def safe_pitch_type_matchup(
    batter_id: int | None,
    pitcher_id: int | None,
    savant: dict[str, dict[int, dict[str, Any]]],
) -> tuple[str, str]:
    label, note = pitch_type_matchup(batter_id, pitcher_id, savant)
    note = note.replace("nan", "unavailable")
    return label, note


def build_price_maps(
    existing_hr_rows: list[dict[str, str]],
    existing_prop_rows: list[dict[str, str]],
    current_props: dict[str, dict[tuple[str, str], Any]],
) -> tuple[dict[tuple[str, str], dict[str, Any]], dict[tuple[str, str], dict[str, Any]]]:
    hr_map: dict[tuple[str, str], dict[str, Any]] = {}
    tb_map: dict[tuple[str, str], dict[str, Any]] = {}
    for game_key, markets in current_props.items():
        for (player_key, market_key), line in markets.items():
            if is_dataclass(line):
                row = asdict(line)
            else:
                row = dict(line)
            if market_key == "batter_home_runs":
                hr_map[(game_key, player_key)] = {
                    "odds": row.get("over_price"),
                    "point": row.get("point"),
                    "source": row.get("source") or "rotowire_public",
                    "last_update": row.get("last_update") or DATE_STR,
                }
            elif market_key == "batter_total_bases":
                tb_map[(game_key, player_key)] = {
                    "odds": row.get("over_price"),
                    "under_odds": row.get("under_price"),
                    "point": row.get("point"),
                    "source": row.get("source") or "rotowire_public",
                    "last_update": row.get("last_update") or DATE_STR,
                }
    for row in existing_hr_rows:
        key = (row.get("game") or "", normalize_player_name(row.get("player") or ""))
        if key[0] and key[1] and key not in hr_map:
            hr_map[key] = {
                "odds": parse_int(row.get("hr_odds")),
                "point": 0.5,
                "source": row.get("source") or "existing_artifact",
                "last_update": row.get("last_update") or "existing_artifact",
            }
    for row in existing_prop_rows:
        prop = (row.get("prop") or "").lower()
        if "total bases" not in prop:
            continue
        key = (row.get("game") or "", normalize_player_name(row.get("player") or ""))
        if key[0] and key[1] and key not in tb_map:
            tb_map[key] = {
                "odds": parse_int(row.get("current_odds")),
                "point": parse_float(row.get("line")),
                "source": row.get("source") or "existing_artifact",
                "last_update": row.get("last_update") or "existing_artifact",
            }
    return hr_map, tb_map


def row_status_to_cap(lineup_status: str, pitch_matchup: str, has_price: bool, game_status: str) -> tuple[float, list[str]]:
    cap = 7.5
    reasons = []
    if "In Progress" in game_status or "Final" in game_status:
        cap = min(cap, 5.0)
        reasons.append("game already started or completed")
    if lineup_status != "official_mlb_schedule":
        cap = min(cap, 6.5)
        reasons.append("official lineup missing")
    if not has_price:
        cap = min(cap, 5.8)
        reasons.append("prop price missing")
    if pitch_matchup == "unavailable":
        cap = min(cap, 6.0)
        reasons.append("pitch-type matchup missing")
    return cap, reasons


def classify_prop(
    *,
    edge: float | None,
    confidence_cap: float,
    has_price: bool,
    pitch_matchup: str,
    is_hr: bool,
) -> tuple[str, float, str]:
    if not has_price:
        return "WATCHLIST", 0.0, "Missing current/timestamped prop price; cannot be a bet."
    if edge is None:
        return "WATCHLIST", 0.0, "Fair probability or market probability unavailable."
    if confidence_cap < 6.8:
        if is_hr and edge >= 1.5:
            return "LOTTERY", 0.10, "Positive model angle, but confidence gates cap it below BET."
        return "LEAN" if edge >= 2.0 else "PASS", 0.0, "Confidence cap prevents a BET label."
    if pitch_matchup == "unavailable":
        return "WATCHLIST", 0.0, "Pitch-type matchup missing; EchoIQ gates block BET."
    if edge >= 4.0:
        if is_hr:
            return "LOTTERY", 0.15, "HR edge is positive but HR exposure remains capped."
        return "LEAN", 0.0, "Positive edge, but final card requires late price and lineup recheck."
    if edge >= 1.0:
        return "LEAN", 0.0, "Small positive edge; not enough to clear final-card threshold."
    return "PASS", 0.0, "No clear model edge at the available price."


def invalid_odds_reason(raw_odds: int | None, *, is_tb: bool, point: Any = None) -> str:
    if raw_odds is None:
        return ""
    if not valid_american_odds(raw_odds):
        return f"Invalid American odds {raw_odds}; preserved for audit and excluded from edge math."
    if is_tb and not valid_tb_over_odds(raw_odds, point):
        return f"Outlier total-bases price {american_to_str(raw_odds)} at line {point}; requires manual verification and is excluded from edge math."
    return ""


def game_weather(existing_game: dict[str, Any]) -> dict[str, Any]:
    return existing_game.get("weather") or {}


def build_artifacts() -> dict[str, Any]:
    existing, existing_hr_rows, existing_prop_rows = load_existing()
    schedule = load_schedule()
    feeds = load_feeds(schedule)

    games: list[dict[str, Any]] = []
    for game in existing.get("games") or []:
        key = game["game_key"]
        sched = schedule.get(key)
        resolved_lineups = build_lineups(game, sched)
        merged = dict(game)
        merged["current_status"] = (sched or {}).get("status") or game.get("status")
        merged["game_pk"] = (sched or {}).get("game_pk") or game.get("game_pk")
        merged["game_date_utc"] = (sched or {}).get("game_date_utc") or game.get("game_date_utc")
        merged["resolved_lineups"] = resolved_lineups
        merged["home_plate_umpire"] = extract_officials(feeds.get(key) or {}) or ((game.get("umpire") or {}).get("home_plate") or "")
        games.append(merged)

    person_ids = collect_ids(games, schedule)
    people = load_people(person_ids)
    savant = load_savant_tables()

    historical_schedule = schedule_for_range(now_date() - timedelta(days=30), now_date() - timedelta(days=1))
    team_form = compute_team_recent_form(historical_schedule)
    team_ids = {
        parse_int(game.get("away", {}).get("team_id")) for game in existing.get("games", [])
    } | {
        parse_int(game.get("home", {}).get("team_id")) for game in existing.get("games", [])
    }
    team_ids = {tid for tid in team_ids if tid}
    bullpen = compute_bullpen_usage(historical_schedule, team_ids)

    try:
        rotowire_odds = fetch_rotowire_game_odds(DATE_STR, schedule)
        log_source(
            "RotoWire public game odds table",
            "https://www.rotowire.com/betting/mlb/tables/mlb-games.php?date=2026-05-01",
            "ok",
            fields=["moneyline", "total", "bookmaker median"],
            row_count=len(rotowire_odds),
        )
    except Exception as exc:
        rotowire_odds = {}
        log_source(
            "RotoWire public game odds table",
            "https://www.rotowire.com/betting/mlb/tables/mlb-games.php?date=2026-05-01",
            "failed",
            fields=["moneyline", "total"],
            detail=str(exc),
        )

    try:
        rotowire_props = fetch_rotowire_prop_markets(DATE_STR)
        log_source(
            "RotoWire public player props",
            "https://www.rotowire.com/betting/mlb/player-props.php?date=2026-05-01",
            "ok",
            fields=["HR odds", "total bases odds"],
            row_count=sum(len(v) for v in rotowire_props.values()),
        )
    except Exception as exc:
        rotowire_props = {}
        log_source(
            "RotoWire public player props",
            "https://www.rotowire.com/betting/mlb/player-props.php?date=2026-05-01",
            "failed",
            fields=["HR odds", "total bases odds"],
            detail=str(exc),
        )

    hr_prices, tb_prices = build_price_maps(existing_hr_rows, existing_prop_rows, rotowire_props)
    projections_by_game = {row["game"]: row for row in existing.get("projections") or []}

    starter_rows: list[dict[str, Any]] = []
    hitter_rows: list[dict[str, Any]] = []
    hr_board: list[dict[str, Any]] = []
    tb_board: list[dict[str, Any]] = []
    game_predictions: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []

    for game in games:
        key = game["game_key"]
        away = game["away"]["abbr"]
        home = game["home"]["abbr"]
        sched = schedule.get(key) or {}
        weather = game_weather(game)
        odds_obj = rotowire_odds.get(key)
        old_odds = game.get("odds") or {}
        if odds_obj:
            odds = asdict(odds_obj)
            odds_status = "rotowire_public_refreshed"
        else:
            odds = {
                "away_moneyline": old_odds.get("away_moneyline"),
                "home_moneyline": old_odds.get("home_moneyline"),
                "total_line": old_odds.get("total_line"),
                "over_price": old_odds.get("over_price"),
                "under_price": old_odds.get("under_price"),
                "last_update": old_odds.get("last_update"),
                "source": old_odds.get("source"),
            }
            odds_status = "existing_timestamped_artifact"

        away_ml = parse_int(odds.get("away_moneyline"))
        home_ml = parse_int(odds.get("home_moneyline"))
        no_vig = devig_two_way(away_ml, home_ml) if away_ml is not None and home_ml is not None else (None, None)
        projection = projections_by_game.get(key) or {}
        winner = away if (parse_float(projection.get("away_win_probability")) or 0) >= (parse_float(projection.get("home_win_probability")) or 0) else home

        away_bullpen = bullpen.get(parse_int(game["away"].get("team_id")) or -1, {})
        home_bullpen = bullpen.get(parse_int(game["home"].get("team_id")) or -1, {})
        lineup_status = game["resolved_lineups"]["status"]
        gap_reasons = list(game["resolved_lineups"].get("gaps") or [])
        if not odds.get("away_moneyline") or not odds.get("home_moneyline"):
            gap_reasons.append("moneyline_missing")
        if not odds.get("total_line"):
            gap_reasons.append("total_missing")
        if not game.get("home_plate_umpire"):
            gap_reasons.append("home_plate_umpire_missing")
        if gap_reasons:
            unresolved.append({"game": key, "category": "game_integrity", "fields": gap_reasons, "impact": "confidence capped; no automatic BET label"})

        game_predictions.append(
            {
                "game_key": key,
                "game_pk": game.get("game_pk"),
                "date": DATE_STR,
                "start_time": game.get("start_time_et"),
                "venue": game.get("venue"),
                "status": game.get("current_status"),
                "away_team": away,
                "home_team": home,
                "away_starter": (((sched.get("away_probable") or {}).get("fullName")) or ((game.get("starters") or {}).get("away") or {}).get("name")),
                "home_starter": (((sched.get("home_probable") or {}).get("fullName")) or ((game.get("starters") or {}).get("home") or {}).get("name")),
                "starter_status": "mlb_probable_current" if sched else ((game.get("starters") or {}).get("overall_status") or ""),
                "lineup_status": lineup_status,
                "weather": weather.get("summary"),
                "roof_status": weather.get("roof_type"),
                "park_factor_run_environment": weather.get("park_grade"),
                "hr_environment": weather.get("park_grade"),
                "current_ml": f"{away} {american_to_str(away_ml)} / {home} {american_to_str(home_ml)}",
                "current_run_line": "unavailable",
                "current_total": odds.get("total_line"),
                "opening_odds": old_odds.get("opening_moneyline") or "unavailable",
                "first_five_lines": old_odds.get("first_five") or "unavailable",
                "team_totals": old_odds.get("team_totals") or "unavailable",
                "home_plate_umpire": game.get("home_plate_umpire") or "",
                "bullpen_usage_away_1_2_3d": f"{away_bullpen.get('relief_ip_last_1d', '')}/{away_bullpen.get('relief_ip_last_2d', '')}/{away_bullpen.get('relief_ip_last_3d', '')}",
                "bullpen_usage_home_1_2_3d": f"{home_bullpen.get('relief_ip_last_1d', '')}/{home_bullpen.get('relief_ip_last_2d', '')}/{home_bullpen.get('relief_ip_last_3d', '')}",
                "bullpen_fatigue_away": away_bullpen.get("bullpen_fatigue_score"),
                "bullpen_fatigue_home": home_bullpen.get("bullpen_fatigue_score"),
                "source_confidence": game.get("source_confidence"),
                "data_integrity_grade": (game.get("data_integrity") or {}).get("grade"),
                "confidence_cap": (game.get("data_integrity") or {}).get("max_confidence_cap"),
                "projected_winner": winner,
                "projected_score": projection.get("projected_score"),
                "away_projected_runs": projection.get("away_projected_runs"),
                "home_projected_runs": projection.get("home_projected_runs"),
                "projected_total": projection.get("projected_total"),
                "market_total": odds.get("total_line"),
                "total_lean": "over" if (parse_float(projection.get("projected_total")) or 0) > (parse_float(odds.get("total_line")) or 999) else "under/pass",
                "away_win_probability": projection.get("away_win_probability"),
                "home_win_probability": projection.get("home_win_probability"),
                "away_fair_ml": projection.get("away_fair_ml"),
                "home_fair_ml": projection.get("home_fair_ml"),
                "market_no_vig_away": no_vig[0],
                "market_no_vig_home": no_vig[1],
                "odds_status": odds_status,
                "best_side": winner,
                "best_total": "no BET; model total angle only",
                "best_prop_angle": "see enriched TB board",
                "best_hr_angle": "see enriched HR board",
                "pass_avoid_notes": "; ".join(gap_reasons) if gap_reasons else "No final-card gate failure beyond price/edge review.",
                "what_would_change_pick": "starter change, lineup change, weather/roof update, bullpen news, or price move",
            }
        )

        for side in ("away", "home"):
            team = away if side == "away" else home
            opp = home if side == "away" else away
            pitcher = sched.get(f"{side}_probable") or {}
            pid = parse_int(pitcher.get("id")) or parse_int((((game.get("starters") or {}).get(side) or {}).get("id")))
            person = people.get(pid or -1, {})
            pitch_stats = season_pitching_profile(person)
            expected = savant.get("pitcher_expected", {}).get(pid or -1, {})
            statcast = savant.get("pitcher_statcast", {}).get(pid or -1, {})
            logs = get_game_log(person, "pitching")
            recent = aggregate_pitching_logs(logs)
            starter_rows.append(
                {
                    "game_key": key,
                    "team": team,
                    "opponent": opp,
                    "player_id": pid,
                    "pitcher": pitcher.get("fullName") or person_name(person, (((game.get("starters") or {}).get(side) or {}).get("name") or "")),
                    "handedness": (((person.get("pitchHand") or {}).get("code")) or ""),
                    "confirmation_status": "mlb_probable_current" if pitcher.get("id") else (((game.get("starters") or {}).get(side) or {}).get("status") or "unverified"),
                    "era": pitch_stats.get("era"),
                    "fip": pitch_stats.get("fip"),
                    "xfip": pitch_stats.get("xfip"),
                    "siera": pitch_stats.get("siera"),
                    "whip": pitch_stats.get("whip"),
                    "ip": pitch_stats.get("ip"),
                    "k_pct": pitch_stats.get("k_pct"),
                    "bb_pct": pitch_stats.get("bb_pct"),
                    "k_minus_bb_pct": pitch_stats.get("k_minus_bb_pct"),
                    "hr_per_9": pitch_stats.get("hr9"),
                    "ground_ball_pct": pitch_stats.get("ground_ball_pct"),
                    "fly_ball_pct": pitch_stats.get("fly_ball_pct"),
                    "hard_hit_allowed_pct": pct(statcast.get("ev95percent")),
                    "barrel_allowed_pct": pct(statcast.get("brl_percent")),
                    "avg_exit_velocity_allowed": parse_float(statcast.get("avg_hit_speed")),
                    "xera": parse_float(expected.get("xera")),
                    "xba_allowed": parse_float(expected.get("est_ba")),
                    "xslg_allowed": parse_float(expected.get("est_slg")),
                    "xwoba_allowed": parse_float(expected.get("est_woba")),
                    "pitch_count_trend": recent.get("pitches"),
                    "rest_days": "",
                    "recent_3_starts": json.dumps(recent, sort_keys=True),
                    "recent_velocity_trend": "unavailable",
                    "pitch_mix": pitch_mix_summary(pid, savant),
                    "pitch_speeds": pitch_speed_summary(pid, savant),
                    "whiff_pct": "",
                    "chase_pct": "",
                    "csw_pct": "",
                    "platoon_splits": "unavailable",
                    "times_through_order_concern": "unavailable",
                    "injury_workload_context": "not sourced; no inference from absences",
                    "strikeout_prop_line_odds": "unavailable",
                    "outs_prop_line_odds": "unavailable",
                    "er_hits_walks_props": "unavailable",
                    "matchup_implication": "see game prediction and hitter pitch-type rows",
                    "first_five_implication": "unavailable without F5 market",
                    "full_game_implication": "bullpen context included in game table",
                }
            )

        lineup_rows_by_team = {}
        for side in ("away", "home"):
            team = away if side == "away" else home
            lineup_rows_by_team[team] = [
                [str(row.get("spot") or ""), row.get("name") or "", "", "", "", "", ""]
                for row in game["resolved_lineups"][side]
            ]

        for side in ("away", "home"):
            team = away if side == "away" else home
            opp = home if side == "away" else away
            opp_side = "home" if side == "away" else "away"
            opp_pitcher = sched.get(f"{opp_side}_probable") or {}
            opp_pid = parse_int(opp_pitcher.get("id")) or parse_int((((game.get("starters") or {}).get(opp_side) or {}).get("id")))
            opp_person = people.get(opp_pid or -1, {})
            opp_expected = savant.get("pitcher_expected", {}).get(opp_pid or -1, {})
            opp_statcast = savant.get("pitcher_statcast", {}).get(opp_pid or -1, {})
            opp_recent_score = pitcher_form_score(aggregate_pitching_logs(get_game_log(opp_person, "pitching")))
            opp_team_id = parse_int(game["home"].get("team_id") if side == "away" else game["away"].get("team_id"))
            opp_bullpen_avail = bullpen.get(opp_team_id or -1, {}).get("availability_score_for_model")
            for player in game["resolved_lineups"][side]:
                pid = parse_int(player.get("id"))
                person = people.get(pid or -1, {})
                hitting = season_hitting_profile(person)
                logs = get_game_log(person, "hitting")
                recent7 = aggregate_hitting_logs(logs, 7)
                recent14 = aggregate_hitting_logs(logs, 14)
                recent30 = aggregate_hitting_logs(logs, 30)
                expected = savant.get("batter_expected", {}).get(pid or -1, {})
                statcast = savant.get("batter_statcast", {}).get(pid or -1, {})
                bats = ((person.get("batSide") or {}).get("code")) or player.get("bat_side") or ""
                throws = ((person.get("pitchHand") or {}).get("code")) or ""
                opp_hand = ((opp_person.get("pitchHand") or {}).get("code")) or ""
                pt_label, pt_note = safe_pitch_type_matchup(pid, opp_pid, savant)
                lineup_status = player.get("lineup_status") or game["resolved_lineups"]["status"]
                status_for_cap = "official_mlb_schedule" if lineup_status == "official_mlb_schedule" else game["resolved_lineups"]["status"]
                hr_price = hr_prices.get((key, normalize_player_name(player.get("name") or "")), {})
                tb_price = tb_prices.get((key, normalize_player_name(player.get("name") or "")), {})

                hr_prob, tb_prob, fair_hr, fair_tb, hr_tier, tb_tier, model_conf = batter_hr_two_tb(
                    away,
                    home,
                    side == "away",
                    player.get("name") or "",
                    lineup_rows_by_team[team],
                    [["xERA", str(parse_float(opp_expected.get("xera")) or "")]],
                    batter_hand=bats,
                    pitcher_hand=opp_hand,
                    xslg_override=parse_float(expected.get("est_slg")),
                    barrel_rate=pct(statcast.get("brl_percent")),
                    actual_slg=hitting.get("slg"),
                    hard_hit_rate=pct(statcast.get("ev95percent")),
                    avg_hit_speed=parse_float(statcast.get("avg_hit_speed")),
                    est_ba=parse_float(expected.get("est_ba")),
                    plate_appearances=hitting.get("pa"),
                    home_runs=hitting.get("hr"),
                    opp_xera_override=parse_float(opp_expected.get("xera")),
                    opp_est_slg=parse_float(opp_expected.get("est_slg")),
                    opp_barrel_rate=pct(opp_statcast.get("brl_percent")),
                    opp_hard_hit_rate=pct(opp_statcast.get("ev95percent")),
                    recent_slg=recent14.get("slg"),
                    recent_ops=recent14.get("ops"),
                    recent_hr_rate=recent14.get("hr_rate"),
                    recent_tb_rate=recent14.get("tb_rate"),
                    weather_factor=parse_float(weather.get("run_factor")),
                    opp_bullpen_score=parse_float(opp_bullpen_avail),
                    starter_recent_form_score=opp_recent_score,
                    include_bvp=False,
                )

                hr_odds_raw = parse_int(hr_price.get("odds"))
                tb_odds_raw = parse_int(tb_price.get("odds"))
                hr_odds_valid = valid_american_odds(hr_odds_raw)
                tb_odds_valid = valid_tb_over_odds(tb_odds_raw, tb_price.get("point"))
                hr_odds = hr_odds_raw if hr_odds_valid else None
                tb_odds = tb_odds_raw if tb_odds_valid else None
                hr_impl = implied_probability(hr_odds)
                tb_impl = implied_probability(tb_odds)
                hr_edge = edge_pp(hr_prob, hr_impl)
                tb_edge = edge_pp(tb_prob, tb_impl)
                hr_cap, hr_cap_reasons = row_status_to_cap(status_for_cap, pt_label, hr_odds_valid, game.get("current_status") or "")
                tb_cap, tb_cap_reasons = row_status_to_cap(status_for_cap, pt_label, tb_odds_valid, game.get("current_status") or "")
                hr_label, hr_units, hr_reason = classify_prop(
                    edge=hr_edge,
                    confidence_cap=hr_cap,
                    has_price=hr_odds_valid,
                    pitch_matchup=pt_label,
                    is_hr=True,
                )
                tb_label, tb_units, tb_reason = classify_prop(
                    edge=tb_edge,
                    confidence_cap=tb_cap,
                    has_price=tb_odds_valid,
                    pitch_matchup=pt_label,
                    is_hr=False,
                )
                hr_invalid_reason = invalid_odds_reason(hr_odds_raw, is_tb=False)
                tb_invalid_reason = invalid_odds_reason(tb_odds_raw, is_tb=True, point=tb_price.get("point"))
                if hr_invalid_reason:
                    hr_label, hr_units, hr_reason = "PASS", 0.0, hr_invalid_reason
                    hr_cap_reasons = [*hr_cap_reasons, "invalid_market_odds"]
                if tb_invalid_reason:
                    tb_label, tb_units, tb_reason = "PASS", 0.0, tb_invalid_reason
                    tb_cap_reasons = [*tb_cap_reasons, "invalid_or_outlier_market_odds"]

                hitter_row = {
                    "player_id": pid,
                    "player_name": player.get("name"),
                    "team": team,
                    "opponent": opp,
                    "game": key,
                    "lineup_spot": player.get("spot"),
                    "position": player.get("position"),
                    "lineup_status": lineup_status,
                    "bats": bats,
                    "throws": throws,
                    "starter_opposing_pitcher": opp_pitcher.get("fullName") or (((game.get("starters") or {}).get(opp_side) or {}).get("name")),
                    "opposing_pitcher_handedness": opp_hand,
                    "avg": hitting.get("avg"),
                    "obp": hitting.get("obp"),
                    "slg": hitting.get("slg"),
                    "ops": hitting.get("ops"),
                    "iso": hitting.get("iso"),
                    "woba": hitting.get("woba"),
                    "wrc_plus": hitting.get("wrc_plus"),
                    "hr": hitting.get("hr"),
                    "pa": hitting.get("pa"),
                    "k_pct": hitting.get("k_pct"),
                    "bb_pct": hitting.get("bb_pct"),
                    "hard_hit_pct": pct(statcast.get("ev95percent")),
                    "barrel_pct": pct(statcast.get("brl_percent")),
                    "average_exit_velocity": parse_float(statcast.get("avg_hit_speed")),
                    "launch_angle": parse_float(statcast.get("avg_hit_angle")),
                    "sweet_spot_pct": pct(statcast.get("anglesweetspotpercent")),
                    "xba": parse_float(expected.get("est_ba")),
                    "xslg": parse_float(expected.get("est_slg")),
                    "xwoba": parse_float(expected.get("est_woba")),
                    "bat_speed": "",
                    "squared_up_rate": "",
                    "split_vs_lhp": "unavailable",
                    "split_vs_rhp": "unavailable",
                    "home_road_split": "unavailable",
                    "last_7_days": json.dumps(recent7, sort_keys=True),
                    "last_14_days": json.dumps(recent14, sort_keys=True),
                    "last_30_days": json.dumps(recent30, sort_keys=True),
                    "current_streak": "unavailable",
                    "bvp_pa": "",
                    "bvp_ab": "",
                    "bvp_h": "",
                    "bvp_2b": "",
                    "bvp_3b": "",
                    "bvp_hr": "",
                    "bvp_bb": "",
                    "bvp_k": "",
                    "bvp_avg": "",
                    "bvp_slg": "",
                    "bvp_ops": "",
                    "bvp_sample_warning": "BvP fetch not used in model; point-in-time safe history unavailable",
                    "opposing_pitcher_pitch_mix": pitch_mix_summary(opp_pid, savant),
                    "batter_vs_main_pitch_types": pt_note,
                    "batter_vs_velocity_band": "unavailable",
                    "pitcher_whiff_chase_contact_allowed": pt_note,
                    "pitch_type_matchup": pt_label,
                    "pitch_type_explanation": pt_note,
                    "hit_prop_line_odds": "unavailable",
                    "total_bases_line": tb_price.get("point") or "",
                    "total_bases_odds": american_to_str(tb_odds_raw),
                    "total_bases_market_odds_status": "valid" if tb_odds_valid else ("missing" if tb_odds_raw is None else "invalid_or_outlier_market_odds"),
                    "hr_odds": american_to_str(hr_odds_raw),
                    "hr_market_odds_status": "valid" if hr_odds_valid else ("missing" if hr_odds_raw is None else "invalid_market_odds"),
                    "hr_implied_probability": hr_impl,
                    "hr_fair_probability": hr_prob,
                    "hr_fair_odds": fair_hr,
                    "hr_edge_pct": hr_edge,
                    "tb_implied_probability": tb_impl,
                    "tb_fair_probability": tb_prob,
                    "tb_fair_odds": fair_tb,
                    "tb_edge_pct": tb_edge,
                    "model_confidence": model_conf,
                    "recommendation_label_hr": hr_label,
                    "recommendation_label_tb": tb_label,
                    "confidence_cap_hr": hr_cap,
                    "confidence_cap_tb": tb_cap,
                    "what_kills_the_prop": "lineup/starter change, price move through pass threshold, roof/weather change, or missing pitch-type/Statcast source conflict",
                }
                hitter_rows.append(hitter_row)
                if "bat_speed" not in hitter_row or not hitter_row["bat_speed"]:
                    unresolved.append({"game": key, "player": player.get("name"), "category": "player_metric_gap", "fields": ["bat_speed", "squared_up_rate"], "impact": "not provided by selected public Savant CSV endpoints"})
                if not hr_price:
                    unresolved.append({"game": key, "player": player.get("name"), "category": "prop_market_gap", "fields": ["hr_odds"], "impact": "HR row capped at WATCHLIST/PASS if no price"})
                if not tb_price:
                    unresolved.append({"game": key, "player": player.get("name"), "category": "prop_market_gap", "fields": ["total_bases_odds"], "impact": "TB row capped at WATCHLIST/PASS if no price"})
                if hr_invalid_reason:
                    unresolved.append({"game": key, "player": player.get("name"), "category": "market_odds_quality", "fields": ["hr_odds"], "impact": hr_invalid_reason})
                if tb_invalid_reason:
                    unresolved.append({"game": key, "player": player.get("name"), "category": "market_odds_quality", "fields": ["total_bases_odds"], "impact": tb_invalid_reason})

                hr_board.append(
                    {
                        "rank": 0,
                        "player": player.get("name"),
                        "team": team,
                        "game": key,
                        "lineup_spot": player.get("spot"),
                        "lineup_status": lineup_status,
                        "hr_odds": american_to_str(hr_odds_raw),
                        "market_odds_status": "valid" if hr_odds_valid else ("missing" if hr_odds_raw is None else "invalid_market_odds"),
                        "implied_probability": hr_impl,
                        "estimated_hr_probability": hr_prob,
                        "fair_odds": fair_hr,
                        "edge_pct": hr_edge,
                        "batter_hr_profile": f"{hitting.get('hr') or 0} HR / {hitting.get('pa') or ''} PA",
                        "barrel_pct": pct(statcast.get("brl_percent")),
                        "hard_hit_pct": pct(statcast.get("ev95percent")),
                        "pull_fly_ball_profile": "unavailable",
                        "launch_angle": parse_float(statcast.get("avg_hit_angle")),
                        "xslg": parse_float(expected.get("est_slg")),
                        "xwoba": parse_float(expected.get("est_woba")),
                        "opposing_pitcher_hr9": season_pitching_profile(opp_person).get("hr9"),
                        "pitcher_barrel_allowed": pct(opp_statcast.get("brl_percent")),
                        "pitcher_hard_hit_allowed": pct(opp_statcast.get("ev95percent")),
                        "pitch_type_fit": pt_label,
                        "bvp_context": "unavailable/not used; BvP is supporting only",
                        "park_weather_impact": weather.get("summary"),
                        "bullpen_hr_risk": bullpen.get(opp_team_id or -1, {}).get("bullpen_fatigue_score"),
                        "label": hr_label,
                        "confidence": min(hr_cap, 7.5),
                        "unit_size": hr_units,
                        "short_reason": hr_reason,
                        "required_recheck": "; ".join(hr_cap_reasons) if hr_cap_reasons else "price, lineup, starter, weather, bullpen",
                        "source": hr_price.get("source") or "",
                        "last_update": hr_price.get("last_update") or "",
                    }
                )
                tb_board.append(
                    {
                        "rank": 0,
                        "player": player.get("name"),
                        "team": team,
                        "game": key,
                        "lineup_spot": player.get("spot"),
                        "lineup_status": lineup_status,
                        "tb_line": tb_price.get("point") or "",
                        "odds": american_to_str(tb_odds_raw),
                        "market_odds_status": "valid" if tb_odds_valid else ("missing" if tb_odds_raw is None else "invalid_or_outlier_market_odds"),
                        "implied_probability": tb_impl,
                        "estimated_fair_probability": tb_prob,
                        "fair_odds": fair_tb,
                        "edge_pct": tb_edge,
                        "season_tb_profile": f"{fmt(hitting.get('tb_per_ab'), 3)} TB/AB",
                        "recent_form": json.dumps(recent14, sort_keys=True),
                        "split_vs_handedness": "unavailable",
                        "pitch_type_matchup": pt_label,
                        "statcast_contact_quality": f"xSLG {fmt(expected.get('est_slg'), 3)}; hard-hit {fmt_pct(pct(statcast.get('ev95percent')), 1)}%",
                        "bvp_context": "unavailable/not used; BvP is supporting only",
                        "park_weather_impact": weather.get("summary"),
                        "bullpen_matchup": bullpen.get(opp_team_id or -1, {}).get("bullpen_fatigue_score"),
                        "label": tb_label,
                        "confidence": min(tb_cap, 7.5),
                        "unit_size": tb_units,
                        "short_reason": tb_reason,
                        "required_recheck": "; ".join(tb_cap_reasons) if tb_cap_reasons else "price, lineup, starter, weather, bullpen",
                        "source": tb_price.get("source") or "",
                        "last_update": tb_price.get("last_update") or "",
                    }
                )

    hr_board.sort(key=lambda row: (parse_float(row.get("estimated_hr_probability")) or 0.0, parse_float(row.get("edge_pct")) or -999), reverse=True)
    tb_board.sort(key=lambda row: (parse_float(row.get("edge_pct")) if row.get("edge_pct") not in {None, ""} else -999, parse_float(row.get("estimated_fair_probability")) or 0.0), reverse=True)
    for idx, row in enumerate(hr_board, 1):
        row["rank"] = idx
    for idx, row in enumerate(tb_board, 1):
        row["rank"] = idx

    final_card = [
        row
        for row in (
            [
                {
                    "market": "HR",
                    "game": row["game"],
                    "player": row["player"],
                    "selection": f"{row['player']} HR",
                    "odds": row["hr_odds"],
                    "implied_probability": row["implied_probability"],
                    "fair_probability": row["estimated_hr_probability"],
                    "fair_price": row["fair_odds"],
                    "edge_pct": row["edge_pct"],
                    "confidence": row["confidence"],
                    "unit_size": row["unit_size"],
                    "playable_price": row["fair_odds"],
                    "pass_price": "",
                    "what_kills_it": row["required_recheck"],
                    "label": row["label"],
                }
                for row in hr_board
                if row["label"] == "BET"
            ]
            + [
                {
                    "market": "TB",
                    "game": row["game"],
                    "player": row["player"],
                    "selection": f"{row['player']} over {row['tb_line']} total bases",
                    "odds": row["odds"],
                    "implied_probability": row["implied_probability"],
                    "fair_probability": row["estimated_fair_probability"],
                    "fair_price": row["fair_odds"],
                    "edge_pct": row["edge_pct"],
                    "confidence": row["confidence"],
                    "unit_size": row["unit_size"],
                    "playable_price": row["fair_odds"],
                    "pass_price": "",
                    "what_kills_it": row["required_recheck"],
                    "label": row["label"],
                }
                for row in tb_board
                if row["label"] == "BET"
            ]
        )
    ]

    audit_json = {
        "slate_date": DATE_STR,
        "audit_timestamp": RUN_TIMESTAMP,
        "model_type": "existing repo prop_model heuristic with public MLB/Savant/RotoWire enrichment; no strict compute and no paid API calls",
        "games": game_predictions,
        "hitter_player_table": hitter_rows,
        "starting_pitcher_table": starter_rows,
        "hr_board": hr_board,
        "total_bases_board": tb_board,
        "final_card": final_card,
        "unresolved_gaps": unresolved,
        "source_log": SOURCE_LOG,
        "differences_from_prior_reports": [
            {
                "prior_claim": "GPT/Echo report upgraded Brewers ML, Astros ML, Athletics ML, Liberatore K under, and Olson TB as playable/conditional.",
                "new_evidence": "More MLB lineups are official and bullpen/Statcast layers are now present, but F5/team-total/pitcher-prop markets and full injury data remain unavailable; final-card gate remains closed.",
                "decision": "downgraded_to_watchlist_or_pass",
            },
            {
                "prior_claim": "PDF report recommended ARI/CHC under 7.5 and Misiorowski K over.",
                "new_evidence": "This builder does not ingest current pitcher strikeout markets or in-game total changes; AZ@CHC was already in progress during the run.",
                "decision": "not_final_card_eligible",
            },
            {
                "prior_claim": "Existing Codex artifact said HR fair probabilities were unavailable.",
                "new_evidence": "HR/TB fair probabilities are now generated for lineup hitters using existing prop_model plus public Savant/MLB inputs, but these are heuristic and still capped by price/lineup/weather gaps.",
                "decision": "upgraded_to_model_watchlist_not_BET",
            },
        ],
    }

    return audit_json


def csv_value(value: Any) -> Any:
    if value is None:
        return ""
    if isinstance(value, float):
        return round(value, 6)
    if isinstance(value, (dict, list)):
        return json.dumps(value, sort_keys=True)
    return value


def write_csv(path: Path, rows: list[dict[str, Any]], headers: list[str] | None = None) -> None:
    if headers is None:
        headers = sorted({key for row in rows for key in row.keys()})
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=headers, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({header: csv_value(row.get(header)) for header in headers})


def build_report(audit: dict[str, Any]) -> str:
    games = audit["games"]
    hr = audit["hr_board"]
    tb = audit["total_bases_board"]
    card = audit["final_card"]
    gaps = audit["unresolved_gaps"]
    official_games = sum(1 for game in games if game.get("lineup_status") == "official_mlb_schedule")
    partial_games = sum(1 for game in games if game.get("lineup_status") == "partial_official_with_projected_fallback")
    projected_games = sum(1 for game in games if game.get("lineup_status") == "projected_existing_artifact")
    bet_rows = len([row for row in card if row.get("label") == "BET"])
    top_hr = hr[:10]
    top_tb = tb[:20]

    lines = [
        "# EchoIQ MLB Cold-Hard Slate Audit",
        f"Date: Friday, May 1, 2026",
        f"Audit timestamp: {audit['audit_timestamp']}",
        "",
        "## A. What Was Completed",
        f"- Refreshed the MLB Stats API schedule/live-feed layer for all {len(games)} games.",
        f"- Resolved lineup status: {official_games} fully official, {partial_games} partial official, {projected_games} projected fallback.",
        f"- Built player-level hitter rows: {len(audit['hitter_player_table'])}.",
        f"- Built starting-pitcher rows: {len(audit['starting_pitcher_table'])}.",
        f"- Added public Baseball Savant expected/statcast and pitch-type context where available.",
        f"- Computed bullpen usage/fatigue from prior MLB boxscore feeds.",
        f"- Computed heuristic HR/TB fair probabilities through the existing repo prop model.",
        "",
        "## B. What Remains Unavailable",
        "- Full injury/scratch feed was not ingested from an official injury source; no absences were inferred.",
        "- FanGraphs-only fields such as FIP, xFIP, SIERA, wRC+, and handedness splits remain unavailable.",
        "- First-five lines, team totals, pitcher props, hit props, and opening odds remain unavailable unless already present in the prior artifact.",
        "- BvP was not used in the model because the available source path is not point-in-time safe; rows retain this as a documented gap.",
        "- Bat speed and squared-up rate were not available from the selected public Savant CSV endpoints.",
        "",
        "## C. Data Integrity Dashboard",
        "| Game | Lineup | Starter | Weather | Odds | Bullpen | Statcast | BvP | Prop | Grade | Cap |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for game in games:
        weather_status = "available" if game.get("weather") else "missing"
        lines.append(
            f"| {game.get('game_key', '')} | {game.get('lineup_status', '')} | {game.get('starter_status', '')} | {weather_status} | {game.get('odds_status', '')} | computed | available_public_savant | unavailable_not_used | partial | {game.get('data_integrity_grade', '')} | {game.get('confidence_cap', '')} |"
        )

    lines.extend(
        [
            "",
            "## D. Final Game Predictions",
            "| Game | Projected Winner | Projected Score | Away Win | Home Win | Market | Action |",
            "| --- | --- | --- | --- | --- | --- | --- |",
        ]
    )
    for game in games:
        lines.append(
            f"| {game['game_key']} | {game['projected_winner']} | {game.get('projected_score') or ''} | {fmt_pct(game.get('away_win_probability'), 1)}% | {fmt_pct(game.get('home_win_probability'), 1)}% | {game.get('current_ml') or ''} | PASS/no BET |"
        )

    lines.extend(["", "## E. Final HR Board", "| Rank | Player | Game | HR Prob | Odds | Edge | Label | Reason |", "| --- | --- | --- | --- | --- | --- | --- | --- |"])
    for row in top_hr:
        lines.append(
            f"| {row['rank']} | {row['player']} | {row['game']} | {fmt_pct(row.get('estimated_hr_probability'), 1)}% | {row.get('hr_odds') or ''} | {row.get('edge_pct') if row.get('edge_pct') is not None else ''} | {row['label']} | {row['short_reason']} |"
        )

    lines.extend(["", "## F. Final Total Bases Board", "| Rank | Player | Game | TB Prob | Odds | Edge | Label | Reason |", "| --- | --- | --- | --- | --- | --- | --- | --- |"])
    for row in top_tb:
        lines.append(
            f"| {row['rank']} | {row['player']} | {row['game']} | {fmt_pct(row.get('estimated_fair_probability'), 1)}% | {row.get('odds') or ''} | {row.get('edge_pct') if row.get('edge_pct') is not None else ''} | {row['label']} | {row['short_reason']} |"
        )

    lines.extend(
        [
            "",
            "## G. Batter-vs-Pitcher and Historical Matchup Notes",
            "BvP remains documented but not model-driving. The available MLB Stats `vsPlayer` path is useful for exploratory current-day checks, but this run did not use it because point-in-time safety and sample-size reliability are not sufficient for a BET gate.",
            "",
            "## H. Pitch-Type Matchup Findings",
        ]
    )
    for row in [r for r in audit["hitter_player_table"] if r.get("pitch_type_matchup") == "favorable"][:12]:
        lines.append(f"- {row['player_name']} ({row['game']}): favorable vs main pitch mix; {row.get('pitch_type_explanation')}")

    lines.extend(
        [
            "",
            "## I. Team Form / Injury / Bullpen Findings",
            "- Bullpen usage was computed from prior MLB boxscore feeds and included as a fatigue score in the game and player rows.",
            "- Injury/scratch context remains a gap because no official injury feed was integrated; official lineups are used where available instead of inferring scratches.",
            "",
            "## J. Final Betting Card",
            f"BET rows surviving all gates: {bet_rows}.",
        ]
    )
    if not card:
        lines.append("No BET survived. The available data supports watchlist/lean/lottery rows only.")
    else:
        for row in card:
            lines.append(f"- {row['selection']} {row['odds']} ({row['edge_pct']} pp edge), {row['unit_size']}u")

    lines.extend(
        [
            "",
            "## K. Watchlist and Conditional Plays",
            "- HR and TB rows with positive model edges are retained in the enriched boards, but no row should be treated as a final bet without late price/lineup/weather confirmation.",
            "",
            "## L. Avoid List",
            "- HR rows with missing price, missing pitch-type support, or games already started are capped at WATCHLIST/LOTTERY/PASS.",
            "- Full-game sides remain prediction-only because this run did not refresh paid sportsbook odds, first-five lines, or team totals.",
            "",
            "## M. Differences From Prior GPT / Claude / Codex Reports",
        ]
    )
    for diff in audit["differences_from_prior_reports"]:
        lines.append(f"- Prior claim: {diff['prior_claim']} New evidence: {diff['new_evidence']} Decision: {diff['decision']}.")

    lines.extend(
        [
            "",
            "## N. Model Integration Notes",
            "- Permanent integration should add typed `hitter_player_table`, `starting_pitcher_table`, `source_log`, and `unresolved_gaps` schemas under `canvases/exports/pipeline/`.",
            "- The prop model already accepts most Statcast, recent-form, weather, bullpen, and starter-form inputs; the missing permanent layer is a reusable feature registry/fetcher with strict source provenance.",
            "- Future strict cards should add official injury ingestion, F5/team-total/pitcher-prop ingestion, and backtests for HR/TB fair probability calibration before allowing BET labels.",
            "",
            "## Validation Summary",
            f"- Game predictions rows: {len(games)}.",
            f"- Hitter rows: {len(audit['hitter_player_table'])}.",
            f"- Starting pitcher rows: {len(audit['starting_pitcher_table'])}.",
            f"- HR board rows: {len(hr)}.",
            f"- Total bases rows: {len(tb)}.",
            f"- Final card rows: {len(card)}.",
            f"- Unresolved gap rows: {len(gaps)}.",
        ]
    )
    return "\n".join(lines) + "\n"


def write_outputs(audit: dict[str, Any]) -> None:
    audit_path = EXPORT_DIR / f"{AUDIT_PREFIX}-cold-hard-audit.json"
    report_path = EXPORT_DIR / f"{AUDIT_PREFIX}-cold-hard-audit-report.md"
    source_path = EXPORT_DIR / f"{AUDIT_PREFIX}-source-log-enriched.json"
    gaps_path = EXPORT_DIR / f"{AUDIT_PREFIX}-unresolved-gaps.json"
    audit_path.write_text(json.dumps(audit, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    report_path.write_text(build_report(audit), encoding="utf-8")
    source_path.write_text(json.dumps({"slate_date": DATE_STR, "audit_timestamp": RUN_TIMESTAMP, "sources": audit["source_log"]}, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    gaps_path.write_text(json.dumps({"slate_date": DATE_STR, "audit_timestamp": RUN_TIMESTAMP, "gaps": audit["unresolved_gaps"]}, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    write_csv(EXPORT_DIR / f"{AUDIT_PREFIX}-game-predictions.csv", audit["games"])
    write_csv(EXPORT_DIR / f"{AUDIT_PREFIX}-hitter-player-table.csv", audit["hitter_player_table"])
    write_csv(EXPORT_DIR / f"{AUDIT_PREFIX}-starting-pitcher-table.csv", audit["starting_pitcher_table"])
    write_csv(EXPORT_DIR / f"{AUDIT_PREFIX}-hr-board-enriched.csv", audit["hr_board"])
    write_csv(EXPORT_DIR / f"{AUDIT_PREFIX}-total-bases-board-enriched.csv", audit["total_bases_board"])
    write_csv(
        EXPORT_DIR / f"{AUDIT_PREFIX}-final-card-enriched.csv",
        audit["final_card"],
        headers=[
            "market",
            "game",
            "player",
            "selection",
            "odds",
            "implied_probability",
            "fair_probability",
            "fair_price",
            "edge_pct",
            "confidence",
            "unit_size",
            "playable_price",
            "pass_price",
            "what_kills_it",
            "label",
        ],
    )


def main() -> None:
    audit = build_artifacts()
    write_outputs(audit)
    print(
        json.dumps(
            {
                "game_predictions": len(audit["games"]),
                "hitter_rows": len(audit["hitter_player_table"]),
                "starting_pitcher_rows": len(audit["starting_pitcher_table"]),
                "hr_rows": len(audit["hr_board"]),
                "tb_rows": len(audit["total_bases_board"]),
                "final_card_rows": len(audit["final_card"]),
                "unresolved_gaps": len(audit["unresolved_gaps"]),
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
