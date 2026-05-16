"""Weather-source placeholder adapter for EchoIQ Night Shift."""

from __future__ import annotations

from .data_sources import NightShiftDataSources


def record_weather_status(data_sources: NightShiftDataSources, *, api_key_present: bool) -> None:
    note = (
        "WEATHER_API_KEY is present, but Night Shift v2 does not call a weather endpoint yet."
        if api_key_present
        else "WEATHER_API_KEY is not present; venue weather and roof context remain unverified."
    )
    data_sources.record_optional_source_gap(
        source_name="Weather API",
        affected_artifact="02_next_slate_research/weather.csv, 03_watchlists",
        severity="MEDIUM",
        recommended_fix="Add a weather adapter using a stable provider and venue coordinates/roof metadata.",
        notes=note,
    )
