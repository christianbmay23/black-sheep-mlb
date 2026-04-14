def pitching_edge(game: dict) -> float:
    # Positive means away advantage; lower ERA is better
    return game["home_pitcher_era"] - game["away_pitcher_era"]
