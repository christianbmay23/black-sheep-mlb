"""First-pass bullpen fatigue logic for EchoIQ Night Shift."""

from __future__ import annotations

from collections import defaultdict

from .schemas import BullpenFatigue, PitcherUsage


def innings_to_float(value: str | None) -> float:
    if value is None or str(value).strip() == "":
        return 0.0
    text = str(value).strip()
    if "." not in text:
        try:
            return float(text)
        except ValueError:
            return 0.0
    whole, frac = text.split(".", 1)
    try:
        innings = int(whole or "0")
        outs = int(frac or "0")
    except ValueError:
        return 0.0
    if outs not in {0, 1, 2}:
        return 0.0
    return innings + (outs / 3.0)


def build_bullpen_fatigue(date_str: str, pitcher_usage: list[PitcherUsage], *, retrieved_at: str) -> list[BullpenFatigue]:
    relievers_by_team: dict[str, list[PitcherUsage]] = defaultdict(list)
    for row in pitcher_usage:
        if row.starter_or_reliever == "reliever":
            relievers_by_team[row.team].append(row)

    fatigue_rows: list[BullpenFatigue] = []
    for team, relievers in sorted(relievers_by_team.items()):
        innings = sum(innings_to_float(row.innings_pitched) for row in relievers)
        reliever_count = len(relievers)
        pitch_total = sum(int(row.pitches or 0) for row in relievers)
        max_pitches = max((int(row.pitches or 0) for row in relievers), default=0)
        dangerous_contact = [
            row
            for row in relievers
            if any(tag in str(row.statcast_signal_tags or "") for tag in ("LOUD_CONTACT_ALLOWED", "BARREL_RISK", "HR_RISK_ALLOWED"))
        ]
        high_leverage_used = "unknown"
        if max_pitches >= 25 or reliever_count >= 4:
            high_leverage_used = "proxy_possible"

        fatigue_level = "LOW"
        if innings >= 6.0 or reliever_count >= 6 or pitch_total >= 110:
            fatigue_level = "EXTREME"
        elif innings >= 4.0 or reliever_count >= 5 or max_pitches >= 35 or pitch_total >= 80:
            fatigue_level = "HIGH"
        elif innings >= 2.0 or reliever_count >= 3 or max_pitches >= 25:
            fatigue_level = "MODERATE"

        notes = (
            f"{reliever_count} relievers, {innings:.1f} bullpen innings, "
            f"{pitch_total} tracked pitches. High-leverage usage is a v1 proxy, not verified leverage index."
        )
        if dangerous_contact:
            names = ", ".join(row.pitcher_name for row in dangerous_contact[:3])
            notes += f" Statcast late-game risk: {len(dangerous_contact)} relievers allowed dangerous contact ({names})."
        fatigue_rows.append(
            BullpenFatigue(
                date=date_str,
                team=team,
                bullpen_innings=round(innings, 2),
                reliever_count=reliever_count,
                high_leverage_used=high_leverage_used,
                back_to_back_risk="unknown",
                fatigue_level=fatigue_level,
                notes=notes,
                confidence="MEDIUM" if relievers else "LOW",
                source="MLB Stats API boxscore",
                retrieved_at=retrieved_at,
            )
        )
    return fatigue_rows
