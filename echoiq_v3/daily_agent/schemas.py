"""Stable dataclasses and artifact schemas for EchoIQ Night Shift."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any


ALLOWED_WATCHLIST_LABELS = {"WATCHLIST", "LEAN", "CONDITIONAL", "PASS", "AVOID", "LOTTERY"}
DISALLOWED_MVP_LABELS = {"BET", "LOCK", "GUARANTEED", "MAX", "FREE MONEY"}
GRADES = {"WIN", "LOSS", "PUSH", "VOID", "NOT_GRADED", "UNKNOWN"}
QUALITATIVE_GRADES = {
    "GOOD_PROCESS_GOOD_RESULT",
    "GOOD_PROCESS_BAD_RESULT",
    "BAD_PROCESS_GOOD_RESULT",
    "BAD_PROCESS_BAD_RESULT",
    "DATA_GAP",
    "NOT_APPLICABLE",
}
MISS_REASON_TAGS = {
    "BAD_READ",
    "GOOD_READ_BAD_RESULT",
    "LINEUP_CHANGE",
    "STARTER_CHANGE",
    "WEATHER_SHIFT",
    "BULLPEN_FAILURE",
    "MARKET_MISPRICE",
    "INJURY_OR_SCRATCH",
    "DATA_GAP",
    "UNKNOWN",
}


GAME_RESULTS_FIELDS = [
    "game_id",
    "date",
    "away_team",
    "home_team",
    "away_score",
    "home_score",
    "winner",
    "status",
    "venue",
    "game_start_time",
    "source",
    "retrieved_at",
]

PLAYER_PERFORMANCE_FIELDS = [
    "game_id",
    "date",
    "player_id",
    "player_name",
    "team",
    "opponent",
    "batting_order",
    "position",
    "at_bats",
    "hits",
    "total_bases",
    "home_runs",
    "runs",
    "rbi",
    "walks",
    "strikeouts",
    "doubles",
    "triples",
    "stolen_bases",
    "exit_velocity_avg",
    "exit_velocity_max",
    "launch_angle_avg",
    "hard_hit_count",
    "hard_hit_rate",
    "barrel_count",
    "barrel_rate",
    "sweet_spot_count",
    "sweet_spot_rate",
    "xba",
    "xslg",
    "xwoba",
    "estimated_hr_distance_max",
    "batted_ball_events",
    "pulled_air_contact_count",
    "opposite_field_contact_count",
    "statcast_signal_tags",
    "statcast_signal_note",
    "statcast_data_status",
    "notes",
    "source",
    "retrieved_at",
]

PITCHER_USAGE_FIELDS = [
    "game_id",
    "date",
    "pitcher_id",
    "pitcher_name",
    "team",
    "opponent",
    "starter_or_reliever",
    "innings_pitched",
    "pitches",
    "batters_faced",
    "hits_allowed",
    "earned_runs",
    "walks",
    "strikeouts",
    "home_runs_allowed",
    "velocity_note",
    "workload_note",
    "avg_exit_velocity_allowed",
    "max_exit_velocity_allowed",
    "hard_hit_allowed",
    "barrels_allowed",
    "xba_allowed",
    "xslg_allowed",
    "xwoba_allowed",
    "whiff_rate",
    "called_strike_whiff_rate",
    "pitch_mix_note",
    "contact_quality_allowed_note",
    "statcast_signal_tags",
    "statcast_data_status",
    "source",
    "retrieved_at",
]

BULLPEN_FATIGUE_FIELDS = [
    "date",
    "team",
    "bullpen_innings",
    "reliever_count",
    "high_leverage_used",
    "back_to_back_risk",
    "fatigue_level",
    "notes",
    "confidence",
    "source",
    "retrieved_at",
]

VERIFIED_SLATE_FIELDS = [
    "slate_date",
    "game_id",
    "away_team",
    "home_team",
    "venue",
    "game_time",
    "game_status",
    "away_probable_sp",
    "home_probable_sp",
    "probable_sp_confidence",
    "lineup_status",
    "weather_status",
    "odds_status",
    "data_completeness",
    "source",
    "retrieved_at",
]

PROBABLE_PITCHERS_FIELDS = [
    "slate_date",
    "game_id",
    "team",
    "opponent",
    "pitcher_id",
    "pitcher_name",
    "handedness",
    "probable_status",
    "season_era",
    "recent_form_note",
    "pitch_count_note",
    "source",
    "retrieved_at",
]

WEATHER_FIELDS = [
    "slate_date",
    "game_id",
    "venue",
    "roof_status",
    "temperature",
    "wind_speed",
    "wind_direction",
    "humidity",
    "precipitation_risk",
    "run_environment_note",
    "hr_environment_note",
    "confidence",
    "source",
    "retrieved_at",
]

LINEUP_STATUS_FIELDS = [
    "slate_date",
    "game_id",
    "team",
    "lineup_status",
    "confirmed_lineup_available",
    "projected_lineup_available",
    "notable_absences",
    "source",
    "retrieved_at",
]

MARKET_SNAPSHOT_FIELDS = [
    "slate_date",
    "game_id",
    "away_team",
    "home_team",
    "market_type",
    "market",
    "player_name",
    "team",
    "line",
    "price",
    "implied_probability",
    "sportsbook",
    "status",
    "source",
    "last_updated",
    "retrieved_at",
]

INJURY_NEWS_FIELDS = [
    "slate_date",
    "player_name",
    "player_id",
    "team",
    "status",
    "injury_or_news_type",
    "headline",
    "summary",
    "source",
    "published_at",
    "retrieved_at",
    "confidence",
]

WATCHLIST_FIELDS = [
    "slate_date",
    "game_id",
    "player_name",
    "team",
    "opponent",
    "market",
    "signal_type",
    "confidence",
    "label",
    "reason",
    "supporting_factors",
    "risk_flags",
    "data_gaps",
    "source_summary",
    "retrieved_at",
    "odds_available",
    "best_price",
    "best_price_source",
    "implied_probability",
    "market_last_updated",
    "fair_probability",
    "edge",
    "playable_price_note",
    "market_status",
    "injury_news_status",
    "lineup_verification_status",
    "official_bet_eligible",
    "verification_gates_missing",
]

FINAL_ECHOIQ_PREDICTIONS_FIELDS = [
    "slate_date",
    "prediction_id",
    "prediction_source",
    "prediction_phase",
    "game",
    "prediction_type",
    "player_name",
    "team",
    "opponent",
    "lineup_slot",
    "opposing_pitcher",
    "pick",
    "confidence_tier",
    "primary_reason",
    "secondary_reason",
    "risk_flag",
    "signal_tags",
    "notes",
]


@dataclass(frozen=True)
class SourceResult:
    source_name: str
    endpoint: str
    success: bool
    retrieved_at: str
    record_count: int = 0
    notes: str = ""
    error_summary: str = ""
    payload: dict[str, Any] | None = None


@dataclass(frozen=True)
class SourceEvent:
    source_name: str
    endpoint: str
    retrieved_at: str
    success: bool
    record_count: int = 0
    notes: str = ""
    error_summary: str = ""


@dataclass(frozen=True)
class UnresolvedGap:
    missing_source: str
    affected_artifact: str
    affected_games_players: str
    severity: str
    recommended_fix: str
    output_degraded: bool


@dataclass
class GameResult:
    game_id: str
    date: str
    away_team: str
    home_team: str
    away_score: int | None
    home_score: int | None
    winner: str
    status: str
    venue: str
    game_start_time: str
    source: str
    retrieved_at: str


@dataclass
class PlayerPerformance:
    game_id: str
    date: str
    player_id: str
    player_name: str
    team: str
    opponent: str
    batting_order: str
    position: str
    at_bats: int | None
    hits: int | None
    total_bases: int | None
    home_runs: int | None
    runs: int | None
    rbi: int | None
    walks: int | None
    strikeouts: int | None
    doubles: int | None
    triples: int | None
    stolen_bases: int | None
    exit_velocity_avg: float | None
    exit_velocity_max: float | None
    launch_angle_avg: float | None
    hard_hit_count: int | None
    hard_hit_rate: float | None
    barrel_count: int | None
    barrel_rate: float | None
    sweet_spot_count: int | None
    sweet_spot_rate: float | None
    xba: float | None
    xslg: float | None
    xwoba: float | None
    estimated_hr_distance_max: float | None
    batted_ball_events: int | None
    pulled_air_contact_count: int | None
    opposite_field_contact_count: int | None
    statcast_signal_tags: str
    statcast_signal_note: str
    statcast_data_status: str
    notes: str
    source: str
    retrieved_at: str


@dataclass
class PitcherUsage:
    game_id: str
    date: str
    pitcher_id: str
    pitcher_name: str
    team: str
    opponent: str
    starter_or_reliever: str
    innings_pitched: str
    pitches: int | None
    batters_faced: int | None
    hits_allowed: int | None
    earned_runs: int | None
    walks: int | None
    strikeouts: int | None
    home_runs_allowed: int | None
    velocity_note: str
    workload_note: str
    avg_exit_velocity_allowed: float | None
    max_exit_velocity_allowed: float | None
    hard_hit_allowed: int | None
    barrels_allowed: int | None
    xba_allowed: float | None
    xslg_allowed: float | None
    xwoba_allowed: float | None
    whiff_rate: float | None
    called_strike_whiff_rate: float | None
    pitch_mix_note: str
    contact_quality_allowed_note: str
    statcast_signal_tags: str
    statcast_data_status: str
    source: str
    retrieved_at: str


@dataclass
class BullpenFatigue:
    date: str
    team: str
    bullpen_innings: float | None
    reliever_count: int
    high_leverage_used: str
    back_to_back_risk: str
    fatigue_level: str
    notes: str
    confidence: str
    source: str
    retrieved_at: str


@dataclass
class SlateGame:
    slate_date: str
    game_id: str
    away_team: str
    home_team: str
    venue: str
    game_time: str
    game_status: str
    away_probable_sp: str
    home_probable_sp: str
    away_probable_sp_id: str
    home_probable_sp_id: str
    probable_sp_confidence: str
    lineup_status: str
    weather_status: str
    odds_status: str
    data_completeness: str
    source: str
    retrieved_at: str


@dataclass
class ProbablePitcher:
    slate_date: str
    game_id: str
    team: str
    opponent: str
    pitcher_id: str
    pitcher_name: str
    handedness: str
    probable_status: str
    season_era: str
    recent_form_note: str
    pitch_count_note: str
    source: str
    retrieved_at: str


@dataclass
class WeatherContext:
    slate_date: str
    game_id: str
    venue: str
    roof_status: str
    temperature: str
    wind_speed: str
    wind_direction: str
    humidity: str
    precipitation_risk: str
    run_environment_note: str
    hr_environment_note: str
    confidence: str
    source: str
    retrieved_at: str


@dataclass
class LineupStatus:
    slate_date: str
    game_id: str
    team: str
    lineup_status: str
    confirmed_lineup_available: bool
    projected_lineup_available: bool
    notable_absences: str
    source: str
    retrieved_at: str


@dataclass
class MarketSnapshotRow:
    slate_date: str
    game_id: str
    away_team: str
    home_team: str
    market_type: str
    market: str
    player_name: str
    team: str
    line: float | str | None
    price: int | float | str | None
    implied_probability: float | None
    sportsbook: str
    status: str
    source: str
    last_updated: str
    retrieved_at: str


@dataclass
class InjuryNewsRow:
    slate_date: str
    player_name: str
    player_id: str
    team: str
    status: str
    injury_or_news_type: str
    headline: str
    summary: str
    source: str
    published_at: str
    retrieved_at: str
    confidence: str


@dataclass
class MatchupNote:
    game_id: str
    game: str
    team_context: list[str] = field(default_factory=list)
    sp_context: list[str] = field(default_factory=list)
    hitter_matchup_context: list[str] = field(default_factory=list)
    pitch_type_context: list[str] = field(default_factory=list)
    bullpen_context: list[str] = field(default_factory=list)
    weather_park_context: list[str] = field(default_factory=list)
    historical_matchup_context: list[str] = field(default_factory=list)
    statcast_context: list[str] = field(default_factory=list)
    market_context: dict[str, object] = field(default_factory=dict)
    news_context: dict[str, object] = field(default_factory=dict)
    watchlist_rationale: list[str] = field(default_factory=list)
    unresolved_gaps: list[str] = field(default_factory=list)


@dataclass
class WatchlistEntry:
    slate_date: str
    game_id: str
    player_name: str
    team: str
    opponent: str
    market: str
    signal_type: str
    confidence: str
    label: str
    reason: str
    supporting_factors: str
    risk_flags: str
    data_gaps: str
    source_summary: str
    retrieved_at: str
    odds_available: bool = False
    best_price: int | float | str | None = None
    best_price_source: str = ""
    implied_probability: float | None = None
    market_last_updated: str = ""
    fair_probability: float | None = None
    edge: float | None = None
    playable_price_note: str = "Market context not verified in v3."
    market_status: str = "UNVERIFIED"
    injury_news_status: str = "NEWS_NOT_VERIFIED"
    lineup_verification_status: str = "UNVERIFIED"
    official_bet_eligible: bool = False
    verification_gates_missing: str = (
        "LINEUP_NOT_CONFIRMED; STARTER_NOT_CONFIRMED; WEATHER_NOT_VERIFIED; "
        "ODDS_NOT_VERIFIED; NEWS_NOT_VERIFIED"
    )

    def __post_init__(self) -> None:
        label_upper = self.label.upper()
        if label_upper in DISALLOWED_MVP_LABELS:
            raise ValueError(f"Night Shift MVP cannot emit label: {self.label}")
        if label_upper not in ALLOWED_WATCHLIST_LABELS:
            raise ValueError(f"Invalid Night Shift watchlist label: {self.label}")
        self.label = label_upper
        self.official_bet_eligible = False


@dataclass
class DailyAgentRunResult:
    slate_date: str
    postgame_date: str
    output_dir: str
    dry_run: bool
    only: str
    files_written: list[str] = field(default_factory=list)
    source_events: list[SourceEvent] = field(default_factory=list)
    unresolved_gaps: list[UnresolvedGap] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    summary: dict[str, Any] = field(default_factory=dict)


def dataclass_row(instance: object, fieldnames: list[str]) -> dict[str, object]:
    raw = asdict(instance)
    return {field: raw.get(field, "") for field in fieldnames}


def clean_csv_value(value: object) -> object:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    return value


def iso_timestamp(dt: datetime) -> str:
    return dt.isoformat(timespec="seconds")
