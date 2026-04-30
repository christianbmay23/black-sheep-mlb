"""Offline market snapshot cache.

This cache persists normalized market snapshots without fetching provider data.
It is intentionally not wired into the live slate/strict compute path yet.
"""
from __future__ import annotations

import json
from dataclasses import asdict, replace
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any

from .schema import (
    GameMarket,
    MarketBackedStatus,
    MarketCoverageStatus,
    MarketFreshness,
    MarketSide,
    MarketSnapshot,
    MarketType,
    PlayerPropMarket,
    ProviderEventRef,
)


class FileMarketSnapshotCache:
    """JSON-backed ``MarketSnapshotCache`` implementation."""

    def __init__(
        self,
        root: str | Path,
        *,
        stale_minutes: int | None = None,
        now_utc: datetime | None = None,
    ):
        self.root = Path(root)
        self.stale_minutes = stale_minutes
        self.now_utc = now_utc

    def snapshot_path(self, date: str) -> Path:
        return self.root / date / "market-snapshot.json"

    def store_snapshot(self, snapshot: MarketSnapshot) -> None:
        path = self.snapshot_path(snapshot.report_date)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(snapshot_to_dict(snapshot), indent=2, sort_keys=True),
            encoding="utf-8",
        )

    def load_snapshot(self, date: str) -> MarketSnapshot | None:
        path = self.snapshot_path(date)
        if not path.is_file():
            return None
        try:
            snapshot = snapshot_from_dict(json.loads(path.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError, TypeError, ValueError):
            return None
        return self._mark_stale_if_needed(snapshot)

    def _mark_stale_if_needed(self, snapshot: MarketSnapshot) -> MarketSnapshot:
        if self.stale_minutes is None or not snapshot.generated_at:
            return snapshot
        generated_at = _parse_datetime(snapshot.generated_at)
        if generated_at is None:
            return snapshot
        now = self.now_utc or datetime.now(timezone.utc)
        age_minutes = (now - generated_at).total_seconds() / 60
        if age_minutes <= self.stale_minutes:
            return snapshot
        return replace(
            snapshot,
            game_markets=[_mark_market_stale(row) for row in snapshot.game_markets],
            player_prop_markets=[_mark_market_stale(row) for row in snapshot.player_prop_markets],
            raw_provider_metadata={
                **snapshot.raw_provider_metadata,
                "cache_status": MarketFreshness.STALE.value,
                "cache_age_minutes": age_minutes,
            },
        )


def snapshot_to_dict(snapshot: MarketSnapshot) -> dict[str, Any]:
    return _to_jsonable(asdict(snapshot))


def snapshot_from_dict(raw: dict[str, Any]) -> MarketSnapshot:
    return MarketSnapshot(
        report_date=str(raw.get("report_date") or ""),
        provider_events=[
            ProviderEventRef(
                provider=str(row.get("provider") or ""),
                provider_event_id=str(row.get("provider_event_id") or ""),
                game_key=str(row.get("game_key") or ""),
                commence_time=row.get("commence_time"),
                raw_provider_metadata=dict(row.get("raw_provider_metadata") or {}),
            )
            for row in list(raw.get("provider_events") or [])
            if isinstance(row, dict)
        ],
        game_markets=[
            _game_market_from_dict(row)
            for row in list(raw.get("game_markets") or [])
            if isinstance(row, dict)
        ],
        player_prop_markets=[
            _player_prop_market_from_dict(row)
            for row in list(raw.get("player_prop_markets") or [])
            if isinstance(row, dict)
        ],
        generated_at=raw.get("generated_at"),
        diagnostics=list(raw.get("diagnostics") or []),
        raw_provider_metadata=dict(raw.get("raw_provider_metadata") or {}),
    )


def _game_market_from_dict(row: dict[str, Any]) -> GameMarket:
    base = _base_market_kwargs(row)
    return GameMarket(
        **base,
        participant=str(row.get("participant") or ""),
        team=str(row.get("team") or ""),
    )


def _player_prop_market_from_dict(row: dict[str, Any]) -> PlayerPropMarket:
    base = _base_market_kwargs(row)
    return PlayerPropMarket(
        **base,
        player_name=str(row.get("player_name") or ""),
        player_id=row.get("player_id"),
        team=str(row.get("team") or ""),
    )


def _base_market_kwargs(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "game_key": str(row.get("game_key") or ""),
        "provider": str(row.get("provider") or ""),
        "sportsbook": str(row.get("sportsbook") or ""),
        "market_type": _market_type(row.get("market_type")),
        "side": _market_side(row.get("side")),
        "price": row.get("price"),
        "timestamp": row.get("timestamp"),
        "provider_event_id": row.get("provider_event_id"),
        "line": row.get("line"),
        "freshness": _freshness(row.get("freshness")),
        "coverage_status": _coverage(row.get("coverage_status")),
        "backed_status": _backed(row.get("backed_status")),
        "source_confidence": str(row.get("source_confidence") or "unknown"),
        "raw_provider_metadata": dict(row.get("raw_provider_metadata") or {}),
    }


def _mark_market_stale(market: GameMarket | PlayerPropMarket) -> GameMarket | PlayerPropMarket:
    return replace(
        market,
        freshness=MarketFreshness.STALE,
        coverage_status=MarketCoverageStatus.STALE,
        backed_status=MarketBackedStatus.STALE,
    )


def _parse_datetime(value: object) -> datetime | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    if raw.endswith("Z"):
        raw = raw[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(raw)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _to_jsonable(value: Any) -> Any:
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, dict):
        return {key: _to_jsonable(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_to_jsonable(item) for item in value]
    return value


def _market_type(value: object) -> MarketType | str:
    try:
        return MarketType(str(value))
    except ValueError:
        return str(value or MarketType.UNKNOWN.value)


def _market_side(value: object) -> MarketSide | str:
    try:
        return MarketSide(str(value))
    except ValueError:
        return str(value or MarketSide.UNKNOWN.value)


def _freshness(value: object) -> MarketFreshness:
    try:
        return MarketFreshness(str(value))
    except ValueError:
        return MarketFreshness.UNKNOWN


def _coverage(value: object) -> MarketCoverageStatus:
    try:
        return MarketCoverageStatus(str(value))
    except ValueError:
        return MarketCoverageStatus.PARTIAL


def _backed(value: object) -> MarketBackedStatus:
    try:
        return MarketBackedStatus(str(value))
    except ValueError:
        return MarketBackedStatus.DISPLAY_ONLY
