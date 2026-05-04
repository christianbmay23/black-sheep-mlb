# EchoIQ MLB Cold-Hard Slate Audit
Date: Friday, May 1, 2026
Audit timestamp: 2026-05-01T20:52:22Z

## A. What Was Completed
- Refreshed the MLB Stats API schedule/live-feed layer for all 15 games.
- Resolved lineup status: 11 fully official, 1 partial official, 3 projected fallback.
- Built player-level hitter rows: 270.
- Built starting-pitcher rows: 30.
- Added public Baseball Savant expected/statcast and pitch-type context where available.
- Computed bullpen usage/fatigue from prior MLB boxscore feeds.
- Computed heuristic HR/TB fair probabilities through the existing repo prop model.

## B. What Remains Unavailable
- Full injury/scratch feed was not ingested from an official injury source; no absences were inferred.
- FanGraphs-only fields such as FIP, xFIP, SIERA, wRC+, and handedness splits remain unavailable.
- First-five lines, team totals, pitcher props, hit props, and opening odds remain unavailable unless already present in the prior artifact.
- BvP was not used in the model because the available source path is not point-in-time safe; rows retain this as a documented gap.
- Bat speed and squared-up rate were not available from the selected public Savant CSV endpoints.

## C. Data Integrity Dashboard
| Game | Lineup | Starter | Weather | Odds | Bullpen | Statcast | BvP | Prop | Grade | Cap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AZ@CHC | official_mlb_schedule | mlb_probable_current | available | existing_timestamped_artifact | computed | available_public_savant | unavailable_not_used | partial | Green | 7.5 |
| TEX@DET | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| CIN@PIT | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Red | 5.5 |
| MIL@WSH | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| BAL@NYY | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.0 |
| HOU@BOS | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| SF@TB | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| PHI@MIA | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| TOR@MIN | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| LAD@STL | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| ATL@COL | official_mlb_schedule | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| NYM@LAA | projected_existing_artifact | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| CLE@ATH | projected_existing_artifact | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| CWS@SD | projected_existing_artifact | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |
| KC@SEA | partial_official_with_projected_fallback | mlb_probable_current | available | rotowire_public_refreshed | computed | available_public_savant | unavailable_not_used | partial | Yellow | 6.5 |

## D. Final Game Predictions
| Game | Projected Winner | Projected Score | Away Win | Home Win | Market | Action |
| --- | --- | --- | --- | --- | --- | --- |
| AZ@CHC | CHC | AZ 3 - CHC 4 | 43.6% | 56.4% | AZ +125 / CHC -145 | PASS/no BET |
| TEX@DET | DET | TEX 4 - DET 4 | 48.7% | 51.3% | TEX -102 / DET -116 | PASS/no BET |
| CIN@PIT | PIT | CIN 4 - PIT 4 | 42.9% | 57.1% | CIN +115 / PIT -135 | PASS/no BET |
| MIL@WSH | MIL | MIL 4 - WSH 4 | 59.9% | 40.1% | MIL -160 / WSH +135 | PASS/no BET |
| BAL@NYY | NYY | BAL 4 - NYY 5 | 35.8% | 64.2% | BAL +155 / NYY -185 | PASS/no BET |
| HOU@BOS | BOS | HOU 5 - BOS 5 | 46.6% | 53.4% | HOU +102 / BOS -122 | PASS/no BET |
| SF@TB | TB | SF 3 - TB 4 | 43.7% | 56.3% | SF +120 / TB -145 | PASS/no BET |
| PHI@MIA | PHI | PHI 4 - MIA 4 | 52.6% | 47.4% | PHI -115 / MIA -105 | PASS/no BET |
| TOR@MIN | TOR | TOR 4 - MIN 4 | 51.8% | 48.2% | TOR -109 / MIN -110 | PASS/no BET |
| LAD@STL | LAD | LAD 5 - STL 4 | 62.5% | 37.5% | LAD -178 / STL +150 | PASS/no BET |
| ATL@COL | ATL | ATL 6 - COL 5 | 64.4% | 35.6% | ATL -185 / COL +155 | PASS/no BET |
| NYM@LAA | LAA | NYM 5 - LAA 5 | 49.8% | 50.2% | NYM -125 / LAA +105 | PASS/no BET |
| CLE@ATH | CLE | CLE 5 - ATH 5 | 50.7% | 49.3% | CLE -115 / ATH -105 | PASS/no BET |
| CWS@SD | SD | CWS 4 - SD 4 | 43.5% | 56.5% | CWS +125 / SD -150 | PASS/no BET |
| KC@SEA | SEA | KC 3 - SEA 4 | 41.8% | 58.2% | KC +125 / SEA -148 | PASS/no BET |

