from __future__ import annotations

import json
import tempfile
import unittest
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path
from contextlib import redirect_stdout
from unittest.mock import patch

from black_sheep_mlb.pipelines import check_sportsgameodds
from black_sheep_mlb.data_sources.sportsgameodds_provider import SportsGameOddsProvider
from black_sheep_mlb.markets.health import ProviderAvailability, ProviderIssueCode
from black_sheep_mlb.markets.schema import (
    MarketBackedStatus,
    MarketCoverageStatus,
    MarketFreshness,
    MarketSide,
    MarketType,
)
from black_sheep_mlb.markets.cache import FileMarketSnapshotCache


FIXTURE_DIR = Path(__file__).parent / "fixtures" / "sportsgameodds"


class SportsGameOddsProviderTests(unittest.TestCase):
    def test_default_provider_makes_no_network_call_and_requires_no_key(self):
        provider = SportsGameOddsProvider()

        with patch("urllib.request.urlopen", side_effect=AssertionError("network call attempted")):
            self.assertEqual(provider.get_game_markets("2026-04-30"), [])
            self.assertEqual(provider.get_player_prop_markets("2026-04-30"), [])

        self.assertFalse(provider.enable_live)

    def test_parses_game_odds_fixture(self):
        provider = _provider()

        markets, diagnostics = provider.parse_game_odds_payload(_fixture("game_odds.json"))

        self.assertEqual(diagnostics, [])
        self.assertEqual(len(markets), 6)
        moneyline = [market for market in markets if market.market_type == MarketType.MONEYLINE]
        spread = [market for market in markets if market.market_type == MarketType.SPREAD]
        total = [market for market in markets if market.market_type == MarketType.TOTAL]
        self.assertEqual([market.side for market in moneyline], [MarketSide.AWAY, MarketSide.HOME])
        self.assertEqual(spread[0].line, 1.5)
        self.assertEqual(total[0].line, 8.5)
        self.assertEqual(moneyline[0].game_key, "DET@BOS")
        self.assertEqual(moneyline[0].provider_event_id, "sgo_evt_det_bos_20260430")

    def test_parses_hr_prop_fixture(self):
        provider = _provider()

        props, diagnostics = provider.parse_player_props_payload(
            _fixture("player_props.json"),
            markets=["batter_home_runs"],
        )

        self.assertEqual(diagnostics, [])
        self.assertEqual(len(props), 1)
        prop = props[0]
        self.assertEqual(prop.market_type, MarketType.BATTER_HOME_RUNS)
        self.assertEqual(prop.player_name, "Riley Greene")
        self.assertEqual(prop.player_id, "sgo_player_rgreene")
        self.assertEqual(prop.raw_provider_metadata["player_id_namespace"], "sportsgameodds")
        self.assertEqual(prop.side, MarketSide.OVER)
        self.assertEqual(prop.line, 0.5)
        self.assertEqual(prop.price, 550)

    def test_parses_two_plus_total_bases_fixture(self):
        provider = _provider()

        props, diagnostics = provider.parse_player_props_payload(
            _fixture("player_props.json"),
            markets=["batter_total_bases"],
        )

        self.assertEqual(diagnostics, [])
        self.assertEqual(len(props), 1)
        self.assertEqual(props[0].market_type, MarketType.BATTER_TOTAL_BASES)
        self.assertEqual(props[0].line, 1.5)
        self.assertEqual(props[0].price, 145)

    def test_provider_health_maps_quota_rate_limit_auth_and_unsupported_market(self):
        provider = _provider()
        health = _fixture("provider_health.json")

        auth = provider.health_from_payload(health["auth_failure"])
        quota = provider.health_from_payload(health["quota"])
        rate_limit = provider.health_from_payload(health["rate_limit"])
        unsupported = provider.health_from_payload(health["unsupported_market"])
        available = provider.health_from_payload(health["available"])

        self.assertEqual(available.availability, ProviderAvailability.AVAILABLE)
        self.assertEqual(auth.availability, ProviderAvailability.UNAVAILABLE)
        self.assertEqual(auth.diagnostics[0].code, ProviderIssueCode.AUTHENTICATION_FAILURE)
        self.assertEqual(quota.diagnostics[0].code, ProviderIssueCode.QUOTA_EXHAUSTED)
        self.assertEqual(rate_limit.diagnostics[0].code, ProviderIssueCode.RATE_LIMITED)
        self.assertEqual(unsupported.availability, ProviderAvailability.DEGRADED)
        self.assertEqual(unsupported.diagnostics[0].code, ProviderIssueCode.UNSUPPORTED_MARKET)

    def test_health_maps_partial_coverage(self):
        provider = _provider()

        health = provider.health_from_payload(_fixture("provider_health.json")["partial_coverage"])

        self.assertEqual(health.availability, ProviderAvailability.DEGRADED)
        self.assertEqual(health.diagnostics[0].code, ProviderIssueCode.PARTIAL_COVERAGE)

    def test_missing_player_mapping_is_marked_explicitly(self):
        provider = _provider()
        payload = {
            "data": [
                {
                    "eventID": "sgo_evt_det_bos_20260430",
                    "gameKey": "DET@BOS",
                    "sportsbooks": [
                        {
                            "bookmaker": "fanduel",
                            "lastUpdated": "2026-04-30T12:45:00+00:00",
                            "markets": [
                                {
                                    "type": "batter_home_runs",
                                    "outcomes": [
                                        {
                                            "player": {"id": "sgo_unmapped_player", "team": "DET"},
                                            "side": "over",
                                            "line": 0.5,
                                            "price": 600,
                                        }
                                    ],
                                }
                            ],
                        }
                    ],
                }
            ]
        }

        props, diagnostics = provider.parse_player_props_payload(payload)

        self.assertEqual(len(props), 1)
        self.assertEqual(props[0].coverage_status, MarketCoverageStatus.DATA_BLOCKED)
        self.assertEqual(props[0].backed_status, MarketBackedStatus.DATA_BLOCKED)
        self.assertEqual(props[0].raw_provider_metadata["mapping_status"], "mapping_failed")
        self.assertEqual(diagnostics[0].code, ProviderIssueCode.MAPPING_FAILURE)

    def test_stale_markets_are_display_only_not_market_backed_ev(self):
        provider = SportsGameOddsProvider(
            now_utc=datetime(2026, 4, 30, 14, 0, tzinfo=timezone.utc),
            stale_minutes=30,
        )

        markets, diagnostics = provider.parse_game_odds_payload(_fixture("game_odds.json"))

        self.assertEqual(diagnostics, [])
        self.assertEqual(markets[0].freshness, MarketFreshness.STALE)
        self.assertEqual(markets[0].coverage_status, MarketCoverageStatus.STALE)
        self.assertEqual(markets[0].backed_status, MarketBackedStatus.STALE)
        self.assertNotEqual(markets[0].backed_status, MarketBackedStatus.MARKET_BACKED_EV)

    def test_preserves_provider_and_sportsbook_metadata(self):
        provider = _provider()

        snapshot = provider.get_market_snapshot_from_payloads(
            "2026-04-30",
            game_payload=_fixture("game_odds.json"),
            props_payload=_fixture("player_props.json"),
        )

        self.assertEqual(snapshot.raw_provider_metadata["provider"], "sportsgameodds")
        self.assertEqual(snapshot.raw_provider_metadata["mode"], "fixture")
        self.assertEqual(len(snapshot.provider_events), 1)
        self.assertEqual(snapshot.provider_events[0].provider_event_id, "sgo_evt_det_bos_20260430")
        self.assertEqual(snapshot.game_markets[0].provider, "sportsgameodds")
        self.assertEqual(snapshot.game_markets[0].sportsbook, "draftkings")
        self.assertEqual(snapshot.player_prop_markets[0].sportsbook, "fanduel")

    def test_partial_market_coverage_maps_to_partial_status(self):
        provider = _provider()
        payload = {
            "data": [
                {
                    "eventID": "sgo_evt_det_bos_20260430",
                    "gameKey": "DET@BOS",
                    "sportsbooks": [
                        {
                            "bookmaker": "draftkings",
                            "lastUpdated": "2026-04-30T12:45:00+00:00",
                            "markets": [
                                {
                                    "type": "moneyline",
                                    "outcomes": [
                                        {"side": "away", "participant": "DET", "price": -110},
                                        {"side": "home", "participant": "BOS"},
                                    ],
                                }
                            ],
                        }
                    ],
                }
            ]
        }

        markets, diagnostics = provider.parse_game_odds_payload(payload)

        self.assertEqual(diagnostics, [])
        self.assertEqual(markets[0].coverage_status, MarketCoverageStatus.PARTIAL)
        self.assertEqual(markets[1].coverage_status, MarketCoverageStatus.UNPRICED)

    def test_unsupported_market_returns_diagnostic(self):
        provider = _provider()
        payload = {
            "data": [
                {
                    "eventID": "sgo_evt_det_bos_20260430",
                    "gameKey": "DET@BOS",
                    "sportsbooks": [
                        {
                            "bookmaker": "draftkings",
                            "lastUpdated": "2026-04-30T12:45:00+00:00",
                            "markets": [{"type": "pitcher_strikeouts", "outcomes": [{"price": -110}]}],
                        }
                    ],
                }
            ]
        }

        markets, diagnostics = provider.parse_game_odds_payload(payload)

        self.assertEqual(markets, [])
        self.assertEqual(diagnostics[0].code, ProviderIssueCode.UNSUPPORTED_MARKET)

    def test_snapshot_round_trips_through_phase_two_cache_schema(self):
        provider = _provider()
        snapshot = provider.get_market_snapshot_from_payloads(
            "2026-04-30",
            game_payload=_fixture("game_odds.json"),
            props_payload=_fixture("player_props.json"),
        )

        with tempfile.TemporaryDirectory() as tmp:
            cache = FileMarketSnapshotCache(tmp)
            cache.store_snapshot(snapshot)
            loaded = cache.load_snapshot("2026-04-30")

        self.assertIsNotNone(loaded)
        assert loaded is not None
        self.assertEqual(len(loaded.game_markets), 6)
        self.assertEqual(len(loaded.player_prop_markets), 2)
        self.assertEqual(loaded.player_prop_markets[0].player_id, "sgo_player_rgreene")

    def test_live_dry_run_url_is_tiny_and_does_not_include_api_key(self):
        provider = SportsGameOddsProvider(api_key="secret", enable_live=True)

        url = provider.build_live_events_url(max_events=1)

        self.assertIn("/v2/events?", url)
        self.assertIn("leagueID=MLB", url)
        self.assertIn("oddsAvailable=true", url)
        self.assertIn("limit=1", url)
        self.assertIn("oddID=points-home-game-ml-home", url)
        self.assertIn("bookmakerID=fanduel%2Cdraftkings", url)
        self.assertNotIn("secret", url)
        self.assertNotIn("apiKey", url)

    def test_live_dry_run_requires_explicit_enable_live_and_key(self):
        with self.assertRaisesRegex(RuntimeError, "enable_live=True"):
            SportsGameOddsProvider(api_key="secret").fetch_live_events_dry_run()

        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "SPORTSGAMEODDS_API_KEY"):
                SportsGameOddsProvider(api_key=None, enable_live=True).fetch_live_events_dry_run()

    def test_live_dry_run_enforces_single_request_and_object_budget(self):
        provider = SportsGameOddsProvider(api_key="secret", enable_live=True)

        with self.assertRaisesRegex(ValueError, "capped at one live request"):
            provider.fetch_live_events_dry_run(max_requests=2)

        with self.assertRaisesRegex(ValueError, "max_events cannot exceed max_objects"):
            provider.fetch_live_events_dry_run(max_events=2, max_objects=1)

    def test_live_dry_run_uses_mocked_response_only_and_redacts_key(self):
        provider = SportsGameOddsProvider(api_key="secret", enable_live=True, timeout=7)
        response = _FakeHTTPResponse(
            {
                "success": True,
                "data": [
                    {
                        "eventID": "sgo_evt_1",
                        "gameKey": "DET@BOS",
                    }
                ],
            }
        )

        with patch("urllib.request.urlopen", return_value=response) as urlopen:
            result = provider.fetch_live_events_dry_run(max_events=1, max_requests=1, max_objects=1)

        request = urlopen.call_args.args[0]
        self.assertEqual(urlopen.call_args.kwargs["timeout"], 7)
        self.assertEqual(request.headers["X-api-key"], "secret")
        self.assertNotIn("secret", request.full_url)
        self.assertNotIn("secret", result["url"])
        self.assertEqual(result["object_count"], 1)
        self.assertEqual(result["request_count"], 1)


