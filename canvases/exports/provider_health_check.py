#!/usr/bin/env python3
"""Probe live data providers without writing slate outputs."""
from __future__ import annotations

import argparse
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from live_mlb_data import (
    fetch_dk_hr_props,
    fetch_live_game_odds,
    fetch_propline_hr_props,
    fetch_rotowire_prop_markets,
    get_runtime_diagnostics,
    reset_runtime_diagnostics,
)
from pipeline.fetch import fetch_schedule_lineups


def count_lines(markets: dict[str, dict[tuple[str, str], object]], market_key: str | None = None) -> int:
    total = 0
    for lines in markets.values():
        for key in lines:
            if market_key is None or key[1] == market_key:
                total += 1
    return total


def source_counts(markets: dict[str, dict[tuple[str, str], object]]) -> dict[str, int]:
    counts: Counter[str] = Counter()
    for lines in markets.values():
        for line in lines.values():
            counts[str(getattr(line, "source", "") or "unknown")] += 1
    return dict(sorted(counts.items()))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", required=True, help="YYYY-MM-DD slate date.")
    args = parser.parse_args()

    reset_runtime_diagnostics()
    schedule = fetch_schedule_lineups(args.date)
    print(f"Schedule games: {len(schedule)}")

    try:
        odds = fetch_live_game_odds(schedule, args.date, required=False)
        print(f"Game odds covered: {len(odds)}/{len(schedule)}")
        odds_sources = Counter(str(line.source or "unknown") for line in odds.values())
        print(f"Game odds sources: {dict(sorted(odds_sources.items()))}")
    except Exception as exc:
        print(f"Game odds probe failed: {exc}")
        odds = {}

    event_ids = {game_key: line.event_id for game_key, line in odds.items() if line.event_id}
    propline = fetch_propline_hr_props(args.date, event_ids_by_game=event_ids)
    draftkings = fetch_dk_hr_props(args.date)
    rotowire = fetch_rotowire_prop_markets(args.date)

    print(f"PropLine HR games: {len(propline)} lines={count_lines(propline, 'batter_home_runs')}")
    print(f"DraftKings HR games: {len(draftkings)} lines={count_lines(draftkings, 'batter_home_runs')}")
    print(
        "RotoWire prop games: "
        f"{len(rotowire)} hr_lines={count_lines(rotowire, 'batter_home_runs')} "
        f"tb_lines={count_lines(rotowire, 'batter_total_bases')}"
    )
    print(f"RotoWire source counts: {source_counts(rotowire)}")

    diagnostics = get_runtime_diagnostics()
    if diagnostics:
        print("Diagnostics:")
        for diagnostic in diagnostics:
            print(f"- {diagnostic.get('code', 'unknown')}: {diagnostic.get('message', '')}")


if __name__ == "__main__":
    main()
