"""Manual operator input loading for EchoIQ pregame refresh."""

from __future__ import annotations

import csv
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

from .data_sources import SourceTracker
from .id_mapping import normalize_player_name, normalize_team_code
from .odds_client import implied_probability_from_american
from .schemas import SlateGame, SourceResult


MANUAL_SOURCE = "manual_operator_input"

MANUAL_INPUT_VALIDATION_FIELDS = [
    "input_file",
    "row_number",
    "severity",
    "field",
    "issue",
    "row_summary",
    "action_taken",
]

MANUAL_INPUT_PREFLIGHT_FIELDS = [
    "slate_date",
    "input_type",
    "path",
    "status",
    "valid_rows",
    "invalid_rows",
    "warnings",
    "fatal_errors",
    "safe_to_merge",
    "notes",
]

WEATHER_ROOF_COLUMNS = [
    "slate_date",
    "game_id",
    "away_team",
    "home_team",
    "venue",
    "roof_status",
    "temperature",
    "wind_speed",
    "wind_direction",
    "humidity",
    "precipitation_risk",
    "weather_verified",
    "weather_risk",
    "source_name",
    "source_url",
    "last_updated",
    "notes",
]

MARKET_SNAPSHOT_COLUMNS = [
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
    "sportsbook",
    "last_updated",
    "source_name",
    "source_url",
    "notes",
]

PLAYER_PROPS_COLUMNS = [
    "slate_date",
    "game_id",
    "player_name",
    "player_id",
    "team",
    "opponent",
    "market",
    "line",
    "price",
    "sportsbook",
    "available",
    "last_updated",
    "source_name",
    "source_url",
    "notes",
]

NEWS_SCRATCH_COLUMNS = [
    "slate_date",
    "game_id",
    "player_name",
    "player_id",
    "team",
    "news_type",
    "status",
    "headline",
    "summary",
    "lineup_impact",
    "prop_impact",
    "source_name",
    "source_url",
    "published_at",
    "notes",
]

ALLOWED_ROOF_STATUSES = {"OPEN", "CLOSED", "RETRACTABLE_UNKNOWN", "DOME", "OUTDOOR", "UNKNOWN"}
ALLOWED_MARKETS = {
    "moneyline",
    "run_line",
    "total",
    "first_five_moneyline",
    "first_five_total",
    "team_total",
    "home_run",
    "total_bases",
    "hits",
    "rbi",
    "runs",
}
ALLOWED_PLAYER_PROP_MARKETS = {"home_run", "total_bases", "hits", "rbi", "runs"}
ALLOWED_NEWS_TYPES = {
    "injury",
    "scratch",
    "rest",
    "lineup",
    "weather",
    "roster",
    "beat_reporter",
    "official_team",
}
ALLOWED_NEWS_STATUSES = {
    "out",
    "questionable",
    "probable",
    "available",
    "starting",
    "not_starting",
    "unknown",
}
ALLOWED_LINEUP_IMPACTS = {"kills_candidate", "downgrades_candidate", "no_impact", "unknown"}


@dataclass(frozen=True)
class ManualInputSpec:
    name: str
    env_var: str
    default_file: str
    columns: list[str]
    loaded_event: str
    affected_artifact: str


@dataclass
class ManualInputBundle:
    weather_rows: list[dict[str, object]] = field(default_factory=list)
    market_rows: list[dict[str, object]] = field(default_factory=list)
    player_prop_rows: list[dict[str, object]] = field(default_factory=list)
    news_rows: list[dict[str, object]] = field(default_factory=list)
    validation_rows: list[dict[str, object]] = field(default_factory=list)


@dataclass(frozen=True)
class ManualInputPreflightFileResult:
    input_type: str
    display_name: str
    path: Path
    status: str
    valid_rows: int = 0
    invalid_rows: int = 0
    warnings: int = 0
    fatal_errors: int = 0
    safe_to_merge: bool = True
    notes: list[str] = field(default_factory=list)

    def csv_row(self, slate_date: str) -> dict[str, object]:
        return {
            "slate_date": slate_date,
            "input_type": self.input_type,
            "path": str(self.path),
            "status": self.status,
            "valid_rows": self.valid_rows,
            "invalid_rows": self.invalid_rows,
            "warnings": self.warnings,
            "fatal_errors": self.fatal_errors,
            "safe_to_merge": self.safe_to_merge,
            "notes": "; ".join(self.notes),
        }


