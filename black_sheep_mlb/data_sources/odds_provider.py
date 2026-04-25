"""Shared odds provider contracts."""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Protocol


@dataclass
class OddsOutcome:
    name: str
    price: int | float | None
    point: float | None = None


@dataclass
class BookmakerMarket:
    bookmaker: str
    market: str
    outcomes: list[OddsOutcome]


@dataclass
class GameOdds:
    provider: str
    sport_key: str
    game_id: str
    commence_time: str | None
    home_team: str
    away_team: str
    markets: list[BookmakerMarket]
    fetched_at: str


class OddsProvider(Protocol):
    def get_game_odds(
        self,
        date: str,
        markets: list[str],
        regions: list[str] | None = None,
        bookmakers: list[str] | None = None,
    ) -> list[GameOdds]:
        ...


def game_odds_to_dict(odds: GameOdds) -> dict[str, Any]:
    return asdict(odds)


def game_odds_from_dict(raw: dict[str, Any]) -> GameOdds:
    return GameOdds(
        provider=str(raw.get("provider") or ""),
        sport_key=str(raw.get("sport_key") or ""),
        game_id=str(raw.get("game_id") or ""),
        commence_time=raw.get("commence_time"),
        home_team=str(raw.get("home_team") or ""),
        away_team=str(raw.get("away_team") or ""),
        markets=[
            BookmakerMarket(
                bookmaker=str(m.get("bookmaker") or ""),
                market=str(m.get("market") or ""),
                outcomes=[
                    OddsOutcome(
                        name=str(o.get("name") or ""),
                        price=o.get("price"),
                        point=o.get("point"),
                    )
                    for o in (m.get("outcomes") or [])
                ],
            )
            for m in (raw.get("markets") or [])
        ],
        fetched_at=str(raw.get("fetched_at") or ""),
    )
