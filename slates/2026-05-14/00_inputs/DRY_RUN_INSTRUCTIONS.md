# EchoIQ v3 Semi-Manual Dry Run Instructions

Date: 2026-05-14

This slate is a semi-manual dry run. Codex has created the local EchoIQ v3 folder structure and template artifacts only.

Codex has not fetched live data, called paid APIs, scraped odds, generated picks from scratch, or populated candidate rows.

## Research Roles

- GPT/Deep Research should supply verified slate research with cited sources.
- Claude may be used only for critique, consistency review, and narrative challenge.
- Codex should handle local artifact structure, schema validation, header checks, and mechanical file operations.

## Promotion Rules

Candidate rows must remain `WATCHLIST`, `LEAN`, or `CONDITIONAL` until all required gates are verified:

- Current odds
- Confirmed lineups or explicitly accepted lineup status
- Confirmed/probable starters and opener/bulk context
- Weather and park context
- Source confidence
- Fair probability
- Edge
- Kill switches

No row may be labeled `BET` unless the full gate package is verified and documented.

If a required source is missing, stale, conflicting, or unverifiable, keep the row out of the official card and record the gap.
