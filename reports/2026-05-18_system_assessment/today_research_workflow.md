# May 18, 2026 Research Workflow

Date: 2026-05-18  
Status at assessment time: MLB.com schedule and probable pitchers verified; lineups still `TBD`; no Outlier, Ballpark Pal, sportsbook, weather/roof, or Savant candidate snapshots captured into repo artifacts.

## Verified MLB Schedule / Starter Baseline

Source: MLB.com schedule/probables and MLB Stats API. All listed games were `Scheduled` / pregame in the Stats API at lookup time.

| gamePk | Game | First pitch UTC | Venue | Status | Probable starters |
|---:|---|---|---|---|---|
| 824277 | CLE @ DET | 2026-05-18T22:40:00Z | Comerica Park | Scheduled | Slade Cecconi vs Framber Valdez |
| 822980 | BAL @ TB | 2026-05-18T22:40:00Z | Tropicana Field | Scheduled | Trevor Rogers vs Shane McClanahan |
| 823465 | CIN @ PHI | 2026-05-18T22:40:00Z | Citizens Bank Park | Scheduled | Nick Lodolo vs Andrew Painter |
| 823867 | ATL @ MIA | 2026-05-18T22:40:00Z | loanDepot park | Scheduled | JR Ritchie vs Max Meyer |
| 822734 | NYM @ WSH | 2026-05-18T22:45:00Z | Nationals Park | Scheduled | Christian Scott vs Jake Irvin |
| 823549 | TOR @ NYY | 2026-05-18T23:05:00Z | Yankee Stadium | Scheduled | Patrick Corbin vs Ryan Weathers |
| 824114 | BOS @ KC | 2026-05-18T23:10:00Z | Kauffman Stadium | Scheduled | Sonny Gray vs Seth Lugo |
| 823705 | HOU @ MIN | 2026-05-18T23:40:00Z | Target Field | Scheduled | Tatsuya Imai vs Kendry Rojas |
| 824680 | MIL @ CHC | 2026-05-18T23:40:00Z | Wrigley Field | Scheduled | Brandon Sproat vs Shota Imanaga |
| 824357 | TEX @ COL | 2026-05-19T00:40:00Z | Coors Field | Scheduled | MacKenzie Gore vs Jose Quintana |
| 824035 | ATH @ LAA | 2026-05-19T01:38:00Z | Angel Stadium | Scheduled | J.T. Ginn vs Walbert Urena |
| 823301 | LAD @ SD | 2026-05-19T01:40:00Z | Petco Park | Scheduled | Yoshinobu Yamamoto vs Michael King |
| 825087 | SF @ AZ | 2026-05-19T01:40:00Z | Chase Field | Scheduled | Robbie Ray vs Zac Gallen |
| 823137 | CWS @ SEA | 2026-05-19T01:40:00Z | T-Mobile Park | Scheduled | Noah Schultz vs Bryan Woo |

MLB.com starting lineups page showed `TBD` for both teams in the checked games. Treat every player-specific prop as blocked from official `BET` until confirmed lineups are captured.

## Operating Rule For Today

Research wide. Verify hard. Bet narrow. Grade clean.

No `BET` unless:
- game exists and has not started
- starting pitchers confirmed near lock
- target player confirmed in lineup and lineup spot/PA volume acceptable
- current prop or side price verified with timestamp and book/source
- fair probability and implied/no-vig probability calculated
- edge clears threshold
- weather/roof and park context captured where material
- Outlier/market context captured where relevant
- risk flags and kill switch are explicit

If any of those are missing, use `WATCHLIST`, `LEAN`, `CONDITIONAL`, `PASS`, or `AVOID`.

## Source Checklist

### MLB.com / Stats API

Capture:
- gamePk
- game status: PREGAME / LIVE / FINAL / POSTPONED / DELAYED
- first pitch time
- venue
- probable or confirmed starters
- official lineups when posted
- scratches and lineup changes
- source timestamp and URL

Required before final card:
- recheck every game near first pitch
- exclude games that start during research
- freeze unresolved plays for started games as `NO_ACTION` or `POSTGAME_ONLY` status, not EchoIQ official labels

### Outlier

Capture manually from authenticated browser if available:
- HR props, TB props, Hits props for every eligible game
- book, line, current odds, best price, timestamp
- visible EV flags, line movement, sportsbook disagreement
- matchup cards, trend cards, player/team insights
- BPP/park/weather indicators shown inside Outlier, if any
- screenshots or copied rows with source timestamp