@dataclass(frozen=True)
class ManualInputPreflightResult:
    slate_date: str
    file_results: list[ManualInputPreflightFileResult]
    output_path: Path | None = None
    output_written: bool = False

    @property
    def status(self) -> str:
        if any(result.fatal_errors for result in self.file_results):
            return "FAIL"
        if any(
            result.warnings or result.invalid_rows or result.status in {"MISSING", "HEADER_ONLY"}
            for result in self.file_results
        ):
            return "PASS_WITH_WARNINGS"
        return "PASS"

    @property
    def safe_to_run_pregame_refresh(self) -> bool:
        return self.status != "FAIL"

    @property
    def valid_rows(self) -> int:
        return sum(result.valid_rows for result in self.file_results)

    @property
    def invalid_rows(self) -> int:
        return sum(result.invalid_rows for result in self.file_results)

    @property
    def warnings(self) -> int:
        return sum(result.warnings for result in self.file_results)

    @property
    def fatal_errors(self) -> int:
        return sum(result.fatal_errors for result in self.file_results)


SPECS = {
    "weather": ManualInputSpec(
        name="weather_roof",
        env_var="ECHOIQ_WEATHER_CSV",
        default_file="weather_roof.csv",
        columns=WEATHER_ROOF_COLUMNS,
        loaded_event="MANUAL_WEATHER_LOADED",
        affected_artifact="04_pregame_refresh/weather_refresh.csv",
    ),
    "market": ManualInputSpec(
        name="market_snapshot",
        env_var="ECHOIQ_MARKET_CSV",
        default_file="market_snapshot.csv",
        columns=MARKET_SNAPSHOT_COLUMNS,
        loaded_event="MANUAL_MARKETS_LOADED",
        affected_artifact="04_pregame_refresh/market_refresh.csv",
    ),
    "props": ManualInputSpec(
        name="player_props",
        env_var="ECHOIQ_PLAYER_PROPS_CSV",
        default_file="player_props.csv",
        columns=PLAYER_PROPS_COLUMNS,
        loaded_event="MANUAL_PLAYER_PROPS_LOADED",
        affected_artifact="04_pregame_refresh/player_prop_availability.csv",
    ),
    "news": ManualInputSpec(
        name="news_scratch",
        env_var="ECHOIQ_NEWS_CSV",
        default_file="news_scratch.csv",
        columns=NEWS_SCRATCH_COLUMNS,
        loaded_event="MANUAL_NEWS_LOADED",
        affected_artifact="04_pregame_refresh/news_refresh.csv",
    ),
}


def load_manual_operator_inputs(
    *,
    slate_date: str,
    slate_games: list[SlateGame],
    repo_root: Path,
    tracker: SourceTracker,
    retrieved_at: str,
) -> ManualInputBundle:
    bundle = ManualInputBundle()
    games_by_id = {game.game_id: game for game in slate_games}
    games_by_matchup = {(game.away_team, game.home_team): game for game in slate_games}

    weather_rows = _load_csv(SPECS["weather"], slate_date, repo_root, tracker, bundle.validation_rows)
    bundle.weather_rows.extend(
        _weather_rows(weather_rows, games_by_id, games_by_matchup, retrieved_at, bundle.validation_rows, SPECS["weather"])
    )
    _record_loaded(SPECS["weather"], tracker, repo_root, len(bundle.weather_rows), bundle.validation_rows)

    market_rows = _load_csv(SPECS["market"], slate_date, repo_root, tracker, bundle.validation_rows)
    normalized_markets, prop_rows_from_market = _market_rows(
        market_rows,
        games_by_id,
        games_by_matchup,
        retrieved_at,
        bundle.validation_rows,
        SPECS["market"],
    )
    bundle.market_rows.extend(normalized_markets)
    bundle.player_prop_rows.extend(prop_rows_from_market)
    _record_loaded(SPECS["market"], tracker, repo_root, len(normalized_markets), bundle.validation_rows)

    player_prop_rows = _load_csv(SPECS["props"], slate_date, repo_root, tracker, bundle.validation_rows)
    prop_markets, prop_availability = _player_prop_rows(
        player_prop_rows,
        games_by_id,
        games_by_matchup,
        retrieved_at,
        bundle.validation_rows,
        SPECS["props"],
    )
    bundle.market_rows.extend(prop_markets)
    bundle.player_prop_rows.extend(prop_availability)
    _record_loaded(SPECS["props"], tracker, repo_root, len(prop_availability), bundle.validation_rows)

    news_rows = _load_csv(SPECS["news"], slate_date, repo_root, tracker, bundle.validation_rows)
    bundle.news_rows.extend(
        _news_rows(news_rows, games_by_id, games_by_matchup, retrieved_at, bundle.validation_rows, SPECS["news"])
    )
    _record_loaded(SPECS["news"], tracker, repo_root, len(bundle.news_rows), bundle.validation_rows)

    _record_validation_summary(bundle.validation_rows, tracker)
    return bundle


