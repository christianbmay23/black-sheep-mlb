def build_risk_flags(game: dict, edge: float) -> list[str]:
    flags: list[str] = []
    if not game.get("home_lineup_confirmed", True) or not game.get("away_lineup_confirmed", True):
        flags.append("Lineups not confirmed")
    if game.get("wind_mph", 0) >= 16:
        flags.append("High wind volatility")
    if abs(edge) < 0.02:
        flags.append("Thin edge")
    return flags
