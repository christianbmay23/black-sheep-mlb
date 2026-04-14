class OddsApiCollector:
    """Deterministic v1 collector using game payload odds fields."""

    def attach_market_odds(self, game: dict) -> dict:
        game["market"] = {
            "home_moneyline": game.get("home_moneyline"),
            "away_moneyline": game.get("away_moneyline"),
        }
        return game
