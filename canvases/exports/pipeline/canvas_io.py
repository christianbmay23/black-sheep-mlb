"""Pure canvas-file and CSV-block utilities used by the compute pipeline.

Everything in this module is intentionally IO-free (no network, no disk reads).
The caller is expected to supply the raw canvas source text and receive the
updated text back. This keeps the module trivially unit-testable.
"""
from __future__ import annotations

import csv
import json
import re
from io import StringIO
from pathlib import Path
from typing import Any


def render_json_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def replace_marker_region(source: str, marker_name: str, csv_text: str) -> str:
    """Replace the content between `<!-- NAME:start -->` and `<!-- NAME:end -->`.

    Raises:
        ValueError: if the marker pair is missing or appears more than once.
    """
    start = f"<!-- {marker_name}:start -->"
    end = f"<!-- {marker_name}:end -->"
    pattern = re.compile(re.escape(start) + r"\r?\n" + r".*?" + r"\r?\n" + re.escape(end), re.DOTALL)
    replacement = start + "\n" + csv_text + "\n" + end
    new_source, count = pattern.subn(replacement, source, count=1)
    if count != 1:
        raise ValueError(f"Expected one {marker_name} block, found {count}")
    return new_source


def assert_no_comment_breaker(text: str, label: str) -> None:
    """Refuse to write CSV content that contains a JSX block-comment terminator."""
    if "*/" in text:
        raise ValueError(f"{label} contains */ — refuse to write")


def csv_block(rows: list[list[str]]) -> str:
    buf = StringIO()
    writer = csv.writer(buf, lineterminator="\n")
    writer.writerows(rows)
    return buf.getvalue().strip()


def canvas_slug(path: Path) -> str:
    return path.name.replace("mlb-pregame-intel-", "").replace(".canvas.tsx", "")


def rows_to_dicts(rows: list[list[str]]) -> list[dict[str, str]]:
    if not rows:
        return []
    header = rows[0]
    return [dict(zip(header, row)) for row in rows[1:]]


def round_or_blank(value: float | None, decimals: int = 2) -> str:
    if value is None:
        return ""
    return f"{value:.{decimals}f}"


def extract_game_block(text: str, game_key: str) -> tuple[int, int] | None:
    """Return (start, end_exclusive) span of the SLATE[] game object for game_key."""
    needle = f'gameKey: "{game_key}"'
    idx = text.find(needle)
    if idx < 0:
        return None
    start = idx
    while start > 0 and text[start] != "{":
        start -= 1
    depth = 0
    for pos in range(start, len(text)):
        if text[pos] == "{":
            depth += 1
        elif text[pos] == "}":
            depth -= 1
            if depth == 0:
                return start, pos + 1
    return None


def find_field_array_span(block: str, field: str) -> tuple[int, int] | None:
    """Return (start, end_exclusive) span of the `[...]` array assigned to `field:`."""
    needle = f"{field}:"
    start = block.find(needle)
    if start < 0:
        return None
    arr_start = block.find("[", start)
    if arr_start < 0:
        return None
    depth = 0
    for idx in range(arr_start, len(block)):
        ch = block[idx]
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return arr_start, idx + 1
    return None


def parse_lineup_rows(block: str, field: str) -> list[dict[str, Any]]:
    span = find_field_array_span(block, field)
    if not span:
        return []
    rows: list[dict[str, Any]] = []
    for order, name, pos in re.findall(
        r'\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]', block[span[0] : span[1]]
    ):
        try:
            parsed_order = int(order)
        except ValueError:
            parsed_order = len(rows) + 1
        rows.append({"order": parsed_order, "name": name, "pos": pos})
    return rows


