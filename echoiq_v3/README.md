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
