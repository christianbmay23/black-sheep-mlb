from __future__ import annotations

import unittest

from black_sheep_mlb.markets.schema import MarketBackedStatus, MarketCoverageStatus, MarketFreshness
from black_sheep_mlb.markets.status import (
    can_mark_market_backed_ev,
    classify_coverage,
    classify_manual_market,
    classify_market_backing,
)


class MarketStatusTests(unittest.TestCase):
    def test_classifies_full_partial_and_one_sided_coverage(self):
        self.assertEqual(
            classify_coverage(expected_count=2, priced_count=2, sides_present=["away", "home"]),
            MarketCoverageStatus.FULL,
        )
        self.assertEqual(
            classify_coverage(expected_count=9, priced_count=5, sides_present=["over", "under"]),
            MarketCoverageStatus.PARTIAL,
        )
        self.assertEqual(
            classify_coverage(expected_count=2, priced_count=1, sides_present=["away"]),
            MarketCoverageStatus.ONE_SIDED,
        )

    def test_unpriced_and_projection_only_are_separate(self):
        self.assertEqual(
            classify_coverage(expected_count=9, priced_count=0),
            MarketCoverageStatus.UNPRICED,
        )
        self.assertEqual(
            classify_coverage(expected_count=0, priced_count=0),
            MarketCoverageStatus.PROJECTION_ONLY,
        )

    def test_stale_market_cannot_be_market_backed_ev(self):
        self.assertFalse(
            can_mark_market_backed_ev(
                coverage_status=MarketCoverageStatus.FULL,
                freshness=MarketFreshness.STALE,
                has_price=True,
            )
        )
        self.assertEqual(
            classify_market_backing(
                coverage_status=MarketCoverageStatus.FULL,
                freshness=MarketFreshness.STALE,
                has_price=True,
            ),
            MarketBackedStatus.STALE,
        )

    def test_unpriced_hr_market_is_not_market_backed_ev(self):
        self.assertEqual(
            classify_market_backing(
                coverage_status=MarketCoverageStatus.UNPRICED,
                freshness=MarketFreshness.FRESH,
                has_price=False,
            ),
            MarketBackedStatus.UNPRICED,
        )

    def test_manual_only_market_classification(self):
        self.assertEqual(classify_manual_market(True), MarketBackedStatus.MANUAL_ONLY)
        self.assertEqual(classify_manual_market(False), MarketBackedStatus.UNPRICED)
        self.assertEqual(
            classify_market_backing(
                coverage_status=MarketCoverageStatus.MANUAL_ONLY,
                freshness=MarketFreshness.FRESH,
                has_price=True,
            ),
            MarketBackedStatus.MANUAL_ONLY,
        )

    def test_display_only_overrides_market_backed_ev(self):
        self.assertEqual(
            classify_market_backing(
                coverage_status=MarketCoverageStatus.FULL,
                freshness=MarketFreshness.FRESH,
                has_price=True,
                display_only=True,
            ),
            MarketBackedStatus.DISPLAY_ONLY,
        )


if __name__ == "__main__":
    unittest.main()
