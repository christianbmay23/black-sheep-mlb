# EV Calculation Reference v1.0

---

## Core Formulas

```
# American odds → decimal
positive: decimal = (odds / 100) + 1       e.g., +135 → 2.35
negative: decimal = (100 / |odds|) + 1     e.g., -160 → 1.625

# Decimal → implied probability
implied_prob = 1 / decimal                  e.g., 2.35 → 0.426

# Remove vig (no-vig probability)
# Single-sided props (no paired under): divide by (1 + hold)
# Assume 6% hold unless known otherwise:
no_vig_prob = implied_prob / 1.06           e.g., 0.426 / 1.06 → 0.402

# Expected Value per unit
EV = (fair_prob × decimal) - 1             positive = +EV; negative = -EV

# CLV
CLV = no_vig_prob_at_bet - no_vig_prob_at_close
      positive = you got better than closing price
```

---

## HR Prop Example

**Schwarber HR vs Chandler. Book: FanDuel +115.**

```
Step 1 — Convert odds
  decimal = (115/100) + 1 = 2.15
  implied_prob = 1 / 2.15 = 0.4651

Step 2 — Remove vig
  no_vig_prob = 0.4651 / 1.06 = 0.4388  (43.9% no-vig)

Step 3 — Fair probability (model)
  base_rate:          Schwarber ~5.5% HR/PA × 4.5 PA expected = 0.247 (24.7%)
  pitcher_factor:     Chandler HR/9 vs LHB estimated 1.4 vs league 1.1 → ×1.27
  park_factor:        PNC LHB HR index ≈ 105 → ×1.05
  weather_factor:     unverified → ×1.00 (no adjustment)
  form_factor:        BPP 105 ≈ +3% → ×1.03

  fair_prob = 0.247 × 1.27 × 1.05 × 1.00 × 1.03 = 0.340  (34.0%)

Step 4 — EV
  EV = (0.340 × 2.15) - 1 = 0.731 - 1 = -0.269

Result: NEGATIVE EV at +115.
  Market implies 43.9% (no-vig). Model says 34.0%.
  Market is overpricing this play by ~10 pp.
  BET_GRADE: 4 — do not bet at +115.

  Break-even price: 1/0.340 = 2.94 decimal = +194
  Only bet Schwarber HR if you can get +194 or better.
```

---

## Hits Prop Example

**Spencer Steer 1+ Hits. Book: DraftKings -165.**

```
Step 1 — Convert
  decimal = (100/165) + 1 = 1.606
  implied_prob = 1 / 1.606 = 0.623

Step 2 — Remove vig
  no_vig_prob = 0.623 / 1.06 = 0.588  (58.8% no-vig)

Step 3 — Fair probability
  base_rate:          16-game streak player ~67% hit rate per game (approximate)
  matchup_factor:     LHB platoon vs LHP Cantillo → 0.95 (slight disadvantage on platoon)
                      Contact-first vs LHP with splitter → neutral → ×1.00
  park_factor:        Progressive neutral → ×1.00
  form_factor:        Streak durable (no Lucky flag) → ×1.02

  fair_prob = 0.670 × 0.95 × 1.00 × 1.00 × 1.02 = 0.649  (64.9%)

Step 4 — EV
  EV = (0.649 × 1.606) - 1 = 1.042 - 1 = +0.042

Result: +EV at -165. Model (64.9%) exceeds market no-vig (58.8%) by 6.1 pp.
  BET_GRADE: 1 — bet (meets ≥5 pp threshold).
  PRICE_SENSITIVITY: LOW — play retains value down to approximately -190.
```

---

## TB Prop Example (TB 1.5+)

**James Wood TB 1.5+. Book: BetMGM -110.**

```
Step 1
  decimal = (100/110) + 1 = 1.909
  implied_prob = 0.524
  no_vig_prob = 0.524 / 1.06 = 0.494  (49.4%)

Step 2 — Fair probability
  P(2+ TB) = P(XBH in game) + P(multi-1B in game)
  base_rate 2+ TB:     ~38% for a power LHB in a high-run game
  env_factor:          BPP 11.51 game total → ×1.12 (slate-best)
  pitcher_factor:      Bassitt ERA 5.21 / league 4.20 → ×1.24
  regression_factor:   Unlucky -35 → ×1.05 (positive regression imminent)
  park_factor:         Nationals Park neutral → ×1.00

  fair_prob = 0.380 × 1.12 × 1.24 × 1.05 × 1.00 = 0.554  (55.4%)

Step 3 — EV
  EV = (0.554 × 1.909) - 1 = 1.058 - 1 = +0.058

Result: +EV. Model (55.4%) exceeds market no-vig (49.4%) by 6.0 pp.
  BET_GRADE: 1 — bet.
  Note: weather gate still open. Reduce fair_prob by ×0.90 if wind-in confirmed → 49.9%
  → drops to BET_GRADE: 3 if wind-in. Flag as VOLATILITY: MEDIUM.
```

---

## CLV Example

```
Wood TB 1.5+: placed at -110 (no-vig: 49.4%)
Closing line:           -140 (no-vig: 56.4%)

CLV = 0.494 - 0.564 = -0.070  → GOT WORSE THAN CLOSE by 7 pp (bad)
Interpretation: The market moved toward confirming our thesis (line shortened)
but we bet before the value was gone. If CLV is consistently negative,
the system is finding plays the market is moving TOWARD — meaning we're late.
Target: CLV > 0 means we get better prices than where the line settles.
```

---

## Break-Even Price Quick Reference

| True Probability | Break-Even American Odds |
|-----------------|--------------------------|
| 5% | +1900 |
| 10% | +900 |
| 15% | +567 |
| 20% | +400 |
| 25% | +300 |
| 30% | +233 |
| 35% | +186 |
| 40% | +150 |
| 45% | +122 |
| 50% | +100 (even money) |
| 55% | -122 |
| 60% | -150 |
| 65% | -186 |
| 70% | -233 |
