# May 14, 2026 EchoIQ v3 Postgame Dry-Run Audit

Mode: postgame grading/backtest only. No new picks were created, no pregame labels were changed, no paid APIs were used, and no rows were promoted with hindsight.

Official-card status: `grade_slate.py` read zero official BET rows, zero cleared conditional rows, zero lottery rows, zero watchlist rows, and zero pass/avoid rows from the final-card buckets. Official EchoIQ ROI is therefore not defined for this dry run.

Source conflict note: the prompt context said Braves 4, Cubs 1 and Red Sox 3, Phillies 1. Official May 14 MLB data and secondary indexed reports show Cubs 2, Braves 0 and Phillies 3, Red Sox 1. The 4-1 Braves and 3-1 Red Sox scores match May 13 public threads/reports, so this audit grades May 14 from verified May 14 sources.

## Sources Used

- MLB Stats API schedule for 2026-05-14: https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=2026-05-14&hydrate=team,linescore
- MLB Stats API boxscores: gamePk `824926` Cubs @ Braves, `824602` Royals @ White Sox, `823950` Giants @ Dodgers, `824762` Phillies @ Red Sox.
- MLB.com game story/video index for Cubs @ Braves: https://www.mlb.com/video/game/824926 and https://www.mlb.com/stories/game/824926/
- CBS/AP recap corroborating Cubs 2, Braves 0: https://www.cbsnews.com/chicago/news/chicago-cubs-vs-atlanta-braves-game-recap-may-14-2026/
- Phillies Nation recap corroborating Phillies 3, Red Sox 1 and Schwarber HR: https://philliesnation.com/2026/05/kyle-schwarber-trea-turner-help-phillies-beat-red-sox/
- Yahoo/SI weather-delay reporting for Phillies @ Red Sox: https://sports.yahoo.com/articles/phillies-vs-red-sox-game-215831975.html and https://www.si.com/mlb/red-sox/onsi/boston-red-sox-vs-philadelphia-phillies-game-delayed-on-thursday-pat3

## A. Slate Outcome Summary

| Game | Final Score | Pregame Status | EchoIQ Candidate Exposure | Process Grade |
| --- | --- | --- | --- | --- |
| Cubs @ Braves | Cubs 2, Braves 0 | Pregame; eligible=Yes; confirmed lineups/starters; no fair-price gate | Braves ML lean plus Braves HR/TB cluster | B-: no-bet gate protected, but candidate direction was wrong |
| Royals @ White Sox | White Sox 6, Royals 2 | Pregame; eligible=Yes; confirmed lineups/starters; total split 7.5/8.0 | Royals ML lean, Witt HR/HIT/TB, Vinnie TB, under conditional | B: price/fair-probability gates protected against side/prop misses |
| Giants @ Dodgers | Dodgers 5, Giants 2 | Pregame; eligible=Conditional; Dodgers lineup confirmed, Giants lineup missing | Dodgers ML lean plus Dodgers HR/TB watchlist | B+: Dodgers side hit, but lineup/fair-price gates correctly prevented official exposure |
| Phillies @ Red Sox | Phillies 3, Red Sox 1 | Pregame delayed; eligible=No until restart, relisted odds, lineup recheck | Avoid side/total plus conditional Phillies/Boston props | A-: delay gate correctly capped a noisy game even though several props hit |

## B. Candidate Grading

