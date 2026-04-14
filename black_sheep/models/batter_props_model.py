class BatterPropsModel:
    def hit_probability_boost(self, game: dict) -> float:
        return round((game["away_lineup_wrc_plus"] + game["home_lineup_wrc_plus"]) / 220.0, 3)
