"""Provider selection for optional market snapshots."""
from __future__ import annotations

from black_sheep_mlb.config.settings import Settings
from black_sheep_mlb.data_sources.cached_odds_provider import CachedOddsProvider
from black_sheep_mlb.data_sources.manual_csv_odds_provider import ManualCSVOddsProvider
from black_sheep_mlb.data_sources.odds_provider import OddsProvider
from black_sheep_mlb.data_sources.the_odds_api_provider import TheOddsAPIProvider


def build_odds_provider(settings: Settings, provider_name: str, *, refresh_odds: bool = False) -> OddsProvider | None:
    if provider_name == "none":
        return None
    if provider_name == "manual":
        return ManualCSVOddsProvider(settings.data_dir / "manual" / "odds_snapshot.csv")
    if provider_name == "oddsapi":
        wrapped = TheOddsAPIProvider(settings.odds_api_key)
        stale_minutes = 0 if refresh_odds else settings.odds_stale_minutes
        return CachedOddsProvider(wrapped, settings.odds_cache_db, stale_minutes=stale_minutes)
    raise ValueError(f"unknown odds provider: {provider_name}")
