# AGENTS.md — EchoIQ v3 Project Instructions

## Mission

Build and maintain EchoIQ v3: a verification-first MLB prediction operating system that separates research, candidates, official bets, conditional plays, watchlists, external predictions, and postgame grading.

## Core operating rules

1. Do not make betting recommendations from raw research alone.
2. Every prediction row must have exactly one label: BET, LEAN, CONDITIONAL, WATCHLIST, LOTTERY, PASS, AVOID, or EXTERNAL.
3. Every official BET must have verified odds, fair probability, edge, source confidence A/B, gate status passed, and a kill switch.
4. EXTERNAL rows never count toward EchoIQ official ROI.
5. WATCHLIST rows never have stake units.
6. CONDITIONAL rows require explicit gate conditions.
7. A player-specific prop can only be graded HIT if the exact player achieved the result.
8. Estimated odds must be flagged as estimated and cannot be mixed into exact ROI.
9. Postgame grading must be separated by bucket.
10. No forced picks. PASS is a valid outcome.

## File safety

- Do not delete existing project files.
- Do not access secrets or paid APIs unless explicitly authorized.
- Do not stage, commit, or push unless explicitly asked.
- Keep implementation modular.
- Preserve source logs and unresolved gaps.

## Definition of done

A slate is complete only when the official card, watchlist, pass/avoid list, source-compliance table, and postgame grading schema are all populated or explicitly marked as unavailable.
