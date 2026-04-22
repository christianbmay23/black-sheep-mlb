"""Pure prop-market classification, recommendation gating, and coverage summary.

All gating constants live here in one place. Keep this module free of
orchestration state and network I/O.
"""
from __future__ import annotations

from typing import Any, Protocol


# --- Gating constants -------------------------------------------------------

HR_EDGE_GATE_PCT = 2.5
TB_EDGE_GATE_PCT = 2.0
TB_PARTIAL_EDGE_GATE_PCT = 3.0
TB_RECOMMEND_MIN_PROB_PCT = 49.0
TB_PARTIAL_RECOMMEND_MIN_PROB_PCT = 52.0
TB_TARGET_LINE = 1.5

PROP_TIER_RANK: dict[str, int] = {"A+": 5, "A": 4, "B": 3, "C": 2, "D": 1}


# --- Structural protocol for prop market lines ------------------------------

class _PropMarketLineLike(Protocol):
    over_price: float | int | None
    point: float | int | None
    source: str


# --- Tier / market helpers --------------------------------------------------

def prop_tier_rank(tier: str) -> int:
    return PROP_TIER_RANK.get((tier or "").strip().upper(), 0)


def has_hr_market_price(line: _PropMarketLineLike | None) -> bool:
    return bool(line and line.over_price is not None)


def is_aligned_tb_market(line: _PropMarketLineLike | None) -> bool:
    return bool(
        line
        and line.over_price is not None
        and line.point is not None
        and abs(float(line.point) - TB_TARGET_LINE) < 0.001
    )


def has_any_tb_market(line: _PropMarketLineLike | None) -> bool:
    return bool(line and (line.point is not None or line.over_price is not None))


def classify_hr_market_status(
    edge_hr_pct: float | None,
    hr_tier: str,
    prop_conf: str,
    hr_market: _PropMarketLineLike | None,
    *,
    hr_market_integrity: str = "partial",
) -> str:
    if not has_hr_market_price(hr_market):
        return "unpriced"
    if hr_market_integrity == "degraded":
        return "integrity_degraded_projection_only"
    if edge_hr_pct is None or edge_hr_pct <= 0:
        return "priced_no_edge"
    if prop_tier_rank(hr_tier) < prop_tier_rank("A"):
        return "priced_below_tier"
    if prop_conf == "Low":
        return "priced_low_conf"
    if edge_hr_pct < HR_EDGE_GATE_PCT:
        return "priced_below_gate"
    return "qualified"


def classify_tb_market_status(
    edge_tb_pct: float | None,
    tb2_prob: float | None,
    tb2_tier: str,
    prop_conf: str,
    tb_market: _PropMarketLineLike | None,
    market_status: str,
) -> str:
    if tb_market is None or tb_market.over_price is None:
        return "unpriced"
    if tb_market.point is None:
        return "line_unknown"
    if not is_aligned_tb_market(tb_market):
        return f"line_mismatch_{tb_market.point:g}"
    if edge_tb_pct is None or edge_tb_pct <= 0:
        return "priced_no_edge"
    if tb2_prob is None:
        return "prob_missing"
    tb2_prob_pct = tb2_prob * 100
    min_prob_gate = (
        TB_PARTIAL_RECOMMEND_MIN_PROB_PCT
        if market_status == "partial"
        else TB_RECOMMEND_MIN_PROB_PCT
    )
    edge_gate = TB_PARTIAL_EDGE_GATE_PCT if market_status == "partial" else TB_EDGE_GATE_PCT
    if tb2_prob_pct < min_prob_gate:
        return "priced_below_prob_gate"
    if prop_tier_rank(tb2_tier) < prop_tier_rank("A"):
        return "priced_below_tier"
    if prop_conf == "Low":
        return "priced_low_conf"
    if edge_tb_pct < edge_gate:
        return "priced_below_gate"
    return "qualified"


def choose_recommended_prop(
    hr_status: str,
    tb_status: str,
    edge_hr_pct: float | None,
    edge_tb_pct: float | None,
    hr_tier: str,
    tb2_tier: str,
) -> tuple[str, str]:
    if hr_status == "qualified" and tb_status == "qualified":
        if edge_hr_pct is not None and edge_tb_pct is not None and edge_hr_pct >= edge_tb_pct + 1.5:
            return "HR", hr_tier
        return "2+ TB", tb2_tier
    if hr_status == "qualified":
        return "HR", hr_tier
    if tb_status == "qualified":
        return "2+ TB", tb2_tier
    return "", ""


