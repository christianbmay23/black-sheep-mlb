# EchoIQ MLB Slate Prediction + Betting Intelligence Report
Date: 2026-05-02

## A. Executive Summary
- Best raw winner projection: Baltimore Orioles (Baltimore Orioles@New York Yankees, 0.5)
- Best raw total projection: unavailable
- Best raw total bases candidate: Spencer Torkelson (Texas Rangers@Detroit Tigers, )
- Best raw HR candidate: Matt Olson (Atlanta Braves@Colorado Rockies, 0.12)
- Best raw pitcher prop candidate: Chris Sale (Atlanta Braves@Colorado Rockies, 0.535)
- Best betting value: St. Louis Cardinals (Los Angeles Dodgers@St. Louis Cardinals, 0.512)
- Best side: unavailable
- Best total: unavailable
- Best first-five angle: unavailable
- Best team total: unavailable
- Best batter prop: unavailable
- Best HR lottery: unavailable
- Best pitcher prop: unavailable
- Best likely-but-overpriced play: unavailable
- Best pass/avoid: PASS_UNCERTAINTY where required data is missing
- Highest-risk assumption: missing or stale manual inputs lower confidence and block final-card promotion

## Manual Inputs Used
| input | used |
| --- | --- |
| odds | True |
| props | True |
| weather | True |
| ballpark_pal | True |
| lineups | True |

## Source Log Summary
| data_type | source | confidence | rows_used | notes |
| --- | --- | --- | --- | --- |
| odds | FanDuel Research late odds page; StatMuse consensus cross-check | Medium | 1 | manual/free input rows used |
| odds | Official MLB Stats API late status check; prior report price unavailable live/closed | Low | 3 | manual/free input rows used |
| odds | FanDuel Research Giants/Rays odds; StatMuse cross-check | Medium | 1 | manual/free input rows used |
| odds | FanDuel Research Braves/Rockies odds; BetMGM/StatMuse cross-check | Medium | 1 | manual/free input rows used |
| odds | StatMuse CWS/SD consensus; BetMGM/FanDuel cross-check | Medium | 1 | manual/free input rows used |
| odds | FanDuel Tigers/Rangers odds; StatMuse line conflict noted | Low | 1 | manual/free input rows used |
| odds | FanDuel Tigers/Rangers odds; StatMuse cross-check | Low | 1 | manual/free input rows used |
| odds | Late refresh: no current verified free SEA ML source found | Low | 1 | manual/free input rows used |
| props | FanDuel Research Chris Sale player prop; Covers/EVAnalytics cross-check remained plus-money | High | 1 | manual/free input rows used |
| props | Official MLB Stats API late status check; prior report prop unavailable live/closed | Low | 5 | manual/free input rows used |
| props | FanDuel Research Matt Olson HR prop; BetMGM/PokerStars cross-check varied higher/lower | Medium | 1 | manual/free input rows used |
| props | FanDuel Research Shohei Ohtani HR prop | Medium | 1 | manual/free input rows used |
| props | Late refresh: current free prop price not verified | Low | 3 | manual/free input rows used |
| props | GPT updated PDF | Medium | 3 | manual/free input rows used |
| props | Opus Part 1 + Part 2 | Medium | 1 | manual/free input rows used |
| weather | Opus Part 2 + GPT updated PDF | Low | 1 | manual/free input rows used |
| weather | Opus Part 2 | Low | 6 | manual/free input rows used |
| weather | GPT updated PDF | Low | 1 | manual/free input rows used |
| weather | Parlay Savant MLB weather late refresh | High | 2 | manual/free input rows used |
| weather | Parlay Savant MLB weather late refresh | Medium | 5 | manual/free input rows used |
| ballpark_pal | Opus Part 1 + Part 2; official MLB venue check | Medium | 1 | manual/free input rows used |
| ballpark_pal | Opus Part 2 | Medium | 2 | manual/free input rows used |
| ballpark_pal | Opus Part 2 | Low | 1 | manual/free input rows used |
| ballpark_pal | GPT updated PDF + Opus Part 2 | Medium | 2 | manual/free input rows used |
| ballpark_pal | Opus Part 1 + Part 2 | Low | 1 | manual/free input rows used |
| ballpark_pal | GPT updated PDF + Opus Part 2 | Low | 2 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live | High | 18 | manual/free input rows used |
| lineups | Official MLB Stats API feed/live late refresh | High | 18 | manual/free input rows used |

