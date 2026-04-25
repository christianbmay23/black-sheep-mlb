"""Manual CSV odds provider for no-credit or hand-entered market snapshots."""
from __future__ import annotations

import csv
import logging
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from .odds_provider import BookmakerMarket, GameOdds, OddsOutcome

logger = logging.getLogger(__name__)


class ManualCSVOddsProvider:
    provider_name = "manual_csv"
    sport_key = "baseball_mlb"

    def __init__(self, csv_path: str | Path = "data/manual/odds_snapshot.csv"):
        self.csv_path = Path(csv_path)

    def get_game_odds(
        self,
        date: str,
        markets: list[str],
        regions: list[str] | None = None,
        bookmakers: list[str] | None = None,
    ) -> list[GameOdds]:
        if not self.csv_path.is_file():
            logger.info("manual odds CSV missing at %s; returning empty odds.", self.csv_path)
            return []
        wanted_markets = set(markets or [])
        wanted_books = set(bookmakers or [])
        grouped: dict[tuple[str, str, str, str | None], list[OddsOutcome]] = defaultdict(list)
        with self.csv_path.open(newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                if str(row.get("date") or "") != date:
                    continue
                market = str(row.get("market") or "")
                bookmaker = str(row.get("bookmaker") or "")
                if wanted_markets and market not in wanted_markets:
                    continue
                if wanted_books and bookmaker not in wanted_books:
                    continue
                key = (
                    str(row.get("away_team") or ""),
                    str(row.get("home_team") or ""),
                    bookmaker,
                    row.get("commence_time") or None,
                )
                grouped[(key[0], key[1], key[2], key[3], market)].append(
                    OddsOutcome(
                        name=str(row.get("outcome_name") or ""),
                        price=_parse_number(row.get("price")),
                        point=_parse_number(row.get("point")),
                    )
                )
        by_game: dict[tuple[str, str, str | None], list[BookmakerMarket]] = defaultdict(list)
        for (away, home, bookmaker, commence_time, market), outcomes in grouped.items():
            by_game[(away, home, commence_time)].append(
                BookmakerMarket(bookmaker=bookmaker, market=market, outcomes=outcomes)
            )
        fetched_at = datetime.now(timezone.utc).isoformat()
        return [
            GameOdds(
                provider="manual_csv",
                sport_key=self.sport_key,
                game_id=f"manual:{date}:{away}@{home}",
                commence_time=commence_time,
                home_team=home,
                away_team=away,
                markets=markets_for_game,
                fetched_at=fetched_at,
            )
            for (away, home, commence_time), markets_for_game in by_game.items()
        ]


def _parse_number(value: object) -> int | float | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        number = float(raw)
    except ValueError:
        return None
    return int(number) if number.is_integer() else number
