from __future__ import annotations

import unittest
from types import SimpleNamespace

from black_sheep_mlb.data_sources.odds_provider import BookmakerMarket, GameOdds, OddsOutcome
from black_sheep_mlb.markets.schema import (
    MANUAL_MARKET_CSV_COLUMNS,
    GameMarket,
    MarketBackedStatus,
    MarketCoverageStatus,
    MarketFreshness,
    MarketSide,
    MarketSnapshot,
    MarketType,
    PlayerPropMarket,
    ProviderEventRef,
    game_markets_from_legacy_game_odds,
    player_prop_market_from_legacy_line,
)


class MarketSchemaTests(unittest.TestCase):
    def test_market_snapshot_groups_game_and_prop_markets(self):
        event = ProviderEventRef(provider="test", provider_event_id="evt1", game_key="DET@BOS")
        game_market = GameMarket(
            game_key="DET@BOS",
            provider="test",
            provider_event_id="evt1",
            sportsbook="book",
            market_type=MarketType.MONEYLINE,
            participant="DET",
            team="DET",
            side=MarketSide.AWAY,
            price=-110,
            timestamp="2026-04-30T12:00:00Z",
            freshness=MarketFreshness.FRESH,
            coverage_status=MarketCoverageStatus.FULL,
            backed_status=MarketBackedStatus.DISPLAY_ONLY,
            source_confidence="provider",
        )
        prop_market = PlayerPropMarket(
            game_key="DET@BOS",
            provider="test",
            provider_event_id="evt1",
            sportsbook="book",
            market_type=MarketType.BATTER_HOME_RUNS,
            player_name="Riley Greene",
            player_id=123,
            team="DET",
            side=MarketSide.OVER,
            line=0.5,
            price=550,
            timestamp="2026-04-30T12:00:00Z",
            freshness=MarketFreshness.FRESH,
            coverage_status=MarketCoverageStatus.FULL,
            backed_status=MarketBackedStatus.DISPLAY_ONLY,
            source_confidence="provider",
        )

        snapshot = MarketSnapshot(
            report_date="2026-04-30",
            provider_events=[event],
            game_markets=[game_market],
            player_prop_markets=[prop_market],
        )

        self.assertEqual(snapshot.markets_for_game("DET@BOS"), [game_market, prop_market])
        self.assertEqual(snapshot.markets_for_game("NYY@TOR"), [])

    def test_manual_market_csv_schema_includes_game_and_prop_identifiers(self):
        required = {
            "date",
            "game_key",
            "provider_event_id",
            "sportsbook",
            "market_type",
            "participant",
            "player_name",
            "player_id",
            "team",
            "line",
            "side",
            "price",
            "timestamp",
        }
        self.assertTrue(required.issubset(set(MANUAL_MARKET_CSV_COLUMNS)))

    def test_legacy_package_game_odds_bridge_normalizes_moneyline_rows(self):
        odds = GameOdds(
            provider="oddsapi",
            sport_key="baseball_mlb",
            game_id="evt1",
            commence_time="2026-04-30T18:00:00Z",
            away_team="Detroit Tigers",
            home_team="Boston Red Sox",
            fetched_at="2026-04-30T12:00:00Z",
            markets=[
                BookmakerMarket(
                    bookmaker="draftkings",
                    market="h2h",
                    outcomes=[
                        OddsOutcome("Detroit Tigers", -110),
                        OddsOutcome("Boston Red Sox", 100),
                    ],
                )
            ],
        )

        markets = game_markets_from_legacy_game_odds(odds)

        self.assertEqual(len(markets), 2)
        self.assertEqual(markets[0].game_key, "Detroit Tigers@Boston Red Sox")
        self.assertEqual(markets[0].market_type, MarketType.MONEYLINE)
        self.assertEqual(markets[0].side, MarketSide.AWAY)
        self.assertEqual(markets[1].side, MarketSide.HOME)

    def test_legacy_live_game_odds_bridge_handles_total_and_moneyline_fields(self):
        odds = SimpleNamespace(
            event_id="rotowire:1",
            away_abbr="DET",
            home_abbr="BOS",
            away_moneyline=-110,
            home_moneyline=100,
            total_line=8.5,
            over_price=-105,
            under_price=-115,
            last_update="2026-04-30",
            source="rotowire_game_table",
        )

        markets = game_markets_from_legacy_game_odds(odds)

        self.assertEqual([market.market_type for market in markets], [
            MarketType.MONEYLINE,
            MarketType.MONEYLINE,
            MarketType.TOTAL,
            MarketType.TOTAL,
        ])
        self.assertEqual(markets[2].line, 8.5)
        self.assertEqual(markets[2].side, MarketSide.OVER)

    def test_legacy_prop_line_bridge_normalizes_player_market(self):
        line = SimpleNamespace(
            event_id="evt1",
            market_key="batter_total_bases",
            player_key="rileygreene",
            player_name="Riley Greene",
            point=1.5,
            over_price=145,
            under_price=-170,
            bookmakers_count=3,
            last_update="2026-04-30T12:00:00Z",
            source="odds_api",
        )

        market = player_prop_market_from_legacy_line("DET@BOS", line)

        self.assertEqual(market.game_key, "DET@BOS")
        self.assertEqual(market.market_type, MarketType.BATTER_TOTAL_BASES)
        self.assertEqual(market.side, MarketSide.OVER)
        self.assertEqual(market.price, 145)


if __name__ == "__main__":
    unittest.main()
