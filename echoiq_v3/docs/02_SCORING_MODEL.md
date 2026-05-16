# EchoIQ v3 Scoring Model

## Formula

```text
EchoIQ Play Score =
Projection Score
+ Matchup Score
+ Environment Score
+ Market Edge Score
+ Source Confidence Score
- Volatility Risk
- Kill-Switch Risk
```

## Component scores

| Score | Scale | Meaning |
|---|---:|---|
| Projection Score | 0–20 | Base likelihood of outcome |
| Matchup Score | 0–20 | Batter/pitcher or team matchup fit |
| Environment Score | -10 to +15 | Park, weather, roof, wind, game context |
| Market Edge Score | -10 to +20 | Fair probability vs implied probability |
| Source Confidence Score | 0–15 | Verification quality |
| Volatility Risk | 0–15 | Fragility, command risk, injury, weather, bullpen chaos |
| Kill-Switch Risk | 0–10 | Number/severity of assumptions that can break play |

## Label thresholds

| Final Score | Default label |
|---:|---|
| 70+ | BET candidate, subject to all gates |
| 60–69 | LEAN / CONDITIONAL |
| 50–59 | WATCHLIST |
| 40–49 | PASS unless price is exceptional |
| <40 | AVOID/PASS |

## HR staking guide

| Tier | Conditions | Stake |
|---|---|---:|
| A | 5%+ edge, A/B source confidence, all gates passed | 0.75u–1u |
| B | 3%–5% edge, strong context, all gates passed | 0.25u–0.5u |
| Lottery | Long odds, real path, high volatility | 0.10u–0.25u |
| Watchlist | Missing fair prob, odds, lineup, weather, or source confidence | 0u |
