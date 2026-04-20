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
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — SF 0, WSH 3",
    awayScore: 0,
    homeScore: 3,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -135,
    homeAmerican: 112,
    impliedAwayPct: 54.91,
    impliedHomePct: 45.09,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "starter_mismatch_rotowire;not_scored_non_pregame",
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
      { batter: "Willy Adames", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Rafael Devers", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Curtis Mead", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Brady House", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Joey Wiemer", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
      { batter: "Keibert Ruiz", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 0, WSH 3" },
    ],
  },
  {
    gameKey: "TB@PIT",
    venue: "PNC Park",
    away: "TB",
    home: "PIT",
    timeEt: "1:35 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TB 3, PIT 6",
    awayScore: 3,
    homeScore: 6,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 100,
    homeAmerican: -133,
    impliedAwayPct: 46.69,
    impliedHomePct: 53.31,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "not_scored_non_pregame",
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
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Junior Caminero", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Richie Palacios", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Jonny DeLuca", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Hunter Feduccia", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
    ],
    propsHome: [
      { batter: "Jake Mangum", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Oneil Cruz", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Joey Bart", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
      { batter: "Billy Cook", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 3, PIT 6" },
    ],
  },
  {
    gameKey: "KC@NYY",
    venue: "Yankee Stadium",
    away: "KC",
    home: "NYY",
    timeEt: "1:35 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — KC 0, NYY 7",
    awayScore: 0,
    homeScore: 7,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 131,
    homeAmerican: -150,
    impliedAwayPct: 41.91,
    impliedHomePct: 58.09,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "not_scored_non_pregame",
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
      { batter: "Maikel Garcia", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Salvador Perez", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Starling Marte", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Elias Díaz", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
    ],
    propsHome: [
      { batter: "Ben Rice", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Paul Goldschmidt", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Trent Grisham", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Amed Rosario", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Austin Wells", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "José Caballero", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
      { batter: "Ryan McMahon", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 0, NYY 7" },
    ],
  },
  {
    gameKey: "BAL@CLE",
    venue: "Progressive Field",
    away: "BAL",
    home: "CLE",
    timeEt: "1:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — BAL 4, CLE 8",
    awayScore: 4,
    homeScore: 8,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 104,
    homeAmerican: -115,
    impliedAwayPct: 47.82,
    impliedHomePct: 52.18,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Low",
    flags: "not_scored_non_pregame",
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
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Johnathan Rodríguez", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Weston Wilson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Sam Huff", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Blaze Alexander", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Angel Martínez", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "José Ramírez", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "David Fry", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Juan Brito", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Austin Hedges", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 4, CLE 8" },
    ],
  },
  {
    gameKey: "MIL@MIA",
    venue: "loanDepot park",
    away: "MIL",
    home: "MIA",
    timeEt: "1:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — MIL 3, MIA 5",
    awayScore: 3,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 104,
    homeAmerican: -140,
    impliedAwayPct: 45.66,
    impliedHomePct: 54.34,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "not_scored_non_pregame",
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
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Brice Turang", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Greg Jones", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Luis Matos", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "David Hamilton", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Kyle Stowers", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Connor Norby", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
      { batter: "Graham Pauley", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — MIL 3, MIA 5" },
    ],
  },
  {
    gameKey: "STL@HOU",
    venue: "Daikin Park",
    away: "STL",
    home: "HOU",
    timeEt: "2:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — STL 7, HOU 5",
    awayScore: 7,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -140,
    impliedAwayPct: 43.80,
    impliedHomePct: 56.20,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "not_scored_non_pregame",
    rationale: "Houston is priced as the steadier home side, but neither starter carries a massive separator, so this stays in the range where late lineup quality and bullpen leverage matter.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "JJ Wetherholt", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Iván Herrera", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Alec Burleson", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Jordan Walker", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Nathan Church", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Pedro Pagés", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Victor Scott II", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
    ],
    propsHome: [
      { batter: "Carlos Correa", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Jose Altuve", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Christian Walker", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Cam Smith", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Shay Whitcomb", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 7, HOU 5" },
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
    gameStatusNote: "Final — CIN 7, MIN 4",
    awayScore: 7,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -101,
    homeAmerican: -113,
    impliedAwayPct: 48.64,
    impliedHomePct: 51.36,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "not_scored_non_pregame",
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
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
    ],
    propsHome: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Josh Bell", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Victor Caratini", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Kody Clemens", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Tristan Gray", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
      { batter: "James Outman", team: "MIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 7, MIN 4" },
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
    gameStatusNote: "Final — NYM 1, CHC 2",
    awayScore: 1,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -140,
    impliedAwayPct: 43.80,
    impliedHomePct: 56.20,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "starter_mismatch_rotowire;not_scored_non_pregame",
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
      { batter: "Carson Benge", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Bo Bichette", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Francisco Lindor", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Luis Robert Jr.", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "MJ Melendez", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Brett Baty", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Marcus Semien", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Luis Torrens", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Ian Happ", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Carson Kelly", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — NYM 1, CHC 2" },
    ],
  },
  {
    gameKey: "LAD@COL",
    venue: "Coors Field",
    away: "LAD",
    home: "COL",
    timeEt: "3:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — LAD 6, COL 9",
    awayScore: 6,
    homeScore: 9,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -225,
    homeAmerican: 190,
    impliedAwayPct: 66.75,
    impliedHomePct: 33.25,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium-High",
    flags: "not_scored_non_pregame",
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
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Will Smith", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Max Muncy", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Andy Pages", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Alex Call", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Ryan Ward", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Hyeseong Kim", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
    ],
    propsHome: [
      { batter: "Edouard Julien", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Tyler Freeman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Troy Johnston", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Willi Castro", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Kyle Karros", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
      { batter: "Jake McCarthy", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 6, COL 9" },
    ],
  },
  {
    gameKey: "CWS@ATH",
    venue: "Sutter Health Park",
    away: "CWS",
    home: "ATH",
    timeEt: "4:05 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — CWS 7, ATH 4",
    awayScore: 7,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 133,
    homeAmerican: -156,
    impliedAwayPct: 41.32,
    impliedHomePct: 58.68,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Low",
    flags: "not_scored_non_pregame",
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
      { batter: "Chase Meidroth", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Edgar Quero", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Tanner Murray", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Derek Hill", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Luisangel Acuña", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
    ],
    propsHome: [
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Andy Ibáñez", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Max Muncy", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Darell Hernaiz", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Denzel Clarke", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CWS 7, ATH 4" },
    ],
  },
  {
    gameKey: "SD@LAA",
    venue: "Angel Stadium",
    away: "SD",
    home: "LAA",
    timeEt: "4:07 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — SD 2, LAA 1",
    awayScore: 2,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -142,
    homeAmerican: 120,
    impliedAwayPct: 56.35,
    impliedHomePct: 43.65,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium-High",
    flags: "not_scored_non_pregame",
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
      { batter: "Ramón Laureano", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Manny Machado", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Gavin Sheets", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Luis Campusano", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Bryce Johnson", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
    ],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Mike Trout", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Jo Adell", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Travis d'Arnaud", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SD 2, LAA 1" },
    ],
  },
  {
    gameKey: "TEX@SEA",
    venue: "T-Mobile Park",
    away: "TEX",
    home: "SEA",
    timeEt: "4:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TEX 2, SEA 5",
    awayScore: 2,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -142,
    impliedAwayPct: 43.65,
    impliedHomePct: 56.35,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "not_scored_non_pregame",
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
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Corey Seager", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Jake Burger", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Josh Jung", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Evan Carter", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Josh Smith", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Danny Jansen", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
    ],
    propsHome: [
      { batter: "Rob Refsnyder", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Mitch Garver", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Connor Joe", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 2, SEA 5" },
    ],
  },
  {
    gameKey: "TOR@AZ",
    venue: "Chase Field",
    away: "TOR",
    home: "AZ",
    timeEt: "4:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TOR 10, AZ 4",
    awayScore: 10,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -110,
    homeAmerican: -104,
    impliedAwayPct: 50.68,
    impliedHomePct: 49.32,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Low",
    flags: "not_scored_non_pregame",
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
      { batter: "Nathan Lukes", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Eloy Jiménez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Myles Straw", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Brandon Valenzuela", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
    ],
    propsHome: [
      { batter: "Ketel Marte", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Jose Fernandez", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "James McCann", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 10, AZ 4" },
    ],
  },
  {
    gameKey: "DET@BOS",
    venue: "Fenway Park",
    away: "DET",
    home: "BOS",
    timeEt: "4:35 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — DET 6, BOS 2",
    awayScore: 6,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 128,
    homeAmerican: -150,
    impliedAwayPct: 42.23,
    impliedHomePct: 57.77,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "not_scored_non_pregame",
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
      { batter: "Jahmai Jones", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Matt Vierling", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Dillon Dingler", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Riley Greene", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Hao-Yu  Lee", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Javier Báez", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Andruw Monasterio", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Carlos Narváez", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
      { batter: "Isiah Kiner-Falefa", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 2" },
    ],
  },
  {
    gameKey: "ATL@PHI",
    venue: "Citizens Bank Park",
    away: "ATL",
    home: "PHI",
    timeEt: "7:20 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 1st — ATL 0, PHI 2",
    awayScore: 0,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -102,
    homeAmerican: -118,
    impliedAwayPct: 48.26,
    impliedHomePct: 51.74,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "not_scored_non_pregame",
    rationale: "Painter gives Philadelphia the higher-ceiling arm, but NL East pricing between these lineups rarely leaves much margin without full lineup confirmation.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Matt Olson", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Austin Riley", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Mike Yastrzemski", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Dominic Smith", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Michael Harris II", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
    ],
    propsHome: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Adolis García", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Bryson Stott", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Rafael Marchán", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
      { batter: "Justin Crawford", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Bottom 1st — ATL 0, PHI 2" },
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
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,game_status_bucket,game_state,game_state_detail,game_status_note,away_score,home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary,scoring_status
2026-04-19,SF,WSH,1:35 PM,Robbie Ray,PJ Poulin,-135,112,,,,55F / 13 mph wind / 10% precip / Open,54.8,13.3,10,0.363,0.310,0.550,0.462,final,Final,Final,"Final — SF 0, WSH 3",0,3,Partial,starter_mismatch_rotowire,54.91,45.09,,,,,,not_scored,,not_scored,starter_mismatch_rotowire,Medium,"Robbie Ray gives the Giants the cleaner starting edge, but Nationals Park can flatten a modest road-favorite number if the Washington lineup posts a full contact-heavy order.",not_scored
2026-04-19,TB,PIT,1:35 PM,Shane McClanahan,Mitch Keller,100,-133,,,,51F / 20 mph wind / 0% precip / Open,50.8,19.8,0,0.260,0.326,0.501,0.451,final,Final,Final,"Final — TB 3, PIT 6",3,6,Verified,,46.69,53.31,,,,,,not_scored,,not_scored,,Medium,McClanahan vs Keller sets up as a run-suppressed duel at PNC; pricing is driven more by home field and bullpen path than by a huge early-offense expectation.,not_scored
2026-04-19,KC,NYY,1:35 PM,Cole Ragans,Ryan Weathers,131,-150,,,,46F / 15 mph wind / 54% precip / Open,45.8,14.8,54,0.341,0.448,0.421,0.586,final,Final,Final,"Final — KC 0, NYY 7",0,7,Verified,,41.91,58.09,,,,,,not_scored,,not_scored,,Medium,"Ragans keeps Kansas City live, but Yankee Stadium still punishes mistakes and the market leans to New York's lineup ceiling over the full nine.",not_scored
2026-04-19,BAL,CLE,1:40 PM,Trevor Rogers,Joey Cantillo,104,-115,,,,49F / 18 mph wind / 0% precip / Open,48.9,17.8,0,0.477,0.321,0.499,0.501,final,Final,Final,"Final — BAL 4, CLE 8",4,8,Verified,,47.82,52.18,,,,,,not_scored,,not_scored,,Low,Guardians get a light home lean in a contact-oriented matchup; this profiles more like a bullpen and sequencing game than a dominant starter mismatch.,not_scored
2026-04-19,MIL,MIA,1:40 PM,Jacob Misiorowski,Eury Pérez,104,-140,,,,84F / 10 mph wind / 4% precip / Retractable,83.7,9.7,4,0.425,0.409,0.426,0.516,final,Final,Final,"Final — MIL 3, MIA 5",3,5,Verified,,45.66,54.34,,,,,,not_scored,,not_scored,,Medium,"Misiorowski and Eury Perez bring big raw stuff, so Miami's edge is more about home run prevention and run environment than a market-wide offensive gap.",not_scored
2026-04-19,STL,HOU,2:10 PM,Matthew Liberatore,Mike Burrows,120,-140,,,,64F / 12 mph wind / 0% precip / Retractable,64.1,11.6,0,0.329,0.371,0.509,0.534,final,Final,Final,"Final — STL 7, HOU 5",7,5,Verified,,43.80,56.20,,,,,,not_scored,,not_scored,,Medium,"Houston is priced as the steadier home side, but neither starter carries a massive separator, so this stays in the range where late lineup quality and bullpen leverage matter.",not_scored
2026-04-19,CIN,MIN,2:10 PM,Brady Singer,Bailey Ober,-101,-113,,,,44F / 11 mph wind / 0% precip / Open,43.7,11.2,0,0.358,0.328,0.414,0.461,final,Final,Final,"Final — CIN 7, MIN 4",7,4,Verified,,48.64,51.36,,,,,,not_scored,,not_scored,,Medium,"Singer vs Ober keeps this near pick'em territory, with Minnesota getting a small home bump if the roof holds down early extra-base variance.",not_scored
2026-04-19,NYM,CHC,2:20 PM,Tobias Myers,Javier Assad,120,-140,,,,47F / 14 mph wind / 13% precip / Open,47.0,13.7,13,0.335,0.447,0.372,0.573,final,Final,Final,"Final — NYM 1, CHC 2",1,2,Partial,starter_mismatch_rotowire,43.80,56.20,,,,,,not_scored,,not_scored,starter_mismatch_rotowire,Medium,"Wrigley remains sensitive to weather and late lineup shape; the Cubs are favored, but not by enough to ignore any wind or scratch changes.",not_scored
2026-04-19,LAD,COL,3:10 PM,Roki Sasaki,Michael Lorenzen,-225,190,,,,70F / 3 mph wind / 0% precip / Open,70.5,3.2,0,0.448,0.393,0.604,0.548,final,Final,Final,"Final — LAD 6, COL 9",6,9,Verified,,66.75,33.25,,,,,,not_scored,,not_scored,,Medium-High,"Coors Field keeps the run environment elevated, but the Dodgers still bring the most complete roster edge on the board with Sasaki over Lorenzen.",not_scored
2026-04-19,CWS,ATH,4:05 PM,Noah Schultz,Jeffrey Springs,133,-156,,,,74F / 8 mph wind / 0% precip / Open,74.4,7.6,0,0.330,0.390,0.468,0.421,final,Final,Final,"Final — CWS 7, ATH 4",7,4,Verified,,41.32,58.68,,,,,,not_scored,,not_scored,,Low,"Sutter Health Park still carries park-model uncertainty, so even with the Athletics favored this is a slate where props and late verification may be cleaner than the side.",not_scored
2026-04-19,SD,LAA,4:07 PM,Michael King,Walbert Urena,-142,120,,,,80F / 5 mph wind / 0% precip / Open,80.1,5.1,0,0.488,0.358,0.557,0.590,final,Final,Final,"Final — SD 2, LAA 1",2,1,Verified,,56.35,43.65,,,,,,not_scored,,not_scored,,Medium-High,Michael King vs a vulnerable Angels starter gives San Diego the cleaner pitching baseline; the main question is how much the market already prices that edge.,not_scored
2026-04-19,TEX,SEA,4:10 PM,MacKenzie Gore,Bryan Woo,120,-142,,,,68F / 6 mph wind / 1% precip / Retractable,68.3,5.9,1,0.427,0.350,0.534,0.336,final,Final,Final,"Final — TEX 2, SEA 5",2,5,Verified,,43.65,56.35,,,,,,not_scored,,not_scored,,Medium,"Gore and Woo can both miss bats, so this is another total-and-props environment unless the market drifts far enough off Seattle's home edge.",not_scored
2026-04-19,TOR,AZ,4:10 PM,Kevin Gausman,Ryne Nelson,-110,-104,,,,92F / 10 mph wind / 0% precip / Retractable,92.2,10.1,0,0.446,0.471,0.431,0.520,final,Final,Final,"Final — TOR 10, AZ 4",10,4,Verified,,50.68,49.32,,,,,,not_scored,,not_scored,,Low,"Gausman gives Toronto the sharper top-end starter case, but Chase Field often compresses edges once bullpens and roof settings are baked in.",not_scored
2026-04-19,DET,BOS,4:35 PM,Framber Valdez,Garrett Crochet,128,-150,,,,44F / 12 mph wind / 28% precip / Open,44.2,12.5,28,0.465,0.457,0.387,0.415,final,Final,Final,"Final — DET 6, BOS 2",6,2,Verified,,42.23,57.77,,,,,,not_scored,,not_scored,,Medium,"Valdez vs Crochet is an ace-caliber setup, so the Red Sox lean is more about home context and price efficiency than any expectation of crooked numbers.",not_scored
2026-04-19,ATL,PHI,7:20 PM,Grant Holmes,Andrew Painter,-102,-118,,,,50F / 8 mph wind / 9% precip / Open,50.4,7.8,9,0.517,0.470,0.609,0.424,live,Live,In Progress,"Bottom 1st — ATL 0, PHI 2",0,2,Verified,,48.26,51.74,,,,,,not_scored,,not_scored,,Medium,"Painter gives Philadelphia the higher-ceiling arm, but NL East pricing between these lineups rarely leaves much margin without full lineup confirmation.",not_scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-19,SF@WSH,SF,Willy Adames,PJ Poulin,,,,,NA,,1.5,150,,0.685,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,SF,Luis Arraez,PJ Poulin,,,,,NA,,1.5,150,,0.509,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,SF,Matt Chapman,PJ Poulin,,,,,NA,,1.5,150,,0.555,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,SF,Rafael Devers,PJ Poulin,,,,,NA,,1.5,200,,0.376,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,SF,Casey Schmitt,PJ Poulin,,,,,NA,,1.5,250,,0.767,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,SF,Jung Hoo Lee,PJ Poulin,,,,,NA,,1.5,150,,0.530,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,SF,Heliot Ramos,PJ Poulin,,,,,NA,,1.5,150,,0.651,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,SF,Drew Gilbert,PJ Poulin,,,,,NA,,1.5,250,,0.665,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,SF,Patrick Bailey,PJ Poulin,,,,,NA,,1.5,150,,0.217,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,James Wood,Robbie Ray,,,,,NA,,1.5,150,,0.950,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,Curtis Mead,Robbie Ray,,,,,NA,,1.5,150,,0.467,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,Brady House,Robbie Ray,,,,,NA,,1.5,150,,0.373,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,CJ Abrams,Robbie Ray,,,,,NA,,1.5,100,,0.821,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,Jacob Young,Robbie Ray,,,,,NA,,1.5,150,,0.489,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,Joey Wiemer,Robbie Ray,,,,,NA,,1.5,150,,0.243,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,Luis García Jr.,Robbie Ray,,,,,NA,,1.5,100,,0.301,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,Nasim Nuñez,Robbie Ray,,,,,NA,,1.5,150,,0.249,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SF@WSH,WSH,Keibert Ruiz,Robbie Ray,,,,,NA,,1.5,150,,0.270,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Chandler Simpson,Mitch Keller,,,,,NA,,1.5,150,,0.398,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Junior Caminero,Mitch Keller,,,,,NA,,1.5,150,,0.673,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Jonathan Aranda,Mitch Keller,,,,,NA,,1.5,150,,0.446,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Yandy Díaz,Mitch Keller,,,,,NA,,1.5,150,,0.543,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Cedric Mullins,Mitch Keller,,,,,NA,,1.5,150,,0.468,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Richie Palacios,Mitch Keller,,,,,NA,,1.5,250,,0.743,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Jonny DeLuca,Mitch Keller,,,,,NA,,1.5,150,,0.587,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Hunter Feduccia,Mitch Keller,,,,,NA,,1.5,150,,0.293,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,TB,Taylor Walls,Mitch Keller,,,,,NA,,1.5,150,,0.362,7,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Jake Mangum,Shane McClanahan,,,,,NA,,1.5,350,,0.504,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Nick Gonzales,Shane McClanahan,,,,,NA,,1.5,250,,0.250,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Bryan Reynolds,Shane McClanahan,,,,,NA,,1.5,150,,0.502,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Marcell Ozuna,Shane McClanahan,,,,,NA,,1.5,250,,0.572,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Oneil Cruz,Shane McClanahan,,,,,NA,,1.5,100,,0.703,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Nick Yorke,Shane McClanahan,,,,,NA,,1.5,100,,0.367,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Konnor Griffin,Shane McClanahan,,,,,NA,,1.5,150,,0.349,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Joey Bart,Shane McClanahan,,,,,NA,,1.5,250,,0.386,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TB@PIT,PIT,Billy Cook,Shane McClanahan,,,,,NA,,1.5,150,,0.425,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Maikel Garcia,Ryan Weathers,,,,,NA,,1.5,150,,0.520,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Bobby Witt Jr.,Ryan Weathers,,,,,NA,,1.5,300,,0.465,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Vinnie Pasquantino,Ryan Weathers,,,,,NA,,1.5,100,,0.396,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Salvador Perez,Ryan Weathers,,,,,NA,,1.5,150,,0.266,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Lane Thomas,Ryan Weathers,,,,,NA,,1.5,150,,0.314,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Starling Marte,Ryan Weathers,,,,,NA,,1.5,150,,0.319,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Isaac Collins,Ryan Weathers,,,,,NA,,1.5,100,,0.223,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Michael Massey,Ryan Weathers,,,,,NA,,1.5,100,,0.340,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,KC,Elias Díaz,Ryan Weathers,,,,,NA,,1.5,150,,,40,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,Ben Rice,Cole Ragans,,,,,NA,,1.5,450,,0.950,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,Aaron Judge,Cole Ragans,,,,,NA,,1.5,450,,0.793,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,Cody Bellinger,Cole Ragans,,,,,NA,,1.5,250,,0.548,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,Paul Goldschmidt,Cole Ragans,,,,,NA,,1.5,100,,0.395,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,Trent Grisham,Cole Ragans,,,,,NA,,1.5,450,,0.374,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,Amed Rosario,Cole Ragans,,,,,NA,,1.5,150,,0.760,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,Austin Wells,Cole Ragans,,,,,NA,,1.5,100,,0.435,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,José Caballero,Cole Ragans,,,,,NA,,1.5,150,,0.545,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,KC@NYY,NYY,Ryan McMahon,Cole Ragans,,,,,NA,,1.5,50,,0.477,46,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Taylor Ward,Joey Cantillo,,,,,NA,,1.5,350,,0.527,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Gunnar Henderson,Joey Cantillo,,,,,NA,,1.5,150,,0.644,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Pete Alonso,Joey Cantillo,,,,,NA,,1.5,150,,0.456,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Johnathan Rodríguez,Joey Cantillo,,,,,NA,,1.5,150,,0.180,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Jeremiah Jackson,Joey Cantillo,,,,,NA,,1.5,150,,0.912,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Weston Wilson,Joey Cantillo,,,,,NA,,1.5,100,,0.871,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Coby Mayo,Joey Cantillo,,,,,NA,,1.5,150,,0.247,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Sam Huff,Joey Cantillo,,,,,NA,,1.5,150,,0.408,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,BAL,Blaze Alexander,Joey Cantillo,,,,,NA,,1.5,100,,0.245,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,Steven Kwan,Trevor Rogers,,,,,NA,,1.5,150,,0.432,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,Angel Martínez,Trevor Rogers,,,,,NA,,1.5,150,,0.665,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,José Ramírez,Trevor Rogers,,,,,NA,,1.5,650,,0.623,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,Rhys Hoskins,Trevor Rogers,,,,,NA,,1.5,150,,0.432,27,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,David Fry,Trevor Rogers,,,,,NA,,1.5,150,,0.266,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,Daniel Schneemann,Trevor Rogers,,,,,NA,,1.5,100,,0.831,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,Juan Brito,Trevor Rogers,,,,,NA,,1.5,250,,0.286,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,Austin Hedges,Trevor Rogers,,,,,NA,,1.5,100,,0.369,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,BAL@CLE,CLE,Brayan Rocchio,Trevor Rogers,,,,,NA,,1.5,250,,0.605,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,Garrett Mitchell,Eury Pérez,,,,,NA,,1.5,150,,0.436,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,Brice Turang,Eury Pérez,,,,,NA,,1.5,150,,0.715,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,Gary Sánchez,Eury Pérez,,,,,NA,,1.5,150,,0.752,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,Jake Bauers,Eury Pérez,,,,,NA,,1.5,100,,0.704,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,Luis Rengifo,Eury Pérez,,,,,NA,,1.5,150,,0.257,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,Brandon Lockridge,Eury Pérez,,,,,NA,,1.5,250,,0.318,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,Greg Jones,Eury Pérez,,,,,NA,,1.5,150,,0.180,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,Luis Matos,Eury Pérez,,,,,NA,,1.5,100,,0.258,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIL,David Hamilton,Eury Pérez,,,,,NA,,1.5,100,,0.214,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Jakob Marsee,Jacob Misiorowski,,,,,NA,,1.5,150,,0.308,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Xavier Edwards,Jacob Misiorowski,,,,,NA,,1.5,150,,0.469,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Otto Lopez,Jacob Misiorowski,,,,,NA,,1.5,150,,0.743,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Kyle Stowers,Jacob Misiorowski,,,,,NA,,1.5,250,,,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Agustín Ramírez,Jacob Misiorowski,,,,,NA,,1.5,150,,0.429,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Liam Hicks,Jacob Misiorowski,,,,,NA,,1.5,150,,0.450,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Connor Norby,Jacob Misiorowski,,,,,NA,,1.5,150,,0.687,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Owen Caissie,Jacob Misiorowski,,,,,NA,,1.5,250,,0.300,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,MIL@MIA,MIA,Graham Pauley,Jacob Misiorowski,,,,,NA,,1.5,100,,0.305,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,JJ Wetherholt,Mike Burrows,,,,,NA,,1.5,150,,0.512,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,Iván Herrera,Mike Burrows,,,,,NA,,1.5,150,,0.490,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,Alec Burleson,Mike Burrows,,,,,NA,,1.5,150,,0.636,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,Jordan Walker,Mike Burrows,,,,,NA,,1.5,150,,0.908,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,Nolan Gorman,Mike Burrows,,,,,NA,,1.5,100,,0.427,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,Masyn Winn,Mike Burrows,,,,,NA,,1.5,250,,0.468,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,Nathan Church,Mike Burrows,,,,,NA,,1.5,50,,0.571,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,Pedro Pagés,Mike Burrows,,,,,NA,,1.5,150,,0.355,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,STL,Victor Scott II,Mike Burrows,,,,,NA,,1.5,100,,0.217,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Carlos Correa,Matthew Liberatore,,,,,NA,,1.5,150,,0.477,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Yordan Alvarez,Matthew Liberatore,,,,,NA,,1.5,150,,0.929,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Jose Altuve,Matthew Liberatore,,,,,NA,,1.5,150,,0.501,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Christian Walker,Matthew Liberatore,,,,,NA,,1.5,150,,0.543,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Isaac Paredes,Matthew Liberatore,,,,,NA,,1.5,150,,0.251,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Cam Smith,Matthew Liberatore,,,,,NA,,1.5,150,,0.505,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Yainer Diaz,Matthew Liberatore,,,,,NA,,1.5,250,,0.216,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Shay Whitcomb,Matthew Liberatore,,,,,NA,,1.5,50,,0.950,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,STL@HOU,HOU,Taylor Trammell,Matthew Liberatore,,,,,NA,,1.5,350,,0.434,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,TJ Friedl,Bailey Ober,,,,,NA,,1.5,150,,0.241,12,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,Matt McLain,Bailey Ober,,,,,NA,,1.5,150,,0.255,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,Elly De La Cruz,Bailey Ober,,,,,NA,,1.5,250,,0.691,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,Sal Stewart,Bailey Ober,,,,,NA,,1.5,150,,0.738,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,Eugenio Suárez,Bailey Ober,,,,,NA,,1.5,100,,0.565,10,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,Spencer Steer,Bailey Ober,,,,,NA,,1.5,150,,0.487,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,Tyler Stephenson,Bailey Ober,,,,,NA,,1.5,150,,0.394,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,Rece Hinds,Bailey Ober,,,,,NA,,1.5,100,,0.180,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,CIN,Ke'Bryan Hayes,Bailey Ober,,,,,NA,,1.5,100,,0.180,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,Byron Buxton,Brady Singer,,,,,NA,,1.5,150,,0.629,18,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,Trevor Larnach,Brady Singer,,,,,NA,,1.5,150,,0.455,18,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,Josh Bell,Brady Singer,,,,,NA,,1.5,150,,0.510,12,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,Victor Caratini,Brady Singer,,,,,NA,,1.5,150,,0.477,7,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,Kody Clemens,Brady Singer,,,,,NA,,1.5,100,,0.385,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,Luke Keaschall,Brady Singer,,,,,NA,,1.5,150,,0.412,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,Tristan Gray,Brady Singer,,,,,NA,,1.5,100,,0.487,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,Brooks Lee,Brady Singer,,,,,NA,,1.5,100,,0.617,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CIN@MIN,MIN,James Outman,Brady Singer,,,,,NA,,1.5,150,,0.180,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,Carson Benge,Javier Assad,,,,,NA,,1.5,100,,0.280,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,Bo Bichette,Javier Assad,,,,,NA,,1.5,150,,0.413,7,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,Francisco Lindor,Javier Assad,,,,,NA,,1.5,150,,0.419,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,Luis Robert Jr.,Javier Assad,,,,,NA,,1.5,150,,0.464,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,MJ Melendez,Javier Assad,,,,,NA,,1.5,450,,0.713,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,Mark Vientos,Javier Assad,,,,,NA,,1.5,150,,0.245,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,Brett Baty,Javier Assad,,,,,NA,,1.5,150,,0.180,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,Marcus Semien,Javier Assad,,,,,NA,,1.5,150,,0.275,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,NYM,Luis Torrens,Javier Assad,,,,,NA,,1.5,250,,0.364,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Nico Hoerner,Tobias Myers,,,,,NA,,1.5,150,,0.707,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Michael Busch,Tobias Myers,,,,,NA,,1.5,150,,0.190,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Alex Bregman,Tobias Myers,,,,,NA,,1.5,150,,0.329,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Ian Happ,Tobias Myers,,,,,NA,,1.5,150,,0.666,10,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Seiya Suzuki,Tobias Myers,,,,,NA,,1.5,150,,0.419,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Moisés Ballesteros,Tobias Myers,,,,,NA,,1.5,150,,0.950,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Carson Kelly,Tobias Myers,,,,,NA,,1.5,100,,0.877,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Pete Crow-Armstrong,Tobias Myers,,,,,NA,,1.5,350,,0.340,7,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,NYM@CHC,CHC,Dansby Swanson,Tobias Myers,,,,,NA,,1.5,150,,0.680,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Shohei Ohtani,Michael Lorenzen,,,,,NA,,1.5,350,,0.764,10,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Kyle Tucker,Michael Lorenzen,,,,,NA,,1.5,150,,0.527,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Will Smith,Michael Lorenzen,,,,,NA,,1.5,150,,0.502,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Max Muncy,Michael Lorenzen,,,,,NA,,1.5,250,,0.780,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Andy Pages,Michael Lorenzen,,,,,NA,,1.5,150,,0.652,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Alex Call,Michael Lorenzen,,,,,NA,,1.5,150,,0.731,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Ryan Ward,Michael Lorenzen,,,,,NA,,1.5,150,,,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Hyeseong Kim,Michael Lorenzen,,,,,NA,,1.5,250,,0.585,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,LAD,Alex Freeland,Michael Lorenzen,,,,,NA,,1.5,250,,0.266,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,Edouard Julien,Roki Sasaki,,,,,NA,,1.5,150,,0.451,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,Mickey Moniak,Roki Sasaki,,,,,NA,,1.5,150,,0.830,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,Hunter Goodman,Roki Sasaki,,,,,NA,,1.5,150,,0.839,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,Tyler Freeman,Roki Sasaki,,,,,NA,,1.5,150,,0.391,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,TJ Rumfield,Roki Sasaki,,,,,NA,,1.5,150,,0.369,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,Troy Johnston,Roki Sasaki,,,,,NA,,1.5,350,,0.579,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,Willi Castro,Roki Sasaki,,,,,NA,,1.5,150,,0.620,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,Kyle Karros,Roki Sasaki,,,,,NA,,1.5,550,,0.297,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,LAD@COL,COL,Jake McCarthy,Roki Sasaki,,,,,NA,,1.5,250,,0.553,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Chase Meidroth,Jeffrey Springs,,,,,NA,,1.5,350,,0.413,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Miguel Vargas,Jeffrey Springs,,,,,NA,,1.5,550,,0.260,10,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Munetaka Murakami,Jeffrey Springs,,,,,NA,,1.5,450,,0.580,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Everson Pereira,Jeffrey Springs,,,,,NA,,1.5,350,,0.944,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Edgar Quero,Jeffrey Springs,,,,,NA,,1.5,150,,0.307,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Colson Montgomery,Jeffrey Springs,,,,,NA,,1.5,450,,0.525,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Tanner Murray,Jeffrey Springs,,,,,NA,,1.5,150,,0.559,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Derek Hill,Jeffrey Springs,,,,,NA,,1.5,450,,0.352,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,CWS,Luisangel Acuña,Jeffrey Springs,,,,,NA,,1.5,150,,0.269,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Jacob Wilson,Noah Schultz,,,,,NA,,1.5,150,,0.511,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Shea Langeliers,Noah Schultz,,,,,NA,,1.5,150,,0.603,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Nick Kurtz,Noah Schultz,,,,,NA,,1.5,150,,0.687,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Andy Ibáñez,Noah Schultz,,,,,NA,,1.5,150,,0.180,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Max Muncy,Noah Schultz,,,,,NA,,1.5,150,,0.459,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Tyler Soderstrom,Noah Schultz,,,,,NA,,1.5,200,,0.510,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Darell Hernaiz,Noah Schultz,,,,,NA,,1.5,450,,0.334,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Denzel Clarke,Noah Schultz,,,,,NA,,1.5,50,,0.274,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,CWS@ATH,ATH,Zack Gelof,Noah Schultz,,,,,NA,,1.5,150,,0.228,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Ramón Laureano,Walbert Urena,,,,,NA,,1.5,150,,0.618,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Fernando Tatis Jr.,Walbert Urena,,,,,NA,,1.5,150,,0.427,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Jackson Merrill,Walbert Urena,,,,,NA,,1.5,150,,0.551,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Manny Machado,Walbert Urena,,,,,NA,,1.5,150,,0.463,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Xander Bogaerts,Walbert Urena,,,,,NA,,1.5,150,,0.754,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Gavin Sheets,Walbert Urena,,,,,NA,,1.5,150,,0.619,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Miguel Andujar,Walbert Urena,,,,,NA,,1.5,150,,0.604,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Luis Campusano,Walbert Urena,,,,,NA,,1.5,100,,0.745,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,SD,Bryce Johnson,Walbert Urena,,,,,NA,,1.5,250,,0.228,24,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Zach Neto,Michael King,,,,,NA,,1.5,150,,0.565,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Mike Trout,Michael King,,,,,NA,,1.5,150,,0.828,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Nolan Schanuel,Michael King,,,,,NA,,1.5,150,,0.312,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Jorge Soler,Michael King,,,,,NA,,1.5,150,,0.934,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Yoán Moncada,Michael King,,,,,NA,,1.5,100,,0.608,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Jo Adell,Michael King,,,,,NA,,1.5,150,,0.664,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Josh Lowe,Michael King,,,,,NA,,1.5,150,,0.536,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Travis d'Arnaud,Michael King,,,,,NA,,1.5,100,,0.182,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,SD@LAA,LAA,Adam Frazier,Michael King,,,,,NA,,1.5,150,,0.683,60,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Brandon Nimmo,Bryan Woo,,,,,NA,,1.5,150,,0.611,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Corey Seager,Bryan Woo,,,,,NA,,1.5,150,,0.487,15,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Wyatt Langford,Bryan Woo,,,,,NA,,1.5,150,,0.551,12,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Jake Burger,Bryan Woo,,,,,NA,,1.5,150,,0.533,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Joc Pederson,Bryan Woo,,,,,NA,,1.5,100,,0.639,10,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Josh Jung,Bryan Woo,,,,,NA,,1.5,100,,0.918,14,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Evan Carter,Bryan Woo,,,,,NA,,1.5,150,,0.408,10,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Josh Smith,Bryan Woo,,,,,NA,,1.5,150,,0.317,14,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,TEX,Danny Jansen,Bryan Woo,,,,,NA,,1.5,50,,0.337,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,Rob Refsnyder,MacKenzie Gore,,,,,NA,,1.5,450,,0.180,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,Cal Raleigh,MacKenzie Gore,,,,,NA,,1.5,150,,0.428,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,Julio Rodríguez,MacKenzie Gore,,,,,NA,,1.5,150,,0.470,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,Randy Arozarena,MacKenzie Gore,,,,,NA,,1.5,650,,0.497,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,Mitch Garver,MacKenzie Gore,,,,,NA,,1.5,50,,0.187,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,Connor Joe,MacKenzie Gore,,,,,NA,,1.5,150,,0.180,10,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,J.P. Crawford,MacKenzie Gore,,,,,NA,,1.5,450,,0.371,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,Cole Young,MacKenzie Gore,,,,,NA,,1.5,150,,0.414,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TEX@SEA,SEA,Leo Rivas,MacKenzie Gore,,,,,NA,,1.5,100,,0.296,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Nathan Lukes,Ryne Nelson,,,,,NA,,1.5,500,,0.189,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Ernie Clement,Ryne Nelson,,,,,NA,,1.5,400,,0.472,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Vladimir Guerrero Jr.,Ryne Nelson,,,,,NA,,1.5,250,,0.528,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Jesús Sánchez,Ryne Nelson,,,,,NA,,1.5,250,,0.443,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Eloy Jiménez,Ryne Nelson,,,,,NA,,1.5,250,,0.445,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Andrés Giménez,Ryne Nelson,,,,,NA,,1.5,200,,0.478,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Kazuma Okamoto,Ryne Nelson,,,,,NA,,1.5,500,,0.238,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Myles Straw,Ryne Nelson,,,,,NA,,1.5,150,,0.699,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,TOR,Brandon Valenzuela,Ryne Nelson,,,,,NA,,1.5,150,,0.390,29,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,Ketel Marte,Kevin Gausman,,,,,NA,,1.5,150,,0.634,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,Corbin Carroll,Kevin Gausman,,,,,NA,,1.5,150,,0.754,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,Jose Fernandez,Kevin Gausman,,,,,NA,,1.5,150,,0.410,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,Lourdes Gurriel Jr.,Kevin Gausman,,,,,NA,,1.5,150,,0.180,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,Adrian Del Castillo,Kevin Gausman,,,,,NA,,1.5,350,,0.669,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,Ildemaro Vargas,Kevin Gausman,,,,,NA,,1.5,150,,0.646,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,Nolan Arenado,Kevin Gausman,,,,,NA,,1.5,150,,0.582,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,James McCann,Kevin Gausman,,,,,NA,,1.5,150,,0.483,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,TOR@AZ,AZ,Alek Thomas,Kevin Gausman,,,,,NA,,1.5,250,,0.321,97,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Jahmai Jones,Garrett Crochet,,,,,NA,,1.5,450,,0.295,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Gleyber Torres,Garrett Crochet,,,,,NA,,1.5,150,,0.335,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Matt Vierling,Garrett Crochet,,,,,NA,,1.5,350,,0.315,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Dillon Dingler,Garrett Crochet,,,,,NA,,1.5,750,,0.589,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Riley Greene,Garrett Crochet,,,,,NA,,1.5,150,,0.522,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Wenceel Pérez,Garrett Crochet,,,,,NA,,1.5,150,,0.239,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Spencer Torkelson,Garrett Crochet,,,,,NA,,1.5,150,,0.413,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Hao-Yu  Lee,Garrett Crochet,,,,,NA,,1.5,150,,0.180,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,DET,Javier Báez,Garrett Crochet,,,,,NA,,1.5,150,,0.599,53,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Roman Anthony,Framber Valdez,,,,,NA,,1.5,150,,0.380,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Andruw Monasterio,Framber Valdez,,,,,NA,,1.5,150,,0.491,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Willson Contreras,Framber Valdez,,,,,NA,,1.5,450,,0.735,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Trevor Story,Framber Valdez,,,,,NA,,1.5,150,,0.445,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Wilyer Abreu,Framber Valdez,,,,,NA,,1.5,150,,0.402,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Ceddanne Rafaela,Framber Valdez,,,,,NA,,1.5,250,,0.457,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Caleb Durbin,Framber Valdez,,,,,NA,,1.5,150,,0.334,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Carlos Narváez,Framber Valdez,,,,,NA,,1.5,150,,0.180,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,DET@BOS,BOS,Isiah Kiner-Falefa,Framber Valdez,,,,,NA,,1.5,150,,0.307,73,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,ATL,Ronald Acuña Jr.,Andrew Painter,,,,,432,,1.5,-2,,0.584,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,ATL,Drake Baldwin,Andrew Painter,,,,,525,,1.5,130,,0.652,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,ATL,Matt Olson,Andrew Painter,,,,,428,,1.5,136,,0.732,1,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,ATL,Austin Riley,Andrew Painter,,,,,525,,1.5,131,,0.685,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,ATL,Ozzie Albies,Andrew Painter,,,,,700,,1.5,146,,0.534,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,ATL,Mike Yastrzemski,Andrew Painter,,,,,740,,1.5,216,,0.269,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,ATL,Dominic Smith,Andrew Painter,,,,,800,,1.5,182,,0.821,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,ATL,Mauricio Dubón,Andrew Painter,,,,,1050,,1.5,185,,0.560,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,ATL,Michael Harris II,Andrew Painter,,,,,750,,1.5,170,,0.639,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-19,ATL@PHI,PHI,Trea Turner,Grant Holmes,,,,,NA,,1.5,130,,0.491,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,PHI,Kyle Schwarber,Grant Holmes,,,,,NA,,1.5,156,,0.601,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,PHI,Bryce Harper,Grant Holmes,,,,,NA,,1.5,128,,0.785,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,PHI,Adolis García,Grant Holmes,,,,,NA,,1.5,154,,0.407,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,PHI,Brandon Marsh,Grant Holmes,,,,,NA,,1.5,180,,0.481,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,PHI,Alec Bohm,Grant Holmes,,,,,NA,,1.5,172,,0.180,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,PHI,Bryson Stott,Grant Holmes,,,,,NA,,1.5,195,,0.220,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,PHI,Rafael Marchán,Grant Holmes,,,,,NA,,1.5,235,,0.180,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-19,ATL@PHI,PHI,Justin Crawford,Grant Holmes,,,,,NA,,1.5,240,,0.469,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
<!-- batter-outlooks-csv:end -->
*/
