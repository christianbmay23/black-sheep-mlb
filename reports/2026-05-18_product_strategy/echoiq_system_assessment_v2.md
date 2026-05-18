# EchoIQ System Assessment v2

## Executive Summary

`black-sheep-mlb` hosts two converging lineages: canvas/model strict compute and EchoIQ v3 verification workflow. The combined system scores highest on auditability and safety (B+), lowest on autonomous betting readiness (D+) and player-prop price automation (C-). May 18 live work demonstrates the product philosophy working—strong baseball case, negative edge, zero `BET` rows—but also exposes manual capture bottlenecks (Outlier, Ballpark Pal, lineups `TBD`). This document extends `reports/2026-05-18_system_assessment/system_assessment.md` with product-strategy framing.

---

## Current Architecture

```
black-sheep-mlb/
├── echoiq_v3/          ← EchoIQ process SOT (labels, gates, templates, daily_agent)
├── slates/             ← Dated workspaces (gitignored except _template)
├── black_sheep_mlb/    ← Package pipelines, data sources, HR intelligence
├── models/ + canvases/ ← Canvas-era models, strict compute, exports, snapshots
├── dashboard/          ← Read-only Streamlit over canvas artifacts
├── reports/            ← Assessments (May 18 system + this product strategy)
├── scripts/            ← Legacy Night Shift shell helpers
└── .agents/skills/     ← Codex guardrails
```

### What `black_sheep_mlb/` Does

- `pipelines/run_daily_predictions.py` — Daily slate with `--no-odds` or optional Odds API.
- `pipelines/echoiq_slate.py` — EchoIQ-shaped reports (boards, source log, gaps).
- `data_sources/` — MLB Stats API, pybaseball, manual/cached/The Odds API providers.
- `hr_intelligence/` — HR boards with edge, kill flags, verification module.
- `markets/` — Cache, health, schema for market snapshots.

**Strength:** Conservative when features missing; unittest coverage.  
**Weakness:** Not the full live verified workflow; BPP/Outlier not first-class.

### What `echoiq_v3/` Does

- Labels/gates: `config/labels_and_gates.yaml`, `docs/04_LABEL_DEFINITIONS.md`.
- Framework: `docs/framework/*` (dual grade, EV, price schema, Savant plan).
- Scripts: `create_slate.py`, `validate_prediction_rows.py`, `grade_slate.py`.
- Daily agent: preflight manual CSVs, pregame refresh, postgame learning.
- Prompts: master daily + `live_verified_workflow/` (steps 1–3, post-run audit).

**Strength:** Correct long-term process SOT.  
**Weakness:** Overlaps older `docs/01_DAILY_WORKFLOW_SOP.md`; stale `~/EchoIQ` paths in step 3 prompt.

### What `slates/` Does

- `_template/` — `00_inputs` through `06_archive` skeleton.
- Dated folders (e.g. `2026-05-05`, `2026-05-14`, `2026-05-15`, `2026-05-18`) — mix of v3 layout and Night Shift layout.
- May 18 root captures: `source_log.md`, `unresolved_gaps.md`, `prediction_gate_board.csv`, `final_card.md` (local; `slates/*/` gitignored).

**Strength:** Right place for auditable daily work.  
**Weakness:** Ignored by git—lessons can be lost unless promoted to `reports/` or templates.

### What `reports/` Does

- `2026-05-18_system_assessment/` — First-pass system audit (this run extends via `2026-05-18_product_strategy/`).
- Older `reports/2026-05-02/` EchoIQ slate JSON/CSVs.

### What `models/` / `canvases/` / `dashboard/` Do

