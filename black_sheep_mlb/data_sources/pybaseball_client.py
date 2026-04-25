"""Cached pybaseball wrapper used as an optional free-data enrichment source."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Callable

from black_sheep_mlb.storage.cache import safe_cache_path

logger = logging.getLogger(__name__)


class PyBaseballClient:
    def __init__(self, cache_dir: str | Path = "data/cache/pybaseball"):
        self.cache_dir = Path(cache_dir)

    def _pd(self) -> Any:
        import pandas as pd  # type: ignore

        return pd

    def _empty_frame(self) -> Any:
        return self._pd().DataFrame()

    def _read_cache(self, path: Path) -> Any | None:
        if path.with_suffix(".parquet").is_file():
            return self._pd().read_parquet(path.with_suffix(".parquet"))
        if path.with_suffix(".csv").is_file():
            return self._pd().read_csv(path.with_suffix(".csv"))
        return None

    def _write_cache(self, frame: Any, path: Path) -> None:
        csv_path = path.with_suffix(".csv")
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            frame.to_parquet(path.with_suffix(".parquet"), index=False)
        except Exception:
            frame.to_csv(csv_path, index=False)

    def _cached_call(self, namespace: str, key: str, fetcher: Callable[[], Any]) -> Any:
        path = safe_cache_path(self.cache_dir, namespace, key, "csv")
        cached = self._read_cache(path)
        if cached is not None:
            logger.info("pybaseball cache hit: %s", path)
            return cached
        logger.info("pybaseball cache miss: %s", key)
        try:
            frame = fetcher()
        except Exception as exc:
            logger.warning("pybaseball fetch failed for %s: %s", key, exc)
            cached = self._read_cache(path)
            return cached if cached is not None else self._empty_frame()
        if frame is None:
            frame = self._empty_frame()
        self._write_cache(frame, path)
        return frame

    def get_statcast_window(self, start_date: str, end_date: str) -> Any:
        def fetch() -> Any:
            from pybaseball import statcast  # type: ignore

            return statcast(start_dt=start_date, end_dt=end_date)

        return self._cached_call("statcast", f"{start_date}:{end_date}", fetch)

    def get_batting_stats(self, season: int) -> Any:
        def fetch() -> Any:
            from pybaseball import batting_stats  # type: ignore

            return batting_stats(season)

        return self._cached_call("batting_stats", str(season), fetch)

    def get_pitching_stats(self, season: int) -> Any:
        def fetch() -> Any:
            from pybaseball import pitching_stats  # type: ignore

            return pitching_stats(season)

        return self._cached_call("pitching_stats", str(season), fetch)

    def get_recent_batter_form(self, start_date: str, end_date: str) -> Any:
        return self.get_statcast_window(start_date, end_date)

    def get_recent_pitcher_form(self, start_date: str, end_date: str) -> Any:
        return self.get_statcast_window(start_date, end_date)
