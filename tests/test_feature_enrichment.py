from black_sheep.features.bullpen_features import calculate_bullpen_features
from black_sheep.features.lineup_features import calculate_lineup_features
from black_sheep.features.park_weather_features import calculate_park_weather_features
from black_sheep.features.pitching_features import calculate_pitching_features


def test_pitching_feature_calculation() -> None:
    game = {
        "home_pitcher_era": 4.2,
        "away_pitcher_era": 3.4,
        "home_starter_handedness": "R",
        "away_starter_handedness": "L",
        "home_starter_recent_era": 4.8,
        "away_starter_recent_era": 3.2,
        "home_starter_recent_ip": 4.2,
        "away_starter_recent_ip": 6.0,
    }
    features = calculate_pitching_features(game)
    assert features["starter_era_differential"] > 0
    assert features["pitcher_quality_score"] > 0
    assert features["pitching_fallback_used"] is False


def test_bullpen_feature_calculation() -> None:
    game = {
        "home_bullpen_era": 4.4,
        "away_bullpen_era": 3.5,
        "home_bullpen_pitch_count_last_3d": 95,
        "away_bullpen_pitch_count_last_3d": 70,
    }
    features = calculate_bullpen_features(game)
    assert features["bullpen_era_differential"] > 0
    assert features["bullpen_fatigue_score"] > 0
    assert features["bullpen_fallback_used"] is False


def test_lineup_feature_calculation() -> None:
    game = {
        "home_lineup_wrc_plus": 95,
        "away_lineup_wrc_plus": 112,
        "home_lineup_confirmed": True,
        "away_lineup_confirmed": False,
    }
    features = calculate_lineup_features(game)
    assert features["lineup_strength_differential"] > 0
    assert features["projected_lineup_flag"] is True
    assert features["missing_lineup_uncertainty_penalty"] > 0


def test_park_weather_scoring() -> None:
    game = {
        "venue": "Yankee Stadium",
        "wind_mph": 14,
        "wind_out": True,
        "temperature_f": 82,
    }
    features = calculate_park_weather_features(game)
    assert features["run_environment_score"] > 0
    assert features["hr_environment_score"] > 0
    assert features["wind_adjustment"] > 0
    assert features["temperature_adjustment"] > 0
