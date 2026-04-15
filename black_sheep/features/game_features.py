from .bullpen_features import calculate_bullpen_features
from .lineup_features import calculate_lineup_features
from .park_weather_features import calculate_park_weather_features
from .pitching_features import calculate_pitching_features


def build_game_features(game: dict) -> dict:
    pitching = calculate_pitching_features(game)
    bullpen = calculate_bullpen_features(game)
    lineup = calculate_lineup_features(game)
    park_weather = calculate_park_weather_features(game)

    volatility_score = min(
        1.0,
        abs(park_weather["run_environment_score"]) * 0.7
        + (0.2 if lineup["projected_lineup_flag"] else 0.0)
        + (0.15 if bullpen["bullpen_fallback_used"] else 0.0),
    )

    fallback_count = sum(
        [
            pitching["pitching_fallback_used"],
            bullpen["bullpen_fallback_used"],
            lineup["projected_lineup_flag"],
        ]
    )
    data_quality_score = max(0.2, 1.0 - fallback_count * 0.2)

    feature_notes: list[str] = []
    if pitching["pitching_fallback_used"]:
        feature_notes.append("Pitching recent-form data unavailable; using ERA defaults.")
    if bullpen["bullpen_fallback_used"]:
        feature_notes.append("Bullpen 3-day workload unavailable; using placeholder usage.")
    if lineup["projected_lineup_flag"]:
        feature_notes.append("At least one lineup is projected, not confirmed.")

    return {
        "starter_edge": pitching["starter_edge"],
        "bullpen_edge": bullpen["bullpen_advantage_score"],
        "lineup_edge": lineup["lineup_edge"],
        "park_weather_edge": park_weather["park_weather_edge"],
        "volatility_score": volatility_score,
        "data_quality_score": data_quality_score,
        "feature_notes": feature_notes,
        "pitching": pitching,
        "bullpen": bullpen,
        "lineup": lineup,
        "park_weather": park_weather,
    }
