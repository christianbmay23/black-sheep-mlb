# Codex Implementation Prompt — EchoIQ v3

ROLE:
You are a senior sports analytics engineer implementing EchoIQ v3 in the existing MLB prediction repo.

REASONING LEVEL:
High.

GOAL:
Implement the EchoIQ v3 workflow without breaking existing functionality.

CONTEXT:
EchoIQ v3 must enforce strict labels, verification gates, source-confidence scoring, and separate postgame ROI buckets.

IMPLEMENT:

1. Prediction labels:
   - BET
   - LEAN
   - CONDITIONAL
   - WATCHLIST
   - LOTTERY
   - PASS
   - AVOID
   - EXTERNAL

2. Prediction buckets:
   - official_card
   - conditional_card
   - watchlist
   - lottery
   - external_public
   - pass_avoid

3. Source confidence:
   - A, B, C, D, F

4. Market types:
   - HR, TB, HIT, RBI, RUN, ML, RL, TOTAL, PITCHER_PROP

5. Normalized prediction row schema.

6. Verification gates for HR, TB/HIT, and game picks.

7. Validation rules:
   - BET requires odds, fair_probability, edge, A/B source confidence, and all required gates passed.
   - CONDITIONAL requires explicit gate conditions.
   - WATCHLIST cannot have stake_units > 0.
   - EXTERNAL cannot count toward EchoIQ official ROI.
   - Player-specific prop cannot be HIT unless exact player achieved the result.
   - VOID requires player inactive, market void, or gate failed.
   - Estimated odds must be flagged.

8. Postgame grading helpers:
   - grade_official_card()
   - grade_conditional_card()
   - grade_lottery_card()
   - grade_watchlist()
   - grade_external_predictions()
   - summarize_roi_by_bucket()
   - generate_error_ledger()

9. Report outputs:
   - raw_research_board.csv
   - candidate_board.csv
   - verification_board.csv
   - official_card.csv
   - watchlist.csv
   - postgame_grade.csv
   - error_ledger.csv
   - echoiq_v3_report.md

CONSTRAINTS:

- Inspect the repo first.
- Do not delete files.
- Do not refactor unrelated modules.
- Do not access secrets.
- Do not use paid APIs.
- Do not commit or push unless explicitly asked.
- Add tests or a validation script.

VALIDATION:

Run available tests and the new validation script on sample rows.

FINAL RESPONSE FORMAT:

1. Summary
2. Files changed
3. New schema/rules added
4. Validation commands run
5. Test results
6. Remaining gaps
