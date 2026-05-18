# EchoIQ Investor Pitch

## Executive Summary

EchoIQ is a verification-first sports intelligence platform for MLB props and game markets. It separates baseball matchup quality from betting value, gates every actionable row on verified sources and current prices, and grades outcomes without hindsight bias. The product is a credible research operating system today; it is not yet a proven autonomous betting engine or revenue-ready consumer app.

---

## One-Paragraph Pitch

EchoIQ turns messy MLB information—starters, lineups, Statcast, park/weather context, and sportsbook prices—into a structured, auditable decision pipeline. Each candidate receives a baseball grade and a market grade; a play becomes actionable only when the matchup is strong, the player is confirmed, the price is current, fair probability beats implied probability, and verification gates clear. The output is not a list of guesses; it tells users what to bet, what to watch, what is conditional on lineup or price, and what to avoid—with timestamps and source trails that survive postgame scrutiny.

---

## Deeper Product Explanation

**Problem:** Sports bettors and research teams drown in narrative picks, unverified lineups, stale odds, and mixed buckets (official bets vs watchlists vs external tout cards). AI tools amplify volume without auditability.

**Solution:** EchoIQ v3 in `echoiq_v3/` plus daily `slates/` workspaces:

- Template-driven CSV artifacts (`official_card.csv`, `watchlist.csv`, `verification_board.csv`, etc.).
- Framework docs for dual grading, EV math, price schema, Savant plan.
- Night Shift daily agent (`echoiq_v3/daily_agent/`) for pregame refresh and postgame learning.
- Package pipeline (`black_sheep_mlb/`) for MLB Stats API, optional odds, HR intelligence.
- Legacy canvas strict compute for model-proof snapshots and dashboard display.

**User outcome:** Confidence in *process*—knowing why Schwarber TB stayed `CONDITIONAL` at -110 despite elite Statcast, not blind trust in a model score.

---

## User Problem

- Cannot tell if a “lock” was verified at bet time or invented after the game.
- Confuses hot hitters with +EV props at current juice.
- Loses CLV and process lessons because picks were not timestamped.
- Wastes time re-researching the same gates (lineup? roof? Outlier fair price?) without a checklist.

---

## Market / Product Opportunity

- MLB player props are high-volume, high-vig, and sensitive to lineup/weather—ideal for disciplined research tools.
- Institutional and serious retail bettors pay for *workflow + audit*, not raw picks (cf. pick-selling fatigue).
- Adjacent: content creators, betting groups, and internal trading desks needing reproducible research packets.

---

## Why “AI Pick” Tools Are Insufficient

| Typical AI pick tool | EchoIQ approach |
|---------------------|-----------------|
| Single confidence score | `BASEBALL_GRADE` + `BET_GRADE` + gates |
| No source timestamps | `source_log.md`, `source_compliance.csv` |
| Fills missing lineups silently | `LINEUPS_NOT_POSTED` gap blocks `BET` |
| Ignores price at recommendation time | Edge math required; Schwarber TB example |
| Mixed ROI buckets | `EXTERNAL` never counts; `LOTTERY` separate |

---

## EchoIQ Differentiation

1. **Verification-first taxonomy** — Claims tagged VERIFIED vs inference.
2. **Label system** — Eight canonical labels with hard rules (`echoiq_v3/config/labels_and_gates.yaml`).
3. **Dual-grade framework** — Post–May 16 audit product insight.
4. **Repo-grounded artifacts** — Not chat-only; files under `slates/` and `reports/`.
5. **Conservative code** — `black_sheep_mlb` degrades to neutral when features missing; Night Shift keeps `official_bet_eligible` false by default.

---

## Workflow Moat

Repeatable daily skeleton (`slates/_template/`), live verified workflow prompts (`echoiq_v3/prompts/live_verified_workflow/`), checklists (`echoiq_v3/checklists/`), and agent skills (`.agents/skills/`). Operators who follow the SOP produce comparable packets day to day—hard to replicate with ad-hoc ChatGPT threads.

---

## Data / Verification Moat

- MLB Stats API as backbone (schedule, gamePk, probables, live feed lineups).
- Manual but structured capture for Outlier, Ballpark Pal, sportsbook props (May 18 `source_log.md` shows discipline).
- Validators and schemas (`prediction_row_schema.json`, `price_ingestion_schema.json`).
- Postgame learning separates process vs result labels.

Gap: automated prop-price and BPP ingestion not yet closed-loop—honest limitation.

---

## Trustworthiness Moat

Willingness to publish **empty official cards** when gates fail. May 18: “No rows” under `BET` with documented negative edge on the best baseball candidate. That behavior builds long-term trust; overclaiming `BET` destroys it.

---

## Product Vision

**Near term:** Single operator runbook—create slate → capture sources → gate board → final card → postgame grade—with one documented command chain.

**Medium term:** EchoIQ v3 dashboard (gate status, source freshness, candidate board, price/edge panel) reading slate folders.

**Long term:** Calibrated fair-probability models per market (HR, TB, hits, game lines) with CLV database, human-in-the-loop promotion, optional API for verified subscribers—not pick selling.

---

## Current Stage and Honest Limitations

| Dimension | Stage |
|-----------|--------|
| Process / auditability | Beta-strong (B+ auditability per system assessment) |
| Daily research workflow | Usable with manual capture (B- readiness) |
| Autonomous betting | Not ready (D+ betting-readiness) |
| Investor / consumer UI | Early (C productization; Streamlit reads canvas only) |
| Calibrated ROI proof | Insufficient verified-price sample size |

Do not claim proven betting alpha. Claim proven *discipline* and a path to priced decisions.

---

## Near-Term Roadmap (90 Days)

1. Normalize live workflow paths (`echoiq_v3/docs/08_LIVE_VERIFIED_WORKFLOW.md` pointer doc).
2. Ship `source_log.csv`, `player_prop_prices.csv`, `unresolved_gaps.csv` templates in `echoiq_v3/templates/`.
3. Starter/lineup recheck script summarizing morning → lock deltas.
4. Fix no-vig inconsistency (`price_ingestion_schema.json` `/0.94` vs `ev_calculation_examples.md` `/1.06`).
5. Wire manual preflight → pregame refresh as default May slate path.
6. CLV fields on price schema post-close.
7. Promote May 16 lessons into framework (done); May 18 Schwarber case into training examples (this bundle).
8. Single “slate readiness” validator combining headers + gates + gaps.
9. Curated public exemplar slate (redacted) for demos—not full ignored folders.
10. Separate `action_status` from canonical `label` in gate CSV (fix prompt/label mixing).

---

## Long-Term Vision

EchoIQ becomes the **operating system for serious MLB prop research**: ingest schedule/lineups/weather/prices automatically, score candidates with transparent baseball and market layers, surface only gate-cleared `BET` rows, and prove edge with CLV and calibrated backtests—while remaining willing to output “no bet today” as a successful run.