def classify_hr_market_integrity(
    *,
    away_lineup_size: int,
    home_lineup_size: int,
    away_hr_covered: int,
    home_hr_covered: int,
    notes: list[str],
) -> str:
    if (
        away_lineup_size > 0
        and home_lineup_size > 0
        and away_hr_covered == away_lineup_size
        and home_hr_covered == home_lineup_size
    ):
        return "full"
    if (
        "rotowire_hr_home_side_missing" in notes
        or "rotowire_hr_away_side_missing" in notes
        or ((away_hr_covered > 0) != (home_hr_covered > 0))
    ):
        return "degraded"
    return "partial"


# --- Coverage summary -------------------------------------------------------

def summarize_prop_market_coverage(
    game_key: str,
    ctx: dict[str, Any],
    markets: dict[tuple[str, str], _PropMarketLineLike],
    *,
    normalize_player_name,
) -> dict[str, Any]:
    """Summarize HR/TB market coverage for a single game's lineups.

    `normalize_player_name` is injected so this module does not import from
    live_mlb_data (keeps import graph acyclic and testable).
    """

    def coverage(players: list[dict[str, Any]], market_key: str) -> tuple[int, list[str], list[str]]:
        covered = 0
        missing: list[str] = []
        sources: set[str] = set()
        for player in players:
            player_name = str(player.get("name") or "")
            line = markets.get((normalize_player_name(player_name), market_key))
            if line and line.over_price is not None:
                covered += 1
                if getattr(line, "source", None):
                    sources.add(line.source)
            else:
                missing.append(player_name)
        return covered, sorted(missing), sorted(sources)

    away_players = list(ctx.get("away_players") or [])
    home_players = list(ctx.get("home_players") or [])
    away_hr_covered, away_hr_missing, away_hr_sources = coverage(away_players, "batter_home_runs")
    home_hr_covered, home_hr_missing, home_hr_sources = coverage(home_players, "batter_home_runs")
    away_tb_covered, away_tb_missing, away_tb_sources = coverage(away_players, "batter_total_bases")
    home_tb_covered, home_tb_missing, home_tb_sources = coverage(home_players, "batter_total_bases")
    hr_sources = sorted(set(away_hr_sources + home_hr_sources))
    tb_sources = sorted(set(away_tb_sources + home_tb_sources))
    notes: list[str] = []
    if away_hr_covered and not home_hr_covered and hr_sources and all(source.startswith("rotowire") for source in hr_sources):
        notes.append("rotowire_hr_home_side_missing")
    if home_hr_covered and not away_hr_covered and hr_sources and all(source.startswith("rotowire") for source in hr_sources):
        notes.append("rotowire_hr_away_side_missing")
    if ctx.get("away_moneyline") is None or ctx.get("home_moneyline") is None:
        notes.append("market_odds_unavailable")
    hr_market_integrity = classify_hr_market_integrity(
        away_lineup_size=len(away_players),
        home_lineup_size=len(home_players),
        away_hr_covered=away_hr_covered,
        home_hr_covered=home_hr_covered,
        notes=notes,
    )
    return {
        "game": game_key,
        "away_lineup_size": len(away_players),
        "home_lineup_size": len(home_players),
        "away_hr_covered": away_hr_covered,
        "home_hr_covered": home_hr_covered,
        "away_tb_covered": away_tb_covered,
        "home_tb_covered": home_tb_covered,
        "away_hr_missing": away_hr_missing,
        "home_hr_missing": home_hr_missing,
        "away_tb_missing": away_tb_missing,
        "home_tb_missing": home_tb_missing,
        "hr_sources": hr_sources,
        "tb_sources": tb_sources,
        "hr_market_integrity": hr_market_integrity,
        "notes": notes,
    }


__all__ = [
    "HR_EDGE_GATE_PCT",
    "TB_EDGE_GATE_PCT",
    "TB_PARTIAL_EDGE_GATE_PCT",
    "TB_RECOMMEND_MIN_PROB_PCT",
    "TB_PARTIAL_RECOMMEND_MIN_PROB_PCT",
    "TB_TARGET_LINE",
    "PROP_TIER_RANK",
    "prop_tier_rank",
    "has_hr_market_price",
    "is_aligned_tb_market",
    "has_any_tb_market",
    "classify_hr_market_status",
    "classify_tb_market_status",
    "choose_recommended_prop",
    "classify_hr_market_integrity",
    "summarize_prop_market_coverage",
]
