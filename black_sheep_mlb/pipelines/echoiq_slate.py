"""EchoIQ slate report layer over the no-odds-first daily pipeline.

This module intentionally keeps raw prediction output separate from betting
value. It does not call paid odds providers by default and does not invent
missing prop, weather, lineup, Ballpark Pal, or market data.
"""
from __future__ import annotations

import csv
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from black_sheep_mlb.data_sources.manual_csv_odds_provider import ManualCSVOddsProvider
from black_sheep_mlb.data_sources.mlb_stats_client import MLBGame, MLBStatsClient
from black_sheep_mlb.data_sources.odds_provider import GameOdds, OddsProvider
from black_sheep_mlb.pipelines.build_daily_slate import build_daily_slate
from black_sheep_mlb.pipelines.enrich_matchups import enrich_matchups
from black_sheep_mlb.pipelines.market_overlay import american_to_prob, remove_vig_two_way
from black_sheep_mlb.pipelines.run_daily_predictions import apply_market_overlay, generate_predictions
from models.game_model import prob_to_american

RECOMMENDATION_LABELS = [
    "RAW_TOP",
    "STRONG_MATCHUP",
    "GOOD_VALUE",
    "LIKELY_OVERPRICED",
    "WATCHLIST",
    "LOTTERY",
    "CONDITIONAL",
    "PASS_PRICE",
    "PASS_UNCERTAINTY",
    "AVOID",
]

GAME_PROJECTION_COLUMNS = [
    "game_id",
    "date",
    "game",
    "away_team",
    "home_team",
    "venue",
    "first_pitch_time",
    "game_status",
    "away_starter",
    "home_starter",
    "starter_status",
    "lineup_status",
    "weather_status",
    "odds_status",
    "away_projected_runs",
    "home_projected_runs",
    "projected_total",
    "away_win_probability",
    "home_win_probability",
    "fair_moneyline_away",
    "fair_moneyline_home",
    "score_range",
    "first_five_projection",
    "raw_prediction_confidence",
    "betting_value_confidence",
    "recommended_action",
    "missing_data_flags",
]

RAW_WINNER_COLUMNS = [
    "rank",
    "game_id",
    "game",
    "team",
    "opponent",
    "side",
    "raw_probability",
    "fair_price",
    "raw_prediction_score",
    "stat_support",
    "pitch_type_support",
    "environment_support",
    "role_volume_support",
    "risk_flags",
    "market_value",
    "final_recommendation",
]

RAW_TOTAL_COLUMNS = [
    "rank",
    "game_id",
    "game",
    "projected_total",
    "raw_total_confidence",
    "environment_support",
    "market_total",
    "market_edge",
    "recommendation",
    "risk_flags",
]

BATTER_PROP_COLUMNS = [
    "rank",
    "player",
    "team",
    "game",
    "prop_type",
    "line",
    "lineup_spot",
    "opposing_pitcher",
    "handedness_matchup",
    "pitch_type_edge",
    "statcast_support",
    "recent_form",
    "ballpark_weather_support",
    "raw_probability",
    "fair_price",
    "current_price",
    "edge",
    "raw_confidence",
    "betting_confidence",
    "recommendation",
    "reason",
    "risk_flags",
]

HR_COLUMNS = [
    "rank",
    "player",
    "team",
    "game",
    "lineup_spot",
    "opposing_pitcher",
    "hr_probability",
    "fair_odds",
    "current_odds",
    "pitch_type_edge",
    "barrel_support",
    "hard_hit_support",
    "pull_flyball_profile",
    "ballpark_pal_hr_factor",
    "weather_park_support",
    "bullpen_hr_risk",
    "raw_hr_confidence",
    "value_confidence",
    "recommendation",
]

PITCHER_PROP_COLUMNS = [
    "rank",
    "pitcher",
    "team",
    "game",
    "prop_type",
    "projected_stat",
    "line",
    "raw_probability",
    "fair_price",
    "current_price",
    "edge",
    "raw_confidence",
    "betting_confidence",
    "recommendation",
    "reason",
    "risk_flags",
]

BETTING_VALUE_COLUMNS = [
    "rank",
    "game_id",
    "game",
    "market_type",
    "team_or_player",
    "side",
    "sportsbook",
    "consensus_price",
    "best_price",
    "opening_price",
    "current_price",
    "line",
    "implied_probability",
    "no_vig_probability",
    "model_probability",
    "fair_price",
    "edge",
    "playable_price",
    "pass_price",
    "market_status",
    "raw_prediction_label",
    "value_label",
    "final_recommendation",
    "risk_flags",
]

SOURCE_LOG_COLUMNS = [
    "data_type",
    "source",
    "source_url",
    "timestamp",
    "confidence",
    "rows_used",
    "notes",
]

UNRESOLVED_GAPS_COLUMNS = [
    "game",
    "missing_data_type",
    "impact",
    "severity",
    "recommendation",
]

FINAL_CARD_COLUMNS = [
    "rank",
    "market_type",
    "selection",
    "game",
    "current_price",
    "line",
    "model_probability",
    "edge",
    "recommendation",
    "unit_size",
    "reason",
    "risk_flags",
]

OUTPUT_FILES = {
    "report": "echoiq_mlb_slate_report.md",
    "json": "echoiq_mlb_slate.json",
    "game_projections": "game_projections.csv",
    "raw_winner_board": "raw_winner_board.csv",
    "raw_total_board": "raw_total_board.csv",
    "total_bases_board": "total_bases_board.csv",
    "hr_board": "hr_board.csv",
    "pitcher_prop_board": "pitcher_prop_board.csv",
    "betting_value_board": "betting_value_board.csv",
    "final_betting_card": "final_betting_card.csv",
    "late_checklist": "late_verification_checklist.md",
    "source_log": "source_log.csv",
    "unresolved_gaps": "unresolved_gaps.csv",
}

MANUAL_SCHEMAS = {
    "odds": {
        "required_any": [("game_id",), ("away_team", "home_team")],
        "required": ["date", "market_type"],
        "expected": [
            "date",
            "game_id",
            "away_team",
            "home_team",
            "selection",
            "market_type",
            "sportsbook",
            "consensus_price",
            "best_price",
            "opening_price",
            "current_price",
            "line",
            "model_probability",
            "raw_probability",
            "fair_price",
            "edge",
            "playable_price",
            "pass_price",
            "recommendation",
            "timestamp",
            "source",
            "source_url",
            "confidence",
        ],
    },
    "props": {
        "required_any": [("game_id",), ("away_team", "home_team")],
        "required": ["date", "player", "team", "prop_type"],
        "expected": [
            "date",
            "game_id",
            "away_team",
            "home_team",
            "player",
            "team",
            "opponent",
            "prop_type",
            "line",
            "over_price",
            "under_price",
            "sportsbook",
            "consensus_price",
            "best_price",
            "raw_probability",
            "fair_price",
            "reason",
            "recommendation",
            "timestamp",
            "source",
            "source_url",
            "confidence",
        ],
    },
    "weather": {
        "required_any": [("game_id",), ("venue",), ("away_team", "home_team")],
        "required": ["date"],
        "expected": [
            "date",
            "game_id",
            "away_team",
            "home_team",
            "venue",
            "temperature",
            "wind_speed",
            "wind_direction",
            "wind_effect",
            "humidity",
            "dew_point",
            "precipitation_risk",
            "roof_status",
            "delay_risk",
            "timestamp",
            "source",
            "source_url",
            "confidence",
        ],
    },
    "ballpark": {
        "required_any": [("game_id",), ("venue",), ("away_team", "home_team")],
        "required": ["date"],
        "expected": [
            "date",
            "game_id",
            "away_team",
            "home_team",
            "venue",
            "run_factor",
            "hr_factor",
            "weather_factor",
            "air_density",
            "carry_grade",
            "rh_hr_factor",
            "lh_hr_factor",
            "notes",
            "timestamp",
            "source",
            "source_url",
            "confidence",
        ],
    },
    "lineups": {
        "required_any": [("game_id",), ("away_team", "home_team")],
        "required": ["date", "team", "player", "batting_order", "lineup_status"],
        "expected": [
            "date",
            "game_id",
            "away_team",
            "home_team",
            "team",
            "player",
            "batting_order",
            "position",
            "handedness",
            "lineup_status",
            "timestamp",
            "source",
            "source_url",
            "confidence",
        ],
    },
}


@dataclass
class ManualInputs:
    odds: list[dict[str, Any]]
    props: list[dict[str, Any]]
    weather: list[dict[str, Any]]
    ballpark: list[dict[str, Any]]
    lineups: list[dict[str, Any]]
    source_notes: list[dict[str, Any]]

