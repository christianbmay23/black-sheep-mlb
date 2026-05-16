from __future__ import annotations

import csv
import io
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch

from echoiq_v3.daily_agent.config import AgentConfig
from echoiq_v3.daily_agent.data_sources import NightShiftDataSources, SourceTracker
from echoiq_v3.daily_agent.dates import resolve_run_dates
from echoiq_v3.daily_agent.market_context import apply_v3_market_context
from echoiq_v3.daily_agent.manual_inputs import MANUAL_INPUT_PREFLIGHT_FIELDS, run_manual_input_preflight
from echoiq_v3.daily_agent.mlb_stats_client import NightShiftMLBStatsClient
from echoiq_v3.daily_agent.odds_client import fetch_odds_enrichment, implied_probability_from_american
from echoiq_v3.daily_agent.postgame_learning import HIDDEN_WINNERS_FIELDS, PREDICTION_GRADES_FIELDS
from echoiq_v3.daily_agent.run_daily_agent import main, run_daily_agent
from echoiq_v3.daily_agent.schemas import (
    FINAL_ECHOIQ_PREDICTIONS_FIELDS,
    GAME_RESULTS_FIELDS,
    INJURY_NEWS_FIELDS,
    MARKET_SNAPSHOT_FIELDS,
    PITCHER_USAGE_FIELDS,
    PLAYER_PERFORMANCE_FIELDS,
    VERIFIED_SLATE_FIELDS,
    WATCHLIST_FIELDS,
    InjuryNewsRow,
    MarketSnapshotRow,
    MatchupNote,
    PitcherUsage,
    PlayerPerformance,
    SlateGame,
    WatchlistEntry,
)
from echoiq_v3.daily_agent.sportsradar_client import fetch_sportsradar_enrichment
from echoiq_v3.daily_agent.statcast_client import NightShiftStatcastClient
from echoiq_v3.daily_agent.statcast_enrichment import build_daily_statcast_summary, build_match_diagnostics, enrich_pitcher_usage, enrich_player_performance
from echoiq_v3.daily_agent.pregame_refresh import (
    LINEUP_VERIFICATION_FIELDS,
    MANUAL_INPUT_VALIDATION_FIELDS,
    PLAYER_PROP_AVAILABILITY_FIELDS,
    VERIFICATION_MATRIX_FIELDS,
    WATCHLIST_SURVIVAL_FIELDS,
    WEATHER_REFRESH_FIELDS,
    _lineup_player_rows_from_game_feed,
    _market_refresh_rows,
    _player_prop_rows,
    _record_market_mapping_gaps,
    _verification_matrix_rows,
    _watchlist_survival_rows,
)
from echoiq_v3.daily_agent.verification_gates import (
    VerificationGateInput,
    WatchlistGateInput,
    classify_watchlist_survival,
    evaluate_game_gates,
)


