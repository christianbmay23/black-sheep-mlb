"""Read-only Streamlit dashboard for generated MLB slate artifacts."""
from __future__ import annotations

import csv
import json
import re
from collections import Counter
from dataclasses import dataclass
from json import JSONDecodeError
from pathlib import Path
from typing import Any, Iterable


REPO_ROOT = Path(__file__).resolve().parents[1]
EXPORTS_DIR = REPO_ROOT / "canvases" / "exports"
NA = "NA"


@dataclass(frozen=True)
class SlateArtifacts:
    slug: str
    snapshot_path: Path | None
    games_csv: Path | None
    props_csv: Path | None
    report_html: Path | None
    modified_at: float


def _slug_from_games_csv(path: Path) -> str | None:
    match = re.match(r"mlb-pregame-intel-(.+)-games\.csv$", path.name)
    return match.group(1) if match else None


def discover_slates(exports_dir: Path = EXPORTS_DIR) -> list[SlateArtifacts]:
    """Discover available slate artifact groups, newest first."""
    slugs: set[str] = set()
    snapshot_paths: dict[str, Path] = {}

    snapshots_dir = exports_dir / "snapshots"
    for path in snapshots_dir.glob("*/*-latest.json"):
        slug = path.parent.name
        slugs.add(slug)
        snapshot_paths[slug] = path

    for path in exports_dir.glob("mlb-pregame-intel-*-games.csv"):
        slug = _slug_from_games_csv(path)
        if slug:
            slugs.add(slug)

    artifacts: list[SlateArtifacts] = []
    for slug in slugs:
        snapshot_path = snapshot_paths.get(slug)
        games_csv = exports_dir / f"mlb-pregame-intel-{slug}-games.csv"
        props_csv = exports_dir / f"mlb-pregame-intel-{slug}-batter-outlooks.csv"
        report_html = exports_dir / f"mlb-pregame-intel-{slug}-report.html"
        if snapshot_path and snapshot_path.exists():
            modified_at = snapshot_path.stat().st_mtime
        elif games_csv.exists():
            modified_at = games_csv.stat().st_mtime
        else:
            existing = [path for path in (props_csv, report_html) if path.exists()]
            modified_at = max((path.stat().st_mtime for path in existing), default=0.0)
        artifacts.append(
            SlateArtifacts(
                slug=slug,
                snapshot_path=snapshot_path if snapshot_path and snapshot_path.exists() else None,
                games_csv=games_csv if games_csv.exists() else None,
                props_csv=props_csv if props_csv.exists() else None,
                report_html=report_html if report_html.exists() else None,
                modified_at=modified_at,
            )
        )

    return sorted(artifacts, key=lambda item: (item.modified_at, item.slug), reverse=True)


def latest_slate(exports_dir: Path = EXPORTS_DIR) -> SlateArtifacts | None:
    slates = discover_slates(exports_dir)
    return slates[0] if slates else None


def read_csv_rows(path: Path | None) -> list[dict[str, Any]]:
    if not path or not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        return [dict(row) for row in csv.DictReader(handle)]


def read_snapshot(path: Path | None) -> dict[str, Any]:
    if not path or not path.exists():
        return {}
    try:
        with path.open(encoding="utf-8") as handle:
            payload = json.load(handle)
    except JSONDecodeError as exc:
        return {"_load_error": f"Malformed snapshot JSON: {exc}"}
    return payload if isinstance(payload, dict) else {}


def load_slate(artifacts: SlateArtifacts) -> dict[str, Any]:
    snapshot = read_snapshot(artifacts.snapshot_path)
    games = list(snapshot.get("games") or []) or read_csv_rows(artifacts.games_csv)
    props = list(snapshot.get("props") or []) or read_csv_rows(artifacts.props_csv)
    return {"artifacts": artifacts, "snapshot": snapshot, "games": games, "props": props}


def value(row: dict[str, Any], *keys: str, default: str = NA) -> Any:
    for key in keys:
        item = row.get(key)
        if item not in (None, ""):
            return item
    return default


def split_flags(raw: Any) -> list[str]:
    if raw in (None, "", NA):
        return []
    parts = re.split(r"[;|,]", str(raw))
    return sorted({part.strip() for part in parts if part.strip()})


def count_rows(rows: Iterable[dict[str, Any]], field: str, target: str) -> int:
    target = target.lower()
    return sum(1 for row in rows if str(row.get(field, "")).strip().lower() == target)