## Unresolved Gaps
| game | missing_data_type | severity | impact | recommendation |
| --- | --- | --- | --- | --- |
| Baltimore Orioles@New York Yankees | ballpark_pal | low | Ballpark Pal factors unavailable; run/HR environment factors are not adjusted. | Add ballpark_pal.csv when available. |
| Baltimore Orioles@New York Yankees | odds | critical | Final-card betting value cannot be verified without prices. | Add manual odds/prop prices. |
| Toronto Blue Jays@Minnesota Twins | ballpark_pal | low | Ballpark Pal factors unavailable; run/HR environment factors are not adjusted. | Add ballpark_pal.csv when available. |
| Toronto Blue Jays@Minnesota Twins | odds | critical | Final-card betting value cannot be verified without prices. | Add manual odds/prop prices. |
| Arizona Diamondbacks@Chicago Cubs | props | critical | Prop boards cannot populate for this game. | Add verified prop rows. |
| Arizona Diamondbacks@Chicago Cubs | odds | critical | Final-card betting value cannot be verified without prices. | Add manual odds/prop prices. |
| Cleveland Guardians@Athletics | props | critical | Prop boards cannot populate for this game. | Add verified prop rows. |
| Milwaukee Brewers@Washington Nationals | ballpark_pal | low | Ballpark Pal factors unavailable; run/HR environment factors are not adjusted. | Add ballpark_pal.csv when available. |
| Milwaukee Brewers@Washington Nationals | odds | critical | Final-card betting value cannot be verified without prices. | Add manual odds/prop prices. |
| Houston Astros@Boston Red Sox | odds | critical | Final-card betting value cannot be verified without prices. | Add manual odds/prop prices. |
| Philadelphia Phillies@Miami Marlins | ballpark_pal | low | Ballpark Pal factors unavailable; run/HR environment factors are not adjusted. | Add ballpark_pal.csv when available. |
| Philadelphia Phillies@Miami Marlins | props | critical | Prop boards cannot populate for this game. | Add verified prop rows. |
| San Francisco Giants@Tampa Bay Rays | props | critical | Prop boards cannot populate for this game. | Add verified prop rows. |
| Chicago White Sox@San Diego Padres | props | critical | Prop boards cannot populate for this game. | Add verified prop rows. |
| New York Mets@Los Angeles Angels | lineups | medium | Manual lineups missing; player role/volume confidence remains low. | Add lineups.csv or JSON lineups. |
| New York Mets@Los Angeles Angels | ballpark_pal | low | Ballpark Pal factors unavailable; run/HR environment factors are not adjusted. | Add ballpark_pal.csv when available. |
| New York Mets@Los Angeles Angels | props | critical | Prop boards cannot populate for this game. | Add verified prop rows. |
| New York Mets@Los Angeles Angels | odds | critical | Final-card betting value cannot be verified without prices. | Add manual odds/prop prices. |
| Kansas City Royals@Seattle Mariners | lineups | medium | Manual lineups missing; player role/volume confidence remains low. | Add lineups.csv or JSON lineups. |
| Kansas City Royals@Seattle Mariners | ballpark_pal | low | Ballpark Pal factors unavailable; run/HR environment factors are not adjusted. | Add ballpark_pal.csv when available. |

