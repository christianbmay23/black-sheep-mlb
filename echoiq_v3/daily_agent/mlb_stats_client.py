"""MLB Stats API access for EchoIQ Night Shift."""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


class MLBStatsAPIError(RuntimeError):
    """Raised when MLB Stats API data cannot be retrieved."""


class NightShiftMLBStatsClient:
    def __init__(self, *, base_url: str = "https://statsapi.mlb.com/api/v1", timeout: int = 30, retries: int = 2):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.retries = retries

    def _get_json(self, path_or_url: str) -> dict[str, Any]:
        url = path_or_url if path_or_url.startswith("http") else f"{self.base_url}/{path_or_url.lstrip('/')}"
        last_error: Exception | None = None
        for attempt in range(self.retries + 1):
            try:
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "black-sheep-mlb echoiq-night-shift/1.0"},
                )
                with urllib.request.urlopen(req, timeout=self.timeout) as response:
                    return json.loads(response.read().decode("utf-8"))
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                last_error = exc
                if attempt < self.retries:
                    time.sleep(0.25 * (attempt + 1))
        raise MLBStatsAPIError(f"MLB Stats API request failed for {url}: {last_error}")

    def schedule_endpoint(self, date_str: str) -> str:
        query = urllib.parse.urlencode(
            {
                "sportId": 1,
                "date": date_str,
                "hydrate": "probablePitcher,lineups,team,venue,linescore",
            }
        )
        return f"{self.base_url}/schedule?{query}"

    def fetch_schedule(self, date_str: str) -> dict[str, Any]:
        return self._get_json(self.schedule_endpoint(date_str))

    def game_feed_endpoint(self, game_pk: str | int) -> str:
        live_base = self.base_url.replace("/api/v1", "/api/v1.1")
        return f"{live_base}/game/{game_pk}/feed/live"

    def fetch_game_feed(self, game_pk: str | int) -> dict[str, Any]:
        return self._get_json(self.game_feed_endpoint(game_pk))

    def boxscore_endpoint(self, game_pk: str | int) -> str:
        return f"{self.base_url}/game/{game_pk}/boxscore"

    def fetch_boxscore(self, game_pk: str | int) -> dict[str, Any]:
        return self._get_json(self.boxscore_endpoint(game_pk))


def parse_schedule_games(payload: dict[str, Any], *, fallback_date: str, retrieved_at: str) -> list[dict[str, Any]]:
    games: list[dict[str, Any]] = []
    for date_block in payload.get("dates", []) or []:
        game_date = str(date_block.get("date") or fallback_date)
        for game in date_block.get("games", []) or []:
            teams = game.get("teams") or {}
            away = teams.get("away") or {}
            home = teams.get("home") or {}
            away_team = away.get("team") or {}
            home_team = home.get("team") or {}
            away_pp = away.get("probablePitcher") or {}
            home_pp = home.get("probablePitcher") or {}
            away_score = away.get("score")
            home_score = home.get("score")
            lineups = game.get("lineups") or {}
            away_abbr = _team_code(away_team)
            home_abbr = _team_code(home_team)
            games.append(
                {
                    "game_id": str(game.get("gamePk") or ""),
                    "date": game_date,
                    "away_team": away_abbr,
                    "home_team": home_abbr,
                    "away_team_name": str(away_team.get("name") or away_abbr),
                    "home_team_name": str(home_team.get("name") or home_abbr),
                    "away_team_id": away_team.get("id"),
                    "home_team_id": home_team.get("id"),
                    "away_score": _to_int(away_score),
                    "home_score": _to_int(home_score),
                    "status": str((game.get("status") or {}).get("detailedState") or ""),
                    "abstract_status": str((game.get("status") or {}).get("abstractGameState") or ""),
                    "venue": str((game.get("venue") or {}).get("name") or ""),
                    "game_time": str(game.get("gameDate") or ""),
                    "away_probable_sp": str(away_pp.get("fullName") or ""),
                    "home_probable_sp": str(home_pp.get("fullName") or ""),
                    "away_probable_sp_id": str(away_pp.get("id") or ""),
                    "home_probable_sp_id": str(home_pp.get("id") or ""),
                    "away_lineup_count": len(lineups.get("awayPlayers") or []),
                    "home_lineup_count": len(lineups.get("homePlayers") or []),
                    "retrieved_at": retrieved_at,
                }
            )
    return games


def is_final_status(status: str) -> bool:
    value = status.strip().lower()
    return value in {"final", "game over", "completed early"} or value.startswith("final:")


def winner_from_scores(away_team: str, home_team: str, away_score: int | None, home_score: int | None) -> str:
    if away_score is None or home_score is None:
        return ""
    if away_score > home_score:
        return away_team
    if home_score > away_score:
        return home_team
    return "TIE"


def _team_code(team: dict[str, Any]) -> str:
    return str(team.get("abbreviation") or team.get("teamCode") or team.get("fileCode") or team.get("name") or "")


def _to_int(value: object) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
