# Start Here - EchoIQ v3

EchoIQ v3 is a verification-first MLB prediction operating system. It separates wide research from official bets, conditional ideas, lottery plays, watchlists, external public predictions, pass/avoid decisions, source compliance, postgame grading, error ledgers, and model lessons.

Core rule: research wide, verify hard, bet narrow, grade clean, improve continuously.

## Source Of Truth

The durable source-of-truth folder is:

`echoiq_v3/`

Daily slate work should live in:

`slates/<YYYY-MM-DD>/`

Use `slates/_template/` as the reusable skeleton. Do not create real slate folders from memory or assumptions; create them only when the date and scope are explicit.

## Create A New Slate

1. Copy `slates/_template/` to `slates/<YYYY-MM-DD>/`.
2. Copy needed files from `echoiq_v3/templates/` into the matching slate subfolders.
3. Put raw GPT/Deep Research outputs in `01_raw_research/`.
4. Promote only supported rows into `02_candidates/`.
5. Verify lineups, starters, odds, weather, source confidence, and gates in `03_verification/`.
6. Publish final eligible artifacts in `04_final_card/`.
7. Grade exact outcomes in `05_postgame/`.
8. Move stale or superseded artifacts to `06_archive/`.

## Official Files

Official EchoIQ v3 slate artifacts are:

- `official_card.csv`
- `lottery_card.csv`
- `conditional_card.csv`
- `watchlist.csv`
- `pass_avoid.csv`
- `source_compliance.csv`
- `postgame_grade.csv`
- `error_ledger.csv`
- `model_lessons.csv`
- `final_card_report.md`
- `postgame_report.md`

Research and support artifacts are:

- `raw_research_board.csv`
- `external_public_predictions.csv`
- `candidate_board.csv`
- `verification_board.csv`
- `weather_park_board.csv`
- `pitcher_vulnerability_board.csv`
- `lineup_cluster_board.csv`

## Prompts

Use GPT/Deep Research for live/current research, citations, lineups, odds, weather, and box-score verification:

- `prompts/01_ECHOIQ_V3_MASTER_DAILY_PROMPT.md`
- `prompts/02_GPT_DEEP_RESEARCH_VERIFICATION_PROMPT.md`
- `prompts/05_POSTGAME_GRADE_PROMPT.md`
- `prompts/06_LATE_MARKET_VERIFICATION_PROMPT.md`
- `prompts/07_QUICK_DAILY_RUN_PROMPT.md`

Use Claude for critique and narrative review only:

- `prompts/03_CLAUDE_CRITIQUE_AND_NARRATIVE_PROMPT.md`

Use Codex for repo-local implementation, validation scripts, schema checks, slate folder creation, artifact movement, and automation:

- `prompts/04_CODEX_IMPLEMENTATION_PROMPT.md`

## Validation

Run:

```bash
python3 echoiq_v3/scripts/validate_prediction_rows.py echoiq_v3/examples/may4_style_sample_rows.csv
```

Rows must use exactly one label: `BET`, `LEAN`, `CONDITIONAL`, `WATCHLIST`, `LOTTERY`, `PASS`, `AVOID`, or `EXTERNAL`.

## Next Codex Phase

Recommended next implementation phase: add a small `echoiq_v3/scripts/create_slate.py` helper that copies `slates/_template/` to a requested date, places CSV/report templates into the correct subfolders, refuses to overwrite existing slate files unless explicitly allowed, and runs the validator on copied example rows.
