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
    impliedAwayPct: 43.43,
    impliedHomePct: 56.57,
    modelAwayPct: 37.22,
    modelHomePct: 62.78,
    edgeAwayPct: -6.20,
    edgeHomePct: 6.20,
    prediction: "NYY",
    decisionTier: "A",
    edgeOnPickPct: 6.20,
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
      { batter: "Maikel Garcia", team: "KC", hrPct: 2.7, tb2Pct: 24.3, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 1.3, tb2Pct: 22.3, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.4, tb2Pct: 9.4, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 1.6, tb2Pct: 20.8, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Carter Jensen", team: "KC", hrPct: 5.8, tb2Pct: 25.2, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Amed Rosario", team: "NYY", hrPct: 9.5, tb2Pct: 38.7, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 18.5, tb2Pct: 55.0, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 4.7, tb2Pct: 22.3, tier: "C", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 5.2, tb2Pct: 21.2, tier: "C", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Ben Rice", team: "NYY", hrPct: 17.9, tb2Pct: 55.0, tier: "A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Randal Grichuk", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "José Caballero", team: "NYY", hrPct: 1.1, tb2Pct: 17.3, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 0.4, tb2Pct: 6.5, tier: "D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
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
    impliedAwayPct: 46.57,
    impliedHomePct: 53.43,
    modelAwayPct: 34.84,
    modelHomePct: 65.16,
    edgeAwayPct: -11.73,
    edgeHomePct: 11.73,
    prediction: "MIN",
    decisionTier: "A+",
    edgeOnPickPct: 11.73,
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
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 9.3, tb2Pct: 40.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 10.5, tb2Pct: 41.2, tier: "A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 0.4, tb2Pct: 12.9, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Nathaniel Lowe", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 3.2, tb2Pct: 17.4, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 9.9, tb2Pct: 38.3, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Austin Martin", team: "MIN", hrPct: 5.3, tb2Pct: 32.4, tier: "A", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Josh Bell", team: "MIN", hrPct: 8.3, tb2Pct: 35.3, tier: "A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ryan Jeffers", team: "MIN", hrPct: 9.3, tb2Pct: 38.5, tier: "A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 2.0, tb2Pct: 15.7, tier: "D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 5.4, tb2Pct: 26.6, tier: "B", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 6.1, tb2Pct: 24.9, tier: "C", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Ryan Kreidler", team: "MIN", hrPct: 16.9, tb2Pct: 54.5, tier: "A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tristan Gray", team: "MIN", hrPct: 8.5, tb2Pct: 35.4, tier: "A", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
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
    impliedAwayPct: 46.57,
    impliedHomePct: 53.43,
    modelAwayPct: 54.76,
    modelHomePct: 45.24,
    edgeAwayPct: 8.19,
    edgeHomePct: -8.19,
    prediction: "NYM",
    decisionTier: "A+",
    edgeOnPickPct: 8.19,
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
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -138,
    homeAmerican: 118,
    impliedAwayPct: 46.78,
    impliedHomePct: 53.22,
    modelAwayPct: 47.83,
    modelHomePct: 52.17,
    edgeAwayPct: 1.05,
    edgeHomePct: -1.05,
    prediction: "PIT",
    decisionTier: "D",
    edgeOnPickPct: -1.05,
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
      { batter: "Yandy Díaz", team: "TB", hrPct: 2.3, tb2Pct: 27.5, tier: "B", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jake Fraley", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Richie Palacios", team: "TB", hrPct: 0.4, tb2Pct: 20.9, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Hunter Feduccia", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.4, tb2Pct: 6.8, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
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
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -112,
    homeAmerican: 102,
    impliedAwayPct: 56.65,
    impliedHomePct: 43.35,
    modelAwayPct: 53.67,
    modelHomePct: 46.33,
    edgeAwayPct: -2.98,
    edgeHomePct: 2.98,
    prediction: "SF",
    decisionTier: "D",
    edgeOnPickPct: -2.98,
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
      { batter: "Willy Adames", team: "SF", hrPct: 6.1, tb2Pct: 31.8, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 12.8, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Matt Chapman", team: "SF", hrPct: 1.1, tb2Pct: 20.8, tier: "C", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Rafael Devers", team: "SF", hrPct: 3.5, tb2Pct: 18.0, tier: "D", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 8.7, tb2Pct: 40.6, tier: "A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 2.1, tb2Pct: 22.6, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 2.2, tb2Pct: 18.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 10.0, tb2Pct: 35.9, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 15.8, tb2Pct: 54.8, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 3.7, tb2Pct: 23.9, tier: "C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "José Tena", team: "WSH", hrPct: 2.7, tb2Pct: 29.0, tier: "B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 13.3, tb2Pct: 51.7, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jacob Young", team: "WSH", hrPct: 4.7, tb2Pct: 28.0, tier: "B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 2.4, tb2Pct: 21.8, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
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
    impliedAwayPct: 41.81,
    impliedHomePct: 58.19,
    modelAwayPct: 65.70,
    modelHomePct: 34.30,
    edgeAwayPct: 23.90,
    edgeHomePct: -23.90,
    prediction: "CWS",
    decisionTier: "A+",
    edgeOnPickPct: 23.90,
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
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 6.8, tb2Pct: 32.0, tier: "B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 13.5, tb2Pct: 43.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 3.5, tb2Pct: 18.4, tier: "D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 4.6, tb2Pct: 20.1, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 14.3, tb2Pct: 48.1, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 2.2, tb2Pct: 18.8, tier: "D", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Tristan Peters", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Reese McGuire", team: "CWS", hrPct: 0.4, tb2Pct: 11.6, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.4, tb2Pct: 17.1, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 6.4, tb2Pct: 33.9, tier: "A", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 5.3, tb2Pct: 30.1, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 2.2, tb2Pct: 20.5, tier: "C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.4, tb2Pct: 7.7, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 1.2, tb2Pct: 20.1, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Max Muncy", team: "ATH", hrPct: 4.1, tb2Pct: 29.1, tier: "B", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 0.4, tb2Pct: 11.9, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
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
    impliedAwayPct: 43.83,
    impliedHomePct: 56.17,
    modelAwayPct: 58.22,
    modelHomePct: 41.78,
    edgeAwayPct: 14.39,
    edgeHomePct: -14.39,
    prediction: "DET",
    decisionTier: "A+",
    edgeOnPickPct: 14.39,
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
      { batter: "Kevin McGonigle", team: "DET", hrPct: 5.9, tb2Pct: 34.4, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.5, tb2Pct: 15.8, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Colt Keith", team: "DET", hrPct: 5.9, tb2Pct: 33.2, tier: "A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Riley Greene", team: "DET", hrPct: 6.9, tb2Pct: 36.3, tier: "A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 3.9, tb2Pct: 22.1, tier: "C", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Kerry Carpenter", team: "DET", hrPct: 13.4, tb2Pct: 39.2, tier: "A+", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 2.0, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Javier Báez", team: "DET", hrPct: 2.8, tb2Pct: 25.0, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jake Rogers", team: "DET", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 1.8, tb2Pct: 20.5, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Andruw Monasterio", team: "BOS", hrPct: 0.4, tb2Pct: 12.6, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 5.9, tb2Pct: 33.6, tier: "A", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.4, tb2Pct: 13.1, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 3.6, tb2Pct: 25.4, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 0.4, tb2Pct: 13.3, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Connor Wong", team: "BOS", hrPct: 1.6, tb2Pct: 27.5, tier: "B", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
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
    impliedAwayPct: 52.35,
    impliedHomePct: 47.65,
    modelAwayPct: 44.42,
    modelHomePct: 55.58,
    edgeAwayPct: -7.93,
    edgeHomePct: 7.93,
    prediction: "MIA",
    decisionTier: "A",
    edgeOnPickPct: 7.93,
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
      { batter: "William Contreras", team: "MIL", hrPct: 0.8, tb2Pct: 23.9, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Brice Turang", team: "MIL", hrPct: 4.6, tb2Pct: 29.7, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 8.7, tb2Pct: 37.3, tier: "A", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 5.8, tb2Pct: 29.5, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 4.7, tb2Pct: 32.5, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 1.2, tb2Pct: 25.2, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 0.4, tb2Pct: 13.3, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 2.8, tb2Pct: 23.7, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 7.1, tb2Pct: 39.3, tier: "A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Connor Norby", team: "MIA", hrPct: 1.9, tb2Pct: 21.4, tier: "C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 4.2, tb2Pct: 20.1, tier: "C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Heriberto Hernández", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Javier Sanoja", team: "MIA", hrPct: 0.4, tb2Pct: 8.8, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
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
    impliedAwayPct: 47.97,
    impliedHomePct: 52.03,
    modelAwayPct: 53.04,
    modelHomePct: 46.96,
    edgeAwayPct: 5.07,
    edgeHomePct: -5.07,
    prediction: "BAL",
    decisionTier: "A",
    edgeOnPickPct: 5.07,
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
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 8.2, tb2Pct: 30.4, tier: "B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.4, tb2Pct: 15.9, tier: "D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 2.6, tb2Pct: 20.3, tier: "C", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Colton Cowser", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 0.4, tb2Pct: 22.5, tier: "C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 3.9, tb2Pct: 15.9, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 9.3, tb2Pct: 36.3, tier: "A", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 5.4, tb2Pct: 26.4, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "José Ramírez", team: "CLE", hrPct: 4.5, tb2Pct: 29.3, tier: "B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 1.4, tb2Pct: 17.7, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "George Valera", team: "CLE", hrPct: 2.7, tb2Pct: 33.0, tier: "A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 2.4, tb2Pct: 17.2, tier: "D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 7.7, tb2Pct: 40.7, tier: "A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Bo Naylor", team: "CLE", hrPct: 0.4, tb2Pct: 9.2, tier: "D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.4, tb2Pct: 12.7, tier: "D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
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
      { batter: "JJ Wetherholt", team: "STL", hrPct: 3.7, tb2Pct: 20.7, tier: "C", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Iván Herrera", team: "STL", hrPct: 5.3, tb2Pct: 29.6, tier: "B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Alec Burleson", team: "STL", hrPct: 7.9, tb2Pct: 39.1, tier: "A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Jordan Walker", team: "STL", hrPct: 19.5, tb2Pct: 55.0, tier: "A+", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 2.0, tb2Pct: 11.1, tier: "D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Ramón Urías", team: "STL", hrPct: 6.3, tb2Pct: 31.1, tier: "B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Nathan Church", team: "STL", hrPct: 1.5, tb2Pct: 16.1, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "José Fermín", team: "STL", hrPct: 0.4, tb2Pct: 6.8, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Jose Altuve", team: "HOU", hrPct: 5.0, tb2Pct: 28.8, tier: "B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 19.1, tb2Pct: 55.0, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Carlos Correa", team: "HOU", hrPct: 4.9, tb2Pct: 28.5, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Christian Walker", team: "HOU", hrPct: 9.9, tb2Pct: 39.6, tier: "A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 2.9, tb2Pct: 22.5, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Cam Smith", team: "HOU", hrPct: 10.5, tb2Pct: 42.5, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Christian Vázquez", team: "HOU", hrPct: 13.5, tb2Pct: 55.0, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nick Allen", team: "HOU", hrPct: 1.3, tb2Pct: 12.5, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
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
    impliedAwayPct: 43.43,
    impliedHomePct: 56.57,
    modelAwayPct: 43.68,
    modelHomePct: 56.32,
    edgeAwayPct: 0.25,
    edgeHomePct: -0.25,
    prediction: "SEA",
    decisionTier: "D",
    edgeOnPickPct: -0.25,
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
      { batter: "Jake Burger", team: "TEX", hrPct: 4.6, tb2Pct: 25.8, tier: "C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.4, tb2Pct: 11.5, tier: "D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Josh Jung", team: "TEX", hrPct: 1.3, tb2Pct: 28.7, tier: "B", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Evan Carter", team: "TEX", hrPct: 0.9, tb2Pct: 14.0, tier: "D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ezequiel Duran", team: "TEX", hrPct: 0.4, tb2Pct: 14.0, tier: "D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Kyle Higashioka", team: "TEX", hrPct: 2.6, tb2Pct: 22.2, tier: "C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 1.5, tb2Pct: 13.8, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 1.5, tb2Pct: 19.5, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.4, tb2Pct: 6.7, tier: "D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.4, tb2Pct: 16.7, tier: "D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Luke Raley", team: "SEA", hrPct: 10.8, tb2Pct: 48.3, tier: "A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 5.3, tb2Pct: 24.8, tier: "C", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
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
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 4.4, tb2Pct: 30.3, tier: "B", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 6.3, tb2Pct: 35.6, tier: "A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.4, tb2Pct: 15.6, tier: "D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Matt Olson", team: "ATL", hrPct: 12.3, tb2Pct: 46.4, tier: "A+", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Austin Riley", team: "ATL", hrPct: 6.2, tb2Pct: 30.6, tier: "B", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 1.8, tb2Pct: 23.5, tier: "C", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Eli White", team: "ATL", hrPct: 0.4, tb2Pct: 11.2, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jonah Heim", team: "ATL", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jorge Mateo", team: "ATL", hrPct: 6.8, tb2Pct: 45.9, tier: "A+", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 16.4, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 13.2, tb2Pct: 41.0, tier: "A+", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 7.9, tb2Pct: 42.3, tier: "A+", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Adolis García", team: "PHI", hrPct: 3.1, tb2Pct: 19.1, tier: "D", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "J.T. Realmuto", team: "PHI", hrPct: 0.4, tb2Pct: 17.5, tier: "D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Felix Reyes", team: "PHI", hrPct: 1.9, tb2Pct: 15.2, tier: "D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Edmundo Sosa", team: "PHI", hrPct: 3.3, tb2Pct: 24.9, tier: "C", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 3.0, tb2Pct: 25.5, tier: "C", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
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
      { batter: "Hunter Goodman", team: "COL", hrPct: 10.7, tb2Pct: 37.1, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 4.2, tb2Pct: 26.5, tier: "B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Troy Johnston", team: "COL", hrPct: 4.8, tb2Pct: 26.3, tier: "B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 3.1, tb2Pct: 17.1, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Kyle Karros", team: "COL", hrPct: 2.5, tb2Pct: 14.7, tier: "D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jordan Beck", team: "COL", hrPct: 1.6, tb2Pct: 7.3, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
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
      { batter: "Ernie Clement", team: "TOR", hrPct: 1.2, tb2Pct: 20.2, tier: "C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 8.1, tb2Pct: 40.4, tier: "A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 8.4, tb2Pct: 38.9, tier: "A+", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
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
      { batter: "Alek Thomas", team: "AZ", hrPct: 6.5, tb2Pct: 21.4, tier: "C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
    ],
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
    impliedAwayPct: 51.58,
    impliedHomePct: 48.42,
    modelAwayPct: 53.20,
    modelHomePct: 46.80,
    edgeAwayPct: 1.62,
    edgeHomePct: -1.62,
    prediction: "SD",
    decisionTier: "C",
    edgeOnPickPct: 1.62,
    modelConfidence: "Low",
    analystConfidence: "Medium",
    flags: "away LU;away recent form;lineup_not_posted_api;rotowire_unconfirmed",
    rationale: "Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.",
    awayLuLabel: "Not Posted",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [],
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
    propsAway: [],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 7.8, tb2Pct: 32.3, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mike Trout", team: "LAA", hrPct: 17.8, tb2Pct: 55.0, tier: "A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 3.2, tb2Pct: 16.9, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jo Adell", team: "LAA", hrPct: 7.7, tb2Pct: 36.2, tier: "A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 5.2, tb2Pct: 21.2, tier: "C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 9.5, tb2Pct: 38.3, tier: "A+", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 3.8, tb2Pct: 16.4, tier: "D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 3.2, tb2Pct: 18.6, tier: "D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 7.8, tb2Pct: 42.2, tier: "A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
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
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary
2026-04-18,KC,NYY,1:35 PM,Noah Cameron,Will Warren,124,-139,8.0,-102,-118,62F / 9 mph wind / 0% precip / Open,62.4,8.8,0,0.285,0.381,0.412,0.470,Verified,,43.43,56.57,37.22,62.78,-6.20,6.20,NYY,A,6.20,High,,Medium,Yankee Stadium short porch vs contact-oriented Royals road lineup — price the chalk carefully; props and team totals often clearer than ML.
2026-04-18,CIN,MIN,2:10 PM,Andrew Abbott,Taj Bradley,108,-123,8.0,-105,-115,41F / 16 mph wind / 0% precip / Open,40.7,15.5,0,0.359,0.366,0.398,0.594,Verified,,46.57,53.43,34.84,65.16,-11.73,11.73,MIN,A+,11.73,High,,Medium,Target Field leans pitcher-friendly early season; lean on probables and bullpen paths before trusting a big ML edge.
2026-04-18,NYM,CHC,2:20 PM,Freddy Peralta,Jameson Taillon,108,-123,8.5,-105,-115,48F / 14 mph wind / 0% precip / Open,47.8,14.1,0,0.442,0.418,0.418,0.518,Verified,,46.57,53.43,54.76,45.24,8.19,-8.19,NYM,A+,8.19,High,,Low,Wrigley wind and cold can suppress HRs — tight market; verify probables and late lineup news.
2026-04-18,TB,PIT,3:30 PM,Drew Rasmussen,Paul Skenes,107,-122,7.5,-112,-108,83F / 16 mph wind / 3% precip / Open,83.1,15.6,3,0.343,0.363,0.481,0.534,Verified,,46.78,53.22,47.83,52.17,1.05,-1.05,PIT,D,-1.05,High,,Medium,Rays talent vs Pirates home spot — check opener/bulk roles; modest ML edge only if price is wrong.
2026-04-18,SF,WSH,4:05 PM,Adrian Houser,Cade Cavalli,-140,124,8.5,-102,-118,78F / 12 mph wind / 0% precip / Open,78.4,12.0,0,0.384,0.315,0.535,0.525,Verified,,56.65,43.35,53.67,46.33,-2.98,2.98,SF,D,-2.98,High,,Medium,Nationals Park — lean on starter shape and bullpen; avoid overpaying small favorites.
2026-04-18,CWS,ATH,4:05 PM,Erick Fedde,Luis Severino,132,-150,9.0,-115,-105,74F / 6 mph wind / 0% precip / Open,74.0,5.8,0,0.392,0.356,0.447,0.461,Verified,,41.81,58.19,65.70,34.30,23.90,-23.90,CWS,A+,23.90,High,,Low,Oakland environment and travel spot — volatility; prefer game props unless you have a clear pitching mismatch.
2026-04-18,DET,BOS,4:10 PM,Tarik Skubal,Brayan Bello,121,-138,7.0,-118,-102,48F / 10 mph wind / 1% precip / Open,48.4,10.0,1,0.429,0.443,0.469,0.467,Verified,,43.83,56.17,58.22,41.78,14.39,-14.39,DET,A+,14.39,High,,Medium,Fenway doubles and wall-ball noise — model park correctly before trusting a big ML number.
2026-04-18,MIL,MIA,4:10 PM,Brandon Woodruff,Sandy Alcantara,-118,103,8.0,-110,-110,84F / 9 mph wind / 0% precip / Retractable,83.6,8.6,0,0.370,0.408,0.469,0.459,Verified,,52.35,47.65,44.42,55.58,-7.93,7.93,MIA,A,7.93,High,,Medium,Miami run suppression helps pitching — lean Brewers only if the price matches your starter read.
2026-04-18,BAL,CLE,6:10 PM,Dean Kremer,Gavin Williams,102,-116,7.5,100,-120,50F / 13 mph wind / 30% precip / Open,50.0,13.3,30,0.400,0.341,0.472,0.524,Verified,,47.97,52.03,53.04,46.96,5.07,-5.07,BAL,A,5.07,High,,Low,Progressive Field — coin-flip pricing common; prioritize handedness and bullpen availability.
2026-04-18,STL,HOU,7:10 PM,Andre Pallante,Lance McCullers Jr.,120,-145,9.0,-110,-110,72F / 11 mph wind / 70% precip / Retractable,72.0,11.2,70,0.346,0.370,0.537,0.576,Verified,,43.44,56.56,43.32,56.68,-0.12,0.12,HOU,C,0.12,High,,Medium-High,Astros home talent vs Cardinals road — market often prices Houston heavy; PASS unless you see a real innings edge.
2026-04-18,TEX,SEA,7:15 PM,Nathan Eovaldi,George Kirby,122,-142,7.0,-105,-115,62F / 4 mph wind / 2% precip / Retractable,62.0,3.8,2,0.402,0.412,0.548,0.420,Verified,,43.43,56.57,43.68,56.32,0.25,-0.25,SEA,D,-0.25,High,,Medium,T-Mobile Park suppresses offense — pitching duel pricing; props and totals often cleaner.
2026-04-18,ATL,PHI,7:15 PM,Chris Sale,Cristopher Sánchez,102,-116,8.5,-102,-118,62F / 12 mph wind / 0% precip / Open,62.1,11.7,0,0.518,0.478,0.586,0.522,Verified,,47.97,52.03,43.26,56.74,-4.71,4.71,PHI,B,4.71,High,,Medium,NL East heavyweight pricing — small edges only; watch weather and late scratches.
2026-04-18,LAD,COL,8:10 PM,Emmet Sheehan,Ryan Feltner,-280,238,11.5,-108,-112,58F / 8 mph wind / 0% precip / Open,57.6,7.5,0,0.446,0.398,0.663,0.496,Verified,,71.35,28.65,56.36,43.64,-14.99,14.99,LAD,D,-14.99,High,,Medium,Coors elevates variance — Dodgers talent priced in; Rockies bats can still pop in chunks.
2026-04-18,TOR,AZ,8:10 PM,Max Scherzer,Zac Gallen,-108,-106,8.0,-112,-108,89F / 2 mph wind / 0% precip / Retractable,89.4,2.1,0,0.427,0.494,0.418,0.510,Verified,,50.23,49.77,47.04,52.96,-3.19,3.19,AZ,B,3.19,High,,Medium,Chase Field — check roof status and bullpen roles; lean Blue Jays only if price matches stuff edge.
2026-04-18,SD,LAA,9:38 PM,Germán Márquez,Yusei Kikuchi,-114,100,8.5,-115,-105,68F / 9 mph wind / 0% precip / Open,68.1,9.3,0,0.499,0.380,,0.616,Partial,lineup_not_posted_api|rotowire_unconfirmed,51.58,48.42,53.20,46.80,1.62,-1.62,SD,C,1.62,Low,away LU;away recent form;lineup_not_posted_api;rotowire_unconfirmed,Medium,Late west-coast spot — travel and bullpen usage matter; Padres often priced as the better roster.
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,data_confidence,market_data_status
2026-04-18,KC@NYY,KC,Maikel Garcia,Will Warren,2.71,24.28,+3593,+312,NA,,1.5,250,-4.29,0.524,5,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Bobby Witt Jr.,Will Warren,1.32,22.28,+7461,+349,NA,,1.5,150,-17.72,0.443,4,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Vinnie Pasquantino,Will Warren,0.40,9.41,+24900,+963,NA,,1.5,150,-30.59,0.387,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Jac Caglianone,Will Warren,1.60,20.83,+6142,+380,NA,,1.5,150,-19.17,0.416,5,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Carter Jensen,Will Warren,5.84,25.21,+1613,+297,NA,,1.5,150,-14.79,0.647,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Michael Massey,Will Warren,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.295,3,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Isaac Collins,Will Warren,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.305,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Lane Thomas,Will Warren,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.444,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,KC,Kyle Isbel,Will Warren,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.248,4,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Amed Rosario,Noah Cameron,9.47,38.68,+956,+159,NA,,1.5,450,20.50,0.672,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Aaron Judge,Noah Cameron,18.47,55.00,+441,-122,NA,,1.5,150,15.00,0.813,6,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Cody Bellinger,Noah Cameron,4.72,22.31,+2018,+348,NA,,1.5,550,6.92,0.412,6,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Giancarlo Stanton,Noah Cameron,5.23,21.21,+1811,+372,NA,,1.5,100,-28.79,0.356,3,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Ben Rice,Noah Cameron,17.93,55.00,+458,-122,NA,,1.5,450,36.82,0.851,2,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Randal Grichuk,Noah Cameron,0.40,6.00,+24900,+1567,NA,,1.5,250,-22.57,0.180,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,Jazz Chisholm Jr.,Noah Cameron,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.270,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,José Caballero,Noah Cameron,1.11,17.33,+8871,+477,NA,,1.5,200,-16.01,0.499,4,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,KC@NYY,NYY,J.C. Escarra,Noah Cameron,0.40,6.51,+24900,+1436,NA,,1.5,350,-15.71,0.180,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,TJ Friedl,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.248,48,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Will Benson,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.312,48,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Elly De La Cruz,Taj Bradley,9.26,40.01,+979,+150,NA,,1.5,150,0.01,0.705,48,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Sal Stewart,Taj Bradley,10.49,41.24,+853,+142,NA,,1.5,150,1.24,0.763,48,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Eugenio Suárez,Taj Bradley,0.40,12.93,+24900,+674,NA,,1.5,250,-15.65,0.487,48,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Nathaniel Lowe,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,250,-22.57,0.310,48,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Tyler Stephenson,Taj Bradley,3.18,17.36,+3043,+476,NA,,1.5,150,-22.64,0.399,48,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Rece Hinds,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.180,48,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,CIN,Ke'Bryan Hayes,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,100,-44.00,0.180,48,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Byron Buxton,Andrew Abbott,9.89,38.30,+911,+161,NA,,1.5,150,-1.70,0.668,37,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Austin Martin,Andrew Abbott,5.28,32.45,+1795,+208,NA,,1.5,150,-7.55,0.667,37,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Josh Bell,Andrew Abbott,8.25,35.33,+1112,+183,NA,,1.5,250,6.76,0.466,37,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Ryan Jeffers,Andrew Abbott,9.31,38.48,+974,+160,NA,,1.5,350,16.26,0.655,37,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Luke Keaschall,Andrew Abbott,2.03,15.68,+4820,+538,NA,,1.5,250,-12.89,0.376,37,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Trevor Larnach,Andrew Abbott,5.40,26.62,+1751,+276,NA,,1.5,100,-23.38,0.506,37,B,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Brooks Lee,Andrew Abbott,6.06,24.90,+1551,+302,NA,,1.5,150,-15.10,0.614,37,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Ryan Kreidler,Andrew Abbott,16.87,54.51,+493,-120,NA,,1.5,250,25.94,0.868,37,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CIN@MIN,MIN,Tristan Gray,Andrew Abbott,8.48,35.37,+1079,+183,NA,,1.5,150,-4.63,0.527,37,A,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
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
2026-04-18,TB@PIT,TB,Chandler Simpson,Paul Skenes,0.40,6.00,+24900,+1567,2900,-2.93,0.5,-108,-45.92,0.415,2,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Junior Caminero,Paul Skenes,1.75,19.28,+5604,+419,650,-11.58,1.5,114,-27.45,0.656,3,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Jonathan Aranda,Paul Skenes,0.65,15.55,+15379,+543,850,-9.88,0.5,128,-28.31,0.420,3,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Yandy Díaz,Paul Skenes,2.32,27.46,+4218,+264,1100,-6.02,0.5,117,-18.62,0.606,6,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Jake Fraley,Paul Skenes,0.40,6.00,+24900,+1567,1700,-5.16,1.5,143,-35.15,0.373,5,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Cedric Mullins,Paul Skenes,0.40,6.00,+24900,+1567,1050,-8.30,0.5,165,-31.74,0.370,2,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Richie Palacios,Paul Skenes,0.40,20.93,+24900,+378,2200,-3.95,1.5,180,-14.79,0.749,5,C,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,TB,Hunter Feduccia,Paul Skenes,0.40,6.00,+24900,+1567,NA,,1.5,50,-60.67,0.301,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,TB,Taylor Walls,Paul Skenes,0.40,6.75,+24900,+1381,2400,-3.60,0.5,160,-31.71,0.440,6,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TB@PIT,PIT,Oneil Cruz,Drew Rasmussen,10.42,44.19,+860,+126,NA,,0.5,112,-2.98,0.716,2,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Brandon Lowe,Drew Rasmussen,6.56,32.33,+1424,+209,NA,,0.5,125,-12.11,0.709,0,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Bryan Reynolds,Drew Rasmussen,2.75,27.04,+3539,+270,NA,,0.5,120,-18.42,0.588,5,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Ryan O'Hearn,Drew Rasmussen,5.26,32.32,+1802,+209,NA,,1.5,150,-7.68,0.518,5,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Marcell Ozuna,Drew Rasmussen,0.40,12.14,+24900,+724,NA,,1.5,100,-37.86,0.458,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Nick Yorke,Drew Rasmussen,0.40,14.82,+24900,+575,NA,,1.5,150,-25.18,0.441,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Spencer Horwitz,Drew Rasmussen,0.40,9.48,+24900,+955,NA,,0.5,117,-36.60,0.661,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Konnor Griffin,Drew Rasmussen,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.351,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TB@PIT,PIT,Henry Davis,Drew Rasmussen,0.40,6.00,+24900,+1567,NA,,1.5,50,-60.67,0.365,1,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,SF,Willy Adames,Cade Cavalli,6.09,31.82,+1542,+214,675,-6.81,1.5,210,-0.44,0.703,0,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Luis Arraez,Cade Cavalli,0.40,12.79,+24900,+682,2050,-4.25,2.5,-148,-46.89,0.470,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Matt Chapman,Cade Cavalli,1.14,20.79,+8638,+381,800,-9.97,1.5,250,-7.78,0.551,2,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Rafael Devers,Cade Cavalli,3.46,18.04,+2794,+454,775,-7.97,1.5,250,-10.53,0.364,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Casey Schmitt,Cade Cavalli,8.72,40.64,+1046,+146,800,-2.39,1.5,110,-6.98,0.803,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Jung Hoo Lee,Cade Cavalli,2.13,22.63,+4588,+342,1775,-3.20,1.5,-105,-28.59,0.555,0,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Heliot Ramos,Cade Cavalli,2.25,18.05,+4348,+454,1025,-6.64,2.5,120,-27.41,0.432,1,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Drew Gilbert,Cade Cavalli,10.05,35.88,+895,+179,1325,3.03,1.5,-118,-18.25,0.756,1,A,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,SF,Patrick Bailey,Cade Cavalli,0.40,6.00,+24900,+1567,1250,-7.01,1.5,240,-23.41,0.180,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,SF@WSH,WSH,James Wood,Adrian Houser,15.77,54.81,+534,-121,NA,,1.5,450,36.63,0.858,4,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Luis García Jr.,Adrian Houser,3.65,23.86,+2636,+319,NA,,1.5,-148,-35.82,0.431,6,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,José Tena,Adrian Houser,2.74,28.95,+3548,+245,NA,,1.5,-120,-25.60,0.578,0,B,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,CJ Abrams,Adrian Houser,13.26,51.71,+654,-107,NA,,1.5,200,18.38,0.950,3,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Jacob Young,Adrian Houser,4.71,27.96,+2022,+258,NA,,1.5,375,6.91,0.494,2,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Daylen Lile,Adrian Houser,2.35,21.81,+4147,+358,NA,,3.5,-125,-33.74,0.392,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Nasim Nuñez,Adrian Houser,0.40,6.00,+24900,+1567,NA,,1.5,375,-15.05,0.279,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Jorbit Vivas,Adrian Houser,0.40,6.00,+24900,+1567,NA,,1.5,450,-12.18,0.452,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SF@WSH,WSH,Drew Millas,Adrian Houser,0.40,6.00,+24900,+1567,NA,,1.5,260,-21.78,0.292,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Andrew Benintendi,Luis Severino,6.78,32.00,+1375,+213,NA,,1.5,450,13.82,0.441,40,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Munetaka Murakami,Luis Severino,13.54,42.99,+638,+133,900,3.54,1.5,450,24.81,0.551,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Miguel Vargas,Luis Severino,3.52,18.41,+2742,+443,1400,-3.15,0.5,185,-16.68,0.364,6,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Colson Montgomery,Luis Severino,4.58,20.07,+2082,+398,NA,,1.5,450,1.88,0.534,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,CWS,Everson Pereira,Luis Severino,14.31,48.13,+599,+108,900,4.31,2.5,146,7.48,0.950,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Sam Antonacci,Luis Severino,0.40,6.00,+24900,+1567,1950,-4.48,1.5,350,-16.22,0.205,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Chase Meidroth,Luis Severino,2.20,18.78,+4447,+432,1300,-4.94,1.5,375,-2.27,0.386,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Tristan Peters,Luis Severino,0.40,6.00,+24900,+1567,1500,-5.85,1.5,425,-13.05,0.180,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,CWS,Reese McGuire,Luis Severino,0.40,11.61,+24900,+761,1450,-6.05,1.5,156,-27.45,0.409,7,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,CWS@ATH,ATH,Jeff McNeil,Erick Fedde,0.40,17.06,+24900,+486,NA,,1.5,260,-10.72,0.559,24,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Shea Langeliers,Erick Fedde,6.42,33.90,+1458,+195,NA,,1.5,200,0.57,0.570,0,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Nick Kurtz,Erick Fedde,5.26,30.10,+1801,+232,NA,,1.5,275,3.43,0.579,0,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Tyler Soderstrom,Erick Fedde,2.22,20.53,+4409,+387,NA,,1.5,325,-3.00,0.515,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Jacob Wilson,Erick Fedde,0.40,7.70,+24900,+1199,NA,,1.5,550,-7.69,0.400,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Carlos Cortes,Erick Fedde,1.24,20.06,+7983,+398,NA,,1.5,450,1.88,0.546,0,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Max Muncy,Erick Fedde,4.15,29.11,+2311,+244,NA,,1.5,375,8.06,0.469,0,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Lawrence Butler,Erick Fedde,0.41,11.92,+24530,+739,NA,,1.5,450,-6.26,0.335,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,CWS@ATH,ATH,Austin Wynns,Erick Fedde,0.40,6.00,+24900,+1567,NA,,1.5,240,-23.41,0.180,1,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,DET,Kevin McGonigle,Brayan Bello,5.88,34.44,+1600,+190,2000,1.12,2.5,154,-4.93,0.574,0,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Gleyber Torres,Brayan Bello,0.47,15.84,+21153,+531,2000,-4.29,1.5,525,-0.16,0.453,25,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Colt Keith,Brayan Bello,5.89,33.16,+1599,+202,1400,-0.78,1.5,-1,32.17,0.438,3,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Riley Greene,Brayan Bello,6.93,36.29,+1342,+176,900,-3.07,1.5,260,8.51,0.522,9,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Spencer Torkelson,Brayan Bello,3.94,22.09,+2438,+353,1175,-3.90,1.5,350,-0.13,0.447,5,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Kerry Carpenter,Brayan Bello,13.42,39.15,+645,+155,NA,,1.5,450,20.97,0.732,7,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,DET,Wenceel Pérez,Brayan Bello,1.96,6.00,+5001,+1567,2450,-1.96,1.5,350,-16.22,0.264,4,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Javier Báez,Brayan Bello,2.84,25.03,+3427,+299,1600,-3.05,2.5,125,-19.41,0.608,7,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,DET,Jake Rogers,Brayan Bello,0.40,6.00,+24900,+1567,1200,-7.29,1.5,450,-12.18,0.180,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,DET@BOS,BOS,Roman Anthony,Tarik Skubal,1.83,20.49,+5374,+388,NA,,1.5,375,-0.56,0.432,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Andruw Monasterio,Tarik Skubal,0.40,12.55,+24900,+697,NA,,1.5,500,-4.11,0.504,5,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Willson Contreras,Tarik Skubal,5.94,33.57,+1584,+198,NA,,0.5,160,-4.89,0.735,6,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Trevor Story,Tarik Skubal,0.40,13.07,+24900,+665,NA,,0.5,116,-33.22,0.445,9,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Wilyer Abreu,Tarik Skubal,3.64,25.43,+2650,+293,NA,,1.5,350,3.21,0.418,1,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Ceddanne Rafaela,Tarik Skubal,0.40,13.31,+24900,+651,NA,,1.5,300,-11.69,0.486,6,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Caleb Durbin,Tarik Skubal,0.40,6.00,+24900,+1567,NA,,1.5,375,-15.05,0.352,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Connor Wong,Tarik Skubal,1.61,27.52,+6127,+263,NA,,1.5,400,7.52,0.455,5,B,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,DET@BOS,BOS,Isiah Kiner-Falefa,Tarik Skubal,0.40,6.00,+24900,+1567,NA,,1.5,375,-15.05,0.378,6,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIL,Sal Frelick,Sandy Alcantara,0.40,6.00,+24900,+1567,1425,-6.16,1.5,-120,-48.55,0.292,3,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,William Contreras,Sandy Alcantara,0.82,23.91,+12143,+318,1050,-7.88,0.5,-120,-30.64,0.594,9,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Brice Turang,Sandy Alcantara,4.59,29.74,+2076,+236,1400,-2.07,0.5,-105,-21.48,0.556,3,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Gary Sánchez,Sandy Alcantara,8.71,37.34,+1048,+168,825,-2.10,1.5,350,15.11,0.726,12,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Jake Bauers,Sandy Alcantara,5.79,29.54,+1627,+239,850,-4.74,0.5,145,-11.28,0.670,12,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Luis Rengifo,Sandy Alcantara,0.40,6.00,+24900,+1567,1400,-6.27,2.5,115,-40.51,0.296,6,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Garrett Mitchell,Sandy Alcantara,4.72,32.50,+2018,+208,1700,-0.83,1.5,475,15.11,0.622,5,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Brandon Lockridge,Sandy Alcantara,0.40,6.00,+24900,+1567,3000,-2.83,1.5,165,-31.74,0.288,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIL,Joey Ortiz,Sandy Alcantara,0.40,6.00,+24900,+1567,2500,-3.45,1.5,500,-10.67,0.180,2,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,MIL@MIA,MIA,Jakob Marsee,Brandon Woodruff,0.40,6.00,+24900,+1567,NA,,1.5,325,-17.53,0.302,2,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Xavier Edwards,Brandon Woodruff,1.19,25.25,+8326,+296,NA,,1.5,375,4.20,0.543,9,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Agustín Ramírez,Brandon Woodruff,0.40,13.32,+24900,+651,NA,,0.5,135,-29.23,0.501,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Liam Hicks,Brandon Woodruff,2.77,23.66,+3508,+323,NA,,2.5,140,-18.01,0.458,5,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Otto Lopez,Brandon Woodruff,7.08,39.31,+1313,+154,NA,,1.5,150,-0.69,0.755,7,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Connor Norby,Brandon Woodruff,1.90,21.41,+5172,+367,NA,,1.5,150,-18.59,0.672,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Owen Caissie,Brandon Woodruff,4.24,20.09,+2257,+398,NA,,1.5,300,-4.91,0.278,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Heriberto Hernández,Brandon Woodruff,0.40,6.00,+24900,+1567,NA,,1.5,50,-60.67,0.284,6,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,MIL@MIA,MIA,Javier Sanoja,Brandon Woodruff,0.40,8.80,+24900,+1036,NA,,1.5,100,-41.20,0.342,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,BAL,Gunnar Henderson,Gavin Williams,8.19,30.38,+1121,+229,575,-6.63,1.5,138,-11.64,0.568,6,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Taylor Ward,Gavin Williams,0.40,15.91,+24900,+528,815,-10.53,1.5,175,-20.45,0.491,5,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Pete Alonso,Gavin Williams,2.64,20.34,+3686,+392,482,-14.54,1.5,142,-20.99,0.456,4,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Dylan Beavers,Gavin Williams,0.40,6.00,+24900,+1567,965,-8.99,1.5,222,-25.06,0.281,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Colton Cowser,Gavin Williams,0.40,6.00,+24900,+1567,675,-12.50,1.5,220,-25.25,0.217,3,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Leody Taveras,Gavin Williams,0.40,22.54,+24900,+344,900,-9.60,1.5,192,-11.70,0.544,5,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Samuel Basallo,Gavin Williams,3.95,15.94,+2433,+528,650,-9.39,1.5,190,-18.55,0.440,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Coby Mayo,Gavin Williams,0.40,6.00,+24900,+1567,885,-9.75,1.5,234,-23.94,0.299,2,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,BAL,Jeremiah Jackson,Gavin Williams,9.31,36.29,+975,+176,830,-1.45,1.5,182,0.83,0.950,0,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,BAL@CLE,CLE,Steven Kwan,Dean Kremer,0.40,6.00,+24900,+1567,NA,,1.5,140,-35.67,0.469,11,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Chase DeLauter,Dean Kremer,5.39,26.43,+1756,+278,NA,,1.5,136,-15.94,0.380,0,B,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,José Ramírez,Dean Kremer,4.49,29.28,+2128,+241,NA,,1.5,130,-14.19,0.646,13,B,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Kyle Manzardo,Dean Kremer,1.39,17.75,+7116,+463,NA,,1.5,165,-19.99,0.542,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,George Valera,Dean Kremer,2.67,33.02,+3644,+203,NA,,1.5,180,-2.70,0.622,0,A,"Low — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Rhys Hoskins,Dean Kremer,2.43,17.18,+4020,+482,NA,,1.5,176,-19.06,0.451,6,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Daniel Schneemann,Dean Kremer,7.73,40.66,+1193,+146,NA,,1.5,236,10.89,0.875,2,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Bo Naylor,Dean Kremer,0.40,9.18,+24900,+989,NA,,1.5,220,-22.07,0.211,4,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,BAL@CLE,CLE,Brayan Rocchio,Dean Kremer,0.40,12.72,+24900,+686,NA,,1.5,234,-17.22,0.521,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,STL,JJ Wetherholt,Lance McCullers Jr.,3.72,20.74,+2587,+382,715,-8.55,1.5,142,-20.58,0.526,0,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Iván Herrera,Lance McCullers Jr.,5.33,29.63,+1776,+238,662,-7.79,1.5,140,-12.04,0.551,0,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Alec Burleson,Lance McCullers Jr.,7.92,39.06,+1162,+156,522,-8.16,1.5,119,-6.60,0.545,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Jordan Walker,Lance McCullers Jr.,19.51,55.00,+413,-122,442,1.06,1.5,130,11.52,0.950,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Nolan Gorman,Lance McCullers Jr.,2.05,11.07,+4783,+803,625,-11.74,1.5,201,-22.15,0.376,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Masyn Winn,Lance McCullers Jr.,0.40,6.00,+24900,+1567,1150,-7.60,1.5,182,-29.46,0.369,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Ramón Urías,Lance McCullers Jr.,6.33,31.07,+1480,+222,760,-5.30,1.5,175,-5.29,0.605,2,B,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,Nathan Church,Lance McCullers Jr.,1.52,16.12,+6481,+520,1175,-6.32,1.5,196,-17.66,0.547,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,STL,José Fermín,Lance McCullers Jr.,0.40,6.81,+24900,+1369,1100,-7.93,1.5,230,-23.50,0.364,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,STL@HOU,HOU,Jose Altuve,Andre Pallante,5.03,28.75,+1887,+248,NA,,1.5,111,-18.64,0.527,4,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Yordan Alvarez,Andre Pallante,19.11,55.00,+423,-122,NA,,1.5,-106,3.54,0.865,2,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Carlos Correa,Andre Pallante,4.88,28.48,+1948,+251,NA,,1.5,114,-18.25,0.448,3,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Christian Walker,Andre Pallante,9.95,39.64,+905,+152,NA,,1.5,122,-5.40,0.717,4,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Isaac Paredes,Andre Pallante,0.40,6.00,+24900,+1567,NA,,1.5,165,-31.74,0.282,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Taylor Trammell,Andre Pallante,2.90,22.54,+3349,+344,NA,,1.5,185,-12.55,0.457,0,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Cam Smith,Andre Pallante,10.47,42.51,+855,+135,NA,,1.5,146,1.86,0.620,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Christian Vázquez,Andre Pallante,13.50,55.00,+641,-122,NA,,1.5,202,21.89,0.950,2,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,STL@HOU,HOU,Nick Allen,Andre Pallante,1.27,12.52,+7747,+699,NA,,1.5,221,-18.63,0.315,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,TEX,Brandon Nimmo,George Kirby,3.73,26.18,+2583,+282,675,-9.18,1.5,141,-15.32,0.624,11,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Corey Seager,George Kirby,4.37,23.47,+2187,+326,400,-15.63,1.5,121,-21.78,0.512,20,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Wyatt Langford,George Kirby,0.40,8.58,+24900,+1065,645,-13.02,1.5,142,-32.74,0.439,14,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Jake Burger,George Kirby,4.57,25.84,+2090,+287,522,-11.51,1.5,138,-16.18,0.571,6,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Joc Pederson,George Kirby,0.40,11.47,+24900,+772,582,-14.26,1.5,224,-19.40,0.558,8,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Josh Jung,George Kirby,1.26,28.72,+7830,+248,920,-8.54,1.5,169,-8.46,0.783,8,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Evan Carter,George Kirby,0.88,13.99,+11327,+615,1020,-8.05,1.5,214,-17.86,0.448,7,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Ezequiel Duran,George Kirby,0.40,14.00,+24900,+615,1020,-8.53,1.5,220,-17.25,0.366,16,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,TEX,Kyle Higashioka,George Kirby,2.56,22.18,+3801,+351,575,-12.25,1.5,217,-9.37,0.632,10,C,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TEX@SEA,SEA,J.P. Crawford,Nathan Eovaldi,0.40,6.00,+24900,+1567,NA,,1.5,176,-30.23,0.342,22,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Cal Raleigh,Nathan Eovaldi,1.52,13.77,+6482,+626,NA,,1.5,125,-30.68,0.423,21,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Julio Rodríguez,Nathan Eovaldi,1.54,19.46,+6383,+414,NA,,1.5,136,-22.91,0.496,21,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Josh Naylor,Nathan Eovaldi,0.40,6.68,+24900,+1396,NA,,1.5,138,-35.33,0.412,11,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Randy Arozarena,Nathan Eovaldi,0.40,16.66,+24900,+500,NA,,1.5,188,-18.06,0.497,31,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Luke Raley,Nathan Eovaldi,10.82,48.30,+824,+107,NA,,1.5,195,14.40,0.657,15,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Dominic Canzone,Nathan Eovaldi,5.27,24.84,+1796,+303,NA,,1.5,179,-11.00,0.281,6,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Cole Young,Nathan Eovaldi,0.40,8.28,+24900,+1108,NA,,1.5,238,-21.31,0.355,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TEX@SEA,SEA,Leo Rivas,Nathan Eovaldi,0.40,6.00,+24900,+1567,NA,,1.5,315,-18.10,0.317,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,ATL,Ronald Acuña Jr.,Cristopher Sánchez,4.43,30.32,+2160,+230,650,-8.91,1.5,140,-11.35,0.569,9,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Drake Baldwin,Cristopher Sánchez,6.29,35.59,+1491,+181,755,-5.41,1.5,151,-4.25,0.655,3,A,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Ozzie Albies,Cristopher Sánchez,0.40,15.61,+24900,+541,750,-11.36,1.5,124,-29.03,0.456,13,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Matt Olson,Cristopher Sánchez,12.31,46.44,+712,+115,526,-3.66,1.5,160,7.98,0.747,18,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Austin Riley,Cristopher Sánchez,6.17,30.63,+1520,+226,615,-7.81,1.5,140,-11.04,0.644,10,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Mauricio Dubón,Cristopher Sánchez,1.80,23.47,+5448,+326,1370,-5.00,1.5,170,-13.57,0.574,2,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Eli White,Cristopher Sánchez,0.40,11.24,+24900,+790,980,-8.86,1.5,193,-22.89,0.519,3,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Jonah Heim,Cristopher Sánchez,0.40,6.00,+24900,+1567,1100,-7.93,1.5,225,-24.77,0.379,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,ATL,Jorge Mateo,Cristopher Sánchez,6.82,45.89,+1366,+118,1100,-1.51,1.5,260,18.11,0.737,2,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,ATL@PHI,PHI,Trea Turner,Chris Sale,0.40,16.36,+24900,+511,NA,,1.5,120,-29.10,0.541,15,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Kyle Schwarber,Chris Sale,13.21,40.97,+657,+144,NA,,1.5,176,4.73,0.623,15,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Bryce Harper,Chris Sale,7.93,42.32,+1161,+136,NA,,1.5,152,2.64,0.785,9,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Adolis García,Chris Sale,3.14,19.14,+3088,+422,NA,,1.5,162,-19.03,0.391,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,J.T. Realmuto,Chris Sale,0.40,17.51,+24900,+471,NA,,1.5,165,-20.23,0.486,13,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Alec Bohm,Chris Sale,0.40,6.00,+24900,+1567,NA,,1.5,148,-34.32,0.180,14,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Felix Reyes,Chris Sale,1.91,15.23,+5139,+557,NA,,,,,,0,D,"Low — stats+savant+recent+BvP, confirmed lineup, no live markets",none
2026-04-18,ATL@PHI,PHI,Edmundo Sosa,Chris Sale,3.35,24.88,+2886,+302,NA,,1.5,206,-7.80,0.761,12,C,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,ATL@PHI,PHI,Brandon Marsh,Chris Sale,2.95,25.53,+3289,+292,NA,,1.5,280,-0.78,0.490,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,LAD,Shohei Ohtani,Ryan Feltner,18.85,55.00,+430,-122,208,-13.61,1.5,-155,-5.78,0.764,8,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Kyle Tucker,Ryan Feltner,8.42,28.92,+1088,+246,460,-9.44,1.5,-120,-25.62,0.446,0,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Andy Pages,Ryan Feltner,16.92,55.00,+491,-122,522,0.85,1.5,-146,-4.35,0.815,7,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Freddie Freeman,Ryan Feltner,15.96,55.00,+527,-122,416,-3.42,1.5,-145,-4.18,0.607,16,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Teoscar Hernández,Ryan Feltner,15.63,50.66,+540,-103,390,-4.77,1.5,-125,-4.89,0.791,8,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Max Muncy,Ryan Feltner,20.39,55.00,+390,-122,375,-0.66,1.5,102,5.50,0.792,14,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Dalton Rushing,Ryan Feltner,25.00,55.00,+300,-122,310,0.61,1.5,102,5.50,0.950,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Alex Freeland,Ryan Feltner,8.54,27.36,+1070,+266,840,-2.09,1.5,149,-12.80,0.278,0,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,LAD,Miguel Rojas,Ryan Feltner,8.02,37.92,+1147,+164,890,-2.08,1.5,130,-5.55,0.520,5,A,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,LAD@COL,COL,Edouard Julien,Emmet Sheehan,5.71,28.75,+1653,+248,NA,,1.5,184,-6.46,0.481,0,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Mickey Moniak,Emmet Sheehan,12.77,41.61,+683,+140,NA,,1.5,117,-4.47,0.838,6,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,TJ Rumfield,Emmet Sheehan,4.42,22.73,+2164,+340,NA,,1.5,128,-21.13,0.365,0,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Hunter Goodman,Emmet Sheehan,10.66,37.14,+838,+169,NA,,1.5,129,-6.53,0.784,6,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Ezequiel Tovar,Emmet Sheehan,4.21,26.45,+2275,+278,NA,,1.5,134,-16.28,0.370,12,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Troy Johnston,Emmet Sheehan,4.75,26.34,+2004,+280,NA,,1.5,181,-9.25,0.499,0,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Brenton Doyle,Emmet Sheehan,3.06,17.15,+3164,+483,NA,,1.5,166,-20.45,0.464,8,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Kyle Karros,Emmet Sheehan,2.52,14.75,+3873,+578,NA,,1.5,195,-19.15,0.316,5,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,LAD@COL,COL,Jordan Beck,Emmet Sheehan,1.61,7.30,+6119,+1271,NA,,1.5,189,-27.31,0.347,3,D,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,TOR,Nathan Lukes,Zac Gallen,0.40,6.00,+24900,+1567,800,-10.71,1.5,110,-41.62,0.180,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Ernie Clement,Zac Gallen,1.15,20.22,+8582,+395,1000,-7.94,1.5,115,-26.29,0.406,2,C,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Vladimir Guerrero Jr.,Zac Gallen,8.10,40.44,+1135,+147,485,-9.00,1.5,-104,-10.54,0.612,5,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Jesús Sánchez,Zac Gallen,8.38,38.86,+1093,+157,700,-4.12,1.5,107,-9.45,0.482,9,A+,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Eloy Jiménez,Zac Gallen,0.81,11.31,+12303,+784,760,-10.82,1.5,135,-31.24,0.345,0,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Andrés Giménez,Zac Gallen,5.68,30.82,+1660,+224,910,-4.22,1.5,150,-9.18,0.478,9,B,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Kazuma Okamoto,Zac Gallen,3.16,14.82,+3068,+575,638,-10.39,1.5,162,-23.34,0.221,0,D,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Myles Straw,Zac Gallen,9.96,45.30,+904,+121,1370,3.15,1.5,176,9.07,0.716,5,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,TOR,Tyler Heineman,Zac Gallen,1.89,15.44,+5204,+548,1250,-5.52,1.5,231,-14.77,0.324,2,D,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-18,TOR@AZ,AZ,Ketel Marte,Max Scherzer,13.91,45.61,+619,+119,NA,,1.5,-114,-7.66,0.631,9,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Corbin Carroll,Max Scherzer,15.31,55.00,+553,-122,NA,,1.5,-112,2.17,0.643,3,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Geraldo Perdomo,Max Scherzer,4.20,13.73,+2280,+628,NA,,1.5,129,-29.94,0.294,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Lourdes Gurriel Jr.,Max Scherzer,10.37,30.03,+865,+233,NA,,1.5,115,-16.48,,8,A,"Low — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Adrian Del Castillo,Max Scherzer,13.81,51.98,+624,-108,NA,,1.5,135,9.43,0.696,0,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Jose Fernandez,Max Scherzer,9.16,34.23,+992,+192,NA,,1.5,144,-6.75,0.410,0,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Nolan Arenado,Max Scherzer,7.89,27.87,+1167,+259,NA,,1.5,130,-15.61,0.613,17,B,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Ildemaro Vargas,Max Scherzer,12.03,48.90,+731,+104,NA,,1.5,170,11.86,0.662,6,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,TOR@AZ,AZ,Alek Thomas,Max Scherzer,6.53,21.36,+1432,+368,NA,,1.5,152,-18.32,0.196,2,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Zach Neto,Germán Márquez,7.84,32.34,+1175,+209,NA,,1.5,100,-17.66,0.629,0,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Mike Trout,Germán Márquez,17.77,55.00,+463,-122,NA,,1.5,-114,1.73,0.784,6,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Nolan Schanuel,Germán Márquez,3.15,16.86,+3070,+493,NA,,1.5,144,-24.13,0.323,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Jo Adell,Germán Márquez,7.67,36.22,+1204,+176,NA,,1.5,110,-11.40,0.687,3,A,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Yoán Moncada,Germán Márquez,5.19,21.17,+1826,+372,NA,,1.5,152,-18.51,0.588,6,C,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Oswald Peraza,Germán Márquez,9.49,38.32,+954,+161,NA,,1.5,158,-0.44,0.786,0,A+,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Josh Lowe,Germán Márquez,3.84,16.40,+2506,+510,NA,,1.5,165,-21.33,0.561,0,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Logan O'Hoppe,Germán Márquez,3.24,18.59,+2982,+438,NA,,1.5,147,-21.90,0.449,3,D,"High — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
2026-04-18,SD@LAA,LAA,Adam Frazier,Germán Márquez,7.80,42.20,+1182,+137,NA,,1.5,222,11.14,0.738,23,A+,"Medium — stats+savant+recent+BvP, confirmed lineup, limited live markets",partial
<!-- batter-outlooks-csv:end -->
*/

