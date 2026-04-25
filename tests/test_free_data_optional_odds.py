from __future__ import annotations

import csv
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from black_sheep_mlb.data_sources.cached_odds_provider import CachedOddsProvider
from black_sheep_mlb.data_sources.manual_csv_odds_provider import ManualCSVOddsProvider
from black_sheep_mlb.data_sources.mlb_stats_client import MLBGame, MLBStatsClient
from black_sheep_mlb.data_sources.odds_provider import BookmakerMarket, GameOdds, OddsOutcome
from black_sheep_mlb.data_sources.the_odds_api_provider import TheOddsAPIProvider
from black_sheep_mlb.pipelines.market_overlay import american_to_prob, compute_edge, remove_vig_two_way
from black_sheep_mlb.pipelines.run_daily_predictions import run_daily_predictions


class MLBStatsClientTests(unittest.TestCase):
    def test_schedule_parses_probable_pitchers(self):
        client = MLBStatsClient()
        client._get_json = mock.Mock(return_value=_schedule_payload(with_pitchers=True))

        games = client.get_schedule("2026-04-24")

        self.assertEqual(len(games), 1)
        self.assertEqual(games[0].away_probable_pitcher, "Away Starter")
        self.assertEqual(games[0].home_probable_pitcher_id, 22)

    def test_schedule_handles_missing_probable_pitchers(self):
        client = MLBStatsClient()
        client._get_json = mock.Mock(return_value=_schedule_payload(with_pitchers=False))

        games = client.get_schedule("2026-04-24")

        self.assertIsNone(games[0].away_probable_pitcher)
        self.assertIsNone(games[0].home_probable_pitcher_id)


