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
    impliedAwayPct: 41.68,
    impliedHomePct: 58.32,
    modelAwayPct: 36.58,
    modelHomePct: 63.42,
    edgeAwayPct: -5.09,
    edgeHomePct: 5.09,
    prediction: "NYY",
    decisionTier: "A",
    edgeOnPickPct: 5.09,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Maikel Garcia", team: "KC", hrPct: 3.0, tb2Pct: 24.0, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 2.0, tb2Pct: 23.4, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.4, tb2Pct: 9.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 3.5, tb2Pct: 25.6, tier: "HR D / TB C", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Carter Jensen", team: "KC", hrPct: 7.3, tb2Pct: 29.5, tier: "HR C / TB B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Amed Rosario", team: "NYY", hrPct: 14.5, tb2Pct: 50.9, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 19.3, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 7.5, tb2Pct: 31.7, tier: "HR C / TB B", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 7.6, tb2Pct: 25.8, tier: "HR C / TB C", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ben Rice", team: "NYY", hrPct: 20.7, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Randal Grichuk", team: "NYY", hrPct: 1.5, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.5, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "José Caballero", team: "NYY", hrPct: 3.9, tb2Pct: 22.4, tier: "HR D / TB C", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 2.7, tb2Pct: 11.5, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
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
    impliedAwayPct: 34.96,
    impliedHomePct: 65.04,
    modelAwayPct: 33.30,
    modelHomePct: 66.70,
    edgeAwayPct: -1.66,
    edgeHomePct: 1.66,
    prediction: "MIN",
    decisionTier: "C",
    edgeOnPickPct: 1.66,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Will Benson", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 8.2, tb2Pct: 37.3, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 10.2, tb2Pct: 41.1, tier: "HR B / TB A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 0.4, tb2Pct: 14.5, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Nathaniel Lowe", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 2.6, tb2Pct: 16.5, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 7.8, tb2Pct: 33.3, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Austin Martin", team: "MIN", hrPct: 3.4, tb2Pct: 27.3, tier: "HR D / TB B", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Josh Bell", team: "MIN", hrPct: 6.1, tb2Pct: 29.7, tier: "HR C / TB B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ryan Jeffers", team: "MIN", hrPct: 8.0, tb2Pct: 35.3, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 0.4, tb2Pct: 10.9, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 3.5, tb2Pct: 22.6, tier: "HR D / TB C", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 4.2, tb2Pct: 20.2, tier: "HR D / TB C", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Ryan Kreidler", team: "MIN", hrPct: 15.0, tb2Pct: 49.6, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tristan Gray", team: "MIN", hrPct: 6.6, tb2Pct: 30.5, tier: "HR C / TB B", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
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
    impliedAwayPct: 43.36,
    impliedHomePct: 56.64,
    modelAwayPct: 54.48,
    modelHomePct: 45.52,
    edgeAwayPct: 11.13,
    edgeHomePct: -11.13,
    prediction: "NYM",
    decisionTier: "A+",
    edgeOnPickPct: 11.13,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Carson Benge", team: "NYM", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Bo Bichette", team: "NYM", hrPct: 0.7, tb2Pct: 18.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Francisco Lindor", team: "NYM", hrPct: 2.2, tb2Pct: 16.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luis Robert Jr.", team: "NYM", hrPct: 2.3, tb2Pct: 18.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "MJ Melendez", team: "NYM", hrPct: 6.9, tb2Pct: 47.2, tier: "HR C / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Francisco Alvarez", team: "NYM", hrPct: 8.1, tb2Pct: 38.2, tier: "HR B / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 1.3, tb2Pct: 13.1, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brett Baty", team: "NYM", hrPct: 0.4, tb2Pct: 8.1, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Marcus Semien", team: "NYM", hrPct: 1.0, tb2Pct: 12.9, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 1.6, tb2Pct: 23.2, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 0.4, tb2Pct: 10.6, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Ian Happ", team: "CHC", hrPct: 7.7, tb2Pct: 29.3, tier: "HR C / TB B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 0.4, tb2Pct: 6.9, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 12.5, tb2Pct: 45.9, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Miguel Amaya", team: "CHC", hrPct: 0.4, tb2Pct: 8.6, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.4, tb2Pct: 11.7, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 5.6, tb2Pct: 25.5, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
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
    impliedAwayPct: 30.20,
    impliedHomePct: 69.80,
    modelAwayPct: 44.01,
    modelHomePct: 55.99,
    edgeAwayPct: 13.82,
    edgeHomePct: -13.82,
    prediction: "PIT",
    decisionTier: "D",
    edgeOnPickPct: -13.82,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Junior Caminero", team: "TB", hrPct: 1.3, tb2Pct: 18.5, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 0.4, tb2Pct: 15.3, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 0.4, tb2Pct: 22.8, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jake Fraley", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Richie Palacios", team: "TB", hrPct: 0.4, tb2Pct: 18.7, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Hunter Feduccia", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 9.9, tb2Pct: 42.4, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 5.7, tb2Pct: 29.2, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 2.4, tb2Pct: 24.3, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 3.8, tb2Pct: 29.1, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 0.4, tb2Pct: 12.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 0.4, tb2Pct: 13.5, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Spencer Horwitz", team: "PIT", hrPct: 0.4, tb2Pct: 8.3, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Henry Davis", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
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
    impliedAwayPct: 56.38,
    impliedHomePct: 43.62,
    modelAwayPct: 48.07,
    modelHomePct: 51.93,
    edgeAwayPct: -8.31,
    edgeHomePct: 8.31,
    prediction: "WSH",
    decisionTier: "A+",
    edgeOnPickPct: 8.31,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
    rationale: "Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Willy Adames", team: "SF", hrPct: 5.4, tb2Pct: 30.4, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 12.5, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.6, tb2Pct: 20.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Rafael Devers", team: "SF", hrPct: 2.6, tb2Pct: 16.1, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 7.5, tb2Pct: 37.2, tier: "HR C / TB A", note: "RHB vs RHP; above-average damage; vs tough pitcher; priced lean: 2+ TB (A)" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 1.3, tb2Pct: 20.7, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 4.4, tb2Pct: 23.7, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 8.6, tb2Pct: 35.2, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A)" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 17.4, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 4.9, tb2Pct: 24.9, tier: "HR D / TB C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "José Tena", team: "WSH", hrPct: 3.5, tb2Pct: 29.8, tier: "HR D / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 13.7, tb2Pct: 51.8, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jacob Young", team: "WSH", hrPct: 5.4, tb2Pct: 29.2, tier: "HR D / TB B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 3.4, tb2Pct: 23.7, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.4, tb2Pct: 7.7, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.4, tb2Pct: 6.8, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
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
    impliedAwayPct: 41.12,
    impliedHomePct: 58.88,
    modelAwayPct: 60.92,
    modelHomePct: 39.08,
    edgeAwayPct: 19.80,
    edgeHomePct: -19.80,
    prediction: "CWS",
    decisionTier: "A+",
    edgeOnPickPct: 19.80,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 8.5, tb2Pct: 35.7, tier: "HR B / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 15.7, tb2Pct: 47.6, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 4.3, tb2Pct: 18.8, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 6.5, tb2Pct: 25.0, tier: "HR C / TB C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 14.9, tb2Pct: 50.0, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 3.1, tb2Pct: 20.7, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Tristan Peters", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Reese McGuire", team: "CWS", hrPct: 1.1, tb2Pct: 12.2, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.4, tb2Pct: 17.9, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 7.0, tb2Pct: 35.3, tier: "HR C / TB A", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 7.4, tb2Pct: 35.4, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 2.7, tb2Pct: 21.5, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.4, tb2Pct: 11.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 2.1, tb2Pct: 21.7, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Max Muncy", team: "ATH", hrPct: 5.6, tb2Pct: 32.2, tier: "HR D / TB A", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 1.0, tb2Pct: 13.4, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Austin Wynns", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
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
    impliedAwayPct: 45.95,
    impliedHomePct: 54.05,
    modelAwayPct: 63.26,
    modelHomePct: 36.74,
    edgeAwayPct: 17.31,
    edgeHomePct: -17.31,
    prediction: "DET",
    decisionTier: "A+",
    edgeOnPickPct: 17.31,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Kevin McGonigle", team: "DET", hrPct: 8.2, tb2Pct: 40.0, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 1.9, tb2Pct: 17.6, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Colt Keith", team: "DET", hrPct: 7.9, tb2Pct: 37.6, tier: "HR B / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Riley Greene", team: "DET", hrPct: 8.3, tb2Pct: 37.9, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A)" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 3.5, tb2Pct: 22.4, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Kerry Carpenter", team: "DET", hrPct: 13.2, tb2Pct: 45.2, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 3.3, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Javier Báez", team: "DET", hrPct: 4.5, tb2Pct: 27.7, tier: "HR D / TB B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jake Rogers", team: "DET", hrPct: 0.9, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 0.9, tb2Pct: 18.8, tier: "HR D / TB D", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Andruw Monasterio", team: "BOS", hrPct: 0.4, tb2Pct: 13.4, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 5.3, tb2Pct: 30.9, tier: "HR D / TB B", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.4, tb2Pct: 10.1, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 2.7, tb2Pct: 23.6, tier: "HR D / TB C", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 0.4, tb2Pct: 12.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Connor Wong", team: "BOS", hrPct: 0.4, tb2Pct: 22.2, tier: "HR D / TB C", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Isiah Kiner-Falefa", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
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
    impliedAwayPct: 15.68,
    impliedHomePct: 84.32,
    modelAwayPct: 49.83,
    modelHomePct: 50.17,
    edgeAwayPct: 34.16,
    edgeHomePct: -34.16,
    prediction: "MIA",
    decisionTier: "D",
    edgeOnPickPct: -34.16,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Sal Frelick", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "William Contreras", team: "MIL", hrPct: 1.4, tb2Pct: 24.4, tier: "HR D / TB C", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Brice Turang", team: "MIL", hrPct: 6.4, tb2Pct: 36.0, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A)" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 8.0, tb2Pct: 33.8, tier: "HR B / TB A", note: "RHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A)" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 6.1, tb2Pct: 29.8, tier: "HR C / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (B)" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 4.7, tb2Pct: 30.8, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (B)" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 0.6, tb2Pct: 23.3, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 0.4, tb2Pct: 10.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 2.1, tb2Pct: 21.7, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 6.8, tb2Pct: 37.0, tier: "HR C / TB A", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Connor Norby", team: "MIA", hrPct: 1.7, tb2Pct: 22.0, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 3.6, tb2Pct: 18.9, tier: "HR D / TB D", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Heriberto Hernández", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Javier Sanoja", team: "MIA", hrPct: 0.4, tb2Pct: 6.7, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
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
    impliedAwayPct: 30.42,
    impliedHomePct: 69.58,
    modelAwayPct: 44.32,
    modelHomePct: 55.68,
    edgeAwayPct: 13.91,
    edgeHomePct: -13.91,
    prediction: "CLE",
    decisionTier: "D",
    edgeOnPickPct: -13.91,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 6.6, tb2Pct: 29.5, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.4, tb2Pct: 17.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 2.4, tb2Pct: 18.0, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Colton Cowser", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 2.7, tb2Pct: 30.8, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 3.4, tb2Pct: 15.1, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 8.6, tb2Pct: 34.9, tier: "HR B / TB A", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.4, tb2Pct: 6.1, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 6.3, tb2Pct: 27.8, tier: "HR C / TB B", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "José Ramírez", team: "CLE", hrPct: 6.1, tb2Pct: 32.1, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 2.7, tb2Pct: 19.9, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "George Valera", team: "CLE", hrPct: 2.7, tb2Pct: 28.5, tier: "HR D / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 2.1, tb2Pct: 19.5, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 8.9, tb2Pct: 42.7, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Bo Naylor", team: "CLE", hrPct: 3.5, tb2Pct: 16.9, tier: "HR D / TB D", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 2.2, tb2Pct: 18.9, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
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
    modelAwayPct: 43.57,
    modelHomePct: 56.43,
    edgeAwayPct: 5.44,
    edgeHomePct: -5.44,
    prediction: "HOU",
    decisionTier: "D",
    edgeOnPickPct: -5.44,
    modelConfidence: "High",
    analystConfidence: "Medium-High",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "JJ Wetherholt", team: "STL", hrPct: 2.9, tb2Pct: 18.7, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Iván Herrera", team: "STL", hrPct: 4.2, tb2Pct: 26.1, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Alec Burleson", team: "STL", hrPct: 8.3, tb2Pct: 40.0, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Jordan Walker", team: "STL", hrPct: 17.9, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 1.4, tb2Pct: 10.2, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Ramón Urías", team: "STL", hrPct: 7.0, tb2Pct: 31.5, tier: "HR C / TB B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Nathan Church", team: "STL", hrPct: 0.6, tb2Pct: 13.5, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "José Fermín", team: "STL", hrPct: 3.0, tb2Pct: 18.1, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Jose Altuve", team: "HOU", hrPct: 4.1, tb2Pct: 24.8, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 19.5, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Carlos Correa", team: "HOU", hrPct: 4.3, tb2Pct: 25.5, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Christian Walker", team: "HOU", hrPct: 9.1, tb2Pct: 36.7, tier: "HR B / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 2.0, tb2Pct: 20.1, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Cam Smith", team: "HOU", hrPct: 9.4, tb2Pct: 40.0, tier: "HR B / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Christian Vázquez", team: "HOU", hrPct: 12.0, tb2Pct: 52.7, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Shay Whitcomb", team: "HOU", hrPct: 8.1, tb2Pct: 21.7, tier: "HR B / TB C", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
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
    impliedAwayPct: 43.80,
    impliedHomePct: 56.20,
    modelAwayPct: 40.42,
    modelHomePct: 59.58,
    edgeAwayPct: -3.37,
    edgeHomePct: 3.37,
    prediction: "SEA",
    decisionTier: "B",
    edgeOnPickPct: 3.37,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 3.9, tb2Pct: 26.1, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Corey Seager", team: "TEX", hrPct: 4.5, tb2Pct: 23.3, tier: "HR D / TB C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.4, tb2Pct: 12.2, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jake Burger", team: "TEX", hrPct: 5.0, tb2Pct: 24.7, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.4, tb2Pct: 12.9, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Josh Jung", team: "TEX", hrPct: 3.8, tb2Pct: 34.5, tier: "HR D / TB A", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Evan Carter", team: "TEX", hrPct: 0.5, tb2Pct: 12.3, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ezequiel Duran", team: "TEX", hrPct: 0.4, tb2Pct: 16.5, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Kyle Higashioka", team: "TEX", hrPct: 1.1, tb2Pct: 17.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.4, tb2Pct: 10.7, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 0.8, tb2Pct: 11.7, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 1.1, tb2Pct: 18.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.4, tb2Pct: 7.2, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.4, tb2Pct: 17.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Luke Raley", team: "SEA", hrPct: 13.1, tb2Pct: 52.7, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 6.7, tb2Pct: 28.3, tier: "HR C / TB B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.4, tb2Pct: 9.4, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
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
    impliedAwayPct: 49.23,
    impliedHomePct: 50.77,
    modelAwayPct: 47.49,
    modelHomePct: 52.51,
    edgeAwayPct: -1.74,
    edgeHomePct: 1.74,
    prediction: "PHI",
    decisionTier: "C",
    edgeOnPickPct: 1.74,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_unconfirmed;starter_mismatch_rotowire",
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
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 3.7, tb2Pct: 29.9, tier: "HR D / TB B", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 5.2, tb2Pct: 32.9, tier: "HR D / TB A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.4, tb2Pct: 14.1, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Matt Olson", team: "ATL", hrPct: 9.7, tb2Pct: 42.6, tier: "HR B / TB A+", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Austin Riley", team: "ATL", hrPct: 4.5, tb2Pct: 28.0, tier: "HR D / TB B", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 0.9, tb2Pct: 21.0, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Eli White", team: "ATL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jonah Heim", team: "ATL", hrPct: 0.4, tb2Pct: 8.5, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jorge Mateo", team: "ATL", hrPct: 4.5, tb2Pct: 37.2, tier: "HR D / TB A", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 12.7, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 9.8, tb2Pct: 36.8, tier: "HR B / TB A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 6.1, tb2Pct: 36.7, tier: "HR C / TB A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Adolis García", team: "PHI", hrPct: 1.7, tb2Pct: 15.0, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "J.T. Realmuto", team: "PHI", hrPct: 0.4, tb2Pct: 13.3, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Felix Reyes", team: "PHI", hrPct: 23.8, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Edmundo Sosa", team: "PHI", hrPct: 2.3, tb2Pct: 22.8, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 1.5, tb2Pct: 22.4, tier: "HR D / TB C", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
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
    impliedAwayPct: 69.38,
    impliedHomePct: 30.62,
    modelAwayPct: 57.31,
    modelHomePct: 42.69,
    edgeAwayPct: -12.07,
    edgeHomePct: 12.07,
    prediction: "LAD",
    decisionTier: "D",
    edgeOnPickPct: -12.07,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 16.3, tb2Pct: 53.1, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 7.5, tb2Pct: 28.2, tier: "HR C / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Andy Pages", team: "LAD", hrPct: 14.4, tb2Pct: 53.5, tier: "HR A+ / TB A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 15.7, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 13.1, tb2Pct: 45.1, tier: "HR A / TB A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Max Muncy", team: "LAD", hrPct: 17.9, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 25.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 6.4, tb2Pct: 23.3, tier: "HR C / TB C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Miguel Rojas", team: "LAD", hrPct: 6.2, tb2Pct: 31.9, tier: "HR C / TB B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Edouard Julien", team: "COL", hrPct: 4.2, tb2Pct: 25.3, tier: "HR D / TB C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 11.4, tb2Pct: 38.3, tier: "HR A / TB A+", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 2.6, tb2Pct: 18.7, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 10.0, tb2Pct: 35.2, tier: "HR B / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 3.0, tb2Pct: 23.2, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Troy Johnston", team: "COL", hrPct: 3.9, tb2Pct: 26.2, tier: "HR D / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 0.4, tb2Pct: 12.5, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Kyle Karros", team: "COL", hrPct: 0.4, tb2Pct: 11.3, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jordan Beck", team: "COL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
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
    impliedAwayPct: 50.68,
    impliedHomePct: 49.32,
    modelAwayPct: 48.34,
    modelHomePct: 51.66,
    edgeAwayPct: -2.34,
    edgeHomePct: 2.34,
    prediction: "AZ",
    decisionTier: "B",
    edgeOnPickPct: 2.34,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Nathan Lukes", team: "TOR", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.4, tb2Pct: 18.4, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 6.2, tb2Pct: 36.4, tier: "HR C / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 6.0, tb2Pct: 34.7, tier: "HR C / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Eloy Jiménez", team: "TOR", hrPct: 0.7, tb2Pct: 15.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 3.2, tb2Pct: 23.7, tier: "HR D / TB C", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 1.7, tb2Pct: 12.1, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Myles Straw", team: "TOR", hrPct: 8.3, tb2Pct: 41.4, tier: "HR B / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Tyler Heineman", team: "TOR", hrPct: 0.4, tb2Pct: 9.7, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Ketel Marte", team: "AZ", hrPct: 9.9, tb2Pct: 37.2, tier: "HR B / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 10.7, tb2Pct: 48.3, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Geraldo Perdomo", team: "AZ", hrPct: 1.3, tb2Pct: 11.2, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 9.2, tb2Pct: 40.9, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jose Fernandez", team: "AZ", hrPct: 5.9, tb2Pct: 29.1, tier: "HR C / TB B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 4.7, tb2Pct: 21.4, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 8.9, tb2Pct: 42.0, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 3.3, tb2Pct: 16.3, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
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
    impliedAwayPct: 56.89,
    impliedHomePct: 43.11,
    modelAwayPct: 50.98,
    modelHomePct: 49.02,
    edgeAwayPct: -5.91,
    edgeHomePct: 5.91,
    prediction: "SD",
    decisionTier: "D",
    edgeOnPickPct: -5.91,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch;starter_mismatch_rotowire",
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
      { batter: "Ramón Laureano", team: "SD", hrPct: 10.5, tb2Pct: 44.5, tier: "HR A / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 8.0, tb2Pct: 33.5, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 8.2, tb2Pct: 36.3, tier: "HR B / TB A", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher; priced lean: 2+ TB (A)" },
      { batter: "Manny Machado", team: "SD", hrPct: 4.7, tb2Pct: 22.1, tier: "HR D / TB C", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 9.3, tb2Pct: 39.5, tier: "HR B / TB A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 4.3, tb2Pct: 33.3, tier: "HR D / TB A", note: "RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Ty France", team: "SD", hrPct: 6.1, tb2Pct: 30.2, tier: "HR C / TB B", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Freddy Fermin", team: "SD", hrPct: 1.3, tb2Pct: 14.2, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jake Cronenworth", team: "SD", hrPct: 1.9, tb2Pct: 12.9, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 8.4, tb2Pct: 34.1, tier: "HR B / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mike Trout", team: "LAA", hrPct: 17.1, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 1.7, tb2Pct: 14.6, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jo Adell", team: "LAA", hrPct: 7.9, tb2Pct: 36.8, tier: "HR B / TB A", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 6.5, tb2Pct: 23.7, tier: "HR C / TB C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 9.0, tb2Pct: 36.4, tier: "HR B / TB A", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 3.8, tb2Pct: 16.1, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 3.4, tb2Pct: 18.1, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 7.4, tb2Pct: 39.9, tier: "HR C / TB A+", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
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
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,game_status_bucket,game_state,game_state_detail,game_status_note,away_score,home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary
2026-04-18,KC,NYY,1:35 PM,Noah Cameron,Will Warren,132,-152,8.0,-115,-105,54F / 10 mph wind / 0% precip / Open,54.0,10.5,0,0.284,0.379,0.412,0.470,final,Final,Final,"Final — KC 4, NYY 13",4,13,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,41.68,58.32,36.58,63.42,-5.09,5.09,NYY,A,5.09,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Yankee Stadium short porch vs contact-oriented Royals road lineup — price the chalk carefully; props and team totals often clearer than ML.
2026-04-18,CIN,MIN,2:10 PM,Andrew Abbott,Taj Bradley,168,-227,8.0,-111,-125,45F / 16 mph wind / 0% precip / Open,44.7,15.7,0,0.359,0.360,0.398,0.594,final,Final,Final,"Final — CIN 5, MIN 4",5,4,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,34.96,65.04,33.30,66.70,-1.66,1.66,MIN,C,1.66,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Target Field leans pitcher-friendly early season; lean on probables and bullpen paths before trusting a big ML edge.
2026-04-18,NYM,CHC,2:20 PM,Freddy Peralta,Jameson Taillon,122,-143,7.0,-118,-118,44F / 17 mph wind / 0% precip / Open,43.6,16.8,0,0.410,0.422,0.418,0.518,final,Final,Final,"Final — NYM 2, CHC 4",2,4,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,43.36,56.64,54.48,45.52,11.13,-11.13,NYM,A+,11.13,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Low,Wrigley wind and cold can suppress HRs — tight market; verify probables and late lineup news.
2026-04-18,TB,PIT,3:30 PM,Drew Rasmussen,Paul Skenes,212,-286,6.0,-125,-111,63F / 8 mph wind / 58% precip / Open,63.0,8.0,58,0.335,0.354,0.481,0.534,final,Final,Final,"Final — TB 8, PIT 7",8,7,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,30.20,69.80,44.01,55.99,13.82,-13.82,PIT,D,-13.82,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Rays talent vs Pirates home spot — check opener/bulk roles; modest ML edge only if price is wrong.
2026-04-18,SF,WSH,4:05 PM,Adrian Houser,Cade Cavalli,-149,116,6.0,-118,-118,71F / 9 mph wind / 1% precip / Open,70.8,8.6,1,0.399,0.301,0.535,0.525,final,Final,Final,"Final — SF 7, WSH 6",7,6,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,56.38,43.62,48.07,51.93,-8.31,8.31,WSH,A+,8.31,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites.
2026-04-18,CWS,ATH,4:05 PM,Erick Fedde,Luis Severino,135,-156,9.5,-104,-118,77F / 5 mph wind / 0% precip / Open,77.1,5.3,0,0.383,0.364,0.447,0.461,final,Final,Final,"Final — CWS 6, ATH 7",6,7,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,41.12,58.88,60.92,39.08,19.80,-19.80,CWS,A+,19.80,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Low,Oakland environment and travel spot — volatility; prefer game props unless you have a clear pitching mismatch.
2026-04-18,DET,BOS,4:10 PM,Tarik Skubal,Brayan Bello,111,-126,8.5,110,-126,44F / 7 mph wind / 0% precip / Open,44.0,6.8,0,0.461,0.447,0.469,0.467,final,Final,Final,"Final — DET 4, BOS 1",4,1,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,45.95,54.05,63.26,36.74,17.31,-17.31,DET,A+,17.31,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Fenway doubles and wall-ball noise — model park correctly before trusting a big ML number.
2026-04-18,MIL,MIA,4:10 PM,Brandon Woodruff,Sandy Alcantara,500,-866,8.5,-125,-118,78F / 6 mph wind / 0% precip / Retractable,77.7,6.2,0,0.369,0.404,0.469,0.459,final,Final,Final,"Final — MIL 5, MIA 2",5,2,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,15.68,84.32,49.83,50.17,34.16,-34.16,MIA,D,-34.16,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Miami run suppression helps pitching — lean Brewers only if the price matches your starter read.
2026-04-18,BAL,CLE,6:10 PM,Dean Kremer,Gavin Williams,209,-285,5.0,-120,-110,50F / 15 mph wind / 7% precip / Open,49.6,14.8,7,0.399,0.338,0.472,0.524,final,Final,Final,"Final — BAL 2, CLE 4",2,4,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,30.42,69.58,44.32,55.68,13.91,-13.91,CLE,D,-13.91,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Low,Progressive Field — coin-flip pricing common; prioritize handedness and bullpen availability.
2026-04-18,STL,HOU,7:10 PM,Andre Pallante,Lance McCullers Jr.,155,-175,,,,66F / 11 mph wind / 55% precip / Retractable,66.3,11.0,55,0.346,0.358,0.537,0.567,final,Final,Final,"Final — STL 7, HOU 5",7,5,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,38.13,61.87,43.57,56.43,5.44,-5.44,HOU,D,-5.44,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium-High,Astros home talent vs Cardinals road — market often prices Houston heavy; PASS unless you see a real innings edge.
2026-04-18,TEX,SEA,7:15 PM,Nathan Eovaldi,George Kirby,120,-140,7.0,-116,-104,67F / 4 mph wind / 2% precip / Retractable,66.8,4.1,2,0.368,0.411,0.548,0.420,final,Final,Final,"Final — TEX 3, SEA 7",3,7,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,43.80,56.20,40.42,59.58,-3.37,3.37,SEA,B,3.37,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,T-Mobile Park suppresses offense — pitching duel pricing; props and totals often cleaner.
2026-04-18,ATL,PHI,7:15 PM,Chris Sale,Cristopher Sánchez,-105,-112,8.0,-112,-110,59F / 11 mph wind / 0% precip / Open,59.2,11.2,0,0.529,0.486,0.586,0.579,final,Final,Final,"Final — ATL 3, PHI 1",3,1,Partial,rotowire_unconfirmed|starter_mismatch_rotowire,49.23,50.77,47.49,52.51,-1.74,1.74,PHI,C,1.74,High,rotowire_unconfirmed;starter_mismatch_rotowire,Medium,NL East heavyweight pricing — small edges only; watch weather and late scratches.
2026-04-18,LAD,COL,8:10 PM,Emmet Sheehan,Ryan Feltner,-245,219,11.5,-117,-103,60F / 2 mph wind / 0% precip / Open,60.0,1.8,0,0.462,0.401,0.663,0.496,final,Final,Final,"Final — LAD 3, COL 4",3,4,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,69.38,30.62,57.31,42.69,-12.07,12.07,LAD,D,-12.07,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Coors elevates variance — Dodgers talent priced in; Rockies bats can still pop in chunks.
2026-04-18,TOR,AZ,8:10 PM,Max Scherzer,Zac Gallen,-110,-104,8.0,-106,-115,90F / 3 mph wind / 0% precip / Retractable,89.8,2.6,0,0.427,0.498,0.418,0.481,final,Final,Final,"Final — TOR 2, AZ 6",2,6,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,50.68,49.32,48.34,51.66,-2.34,2.34,AZ,B,2.34,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge.
2026-04-18,SD,LAA,9:38 PM,Germán Márquez,Yusei Kikuchi,-145,123,9.0,-110,-110,73F / 8 mph wind / 0% precip / Open,73.1,7.8,0,0.494,0.374,0.538,0.616,final,Final,Final,"Final — SD 4, LAA 1",4,1,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,56.89,43.11,50.98,49.02,-5.91,5.91,SD,D,-5.91,High,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status
2026-04-18,KC@NYY,KC,Maikel Garcia,Will Warren,2.96,24.03,+3281,+316,700,-9.54,1.5,128,-19.83,0.524,6,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,KC@NYY,KC,Bobby Witt Jr.,Will Warren,1.97,23.40,+4982,+327,420,-17.26,1.5,-105,-27.82,0.443,6,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,KC@NYY,KC,Vinnie Pasquantino,Will Warren,0.40,9.62,+24900,+939,600,-13.89,1.5,160,-28.84,0.387,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,KC@NYY,KC,Jac Caglianone,Will Warren,3.54,25.64,+2728,+290,NA,,1.5,100,-24.36,0.416,3,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,KC,Carter Jensen,Will Warren,7.29,29.48,+1272,+239,NA,,1.5,100,-20.52,0.647,3,B,C,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,KC,Michael Massey,Will Warren,0.40,6.00,+24900,+1567,900,-9.60,1.5,220,-25.25,0.295,3,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,KC@NYY,KC,Isaac Collins,Will Warren,0.40,6.00,+24900,+1567,820,-10.47,1.5,205,-26.79,0.305,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,KC@NYY,KC,Lane Thomas,Will Warren,0.40,6.00,+24900,+1567,790,-10.84,1.5,190,-28.48,0.444,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,KC@NYY,KC,Kyle Isbel,Will Warren,0.40,6.00,+24900,+1567,NA,,,,,0.248,4,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,KC@NYY,NYY,Amed Rosario,Noah Cameron,14.50,50.91,+590,-104,NA,,1.5,170,13.87,0.672,3,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,NYY,Aaron Judge,Noah Cameron,19.29,55.00,+418,-122,NA,,1.5,120,9.55,0.813,6,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,NYY,Cody Bellinger,Noah Cameron,7.49,31.70,+1235,+215,NA,,1.5,145,-9.12,0.412,6,B,C,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,NYY,Giancarlo Stanton,Noah Cameron,7.62,25.77,+1212,+288,NA,,1.5,150,-14.23,0.356,3,C,C,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,NYY,Ben Rice,Noah Cameron,20.74,55.00,+382,-122,NA,,1.5,145,14.18,0.851,2,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,NYY,Randal Grichuk,Noah Cameron,1.51,6.00,+6505,+1567,NA,,1.5,150,-34.00,0.180,2,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,NYY,Jazz Chisholm Jr.,Noah Cameron,0.46,6.00,+21866,+1567,NA,,1.5,100,-44.00,0.270,5,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,NYY,José Caballero,Noah Cameron,3.90,22.39,+2465,+347,NA,,1.5,270,-4.64,0.499,4,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,KC@NYY,NYY,J.C. Escarra,Noah Cameron,2.73,11.47,+3563,+772,NA,,,,,0.180,2,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CIN@MIN,CIN,TJ Friedl,Taj Bradley,0.40,6.00,+24900,+1567,1000,-8.69,1.5,205,-26.79,0.248,6,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CIN@MIN,CIN,Will Benson,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.312,3,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CIN@MIN,CIN,Elly De La Cruz,Taj Bradley,8.24,37.28,+1114,+168,525,-7.76,1.5,160,-1.18,0.705,3,A,B,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CIN@MIN,CIN,Sal Stewart,Taj Bradley,10.16,41.10,+884,+143,525,-5.84,1.5,170,4.06,0.763,3,A+,B,A+,2+ TB,A+,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CIN@MIN,CIN,Eugenio Suárez,Taj Bradley,0.40,14.49,+24900,+590,NA,,1.5,100,-35.51,0.487,11,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CIN@MIN,CIN,Nathaniel Lowe,Taj Bradley,0.40,6.00,+24900,+1567,NA,,,,,0.310,11,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CIN@MIN,CIN,Tyler Stephenson,Taj Bradley,2.59,16.49,+3760,+507,525,-13.41,1.5,148,-23.84,0.399,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CIN@MIN,CIN,Rece Hinds,Taj Bradley,0.40,6.00,+24900,+1567,430,-18.47,1.5,150,-34.00,0.180,1,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CIN@MIN,CIN,Ke'Bryan Hayes,Taj Bradley,0.40,6.00,+24900,+1567,950,-9.12,1.5,210,-26.26,0.180,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CIN@MIN,MIN,Byron Buxton,Andrew Abbott,7.82,33.29,+1179,+200,NA,,1.5,-151,-26.87,0.668,6,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CIN@MIN,MIN,Austin Martin,Andrew Abbott,3.41,27.28,+2830,+267,NA,,,,,0.667,3,B,D,B,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CIN@MIN,MIN,Josh Bell,Andrew Abbott,6.09,29.74,+1543,+236,NA,,1.5,192,-4.50,0.466,5,B,C,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CIN@MIN,MIN,Ryan Jeffers,Andrew Abbott,7.99,35.26,+1151,+184,NA,,,,,0.655,5,A,B,A,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CIN@MIN,MIN,Luke Keaschall,Andrew Abbott,0.40,10.95,+24900,+813,NA,,1.5,162,-27.22,0.376,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CIN@MIN,MIN,Trevor Larnach,Andrew Abbott,3.55,22.63,+2719,+342,NA,,1.5,228,-7.86,0.506,6,C,D,C,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CIN@MIN,MIN,Brooks Lee,Andrew Abbott,4.22,20.25,+2268,+394,NA,,1.5,180,-15.47,0.614,5,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CIN@MIN,MIN,Ryan Kreidler,Andrew Abbott,15.03,49.64,+565,+101,NA,,,,,0.868,2,A+,A+,A+,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CIN@MIN,MIN,Tristan Gray,Andrew Abbott,6.64,30.49,+1405,+228,NA,,1.5,200,-2.84,0.527,2,B,C,B,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,NYM,Carson Benge,Jameson Taillon,0.40,6.00,+24900,+1567,1150,-7.60,0.5,-130,,0.262,3,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,NYM,Bo Bichette,Jameson Taillon,0.74,18.81,+13386,+432,975,-8.56,1.5,160,-19.65,0.432,27,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,NYM@CHC,NYM,Francisco Lindor,Jameson Taillon,2.19,16.58,+4464,+503,700,-10.31,1.5,210,-15.68,0.357,19,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,NYM@CHC,NYM,Luis Robert Jr.,Jameson Taillon,2.30,18.68,+4256,+435,588,-12.24,1.5,145,-22.13,0.422,14,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,NYM@CHC,NYM,MJ Melendez,Jameson Taillon,6.94,47.19,+1341,+112,575,-7.87,0.5,-140,,0.950,9,A+,C,A+,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,NYM,Francisco Alvarez,Jameson Taillon,8.13,38.18,+1131,+162,NA,,1.5,50,-28.49,0.550,8,A+,B,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,NYM,Mark Vientos,Jameson Taillon,1.32,13.08,+7466,+664,625,-12.47,1.5,170,-23.96,0.226,7,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,NYM@CHC,NYM,Brett Baty,Jameson Taillon,0.40,8.08,+24900,+1138,900,-9.60,1.5,260,-19.70,0.254,4,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,NYM@CHC,NYM,Marcus Semien,Jameson Taillon,1.05,12.87,+9436,+677,800,-10.06,1.5,175,-23.49,0.306,19,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,NYM@CHC,CHC,Nico Hoerner,Freddy Peralta,1.59,23.21,+6196,+331,NA,,1.5,170,-13.82,0.761,34,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,CHC,Michael Busch,Freddy Peralta,0.40,6.00,+24900,+1567,NA,,1.5,128,-37.86,0.180,23,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,CHC,Alex Bregman,Freddy Peralta,0.40,10.58,+24900,+845,NA,,1.5,130,-32.90,0.356,9,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,CHC,Ian Happ,Freddy Peralta,7.65,29.34,+1207,+241,NA,,1.5,148,-10.98,0.571,41,B,C,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,CHC,Seiya Suzuki,Freddy Peralta,0.40,6.92,+24900,+1345,NA,,1.5,140,-34.75,0.433,30,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,CHC,Moisés Ballesteros,Freddy Peralta,12.50,45.92,+700,+118,NA,,0.5,-115,,0.950,4,A+,A,A+,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,CHC,Miguel Amaya,Freddy Peralta,0.40,8.56,+24900,+1068,NA,,,,,0.326,10,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,NYM@CHC,CHC,Pete Crow-Armstrong,Freddy Peralta,0.40,11.69,+24900,+756,NA,,1.5,160,-26.77,0.362,15,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,NYM@CHC,CHC,Dansby Swanson,Freddy Peralta,5.59,25.50,+1688,+292,NA,,0.5,-152,,0.726,24,C,D,C,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,TB,Chandler Simpson,Paul Skenes,0.40,6.00,+24900,+1567,2000,-4.36,1.5,-103,-44.74,0.415,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Junior Caminero,Paul Skenes,1.29,18.51,+7643,+440,1025,-7.60,1.5,372,-2.68,0.656,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Jonathan Aranda,Paul Skenes,0.40,15.27,+24900,+555,1350,-6.50,1.5,405,-4.53,0.420,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Yandy Díaz,Paul Skenes,0.40,22.78,+24900,+339,1250,-7.01,1.5,245,-6.20,0.606,8,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Jake Fraley,Paul Skenes,0.40,6.00,+24900,+1567,NA,,1.5,50,-60.67,0.373,7,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,TB,Cedric Mullins,Paul Skenes,0.40,6.00,+24900,+1567,1150,-7.60,1.5,290,-19.64,0.370,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Richie Palacios,Paul Skenes,0.40,18.73,+24900,+434,1600,-5.48,1.5,420,-0.50,0.749,5,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Hunter Feduccia,Paul Skenes,0.40,6.00,+24900,+1567,2000,-4.36,1.5,475,-11.39,0.301,1,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Taylor Walls,Paul Skenes,0.40,6.00,+24900,+1567,2700,-3.17,1.5,490,-10.95,0.440,6,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TB@PIT,PIT,Oneil Cruz,Drew Rasmussen,9.92,42.35,+908,+136,NA,,1.5,232,12.23,0.716,4,A+,B,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,PIT,Brandon Lowe,Drew Rasmussen,5.67,29.19,+1665,+243,NA,,1.5,100,-20.81,0.709,2,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,PIT,Bryan Reynolds,Drew Rasmussen,2.42,24.26,+4027,+312,NA,,1.5,420,5.03,0.588,6,C,D,C,,,unpriced,priced_below_tier,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,PIT,Ryan O'Hearn,Drew Rasmussen,3.78,29.11,+2548,+244,NA,,1.5,150,-10.89,0.518,5,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,PIT,Marcell Ozuna,Drew Rasmussen,0.40,12.70,+24900,+687,NA,,1.5,100,-37.30,0.458,4,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,PIT,Nick Yorke,Drew Rasmussen,0.40,13.48,+24900,+642,NA,,1.5,275,-13.19,0.441,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,PIT,Spencer Horwitz,Drew Rasmussen,0.40,8.33,+24900,+1101,NA,,,,,0.661,1,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,TB@PIT,PIT,Konnor Griffin,Drew Rasmussen,0.40,6.00,+24900,+1567,NA,,1.5,290,-19.64,0.351,1,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TB@PIT,PIT,Henry Davis,Drew Rasmussen,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.365,1,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SF@WSH,SF,Willy Adames,Cade Cavalli,5.44,30.37,+1738,+229,800,-5.67,1.5,225,-0.40,0.703,3,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Luis Arraez,Cade Cavalli,0.40,12.48,+24900,+701,2100,-4.15,1.5,230,-17.82,0.470,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Matt Chapman,Cade Cavalli,0.65,19.97,+15390,+401,825,-10.17,1.5,-111,-32.64,0.551,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Rafael Devers,Cade Cavalli,2.58,16.07,+3777,+522,700,-9.92,1.5,-110,-36.31,0.364,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Casey Schmitt,Cade Cavalli,7.53,37.18,+1228,+169,1200,-0.16,1.5,312,12.91,0.803,2,A,C,A,2+ TB,A,priced_no_edge,qualified,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Jung Hoo Lee,Cade Cavalli,1.28,20.68,+7691,+384,1300,-5.86,1.5,170,-16.36,0.555,2,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Heliot Ramos,Cade Cavalli,4.39,23.69,+2177,+322,850,-6.14,1.5,192,-10.56,0.432,2,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Drew Gilbert,Cade Cavalli,8.58,35.25,+1066,+184,1400,1.91,1.5,-2,33.29,0.756,2,A,B,A,2+ TB,A,priced_below_tier,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Patrick Bailey,Cade Cavalli,0.40,6.00,+24900,+1567,1300,-6.74,1.5,275,-20.67,0.180,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,WSH,James Wood,Adrian Houser,17.39,55.00,+475,-122,NA,,1.5,150,15.00,0.858,7,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SF@WSH,WSH,Luis García Jr.,Adrian Houser,4.87,24.88,+1955,+302,NA,,1.5,255,-3.28,0.431,7,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SF@WSH,WSH,José Tena,Adrian Houser,3.52,29.79,+2737,+236,NA,,,,,0.578,3,B,D,B,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,SF@WSH,WSH,CJ Abrams,Adrian Houser,13.74,51.76,+628,-107,NA,,1.5,202,18.64,0.950,6,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SF@WSH,WSH,Jacob Young,Adrian Houser,5.40,29.16,+1752,+243,NA,,1.5,-115,-24.33,0.494,2,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SF@WSH,WSH,Daylen Lile,Adrian Houser,3.39,23.72,+2849,+322,NA,,1.5,150,-16.28,0.392,5,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SF@WSH,WSH,Nasim Nuñez,Adrian Houser,0.40,6.00,+24900,+1567,NA,,1.5,325,-17.53,0.279,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SF@WSH,WSH,Jorbit Vivas,Adrian Houser,0.40,7.66,+24900,+1206,NA,,1.5,100,-42.34,0.452,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SF@WSH,WSH,Drew Millas,Adrian Houser,0.40,6.82,+24900,+1366,NA,,,,,0.292,5,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CWS@ATH,CWS,Andrew Benintendi,Luis Severino,8.53,35.67,+1073,+180,NA,,,,,0.441,43,A,B,A,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CWS@ATH,CWS,Munetaka Murakami,Luis Severino,15.65,47.62,+539,+110,372,-5.53,1.5,124,2.98,0.551,3,A+,A+,A+,2+ TB,A+,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Miguel Vargas,Luis Severino,4.34,18.81,+2207,+432,562,-10.77,1.5,127,-25.24,0.364,7,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Colson Montgomery,Luis Severino,6.48,24.99,+1442,+300,418,-12.82,1.5,126,-19.26,0.534,3,C,C,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Everson Pereira,Luis Severino,14.90,50.00,+571,+100,665,1.83,1.5,150,10.00,0.950,3,A+,A+,A+,2+ TB,A+,priced_below_gate,qualified,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Sam Antonacci,Luis Severino,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.205,3,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CWS@ATH,CWS,Chase Meidroth,Luis Severino,3.06,20.74,+3170,+382,975,-6.24,1.5,128,-23.12,0.386,3,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Tristan Peters,Luis Severino,0.40,6.00,+24900,+1567,NA,,,,,0.180,2,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CWS@ATH,CWS,Reese McGuire,Luis Severino,1.13,12.21,+8744,+719,NA,,,,,0.409,9,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CWS@ATH,ATH,Jeff McNeil,Erick Fedde,0.40,17.94,+24900,+457,NA,,1.5,50,-48.72,0.559,25,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CWS@ATH,ATH,Shea Langeliers,Erick Fedde,6.98,35.29,+1332,+183,NA,,1.5,-116,-18.42,0.570,3,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CWS@ATH,ATH,Nick Kurtz,Erick Fedde,7.41,35.42,+1249,+182,NA,,1.5,127,-8.63,0.579,2,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CWS@ATH,ATH,Tyler Soderstrom,Erick Fedde,2.73,21.52,+3567,+365,NA,,1.5,135,-21.03,0.515,2,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CWS@ATH,ATH,Jacob Wilson,Erick Fedde,0.40,11.73,+24900,+752,NA,,1.5,-110,-40.65,0.400,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CWS@ATH,ATH,Carlos Cortes,Erick Fedde,2.07,21.69,+4741,+361,NA,,,,,0.546,2,C,D,C,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CWS@ATH,ATH,Max Muncy,Erick Fedde,5.58,32.21,+1693,+210,NA,,1.5,127,-11.85,0.469,2,A,D,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,CWS@ATH,ATH,Lawrence Butler,Erick Fedde,1.02,13.36,+9735,+648,NA,,,,,0.335,2,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,CWS@ATH,ATH,Austin Wynns,Erick Fedde,0.40,6.00,+24900,+1567,NA,,,,,0.180,2,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,DET@BOS,DET,Kevin McGonigle,Brayan Bello,8.18,39.99,+1123,+150,NA,,1.5,150,-0.01,0.574,3,A+,B,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,DET@BOS,DET,Gleyber Torres,Brayan Bello,1.86,17.57,+5290,+469,800,-9.26,1.5,154,-21.80,0.453,28,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Colt Keith,Brayan Bello,7.90,37.64,+1166,+166,NA,,,,,0.438,5,A,B,A,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,DET@BOS,DET,Riley Greene,Brayan Bello,8.30,37.92,+1105,+164,1000,-0.79,1.5,198,4.37,0.522,11,A,B,A,2+ TB,A,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Spencer Torkelson,Brayan Bello,3.46,22.43,+2787,+346,700,-9.04,1.5,185,-12.66,0.447,6,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Kerry Carpenter,Brayan Bello,13.18,45.20,+659,+121,NA,,,,,0.732,7,A+,A,A+,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,DET@BOS,DET,Wenceel Pérez,Brayan Bello,3.29,6.00,+2937,+1567,710,-9.05,1.5,166,-31.59,0.264,4,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Javier Báez,Brayan Bello,4.55,27.65,+2098,+262,1070,-4.00,1.5,200,-5.68,0.608,7,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Jake Rogers,Brayan Bello,0.94,6.00,+10571,+1567,NA,,,,,0.180,2,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,DET@BOS,BOS,Roman Anthony,Tarik Skubal,0.93,18.78,+10694,+432,NA,,1.5,164,-19.10,0.432,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,DET@BOS,BOS,Andruw Monasterio,Tarik Skubal,0.40,13.38,+24900,+647,NA,,1.5,153,-26.14,0.504,6,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,DET@BOS,BOS,Willson Contreras,Tarik Skubal,5.28,30.86,+1793,+224,NA,,1.5,147,-9.62,0.735,9,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,DET@BOS,BOS,Trevor Story,Tarik Skubal,0.40,10.13,+24900,+887,NA,,1.5,132,-32.98,0.445,11,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,DET@BOS,BOS,Wilyer Abreu,Tarik Skubal,2.73,23.64,+3569,+323,NA,,1.5,135,-18.91,0.418,3,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,DET@BOS,BOS,Ceddanne Rafaela,Tarik Skubal,0.40,12.69,+24900,+688,NA,,1.5,150,-27.31,0.486,8,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,DET@BOS,BOS,Caleb Durbin,Tarik Skubal,0.40,6.00,+24900,+1567,NA,,1.5,195,-27.90,0.352,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,DET@BOS,BOS,Connor Wong,Tarik Skubal,0.40,22.17,+24900,+351,NA,,,,,0.455,7,C,D,C,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,DET@BOS,BOS,Isiah Kiner-Falefa,Tarik Skubal,0.40,6.00,+24900,+1567,NA,,1.5,202,-27.11,0.378,8,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIL,Sal Frelick,Sandy Alcantara,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.292,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIL,William Contreras,Sandy Alcantara,1.38,24.37,+7170,+310,NA,,1.5,150,-15.63,0.594,12,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIL,Brice Turang,Sandy Alcantara,6.42,36.04,+1458,+177,1300,-0.72,1.5,230,5.74,0.556,6,A,C,A,2+ TB,A,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Gary Sánchez,Sandy Alcantara,7.97,33.79,+1155,+196,650,-5.36,1.5,280,7.48,0.726,15,A,B,A,2+ TB,A,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Jake Bauers,Sandy Alcantara,6.12,29.81,+1534,+235,700,-6.38,1.5,300,4.81,0.670,15,B,C,B,2+ TB,B,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Luis Rengifo,Sandy Alcantara,0.40,6.00,+24900,+1567,1300,-6.74,1.5,-120,-48.55,0.296,8,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Garrett Mitchell,Sandy Alcantara,4.68,30.80,+2035,+225,1000,-4.41,1.5,260,3.02,0.622,5,B,D,B,2+ TB,B,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Brandon Lockridge,Sandy Alcantara,0.40,6.00,+24900,+1567,2200,-3.95,1.5,360,-15.74,0.288,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Joey Ortiz,Sandy Alcantara,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.180,4,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Jakob Marsee,Brandon Woodruff,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.302,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Xavier Edwards,Brandon Woodruff,0.56,23.30,+17891,+329,NA,,1.5,150,-16.70,0.543,12,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Agustín Ramírez,Brandon Woodruff,0.40,10.02,+24900,+898,NA,,1.5,240,-19.39,0.501,8,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Liam Hicks,Brandon Woodruff,2.08,21.69,+4710,+361,NA,,1.5,-110,-30.69,0.458,6,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Otto Lopez,Brandon Woodruff,6.78,36.95,+1375,+171,NA,,1.5,180,1.24,0.755,8,A,C,A,,,unpriced,priced_below_gate,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Connor Norby,Brandon Woodruff,1.74,21.99,+5640,+355,NA,,1.5,250,-6.58,0.672,5,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Owen Caissie,Brandon Woodruff,3.56,18.89,+2706,+429,NA,,1.5,360,-2.85,0.278,5,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Heriberto Hernández,Brandon Woodruff,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.284,7,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,MIL@MIA,MIA,Javier Sanoja,Brandon Woodruff,0.40,6.67,+24900,+1399,NA,,1.5,150,-33.33,0.342,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,BAL,Gunnar Henderson,Gavin Williams,6.60,29.52,+1416,+239,900,-3.40,1.5,150,-10.48,0.568,9,B,C,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Taylor Ward,Gavin Williams,0.40,17.77,+24900,+463,1050,-8.30,1.5,150,-22.23,0.491,8,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Pete Alonso,Gavin Williams,2.42,18.00,+4040,+456,850,-8.11,0.5,170,,0.456,7,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,BAL,Dylan Beavers,Gavin Williams,0.40,6.00,+24900,+1567,NA,,,,,0.281,3,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,BAL@CLE,BAL,Colton Cowser,Gavin Williams,0.40,6.00,+24900,+1567,NA,,,,,0.217,6,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,BAL@CLE,BAL,Leody Taveras,Gavin Williams,2.66,30.80,+3662,+225,NA,,1.5,150,-9.20,0.544,8,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,BAL,Samuel Basallo,Gavin Williams,3.39,15.07,+2849,+564,NA,,1.5,150,-24.93,0.440,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,BAL,Coby Mayo,Gavin Williams,0.40,6.00,+24900,+1567,850,-10.13,1.5,325,-17.53,0.299,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Jeremiah Jackson,Gavin Williams,8.58,34.95,+1065,+186,800,-2.53,1.5,150,-5.05,0.950,2,A,B,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,BAL@CLE,CLE,Steven Kwan,Dean Kremer,0.40,6.07,+24900,+1546,NA,,0.5,120,,0.469,14,D,D,D,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,CLE,Chase DeLauter,Dean Kremer,6.28,27.77,+1492,+260,NA,,1.5,50,-38.90,0.380,3,B,C,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,CLE,José Ramírez,Dean Kremer,6.11,32.10,+1538,+212,NA,,1.5,175,-4.26,0.646,16,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,CLE,Kyle Manzardo,Dean Kremer,2.66,19.91,+3664,+402,NA,,,,,0.542,5,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,BAL@CLE,CLE,George Valera,Dean Kremer,2.71,28.54,+3591,+250,NA,,,,,0.622,0,B,D,B,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,BAL@CLE,CLE,Rhys Hoskins,Dean Kremer,2.13,19.54,+4586,+412,NA,,1.5,275,-7.13,0.451,8,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,CLE,Daniel Schneemann,Dean Kremer,8.88,42.69,+1026,+134,NA,,1.5,400,22.69,0.875,4,A+,B,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,BAL@CLE,CLE,Bo Naylor,Dean Kremer,3.47,16.92,+2785,+491,NA,,,,,0.211,6,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,BAL@CLE,CLE,Brayan Rocchio,Dean Kremer,2.22,18.90,+4405,+429,NA,,1.5,135,-23.65,0.521,4,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,STL,JJ Wetherholt,Lance McCullers Jr.,2.87,18.68,+3386,+435,800,-8.24,1.5,185,-16.40,0.526,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Iván Herrera,Lance McCullers Jr.,4.24,26.06,+2259,+284,750,-7.53,1.5,180,-9.65,0.551,3,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Alec Burleson,Lance McCullers Jr.,8.29,40.00,+1106,+150,600,-5.99,1.5,180,4.29,0.545,3,A+,B,A+,2+ TB,A+,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Jordan Walker,Lance McCullers Jr.,17.94,55.00,+458,-122,700,5.44,1.5,180,19.29,0.950,3,A+,A+,A+,2+ TB,A+,qualified,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Nolan Gorman,Lance McCullers Jr.,1.40,10.24,+7027,+877,600,-12.88,1.5,275,-16.43,0.376,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Masyn Winn,Lance McCullers Jr.,0.40,6.00,+24900,+1567,1100,-7.93,1.5,250,-22.57,0.369,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Ramón Urías,Lance McCullers Jr.,6.99,31.45,+1331,+218,NA,,,,,0.605,5,B,C,B,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,STL@HOU,STL,Nathan Church,Lance McCullers Jr.,0.55,13.53,+18022,+639,850,-9.97,1.5,195,-20.37,0.547,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,STL@HOU,STL,José Fermín,Lance McCullers Jr.,3.03,18.12,+3202,+452,NA,,,,,0.364,2,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,STL@HOU,HOU,Jose Altuve,Andre Pallante,4.08,24.80,+2354,+303,NA,,1.5,190,-9.68,0.527,7,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,HOU,Yordan Alvarez,Andre Pallante,19.49,55.00,+413,-122,NA,,1.5,155,15.78,0.865,5,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,HOU,Carlos Correa,Andre Pallante,4.31,25.50,+2222,+292,NA,,1.5,168,-11.82,0.448,6,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,HOU,Christian Walker,Andre Pallante,9.09,36.72,+1000,+172,NA,,1.5,125,-7.72,0.717,6,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,HOU,Isaac Paredes,Andre Pallante,0.40,6.00,+24900,+1567,NA,,1.5,162,-32.17,0.282,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,HOU,Taylor Trammell,Andre Pallante,2.04,20.06,+4812,+399,NA,,1.5,275,-6.61,0.457,2,C,D,C,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,HOU,Cam Smith,Andre Pallante,9.45,40.02,+958,+150,NA,,1.5,165,2.28,0.620,2,A+,B,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,HOU,Christian Vázquez,Andre Pallante,12.03,52.72,+731,-111,NA,,1.5,150,12.72,0.950,4,A+,A,A+,2+ TB,A+,unpriced,qualified,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,STL@HOU,HOU,Shay Whitcomb,Andre Pallante,8.07,21.73,+1139,+360,NA,,1.5,200,-11.60,0.233,2,B,B,C,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TEX@SEA,TEX,Brandon Nimmo,George Kirby,3.87,26.06,+2481,+284,562,-11.23,1.5,145,-14.76,0.624,11,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Corey Seager,George Kirby,4.46,23.26,+2141,+330,360,-17.28,1.5,130,-20.22,0.512,23,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Wyatt Langford,George Kirby,0.40,12.20,+24900,+719,628,-13.34,1.5,157,-26.71,0.439,17,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Jake Burger,George Kirby,5.01,24.73,+1896,+304,475,-12.38,1.5,152,-14.95,0.571,9,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Joc Pederson,George Kirby,0.40,12.91,+24900,+674,550,-14.98,1.5,200,-20.42,0.558,11,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Josh Jung,George Kirby,3.85,34.49,+2500,+190,895,-6.20,1.5,195,0.59,0.783,11,A,D,A,,,priced_no_edge,priced_below_gate,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Evan Carter,George Kirby,0.46,12.27,+21643,+715,805,-10.59,1.5,202,-20.84,0.448,10,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Ezequiel Duran,George Kirby,0.40,16.54,+24900,+505,NA,,,,,0.366,19,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,TEX@SEA,TEX,Kyle Higashioka,George Kirby,1.13,17.67,+8761,+466,NA,,,,,0.632,12,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,TEX@SEA,SEA,J.P. Crawford,Nathan Eovaldi,0.40,10.74,+24900,+831,NA,,1.5,227,-19.84,0.342,25,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TEX@SEA,SEA,Cal Raleigh,Nathan Eovaldi,0.85,11.75,+11720,+751,NA,,1.5,146,-28.91,0.423,24,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TEX@SEA,SEA,Julio Rodríguez,Nathan Eovaldi,1.06,18.69,+9348,+435,NA,,1.5,140,-22.98,0.496,24,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TEX@SEA,SEA,Josh Naylor,Nathan Eovaldi,0.40,7.22,+24900,+1285,NA,,1.5,100,-42.78,0.412,14,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TEX@SEA,SEA,Randy Arozarena,Nathan Eovaldi,0.40,16.95,+24900,+490,NA,,1.5,182,-18.51,0.497,31,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TEX@SEA,SEA,Luke Raley,Nathan Eovaldi,13.09,52.68,+664,-111,NA,,,,,0.657,18,A+,A,A+,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,TEX@SEA,SEA,Dominic Canzone,Nathan Eovaldi,6.68,28.27,+1397,+254,NA,,,,,0.281,6,B,C,B,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,TEX@SEA,SEA,Cole Young,Nathan Eovaldi,0.40,9.39,+24900,+965,NA,,1.5,256,-18.70,0.355,5,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TEX@SEA,SEA,Leo Rivas,Nathan Eovaldi,0.40,6.00,+24900,+1567,NA,,1.5,295,-19.32,0.317,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,ATL@PHI,ATL,Ronald Acuña Jr.,Cristopher Sánchez,3.65,29.87,+2636,+235,415,-15.76,1.5,100,-20.13,0.569,13,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Drake Baldwin,Cristopher Sánchez,5.17,32.91,+1836,+204,550,-10.22,1.5,130,-10.57,0.655,6,A,D,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Ozzie Albies,Cristopher Sánchez,0.40,14.10,+24900,+609,770,-11.09,1.5,150,-25.90,0.456,16,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Matt Olson,Cristopher Sánchez,9.68,42.55,+933,+135,410,-9.93,1.5,130,-0.92,0.747,21,A+,B,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Austin Riley,Cristopher Sánchez,4.48,27.96,+2134,+258,510,-11.92,1.5,130,-15.52,0.644,13,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Mauricio Dubón,Cristopher Sánchez,0.86,20.96,+11536,+377,1075,-7.65,1.5,190,-13.53,0.574,5,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Eli White,Cristopher Sánchez,0.40,6.00,+24900,+1567,NA,,,,,0.519,6,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,ATL@PHI,ATL,Jonah Heim,Cristopher Sánchez,0.40,8.51,+24900,+1075,NA,,,,,0.379,3,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,ATL@PHI,ATL,Jorge Mateo,Cristopher Sánchez,4.49,37.16,+2129,+169,NA,,,,,0.737,5,A,D,A,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,ATL@PHI,PHI,Trea Turner,Chris Sale,0.40,12.67,+24900,+689,NA,,1.5,118,-33.20,0.541,18,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,ATL@PHI,PHI,Kyle Schwarber,Chris Sale,9.80,36.82,+921,+172,NA,,1.5,155,-2.39,0.623,18,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,ATL@PHI,PHI,Bryce Harper,Chris Sale,6.06,36.72,+1550,+172,NA,,1.5,125,-7.72,0.785,12,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,ATL@PHI,PHI,Adolis García,Chris Sale,1.69,15.04,+5822,+565,NA,,1.5,145,-25.77,0.391,8,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,ATL@PHI,PHI,J.T. Realmuto,Chris Sale,0.40,13.34,+24900,+649,NA,,,,,0.486,15,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,ATL@PHI,PHI,Alec Bohm,Chris Sale,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.180,17,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,ATL@PHI,PHI,Felix Reyes,Chris Sale,23.80,55.00,+320,-122,NA,,,,,,3,A+,A+,A+,,,unpriced,unpriced,"Low — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,ATL@PHI,PHI,Edmundo Sosa,Chris Sale,2.27,22.76,+4297,+339,NA,,,,,0.761,15,C,D,C,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,ATL@PHI,PHI,Brandon Marsh,Chris Sale,1.52,22.39,+6489,+347,NA,,1.5,172,-14.37,0.490,2,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,LAD,Shohei Ohtani,Ryan Feltner,16.30,53.12,+513,-113,194,-17.71,2.5,-104,,0.764,11,A+,A+,A+,,,priced_no_edge,line_mismatch_2.5,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,LAD,Kyle Tucker,Ryan Feltner,7.48,28.16,+1237,+255,410,-12.13,1.5,-132,-28.73,0.446,3,B,C,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Andy Pages,Ryan Feltner,14.42,53.45,+593,-115,480,-2.82,1.5,-148,-6.22,0.815,10,A+,A+,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Freddie Freeman,Ryan Feltner,15.67,55.00,+538,-122,NA,,1.5,150,15.00,0.607,19,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,LAD,Teoscar Hernández,Ryan Feltner,13.15,45.14,+661,+122,NA,,1.5,150,5.14,0.791,11,A+,A,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,LAD,Max Muncy,Ryan Feltner,17.89,55.00,+459,-122,300,-7.11,1.5,-110,2.62,0.792,16,A+,A+,A+,2+ TB,A+,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Dalton Rushing,Ryan Feltner,25.00,55.00,+300,-122,NA,,1.5,150,15.00,0.950,2,A+,A+,A+,2+ TB,A+,unpriced,qualified,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,LAD,Alex Freeland,Ryan Feltner,6.44,23.27,+1452,+330,775,-4.99,1.5,133,-19.65,0.278,2,C,C,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Miguel Rojas,Ryan Feltner,6.19,31.90,+1516,+214,NA,,,,,0.520,7,B,C,B,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,LAD@COL,COL,Edouard Julien,Emmet Sheehan,4.20,25.33,+2283,+295,NA,,1.5,167,-12.12,0.481,3,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,COL,Mickey Moniak,Emmet Sheehan,11.42,38.31,+776,+161,NA,,1.5,110,-9.31,0.838,9,A+,A,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,COL,TJ Rumfield,Emmet Sheehan,2.57,18.74,+3795,+434,NA,,1.5,134,-24.00,0.365,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,COL,Hunter Goodman,Emmet Sheehan,10.03,35.25,+897,+184,NA,,1.5,113,-11.70,0.784,8,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,COL,Ezequiel Tovar,Emmet Sheehan,2.96,23.17,+3275,+332,NA,,1.5,150,-16.83,0.370,12,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,COL,Troy Johnston,Emmet Sheehan,3.91,26.22,+2457,+281,NA,,1.5,138,-15.80,0.499,2,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,COL,Brenton Doyle,Emmet Sheehan,0.40,12.47,+24900,+702,NA,,1.5,150,-27.53,0.464,8,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,COL,Kyle Karros,Emmet Sheehan,0.40,11.29,+24900,+786,NA,,1.5,186,-23.67,0.316,7,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,LAD@COL,COL,Jordan Beck,Emmet Sheehan,0.40,6.00,+24900,+1567,NA,,,,,0.347,5,D,D,D,,,unpriced,unpriced,"Medium — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-18,TOR@AZ,TOR,Nathan Lukes,Zac Gallen,0.40,6.00,+24900,+1567,950,-9.12,1.5,114,-40.73,0.180,3,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Ernie Clement,Zac Gallen,0.40,18.42,+24900,+443,1060,-8.22,1.5,100,-31.58,0.406,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Vladimir Guerrero Jr.,Zac Gallen,6.23,36.41,+1506,+175,425,-12.82,1.5,-109,-15.74,0.612,8,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Jesús Sánchez,Zac Gallen,5.97,34.74,+1574,+188,510,-10.42,1.5,130,-8.74,0.482,9,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Eloy Jiménez,Zac Gallen,0.66,15.03,+14957,+566,500,-16.00,1.5,128,-28.83,0.345,3,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Andrés Giménez,Zac Gallen,3.23,23.72,+3001,+322,1000,-5.87,1.5,150,-16.28,0.478,12,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Kazuma Okamoto,Zac Gallen,1.73,12.12,+5692,+725,650,-11.61,1.5,167,-25.33,0.221,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Myles Straw,Zac Gallen,8.32,41.42,+1101,+141,1200,0.63,1.5,206,8.74,0.716,7,A+,B,A+,2+ TB,A+,priced_below_tier,qualified,"Medium — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Tyler Heineman,Zac Gallen,0.40,9.68,+24900,+933,NA,,1.5,350,-12.54,0.324,4,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Ketel Marte,Max Scherzer,9.86,37.21,+914,+169,NA,,1.5,118,-8.67,0.631,12,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Corbin Carroll,Max Scherzer,10.68,48.33,+836,+107,NA,,1.5,120,2.88,0.643,6,A+,A,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Geraldo Perdomo,Max Scherzer,1.32,11.21,+7497,+792,NA,,1.5,150,-28.79,0.294,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Lourdes Gurriel Jr.,Max Scherzer,0.40,6.00,+24900,+1567,NA,,1.5,115,-40.51,,11,D,D,D,,,unpriced,priced_no_edge,"Low — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Adrian Del Castillo,Max Scherzer,9.25,40.89,+981,+145,NA,,1.5,170,3.86,0.696,2,A+,B,A+,2+ TB,A+,unpriced,qualified,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Jose Fernandez,Max Scherzer,5.92,29.10,+1588,+244,NA,,1.5,152,-10.58,0.410,2,B,C,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Nolan Arenado,Max Scherzer,4.69,21.41,+2032,+367,NA,,1.5,166,-16.19,0.613,19,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Ildemaro Vargas,Max Scherzer,8.89,42.03,+1025,+138,NA,,1.5,168,4.72,0.662,8,A+,B,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,TOR@AZ,AZ,Alek Thomas,Max Scherzer,3.26,16.27,+2963,+515,NA,,1.5,196,-17.51,0.196,4,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,SD,Ramón Laureano,Yusei Kikuchi,10.50,44.48,+853,+125,438,-8.09,1.5,-104,-6.50,0.628,34,A+,A,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Fernando Tatis Jr.,Yusei Kikuchi,8.00,33.53,+1149,+198,405,-11.80,1.5,110,-14.09,0.403,15,A,B,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Jackson Merrill,Yusei Kikuchi,8.21,36.32,+1117,+175,400,-11.79,1.5,-2,34.36,0.607,6,A,B,A,2+ TB,A,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Manny Machado,Yusei Kikuchi,4.74,22.10,+2010,+353,475,-12.65,1.5,126,-22.15,0.509,15,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Xander Bogaerts,Yusei Kikuchi,9.34,39.48,+970,+153,900,-0.66,1.5,135,-3.07,0.725,13,A+,B,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Miguel Andujar,Yusei Kikuchi,4.30,33.29,+2224,+200,990,-4.87,1.5,138,-8.73,0.608,11,A,D,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-18,SD@LAA,SD,Ty France,Yusei Kikuchi,6.06,30.21,+1550,+231,NA,,1.5,150,-9.79,0.639,14,B,C,B,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,SD,Freddy Fermin,Yusei Kikuchi,1.29,14.17,+7668,+606,NA,,1.5,100,-35.83,0.434,7,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,SD,Jake Cronenworth,Yusei Kikuchi,1.90,12.88,+5170,+677,NA,,1.5,150,-27.12,0.290,9,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Zach Neto,Germán Márquez,8.42,34.12,+1088,+193,NA,,1.5,130,-9.36,0.629,3,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Mike Trout,Germán Márquez,17.07,55.00,+486,-122,NA,,1.5,118,9.13,0.784,9,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Nolan Schanuel,Germán Márquez,1.65,14.62,+5956,+584,NA,,1.5,150,-25.38,0.323,5,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Jo Adell,Germán Márquez,7.93,36.81,+1161,+172,NA,,1.5,140,-4.86,0.687,5,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Yoán Moncada,Germán Márquez,6.55,23.74,+1427,+321,NA,,1.5,185,-11.35,0.588,8,C,C,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Oswald Peraza,Germán Márquez,9.02,36.39,+1009,+175,NA,,1.5,50,-30.28,0.786,2,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Josh Lowe,Germán Márquez,3.80,16.07,+2530,+522,NA,,1.5,188,-18.65,0.561,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Logan O'Hoppe,Germán Márquez,3.39,18.13,+2854,+452,NA,,1.5,150,-21.87,0.449,5,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-18,SD@LAA,LAA,Adam Frazier,Germán Márquez,7.44,39.87,+1243,+151,NA,,1.5,232,9.75,0.738,25,A+,C,A+,2+ TB,A+,unpriced,qualified,"Medium — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
<!-- batter-outlooks-csv:end -->
*/
