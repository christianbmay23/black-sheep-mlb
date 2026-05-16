"""Guarded SportsRadar enrichment for EchoIQ Night Shift v3."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from typing import Any

from .data_sources import NightShiftDataSources
from .id_mapping import normalize_team_code
from .schemas import InjuryNewsRow, SlateGame, SourceResult


SPORTSRADAR_SOURCE = "SportsRadar MLB API"


@dataclass
class SportsRadarEnrichment:
    metadata_games: list[dict[str, Any]] = field(default_factory=list)
    injury_news: list[InjuryNewsRow] = field(default_factory=list)
    metadata_status: str = "SPORTSRADAR_DISABLED"
    news_status: str = "NEWS_EMPTY"


class NightShiftSportsRadarClient:
    """Small JSON client for optional SportsRadar MLB API calls.

    The client never owns secrets in files. It reads the key from the process
    environment and redacts the key from logged endpoints.
    """

    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str = "https://api.sportradar.com/mlb",
        access_level: str = "trial",
        language: str = "en",
        timeout: int = 10,
    ) -> None:
        self.api_key = api_key if api_key is not None else (
            os.getenv("SPORTSRADAR_API_KEY") or os.getenv("SPORTSRADAR_MLB_API_KEY")
        )
        self.base_url = base_url.rstrip("/")
        self.access_level = access_level.strip() or "trial"
        self.language = language
        self.timeout = timeout

    def daily_schedule_endpoint(self, slate_date: str) -> str:
        year, month, day = slate_date.split("-")
        return f"{self.base_url}/{self.access_level}/v8/{self.language}/games/{year}/{month}/{day}/schedule.json"

    def injuries_endpoint(self) -> str:
        return f"{self.base_url}/{self.access_level}/v8/{self.language}/league/injuries.json"

    def fetch_daily_schedule(self, slate_date: str) -> dict[str, Any]:
        return self._fetch_json(self.daily_schedule_endpoint(slate_date))

    def fetch_injuries(self) -> dict[str, Any]:
        return self._fetch_json(self.injuries_endpoint())

    def _fetch_json(self, endpoint: str) -> dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("SPORTSRADAR_KEY_MISSING")
        url = f"{endpoint}?{urllib.parse.urlencode({'api_key': self.api_key})}"
        request = urllib.request.Request(url, headers={"User-Agent": "black-sheep-mlb/echoiq-night-shift"})
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            return json.loads(response.read().decode("utf-8"))

    def redacted_daily_schedule_endpoint(self, slate_date: str) -> str:
        return self.daily_schedule_endpoint(slate_date)

    def redacted_injuries_endpoint(self) -> str:
        return self.injuries_endpoint()


def fetch_sportsradar_enrichment(
    *,
    slate_date: str,
    slate_games: list[SlateGame],
    data_sources: NightShiftDataSources,
    enabled: bool,
    api_key_present: bool,
    base_url: str,
    access_level: str,
) -> SportsRadarEnrichment:
    retrieved_at = data_sources.tracker.now()
    client = NightShiftSportsRadarClient(base_url=base_url, access_level=access_level)
    if data_sources.offline:
        _record_skipped(
            data_sources,
            classification="SPORTSRADAR_DISABLED",
            notes="SPORTSRADAR_DISABLED: offline mode enabled; SportsRadar calls skipped.",
            recommended_fix="Rerun without --offline and with SPORTSRADAR_API_KEY plus ECHOIQ_ENABLE_SPORTSRADAR=1 if live enrichment is intended.",
        )
        return SportsRadarEnrichment(metadata_status="SPORTSRADAR_DISABLED", news_status="SPORTSRADAR_DISABLED")
    if not api_key_present:
        _record_skipped(
            data_sources,
            classification="SPORTSRADAR_KEY_MISSING",
            notes="SPORTSRADAR_KEY_MISSING: no SPORTSRADAR_API_KEY or SPORTSRADAR_MLB_API_KEY in this process.",
            recommended_fix="Set SPORTSRADAR_API_KEY or SPORTSRADAR_MLB_API_KEY in the environment before running a live v3 enrichment.",
        )
        return SportsRadarEnrichment(metadata_status="SPORTSRADAR_KEY_MISSING", news_status="SPORTSRADAR_KEY_MISSING")
    if not enabled:
        _record_skipped(
            data_sources,
            classification="SPORTSRADAR_DISABLED",
            notes="SPORTSRADAR_DISABLED: key is present but ECHOIQ_ENABLE_SPORTSRADAR is not enabled.",
            recommended_fix="Set ECHOIQ_ENABLE_SPORTSRADAR=1 to opt in to paid SportsRadar API calls.",
        )
        return SportsRadarEnrichment(metadata_status="SPORTSRADAR_DISABLED", news_status="SPORTSRADAR_DISABLED")

    metadata_status = _fetch_metadata_status(
        slate_date=slate_date,
        client=client,
        data_sources=data_sources,
        retrieved_at=retrieved_at,
    )
    injury_news, news_status = _fetch_injury_news(
        slate_date=slate_date,
        slate_games=slate_games,
        client=client,
        data_sources=data_sources,
        retrieved_at=data_sources.tracker.now(),
    )
    return SportsRadarEnrichment(
        metadata_games=[],
        injury_news=injury_news,
        metadata_status=metadata_status,
        news_status=news_status,
    )


def diagnose_sportsradar(
    *,
    slate_date: str,
    enabled: bool,
    api_key_present: bool,
    base_url: str,
    access_level: str,
) -> dict[str, object]:
    client = NightShiftSportsRadarClient(base_url=base_url, access_level=access_level)
    return {
        "slate_date": slate_date,
        "enabled": enabled,
        "api_key_present": api_key_present,
        "metadata_endpoint": client.redacted_daily_schedule_endpoint(slate_date),
        "injuries_endpoint": client.redacted_injuries_endpoint(),
        "status_classification": (
            "SPORTSRADAR_AVAILABLE"
            if enabled and api_key_present
            else "SPORTSRADAR_KEY_MISSING"
            if not api_key_present
            else "SPORTSRADAR_DISABLED"
        ),
        "would_call_live": bool(enabled and api_key_present),
    }


def _fetch_metadata_status(
    *,
    slate_date: str,
    client: NightShiftSportsRadarClient,
    data_sources: NightShiftDataSources,
    retrieved_at: str,
) -> str:
    endpoint = client.redacted_daily_schedule_endpoint(slate_date)
    try:
        payload = client.fetch_daily_schedule(slate_date)
    except urllib.error.HTTPError as exc:
        classification = "SPORTSRADAR_RATE_LIMITED" if exc.code == 429 else "SPORTSRADAR_QUERY_EXCEPTION"
        data_sources.tracker.record_result(
            SourceResult(
                source_name=SPORTSRADAR_SOURCE,
                endpoint=endpoint,
                success=False,
                retrieved_at=retrieved_at,
                notes=f"{classification}: daily schedule metadata request failed.",
                error_summary=f"http_{exc.code}",
            )
        )
        _gap(data_sources, classification, "02_next_slate_research/matchup_notes.json")
        return classification
    except Exception as exc:  # noqa: BLE001
        data_sources.tracker.record_result(
            SourceResult(
                source_name=SPORTSRADAR_SOURCE,
                endpoint=endpoint,
                success=False,
                retrieved_at=retrieved_at,
                notes="SPORTSRADAR_QUERY_EXCEPTION: daily schedule metadata request failed.",
                error_summary=str(exc),
            )
        )
        _gap(data_sources, "SPORTSRADAR_QUERY_EXCEPTION", "02_next_slate_research/matchup_notes.json")
        return "SPORTSRADAR_QUERY_EXCEPTION"

    games = _extract_games(payload)
    classification = "SPORTSRADAR_AVAILABLE" if games else "SPORTSRADAR_EMPTY_RESPONSE"
    data_sources.tracker.record_result(
        SourceResult(
            source_name=SPORTSRADAR_SOURCE,
            endpoint=endpoint,
            success=bool(games),
            retrieved_at=retrieved_at,
            record_count=len(games),
            notes=f"{classification}: daily SportsRadar game metadata checked.",
            payload={"game_count": len(games)},
        )
    )
    if not games:
        _gap(data_sources, classification, "02_next_slate_research/matchup_notes.json")
    return classification


def _fetch_injury_news(
    *,
    slate_date: str,
    slate_games: list[SlateGame],
    client: NightShiftSportsRadarClient,
    data_sources: NightShiftDataSources,
    retrieved_at: str,
) -> tuple[list[InjuryNewsRow], str]:
    endpoint = client.redacted_injuries_endpoint()
    try:
        payload = client.fetch_injuries()
    except urllib.error.HTTPError as exc:
        classification = "SPORTSRADAR_RATE_LIMITED" if exc.code == 429 else "NEWS_QUERY_EXCEPTION"
        data_sources.tracker.record_result(
            SourceResult(
                source_name=SPORTSRADAR_SOURCE,
                endpoint=endpoint,
                success=False,
                retrieved_at=retrieved_at,
                notes=f"{classification}: injury/news request failed.",
                error_summary=f"http_{exc.code}",
            )
        )
        _gap(data_sources, classification, "02_next_slate_research/injury_news.csv")
        return [], classification
    except Exception as exc:  # noqa: BLE001
        data_sources.tracker.record_result(
            SourceResult(
                source_name=SPORTSRADAR_SOURCE,
                endpoint=endpoint,
                success=False,
                retrieved_at=retrieved_at,
                notes="NEWS_QUERY_EXCEPTION: injury/news request failed.",
                error_summary=str(exc),
            )
        )
        _gap(data_sources, "NEWS_QUERY_EXCEPTION", "02_next_slate_research/injury_news.csv")
        return [], "NEWS_QUERY_EXCEPTION"

    allowed_teams = {game.away_team for game in slate_games} | {game.home_team for game in slate_games}
    rows = _injury_rows_from_payload(payload, slate_date=slate_date, allowed_teams=allowed_teams, retrieved_at=retrieved_at)
    classification = "NEWS_AVAILABLE" if rows else "NEWS_EMPTY"
    data_sources.tracker.record_result(
        SourceResult(
            source_name=SPORTSRADAR_SOURCE,
            endpoint=endpoint,
            success=bool(rows),
            retrieved_at=retrieved_at,
            record_count=len(rows),
            notes=f"{classification}: SportsRadar injury feed checked for slate teams.",
            payload={"injury_news_count": len(rows)},
        )
    )
    if not rows:
        _gap(data_sources, "NEWS_EMPTY", "02_next_slate_research/injury_news.csv")
    return rows, classification


def _record_skipped(
    data_sources: NightShiftDataSources,
    *,
    classification: str,
    notes: str,
    recommended_fix: str,
) -> None:
    data_sources.tracker.record_result(
        SourceResult(
            source_name=SPORTSRADAR_SOURCE,
            endpoint="not_called",
            success=False,
            retrieved_at=data_sources.tracker.now(),
            notes=notes,
            error_summary=classification,
        )
    )
    data_sources.tracker.record_gap(
        missing_source=classification,
        affected_artifact="02_next_slate_research/injury_news.csv, 02_next_slate_research/matchup_notes.json",
        severity="MEDIUM",
        recommended_fix=recommended_fix,
        output_degraded=True,
    )


def _gap(data_sources: NightShiftDataSources, classification: str, affected_artifact: str) -> None:
    data_sources.tracker.record_gap(
        missing_source=classification,
        affected_artifact=affected_artifact,
        severity="MEDIUM",
        recommended_fix="Verify SportsRadar entitlement, endpoint availability, and request budget before rerunning.",
        output_degraded=True,
    )


def _extract_games(payload: dict[str, Any]) -> list[dict[str, Any]]:
    games = payload.get("games")
    if isinstance(games, list):
        return [game for game in games if isinstance(game, dict)]
    league = payload.get("league")
    if isinstance(league, dict) and isinstance(league.get("games"), list):
        return [game for game in league["games"] if isinstance(game, dict)]
    return []


def _injury_rows_from_payload(
    payload: dict[str, Any],
    *,
    slate_date: str,
    allowed_teams: set[str],
    retrieved_at: str,
) -> list[InjuryNewsRow]:
    rows: list[InjuryNewsRow] = []
    for team, player in _iter_injury_players(payload):
        team_alias = normalize_team_code(_text(team, "alias", "abbr", "market", "name"))
        if allowed_teams and team_alias and team_alias not in allowed_teams:
            continue
        player_name = _text(player, "full_name", "name", "preferred_name")
        status = _text(player, "status", "injury_status", "availability")
        injury = player.get("injury") if isinstance(player.get("injury"), dict) else {}
        injury_type = _text(injury, "type", "desc", "description") or _text(player, "injury", "injury_type")
        summary = _text(injury, "comment", "notes", "description") or _text(player, "comment", "notes", "description")
        updated = _text(injury, "updated", "updated_at") or _text(player, "updated", "updated_at")
        rows.append(
            InjuryNewsRow(
                slate_date=slate_date,
                player_name=player_name,
                player_id=_text(player, "id", "sr_id", "reference"),
                team=team_alias,
                status=status or "UNVERIFIED",
                injury_or_news_type=injury_type or "injury",
                headline=f"Injury status: {player_name}" if player_name else "Injury status update",
                summary=summary,
                source=SPORTSRADAR_SOURCE,
                published_at=updated,
                retrieved_at=retrieved_at,
                confidence="B" if player_name and status else "C",
            )
        )
    return rows


def _iter_injury_players(payload: dict[str, Any]) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    out: list[tuple[dict[str, Any], dict[str, Any]]] = []
    teams = payload.get("teams")
    if not isinstance(teams, list):
        league = payload.get("league")
        teams = league.get("teams") if isinstance(league, dict) else []
    for team in teams or []:
        if not isinstance(team, dict):
            continue
        players = team.get("players") or team.get("injuries") or []
        for player in players:
            if isinstance(player, dict):
                out.append((team, player))
    players = payload.get("players")
    if isinstance(players, list):
        for player in players:
            if isinstance(player, dict):
                team = player.get("team") if isinstance(player.get("team"), dict) else {}
                out.append((team, player))
    return out


def _text(payload: dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = payload.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""
