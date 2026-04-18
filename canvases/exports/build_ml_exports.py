#!/usr/bin/env python3
"""Build date-driven exports from dated MLB pregame canvas marker blocks."""
from __future__ import annotations

import argparse
import csv
import html
import re
import sys
from datetime import datetime
from io import StringIO
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent
REPO_ROOT = OUT_DIR.parent.parent
CANVAS_DIR = OUT_DIR.parent
DEFAULT_SLUG = "apr15"

GAMES_HEADERS = [
    "report_date",
    "away",
    "home",
    "start_time_et",
    "away_sp",
    "home_sp",
    "away_american",
    "home_american",
    "implied_away_pct_nv",
    "implied_home_pct_nv",
    "model_away_win_pct",
    "model_home_win_pct",
    "edge_away_pct",
    "edge_home_pct",
    "prediction",
    "decision_tier_vs_market",
    "edge_on_pick_pct",
    "model_confidence",
    "missing_data_flags",
    "analyst_confidence",
    "rationale_summary",
]

BATTER_HEADERS = [
    "report_date",
    "game",
    "team",
    "batter",
    "opponent_pitcher",
    "hr_prob_pct",
    "tb2_prob_pct",
    "fair_hr_american",
    "fair_2tb_american",
    "market_hr_american",
    "edge_hr_pct",
    "tier",
    "data_confidence",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate CSV and HTML exports from a dated canvas file."
    )
    parser.add_argument(
        "--date",
        default=DEFAULT_SLUG,
        help="Date selector: YYYY-MM-DD or slug format like apr16 (default: apr15).",
    )
    parser.add_argument(
        "--compute",
        action="store_true",
        help="Supported slates (apr16, apr18): run MLB Stats API + models, update canvas markers and SLATE, then export.",
    )
    return parser.parse_args()


def resolve_slug(raw_date: str) -> str:
    token = raw_date.strip().lower()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", token):
        dt = datetime.strptime(token, "%Y-%m-%d")
        return dt.strftime("%b").lower() + str(dt.day)
    if re.fullmatch(r"[a-z]{3}\d{1,2}", token):
        return token
    raise ValueError(
        "Invalid --date value. Use YYYY-MM-DD (e.g., 2026-04-16) or slug (e.g., apr16)."
    )


def extract_marker_block(source: str, marker_name: str) -> str | None:
    pattern = (
        rf"<!--\s*{re.escape(marker_name)}:start\s*-->"
        rf"(.*?)"
        rf"<!--\s*{re.escape(marker_name)}:end\s*-->"
    )
    match = re.search(pattern, source, flags=re.DOTALL | re.IGNORECASE)
    if not match:
        return None
    return match.group(1).strip()


def parse_csv_block(block: str | None, fallback_headers: list[str], label: str) -> list[list[str]]:
    if not block:
        print(f"Warning: missing marker block '{label}'. Using header-only CSV fallback.")
        return [fallback_headers]

    rows = list(csv.reader(StringIO(block)))
    rows = [row for row in rows if any(cell.strip() for cell in row)]
    if not rows:
        print(f"Warning: marker block '{label}' is empty. Using header-only CSV fallback.")
        return [fallback_headers]

    return rows


def write_csv(path: Path, rows: list[list[str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerows(rows)


def table_html(rows: list[list[str]], title: str) -> str:
    if not rows:
        return f"<h2>{html.escape(title)}</h2><p>No data.</p>"

    head = rows[0]
    body = rows[1:]
    parts = [f"<h2>{html.escape(title)}</h2>", "<table><thead><tr>"]
    for cell in head:
        parts.append(f"<th>{html.escape(cell)}</th>")
    parts.append("</tr></thead><tbody>")
    for row in body:
        parts.append("<tr>")
        for cell in row:
            parts.append(f"<td>{html.escape(cell)}</td>")
        parts.append("</tr>")
    parts.append("</tbody></table>")
    return "".join(parts)


def build_html(report_path: Path, slug: str, games_rows: list[list[str]], batter_rows: list[list[str]]) -> None:
    html_doc = "".join(
        [
            "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>",
            f"<title>MLB Pregame Intel {html.escape(slug)}</title>",
            "<style>",
            "body{font-family:system-ui,sans-serif;margin:24px;background:#0f1419;color:#e8eef5}",
            "table{border-collapse:collapse;width:100%;margin:16px 0;font-size:12px}",
            "th,td{border:1px solid #2a3a4d;padding:6px;text-align:left}",
            "th{background:#1a2430}",
            "</style></head><body>",
            f"<h1>MLB Pregame Intel Report — {html.escape(slug)}</h1>",
            table_html(games_rows, "Games"),
            table_html(batter_rows, "Batter Outlooks"),
            "</body></html>",
        ]
    )
    report_path.write_text(html_doc, encoding="utf-8")


def main() -> None:
    args = parse_args()
    slug = resolve_slug(args.date)

    if args.compute:
        if slug not in {"apr16", "apr18"}:
            print(
                "Error: --compute is only supported for slates with a models/<slug>_inputs module "
                "(e.g. --date 2026-04-16 or 2026-04-18).",
                file=sys.stderr,
            )
            raise SystemExit(2)
        if str(REPO_ROOT) not in sys.path:
            sys.path.insert(0, str(REPO_ROOT))
        from apr16_compute import run_slate_pipeline

        run_slate_pipeline(slug)

    canvas_path = CANVAS_DIR / f"mlb-pregame-intel-{slug}.canvas.tsx"
    if not canvas_path.exists():
        raise FileNotFoundError(f"Canvas not found for slug '{slug}': {canvas_path}")

    src = canvas_path.read_text(encoding="utf-8")
    games_block = extract_marker_block(src, "games-csv")
    batter_block = extract_marker_block(src, "batter-outlooks-csv")

    games_rows = parse_csv_block(games_block, GAMES_HEADERS, "games-csv")
    batter_rows = parse_csv_block(batter_block, BATTER_HEADERS, "batter-outlooks-csv")

    games_path = OUT_DIR / f"mlb-pregame-intel-{slug}-games.csv"
    batter_path = OUT_DIR / f"mlb-pregame-intel-{slug}-batter-outlooks.csv"
    report_path = OUT_DIR / f"mlb-pregame-intel-{slug}-report.html"

    write_csv(games_path, games_rows)
    write_csv(batter_path, batter_rows)
    build_html(report_path, slug, games_rows, batter_rows)

    print("Wrote:", games_path)
    print("Wrote:", batter_path)
    print("Wrote:", report_path)


if __name__ == "__main__":
    main()
