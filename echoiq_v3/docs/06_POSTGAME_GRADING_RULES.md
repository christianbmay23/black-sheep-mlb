# EchoIQ v3 Postgame Grading Rules

## Buckets must be graded separately

| Bucket | Grade type |
|---|---|
| Official BET | Win/loss/ROI |
| CONDITIONAL that cleared | Win/loss/ROI, separate from official card |
| LOTTERY | Separate small-stake ROI |
| WATCHLIST | Process grade only |
| EXTERNAL | Public-source accuracy only |
| PASS/AVOID | Process validation only |

## Player-specific rule

A player-specific prop can only be graded HIT if that exact player achieved the result.

Examples:

- Junior Caminero HR is LOSS if Ryan Vilade homers.
- Cal Raleigh HR is VOID if Raleigh does not play and the gate required active/no restriction.
- A watchlist player who homers is WATCHLIST-HIT, not official HIT.

## ROI rules

- Exact odds: use exact price.
- Estimated odds: label ROI as estimated.
- Do not mix official, lottery, conditional, watchlist, and external ROI.
- A void has 0 profit/loss.
- A gate-failed conditional is not a loss unless the rule says it became active.

## Required postgame files

- `postgame_grade.csv`
- `source_compliance.csv`
- `error_ledger.csv`
- `model_lessons.csv`
