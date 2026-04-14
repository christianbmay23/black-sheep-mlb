from __future__ import annotations

import json
from pathlib import Path


class MLBStatsCollector:
    def __init__(self, demo_path: str = "data/raw/demo_slate.json") -> None:
        self.demo_path = Path(demo_path)

    def get_games_for_date(self, date_str: str) -> list[dict]:
        if not self.demo_path.exists():
            return []
        games = json.loads(self.demo_path.read_text())
        return [g for g in games if g.get("date") == date_str]