Rules:
- do not blindly trust Outlier EV tags
- verify pitcher identity, lineup status, and weather independently
- if Outlier is inaccessible, mark `OUTLIER_UNAVAILABLE` and do not use `BET`

### Ballpark Pal

Capture:
- game run environment
- HR environment
- weather factor
- player ratings where visible
- Lucky/Unlucky, Risers/Fallers, streaks
- projected run totals
- timestamp and source URL/screenshot reference

Priority parks today:
- Coors Field, Wrigley Field, Yankee Stadium, Citizens Bank Park, Nationals Park, Comerica Park, Kauffman Stadium, Target Field, Angel Stadium, Petco Park, T-Mobile Park, Chase Field
- Tropicana and loanDepot still need roof/dome context, but open-air weather volatility is lower

### Weather / Roof

Capture:
- temperature
- wind speed/direction
- humidity
- precipitation/delay risk
- roof open/closed/unknown
- timestamp and source

Kill or downgrade:
- wind-in for HR
- rain/delay risk for timing and relisted odds
- roof unknown for retractable/dome-sensitive parks
- material weather shift after price capture

### Baseball Savant / FanGraphs

Deep pull only for finalists, traps, and conflicts:
- pitcher pitch mix, velocity, movement, whiff, CSW, xwOBA allowed
- hitter pitch-type xwOBA/whiff and handedness splits
- zone/hot-cold data only if actually retrieved
- recent SP form and pitch count
- bullpen usage and leverage availability where it changes prop outlook

If not pulled, tag claims as `HIGH_CONF_INFERENCE`, `LOW_CONF_INFERENCE`, or `UNSUPPORTED`; do not state them as verified current facts.

### Odds Sources / Sportsbooks

Capture:
- book
- market
- line
- current American odds
- best available price
- opening/current if visible
- timestamp
- paired under/other side when available

Calculations:
- decimal odds
- implied probability
- no-vig probability
- fair probability
- edge
- EV
- break-even price

No verified current odds means no `BET`.

## Recommended Today Sequence

1. Create or prepare May 18 slate workspace only if Christian wants daily slate artifacts:
   `python3 echoiq_v3/scripts/create_slate.py 2026-05-18 --dry-run`
2. Capture official schedule/starters and save source references.
3. Open MLB.com starting lineups; mark every team as `TBD` until posted.
4. Build a candidate watchlist only, using prior framework and broad matchup hypotheses.
5. Pull Outlier HR/TB/Hits props and current prices for candidates and all visible games.
6. Pull Ballpark Pal and weather/roof snapshots.
7. Recheck MLB lineups and starters near each first pitch.
8. Run fair-probability and EV only where price and gates are current.
9. Promote only rows with all gates passed.
10. Preserve unresolved gaps.

## Expected Outputs

Minimum:
- source capture template filled
- prediction gate CSV filled with watchlist/candidate rows
- source gaps clearly marked

If full slate folder is created later:
- `03_verification/source_compliance.csv`
- `03_verification/verification_board.csv`
- `03_verification/pass_avoid.csv`
- `04_final_card/watchlist.csv`
- `04_final_card/conditional_card.csv`
- `04_final_card/official_card.csv` only if real `BET` rows clear
- `logs/source_log.md`
- `logs/unresolved_gaps.md`

## Current May 18 Gate State

| Gate | State | Impact |
|---|---|---|
| MLB schedule | Verified | Games exist and are pregame at lookup time |
| Probable starters | Verified from MLB sources, recheck required | Good enough for morning research; not final lock |
| Lineups | Not verified, MLB.com `TBD` | Blocks all player-prop `BET` labels |
| Current odds/prices | Not captured | Blocks all `BET` labels |
| Outlier | Not captured in repo | Blocks Outlier-driven edge claims |
| Ballpark Pal | Not captured in repo | Blocks BPP-driven environment/regression claims |
| Weather/roof | Not captured in repo | Blocks weather-sensitive HR/TB plays |
| Savant/FanGraphs | Not pulled for candidates | Deep pitch/zone claims must be inference |
| Injury/scratch news | Not captured | Requires manual/team/beat check |

## Manual Inputs Needed From Christian

- Authenticated Outlier access or copied Outlier rows/screenshots.
- Ballpark Pal screenshots or copied game/player tables.
- Sportsbook/player-prop prices from available books.
- Any local preference on whether to create ignored `slates/2026-05-18/` artifacts now.
- Confirmation if paid provider/API calls are allowed later.
