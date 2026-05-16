"""Artifact writers for EchoIQ Night Shift."""

from __future__ import annotations

import csv
import json
from dataclasses import asdict
from pathlib import Path
from typing import Iterable

from .config import AgentPaths
from .data_sources import SourceTracker
from .next_slate_research import NextSlateResearchResult
from .postgame_audit import PostgameAuditResult
from .schemas import (
    BULLPEN_FATIGUE_FIELDS,
    GAME_RESULTS_FIELDS,
    LINEUP_STATUS_FIELDS,
    INJURY_NEWS_FIELDS,
    MARKET_SNAPSHOT_FIELDS,
    PITCHER_USAGE_FIELDS,
    PLAYER_PERFORMANCE_FIELDS,
    PROBABLE_PITCHERS_FIELDS,
    VERIFIED_SLATE_FIELDS,
    WATCHLIST_FIELDS,
    WEATHER_FIELDS,
    BullpenFatigue,
    DailyAgentRunResult,
    GameResult,
    LineupStatus,
    PitcherUsage,
    PlayerPerformance,
    ProbablePitcher,
    SlateGame,
    SourceEvent,
    UnresolvedGap,
    WatchlistEntry,
    WeatherContext,
    clean_csv_value,
    dataclass_row,
)


def ensure_output_dirs(paths: AgentPaths) -> None:
    for directory in paths.required_dirs():
        directory.mkdir(parents=True, exist_ok=True)


def write_daily_outputs(
    *,
    paths: AgentPaths,
    slate_date: str,
    postgame_date: str,
    only: str,
    dry_run: bool,
    tracker: SourceTracker,
    postgame: PostgameAuditResult | None,
    preview: NextSlateResearchResult | None,
) -> DailyAgentRunResult:
    if dry_run:
        return DailyAgentRunResult(
            slate_date=slate_date,
            postgame_date=postgame_date,
            output_dir=str(paths.slate_dir),
            dry_run=True,
            only=only,
            files_written=[str(path) for path in _planned_paths(paths, only)],
            source_events=tracker.events,
            unresolved_gaps=tracker.gaps,
            warnings=["Dry run: no files were written and no external sources were called."],
        )

    ensure_output_dirs(paths)
    files_written: list[str] = []
    if postgame is not None:
        _write_csv(paths.game_results_csv, GAME_RESULTS_FIELDS, postgame.game_results)
        _write_csv(paths.player_performance_csv, PLAYER_PERFORMANCE_FIELDS, postgame.player_performance)
        _write_csv(paths.pitcher_usage_csv, PITCHER_USAGE_FIELDS, postgame.pitcher_usage)
        _write_csv(paths.bullpen_fatigue_csv, BULLPEN_FATIGUE_FIELDS, postgame.bullpen_fatigue)
        _write_json(paths.model_grading_json, postgame.model_grading)
        paths.postgame_report.write_text(_postgame_report(postgame, tracker.events), encoding="utf-8")
        files_written.extend(
            [
                str(paths.postgame_report),
                str(paths.game_results_csv),
                str(paths.player_performance_csv),
                str(paths.pitcher_usage_csv),
                str(paths.bullpen_fatigue_csv),
                str(paths.model_grading_json),
            ]
        )

    if preview is not None:
        _write_csv(paths.verified_slate_csv, VERIFIED_SLATE_FIELDS, preview.slate_games)
        _write_csv(paths.probable_pitchers_csv, PROBABLE_PITCHERS_FIELDS, preview.probable_pitchers)
        _write_csv(paths.weather_csv, WEATHER_FIELDS, preview.weather)
        _write_csv(paths.lineup_status_csv, LINEUP_STATUS_FIELDS, preview.lineup_status)
        _write_csv(paths.market_snapshot_csv, MARKET_SNAPSHOT_FIELDS, preview.market_snapshot)
        _write_csv(paths.injury_news_csv, INJURY_NEWS_FIELDS, preview.injury_news)
        _write_json(paths.matchup_notes_json, {"games": [asdict(note) for note in preview.matchup_notes]})
        paths.preview_report.write_text(_preview_report(preview, postgame, tracker.events), encoding="utf-8")
        _write_csv(paths.hr_watchlist_csv, WATCHLIST_FIELDS, preview.watchlists.get("hr", []))
        _write_csv(paths.total_bases_watchlist_csv, WATCHLIST_FIELDS, preview.watchlists.get("total_bases", []))
        _write_csv(paths.hits_watchlist_csv, WATCHLIST_FIELDS, preview.watchlists.get("hits", []))
        _write_csv(paths.game_line_leans_csv, WATCHLIST_FIELDS, preview.watchlists.get("game_line", []))
        files_written.extend(
            [
                str(paths.preview_report),
                str(paths.verified_slate_csv),
                str(paths.probable_pitchers_csv),
                str(paths.weather_csv),
                str(paths.lineup_status_csv),
                str(paths.market_snapshot_csv),
                str(paths.injury_news_csv),
                str(paths.matchup_notes_json),
                str(paths.hr_watchlist_csv),
                str(paths.total_bases_watchlist_csv),
                str(paths.hits_watchlist_csv),
                str(paths.game_line_leans_csv),
            ]
        )

    paths.source_log.write_text(_source_log(tracker.events), encoding="utf-8")
    paths.unresolved_gaps.write_text(_unresolved_gaps(tracker.gaps), encoding="utf-8")
    if paths.run_log.exists():
        files_written.append(str(paths.run_log))
    files_written.extend([str(paths.source_log), str(paths.unresolved_gaps)])

    return DailyAgentRunResult(
        slate_date=slate_date,
        postgame_date=postgame_date,
        output_dir=str(paths.slate_dir),
        dry_run=False,
        only=only,
        files_written=files_written,
        source_events=tracker.events,
        unresolved_gaps=tracker.gaps,
    )