class EchoIQNightShiftTests(unittest.TestCase):
    def test_date_resolution_uses_slate_date_minus_one_for_postgame(self):
        resolved = resolve_run_dates(date_token="2026-05-15", timezone="America/Chicago")

        self.assertEqual(resolved.slate_date, date(2026, 5, 15))
        self.assertEqual(resolved.postgame_date, date(2026, 5, 14))

    def test_explicit_date_pair(self):
        resolved = resolve_run_dates(
            postgame_date="2026-05-14",
            slate_date="2026-05-15",
            timezone="America/Chicago",
        )

        self.assertEqual(resolved.slate_date_str, "2026-05-15")
        self.assertEqual(resolved.postgame_date_str, "2026-05-14")

    def test_output_paths_follow_night_shift_structure(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            paths = config.paths_for("2026-05-15", "2026-05-14")

            self.assertEqual(paths.postgame_report.name, "2026-05-14_postgame_audit.md")
            self.assertEqual(paths.preview_report.name, "2026-05-15_slate_preview.md")
            self.assertEqual(paths.hr_watchlist_csv.parent.name, "03_watchlists")
            self.assertEqual(paths.source_log.parent.name, "logs")
            self.assertEqual(paths.market_snapshot_csv.name, "market_snapshot.csv")
            self.assertEqual(paths.injury_news_csv.name, "injury_news.csv")

    def test_dry_run_writes_no_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))

            result = run_daily_agent(date_token="2026-05-15", dry_run=True, config=config)

            self.assertTrue(result.dry_run)
            self.assertGreater(len(result.files_written), 0)
            self.assertFalse((Path(tmp) / "slates" / "2026-05-15").exists())

    def test_offline_run_writes_schema_and_gaps(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))

            result = run_daily_agent(date_token="2026-05-15", offline=True, config=config)
            game_results = Path(tmp) / "slates" / "2026-05-15" / "01_postgame_audit" / "game_results.csv"
            market_snapshot = Path(tmp) / "slates" / "2026-05-15" / "02_next_slate_research" / "market_snapshot.csv"
            injury_news = Path(tmp) / "slates" / "2026-05-15" / "02_next_slate_research" / "injury_news.csv"
            gaps = Path(tmp) / "slates" / "2026-05-15" / "logs" / "unresolved_gaps.md"

            self.assertFalse(result.dry_run)
            self.assertTrue(game_results.exists())
            with game_results.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(next(csv.reader(handle)), GAME_RESULTS_FIELDS)
            with market_snapshot.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(next(csv.reader(handle)), MARKET_SNAPSHOT_FIELDS)
            with injury_news.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(next(csv.reader(handle)), INJURY_NEWS_FIELDS)
            self.assertTrue(gaps.exists())
            gap_text = gaps.read_text(encoding="utf-8")
            self.assertIn("MLB Stats API schedule", gap_text)
            self.assertIn("SPORTSRADAR_DISABLED", gap_text)
            self.assertIn("ODDS_EMPTY_FOR_SLATE", gap_text)

    def test_pregame_refresh_cli_dispatch_dry_run(self):
        output = io.StringIO()
        with patch("sys.stdout", output):
            code = main(["--date", "2026-05-15", "--mode", "pregame-refresh", "--dry-run"])

        self.assertEqual(code, 0)
        text = output.getvalue()
        self.assertIn("Scope: pregame-refresh", text)
        self.assertIn("04_pregame_refresh", text)
        self.assertIn("verification_matrix.csv", text)

    def test_pregame_refresh_summary_command_reads_existing_artifacts(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slate_dir = root / "slates" / "2026-05-15"
            _write_pregame_summary_artifacts(slate_dir)
            output = io.StringIO()

            with patch("sys.stdout", output), patch.dict("os.environ", {"ECHOIQ_DATA_DIR": str(root / "slates")}, clear=False):
                code = main(["--date", "2026-05-15", "--summarize-pregame-refresh"])

            text = output.getvalue()
            self.assertEqual(code, 0)
            self.assertIn("Pregame Refresh Compact Summary", text)
            self.assertIn("- games checked: 2", text)
            self.assertIn("- lineups confirmed: 1", text)
            self.assertIn("- lineups missing: 1", text)
            self.assertIn("- weather rows loaded: 2", text)
            self.assertIn("- weather verified: 1", text)
            self.assertIn("- market rows loaded: 1", text)
            self.assertIn("- player prop rows loaded: 1", text)
            self.assertIn("- news rows loaded: 1", text)
            self.assertIn("CONDITIONAL=1", text)
            self.assertIn("KILLED=1", text)
            self.assertIn("- official_bet_eligible true count: 0", text)
            self.assertIn("WEATHER_SOURCE_UNAVAILABLE", text)

    def test_pregame_refresh_run_prints_compact_summary(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            _write_minimal_morning_packet(root / "slates" / "2026-05-15")
            missing = root / "missing.csv"
            output = io.StringIO()
            env = {
                "ECHOIQ_DATA_DIR": str(root / "slates"),
                "ECHOIQ_WEATHER_CSV": str(missing),
                "ECHOIQ_MARKET_CSV": str(missing),
                "ECHOIQ_PLAYER_PROPS_CSV": str(missing),
                "ECHOIQ_NEWS_CSV": str(missing),
            }

            with patch("sys.stdout", output), patch.dict("os.environ", env, clear=False):
                code = main(["--date", "2026-05-15", "--mode", "pregame-refresh", "--offline"])

            text = output.getvalue()
            self.assertEqual(code, 0)
            self.assertIn("Pregame Refresh Compact Summary", text)
            self.assertIn("- games checked: 1", text)
            self.assertIn("- official_bet_eligible true count: 0", text)
            self.assertIn("PLAYER_PROPS_UNAVAILABLE", text)

    def test_manual_preflight_cli_dispatch_writes_report_without_running_agent(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            missing = root / "missing.csv"
            output = io.StringIO()
            env = {
                "ECHOIQ_DATA_DIR": str(root / "slates"),
                "ECHOIQ_WEATHER_CSV": str(missing),
                "ECHOIQ_MARKET_CSV": str(missing),
                "ECHOIQ_PLAYER_PROPS_CSV": str(missing),
                "ECHOIQ_NEWS_CSV": str(missing),
            }

            with patch("sys.stdout", output), patch.dict("os.environ", env, clear=False):
                code = main(["--date", "2026-05-15", "--preflight-manual-inputs"])

            text = output.getvalue()
            report = root / "slates" / "2026-05-15" / "04_pregame_refresh" / "manual_input_preflight.csv"
            self.assertEqual(code, 0)
            self.assertIn("EchoIQ Manual Input Preflight", text)
            self.assertIn("PASS_WITH_WARNINGS", text)
            self.assertNotIn("EchoIQ Night Shift RUN", text)
            self.assertTrue(report.exists())
            with report.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(next(csv.reader(handle)), MANUAL_INPUT_PREFLIGHT_FIELDS)

    def test_manual_preflight_missing_files_is_non_fatal_warning(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = run_manual_input_preflight(
                slate_date="2026-05-15",
                repo_root=Path(tmp),
                output_path=Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh" / "manual_input_preflight.csv",
            )

            self.assertEqual(result.status, "PASS_WITH_WARNINGS")
            self.assertTrue(result.safe_to_run_pregame_refresh)
            self.assertEqual(sum(1 for row in result.file_results if row.status == "MISSING"), 4)
            self.assertTrue(result.output_written)

    def test_manual_preflight_valid_files_pass(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            manual_dir = root / "data" / "manual"
            _write_manual_weather_roof_csv(
                manual_dir / "weather_roof.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "away_team": "AAA",
                        "home_team": "BBB",
                        "venue": "Test Park",
                        "roof_status": "OPEN",
                        "temperature": "72",
                        "wind_speed": "8",
                        "wind_direction": "out to LF",
                        "humidity": "44",
                        "precipitation_risk": "low",
                        "weather_verified": "true",
                        "weather_risk": "LOW",
                        "source_name": "operator",
                        "source_url": "https://example.test/weather",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "notes": "verified manually",
                    }
                ],
            )
            _write_manual_market_snapshot_v42_csv(
                manual_dir / "market_snapshot.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "away_team": "AAA",
                        "home_team": "BBB",
                        "market_type": "game",
                        "market": "moneyline",
                        "player_name": "",
                        "team": "AAA",
                        "line": "",
                        "price": "+150",
                        "sportsbook": "testbook",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "source_name": "operator",
                        "source_url": "https://example.test/odds",
                        "notes": "verified manually",
                    }
                ],
            )
            _write_manual_player_props_csv(
                manual_dir / "player_props.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "player_name": "Test Hitter",
                        "player_id": "123",
                        "team": "AAA",
                        "opponent": "BBB",
                        "market": "home_run",
                        "line": "0.5",
                        "price": "+250",
                        "sportsbook": "testbook",
                        "available": "true",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "source_name": "operator",
                        "source_url": "https://example.test/props",
                        "notes": "verified manually",
                    }
                ],
            )
            _write_manual_news_scratch_csv(
                manual_dir / "news_scratch.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "player_name": "Test Hitter",
                        "player_id": "123",
                        "team": "AAA",
                        "news_type": "lineup",
                        "status": "starting",
                        "headline": "Test Hitter starts",
                        "summary": "Operator verified player starts.",
                        "lineup_impact": "no_impact",
                        "prop_impact": "no_impact",
                        "source_name": "operator",
                        "source_url": "https://example.test/news",
                        "published_at": "2026-05-15T18:00:00Z",
                        "notes": "verified manually",
                    }
                ],
            )

            result = run_manual_input_preflight(slate_date="2026-05-15", repo_root=root)

            self.assertEqual(result.status, "PASS")
            self.assertEqual(result.valid_rows, 4)
            self.assertEqual(result.invalid_rows, 0)
            self.assertEqual(result.warnings, 0)

    def test_manual_preflight_schema_error_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bad_path = root / "data" / "manual" / "market_snapshot.csv"
            _write_rows(bad_path, ["slate_date", "game_id"], [{"slate_date": "2026-05-15", "game_id": "1"}])

            result = run_manual_input_preflight(slate_date="2026-05-15", repo_root=root)
            market = next(row for row in result.file_results if row.input_type == "market")

            self.assertEqual(result.status, "FAIL")
            self.assertEqual(market.status, "SCHEMA_ERROR")
            self.assertFalse(market.safe_to_merge)
            self.assertGreater(market.fatal_errors, 0)

    def test_manual_preflight_counts_invalid_values_and_date_mismatch(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            manual_dir = root / "data" / "manual"
            _write_manual_market_snapshot_v42_csv(
                manual_dir / "market_snapshot.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "away_team": "AAA",
                        "home_team": "BBB",
                        "market_type": "game",
                        "market": "moneyline",
                        "player_name": "",
                        "team": "AAA",
                        "line": "",
                        "price": "-2",
                        "sportsbook": "testbook",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "source_name": "operator",
                        "source_url": "https://example.test/odds",
                        "notes": "bad price",
                    },
                    {
                        "slate_date": "2026-05-14",
                        "game_id": "1",
                        "away_team": "AAA",
                        "home_team": "BBB",
                        "market_type": "game",
                        "market": "moneyline",
                        "player_name": "",
                        "team": "AAA",
                        "line": "",
                        "price": "+150",
                        "sportsbook": "testbook",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "source_name": "operator",
                        "source_url": "https://example.test/odds",
                        "notes": "wrong date",
                    },
                ],
            )

            result = run_manual_input_preflight(slate_date="2026-05-15", repo_root=root)
            market = next(row for row in result.file_results if row.input_type == "market")

            self.assertEqual(result.status, "PASS_WITH_WARNINGS")
            self.assertEqual(market.valid_rows, 1)
            self.assertEqual(market.invalid_rows, 2)
            self.assertIn("invalid American odds", "; ".join(market.notes))
            self.assertIn("MANUAL_INPUT_DATE_MISMATCH", "; ".join(market.notes))

    def test_pregame_verification_gate_evaluator_keeps_official_bet_disabled(self):
        result = evaluate_game_gates(
            VerificationGateInput(
                game_status="Scheduled",
                starters_confirmed=True,
                lineups_confirmed=True,
                weather_verified=True,
                roof_status_verified=True,
                odds_verified=True,
                player_props_verified=True,
                news_checked=True,
                no_major_scratch_risk=True,
            )
        )

        self.assertTrue(result.gates["GAME_NOT_STARTED"])
        self.assertFalse(result.gates["OFFICIAL_BET_ELIGIBLE"])
        self.assertEqual(result.missing_gates, [])
        self.assertEqual(result.verification_completeness, "HIGH")

    def test_watchlist_survival_statuses(self):
        alive = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="WATCHLIST",
                game_not_started=True,
                starters_confirmed=True,
                lineups_confirmed=True,
                player_in_lineup=True,
                weather_verified=True,
                odds_available=True,
                player_prop_available=True,
                news_checked=True,
            )
        )
        conditional = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="WATCHLIST",
                game_not_started=True,
                starters_confirmed=True,
                lineups_confirmed=False,
                player_in_lineup=None,
                weather_verified=False,
                odds_available=False,
                player_prop_available=False,
                news_checked=False,
            )
        )
        needs_final = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="WATCHLIST",
                game_not_started=True,
                starters_confirmed=True,
                lineups_confirmed=True,
                player_in_lineup=True,
                weather_verified=False,
                odds_available=False,
                player_prop_available=False,
                news_checked=True,
            )
        )
        killed = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="WATCHLIST",
                game_not_started=False,
                starters_confirmed=True,
                lineups_confirmed=True,
                player_in_lineup=True,
            )
        )
        passed = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="PASS",
                game_not_started=True,
                starters_confirmed=True,
                lineups_confirmed=True,
                player_in_lineup=True,
            )
        )

        self.assertEqual(alive.current_status, "ALIVE")
        self.assertEqual(conditional.current_status, "CONDITIONAL")
        self.assertEqual(needs_final.current_status, "NEEDS_FINAL_CHECK")
        self.assertEqual(killed.current_status, "KILLED")
        self.assertEqual(passed.current_status, "PASS")

    def test_scratched_player_kills_player_prop_candidate(self):
        result = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="WATCHLIST",
                game_not_started=True,
                starters_confirmed=True,
                lineups_confirmed=True,
                player_in_lineup=True,
                scratch_flag=True,
            )
        )

        self.assertEqual(result.current_status, "KILLED")
        self.assertIn("scratch", result.kill_reason.lower())

    def test_starter_change_conditional_or_kills_matchup_thesis(self):
        conditional = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="WATCHLIST",
                game_not_started=True,
                starters_confirmed=True,
                lineups_confirmed=True,
                player_in_lineup=True,
                starter_changed=True,
                starter_thesis_dependent=False,
            )
        )
        killed = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="WATCHLIST",
                game_not_started=True,
                starters_confirmed=True,
                lineups_confirmed=True,
                player_in_lineup=True,
                starter_changed=True,
                starter_thesis_dependent=True,
            )
        )

        self.assertEqual(conditional.current_status, "CONDITIONAL")
        self.assertEqual(killed.current_status, "KILLED")
        self.assertIn("STARTER_CHANGE_DETECTED", killed.kill_reason)

    def test_missing_odds_does_not_create_official_bet(self):
        result = classify_watchlist_survival(
            WatchlistGateInput(
                market="HR",
                prior_label="WATCHLIST",
                game_not_started=True,
                starters_confirmed=True,
                lineups_confirmed=True,
                player_in_lineup=True,
                weather_verified=True,
                odds_available=False,
                player_prop_available=False,
                news_checked=True,
            )
        )

        self.assertEqual(result.current_status, "NEEDS_FINAL_CHECK")
        self.assertNotEqual(result.current_status, "BET")

    def test_pregame_refresh_offline_writes_header_only_unavailable_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")

            result = run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)

            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"
            weather = pregame_dir / "weather_refresh.csv"
            props = pregame_dir / "player_prop_availability.csv"
            matrix = pregame_dir / "verification_matrix.csv"
            survival = pregame_dir / "watchlist_survival.csv"
            change_log = pregame_dir / "change_log.json"

            self.assertFalse(result.dry_run)
            with weather.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(list(csv.reader(handle)), [WEATHER_REFRESH_FIELDS])
            with props.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(list(csv.reader(handle)), [PLAYER_PROP_AVAILABILITY_FIELDS])
            with matrix.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(next(csv.reader(handle)), VERIFICATION_MATRIX_FIELDS)
            with survival.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(next(csv.reader(handle)), WATCHLIST_SURVIVAL_FIELDS)
            payload = json.loads(change_log.read_text(encoding="utf-8"))
            self.assertEqual(payload["slate_date"], "2026-05-15")
            self.assertIn("changes_since_morning", payload)
            self.assertIn("watchlist_survival_summary", payload)
            with survival.open(newline="", encoding="utf-8") as handle:
                self.assertTrue(all(row["current_status"] != "BET" for row in csv.DictReader(handle)))
            self.assertIn("PLAYER_PROPS_UNAVAILABLE", (Path(tmp) / "slates" / "2026-05-15" / "logs" / "unresolved_gaps.md").read_text(encoding="utf-8"))
            self.assertIn("WEATHER_SOURCE_UNAVAILABLE", (Path(tmp) / "slates" / "2026-05-15" / "logs" / "unresolved_gaps.md").read_text(encoding="utf-8"))

    def test_manual_weather_csv_loads_and_verifies_weather_gate(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")
            manual_dir = Path(tmp) / "data" / "manual"
            _write_manual_weather_roof_csv(
                manual_dir / "weather_roof.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "away_team": "AAA",
                        "home_team": "BBB",
                        "venue": "Test Park",
                        "roof_status": "OPEN",
                        "temperature": "72",
                        "wind_speed": "8",
                        "wind_direction": "out to LF",
                        "humidity": "44",
                        "precipitation_risk": "low",
                        "weather_verified": "true",
                        "weather_risk": "LOW",
                        "source_name": "operator",
                        "source_url": "https://example.test/weather",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "notes": "verified manually",
                    }
                ],
            )

            run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"

            with (pregame_dir / "weather_refresh.csv").open(newline="", encoding="utf-8") as handle:
                weather = list(csv.DictReader(handle))
            with (pregame_dir / "verification_matrix.csv").open(newline="", encoding="utf-8") as handle:
                matrix = list(csv.DictReader(handle))

            self.assertEqual(weather[0]["source"], "manual_operator_input")
            self.assertEqual(weather[0]["weather_verified"], "true")
            self.assertEqual(matrix[0]["weather_verified"], "true")
            self.assertEqual(matrix[0]["roof_status_verified"], "true")
            self.assertEqual(matrix[0]["official_bet_eligible"], "false")

    def test_manual_market_csv_loads_and_calculates_implied_probability(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")
            manual_dir = Path(tmp) / "data" / "manual"
            _write_manual_market_snapshot_v42_csv(
                manual_dir / "market_snapshot.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "away_team": "AAA",
                        "home_team": "BBB",
                        "market_type": "game",
                        "market": "moneyline",
                        "player_name": "",
                        "team": "AAA",
                        "line": "",
                        "price": "+150",
                        "sportsbook": "testbook",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "source_name": "operator",
                        "source_url": "https://example.test/odds",
                        "notes": "verified manually",
                    }
                ],
            )

            run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"

            with (pregame_dir / "market_refresh.csv").open(newline="", encoding="utf-8") as handle:
                markets = list(csv.DictReader(handle))
            with (pregame_dir / "verification_matrix.csv").open(newline="", encoding="utf-8") as handle:
                matrix = list(csv.DictReader(handle))

            self.assertEqual(markets[0]["source"], "manual_operator_input")
            self.assertEqual(markets[0]["market"], "moneyline")
            self.assertEqual(markets[0]["implied_probability"], "0.4")
            self.assertEqual(markets[0]["market_status"], "available")
            self.assertEqual(matrix[0]["odds_verified"], "true")

    def test_manual_player_props_update_availability_and_watchlist_price(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")
            manual_dir = Path(tmp) / "data" / "manual"
            _write_manual_player_props_csv(
                manual_dir / "player_props.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "player_name": "Test Hitter",
                        "player_id": "123",
                        "team": "AAA",
                        "opponent": "BBB",
                        "market": "home_run",
                        "line": "0.5",
                        "price": "+250",
                        "sportsbook": "testbook",
                        "available": "true",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "source_name": "operator",
                        "source_url": "https://example.test/props",
                        "notes": "verified manually",
                    }
                ],
            )

            run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"

            with (pregame_dir / "player_prop_availability.csv").open(newline="", encoding="utf-8") as handle:
                props = list(csv.DictReader(handle))
            with (pregame_dir / "watchlist_survival.csv").open(newline="", encoding="utf-8") as handle:
                survival = list(csv.DictReader(handle))

            self.assertEqual(props[0]["source"], "manual_operator_input")
            self.assertEqual(props[0]["market"], "home_run")
            self.assertEqual(props[0]["available"], "true")
            self.assertEqual(survival[0]["odds_available"], "true")
            self.assertEqual(survival[0]["best_price"], "250")
            self.assertEqual(survival[0]["implied_probability"], "0.285714")

    def test_manual_news_out_kills_matching_player_candidate(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")
            manual_dir = Path(tmp) / "data" / "manual"
            _write_manual_news_scratch_csv(
                manual_dir / "news_scratch.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "player_name": "Test Hitter",
                        "player_id": "123",
                        "team": "AAA",
                        "news_type": "scratch",
                        "status": "out",
                        "headline": "Test Hitter scratched",
                        "summary": "Operator verified player is out.",
                        "lineup_impact": "kills_candidate",
                        "prop_impact": "kills_candidate",
                        "source_name": "operator",
                        "source_url": "https://example.test/news",
                        "published_at": "2026-05-15T18:00:00Z",
                        "notes": "verified manually",
                    }
                ],
            )

            run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"

            with (pregame_dir / "news_refresh.csv").open(newline="", encoding="utf-8") as handle:
                news = list(csv.DictReader(handle))
            with (pregame_dir / "watchlist_survival.csv").open(newline="", encoding="utf-8") as handle:
                survival = list(csv.DictReader(handle))

            self.assertEqual(news[0]["source"], "manual_operator_input")
            self.assertEqual(news[0]["lineup_impact"], "RISK")
            self.assertEqual(survival[0]["current_status"], "KILLED")
            self.assertIn("Major scratch", survival[0]["kill_reason"])

    def test_invalid_manual_rows_are_logged_not_fatal(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")
            manual_dir = Path(tmp) / "data" / "manual"
            _write_manual_market_snapshot_v42_csv(
                manual_dir / "market_snapshot.csv",
                [
                    {
                        "slate_date": "2026-05-15",
                        "game_id": "1",
                        "away_team": "AAA",
                        "home_team": "BBB",
                        "market_type": "game",
                        "market": "moneyline",
                        "player_name": "",
                        "team": "AAA",
                        "line": "",
                        "price": "-2",
                        "sportsbook": "testbook",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "source_name": "operator",
                        "source_url": "",
                        "notes": "bad price",
                    },
                    {
                        "slate_date": "2026-05-14",
                        "game_id": "1",
                        "away_team": "AAA",
                        "home_team": "BBB",
                        "market_type": "game",
                        "market": "moneyline",
                        "player_name": "",
                        "team": "AAA",
                        "line": "",
                        "price": "+150",
                        "sportsbook": "testbook",
                        "last_updated": "2026-05-15T18:00:00Z",
                        "source_name": "operator",
                        "source_url": "",
                        "notes": "wrong date",
                    },
                ],
            )

            result = run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"

            with (pregame_dir / "manual_input_validation.csv").open(newline="", encoding="utf-8") as handle:
                validation = list(csv.DictReader(handle))
            with (pregame_dir / "market_refresh.csv").open(newline="", encoding="utf-8") as handle:
                markets = list(csv.DictReader(handle))

            self.assertFalse(result.dry_run)
            self.assertTrue(any(row["issue"].startswith("invalid American odds") for row in validation))
            self.assertTrue(any("does not match 2026-05-15" in row["issue"] for row in validation))
            self.assertEqual(markets[0]["price"], "")
            self.assertEqual(markets[0]["implied_probability"], "")
            self.assertIn("MANUAL_INPUT_INVALID_ROWS", (Path(tmp) / "slates" / "2026-05-15" / "logs" / "unresolved_gaps.md").read_text(encoding="utf-8"))

    def test_missing_manual_files_log_cleanly(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")

            run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"
            source_log = (Path(tmp) / "slates" / "2026-05-15" / "logs" / "source_log.md").read_text(encoding="utf-8")

            with (pregame_dir / "manual_input_validation.csv").open(newline="", encoding="utf-8") as handle:
                rows = list(csv.DictReader(handle))
            with (pregame_dir / "manual_input_validation.csv").open(newline="", encoding="utf-8") as handle:
                header = next(csv.reader(handle))

            self.assertEqual(header, MANUAL_INPUT_VALIDATION_FIELDS)
            self.assertTrue(any(row["issue"] == "manual input file missing" for row in rows))
            self.assertIn("MANUAL_INPUT_MISSING", source_log)
            self.assertIn("manual_operator_input", source_log)

    def test_header_only_manual_files_are_not_invalid_rows(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")
            manual_dir = Path(tmp) / "data" / "manual"
            _write_manual_market_snapshot_v42_csv(manual_dir / "market_snapshot.csv", [])
            _write_manual_player_props_csv(manual_dir / "player_props.csv", [])
            _write_manual_news_scratch_csv(manual_dir / "news_scratch.csv", [])

            run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"
            source_log = (Path(tmp) / "slates" / "2026-05-15" / "logs" / "source_log.md").read_text(encoding="utf-8")
            gaps = (Path(tmp) / "slates" / "2026-05-15" / "logs" / "unresolved_gaps.md").read_text(encoding="utf-8")

            with (pregame_dir / "manual_input_validation.csv").open(newline="", encoding="utf-8") as handle:
                rows = list(csv.DictReader(handle))

            header_only_rows = [row for row in rows if row["issue"] == "manual input file header-only"]
            self.assertEqual(len(header_only_rows), 3)
            self.assertTrue(all(row["severity"] == "INFO" for row in header_only_rows))
            self.assertIn("MANUAL_INPUT_HEADER_ONLY", source_log)
            self.assertNotIn("MANUAL_INPUT_INVALID_ROWS", gaps)

    def test_pregame_refresh_handles_missing_morning_artifacts(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))

            result = run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            change_log = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh" / "change_log.json"
            gaps = Path(tmp) / "slates" / "2026-05-15" / "logs" / "unresolved_gaps.md"

            self.assertFalse(result.dry_run)
            payload = json.loads(change_log.read_text(encoding="utf-8"))
            self.assertTrue(any(gap["classification"] == "MORNING_ARTIFACTS_MISSING" for gap in payload["unresolved_gaps"]))
            self.assertIn("MORNING_ARTIFACTS_MISSING", gaps.read_text(encoding="utf-8"))

    def test_pregame_outputs_keep_official_bet_eligible_false_and_no_disallowed_labels(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = _config(Path(tmp))
            _write_minimal_morning_packet(config.slates_dir / "2026-05-15")

            run_daily_agent(date_token="2026-05-15", mode="pregame-refresh", offline=True, config=config)
            pregame_dir = Path(tmp) / "slates" / "2026-05-15" / "04_pregame_refresh"

            for csv_name in ["verification_matrix.csv", "watchlist_survival.csv"]:
                with (pregame_dir / csv_name).open(newline="", encoding="utf-8") as handle:
                    for row in csv.DictReader(handle):
                        self.assertEqual(row["official_bet_eligible"], "false")
                        self.assertNotIn(row.get("current_status", ""), {"BET", "LOCK", "GUARANTEED", "MAX", "FREE MONEY"})

    def test_mlb_live_feed_lineup_parsing_with_mock_data(self):
        rows = _lineup_player_rows_from_game_feed(
            slate_date="2026-05-15",
            game={"game_id": "1", "away_team": "AAA", "home_team": "BBB"},
            payload=_mock_live_feed_payload(),
            retrieved_at="2026-05-15T18:00:00",
        )

        self.assertEqual(len(rows), 18)
        self.assertEqual(rows[0]["player_name"], "Test Hitter")
        self.assertEqual(rows[0]["player_id"], "123")
        self.assertEqual(rows[0]["lineup_slot"], "1")
        self.assertEqual(rows[0]["position"], "DH")
        self.assertTrue(rows[0]["confirmed_lineup_available"])

    def test_confirmed_lineup_updates_player_in_lineup_gate(self):
        lineup_rows = _confirmed_lineup_rows(include_test_hitter=True)
        matrix = _verification_matrix_rows(
            slate_date="2026-05-15",
            games=[_game_payload()],
            lineup_rows=lineup_rows,
            starter_rows=_starter_rows(),
            weather_rows=[],
            market_rows=[],
            prop_rows=[],
            news_rows=[],
            retrieved_at="2026-05-15T18:00:00",
        )
        survival = _watchlist_survival_rows(
            slate_date="2026-05-15",
            watchlist_rows=[_watchlist_row_payload()],
            verification_rows=matrix,
            lineup_rows=lineup_rows,
            starter_rows=_starter_rows(),
            weather_rows=[],
            market_rows=[],
            news_rows=[],
            retrieved_at="2026-05-15T18:00:00",
        )

        self.assertTrue(matrix[0]["lineups_confirmed"])
        self.assertEqual(survival[0]["player_in_lineup"], True)
        self.assertNotIn("PLAYER_IN_LINEUP", survival[0]["missing_gates"])

    def test_missing_lineup_keeps_candidate_conditional(self):
        matrix = _verification_matrix_rows(
            slate_date="2026-05-15",
            games=[_game_payload()],
            lineup_rows=[],
            starter_rows=_starter_rows(),
            weather_rows=[],
            market_rows=[],
            prop_rows=[],
            news_rows=[],
            retrieved_at="2026-05-15T18:00:00",
        )
        survival = _watchlist_survival_rows(
            slate_date="2026-05-15",
            watchlist_rows=[_watchlist_row_payload()],
            verification_rows=matrix,
            lineup_rows=[],
            starter_rows=_starter_rows(),
            weather_rows=[],
            market_rows=[],
            news_rows=[],
            retrieved_at="2026-05-15T18:00:00",
        )

        self.assertEqual(survival[0]["current_status"], "CONDITIONAL")
        self.assertIn("LINEUPS_CONFIRMED", survival[0]["missing_gates"])

    def test_confirmed_absence_kills_player_prop_candidate(self):
        lineup_rows = _confirmed_lineup_rows(include_test_hitter=False)
        matrix = _verification_matrix_rows(
            slate_date="2026-05-15",
            games=[_game_payload()],
            lineup_rows=lineup_rows,
            starter_rows=_starter_rows(),
            weather_rows=[],
            market_rows=[],
            prop_rows=[],
            news_rows=[],
            retrieved_at="2026-05-15T18:00:00",
        )
        survival = _watchlist_survival_rows(
            slate_date="2026-05-15",
            watchlist_rows=[_watchlist_row_payload()],
            verification_rows=matrix,
            lineup_rows=lineup_rows,
            starter_rows=_starter_rows(),
            weather_rows=[],
            market_rows=[],
            news_rows=[],
            retrieved_at="2026-05-15T18:00:00",
        )

        self.assertEqual(survival[0]["current_status"], "KILLED")
        self.assertEqual(survival[0]["kill_reason"], "PLAYER_IN_LINEUP failed.")

    def test_odds_event_mapping_populates_market_refresh_with_mock_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            csv_path = Path(tmp) / "market_snapshot.csv"
            _write_manual_market_csv(
                csv_path,
                [
                    {
                        "date": "2026-05-15",
                        "game_key": "AAA@BBB",
                        "provider": "manual",
                        "sportsbook": "testbook",
                        "market_type": "moneyline",
                        "participant": "AAA",
                        "team": "AAA",
                        "side": "away",
                        "price": "150",
                        "timestamp": "2999-01-01T00:00:00+00:00",
                    }
                ],
            )
            rows = _fetch_mock_manual_markets(csv_path)
            market_rows = _market_refresh_rows(rows)

        self.assertEqual(market_rows[0]["game_id"], "1")
        self.assertEqual(market_rows[0]["market"], "moneyline")
        self.assertEqual(market_rows[0]["implied_probability"], 0.4)
        self.assertEqual(market_rows[0]["market_status"], "available")

    def test_player_prop_availability_populates_from_mock_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            csv_path = Path(tmp) / "market_snapshot.csv"
            _write_manual_market_csv(
                csv_path,
                [
                    {
                        "date": "2026-05-15",
                        "game_key": "AAA@BBB",
                        "provider": "manual",
                        "sportsbook": "testbook",
                        "market_type": "hr",
                        "participant": "Test Hitter",
                        "player_name": "Test Hitter",
                        "team": "AAA",
                        "side": "yes",
                        "price": "250",
                        "timestamp": "2999-01-01T00:00:00+00:00",
                    }
                ],
            )
            market_snapshot = _fetch_mock_manual_markets(csv_path)
            tracker = SourceTracker(timezone="America/Chicago")
            props = _player_prop_rows(
                market_snapshot,
                tracker,
                offline=False,
                lineup_rows=_confirmed_lineup_rows(include_test_hitter=True),
            )

        self.assertEqual(props[0]["player_name"], "Test Hitter")
        self.assertEqual(props[0]["player_id"], "123")
        self.assertEqual(props[0]["market"], "player_home_run")
        self.assertTrue(props[0]["available"])

    def test_id_mapping_gaps_are_logged_for_unmapped_market_rows(self):
        tracker = SourceTracker(timezone="America/Chicago")
        _record_market_mapping_gaps(
            [
                {
                    "game_id": "ZZZ@BBB",
                    "market_type": "player_home_run",
                    "market": "player_home_run",
                    "player_or_team": "Unknown Hitter",
                }
            ],
            tracker,
        )

        classifications = [gap.missing_source for gap in tracker.gaps]
        self.assertIn("EVENT_ID_MAPPING_MISSING", classifications)
        self.assertIn("PLAYER_PROP_EVENT_MAPPING_MISSING", classifications)

    def test_diagnose_markets_command_works_without_key(self):
        output = io.StringIO()
        with patch("sys.stdout", output), patch.dict("os.environ", {}, clear=True):
            code = main(["--diagnose-markets", "--slate-date", "2026-05-15"])

        self.assertEqual(code, 0)
        self.assertIn("ODDS_KEY_MISSING", output.getvalue())
        self.assertIn("SPORTSRADAR_KEY_MISSING", output.getvalue())

    def test_missing_sportsradar_key_degrades_cleanly(self):
        tracker = SourceTracker(timezone="America/Chicago")
        data_sources = NightShiftDataSources(
            tracker=tracker,
            mlb_client=NightShiftMLBStatsClient(),
            offline=False,
        )

        result = fetch_sportsradar_enrichment(
            slate_date="2026-05-15",
            slate_games=[],
            data_sources=data_sources,
            enabled=True,
            api_key_present=False,
            base_url="https://api.sportradar.com/mlb",
            access_level="trial",
        )

        self.assertEqual(result.metadata_status, "SPORTSRADAR_KEY_MISSING")
        self.assertEqual(result.injury_news, [])
        self.assertIn("SPORTSRADAR_KEY_MISSING", tracker.events[0].notes)
        self.assertEqual(tracker.gaps[0].missing_source, "SPORTSRADAR_KEY_MISSING")

    def test_american_odds_implied_probability_math(self):
        self.assertAlmostEqual(implied_probability_from_american(-120), 0.545455)
        self.assertAlmostEqual(implied_probability_from_american(150), 0.4)
        self.assertIsNone(implied_probability_from_american(-2))
        self.assertIsNone(implied_probability_from_american(0))

    def test_market_and_news_schema_fields_are_present(self):
        for field in [
            "market_type",
            "market",
            "price",
            "implied_probability",
            "sportsbook",
            "retrieved_at",
        ]:
            self.assertIn(field, MARKET_SNAPSHOT_FIELDS)
        for field in [
            "player_name",
            "status",
            "injury_or_news_type",
            "headline",
            "confidence",
        ]:
            self.assertIn(field, INJURY_NEWS_FIELDS)

    def test_watchlist_schema_includes_v3_market_fields_and_no_official_bet(self):
        for field in [
            "odds_available",
            "best_price",
            "implied_probability",
            "fair_probability",
            "edge",
            "official_bet_eligible",
            "verification_gates_missing",
        ]:
            self.assertIn(field, WATCHLIST_FIELDS)
        row = _watchlist_entry()
        self.assertFalse(row.official_bet_eligible)
        self.assertNotIn(row.label, {"BET", "LOCK", "GUARANTEED", "MAX", "FREE MONEY"})

    def test_mock_market_data_enriches_watchlist_rows_without_bet_label(self):
        game = _slate_game()
        note = MatchupNote(game_id="1", game="AAA@BBB")
        watchlists = {"game_line": [_watchlist_entry(market="Game line", player_name="", team="AAA", opponent="BBB")]}
        market_rows = [
            MarketSnapshotRow(
                slate_date="2026-05-15",
                game_id="1",
                away_team="AAA",
                home_team="BBB",
                market_type="moneyline",
                market="moneyline",
                player_name="",
                team="AAA",
                line=None,
                price=150,
                implied_probability=0.4,
                sportsbook="testbook",
                status="available",
                source="mock",
                last_updated="2026-05-15T10:00:00",
                retrieved_at="2026-05-15T10:01:00",
            )
        ]

        apply_v3_market_context(
            slate_games=[game],
            matchup_notes=[note],
            watchlists=watchlists,
            market_rows=market_rows,
            injury_news=[],
        )

        row = watchlists["game_line"][0]
        self.assertTrue(row.odds_available)
        self.assertEqual(row.best_price, 150)
        self.assertEqual(row.best_price_source, "testbook")
        self.assertFalse(row.official_bet_eligible)
        self.assertIn("WEATHER_NOT_VERIFIED", row.verification_gates_missing)

    def test_mock_injury_news_enriches_matchup_notes(self):
        game = _slate_game()
        note = MatchupNote(game_id="1", game="AAA@BBB")
        news = [
            InjuryNewsRow(
                slate_date="2026-05-15",
                player_name="Test Hitter",
                player_id="123",
                team="AAA",
                status="D10",
                injury_or_news_type="hamstring",
                headline="Injury status: Test Hitter",
                summary="Mock injury row.",
                source="mock",
                published_at="2026-05-15T09:00:00",
                retrieved_at="2026-05-15T10:00:00",
                confidence="B",
            )
        ]

        apply_v3_market_context(
            slate_games=[game],
            matchup_notes=[note],
            watchlists={"hr": [_watchlist_entry(player_name="Test Hitter", team="AAA", opponent="BBB")]},
            market_rows=[],
            injury_news=news,
        )

        self.assertEqual(note.news_context["news_data_status"], "NEWS_AVAILABLE")
        self.assertIn("Test Hitter", note.news_context["player_news"][0])

    def test_watchlist_entry_rejects_disallowed_mvp_labels(self):
        with self.assertRaises(ValueError):
            WatchlistEntry(
                slate_date="2026-05-15",
                game_id="1",
                player_name="Player",
                team="AAA",
                opponent="BBB",
                market="HR",
                signal_type="test",
                confidence="LOW",
                label="BET",
                reason="test",
                supporting_factors="test",
                risk_flags="test",
                data_gaps="test",
                source_summary="test",
                retrieved_at="2026-05-15T00:00:00",
            )

    def test_statcast_signal_tags_from_mock_batted_balls(self):
        rows = [
            {
                "batter": 123,
                "pitcher": 999,
                "type": "X",
                "events": "field_out",
                "launch_speed": 106.2,
                "launch_angle": 24,
                "launch_speed_angle": 6,
                "estimated_ba_using_speedangle": 0.720,
                "estimated_woba_using_speedangle": 0.910,
                "estimated_slg_using_speedangle": 1.450,
                "description": "hit_into_play",
                "pitch_type": "FF",
            },
            {
                "batter": 123,
                "pitcher": 999,
                "description": "swinging_strike",
                "pitch_type": "SL",
            },
        ]
        summary = build_daily_statcast_summary(rows)
        player = _player(player_id="123", hits=0, total_bases=0, home_runs=0, at_bats=4)
        pitcher = _pitcher(pitcher_id="999", earned_runs=1)

        enrich_player_performance([player], summary)
        enrich_pitcher_usage([pitcher], summary)

        self.assertIn("LOUD_CONTACT_BAD_BOX", player.statcast_signal_tags)
        self.assertIn("HR_QUALITY_SIGNAL", player.statcast_signal_tags)
        self.assertEqual(player.hard_hit_count, 1)
        self.assertEqual(player.barrel_count, 1)
        self.assertIn("LOUD_CONTACT_ALLOWED", pitcher.statcast_signal_tags)
        self.assertEqual(pitcher.hard_hit_allowed, 1)
        self.assertIn("FF", pitcher.pitch_mix_note)

    def test_statcast_empty_result_classification(self):
        client = NightShiftStatcastClient()
        client.client = _FakeStatcastFetchClient(rows=[], cache_used=False)

        with patch("echoiq_v3.daily_agent.statcast_client._pybaseball_info", return_value=(True, "test", "")):
            _, diagnostics = client.fetch_daily_rows_with_diagnostics(
                date_str="2026-05-14",
                timezone="America/Chicago",
            )

        self.assertEqual(diagnostics.status_classification, "STATCAST_EMPTY_FOR_DATE")
        self.assertEqual(diagnostics.raw_row_count, 0)
        self.assertFalse(diagnostics.cache_was_used)

    def test_statcast_exception_classification(self):
        client = NightShiftStatcastClient()
        client.client = _FakeStatcastFetchClient(exc=RuntimeError("provider down"))

        with patch("echoiq_v3.daily_agent.statcast_client._pybaseball_info", return_value=(True, "test", "")):
            _, diagnostics = client.fetch_daily_rows_with_diagnostics(
                date_str="2026-05-14",
                timezone="America/Chicago",
            )

        self.assertEqual(diagnostics.status_classification, "STATCAST_QUERY_EXCEPTION")
        self.assertIn("provider down", diagnostics.error_summary)

    def test_statcast_cache_empty_classification(self):
        client = NightShiftStatcastClient()
        client.client = _FakeStatcastFetchClient(rows=[], cache_used=True)

        with patch("echoiq_v3.daily_agent.statcast_client._pybaseball_info", return_value=(True, "test", "")):
            _, diagnostics = client.fetch_daily_rows_with_diagnostics(
                date_str="2026-05-14",
                timezone="America/Chicago",
            )

        self.assertEqual(diagnostics.status_classification, "STATCAST_CACHE_EMPTY_OR_STALE")
        self.assertTrue(diagnostics.cache_was_used)
        self.assertIn("--force-refresh", diagnostics.recommended_next_action)

    def test_statcast_enrichment_handles_unavailable_data(self):
        summary = build_daily_statcast_summary([])
        player = _player(player_id="123")
        pitcher = _pitcher(pitcher_id="999")

        enrich_player_performance([player], summary)
        enrich_pitcher_usage([pitcher], summary)

        self.assertEqual(player.statcast_data_status, "unavailable")
        self.assertEqual(player.statcast_signal_tags, "INSUFFICIENT_STATCAST_DATA")
        self.assertEqual(pitcher.statcast_data_status, "unavailable")
        self.assertEqual(pitcher.statcast_signal_tags, "INSUFFICIENT_STATCAST_DATA")

    def test_statcast_weak_contact_good_box_tag(self):
        rows = [
            {
                "batter": 321,
                "pitcher": 999,
                "type": "X",
                "events": "single",
                "launch_speed": 78.0,
                "launch_angle": 4,
                "launch_speed_angle": 2,
            },
            {
                "batter": 321,
                "pitcher": 999,
                "type": "X",
                "events": "single",
                "launch_speed": 82.0,
                "launch_angle": 6,
                "launch_speed_angle": 2,
            },
        ]
        summary = build_daily_statcast_summary(rows)
        player = _player(player_id="321", hits=2, total_bases=2, at_bats=4)

        enrich_player_performance([player], summary)

        self.assertIn("WEAK_CONTACT_GOOD_BOX", player.statcast_signal_tags)
        self.assertIn("LOW_QUALITY_CONTACT", player.statcast_signal_tags)

    def test_statcast_pitcher_suppressed_and_barrel_tags(self):
        suppressed_summary = build_daily_statcast_summary(
            [
                {
                    "batter": 1,
                    "pitcher": 777,
                    "type": "X",
                    "events": "field_out",
                    "launch_speed": 82.0,
                    "launch_angle": 2,
                    "launch_speed_angle": 2,
                    "description": "hit_into_play",
                    "pitch_type": "SI",
                }
            ]
        )
        suppressed = _pitcher(pitcher_id="777", earned_runs=0)
        enrich_pitcher_usage([suppressed], suppressed_summary)

        risk_summary = build_daily_statcast_summary(
            [
                {
                    "batter": 2,
                    "pitcher": 888,
                    "type": "X",
                    "events": "home_run",
                    "launch_speed": 107.0,
                    "launch_angle": 27,
                    "launch_speed_angle": 6,
                    "description": "hit_into_play",
                    "pitch_type": "FF",
                }
            ]
        )
        risk = _pitcher(pitcher_id="888", earned_runs=1)
        enrich_pitcher_usage([risk], risk_summary)

        self.assertIn("SUPPRESSED_CONTACT", suppressed.statcast_signal_tags)
        self.assertIn("LOUD_CONTACT_ALLOWED", risk.statcast_signal_tags)
        self.assertIn("BARREL_RISK", risk.statcast_signal_tags)

    def test_statcast_player_id_match_diagnostics(self):
        summary = build_daily_statcast_summary(
            [
                {
                    "batter": 123,
                    "pitcher": 999,
                    "type": "X",
                    "events": "field_out",
                    "launch_speed": 101,
                    "launch_angle": 18,
                    "launch_speed_angle": 6,
                }
            ]
        )

        diagnostics = build_match_diagnostics(
            [_player(player_id="123"), _player(player_id="456")],
            [_pitcher(pitcher_id="999"), _pitcher(pitcher_id="111")],
            summary,
        )

        self.assertEqual(diagnostics.status_classification, "PARTIAL_PLAYER_ID_MATCH")
        self.assertEqual(diagnostics.matched_batter_ids, 1)
        self.assertEqual(diagnostics.matched_pitcher_ids, 1)
        self.assertEqual(diagnostics.unmatched_batter_rows, 1)

    def test_statcast_schema_fields_are_present(self):
        for field in [
            "exit_velocity_avg",
            "launch_angle_avg",
            "hard_hit_rate",
            "barrel_rate",
            "xwoba",
            "statcast_signal_tags",
            "statcast_signal_note",
            "statcast_data_status",
        ]:
            self.assertIn(field, PLAYER_PERFORMANCE_FIELDS)
        for field in [
            "avg_exit_velocity_allowed",
            "hard_hit_allowed",
            "xwoba_allowed",
            "whiff_rate",
            "pitch_mix_note",
            "contact_quality_allowed_note",
            "statcast_signal_tags",
            "statcast_data_status",
        ]:
            self.assertIn(field, PITCHER_USAGE_FIELDS)

    def test_postgame_learning_dry_run_prints_planned_outputs(self):
        output = io.StringIO()
        with patch("sys.stdout", output):
            code = main(["--date", "2026-05-15", "--mode", "postgame-learning", "--dry-run"])

        text = output.getvalue()
        self.assertEqual(code, 0)
        self.assertIn("Scope: postgame-learning", text)
        self.assertIn("05_postgame_learning", text)
        self.assertIn("prediction_grades.csv", text)
        self.assertIn("Postgame Learning Summary", text)

    def test_postgame_learning_grades_hr_tb_hit_and_game_lean(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slate_dir = root / "slates" / "2026-05-15"
            _write_postgame_learning_fixture(slate_dir)

            result = run_daily_agent(date_token="2026-05-15", mode="postgame-learning", offline=True, config=_config(root))

            self.assertFalse(result.dry_run)
            self.assertEqual(result.only, "postgame-learning")
            self.assertTrue((slate_dir / "05_postgame_learning" / "prediction_grades.csv").exists())
            self.assertTrue((slate_dir / "05_postgame_learning" / "game_grades.csv").exists())
            self.assertTrue((slate_dir / "05_postgame_learning" / "hidden_winners.csv").exists())
            self.assertTrue((slate_dir / "05_postgame_learning" / "signal_performance.json").exists())
            self.assertTrue((slate_dir / "05_postgame_learning" / "postgame_learning_report.md").exists())
            self.assertTrue((slate_dir / "05_postgame_learning" / "next_slate_prompt_rules.md").exists())

            rows = _read_rows(slate_dir / "05_postgame_learning" / "prediction_grades.csv")
            by_id = {row["prediction_id"]: row for row in rows}
            self.assertEqual(by_id["hr_watchlist:1"]["process_label"], "RIGHT_PLAYER_WRONG_PROP_SUBTYPE")
            self.assertEqual(by_id["total_bases_watchlist:1"]["result_label"], "HIT")
            self.assertEqual(by_id["hits_watchlist:1"]["result_label"], "STRONG_HIT")
            self.assertEqual(by_id["game_line_leans:1"]["game_lean_result"], "HIT")

    def test_postgame_learning_missing_artifacts_degrade_and_write_headers(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            result = run_daily_agent(date_token="2026-05-15", mode="postgame-learning", offline=True, config=_config(root))
            output_dir = root / "slates" / "2026-05-15" / "05_postgame_learning"

            self.assertTrue(result.warnings)
            with (output_dir / "prediction_grades.csv").open(newline="", encoding="utf-8") as handle:
                self.assertEqual(next(csv.reader(handle)), PREDICTION_GRADES_FIELDS)
            with (output_dir / "hidden_winners.csv").open(newline="", encoding="utf-8") as handle:
                self.assertEqual(next(csv.reader(handle)), HIDDEN_WINNERS_FIELDS)
            self.assertIn("FINAL_GAME_RESULTS_MISSING", (output_dir / "postgame_learning_report.md").read_text(encoding="utf-8"))

    def test_postgame_learning_detects_hidden_and_right_team_wrong_player(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slate_dir = root / "slates" / "2026-05-15"
            _write_postgame_learning_fixture(slate_dir, teammate_hr=True)

            run_daily_agent(date_token="2026-05-15", mode="postgame-learning", offline=True, config=_config(root))

            grades = _read_rows(slate_dir / "05_postgame_learning" / "prediction_grades.csv")
            self.assertTrue(any(row["process_label"] == "RIGHT_TEAM_WRONG_PLAYER" for row in grades))
            hidden = _read_rows(slate_dir / "05_postgame_learning" / "hidden_winners.csv")
            self.assertTrue(any(row["player_name"] == "Power Teammate" for row in hidden))
            self.assertIn("hidden_winner_lineup_band", hidden[0])
            self.assertIn("hidden_winner_result_type", hidden[0])
            self.assertIn("same_team_environment_validated", hidden[0])
            self.assertIn("future_search_rule", hidden[0])

    def test_postgame_learning_right_team_wrong_player_requires_contextual_teammate(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slate_dir = root / "slates" / "2026-05-15"
            _write_postgame_learning_fixture(slate_dir, teammate_hr=True, team_context_hr=False)

            run_daily_agent(date_token="2026-05-15", mode="postgame-learning", offline=True, config=_config(root))

            grades = _read_rows(slate_dir / "05_postgame_learning" / "prediction_grades.csv")
            hr_row = next(row for row in grades if row["prediction_id"] == "hr_watchlist:1")
            self.assertNotEqual(hr_row["process_label"], "RIGHT_TEAM_WRONG_PLAYER")
            self.assertIn(hr_row["process_label"], {"CORRECT_PROCESS_BAD_RESULT", "BAD_PROCESS_BAD_RESULT"})

    def test_postgame_learning_mixed_process_game_lean_and_split_records(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slate_dir = root / "slates" / "2026-05-15"
            _write_postgame_learning_fixture(slate_dir, teammate_hr=True)
            _write_final_echoiq_prediction_inputs(slate_dir)

            run_daily_agent(date_token="2026-05-15", mode="postgame-learning", offline=True, config=_config(root))

            grades = _read_rows(slate_dir / "05_postgame_learning" / "prediction_grades.csv")
            mixed = next(row for row in grades if row["prediction_id"] == "may15_final_chat_game_lean_bbb_001")
            self.assertEqual(mixed["process_label"], "MIXED_PROCESS_BAD_RESULT")
            self.assertEqual(mixed["miss_reason"], "CONTACT_CLUSTER_UNDERWEIGHTED")

            signal_perf = json.loads((slate_dir / "05_postgame_learning" / "signal_performance.json").read_text(encoding="utf-8"))
            summary = signal_perf["summary"]
            self.assertEqual(summary["final_chat_board_game_lean_record"], "1-1")
            self.assertEqual(summary["repo_watchlist_game_lean_record"], "1-0")
            self.assertEqual(summary["all_game_lean_rows_record"], "2-1")
            self.assertEqual(summary["lottery_discussion_game_lean_record"], "0-0")
            self.assertEqual(signal_perf["game_lean_records"]["final_chat_board_game_lean_record"]["mixed_process"], 1)

            report = (slate_dir / "05_postgame_learning" / "postgame_learning_report.md").read_text(encoding="utf-8")
            self.assertIn("Where EchoIQ Was Right About The Game But Wrong About The Bat", report)
            self.assertIn("Where EchoIQ Process Was Actually Flawed", report)
            right_section = _report_section(report, "## Where EchoIQ Was Right About The Game But Wrong About The Bat")
            self.assertIn("| Game/team environment | Missed/overweighted target(s) | Actual supporting-cast winner(s) |", right_section)
            self.assertLessEqual(right_section.count("RIGHT_TEAM_WRONG_PLAYER"), 10)
            self.assertIn("Power Teammate", right_section)
            flawed_section = _report_section(report, "## Where EchoIQ Process Was Actually Flawed")
            self.assertIn("| Game/prediction | Process flaw label | What was partly right | What was wrong | Rule change |", flawed_section)
            self.assertIn("CONTACT_CLUSTER_UNDERWEIGHTED", flawed_section)

    def test_postgame_learning_ingests_final_echoiq_predictions_and_dedupes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slate_dir = root / "slates" / "2026-05-15"
            _write_postgame_learning_fixture(slate_dir)
            _write_final_echoiq_prediction_inputs(slate_dir, duplicate=True)

            result = run_daily_agent(date_token="2026-05-15", mode="postgame-learning", offline=True, config=_config(root))

            grades = _read_rows(slate_dir / "05_postgame_learning" / "prediction_grades.csv")
            by_id = {row["prediction_id"]: row for row in grades}
            self.assertIn("may15_final_chat_hr_test_hitter_001", by_id)
            self.assertEqual(by_id["may15_final_chat_hr_test_hitter_001"]["prediction_source"], "final_echoiq_predictions")
            self.assertEqual(by_id["may15_final_chat_hr_test_hitter_001"]["prediction_phase"], "final_chat_board")
            self.assertEqual(by_id["may15_final_chat_hr_test_hitter_001"]["prediction_type"], "HR")
            self.assertEqual(sum(1 for row in grades if row["prediction_id"] == "may15_final_chat_hr_test_hitter_001"), 1)
            self.assertTrue(any("DUPLICATE_PREDICTION_ID_SKIPPED" in warning for warning in result.warnings))

            lottery_rows = [row for row in grades if row["prediction_phase"] == "lottery_discussion"]
            self.assertTrue(lottery_rows)
            report = (slate_dir / "05_postgame_learning" / "postgame_learning_report.md").read_text(encoding="utf-8")
            self.assertIn("Final EchoIQ Chat Board Results", report)

            signal_perf = json.loads((slate_dir / "05_postgame_learning" / "signal_performance.json").read_text(encoding="utf-8"))
            self.assertGreaterEqual(signal_perf["summary"]["final_echoiq_predictions_graded"], 2)
            self.assertIn("final_echoiq_predictions", signal_perf["by_prediction_source"])
            self.assertIn("final_chat_board_game_lean_record", signal_perf["summary"])

            source_md = slate_dir / "00_inputs" / "echoiq_may15_final_predictions_for_codex.md"
            self.assertTrue(source_md.exists())
            self.assertIn("authoritative source fixture", source_md.read_text(encoding="utf-8"))

    def test_postgame_learning_absent_final_prediction_csv_degrades_gracefully(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slate_dir = root / "slates" / "2026-05-15"
            _write_postgame_learning_fixture(slate_dir)

            result = run_daily_agent(date_token="2026-05-15", mode="postgame-learning", offline=True, config=_config(root))

            self.assertFalse(result.dry_run)
            self.assertFalse(any("FINAL_ECHOIQ_PREDICTIONS" in warning for warning in result.warnings))
            grades = _read_rows(slate_dir / "05_postgame_learning" / "prediction_grades.csv")
            self.assertFalse(any(row["prediction_source"] == "final_echoiq_predictions" for row in grades))

    def test_postgame_learning_outputs_do_not_emit_official_bet_labels(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slate_dir = root / "slates" / "2026-05-15"
            _write_postgame_learning_fixture(slate_dir)

            run_daily_agent(date_token="2026-05-15", mode="postgame-learning", offline=True, config=_config(root))

            for path in [
                slate_dir / "05_postgame_learning" / "prediction_grades.csv",
                slate_dir / "05_postgame_learning" / "game_grades.csv",
                slate_dir / "05_postgame_learning" / "hidden_winners.csv",
            ]:
                rows = _read_rows(path)
                for row in rows:
                    self.assertNotEqual(row.get("process_label"), "BET")
                    self.assertNotEqual(row.get("result_label"), "BET")
                    self.assertNotEqual(row.get("pregame_tier"), "BET")


def _config(root: Path) -> AgentConfig:
    return AgentConfig(
        repo_root=root,
        slates_dir=root / "slates",
        timezone="America/Chicago",
        mlb_stats_api_base="https://statsapi.mlb.com/api/v1",
        sportsradar_api_key_present=False,
        weather_api_key_present=False,
        odds_api_key_present=False,
    )


def _write_postgame_learning_fixture(slate_dir: Path, *, teammate_hr: bool = False, team_context_hr: bool = True) -> None:
    watchlists = slate_dir / "03_watchlists"
    refresh = slate_dir / "04_pregame_refresh"
    postgame = slate_dir / "01_postgame_audit"
    research = slate_dir / "02_next_slate_research"
    _write_rows(
        research / "verified_slate.csv",
        VERIFIED_SLATE_FIELDS,
        [
            {
                "slate_date": "2026-05-15",
                "game_id": "1",
                "away_team": "AAA",
                "home_team": "BBB",
                "venue": "Test Park",
                "game_time": "2026-05-15T19:00:00Z",
                "game_status": "Final",
                "away_probable_sp": "Away SP",
                "home_probable_sp": "Home SP",
                "probable_sp_confidence": "MEDIUM",
                "lineup_status": "CONFIRMED",
                "weather_status": "UNVERIFIED",
                "odds_status": "UNVERIFIED",
                "data_completeness": "MEDIUM",
                "source": "test",
                "retrieved_at": "2026-05-16T00:00:00",
            }
        ],
    )
    _write_rows(
        watchlists / "hr_watchlist.csv",
        WATCHLIST_FIELDS,
        [
            _watchlist_row_payload_for_learning(
                player_name="Test Hitter",
                market="HR",
                signal_type="team_environment_power" if teammate_hr and team_context_hr else "power_plus_tb_fit",
                reason="AAA lineup stack and team environment HR lane." if teammate_hr and team_context_hr else "HR lane with isolated player power.",
                supporting_factors="lineup_stack; team_environment" if teammate_hr and team_context_hr else "isolated_player_power",
            )
        ],
    )
    _write_rows(
        watchlists / "total_bases_watchlist.csv",
        WATCHLIST_FIELDS,
        [
            _watchlist_row_payload_for_learning(
                player_name="TB Hitter",
                market="2+ TB",
                signal_type="xbh_contact",
                reason="2+ TB lane from contact and gap power.",
            )
        ],
    )
    _write_rows(
        watchlists / "hits_watchlist.csv",
        WATCHLIST_FIELDS,
        [
            _watchlist_row_payload_for_learning(
                player_name="Contact Hitter",
                market="Hit",
                signal_type="contact_floor",
                reason="Hit lane from contact floor.",
            )
        ],
    )
    _write_rows(
        watchlists / "game_line_leans.csv",
        WATCHLIST_FIELDS,
        [
            _watchlist_row_payload_for_learning(
                player_name="",
                market="Game line",
                signal_type="team_environment",
                reason="AAA team environment lean.",
            )
        ],
    )
    _write_rows(
        refresh / "watchlist_survival.csv",
        [
            "slate_date",
            "game_id",
            "player_or_team",
            "team",
            "opponent",
            "market",
            "prior_label",
            "current_status",
            "lineup_slot",
        ],
        [
            {"slate_date": "2026-05-15", "game_id": "1", "player_or_team": "Test Hitter", "team": "AAA", "opponent": "BBB", "market": "HR", "prior_label": "WATCHLIST", "current_status": "ALIVE", "lineup_slot": "2"},
            {"slate_date": "2026-05-15", "game_id": "1", "player_or_team": "TB Hitter", "team": "AAA", "opponent": "BBB", "market": "2+ TB", "prior_label": "WATCHLIST", "current_status": "ALIVE", "lineup_slot": "3"},
            {"slate_date": "2026-05-15", "game_id": "1", "player_or_team": "Contact Hitter", "team": "AAA", "opponent": "BBB", "market": "Hit", "prior_label": "WATCHLIST", "current_status": "ALIVE", "lineup_slot": "1"},
            {"slate_date": "2026-05-15", "game_id": "1", "player_or_team": "AAA", "team": "AAA", "opponent": "BBB", "market": "Game line", "prior_label": "WATCHLIST", "current_status": "ALIVE", "lineup_slot": ""},
        ],
    )
    _write_rows(
        postgame / "game_results.csv",
        GAME_RESULTS_FIELDS,
        [
            {
                "game_id": "1",
                "date": "2026-05-15",
                "away_team": "AAA",
                "home_team": "BBB",
                "away_score": "6",
                "home_score": "4",
                "winner": "AAA",
                "status": "Final",
                "venue": "Test Park",
                "game_start_time": "2026-05-15T19:00:00Z",
                "source": "test",
                "retrieved_at": "2026-05-16T00:00:00",
            }
        ],
    )
    test_hitter_stats = {"hits": "0", "total_bases": "0", "home_runs": "0", "strikeouts": "2"} if teammate_hr else {"hits": "1", "total_bases": "2", "home_runs": "0", "strikeouts": "1"}
    _write_rows(
        postgame / "player_performance.csv",
        PLAYER_PERFORMANCE_FIELDS,
        [
            _learning_player_row("Test Hitter", batting_order="2", **test_hitter_stats),
            _learning_player_row("TB Hitter", batting_order="3", hits="1", total_bases="2", home_runs="0"),
            _learning_player_row("Contact Hitter", batting_order="1", hits="2", total_bases="2", home_runs="0"),
            _learning_player_row("Power Teammate", batting_order="7", hits="2", total_bases="4", home_runs="1"),
        ],
    )
    _write_rows(
        postgame / "pitcher_usage.csv",
        PITCHER_USAGE_FIELDS,
        [
            {
                "game_id": "1",
                "date": "2026-05-15",
                "pitcher_id": "99",
                "pitcher_name": "Vulnerable Pitcher",
                "team": "BBB",
                "opponent": "AAA",
                "starter_or_reliever": "starter",
                "innings_pitched": "4.0",
                "earned_runs": "5",
                "home_runs_allowed": "1",
            }
        ],
    )
    research.mkdir(parents=True, exist_ok=True)
    (research / "matchup_notes.json").write_text(
        json.dumps(
            {
                "games": [
                    {
                        "game_id": "1",
                        "game": "AAA@BBB",
                        "team_context": ["AAA had a contact cluster."],
                        "sp_context": ["BBB starter looked vulnerable."],
                        "bullpen_context": ["BBB bullpen was taxed."],
                    }
                ]
            }
        ),
        encoding="utf-8",
    )


def _write_final_echoiq_prediction_inputs(slate_dir: Path, *, duplicate: bool = False) -> None:
    input_dir = slate_dir / "00_inputs"
    input_dir.mkdir(parents=True, exist_ok=True)
    (input_dir / "echoiq_may15_final_predictions_for_codex.md").write_text(
        "# authoritative source fixture\n\nFinal chat board source text.\n",
        encoding="utf-8",
    )
    rows = [
        {
            "slate_date": "2026-05-15",
            "prediction_id": "may15_final_chat_hr_test_hitter_001",
            "prediction_source": "final_echoiq_predictions",
            "prediction_phase": "final_chat_board",
            "game": "AAA@BBB",
            "prediction_type": "HR",
            "player_name": "Test Hitter",
            "team": "AAA",
            "opponent": "BBB",
            "lineup_slot": "2",
            "opposing_pitcher": "Home SP",
            "pick": "HR",
            "confidence_tier": "final_chat_board",
            "primary_reason": "Explicit final chat HR row.",
            "secondary_reason": "",
            "risk_flag": "",
            "signal_tags": "raw_phase=final_late_slate_board",
            "notes": "",
        },
        {
            "slate_date": "2026-05-15",
            "prediction_id": "may15_lottery_tb_tb_hitter_001",
            "prediction_source": "final_echoiq_predictions",
            "prediction_phase": "lottery_discussion",
            "game": "AAA@BBB",
            "prediction_type": "TB",
            "player_name": "TB Hitter",
            "team": "AAA",
            "opponent": "BBB",
            "lineup_slot": "3",
            "opposing_pitcher": "Home SP",
            "pick": "lottery TB parlay leg",
            "confidence_tier": "lottery_discussion",
            "primary_reason": "Explicit lottery discussion TB row.",
            "secondary_reason": "",
            "risk_flag": "lottery discussion; not official",
            "signal_tags": "lottery_tb",
            "notes": "",
        },
        {
            "slate_date": "2026-05-15",
            "prediction_id": "may15_final_chat_game_lean_aaa_001",
            "prediction_source": "final_echoiq_predictions",
            "prediction_phase": "final_chat_board",
            "game": "AAA@BBB",
            "prediction_type": "GAME_LEAN",
            "player_name": "",
            "team": "AAA",
            "opponent": "BBB",
            "lineup_slot": "",
            "opposing_pitcher": "",
            "pick": "AAA lean",
            "confidence_tier": "final_chat_board",
            "primary_reason": "AAA lineup stack and team environment lean.",
            "secondary_reason": "",
            "risk_flag": "",
            "signal_tags": "team_environment",
            "notes": "",
        },
        {
            "slate_date": "2026-05-15",
            "prediction_id": "may15_final_chat_game_lean_bbb_001",
            "prediction_source": "final_echoiq_predictions",
            "prediction_phase": "final_chat_board",
            "game": "AAA@BBB",
            "prediction_type": "GAME_LEAN",
            "player_name": "",
            "team": "BBB",
            "opponent": "AAA",
            "lineup_slot": "",
            "opposing_pitcher": "",
            "pick": "BBB lean",
            "confidence_tier": "final_chat_board",
            "primary_reason": "BBB lean had a real contact cluster but underweighted AAA response.",
            "secondary_reason": "",
            "risk_flag": "",
            "signal_tags": "team_environment;contact_cluster_underweighted",
            "notes": "",
        },
    ]
    if duplicate:
        rows.append(dict(rows[0]))
    _write_rows(input_dir / "final_echoiq_predictions.csv", FINAL_ECHOIQ_PREDICTIONS_FIELDS, rows)


def _watchlist_row_payload_for_learning(*, player_name: str, market: str, signal_type: str, reason: str, supporting_factors: str = "contact_cluster; team_environment") -> dict[str, object]:
    row = _watchlist_entry(market=market, player_name=player_name, team="AAA", opponent="BBB")
    row.signal_type = signal_type
    row.reason = reason
    row.supporting_factors = supporting_factors
    return {field: getattr(row, field, "") for field in WATCHLIST_FIELDS}


def _learning_player_row(player_name: str, *, batting_order: str, hits: str, total_bases: str, home_runs: str, strikeouts: str = "0") -> dict[str, object]:
    row = {field: "" for field in PLAYER_PERFORMANCE_FIELDS}
    row.update(
        {
            "game_id": "1",
            "date": "2026-05-15",
            "player_name": player_name,
            "team": "AAA",
            "opponent": "BBB",
            "batting_order": batting_order,
            "at_bats": "4",
            "hits": hits,
            "total_bases": total_bases,
            "home_runs": home_runs,
            "runs": "1",
            "rbi": "1",
            "walks": "0",
            "strikeouts": strikeouts,
            "doubles": "1" if total_bases == "2" else "0",
            "triples": "0",
            "statcast_data_status": "missing",
            "source": "test",
            "retrieved_at": "2026-05-16T00:00:00",
        }
    )
    return row


def _read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def _report_section(report: str, heading: str) -> str:
    start = report.index(heading)
    next_heading = report.find("\n## ", start + len(heading))
    return report[start:] if next_heading == -1 else report[start:next_heading]


def _slate_game() -> SlateGame:
    return SlateGame(
        slate_date="2026-05-15",
        game_id="1",
        away_team="AAA",
        home_team="BBB",
        venue="Test Park",
        game_time="2026-05-15T19:00:00Z",
        game_status="Scheduled",
        away_probable_sp="Away SP",
        home_probable_sp="Home SP",
        away_probable_sp_id="11",
        home_probable_sp_id="22",
        probable_sp_confidence="MEDIUM",
        lineup_status="UNVERIFIED",
        weather_status="UNVERIFIED",
        odds_status="UNVERIFIED",
        data_completeness="LOW",
        source="test",
        retrieved_at="2026-05-15T00:00:00",
    )


def _watchlist_entry(
    *,
    market: str = "HR",
    player_name: str = "Test Hitter",
    team: str = "AAA",
    opponent: str = "BBB",
) -> WatchlistEntry:
    return WatchlistEntry(
        slate_date="2026-05-15",
        game_id="1",
        player_name=player_name,
        team=team,
        opponent=opponent,
        market=market,
        signal_type="test",
        confidence="LOW",
        label="WATCHLIST",
        reason="test",
        supporting_factors="test",
        risk_flags="test",
        data_gaps="statcast_missing",
        source_summary="test",
        retrieved_at="2026-05-15T00:00:00",
    )


def _game_payload() -> dict[str, object]:
    return {
        "slate_date": "2026-05-15",
        "game_id": "1",
        "away_team": "AAA",
        "home_team": "BBB",
        "venue": "Test Park",
        "game_time": "2026-05-15T19:00:00Z",
        "game_status": "Scheduled",
        "retrieved_at": "2026-05-15T10:00:00",
    }


def _starter_rows() -> list[dict[str, object]]:
    return [
        {"game_id": "1", "team": "AAA", "sp_confirmed": True, "starter_changed": False, "source": "test"},
        {"game_id": "1", "team": "BBB", "sp_confirmed": True, "starter_changed": False, "source": "test"},
    ]


def _confirmed_lineup_rows(*, include_test_hitter: bool) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    away_names = ["Test Hitter"] if include_test_hitter else ["Other Hitter"]
    away_names.extend([f"AAA Hitter {idx}" for idx in range(2, 10)])
    home_names = [f"BBB Hitter {idx}" for idx in range(1, 10)]
    for team, names in [("AAA", away_names), ("BBB", home_names)]:
        for index, name in enumerate(names, start=1):
            rows.append(
                {
                    "slate_date": "2026-05-15",
                    "game_id": "1",
                    "team": team,
                    "lineup_status": "CONFIRMED",
                    "confirmed_lineup_available": True,
                    "player_name": name,
                    "player_id": "123" if name == "Test Hitter" else f"{team}{index}",
                    "lineup_slot": str(index),
                    "position": "DH",
                    "is_starting": True,
                    "scratch_flag": False,
                    "source": "test",
                    "retrieved_at": "2026-05-15T18:00:00",
                }
            )
    return rows


def _mock_live_feed_payload() -> dict[str, object]:
    def side_payload(team: str, first_name: str, first_id: str) -> dict[str, object]:
        ids = [first_id, *[f"{team}{idx}" for idx in range(2, 10)]]
        players = {}
        for index, player_id in enumerate(ids, start=1):
            players[f"ID{player_id}"] = {
                "person": {"id": player_id, "fullName": first_name if index == 1 else f"{team} Hitter {index}"},
                "battingOrder": str(index * 100),
                "position": {"abbreviation": "DH" if index == 1 else "OF"},
            }
        return {
            "team": {"abbreviation": team},
            "battingOrder": ids,
            "players": players,
        }

    return {
        "liveData": {
            "boxscore": {
                "teams": {
                    "away": side_payload("AAA", "Test Hitter", "123"),
                    "home": side_payload("BBB", "Home Hitter", "456"),
                }
            }
        }
    }


def _write_manual_market_csv(path: Path, rows: list[dict[str, object]]) -> None:
    fieldnames = [
        "date",
        "game_key",
        "provider_event_id",
        "provider",
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
        "source_confidence",
    ]
    _write_rows(path, fieldnames, rows)


def _write_manual_weather_roof_csv(path: Path, rows: list[dict[str, object]]) -> None:
    _write_rows(
        path,
        [
            "slate_date",
            "game_id",
            "away_team",
            "home_team",
            "venue",
            "roof_status",
            "temperature",
            "wind_speed",
            "wind_direction",
            "humidity",
            "precipitation_risk",
            "weather_verified",
            "weather_risk",
            "source_name",
            "source_url",
            "last_updated",
            "notes",
        ],
        rows,
    )


def _write_manual_market_snapshot_v42_csv(path: Path, rows: list[dict[str, object]]) -> None:
    _write_rows(
        path,
        [
            "slate_date",
            "game_id",
            "away_team",
            "home_team",
            "market_type",
            "market",
            "player_name",
            "team",
            "line",
            "price",
            "sportsbook",
            "last_updated",
            "source_name",
            "source_url",
            "notes",
        ],
        rows,
    )


def _write_manual_player_props_csv(path: Path, rows: list[dict[str, object]]) -> None:
    _write_rows(
        path,
        [
            "slate_date",
            "game_id",
            "player_name",
            "player_id",
            "team",
            "opponent",
            "market",
            "line",
            "price",
            "sportsbook",
            "available",
            "last_updated",
            "source_name",
            "source_url",
            "notes",
        ],
        rows,
    )


def _write_manual_news_scratch_csv(path: Path, rows: list[dict[str, object]]) -> None:
    _write_rows(
        path,
        [
            "slate_date",
            "game_id",
            "player_name",
            "player_id",
            "team",
            "news_type",
            "status",
            "headline",
            "summary",
            "lineup_impact",
            "prop_impact",
            "source_name",
            "source_url",
            "published_at",
            "notes",
        ],
        rows,
    )


def _fetch_mock_manual_markets(csv_path: Path) -> list[MarketSnapshotRow]:
    tracker = SourceTracker(timezone="America/Chicago")
    data_sources = NightShiftDataSources(
        tracker=tracker,
        mlb_client=NightShiftMLBStatsClient(),
        offline=False,
    )
    with patch.dict("os.environ", {"ECHOIQ_MARKET_CSV": str(csv_path), "ODDS_API_KEY": "", "THE_ODDS_API_KEY": ""}, clear=False):
        return fetch_odds_enrichment(
            slate_date="2026-05-15",
            slate_games=[_slate_game()],
            data_sources=data_sources,
            api_key_present=False,
            repo_root=csv_path.parent,
        )


def _player(
    *,
    player_id: str,
    hits: int = 0,
    total_bases: int = 0,
    home_runs: int = 0,
    at_bats: int = 4,
) -> PlayerPerformance:
    return PlayerPerformance(
        game_id="1",
        date="2026-05-14",
        player_id=player_id,
        player_name="Test Hitter",
        team="AAA",
        opponent="BBB",
        batting_order="1",
        position="DH",
        at_bats=at_bats,
        hits=hits,
        total_bases=total_bases,
        home_runs=home_runs,
        runs=0,
        rbi=0,
        walks=0,
        strikeouts=1,
        doubles=0,
        triples=0,
        stolen_bases=0,
        exit_velocity_avg=None,
        exit_velocity_max=None,
        launch_angle_avg=None,
        hard_hit_count=None,
        hard_hit_rate=None,
        barrel_count=None,
        barrel_rate=None,
        sweet_spot_count=None,
        sweet_spot_rate=None,
        xba=None,
        xslg=None,
        xwoba=None,
        estimated_hr_distance_max=None,
        batted_ball_events=None,
        pulled_air_contact_count=None,
        opposite_field_contact_count=None,
        statcast_signal_tags="",
        statcast_signal_note="",
        statcast_data_status="pending",
        notes="",
        source="test",
        retrieved_at="2026-05-15T00:00:00",
    )


def _pitcher(*, pitcher_id: str, earned_runs: int = 0) -> PitcherUsage:
    return PitcherUsage(
        game_id="1",
        date="2026-05-14",
        pitcher_id=pitcher_id,
        pitcher_name="Test Pitcher",
        team="BBB",
        opponent="AAA",
        starter_or_reliever="starter",
        innings_pitched="6.0",
        pitches=90,
        batters_faced=22,
        hits_allowed=3,
        earned_runs=earned_runs,
        walks=1,
        strikeouts=6,
        home_runs_allowed=0,
        velocity_note="",
        workload_note="",
        avg_exit_velocity_allowed=None,
        max_exit_velocity_allowed=None,
        hard_hit_allowed=None,
        barrels_allowed=None,
        xba_allowed=None,
        xslg_allowed=None,
        xwoba_allowed=None,
        whiff_rate=None,
        called_strike_whiff_rate=None,
        pitch_mix_note="",
        contact_quality_allowed_note="",
        statcast_signal_tags="",
        statcast_data_status="pending",
        source="test",
        retrieved_at="2026-05-15T00:00:00",
    )


def _write_minimal_morning_packet(slate_dir: Path) -> None:
    preview_dir = slate_dir / "02_next_slate_research"
    watchlists_dir = slate_dir / "03_watchlists"
    preview_dir.mkdir(parents=True, exist_ok=True)
    watchlists_dir.mkdir(parents=True, exist_ok=True)
    _write_rows(
        preview_dir / "verified_slate.csv",
        [
            "slate_date",
            "game_id",
            "away_team",
            "home_team",
            "venue",
            "game_time",
            "game_status",
            "away_probable_sp",
            "home_probable_sp",
            "probable_sp_confidence",
            "lineup_status",
            "weather_status",
            "odds_status",
            "data_completeness",
            "source",
            "retrieved_at",
        ],
        [
            {
                "slate_date": "2026-05-15",
                "game_id": "1",
                "away_team": "AAA",
                "home_team": "BBB",
                "venue": "Test Park",
                "game_time": "2026-05-15T19:00:00Z",
                "game_status": "Scheduled",
                "away_probable_sp": "Away SP",
                "home_probable_sp": "Home SP",
                "probable_sp_confidence": "MEDIUM",
                "lineup_status": "UNVERIFIED",
                "weather_status": "UNVERIFIED",
                "odds_status": "UNVERIFIED",
                "data_completeness": "LOW",
                "source": "test",
                "retrieved_at": "2026-05-15T09:00:00",
            }
        ],
    )
    _write_rows(preview_dir / "probable_pitchers.csv", ["slate_date", "game_id", "team", "opponent", "pitcher_id", "pitcher_name", "handedness", "probable_status", "season_era", "recent_form_note", "pitch_count_note", "source", "retrieved_at"], [])
    _write_rows(preview_dir / "lineup_status.csv", ["slate_date", "game_id", "team", "lineup_status", "confirmed_lineup_available", "projected_lineup_available", "notable_absences", "source", "retrieved_at"], [])
    _write_rows(preview_dir / "market_snapshot.csv", MARKET_SNAPSHOT_FIELDS, [])
    _write_rows(preview_dir / "injury_news.csv", INJURY_NEWS_FIELDS, [])
    _write_rows(preview_dir / "weather.csv", ["slate_date", "game_id", "venue", "roof_status", "temperature", "wind_speed", "wind_direction", "humidity", "precipitation_risk", "run_environment_note", "hr_environment_note", "confidence", "source", "retrieved_at"], [])
    _write_rows(watchlists_dir / "hr_watchlist.csv", WATCHLIST_FIELDS, [_watchlist_row_payload()])
    _write_rows(watchlists_dir / "total_bases_watchlist.csv", WATCHLIST_FIELDS, [])
    _write_rows(watchlists_dir / "hits_watchlist.csv", WATCHLIST_FIELDS, [])
    _write_rows(watchlists_dir / "game_line_leans.csv", WATCHLIST_FIELDS, [])


def _write_pregame_summary_artifacts(slate_dir: Path) -> None:
    pregame_dir = slate_dir / "04_pregame_refresh"
    logs_dir = slate_dir / "logs"
    _write_rows(
        pregame_dir / "verification_matrix.csv",
        ["game_id", "lineups_confirmed", "official_bet_eligible"],
        [
            {"game_id": "1", "lineups_confirmed": "true", "official_bet_eligible": "false"},
            {"game_id": "2", "lineups_confirmed": "false", "official_bet_eligible": "false"},
        ],
    )
    _write_rows(
        pregame_dir / "weather_refresh.csv",
        ["game_id", "weather_verified"],
        [
            {"game_id": "1", "weather_verified": "true"},
            {"game_id": "2", "weather_verified": "false"},
        ],
    )
    _write_rows(pregame_dir / "market_refresh.csv", ["game_id", "market"], [{"game_id": "1", "market": "moneyline"}])
    _write_rows(pregame_dir / "player_prop_availability.csv", ["game_id", "market"], [{"game_id": "1", "market": "home_run"}])
    _write_rows(pregame_dir / "news_refresh.csv", ["game_id", "status"], [{"game_id": "1", "status": "available"}])
    _write_rows(
        pregame_dir / "watchlist_survival.csv",
        ["current_status", "official_bet_eligible"],
        [
            {"current_status": "CONDITIONAL", "official_bet_eligible": "false"},
            {"current_status": "KILLED", "official_bet_eligible": "false"},
        ],
    )
    logs_dir.mkdir(parents=True, exist_ok=True)
    (logs_dir / "unresolved_gaps.md").write_text(
        "\n".join(
            [
                "# EchoIQ Night Shift Unresolved Gaps",
                "",
                "| Missing Source | Affected Artifact | Affected Games/Players | Severity | Recommended Fix | Output Degraded |",
                "|---|---|---|---|---|---|",
                "| WEATHER_SOURCE_UNAVAILABLE | weather_refresh.csv | all | MEDIUM | fill weather | yes |",
                "| ODDS_KEY_MISSING | market_refresh.csv | all | HIGH | fill odds | yes |",
            ]
        ),
        encoding="utf-8",
    )


def _watchlist_row_payload() -> dict[str, object]:
    row = _watchlist_entry()
    return {field: getattr(row, field, "") for field in WATCHLIST_FIELDS}


def _write_rows(path: Path, fieldnames: list[str], rows: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fieldnames})


class _FakeStatcastFetchClient:
    def __init__(self, rows=None, exc: Exception | None = None, cache_used: bool = False):
        self.rows = rows if rows is not None else []
        self.exc = exc
        self.last_cache_was_used = cache_used
        self.last_fetch_error = str(exc) if exc else None
        self.last_cache_path = Path("data/cache/pybaseball/statcast/fake.csv")

    def get_statcast_window(self, start_date: str, end_date: str, *, force_refresh: bool = False):
        if self.exc:
            raise self.exc
        return self.rows


if __name__ == "__main__":
    unittest.main()
