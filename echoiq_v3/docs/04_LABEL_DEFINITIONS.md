# EchoIQ v3 Label Definitions

| Label | Meaning | Counts in ROI? |
|---|---|---:|
| BET | Official playable recommendation | Yes |
| LEAN | Good angle, insufficient edge/verification | No |
| CONDITIONAL | Becomes BET only if exact gate clears | Only if gate clears |
| WATCHLIST | Interesting target, missing important info | No |
| LOTTERY | Small-stake longshot with real path | Separate ROI |
| PASS | Researched and rejected | No |
| AVOID | Do not bet barring major data/market change | No |
| EXTERNAL | Public-source prediction, not EchoIQ | No EchoIQ ROI |

## Upgrade/downgrade rules

- WATCHLIST → CONDITIONAL only when one or two exact gates remain.
- CONDITIONAL → BET only when every gate is verified and price remains playable.
- LEAN → BET only with fair probability, edge, current odds, and A/B source confidence.
- EXTERNAL → candidate only after independent EchoIQ verification.
- PASS/AVOID → reconsider only after material lineup, pitcher, weather, or price change.
