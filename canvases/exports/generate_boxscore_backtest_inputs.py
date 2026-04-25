#!/usr/bin/env python3
"""Fetch dated MLB boxscores, persist them locally, and generate prop backtest inputs from outlook exports."""
from __future__ import annotations

import argparse
import csv
import json
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from prop_backtest_tracker import alias_player_name, slug_from_date_input

OUT_DIR = Path(__file__).resolve().parent
BOX_DIR = OUT_DIR / "boxscores"
PROP_RESULTS_HEADERS = [
    "date",
    "game",
    "player",
    "team",
    "prop_type",
    "line",
    "market_odds",
    "closing_odds",
    "result",
    "notes",
    "market_odds_time",
    "result_source",
    "result_source_detail",
]


def artifact_path(path: Path) -> str:
    try:
        return str(path.relative_to(OUT_DIR))
    except ValueError:
        return str(path)


@dataclass
class GameMeta:
    game_pk: int
    game: str
    away: str
    home: str
    status: str


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.load(response)


def fetch_schedule_games(date_str: str) -> list[GameMeta]:
    query = urllib.parse.urlencode(
        {
            "sportId": 1,
            "date": date_str,
            "hydrate": "team,linescore",
        }
    )
    payload = fetch_json(f"https://statsapi.mlb.com/api/v1/schedule?{query}")
    games: list[GameMeta] = []
    for block in payload.get("dates", []):
        for game in block.get("games", []):
            away = str(game["teams"]["away"]["team"]["abbreviation"])
            home = str(game["teams"]["home"]["team"]["abbreviation"])
            games.append(
                GameMeta(
                    game_pk=int(game["gamePk"]),
                    game=f"{away}@{home}",
                    away=away,
                    home=home,
                    status=str(game.get("status", {}).get("detailedState") or ""),
                )
            )
    return games


def fetch_boxscore(game_pk: int) -> dict:
    return fetch_json(f"https://statsapi.mlb.com/api/v1/game/{game_pk}/boxscore")


def load_cached_boxscores(slug: str) -> tuple[dict[str, dict], dict[str, str]]:
    out_dir = BOX_DIR / slug
    manifest_path = out_dir / "manifest.json"
    if not manifest_path.exists():
        return {}, {}
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    cached: dict[str, dict] = {}
    detail: dict[str, str] = {}
    for item in manifest:
        game = str(item.get("game") or "").upper()
        file_path = Path(str(item.get("file") or ""))
        if not file_path.is_absolute():
            file_path = out_dir / file_path
        if not game or not file_path.exists():
            continue
        cached[game] = json.loads(file_path.read_text(encoding="utf-8"))
        detail[game] = artifact_path(file_path)
    return cached, detail


def save_boxscores(games: list[GameMeta], date_str: str, slug: str) -> tuple[dict[str, dict], dict[str, str]]:
    out_dir = BOX_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    saved: dict[str, dict] = {}
    detail: dict[str, str] = {}
    manifest: list[dict[str, object]] = []
    for game in games:
        boxscore = fetch_boxscore(game.game_pk)
        path = out_dir / f"{game.game.replace('@', '_')}-{game.game_pk}.json"
        path.write_text(json.dumps(boxscore, indent=2, ensure_ascii=False), encoding="utf-8")
        saved[game.game] = boxscore
        detail[game.game] = artifact_path(path)
        manifest.append(
            {
                "report_date": date_str,
                "game": game.game,
                "game_pk": game.game_pk,
                "status": game.status,
                "file": str(path),
            }
        )
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return saved, detail


def parse_int(value: object) -> int:
    try:
        return int(str(value or "0"))
    except ValueError:
        return 0


def build_player_stats(game: str, team: str, boxscore: dict) -> dict[tuple[str, str, str], dict[str, int]]:
    player_map: dict[tuple[str, str, str], dict[str, int]] = {}
    teams = boxscore.get("teams") or {}
    for side in ("away", "home"):
        team_block = teams.get(side) or {}
        abbr = str((team_block.get("team") or {}).get("abbreviation") or "")
        if abbr != team:
            continue
        for player in (team_block.get("players") or {}).values():
            person = player.get("person") or {}
            batting = ((player.get("stats") or {}).get("batting") or {})
            key = (game, abbr, alias_player_name(str(person.get("fullName") or "")))
            player_map[key] = {
                "hits": parse_int(batting.get("hits")),
                "home_runs": parse_int(batting.get("homeRuns")),
                "total_bases": parse_int(batting.get("totalBases")),
                "at_bats": parse_int(batting.get("atBats")),
                "runs": parse_int(batting.get("runs")),
                "rbi": parse_int(batting.get("rbi")),
            }
    return player_map


def normalize_market(value: str) -> str:
    text = (value or "").strip()
    if text in {"", "NA", "N/A", "None", "null"}:
        return ""
    return text


