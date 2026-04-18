import React from "react";
import {
  Card, CardBody, CardHeader,
  Divider, Grid, H1, H2, H3,
  Pill, Row, Stack, Stat, Table, Text,
} from "cursor/canvas";

/** Lineup row: #, player, position */
type LuRow = [string, string, string];

type PropRow = {
  batter: string;
  team: string;
  hrPct: number;
  tb2Pct: number;
  tier: string;
  note: string;
};

type SlateGame = {
  gameKey: string;
  venue: string;
  away: string;
  home: string;
  timeEt: string;
  awaySp: string;
  homeSp: string;
  awayAmerican: number;
  homeAmerican: number;
  impliedAwayPct: number;
  impliedHomePct: number;
  modelAwayPct: number;
  modelHomePct: number;
  edgeAwayPct: number;
  edgeHomePct: number;
  prediction: string;
  decisionTier: string;
  edgeOnPickPct: number;
  modelConfidence: string;
  analystConfidence: string;
  flags: string;
  rationale: string;
  awayLuLabel: string;
  homeLuLabel: string;
  awayLineup: LuRow[];
  homeLineup: LuRow[];
  spAwayNotes: string[];
  spHomeNotes: string[];
  matchupBullets: string[];
  propsAway: PropRow[];
  propsHome: PropRow[];
};

type LineupPosting = "posted" | "mixed" | "projected";
type DecisionStatus = "bet" | "small/conditional" | "pass";

type DerivedDecision = {
  game: SlateGame;
  flags: string[];
  lineupPosting: LineupPosting;
  hasLineupRisk: boolean;
  hasManualArtifact: boolean;
  tierRank: number;
  status: DecisionStatus;
};

