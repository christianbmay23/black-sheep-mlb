def bullpen_edge(game: dict) -> float:
    return game["home_bullpen_era"] - game["away_bullpen_era"]
