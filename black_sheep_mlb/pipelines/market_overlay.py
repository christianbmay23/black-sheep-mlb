"""Market math and optional odds overlay helpers."""
from __future__ import annotations

from black_sheep_mlb.data_sources.odds_provider import GameOdds


def american_to_prob(price: int | float) -> float:
    p = float(price)
    if p > 0:
        return 100.0 / (p + 100.0)
    if p < 0:
        return abs(p) / (abs(p) + 100.0)
    raise ValueError("American odds price cannot be zero")


def remove_vig_two_way(prob_a: float, prob_b: float) -> tuple[float, float]:
    total = prob_a + prob_b
    if total <= 0:
        return 0.5, 0.5
    return prob_a / total, prob_b / total


def compute_edge(model_prob: float | None, market_prob: float | None) -> float | None:
    if model_prob is None or market_prob is None:
        return None
    return model_prob - market_prob


def best_h2h_for_team(odds: GameOdds, team_name: str) -> tuple[str | None, int | float | None, float | None]:
    best_book: str | None = None
    best_price: int | float | None = None
    best_market_prob: float | None = None
    for market in odds.markets:
        if market.market != "h2h":
            continue
        for outcome in market.outcomes:
            if outcome.name.strip().lower() != team_name.strip().lower() or outcome.price is None:
                continue
            if best_price is None or float(outcome.price) > float(best_price):
                best_book = market.bookmaker
                best_price = outcome.price
                best_market_prob = american_to_prob(outcome.price)
    return best_book, best_price, best_market_prob


def no_vig_for_h2h(odds: GameOdds) -> dict[str, float]:
    by_book: dict[str, list[tuple[str, float]]] = {}
    for market in odds.markets:
        if market.market != "h2h":
            continue
        priced = [
            (outcome.name, american_to_prob(outcome.price))
            for outcome in market.outcomes
            if outcome.price is not None
        ]
        if len(priced) == 2:
            by_book[market.bookmaker] = priced
    out: dict[str, float] = {}
    for priced in by_book.values():
        a, b = remove_vig_two_way(priced[0][1], priced[1][1])
        out[priced[0][0].strip().lower()] = a
        out[priced[1][0].strip().lower()] = b
        break
    return out
