"""Unit tests for the canvases/exports/pipeline/* modules.

These tests cover the pure building blocks extracted from apr16_compute.py.
They deliberately avoid the network, the filesystem (except for snapshots
which take an explicit root directory), and the orchestration globals.

Run:
    python -m unittest discover -s tests
"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from dataclasses import dataclass
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

REPO_ROOT = Path(__file__).resolve().parents[1]
EXPORTS_DIR = REPO_ROOT / "canvases" / "exports"
for path in (REPO_ROOT, EXPORTS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from pipeline import canvas_io, features, inputs, markets, slate, snapshots, status  # noqa: E402


# --- Test doubles -----------------------------------------------------------

@dataclass
class _FakeMarketLine:
    over_price: float | int | None = None
    point: float | None = None
    source: str = "odds_api"
    event_id: str = "evt1"
    market_key: str = "batter_home_runs"
    player_key: str = "juan-soto"
    player_name: str = "Juan Soto"
    under_price: float | None = None
    bookmakers_count: int | None = 3
    last_update: str | None = None


# --- canvas_io tests --------------------------------------------------------

class CanvasIoTests(unittest.TestCase):
    def test_replace_marker_region_roundtrip(self):
        source = (
            "prefix\n"
            "<!-- games-csv:start -->\n"
            "old,csv,block\n"
            "<!-- games-csv:end -->\n"
            "suffix"
        )
        replaced = canvas_io.replace_marker_region(source, "games-csv", "a,b,c\nd,e,f")
        self.assertIn("<!-- games-csv:start -->\na,b,c\nd,e,f\n<!-- games-csv:end -->", replaced)
        self.assertIn("prefix", replaced)
        self.assertIn("suffix", replaced)

    def test_replace_marker_region_missing_raises(self):
        with self.assertRaises(ValueError):
            canvas_io.replace_marker_region("no markers here", "games-csv", "x")

    def test_assert_no_comment_breaker_rejects_block_end(self):
        with self.assertRaises(ValueError):
            canvas_io.assert_no_comment_breaker("benign,row\nevil */ row", "games CSV")
        canvas_io.assert_no_comment_breaker("safe,row", "games CSV")  # should not raise

    def test_csv_block_and_rows_to_dicts_roundtrip(self):
        rows = [["a", "b"], ["1", "2"], ["3", "4"]]
        text = canvas_io.csv_block(rows)
        self.assertIn("a,b", text)
        dicts = canvas_io.rows_to_dicts(rows)
        self.assertEqual(dicts, [{"a": "1", "b": "2"}, {"a": "3", "b": "4"}])

    def test_canvas_slug_strips_prefix_and_suffix(self):
        self.assertEqual(
            canvas_io.canvas_slug(Path("/tmp/canvases/mlb-pregame-intel-apr20.canvas.tsx")),
            "apr20",
        )

    def test_parse_canvas_games_uses_explicit_specs(self):
        source = '''
  const SLATE = [
    {
      gameKey: "DET@BOS",
      awayLuLabel: "Projected A",
      homeLuLabel: "Projected B",
      awayLineup: [
        ["1", "Player One", "SS"],
        ["2", "Player Two", "CF"],
      ],
      homeLineup: [
      ],
    },
  ];
'''
        out = canvas_io.parse_canvas_games(source, [{"away": "DET", "home": "BOS"}])
        self.assertIn("DET@BOS", out)
        self.assertEqual(out["DET@BOS"]["away_label"], "Projected A")
        self.assertEqual(out["DET@BOS"]["home_label"], "Projected B")
        self.assertEqual(len(out["DET@BOS"]["away_lineup"]), 2)
        self.assertEqual(out["DET@BOS"]["away_lineup"][0]["name"], "Player One")
        self.assertEqual(out["DET@BOS"]["home_lineup"], [])

    def test_render_lineup_and_prop_rows_handle_empty(self):
        self.assertEqual(canvas_io.render_lineup_rows([]), "[]")
        self.assertEqual(canvas_io.render_prop_rows([]), "[]")

    def test_patch_float_and_string_fields(self):
        block = "modelAwayPct: 52.10, prediction: \"NYY\","
        self.assertIn("modelAwayPct: 47.22", canvas_io.patch_float_field(block, "modelAwayPct", 47.22))
        self.assertIn('prediction: "BOS"', canvas_io.patch_string_field(block, "prediction", "BOS"))

    def test_round_or_blank(self):
        self.assertEqual(canvas_io.round_or_blank(None), "")
        self.assertEqual(canvas_io.round_or_blank(0.1234, 3), "0.123")


# --- markets tests ----------------------------------------------------------

class MarketsTests(unittest.TestCase):
    def test_prop_tier_rank_handles_casing_and_missing(self):
        self.assertEqual(markets.prop_tier_rank("a+"), 5)
        self.assertEqual(markets.prop_tier_rank(" B "), 3)
        self.assertEqual(markets.prop_tier_rank(""), 0)
        self.assertEqual(markets.prop_tier_rank("X"), 0)

    def test_has_hr_market_price(self):
        self.assertFalse(markets.has_hr_market_price(None))
        self.assertFalse(markets.has_hr_market_price(_FakeMarketLine(over_price=None)))
        self.assertTrue(markets.has_hr_market_price(_FakeMarketLine(over_price=250)))

    def test_is_aligned_tb_market(self):
        self.assertTrue(markets.is_aligned_tb_market(_FakeMarketLine(over_price=-105, point=1.5)))
        self.assertFalse(markets.is_aligned_tb_market(_FakeMarketLine(over_price=-105, point=2.5)))
        self.assertFalse(markets.is_aligned_tb_market(_FakeMarketLine(over_price=None, point=1.5)))
        self.assertFalse(markets.is_aligned_tb_market(None))

    def test_classify_hr_market_status_paths(self):
        self.assertEqual(markets.classify_hr_market_status(None, "A", "High", None), "unpriced")
        priced = _FakeMarketLine(over_price=350)
        self.assertEqual(
            markets.classify_hr_market_status(4.0, "A", "High", priced, hr_market_integrity="degraded"),
            "integrity_degraded_projection_only",
        )
        # No edge
        self.assertEqual(markets.classify_hr_market_status(0.0, "A", "High", priced), "priced_no_edge")
        # Below tier
        self.assertEqual(markets.classify_hr_market_status(5.0, "B", "High", priced), "priced_below_tier")
        # Low confidence
        self.assertEqual(markets.classify_hr_market_status(5.0, "A", "Low", priced), "priced_low_conf")
        # Below gate
        self.assertEqual(markets.classify_hr_market_status(1.0, "A", "High", priced), "priced_below_gate")
        # Qualified
        self.assertEqual(markets.classify_hr_market_status(4.0, "A", "High", priced), "qualified")

    def test_classify_tb_market_status_paths(self):
        # Unpriced
        self.assertEqual(
            markets.classify_tb_market_status(None, None, "B", "High", None, "full"),
            "unpriced",
        )
        # Line mismatch
        mismatched = _FakeMarketLine(over_price=-105, point=2.5)
        self.assertEqual(
            markets.classify_tb_market_status(1.0, 0.6, "B", "High", mismatched, "full"),
            "line_mismatch_2.5",
        )
        aligned = _FakeMarketLine(over_price=-105, point=1.5)
        # No edge
        self.assertEqual(
            markets.classify_tb_market_status(0.0, 0.6, "B", "High", aligned, "full"),
            "priced_no_edge",
        )
        # Prob gate
        self.assertEqual(
            markets.classify_tb_market_status(2.0, 0.40, "B", "High", aligned, "full"),
            "priced_below_prob_gate",
        )
        # Tier gate
        self.assertEqual(
            markets.classify_tb_market_status(2.0, 0.55, "C", "High", aligned, "full"),
            "priced_below_tier",
        )
        # Low conf
        self.assertEqual(
            markets.classify_tb_market_status(2.0, 0.55, "A", "Low", aligned, "full"),
            "priced_low_conf",
        )
        # Below edge gate
        self.assertEqual(
            markets.classify_tb_market_status(1.0, 0.55, "A", "High", aligned, "full"),
            "priced_below_gate",
        )
        # Qualified
        self.assertEqual(
            markets.classify_tb_market_status(2.0, 0.55, "A", "High", aligned, "full"),
            "qualified",
        )

    def test_classify_tb_market_status_partial_market_is_more_conservative(self):
        aligned = _FakeMarketLine(over_price=-105, point=1.5)
        self.assertEqual(
            markets.classify_tb_market_status(2.5, 0.51, "A", "High", aligned, "partial"),
            "priced_below_prob_gate",
        )
        self.assertEqual(
            markets.classify_tb_market_status(2.5, 0.54, "A", "High", aligned, "partial"),
            "priced_below_gate",
        )
        self.assertEqual(
            markets.classify_tb_market_status(3.0, 0.54, "A", "High", aligned, "partial"),
            "qualified",
        )

    def test_choose_recommended_prop_selects_hr_only_on_clear_edge_gap(self):
        # Both qualified, TB preferred by default
        self.assertEqual(
            markets.choose_recommended_prop("qualified", "qualified", 3.0, 3.0, "A", "B"),
            ("2+ TB", "B"),
        )
        # HR edge dominates TB by > 1.5
        self.assertEqual(
            markets.choose_recommended_prop("qualified", "qualified", 6.0, 3.0, "A+", "B"),
            ("HR", "A+"),
        )
        # Only HR qualified
        self.assertEqual(
            markets.choose_recommended_prop("qualified", "priced_no_edge", 5.0, -1.0, "A", "C"),
            ("HR", "A"),
        )
        # Only TB qualified
        self.assertEqual(
            markets.choose_recommended_prop("unpriced", "qualified", None, 2.0, "C", "A"),
            ("2+ TB", "A"),
        )
        # Neither qualified
        self.assertEqual(
            markets.choose_recommended_prop("unpriced", "unpriced", None, None, "D", "D"),
            ("", ""),
        )

    def test_summarize_prop_market_coverage_flags(self):
        def norm(name: str) -> str:
            return name.lower().replace(" ", "-")

        ctx = {
            "away_players": [{"name": "Juan Soto"}, {"name": "Aaron Judge"}],
            "home_players": [{"name": "Alex Bregman"}],
            "away_moneyline": -120,
            "home_moneyline": None,  # missing → market_odds_unavailable note
        }
        market_map = {
            (norm("Juan Soto"), "batter_home_runs"): _FakeMarketLine(over_price=400, source="rotowire_lineup"),
            (norm("Aaron Judge"), "batter_home_runs"): _FakeMarketLine(over_price=350, source="rotowire_lineup"),
            # No home-side HR → rotowire_hr_home_side_missing
        }
        out = markets.summarize_prop_market_coverage("NYY@HOU", ctx, market_map, normalize_player_name=norm)
        self.assertEqual(out["away_hr_covered"], 2)
        self.assertEqual(out["home_hr_covered"], 0)
        self.assertEqual(out["hr_market_integrity"], "degraded")
        self.assertIn("rotowire_hr_home_side_missing", out["notes"])
        self.assertIn("market_odds_unavailable", out["notes"])

    def test_summarize_prop_market_coverage_classifies_full(self):
        def norm(name: str) -> str:
            return name.lower().replace(" ", "-")

        ctx = {
            "away_players": [{"name": "Juan Soto"}],
            "home_players": [{"name": "Alex Bregman"}],
            "away_moneyline": -120,
            "home_moneyline": 110,
        }
        market_map = {
            (norm("Juan Soto"), "batter_home_runs"): _FakeMarketLine(over_price=400, source="odds_api"),
            (norm("Alex Bregman"), "batter_home_runs"): _FakeMarketLine(over_price=350, source="odds_api"),
        }
        out = markets.summarize_prop_market_coverage("NYY@HOU", ctx, market_map, normalize_player_name=norm)
        self.assertEqual(out["hr_market_integrity"], "full")

    def test_summarize_prop_market_coverage_classifies_partial(self):
        def norm(name: str) -> str:
            return name.lower().replace(" ", "-")

        ctx = {
            "away_players": [{"name": "Juan Soto"}, {"name": "Aaron Judge"}],
            "home_players": [{"name": "Alex Bregman"}, {"name": "Yordan Alvarez"}],
            "away_moneyline": -120,
            "home_moneyline": 110,
        }
        market_map = {
            (norm("Juan Soto"), "batter_home_runs"): _FakeMarketLine(over_price=400, source="odds_api"),
            (norm("Alex Bregman"), "batter_home_runs"): _FakeMarketLine(over_price=350, source="odds_api"),
        }
        out = markets.summarize_prop_market_coverage("NYY@HOU", ctx, market_map, normalize_player_name=norm)
        self.assertEqual(out["hr_market_integrity"], "partial")


# --- snapshots tests --------------------------------------------------------

class SnapshotTests(unittest.TestCase):
    def test_scoring_status_for_bucket(self):
        self.assertEqual(snapshots.scoring_status_for_bucket("pregame"), "scored")
        self.assertEqual(snapshots.scoring_status_for_bucket("Pregame "), "scored")
        self.assertEqual(snapshots.scoring_status_for_bucket("live"), "not_scored")
        self.assertEqual(snapshots.scoring_status_for_bucket("final"), "not_scored")
        self.assertEqual(snapshots.scoring_status_for_bucket(""), "not_scored")
        self.assertEqual(snapshots.scoring_status_for_bucket(None), "not_scored")


# --- slate tests ------------------------------------------------------------

class SlateTests(unittest.TestCase):
    def test_slug_from_calendar_date_matches_existing_format(self):
        self.assertEqual(slate.slug_from_calendar_date("2026-04-16"), "apr16")
        self.assertEqual(slate.slug_from_calendar_date("2026-04-06"), "apr6")

    def test_slug_from_calendar_date_optional_passthrough(self):
        self.assertEqual(slate.slug_from_calendar_date("apr16", allow_slug_passthrough=True), "apr16")
        with self.assertRaises(ValueError):
            slate.slug_from_calendar_date("apr16")

    def test_validate_game_specs_accepts_current_contract(self):
        slate.validate_game_specs(
            [
                {
                    "away": "DET",
                    "home": "BOS",
                    "time_et": "6:10 PM",
                    "away_a": 110,
                    "home_a": -130,
                    "weather": "Open",
                    "run_env": "Medium",
                    "away_xera": 4.15,
                    "home_xera": 3.95,
                    "analyst_confidence": "Medium",
                    "rationale": "Stub rationale",
                    "extra_flags": ["auto_scaffold_live_odds"],
                }
            ]
        )

    def test_validate_game_specs_rejects_missing_required_keys(self):
        with self.assertRaises(ValueError):
            slate.validate_game_specs([{"away": "DET", "home": "BOS"}])


    def test_summarize_snapshot_evaluation_eligible(self):
        games = [
            {"game_status_bucket": "pregame", "scoring_status": "scored"},
            {"game_status_bucket": "pregame", "scoring_status": "scored"},
        ]
        props = [{"scoring_status": "scored"}] * 5
        out = snapshots.summarize_snapshot_evaluation(False, games, props)
        self.assertTrue(out["eligible"])
        self.assertEqual(out["status"], "eligible")
        self.assertEqual(out["reasons"], [])
        self.assertEqual(out["scored_games"], 2)
        self.assertEqual(out["scored_props"], 5)

    def test_summarize_snapshot_evaluation_allow_partial_flag(self):
        out = snapshots.summarize_snapshot_evaluation(True, [{"game_status_bucket": "pregame", "scoring_status": "scored"}], [])
        self.assertFalse(out["eligible"])
        self.assertIn("allow_partial", out["reasons"])

    def test_summarize_snapshot_evaluation_no_games(self):
        out = snapshots.summarize_snapshot_evaluation(False, [], [])
        self.assertIn("no_games", out["reasons"])

    def test_summarize_snapshot_evaluation_non_pregame_scored(self):
        games = [
            {"game_status_bucket": "pregame", "scoring_status": "scored"},
            {"game_status_bucket": "live", "scoring_status": "scored"},
        ]
        out = snapshots.summarize_snapshot_evaluation(False, games, [])
        self.assertIn("contains_non_pregame_scored_games", out["reasons"])
        self.assertFalse(out["eligible"])

    def test_write_run_snapshot_writes_latest_and_timestamped(self):
        @dataclass
        class _O:
            event_id: str = "e"
            away_abbr: str = "DET"
            home_abbr: str = "BOS"
            away_moneyline: int = 120
            home_moneyline: int = -140
            total_line: float = 9.0
            over_price: int = -110
            under_price: int = -110
            bookmakers_count: int = 3
            last_update: str = "2026-04-21T12:00:00Z"
            source: str = "odds_api"

        @dataclass
        class _P:
            event_id: str = "e"
            market_key: str = "batter_home_runs"
            player_key: str = "x"
            player_name: str = "X"
            point: float | None = None
            over_price: int = 300
            under_price: int | None = None
            bookmakers_count: int = 3
            last_update: str = "2026-04-21T12:00:00Z"
            source: str = "odds_api"

        @dataclass
        class _W:
            venue_name: str = "Fenway Park"
            source: str = "open-meteo"
            forecast_time_utc: str = ""
            roof_type: str = "Open"
            temperature_f: float = 68.0
            wind_speed_mph: float = 6.0
            wind_direction_deg: float = 180.0
            precipitation_probability_pct: float = 10.0
            precipitation_inches: float = 0.0
            weather_code: int = 1
            run_factor: float = 1.0
            summary: str = "Clear, 68°F"

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            canvas = tmp_path / "mlb-pregame-intel-apr21.canvas.tsx"
            canvas.write_text("placeholder", encoding="utf-8")
            snap_root = tmp_path / "snapshots"
            games_rows = [
                ["game_status_bucket", "scoring_status", "verification_status", "market_data_status"],
                ["pregame", "scored", "Verified", ""],
            ]
            batter_rows = [
                ["scoring_status", "market_data_status"],
                ["scored", "full"],
            ]
            out = snapshots.write_run_snapshot(
                canvas,
                snapshot_root=snap_root,
                report_date="2026-04-21",
                market_blend_alpha=0.25,
                allow_partial=False,
                lineup_context={
                    "DET@BOS": {
                        "game_status_bucket": "pregame",
                        "away_lineup_verification": {
                            "verification_level": "confirmed_api_rotowire",
                            "provider_results": {
                                "fangraphs": {"status": "missing"},
                                "rotowire": {"status": "matched"},
                            },
                        },
                        "home_lineup_verification": {"verification_level": "projected_canvas_fallback"},
                        "away_starter_verification": {"verification_level": "confirmed_api_rotowire"},
                        "home_starter_verification": {"verification_level": "api_rotowire_unconfirmed"},
                        "weather_issue_codes": ["weather_live_missing", "weather_fallback_conservative"],
                        "weather_provider_path": ["open_meteo", "fallback_neutral"],
                        "weather_resolution_source": "fallback_neutral",
                        "weather_resolution_detail": "Open-Meteo forecast returned no hourly data for Fenway Park.",
                    }
                },
                games_rows=games_rows,
                batter_rows=batter_rows,
                game_feature_rows=[{"game": "DET@BOS"}],
                prop_feature_rows=[{"batter": "X"}],
                team_bullpen_scores={},
                runtime_diagnostics=[],
                prop_market_coverage=[],
                game_odds_cls=_O,
                prop_market_cls=_P,
                weather_cls=_W,
            )
            latest = snap_root / "apr21" / "apr21-latest.json"
            self.assertTrue(out.exists())
            self.assertTrue(latest.exists())
            payload = json.loads(latest.read_text(encoding="utf-8"))
            self.assertEqual(payload["slug"], "apr21")
            self.assertEqual(payload["report_date"], "2026-04-21")
            self.assertEqual(payload["game_model"]["market_blend_alpha"], 0.25)
            self.assertTrue(payload["evaluation_eligible"])
            self.assertEqual(payload["summary"]["pregame_games"], 1)
            self.assertEqual(payload["summary"]["scored_games"], 1)
            self.assertEqual(
                payload["lineup_context"]["DET@BOS"]["away_lineup_verification"]["verification_level"],
                "confirmed_api_rotowire",
            )
            self.assertEqual(
                payload["lineup_context"]["DET@BOS"]["away_lineup_verification"]["provider_results"]["rotowire"]["status"],
                "matched",
            )
            self.assertEqual(
                payload["lineup_context"]["DET@BOS"]["weather_issue_codes"],
                ["weather_live_missing", "weather_fallback_conservative"],
            )
            self.assertEqual(
                payload["lineup_context"]["DET@BOS"]["weather_provider_path"],
                ["open_meteo", "fallback_neutral"],
            )


class FeatureResolutionTests(unittest.TestCase):
    @staticmethod
    def _rotowire_game(*, players=None, pitcher_name="", confirmed=True):
        side = SimpleNamespace(
            confirmed=confirmed,
            players=players or [],
            pitcher_name=pitcher_name,
        )
        return SimpleNamespace(away_side=side, home_side=side)

    @staticmethod
    def _fangraphs_game(*, players=None, pitcher_name=""):
        side = SimpleNamespace(
            players=players or [],
            pitcher_name=pitcher_name,
        )
        return SimpleNamespace(away_side=side, home_side=side)

    def test_choose_lineup_side_accepts_fangraphs_when_rotowire_missing(self):
        fangraphs_game = self._fangraphs_game(players=[{"name": "Player One"}, {"name": "Player Two"}])
        players, label, issues, meta = features.choose_lineup_side(
            "DET",
            [
                {"id": 1, "name": "Player One", "pos": "SS"},
                {"id": 2, "name": "Player Two", "pos": "CF"},
            ],
            [],
            "Projected",
            None,
            "away",
            {},
            allow_canvas_fallback=False,
            fangraphs_game=fangraphs_game,
        )
        self.assertEqual(label, "Confirmed (MLB API + FanGraphs)")
        self.assertEqual(issues, [])
        self.assertEqual(meta["selected_source"], "mlb_stats_api")
        self.assertEqual(meta["verification_level"], "confirmed_api_fangraphs")
        self.assertEqual(meta["provider_path"], ["mlb_stats_api", "fangraphs_lineup_tracker"])
        self.assertEqual(meta["provider_results"]["rotowire"]["status"], "missing")
        self.assertEqual(meta["provider_results"]["fangraphs"]["status"], "matched")
        self.assertEqual(len(players), 2)

    def test_starter_verification_metadata_accepts_fangraphs_when_rotowire_missing(self):
        fangraphs_game = self._fangraphs_game(pitcher_name="Tarik Skubal")
        meta = features.starter_verification_metadata(
            {"id": 1, "name": "Tarik Skubal"},
            None,
            "away",
            fangraphs_game=fangraphs_game,
        )
        self.assertEqual(meta["verification_level"], "confirmed_api_fangraphs")
        self.assertEqual(meta["provider_path"], ["mlb_stats_api", "fangraphs_probables_grid"])
        self.assertEqual(meta["issue_codes"], [])
        self.assertEqual(meta["provider_results"]["rotowire"]["status"], "missing")
        self.assertEqual(meta["provider_results"]["fangraphs"]["status"], "matched")

    def test_choose_lineup_side_records_provider_disagreement_without_failing_match(self):
        rotowire_game = self._rotowire_game(
            players=[{"name": "Player One"}, {"name": "Player Two"}],
            confirmed=True,
        )
        fangraphs_game = self._fangraphs_game(players=[{"name": "Player One"}, {"name": "Different Two"}])
        _, label, issues, meta = features.choose_lineup_side(
            "DET",
            [
                {"id": 1, "name": "Player One", "pos": "SS"},
                {"id": 2, "name": "Player Two", "pos": "CF"},
            ],
            [],
            "Projected",
            rotowire_game,
            "away",
            {},
            allow_canvas_fallback=False,
            fangraphs_game=fangraphs_game,
        )
        self.assertEqual(label, "Confirmed (MLB API + RotoWire)")
        self.assertEqual(issues, [])
        self.assertEqual(meta["verification_level"], "confirmed_api_rotowire")
        self.assertEqual(meta["provider_results"]["fangraphs"]["status"], "mismatch")
        self.assertIn("fangraphs_lineup_mismatch", meta["provider_results"]["fangraphs"]["issue_codes"])

    def test_missing_secondary_verifiers_return_aggregate_verification_failures(self):
        _, _, lineup_issues, lineup_meta = features.choose_lineup_side(
            "DET",
            [
                {"id": 1, "name": "Player One", "pos": "SS"},
                {"id": 2, "name": "Player Two", "pos": "CF"},
            ],
            [],
            "Projected",
            None,
            "away",
            {},
            allow_canvas_fallback=False,
        )
        starter_issues = features.starter_matches({"id": 1, "name": "Tarik Skubal"}, None, "away")
        starter_meta = features.starter_verification_metadata({"id": 1, "name": "Tarik Skubal"}, None, "away")
        self.assertEqual(lineup_issues, ["lineup_verification_missing"])
        self.assertEqual(lineup_meta["verification_level"], "posted_api_only")
        self.assertEqual(starter_issues, ["starter_verification_missing"])
        self.assertEqual(starter_meta["verification_level"], "api_only_verification_missing")


# --- inputs tests -----------------------------------------------------------

class SlateInputsTests(unittest.TestCase):
    def test_load_slate_inputs_real_module(self):
        loaded = inputs.load_slate_inputs("apr20")
        self.assertEqual(loaded.slug, "apr20")
        self.assertEqual(loaded.report_date, "2026-04-20")
        self.assertEqual(loaded.canvas_slug, "apr20")
        self.assertTrue(loaded.canvas_path.name.endswith("mlb-pregame-intel-apr20.canvas.tsx"))
        self.assertIsInstance(loaded.game_specs, list)
        self.assertTrue(callable(loaded.make_sp_profile))

    def test_load_slate_inputs_requires_exports(self):
        fake = SimpleNamespace(
            __name__="models.fake_inputs",
            REPORT_DATE="2026-04-21",
            CANVAS_SLUG="apr21",
            GAME_SPECS=[],
        )
        with mock.patch("pipeline.inputs.importlib.import_module", return_value=fake):
            with self.assertRaises(AttributeError):
                inputs.load_slate_inputs("fake")

    def test_load_slate_inputs_checks_basic_types(self):
        fake = SimpleNamespace(
            __name__="models.fake_inputs",
            REPORT_DATE="2026-04-21",
            CANVAS_SLUG="apr21",
            GAME_SPECS={},
            make_sp_profile=lambda x: x,
        )
        with mock.patch("pipeline.inputs.importlib.import_module", return_value=fake):
            with self.assertRaises(TypeError):
                inputs.load_slate_inputs("fake")


# --- status tests -----------------------------------------------------------

class StatusTests(unittest.TestCase):
    def test_run_environment_label(self):
        self.assertEqual(status.run_environment_label(None), "Medium")
        self.assertEqual(status.run_environment_label(1.10), "High")
        self.assertEqual(status.run_environment_label(1.02), "Medium-High")
        self.assertEqual(status.run_environment_label(0.95), "Low")
        self.assertEqual(status.run_environment_label(0.98), "Low-Medium")
        self.assertEqual(status.run_environment_label(1.00), "Medium")

    def test_innings_text_to_outs(self):
        self.assertEqual(status.innings_text_to_outs(""), 0)
        self.assertEqual(status.innings_text_to_outs("6"), 18)
        self.assertEqual(status.innings_text_to_outs("6.1"), 19)
        self.assertEqual(status.innings_text_to_outs("6.2"), 20)

    def test_summarize_game_status_pregame(self):
        game = {
            "teams": {
                "away": {"team": {"abbreviation": "DET"}},
                "home": {"team": {"abbreviation": "BOS"}},
            },
            "status": {"abstractGameState": "Preview", "detailedState": "Scheduled"},
            "linescore": {},
        }
        out = status.summarize_game_status(game)
        self.assertEqual(out["game_status_bucket"], "pregame")
        self.assertEqual(out["game_state"], "Yet To Begin")
        self.assertIsNone(out["away_score"])
        self.assertEqual(out["game_status_note"], "Yet to begin")

    def test_summarize_game_status_live(self):
        game = {
            "teams": {
                "away": {"team": {"abbreviation": "NYY"}},
                "home": {"team": {"abbreviation": "HOU"}},
            },
            "status": {"abstractGameState": "Live", "detailedState": "In Progress"},
            "linescore": {
                "inningState": "Top",
                "currentInningOrdinal": "5th",
                "teams": {"away": {"runs": 2}, "home": {"runs": 3}},
            },
        }
        out = status.summarize_game_status(game)
        self.assertEqual(out["game_status_bucket"], "live")
        self.assertEqual(out["game_state"], "Live")
        self.assertEqual(out["inning_label"], "Top 5th")
        self.assertEqual(out["away_score"], 2)
        self.assertEqual(out["home_score"], 3)
        self.assertIn("Top 5th", out["game_status_note"])

    def test_summarize_game_status_final(self):
        game = {
            "teams": {
                "away": {"team": {"abbreviation": "LAD"}},
                "home": {"team": {"abbreviation": "COL"}},
            },
            "status": {"abstractGameState": "Final", "detailedState": "Final"},
            "linescore": {"teams": {"away": {"runs": 7}, "home": {"runs": 4}}},
        }
        out = status.summarize_game_status(game)
        self.assertEqual(out["game_status_bucket"], "final")
        self.assertEqual(out["away_score"], 7)
        self.assertIn("LAD 7", out["game_status_note"])


# --- back-compat shims on apr16_compute -------------------------------------

class Apr16ComputeBackCompatTests(unittest.TestCase):
    def test_reexports_still_present(self):
        import apr16_compute as ac
        for name in (
            "run_slate_pipeline",
            "run_apr16_pipeline",
            "bind_slate_inputs",
            "fetch_schedule_lineups",
            "write_run_snapshot",
            "parse_canvas_games",
            "summarize_prop_market_coverage",
            "classify_hr_market_status",
            "classify_tb_market_status",
            "choose_recommended_prop",
            "summarize_game_status",
            "summarize_snapshot_evaluation",
            "render_lineup_rows",
            "render_prop_rows",
            "replace_marker_region",
            "SCORING_STATUS_SCORED",
            "SCORING_STATUS_NOT_SCORED",
            "HR_EDGE_GATE_PCT",
            "TB_EDGE_GATE_PCT",
            "TB_TARGET_LINE",
        ):
            self.assertTrue(hasattr(ac, name), f"apr16_compute should still expose {name}")

    def test_bind_slate_inputs_still_populates_globals(self):
        import apr16_compute as ac

        ac.bind_slate_inputs("apr20")

        self.assertEqual(ac.REPORT_DATE, "2026-04-20")
        self.assertTrue(ac.CANVAS.name.endswith("mlb-pregame-intel-apr20.canvas.tsx"))
        self.assertIsInstance(ac.GAME_SPECS, list)
        self.assertTrue(callable(ac.make_sp_profile))

    def test_resolve_weather_with_fallback_returns_neutral_snapshot_on_provider_failure(self):
        import apr16_compute as ac

        schedule_game = {
            "venue_name": "Fenway Park",
            "home_location_name": "Boston",
            "roof_type": "Open",
            "game_date_utc": "2026-04-21T23:10:00Z",
        }
        with mock.patch("apr16_compute.fetch_weather_snapshot", side_effect=RuntimeError("boom")):
            snapshot, issue_codes, meta = ac.resolve_weather_with_fallback(schedule_game)

        self.assertEqual(snapshot.source, "Fallback")
        self.assertEqual(snapshot.run_factor, 1.0)
        self.assertIn("weather_live_missing", issue_codes)
        self.assertIn("weather_provider_exception", issue_codes)
        self.assertIn("weather_fallback_conservative", issue_codes)
        self.assertEqual(meta["provider_path"], ["open_meteo", "fallback_neutral"])
        self.assertEqual(meta["resolution_source"], "fallback_neutral")

    def test_resolve_weather_with_fallback_preserves_open_meteo_success_path(self):
        import apr16_compute as ac

        schedule_game = {
            "venue_name": "Fenway Park",
            "home_location_name": "Boston",
            "roof_type": "Open",
            "game_date_utc": "2026-04-21T23:10:00Z",
        }
        fake_snapshot = SimpleNamespace(source="Open-Meteo", run_factor=0.99)
        with mock.patch("apr16_compute.fetch_weather_snapshot", return_value=fake_snapshot):
            snapshot, issue_codes, meta = ac.resolve_weather_with_fallback(schedule_game)

        self.assertIs(snapshot, fake_snapshot)
        self.assertEqual(issue_codes, [])
        self.assertEqual(meta["provider_path"], ["open_meteo"])
        self.assertEqual(meta["resolution_source"], "open_meteo")


if __name__ == "__main__":
    unittest.main()
