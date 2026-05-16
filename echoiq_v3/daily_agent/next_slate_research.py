"""Next-day slate preview generation for EchoIQ Night Shift."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .data_sources import NightShiftDataSources
from .market_context import apply_v3_market_context, update_slate_odds_status
from .matchup_engine import build_matchup_notes_and_watchlists
from .odds_client import fetch_odds_enrichment
from .postgame_audit import PostgameAuditResult
from .schemas import InjuryNewsRow, LineupStatus, MarketSnapshotRow, MatchupNote, ProbablePitcher, SlateGame, WatchlistEntry, WeatherContext
from .sportsradar_client import fetch_sportsradar_enrichment


@dataclass
class NextSlateResearchResult:
    slate_date: str
    generated_at: str
    slate_games: list[SlateGame]
    probable_pitchers: list[ProbablePitcher]
    weather: list[WeatherContext]
    lineup_status: list[LineupStatus]
    market_snapshot: list[MarketSnapshotRow]
    injury_news: list[InjuryNewsRow]
    matchup_notes: list[MatchupNote]
    watchlists: dict[str, list[WatchlistEntry]]
    data_completeness: str


def run_next_slate_research(
    *,
    slate_date: str,
    data_sources: NightShiftDataSources,
    postgame_result: PostgameAuditResult | None = None,
    repo_root: Path | None = None,
    force_refresh: bool = False,
    sportsradar_enabled: bool = False,
    sportsradar_api_key_present: bool = False,
    sportsradar_base_url: str = "https://api.sportradar.com/mlb",
    sportsradar_access_level: str = "trial",
    odds_api_key_present: bool = False,
) -> NextSlateResearchResult:
    schedule = data_sources.fetch_schedule(slate_date, affected_artifact="02_next_slate_research/verified_slate.csv")
    slate_games: list[SlateGame] = []
    probable_pitchers: list[ProbablePitcher] = []
    weather_rows: list[WeatherContext] = []
    lineup_rows: list[LineupStatus] = []

    for game in schedule.games:
        lineup_status = _lineup_status(game)
        sp_confidence = _probable_sp_confidence(game)
        data_completeness = _game_completeness(game, lineup_status)
        slate_game = SlateGame(
            slate_date=slate_date,
            game_id=game["game_id"],
            away_team=game["away_team"],
            home_team=game["home_team"],
            venue=game["venue"],
            game_time=game["game_time"],
            game_status=game["status"],
            away_probable_sp=game["away_probable_sp"],
            home_probable_sp=game["home_probable_sp"],
            away_probable_sp_id=game["away_probable_sp_id"],
            home_probable_sp_id=game["home_probable_sp_id"],
            probable_sp_confidence=sp_confidence,
            lineup_status=lineup_status,
            weather_status="UNVERIFIED",
            odds_status="UNVERIFIED",
            data_completeness=data_completeness,
            source="MLB Stats API schedule",
            retrieved_at=schedule.retrieved_at,
        )
        slate_games.append(slate_game)
        probable_pitchers.extend(_probable_pitcher_rows(slate_game))
        weather_rows.append(
            WeatherContext(
                slate_date=slate_date,
                game_id=game["game_id"],
                venue=game["venue"],
                roof_status="unverified",
                temperature="",
                wind_speed="",
                wind_direction="",
                humidity="",
                precipitation_risk="",
                run_environment_note="Weather adapter not active in v2.",
                hr_environment_note="Weather/park HR factor unavailable in v2.",
                confidence="LOW",
                source="not_available_v1",
                retrieved_at=schedule.retrieved_at,
            )
        )
        lineup_rows.extend(_lineup_rows(slate_game, game))

    previous_players = postgame_result.player_performance if postgame_result is not None else []
    bullpen_fatigue = postgame_result.bullpen_fatigue if postgame_result is not None else []
    matchup_notes, watchlists = build_matchup_notes_and_watchlists(
        slate_date=slate_date,
        slate_games=slate_games,
        previous_players=previous_players,
        bullpen_fatigue=bullpen_fatigue,
        retrieved_at=schedule.retrieved_at,
    )
    sportsradar = fetch_sportsradar_enrichment(
        slate_date=slate_date,
        slate_games=slate_games,
        data_sources=data_sources,
        enabled=sportsradar_enabled,
        api_key_present=sportsradar_api_key_present,
        base_url=sportsradar_base_url,
        access_level=sportsradar_access_level,
    )
    market_snapshot = fetch_odds_enrichment(
        slate_date=slate_date,
        slate_games=slate_games,
        data_sources=data_sources,
        api_key_present=odds_api_key_present,
        repo_root=repo_root or Path.cwd(),
        force_refresh=force_refresh,
    )
    update_slate_odds_status(slate_games, market_snapshot)
    apply_v3_market_context(
        slate_games=slate_games,
        matchup_notes=matchup_notes,
        watchlists=watchlists,
        market_rows=market_snapshot,
        injury_news=sportsradar.injury_news,
    )

    return NextSlateResearchResult(
        slate_date=slate_date,
        generated_at=data_sources.tracker.now(),
        slate_games=slate_games,
        probable_pitchers=probable_pitchers,
        weather=weather_rows,
        lineup_status=lineup_rows,
        market_snapshot=market_snapshot,
        injury_news=sportsradar.injury_news,
        matchup_notes=matchup_notes,
        watchlists=watchlists,
        data_completeness=_slate_completeness(slate_games),
    )


def _probable_pitcher_rows(game: SlateGame) -> list[ProbablePitcher]:
    rows: list[ProbablePitcher] = []
    for team, opponent, pitcher_id, pitcher_name in (
        (game.away_team, game.home_team, game.away_probable_sp_id, game.away_probable_sp),
        (game.home_team, game.away_team, game.home_probable_sp_id, game.home_probable_sp),
    ):
        rows.append(
            ProbablePitcher(
                slate_date=game.slate_date,
                game_id=game.game_id,
                team=team,
                opponent=opponent,
                pitcher_id=pitcher_id,
                pitcher_name=pitcher_name or "TBD",
                handedness="",
                probable_status="VERIFIED_BY_MLB_STATS" if pitcher_name else "TBD",
                season_era="",
                recent_form_note="Not loaded in v2; add people/gameLog enrichment.",
                pitch_count_note="Not loaded in v2; previous-start workload enrichment pending.",
                source="MLB Stats API schedule",
                retrieved_at=game.retrieved_at,
            )
        )
    return rows


def _lineup_rows(game: SlateGame, raw_game: dict[str, object]) -> list[LineupStatus]:
    away_count = int(raw_game.get("away_lineup_count") or 0)
    home_count = int(raw_game.get("home_lineup_count") or 0)
    return [
        _lineup_status_row(game, game.away_team, away_count),
        _lineup_status_row(game, game.home_team, home_count),
    ]


def _lineup_status_row(game: SlateGame, team: str, player_count: int) -> LineupStatus:
    confirmed = player_count >= 9
    return LineupStatus(
        slate_date=game.slate_date,
        game_id=game.game_id,
        team=team,
        lineup_status="CONFIRMED" if confirmed else "UNVERIFIED",
        confirmed_lineup_available=confirmed,
        projected_lineup_available=False,
        notable_absences="",
        source="MLB Stats API schedule hydrate=lineups" if confirmed else "not_available_v1",
        retrieved_at=game.retrieved_at,
    )


def _lineup_status(game: dict[str, object]) -> str:
    away = int(game.get("away_lineup_count") or 0)
    home = int(game.get("home_lineup_count") or 0)
    if away >= 9 and home >= 9:
        return "CONFIRMED"
    if away >= 9 or home >= 9:
        return "PARTIAL"
    return "UNVERIFIED"


def _probable_sp_confidence(game: dict[str, object]) -> str:
    if game.get("away_probable_sp") and game.get("home_probable_sp"):
        return "MEDIUM"
    if game.get("away_probable_sp") or game.get("home_probable_sp"):
        return "LOW_TO_MEDIUM"
    return "LOW"


def _game_completeness(game: dict[str, object], lineup_status: str) -> str:
    has_schedule = bool(game.get("game_id"))
    has_sp = bool(game.get("away_probable_sp") and game.get("home_probable_sp"))
    if not has_schedule:
        return "INCOMPLETE"
    if has_sp and lineup_status in {"CONFIRMED", "PARTIAL"}:
        return "MEDIUM"
    if has_sp:
        return "MEDIUM"
    return "LOW"


def _slate_completeness(games: list[SlateGame]) -> str:
    if not games:
        return "INCOMPLETE"
    if all(game.data_completeness == "MEDIUM" for game in games):
        return "MEDIUM"
    if any(game.data_completeness in {"LOW", "MEDIUM"} for game in games):
        return "LOW"
    return "INCOMPLETE"