/** Mirrors games-csv + enriched UI fields. Probables / posted LUs: MLB Stats API (2026-04-16). */
const SLATE: SlateGame[] = [
  {
    gameKey: "WSH@PIT",
    venue: "PNC Park",
    away: "WSH",
    home: "PIT",
    timeEt: "12:35 PM",
    awaySp: "Foster Griffin",
    homeSp: "Braxton Ashcraft",
    awayAmerican: 118,
    homeAmerican: -132,
    impliedAwayPct: 44.64,
    impliedHomePct: 55.36,
    modelAwayPct: 27.32,
    modelHomePct: 72.68,
    edgeAwayPct: -17.31,
    edgeHomePct: 17.31,
    prediction: "PIT",
    decisionTier: "A+",
    edgeOnPickPct: 17.31,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale:
      "Probables Griffin (WSH) and Ashcraft (PIT) look like swing/spot roles without big separator stuff. PNC is slightly pitcher-friendly; Pirates get a small home edge but the price is close to fair.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "James Wood", "RF"],
      ["2", "Luis García Jr.", "1B"],
      ["3", "Brady House", "3B"],
      ["4", "Daylen Lile", "LF"],
      ["5", "CJ Abrams", "SS"],
      ["6", "Jacob Young", "CF"],
      ["7", "Jorbit Vivas", "DH"],
      ["8", "Drew Millas", "C"],
      ["9", "Nasim Nuñez", "2B"],
    ],
    homeLineup: [
      ["1", "Jake Mangum", "RF"],
      ["2", "Nick Gonzales", "3B"],
      ["3", "Oneil Cruz", "CF"],
      ["4", "Marcell Ozuna", "DH"],
      ["5", "Nick Yorke", "1B"],
      ["6", "Brandon Lowe", "2B"],
      ["7", "Joey Bart", "C"],
      ["8", "Konnor Griffin", "SS"],
      ["9", "Billy Cook", "LF"],
    ],
    spAwayNotes: [
      "RHP spot/swing role — prioritize weak contact and early-count strikes; thin track record as a traditional starter.",
      "WSH must steal innings behind him — bullpen game risk if command wavers.",
    ],
    spHomeNotes: [
      "Ashcraft works the zone; PNC suppresses some HR noise — matchup leans on barrels over walks.",
      "Pirates can match RHB power (Cruz, Ozuna) vs a non-elite swing-miss profile.",
    ],
    matchupBullets: [
      "Handedness: Griffin (R) vs Cruz/Ozuna (RHB) — no platoon gift; Wood (LHB) vs Ashcraft is the clearest opposite-side spot.",
      "Pitch mix: expect fastball/slider volume; Pirates with top-of-scale EV can punish mistakes middle-in.",
      "HR / TB: PNC leans pitcher-friendly — downgrade pure HR equity vs GABP, but Ozuna/Cruz stay in the power conversation.",
    ],
    propsAway: [
      { batter: "James Wood", team: "WSH", hrPct: 8.2, tb2Pct: 32.0, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.4, tb2Pct: 12.1, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Brady House", team: "WSH", hrPct: 0.4, tb2Pct: 6.6, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 0.4, tb2Pct: 10.2, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 5.0, tb2Pct: 27.3, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.4, tb2Pct: 13.1, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jake Mangum", team: "PIT", hrPct: 0.4, tb2Pct: 10.3, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.4, tb2Pct: 12.6, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Oneil Cruz", team: "PIT", hrPct: 11.6, tb2Pct: 39.9, tier: "A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 2.6, tb2Pct: 15.2, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 1.9, tb2Pct: 17.6, tier: "D", note: "RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 7.0, tb2Pct: 27.0, tier: "B", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Joey Bart", team: "PIT", hrPct: 1.3, tb2Pct: 8.2, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 10.4, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Billy Cook", team: "PIT", hrPct: 1.2, tb2Pct: 15.1, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "SF@CIN",
    venue: "Great American Ball Park",
    away: "SF",
    home: "CIN",
    timeEt: "12:40 PM",
    awaySp: "Landen Roupp",
    homeSp: "Chase Burns",
    awayAmerican: 128,
    homeAmerican: -148,
    impliedAwayPct: 42.36,
    impliedHomePct: 57.64,
    modelAwayPct: 63.03,
    modelHomePct: 36.97,
    edgeAwayPct: 20.66,
    edgeHomePct: -20.66,
    prediction: "SF",
    decisionTier: "A+",
    edgeOnPickPct: 20.66,
    modelConfidence: "High",
    analystConfidence: "Medium-High",
    flags: "approx_market_ml",
    rationale:
      "Burns at home brings premium velocity; Roupp works contact and weak barrels. GABP raises HR/TB volatility — lean Reds, but mostly a props/team-total environment.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Luis Arraez", "2B"],
      ["2", "Willy Adames", "SS"],
      ["3", "Rafael Devers", "1B"],
      ["4", "Matt Chapman", "3B"],
      ["5", "Jung Hoo Lee", "RF"],
      ["6", "Will Brennan", "LF"],
      ["7", "Casey Schmitt", "DH"],
      ["8", "Drew Gilbert", "CF"],
      ["9", "Patrick Bailey", "C"],
    ],
    homeLineup: [
      ["1", "TJ Friedl", "CF"],
      ["2", "Matt McLain", "2B"],
      ["3", "Elly De La Cruz", "SS"],
      ["4", "Sal Stewart", "1B"],
      ["5", "Eugenio Suárez", "DH"],
      ["6", "Spencer Steer", "LF"],
      ["7", "Rece Hinds", "RF"],
      ["8", "Ke'Bryan Hayes", "3B"],
      ["9", "P.J. Higgins", "C"],
    ],
    spAwayNotes: [
      "LHP Roupp: contact management profile — lives on weak barrels more than empty swings.",
      "SF must string hits in a bandbox; Devers/Chapman carry ceiling vs RHP.",
    ],
    spHomeNotes: [
      "Burns (R): velocity plays at home; miss bats enough to cap long rallies if splitter/slider are sharp.",
      "GABP inflates HR/TB — Reds RH power (De La Cruz, Steer) is the game’s central story.",
    ],
    matchupBullets: [
      "Handedness: Roupp (L) vs heavy RH Cincinnati core — classic LHP-on-RHB leverage spots for Cincinnati power.",
      "Pitch-type: Burns velocity/separation vs SF’s contact-first bats (Arraez) — SF may need sequential hits; CIN can score in one swing.",
      "HR / TB: Highest run-environment game on the slate — prioritize HR / 2+ TB and team-total angles over a skinny ML edge.",
    ],
    propsAway: [
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 8.5, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Willy Adames", team: "SF", hrPct: 4.2, tb2Pct: 22.1, tier: "C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Rafael Devers", team: "SF", hrPct: 3.7, tb2Pct: 18.9, tier: "D", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.8, tb2Pct: 14.2, tier: "D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 1.4, tb2Pct: 16.3, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Will Brennan", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 6.0, tb2Pct: 28.4, tier: "B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 7.9, tb2Pct: 26.4, tier: "B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.4, tb2Pct: 9.6, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 5.7, tb2Pct: 25.3, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 6.5, tb2Pct: 28.0, tier: "B", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 1.4, tb2Pct: 14.1, tier: "D", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "P.J. Higgins", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "KC@DET",
    venue: "Comerica Park",
    away: "KC",
    home: "DET",
    timeEt: "1:10 PM",
    awaySp: "Kris Bubic",
    homeSp: "Keider Montero",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
    modelAwayPct: 27.58,
    modelHomePct: 72.42,
    edgeAwayPct: -18.90,
    edgeHomePct: 18.90,
    prediction: "DET",
    decisionTier: "A+",
    edgeOnPickPct: 18.90,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale:
      "Bubic vs Montero is young-starter volatility; Comerica trims some extra-base noise. Slight DET home lean without a commanding pitching edge.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Maikel Garcia", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Vinnie Pasquantino", "1B"],
      ["4", "Salvador Perez", "DH"],
      ["5", "Carter Jensen", "C"],
      ["6", "Jonathan India", "2B"],
      ["7", "Jac Caglianone", "RF"],
      ["8", "Michael Massey", "LF"],
      ["9", "Kyle Isbel", "CF"],
    ],
    homeLineup: [
      ["1", "Gleyber Torres", "2B"],
      ["2", "Kevin McGonigle", "3B"],
      ["3", "Jahmai Jones", "DH"],
      ["4", "Dillon Dingler", "C"],
      ["5", "Riley Greene", "LF"],
      ["6", "Matt Vierling", "CF"],
      ["7", "Spencer Torkelson", "1B"],
      ["8", "Wenceel Pérez", "RF"],
      ["9", "Javier Báez", "SS"],
    ],
    spAwayNotes: [
      "LHP Bubic: deception and shape vs raw velocity — volatility when FB command drifts.",
    ],
    spHomeNotes: [
      "Montero (R): young arm; Comerica helps keep balls in the yard if he avoids middle-middle.",
    ],
    matchupBullets: [
      "Handedness: Bubic (L) vs DET RHB cluster — watch Torres / Torkelson lift spots.",
      "Pitch-type: if Bubic leans CH/SL, Witt and Pasquantino become chase-or-damage swings.",
      "HR / TB: Comerica dampens pure HR — 2+ TB and barrels matter more than HR lottery.",
    ],
    propsAway: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 0.4, tb2Pct: 14.6, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 1.0, tb2Pct: 19.0, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.4, tb2Pct: 7.1, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Salvador Perez", team: "KC", hrPct: 0.4, tb2Pct: 8.1, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Carter Jensen", team: "KC", hrPct: 2.5, tb2Pct: 14.1, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jonathan India", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 0.8, tb2Pct: 15.7, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.4, tb2Pct: 7.2, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.4, tb2Pct: 8.9, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Kevin McGonigle", team: "DET", hrPct: 3.7, tb2Pct: 24.0, tier: "C", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Jahmai Jones", team: "DET", hrPct: 0.4, tb2Pct: 7.2, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Dillon Dingler", team: "DET", hrPct: 11.7, tb2Pct: 42.4, tier: "A+", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Riley Greene", team: "DET", hrPct: 5.9, tb2Pct: 30.0, tier: "B", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Matt Vierling", team: "DET", hrPct: 2.6, tb2Pct: 14.7, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 2.2, tb2Pct: 17.2, tier: "D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 1.6, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Javier Báez", team: "DET", hrPct: 1.0, tb2Pct: 15.7, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "LAA@NYY",
    venue: "Yankee Stadium",
    away: "LAA",
    home: "NYY",
    timeEt: "1:35 PM",
    awaySp: "Brent Suter",
    homeSp: "Max Fried",
    awayAmerican: 205,
    homeAmerican: -245,
    impliedAwayPct: 31.59,
    impliedHomePct: 68.41,
    modelAwayPct: 36.05,
    modelHomePct: 63.95,
    edgeAwayPct: 4.46,
    edgeHomePct: -4.46,
    prediction: "NYY",
    decisionTier: "D",
    edgeOnPickPct: -4.46,
    modelConfidence: "High",
    analystConfidence: "High",
    flags: "approx_market_ml",
    rationale:
      "Suter vs Fried is a massive talent mismatch; short porch amplifies fly-ball damage. Market already prices a big NYY edge — PASS on ML unless you have a materially better number.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Zach Neto", "SS"],
      ["2", "Mike Trout", "DH"],
      ["3", "Jo Adell", "RF"],
      ["4", "Oswald Peraza", "3B"],
      ["5", "Vaughn Grissom", "2B"],
      ["6", "Nolan Schanuel", "1B"],
      ["7", "Travis d'Arnaud", "C"],
      ["8", "Josh Lowe", "LF"],
      ["9", "Bryce Teodosio", "CF"],
    ],
    homeLineup: [
      ["1", "Trent Grisham", "CF"],
      ["2", "Aaron Judge", "RF"],
      ["3", "Cody Bellinger", "LF"],
      ["4", "Giancarlo Stanton", "DH"],
      ["5", "Ben Rice", "1B"],
      ["6", "Amed Rosario", "3B"],
      ["7", "Jazz Chisholm Jr.", "2B"],
      ["8", "José Caballero", "SS"],
      ["9", "J.C. Escarra", "C"],
    ],
    spAwayNotes: [
      "LHP Suter: soft-tossing, weak-contact profile — NYY RH power is the nightmare matchup.",
    ],
    spHomeNotes: [
      "LHP Fried: bat-miss + weak contact — stabilizes innings; short RF porch helps Judge/Stanton.",
    ],
    matchupBullets: [
      "Handedness: Fried (L) vs LAA RHB-heavy heart — Trout still dangerous but Fried’s shape limits barrels.",
      "Pitch-type: Suter’s low-velo mix elevates HR risk to Judge/Stanton RHB — classic Bronx profile.",
      "HR / TB: Top HR environment on slate — props > ML (price already steep).",
    ],
    propsAway: [
      { batter: "Zach Neto", team: "LAA", hrPct: 0.8, tb2Pct: 11.8, tier: "D", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Mike Trout", team: "LAA", hrPct: 9.2, tb2Pct: 35.3, tier: "A", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Jo Adell", team: "LAA", hrPct: 0.9, tb2Pct: 16.8, tier: "D", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 2.5, tb2Pct: 17.3, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Vaughn Grissom", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Travis d'Arnaud", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Bryce Teodosio", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Trent Grisham", team: "NYY", hrPct: 3.0, tb2Pct: 18.2, tier: "D", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 12.8, tb2Pct: 41.3, tier: "A+", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 1.4, tb2Pct: 15.2, tier: "D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 3.8, tb2Pct: 19.2, tier: "D", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Ben Rice", team: "NYY", hrPct: 12.6, tb2Pct: 44.2, tier: "A+", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Amed Rosario", team: "NYY", hrPct: 5.1, tb2Pct: 24.3, tier: "C", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "José Caballero", team: "NYY", hrPct: 0.4, tb2Pct: 7.2, tier: "D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 0.4, tb2Pct: 8.7, tier: "D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "TOR@MIL",
    venue: "American Family Field",
    away: "TOR",
    home: "MIL",
    timeEt: "1:40 PM",
    awaySp: "Patrick Corbin",
    homeSp: "Brandon Sproat",
    awayAmerican: -102,
    homeAmerican: -108,
    impliedAwayPct: 49.30,
    impliedHomePct: 50.70,
    modelAwayPct: 50.70,
    modelHomePct: 49.30,
    edgeAwayPct: 1.40,
    edgeHomePct: -1.40,
    prediction: "TOR",
    decisionTier: "C",
    edgeOnPickPct: 1.40,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "approx_market_ml;corbin_platoons",
    rationale:
      "Corbin vs Sproat is command volatility on both sides; Milwaukee navigation is a hair better at home, but this is effectively a coin flip for betting.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Davis Schneider", "LF"],
      ["2", "Daulton Varsho", "CF"],
      ["3", "Vladimir Guerrero Jr.", "DH"],
      ["4", "Jesús Sánchez", "RF"],
      ["5", "Lenyn Sosa", "2B"],
      ["6", "Kazuma Okamoto", "1B"],
      ["7", "Andrés Giménez", "SS"],
      ["8", "Ernie Clement", "3B"],
      ["9", "Tyler Heineman", "C"],
    ],
    homeLineup: [
      ["1", "Brandon Lockridge", "CF"],
      ["2", "Brice Turang", "2B"],
      ["3", "William Contreras", "C"],
      ["4", "Gary Sánchez", "DH"],
      ["5", "Luis Rengifo", "1B"],
      ["6", "Luis Matos", "RF"],
      ["7", "Greg Jones", "LF"],
      ["8", "David Hamilton", "3B"],
      ["9", "Joey Ortiz", "SS"],
    ],
    spAwayNotes: [
      "LHP Corbin: FB command volatility — barrels spike when he misses arm-side.",
    ],
    spHomeNotes: [
      "RHP Sproat: power stuff but control risk — game can turn on walks + hard contact clusters.",
    ],
    matchupBullets: [
      "Handedness: LHP vs MIL lineup — Contreras / Sánchez are classic HR paths if FB is elevated.",
      "Pitch-type: Corbin SL/CH usage vs TOR RHB — Vlad is the swing matchup.",
      "HR / TB: Dome helps keep balls in play — prefer selective props over sides.",
    ],
    propsAway: [
      { batter: "Davis Schneider", team: "TOR", hrPct: 3.2, tb2Pct: 15.7, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Daulton Varsho", team: "TOR", hrPct: 3.6, tb2Pct: 18.8, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 6.0, tb2Pct: 27.4, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 6.1, tb2Pct: 27.1, tier: "B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Lenyn Sosa", team: "TOR", hrPct: 1.9, tb2Pct: 16.9, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 3.7, tb2Pct: 17.1, tier: "D", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 3.9, tb2Pct: 19.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.9, tb2Pct: 15.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Tyler Heineman", team: "TOR", hrPct: 2.2, tb2Pct: 15.5, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 3.2, tb2Pct: 14.4, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Brice Turang", team: "MIL", hrPct: 12.0, tb2Pct: 39.6, tier: "A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "William Contreras", team: "MIL", hrPct: 9.5, tb2Pct: 34.5, tier: "A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 17.6, tb2Pct: 49.1, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 4.2, tb2Pct: 17.1, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luis Matos", team: "MIL", hrPct: 4.6, tb2Pct: 15.6, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Greg Jones", team: "MIL", hrPct: 3.6, tb2Pct: 10.4, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "David Hamilton", team: "MIL", hrPct: 1.6, tb2Pct: 8.8, tier: "D", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 4.0, tb2Pct: 15.2, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "TB@CWS",
    venue: "Rate Field",
    away: "TB",
    home: "CWS",
    timeEt: "2:10 PM",
    awaySp: "Steven Matz",
    homeSp: "Jordan Leasure",
    awayAmerican: -142,
    homeAmerican: 124,
    impliedAwayPct: 56.79,
    impliedHomePct: 43.21,
    modelAwayPct: 51.28,
    modelHomePct: 48.72,
    edgeAwayPct: -5.51,
    edgeHomePct: 5.51,
    prediction: "TB",
    decisionTier: "D",
    edgeOnPickPct: -5.51,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale:
      "Matz’s LHP shape matters against Chicago’s lefty bats; Leasure stretched as a starter adds volatility. Rays are the cleaner roster spot — edge is modest.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Chandler Simpson", "LF"],
      ["2", "Junior Caminero", "3B"],
      ["3", "Cedric Mullins", "CF"],
      ["4", "Yandy Díaz", "DH"],
      ["5", "Ryan Vilade", "1B"],
      ["6", "Ben Williamson", "2B"],
      ["7", "Jonny DeLuca", "RF"],
      ["8", "Nick Fortes", "C"],
      ["9", "Taylor Walls", "SS"],
    ],
    homeLineup: [
      ["1", "Miguel Vargas", "3B"],
      ["2", "Chase Meidroth", "2B"],
      ["3", "Munetaka Murakami", "1B"],
      ["4", "Everson Pereira", "RF"],
      ["5", "Edgar Quero", "C"],
      ["6", "Tanner Murray", "SS"],
      ["7", "Andrew Benintendi", "DH"],
      ["8", "Derek Hill", "CF"],
      ["9", "Sam Antonacci", "LF"],
    ],
    spAwayNotes: [
      "LHP Matz: CH-heavy — good vs same-side and soft-contact swings when ahead.",
    ],
    spHomeNotes: [
      "Leasure stretched from pen: volatility + short leash — TB can stack traffic early.",
    ],
    matchupBullets: [
      "Handedness: Matz (L) vs Benintendi / Meidroth — classic L-on-L grind spots.",
      "Pitch-type: if Leasure is FB-heavy, Caminero/Mullins carry damage paths.",
      "HR / TB: Caminero power vs length risk — 2+ TB more stable than HR.",
    ],
    propsAway: [
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.4, tb2Pct: 9.7, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Junior Caminero", team: "TB", hrPct: 5.5, tb2Pct: 23.2, tier: "C", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.5, tb2Pct: 8.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 5.4, tb2Pct: 26.8, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ryan Vilade", team: "TB", hrPct: 1.2, tb2Pct: 11.8, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ben Williamson", team: "TB", hrPct: 0.4, tb2Pct: 9.1, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jonny DeLuca", team: "TB", hrPct: 6.1, tb2Pct: 26.3, tier: "B", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nick Fortes", team: "TB", hrPct: 2.9, tb2Pct: 20.9, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Taylor Walls", team: "TB", hrPct: 2.5, tb2Pct: 17.8, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Miguel Vargas", team: "CWS", hrPct: 4.3, tb2Pct: 18.9, tier: "D", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 2.2, tb2Pct: 17.3, tier: "D", note: "RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 11.0, tb2Pct: 35.3, tier: "A", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 8.6, tb2Pct: 31.6, tier: "B", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Edgar Quero", team: "CWS", hrPct: 0.4, tb2Pct: 6.2, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Tanner Murray", team: "CWS", hrPct: 4.3, tb2Pct: 20.1, tier: "C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 2.9, tb2Pct: 19.9, tier: "D", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Derek Hill", team: "CWS", hrPct: 0.6, tb2Pct: 11.9, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "TEX@ATH",
    venue: "Sutter Health Park",
    away: "TEX",
    home: "ATH",
    timeEt: "3:05 PM",
    awaySp: "Jack Leiter",
    homeSp: "Jacob Lopez",
    awayAmerican: -118,
    homeAmerican: 108,
    impliedAwayPct: 52.96,
    impliedHomePct: 47.04,
    modelAwayPct: 40.97,
    modelHomePct: 59.03,
    edgeAwayPct: -11.99,
    edgeHomePct: 11.99,
    prediction: "ATH",
    decisionTier: "A+",
    edgeOnPickPct: 11.99,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "approx_market_ml;oak_coliseum_env",
    rationale:
      "Leiter vs Lopez profiles as short-leash, high-volatility. No compelling gap vs a tight market without a better posted price.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Brandon Nimmo", "RF"],
      ["2", "Wyatt Langford", "CF"],
      ["3", "Jake Burger", "1B"],
      ["4", "Josh Jung", "3B"],
      ["5", "Kyle Higashioka", "C"],
      ["6", "Andrew McCutchen", "DH"],
      ["7", "Sam Haggerty", "LF"],
      ["8", "Josh Smith", "2B"],
      ["9", "Ezequiel Duran", "SS"],
    ],
    homeLineup: [
      ["1", "Jeff McNeil", "2B"],
      ["2", "Shea Langeliers", "DH"],
      ["3", "Nick Kurtz", "1B"],
      ["4", "Tyler Soderstrom", "LF"],
      ["5", "Jacob Wilson", "SS"],
      ["6", "Carlos Cortes", "RF"],
      ["7", "Lawrence Butler", "CF"],
      ["8", "Austin Wynns", "C"],
      ["9", "Darell Hernaiz", "3B"],
    ],
    spAwayNotes: [
      "RHP Leiter: swing-and-miss upside with command volatility — short leash likely.",
    ],
    spHomeNotes: [
      "RHP Lopez: similar volatility profile — game may be decided by pens.",
    ],
    matchupBullets: [
      "Handedness: both teams can stack RHB power — Langford/Jung vs Lopez FB command is the swing factor.",
      "Pitch-type: whoever lands breaker early wins traffic — HRs come on mistakes, not volume.",
      "HR / TB: PASS side — only play props if you get a price; volatility cuts confidence.",
    ],
    propsAway: [
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 4.1, tb2Pct: 22.5, tier: "C", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.4, tb2Pct: 8.6, tier: "D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Jake Burger", team: "TEX", hrPct: 5.2, tb2Pct: 23.6, tier: "C", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Josh Jung", team: "TEX", hrPct: 2.3, tb2Pct: 20.6, tier: "C", note: "RHB vs LHP; hard-contact profile; vs tough pitcher" },
      { batter: "Kyle Higashioka", team: "TEX", hrPct: 1.0, tb2Pct: 12.6, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Andrew McCutchen", team: "TEX", hrPct: 1.2, tb2Pct: 12.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Sam Haggerty", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Josh Smith", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ezequiel Duran", team: "TEX", hrPct: 0.6, tb2Pct: 12.2, tier: "D", note: "RHB vs LHP; hard-contact profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jeff McNeil", team: "ATH", hrPct: 1.5, tb2Pct: 15.7, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 11.2, tb2Pct: 37.3, tier: "A", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 10.6, tb2Pct: 34.8, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 6.8, tb2Pct: 25.6, tier: "C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.6, tb2Pct: 12.7, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 5.5, tb2Pct: 24.6, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 5.2, tb2Pct: 22.6, tier: "C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Austin Wynns", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Darell Hernaiz", team: "ATH", hrPct: 1.0, tb2Pct: 8.6, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "BAL@CLE",
    venue: "Progressive Field",
    away: "BAL",
    home: "CLE",
    timeEt: "6:10 PM",
    awaySp: "Shane Baz",
    homeSp: "Parker Messick",
    awayAmerican: -128,
    homeAmerican: 118,
    impliedAwayPct: 55.03,
    impliedHomePct: 44.97,
    modelAwayPct: 32.92,
    modelHomePct: 67.08,
    edgeAwayPct: -22.11,
    edgeHomePct: 22.11,
    prediction: "CLE",
    decisionTier: "A+",
    edgeOnPickPct: 22.11,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml;lineup_not_posted_api",
    rationale:
      "Baz’s stuff plays when the heater is elevated; Messick needs to limit barrels. Small lean to Baltimore’s lineup ceiling if Baz holds a normal starter workload.",
    awayLuLabel: "Projected (away not posted — active roster)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Gunnar Henderson", "SS"],
      ["2", "Colton Cowser", "LF"],
      ["3", "Pete Alonso", "1B"],
      ["4", "Coby Mayo", "3B"],
      ["5", "Leody Taveras", "CF"],
      ["6", "Taylor Ward", "DH"],
      ["7", "Samuel Basallo", "C"],
      ["8", "Dylan Beavers", "RF"],
      ["9", "Jeremiah Jackson", "2B"],
    ],
    homeLineup: [
      ["1", "Steven Kwan", "CF"],
      ["2", "Chase DeLauter", "DH"],
      ["3", "José Ramírez", "3B"],
      ["4", "Kyle Manzardo", "1B"],
      ["5", "George Valera", "RF"],
      ["6", "Angel Martínez", "LF"],
      ["7", "Juan Brito", "2B"],
      ["8", "Austin Hedges", "C"],
      ["9", "Brayan Rocchio", "SS"],
    ],
    spAwayNotes: [
      "RHP Baz: premium velo — game breaks on fastball command and secondary consistency.",
    ],
    spHomeNotes: [
      "LHP Messick: command-over-stuff — minimize barrels vs BAL power.",
    ],
    matchupBullets: [
      "Handedness: Messick (L) vs BAL RHB core — Alonso/Henderson are focal points.",
      "Pitch-type: Baz FB/SL vs Ramírez/Kwan — Cleveland’s contact vs Baltimore’s damage.",
      "HR / TB: Confirm BAL lineup at lock — props carry extra variance until LU posts.",
    ],
    propsAway: [
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 2.8, tb2Pct: 16.6, tier: "D", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Colton Cowser", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 1.4, tb2Pct: 14.8, tier: "D", note: "RHB vs LHP; hard-contact profile; vs tough pitcher" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 0.4, tb2Pct: 12.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.4, tb2Pct: 8.1, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 1.0, tb2Pct: 10.2, tier: "D", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 3.4, tb2Pct: 18.1, tier: "D", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 7.2, tb2Pct: 27.9, tier: "B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "José Ramírez", team: "CLE", hrPct: 6.3, tb2Pct: 26.3, tier: "B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 2.0, tb2Pct: 14.0, tier: "D", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "George Valera", team: "CLE", hrPct: 3.1, tb2Pct: 26.2, tier: "B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Angel Martínez", team: "CLE", hrPct: 2.8, tb2Pct: 18.1, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Juan Brito", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Austin Hedges", team: "CLE", hrPct: 0.4, tb2Pct: 13.8, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.5, tb2Pct: 11.4, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "COL@HOU",
    venue: "Daikin Park",
    away: "COL",
    home: "HOU",
    timeEt: "8:10 PM",
    awaySp: "Juan Mejia",
    homeSp: "Ryan Weiss",
    awayAmerican: 240,
    homeAmerican: -290,
    impliedAwayPct: 28.34,
    impliedHomePct: 71.66,
    modelAwayPct: 48.46,
    modelHomePct: 51.54,
    edgeAwayPct: 20.12,
    edgeHomePct: -20.12,
    prediction: "HOU",
    decisionTier: "D",
    edgeOnPickPct: -20.12,
    modelConfidence: "High",
    analystConfidence: "High",
    flags: "approx_market_ml;lineup_not_posted_api",
    rationale:
      "Road Rockies vs Houston’s overall talent is a steep mismatch; Crawford Boxes pull-side HRs matter. Chalk is heavy — PASS unless you model innings/hooks differently.",
    awayLuLabel: "Projected (not posted — active roster)",
    homeLuLabel: "Projected (not posted — active roster)",
    awayLineup: [
      ["1", "Brenton Doyle", "CF"],
      ["2", "Ezequiel Tovar", "SS"],
      ["3", "Hunter Goodman", "1B"],
      ["4", "Jordan Beck", "RF"],
      ["5", "Mickey Moniak", "LF"],
      ["6", "Edouard Julien", "DH"],
      ["7", "Willi Castro", "3B"],
      ["8", "Tyler Freeman", "2B"],
      ["9", "Brett Sullivan", "C"],
    ],
    homeLineup: [
      ["1", "Jose Altuve", "2B"],
      ["2", "Yordan Alvarez", "DH"],
      ["3", "Christian Walker", "1B"],
      ["4", "Isaac Paredes", "3B"],
      ["5", "Carlos Correa", "SS"],
      ["6", "Yainer Diaz", "C"],
      ["7", "Cam Smith", "RF"],
      ["8", "Joey Loperfido", "LF"],
      ["9", "Taylor Trammell", "CF"],
    ],
    spAwayNotes: [
      "Road spot starter profile for Colorado — thin margin for mistakes vs Houston’s lineup.",
    ],
    spHomeNotes: [
      "Weiss: not an ace label — Astros may lean on pen early; still a huge team-context edge.",
    ],
    matchupBullets: [
      "Handedness: Houston’s LHB power (Alvarez) vs RHP — classic pull-side HR setup in Minute Maid.",
      "Pitch-type: if Mejia is FB-heavy without secondaries, Alvarez/Walker punish mistakes.",
      "HR / TB: PASS ML — only shop props if price exists; chalk crushes edge.",
    ],
    propsAway: [
      { batter: "Brenton Doyle", team: "COL", hrPct: 2.3, tb2Pct: 13.7, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 6.4, tb2Pct: 28.5, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 10.5, tb2Pct: 32.4, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jordan Beck", team: "COL", hrPct: 2.7, tb2Pct: 11.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 10.5, tb2Pct: 32.9, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Edouard Julien", team: "COL", hrPct: 6.2, tb2Pct: 26.7, tier: "B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Willi Castro", team: "COL", hrPct: 4.1, tb2Pct: 18.6, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Tyler Freeman", team: "COL", hrPct: 2.7, tb2Pct: 17.3, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brett Sullivan", team: "COL", hrPct: 3.6, tb2Pct: 19.5, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Jose Altuve", team: "HOU", hrPct: 4.7, tb2Pct: 23.3, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 15.9, tb2Pct: 54.3, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Christian Walker", team: "HOU", hrPct: 7.6, tb2Pct: 29.9, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 7.0, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Carlos Correa", team: "HOU", hrPct: 5.2, tb2Pct: 25.5, tier: "C", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 0.4, tb2Pct: 7.6, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Cam Smith", team: "HOU", hrPct: 9.3, tb2Pct: 35.2, tier: "A", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Joey Loperfido", team: "HOU", hrPct: 2.6, tb2Pct: 16.5, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 3.2, tb2Pct: 19.2, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "SEA@SD",
    venue: "Petco Park",
    away: "SEA",
    home: "SD",
    timeEt: "8:40 PM",
    awaySp: "Luis Castillo",
    homeSp: "Walker Buehler",
    awayAmerican: -104,
    homeAmerican: -112,
    impliedAwayPct: 49.11,
    impliedHomePct: 50.89,
    modelAwayPct: 39.47,
    modelHomePct: 60.53,
    edgeAwayPct: -9.64,
    edgeHomePct: 9.64,
    prediction: "SD",
    decisionTier: "A+",
    edgeOnPickPct: 9.64,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml;lineup_not_posted_api",
    rationale:
      "Castillo vs Buehler is a true ace duel; Petco suppresses offense. Side market is rightfully tight — prefer game props over ML.",
    awayLuLabel: "Projected (not posted — active roster)",
    homeLuLabel: "Projected (not posted — active roster)",
    awayLineup: [
      ["1", "J.P. Crawford", "SS"],
      ["2", "Julio Rodríguez", "CF"],
      ["3", "Cal Raleigh", "C"],
      ["4", "Josh Naylor", "1B"],
      ["5", "Randy Arozarena", "LF"],
      ["6", "Dominic Canzone", "DH"],
      ["7", "Luke Raley", "RF"],
      ["8", "Brendan Donovan", "2B"],
      ["9", "Connor Joe", "3B"],
    ],
    homeLineup: [
      ["1", "Fernando Tatis Jr.", "RF"],
      ["2", "Xander Bogaerts", "SS"],
      ["3", "Manny Machado", "3B"],
      ["4", "Jackson Merrill", "CF"],
      ["5", "Jake Cronenworth", "2B"],
      ["6", "Ty France", "1B"],
      ["7", "Luis Campusano", "C"],
      ["8", "Nick Castellanos", "LF"],
      ["9", "Miguel Andujar", "DH"],
    ],
    spAwayNotes: [
      "RHP Castillo: elite stuff — Petco helps, but swing-miss plays anywhere.",
    ],
    spHomeNotes: [
      "RHP Buehler: command starter — limits barrels when FB/CT are on.",
    ],
    matchupBullets: [
      "Handedness: ace-on-ace — fewer platoon exploits; sequencing matters more than splits.",
      "Pitch-type: Castillo’s change/slider vs SD’s contact; Buehler’s CT vs Seattle’s chase decisions.",
      "HR / TB: Petco suppresses HR — lower HR prop priority; F5 / pitch props often cleaner.",
    ],
    propsAway: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.4, tb2Pct: 7.4, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 0.4, tb2Pct: 7.4, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 1.6, tb2Pct: 13.3, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.4, tb2Pct: 8.0, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.5, tb2Pct: 13.7, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 6.3, tb2Pct: 27.8, tier: "B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Luke Raley", team: "SEA", hrPct: 9.3, tb2Pct: 36.0, tier: "A", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Brendan Donovan", team: "SEA", hrPct: 1.2, tb2Pct: 13.2, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Connor Joe", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 6.7, tb2Pct: 28.6, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 5.2, tb2Pct: 24.3, tier: "C", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Manny Machado", team: "SD", hrPct: 2.0, tb2Pct: 14.5, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 7.0, tb2Pct: 27.8, tier: "B", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jake Cronenworth", team: "SD", hrPct: 2.2, tb2Pct: 13.6, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ty France", team: "SD", hrPct: 4.9, tb2Pct: 23.2, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luis Campusano", team: "SD", hrPct: 6.0, tb2Pct: 28.8, tier: "B", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nick Castellanos", team: "SD", hrPct: 2.4, tb2Pct: 17.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 2.7, tb2Pct: 21.2, tier: "C", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
    ],
  },
];

