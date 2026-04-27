---
name: mlb-dashboard-builder
description: Use when modifying or validating the read-only Streamlit dashboard, canvas display behavior, artifact discovery, or visualization of generated MLB slate outputs. Do not use for live compute, provider ingestion, model logic, or backtest generation.
---

# MLB Dashboard Builder

## Inputs

- Dashboard request or visualization defect.
- Relevant slate slug/date and generated artifact paths.
- Whether the task concerns Streamlit `dashboard/app.py`, Cursor canvas `.canvas.tsx`, or exported HTML.

## Example Prompts

- "Make the dashboard show why a slate is not evaluable."
- "Fix artifact discovery so the newest snapshot wins over CSV fallback."
- "Check that the canvas TypeScript still compiles after a display-only edit."

## Do Not Use When

- The task needs live provider calls, strict compute, bootstrap, or Odds API usage.
- The task changes probability formulas, recommendation gates, market classification, or export schemas.
- The task grades settled results or writes performance trackers.

## Workflow

1. Confirm whether the dashboard should read generated artifacts only. Do not add provider calls or prediction compute to dashboard code.
2. Inspect:
   - `dashboard/app.py`
   - `tests/test_dashboard_artifacts.py`
   - latest `canvases/exports/snapshots/<slug>/<slug>-latest.json`
   - fallback `canvases/exports/mlb-pregame-intel-<slug>-games.csv`
3. Preserve artifact contracts. If a display change needs new fields, first identify the producer in `build_ml_exports.py` or `pipeline/snapshots.py`.
4. Keep dashboard changes scoped to loading, summarizing, filtering, or presenting existing records.

## Commands

```bash
python3 -m unittest tests.test_dashboard_artifacts
streamlit run dashboard/app.py
```

Use `streamlit run dashboard/app.py` only for interactive UI verification.

For canvas TypeScript:

```bash
npx tsc --noEmit
```

## Expected Output

- Read-only dashboard behavior over snapshots/CSVs.
- Clear display of scored, blocked, missing, partial, and market coverage statuses.
- No hidden data refresh or provider activity.

## Validation

- Run `python3 -m unittest tests.test_dashboard_artifacts` after dashboard loading/summarization changes.
- Run `npx tsc --noEmit` after `.canvas.tsx` changes.
