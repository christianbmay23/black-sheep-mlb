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
    impliedAwayPct: 43.21,
    impliedHomePct: 56.79,
    modelAwayPct: 37.22,
    modelHomePct: 62.78,
    edgeAwayPct: -5.99,
    edgeHomePct: 5.99,
    prediction: "NYY",
    decisionTier: "A",
    edgeOnPickPct: 5.99,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Yankee Stadium short porch vs contact-oriented Royals road lineup — price the chalk carefully; props and team totals often clearer than ML.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Maikel Garcia", team: "KC", hrPct: 2.6, tb2Pct: 23.9, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 1.3, tb2Pct: 22.7, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.4, tb2Pct: 8.7, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 2.0, tb2Pct: 21.6, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Carter Jensen", team: "KC", hrPct: 5.8, tb2Pct: 25.2, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Amed Rosario", team: "NYY", hrPct: 9.5, tb2Pct: 38.7, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 18.3, tb2Pct: 55.0, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 3.0, tb2Pct: 19.3, tier: "D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 5.6, tb2Pct: 22.4, tier: "C", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Ben Rice", team: "NYY", hrPct: 17.9, tb2Pct: 55.0, tier: "A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Randal Grichuk", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "José Caballero", team: "NYY", hrPct: 1.3, tb2Pct: 17.3, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 0.4, tb2Pct: 6.5, tier: "D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
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
    impliedAwayPct: 46.73,
    impliedHomePct: 53.27,
    modelAwayPct: 34.84,
    modelHomePct: 65.16,
    edgeAwayPct: -11.89,
    edgeHomePct: 11.89,
    prediction: "MIN",
    decisionTier: "A+",
    edgeOnPickPct: 11.89,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Target Field leans pitcher-friendly early season; lean on probables and bullpen paths before trusting a big ML edge.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Will Benson", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 8.4, tb2Pct: 37.9, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 10.0, tb2Pct: 40.3, tier: "A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 2.0, tb2Pct: 15.6, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Nathaniel Lowe", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 2.7, tb2Pct: 16.4, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 9.5, tb2Pct: 35.5, tier: "A", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Austin Martin", team: "MIN", hrPct: 3.1, tb2Pct: 26.6, tier: "B", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Josh Bell", team: "MIN", hrPct: 6.5, tb2Pct: 30.7, tier: "B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ryan Jeffers", team: "MIN", hrPct: 7.5, tb2Pct: 33.8, tier: "A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 0.4, tb2Pct: 11.0, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 3.8, tb2Pct: 23.3, tier: "C", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 3.9, tb2Pct: 19.5, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Ryan Kreidler", team: "MIN", hrPct: 15.1, tb2Pct: 49.9, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tristan Gray", team: "MIN", hrPct: 6.7, tb2Pct: 30.7, tier: "B", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
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
    impliedAwayPct: 46.10,
    impliedHomePct: 53.90,
    modelAwayPct: 54.76,
    modelHomePct: 45.24,
    edgeAwayPct: 8.67,
    edgeHomePct: -8.67,
    prediction: "NYM",
    decisionTier: "A+",
    edgeOnPickPct: 8.67,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "",
    rationale: "Wrigley wind and cold can suppress HRs — tight market; verify probables and late lineup news.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Carson Benge", team: "NYM", hrPct: 0.4, tb2Pct: 7.8, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Bo Bichette", team: "NYM", hrPct: 1.6, tb2Pct: 18.8, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Francisco Lindor", team: "NYM", hrPct: 3.0, tb2Pct: 19.3, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luis Robert Jr.", team: "NYM", hrPct: 2.8, tb2Pct: 20.1, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "MJ Melendez", team: "NYM", hrPct: 7.7, tb2Pct: 46.8, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Francisco Alvarez", team: "NYM", hrPct: 9.6, tb2Pct: 40.1, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 0.9, tb2Pct: 11.1, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Brett Baty", team: "NYM", hrPct: 0.4, tb2Pct: 8.3, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Marcus Semien", team: "NYM", hrPct: 0.4, tb2Pct: 11.6, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 0.7, tb2Pct: 20.9, tier: "C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 0.4, tb2Pct: 7.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ian Happ", team: "CHC", hrPct: 6.4, tb2Pct: 26.6, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 0.4, tb2Pct: 6.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 11.7, tb2Pct: 42.5, tier: "A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Miguel Amaya", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 4.6, tb2Pct: 23.9, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
    ],
  },
  {
    gameKey: "TB@PIT",
    venue: "PNC Park",
    away: "TB",
    home: "PIT",
    timeEt: "3:30 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "Delayed",
    gameStatusNote: "Delayed — Bottom 4th — TB 0, PIT 4",
    awayScore: 0,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -138,
    homeAmerican: 118,
    impliedAwayPct: 46.10,
    impliedHomePct: 53.90,
    modelAwayPct: 47.83,
    modelHomePct: 52.17,
    edgeAwayPct: 1.73,
    edgeHomePct: -1.73,
    prediction: "PIT",
    decisionTier: "D",
    edgeOnPickPct: -1.73,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Rays talent vs Pirates home spot — check opener/bulk roles; modest ML edge only if price is wrong.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Junior Caminero", team: "TB", hrPct: 1.8, tb2Pct: 19.3, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 0.6, tb2Pct: 15.6, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 2.1, tb2Pct: 26.7, tier: "B", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jake Fraley", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Richie Palacios", team: "TB", hrPct: 0.4, tb2Pct: 20.2, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Hunter Feduccia", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.4, tb2Pct: 7.1, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 10.4, tb2Pct: 44.2, tier: "A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 6.6, tb2Pct: 32.3, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 2.7, tb2Pct: 27.0, tier: "B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 5.3, tb2Pct: 32.3, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 0.4, tb2Pct: 12.1, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 0.4, tb2Pct: 14.8, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Spencer Horwitz", team: "PIT", hrPct: 0.4, tb2Pct: 9.5, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Henry Davis", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "SF@WSH",
    venue: "Nationals Park",
    away: "SF",
    home: "WSH",
    timeEt: "4:05 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 8th — SF 6, WSH 5",
    awayScore: 6,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -112,
    homeAmerican: 102,
    impliedAwayPct: 56.42,
    impliedHomePct: 43.58,
    modelAwayPct: 53.92,
    modelHomePct: 46.08,
    edgeAwayPct: -2.50,
    edgeHomePct: 2.50,
    prediction: "SF",
    decisionTier: "D",
    edgeOnPickPct: -2.50,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Willy Adames", team: "SF", hrPct: 6.2, tb2Pct: 32.0, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 12.7, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Matt Chapman", team: "SF", hrPct: 1.2, tb2Pct: 20.9, tier: "C", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Rafael Devers", team: "SF", hrPct: 3.5, tb2Pct: 18.2, tier: "D", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 8.7, tb2Pct: 40.4, tier: "A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 2.2, tb2Pct: 22.9, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 2.9, tb2Pct: 19.2, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 9.1, tb2Pct: 32.3, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 15.7, tb2Pct: 54.6, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 3.6, tb2Pct: 23.1, tier: "C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "José Tena", team: "WSH", hrPct: 2.6, tb2Pct: 28.1, tier: "B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 13.1, tb2Pct: 51.4, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jacob Young", team: "WSH", hrPct: 4.6, tb2Pct: 28.2, tier: "B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 2.3, tb2Pct: 21.7, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.4, tb2Pct: 6.2, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "CWS@ATH",
    venue: "Oakland Coliseum",
    away: "CWS",
    home: "ATH",
    timeEt: "4:05 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 8th — CWS 6, ATH 6",
    awayScore: 6,
    homeScore: 6,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 41.60,
    impliedHomePct: 58.40,
    modelAwayPct: 65.72,
    modelHomePct: 34.28,
    edgeAwayPct: 24.12,
    edgeHomePct: -24.12,
    prediction: "CWS",
    decisionTier: "A+",
    edgeOnPickPct: 24.12,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "",
    rationale: "Oakland environment and travel spot — volatility; prefer game props unless you have a clear pitching mismatch.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 6.7, tb2Pct: 31.9, tier: "B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 14.1, tb2Pct: 44.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 3.6, tb2Pct: 18.6, tier: "D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 4.5, tb2Pct: 20.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 14.4, tb2Pct: 49.6, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 2.2, tb2Pct: 18.9, tier: "D", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Tristan Peters", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Reese McGuire", team: "CWS", hrPct: 0.4, tb2Pct: 10.9, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.4, tb2Pct: 17.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 6.4, tb2Pct: 34.0, tier: "A", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 5.9, tb2Pct: 31.4, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 2.2, tb2Pct: 20.7, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.4, tb2Pct: 7.5, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 1.2, tb2Pct: 20.1, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Max Muncy", team: "ATH", hrPct: 4.2, tb2Pct: 29.6, tier: "B", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 0.4, tb2Pct: 11.8, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Austin Wynns", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "DET@BOS",
    venue: "Fenway Park",
    away: "DET",
    home: "BOS",
    timeEt: "4:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 9th — DET 4, BOS 1",
    awayScore: 4,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 118,
    homeAmerican: -132,
    impliedAwayPct: 44.22,
    impliedHomePct: 55.78,
    modelAwayPct: 58.39,
    modelHomePct: 41.61,
    edgeAwayPct: 14.17,
    edgeHomePct: -14.17,
    prediction: "DET",
    decisionTier: "A+",
    edgeOnPickPct: 14.17,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Fenway doubles and wall-ball noise — model park correctly before trusting a big ML number.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Kevin McGonigle", team: "DET", hrPct: 5.9, tb2Pct: 34.3, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.5, tb2Pct: 15.8, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Colt Keith", team: "DET", hrPct: 5.9, tb2Pct: 33.2, tier: "A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Riley Greene", team: "DET", hrPct: 6.9, tb2Pct: 36.2, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 3.8, tb2Pct: 21.6, tier: "C", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Kerry Carpenter", team: "DET", hrPct: 13.4, tb2Pct: 39.2, tier: "A+", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 1.7, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Javier Báez", team: "DET", hrPct: 2.4, tb2Pct: 23.4, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jake Rogers", team: "DET", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 1.8, tb2Pct: 21.2, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Andruw Monasterio", team: "BOS", hrPct: 0.4, tb2Pct: 15.7, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 5.5, tb2Pct: 32.3, tier: "A", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.4, tb2Pct: 12.2, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 3.5, tb2Pct: 25.5, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 0.4, tb2Pct: 13.7, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Connor Wong", team: "BOS", hrPct: 1.0, tb2Pct: 24.4, tier: "C", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Isiah Kiner-Falefa", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "MIL@MIA",
    venue: "loanDepot park",
    away: "MIL",
    home: "MIA",
    timeEt: "4:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 8th — MIL 5, MIA 1",
    awayScore: 5,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -118,
    homeAmerican: 108,
    impliedAwayPct: 52.18,
    impliedHomePct: 47.82,
    modelAwayPct: 44.42,
    modelHomePct: 55.58,
    edgeAwayPct: -7.76,
    edgeHomePct: 7.76,
    prediction: "MIA",
    decisionTier: "A",
    edgeOnPickPct: 7.76,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Miami run suppression helps pitching — lean Brewers only if the price matches your starter read.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "William Contreras", team: "MIL", hrPct: 0.8, tb2Pct: 23.8, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Brice Turang", team: "MIL", hrPct: 4.6, tb2Pct: 29.8, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 8.6, tb2Pct: 37.3, tier: "A", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 5.7, tb2Pct: 29.2, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 4.7, tb2Pct: 32.4, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 1.2, tb2Pct: 25.1, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 0.4, tb2Pct: 13.2, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 2.5, tb2Pct: 21.9, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 7.3, tb2Pct: 39.9, tier: "A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Connor Norby", team: "MIA", hrPct: 1.9, tb2Pct: 21.3, tier: "C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 4.2, tb2Pct: 20.0, tier: "D", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Heriberto Hernández", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Javier Sanoja", team: "MIA", hrPct: 0.4, tb2Pct: 8.6, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "BAL@CLE",
    venue: "Progressive Field",
    away: "BAL",
    home: "CLE",
    timeEt: "6:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "End 1st — BAL 0, CLE 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -108,
    homeAmerican: -102,
    impliedAwayPct: 47.82,
    impliedHomePct: 52.18,
    modelAwayPct: 56.77,
    modelHomePct: 43.23,
    edgeAwayPct: 8.95,
    edgeHomePct: -8.95,
    prediction: "BAL",
    decisionTier: "A+",
    edgeOnPickPct: 8.95,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "",
    rationale: "Progressive Field — coin-flip pricing common; prioritize handedness and bullpen availability.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 8.0, tb2Pct: 29.8, tier: "B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.4, tb2Pct: 17.7, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 2.6, tb2Pct: 20.3, tier: "C", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Colton Cowser", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 0.4, tb2Pct: 22.6, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 4.0, tb2Pct: 16.0, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 9.3, tb2Pct: 36.3, tier: "A", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 5.0, tb2Pct: 25.8, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "José Ramírez", team: "CLE", hrPct: 4.2, tb2Pct: 28.8, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 1.1, tb2Pct: 17.3, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "George Valera", team: "CLE", hrPct: 2.3, tb2Pct: 32.5, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 2.1, tb2Pct: 16.7, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 7.4, tb2Pct: 40.2, tier: "A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Bo Naylor", team: "CLE", hrPct: 0.4, tb2Pct: 8.7, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.4, tb2Pct: 12.2, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "STL@HOU",
    venue: "Minute Maid Park",
    away: "STL",
    home: "HOU",
    timeEt: "7:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 155,
    homeAmerican: -175,
    impliedAwayPct: 43.44,
    impliedHomePct: 56.56,
    modelAwayPct: 43.32,
    modelHomePct: 56.68,
    edgeAwayPct: -0.12,
    edgeHomePct: 0.12,
    prediction: "HOU",
    decisionTier: "C",
    edgeOnPickPct: 0.12,
    modelConfidence: "High",
    analystConfidence: "Medium-High",
    flags: "",
    rationale: "Astros home talent vs Cardinals road — market often prices Houston heavy; PASS unless you see a real innings edge.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "JJ Wetherholt", team: "STL", hrPct: 3.5, tb2Pct: 20.2, tier: "C", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Iván Herrera", team: "STL", hrPct: 5.2, tb2Pct: 29.1, tier: "B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Alec Burleson", team: "STL", hrPct: 7.7, tb2Pct: 38.5, tier: "A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Jordan Walker", team: "STL", hrPct: 19.3, tb2Pct: 55.0, tier: "A+", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 1.9, tb2Pct: 10.5, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Ramón Urías", team: "STL", hrPct: 6.2, tb2Pct: 30.6, tier: "B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Nathan Church", team: "STL", hrPct: 1.3, tb2Pct: 15.6, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "José Fermín", team: "STL", hrPct: 0.4, tb2Pct: 6.3, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Jose Altuve", team: "HOU", hrPct: 4.9, tb2Pct: 28.2, tier: "B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 18.9, tb2Pct: 55.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Carlos Correa", team: "HOU", hrPct: 4.7, tb2Pct: 28.0, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Christian Walker", team: "HOU", hrPct: 9.8, tb2Pct: 39.1, tier: "A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 2.7, tb2Pct: 22.0, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Cam Smith", team: "HOU", hrPct: 10.3, tb2Pct: 42.0, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Christian Vázquez", team: "HOU", hrPct: 13.3, tb2Pct: 55.0, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nick Allen", team: "HOU", hrPct: 1.1, tb2Pct: 12.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "TEX@SEA",
    venue: "T-Mobile Park",
    away: "TEX",
    home: "SEA",
    timeEt: "7:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 42.50,
    impliedHomePct: 57.50,
    modelAwayPct: 43.68,
    modelHomePct: 56.32,
    edgeAwayPct: 1.18,
    edgeHomePct: -1.18,
    prediction: "SEA",
    decisionTier: "D",
    edgeOnPickPct: -1.18,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "T-Mobile Park suppresses offense — pitching duel pricing; props and totals often cleaner.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 3.7, tb2Pct: 26.2, tier: "B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Corey Seager", team: "TEX", hrPct: 4.4, tb2Pct: 23.5, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.4, tb2Pct: 8.6, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Jake Burger", team: "TEX", hrPct: 4.6, tb2Pct: 25.9, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.4, tb2Pct: 11.5, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Josh Jung", team: "TEX", hrPct: 1.3, tb2Pct: 28.8, tier: "B", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Evan Carter", team: "TEX", hrPct: 0.9, tb2Pct: 14.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ezequiel Duran", team: "TEX", hrPct: 0.4, tb2Pct: 14.0, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Kyle Higashioka", team: "TEX", hrPct: 2.6, tb2Pct: 22.2, tier: "C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 1.5, tb2Pct: 13.8, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 1.6, tb2Pct: 19.5, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.4, tb2Pct: 6.7, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.4, tb2Pct: 16.7, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Luke Raley", team: "SEA", hrPct: 10.8, tb2Pct: 48.4, tier: "A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 5.3, tb2Pct: 24.9, tier: "C", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.4, tb2Pct: 8.3, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "ATL@PHI",
    venue: "Citizens Bank Park",
    away: "ATL",
    home: "PHI",
    timeEt: "7:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 105,
    homeAmerican: -115,
    impliedAwayPct: 47.97,
    impliedHomePct: 52.03,
    modelAwayPct: 43.26,
    modelHomePct: 56.74,
    edgeAwayPct: -4.71,
    edgeHomePct: 4.71,
    prediction: "PHI",
    decisionTier: "B",
    edgeOnPickPct: 4.71,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "NL East heavyweight pricing — small edges only; watch weather and late scratches.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 4.4, tb2Pct: 30.4, tier: "B", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 6.3, tb2Pct: 35.6, tier: "A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.4, tb2Pct: 15.6, tier: "D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Matt Olson", team: "ATL", hrPct: 12.3, tb2Pct: 46.5, tier: "A+", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Austin Riley", team: "ATL", hrPct: 6.2, tb2Pct: 30.7, tier: "B", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 1.8, tb2Pct: 23.5, tier: "C", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Eli White", team: "ATL", hrPct: 0.4, tb2Pct: 11.3, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jonah Heim", team: "ATL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jorge Mateo", team: "ATL", hrPct: 6.8, tb2Pct: 45.9, tier: "A+", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 16.4, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 13.2, tb2Pct: 41.0, tier: "A+", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 7.9, tb2Pct: 42.4, tier: "A+", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Adolis García", team: "PHI", hrPct: 3.1, tb2Pct: 19.2, tier: "D", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "J.T. Realmuto", team: "PHI", hrPct: 0.4, tb2Pct: 17.5, tier: "D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Felix Reyes", team: "PHI", hrPct: 1.9, tb2Pct: 15.3, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Edmundo Sosa", team: "PHI", hrPct: 3.4, tb2Pct: 24.9, tier: "C", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 3.0, tb2Pct: 25.6, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "LAD@COL",
    venue: "Coors Field",
    away: "LAD",
    home: "COL",
    timeEt: "8:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -185,
    homeAmerican: 165,
    impliedAwayPct: 71.35,
    impliedHomePct: 28.65,
    modelAwayPct: 56.36,
    modelHomePct: 43.64,
    edgeAwayPct: -14.99,
    edgeHomePct: 14.99,
    prediction: "LAD",
    decisionTier: "D",
    edgeOnPickPct: -14.99,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Coors elevates variance — Dodgers talent priced in; Rockies bats can still pop in chunks.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 18.9, tb2Pct: 55.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 8.4, tb2Pct: 28.9, tier: "B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Andy Pages", team: "LAD", hrPct: 16.9, tb2Pct: 55.0, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 16.0, tb2Pct: 55.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 15.6, tb2Pct: 50.7, tier: "A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Max Muncy", team: "LAD", hrPct: 20.4, tb2Pct: 55.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 25.0, tb2Pct: 55.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 8.5, tb2Pct: 27.4, tier: "B", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Miguel Rojas", team: "LAD", hrPct: 8.0, tb2Pct: 37.9, tier: "A", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Edouard Julien", team: "COL", hrPct: 5.7, tb2Pct: 28.8, tier: "B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 12.8, tb2Pct: 41.6, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 4.4, tb2Pct: 22.7, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 10.7, tb2Pct: 37.2, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 4.2, tb2Pct: 26.5, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Troy Johnston", team: "COL", hrPct: 4.8, tb2Pct: 26.4, tier: "B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 3.1, tb2Pct: 17.2, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Kyle Karros", team: "COL", hrPct: 2.5, tb2Pct: 14.8, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jordan Beck", team: "COL", hrPct: 1.6, tb2Pct: 7.3, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "TOR@AZ",
    venue: "Chase Field",
    away: "TOR",
    home: "AZ",
    timeEt: "8:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -112,
    homeAmerican: 102,
    impliedAwayPct: 50.23,
    impliedHomePct: 49.77,
    modelAwayPct: 47.04,
    modelHomePct: 52.96,
    edgeAwayPct: -3.19,
    edgeHomePct: 3.19,
    prediction: "AZ",
    decisionTier: "B",
    edgeOnPickPct: 3.19,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Nathan Lukes", team: "TOR", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 1.1, tb2Pct: 20.2, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 8.1, tb2Pct: 40.4, tier: "A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 8.4, tb2Pct: 38.8, tier: "A+", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Eloy Jiménez", team: "TOR", hrPct: 0.8, tb2Pct: 11.3, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 5.7, tb2Pct: 30.8, tier: "B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 3.2, tb2Pct: 14.8, tier: "D", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Myles Straw", team: "TOR", hrPct: 10.0, tb2Pct: 45.3, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tyler Heineman", team: "TOR", hrPct: 1.9, tb2Pct: 15.4, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Ketel Marte", team: "AZ", hrPct: 13.9, tb2Pct: 45.6, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 15.3, tb2Pct: 55.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Geraldo Perdomo", team: "AZ", hrPct: 4.2, tb2Pct: 13.7, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 10.4, tb2Pct: 30.0, tier: "A", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 13.8, tb2Pct: 52.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jose Fernandez", team: "AZ", hrPct: 9.2, tb2Pct: 34.2, tier: "A", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 7.9, tb2Pct: 27.9, tier: "B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 12.0, tb2Pct: 48.9, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 6.5, tb2Pct: 21.3, tier: "C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "SD@LAA",
    venue: "Angel Stadium",
    away: "SD",
    home: "LAA",
    timeEt: "9:38 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -128,
    homeAmerican: 118,
    impliedAwayPct: 51.58,
    impliedHomePct: 48.42,
    modelAwayPct: 50.97,
    modelHomePct: 49.03,
    edgeAwayPct: -0.61,
    edgeHomePct: 0.61,
    prediction: "SD",
    decisionTier: "D",
    edgeOnPickPct: -0.61,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Ramón Laureano", team: "SD", hrPct: 12.4, tb2Pct: 49.7, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 11.1, tb2Pct: 38.2, tier: "A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 9.8, tb2Pct: 40.8, tier: "A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Manny Machado", team: "SD", hrPct: 8.1, tb2Pct: 27.4, tier: "B", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 12.1, tb2Pct: 42.7, tier: "A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 5.3, tb2Pct: 34.3, tier: "A", note: "RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Ty France", team: "SD", hrPct: 8.0, tb2Pct: 36.0, tier: "A", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Freddy Fermin", team: "SD", hrPct: 2.4, tb2Pct: 15.5, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jake Cronenworth", team: "SD", hrPct: 3.2, tb2Pct: 14.7, tier: "D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 7.8, tb2Pct: 32.3, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mike Trout", team: "LAA", hrPct: 17.7, tb2Pct: 55.0, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 3.1, tb2Pct: 16.8, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jo Adell", team: "LAA", hrPct: 7.7, tb2Pct: 36.2, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 5.2, tb2Pct: 21.1, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 9.5, tb2Pct: 38.3, tier: "A+", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 3.8, tb2Pct: 16.4, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 3.2, tb2Pct: 18.5, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 7.8, tb2Pct: 42.1, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
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
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,game_status_bucket,game_state,game_state_detail,game_status_note,away_score,home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary
2026-04-18,KC,NYY,1:35 PM,Noah Cameron,Will Warren,126,-139,8.0,-105,-115,62F / 9 mph wind / 0% precip / Open,62.4,8.8,0,0.285,0.381,0.412,0.470,final,Final,Final,"Final — KC 4, NYY 13",4,13,Verified,,43.21,56.79,37.22,62.78,-5.99,5.99,NYY,A,5.99,High,,Medium,Yankee Stadium short porch vs contact-oriented Royals road lineup — price the chalk carefully; props and team totals often clearer than ML.
2026-04-18,CIN,MIN,2:10 PM,Andrew Abbott,Taj Bradley,109,-120,8.0,-105,-115,41F / 16 mph wind / 0% precip / Open,40.7,15.5,0,0.359,0.366,0.398,0.594,final,Final,Final,"Final — CIN 5, MIN 4",5,4,Verified,,46.73,53.27,34.84,65.16,-11.89,11.89,MIN,A+,11.89,High,,Medium,Target Field leans pitcher-friendly early season; lean on probables and bullpen paths before trusting a big ML edge.
2026-04-18,NYM,CHC,2:20 PM,Freddy Peralta,Jameson Taillon,112,-123,8.5,-105,-115,48F / 14 mph wind / 0% precip / Open,47.8,14.1,0,0.442,0.418,0.418,0.518,final,Final,Final,"Final — NYM 2, CHC 4",2,4,Verified,,46.10,53.90,54.76,45.24,8.67,-8.67,NYM,A+,8.67,High,,Low,Wrigley wind and cold can suppress HRs — tight market; verify probables and late lineup news.
2026-04-18,TB,PIT,3:30 PM,Drew Rasmussen,Paul Skenes,112,-123,7.5,-120,100,83F / 16 mph wind / 3% precip / Open,83.1,15.6,3,0.343,0.363,0.481,0.534,live,Live,Delayed,"Delayed — Bottom 4th — TB 0, PIT 4",0,4,Verified,,46.10,53.90,47.83,52.17,1.73,-1.73,PIT,D,-1.73,High,,Medium,Rays talent vs Pirates home spot — check opener/bulk roles; modest ML edge only if price is wrong.
2026-04-18,SF,WSH,4:05 PM,Adrian Houser,Cade Cavalli,-137,124,8.5,-105,-115,78F / 12 mph wind / 0% precip / Open,78.4,12.0,0,0.384,0.297,0.535,0.525,live,Live,In Progress,"Top 8th — SF 6, WSH 5",6,5,Verified,,56.42,43.58,53.92,46.08,-2.50,2.50,SF,D,-2.50,High,,Medium,Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites.
2026-04-18,CWS,ATH,4:05 PM,Erick Fedde,Luis Severino,134,-150,9.5,-105,-115,74F / 6 mph wind / 0% precip / Open,74.0,5.8,0,0.392,0.356,0.447,0.461,live,Live,In Progress,"Bottom 8th — CWS 6, ATH 6",6,6,Verified,,41.60,58.40,65.72,34.28,24.12,-24.12,CWS,A+,24.12,High,,Low,Oakland environment and travel spot — volatility; prefer game props unless you have a clear pitching mismatch.
2026-04-18,DET,BOS,4:10 PM,Tarik Skubal,Brayan Bello,121,-133,7.0,-110,-110,48F / 10 mph wind / 1% precip / Open,48.4,10.0,1,0.429,0.443,0.469,0.467,live,Live,In Progress,"Top 9th — DET 4, BOS 1",4,1,Verified,,44.22,55.78,58.39,41.61,14.17,-14.17,DET,A+,14.17,High,,Medium,Fenway doubles and wall-ball noise — model park correctly before trusting a big ML number.
2026-04-18,MIL,MIA,4:10 PM,Brandon Woodruff,Sandy Alcantara,-115,104,8.5,105,-125,84F / 9 mph wind / 0% precip / Retractable,83.6,8.6,0,0.370,0.408,0.469,0.459,live,Live,In Progress,"Top 8th — MIL 5, MIA 1",5,1,Verified,,52.18,47.82,44.42,55.58,-7.76,7.76,MIA,A,7.76,High,,Medium,Miami run suppression helps pitching — lean Brewers only if the price matches your starter read.
2026-04-18,BAL,CLE,6:10 PM,Dean Kremer,Gavin Williams,104,-115,7.5,110,-130,51F / 13 mph wind / 30% precip / Open,50.6,13.3,30,0.400,0.341,0.472,0.524,live,Live,In Progress,"End 1st — BAL 0, CLE 0",0,0,Verified,,47.82,52.18,56.77,43.23,8.95,-8.95,BAL,A+,8.95,High,,Low,Progressive Field — coin-flip pricing common; prioritize handedness and bullpen availability.
2026-04-18,STL,HOU,7:10 PM,Andre Pallante,Lance McCullers Jr.,120,-145,9.0,-110,-110,69F / 11 mph wind / 70% precip / Retractable,68.6,11.2,70,0.346,0.370,0.537,0.576,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,43.44,56.56,43.32,56.68,-0.12,0.12,HOU,C,0.12,High,,Medium-High,Astros home talent vs Cardinals road — market often prices Houston heavy; PASS unless you see a real innings edge.
2026-04-18,TEX,SEA,7:15 PM,Nathan Eovaldi,George Kirby,128,-146,7.0,-105,-115,63F / 4 mph wind / 2% precip / Retractable,62.9,4.2,2,0.402,0.412,0.548,0.420,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,42.50,57.50,43.68,56.32,1.18,-1.18,SEA,D,-1.18,High,,Medium,T-Mobile Park suppresses offense — pitching duel pricing; props and totals often cleaner.
2026-04-18,ATL,PHI,7:15 PM,Chris Sale,Cristopher Sánchez,102,-116,8.5,-102,-118,63F / 11 mph wind / 0% precip / Open,63.3,11.3,0,0.518,0.478,0.586,0.522,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,47.97,52.03,43.26,56.74,-4.71,4.71,PHI,B,4.71,High,,Medium,NL East heavyweight pricing — small edges only; watch weather and late scratches.
2026-04-18,LAD,COL,8:10 PM,Emmet Sheehan,Ryan Feltner,-280,238,11.5,-108,-112,58F / 7 mph wind / 0% precip / Open,58.2,7.3,0,0.446,0.398,0.663,0.496,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,71.35,28.65,56.36,43.64,-14.99,14.99,LAD,D,-14.99,High,,Medium,Coors elevates variance — Dodgers talent priced in; Rockies bats can still pop in chunks.
2026-04-18,TOR,AZ,8:10 PM,Max Scherzer,Zac Gallen,-108,-106,8.0,-112,-108,89F / 2 mph wind / 0% precip / Retractable,89.1,2.3,0,0.427,0.494,0.418,0.510,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,50.23,49.77,47.04,52.96,-3.19,3.19,AZ,B,3.19,High,,Medium,Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge.
2026-04-18,SD,LAA,9:38 PM,Germán Márquez,Yusei Kikuchi,-114,100,8.5,-115,-105,67F / 9 mph wind / 0% precip / Open,66.8,9.2,0,0.499,0.380,0.538,0.616,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,51.58,48.42,50.97,49.03,-0.61,0.61,SD,D,-0.61,High,,Medium,Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,data_confidence,market_data_status
2026-04-18,KC@NYY,KC,Maikel Garcia,Will Warren,2.58,23.89,+3770,+319,NA,,1.5,250,-4.68,0.524,6,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Bobby Witt Jr.,Will Warren,1.32,22.70,+7450,+340,NA,,1.5,150,-17.30,0.443,6,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Vinnie Pasquantino,Will Warren,0.40,8.68,+24900,+1053,NA,,1.5,150,-31.32,0.387,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Jac Caglianone,Will Warren,1.97,21.56,+4971,+364,NA,,1.5,150,-18.44,0.416,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Carter Jensen,Will Warren,5.84,25.21,+1613,+297,NA,,1.5,150,-14.79,0.647,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Michael Massey,Will Warren,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.295,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Isaac Collins,Will Warren,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.305,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Lane Thomas,Will Warren,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.444,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Kyle Isbel,Will Warren,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.248,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Amed Rosario,Noah Cameron,9.47,38.68,+956,+159,NA,,1.5,450,20.50,0.672,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Aaron Judge,Noah Cameron,18.34,55.00,+445,-122,NA,,1.5,150,15.00,0.813,3,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Cody Bellinger,Noah Cameron,3.04,19.27,+3185,+419,NA,,1.5,550,3.88,0.412,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Giancarlo Stanton,Noah Cameron,5.60,22.37,+1684,+347,NA,,1.5,100,-27.63,0.356,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Ben Rice,Noah Cameron,17.93,55.00,+458,-122,NA,,1.5,450,36.82,0.851,2,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Randal Grichuk,Noah Cameron,0.40,6.00,+24900,+1567,NA,,1.5,250,-22.57,0.180,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Jazz Chisholm Jr.,Noah Cameron,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.270,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,José Caballero,Noah Cameron,1.28,17.28,+7728,+479,NA,,1.5,200,-16.06,0.499,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,J.C. Escarra,Noah Cameron,0.40,6.51,+24900,+1436,NA,,1.5,350,-15.71,0.180,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,TJ Friedl,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.248,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Will Benson,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.312,3,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Elly De La Cruz,Taj Bradley,8.43,37.86,+1086,+164,NA,,1.5,150,-2.14,0.705,3,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Sal Stewart,Taj Bradley,10.03,40.25,+897,+148,NA,,1.5,150,0.25,0.763,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Eugenio Suárez,Taj Bradley,2.04,15.56,+4796,+543,NA,,1.5,250,-13.01,0.487,8,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Nathaniel Lowe,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,250,-22.57,0.310,8,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Tyler Stephenson,Taj Bradley,2.72,16.37,+3574,+511,NA,,1.5,150,-23.63,0.399,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Rece Hinds,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.180,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Ke'Bryan Hayes,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.180,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Byron Buxton,Andrew Abbott,9.55,35.49,+947,+182,NA,,1.5,150,-4.51,0.668,3,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Austin Martin,Andrew Abbott,3.14,26.64,+3088,+275,NA,,1.5,150,-13.36,0.667,3,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Josh Bell,Andrew Abbott,6.49,30.68,+1442,+226,NA,,1.5,250,2.11,0.466,2,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Ryan Jeffers,Andrew Abbott,7.55,33.83,+1225,+196,NA,,1.5,350,11.61,0.655,2,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Luke Keaschall,Andrew Abbott,0.40,11.03,+24900,+807,NA,,1.5,250,-17.54,0.376,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Trevor Larnach,Andrew Abbott,3.79,23.25,+2537,+330,NA,,1.5,100,-26.75,0.506,6,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Brooks Lee,Andrew Abbott,3.92,19.51,+2452,+412,NA,,1.5,150,-20.49,0.614,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Ryan Kreidler,Andrew Abbott,15.10,49.87,+562,+101,NA,,1.5,250,21.29,0.868,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Tristan Gray,Andrew Abbott,6.72,30.72,+1389,+225,NA,,1.5,150,-9.28,0.527,2,B,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,Carson Benge,Jameson Taillon,0.40,7.83,+24900,+1177,NA,,1.5,150,-32.17,0.262,156,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,Bo Bichette,Jameson Taillon,1.57,18.85,+6288,+431,NA,,1.5,150,-21.15,0.432,156,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,Francisco Lindor,Jameson Taillon,3.04,19.33,+3187,+417,NA,,1.5,200,-14.00,0.357,156,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,Luis Robert Jr.,Jameson Taillon,2.77,20.08,+3512,+398,NA,,1.5,350,-2.15,0.422,156,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,MJ Melendez,Jameson Taillon,7.67,46.83,+1204,+114,NA,,1.5,100,-3.17,0.950,156,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,Francisco Alvarez,Jameson Taillon,9.62,40.08,+939,+149,NA,,1.5,150,0.08,0.550,156,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,Mark Vientos,Jameson Taillon,0.90,11.07,+11005,+803,NA,,1.5,450,-7.11,0.226,156,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,Brett Baty,Jameson Taillon,0.40,8.26,+24900,+1110,NA,,1.5,100,-41.74,0.254,156,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,NYM,Marcus Semien,Jameson Taillon,0.40,11.64,+24900,+759,NA,,1.5,150,-28.36,0.306,156,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Nico Hoerner,Freddy Peralta,0.73,20.94,+13629,+378,NA,,1.5,150,-19.06,0.761,202,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Michael Busch,Freddy Peralta,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.180,202,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Alex Bregman,Freddy Peralta,0.40,7.22,+24900,+1285,NA,,1.5,150,-32.78,0.356,202,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Ian Happ,Freddy Peralta,6.40,26.63,+1463,+275,NA,,1.5,450,8.45,0.571,202,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Seiya Suzuki,Freddy Peralta,0.40,6.24,+24900,+1503,NA,,1.5,100,-43.76,0.433,202,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Moisés Ballesteros,Freddy Peralta,11.66,42.53,+758,+135,NA,,1.5,150,2.53,0.950,202,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Miguel Amaya,Freddy Peralta,0.40,6.01,+24900,+1563,NA,,1.5,150,-33.99,0.326,202,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Pete Crow-Armstrong,Freddy Peralta,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.362,202,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,NYM@CHC,CHC,Dansby Swanson,Freddy Peralta,4.62,23.94,+2065,+318,NA,,1.5,100,-26.06,0.726,202,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,TB,Chandler Simpson,Paul Skenes,0.40,6.00,+24900,+1567,2900,-2.93,0.5,-108,-45.92,0.415,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Junior Caminero,Paul Skenes,1.75,19.28,+5604,+419,650,-11.58,1.5,114,-27.45,0.656,3,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Jonathan Aranda,Paul Skenes,0.65,15.55,+15379,+543,850,-9.88,0.5,128,-28.31,0.420,3,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Yandy Díaz,Paul Skenes,2.07,26.69,+4735,+275,1100,-6.27,0.5,117,-19.39,0.606,8,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Jake Fraley,Paul Skenes,0.40,6.00,+24900,+1567,1700,-5.16,1.5,143,-35.15,0.373,7,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Cedric Mullins,Paul Skenes,0.40,6.00,+24900,+1567,1050,-8.30,0.5,165,-31.74,0.370,2,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Richie Palacios,Paul Skenes,0.40,20.20,+24900,+395,2200,-3.95,1.5,180,-15.51,0.749,3,C,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Hunter Feduccia,Paul Skenes,0.40,6.00,+24900,+1567,NA,,1.5,50,-60.67,0.301,1,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,TB,Taylor Walls,Paul Skenes,0.40,7.14,+24900,+1301,2400,-3.60,0.5,160,-31.32,0.440,5,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,PIT,Oneil Cruz,Drew Rasmussen,10.42,44.19,+860,+126,NA,,0.5,112,-2.98,0.716,2,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Brandon Lowe,Drew Rasmussen,6.56,32.33,+1424,+209,NA,,0.5,125,-12.11,0.709,0,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Bryan Reynolds,Drew Rasmussen,2.75,27.04,+3539,+270,NA,,0.5,120,-18.42,0.588,5,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Ryan O'Hearn,Drew Rasmussen,5.26,32.32,+1802,+209,NA,,1.5,150,-7.68,0.518,5,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Marcell Ozuna,Drew Rasmussen,0.40,12.14,+24900,+724,NA,,1.5,100,-37.86,0.458,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Nick Yorke,Drew Rasmussen,0.40,14.82,+24900,+575,NA,,1.5,150,-25.18,0.441,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Spencer Horwitz,Drew Rasmussen,0.40,9.48,+24900,+955,NA,,0.5,117,-36.60,0.661,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Konnor Griffin,Drew Rasmussen,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.351,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Henry Davis,Drew Rasmussen,0.40,6.00,+24900,+1567,NA,,1.5,50,-60.67,0.365,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,SF,Willy Adames,Cade Cavalli,6.15,32.04,+1525,+212,1550,0.09,1.5,260,4.26,0.703,0,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Luis Arraez,Cade Cavalli,0.40,12.72,+24900,+686,4250,-1.90,2.5,215,-19.03,0.470,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Matt Chapman,Cade Cavalli,1.20,20.95,+8226,+377,2000,-3.56,1.5,312,-3.32,0.551,0,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Rafael Devers,Cade Cavalli,3.51,18.22,+2752,+449,2200,-0.84,1.5,445,-0.13,0.364,2,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Casey Schmitt,Cade Cavalli,8.68,40.40,+1052,+148,1250,1.27,2.5,525,24.40,0.803,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Jung Hoo Lee,Cade Cavalli,2.21,22.90,+4416,+337,2750,-1.29,2.5,188,-11.82,0.555,0,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Heliot Ramos,Cade Cavalli,2.94,19.21,+3305,+421,NA,,1.5,650,5.87,0.432,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,SF,Drew Gilbert,Cade Cavalli,9.08,32.31,+1001,+209,4000,6.64,1.5,390,11.90,0.756,0,A,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Patrick Bailey,Cade Cavalli,0.40,6.00,+24900,+1567,2500,-3.45,1.5,265,-21.40,0.180,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,WSH,James Wood,Adrian Houser,15.68,54.57,+538,-120,NA,,1.5,450,36.38,0.858,4,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Luis García Jr.,Adrian Houser,3.58,23.10,+2695,+333,NA,,1.5,150,-16.90,0.431,4,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,José Tena,Adrian Houser,2.58,28.08,+3777,+256,NA,,1.5,220,-3.17,0.578,0,B,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,CJ Abrams,Adrian Houser,13.13,51.35,+661,-106,NA,,1.5,525,35.35,0.950,3,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Jacob Young,Adrian Houser,4.61,28.19,+2069,+255,NA,,1.5,235,-1.66,0.494,3,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Daylen Lile,Adrian Houser,2.33,21.72,+4186,+360,NA,,3.5,182,-13.74,0.392,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Nasim Nuñez,Adrian Houser,0.40,6.00,+24900,+1567,NA,,1.5,925,-3.76,0.279,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Jorbit Vivas,Adrian Houser,0.40,6.00,+24900,+1567,NA,,1.5,1300,-1.14,0.452,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Drew Millas,Adrian Houser,0.40,6.22,+24900,+1507,NA,,2.5,315,-17.87,0.292,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Andrew Benintendi,Luis Severino,6.75,31.87,+1382,+214,NA,,1.5,450,13.69,0.441,40,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Munetaka Murakami,Luis Severino,14.10,44.03,+609,+127,NA,,1.5,300,19.03,0.551,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Miguel Vargas,Luis Severino,3.64,18.63,+2645,+437,2700,0.07,1.5,900,8.63,0.364,4,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Colson Montgomery,Luis Severino,4.54,19.95,+2102,+401,NA,,1.5,450,1.77,0.534,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Everson Pereira,Luis Severino,14.43,49.64,+593,+101,4000,11.99,1.5,450,31.45,0.950,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Sam Antonacci,Luis Severino,0.40,6.00,+24900,+1567,NA,,0.5,575,-8.81,0.205,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Chase Meidroth,Luis Severino,2.21,18.87,+4433,+430,3000,-1.02,1.5,150,-21.13,0.386,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Tristan Peters,Luis Severino,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.180,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Reese McGuire,Luis Severino,0.40,10.87,+24900,+820,2750,-3.11,1.5,340,-11.86,0.409,7,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,ATH,Jeff McNeil,Erick Fedde,0.40,16.97,+24900,+489,NA,,1.5,750,5.20,0.559,24,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Shea Langeliers,Erick Fedde,6.41,34.00,+1460,+194,NA,,1.5,220,2.75,0.570,0,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Nick Kurtz,Erick Fedde,5.87,31.38,+1603,+219,NA,,1.5,300,6.38,0.579,0,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Tyler Soderstrom,Erick Fedde,2.23,20.67,+4389,+384,NA,,1.5,315,-3.43,0.515,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Jacob Wilson,Erick Fedde,0.40,7.53,+24900,+1228,NA,,1.5,550,-7.86,0.400,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Carlos Cortes,Erick Fedde,1.24,20.06,+7983,+398,NA,,1.5,150,-19.94,0.546,0,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Max Muncy,Erick Fedde,4.23,29.63,+2267,+238,NA,,3.5,750,17.86,0.469,0,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Lawrence Butler,Erick Fedde,0.40,11.82,+24900,+746,NA,,1.5,650,-1.51,0.335,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Austin Wynns,Erick Fedde,0.40,6.00,+24900,+1567,NA,,1.5,650,-7.33,0.180,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,DET,Kevin McGonigle,Brayan Bello,5.86,34.33,+1608,+191,2400,1.86,2.5,340,11.60,0.574,0,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Gleyber Torres,Brayan Bello,0.45,15.77,+22017,+534,2875,-2.91,1.5,1000,6.68,0.453,25,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Colt Keith,Brayan Bello,5.89,33.16,+1599,+202,NA,,1.5,150,-6.84,0.438,3,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,DET,Riley Greene,Brayan Bello,6.91,36.20,+1347,+176,4000,4.47,0.5,725,24.08,0.522,9,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Spencer Torkelson,Brayan Bello,3.80,21.64,+2530,+362,7500,2.49,0.5,1400,14.97,0.447,6,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Kerry Carpenter,Brayan Bello,13.36,39.17,+648,+155,NA,,1.5,450,20.99,0.732,7,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,DET,Wenceel Pérez,Brayan Bello,1.71,6.00,+5753,+1567,1300,-5.43,0.5,2650,2.36,0.264,3,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Javier Báez,Brayan Bello,2.42,23.41,+4028,+327,4500,0.25,1.5,250,-5.16,0.608,5,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Jake Rogers,Brayan Bello,0.40,6.00,+24900,+1567,2500,-3.45,2.5,400,-14.00,0.180,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,BOS,Roman Anthony,Tarik Skubal,1.83,21.20,+5353,+372,NA,,1.5,265,-6.20,0.432,3,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Andruw Monasterio,Tarik Skubal,0.40,15.69,+24900,+538,NA,,1.5,400,-4.31,0.504,3,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Willson Contreras,Tarik Skubal,5.52,32.26,+1711,+210,NA,,1.5,750,20.49,0.735,9,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Trevor Story,Tarik Skubal,0.40,12.24,+24900,+717,NA,,1.5,850,1.72,0.445,11,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Wilyer Abreu,Tarik Skubal,3.48,25.46,+2774,+293,NA,,1.5,280,-0.86,0.418,3,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Ceddanne Rafaela,Tarik Skubal,0.40,13.72,+24900,+629,NA,,2.5,335,-9.27,0.486,6,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Caleb Durbin,Tarik Skubal,0.40,6.00,+24900,+1567,NA,,0.5,488,-11.01,0.352,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Connor Wong,Tarik Skubal,1.00,24.42,+9916,+310,NA,,0.5,950,14.89,0.455,5,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Isiah Kiner-Falefa,Tarik Skubal,0.40,6.00,+24900,+1567,NA,,1.5,750,-5.76,0.378,6,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIL,Sal Frelick,Sandy Alcantara,0.40,6.00,+24900,+1567,2500,-3.45,1.5,220,-25.25,0.292,6,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,William Contreras,Sandy Alcantara,0.78,23.78,+12691,+320,2600,-2.92,2.5,225,-6.99,0.594,9,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Brice Turang,Sandy Alcantara,4.60,29.84,+2076,+235,NA,,1.5,500,13.17,0.556,3,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIL,Gary Sánchez,Sandy Alcantara,8.57,37.30,+1066,+168,1650,2.86,1.5,800,26.18,0.726,12,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Jake Bauers,Sandy Alcantara,5.66,29.23,+1667,+242,2000,0.90,0.5,380,8.39,0.670,12,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Luis Rengifo,Sandy Alcantara,0.40,6.00,+24900,+1567,3050,-2.77,2.5,275,-20.67,0.296,8,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Garrett Mitchell,Sandy Alcantara,4.73,32.35,+2014,+209,3000,1.51,0.5,488,15.35,0.622,3,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Brandon Lockridge,Sandy Alcantara,0.40,6.00,+24900,+1567,5500,-1.39,1.5,575,-8.81,0.288,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Joey Ortiz,Sandy Alcantara,0.40,6.00,+24900,+1567,7000,-1.01,0.5,775,-5.43,0.180,4,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIA,Jakob Marsee,Brandon Woodruff,0.40,6.00,+24900,+1567,NA,,1.5,750,-5.76,0.302,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Xavier Edwards,Brandon Woodruff,1.16,25.12,+8538,+298,NA,,1.5,900,15.12,0.543,9,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Agustín Ramírez,Brandon Woodruff,0.40,13.23,+24900,+656,NA,,1.5,900,3.23,0.501,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Liam Hicks,Brandon Woodruff,2.46,21.88,+3960,+357,NA,,2.5,310,-2.51,0.458,3,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Otto Lopez,Brandon Woodruff,7.28,39.93,+1274,+150,NA,,1.5,150,-0.07,0.755,5,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Connor Norby,Brandon Woodruff,1.86,21.26,+5290,+370,NA,,3.5,1200,13.57,0.672,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Owen Caissie,Brandon Woodruff,4.20,19.95,+2281,+401,NA,,1.5,525,3.95,0.278,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Heriberto Hernández,Brandon Woodruff,0.40,6.00,+24900,+1567,NA,,1.5,700,-6.50,0.284,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Javier Sanoja,Brandon Woodruff,0.40,8.64,+24900,+1057,NA,,1.5,700,-3.86,0.342,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,BAL,Gunnar Henderson,Gavin Williams,7.98,29.75,+1153,+236,750,-3.78,1.5,210,-2.50,0.568,7,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Taylor Ward,Gavin Williams,0.40,17.70,+24900,+465,900,-9.60,2.5,-105,-33.52,0.491,6,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Pete Alonso,Gavin Williams,2.62,20.26,+3715,+394,550,-12.76,1.5,200,-13.07,0.456,4,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Dylan Beavers,Gavin Williams,0.40,6.00,+24900,+1567,1150,-7.60,1.5,300,-19.00,0.281,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Colton Cowser,Gavin Williams,0.40,6.00,+24900,+1567,700,-12.10,1.5,200,-27.33,0.217,3,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Leody Taveras,Gavin Williams,0.40,22.56,+24900,+343,800,-10.71,1.5,185,-12.53,0.544,5,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Samuel Basallo,Gavin Williams,3.95,15.95,+2429,+527,600,-10.33,1.5,190,-18.53,0.440,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Coby Mayo,Gavin Williams,0.40,6.00,+24900,+1567,800,-10.71,1.5,220,-25.25,0.299,2,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Jeremiah Jackson,Gavin Williams,9.31,36.31,+974,+175,800,-1.80,1.5,170,-0.73,0.950,0,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,CLE,Steven Kwan,Dean Kremer,0.40,6.00,+24900,+1567,NA,,1.5,140,-35.67,0.469,11,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Chase DeLauter,Dean Kremer,5.00,25.78,+1901,+288,NA,,1.5,142,-15.55,0.380,0,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,José Ramírez,Dean Kremer,4.16,28.80,+2305,+247,NA,,1.5,130,-14.68,0.646,13,B,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Kyle Manzardo,Dean Kremer,1.06,17.26,+9371,+479,NA,,1.5,180,-18.45,0.542,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,George Valera,Dean Kremer,2.34,32.53,+4172,+207,NA,,1.5,175,-3.83,0.622,0,A,"Low — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Rhys Hoskins,Dean Kremer,2.10,16.69,+4668,+499,NA,,1.5,185,-18.40,0.451,6,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Daniel Schneemann,Dean Kremer,7.40,40.17,+1251,+149,NA,,1.5,200,6.84,0.875,2,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Bo Naylor,Dean Kremer,0.40,8.70,+24900,+1050,NA,,1.5,200,-24.64,0.211,4,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Brayan Rocchio,Dean Kremer,0.40,12.23,+24900,+718,NA,,1.5,200,-21.10,0.521,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,STL,JJ Wetherholt,Lance McCullers Jr.,3.55,20.22,+2719,+395,750,-8.22,1.5,142,-21.10,0.526,0,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Iván Herrera,Lance McCullers Jr.,5.16,29.11,+1840,+244,625,-8.64,1.5,140,-12.56,0.551,0,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Alec Burleson,Lance McCullers Jr.,7.75,38.54,+1191,+159,510,-8.65,1.5,119,-7.13,0.545,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Jordan Walker,Lance McCullers Jr.,19.34,55.00,+417,-122,450,1.15,1.5,130,11.52,0.950,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Nolan Gorman,Lance McCullers Jr.,1.87,10.55,+5236,+848,615,-12.11,1.5,199,-22.90,0.376,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Masyn Winn,Lance McCullers Jr.,0.40,6.00,+24900,+1567,1150,-7.60,1.5,185,-29.09,0.369,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Ramón Urías,Lance McCullers Jr.,6.15,30.55,+1525,+227,760,-5.47,1.5,170,-6.48,0.605,2,B,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Nathan Church,Lance McCullers Jr.,1.35,15.60,+7333,+541,1100,-6.99,1.5,196,-18.18,0.547,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,José Fermín,Lance McCullers Jr.,0.40,6.28,+24900,+1491,1100,-7.93,1.5,230,-24.02,0.364,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,HOU,Jose Altuve,Andre Pallante,4.86,28.23,+1959,+254,NA,,1.5,112,-18.94,0.527,4,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Yordan Alvarez,Andre Pallante,18.94,55.00,+428,-122,NA,,1.5,-106,3.54,0.865,2,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Carlos Correa,Andre Pallante,4.71,27.96,+2024,+258,NA,,1.5,115,-18.55,0.448,3,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Christian Walker,Andre Pallante,9.78,39.12,+923,+156,NA,,1.5,121,-6.13,0.717,4,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Isaac Paredes,Andre Pallante,0.40,6.00,+24900,+1567,NA,,1.5,160,-32.46,0.282,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Taylor Trammell,Andre Pallante,2.73,22.01,+3569,+354,NA,,1.5,185,-13.07,0.457,0,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Cam Smith,Andre Pallante,10.30,41.99,+871,+138,NA,,1.5,146,1.34,0.620,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Christian Vázquez,Andre Pallante,13.32,55.00,+651,-122,NA,,1.5,200,21.67,0.950,2,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Nick Allen,Andre Pallante,1.10,12.00,+8988,+733,NA,,1.5,226,-18.67,0.315,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,TEX,Brandon Nimmo,George Kirby,3.75,26.23,+2570,+281,675,-9.16,1.5,142,-15.09,0.624,11,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Corey Seager,George Kirby,4.39,23.52,+2177,+325,405,-15.41,1.5,122,-21.52,0.512,20,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Wyatt Langford,George Kirby,0.40,8.63,+24900,+1058,670,-12.59,1.5,144,-32.35,0.439,14,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Jake Burger,George Kirby,4.58,25.89,+2081,+286,522,-11.49,1.5,138,-16.13,0.571,6,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Joc Pederson,George Kirby,0.40,11.52,+24900,+768,582,-14.26,1.5,226,-19.15,0.558,8,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Josh Jung,George Kirby,1.28,28.77,+7718,+248,910,-8.62,1.5,169,-8.40,0.783,8,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Evan Carter,George Kirby,0.89,14.05,+11097,+612,1000,-8.20,1.5,220,-17.20,0.448,7,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Ezequiel Duran,George Kirby,0.40,14.05,+24900,+612,1010,-8.61,1.5,215,-17.70,0.366,16,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Kyle Higashioka,George Kirby,2.58,22.23,+3774,+350,575,-12.23,1.5,214,-9.62,0.632,10,C,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,SEA,J.P. Crawford,Nathan Eovaldi,0.40,6.00,+24900,+1567,NA,,1.5,176,-30.23,0.342,22,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Cal Raleigh,Nathan Eovaldi,1.54,13.82,+6405,+624,NA,,1.5,122,-31.22,0.423,21,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Julio Rodríguez,Nathan Eovaldi,1.56,19.52,+6308,+412,NA,,1.5,136,-22.86,0.496,21,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Josh Naylor,Nathan Eovaldi,0.40,6.74,+24900,+1384,NA,,1.5,138,-35.28,0.412,11,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Randy Arozarena,Nathan Eovaldi,0.40,16.72,+24900,+498,NA,,1.5,188,-18.01,0.497,31,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Luke Raley,Nathan Eovaldi,10.84,48.36,+822,+107,NA,,1.5,185,13.27,0.657,15,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Dominic Canzone,Nathan Eovaldi,5.29,24.89,+1789,+302,NA,,1.5,180,-10.82,0.281,6,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Cole Young,Nathan Eovaldi,0.40,8.33,+24900,+1100,NA,,1.5,238,-21.25,0.355,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Leo Rivas,Nathan Eovaldi,0.40,6.00,+24900,+1567,NA,,1.5,315,-18.10,0.317,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,ATL,Ronald Acuña Jr.,Cristopher Sánchez,4.44,30.35,+2154,+229,660,-8.72,1.5,140,-11.31,0.569,9,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Drake Baldwin,Cristopher Sánchez,6.30,35.63,+1488,+181,738,-5.64,1.5,155,-3.59,0.655,3,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Ozzie Albies,Cristopher Sánchez,0.40,15.64,+24900,+539,750,-11.36,1.5,124,-29.00,0.456,13,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Matt Olson,Cristopher Sánchez,12.32,46.48,+712,+115,532,-3.50,1.5,159,7.87,0.747,18,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Austin Riley,Cristopher Sánchez,6.18,30.66,+1517,+226,615,-7.80,1.5,140,-11.00,0.644,10,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Mauricio Dubón,Cristopher Sánchez,1.81,23.50,+5412,+325,1370,-4.99,1.5,178,-12.47,0.574,2,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Eli White,Cristopher Sánchez,0.40,11.27,+24900,+787,940,-9.22,1.5,203,-21.73,0.519,3,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Jonah Heim,Cristopher Sánchez,0.40,6.00,+24900,+1567,1100,-7.93,1.5,225,-24.77,0.379,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Jorge Mateo,Cristopher Sánchez,6.83,45.93,+1363,+118,1100,-1.50,1.5,265,18.53,0.737,2,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,PHI,Trea Turner,Chris Sale,0.40,16.39,+24900,+510,NA,,1.5,120,-29.06,0.541,15,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Kyle Schwarber,Chris Sale,13.22,41.00,+656,+144,NA,,1.5,176,4.77,0.623,15,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Bryce Harper,Chris Sale,7.94,42.36,+1159,+136,NA,,1.5,150,2.36,0.785,9,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Adolis García,Chris Sale,3.15,19.18,+3076,+421,NA,,1.5,160,-19.29,0.391,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,J.T. Realmuto,Chris Sale,0.40,17.54,+24900,+470,NA,,1.5,166,-20.05,0.486,13,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Alec Bohm,Chris Sale,0.40,6.00,+24900,+1567,NA,,1.5,145,-34.82,0.180,14,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Felix Reyes,Chris Sale,1.92,15.26,+5106,+555,NA,,,,,,0,D,"Low — stats+savant+recent+BvP, confirmed lineup, no live markets",none
2026-04-18,ATL@PHI,PHI,Edmundo Sosa,Chris Sale,3.36,24.92,+2876,+301,NA,,1.5,210,-7.34,0.761,12,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Brandon Marsh,Chris Sale,2.96,25.57,+3276,+291,NA,,1.5,274,-1.17,0.490,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,LAD,Shohei Ohtani,Ryan Feltner,18.86,55.00,+430,-122,212,-13.19,1.5,-155,-5.78,0.764,8,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Kyle Tucker,Ryan Feltner,8.43,28.94,+1087,+246,460,-9.43,1.5,-120,-25.61,0.446,0,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Andy Pages,Ryan Feltner,16.93,55.00,+491,-122,522,0.85,1.5,-146,-4.35,0.815,7,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Freddie Freeman,Ryan Feltner,15.96,55.00,+527,-122,423,-3.16,1.5,-148,-4.68,0.607,16,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Teoscar Hernández,Ryan Feltner,15.64,50.68,+539,-103,400,-4.36,1.5,-125,-4.87,0.791,8,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Max Muncy,Ryan Feltner,20.40,55.00,+390,-122,375,-0.65,1.5,100,5.00,0.792,14,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Dalton Rushing,Ryan Feltner,25.00,55.00,+300,-122,310,0.61,1.5,100,5.00,0.950,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Alex Freeland,Ryan Feltner,8.55,27.38,+1070,+265,840,-2.09,1.5,149,-12.78,0.278,0,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Miguel Rojas,Ryan Feltner,8.03,37.94,+1146,+164,840,-2.61,1.5,130,-5.54,0.520,5,A,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,COL,Edouard Julien,Emmet Sheehan,5.71,28.77,+1651,+248,NA,,1.5,184,-6.44,0.481,0,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Mickey Moniak,Emmet Sheehan,12.77,41.63,+683,+140,NA,,1.5,117,-4.45,0.838,6,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,TJ Rumfield,Emmet Sheehan,4.42,22.75,+2161,+340,NA,,1.5,129,-20.92,0.365,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Hunter Goodman,Emmet Sheehan,10.67,37.15,+837,+169,NA,,1.5,129,-6.51,0.784,6,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Ezequiel Tovar,Emmet Sheehan,4.22,26.47,+2271,+278,NA,,1.5,136,-15.90,0.370,12,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Troy Johnston,Emmet Sheehan,4.76,26.36,+2001,+279,NA,,1.5,181,-9.23,0.499,0,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Brenton Doyle,Emmet Sheehan,3.07,17.16,+3157,+483,NA,,1.5,167,-20.29,0.464,8,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Kyle Karros,Emmet Sheehan,2.52,14.77,+3863,+577,NA,,1.5,195,-19.13,0.316,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Jordan Beck,Emmet Sheehan,1.61,7.31,+6096,+1267,NA,,1.5,193,-26.82,0.347,3,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,TOR,Nathan Lukes,Zac Gallen,0.40,6.00,+24900,+1567,865,-9.96,1.5,110,-41.62,0.180,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Ernie Clement,Zac Gallen,1.15,20.20,+8627,+395,975,-8.16,1.5,113,-26.75,0.406,2,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Vladimir Guerrero Jr.,Zac Gallen,8.09,40.42,+1136,+147,498,-8.63,1.5,-104,-10.56,0.612,5,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Jesús Sánchez,Zac Gallen,8.38,38.84,+1094,+157,675,-4.53,1.5,108,-9.23,0.482,9,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Eloy Jiménez,Zac Gallen,0.80,11.29,+12396,+786,715,-11.47,1.5,140,-30.37,0.345,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Andrés Giménez,Zac Gallen,5.68,30.80,+1662,+225,955,-3.80,1.5,150,-9.20,0.478,9,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Kazuma Okamoto,Zac Gallen,3.15,14.81,+3074,+575,658,-10.04,1.5,162,-23.36,0.221,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Myles Straw,Zac Gallen,9.95,45.29,+905,+121,1370,3.15,1.5,193,11.16,0.716,5,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Tyler Heineman,Zac Gallen,1.88,15.42,+5221,+548,1330,-5.11,1.5,225,-15.35,0.324,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,AZ,Ketel Marte,Max Scherzer,13.91,45.60,+619,+119,NA,,1.5,-114,-7.67,0.631,9,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Corbin Carroll,Max Scherzer,15.30,55.00,+553,-122,NA,,1.5,-112,2.17,0.643,3,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Geraldo Perdomo,Max Scherzer,4.20,13.71,+2284,+629,NA,,1.5,130,-29.77,0.294,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Lourdes Gurriel Jr.,Max Scherzer,10.36,30.01,+865,+233,NA,,1.5,118,-15.86,,8,A,"Low — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Adrian Del Castillo,Max Scherzer,13.80,51.96,+624,-108,NA,,1.5,134,9.23,0.696,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Jose Fernandez,Max Scherzer,9.15,34.21,+993,+192,NA,,1.5,142,-7.11,0.410,0,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Nolan Arenado,Max Scherzer,7.89,27.85,+1168,+259,NA,,1.5,130,-15.63,0.613,17,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Ildemaro Vargas,Max Scherzer,12.03,48.88,+732,+105,NA,,1.5,170,11.85,0.662,6,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Alek Thomas,Max Scherzer,6.52,21.34,+1433,+369,NA,,1.5,156,-17.72,0.196,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,SD,Ramón Laureano,Yusei Kikuchi,12.44,49.68,+704,+101,390,-7.96,1.5,100,-0.32,0.628,31,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Fernando Tatis Jr.,Yusei Kikuchi,11.10,38.17,+801,+162,357,-10.79,1.5,-107,-13.52,0.403,12,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Jackson Merrill,Yusei Kikuchi,9.80,40.80,+921,+145,600,-4.49,1.5,115,-5.71,0.607,3,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Manny Machado,Yusei Kikuchi,8.12,27.40,+1132,+265,382,-12.63,1.5,120,-18.06,0.509,12,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Xander Bogaerts,Yusei Kikuchi,12.05,42.68,+730,+134,615,-1.93,1.5,126,-1.56,0.725,11,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Miguel Andujar,Yusei Kikuchi,5.31,34.30,+1784,+192,725,-6.81,1.5,120,-11.15,0.608,9,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Ty France,Yusei Kikuchi,8.04,36.01,+1144,+178,600,-6.24,1.5,140,-5.66,0.639,12,A,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Freddy Fermin,Yusei Kikuchi,2.39,15.52,+4082,+544,850,-8.14,0.5,-160,-46.02,0.434,5,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Jake Cronenworth,Yusei Kikuchi,3.18,14.72,+3042,+580,1000,-5.91,1.5,190,-19.77,0.290,7,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SD@LAA,LAA,Zach Neto,Germán Márquez,7.83,32.28,+1178,+210,NA,,1.5,100,-17.72,0.629,0,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Mike Trout,Germán Márquez,17.75,55.00,+463,-122,NA,,1.5,-114,1.73,0.784,6,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Nolan Schanuel,Germán Márquez,3.14,16.80,+3088,+495,NA,,1.5,144,-24.18,0.323,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Jo Adell,Germán Márquez,7.65,36.16,+1207,+177,NA,,1.5,110,-11.46,0.687,3,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Yoán Moncada,Germán Márquez,5.17,21.12,+1833,+374,NA,,1.5,152,-18.57,0.588,6,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Oswald Peraza,Germán Márquez,9.47,38.26,+956,+161,NA,,1.5,158,-0.50,0.786,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Josh Lowe,Germán Márquez,3.82,16.35,+2518,+512,NA,,1.5,165,-21.39,0.561,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Logan O'Hoppe,Germán Márquez,3.23,18.53,+2999,+440,NA,,1.5,147,-21.95,0.449,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Adam Frazier,Germán Márquez,7.78,42.14,+1185,+137,NA,,1.5,228,11.66,0.738,23,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
<!-- batter-outlooks-csv:end -->
*/
