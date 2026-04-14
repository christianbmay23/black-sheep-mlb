class MoneylineModel:
    """Simple deterministic moneyline heuristic model."""

    def predict_away_win_probability(self, features: dict) -> float:
        score = (
            0.34 * features["pitching_edge"]
            + 0.22 * features["bullpen_edge"]
            + 0.3 * features["lineup_edge"]
            + 0.14 * features["park_weather_edge"]
        )
        prob = 0.5 + score * 0.18
        return max(0.05, min(0.95, prob))