def build_prop_results(
    outlook_csv: Path,
    results_csv: Path,
    date_str: str,
    boxscores: dict[str, dict],
    boxscore_files: dict[str, str] | None = None,
) -> tuple[int, int]:
    with outlook_csv.open(newline="", encoding="utf-8") as fh:
        outlook_rows = list(csv.DictReader(fh))

    player_stats: dict[tuple[str, str, str], dict[str, int]] = {}
    for row in outlook_rows:
        game = row["game"].strip().upper()
        team = row["team"].strip().upper()
        boxscore = boxscores.get(game)
        if boxscore is None:
            continue
        player_stats.update(build_player_stats(game, team, boxscore))

    boxscore_files = boxscore_files or {}

    with results_csv.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh, lineterminator="\n")
        writer.writerow(PROP_RESULTS_HEADERS)

        rows_written = 0
        roi_eligible = 0
        for row in outlook_rows:
            game = row["game"].strip().upper()
            team = row["team"].strip().upper()
            batter = row["batter"].strip()
            stats = player_stats.get((game, team, alias_player_name(batter)))
            result_source = "mlb_stats_api" if game in boxscores else "unavailable"
            result_source_detail = boxscore_files.get(game, "")

            if stats is None:
                hr_result = "P"
                tb_result = "P"
                actual_note = "player not in final boxscore"
                if result_source == "mlb_stats_api":
                    result_source_detail = "player_not_in_boxscore"
            else:
                hr_result = "W" if stats["home_runs"] > 0 else "L"
                tb_result = "W" if stats["total_bases"] >= 2 else "L"
                actual_note = (
                    f"{stats['hits']} H, {stats['total_bases']} TB, "
                    f"{stats['home_runs']} HR, {stats['runs']} R, {stats['rbi']} RBI"
                )

            hr_market = normalize_market(row.get("market_hr_american", ""))
            tb_market_line = (row.get("market_tb_line") or "").strip()
            tb_market = normalize_market(row.get("market_tb_over_american", ""))

            writer.writerow(
                [
                    date_str,
                    game,
                    batter,
                    team,
                    "HR",
                    "0.5",
                    hr_market,
                    "",
                    hr_result,
                    actual_note,
                    "pregame" if hr_market else "",
                    result_source,
                    result_source_detail,
                ]
            )
            rows_written += 1
            if hr_market:
                roi_eligible += 1

            tb_market_for_roi = tb_market if tb_market_line == "1.5" else ""
            tb_note = actual_note
            if tb_market_line and tb_market_line != "1.5":
                tb_note = f"{actual_note}; market line {tb_market_line} excluded from 2+ TB ROI"

            writer.writerow(
                [
                    date_str,
                    game,
                    batter,
                    team,
                    "2+ TB",
                    "1.5",
                    tb_market_for_roi,
                    "",
                    tb_result,
                    tb_note,
                    "pregame" if tb_market_for_roi else "",
                    result_source,
                    result_source_detail,
                ]
            )
            rows_written += 1
            if tb_market_for_roi:
                roi_eligible += 1

    return rows_written, roi_eligible


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", required=True, help="Date slug (apr18) or YYYY-MM-DD.")
    parser.add_argument("--outlook", type=Path, default=None, help="Override outlook CSV path.")
    parser.add_argument("--results", type=Path, default=None, help="Override generated prop-results CSV path.")
    parser.add_argument("--refresh-boxscores", action="store_true", help="Fetch boxscores even when cached boxscore files already exist.")
    args = parser.parse_args()

    slug = slug_from_date_input(args.date)
    date_str = args.date if len(args.date) == 10 and args.date[4] == "-" else None
    if date_str is None:
        # Derive YYYY-MM-DD from the first row of the outlook export when the input is slug-based.
        outlook_probe = args.outlook or (OUT_DIR / f"mlb-pregame-intel-{slug}-batter-outlooks.csv")
        with outlook_probe.open(newline="", encoding="utf-8") as fh:
            first_row = next(csv.DictReader(fh))
        date_str = first_row["report_date"]

    outlook_csv = args.outlook or (OUT_DIR / f"mlb-pregame-intel-{slug}-batter-outlooks.csv")
    results_csv = args.results or (OUT_DIR / f"prop_results_{slug}.csv")

    boxscores, boxscore_files = ({}, {}) if args.refresh_boxscores else load_cached_boxscores(slug)
    if not boxscores:
        games = fetch_schedule_games(date_str)
        if not games:
            raise SystemExit(f"No MLB games found for {date_str}.")
        boxscores, boxscore_files = save_boxscores(games, date_str, slug)
        fetched_count = len(games)
    else:
        fetched_count = 0

    rows_written, roi_eligible = build_prop_results(outlook_csv, results_csv, date_str, boxscores, boxscore_files)

    if fetched_count:
        print(f"Fetched {fetched_count} boxscores for {date_str} ({slug}).")
    else:
        print(f"Loaded {len(boxscores)} cached boxscores for {date_str} ({slug}).")
    print(f"Boxscores: {BOX_DIR / slug}")
    print(f"Prop results: {results_csv}")
    print(f"Rows written: {rows_written}")
    print(f"ROI-eligible rows: {roi_eligible}")


if __name__ == "__main__":
    main()
