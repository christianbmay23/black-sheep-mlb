def build_article(predictions: list[dict]) -> str:
    lines = ["# Daily Black Sheep MLB Card", ""]
    for pred in predictions:
        lines.append(
            f"- {pred['game_id']}: {pred['recommended_side']} ML | edge {pred['edge']:.1%} | confidence {pred['confidence_tier']}"
        )
    return "\n".join(lines)
