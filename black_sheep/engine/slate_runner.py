from __future__ import annotations

import json
from pathlib import Path

from black_sheep.collectors import LineupsCollector, MLBStatsCollector, OddsApiCollector, SportsDataIOCollector, WeatherCollector
from black_sheep.engine.prediction_pipeline import run_prediction_pipeline
from black_sheep.reasoning.article_writer import build_article
from black_sheep.schemas.game_schema import Game


def run_slate(date_str: str) -> list[dict]:
    stats = MLBStatsCollector()
    odds = OddsApiCollector()
    weather = WeatherCollector()
    lineups = LineupsCollector()
    context = SportsDataIOCollector()

    raw_games = stats.get_games_for_date(date_str)
    predictions: list[dict] = []
    for raw in raw_games:
        game = Game(**raw).model_dump()
        game = odds.attach_market_odds(game)
        game = weather.enrich_weather(game)
        game = lineups.enrich_lineups(game)
        game = context.enrich_team_context(game)

        pred = run_prediction_pipeline(game)
        predictions.append(pred.model_dump())

    out_dir = Path("data/outputs")
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "latest_predictions.json").write_text(json.dumps(predictions, indent=2))
    (out_dir / "latest_article.md").write_text(build_article(predictions))
    return predictions