## B. Slate Verification Table
| game_id | away_team | home_team | starter_status | lineup_status | weather_status | odds_status | source_confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 823554 | Baltimore Orioles | New York Yankees | probable | confirmed | manual | unavailable | Low |
| 823715 | Toronto Blue Jays | Minnesota Twins | probable | confirmed | manual | unavailable | Low |
| 824685 | Arizona Diamondbacks | Chicago Cubs | probable | confirmed | manual | unavailable | Low |
| 825014 | Cleveland Guardians | Athletics | probable | confirmed | manual | available | Low |
| 823388 | Cincinnati Reds | Pittsburgh Pirates | probable | confirmed | manual | available | Low |
| 822746 | Milwaukee Brewers | Washington Nationals | probable | confirmed | manual | unavailable | Low |
| 824771 | Houston Astros | Boston Red Sox | probable | confirmed | manual | unavailable | Low |
| 823876 | Philadelphia Phillies | Miami Marlins | probable | confirmed | manual | available | Low |
| 822988 | San Francisco Giants | Tampa Bay Rays | probable | confirmed | manual | available | Medium |
| 823067 | Los Angeles Dodgers | St. Louis Cardinals | probable | confirmed | manual | available | Low |
| 824284 | Texas Rangers | Detroit Tigers | probable | confirmed | manual | available | Low |
| 824365 | Atlanta Braves | Colorado Rockies | probable | confirmed | manual | available | Medium |
| 823308 | Chicago White Sox | San Diego Padres | probable | confirmed | manual | available | Medium |
| 824042 | New York Mets | Los Angeles Angels | probable | unavailable | manual | unavailable | Medium |
| 823144 | Kansas City Royals | Seattle Mariners | probable | unavailable | manual | available | Low |

## C. Game Projection Table
| game | away_win_probability | home_win_probability | projected_total | recommended_action |
| --- | --- | --- | --- | --- |
| Baltimore Orioles@New York Yankees | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Toronto Blue Jays@Minnesota Twins | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Arizona Diamondbacks@Chicago Cubs | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Cleveland Guardians@Athletics | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Cincinnati Reds@Pittsburgh Pirates | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Milwaukee Brewers@Washington Nationals | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Houston Astros@Boston Red Sox | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Philadelphia Phillies@Miami Marlins | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| San Francisco Giants@Tampa Bay Rays | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Los Angeles Dodgers@St. Louis Cardinals | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Texas Rangers@Detroit Tigers | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Atlanta Braves@Colorado Rockies | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Chicago White Sox@San Diego Padres | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| New York Mets@Los Angeles Angels | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |
| Kansas City Royals@Seattle Mariners | 0.5 | 0.5 | unavailable | PASS_UNCERTAINTY |

## D. Raw Winner Probability Board
| rank | game | team | raw_probability | fair_price | final_recommendation |
| --- | --- | --- | --- | --- | --- |
| 1 | Baltimore Orioles@New York Yankees | Baltimore Orioles | 0.5 | -100 | PASS_UNCERTAINTY |
| 2 | Baltimore Orioles@New York Yankees | New York Yankees | 0.5 | -100 | PASS_UNCERTAINTY |
| 3 | Toronto Blue Jays@Minnesota Twins | Toronto Blue Jays | 0.5 | -100 | PASS_UNCERTAINTY |
| 4 | Toronto Blue Jays@Minnesota Twins | Minnesota Twins | 0.5 | -100 | PASS_UNCERTAINTY |
| 5 | Arizona Diamondbacks@Chicago Cubs | Arizona Diamondbacks | 0.5 | -100 | PASS_UNCERTAINTY |
| 6 | Arizona Diamondbacks@Chicago Cubs | Chicago Cubs | 0.5 | -100 | PASS_UNCERTAINTY |
| 7 | Cleveland Guardians@Athletics | Cleveland Guardians | 0.5 | -100 | PASS_UNCERTAINTY |
| 8 | Cleveland Guardians@Athletics | Athletics | 0.5 | -100 | PASS_UNCERTAINTY |
| 9 | Cincinnati Reds@Pittsburgh Pirates | Cincinnati Reds | 0.5 | -100 | PASS_UNCERTAINTY |
| 10 | Cincinnati Reds@Pittsburgh Pirates | Pittsburgh Pirates | 0.5 | -100 | PASS_UNCERTAINTY |

