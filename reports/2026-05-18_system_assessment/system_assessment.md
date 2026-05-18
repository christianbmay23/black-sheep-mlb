# EchoIQ / black-sheep-mlb System Assessment

Date: 2026-05-18  
Mode: system-wide repo/workflow assessment plus May 18 pregame workflow prep  
Scope: safe inspection, documentation artifacts only. No paid APIs, no provider recompute, no commits, no force-add of ignored slate folders.

## Sources Inspected

Repo orientation:
- `README.md`, `AGENTS.md`, `WORKFLOW.txt`
- `echoiq_v3/AGENTS.md`, `echoiq_v3/README.md`, `echoiq_v3/START_HERE.md`
- `echoiq_v3/prompts/live_verified_workflow/*`
- `echoiq_v3/docs/framework/*`
- `echoiq_v3/daily_agent/*`, `echoiq_v3/scripts/*`
- `black_sheep_mlb/pipelines/*`, `black_sheep_mlb/hr_intelligence/*`
- `slates/_template/`, `slates/2026-05-14/`, `slates/2026-05-15/`, local ignored `slates/2026-05-16/`

Live/public sources checked:
- MLB.com schedule: https://www.mlb.com/schedule
- MLB.com probable pitchers: https://www.mlb.com/probable-pitchers/2026-5-18
- MLB.com starting lineups: https://www.mlb.com/starting-lineups
- MLB Stats API schedule: https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=2026-05-18&hydrate=probablePitcher,team,venue

## Executive Verdict

The repo is now a credible source-of-truth workspace for EchoIQ research operations. It has a strong safety posture, clear label taxonomy, validation scripts, a daily-agent scaffold, local manual-input paths, read-only dashboard support, and a growing framework for separating baseball signal from betting value.

It is not yet production-grade for official betting decisions. The strongest pieces are auditability, slate-folder discipline, no-fabrication rules, and postgame learning templates. The weakest pieces are live price ingestion, Ballpark Pal/Outlier capture formalization, lineup/weather timestamping, and the gap between rich narrative research and reproducible, current, priced EV.

The May 18 slate is not ready for `BET` labels from the repo alone. MLB schedule/starters are verifiable, but MLB.com lineups were still `TBD` during this assessment, and no current Outlier, sportsbook, Ballpark Pal, weather/roof, or Savant candidate pulls were captured into repo artifacts.

## Current Architecture

### `black_sheep_mlb/`

Package-style data and prediction pipeline. It contains:
- free-data-first MLB Stats API client and optional pybaseball wrapper
- optional odds provider adapters and market cache
- daily prediction pipeline that deliberately emits neutral/low-confidence predictions when rich features are missing
- EchoIQ slate reporting layer that can generate game, prop, source-log, gap, and final-card shaped artifacts
- HR intelligence module with explicit kill flags, edge calculations, and audit logs

Assessment: this is the closest thing to executable production code. It is conservative, test-covered, and mostly honest about missing features. It is not yet the full EchoIQ live verified workflow because player prop prices, Ballpark Pal, Outlier, and full Statcast/Savant pulls are not first-class automated sources.

### `echoiq_v3/`

Durable workflow operating system. It contains:
- label/gate definitions
- v3 CSV templates and schemas
- validation scripts
- daily-agent code for Night Shift, pregame refresh, and postgame learning
- consolidated framework docs for dual grading, EV, price ingestion, verification taxonomy, matchup structures, Savant planning, and postgame grading
- prompts for broad research, verification, implementation, late-market checks, and the new live verified workflow

Assessment: this is the correct long-term source of truth for EchoIQ process, but it still has two overlapping workflow families: older v3 SOP/prompts and the newly consolidated live verified workflow. The new framework docs should become official, but their paths and naming need cleanup.

### `slates/`

Daily artifact workspace. It is ignored by git via `slates/*/`, with only the template preserved. It contains:
- `_template/` canonical skeleton
- May 14 dry-run workflow using v3 official-card/watchlist/pass/postgame folders
- May 15 Night Shift style workflow with postgame audit, next-slate research, pregame refresh, watchlists, and postgame learning
- local ignored May 16 live verified artifacts copied in as lessons

Assessment: correct place for dated work, but ignored folders create preservation risk. That is acceptable for local scratch, but official exemplars need curated commits or promoted templates/docs.

### `scripts/`

Legacy/manual EchoIQ analysis helpers:
- `analyze_mlb_slate.py`
- `analyze_single_game.py`
- `validate_echoiq_manual_inputs.py`
- `run_night_shift.sh`

Assessment: still useful for older manual/report workflows, but there is overlap with `echoiq_v3/daily_agent` and `black_sheep_mlb/pipelines/echoiq_slate.py`. The repo needs one advertised daily operator path.

