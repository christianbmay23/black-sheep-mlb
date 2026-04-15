def build_article(predictions: list[dict]) -> str:
    lines = ["# Daily Black Sheep MLB Card", ""]
    for pred in predictions:
        breakdown = pred.get("feature_breakdown", {})
        lines.append(
            f"- {pred['game_id']}: {pred['recommended_side']} ML | prob {pred['model_probability']:.1%} | "
            f"fair {pred['fair_odds']:+} vs market {pred['market_odds']:+} | edge {pred['edge']:.1%} | "
            f"starter {breakdown.get('starter_edge', 0):.3f}, bullpen {breakdown.get('bullpen_edge', 0):.3f}, "
            f"lineup {breakdown.get('lineup_edge', 0):.3f}, park/weather {breakdown.get('park_weather_edge', 0):.3f} | "
            f"confidence {pred['confidence_tier']}"
        )
    return "\n".join(lines)
