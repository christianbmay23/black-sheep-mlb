"""Safe pybaseball/Baseball Savant adapter for Night Shift Statcast enrichment."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date
import importlib
import importlib.util
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo
from datetime import datetime

from black_sheep_mlb.data_sources.pybaseball_client import PyBaseballClient

from .data_sources import SourceTracker
from .schemas import SourceResult
from .statcast_enrichment import StatcastDailySummary, build_daily_statcast_summary

STATCAST_SOURCE_NAME = "Baseball Savant Statcast via pybaseball"
REQUIRED_COLUMNS = {"batter", "pitcher"}
OPTIONAL_COLUMNS = {
    "game_pk",
    "launch_speed",
    "launch_angle",
    "launch_speed_angle",
    "estimated_ba_using_speedangle",
    "estimated_slg_using_speedangle",
    "estimated_woba_using_speedangle",
    "hit_distance_sc",
    "pitch_type",
    "description",
    "events",
    "hc_x",
    "hc_y",
}


@dataclass
class StatcastFetchDiagnostics:
    requested_date: str
    query_start_date: str
    query_end_date: str
    timezone: str
    pybaseball_available: bool
    pybaseball_version: str
    cache_location: str
    cache_file_exists: bool
    cache_was_used: bool
    force_refresh: bool
    raw_row_count: int
    columns_returned: list[str]
    unique_games: int
    unique_batter_ids: int
    unique_pitcher_ids: int
    sample_rows: list[dict[str, Any]]
    status_classification: str
    recommended_next_action: str
    error_summary: str = ""
    missing_required_columns: list[str] | None = None
    missing_optional_columns: list[str] | None = None

    def as_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["missing_required_columns"] = payload.get("missing_required_columns") or []
        payload["missing_optional_columns"] = payload.get("missing_optional_columns") or []
        return payload


class NightShiftStatcastClient:
    def __init__(self, *, cache_dir: Path | str = "data/cache/pybaseball") -> None:
        self.client = PyBaseballClient(cache_dir=cache_dir)

    def fetch_daily_summary(
        self,
        *,
        date_str: str,
        tracker: SourceTracker,
        offline: bool = False,
        force_refresh: bool = False,
    ) -> StatcastDailySummary:
        retrieved_at = tracker.now()
        endpoint = f"pybaseball.statcast(start_dt={date_str}, end_dt={date_str})"
        if offline:
            tracker.record_result(
                SourceResult(
                    source_name=STATCAST_SOURCE_NAME,
                    endpoint=endpoint,
                    success=False,
                    retrieved_at=retrieved_at,
                    notes="Offline mode enabled; Statcast fetch skipped.",
                    error_summary="OFFLINE_MODE",
                )
            )
            tracker.record_gap(
                missing_source="Baseball Savant Statcast",
                affected_artifact="01_postgame_audit/player_performance.csv, 01_postgame_audit/pitcher_usage.csv",
                severity="MEDIUM",
                recommended_fix="Rerun without --offline to populate Statcast contact-quality fields.",
                output_degraded=True,
            )
            return StatcastDailySummary(status="offline", row_count=0, status_classification="OFFLINE_MODE")

        rows, diagnostics = self.fetch_daily_rows_with_diagnostics(
            date_str=date_str,
            timezone=tracker.timezone,
            force_refresh=force_refresh,
        )
        if diagnostics.status_classification in {"PYBASEBALL_NOT_INSTALLED", "PYBASEBALL_IMPORT_FAILED", "STATCAST_QUERY_EXCEPTION"}:
            tracker.record_gap(
                missing_source="Baseball Savant Statcast",
                affected_artifact="01_postgame_audit/player_performance.csv, 01_postgame_audit/pitcher_usage.csv",
                severity="MEDIUM",
                recommended_fix=diagnostics.recommended_next_action,
                output_degraded=True,
            )

        summary = build_daily_statcast_summary(rows)
        summary.status_classification = diagnostics.status_classification
        success = diagnostics.status_classification == "STATCAST_AVAILABLE"
        tracker.record_result(
            SourceResult(
                source_name=STATCAST_SOURCE_NAME,
                endpoint=endpoint,
                success=success,
                retrieved_at=retrieved_at,
                record_count=diagnostics.raw_row_count,
                notes=_source_notes(diagnostics),
                error_summary="" if success else diagnostics.status_classification,
            )
        )
        if diagnostics.status_classification == "STATCAST_SCHEMA_MISSING_COLUMNS":
            tracker.record_gap(
                missing_source="Statcast required schema columns",
                affected_artifact="01_postgame_audit/player_performance.csv, 01_postgame_audit/pitcher_usage.csv",
                severity="HIGH",
                recommended_fix=diagnostics.recommended_next_action,
                output_degraded=True,
            )
        if not rows:
            tracker.record_gap(
                missing_source="Baseball Savant Statcast",
                affected_artifact="01_postgame_audit/player_performance.csv, 01_postgame_audit/pitcher_usage.csv",
                severity="MEDIUM",
                recommended_fix=diagnostics.recommended_next_action,
                output_degraded=True,
            )
        for field in summary.unavailable_fields:
            tracker.record_gap(
                missing_source=f"Statcast field: {field}",
                affected_artifact="01_postgame_audit/player_performance.csv, 01_postgame_audit/pitcher_usage.csv",
                severity="LOW",
                recommended_fix="Keep the field blank unless Baseball Savant exposes it in the Statcast payload.",
                output_degraded=True,
            )
        if "launch_speed_angle" in summary.unavailable_fields:
            tracker.record_gap(
                missing_source="Statcast barrel classification",
                affected_artifact="01_postgame_audit/player_performance.csv, 02_next_slate_research/matchup_notes.json",
                severity="MEDIUM",
                recommended_fix="Use a Statcast payload with launch_speed_angle or another explicit barrel field.",
                output_degraded=True,
            )
        if "hc_x" in summary.unavailable_fields or "hc_y" in summary.unavailable_fields:
            tracker.record_gap(
                missing_source="Statcast spray direction coordinates",
                affected_artifact="01_postgame_audit/player_performance.csv",
                severity="LOW",
                recommended_fix="Populate pulled/opposite-field contact only when reliable spray-coordinate fields are available.",
                output_degraded=True,
            )
        return summary

    def fetch_daily_rows_with_diagnostics(
        self,
        *,
        date_str: str,
        timezone: str,
        force_refresh: bool = False,
        sample_size: int = 3,
    ) -> tuple[list[dict[str, Any]], StatcastFetchDiagnostics]:
        pybaseball_available, pybaseball_version, import_error = _pybaseball_info()
        endpoint_cache = ""
        if not pybaseball_available:
            classification = "PYBASEBALL_NOT_INSTALLED" if import_error == "not_installed" else "PYBASEBALL_IMPORT_FAILED"
            diagnostics = StatcastFetchDiagnostics(
                requested_date=date_str,
                query_start_date=date_str,
                query_end_date=date_str,
                timezone=timezone,
                pybaseball_available=False,
                pybaseball_version=pybaseball_version,
                cache_location=endpoint_cache,
                cache_file_exists=False,
                cache_was_used=False,
                force_refresh=force_refresh,
                raw_row_count=0,
                columns_returned=[],
                unique_games=0,
                unique_batter_ids=0,
                unique_pitcher_ids=0,
                sample_rows=[],
                status_classification=classification,
                recommended_next_action="Install or repair pybaseball in the project environment before running Statcast enrichment.",
                error_summary=import_error,
                missing_required_columns=sorted(REQUIRED_COLUMNS),
                missing_optional_columns=sorted(OPTIONAL_COLUMNS),
            )
            return [], diagnostics

        try:
            frame = self.client.get_statcast_window(date_str, date_str, force_refresh=force_refresh)
            rows = _frame_to_rows(frame)
            columns = _frame_columns(frame, rows)
            error_summary = self.client.last_fetch_error or ""
        except Exception as exc:  # noqa: BLE001 - diagnostic mode must classify instead of crashing.
            rows = []
            columns = []
            error_summary = str(exc)
            self.client.last_fetch_error = error_summary

        cache_location = _cache_location(self.client.last_cache_path)
        classification = _classify_fetch(
            date_str=date_str,
            timezone=timezone,
            rows=rows,
            columns=columns,
            cache_was_used=self.client.last_cache_was_used,
            fetch_error=self.client.last_fetch_error,
        )
        missing_required = sorted(REQUIRED_COLUMNS - set(columns)) if rows else []
        missing_optional = sorted(OPTIONAL_COLUMNS - set(columns)) if rows else []
        diagnostics = StatcastFetchDiagnostics(
            requested_date=date_str,
            query_start_date=date_str,
            query_end_date=date_str,
            timezone=timezone,
            pybaseball_available=True,
            pybaseball_version=pybaseball_version,
            cache_location=cache_location,
            cache_file_exists=_cache_exists(self.client.last_cache_path),
            cache_was_used=self.client.last_cache_was_used,
            force_refresh=force_refresh,
            raw_row_count=len(rows),
            columns_returned=columns,
            unique_games=_unique_count(rows, "game_pk"),
            unique_batter_ids=_unique_count(rows, "batter"),
            unique_pitcher_ids=_unique_count(rows, "pitcher"),
            sample_rows=_sample_rows(rows, sample_size),
            status_classification=classification,
            recommended_next_action=_recommended_action(classification, cache_was_used=self.client.last_cache_was_used),
            error_summary=error_summary,
            missing_required_columns=missing_required,
            missing_optional_columns=missing_optional,
        )
        return rows, diagnostics


def _frame_to_rows(frame: Any) -> list[dict[str, Any]]:
    if frame is None:
        return []
    empty = getattr(frame, "empty", False)
    if empty:
        return []
    if hasattr(frame, "where"):
        try:
            frame = frame.where(frame.notna(), None)
        except Exception:
            pass
    if hasattr(frame, "to_dict"):
        return list(frame.to_dict(orient="records"))
    if isinstance(frame, list):
        return [dict(row) for row in frame]
    return []


def _frame_columns(frame: Any, rows: list[dict[str, Any]]) -> list[str]:
    columns = getattr(frame, "columns", None)
    if columns is not None:
        try:
            return sorted(str(column) for column in list(columns))
        except Exception:
            pass
    return sorted({str(key) for row in rows for key in row})


def _pybaseball_info() -> tuple[bool, str, str]:
    spec = importlib.util.find_spec("pybaseball")
    if spec is None:
        return False, "not_installed", "not_installed"
    try:
        module = importlib.import_module("pybaseball")
    except Exception as exc:  # noqa: BLE001
        return False, "import_failed", str(exc)
    return True, str(getattr(module, "__version__", "unknown")), ""


def _classify_fetch(
    *,
    date_str: str,
    timezone: str,
    rows: list[dict[str, Any]],
    columns: list[str],
    cache_was_used: bool,
    fetch_error: str | None,
) -> str:
    if _date_is_future(date_str, timezone):
        return "STATCAST_DATE_OUT_OF_RANGE"
    if fetch_error and not rows:
        return "STATCAST_QUERY_EXCEPTION"
    if rows and REQUIRED_COLUMNS - set(columns):
        return "STATCAST_SCHEMA_MISSING_COLUMNS"
    if rows:
        return "STATCAST_AVAILABLE"
    if cache_was_used:
        return "STATCAST_CACHE_EMPTY_OR_STALE"
    return "STATCAST_EMPTY_FOR_DATE"


def _date_is_future(date_str: str, timezone: str) -> bool:
    try:
        requested = date.fromisoformat(date_str)
    except ValueError:
        return False
    today = datetime.now(ZoneInfo(timezone)).date()
    return requested > today


def _recommended_action(classification: str, *, cache_was_used: bool) -> str:
    if classification == "STATCAST_AVAILABLE":
        return "Statcast enrichment can proceed."
    if classification == "STATCAST_CACHE_EMPTY_OR_STALE":
        return "Rerun with --force-refresh to bypass the cached empty Statcast result."
    if classification == "STATCAST_DATE_OUT_OF_RANGE":
        return "Use a completed historical MLB date; Statcast may not exist for future or not-yet-final games."
    if classification == "STATCAST_QUERY_EXCEPTION":
        return "Check pybaseball/Baseball Savant availability; rerun later or with --force-refresh if cache behavior is suspect."
    if classification == "STATCAST_SCHEMA_MISSING_COLUMNS":
        return "Inspect returned Statcast columns and update the adapter only if Baseball Savant changed the schema."
    if classification == "STATCAST_EMPTY_FOR_DATE":
        return "Verify the requested date had tracked MLB games and rerun; if it should have data, try --force-refresh."
    if classification in {"PYBASEBALL_NOT_INSTALLED", "PYBASEBALL_IMPORT_FAILED"}:
        return "Install or repair pybaseball in the project environment."
    if cache_was_used:
        return "Rerun with --force-refresh and inspect the cache file."
    return "Inspect pybaseball, network availability, and Baseball Savant date support."


def _source_notes(diagnostics: StatcastFetchDiagnostics) -> str:
    if diagnostics.status_classification == "STATCAST_AVAILABLE":
        return (
            f"Fetched {diagnostics.raw_row_count} Statcast pitch rows for {diagnostics.requested_date}; "
            f"{diagnostics.unique_batter_ids} batters, {diagnostics.unique_pitcher_ids} pitchers, "
            f"cache_used={diagnostics.cache_was_used}."
        )
    return (
        f"Statcast status {diagnostics.status_classification} for {diagnostics.requested_date}; "
        f"rows={diagnostics.raw_row_count}, cache_used={diagnostics.cache_was_used}, "
        f"cache={diagnostics.cache_location or 'NA'}. {diagnostics.recommended_next_action}"
    )


def _cache_location(path: Path | None) -> str:
    if path is None:
        return ""
    parquet = path.with_suffix(".parquet")
    if parquet.exists():
        return str(parquet)
    csv = path.with_suffix(".csv")
    if csv.exists():
        return str(csv)
    return str(path)


def _cache_exists(path: Path | None) -> bool:
    if path is None:
        return False
    return path.with_suffix(".parquet").exists() or path.with_suffix(".csv").exists()


def _unique_count(rows: list[dict[str, Any]], key: str) -> int:
    return len({str(row.get(key)) for row in rows if row.get(key) not in {None, ""}})


def _sample_rows(rows: list[dict[str, Any]], sample_size: int) -> list[dict[str, Any]]:
    safe_columns = [
        "game_date",
        "game_pk",
        "batter",
        "pitcher",
        "events",
        "description",
        "pitch_type",
        "launch_speed",
        "launch_angle",
        "launch_speed_angle",
        "estimated_ba_using_speedangle",
        "estimated_slg_using_speedangle",
        "estimated_woba_using_speedangle",
    ]
    sample: list[dict[str, Any]] = []
    for row in rows[:sample_size]:
        sample.append({key: _json_safe(row.get(key)) for key in safe_columns if key in row})
    return sample


def _json_safe(value: Any) -> Any:
    if value is None:
        return None
    try:
        if value != value:  # NaN
            return None
    except Exception:
        pass
    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except Exception:
            pass
    if hasattr(value, "item"):
        try:
            item = value.item()
            if hasattr(item, "isoformat"):
                return item.isoformat()
            return item
        except Exception:
            pass
    if not isinstance(value, (str, int, float, bool)):
        return str(value)
    return value