def _planned_paths(paths: AgentPaths, only: str) -> list[Path]:
    if only == "postgame":
        return [
            paths.postgame_report,
            paths.game_results_csv,
            paths.player_performance_csv,
            paths.pitcher_usage_csv,
            paths.bullpen_fatigue_csv,
            paths.model_grading_json,
            paths.source_log,
            paths.unresolved_gaps,
        ]
    if only == "preview":
        return [
            paths.preview_report,
            paths.verified_slate_csv,
            paths.probable_pitchers_csv,
            paths.weather_csv,
            paths.lineup_status_csv,
            paths.market_snapshot_csv,
            paths.injury_news_csv,
            paths.matchup_notes_json,
            paths.hr_watchlist_csv,
            paths.total_bases_watchlist_csv,
            paths.hits_watchlist_csv,
            paths.game_line_leans_csv,
            paths.source_log,
            paths.unresolved_gaps,
        ]
    return paths.all_artifact_paths()


def _write_csv(path: Path, fieldnames: list[str], rows: Iterable[object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            if hasattr(row, "__dataclass_fields__"):
                payload = dataclass_row(row, fieldnames)
            else:
                payload = {field: getattr(row, field, "") for field in fieldnames}
            writer.writerow({key: clean_csv_value(value) for key, value in payload.items()})


def _write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def _postgame_report(result: PostgameAuditResult, source_events: list[SourceEvent]) -> str:
    lines = [
        "# EchoIQ Night Shift — Daily MLB Intelligence Brief",
        "",
        "This report is a research packet only. It does not create official bets. Official plays require later lineup, starter, weather, odds, and market verification.",
        "",
        "## Postgame Audit Header",
        "",
        f"- Postgame audit date: {result.date}",
        f"- Generated timestamp: {result.generated_at}",
        f"- Data completeness rating: {result.data_completeness}",
        f"- Source summary: {_source_summary(source_events)}",
        f"- Statcast status: {_statcast_status_line(result)}",
        "",
        "## Completed Games Table",
        "",
        "| Game | Final Score | Winner | Status | Venue | Start Time |",
        "|---|---:|---|---|---|---|",
    ]
    for game in result.game_results:
        score = _score(game)
        lines.append(
            f"| {game.away_team}@{game.home_team} | {score} | {game.winner or 'NA'} | "
            f"{game.status or 'NA'} | {game.venue or 'NA'} | {game.game_start_time or 'NA'} |"
        )
    if not result.game_results:
        lines.append("| No games found | NA | NA | NA | NA | NA |")

    lines.extend(["", "## Game-By-Game Audit", ""])
    player_by_game: dict[str, list[PlayerPerformance]] = {}
    for player in result.player_performance:
        player_by_game.setdefault(player.game_id, []).append(player)
    pitchers_by_game: dict[str, list[PitcherUsage]] = {}
    for pitcher in result.pitcher_usage:
        pitchers_by_game.setdefault(pitcher.game_id, []).append(pitcher)
    bullpen_by_team = {row.team: row for row in result.bullpen_fatigue}
    for game in result.game_results:
        hitters = sorted(
            player_by_game.get(game.game_id, []),
            key=lambda row: (int(row.total_bases or 0), int(row.hits or 0), int(row.home_runs or 0)),
            reverse=True,
        )[:5]
        pitchers = pitchers_by_game.get(game.game_id, [])
        starters = [row for row in pitchers if row.starter_or_reliever == "starter"]
        lines.extend(
            [
                f"### {game.away_team}@{game.home_team}",
                "",
                f"- Final score: {_score(game)}",
                f"- Offensive summary: {len(player_by_game.get(game.game_id, []))} hitter boxscore rows parsed.",
                f"- Starting pitcher summary: {_join_notes([_pitcher_line(row) for row in starters])}",
                f"- Bullpen usage summary: {_bullpen_line(game.away_team, bullpen_by_team)}; {_bullpen_line(game.home_team, bullpen_by_team)}",
                f"- Notable hitter performances: {_join_notes([_hitter_line(row) for row in hitters])}",
                f"- Notable pitcher performances: {_join_notes([_pitcher_contact_line(row) for row in pitchers if _interesting_pitcher(row)])}",
                "- HR/TB/hits/K notes: boxscore HR, TB, hits, walks, and strikeouts are included in CSV outputs.",
                "- Injuries/scratches/news: not loaded in v2.",
                "- Model grading: see model_grading.json.",
                "- What mattered: final score, player boxscore outcomes, starter workload, and bullpen usage were captured from MLB Stats API.",
                "- What to carry forward: treat result signals as morning research lanes until lineup/weather/odds verification clears.",
                "",
            ]
        )

    lines.extend(["## Contact Quality Signals", ""])
    if result.statcast_summary.status != "available":
        lines.extend(
            [
                f"Statcast query returned {result.statcast_summary.row_count} rows for {result.date} "
                f"({result.statcast_summary.status_classification or result.statcast_summary.status}). "
                "Boxscore analysis only. Contact-quality conclusions are disabled for this run.",
                "",
            ]
        )
    elif result.statcast_summary.unavailable_fields:
        lines.extend(
            [
                "Statcast returned rows, but some optional contact-quality fields were unavailable: "
                f"{', '.join(result.statcast_summary.unavailable_fields)}. Enrichment uses only supported fields.",
                "",
            ]
        )
    for game in result.game_results:
        hitters = [_contact_hitter_line(row) for row in player_by_game.get(game.game_id, []) if _interesting_hitter(row)]
        pitchers = [_pitcher_contact_line(row) for row in pitchers_by_game.get(game.game_id, []) if _interesting_pitcher(row)]
        lines.extend([f"### {game.away_team}@{game.home_team}", ""])
        lines.append(f"- Hitters with notable contact-quality signal: {_join_notes(hitters)}")
        lines.append(f"- Pitchers with notable contact-quality signal: {_join_notes(pitchers)}")
        lines.append(f"- HR/TB carry-forward signals: {_join_notes([line for line in hitters if 'HR_QUALITY_SIGNAL' in line or 'TB_QUALITY_SIGNAL' in line or 'LOUD_CONTACT_BAD_BOX' in line])}")
        lines.append("")

    lines.extend(["## Player Performance Signals", ""])
    for title, values in result.hitter_signals.items():
        lines.extend([f"### {title.replace('_', ' ').title()}", ""])
        lines.extend(_bullet_or_na(values))
        lines.append("")

    lines.extend(["## Pitcher Performance Signals", ""])
    for title, values in result.pitcher_signals.items():
        lines.extend([f"### {title.replace('_', ' ').title()}", ""])
        lines.extend(_bullet_or_na(values))
        lines.append("")

    lines.extend(["## Bullpen Fatigue Report", ""])
    if result.bullpen_fatigue:
        lines.extend(
            [
                "| Team | Bullpen Innings | Relievers | Fatigue | Confidence | Notes |",
                "|---|---:|---:|---|---|---|",
            ]
        )
        for row in result.bullpen_fatigue:
            lines.append(
                f"| {row.team} | {row.bullpen_innings} | {row.reliever_count} | "
                f"{row.fatigue_level} | {row.confidence} | {row.notes} |"
            )
    else:
        lines.append("No bullpen rows available.")

    lines.extend(
        [
            "",
            "## EchoIQ Prediction Grading",
            "",
            f"- Prior prediction artifacts found: {len(result.model_grading.get('prior_prediction_artifacts_found', []))}",
            f"- Prior prediction rows found: {result.model_grading.get('prior_prediction_rows_found', 0)}",
        ]
    )
    if not result.model_grading.get("prior_prediction_artifacts_found"):
        lines.append("- No prior EchoIQ prediction artifact found.")
    elif not result.model_grading.get("prior_prediction_rows_found"):
        lines.append("- Prior prediction files were found, but no prediction rows were available to grade.")
    lines.extend(["", "## Model Improvement Notes", ""])
    lines.extend(_bullet_or_na(result.model_grading.get("model_improvement_notes", [])))
    return "\n".join(lines).rstrip() + "\n"


def _preview_report(
    result: NextSlateResearchResult,
    postgame: PostgameAuditResult | None,
    source_events: list[SourceEvent],
) -> str:
    bullpen_context = postgame.bullpen_fatigue if postgame is not None else []
    major_fatigue = [row for row in bullpen_context if row.fatigue_level in {"HIGH", "EXTREME"}]
    confirmed_lineups = sum(1 for row in result.lineup_status if row.confirmed_lineup_available)
    probable_verified = sum(1 for row in result.probable_pitchers if row.probable_status == "VERIFIED_BY_MLB_STATS")
    games_with_markets = {row.game_id for row in result.market_snapshot if row.status == "available" and not row.player_name}
    games_with_props = {row.game_id for row in result.market_snapshot if row.status == "available" and row.player_name}
    games_with_news = _games_with_news(result)
    lines = [
        "# EchoIQ Night Shift — Daily MLB Intelligence Brief",
        "",
        "This report is a research packet only. It does not create official bets. Official plays require later lineup, starter, weather, odds, and market verification.",
        "",
        "## Next Slate Preview Header",
        "",
        f"- Slate date: {result.slate_date}",
        f"- Generated timestamp: {result.generated_at}",
        f"- Data completeness rating: {result.data_completeness}",
        f"- Source summary: {_source_summary(source_events)}",
        "",
        "## Executive Summary",
        "",
        f"- Scheduled games: {len(result.slate_games)}",
        f"- Games with probable pitchers verified: {probable_verified // 2} of {len(result.slate_games)}",
        f"- Teams with confirmed lineups in MLB schedule payload: {confirmed_lineups}",
        "- Major weather risks: unverified in v3.",
        f"- Major bullpen fatigue spots: {', '.join(row.team for row in major_fatigue) if major_fatigue else 'none from v2 proxy'}",
        f"- Major injury/news risks: {len(result.injury_news)} SportsRadar injury/news rows captured; unresolved unless player/team-specific verification is reviewed.",
        "- Best early research lanes: previous-day hitter boxscore signals, probable starter availability, bullpen fatigue proxies.",
        "- Biggest unresolved gaps: weather, player props, lineup confirmation, Statcast availability on empty dates, and injury/news ambiguity.",
        "",
        "## Verified Slate Table",
        "",
        "| Away | Home | Game Time | Venue | Status | Away SP | Home SP | Lineup | Weather | Odds | Confidence |",
        "|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for game in result.slate_games:
        lines.append(
            f"| {game.away_team} | {game.home_team} | {game.game_time or 'NA'} | {game.venue or 'NA'} | "
            f"{game.game_status or 'NA'} | {game.away_probable_sp or 'TBD'} | {game.home_probable_sp or 'TBD'} | "
            f"{game.lineup_status} | {game.weather_status} | {game.odds_status} | {game.data_completeness} |"
        )
    if not result.slate_games:
        lines.append("| No games found | NA | NA | NA | NA | NA | NA | NA | NA | NA | INCOMPLETE |")

    notes_by_game = {note.game_id: note for note in result.matchup_notes}
    watchlists_by_game: dict[str, list[WatchlistEntry]] = {}
    for market_rows in result.watchlists.values():
        for row in market_rows:
            watchlists_by_game.setdefault(row.game_id, []).append(row)

    lines.extend(["", "## Game-By-Game Preview", ""])
    for game in result.slate_games:
        note = notes_by_game.get(game.game_id)
        rows = watchlists_by_game.get(game.game_id, [])
        lines.extend(
            [
                f"### {game.away_team}@{game.home_team}",
                "",
                f"- Schedule and venue: {game.game_time or 'NA'} at {game.venue or 'NA'}.",
                f"- Probable starters: {game.away_team} {game.away_probable_sp or 'TBD'} vs {game.home_team} {game.home_probable_sp or 'TBD'}.",
                f"- Team recent form: {_join_notes(note.team_context if note else [])}",
                "- Previous game carryover: see postgame audit artifacts when full run is used.",
                f"- Bullpen fatigue context: {_join_notes(note.bullpen_context if note else [])}",
                "- Hitter form notes: see preliminary watchlists below.",
                f"- Starter matchup notes: {_join_notes(note.sp_context if note else [])}",
                f"- Pitch-type matchup notes: {_join_notes(note.pitch_type_context if note else [])}",
                f"- Statcast contact-quality context: {_join_notes(note.statcast_context if note else [])}",
                f"- Batter vs starter history: {_join_notes(note.historical_matchup_context if note else [])}",
                "- Team vs team historical context: not loaded in v2.",
                f"- Weather/park context: {_join_notes(note.weather_park_context if note else [])}",
                f"- Market context: {_context_summary(note.market_context if note else {}, 'notable_price_context', 'market_gaps')}",
                f"- Injuries/news: {_context_summary(note.news_context if note else {}, 'injury_flags', 'news_gaps')}",
                f"- HR watchlist candidates: {_market_names(rows, 'HR')}",
                f"- TB/hits watchlist candidates: {_market_names(rows, '2+ TB', 'Hit')}",
                f"- Game-line lean or pass: {_market_names(rows, 'Game line')}",
                "- What would kill the play: lineup scratch, starter change, weather downgrade, bad price, or missing prop market.",
                f"- Data gaps: {_join_notes(note.unresolved_gaps if note else [])}",
                "",
            ]
        )

    lines.extend(["## Market Availability Snapshot", ""])
    lines.append(f"- Games with moneyline/spread/total rows available: {len(games_with_markets)} of {len(result.slate_games)}")
    lines.append(f"- Games with player props available: {len(games_with_props)} of {len(result.slate_games)}")
    missing_markets = [f"{game.away_team}@{game.home_team}" for game in result.slate_games if game.game_id not in games_with_markets]
    missing_props = [f"{game.away_team}@{game.home_team}" for game in result.slate_games if game.game_id not in games_with_props]
    lines.append(f"- Missing game markets: {', '.join(missing_markets) if missing_markets else 'none'}")
    lines.append(f"- Missing player props: {', '.join(missing_props) if missing_props else 'none'}")
    lines.append("- Stale markets: not promoted by v3; inspect market_snapshot.csv last_updated before use.")
    lines.append("- Official plays: none. v3 writes research context only.")
    lines.append("")

    lines.extend(["## Injury / News Risk Report", ""])
    if result.injury_news:
        lines.extend(["| Player/Team | Status | Type | Confidence | Source |", "|---|---|---|---|---|"])
        for row in result.injury_news[:25]:
            subject = row.player_name or row.team or "Unknown"
            lines.append(f"| {subject} | {row.status or 'UNVERIFIED'} | {row.injury_or_news_type or 'news'} | {row.confidence} | {row.source} |")
    else:
        lines.append("No verified injury/news rows were captured. Treat news and injury status as unresolved.")
    lines.append("")

    lines.extend(["## Verification Gates", ""])
    lines.extend(["| Game | Starter Verified | Lineup Confirmed | Weather Verified | Odds Available | Player Props Available | News Checked | Official Bet Eligible |", "|---|---|---|---|---|---|---|---|"])
    for game in result.slate_games:
        starter_ok = bool(game.away_probable_sp and game.home_probable_sp)
        lines.append(
            f"| {game.away_team}@{game.home_team} | {_yes_no(starter_ok)} | {_yes_no(game.lineup_status == 'CONFIRMED')} | "
            f"{_yes_no(game.weather_status == 'VERIFIED')} | {_yes_no(game.game_id in games_with_markets)} | "
            f"{_yes_no(game.game_id in games_with_props)} | {_yes_no(game.game_id in games_with_news)} | false |"
        )
    if not result.slate_games:
        lines.append("| No games found | no | no | no | no | no | no | false |")
    lines.append("")

    lines.extend(["## Watchlist Market Context", ""])
    all_watchlist_rows = [row for market_rows in result.watchlists.values() for row in market_rows]
    if all_watchlist_rows:
        lines.extend(["| Entry | Market | Price | Implied Probability | Still Not Official Because |", "|---|---|---:|---:|---|"])
        for row in all_watchlist_rows:
            entry = row.player_name or row.team
            price = row.best_price if row.best_price not in (None, "") else "NA"
            implied = row.implied_probability if row.implied_probability is not None else "NA"
            lines.append(f"| {entry} | {row.market} | {price} | {implied} | {row.verification_gates_missing or 'verification gates pending'} |")
    else:
        lines.append("No preliminary watchlist rows were generated.")
    lines.append("")

    lines.extend(["## HR Watchlist Section", ""])
    lines.extend(_watchlist_section(result.watchlists.get("hr", [])))
    lines.extend(["", "## Total Bases Watchlist Section", ""])
    lines.extend(_watchlist_section(result.watchlists.get("total_bases", [])))
    lines.extend(["", "## Hits Watchlist Section", ""])
    lines.extend(_watchlist_section(result.watchlists.get("hits", [])))
    lines.extend(["", "## Game-Line Lean Section", ""])
    lines.extend(_watchlist_section(result.watchlists.get("game_line", [])))
    lines.extend(
        [
            "",
            "## Morning Action Plan",
            "",
            "- Check official lineups and scratches before promoting any row.",
            "- Refresh weather/roof context for every outdoor venue.",
            "- Verify probable starters remained intact.",
            "- Pull current odds and player-prop markets before calculating edge.",
            "- Keep rows as research only until gates pass; no official picks are created by Night Shift.",
        ]
    )
    return "\n".join(lines).rstrip() + "\n"


def _source_log(events: list[SourceEvent]) -> str:
    lines = ["# EchoIQ Night Shift Source Log", ""]
    if not events:
        lines.append("No source calls recorded.")
        return "\n".join(lines) + "\n"
    for event in events:
        status = "success" if event.success else "failure"
        lines.extend(
            [
                f"## {event.source_name}",
                "",
                f"- endpoint/file/adapter used: {event.endpoint}",
                f"- retrieval timestamp: {event.retrieved_at}",
                f"- success/failure: {status}",
                f"- record count: {event.record_count}",
                f"- notes: {event.notes or 'NA'}",
                f"- error summary: {event.error_summary or 'NA'}",
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def _unresolved_gaps(gaps: list[UnresolvedGap]) -> str:
    lines = ["# EchoIQ Night Shift Unresolved Gaps", ""]
    if not gaps:
        lines.append("No unresolved gaps recorded.")
        return "\n".join(lines) + "\n"
    lines.extend(
        [
            "| Missing Source | Affected Artifact | Affected Games/Players | Severity | Recommended Fix | Output Degraded |",
            "|---|---|---|---|---|---|",
        ]
    )
    for gap in gaps:
        lines.append(
            f"| {gap.missing_source} | {gap.affected_artifact} | {gap.affected_games_players} | "
            f"{gap.severity} | {gap.recommended_fix} | {'yes' if gap.output_degraded else 'no'} |"
        )
    return "\n".join(lines).rstrip() + "\n"


def _source_summary(events: list[SourceEvent]) -> str:
    if not events:
        return "No source calls recorded."
    successes = sum(1 for event in events if event.success)
    failures = len(events) - successes
    names = sorted({event.source_name for event in events})
    return f"{successes} successful source events, {failures} failed/skipped events across {', '.join(names)}."


def _statcast_status_line(result: PostgameAuditResult) -> str:
    summary = result.statcast_summary
    classification = summary.status_classification or summary.status
    if summary.status == "available":
        optional = f"; missing optional fields: {', '.join(summary.unavailable_fields)}" if summary.unavailable_fields else ""
        return f"{classification}; {summary.row_count} rows enriched where player IDs matched{optional}."
    return f"{classification}; {summary.row_count} rows. Boxscore-only contact analysis."


def _score(game: GameResult) -> str:
    if game.away_score is None or game.home_score is None:
        return "NA"
    return f"{game.away_team} {game.away_score}, {game.home_team} {game.home_score}"


def _join_notes(values: Iterable[str]) -> str:
    items = [str(value) for value in values if str(value).strip()]
    return "; ".join(items) if items else "NA"


def _context_summary(payload: dict[str, object], primary_key: str, gap_key: str) -> str:
    primary = payload.get(primary_key, []) if payload else []
    gaps = payload.get(gap_key, []) if payload else []
    primary_items = primary if isinstance(primary, list) else [primary]
    gap_items = gaps if isinstance(gaps, list) else [gaps]
    if primary_items:
        return _join_notes(str(item) for item in primary_items)
    return _join_notes(str(item) for item in gap_items)


def _yes_no(value: bool) -> str:
    return "yes" if value else "no"


def _games_with_news(result: NextSlateResearchResult) -> set[str]:
    teams_with_news = {row.team for row in result.injury_news if row.team}
    return {
        game.game_id
        for game in result.slate_games
        if game.away_team in teams_with_news or game.home_team in teams_with_news
    }


def _bullet_or_na(values: Iterable[str]) -> list[str]:
    items = [str(value) for value in values if str(value).strip()]
    if not items:
        return ["- NA"]
    return [f"- {value}" for value in items]


def _pitcher_line(row: PitcherUsage) -> str:
    return (
        f"{row.pitcher_name} ({row.team}): {row.innings_pitched} IP, {row.pitches or 'NA'} pitches, "
        f"{row.earned_runs or 0} ER, {row.statcast_signal_tags or 'no Statcast tag'}"
    )


def _hitter_line(row: PlayerPerformance) -> str:
    return (
        f"{row.player_name} ({row.team}): {row.hits or 0} H, {row.total_bases or 0} TB, "
        f"{row.home_runs or 0} HR, {row.strikeouts or 0} K, {row.statcast_signal_tags or 'no Statcast tag'}"
    )


def _contact_hitter_line(row: PlayerPerformance) -> str:
    return f"{row.player_name} ({row.team}): {row.statcast_signal_tags} - {row.statcast_signal_note}"


def _pitcher_contact_line(row: PitcherUsage) -> str:
    return f"{row.pitcher_name} ({row.team}): {row.statcast_signal_tags} - {row.contact_quality_allowed_note}"


def _interesting_hitter(row: PlayerPerformance) -> bool:
    tags = set(str(row.statcast_signal_tags or "").split(";"))
    return bool(
        tags
        & {
            "LOUD_CONTACT_BAD_BOX",
            "LOUD_CONTACT_CONFIRMED_RESULT",
            "WEAK_CONTACT_GOOD_BOX",
            "HR_QUALITY_SIGNAL",
            "TB_QUALITY_SIGNAL",
            "CONTACT_QUALITY_SIGNAL",
            "VOLATILE_POWER_ONLY",
            "LOW_QUALITY_CONTACT",
        }
    )


def _interesting_pitcher(row: PitcherUsage) -> bool:
    tags = set(str(row.statcast_signal_tags or "").split(";"))
    return bool(
        tags
        & {
            "SUPPRESSED_CONTACT",
            "LOUD_CONTACT_ALLOWED",
            "BARREL_RISK",
            "HR_RISK_ALLOWED",
            "BETTER_THAN_LINE",
            "WORSE_THAN_LINE",
        }
    )


def _bullpen_line(team: str, fatigue_by_team: dict[str, BullpenFatigue]) -> str:
    row = fatigue_by_team.get(team)
    if row is None:
        return f"{team}: no bullpen row"
    return f"{team}: {row.fatigue_level} ({row.notes})"


def _market_names(rows: list[WatchlistEntry], *markets: str) -> str:
    accepted = set(markets)
    names = [row.player_name or row.team for row in rows if row.market in accepted]
    return ", ".join(names) if names else "PASS/none yet"


def _watchlist_section(rows: list[WatchlistEntry]) -> list[str]:
    if not rows:
        return ["No preliminary rows generated."]
    lines = ["| Entry | Team | Opponent | Label | Price | Market Status | Official Eligible | Reason |", "|---|---|---|---|---:|---|---|---|"]
    for row in rows:
        price = row.best_price if row.best_price not in (None, "") else "NA"
        lines.append(
            f"| {row.player_name or row.team} | {row.team} | {row.opponent} | {row.label} | "
            f"{price} | {row.market_status} | false | {row.reason} |"
        )
    return lines
