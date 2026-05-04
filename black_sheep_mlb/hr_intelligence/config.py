"""Configuration for EchoIQ HR Intelligence v1.

The values here are intentionally transparent and conservative. They are a
fixture/demo foundation, not a calibrated production model.
"""
from __future__ import annotations

from dataclasses import dataclass


SCORING_WEIGHTS = {
    "batter_power": 0.22,
    "recent_contact": 0.18,
    "pitcher_vulnerability": 0.16,
    "pitch_type_matchup": 0.14,
    "park_weather": 0.10,
    "lineup_pa": 0.08,
    "market_value": 0.07,
    "risk_adjustment": 0.05,
}

OUTPUT_COLUMNS = [
    "date",
    "game",
    "player_name",
    "player_id",
    "team",
    "opponent",
    "opposing_pitcher",
    "opposing_pitcher_id",
    "bat_side",
    "pitcher_hand",
    "lineup_status",
    "lineup_spot",
    "starter_status",
    "barrel_pct",
    "hardhit_pct",
    "iso",
    "xslg",
    "pull_air_pct",
    "last14_barrel_pct",
    "last14_hardhit_pct",
    "last14_avg_ev",
    "last14_sweetspot_pct",
    "pitcher_hr9",
    "pitcher_barrel_allowed_pct",
    "pitcher_hardhit_allowed_pct",
    "pitcher_fb_pct",
    "platoon_xslg_allowed",
    "pitch_matchup_score",
    "park_weather_hr_boost",
    "pa_expectation",
    "hr_odds",
    "implied_prob",
    "echoiq_fair_prob",
    "fair_odds",
    "edge_pct",
    "risk_score",
    "hr_threat_score",
    "tier",
    "action",
    "kill_flags",
    "missing_fields",
    "short_reason",
    "source_status",
]

OUTPUT_FILENAMES = {
    "full_board": "{date}_hr_full_board.csv",
    "final_card": "{date}_hr_final_card.csv",
    "lottery_card": "{date}_hr_lottery_card.csv",
    "watchlist": "{date}_hr_watchlist.csv",
    "audit_log": "{date}_hr_audit_log.json",
}

DEFAULT_OUTPUT_DIR = "outputs/hr_boards"

FIXTURE_DIR = "data/fixtures/echoiq_hr_intelligence"
DEFAULT_FIXTURE_FILE = "2026-04-24_hr_fixture.json"


@dataclass(frozen=True)
class FeatureRange:
    low: float
    high: float
    default: float = 50.0


FEATURE_RANGES = {
    "barrel_pct": FeatureRange(4.0, 20.0),
    "hardhit_pct": FeatureRange(25.0, 60.0),
    "iso": FeatureRange(0.100, 0.350),
    "pull_air_pct": FeatureRange(15.0, 45.0),
    "xslg": FeatureRange(0.300, 0.700),
    "last14_barrel_pct": FeatureRange(3.0, 24.0),
    "last14_hardhit_pct": FeatureRange(25.0, 65.0),
    "last14_avg_ev": FeatureRange(86.0, 96.0),
    "last14_sweetspot_pct": FeatureRange(25.0, 45.0),
    "pitcher_hr9": FeatureRange(0.5, 2.2),
    "pitcher_barrel_allowed_pct": FeatureRange(5.0, 14.0),
    "pitcher_hardhit_allowed_pct": FeatureRange(30.0, 50.0),
    "pitcher_fb_pct": FeatureRange(25.0, 55.0),
    "platoon_xslg_allowed": FeatureRange(0.300, 0.600),
    "pitch_matchup_score": FeatureRange(0.0, 100.0),
    "park_weather_hr_boost": FeatureRange(-10.0, 25.0),
    "pa_expectation": FeatureRange(3.0, 5.0),
    "edge_pct": FeatureRange(-0.20, 0.35),
    "risk_score": FeatureRange(0.0, 100.0),
}

CRITICAL_FIELDS = [
    "player_name",
    "team",
    "opponent",
    "opposing_pitcher",
    "barrel_pct",
    "hardhit_pct",
    "pitcher_hr9",
    "pitch_matchup_score",
    "pa_expectation",
]
