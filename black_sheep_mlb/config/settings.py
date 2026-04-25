"""Central settings for optional odds and free-data daily runs."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _split_csv(value: str | None, default: list[str]) -> list[str]:
    if value is None or value.strip() == "":
        return list(default)
    return [part.strip() for part in value.split(",") if part.strip()]


def _bool_env(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() not in {"0", "false", "no", "off"}


@dataclass(frozen=True)
class Settings:
    odds_api_key: str | None
    odds_api_regions: list[str]
    odds_api_markets: list[str]
    odds_api_bookmakers: list[str] | None
    odds_cache_db: Path
    data_dir: Path
    enable_odds: bool
    odds_strategy: str
    odds_max_games: int
    odds_stale_minutes: int


def load_settings() -> Settings:
    data_dir = Path(os.getenv("DATA_DIR", "data"))
    bookmakers = _split_csv(os.getenv("ODDS_API_BOOKMAKERS"), [])
    return Settings(
        odds_api_key=os.getenv("ODDS_API_KEY") or os.getenv("THE_ODDS_API_KEY"),
        odds_api_regions=_split_csv(os.getenv("ODDS_API_REGIONS"), ["us"]),
        odds_api_markets=_split_csv(os.getenv("ODDS_API_MARKETS"), ["h2h", "spreads", "totals"]),
        odds_api_bookmakers=bookmakers or None,
        odds_cache_db=Path(os.getenv("ODDS_CACHE_DB", str(data_dir / "cache" / "odds_cache.sqlite"))),
        data_dir=data_dir,
        enable_odds=_bool_env(os.getenv("ENABLE_ODDS"), True),
        odds_strategy=os.getenv("ODDS_STRATEGY", "selective"),
        odds_max_games=int(os.getenv("ODDS_MAX_GAMES", "6")),
        odds_stale_minutes=int(os.getenv("ODDS_STALE_MINUTES", "45")),
    )
