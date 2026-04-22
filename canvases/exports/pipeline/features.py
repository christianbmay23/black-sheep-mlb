"""Feature engineering for the MLB pregame intel pipeline (form, lineups, bullpen, notes).

Caller supplies ``report_end_date`` so this module stays free of orchestration globals.
"""
from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Any

from live_mlb_data import FanGraphsGame, RotoWireGame, normalize_player_name, strip_accents
from models.game_model import clamp
from models.prop_model import lineup_match_key

from .fetch import search_player
from .parseutil import parse_float, parse_int, safe_div
from .status import innings_text_to_outs, parse_stat_date


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


def verification_side(game: Any, side: str) -> Any | None:
    if game is None:
        return None
    return game.away_side if side == "away" else game.home_side


def rotowire_lineup_result(api_players: list[dict[str, Any]], side_data: Any | None) -> dict[str, Any]:
    players = list((getattr(side_data, "players", None) or []))
    confirmed = bool(getattr(side_data, "confirmed", False))
    issues: list[str] = []
    status = "missing"
    verifiable = False
    matched = False
    if not players:
        issues.append("rotowire_missing")
    elif not confirmed:
        issues.append("rotowire_unconfirmed")
        status = "unconfirmed"
    else:
        verifiable = True
        if lineup_players_match(api_players, players):
            matched = True
            status = "matched"
        else:
            status = "mismatch"
            issues.append("rotowire_lineup_mismatch")
    return {
        "available": bool(players),
        "verifiable": verifiable,
        "matched": matched,
        "status": status,
        "confirmed": confirmed,
        "provider_path": ["rotowire"],
        "issue_codes": issues,
        "lineup_size": len(players),
    }


def fangraphs_lineup_result(api_players: list[dict[str, Any]], side_data: Any | None) -> dict[str, Any]:
    players = list((getattr(side_data, "players", None) or []))
    issues: list[str] = []
    status = "missing"
    verifiable = False
    matched = False
    if not players:
        issues.append("fangraphs_lineup_missing")
    else:
        verifiable = True
        if lineup_players_match(api_players, players):
            matched = True
            status = "matched"
        else:
            status = "mismatch"
            issues.append("fangraphs_lineup_mismatch")
    return {
        "available": bool(players),
        "verifiable": verifiable,
        "matched": matched,
        "status": status,
        "provider_path": ["fangraphs_lineup_tracker"],
        "issue_codes": issues,
        "lineup_size": len(players),
    }


def lineup_verification_details(
    api_players: list[dict[str, Any]],
    rotowire_game: RotoWireGame | None,
    side: str,
    *,
    fangraphs_game: FanGraphsGame | None = None,
) -> dict[str, Any]:
    rotowire_result = rotowire_lineup_result(api_players, verification_side(rotowire_game, side))
    fangraphs_result = fangraphs_lineup_result(api_players, verification_side(fangraphs_game, side))
    matched_paths: list[str] = []
    if fangraphs_result["matched"]:
        matched_paths.append("fangraphs_lineup_tracker")
    if rotowire_result["matched"]:
        matched_paths.append("rotowire")
    issues = []
    if not matched_paths:
        verifiable = bool(fangraphs_result["verifiable"] or rotowire_result["verifiable"])
        issues = ["lineup_verification_failed" if verifiable else "lineup_verification_missing"]
    return {
        "issues": issues,
        "matched_paths": matched_paths,
        "provider_results": {
            "mlb_stats_api": {
                "available": bool(api_players),
                "status": "selected" if api_players else "missing",
                "provider_path": ["mlb_stats_api"],
                "issue_codes": [],
                "lineup_size": len(api_players),
            },
            "fangraphs": fangraphs_result,
            "rotowire": rotowire_result,
        },
    }


