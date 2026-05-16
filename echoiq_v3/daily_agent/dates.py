"""Date resolution for EchoIQ Night Shift."""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

DEFAULT_TIMEZONE = "America/Chicago"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


@dataclass(frozen=True)
class ResolvedDates:
    slate_date: date
    postgame_date: date
    timezone: str

    @property
    def slate_date_str(self) -> str:
        return self.slate_date.isoformat()

    @property
    def postgame_date_str(self) -> str:
        return self.postgame_date.isoformat()


def parse_date_token(value: str, *, timezone: str = DEFAULT_TIMEZONE) -> date:
    token = value.strip().lower()
    if token == "today":
        return datetime.now(ZoneInfo(timezone)).date()
    if not DATE_RE.match(token):
        raise argparse.ArgumentTypeError("date must be YYYY-MM-DD or today")
    try:
        return date.fromisoformat(token)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"invalid calendar date: {value}") from exc


def resolve_run_dates(
    *,
    date_token: str | None = None,
    postgame_date: str | None = None,
    slate_date: str | None = None,
    timezone: str = DEFAULT_TIMEZONE,
) -> ResolvedDates:
    if (postgame_date is None) != (slate_date is None):
        raise argparse.ArgumentTypeError("--postgame-date and --slate-date must be provided together")

    if postgame_date and slate_date:
        resolved_slate = parse_date_token(slate_date, timezone=timezone)
        resolved_postgame = parse_date_token(postgame_date, timezone=timezone)
        return ResolvedDates(slate_date=resolved_slate, postgame_date=resolved_postgame, timezone=timezone)

    if date_token is None:
        raise argparse.ArgumentTypeError("provide --date or both --postgame-date and --slate-date")

    resolved_slate = parse_date_token(date_token, timezone=timezone)
    return ResolvedDates(
        slate_date=resolved_slate,
        postgame_date=resolved_slate - timedelta(days=1),
        timezone=timezone,
    )
