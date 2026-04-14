class LineupsCollector:
    def enrich_lineups(self, game: dict) -> dict:
        game.setdefault("home_lineup_confirmed", True)
        game.setdefault("away_lineup_confirmed", True)
        return game
