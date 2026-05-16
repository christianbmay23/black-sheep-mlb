"""Source orchestration and audit logging helpers for Night Shift."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from .mlb_stats_client import NightShiftMLBStatsClient, parse_schedule_games
from .schemas import SourceEvent, SourceResult, UnresolvedGap, iso_timestamp


@dataclass
class SourceTracker:
    timezone: str
    events: list[SourceEvent] = field(default_factory=list)
    gaps: list[UnresolvedGap] = field(default_factory=list)

    def now(self) -> str:
        return iso_timestamp(datetime.now(ZoneInfo(self.timezone)))

    def record_result(self, result: SourceResult) -> None:
        self.events.append(
            SourceEvent(
                source_name=result.source_name,
                endpoint=result.endpoint,
                retrieved_at=result.retrieved_at,
                success=result.success,
                record_count=result.record_count,
                notes=result.notes,
                error_summary=result.error_summary,
            )
        )

    def record_gap(
        self,
        *,
        missing_source: str,
        affected_artifact: str,
        affected_games_players: str = "all",
        severity: str,
        recommended_fix: str,
        output_degraded: bool,
    ) -> None:
        self.gaps.append(
            UnresolvedGap(
                missing_source=missing_source,
                affected_artifact=affected_artifact,
                affected_games_players=affected_games_players,
                severity=severity,
                recommended_fix=recommended_fix,
                output_degraded=output_degraded,
            )
        )


@dataclass
class ScheduleFetch:
    date: str
    games: list[dict[str, Any]]
    payload: dict[str, Any]
    retrieved_at: str
    endpoint: str


class NightShiftDataSources:
    def __init__(
        self,
        *,
        tracker: SourceTracker,
        mlb_client: NightShiftMLBStatsClient,
        offline: bool = False,
    ) -> None:
        self.tracker = tracker
        self.mlb_client = mlb_client
        self.offline = offline

    def fetch_schedule(self, date_str: str, *, affected_artifact: str) -> ScheduleFetch:
        retrieved_at = self.tracker.now()
        endpoint = self.mlb_client.schedule_endpoint(date_str)
        if self.offline:
            result = SourceResult(
                source_name="MLB Stats API",
                endpoint=endpoint,
                success=False,
                retrieved_at=retrieved_at,
                notes="Offline mode enabled; schedule fetch skipped.",
                error_summary="offline_mode",
            )
            self.tracker.record_result(result)
            self.tracker.record_gap(
                missing_source="MLB Stats API schedule",
                affected_artifact=affected_artifact,
                severity="HIGH",
                recommended_fix="Rerun without --offline or provide cached schedule support.",
                output_degraded=True,
            )
            return ScheduleFetch(date=date_str, games=[], payload={}, retrieved_at=retrieved_at, endpoint=endpoint)

        try:
            payload = self.mlb_client.fetch_schedule(date_str)
            games = parse_schedule_games(payload, fallback_date=date_str, retrieved_at=retrieved_at)
            self.tracker.record_result(
                SourceResult(
                    source_name="MLB Stats API",
                    endpoint=endpoint,
                    success=True,
                    retrieved_at=retrieved_at,
                    record_count=len(games),
                    notes=f"Fetched MLB schedule for {date_str}.",
                    payload=payload,
                )
            )
            if not games:
                self.tracker.record_gap(
                    missing_source="MLB Stats API schedule",
                    affected_artifact=affected_artifact,
                    severity="HIGH",
                    recommended_fix="Verify MLB schedule availability for the requested date.",
                    output_degraded=True,
                )
            return ScheduleFetch(date=date_str, games=games, payload=payload, retrieved_at=retrieved_at, endpoint=endpoint)
        except Exception as exc:  # noqa: BLE001 - source failures should degrade artifacts, not crash runs.
            self.tracker.record_result(
                SourceResult(
                    source_name="MLB Stats API",
                    endpoint=endpoint,
                    success=False,
                    retrieved_at=retrieved_at,
                    notes=f"Failed MLB schedule fetch for {date_str}.",
                    error_summary=str(exc),
                )
            )
            self.tracker.record_gap(
                missing_source="MLB Stats API schedule",
                affected_artifact=affected_artifact,
                severity="HIGH",
                recommended_fix="Check network/API availability and rerun Night Shift.",
                output_degraded=True,
            )
            return ScheduleFetch(date=date_str, games=[], payload={}, retrieved_at=retrieved_at, endpoint=endpoint)

    def fetch_boxscore(self, game_id: str, *, affected_artifact: str) -> dict[str, Any] | None:
        retrieved_at = self.tracker.now()
        endpoint = self.mlb_client.boxscore_endpoint(game_id)
        if self.offline:
            self.tracker.record_result(
                SourceResult(
                    source_name="MLB Stats API",
                    endpoint=endpoint,
                    success=False,
                    retrieved_at=retrieved_at,
                    notes="Offline mode enabled; boxscore fetch skipped.",
                    error_summary="offline_mode",
                )
            )
            return None
        try:
            payload = self.mlb_client.fetch_boxscore(game_id)
            players = 0
            for team in (payload.get("teams") or {}).values():
                players += len(team.get("players") or {})
            self.tracker.record_result(
                SourceResult(
                    source_name="MLB Stats API",
                    endpoint=endpoint,
                    success=True,
                    retrieved_at=retrieved_at,
                    record_count=players,
                    notes=f"Fetched boxscore for game {game_id}.",
                    payload=payload,
                )
            )
            return payload
        except Exception as exc:  # noqa: BLE001
            self.tracker.record_result(
                SourceResult(
                    source_name="MLB Stats API",
                    endpoint=endpoint,
                    success=False,
                    retrieved_at=retrieved_at,
                    notes=f"Failed boxscore fetch for game {game_id}.",
                    error_summary=str(exc),
                )
            )
            self.tracker.record_gap(
                missing_source="MLB Stats API boxscore",
                affected_artifact=affected_artifact,
                affected_games_players=game_id,
                severity="HIGH",
                recommended_fix="Retry once MLB boxscore endpoint is available.",
                output_degraded=True,
            )
            return None

    def fetch_game_feed(self, game_id: str, *, affected_artifact: str) -> dict[str, Any] | None:
        retrieved_at = self.tracker.now()
        endpoint = self.mlb_client.game_feed_endpoint(game_id)
        if self.offline:
            self.tracker.record_result(
                SourceResult(
                    source_name="MLB Stats API",
                    endpoint=endpoint,
                    success=False,
                    retrieved_at=retrieved_at,
                    notes="Offline mode enabled; live game feed skipped.",
                    error_summary="offline_mode",
                )
            )
            return None
        try:
            payload = self.mlb_client.fetch_game_feed(game_id)
            batting_orders = 0
            teams = ((payload.get("liveData") or {}).get("boxscore") or {}).get("teams") or {}
            for team in teams.values():
                batting_orders += len(team.get("battingOrder") or [])
            self.tracker.record_result(
                SourceResult(
                    source_name="MLB Stats API",
                    endpoint=endpoint,
                    success=True,
                    retrieved_at=retrieved_at,
                    record_count=batting_orders,
                    notes=f"Fetched live feed for game {game_id}.",
                    payload=payload,
                )
            )
            return payload
        except Exception as exc:  # noqa: BLE001
            self.tracker.record_result(
                SourceResult(
                    source_name="MLB Stats API",
                    endpoint=endpoint,
                    success=False,
                    retrieved_at=retrieved_at,
                    notes=f"Failed MLB live feed fetch for game {game_id}.",
                    error_summary=str(exc),
                )
            )
            self.tracker.record_gap(
                missing_source="MLB Stats API live feed",
                affected_artifact=affected_artifact,
                affected_games_players=game_id,
                severity="MEDIUM",
                recommended_fix="Retry closer to lock or fall back to official schedule/boxscore lineup data.",
                output_degraded=True,
            )
            return None

    def record_statcast_gap(self, *, affected_artifact: str, affected_games_players: str = "all player rows") -> None:
        self.tracker.record_gap(
            missing_source="Statcast/Baseball Savant quality-of-contact enrichment",
            affected_artifact=affected_artifact,
            affected_games_players=affected_games_players,
            severity="MEDIUM",
            recommended_fix="Add a Statcast enrichment adapter for exit velocity, barrels, hard-hit count, xBA, and xSLG.",
            output_degraded=True,
        )

    def record_optional_source_gap(
        self,
        *,
        source_name: str,
        affected_artifact: str,
        severity: str,
        recommended_fix: str,
        notes: str,
    ) -> None:
        self.tracker.record_result(
            SourceResult(
                source_name=source_name,
                endpoint="not_called",
                success=False,
                retrieved_at=self.tracker.now(),
                notes=notes,
                error_summary="not_implemented_or_not_authorized",
            )
        )
        self.tracker.record_gap(
            missing_source=source_name,
            affected_artifact=affected_artifact,
            severity=severity,
            recommended_fix=recommended_fix,
            output_degraded=True,
        )
