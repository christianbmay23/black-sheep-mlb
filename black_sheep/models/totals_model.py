class TotalsModel:
    def predict_total(self, game: dict) -> float:
        base = 8.2
        run_env = (game["temperature_f"] - 65) * 0.02 + (0.25 if game["wind_out"] else -0.1)
        pitching_suppression = -0.15 * (4.0 - (game["home_pitcher_era"] + game["away_pitcher_era"]) / 2)
        return round(base + run_env + pitching_suppression, 2)
