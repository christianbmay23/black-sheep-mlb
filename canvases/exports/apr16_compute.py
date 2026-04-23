"""Compute dated slate games + props from shared models; update canvas markers + SLATE."""
from __future__ import annotations

import sys
from collections.abc import Callable
from datetime import date, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from live_mlb_data import (  # noqa: E402
    FanGraphsGame,
    GameOdds,
    LiveDataError,
    PropMarketLine,
    WeatherSnapshot,
    fetch_dk_hr_props,
    fetch_fangraphs_lineups,
    fetch_fangraphs_probables,
    fetch_live_game_odds,
    fetch_propline_hr_props,
    fetch_rotowire_lineups,
    fetch_slate_prop_markets,
    fetch_weather_snapshot,
    get_runtime_diagnostics,
    normalize_player_name,
    reset_runtime_diagnostics,
)
from models.game_model import (  # noqa: E402
    DEFAULT_MARKET_BLEND_ALPHA,
    american_to_implied,
    blended_win_probabilities,
    devig_two_way,
    tier_from_edge,
    win_probability_model,
)
from models.prop_model import batter_hr_two_tb, stronger_tier  # noqa: E402

# --- Extracted pure pipeline modules (pipeline/*) ---------------------------
# The symbols below are re-exported at the bottom of this module so existing
# callers (build_ml_exports.py, bootstrap_live_slate.py, _gen_apr*_canvas.py)
# and any stray imports keep working unchanged.
from pipeline.canvas_io import (  # noqa: E402
    assert_no_comment_breaker,
    canvas_slug,
    csv_block,
    extract_game_block,
    find_field_array_span,
    insert_field_after,
    parse_canvas_games as _parse_canvas_games_pure,
    parse_lineup_rows,
    patch_float_field,
    patch_string_field,
    render_json_string,
    render_lineup_rows,
    render_prop_rows,
    replace_array_field,
    replace_marker_region,
    round_or_blank,
    rows_to_dicts,
    upsert_literal_field,
    upsert_string_field,
)
from pipeline.markets import (  # noqa: E402
    HR_EDGE_GATE_PCT,
    PROP_TIER_RANK,
    TB_EDGE_GATE_PCT,
    TB_PARTIAL_RECOMMEND_MIN_PROB_PCT,
    TB_RECOMMEND_MIN_PROB_PCT,
    TB_TARGET_LINE,
    choose_recommended_prop,
    classify_hr_market_status,
    classify_tb_market_status,
    has_any_tb_market,
    has_hr_market_price,
    is_aligned_tb_market,
    prop_tier_rank,
    summarize_prop_market_coverage as _summarize_prop_market_coverage_pure,
)
from pipeline.snapshots import (  # noqa: E402
    SCORING_STATUS_NOT_SCORED,
    SCORING_STATUS_SCORED,
    scoring_status_for_bucket,
    serialize_game_odds,
    serialize_prop_market,
    serialize_weather,
    summarize_snapshot_evaluation,
    write_run_snapshot as _write_run_snapshot_pure,
)
from pipeline.status import (  # noqa: E402
    run_environment_label,
    summarize_game_status,
)
from pipeline.parseutil import parse_float, parse_int, safe_div  # noqa: E402
from pipeline.fetch import (  # noqa: E402
    fetch_people_map,
    fetch_savant_expected_stats,
    fetch_savant_statcast,
    fetch_schedule_lineups,
    fetch_team_rosters,
    fetch_vs_pitcher_stats,
)
from pipeline.inputs import load_slate_inputs  # noqa: E402
from pipeline.features import (  # noqa: E402
    build_data_confidence,
    build_model_lineup,
    build_prop_note,
    choose_lineup_side,
    starter_verification_metadata,
    starter_matches,
    summarize_hitter_features,
    summarize_pitcher_features,
    summarize_team_bullpen,
    team_recent_form_score,
)

GAME_SPECS: list[dict[str, Any]] = []
REPORT_DATE = ""
CANVAS: Path = ROOT / "canvases" / "mlb-pregame-intel-apr16.canvas.tsx"


def _make_sp_profile_unbound(_x: float) -> list[list[str]]:
    raise RuntimeError("bind_slate_inputs() must run before model pipeline")


make_sp_profile: Callable[[float], list[list[str]]] = _make_sp_profile_unbound

SNAPSHOT_ROOT = ROOT / "canvases" / "exports" / "snapshots"


def _classify_weather_exception(exc: Exception) -> str:
    message = str(exc).lower()
    if "geocoding failed" in message:
        return "weather_geocode_failed"
    if "no hourly data" in message:
        return "weather_hourly_data_missing"
    return "weather_provider_exception"


def _downgrade_prop_tier(tier: str) -> str:
    normalized = str(tier or "").strip().upper()
    return {
        "A+": "A",
        "A": "B",
        "B": "C",
        "C": "D",
        "D": "D",
    }.get(normalized, normalized)


def _hr_missing_market_reason(team_is_away: bool, coverage_notes: list[str]) -> str:
    if "draftkings_hr_home_side_missing" in coverage_notes and not team_is_away:
        return " (DraftKings HR feed returned no home-side markets for this game)"
    if "draftkings_hr_away_side_missing" in coverage_notes and team_is_away:
        return " (DraftKings HR feed returned no away-side markets for this game)"
    if "rotowire_hr_home_side_missing" in coverage_notes and not team_is_away:
        return " (RotoWire HR fallback returned no home-side markets for this game)"
    if "rotowire_hr_away_side_missing" in coverage_notes and team_is_away:
        return " (RotoWire HR fallback returned no away-side markets for this game)"
    return ""


def _fallback_weather_snapshot(
    venue_name: str,
    roof_type: str,
    game_time_utc: str,
) -> WeatherSnapshot:
    roof = str(roof_type or "Open")
    summary = f"Conservative fallback / {roof}"
    return WeatherSnapshot(
        venue_name=venue_name,
        source="Fallback",
        forecast_time_utc=game_time_utc,
        roof_type=roof,
        temperature_f=None,
        wind_speed_mph=None,
        wind_direction_deg=None,
        precipitation_probability_pct=None,
        precipitation_inches=None,
        weather_code=None,
        run_factor=1.0,
        summary=summary,
    )


