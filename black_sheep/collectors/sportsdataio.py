class SportsDataIOCollector:
    def enrich_team_context(self, game: dict) -> dict:
        game.setdefault("home_rest_days", 1)
        game.setdefault("away_rest_days", 1)
        return game
