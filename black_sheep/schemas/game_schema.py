from pydantic import BaseModel, Field


class Game(BaseModel):
    game_id: str
    date: str
    home_team: str
    away_team: str
    venue: str
    home_starting_pitcher: str
    away_starting_pitcher: str
    home_bullpen_era: float = Field(ge=0)
    away_bullpen_era: float = Field(ge=0)
    home_lineup_wrc_plus: float = Field(gt=0)
    away_lineup_wrc_plus: float = Field(gt=0)
    home_pitcher_era: float = Field(ge=0)
    away_pitcher_era: float = Field(ge=0)
    temperature_f: float
    wind_mph: float = Field(ge=0)
    wind_out: bool
    home_moneyline: int
    away_moneyline: int
