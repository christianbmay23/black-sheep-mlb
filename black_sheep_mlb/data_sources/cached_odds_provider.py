"""SQLite-backed odds provider cache."""
from __future__ import annotations

import json
import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .odds_provider import GameOdds, OddsProvider, game_odds_from_dict, game_odds_to_dict

logger = logging.getLogger(__name__)


class CachedOddsProvider:
    def __init__(self, wrapped: OddsProvider, cache_db_path: str | Path, stale_minutes: int = 45):
        self.wrapped = wrapped
        self.cache_db_path = Path(cache_db_path)
        self.stale_minutes = stale_minutes
        self.last_cache_hit = False
        self.last_live_fetch = False
        self.last_failure = False
        self._init_db()

    def _init_db(self) -> None:
        self.cache_db_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.cache_db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS odds_cache (
                    cache_key TEXT PRIMARY KEY,
                    fetched_at TEXT NOT NULL,
                    payload TEXT NOT NULL
                )
                """
            )

    def _cache_key(
        self,
        date: str,
        markets: list[str],
        regions: list[str] | None,
        bookmakers: list[str] | None,
    ) -> str:
        provider = getattr(self.wrapped, "provider_name", self.wrapped.__class__.__name__)
        sport_key = getattr(self.wrapped, "sport_key", "baseball_mlb")
        return json.dumps(
            {
                "provider": provider,
                "date": date,
                "sport_key": sport_key,
                "markets": sorted(markets or []),
                "regions": sorted(regions or []),
                "bookmakers": sorted(bookmakers or []),
            },
            sort_keys=True,
        )

    def _load(self, key: str) -> tuple[datetime, list[GameOdds]] | None:
        with sqlite3.connect(self.cache_db_path) as conn:
            row = conn.execute("SELECT fetched_at, payload FROM odds_cache WHERE cache_key = ?", (key,)).fetchone()
        if row is None:
            return None
        fetched_at = datetime.fromisoformat(str(row[0]))
        payload = json.loads(str(row[1]))
        return fetched_at, [game_odds_from_dict(item) for item in payload]

    def _store(self, key: str, odds: list[GameOdds]) -> None:
        fetched_at = datetime.now(timezone.utc).isoformat()
        payload = json.dumps([game_odds_to_dict(item) for item in odds])
        with sqlite3.connect(self.cache_db_path) as conn:
            conn.execute(
                "REPLACE INTO odds_cache (cache_key, fetched_at, payload) VALUES (?, ?, ?)",
                (key, fetched_at, payload),
            )

    def get_game_odds(
        self,
        date: str,
        markets: list[str],
        regions: list[str] | None = None,
        bookmakers: list[str] | None = None,
    ) -> list[GameOdds]:
        self.last_cache_hit = False
        self.last_live_fetch = False
        self.last_failure = False
        key = self._cache_key(date, markets, regions, bookmakers)
        cached = self._load(key)
        now = datetime.now(timezone.utc)
        if cached is not None:
            fetched_at, odds = cached
            age_minutes = (now - fetched_at.astimezone(timezone.utc)).total_seconds() / 60
            if age_minutes <= self.stale_minutes:
                self.last_cache_hit = True
                logger.info("fresh odds cache hit for %s", date)
                return odds
        try:
            odds = self.wrapped.get_game_odds(date, markets, regions, bookmakers)
        except Exception as exc:
            self.last_failure = True
            logger.warning("odds provider raised; falling back to stale cache if present: %s", exc)
            if cached is not None:
                self.last_cache_hit = True
                return cached[1]
            return []
        if odds:
            self.last_live_fetch = True
            self._store(key, odds)
            return odds
        self.last_failure = True
        if cached is not None:
            logger.warning("live odds unavailable; using stale cache for %s", date)
            self.last_cache_hit = True
            return cached[1]
        return []
