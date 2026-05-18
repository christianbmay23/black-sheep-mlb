# Grade Assignment Quick Reference v1.0

Use this operationally. Assign all 5 components before finalizing any play.

---

## BASEBALL_GRADE

| Grade | Assign when… |
|-------|-------------|
| A | ≥2 VERIFIED or HIGH_CONF inputs converge; pitch vulnerability + swing path match both supported |
| B | Clear directional edge; ≥1 input is LOW_CONF_INFERENCE; overall logic holds |
| C | Reasonable lean; multiple inferred inputs; single weak signal driving the play |
| D | Narrative-driven; no structural pitch-bat interaction identified |
| F | Active regression negative (Lucky flag) + same-side mismatch + suppressive environment simultaneously |

**Fast rule:** If the primary supporting claim is `LOW_CONF_INFERENCE` or `UNSUPPORTED`, cap at **B**.

---

## BET_GRADE

*Requires prop price. If price unknown → BET_GRADE = `PENDING_PRICE`. Do NOT skip.*

| Grade | Condition |
|-------|-----------|
| 1 | fair_prob > no_vig_implied_prob by ≥5 pp → bet |
| 2 | fair_prob > no_vig_implied_prob by 2–5 pp → best price only |
| 3 | fair_prob within ±2 pp of no_vig_implied → small/CLV only |
| 4 | fair_prob < no_vig_implied by any margin → do not bet |
| PASS | BASEBALL_GRADE D or F; or fair_prob clearly negative regardless of price |

---

## PRICE_SENSITIVITY

| Label | Rule of thumb |
|-------|---------------|
| LOW | High true probability (≥25%); play retains value across ±20 pp implied range |
| MEDIUM | Moderate true probability (12–24%); ±10 pp range |
| HIGH | Low true probability (<12%); ±5 pp range; must get specific number |
| EXTREME | Model and market within 2 pp; do not bet unless on no-vig platform |

**Star players (Judge, Schwarber, Ramírez, Trout) default to HIGH unless price is unusually soft.**

---

## VOLATILITY

| Label | Assign when… |
|-------|-------------|
| LOW | Lineup confirmed + weather confirmed + no LOW_CONF claims driving the play |
| MEDIUM | One gate open (lineup OR weather unconfirmed) |
| HIGH | Two+ gates open; or primary analytical claim is LOW_CONF_INFERENCE |
| CRITICAL | Pitcher identity uncertain; or lineup fully unconfirmed; or PPD/weather risk |

**Do not bet CRITICAL or HIGH volatility plays until gates close.**

---

## EDGE_DEPENDENCE

| Label | Primary signal | Market pricing risk |
|-------|---------------|---------------------|
| MATCHUP | Pitch vulnerability + swing path interaction | Lower — harder to model at scale |
| REGRESSION | BPP Unlucky/Lucky or xStats signal | Higher — public signals |
| ENVIRONMENT | Park factor + weather + game total | High — lines already reflect environment |
| STREAK | BPP active hit streak | Medium — public bets streaks aggressively |
| COMPOSITE | ≥2 independent signals | Lowest — hardest to arbitrage |

**Prefer COMPOSITE and MATCHUP. Treat REGRESSION and STREAK as supportive, not primary.**

---

## Quick-Assign Checklist

```
[ ] BASEBALL_GRADE assigned?        ___
[ ] BET_GRADE or PENDING_PRICE?     ___
[ ] PRICE_SENSITIVITY assigned?     ___
[ ] VOLATILITY assigned?            ___
[ ] EDGE_DEPENDENCE assigned?       ___
[ ] All LOW_CONF claims hedged?      ___
[ ] Prop price pulled (or flagged)?  ___
```