## E. Raw Total / Run Environment Board
| rank | game | projected_total | environment_support | recommendation |
| --- | --- | --- | --- | --- |
| 1 | Baltimore Orioles@New York Yankees | unavailable | run neutral; HR neutral; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |
| 2 | Toronto Blue Jays@Minnesota Twins | unavailable | run neutral; HR neutral; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |
| 3 | Arizona Diamondbacks@Chicago Cubs | unavailable | run neutral; HR unfavorable; Opus cites Wrigley cold/wind-in HR suppression of roughly 10-15%; exact Ballpark Pal timestamp unavailable.; Wind blowing in reduces HR confidence.; Cold weather downgrades carry. | PASS_UNCERTAINTY |
| 4 | Cleveland Guardians@Athletics | unavailable | run favorable; HR favorable; Opus states Sutter Health Park +20% run factor and +29% HR factor; GPT PDF incorrectly lists Oakland Coliseum and lower factors.; Ballpark Pal HR factor boosts power.; Wind blowing in reduces HR confidence.; High run factor increases volatility. | WATCHLIST |
| 5 | Cincinnati Reds@Pittsburgh Pirates | unavailable | run unfavorable; HR unfavorable; PNC/cold/rain context; numeric factors from GPT PDF while Opus emphasizes rain/cold uncertainty.; Wind blowing in reduces HR confidence.; Cold weather downgrades carry. | PASS_UNCERTAINTY |
| 6 | Milwaukee Brewers@Washington Nationals | unavailable | run neutral; HR neutral; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |
| 7 | Houston Astros@Boston Red Sox | unavailable | run neutral; HR favorable; Opus cites Fenway wind-out/HR boost for Yordan Alvarez; GPT PDF park-factor table conflicts lower.; Ballpark Pal HR factor boosts power.; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |
| 8 | Philadelphia Phillies@Miami Marlins | unavailable | run neutral; HR neutral; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |
| 9 | San Francisco Giants@Tampa Bay Rays | unavailable | run neutral; HR neutral; Tropicana roof/dome context; exact Ballpark Pal values not supplied in Opus.; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |
| 10 | Los Angeles Dodgers@St. Louis Cardinals | unavailable | run unfavorable; HR favorable; GPT PDF lists Busch factors, while Opus treats weather as neutral; use low confidence for conflict.; Ballpark Pal HR factor boosts power.; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |
| 11 | Texas Rangers@Detroit Tigers | unavailable | run favorable; HR favorable; GPT PDF cites Comerica as boosted for run/HR context; Opus cites cold weather but wind out.; Ballpark Pal HR factor boosts power.; Wind blowing in reduces HR confidence.; Cold weather downgrades carry.; High run factor increases volatility. | WATCHLIST |
| 12 | Atlanta Braves@Colorado Rockies | unavailable | run favorable; HR favorable; Opus states Coors +13% runs and +23% HR; GPT PDF uses larger 1.30/1.50 park factors.; Ballpark Pal HR factor boosts power.; Wind blowing in reduces HR confidence.; High run factor increases volatility. | PASS_UNCERTAINTY |
| 13 | Chicago White Sox@San Diego Padres | unavailable | run unfavorable; HR unfavorable; Petco pitcher-friendly context; numeric values from GPT PDF.; Wind blowing in reduces HR confidence. | WATCHLIST |
| 14 | New York Mets@Los Angeles Angels | unavailable | run neutral; HR neutral; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |
| 15 | Kansas City Royals@Seattle Mariners | unavailable | run neutral; HR neutral; Wind blowing in reduces HR confidence. | PASS_UNCERTAINTY |

## F. Raw Total Bases Prediction Board
| rank | player | team | game | raw_probability | recommendation |
| --- | --- | --- | --- | --- | --- |
| 1 | Spencer Torkelson | Detroit Tigers | Texas Rangers@Detroit Tigers |  | PASS_UNCERTAINTY |
| 2 | Riley Greene | Detroit Tigers | Texas Rangers@Detroit Tigers |  | PASS_UNCERTAINTY |
| 3 | Matt Olson | Atlanta Braves | Atlanta Braves@Colorado Rockies |  | PASS_UNCERTAINTY |

## G. Raw Home Run Probability Board
| rank | player | team | game | hr_probability | recommendation |
| --- | --- | --- | --- | --- | --- |
| 1 | Matt Olson | Atlanta Braves | Atlanta Braves@Colorado Rockies | 0.12 | WATCHLIST |
| 2 | Yordan Alvarez | Houston Astros | Houston Astros@Boston Red Sox | 0.1 | LOTTERY |
| 3 | Aaron Judge | New York Yankees | Baltimore Orioles@New York Yankees | 0.1 | LOTTERY |
| 4 | Spencer Torkelson | Detroit Tigers | Texas Rangers@Detroit Tigers | 0.1 | LOTTERY |
| 5 | Shohei Ohtani | Los Angeles Dodgers | Los Angeles Dodgers@St. Louis Cardinals | 0.08 | WATCHLIST |
| 6 | James Wood | Washington Nationals | Milwaukee Brewers@Washington Nationals | 0.07 | LOTTERY |
| 7 | Elly De La Cruz | Cincinnati Reds | Cincinnati Reds@Pittsburgh Pirates | 0.07 | LOTTERY |

