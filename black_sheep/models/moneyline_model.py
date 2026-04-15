from __future__ import annotations

from black_sheep.utils.odds import implied_prob_to_american


class MoneylineModel:
    """Deterministic moneyline model driven by enriched game-level features."""

    def predict(self, features: dict) -> dict:
        weighted_edge = (
            0.38 * features["starter_edge"]
            + 0.26 * features["bullpen_edge"]
            + 0.24 * features["lineup_edge"]
            + 0.12 * features["park_weather_edge"]
        )

        away_probability = max(0.05, min(0.95, 0.50 + weighted_edge))
        home_probability = 1 - away_probability

        return {
            "away_probability": away_probability,
            "home_probability": home_probability,
            "away_fair_odds": implied_prob_to_american(away_probability),
            "home_fair_odds": implied_prob_to_american(home_probability),
        }