| Candidate | Pregame Label | Market | Pregame Odds | Framework Edge if available | Actual Result | Outcome Grade | Process Grade | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bobby Witt Jr. | LEAN | HR | +450 at Covers; +410 FanDuel | NA | LOSS: Bobby Witt Jr.: 1-for-3, BB, 1 TB, 0 HR. White Sox beat Royals 6-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Bobby Witt Jr. HR |
| Matt Olson | LEAN | HR | +320 to +350 | NA | LOSS: Matt Olson: 1-for-4, 1 TB, 0 HR. Cubs beat Braves 2-0. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Matt Olson HR |
| Drake Baldwin | WATCHLIST | HR | +470 | NA | LOSS: Drake Baldwin: 1-for-4, 1 TB, 0 HR. Cubs beat Braves 2-0. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Drake Baldwin HR |
| Michael Harris II | WATCHLIST | HR | +430 | NA | LOSS: Michael Harris II: 1-for-4, 1 TB, 0 HR. Cubs beat Braves 2-0. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Michael Harris II HR |
| Max Muncy | WATCHLIST | HR | +419 | NA | LOSS: Max Muncy: 0-for-3, BB, 0 TB, 0 HR. Dodgers beat Giants 5-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Max Muncy HR |
| Will Smith | WATCHLIST | HR | +520 | NA | HIT: Will Smith: 1-for-3, HR, 1 RBI, BB, 4 TB. Dodgers beat Giants 5-2. Dry-run candidate only; no official BET/stake was created. | Hit as candidate; no official ROI | B+: good research signal, but gates were incomplete | Will Smith HR |
| Freddie Freeman | WATCHLIST | HR | +589 | NA | LOSS: Freddie Freeman: 0-for-4, 0 TB, 0 HR. Dodgers beat Giants 5-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Freddie Freeman HR |
| Kyle Tucker | WATCHLIST | HR | +590 to +610 | NA | LOSS: Kyle Tucker: 0-for-4, 0 TB, 0 HR. Dodgers beat Giants 5-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Kyle Tucker HR |
| Kyle Schwarber | CONDITIONAL | HR | +390 | NA | HIT: Kyle Schwarber: 1-for-5, HR, 2 RBI, 4 TB. Phillies beat Red Sox 3-1 after delayed-start weather gate. Dry-run candidate only; no official BET/stake was created. | Hit as candidate; no official ROI | A-: weather/relisted-market gate stayed open | Delay resolution; relisted odds; lineup recheck; fair price |
| Bryce Harper | CONDITIONAL | HR | +590 to +630 | NA | LOSS: Bryce Harper: 1-for-4, BB, 1 TB, 0 HR. Phillies beat Red Sox 3-1 after delayed-start weather gate. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Delay resolution; relisted odds; lineup recheck; fair price |
| Bobby Witt Jr. | LEAN | TB | -105 | -10.84% | LOSS: Bobby Witt Jr.: 1 TB; Over 1.5 TB missed. White Sox beat Royals 6-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Bobby Witt Jr. TB |
| Bobby Witt Jr. | LEAN | HIT | -295 | -10.56% | HIT: Bobby Witt Jr.: 1 hit; Over 0.5 hit cashed, but v1 fair probability showed negative edge at -295. Dry-run candidate only; no official BET/stake was created. | Hit as candidate; no official ROI | A: v1 price guard correctly blocked negative edge | Bobby Witt Jr. HIT |
| Freddie Freeman | WATCHLIST | TB | +125 | -6.92% | LOSS: Freddie Freeman: 0 TB; Over 1.5 TB missed. Dodgers beat Giants 5-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Freddie Freeman TB |
| Kyle Tucker | WATCHLIST | TB | +170 | 0.49% | LOSS: Kyle Tucker: 0 TB; Over 1.5 TB missed despite tiny positive v1 edge. Dodgers beat Giants 5-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Kyle Tucker TB |
| Matt Olson | WATCHLIST | TB | +165 to +190 | NA | LOSS: Matt Olson: 1 TB; Over 1.5 TB missed. Cubs beat Braves 2-0. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Matt Olson TB |
| Austin Riley | WATCHLIST | TB | +139 | -4.79% | LOSS: Austin Riley: 1 TB; Over 1.5 TB missed. Cubs beat Braves 2-0. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Austin Riley TB |
| Vinnie Pasquantino | WATCHLIST | TB | +181 | 0.51% | LOSS: Vinnie Pasquantino: 0-for-4, 0 TB; Over 1.5 TB missed. White Sox beat Royals 6-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Vinnie Pasquantino TB |
| Bryce Harper | CONDITIONAL | TB | +145 | -10.64% | LOSS: Bryce Harper: 1 TB; Over 1.5 TB missed after weather/delay gate. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Delay resolution; lineup recheck; fair probability |
| Kyle Schwarber | CONDITIONAL | TB | +165 | -5.86% | HIT: Kyle Schwarber: HR, 4 TB; Over 1.5 TB hit, but pregame delay/relisted-odds gate remained open. Dry-run candidate only; no official BET/stake was created. | Hit as candidate; no official ROI | A: v1 price guard correctly blocked negative edge | Delay resolution; relisted odds; fair probability |
| Wilyer Abreu | CONDITIONAL | HIT | -168 / +181 | NA | HIT: Wilyer Abreu: 2-for-4, 2 TB; Over 0.5 hit and Over 1.5 TB both hit, but delay/lineup/fair-probability gates stayed open. Dry-run candidate only; no official BET/stake was created. | Hit as candidate; no official ROI | A-: weather/relisted-market gate stayed open | Delay resolution; lineup recheck; fair probability |
| Braves | LEAN | ML | ATL -188 | NA | LOSS: Atlanta ML lost: Cubs beat Braves 2-0. Official May 14 sources conflict with the prompt context, which appears to describe May 13. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Braves |
| Royals | LEAN | ML | KC -135 | NA | LOSS: Kansas City ML lost: White Sox beat Royals 6-2. Dry-run candidate only; no official BET/stake was created. | Failed candidate; gate protected bankroll | A: no-bet discipline protected downside | Royals |
| Royals @ White Sox Under | CONDITIONAL | TOTAL | -120 / -114 | NA | PUSH/SPLIT: Actual total was 8. Under 8.0 pushed; Under 7.5 lost. Split line made the closing-number gate material. Dry-run candidate only; no official BET/stake was created. | Line-dependent push/loss; no official action | B: candidate quality mixed; final gates mattered | Closing total; fair price |
| Dodgers | LEAN | ML | LAD -172 | NA | HIT: Dodgers ML hit: Dodgers beat Giants 5-2. Still no official ROI because Giants lineup/fair-price gates were not cleared pregame. Dry-run candidate only; no official BET/stake was created. | Hit as candidate; no official ROI | B+: good research signal, but gates were incomplete | Dodgers |
| Phillies @ Red Sox Side/Total | AVOID | TOTAL | PHI +110 / BOS -116; total 7.0 | NA | NO ACTION: Avoid row was not a bet candidate. Final: Phillies beat Red Sox 3-1; total 4. Delay/relisted-market gate correctly blocked official exposure. Dry-run candidate only; no official BET/stake was created. | Avoid/no-action; process-only grade | A: avoid gate used correctly | Phillies @ Red Sox Side/Total |