## H. Pitcher Prop Projection Board
| rank | pitcher | team | game | prop_type | recommendation |
| --- | --- | --- | --- | --- | --- |
| 1 | Chris Sale | Atlanta Braves | Atlanta Braves@Colorado Rockies | pitcher_strikeouts | GOOD_VALUE |
| 2 | Dylan Cease | Toronto Blue Jays | Toronto Blue Jays@Minnesota Twins | pitcher_strikeouts | WATCHLIST |
| 3 | Seth Lugo | Kansas City Royals | Kansas City Royals@Seattle Mariners | pitcher_strikeouts | PASS_UNCERTAINTY |
| 4 | Michael McGreevy | St. Louis Cardinals | Los Angeles Dodgers@St. Louis Cardinals | pitcher_strikeouts | PASS_UNCERTAINTY |
| 5 | Kumar Rocker | Texas Rangers | Texas Rangers@Detroit Tigers | pitcher_strikeouts | PASS_UNCERTAINTY |

## I. Game-by-Game Capsules
- Baltimore Orioles@New York Yankees: raw probabilities Baltimore Orioles 0.5 / New York Yankees 0.5; missing=lineups,weather,bullpen,recent_form
- Toronto Blue Jays@Minnesota Twins: raw probabilities Toronto Blue Jays 0.5 / Minnesota Twins 0.5; missing=lineups,weather,bullpen,recent_form
- Arizona Diamondbacks@Chicago Cubs: raw probabilities Arizona Diamondbacks 0.5 / Chicago Cubs 0.5; missing=lineups,weather,bullpen,recent_form
- Cleveland Guardians@Athletics: raw probabilities Cleveland Guardians 0.5 / Athletics 0.5; missing=lineups,weather,bullpen,recent_form
- Cincinnati Reds@Pittsburgh Pirates: raw probabilities Cincinnati Reds 0.5 / Pittsburgh Pirates 0.5; missing=lineups,weather,bullpen,recent_form
- Milwaukee Brewers@Washington Nationals: raw probabilities Milwaukee Brewers 0.5 / Washington Nationals 0.5; missing=lineups,weather,bullpen,recent_form
- Houston Astros@Boston Red Sox: raw probabilities Houston Astros 0.5 / Boston Red Sox 0.5; missing=lineups,weather,bullpen,recent_form
- Philadelphia Phillies@Miami Marlins: raw probabilities Philadelphia Phillies 0.5 / Miami Marlins 0.5; missing=lineups,weather,bullpen,recent_form
- San Francisco Giants@Tampa Bay Rays: raw probabilities San Francisco Giants 0.5 / Tampa Bay Rays 0.5; missing=lineups,weather,bullpen,recent_form
- Los Angeles Dodgers@St. Louis Cardinals: raw probabilities Los Angeles Dodgers 0.5 / St. Louis Cardinals 0.5; missing=lineups,weather,bullpen,recent_form
- Texas Rangers@Detroit Tigers: raw probabilities Texas Rangers 0.5 / Detroit Tigers 0.5; missing=lineups,weather,bullpen,recent_form
- Atlanta Braves@Colorado Rockies: raw probabilities Atlanta Braves 0.5 / Colorado Rockies 0.5; missing=lineups,weather,bullpen,recent_form
- Chicago White Sox@San Diego Padres: raw probabilities Chicago White Sox 0.5 / San Diego Padres 0.5; missing=lineups,weather,bullpen,recent_form
- New York Mets@Los Angeles Angels: raw probabilities New York Mets 0.5 / Los Angeles Angels 0.5; missing=lineups,weather,bullpen,recent_form
- Kansas City Royals@Seattle Mariners: raw probabilities Kansas City Royals 0.5 / Seattle Mariners 0.5; missing=lineups,weather,bullpen,recent_form

## J. Deep Dives on Best Research Edges
No deep-dive research edge is promoted without verified lineup, weather, Statcast/prop, and environment support.

