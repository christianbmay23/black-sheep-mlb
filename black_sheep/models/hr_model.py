class HRModel:
    def game_hr_factor(self, game: dict) -> float:
        factor = 1.0 + (0.08 if game["wind_out"] else -0.03) + (game["temperature_f"] - 70) * 0.005
        return round(max(0.7, min(1.4, factor)), 3)