def rotowire_starter_result(api_name: str, side_data: Any | None) -> dict[str, Any]:
    pitcher_name = str(getattr(side_data, "pitcher_name", "") or "").strip()
    confirmed = bool(getattr(side_data, "confirmed", False))
    issues: list[str] = []
    status = "missing"
    verifiable = False
    matched = False
    if not pitcher_name:
        issues.append("rotowire_missing")
    elif not confirmed:
        issues.append("rotowire_unconfirmed")
        status = "unconfirmed"
    else:
        verifiable = True
        if starter_names_match(api_name, pitcher_name):
            matched = True
            status = "matched"
        else:
            status = "mismatch"
            issues.append("starter_mismatch_rotowire")
    return {
        "available": bool(pitcher_name),
        "verifiable": verifiable,
        "matched": matched,
        "status": status,
        "confirmed": confirmed,
        "provider_path": ["rotowire"],
        "issue_codes": issues,
        "pitcher_name": pitcher_name,
    }


def fangraphs_starter_result(api_name: str, side_data: Any | None) -> dict[str, Any]:
    pitcher_name = str(getattr(side_data, "pitcher_name", "") or "").strip()
    issues: list[str] = []
    status = "missing"
    verifiable = False
    matched = False
    if not pitcher_name:
        issues.append("fangraphs_starter_missing")
    else:
        verifiable = True
        if starter_names_match(api_name, pitcher_name):
            matched = True
            status = "matched"
        else:
            status = "mismatch"
            issues.append("starter_mismatch_fangraphs")
    return {
        "available": bool(pitcher_name),
        "verifiable": verifiable,
        "matched": matched,
        "status": status,
        "provider_path": ["fangraphs_probables_grid"],
        "issue_codes": issues,
        "pitcher_name": pitcher_name,
    }


def starter_verification_details(
    api_pitcher: dict[str, Any],
    rotowire_game: RotoWireGame | None,
    side: str,
    *,
    fangraphs_game: FanGraphsGame | None = None,
) -> dict[str, Any]:
    api_name = str(api_pitcher.get("name") or "")
    rotowire_result = rotowire_starter_result(api_name, verification_side(rotowire_game, side))
    fangraphs_result = fangraphs_starter_result(api_name, verification_side(fangraphs_game, side))
    matched_paths: list[str] = []
    if fangraphs_result["matched"]:
        matched_paths.append("fangraphs_probables_grid")
    if rotowire_result["matched"]:
        matched_paths.append("rotowire")
    issues: list[str] = []
    if not api_name:
        issues = ["starter_missing"]
    elif not matched_paths:
        verifiable = bool(fangraphs_result["verifiable"] or rotowire_result["verifiable"])
        issues = ["starter_verification_failed" if verifiable else "starter_verification_missing"]
    return {
        "issues": issues,
        "matched_paths": matched_paths,
        "provider_results": {
            "mlb_stats_api": {
                "available": bool(api_name),
                "status": "selected" if api_name else "missing",
                "provider_path": ["mlb_stats_api"],
                "issue_codes": ["starter_missing"] if not api_name else [],
                "pitcher_name": api_name,
            },
            "fangraphs": fangraphs_result,
            "rotowire": rotowire_result,
        },
    }