const ACTIONABLE_EDGE_PCT = 1.5;
const STRONG_EDGE_PCT = 4;

function parseFlags(flags: string): string[] {
  return flags
    .split(";")
    .map((flag) => flag.trim().toLowerCase())
    .filter(Boolean);
}

function labelPostingStatus(label: string): LineupPosting | "unknown" {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("projected") || normalized.includes("not posted")) return "projected";
  if (normalized.includes("posted")) return "posted";
  return "unknown";
}

function hasLineupRiskFlag(flags: string[]): boolean {
  return flags.some((flag) => {
    const normalized = flag.replace(/_/g, " ");
    return normalized.includes("lineup") || normalized.includes("not posted") || /\blu\b/.test(normalized);
  });
}

function classifyLineupPosting(g: SlateGame, flags: string[]): LineupPosting {
  const awayStatus = labelPostingStatus(g.awayLuLabel);
  const homeStatus = labelPostingStatus(g.homeLuLabel);
  const hasFlaggedRisk = hasLineupRiskFlag(flags);

  if (awayStatus === "posted" && homeStatus === "posted" && !hasFlaggedRisk) return "posted";
  if (awayStatus === "projected" && homeStatus === "projected") return "projected";
  if (awayStatus === "unknown" && homeStatus === "unknown") return hasFlaggedRisk ? "mixed" : "posted";
  if (awayStatus === "projected" || homeStatus === "projected" || hasFlaggedRisk) return "mixed";
  return "posted";
}