### `models/`

Shared game and prop model code plus dated input files for canvas-era slates. Output surfaces include dated canvases, games CSV, batter outlook CSV, reports, snapshots, and dashboard reads.

Assessment: useful for canvas-era strict compute. It should remain separate from EchoIQ v3 research artifacts unless a task explicitly changes prediction logic.

### `dashboard/`

Read-only Streamlit artifact viewer over generated `canvases/exports` snapshots and CSVs. It does not run compute or mutate models.

Assessment: good display layer for canvas artifacts, not yet an EchoIQ v3 slate operator dashboard.

### `.agents/`

Repo-local Codex skills: daily slate, data quality auditor, dashboard builder, free-data refactor, postgame backtester.

Assessment: valuable guardrails. They correctly enforce safe artifact-only mode, exact blocker reporting, and no fabricated sports data.

### Relationship Between black-sheep-mlb and EchoIQ

`black-sheep-mlb` is the repo and executable substrate. EchoIQ is the verification-first MLB research/prediction operating system living inside it, mainly under `echoiq_v3/` and `slates/`. The project has two historical lineages:
- canvas/model pipeline: model-driven slate exports, strict compute, snapshots, dashboard
- EchoIQ v3 workflow: research boards, candidate boards, verification gates, final card, postgame learning

They are converging but not fully unified.

## Current Operational Workflow

### New Slate Creation

Two patterns exist:
- v3 slate folder: `python3 echoiq_v3/scripts/create_slate.py YYYY-MM-DD`
- Night Shift: `python -m echoiq_v3.daily_agent.run_daily_agent --date YYYY-MM-DD`

The first creates the durable v3 folder/files. The second writes a research packet and can run pregame refresh/postgame learning.

### Input Collection

Automated or semi-automated:
- MLB Stats API schedule, status, starters, boxscores, live-feed lineups
- optional pybaseball/Statcast for previous-day enrichment
- optional SportsRadar news/injury if enabled and keyed
- optional Odds API game markets if keyed
- manual CSVs for weather/roof, market snapshots, player props, and news/scratch notes

Manual:
- Outlier player prop prices and context
- Ballpark Pal park/weather/HR factors
- current sportsbook prop prices across books
- Savant/FanGraphs deep pitch-type and zone checks
- team/beat injury and scratch verification

### Verification

The formal gate logic is strong:
- `BET` requires verified odds, fair probability, edge, stake, A/B source confidence, passed/cleared gates, and kill switch
- `WATCHLIST` cannot stake
- `CONDITIONAL` requires explicit gate conditions
- estimated odds cannot enter exact ROI
- player props must grade exact player outcome only

The implementation is uneven:
- v3 validators enforce row-level safety
- Night Shift keeps official_bet_eligible false
- manual preflight exists
- but live Outlier/BPP/Savant capture is not yet machine-validated or consistently timestamped

### Board Generation

Canvas-era boards:
- `canvases/exports/build_ml_exports.py`
- `models/game_model.py`, `models/prop_model.py`
- strict compute writes snapshots and CSVs

EchoIQ v3 boards:
- template-driven `raw_research_board`, `candidate_board`, `verification_board`, `official_card`, `watchlist`, `pass_avoid`
- Night Shift generates watchlists and pregame refresh artifacts
- HR Intelligence v1 can build HR boards from fixtures/hybrid rows

Current limitation: there is not yet one stable command that creates a complete, current, verified, price-aware May 18 final-card package.

### Postgame Grading

Strongest mature workflow:
- May 14 dry-run postgame report verified official outcomes and avoided hindsight relabeling
- `grade_slate.py`, `validate_slate.py`, `check_headers.py`, `summarize_slate.py`
- Night Shift postgame learning writes prediction grades, game grades, hidden winners, signal performance, report, and next-slate prompt rules

Limitation: official ROI and CLV remain unavailable until plays enter with verified prices and closing lines.

## Consolidated Workflow Review

### What Should Become Official

The newly consolidated docs should become the official live verified workflow:
- `verification_taxonomy.md`
- `dual_grade_framework.md`
- `grade_assignment_quick_reference.md`
- `price_ingestion_schema.json`
- `ev_calculation_examples.md`
- `matchup_structures.md`
- `savant_fetch_plan.md`
- `postgame_grading_template.md`
- live verified workflow prompts

They fix the May 16 weakness: strong baseball analysis without enough market-edge proof.

### Overlap

There is overlap between:
- `echoiq_v3/docs/01_DAILY_WORKFLOW_SOP.md` and `prompts/live_verified_workflow/*`
- `echoiq_v3/config/labels_and_gates.yaml`, `AGENTS.md` label rules, and framework grade docs
- `price_ingestion_schema.json`, `black_sheep_mlb/pipelines/echoiq_slate.py` manual schemas, and `data/manual/templates/*`
- May 15 Night Shift folders and the older v3 template folder layout