def manual_input_paths(repo_root: Path) -> list[Path]:
    return [_path_for_spec(spec, repo_root) for spec in SPECS.values()]


def run_manual_input_preflight(
    *,
    slate_date: str,
    repo_root: Path,
    output_path: Path | None = None,
) -> ManualInputPreflightResult:
    results = [_preflight_spec(key, spec, slate_date=slate_date, repo_root=repo_root) for key, spec in SPECS.items()]
    output_written = False
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=MANUAL_INPUT_PREFLIGHT_FIELDS, lineterminator="\n")
            writer.writeheader()
            for result in results:
                writer.writerow(result.csv_row(slate_date))
        output_written = True
    return ManualInputPreflightResult(
        slate_date=slate_date,
        file_results=results,
        output_path=output_path,
        output_written=output_written,
    )


def _preflight_spec(
    input_type: str,
    spec: ManualInputSpec,
    *,
    slate_date: str,
    repo_root: Path,
) -> ManualInputPreflightFileResult:
    path = _path_for_spec(spec, repo_root)
    display_name = f"{spec.default_file}"
    if not path.is_file():
        return ManualInputPreflightFileResult(
            input_type=input_type,
            display_name=display_name,
            path=path,
            status="MISSING",
            warnings=1,
            notes=["optional file missing; pregame refresh will skip this manual input"],
        )

    try:
        with path.open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            fieldnames = reader.fieldnames or []
            missing_columns = [column for column in spec.columns if column not in fieldnames]
            if missing_columns:
                return ManualInputPreflightFileResult(
                    input_type=input_type,
                    display_name=display_name,
                    path=path,
                    status="SCHEMA_ERROR",
                    warnings=0,
                    fatal_errors=len(missing_columns),
                    safe_to_merge=False,
                    notes=["missing required columns: " + ", ".join(missing_columns)],
                )
            rows = [{key: str(value or "").strip() for key, value in row.items()} for row in reader]
    except (OSError, csv.Error) as exc:
        return ManualInputPreflightFileResult(
            input_type=input_type,
            display_name=display_name,
            path=path,
            status="UNREADABLE",
            warnings=0,
            fatal_errors=1,
            safe_to_merge=False,
            notes=[str(exc)],
        )

    if not rows:
        return ManualInputPreflightFileResult(
            input_type=input_type,
            display_name=display_name,
            path=path,
            status="HEADER_ONLY",
            warnings=1,
            notes=["header-only file"],
        )

    valid_rows = 0
    invalid_rows = 0
    warnings = 0
    notes: list[str] = []
    for index, row in enumerate(rows, start=2):
        row_valid, row_invalid, row_warnings, row_notes = _preflight_row(input_type, row, slate_date, index)
        valid_rows += 1 if row_valid else 0
        invalid_rows += 1 if row_invalid else 0
        warnings += row_warnings
        notes.extend(row_notes)

    status = "FOUND"
    unique_notes = _unique_notes(notes)
    if invalid_rows:
        unique_notes.insert(0, "invalid rows can be skipped or downgraded safely; review before relying on gates")
    return ManualInputPreflightFileResult(
        input_type=input_type,
        display_name=display_name,
        path=path,
        status=status,
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        warnings=warnings,
        notes=unique_notes or ["ready"],
    )


def _preflight_row(input_type: str, row: dict[str, str], slate_date: str, row_number: int) -> tuple[bool, bool, int, list[str]]:
    invalid = False
    warnings = 0
    notes: list[str] = []
    if str(row.get("slate_date", "")).strip() != slate_date:
        return False, True, 1, [f"row {row_number}: MANUAL_INPUT_DATE_MISMATCH"]
    source_warnings = _source_field_warnings(row, row_number)
    warnings += len(source_warnings)
    notes.extend(source_warnings)

    if input_type == "weather":
        row_invalid, row_warnings, row_notes = _preflight_weather_row(row, row_number)
    elif input_type == "market":
        row_invalid, row_warnings, row_notes = _preflight_market_row(row, row_number)
    elif input_type == "props":
        row_invalid, row_warnings, row_notes = _preflight_props_row(row, row_number)
    elif input_type == "news":
        row_invalid, row_warnings, row_notes = _preflight_news_row(row, row_number)
    else:
        row_invalid, row_warnings, row_notes = False, 0, []

    invalid = invalid or row_invalid
    warnings += row_warnings
    notes.extend(row_notes)
    return True, invalid, warnings, notes