def market_integrity(row: dict[str, Any]) -> str:
    integrity = str(value(row, "hr_market_integrity", default="")).strip().lower()
    if integrity:
        return integrity
    status = str(value(row, "market_data_status", default="")).strip().lower()
    if status in {"full", "partial", "degraded"}:
        return status
    if "partial" in status:
        return "partial"
    if "degraded" in status or "missing" in status:
        return "degraded"
    return "full" if status else NA


def summarize(games: list[dict[str, Any]], props: list[dict[str, Any]], snapshot: dict[str, Any]) -> dict[str, Any]:
    summary = dict(snapshot.get("summary") or {})
    evaluation = dict(snapshot.get("evaluation") or {})
    prop_integrities = [market_integrity(row) for row in props]
    flags: dict[str, int] = {}
    for row in [*games, *props]:
        for flag in split_flags(row.get("missing_data_flags")):
            flags[flag] = flags.get(flag, 0) + 1

    return {
        "trust_status": evaluation.get("status") or ("eligible" if snapshot.get("evaluation_eligible") else "not_evaluable"),
        "evaluation_eligible": snapshot.get("evaluation_eligible", NA),
        "run_timestamp": snapshot.get("run_timestamp_utc") or snapshot.get("generated_at") or NA,
        "games_scored": summary.get("scored_games", count_rows(games, "scoring_status", "scored")),
        "games_blocked": summary.get("blocked_games", count_rows(games, "scoring_status", "data_blocked")),
        "props_scored": summary.get("scored_props", count_rows(props, "scoring_status", "scored")),
        "props_blocked": summary.get("blocked_props", count_rows(props, "scoring_status", "data_blocked")),
        "market_full": summary.get("full_prop_markets", prop_integrities.count("full")),
        "market_partial": summary.get("partial_prop_markets", prop_integrities.count("partial")),
        "market_degraded": summary.get("no_prop_markets", prop_integrities.count("degraded")),
        "missing_flags": flags,
        "runtime_diagnostics_count": len(snapshot.get("runtime_diagnostics") or []),
    }


def game_key(row: dict[str, Any]) -> str:
    game = str(row.get("game") or "").strip()
    if game:
        return game
    away = str(row.get("away") or "").strip()
    home = str(row.get("home") or "").strip()
    return f"{away}@{home}" if away or home else NA


def _is_actionable(row: dict[str, Any]) -> bool:
    pick = str(value(row, "prediction", default="")).strip().lower()
    tier = str(value(row, "decision_tier_vs_market", default="")).strip().lower()
    status = str(value(row, "scoring_status", default="")).strip().lower()
    return status == "scored" and pick not in {"", "pass", "na"} and tier not in {"", "data_blocked", "na"}


def _coverage_by_game(snapshot: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        str(item.get("game")): item
        for item in snapshot.get("prop_market_coverage") or []
        if isinstance(item, dict) and item.get("game")
    }


def _prop_status_by_game(props: list[dict[str, Any]] | None) -> dict[str, dict[str, Any]]:
    grouped: dict[str, dict[str, Any]] = {}
    for prop in props or []:
        key = str(prop.get("game") or "").strip()
        if not key:
            continue
        item = grouped.setdefault(
            key,
            {
                "rows": 0,
                "scoring_status": Counter(),
                "market_data_status": Counter(),
                "hr_market_integrity": Counter(),
                "tb2_market_status": Counter(),
            },
        )
        item["rows"] += 1
        item["scoring_status"][str(prop.get("scoring_status") or NA)] += 1
        item["market_data_status"][str(prop.get("market_data_status") or NA).lower()] += 1
        item["hr_market_integrity"][str(prop.get("hr_market_integrity") or NA).lower()] += 1
        item["tb2_market_status"][str(prop.get("tb2_market_status") or NA)] += 1
    return grouped


def _verification_level(ctx: dict[str, Any], side: str, kind: str) -> str:
    item = ctx.get(f"{side}_{kind}_verification") or {}
    if isinstance(item, dict):
        return str(item.get("verification_level") or NA)
    return NA


def _verification_issues(ctx: dict[str, Any], side: str, kind: str) -> list[str]:
    item = ctx.get(f"{side}_{kind}_verification") or {}
    if isinstance(item, dict):
        return [str(code) for code in item.get("issue_codes") or [] if code]
    return []


