"""Centralized pregame verification gates for Night Shift v4."""

from __future__ import annotations

from dataclasses import dataclass, field


PREGAME_GATE_FIELDS = [
    "GAME_NOT_STARTED",
    "STARTERS_CONFIRMED",
    "LINEUPS_CONFIRMED",
    "WEATHER_VERIFIED",
    "ROOF_STATUS_VERIFIED",
    "ODDS_VERIFIED",
    "PLAYER_PROPS_VERIFIED",
    "NEWS_CHECKED",
    "NO_MAJOR_SCRATCH_RISK",
    "OFFICIAL_BET_ELIGIBLE",
]

ALLOWED_SURVIVAL_STATUSES = {"ALIVE", "CONDITIONAL", "KILLED", "PASS", "NEEDS_FINAL_CHECK"}


@dataclass(frozen=True)
class VerificationGateInput:
    game_status: str = ""
    starters_confirmed: bool = False
    lineups_confirmed: bool = False
    weather_verified: bool = False
    roof_status_verified: bool = False
    odds_verified: bool = False
    player_props_verified: bool = False
    news_checked: bool = False
    no_major_scratch_risk: bool = True
    statcast_context_available: bool = False


@dataclass(frozen=True)
class VerificationGateResult:
    gates: dict[str, bool]
    missing_gates: list[str] = field(default_factory=list)
    verification_completeness: str = "INCOMPLETE"


@dataclass(frozen=True)
class WatchlistGateInput:
    market: str
    prior_label: str
    game_not_started: bool
    starters_confirmed: bool
    lineups_confirmed: bool
    player_in_lineup: bool | None
    starter_changed: bool = False
    starter_thesis_dependent: bool = False
    weather_verified: bool = False
    odds_available: bool = False
    player_prop_available: bool = False
    news_checked: bool = False
    scratch_flag: bool = False
    major_news_risk: bool = False
    uncertain_news_risk: bool = False
    definite_market_unavailable: bool = False


@dataclass(frozen=True)
class WatchlistSurvivalResult:
    current_status: str
    survival_reason: str
    kill_reason: str = ""
    missing_gates: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.current_status not in ALLOWED_SURVIVAL_STATUSES:
            raise ValueError(f"Invalid v4 watchlist survival status: {self.current_status}")


def evaluate_game_gates(payload: VerificationGateInput) -> VerificationGateResult:
    gates = {
        "GAME_NOT_STARTED": _is_pregame_status(payload.game_status),
        "STARTERS_CONFIRMED": payload.starters_confirmed,
        "LINEUPS_CONFIRMED": payload.lineups_confirmed,
        "WEATHER_VERIFIED": payload.weather_verified,
        "ROOF_STATUS_VERIFIED": payload.roof_status_verified,
        "ODDS_VERIFIED": payload.odds_verified,
        "PLAYER_PROPS_VERIFIED": payload.player_props_verified,
        "NEWS_CHECKED": payload.news_checked,
        "NO_MAJOR_SCRATCH_RISK": payload.no_major_scratch_risk,
        "OFFICIAL_BET_ELIGIBLE": False,
    }
    missing = [gate for gate, passed in gates.items() if not passed and gate != "OFFICIAL_BET_ELIGIBLE"]
    passed_count = sum(1 for gate, passed in gates.items() if gate != "OFFICIAL_BET_ELIGIBLE" and passed)
    total = len(gates) - 1
    completeness = "HIGH" if passed_count >= total - 1 else "MEDIUM" if passed_count >= 5 else "LOW" if passed_count else "INCOMPLETE"
    return VerificationGateResult(gates=gates, missing_gates=missing, verification_completeness=completeness)


