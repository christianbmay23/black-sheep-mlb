"""Tests for read-only dashboard artifact discovery/loading."""
from __future__ import annotations

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DASHBOARD_DIR = REPO_ROOT / "dashboard"
if str(DASHBOARD_DIR) not in sys.path:
    sys.path.insert(0, str(DASHBOARD_DIR))

from app import (  # noqa: E402
    build_game_view_models,
    build_prop_view_models,
    discover_slates,
    latest_slate,
    load_slate,
    prop_market_bucket,
    summarize,
)


class DashboardArtifactTests(unittest.TestCase):
    def test_discovers_latest_snapshot_before_csv_fallback(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            old_csv = root / "mlb-pregame-intel-apr25-games.csv"
            old_csv.write_text("away,home,scoring_status\nATH,TEX,scored\n", encoding="utf-8")
            snap_dir = root / "snapshots" / "apr26"
            snap_dir.mkdir(parents=True)
            latest = snap_dir / "apr26-latest.json"
            latest.write_text(json.dumps({"slug": "apr26", "games": []}), encoding="utf-8")
            os.utime(old_csv, (100, 100))
            os.utime(latest, (200, 200))

            slates = discover_slates(root)

            self.assertEqual([slate.slug for slate in slates], ["apr26", "apr25"])
            self.assertEqual(latest_slate(root).slug, "apr26")

    def test_loads_csv_rows_and_summarizes_missing_flags(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            games = root / "mlb-pregame-intel-apr25-games.csv"
            games.write_text(
                "away,home,scoring_status,missing_data_flags\n"
                "ATH,TEX,scored,weather_live_missing;lineup_not_posted_api\n"
                "LAA,KC,data_blocked,weather_live_missing\n",
                encoding="utf-8",
            )
            props = root / "mlb-pregame-intel-apr25-batter-outlooks.csv"
            props.write_text(
                "game,team,batter,scoring_status,hr_market_integrity,market_data_status\n"
                "ATH@TEX,ATH,Example Hitter,scored,partial,partial\n",
                encoding="utf-8",
            )

            slate = latest_slate(root)
            data = load_slate(slate)
            overview = summarize(data["games"], data["props"], data["snapshot"])

            self.assertEqual(overview["games_scored"], 1)
            self.assertEqual(overview["games_blocked"], 1)
            self.assertEqual(overview["props_scored"], 1)
            self.assertEqual(overview["market_partial"], 1)
            self.assertEqual(overview["missing_flags"]["weather_live_missing"], 2)

    def test_load_slate_prefers_snapshot_rows_before_csv_fallback(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            games = root / "mlb-pregame-intel-apr26-games.csv"
            games.write_text("away,home,scoring_status\nCSV,ROW,data_blocked\n", encoding="utf-8")
            snap_dir = root / "snapshots" / "apr26"
            snap_dir.mkdir(parents=True)
            latest = snap_dir / "apr26-latest.json"
            latest.write_text(
                json.dumps(
                    {
                        "slug": "apr26",
                        "games": [{"away": "MIA", "home": "SF", "scoring_status": "scored"}],
                        "props": [],
                    }
                ),
                encoding="utf-8",
            )

            slate = latest_slate(root)
            data = load_slate(slate)

            self.assertEqual(data["games"][0]["away"], "MIA")

    def test_apr26_style_game_view_models_label_blocked_and_actionable_games(self):
        games = [
            {
                "away": "COL",
                "home": "NYM",
                "prediction": "PASS",
                "decision_tier_vs_market": "data_blocked",
                "scoring_status": "data_blocked",
                "verification_status": "Partial",
                "missing_data_flags": "lineup_not_posted_api;starter_verification_failed",
            },
            {
                "away": "SD",
                "home": "AZ",
                "prediction": "PASS",
                "decision_tier_vs_market": "data_blocked",
                "scoring_status": "data_blocked",
                "verification_status": "Partial",
                "missing_data_flags": "weather_fallback_conservative;weather_live_missing",
            },
            {
                "away": "MIA",
                "home": "SF",
                "prediction": "SF",
                "decision_tier_vs_market": "C",
                "scoring_status": "scored",
                "verification_status": "Verified",
            },
        ]
        snapshot = {
            "lineup_context": {
                "COL@NYM": {
                    "away_lineup_verification": {"verification_level": "missing", "issue_codes": ["lineup_not_posted_api"]},
                    "home_lineup_verification": {"verification_level": "missing", "issue_codes": ["lineup_not_posted_api"]},
                    "away_starter_verification": {"verification_level": "api_verification_failed", "issue_codes": ["starter_verification_failed"]},
                    "home_starter_verification": {"verification_level": "confirmed_api_fangraphs", "issue_codes": []},
                    "issues": ["hr_market_integrity_degraded"],
                    "hr_provider_path": "projection_only",
                },
                "SD@AZ": {
                    "away_lineup_verification": {"verification_level": "confirmed_api_multi_source", "issue_codes": []},
                    "home_lineup_verification": {"verification_level": "confirmed_api_multi_source", "issue_codes": []},
                    "away_starter_verification": {"verification_level": "confirmed_api_multi_source", "issue_codes": []},
                    "home_starter_verification": {"verification_level": "confirmed_api_multi_source", "issue_codes": []},
                    "issues": ["weather_fallback_conservative"],
                },
                "MIA@SF": {
                    "away_lineup_verification": {"verification_level": "confirmed_api_multi_source", "issue_codes": []},
                    "home_lineup_verification": {"verification_level": "confirmed_api_multi_source", "issue_codes": []},
                    "away_starter_verification": {"verification_level": "confirmed_api_multi_source", "issue_codes": []},
                    "home_starter_verification": {"verification_level": "confirmed_api_multi_source", "issue_codes": []},
                },
            },
            "prop_market_coverage": [
                {"game": "COL@NYM", "hr_market_integrity": "degraded", "hr_provider_path": "projection_only"},
                {"game": "SD@AZ", "hr_market_integrity": "full", "hr_provider_path": "draftkings"},
                {"game": "MIA@SF", "hr_market_integrity": "full", "hr_provider_path": "draftkings"},
            ],
        }

        props = [
            {
                "game": "SD@AZ",
                "scoring_status": "data_blocked",
                "market_data_status": "partial",
                "tb2_market_status": "line_mismatch_2.5",
            },
            {
                "game": "MIA@SF",
                "scoring_status": "scored",
                "market_data_status": "full",
                "tb2_market_status": "priced_no_edge",
            },
        ]

        rows = {row["game"]: row for row in build_game_view_models(games, snapshot, props)}

        self.assertEqual(rows["COL@NYM"]["actionability_label"], "Display Only / Data Blocked")
        self.assertEqual(rows["COL@NYM"]["lineup_status"], "Blocked")
        self.assertEqual(rows["COL@NYM"]["starter_status"], "Blocked")
        self.assertIn("projection_only", rows["COL@NYM"]["coverage_warning"])
        self.assertEqual(rows["SD@AZ"]["actionability_label"], "Display Only / Data Blocked")
        self.assertIn("weather_fallback_conservative", rows["SD@AZ"]["actionability_warning"])
        self.assertEqual(rows["SD@AZ"]["prop_market_status"], "Partial / Misaligned")
        self.assertEqual(rows["MIA@SF"]["actionability_label"], "Actionable / Scored")
        self.assertTrue(rows["MIA@SF"]["is_actionable"])

    def test_prop_view_models_surface_partial_and_misaligned_market_warnings(self):
        props = [
            {
                "game": "SD@AZ",
                "team": "SD",
                "batter": "Example",
                "scoring_status": "data_blocked",
                "hr_market_integrity": "full",
                "market_data_status": "partial",
                "hr_market_status": "priced_no_edge",
                "tb2_market_status": "line_mismatch_2.5",
            },
            {
                "game": "MIA@SF",
                "team": "SF",
                "batter": "Example 2",
                "scoring_status": "scored",
                "hr_market_integrity": "full",
                "market_data_status": "full",
                "hr_market_status": "priced_no_edge",
                "tb2_market_status": "priced_no_edge",
            },
        ]

        rows = build_prop_view_models(props)

        self.assertEqual(rows[0]["actionability_label"], "Data Blocked")
        self.assertTrue(rows[0]["has_market_warning"])
        self.assertIn("line_mismatch_2.5", rows[0]["market_warning"])
        self.assertEqual(prop_market_bucket(rows[0]), "misaligned")
        self.assertEqual(prop_market_bucket(rows[1]), "full")


if __name__ == "__main__":
    unittest.main()