function tierRank(tier: string): number {
  const normalized = tier.trim().toUpperCase();
  if (normalized === "PASS") return 0;
  if (normalized.startsWith("A")) return 4;
  if (normalized.startsWith("B")) return 3;
  if (normalized.startsWith("C")) return 2;
  if (normalized.startsWith("D")) return 1;
  return 0;
}

function confidenceRank(confidence: string): number {
  const normalized = confidence.trim().toLowerCase();
  if (normalized === "high") return 4;
  if (normalized === "medium-high") return 3;
  if (normalized === "medium") return 2;
  if (normalized === "low") return 1;
  return 0;
}

function postingRank(posting: LineupPosting): number {
  if (posting === "posted") return 3;
  if (posting === "mixed") return 2;
  return 1;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rationaleSignalsTeam(rationale: string, team: string): boolean {
  const escapedTeam = escapeRegExp(team.toLowerCase());
  return new RegExp(
    `\\b(?:lean|leans|leaning|edge|prefer|like)\\b[^.]{0,48}\\b${escapedTeam}\\b|\\b${escapedTeam}\\b[^.]{0,24}\\b(?:lean|edge)\\b`,
    "i",
  ).test(rationale.toLowerCase());
}

function hasContradictoryRationale(g: SlateGame): boolean {
  const predicted = g.prediction.toLowerCase();
  const opposite = predicted === g.away.toLowerCase() ? g.home : g.away;
  return rationaleSignalsTeam(g.rationale, opposite) && !rationaleSignalsTeam(g.rationale, g.prediction);
}

function baseDecisionStatus(
  g: SlateGame,
  lineupPosting: LineupPosting,
  hasManualArtifact: boolean,
): DecisionStatus {
  const rank = tierRank(g.decisionTier);
  if (
    rank >= 4 &&
    g.edgeOnPickPct >= STRONG_EDGE_PCT &&
    lineupPosting === "posted" &&
    !hasManualArtifact
  ) {
    return "bet";
  }
  if (rank >= 2 && g.edgeOnPickPct >= ACTIONABLE_EDGE_PCT && lineupPosting !== "projected") {
    return "small/conditional";
  }
  return "pass";
}

function deriveDecision(game: SlateGame): DerivedDecision {
  const flags = parseFlags(game.flags);
  const lineupPosting = classifyLineupPosting(game, flags);
  const hasManualArtifact = hasContradictoryRationale(game);
  const status = baseDecisionStatus(game, lineupPosting, hasManualArtifact);

  return {
    game,
    flags,
    lineupPosting,
    hasLineupRisk: hasLineupRiskFlag(flags) || lineupPosting !== "posted",
    hasManualArtifact,
    tierRank: tierRank(game.decisionTier),
    status,
  };
}

function compareDecisionPriority(a: DerivedDecision, b: DerivedDecision): number {
  const postingDelta = postingRank(b.lineupPosting) - postingRank(a.lineupPosting);
  if (postingDelta !== 0) return postingDelta;

  const lineupRiskDelta = Number(a.hasLineupRisk) - Number(b.hasLineupRisk);
  if (lineupRiskDelta !== 0) return lineupRiskDelta;

  const tierDelta = b.tierRank - a.tierRank;
  if (tierDelta !== 0) return tierDelta;

  const edgeDelta = b.game.edgeOnPickPct - a.game.edgeOnPickPct;
  if (edgeDelta !== 0) return edgeDelta;

  const manualArtifactDelta = Number(a.hasManualArtifact) - Number(b.hasManualArtifact);
  if (manualArtifactDelta !== 0) return manualArtifactDelta;

  return confidenceRank(b.game.analystConfidence) - confidenceRank(a.game.analystConfidence);
}

function formatEdge(edgePct: number): string {
  return `${edgePct > 0 ? "+" : ""}${edgePct.toFixed(2)}%`;
}

function lineupPostingLabel(posting: LineupPosting): string {
  if (posting === "posted") return "posted lineups";
  if (posting === "mixed") return "mixed lineups";
  return "projected lineups";
}

function humanizeFlag(flag: string): string | null {
  if (flag === "approx_market_ml") return null;
  if (flag === "lineup_not_posted_api") return "lineups not fully posted";
  if (flag === "away lu") return "away lineup still projected";
  if (flag === "corbin_platoons") return "platoon volatility";
  if (flag === "oak_coliseum_env") return "park/environment uncertainty";
  return flag.replace(/_/g, " ");
}

function firstNonMarketFlag(flags: string[]): string | null {
  for (const flag of flags) {
    const label = humanizeFlag(flag);
    if (label) return label;
  }
  return null;
}

function extractRationaleCue(g: SlateGame, hasManualArtifact: boolean): string | null {
  if (hasManualArtifact) return null;

  const rationale = g.rationale.toLowerCase();
  if (rationale.includes("coin flip")) return "coin-flip profile";
  if (rationale.includes("ace duel")) return "ace-duel pricing";
  if (rationale.includes("heavy chalk") || rationale.includes("chalk")) return "heavy chalk";
  if (rationale.includes("price") && (rationale.includes("already") || rationale.includes("reflects"))) {
    return "price looks efficient";
  }
  if (rationale.includes("props")) return "props-first setup";
  if (rationale.includes("volatility")) return "high-volatility setup";
  if (rationale.includes("pass")) return "rationale already points to pass";
  return null;
}

function buildBestBetLogic(decision: DerivedDecision): string {
  const parts = [
    lineupPostingLabel(decision.lineupPosting),
    `Tier ${decision.game.decisionTier}`,
    `${formatEdge(decision.game.edgeOnPickPct)} edge`,
    `model ${decision.game.modelConfidence.toLowerCase()}`,
  ];
  const flagNote = firstNonMarketFlag(decision.flags);
  if (flagNote) parts.push(flagNote);
  if (decision.hasManualArtifact) parts.push("stale rationale text ignored");
  return parts.join("; ");
}

function buildPassReason(decision: DerivedDecision): string {
  const reasons: string[] = [];

  if (decision.game.edgeOnPickPct <= 0) reasons.push(`pick edge ${formatEdge(decision.game.edgeOnPickPct)}`);
  if (decision.tierRank <= 1) reasons.push(`Tier ${decision.game.decisionTier} not actionable`);
  if (decision.game.edgeOnPickPct > 0 && decision.game.edgeOnPickPct < ACTIONABLE_EDGE_PCT) {
    reasons.push(`edge only ${formatEdge(decision.game.edgeOnPickPct)}`);
  }
  if (decision.lineupPosting !== "posted") reasons.push(lineupPostingLabel(decision.lineupPosting));
  if (decision.game.analystConfidence === "Low") reasons.push("analyst confidence low");

  const flagNote = firstNonMarketFlag(decision.flags);
  if (flagNote) reasons.push(flagNote);

  const rationaleCue = extractRationaleCue(decision.game, decision.hasManualArtifact);
  if (rationaleCue) reasons.push(rationaleCue);

  if (decision.hasManualArtifact) reasons.push("stale rationale text ignored");

  return `${decision.game.gameKey} - PASS (${reasons.slice(0, 3).join("; ")})`;
}

function deriveSummaryBoard(slate: SlateGame[]): {
  bestBets: string[][];
  passList: string[];
} {
  const decisions = slate.map(deriveDecision);
  const bestBets = decisions
    .filter(
      (decision) =>
        decision.status !== "pass" &&
        decision.lineupPosting !== "projected" &&
        decision.game.edgeOnPickPct > 0,
    )
    .sort(compareDecisionPriority)
    .slice(0, 3)
    .map((decision) => [
      `${decision.game.prediction} ML (${decision.status})`,
      decision.game.gameKey,
      decision.game.decisionTier,
      buildBestBetLogic(decision),
      decision.lineupPosting === "posted"
        ? decision.game.analystConfidence
        : `${decision.game.analystConfidence} / conditional`,
    ]);

  const passList = decisions
    .filter((decision) => decision.status === "pass")
    .map((decision) => buildPassReason(decision));

  return {
    bestBets:
      bestBets.length > 0
        ? bestBets
        : [["No actionable side", "-", "PASS", "All sides downgraded to pass from computed slate", "-"]],
    passList,
  };
}

function PillTag({ label, tone }: { label: string; tone?: "success" | "warning" | "info" | "neutral" }) {
  return (
    <Pill size="sm" tone={tone} active>
      {label}
    </Pill>
  );
}

function tierTone(t: string): "success" | "warning" | "info" | "neutral" {
  if (t === "PASS") return "neutral";
  if (t === "B" || t === "A" || t.startsWith("A")) return "success";
  if (t === "C") return "warning";
  return "info";
}

function confTone(c: string): "success" | "warning" | "info" | "neutral" {
  if (c === "High") return "success";
  if (c === "Medium" || c === "Medium-High") return "warning";
  return "neutral";
}

function GameCard({ g }: { g: SlateGame }) {
  const ml = `${g.away} ${g.awayAmerican > 0 ? `+${g.awayAmerican}` : g.awayAmerican} / ${g.home} ${g.homeAmerican > 0 ? `+${g.homeAmerican}` : g.homeAmerican}`;
  const pickIsHome = g.prediction === g.home;
  const propsAwayRows = g.propsAway.map((p) => [
    p.batter,
    `${p.hrPct.toFixed(1)}%`,
    `${p.tb2Pct.toFixed(1)}%`,
    p.tier,
    p.note,
  ]);
  const propsHomeRows = g.propsHome.map((p) => [
    p.batter,
    `${p.hrPct.toFixed(1)}%`,
    `${p.tb2Pct.toFixed(1)}%`,
    p.tier,
    p.note,
  ]);

  return (
    <Card collapsible defaultOpen={false}>
      <CardHeader
        trailing={
          <Row gap={6}>
            <PillTag label={ml} tone="info" />
            <PillTag label={`Tier ${g.decisionTier}`} tone={tierTone(g.decisionTier)} />
            <PillTag label={`Analyst ${g.analystConfidence}`} tone={confTone(g.analystConfidence)} />
          </Row>
        }
      >
        {`${g.away} @ ${g.home} — ${g.timeEt} ET · ${g.venue}`}
      </CardHeader>
      <CardBody>
        <Stack gap={14}>
          <H3>Game prediction</H3>
          <Grid columns={4} gap={12}>
            <Stat value={`${g.impliedAwayPct.toFixed(2)}%`} label={`${g.away} implied (no-vig)`} />
            <Stat value={`${g.impliedHomePct.toFixed(2)}%`} label={`${g.home} implied (no-vig)`} />
            <Stat value={`${g.modelAwayPct.toFixed(2)}%`} label={`${g.away} model`} />
            <Stat value={`${g.modelHomePct.toFixed(2)}%`} label={`${g.home} model`} />
          </Grid>
          <Grid columns={4} gap={12}>
            <Stat value={`${g.edgeAwayPct.toFixed(2)}%`} label={`Edge ${g.away}`} />
            <Stat value={`${g.edgeHomePct.toFixed(2)}%`} label={`Edge ${g.home}`} />
            <Stat value={g.prediction} label="Predicted side" tone="info" />
            <Stat value={`${g.edgeOnPickPct.toFixed(2)}%`} label="Edge vs market (pick)" />
          </Grid>
          <Text size="small" tone="secondary">
            Model confidence {g.modelConfidence}. Flags: {g.flags}. Pick {g.prediction}: model{" "}
            {pickIsHome ? g.modelHomePct.toFixed(2) : g.modelAwayPct.toFixed(2)}% vs implied{" "}
            {pickIsHome ? g.impliedHomePct.toFixed(2) : g.impliedAwayPct.toFixed(2)}%.
          </Text>
          <Text size="small">{g.rationale}</Text>

          <Divider />
          <H3>Starting pitchers</H3>
          <Grid columns={2} gap={12}>
            <Stack gap={6}>
              <Text weight="semibold">
                {g.away}: {g.awaySp}
              </Text>
              {g.spAwayNotes.map((line) => (
                <Text key={line} size="small" tone="secondary">
                  • {line}
                </Text>
              ))}
            </Stack>
            <Stack gap={6}>
              <Text weight="semibold">
                {g.home}: {g.homeSp}
              </Text>
              {g.spHomeNotes.map((line) => (
                <Text key={line} size="small" tone="secondary">
                  • {line}
                </Text>
              ))}
            </Stack>
          </Grid>

          <Divider />
          <H3>Lineups</H3>
          <Grid columns={2} gap={12}>
            <Stack gap={4}>
              <Text weight="semibold">
                {g.away} — {g.awayLuLabel}
              </Text>
              <Table headers={["#", "Hitter", "Pos"]} rows={g.awayLineup} striped stickyHeader />
            </Stack>
            <Stack gap={4}>
              <Text weight="semibold">
                {g.home} — {g.homeLuLabel}
              </Text>
              <Table headers={["#", "Hitter", "Pos"]} rows={g.homeLineup} striped stickyHeader />
            </Stack>
          </Grid>

          <Divider />
          <H3>Matchup intelligence</H3>
          <Stack gap={6}>
            {g.matchupBullets.map((b) => (
              <Text key={b} size="small">
                • {b}
              </Text>
            ))}
          </Stack>

          <Divider />
          <H3>Prop targets (model priors — add book price for +EV)</H3>
          <Text size="small" tone="secondary">
            HR% and 2+ TB% are internal Black Sheep estimates aligned with export CSV. Market HR column is NA until you paste a real line.
          </Text>
          <Grid columns={2} gap={12}>
            <Stack gap={4}>
              <Text weight="semibold">{g.away}</Text>
              <Table
                headers={["Batter", "HR%", "2+ TB%", "Tier", "Notes"]}
                rows={propsAwayRows}
                framed={false}
              />
            </Stack>
            <Stack gap={4}>
              <Text weight="semibold">{g.home}</Text>
              <Table
                headers={["Batter", "HR%", "2+ TB%", "Tier", "Notes"]}
                rows={propsHomeRows}
                framed={false}
              />
            </Stack>
          </Grid>
        </Stack>
      </CardBody>
    </Card>
  );
}

function allPropRows(): { batter: string; game: string; hr: number; tb2: number; tier: string }[] {
  const out: { batter: string; game: string; hr: number; tb2: number; tier: string }[] = [];
  for (const g of SLATE) {
    for (const p of [...g.propsAway, ...g.propsHome]) {
      out.push({ batter: p.batter, game: g.gameKey, hr: p.hrPct, tb2: p.tb2Pct, tier: p.tier });
    }
  }
  return out;
}

export default function Apr16Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 16, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-16
      </Text>

      <Divider />
      <H2>Global board</H2>

      <H3>Top HR targets (model)</H3>
      <Table
        headers={["Rank", "Batter", "Game", "HR%", "Tier"]}
        rows={topHr.map((r, i) => [String(i + 1), r.batter, r.game, `${r.hr.toFixed(1)}%`, r.tier])}
      />

      <H3>Top 2+ TB targets (model)</H3>
      <Table
        headers={["Rank", "Batter", "Game", "2+ TB%", "Tier"]}
        rows={topTb.map((r, i) => [String(i + 1), r.batter, r.game, `${r.tb2.toFixed(1)}%`, r.tier])}
      />

      <H3>Best game bets (process — verify price)</H3>
      <Table headers={["Lean", "Game", "Tier", "Logic", "Confidence"]} rows={bestBets} />

      <H3>Pass list (sides)</H3>
      <Stack gap={4}>
        {passList.map((p) => (
          <Text key={p} size="small">
            • {p}
          </Text>
        ))}
      </Stack>

      <Divider />
      <H2>Game cards</H2>
      <Stack gap={16}>
        {SLATE.map((g) => (
          <GameCard key={g.gameKey} g={g} />
        ))}
      </Stack>
    </Stack>
  );
}

