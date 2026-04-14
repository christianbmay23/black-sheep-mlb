from __future__ import annotations

import json
import logging
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from black_sheep.schemas.game_schema import Game

logger = logging.getLogger(__name__)


class MLBStatsCollector:
    BASE_URL = "https://statsapi.mlb.com/api/v1"

    def __init__(self, demo_path: str = "data/raw/demo_slate.json", timeout: float = 10.0) -> None:
        self.demo_path = Path(demo_path)
        self.timeout = timeout

    def get_games_for_date(self, date_str: str, use_live: bool = True) -> list[dict]:
        demo_games = self._load_demo_games_for_date(date_str)
        if not use_live:
            return demo_games

        try:
            raw_schedule = self.fetch_schedule(date_str)
            dates = raw_schedule.get("dates", [])
            if not dates:
                logger.warning("MLB Stats API returned no games for %s. Falling back to demo data.", date_str)
                return demo_games

            normalized_games: list[dict] = []
            for day in dates:
                for raw_game in day.get("games", []):
                    normalized_games.append(self.normalize_game(raw_game))

            valid_games: list[dict] = []
            for game in normalized_games:
                try:
                    valid_games.append(Game(**game).model_dump())
                except Exception as exc:  # pragma: no cover - defensive
                    logger.warning(
                        "Failed to validate normalized MLB game %s (%s). Falling back to demo data.",
                        game.get("game_id"),
                        exc,
                    )
                    return demo_games

            if not valid_games:
                logger.warning("No valid games were normalized for %s. Falling back to demo data.", date_str)
                return demo_games
            return valid_games
        except Exception as exc:  # pragma: no cover - network/remote errors
            logger.warning("Failed to fetch live MLB schedule for %s: %s. Falling back to demo data.", date_str, exc)
            return demo_games

    def fetch_schedule(self, date_str: str) -> dict:
        query = urlencode(
            {
                "sportId": 1,
                "date": date_str,
                "hydrate": "probablePitcher,team,venue",
            }
        )
        url = f"{self.BASE_URL}/schedule?{query}"
        try:
            with urlopen(url, timeout=self.timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError) as exc:
            raise RuntimeError(f"MLB Stats request failed: {exc}") from exc

    def normalize_game(self, raw_game: dict) -> dict:
        teams = raw_game.get("teams", {})
        home = teams.get("home", {})
        away = teams.get("away", {})

        home_team = home.get("team", {}).get("name") or home.get("team", {}).get("abbreviation") or "HOME"
        away_team = away.get("team", {}).get("name") or away.get("team", {}).get("abbreviation") or "AWAY"

        home_pitcher = home.get("probablePitcher", {}).get("fullName") or "TBD"
        away_pitcher = away.get("probablePitcher", {}).get("fullName") or "TBD"

        return {
            "game_id": str(raw_game.get("gamePk", f"{raw_game.get('gameDate', '')}-{away_team}-{home_team}")),
            "date": (raw_game.get("officialDate") or raw_game.get("gameDate", "")).split("T")[0],
            "home_team": home_team,
            "away_team": away_team,
            "venue": raw_game.get("venue", {}).get("name") or "Unknown Venue",
            "home_starting_pitcher": home_pitcher,
            "away_starting_pitcher": away_pitcher,
            # Demo-safe placeholders until we add richer collectors
            "home_bullpen_era": 4.0,
            "away_bullpen_era": 4.0,
            "home_lineup_wrc_plus": 100.0,
            "away_lineup_wrc_plus": 100.0,
            "home_pitcher_era": 4.0,
            "away_pitcher_era": 4.0,
            "temperature_f": 72.0,
            "wind_mph": 6.0,
            "wind_out": False,
            "home_moneyline": 100,
            "away_moneyline": -110,
        }

    def _load_demo_games_for_date(self, date_str: str) -> list[dict]:
        if not self.demo_path.exists():
            logger.warning("Demo slate file not found at %s", self.demo_path)
            return []

        try:
            games = json.loads(self.demo_path.read_text())
        except json.JSONDecodeError as exc:  # pragma: no cover - defensive
            logger.warning("Failed to parse demo slate file %s: %s", self.demo_path, exc)
            return []

        return [g for g in games if g.get("date") == date_str]
