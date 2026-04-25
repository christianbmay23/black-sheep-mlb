"""Free-data enrichment placeholder that fails open with provenance."""
from __future__ import annotations

import logging

from black_sheep_mlb.data_sources.mlb_stats_client import MLBGame
from black_sheep_mlb.data_sources.pybaseball_client import PyBaseballClient

logger = logging.getLogger(__name__)


def enrich_matchups(games: list[MLBGame], date: str, client: PyBaseballClient | None = None) -> list[dict]:
    """Return matchup records with free-data provenance.

    This intentionally does not change existing model formulas. It creates the
    seam for cached pybaseball features and keeps daily runs alive if the source
    is unavailable.
    """
    enriched: list[dict] = []
    pyb = client or PyBaseballClient()
    try:
        year = int(date[:4])
        batting = pyb.get_batting_stats(year)
        pitching = pyb.get_pitching_stats(year)
        free_status = "available"
        free_rows = {
            "batting_rows": int(getattr(batting, "shape", [0])[0] if batting is not None else 0),
            "pitching_rows": int(getattr(pitching, "shape", [0])[0] if pitching is not None else 0),
        }
    except Exception as exc:
        logger.warning("free-data enrichment unavailable; predictions continue without pybaseball: %s", exc)
        free_status = "unavailable"
        free_rows = {"batting_rows": 0, "pitching_rows": 0}
    for game in games:
        enriched.append({"game": game, "free_data_status": free_status, **free_rows})
    return enriched
