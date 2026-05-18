# Codex Findings Summary

## What The Repo Is Now

`black-sheep-mlb` is the combined source-of-truth repo for:
- package-style MLB data/prediction code under `black_sheep_mlb/`
- canvas-era model exports and strict-compute snapshots under `canvases/`, `models/`, and `canvases/exports/`
- EchoIQ v3 verification-first research operations under `echoiq_v3/` and `slates/`
- read-only dashboard display under `dashboard/`
- repo-local Codex operating guidance under `.agents/`

## What Was Consolidated

Commit `c007157 docs(echoiq): consolidate live verified workflow` put the May 16 live verified workflow lessons into durable paths:
- `echoiq_v3/docs/framework/`
- `echoiq_v3/prompts/live_verified_workflow/`

The most important new idea is the dual-grade separation:
- `BASEBALL_GRADE`: matchup/research quality
- `BET_GRADE`: current market value after price and EV

## Strongest Parts

1. No-fabrication rules are clear and repeated.
2. EchoIQ labels and gate rules are strong.
3. Postgame/no-hindsight discipline is good.
4. MLB Stats API usage is real and useful.
5. Night Shift can produce research packets and pregame refresh artifacts.
6. Manual input preflight exists.
7. Validation scripts cover v3 row safety and slate structure.
8. Dashboard is read-only and does not mutate model logic.
9. Current code generally degrades cleanly instead of inventing data.
10. May 16 post-audit correctly identified fake precision and market-edge gaps.

## Weakest Parts

1. No stable live player-prop price ingestion loop.
2. Outlier and Ballpark Pal remain manual/authenticated capture layers.
3. Weather/roof verification is not automated end-to-end.
4. Savant deep pitch/zone verification is planned, not operational.
5. The new live workflow prompts have stale path references (`framework/`, `~/EchoIQ`).
6. Canonical labels and final-action labels are mixed in some docs.
7. Daily slate folders are ignored, so local work can disappear unless promoted deliberately.
8. Official betting readiness depends on manual timestamps and source discipline.
9. No single canonical May 18 run command creates a complete verified price-aware package.
10. Product dashboard is not yet an EchoIQ v3 gate/status dashboard.

## What To Do Today

1. Treat May 18 as a research/watchlist run until all gates clear.
2. Use MLB.com/Stats API as schedule, gamePk, status, starter, and lineup source of truth.
3. Recheck MLB lineups close to first pitch; current MLB.com lineups were `TBD`.
4. Capture Outlier HR/TB/Hits props and prices with timestamps.
5. Capture Ballpark Pal run/HR/weather factors.
6. Capture weather/roof status.
7. Calculate implied/no-vig/fair probability and EV only after current price is verified.
8. Keep `BET` empty unless all gates pass.

## What Not To Trust Yet

- Any player-prop `BET` without confirmed lineup and current price.
- Any Ballpark Pal claim not captured today.
- Any Outlier EV tag not independently verified against lineup/starter/weather.
- Any Savant pitch-shape or hot-zone claim not actually pulled today.
- Any estimated price mixed into exact ROI or official EV.
- Any AI narrative from May 16 as current May 18 source truth.

## Exact Next Commands / Prompts

Safe setup check:

```bash
python3 echoiq_v3/scripts/create_slate.py 2026-05-18 --dry-run
```

If Christian approves creating the ignored local slate folder:

```bash
python3 echoiq_v3/scripts/create_slate.py 2026-05-18
```

Manual-input preflight after weather/market/prop/news CSVs are filled:

```bash
python3 -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-18 --preflight-manual-inputs
```

Pregame refresh after manual inputs and lineups are available:

```bash
python3 -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-18 --mode pregame-refresh
python3 -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-18 --summarize-pregame-refresh
```

Prompt to run next:

```text
Use reports/2026-05-18_system_assessment/today_research_workflow.md and reports/2026-05-18_system_assessment/may18_source_capture_template.md. Create/fill a May 18 source-capture packet from MLB.com, Outlier, Ballpark Pal, weather/roof sources, sportsbook prices, and Savant only for candidates. Do not use BET unless every gate in may18_prediction_gate_template.csv clears.
```
