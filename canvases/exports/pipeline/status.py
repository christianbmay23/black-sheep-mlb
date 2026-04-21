"""Pure helpers for MLB game status / inning / run-environment labelling.

Consumes raw MLB Stats API game objects (or any dict-shaped equivalent) and
produces the status buckets used by the compute pipeline and the snapshot.
No network I/O.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Any


# --- Small coercion helpers (kept local to avoid cross-module churn) --------

def _parse_int(value: Any) -> int | None:
    if value in {None, "", "—"}:
        return None
    try:
        return int(str(value).strip())
    except ValueError:
        return None


def parse_stat_date(raw: str | None) -> date | None:
    if not raw:
        return None
    try:
        return datetime.strptime(raw[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def innings_text_to_outs(text: str | None) -> int:
    raw = (text or "").strip()
    if not raw:
        return 0
    if "." not in raw:
        return int(raw) * 3
    whole, frac = raw.split(".", 1)
    outs = int(whole) * 3
    if frac in {"1", "2"}:
        outs += int(frac)
    return outs


def run_environment_label(run_factor: float | None) -> str:
    if run_factor is None:
        return "Medium"
    if run_factor >= 1.04:
        return "High"
    if run_factor >= 1.01:
        return "Medium-High"
    if run_factor <= 0.96:
        return "Low"
    if run_factor <= 0.99:
        return "Low-Medium"
    return "Medium"


def current_inning_label(linescore: dict[str, Any]) -> str:
    inning_state = str(linescore.get("inningState") or "").strip()
    inning_half = str(linescore.get("inningHalf") or "").strip()
    inning_ordinal = str(linescore.get("currentInningOrdinal") or "").strip()
    if inning_state and inning_ordinal:
        return f"{inning_state} {inning_ordinal}"
    if inning_half and inning_ordinal:
        return f"{inning_half} {inning_ordinal}"
    if inning_state:
        return inning_state
    if inning_ordinal:
        return inning_ordinal
    inning_num = _parse_int(linescore.get("currentInning"))
    if inning_num is None:
        return ""
    suffix = "th" if 10 <= inning_num % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(inning_num % 10, "th")
    return f"{inning_num}{suffix}"


def summarize_game_status(game: dict[str, Any]) -> dict[str, Any]:
    """Collapse a raw MLB schedule game dict into our `game_status_bucket` shape."""
    teams = game.get("teams") or {}
    away = str(((teams.get("away") or {}).get("team") or {}).get("abbreviation") or "")
    home = str(((teams.get("home") or {}).get("team") or {}).get("abbreviation") or "")
    status = game.get("status") or {}
    linescore = game.get("linescore") or {}
    away_score_raw = _parse_int((((linescore.get("teams") or {}).get("away") or {}).get("runs")))
    home_score_raw = _parse_int((((linescore.get("teams") or {}).get("home") or {}).get("runs")))
    inning_label = current_inning_label(linescore)
    score_label = (
        f"{away} {away_score_raw}, {home} {home_score_raw}"
        if away_score_raw is not None and home_score_raw is not None
        else ""
    )

    abstract = str(status.get("abstractGameState") or "").strip()
    detailed = str(status.get("detailedState") or "").strip()
    status_code = str(status.get("statusCode") or "").strip().upper()
    abstract_lower = abstract.lower()
    detailed_lower = detailed.lower()

    if abstract_lower == "final" or detailed_lower.startswith("final") or status_code.startswith("F"):
        note = "Final"
        if score_label:
            note = f"{note} — {score_label}"
        return {
            "game_status_bucket": "final",
            "game_state": "Final",
            "game_state_detail": detailed or "Final",
            "game_status_note": note,
            "inning_label": inning_label,
            "away_score": away_score_raw,
            "home_score": home_score_raw,
        }

    if abstract_lower == "live" or status_code.startswith("I"):
        detail = detailed or "In Progress"
        lead = detail if detail.lower() not in {"in progress", "live"} else (inning_label or "Live")
        note_parts = [lead]
        if lead != inning_label and inning_label:
            note_parts.append(inning_label)
        if score_label:
            note_parts.append(score_label)
        return {
            "game_status_bucket": "live",
            "game_state": "Live",
            "game_state_detail": detail,
            "game_status_note": " — ".join(part for part in note_parts if part),
            "inning_label": inning_label,
            "away_score": away_score_raw,
            "home_score": home_score_raw,
        }

    if abstract_lower in {"preview", "pregame"} or status_code in {"S", "P", "PW", "PR", "PO"}:
        detail = detailed or "Pre-Game"
        note = detail
        if detail.lower() in {"scheduled", "preview", "pre-game"}:
            note = "Yet to begin"
        return {
            "game_status_bucket": "pregame",
            "game_state": "Yet To Begin",
            "game_state_detail": detail,
            "game_status_note": note,
            "inning_label": inning_label,
            "away_score": None,
            "home_score": None,
        }

    note = detailed or abstract or "Status unavailable"
    if score_label:
        note = f"{note} — {score_label}"
    return {
        "game_status_bucket": "other",
        "game_state": abstract or "Other",
        "game_state_detail": detailed or abstract or "Other",
        "game_status_note": note,
        "inning_label": inning_label,
        "away_score": away_score_raw if abstract_lower in {"live", "final"} else None,
        "home_score": home_score_raw if abstract_lower in {"live", "final"} else None,
    }


__all__ = [
    "parse_stat_date",
    "innings_text_to_outs",
    "run_environment_label",
    "current_inning_label",
    "summarize_game_status",
]
