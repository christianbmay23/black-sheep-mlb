# Codex Workflows

This repo benefits from small, role-specific agents when work can be split without changing the same files. Keep prediction logic, exports, dashboards, and backtests separated unless the task explicitly spans them.

## Default Rules

- Inspect existing artifacts before running provider or compute commands.
- Do not fabricate sports data or silently change model assumptions.
- Use strict-current snapshots for proof claims.
- Keep secrets out of tracked files and final summaries.
- Prefer narrow validation commands, then broaden only when shared contracts changed.
- Do not assign two agents to edit the same files. If write ownership overlaps, keep the work local or sequence it.
- Prefer artifact-only inspection when the user wants speed, no API spend, or a card from already-generated outputs.

## Recommended Subagent Workflows

### Data Quality Agent

Use for strict snapshot checks, provider blocker triage, missing-data audits, and source provenance review.

Do not use for model formula changes, slate generation, dashboard display, or postgame scoring.

Owns:
- `canvases/exports/snapshots/<slug>/`
- `canvases/exports/validate_strict_snapshot.py`
- `canvases/exports/provider_health_check.py`
- `canvases/exports/pipeline/snapshots.py`
- generated games and batter outlook CSVs

Useful commands:

```bash
python3 canvases/exports/validate_strict_snapshot.py --slug <slug>
python3 canvases/exports/provider_health_check.py --date YYYY-MM-DD
python3 -m unittest tests.test_strict_snapshot_validator
```

Example prompt: "Audit apr25 strict eligibility and list provider blockers from existing artifacts."

### Model Output Agent

Use for model probability, tier, market classification, and recommendation logic changes. This role should explain downstream output changes before editing.

Do not use for no-credit artifact extraction, provider probing, dashboard-only changes, or postgame grading.

Owns:
- `models/game_model.py`
- `models/prop_model.py`
- `models/<slug>_inputs.py`
- `canvases/exports/apr16_compute.py`
- `canvases/exports/pipeline/markets.py`

Useful commands:

```bash
python3 -m unittest tests.test_game_model tests.test_prop_model
python3 -m unittest tests.test_pipeline_units
```

Example prompt: "Review the TB market qualification gates and explain which output files would change before editing."

### Dashboard Agent

Use for dashboard or canvas presentation changes that should not call providers or recompute predictions.

Do not use for strict compute, provider ingestion, model logic, or backtest generation.

Owns:
- `dashboard/app.py`
- `tests/test_dashboard_artifacts.py`
- `canvases/*.canvas.tsx`
- `canvases/canvas-types.d.ts`

Useful commands:

```bash
python3 -m unittest tests.test_dashboard_artifacts
npx tsc --noEmit
streamlit run dashboard/app.py
```

Example prompt: "Make the dashboard surface partial market coverage from the latest snapshot without changing compute."

### Validation/Test Agent

Use in parallel with implementation when a patch touches shared helpers, export contracts, or multiple workflow surfaces.

Do not use if validation would run a one-time live provider/API command or if it would write generated artifacts the main task is also editing.

Owns:
- test selection
- command execution
- regression notes

Useful commands:

```bash
python3 -m unittest discover -s tests
npx tsc --noEmit
```

Example prompt: "Run the relevant unit tests and TypeScript check for this docs/dashboard-only patch."

### Backtesting Agent

Use for postgame scoring, prop results generation, performance summaries, and aggregate backtest review.

Do not use for pregame slate creation, provider-health probing, dashboard display, or model formula changes.

Owns:
- `canvases/exports/backtest_tracker.py`
- `canvases/exports/prop_backtest_tracker.py`
- `canvases/exports/generate_boxscore_backtest_inputs.py`
- `canvases/exports/aggregate_game_backtests.py`
- generated tracker and summary files

Useful commands:

```bash
python3 canvases/exports/backtest_tracker.py --date YYYY-MM-DD
python3 canvases/exports/generate_boxscore_backtest_inputs.py --date YYYY-MM-DD
python3 canvases/exports/prop_backtest_tracker.py --date YYYY-MM-DD
python3 canvases/exports/aggregate_game_backtests.py
```

Example prompt: "After apr25 settles, update the game and prop trackers and report ROI caveats."

## When To Avoid Subagents

- Single-file documentation edits.
- A live provider run that should happen once to avoid credit waste.
- Any task where the next step depends on one exact current artifact.
- Broad edits where agents would touch the same files.

## Commit Checklist

- Check `git status --short`.
- Stage only files owned by the task.
- Keep generated artifacts out of guidance-only commits.
- Mention whether any live provider/API/model/backtest commands were avoided.
- Use a concise scoped message such as `docs(codex): refine workflow guidance`.

## Handoff Checklist

Each agent should return:

- Files inspected.
- Files changed.
- Whether outputs may differ.
- Commands run and exact result.
- Risks, blockers, and whether any live data/API calls were used.