def lineup_source_provider_results(
    api_players: list[dict[str, Any]],
    rotowire_side: Any | None,
    fangraphs_side: Any | None,
) -> dict[str, Any]:
    return {
        "mlb_stats_api": {
            "available": bool(api_players),
            "status": "selected" if api_players else "missing",
            "provider_path": ["mlb_stats_api"],
            "issue_codes": [] if api_players else ["lineup_not_posted_api"],
            "lineup_size": len(api_players),
        },
        "fangraphs": {
            "available": bool(list((getattr(fangraphs_side, "players", None) or []))),
            "status": "available" if list((getattr(fangraphs_side, "players", None) or [])) else "missing",
            "provider_path": ["fangraphs_lineup_tracker"],
            "issue_codes": [] if list((getattr(fangraphs_side, "players", None) or [])) else ["fangraphs_lineup_missing"],
            "lineup_size": len(list((getattr(fangraphs_side, "players", None) or []))),
        },
        "rotowire": {
            "available": bool(list((getattr(rotowire_side, "players", None) or []))),
            "status": "confirmed"
            if bool(getattr(rotowire_side, "confirmed", False))
            else "unconfirmed"
            if list((getattr(rotowire_side, "players", None) or []))
            else "missing",
            "confirmed": bool(getattr(rotowire_side, "confirmed", False)),
            "provider_path": ["rotowire"],
            "issue_codes": (
                []
                if bool(getattr(rotowire_side, "confirmed", False))
                else ["rotowire_unconfirmed"]
                if list((getattr(rotowire_side, "players", None) or []))
                else ["rotowire_missing"]
            ),
            "lineup_size": len(list((getattr(rotowire_side, "players", None) or []))),
        },
    }


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
    fangraphs_game: FanGraphsGame | None = None,
) -> tuple[list[dict[str, Any]], str, list[str], dict[str, Any]]:
    issues: list[str] = []
    rotowire_side = verification_side(rotowire_game, side)
    fangraphs_side = verification_side(fangraphs_game, side)

    if api_players:
        verification = lineup_verification_details(
            api_players,
            rotowire_game,
            side,
            fangraphs_game=fangraphs_game,
        )
        issues = list(verification["issues"])
        matched_paths = list(verification["matched_paths"])
        provider_results = dict(verification["provider_results"])
        label = "Posted (MLB API)"
        verification_level = "posted_api_only"
        provider_path = ["mlb_stats_api"]
        if len(matched_paths) > 1:
            label = "Confirmed (MLB API + Multi-Source)"
            verification_level = "confirmed_api_multi_source"
            provider_path = ["mlb_stats_api"] + matched_paths
        elif matched_paths == ["fangraphs_lineup_tracker"]:
            label = "Confirmed (MLB API + FanGraphs)"
            verification_level = "confirmed_api_fangraphs"
            provider_path = ["mlb_stats_api", "fangraphs_lineup_tracker"]
        elif matched_paths == ["rotowire"]:
            label = "Confirmed (MLB API + RotoWire)"
            verification_level = "confirmed_api_rotowire"
            provider_path = ["mlb_stats_api", "rotowire"]
        elif issues == ["lineup_verification_failed"]:
            verification_level = "posted_api_verification_failed"
        return api_players, label, issues, {
            "selected_source": "mlb_stats_api",
            "verification_level": verification_level,
            "provider_path": provider_path,
            "issue_codes": list(issues),
            "provider_results": provider_results,
        }

    if rotowire_side and rotowire_side.confirmed:
        resolved = resolve_named_players(
            team_abbr,
            [{"name": player["name"], "pos": player["pos"]} for player in rotowire_side.players],
            rosters,
        )
        issues = ["lineup_not_posted_api"]
        return resolved, "Confirmed (RotoWire)", issues, {
            "selected_source": "rotowire",
            "verification_level": "confirmed_rotowire_fallback",
            "provider_path": ["rotowire", "mlb_stats_api_roster"],
            "issue_codes": list(issues),
            "provider_results": lineup_source_provider_results(api_players, rotowire_side, fangraphs_side),
        }

    if allow_canvas_fallback and canvas_rows:
        resolved = resolve_named_players(team_abbr, canvas_rows, rosters)
        issues = ["lineup_projected_canvas", "lineup_not_posted_api"]
        return resolved, canvas_label, issues, {
            "selected_source": "canvas",
            "verification_level": "projected_canvas_fallback",
            "provider_path": ["canvas", "mlb_stats_api_roster"],
            "issue_codes": list(issues),
            "provider_results": lineup_source_provider_results(api_players, rotowire_side, fangraphs_side),
        }

    issues = ["lineup_not_posted_api"]
    return [], "Not Posted", issues, {
        "selected_source": "none",
        "verification_level": "missing",
        "provider_path": [],
        "issue_codes": list(issues),
        "provider_results": lineup_source_provider_results(api_players, rotowire_side, fangraphs_side),
    }