/*
Export marker blocks for canvases/exports/build_ml_exports.py (matched as substrings in this file).

<!-- games-csv:start -->
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary
2026-04-16,WSH,PIT,12:35 PM,Foster Griffin,Braxton Ashcraft,118,-132,44.64,55.36,27.32,72.68,-17.31,17.31,PIT,A+,17.31,High,approx_market_ml,Medium,Probables Griffin (WSH) and Ashcraft (PIT) look like swing/spot roles without big separator stuff. PNC is slightly pitcher-friendly; Pirates get a small home edge but the price is close to fair.
2026-04-16,SF,CIN,12:40 PM,Landen Roupp,Chase Burns,128,-148,42.36,57.64,63.03,36.97,20.66,-20.66,SF,A+,20.66,High,approx_market_ml,Medium-High,"Burns at home brings premium velocity; Roupp works contact and weak barrels. GABP raises HR/TB volatility — lean Reds, but mostly a props/team-total environment."
2026-04-16,KC,DET,1:10 PM,Kris Bubic,Keider Montero,108,-124,46.48,53.52,27.58,72.42,-18.90,18.90,DET,A+,18.90,High,approx_market_ml,Medium,Bubic vs Montero is young-starter volatility; Comerica trims some extra-base noise. Slight DET home lean without a commanding pitching edge.
2026-04-16,LAA,NYY,1:35 PM,Brent Suter,Max Fried,205,-245,31.59,68.41,36.05,63.95,4.46,-4.46,NYY,D,-4.46,High,approx_market_ml,High,Suter vs Fried is a massive talent mismatch; short porch amplifies fly-ball damage. Market already prices a big NYY edge — PASS on ML unless you have a materially better number.
2026-04-16,TOR,MIL,1:40 PM,Patrick Corbin,Brandon Sproat,-102,-108,49.30,50.70,50.70,49.30,1.40,-1.40,TOR,C,1.40,High,approx_market_ml;corbin_platoons,Low,"Corbin vs Sproat is command volatility on both sides; Milwaukee navigation is a hair better at home, but this is effectively a coin flip for betting."
2026-04-16,TB,CWS,2:10 PM,Steven Matz,Jordan Leasure,-142,124,56.79,43.21,51.28,48.72,-5.51,5.51,TB,D,-5.51,High,approx_market_ml,Medium,Matz’s LHP shape matters against Chicago’s lefty bats; Leasure stretched as a starter adds volatility. Rays are the cleaner roster spot — edge is modest.
2026-04-16,TEX,ATH,3:05 PM,Jack Leiter,Jacob Lopez,-118,108,52.96,47.04,40.97,59.03,-11.99,11.99,ATH,A+,11.99,High,approx_market_ml;oak_coliseum_env,Low,"Leiter vs Lopez profiles as short-leash, high-volatility. No compelling gap vs a tight market without a better posted price."
2026-04-16,BAL,CLE,6:10 PM,Shane Baz,Parker Messick,-128,118,55.03,44.97,32.92,67.08,-22.11,22.11,CLE,A+,22.11,High,approx_market_ml;lineup_not_posted_api,Medium,Baz’s stuff plays when the heater is elevated; Messick needs to limit barrels. Small lean to Baltimore’s lineup ceiling if Baz holds a normal starter workload.
2026-04-16,COL,HOU,8:10 PM,Juan Mejia,Ryan Weiss,240,-290,28.34,71.66,48.46,51.54,20.12,-20.12,HOU,D,-20.12,High,approx_market_ml;lineup_not_posted_api,High,Road Rockies vs Houston’s overall talent is a steep mismatch; Crawford Boxes pull-side HRs matter. Chalk is heavy — PASS unless you model innings/hooks differently.
2026-04-16,SEA,SD,8:40 PM,Luis Castillo,Walker Buehler,-104,-112,49.11,50.89,39.47,60.53,-9.64,9.64,SD,A+,9.64,High,approx_market_ml;lineup_not_posted_api,Medium,Castillo vs Buehler is a true ace duel; Petco suppresses offense. Side market is rightfully tight — prefer game props over ML.
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,tier,data_confidence
2026-04-16,WSH@PIT,WSH,James Wood,Braxton Ashcraft,8.23,32.00,+1116,+212,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,WSH,Luis García Jr.,Braxton Ashcraft,0.40,12.09,+24900,+727,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,WSH,Brady House,Braxton Ashcraft,0.40,6.59,+24900,+1418,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,WSH,Daylen Lile,Braxton Ashcraft,0.40,10.23,+24900,+877,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,WSH,CJ Abrams,Braxton Ashcraft,4.96,27.26,+1918,+267,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,WSH,Jacob Young,Braxton Ashcraft,0.40,13.13,+24900,+661,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,WSH,Jorbit Vivas,Braxton Ashcraft,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,WSH,Drew Millas,Braxton Ashcraft,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,WSH,Nasim Nuñez,Braxton Ashcraft,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Jake Mangum,Foster Griffin,0.40,10.26,+24900,+875,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Nick Gonzales,Foster Griffin,0.40,12.63,+24900,+692,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Oneil Cruz,Foster Griffin,11.60,39.90,+762,+151,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Marcell Ozuna,Foster Griffin,2.58,15.23,+3776,+556,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Nick Yorke,Foster Griffin,1.87,17.60,+5246,+468,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Brandon Lowe,Foster Griffin,7.00,27.00,+1329,+270,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Joey Bart,Foster Griffin,1.34,8.21,+7365,+1117,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Konnor Griffin,Foster Griffin,0.40,10.37,+24900,+864,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,WSH@PIT,PIT,Billy Cook,Foster Griffin,1.21,15.14,+8168,+560,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Luis Arraez,Chase Burns,0.40,8.51,+24900,+1076,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Willy Adames,Chase Burns,4.24,22.09,+2256,+353,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Rafael Devers,Chase Burns,3.71,18.87,+2593,+430,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Matt Chapman,Chase Burns,0.76,14.19,+13003,+605,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Jung Hoo Lee,Chase Burns,1.35,16.27,+7295,+515,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Will Brennan,Chase Burns,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Casey Schmitt,Chase Burns,6.03,28.39,+1558,+252,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Drew Gilbert,Chase Burns,7.85,26.43,+1174,+278,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-16,SF@CIN,SF,Patrick Bailey,Chase Burns,0.40,9.56,+24900,+946,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,TJ Friedl,Landen Roupp,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,Matt McLain,Landen Roupp,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,Elly De La Cruz,Landen Roupp,5.69,25.31,+1659,+295,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,Sal Stewart,Landen Roupp,6.50,27.99,+1438,+257,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,Eugenio Suárez,Landen Roupp,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,Spencer Steer,Landen Roupp,1.43,14.10,+6885,+609,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,Rece Hinds,Landen Roupp,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,Ke'Bryan Hayes,Landen Roupp,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,SF@CIN,CIN,P.J. Higgins,Landen Roupp,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Maikel Garcia,Keider Montero,0.40,14.64,+24900,+583,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Bobby Witt Jr.,Keider Montero,0.96,18.97,+10306,+427,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Vinnie Pasquantino,Keider Montero,0.40,7.08,+24900,+1312,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Salvador Perez,Keider Montero,0.40,8.06,+24900,+1140,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Carter Jensen,Keider Montero,2.49,14.07,+3912,+611,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Jonathan India,Keider Montero,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Jac Caglianone,Keider Montero,0.79,15.71,+12631,+537,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Michael Massey,Keider Montero,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,KC@DET,KC,Kyle Isbel,Keider Montero,0.40,7.18,+24900,+1293,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Gleyber Torres,Kris Bubic,0.40,8.94,+24900,+1018,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Kevin McGonigle,Kris Bubic,3.75,24.03,+2570,+316,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Jahmai Jones,Kris Bubic,0.40,7.21,+24900,+1287,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Dillon Dingler,Kris Bubic,11.68,42.42,+756,+136,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Riley Greene,Kris Bubic,5.87,30.00,+1604,+233,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Matt Vierling,Kris Bubic,2.65,14.67,+3674,+582,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Spencer Torkelson,Kris Bubic,2.19,17.15,+4459,+483,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Wenceel Pérez,Kris Bubic,1.61,6.00,+6105,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,KC@DET,DET,Javier Báez,Kris Bubic,0.99,15.69,+10040,+537,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Zach Neto,Max Fried,0.79,11.77,+12566,+750,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Mike Trout,Max Fried,9.23,35.27,+984,+184,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Jo Adell,Max Fried,0.88,16.77,+11201,+496,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Oswald Peraza,Max Fried,2.47,17.33,+3953,+477,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Vaughn Grissom,Max Fried,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Nolan Schanuel,Max Fried,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Travis d'Arnaud,Max Fried,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Josh Lowe,Max Fried,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,LAA,Bryce Teodosio,Max Fried,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,Trent Grisham,Brent Suter,2.98,18.24,+3261,+448,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,Aaron Judge,Brent Suter,12.82,41.28,+680,+142,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,Cody Bellinger,Brent Suter,1.35,15.16,+7292,+560,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,Giancarlo Stanton,Brent Suter,3.84,19.19,+2502,+421,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,Ben Rice,Brent Suter,12.57,44.23,+696,+126,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,Amed Rosario,Brent Suter,5.06,24.25,+1878,+312,NA,0.00,C,"Medium — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,Jazz Chisholm Jr.,Brent Suter,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,José Caballero,Brent Suter,0.40,7.18,+24900,+1294,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,LAA@NYY,NYY,J.C. Escarra,Brent Suter,0.40,8.71,+24900,+1048,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Davis Schneider,Brandon Sproat,3.19,15.68,+3033,+538,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Daulton Varsho,Brandon Sproat,3.62,18.83,+2664,+431,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Vladimir Guerrero Jr.,Brandon Sproat,6.04,27.35,+1556,+266,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Jesús Sánchez,Brandon Sproat,6.12,27.08,+1535,+269,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Lenyn Sosa,Brandon Sproat,1.91,16.93,+5133,+491,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Kazuma Okamoto,Brandon Sproat,3.68,17.14,+2618,+483,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Andrés Giménez,Brandon Sproat,3.88,19.01,+2479,+426,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Ernie Clement,Brandon Sproat,0.88,15.20,+11251,+558,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,TOR,Tyler Heineman,Brandon Sproat,2.16,15.52,+4536,+544,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,Brandon Lockridge,Patrick Corbin,3.20,14.42,+3020,+593,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,Brice Turang,Patrick Corbin,11.97,39.63,+735,+152,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,William Contreras,Patrick Corbin,9.51,34.48,+952,+190,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,Gary Sánchez,Patrick Corbin,17.60,49.09,+468,+104,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,Luis Rengifo,Patrick Corbin,4.18,17.15,+2290,+483,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,Luis Matos,Patrick Corbin,4.57,15.61,+2088,+541,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,Greg Jones,Patrick Corbin,3.61,10.35,+2668,+866,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,David Hamilton,Patrick Corbin,1.64,8.77,+5986,+1041,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TOR@MIL,MIL,Joey Ortiz,Patrick Corbin,4.02,15.25,+2387,+556,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Chandler Simpson,Jordan Leasure,0.40,9.68,+24900,+933,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Junior Caminero,Jordan Leasure,5.51,23.17,+1715,+332,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Cedric Mullins,Jordan Leasure,0.53,8.04,+18804,+1143,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Yandy Díaz,Jordan Leasure,5.41,26.81,+1747,+273,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Ryan Vilade,Jordan Leasure,1.19,11.82,+8314,+746,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Ben Williamson,Jordan Leasure,0.40,9.13,+24900,+995,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Jonny DeLuca,Jordan Leasure,6.10,26.32,+1541,+280,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Nick Fortes,Jordan Leasure,2.94,20.90,+3302,+378,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,TB,Taylor Walls,Jordan Leasure,2.51,17.84,+3883,+460,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Miguel Vargas,Steven Matz,4.32,18.89,+2217,+429,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Chase Meidroth,Steven Matz,2.22,17.31,+4400,+478,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Munetaka Murakami,Steven Matz,11.02,35.27,+807,+184,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Everson Pereira,Steven Matz,8.62,31.60,+1060,+216,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Edgar Quero,Steven Matz,0.40,6.18,+24900,+1519,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Tanner Murray,Steven Matz,4.27,20.07,+2240,+398,NA,0.00,C,"Medium — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Andrew Benintendi,Steven Matz,2.90,19.87,+3352,+403,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Derek Hill,Steven Matz,0.56,11.93,+17789,+739,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TB@CWS,CWS,Sam Antonacci,Steven Matz,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Brandon Nimmo,Jacob Lopez,4.06,22.45,+2363,+345,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Wyatt Langford,Jacob Lopez,0.40,8.57,+24900,+1066,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Jake Burger,Jacob Lopez,5.17,23.65,+1833,+323,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Josh Jung,Jacob Lopez,2.35,20.61,+4161,+385,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Kyle Higashioka,Jacob Lopez,1.05,12.64,+9461,+691,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Andrew McCutchen,Jacob Lopez,1.17,12.03,+8416,+731,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Sam Haggerty,Jacob Lopez,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Josh Smith,Jacob Lopez,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,TEX,Ezequiel Duran,Jacob Lopez,0.63,12.21,+15724,+719,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Jeff McNeil,Jack Leiter,1.54,15.65,+6391,+539,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Shea Langeliers,Jack Leiter,11.18,37.28,+795,+168,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Nick Kurtz,Jack Leiter,10.61,34.81,+842,+187,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Tyler Soderstrom,Jack Leiter,6.83,25.58,+1364,+291,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Jacob Wilson,Jack Leiter,0.61,12.66,+16251,+690,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Carlos Cortes,Jack Leiter,5.47,24.61,+1727,+306,NA,0.00,C,"Medium — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Lawrence Butler,Jack Leiter,5.18,22.56,+1829,+343,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Austin Wynns,Jack Leiter,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,TEX@ATH,ATH,Darell Hernaiz,Jack Leiter,0.98,8.61,+10135,+1061,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,BAL,Gunnar Henderson,Parker Messick,2.77,16.61,+3510,+502,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,BAL,Colton Cowser,Parker Messick,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,BAL,Pete Alonso,Parker Messick,1.38,14.84,+7152,+574,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,BAL,Coby Mayo,Parker Messick,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,BAL,Leody Taveras,Parker Messick,0.40,12.00,+24900,+733,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,BAL,Taylor Ward,Parker Messick,0.40,8.12,+24900,+1132,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,BAL,Samuel Basallo,Parker Messick,1.04,10.20,+9517,+880,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,BAL,Dylan Beavers,Parker Messick,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,BAL,Jeremiah Jackson,Parker Messick,3.37,18.09,+2869,+453,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,BAL@CLE,CLE,Steven Kwan,Shane Baz,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,CLE,Chase DeLauter,Shane Baz,7.22,27.92,+1285,+258,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,CLE,José Ramírez,Shane Baz,6.31,26.26,+1485,+281,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,CLE,Kyle Manzardo,Shane Baz,1.95,13.95,+5021,+617,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,CLE,George Valera,Shane Baz,3.15,26.15,+3075,+282,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,CLE,Angel Martínez,Shane Baz,2.76,18.06,+3527,+454,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,CLE,Juan Brito,Shane Baz,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,CLE,Austin Hedges,Shane Baz,0.43,13.79,+23183,+625,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-16,BAL@CLE,CLE,Brayan Rocchio,Shane Baz,0.47,11.37,+21212,+780,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-16,COL@HOU,COL,Brenton Doyle,Ryan Weiss,2.34,13.71,+4174,+629,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,COL,Ezequiel Tovar,Ryan Weiss,6.36,28.47,+1471,+251,NA,0.00,B,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,COL,Hunter Goodman,Ryan Weiss,10.46,32.39,+856,+209,NA,0.00,A,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,COL,Jordan Beck,Ryan Weiss,2.68,11.22,+3628,+791,NA,0.00,D,"Medium — real stats+savant, projected lineup"
2026-04-16,COL@HOU,COL,Mickey Moniak,Ryan Weiss,10.52,32.93,+850,+204,NA,0.00,A,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,COL,Edouard Julien,Ryan Weiss,6.20,26.72,+1513,+274,NA,0.00,B,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,COL,Willi Castro,Ryan Weiss,4.14,18.57,+2313,+438,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,COL,Tyler Freeman,Ryan Weiss,2.68,17.32,+3633,+477,NA,0.00,D,"Medium — real stats+savant, projected lineup"
2026-04-16,COL@HOU,COL,Brett Sullivan,Ryan Weiss,3.64,19.51,+2650,+412,NA,0.00,D,"Medium — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Jose Altuve,Juan Mejia,4.73,23.34,+2016,+328,NA,0.00,C,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Yordan Alvarez,Juan Mejia,15.89,54.27,+529,-119,NA,0.00,A+,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Christian Walker,Juan Mejia,7.65,29.89,+1208,+235,NA,0.00,B,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Isaac Paredes,Juan Mejia,0.40,7.01,+24900,+1326,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Carlos Correa,Juan Mejia,5.24,25.50,+1809,+292,NA,0.00,C,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Yainer Diaz,Juan Mejia,0.40,7.60,+24900,+1216,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Cam Smith,Juan Mejia,9.29,35.19,+977,+184,NA,0.00,A,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Joey Loperfido,Juan Mejia,2.62,16.47,+3719,+507,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,COL@HOU,HOU,Taylor Trammell,Juan Mejia,3.17,19.20,+3059,+421,NA,0.00,D,"Medium — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,J.P. Crawford,Walker Buehler,0.40,7.44,+24900,+1244,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,Julio Rodríguez,Walker Buehler,0.40,7.39,+24900,+1254,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,Cal Raleigh,Walker Buehler,1.58,13.27,+6242,+653,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,Josh Naylor,Walker Buehler,0.40,8.01,+24900,+1148,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,Randy Arozarena,Walker Buehler,0.49,13.71,+20256,+629,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,Dominic Canzone,Walker Buehler,6.31,27.78,+1485,+260,NA,0.00,B,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,Luke Raley,Walker Buehler,9.28,36.00,+978,+178,NA,0.00,A,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,Brendan Donovan,Walker Buehler,1.21,13.18,+8152,+659,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SEA,Connor Joe,Walker Buehler,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Fernando Tatis Jr.,Luis Castillo,6.66,28.61,+1400,+249,NA,0.00,B,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Xander Bogaerts,Luis Castillo,5.25,24.28,+1806,+312,NA,0.00,C,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Manny Machado,Luis Castillo,2.01,14.51,+4864,+589,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Jackson Merrill,Luis Castillo,6.99,27.76,+1331,+260,NA,0.00,B,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Jake Cronenworth,Luis Castillo,2.22,13.55,+4400,+638,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Ty France,Luis Castillo,4.93,23.17,+1929,+332,NA,0.00,C,"Medium — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Luis Campusano,Luis Castillo,6.02,28.79,+1560,+247,NA,0.00,B,"Medium — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Nick Castellanos,Luis Castillo,2.44,17.24,+3992,+480,NA,0.00,D,"High — real stats+savant, projected lineup"
2026-04-16,SEA@SD,SD,Miguel Andujar,Luis Castillo,2.70,21.23,+3604,+371,NA,0.00,C,"High — real stats+savant, projected lineup"
<!-- batter-outlooks-csv:end -->
*/
