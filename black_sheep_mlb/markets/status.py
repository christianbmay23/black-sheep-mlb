"""Market coverage and actionability status helpers."""
from __future__ import annotations

from collections.abc import Iterable

from .schema import MarketBackedStatus, MarketCoverageStatus, MarketFreshness, MarketSide


def classify_coverage(
    *,
    expected_count: int,
    priced_count: int,
    sides_present: Iterable[str] | None = None,
    manual_only: bool = False,
    data_blocked: bool = False,
    stale: bool = False,
) -> MarketCoverageStatus:
    if data_blocked:
        return MarketCoverageStatus.DATA_BLOCKED
    if stale:
        return MarketCoverageStatus.STALE
    if manual_only:
        return MarketCoverageStatus.MANUAL_ONLY
    if expected_count <= 0:
        return MarketCoverageStatus.PROJECTION_ONLY
    if priced_count <= 0:
        return MarketCoverageStatus.UNPRICED
    normalized_sides = {str(side).strip().lower() for side in (sides_present or []) if str(side).strip()}
    if _is_one_sided(normalized_sides):
        return MarketCoverageStatus.ONE_SIDED
    if priced_count >= expected_count:
        return MarketCoverageStatus.FULL
    return MarketCoverageStatus.PARTIAL


def classify_market_backing(
    *,
    coverage_status: MarketCoverageStatus | str,
    freshness: MarketFreshness | str = MarketFreshness.UNKNOWN,
    has_price: bool = True,
    display_only: bool = False,
) -> MarketBackedStatus:
    coverage = _coverage(coverage_status)
    fresh = _freshness(freshness)
    if coverage == MarketCoverageStatus.DATA_BLOCKED:
        return MarketBackedStatus.DATA_BLOCKED
    if display_only:
        return MarketBackedStatus.DISPLAY_ONLY
    if fresh == MarketFreshness.STALE or coverage == MarketCoverageStatus.STALE:
        return MarketBackedStatus.STALE
    if coverage == MarketCoverageStatus.MANUAL_ONLY:
        return MarketBackedStatus.MANUAL_ONLY
    if not has_price or coverage == MarketCoverageStatus.UNPRICED:
        return MarketBackedStatus.UNPRICED
    if coverage == MarketCoverageStatus.PROJECTION_ONLY:
        return MarketBackedStatus.PROJECTION_ONLY
    if coverage in {MarketCoverageStatus.FULL, MarketCoverageStatus.PARTIAL, MarketCoverageStatus.ONE_SIDED}:
        return MarketBackedStatus.MARKET_BACKED_EV
    return MarketBackedStatus.DISPLAY_ONLY


def can_mark_market_backed_ev(
    *,
    coverage_status: MarketCoverageStatus | str,
    freshness: MarketFreshness | str,
    has_price: bool,
) -> bool:
    return (
        classify_market_backing(
            coverage_status=coverage_status,
            freshness=freshness,
            has_price=has_price,
        )
        == MarketBackedStatus.MARKET_BACKED_EV
    )


def classify_manual_market(has_price: bool, *, stale: bool = False) -> MarketBackedStatus:
    if stale:
        return MarketBackedStatus.STALE
    if not has_price:
        return MarketBackedStatus.UNPRICED
    return MarketBackedStatus.MANUAL_ONLY


def _is_one_sided(sides: set[str]) -> bool:
    if not sides:
        return False
    away_home = {MarketSide.AWAY.value, MarketSide.HOME.value}
    over_under = {MarketSide.OVER.value, MarketSide.UNDER.value}
    yes_no = {MarketSide.YES.value, MarketSide.NO.value}
    return any(len(sides & pair) == 1 for pair in (away_home, over_under, yes_no))


def _coverage(value: MarketCoverageStatus | str) -> MarketCoverageStatus:
    if isinstance(value, MarketCoverageStatus):
        return value
    try:
        return MarketCoverageStatus(str(value))
    except ValueError:
        return MarketCoverageStatus.PARTIAL


def _freshness(value: MarketFreshness | str) -> MarketFreshness:
    if isinstance(value, MarketFreshness):
        return value
    try:
        return MarketFreshness(str(value))
    except ValueError:
        return MarketFreshness.UNKNOWN