## E. Final HR Board
| Rank | Player | Game | HR Prob | Odds | Edge | Label | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Max Muncy | LAD@STL | 18.2% | +390 | -2.17 | PASS | No clear model edge at the available price. |
| 2 | Yordan Alvarez | HOU@BOS | 15.7% | +370 | -5.59 | PASS | Confidence cap prevents a BET label. |
| 3 | Aaron Judge | BAL@NYY | 15.1% | +217 | -16.41 | PASS | No clear model edge at the available price. |
| 4 | Kyle Schwarber | PHI@MIA | 14.8% | +270 | -12.25 | PASS | No clear model edge at the available price. |
| 5 | Matt Olson | ATL@COL | 14.7% | +272 | -12.15 | PASS | No clear model edge at the available price. |
| 6 | Ben Rice | BAL@NYY | 14.7% | +304 | -10.07 | PASS | No clear model edge at the available price. |
| 7 | Oneil Cruz | CIN@PIT | 14.1% | +390 | -6.32 | PASS | No clear model edge at the available price. |
| 8 | James Wood | MIL@WSH | 13.8% |  |  | WATCHLIST | Missing current/timestamped prop price; cannot be a bet. |
| 9 | Shohei Ohtani | LAD@STL | 13.6% | +306 | -11.07 | PASS | No clear model edge at the available price. |
| 10 | Hunter Goodman | ATL@COL | 12.8% | +342 | -9.79 | PASS | No clear model edge at the available price. |

## F. Final Total Bases Board
| Rank | Player | Game | TB Prob | Odds | Edge | Label | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Max Muncy | LAD@STL | 55.0% | +136 | 12.63 | LEAN | Positive edge, but final card requires late price and lineup recheck. |
| 2 | Alex Bregman | AZ@CHC | 28.5% | +525 | 12.48 | LEAN | Confidence cap prevents a BET label. |
| 3 | Carson Kelly | AZ@CHC | 32.5% | +330 | 9.24 | LEAN | Confidence cap prevents a BET label. |
| 4 | James Wood | MIL@WSH | 49.0% | +150 | 8.97 | LEAN | Positive edge, but final card requires late price and lineup recheck. |
| 5 | Ben Rice | BAL@NYY | 54.7% | +115 | 8.2 | LEAN | Positive edge, but final card requires late price and lineup recheck. |
| 6 | Kyle Schwarber | PHI@MIA | 49.4% | +132 | 6.26 | LEAN | Positive edge, but final card requires late price and lineup recheck. |
| 7 | JJ Bleday | CIN@PIT | 41.2% | +184 | 6.01 | LEAN | Positive edge, but final card requires late price and lineup recheck. |
| 8 | Riley Greene | TEX@DET | 42.2% | +170 | 5.13 | LEAN | Positive edge, but final card requires late price and lineup recheck. |
| 9 | Spencer Torkelson | TEX@DET | 39.7% | +170 | 2.63 | LEAN | Small positive edge; not enough to clear final-card threshold. |
| 10 | Cole Young | KC@SEA | 36.4% | +195 | 2.52 | LEAN | Small positive edge; not enough to clear final-card threshold. |
| 11 | Josh Jung | TEX@DET | 46.2% | +128 | 2.34 | LEAN | Small positive edge; not enough to clear final-card threshold. |
| 12 | Aaron Judge | BAL@NYY | 54.5% | -110 | 2.1 | LEAN | Small positive edge; not enough to clear final-card threshold. |
| 13 | Yordan Alvarez | HOU@BOS | 55.0% | -115 | 1.51 | PASS | Confidence cap prevents a BET label. |
| 14 | Pete Crow-Armstrong | AZ@CHC | 27.4% | +285 | 1.41 | PASS | Confidence cap prevents a BET label. |
| 15 | Ryan Vilade | SF@TB | 33.4% | +200 | 0.08 | PASS | No clear model edge at the available price. |
| 16 | Liam Hicks | PHI@MIA | 38.8% | +155 | -0.41 | PASS | No clear model edge at the available price. |
| 17 | J.P. Crawford | KC@SEA | 30.4% | +222 | -0.61 | PASS | No clear model edge at the available price. |
| 18 | Brandon Marsh | PHI@MIA | 36.6% | +168 | -0.71 | PASS | No clear model edge at the available price. |
| 19 | James Outman | TOR@MIN | 25.6% | +278 | -0.81 | PASS | No clear model edge at the available price. |
| 20 | Elly De La Cruz | CIN@PIT | 45.9% | +110 | -1.69 | PASS | No clear model edge at the available price. |

## G. Batter-vs-Pitcher and Historical Matchup Notes
BvP remains documented but not model-driving. The available MLB Stats `vsPlayer` path is useful for exploratory current-day checks, but this run did not use it because point-in-time safety and sample-size reliability are not sufficient for a BET gate.