def _preflight_weather_row(row: dict[str, str], row_number: int) -> tuple[bool, int, list[str]]:
    invalid = False
    warnings = 0
    notes: list[str] = []
    roof = str(row.get("roof_status", "")).strip().upper()
    if roof not in ALLOWED_ROOF_STATUSES:
        warnings += 1
        notes.append(f"row {row_number}: unknown roof_status will be kept as UNKNOWN")
    verified = _parse_bool(row.get("weather_verified"))
    if verified is None:
        return True, warnings + 1, notes + [f"row {row_number}: weather_verified must be true or false"]
    if verified is False:
        warnings += 1
        notes.append("weather_verified=false rows will not verify the weather gate")
    return invalid, warnings, notes


def _preflight_market_row(row: dict[str, str], row_number: int) -> tuple[bool, int, list[str]]:
    market = _normalize_market(row.get("market", ""))
    if market not in ALLOWED_MARKETS:
        return True, 1, [f"row {row_number}: unknown market will be skipped"]
    return _preflight_price(row.get("price"), row_number)


def _preflight_props_row(row: dict[str, str], row_number: int) -> tuple[bool, int, list[str]]:
    invalid = False
    warnings = 0
    notes: list[str] = []
    market = _normalize_market(row.get("market", ""))
    if market not in ALLOWED_PLAYER_PROP_MARKETS:
        return True, 1, [f"row {row_number}: unknown player prop market will be skipped"]
    available = _parse_bool(row.get("available"))
    if available is None:
        return True, 1, [f"row {row_number}: available must be true or false"]
    price_invalid, price_warnings, price_notes = _preflight_price(row.get("price"), row_number)
    invalid = invalid or price_invalid
    warnings += price_warnings
    notes.extend(price_notes)
    if available is False:
        warnings += 1
        notes.append("available=false rows will not clear player prop availability")
    return invalid, warnings, notes


def _preflight_news_row(row: dict[str, str], row_number: int) -> tuple[bool, int, list[str]]:
    warnings = 0
    notes: list[str] = []
    news_type = _norm_token(row.get("news_type", ""))
    status = _norm_token(row.get("status", ""))
    lineup_impact = _norm_token(row.get("lineup_impact", ""))
    if news_type not in ALLOWED_NEWS_TYPES:
        warnings += 1
        notes.append(f"row {row_number}: unknown news_type will be kept")
    if status not in ALLOWED_NEWS_STATUSES:
        warnings += 1
        notes.append(f"row {row_number}: unknown status will be kept as unknown")
    if lineup_impact and lineup_impact not in ALLOWED_LINEUP_IMPACTS:
        warnings += 1
        notes.append(f"row {row_number}: unknown lineup_impact will be kept as unknown")
    return False, warnings, notes


def _preflight_price(raw_price: object, row_number: int) -> tuple[bool, int, list[str]]:
    if not str(raw_price or "").strip():
        return False, 1, [f"row {row_number}: price blank; row will not verify priced market"]
    price = _parse_number(raw_price)
    if implied_probability_from_american(price) is None:
        return True, 1, [f"row {row_number}: invalid American odds; implied_probability will be blank"]
    return False, 0, []


def _source_field_warnings(row: dict[str, str], row_number: int) -> list[str]:
    notes: list[str] = []
    if not str(row.get("source_name", "")).strip():
        notes.append(f"row {row_number}: source_name missing")
    if not str(row.get("source_url", "")).strip():
        notes.append(f"row {row_number}: source_url missing")
    return notes