class SportsGameOddsCLITests(unittest.TestCase):
    def test_cli_without_live_makes_zero_requests_and_does_not_require_key(self):
        out = StringIO()
        with patch.dict("os.environ", {}, clear=True):
            with patch("urllib.request.urlopen", side_effect=AssertionError("network call attempted")):
                with redirect_stdout(out):
                    status = check_sportsgameodds.main(["--date", "2026-04-30"])

        payload = json.loads(out.getvalue())
        self.assertEqual(status, 0)
        self.assertEqual(payload["requests_planned"], 0)
        self.assertEqual(payload["status"], "not_run_live_flag_required")

    def test_cli_live_refuses_missing_key_before_network(self):
        out = StringIO()
        with patch.dict("os.environ", {}, clear=True):
            with patch("urllib.request.urlopen", side_effect=AssertionError("network call attempted")):
                with redirect_stdout(out):
                    status = check_sportsgameodds.main(["--date", "2026-04-30", "--live"])

        payload = json.loads(out.getvalue())
        self.assertEqual(status, 2)
        self.assertEqual(payload["status"], "blocked_missing_sportsgameodds_api_key")

    def test_cli_live_refuses_request_budget_above_one_before_network(self):
        out = StringIO()
        with patch.dict("os.environ", {"SPORTSGAMEODDS_API_KEY": "secret"}, clear=True):
            with patch("urllib.request.urlopen", side_effect=AssertionError("network call attempted")):
                with redirect_stdout(out):
                    status = check_sportsgameodds.main(
                        ["--date", "2026-04-30", "--live", "--max-requests", "2"]
                    )

        payload = json.loads(out.getvalue())
        self.assertEqual(status, 2)
        self.assertEqual(payload["status"], "blocked_request_budget_exceeds_phase4_cap")

    def test_cli_live_prints_warning_and_budget_before_mocked_call_without_key_leak(self):
        response = _FakeHTTPResponse({"success": True, "data": [{"eventID": "sgo_evt_1"}]})
        out = StringIO()

        with patch.dict("os.environ", {"SPORTSGAMEODDS_API_KEY": "secret"}, clear=True):
            with patch("urllib.request.urlopen", return_value=response) as urlopen:
                with redirect_stdout(out):
                    status = check_sportsgameodds.main(["--date", "2026-04-30", "--live"])

        text = out.getvalue()
        self.assertEqual(status, 0)
        self.assertEqual(urlopen.call_args.kwargs["timeout"], 10)
        self.assertIn("2.5k objects/month", text)
        self.assertIn("10 requests/minute", text)
        self.assertIn("10 minutes; do not poll", text)
        self.assertIn('"requests_planned": 1', text)
        self.assertIn('"max_events": 1', text)
        self.assertIn('"max_objects": 25', text)
        self.assertIn('"timeout_seconds": 10', text)
        self.assertIn('"status": "dry_run_completed"', text)
        self.assertNotIn("secret", text)

    def test_cli_accepts_timeout_and_passes_it_to_mocked_live_request(self):
        response = _FakeHTTPResponse({"success": True, "data": []})
        out = StringIO()

        with patch.dict("os.environ", {"SPORTSGAMEODDS_API_KEY": "secret"}, clear=True):
            with patch("urllib.request.urlopen", return_value=response) as urlopen:
                with redirect_stdout(out):
                    status = check_sportsgameodds.main(
                        [
                            "--date",
                            "2026-04-30",
                            "--live",
                            "--max-events",
                            "1",
                            "--max-requests",
                            "1",
                            "--max-objects",
                            "25",
                            "--timeout",
                            "10",
                        ]
                    )

        text = out.getvalue()
        self.assertEqual(status, 0)
        self.assertEqual(urlopen.call_args.kwargs["timeout"], 10)
        self.assertIn('"timeout_seconds": 10', text)
        self.assertNotIn("secret", text)

    def test_cli_rejects_invalid_timeout_before_network(self):
        out = StringIO()
        with patch.dict("os.environ", {"SPORTSGAMEODDS_API_KEY": "secret"}, clear=True):
            with patch("urllib.request.urlopen", side_effect=AssertionError("network call attempted")):
                with redirect_stdout(out):
                    with self.assertRaises(SystemExit) as exc:
                        check_sportsgameodds.main(
                            ["--date", "2026-04-30", "--live", "--timeout", "0"]
                        )

        self.assertEqual(exc.exception.code, 2)


def _fixture(name: str):
    return json.loads((FIXTURE_DIR / name).read_text(encoding="utf-8"))


def _provider() -> SportsGameOddsProvider:
    return SportsGameOddsProvider(api_key=None, now_utc=_now(), stale_minutes=60)


def _now():
    return datetime(2026, 4, 30, 13, 0, tzinfo=timezone.utc)


class _FakeHTTPResponse:
    status = 200

    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


if __name__ == "__main__":
    unittest.main()
