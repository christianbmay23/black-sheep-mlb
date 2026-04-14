from pydantic import BaseModel, Field


class MoneylinePrediction(BaseModel):
    game_id: str
    recommended_side: str
    model_win_probability: float = Field(ge=0, le=1)
    implied_probability: float = Field(ge=0, le=1)
    edge: float
    confidence_tier: str
    explanation: str
    risk_flags: list[str]