def _unique_notes(notes: list[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for note in notes:
        normalized = note
        if note.startswith("row ") and ":" in note:
            normalized = note.split(":", 1)[1].strip()
        if normalized in seen:
            continue
        seen.add(normalized)
        out.append(note)
    return out


def _load_csv(
    spec: ManualInputSpec,
    slate_date: str,
    repo_root: Path,
    tracker: SourceTracker,
    validation_rows: list[dict[str, object]],
) -> list[tuple[int, dict[str, str]]]:
    path = _path_for_spec(spec, repo_root)
    if not path.is_file():
        _validation(validation_rows, path, "", "INFO", "", "manual input file missing", "", "skipped")
        tracker.record_result(
            SourceResult(
                source_name=MANUAL_SOURCE,
                endpoint=str(path),
                success=False,
                retrieved_at=tracker.now(),
                notes=f"MANUAL_INPUT_MISSING:{spec.name}",
                error_summary="MANUAL_INPUT_MISSING",
            )
        )
        return []

    try:
        with path.open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            missing_columns = [column for column in spec.columns if column not in (reader.fieldnames or [])]
            if missing_columns:
                for column in missing_columns:
                    _validation(
                        validation_rows,
                        path,
                        "",
                        "ERROR",
                        column,
                        "required column missing",
                        "",
                        "file skipped",
                    )
                tracker.record_result(
                    SourceResult(
                        source_name=MANUAL_SOURCE,
                        endpoint=str(path),
                        success=False,
                        retrieved_at=tracker.now(),
                        notes=f"MANUAL_INPUT_SCHEMA_ERROR:{spec.name}",
                        error_summary="MANUAL_INPUT_SCHEMA_ERROR",
                    )
                )
                tracker.record_gap(
                    missing_source="MANUAL_INPUT_SCHEMA_ERROR",
                    affected_artifact=spec.affected_artifact,
                    affected_games_players=spec.name,
                    severity="HIGH",
                    recommended_fix=f"Add required columns to {path}.",
                    output_degraded=True,
                )
                return []
            rows = []
            for row_number, row in enumerate(reader, start=2):
                if str(row.get("slate_date", "")).strip() != slate_date:
                    _validation(
                        validation_rows,
                        path,
                        row_number,
                        "ERROR",
                        "slate_date",
                        f"row slate_date does not match {slate_date}",
                        _row_summary(row),
                        "row skipped",
                    )
                    continue
                rows.append((row_number, {key: str(value or "").strip() for key, value in row.items()}))
            return rows
    except OSError as exc:
        _validation(validation_rows, path, "", "ERROR", "", str(exc), "", "file skipped")
        tracker.record_result(
            SourceResult(
                source_name=MANUAL_SOURCE,
                endpoint=str(path),
                success=False,
                retrieved_at=tracker.now(),
                notes=f"MANUAL_INPUT_SCHEMA_ERROR:{spec.name}",
                error_summary=str(exc),
            )
        )
        return []


def _weather_rows(
    rows: Iterable[tuple[int, dict[str, str]]],
    games_by_id: dict[str, SlateGame],
    games_by_matchup: dict[tuple[str, str], SlateGame],
    retrieved_at: str,
    validation_rows: list[dict[str, object]],
    spec: ManualInputSpec,
) -> list[dict[str, object]]:
    out: list[dict[str, object]] = []
    path = _path_for_spec(spec, Path.cwd())
    for row_number, row in rows:
        roof = str(row.get("roof_status", "")).strip().upper()
        if roof not in ALLOWED_ROOF_STATUSES:
            _validation(validation_rows, path, row_number, "WARNING", "roof_status", "unknown roof_status", _row_summary(row), "row kept as UNKNOWN")
            roof = "UNKNOWN"
        verified = _parse_bool(row.get("weather_verified"))
        if verified is None:
            _validation(validation_rows, path, row_number, "ERROR", "weather_verified", "expected true or false", _row_summary(row), "row skipped")
            continue
        game = _resolve_game(row, games_by_id, games_by_matchup)
        _warn_unknown_game(row, game, validation_rows, path, row_number)
        out.append(
            {
                "slate_date": row["slate_date"],
                "game_id": row.get("game_id") or (game.game_id if game else ""),
                "venue": row.get("venue") or (game.venue if game else ""),
                "roof_status": roof,
                "temperature": row.get("temperature", ""),
                "wind_speed": row.get("wind_speed", ""),
                "wind_direction": row.get("wind_direction", ""),
                "humidity": row.get("humidity", ""),
                "precipitation_risk": row.get("precipitation_risk", ""),
                "weather_verified": verified,
                "weather_risk": row.get("weather_risk") or ("LOW" if verified else "UNVERIFIED"),
                "source": MANUAL_SOURCE,
                "retrieved_at": row.get("last_updated") or retrieved_at,
            }
        )
    return out


def _market_rows(
    rows: Iterable[tuple[int, dict[str, str]]],
    games_by_id: dict[str, SlateGame],
    games_by_matchup: dict[tuple[str, str], SlateGame],
    retrieved_at: str,
    validation_rows: list[dict[str, object]],
    spec: ManualInputSpec,
) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    out: list[dict[str, object]] = []
    props: list[dict[str, object]] = []
    path = _path_for_spec(spec, Path.cwd())
    for row_number, row in rows:
        market = _normalize_market(row.get("market", ""))
        if market not in ALLOWED_MARKETS:
            _validation(validation_rows, path, row_number, "WARNING", "market", "unknown market", _row_summary(row), "row skipped")
            continue
        price, implied = _price_and_probability(row.get("price"), validation_rows, path, row_number, row)
        game = _resolve_game(row, games_by_id, games_by_matchup)
        _warn_unknown_game(row, game, validation_rows, path, row_number)
        market_type = _market_type(row.get("market_type", ""), market)
        player_name = row.get("player_name", "") if market_type.startswith("player_") else ""
        status = _availability_status(price, implied, row.get("last_updated", ""), available=True)
        market_row = {
            "slate_date": row["slate_date"],
            "game_id": row.get("game_id") or (game.game_id if game else ""),
            "market_type": market_type,
            "market": market,
            "player_or_team": player_name or normalize_team_code(row.get("team", "")),
            "team": normalize_team_code(row.get("team", "")),
            "line": _parse_number(row.get("line")),
            "price": price,
            "implied_probability": implied,
            "sportsbook": row.get("sportsbook", ""),
            "market_status": status,
            "last_updated": row.get("last_updated", ""),
            "source": MANUAL_SOURCE,
            "retrieved_at": retrieved_at,
        }
        out.append(market_row)
        if market_type.startswith("player_"):
            props.append(_prop_row_from_market(row, market_row, "", available=status == "available"))
    return out, props


def _player_prop_rows(
    rows: Iterable[tuple[int, dict[str, str]]],
    games_by_id: dict[str, SlateGame],
    games_by_matchup: dict[tuple[str, str], SlateGame],
    retrieved_at: str,
    validation_rows: list[dict[str, object]],
    spec: ManualInputSpec,
) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    market_rows: list[dict[str, object]] = []
    prop_rows: list[dict[str, object]] = []
    path = _path_for_spec(spec, Path.cwd())
    for row_number, row in rows:
        market = _normalize_market(row.get("market", ""))
        if market not in ALLOWED_PLAYER_PROP_MARKETS:
            _validation(validation_rows, path, row_number, "WARNING", "market", "unknown player prop market", _row_summary(row), "row skipped")
            continue
        available = _parse_bool(row.get("available"))
        if available is None:
            _validation(validation_rows, path, row_number, "ERROR", "available", "expected true or false", _row_summary(row), "row skipped")
            continue
        price, implied = _price_and_probability(row.get("price"), validation_rows, path, row_number, row)
        if price is None or implied is None:
            available = False
        game = _resolve_game(row, games_by_id, games_by_matchup)
        _warn_unknown_game(row, game, validation_rows, path, row_number)
        market_row = {
            "slate_date": row["slate_date"],
            "game_id": row.get("game_id") or (game.game_id if game else ""),
            "market_type": _market_type("player_prop", market),
            "market": market,
            "player_or_team": row.get("player_name", ""),
            "team": normalize_team_code(row.get("team", "")),
            "line": _parse_number(row.get("line")),
            "price": price,
            "implied_probability": implied,
            "sportsbook": row.get("sportsbook", ""),
            "market_status": _availability_status(price, implied, row.get("last_updated", ""), available=available),
            "last_updated": row.get("last_updated", ""),
            "source": MANUAL_SOURCE,
            "retrieved_at": retrieved_at,
        }
        market_rows.append(market_row)
        prop_rows.append(_prop_row_from_market(row, market_row, row.get("player_id", ""), available=available))
    return market_rows, prop_rows


def _news_rows(
    rows: Iterable[tuple[int, dict[str, str]]],
    games_by_id: dict[str, SlateGame],
    games_by_matchup: dict[tuple[str, str], SlateGame],
    retrieved_at: str,
    validation_rows: list[dict[str, object]],
    spec: ManualInputSpec,
) -> list[dict[str, object]]:
    out: list[dict[str, object]] = []
    path = _path_for_spec(spec, Path.cwd())
    for row_number, row in rows:
        news_type = _norm_token(row.get("news_type", ""))
        status = _norm_token(row.get("status", ""))
        lineup_impact = _norm_token(row.get("lineup_impact", ""))
        if news_type not in ALLOWED_NEWS_TYPES:
            _validation(validation_rows, path, row_number, "WARNING", "news_type", "unknown news_type", _row_summary(row), "row kept")
        if status not in ALLOWED_NEWS_STATUSES:
            _validation(validation_rows, path, row_number, "WARNING", "status", "unknown status", _row_summary(row), "row kept as unknown")
            status = "unknown"
        if lineup_impact and lineup_impact not in ALLOWED_LINEUP_IMPACTS:
            _validation(validation_rows, path, row_number, "WARNING", "lineup_impact", "unknown lineup_impact", _row_summary(row), "row kept as unknown")
            lineup_impact = "unknown"
        game = _resolve_game(row, games_by_id, games_by_matchup)
        _warn_unknown_game(row, game, validation_rows, path, row_number)
        out.append(
            {
                "slate_date": row["slate_date"],
                "game_id": row.get("game_id") or (game.game_id if game else ""),
                "player_name": row.get("player_name", ""),
                "player_id": row.get("player_id", ""),
                "team": normalize_team_code(row.get("team", "")),
                "news_type": news_type,
                "status": status,
                "headline": row.get("headline", ""),
                "summary": row.get("summary", ""),
                "lineup_impact": _manual_lineup_impact(status, lineup_impact),
                "prop_impact": _manual_prop_impact(status, _norm_token(row.get("prop_impact", ""))),
                "source": MANUAL_SOURCE,
                "published_at": row.get("published_at", ""),
                "retrieved_at": retrieved_at,
            }
        )
    return out


def _record_loaded(
    spec: ManualInputSpec,
    tracker: SourceTracker,
    repo_root: Path,
    count: int,
    validation_rows: list[dict[str, object]],
) -> None:
    path = _path_for_spec(spec, repo_root)
    if not path.is_file():
        return
    if count == 0 and _is_header_only_csv(path):
        tracker.record_result(
            SourceResult(
                source_name=MANUAL_SOURCE,
                endpoint=str(path),
                success=True,
                retrieved_at=tracker.now(),
                record_count=0,
                notes=f"MANUAL_INPUT_HEADER_ONLY:{spec.name}",
            )
        )
        _validation(validation_rows, path, "", "INFO", "", "manual input file header-only", "", "no rows merged")
        return
    tracker.record_result(
        SourceResult(
            source_name=MANUAL_SOURCE,
            endpoint=str(path),
            success=count > 0,
            retrieved_at=tracker.now(),
            record_count=count,
            notes=spec.loaded_event if count > 0 else f"{spec.loaded_event}:0_ROWS_LOADED",
            error_summary="" if count > 0 else "MANUAL_INPUT_EMPTY_OR_INVALID",
        )
    )
    if count == 0:
        _validation(validation_rows, path, "", "WARNING", "", "file present but no valid rows loaded", "", "no rows merged")


def _is_header_only_csv(path: Path) -> bool:
    try:
        with path.open(newline="", encoding="utf-8") as handle:
            return next(csv.DictReader(handle), None) is None
    except OSError:
        return False


def _record_validation_summary(validation_rows: list[dict[str, object]], tracker: SourceTracker) -> None:
    invalid = [row for row in validation_rows if row.get("severity") in {"ERROR", "WARNING"}]
    if not invalid:
        return
    tracker.record_result(
        SourceResult(
            source_name=MANUAL_SOURCE,
            endpoint="manual input validation",
            success=False,
            retrieved_at=tracker.now(),
            record_count=len(invalid),
            notes="MANUAL_INPUT_INVALID_ROWS",
            error_summary="MANUAL_INPUT_INVALID_ROWS",
        )
    )
    tracker.record_gap(
        missing_source="MANUAL_INPUT_INVALID_ROWS",
        affected_artifact="04_pregame_refresh/manual_input_validation.csv",
        affected_games_players="manual input files",
        severity="MEDIUM" if any(row.get("severity") == "ERROR" for row in invalid) else "LOW",
        recommended_fix="Review manual_input_validation.csv and correct skipped or downgraded operator rows.",
        output_degraded=True,
    )


def _path_for_spec(spec: ManualInputSpec, repo_root: Path) -> Path:
    configured = os.getenv(spec.env_var)
    if configured:
        return Path(configured).expanduser()
    return Path(repo_root) / "data" / "manual" / spec.default_file


def _resolve_game(
    row: dict[str, str],
    games_by_id: dict[str, SlateGame],
    games_by_matchup: dict[tuple[str, str], SlateGame],
) -> SlateGame | None:
    if row.get("game_id") in games_by_id:
        return games_by_id[row["game_id"]]
    away = normalize_team_code(row.get("away_team", ""))
    home = normalize_team_code(row.get("home_team", ""))
    return games_by_matchup.get((away, home))


def _warn_unknown_game(
    row: dict[str, str],
    game: SlateGame | None,
    validation_rows: list[dict[str, object]],
    path: Path,
    row_number: int,
) -> None:
    if game is not None:
        return
    _validation(validation_rows, path, row_number, "WARNING", "game_id", "game did not match current slate", _row_summary(row), "row kept but may not affect gates")


def _price_and_probability(
    raw_price: object,
    validation_rows: list[dict[str, object]],
    path: Path,
    row_number: int,
    row: dict[str, str],
) -> tuple[int | float | None, float | None]:
    price = _parse_number(raw_price)
    implied = implied_probability_from_american(price)
    if str(raw_price or "").strip() and implied is None:
        _validation(validation_rows, path, row_number, "WARNING", "price", "invalid American odds; implied_probability left blank", _row_summary(row), "row kept unpriced")
        return None, None
    return price, implied


def _parse_number(value: object) -> int | float | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        number = float(raw)
    except ValueError:
        return None
    return int(number) if number.is_integer() else number


def _parse_bool(value: object) -> bool | None:
    raw = str(value or "").strip().lower()
    if raw in {"true", "1", "yes", "y"}:
        return True
    if raw in {"false", "0", "no", "n"}:
        return False
    return None


def _normalize_market(value: str) -> str:
    raw = _norm_token(value)
    aliases = {
        "hr": "home_run",
        "home_runs": "home_run",
        "2tb": "total_bases",
        "2_tb": "total_bases",
        "2+_tb": "total_bases",
        "hit": "hits",
        "rbis": "rbi",
        "run": "runs",
        "spreads": "run_line",
        "spread": "run_line",
        "totals": "total",
    }
    return aliases.get(raw, raw)


def _market_type(raw_market_type: str, market: str) -> str:
    market_type = _norm_token(raw_market_type)
    if market in {"home_run", "total_bases", "hits", "rbi", "runs"}:
        return f"player_{market}"
    if market == "moneyline":
        return "moneyline"
    if market == "run_line":
        return "spread"
    if market == "total":
        return "total"
    if market_type == "team" or market == "team_total":
        return "team_total"
    return market


def _availability_status(price: object, implied: object, last_updated: str, *, available: bool) -> str:
    if not available:
        return "unavailable"
    if price is None or implied is None:
        return "invalid_or_unpriced"
    if not str(last_updated or "").strip():
        return "stale"
    return "available"


def _prop_row_from_market(
    original: dict[str, str],
    market_row: dict[str, object],
    player_id: str,
    *,
    available: bool,
) -> dict[str, object]:
    return {
        "slate_date": market_row["slate_date"],
        "game_id": market_row["game_id"],
        "player_name": original.get("player_name", "") or market_row.get("player_or_team", ""),
        "player_id": player_id,
        "team": market_row.get("team", ""),
        "market": market_row["market"],
        "line": market_row["line"],
        "price": market_row["price"],
        "sportsbook": market_row["sportsbook"],
        "available": available and market_row.get("market_status") == "available",
        "implied_probability": market_row["implied_probability"],
        "last_updated": market_row["last_updated"],
        "source": MANUAL_SOURCE,
        "retrieved_at": market_row["retrieved_at"],
    }


def _manual_lineup_impact(status: str, configured: str) -> str:
    if configured == "kills_candidate" or status in {"out", "not_starting"}:
        return "RISK"
    if configured == "downgrades_candidate" or status in {"questionable", "unknown"}:
        return "CONDITIONAL"
    if configured == "no_impact" or status in {"probable", "available", "starting"}:
        return "CHECKED"
    return "UNVERIFIED"


def _manual_prop_impact(status: str, configured: str) -> str:
    if configured == "kills_candidate" or status in {"out", "not_starting"}:
        return "RISK"
    if configured == "downgrades_candidate" or status in {"questionable", "unknown"}:
        return "CONDITIONAL"
    if configured == "no_impact" or status in {"probable", "available", "starting"}:
        return "CHECKED"
    return "UNVERIFIED"


def _norm_token(value: object) -> str:
    return str(value or "").strip().lower().replace("-", "_").replace(" ", "_")


def _row_summary(row: dict[str, str]) -> str:
    parts = [
        row.get("game_id", ""),
        row.get("away_team", ""),
        row.get("home_team", ""),
        row.get("player_name", ""),
        row.get("team", ""),
        row.get("market", ""),
        row.get("status", ""),
    ]
    return " | ".join(part for part in parts if part)[:240]


def _validation(
    validation_rows: list[dict[str, object]],
    path: Path,
    row_number: int | str,
    severity: str,
    field: str,
    issue: str,
    row_summary: str,
    action_taken: str,
) -> None:
    validation_rows.append(
        {
            "input_file": str(path),
            "row_number": row_number,
            "severity": severity,
            "field": field,
            "issue": issue,
            "row_summary": row_summary,
            "action_taken": action_taken,
        }
    )
