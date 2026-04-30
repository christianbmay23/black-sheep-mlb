from __future__ import annotations

import csv
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from black_sheep_mlb.data_sources.manual_market_provider import ManualMarketCSVProvider
from black_sheep_mlb.markets.schema import (
    MANUAL_MARKET_CSV_COLUMNS,
    MarketBackedStatus,
    MarketCoverageStatus,
    MarketFreshness,
    MarketSide,
    MarketType,
)


class ManualMarketProviderTests(unittest.TestCase):
    def test_manual_provider_reads_game_odds_and_props(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "market_snapshot.csv"
            _write_rows(
                path,
                [
                    _row(market_type="moneyline", side="away", participant="DET", team="DET", price="-110"),
                    _row(market_type="moneyline", side="home", participant="BOS", team="BOS", price="100"),
                    _row(market_type="run_line", side="away", participant="DET", team="DET", line="-1.5", price="145"),
                    _row(market_type="total", side="over", participant="Over", line="8.5", price="-105"),
                    _row(
                        market_type="batter_home_runs",
                        side="over",
                        participant="Riley Greene",
                        player_name="Riley Greene",
                        player_id="123",
                        team="DET",
                        line="0.5",
                        price="550",
                    ),
                    _row(
                        market_type="2+ TB",
                        side="over",
                        participant="Riley Greene",
                        player_name="Riley Greene",
                        player_id="123",
                        team="DET",
                        line="1.5",
                        price="145",
                    ),
                ],
            )

            provider = ManualMarketCSVProvider(path, now_utc=_now())
            game_markets = provider.get_game_markets("2026-04-30")
            props = provider.get_player_prop_markets("2026-04-30")

        self.assertEqual(len(game_markets), 4)
        self.assertEqual(len(props), 2)
        self.assertEqual(game_markets[2].market_type, MarketType.SPREAD)
        self.assertEqual(game_markets[3].market_type, MarketType.TOTAL)
        self.assertEqual(props[0].market_type, MarketType.BATTER_HOME_RUNS)
        self.assertEqual(props[1].market_type, MarketType.BATTER_TOTAL_BASES)
        self.assertEqual(props[1].line, 1.5)

    def test_manual_provider_labels_rows_manual_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "market_snapshot.csv"
            _write_rows(path, [_row(market_type="moneyline", side="away", participant="DET", team="DET", price="-110")])

            market = ManualMarketCSVProvider(path, now_utc=_now()).get_game_markets("2026-04-30")[0]

        self.assertEqual(market.freshness, MarketFreshness.FRESH)
        self.assertEqual(market.coverage_status, MarketCoverageStatus.MANUAL_ONLY)
        self.assertEqual(market.backed_status, MarketBackedStatus.MANUAL_ONLY)

    def test_manual_provider_marks_stale_rows(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "market_snapshot.csv"
            _write_rows(
                path,
                [
                    _row(
                        market_type="batter_home_runs",
                        side="over",
                        player_name="Riley Greene",
                        team="DET",
                        line="0.5",
                        price="550",
                        timestamp="2026-04-30T12:00:00+00:00",
                    )
                ],
            )

            prop = ManualMarketCSVProvider(path, stale_minutes=30, now_utc=_now()).get_player_prop_markets(
                "2026-04-30"
            )[0]

        self.assertEqual(prop.freshness, MarketFreshness.STALE)
        self.assertEqual(prop.coverage_status, MarketCoverageStatus.STALE)
        self.assertEqual(prop.backed_status, MarketBackedStatus.STALE)

    def test_manual_provider_marks_missing_price_unpriced(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "market_snapshot.csv"
            _write_rows(path, [_row(market_type="batter_home_runs", side="over", player_name="Riley Greene", price="")])

            prop = ManualMarketCSVProvider(path, now_utc=_now()).get_player_prop_markets("2026-04-30")[0]

        self.assertEqual(prop.coverage_status, MarketCoverageStatus.UNPRICED)
        self.assertEqual(prop.backed_status, MarketBackedStatus.UNPRICED)

    def test_manual_provider_filters_game_keys_and_prop_markets(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "market_snapshot.csv"
            _write_rows(
                path,
                [
                    _row(game_key="DET@BOS", market_type="moneyline", side="away", participant="DET", team="DET", price="-110"),
                    _row(game_key="NYY@TOR", market_type="moneyline", side="away", participant="NYY", team="NYY", price="-120"),
                    _row(game_key="DET@BOS", market_type="batter_home_runs", side="over", player_name="Riley Greene", price="550"),
                    _row(game_key="DET@BOS", market_type="batter_total_bases", side="over", player_name="Riley Greene", price="145"),
                ],
            )

            provider = ManualMarketCSVProvider(path, now_utc=_now())
            game_markets = provider.get_game_markets("2026-04-30", game_keys=["DET@BOS"])
            props = provider.get_player_prop_markets("2026-04-30", game_keys=["DET@BOS"], markets=["batter_total_bases"])

        self.assertEqual(len(game_markets), 1)
        self.assertEqual(game_markets[0].game_key, "DET@BOS")
        self.assertEqual(len(props), 1)
        self.assertEqual(props[0].market_type, MarketType.BATTER_TOTAL_BASES)

    def test_missing_manual_csv_returns_projection_only_empty_snapshot(self):
        with tempfile.TemporaryDirectory() as tmp:
            provider = ManualMarketCSVProvider(Path(tmp) / "missing.csv", now_utc=_now())

            snapshot = provider.get_market_snapshot("2026-04-30")

        self.assertEqual(snapshot.game_markets, [])
        self.assertEqual(snapshot.player_prop_markets, [])
        self.assertEqual(snapshot.raw_provider_metadata["market_count"], 0)
        self.assertEqual(snapshot.diagnostics[0]["code"], "manual_market_csv_missing")


def _now() -> datetime:
    return datetime(2026, 4, 30, 13, 0, tzinfo=timezone.utc)


def _row(**overrides: str) -> dict[str, str]:
    row = {column: "" for column in MANUAL_MARKET_CSV_COLUMNS}
    row.update(
        {
            "date": "2026-04-30",
            "game_key": "DET@BOS",
            "provider": "manual_csv",
            "sportsbook": "manual",
            "timestamp": "2026-04-30T12:45:00+00:00",
            "source_confidence": "manual",
        }
    )
    row.update(overrides)
    return row


def _write_rows(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(MANUAL_MARKET_CSV_COLUMNS))
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    unittest.main()