def _status_from_levels(levels: Iterable[str]) -> str:
    normalized = [str(level or "").strip().lower() for level in levels]
    if not normalized:
        return NA
    if any(level in {"missing", "api_verification_failed"} or "failed" in level for level in normalized):
        return "Blocked"
    if any("partial" in level or "unconfirmed" in level for level in normalized):
        return "Partial"
    if all("confirmed" in level for level in normalized):
        return "Confirmed"
    return "Available"


def _coverage_summary(coverage: dict[str, Any], prefix: str) -> str:
    away = value(coverage, f"away_{prefix}_covered", default=0)
    home = value(coverage, f"home_{prefix}_covered", default=0)
    away_size = value(coverage, "away_lineup_size", default=0)
    home_size = value(coverage, "home_lineup_size", default=0)
    return f"{away}/{away_size} away, {home}/{home_size} home"


def _market_warning(*parts: Any) -> str:
    warnings: list[str] = []
    for part in parts:
        text = str(part or "").strip()
        if not text or text == NA:
            continue
        low = text.lower()
        if low in {"partial", "degraded", "projection_only"} or "line_mismatch" in low or "missing" in low:
            warnings.append(text)
    return "; ".join(dict.fromkeys(warnings)) or NA


def _game_prop_market_label(prop_status: dict[str, Any]) -> str:
    if not prop_status:
        return "No Prop Rows"
    market_counts = prop_status.get("market_data_status") or Counter()
    tb_counts = prop_status.get("tb2_market_status") or Counter()
    if any(str(status).startswith("line_mismatch") for status in tb_counts):
        return "Partial / Misaligned"
    if market_counts.get("partial") or market_counts.get("degraded"):
        return "Partial Coverage"
    if market_counts.get("full") == prop_status.get("rows"):
        return "Full Coverage"
    return "Mixed Coverage"


