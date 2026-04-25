#!/usr/bin/env python3
"""Build date-driven exports from dated MLB pregame canvas marker blocks."""
from __future__ import annotations

import argparse
import csv
import html
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from io import StringIO
from pathlib import Path

from pipeline.slate import slug_from_calendar_date
from pipeline.inputs import load_slate_inputs

OUT_DIR = Path(__file__).resolve().parent
REPO_ROOT = OUT_DIR.parent.parent
CANVAS_DIR = OUT_DIR.parent
DEFAULT_SLUG = "apr15"

GAMES_HEADERS = [
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

BATTER_HEADERS = [
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
    "tb2_market_status",
    "data_confidence",
    "market_data_status",
    "scoring_status",
]

SCORING_STATUS_SCORED = "scored"
SCORING_STATUS_NOT_SCORED = "not_scored"
SCORING_STATUS_SCAFFOLD_UNVERIFIED = "scaffold_unverified"
SCORING_STATUS_DATA_BLOCKED = "data_blocked"
MODEL_OUTPUT_FIELDS = {
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
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate CSV and HTML exports from a dated canvas file."
    )
    parser.add_argument(
        "--date",
        default=DEFAULT_SLUG,
        help="Date selector: YYYY-MM-DD or slug format like apr16 (default: apr15).",
    )
    parser.add_argument(
        "--compute",
        action="store_true",
        help="Supported slates (for example apr16, apr18, apr19): run MLB Stats API + models, update canvas markers and SLATE, then export.",
    )
    parser.add_argument(
        "--allow-partial",
        action="store_true",
        help="Allow fallbacks when strict live-data requirements are not fully satisfied.",
    )
    parser.add_argument(
        "--include-bvp",
        action="store_true",
        help="Opt into batter-vs-pitcher matchup history. Disabled by default because the current source is not as-of-safe for historical validation.",
    )
    return parser.parse_args()


def resolve_slug(raw_date: str) -> str:
    try:
        return slug_from_calendar_date(raw_date, allow_slug_passthrough=True)
    except ValueError as exc:
        raise ValueError(
            "Invalid --date value. Use YYYY-MM-DD (e.g., 2026-04-16) or slug (e.g., apr16)."
        ) from exc


def extract_marker_block(source: str, marker_name: str) -> str | None:
    pattern = (
        rf"<!--\s*{re.escape(marker_name)}:start\s*-->"
        rf"(.*?)"
        rf"<!--\s*{re.escape(marker_name)}:end\s*-->"
    )
    match = re.search(pattern, source, flags=re.DOTALL | re.IGNORECASE)
    if not match:
        return None
    return match.group(1).strip()


def parse_csv_block(block: str | None, fallback_headers: list[str], label: str) -> list[list[str]]:
    if not block:
        print(f"Warning: missing marker block '{label}'. Using header-only CSV fallback.")
        return [fallback_headers]

    rows = list(csv.reader(StringIO(block)))
    rows = [row for row in rows if any(cell.strip() for cell in row)]
    if not rows:
        print(f"Warning: marker block '{label}' is empty. Using header-only CSV fallback.")
        return [fallback_headers]

    return rows


def write_csv(path: Path, rows: list[list[str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh, lineterminator="\n")
        writer.writerows(rows)


def rows_to_dicts(rows: list[list[str]]) -> list[dict[str, str]]:
    if not rows:
        return []
    header = rows[0]
    out: list[dict[str, str]] = []
    for row in rows[1:]:
        padded = row + [""] * (len(header) - len(row))
        out.append(dict(zip(header, padded[: len(header)])))
    return out


def table_html(rows: list[list[str]], title: str) -> str:
    if not rows:
        return f"<h2>{html.escape(title)}</h2><p>No data.</p>"

    head = rows[0]
    body = rows[1:]
    parts = [f"<h2>{html.escape(title)}</h2>", "<div class='table-scroll'><table><thead><tr>"]
    for cell in head:
        parts.append(f"<th>{html.escape(cell)}</th>")
    parts.append("</tr></thead><tbody>")
    for row in body:
        parts.append("<tr>")
        for cell in row:
            parts.append(f"<td>{html.escape(cell)}</td>")
        parts.append("</tr>")
    parts.append("</tbody></table></div>")
    return "".join(parts)


def parse_float(value: object) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if text in {"", "NA", "N/A", "None", "null"}:
        return None
    try:
        return float(text.replace(",", ""))
    except ValueError:
        return None


def parse_int(value: object) -> int | None:
    parsed = parse_float(value)
    return int(parsed) if parsed is not None else None


def game_key_for_row(row: dict[str, str]) -> str:
    if row.get("game"):
        return row["game"].strip().upper()
    away = row.get("away", "").strip().upper()
    home = row.get("home", "").strip().upper()
    return f"{away}@{home}" if away and home else ""


def normalized_scoring_status(row: dict[str, object], fallback_bucket: str | None = None) -> str:
    raw = str(row.get("scoring_status") or "").strip().lower()
    if raw in {
        SCORING_STATUS_SCORED,
        SCORING_STATUS_NOT_SCORED,
        SCORING_STATUS_SCAFFOLD_UNVERIFIED,
        SCORING_STATUS_DATA_BLOCKED,
    }:
        return raw
    bucket = str(row.get("game_status_bucket") or fallback_bucket or "").strip().lower()
    if not bucket:
        return SCORING_STATUS_SCORED
    return SCORING_STATUS_SCORED if bucket == "pregame" else SCORING_STATUS_NOT_SCORED


def is_scored_row(row: dict[str, object], fallback_bucket: str | None = None) -> bool:
    return normalized_scoring_status(row, fallback_bucket) == SCORING_STATUS_SCORED


def _append_flag(existing: str, flag: str) -> str:
    parts = [part.strip() for part in (existing or "").split(";") if part.strip()]
    if flag not in parts:
        parts.append(flag)
    return ";".join(parts)


def _is_placeholder_xera_game(spec: dict[str, object]) -> bool:
    try:
        return float(spec.get("away_xera")) == 4.15 and float(spec.get("home_xera")) == 4.15
    except (TypeError, ValueError):
        return False


def _has_compute_refreshed_game_fields(row: dict[str, str]) -> bool:
    return all((row.get(field) or "").strip() for field in [
        "raw_model_away_win_pct",
        "raw_model_home_win_pct",
        "final_away_win_pct",
        "final_home_win_pct",
    ])


def apply_scaffold_export_guard(slug: str, games_rows: list[list[str]]) -> list[str]:
    if not games_rows:
        return []
    try:
        if str(REPO_ROOT) not in sys.path:
            sys.path.insert(0, str(REPO_ROOT))
        slate_inputs = load_slate_inputs(slug)
    except Exception:
        return []

    header = games_rows[0]
    idx = {name: pos for pos, name in enumerate(header)}
    specs = {
        f"{str(spec.get('away', '')).upper()}@{str(spec.get('home', '')).upper()}": spec
        for spec in slate_inputs.game_specs
        if _is_placeholder_xera_game(spec)
    }
    warnings: list[str] = []
    if not specs:
        return warnings

    for row in games_rows[1:]:
        padded = row + [""] * (len(header) - len(row))
        row_dict = dict(zip(header, padded[: len(header)]))
        game_key = f"{row_dict.get('away', '').strip().upper()}@{row_dict.get('home', '').strip().upper()}"
        if game_key not in specs or _has_compute_refreshed_game_fields(row_dict):
            continue
        for field in MODEL_OUTPUT_FIELDS:
            if field in idx:
                padded[idx[field]] = ""
        if "decision_tier_vs_market" in idx:
            padded[idx["decision_tier_vs_market"]] = SCORING_STATUS_SCAFFOLD_UNVERIFIED
        if "model_confidence" in idx:
            padded[idx["model_confidence"]] = SCORING_STATUS_SCAFFOLD_UNVERIFIED
        if "missing_data_flags" in idx:
            padded[idx["missing_data_flags"]] = _append_flag(padded[idx["missing_data_flags"]], "scaffold_xera_unverified")
        if "scoring_status" in idx:
            padded[idx["scoring_status"]] = SCORING_STATUS_SCAFFOLD_UNVERIFIED
        row[:] = padded[: len(header)]
        warnings.append(game_key)
    return warnings


def evaluation_reason_text(reason: str) -> str:
    return {
        "allow_partial": "run used allow-partial fallback mode",
        "no_games": "snapshot contains no games",
        "contains_non_pregame_scored_games": "a non-pregame game was still scored",
        "no_scored_games": "snapshot contains no scored games",
    }.get(reason, reason.replace("_", " "))


def summarize_snapshot_evaluation(
    allow_partial: bool,
    game_rows: list[dict[str, str]],
    prop_rows: list[dict[str, str]],
) -> dict[str, object]:
    reasons: list[str] = []
    if allow_partial:
        reasons.append("allow_partial")
    if not game_rows:
        reasons.append("no_games")
    if any(
        str(row.get("game_status_bucket") or "").strip().lower() != "pregame" and is_scored_row(row)
        for row in game_rows
    ):
        reasons.append("contains_non_pregame_scored_games")

    scored_games = sum(1 for row in game_rows if is_scored_row(row))
    blocked_games = sum(1 for row in game_rows if normalized_scoring_status(row) == SCORING_STATUS_DATA_BLOCKED)
    scored_props = sum(1 for row in prop_rows if is_scored_row(row))
    blocked_props = sum(1 for row in prop_rows if normalized_scoring_status(row) == SCORING_STATUS_DATA_BLOCKED)
    if scored_games <= 0:
        reasons.append("no_scored_games")
    eligible = not reasons
    return {
        "eligible": eligible,
        "status": "eligible" if eligible else "not_evaluable",
        "reasons": reasons,
        "scored_games": scored_games,
        "actionable_games": scored_games,
        "blocked_games": blocked_games,
        "not_scored_games": len(game_rows) - scored_games,
        "scored_props": scored_props,
        "blocked_props": blocked_props,
        "not_scored_props": len(prop_rows) - scored_props,
    }


def derive_evaluation(snapshot: dict | None, game_rows: list[dict[str, str]], prop_rows: list[dict[str, str]]) -> dict[str, object]:
    allow_partial = bool(snapshot.get("allow_partial")) if isinstance(snapshot, dict) else False
    return summarize_snapshot_evaluation(allow_partial, game_rows, prop_rows)


def load_latest_snapshot(slug: str) -> dict | None:
    snapshot_path = OUT_DIR / "snapshots" / slug / f"{slug}-latest.json"
    if not snapshot_path.exists():
        return None
    try:
        return json.loads(snapshot_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def bucket_order(bucket: str) -> int:
    return {"pregame": 0, "live": 1, "final": 2, "other": 3}.get((bucket or "").lower(), 4)


def bucket_title(bucket: str) -> str:
    return {
        "pregame": "Yet To Begin",
        "live": "In Progress",
        "final": "Completed",
        "other": "Other",
    }.get((bucket or "").lower(), "Other")


def format_time_sort_key(value: str) -> tuple[int, int]:
    text = (value or "").strip()
    if not text:
        return (99, 99)
    try:
        dt = datetime.strptime(text, "%I:%M %p")
        return (dt.hour, dt.minute)
    except ValueError:
        return (99, 99)


def format_pct(value: str | None, digits: int = 2) -> str:
    number = parse_float(value)
    return "NA" if number is None else f"{number:.{digits}f}%"


def format_model_pct(value: object, digits: int = 2) -> str:
    number = parse_float(value)
    if number is None:
        return "NA"
    if -1.0 <= number <= 1.0:
        number *= 100
    return f"{number:.{digits}f}%"


def game_raw_model_pct(row: dict[str, object], side: str) -> object:
    return row.get(f"raw_model_{side}_win_pct") or row.get(f"model_{side}_win_pct")


def game_final_model_pct(row: dict[str, object], side: str) -> object:
    return (
        row.get(f"final_{side}_win_pct")
        or row.get(f"final_model_{side}_win_pct")
        or row.get(f"model_{side}_win_pct")
    )


def game_blend_alpha(row: dict[str, object], feature: dict | None = None) -> float | None:
    alpha = parse_float(row.get("market_blend_alpha"))
    if alpha is not None:
        return alpha
    if isinstance(feature, dict):
        return parse_float(feature.get("market_blend_alpha"))
    return None


def format_signed_pct(value: str | None, digits: int = 2) -> str:
    number = parse_float(value)
    return "NA" if number is None else f"{number:+.{digits}f}%"


def format_american(value: str | None) -> str:
    number = parse_int(value)
    if number is None:
        return "NA"
    return f"+{number}" if number > 0 else str(number)


def render_pill(label: str, tone: str = "neutral") -> str:
    return f"<span class='pill pill-{tone}'>{html.escape(label)}</span>"


def render_stat(label: str, value: str) -> str:
    return (
        "<div class='stat-card'>"
        f"<div class='stat-value'>{html.escape(value)}</div>"
        f"<div class='stat-label'>{html.escape(label)}</div>"
        "</div>"
    )


def format_decimal(value: object, digits: int = 3) -> str:
    number = parse_float(value)
    return "NA" if number is None else f"{number:.{digits}f}"


def team_for_prediction(row: dict[str, str]) -> tuple[str, str]:
    pick = row.get("prediction", "")
    away = row.get("away", "")
    home = row.get("home", "")
    if pick == away:
        return away, home
    if pick == home:
        return home, away
    return pick or away, home if pick == away else away


def handedness_matchup(bat_hand: object, pitch_hand: object) -> str:
    bat = str(bat_hand or "").upper()[:1]
    pitch = str(pitch_hand or "").upper()[:1]
    if not bat or not pitch:
        return ""
    if bat == "S":
        return f"S vs {pitch}"
    return f"{bat}HB vs {pitch}HP"


def weather_reason(weather: dict | None) -> str:
    if not isinstance(weather, dict):
        return ""
    run_factor = parse_float(weather.get("run_factor"))
    if run_factor is None:
        return ""
    if run_factor >= 1.03:
        return "weather boosts offense"
    if run_factor <= 0.97:
        return "weather suppresses carry"
    return ""


def bullpen_reason(score: object, *, for_hitter: bool = False) -> str:
    number = parse_float(score)
    if number is None:
        return ""
    if for_hitter:
        if number <= 0.42:
            return "favorable bullpen behind SP"
        if number >= 0.65:
            return "strong bullpen behind SP"
        return ""
    if number >= 0.55:
        return f"bullpen edge {number:.3f}"
    if number <= 0.38:
        return f"bullpen risk {number:.3f}"
    return ""


def recent_form_reason(score: object, label: str) -> str:
    number = parse_float(score)
    if number is None:
        return ""
    if number >= 0.62:
        return f"{label} hot ({number:.3f})"
    if number <= 0.40:
        return f"{label} cold ({number:.3f})"
    return f"{label} form {number:.3f}"


def game_reason_summary(row: dict[str, str], feature: dict | None) -> str:
    if not is_scored_row(row):
        detail = str(row.get("game_status_note") or row.get("game_state_detail") or row.get("game_status_bucket") or "game no longer pregame")
        return f"Not scored — {detail}"
    if not isinstance(feature, dict):
        return row.get("rationale_summary", "")
    pick, opp = team_for_prediction(row)
    pick_prefix = "away" if pick == row.get("away") else "home"
    opp_prefix = "home" if pick_prefix == "away" else "away"
    pick_pitch = feature.get(f"{pick_prefix}_pitcher") or {}
    opp_pitch = feature.get(f"{opp_prefix}_pitcher") or {}
    pick_pitch_feats = feature.get(f"{pick_prefix}_pitcher_features") or {}
    opp_pitch_feats = feature.get(f"{opp_prefix}_pitcher_features") or {}

    reasons: list[str] = []
    pick_xera = parse_float(pick_pitch_feats.get("xera"))
    opp_xera = parse_float(opp_pitch_feats.get("xera"))
    if pick_xera is not None and opp_xera is not None and abs(pick_xera - opp_xera) >= 0.35:
        if pick_xera < opp_xera:
            reasons.append(
                f"{pick_pitch.get('name', pick)} brings the SP edge ({pick_xera:.2f} xERA vs {opp_pitch.get('name', opp)} {opp_xera:.2f})"
            )
        else:
            reasons.append(
                f"pick is lineup/bullpen-driven despite the SP xERA deficit ({pick_xera:.2f} vs {opp_xera:.2f})"
            )

    pick_recent = parse_float(feature.get(f"{pick_prefix}_recent_form_score"))
    opp_recent = parse_float(feature.get(f"{opp_prefix}_recent_form_score"))
    if pick_recent is not None and opp_recent is not None and abs(pick_recent - opp_recent) >= 0.03:
        if pick_recent > opp_recent:
            reasons.append(f"{pick} recent form {pick_recent:.3f} vs {opp} {opp_recent:.3f}")
        else:
            reasons.append(f"pick is working against a recent-form deficit ({pick_recent:.3f} vs {opp_recent:.3f})")

    pick_pen = parse_float(feature.get(f"{pick_prefix}_bullpen_score"))
    opp_pen = parse_float(feature.get(f"{opp_prefix}_bullpen_score"))
    if pick_pen is not None and opp_pen is not None and abs(pick_pen - opp_pen) >= 0.04:
        if pick_pen > opp_pen:
            reasons.append(f"bullpen edge {pick} ({pick_pen:.3f} vs {opp_pen:.3f})")
        else:
            reasons.append(f"pick carries a bullpen deficit ({pick_pen:.3f} vs {opp_pen:.3f})")

    wx = weather_reason(feature.get("weather"))
    if wx:
        reasons.append(wx)

    issues = feature.get("issues") or []
    if issues:
        reasons.append("source mismatch in live inputs")

    return "; ".join(reasons[:4]) or row.get("rationale_summary", "")


def game_reason_badges(row: dict[str, str], feature: dict | None) -> list[str]:
    if not is_scored_row(row):
        return ["Not scored"]
    if not isinstance(feature, dict):
        return []
    pick, opp = team_for_prediction(row)
    pick_prefix = "away" if pick == row.get("away") else "home"
    opp_prefix = "home" if pick_prefix == "away" else "away"
    pick_pitch_feats = feature.get(f"{pick_prefix}_pitcher_features") or {}
    opp_pitch_feats = feature.get(f"{opp_prefix}_pitcher_features") or {}
    badges: list[str] = []
    pick_xera = parse_float(pick_pitch_feats.get("xera"))
    opp_xera = parse_float(opp_pitch_feats.get("xera"))
    if pick_xera is not None and opp_xera is not None:
        if pick_xera < opp_xera - 0.35:
            badges.append("SP edge")
        elif pick_xera > opp_xera + 0.35:
            badges.append("SP deficit")
    pick_recent = parse_float(feature.get(f"{pick_prefix}_recent_form_score"))
    opp_recent = parse_float(feature.get(f"{opp_prefix}_recent_form_score"))
    if pick_recent is not None and opp_recent is not None and pick_recent > opp_recent + 0.03:
        badges.append("form edge")
    pick_pen = parse_float(feature.get(f"{pick_prefix}_bullpen_score"))
    opp_pen = parse_float(feature.get(f"{opp_prefix}_bullpen_score"))
    if pick_pen is not None and opp_pen is not None and pick_pen > opp_pen + 0.04:
        badges.append("bullpen edge")
    wx = weather_reason(feature.get("weather"))
    if wx == "weather suppresses carry":
        badges.append("lower-scoring weather")
    elif wx == "weather boosts offense":
        badges.append("hitter weather")
    return badges[:4]


def prop_reason_summary(feature: dict | None) -> str:
    if not isinstance(feature, dict):
        return ""
    display_only = (
        not is_scored_row(feature)
        and (
            parse_float(feature.get("hr_prob")) is not None
            or parse_float(feature.get("tb2_prob")) is not None
            or parse_float(feature.get("hr_prob_pct")) is not None
            or parse_float(feature.get("tb2_prob_pct")) is not None
        )
    )
    detail = str(feature.get("game_status_note") or feature.get("game_state_detail") or feature.get("game_status_bucket") or "game no longer pregame")
    if not is_scored_row(feature) and not display_only:
        return f"Not scored — {detail}"
    batter = feature.get("batter_features") or {}
    pitcher = feature.get("pitcher_features") or {}
    vs_pitcher = feature.get("vs_pitcher") or {}
    reasons: list[str] = []

    matchup = handedness_matchup(batter.get("bat_hand"), pitcher.get("pitch_hand"))
    if matchup:
        reasons.append(matchup)

    barrel = parse_float(batter.get("barrel_rate"))
    xslg = parse_float(batter.get("xslg"))
    hard_hit = parse_float(batter.get("hard_hit_rate"))
    if barrel is not None and barrel >= 0.15:
        reasons.append(f"elite barrel ({barrel * 100:.1f}%)")
    elif xslg is not None and xslg >= 0.5:
        reasons.append(f"strong xSLG ({xslg:.3f})")
    elif hard_hit is not None and hard_hit >= 0.45:
        reasons.append(f"hard contact ({hard_hit * 100:.1f}%)")

    recent_ops = parse_float(batter.get("recent_ops"))
    recent_tb_rate = parse_float(batter.get("recent_tb_rate"))
    recent_hr_rate = parse_float(batter.get("recent_hr_rate"))
    if recent_ops is not None and recent_ops >= 0.9:
        reasons.append(f"hot form ({recent_ops:.3f} OPS)")
    elif recent_tb_rate is not None and recent_tb_rate >= 0.45:
        reasons.append(f"recent TB surge ({recent_tb_rate:.3f}/PA)")
    elif recent_hr_rate is not None and recent_hr_rate >= 0.06:
        reasons.append(f"recent HR form ({recent_hr_rate:.3f}/PA)")

    pitcher_xera = parse_float(pitcher.get("xera"))
    if pitcher_xera is not None and pitcher_xera >= 4.7:
        reasons.append(f"attacks {pitcher_xera:.2f} xERA arm")
    elif pitcher_xera is not None and pitcher_xera <= 3.6:
        reasons.append(f"tough {pitcher_xera:.2f} xERA matchup")

    pa = parse_int(vs_pitcher.get("pa"))
    ab = parse_int(vs_pitcher.get("ab"))
    hits = parse_int(vs_pitcher.get("hits"))
    hrs = parse_int(vs_pitcher.get("home_runs"))
    if pa is not None and pa >= 6:
        if ab and hits is not None:
            bvp = f"BvP {hits}-{ab}"
            if hrs:
                bvp += f", {hrs} HR"
            reasons.append(bvp)
        else:
            reasons.append(f"BvP sample {pa} PA")

    wx = weather_reason(feature.get("weather"))
    if wx:
        reasons.append(wx)

    pen = bullpen_reason(feature.get("opp_bullpen_score"), for_hitter=True)
    if pen:
        reasons.append(pen)

    summary = "; ".join(reasons[:4])
    if display_only:
        return f"Display only — {detail}" + (f"; {summary}" if summary else "")
    return summary


def reason_badges_html(labels: list[str]) -> str:
    if not labels:
        return ""
    return "<div class='reason-badges'>" + "".join(render_pill(label, "neutral") for label in labels) + "</div>"


def prop_pick_label(feature: dict[str, object]) -> str:
    display_only = (
        not is_scored_row(feature)
        and (
            parse_float(feature.get("hr_prob")) is not None
            or parse_float(feature.get("tb2_prob")) is not None
            or parse_float(feature.get("hr_prob_pct")) is not None
            or parse_float(feature.get("tb2_prob_pct")) is not None
        )
    )
    if not is_scored_row(feature) and not display_only:
        return "Not scored"
    recommended = str(feature.get("recommended_prop") or "").strip()
    tier = str(feature.get("recommended_tier") or "").strip()
    if recommended:
        return f"{recommended} {tier}".strip()
    if display_only:
        tier = str(feature.get("tier") or "").strip()
        if tier:
            return tier
    market_status = str(feature.get("market_status") or "").strip()
    return market_status or "watch"


def prop_edge_label(feature: dict[str, object]) -> str:
    display_only = (
        not is_scored_row(feature)
        and (
            parse_float(feature.get("hr_prob")) is not None
            or parse_float(feature.get("tb2_prob")) is not None
            or parse_float(feature.get("hr_prob_pct")) is not None
            or parse_float(feature.get("tb2_prob_pct")) is not None
        )
    )
    if not is_scored_row(feature) and not display_only:
        return "Not scored"
    recommended = str(feature.get("recommended_prop") or "").strip()
    if recommended == "HR":
        return format_signed_pct(feature.get("edge_hr_pct"))
    if recommended == "2+ TB":
        return format_signed_pct(feature.get("edge_tb_pct"))
    hr_edge = format_signed_pct(feature.get("edge_hr_pct"))
    tb_edge = format_signed_pct(feature.get("edge_tb_pct"))
    return f"HR {hr_edge} / TB {tb_edge}"


def summary_cards_html(summary: dict[str, object], evaluation: dict[str, object]) -> str:
    cards = [
        ("Trust Status", str(evaluation.get("trust_status") or ("strict_evaluable" if evaluation.get("eligible") else "not_evaluable"))),
        ("Pregame", str(summary.get("pregame_games", 0))),
        ("Live", str(summary.get("live_games", 0))),
        ("Final", str(summary.get("final_games", 0))),
        ("Scored Games", str(summary.get("scored_games", 0))),
        ("Blocked Games", str(summary.get("blocked_games", 0))),
        ("Not Scored", str(summary.get("not_scored_games", 0))),
        ("Verified", str(summary.get("verified_games", 0))),
        ("Partial", str(summary.get("partial_games", 0))),
        ("Full Markets", str(summary.get("full_prop_markets", 0))),
        ("Partial Markets", str(summary.get("partial_prop_markets", 0))),
        ("Scored Props", str(summary.get("scored_props", 0))),
        ("Blocked Props", str(summary.get("blocked_props", 0))),
    ]
    if "games_missing_odds" in summary:
        cards.append(("Missing Odds", str(summary.get("games_missing_odds", 0))))
    if "one_sided_hr_games" in summary:
        cards.append(("1-Sided HR", str(summary.get("one_sided_hr_games", 0))))
    return "<div class='summary-grid'>" + "".join(render_stat(label, value) for label, value in cards) + "</div>"


def evaluation_banner_html(evaluation: dict[str, object]) -> str:
    eligible = bool(evaluation.get("eligible"))
    reasons = [evaluation_reason_text(str(reason)) for reason in evaluation.get("reasons", []) if str(reason).strip()]
    trust_status = str(evaluation.get("trust_status") or ("strict_evaluable" if eligible else "not_evaluable"))
    title = "Evaluation Eligible" if eligible else "Not Evaluable"
    body = (
        "Strict pregame snapshot: all games are pregame and scoring is evaluation-safe."
        if eligible
        else "Snapshot should not be used for pregame evaluation: " + "; ".join(reasons or ["eligibility requirements not met"]) + "."
    )
    tone = "success" if eligible else "warning"
    return (
        f"<div class='eval-banner eval-banner-{tone}'>"
        f"<strong>{html.escape(title)}</strong><span><b>{html.escape(trust_status)}</b> — {html.escape(body)}</span>"
        "</div>"
    )


def derive_trust_status(snapshot: dict | None, game_rows: list[dict[str, str]], evaluation: dict[str, object]) -> str:
    if any(normalized_scoring_status(row) == SCORING_STATUS_SCAFFOLD_UNVERIFIED for row in game_rows):
        return "scaffold_unverified"
    if bool(evaluation.get("eligible")):
        return "strict_evaluable"
    if isinstance(snapshot, dict) and snapshot.get("allow_partial"):
        return "partial_not_evaluable"
    fieldset = set(game_rows[0].keys()) if game_rows else set()
    if game_rows and not {"raw_model_away_win_pct", "final_away_win_pct"}.issubset(fieldset):
        return "legacy_context_only"
    return "not_evaluable"


def diagnostics_section_html(runtime_diagnostics: list[dict[str, object]], prop_market_coverage: list[dict[str, object]]) -> str:
    parts: list[str] = []
    if runtime_diagnostics:
        items = "".join(
            "<li>" + html.escape(str(entry.get("message") or "")) + "</li>"
            for entry in runtime_diagnostics
        )
        parts.append(
            "<div class='leaderboard'><h3>Data Source Warnings</h3>"
            "<ul class='lineup-list'>"
            f"{items}"
            "</ul></div>"
        )
    if prop_market_coverage:
        rows = []
        for row in prop_market_coverage:
            notes = ", ".join(str(note) for note in row.get("notes", []) if str(note).strip()) or "-"
            rows.append(
                [
                    str(row.get("game") or ""),
                    f"{row.get('away_hr_covered', 0)}/{row.get('away_lineup_size', 0)}",
                    f"{row.get('home_hr_covered', 0)}/{row.get('home_lineup_size', 0)}",
                    f"{row.get('away_tb_covered', 0)}/{row.get('away_lineup_size', 0)}",
                    f"{row.get('home_tb_covered', 0)}/{row.get('home_lineup_size', 0)}",
                    notes,
                ]
            )
        parts.append(
            leaderboard_table(
                "Prop Coverage Diagnostics",
                ["Game", "HR Away", "HR Home", "TB Away", "TB Home", "Notes"],
                rows,
            )
        )
    if not parts:
        return ""
    return "<div class='leader-grid'>" + "".join(parts) + "</div>"


def leaderboard_table(title: str, headers: list[str], rows: list[list[str]]) -> str:
    if not rows:
        return f"<div class='leaderboard'><h3>{html.escape(title)}</h3><p>No rows.</p></div>"
    parts = [f"<div class='leaderboard'><h3>{html.escape(title)}</h3><div class='table-scroll'><table><thead><tr>"]
    for cell in headers:
        parts.append(f"<th>{html.escape(cell)}</th>")
    parts.append("</tr></thead><tbody>")
    for row in rows:
        parts.append("<tr>")
        for cell in row:
            parts.append(f"<td>{html.escape(cell)}</td>")
        parts.append("</tr>")
    parts.append("</tbody></table></div></div>")
    return "".join(parts)


def lineup_html(players: list[dict] | None, label: str, team: str) -> str:
    if not players:
        return (
            "<div class='subcard'>"
            f"<h4>{html.escape(team)} Lineup</h4>"
            f"<div class='muted'>{html.escape(label or 'Lineup unavailable')}</div>"
            "<p>No lineup available.</p></div>"
        )
    sorted_players = sorted(players, key=lambda row: int(row.get("order") or 99))
    parts = [
        "<div class='subcard'>",
        f"<h4>{html.escape(team)} Lineup</h4>",
        f"<div class='muted'>{html.escape(label)}</div>",
        "<ol class='lineup-list'>",
    ]
    for player in sorted_players:
        name = str(player.get("name") or "Unknown")
        pos = str(player.get("pos") or "")
        parts.append(f"<li><span>{html.escape(name)}</span><span>{html.escape(pos)}</span></li>")
    parts.append("</ol></div>")
    return "".join(parts)


def prop_strength_key(row: dict[str, object]) -> tuple[int, int, float, float]:
    scored_rank = 0 if is_scored_row(row) else 1
    recommended = str(row.get("recommended_prop") or "").strip()
    if recommended == "HR":
        rec_edge = parse_float(row.get("edge_hr_pct")) or -999.0
    elif recommended == "2+ TB":
        rec_edge = parse_float(row.get("edge_tb_pct")) or -999.0
    else:
        rec_edge = max(parse_float(row.get("edge_hr_pct")) or -999.0, parse_float(row.get("edge_tb_pct")) or -999.0)
    return (
        scored_rank,
        0 if recommended else 1,
        0 if str(row.get("market_status") or row.get("market_data_status") or "") == "full" else 1,
        -rec_edge,
        -max(parse_float(row.get("tb2_prob_pct")) or 0.0, parse_float(row.get("hr_prob_pct")) or 0.0),
    )


def prop_team_table(title: str, rows: list[dict[str, object]]) -> str:
    if not rows:
        return f"<div class='subcard'><h4>{html.escape(title)}</h4><p>No prop rows.</p></div>"
    ordered = sorted(rows, key=prop_strength_key)
    parts = [
        "<div class='subcard'>",
        f"<h4>{html.escape(title)}</h4>",
        "<div class='table-scroll'><table class='compact-table'><thead><tr>",
        "<th>#</th><th>Batter</th><th>Pick</th><th>HR%</th><th>2+ TB%</th><th>Edge</th><th>Why</th>",
        "</tr></thead><tbody>",
    ]
    for idx, row in enumerate(ordered, start=1):
        why = prop_reason_summary(row)
        parts.append("<tr>")
        parts.append(f"<td>{idx}</td>")
        parts.append(f"<td>{html.escape(row.get('batter', ''))}</td>")
        parts.append(f"<td>{html.escape(prop_pick_label(row))}</td>")
        parts.append(f"<td>{html.escape(format_model_pct(row.get('hr_prob') if 'hr_prob' in row else row.get('hr_prob_pct')))}</td>")
        parts.append(f"<td>{html.escape(format_model_pct(row.get('tb2_prob') if 'tb2_prob' in row else row.get('tb2_prob_pct')))}</td>")
        parts.append(f"<td>{html.escape(prop_edge_label(row))}</td>")
        parts.append(f"<td>{html.escape(why or str(row.get('data_confidence') or ''))}</td>")
        parts.append("</tr>")
    parts.append("</tbody></table></div></div>")
    return "".join(parts)


def top_props_rows(
    prop_rows: list[dict[str, object]],
    game_status_map: dict[str, str],
    game_time_map: dict[str, str],
    metric_key: str,
    tier_key: str,
    edge_key: str,
    recommended_prop: str,
) -> list[list[str]]:
    pool = [
        row
        for row in prop_rows
        if is_scored_row(row, game_status_map.get(str(row.get("game") or "").upper(), ""))
    ]
    ordered = sorted(
        pool,
        key=lambda row: (
            0 if str(row.get("recommended_prop") or "") == recommended_prop else 1,
            -(parse_float(row.get(metric_key)) or -999.0),
            -(parse_float(row.get(edge_key)) or -999.0),
            str(row.get("game") or ""),
            str(row.get("batter") or ""),
        ),
    )
    out: list[list[str]] = []
    for idx, row in enumerate(ordered[:10], start=1):
        out.append(
            [
                str(idx),
                game_time_map.get(str(row.get("game") or "").upper(), ""),
                str(row.get("batter") or ""),
                str(row.get("game") or ""),
                format_model_pct(row.get(metric_key)),
                str(row.get(tier_key) or ""),
                format_signed_pct(row.get(edge_key)),
                prop_reason_summary(row),
            ]
        )
    return out


def best_game_rows(game_rows: list[dict[str, str]], game_feature_map: dict[str, dict[str, object]]) -> list[list[str]]:
    pool = [row for row in game_rows if is_scored_row(row)]
    ordered = sorted(
        pool,
        key=lambda row: (
            -(parse_float(row.get("edge_on_pick_pct")) or -999.0),
            format_time_sort_key(row.get("start_time_et", "")),
            bucket_order(row.get("game_status_bucket", "")),
        ),
    )
    out: list[list[str]] = []
    for idx, row in enumerate(ordered[:10], start=1):
        game_key = game_key_for_row(row)
        out.append(
            [
                str(idx),
                row.get("start_time_et", ""),
                game_key,
                row.get("prediction", ""),
                row.get("decision_tier_vs_market", ""),
                format_signed_pct(row.get("edge_on_pick_pct")),
                game_reason_summary(row, game_feature_map.get(game_key)),
            ]
        )
    return out


def game_card_html(
    row: dict[str, str],
    game_feature: dict[str, object] | None,
    lineup_ctx: dict | None,
    props_by_game: dict[str, list[dict[str, object]]],
) -> str:
    game_key = game_key_for_row(row)
    away = row.get("away", "")
    home = row.get("home", "")
    props = props_by_game.get(game_key, [])
    away_props = [prop for prop in props if prop.get("team") == away]
    home_props = [prop for prop in props if prop.get("team") == home]
    lineup_ctx = lineup_ctx or {}
    scored = is_scored_row(row)
    blend_alpha = game_blend_alpha(row, game_feature)
    reason_text = game_reason_summary(row, game_feature)
    reason_badges = reason_badges_html(game_reason_badges(row, game_feature))

    header_bits = [
        render_pill(bucket_title(row.get("game_status_bucket", "")), "info"),
        render_pill(row.get("verification_status", "Unknown"), "success" if row.get("verification_status") == "Verified" else "warning"),
        render_pill("Scored" if scored else "Not Scored", "success" if scored else "warning"),
    ]
    if scored:
        header_bits.append(
            render_pill(
                f"Tier {row.get('decision_tier_vs_market', '')}",
                "success" if row.get("decision_tier_vs_market", "").startswith("A") else "neutral",
            )
        )
        header_bits.append(render_pill(f"Pick {row.get('prediction', '')}", "accent"))
    header_pills = "".join(header_bits)

    summary_stats = "".join(
        [
            render_stat("Start", row.get("start_time_et", "NA")),
            render_stat("Market", f"{away} {format_american(row.get('away_american'))} / {home} {format_american(row.get('home_american'))}"),
            render_stat(
                "Raw Model",
                f"{away} {format_pct(game_raw_model_pct(row, 'away'))} / {home} {format_pct(game_raw_model_pct(row, 'home'))}" if scored else "Not scored",
            ),
            render_stat(
                f"Final Blend{f' (a={blend_alpha:.2f})' if blend_alpha is not None else ''}",
                f"{away} {format_pct(game_final_model_pct(row, 'away'))} / {home} {format_pct(game_final_model_pct(row, 'home'))}" if scored else "Not scored",
            ),
            render_stat("Edge On Pick", format_signed_pct(row.get("edge_on_pick_pct")) if scored else "Not scored"),
            render_stat("Weather", row.get("weather_summary", "NA")),
            render_stat("Score / State", row.get("game_status_note", "") or row.get("game_state_detail", "NA")),
        ]
    )

    return "".join(
        [
            f"<section class='game-card' id='{html.escape(game_key.lower().replace('@', '-'))}'>",
            "<div class='game-card-header'>",
            f"<div><div class='eyebrow'>{html.escape(row.get('start_time_et', ''))} ET</div><h3>{html.escape(game_key)}</h3><div class='muted'>{html.escape(reason_text or row.get('rationale_summary', ''))}</div>{reason_badges}</div>",
            f"<div class='pill-row'>{header_pills}</div>",
            "</div>",
            f"<div class='stats-grid'>{summary_stats}</div>",
            "<div class='reason-panel'>"
            f"<div class='reason-title'>{'Why The Model Likes This Side' if scored else 'Scoring Status'}</div>"
            f"<div class='reason-copy'>{html.escape(reason_text or row.get('rationale_summary', ''))}</div>"
            "</div>",
            "<div class='split-grid'>",
            lineup_html(lineup_ctx.get("away_players"), str(lineup_ctx.get("away_label") or "Lineup unavailable"), away),
            lineup_html(lineup_ctx.get("home_players"), str(lineup_ctx.get("home_label") or "Lineup unavailable"), home),
            "</div>",
            "<div class='split-grid'>",
            prop_team_table(f"{away} Prop Board", away_props),
            prop_team_table(f"{home} Prop Board", home_props),
            "</div>",
            "<div class='game-meta'>",
            f"<div><strong>Pitchers:</strong> {html.escape(row.get('away_sp', 'TBD'))} vs {html.escape(row.get('home_sp', 'TBD'))}</div>",
            f"<div><strong>Scoring:</strong> {html.escape('scored' if scored else 'not_scored')}</div>",
            f"<div><strong>Flags:</strong> {html.escape(row.get('missing_data_flags', '') or 'None')}</div>",
            f"<div><strong>Verification Notes:</strong> {html.escape(row.get('verification_notes', '') or 'None')}</div>",
            "</div>",
            "</section>",
        ]
    )


def raw_tables_html(games_rows: list[list[str]], batter_rows: list[list[str]]) -> str:
    return (
        "<details class='raw-block'><summary>Raw CSV Tables</summary>"
        + table_html(games_rows, "Games CSV")
        + table_html(batter_rows, "Batter Outlooks CSV")
        + "</details>"
    )


def build_html(report_path: Path, slug: str, games_rows: list[list[str]], batter_rows: list[list[str]]) -> None:
    snapshot = load_latest_snapshot(slug) or {}
    game_rows = rows_to_dicts(games_rows)
    prop_rows = rows_to_dicts(batter_rows)
    lineup_context = snapshot.get("lineup_context", {}) if isinstance(snapshot, dict) else {}
    snapshot_game_features = snapshot.get("game_features", []) if isinstance(snapshot, dict) else []
    snapshot_prop_features = snapshot.get("prop_features", []) if isinstance(snapshot, dict) else []
    summary = snapshot.get("summary", {}) if isinstance(snapshot, dict) else {}
    runtime_diagnostics = snapshot.get("runtime_diagnostics", []) if isinstance(snapshot, dict) else []
    prop_market_coverage = snapshot.get("prop_market_coverage", []) if isinstance(snapshot, dict) else []
    if not summary:
        summary = {
            "pregame_games": sum(1 for row in game_rows if row.get("game_status_bucket") == "pregame"),
            "live_games": sum(1 for row in game_rows if row.get("game_status_bucket") == "live"),
            "final_games": sum(1 for row in game_rows if row.get("game_status_bucket") == "final"),
            "other_games": sum(1 for row in game_rows if row.get("game_status_bucket") == "other"),
            "verified_games": sum(1 for row in game_rows if row.get("verification_status") == "Verified"),
            "partial_games": sum(1 for row in game_rows if row.get("verification_status") == "Partial"),
            "scored_games": sum(1 for row in game_rows if is_scored_row(row)),
            "actionable_games": sum(1 for row in game_rows if is_scored_row(row)),
            "blocked_games": sum(1 for row in game_rows if normalized_scoring_status(row) == SCORING_STATUS_DATA_BLOCKED),
            "not_scored_games": sum(1 for row in game_rows if not is_scored_row(row)),
            "full_prop_markets": sum(1 for row in prop_rows if row.get("market_data_status") == "full"),
            "partial_prop_markets": sum(1 for row in prop_rows if row.get("market_data_status") == "partial"),
            "no_prop_markets": sum(1 for row in prop_rows if row.get("market_data_status") == "none"),
            "scored_props": sum(1 for row in prop_rows if is_scored_row(row)),
            "blocked_props": sum(1 for row in prop_rows if normalized_scoring_status(row) == SCORING_STATUS_DATA_BLOCKED),
            "not_scored_props": sum(1 for row in prop_rows if not is_scored_row(row)),
        }
    evaluation = derive_evaluation(snapshot if isinstance(snapshot, dict) else None, game_rows, prop_rows)
    evaluation["trust_status"] = derive_trust_status(snapshot if isinstance(snapshot, dict) else None, game_rows, evaluation)

    game_feature_map = {str(row.get("game") or "").upper(): row for row in snapshot_game_features if isinstance(row, dict)}
    prop_feature_rows = [row for row in snapshot_prop_features if isinstance(row, dict)] or [
        {
            **dict(row),
            "game_status_bucket": next((game.get("game_status_bucket", "") for game in game_rows if game_key_for_row(game) == str(row.get("game") or "").upper()), ""),
        }
        for row in prop_rows
    ]

    props_by_game: dict[str, list[dict[str, object]]] = defaultdict(list)
    for row in prop_feature_rows:
        props_by_game[str(row.get("game") or "").upper()].append(row)
    game_status_map = {game_key_for_row(row): row.get("game_status_bucket", "").lower() for row in game_rows}
    game_time_map = {game_key_for_row(row): row.get("start_time_et", "") for row in game_rows}

    game_rows_sorted = sorted(
        game_rows,
        key=lambda row: (
            format_time_sort_key(row.get("start_time_et", "")),
            bucket_order(row.get("game_status_bucket", "")),
            game_key_for_row(row),
        ),
    )
    game_links = "".join(
        f"<a class='game-link' href='#{html.escape(game_key_for_row(row).lower().replace('@', '-'))}'>{html.escape(row.get('start_time_et', ''))} · {html.escape(game_key_for_row(row))}</a>"
        for row in game_rows_sorted
    )

    top_hr = leaderboard_table(
        "Top 10 HR Targets",
        ["Rank", "Time", "Batter", "Game", "HR%", "Tier", "Edge", "Why"],
        top_props_rows(prop_feature_rows, game_status_map, game_time_map, "hr_prob", "hr_tier", "edge_hr_pct", "HR"),
    )
    top_tb = leaderboard_table(
        "Top 10 2+ TB Targets",
        ["Rank", "Time", "Batter", "Game", "2+ TB%", "Tier", "Edge", "Why"],
        top_props_rows(prop_feature_rows, game_status_map, game_time_map, "tb2_prob", "tb2_tier", "edge_tb_pct", "2+ TB"),
    )
    best_games = leaderboard_table(
        "Best Game Edges",
        ["Rank", "Time", "Game", "Pick", "Tier", "Edge", "Why"],
        best_game_rows(game_rows, game_feature_map),
    )

    game_sections = [
        game_card_html(
            row,
            game_feature_map.get(game_key_for_row(row)),
            lineup_context.get(game_key_for_row(row), {}),
            props_by_game,
        )
        for row in game_rows_sorted
    ]

    html_doc = "".join(
        [
            "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>",
            f"<title>MLB Pregame Intel {html.escape(slug)}</title>",
            "<style>",
            "body{font-family:system-ui,sans-serif;margin:0;background:#0f1419;color:#e8eef5;line-height:1.45}",
            ".shell{max-width:1480px;margin:0 auto;padding:28px 24px 56px}",
            "h1,h2,h3,h4{margin:0 0 10px}",
            "h2{margin-top:30px}",
            ".muted{color:#aebdce;font-size:13px}",
            ".summary-grid,.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:16px 0}",
            ".leader-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start}",
            ".split-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:16px;align-items:start}",
            ".leader-grid > *,.split-grid > *{min-width:0}",
            ".stat-card,.leaderboard,.subcard,.game-card,.raw-block,.reason-panel{background:#16212d;border:1px solid #29384a;border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.18);overflow:hidden;min-width:0}",
            ".stat-card{padding:14px}.stat-value{font-size:22px;font-weight:700}.stat-label{font-size:12px;color:#aebdce;text-transform:uppercase;letter-spacing:.04em}",
            ".nav-links{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 8px}.game-link{color:#d9e6f2;text-decoration:none;background:#1d2a38;border:1px solid #314357;border-radius:999px;padding:7px 11px;font-size:12px}",
            ".leaderboard,.subcard{padding:16px}.game-card{padding:20px;margin:16px 0}.game-card-header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:14px}",
            ".eyebrow{color:#87a7c7;text-transform:uppercase;letter-spacing:.08em;font-size:11px;margin-bottom:6px}",
            ".pill-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.pill{display:inline-block;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600}",
            ".pill-neutral{background:#223142;color:#cfe0f1}.pill-info{background:#193a54;color:#92d0ff}.pill-success{background:#1d4832;color:#8ee0b0}.pill-warning{background:#5a3c12;color:#ffd27d}.pill-accent{background:#472856;color:#f0b4ff}",
            ".reason-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}",
            ".reason-panel{padding:14px 16px;margin:4px 0 16px;background:linear-gradient(180deg,#182637,#14202d)}.reason-title{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9fb2c7;margin-bottom:6px}.reason-copy{font-size:14px;color:#e9f1f8}",
            ".lineup-list{list-style:none;padding:0;margin:12px 0 0}.lineup-list li{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #243546}",
            ".game-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:14px;font-size:13px;color:#c9d6e4}",
            "details{margin-top:24px}summary{cursor:pointer;font-weight:700}",
            ".table-scroll{overflow-x:auto;overflow-y:hidden;max-width:100%;width:100%;min-width:0;padding-bottom:4px}",
            "table{border-collapse:collapse;width:max-content;min-width:100%;margin:12px 0 0;font-size:12px}",
            "th,td{border:1px solid #2a3a4d;padding:7px 8px;text-align:left;vertical-align:top}",
            "th{background:#1a2430;position:sticky;top:0}.compact-table th,.compact-table td{font-size:11px}.compact-table td:last-child{min-width:260px}",
            ".section-lead{color:#b9c7d8;font-size:14px;margin-top:8px}",
            ".eval-banner{display:flex;gap:10px;align-items:flex-start;padding:14px 16px;border-radius:16px;margin:18px 0 14px;border:1px solid #314357;background:#16212d}",
            ".eval-banner strong{display:block;min-width:140px}",
            ".eval-banner-success{border-color:#2c6b45;background:#173024}",
            ".eval-banner-warning{border-color:#73501f;background:#362711}",
            "@media (max-width: 900px){.game-card-header{flex-direction:column}.pill-row{justify-content:flex-start}.split-grid{grid-template-columns:1fr}}",
            "a{color:#a8dcff}",
            "</style></head><body><div class='shell'>",
            f"<h1>MLB Pregame Intel Report — {html.escape(slug)}</h1>",
            (
                f"<p class='muted'>Run timestamp: {html.escape(str(snapshot.get('run_timestamp_utc', '')))}</p>"
                if snapshot
                else "<p class='muted'>Rendered from current canvas marker blocks.</p>"
            ),
            summary_cards_html(summary, evaluation),
            evaluation_banner_html(evaluation),
            diagnostics_section_html(
                runtime_diagnostics if isinstance(runtime_diagnostics, list) else [],
                prop_market_coverage if isinstance(prop_market_coverage, list) else [],
            ),
            f"<div class='nav-links'>{game_links}</div>",
            "<div class='leader-grid'>",
            best_games,
            top_hr,
            top_tb,
            "</div>",
            "<h2>Games By Time</h2>",
            "<p class='section-lead'>Each card now surfaces the main drivers behind the side and prop grades: starter quality, handedness, recent form, weather, bullpen, and any meaningful batter-vs-pitcher sample.</p>",
            "".join(game_sections),
            raw_tables_html(games_rows, batter_rows),
            "</div></body></html>",
        ]
    )
    report_path.write_text(html_doc, encoding="utf-8")


def main() -> None:
    args = parse_args()
    slug = resolve_slug(args.date)

    if args.compute:
        module_path = REPO_ROOT / "models" / f"{slug}_inputs.py"
        if not module_path.exists():
            print(
                "Error: --compute is only supported for slates with a models/<slug>_inputs module "
                "(for example apr16, apr18, apr19).",
                file=sys.stderr,
            )
            raise SystemExit(2)
        if str(REPO_ROOT) not in sys.path:
            sys.path.insert(0, str(REPO_ROOT))
        from apr16_compute import run_slate_pipeline

        run_slate_pipeline(slug, allow_partial=args.allow_partial, include_bvp=args.include_bvp)

    canvas_path = CANVAS_DIR / f"mlb-pregame-intel-{slug}.canvas.tsx"
    if not canvas_path.exists():
        raise FileNotFoundError(f"Canvas not found for slug '{slug}': {canvas_path}")

    src = canvas_path.read_text(encoding="utf-8")
    games_block = extract_marker_block(src, "games-csv")
    batter_block = extract_marker_block(src, "batter-outlooks-csv")

    games_rows = parse_csv_block(games_block, GAMES_HEADERS, "games-csv")
    batter_rows = parse_csv_block(batter_block, BATTER_HEADERS, "batter-outlooks-csv")
    if not args.compute:
        scaffold_games = apply_scaffold_export_guard(slug, games_rows)
        if scaffold_games:
            print(
                "Warning: export-only scaffold xERA placeholders suppressed model outputs for: "
                + ", ".join(scaffold_games),
                file=sys.stderr,
            )

    games_path = OUT_DIR / f"mlb-pregame-intel-{slug}-games.csv"
    batter_path = OUT_DIR / f"mlb-pregame-intel-{slug}-batter-outlooks.csv"
    report_path = OUT_DIR / f"mlb-pregame-intel-{slug}-report.html"

    write_csv(games_path, games_rows)
    write_csv(batter_path, batter_rows)
    build_html(report_path, slug, games_rows, batter_rows)

    print("Wrote:", games_path)
    print("Wrote:", batter_path)
    print("Wrote:", report_path)


if __name__ == "__main__":
    main()
