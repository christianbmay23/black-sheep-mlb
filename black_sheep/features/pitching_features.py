from __future__ import annotations


def _safe_float(value: object, default: float) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def calculate_pitching_features(game: dict) -> dict:
    home_era = _safe_float(game.get("home_pitcher_era"), 4.0)
    away_era = _safe_float(game.get("away_pitcher_era"), 4.0)
    starter_era_differential = home_era - away_era

    home_hand = (game.get("home_starter_handedness") or "U").upper()
    away_hand = (game.get("away_starter_handedness") or "U").upper()
    handedness_placeholder = 0.0
    if home_hand == "L" and away_hand == "R":
        handedness_placeholder = 0.02
    elif home_hand == "R" and away_hand == "L":
        handedness_placeholder = -0.02

    home_recent_era = _safe_float(game.get("home_starter_recent_era"), home_era)
    away_recent_era = _safe_float(game.get("away_starter_recent_era"), away_era)
    recent_form_differential = home_recent_era - away_recent_era

    home_recent_ip = _safe_float(game.get("home_starter_recent_ip"), 5.5)
    away_recent_ip = _safe_float(game.get("away_starter_recent_ip"), 5.5)
    innings_differential = away_recent_ip - home_recent_ip

    home_quality = max(0.0, min(1.0, (5.5 - home_era) / 3.5))
    away_quality = max(0.0, min(1.0, (5.5 - away_era) / 3.5))
    pitcher_quality_score = away_quality - home_quality

    starter_edge = (
        0.55 * starter_era_differential
        + 0.20 * recent_form_differential
        + 0.15 * innings_differential
        + 0.10 * handedness_placeholder
    ) / 4.0

    used_fallback = not any(
        game.get(key) is not None
        for key in ["home_starter_recent_era", "away_starter_recent_era", "home_starter_recent_ip", "away_starter_recent_ip"]
    )

    return {
        "starter_era_differential": starter_era_differential,
        "starter_handedness_placeholder": handedness_placeholder,
        "starter_recent_form_differential": recent_form_differential,
        "starter_innings_differential": innings_differential,
        "pitcher_quality_score": pitcher_quality_score,
        "starter_edge": starter_edge,
        "pitching_fallback_used": used_fallback,
    }
