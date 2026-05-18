# EchoIQ Product Thesis

## Executive Summary

EchoIQ is a verification-first MLB intelligence operating system inside `black-sheep-mlb`. Its job is not to generate picks—it is to turn messy baseball and market information into auditable, price-aware decision states. The product separates baseball matchup quality from betting value, applies strict gates before any `BET` label, and preserves evidence when data is missing. Today it is a strong research-and-verification prototype, not an autonomous betting engine.

---

## What EchoIQ Is

EchoIQ is the durable workflow and philosophy layer for MLB pregame research, verification, labeling, and postgame learning. Its source-of-truth workspace is `echoiq_v3/`; daily work lives in `slates/<YYYY-MM-DD>/` using `slates/_template/` as the skeleton.

The system answers three questions in order:

1. Which players or teams have real baseball advantages today?
2. Which of those advantages are mispriced by the market?
3. Which ideas are actionable versus watchlist, conditional, or pass?

Executable substrate (`black_sheep_mlb/`, `models/`, `canvases/exports/`) supports data ingestion, conservative modeling, strict compute, and backtesting. EchoIQ v3 defines how humans and agents must behave when promoting rows to official cards.

---

## What EchoIQ Is Not

- Not an “AI pick generator” that outputs a daily parlay list.
- Not a black-box model that hides missing lineups, odds, or weather.
- Not a single-score ranking where a great hitter automatically becomes a bet.
- Not production-ready for hands-off official betting without manual price and gate verification (May 18 assessment: all `BET` rows blocked).
- Not interchangeable with canvas-era strict compute proof—those are sibling systems converging, not yet unified.

---

## The Product’s Job

Transform wide research into narrow, defensible action:

| Stage | Output | Location |
|-------|--------|----------|
| Research | Raw boards, environment screens, candidate hypotheses | `slates/*/01_raw_research/`, root capture files like `source_log.md` |
| Candidates | Scored rows with baseball case, not yet priced | `02_candidates/candidate_board.csv` |
| Verification | Gate status, source compliance, pass/avoid | `03_verification/` |
| Decision | Official card, watchlist, conditional, lottery | `04_final_card/` |
| Learning | Grades, CLV, lessons, no hindsight | `05_postgame/`, Night Shift `05_postgame_learning/` |

North Star (from `echoiq_v3/README.md`, `AGENTS.md`): **Research wide. Verify hard. Bet narrow. Grade clean. Improve continuously.**

---

## Core Problem It Solves

May 4, 2026 and May 16, 2026 demonstrated the failure mode: strong baseball narratives, external picks, watchlists, and official bets got mixed during grading. Operators could not explain why a row was promoted or blocked. EchoIQ fixes that by:

- One label per row (`BET`, `LEAN`, `CONDITIONAL`, `WATCHLIST`, `LOTTERY`, `PASS`, `AVOID`, `EXTERNAL`).
- Dual grades: `BASEBALL_GRADE` (matchup quality) vs `BET_GRADE` (price/EV at current market).
- Explicit unresolved gaps instead of silent fills.
- Postgame grading that credits only the exact player and market.

---

## Why “Good Player / Good Matchup / Good Bet” Must Be Separated

**Good player:** Kyle Schwarber’s 2026 Statcast profile (elite xwOBA, barrel rate, hard-hit) is a player-quality fact.

**Good matchup:** Schwarber vs a vulnerable LHP in Citizens Bank Park with BPP HR factor +29 is a situational baseball case.

**Good bet:** Only exists when fair probability exceeds no-vig implied probability at a verified book price, with lineup confirmed and gates cleared.

May 18 proved the separation: Schwarber Over 1.5 TB had a strong baseball case but Outlier fair price +105 (~48.78%) vs DraftKings -110 (~52.38%) implied **negative ~3.6 pp edge**. EchoIQ correctly labeled `CONDITIONAL`, not `BET` (`slates/2026-05-18/final_card.md`, `prediction_gate_board.csv` row 12).

A 49% true probability is excellent at +150 and terrible at -150. EchoIQ must never collapse those dimensions.

---

## Why Verification-First Matters

Trust comes from process, not model confidence strings. The repo enforces:

- No fabrication of lineups, odds, weather, or results (`AGENTS.md`, `echoiq_v3/AGENTS.md`).
- Verification taxonomy: `VERIFIED`, `HIGH_CONF_INFERENCE`, `LOW_CONF_INFERENCE`, `UNSUPPORTED` (`echoiq_v3/docs/framework/verification_taxonomy.md`).
- Validators: `echoiq_v3/scripts/validate_prediction_rows.py`, `validate_slate.py`.
- Source logs with URL, timestamp, captured vs missing (`slates/2026-05-18/source_log.md`).

Without verification-first design, AI-generated matchup prose reads authoritative while lineups remain `TBD`—exactly the May 18 blocker.

---

## Why Price-Awareness Matters

Markets price public signals (stars, streaks, Coors, BPP Unlucky flags) faster than narrative research. EchoIQ’s market layer requires:

- Exact American odds, book label, timestamp (`echoiq_v3/docs/framework/price_ingestion_schema.json`).
- Implied and no-vig probability (`ev_calculation_examples.md` uses `/1.06` hold removal).
- Fair probability rationale before `BET`.
- `PENDING_PRICE` when price unknown—never bet on `BASEBALL_GRADE` alone (`dual_grade_framework.md`).

Player-prop price ingestion remains the weakest operational link (system assessment: grade C- for sportsbook odds).

---

## Why Output Should Be Labels/States, Not Simple Picks

Users need decision machinery, not a top-5 list:

| Label | Meaning |
|-------|---------|
| `BET` | All gates clear; verified edge; stake allowed per rules |
| `LEAN` | Strong baseball case; insufficient price proof |
| `CONDITIONAL` | Actionable only if stated condition clears (lineup, price threshold) |
| `WATCHLIST` | Research target; `stake_units` must be 0 |
| `LOTTERY` | Long-shot HR; graded separately from core ROI |
| `PASS` / `AVOID` | No action; traps, bad price, missing gates |
| `EXTERNAL` | Third-party picks; never official EchoIQ ROI |

May 18 final card: zero `BET` rows, four `LEAN` game leans, extensive `WATCHLIST`/`CONDITIONAL`—honest output.

---

## North Star Principles

1. **Research wide** — Screen full slate (schedule, environments, clusters); do not prematurely narrow.
2. **Verify hard** — MLB.com/Stats API for schedule/starters/lineups; timestamp everything.
3. **Bet narrow** — `BET` only when price, lineup, weather/roof, and edge gates clear.
4. **Grade clean** — Exact player prop hits; separate buckets; no hindsight relabeling.
5. **Improve daily** — `model_lessons.csv`, postgame learning, `next_slate_prompt_rules.md`.

EchoIQ’s moat is not “smarter AI”—it is auditable discipline that says no when data or price does not support action.
