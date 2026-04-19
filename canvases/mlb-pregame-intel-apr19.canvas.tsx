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
    gameKey: "SF@WSH",
    venue: "Nationals Park",
    away: "SF",
    home: "WSH",
    timeEt: "1:35 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 8th — SF 0, WSH 3",
    awayScore: 0,
    homeScore: 3,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -135,
    homeAmerican: 112,
    impliedAwayPct: 13.08,
    impliedHomePct: 86.92,
    modelAwayPct: 55.59,
    modelHomePct: 44.41,
    edgeAwayPct: 42.51,
    edgeHomePct: -42.51,
    prediction: "SF",
    decisionTier: "A+",
    edgeOnPickPct: 42.51,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "starter_mismatch_rotowire",
    rationale: "Robbie Ray gives the Giants the cleaner starting edge, but Nationals Park can flatten a modest road-favorite number if the Washington lineup posts a full contact-heavy order.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Willy Adames", "SS"],
      ["2", "Luis Arraez", "2B"],
      ["3", "Matt Chapman", "3B"],
      ["4", "Rafael Devers", "DH"],
      ["5", "Casey Schmitt", "1B"],
      ["6", "Jung Hoo Lee", "RF"],
      ["7", "Heliot Ramos", "LF"],
      ["8", "Drew Gilbert", "CF"],
      ["9", "Patrick Bailey", "C"],
    ],
    homeLineup: [
      ["1", "James Wood", "LF"],
      ["2", "Curtis Mead", "1B"],
      ["3", "Brady House", "3B"],
      ["4", "CJ Abrams", "SS"],
      ["5", "Jacob Young", "CF"],
      ["6", "Joey Wiemer", "RF"],
      ["7", "Luis García Jr.", "DH"],
      ["8", "Nasim Nuñez", "2B"],
      ["9", "Keibert Ruiz", "C"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Nationals Park. Weather/run environment from inputs: 66F / mild breeze / Medium."],
    propsAway: [
      { batter: "Willy Adames", team: "SF", hrPct: 7.8, tb2Pct: 35.2, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; priced lean: 2+ TB (A)" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 18.5, tier: "HR D / TB D", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Matt Chapman", team: "SF", hrPct: 3.2, tb2Pct: 25.5, tier: "HR D / TB C", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Rafael Devers", team: "SF", hrPct: 4.5, tb2Pct: 21.1, tier: "HR D / TB C", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 9.9, tb2Pct: 42.5, tier: "HR B / TB A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 3.0, tb2Pct: 24.4, tier: "HR D / TB C", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 8.3, tb2Pct: 35.0, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 9.0, tb2Pct: 38.2, tier: "HR B / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.5, tb2Pct: 8.7, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 16.0, tb2Pct: 54.9, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Curtis Mead", team: "WSH", hrPct: 3.4, tb2Pct: 20.8, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brady House", team: "WSH", hrPct: 1.5, tb2Pct: 15.2, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 10.2, tb2Pct: 45.8, tier: "HR A / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jacob Young", team: "WSH", hrPct: 3.8, tb2Pct: 25.4, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Joey Wiemer", team: "WSH", hrPct: 2.8, tb2Pct: 16.1, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 1.9, tb2Pct: 14.7, tier: "HR D / TB D", note: "LHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Keibert Ruiz", team: "WSH", hrPct: 0.7, tb2Pct: 10.4, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 3.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "TB@PIT",
    venue: "PNC Park",
    away: "TB",
    home: "PIT",
    timeEt: "1:35 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 8th — TB 2, PIT 5",
    awayScore: 2,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 100,
    homeAmerican: -133,
    impliedAwayPct: 5.31,
    impliedHomePct: 94.69,
    modelAwayPct: 44.07,
    modelHomePct: 55.93,
    edgeAwayPct: 38.76,
    edgeHomePct: -38.76,
    prediction: "PIT",
    decisionTier: "D",
    edgeOnPickPct: -38.76,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "McClanahan vs Keller sets up as a run-suppressed duel at PNC; pricing is driven more by home field and bullpen path than by a huge early-offense expectation.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Chandler Simpson", "LF"],
      ["2", "Junior Caminero", "3B"],
      ["3", "Jonathan Aranda", "1B"],
      ["4", "Yandy Díaz", "DH"],
      ["5", "Cedric Mullins", "CF"],
      ["6", "Richie Palacios", "2B"],
      ["7", "Jonny DeLuca", "RF"],
      ["8", "Hunter Feduccia", "C"],
      ["9", "Taylor Walls", "SS"],
    ],
    homeLineup: [
      ["1", "Jake Mangum", "LF"],
      ["2", "Nick Gonzales", "2B"],
      ["3", "Bryan Reynolds", "RF"],
      ["4", "Marcell Ozuna", "DH"],
      ["5", "Oneil Cruz", "CF"],
      ["6", "Nick Yorke", "3B"],
      ["7", "Konnor Griffin", "SS"],
      ["8", "Joey Bart", "C"],
      ["9", "Billy Cook", "1B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: PNC Park. Weather/run environment from inputs: 61F / light wind / Low-Medium."],
    propsAway: [
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Junior Caminero", team: "TB", hrPct: 4.6, tb2Pct: 25.6, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 3.6, tb2Pct: 22.3, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 2.5, tb2Pct: 24.8, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.4, tb2Pct: 9.6, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Richie Palacios", team: "TB", hrPct: 3.4, tb2Pct: 27.4, tier: "HR D / TB B", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Jonny DeLuca", team: "TB", hrPct: 4.6, tb2Pct: 29.1, tier: "HR D / TB B", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Hunter Feduccia", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Jake Mangum", team: "PIT", hrPct: 0.4, tb2Pct: 14.2, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.4, tb2Pct: 8.6, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 5.2, tb2Pct: 27.3, tier: "HR D / TB B", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 3.8, tb2Pct: 21.7, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Oneil Cruz", team: "PIT", hrPct: 12.8, tb2Pct: 47.5, tier: "HR A / TB A+", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 1.1, tb2Pct: 16.6, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 11.1, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Joey Bart", team: "PIT", hrPct: 1.9, tb2Pct: 9.6, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Billy Cook", team: "PIT", hrPct: 1.5, tb2Pct: 21.5, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "KC@NYY",
    venue: "Yankee Stadium",
    away: "KC",
    home: "NYY",
    timeEt: "1:35 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Delayed Start",
    gameStatusNote: "Delayed Start",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 131,
    homeAmerican: -150,
    impliedAwayPct: 41.98,
    impliedHomePct: 58.02,
    modelAwayPct: 43.61,
    modelHomePct: 56.39,
    edgeAwayPct: 1.64,
    edgeHomePct: -1.64,
    prediction: "NYY",
    decisionTier: "D",
    edgeOnPickPct: -1.64,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Ragans keeps Kansas City live, but Yankee Stadium still punishes mistakes and the market leans to New York's lineup ceiling over the full nine.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Maikel Garcia", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Vinnie Pasquantino", "1B"],
      ["4", "Salvador Perez", "DH"],
      ["5", "Lane Thomas", "CF"],
      ["6", "Starling Marte", "RF"],
      ["7", "Isaac Collins", "LF"],
      ["8", "Michael Massey", "2B"],
      ["9", "Elias Díaz", "C"],
    ],
    homeLineup: [
      ["1", "Ben Rice", "DH"],
      ["2", "Aaron Judge", "RF"],
      ["3", "Cody Bellinger", "LF"],
      ["4", "Paul Goldschmidt", "1B"],
      ["5", "Trent Grisham", "CF"],
      ["6", "Amed Rosario", "2B"],
      ["7", "Austin Wells", "C"],
      ["8", "José Caballero", "SS"],
      ["9", "Ryan McMahon", "3B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Yankee Stadium. Weather/run environment from inputs: 65F / clear / Medium-High."],
    propsAway: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 6.9, tb2Pct: 31.6, tier: "HR C / TB B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 6.0, tb2Pct: 33.2, tier: "HR C / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 3.4, tb2Pct: 16.4, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Salvador Perez", team: "KC", hrPct: 4.1, tb2Pct: 14.3, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Starling Marte", team: "KC", hrPct: 1.7, tb2Pct: 14.2, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Isaac Collins", team: "KC", hrPct: 1.5, tb2Pct: 6.5, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Michael Massey", team: "KC", hrPct: 1.5, tb2Pct: 14.3, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Elias Díaz", team: "KC", hrPct: 5.3, tb2Pct: 22.3, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Ben Rice", team: "NYY", hrPct: 18.1, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 15.6, tb2Pct: 51.0, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 4.8, tb2Pct: 27.5, tier: "HR D / TB B", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Paul Goldschmidt", team: "NYY", hrPct: 4.5, tb2Pct: 21.9, tier: "HR D / TB C", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Trent Grisham", team: "NYY", hrPct: 4.7, tb2Pct: 19.8, tier: "HR D / TB D", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Amed Rosario", team: "NYY", hrPct: 11.5, tb2Pct: 44.7, tier: "HR A / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Austin Wells", team: "NYY", hrPct: 3.3, tb2Pct: 19.4, tier: "HR D / TB D", note: "LHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "José Caballero", team: "NYY", hrPct: 0.5, tb2Pct: 15.6, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Ryan McMahon", team: "NYY", hrPct: 3.3, tb2Pct: 14.6, tier: "HR D / TB D", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "BAL@CLE",
    venue: "Progressive Field",
    away: "BAL",
    home: "CLE",
    timeEt: "1:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 7th — BAL 4, CLE 6",
    awayScore: 4,
    homeScore: 6,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 104,
    homeAmerican: -115,
    impliedAwayPct: 9.46,
    impliedHomePct: 90.54,
    modelAwayPct: 59.38,
    modelHomePct: 40.62,
    edgeAwayPct: 49.92,
    edgeHomePct: -49.92,
    prediction: "BAL",
    decisionTier: "A+",
    edgeOnPickPct: 49.92,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "",
    rationale: "Guardians get a light home lean in a contact-oriented matchup; this profiles more like a bullpen and sequencing game than a dominant starter mismatch.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Taylor Ward", "LF"],
      ["2", "Gunnar Henderson", "SS"],
      ["3", "Pete Alonso", "1B"],
      ["4", "Johnathan Rodríguez", "RF"],
      ["5", "Jeremiah Jackson", "2B"],
      ["6", "Weston Wilson", "3B"],
      ["7", "Coby Mayo", "DH"],
      ["8", "Sam Huff", "C"],
      ["9", "Blaze Alexander", "CF"],
    ],
    homeLineup: [
      ["1", "Steven Kwan", "CF"],
      ["2", "Angel Martínez", "LF"],
      ["3", "José Ramírez", "DH"],
      ["4", "Rhys Hoskins", "1B"],
      ["5", "David Fry", "RF"],
      ["6", "Daniel Schneemann", "3B"],
      ["7", "Juan Brito", "2B"],
      ["8", "Austin Hedges", "C"],
      ["9", "Brayan Rocchio", "SS"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Progressive Field. Weather/run environment from inputs: 57F / cool / Medium."],
    propsAway: [
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.4, tb2Pct: 18.9, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 5.8, tb2Pct: 25.3, tier: "HR C / TB C", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 1.7, tb2Pct: 18.2, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; vs tough pitcher" },
      { batter: "Johnathan Rodríguez", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 7.4, tb2Pct: 32.5, tier: "HR C / TB A", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Weston Wilson", team: "BAL", hrPct: 4.1, tb2Pct: 40.2, tier: "HR D / TB A+", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Sam Huff", team: "BAL", hrPct: 0.4, tb2Pct: 14.6, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Blaze Alexander", team: "BAL", hrPct: 0.4, tb2Pct: 8.5, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Angel Martínez", team: "CLE", hrPct: 0.9, tb2Pct: 20.5, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "José Ramírez", team: "CLE", hrPct: 3.7, tb2Pct: 26.5, tier: "HR D / TB B", note: "RHB vs LHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (B)" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 0.9, tb2Pct: 12.0, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "David Fry", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 4.3, tb2Pct: 32.9, tier: "HR D / TB A", note: "LHB vs LHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A)" },
      { batter: "Juan Brito", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Austin Hedges", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.4, tb2Pct: 12.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 2.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "MIL@MIA",
    venue: "loanDepot park",
    away: "MIL",
    home: "MIA",
    timeEt: "1:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 7th — MIL 1, MIA 5",
    awayScore: 1,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 104,
    homeAmerican: -140,
    impliedAwayPct: 7.29,
    impliedHomePct: 92.71,
    modelAwayPct: 64.94,
    modelHomePct: 35.06,
    edgeAwayPct: 57.65,
    edgeHomePct: -57.65,
    prediction: "MIL",
    decisionTier: "A+",
    edgeOnPickPct: 57.65,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Misiorowski and Eury Perez bring big raw stuff, so Miami's edge is more about home run prevention and run environment than a market-wide offensive gap.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Garrett Mitchell", "DH"],
      ["2", "Brice Turang", "2B"],
      ["3", "Gary Sánchez", "C"],
      ["4", "Jake Bauers", "1B"],
      ["5", "Luis Rengifo", "3B"],
      ["6", "Brandon Lockridge", "CF"],
      ["7", "Greg Jones", "LF"],
      ["8", "Luis Matos", "RF"],
      ["9", "David Hamilton", "SS"],
    ],
    homeLineup: [
      ["1", "Jakob Marsee", "CF"],
      ["2", "Xavier Edwards", "2B"],
      ["3", "Otto Lopez", "SS"],
      ["4", "Kyle Stowers", "LF"],
      ["5", "Agustín Ramírez", "DH"],
      ["6", "Liam Hicks", "C"],
      ["7", "Connor Norby", "1B"],
      ["8", "Owen Caissie", "RF"],
      ["9", "Graham Pauley", "3B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: loanDepot park. Weather/run environment from inputs: retractable roof / humid / Low-Medium."],
    propsAway: [
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 8.4, tb2Pct: 32.7, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brice Turang", team: "MIL", hrPct: 12.9, tb2Pct: 49.1, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 14.0, tb2Pct: 47.3, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; priced lean: HR (A+)" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 12.7, tb2Pct: 44.9, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; priced lean: HR (A)" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 1.2, tb2Pct: 11.5, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.4, tb2Pct: 7.5, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Greg Jones", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Luis Matos", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "David Hamilton", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 0.4, tb2Pct: 21.7, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 6.3, tb2Pct: 37.7, tier: "HR C / TB A", note: "RHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A)" },
      { batter: "Kyle Stowers", team: "MIA", hrPct: 7.7, tb2Pct: 51.6, tier: "HR C / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 0.4, tb2Pct: 9.1, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 1.6, tb2Pct: 20.5, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Connor Norby", team: "MIA", hrPct: 1.3, tb2Pct: 21.2, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 3.3, tb2Pct: 19.2, tier: "HR D / TB D", note: "LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Graham Pauley", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "STL@HOU",
    venue: "Daikin Park",
    away: "STL",
    home: "HOU",
    timeEt: "2:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 6th — STL 4, HOU 1",
    awayScore: 4,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -140,
    impliedAwayPct: 43.80,
    impliedHomePct: 56.20,
    modelAwayPct: 43.13,
    modelHomePct: 56.87,
    edgeAwayPct: -0.66,
    edgeHomePct: 0.66,
    prediction: "HOU",
    decisionTier: "C",
    edgeOnPickPct: 0.66,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch",
    rationale: "Houston is priced as the steadier home side, but neither starter carries a massive separator, so this stays in the range where late lineup quality and bullpen leverage matter.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "JJ Wetherholt", "2B"],
      ["2", "Iván Herrera", "DH"],
      ["3", "Alec Burleson", "1B"],
      ["4", "Jordan Walker", "RF"],
      ["5", "Nolan Gorman", "3B"],
      ["6", "Masyn Winn", "SS"],
      ["7", "Nathan Church", "LF"],
      ["8", "Pedro Pagés", "C"],
      ["9", "Victor Scott II", "CF"],
    ],
    homeLineup: [
      ["1", "Carlos Correa", "SS"],
      ["2", "Yordan Alvarez", "DH"],
      ["3", "Jose Altuve", "2B"],
      ["4", "Christian Walker", "1B"],
      ["5", "Isaac Paredes", "3B"],
      ["6", "Cam Smith", "RF"],
      ["7", "Yainer Diaz", "C"],
      ["8", "Shay Whitcomb", "LF"],
      ["9", "Taylor Trammell", "CF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Daikin Park. Weather/run environment from inputs: retractable roof / warm / Medium."],
    propsAway: [
      { batter: "JJ Wetherholt", team: "STL", hrPct: 2.8, tb2Pct: 18.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Iván Herrera", team: "STL", hrPct: 3.9, tb2Pct: 23.7, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Alec Burleson", team: "STL", hrPct: 9.0, tb2Pct: 42.0, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jordan Walker", team: "STL", hrPct: 16.8, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 1.6, tb2Pct: 12.9, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.4, tb2Pct: 10.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Nathan Church", team: "STL", hrPct: 0.6, tb2Pct: 14.2, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Pedro Pagés", team: "STL", hrPct: 0.7, tb2Pct: 14.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Victor Scott II", team: "STL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Carlos Correa", team: "HOU", hrPct: 5.4, tb2Pct: 30.2, tier: "HR D / TB B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; priced lean: 2+ TB (B)" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 20.3, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jose Altuve", team: "HOU", hrPct: 4.9, tb2Pct: 27.1, tier: "HR D / TB B", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; priced lean: 2+ TB (B)" },
      { batter: "Christian Walker", team: "HOU", hrPct: 8.8, tb2Pct: 34.2, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; priced lean: 2+ TB (A)" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Cam Smith", team: "HOU", hrPct: 9.4, tb2Pct: 39.5, tier: "HR B / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Shay Whitcomb", team: "HOU", hrPct: 13.9, tb2Pct: 35.8, tier: "HR A+ / TB A", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; priced lean: 2+ TB (A)" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 3.4, tb2Pct: 25.8, tier: "HR D / TB C", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 3.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "CIN@MIN",
    venue: "Target Field",
    away: "CIN",
    home: "MIN",
    timeEt: "2:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 6th — CIN 1, MIN 3",
    awayScore: 1,
    homeScore: 3,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -101,
    homeAmerican: -113,
    impliedAwayPct: 17.32,
    impliedHomePct: 82.68,
    modelAwayPct: 44.89,
    modelHomePct: 55.11,
    edgeAwayPct: 27.57,
    edgeHomePct: -27.57,
    prediction: "MIN",
    decisionTier: "D",
    edgeOnPickPct: -27.57,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Singer vs Ober keeps this near pick'em territory, with Minnesota getting a small home bump if the roof holds down early extra-base variance.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "TJ Friedl", "CF"],
      ["2", "Matt McLain", "2B"],
      ["3", "Elly De La Cruz", "SS"],
      ["4", "Sal Stewart", "1B"],
      ["5", "Eugenio Suárez", "DH"],
      ["6", "Spencer Steer", "LF"],
      ["7", "Tyler Stephenson", "C"],
      ["8", "Rece Hinds", "RF"],
      ["9", "Ke'Bryan Hayes", "3B"],
    ],
    homeLineup: [
      ["1", "Byron Buxton", "CF"],
      ["2", "Trevor Larnach", "LF"],
      ["3", "Josh Bell", "DH"],
      ["4", "Victor Caratini", "C"],
      ["5", "Kody Clemens", "1B"],
      ["6", "Luke Keaschall", "2B"],
      ["7", "Tristan Gray", "3B"],
      ["8", "Brooks Lee", "SS"],
      ["9", "James Outman", "RF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Target Field. Weather/run environment from inputs: 52F / roof likely / Medium."],
    propsAway: [
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 10.8, tb2Pct: 41.4, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 12.5, tb2Pct: 45.3, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 2.2, tb2Pct: 19.1, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 4.8, tb2Pct: 25.8, tier: "HR D / TB C", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 5.2, tb2Pct: 19.9, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 9.8, tb2Pct: 37.6, tier: "HR B / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 5.7, tb2Pct: 27.9, tier: "HR D / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Josh Bell", team: "MIN", hrPct: 8.5, tb2Pct: 37.6, tier: "HR B / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Victor Caratini", team: "MIN", hrPct: 4.2, tb2Pct: 28.3, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Kody Clemens", team: "MIN", hrPct: 4.1, tb2Pct: 12.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 1.0, tb2Pct: 14.5, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Tristan Gray", team: "MIN", hrPct: 7.2, tb2Pct: 30.6, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 5.2, tb2Pct: 22.7, tier: "HR D / TB C", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "James Outman", team: "MIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "NYM@CHC",
    venue: "Wrigley Field",
    away: "NYM",
    home: "CHC",
    timeEt: "2:20 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 6th — NYM 1, CHC 0",
    awayScore: 1,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -140,
    impliedAwayPct: 63.17,
    impliedHomePct: 36.83,
    modelAwayPct: 63.54,
    modelHomePct: 36.46,
    edgeAwayPct: 0.37,
    edgeHomePct: -0.37,
    prediction: "NYM",
    decisionTier: "C",
    edgeOnPickPct: 0.37,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "starter_mismatch_rotowire",
    rationale: "Wrigley remains sensitive to weather and late lineup shape; the Cubs are favored, but not by enough to ignore any wind or scratch changes.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Carson Benge", "LF"],
      ["2", "Bo Bichette", "3B"],
      ["3", "Francisco Lindor", "SS"],
      ["4", "Luis Robert Jr.", "CF"],
      ["5", "MJ Melendez", "DH"],
      ["6", "Mark Vientos", "1B"],
      ["7", "Brett Baty", "RF"],
      ["8", "Marcus Semien", "2B"],
      ["9", "Luis Torrens", "C"],
    ],
    homeLineup: [
      ["1", "Nico Hoerner", "2B"],
      ["2", "Michael Busch", "1B"],
      ["3", "Alex Bregman", "3B"],
      ["4", "Ian Happ", "LF"],
      ["5", "Seiya Suzuki", "RF"],
      ["6", "Moisés Ballesteros", "DH"],
      ["7", "Carson Kelly", "C"],
      ["8", "Pete Crow-Armstrong", "CF"],
      ["9", "Dansby Swanson", "SS"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Wrigley Field. Weather/run environment from inputs: 54F / Wrigley breeze / Medium."],
    propsAway: [
      { batter: "Carson Benge", team: "NYM", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Bo Bichette", team: "NYM", hrPct: 1.1, tb2Pct: 16.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Francisco Lindor", team: "NYM", hrPct: 2.7, tb2Pct: 22.5, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luis Robert Jr.", team: "NYM", hrPct: 2.5, tb2Pct: 21.0, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "MJ Melendez", team: "NYM", hrPct: 11.7, tb2Pct: 55.0, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 2.2, tb2Pct: 13.2, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Brett Baty", team: "NYM", hrPct: 0.4, tb2Pct: 6.3, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Marcus Semien", team: "NYM", hrPct: 0.4, tb2Pct: 10.6, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luis Torrens", team: "NYM", hrPct: 1.1, tb2Pct: 18.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 1.1, tb2Pct: 23.5, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 0.4, tb2Pct: 9.7, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Ian Happ", team: "CHC", hrPct: 9.1, tb2Pct: 36.6, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 11.7, tb2Pct: 44.9, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Carson Kelly", team: "CHC", hrPct: 8.3, tb2Pct: 43.8, tier: "HR B / TB A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.4, tb2Pct: 8.3, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher; TB book at 3.5, not 1.5-aligned" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 5.3, tb2Pct: 27.1, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; vs tough pitcher; priced lean: 2+ TB (B)" },
    ],
  },
  {
    gameKey: "LAD@COL",
    venue: "Coors Field",
    away: "LAD",
    home: "COL",
    timeEt: "3:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 3rd — LAD 1, COL 0",
    awayScore: 1,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -225,
    homeAmerican: 190,
    impliedAwayPct: 69.38,
    impliedHomePct: 30.62,
    modelAwayPct: 52.30,
    modelHomePct: 47.70,
    edgeAwayPct: -17.08,
    edgeHomePct: 17.08,
    prediction: "LAD",
    decisionTier: "D",
    edgeOnPickPct: -17.08,
    modelConfidence: "High",
    analystConfidence: "Medium-High",
    flags: "",
    rationale: "Coors Field keeps the run environment elevated, but the Dodgers still bring the most complete roster edge on the board with Sasaki over Lorenzen.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Shohei Ohtani", "DH"],
      ["2", "Kyle Tucker", "RF"],
      ["3", "Will Smith", "C"],
      ["4", "Max Muncy", "3B"],
      ["5", "Andy Pages", "CF"],
      ["6", "Alex Call", "LF"],
      ["7", "Ryan Ward", "1B"],
      ["8", "Hyeseong Kim", "SS"],
      ["9", "Alex Freeland", "2B"],
    ],
    homeLineup: [
      ["1", "Edouard Julien", "2B"],
      ["2", "Mickey Moniak", "LF"],
      ["3", "Hunter Goodman", "C"],
      ["4", "Tyler Freeman", "DH"],
      ["5", "TJ Rumfield", "1B"],
      ["6", "Troy Johnston", "RF"],
      ["7", "Willi Castro", "SS"],
      ["8", "Kyle Karros", "3B"],
      ["9", "Jake McCarthy", "CF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Coors Field. Weather/run environment from inputs: 58F / thin air / High."],
    propsAway: [
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 13.6, tb2Pct: 48.3, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 5.6, tb2Pct: 26.8, tier: "HR D / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Will Smith", team: "LAD", hrPct: 5.6, tb2Pct: 30.4, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Max Muncy", team: "LAD", hrPct: 15.8, tb2Pct: 51.9, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Andy Pages", team: "LAD", hrPct: 11.1, tb2Pct: 45.9, tier: "HR A / TB A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Alex Call", team: "LAD", hrPct: 6.5, tb2Pct: 44.0, tier: "HR C / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Ryan Ward", team: "LAD", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Hyeseong Kim", team: "LAD", hrPct: 7.8, tb2Pct: 38.1, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 3.8, tb2Pct: 17.9, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Edouard Julien", team: "COL", hrPct: 5.1, tb2Pct: 25.7, tier: "HR D / TB C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 12.3, tb2Pct: 41.2, tier: "HR A / TB A+", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 11.4, tb2Pct: 40.8, tier: "HR A / TB A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Tyler Freeman", team: "COL", hrPct: 0.8, tb2Pct: 14.3, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 3.6, tb2Pct: 20.8, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Troy Johnston", team: "COL", hrPct: 5.5, tb2Pct: 30.9, tier: "HR D / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Willi Castro", team: "COL", hrPct: 4.3, tb2Pct: 24.4, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Kyle Karros", team: "COL", hrPct: 0.5, tb2Pct: 10.2, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jake McCarthy", team: "COL", hrPct: 1.2, tb2Pct: 19.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "CWS@ATH",
    venue: "Sutter Health Park",
    away: "CWS",
    home: "ATH",
    timeEt: "4:05 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 133,
    homeAmerican: -156,
    impliedAwayPct: 41.12,
    impliedHomePct: 58.88,
    modelAwayPct: 29.89,
    modelHomePct: 70.11,
    edgeAwayPct: -11.23,
    edgeHomePct: 11.23,
    prediction: "ATH",
    decisionTier: "A+",
    edgeOnPickPct: 11.23,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "",
    rationale: "Sutter Health Park still carries park-model uncertainty, so even with the Athletics favored this is a slate where props and late verification may be cleaner than the side.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Chase Meidroth", "2B"],
      ["2", "Miguel Vargas", "3B"],
      ["3", "Munetaka Murakami", "1B"],
      ["4", "Everson Pereira", "DH"],
      ["5", "Edgar Quero", "C"],
      ["6", "Colson Montgomery", "SS"],
      ["7", "Tanner Murray", "LF"],
      ["8", "Derek Hill", "RF"],
      ["9", "Luisangel Acuña", "CF"],
    ],
    homeLineup: [
      ["1", "Jacob Wilson", "SS"],
      ["2", "Shea Langeliers", "C"],
      ["3", "Nick Kurtz", "1B"],
      ["4", "Andy Ibáñez", "2B"],
      ["5", "Max Muncy", "DH"],
      ["6", "Tyler Soderstrom", "LF"],
      ["7", "Darell Hernaiz", "3B"],
      ["8", "Denzel Clarke", "CF"],
      ["9", "Zack Gelof", "RF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Sutter Health Park. Weather/run environment from inputs: 69F / river breeze / Medium."],
    propsAway: [
      { batter: "Chase Meidroth", team: "CWS", hrPct: 0.4, tb2Pct: 8.2, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 8.3, tb2Pct: 33.6, tier: "HR B / TB A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 7.4, tb2Pct: 37.0, tier: "HR C / TB A", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Edgar Quero", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 0.4, tb2Pct: 10.1, tier: "HR D / TB D", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Tanner Murray", team: "CWS", hrPct: 0.4, tb2Pct: 15.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Derek Hill", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Luisangel Acuña", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jacob Wilson", team: "ATH", hrPct: 3.3, tb2Pct: 21.3, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 10.8, tb2Pct: 42.3, tier: "HR A / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 11.2, tb2Pct: 43.9, tier: "HR A / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Andy Ibáñez", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Max Muncy", team: "ATH", hrPct: 9.3, tb2Pct: 38.5, tier: "HR B / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 5.6, tb2Pct: 26.5, tier: "HR D / TB B", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Darell Hernaiz", team: "ATH", hrPct: 0.4, tb2Pct: 6.6, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Denzel Clarke", team: "ATH", hrPct: 0.5, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "SD@LAA",
    venue: "Angel Stadium",
    away: "SD",
    home: "LAA",
    timeEt: "4:07 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "Warmup",
    gameStatusNote: "Warmup — Top 1st — SD 0, LAA 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -142,
    homeAmerican: 120,
    impliedAwayPct: 57.25,
    impliedHomePct: 42.75,
    modelAwayPct: 54.68,
    modelHomePct: 45.32,
    edgeAwayPct: -2.57,
    edgeHomePct: 2.57,
    prediction: "SD",
    decisionTier: "D",
    edgeOnPickPct: -2.57,
    modelConfidence: "High",
    analystConfidence: "Medium-High",
    flags: "",
    rationale: "Michael King vs a vulnerable Angels starter gives San Diego the cleaner pitching baseline; the main question is how much the market already prices that edge.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Ramón Laureano", "LF"],
      ["2", "Fernando Tatis Jr.", "2B"],
      ["3", "Jackson Merrill", "CF"],
      ["4", "Manny Machado", "3B"],
      ["5", "Xander Bogaerts", "SS"],
      ["6", "Gavin Sheets", "1B"],
      ["7", "Miguel Andujar", "DH"],
      ["8", "Luis Campusano", "C"],
      ["9", "Bryce Johnson", "RF"],
    ],
    homeLineup: [
      ["1", "Zach Neto", "SS"],
      ["2", "Mike Trout", "CF"],
      ["3", "Nolan Schanuel", "1B"],
      ["4", "Jorge Soler", "DH"],
      ["5", "Yoán Moncada", "3B"],
      ["6", "Jo Adell", "RF"],
      ["7", "Josh Lowe", "LF"],
      ["8", "Travis d'Arnaud", "C"],
      ["9", "Adam Frazier", "2B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Angel Stadium. Weather/run environment from inputs: 70F / clear / Medium."],
    propsAway: [
      { batter: "Ramón Laureano", team: "SD", hrPct: 6.4, tb2Pct: 36.4, tier: "HR C / TB A", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A)" },
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 2.2, tb2Pct: 24.2, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 3.9, tb2Pct: 27.7, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; neutral pitcher matchup; priced lean: 2+ TB (B)" },
      { batter: "Manny Machado", team: "SD", hrPct: 0.4, tb2Pct: 10.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 3.5, tb2Pct: 29.7, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Gavin Sheets", team: "SD", hrPct: 4.0, tb2Pct: 28.5, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 0.4, tb2Pct: 24.3, tier: "HR D / TB C", note: "RHB vs RHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Luis Campusano", team: "SD", hrPct: 3.9, tb2Pct: 33.6, tier: "HR D / TB A", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Bryce Johnson", team: "SD", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 5.0, tb2Pct: 26.7, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Mike Trout", team: "LAA", hrPct: 14.5, tb2Pct: 52.8, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.4, tb2Pct: 7.4, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 8.3, tb2Pct: 32.4, tier: "HR B / TB A", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 3.8, tb2Pct: 19.6, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Jo Adell", team: "LAA", hrPct: 5.0, tb2Pct: 30.0, tier: "HR D / TB B", note: "RHB vs RHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.9, tb2Pct: 8.9, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Travis d'Arnaud", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 4.7, tb2Pct: 32.8, tier: "HR D / TB A", note: "LHB vs RHP; above-average damage; neutral pitcher matchup; priced lean: 2+ TB (A)" },
    ],
  },
  {
    gameKey: "TEX@SEA",
    venue: "T-Mobile Park",
    away: "TEX",
    home: "SEA",
    timeEt: "4:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -142,
    impliedAwayPct: 43.91,
    impliedHomePct: 56.09,
    modelAwayPct: 46.90,
    modelHomePct: 53.10,
    edgeAwayPct: 3.00,
    edgeHomePct: -3.00,
    prediction: "SEA",
    decisionTier: "D",
    edgeOnPickPct: -3.00,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Gore and Woo can both miss bats, so this is another total-and-props environment unless the market drifts far enough off Seattle's home edge.",
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
      ["8", "Josh Smith", "2B"],
      ["9", "Danny Jansen", "C"],
    ],
    homeLineup: [
      ["1", "Rob Refsnyder", "RF"],
      ["2", "Cal Raleigh", "DH"],
      ["3", "Julio Rodríguez", "CF"],
      ["4", "Randy Arozarena", "LF"],
      ["5", "Mitch Garver", "C"],
      ["6", "Connor Joe", "1B"],
      ["7", "J.P. Crawford", "SS"],
      ["8", "Cole Young", "2B"],
      ["9", "Leo Rivas", "3B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: T-Mobile Park. Weather/run environment from inputs: 62F / roof likely / Low-Medium."],
    propsAway: [
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 2.9, tb2Pct: 26.7, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Corey Seager", team: "TEX", hrPct: 5.8, tb2Pct: 27.7, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.4, tb2Pct: 13.9, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jake Burger", team: "TEX", hrPct: 3.4, tb2Pct: 21.0, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.4, tb2Pct: 10.3, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Josh Jung", team: "TEX", hrPct: 2.5, tb2Pct: 30.7, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Evan Carter", team: "TEX", hrPct: 0.4, tb2Pct: 7.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Josh Smith", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Danny Jansen", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Rob Refsnyder", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 0.4, tb2Pct: 8.1, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.4, tb2Pct: 15.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Mitch Garver", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Connor Joe", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.4, tb2Pct: 9.0, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.4, tb2Pct: 6.3, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "TOR@AZ",
    venue: "Chase Field",
    away: "TOR",
    home: "AZ",
    timeEt: "4:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -110,
    homeAmerican: -104,
    impliedAwayPct: 51.01,
    impliedHomePct: 48.99,
    modelAwayPct: 65.63,
    modelHomePct: 34.37,
    edgeAwayPct: 14.62,
    edgeHomePct: -14.62,
    prediction: "TOR",
    decisionTier: "A+",
    edgeOnPickPct: 14.62,
    modelConfidence: "High",
    analystConfidence: "Low",
    flags: "",
    rationale: "Gausman gives Toronto the sharper top-end starter case, but Chase Field often compresses edges once bullpens and roof settings are baked in.",
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
      ["9", "Brandon Valenzuela", "C"],
    ],
    homeLineup: [
      ["1", "Ketel Marte", "2B"],
      ["2", "Corbin Carroll", "RF"],
      ["3", "Jose Fernandez", "SS"],
      ["4", "Lourdes Gurriel Jr.", "LF"],
      ["5", "Adrian Del Castillo", "DH"],
      ["6", "Ildemaro Vargas", "1B"],
      ["7", "Nolan Arenado", "3B"],
      ["8", "James McCann", "C"],
      ["9", "Alek Thomas", "CF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Chase Field. Weather/run environment from inputs: retractable roof / Medium."],
    propsAway: [
      { batter: "Nathan Lukes", team: "TOR", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.4, tb2Pct: 19.3, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 4.6, tb2Pct: 33.0, tier: "HR D / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 4.9, tb2Pct: 29.7, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Eloy Jiménez", team: "TOR", hrPct: 0.4, tb2Pct: 18.6, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 2.2, tb2Pct: 20.2, tier: "HR D / TB C", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 1.0, tb2Pct: 11.4, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Myles Straw", team: "TOR", hrPct: 7.4, tb2Pct: 40.1, tier: "HR C / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Brandon Valenzuela", team: "TOR", hrPct: 2.3, tb2Pct: 12.4, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Ketel Marte", team: "AZ", hrPct: 2.9, tb2Pct: 23.8, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 5.3, tb2Pct: 36.9, tier: "HR D / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Jose Fernandez", team: "AZ", hrPct: 0.4, tb2Pct: 16.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 2.8, tb2Pct: 28.0, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 2.5, tb2Pct: 30.7, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 0.4, tb2Pct: 9.5, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "James McCann", team: "AZ", hrPct: 0.4, tb2Pct: 12.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 0.4, tb2Pct: 8.1, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "DET@BOS",
    venue: "Fenway Park",
    away: "DET",
    home: "BOS",
    timeEt: "4:35 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 128,
    homeAmerican: -150,
    impliedAwayPct: 44.86,
    impliedHomePct: 55.14,
    modelAwayPct: 65.01,
    modelHomePct: 34.99,
    edgeAwayPct: 20.14,
    edgeHomePct: -20.14,
    prediction: "DET",
    decisionTier: "A+",
    edgeOnPickPct: 20.14,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Valdez vs Crochet is an ace-caliber setup, so the Red Sox lean is more about home context and price efficiency than any expectation of crooked numbers.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Jahmai Jones", "DH"],
      ["2", "Gleyber Torres", "2B"],
      ["3", "Matt Vierling", "CF"],
      ["4", "Dillon Dingler", "C"],
      ["5", "Riley Greene", "LF"],
      ["6", "Wenceel Pérez", "RF"],
      ["7", "Spencer Torkelson", "1B"],
      ["8", "Hao-Yu  Lee", "3B"],
      ["9", "Javier Báez", "SS"],
    ],
    homeLineup: [
      ["1", "Roman Anthony", "LF"],
      ["2", "Andruw Monasterio", "1B"],
      ["3", "Willson Contreras", "DH"],
      ["4", "Trevor Story", "SS"],
      ["5", "Wilyer Abreu", "RF"],
      ["6", "Ceddanne Rafaela", "CF"],
      ["7", "Caleb Durbin", "3B"],
      ["8", "Carlos Narváez", "C"],
      ["9", "Isiah Kiner-Falefa", "2B"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Fenway Park. Weather/run environment from inputs: 55F / cool Fenway / Medium."],
    propsAway: [
      { batter: "Jahmai Jones", team: "DET", hrPct: 0.4, tb2Pct: 7.6, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.4, tb2Pct: 10.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Matt Vierling", team: "DET", hrPct: 2.8, tb2Pct: 15.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Dillon Dingler", team: "DET", hrPct: 13.9, tb2Pct: 50.9, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Riley Greene", team: "DET", hrPct: 6.3, tb2Pct: 32.9, tier: "HR C / TB A", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 1.2, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 1.9, tb2Pct: 17.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Hao-Yu  Lee", team: "DET", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Javier Báez", team: "DET", hrPct: 3.1, tb2Pct: 25.1, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 0.4, tb2Pct: 15.1, tier: "HR D / TB D", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Andruw Monasterio", team: "BOS", hrPct: 0.4, tb2Pct: 13.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 5.1, tb2Pct: 31.6, tier: "HR D / TB B", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.4, tb2Pct: 11.3, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 2.5, tb2Pct: 22.7, tier: "HR D / TB C", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 0.4, tb2Pct: 13.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Carlos Narváez", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; vs tough pitcher" },
      { batter: "Isiah Kiner-Falefa", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "ATL@PHI",
    venue: "Citizens Bank Park",
    away: "ATL",
    home: "PHI",
    timeEt: "7:20 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -102,
    homeAmerican: -118,
    impliedAwayPct: 49.23,
    impliedHomePct: 50.77,
    modelAwayPct: 45.70,
    modelHomePct: 54.30,
    edgeAwayPct: -3.53,
    edgeHomePct: 3.53,
    prediction: "PHI",
    decisionTier: "B",
    edgeOnPickPct: 3.53,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_lineup_mismatch",
    rationale: "Painter gives Philadelphia the higher-ceiling arm, but NL East pricing between these lineups rarely leaves much margin without full lineup confirmation.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Ronald Acuña Jr.", "RF"],
      ["2", "Drake Baldwin", "C"],
      ["3", "Matt Olson", "1B"],
      ["4", "Austin Riley", "3B"],
      ["5", "Ozzie Albies", "2B"],
      ["6", "Mike Yastrzemski", "LF"],
      ["7", "Dominic Smith", "DH"],
      ["8", "Mauricio Dubón", "SS"],
      ["9", "Michael Harris II", "CF"],
    ],
    homeLineup: [
      ["1", "Trea Turner", "SS"],
      ["2", "Kyle Schwarber", "DH"],
      ["3", "Bryce Harper", "1B"],
      ["4", "Adolis García", "RF"],
      ["5", "Brandon Marsh", "LF"],
      ["6", "Alec Bohm", "3B"],
      ["7", "Bryson Stott", "2B"],
      ["8", "Rafael Marchán", "C"],
      ["9", "Justin Crawford", "CF"],
    ],
    spAwayNotes: ["Starter and bullpen roles — confirm at lock; run `build_ml_exports.py --date 2026-04-19 --compute --allow-partial` to pull API probables."],
    spHomeNotes: ["Home starter matchup — verify pitch mix vs lineup handedness before staking a side."],
    matchupBullets: ["Park: Citizens Bank Park. Weather/run environment from inputs: 63F / clear / Medium-High."],
    propsAway: [
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 0.7, tb2Pct: 23.8, tier: "HR D / TB C", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 3.3, tb2Pct: 27.7, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Matt Olson", team: "ATL", hrPct: 6.4, tb2Pct: 34.7, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Austin Riley", team: "ATL", hrPct: 1.3, tb2Pct: 20.5, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.4, tb2Pct: 8.2, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Mike Yastrzemski", team: "ATL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Dominic Smith", team: "ATL", hrPct: 6.0, tb2Pct: 35.2, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 0.4, tb2Pct: 15.3, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Michael Harris II", team: "ATL", hrPct: 5.1, tb2Pct: 30.6, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 8.8, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 8.1, tb2Pct: 32.4, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 6.5, tb2Pct: 37.7, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Adolis García", team: "PHI", hrPct: 0.9, tb2Pct: 14.5, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 1.4, tb2Pct: 21.6, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Bryson Stott", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Rafael Marchán", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Justin Crawford", team: "PHI", hrPct: 0.4, tb2Pct: 9.3, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
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

export default function Apr19Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 19, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-19
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
2026-04-19,SF,WSH,1:35 PM,Robbie Ray,PJ Poulin,625,-1100,4.0,100,-143,55F / 13 mph wind / 10% precip / Open,54.8,13.3,10,0.363,0.310,0.550,0.462,live,Live,In Progress,"Top 8th — SF 0, WSH 3",0,3,Partial,starter_mismatch_rotowire,13.08,86.92,55.59,44.41,42.51,-42.51,SF,A+,42.51,High,starter_mismatch_rotowire,Medium,"Robbie Ray gives the Giants the cleaner starting edge, but Nationals Park can flatten a modest road-favorite number if the Washington lineup posts a full contact-heavy order."
2026-04-19,TB,PIT,1:35 PM,Shane McClanahan,Mitch Keller,1700,-10000,8.0,110,-154,51F / 20 mph wind / 0% precip / Open,50.8,19.8,0,0.260,0.327,0.501,0.451,live,Live,In Progress,"Top 8th — TB 2, PIT 5",2,5,Verified,,5.31,94.69,44.07,55.93,38.76,-38.76,PIT,D,-38.76,High,,Medium,McClanahan vs Keller sets up as a run-suppressed duel at PNC; pricing is driven more by home field and bullpen path than by a huge early-offense expectation.
2026-04-19,KC,NYY,1:35 PM,Cole Ragans,Ryan Weathers,131,-149,8.0,-115,-105,46F / 15 mph wind / 54% precip / Open,45.8,14.8,54,0.311,0.430,0.365,0.586,pregame,Yet To Begin,Delayed Start,Delayed Start,,,Verified,,41.98,58.02,43.61,56.39,1.64,-1.64,NYY,D,-1.64,High,,Medium,"Ragans keeps Kansas City live, but Yankee Stadium still punishes mistakes and the market leans to New York's lineup ceiling over the full nine."
2026-04-19,BAL,CLE,1:40 PM,Trevor Rogers,Joey Cantillo,900,-2250,11.0,115,-150,49F / 18 mph wind / 0% precip / Open,48.9,17.8,0,0.503,0.321,0.499,0.501,live,Live,In Progress,"Bottom 7th — BAL 4, CLE 6",4,6,Verified,,9.46,90.54,59.38,40.62,49.92,-49.92,BAL,A+,49.92,High,,Low,Guardians get a light home lean in a contact-oriented matchup; this profiles more like a bullpen and sequencing game than a dominant starter mismatch.
2026-04-19,MIL,MIA,1:40 PM,Jacob Misiorowski,Eury Pérez,1200,-4500,7.0,-105,-133,84F / 10 mph wind / 4% precip / Retractable,83.7,9.7,4,0.399,0.412,0.426,0.516,live,Live,In Progress,"Top 7th — MIL 1, MIA 5",1,5,Verified,,7.29,92.71,64.94,35.06,57.65,-57.65,MIL,A+,57.65,High,,Medium,"Misiorowski and Eury Perez bring big raw stuff, so Miami's edge is more about home run prevention and run environment than a market-wide offensive gap."
2026-04-19,STL,HOU,2:10 PM,Matthew Liberatore,Mike Burrows,120,-140,,,,64F / 12 mph wind / 0% precip / Retractable,64.1,11.6,0,0.330,0.370,0.509,0.534,live,Live,In Progress,"Top 6th — STL 4, HOU 1",4,1,Partial,rotowire_lineup_mismatch,43.80,56.20,43.13,56.87,-0.66,0.66,HOU,C,0.66,High,rotowire_lineup_mismatch,Medium,"Houston is priced as the steadier home side, but neither starter carries a massive separator, so this stays in the range where late lineup quality and bullpen leverage matter."
2026-04-19,CIN,MIN,2:10 PM,Brady Singer,Bailey Ober,445,-705,6.5,-143,100,44F / 11 mph wind / 0% precip / Open,43.7,11.2,0,0.351,0.343,0.414,0.461,live,Live,In Progress,"Bottom 6th — CIN 1, MIN 3",1,3,Verified,,17.32,82.68,44.89,55.11,27.57,-27.57,MIN,D,-27.57,High,,Medium,"Singer vs Ober keeps this near pick'em territory, with Minnesota getting a small home bump if the roof holds down early extra-base variance."
2026-04-19,NYM,CHC,2:20 PM,Tobias Myers,Javier Assad,-208,154,4.0,-125,-111,47F / 14 mph wind / 13% precip / Open,47.0,13.7,13,0.335,0.425,0.372,0.573,live,Live,In Progress,"Bottom 6th — NYM 1, CHC 0",1,0,Partial,starter_mismatch_rotowire,63.17,36.83,63.54,36.46,0.37,-0.37,NYM,C,0.37,High,starter_mismatch_rotowire,Medium,"Wrigley remains sensitive to weather and late lineup shape; the Cubs are favored, but not by enough to ignore any wind or scratch changes."
2026-04-19,LAD,COL,3:10 PM,Roki Sasaki,Michael Lorenzen,-245,219,11.5,-105,-115,70F / 6 mph wind / 0% precip / Open,69.6,5.7,0,0.435,0.393,0.554,0.548,live,Live,In Progress,"Top 3rd — LAD 1, COL 0",1,0,Verified,,69.38,30.62,52.30,47.70,-17.08,17.08,LAD,D,-17.08,High,,Medium-High,"Coors Field keeps the run environment elevated, but the Dodgers still bring the most complete roster edge on the board with Sasaki over Lorenzen."
2026-04-19,CWS,ATH,4:05 PM,Noah Schultz,Jeffrey Springs,135,-156,9.5,-103,-118,74F / 8 mph wind / 0% precip / Open,73.7,8.1,0,0.331,0.359,0.468,0.421,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,41.12,58.88,29.89,70.11,-11.23,11.23,ATH,A+,11.23,High,,Low,"Sutter Health Park still carries park-model uncertainty, so even with the Athletics favored this is a slate where props and late verification may be cleaner than the side."
2026-04-19,SD,LAA,4:07 PM,Michael King,Walbert Urena,-147,125,9.0,-120,100,78F / 8 mph wind / 0% precip / Open,77.8,8.1,0,0.488,0.358,0.557,0.590,live,Live,Warmup,"Warmup — Top 1st — SD 0, LAA 0",0,0,Verified,,57.25,42.75,54.68,45.32,-2.57,2.57,SD,D,-2.57,High,,Medium-High,Michael King vs a vulnerable Angels starter gives San Diego the cleaner pitching baseline; the main question is how much the market already prices that edge.
2026-04-19,TEX,SEA,4:10 PM,MacKenzie Gore,Bryan Woo,119,-140,7.0,-125,102,68F / 5 mph wind / 1% precip / Retractable,67.9,5.1,1,0.426,0.351,0.534,0.336,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,43.91,56.09,46.90,53.10,3.00,-3.00,SEA,D,-3.00,High,,Medium,"Gore and Woo can both miss bats, so this is another total-and-props environment unless the market drifts far enough off Seattle's home edge."
2026-04-19,TOR,AZ,4:10 PM,Kevin Gausman,Ryne Nelson,-112,-103,8.0,-106,-115,93F / 14 mph wind / 0% precip / Retractable,92.6,14.0,0,0.446,0.483,0.431,0.520,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,51.01,48.99,65.63,34.37,14.62,-14.62,TOR,A+,14.62,High,,Low,"Gausman gives Toronto the sharper top-end starter case, but Chase Field often compresses edges once bullpens and roof settings are baked in."
2026-04-19,DET,BOS,4:35 PM,Framber Valdez,Garrett Crochet,116,-132,8.0,-116,-105,44F / 13 mph wind / 39% precip / Open,43.9,12.8,39,0.465,0.457,0.387,0.415,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,44.86,55.14,65.01,34.99,20.14,-20.14,DET,A+,20.14,High,,Medium,"Valdez vs Crochet is an ace-caliber setup, so the Red Sox lean is more about home context and price efficiency than any expectation of crooked numbers."
2026-04-19,ATL,PHI,7:20 PM,Grant Holmes,Andrew Painter,-105,-112,8.0,-114,-108,50F / 13 mph wind / 8% precip / Open,49.6,13.0,8,0.517,0.470,0.609,0.424,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_lineup_mismatch,49.23,50.77,45.70,54.30,-3.53,3.53,PHI,B,3.53,High,rotowire_lineup_mismatch,Medium,"Painter gives Philadelphia the higher-ceiling arm, but NL East pricing between these lineups rarely leaves much margin without full lineup confirmation."
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status
2026-04-19,SF@WSH,SF,Willy Adames,PJ Poulin,7.83,35.21,+1177,+184,1350,0.94,1.5,422,16.06,0.685,1,A,B,A,2+ TB,A,priced_below_tier,qualified,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SF@WSH,SF,Luis Arraez,PJ Poulin,0.40,18.50,+24900,+441,4000,-2.04,1.5,500,1.83,0.509,0,D,D,D,,,priced_no_edge,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SF@WSH,SF,Matt Chapman,PJ Poulin,3.19,25.48,+3032,+292,1400,-3.47,1.5,185,-9.60,0.555,0,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SF@WSH,SF,Rafael Devers,PJ Poulin,4.47,21.08,+2136,+374,1450,-1.98,1.5,210,-11.18,0.376,1,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SF@WSH,SF,Casey Schmitt,PJ Poulin,9.87,42.49,+913,+135,2250,5.61,2.5,235,,0.767,0,A+,B,A+,,,priced_below_tier,line_mismatch_2.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,SF,Jung Hoo Lee,PJ Poulin,2.99,24.38,+3245,+310,4000,0.55,1.5,700,11.88,0.530,0,C,D,C,,,priced_below_tier,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SF@WSH,SF,Heliot Ramos,PJ Poulin,8.35,35.00,+1098,+186,2200,4.00,0.5,272,,0.651,1,A,B,A,,,priced_below_tier,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,SF,Drew Gilbert,PJ Poulin,8.97,38.20,+1015,+162,2200,4.62,1.5,250,9.63,0.665,2,A+,B,A+,2+ TB,A+,priced_below_tier,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SF@WSH,SF,Patrick Bailey,PJ Poulin,0.45,8.71,+21912,+1048,2100,-4.09,1.5,200,-24.62,0.217,1,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SF@WSH,WSH,James Wood,Robbie Ray,16.02,54.93,+524,-122,NA,,1.5,625,41.14,0.950,3,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,WSH,Curtis Mead,Robbie Ray,3.42,20.85,+2827,+380,NA,,1.5,150,-19.15,0.467,0,C,D,C,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,WSH,Brady House,Robbie Ray,1.53,15.15,+6452,+560,NA,,1.5,280,-11.16,0.373,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,WSH,CJ Abrams,Robbie Ray,10.24,45.76,+877,+119,NA,,1.5,775,34.33,0.821,5,A+,A,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,WSH,Jacob Young,Robbie Ray,3.76,25.43,+2559,+293,NA,,1.5,146,-15.22,0.489,3,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,WSH,Joey Wiemer,Robbie Ray,2.79,16.10,+3484,+521,NA,,1.5,562,1.00,0.243,3,D,D,D,,,unpriced,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,WSH,Luis García Jr.,Robbie Ray,1.87,14.72,+5248,+579,NA,,1.5,500,-1.94,0.301,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,WSH,Nasim Nuñez,Robbie Ray,0.40,6.00,+24900,+1567,NA,,1.5,185,-29.09,0.249,5,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SF@WSH,WSH,Keibert Ruiz,Robbie Ray,0.71,10.40,+13920,+861,NA,,3.5,225,,0.270,0,D,D,D,,,unpriced,line_mismatch_3.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,TB,Chandler Simpson,Mitch Keller,0.40,6.00,+24900,+1567,5500,-1.39,1.5,200,-27.33,0.398,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TB@PIT,TB,Junior Caminero,Mitch Keller,4.58,25.55,+2082,+291,2100,0.04,0.5,260,,0.673,3,C,D,C,,,priced_below_tier,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,TB,Jonathan Aranda,Mitch Keller,3.64,22.33,+2648,+348,2650,0.00,0.5,245,,0.446,5,C,D,C,,,priced_below_tier,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,TB,Yandy Díaz,Mitch Keller,2.54,24.78,+3835,+304,1600,-3.34,0.5,130,,0.543,6,C,D,C,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,TB,Cedric Mullins,Mitch Keller,0.40,9.65,+24900,+936,1800,-4.86,0.5,148,,0.468,6,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,TB,Richie Palacios,Mitch Keller,3.38,27.40,+2856,+265,2900,0.05,2.5,190,,0.743,3,B,D,B,,,priced_below_tier,line_mismatch_2.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,TB,Jonny DeLuca,Mitch Keller,4.61,29.06,+2068,+244,2900,1.28,1.5,200,-4.27,0.587,2,B,D,B,,,priced_below_tier,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TB@PIT,TB,Hunter Feduccia,Mitch Keller,0.40,6.00,+24900,+1567,3150,-2.68,1.5,285,-19.97,0.293,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TB@PIT,TB,Taylor Walls,Mitch Keller,0.40,6.00,+24900,+1567,3650,-2.27,0.5,275,,0.362,7,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Jake Mangum,Shane McClanahan,0.40,14.22,+24900,+603,NA,,1.5,350,-8.01,0.504,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Nick Gonzales,Shane McClanahan,0.40,8.62,+24900,+1060,NA,,1.5,250,-19.95,0.250,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Bryan Reynolds,Shane McClanahan,5.24,27.28,+1809,+267,NA,,1.5,150,-12.72,0.502,6,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Marcell Ozuna,Shane McClanahan,3.78,21.72,+2547,+360,NA,,1.5,250,-6.85,0.572,0,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Oneil Cruz,Shane McClanahan,12.78,47.54,+682,+110,NA,,1.5,100,-2.46,0.703,0,A+,A,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Nick Yorke,Shane McClanahan,1.13,16.60,+8734,+503,NA,,1.5,100,-33.40,0.367,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Konnor Griffin,Shane McClanahan,0.40,11.12,+24900,+799,NA,,1.5,150,-28.88,0.349,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Joey Bart,Shane McClanahan,1.89,9.58,+5179,+944,NA,,1.5,250,-18.99,0.386,0,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TB@PIT,PIT,Billy Cook,Shane McClanahan,1.46,21.49,+6753,+365,NA,,1.5,150,-18.51,0.425,2,C,D,C,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,KC,Maikel Garcia,Ryan Weathers,6.93,31.64,+1343,+216,700,-5.57,1.5,110,-15.98,0.520,0,B,C,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,KC,Bobby Witt Jr.,Ryan Weathers,6.04,33.17,+1556,+202,422,-13.12,1.5,-105,-18.05,0.465,0,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,KC,Vinnie Pasquantino,Ryan Weathers,3.43,16.44,+2818,+508,588,-11.11,1.5,160,-22.02,0.396,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,KC,Salvador Perez,Ryan Weathers,4.06,14.29,+2366,+600,422,-15.10,1.5,136,-28.08,0.266,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,KC,Lane Thomas,Ryan Weathers,0.40,6.00,+24900,+1567,770,-11.09,1.5,190,-28.48,0.314,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,KC,Starling Marte,Ryan Weathers,1.72,14.24,+5727,+602,820,-9.15,1.5,170,-22.80,0.319,4,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,KC,Isaac Collins,Ryan Weathers,1.47,6.53,+6691,+1430,810,-9.52,1.5,205,-26.25,0.223,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,KC,Michael Massey,Ryan Weathers,1.45,14.32,+6788,+598,900,-8.55,1.5,210,-17.94,0.340,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,KC,Elias Díaz,Ryan Weathers,5.34,22.26,+1772,+349,850,-5.18,1.5,242,-6.98,,7,C,D,C,,,priced_no_edge,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,KC@NYY,NYY,Ben Rice,Cole Ragans,18.09,55.00,+453,-122,NA,,1.5,145,14.18,0.950,0,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,NYY,Aaron Judge,Cole Ragans,15.56,51.00,+543,-104,NA,,1.5,120,5.55,0.793,3,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,NYY,Cody Bellinger,Cole Ragans,4.79,27.52,+1990,+263,NA,,1.5,145,-13.29,0.548,5,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,NYY,Paul Goldschmidt,Cole Ragans,4.46,21.91,+2144,+356,NA,,1.5,158,-16.85,0.395,4,C,D,C,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,NYY,Trent Grisham,Cole Ragans,4.65,19.81,+2050,+405,NA,,1.5,175,-16.56,0.374,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,NYY,Amed Rosario,Cole Ragans,11.53,44.69,+767,+124,NA,,1.5,170,7.65,0.760,3,A+,A,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,NYY,Austin Wells,Cole Ragans,3.30,19.38,+2934,+416,NA,,1.5,220,-11.87,0.435,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,NYY,José Caballero,Cole Ragans,0.45,15.62,+21970,+540,NA,,1.5,275,-11.05,0.545,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,KC@NYY,NYY,Ryan McMahon,Cole Ragans,3.32,14.64,+2913,+583,NA,,1.5,228,-15.84,0.477,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,BAL,Taylor Ward,Joey Cantillo,0.40,18.93,+24900,+428,NA,,1.5,350,-3.29,0.527,1,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,BAL,Gunnar Henderson,Joey Cantillo,5.83,25.25,+1616,+296,950,-3.70,1.5,400,5.25,0.644,8,C,C,C,,,priced_no_edge,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,BAL@CLE,BAL,Pete Alonso,Joey Cantillo,1.73,18.24,+5673,+448,1300,-5.41,1.5,178,-17.73,0.456,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,BAL@CLE,BAL,Johnathan Rodríguez,Joey Cantillo,0.40,6.00,+24900,+1567,1600,-5.48,1.5,750,-5.76,0.180,3,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,BAL@CLE,BAL,Jeremiah Jackson,Joey Cantillo,7.40,32.47,+1252,+208,1550,1.34,1.5,220,1.22,0.912,2,A,C,A,,,priced_below_tier,priced_below_gate,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,BAL@CLE,BAL,Weston Wilson,Joey Cantillo,4.08,40.24,+2349,+149,NA,,1.5,100,-9.76,0.871,2,A+,D,A+,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,BAL,Coby Mayo,Joey Cantillo,0.40,6.00,+24900,+1567,1800,-4.86,1.5,775,-5.43,0.247,6,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,BAL@CLE,BAL,Sam Huff,Joey Cantillo,0.40,14.59,+24900,+585,1300,-6.74,1.5,302,-10.29,0.408,2,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,BAL@CLE,BAL,Blaze Alexander,Joey Cantillo,0.40,8.50,+24900,+1076,1400,-6.27,1.5,488,-8.51,0.245,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,BAL@CLE,CLE,Steven Kwan,Trevor Rogers,0.40,6.00,+24900,+1567,NA,,1.5,750,-5.76,0.432,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,CLE,Angel Martínez,Trevor Rogers,0.87,20.48,+11458,+388,NA,,0.5,248,,0.665,0,C,D,C,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,CLE,José Ramírez,Trevor Rogers,3.67,26.47,+2624,+278,NA,,1.5,650,13.14,0.623,5,B,D,B,2+ TB,B,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,CLE,Rhys Hoskins,Trevor Rogers,0.89,12.05,+11111,+730,NA,,0.5,375,,0.432,27,D,D,D,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,CLE,David Fry,Trevor Rogers,0.40,6.00,+24900,+1567,NA,,1.5,150,-34.00,0.266,4,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,CLE,Daniel Schneemann,Trevor Rogers,4.27,32.85,+2241,+204,NA,,1.5,475,15.46,0.831,5,A,D,A,2+ TB,A,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,CLE,Juan Brito,Trevor Rogers,0.40,6.00,+24900,+1567,NA,,2.5,190,,0.286,0,D,D,D,,,unpriced,line_mismatch_2.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,CLE,Austin Hedges,Trevor Rogers,0.40,6.00,+24900,+1567,NA,,1.5,850,-4.53,0.369,2,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,BAL@CLE,CLE,Brayan Rocchio,Trevor Rogers,0.40,12.71,+24900,+687,NA,,2.5,220,,0.605,4,D,D,D,,,unpriced,line_mismatch_2.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIL,Garrett Mitchell,Eury Pérez,8.41,32.66,+1089,+206,1350,1.51,0.5,200,,0.436,0,A,B,A,,,priced_below_tier,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIL,Brice Turang,Eury Pérez,12.91,49.06,+675,+104,1450,6.46,1.5,144,8.08,0.715,7,A+,A,A+,2+ TB,A+,qualified,qualified,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,MIL@MIA,MIL,Gary Sánchez,Eury Pérez,13.95,47.32,+617,+111,975,4.65,0.5,198,,0.752,3,A+,A+,A+,HR,A+,qualified,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIL,Jake Bauers,Eury Pérez,12.75,44.95,+684,+122,1100,4.42,0.5,200,,0.704,3,A,A,A+,HR,A,qualified,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIL,Luis Rengifo,Eury Pérez,1.21,11.51,+8153,+769,1700,-4.34,1.5,166,-26.09,0.257,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,MIL@MIA,MIL,Brandon Lockridge,Eury Pérez,0.40,7.53,+24900,+1228,2600,-3.30,2.5,230,,0.318,2,D,D,D,,,priced_no_edge,line_mismatch_2.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIL,Greg Jones,Eury Pérez,0.40,6.00,+24900,+1567,1600,-5.48,0.5,252,,0.180,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIL,Luis Matos,Eury Pérez,0.40,6.00,+24900,+1567,2500,-3.45,0.5,290,,0.258,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIL,David Hamilton,Eury Pérez,0.40,6.00,+24900,+1567,2200,-3.95,1.5,425,-13.05,0.214,1,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,MIL@MIA,MIA,Jakob Marsee,Jacob Misiorowski,0.40,6.00,+24900,+1567,NA,,0.5,225,,0.308,3,D,D,D,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIA,Xavier Edwards,Jacob Misiorowski,0.40,21.67,+24900,+361,NA,,1.5,180,-14.05,0.469,0,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIA,Otto Lopez,Jacob Misiorowski,6.27,37.67,+1495,+165,NA,,1.5,200,4.33,0.743,3,A,C,A,2+ TB,A,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIA,Kyle Stowers,Jacob Misiorowski,7.73,51.60,+1194,-107,NA,,2.5,280,,,3,A+,C,A+,,,unpriced,line_mismatch_2.5,"Low — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIA,Agustín Ramírez,Jacob Misiorowski,0.40,9.13,+24900,+995,NA,,0.5,135,,0.429,3,D,D,D,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIA,Liam Hicks,Jacob Misiorowski,1.56,20.51,+6296,+388,NA,,1.5,140,-21.16,0.450,0,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIA,Connor Norby,Jacob Misiorowski,1.32,21.21,+7490,+371,NA,,0.5,135,,0.687,0,C,D,C,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIA,Owen Caissie,Jacob Misiorowski,3.29,19.25,+2936,+419,NA,,0.5,215,,0.300,2,D,D,D,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,MIL@MIA,MIA,Graham Pauley,Jacob Misiorowski,0.40,6.00,+24900,+1567,NA,,0.5,228,,0.305,2,D,D,D,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,STL,JJ Wetherholt,Mike Burrows,2.82,18.63,+3452,+437,1400,-3.85,1.5,342,-3.99,0.512,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,STL@HOU,STL,Iván Herrera,Mike Burrows,3.91,23.75,+2456,+321,1200,-3.78,1.5,372,2.56,0.490,0,C,D,C,,,priced_no_edge,priced_below_tier,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,STL@HOU,STL,Alec Burleson,Mike Burrows,9.02,42.03,+1008,+138,900,-0.98,1.5,345,19.56,0.636,2,A+,B,A+,2+ TB,A+,priced_no_edge,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,STL@HOU,STL,Jordan Walker,Mike Burrows,16.85,55.00,+494,-122,1000,7.76,1.5,325,31.47,0.908,2,A+,A+,A+,2+ TB,A+,qualified,qualified,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,STL@HOU,STL,Nolan Gorman,Mike Burrows,1.62,12.90,+6080,+675,1200,-6.07,1.5,450,-5.28,0.427,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,STL@HOU,STL,Masyn Winn,Mike Burrows,0.40,9.97,+24900,+903,2000,-4.36,1.5,172,-26.79,0.468,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,STL@HOU,STL,Nathan Church,Mike Burrows,0.62,14.22,+15920,+603,2850,-2.77,0.5,245,,0.571,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,STL,Pedro Pagés,Mike Burrows,0.73,14.80,+13561,+576,1075,-7.78,0.5,130,,0.355,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, posted lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,STL,Victor Scott II,Mike Burrows,0.40,6.00,+24900,+1567,NA,,,,,0.217,2,D,D,D,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-19,STL@HOU,HOU,Carlos Correa,Matthew Liberatore,5.36,30.24,+1764,+231,NA,,1.5,312,5.97,0.477,3,B,D,B,2+ TB,B,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,HOU,Yordan Alvarez,Matthew Liberatore,20.26,55.00,+393,-122,NA,,1.5,262,27.38,0.929,3,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,HOU,Jose Altuve,Matthew Liberatore,4.88,27.07,+1949,+269,NA,,1.5,365,5.57,0.501,2,B,D,B,2+ TB,B,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,HOU,Christian Walker,Matthew Liberatore,8.84,34.19,+1032,+193,NA,,1.5,365,12.68,0.543,0,A,B,A,2+ TB,A,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,HOU,Isaac Paredes,Matthew Liberatore,0.40,6.00,+24900,+1567,NA,,1.5,488,-11.01,0.251,4,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,HOU,Cam Smith,Matthew Liberatore,9.41,39.52,+963,+153,NA,,1.5,478,22.22,0.505,2,A+,B,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,HOU,Yainer Diaz,Matthew Liberatore,0.40,6.00,+24900,+1567,NA,,1.5,275,-20.67,0.216,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,HOU,Shay Whitcomb,Matthew Liberatore,13.88,35.77,+621,+180,NA,,1.5,355,13.79,0.950,0,A,A+,A,2+ TB,A,unpriced,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,STL@HOU,HOU,Taylor Trammell,Matthew Liberatore,3.40,25.80,+2837,+288,NA,,3.5,154,,0.434,0,C,D,C,,,unpriced,line_mismatch_3.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,CIN,TJ Friedl,Bailey Ober,0.40,6.00,+24900,+1567,1350,-6.50,1.5,348,-16.32,0.241,12,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CIN@MIN,CIN,Matt McLain,Bailey Ober,0.40,6.00,+24900,+1567,1075,-8.11,1.5,135,-36.55,0.255,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CIN@MIN,CIN,Elly De La Cruz,Bailey Ober,10.78,41.39,+827,+142,775,-0.65,2.5,120,,0.691,8,A+,A,A+,,,priced_no_edge,line_mismatch_2.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,CIN,Sal Stewart,Bailey Ober,12.52,45.34,+699,+121,700,0.02,1.5,305,20.65,0.738,3,A+,A,A+,2+ TB,A+,priced_below_gate,qualified,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CIN@MIN,CIN,Eugenio Suárez,Bailey Ober,2.25,19.14,+4352,+422,750,-9.52,1.5,360,-2.60,0.565,10,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CIN@MIN,CIN,Spencer Steer,Bailey Ober,4.80,25.76,+1982,+288,1100,-3.53,1.5,410,6.15,0.487,9,C,D,C,,,priced_no_edge,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CIN@MIN,CIN,Tyler Stephenson,Bailey Ober,5.17,19.85,+1836,+404,1000,-3.93,1.5,470,2.31,0.394,7,D,D,D,,,priced_no_edge,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CIN@MIN,CIN,Rece Hinds,Bailey Ober,0.40,6.00,+24900,+1567,600,-13.89,1.5,230,-24.30,0.180,1,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CIN@MIN,CIN,Ke'Bryan Hayes,Bailey Ober,0.40,6.00,+24900,+1567,1500,-5.85,1.5,340,-16.73,0.180,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CIN@MIN,MIN,Byron Buxton,Brady Singer,9.81,37.56,+920,+166,NA,,1.5,100,-12.44,0.629,18,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,MIN,Trevor Larnach,Brady Singer,5.71,27.90,+1652,+258,NA,,1.5,131,-15.39,0.455,17,B,D,B,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,MIN,Josh Bell,Brady Singer,8.47,37.60,+1081,+166,NA,,1.5,122,-7.45,0.510,11,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,MIN,Victor Caratini,Brady Singer,4.21,28.34,+2277,+253,NA,,1.5,125,-16.11,0.477,6,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,MIN,Kody Clemens,Brady Singer,4.14,12.60,+2317,+694,NA,,1.5,400,-7.40,0.385,4,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,MIN,Luke Keaschall,Brady Singer,0.99,14.54,+10048,+588,NA,,1.5,460,-3.31,0.412,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,MIN,Tristan Gray,Brady Singer,7.20,30.59,+1289,+227,NA,,0.5,170,,0.487,5,B,C,B,,,unpriced,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,MIN,Brooks Lee,Brady Singer,5.17,22.69,+1835,+341,NA,,1.5,100,-27.31,0.617,2,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CIN@MIN,MIN,James Outman,Brady Singer,0.40,6.00,+24900,+1567,NA,,1.5,350,-16.22,0.180,3,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,NYM,Carson Benge,Javier Assad,0.40,6.00,+24900,+1567,1600,-5.48,1.5,500,-10.67,0.280,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,NYM,Bo Bichette,Javier Assad,1.07,16.66,+9206,+500,1300,-6.07,1.5,368,-4.70,0.413,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,NYM,Francisco Lindor,Javier Assad,2.75,22.54,+3543,+344,1050,-5.95,1.5,385,1.93,0.419,9,C,D,C,,,priced_no_edge,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,NYM,Luis Robert Jr.,Javier Assad,2.47,20.97,+3952,+377,1100,-5.87,1.5,428,2.03,0.464,3,C,D,C,,,priced_no_edge,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,NYM,MJ Melendez,Javier Assad,11.70,55.00,+755,-122,750,-0.07,1.5,280,28.68,0.713,5,A+,A,A+,2+ TB,A+,priced_no_edge,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,NYM,Mark Vientos,Javier Assad,2.20,13.25,+4451,+655,850,-8.33,1.5,330,-10.01,0.245,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,NYM,Brett Baty,Javier Assad,0.40,6.31,+24900,+1486,1125,-7.76,1.5,130,-37.17,0.180,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,NYM,Marcus Semien,Javier Assad,0.40,10.58,+24900,+845,1250,-7.01,1.5,310,-13.81,0.275,4,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,NYM,Luis Torrens,Javier Assad,1.14,18.65,+8645,+436,1175,-6.70,1.5,430,-0.21,0.364,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,NYM@CHC,CHC,Nico Hoerner,Tobias Myers,1.06,23.50,+9352,+326,NA,,1.5,328,0.13,0.707,9,C,D,C,,,unpriced,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,CHC,Michael Busch,Tobias Myers,0.40,6.00,+24900,+1567,NA,,0.5,150,,0.190,9,D,D,D,,,unpriced,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,CHC,Alex Bregman,Tobias Myers,0.40,9.67,+24900,+934,NA,,1.5,130,-33.80,0.329,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,CHC,Ian Happ,Tobias Myers,9.13,36.59,+995,+173,NA,,1.5,160,-1.87,0.666,10,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,CHC,Seiya Suzuki,Tobias Myers,0.40,6.00,+24900,+1567,NA,,0.5,-108,,0.419,8,D,D,D,,,unpriced,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,CHC,Moisés Ballesteros,Tobias Myers,11.74,44.92,+752,+123,NA,,1.5,400,24.92,0.950,0,A+,A,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,CHC,Carson Kelly,Tobias Myers,8.30,43.75,+1105,+129,NA,,1.5,332,20.60,0.877,4,A+,B,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,CHC,Pete Crow-Armstrong,Tobias Myers,0.40,8.27,+24900,+1110,NA,,3.5,122,,0.340,7,D,D,D,,,unpriced,line_mismatch_3.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,NYM@CHC,CHC,Dansby Swanson,Tobias Myers,5.27,27.10,+1797,+269,NA,,1.5,400,7.10,0.680,8,B,D,B,2+ TB,B,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,LAD,Shohei Ohtani,Michael Lorenzen,13.65,48.26,+633,+107,205,-19.14,2.5,100,,0.764,11,A+,A+,A+,,,priced_no_edge,line_mismatch_2.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,LAD,Kyle Tucker,Michael Lorenzen,5.56,26.77,+1699,+274,360,-16.18,1.5,-140,-31.56,0.527,6,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,LAD@COL,LAD,Will Smith,Michael Lorenzen,5.59,30.43,+1690,+229,422,-13.57,1.5,-135,-27.01,0.502,1,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,LAD@COL,LAD,Max Muncy,Michael Lorenzen,15.82,51.85,+532,-108,278,-10.63,1.5,-115,-1.63,0.780,3,A+,A+,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,LAD@COL,LAD,Andy Pages,Michael Lorenzen,11.09,45.93,+802,+118,462,-6.71,1.5,-135,-11.51,0.652,3,A+,A,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,LAD@COL,LAD,Alex Call,Michael Lorenzen,6.52,44.03,+1434,+127,925,-3.24,1.5,115,-2.48,0.731,3,A+,C,A+,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,LAD@COL,LAD,Ryan Ward,Michael Lorenzen,0.40,6.00,+24900,+1567,500,-16.27,1.5,-103,-44.74,,0,D,D,D,,,priced_no_edge,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,LAD@COL,LAD,Hyeseong Kim,Michael Lorenzen,7.80,38.08,+1182,+163,950,-1.72,1.5,117,-8.01,0.585,0,A+,B,A+,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,LAD@COL,LAD,Alex Freeland,Michael Lorenzen,3.77,17.90,+2555,+459,725,-8.35,1.5,134,-24.84,0.266,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,LAD@COL,COL,Edouard Julien,Roki Sasaki,5.08,25.74,+1869,+289,NA,,1.5,155,-13.48,0.451,0,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,COL,Mickey Moniak,Roki Sasaki,12.30,41.22,+713,+143,NA,,1.5,104,-7.80,0.830,1,A+,A,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,COL,Hunter Goodman,Roki Sasaki,11.40,40.81,+778,+145,NA,,1.5,107,-7.50,0.839,0,A+,A,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,COL,Tyler Freeman,Roki Sasaki,0.84,14.31,+11769,+599,NA,,1.5,125,-30.14,0.391,0,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,COL,TJ Rumfield,Roki Sasaki,3.64,20.81,+2647,+381,NA,,1.5,124,-23.83,0.369,0,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,COL,Troy Johnston,Roki Sasaki,5.53,30.89,+1709,+224,NA,,1.5,130,-12.59,0.579,0,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,COL,Willi Castro,Roki Sasaki,4.26,24.44,+2250,+309,NA,,1.5,133,-18.48,0.620,0,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,COL,Kyle Karros,Roki Sasaki,0.55,10.20,+18214,+880,NA,,1.5,175,-26.16,0.297,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,LAD@COL,COL,Jake McCarthy,Roki Sasaki,1.25,19.57,+7915,+411,NA,,1.5,175,-16.79,0.553,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,CWS,Chase Meidroth,Jeffrey Springs,0.40,8.25,+24900,+1113,975,-8.90,1.5,125,-36.20,0.413,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,CWS,Miguel Vargas,Jeffrey Springs,0.40,6.00,+24900,+1567,550,-14.98,1.5,125,-38.44,0.260,7,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,CWS,Munetaka Murakami,Jeffrey Springs,8.27,33.57,+1110,+198,350,-13.96,1.5,130,-9.91,0.580,0,A,B,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,CWS,Everson Pereira,Jeffrey Springs,7.38,37.00,+1254,+170,640,-6.13,1.5,147,-3.49,0.944,2,A,C,A,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,CWS,Edgar Quero,Jeffrey Springs,0.40,6.00,+24900,+1567,1175,-7.44,1.5,150,-34.00,0.307,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,CWS,Colson Montgomery,Jeffrey Springs,0.40,10.14,+24900,+887,432,-18.40,1.5,132,-32.97,0.525,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,CWS,Tanner Murray,Jeffrey Springs,0.40,15.69,+24900,+537,700,-12.10,1.5,182,-19.77,0.559,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,CWS,Derek Hill,Jeffrey Springs,0.40,6.00,+24900,+1567,1030,-8.45,1.5,208,-26.47,0.352,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,CWS,Luisangel Acuña,Jeffrey Springs,0.40,6.00,+24900,+1567,1180,-7.41,1.5,172,-30.76,0.269,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,CWS@ATH,ATH,Jacob Wilson,Noah Schultz,3.26,21.34,+2969,+369,NA,,1.5,-115,-32.15,0.511,0,C,D,C,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,ATH,Shea Langeliers,Noah Schultz,10.76,42.31,+830,+136,NA,,1.5,-115,-11.17,0.603,0,A+,A,A+,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,ATH,Nick Kurtz,Noah Schultz,11.20,43.90,+793,+128,NA,,1.5,123,-0.94,0.687,0,A+,A,A+,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,ATH,Andy Ibáñez,Noah Schultz,0.40,6.00,+24900,+1567,NA,,1.5,136,-36.37,0.180,0,D,D,D,,,unpriced,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,ATH,Max Muncy,Noah Schultz,9.32,38.52,+973,+160,NA,,1.5,127,-5.53,0.459,0,A+,B,A+,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,ATH,Tyler Soderstrom,Noah Schultz,5.63,26.49,+1678,+278,NA,,1.5,132,-16.61,0.510,0,B,D,B,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,ATH,Darell Hernaiz,Noah Schultz,0.40,6.55,+24900,+1426,NA,,1.5,140,-35.11,0.334,0,D,D,D,,,unpriced,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,ATH,Denzel Clarke,Noah Schultz,0.52,6.00,+19092,+1567,NA,,1.5,195,-27.90,0.274,0,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,CWS@ATH,ATH,Zack Gelof,Noah Schultz,0.40,6.00,+24900,+1567,NA,,1.5,195,-27.90,0.228,0,D,D,D,,,unpriced,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,SD,Ramón Laureano,Walbert Urena,6.43,36.36,+1455,+175,445,-11.92,1.5,-1,35.37,0.618,0,A,C,A,2+ TB,A,priced_no_edge,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,SD,Fernando Tatis Jr.,Walbert Urena,2.20,24.16,+4452,+314,405,-17.61,1.5,110,-23.46,0.427,0,C,D,C,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,SD,Jackson Merrill,Walbert Urena,3.94,27.68,+2437,+261,375,-17.11,1.5,-2,25.71,0.551,0,B,D,B,2+ TB,B,priced_no_edge,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,SD,Manny Machado,Walbert Urena,0.40,9.96,+24900,+904,475,-16.99,1.5,126,-34.29,0.463,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,SD,Xander Bogaerts,Walbert Urena,3.55,29.74,+2718,+236,890,-6.55,1.5,132,-13.37,0.754,0,B,D,B,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,SD,Gavin Sheets,Walbert Urena,3.97,28.48,+2420,+251,575,-10.85,1.5,140,-13.18,0.619,0,B,D,B,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,SD,Miguel Andujar,Walbert Urena,0.40,24.26,+24900,+312,990,-8.77,1.5,136,-18.11,0.604,0,C,D,C,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,SD,Luis Campusano,Walbert Urena,3.86,33.62,+2492,+197,800,-7.25,1.5,175,-2.75,0.745,0,A,D,A,,,priced_no_edge,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,SD,Bryce Johnson,Walbert Urena,0.40,6.00,+24900,+1567,1000,-8.69,1.5,160,-32.46,0.228,0,D,D,D,,,priced_no_edge,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,SD@LAA,LAA,Zach Neto,Michael King,5.05,26.67,+1882,+275,NA,,1.5,134,-16.06,0.565,5,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,LAA,Mike Trout,Michael King,14.52,52.75,+589,-112,NA,,1.5,116,6.46,0.828,1,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,LAA,Nolan Schanuel,Michael King,0.40,7.36,+24900,+1258,NA,,1.5,154,-32.01,0.312,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,LAA,Jorge Soler,Michael King,8.26,32.45,+1111,+208,NA,,1.5,150,-7.55,0.934,11,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,LAA,Yoán Moncada,Michael King,3.81,19.60,+2521,+410,NA,,1.5,188,-15.13,0.608,7,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,LAA,Jo Adell,Michael King,5.00,30.04,+1900,+233,NA,,1.5,135,-12.51,0.664,0,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,LAA,Josh Lowe,Michael King,0.90,8.95,+10957,+1018,NA,,1.5,190,-25.54,0.536,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,LAA,Travis d'Arnaud,Michael King,0.40,6.00,+24900,+1567,NA,,1.5,220,-25.25,0.182,4,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,SD@LAA,LAA,Adam Frazier,Michael King,4.67,32.78,+2043,+205,NA,,1.5,240,3.37,0.683,7,A,D,A,2+ TB,A,unpriced,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,TEX,Brandon Nimmo,Bryan Woo,2.93,26.73,+3318,+274,542,-12.65,1.5,144,-14.25,0.611,6,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,TEX,Corey Seager,Bryan Woo,5.75,27.74,+1639,+260,350,-16.47,1.5,130,-15.74,0.487,15,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,TEX,Wyatt Langford,Bryan Woo,0.40,13.86,+24900,+622,600,-13.89,1.5,154,-25.51,0.551,9,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,TEX,Jake Burger,Bryan Woo,3.37,21.03,+2869,+376,495,-13.44,1.5,151,-18.81,0.533,8,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,TEX,Joc Pederson,Bryan Woo,0.40,10.35,+24900,+866,546,-15.08,1.5,202,-22.76,0.639,10,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,TEX,Josh Jung,Bryan Woo,2.51,30.68,+3892,+226,900,-7.49,1.5,188,-4.04,0.918,13,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,TEX,Evan Carter,Bryan Woo,0.40,6.95,+24900,+1338,755,-11.30,1.5,203,-26.05,0.408,7,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,TEX,Josh Smith,Bryan Woo,0.40,6.00,+24900,+1567,1200,-7.29,1.5,210,-26.26,0.317,14,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,TEX,Danny Jansen,Bryan Woo,0.40,6.00,+24900,+1567,670,-12.59,1.5,210,-26.26,0.337,4,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TEX@SEA,SEA,Rob Refsnyder,MacKenzie Gore,0.40,6.00,+24900,+1567,NA,,1.5,184,-29.21,0.180,8,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,SEA,Cal Raleigh,MacKenzie Gore,0.40,6.00,+24900,+1567,NA,,1.5,143,-35.15,0.428,8,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,SEA,Julio Rodríguez,MacKenzie Gore,0.40,8.06,+24900,+1141,NA,,1.5,143,-33.09,0.470,8,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,SEA,Randy Arozarena,MacKenzie Gore,0.40,15.73,+24900,+536,NA,,1.5,178,-20.25,0.497,5,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,SEA,Mitch Garver,MacKenzie Gore,0.40,6.00,+24900,+1567,NA,,1.5,195,-27.90,0.187,5,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,SEA,Connor Joe,MacKenzie Gore,0.40,6.00,+24900,+1567,NA,,1.5,220,-25.25,0.180,10,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,SEA,J.P. Crawford,MacKenzie Gore,0.40,9.02,+24900,+1008,NA,,1.5,242,-20.22,0.371,8,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,SEA,Cole Young,MacKenzie Gore,0.40,6.31,+24900,+1484,NA,,1.5,250,-22.26,0.414,1,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TEX@SEA,SEA,Leo Rivas,MacKenzie Gore,0.40,6.00,+24900,+1567,NA,,1.5,296,-19.25,0.296,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,TOR,Nathan Lukes,Ryne Nelson,0.40,6.00,+24900,+1567,990,-8.77,1.5,114,-40.73,0.189,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,TOR,Ernie Clement,Ryne Nelson,0.40,19.34,+24900,+417,1050,-8.30,1.5,-1,18.35,0.472,5,D,D,D,,,priced_no_edge,priced_below_tier,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,TOR,Vladimir Guerrero Jr.,Ryne Nelson,4.64,32.97,+2054,+203,415,-14.77,1.5,-108,-18.95,0.528,8,A,D,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,TOR,Jesús Sánchez,Ryne Nelson,4.92,29.69,+1933,+237,500,-11.75,1.5,130,-13.79,0.443,2,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,TOR,Eloy Jiménez,Ryne Nelson,0.40,18.55,+24900,+439,500,-16.27,1.5,128,-25.31,0.445,2,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,TOR,Andrés Giménez,Ryne Nelson,2.22,20.16,+4406,+396,975,-7.08,1.5,148,-20.17,0.478,2,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,TOR,Kazuma Okamoto,Ryne Nelson,1.02,11.39,+9751,+778,650,-12.32,1.5,172,-25.38,0.238,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,TOR,Myles Straw,Ryne Nelson,7.42,40.07,+1248,+150,1300,0.28,1.5,206,7.39,0.699,0,A+,C,A+,2+ TB,A+,priced_below_tier,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,TOR,Brandon Valenzuela,Ryne Nelson,2.33,12.35,+4197,+710,900,-7.67,1.5,230,-17.95,0.390,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,TOR@AZ,AZ,Ketel Marte,Kevin Gausman,2.89,23.80,+3358,+320,NA,,1.5,119,-21.86,0.634,27,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,AZ,Corbin Carroll,Kevin Gausman,5.31,36.93,+1784,+171,NA,,1.5,120,-8.52,0.754,0,A,D,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,AZ,Jose Fernandez,Kevin Gausman,0.40,16.84,+24900,+494,NA,,1.5,150,-23.16,0.410,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,AZ,Lourdes Gurriel Jr.,Kevin Gausman,0.40,6.00,+24900,+1567,NA,,1.5,120,-39.45,0.180,3,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,AZ,Adrian Del Castillo,Kevin Gausman,2.81,27.95,+3465,+258,NA,,1.5,178,-8.02,0.669,0,B,D,B,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,AZ,Ildemaro Vargas,Kevin Gausman,2.48,30.66,+3933,+226,NA,,1.5,168,-6.65,0.646,3,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,AZ,Nolan Arenado,Kevin Gausman,0.40,9.52,+24900,+950,NA,,1.5,165,-28.21,0.582,21,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,AZ,James McCann,Kevin Gausman,0.40,12.70,+24900,+688,NA,,1.5,199,-20.75,0.483,16,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,TOR@AZ,AZ,Alek Thomas,Kevin Gausman,0.40,8.10,+24900,+1135,NA,,1.5,201,-25.13,0.321,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,DET,Jahmai Jones,Garrett Crochet,0.40,7.57,+24900,+1221,522,-15.68,1.5,160,-30.89,0.295,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,DET,Gleyber Torres,Garrett Crochet,0.40,9.98,+24900,+902,820,-10.47,1.5,155,-29.24,0.335,1,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,DET,Matt Vierling,Garrett Crochet,2.83,15.28,+3435,+555,920,-6.98,1.5,178,-20.69,0.315,7,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,DET,Dillon Dingler,Garrett Crochet,13.91,50.93,+619,-104,700,1.41,1.5,143,9.78,0.589,0,A+,A+,A+,2+ TB,A+,priced_below_gate,qualified,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,DET,Riley Greene,Garrett Crochet,6.26,32.93,+1497,+204,1000,-2.83,1.5,204,0.04,0.522,7,A,C,A,,,priced_no_edge,priced_below_gate,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,DET,Wenceel Pérez,Garrett Crochet,1.22,6.00,+8101,+1567,750,-10.55,1.5,168,-31.31,0.239,2,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,DET,Spencer Torkelson,Garrett Crochet,1.89,16.95,+5190,+490,680,-10.93,1.5,185,-18.14,0.413,7,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,DET,Hao-Yu  Lee,Garrett Crochet,0.40,6.00,+24900,+1567,1100,-7.93,1.5,234,-23.94,0.180,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,DET,Javier Báez,Garrett Crochet,3.09,25.07,+3138,+299,1100,-5.24,1.5,200,-8.27,0.599,5,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full
2026-04-19,DET@BOS,BOS,Roman Anthony,Framber Valdez,0.40,15.14,+24900,+561,NA,,1.5,164,-22.74,0.380,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,BOS,Andruw Monasterio,Framber Valdez,0.40,13.30,+24900,+652,NA,,1.5,154,-26.07,0.491,0,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,BOS,Willson Contreras,Framber Valdez,5.08,31.55,+1870,+217,NA,,1.5,147,-8.93,0.735,6,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,BOS,Trevor Story,Framber Valdez,0.40,11.28,+24900,+787,NA,,1.5,132,-31.82,0.445,9,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,BOS,Wilyer Abreu,Framber Valdez,2.47,22.70,+3946,+341,NA,,1.5,133,-20.22,0.402,3,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,BOS,Ceddanne Rafaela,Framber Valdez,0.40,13.27,+24900,+654,NA,,1.5,150,-26.73,0.457,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,BOS,Caleb Durbin,Framber Valdez,0.40,6.00,+24900,+1567,NA,,1.5,198,-27.56,0.334,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,BOS,Carlos Narváez,Framber Valdez,0.40,6.00,+24900,+1567,NA,,1.5,230,-24.30,0.180,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,DET@BOS,BOS,Isiah Kiner-Falefa,Framber Valdez,0.40,6.00,+24900,+1567,NA,,1.5,207,-26.57,0.307,20,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,ATL,Ronald Acuña Jr.,Andrew Painter,0.70,23.83,+14125,+320,410,-18.90,1.5,100,-26.17,0.584,0,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,ATL@PHI,ATL,Drake Baldwin,Andrew Painter,3.33,27.65,+2907,+262,548,-12.11,1.5,130,-15.83,0.652,0,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,ATL@PHI,ATL,Matt Olson,Andrew Painter,6.37,34.74,+1470,+188,405,-13.43,1.5,125,-9.70,0.732,0,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,ATL@PHI,ATL,Austin Riley,Andrew Painter,1.27,20.46,+7791,+389,488,-15.74,1.5,131,-22.83,0.685,0,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,ATL@PHI,ATL,Ozzie Albies,Andrew Painter,0.40,8.18,+24900,+1122,700,-12.10,1.5,148,-32.14,0.534,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,ATL@PHI,ATL,Mike Yastrzemski,Andrew Painter,0.40,6.00,+24900,+1567,730,-11.65,1.5,212,-26.05,0.269,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,ATL@PHI,ATL,Dominic Smith,Andrew Painter,6.03,35.21,+1559,+184,755,-5.67,1.5,184,-0.01,0.821,0,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,ATL@PHI,ATL,Mauricio Dubón,Andrew Painter,0.40,15.27,+24900,+555,1020,-8.53,1.5,190,-19.22,0.560,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, posted lineup, live markets matched",full
2026-04-19,ATL@PHI,ATL,Michael Harris II,Andrew Painter,5.13,30.62,+1851,+227,NA,,,,,0.639,0,B,D,B,,,unpriced,unpriced,"High — stats+savant+recent+BvP, posted lineup, no live markets",none
2026-04-19,ATL@PHI,PHI,Trea Turner,Grant Holmes,0.40,8.82,+24900,+1034,NA,,1.5,115,-37.69,0.491,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,PHI,Kyle Schwarber,Grant Holmes,8.10,32.41,+1134,+209,NA,,1.5,150,-7.59,0.601,4,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,PHI,Bryce Harper,Grant Holmes,6.47,37.71,+1446,+165,NA,,1.5,125,-6.73,0.785,2,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,PHI,Adolis García,Grant Holmes,0.92,14.54,+10747,+588,NA,,1.5,145,-26.28,0.407,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,PHI,Brandon Marsh,Grant Holmes,1.40,21.57,+7044,+364,NA,,1.5,182,-13.89,0.481,4,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,PHI,Alec Bohm,Grant Holmes,0.40,6.00,+24900,+1567,NA,,1.5,160,-32.46,0.180,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,PHI,Bryson Stott,Grant Holmes,0.40,6.00,+24900,+1567,NA,,1.5,190,-28.48,0.220,4,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,PHI,Rafael Marchán,Grant Holmes,0.40,6.00,+24900,+1567,NA,,1.5,216,-25.65,0.180,0,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
2026-04-19,ATL@PHI,PHI,Justin Crawford,Grant Holmes,0.40,9.29,+24900,+977,NA,,1.5,230,-21.02,0.469,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial
<!-- batter-outlooks-csv:end -->
*/
