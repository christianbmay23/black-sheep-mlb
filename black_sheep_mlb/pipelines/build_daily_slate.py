"""Build a daily slate from MLB Stats API."""
from __future__ import annotations

from black_sheep_mlb.data_sources.mlb_stats_client import MLBGame, MLBStatsClient


def build_daily_slate(date: str, client: MLBStatsClient | None = None) -> list[MLBGame]:
    return (client or MLBStatsClient()).get_schedule(date)
