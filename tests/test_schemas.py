from black_sheep.schemas.game_schema import Game


def test_game_schema_parses() -> None:
    game = Game(
        game_id="g1",
        date="2026-04-14",
        home_team="BOS",
        away_team="NYY",
        venue="Fenway",
        home_starting_pitcher="A",
        away_starting_pitcher="B",
        home_bullpen_era=3.9,
        away_bullpen_era=3.5,
        home_lineup_wrc_plus=99,
        away_lineup_wrc_plus=112,
        home_pitcher_era=3.8,
        away_pitcher_era=3.2,
        temperature_f=61,
        wind_mph=7,
        wind_out=False,
        home_moneyline=120,
        away_moneyline=-135,
    )
    assert game.home_team == "BOS"