PROFILE_SCHEMAS = {
    "GameVerification": [
        "game_id",
        "date",
        "away_team",
        "home_team",
        "venue",
        "first_pitch_time",
        "game_status",
        "away_starter",
        "home_starter",
        "starter_status",
        "lineup_status",
        "weather_status",
        "odds_status",
        "source_confidence",
        "last_checked",
    ],
    "PitcherProfile": [
        "pitcher_id",
        "name",
        "team",
        "handedness",
        "ERA",
        "FIP",
        "xFIP",
        "SIERA",
        "WHIP",
        "K_pct",
        "BB_pct",
        "K_minus_BB_pct",
        "HR_per_9",
        "GB_pct",
        "FB_pct",
        "IP",
        "recent_starts",
        "pitch_count_trend",
        "rest_days",
        "velocity_trend",
        "pitch_mix",
        "whiff_rate",
        "chase_rate",
        "CSW",
        "hard_hit_allowed",
        "barrel_allowed",
        "avg_exit_velo_allowed",
        "xERA",
        "xBA",
        "xSLG",
        "xwOBA",
        "platoon_splits",
        "times_through_order_risk",
        "injury_workload_notes",
    ],
    "TeamOffenseProfile": [
        "team",
        "runs_per_game",
        "OPS",
        "wOBA",
        "wRC_plus",
        "ISO",
        "K_pct",
        "BB_pct",
        "hard_hit_pct",
        "barrel_pct",
        "xwOBA",
        "last_7",
        "last_14",
        "last_30",
        "split_vs_hand",
        "home_road_split",
        "injuries",
        "lineup_depth_score",
        "hot_hitters",
        "cold_hitters",
    ],
    "EnvironmentProfile": [
        "venue",
        "roof_status",
        "temperature",
        "wind_speed",
        "wind_direction",
        "wind_effect",
        "humidity",
        "dew_point",
        "precip_risk",
        "delay_risk",
        "ballpark_pal_run_factor",
        "ballpark_pal_hr_factor",
        "ballpark_pal_weather_factor",
        "park_run_factor",
        "park_hr_factor",
        "handedness_hr_factor",
        "run_environment_grade",
        "hr_environment_grade",
        "total_impact",
    ],
    "BullpenProfile": [
        "team",
        "ERA",
        "FIP",
        "xFIP",
        "WHIP",
        "K_pct",
        "BB_pct",
        "HR_per_9",
        "last_7_performance",
        "last_game_usage",
        "last_2_days_usage",
        "last_3_days_usage",
        "high_leverage_available",
        "high_leverage_unavailable",
        "closer_status",
        "fatigue_score",
        "reliability_score",
    ],
    "MarketProfile": [
        "game",
        "market_type",
        "sportsbook",
        "consensus_price",
        "best_price",
        "opening_price",
        "current_price",
        "line",
        "implied_probability",
        "no_vig_probability",
        "model_probability",
        "fair_price",
        "edge",
        "playable_price",
        "pass_price",
    ],
    "PredictionOutput": GAME_PROJECTION_COLUMNS,
    "BatterPropCandidate": BATTER_PROP_COLUMNS,
    "HRCandidate": HR_COLUMNS,
}