## H. Pitch-Type Matchup Findings
- Ildemaro Vargas (AZ@CHC): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.483, est_SLG 0.633, pitcher allowed est_wOBA 0.362; Split-Finger: batter est_wOBA 0.209, est_SLG 0.250, pitcher allowed est_wOBA 0.259
- Moisés Ballesteros (AZ@CHC): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.495, est_SLG 0.773, pitcher allowed est_wOBA 0.362; Slider: batter est_wOBA 0.277, est_SLG 0.231, pitcher allowed est_wOBA 0.283
- Seiya Suzuki (AZ@CHC): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.341, est_SLG 0.436, pitcher allowed est_wOBA 0.362; Slider: batter est_wOBA 0.509, est_SLG 0.759, pitcher allowed est_wOBA 0.283
- Josh Jung (TEX@DET): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.365, est_SLG 0.442, pitcher allowed est_wOBA 0.352; Slider: batter est_wOBA 0.415, est_SLG 0.569, pitcher allowed est_wOBA 0.385
- Alejandro Osuna (TEX@DET): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.579, est_SLG 0.403, pitcher allowed est_wOBA 0.352; Slider: batter est_wOBA 0.459, est_SLG 0.696, pitcher allowed est_wOBA 0.385
- Gleyber Torres (TEX@DET): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.402, est_SLG 0.484, pitcher allowed est_wOBA 0.363; Curveball: batter est_wOBA 0.324, est_SLG 0.377, pitcher allowed est_wOBA 0.318
- Kevin McGonigle (TEX@DET): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.515, est_SLG 0.745, pitcher allowed est_wOBA 0.363; Curveball: batter est_wOBA 0.204, est_SLG 0.285, pitcher allowed est_wOBA 0.318
- Dillon Dingler (TEX@DET): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.608, est_SLG 1.001, pitcher allowed est_wOBA 0.363; Curveball: batter est_wOBA 0.182, est_SLG 0.223, pitcher allowed est_wOBA 0.318
- Riley Greene (TEX@DET): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.419, est_SLG 0.549, pitcher allowed est_wOBA 0.363; Curveball: batter est_wOBA 0.571, est_SLG 1.024, pitcher allowed est_wOBA 0.318
- Spencer Torkelson (TEX@DET): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.557, est_SLG 0.877, pitcher allowed est_wOBA 0.363; Curveball: batter est_wOBA 0.129, est_SLG 0.150, pitcher allowed est_wOBA 0.318
- Hao-Yu  Lee (TEX@DET): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.580, est_SLG 0.989, pitcher allowed est_wOBA 0.363; Curveball: batter split unavailable
- Nathaniel Lowe (CIN@PIT): favorable vs main pitch mix; 4-Seam Fastball: batter est_wOBA 0.337, est_SLG 0.295, pitcher allowed est_wOBA 0.354; Sweeper: batter est_wOBA 0.700, est_SLG unavailable, pitcher allowed est_wOBA 0.246

## I. Team Form / Injury / Bullpen Findings
- Bullpen usage was computed from prior MLB boxscore feeds and included as a fatigue score in the game and player rows.
- Injury/scratch context remains a gap because no official injury feed was integrated; official lineups are used where available instead of inferring scratches.

## J. Final Betting Card
BET rows surviving all gates: 0.
No BET survived. The available data supports watchlist/lean/lottery rows only.

## K. Watchlist and Conditional Plays
- HR and TB rows with positive model edges are retained in the enriched boards, but no row should be treated as a final bet without late price/lineup/weather confirmation.

## L. Avoid List
- HR rows with missing price, missing pitch-type support, or games already started are capped at WATCHLIST/LOTTERY/PASS.
- Full-game sides remain prediction-only because this run did not refresh paid sportsbook odds, first-five lines, or team totals.

## M. Differences From Prior GPT / Claude / Codex Reports
- Prior claim: GPT/Echo report upgraded Brewers ML, Astros ML, Athletics ML, Liberatore K under, and Olson TB as playable/conditional. New evidence: More MLB lineups are official and bullpen/Statcast layers are now present, but F5/team-total/pitcher-prop markets and full injury data remain unavailable; final-card gate remains closed. Decision: downgraded_to_watchlist_or_pass.
- Prior claim: PDF report recommended ARI/CHC under 7.5 and Misiorowski K over. New evidence: This builder does not ingest current pitcher strikeout markets or in-game total changes; AZ@CHC was already in progress during the run. Decision: not_final_card_eligible.
- Prior claim: Existing Codex artifact said HR fair probabilities were unavailable. New evidence: HR/TB fair probabilities are now generated for lineup hitters using existing prop_model plus public Savant/MLB inputs, but these are heuristic and still capped by price/lineup/weather gaps. Decision: upgraded_to_model_watchlist_not_BET.

## N. Model Integration Notes
- Permanent integration should add typed `hitter_player_table`, `starting_pitcher_table`, `source_log`, and `unresolved_gaps` schemas under `canvases/exports/pipeline/`.
- The prop model already accepts most Statcast, recent-form, weather, bullpen, and starter-form inputs; the missing permanent layer is a reusable feature registry/fetcher with strict source provenance.
- Future strict cards should add official injury ingestion, F5/team-total/pitcher-prop ingestion, and backtests for HR/TB fair probability calibration before allowing BET labels.

## Validation Summary
- Game predictions rows: 15.
- Hitter rows: 270.
- Starting pitcher rows: 30.
- HR board rows: 270.
- Total bases rows: 270.
- Final card rows: 0.
- Unresolved gap rows: 316.
