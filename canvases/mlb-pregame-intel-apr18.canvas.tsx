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
  gameStatusBucket?: string;
  gameState?: string;
  gameStateDetail?: string;
  gameStatusNote?: string;
  awayScore?: number | null;
  homeScore?: number | null;
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

type GameStateBucket = "pregame" | "live" | "final" | "other";
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
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — KC 4, NYY 13",
    awayScore: 4,
    homeScore: 13,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 142,
    homeAmerican: -158,
    impliedAwayPct: 40.29,
    impliedHomePct: 59.71,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Maikel Garcia", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Carter Jensen", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
    ],
    propsHome: [
      { batter: "Amed Rosario", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Ben Rice", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Randal Grichuk", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "José Caballero", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 4, NYY 13" },
    ],
  },
  {
    gameKey: "CIN@MIN",
    venue: "Target Field",
    away: "CIN",
    home: "MIN",
    timeEt: "2:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — CIN 5, MIN 4",
    awayScore: 5,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Will Benson", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Nathaniel Lowe", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
    ],
    propsHome: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Austin Martin", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Josh Bell", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Ryan Jeffers", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Ryan Kreidler", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
      { batter: "Tristan Gray", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 5, MIN 4" },
    ],
  },
  {
    gameKey: "NYM@CHC",
    venue: "Wrigley Field",
    away: "NYM",
    home: "CHC",
    timeEt: "2:20 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — NYM 2, CHC 4",
    awayScore: 2,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -102,
    homeAmerican: -108,
    impliedAwayPct: 49.30,
    impliedHomePct: 50.70,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Low",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Carson Benge", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Bo Bichette", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Francisco Lindor", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Luis Robert Jr.", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "MJ Melendez", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Francisco Alvarez", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Brett Baty", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Marcus Semien", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Ian Happ", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Miguel Amaya", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 2, CHC 4" },
    ],
  },
  {
    gameKey: "TB@PIT",
    venue: "PNC Park",
    away: "TB",
    home: "PIT",
    timeEt: "3:30 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TB 8, PIT 7",
    awayScore: 8,
    homeScore: 7,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -138,
    homeAmerican: 118,
    impliedAwayPct: 55.83,
    impliedHomePct: 44.17,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Junior Caminero", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Jake Fraley", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Richie Palacios", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Hunter Feduccia", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
    ],
    propsHome: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Spencer Horwitz", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
      { batter: "Henry Davis", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 8, PIT 7" },
    ],
  },
  {
    gameKey: "SF@WSH",
    venue: "Nationals Park",
    away: "SF",
    home: "WSH",
    timeEt: "4:05 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — SF 7, WSH 6",
    awayScore: 7,
    homeScore: 6,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -112,
    homeAmerican: 102,
    impliedAwayPct: 51.62,
    impliedHomePct: 48.38,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Willy Adames", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Rafael Devers", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "José Tena", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 7, WSH 6" },
    ],
  },
  {
    gameKey: "CWS@ATH",
    venue: "Oakland Coliseum",
    away: "CWS",
    home: "ATH",
    timeEt: "4:05 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — CWS 6, ATH 7",
    awayScore: 6,
    homeScore: 7,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Low",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Tristan Peters", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Reese McGuire", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
    ],
    propsHome: [
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Max Muncy", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
      { batter: "Austin Wynns", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 6, ATH 7" },
    ],
  },
  {
    gameKey: "DET@BOS",
    venue: "Fenway Park",
    away: "DET",
    home: "BOS",
    timeEt: "4:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — DET 4, BOS 1",
    awayScore: 4,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 118,
    homeAmerican: -132,
    impliedAwayPct: 7.33,
    impliedHomePct: 92.67,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire;not_scored_non_pregame",
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
      { batter: "Kevin McGonigle", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Colt Keith", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Riley Greene", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Kerry Carpenter", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Javier Báez", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Jake Rogers", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Andruw Monasterio", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Connor Wong", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
      { batter: "Isiah Kiner-Falefa", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 4, BOS 1" },
    ],
  },
  {
    gameKey: "MIL@MIA",
    venue: "loanDepot park",
    away: "MIL",
    home: "MIA",
    timeEt: "4:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — MIL 5, MIA 2",
    awayScore: 5,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -118,
    homeAmerican: 108,
    impliedAwayPct: 52.96,
    impliedHomePct: 47.04,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Sal Frelick", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "William Contreras", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Brice Turang", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Connor Norby", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Heriberto Hernández", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
      { batter: "Javier Sanoja", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 5, MIA 2" },
    ],
  },
  {
    gameKey: "BAL@CLE",
    venue: "Progressive Field",
    away: "BAL",
    home: "CLE",
    timeEt: "6:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — BAL 2, CLE 4",
    awayScore: 2,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -108,
    homeAmerican: -102,
    impliedAwayPct: 50.70,
    impliedHomePct: 49.30,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Low",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Colton Cowser", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "José Ramírez", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "George Valera", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Bo Naylor", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
    ],
  },
  {
    gameKey: "STL@HOU",
    venue: "Minute Maid Park",
    away: "STL",
    home: "HOU",
    timeEt: "7:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — STL 7, HOU 5",
    awayScore: 7,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 155,
    homeAmerican: -175,
    impliedAwayPct: 38.13,
    impliedHomePct: 61.87,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium-High",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      ["3", "Carlos Correa", "SS"],
      ["4", "Christian Walker", "1B"],
      ["5", "Isaac Paredes", "DH"],
      ["6", "Taylor Trammell", "CF"],
      ["7", "Cam Smith", "RF"],
      ["8", "Christian Vázquez", "C"],
      ["9", "Shay Whitcomb", "3B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Minute Maid Park. Weather/run environment from inputs: retractable roof / warm / Medium."],
    propsAway: [
      { batter: "JJ Wetherholt", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Iván Herrera", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Alec Burleson", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Jordan Walker", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Ramón Urías", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Nathan Church", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "José Fermín", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
    ],
    propsHome: [
      { batter: "Jose Altuve", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Carlos Correa", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Christian Walker", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Cam Smith", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Christian Vázquez", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Shay Whitcomb", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
    ],
  },
  {
    gameKey: "TEX@SEA",
    venue: "T-Mobile Park",
    away: "TEX",
    home: "SEA",
    timeEt: "7:15 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TEX 3, SEA 7",
    awayScore: 3,
    homeScore: 7,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Corey Seager", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Jake Burger", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Josh Jung", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Evan Carter", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Ezequiel Duran", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Kyle Higashioka", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
    ],
    propsHome: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Luke Raley", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 3, SEA 7" },
    ],
  },
  {
    gameKey: "ATL@PHI",
    venue: "Citizens Bank Park",
    away: "ATL",
    home: "PHI",
    timeEt: "7:15 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — ATL 3, PHI 1",
    awayScore: 3,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 105,
    homeAmerican: -115,
    impliedAwayPct: 47.70,
    impliedHomePct: 52.30,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
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
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Matt Olson", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Austin Riley", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Eli White", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Jonah Heim", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Jorge Mateo", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
    ],
    propsHome: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Adolis García", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "J.T. Realmuto", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Felix Reyes", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Edmundo Sosa", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 3, PHI 1" },
    ],
  },
  {
    gameKey: "LAD@COL",
    venue: "Coors Field",
    away: "LAD",
    home: "COL",
    timeEt: "8:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — LAD 3, COL 4",
    awayScore: 3,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -185,
    homeAmerican: 165,
    impliedAwayPct: 66.58,
    impliedHomePct: 33.42,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_unconfirmed;starter_mismatch_rotowire;not_scored_non_pregame",
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
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Andy Pages", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Max Muncy", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Miguel Rojas", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
    ],
    propsHome: [
      { batter: "Edouard Julien", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Troy Johnston", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Kyle Karros", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
      { batter: "Jordan Beck", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 3, COL 4" },
    ],
  },
  {
    gameKey: "TOR@AZ",
    venue: "Chase Field",
    away: "TOR",
    home: "AZ",
    timeEt: "8:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TOR 2, AZ 6",
    awayScore: 2,
    homeScore: 6,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -112,
    homeAmerican: 102,
    impliedAwayPct: 51.62,
    impliedHomePct: 48.38,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
    rationale: "Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Nathan Lukes", "RF"],
      ["2", "Ernie Clement", "2B"],
      ["3", "Vladimir Guerrero Jr.", "1B"],
      ["4", "Jesús Sánchez", "LF"],
      ["5", "Eloy Jiménez", "DH"],
      ["6", "Andrés Giménez", "SS"],
      ["7", "Kazuma Okamoto", "3B"],
      ["8", "Myles Straw", "CF"],
      ["9", "Tyler Heineman", "C"],
    ],
    homeLineup: [
      ["1", "Ketel Marte", "DH"],
      ["2", "Corbin Carroll", "RF"],
      ["3", "Geraldo Perdomo", "SS"],
      ["4", "Lourdes Gurriel Jr.", "LF"],
      ["5", "Adrian Del Castillo", "C"],
      ["6", "Jose Fernandez", "1B"],
      ["7", "Nolan Arenado", "3B"],
      ["8", "Ildemaro Vargas", "2B"],
      ["9", "Alek Thomas", "CF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Chase Field. Weather/run environment from inputs: retractable roof / Medium."],
    propsAway: [
      { batter: "Nathan Lukes", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Eloy Jiménez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Myles Straw", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Tyler Heineman", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
    ],
    propsHome: [
      { batter: "Ketel Marte", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Geraldo Perdomo", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Jose Fernandez", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 2, AZ 6" },
    ],
  },
  {
    gameKey: "SD@LAA",
    venue: "Angel Stadium",
    away: "SD",
    home: "LAA",
    timeEt: "9:38 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — SD 4, LAA 1",
    awayScore: 4,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -128,
    homeAmerican: 118,
    impliedAwayPct: 55.03,
    impliedHomePct: 44.97,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_missing;not_scored_non_pregame",
    rationale: "Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Ramón Laureano", "LF"],
      ["2", "Fernando Tatis Jr.", "RF"],
      ["3", "Jackson Merrill", "CF"],
      ["4", "Manny Machado", "3B"],
      ["5", "Xander Bogaerts", "SS"],
      ["6", "Miguel Andujar", "DH"],
      ["7", "Ty France", "1B"],
      ["8", "Freddy Fermin", "C"],
      ["9", "Jake Cronenworth", "2B"],
    ],
    homeLineup: [
      ["1", "Zach Neto", "SS"],
      ["2", "Mike Trout", "CF"],
      ["3", "Nolan Schanuel", "1B"],
      ["4", "Jo Adell", "RF"],
      ["5", "Yoán Moncada", "DH"],
      ["6", "Oswald Peraza", "3B"],
      ["7", "Josh Lowe", "LF"],
      ["8", "Logan O'Hoppe", "C"],
      ["9", "Adam Frazier", "2B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-18 --compute` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Angel Stadium. Weather/run environment from inputs: 68F / clear / Medium."],
    propsAway: [
      { batter: "Ramón Laureano", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Manny Machado", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Ty France", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Freddy Fermin", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Jake Cronenworth", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
    ],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Mike Trout", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Jo Adell", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 4, LAA 1" },
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

function normalizeGameStateBucket(bucket?: string): GameStateBucket {
  const normalized = (bucket || "").trim().toLowerCase();
  if (normalized === "live") return "live";
  if (normalized === "final") return "final";
  if (normalized === "other") return "other";
  return "pregame";
}

function gameStatusTone(bucket: GameStateBucket): "success" | "warning" | "info" | "neutral" {
  if (bucket === "pregame") return "info";
  if (bucket === "live") return "warning";
  if (bucket === "final") return "neutral";
  return "neutral";
}

function gameStatusLabel(g: SlateGame): string {
  return g.gameStateDetail || g.gameState || "Yet To Begin";
}

function scoreLabel(g: SlateGame): string | null {
  if (typeof g.awayScore !== "number" || typeof g.homeScore !== "number") return null;
  return `${g.away} ${g.awayScore}, ${g.home} ${g.homeScore}`;
}

function baseDecisionStatus(
  g: SlateGame,
  lineupPosting: LineupPosting,
  hasManualArtifact: boolean,
): DecisionStatus {
  if (normalizeGameStateBucket(g.gameStatusBucket) !== "pregame") return "pass";
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
  const gameBucket = normalizeGameStateBucket(decision.game.gameStatusBucket);

  if (gameBucket !== "pregame") {
    reasons.push(decision.game.gameStatusNote || gameStatusLabel(decision.game));
  }

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

function hrTierFromPct(pct: number): string {
  if (pct >= 13.2) return "A+";
  if (pct >= 10.2) return "A";
  if (pct >= 7.8) return "B";
  if (pct >= 5.8) return "C";
  return "D";
}

function tbTierFromPct(pct: number): string {
  if (pct >= 38) return "A+";
  if (pct >= 32) return "A";
  if (pct >= 26) return "B";
  if (pct >= 20) return "C";
  return "D";
}

function formatPropTier(p: PropRow): string {
  return `HR ${hrTierFromPct(p.hrPct)} / TB ${tbTierFromPct(p.tb2Pct)}`;
}

function confTone(c: string): "success" | "warning" | "info" | "neutral" {
  if (c === "High") return "success";
  if (c === "Medium" || c === "Medium-High") return "warning";
  return "neutral";
}

function GameCard({ g }: { g: SlateGame }) {
  const ml = `${g.away} ${g.awayAmerican > 0 ? `+${g.awayAmerican}` : g.awayAmerican} / ${g.home} ${g.homeAmerican > 0 ? `+${g.homeAmerican}` : g.homeAmerican}`;
  const gameBucket = normalizeGameStateBucket(g.gameStatusBucket);
  const statusLabel = gameStatusLabel(g);
  const score = scoreLabel(g);
  const pickIsHome = g.prediction === g.home;
  const propsAwayRows = g.propsAway.map((p) => [
    p.batter,
    `${p.hrPct.toFixed(1)}%`,
    `${p.tb2Pct.toFixed(1)}%`,
    formatPropTier(p),
    p.note,
  ]);
  const propsHomeRows = g.propsHome.map((p) => [
    p.batter,
    `${p.hrPct.toFixed(1)}%`,
    `${p.tb2Pct.toFixed(1)}%`,
    formatPropTier(p),
    p.note,
  ]);

  return (
    <Card collapsible defaultOpen={false}>
      <CardHeader
        trailing={
          <Row gap={6}>
            <PillTag label={statusLabel} tone={gameStatusTone(gameBucket)} />
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
          <Text size="small" tone="secondary">
            {g.gameStatusNote || statusLabel}
            {score ? ` · ${score}` : ""}
          </Text>
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
                headers={["Batter", "HR%", "2+ TB%", "HR/TB Tier", "Notes"]}
                rows={propsAwayRows}
                framed={false}
              />
            </Stack>
            <Stack gap={4}>
              <Text weight="semibold">{g.home}</Text>
              <Table
                headers={["Batter", "HR%", "2+ TB%", "HR/TB Tier", "Notes"]}
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

function allPropRows(): { batter: string; game: string; hr: number; tb2: number; hrTier: string; tbTier: string }[] {
  const out: { batter: string; game: string; hr: number; tb2: number; hrTier: string; tbTier: string }[] = [];
  for (const g of SLATE) {
    for (const p of [...g.propsAway, ...g.propsHome]) {
      out.push({
        batter: p.batter,
        game: g.gameKey,
        hr: p.hrPct,
        tb2: p.tb2Pct,
        hrTier: hrTierFromPct(p.hrPct),
        tbTier: tbTierFromPct(p.tb2Pct),
      });
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
        rows={topHr.map((r, i) => [String(i + 1), r.batter, r.game, `${r.hr.toFixed(1)}%`, r.hrTier])}
      />

      <H3>Top 2+ TB targets (model)</H3>
      <Table
        headers={["Rank", "Batter", "Game", "2+ TB%", "Tier"]}
        rows={topTb.map((r, i) => [String(i + 1), r.batter, r.game, `${r.tb2.toFixed(1)}%`, r.tbTier])}
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
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,game_status_bucket,game_state,game_state_detail,game_status_note,away_score,home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,raw_model_away_win_pct,raw_model_home_win_pct,final_away_win_pct,final_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary,scoring_status
2026-04-18,KC,NYY,1:35 PM,Noah Cameron,Will Warren,142,-158,,,,47F / 8 mph wind / 13% precip / Open,46.6,7.7,13,0.317,0.398,0.412,0.470,final,Final,Final,"Final — KC 4, NYY 13",4,13,Partial,rotowire_missing,40.29,59.71,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Yankee Stadium short porch vs contact-oriented Royals road lineup — price the chalk carefully; props and team totals often clearer than ML.,not_scored
2026-04-18,CIN,MIN,2:10 PM,Andrew Abbott,Taj Bradley,108,-124,,,,46F / 11 mph wind / 0% precip / Open,45.7,10.8,0,0.371,0.341,0.398,0.594,final,Final,Final,"Final — CIN 5, MIN 4",5,4,Partial,rotowire_missing,46.48,53.52,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Target Field leans pitcher-friendly early season; lean on probables and bullpen paths before trusting a big ML edge.,not_scored
2026-04-18,NYM,CHC,2:20 PM,Freddy Peralta,Jameson Taillon,-102,-108,,,,42F / 5 mph wind / 3% precip / Open,41.9,5.4,3,0.426,0.449,0.418,0.518,final,Final,Final,"Final — NYM 2, CHC 4",2,4,Partial,rotowire_missing,49.30,50.70,,,,,,,,not_scored,,not_scored,rotowire_missing,Low,Wrigley wind and cold can suppress HRs — tight market; verify probables and late lineup news.,not_scored
2026-04-18,TB,PIT,3:30 PM,Drew Rasmussen,Paul Skenes,-138,118,,,,47F / 8 mph wind / 12% precip / Open,47.2,7.9,12,0.356,0.357,0.481,0.534,final,Final,Final,"Final — TB 8, PIT 7",8,7,Partial,rotowire_missing,55.83,44.17,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Rays talent vs Pirates home spot — check opener/bulk roles; modest ML edge only if price is wrong.,not_scored
2026-04-18,SF,WSH,4:05 PM,Adrian Houser,Cade Cavalli,-112,102,,,,56F / 10 mph wind / 0% precip / Open,55.6,10.2,0,0.399,0.329,0.535,0.525,final,Final,Final,"Final — SF 7, WSH 6",7,6,Partial,rotowire_missing,51.62,48.38,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites.,not_scored
2026-04-18,CWS,ATH,4:05 PM,Erick Fedde,Luis Severino,108,-124,,,,76F / 6 mph wind / 0% precip / Open,75.8,6.4,0,0.382,0.402,0.447,0.461,final,Final,Final,"Final — CWS 6, ATH 7",6,7,Partial,rotowire_missing,46.48,53.52,,,,,,,,not_scored,,not_scored,rotowire_missing,Low,Oakland environment and travel spot — volatility; prefer game props unless you have a clear pitching mismatch.,not_scored
2026-04-18,DET,BOS,4:10 PM,Tarik Skubal,Brayan Bello,1180,-8000,10.0,-110,-120,39F / 8 mph wind / 24% precip / Open,39.3,8.3,24,0.465,0.450,0.469,0.467,final,Final,Final,"Final — DET 4, BOS 1",4,1,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,7.33,92.67,,,,,,,,not_scored,,not_scored,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Fenway doubles and wall-ball noise — model park correctly before trusting a big ML number.,not_scored
2026-04-18,MIL,MIA,4:10 PM,Brandon Woodruff,Sandy Alcantara,-118,108,,,,79F / 2 mph wind / 34% precip / Retractable,78.9,2.1,34,0.396,0.410,0.469,0.459,final,Final,Final,"Final — MIL 5, MIA 2",5,2,Partial,rotowire_missing,52.96,47.04,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Miami run suppression helps pitching — lean Brewers only if the price matches your starter read.,not_scored
2026-04-18,BAL,CLE,6:10 PM,Dean Kremer,Gavin Williams,-108,-102,,,,44F / 13 mph wind / 16% precip / Open,43.6,13.2,16,0.379,0.349,0.472,0.524,final,Final,Final,"Final — BAL 2, CLE 4",2,4,Partial,rotowire_missing,50.70,49.30,,,,,,,,not_scored,,not_scored,rotowire_missing,Low,Progressive Field — coin-flip pricing common; prioritize handedness and bullpen availability.,not_scored
2026-04-18,STL,HOU,7:10 PM,Andre Pallante,Lance McCullers Jr.,155,-175,,,,65F / 4 mph wind / 0% precip / Retractable,65.4,4.2,0,0.337,0.348,0.537,0.567,final,Final,Final,"Final — STL 7, HOU 5",7,5,Partial,rotowire_missing,38.13,61.87,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium-High,Astros home talent vs Cardinals road — market often prices Houston heavy; PASS unless you see a real innings edge.,not_scored
2026-04-18,TEX,SEA,7:15 PM,Nathan Eovaldi,George Kirby,108,-124,,,,71F / 6 mph wind / 2% precip / Retractable,70.8,5.5,2,0.374,0.423,0.548,0.420,final,Final,Final,"Final — TEX 3, SEA 7",3,7,Partial,rotowire_missing,46.48,53.52,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,T-Mobile Park suppresses offense — pitching duel pricing; props and totals often cleaner.,not_scored
2026-04-18,ATL,PHI,7:15 PM,Chris Sale,Cristopher Sánchez,105,-115,,,,47F / 7 mph wind / 10% precip / Open,47.4,6.9,10,0.533,0.502,0.586,0.579,final,Final,Final,"Final — ATL 3, PHI 1",3,1,Partial,rotowire_missing,47.70,52.30,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,NL East heavyweight pricing — small edges only; watch weather and late scratches.,not_scored
2026-04-18,LAD,COL,8:10 PM,Emmet Sheehan,Ryan Feltner,-222,189,11.5,-110,-111,72F / 8 mph wind / 0% precip / Open,72.4,7.9,0,0.435,0.395,0.663,0.496,final,Final,Final,"Final — LAD 3, COL 4",3,4,Partial,rotowire_unconfirmed|starter_mismatch_rotowire,66.58,33.42,,,,,,,,not_scored,,not_scored,rotowire_unconfirmed;starter_mismatch_rotowire,Medium,Coors elevates variance — Dodgers talent priced in; Rockies bats can still pop in chunks.,not_scored
2026-04-18,TOR,AZ,8:10 PM,Max Scherzer,Zac Gallen,-112,102,,,,94F / 6 mph wind / 0% precip / Retractable,94.3,6.5,0,0.429,0.484,0.418,0.481,final,Final,Final,"Final — TOR 2, AZ 6",2,6,Partial,rotowire_missing,51.62,48.38,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge.,not_scored
2026-04-18,SD,LAA,9:38 PM,Germán Márquez,Yusei Kikuchi,-128,118,,,,74F / 8 mph wind / 0% precip / Open,73.5,7.8,0,0.491,0.369,0.538,0.616,final,Final,Final,"Final — SD 4, LAA 1",4,1,Partial,rotowire_missing,55.03,44.97,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.,not_scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-18,KC@NYY,KC,Maikel Garcia,Will Warren,,,,,NA,,,,,0.524,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,KC,Bobby Witt Jr.,Will Warren,,,,,NA,,,,,0.443,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,KC,Vinnie Pasquantino,Will Warren,,,,,NA,,,,,0.387,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,KC,Jac Caglianone,Will Warren,,,,,NA,,,,,0.416,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,KC,Carter Jensen,Will Warren,,,,,NA,,,,,0.647,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,KC,Michael Massey,Will Warren,,,,,NA,,,,,0.295,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,KC,Isaac Collins,Will Warren,,,,,NA,,,,,0.305,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,KC,Lane Thomas,Will Warren,,,,,NA,,,,,0.444,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,KC,Kyle Isbel,Will Warren,,,,,NA,,,,,0.248,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,Amed Rosario,Noah Cameron,,,,,NA,,,,,0.672,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,Aaron Judge,Noah Cameron,,,,,NA,,,,,0.813,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,Cody Bellinger,Noah Cameron,,,,,NA,,,,,0.412,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,Giancarlo Stanton,Noah Cameron,,,,,NA,,,,,0.356,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,Ben Rice,Noah Cameron,,,,,NA,,,,,0.851,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,Randal Grichuk,Noah Cameron,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,Jazz Chisholm Jr.,Noah Cameron,,,,,NA,,,,,0.270,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,José Caballero,Noah Cameron,,,,,NA,,,,,0.499,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,KC@NYY,NYY,J.C. Escarra,Noah Cameron,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,TJ Friedl,Taj Bradley,,,,,NA,,,,,0.248,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,Will Benson,Taj Bradley,,,,,NA,,,,,0.312,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,Elly De La Cruz,Taj Bradley,,,,,NA,,,,,0.705,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,Sal Stewart,Taj Bradley,,,,,NA,,,,,0.763,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,Eugenio Suárez,Taj Bradley,,,,,NA,,,,,0.487,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,Nathaniel Lowe,Taj Bradley,,,,,NA,,,,,0.310,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,Tyler Stephenson,Taj Bradley,,,,,NA,,,,,0.399,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,Rece Hinds,Taj Bradley,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,CIN,Ke'Bryan Hayes,Taj Bradley,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Byron Buxton,Andrew Abbott,,,,,NA,,,,,0.668,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Austin Martin,Andrew Abbott,,,,,NA,,,,,0.667,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Josh Bell,Andrew Abbott,,,,,NA,,,,,0.466,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Ryan Jeffers,Andrew Abbott,,,,,NA,,,,,0.655,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Luke Keaschall,Andrew Abbott,,,,,NA,,,,,0.376,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Trevor Larnach,Andrew Abbott,,,,,NA,,,,,0.506,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Brooks Lee,Andrew Abbott,,,,,NA,,,,,0.614,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Ryan Kreidler,Andrew Abbott,,,,,NA,,,,,0.868,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CIN@MIN,MIN,Tristan Gray,Andrew Abbott,,,,,NA,,,,,0.527,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,Carson Benge,Jameson Taillon,,,,,NA,,,,,0.262,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,Bo Bichette,Jameson Taillon,,,,,NA,,,,,0.432,27,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,Francisco Lindor,Jameson Taillon,,,,,NA,,,,,0.357,19,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,Luis Robert Jr.,Jameson Taillon,,,,,NA,,,,,0.422,14,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,MJ Melendez,Jameson Taillon,,,,,NA,,,,,0.950,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,Francisco Alvarez,Jameson Taillon,,,,,NA,,,,,0.550,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,Mark Vientos,Jameson Taillon,,,,,NA,,,,,0.226,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,Brett Baty,Jameson Taillon,,,,,NA,,,,,0.254,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,NYM,Marcus Semien,Jameson Taillon,,,,,NA,,,,,0.306,19,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Nico Hoerner,Freddy Peralta,,,,,NA,,,,,0.761,34,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Michael Busch,Freddy Peralta,,,,,NA,,,,,0.180,23,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Alex Bregman,Freddy Peralta,,,,,NA,,,,,0.356,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Ian Happ,Freddy Peralta,,,,,NA,,,,,0.571,41,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Seiya Suzuki,Freddy Peralta,,,,,NA,,,,,0.433,30,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Moisés Ballesteros,Freddy Peralta,,,,,NA,,,,,0.950,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Miguel Amaya,Freddy Peralta,,,,,NA,,,,,0.326,10,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Pete Crow-Armstrong,Freddy Peralta,,,,,NA,,,,,0.362,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,NYM@CHC,CHC,Dansby Swanson,Freddy Peralta,,,,,NA,,,,,0.726,24,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Chandler Simpson,Paul Skenes,,,,,NA,,,,,0.415,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Junior Caminero,Paul Skenes,,,,,NA,,,,,0.656,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Jonathan Aranda,Paul Skenes,,,,,NA,,,,,0.420,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Yandy Díaz,Paul Skenes,,,,,NA,,,,,0.606,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Jake Fraley,Paul Skenes,,,,,NA,,,,,0.373,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Cedric Mullins,Paul Skenes,,,,,NA,,,,,0.370,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Richie Palacios,Paul Skenes,,,,,NA,,,,,0.749,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Hunter Feduccia,Paul Skenes,,,,,NA,,,,,0.301,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,TB,Taylor Walls,Paul Skenes,,,,,NA,,,,,0.440,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Oneil Cruz,Drew Rasmussen,,,,,NA,,,,,0.716,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Brandon Lowe,Drew Rasmussen,,,,,NA,,,,,0.709,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Bryan Reynolds,Drew Rasmussen,,,,,NA,,,,,0.588,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Ryan O'Hearn,Drew Rasmussen,,,,,NA,,,,,0.518,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Marcell Ozuna,Drew Rasmussen,,,,,NA,,,,,0.458,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Nick Yorke,Drew Rasmussen,,,,,NA,,,,,0.441,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Spencer Horwitz,Drew Rasmussen,,,,,NA,,,,,0.661,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Konnor Griffin,Drew Rasmussen,,,,,NA,,,,,0.351,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TB@PIT,PIT,Henry Davis,Drew Rasmussen,,,,,NA,,,,,0.365,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Willy Adames,Cade Cavalli,,,,,NA,,,,,0.703,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Luis Arraez,Cade Cavalli,,,,,NA,,,,,0.470,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Matt Chapman,Cade Cavalli,,,,,NA,,,,,0.551,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Rafael Devers,Cade Cavalli,,,,,NA,,,,,0.364,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Casey Schmitt,Cade Cavalli,,,,,NA,,,,,0.803,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Jung Hoo Lee,Cade Cavalli,,,,,NA,,,,,0.555,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Heliot Ramos,Cade Cavalli,,,,,NA,,,,,0.432,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Drew Gilbert,Cade Cavalli,,,,,NA,,,,,0.756,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,SF,Patrick Bailey,Cade Cavalli,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,James Wood,Adrian Houser,,,,,NA,,,,,0.858,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,Luis García Jr.,Adrian Houser,,,,,NA,,,,,0.431,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,José Tena,Adrian Houser,,,,,NA,,,,,0.578,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,CJ Abrams,Adrian Houser,,,,,NA,,,,,0.950,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,Jacob Young,Adrian Houser,,,,,NA,,,,,0.494,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,Daylen Lile,Adrian Houser,,,,,NA,,,,,0.392,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,Nasim Nuñez,Adrian Houser,,,,,NA,,,,,0.279,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,Jorbit Vivas,Adrian Houser,,,,,NA,,,,,0.452,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SF@WSH,WSH,Drew Millas,Adrian Houser,,,,,NA,,,,,0.292,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Andrew Benintendi,Luis Severino,,,,,NA,,,,,0.441,43,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Munetaka Murakami,Luis Severino,,,,,NA,,,,,0.551,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Miguel Vargas,Luis Severino,,,,,NA,,,,,0.364,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Colson Montgomery,Luis Severino,,,,,NA,,,,,0.534,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Everson Pereira,Luis Severino,,,,,NA,,,,,0.950,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Sam Antonacci,Luis Severino,,,,,NA,,,,,0.205,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Chase Meidroth,Luis Severino,,,,,NA,,,,,0.386,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Tristan Peters,Luis Severino,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,CWS,Reese McGuire,Luis Severino,,,,,NA,,,,,0.409,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Jeff McNeil,Erick Fedde,,,,,NA,,,,,0.559,25,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Shea Langeliers,Erick Fedde,,,,,NA,,,,,0.570,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Nick Kurtz,Erick Fedde,,,,,NA,,,,,0.579,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Tyler Soderstrom,Erick Fedde,,,,,NA,,,,,0.515,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Jacob Wilson,Erick Fedde,,,,,NA,,,,,0.400,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Carlos Cortes,Erick Fedde,,,,,NA,,,,,0.546,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Max Muncy,Erick Fedde,,,,,NA,,,,,0.469,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Lawrence Butler,Erick Fedde,,,,,NA,,,,,0.335,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,CWS@ATH,ATH,Austin Wynns,Erick Fedde,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,DET@BOS,DET,Kevin McGonigle,Brayan Bello,,,,,3500,,1.5,365,,0.574,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,DET@BOS,DET,Gleyber Torres,Brayan Bello,,,,,3500,,0.5,550,,0.453,28,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,DET,Colt Keith,Brayan Bello,,,,,7500,,0.5,1000,,0.438,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,DET,Riley Greene,Brayan Bello,,,,,2000,,1.5,725,,0.522,11,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,DET@BOS,DET,Spencer Torkelson,Brayan Bello,,,,,NA,,1.5,50,,0.447,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,DET,Kerry Carpenter,Brayan Bello,,,,,NA,,1.5,100,,0.732,7,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,DET,Wenceel Pérez,Brayan Bello,,,,,NA,,1.5,50,,0.264,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,DET,Javier Báez,Brayan Bello,,,,,NA,,1.5,50,,0.608,7,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,DET,Jake Rogers,Brayan Bello,,,,,2450,,1.5,380,,0.180,2,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,DET@BOS,BOS,Roman Anthony,Tarik Skubal,,,,,NA,,1.5,242,,0.432,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,BOS,Andruw Monasterio,Tarik Skubal,,,,,NA,,,,,0.504,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,DET@BOS,BOS,Willson Contreras,Tarik Skubal,,,,,NA,,1.5,260,,0.735,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,BOS,Trevor Story,Tarik Skubal,,,,,NA,,0.5,340,,0.445,11,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,BOS,Wilyer Abreu,Tarik Skubal,,,,,NA,,1.5,700,,0.418,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,BOS,Ceddanne Rafaela,Tarik Skubal,,,,,NA,,1.5,150,,0.486,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,BOS,Caleb Durbin,Tarik Skubal,,,,,NA,,3.5,700,,0.352,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,DET@BOS,BOS,Connor Wong,Tarik Skubal,,,,,NA,,,,,0.455,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,DET@BOS,BOS,Isiah Kiner-Falefa,Tarik Skubal,,,,,NA,,,,,0.378,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,Sal Frelick,Sandy Alcantara,,,,,NA,,,,,0.292,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,William Contreras,Sandy Alcantara,,,,,NA,,,,,0.594,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,Brice Turang,Sandy Alcantara,,,,,NA,,,,,0.556,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,Gary Sánchez,Sandy Alcantara,,,,,NA,,,,,0.726,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,Jake Bauers,Sandy Alcantara,,,,,NA,,,,,0.670,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,Luis Rengifo,Sandy Alcantara,,,,,NA,,,,,0.296,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,Garrett Mitchell,Sandy Alcantara,,,,,NA,,,,,0.622,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,Brandon Lockridge,Sandy Alcantara,,,,,NA,,,,,0.288,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIL,Joey Ortiz,Sandy Alcantara,,,,,NA,,,,,0.180,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Jakob Marsee,Brandon Woodruff,,,,,NA,,,,,0.302,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Xavier Edwards,Brandon Woodruff,,,,,NA,,,,,0.543,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Agustín Ramírez,Brandon Woodruff,,,,,NA,,,,,0.501,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Liam Hicks,Brandon Woodruff,,,,,NA,,,,,0.458,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Otto Lopez,Brandon Woodruff,,,,,NA,,,,,0.755,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Connor Norby,Brandon Woodruff,,,,,NA,,,,,0.672,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Owen Caissie,Brandon Woodruff,,,,,NA,,,,,0.278,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Heriberto Hernández,Brandon Woodruff,,,,,NA,,,,,0.284,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,MIL@MIA,MIA,Javier Sanoja,Brandon Woodruff,,,,,NA,,,,,0.342,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Gunnar Henderson,Gavin Williams,,,,,NA,,,,,0.568,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Taylor Ward,Gavin Williams,,,,,NA,,,,,0.491,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Pete Alonso,Gavin Williams,,,,,NA,,,,,0.456,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Dylan Beavers,Gavin Williams,,,,,NA,,,,,0.281,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Colton Cowser,Gavin Williams,,,,,NA,,,,,0.217,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Leody Taveras,Gavin Williams,,,,,NA,,,,,0.544,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Samuel Basallo,Gavin Williams,,,,,NA,,,,,0.440,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Coby Mayo,Gavin Williams,,,,,NA,,,,,0.299,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,BAL,Jeremiah Jackson,Gavin Williams,,,,,NA,,,,,0.950,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,Steven Kwan,Dean Kremer,,,,,NA,,,,,0.469,14,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,Chase DeLauter,Dean Kremer,,,,,NA,,,,,0.380,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,José Ramírez,Dean Kremer,,,,,NA,,,,,0.646,16,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,Kyle Manzardo,Dean Kremer,,,,,NA,,,,,0.542,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,George Valera,Dean Kremer,,,,,NA,,,,,0.622,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,Rhys Hoskins,Dean Kremer,,,,,NA,,,,,0.451,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,Daniel Schneemann,Dean Kremer,,,,,NA,,,,,0.875,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,Bo Naylor,Dean Kremer,,,,,NA,,,,,0.211,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,BAL@CLE,CLE,Brayan Rocchio,Dean Kremer,,,,,NA,,,,,0.521,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,JJ Wetherholt,Lance McCullers Jr.,,,,,NA,,,,,0.526,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,Iván Herrera,Lance McCullers Jr.,,,,,NA,,,,,0.551,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,Alec Burleson,Lance McCullers Jr.,,,,,NA,,,,,0.545,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,Jordan Walker,Lance McCullers Jr.,,,,,NA,,,,,0.950,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,Nolan Gorman,Lance McCullers Jr.,,,,,NA,,,,,0.376,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,Masyn Winn,Lance McCullers Jr.,,,,,NA,,,,,0.369,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,Ramón Urías,Lance McCullers Jr.,,,,,NA,,,,,0.605,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,Nathan Church,Lance McCullers Jr.,,,,,NA,,,,,0.547,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,STL,José Fermín,Lance McCullers Jr.,,,,,NA,,,,,0.364,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Jose Altuve,Andre Pallante,,,,,NA,,,,,0.527,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Yordan Alvarez,Andre Pallante,,,,,NA,,,,,0.865,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Carlos Correa,Andre Pallante,,,,,NA,,,,,0.448,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Christian Walker,Andre Pallante,,,,,NA,,,,,0.717,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Isaac Paredes,Andre Pallante,,,,,NA,,,,,0.282,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Taylor Trammell,Andre Pallante,,,,,NA,,,,,0.457,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Cam Smith,Andre Pallante,,,,,NA,,,,,0.620,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Christian Vázquez,Andre Pallante,,,,,NA,,,,,0.950,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,STL@HOU,HOU,Shay Whitcomb,Andre Pallante,,,,,NA,,,,,0.233,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Brandon Nimmo,George Kirby,,,,,NA,,,,,0.624,14,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Corey Seager,George Kirby,,,,,NA,,,,,0.512,23,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Wyatt Langford,George Kirby,,,,,NA,,,,,0.439,17,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Jake Burger,George Kirby,,,,,NA,,,,,0.571,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Joc Pederson,George Kirby,,,,,NA,,,,,0.558,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Josh Jung,George Kirby,,,,,NA,,,,,0.783,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Evan Carter,George Kirby,,,,,NA,,,,,0.448,10,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Ezequiel Duran,George Kirby,,,,,NA,,,,,0.366,19,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,TEX,Kyle Higashioka,George Kirby,,,,,NA,,,,,0.632,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,J.P. Crawford,Nathan Eovaldi,,,,,NA,,,,,0.342,25,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,Cal Raleigh,Nathan Eovaldi,,,,,NA,,,,,0.423,24,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,Julio Rodríguez,Nathan Eovaldi,,,,,NA,,,,,0.496,24,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,Josh Naylor,Nathan Eovaldi,,,,,NA,,,,,0.412,14,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,Randy Arozarena,Nathan Eovaldi,,,,,NA,,,,,0.497,34,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,Luke Raley,Nathan Eovaldi,,,,,NA,,,,,0.657,18,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,Dominic Canzone,Nathan Eovaldi,,,,,NA,,,,,0.281,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,Cole Young,Nathan Eovaldi,,,,,NA,,,,,0.355,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TEX@SEA,SEA,Leo Rivas,Nathan Eovaldi,,,,,NA,,,,,0.317,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Ronald Acuña Jr.,Cristopher Sánchez,,,,,NA,,,,,0.569,13,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Drake Baldwin,Cristopher Sánchez,,,,,NA,,,,,0.655,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Ozzie Albies,Cristopher Sánchez,,,,,NA,,,,,0.456,16,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Matt Olson,Cristopher Sánchez,,,,,NA,,,,,0.747,21,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Austin Riley,Cristopher Sánchez,,,,,NA,,,,,0.644,13,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Mauricio Dubón,Cristopher Sánchez,,,,,NA,,,,,0.574,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Eli White,Cristopher Sánchez,,,,,NA,,,,,0.519,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Jonah Heim,Cristopher Sánchez,,,,,NA,,,,,0.379,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,ATL,Jorge Mateo,Cristopher Sánchez,,,,,NA,,,,,0.737,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,Trea Turner,Chris Sale,,,,,NA,,,,,0.541,18,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,Kyle Schwarber,Chris Sale,,,,,NA,,,,,0.623,18,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,Bryce Harper,Chris Sale,,,,,NA,,,,,0.785,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,Adolis García,Chris Sale,,,,,NA,,,,,0.391,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,J.T. Realmuto,Chris Sale,,,,,NA,,,,,0.486,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,Alec Bohm,Chris Sale,,,,,NA,,,,,0.180,17,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,Felix Reyes,Chris Sale,,,,,NA,,,,,,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,Edmundo Sosa,Chris Sale,,,,,NA,,,,,0.761,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,ATL@PHI,PHI,Brandon Marsh,Chris Sale,,,,,NA,,,,,0.490,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,LAD@COL,LAD,Shohei Ohtani,Ryan Feltner,,,,,198,,2.5,109,,0.764,11,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,LAD@COL,LAD,Kyle Tucker,Ryan Feltner,,,,,380,,1.5,-129,,0.446,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,LAD,Andy Pages,Ryan Feltner,,,,,430,,1.5,-131,,0.815,10,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,LAD,Freddie Freeman,Ryan Feltner,,,,,NA,,,,,0.607,19,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,LAD@COL,LAD,Teoscar Hernández,Ryan Feltner,,,,,300,,1.5,-138,,0.791,11,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,LAD,Max Muncy,Ryan Feltner,,,,,288,,1.5,104,,0.792,16,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,LAD,Dalton Rushing,Ryan Feltner,,,,,425,,1.5,120,,0.950,2,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,LAD,Alex Freeland,Ryan Feltner,,,,,NA,,,,,0.278,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,LAD@COL,LAD,Miguel Rojas,Ryan Feltner,,,,,825,,1.5,126,,0.520,7,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,COL,Edouard Julien,Emmet Sheehan,,,,,NA,,,,,0.481,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,LAD@COL,COL,Mickey Moniak,Emmet Sheehan,,,,,NA,,,,,0.838,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,LAD@COL,COL,TJ Rumfield,Emmet Sheehan,,,,,700,,1.5,146,,0.365,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,COL,Hunter Goodman,Emmet Sheehan,,,,,330,,1.5,100,,0.784,8,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,COL,Ezequiel Tovar,Emmet Sheehan,,,,,520,,1.5,117,,0.370,14,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,COL,Troy Johnston,Emmet Sheehan,,,,,NA,,,,,0.499,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,LAD@COL,COL,Brenton Doyle,Emmet Sheehan,,,,,588,,1.5,113,,0.464,10,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,LAD@COL,COL,Kyle Karros,Emmet Sheehan,,,,,900,,0.5,-186,,0.316,7,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-18,LAD@COL,COL,Jordan Beck,Emmet Sheehan,,,,,638,,1.5,136,,0.347,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-18,TOR@AZ,TOR,Nathan Lukes,Zac Gallen,,,,,NA,,,,,0.180,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,TOR,Ernie Clement,Zac Gallen,,,,,NA,,,,,0.406,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,TOR,Vladimir Guerrero Jr.,Zac Gallen,,,,,NA,,,,,0.612,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,TOR,Jesús Sánchez,Zac Gallen,,,,,NA,,,,,0.482,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,TOR,Eloy Jiménez,Zac Gallen,,,,,NA,,,,,0.345,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,TOR,Andrés Giménez,Zac Gallen,,,,,NA,,,,,0.478,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,TOR,Kazuma Okamoto,Zac Gallen,,,,,NA,,,,,0.221,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,TOR,Myles Straw,Zac Gallen,,,,,NA,,,,,0.716,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,TOR,Tyler Heineman,Zac Gallen,,,,,NA,,,,,0.324,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Ketel Marte,Max Scherzer,,,,,NA,,,,,0.631,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Corbin Carroll,Max Scherzer,,,,,NA,,,,,0.643,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Geraldo Perdomo,Max Scherzer,,,,,NA,,,,,0.294,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Lourdes Gurriel Jr.,Max Scherzer,,,,,NA,,,,,,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Adrian Del Castillo,Max Scherzer,,,,,NA,,,,,0.696,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Jose Fernandez,Max Scherzer,,,,,NA,,,,,0.410,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Nolan Arenado,Max Scherzer,,,,,NA,,,,,0.613,19,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Ildemaro Vargas,Max Scherzer,,,,,NA,,,,,0.662,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,TOR@AZ,AZ,Alek Thomas,Max Scherzer,,,,,NA,,,,,0.196,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Ramón Laureano,Yusei Kikuchi,,,,,NA,,,,,0.628,34,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Fernando Tatis Jr.,Yusei Kikuchi,,,,,NA,,,,,0.403,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Jackson Merrill,Yusei Kikuchi,,,,,NA,,,,,0.607,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Manny Machado,Yusei Kikuchi,,,,,NA,,,,,0.509,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Xander Bogaerts,Yusei Kikuchi,,,,,NA,,,,,0.725,13,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Miguel Andujar,Yusei Kikuchi,,,,,NA,,,,,0.608,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Ty France,Yusei Kikuchi,,,,,NA,,,,,0.639,14,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Freddy Fermin,Yusei Kikuchi,,,,,NA,,,,,0.434,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,SD,Jake Cronenworth,Yusei Kikuchi,,,,,NA,,,,,0.290,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Zach Neto,Germán Márquez,,,,,NA,,,,,0.629,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Mike Trout,Germán Márquez,,,,,NA,,,,,0.784,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Nolan Schanuel,Germán Márquez,,,,,NA,,,,,0.323,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Jo Adell,Germán Márquez,,,,,NA,,,,,0.687,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Yoán Moncada,Germán Márquez,,,,,NA,,,,,0.588,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Oswald Peraza,Germán Márquez,,,,,NA,,,,,0.786,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Josh Lowe,Germán Márquez,,,,,NA,,,,,0.561,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Logan O'Hoppe,Germán Márquez,,,,,NA,,,,,0.449,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-18,SD@LAA,LAA,Adam Frazier,Germán Márquez,,,,,NA,,,,,0.738,25,,,,,,not_scored,not_scored,Display only,none,not_scored
<!-- batter-outlooks-csv:end -->
*/
