"""Verification flags and action assignment for EchoIQ HR Intelligence v1."""
from __future__ import annotations

from black_sheep_mlb.hr_intelligence.config import CRITICAL_FIELDS
from black_sheep_mlb.hr_intelligence.schema import HitterInput

MAJOR_KILL_FLAGS = {
    "NOT_IN_LINEUP",
    "MISSING_CRITICAL_DATA",
    "STARTER_UNCONFIRMED",
}


def missing_fields(row: HitterInput) -> list[str]:
    missing = []
    for name in CRITICAL_FIELDS:
        value = getattr(row, name)
        if value in {"", None}:
            missing.append(name)
    return missing


def kill_flags(row: HitterInput, edge_pct: float | None) -> list[str]:
    flags: list[str] = []
    lineup_status = row.lineup_status.lower()
    starter_status = row.starter_status.lower()
    if lineup_status in {"out", "not_in_lineup", "not in lineup"}:
        flags.append("NOT_IN_LINEUP")
    elif lineup_status != "confirmed":
        flags.append("LINEUP_UNCONFIRMED")
    if row.pa_expectation is not None and row.pa_expectation < 3.7:
        flags.append("LOW_PA_EXPECTATION")
    if row.wind_direction.lower() in {"in", "wind_in", "in from outfield"}:
        flags.append("WIND_IN")
    if row.pitcher_groundball_pct is not None and row.pitcher_groundball_pct >= 52.0:
        flags.append("ELITE_GB_PITCHER")
    if row.injury_risk:
        flags.append("INJURY_RISK")
    if row.hr_odds is None:
        flags.append("NO_HR_ODDS")
    if edge_pct is not None and edge_pct < 0:
        flags.append("NEGATIVE_EDGE")
    if edge_pct is not None and edge_pct <= -0.05:
        flags.append("BAD_PRICE")
    if missing_fields(row):
        flags.append("MISSING_CRITICAL_DATA")
    if starter_status != "confirmed":
        flags.append("STARTER_UNCONFIRMED")
    return flags


def assign_action(score: float, edge_pct: float | None, row: HitterInput, flags: list[str]) -> str:
    flag_set = set(flags)
    has_major = bool(flag_set & MAJOR_KILL_FLAGS)
    confirmed_lineup = row.lineup_status.lower() == "confirmed"
    confirmed_starter = row.starter_status.lower() == "confirmed"
    long_odds = row.hr_odds is not None and row.hr_odds >= 400

    if "NOT_IN_LINEUP" in flag_set or "MISSING_CRITICAL_DATA" in flag_set:
        return "PASS"
    if edge_pct is None or "NO_HR_ODDS" in flag_set:
        return "PASS"
    if edge_pct < -0.01:
        return "PASS"
    if score >= 80.0 and edge_pct >= 0.15 and confirmed_lineup and confirmed_starter and not has_major:
        return "BET"
    if score >= 70.0 and edge_pct >= -0.01 and not has_major and "LINEUP_UNCONFIRMED" not in flag_set:
        return "LEAN"
    if score >= 60.0 and long_odds and not has_major:
        return "LOTTERY"
    if score >= 60.0:
        return "WATCHLIST"
    return "PASS"


def short_reason(score: float, edge_pct: float | None, flags: list[str], action: str) -> str:
    if action == "BET":
        return f"Strong HR score with confirmed lineup/starter and {edge_pct:.1%} model-vs-market edge."
    if action == "LEAN":
        return f"Viable HR profile with playable market edge ({edge_pct:.1%})."
    if action == "LOTTERY":
        return "Power/matchup profile fits long-odds variance, but risk keeps it below core card."
    if action == "WATCHLIST":
        visible_flags = ", ".join(flags[:3]) if flags else "thin edge"
        return f"Profile is interesting, but verification or price is fragile: {visible_flags}."
    if "NO_HR_ODDS" in flags:
        return "No verified HR price is available for this row."
    if "NEGATIVE_EDGE" in flags or "BAD_PRICE" in flags:
        return "Model fair probability is below the market implied probability."
    if "MISSING_CRITICAL_DATA" in flags:
        return "Critical scoring inputs are missing; row remains non-actionable."
    return "Verification or score gates did not clear."
