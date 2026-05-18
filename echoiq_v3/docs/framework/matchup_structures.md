# EchoIQ Matchup Structure Database v1.0

Each structure defines a reusable betting archetype with ideal conditions and failure modes.
Track hit rate per structure in `postgame_log.csv` → `matchup_structure_validated` column.

---

## STRUCT_01 — Pull-Air LHB vs Command-Volatile RHP / High-Env Park
**Prototype:** Henderson vs Cavalli at Nationals Park

| Component | Requirement |
|-----------|-------------|
| Hitter | LHB, pull-dominant, flat VAA, top-30% barrel rate |
| Pitcher | RHP, walk rate >3.5/9, ERA >4.00, command-volatile (not stuff-limited) |
| Park | Neutral or HR-friendly; at minimum neutral for pull-LHB |
| Environment | BPP sim total ≥9.5 |

**Ideal:** SP has history of "mistake" games (counts go against him) in home games.

**Failure modes:**
- Pitcher's stuff, not command, limits damage (then mistakes still miss bats)
- Hitter's flat VAA doesn't generate loft against pitcher's vertical miss plane
- Park suppresses pull contact on cool nights

---

## STRUCT_02 — Regression-Positive Hitter + Favorable Matchup (Composite)
**Prototype:** Vientos (Unlucky -36) vs Rodón (6.23 ERA)

| Component | Requirement |
|-----------|-------------|
| Hitter | BPP Unlucky ≥ -25; xStats above stat line |
| Pitcher | ERA ≥4.50 OR known command issues |
| Convergence | Both regression AND matchup edge present independently |

**Ideal:** Hitter is NOT a public star (regression signal not priced); game total ≥9.

**Failure modes:**
- Regression signal already priced by market (CLV negative despite baseball grade A)
- Pitcher turns in command-day despite ERA (can happen 1-in-5 starts)
- Regression doesn't manifest same day (timing uncertain; may take 3-5 more games)

---

## STRUCT_03 — Arsonist Pitcher (ERA ≥7.0) vs Premier Hitter
**Prototype:** Ramírez vs Paddack (7.63 ERA)

| Component | Requirement |
|-----------|-------------|
| Hitter | Top-15% MLB by barrel rate; ≥3 PA expected vs the SP |
| Pitcher | ERA ≥6.50; K% not notably elevated (not "missing bats, allowing runs") |
| Match | Pitcher's primary miss-direction ≠ hitter's weak zone |

**Ideal:** SP has no reliable LHB (or RHB, per matchup) put-away pitch.

**Failure modes:**
- SP pulled in 2nd/3rd inning — PA count drops below threshold
- Arsonist ERA driven by HR-against-non-elite-hitters, not premier bat exposure
- SP has one elite pitch even in down year that can dominate premier hitter

---

## STRUCT_04 — Active Streak (≥15 Games) + Platoon Edge (Hits)
**Prototype:** Steer (16-game) vs Cantillo LHP; Marsh (15-game) vs Chandler RHP

| Component | Requirement |
|-----------|-------------|
| Hitter | Active streak ≥13 games; BPP streak validated (no Lucky flag) |
| Pitcher | ERA ≥3.50 OR platoon disadvantage for pitcher |
| Hitter profile | Contact-first (K% below avg); not power-first |

**Ideal:** Hitter bats 1-3 in order (≥4 PA expected); no same-side fade risk.

**Failure modes:**
- Streak ends (base rate: ~50% continuation at 15 games)
- Pitcher commands breaking ball perfectly — high-K sequences vs contact bat
- Contact quality masked by luck during streak (check BPP Lucky flag — if Lucky+, downgrade)

---

## STRUCT_05 — Altitude Breaking-Ball Degradation (Coors)
**Prototype:** Grichuk/Suárez vs Sugano at Coors

| Component | Requirement |
|-----------|-------------|
| Pitcher | Primary putaway pitch is splitter, curveball, or slider; ≥30% usage |
| Hitter | Pull-air swing; attacks elevated zone; RHB preferred (splitter runs toward LHBs) |
| Confirmation | BPP total ≥10.5 AND wind not blowing in (verify weather) |

**Ideal:** Pitcher has no reliable above-average fastball to compensate for degraded breaking ball.

**Failure modes:**
- Wind blowing in from CF/LF — kills HR carry even if hitter squares one
- Pitcher has elite fastball that plays up even without breaking ball working
- Coors "soft day" (cold, low-wind) reduces carry below typical altitude boost

---

## STRUCT_06 — HR-Park Pull-RHB vs Predictable-Mix RHP
**Prototype:** Vargas vs Taillon at Rate Field