## C. HIT/TB Probability Framework Review

| Player | Market | Fair Probability | Implied Probability | Edge % | Actual Result | Framework Read | Lesson |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| Bobby Witt Jr. | TB | 40.37% | 51.22% | -10.84% | LOSS: Bobby Witt Jr.: 1 TB; Over 1.5 TB missed. White Sox beat Royals 6-2. Dry-run candidate only; no official BET/stake was created. | Negative edge and actual miss; no-bet was correct | Negative-edge miss confirms price discipline. |
| Bobby Witt Jr. | HIT | 64.12% | 74.68% | -10.56% | HIT: Bobby Witt Jr.: 1 hit; Over 0.5 hit cashed, but v1 fair probability showed negative edge at -295. Dry-run candidate only; no official BET/stake was created. | Negative edge; no-bet was correct even if actual result hit | A hit can still be a bad price; keep price discipline. |
| Freddie Freeman | TB | 37.52% | 44.44% | -6.92% | LOSS: Freddie Freeman: 0 TB; Over 1.5 TB missed. Dodgers beat Giants 5-2. Dry-run candidate only; no official BET/stake was created. | Negative edge and actual miss; no-bet was correct | Negative-edge miss confirms price discipline. |
| Kyle Tucker | TB | 37.52% | 37.04% | 0.49% | LOSS: Kyle Tucker: 0 TB; Over 1.5 TB missed despite tiny positive v1 edge. Dodgers beat Giants 5-2. Dry-run candidate only; no official BET/stake was created. | Tiny positive edge below threshold; no promotion was correct | Sub-threshold positive edges are not actionable enough. |
| Matt Olson | TB | 34.68% | NA | NA | LOSS: Matt Olson: 1 TB; Over 1.5 TB missed. Cubs beat Braves 2-0. Dry-run candidate only; no official BET/stake was created. | No official edge because odds were ambiguous; cap stayed CONDITIONAL | Ambiguous odds should keep row out of exact edge math. |
| Austin Riley | TB | 37.05% | 41.84% | -4.79% | LOSS: Austin Riley: 1 TB; Over 1.5 TB missed. Cubs beat Braves 2-0. Dry-run candidate only; no official BET/stake was created. | Negative edge and actual miss; no-bet was correct | Negative-edge miss confirms price discipline. |
| Vinnie Pasquantino | TB | 36.10% | 35.59% | 0.51% | LOSS: Vinnie Pasquantino: 0-for-4, 0 TB; Over 1.5 TB missed. White Sox beat Royals 6-2. Dry-run candidate only; no official BET/stake was created. | Tiny positive edge below threshold; no promotion was correct | Sub-threshold positive edges are not actionable enough. |
| Bryce Harper | TB | 30.17% | 40.82% | -10.64% | LOSS: Bryce Harper: 1 TB; Over 1.5 TB missed after weather/delay gate. Dry-run candidate only; no official BET/stake was created. | Negative edge and actual miss; no-bet was correct | Negative-edge miss confirms price discipline. |
| Kyle Schwarber | TB | 31.87% | 37.74% | -5.86% | HIT: Kyle Schwarber: HR, 4 TB; Over 1.5 TB hit, but pregame delay/relisted-odds gate remained open. Dry-run candidate only; no official BET/stake was created. | Negative edge; no-bet was correct even if actual result hit | A hit can still be a bad price; keep price discipline. |
| Wilyer Abreu | HIT | 51.85% | NA | NA | HIT: Wilyer Abreu: 2-for-4, 2 TB; Over 0.5 hit and Over 1.5 TB both hit, but delay/lineup/fair-probability gates stayed open. Dry-run candidate only; no official BET/stake was created. | No official edge because odds were ambiguous; cap stayed CONDITIONAL | Ambiguous odds should keep row out of exact edge math. |

