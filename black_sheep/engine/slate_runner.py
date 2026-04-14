from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path

from black_sheep.collectors import LineupsCollector, MLBStatsCollector, OddsApiCollector, SportsDataIOCollector, WeatherCollector
from black_sheep.engine.prediction_pipeline import run_prediction_pipeline
from black_sheep.reasoning.article_writer import build_article
from config.settings import get_settings

logger = logging.getLogger(__name__)


def run_slate(date_str: str, use_live: bool = True) -> list[dict]:
    settings = get_settings()
    stats = MLBStatsCollector()
    odds = OddsApiCollector(api_key=settings.odds_api_key)
    weather = WeatherCollector()
    lineups = LineupsCollector()
    context = SportsDataIOCollector()

    raw_dir = Path("data/raw")
    raw_dir.mkdir(parents=True, exist_ok=True)

    use_live_stats = use_live and settings.use_live_mlb_stats
    use_live_odds = use_live and settings.use_live_odds

    raw_schedule = None
    if use_live_stats:
        try:
            raw_schedule = stats.fetch_schedule(date_str)
            timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
            (raw_dir / f"mlb_schedule_{date_str}_{timestamp}.json").write_text(json.dumps(raw_schedule, indent=2))
        except Exception as exc:  # pragma: no cover
            logger.warning("Unable to capture raw live MLB schedule for %s: %s", date_str, exc)

    raw_games = stats.get_games_for_date(date_str, use_live=use_live_stats)

    odds_events: list[dict] = []
    if use_live_odds:
        odds_events = odds.fetch_mlb_odds()
        if odds_events:
            timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
            (raw_dir / f"odds_events_{date_str}_{timestamp}.json").write_text(json.dumps(odds_events, indent=2))

    predictions: list[dict] = []
    for game in raw_games:
        game = odds.attach_market_odds(game, odds_events=odds_events)
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
