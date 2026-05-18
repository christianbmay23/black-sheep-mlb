# EchoIQ Postgame Grading Template
## v1.0 — Post May 16, 2026 Audit

---

## Usage

After every slate, complete one entry per play that was graded STRONG or ELITE (old system) or BET_GRADE 1/2 (new system). The purpose is not to track wins/losses — it is to build a feedback dataset that can identify which matchup structures, edge types, and signal sources reliably translate to edge, and which don't.

**Primary metric: CLV (Closing Line Value)**  
**Secondary metric: Hit rate by category**  
**Tertiary metric: ROI by edge type**

---

## Per-Play Entry Format

```
---
DATE: 2026-MM-DD
PLAYER: [name]
TEAM: [abbr]
MARKET: [HR / TB_1 / TB_2 / Hits_1 / Hits_2 / custom]
OPP_PITCHER: [name]
OPP_PITCHER_HAND: [L/R]
PARK: [name]

GRADES AT BET TIME:
  BASEBALL_GRADE: [A/B/C/D/F]
  BET_GRADE: [1/2/3/4/PASS]
  PRICE_SENSITIVITY: [LOW/MEDIUM/HIGH/EXTREME]
  VOLATILITY: [LOW/MEDIUM/HIGH/CRITICAL]
  EDGE_DEPENDENCE: [MATCHUP/REGRESSION/ENVIRONMENT/STREAK/COMPOSITE]

PRICING:
  price_at_action: [American odds, e.g., +135]
  book_used: [FD / DK / BetMGM / Outlier / other]
  closing_price: [American odds at first pitch — fill in post-game]
  clv_raw: [price_at_action minus closing_price in cents: e.g., +12 means we got 12 cents better]
  clv_ev: [CLV in implied probability terms: e.g., +2.3% means 2.3 pp better than close]

PRE-GAME GATES:
  lineup_confirmed: [YES / NO — if NO, was this bet pre-lineup?]
  weather_confirmed: [YES / NO / N/A (dome)]
  pitcher_identity_confirmed: [YES / NO]

RESULT:
  outcome: [WIN / LOSS / PUSH / NO_ACTION]
  actual_stat_line: [e.g., 1 HR, 3 TB, 2 H]

POST-GAME ANALYSIS:
  pitcher_performed_as_modeled: [YES / PARTIALLY / NO]
  if_no_why: [e.g., commanded slider perfectly / pulled in 3rd inning / injured in warmups]
  
  environment_confirmed: [YES / NO]
  if_no_why: [e.g., wind shifted in from CF / dome opened / rain delay changed context]
  
  hitter_contact_quality: [BARREL / HARD_HIT / MEDIUM / SOFT / K-HEAVY / NO_ABs]
  if_no_ABs_why: [e.g., scratched / ejected / shortened game]
  
  matchup_structure_validated: [CONFIRMED / INCONCLUSIVE / INVALIDATED]
  if_invalidated_why: [e.g., pitcher's sweeper WAS commanded perfectly — our model was wrong about his command day]
  
  regression_signal_validated: [YES / NO / N/A]
  if_no_why: [e.g., regression happened in next 3 days not today]
  
  streak_continuation: [YES / NO / N/A]
  
  notes: [free text — any unusual circumstances, model corrections, pattern observations]

LEARNING FLAGS:
  is_this_a_false_positive_archetype: [YES / NO / MAYBE]
  if_yes_archetype: [e.g., "REGRESSION+MATCHUP composite when regression signal was already priced"]
  update_needed_in_model: [YES / NO]
  if_yes_what: [e.g., "Add efficient-market check for Unlucky signals on high-public players"]
---
```

---

## Aggregate Tracking Tables

### Hit Rate By BASEBALL_GRADE

| Grade | Plays | Wins | Hit Rate | Target Rate |
|-------|-------|------|----------|-------------|
| A | 0 | 0 | — | 65%+ (hits); 12%+ (HR); 45%+ (TB) |
| B | 0 | 0 | — | 55% / 9% / 38% |
| C | 0 | 0 | — | 48% / 7% / 32% |
| D | 0 | 0 | — | <40% / <5% / <25% |

*Update after each slate run. Grade accuracy above target = model is calibrated. Below target = model needs adjustment.*

### ROI By EDGE_DEPENDENCE Type

