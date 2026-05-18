# EchoIQ Prediction and Pricing Framework

## Executive Summary

EchoIQ predictions become actionable only when baseball quality and market value align at a verified current price. `BASEBALL_GRADE` measures the spot; `BET_GRADE` measures whether to bet it today. A strong baseball case at a bad price is `CONDITIONAL`, `PASS`, or `AVOID`—never `BET`. The Schwarber Over 1.5 TB case (Outlier fair +105 vs market -110) is the canonical repo example.

---

## BASEBALL_GRADE vs BET_GRADE

| Layer | Question | Assigned when | Without price |
|-------|----------|---------------|---------------|
| **BASEBALL_GRADE** (A–F) | Is this a good baseball spot? | Research complete | Always assignable |
| **BET_GRADE** (1–4, PASS, PENDING_PRICE) | Is it +EV at current odds? | Price + fair prob known | `PENDING_PRICE` |

**Never merge:** An A baseball grade with BET_GRADE 4 or PASS is a valid, valuable output.

Reference: `echoiq_v3/docs/framework/dual_grade_framework.md`, `grade_assignment_quick_reference.md`.

---

## Fair Probability Estimation

**Hierarchy of fair-price inputs:**

1. **Verified model output** — `echoiq_v3/probability_framework_v1.py`, HR intelligence scoring (when run with verified inputs).
2. **Outlier fair price / projection** — May 18 Schwarber TB: Outlier fair +105 → 48.78% fair prob (documented, not blindly trusted).
3. **Parameterized decomposition** — `fair = base_rate × pitcher_factor × park_factor × weather × form` (`ev_calculation_examples.md` HR example).
4. **Range estimate** — When components uncertain, document range; cap label at `WATCHLIST` or `LEAN`.

**Rules:**

- Flag estimated fair prob in notes; do not mix into exact ROI as verified.
- Weather unverified → weather_factor = 1.0 (no silent boost).
- Tiny pitcher samples → downgrade confidence.

---

## Implied Probability

From American odds (`ev_calculation_examples.md`):

```
positive: decimal = (odds / 100) + 1
negative: decimal = (100 / |odds|) + 1
implied_prob = 1 / decimal
```

**Example:** -110 → decimal 1.909 → implied 52.38%.

Store in `prediction_gate_board.csv` column `implied_probability`.

---

## No-Vig Probability

Single-sided props (no listed under):

```
no_vig_prob = implied_prob / 1.06   # 6% assumed hold (EV doc canonical)
```

**Repo inconsistency to fix:** `price_ingestion_schema.json` uses `/0.94`; adopt `/1.06` everywhere for consistency with EV examples.

---

## Why Price Matters

Markets embed:

- Star-player efficiency (Schwarber, Judge → HIGH price sensitivity).
- Public streaks and BPP Unlucky flags.
- Environment in game totals.

EchoIQ edge:

```
edge_pp = fair_prob - no_vig_implied_prob   # percentage points
EV = (fair_prob × decimal) - 1
```

**BET_GRADE thresholds** (quick reference):

| BET_GRADE | Condition |
|-----------|-----------|
| 1 | fair > no_vig by ≥5 pp |
| 2 | fair > no_vig by 2–5 pp (best price only) |
| 3 | within ±2 pp |
| 4 / PASS | fair < no_vig |

---

## Great Baseball Case, Still a Pass

**Schwarber Over 1.5 TB — May 18 Case Study**

| Element | Value |
|---------|-------|
| Baseball case | BPP HR +29 env; elite Savant; Lodolo vulnerable profile; L10 TB 80% |
| BASEBALL_GRADE | A / strong B |
| Outlier fair price | +105 (~48.78% fair) |
| Best market captured | DraftKings -110 (~52.38% implied) |
| Edge | **-3.6 pp** (negative) |
| Label | `CONDITIONAL` |
| Playable price | +110 or better per gate board notes |
| What kills it | Lineup TBD; negative edge at -110; starter lock recheck |

**Lesson:** Outlier EV+ on HR (+205) did not auto-promote TB or HR to `BET`—still needs explicit fair HR math, lineup, book label.

Files: `slates/2026-05-18/prediction_gate_board.csv` row 12, `unresolved_gaps.md`, `final_card.md`.

---

## Playable / Pass / Thresholds

| Concept | Definition |
|---------|------------|
| **Playable price** | Minimum odds where fair_prob ≥ no_vig_implied (break-even or better) |
| **Pass price** | Any price worse than playable |
| **Edge threshold for BET** | Default ≥5 pp vs no-vig (BET_GRADE 1); configurable in gates YAML |

Schwarber TB break-even from fair 48.78%: decimal ≈ 2.05 → roughly **+105**; market -110 fails.

---

## Outlier Fair Price Handling

1. Capture Outlier fair price and projection timestamp from matchup card.
2. Cross-check against independent fair model or decomposition.
3. Do not treat Outlier EV+ tag as sufficient for `BET`.
4. Document conflict: Murakami HR EV+ vs BPP suppressive T-Mobile environment (watchlist with park mismatch flag).

---

## Missing Book Labels

- Gate row: `book_label_missing` risk flag.
- Label cap: `WATCHLIST` or `CONDITIONAL`, not `BET`.
- Fix: Open Outlier player detail view (Schwarber capture showed FanDuel/DraftKings/PrizePicks labels).

Schema: `price_ingestion_schema.json` requires `sportsbook` field.

---

## Stale Prices

- Require `source_timestamp` on every price row.
- If timestamp > 30 minutes before lock (configurable), downgrade to `CONDITIONAL` or recapture.
- Started games: freeze as `NO_ACTION` / postgame only—not pregame `BET`.

---

## Line Movement

Record in price schema `line_movement` object: open, current, direction, `sharp_flag` if >15 cent move.

**Workflow:** Morning capture → pregame recapture → compare; material move against position triggers re-edge or `AVOID`.

---

## Label Classification Rules

| Label | When to use |
|-------|-------------|
| **BET** | All gates true; edge ≥ threshold; source confidence A/B; kill switch documented |
| **LEAN** | Baseball case without full price proof OR game lean without ML capture |
| **CONDITIONAL** | Named condition (lineup, price ≥ X, weather, starter lock) |
| **WATCHLIST** | Research target; gates missing; stake_units = 0 |
| **LOTTERY** | Long-shot HR; separate grading |
| **PASS** | Insufficient edge or info |
| **AVOID** | Bad price + bad matchup + adverse env + trap |
| **EXTERNAL** | Third-party picks only |

May 18 distribution: 0 BET, 4 LEAN, multiple WATCHLIST/CONDITIONAL—correct conservative behavior.

---

## Canonical vs Action Status

Live verified prompt uses `BEST_PRICE_ONLY`, `NO_ACTION`, `POSTGAME_ONLY` for *workflow status*—these must **not** replace EchoIQ labels. Proposed field: `action_status` on gate CSV separate from `label`.

---

## Integration with Repo Artifacts

- Gate board: `slates/2026-05-18/prediction_gate_board.csv`
- Templates: `echoiq_v3/templates/official_card.csv`, `conditional_card.csv`
- Validation: `echoiq_v3/scripts/validate_prediction_rows.py`
- Config: `echoiq_v3/config/labels_and_gates.yaml`

Prediction intelligence means answering: *What price makes this playable? What kills it? What is missing at lock?*—not *Who do you like?*
