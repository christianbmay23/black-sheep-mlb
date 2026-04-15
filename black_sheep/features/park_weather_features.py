from __future__ import annotations

PARK_FACTOR_MAP = {
    "angels stadium": 0.99,
    "busch stadium": 0.95,
    "chase field": 1.04,
    "citi field": 0.96,
    "citizens bank park": 1.04,
    "comerica park": 0.97,
    "coors field": 1.25,
    "dodger stadium": 0.95,
    "fenway park": 1.05,
    "globe life field": 1.01,
    "great american ball park": 1.08,
    "guaranteed rate field": 1.03,
    "kauffman stadium": 0.98,
    "loanDepot park": 0.94,
    "loan depot park": 0.94,
    "minute maid park": 1.01,
    "nationals park": 1.00,
    "oakland coliseum": 0.93,
    "oriole park at camden yards": 1.01,
    "petco park": 0.95,
    "pnc park": 0.96,
    "progressive field": 1.01,
    "rogers centre": 1.05,
    "t-mobile park": 0.95,
    "target field": 0.98,
    "tropicana field": 0.96,
    "truist park": 1.03,
    "wrigley field": 1.03,
    "yankee stadium": 1.07,
}


def _safe_float(value: object, default: float) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def calculate_park_weather_features(game: dict) -> dict:
    venue = str(game.get("venue", "Unknown Venue")).strip().lower()
    park_factor = PARK_FACTOR_MAP.get(venue, 1.00)

    wind_mph = _safe_float(game.get("wind_mph"), 6.0)
    temperature_f = _safe_float(game.get("temperature_f"), 70.0)
    wind_out = bool(game.get("wind_out", False))

    wind_adjustment = min(0.07, wind_mph / 120.0)
    if not wind_out:
        wind_adjustment *= -0.4

    temperature_adjustment = max(-0.05, min(0.05, (temperature_f - 70.0) / 220.0))

    run_environment_score = (park_factor - 1.0) + temperature_adjustment + wind_adjustment
    hr_environment_score = (park_factor - 1.0) * 1.4 + wind_adjustment * 1.2
    park_weather_edge = run_environment_score * 0.25

    return {
        "park_factor": park_factor,
        "wind_adjustment": wind_adjustment,
        "temperature_adjustment": temperature_adjustment,
        "run_environment_score": run_environment_score,
        "hr_environment_score": hr_environment_score,
        "park_weather_edge": park_weather_edge,
    }
