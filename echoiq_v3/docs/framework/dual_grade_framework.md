# EchoIQ Dual-Grade Framework v1.0
## Separating Baseball Quality from Betting Value

**Status:** Proposed post-audit. Replaces single-label ELITE/STRONG/SOLID system for all future slate runs.

---

## Core Principle

A play has two independent dimensions that must never be merged:

1. **BASEBALL_GRADE** — How strong is the matchup/regression/environment edge on a pure baseball basis?
2. **BET_GRADE** — At the current market price, does this play have positive expected value?

An ELITE baseball play at the wrong price is a losing bet.  
A SOLID baseball play at the right price is a winning bet.  
The current framework only measures the first dimension.

---

## The Five-Component Rating

Every play receives exactly five labels before final action:

### Component 1: BASEBALL_GRADE
*How strong is the raw baseball edge?*

| Grade | Meaning | Criteria |
|-------|---------|----------|
| **A** | Structural edge confirmed | Pitch vulnerability + swing path match are specific and high-confidence; multiple converging signals; no material contradictions |
| **B** | Clear directional edge | Strong matchup logic but one or more inputs are HIGH-CONFIDENCE INFERENCE rather than verified data |
| **C** | Reasonable lean | Logic holds but 2+ uncertain inputs; narrative-driven elements present |
| **D** | Marginal or speculative | Single weak signal; public narrative driving more than analytics |
| **F** | Confirmed fade | Active regression signal + bad matchup + poor environment simultaneously |

*Assigned by analyst. Based on quality of verified vs inferred inputs.*

---

### Component 2: BET_GRADE
*At today's market price, is this a bet?*

| Grade | Meaning | Criteria |
|-------|---------|----------|
| **1** | Positive EV — bet now | Model probability > market implied probability (after hold removal) by ≥ 5%; line is available; bet |
| **2** | Positive EV — best price only | Model probability vs no-vig implied is close; only bet at the best available book; do NOT chase |
| **3** | Near-fair | Model probability ≈ no-vig implied ± 3%; may be worth small bet for CLV tracking; not a conviction play |
| **4** | Underpriced by market | Market has already priced the edge; model probability below implied; attractive baseball but negative EV at current price |
| **PASS** | Do not bet | Either negative EV by > 3% or baseball grade is F or D; clear fade |

*Assigned by bet-layer engine. Requires prop price input.*

**When BET_GRADE cannot be assigned:** If prop price is unavailable (e.g., line not posted yet), BET_GRADE = "PENDING_PRICE." Do NOT default to betting based on BASEBALL_GRADE alone.

---

### Component 3: PRICE_SENSITIVITY
*How much does odds movement change the decision?*

| Label | Meaning | Example |
|-------|---------|---------|
| **LOW** | Play retains +EV across a 40-cent price range | True probability is high (25%+); move from +120 to +80 doesn't flip EV |
| **MEDIUM** | Play retains +EV in a 20-30 cent range | Check at least 2 books; meaningful but not razor-thin edge |
| **HIGH** | Play depends on getting a specific price | Within a 10-15 cent range; if best price goes, the bet goes |
| **EXTREME** | Model probability and implied probability are nearly equal | Any juice removed flips the play; only viable on extreme no-vig books |

*Use PRICE_SENSITIVITY to determine how aggressively to shop and how quickly to act.*

---

### Component 4: VOLATILITY
*How stable is the underlying edge?*

| Label | Meaning | What Can Change It |
|-------|---------|-------------------|
| **LOW** | Multiple converging confirmed signals | Lineup scratch of targeted player; weather shift (rare) |
| **MEDIUM** | One or two uncertain inputs | Unconfirmed lineup; unverified weather; one BPP signal driving edge |
| **HIGH** | Multiple uncertain inputs; analytical confidence depends on assumptions resolving correctly | Arsenal inference unverified; lineup unconfirmed; park factor marginal |
| **CRITICAL** | Edge could reverse entirely on new information | Pitcher identity unverified; weather gate completely open; lineup ambiguous |

*HIGH or CRITICAL VOLATILITY plays should not be bet until gates clear. The volatility label is the conditional flag — it replaces the blanket "CONDITIONAL" label from the old system.*

---

### Component 5: EDGE_DEPENDENCE
*What is the primary source of edge?*

| Label | Meaning | Persistence | Pricing Risk |
|-------|---------|-------------|--------------|
| **MATCHUP** | Edge from specific pitch-bat interaction | Highest: structural edges don't disappear | Lower: harder to model for mass market |
| **REGRESSION** | Edge from xStats/BPP Unlucky/Lucky signals | Medium: regression happens but timing uncertain | Higher: widely available signals may be priced |
| **ENVIRONMENT** | Edge from park, weather, game total | Medium: environment is verifiable and public | High: total lines already reflect environment |
| **STREAK** | Edge from BPP hit-streak momentum | Lower: streaks end; continuation rate ~50% at 15+ games | Medium: public heavily bets streaks = pricing pressure |
| **COMPOSITE** | Multiple independent edges (2+) converging | Highest: redundant sources of edge | Lower: harder for single factor to be arbitraged away |

