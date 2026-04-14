def generate_moneyline_explanation(game: dict, features: dict, prob: float, edge: float, side: str) -> str:
    return (
        f"{side} is preferred with model win probability {prob:.1%} and edge {edge:.1%}. "
        f"Pitching edge: {features['pitching_edge']:.2f}, bullpen edge: {features['bullpen_edge']:.2f}, "
        f"lineup edge: {features['lineup_edge']:.2f}."
    )