def starter_matches(
    api_pitcher: dict[str, Any],
    rotowire_game: RotoWireGame | None,
    side: str,
    *,
    fangraphs_game: FanGraphsGame | None = None,
) -> list[str]:
    return list(
        starter_verification_details(
            api_pitcher,
            rotowire_game,
            side,
            fangraphs_game=fangraphs_game,
        )["issues"]
    )


def starter_verification_metadata(
    api_pitcher: dict[str, Any],
    rotowire_game: RotoWireGame | None,
    side: str,
    *,
    fangraphs_game: FanGraphsGame | None = None,
) -> dict[str, Any]:
    verification = starter_verification_details(
        api_pitcher,
        rotowire_game,
        side,
        fangraphs_game=fangraphs_game,
    )
    issues = list(verification["issues"])
    matched_paths = list(verification["matched_paths"])
    provider_results = dict(verification["provider_results"])
    api_name = str(api_pitcher.get("name") or "")
    provider_path = ["mlb_stats_api"]
    verification_level = "api_only_verification_missing"
    if len(matched_paths) > 1:
        provider_path = ["mlb_stats_api"] + matched_paths
        verification_level = "confirmed_api_multi_source"
    elif matched_paths == ["fangraphs_probables_grid"]:
        provider_path = ["mlb_stats_api", "fangraphs_probables_grid"]
        verification_level = "confirmed_api_fangraphs"
    elif matched_paths == ["rotowire"]:
        provider_path = ["mlb_stats_api", "rotowire"]
        verification_level = "confirmed_api_rotowire"
    elif issues == ["starter_verification_failed"]:
        verification_level = "api_verification_failed"
    elif not api_name:
        verification_level = "starter_missing"
    return {
        "selected_source": "mlb_stats_api",
        "verification_level": verification_level,
        "provider_path": provider_path,
        "issue_codes": list(issues),
        "provider_results": provider_results,
    }


def collect_recent_splits(
    person: dict[str, Any],
    group_name: str,
    *,
    window_days: int,
    report_end_date: date,
    type_name: str = "gameLog",
    max_entries: int | None = None,
) -> list[dict[str, Any]]:
    end_date = report_end_date
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


def summarize_recent_hitter_form(person: dict[str, Any] | None, *, report_end_date: date) -> dict[str, Any]:
    person = person or {}
    splits = collect_recent_splits(person, "hitting", window_days=14, report_end_date=report_end_date)
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


def summarize_recent_pitcher_form(
    person: dict[str, Any] | None,
    *,
    report_end_date: date,
    reliever: bool = False,
) -> dict[str, Any]:
    person = person or {}
    splits = collect_recent_splits(
        person,
        "pitching",
        window_days=21,
        report_end_date=report_end_date,
        max_entries=5 if reliever else 3,
    )
    outs = earned_runs = hits = walks = strikeouts = pitches = appearances_last3 = 0
    pitched_yesterday = False
    last_date: date | None = None
    yesterday = report_end_date - timedelta(days=1)
    three_days_ago = report_end_date - timedelta(days=3)
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
        "days_since_last": (report_end_date - last_date).days if last_date else None,
    }


def summarize_hitter_features(
    person: dict[str, Any] | None,
    expected: dict[str, Any] | None,
    statcast: dict[str, Any] | None,
    *,
    report_end_date: date,
) -> dict[str, Any]:
    person = person or {}
    expected = expected or {}
    statcast = statcast or {}
    hitting = extract_group_stats(person, "hitting", type_name="season")
    recent = summarize_recent_hitter_form(person, report_end_date=report_end_date)
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
    report_end_date: date,
    reliever: bool = False,
) -> dict[str, Any]:
    person = person or {}
    expected = expected or {}
    statcast = statcast or {}
    pitching = extract_group_stats(person, "pitching", type_name="season")
    recent = summarize_recent_pitcher_form(person, report_end_date=report_end_date, reliever=reliever)
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
    *,
    report_end_date: date,
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
            report_end_date=report_end_date,
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
