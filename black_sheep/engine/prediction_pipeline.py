from black_sheep.features import build_game_features
from black_sheep.models import MoneylineModel
from black_sheep.reasoning import build_risk_flags, confidence_tier, generate_moneyline_explanation
from black_sheep.schemas import MoneylinePrediction
from black_sheep.utils.odds import american_to_implied_prob


def run_prediction_pipeline(game: dict) -> MoneylinePrediction:
    features = build_game_features(game)
    model = MoneylineModel()
    away_prob = model.predict_away_win_probability(features)

    away_implied = american_to_implied_prob(game["away_moneyline"])
    home_implied = american_to_implied_prob(game["home_moneyline"])

    away_edge = away_prob - away_implied
    home_prob = 1 - away_prob
    home_edge = home_prob - home_implied

    if away_edge >= home_edge:
        side = game["away_team"]
        chosen_prob = away_prob
        implied = away_implied
        edge = away_edge
    else:
        side = game["home_team"]
        chosen_prob = home_prob
        implied = home_implied
        edge = home_edge

    conf = confidence_tier(edge)
    risks = build_risk_flags(game, edge)
    explanation = generate_moneyline_explanation(game, features, chosen_prob, edge, side)

    return MoneylinePrediction(
        game_id=game["game_id"],
        recommended_side=side,
        model_win_probability=chosen_prob,
        implied_probability=implied,
        edge=edge,
        confidence_tier=conf,
        explanation=explanation,
        risk_flags=risks,
    )