def parse_canvas_games(source: str, game_specs: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Extract per-game canvas context for every spec in `game_specs`.

    Previously this used a module-level GAME_SPECS global; it is now passed in
    so the function is unit-testable and free of hidden state.
    """
    out: dict[str, dict[str, Any]] = {}
    for spec in game_specs:
        game_key = f"{spec['away']}@{spec['home']}"
        span = extract_game_block(source, game_key)
        if not span:
            continue
        block = source[span[0] : span[1]]
        away_label = re.search(r'awayLuLabel:\s*"([^"]+)"', block)
        home_label = re.search(r'homeLuLabel:\s*"([^"]+)"', block)
        out[game_key] = {
            "away_label": away_label.group(1) if away_label else "Projected (canvas fallback)",
            "home_label": home_label.group(1) if home_label else "Projected (canvas fallback)",
            "away_lineup": parse_lineup_rows(block, "awayLineup"),
            "home_lineup": parse_lineup_rows(block, "homeLineup"),
        }
    return out


def replace_array_field(block: str, field: str, rendered_array: str) -> str:
    span = find_field_array_span(block, field)
    if not span:
        raise ValueError(f"Missing {field} array")
    return block[: span[0]] + rendered_array + block[span[1] :]


def render_lineup_rows(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return "[]"
    pieces = ["["]
    for row in rows:
        pieces.append(
            "\n      ["
            f"{render_json_string(str(row['order']))}, "
            f"{render_json_string(row['name'])}, "
            f"{render_json_string(row['pos'])}"
            "],"
        )
    pieces.append("\n    ]")
    return "".join(pieces)


def render_prop_rows(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return "[]"
    pieces = ["["]
    for row in rows:
        pieces.append(
            "\n      { "
            f'batter: {render_json_string(row["batter"])}, '
            f'team: {render_json_string(row["team"])}, '
            f'hrPct: {row["hrPct"]:.1f}, '
            f'tb2Pct: {row["tb2Pct"]:.1f}, '
            f'tier: {render_json_string(row["tier"])}, '
            f'note: {render_json_string(row["note"])}'
            " },"
        )
    pieces.append("\n    ]")
    return "".join(pieces)


def patch_float_field(block: str, field: str, value: float, decimals: int = 2) -> str:
    return re.sub(rf"({re.escape(field)}:\s*)[\d.+-]+", rf"\g<1>{value:.{decimals}f}", block, count=1)


def patch_string_field(block: str, field: str, value: str) -> str:
    return re.sub(rf'({re.escape(field)}:\s*")([^"]*)(")', rf'\1{value}\3', block, count=1)


def insert_field_after(block: str, after_field: str, rendered_line: str) -> str:
    match = re.search(rf"^(\s*){re.escape(after_field)}:.*,\n", block, flags=re.MULTILINE)
    if not match:
        raise ValueError(f"Missing {after_field} field for insertion")
    indent = match.group(1)
    line = rendered_line if rendered_line.startswith(indent) else f"{indent}{rendered_line}"
    return block[: match.end()] + line + block[match.end() :]


def upsert_string_field(block: str, field: str, value: str, *, after_field: str) -> str:
    if re.search(rf"^\s*{re.escape(field)}:\s*\"", block, flags=re.MULTILINE):
        return patch_string_field(block, field, value)
    return insert_field_after(block, after_field, f"{field}: {render_json_string(value)},\n")


def upsert_literal_field(block: str, field: str, literal: str, *, after_field: str) -> str:
    pattern = re.compile(rf"(^\s*{re.escape(field)}:\s*)([^,\n]+)(,?)$", flags=re.MULTILINE)
    if pattern.search(block):
        return pattern.sub(lambda match: f"{match.group(1)}{literal}{match.group(3)}", block, count=1)
    return insert_field_after(block, after_field, f"{field}: {literal},\n")


__all__ = [
    "render_json_string",
    "replace_marker_region",
    "assert_no_comment_breaker",
    "csv_block",
    "canvas_slug",
    "rows_to_dicts",
    "round_or_blank",
    "extract_game_block",
    "find_field_array_span",
    "parse_lineup_rows",
    "parse_canvas_games",
    "replace_array_field",
    "render_lineup_rows",
    "render_prop_rows",
    "patch_float_field",
    "patch_string_field",
    "insert_field_after",
    "upsert_string_field",
    "upsert_literal_field",
]
