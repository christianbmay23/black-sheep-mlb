def generate_moneyline_explanation(
    game: dict,
    features: dict,
    prob: float,
    edge: float,
    side: str,
    market_odds: int,
) -> str:
    pick_type = "PASS"
    if edge >= 0.04:
        pick_type = "PLAY"
    elif edge >= 0.02:
        pick_type = "LEAN"

    risk = " / ".join(features.get("feature_notes") or ["No major data risks identified."])

    return (
        f"{pick_type}: {side} moneyline at market {market_odds:+}. Model probability is {prob:.1%} "
        f"with edge {edge:.1%}. Starter edge {features['starter_edge']:.3f}, bullpen edge {features['bullpen_edge']:.3f}, "
        f"lineup edge {features['lineup_edge']:.3f}, park/weather edge {features['park_weather_edge']:.3f}. "
        f"Main risk: {risk}"
    )
