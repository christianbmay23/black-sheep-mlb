"""Snapshot writer + evaluation summary + provider object serializers.

`write_run_snapshot` used to depend on module-level `REPORT_DATE` and
`DEFAULT_MARKET_BLEND_ALPHA` globals from apr16_compute.py. It is now
parameterized so callers must pass those in explicitly.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from .canvas_io import canvas_slug, rows_to_dicts


SCORING_STATUS_SCORED = "scored"
SCORING_STATUS_NOT_SCORED = "not_scored"


def scoring_status_for_bucket(bucket: Any) -> str:
    return SCORING_STATUS_SCORED if str(bucket or "").strip().lower() == "pregame" else SCORING_STATUS_NOT_SCORED


# --- Serializers ------------------------------------------------------------

def serialize_game_odds(odds: Any | None) -> dict[str, Any] | None:
    if odds is None:
        return None
    return {
        "event_id": getattr(odds, "event_id", None),
        "away_abbr": getattr(odds, "away_abbr", None),
        "home_abbr": getattr(odds, "home_abbr", None),
        "away_moneyline": getattr(odds, "away_moneyline", None),
        "home_moneyline": getattr(odds, "home_moneyline", None),
        "total_line": getattr(odds, "total_line", None),
        "over_price": getattr(odds, "over_price", None),
        "under_price": getattr(odds, "under_price", None),
        "bookmakers_count": getattr(odds, "bookmakers_count", None),
        "last_update": getattr(odds, "last_update", None),
        "source": getattr(odds, "source", None),
    }


def serialize_prop_market(line: Any | None) -> dict[str, Any] | None:
    if line is None:
        return None
    return {
        "event_id": getattr(line, "event_id", None),
        "market_key": getattr(line, "market_key", None),
        "player_key": getattr(line, "player_key", None),
        "player_name": getattr(line, "player_name", None),
        "point": getattr(line, "point", None),
        "over_price": getattr(line, "over_price", None),
        "under_price": getattr(line, "under_price", None),
        "bookmakers_count": getattr(line, "bookmakers_count", None),
        "last_update": getattr(line, "last_update", None),
        "source": getattr(line, "source", None),
    }


def serialize_weather(snapshot: Any | None) -> dict[str, Any] | None:
    if snapshot is None:
        return None
    return {
        "venue_name": getattr(snapshot, "venue_name", None),
        "source": getattr(snapshot, "source", None),
        "forecast_time_utc": getattr(snapshot, "forecast_time_utc", None),
        "roof_type": getattr(snapshot, "roof_type", None),
        "temperature_f": getattr(snapshot, "temperature_f", None),
        "wind_speed_mph": getattr(snapshot, "wind_speed_mph", None),
        "wind_direction_deg": getattr(snapshot, "wind_direction_deg", None),
        "precipitation_probability_pct": getattr(snapshot, "precipitation_probability_pct", None),
        "precipitation_inches": getattr(snapshot, "precipitation_inches", None),
        "weather_code": getattr(snapshot, "weather_code", None),
        "run_factor": getattr(snapshot, "run_factor", None),
        "summary": getattr(snapshot, "summary", None),
    }


# --- Evaluation summary -----------------------------------------------------

def summarize_snapshot_evaluation(
    allow_partial: bool,
    game_rows: list[dict[str, str]],
    prop_rows: list[dict[str, str]],
) -> dict[str, Any]:
    reasons: list[str] = []
    if allow_partial:
        reasons.append("allow_partial")
    if not game_rows:
        reasons.append("no_games")
    if any(
        str(row.get("game_status_bucket") or "").strip().lower() != "pregame"
        and str(row.get("scoring_status") or "").strip().lower() == SCORING_STATUS_SCORED
        for row in game_rows
    ):
        reasons.append("contains_non_pregame_scored_games")

    scored_games = sum(1 for row in game_rows if str(row.get("scoring_status") or "").strip().lower() == SCORING_STATUS_SCORED)
    scored_props = sum(1 for row in prop_rows if str(row.get("scoring_status") or "").strip().lower() == SCORING_STATUS_SCORED)
    eligible = not reasons
    return {
        "eligible": eligible,
        "status": "eligible" if eligible else "not_evaluable",
        "reasons": reasons,
        "scored_games": scored_games,
        "not_scored_games": len(game_rows) - scored_games,
        "scored_props": scored_props,
        "not_scored_props": len(prop_rows) - scored_props,
    }


# --- Snapshot writer --------------------------------------------------------

def write_run_snapshot(
    path: Path,
    *,
    snapshot_root: Path,
    report_date: str,
    market_blend_alpha: float,
    allow_partial: bool,
    lineup_context: dict[str, dict[str, Any]],
    games_rows: list[list[str]],
    batter_rows: list[list[str]],
    game_feature_rows: list[dict[str, Any]],
    prop_feature_rows: list[dict[str, Any]],
    team_bullpen_scores: dict[str, dict[str, Any]],
    runtime_diagnostics: list[dict[str, Any]],
    prop_market_coverage: list[dict[str, Any]],
    game_odds_cls: type,
    prop_market_cls: type,
    weather_cls: type,
) -> Path:
    slug = canvas_slug(path)
    snapshot_dir = snapshot_root / slug
    snapshot_dir.mkdir(parents=True, exist_ok=True)
    run_ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    game_rows = rows_to_dicts(games_rows)
    prop_rows = rows_to_dicts(batter_rows)
    evaluation = summarize_snapshot_evaluation(allow_partial, game_rows, prop_rows)
    payload = {
        "slug": slug,
        "report_date": report_date,
        "run_timestamp_utc": run_ts,
        "allow_partial": allow_partial,
        "evaluation_eligible": evaluation["eligible"],
        "evaluation": evaluation,
        "game_model": {
            "market_blend_alpha": market_blend_alpha,
        },
        "canvas_path": str(path),
        "games": game_rows,
        "props": prop_rows,
        "game_features": game_feature_rows,
        "prop_features": prop_feature_rows,
        "team_bullpens": team_bullpen_scores,
        "runtime_diagnostics": runtime_diagnostics,
        "prop_market_coverage": prop_market_coverage,
        "lineup_context": {
            game_key: {
                "game_status_bucket": ctx.get("game_status_bucket"),
                "game_state": ctx.get("game_state"),
                "game_state_detail": ctx.get("game_state_detail"),
                "game_status_note": ctx.get("game_status_note"),
                "inning_label": ctx.get("inning_label"),
                "away_score": ctx.get("away_score"),
                "home_score": ctx.get("home_score"),
                "away_label": ctx.get("away_label"),
                "home_label": ctx.get("home_label"),
                "away_lineup_verification": ctx.get("away_lineup_verification"),
                "home_lineup_verification": ctx.get("home_lineup_verification"),
                "away_starter_verification": ctx.get("away_starter_verification"),
                "home_starter_verification": ctx.get("home_starter_verification"),
                "weather_issue_codes": list(ctx.get("weather_issue_codes") or []),
                "weather_provider_path": list(ctx.get("weather_provider_path") or []),
                "weather_resolution_source": ctx.get("weather_resolution_source"),
                "weather_resolution_detail": ctx.get("weather_resolution_detail"),
                "hr_provider_path": ctx.get("hr_provider_path"),
                "away_pitcher": ctx.get("away_pitcher"),
                "home_pitcher": ctx.get("home_pitcher"),
                "away_moneyline": ctx.get("away_moneyline"),
                "home_moneyline": ctx.get("home_moneyline"),
                "odds": serialize_game_odds(ctx.get("odds") if isinstance(ctx.get("odds"), game_odds_cls) else None),
                "weather": serialize_weather(ctx.get("weather") if isinstance(ctx.get("weather"), weather_cls) else None),
                "issues": list(ctx.get("issues") or []),
                "venue_name": ctx.get("venue_name"),
                "roof_type": ctx.get("roof_type"),
                "away_players": ctx.get("away_players"),
                "home_players": ctx.get("home_players"),
            }
            for game_key, ctx in lineup_context.items()
        },
        "summary": {
            "pregame_games": sum(1 for row in game_rows if row.get("game_status_bucket") == "pregame"),
            "live_games": sum(1 for row in game_rows if row.get("game_status_bucket") == "live"),
            "final_games": sum(1 for row in game_rows if row.get("game_status_bucket") == "final"),
            "other_games": sum(1 for row in game_rows if row.get("game_status_bucket") == "other"),
            "verified_games": sum(1 for row in game_rows if row.get("verification_status") == "Verified"),
            "partial_games": sum(1 for row in game_rows if row.get("verification_status") == "Partial"),
            "scored_games": evaluation["scored_games"],
            "not_scored_games": evaluation["not_scored_games"],
            "full_prop_markets": sum(1 for row in prop_rows if row.get("market_data_status") == "full"),
            "partial_prop_markets": sum(1 for row in prop_rows if row.get("market_data_status") == "partial"),
            "no_prop_markets": sum(1 for row in prop_rows if row.get("market_data_status") == "none"),
            "scored_props": evaluation["scored_props"],
            "not_scored_props": evaluation["not_scored_props"],
            "games_missing_odds": sum(
                1 for row in prop_market_coverage if "market_odds_unavailable" in list(row.get("notes") or [])
            ),
            "one_sided_hr_games": sum(
                1
                for row in prop_market_coverage
                if "draftkings_hr_home_side_missing" in list(row.get("notes") or [])
                or "draftkings_hr_away_side_missing" in list(row.get("notes") or [])
                or "rotowire_hr_home_side_missing" in list(row.get("notes") or [])
                or "rotowire_hr_away_side_missing" in list(row.get("notes") or [])
            ),
            "evaluation_eligible": evaluation["eligible"],
            "evaluation_status": evaluation["status"],
        },
    }
    snapshot_text = json.dumps(payload, indent=2, ensure_ascii=False)
    snapshot_path = snapshot_dir / f"{slug}-{run_ts}.json"
    latest_path = snapshot_dir / f"{slug}-latest.json"
    snapshot_path.write_text(snapshot_text, encoding="utf-8")
    latest_path.write_text(snapshot_text, encoding="utf-8")
    return snapshot_path


__all__ = [
    "SCORING_STATUS_SCORED",
    "SCORING_STATUS_NOT_SCORED",
    "scoring_status_for_bucket",
    "serialize_game_odds",
    "serialize_prop_market",
    "serialize_weather",
    "summarize_snapshot_evaluation",
    "write_run_snapshot",
]
