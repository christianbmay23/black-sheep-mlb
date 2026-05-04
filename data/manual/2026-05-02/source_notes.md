# EchoIQ May 2, 2026 Manual Input Notes

## Source Policy

This package treats the Opus Part 1, Opus Part 2, and GPT updated PDF reports as research inputs, not official truth. Official MLB Stats API data was used only for game identifiers, venues, game status, probable starters, and confirmed lineups where feed/live returned batting orders.

Report rows use `2026-05-02T18:00:00Z` as a slate-date extraction marker because the supplied reports did not expose a precise publication timestamp in the extracted text. This is not a verified market timestamp.

## Files

- `odds.csv`: report-stated market prices only. Conflicted or live/in-progress rows are marked Low confidence or watchlist.
- `props.csv`: report-stated player props, HR candidates, total-bases candidates, and pitcher prop candidates. Missing market prices and conceptual-only probabilities are left blank.
- `weather.csv`: report-stated weather only. Exact values are low confidence when reports conflict.
- `ballpark_pal.csv`: report-stated Ballpark Pal or park/environment factors only. Missing exact values are left blank.
- `lineups.csv`: confirmed lineups from the free official MLB Stats API for games where feed/live returned batting orders.
- `echoiq_inputs.json`: JSON mirror of the CSV package for audit/alternate ingestion.

## Explicit Source Conflicts / Unresolved Items

- ATL/COL opposing starter: Opus references Colorado starter uncertainty in places, while the official MLB Stats API and GPT PDF list Brennan Bernardino opposite Chris Sale. The manual package uses the official game/starter context where needed and records report conflict here.
- CLE/OAK venue/factors: Official MLB Stats API and Opus identify Sutter Health Park; GPT PDF listed Oakland Coliseum with lower park factors. The package uses official venue plus Opus Sutter factors and records the conflict.
- STL ML price: Opus lists St. Louis around +110 to +118; GPT PDF table lists STL -145. The odds row uses Opus because it is a primary final-card source, with this conflict documented.
- DET ML price: GPT PDF simultaneously cites Detroit +115 as value and Detroit -135 in its slate table. The odds row is Low confidence and watchlist only.
- Sale strikeout line: Opus uses Chris Sale over 7.5 strikeouts at +108; GPT PDF uses over 5.5 around +110. The prop row uses Opus and records the line conflict.
- Cease strikeout line: Opus uses Dylan Cease over 6.5 at +108; GPT PDF mentions a higher 8.5 context. The package marks Cease Low confidence because the game was already in progress at package build.
- Lugo strikeout direction: Opus watchlist is Seth Lugo under 6.5 strikeouts; GPT PDF references an over-4.5 angle. The package preserves the Opus under-side row but does not convert it to an over final-card candidate.
- Adolis Garcia / Gleyber Torres team-game mismatch: GPT PDF references Adolis Garcia as a Texas/Tigers candidate and Gleyber Torres as a Texas TB candidate. Official lineups put Adolis Garcia in PHI@MIA and Gleyber Torres on Detroit. Those report candidates were not converted into TEX@DET prop rows.
- Several games were already in progress at package build: BAL@NYY, TOR@MIN, ARI@CHC, CLE@OAK, CIN@PIT, MIL@WSH, HOU@BOS, and PHI@MIA. Related candidate rows are Low confidence/watchlist and should not be treated as final-card proof.
- Missing official lineups: CWS@SD, NYM@LAA, and KC@SEA lineups were not populated because confirmed lineups were unavailable in the official feed extract used for this package.
- Ballpark Pal/weather timestamps: The reports gave environment notes but no independently verified Ballpark Pal timestamps. Those rows keep source confidence conservative.

## Report Fields Not Converted

- Conceptual TB/HR candidates without player market line, current price, or numeric probability were either omitted or added as raw/watchlist rows with missing market fields.
- Over/under pitcher prop directions that the current EchoIQ board treats as over-side only were preserved for source audit but not promoted to final-card candidates.
- GPT-only final-card rows with internal price conflicts or live/in-progress game context were marked Low confidence.

## Late-Market Refresh - 2026-05-02T20:49:06Z

Verified updates applied:

- MLB Stats API status check: BAL@NYY final, TOR@MIN/ARI@CHC game over, CLE@OAK/CIN@PIT/MIL@WSH/HOU@BOS/PHI@MIA live, and SF@TB/LAD@STL/TEX@DET/ATL@COL/CWS@SD still pregame at refresh time.
- STL ML updated from report-stated +114 to FanDuel late odds +120 with StatMuse consensus +123 cross-check. Older GPT -145 conflict is no longer used as current price.
- Chris Sale O7.5 K updated from report-stated +108 to FanDuel Research +106 as of its Saturday afternoon update. Covers and EVAnalytics still showed plus-money prices, but the package uses FanDuel as the refreshed source.
- Matt Olson HR updated to FanDuel Research +260; BetMGM/PokerStars showed different plus prices, so the row remains LOTTERY rather than GOOD_VALUE.
- Shohei Ohtani HR updated to FanDuel Research +265 and remains WATCHLIST.
- SF ML updated to FanDuel/StatMuse -116. It remains a value-board candidate only; EchoIQ may still block final-card promotion if game-level prop gaps remain critical.
- CWS/SD Under updated from missing/report-only to StatMuse consensus Under 7.5 -105, with BetMGM/FanDuel showing line/price variance. It remains WATCHLIST because no model probability was verified.
- TEX/DET Over updated to FanDuel 8.5 +100, with StatMuse showing 8.0 -118. Because the report model was for a different line, model_probability was blanked and the row remains Low-confidence watchlist.
- DET ML updated to FanDuel -132 / StatMuse -140 range. GPT's +115 value claim is stale/conflicted, so the row remains Low-confidence watchlist.
- CWS@SD confirmed lineups were added from MLB Stats API feed/live. NYM@LAA and KC@SEA remained without confirmed lineups in the refresh.
- Pregame weather rows were refreshed from Parlay Savant where available. Ballpark Pal factor rows were not refreshed because no current Ballpark Pal factor source was verified.

Rows cut from current-market eligibility:

- All odds/props tied to final or live games had current prices blanked and confidence lowered so they cannot promote to the final card.
- Report-stated prop prices for Michael McGreevy, Kumar Rocker, and Seth Lugo were blanked because no current free verified prop price was found in the refresh.

Still unresolved:

- ATL/COL opposing-starter context remains partially conflicted: MLB Stats API and FanDuel Olson page list Brennan Bernardino, while some preview/odds pages still show TBA or Chase Dollander.
- Current Ballpark Pal run/HR factor timestamps remain unavailable.
- Several sportsbook/aggregator prices differ by source. The package records one refreshed source per row and keeps conflicts in unresolved gaps/source notes.

