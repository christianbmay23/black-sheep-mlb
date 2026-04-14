from black_sheep.engine.prediction_pipeline import run_prediction_pipeline


def test_prediction_pipeline_returns_valid_output() -> None:
    game = {
        "game_id": "g1",
        "date": "2026-04-14",
        "home_team": "BOS",
        "away_team": "NYY",
        "venue": "Fenway",
        "home_starting_pitcher": "A",
        "away_starting_pitcher": "B",
        "home_bullpen_era": 3.9,
        "away_bullpen_era": 3.4,
        "home_lineup_wrc_plus": 101,
        "away_lineup_wrc_plus": 115,
        "home_pitcher_era": 3.7,
        "away_pitcher_era": 3.2,
        "temperature_f": 65,
        "wind_mph": 8,
        "wind_out": False,
        "home_moneyline": 125,
        "away_moneyline": -140,
    }
    prediction = run_prediction_pipeline(game)
    assert prediction.game_id == "g1"
    assert 0 <= prediction.model_win_probability <= 1
