"""Statcast contact-quality aggregation and signal tags for Night Shift v2."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .config import (
    STATCAST_HARD_HIT_EV_MPH,
    STATCAST_HR_QUALITY_LA_MAX,
    STATCAST_HR_QUALITY_LA_MIN,
    STATCAST_LOUD_CONTACT_EV_MPH,
    STATCAST_MIN_BBE_FOR_CONTACT_READ,
    STATCAST_SWEET_SPOT_LA_MAX,
    STATCAST_SWEET_SPOT_LA_MIN,
    STATCAST_WEAK_AVG_EV_MPH,
)
from .schemas import PitcherUsage, PlayerPerformance

WHIFF_DESCRIPTIONS = {"swinging_strike", "swinging_strike_blocked", "foul_tip"}
CALLED_STRIKE_DESCRIPTIONS = {"called_strike"}
BATTED_BALL_EVENTS = {
    "single",
    "double",
    "triple",
    "home_run",
    "field_out",
    "force_out",
    "grounded_into_double_play",
    "fielders_choice",
    "fielders_choice_out",
    "double_play",
    "sac_fly",
    "sac_bunt",
    "sac_fly_double_play",
    "field_error",
    "catcher_interf",
}


@dataclass
class HitterStatcastSummary:
    player_id: str
    batted_ball_events: int = 0
    exit_velocity_avg: float | None = None
    exit_velocity_max: float | None = None
    launch_angle_avg: float | None = None
    hard_hit_count: int | None = None
    hard_hit_rate: float | None = None
    barrel_count: int | None = None
    barrel_rate: float | None = None
    sweet_spot_count: int | None = None
    sweet_spot_rate: float | None = None
    xba: float | None = None
    xslg: float | None = None
    xwoba: float | None = None
    estimated_hr_distance_max: float | None = None
    pulled_air_contact_count: int | None = None
    opposite_field_contact_count: int | None = None
    loud_contact_count: int = 0
    hr_quality_contact_count: int = 0
    barrel_data_available: bool = False


@dataclass
class PitcherStatcastSummary:
    pitcher_id: str
    pitch_count: int = 0
    batted_ball_events: int = 0
    avg_exit_velocity_allowed: float | None = None
    max_exit_velocity_allowed: float | None = None
    hard_hit_allowed: int | None = None
    barrels_allowed: int | None = None
    xba_allowed: float | None = None
    xslg_allowed: float | None = None
    xwoba_allowed: float | None = None
    whiff_rate: float | None = None
    called_strike_whiff_rate: float | None = None
    pitch_mix_note: str = ""
    contact_quality_allowed_note: str = ""
    loud_contact_allowed: int = 0
    barrel_data_available: bool = False
    pitch_type_data_available: bool = False


@dataclass
class StatcastDailySummary:
    status: str
    row_count: int
    hitter_by_id: dict[str, HitterStatcastSummary] = field(default_factory=dict)
    pitcher_by_id: dict[str, PitcherStatcastSummary] = field(default_factory=dict)
    unavailable_fields: list[str] = field(default_factory=list)
    status_classification: str = ""


@dataclass
class StatcastMatchDiagnostics:
    player_performance_rows: int
    player_rows_with_id: int
    matched_batter_ids: int
    unmatched_batter_rows: int
    sample_unmatched_batters: list[str]
    pitcher_usage_rows: int
    pitcher_rows_with_id: int
    matched_pitcher_ids: int
    unmatched_pitcher_rows: int
    sample_unmatched_pitchers: list[str]
    status_classification: str


def build_daily_statcast_summary(rows: list[dict[str, Any]]) -> StatcastDailySummary:
    if not rows:
        return StatcastDailySummary(status="unavailable", row_count=0)

    hitter_events: dict[str, list[dict[str, Any]]] = {}
    pitcher_events: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        batter_id = _id(row.get("batter"))
        pitcher_id = _id(row.get("pitcher"))
        if batter_id:
            hitter_events.setdefault(batter_id, []).append(row)
        if pitcher_id:
            pitcher_events.setdefault(pitcher_id, []).append(row)

    available_columns = {key for row in rows for key in row.keys()}
    unavailable_fields = []
    for field in ("estimated_slg_using_speedangle", "hc_x", "hc_y", "launch_speed_angle"):
        if field not in available_columns:
            unavailable_fields.append(field)

    return StatcastDailySummary(
        status="available",
        row_count=len(rows),
        hitter_by_id={pid: _summarize_hitter(pid, events) for pid, events in hitter_events.items()},
        pitcher_by_id={pid: _summarize_pitcher(pid, events) for pid, events in pitcher_events.items()},
        unavailable_fields=unavailable_fields,
    )


def enrich_player_performance(players: list[PlayerPerformance], summary: StatcastDailySummary) -> None:
    for player in players:
        hitter = summary.hitter_by_id.get(player.player_id)
        if hitter is None:
            player.statcast_data_status = "missing_player_events" if summary.status == "available" else "unavailable"
            player.statcast_signal_tags = "INSUFFICIENT_STATCAST_DATA"
            player.statcast_signal_note = "No Statcast batted-ball rows matched this player."
            continue
        player.exit_velocity_avg = hitter.exit_velocity_avg
        player.exit_velocity_max = hitter.exit_velocity_max
        player.launch_angle_avg = hitter.launch_angle_avg
        player.hard_hit_count = hitter.hard_hit_count
        player.hard_hit_rate = hitter.hard_hit_rate
        player.barrel_count = hitter.barrel_count
        player.barrel_rate = hitter.barrel_rate
        player.sweet_spot_count = hitter.sweet_spot_count
        player.sweet_spot_rate = hitter.sweet_spot_rate
        player.xba = hitter.xba
        player.xslg = hitter.xslg
        player.xwoba = hitter.xwoba
        player.estimated_hr_distance_max = hitter.estimated_hr_distance_max
        player.batted_ball_events = hitter.batted_ball_events
        player.pulled_air_contact_count = hitter.pulled_air_contact_count
        player.opposite_field_contact_count = hitter.opposite_field_contact_count
        player.statcast_data_status = "enriched" if hitter.batted_ball_events else "no_batted_ball_events"
        tags = hitter_signal_tags(player, hitter)
        player.statcast_signal_tags = ";".join(tags)
        player.statcast_signal_note = hitter_signal_note(player, hitter, tags)
        if player.statcast_data_status == "enriched":
            player.notes = "Boxscore row enriched with Statcast contact quality."


def enrich_pitcher_usage(pitchers: list[PitcherUsage], summary: StatcastDailySummary) -> None:
    for pitcher in pitchers:
        statcast = summary.pitcher_by_id.get(pitcher.pitcher_id)
        if statcast is None:
            pitcher.statcast_data_status = "missing_pitcher_events" if summary.status == "available" else "unavailable"
            pitcher.statcast_signal_tags = "INSUFFICIENT_STATCAST_DATA"
            pitcher.contact_quality_allowed_note = "No Statcast rows matched this pitcher."
            continue
        pitcher.avg_exit_velocity_allowed = statcast.avg_exit_velocity_allowed
        pitcher.max_exit_velocity_allowed = statcast.max_exit_velocity_allowed
        pitcher.hard_hit_allowed = statcast.hard_hit_allowed
        pitcher.barrels_allowed = statcast.barrels_allowed
        pitcher.xba_allowed = statcast.xba_allowed
        pitcher.xslg_allowed = statcast.xslg_allowed
        pitcher.xwoba_allowed = statcast.xwoba_allowed
        pitcher.whiff_rate = statcast.whiff_rate
        pitcher.called_strike_whiff_rate = statcast.called_strike_whiff_rate
        pitcher.pitch_mix_note = statcast.pitch_mix_note
        pitcher.statcast_data_status = "enriched" if statcast.pitch_count else "no_pitch_events"
        tags = pitcher_signal_tags(pitcher, statcast)
        pitcher.statcast_signal_tags = ";".join(tags)
        pitcher.contact_quality_allowed_note = pitcher_signal_note(pitcher, statcast, tags)


def build_match_diagnostics(
    players: list[PlayerPerformance],
    pitchers: list[PitcherUsage],
    summary: StatcastDailySummary,
) -> StatcastMatchDiagnostics:
    player_ids = [player.player_id for player in players if player.player_id]
    pitcher_ids = [pitcher.pitcher_id for pitcher in pitchers if pitcher.pitcher_id]
    matched_batters = [player for player in players if player.player_id and player.player_id in summary.hitter_by_id]
    matched_pitchers = [pitcher for pitcher in pitchers if pitcher.pitcher_id and pitcher.pitcher_id in summary.pitcher_by_id]
    unmatched_batters = [player for player in players if player.player_id and player.player_id not in summary.hitter_by_id]
    unmatched_pitchers = [pitcher for pitcher in pitchers if pitcher.pitcher_id and pitcher.pitcher_id not in summary.pitcher_by_id]
    if summary.status != "available":
        classification = "STATCAST_UNAVAILABLE"
    elif player_ids and not matched_batters and pitcher_ids and not matched_pitchers:
        classification = "PLAYER_ID_MAPPING_MISS"
    elif unmatched_batters or unmatched_pitchers:
        classification = "PARTIAL_PLAYER_ID_MATCH"
    else:
        classification = "PLAYER_ID_MATCH_OK"
    return StatcastMatchDiagnostics(
        player_performance_rows=len(players),
        player_rows_with_id=len(player_ids),
        matched_batter_ids=len({player.player_id for player in matched_batters}),
        unmatched_batter_rows=len(unmatched_batters),
        sample_unmatched_batters=[f"{player.player_name} ({player.player_id})" for player in unmatched_batters[:5]],
        pitcher_usage_rows=len(pitchers),
        pitcher_rows_with_id=len(pitcher_ids),
        matched_pitcher_ids=len({pitcher.pitcher_id for pitcher in matched_pitchers}),
        unmatched_pitcher_rows=len(unmatched_pitchers),
        sample_unmatched_pitchers=[f"{pitcher.pitcher_name} ({pitcher.pitcher_id})" for pitcher in unmatched_pitchers[:5]],
        status_classification=classification,
    )


def hitter_signal_tags(player: PlayerPerformance, summary: HitterStatcastSummary) -> list[str]:
    if summary.batted_ball_events < STATCAST_MIN_BBE_FOR_CONTACT_READ:
        return ["INSUFFICIENT_STATCAST_DATA"]

    tags: list[str] = []
    hits = int(player.hits or 0)
    total_bases = int(player.total_bases or 0)
    home_runs = int(player.home_runs or 0)
    at_bats = int(player.at_bats or 0)
    strikeouts = int(player.strikeouts or 0)
    hard_hit_count = int(summary.hard_hit_count or 0)
    barrel_count = int(summary.barrel_count or 0)

    if hits == 0 and at_bats >= 3 and summary.loud_contact_count > 0:
        tags.append("LOUD_CONTACT_BAD_BOX")
    if (hits >= 2 or total_bases >= 2 or home_runs > 0) and (
        hard_hit_count >= 2 or barrel_count >= 1 or (summary.exit_velocity_max or 0) >= STATCAST_LOUD_CONTACT_EV_MPH
    ):
        tags.append("LOUD_CONTACT_CONFIRMED_RESULT")
    if (hits >= 2 or total_bases >= 2) and hard_hit_count == 0 and (summary.exit_velocity_avg or 999) <= STATCAST_WEAK_AVG_EV_MPH:
        tags.append("WEAK_CONTACT_GOOD_BOX")
    if barrel_count >= 1 or summary.hr_quality_contact_count >= 1:
        tags.append("HR_QUALITY_SIGNAL")
    if hard_hit_count >= 2 or (summary.xslg or 0) >= 0.500:
        tags.append("TB_QUALITY_SIGNAL")
    if hard_hit_count >= 1 or (summary.xba or 0) >= 0.300:
        tags.append("CONTACT_QUALITY_SIGNAL")
    if home_runs > 0 and hard_hit_count <= 1 and strikeouts >= 2:
        tags.append("VOLATILE_POWER_ONLY")
    if summary.batted_ball_events >= 2 and hard_hit_count == 0 and (summary.exit_velocity_avg or 999) <= STATCAST_WEAK_AVG_EV_MPH:
        tags.append("LOW_QUALITY_CONTACT")
    return tags or ["INSUFFICIENT_STATCAST_DATA"]


def pitcher_signal_tags(pitcher: PitcherUsage, summary: PitcherStatcastSummary) -> list[str]:
    if summary.batted_ball_events < STATCAST_MIN_BBE_FOR_CONTACT_READ:
        return ["INSUFFICIENT_STATCAST_DATA"]

    tags: list[str] = []
    hard_allowed = int(summary.hard_hit_allowed or 0)
    barrels_allowed = int(summary.barrels_allowed or 0)
    earned_runs = int(pitcher.earned_runs or 0)
    home_runs_allowed = int(pitcher.home_runs_allowed or 0)
    avg_ev = summary.avg_exit_velocity_allowed

    if avg_ev is not None and avg_ev <= 86.0 and hard_allowed == 0:
        tags.append("SUPPRESSED_CONTACT")
    if hard_allowed >= 3 or (summary.max_exit_velocity_allowed or 0) >= 105.0:
        tags.append("LOUD_CONTACT_ALLOWED")
    if barrels_allowed >= 1:
        tags.append("BARREL_RISK")
    if home_runs_allowed > 0 and (barrels_allowed >= 1 or hard_allowed >= 1):
        tags.append("HR_RISK_ALLOWED")
    if earned_runs >= 4 and avg_ev is not None and avg_ev <= 86.0:
        tags.append("BETTER_THAN_LINE")
    if earned_runs <= 2 and hard_allowed >= 4:
        tags.append("WORSE_THAN_LINE")
    return tags or ["INSUFFICIENT_STATCAST_DATA"]


def hitter_signal_note(player: PlayerPerformance, summary: HitterStatcastSummary, tags: list[str]) -> str:
    metrics = (
        f"{summary.batted_ball_events} BBE, avg EV {_fmt(summary.exit_velocity_avg)}, "
        f"max EV {_fmt(summary.exit_velocity_max)}, hard-hit {summary.hard_hit_count if summary.hard_hit_count is not None else 'NA'}"
    )
    if "LOUD_CONTACT_BAD_BOX" in tags:
        return f"{player.player_name} had a poor box score but contact quality was positive ({metrics})."
    if "WEAK_CONTACT_GOOD_BOX" in tags:
        return f"{player.player_name} produced in the box score, but Statcast support was weak ({metrics})."
    if "LOUD_CONTACT_CONFIRMED_RESULT" in tags:
        return f"{player.player_name}'s result was backed by loud contact ({metrics})."
    if tags == ["INSUFFICIENT_STATCAST_DATA"]:
        return f"Insufficient Statcast batted-ball sample for {player.player_name}."
    return f"Statcast tags {', '.join(tags)} ({metrics})."


def pitcher_signal_note(pitcher: PitcherUsage, summary: PitcherStatcastSummary, tags: list[str]) -> str:
    metrics = (
        f"{summary.batted_ball_events} BBE, avg EV allowed {_fmt(summary.avg_exit_velocity_allowed)}, "
        f"max EV allowed {_fmt(summary.max_exit_velocity_allowed)}, hard-hit allowed {summary.hard_hit_allowed if summary.hard_hit_allowed is not None else 'NA'}"
    )
    if "LOUD_CONTACT_ALLOWED" in tags or "BARREL_RISK" in tags:
        return f"{pitcher.pitcher_name} allowed dangerous contact ({metrics})."
    if "SUPPRESSED_CONTACT" in tags:
        return f"{pitcher.pitcher_name} suppressed contact ({metrics})."
    if tags == ["INSUFFICIENT_STATCAST_DATA"]:
        return f"Insufficient Statcast contact sample for {pitcher.pitcher_name}."
    return f"Statcast pitcher tags {', '.join(tags)} ({metrics})."


def _summarize_hitter(player_id: str, events: list[dict[str, Any]]) -> HitterStatcastSummary:
    bbe = [_row for _row in events if _is_batted_ball(_row)]
    evs = [_float(row.get("launch_speed")) for row in bbe]
    evs = [value for value in evs if value is not None]
    las = [_float(row.get("launch_angle")) for row in bbe]
    las = [value for value in las if value is not None]
    xbas = [_float(row.get("estimated_ba_using_speedangle")) for row in bbe]
    xwobas = [_float(row.get("estimated_woba_using_speedangle")) for row in bbe]
    xslgs = [_float(row.get("estimated_slg_using_speedangle")) for row in bbe]
    hr_distances = [
        _float(row.get("hit_distance_sc"))
        for row in bbe
        if str(row.get("events") or "").lower() == "home_run"
    ]
    barrel_values = [_is_barrel(row) for row in bbe]
    barrel_available = any(value is not None for value in barrel_values)
    barrel_count = sum(1 for value in barrel_values if value is True) if barrel_available else None
    hard_hit_count = sum(1 for value in evs if value >= STATCAST_HARD_HIT_EV_MPH)
    sweet_spot_count = sum(1 for value in las if STATCAST_SWEET_SPOT_LA_MIN <= value <= STATCAST_SWEET_SPOT_LA_MAX)
    hr_quality_count = 0
    for row in bbe:
        ev = _float(row.get("launch_speed"))
        la = _float(row.get("launch_angle"))
        if ev is not None and la is not None and ev >= STATCAST_LOUD_CONTACT_EV_MPH and STATCAST_HR_QUALITY_LA_MIN <= la <= STATCAST_HR_QUALITY_LA_MAX:
            hr_quality_count += 1
    count = len(bbe)
    return HitterStatcastSummary(
        player_id=player_id,
        batted_ball_events=count,
        exit_velocity_avg=_avg(evs),
        exit_velocity_max=max(evs) if evs else None,
        launch_angle_avg=_avg(las),
        hard_hit_count=hard_hit_count if count else None,
        hard_hit_rate=_rate(hard_hit_count, count),
        barrel_count=barrel_count,
        barrel_rate=_rate(barrel_count, count) if barrel_count is not None else None,
        sweet_spot_count=sweet_spot_count if count else None,
        sweet_spot_rate=_rate(sweet_spot_count, count),
        xba=_avg_present(xbas),
        xslg=_avg_present(xslgs),
        xwoba=_avg_present(xwobas),
        estimated_hr_distance_max=max([value for value in hr_distances if value is not None], default=None),
        pulled_air_contact_count=None,
        opposite_field_contact_count=None,
        loud_contact_count=sum(1 for value in evs if value >= STATCAST_LOUD_CONTACT_EV_MPH),
        hr_quality_contact_count=hr_quality_count,
        barrel_data_available=barrel_available,
    )


def _summarize_pitcher(pitcher_id: str, events: list[dict[str, Any]]) -> PitcherStatcastSummary:
    bbe = [_row for _row in events if _is_batted_ball(_row)]
    evs = [_float(row.get("launch_speed")) for row in bbe]
    evs = [value for value in evs if value is not None]
    xbas = [_float(row.get("estimated_ba_using_speedangle")) for row in bbe]
    xwobas = [_float(row.get("estimated_woba_using_speedangle")) for row in bbe]
    xslgs = [_float(row.get("estimated_slg_using_speedangle")) for row in bbe]
    barrel_values = [_is_barrel(row) for row in bbe]
    barrel_available = any(value is not None for value in barrel_values)
    barrel_count = sum(1 for value in barrel_values if value is True) if barrel_available else None
    hard_hit_count = sum(1 for value in evs if value >= STATCAST_HARD_HIT_EV_MPH)
    pitch_count = len(events)
    whiffs = sum(1 for row in events if str(row.get("description") or "").lower() in WHIFF_DESCRIPTIONS)
    called_strikes = sum(1 for row in events if str(row.get("description") or "").lower() in CALLED_STRIKE_DESCRIPTIONS)
    pitch_types: dict[str, int] = {}
    for row in events:
        pitch_type = str(row.get("pitch_type") or "").strip()
        if pitch_type:
            pitch_types[pitch_type] = pitch_types.get(pitch_type, 0) + 1
    return PitcherStatcastSummary(
        pitcher_id=pitcher_id,
        pitch_count=pitch_count,
        batted_ball_events=len(bbe),
        avg_exit_velocity_allowed=_avg(evs),
        max_exit_velocity_allowed=max(evs) if evs else None,
        hard_hit_allowed=hard_hit_count if bbe else None,
        barrels_allowed=barrel_count,
        xba_allowed=_avg_present(xbas),
        xslg_allowed=_avg_present(xslgs),
        xwoba_allowed=_avg_present(xwobas),
        whiff_rate=_rate(whiffs, pitch_count),
        called_strike_whiff_rate=_rate(whiffs + called_strikes, pitch_count),
        pitch_mix_note=_pitch_mix_note(pitch_types, pitch_count),
        contact_quality_allowed_note="",
        loud_contact_allowed=sum(1 for value in evs if value >= STATCAST_LOUD_CONTACT_EV_MPH),
        barrel_data_available=barrel_available,
        pitch_type_data_available=bool(pitch_types),
    )


def _is_batted_ball(row: dict[str, Any]) -> bool:
    if str(row.get("type") or "").upper() == "X":
        return True
    return str(row.get("events") or "").lower() in BATTED_BALL_EVENTS


def _is_barrel(row: dict[str, Any]) -> bool | None:
    for key in ("barrel", "is_barrel"):
        if key in row:
            value = row.get(key)
            if value in {True, 1, "1", "true", "True"}:
                return True
            if value in {False, 0, "0", "false", "False"}:
                return False
    value = _float(row.get("launch_speed_angle"))
    if value is None:
        return None
    return int(value) == 6


def _pitch_mix_note(pitch_types: dict[str, int], pitch_count: int) -> str:
    if not pitch_types or pitch_count <= 0:
        return "pitch_type_unavailable"
    leaders = sorted(pitch_types.items(), key=lambda item: item[1], reverse=True)[:3]
    return ", ".join(f"{pitch_type} {count / pitch_count:.0%}" for pitch_type, count in leaders)


def _id(value: object) -> str:
    if value is None or value == "":
        return ""
    try:
        return str(int(float(str(value))))
    except (TypeError, ValueError):
        return str(value).strip()


def _float(value: object) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _avg(values: list[float]) -> float | None:
    if not values:
        return None
    return round(sum(values) / len(values), 3)


def _avg_present(values: list[float | None]) -> float | None:
    present = [value for value in values if value is not None]
    return _avg(present)


def _rate(numerator: int | None, denominator: int) -> float | None:
    if numerator is None or denominator <= 0:
        return None
    return round(numerator / denominator, 4)


def _fmt(value: float | None) -> str:
    return "NA" if value is None else f"{value:.1f}"