def resolve_weather_with_fallback(schedule_game: dict[str, Any]) -> tuple[WeatherSnapshot, list[str], dict[str, Any]]:
    venue_name = str(schedule_game.get("venue_name") or "")
    roof_type = str(schedule_game.get("roof_type") or "Open")
    game_time_utc = str(schedule_game.get("game_date_utc") or "")
    try:
        snapshot = fetch_weather_snapshot(
            venue_name,
            str(schedule_game.get("home_location_name") or ""),
            roof_type,
            game_time_utc,
        )
        return snapshot, [], {
            "provider_path": ["open_meteo"],
            "resolution_source": "open_meteo",
            "resolution_detail": "live_forecast",
        }
    except Exception as exc:
        issue_code = _classify_weather_exception(exc)
        return _fallback_weather_snapshot(venue_name, roof_type, game_time_utc), [
            "weather_live_missing",
            issue_code,
            "weather_fallback_conservative",
        ], {
            "provider_path": ["open_meteo", "fallback_neutral"],
            "resolution_source": "fallback_neutral",
            "resolution_detail": str(exc),
        }


def parse_canvas_games(source: str) -> dict[str, dict[str, Any]]:
    """Back-compat wrapper: uses the module-level GAME_SPECS."""
    return _parse_canvas_games_pure(source, GAME_SPECS)


def summarize_prop_market_coverage(
    game_key: str,
    ctx: dict[str, Any],
    markets: dict[tuple[str, str], PropMarketLine],
) -> dict[str, Any]:
    """Back-compat wrapper: injects `normalize_player_name` from live_mlb_data."""
    return _summarize_prop_market_coverage_pure(
        game_key, ctx, markets, normalize_player_name=normalize_player_name
    )


def write_run_snapshot(
    path: Path,
    *,
    allow_partial: bool,
    lineup_context: dict[str, dict[str, Any]],
    games_rows: list[list[str]],
    batter_rows: list[list[str]],
    game_feature_rows: list[dict[str, Any]],
    prop_feature_rows: list[dict[str, Any]],
    team_bullpen_scores: dict[str, dict[str, Any]],
    runtime_diagnostics: list[dict[str, Any]],
    prop_market_coverage: list[dict[str, Any]],
) -> Path:
    """Back-compat wrapper: supplies the globals the pure writer needs."""
    return _write_run_snapshot_pure(
        path,
        snapshot_root=SNAPSHOT_ROOT,
        report_date=REPORT_DATE,
        market_blend_alpha=DEFAULT_MARKET_BLEND_ALPHA,
        allow_partial=allow_partial,
        lineup_context=lineup_context,
        games_rows=games_rows,
        batter_rows=batter_rows,
        game_feature_rows=game_feature_rows,
        prop_feature_rows=prop_feature_rows,
        team_bullpen_scores=team_bullpen_scores,
        runtime_diagnostics=runtime_diagnostics,
        prop_market_coverage=prop_market_coverage,
        game_odds_cls=GameOdds,
        prop_market_cls=PropMarketLine,
        weather_cls=WeatherSnapshot,
    )



def report_date_value() -> date:
    return datetime.strptime(REPORT_DATE, "%Y-%m-%d").date()

def bind_slate_inputs(slug: str) -> None:
    global GAME_SPECS, REPORT_DATE, CANVAS
    global make_sp_profile
    inputs = load_slate_inputs(slug)
    GAME_SPECS = inputs.game_specs
    REPORT_DATE = inputs.report_date
    make_sp_profile = inputs.make_sp_profile
    CANVAS = inputs.canvas_path


def run_slate_pipeline(slug: str, canvas_path: Path | None = None, *, allow_partial: bool = False) -> None:
    bind_slate_inputs(slug)
    _run_model_pipeline(canvas_path, allow_partial=allow_partial)


def run_apr16_pipeline(canvas_path: Path | None = None, *, allow_partial: bool = False) -> None:
    run_slate_pipeline("apr16", canvas_path, allow_partial=allow_partial)


