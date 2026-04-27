---
name: black-sheep-daily-slate
description: Use when working on a dated MLB slate, daily pregame card, canvas/export refresh, strict compute, snapshot proof, or artifact-only card extraction in black-sheep-mlb. Do not use for package-pipeline refactors, dashboard-only display changes, or postgame scoring.
---

# Black Sheep Daily Slate

## Inputs

- Slate date in `YYYY-MM-DD` or slug form such as `apr26`.
- User intent: scaffold, strict compute, partial diagnosis, export-only, or artifact-only readout.
- Any stated provider/credit limits.

## Example Prompts

- "Use the existing apr25 artifacts and give me the card without spending API credits."
- "Run a strict slate refresh for 2026-04-25 and validate the snapshot."
- "Bootstrap tomorrow's slate scaffold, but label anything projected or missing."

## Do Not Use When

- The task is only dashboard rendering; use `mlb-dashboard-builder`.
- The task is postgame grading or tracker generation; use `mlb-postgame-backtester`.
- The user asks to avoid provider/API spend; stay in safe artifact-only mode and do not run bootstrap, provider health checks, strict compute, or Odds API commands.

## Modes

- Safe artifact-only mode: read existing canvas, CSV, HTML report, and latest snapshot only. This is the default for card extraction and no-credit requests.
- Strict compute mode: run live compute only for an official pregame refresh, then validate strict eligibility.
- Partial diagnostic mode: use `--allow-partial` only to expose blockers; never present those outputs as an official card.

## Workflow

1. Inspect current artifacts for the date before running providers:
   - `models/<slug>_inputs.py`
   - `canvases/mlb-pregame-intel-<slug>.canvas.tsx`
   - `canvases/exports/mlb-pregame-intel-<slug>-games.csv`
   - `canvases/exports/mlb-pregame-intel-<slug>-batter-outlooks.csv`
   - `canvases/exports/mlb-pregame-intel-<slug>-report.html`
   - `canvases/exports/snapshots/<slug>/<slug>-latest.json`
2. If the user wants no new provider spend, extract from existing artifacts only.
3. If the game list must be refreshed, run bootstrap only when needed:

```bash
python3 canvases/exports/bootstrap_live_slate.py --date YYYY-MM-DD
```

4. For official prediction output, use strict compute unless the user explicitly wants diagnosis:

```bash
python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute
python3 canvases/exports/validate_strict_snapshot.py --slug <slug>
```

5. Use partial mode only for diagnosis or early scaffold work:

```bash
python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute --allow-partial
```

## Expected Output

- Dated canvas, games CSV, batter outlook CSV, HTML report, and snapshot when compute/export runs.
- A card or blocker report that clearly separates strict/evaluable rows from partial, projected, missing, or unverified rows.

## Validation

- Strict card: `python3 canvases/exports/validate_strict_snapshot.py --slug <slug>`
- Canvas TypeScript: `npx tsc --noEmit`
- Shared code change: run the narrowest relevant `python3 -m unittest ...`, then full discovery when risk is broad.

## Stop Conditions

- Do not fabricate missing lineups, odds, weather, prop markets, or model output.
- If strict compute fails, report the exact provider or schema blocker instead of rerunning repeatedly.
