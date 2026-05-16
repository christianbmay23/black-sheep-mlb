"""Configuration and deterministic paths for EchoIQ Night Shift."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from .dates import DEFAULT_TIMEZONE


REPO_ROOT = Path(__file__).resolve().parents[2]

STATCAST_HARD_HIT_EV_MPH = 95.0
STATCAST_LOUD_CONTACT_EV_MPH = 100.0
STATCAST_WEAK_AVG_EV_MPH = 85.0
STATCAST_SWEET_SPOT_LA_MIN = 8.0
STATCAST_SWEET_SPOT_LA_MAX = 32.0
STATCAST_HR_QUALITY_LA_MIN = 18.0
STATCAST_HR_QUALITY_LA_MAX = 35.0
STATCAST_MIN_BBE_FOR_CONTACT_READ = 1


@dataclass(frozen=True)
class AgentPaths:
    slate_dir: Path
    input_dir: Path
    postgame_dir: Path
    preview_dir: Path
    watchlists_dir: Path
    pregame_refresh_dir: Path
    postgame_learning_dir: Path
    logs_dir: Path
    postgame_report: Path
    game_results_csv: Path
    player_performance_csv: Path
    pitcher_usage_csv: Path
    bullpen_fatigue_csv: Path
    model_grading_json: Path
    preview_report: Path
    verified_slate_csv: Path
    probable_pitchers_csv: Path
    weather_csv: Path
    lineup_status_csv: Path
    matchup_notes_json: Path
    market_snapshot_csv: Path
    injury_news_csv: Path
    hr_watchlist_csv: Path
    total_bases_watchlist_csv: Path
    hits_watchlist_csv: Path
    game_line_leans_csv: Path
    pregame_refresh_report: Path
    verification_matrix_csv: Path
    watchlist_survival_csv: Path
    lineup_verification_csv: Path
    starter_verification_csv: Path
    market_refresh_csv: Path
    player_prop_availability_csv: Path
    weather_refresh_csv: Path
    news_refresh_csv: Path
    manual_input_validation_csv: Path
    manual_input_preflight_csv: Path
    change_log_json: Path
    prediction_grades_csv: Path
    game_grades_csv: Path
    hidden_winners_csv: Path
    signal_performance_json: Path
    postgame_learning_report: Path
    next_slate_prompt_rules: Path
    run_log: Path
    source_log: Path
    unresolved_gaps: Path
    final_predictions_source_md: Path
    final_predictions_csv: Path
    final_prediction_parsing_gaps: Path

    def required_dirs(self) -> list[Path]:
        return [self.input_dir, self.postgame_dir, self.preview_dir, self.watchlists_dir, self.logs_dir]

    def all_artifact_paths(self) -> list[Path]:
        return [
            self.postgame_report,
            self.game_results_csv,
            self.player_performance_csv,
            self.pitcher_usage_csv,
            self.bullpen_fatigue_csv,
            self.model_grading_json,
            self.preview_report,
            self.verified_slate_csv,
            self.probable_pitchers_csv,
            self.weather_csv,
            self.lineup_status_csv,
            self.matchup_notes_json,
            self.market_snapshot_csv,
            self.injury_news_csv,
            self.hr_watchlist_csv,
            self.total_bases_watchlist_csv,
            self.hits_watchlist_csv,
            self.game_line_leans_csv,
            self.run_log,
            self.source_log,
            self.unresolved_gaps,
        ]


@dataclass(frozen=True)
class AgentConfig:
    repo_root: Path
    slates_dir: Path
    timezone: str
    mlb_stats_api_base: str
    sportsradar_api_key_present: bool
    sportsradar_enabled: bool = False
    sportsradar_access_level: str = "trial"
    sportsradar_mlb_api_base: str = "https://api.sportradar.com/mlb"
    weather_api_key_present: bool = False
    odds_api_key_present: bool = False

    @classmethod
    def from_env(cls, *, repo_root: Path = REPO_ROOT) -> "AgentConfig":
        repo_root = Path(repo_root)
        data_dir = Path(os.getenv("ECHOIQ_DATA_DIR", "slates"))
        if not data_dir.is_absolute():
            data_dir = repo_root / data_dir
        return cls(
            repo_root=repo_root,
            slates_dir=data_dir,
            timezone=os.getenv("ECHOIQ_TIMEZONE", DEFAULT_TIMEZONE),
            mlb_stats_api_base=os.getenv("MLB_STATS_API_BASE", "https://statsapi.mlb.com/api/v1"),
            sportsradar_api_key_present=bool(os.getenv("SPORTSRADAR_API_KEY") or os.getenv("SPORTSRADAR_MLB_API_KEY")),
            sportsradar_enabled=_env_flag("ECHOIQ_ENABLE_SPORTSRADAR"),
            sportsradar_access_level=os.getenv("SPORTSRADAR_ACCESS_LEVEL", "trial"),
            sportsradar_mlb_api_base=os.getenv("SPORTSRADAR_MLB_API_BASE", "https://api.sportradar.com/mlb"),
            weather_api_key_present=bool(os.getenv("WEATHER_API_KEY")),
            odds_api_key_present=bool(os.getenv("ODDS_API_KEY") or os.getenv("THE_ODDS_API_KEY")),
        )

    def paths_for(self, slate_date: str, postgame_date: str) -> AgentPaths:
        slate_dir = self.slates_dir / slate_date
        postgame_dir = slate_dir / "01_postgame_audit"
        input_dir = slate_dir / "00_inputs"
        preview_dir = slate_dir / "02_next_slate_research"
        watchlists_dir = slate_dir / "03_watchlists"
        pregame_refresh_dir = slate_dir / "04_pregame_refresh"
        postgame_learning_dir = slate_dir / "05_postgame_learning"
        logs_dir = slate_dir / "logs"
        return AgentPaths(
            slate_dir=slate_dir,
            input_dir=input_dir,
            postgame_dir=postgame_dir,
            preview_dir=preview_dir,
            watchlists_dir=watchlists_dir,
            pregame_refresh_dir=pregame_refresh_dir,
            postgame_learning_dir=postgame_learning_dir,
            logs_dir=logs_dir,
            postgame_report=postgame_dir / f"{postgame_date}_postgame_audit.md",
            game_results_csv=postgame_dir / "game_results.csv",
            player_performance_csv=postgame_dir / "player_performance.csv",
            pitcher_usage_csv=postgame_dir / "pitcher_usage.csv",
            bullpen_fatigue_csv=postgame_dir / "bullpen_fatigue.csv",
            model_grading_json=postgame_dir / "model_grading.json",
            preview_report=preview_dir / f"{slate_date}_slate_preview.md",
            verified_slate_csv=preview_dir / "verified_slate.csv",
            probable_pitchers_csv=preview_dir / "probable_pitchers.csv",
            weather_csv=preview_dir / "weather.csv",
            lineup_status_csv=preview_dir / "lineup_status.csv",
            matchup_notes_json=preview_dir / "matchup_notes.json",
            market_snapshot_csv=preview_dir / "market_snapshot.csv",
            injury_news_csv=preview_dir / "injury_news.csv",
            hr_watchlist_csv=watchlists_dir / "hr_watchlist.csv",
            total_bases_watchlist_csv=watchlists_dir / "total_bases_watchlist.csv",
            hits_watchlist_csv=watchlists_dir / "hits_watchlist.csv",
            game_line_leans_csv=watchlists_dir / "game_line_leans.csv",
            pregame_refresh_report=pregame_refresh_dir / f"{slate_date}_pregame_refresh.md",
            verification_matrix_csv=pregame_refresh_dir / "verification_matrix.csv",
            watchlist_survival_csv=pregame_refresh_dir / "watchlist_survival.csv",
            lineup_verification_csv=pregame_refresh_dir / "lineup_verification.csv",
            starter_verification_csv=pregame_refresh_dir / "starter_verification.csv",
            market_refresh_csv=pregame_refresh_dir / "market_refresh.csv",
            player_prop_availability_csv=pregame_refresh_dir / "player_prop_availability.csv",
            weather_refresh_csv=pregame_refresh_dir / "weather_refresh.csv",
            news_refresh_csv=pregame_refresh_dir / "news_refresh.csv",
            manual_input_validation_csv=pregame_refresh_dir / "manual_input_validation.csv",
            manual_input_preflight_csv=pregame_refresh_dir / "manual_input_preflight.csv",
            change_log_json=pregame_refresh_dir / "change_log.json",
            prediction_grades_csv=postgame_learning_dir / "prediction_grades.csv",
            game_grades_csv=postgame_learning_dir / "game_grades.csv",
            hidden_winners_csv=postgame_learning_dir / "hidden_winners.csv",
            signal_performance_json=postgame_learning_dir / "signal_performance.json",
            postgame_learning_report=postgame_learning_dir / "postgame_learning_report.md",
            next_slate_prompt_rules=postgame_learning_dir / "next_slate_prompt_rules.md",
            run_log=logs_dir / "daily_agent_run.log",
            source_log=logs_dir / "source_log.md",
            unresolved_gaps=logs_dir / "unresolved_gaps.md",
            final_predictions_source_md=input_dir / "echoiq_may15_final_predictions_for_codex.md",
            final_predictions_csv=input_dir / "final_echoiq_predictions.csv",
            final_prediction_parsing_gaps=input_dir / "final_echoiq_predictions_parsing_gaps.md",
        )


def _env_flag(name: str) -> bool:
    value = os.getenv(name, "")
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}
