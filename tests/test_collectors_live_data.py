import subprocess
import sys

from black_sheep.collectors.mlb_stats import MLBStatsCollector
from black_sheep.collectors.odds_api import OddsApiCollector


def test_normalize_odds_event() -> None:
    collector = OddsApiCollector(api_key="demo")
    raw_event = {
        "id": "evt-1",
        "home_team": "Boston Red Sox",
        "away_team": "New York Yankees",
        "bookmakers": [
            {
                "key": "fanduel",
                "last_update": "2026-04-14T12:00:00Z",
                "markets": [
                    {
                        "key": "h2h",
                        "outcomes": [
                            {"name": "Boston Red Sox", "price": 120},
                            {"name": "New York Yankees", "price": -135},
                        ],
                    },
                    {
                        "key": "totals",
                        "outcomes": [
                            {"name": "Over", "point": 8.5, "price": -110},
                            {"name": "Under", "point": 8.5, "price": -110},
                        ],
                    },
                ],
            }
        ],
    }

    normalized = collector.normalize_odds_event(raw_event)
    assert normalized["home_moneyline"] == 120
    assert normalized["away_moneyline"] == -135
    assert normalized["total"] == 8.5
    assert normalized["over_price"] == -110
    assert normalized["under_price"] == -110


def test_match_odds_to_game_normalized_team_names() -> None:
    collector = OddsApiCollector(api_key="demo")
    game = {"home_team": "Boston Red Sox", "away_team": "New York Yankees", "home_moneyline": 130, "away_moneyline": -145}
    odds_events = [
        {
            "home_team": "Boston Red Sox",
            "away_team": "New York Yankees",
            "home_moneyline": 125,
            "away_moneyline": -140,
            "total": 9.0,
            "over_price": -105,
            "under_price": -115,
            "bookmaker": "draftkings",
            "last_update": "2026-04-14T11:30:00Z",
        }
    ]

    merged = collector.attach_market_odds(game, odds_events)
    assert merged["home_moneyline"] == 125
    assert merged["away_moneyline"] == -140
    assert merged["market"]["total"] == 9.0


def test_match_odds_to_game_fuzzy_fallback() -> None:
    collector = OddsApiCollector(api_key="demo")
    game = {"home_team": "BOS Red Sox", "away_team": "NYY Yankees", "home_moneyline": 130, "away_moneyline": -145}
    odds_events = [
        {
            "home_team": "Boston Red Sox",
            "away_team": "New York Yankees",
            "home_moneyline": 122,
            "away_moneyline": -132,
        }
    ]

    merged = collector.attach_market_odds(game, odds_events)
    assert merged["home_moneyline"] == 122
    assert merged["away_moneyline"] == -132


def test_mlb_schedule_normalization() -> None:
    collector = MLBStatsCollector()
    raw_game = {
        "gamePk": 778899,
        "officialDate": "2026-04-14",
        "venue": {"name": "Fenway Park"},
        "teams": {
            "home": {"team": {"name": "Boston Red Sox"}, "probablePitcher": {"fullName": "Tanner Houck"}},
            "away": {"team": {"name": "New York Yankees"}, "probablePitcher": {"fullName": "Gerrit Cole"}},
        },
    }

    normalized = collector.normalize_game(raw_game)
    assert normalized["game_id"] == "778899"
    assert normalized["home_team"] == "Boston Red Sox"
    assert normalized["away_starting_pitcher"] == "Gerrit Cole"


def test_mlb_fallback_when_api_fails() -> None:
    collector = MLBStatsCollector()
    collector.fetch_schedule = lambda _: (_ for _ in ()).throw(RuntimeError("boom"))
    games = collector.get_games_for_date("2026-04-14", use_live=True)
    assert len(games) == 1
    assert games[0]["game_id"] == "2026-04-14-NYY-BOS"


def test_script_runs_demo_mode() -> None:
    cmd = [sys.executable, "scripts/run_daily_slate.py", "--date", "2026-04-14", "--demo"]
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    assert result.returncode == 0
    assert "Ran slate for 2026-04-14 (demo)." in result.stdout


def test_live_feed_extractors_fallback_when_missing() -> None:
    collector = MLBStatsCollector()
    collector.fetch_live_feed = lambda _gid: {}

    pitcher = collector.extract_pitcher_stats("123", "Home Pitcher", "Away Pitcher")
    context = collector.extract_team_records_or_context("123")

    assert pitcher["home_pitcher_era"] == 4.0
    assert pitcher["away_pitcher_era"] == 4.0
    assert pitcher["home_starter_handedness"] == "U"
    assert context["home_team_win_pct"] == 0.5
    assert context["away_team_win_pct"] == 0.5
