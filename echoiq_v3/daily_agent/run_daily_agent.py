"""CLI entrypoint for EchoIQ Night Shift."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from .config import AgentConfig
from .data_sources import NightShiftDataSources, SourceTracker
from .dates import resolve_run_dates
from .mlb_stats_client import NightShiftMLBStatsClient
from .manual_inputs import ManualInputPreflightResult, run_manual_input_preflight
from .next_slate_research import run_next_slate_research
from .odds_client import diagnose_markets
from .postgame_learning import run_postgame_learning_mode
from .postgame_audit import run_postgame_audit
from .pregame_refresh import run_pregame_refresh_mode
from .pregame_summary import format_pregame_refresh_summary, summarize_pregame_refresh_artifacts
from .report_writer import ensure_output_dirs, write_daily_outputs
from .schemas import DailyAgentRunResult
from .sportsradar_client import diagnose_sportsradar
from .statcast_client import NightShiftStatcastClient
from .weather_client import record_weather_status

LOGGER = logging.getLogger("echoiq_v3.daily_agent")


def run_daily_agent(
    *,
    date_token: str | None = None,
    postgame_date: str | None = None,
    slate_date: str | None = None,
    only: str = "full",
    mode: str = "daily",
    dry_run: bool = False,
    force_refresh: bool = False,
    offline: bool = False,
    as_of: str = "",
    game_id: str | None = None,
    verbose: bool = False,
    config: AgentConfig | None = None,
) -> DailyAgentRunResult:
    config = config or AgentConfig.from_env()
    resolved = resolve_run_dates(
        date_token=date_token,
        postgame_date=postgame_date,
        slate_date=slate_date,
        timezone=config.timezone,
    )
    paths = config.paths_for(resolved.slate_date_str, resolved.postgame_date_str)
    _configure_logging(paths.run_log, dry_run=dry_run, verbose=verbose)

    LOGGER.info(
        "Starting EchoIQ Night Shift: slate_date=%s postgame_date=%s only=%s mode=%s dry_run=%s offline=%s force_refresh=%s",
        resolved.slate_date_str,
        resolved.postgame_date_str,
        only,
        mode,
        dry_run,
        offline,
        force_refresh,
    )

    tracker = SourceTracker(timezone=config.timezone)
    if mode == "pregame-refresh":
        mlb_client = NightShiftMLBStatsClient(base_url=config.mlb_stats_api_base)
        data_sources = NightShiftDataSources(tracker=tracker, mlb_client=mlb_client, offline=offline)
        return run_pregame_refresh_mode(
            paths=paths,
            slate_date=resolved.slate_date_str,
            postgame_date=resolved.postgame_date_str,
            data_sources=data_sources,
            tracker=tracker,
            repo_root=config.repo_root,
            dry_run=dry_run,
            offline=offline,
            force_refresh=force_refresh,
            as_of=as_of,
            game_id=game_id,
            sportsradar_enabled=config.sportsradar_enabled,
            sportsradar_api_key_present=config.sportsradar_api_key_present,
            sportsradar_base_url=config.sportsradar_mlb_api_base,
            sportsradar_access_level=config.sportsradar_access_level,
            odds_api_key_present=config.odds_api_key_present,
            weather_api_key_present=config.weather_api_key_present,
        )

    if mode == "postgame-learning":
        mlb_client = NightShiftMLBStatsClient(base_url=config.mlb_stats_api_base)
        data_sources = None if dry_run else NightShiftDataSources(tracker=tracker, mlb_client=mlb_client, offline=offline)
        return run_postgame_learning_mode(
            paths=paths,
            slate_date=resolved.slate_date_str,
            repo_root=config.repo_root,
            data_sources=data_sources,
            dry_run=dry_run,
            offline=offline,
            force_refresh=force_refresh,
        )

    if dry_run:
        return write_daily_outputs(
            paths=paths,
            slate_date=resolved.slate_date_str,
            postgame_date=resolved.postgame_date_str,
            only=only,
            dry_run=True,
            tracker=tracker,
            postgame=None,
            preview=None,
        )

    ensure_output_dirs(paths)
    mlb_client = NightShiftMLBStatsClient(base_url=config.mlb_stats_api_base)
    data_sources = NightShiftDataSources(tracker=tracker, mlb_client=mlb_client, offline=offline)
    _record_optional_sources(config, data_sources)

    postgame = None
    preview = None
    if only in {"full", "postgame"}:
        postgame = run_postgame_audit(
            postgame_date=resolved.postgame_date_str,
            repo_root=config.repo_root,
            data_sources=data_sources,
            force_refresh=force_refresh,
        )
    if only in {"full", "preview"}:
        preview = run_next_slate_research(
            slate_date=resolved.slate_date_str,
            data_sources=data_sources,
            postgame_result=postgame,
            repo_root=config.repo_root,
            force_refresh=force_refresh,
            sportsradar_enabled=config.sportsradar_enabled,
            sportsradar_api_key_present=config.sportsradar_api_key_present,
            sportsradar_base_url=config.sportsradar_mlb_api_base,
            sportsradar_access_level=config.sportsradar_access_level,
            odds_api_key_present=config.odds_api_key_present,
        )

    result = write_daily_outputs(
        paths=paths,
        slate_date=resolved.slate_date_str,
        postgame_date=resolved.postgame_date_str,
        only=only,
        dry_run=False,
        tracker=tracker,
        postgame=postgame,
        preview=preview,
    )
    LOGGER.info("EchoIQ Night Shift complete. files_written=%s gaps=%s", len(result.files_written), len(result.unresolved_gaps))
    return result


def _record_optional_sources(config: AgentConfig, data_sources: NightShiftDataSources) -> None:
    record_weather_status(data_sources, api_key_present=config.weather_api_key_present)


def _configure_logging(log_path: Path, *, dry_run: bool, verbose: bool) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    handlers: list[logging.Handler] = [logging.StreamHandler()]
    if not dry_run:
        log_path.parent.mkdir(parents=True, exist_ok=True)
        handlers.append(logging.FileHandler(log_path, encoding="utf-8"))
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        handlers=handlers,
        force=True,
    )


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run EchoIQ Night Shift daily MLB intelligence agent.")
    parser.add_argument("--date", dest="date_token", help="Slate date in YYYY-MM-DD format, or today.")
    parser.add_argument("--postgame-date", help="Explicit postgame audit date in YYYY-MM-DD format.")
    parser.add_argument("--slate-date", help="Explicit slate preview date in YYYY-MM-DD format.")
    parser.add_argument("--only", choices=["full", "postgame", "preview"], default="full", help="Limit run scope.")
    parser.add_argument("--mode", choices=["daily", "pregame-refresh", "postgame-learning"], default="daily", help="Run the normal daily packet, pregame refresh, or postgame learning engine.")
    parser.add_argument("--pregame-refresh", action="store_true", help="Shortcut for --mode pregame-refresh.")
    parser.add_argument("--postgame-learning", action="store_true", help="Shortcut for --mode postgame-learning.")
    parser.add_argument(
        "--preflight-manual-inputs",
        action="store_true",
        help="Validate local manual operator CSVs and exit without running the daily agent or pregame refresh.",
    )
    parser.add_argument(
        "--summarize-pregame-refresh",
        action="store_true",
        help="Read existing pregame refresh CSV/log artifacts and print the compact live-ops summary.",
    )
    parser.add_argument("--as-of", default="", help="Operator as-of time for pregame refresh, e.g. 16:30.")
    parser.add_argument("--game-id", help="Limit pregame refresh to one MLB Stats API gamePk.")
    parser.add_argument("--dry-run", action="store_true", help="Resolve dates and planned artifacts without writing files.")
    parser.add_argument("--force-refresh", action="store_true", help="Bypass cached Statcast results when querying pybaseball; MLB Stats calls remain live when online.")
    parser.add_argument("--offline", action="store_true", help="Write degraded artifacts without external source calls.")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging.")
    parser.add_argument("--diagnose-statcast", action="store_true", help="Run a Statcast/Baseball Savant diagnostic for --postgame-date or --date and exit.")
    parser.add_argument("--diagnose-markets", action="store_true", help="Report market/news provider configuration and exit without live calls.")
    parser.add_argument("--diagnose-sportsradar", action="store_true", help="Report SportsRadar configuration and redacted endpoints without live calls.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    try:
        if args.preflight_manual_inputs:
            config = AgentConfig.from_env()
            resolved = resolve_run_dates(
                date_token=args.date_token,
                postgame_date=args.postgame_date,
                slate_date=args.slate_date,
                timezone=config.timezone,
            )
            paths = config.paths_for(resolved.slate_date_str, resolved.postgame_date_str)
            result = run_manual_input_preflight(
                slate_date=resolved.slate_date_str,
                repo_root=config.repo_root,
                output_path=paths.manual_input_preflight_csv,
            )
            _print_manual_preflight_summary(result)
            return 1 if result.status == "FAIL" else 0
        if args.summarize_pregame_refresh:
            config = AgentConfig.from_env()
            resolved = resolve_run_dates(
                date_token=args.date_token,
                postgame_date=args.postgame_date,
                slate_date=args.slate_date,
                timezone=config.timezone,
            )
            paths = config.paths_for(resolved.slate_date_str, resolved.postgame_date_str)
            _print_pregame_refresh_summary(paths.slate_dir)
            return 0
        if args.diagnose_statcast:
            config = AgentConfig.from_env()
            date_str = _diagnostic_postgame_date(args, config)
            diagnostics = NightShiftStatcastClient().fetch_daily_rows_with_diagnostics(
                date_str=date_str,
                timezone=config.timezone,
                force_refresh=args.force_refresh,
            )[1]
            print(json.dumps(diagnostics.as_dict(), indent=2, ensure_ascii=False))
            return 0
        if args.diagnose_markets:
            config = AgentConfig.from_env()
            date_str = _diagnostic_slate_date(args, config)
            print(
                json.dumps(
                    diagnose_markets(
                        slate_date=date_str,
                        odds_key_present=config.odds_api_key_present,
                        sportsradar_enabled=config.sportsradar_enabled,
                        sportsradar_key_present=config.sportsradar_api_key_present,
                    ),
                    indent=2,
                    ensure_ascii=False,
                )
            )
            return 0
        if args.diagnose_sportsradar:
            config = AgentConfig.from_env()
            date_str = _diagnostic_slate_date(args, config)
            print(
                json.dumps(
                    diagnose_sportsradar(
                        slate_date=date_str,
                        enabled=config.sportsradar_enabled,
                        api_key_present=config.sportsradar_api_key_present,
                        base_url=config.sportsradar_mlb_api_base,
                        access_level=config.sportsradar_access_level,
                    ),
                    indent=2,
                    ensure_ascii=False,
                )
            )
            return 0
        result = run_daily_agent(
            date_token=args.date_token,
            postgame_date=args.postgame_date,
            slate_date=args.slate_date,
            only=args.only,
            mode=_selected_mode(args),
            dry_run=args.dry_run,
            force_refresh=args.force_refresh,
            offline=args.offline,
            as_of=args.as_of,
            game_id=args.game_id,
            verbose=args.verbose,
        )
    except argparse.ArgumentTypeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    _print_summary(result)
    return 0


def _diagnostic_postgame_date(args: argparse.Namespace, config: AgentConfig) -> str:
    if args.postgame_date:
        return args.postgame_date
    resolved = resolve_run_dates(
        date_token=args.date_token,
        postgame_date=args.postgame_date,
        slate_date=args.slate_date,
        timezone=config.timezone,
    )
    return resolved.postgame_date_str


def _diagnostic_slate_date(args: argparse.Namespace, config: AgentConfig) -> str:
    if args.slate_date:
        return args.slate_date
    resolved = resolve_run_dates(
        date_token=args.date_token,
        postgame_date=args.postgame_date,
        slate_date=args.slate_date,
        timezone=config.timezone,
    )
    return resolved.slate_date_str


def _print_summary(result: DailyAgentRunResult) -> None:
    mode = "DRY RUN" if result.dry_run else "RUN"
    print(f"EchoIQ Night Shift {mode}")
    print(f"Slate date: {result.slate_date}")
    print(f"Postgame date: {result.postgame_date}")
    print(f"Output directory: {result.output_dir}")
    print(f"Scope: {result.only}")
    print("Files planned:" if result.dry_run else "Files written:")
    for path in result.files_written:
        print(f"- {path}")
    if not result.files_written:
        print("- none")
    print(f"Source events: {len(result.source_events)}")
    print(f"Unresolved gaps: {len(result.unresolved_gaps)}")
    for warning in result.warnings:
        print(f"Warning: {warning}")
    if result.only == "postgame-learning":
        _print_postgame_learning_summary(result.summary)
    if result.only == "pregame-refresh" and not result.dry_run:
        print("")
        _print_pregame_refresh_summary(Path(result.output_dir))


def _selected_mode(args: argparse.Namespace) -> str:
    if args.postgame_learning:
        return "postgame-learning"
    if args.pregame_refresh:
        return "pregame-refresh"
    return args.mode


def _print_postgame_learning_summary(summary: dict[str, object]) -> None:
    print("")
    print("Postgame Learning Summary")
    print(f"- games graded: {summary.get('games_graded', 0)}")
    print(f"- player predictions graded: {summary.get('player_predictions_graded', 0)}")
    print(f"- HR hit rate: {summary.get('hr_hit_rate', 'NA')}")
    print(f"- TB hit rate: {summary.get('tb_hit_rate', 'NA')}")
    print(f"- final chat-board game lean record: {summary.get('final_chat_board_game_lean_record', summary.get('game_lean_record', '0-0'))}")
    print(f"- all game-lean rows record: {summary.get('all_game_lean_rows_record', summary.get('game_lean_record', '0-0'))}")
    print(f"- repo watchlist game lean record: {summary.get('repo_watchlist_game_lean_record', '0-0')}")
    print(f"- lottery discussion game lean record: {summary.get('lottery_discussion_game_lean_record', '0-0')}")
    print(f"- right-team/wrong-player count: {summary.get('right_team_wrong_player_count', 0)}")
    print(f"- hidden winners count: {summary.get('hidden_winners_count', 0)}")
    lessons = list(summary.get("top_5_lessons", []) or [])
    print("- top 5 lessons:")
    if not lessons:
        print("  - none")
    for lesson in lessons[:5]:
        print(f"  - {lesson}")


def _print_manual_preflight_summary(result: ManualInputPreflightResult) -> None:
    print("EchoIQ Manual Input Preflight")
    print(f"Slate date: {result.slate_date}")
    print("")
    for file_result in result.file_results:
        print(file_result.display_name)
        print(f"- path: {file_result.path}")
        print(f"- status: {file_result.status}")
        print(f"- valid rows: {file_result.valid_rows}")
        print(f"- invalid rows: {file_result.invalid_rows}")
        print(f"- warnings: {file_result.warnings}")
        print(f"- fatal errors: {file_result.fatal_errors}")
        print(f"- safe_to_merge: {str(file_result.safe_to_merge).lower()}")
        notes = "; ".join(file_result.notes) if file_result.notes else "none"
        print(f"- notes: {notes}")
        print("")
    print("Overall:")
    print(f"- status: {result.status}")
    print(f"- safe_to_run_pregame_refresh: {str(result.safe_to_run_pregame_refresh).lower()}")
    next_action = (
        "fix fatal schema/read errors before pregame refresh"
        if result.status == "FAIL"
        else "fill verified markets/props/weather/news if available, then run pregame refresh"
    )
    print(f"- next action: {next_action}")
    if result.output_written and result.output_path is not None:
        print(f"- report: {result.output_path}")


def _print_pregame_refresh_summary(slate_dir: Path) -> None:
    summary = summarize_pregame_refresh_artifacts(slate_dir)
    for line in format_pregame_refresh_summary(summary):
        print(line)


if __name__ == "__main__":
    sys.exit(main())
