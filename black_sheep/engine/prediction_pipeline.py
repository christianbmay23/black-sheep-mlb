from black_sheep.features import build_game_features
from black_sheep.models import MoneylineModel
from black_sheep.reasoning import build_risk_flags, confidence_tier, generate_moneyline_explanation
from black_sheep.schemas import MoneylinePrediction
from black_sheep.utils.odds import american_to_implied_prob


def run_prediction_pipeline(game: dict) -> MoneylinePrediction:
    features = build_game_features(game)
    model = MoneylineModel()
    model_outputs = model.predict(features)

    away_prob = model_outputs["away_probability"]
    home_prob = model_outputs["home_probability"]

    away_implied = american_to_implied_prob(game["away_moneyline"])
    home_implied = american_to_implied_prob(game["home_moneyline"])

    away_edge = away_prob - away_implied
    home_edge = home_prob - home_implied

    if away_edge >= home_edge:
        side = game["away_team"]
        model_probability = away_prob
        fair_odds = model_outputs["away_fair_odds"]
        market_odds = game["away_moneyline"]
        edge = away_edge
    else:
        side = game["home_team"]
        model_probability = home_prob
        fair_odds = model_outputs["home_fair_odds"]
        market_odds = game["home_moneyline"]
        edge = home_edge

    confidence = confidence_tier(edge)
    risk_flags = build_risk_flags(game, edge, features)
    explanation = generate_moneyline_explanation(game, features, model_probability, edge, side, market_odds)

    return MoneylinePrediction(
        game_id=game["game_id"],
        recommended_side=side,
        model_probability=model_probability,
        fair_odds=fair_odds,
        market_odds=market_odds,
        edge=edge,
        confidence_tier=confidence,
        feature_breakdown={
            "starter_edge": features["starter_edge"],
            "bullpen_edge": features["bullpen_edge"],
            "lineup_edge": features["lineup_edge"],
            "park_weather_edge": features["park_weather_edge"],
            "volatility_score": features["volatility_score"],
            "data_quality_score": features["data_quality_score"],
            "feature_notes": features["feature_notes"],
        },
        explanation=explanation,
        risk_flags=risk_flags,
    )
