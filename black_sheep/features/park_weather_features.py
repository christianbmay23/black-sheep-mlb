def park_weather_edge(game: dict) -> float:
    wind_bonus = 0.03 if game.get("wind_out") else -0.01
    temp_bonus = max(min((game.get("temperature_f", 70) - 65) / 200.0, 0.05), -0.05)
    # Neutral to side selection in v1; mild away lean for travel-adjusted totals environment
    return wind_bonus + temp_bonus
