# EchoIQ v3 Session Recap

Date: 2026-05-05

## 1. Executive Summary

EchoIQ v3 is now a durable, repo-owned MLB prediction operations workspace inside `black-sheep-mlb`. It organizes research, verification, candidate review, final cards, bucketed postgame grading, error ledgers, model lessons, and schema checks without depending on chat context as the source of truth.

We built it to solve the May 4 process failures: mixed official bets with watchlists, external/public picks counted as EchoIQ ROI, conditionals graded without confirmed gates, lottery plays blended into main-card ROI, estimated odds treated too casually, and player-specific results credited to the wrong player.

The system is local-first and verification-first. It does not fetch live data, scrape odds, generate picks, or change model behavior.

## 2. Original Plan Alignment

The work adhered to the original EchoIQ v3 operating philosophy:

- Research wide: the slate structure supports raw research, public/external prediction capture, weather/park boards, pitcher vulnerability boards, lineup cluster boards, and candidate boards.
- Verify hard: the slate validator, source-compliance artifacts, readiness summarizer, and header drift checker enforce local structure before any official card can be trusted.
- Bet narrow: final-card artifacts preserve official BETs separately from CONDITIONAL, LOTTERY, WATCHLIST, PASS/AVOID, and EXTERNAL rows.
- Grade clean: `grade_slate.py` grades local rows by bucket and writes separate postgame artifacts without blending ROI categories.
- Improve continuously: postgame grade, error ledger, and model lessons artifacts are now first-class slate files.
- Codex/repo as source of truth: templates, schemas, prompts, scripts, tests, examples, and slate artifacts live in the repository.
- GPT/Deep Research later: reserved for live verification, citations, lineups, odds, weather, and box-score confirmation when explicitly authorized.
- Claude later: reserved for critique and narrative review, not source-of-truth data handling.
- Bucket separation preserved: `BET`, `LEAN`, `CONDITIONAL`, `WATCHLIST`, `LOTTERY`, `PASS`, `AVOID`, and `EXTERNAL` remain distinct labels with separate rules.

## 3. Completed Phases

Completed today:

- Installed the EchoIQ v3 workflow kit under `echoiq_v3/`.
- Updated repo-level `AGENTS.md` with EchoIQ v3 rules, labels, source confidence, validation expectations, and no-live-data/no-paid-API constraints.
- Created durable slate structure under `slates/` and `slates/_template/`.
- Added `echoiq_v3/scripts/create_slate.py` to initialize dated slate folders from templates.
- Added `echoiq_v3/scripts/validate_slate.py` to validate required folders, files, CSV readability, and local label/bucket rules.
- Added `echoiq_v3/scripts/summarize_slate.py` to produce local readiness summaries.
- Added `echoiq_v3/scripts/grade_slate.py` to grade local artifacts by bucket.
- Extended `grade_slate.py` with postgame artifact writing for `postgame_grade.csv`, `error_ledger.csv`, `model_lessons.csv`, and `postgame_report.md`.
- Added `slates/_sample_2026-05-04/` as a controlled proof harness for May 4-style mistakes.
- Added `echoiq_v3/scripts/check_headers.py` to detect header/schema drift and optionally repair only empty/header-only CSVs.

## 4. Commits Created

- `685b637 Add EchoIQ v3 workflow infrastructure`
- `3df8189 Add May 4 EchoIQ v3 proof harness`
- `03c1e41 Add EchoIQ v3 header drift checker`

## 5. Validation/Test Status

Reported validation milestones:

- 40 passed after Phase F.
- 45 passed after the May 4 proof harness.
- 53 passed after Phase H.

Current working tree before this recap was clean. This recap adds one documentation file and does not stage, commit, or push it.

## 6. What The System Can Do Now

EchoIQ v3 can now:

- Create slate folders with the required daily artifact layout.
- Validate slate folder structure and required files.
- Check CSV header/schema drift against canonical templates and postgame writer schemas.
- Summarize slate readiness, row counts, label counts, market counts, source-confidence distribution, and final-card readiness.
- Grade local artifacts by bucket without fetching results.
- Write structured postgame artifacts.
- Preserve official BET ROI separately from CONDITIONAL, LOTTERY, WATCHLIST, EXTERNAL, PASS, and AVOID categories.
- Demonstrate that May 4-style grading mistakes are caught or separated.

## 7. What The System Does Not Do Yet

EchoIQ v3 does not yet:

- Fetch live MLB data.
- Scrape or ingest live odds.
- Verify official box scores automatically.
- Calculate real predictive probabilities.
- Produce automated betting picks.
- Integrate with dashboard views.
- Integrate with the existing model scoring pipeline.
- Use paid APIs or secrets.

## 8. Recommended Next Steps

Recommended order when work resumes:

1. Optional tiny preflight wrapper: one local command that runs slate validation, header drift check, and readiness summary.
2. First semi-manual real slate dry run: create a dated slate and manually populate controlled research/candidate rows without live automation.
3. Candidate ingestion helper: normalize manually supplied candidate rows into the expected board schema.
4. Scoring/probability skeleton: local-only probability fields and promotion gates, still without live data fetching.
5. Live verification/data connectors: only after explicit authorization for sources, APIs, and request limits.
6. Dashboard integration later: read-only visualization after artifacts and schemas stabilize.

## 9. Suggested Next Codex Prompt

Implement Phase I only: add a local EchoIQ v3 preflight wrapper that runs `validate_slate.py --strict`, `check_headers.py`, and `summarize_slate.py` for a given slate folder, prints one concise PASS/WARN/FAIL summary, writes no data files by default, fetches no live data, and does not change model or dashboard logic.

## 10. Safety / Discipline Reminders

- Do not blend buckets.
- No official `BET` without verified odds, implied probability, fair probability, edge, stake size, source confidence A or B, gates passed, and kill switch.
- `WATCHLIST` must never have stake units or count toward ROI.
- `EXTERNAL` must never count toward EchoIQ official ROI.
- `LOTTERY` must remain separate from main-card ROI.
- `CONDITIONAL` requires explicit gate conditions and only grades as actionable if the gate is cleared/passed/met.
- Player-specific props can only be graded HIT when the exact player achieved the required result.
- Estimated odds must remain visible and flagged.
- Codex should not fetch live data, use paid APIs, access secrets, or run provider commands unless explicitly authorized.