## D. Game-Market Review

| Market | Pregame Label | Actual Result | Did Gate Discipline Help? | Lesson |
| --- | --- | --- | --- | --- |
| Braves ML lean | LEAN | Loss: Cubs beat Braves 2-0 | Yes | The no-BET posture prevented a full side loss; Braves offense was shut out despite pregame clean setup. |
| Royals ML lean | LEAN | Loss: White Sox beat Royals 6-2 | Yes | Fair-price and bullpen gates mattered; the side thesis leaned too much on Bubic/Witt support. |
| Royals/White Sox under conditional | CONDITIONAL | Actual total 8: Under 8.0 push, Under 7.5 loss | Yes | Book-specific closing total was not a cosmetic gate; it determined push versus loss. |
| Dodgers ML watchlist/lean | LEAN | Hit: Dodgers beat Giants 5-2 | Mixed | The side was directionally right, but Giants lineup and fair-price gaps still made it a dry-run candidate only. |
| Phillies/Red Sox avoid | AVOID | Final Phillies 3, Red Sox 1; total 4 | Yes | Delay and relisted-odds gates were properly respected; do not backfill a winning under/PHI result into a pregame bet. |

## E. External-Public Prediction Review

External rows are graded for external accuracy only and do not count toward EchoIQ ROI.

| Source | Game | Market | External Angle | Postgame Result | Notes |
| --- | --- | --- | --- | --- | --- |
| Covers | Royals @ White Sox | HR | Featured HR pick | EXTERNAL_LOSS | Bobby Witt Jr. did not homer; 1-for-3, 1 TB. External sanity check only; not EchoIQ ROI. |
| FanDuel Research | Royals @ White Sox | HR | Best HR prop | EXTERNAL_LOSS | Bobby Witt Jr. did not homer; 1-for-3, 1 TB. External matchup-language cross-check only. |
| FanDuel Research | Cubs @ Braves | NRFI | Listed among best NRFI picks | EXTERNAL_HIT | Cubs @ Braves had no first-inning run; external NRFI angle hit. Not EchoIQ ROI. |
| BetMGM model | Royals @ White Sox | ML | Royals win probability 60.3% | EXTERNAL_LOSS | Royals ML lost; White Sox beat Royals 6-2. External model contrast only. |
| Covers user/expert picks | Royals @ White Sox | ML/TOTAL | Multiple public cappers on CHW and Under | EXTERNAL_MIXED | White Sox side hit; Under 8.5 hit and Under 8.0 pushed with final total 8. Public sentiment reference only. |
| Bleacher Nation | Giants @ Dodgers | HR | HR pricing board | INFO_ONLY | Pricing board only. Listed Muncy/Freeman/Tucker HR prices; none of those three homered. Will Smith homered but was not listed in this external row. |

