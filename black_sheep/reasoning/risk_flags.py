def build_risk_flags(game: dict, edge: float, features: dict | None = None) -> list[str]:
    flags: list[str] = []
    features = features or {}

    if not game.get("home_lineup_confirmed", True) or not game.get("away_lineup_confirmed", True):
        flags.append("Lineups not confirmed")
    if game.get("wind_mph", 0) >= 16:
        flags.append("High wind volatility")
    if abs(edge) < 0.02:
        flags.append("Thin edge")

    volatility = features.get("volatility_score", 0.0)
    data_quality = features.get("data_quality_score", 1.0)
    if volatility >= 0.35:
        flags.append("Elevated run environment volatility")
    if data_quality <= 0.6:
        flags.append("Partial feature fallback data")
    return flags
