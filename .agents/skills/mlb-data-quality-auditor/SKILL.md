---
name: mlb-data-quality-auditor
description: Use when auditing slate data quality, provider health, strict snapshot eligibility, missing fields, partial data, market coverage, or source provenance in black-sheep-mlb. Do not use to change model formulas, generate a new slate, or score postgame results.
---

# MLB Data Quality Auditor

## Inputs

- Slate date or slug.
- Target artifact type: provider health, strict snapshot, games CSV, batter outlook CSV, dashboard artifact, or package pipeline output.
- Whether live provider probing is allowed.

## Example Prompts

- "Tell me whether apr25 was a strict-current proof slate."
- "Audit the latest snapshot for missing provider fields before I trust the card."
- "Probe provider health for 2026-04-25 without writing slate outputs."

## Do Not Use When

- The user asks for no API spend; stay in safe artifact-only mode and do not run `provider_health_check.py`.
- The task is to create or refresh the slate; use `black-sheep-daily-slate`.
- The task is postgame scoring, ROI, or tracker output; use `mlb-postgame-backtester`.

## Modes

- Safe artifact-only mode: inspect snapshots, CSVs, reports, and `data/outputs/.../run_summary.json`.
- Live diagnostic mode: run provider probes only when live diagnostics are explicitly needed.

## Workflow

1. Start with existing artifacts before live calls:
   - `canvases/exports/snapshots/<slug>/<slug>-latest.json`
   - `canvases/exports/mlb-pregame-intel-<slug>-games.csv`
   - `canvases/exports/mlb-pregame-intel-<slug>-batter-outlooks.csv`
   - `data/outputs/YYYY-MM-DD/run_summary.json` for package pipeline runs.
2. Check evaluation and provenance fields first:
   - `allow_partial`
   - `evaluation_eligible`
   - `evaluation.status`
   - `runtime_diagnostics`
   - `prop_market_coverage`
   - lineup/starter/weather/provider path fields.
3. Validate strict snapshots when the claim is proof-oriented:

```bash
python3 canvases/exports/validate_strict_snapshot.py --slug <slug>
```

4. Probe providers only when live diagnostics are needed and approved by task context:

```bash
python3 canvases/exports/provider_health_check.py --date YYYY-MM-DD
```

5. Classify blockers exactly: lineup/starter, weather, moneyline/total odds, prop market coverage, API/auth, schema, or settlement timing.

## Expected Output

- A short audit report naming files inspected, strict/partial status, missing fields, provider paths, and whether outputs are evaluable.
- No rewritten artifacts unless the task asks for a fix.

## Validation

- For validator changes: `python3 -m unittest tests.test_strict_snapshot_validator`
- For shared pipeline provenance changes: `python3 -m unittest tests.test_pipeline_units`
- For optional odds behavior: `python3 -m unittest tests.test_free_data_optional_odds`
