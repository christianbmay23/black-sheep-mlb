"""Player and pitcher form summaries for Night Shift."""

from __future__ import annotations

from .schemas import PlayerPerformance


def hitter_signal_summary(players: list[PlayerPerformance]) -> dict[str, list[str]]:
    hot: list[str] = []
    cold: list[str] = []
    hr_supporting: list[str] = []
    tb_hits_supporting: list[str] = []
    risky: list[str] = []
    noisy_strong_contact: list[str] = []
    weak_supported: list[str] = []
    statcast_backed: list[str] = []

    for row in players:
        ab = int(row.at_bats or 0)
        hits = int(row.hits or 0)
        tb = int(row.total_bases or 0)
        hr = int(row.home_runs or 0)
        strikeouts = int(row.strikeouts or 0)
        label = f"{row.player_name} ({row.team})"
        tags = _tags(row.statcast_signal_tags)

        if hr > 0:
            hr_supporting.append(f"{label}: {hr} HR, {tb} TB; {row.statcast_signal_note}")
        if hits >= 2 or tb >= 2:
            tb_hits_supporting.append(f"{label}: {hits} H, {tb} TB; {row.statcast_signal_note}")
        if hits >= 3 or tb >= 4:
            hot.append(f"{label}: strong result signal ({hits} H, {tb} TB).")
        if ab >= 4 and hits == 0:
            cold.append(f"{label}: 0-for-{ab}; {row.statcast_signal_note}")
        if hr > 0 and hits <= 1 and strikeouts >= 2:
            risky.append(f"{label}: HR result with volatility flags ({strikeouts} K, limited hit volume).")
        if "LOUD_CONTACT_BAD_BOX" in tags:
            noisy_strong_contact.append(f"{label}: {row.statcast_signal_note}")
        if "WEAK_CONTACT_GOOD_BOX" in tags or "LOW_QUALITY_CONTACT" in tags:
            weak_supported.append(f"{label}: {row.statcast_signal_note}")
        if {"LOUD_CONTACT_CONFIRMED_RESULT", "HR_QUALITY_SIGNAL", "TB_QUALITY_SIGNAL"} & set(tags):
            statcast_backed.append(f"{label}: {row.statcast_signal_note}")

    if players and not any(row.statcast_data_status == "enriched" for row in players):
        noisy_strong_contact.append("Statcast contact-quality fields were unavailable; hard-contact outs remain unresolved.")

    return {
        "hot_hitters": hot[:15],
        "cold_hitters": cold[:15],
        "noisy_box_score_but_strong_underlying_contact": noisy_strong_contact,
        "hr_supporting_indicators": hr_supporting[:15],
        "tb_hits_supporting_indicators": tb_hits_supporting[:20],
        "risky_volatile_profiles": risky[:15],
        "weak_contact_good_box_score": weak_supported[:15],
        "statcast_backed_contact_signals": statcast_backed[:20],
    }


def pitcher_signal_summary(pitchers: list) -> dict[str, list[str]]:
    better: list[str] = []
    worse: list[str] = []
    suppressed: list[str] = []
    dangerous: list[str] = []
    command: list[str] = []
    for row in pitchers:
        tags = _tags(row.statcast_signal_tags)
        label = f"{row.pitcher_name} ({row.team})"
        if "BETTER_THAN_LINE" in tags:
            better.append(f"{label}: {row.contact_quality_allowed_note}")
        if "WORSE_THAN_LINE" in tags:
            worse.append(f"{label}: {row.contact_quality_allowed_note}")
        if "SUPPRESSED_CONTACT" in tags:
            suppressed.append(f"{label}: {row.contact_quality_allowed_note}")
        if {"LOUD_CONTACT_ALLOWED", "BARREL_RISK", "HR_RISK_ALLOWED"} & set(tags):
            dangerous.append(f"{label}: {row.contact_quality_allowed_note}")
        if row.walks and row.walks >= 3:
            command.append(f"{label}: {row.walks} BB; command review needed.")
    unavailable = ["Not available; Statcast did not enrich pitcher rows."] if pitchers and not any(
        row.statcast_data_status == "enriched" for row in pitchers
    ) else []
    return {
        "starters_better_than_result": better[:15] or unavailable,
        "starters_worse_than_result": worse[:15] or unavailable,
        "contact_suppression": suppressed[:15],
        "dangerous_contact_allowed": dangerous[:20],
        "velocity_changes": ["Not available in v2; pybaseball Statcast pitch speeds are not summarized yet."],
        "command_issues": command[:15] or ["Boxscore walks are captured; pitch-level command modeling remains pending."],
    }


def _tags(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split(";") if part.strip()]
