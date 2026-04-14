class WeatherCollector:
    def enrich_weather(self, game: dict) -> dict:
        game.setdefault("temperature_f", 72.0)
        game.setdefault("wind_mph", 6.0)
        game.setdefault("wind_out", False)
        return game
