"""Market math for EchoIQ HR Intelligence v1."""
from __future__ import annotations


def american_odds_to_implied_probability(odds: int | float | str | None) -> float | None:
    value = _parse_odds(odds)
    if value is None or value == 0:
        return None
    if value > 0:
        return 100.0 / (value + 100.0)
    return abs(value) / (abs(value) + 100.0)


def implied_probability_to_american_odds(probability: float | None) -> int | None:
    if probability is None or probability <= 0.0 or probability >= 1.0:
        return None
    if probability >= 0.5:
        return int(round(-100.0 * probability / (1.0 - probability)))
    return int(round(100.0 * (1.0 - probability) / probability))


def fair_probability_from_score(score: float) -> float:
    """Map HR Threat Score to a conservative fair HR probability.

    Anchor points follow the v1 prompt:
    50 -> 2.0%, 60 -> 3.5%, 70 -> 5.5%, 80 -> 8.0%,
    90 -> 11.5%, 100 -> 15.0%.
    """
    anchors = [
        (0.0, 0.005),
        (50.0, 0.020),
        (60.0, 0.035),
        (70.0, 0.055),
        (80.0, 0.080),
        (90.0, 0.115),
        (100.0, 0.150),
    ]
    score = max(0.0, min(100.0, score))
    for idx, (left_score, left_prob) in enumerate(anchors[:-1]):
        right_score, right_prob = anchors[idx + 1]
        if left_score <= score <= right_score:
            span = right_score - left_score
            if span == 0:
                return left_prob
            ratio = (score - left_score) / span
            return left_prob + (right_prob - left_prob) * ratio
    return anchors[-1][1]


def calculate_edge(fair_probability: float | None, market_probability: float | None) -> float | None:
    """Return relative model edge versus market implied probability.

    A value of 0.15 means the fair probability is 15% higher than the market
    implied probability, not an absolute 0.15 probability delta.
    """
    if fair_probability is None or market_probability is None or market_probability <= 0:
        return None
    return (fair_probability - market_probability) / market_probability


def fair_odds_from_probability(probability: float | None) -> int | None:
    return implied_probability_to_american_odds(probability)


def _parse_odds(odds: int | float | str | None) -> int | None:
    if odds is None:
        return None
    if isinstance(odds, str):
        cleaned = odds.strip().replace("+", "")
        if not cleaned:
            return None
        try:
            return int(float(cleaned))
        except ValueError:
            return None
    try:
        return int(odds)
    except (TypeError, ValueError):
        return None