def build_game_view_models(
    games: list[dict[str, Any]],
    snapshot: dict[str, Any],
    props: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    contexts = snapshot.get("lineup_context") or {}
    coverage = _coverage_by_game(snapshot)
    prop_status = _prop_status_by_game(props)
    rows: list[dict[str, Any]] = []
    for game in games:
        key = game_key(game)
        ctx = contexts.get(key) if isinstance(contexts.get(key), dict) else {}
        cov = coverage.get(key, {})
        prop_summary = prop_status.get(key, {})
        scoring_status = str(value(game, "scoring_status", default="")).strip().lower()
        verification_status = str(value(game, "verification_status", default="")).strip()
        issues = list(ctx.get("issues") or []) if isinstance(ctx, dict) else []
        warnings = [
            *split_flags(game.get("missing_data_flags")),
            *[str(item) for item in issues if item],
            _market_warning(cov.get("hr_market_integrity"), cov.get("hr_provider_path")),
        ]
        warnings = [item for item in dict.fromkeys(warnings) if item and item != NA]

        lineup_status = _status_from_levels(
            [
                _verification_level(ctx, "away", "lineup"),
                _verification_level(ctx, "home", "lineup"),
            ]
        )
        starter_status = _status_from_levels(
            [
                _verification_level(ctx, "away", "starter"),
                _verification_level(ctx, "home", "starter"),
            ]
        )
        hr_integrity = str(value(cov, "hr_market_integrity", default=market_integrity(game))).lower()
        market_status = str(value(game, "market_data_status", default="")).lower()
        has_partial_coverage = (
            verification_status.lower() == "partial"
            or hr_integrity in {"partial", "degraded"}
            or market_status == "partial"
            or _game_prop_market_label(prop_summary) in {"Partial Coverage", "Partial / Misaligned", "Mixed Coverage"}
            or any("partial" in str(item).lower() for item in warnings)
        )
        if scoring_status == "data_blocked":
            actionability_label = "Display Only / Data Blocked"
        elif _is_actionable(game):
            actionability_label = "Actionable / Scored"
        elif has_partial_coverage:
            actionability_label = "Partial Coverage"
        else:
            actionability_label = "Display Only"

        odds_obj = ctx.get("odds") if isinstance(ctx.get("odds"), dict) else {}
        odds_source = value(cov, "game_odds_source", default=value(odds_obj, "source", default=NA))
        rows.append(
            {
                **game,
                "game": key,
                "actionability_label": actionability_label,
                "lineup_status": lineup_status,
                "starter_status": starter_status,
                "lineup_issues": "; ".join(
                    [
                        *_verification_issues(ctx, "away", "lineup"),
                        *_verification_issues(ctx, "home", "lineup"),
                    ]
                )
                or NA,
                "starter_issues": "; ".join(
                    [
                        *_verification_issues(ctx, "away", "starter"),
                        *_verification_issues(ctx, "home", "starter"),
                    ]
                )
                or NA,
                "odds_status": "Present" if odds_source != NA else "Missing",
                "odds_source": odds_source,
                "hr_coverage": _coverage_summary(cov, "hr") if cov else NA,
                "tb_coverage": _coverage_summary(cov, "tb") if cov else NA,
                "hr_provider_path": value(cov, "hr_provider_path", default=value(ctx, "hr_provider_path")),
                "hr_market_integrity": value(cov, "hr_market_integrity", default=NA),
                "tb_sources": ", ".join(cov.get("tb_sources") or []) if cov else NA,
                "prop_market_status": _game_prop_market_label(prop_summary),
                "prop_rows": prop_summary.get("rows", 0),
                "prop_scored_rows": (prop_summary.get("scoring_status") or Counter()).get("scored", 0),
                "prop_blocked_rows": (prop_summary.get("scoring_status") or Counter()).get("data_blocked", 0),
                "coverage_warning": _market_warning(
                    cov.get("hr_market_integrity"),
                    cov.get("hr_provider_path"),
                    _game_prop_market_label(prop_summary),
                    ";".join(cov.get("notes") or []),
                ),
                "actionability_warning": "; ".join(warnings) if warnings else NA,
                "is_actionable": _is_actionable(game),
            }
        )
    return rows


def prop_warning(row: dict[str, Any]) -> str:
    return _market_warning(
        row.get("hr_market_integrity"),
        row.get("market_data_status"),
        row.get("hr_market_status"),
        row.get("tb2_market_status"),
        row.get("data_confidence"),
    )


def build_prop_view_models(props: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for prop in props:
        warning = prop_warning(prop)
        rows.append(
            {
                **prop,
                "actionability_label": (
                    "Scored" if str(prop.get("scoring_status", "")).lower() == "scored" else "Data Blocked"
                ),
                "hr_coverage_label": value(prop, "hr_market_integrity", "hr_market_status"),
                "tb_coverage_label": value(prop, "tb2_market_status"),
                "market_warning": warning,
                "has_market_warning": warning != NA,
            }
        )
    return rows


def prop_market_bucket(row: dict[str, Any]) -> str:
    warning = prop_warning(row).lower()
    if "line_mismatch" in warning:
        return "misaligned"
    if "degraded" in warning or "projection_only" in warning:
        return "degraded"
    if str(row.get("market_data_status", "")).lower() == "partial" or "partial" in warning:
        return "partial"
    return "full"


def _filter_games(rows: list[dict[str, Any]], filters: dict[str, Any]) -> list[dict[str, Any]]:
    out = list(rows)
    if filters.get("scored_only"):
        out = [row for row in out if str(row.get("scoring_status", "")).lower() == "scored"]
    if filters.get("actionable_only"):
        out = [row for row in out if _is_actionable(row)]
    if filters.get("hide_blocked"):
        out = [row for row in out if str(row.get("scoring_status", "")).lower() != "data_blocked"]
    if filters.get("confidence"):
        selected = {item.lower() for item in filters["confidence"]}
        out = [row for row in out if str(row.get("model_confidence", "")).lower() in selected]
    if filters.get("tiers"):
        selected = set(filters["tiers"])
        out = [row for row in out if row.get("decision_tier_vs_market") in selected]
    if filters.get("starts"):
        selected = set(filters["starts"])
        out = [row for row in out if row.get("start_time_et") in selected]
    if filters.get("actionability"):
        selected = set(filters["actionability"])
        out = [row for row in out if row.get("actionability_label") in selected]
    if filters.get("game") and filters["game"] != "All":
        out = [row for row in out if row.get("game") == filters["game"]]
    team = str(filters.get("team") or "").strip().upper()
    if team:
        out = [
            row
            for row in out
            if team in str(row.get("away", "")).upper() or team in str(row.get("home", "")).upper()
        ]
    return out


def _filter_props(rows: list[dict[str, Any]], filters: dict[str, Any]) -> list[dict[str, Any]]:
    out = list(rows)
    if filters.get("recommended_only"):
        out = [row for row in out if str(row.get("recommended_prop", "")).strip()]
    if filters.get("aa_only"):
        out = [row for row in out if row.get("recommended_tier") in {"A", "A+"} or row.get("tier") in {"A", "A+"}]
    if filters.get("full_markets"):
        out = [row for row in out if market_integrity(row) == "full" and row.get("market_data_status") == "full"]
    if filters.get("hide_partial"):
        out = [row for row in out if market_integrity(row) != "partial" and row.get("market_data_status") != "partial"]
    if filters.get("hr_only"):
        out = [row for row in out if "HR" in str(row.get("recommended_prop", "")).upper()]
    if filters.get("tb_only"):
        out = [row for row in out if "TB" in str(row.get("recommended_prop", "")).upper()]
    if filters.get("positive_edge"):
        out = [
            row
            for row in out
            if _to_float(row.get("edge_hr_pct")) > 0 or _to_float(row.get("edge_tb_pct")) > 0
        ]
    if filters.get("market_type") == "HR":
        out = [row for row in out if value(row, "market_hr_american", "hr_market_status") != NA]
    if filters.get("market_type") == "2+ TB":
        out = [row for row in out if value(row, "market_tb_over_american", "tb2_market_status") != NA]
    if filters.get("statuses"):
        selected = set(filters["statuses"])
        out = [row for row in out if row.get("actionability_label") in selected or row.get("scoring_status") in selected]
    if filters.get("coverage"):
        selected = set(filters["coverage"])
        out = [row for row in out if prop_market_bucket(row) in selected]
    team = str(filters.get("team") or "").strip().upper()
    if team:
        out = [row for row in out if team in str(row.get("team", "")).upper()]
    game = filters.get("game")
    if game and game != "All":
        out = [row for row in out if row.get("game") == game]
    return out


def _to_float(raw: Any) -> float:
    try:
        return float(raw)
    except (TypeError, ValueError):
        return 0.0


def _select_columns(rows: list[dict[str, Any]], columns: list[str]) -> list[dict[str, Any]]:
    return [{column: value(row, column) for column in columns} for row in rows]


def _badge(text: Any, kind: str = "neutral") -> str:
    label = NA if text in (None, "") else str(text)
    css = re.sub(r"[^a-z0-9_-]+", "-", f"{kind}-{label}".lower()).strip("-")
    return f'<span class="badge {css}">{label}</span>'


def _render_badges(items: Iterable[tuple[Any, str]]) -> str:
    return " ".join(_badge(text, kind) for text, kind in items)


def _kv_lines(items: Iterable[tuple[str, Any]]) -> str:
    return "<br>".join(f"<strong>{label}:</strong> {value_}" for label, value_ in items)


def _css() -> str:
    return """
    <style>
    .stApp { background: #0e1117; color: #e6edf3; }
    div[data-testid="stMetric"] {
        background: #151b23;
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 12px;
    }
    .badge {
        display: inline-block;
        padding: 2px 8px;
        margin: 2px 4px 2px 0;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        border: 1px solid #3d444d;
        color: #e6edf3;
        background: #21262d;
    }
    .status-scored, .confidence-high, .integrity-full, .tier-a-, .tier-a { background: #14532d; border-color: #22c55e; }
    .confidence-medium, .tier-b, .tier-c, .status-eligible { background: #713f12; border-color: #f59e0b; }
    .status-data_blocked, .status-not_evaluable, .integrity-degraded, .confidence-low, .tier-d { background: #7f1d1d; border-color: #ef4444; }
    .integrity-partial, .tier-data_blocked { background: #4c1d95; border-color: #8b5cf6; }
    .section {
        background: #151b23;
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 14px;
        margin: 10px 0;
    }
    .game-card {
        background: #151b23;
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 14px;
        margin: 10px 0;
    }
    .game-card h4 { margin: 0 0 8px 0; }
    .warning-box {
        background: #2d1b1b;
        border: 1px solid #7f1d1d;
        border-radius: 8px;
        padding: 10px;
        margin: 8px 0;
    }
    .artifact-note {
        background: #102033;
        border: 1px solid #1d4ed8;
        border-radius: 8px;
        padding: 10px;
        margin: 8px 0;
    }
    </style>
    """


def main() -> None:
    import pandas as pd
    import streamlit as st

    st.set_page_config(page_title="Black Sheep MLB Slate Dashboard", layout="wide")
    st.markdown(_css(), unsafe_allow_html=True)
    st.title("Black Sheep MLB Slate Dashboard")
    st.caption("Read-only view over generated CSV and snapshot artifacts.")

    slates = discover_slates()
    if not slates:
        st.error(f"No slate artifacts found under {EXPORTS_DIR}")
        return

    options = [slate.slug for slate in slates]
    selected_slug = st.sidebar.selectbox("Slate", options, index=0)
    artifacts = next(slate for slate in slates if slate.slug == selected_slug)
    data = load_slate(artifacts)
    games: list[dict[str, Any]] = data["games"]
    props: list[dict[str, Any]] = data["props"]
    snapshot: dict[str, Any] = data["snapshot"]
    game_views = build_game_view_models(games, snapshot, props)
    prop_views = build_prop_view_models(props)
    overview = summarize(games, props, snapshot)

    st.sidebar.markdown("### Artifact Sources")
    st.sidebar.write(f"Snapshot: `{artifacts.snapshot_path or 'missing'}`")
    st.sidebar.write(f"Games CSV: `{artifacts.games_csv or 'missing'}`")
    st.sidebar.write(f"Props CSV: `{artifacts.props_csv or 'missing'}`")

    if snapshot.get("_load_error"):
        st.error(snapshot["_load_error"])
    elif artifacts.snapshot_path and snapshot:
        if snapshot.get("evaluation_eligible") is True:
            st.markdown(
                '<div class="artifact-note">Validated artifact snapshot loaded. Read-only display keeps blocked and partial rows labeled.</div>',
                unsafe_allow_html=True,
            )
        else:
            st.warning("Snapshot loaded, but it is not evaluation eligible. Treat all rows as display-only.")
    else:
        st.warning("CSV fallback mode: no snapshot was loaded for this slate.")

    if not games:
        st.error("No game rows available for this slate artifact.")
    if not props:
        st.info("No batter/prop rows available for this slate artifact.")

    st.subheader("Slate Overview")
    st.markdown(
        _render_badges(
            [
                (overview["trust_status"], "status"),
                (f"evaluation={overview['evaluation_eligible']}", "status"),
                (f"runtime diagnostics={overview['runtime_diagnostics_count']}", "status"),
            ]
        ),
        unsafe_allow_html=True,
    )
    metric_cols = st.columns(7)
    metric_cols[0].metric("Run Timestamp", overview["run_timestamp"])
    metric_cols[1].metric("Games Scored", overview["games_scored"])
    metric_cols[2].metric("Games Blocked", overview["games_blocked"])
    metric_cols[3].metric("Props Scored", overview["props_scored"])
    metric_cols[4].metric("Props Blocked", overview["props_blocked"])
    metric_cols[5].metric("Full Markets", overview["market_full"])
    metric_cols[6].metric("Partial / Degraded", f"{overview['market_partial']} / {overview['market_degraded']}")

    if overview["missing_flags"]:
        flags_df = pd.DataFrame(
            [{"flag": flag, "count": count} for flag, count in sorted(overview["missing_flags"].items())]
        )
        with st.expander("Missing-data flags", expanded=False):
            st.dataframe(flags_df, use_container_width=True, hide_index=True)

    st.subheader("Game Board")
    game_options = sorted({row["game"] for row in game_views if row.get("game")})
    game_filters = {
        "scored_only": st.sidebar.checkbox("Show only scored games", value=False),
        "actionable_only": st.sidebar.checkbox("Show only actionable games", value=False),
        "hide_blocked": st.sidebar.checkbox("Hide data-blocked games", value=False),
        "game": st.sidebar.selectbox("Game", ["All", *game_options]),
        "actionability": st.sidebar.multiselect(
            "Actionability",
            sorted({str(row.get("actionability_label")) for row in game_views if row.get("actionability_label")}),
        ),
        "confidence": st.sidebar.multiselect(
            "Game confidence",
            sorted({str(row.get("model_confidence")) for row in game_views if row.get("model_confidence")}),
        ),
        "tiers": st.sidebar.multiselect(
            "Game tier",
            sorted({str(row.get("decision_tier_vs_market")) for row in game_views if row.get("decision_tier_vs_market")}),
        ),
        "starts": st.sidebar.multiselect(
            "Start time",
            sorted({str(row.get("start_time_et")) for row in game_views if row.get("start_time_et")}),
        ),
        "team": st.sidebar.text_input("Game team contains", value=""),
    }
    filtered_games = _filter_games(game_views, game_filters)
    game_columns = [
        "start_time_et",
        "game",
        "actionability_label",
        "away_sp",
        "home_sp",
        "lineup_status",
        "starter_status",
        "odds_status",
        "odds_source",
        "hr_coverage",
        "tb_coverage",
        "prop_market_status",
        "prop_rows",
        "prop_scored_rows",
        "prop_blocked_rows",
        "coverage_warning",
        "away_american",
        "home_american",
        "final_away_win_pct",
        "final_home_win_pct",
        "prediction",
        "decision_tier_vs_market",
        "edge_on_pick_pct",
        "model_confidence",
        "verification_status",
        "actionability_warning",
        "scoring_status",
    ]
    if filtered_games:
        st.markdown(
            _render_badges(
                [
                    (f"{len(filtered_games)} shown", "status"),
                    (f"{sum(1 for row in filtered_games if _is_actionable(row))} actionable", "status"),
                ]
            ),
            unsafe_allow_html=True,
        )
        for row in filtered_games:
            st.markdown('<div class="game-card">', unsafe_allow_html=True)
            st.markdown(f"#### {row.get('game', NA)} · {value(row, 'start_time_et')}")
            st.markdown(
                _render_badges(
                    [
                        (row.get("actionability_label"), "status"),
                        (row.get("scoring_status"), "status"),
                        (row.get("verification_status"), "integrity"),
                        (row.get("model_confidence"), "confidence"),
                    ]
                ),
                unsafe_allow_html=True,
            )
            if row.get("is_actionable"):
                st.write(
                    f"Model pick: {value(row, 'prediction')} | Edge: {value(row, 'edge_on_pick_pct')} | "
                    f"Final probs: {value(row, 'final_away_win_pct')} / {value(row, 'final_home_win_pct')}"
                )
            else:
                st.markdown(
                    f"<div class=\"warning-box\">Display only. No actionable pick shown. Reason: {value(row, 'actionability_warning')}</div>",
                    unsafe_allow_html=True,
                )
            cols = st.columns(4)
            cols[0].metric("Lineups", row.get("lineup_status", NA))
            cols[1].metric("Starters", row.get("starter_status", NA))
            cols[2].metric("Odds", f"{row.get('odds_status', NA)}")
            cols[3].metric("Prop Markets", row.get("prop_market_status", NA))
            detail_cols = st.columns(2)
            detail_cols[0].markdown(
                _kv_lines(
                    [
                        ("Odds source", row.get("odds_source", NA)),
                        ("HR provider", row.get("hr_provider_path", NA)),
                        ("HR coverage", row.get("hr_coverage", NA)),
                        ("TB source", row.get("tb_sources", NA)),
                        ("TB coverage", row.get("tb_coverage", NA)),
                        ("Prop rows", row.get("prop_rows", 0)),
                        ("Scored / blocked props", f"{row.get('prop_scored_rows', 0)} / {row.get('prop_blocked_rows', 0)}"),
                    ]
                ),
                unsafe_allow_html=True,
            )
            detail_cols[1].markdown(
                _kv_lines(
                    [
                        ("Lineup issues", row.get("lineup_issues", NA)),
                        ("Starter issues", row.get("starter_issues", NA)),
                        ("Coverage warning", row.get("coverage_warning", NA)),
                        ("Rationale", value(row, "rationale_summary")),
                    ]
                ),
                unsafe_allow_html=True,
            )
            st.markdown("</div>", unsafe_allow_html=True)
        with st.expander("Game rows table", expanded=False):
            st.dataframe(pd.DataFrame(_select_columns(filtered_games, game_columns)), use_container_width=True, hide_index=True)
    else:
        st.info("No games match the selected filters.")

    st.subheader("Prop Board")
    prop_games = sorted({str(row.get("game")) for row in prop_views if row.get("game")})
    prop_filters = {
        "recommended_only": st.sidebar.checkbox("Recommended props only", value=False),
        "aa_only": st.sidebar.checkbox("A/A+ only", value=False),
        "full_markets": st.sidebar.checkbox("Full markets only", value=False),
        "hide_partial": st.sidebar.checkbox("Hide partial markets", value=False),
        "market_type": st.sidebar.selectbox("Market type", ["Any", "HR", "2+ TB"]),
        "coverage": st.sidebar.multiselect("Market coverage", ["full", "partial", "degraded", "misaligned"]),
        "statuses": st.sidebar.multiselect(
            "Prop status",
            sorted(
                {
                    str(row.get("actionability_label"))
                    for row in prop_views
                    if row.get("actionability_label")
                }
            ),
        ),
        "positive_edge": st.sidebar.checkbox("Positive edge only", value=False),
        "team": st.sidebar.text_input("Prop team contains", value=""),
        "game": st.sidebar.selectbox("Prop game", ["All", *prop_games]),
    }
    filtered_props = _filter_props(prop_views, prop_filters)
    prop_columns = [
        "game",
        "team",
        "batter",
        "opponent_pitcher",
        "hr_prob_pct",
        "tb2_prob_pct",
        "market_hr_american",
        "market_tb_over_american",
        "edge_hr_pct",
        "edge_tb_pct",
        "recommended_prop",
        "recommended_tier",
        "actionability_label",
        "hr_coverage_label",
        "tb_coverage_label",
        "hr_market_integrity",
        "hr_market_status",
        "tb2_market_status",
        "market_data_status",
        "market_warning",
        "data_confidence",
        "scoring_status",
    ]
    if filtered_props:
        buckets = Counter(prop_market_bucket(row) for row in filtered_props)
        st.markdown(
            _render_badges(
                [
                    (f"{len(filtered_props)} props shown", "status"),
                    (f"full={buckets.get('full', 0)}", "integrity"),
                    (f"partial={buckets.get('partial', 0)}", "integrity"),
                    (f"misaligned={buckets.get('misaligned', 0)}", "integrity"),
                    (f"degraded={buckets.get('degraded', 0)}", "integrity"),
                ]
            ),
            unsafe_allow_html=True,
        )
        st.dataframe(pd.DataFrame(_select_columns(filtered_props, prop_columns)), use_container_width=True, hide_index=True)
    else:
        st.info("No prop rows match the selected filters.")

    st.subheader("Reasoning Panel")
    if game_views:
        labels = [f"{row.get('game', NA)} | {row.get('start_time_et', NA)}" for row in game_views]
        selected_label = st.selectbox("Selected game", labels)
        selected_game = game_views[labels.index(selected_label)]
        st.markdown(
            _render_badges(
                [
                    (selected_game.get("actionability_label"), "status"),
                    (selected_game.get("scoring_status"), "status"),
                    (selected_game.get("model_confidence"), "confidence"),
                    (selected_game.get("decision_tier_vs_market"), "tier"),
                    (selected_game.get("verification_status"), "integrity"),
                ]
            ),
            unsafe_allow_html=True,
        )
        left, right = st.columns(2)
        with left:
            st.markdown('<div class="section">', unsafe_allow_html=True)
            st.markdown("**Why / Rationale**")
            st.write(value(selected_game, "rationale_summary"))
            st.markdown("**SP Edge**")
            st.write(f"{value(selected_game, 'away_sp')} vs {value(selected_game, 'home_sp')}")
            st.markdown("**Bullpen Edge**")
            st.write(
                f"Away {value(selected_game, 'bullpen_away_score')} | Home {value(selected_game, 'bullpen_home_score')}"
            )
            st.markdown("**Recent Form**")
            st.write(
                f"Away {value(selected_game, 'recent_form_away_score')} | Home {value(selected_game, 'recent_form_home_score')}"
            )
            st.markdown("</div>", unsafe_allow_html=True)
        with right:
            st.markdown('<div class="section">', unsafe_allow_html=True)
            st.markdown("**Weather**")
            st.write(value(selected_game, "weather_summary"))
            st.markdown("**Provider / Provenance Notes**")
            st.write(value(selected_game, "verification_notes"))
            st.markdown("**Warnings / No-Bet Reasons**")
            warnings = split_flags(selected_game.get("actionability_warning"))
            st.write(", ".join(warnings) if warnings else NA)
            st.markdown("**Artifact Coverage**")
            st.markdown(
                _kv_lines(
                    [
                        ("Lineups", selected_game.get("lineup_status", NA)),
                        ("Starters", selected_game.get("starter_status", NA)),
                        ("Odds source", selected_game.get("odds_source", NA)),
                        ("HR coverage", selected_game.get("hr_coverage", NA)),
                        ("TB coverage", selected_game.get("tb_coverage", NA)),
                        ("Prop market status", selected_game.get("prop_market_status", NA)),
                        ("Prop rows", selected_game.get("prop_rows", 0)),
                    ]
                ),
                unsafe_allow_html=True,
            )
            if snapshot.get("runtime_diagnostics"):
                st.markdown("**Runtime Diagnostics**")
                st.json(snapshot.get("runtime_diagnostics"))
            st.markdown("</div>", unsafe_allow_html=True)
    else:
        st.info("No game rows available for this slate.")


if __name__ == "__main__":
    main()
