"""The Odds API provider behind the shared odds abstraction."""
from __future__ import annotations

import json
import logging
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Any

from .odds_provider import BookmakerMarket, GameOdds, OddsOutcome

logger = logging.getLogger(__name__)


class TheOddsAPIProvider:
    provider_name = "oddsapi"

    def __init__(
        self,
        api_key: str | None,
        *,
        sport_key: str = "baseball_mlb",
        base_url: str = "https://api.the-odds-api.com/v4",
        timeout: int = 30,
    ):
        self.api_key = api_key
        self.sport_key = sport_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.last_usage_headers: dict[str, str] = {}
        self.last_error: str | None = None

    def get_game_odds(
        self,
        date: str,
        markets: list[str],
        regions: list[str] | None = None,
        bookmakers: list[str] | None = None,
    ) -> list[GameOdds]:
        self.last_error = None
        if not self.api_key:
            self.last_error = "missing_api_key"
            logger.warning("ODDS_API_KEY is missing; skipping live odds fetch.")
            return []
        params = {
            "apiKey": self.api_key,
            "regions": ",".join(regions or ["us"]),
            "markets": ",".join(markets or ["h2h", "spreads", "totals"]),
            "oddsFormat": "american",
            "dateFormat": "iso",
        }
        if bookmakers:
            params["bookmakers"] = ",".join(bookmakers)
            params.pop("regions", None)
        url = f"{self.base_url}/sports/{self.sport_key}/odds?{urllib.parse.urlencode(params)}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "black-sheep-mlb/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                self.last_usage_headers = {
                    key: value
                    for key, value in response.headers.items()
                    if key.lower().startswith("x-requests")
                }
                if self.last_usage_headers:
                    logger.info("Odds API usage headers: %s", self.last_usage_headers)
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            self.last_error = f"http_{exc.code}"
            if exc.code in {401, 402, 429} or exc.code >= 500:
                logger.warning("Odds API request failed with HTTP %s; returning empty odds.", exc.code)
                return []
            logger.warning("Odds API request failed with HTTP %s; returning empty odds.", exc.code)
            return []
        except Exception as exc:
            self.last_error = type(exc).__name__
            logger.warning("Odds API request failed: %s", exc)
            return []
        return [self._parse_event(event) for event in payload if isinstance(event, dict)]

    def _parse_event(self, event: dict[str, Any]) -> GameOdds:
        markets: list[BookmakerMarket] = []
        for bookmaker in event.get("bookmakers") or []:
            bookmaker_key = str(bookmaker.get("key") or bookmaker.get("title") or "")
            for market in bookmaker.get("markets") or []:
                markets.append(
                    BookmakerMarket(
                        bookmaker=bookmaker_key,
                        market=str(market.get("key") or ""),
                        outcomes=[
                            OddsOutcome(
                                name=str(outcome.get("name") or ""),
                                price=outcome.get("price"),
                                point=outcome.get("point"),
                            )
                            for outcome in (market.get("outcomes") or [])
                        ],
                    )
                )
        return GameOdds(
            provider="oddsapi",
            sport_key=self.sport_key,
            game_id=str(event.get("id") or ""),
            commence_time=event.get("commence_time"),
            home_team=str(event.get("home_team") or ""),
            away_team=str(event.get("away_team") or ""),
            markets=markets,
            fetched_at=datetime.now(timezone.utc).isoformat(),
        )