class OddsProviderTests(unittest.TestCase):
    def test_odds_api_provider_converts_json(self):
        provider = TheOddsAPIProvider("key")
        response = _FakeHTTPResponse(
            [
                {
                    "id": "evt1",
                    "commence_time": "2026-04-24T20:00:00Z",
                    "home_team": "Boston Red Sox",
                    "away_team": "New York Yankees",
                    "bookmakers": [
                        {
                            "key": "draftkings",
                            "markets": [
                                {
                                    "key": "h2h",
                                    "outcomes": [
                                        {"name": "New York Yankees", "price": -115},
                                        {"name": "Boston Red Sox", "price": 105},
                                    ],
                                }
                            ],
                        }
                    ],
                }
            ]
        )
        with mock.patch("urllib.request.urlopen", return_value=response):
            odds = provider.get_game_odds("2026-04-24", ["h2h"])

        self.assertEqual(odds[0].provider, "oddsapi")
        self.assertEqual(odds[0].markets[0].outcomes[0].price, -115)

    def test_cached_odds_provider_returns_fresh_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            wrapped = _CountingProvider([_sample_odds()])
            provider = CachedOddsProvider(wrapped, Path(tmp) / "odds.sqlite", stale_minutes=45)
            first = provider.get_game_odds("2026-04-24", ["h2h"])
            second = provider.get_game_odds("2026-04-24", ["h2h"])

        self.assertEqual(len(first), 1)
        self.assertEqual(len(second), 1)
        self.assertEqual(wrapped.calls, 1)

    def test_cached_odds_provider_falls_back_to_stale_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "odds.sqlite"
            provider = CachedOddsProvider(_CountingProvider([_sample_odds()]), db, stale_minutes=0)
            provider.get_game_odds("2026-04-24", ["h2h"])
            stale = CachedOddsProvider(_FailingProvider(), db, stale_minutes=0)
            odds = stale.get_game_odds("2026-04-24", ["h2h"])

        self.assertEqual(len(odds), 1)
        self.assertTrue(stale.last_cache_hit)

    def test_manual_csv_provider_reads_rows(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "odds_snapshot.csv"
            with path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(
                    handle,
                    fieldnames=[
                        "date",
                        "home_team",
                        "away_team",
                        "bookmaker",
                        "market",
                        "outcome_name",
                        "price",
                        "point",
                    ],
                )
                writer.writeheader()
                writer.writerow(
                    {
                        "date": "2026-04-24",
                        "home_team": "Boston Red Sox",
                        "away_team": "New York Yankees",
                        "bookmaker": "manual",
                        "market": "h2h",
                        "outcome_name": "New York Yankees",
                        "price": "-110",
                        "point": "",
                    }
                )
            odds = ManualCSVOddsProvider(path).get_game_odds("2026-04-24", ["h2h"])

        self.assertEqual(len(odds), 1)
        self.assertEqual(odds[0].markets[0].outcomes[0].price, -110)


class PipelineTests(unittest.TestCase):
    def test_prediction_pipeline_runs_with_no_odds(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {"DATA_DIR": tmp}, clear=False):
            summary = run_daily_predictions(
                date="2026-04-24",
                no_odds=True,
                mlb_client=_FakeMLBClient(),
            )

        self.assertEqual(summary["number_of_predictions_generated"], 1)
        self.assertFalse(summary["odds_enabled"])

    def test_prediction_pipeline_runs_with_missing_odds_key(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(
            os.environ,
            {"DATA_DIR": tmp, "ODDS_API_KEY": "", "THE_ODDS_API_KEY": ""},
            clear=False,
        ):
            summary = run_daily_predictions(
                date="2026-04-24",
                odds_provider_name="oddsapi",
                mlb_client=_FakeMLBClient(),
            )

        self.assertEqual(summary["number_of_predictions_generated"], 1)
        self.assertEqual(summary["odds_provider_used"], "oddsapi")


class EVHelperTests(unittest.TestCase):
    def test_american_odds_conversion(self):
        self.assertAlmostEqual(american_to_prob(-150), 0.6)
        self.assertAlmostEqual(american_to_prob(150), 0.4)

    def test_two_way_no_vig(self):
        a, b = remove_vig_two_way(0.55, 0.55)
        self.assertAlmostEqual(a, 0.5)
        self.assertAlmostEqual(b, 0.5)

    def test_missing_odds_edge_is_none(self):
        self.assertIsNone(compute_edge(0.55, None))


def _schedule_payload(with_pitchers: bool) -> dict:
    away = {"team": {"id": 10, "name": "New York Yankees", "abbreviation": "NYY"}}
    home = {"team": {"id": 20, "name": "Boston Red Sox", "abbreviation": "BOS"}}
    if with_pitchers:
        away["probablePitcher"] = {"id": 11, "fullName": "Away Starter"}
        home["probablePitcher"] = {"id": 22, "fullName": "Home Starter"}
    return {
        "dates": [
            {
                "date": "2026-04-24",
                "games": [
                    {
                        "gamePk": 123,
                        "gameDate": "2026-04-24T20:00:00Z",
                        "teams": {"away": away, "home": home},
                        "status": {"detailedState": "Scheduled"},
                    }
                ],
            }
        ]
    }


def _sample_odds() -> GameOdds:
    return GameOdds(
        provider="test",
        sport_key="baseball_mlb",
        game_id="evt1",
        commence_time=None,
        home_team="Boston Red Sox",
        away_team="New York Yankees",
        markets=[
            BookmakerMarket(
                bookmaker="book",
                market="h2h",
                outcomes=[
                    OddsOutcome("New York Yankees", -110),
                    OddsOutcome("Boston Red Sox", 100),
                ],
            )
        ],
        fetched_at="2026-04-24T00:00:00+00:00",
    )


class _CountingProvider:
    provider_name = "test_provider"
    sport_key = "baseball_mlb"

    def __init__(self, odds: list[GameOdds]):
        self.odds = odds
        self.calls = 0

    def get_game_odds(self, date, markets, regions=None, bookmakers=None):
        self.calls += 1
        return self.odds


class _FailingProvider:
    provider_name = "test_provider"
    sport_key = "baseball_mlb"

    def get_game_odds(self, date, markets, regions=None, bookmakers=None):
        raise RuntimeError("offline")


class _FakeMLBClient:
    def get_schedule(self, date: str) -> list[MLBGame]:
        return [
            MLBGame(
                game_pk=123,
                game_date=date,
                game_datetime="2026-04-24T20:00:00Z",
                away_team="New York Yankees",
                home_team="Boston Red Sox",
                away_probable_pitcher="Away Starter",
                home_probable_pitcher="Home Starter",
            )
        ]


class _FakeHTTPResponse:
    def __init__(self, payload):
        self.payload = payload
        self.headers = {"x-requests-remaining": "42"}

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


if __name__ == "__main__":
    unittest.main()
