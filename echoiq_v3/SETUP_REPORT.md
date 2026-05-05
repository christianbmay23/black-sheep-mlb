# EchoIQ v3 Setup Report

Setup time: 2026-05-05 14:15:10 CDT

## What Was Copied Or Created

- Copied the unzipped `EchoIQ_v3_Workflow_Kit` into `echoiq_v3/`.
- Preserved the kit's folder structure: `prompts/`, `templates/`, `schemas/`, `config/`, `checklists/`, `docs/`, `examples/`, `scripts/`, and `references/`.
- Preserved kit root files: `README.md`, `AGENTS.md`, and `VALIDATION_OUTPUT.txt`.
- Added `START_HERE.md` as the lightweight local startup guide.
- Added this `SETUP_REPORT.md`.
- Added missing named template artifacts: `conditional_card.csv`, `lottery_card.csv`, `final_card_report.md`, and `postgame_report.md`.
- Created `slates/_template/` with daily slate subfolders:
  - `00_inputs/`
  - `01_raw_research/`
  - `02_candidates/`
  - `03_verification/`
  - `04_final_card/`
  - `05_postgame/`
  - `06_archive/`
- Updated repo-level `AGENTS.md` with EchoIQ v3 operating rules.

## Existing Repo Modules Discovered

- `black_sheep_mlb/`: package daily prediction pipeline, storage, markets, data sources, and HR intelligence.
- `canvases/`: dated Cursor canvas files for MLB pregame intel.
- `canvases/exports/`: export, strict compute, provider diagnostics, snapshot validation, and backtesting scripts.
- `models/`: shared game and prop model code plus dated slate input files.
- `scripts/`: manual EchoIQ slate analysis and manual-input validation scripts.
- `data/`: cache and manual input folders.
- `dashboard/`: read-only Streamlit artifact dashboard.
- `tests/`: unit tests for model, pipeline, market, strict snapshot, dashboard, and EchoIQ manual-input behavior.
- `docs/`: data-source and workflow documentation.
- `reports/` and `outputs/`: generated reporting/output areas.

## Existing Structure Notes

- Repo-level `AGENTS.md` already existed and was appended to rather than replaced.
- Repo-level `README.md`, `docs/`, `scripts/`, and `data/` already existed.
- `echoiq_v3/` did not exist before setup.
- `slates/` did not exist before setup.
- No destination duplicates were overwritten because the destination folders were new.

## Daily Slate Location

Daily EchoIQ v3 slates should live under:

`slates/<YYYY-MM-DD>/`

Use:

`slates/_template/`

as the folder skeleton. Real date folders should only be created when explicitly requested.

## Validation

Run sample row validation with:

```bash
python3 echoiq_v3/scripts/validate_prediction_rows.py echoiq_v3/examples/may4_style_sample_rows.csv
```

Use the same validator against slate CSV artifacts that follow `schemas/prediction_row_schema.json`.

## GPT And Claude Usage

- GPT/Deep Research should be used later for live/current research, citations, lineups, odds, weather, source verification, and box-score verification.
- Claude should be used later for critique and narrative review only.
- Codex should own the repo-local folder structure, templates, schemas, validation scripts, prompts, generated slate artifacts, and future automation.

## Remaining Gaps

- No slate-creation script exists yet.
- The slate template folders currently provide durable structure, not automated template-copy behavior.
- The validator is lightweight and does not yet enforce every JSON Schema constraint or all ROI bucket separation rules.
- EchoIQ v3 is not wired into the existing dashboard, model pipeline, or postgame automation.
- No live data, paid API, odds scraping, prediction slate, model recompute, or betting-pick generation was run during setup.

## Recommended Next Codex Phase

Phase A: implement a small, no-live-data slate initializer under `echoiq_v3/scripts/create_slate.py`.

Expected scope:

- Accept `--date YYYY-MM-DD`.
- Copy `slates/_template/` to `slates/<YYYY-MM-DD>/`.
- Copy standard CSV/report templates into the correct subfolders.
- Refuse to overwrite existing slate files by default.
- Add focused tests for folder creation and no-overwrite behavior.
- Keep model behavior, odds fetching, live data, dashboard integration, and postgame automation out of scope.