## F. Missed Opportunities

| Candidate | Classification | Why It Was Not Official | Hindsight Read |
| --- | --- | --- | --- |
| Will Smith HR | missing fair probability / missing final gates | No HR fair-probability/edge was loaded and Giants lineup context was incomplete. | Hit with a HR, but this was not promotable from the pregame record. |
| Kyle Schwarber HR | correct no-bet due to missing gates | Rain delay, relisted odds, lineup recheck, and fair price gates were all open. | Hit with a HR; process still says no official bet. |
| Bobby Witt Jr. HIT | good research / bad price | v1 fair probability 64.12% versus implied 74.68% at -295 created a -10.56 point edge. | Hit, but the price guard correctly prevented promotion. |
| Kyle Schwarber TB | correct no-bet due to missing gates | Delay, relisted odds, source-confidence C, and negative v1 edge all blocked promotion. | Hit with 4 TB; still not a clean pregame bet. |
| Wilyer Abreu HIT | stale/missing odds and missing fair probability | Combined hit/TB line was ambiguous and weather/lineup gates were open. | Hit with 2 hits, but could not produce exact edge or stake. |
| Dodgers ML | missing fair probability / lineup gate | Giants lineup and fair price were not cleared pregame. | Side hit, but not enough to rewrite the gate logic. |

## G. False Positives

- Braves ML, Matt Olson HR/TB, Drake Baldwin HR, Michael Harris II HR, and Austin Riley TB all failed. The final-card gate prevented official exposure.
- Royals ML, Bobby Witt Jr. HR/TB, and Vinnie Pasquantino TB failed. The price/fair-probability gates protected the bankroll, while Witt HIT demonstrates that high-floor hit markets still need price discipline.
- Freddie Freeman HR/TB, Kyle Tucker HR/TB, and Max Muncy HR failed. The Dodgers side won, but most Dodgers player props did not.
- v1 showed tiny positive TB edges on Kyle Tucker and Vinnie Pasquantino, and both lost. The below-threshold cap was useful.

## H. Gate Discipline Review

- Did no-BET posture help or hurt? It helped. It avoided losses on Braves ML, Royals ML, most HR rows, most TB rows, and line-dependent Royals/White Sox under exposure. It also left some winners unbet, but those winners were blocked by real pregame gates.
- Which missing gates mattered most? Fair probability/edge, current verified odds, book-specific total, Phillies/Red Sox delay/relisted market, Dodgers/Giants lineup confirmation, and kill-switch/final verification.
- Were open gates correctly used to cap candidates? Yes. Open gates kept all rows out of official BET status, which matched the dry-run risk posture.
- Did probability framework v1 correctly avoid negative-edge prices? Yes. Bobby Witt Jr. HIT and Kyle Schwarber TB both hit, but v1 had negative edges. That is a price discipline win, not a model failure.
- Did any row deserve promotion but was blocked only by missing model infrastructure? No. Will Smith HR and Kyle Schwarber HR are the closest hindsight examples, but each had missing HR fair probability plus other unresolved source/market gates.

## I. Model Lessons

Detailed machine-readable lessons were written to `model_lessons.csv`, and source/process warnings were written to `error_ledger.csv`.

## J. Final Summary

1. Did EchoIQ v3 behave correctly? Yes. The system preserved PASS/no-bet discipline when gates were open and no official BET rows existed.
2. Did any candidate look actionable in hindsight? Will Smith HR, Kyle Schwarber HR/TB, Wilyer Abreu HIT, Bobby Witt HIT, and Dodgers ML hit, but none should be retroactively promoted because required pregame gates were missing or prices were negative/ambiguous.
3. What should change before the next slate? Add HR fair-probability support, require exact book/line snapshots for props and totals, preserve delay/relisted-market checks, and separate official-card grading from candidate-board process grading in tooling.
4. What should not change? Do not loosen BET requirements, do not count external rows as EchoIQ ROI, do not treat estimated/ambiguous odds as exact, and do not override open gates with hindsight.

## Official ROI

No official ROI exists for this dry run. `official_card.csv` was header-only, no stake units were created, and `grade_slate.py` reported zero official actionable rows.
