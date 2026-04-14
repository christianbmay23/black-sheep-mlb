def grade_prediction(prediction: dict, result_winner: str) -> dict:
    won = prediction["recommended_side"] == result_winner
    unit_return = 1.0 if won else -1.0
    return {
        "game_id": prediction["game_id"],
        "won": won,
        "unit_return": unit_return,
    }
