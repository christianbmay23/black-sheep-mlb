from __future__ import annotations


def _safe_float(value: object, default: float) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def calculate_bullpen_features(game: dict) -> dict:
    home_bullpen_era = _safe_float(game.get("home_bullpen_era"), 4.1)
    away_bullpen_era = _safe_float(game.get("away_bullpen_era"), 4.1)
    bullpen_era_differential = home_bullpen_era - away_bullpen_era

    home_usage_3d = _safe_float(game.get("home_bullpen_pitch_count_last_3d"), 65.0)
    away_usage_3d = _safe_float(game.get("away_bullpen_pitch_count_last_3d"), 65.0)
    recent_bullpen_usage_differential = away_usage_3d - home_usage_3d

    home_fatigue = max(0.0, min(1.0, (home_usage_3d - 45.0) / 50.0))
    away_fatigue = max(0.0, min(1.0, (away_usage_3d - 45.0) / 50.0))
    bullpen_fatigue_score = home_fatigue - away_fatigue

    bullpen_advantage_score = (0.70 * bullpen_era_differential + 0.30 * bullpen_fatigue_score) / 4.0

    fallback_used = game.get("home_bullpen_pitch_count_last_3d") is None or game.get("away_bullpen_pitch_count_last_3d") is None

    return {
        "bullpen_era_differential": bullpen_era_differential,
        "bullpen_fatigue_score": bullpen_fatigue_score,
        "recent_bullpen_usage_differential": recent_bullpen_usage_differential,
        "bullpen_advantage_score": bullpen_advantage_score,
        "bullpen_fallback_used": fallback_used,
    }