### Contradictions / Naming Inconsistencies

- New prompts refer to `framework/` and `prompts/` at project root, but actual consolidated paths are `echoiq_v3/docs/framework/` and `echoiq_v3/prompts/live_verified_workflow/`.
- Step 3 says workspace `~/EchoIQ`; actual repo root is `/Users/christianmay/Projects/black-sheep-mlb`.
- Step 3 allows labels/actions like `BEST_PRICE_ONLY`, `FADE`, `PENDING_PRICE`, `POSTGAME_ONLY`, `NO_ACTION`, but EchoIQ v3 canonical prediction labels are `BET`, `LEAN`, `CONDITIONAL`, `WATCHLIST`, `LOTTERY`, `PASS`, `AVOID`, `EXTERNAL`. These should be separate action/status fields, not canonical labels.
- `price_ingestion_schema.json` says no-vig for single-sided props uses `implied_prob / 0.94`, while `ev_calculation_examples.md` says divide by `1.06`. The formula reference says it wins, so the schema should be corrected.
- May 16 artifacts include inferred prices and live-early action language; future official workflow should block official `BET` unless price was directly observed and the game had not started.

### Long-Term Location

Recommended:
- Keep framework docs in `echoiq_v3/docs/framework/`.
- Keep operator prompts in `echoiq_v3/prompts/live_verified_workflow/`.
- Add a short `echoiq_v3/docs/08_LIVE_VERIFIED_WORKFLOW.md` that points to the canonical sequence.
- Promote one May 16 post-audit summary into framework docs, but do not commit full ignored slate artifacts unless explicitly requested.
- Add a single source-log/price-capture template under `echoiq_v3/templates/`.

## Data-Source Maturity Grades

| Source Area | Grade | Score | Notes |
|---|---:|---:|---|
| MLB.com schedule/probables/lineups | B | 82 | Strong official-source priority; current May 18 schedule/starters verified. Lineups still manual/gated until posted. |
| MLB Stats API | B+ | 86 | Integrated in both package pipeline and daily agent. Good for schedule, status, starters, boxscores. |
| Baseball Savant / Statcast | C+ | 72 | pybaseball diagnostics and planning exist; deep current-season pitch/zone pulls remain manual and inconsistent. |
| Ballpark Pal | D+ | 58 | Framework values it, May 16 used it, but no durable schema/API ingestion path is implemented. |
| Weather / roof status | C- | 64 | Manual CSV path exists; automatic weather remains a documented gap in Night Shift. Roof status needs explicit team/source capture. |
| Outlier | D+ | 58 | Operationally important but authenticated/manual; no stable capture schema or parser in repo. |
| Sportsbook odds/prices | C- | 63 | Game-market providers and manual odds exist; player prop price ingestion remains mostly manual. |
| Injury/scratch/news | C- | 62 | Optional SportsRadar and manual news CSV exist; official/team/beat workflow is not automated. |
| Historical performance/backtesting | B- | 80 | Good validators/backtest scripts; needs more strict-current samples and CLV records. |
| Postgame result ingestion | B | 84 | MLB Stats API and postgame learning path are solid; exact prop settlement still needs robust automation. |

## Prediction Maturity Grades

| Market | Grade | Score | Notes |
|---|---:|---:|---|
| Game lines | C+ | 73 | Canvas strict compute and market overlay exist, but daily no-odds path is neutral by design when features are missing. |
| HR props | C | 69 | HR intelligence has edge/kill flags; official workflow still depends on manual price, lineup, park, weather, and Savant verification. |
| Total bases | C- | 64 | v1.1 probability framework supports TB, but live price/lineup/weather gaps block official trust. |
| Hits | C- | 63 | Supported by framework and watchlists; needs lineups, PA volume, book prices, and settlement calibration. |
| RBI/runs | D | 52 | Present in schemas, not mature as a modeled/predicted market. |
| Pitcher props | D+ | 56 | Schema/boards exist and external strikeout props can be observed, but no durable model/gating loop yet. |
| Parlay builder | F | 35 | Not an EchoIQ official capability; should remain excluded until correlation and vig are modeled. |

## Reliability Risks