*COMPOSITE plays are preferred. A play that is purely REGRESSION is the weakest because the signal is the most transparent to the market.*

---

## Example Play Ratings (May 16 Slate Retroactive)

### Schwarber HR vs Chandler
```
BASEBALL_GRADE:    A
BET_GRADE:         PENDING_PRICE (prop price not pulled during run)
PRICE_SENSITIVITY: HIGH (star player = efficient pricing; narrow edge window)
VOLATILITY:        MEDIUM (swing path analysis = high-conf; weather = unverified)
EDGE_DEPENDENCE:   MATCHUP
```
*Action:* Pull Schwarber HR price from 3 books. Calculate EV using 25-27% fair probability vs implied probability. Bet at BET_GRADE 1 or 2 only.

---

### James Wood HR vs Bassitt
```
BASEBALL_GRADE:    B+ (matchup inference is 2024-based; not verified 2026 Savant)
BET_GRADE:         PENDING_PRICE
PRICE_SENSITIVITY: MEDIUM (not a public star player; pricing may be less efficient)
VOLATILITY:        MEDIUM (regression signal real; arsenal analysis = HIGH-CONF INFERENCE)
EDGE_DEPENDENCE:   COMPOSITE (regression + matchup + environment)
```
*Action:* Calculate fair probability using base rate + Bassitt HR/9 factor + park factor + Unlucky signal. Compare vs market. Wood's composite edge type is more valuable than Vientos's regression-heavy play if both are priced equivalently.

---

### Spencer Steer Hits vs Cantillo
```
BASEBALL_GRADE:    A- (16-game streak durable; contact approach vs LHP structurally sound)
BET_GRADE:         PENDING_PRICE
PRICE_SENSITIVITY: LOW (hits prop = high base rate; 60%+ true probability; wide edge window)
VOLATILITY:        LOW (contact approach is structural; no uncertain inputs remain after lineup confirm)
EDGE_DEPENDENCE:   COMPOSITE (streak + matchup/platoon + contact skill baseline)
```
*Action:* If Hits 1+ at fair or better odds (roughly -180 or better depending on book), this is a BET_GRADE: 1 call. The LOW price sensitivity and LOW volatility make this the most actionable play type on the slate.

---

### Mark Vientos HR vs Rodón
```
BASEBALL_GRADE:    A-
BET_GRADE:         PENDING_PRICE (strong suspicion this is BET_GRADE: 3-4 due to public attention)
PRICE_SENSITIVITY: HIGH (NYC star + BPP Unlucky signal is public = likely efficiently priced)
VOLATILITY:        MEDIUM
EDGE_DEPENDENCE:   COMPOSITE (but regression component likely already priced)
```
*Note:* If this is priced identically to Wood (comparable baseball grade), Wood is the better bet because its edge dependence is less transparent to the market.

---

## The Essential Pricing Rule

Before any play advances from BASEBALL_GRADE to BET_GRADE:

**Step 1:** Pull the prop price from best available book.  
**Step 2:** Convert to implied probability (1 / decimal odds).  
**Step 3:** Remove the hold (divide by sum of both sides' implied probs, or subtract estimated 5-7% hold).  
**Step 4:** Calculate fair probability from: base_rate × pitcher_factor × park_factor × weather × form.  
**Step 5:** If fair_probability > no_vig_implied_probability → bet.  
**Step 6:** If fair_probability < no_vig_implied_probability → PASS (even if BASEBALL_GRADE = A).

---

## Analyst Workflow Integration

### At analysis time (T-24h):
- Assign BASEBALL_GRADE based on verified + inference inputs
- Assign preliminary VOLATILITY (HIGH until gates clear)
- Assign EDGE_DEPENDENCE
- Flag PRICE_SENSITIVITY as HIGH for all star/public players
- BET_GRADE = PENDING_PRICE

### At price time (T-3h to T-1h):
- Pull prop prices from 3+ books
- Calculate fair probability using parameterized model
- Assign BET_GRADE
- Update VOLATILITY based on lineup + weather confirmation

### At confirmation time (T-60min):
- Confirm lineups
- Confirm weather final
- Reduce VOLATILITY for any confirmed plays
- Final BET_GRADE assignment
- Record price snapshot for CLV tracking

---

## What the Old System Got Right (Keep These)

1. BPP Lucky/Unlucky signal integration → valid regression predictor
2. Park factor directional reasoning → correct application
3. Platoon split identification → correct structural identification
4. Trap play / fade identification → structurally sound
5. Streak durable vs lucky distinction → correct use of BPP confirmation
6. Team offensive ecosystem (batting order, PA count) → valuable analytical layer
7. Bullpen follow-through framing → correct concept (needs data to back it)
8. "What kills this play" risk discipline → keep and deepen

---

*Framework v1.0 — post May 16, 2026 slate audit. Supersedes single-label system.*
