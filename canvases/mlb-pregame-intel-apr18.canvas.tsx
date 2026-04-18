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
    gameKey: "KC@NYY",
    venue: "Yankee Stadium",
    away: "KC",
    home: "NYY",
    timeEt: "1:35 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 142,
    homeAmerican: -158,
    impliedAwayPct: 40.29,
    impliedHomePct: 59.71,
    modelAwayPct: 36.98,
    modelHomePct: 63.02,
    edgeAwayPct: -3.31,
    edgeHomePct: 3.31,
    prediction: "NYY",
    decisionTier: "B",
    edgeOnPickPct: 3.31,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "Yankee Stadium short porch vs contact-oriented Royals road lineup — price the chalk carefully; props and team totals often clearer than ML.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Maikel Garcia", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Vinnie Pasquantino", "1B"],
      ["4", "Jac Caglianone", "RF"],
      ["5", "Carter Jensen", "C"],
      ["6", "Michael Massey", "2B"],
      ["7", "Isaac Collins", "DH"],
      ["8", "Lane Thomas", "LF"],
      ["9", "Kyle Isbel", "CF"],
    ],
    homeLineup: [
      ["1", "Amed Rosario", "3B"],
      ["2", "Aaron Judge", "RF"],
      ["3", "Cody Bellinger", "CF"],
      ["4", "Giancarlo Stanton", "DH"],
      ["5", "Ben Rice", "1B"],
      ["6", "Randal Grichuk", "LF"],
      ["7", "Jazz Chisholm Jr.", "2B"],
      ["8", "José Caballero", "SS"],
      ["9", "J.C. Escarra", "C"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Yankee Stadium. Weather/run environment from inputs: 72F / clear / Medium."],
    propsAway: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 2.9, tb2Pct: 19.8, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 2.9, tb2Pct: 21.6, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.8, tb2Pct: 11.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 3.3, tb2Pct: 20.7, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Carter Jensen", team: "KC", hrPct: 6.1, tb2Pct: 21.2, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 7.2, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 1.2, tb2Pct: 13.3, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Amed Rosario", team: "NYY", hrPct: 7.7, tb2Pct: 30.0, tier: "B", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 14.9, tb2Pct: 44.8, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 3.6, tb2Pct: 18.9, tier: "D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 6.3, tb2Pct: 24.2, tier: "C", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Ben Rice", team: "NYY", hrPct: 15.0, tb2Pct: 49.2, tier: "A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Randal Grichuk", team: "NYY", hrPct: 0.7, tb2Pct: 6.6, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "José Caballero", team: "NYY", hrPct: 1.0, tb2Pct: 12.2, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 1.9, tb2Pct: 13.7, tier: "D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "CIN@MIN",
    venue: "Target Field",
    away: "CIN",
    home: "MIN",
    timeEt: "2:10 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
    modelAwayPct: 34.63,
    modelHomePct: 65.37,
    edgeAwayPct: -11.86,
    edgeHomePct: 11.86,
    prediction: "MIN",
    decisionTier: "A+",
    edgeOnPickPct: 11.86,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "Target Field leans pitcher-friendly early season; lean on probables and bullpen paths before trusting a big ML edge.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "TJ Friedl", "CF"],
      ["2", "Will Benson", "LF"],
      ["3", "Elly De La Cruz", "SS"],
      ["4", "Sal Stewart", "2B"],
      ["5", "Eugenio Suárez", "DH"],
      ["6", "Nathaniel Lowe", "1B"],
      ["7", "Tyler Stephenson", "C"],
      ["8", "Rece Hinds", "RF"],
      ["9", "Ke'Bryan Hayes", "3B"],
    ],
    homeLineup: [
      ["1", "Byron Buxton", "DH"],
      ["2", "Austin Martin", "RF"],
      ["3", "Josh Bell", "1B"],
      ["4", "Ryan Jeffers", "C"],
      ["5", "Luke Keaschall", "2B"],
      ["6", "Trevor Larnach", "LF"],
      ["7", "Brooks Lee", "SS"],
      ["8", "Ryan Kreidler", "CF"],
      ["9", "Tristan Gray", "3B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Target Field. Weather/run environment from inputs: 58F / roof likely / Medium."],
    propsAway: [
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Will Benson", team: "CIN", hrPct: 0.4, tb2Pct: 7.3, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 8.4, tb2Pct: 31.7, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 8.7, tb2Pct: 32.9, tier: "A", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 2.1, tb2Pct: 13.1, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Nathaniel Lowe", team: "CIN", hrPct: 0.4, tb2Pct: 8.8, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 4.4, tb2Pct: 20.7, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 8.9, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 6.4, tb2Pct: 24.1, tier: "C", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Austin Martin", team: "MIN", hrPct: 1.8, tb2Pct: 16.8, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Josh Bell", team: "MIN", hrPct: 5.8, tb2Pct: 25.7, tier: "C", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ryan Jeffers", team: "MIN", hrPct: 5.5, tb2Pct: 24.3, tier: "C", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 0.4, tb2Pct: 9.5, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 2.8, tb2Pct: 18.7, tier: "D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 1.9, tb2Pct: 11.7, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Ryan Kreidler", team: "MIN", hrPct: 11.3, tb2Pct: 40.2, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tristan Gray", team: "MIN", hrPct: 5.4, tb2Pct: 25.4, tier: "C", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "NYM@CHC",
    venue: "Wrigley Field",
    away: "NYM",
    home: "CHC",
    timeEt: "2:20 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -102,
    homeAmerican: -108,
    impliedAwayPct: 49.30,
    impliedHomePct: 50.70,
    modelAwayPct: 57.24,
    modelHomePct: 42.76,
    edgeAwayPct: 7.94,
    edgeHomePct: -7.94,
    prediction: "NYM",
    decisionTier: "A",
    edgeOnPickPct: 7.94,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "approx_market_ml",
    rationale: "Wrigley wind and cold can suppress HRs — tight market; verify probables and late lineup news.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Carson Benge", "LF"],
      ["2", "Bo Bichette", "3B"],
      ["3", "Francisco Lindor", "SS"],
      ["4", "Luis Robert Jr.", "CF"],
      ["5", "MJ Melendez", "DH"],
      ["6", "Francisco Alvarez", "C"],
      ["7", "Mark Vientos", "1B"],
      ["8", "Brett Baty", "RF"],
      ["9", "Marcus Semien", "2B"],
    ],
    homeLineup: [
      ["1", "Nico Hoerner", "2B"],
      ["2", "Michael Busch", "1B"],
      ["3", "Alex Bregman", "3B"],
      ["4", "Ian Happ", "LF"],
      ["5", "Seiya Suzuki", "RF"],
      ["6", "Moisés Ballesteros", "DH"],
      ["7", "Miguel Amaya", "C"],
      ["8", "Pete Crow-Armstrong", "CF"],
      ["9", "Dansby Swanson", "SS"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Wrigley Field. Weather/run environment from inputs: 52F / wind in / Low-Medium."],
    propsAway: [
      { batter: "Carson Benge", team: "NYM", hrPct: 1.0, tb2Pct: 10.9, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Bo Bichette", team: "NYM", hrPct: 1.3, tb2Pct: 17.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Francisco Lindor", team: "NYM", hrPct: 3.2, tb2Pct: 17.8, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luis Robert Jr.", team: "NYM", hrPct: 3.2, tb2Pct: 18.7, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "MJ Melendez", team: "NYM", hrPct: 6.3, tb2Pct: 38.9, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Francisco Alvarez", team: "NYM", hrPct: 9.9, tb2Pct: 36.2, tier: "A", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 2.5, tb2Pct: 14.9, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Brett Baty", team: "NYM", hrPct: 0.7, tb2Pct: 10.6, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Marcus Semien", team: "NYM", hrPct: 2.1, tb2Pct: 14.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 0.4, tb2Pct: 13.3, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 0.6, tb2Pct: 12.6, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ian Happ", team: "CHC", hrPct: 6.5, tb2Pct: 21.8, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 0.4, tb2Pct: 7.1, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 8.2, tb2Pct: 32.5, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Miguel Amaya", team: "CHC", hrPct: 0.6, tb2Pct: 13.1, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 1.3, tb2Pct: 13.4, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 3.3, tb2Pct: 15.6, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
    ],
  },
  {
    gameKey: "TB@PIT",
    venue: "PNC Park",
    away: "TB",
    home: "PIT",
    timeEt: "3:30 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -138,
    homeAmerican: 118,
    impliedAwayPct: 55.83,
    impliedHomePct: 44.17,
    modelAwayPct: 48.43,
    modelHomePct: 51.57,
    edgeAwayPct: -7.40,
    edgeHomePct: 7.40,
    prediction: "PIT",
    decisionTier: "A",
    edgeOnPickPct: 7.40,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "Rays talent vs Pirates home spot — check opener/bulk roles; modest ML edge only if price is wrong.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Chandler Simpson", "LF"],
      ["2", "Junior Caminero", "3B"],
      ["3", "Jonathan Aranda", "1B"],
      ["4", "Yandy Díaz", "DH"],
      ["5", "Jake Fraley", "RF"],
      ["6", "Cedric Mullins", "CF"],
      ["7", "Richie Palacios", "2B"],
      ["8", "Hunter Feduccia", "C"],
      ["9", "Taylor Walls", "SS"],
    ],
    homeLineup: [
      ["1", "Oneil Cruz", "CF"],
      ["2", "Brandon Lowe", "2B"],
      ["3", "Bryan Reynolds", "LF"],
      ["4", "Ryan O'Hearn", "RF"],
      ["5", "Marcell Ozuna", "DH"],
      ["6", "Nick Yorke", "3B"],
      ["7", "Spencer Horwitz", "1B"],
      ["8", "Konnor Griffin", "SS"],
      ["9", "Henry Davis", "C"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: PNC Park. Weather/run environment from inputs: 62F / clear / Medium."],
    propsAway: [
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Junior Caminero", team: "TB", hrPct: 0.9, tb2Pct: 12.9, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 1.8, tb2Pct: 15.9, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 1.9, tb2Pct: 19.4, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jake Fraley", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Richie Palacios", team: "TB", hrPct: 0.4, tb2Pct: 11.3, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Hunter Feduccia", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.4, tb2Pct: 6.3, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 9.7, tb2Pct: 35.6, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 5.6, tb2Pct: 24.7, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 3.5, tb2Pct: 21.2, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 4.2, tb2Pct: 24.8, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 0.4, tb2Pct: 8.9, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 0.4, tb2Pct: 13.4, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Spencer Horwitz", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 6.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Henry Davis", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "SF@WSH",
    venue: "Nationals Park",
    away: "SF",
    home: "WSH",
    timeEt: "4:05 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -112,
    homeAmerican: 102,
    impliedAwayPct: 51.62,
    impliedHomePct: 48.38,
    modelAwayPct: 53.02,
    modelHomePct: 46.98,
    edgeAwayPct: 1.39,
    edgeHomePct: -1.39,
    prediction: "SF",
    decisionTier: "C",
    edgeOnPickPct: 1.39,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Willy Adames", "SS"],
      ["2", "Luis Arraez", "2B"],
      ["3", "Matt Chapman", "3B"],
      ["4", "Rafael Devers", "1B"],
      ["5", "Casey Schmitt", "DH"],
      ["6", "Jung Hoo Lee", "RF"],
      ["7", "Heliot Ramos", "LF"],
      ["8", "Drew Gilbert", "CF"],
      ["9", "Patrick Bailey", "C"],
    ],
    homeLineup: [
      ["1", "James Wood", "RF"],
      ["2", "Luis García Jr.", "1B"],
      ["3", "José Tena", "DH"],
      ["4", "CJ Abrams", "SS"],
      ["5", "Jacob Young", "CF"],
      ["6", "Daylen Lile", "LF"],
      ["7", "Nasim Nuñez", "2B"],
      ["8", "Jorbit Vivas", "3B"],
      ["9", "Drew Millas", "C"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Nationals Park. Weather/run environment from inputs: 68F / clear / Medium."],
    propsAway: [
      { batter: "Willy Adames", team: "SF", hrPct: 3.7, tb2Pct: 19.8, tier: "D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 6.2, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.4, tb2Pct: 11.9, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Rafael Devers", team: "SF", hrPct: 3.2, tb2Pct: 16.6, tier: "D", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 5.5, tb2Pct: 26.1, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 0.8, tb2Pct: 14.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 1.5, tb2Pct: 13.3, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 7.3, tb2Pct: 24.1, tier: "C", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.4, tb2Pct: 7.3, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 12.2, tb2Pct: 39.9, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 3.4, tb2Pct: 20.0, tier: "C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "José Tena", team: "WSH", hrPct: 1.9, tb2Pct: 18.6, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 9.2, tb2Pct: 36.2, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jacob Young", team: "WSH", hrPct: 4.0, tb2Pct: 22.1, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 2.2, tb2Pct: 19.2, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "CWS@ATH",
    venue: "Oakland Coliseum",
    away: "CWS",
    home: "ATH",
    timeEt: "4:05 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
    modelAwayPct: 68.14,
    modelHomePct: 31.86,
    edgeAwayPct: 21.66,
    edgeHomePct: -21.66,
    prediction: "CWS",
    decisionTier: "A+",
    edgeOnPickPct: 21.66,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "approx_market_ml;oak_coliseum_env",
    rationale: "Oakland environment and travel spot — volatility; prefer game props unless you have a clear pitching mismatch.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Andrew Benintendi", "DH"],
      ["2", "Munetaka Murakami", "1B"],
      ["3", "Miguel Vargas", "3B"],
      ["4", "Colson Montgomery", "SS"],
      ["5", "Everson Pereira", "RF"],
      ["6", "Sam Antonacci", "LF"],
      ["7", "Chase Meidroth", "2B"],
      ["8", "Tristan Peters", "CF"],
      ["9", "Reese McGuire", "C"],
    ],
    homeLineup: [
      ["1", "Jeff McNeil", "2B"],
      ["2", "Shea Langeliers", "DH"],
      ["3", "Nick Kurtz", "1B"],
      ["4", "Tyler Soderstrom", "LF"],
      ["5", "Jacob Wilson", "SS"],
      ["6", "Carlos Cortes", "RF"],
      ["7", "Max Muncy", "3B"],
      ["8", "Lawrence Butler", "CF"],
      ["9", "Austin Wynns", "C"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Oakland Coliseum. Weather/run environment from inputs: 66F / marine air / Low-Medium."],
    propsAway: [
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 4.8, tb2Pct: 23.2, tier: "C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 12.0, tb2Pct: 37.1, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 3.5, tb2Pct: 17.9, tier: "D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 2.5, tb2Pct: 11.7, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 8.7, tb2Pct: 31.2, tier: "B", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 2.2, tb2Pct: 16.4, tier: "D", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Tristan Peters", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Reese McGuire", team: "CWS", hrPct: 0.4, tb2Pct: 6.4, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.4, tb2Pct: 10.2, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 6.5, tb2Pct: 27.7, tier: "B", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 5.4, tb2Pct: 24.1, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 2.1, tb2Pct: 16.0, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 1.6, tb2Pct: 16.3, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Max Muncy", team: "ATH", hrPct: 4.9, tb2Pct: 25.3, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 1.5, tb2Pct: 14.8, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Austin Wynns", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "DET@BOS",
    venue: "Fenway Park",
    away: "DET",
    home: "BOS",
    timeEt: "4:10 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 118,
    homeAmerican: -132,
    impliedAwayPct: 44.64,
    impliedHomePct: 55.36,
    modelAwayPct: 59.89,
    modelHomePct: 40.11,
    edgeAwayPct: 15.26,
    edgeHomePct: -15.26,
    prediction: "DET",
    decisionTier: "A+",
    edgeOnPickPct: 15.26,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "Fenway doubles and wall-ball noise — model park correctly before trusting a big ML number.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Kevin McGonigle", "3B"],
      ["2", "Gleyber Torres", "2B"],
      ["3", "Colt Keith", "DH"],
      ["4", "Riley Greene", "LF"],
      ["5", "Spencer Torkelson", "1B"],
      ["6", "Kerry Carpenter", "RF"],
      ["7", "Wenceel Pérez", "CF"],
      ["8", "Javier Báez", "SS"],
      ["9", "Jake Rogers", "C"],
    ],
    homeLineup: [
      ["1", "Roman Anthony", "LF"],
      ["2", "Andruw Monasterio", "SS"],
      ["3", "Willson Contreras", "1B"],
      ["4", "Trevor Story", "DH"],
      ["5", "Wilyer Abreu", "RF"],
      ["6", "Ceddanne Rafaela", "CF"],
      ["7", "Caleb Durbin", "3B"],
      ["8", "Connor Wong", "C"],
      ["9", "Isiah Kiner-Falefa", "2B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Fenway Park. Weather/run environment from inputs: 58F / clear / Medium."],
    propsAway: [
      { batter: "Kevin McGonigle", team: "DET", hrPct: 5.0, tb2Pct: 26.3, tier: "B", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.4, tb2Pct: 12.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Colt Keith", team: "DET", hrPct: 6.1, tb2Pct: 28.9, tier: "B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Riley Greene", team: "DET", hrPct: 6.4, tb2Pct: 29.6, tier: "B", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 3.7, tb2Pct: 19.6, tier: "D", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Kerry Carpenter", team: "DET", hrPct: 7.9, tb2Pct: 25.2, tier: "B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 2.4, tb2Pct: 6.6, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Javier Báez", team: "DET", hrPct: 1.3, tb2Pct: 15.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jake Rogers", team: "DET", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 3.3, tb2Pct: 20.1, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Andruw Monasterio", team: "BOS", hrPct: 0.5, tb2Pct: 13.4, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 5.5, tb2Pct: 25.0, tier: "C", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.8, tb2Pct: 12.2, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 5.3, tb2Pct: 25.5, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 0.5, tb2Pct: 12.3, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Connor Wong", team: "BOS", hrPct: 3.4, tb2Pct: 28.1, tier: "B", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Isiah Kiner-Falefa", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "MIL@MIA",
    venue: "loanDepot park",
    away: "MIL",
    home: "MIA",
    timeEt: "4:10 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -118,
    homeAmerican: 108,
    impliedAwayPct: 52.96,
    impliedHomePct: 47.04,
    modelAwayPct: 43.84,
    modelHomePct: 56.16,
    edgeAwayPct: -9.12,
    edgeHomePct: 9.12,
    prediction: "MIA",
    decisionTier: "A+",
    edgeOnPickPct: 9.12,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "Miami run suppression helps pitching — lean Brewers only if the price matches your starter read.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Sal Frelick", "RF"],
      ["2", "William Contreras", "C"],
      ["3", "Brice Turang", "2B"],
      ["4", "Gary Sánchez", "DH"],
      ["5", "Jake Bauers", "1B"],
      ["6", "Luis Rengifo", "3B"],
      ["7", "Garrett Mitchell", "CF"],
      ["8", "Brandon Lockridge", "LF"],
      ["9", "Joey Ortiz", "SS"],
    ],
    homeLineup: [
      ["1", "Jakob Marsee", "CF"],
      ["2", "Xavier Edwards", "2B"],
      ["3", "Agustín Ramírez", "DH"],
      ["4", "Liam Hicks", "C"],
      ["5", "Otto Lopez", "SS"],
      ["6", "Connor Norby", "1B"],
      ["7", "Owen Caissie", "RF"],
      ["8", "Heriberto Hernández", "LF"],
      ["9", "Javier Sanoja", "3B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: loanDepot park. Weather/run environment from inputs: retractable roof / humid / Low-Medium."],
    propsAway: [
      { batter: "Sal Frelick", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "William Contreras", team: "MIL", hrPct: 0.8, tb2Pct: 16.8, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Brice Turang", team: "MIL", hrPct: 3.9, tb2Pct: 23.4, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 7.6, tb2Pct: 29.2, tier: "B", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 4.9, tb2Pct: 23.1, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 4.3, tb2Pct: 23.9, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 1.4, tb2Pct: 18.5, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 0.4, tb2Pct: 8.4, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 2.7, tb2Pct: 18.2, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 5.9, tb2Pct: 29.0, tier: "B", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Connor Norby", team: "MIA", hrPct: 0.5, tb2Pct: 11.7, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 5.6, tb2Pct: 23.8, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Heriberto Hernández", team: "MIA", hrPct: 0.4, tb2Pct: 8.2, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Javier Sanoja", team: "MIA", hrPct: 0.4, tb2Pct: 9.4, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "BAL@CLE",
    venue: "Progressive Field",
    away: "BAL",
    home: "CLE",
    timeEt: "6:10 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -108,
    homeAmerican: -102,
    impliedAwayPct: 50.70,
    impliedHomePct: 49.30,
    modelAwayPct: 53.24,
    modelHomePct: 46.76,
    edgeAwayPct: 2.54,
    edgeHomePct: -2.54,
    prediction: "BAL",
    decisionTier: "B",
    edgeOnPickPct: 2.54,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "approx_market_ml",
    rationale: "Progressive Field — coin-flip pricing common; prioritize handedness and bullpen availability.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Gunnar Henderson", "SS"],
      ["2", "Taylor Ward", "LF"],
      ["3", "Pete Alonso", "1B"],
      ["4", "Dylan Beavers", "RF"],
      ["5", "Colton Cowser", "DH"],
      ["6", "Leody Taveras", "CF"],
      ["7", "Samuel Basallo", "C"],
      ["8", "Coby Mayo", "3B"],
      ["9", "Jeremiah Jackson", "2B"],
    ],
    homeLineup: [
      ["1", "Steven Kwan", "CF"],
      ["2", "Chase DeLauter", "RF"],
      ["3", "José Ramírez", "3B"],
      ["4", "Kyle Manzardo", "1B"],
      ["5", "George Valera", "LF"],
      ["6", "Rhys Hoskins", "DH"],
      ["7", "Daniel Schneemann", "2B"],
      ["8", "Bo Naylor", "C"],
      ["9", "Brayan Rocchio", "SS"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Progressive Field. Weather/run environment from inputs: 52F / clear / Medium."],
    propsAway: [
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 7.3, tb2Pct: 25.7, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.4, tb2Pct: 13.1, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 3.9, tb2Pct: 20.1, tier: "C", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 0.6, tb2Pct: 11.4, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Colton Cowser", team: "BAL", hrPct: 0.4, tb2Pct: 9.1, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 1.4, tb2Pct: 17.8, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 4.6, tb2Pct: 17.5, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 6.2, tb2Pct: 24.4, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 7.1, tb2Pct: 28.4, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "José Ramírez", team: "CLE", hrPct: 4.5, tb2Pct: 23.4, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 1.9, tb2Pct: 13.9, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "George Valera", team: "CLE", hrPct: 3.0, tb2Pct: 25.8, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 2.6, tb2Pct: 15.0, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 5.9, tb2Pct: 29.0, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Bo Naylor", team: "CLE", hrPct: 2.4, tb2Pct: 17.5, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.4, tb2Pct: 10.1, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "STL@HOU",
    venue: "Minute Maid Park",
    away: "STL",
    home: "HOU",
    timeEt: "7:10 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 155,
    homeAmerican: -175,
    impliedAwayPct: 38.13,
    impliedHomePct: 61.87,
    modelAwayPct: 42.78,
    modelHomePct: 57.22,
    edgeAwayPct: 4.65,
    edgeHomePct: -4.65,
    prediction: "HOU",
    decisionTier: "D",
    edgeOnPickPct: -4.65,
    modelConfidence: "High",
    analystConfidence: "Medium-High",
    flags: "approx_market_ml",
    rationale: "Astros home talent vs Cardinals road — market often prices Houston heavy; PASS unless you see a real innings edge.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "JJ Wetherholt", "2B"],
      ["2", "Iván Herrera", "C"],
      ["3", "Alec Burleson", "1B"],
      ["4", "Jordan Walker", "RF"],
      ["5", "Nolan Gorman", "DH"],
      ["6", "Masyn Winn", "SS"],
      ["7", "Ramón Urías", "3B"],
      ["8", "Nathan Church", "CF"],
      ["9", "José Fermín", "LF"],
    ],
    homeLineup: [
      ["1", "Jose Altuve", "2B"],
      ["2", "Yordan Alvarez", "LF"],
      ["3", "Carlos Correa", "3B"],
      ["4", "Christian Walker", "1B"],
      ["5", "Isaac Paredes", "DH"],
      ["6", "Taylor Trammell", "CF"],
      ["7", "Cam Smith", "RF"],
      ["8", "Christian Vázquez", "C"],
      ["9", "Nick Allen", "SS"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Minute Maid Park. Weather/run environment from inputs: retractable roof / warm / Medium."],
    propsAway: [
      { batter: "JJ Wetherholt", team: "STL", hrPct: 3.3, tb2Pct: 16.8, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Iván Herrera", team: "STL", hrPct: 4.8, tb2Pct: 25.1, tier: "C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Alec Burleson", team: "STL", hrPct: 7.5, tb2Pct: 32.4, tier: "A", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Jordan Walker", team: "STL", hrPct: 14.8, tb2Pct: 47.9, tier: "A+", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 2.4, tb2Pct: 12.2, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.4, tb2Pct: 6.6, tier: "D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Ramón Urías", team: "STL", hrPct: 5.2, tb2Pct: 23.1, tier: "C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Nathan Church", team: "STL", hrPct: 0.7, tb2Pct: 9.8, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "José Fermín", team: "STL", hrPct: 0.4, tb2Pct: 8.2, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Jose Altuve", team: "HOU", hrPct: 4.4, tb2Pct: 21.9, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 15.7, tb2Pct: 53.5, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Carlos Correa", team: "HOU", hrPct: 5.1, tb2Pct: 24.3, tier: "C", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Christian Walker", team: "HOU", hrPct: 7.5, tb2Pct: 29.0, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 6.3, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 3.0, tb2Pct: 18.5, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Cam Smith", team: "HOU", hrPct: 8.9, tb2Pct: 33.6, tier: "A", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Christian Vázquez", team: "HOU", hrPct: 10.0, tb2Pct: 42.4, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nick Allen", team: "HOU", hrPct: 2.0, tb2Pct: 14.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "TEX@SEA",
    venue: "T-Mobile Park",
    away: "TEX",
    home: "SEA",
    timeEt: "7:15 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
    modelAwayPct: 40.51,
    modelHomePct: 59.49,
    edgeAwayPct: -5.97,
    edgeHomePct: 5.97,
    prediction: "SEA",
    decisionTier: "A",
    edgeOnPickPct: 5.97,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "T-Mobile Park suppresses offense — pitching duel pricing; props and totals often cleaner.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Brandon Nimmo", "RF"],
      ["2", "Corey Seager", "SS"],
      ["3", "Wyatt Langford", "LF"],
      ["4", "Jake Burger", "1B"],
      ["5", "Joc Pederson", "DH"],
      ["6", "Josh Jung", "3B"],
      ["7", "Evan Carter", "CF"],
      ["8", "Ezequiel Duran", "2B"],
      ["9", "Kyle Higashioka", "C"],
    ],
    homeLineup: [
      ["1", "J.P. Crawford", "SS"],
      ["2", "Cal Raleigh", "C"],
      ["3", "Julio Rodríguez", "CF"],
      ["4", "Josh Naylor", "1B"],
      ["5", "Randy Arozarena", "LF"],
      ["6", "Luke Raley", "RF"],
      ["7", "Dominic Canzone", "DH"],
      ["8", "Cole Young", "2B"],
      ["9", "Leo Rivas", "3B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: T-Mobile Park. Weather/run environment from inputs: 54F / roof closed likely / Low-Medium."],
    propsAway: [
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 3.5, tb2Pct: 20.7, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Corey Seager", team: "TEX", hrPct: 4.8, tb2Pct: 21.0, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.4, tb2Pct: 8.3, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Jake Burger", team: "TEX", hrPct: 4.3, tb2Pct: 21.8, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.4, tb2Pct: 6.8, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Josh Jung", team: "TEX", hrPct: 0.4, tb2Pct: 17.5, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Evan Carter", team: "TEX", hrPct: 1.4, tb2Pct: 14.5, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ezequiel Duran", team: "TEX", hrPct: 0.4, tb2Pct: 14.6, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Kyle Higashioka", team: "TEX", hrPct: 1.6, tb2Pct: 15.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.4, tb2Pct: 9.3, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 1.5, tb2Pct: 12.4, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 1.4, tb2Pct: 14.1, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.4, tb2Pct: 8.6, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.9, tb2Pct: 14.6, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Luke Raley", team: "SEA", hrPct: 10.2, tb2Pct: 39.3, tier: "A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 6.9, tb2Pct: 29.0, tier: "B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.8, tb2Pct: 12.0, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "ATL@PHI",
    venue: "Citizens Bank Park",
    away: "ATL",
    home: "PHI",
    timeEt: "7:15 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 105,
    homeAmerican: -115,
    impliedAwayPct: 47.70,
    impliedHomePct: 52.30,
    modelAwayPct: 40.09,
    modelHomePct: 59.91,
    edgeAwayPct: -7.61,
    edgeHomePct: 7.61,
    prediction: "PHI",
    decisionTier: "A",
    edgeOnPickPct: 7.61,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "NL East heavyweight pricing — small edges only; watch weather and late scratches.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Ronald Acuña Jr.", "RF"],
      ["2", "Drake Baldwin", "DH"],
      ["3", "Ozzie Albies", "2B"],
      ["4", "Matt Olson", "1B"],
      ["5", "Austin Riley", "3B"],
      ["6", "Mauricio Dubón", "LF"],
      ["7", "Eli White", "CF"],
      ["8", "Jonah Heim", "C"],
      ["9", "Jorge Mateo", "SS"],
    ],
    homeLineup: [
      ["1", "Trea Turner", "SS"],
      ["2", "Kyle Schwarber", "DH"],
      ["3", "Bryce Harper", "1B"],
      ["4", "Adolis García", "RF"],
      ["5", "J.T. Realmuto", "C"],
      ["6", "Alec Bohm", "3B"],
      ["7", "Felix Reyes", "LF"],
      ["8", "Edmundo Sosa", "2B"],
      ["9", "Brandon Marsh", "CF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Citizens Bank Park. Weather/run environment from inputs: 62F / clear / Medium-High."],
    propsAway: [
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 4.2, tb2Pct: 23.9, tier: "C", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 5.9, tb2Pct: 28.0, tier: "B", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.7, tb2Pct: 13.0, tier: "D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Matt Olson", team: "ATL", hrPct: 10.1, tb2Pct: 35.9, tier: "A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Austin Riley", team: "ATL", hrPct: 4.9, tb2Pct: 23.0, tier: "C", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 1.9, tb2Pct: 17.7, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Eli White", team: "ATL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jonah Heim", team: "ATL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jorge Mateo", team: "ATL", hrPct: 6.7, tb2Pct: 35.4, tier: "A", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 11.8, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 11.6, tb2Pct: 34.3, tier: "A", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 6.9, tb2Pct: 31.5, tier: "B", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Adolis García", team: "PHI", hrPct: 4.4, tb2Pct: 21.1, tier: "C", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "J.T. Realmuto", team: "PHI", hrPct: 0.9, tb2Pct: 14.2, tier: "D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 7.0, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Felix Reyes", team: "PHI", hrPct: 2.3, tb2Pct: 16.1, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Edmundo Sosa", team: "PHI", hrPct: 2.4, tb2Pct: 16.2, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 3.4, tb2Pct: 22.2, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "LAD@COL",
    venue: "Coors Field",
    away: "LAD",
    home: "COL",
    timeEt: "8:10 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -185,
    homeAmerican: 165,
    impliedAwayPct: 63.24,
    impliedHomePct: 36.76,
    modelAwayPct: 54.41,
    modelHomePct: 45.59,
    edgeAwayPct: -8.83,
    edgeHomePct: 8.83,
    prediction: "LAD",
    decisionTier: "D",
    edgeOnPickPct: -8.83,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
    rationale: "Coors elevates variance — Dodgers talent priced in; Rockies bats can still pop in chunks.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Shohei Ohtani", "DH"],
      ["2", "Kyle Tucker", "RF"],
      ["3", "Andy Pages", "CF"],
      ["4", "Freddie Freeman", "1B"],
      ["5", "Teoscar Hernández", "LF"],
      ["6", "Max Muncy", "3B"],
      ["7", "Dalton Rushing", "C"],
      ["8", "Alex Freeland", "2B"],
      ["9", "Miguel Rojas", "SS"],
    ],
    homeLineup: [
      ["1", "Edouard Julien", "2B"],
      ["2", "Mickey Moniak", "RF"],
      ["3", "TJ Rumfield", "DH"],
      ["4", "Hunter Goodman", "C"],
      ["5", "Ezequiel Tovar", "SS"],
      ["6", "Troy Johnston", "1B"],
      ["7", "Brenton Doyle", "CF"],
      ["8", "Kyle Karros", "3B"],
      ["9", "Jordan Beck", "LF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Coors Field. Weather/run environment from inputs: 52F / thin air / High."],
    propsAway: [
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 16.0, tb2Pct: 46.3, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 8.0, tb2Pct: 26.3, tier: "B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Andy Pages", team: "LAD", hrPct: 14.1, tb2Pct: 45.9, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 14.7, tb2Pct: 49.3, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 12.1, tb2Pct: 37.7, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Max Muncy", team: "LAD", hrPct: 17.1, tb2Pct: 50.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 25.0, tb2Pct: 55.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 9.0, tb2Pct: 29.4, tier: "B", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Miguel Rojas", team: "LAD", hrPct: 7.7, tb2Pct: 31.2, tier: "B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Edouard Julien", team: "COL", hrPct: 5.9, tb2Pct: 25.9, tier: "C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 9.8, tb2Pct: 30.9, tier: "B", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 5.0, tb2Pct: 23.6, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 8.4, tb2Pct: 27.4, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 5.4, tb2Pct: 26.2, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Troy Johnston", team: "COL", hrPct: 4.7, tb2Pct: 21.9, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 2.8, tb2Pct: 14.5, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Kyle Karros", team: "COL", hrPct: 3.5, tb2Pct: 18.8, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jordan Beck", team: "COL", hrPct: 2.1, tb2Pct: 9.7, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "TOR@AZ",
    venue: "Chase Field",
    away: "TOR",
    home: "AZ",
    timeEt: "8:10 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -112,
    homeAmerican: 102,
    impliedAwayPct: 51.62,
    impliedHomePct: 48.38,
    modelAwayPct: 49.81,
    modelHomePct: 50.19,
    edgeAwayPct: -1.81,
    edgeHomePct: 1.81,
    prediction: "AZ",
    decisionTier: "C",
    edgeOnPickPct: 1.81,
    modelConfidence: "Low",
    analystConfidence: "Medium",
    flags: "approx_market_ml;away LU;home LU",
    rationale: "Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge.",
    awayLuLabel: "Projected — run compute",
    homeLuLabel: "Projected — run compute",
    awayLineup: [],
    homeLineup: [],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Chase Field. Weather/run environment from inputs: retractable roof / Medium."],
    propsAway: [],
    propsHome: [],
  },
  {
    gameKey: "SD@LAA",
    venue: "Angel Stadium",
    away: "SD",
    home: "LAA",
    timeEt: "9:38 PM",
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -128,
    homeAmerican: 118,
    impliedAwayPct: 55.03,
    impliedHomePct: 44.97,
    modelAwayPct: 49.81,
    modelHomePct: 50.19,
    edgeAwayPct: -5.22,
    edgeHomePct: 5.22,
    prediction: "LAA",
    decisionTier: "A",
    edgeOnPickPct: 5.22,
    modelConfidence: "Low",
    analystConfidence: "Medium",
    flags: "approx_market_ml;away LU;home LU",
    rationale: "Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.",
    awayLuLabel: "Projected — run compute",
    homeLuLabel: "Projected — run compute",
    awayLineup: [],
    homeLineup: [],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Angel Stadium. Weather/run environment from inputs: 68F / clear / Medium."],
    propsAway: [],
    propsHome: [],
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

export default function Apr18Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 18, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Apr 18 slate scaffold — run model refresh: python3 canvases/exports/build_ml_exports.py --date 2026-04-18 --compute
        (pulls probables/lineups from MLB Stats API + Savant, updates SLATE + CSV markers). Moneylines in inputs are approximate.
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
<!-- games-csv:start -->
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary
2026-04-18,KC,NYY,1:35 PM,Noah Cameron,Will Warren,142,-158,40.29,59.71,36.98,63.02,-3.31,3.31,NYY,B,3.31,High,approx_market_ml,Medium,Yankee Stadium short porch vs contact-oriented Royals road lineup — price the chalk carefully; props and team totals often clearer than ML.
2026-04-18,CIN,MIN,2:10 PM,Andrew Abbott,Taj Bradley,108,-124,46.48,53.52,34.63,65.37,-11.86,11.86,MIN,A+,11.86,High,approx_market_ml,Medium,Target Field leans pitcher-friendly early season; lean on probables and bullpen paths before trusting a big ML edge.
2026-04-18,NYM,CHC,2:20 PM,Freddy Peralta,Jameson Taillon,-102,-108,49.30,50.70,57.24,42.76,7.94,-7.94,NYM,A,7.94,High,approx_market_ml,Low,Wrigley wind and cold can suppress HRs — tight market; verify probables and late lineup news.
2026-04-18,TB,PIT,3:30 PM,Drew Rasmussen,Paul Skenes,-138,118,55.83,44.17,48.43,51.57,-7.40,7.40,PIT,A,7.40,High,approx_market_ml,Medium,Rays talent vs Pirates home spot — check opener/bulk roles; modest ML edge only if price is wrong.
2026-04-18,SF,WSH,4:05 PM,Adrian Houser,Cade Cavalli,-112,102,51.62,48.38,53.02,46.98,1.39,-1.39,SF,C,1.39,High,approx_market_ml,Medium,Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites.
2026-04-18,CWS,ATH,4:05 PM,Erick Fedde,Luis Severino,108,-124,46.48,53.52,68.14,31.86,21.66,-21.66,CWS,A+,21.66,High,approx_market_ml;oak_coliseum_env,Low,Oakland environment and travel spot — volatility; prefer game props unless you have a clear pitching mismatch.
2026-04-18,DET,BOS,4:10 PM,Tarik Skubal,Brayan Bello,118,-132,44.64,55.36,59.89,40.11,15.26,-15.26,DET,A+,15.26,High,approx_market_ml,Medium,Fenway doubles and wall-ball noise — model park correctly before trusting a big ML number.
2026-04-18,MIL,MIA,4:10 PM,Brandon Woodruff,Sandy Alcantara,-118,108,52.96,47.04,43.84,56.16,-9.12,9.12,MIA,A+,9.12,High,approx_market_ml,Medium,Miami run suppression helps pitching — lean Brewers only if the price matches your starter read.
2026-04-18,BAL,CLE,6:10 PM,Dean Kremer,Gavin Williams,-108,-102,50.70,49.30,53.24,46.76,2.54,-2.54,BAL,B,2.54,High,approx_market_ml,Low,Progressive Field — coin-flip pricing common; prioritize handedness and bullpen availability.
2026-04-18,STL,HOU,7:10 PM,Andre Pallante,Lance McCullers Jr.,155,-175,38.13,61.87,42.78,57.22,4.65,-4.65,HOU,D,-4.65,High,approx_market_ml,Medium-High,Astros home talent vs Cardinals road — market often prices Houston heavy; PASS unless you see a real innings edge.
2026-04-18,TEX,SEA,7:15 PM,Nathan Eovaldi,George Kirby,108,-124,46.48,53.52,40.51,59.49,-5.97,5.97,SEA,A,5.97,High,approx_market_ml,Medium,T-Mobile Park suppresses offense — pitching duel pricing; props and totals often cleaner.
2026-04-18,ATL,PHI,7:15 PM,Chris Sale,Cristopher Sánchez,105,-115,47.70,52.30,40.09,59.91,-7.61,7.61,PHI,A,7.61,High,approx_market_ml,Medium,NL East heavyweight pricing — small edges only; watch weather and late scratches.
2026-04-18,LAD,COL,8:10 PM,Emmet Sheehan,Ryan Feltner,-185,165,63.24,36.76,54.41,45.59,-8.83,8.83,LAD,D,-8.83,High,approx_market_ml,Medium,Coors elevates variance — Dodgers talent priced in; Rockies bats can still pop in chunks.
2026-04-18,TOR,AZ,8:10 PM,Max Scherzer,Zac Gallen,-112,102,51.62,48.38,49.81,50.19,-1.81,1.81,AZ,C,1.81,Low,approx_market_ml;away LU;home LU,Medium,Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge.
2026-04-18,SD,LAA,9:38 PM,Germán Márquez,Yusei Kikuchi,-128,118,55.03,44.97,49.81,50.19,-5.22,5.22,LAA,A,5.22,Low,approx_market_ml;away LU;home LU,Medium,Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,tier,data_confidence
2026-04-18,KC@NYY,KC,Maikel Garcia,Will Warren,2.91,19.77,+3342,+406,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,KC,Bobby Witt Jr.,Will Warren,2.90,21.62,+3350,+362,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,KC,Vinnie Pasquantino,Will Warren,0.82,11.02,+12054,+807,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,KC,Jac Caglianone,Will Warren,3.34,20.72,+2894,+383,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,KC,Carter Jensen,Will Warren,6.09,21.23,+1541,+371,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,KC,Michael Massey,Will Warren,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,KC@NYY,KC,Isaac Collins,Will Warren,0.40,7.16,+24900,+1296,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,KC,Lane Thomas,Will Warren,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,KC,Kyle Isbel,Will Warren,1.18,13.34,+8353,+650,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,Amed Rosario,Noah Cameron,7.73,30.00,+1194,+233,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,Aaron Judge,Noah Cameron,14.95,44.78,+569,+123,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,Cody Bellinger,Noah Cameron,3.58,18.93,+2695,+428,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,Giancarlo Stanton,Noah Cameron,6.29,24.17,+1489,+314,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,Ben Rice,Noah Cameron,15.02,49.21,+566,+103,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,Randal Grichuk,Noah Cameron,0.70,6.56,+14206,+1425,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,Jazz Chisholm Jr.,Noah Cameron,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,José Caballero,Noah Cameron,1.02,12.15,+9680,+723,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,KC@NYY,NYY,J.C. Escarra,Noah Cameron,1.91,13.69,+5122,+630,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,TJ Friedl,Taj Bradley,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,Will Benson,Taj Bradley,0.40,7.27,+24900,+1276,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,Elly De La Cruz,Taj Bradley,8.37,31.72,+1095,+215,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,Sal Stewart,Taj Bradley,8.73,32.86,+1045,+204,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,Eugenio Suárez,Taj Bradley,2.15,13.11,+4556,+663,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,Nathaniel Lowe,Taj Bradley,0.40,8.83,+24900,+1033,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,Tyler Stephenson,Taj Bradley,4.42,20.70,+2161,+383,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,Rece Hinds,Taj Bradley,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,CIN,Ke'Bryan Hayes,Taj Bradley,0.40,8.90,+24900,+1024,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Byron Buxton,Andrew Abbott,6.40,24.14,+1461,+314,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Austin Martin,Andrew Abbott,1.84,16.75,+5347,+497,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Josh Bell,Andrew Abbott,5.76,25.70,+1635,+289,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Ryan Jeffers,Andrew Abbott,5.49,24.25,+1722,+312,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Luke Keaschall,Andrew Abbott,0.40,9.49,+24900,+954,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Trevor Larnach,Andrew Abbott,2.84,18.73,+3427,+434,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Brooks Lee,Andrew Abbott,1.94,11.67,+5050,+757,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Ryan Kreidler,Andrew Abbott,11.30,40.24,+785,+149,NA,0.00,A+,"Medium — real stats+savant, posted lineup"
2026-04-18,CIN@MIN,MIN,Tristan Gray,Andrew Abbott,5.36,25.36,+1767,+294,NA,0.00,C,"Medium — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,Carson Benge,Jameson Taillon,1.04,10.86,+9494,+820,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,Bo Bichette,Jameson Taillon,1.32,17.21,+7463,+481,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,Francisco Lindor,Jameson Taillon,3.17,17.80,+3050,+462,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,Luis Robert Jr.,Jameson Taillon,3.17,18.74,+3051,+434,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,MJ Melendez,Jameson Taillon,6.31,38.95,+1486,+157,NA,0.00,A+,"Medium — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,Francisco Alvarez,Jameson Taillon,9.95,36.17,+905,+176,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,Mark Vientos,Jameson Taillon,2.48,14.90,+3939,+571,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,Brett Baty,Jameson Taillon,0.75,10.55,+13287,+848,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,NYM,Marcus Semien,Jameson Taillon,2.13,13.99,+4594,+615,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Nico Hoerner,Freddy Peralta,0.40,13.25,+24900,+655,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Michael Busch,Freddy Peralta,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Alex Bregman,Freddy Peralta,0.55,12.56,+18037,+696,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Ian Happ,Freddy Peralta,6.54,21.79,+1429,+359,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Seiya Suzuki,Freddy Peralta,0.40,7.15,+24900,+1299,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Moisés Ballesteros,Freddy Peralta,8.19,32.51,+1121,+208,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Miguel Amaya,Freddy Peralta,0.61,13.10,+16390,+663,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Pete Crow-Armstrong,Freddy Peralta,1.27,13.41,+7748,+646,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,NYM@CHC,CHC,Dansby Swanson,Freddy Peralta,3.29,15.59,+2941,+542,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Chandler Simpson,Paul Skenes,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Junior Caminero,Paul Skenes,0.86,12.95,+11512,+672,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Jonathan Aranda,Paul Skenes,1.80,15.90,+5465,+529,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Yandy Díaz,Paul Skenes,1.87,19.43,+5255,+415,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Jake Fraley,Paul Skenes,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Cedric Mullins,Paul Skenes,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Richie Palacios,Paul Skenes,0.40,11.30,+24900,+785,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Hunter Feduccia,Paul Skenes,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,TB@PIT,TB,Taylor Walls,Paul Skenes,0.40,6.27,+24900,+1495,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Oneil Cruz,Drew Rasmussen,9.74,35.58,+927,+181,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Brandon Lowe,Drew Rasmussen,5.59,24.67,+1688,+305,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Bryan Reynolds,Drew Rasmussen,3.45,21.23,+2795,+371,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Ryan O'Hearn,Drew Rasmussen,4.20,24.78,+2281,+303,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Marcell Ozuna,Drew Rasmussen,0.40,8.86,+24900,+1029,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Nick Yorke,Drew Rasmussen,0.40,13.43,+24900,+645,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Spencer Horwitz,Drew Rasmussen,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Konnor Griffin,Drew Rasmussen,0.40,6.23,+24900,+1506,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TB@PIT,PIT,Henry Davis,Drew Rasmussen,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Willy Adames,Cade Cavalli,3.72,19.81,+2591,+405,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Luis Arraez,Cade Cavalli,0.40,6.22,+24900,+1508,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Matt Chapman,Cade Cavalli,0.40,11.90,+24900,+740,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Rafael Devers,Cade Cavalli,3.18,16.58,+3040,+503,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Casey Schmitt,Cade Cavalli,5.50,26.11,+1717,+283,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Jung Hoo Lee,Cade Cavalli,0.82,13.98,+12047,+615,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Heliot Ramos,Cade Cavalli,1.48,13.32,+6641,+651,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Drew Gilbert,Cade Cavalli,7.32,24.14,+1266,+314,NA,0.00,C,"Medium — real stats+savant, posted lineup"
2026-04-18,SF@WSH,SF,Patrick Bailey,Cade Cavalli,0.40,7.27,+24900,+1275,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,James Wood,Adrian Houser,12.20,39.92,+720,+150,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,Luis García Jr.,Adrian Houser,3.40,20.01,+2837,+400,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,José Tena,Adrian Houser,1.94,18.64,+5064,+436,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,CJ Abrams,Adrian Houser,9.23,36.24,+983,+176,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,Jacob Young,Adrian Houser,3.99,22.08,+2407,+353,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,Daylen Lile,Adrian Houser,2.22,19.18,+4407,+421,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,Nasim Nuñez,Adrian Houser,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,Jorbit Vivas,Adrian Houser,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,SF@WSH,WSH,Drew Millas,Adrian Houser,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Andrew Benintendi,Luis Severino,4.78,23.22,+1993,+331,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Munetaka Murakami,Luis Severino,12.04,37.14,+731,+169,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Miguel Vargas,Luis Severino,3.46,17.85,+2793,+460,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Colson Montgomery,Luis Severino,2.53,11.69,+3851,+756,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Everson Pereira,Luis Severino,8.71,31.22,+1048,+220,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Sam Antonacci,Luis Severino,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Chase Meidroth,Luis Severino,2.16,16.38,+4525,+510,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Tristan Peters,Luis Severino,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,CWS,Reese McGuire,Luis Severino,0.40,6.40,+24900,+1463,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Jeff McNeil,Erick Fedde,0.40,10.21,+24900,+880,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Shea Langeliers,Erick Fedde,6.47,27.71,+1445,+261,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Nick Kurtz,Erick Fedde,5.39,24.09,+1755,+315,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Tyler Soderstrom,Erick Fedde,2.13,16.01,+4604,+525,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Jacob Wilson,Erick Fedde,0.40,6.01,+24900,+1563,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Carlos Cortes,Erick Fedde,1.59,16.32,+6176,+513,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Max Muncy,Erick Fedde,4.94,25.27,+1926,+296,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Lawrence Butler,Erick Fedde,1.53,14.76,+6443,+577,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,CWS@ATH,ATH,Austin Wynns,Erick Fedde,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Kevin McGonigle,Brayan Bello,5.03,26.29,+1887,+280,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Gleyber Torres,Brayan Bello,0.45,12.15,+22223,+723,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Colt Keith,Brayan Bello,6.06,28.91,+1550,+246,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Riley Greene,Brayan Bello,6.39,29.62,+1464,+238,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Spencer Torkelson,Brayan Bello,3.74,19.62,+2574,+410,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Kerry Carpenter,Brayan Bello,7.94,25.18,+1159,+297,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Wenceel Pérez,Brayan Bello,2.40,6.63,+4068,+1409,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Javier Báez,Brayan Bello,1.32,15.19,+7452,+558,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,DET,Jake Rogers,Brayan Bello,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Roman Anthony,Tarik Skubal,3.35,20.05,+2888,+399,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Andruw Monasterio,Tarik Skubal,0.51,13.38,+19355,+647,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Willson Contreras,Tarik Skubal,5.52,24.95,+1713,+301,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Trevor Story,Tarik Skubal,0.84,12.17,+11833,+722,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Wilyer Abreu,Tarik Skubal,5.27,25.48,+1798,+292,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Ceddanne Rafaela,Tarik Skubal,0.53,12.28,+18848,+714,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Caleb Durbin,Tarik Skubal,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Connor Wong,Tarik Skubal,3.40,28.12,+2837,+256,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-18,DET@BOS,BOS,Isiah Kiner-Falefa,Tarik Skubal,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,Sal Frelick,Sandy Alcantara,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,William Contreras,Sandy Alcantara,0.81,16.83,+12171,+494,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,Brice Turang,Sandy Alcantara,3.87,23.37,+2483,+328,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,Gary Sánchez,Sandy Alcantara,7.62,29.23,+1212,+242,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,Jake Bauers,Sandy Alcantara,4.91,23.06,+1937,+334,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,Luis Rengifo,Sandy Alcantara,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,Garrett Mitchell,Sandy Alcantara,4.26,23.86,+2249,+319,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,Brandon Lockridge,Sandy Alcantara,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIL,Joey Ortiz,Sandy Alcantara,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Jakob Marsee,Brandon Woodruff,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Xavier Edwards,Brandon Woodruff,1.38,18.50,+7132,+441,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Agustín Ramírez,Brandon Woodruff,0.40,8.41,+24900,+1089,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Liam Hicks,Brandon Woodruff,2.69,18.18,+3613,+450,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Otto Lopez,Brandon Woodruff,5.88,28.99,+1600,+245,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Connor Norby,Brandon Woodruff,0.53,11.72,+18893,+753,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Owen Caissie,Brandon Woodruff,5.56,23.81,+1699,+320,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Heriberto Hernández,Brandon Woodruff,0.40,8.22,+24900,+1116,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,MIL@MIA,MIA,Javier Sanoja,Brandon Woodruff,0.40,9.43,+24900,+960,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Gunnar Henderson,Gavin Williams,7.29,25.74,+1272,+289,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Taylor Ward,Gavin Williams,0.40,13.10,+24900,+664,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Pete Alonso,Gavin Williams,3.95,20.08,+2432,+398,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Dylan Beavers,Gavin Williams,0.58,11.44,+17137,+774,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Colton Cowser,Gavin Williams,0.40,9.08,+24900,+1001,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Leody Taveras,Gavin Williams,1.42,17.80,+6940,+462,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Samuel Basallo,Gavin Williams,4.61,17.52,+2069,+471,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Coby Mayo,Gavin Williams,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,BAL,Jeremiah Jackson,Gavin Williams,6.24,24.36,+1503,+311,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,Steven Kwan,Dean Kremer,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,Chase DeLauter,Dean Kremer,7.10,28.39,+1308,+252,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,José Ramírez,Dean Kremer,4.50,23.40,+2124,+327,NA,0.00,C,"Medium — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,Kyle Manzardo,Dean Kremer,1.90,13.90,+5163,+619,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,George Valera,Dean Kremer,2.96,25.79,+3281,+288,NA,0.00,C,"Low — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,Rhys Hoskins,Dean Kremer,2.58,15.01,+3783,+566,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,Daniel Schneemann,Dean Kremer,5.90,28.97,+1595,+245,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,Bo Naylor,Dean Kremer,2.36,17.53,+4129,+470,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,BAL@CLE,CLE,Brayan Rocchio,Dean Kremer,0.40,10.09,+24900,+891,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,JJ Wetherholt,Lance McCullers Jr.,3.26,16.80,+2965,+495,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,Iván Herrera,Lance McCullers Jr.,4.81,25.10,+1977,+298,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,Alec Burleson,Lance McCullers Jr.,7.49,32.37,+1235,+209,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,Jordan Walker,Lance McCullers Jr.,14.83,47.87,+574,+109,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,Nolan Gorman,Lance McCullers Jr.,2.43,12.23,+4015,+718,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,Masyn Winn,Lance McCullers Jr.,0.40,6.56,+24900,+1424,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,Ramón Urías,Lance McCullers Jr.,5.24,23.12,+1810,+333,NA,0.00,C,"Medium — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,Nathan Church,Lance McCullers Jr.,0.70,9.75,+14148,+925,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,STL,José Fermín,Lance McCullers Jr.,0.40,8.16,+24900,+1125,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Jose Altuve,Andre Pallante,4.41,21.92,+2169,+356,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Yordan Alvarez,Andre Pallante,15.75,53.53,+535,-115,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Carlos Correa,Andre Pallante,5.06,24.27,+1878,+312,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Christian Walker,Andre Pallante,7.50,29.00,+1233,+245,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Isaac Paredes,Andre Pallante,0.40,6.27,+24900,+1495,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Taylor Trammell,Andre Pallante,3.02,18.46,+3210,+442,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Cam Smith,Andre Pallante,8.92,33.61,+1021,+197,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Christian Vázquez,Andre Pallante,9.96,42.36,+904,+136,NA,0.00,A+,"Medium — real stats+savant, posted lineup"
2026-04-18,STL@HOU,HOU,Nick Allen,Andre Pallante,2.00,14.24,+4910,+602,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Brandon Nimmo,George Kirby,3.48,20.75,+2775,+382,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Corey Seager,George Kirby,4.80,20.97,+1982,+377,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Wyatt Langford,George Kirby,0.40,8.33,+24900,+1100,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Jake Burger,George Kirby,4.27,21.75,+2244,+360,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Joc Pederson,George Kirby,0.40,6.81,+24900,+1369,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Josh Jung,George Kirby,0.40,17.46,+24900,+473,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Evan Carter,George Kirby,1.39,14.46,+7092,+591,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Ezequiel Duran,George Kirby,0.40,14.59,+24900,+586,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,TEX,Kyle Higashioka,George Kirby,1.61,15.17,+6096,+559,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,J.P. Crawford,Nathan Eovaldi,0.40,9.34,+24900,+971,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,Cal Raleigh,Nathan Eovaldi,1.46,12.45,+6753,+703,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,Julio Rodríguez,Nathan Eovaldi,1.37,14.07,+7193,+611,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,Josh Naylor,Nathan Eovaldi,0.40,8.60,+24900,+1063,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,Randy Arozarena,Nathan Eovaldi,0.86,14.55,+11528,+587,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,Luke Raley,Nathan Eovaldi,10.24,39.32,+877,+154,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,Dominic Canzone,Nathan Eovaldi,6.89,29.02,+1351,+245,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,Cole Young,Nathan Eovaldi,0.78,11.97,+12759,+735,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,TEX@SEA,SEA,Leo Rivas,Nathan Eovaldi,0.40,6.00,+24900,+1567,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Ronald Acuña Jr.,Cristopher Sánchez,4.21,23.91,+2277,+318,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Drake Baldwin,Cristopher Sánchez,5.90,28.00,+1594,+257,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Ozzie Albies,Cristopher Sánchez,0.67,13.01,+14835,+669,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Matt Olson,Cristopher Sánchez,10.10,35.91,+891,+178,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Austin Riley,Cristopher Sánchez,4.87,23.00,+1955,+335,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Mauricio Dubón,Cristopher Sánchez,1.94,17.73,+5053,+464,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Eli White,Cristopher Sánchez,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Jonah Heim,Cristopher Sánchez,0.40,6.00,+24900,+1567,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,ATL,Jorge Mateo,Cristopher Sánchez,6.71,35.43,+1391,+182,NA,0.00,A,"Medium — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,Trea Turner,Chris Sale,0.40,11.76,+24900,+750,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,Kyle Schwarber,Chris Sale,11.62,34.29,+761,+192,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,Bryce Harper,Chris Sale,6.91,31.46,+1346,+218,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,Adolis García,Chris Sale,4.39,21.12,+2176,+374,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,J.T. Realmuto,Chris Sale,0.88,14.23,+11233,+603,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,Alec Bohm,Chris Sale,0.40,7.02,+24900,+1324,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,Felix Reyes,Chris Sale,2.30,16.10,+4238,+521,NA,0.00,D,"Low — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,Edmundo Sosa,Chris Sale,2.35,16.19,+4146,+518,NA,0.00,D,"Medium — real stats+savant, posted lineup"
2026-04-18,ATL@PHI,PHI,Brandon Marsh,Chris Sale,3.39,22.15,+2848,+351,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Shohei Ohtani,Ryan Feltner,16.02,46.31,+524,+116,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Kyle Tucker,Ryan Feltner,8.05,26.26,+1143,+281,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Andy Pages,Ryan Feltner,14.05,45.93,+612,+118,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Freddie Freeman,Ryan Feltner,14.66,49.25,+582,+103,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Teoscar Hernández,Ryan Feltner,12.07,37.66,+728,+166,NA,0.00,A,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Max Muncy,Ryan Feltner,17.09,50.03,+485,-100,NA,0.00,A+,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Dalton Rushing,Ryan Feltner,25.00,55.00,+300,-122,NA,0.00,A+,"Medium — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Alex Freeland,Ryan Feltner,9.03,29.37,+1007,+241,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,LAD,Miguel Rojas,Ryan Feltner,7.71,31.23,+1197,+220,NA,0.00,B,"Medium — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,Edouard Julien,Emmet Sheehan,5.90,25.94,+1595,+286,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,Mickey Moniak,Emmet Sheehan,9.82,30.86,+918,+224,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,TJ Rumfield,Emmet Sheehan,5.00,23.57,+1902,+324,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,Hunter Goodman,Emmet Sheehan,8.41,27.39,+1089,+265,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,Ezequiel Tovar,Emmet Sheehan,5.36,26.23,+1765,+281,NA,0.00,B,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,Troy Johnston,Emmet Sheehan,4.70,21.88,+2027,+357,NA,0.00,C,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,Brenton Doyle,Emmet Sheehan,2.81,14.47,+3454,+591,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,Kyle Karros,Emmet Sheehan,3.52,18.76,+2740,+433,NA,0.00,D,"High — real stats+savant, posted lineup"
2026-04-18,LAD@COL,COL,Jordan Beck,Emmet Sheehan,2.06,9.70,+4763,+931,NA,0.00,D,"Medium — real stats+savant, posted lineup"
<!-- batter-outlooks-csv:end -->
*/

