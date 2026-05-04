"""Typed row contracts for EchoIQ HR Intelligence v1."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class HitterInput:
    date: str
    game: str
    player_name: str
    team: str
    opponent: str
    opposing_pitcher: str
    player_id: str = ""
    opposing_pitcher_id: str = ""
    bat_side: str = ""
    pitcher_hand: str = ""
    lineup_status: str = "unconfirmed"
    lineup_spot: int | None = None
    starter_status: str = "unconfirmed"
    barrel_pct: float | None = None
    hardhit_pct: float | None = None
    iso: float | None = None
    xslg: float | None = None
    pull_air_pct: float | None = None
    last14_barrel_pct: float | None = None
    last14_hardhit_pct: float | None = None
    last14_avg_ev: float | None = None
    last14_sweetspot_pct: float | None = None
    pitcher_hr9: float | None = None
    pitcher_barrel_allowed_pct: float | None = None
    pitcher_hardhit_allowed_pct: float | None = None
    pitcher_fb_pct: float | None = None
    platoon_xslg_allowed: float | None = None
    pitch_matchup_score: float | None = None
    park_weather_hr_boost: float | None = None
    pa_expectation: float | None = None
    hr_odds: int | None = None
    risk_score: float | None = None
    injury_risk: bool = False
    wind_direction: str = ""
    pitcher_groundball_pct: float | None = None
    source_status: str = "fixture_only"
    source_notes: str = ""

    @classmethod
    def from_dict(cls, row: dict[str, Any], *, date_override: str | None = None) -> "HitterInput":
        payload = dict(row)
        if date_override:
            payload["date"] = date_override
        for key in _FLOAT_FIELDS:
            payload[key] = _to_float(payload.get(key))
        payload["hr_odds"] = _to_int(payload.get("hr_odds"))
        payload["lineup_spot"] = _to_int(payload.get("lineup_spot"))
        payload["injury_risk"] = bool(payload.get("injury_risk", False))
        return cls(**{key: payload[key] for key in cls.__dataclass_fields__ if key in payload})


@dataclass
class BoardRow:
    input: HitterInput
    implied_prob: float | None
    echoiq_fair_prob: float
    fair_odds: int | None
    edge_pct: float | None
    hr_threat_score: float
    tier: str
    action: str
    action_confidence: str = ""
    kill_flags: list[str] = field(default_factory=list)
    missing_fields: list[str] = field(default_factory=list)
    short_reason: str = ""

    def to_csv_row(self) -> dict[str, Any]:
        source = self.input
        return {
            "date": source.date,
            "game": source.game,
            "player_name": source.player_name,
            "player_id": source.player_id,
            "team": source.team,
            "opponent": source.opponent,
            "opposing_pitcher": source.opposing_pitcher,
            "opposing_pitcher_id": source.opposing_pitcher_id,
            "bat_side": source.bat_side,
            "pitcher_hand": source.pitcher_hand,
            "lineup_status": source.lineup_status,
            "lineup_spot": source.lineup_spot if source.lineup_spot is not None else "",
            "starter_status": source.starter_status,
            "barrel_pct": _fmt(source.barrel_pct),
            "hardhit_pct": _fmt(source.hardhit_pct),
            "iso": _fmt(source.iso, digits=3),
            "xslg": _fmt(source.xslg, digits=3),
            "pull_air_pct": _fmt(source.pull_air_pct),
            "last14_barrel_pct": _fmt(source.last14_barrel_pct),
            "last14_hardhit_pct": _fmt(source.last14_hardhit_pct),
            "last14_avg_ev": _fmt(source.last14_avg_ev),
            "last14_sweetspot_pct": _fmt(source.last14_sweetspot_pct),
            "pitcher_hr9": _fmt(source.pitcher_hr9),
            "pitcher_barrel_allowed_pct": _fmt(source.pitcher_barrel_allowed_pct),
            "pitcher_hardhit_allowed_pct": _fmt(source.pitcher_hardhit_allowed_pct),
            "pitcher_fb_pct": _fmt(source.pitcher_fb_pct),
            "platoon_xslg_allowed": _fmt(source.platoon_xslg_allowed, digits=3),
            "pitch_matchup_score": _fmt(source.pitch_matchup_score),
            "park_weather_hr_boost": _fmt(source.park_weather_hr_boost),
            "pa_expectation": _fmt(source.pa_expectation),
            "hr_odds": _format_odds(source.hr_odds),
            "implied_prob": _fmt(self.implied_prob, digits=4),
            "echoiq_fair_prob": _fmt(self.echoiq_fair_prob, digits=4),
            "fair_odds": _format_odds(self.fair_odds),
            "edge_pct": _fmt(self.edge_pct, digits=4),
            "risk_score": _fmt(source.risk_score),
            "hr_threat_score": _fmt(self.hr_threat_score),
            "tier": self.tier,
            "action": self.action,
            "action_confidence": self.action_confidence,
            "kill_flags": "|".join(self.kill_flags),
            "missing_fields": "|".join(self.missing_fields),
            "short_reason": self.short_reason,
            "source_status": source.source_status,
        }


_FLOAT_FIELDS = {
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
    "risk_score",
    "pitcher_groundball_pct",
}


def _to_float(value: Any) -> float | None:
    if value in {"", None, "NA", "N/A", "unavailable"}:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value: Any) -> int | None:
    if value in {"", None, "NA", "N/A", "unavailable"}:
        return None
    try:
        return int(float(str(value).replace("+", "")))
    except (TypeError, ValueError):
        return None


def _fmt(value: float | None, *, digits: int = 2) -> str:
    if value is None:
        return ""
    return f"{value:.{digits}f}"


def _format_odds(value: int | None) -> str:
    if value is None:
        return ""
    return f"+{value}" if value > 0 else str(value)