def _run_model_pipeline(canvas_path: Path | None = None, *, allow_partial: bool = False) -> None:
    path = canvas_path or CANVAS
    if not path.is_file():
        raise FileNotFoundError(path)

    reset_runtime_diagnostics()
    report_end_date = report_date_value()
    original = path.read_text(encoding="utf-8")
    canvas_games = parse_canvas_games(original)
    api = fetch_schedule_lineups(REPORT_DATE)
    season = REPORT_DATE[:4]
    rotowire_games = fetch_rotowire_lineups(REPORT_DATE)
    fangraphs_probables = fetch_fangraphs_probables(REPORT_DATE)
    fangraphs_games: dict[str, FanGraphsGame] = fetch_fangraphs_lineups(REPORT_DATE, fangraphs_probables)
    live_game_odds = fetch_live_game_odds(api, REPORT_DATE, required=not allow_partial)

    team_ids: dict[str, int] = {}
    for game_key, game in api.items():
        away, home = game_key.split("@", 1)
        team_ids[away] = int(game["away_team_id"])
        team_ids[home] = int(game["home_team_id"])
    rosters = fetch_team_rosters(team_ids, season)

    lineup_context: dict[str, dict[str, Any]] = {}
    blocking_issues: list[str] = []

    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        schedule_game = api.get(game_key)
        if schedule_game is None:
            blocking_issues.append(f"{game_key}: missing from MLB schedule")
            continue
        is_pregame = str(schedule_game.get("game_status_bucket") or "pregame") == "pregame"
        rotowire_game = rotowire_games.get(game_key)
        fangraphs_game = fangraphs_games.get(game_key)
        canvas_ctx = canvas_games.get(game_key, {})
        away_players, away_label, away_issues, away_lineup_verification = choose_lineup_side(
            str(spec["away"]),
            list(schedule_game.get("away_players", [])),
            list(canvas_ctx.get("away_lineup", [])),
            str(canvas_ctx.get("away_label", "Projected (canvas fallback)")),
            rotowire_game,
            "away",
            rosters,
            allow_canvas_fallback=allow_partial or not is_pregame,
            fangraphs_game=fangraphs_game,
        )
        home_players, home_label, home_issues, home_lineup_verification = choose_lineup_side(
            str(spec["home"]),
            list(schedule_game.get("home_players", [])),
            list(canvas_ctx.get("home_lineup", [])),
            str(canvas_ctx.get("home_label", "Projected (canvas fallback)")),
            rotowire_game,
            "home",
            rosters,
            allow_canvas_fallback=allow_partial or not is_pregame,
            fangraphs_game=fangraphs_game,
        )

        away_pitcher = dict(schedule_game.get("away_pitcher") or {"id": None, "name": "TBD"})
        home_pitcher = dict(schedule_game.get("home_pitcher") or {"id": None, "name": "TBD"})
        away_starter_verification = starter_verification_metadata(
            away_pitcher,
            rotowire_game,
            "away",
            fangraphs_game=fangraphs_game,
        )
        home_starter_verification = starter_verification_metadata(
            home_pitcher,
            rotowire_game,
            "home",
            fangraphs_game=fangraphs_game,
        )
        issues = away_issues + home_issues
        issues.extend(starter_matches(away_pitcher, rotowire_game, "away", fangraphs_game=fangraphs_game))
        issues.extend(starter_matches(home_pitcher, rotowire_game, "home", fangraphs_game=fangraphs_game))

        weather_snapshot, weather_issue_codes, weather_provenance = resolve_weather_with_fallback(schedule_game)
        issues.extend(weather_issue_codes)
        if is_pregame and not allow_partial and weather_issue_codes:
            blocking_issues.append(f"{game_key}: live weather unavailable ({weather_provenance['resolution_detail']})")

        odds = live_game_odds.get(game_key)
        away_moneyline = odds.away_moneyline if odds and odds.away_moneyline is not None else parse_int(spec["away_a"])
        home_moneyline = odds.home_moneyline if odds and odds.home_moneyline is not None else parse_int(spec["home_a"])
        if is_pregame and (odds is None or away_moneyline is None or home_moneyline is None):
            if allow_partial:
                issues.append("approx_market_ml")
            else:
                blocking_issues.append(f"{game_key}: live moneyline odds unavailable")
        if is_pregame and (odds is None or odds.total_line is None or odds.over_price is None or odds.under_price is None):
            if allow_partial:
                issues.append("market_total_missing")
            else:
                blocking_issues.append(f"{game_key}: live totals market unavailable")

        if not allow_partial and is_pregame:
            critical = {
                "lineup_not_posted_api",
                "starter_missing",
                "lineup_verification_missing",
                "lineup_verification_failed",
                "starter_verification_missing",
                "starter_verification_failed",
                "weather_live_missing",
                "approx_market_ml",
                "market_total_missing",
            }
            hard = [issue for issue in issues if issue in critical]
            if hard:
                blocking_issues.append(f"{game_key}: {';'.join(sorted(set(hard)))}")

        lineup_context[game_key] = {
            "away_players": away_players,
            "home_players": home_players,
            "away_label": away_label,
            "home_label": home_label,
            "away_lineup_verification": away_lineup_verification,
            "home_lineup_verification": home_lineup_verification,
            "away_starter_verification": away_starter_verification,
            "home_starter_verification": home_starter_verification,
            "away_pitcher": away_pitcher,
            "home_pitcher": home_pitcher,
            "away_moneyline": away_moneyline,
            "home_moneyline": home_moneyline,
            "odds": odds,
            "weather": weather_snapshot,
            "weather_issue_codes": weather_issue_codes,
            "weather_provider_path": weather_provenance["provider_path"],
            "weather_resolution_source": weather_provenance["resolution_source"],
            "weather_resolution_detail": weather_provenance["resolution_detail"],
            "issues": sorted(set(issues)),
            "venue_name": schedule_game.get("venue_name", ""),
            "roof_type": schedule_game.get("roof_type", ""),
            "game_status_bucket": schedule_game.get("game_status_bucket", "pregame"),
            "game_state": schedule_game.get("game_state", "Yet To Begin"),
            "game_state_detail": schedule_game.get("game_state_detail", "Pre-Game"),
            "game_status_note": schedule_game.get("game_status_note", "Yet to begin"),
            "inning_label": schedule_game.get("inning_label", ""),
            "away_score": schedule_game.get("away_score"),
            "home_score": schedule_game.get("home_score"),
        }

    if blocking_issues and not allow_partial:
        raise LiveDataError("Full-data requirements not satisfied:\n- " + "\n- ".join(blocking_issues))

    batter_ids: set[int] = set()
    pitcher_ids: set[int] = set()
    bullpen_pitcher_ids: set[int] = set()
    for game_key, ctx in lineup_context.items():
        batter_ids.update(int(player["id"]) for player in ctx["away_players"] + ctx["home_players"] if player.get("id"))
        if ctx["away_pitcher"].get("id"):
            pitcher_ids.add(int(ctx["away_pitcher"]["id"]))
        if ctx["home_pitcher"].get("id"):
            pitcher_ids.add(int(ctx["home_pitcher"]["id"]))
        away, home = game_key.split("@", 1)
        for team_abbr, excluded_id in ((away, ctx["away_pitcher"].get("id")), (home, ctx["home_pitcher"].get("id"))):
            for player in rosters.get(team_abbr, {}).values():
                if str(player.get("pos") or "") == "P" and player.get("id") != excluded_id:
                    bullpen_pitcher_ids.add(int(player["id"]))

    matchup_pairs: dict[int, set[int]] = {}
    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        ctx = lineup_context.get(game_key)
        if not ctx:
            continue
        if ctx["home_pitcher"].get("id"):
            matchup_pairs.setdefault(int(ctx["home_pitcher"]["id"]), set()).update(
                int(player["id"]) for player in ctx["away_players"] if player.get("id")
            )
        if ctx["away_pitcher"].get("id"):
            matchup_pairs.setdefault(int(ctx["away_pitcher"]["id"]), set()).update(
                int(player["id"]) for player in ctx["home_players"] if player.get("id")
            )

    people_map = fetch_people_map(batter_ids | pitcher_ids | bullpen_pitcher_ids, season)
    batter_expected = fetch_savant_expected_stats("batter", season)
    batter_statcast = fetch_savant_statcast("batter", season)
    pitcher_expected = fetch_savant_expected_stats("pitcher", season)
    pitcher_statcast = fetch_savant_statcast("pitcher", season)
    vs_pitcher_stats = fetch_vs_pitcher_stats(matchup_pairs)

    batter_features = {
        pid: summarize_hitter_features(
            people_map.get(pid),
            batter_expected.get(pid),
            batter_statcast.get(pid),
            report_end_date=report_end_date,
        )
        for pid in batter_ids
    }
    pitcher_features: dict[int, dict[str, Any]] = {}
    for spec in GAME_SPECS:
        game_key = f"{spec['away']}@{spec['home']}"
        ctx = lineup_context.get(game_key)
        if not ctx:
            continue
        if ctx["away_pitcher"].get("id"):
            pid = int(ctx["away_pitcher"]["id"])
            pitcher_features[pid] = summarize_pitcher_features(
                people_map.get(pid),
                pitcher_expected.get(pid),
                pitcher_statcast.get(pid),
                float(spec["away_xera"]),
                report_end_date=report_end_date,
            )
        if ctx["home_pitcher"].get("id"):
            pid = int(ctx["home_pitcher"]["id"])
            pitcher_features[pid] = summarize_pitcher_features(
                people_map.get(pid),
                pitcher_expected.get(pid),
                pitcher_statcast.get(pid),
                float(spec["home_xera"]),
                report_end_date=report_end_date,
            )

    starter_ids_by_team: dict[str, int | None] = {}
    for ctx in lineup_context.values():
        away_team = str((ctx.get("away_pitcher") or {}).get("team") or "")
        home_team = str((ctx.get("home_pitcher") or {}).get("team") or "")
        starter_ids_by_team[away_team] = parse_int((ctx.get("away_pitcher") or {}).get("id"))
        starter_ids_by_team[home_team] = parse_int((ctx.get("home_pitcher") or {}).get("id"))

    team_bullpen_scores: dict[str, dict[str, Any]] = {}
    for team_abbr in rosters:
        team_bullpen_scores[team_abbr] = summarize_team_bullpen(
            team_abbr,
            rosters,
            people_map,
            pitcher_expected,
            pitcher_statcast,
            starter_ids_by_team.get(team_abbr),
            report_end_date=report_end_date,
        )

    event_ids_by_game = {
        game_key: (ctx["odds"].event_id if isinstance(ctx.get("odds"), GameOdds) else "")
        for game_key, ctx in lineup_context.items()
    }
    propline_hr_props = fetch_propline_hr_props(REPORT_DATE, event_ids_by_game=event_ids_by_game)
    dk_hr_props = fetch_dk_hr_props(REPORT_DATE)
    prop_market_map = fetch_slate_prop_markets(
        REPORT_DATE,
        event_ids_by_game,
        propline_hr_props=propline_hr_props,
        dk_hr_props=dk_hr_props,
    )
    prop_market_coverage: list[dict[str, Any]] = []
    coverage_by_game: dict[str, dict[str, Any]] = {}
    for spec in GAME_SPECS:
        key = f"{spec['away']}@{spec['home']}"
        coverage = summarize_prop_market_coverage(key, lineup_context[key], prop_market_map.get(key, {}))
        coverage_by_game[key] = coverage
        prop_market_coverage.append(coverage)
        lineup_context[key]["hr_provider_path"] = coverage.get("hr_provider_path") or "projection_only"
        if coverage.get("hr_market_integrity") == "degraded":
            lineup_context[key]["issues"] = sorted(
                set(list(lineup_context[key].get("issues") or []) + ["hr_market_integrity_degraded"])
            )
        if coverage["notes"]:
            lineup_context[key]["issues"] = sorted(
                set(list(lineup_context[key].get("issues") or []) + list(coverage["notes"]))
            )
        note_text = ", ".join(coverage["notes"]) or "ok"
        print(
            f"Prop coverage {key}: "
            f"HR away {coverage['away_hr_covered']}/{coverage['away_lineup_size']} "
            f"home {coverage['home_hr_covered']}/{coverage['home_lineup_size']} | "
            f"TB away {coverage['away_tb_covered']}/{coverage['away_lineup_size']} "
            f"home {coverage['home_tb_covered']}/{coverage['home_lineup_size']} | "
            f"path={coverage.get('hr_provider_path') or 'projection_only'} | "
            f"notes={note_text}"
        )
    for diagnostic in get_runtime_diagnostics():
        print(
            f"Data warning [{diagnostic.get('code', 'unknown')}]: "
            f"{diagnostic.get('message', '')}"
        )

    games_rows: list[list[str]] = [
        [
            "report_date",
            "away",
            "home",
            "start_time_et",
            "away_sp",
            "home_sp",
            "away_american",
            "home_american",
            "market_total",
            "market_over_american",
            "market_under_american",
            "weather_summary",
            "weather_temp_f",
            "weather_wind_mph",
            "weather_precip_pct",
            "bullpen_away_score",
            "bullpen_home_score",
            "recent_form_away_score",
            "recent_form_home_score",
            "game_status_bucket",
            "game_state",
            "game_state_detail",
            "game_status_note",
            "away_score",
            "home_score",
            "verification_status",
            "verification_notes",
            "implied_away_pct_nv",
            "implied_home_pct_nv",
            "raw_model_away_win_pct",
            "raw_model_home_win_pct",
            "final_away_win_pct",
            "final_home_win_pct",
            "market_blend_alpha",
            "model_away_win_pct",
            "model_home_win_pct",
            "edge_away_pct",
            "edge_home_pct",
            "prediction",
            "decision_tier_vs_market",
            "edge_on_pick_pct",
            "model_confidence",
            "missing_data_flags",
            "analyst_confidence",
            "rationale_summary",
            "scoring_status",
        ]
    ]

    batter_header = [
        "report_date",
        "game",
        "team",
        "batter",
        "opponent_pitcher",
        "hr_prob_pct",
        "tb2_prob_pct",
        "fair_hr_american",
        "fair_2tb_american",
        "market_hr_american",
        "edge_hr_pct",
        "market_tb_line",
        "market_tb_over_american",
        "edge_tb_pct",
        "recent_form_score",
        "bvp_pa",
        "tier",
        "hr_tier",
        "tb2_tier",
        "recommended_prop",
        "recommended_tier",
        "hr_market_status",
        "hr_market_integrity",
        "tb2_market_status",
        "data_confidence",
        "market_data_status",
        "scoring_status",
    ]
    batter_rows: list[list[str]] = [batter_header]

    computed_games: list[dict[str, Any]] = []
    prop_arrays: dict[str, dict[str, list[dict[str, Any]]]] = {}
    late_blocking_issues: list[str] = []
    game_feature_rows: list[dict[str, Any]] = []
    prop_feature_rows: list[dict[str, Any]] = []

    for spec in GAME_SPECS:
        key = f"{spec['away']}@{spec['home']}"
        ctx = lineup_context[key]
        game_status_bucket = str(ctx.get("game_status_bucket") or "")
        scoring_status = scoring_status_for_bucket(game_status_bucket)
        is_scored = scoring_status == SCORING_STATUS_SCORED
        away_pitcher = ctx["away_pitcher"]
        home_pitcher = ctx["home_pitcher"]
        away_pitch_feats = pitcher_features.get(int(away_pitcher["id"])) if away_pitcher.get("id") else None
        home_pitch_feats = pitcher_features.get(int(home_pitcher["id"])) if home_pitcher.get("id") else None
        weather_snapshot = ctx.get("weather")
        is_pregame = game_status_bucket == "pregame"
        away_recent_score = team_recent_form_score(ctx["away_players"], batter_features)
        home_recent_score = team_recent_form_score(ctx["home_players"], batter_features)
        away_bullpen_score = team_bullpen_scores.get(str(spec["away"]), {}).get("score")
        home_bullpen_score = team_bullpen_scores.get(str(spec["home"]), {}).get("score")
        if not allow_partial and is_pregame:
            if away_recent_score is None:
                late_blocking_issues.append(f"{key}: away recent form unavailable")
            if home_recent_score is None:
                late_blocking_issues.append(f"{key}: home recent form unavailable")
            if away_bullpen_score is None:
                late_blocking_issues.append(f"{key}: away bullpen unavailable")
            if home_bullpen_score is None:
                late_blocking_issues.append(f"{key}: home bullpen unavailable")

        away_prof = make_sp_profile(float((away_pitch_feats or {}).get("xera") or spec["away_xera"]))
        home_prof = make_sp_profile(float((home_pitch_feats or {}).get("xera") or spec["home_xera"]))
        away_lu = build_model_lineup(ctx["away_players"], batter_features)
        home_lu = build_model_lineup(ctx["home_players"], batter_features)

        away_moneyline = parse_int(ctx.get("away_moneyline"))
        home_moneyline = parse_int(ctx.get("home_moneyline"))
        if away_moneyline is not None and home_moneyline is not None:
            ia, ih = devig_two_way(away_moneyline, home_moneyline)
        else:
            ia, ih = 0.5, 0.5
        imp_a, imp_h = ia * 100, ih * 100
        raw_ma: float | None = None
        raw_mh: float | None = None
        ma: float | None = None
        mh: float | None = None
        ea: float | None = None
        eh: float | None = None
        edge_pick: float | None = None
        pred = ""
        tier = "not_scored"
        mconf = ""
        miss: list[str] = []
        if is_scored:
            p_away, p_home, mconf, miss = win_probability_model(
                away_lu,
                home_lu,
                away_prof,
                home_prof,
                weather_snapshot.summary if weather_snapshot else str(spec["weather"]),
                run_environment_label(weather_snapshot.run_factor if weather_snapshot else None),
                away_bullpen_score=away_bullpen_score,
                home_bullpen_score=home_bullpen_score,
                away_recent_form_score=away_recent_score,
                home_recent_form_score=home_recent_score,
                weather_factor=weather_snapshot.run_factor if weather_snapshot else None,
            )
            raw_ma, raw_mh = p_away * 100, p_home * 100
            final_away, final_home = blended_win_probabilities(
                p_away,
                p_home,
                ia,
                ih,
                alpha=DEFAULT_MARKET_BLEND_ALPHA,
            )
            ma, mh = final_away * 100, final_home * 100
            ea, eh = ma - imp_a, mh - imp_h
            pred = spec["away"] if final_away > final_home else spec["home"]
            edge_pick = ea if pred == spec["away"] else eh
            tier = tier_from_edge(edge_pick)
        issues = list(ctx["issues"]) + miss
        flags = ";".join(sorted(set(filter(None, issues))))
        verification_status = "Verified" if not ctx["issues"] else "Partial"

        odds = ctx.get("odds")
        games_rows.append(
            [
                REPORT_DATE,
                str(spec["away"]),
                str(spec["home"]),
                str(spec["time_et"]),
                away_pitcher.get("name", "TBD"),
                home_pitcher.get("name", "TBD"),
                str(away_moneyline) if away_moneyline is not None else "",
                str(home_moneyline) if home_moneyline is not None else "",
                str(odds.total_line) if isinstance(odds, GameOdds) and odds.total_line is not None else "",
                str(odds.over_price) if isinstance(odds, GameOdds) and odds.over_price is not None else "",
                str(odds.under_price) if isinstance(odds, GameOdds) and odds.under_price is not None else "",
                weather_snapshot.summary if weather_snapshot else str(spec["weather"]),
                round_or_blank(weather_snapshot.temperature_f if weather_snapshot else None, 1),
                round_or_blank(weather_snapshot.wind_speed_mph if weather_snapshot else None, 1),
                round_or_blank(weather_snapshot.precipitation_probability_pct if weather_snapshot else None, 0),
                round_or_blank(away_bullpen_score, 3),
                round_or_blank(home_bullpen_score, 3),
                round_or_blank(away_recent_score, 3),
                round_or_blank(home_recent_score, 3),
                str(ctx.get("game_status_bucket") or ""),
                str(ctx.get("game_state") or ""),
                str(ctx.get("game_state_detail") or ""),
                str(ctx.get("game_status_note") or ""),
                "" if ctx.get("away_score") is None else str(ctx.get("away_score")),
                "" if ctx.get("home_score") is None else str(ctx.get("home_score")),
                verification_status,
                "|".join(sorted(set(ctx["issues"]))),
                f"{imp_a:.2f}",
                f"{imp_h:.2f}",
                round_or_blank(raw_ma, 2),
                round_or_blank(raw_mh, 2),
                round_or_blank(ma, 2),
                round_or_blank(mh, 2),
                f"{DEFAULT_MARKET_BLEND_ALPHA:.2f}" if is_scored else "",
                round_or_blank(ma, 2),
                round_or_blank(mh, 2),
                round_or_blank(ea, 2),
                round_or_blank(eh, 2),
                pred,
                tier,
                round_or_blank(edge_pick, 2),
                mconf if is_scored else "not_scored",
                flags,
                str(spec["analyst_confidence"]),
                str(spec["rationale"]).replace("\n", " "),
                scoring_status,
            ]
        )
        computed_games.append(
            {
                "gameKey": key,
                "impliedAwayPct": imp_a,
                "impliedHomePct": imp_h,
                "modelAwayPct": ma if ma is not None else 0.0,
                "modelHomePct": mh if mh is not None else 0.0,
                "edgeAwayPct": ea if ea is not None else 0.0,
                "edgeHomePct": eh if eh is not None else 0.0,
                "prediction": pred if is_scored else "Not Scored",
                "decisionTier": tier if is_scored else "Not Scored",
                "edgeOnPickPct": edge_pick if edge_pick is not None else 0.0,
                "modelConfidence": mconf if is_scored else "Not Scored",
                "flags": flags if is_scored else ";".join(filter(None, [flags, "not_scored_non_pregame"])),
                "scoringStatus": scoring_status,
            }
        )
        game_feature_rows.append(
            {
                "game": key,
                "away": str(spec["away"]),
                "home": str(spec["home"]),
                "away_pitcher": away_pitcher,
                "home_pitcher": home_pitcher,
                "away_pitcher_features": away_pitch_feats,
                "home_pitcher_features": home_pitch_feats,
                "away_bullpen_score": away_bullpen_score,
                "home_bullpen_score": home_bullpen_score,
                "away_recent_form_score": away_recent_score,
                "home_recent_form_score": home_recent_score,
                "weather": serialize_weather(weather_snapshot if isinstance(weather_snapshot, WeatherSnapshot) else None),
                "odds": serialize_game_odds(odds if isinstance(odds, GameOdds) else None),
                "market_blend_alpha": DEFAULT_MARKET_BLEND_ALPHA if is_scored else None,
                "raw_model_away_win_pct": raw_ma,
                "raw_model_home_win_pct": raw_mh,
                "final_away_win_pct": ma,
                "final_home_win_pct": mh,
                "final_model_away_win_pct": ma,
                "final_model_home_win_pct": mh,
                "game_status_bucket": ctx.get("game_status_bucket"),
                "game_state": ctx.get("game_state"),
                "game_state_detail": ctx.get("game_state_detail"),
                "game_status_note": ctx.get("game_status_note"),
                "inning_label": ctx.get("inning_label"),
                "away_score": ctx.get("away_score"),
                "home_score": ctx.get("home_score"),
                "away_lineup_label": ctx["away_label"],
                "home_lineup_label": ctx["home_label"],
                "away_lineup_verification": ctx.get("away_lineup_verification"),
                "home_lineup_verification": ctx.get("home_lineup_verification"),
                "away_starter_verification": ctx.get("away_starter_verification"),
                "home_starter_verification": ctx.get("home_starter_verification"),
                "weather_issue_codes": list(ctx.get("weather_issue_codes") or []),
                "weather_provider_path": list(ctx.get("weather_provider_path") or []),
                "weather_resolution_source": ctx.get("weather_resolution_source"),
                "weather_resolution_detail": ctx.get("weather_resolution_detail"),
                "hr_provider_path": ctx.get("hr_provider_path"),
                "issues": sorted(set(ctx["issues"])),
                "missing_data_flags": flags,
                "scoring_status": scoring_status,
                "prediction": pred,
                "decision_tier": tier,
                "edge_on_pick_pct": edge_pick,
            }
        )

        away_props: list[dict[str, Any]] = []
        home_props: list[dict[str, Any]] = []
        player_markets = prop_market_map.get(key, {})
        for team_is_away, players, opp_pitcher, opp_pitch_feats, lineup_label, opp_bullpen in (
            (True, ctx["away_players"], home_pitcher, home_pitch_feats, ctx["away_label"], home_bullpen_score),
            (False, ctx["home_players"], away_pitcher, away_pitch_feats, ctx["home_label"], away_bullpen_score),
        ):
            opp_prof = make_sp_profile(float((opp_pitch_feats or {}).get("xera") or 4.15))
            side_rows = away_props if team_is_away else home_props
            for player in players:
                feats = batter_features.get(int(player["id"]), {})
                vs_pitcher = (
                    vs_pitcher_stats.get((int(player["id"]), int(opp_pitcher["id"])))
                    if opp_pitcher.get("id") and player.get("id")
                    else None
                )
                player_key = normalize_player_name(player["name"])
                hr_market = player_markets.get((player_key, "batter_home_runs"))
                tb_market = player_markets.get((player_key, "batter_total_bases"))
                hr_market_priced = has_hr_market_price(hr_market)
                tb_market_any = has_any_tb_market(tb_market)
                tb_market_aligned = is_aligned_tb_market(tb_market)
                hr_market_integrity = str(coverage_by_game.get(key, {}).get("hr_market_integrity") or "partial")
                hr_provider_path = str(coverage_by_game.get(key, {}).get("hr_provider_path") or "projection_only")
                market_status = "full" if hr_market_priced and tb_market_aligned else "partial" if hr_market_priced or tb_market_any else "none"
                hr: float | None = None
                tb2: float | None = None
                fair_hr = ""
                fair_2tb = ""
                hr_tier = ""
                tb2_tier = ""
                pconf = ""
                edge_hr_pct: float | None = None
                edge_tb_pct: float | None = None
                hr_market_status = "not_scored"
                tb2_market_status = "not_scored"
                recommended_prop = ""
                recommended_tier = ""
                display_tier = ""
                hr_display_tier = ""
                should_render_prop_projection = game_status_bucket != "final"
                if should_render_prop_projection:
                    hr, tb2, fair_hr, fair_2tb, hr_tier, tb2_tier, pconf = batter_hr_two_tb(
                        str(spec["away"]),
                        str(spec["home"]),
                        team_is_away,
                        player["name"],
                        away_lu if team_is_away else home_lu,
                        opp_prof,
                        batter_hand=str(feats.get("bat_hand") or ""),
                        pitcher_hand=str((opp_pitch_feats or {}).get("pitch_hand") or ""),
                        xslg_override=feats.get("xslg"),
                        barrel_rate=feats.get("barrel_rate"),
                        actual_slg=feats.get("slg"),
                        hard_hit_rate=feats.get("hard_hit_rate"),
                        avg_hit_speed=feats.get("avg_hit_speed"),
                        est_ba=feats.get("est_ba"),
                        plate_appearances=feats.get("plate_appearances"),
                        home_runs=feats.get("home_runs"),
                        opp_xera_override=(opp_pitch_feats or {}).get("xera"),
                        opp_est_slg=(opp_pitch_feats or {}).get("est_slg"),
                        opp_barrel_rate=(opp_pitch_feats or {}).get("barrel_rate"),
                        opp_hard_hit_rate=(opp_pitch_feats or {}).get("hard_hit_rate"),
                        recent_slg=feats.get("recent_slg"),
                        recent_ops=feats.get("recent_ops"),
                        recent_hr_rate=feats.get("recent_hr_rate"),
                        recent_tb_rate=feats.get("recent_tb_rate"),
                        weather_factor=weather_snapshot.run_factor if weather_snapshot else None,
                        opp_bullpen_score=opp_bullpen,
                        starter_recent_form_score=(opp_pitch_feats or {}).get("recent_form_score"),
                        vs_pitcher_pa=(vs_pitcher or {}).get("pa"),
                        vs_pitcher_ab=(vs_pitcher or {}).get("ab"),
                        vs_pitcher_hits=(vs_pitcher or {}).get("hits"),
                        vs_pitcher_hr=(vs_pitcher or {}).get("home_runs"),
                        vs_pitcher_total_bases=(vs_pitcher or {}).get("total_bases"),
                    )
                    edge_hr_pct = (
                        (hr * 100) - (american_to_implied(hr_market.over_price) * 100)
                        if hr_market_priced and hr is not None
                        else None
                    )
                    edge_tb_pct = (
                        (tb2 * 100) - (american_to_implied(tb_market.over_price) * 100)
                        if tb_market_aligned and tb_market and tb_market.over_price is not None and tb2 is not None
                        else None
                    )
                    hr_market_status = classify_hr_market_status(
                        edge_hr_pct,
                        hr_tier,
                        pconf,
                        hr_market,
                        hr_market_integrity=hr_market_integrity,
                    )
                    hr_display_tier = _downgrade_prop_tier(hr_tier) if hr_market_status == "qualified_partial" else hr_tier
                    tb2_market_status = classify_tb_market_status(
                        edge_tb_pct,
                        tb2,
                        tb2_tier,
                        pconf,
                        tb_market,
                        market_status,
                    )
                    recommended_prop, recommended_tier = choose_recommended_prop(
                        hr_market_status,
                        tb2_market_status,
                        edge_hr_pct,
                        edge_tb_pct,
                        hr_tier,
                        tb2_tier,
                    )
                    if recommended_prop == "HR" and recommended_tier:
                        recommended_tier = hr_display_tier
                    display_tier = recommended_tier or stronger_tier(hr_display_tier or hr_tier, tb2_tier)
                if not allow_partial and is_pregame:
                    if not hr_market_priced:
                        coverage_notes = list(coverage_by_game.get(key, {}).get("notes") or [])
                        reason = _hr_missing_market_reason(team_is_away, coverage_notes)
                        late_blocking_issues.append(f"{key}: missing HR market for {player['name']}{reason}")
                    if tb_market is None or tb_market.over_price is None:
                        late_blocking_issues.append(f"{key}: missing TB market for {player['name']}")
                    elif not tb_market_aligned:
                        point_label = f"{tb_market.point:g}" if tb_market.point is not None else "unknown"
                        late_blocking_issues.append(
                            f"{key}: TB market not 1.5 for {player['name']} (got {point_label})"
                        )
                if is_scored:
                    note = build_prop_note(
                        feats,
                        opp_pitch_feats or {},
                        str(spec["away"]),
                        str(spec["home"]),
                        vs_pitcher=vs_pitcher,
                        weather_factor=weather_snapshot.run_factor if weather_snapshot else None,
                        opp_bullpen_score=opp_bullpen,
                    )
                    if tb_market_any and not tb_market_aligned and tb_market and tb_market.point is not None:
                        note = f"{note}; TB book at {tb_market.point:g}, not 1.5-aligned"
                    if recommended_prop and recommended_tier:
                        note = f"{note}; priced lean: {recommended_prop} ({recommended_tier})"
                    if hr_market_integrity == "degraded":
                        note = f"{note}; HR market degraded, HR output projection only"
                    elif hr_market_integrity == "partial":
                        note = f"{note}; HR market partial via {hr_provider_path}, HR tier downgraded"
                    dc = build_data_confidence(pconf, lineup_label, market_status)
                    if hr_market_integrity == "degraded":
                        dc = f"{dc} — HR market degraded"
                    elif hr_market_integrity == "partial":
                        dc = f"{dc} — HR market partial via {hr_provider_path}"
                else:
                    status_note = str(ctx.get("game_status_note") or ctx.get("game_state_detail") or "game no longer pregame")
                    note = f"Not scored — {status_note}"
                    if should_render_prop_projection:
                        display_note = build_prop_note(
                            feats,
                            opp_pitch_feats or {},
                            str(spec["away"]),
                            str(spec["home"]),
                            vs_pitcher=vs_pitcher,
                            weather_factor=weather_snapshot.run_factor if weather_snapshot else None,
                            opp_bullpen_score=opp_bullpen,
                        )
                        if tb_market_any and not tb_market_aligned and tb_market and tb_market.point is not None:
                            display_note = f"{display_note}; TB book at {tb_market.point:g}, not 1.5-aligned"
                        if recommended_prop and recommended_tier:
                            display_note = f"{display_note}; priced lean: {recommended_prop} ({recommended_tier})"
                        if hr_market_integrity == "degraded":
                            display_note = f"{display_note}; HR market degraded, HR output projection only"
                        elif hr_market_integrity == "partial":
                            display_note = f"{display_note}; HR market partial via {hr_provider_path}, HR tier downgraded"
                        if display_note:
                            note = f"Display only — {status_note}; {display_note}"
                        else:
                            note = f"Display only — {status_note}"
                    dc = "Display only"
                batter_rows.append(
                    [
                        REPORT_DATE,
                        key,
                        str(spec["away"] if team_is_away else spec["home"]),
                        player["name"],
                        opp_pitcher.get("name", "TBD"),
                        f"{hr * 100:.2f}" if hr is not None else "",
                        f"{tb2 * 100:.2f}" if tb2 is not None else "",
                        fair_hr,
                        fair_2tb,
                        str(hr_market.over_price) if hr_market and hr_market.over_price is not None else "NA",
                        round_or_blank(edge_hr_pct, 2) if edge_hr_pct is not None else "",
                        str(tb_market.point) if tb_market and tb_market.point is not None else "",
                        str(tb_market.over_price) if tb_market and tb_market.over_price is not None else "",
                        round_or_blank(edge_tb_pct, 2) if edge_tb_pct is not None else "",
                        round_or_blank(feats.get("recent_form_score"), 3),
                        str((vs_pitcher or {}).get("pa") or 0),
                        display_tier,
                        hr_tier,
                        tb2_tier,
                        recommended_prop,
                        recommended_tier,
                        hr_market_status,
                        hr_market_integrity,
                        tb2_market_status,
                        dc,
                        market_status,
                        scoring_status,
                    ]
                )
                prop_feature_rows.append(
                    {
                        "game": key,
                        "team": str(spec["away"] if team_is_away else spec["home"]),
                        "batter": player["name"],
                        "opponent_pitcher": opp_pitcher.get("name", "TBD"),
                        "lineup_label": lineup_label,
                        "batter_features": feats,
                        "pitcher_features": opp_pitch_feats,
                        "vs_pitcher": vs_pitcher,
                        "weather": serialize_weather(weather_snapshot if isinstance(weather_snapshot, WeatherSnapshot) else None),
                        "opp_bullpen_score": opp_bullpen,
                        "game_status_bucket": ctx.get("game_status_bucket"),
                        "game_state": ctx.get("game_state"),
                        "game_state_detail": ctx.get("game_state_detail"),
                        "game_status_note": ctx.get("game_status_note"),
                        "market_hr": serialize_prop_market(hr_market if isinstance(hr_market, PropMarketLine) else None),
                        "market_tb": serialize_prop_market(tb_market if isinstance(tb_market, PropMarketLine) else None),
                        "hr_prob": hr,
                        "tb2_prob": tb2,
                        "fair_hr": fair_hr,
                        "fair_2tb": fair_2tb,
                        "tier": display_tier,
                        "hr_tier": hr_tier,
                        "tb2_tier": tb2_tier,
                        "scoring_status": scoring_status,
                        "recommended_prop": recommended_prop,
                        "recommended_tier": recommended_tier,
                        "edge_hr_pct": edge_hr_pct,
                        "edge_tb_pct": edge_tb_pct,
                        "hr_market_status": hr_market_status,
                        "hr_market_integrity": hr_market_integrity,
                        "hr_provider_path": hr_provider_path,
                        "tb2_market_status": tb2_market_status,
                        "model_confidence": pconf,
                        "data_confidence": dc,
                        "market_status": market_status,
                    }
                )
                side_rows.append(
                    {
                        "batter": player["name"],
                        "team": str(spec["away"] if team_is_away else spec["home"]),
                        "hrPct": (hr or 0.0) * 100,
                        "tb2Pct": (tb2 or 0.0) * 100,
                        "tier": (
                            f"HR {hr_tier} / TB {tb2_tier}"
                            if (hr_tier or tb2_tier)
                            else ("Not Scored" if not should_render_prop_projection else "Display only")
                        ),
                        "note": note,
                    }
                )
        prop_arrays[key] = {"away": away_props, "home": home_props}

    if late_blocking_issues and not allow_partial:
        raise LiveDataError("Full-data requirements not satisfied:\n- " + "\n- ".join(sorted(set(late_blocking_issues))))

    gcsv = csv_block(games_rows)
    bcsv = csv_block(batter_rows)
    assert_no_comment_breaker(gcsv, "games CSV")
    assert_no_comment_breaker(bcsv, "batter outlooks CSV")

    updated = replace_marker_region(original, "games-csv", gcsv)
    updated = replace_marker_region(updated, "batter-outlooks-csv", bcsv)

    for cg in computed_games:
        span = extract_game_block(updated, cg["gameKey"])
        if not span:
            raise ValueError(f"Missing SLATE game block for {cg['gameKey']}")
        start, end = span
        block = updated[start:end]
        block = patch_float_field(block, "impliedAwayPct", cg["impliedAwayPct"])
        block = patch_float_field(block, "impliedHomePct", cg["impliedHomePct"])
        block = patch_float_field(block, "modelAwayPct", cg["modelAwayPct"])
        block = patch_float_field(block, "modelHomePct", cg["modelHomePct"])
        block = patch_float_field(block, "edgeAwayPct", cg["edgeAwayPct"])
        block = patch_float_field(block, "edgeHomePct", cg["edgeHomePct"])
        block = patch_string_field(block, "prediction", cg["prediction"])
        block = patch_string_field(block, "decisionTier", cg["decisionTier"])
        block = patch_float_field(block, "edgeOnPickPct", cg["edgeOnPickPct"])
        block = patch_string_field(block, "modelConfidence", cg["modelConfidence"])
        block = patch_string_field(block, "flags", cg["flags"])
        ctx = lineup_context[cg["gameKey"]]
        block = upsert_string_field(block, "gameStatusBucket", str(ctx["game_status_bucket"]), after_field="timeEt")
        block = upsert_string_field(block, "gameState", str(ctx["game_state"]), after_field="gameStatusBucket")
        block = upsert_string_field(block, "gameStateDetail", str(ctx["game_state_detail"]), after_field="gameState")
        block = upsert_string_field(block, "gameStatusNote", str(ctx["game_status_note"]), after_field="gameStateDetail")
        block = upsert_literal_field(
            block,
            "awayScore",
            "null" if ctx.get("away_score") is None else str(int(ctx["away_score"])),
            after_field="gameStatusNote",
        )
        block = upsert_literal_field(
            block,
            "homeScore",
            "null" if ctx.get("home_score") is None else str(int(ctx["home_score"])),
            after_field="awayScore",
        )
        block = patch_string_field(block, "awayLuLabel", ctx["away_label"])
        block = patch_string_field(block, "homeLuLabel", ctx["home_label"])
        block = replace_array_field(block, "awayLineup", render_lineup_rows(ctx["away_players"]))
        block = replace_array_field(block, "homeLineup", render_lineup_rows(ctx["home_players"]))
        block = replace_array_field(block, "propsAway", render_prop_rows(prop_arrays[cg["gameKey"]]["away"]))
        block = replace_array_field(block, "propsHome", render_prop_rows(prop_arrays[cg["gameKey"]]["home"]))
        updated = updated[:start] + block + updated[end:]

    path.write_text(updated, encoding="utf-8")
    snapshot_path = write_run_snapshot(
        path,
        allow_partial=allow_partial,
        lineup_context=lineup_context,
        games_rows=games_rows,
        batter_rows=batter_rows,
        game_feature_rows=game_feature_rows,
        prop_feature_rows=prop_feature_rows,
        team_bullpen_scores=team_bullpen_scores,
        runtime_diagnostics=get_runtime_diagnostics(),
        prop_market_coverage=prop_market_coverage,
    )
    print("Updated model-driven markers + SLATE:", path)
    print("Wrote snapshot:", snapshot_path)
