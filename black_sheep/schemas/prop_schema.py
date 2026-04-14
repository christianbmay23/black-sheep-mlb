from pydantic import BaseModel


class PlayerProp(BaseModel):
    game_id: str
    player_name: str
    market: str
    line: float
    odds: int
