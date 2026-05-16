# EchoIQ v3 Workflow Kit

This folder is the operating system for the EchoIQ MLB prediction workflow.

It is designed to solve the May 4, 2026 problem: broad research was useful, but official bets, conditional ideas, watchlists, and external/public predictions got mixed during grading.

## Core rule

Research wide. Verify hard. Bet narrow. Grade clean.

## What this folder contains

| Folder | Purpose |
|---|---|
| `prompts/` | Copy-paste prompts for GPT, Claude, Codex, and postgame grading |
| `templates/` | CSV templates for daily slate tracking and grading |
| `schemas/` | Machine-readable prediction row schema |
| `config/` | Labels, gates, source-confidence rules, and thresholds |
| `checklists/` | Final card, HR, TB/hit, game-pick, and postgame checklists |
| `docs/` | SOP, scoring model, source hierarchy, lessons, and folder map |
| `examples/` | May 4-style sample rows |
| `scripts/` | Lightweight validation script for CSV rows |
| `references/` | Uploaded source PDFs used to build the v3 framework |

## Daily workflow

1. Build raw research board.
2. Build candidate board.
3. Score candidates.
4. Verify lineups, starters, weather, injuries, and odds.
5. Run the gatekeeper.
6. Publish official card only from verified BET/LOTTERY plays.
7. Grade postgame by bucket: official, conditional, lottery, watchlist, external.

## Labels

Every row must be exactly one of:

- `BET`
- `LEAN`
- `CONDITIONAL`
- `WATCHLIST`
- `LOTTERY`
- `PASS`
- `AVOID`
- `EXTERNAL`

## Non-negotiable grading rule

A player-specific prop can only be graded `HIT` if that exact player achieved the required result. A teammate's HR never counts.

## Recommended first file to open

Start with:

`docs/01_DAILY_WORKFLOW_SOP.md`

Then use:

`prompts/01_ECHOIQ_V3_MASTER_DAILY_PROMPT.md`

## Night Shift Operator Inputs

Pregame refresh can ingest optional manual CSVs for verified weather/roof, game markets, player props, and news/scratch notes:

```text
data/manual/weather_roof.csv
data/manual/market_snapshot.csv
data/manual/player_props.csv
data/manual/news_scratch.csv
```

Templates live under `data/manual/templates/`. Run:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --preflight-manual-inputs
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode pregame-refresh
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --summarize-pregame-refresh
```

Path overrides are available through `ECHOIQ_WEATHER_CSV`, `ECHOIQ_MARKET_CSV`, `ECHOIQ_PLAYER_PROPS_CSV`, and `ECHOIQ_NEWS_CSV`.

Fill the templates with the slate date, game/player identifiers when known, verified source name/URL, last update time, and only information the operator has actually checked. Run preflight after editing CSVs and before pregame refresh. Preflight is local-only: it does not call APIs, does not create bets, and only validates operator inputs. `PASS` means present files are clean, `PASS_WITH_WARNINGS` means missing/header-only/non-verifying or skippable row issues need review, and `FAIL` means a present file has an unreadable or unsafe schema.

Manual rows are labeled `manual_operator_input`, preflighted into `04_pregame_refresh/manual_input_preflight.csv`, validated during refresh into `04_pregame_refresh/manual_input_validation.csv`, and can clear verification gates only for the exact fields supplied. Night Shift still does not create official bets; `official_bet_eligible` stays `false`.

Pregame refresh prints a compact terminal summary after non-dry-run completion. The `--summarize-pregame-refresh` helper reads the existing `watchlist_survival.csv`, `verification_matrix.csv`, refresh CSVs, and unresolved gaps log without rerunning sources.

## Postgame Learning Engine

EchoIQ can also run a postgame learning pass for a completed slate:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date YYYY-MM-DD --mode postgame-learning
python -m echoiq_v3.daily_agent.run_daily_agent --date YYYY-MM-DD --postgame-learning
```

This mode reads the slate folder's watchlists, pregame refresh state, matchup notes, and final postgame audit artifacts, then writes:

```text
slates/YYYY-MM-DD/05_postgame_learning/
  prediction_grades.csv
  game_grades.csv
  hidden_winners.csv
  signal_performance.json
  postgame_learning_report.md
  next_slate_prompt_rules.md
```

It grades HR, TB/XBH, hits/contact, game/team leans, pitcher vulnerability, bullpen context, and team environment signals. Process labels stay separate from result labels, including `RIGHT_TEAM_WRONG_PLAYER`, `RIGHT_PLAYER_WRONG_PROP_SUBTYPE`, `HIDDEN_SUPPORTING_CAST_WINNER`, `STALE_ASSUMPTION`, and `INCONCLUSIVE`.

Postgame learning does not create official bets, wager recommendations, staking advice, or EV conclusions. Missing or stale artifacts are logged as gaps and produce inconclusive rows. v1 is deterministic and rule-based; contact-quality process grading remains limited unless final Statcast enrichment is available.
