def lineup_edge(game: dict) -> float:
    # Positive means away lineup advantage
    return (game["away_lineup_wrc_plus"] - game["home_lineup_wrc_plus"]) / 100.0