def classify_watchlist_survival(payload: WatchlistGateInput) -> WatchlistSurvivalResult:
    prior_label = str(payload.prior_label or "").upper()
    if prior_label in {"PASS", "AVOID"}:
        return WatchlistSurvivalResult(
            current_status="PASS",
            survival_reason=f"Prior row was already {prior_label}; v4 does not promote it.",
            missing_gates=_watchlist_missing_gates(payload),
        )
    if not payload.game_not_started:
        return WatchlistSurvivalResult(
            current_status="KILLED",
            survival_reason="Candidate is no longer pregame-reviewable.",
            kill_reason="GAME_NOT_STARTED failed: game is live, final, postponed, delayed, or otherwise not a clean pregame state.",
            missing_gates=_watchlist_missing_gates(payload),
        )
    if payload.scratch_flag or payload.major_news_risk:
        return WatchlistSurvivalResult(
            current_status="KILLED",
            survival_reason="Player availability risk invalidates this watchlist item.",
            kill_reason="Major scratch/injury/news flag found.",
            missing_gates=_watchlist_missing_gates(payload),
        )
    if payload.uncertain_news_risk:
        return WatchlistSurvivalResult(
            current_status="CONDITIONAL",
            survival_reason="Player news is unclear or downgrade-worthy; manual review is required before final-card consideration.",
            missing_gates=_watchlist_missing_gates(payload),
        )
    if payload.player_in_lineup is False:
        return WatchlistSurvivalResult(
            current_status="KILLED",
            survival_reason="Confirmed lineup does not include the player.",
            kill_reason="PLAYER_IN_LINEUP failed.",
            missing_gates=_watchlist_missing_gates(payload),
        )
    if payload.starter_changed and payload.starter_thesis_dependent:
        return WatchlistSurvivalResult(
            current_status="KILLED",
            survival_reason="The original matchup thesis depended on the prior starter.",
            kill_reason="STARTER_CHANGE_DETECTED.",
            missing_gates=_watchlist_missing_gates(payload),
        )
    if payload.definite_market_unavailable and _market_dependent(payload.market):
        return WatchlistSurvivalResult(
            current_status="KILLED",
            survival_reason="The exact market appears unavailable, so this cannot survive as a final-card candidate.",
            kill_reason="MARKET_UNAVAILABLE.",
            missing_gates=_watchlist_missing_gates(payload),
        )

    missing = _watchlist_missing_gates(payload)
    core_missing = [gate for gate in missing if gate in {"STARTERS_CONFIRMED", "LINEUPS_CONFIRMED", "PLAYER_IN_LINEUP", "NEWS_CHECKED"}]
    market_missing = [gate for gate in missing if gate in {"ODDS_AVAILABLE", "PLAYER_PROP_AVAILABLE"}]
    weather_missing = [gate for gate in missing if gate == "WEATHER_VERIFIED"]

    if payload.starter_changed:
        return WatchlistSurvivalResult(
            current_status="CONDITIONAL",
            survival_reason="Starter changed; baseball thesis needs manual matchup review before final-card consideration.",
            missing_gates=missing,
        )
    if core_missing:
        return WatchlistSurvivalResult(
            current_status="CONDITIONAL",
            survival_reason="Candidate remains research-live but core pregame verification gates are open.",
            missing_gates=missing,
        )
    if market_missing or weather_missing:
        return WatchlistSurvivalResult(
            current_status="NEEDS_FINAL_CHECK",
            survival_reason="Baseball thesis has not been killed, but final odds/prop/weather verification is still needed.",
            missing_gates=missing,
        )
    return WatchlistSurvivalResult(
        current_status="ALIVE",
        survival_reason="No v4 kill flags found and core verification gates are clear; still not an official bet.",
        missing_gates=missing,
    )


def _watchlist_missing_gates(payload: WatchlistGateInput) -> list[str]:
    missing: list[str] = []
    if not payload.game_not_started:
        missing.append("GAME_NOT_STARTED")
    if not payload.starters_confirmed:
        missing.append("STARTERS_CONFIRMED")
    if not payload.lineups_confirmed:
        missing.append("LINEUPS_CONFIRMED")
    if payload.player_in_lineup is not True and payload.market != "Game line":
        missing.append("PLAYER_IN_LINEUP")
    if not payload.weather_verified:
        missing.append("WEATHER_VERIFIED")
    if not payload.odds_available:
        missing.append("ODDS_AVAILABLE")
    if _market_dependent(payload.market) and not payload.player_prop_available:
        missing.append("PLAYER_PROP_AVAILABLE")
    if not payload.news_checked:
        missing.append("NEWS_CHECKED")
    if payload.scratch_flag or payload.major_news_risk:
        missing.append("NO_SCRATCH_FLAG")
    if payload.uncertain_news_risk:
        missing.append("NEWS_RISK_REVIEW")
    if payload.starter_changed:
        missing.append("STARTER_CHANGE_REVIEW")
    return missing


def _market_dependent(market: str) -> bool:
    return str(market or "") != "Game line"


def _is_pregame_status(status: str) -> bool:
    value = " ".join(str(status or "").strip().lower().split())
    if not value:
        return True
    blocked = {
        "final",
        "game over",
        "completed early",
        "in progress",
        "live",
        "postponed",
        "delayed",
        "suspended",
        "cancelled",
        "canceled",
    }
    return value not in blocked and not value.startswith("final")