def run_echoiq_slate(
    *,
    date: str,
    output_dir: Path,
    mode: str = "full",
    away: str | None = None,
    home: str | None = None,
    mlb_client: MLBStatsClient | None = None,
    odds_provider: OddsProvider | None = None,
    odds_provider_name: str = "none",
    manual_odds_csv: Path | None = None,
    manual_props_csv: Path | None = None,
    manual_weather_csv: Path | None = None,
    manual_ballpark_csv: Path | None = None,
    manual_lineups_csv: Path | None = None,
    manual_inputs_json: Path | None = None,
    enrichment_client: Any | None = None,
) -> dict[str, Any]:
    """Build EchoIQ slate outputs for a date.

    ``odds_provider_name`` defaults to ``none`` so this command is safe in a
    no-paid-API run. Pass ``manual`` plus a local CSV to add market value rows.
    """
    if mode != "full":
        raise ValueError("EchoIQ currently supports mode='full'")

    games = build_daily_slate(date, mlb_client)
    games = _filter_games(games, away=away, home=home)
    manual_inputs = load_manual_inputs(
        date=date,
        odds_csv=manual_odds_csv,
        props_csv=manual_props_csv,
        weather_csv=manual_weather_csv,
        ballpark_csv=manual_ballpark_csv,
        lineups_csv=manual_lineups_csv,
        inputs_json=manual_inputs_json,
    )
    enriched = enrich_matchups(games, date, enrichment_client)
    predictions = generate_predictions(enriched)
    odds = _load_odds(
        date=date,
        provider=odds_provider,
        provider_name=odds_provider_name,
        manual_odds_csv=manual_odds_csv,
    )
    overlay = apply_market_overlay(predictions, odds)

    game_verification = [_game_verification(game, odds, manual_inputs) for game in games]
    environment_board = [_environment_profile(item, manual_inputs) for item in game_verification]
    game_projections = [_game_projection(pred, game_verification) for pred in predictions]
    raw_winner_board = _raw_winner_board(predictions, environment_board)
    raw_total_board = _raw_total_board(predictions, manual_inputs, environment_board)
    total_bases_board = _total_bases_board(manual_inputs, game_verification, environment_board)
    hr_board = _hr_board(manual_inputs, game_verification, environment_board)
    pitcher_prop_board = _pitcher_prop_board(manual_inputs, game_verification, environment_board)
    betting_value_board = _betting_value_board(overlay, manual_inputs, total_bases_board, hr_board, pitcher_prop_board)
    unresolved_gaps = _unresolved_gaps(game_verification, total_bases_board, hr_board, pitcher_prop_board, manual_inputs)
    final_betting_card = _final_betting_card(betting_value_board, unresolved_gaps)
    source_log = _source_log(manual_inputs)
    missing_notes = _missing_notes(
        game_projections,
        total_bases_board,
        hr_board,
        pitcher_prop_board,
        odds,
        manual_inputs,
    )

    payload = {
        "metadata": {
            "date": date,
            "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "mode": mode,
            "game_filter": {"away": away, "home": home},
            "source_policy": "free MLB schedule plus optional manual odds only; missing fields are explicit",
            "odds_provider": odds_provider_name,
            "manual_inputs_used": {
                "odds": bool(manual_inputs.odds),
                "props": bool(manual_inputs.props),
                "weather": bool(manual_inputs.weather),
                "ballpark_pal": bool(manual_inputs.ballpark),
                "lineups": bool(manual_inputs.lineups),
            },
        },
        "recommendation_labels": RECOMMENDATION_LABELS,
        "schemas": PROFILE_SCHEMAS,
        "scoring_weights": _scoring_weights(),
        "environment_implementation": {
            "status": "partial",
            "venue_source": "MLB Stats API schedule",
            "weather_source": "unavailable in this no-paid safe EchoIQ layer",
            "ballpark_pal_source": "unavailable; factors are not inferred",
        },
        "game_verification": game_verification,
        "environment_board": environment_board,
        "game_projections": game_projections,
        "raw_winner_board": raw_winner_board,
        "raw_total_board": raw_total_board,
        "total_bases_board": total_bases_board,
        "hr_board": hr_board,
        "pitcher_prop_board": pitcher_prop_board,
        "betting_value_board": betting_value_board,
        "final_betting_card": final_betting_card,
        "source_log": source_log,
        "unresolved_gaps": unresolved_gaps,
        "missing_data_notes": missing_notes,
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    _write_csv(output_dir / OUTPUT_FILES["game_projections"], game_projections, GAME_PROJECTION_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["raw_winner_board"], raw_winner_board, RAW_WINNER_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["raw_total_board"], raw_total_board, RAW_TOTAL_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["total_bases_board"], total_bases_board, BATTER_PROP_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["hr_board"], hr_board, HR_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["pitcher_prop_board"], pitcher_prop_board, PITCHER_PROP_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["betting_value_board"], betting_value_board, BETTING_VALUE_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["final_betting_card"], final_betting_card, FINAL_CARD_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["source_log"], source_log, SOURCE_LOG_COLUMNS)
    _write_csv(output_dir / OUTPUT_FILES["unresolved_gaps"], unresolved_gaps, UNRESOLVED_GAPS_COLUMNS)
    (output_dir / OUTPUT_FILES["json"]).write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
    (output_dir / OUTPUT_FILES["late_checklist"]).write_text(_render_late_checklist(payload), encoding="utf-8")
    (output_dir / OUTPUT_FILES["report"]).write_text(_render_report(payload), encoding="utf-8")

    return {
        "date": date,
        "number_of_games": len(games),
        "output_dir": str(output_dir),
        "output_file_paths": {key: str(output_dir / name) for key, name in OUTPUT_FILES.items()},
        "missing_data_notes": missing_notes,
    }


def _filter_games(games: list[MLBGame], *, away: str | None, home: str | None) -> list[MLBGame]:
    if away is None and home is None:
        return games
    away_norm = _norm(away)
    home_norm = _norm(home)
    return [
        game
        for game in games
        if (away_norm is None or _norm(game.away_team) == away_norm)
        and (home_norm is None or _norm(game.home_team) == home_norm)
    ]


def load_manual_inputs(
    *,
    date: str,
    odds_csv: Path | None = None,
    props_csv: Path | None = None,
    weather_csv: Path | None = None,
    ballpark_csv: Path | None = None,
    lineups_csv: Path | None = None,
    inputs_json: Path | None = None,
) -> ManualInputs:
    csv_rows = {
        "odds": _read_manual_csv("odds", odds_csv, date),
        "props": _read_manual_csv("props", props_csv, date),
        "weather": _read_manual_csv("weather", weather_csv, date),
        "ballpark": _read_manual_csv("ballpark", ballpark_csv, date),
        "lineups": _read_manual_csv("lineups", lineups_csv, date),
    }
    json_rows: dict[str, list[dict[str, Any]]] = {}
    source_notes: list[dict[str, Any]] = []
    if inputs_json is not None:
        if inputs_json.exists():
            raw = json.loads(inputs_json.read_text(encoding="utf-8"))
            for key, data_type in (
                ("odds", "odds"),
                ("props", "props"),
                ("weather", "weather"),
                ("ballpark_pal", "ballpark"),
                ("ballpark", "ballpark"),
                ("lineups", "lineups"),
            ):
                if key not in raw:
                    continue
                rows = raw.get(key) or []
                if not isinstance(rows, list):
                    raise ValueError(f"manual JSON field '{key}' must be a list of row objects")
                normalized = [_normalize_manual_row(row) for row in rows if _normalize_manual_row(row).get("date") in {"", date}]
                _validate_manual_rows(data_type, normalized, f"{inputs_json}:{key}")
                json_rows[data_type] = normalized
            source_notes.append(
                {
                    "data_type": "manual_inputs_json",
                    "source": str(inputs_json),
                    "source_url": "",
                    "timestamp": "",
                    "confidence": "",
                    "rows_used": sum(len(rows) for rows in json_rows.values()),
                    "notes": "JSON manual inputs loaded as primary source for included data types.",
                }
            )
        else:
            source_notes.append(
                {
                    "data_type": "manual_inputs_json",
                    "source": str(inputs_json),
                    "source_url": "",
                    "timestamp": "",
                    "confidence": "",
                    "rows_used": 0,
                    "notes": "Optional manual JSON file not found; skipped.",
                }
            )
    rows_by_type = {
        data_type: json_rows.get(data_type, rows)
        for data_type, rows in csv_rows.items()
    }
    rows_by_type["source_notes"] = source_notes
    return ManualInputs(**rows_by_type)


def _read_manual_csv(data_type: str, path: Path | None, date: str) -> list[dict[str, Any]]:
    if path is None:
        return []
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames or []
        _validate_manual_columns(data_type, fieldnames, str(path))
        rows = [_normalize_manual_row(row) for row in reader]
    filtered = [row for row in rows if row.get("date") in {"", date}]
    _validate_manual_rows(data_type, filtered, str(path))
    return filtered


def _normalize_manual_row(row: dict[str, Any]) -> dict[str, Any]:
    return {str(key).strip(): "" if value is None else str(value).strip() for key, value in row.items()}


def _validate_manual_rows(data_type: str, rows: list[dict[str, Any]], source: str) -> None:
    if not rows:
        return
    columns = sorted({key for row in rows for key in row})
    _validate_manual_columns(data_type, columns, source)


def _validate_manual_columns(data_type: str, columns: list[str], source: str) -> None:
    schema = MANUAL_SCHEMAS[data_type]
    column_set = set(columns)
    missing = [col for col in schema["required"] if col not in column_set]
    if missing:
        raise ValueError(f"{source} missing required {data_type} columns: {', '.join(missing)}")
    if not any(all(col in column_set for col in option) for option in schema["required_any"]):
        choices = ["+".join(option) for option in schema["required_any"]]
        raise ValueError(f"{source} missing required {data_type} game identifier columns: one of {', '.join(choices)}")


def _load_odds(
    *,
    date: str,
    provider: OddsProvider | None,
    provider_name: str,
    manual_odds_csv: Path | None,
) -> list[GameOdds]:
    if provider is not None:
        return provider.get_game_odds(date, ["h2h", "spreads", "totals"])
    if provider_name == "manual":
        path = manual_odds_csv or Path("data/manual/odds_snapshot.csv")
        if not path.exists():
            return []
        return ManualCSVOddsProvider(path).get_game_odds(date, ["h2h", "spreads", "totals"])
    return []


def _game_verification(game: MLBGame, odds: list[GameOdds], manual_inputs: ManualInputs) -> dict[str, Any]:
    starter_status = "probable" if game.away_probable_pitcher and game.home_probable_pitcher else "missing"
    matched_odds = any(_odds_match_game(game, item) for item in odds)
    manual_odds = _manual_rows_for_game(manual_inputs.odds, game)
    manual_weather = _manual_rows_for_game(manual_inputs.weather, game)
    manual_ballpark = _manual_rows_for_game(manual_inputs.ballpark, game)
    manual_lineups = _manual_rows_for_game(manual_inputs.lineups, game)
    lineup_status = _lineup_status(manual_lineups)
    weather_status = "manual" if manual_weather else "unavailable"
    ballpark_status = "manual" if manual_ballpark else "unavailable"
    missing = []
    if starter_status == "missing":
        missing.append("probable_starter")
    if lineup_status == "unavailable":
        missing.append("confirmed_lineups")
    if weather_status == "unavailable":
        missing.append("weather")
    if ballpark_status == "unavailable":
        missing.append("ballpark_pal")
    if not _manual_rows_for_game(manual_inputs.props, game):
        missing.append("prop_markets")
    if not matched_odds and not manual_odds:
        missing.append("odds")
    confidence = _combined_confidence([*manual_odds, *manual_weather, *manual_ballpark, *manual_lineups])
    return {
        "game_id": game.game_pk,
        "date": game.game_date,
        "away_team": game.away_team,
        "home_team": game.home_team,
        "venue": getattr(game, "venue", None) or "unavailable",
        "first_pitch_time": game.game_datetime or "unavailable",
        "game_status": game.status or "unavailable",
        "away_starter": game.away_probable_pitcher or "unavailable",
        "home_starter": game.home_probable_pitcher or "unavailable",
        "starter_status": starter_status,
        "lineup_status": lineup_status,
        "weather_status": weather_status,
        "ballpark_pal_status": ballpark_status,
        "odds_status": "available" if matched_odds or manual_odds else "unavailable",
        "source_confidence": confidence if confidence != "unavailable" else ("Low" if missing else "Medium"),
        "last_checked": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "missing_data_flags": ",".join(missing),
    }


def _environment_profile(verification: dict[str, Any], manual_inputs: ManualInputs) -> dict[str, Any]:
    weather = _first_manual_match(manual_inputs.weather, verification)
    ballpark = _first_manual_match(manual_inputs.ballpark, verification)
    run_factor = _parse_float((ballpark or {}).get("run_factor"))
    hr_factor = _parse_float((ballpark or {}).get("hr_factor"))
    weather_factor = _parse_float((ballpark or {}).get("weather_factor"))
    wind_effect = (weather or {}).get("wind_effect", "")
    temp = _parse_float((weather or {}).get("temperature"))
    run_grade = _environment_grade(run_factor, weather_factor, wind_effect, temp, kind="run")
    hr_grade = _environment_grade(hr_factor, weather_factor, wind_effect, temp, kind="hr")
    return {
        "game_id": verification["game_id"],
        "game": f"{verification['away_team']}@{verification['home_team']}",
        "venue": verification.get("venue", "unavailable"),
        "roof_status": (weather or {}).get("roof_status") or "unavailable",
        "temperature": (weather or {}).get("temperature") or "unavailable",
        "wind_speed": (weather or {}).get("wind_speed") or "unavailable",
        "wind_direction": (weather or {}).get("wind_direction") or "unavailable",
        "wind_effect": wind_effect or "unavailable",
        "humidity": (weather or {}).get("humidity") or "unavailable",
        "dew_point": (weather or {}).get("dew_point") or "unavailable",
        "precip_risk": (weather or {}).get("precipitation_risk") or "unavailable",
        "delay_risk": (weather or {}).get("delay_risk") or "unavailable",
        "ballpark_pal_run_factor": (ballpark or {}).get("run_factor") or "unavailable",
        "ballpark_pal_hr_factor": (ballpark or {}).get("hr_factor") or "unavailable",
        "ballpark_pal_weather_factor": (ballpark or {}).get("weather_factor") or "unavailable",
        "park_run_factor": (ballpark or {}).get("run_factor") or "unavailable",
        "park_hr_factor": (ballpark or {}).get("hr_factor") or "unavailable",
        "handedness_hr_factor": _handedness_factor(ballpark),
        "run_environment_grade": run_grade,
        "hr_environment_grade": hr_grade,
        "total_impact": _total_impact(run_grade, hr_grade),
        "environment_notes": _environment_notes(weather, ballpark),
        "source_confidence": _combined_confidence([row for row in (weather, ballpark) if row]),
    }


def _game_projection(pred: dict[str, Any], verifications: list[dict[str, Any]]) -> dict[str, Any]:
    game_id = int(pred["game_pk"])
    verification = next((item for item in verifications if int(item["game_id"]) == game_id), {})
    away_prob = float(pred.get("model_away_win_prob") or 0.5)
    home_prob = float(pred.get("model_home_win_prob") or 0.5)
    missing = pred.get("missing_data_flags") or verification.get("missing_data_flags") or ""
    return {
        "game_id": game_id,
        "date": pred.get("game_date"),
        "game": _game_label(pred),
        "away_team": pred.get("away_team"),
        "home_team": pred.get("home_team"),
        "venue": verification.get("venue", "unavailable"),
        "first_pitch_time": pred.get("game_datetime") or verification.get("first_pitch_time", "unavailable"),
        "game_status": verification.get("game_status", "unavailable"),
        "away_starter": pred.get("away_probable_pitcher") or "unavailable",
        "home_starter": pred.get("home_probable_pitcher") or "unavailable",
        "starter_status": verification.get("starter_status", "missing"),
        "lineup_status": verification.get("lineup_status", "unavailable"),
        "weather_status": verification.get("weather_status", "unavailable"),
        "odds_status": verification.get("odds_status", "unavailable"),
        "away_projected_runs": "unavailable",
        "home_projected_runs": "unavailable",
        "projected_total": "unavailable",
        "away_win_probability": round(away_prob, 4),
        "home_win_probability": round(home_prob, 4),
        "fair_moneyline_away": prob_to_american(away_prob),
        "fair_moneyline_home": prob_to_american(home_prob),
        "score_range": "unavailable",
        "first_five_projection": "unavailable",
        "raw_prediction_confidence": pred.get("confidence", "Low"),
        "betting_value_confidence": "Unavailable",
        "recommended_action": "PASS_UNCERTAINTY" if missing else "WATCHLIST",
        "missing_data_flags": missing,
    }


def _raw_winner_board(predictions: list[dict[str, Any]], environment_board: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for pred in predictions:
        for side in ("away", "home"):
            prob = float(pred.get(f"model_{side}_win_prob") or 0.5)
            missing = str(pred.get("missing_data_flags") or "")
            rows.append(
                {
                    "game_id": pred["game_pk"],
                    "game": _game_label(pred),
                    "team": pred[f"{side}_team"],
                    "opponent": pred["home_team"] if side == "away" else pred["away_team"],
                    "side": side,
                    "raw_probability": round(prob, 4),
                    "fair_price": prob_to_american(prob),
                    "raw_prediction_score": round(prob * 100, 2),
                    "stat_support": "unavailable",
                    "pitch_type_support": "unavailable",
                    "environment_support": _environment_support(_environment_for_game(environment_board, _game_label(pred))),
                    "role_volume_support": "unavailable",
                    "risk_flags": missing,
                    "market_value": "not_evaluated",
                    "final_recommendation": "PASS_UNCERTAINTY" if missing else "RAW_TOP",
                }
            )
    rows.sort(key=lambda row: float(row["raw_probability"]), reverse=True)
    return _rank(rows)


def _raw_total_board(
    predictions: list[dict[str, Any]],
    manual_inputs: ManualInputs,
    environment_board: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    rows = [
        {
            "game_id": pred["game_pk"],
            "game": _game_label(pred),
            "projected_total": "unavailable",
            "raw_total_confidence": _confidence_from_environment(_environment_for_game(environment_board, _game_label(pred))),
            "environment_support": _environment_support(_environment_for_game(environment_board, _game_label(pred))),
            "market_total": _market_total_for_game(manual_inputs.odds, pred),
            "market_edge": "",
            "recommendation": "WATCHLIST" if _market_total_for_game(manual_inputs.odds, pred) != "unavailable" else "PASS_UNCERTAINTY",
            "risk_flags": pred.get("missing_data_flags", ""),
        }
        for pred in predictions
    ]
    return _rank(rows)


def _total_bases_board(
    manual_inputs: ManualInputs,
    verifications: list[dict[str, Any]],
    environment_board: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for prop in manual_inputs.props:
        if _norm(prop.get("prop_type")) != "total_bases":
            continue
        game = _game_for_manual_row(prop, verifications)
        env = _environment_for_game(environment_board, game)
        raw_probability = _parse_float(prop.get("raw_probability"))
        current_price = _best_prop_price(prop)
        edge = _edge_from_price(raw_probability, current_price, prop.get("under_price"))
        rows.append(
            {
                "player": prop.get("player", ""),
                "team": prop.get("team", ""),
                "game": game,
                "prop_type": "total_bases",
                "line": prop.get("line", ""),
                "lineup_spot": _lineup_spot(prop, manual_inputs),
                "opposing_pitcher": prop.get("opposing_pitcher", "unavailable"),
                "handedness_matchup": prop.get("handedness_matchup", "unavailable"),
                "pitch_type_edge": prop.get("pitch_type_edge", "unavailable"),
                "statcast_support": prop.get("statcast_support", "manual/unavailable"),
                "recent_form": prop.get("recent_form", "unavailable"),
                "ballpark_weather_support": _environment_support(env),
                "raw_probability": _round_or_blank(raw_probability),
                "fair_price": prop.get("fair_price") or (prob_to_american(raw_probability) if raw_probability else ""),
                "current_price": current_price if current_price is not None else "",
                "edge": _round_or_blank(edge),
                "raw_confidence": _raw_prop_confidence(raw_probability, prop, env),
                "betting_confidence": _betting_confidence(edge, prop),
                "recommendation": _prop_recommendation(raw_probability, edge, prop, default_raw="STRONG_MATCHUP"),
                "reason": _prop_reason(prop, edge, env),
                "risk_flags": _prop_risk_flags(prop, env),
            }
        )
    rows.sort(key=lambda row: float(row["raw_probability"] or 0), reverse=True)
    return _rank(rows)


def _hr_board(
    manual_inputs: ManualInputs,
    verifications: list[dict[str, Any]],
    environment_board: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for prop in manual_inputs.props:
        if _norm(prop.get("prop_type")) not in {"home_runs", "home_run"}:
            continue
        game = _game_for_manual_row(prop, verifications)
        env = _environment_for_game(environment_board, game)
        raw_probability = _parse_float(prop.get("raw_probability"))
        current_price = _best_prop_price(prop)
        edge = _edge_from_price(raw_probability, current_price, prop.get("under_price"))
        rows.append(
            {
                "player": prop.get("player", ""),
                "team": prop.get("team", ""),
                "game": game,
                "lineup_spot": _lineup_spot(prop, manual_inputs),
                "opposing_pitcher": prop.get("opposing_pitcher", "unavailable"),
                "hr_probability": _round_or_blank(raw_probability),
                "fair_odds": prop.get("fair_price") or (prob_to_american(raw_probability) if raw_probability else ""),
                "current_odds": current_price if current_price is not None else "",
                "pitch_type_edge": prop.get("pitch_type_edge", "unavailable"),
                "barrel_support": prop.get("barrel_support", prop.get("statcast_support", "unavailable")),
                "hard_hit_support": prop.get("hard_hit_support", "unavailable"),
                "pull_flyball_profile": prop.get("pull_flyball_profile", "unavailable"),
                "ballpark_pal_hr_factor": env.get("ballpark_pal_hr_factor", "unavailable"),
                "weather_park_support": _environment_support(env),
                "bullpen_hr_risk": prop.get("bullpen_hr_risk", "unavailable"),
                "raw_hr_confidence": _raw_prop_confidence(raw_probability, prop, env),
                "value_confidence": _betting_confidence(edge, prop),
                "recommendation": _prop_recommendation(raw_probability, edge, prop, default_raw="LOTTERY"),
            }
        )
    rows.sort(key=lambda row: float(row["hr_probability"] or 0), reverse=True)
    return _rank(rows)


def _pitcher_prop_board(
    manual_inputs: ManualInputs,
    verifications: list[dict[str, Any]],
    environment_board: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    pitcher_types = {
        "strikeouts",
        "pitcher_strikeouts",
        "pitcher_outs",
        "pitcher_earned_runs",
        "pitcher_hits_allowed",
        "pitcher_walks_allowed",
    }
    rows: list[dict[str, Any]] = []
    for prop in manual_inputs.props:
        prop_type = _norm(prop.get("prop_type"))
        if prop_type not in pitcher_types:
            continue
        game = _game_for_manual_row(prop, verifications)
        env = _environment_for_game(environment_board, game)
        raw_probability = _parse_float(prop.get("raw_probability"))
        current_price = _best_prop_price(prop)
        edge = _edge_from_price(raw_probability, current_price, prop.get("under_price"))
        rows.append(
            {
                "pitcher": prop.get("player", ""),
                "team": prop.get("team", ""),
                "game": game,
                "prop_type": prop.get("prop_type", ""),
                "projected_stat": prop.get("projected_stat", "unavailable"),
                "line": prop.get("line", ""),
                "raw_probability": _round_or_blank(raw_probability),
                "fair_price": prop.get("fair_price") or (prob_to_american(raw_probability) if raw_probability else ""),
                "current_price": current_price if current_price is not None else "",
                "edge": _round_or_blank(edge),
                "raw_confidence": _raw_prop_confidence(raw_probability, prop, env),
                "betting_confidence": _betting_confidence(edge, prop),
                "recommendation": _prop_recommendation(raw_probability, edge, prop, default_raw="WATCHLIST"),
                "reason": _prop_reason(prop, edge, env),
                "risk_flags": _prop_risk_flags(prop, env),
            }
        )
    rows.sort(key=lambda row: float(row["raw_probability"] or 0), reverse=True)
    return _rank(rows)


def _betting_value_board(
    overlay: list[dict[str, Any]],
    manual_inputs: ManualInputs,
    tb_rows: list[dict[str, Any]],
    hr_rows: list[dict[str, Any]],
    pitcher_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in overlay:
        edge = row.get("edge")
        model_prob = row.get("model_prob")
        value_label = _value_label(edge, model_prob)
        market_status = "available" if row.get("odds_available") else "unavailable"
        rows.append(
            {
                "game_id": row["game_pk"],
                "game": f"{row['team']} vs {row['opponent']}",
                "market_type": "moneyline",
                "team_or_player": row["team"],
                "side": row["side"],
                "sportsbook": row.get("best_book") or "unavailable",
                "consensus_price": "",
                "best_price": row.get("best_price") if row.get("best_price") is not None else "",
                "opening_price": "",
                "current_price": row.get("best_price") if row.get("best_price") is not None else "",
                "line": "",
                "implied_probability": _round_or_blank(row.get("market_prob")),
                "no_vig_probability": _round_or_blank(row.get("no_vig_prob")),
                "model_probability": _round_or_blank(model_prob),
                "fair_price": prob_to_american(float(model_prob)) if model_prob is not None else "",
                "edge": _round_or_blank(edge),
                "playable_price": "",
                "pass_price": "",
                "market_status": market_status,
                "raw_prediction_label": _raw_label(model_prob),
                "value_label": value_label,
                "final_recommendation": value_label,
                "risk_flags": "" if market_status == "available" else "odds_unavailable",
            }
        )
    rows.extend(_manual_odds_value_rows(manual_inputs.odds))
    rows.extend(_manual_prop_value_rows(tb_rows, "total_bases"))
    rows.extend(_manual_prop_value_rows(hr_rows, "home_runs"))
    rows.extend(_manual_prop_value_rows(pitcher_rows, "pitcher_prop"))
    rows.sort(key=lambda item: float(item["edge"]) if item["edge"] != "" else -999.0, reverse=True)
    return _rank(rows)


def _final_betting_card(value_rows: list[dict[str, Any]], unresolved_gaps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    critical_games = {
        row["game"]
        for row in unresolved_gaps
        if row.get("severity") == "critical" and row.get("missing_data_type") in {"odds", "props"}
    }
    for item in value_rows:
        if item.get("final_recommendation") != "GOOD_VALUE":
            continue
        if item.get("market_status") != "available":
            continue
        if item.get("game") in critical_games:
            continue
        if item.get("current_price") in {"", None}:
            continue
        rows.append(
            {
                "market_type": item["market_type"],
                "selection": item["team_or_player"],
                "game": item["game"],
                "current_price": item["current_price"],
                "line": item["line"],
                "model_probability": item["model_probability"],
                "edge": item["edge"],
                "recommendation": item["final_recommendation"],
                "unit_size": "0.25",
                "reason": "Positive model-vs-market edge from optional manual/free input overlay.",
                "risk_flags": item["risk_flags"],
            }
        )
    return _rank(rows)


def _missing_notes(
    game_projections: list[dict[str, Any]],
    tb_rows: list[dict[str, Any]],
    hr_rows: list[dict[str, Any]],
    pitcher_rows: list[dict[str, Any]],
    odds: list[GameOdds],
    manual_inputs: ManualInputs,
) -> list[str]:
    notes = []
    if any(row.get("lineup_status") == "unavailable" for row in game_projections):
        notes.append("One or more games lack confirmed manual lineups in this safe package-layer run.")
    if any(row.get("weather_status") == "unavailable" for row in game_projections):
        notes.append("One or more games lack manual weather or Ballpark Pal factors; missing factors are not inferred.")
    if not odds and not manual_inputs.odds and not any(_best_prop_price(row) is not None for row in manual_inputs.props):
        notes.append("Market odds are unavailable; betting value board is separated but not actionable.")
    if not tb_rows:
        notes.append("Total bases board has schema headers only because verified batter prop inputs are unavailable.")
    if not hr_rows:
        notes.append("HR board has schema headers only because verified hitter/market inputs are unavailable.")
    if not pitcher_rows:
        notes.append("Pitcher prop board has schema headers only because verified pitcher prop markets are unavailable.")
    if manual_inputs.source_notes:
        notes.extend(note["notes"] for note in manual_inputs.source_notes)
    return notes


def _manual_odds_value_rows(odds_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in odds_rows:
        current_price = _parse_price(row.get("current_price") or row.get("best_price"))
        model_probability = _parse_float(row.get("model_probability") or row.get("raw_probability"))
        market_probability = american_to_prob(current_price) if current_price is not None else None
        edge = _parse_float(row.get("edge"))
        if edge is None and model_probability is not None and market_probability is not None:
            edge = model_probability - market_probability
        recommendation = _value_label(edge, model_probability)
        if _norm(row.get("confidence")) == "low" and recommendation == "GOOD_VALUE":
            recommendation = "WATCHLIST"
        game = _manual_game_label(row)
        rows.append(
            {
                "game_id": row.get("game_id", ""),
                "game": game,
                "market_type": row.get("market_type", ""),
                "team_or_player": row.get("selection") or row.get("team") or row.get("side") or game,
                "side": row.get("side", ""),
                "sportsbook": row.get("sportsbook") or "manual",
                "consensus_price": row.get("consensus_price", ""),
                "best_price": row.get("best_price", ""),
                "opening_price": row.get("opening_price", ""),
                "current_price": current_price if current_price is not None else "",
                "line": row.get("line", ""),
                "implied_probability": _round_or_blank(market_probability),
                "no_vig_probability": _round_or_blank(market_probability),
                "model_probability": _round_or_blank(model_probability),
                "fair_price": row.get("fair_price") or (prob_to_american(model_probability) if model_probability else ""),
                "edge": _round_or_blank(edge),
                "playable_price": row.get("playable_price", ""),
                "pass_price": row.get("pass_price", ""),
                "market_status": "available" if current_price is not None else "unavailable",
                "raw_prediction_label": _raw_label(model_probability),
                "value_label": recommendation,
                "final_recommendation": recommendation,
                "risk_flags": _manual_row_risk(row, market_probability, model_probability),
            }
        )
    return rows


def _manual_prop_value_rows(board_rows: list[dict[str, Any]], market_type: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in board_rows:
        current_price = _parse_price(row.get("current_price") or row.get("current_odds"))
        model_probability = _parse_float(row.get("raw_probability") or row.get("hr_probability"))
        market_probability = american_to_prob(current_price) if current_price is not None else None
        edge = _parse_float(row.get("edge"))
        if edge is None and model_probability is not None and market_probability is not None:
            edge = model_probability - market_probability
        recommendation = _value_label(edge, model_probability)
        if row.get("recommendation") != "GOOD_VALUE" and recommendation == "GOOD_VALUE":
            recommendation = str(row.get("recommendation"))
        if recommendation == "WATCHLIST" and row.get("recommendation") in {"LOTTERY", "STRONG_MATCHUP"}:
            recommendation = str(row.get("recommendation"))
        rows.append(
            {
                "game_id": "",
                "game": row.get("game", ""),
                "market_type": market_type if market_type != "pitcher_prop" else row.get("prop_type", "pitcher_prop"),
                "team_or_player": row.get("player") or row.get("pitcher", ""),
                "side": "over",
                "sportsbook": "manual",
                "consensus_price": "",
                "best_price": current_price if current_price is not None else "",
                "opening_price": "",
                "current_price": current_price if current_price is not None else "",
                "line": row.get("line", ""),
                "implied_probability": _round_or_blank(market_probability),
                "no_vig_probability": _round_or_blank(market_probability),
                "model_probability": _round_or_blank(model_probability),
                "fair_price": row.get("fair_price") or row.get("fair_odds", ""),
                "edge": _round_or_blank(edge),
                "playable_price": "",
                "pass_price": "",
                "market_status": "available" if current_price is not None else "unavailable",
                "raw_prediction_label": row.get("recommendation", _raw_label(model_probability)),
                "value_label": recommendation,
                "final_recommendation": recommendation,
                "risk_flags": row.get("risk_flags", ""),
            }
        )
    return rows


def _source_log(manual_inputs: ManualInputs) -> list[dict[str, Any]]:
    rows = list(manual_inputs.source_notes)
    for data_type, source_rows in (
        ("odds", manual_inputs.odds),
        ("props", manual_inputs.props),
        ("weather", manual_inputs.weather),
        ("ballpark_pal", manual_inputs.ballpark),
        ("lineups", manual_inputs.lineups),
    ):
        grouped: dict[tuple[str, str, str, str], int] = {}
        for row in source_rows:
            key = (
                row.get("source", "manual"),
                row.get("source_url", ""),
                row.get("timestamp", ""),
                row.get("confidence", ""),
            )
            grouped[key] = grouped.get(key, 0) + 1
        for (source, source_url, timestamp, confidence), count in grouped.items():
            rows.append(
                {
                    "data_type": data_type,
                    "source": source,
                    "source_url": source_url,
                    "timestamp": timestamp,
                    "confidence": confidence,
                    "rows_used": count,
                    "notes": "manual/free input rows used",
                }
            )
    return rows


def _unresolved_gaps(
    verifications: list[dict[str, Any]],
    tb_rows: list[dict[str, Any]],
    hr_rows: list[dict[str, Any]],
    pitcher_rows: list[dict[str, Any]],
    manual_inputs: ManualInputs,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    prop_games = {row.get("game", "") for row in [*tb_rows, *hr_rows, *pitcher_rows]}
    odds_games = {_manual_game_label(row) for row in manual_inputs.odds}
    prop_price_games = {row.get("game", "") for row in [*tb_rows, *hr_rows, *pitcher_rows] if row.get("current_price") or row.get("current_odds")}
    for item in verifications:
        game = f"{item['away_team']}@{item['home_team']}"
        checks = [
            ("lineups", item.get("lineup_status") == "unavailable", "Manual lineups missing; player role/volume confidence remains low.", "medium", "Add lineups.csv or JSON lineups."),
            ("weather", item.get("weather_status") == "unavailable", "Weather unavailable; environment confidence remains low.", "medium", "Add weather.csv or JSON weather."),
            ("ballpark_pal", item.get("ballpark_pal_status") == "unavailable", "Ballpark Pal factors unavailable; run/HR environment factors are not adjusted.", "low", "Add ballpark_pal.csv when available."),
            ("props", game not in prop_games, "Prop boards cannot populate for this game.", "critical", "Add verified prop rows."),
            ("odds", game not in odds_games and game not in prop_price_games and item.get("odds_status") == "unavailable", "Final-card betting value cannot be verified without prices.", "critical", "Add manual odds/prop prices."),
        ]
        for missing_type, condition, impact, severity, recommendation in checks:
            if condition:
                rows.append(
                    {
                        "game": game,
                        "missing_data_type": missing_type,
                        "impact": impact,
                        "severity": severity,
                        "recommendation": recommendation,
                    }
                )
    return rows


def _render_report(payload: dict[str, Any]) -> str:
    meta = payload["metadata"]
    game_rows = payload["game_projections"]
    winners = payload["raw_winner_board"]
    value_rows = payload["betting_value_board"]
    final_card = payload["final_betting_card"]
    best_raw = winners[0] if winners else {}
    best_tb = payload["total_bases_board"][0] if payload["total_bases_board"] else {}
    best_hr = payload["hr_board"][0] if payload["hr_board"] else {}
    best_pitcher = payload["pitcher_prop_board"][0] if payload["pitcher_prop_board"] else {}
    best_value = next((row for row in value_rows if row.get("final_recommendation") == "GOOD_VALUE"), None)
    likely_overpriced = [row for row in value_rows if row.get("final_recommendation") == "LIKELY_OVERPRICED"]
    manual_used = meta.get("manual_inputs_used", {})
    lines = [
        "# EchoIQ MLB Slate Prediction + Betting Intelligence Report",
        f"Date: {meta['date']}",
        "",
        "## A. Executive Summary",
        f"- Best raw winner projection: {_fmt_selection(best_raw)}",
        "- Best raw total projection: unavailable",
        f"- Best raw total bases candidate: {_fmt_selection(best_tb)}",
        f"- Best raw HR candidate: {_fmt_selection(best_hr)}",
        f"- Best raw pitcher prop candidate: {_fmt_selection(best_pitcher)}",
        f"- Best betting value: {_fmt_selection(best_value or {})}",
        "- Best side: unavailable",
        "- Best total: unavailable",
        "- Best first-five angle: unavailable",
        "- Best team total: unavailable",
        "- Best batter prop: unavailable",
        "- Best HR lottery: unavailable",
        "- Best pitcher prop: unavailable",
        f"- Best likely-but-overpriced play: {_fmt_selection(likely_overpriced[0] if likely_overpriced else {})}",
        "- Best pass/avoid: PASS_UNCERTAINTY where required data is missing",
        "- Highest-risk assumption: missing or stale manual inputs lower confidence and block final-card promotion",
        "",
        "## Manual Inputs Used",
        _markdown_table(
            [{"input": key, "used": value} for key, value in manual_used.items()],
            ["input", "used"],
        ),
        "",
        "## Source Log Summary",
        _empty_or_table(payload["source_log"], ["data_type", "source", "confidence", "rows_used", "notes"]),
        "",
        "## Unresolved Gaps",
        _empty_or_table(payload["unresolved_gaps"], ["game", "missing_data_type", "severity", "impact", "recommendation"]),
        "",
        "## B. Slate Verification Table",
        _markdown_table(payload["game_verification"], ["game_id", "away_team", "home_team", "starter_status", "lineup_status", "weather_status", "odds_status", "source_confidence"]),
        "",
        "## C. Game Projection Table",
        _markdown_table(game_rows, ["game", "away_win_probability", "home_win_probability", "projected_total", "recommended_action"]),
        "",
        "## D. Raw Winner Probability Board",
        _markdown_table(winners[:10], ["rank", "game", "team", "raw_probability", "fair_price", "final_recommendation"]),
        "",
        "## E. Raw Total / Run Environment Board",
        _markdown_table(payload["raw_total_board"], ["rank", "game", "projected_total", "environment_support", "recommendation"]),
        "",
        "## F. Raw Total Bases Prediction Board",
        _empty_or_table(payload["total_bases_board"], ["rank", "player", "team", "game", "raw_probability", "recommendation"]),
        "",
        "## G. Raw Home Run Probability Board",
        _empty_or_table(payload["hr_board"], ["rank", "player", "team", "game", "hr_probability", "recommendation"]),
        "",
        "## H. Pitcher Prop Projection Board",
        _empty_or_table(payload["pitcher_prop_board"], ["rank", "pitcher", "team", "game", "prop_type", "recommendation"]),
        "",
        "## I. Game-by-Game Capsules",
        *_game_capsules(game_rows),
        "",
        "## J. Deep Dives on Best Research Edges",
        "No deep-dive research edge is promoted without verified lineup, weather, Statcast/prop, and environment support.",
        "",
        "## K. Deep Dives on Best Betting Values",
        "No betting value is promoted unless a manual odds overlay supplies a positive no-vig edge.",
        "",
        "## L. Likely But Overpriced Board",
        _empty_or_table(likely_overpriced, ["rank", "game", "team_or_player", "model_probability", "edge", "final_recommendation"]),
        "",
        "## M. Final Betting Card",
        _empty_or_table(final_card, ["rank", "market_type", "selection", "game", "current_price", "edge", "recommendation"]),
        "",
        "## N. Late Information Checklist",
        _render_late_checklist(payload),
        "",
        "## O. Validation / Missing Data Notes",
        *[f"- {note}" for note in payload["missing_data_notes"]],
        "",
        "## P. If I Could Only Bet Three Things",
        "No bet. The final card is empty unless verified market value clears the separated betting-value gate.",
        "",
        "## Final Recommendation Labels",
        ", ".join(RECOMMENDATION_LABELS),
        "",
    ]
    return "\n".join(lines)


def _render_late_checklist(payload: dict[str, Any]) -> str:
    date = payload["metadata"]["date"]
    lines = [
        f"# EchoIQ MLB Late Verification Checklist",
        f"Date: {date}",
        "",
        "- Recheck probable starters and scratch risk.",
        "- Recheck confirmed batting orders and lineup handedness.",
        "- Recheck weather, roof, wind, and delay risk.",
        "- Recheck Ballpark Pal run and HR factors if accessible.",
        "- Recheck moneyline, total, team total, first-five, HR, TB, and pitcher prop prices.",
        "- Re-run the EchoIQ report after material starter, lineup, weather, or price changes.",
        "",
        "## Game-Level Items",
    ]
    for item in payload.get("game_verification", []):
        lines.append(
            f"- {item['away_team']} @ {item['home_team']}: starters={item['starter_status']}; "
            f"lineups={item['lineup_status']}; weather={item['weather_status']}; odds={item['odds_status']}"
        )
    return "\n".join(lines)


def _write_csv(path: Path, rows: list[dict[str, Any]], columns: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def _rank(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    for idx, row in enumerate(rows, start=1):
        row["rank"] = idx
    return rows


def _game_label(row: dict[str, Any]) -> str:
    return f"{row.get('away_team')}@{row.get('home_team')}"


def _norm(value: str | None) -> str | None:
    if value is None:
        return None
    return " ".join(value.strip().lower().split())


def _parse_float(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text or text.lower() in {"unavailable", "na", "n/a", "none", "null"}:
        return None
    try:
        return float(text.replace("%", "").replace(",", ""))
    except ValueError:
        return None


def _parse_price(value: Any) -> int | float | None:
    parsed = _parse_float(value)
    return parsed if parsed is not None and parsed != 0 else None


def _manual_game_label(row: dict[str, Any]) -> str:
    away = row.get("away_team", "")
    home = row.get("home_team", "")
    if away and home:
        return f"{away}@{home}"
    return row.get("game", "") or str(row.get("game_id", ""))


def _manual_rows_for_game(rows: list[dict[str, Any]], game: MLBGame) -> list[dict[str, Any]]:
    return [row for row in rows if _manual_row_matches_game(row, game)]


def _manual_row_matches_game(row: dict[str, Any], game: MLBGame) -> bool:
    game_id = row.get("game_id", "")
    if game_id and str(game_id) == str(game.game_pk):
        return True
    return _norm(row.get("away_team")) == _norm(game.away_team) and _norm(row.get("home_team")) == _norm(game.home_team)


def _first_manual_match(rows: list[dict[str, Any]], verification: dict[str, Any]) -> dict[str, Any] | None:
    for row in rows:
        if row.get("game_id") and str(row.get("game_id")) == str(verification.get("game_id")):
            return row
        if _norm(row.get("away_team")) == _norm(verification.get("away_team")) and _norm(row.get("home_team")) == _norm(verification.get("home_team")):
            return row
        if row.get("venue") and _norm(row.get("venue")) == _norm(verification.get("venue")):
            return row
    return None


def _game_for_manual_row(row: dict[str, Any], verifications: list[dict[str, Any]]) -> str:
    for item in verifications:
        if row.get("game_id") and str(row.get("game_id")) == str(item.get("game_id")):
            return f"{item['away_team']}@{item['home_team']}"
        if _norm(row.get("away_team")) == _norm(item.get("away_team")) and _norm(row.get("home_team")) == _norm(item.get("home_team")):
            return f"{item['away_team']}@{item['home_team']}"
    return _manual_game_label(row)


def _environment_for_game(environment_board: list[dict[str, Any]], game: str) -> dict[str, Any]:
    return next((row for row in environment_board if row.get("game") == game), {})


def _lineup_status(rows: list[dict[str, Any]]) -> str:
    statuses = {_norm(row.get("lineup_status")) for row in rows}
    if "confirmed" in statuses:
        return "confirmed"
    if "projected" in statuses:
        return "projected"
    return "unavailable"


def _combined_confidence(rows: list[dict[str, Any]]) -> str:
    values = [_norm(row.get("confidence")) for row in rows if row.get("confidence")]
    if not values:
        return "unavailable"
    if "low" in values:
        return "Low"
    if "medium" in values:
        return "Medium"
    if "high" in values:
        return "High"
    return str(values[0]).title()


def _environment_grade(
    factor: float | None,
    weather_factor: float | None,
    wind_effect: str | None,
    temp: float | None,
    *,
    kind: str,
) -> str:
    score = 0.0
    if factor is not None:
        score += factor - 1.0
    if weather_factor is not None:
        score += (weather_factor - 1.0) * 0.75
    wind = _norm(wind_effect) or ""
    if "out" in wind or "boost" in wind:
        score += 0.04
    if "in" in wind or "reduce" in wind or "suppress" in wind:
        score -= 0.04
    if temp is not None and kind == "hr":
        if temp <= 50:
            score -= 0.03
        elif temp >= 80:
            score += 0.03
    if score >= 0.06:
        return "favorable"
    if score <= -0.06:
        return "unfavorable"
    return "neutral"


def _handedness_factor(ballpark: dict[str, Any] | None) -> str:
    if not ballpark:
        return "unavailable"
    right = ballpark.get("rh_hr_factor", "")
    left = ballpark.get("lh_hr_factor", "")
    if not right and not left:
        return "unavailable"
    return f"RH {right or 'unavailable'} / LH {left or 'unavailable'}"


def _total_impact(run_grade: str, hr_grade: str) -> str:
    if run_grade == "favorable" or hr_grade == "favorable":
        return "run/HR environment boost"
    if run_grade == "unfavorable" or hr_grade == "unfavorable":
        return "run/HR environment drag"
    if run_grade == "unavailable" and hr_grade == "unavailable":
        return "unavailable"
    return "neutral"


def _environment_notes(weather: dict[str, Any] | None, ballpark: dict[str, Any] | None) -> str:
    notes: list[str] = []
    if ballpark and ballpark.get("notes"):
        notes.append(str(ballpark["notes"]))
    if ballpark and _parse_float(ballpark.get("hr_factor")) and _parse_float(ballpark.get("hr_factor")) > 1.04:
        notes.append("Ballpark Pal HR factor boosts power.")
    if weather and "in" in (_norm(weather.get("wind_effect")) or ""):
        notes.append("Wind blowing in reduces HR confidence.")
    if weather and _parse_float(weather.get("temperature")) is not None and _parse_float(weather.get("temperature")) <= 50:
        notes.append("Cold weather downgrades carry.")
    if ballpark and _parse_float(ballpark.get("run_factor")) and _parse_float(ballpark.get("run_factor")) > 1.08:
        notes.append("High run factor increases volatility.")
    return "; ".join(notes) if notes else "unavailable"


def _environment_support(env: dict[str, Any]) -> str:
    if not env:
        return "unavailable"
    bits = []
    if env.get("run_environment_grade") not in {"", "unavailable", None}:
        bits.append(f"run {env['run_environment_grade']}")
    if env.get("hr_environment_grade") not in {"", "unavailable", None}:
        bits.append(f"HR {env['hr_environment_grade']}")
    notes = env.get("environment_notes")
    if notes and notes != "unavailable":
        bits.append(str(notes))
    return "; ".join(bits) if bits else "unavailable"


def _confidence_from_environment(env: dict[str, Any]) -> str:
    if not env or env.get("source_confidence") in {"", "unavailable", None}:
        return "Unavailable"
    return str(env["source_confidence"])


def _market_total_for_game(odds_rows: list[dict[str, Any]], pred: dict[str, Any]) -> str:
    for row in odds_rows:
        if _norm(row.get("market_type")) == "full_game_total" and _manual_game_label(row) == _game_label(pred):
            return row.get("line", "") or "unavailable"
    return "unavailable"


def _best_prop_price(row: dict[str, Any]) -> int | float | None:
    return _parse_price(row.get("current_price") or row.get("current_odds") or row.get("best_price") or row.get("over_price"))


def _edge_from_price(raw_probability: float | None, current_price: Any, under_price: Any = None) -> float | None:
    price = _parse_price(current_price)
    if raw_probability is None or price is None:
        return None
    over_prob = american_to_prob(price)
    under = _parse_price(under_price)
    market_prob = remove_vig_two_way(over_prob, american_to_prob(under))[0] if under is not None else over_prob
    return raw_probability - market_prob


def _lineup_spot(prop: dict[str, Any], manual_inputs: ManualInputs) -> str:
    if prop.get("lineup_spot"):
        return str(prop["lineup_spot"])
    player = _norm(prop.get("player"))
    team = _norm(prop.get("team"))
    for row in manual_inputs.lineups:
        if _norm(row.get("player")) == player and _norm(row.get("team")) == team:
            return row.get("batting_order", "") or "unavailable"
    return "unavailable"


def _raw_prop_confidence(raw_probability: float | None, prop: dict[str, Any], env: dict[str, Any]) -> str:
    if raw_probability is None:
        return "Low"
    if _norm(prop.get("confidence")) == "low":
        return "Low"
    if _environment_support(env) == "unavailable":
        return "Medium"
    return str(prop.get("confidence") or "Medium").title()


def _betting_confidence(edge: float | None, prop: dict[str, Any]) -> str:
    if edge is None:
        return "Unavailable"
    if _norm(prop.get("confidence")) == "low":
        return "Low"
    if edge >= 0.04:
        return "High"
    if edge >= 0.02:
        return "Medium"
    return "Low"


def _prop_recommendation(raw_probability: float | None, edge: float | None, prop: dict[str, Any], *, default_raw: str) -> str:
    if raw_probability is None:
        return "PASS_UNCERTAINTY"
    if edge is not None and edge >= 0.02 and _norm(prop.get("confidence")) != "low":
        return "GOOD_VALUE"
    if edge is not None and edge <= -0.02 and raw_probability >= 0.35:
        return "LIKELY_OVERPRICED"
    if edge is None:
        return default_raw
    if raw_probability >= 0.35:
        return default_raw
    return "WATCHLIST"


def _prop_reason(prop: dict[str, Any], edge: float | None, env: dict[str, Any]) -> str:
    parts = []
    if prop.get("reason"):
        parts.append(str(prop["reason"]))
    if edge is not None:
        parts.append(f"model edge {edge:.3f}")
    support = _environment_support(env)
    if support != "unavailable":
        parts.append(support)
    return "; ".join(parts) if parts else "manual/free prop input"


def _prop_risk_flags(prop: dict[str, Any], env: dict[str, Any]) -> str:
    flags = []
    if _best_prop_price(prop) is None:
        flags.append("price_missing")
    if _parse_float(prop.get("raw_probability")) is None:
        flags.append("raw_probability_missing")
    if _environment_support(env) == "unavailable":
        flags.append("environment_missing")
    if _norm(prop.get("confidence")) == "low":
        flags.append("low_source_confidence")
    return ",".join(flags)


def _manual_row_risk(row: dict[str, Any], market_probability: float | None, model_probability: float | None) -> str:
    flags = []
    if market_probability is None:
        flags.append("price_missing")
    if model_probability is None:
        flags.append("model_probability_missing")
    if _norm(row.get("confidence")) == "low":
        flags.append("low_source_confidence")
    return ",".join(flags)


def _odds_match_game(game: MLBGame, odds: GameOdds) -> bool:
    return _norm(game.away_team) == _norm(odds.away_team) and _norm(game.home_team) == _norm(odds.home_team)


def _round_or_blank(value: Any) -> Any:
    if value is None:
        return ""
    return round(float(value), 4)


def _raw_label(model_prob: Any) -> str:
    if model_prob is None:
        return "PASS_UNCERTAINTY"
    p = float(model_prob)
    if p >= 0.57:
        return "RAW_TOP"
    if p >= 0.53:
        return "STRONG_MATCHUP"
    return "WATCHLIST"


def _value_label(edge: Any, model_prob: Any) -> str:
    if edge is None:
        return "PASS_UNCERTAINTY"
    e = float(edge)
    p = float(model_prob or 0.0)
    if e >= 0.02:
        return "GOOD_VALUE"
    if p >= 0.57 and e <= 0:
        return "LIKELY_OVERPRICED"
    if e < -0.02:
        return "PASS_PRICE"
    return "WATCHLIST"


def _fmt_selection(row: dict[str, Any]) -> str:
    if not row:
        return "unavailable"
    name = row.get("player") or row.get("pitcher") or row.get("team") or row.get("team_or_player") or row.get("selection") or "unavailable"
    game = row.get("game", "unavailable")
    prob = row.get("raw_probability") or row.get("hr_probability") or row.get("model_probability") or ""
    return f"{name} ({game}, {prob})"


def _markdown_table(rows: list[dict[str, Any]], columns: list[str]) -> str:
    header = "| " + " | ".join(columns) + " |"
    sep = "| " + " | ".join(["---"] * len(columns)) + " |"
    body = []
    for row in rows:
        body.append("| " + " | ".join(str(row.get(col, "")) for col in columns) + " |")
    return "\n".join([header, sep, *body])


def _empty_or_table(rows: list[dict[str, Any]], columns: list[str]) -> str:
    if not rows:
        return "No verified rows available; output CSV contains schema headers only."
    return _markdown_table(rows, columns)


def _game_capsules(game_rows: list[dict[str, Any]]) -> list[str]:
    if not game_rows:
        return ["No games found for this date/filter."]
    capsules = []
    for row in game_rows:
        capsules.append(
            f"- {row['game']}: raw probabilities {row['away_team']} {row['away_win_probability']} / "
            f"{row['home_team']} {row['home_win_probability']}; missing={row['missing_data_flags']}"
        )
    return capsules


def _scoring_weights() -> dict[str, Any]:
    return {
        "team_raw_prediction": {
            "starting_pitcher_edge": 0.25,
            "offense_edge": 0.20,
            "pitch_type_matchup": 0.15,
            "bullpen_edge": 0.15,
            "weather_park_ballpark_pal": 0.10,
            "recent_form": 0.05,
            "lineup_confirmation": 0.05,
            "home_field_travel_rest": 0.05,
            "implementation_status": "documented; not fully scored until source features are available",
        },
        "hitter_raw_prediction": {
            "pitch_type_matchup": 0.25,
            "statcast_quality": 0.25,
            "lineup_role_pa_volume": 0.15,
            "split_vs_handedness": 0.10,
            "recent_form": 0.10,
            "ballpark_pal_weather_park": 0.10,
            "bullpen_matchup": 0.05,
            "implementation_status": "schema-ready; rows omitted until verified hitter inputs exist",
        },
        "hr_raw_prediction": {
            "barrel_hard_hit_pull_air_profile": 0.30,
            "pitch_type_matchup": 0.20,
            "ballpark_pal_hr_factor_weather": 0.20,
            "split_vs_handedness": 0.10,
            "lineup_spot_pa_volume": 0.10,
            "opposing_pitcher_hr_susceptibility": 0.10,
            "implementation_status": "schema-ready; rows omitted until verified HR inputs exist",
        },
        "betting_value": [
            "model_probability_vs_no_vig_market_probability",
            "best_available_price",
            "line_movement",
            "key_number_sensitivity",
            "market_efficiency",
            "variance_level",
            "correlation_with_other_plays",
            "late_information_risk",
        ],
    }


def serialize_games(games: list[MLBGame]) -> list[dict[str, Any]]:
    return [asdict(game) for game in games]
