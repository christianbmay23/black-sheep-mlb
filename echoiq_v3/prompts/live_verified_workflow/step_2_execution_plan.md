# Step 2 — EchoIQ Pregame Verification Execution Plan

Use this opened EchoIQ project folder as the workspace root.

Read:
- prompts/step_3_pregame_live_verified_run.md
- framework/verification_taxonomy.md
- framework/dual_grade_framework.md
- framework/grade_assignment_quick_reference.md
- framework/price_ingestion_schema.json
- framework/ev_calculation_examples.md
- framework/matchup_structures.md
- framework/savant_fetch_plan.md

Do not execute the live research run yet.
Do not create final output files yet.
Do not inspect every source yet.
Do not overwrite any existing artifacts.

Your job is to create a concise execution plan for running:
prompts/step_3_pregame_live_verified_run.md

The plan must include:

1. Which files to read first.
2. Which games/sources to check first.
3. How to identify games that have not started.
4. How to exclude live/final/stale games.
5. How to use Outlier for HR/TB/Hits props and prices.
6. How to use MLB.com for lineups, game status, and starters.
7. How to use Savant/FanGraphs for pitcher arsenal, batter pitch-type splits, hot/cold zones, and matchup verification.
8. How to use Ballpark Pal/weather for park and weather context.
9. Whether to use subagents or multitask.
10. If subagents are used, define their read-only lanes.
11. Which files the parent agent should write.
12. How to avoid file conflicts.
13. How to conserve tokens and usage.
14. What to do if browser/source access fails.

Subagent recommendation format:

- Outlier Props/Prices Subagent:
  - read-only
  - job
  - output expected

- MLB/Lineups/Weather Subagent:
  - read-only
  - job
  - output expected

- Savant/FanGraphs Subagent:
  - read-only
  - job
  - output expected

Parent agent:
- owns final synthesis
- writes final files only
- resolves conflicts

Return the plan and wait.
Do not execute Step 3.