| Component | Requirement |
|-----------|-------------|
| Park | RHB pull HR factor ≥105 (Rate Field, Wrigley, Globe Life) |
| Hitter | Pull-dominant RHB; top-40% hard-hit% |
| Pitcher | RHP, ERA ≥3.50, relies on FB+breaking ball (not elite movement) |

**Ideal:** Pitcher falls behind in counts → throws elevated 4S in zone → park factor activates.

**Failure modes:**
- Wind blowing hard in from LF at Rate Field (most common kill)
- Pitcher maintains sinker down and away all day (eliminates pull-elevated contact)
- Hitter's pull tendency declining in current season

---

## STRUCT_07 — Elite Contact Bat vs Low-Whiff Arsonist (Hits)
**Prototype:** Kwan vs Paddack

| Component | Requirement |
|-----------|-------------|
| Hitter | K% ≤15%; bat-to-ball elite; leadoff or 1-2 hole (≥4.5 PA) |
| Pitcher | Whiff% ≤22% (pitcher gets results but not via strikeouts); ERA ≥5.50 |

**Ideal:** Pitcher's ERA driven by contact management failures, not strikeouts — hitter makes contact and BABIP normalizes positively.

**Failure modes:**
- Pitcher pulled in 3rd inning (reduces PA count vs target SP)
- Hitter's K% spikes vs this specific pitch type (verify splits)

---

## STRUCT_08 — Same-Side Mismatch Fade
**Prototype:** Cruz (LHB) vs Sánchez (LHP) at PNC

| Component | Requirement |
|-----------|-------------|
| Fade target | LHB vs LHP with elite changeup/slider moving away; or RHB vs RHP with same |
| Confirm fade | Pitcher's primary weapon naturally moves away from same-side hitter |
| Amplifier | BPP Lucky flag on hitter = double-fade |

**Ideal fade conditions:** Low game total + same-side + Lucky flag + deep LCF/RF for away-side hitter.

**Failure modes (fade fails when):**
- Same-side hitter has documented reverse-split (handles same side unusually well)
- Pitcher's ERA is inflated by other factors; still has good command vs same-side today

---

## STRUCT_09 — Star Name in Poor Matchup (Public Trap Fade)
**Prototype:** LAD RHB vs Soriano; Betts HR; Yordan vs deGrom

| Component | Requirement |
|-----------|-------------|
| Star player | Top-25 market recognition; heavily wagered regardless of matchup |
| Opposing pitcher | ERA ≤2.50 OR GB rate ≥52% (same-side) |
| Market signal | This player will be overbet → line inflated |

**Fade thesis:** Market prices star name, not matchup. Edge = fading the public at inflated lines.

**Failure modes (fade fails when):**
- Star player has documented ability to handle elite pitchers specifically
- Line is not actually inflated (book has already adjusted for name bias)

---

## STRUCT_10 — Late-Slot Undervalued Hitter-Friendly Game
**Prototype:** Kurtz/Wilson at Sutter Health Park (9:40 PM ET)

| Component | Requirement |
|-----------|-------------|
| Game time | 8:30 PM ET or later first pitch |
| Park | Hitter-friendly (BPP total ≥9.5 for that game) |
| Hitter | Active BPP Riser or active streak; not a public-attention name |
| Pricing hypothesis | Casual market drops off late → less efficient pricing on late-game props |

**Ideal:** Hitter is not well-known nationally; book may not have adjusted for late-game model.

**Failure modes:**
- Sharp books have same model for late games as early (DK/FD do not reduce efficiency late)
- Cool late-night temperatures suppress HR carry (Sacramento, Denver)
- Hitter's name recognition is higher than assumed

---

## Structure Tracking Summary

| Structure ID | Description | Plays | Win Rate | CLV Avg | Status |
|--------------|-------------|-------|----------|---------|--------|
| STRUCT_01 | LHB vs command-volatile RHP | 0 | — | — | Tracking |
| STRUCT_02 | Regression + matchup composite | 0 | — | — | Tracking |
| STRUCT_03 | Arsonist vs premier hitter | 0 | — | — | Tracking |
| STRUCT_04 | Streak ≥15 + platoon (Hits) | 0 | — | — | Tracking |
| STRUCT_05 | Coors altitude breaking ball | 0 | — | — | Tracking |
| STRUCT_06 | HR park + pull-RHB vs predictable RHP | 0 | — | — | Tracking |
| STRUCT_07 | Elite contact vs low-whiff arsonist | 0 | — | — | Tracking |
| STRUCT_08 | Same-side mismatch fade | 0 | — | — | Tracking |
| STRUCT_09 | Star name in poor matchup fade | 0 | — | — | Tracking |
| STRUCT_10 | Late-slot undervalued game | 0 | — | — | Tracking |