- **models/** — `game_model.py`, `prop_model.py`, dated `<slug>_inputs.py`.
- **canvases/** — Dated `.canvas.tsx` UI; **exports/** — `build_ml_exports.py --compute`, snapshots, backtest trackers.
- **dashboard/** — `streamlit run dashboard/app.py` reads snapshots/CSVs only.

**Role:** Model-proof and visualization for canvas era; separate from v3 official cards unless explicitly unified.

---

## What Is Strong

1. No-fabrication rules repeated in root `AGENTS.md` and `echoiq_v3/AGENTS.md`.
2. Eight-label taxonomy with hard `BET` requirements.
3. Dual-grade framework post–May 16 audit.
4. May 18 Schwarber TB negative-edge downgrade (product proof).
5. Validation scripts and prediction row schema.
6. Night Shift manual preflight + pregame refresh path.
7. Postgame learning outputs (`prediction_grades.csv`, `hidden_winners.csv`, etc.).
8. MLB Stats API integration in package + daily agent.
9. Read-only dashboard cannot mutate models.
10. Codex skills enforcing safe artifact-only mode.

---

## What Is Weak

1. No single command produces full verified price-aware final card.
2. Player-prop prices mostly manual (Outlier browser capture).
3. Ballpark Pal manual; no durable automated schema ingestion.
4. Lineups not auto-rechecked on interval—operator must revisit MLB.com.
5. Savant deep pulls planned (`savant_fetch_plan.md`), not operational for all finalists.
6. Fair-probability models immature for HR/TB/hits official promotion.
7. No robust CLV tracking in production artifacts.
8. Duplicate workflows (v3 SOP vs live verified vs Night Shift folder shapes).
9. Label vs action-status mixing in live prompts (`BEST_PRICE_ONLY` vs canonical labels).
10. `price_ingestion_schema.json` no-vig `/0.94` vs EV doc `/1.06` inconsistency.

---

## What Is Too Manual

| Task | Current method |
|------|----------------|
| Outlier HR/TB/hits boards | Authenticated browser + copy to gate CSV |
| Ballpark Pal park/player factors | Browser/screenshot |
| Sportsbook book labels | Often missing on Outlier board view |
| Weather/roof lock-time | Open-Meteo preliminary; roof manual |
| Savant finalist checks | Per-player browser pulls |
| Official card promotion | Human reads `prediction_gate_board.csv` |

---

## What Is Duplicated / Confusing

- **Two slate creation paths:** `create_slate.py` vs `run_daily_agent`.
- **Two postgame paths:** `grade_slate.py` vs postgame learning mode.
- **Three “daily” entry points:** canvas `--compute`, package `run_daily_predictions`, EchoIQ prompts.
- **Path references:** `framework/` at repo root (wrong) vs `echoiq_v3/docs/framework/`.
- **May 15 folder layout** (`03_watchlists/`, `04_pregame_refresh/`) vs v3 `02_candidates/`…`04_final_card/`.

**Recommendation:** One advertised operator path in `echoiq_v3/START_HERE.md` with mode flags.

---

## What Is Missing

- Automated player-prop price ingestion with book + timestamp + CLV.
- Lineup/starter change alerts.
- EchoIQ v3 operational dashboard (gates, source freshness).
- Unified `action_status` field on gate boards.
- Curated committed exemplar for May 16/18 (redacted).
- Calibrated backtest bank with verified closing lines for props.
- Pitcher-prop durable model loop.
- Parlay/correlation engine (correctly excluded for now).

---

## Maturity Grades

| Category | Grade | Score | Notes |
|----------|-------|------:|-------|
| **Product maturity** | C+ | 72 | Strong process design; weak UX and automation |
| **Research maturity** | B- | 78 | Framework + capture templates; narrow automated discovery |
| **Prediction maturity** | C+ | 72 | Conservative models; limited calibrated prop proof |
| **Betting-readiness** | D+ | 58 | May 18: zero official BET; manual price/lineup |
| **Investor-readiness** | C | 68 | Honest empty-card story; needs demo UI |
| **Technical-readiness** | B- | 80 | Tests, validators, agents; integration gaps |

*Scores align with `reports/2026-05-18_system_assessment/system_assessment.md` where applicable.*

---

## Honest Current Verdict

EchoIQ is **production-grade as a research and verification operating system** for a disciplined operator. It is **not production-grade as an autonomous betting engine** or subscription pick product.

Use today for: watchlists, source compliance, gate boards, LEAN/CONDITIONAL discipline, postgame learning.  
Do not use today for: unattended `BET` generation, ROI marketing, or “AI picks” without human price/lineup verification.

The May 18 slate is the reference behavior: research wide (14 games, Outlier/BPP/Savant captures), verify hard (lineups TBD blocks props), bet narrow (no BET rows), document why Schwarber stays conditional at -110.