| Type | Plays | Units Won | Units Lost | ROI% | CLV Avg |
|------|-------|-----------|------------|-------|---------|
| MATCHUP | 0 | 0 | 0 | — | — |
| REGRESSION | 0 | 0 | 0 | — | — |
| ENVIRONMENT | 0 | 0 | 0 | — | — |
| STREAK | 0 | 0 | 0 | — | — |
| COMPOSITE | 0 | 0 | 0 | — | — |

*Primary hypothesis: COMPOSITE and MATCHUP will show highest ROI. REGRESSION may show negative CLV if signal is widely priced.*

### CLV Summary

| Period | Plays | Avg CLV | % with Positive CLV | Implication |
|--------|-------|---------|---------------------|-------------|
| All time | 0 | — | — | — |
| Last 30 days | 0 | — | — | — |
| Last 100 plays | 0 | — | — | — |

*If avg CLV is consistently positive: the system is finding real edges before the market adjusts.*  
*If avg CLV is consistently zero or negative: the system is reaching the same conclusions as the market — no actionable edge.*

### Fade/Trap Accuracy

| Trap Type | Plays Faded | Faded Outcome Hit | Fade Accuracy |
|-----------|-------------|-------------------|---------------|
| Lucky signal fades | 0 | 0 | — |
| Same-side mismatch fades | 0 | 0 | — |
| Faller-signal fades | 0 | 0 | — |
| Elite SP suppression fades | 0 | 0 | — |
| Game-in-progress fades | 0 | 0 | — |

*Higher fade accuracy = the trap identification framework is working.*

---

## Recurring Matchup Structure Hit Rate Tracker

Each named structure gets tracked individually to determine if it's a real durable edge:

| Structure ID | Description | Plays | Directional Win Rate | HR Win Rate | Notes |
|--------------|-------------|-------|---------------------|-------------|-------|
| STRUCT_01 | Pull-air LHB vs command-volatile RHP at high-env park | 0 | — | — | Henderson-type |
| STRUCT_02 | Unlucky regression signal + favorable matchup (composite) | 0 | — | — | Vientos/Wood-type |
| STRUCT_03 | Arsonist pitcher (7+ ERA) vs top-5 MLB hitter | 0 | — | — | Ramírez/Paddack-type |
| STRUCT_04 | Active 15+ game streak + platoon edge (Hits prop) | 0 | — | — | Steer/Marsh-type |
| STRUCT_05 | Altitude-degraded breaking ball vs pull-air RHB at Coors | 0 | — | — | Grichuk/Suárez-type |
| STRUCT_06 | Rate Field RHB pull + Taillon/similar-type RHP | 0 | — | — | Vargas-type |
| STRUCT_07 | Same-side LHP vs LHB (Sánchez/Cruz-type) fade | 0 | — | — | Fade accuracy only |
| STRUCT_08 | Elite SP mismatch (deGrom/Soriano vs opposite) fade | 0 | — | — | Fade accuracy only |
| STRUCT_09 | Lucky signal fade (BPP) | 0 | — | — | Fade accuracy; "fade hits" = fader is right |
| STRUCT_10 | Contact bat vs arsonist (Hits prop) | 0 | — | — | Kwan/Steer-type |

*After 10+ plays per structure, calculate structure-specific CLV and ROI. Retire structures that consistently underperform.*

---

## Quarterly Learning Review Template

Run this review every 90 days or 150+ plays:

1. **Which BASEBALL_GRADEs are calibrated?**  
   Compare actual win rates vs target. If Grade A hits at 48% for Hits (target 65%), either the baseball analysis is overconfident or the target is wrong.

2. **Which EDGE_DEPENDENCE types are generating CLV?**  
   If REGRESSION is consistently -CLV, the market has efficiently priced regression signals — stop treating them as independent edges.

3. **Which traps are accurate vs inaccurate?**  
   If Lucky signal fades only win 55% of the time (barely above chance for directional), the signal isn't as reliable as assumed.

4. **What is the primary false positive archetype?**  
   The most common "we thought it was strong but it lost consistently" pattern. Root-cause analysis required.

5. **What is the primary false negative archetype?**  
   The most common "we passed it but it hit" pattern. What was systematically missed?

6. **Model probability calibration check:**  
   If our model assigns 15% probability to a class of HR plays, do they actually hit at 15%? If they hit at 9%, our model is overestimating by 6 pp and needs recalibration.

7. **CLV trend:**  
   Is CLV improving (getting better relative to close over time) or degrading (market is learning faster than we are)?

---

*Template v1.0. Populate starting with May 16, 2026 plays once postgame results are available.*
