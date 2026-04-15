from pydantic import BaseModel, Field


class MoneylinePrediction(BaseModel):
    game_id: str
    recommended_side: str
    model_probability: float = Field(ge=0, le=1)
    fair_odds: int
    market_odds: int
    edge: float
    confidence_tier: str
    feature_breakdown: dict
    explanation: str
    risk_flags: list[str]
