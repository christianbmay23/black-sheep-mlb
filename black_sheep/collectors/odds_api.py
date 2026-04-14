from __future__ import annotations

import json
import logging
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

logger = logging.getLogger(__name__)


class OddsApiCollector:
    """Collector for The Odds API with deterministic fallback behavior."""

    BASE_URL = "https://api.the-odds-api.com/v4"
    SPORT_KEY = "baseball_mlb"

    def __init__(self, api_key: str = "", timeout: float = 10.0) -> None:
        self.api_key = api_key
        self.timeout = timeout

    def fetch_mlb_odds(self) -> list[dict]:
        if not self.api_key:
            logger.warning("ODDS_API_KEY missing; skipping live odds fetch.")
            return []

        query = urlencode(
            {
                "apiKey": self.api_key,
                "regions": "us",
                "markets": "h2h,totals",
                "oddsFormat": "american",
            }
        )
        url = f"{self.BASE_URL}/sports/{self.SPORT_KEY}/odds/?{query}"
        try:
            with urlopen(url, timeout=self.timeout) as response:
                raw_events = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError) as exc:
            logger.warning("The Odds API request failed: %s", exc)
            return []

        events: list[dict] = []
        for raw_event in raw_events:
            normalized = self.normalize_odds_event(raw_event)
            if normalized:
                events.append(normalized)
        return events

    def attach_market_odds(self, game: dict, odds_events: list[dict] | None = None) -> dict:
        odds_events = odds_events or []
        matched = self.match_odds_to_game(game, odds_events)

        existing_home = game.get("home_moneyline")
        existing_away = game.get("away_moneyline")

        market = {
            "home_moneyline": matched.get("home_moneyline", existing_home),
            "away_moneyline": matched.get("away_moneyline", existing_away),
            "total": matched.get("total"),
            "over_price": matched.get("over_price"),
            "under_price": matched.get("under_price"),
            "bookmaker": matched.get("bookmaker"),
            "last_update": matched.get("last_update"),
        }
        game["market"] = market

        # Preserve compatibility with existing v1 fields.
        game["home_moneyline"] = market["home_moneyline"] if market["home_moneyline"] is not None else (existing_home or 100)
        game["away_moneyline"] = market["away_moneyline"] if market["away_moneyline"] is not None else (existing_away or -110)
        return game

    def normalize_odds_event(self, raw_event: dict) -> dict:
        home_team = raw_event.get("home_team")
        away_team = raw_event.get("away_team")
        if not home_team or not away_team:
            return {}

        event = {
            "id": raw_event.get("id"),
            "home_team": home_team,
            "away_team": away_team,
            "commence_time": raw_event.get("commence_time"),
            "bookmaker": None,
            "last_update": None,
            "home_moneyline": None,
            "away_moneyline": None,
            "total": None,
            "over_price": None,
            "under_price": None,
        }

        bookmakers = raw_event.get("bookmakers") or []
        if not bookmakers:
            return event

        bookmaker = bookmakers[0]
        event["bookmaker"] = bookmaker.get("key")
        event["last_update"] = bookmaker.get("last_update")

        for market in bookmaker.get("markets", []):
            key = market.get("key")
            outcomes = market.get("outcomes", [])
            if key == "h2h":
                for outcome in outcomes:
                    if outcome.get("name") == home_team:
                        event["home_moneyline"] = self._safe_int(outcome.get("price"))
                    elif outcome.get("name") == away_team:
                        event["away_moneyline"] = self._safe_int(outcome.get("price"))
            elif key == "totals":
                for outcome in outcomes:
                    name = (outcome.get("name") or "").lower()
                    if name == "over":
                        event["total"] = self._safe_float(outcome.get("point"))
                        event["over_price"] = self._safe_int(outcome.get("price"))
                    elif name == "under":
                        event["under_price"] = self._safe_int(outcome.get("price"))
                        if event["total"] is None:
                            event["total"] = self._safe_float(outcome.get("point"))

        return event

    def match_odds_to_game(self, game: dict, odds_events: list[dict]) -> dict:
        if not odds_events:
            return {}

        home_team = game.get("home_team", "")
        away_team = game.get("away_team", "")

        # 1) exact match
        for event in odds_events:
            if event.get("home_team") == home_team and event.get("away_team") == away_team:
                return event

        normalized_home = self._normalize_team_name(home_team)
        normalized_away = self._normalize_team_name(away_team)

        # 2) normalized lowercase match
        for event in odds_events:
            if (
                self._normalize_team_name(event.get("home_team", "")) == normalized_home
                and self._normalize_team_name(event.get("away_team", "")) == normalized_away
            ):
                return event

        # 3) simple fuzzy/containment fallback
        for event in odds_events:
            event_home = self._normalize_team_name(event.get("home_team", ""))
            event_away = self._normalize_team_name(event.get("away_team", ""))
            if self._contains_match(normalized_home, event_home) and self._contains_match(normalized_away, event_away):
                return event

        return {}

    def _contains_match(self, left: str, right: str) -> bool:
        if left in right or right in left:
            return True
        left_tokens = set(left.split())
        right_tokens = set(right.split())
        return bool(left_tokens & right_tokens)

    def _normalize_team_name(self, value: str) -> str:
        cleaned = value.lower().replace(".", " ").replace("-", " ").strip()
        alias = {"bos": "boston", "nyy": "yankees", "nym": "mets", "cws": "white sox", "chw": "white sox", "sf": "giants", "sd": "padres", "kc": "royals", "tb": "rays", "stl": "cardinals"}
        words: list[str] = []
        for token in cleaned.split():
            mapped = alias.get(token, token)
            words.extend(mapped.split())
        parts = [p for p in words if p not in {"the", "los", "angeles", "new", "york"}]
        return " ".join(parts)

    def _safe_int(self, value: Any) -> int | None:
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    def _safe_float(self, value: Any) -> float | None:
        try:
            return float(value)
        except (TypeError, ValueError):
            return None
