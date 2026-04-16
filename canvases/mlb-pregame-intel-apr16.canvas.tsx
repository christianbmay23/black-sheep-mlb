import { H1, Text } from "cursor/canvas";

export default function Apr16Canvas() {
  return (
    <>
      <H1>MLB Pregame Intel — Apr 16</H1>
      <Text>Date-driven export marker blocks live below.</Text>
    </>
  );
}

<!-- games-csv:start -->
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary
2026-04-16,SEA,TEX,8:05 PM,Logan Gilbert,Nathan Eovaldi,+105,-120,47.11,52.89,50.42,49.58,3.31,-3.31,SEA,B,3.31,Medium,,Medium,Gilbert swing-and-miss profile gives slight value at plus money.
2026-04-16,ATL,NYM,7:10 PM,Spencer Strider,Tylor Megill,-138,+124,56.90,43.10,59.30,40.70,2.40,-2.40,ATL,B,2.40,High,,High,Strider strikeout edge and bullpen depth support ATL.
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,tier,data_confidence
2026-04-16,SEA@TEX,SEA,Julio Rodriguez,Nathan Eovaldi,8.40,28.20,+1090,+255,+425,3.10,B,High
2026-04-16,SEA@TEX,TEX,Corey Seager,Logan Gilbert,6.90,24.40,+1350,+310,+475,1.20,C,Medium
2026-04-16,ATL@NYM,ATL,Ronald Acuna Jr.,Tylor Megill,10.80,33.50,+826,+198,+370,4.40,A,High
<!-- batter-outlooks-csv:end -->
