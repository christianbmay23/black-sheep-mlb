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

    def fetch_live_feed(self, game_id: str | int) -> dict:
        url = f"{self.BASE_URL}.1/game/{game_id}/feed/live"
        try:
            with urlopen(url, timeout=self.timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError) as exc:
            logger.warning("Unable to fetch live feed for game %s: %s", game_id, exc)
            return {}

    def extract_pitcher_stats(self, game_id: str | int, home_pitcher: str, away_pitcher: str) -> dict:
        feed = self.fetch_live_feed(game_id)
        boxscore = feed.get("liveData", {}).get("boxscore", {}).get("teams", {})

        home_team = boxscore.get("home", {})
        away_team = boxscore.get("away", {})

        home_era = self._extract_pitcher_era(home_team, home_pitcher, default=4.0)
        away_era = self._extract_pitcher_era(away_team, away_pitcher, default=4.0)

        return {
            "home_pitcher_era": home_era,
            "away_pitcher_era": away_era,
            "home_starter_handedness": self._extract_pitcher_hand(home_team, home_pitcher),
            "away_starter_handedness": self._extract_pitcher_hand(away_team, away_pitcher),
        }

    def extract_team_records_or_context(self, game_id: str | int) -> dict:
        feed = self.fetch_live_feed(game_id)
        game_data = feed.get("gameData", {})
        teams = game_data.get("teams", {})
        home_record = teams.get("home", {}).get("record", {})
        away_record = teams.get("away", {}).get("record", {})

        home_wins = self._safe_int(home_record.get("wins"), 0)
        home_losses = self._safe_int(home_record.get("losses"), 0)
        away_wins = self._safe_int(away_record.get("wins"), 0)
        away_losses = self._safe_int(away_record.get("losses"), 0)

        return {
            "home_team_win_pct": self._safe_pct(home_wins, home_losses),
            "away_team_win_pct": self._safe_pct(away_wins, away_losses),
            "home_rest_days": 1,
            "away_rest_days": 1,
        }

    def normalize_game(self, raw_game: dict) -> dict:
        teams = raw_game.get("teams", {})
        home = teams.get("home", {})
        away = teams.get("away", {})

        home_team = home.get("team", {}).get("name") or home.get("team", {}).get("abbreviation") or "HOME"
        away_team = away.get("team", {}).get("name") or away.get("team", {}).get("abbreviation") or "AWAY"

        home_pitcher = home.get("probablePitcher", {}).get("fullName") or "TBD"
        away_pitcher = away.get("probablePitcher", {}).get("fullName") or "TBD"
        game_pk = str(raw_game.get("gamePk", f"{raw_game.get('gameDate', '')}-{away_team}-{home_team}"))

        pitcher_stats = self.extract_pitcher_stats(game_pk, home_pitcher, away_pitcher) if raw_game.get("gamePk") else {}
        team_context = self.extract_team_records_or_context(game_pk) if raw_game.get("gamePk") else {}

        return {
            "game_id": game_pk,
            "date": (raw_game.get("officialDate") or raw_game.get("gameDate", "")).split("T")[0],
            "home_team": home_team,
            "away_team": away_team,
            "venue": raw_game.get("venue", {}).get("name") or "Unknown Venue",
            "home_starting_pitcher": home_pitcher,
            "away_starting_pitcher": away_pitcher,
            "home_bullpen_era": 4.0,
            "away_bullpen_era": 4.0,
            "home_lineup_wrc_plus": 100.0,
            "away_lineup_wrc_plus": 100.0,
            "home_pitcher_era": pitcher_stats.get("home_pitcher_era", 4.0),
            "away_pitcher_era": pitcher_stats.get("away_pitcher_era", 4.0),
            "home_starter_handedness": pitcher_stats.get("home_starter_handedness", "U"),
            "away_starter_handedness": pitcher_stats.get("away_starter_handedness", "U"),
            "temperature_f": 72.0,
            "wind_mph": 6.0,
            "wind_out": False,
            "home_moneyline": 100,
            "away_moneyline": -110,
            **team_context,
        }

    def _extract_pitcher_era(self, team_boxscore: dict, pitcher_name: str, default: float = 4.0) -> float:
        players = team_boxscore.get("players", {})
        for pdata in players.values():
            person_name = pdata.get("person", {}).get("fullName", "")
            if person_name != pitcher_name:
                continue
            stat = pdata.get("seasonStats", {}).get("pitching", {}).get("era")
            try:
                return float(stat)
            except (TypeError, ValueError):
                return default
        return default

    def _extract_pitcher_hand(self, team_boxscore: dict, pitcher_name: str) -> str:
        players = team_boxscore.get("players", {})
        for pdata in players.values():
            person_name = pdata.get("person", {}).get("fullName", "")
            if person_name != pitcher_name:
                continue
            hand = pdata.get("person", {}).get("pitchHand", {}).get("code")
            if hand in {"L", "R"}:
                return hand
        return "U"

    def _safe_int(self, value: object, default: int) -> int:
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def _safe_pct(self, wins: int, losses: int) -> float:
        total = wins + losses
        if total <= 0:
            return 0.5
        return wins / total

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