1. Stale probable pitchers: MLB probables are subject to change and must be rechecked near lock.
2. Unconfirmed lineups: May 18 MLB.com lineups were still `TBD`; player props cannot be official.
3. Unverified odds: no current Outlier/sportsbook capture was written for May 18.
4. AI-written reports as source truth: prior reports must remain hypotheses unless re-verified live.
5. Lack of timestamps: source confidence collapses if price/weather/lineup timestamps are absent.
6. Duplicate prompt workflows: older v3 prompts and new live verified prompts overlap.
7. Ignored local outputs: `slates/2026-05-16/` is visible locally but ignored by git, so lessons can be lost.
8. Model vs research confusion: baseball grade is not market edge; the dual-grade docs fix this conceptually but not yet operationally.
9. Overconfident labels: `BET` must stay blocked unless all gates clear.
10. Reproducible command gap: no single command creates a full live verified slate with BPP/Outlier/Savant/odds capture.

## System Grades

| Category | Letter | Score | Rationale |
|---|---:|---:|---|
| Repo organization | B | 83 | Clear major directories, strong guidance. Some duplicated workflows and ignored artifact tension. |
| Workflow clarity | B- | 80 | Good safety rules and prompts; path/naming inconsistencies remain. |
| Data verification | C+ | 74 | Strong philosophy and MLB backbone, but live props/weather/BPP/Savant are not closed-loop. |
| Prediction rigor | C+ | 72 | Conservative design and fair-probability concepts, but limited calibrated evidence. |
| Market/odds handling | C- | 63 | Game odds path exists; player-prop price/CLV loop is the main blocker. |
| Repeatability | C+ | 74 | Many commands and validators exist; no single official May slate runner yet. |
| Auditability | B+ | 88 | Source logs, gap logs, postgame templates, validators, and no-hindsight norms are strong. |
| Readiness for daily use | B- | 78 | Ready for disciplined research/watchlist workflow, not hands-off final cards. |
| Readiness for real betting decisions | D+ | 58 | Must verify current lineups, odds, edge, weather, BPP/Outlier, and kill switches manually. |
| Readiness for dashboard/productization | C | 68 | Read-only canvas dashboard exists; EchoIQ v3 operational dashboard is not built. |

## Roadmap

### Immediate Today Priorities

1. Create May 18 slate workspace from template or use a scratch report folder only.
2. Capture official MLB schedule/gamePk/status/starters from MLB.com/Stats API.
3. Recheck MLB.com starting lineups 60-90 minutes before each first pitch.
4. Capture Outlier HR/TB/Hits props with exact book, price, line, timestamp, and source URL/screenshot reference.
5. Capture Ballpark Pal run/HR/weather factors and relevant Lucky/Unlucky/Risers/Fallers.
6. Capture weather/roof status for every outdoor/retractable park, especially Wrigley, Coors, Yankee, Citizens Bank, Nationals, Comerica, Kauffman, Target, Angel, Petco, T-Mobile, Chase.
7. Pull current sportsbook prices for any candidate. No current price means no `BET`.
8. Pull Savant/FanGraphs only for finalists, major traps, and conflicts.
9. Populate source gaps honestly.
10. Do not publish official `BET` labels until every gate is passed.

### This Week Priorities

1. Normalize live verified workflow paths to repo paths.
2. Add one reusable slate command or documented runbook that combines create-slate, manual preflight, pregame refresh, source template, and validation.
3. Add `source_log.csv` and `unresolved_gaps.csv` templates to the May 18 capture workflow.
4. Add timestamped odds/player-prop ingestion template with one row per player-market-book.
5. Add Ballpark/weather snapshot schema.
6. Add Outlier capture schema and manual validator.
7. Add starter/lineup recheck script that summarizes changes from morning to lock.
8. Add postgame grading loop that records CLV and exact prop results.
9. Resolve `price_ingestion_schema.json` no-vig inconsistency.
10. Decide whether May 16 artifacts become curated docs/templates or remain local ignored references.

### Longer-Term Priorities

1. Automated data ingestion for official schedule, starters, lineups, weather, roof, boxscore, and results.
2. Robust player-prop odds ingestion with book/source/timestamp/closing-line records.
3. Calibrated fair-probability models for HR, TB, hits, pitcher K, and game lines.
4. Database/storage layer for source snapshots and CLV.
5. EchoIQ v3 dashboard for slate gates, source status, candidates, and final-card readiness.
6. Stable daily agent runner with modes: setup, morning research, pregame lock, postgame grade.
7. CI checks for schemas, templates, and report generation.
8. Versioned prompt/workflow management with one canonical live workflow.
9. Historical backtesting by market type, edge type, and source-confidence bucket.
10. Productization only after betting-readiness gates have enough verified samples.

## Bottom Line

Use the system today as a rigorous research and verification workflow. Do not use it as an autonomous betting engine. For May 18, the repo can safely generate a watchlist and source-compliance packet after manual/live capture; it cannot honestly generate official `BET` rows until lineups, prices, weather/BPP, Outlier context, fair probabilities, and edge calculations are all timestamped and verified.
