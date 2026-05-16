"""Change detection between morning research and v4 pregame refresh rows."""

from __future__ import annotations

from pathlib import Path


MORNING_ARTIFACT_NAMES = [
    "02_next_slate_research/verified_slate.csv",
    "02_next_slate_research/probable_pitchers.csv",
    "02_next_slate_research/lineup_status.csv",
    "02_next_slate_research/market_snapshot.csv",
    "02_next_slate_research/injury_news.csv",
]


def detect_changes_since_morning(
    *,
    slate_date: str,
    slate_dir: Path,
    morning: dict[str, list[dict[str, str]]],
    current_games: list[dict[str, object]],
    current_starters: list[dict[str, object]],
    current_lineups: list[dict[str, object]],
    current_markets: list[dict[str, object]],
    current_news: list[dict[str, object]],
    current_weather: list[dict[str, object]],
) -> dict[str, object]:
    missing = missing_morning_artifacts(slate_dir)
    changes = {
        "starter_changes": _starter_changes(morning.get("probable_pitchers", []), current_starters),
        "lineup_changes": _lineup_changes(morning.get("lineup_status", []), current_lineups),
        "scratches": _scratch_changes(current_lineups, current_news),
        "weather_changes": _weather_changes(morning.get("weather", []), current_weather),
        "market_changes": _market_changes(morning.get("market_snapshot", []), current_markets),
        "prop_availability_changes": _prop_changes(morning.get("market_snapshot", []), current_markets),
        "news_changes": _news_changes(morning.get("injury_news", []), current_news),
    }
    unresolved = []
    if missing:
        unresolved.append(
            {
                "classification": "MORNING_ARTIFACTS_MISSING",
                "detail": ", ".join(missing),
            }
        )
        unresolved.append(
            {
                "classification": "CHANGE_DETECTION_LIMITED",
                "detail": "One or more morning artifacts were missing; only available files were compared.",
            }
        )
    return {
        "slate_date": slate_date,
        "changes_since_morning": changes,
        "unresolved_gaps": unresolved,
    }


def missing_morning_artifacts(slate_dir: Path) -> list[str]:
    return [name for name in MORNING_ARTIFACT_NAMES if not (slate_dir / name).exists()]


def _starter_changes(morning_rows: list[dict[str, str]], current_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    prior = {(row.get("game_id", ""), row.get("team", "")): row for row in morning_rows}
    out = []
    for row in current_rows:
        key = (str(row.get("game_id", "")), str(row.get("team", "")))
        old = prior.get(key)
        old_name = str((old or {}).get("pitcher_name", "") or (old or {}).get("current_sp", ""))
        new_name = str(row.get("current_sp", "") or row.get("listed_probable_sp", ""))
        if old and old_name and new_name and old_name != "TBD" and old_name != new_name:
            out.append({"game_id": key[0], "team": key[1], "morning_sp": old_name, "current_sp": new_name})
    return out


def _lineup_changes(morning_rows: list[dict[str, str]], current_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    prior = {(row.get("game_id", ""), row.get("team", "")): row for row in morning_rows}
    current_by_team: dict[tuple[str, str], list[dict[str, object]]] = {}
    for row in current_rows:
        current_by_team.setdefault((str(row.get("game_id", "")), str(row.get("team", ""))), []).append(row)
    out = []
    for key, rows in current_by_team.items():
        old = prior.get(key)
        current_status = _lineup_status(rows)
        old_status = str((old or {}).get("lineup_status", ""))
        if old and old_status != current_status:
            out.append({"game_id": key[0], "team": key[1], "morning_status": old_status, "current_status": current_status})
    return out


def _scratch_changes(lineups: list[dict[str, object]], news_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    out = []
    for row in lineups:
        if _truthy(row.get("scratch_flag")):
            out.append({"game_id": row.get("game_id", ""), "team": row.get("team", ""), "player_name": row.get("player_name", "")})
    for row in news_rows:
        text = " ".join(str(row.get(field, "")) for field in ["status", "news_type", "headline", "summary"]).lower()
        if "scratch" in text or "out" in text:
            out.append({"game_id": row.get("game_id", ""), "team": row.get("team", ""), "player_name": row.get("player_name", ""), "source": row.get("source", "")})
    return out


def _weather_changes(morning_rows: list[dict[str, str]], current_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    prior = {row.get("game_id", ""): row for row in morning_rows}
    out = []
    for row in current_rows:
        old = prior.get(str(row.get("game_id", "")))
        if not old:
            continue
        for field in ["roof_status", "temperature", "wind_speed", "precipitation_risk"]:
            if str(old.get(field, "")) != str(row.get(field, "")):
                out.append({"game_id": row.get("game_id", ""), "field": field, "morning": old.get(field, ""), "current": row.get(field, "")})
    return out


def _market_changes(morning_rows: list[dict[str, str]], current_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    prior = {_market_key(row): row for row in morning_rows}
    out = []
    for row in current_rows:
        old = prior.get(_market_key(row))
        if old and str(old.get("price", "")) != str(row.get("price", "")):
            out.append({"game_id": row.get("game_id", ""), "market": row.get("market", ""), "player_or_team": row.get("player_or_team", ""), "morning_price": old.get("price", ""), "current_price": row.get("price", "")})
    return out


def _prop_changes(morning_rows: list[dict[str, str]], current_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    morning_props = {_market_key(row) for row in morning_rows if row.get("player_name")}
    current_props = {_market_key(row) for row in current_rows if row.get("player_or_team") and str(row.get("market_type", "")).lower() == "player_prop"}
    added = sorted(current_props - morning_props)
    removed = sorted(morning_props - current_props)
    return [{"change": "added", "key": key} for key in added] + [{"change": "removed", "key": key} for key in removed]


def _news_changes(morning_rows: list[dict[str, str]], current_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    old = {_news_key(row) for row in morning_rows}
    out = []
    for row in current_rows:
        key = _news_key(row)
        if key not in old:
            out.append({"game_id": row.get("game_id", ""), "player_name": row.get("player_name", ""), "team": row.get("team", ""), "status": row.get("status", ""), "headline": row.get("headline", "")})
    return out


def _lineup_status(rows: list[dict[str, object]]) -> str:
    if any(str(row.get("lineup_status", "")).upper() == "CONFIRMED" for row in rows):
        return "CONFIRMED"
    return str(rows[0].get("lineup_status", "UNVERIFIED")) if rows else "UNVERIFIED"


def _market_key(row: dict[str, object]) -> str:
    player = row.get("player_name", row.get("player_or_team", ""))
    return "|".join(str(row.get(field, "")) for field in ["game_id", "market_type", "market", "team"]) + f"|{player}"


def _news_key(row: dict[str, object]) -> str:
    news_type = row.get("injury_or_news_type", row.get("news_type", ""))
    return "|".join(str(row.get(field, "")) for field in ["player_name", "player_id", "team", "status"]) + f"|{news_type}"


def _truthy(value: object) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "y"}
