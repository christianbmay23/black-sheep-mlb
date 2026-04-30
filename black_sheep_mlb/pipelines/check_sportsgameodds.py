"""Safe SportsGameOdds live health/dry-run probe.

The default mode makes zero live requests. Passing ``--live`` performs one
tightly scoped request only after printing the quota policy and planned budget.
"""
from __future__ import annotations

import argparse
import json
import os
from typing import Any

from black_sheep_mlb.data_sources.sportsgameodds_provider import (
    DEFAULT_DRY_RUN_BOOKMAKERS,
    DEFAULT_DRY_RUN_ODD_IDS,
    DEFAULT_MAX_EVENTS,
    DEFAULT_MAX_OBJECTS,
    DEFAULT_MAX_REQUESTS,
    DEFAULT_TIMEOUT_SECONDS,
    SportsGameOddsProvider,
)


QUOTA_WARNING_LINES = (
    "SportsGameOdds quota policy: account cap is 2.5k objects/month.",
    "SportsGameOdds quota policy: account rate limit is 10 requests/minute.",
    "SportsGameOdds quota policy: account update frequency is 10 minutes; do not poll.",
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", required=True, help="YYYY-MM-DD slate date for audit labeling only.")
    parser.add_argument("--live", action="store_true", help="Allow one tiny live dry-run request.")
    parser.add_argument("--max-events", type=int, default=DEFAULT_MAX_EVENTS)
    parser.add_argument("--max-requests", type=int, default=DEFAULT_MAX_REQUESTS)
    parser.add_argument("--max-objects", type=int, default=DEFAULT_MAX_OBJECTS)
    parser.add_argument(
        "--timeout",
        type=_positive_number,
        default=DEFAULT_TIMEOUT_SECONDS,
        help="Positive HTTP timeout in seconds for the explicit live dry-run.",
    )
    parser.add_argument(
        "--odd-ids",
        default=",".join(DEFAULT_DRY_RUN_ODD_IDS),
        help="Comma-separated SportsGameOdds oddID values. Keep this tiny.",
    )
    parser.add_argument(
        "--bookmakers",
        default=",".join(DEFAULT_DRY_RUN_BOOKMAKERS),
        help="Comma-separated bookmakerID values. Defaults to two books.",
    )
    parser.add_argument("--base-url", default="https://api.sportsgameodds.com")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    odd_ids = _split_csv(args.odd_ids)
    bookmakers = _split_csv(args.bookmakers)
    budget = {
        "date": args.date,
        "live": bool(args.live),
        "requests_planned": args.max_requests if args.live else 0,
        "max_requests": args.max_requests,
        "max_events": args.max_events,
        "max_objects": args.max_objects,
        "timeout_seconds": args.timeout,
        "leagueID": "MLB",
        "odd_ids": odd_ids,
        "bookmakers": bookmakers,
        "polling": "disabled",
    }

    if not args.live:
        budget["status"] = "not_run_live_flag_required"
        print(json.dumps(budget, indent=2, sort_keys=True))
        return 0

    api_key = os.environ.get("SPORTSGAMEODDS_API_KEY")
    if not api_key:
        budget["status"] = "blocked_missing_sportsgameodds_api_key"
        print(json.dumps(budget, indent=2, sort_keys=True))
        return 2

    if args.max_requests != DEFAULT_MAX_REQUESTS:
        budget["status"] = "blocked_request_budget_exceeds_phase4_cap"
        print(json.dumps(budget, indent=2, sort_keys=True))
        return 2
    if args.max_events > args.max_objects:
        budget["status"] = "blocked_event_budget_exceeds_object_budget"
        print(json.dumps(budget, indent=2, sort_keys=True))
        return 2
    if args.max_events < 1 or args.max_objects < 1:
        budget["status"] = "blocked_invalid_budget"
        print(json.dumps(budget, indent=2, sort_keys=True))
        return 2

    for line in QUOTA_WARNING_LINES:
        print(line)
    print("Planned SportsGameOdds dry-run budget:")
    print(json.dumps(budget, indent=2, sort_keys=True))

    provider = SportsGameOddsProvider(
        api_key=api_key,
        base_url=args.base_url,
        enable_live=True,
        timeout=args.timeout,
    )
    try:
        result = provider.fetch_live_events_dry_run(
            max_events=args.max_events,
            max_requests=args.max_requests,
            max_objects=args.max_objects,
            odd_ids=odd_ids,
            bookmakers=bookmakers,
        )
    except Exception as exc:
        print(
            json.dumps(
                {
                    "provider": "sportsgameodds",
                    "status": "dry_run_failed",
                    "error_type": exc.__class__.__name__,
                    "message": str(exc),
                    "api_key_printed": False,
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 1

    summary = _summarize_payload(result.get("payload"))
    print(
        json.dumps(
            {
                "provider": "sportsgameodds",
                "status": "dry_run_completed",
                "http_status": result.get("status"),
                "request_count": result.get("request_count"),
                "object_count": result.get("object_count"),
                "url": result.get("url"),
                "api_key_printed": False,
                **summary,
            },
            indent=2,
            sort_keys=True,
        )
    )
    return 0


def _split_csv(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split(",") if part.strip()]


def _positive_number(value: str) -> int | float:
    try:
        parsed = float(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("timeout must be a positive number") from exc
    if parsed <= 0:
        raise argparse.ArgumentTypeError("timeout must be a positive number")
    return int(parsed) if parsed.is_integer() else parsed


def _summarize_payload(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        return {"payload_shape": type(payload).__name__}
    data = payload.get("data")
    if isinstance(data, list):
        event_ids = [str(row.get("eventID") or row.get("eventId") or row.get("id") or "") for row in data[:3] if isinstance(row, dict)]
        return {
            "success": payload.get("success"),
            "event_ids_sample": [event_id for event_id in event_ids if event_id],
            "notice_present": bool(payload.get("notice")),
        }
    return {
        "success": payload.get("success"),
        "payload_keys": sorted(str(key) for key in payload.keys()),
        "notice_present": bool(payload.get("notice")),
    }


if __name__ == "__main__":
    raise SystemExit(main())
