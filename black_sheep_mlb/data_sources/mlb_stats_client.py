"""Minimal MLB Stats API client for schedule and game feeds."""
from __future__ import annotations

import json
import logging
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class MLBGame:
    game_pk: int
    game_date: str
    game_datetime: str | None
    away_team: str
    home_team: str
    away_team_id: int | None = None
    home_team_id: int | None = None
    away_probable_pitcher: str | None = None
    home_probable_pitcher: str | None = None
    away_probable_pitcher_id: int | None = None
    home_probable_pitcher_id: int | None = None
    status: str | None = None


class MLBStatsClient:
    def __init__(self, base_url: str = "https://statsapi.mlb.com/api/v1", timeout: int = 30, retries: int = 2):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.retries = retries

    def _get_json(self, path: str) -> dict[str, Any]:
        url = path if path.startswith("http") else f"{self.base_url}/{path.lstrip('/')}"
        last_error: Exception | None = None
        for attempt in range(self.retries + 1):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "black-sheep-mlb/1.0"})
                with urllib.request.urlopen(req, timeout=self.timeout) as response:
                    return json.loads(response.read().decode("utf-8"))
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                last_error = exc
                if attempt < self.retries:
                    time.sleep(0.25 * (attempt + 1))
        raise RuntimeError(f"MLB Stats API request failed for {url}: {last_error}")

    def get_schedule(self, date: str) -> list[MLBGame]:
        data = self._get_json(
            f"schedule?sportId=1&date={date}&hydrate=probablePitcher,team,linescore,venue"
        )
        games: list[MLBGame] = []
        for block in data.get("dates", []):
            game_date = str(block.get("date") or date)
            for raw_game in block.get("games", []):
                teams = raw_game.get("teams") or {}
                away = teams.get("away") or {}
                home = teams.get("home") or {}
                away_team = away.get("team") or {}
                home_team = home.get("team") or {}
                away_pp = away.get("probablePitcher") or {}
                home_pp = home.get("probablePitcher") or {}
                games.append(
                    MLBGame(
                        game_pk=int(raw_game.get("gamePk")),
                        game_date=game_date,
                        game_datetime=raw_game.get("gameDate"),
                        away_team=str(away_team.get("name") or away_team.get("abbreviation") or ""),
                        home_team=str(home_team.get("name") or home_team.get("abbreviation") or ""),
                        away_team_id=away_team.get("id"),
                        home_team_id=home_team.get("id"),
                        away_probable_pitcher=away_pp.get("fullName"),
                        home_probable_pitcher=home_pp.get("fullName"),
                        away_probable_pitcher_id=away_pp.get("id"),
                        home_probable_pitcher_id=home_pp.get("id"),
                        status=(raw_game.get("status") or {}).get("detailedState"),
                    )
                )
        return games

    def get_game_feed(self, game_pk: int) -> dict[str, Any]:
        return self._get_json(f"game/{game_pk}/feed/live")

    def get_final_score(self, game_pk: int) -> dict[str, Any]:
        feed = self.get_game_feed(game_pk)
        linescore = (feed.get("liveData") or {}).get("linescore") or {}
        teams = linescore.get("teams") or {}
        return {
            "game_pk": game_pk,
            "away_runs": (teams.get("away") or {}).get("runs"),
            "home_runs": (teams.get("home") or {}).get("runs"),
            "status": ((feed.get("gameData") or {}).get("status") or {}).get("detailedState"),
        }
