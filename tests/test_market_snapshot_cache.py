from __future__ import annotations

import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from black_sheep_mlb.markets.cache import FileMarketSnapshotCache, snapshot_from_dict, snapshot_to_dict
from black_sheep_mlb.markets.schema import (
    GameMarket,
    MarketBackedStatus,
    MarketCoverageStatus,
    MarketFreshness,
    MarketSide,
    MarketSnapshot,
    MarketType,
    PlayerPropMarket,
)


class MarketSnapshotCacheTests(unittest.TestCase):
    def test_cache_round_trips_market_snapshot(self):
        snapshot = _sample_snapshot(generated_at="2026-04-30T12:00:00+00:00")
        with tempfile.TemporaryDirectory() as tmp:
            cache = FileMarketSnapshotCache(tmp)
            cache.store_snapshot(snapshot)

            loaded = cache.load_snapshot("2026-04-30")

        self.assertIsNotNone(loaded)
        assert loaded is not None
        self.assertEqual(loaded.report_date, "2026-04-30")
        self.assertEqual(loaded.game_markets[0].market_type, MarketType.MONEYLINE)
        self.assertEqual(loaded.player_prop_markets[0].market_type, MarketType.BATTER_HOME_RUNS)
        self.assertEqual(loaded.markets_for_game("DET@BOS"), [loaded.game_markets[0], loaded.player_prop_markets[0]])

    def test_cache_marks_loaded_snapshot_stale_when_generated_at_exceeds_threshold(self):
        snapshot = _sample_snapshot(generated_at="2026-04-30T12:00:00+00:00")
        now = datetime(2026, 4, 30, 14, 1, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as tmp:
            cache = FileMarketSnapshotCache(tmp, stale_minutes=60, now_utc=now)
            cache.store_snapshot(snapshot)

            loaded = cache.load_snapshot("2026-04-30")

        assert loaded is not None
        self.assertEqual(loaded.game_markets[0].freshness, MarketFreshness.STALE)
        self.assertEqual(loaded.game_markets[0].coverage_status, MarketCoverageStatus.STALE)
        self.assertEqual(loaded.game_markets[0].backed_status, MarketBackedStatus.STALE)
        self.assertEqual(loaded.raw_provider_metadata["cache_status"], "stale")

    def test_cache_returns_none_for_missing_snapshot(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIsNone(FileMarketSnapshotCache(tmp).load_snapshot("2026-04-30"))

    def test_snapshot_dict_helpers_preserve_enum_values(self):
        snapshot = _sample_snapshot(generated_at="2026-04-30T12:00:00+00:00")

        raw = snapshot_to_dict(snapshot)
        loaded = snapshot_from_dict(raw)

        self.assertEqual(raw["game_markets"][0]["freshness"], "fresh")
        self.assertEqual(loaded.game_markets[0].freshness, MarketFreshness.FRESH)
        self.assertEqual(loaded.player_prop_markets[0].side, MarketSide.OVER)


def _sample_snapshot(*, generated_at: str) -> MarketSnapshot:
    return MarketSnapshot(
        report_date="2026-04-30",
        generated_at=generated_at,
        game_markets=[
            GameMarket(
                game_key="DET@BOS",
                provider="manual_csv",
                provider_event_id="manual:1",
                sportsbook="manual",
                market_type=MarketType.MONEYLINE,
                participant="DET",
                team="DET",
                side=MarketSide.AWAY,
                price=-110,
                freshness=MarketFreshness.FRESH,
                coverage_status=MarketCoverageStatus.MANUAL_ONLY,
                backed_status=MarketBackedStatus.MANUAL_ONLY,
            )
        ],
        player_prop_markets=[
            PlayerPropMarket(
                game_key="DET@BOS",
                provider="manual_csv",
                provider_event_id="manual:1",
                sportsbook="manual",
                market_type=MarketType.BATTER_HOME_RUNS,
                player_name="Riley Greene",
                team="DET",
                side=MarketSide.OVER,
                line=0.5,
                price=550,
                freshness=MarketFreshness.FRESH,
                coverage_status=MarketCoverageStatus.MANUAL_ONLY,
                backed_status=MarketBackedStatus.MANUAL_ONLY,
            )
        ],
    )


if __name__ == "__main__":
    unittest.main()
