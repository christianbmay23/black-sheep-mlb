# EchoIQ v3 Source Hierarchy

## Actual results / postgame grading

1. MLB.com Gameday / MLB box score / MLB Film Room
2. Baseball Savant / Statcast / MLB Film Room Statcast pages
3. ESPN box scores
4. Reuters/AP/CBS/team recaps as fallback only

## Pregame verification

1. MLB.com schedule, probable starters, official lineups
2. Team lineup posts / verified beat writers
3. Sportsbook odds pages
4. Baseball Savant / FanGraphs / Statcast pages
5. Ballpark Pal / weather pages
6. HRTargets or similar third-party model sources
7. Public prediction sites as discovery/comparison only

## Source confidence scoring

| Grade | Meaning | Highest allowed label |
|---|---|---|
| A | Lineup, starter, odds, weather, and Statcast all verified | BET |
| B | One minor non-core item missing | BET/LEAN |
| C | Key item missing | LEAN/WATCHLIST |
| D | Conflicting sources | WATCHLIST/PASS |
| F | Unverifiable | PASS |

## Public prediction rule

External/public sources can create candidates, but they cannot create EchoIQ bets by themselves.

External/public rows must remain `EXTERNAL` unless EchoIQ independently verifies and adopts the play.
