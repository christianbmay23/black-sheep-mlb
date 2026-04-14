from datetime import datetime, timezone


def utc_today_str() -> str:
    return datetime.now(timezone.utc).date().isoformat()