## K. Deep Dives on Best Betting Values
No betting value is promoted unless a manual odds overlay supplies a positive no-vig edge.

## L. Likely But Overpriced Board
No verified rows available; output CSV contains schema headers only.

## M. Final Betting Card
| rank | market_type | selection | game | current_price | edge | recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | moneyline | St. Louis Cardinals | Los Angeles Dodgers@St. Louis Cardinals | 120.0 | 0.0575 | GOOD_VALUE |
| 2 | pitcher_strikeouts | Chris Sale | Atlanta Braves@Colorado Rockies | 106.0 | 0.0496 | GOOD_VALUE |

## N. Late Information Checklist
# EchoIQ MLB Late Verification Checklist
Date: 2026-05-02

- Recheck probable starters and scratch risk.
- Recheck confirmed batting orders and lineup handedness.
- Recheck weather, roof, wind, and delay risk.
- Recheck Ballpark Pal run and HR factors if accessible.
- Recheck moneyline, total, team total, first-five, HR, TB, and pitcher prop prices.
- Re-run the EchoIQ report after material starter, lineup, weather, or price changes.

## Game-Level Items
- Baltimore Orioles @ New York Yankees: starters=probable; lineups=confirmed; weather=manual; odds=unavailable
- Toronto Blue Jays @ Minnesota Twins: starters=probable; lineups=confirmed; weather=manual; odds=unavailable
- Arizona Diamondbacks @ Chicago Cubs: starters=probable; lineups=confirmed; weather=manual; odds=unavailable
- Cleveland Guardians @ Athletics: starters=probable; lineups=confirmed; weather=manual; odds=available
- Cincinnati Reds @ Pittsburgh Pirates: starters=probable; lineups=confirmed; weather=manual; odds=available
- Milwaukee Brewers @ Washington Nationals: starters=probable; lineups=confirmed; weather=manual; odds=unavailable
- Houston Astros @ Boston Red Sox: starters=probable; lineups=confirmed; weather=manual; odds=unavailable
- Philadelphia Phillies @ Miami Marlins: starters=probable; lineups=confirmed; weather=manual; odds=available
- San Francisco Giants @ Tampa Bay Rays: starters=probable; lineups=confirmed; weather=manual; odds=available
- Los Angeles Dodgers @ St. Louis Cardinals: starters=probable; lineups=confirmed; weather=manual; odds=available
- Texas Rangers @ Detroit Tigers: starters=probable; lineups=confirmed; weather=manual; odds=available
- Atlanta Braves @ Colorado Rockies: starters=probable; lineups=confirmed; weather=manual; odds=available
- Chicago White Sox @ San Diego Padres: starters=probable; lineups=confirmed; weather=manual; odds=available
- New York Mets @ Los Angeles Angels: starters=probable; lineups=unavailable; weather=manual; odds=unavailable
- Kansas City Royals @ Seattle Mariners: starters=probable; lineups=unavailable; weather=manual; odds=available

## O. Validation / Missing Data Notes
- One or more games lack confirmed manual lineups in this safe package-layer run.

## P. If I Could Only Bet Three Things
No bet. The final card is empty unless verified market value clears the separated betting-value gate.

## Final Recommendation Labels
RAW_TOP, STRONG_MATCHUP, GOOD_VALUE, LIKELY_OVERPRICED, WATCHLIST, LOTTERY, CONDITIONAL, PASS_PRICE, PASS_UNCERTAINTY, AVOID

## Late-Market Source Conflict Addendum

These audit items were restored after the rerun from `data/manual/2026-05-02/source_notes.md`. They do not create extra final-card bets.

- Live/final games were cut from current-market eligibility: BAL@NYY, TOR@MIN, ARI@CHC, CLE@OAK, CIN@PIT, MIL@WSH, HOU@BOS, PHI@MIA.
- STL ML is still plus-money across refreshed free sources used here, but exact price varies; final row uses FanDuel +120.
- Chris Sale O7.5 K remains plus-money across refreshed free sources used here; final row uses FanDuel +106.
- Matt Olson HR, TEX/DET Over, DET ML, CWS/SD Under, and several watchlist props remain cut or watchlist-only because price, line, or model support is insufficient.
- Current Ballpark Pal factors were not independently refreshed.

