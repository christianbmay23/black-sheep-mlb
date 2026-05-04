"""HR Threat Score v1."""
from __future__ import annotations

from black_sheep_mlb.hr_intelligence.config import FEATURE_RANGES, SCORING_WEIGHTS
from black_sheep_mlb.hr_intelligence.schema import HitterInput


def normalize(value: float | None, low: float, high: float, default: float = 50.0) -> float:
    if value is None or high <= low:
        return default
    scaled = (value - low) / (high - low) * 100.0
    return max(0.0, min(100.0, scaled))


def batter_power_subscore(row: HitterInput) -> float:
    return _average_features(row, ["barrel_pct", "hardhit_pct", "iso", "pull_air_pct", "xslg"])


def recent_contact_subscore(row: HitterInput) -> float:
    return _average_features(
        row,
        ["last14_barrel_pct", "last14_hardhit_pct", "last14_avg_ev", "last14_sweetspot_pct"],
    )


def pitcher_vulnerability_subscore(row: HitterInput) -> float:
    return _average_features(
        row,
        [
            "pitcher_hr9",
            "pitcher_barrel_allowed_pct",
            "pitcher_hardhit_allowed_pct",
            "pitcher_fb_pct",
            "platoon_xslg_allowed",
        ],
    )


def score_components(row: HitterInput, edge_pct: float | None) -> dict[str, float]:
    market_range = FEATURE_RANGES["edge_pct"]
    risk_range = FEATURE_RANGES["risk_score"]
    risk_norm = normalize(row.risk_score, risk_range.low, risk_range.high, risk_range.default)
    return {
        "batter_power": batter_power_subscore(row),
        "recent_contact": recent_contact_subscore(row),
        "pitcher_vulnerability": pitcher_vulnerability_subscore(row),
        "pitch_type_matchup": _feature_score(row, "pitch_matchup_score"),
        "park_weather": _feature_score(row, "park_weather_hr_boost"),
        "lineup_pa": _feature_score(row, "pa_expectation"),
        "market_value": normalize(edge_pct, market_range.low, market_range.high, market_range.default),
        "risk_adjustment": 100.0 - risk_norm,
    }


def hr_threat_score(row: HitterInput, edge_pct: float | None) -> float:
    components = score_components(row, edge_pct)
    score = sum(components[name] * weight for name, weight in SCORING_WEIGHTS.items())
    return max(0.0, min(100.0, score))


def assign_tier(score: float) -> str:
    if score >= 90.0:
        return "Elite HR Target"
    if score >= 80.0:
        return "Strong HR Target"
    if score >= 70.0:
        return "Viable HR Lean"
    if score >= 60.0:
        return "Lottery Only"
    if score >= 50.0:
        return "Watchlist"
    return "Pass"


def _average_features(row: HitterInput, names: list[str]) -> float:
    values = [_feature_score(row, name) for name in names]
    return sum(values) / len(values)


def _feature_score(row: HitterInput, name: str) -> float:
    feature_range = FEATURE_RANGES[name]
    return normalize(getattr(row, name), feature_range.low, feature_range.high, feature_range.default)
