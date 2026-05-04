"""EchoIQ HR Intelligence v1 fixture-first pipeline."""

from black_sheep_mlb.hr_intelligence.runner import run_daily_hr_pipeline

__all__ = ["run_daily_hr_pipeline"]
