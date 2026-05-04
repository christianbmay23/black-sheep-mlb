from __future__ import annotations

import csv
import json
import tempfile
import unittest
from pathlib import Path

from black_sheep_mlb.data_sources.mlb_stats_client import MLBGame
from black_sheep_mlb.pipelines.echoiq_slate import (
    BATTER_PROP_COLUMNS,
    BETTING_VALUE_COLUMNS,
    FINAL_CARD_COLUMNS,
    GAME_PROJECTION_COLUMNS,
    HR_COLUMNS,
    PITCHER_PROP_COLUMNS,
    RAW_TOTAL_COLUMNS,
    RAW_WINNER_COLUMNS,
    run_echoiq_slate,
)


class EchoIQSlateTests(unittest.TestCase):
    def test_echoiq_outputs_all_required_files_without_fabricating_missing_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "reports" / "2026-04-24"
            summary = run_echoiq_slate(
                date="2026-04-24",
                output_dir=out,
                mlb_client=_FakeMLBClient(),
                enrichment_client=_FakePyBaseballClient(),
            )

            self.assertEqual(summary["number_of_games"], 1)
            expected = [
                "echoiq_mlb_slate_report.md",
                "echoiq_mlb_slate.json",
                "game_projections.csv",
                "raw_winner_board.csv",
                "raw_total_board.csv",
                "total_bases_board.csv",
                "hr_board.csv",
                "pitcher_prop_board.csv",
                "betting_value_board.csv",
                "final_betting_card.csv",
                "late_verification_checklist.md",
                "source_log.csv",
                "unresolved_gaps.csv",
            ]
            for name in expected:
                self.assertTrue((out / name).exists(), name)

            payload = json.loads((out / "echoiq_mlb_slate.json").read_text(encoding="utf-8"))
            self.assertEqual(payload["game_projections"][0]["weather_status"], "unavailable")
            self.assertIn("odds_unavailable", _read_csv(out / "betting_value_board.csv")[0]["risk_flags"])
            self.assertEqual(_read_csv(out / "hr_board.csv"), [])
            self.assertEqual(_read_csv(out / "total_bases_board.csv"), [])

            report = (out / "echoiq_mlb_slate_report.md").read_text(encoding="utf-8")
            for section in [
                "## A. Executive Summary",
                "## B. Slate Verification Table",
                "## C. Game Projection Table",
                "## D. Raw Winner Probability Board",
                "## E. Raw Total / Run Environment Board",
                "## F. Raw Total Bases Prediction Board",
                "## G. Raw Home Run Probability Board",
                "## H. Pitcher Prop Projection Board",
                "## I. Game-by-Game Capsules",
                "## J. Deep Dives on Best Research Edges",
                "## K. Deep Dives on Best Betting Values",
                "## L. Likely But Overpriced Board",
                "## M. Final Betting Card",
                "## N. Late Information Checklist",
                "## O. Validation / Missing Data Notes",
                "## P. If I Could Only Bet Three Things",
            ]:
                self.assertIn(section, report)

    def test_echoiq_csv_headers_match_contract(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            run_echoiq_slate(
                date="2026-04-24",
                output_dir=out,
                mlb_client=_FakeMLBClient(),
                enrichment_client=_FakePyBaseballClient(),
            )

            expected_headers = {
                "game_projections.csv": GAME_PROJECTION_COLUMNS,
                "raw_winner_board.csv": RAW_WINNER_COLUMNS,
                "raw_total_board.csv": RAW_TOTAL_COLUMNS,
                "total_bases_board.csv": BATTER_PROP_COLUMNS,
                "hr_board.csv": HR_COLUMNS,
                "pitcher_prop_board.csv": PITCHER_PROP_COLUMNS,
                "betting_value_board.csv": BETTING_VALUE_COLUMNS,
                "final_betting_card.csv": FINAL_CARD_COLUMNS,
            }
            for filename, columns in expected_headers.items():
                with (out / filename).open(newline="", encoding="utf-8") as handle:
                    self.assertEqual(next(csv.reader(handle)), columns)

    def test_single_game_filter_limits_slate(self):
        with tempfile.TemporaryDirectory() as tmp:
            summary = run_echoiq_slate(
                date="2026-04-24",
                output_dir=Path(tmp),
                away="New York Yankees",
                home="Boston Red Sox",
                mlb_client=_FakeMLBClient(two_games=True),
                enrichment_client=_FakePyBaseballClient(),
            )

            self.assertEqual(summary["number_of_games"], 1)
            rows = _read_csv(Path(tmp) / "game_projections.csv")
            self.assertEqual(rows[0]["game"], "New York Yankees@Boston Red Sox")

    def test_manual_csv_inputs_populate_boards_source_log_and_final_card(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            files = _write_manual_files(base)
            out = base / "out"

            run_echoiq_slate(
                date="2026-04-24",
                output_dir=out,
                mlb_client=_FakeMLBClient(),
                enrichment_client=_FakePyBaseballClient(),
                manual_odds_csv=files["odds"],
                manual_props_csv=files["props"],
                manual_weather_csv=files["weather"],
                manual_ballpark_csv=files["ballpark"],
                manual_lineups_csv=files["lineups"],
            )

            tb_rows = _read_csv(out / "total_bases_board.csv")
            hr_rows = _read_csv(out / "hr_board.csv")
            pitcher_rows = _read_csv(out / "pitcher_prop_board.csv")
            value_rows = _read_csv(out / "betting_value_board.csv")
            final_rows = _read_csv(out / "final_betting_card.csv")
            source_rows = _read_csv(out / "source_log.csv")
            gap_rows = _read_csv(out / "unresolved_gaps.csv")

            self.assertEqual(tb_rows[0]["player"], "Aaron Judge")
            self.assertEqual(hr_rows[0]["player"], "Aaron Judge")
            self.assertEqual(pitcher_rows[0]["pitcher"], "Home Starter")
            self.assertTrue(any(row["final_recommendation"] == "GOOD_VALUE" for row in value_rows))
            self.assertTrue(any(row["selection"] == "Aaron Judge" for row in final_rows))
            self.assertTrue(any(row["data_type"] == "props" and row["rows_used"] == "3" for row in source_rows))
            self.assertTrue(any(row["missing_data_type"] == "ballpark_pal" for row in gap_rows) is False)

            payload = json.loads((out / "echoiq_mlb_slate.json").read_text(encoding="utf-8"))
            self.assertEqual(payload["game_verification"][0]["lineup_status"], "confirmed")
            self.assertEqual(payload["game_verification"][0]["weather_status"], "manual")
            self.assertEqual(payload["environment_board"][0]["hr_environment_grade"], "favorable")

    def test_manual_props_without_odds_do_not_enter_final_card(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            files = _write_manual_files(base)
            out = base / "out"

            run_echoiq_slate(
                date="2026-04-24",
                output_dir=out,
                mlb_client=_FakeMLBClient(),
                enrichment_client=_FakePyBaseballClient(),
                manual_props_csv=files["props_no_prices"],
                manual_weather_csv=files["weather"],
                manual_ballpark_csv=files["ballpark"],
                manual_lineups_csv=files["lineups"],
            )

            self.assertEqual(_read_csv(out / "final_betting_card.csv"), [])
            self.assertEqual(_read_csv(out / "total_bases_board.csv")[0]["recommendation"], "STRONG_MATCHUP")

    def test_missing_optional_manual_files_do_not_fail(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"

            summary = run_echoiq_slate(
                date="2026-04-24",
                output_dir=out,
                mlb_client=_FakeMLBClient(),
                enrichment_client=_FakePyBaseballClient(),
                manual_odds_csv=Path(tmp) / "missing_odds.csv",
                manual_props_csv=Path(tmp) / "missing_props.csv",
                manual_weather_csv=Path(tmp) / "missing_weather.csv",
                manual_ballpark_csv=Path(tmp) / "missing_ballpark.csv",
                manual_lineups_csv=Path(tmp) / "missing_lineups.csv",
            )

            self.assertEqual(summary["number_of_games"], 1)
            self.assertEqual(_read_csv(out / "hr_board.csv"), [])

    def test_bad_manual_columns_raise_clear_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            bad_props = Path(tmp) / "props.csv"
            _write_csv(
                bad_props,
                ["date", "player", "team", "prop_type", "source", "timestamp", "confidence"],
                [{"date": "2026-04-24", "player": "Aaron Judge", "team": "New York Yankees", "prop_type": "total_bases", "source": "manual", "timestamp": "2026-04-24T10:00:00Z", "confidence": "High"}],
            )

            with self.assertRaisesRegex(ValueError, "game identifier"):
                run_echoiq_slate(
                    date="2026-04-24",
                    output_dir=Path(tmp) / "out",
                    mlb_client=_FakeMLBClient(),
                    enrichment_client=_FakePyBaseballClient(),
                    manual_props_csv=bad_props,
                )

    def test_json_inputs_override_matching_csv_dataset(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            files = _write_manual_files(base)
            json_path = base / "echoiq_inputs.json"
            json_path.write_text(
                json.dumps(
                    {
                        "props": [
                            {
                                "date": "2026-04-24",
                                "game_id": "123",
                                "away_team": "New York Yankees",
                                "home_team": "Boston Red Sox",
                                "player": "Juan Soto",
                                "team": "New York Yankees",
                                "opponent": "Boston Red Sox",
                                "prop_type": "total_bases",
                                "line": "1.5",
                                "over_price": "+110",
                                "under_price": "-130",
                                "raw_probability": "0.58",
                                "source": "json example",
                                "source_url": "",
                                "timestamp": "2026-04-24T11:00:00Z",
                                "confidence": "High",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )

            out = base / "out"
            run_echoiq_slate(
                date="2026-04-24",
                output_dir=out,
                mlb_client=_FakeMLBClient(),
                enrichment_client=_FakePyBaseballClient(),
                manual_props_csv=files["props"],
                manual_inputs_json=json_path,
            )

            self.assertEqual(_read_csv(out / "total_bases_board.csv")[0]["player"], "Juan Soto")


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def _write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _write_manual_files(base: Path) -> dict[str, Path]:
    common = {
        "date": "2026-04-24",
        "game_id": "123",
        "away_team": "New York Yankees",
        "home_team": "Boston Red Sox",
        "source": "manual test",
        "source_url": "https://example.test/source",
        "timestamp": "2026-04-24T10:00:00Z",
        "confidence": "High",
    }
    odds = base / "odds.csv"
    _write_csv(
        odds,
        ["date", "game_id", "away_team", "home_team", "selection", "market_type", "sportsbook", "consensus_price", "best_price", "opening_price", "current_price", "line", "model_probability", "source", "source_url", "timestamp", "confidence"],
        [{**common, "selection": "New York Yankees", "market_type": "moneyline", "sportsbook": "manual", "consensus_price": "+120", "best_price": "+125", "opening_price": "+115", "current_price": "+125", "line": "", "model_probability": "0.56"}],
    )
    props = base / "props.csv"
    prop_fields = ["date", "game_id", "away_team", "home_team", "player", "team", "opponent", "prop_type", "line", "over_price", "under_price", "sportsbook", "consensus_price", "best_price", "raw_probability", "reason", "source", "source_url", "timestamp", "confidence"]
    _write_csv(
        props,
        prop_fields,
        [
            {**common, "player": "Aaron Judge", "team": "New York Yankees", "opponent": "Boston Red Sox", "prop_type": "total_bases", "line": "1.5", "over_price": "+130", "under_price": "-150", "sportsbook": "manual", "consensus_price": "+125", "best_price": "+130", "raw_probability": "0.62", "reason": "manual Statcast edge"},
            {**common, "player": "Aaron Judge", "team": "New York Yankees", "opponent": "Boston Red Sox", "prop_type": "home_runs", "line": "0.5", "over_price": "+420", "under_price": "-600", "sportsbook": "manual", "consensus_price": "+400", "best_price": "+420", "raw_probability": "0.23", "reason": "manual HR edge"},
            {**common, "player": "Home Starter", "team": "Boston Red Sox", "opponent": "New York Yankees", "prop_type": "pitcher_strikeouts", "line": "5.5", "over_price": "+105", "under_price": "-125", "sportsbook": "manual", "consensus_price": "+100", "best_price": "+105", "raw_probability": "0.54", "reason": "manual K projection"},
        ],
    )
    props_no_prices = base / "props_no_prices.csv"
    _write_csv(
        props_no_prices,
        prop_fields,
        [{**common, "player": "Aaron Judge", "team": "New York Yankees", "opponent": "Boston Red Sox", "prop_type": "total_bases", "line": "1.5", "over_price": "", "under_price": "", "sportsbook": "", "consensus_price": "", "best_price": "", "raw_probability": "0.62", "reason": "manual raw edge"}],
    )
    weather = base / "weather.csv"
    _write_csv(
        weather,
        ["date", "game_id", "away_team", "home_team", "venue", "temperature", "wind_speed", "wind_direction", "wind_effect", "humidity", "dew_point", "precipitation_risk", "roof_status", "delay_risk", "source", "source_url", "timestamp", "confidence"],
        [{**common, "venue": "Fenway Park", "temperature": "78", "wind_speed": "9", "wind_direction": "out to LF", "wind_effect": "boost out", "humidity": "55", "dew_point": "60", "precipitation_risk": "5", "roof_status": "open-air", "delay_risk": "low"}],
    )
    ballpark = base / "ballpark_pal.csv"
    _write_csv(
        ballpark,
        ["date", "game_id", "away_team", "home_team", "venue", "run_factor", "hr_factor", "weather_factor", "air_density", "carry_grade", "rh_hr_factor", "lh_hr_factor", "notes", "source", "source_url", "timestamp", "confidence"],
        [{**common, "venue": "Fenway Park", "run_factor": "1.07", "hr_factor": "1.12", "weather_factor": "1.06", "air_density": "low", "carry_grade": "A", "rh_hr_factor": "1.14", "lh_hr_factor": "1.08", "notes": "Ballpark Pal HR factor boosts RH power"}],
    )
    lineups = base / "lineups.csv"
    _write_csv(
        lineups,
        ["date", "game_id", "away_team", "home_team", "team", "player", "batting_order", "position", "handedness", "lineup_status", "source", "source_url", "timestamp", "confidence"],
        [{**common, "team": "New York Yankees", "player": "Aaron Judge", "batting_order": "2", "position": "RF", "handedness": "R", "lineup_status": "confirmed"}],
    )
    return {
        "odds": odds,
        "props": props,
        "props_no_prices": props_no_prices,
        "weather": weather,
        "ballpark": ballpark,
        "lineups": lineups,
    }


class _FakeMLBClient:
    def __init__(self, two_games: bool = False):
        self.two_games = two_games

    def get_schedule(self, date: str) -> list[MLBGame]:
        games = [
            _game(
                game_pk=123,
                game_date=date,
                game_datetime=f"{date}T20:00:00Z",
                away_team="New York Yankees",
                home_team="Boston Red Sox",
                away_team_id=10,
                home_team_id=20,
                away_probable_pitcher="Away Starter",
                home_probable_pitcher="Home Starter",
                away_probable_pitcher_id=11,
                home_probable_pitcher_id=22,
                status="Scheduled",
                venue="Fenway Park",
            )
        ]
        if self.two_games:
            games.append(
                _game(
                    game_pk=456,
                    game_date=date,
                    game_datetime=f"{date}T23:00:00Z",
                    away_team="Baltimore Orioles",
                    home_team="Toronto Blue Jays",
                    status="Scheduled",
                    venue="Rogers Centre",
                )
            )
        return games


def _game(**kwargs) -> MLBGame:
    venue = kwargs.pop("venue", None)
    game = MLBGame(**kwargs)
    game.venue = venue
    return game


class _FakeFrame:
    shape = (1, 1)


class _FakePyBaseballClient:
    def get_batting_stats(self, season: int) -> _FakeFrame:
        return _FakeFrame()

    def get_pitching_stats(self, season: int) -> _FakeFrame:
        return _FakeFrame()
