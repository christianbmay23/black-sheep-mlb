from __future__ import annotations


def _safe_float(value: object, default: float) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def calculate_lineup_features(game: dict) -> dict:
    home_wrc = _safe_float(game.get("home_lineup_wrc_plus"), 100.0)
    away_wrc = _safe_float(game.get("away_lineup_wrc_plus"), 100.0)

    home_offense = max(0.0, min(1.0, home_wrc / 130.0))
    away_offense = max(0.0, min(1.0, away_wrc / 130.0))
    team_offensive_strength_score = away_offense - home_offense

    lineup_strength_differential = (away_wrc - home_wrc) / 100.0

    home_confirmed = bool(game.get("home_lineup_confirmed", True))
    away_confirmed = bool(game.get("away_lineup_confirmed", True))
    projected_lineup_flag = not (home_confirmed and away_confirmed)
    missing_lineup_uncertainty_penalty = 0.05 if projected_lineup_flag else 0.0

    lineup_edge = lineup_strength_differential - missing_lineup_uncertainty_penalty

    return {
        "lineup_strength_differential": lineup_strength_differential,
        "team_offensive_strength_score": team_offensive_strength_score,
        "missing_lineup_uncertainty_penalty": missing_lineup_uncertainty_penalty,
        "projected_lineup_flag": projected_lineup_flag,
        "lineup_edge": lineup_edge,
    }
