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
  awayAmerican: number | null;
  homeAmerican: number | null;
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
    gameKey: "DET@ATL",
    venue: "MLB Park",
    away: "DET",
    home: "ATL",
    timeEt: "12:15 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — DET 5, ATL 2",
    awayScore: 5,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 50.00,
    impliedHomePct: 50.00,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "hr_market_integrity_degraded;market_odds_unavailable;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Framber Valdez vs Bryce Elder. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Kevin McGonigle", "SS"],
      ["2", "Gleyber Torres", "2B"],
      ["3", "Colt Keith", "DH"],
      ["4", "Riley Greene", "LF"],
      ["5", "Spencer Torkelson", "1B"],
      ["6", "Kerry Carpenter", "RF"],
      ["7", "Matt Vierling", "CF"],
      ["8", "Hao-Yu  Lee", "3B"],
      ["9", "Jake Rogers", "C"],
    ],
    homeLineup: [
      ["1", "Ronald Acuña Jr.", "RF"],
      ["2", "Drake Baldwin", "C"],
      ["3", "Ozzie Albies", "2B"],
      ["4", "Matt Olson", "1B"],
      ["5", "Austin Riley", "3B"],
      ["6", "Mauricio Dubón", "LF"],
      ["7", "Kyle Farmer", "DH"],
      ["8", "Jorge Mateo", "SS"],
      ["9", "Eli White", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-30 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Kevin McGonigle", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Colt Keith", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Riley Greene", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Kerry Carpenter", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Matt Vierling", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Hao-Yu  Lee", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Jake Rogers", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
    ],
    propsHome: [
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Matt Olson", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Austin Riley", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Kyle Farmer", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Jorge Mateo", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
      { batter: "Eli White", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 5, ATL 2" },
    ],
  },
  {
    gameKey: "STL@PIT",
    venue: "MLB Park",
    away: "STL",
    home: "PIT",
    timeEt: "12:35 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — STL 10, PIT 5",
    awayScore: 10,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 50.00,
    impliedHomePct: 50.00,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "hr_market_integrity_degraded;market_odds_unavailable;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Hunter Dobbins vs Paul Skenes. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
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
      ["1", "Oneil Cruz", "CF"],
      ["2", "Brandon Lowe", "2B"],
      ["3", "Bryan Reynolds", "RF"],
      ["4", "Ryan O'Hearn", "DH"],
      ["5", "Nick Gonzales", "3B"],
      ["6", "Spencer Horwitz", "1B"],
      ["7", "Konnor Griffin", "SS"],
      ["8", "Jake Mangum", "LF"],
      ["9", "Henry Davis", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-30 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "JJ Wetherholt", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Iván Herrera", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Alec Burleson", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Jordan Walker", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Nathan Church", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Pedro Pagés", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Victor Scott II", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
    ],
    propsHome: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Spencer Horwitz", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Jake Mangum", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
      { batter: "Henry Davis", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 10, PIT 5" },
    ],
  },
  {
    gameKey: "COL@CIN",
    venue: "MLB Park",
    away: "COL",
    home: "CIN",
    timeEt: "12:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — COL 4, CIN 6",
    awayScore: 4,
    homeScore: 6,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 50.00,
    impliedHomePct: 50.00,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "hr_market_integrity_degraded;market_odds_unavailable;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Michael Lorenzen vs Andrew Abbott. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Jordan Beck", "LF"],
      ["2", "Brenton Doyle", "CF"],
      ["3", "Hunter Goodman", "C"],
      ["4", "Tyler Freeman", "DH"],
      ["5", "Willi Castro", "2B"],
      ["6", "TJ Rumfield", "1B"],
      ["7", "Kyle Karros", "3B"],
      ["8", "Ezequiel Tovar", "SS"],
      ["9", "Troy Johnston", "RF"],
    ],
    homeLineup: [
      ["1", "TJ Friedl", "CF"],
      ["2", "Matt McLain", "2B"],
      ["3", "Elly De La Cruz", "SS"],
      ["4", "Sal Stewart", "3B"],
      ["5", "Nathaniel Lowe", "DH"],
      ["6", "Tyler Stephenson", "C"],
      ["7", "JJ Bleday", "LF"],
      ["8", "Spencer Steer", "1B"],
      ["9", "Will Benson", "RF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-30 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Jordan Beck", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Tyler Freeman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Willi Castro", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Kyle Karros", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Troy Johnston", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
    ],
    propsHome: [
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Nathaniel Lowe", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "JJ Bleday", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
      { batter: "Will Benson", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 4, CIN 6" },
    ],
  },
  {
    gameKey: "WSH@NYM",
    venue: "MLB Park",
    away: "WSH",
    home: "NYM",
    timeEt: "1:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — WSH 5, NYM 4",
    awayScore: 5,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 50.00,
    impliedHomePct: 50.00,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "hr_market_integrity_degraded;market_odds_unavailable;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Miles Mikolas vs Freddy Peralta. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "James Wood", "RF"],
      ["2", "Luis García Jr.", "1B"],
      ["3", "Daylen Lile", "LF"],
      ["4", "CJ Abrams", "SS"],
      ["5", "José Tena", "DH"],
      ["6", "Jorbit Vivas", "3B"],
      ["7", "Nasim Nuñez", "2B"],
      ["8", "Drew Millas", "C"],
      ["9", "Jacob Young", "CF"],
    ],
    homeLineup: [
      ["1", "Bo Bichette", "3B"],
      ["2", "Juan Soto", "DH"],
      ["3", "MJ Melendez", "LF"],
      ["4", "Mark Vientos", "1B"],
      ["5", "Brett Baty", "RF"],
      ["6", "Marcus Semien", "2B"],
      ["7", "Carson Benge", "CF"],
      ["8", "Luis Torrens", "C"],
      ["9", "Ronny Mauricio", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-30 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "James Wood", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "José Tena", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
    ],
    propsHome: [
      { batter: "Bo Bichette", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Juan Soto", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "MJ Melendez", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Brett Baty", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Marcus Semien", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Carson Benge", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Luis Torrens", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
      { batter: "Ronny Mauricio", team: "NYM", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 5, NYM 4" },
    ],
  },
  {
    gameKey: "AZ@MIL",
    venue: "MLB Park",
    away: "AZ",
    home: "MIL",
    timeEt: "1:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — AZ 1, MIL 13",
    awayScore: 1,
    homeScore: 13,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 110,
    homeAmerican: -125,
    impliedAwayPct: 46.15,
    impliedHomePct: 53.85,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "hr_market_integrity_degraded;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Michael Soroka vs Brandon Woodruff. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Geraldo Perdomo", "SS"],
      ["2", "Ketel Marte", "2B"],
      ["3", "Corbin Carroll", "RF"],
      ["4", "Adrian Del Castillo", "DH"],
      ["5", "Ildemaro Vargas", "1B"],
      ["6", "Lourdes Gurriel Jr.", "LF"],
      ["7", "Nolan Arenado", "3B"],
      ["8", "Alek Thomas", "CF"],
      ["9", "James McCann", "C"],
    ],
    homeLineup: [
      ["1", "Garrett Mitchell", "CF"],
      ["2", "Brice Turang", "2B"],
      ["3", "William Contreras", "C"],
      ["4", "Jake Bauers", "1B"],
      ["5", "Tyler Black", "DH"],
      ["6", "Luis Rengifo", "3B"],
      ["7", "Sal Frelick", "RF"],
      ["8", "Greg Jones", "LF"],
      ["9", "David Hamilton", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-30 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Geraldo Perdomo", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Ketel Marte", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "James McCann", team: "AZ", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
    ],
    propsHome: [
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Brice Turang", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "William Contreras", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Tyler Black", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Sal Frelick", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "Greg Jones", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
      { batter: "David Hamilton", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — AZ 1, MIL 13" },
    ],
  },
  {
    gameKey: "KC@ATH",
    venue: "MLB Park",
    away: "KC",
    home: "ATH",
    timeEt: "3:05 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 7th — KC 2, ATH 5",
    awayScore: 2,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 105,
    homeAmerican: -125,
    impliedAwayPct: 46.75,
    impliedHomePct: 53.25,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Noah Cameron vs Jeffrey Springs. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Maikel Garcia", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Lane Thomas", "CF"],
      ["4", "Salvador Perez", "1B"],
      ["5", "Nick Loftin", "2B"],
      ["6", "Starling Marte", "RF"],
      ["7", "Carter Jensen", "DH"],
      ["8", "Isaac Collins", "LF"],
      ["9", "Elias Díaz", "C"],
    ],
    homeLineup: [
      ["1", "Jacob Wilson", "SS"],
      ["2", "Shea Langeliers", "DH"],
      ["3", "Nick Kurtz", "1B"],
      ["4", "Colby Thomas", "RF"],
      ["5", "Darell Hernaiz", "3B"],
      ["6", "Carlos Cortes", "LF"],
      ["7", "Austin Wynns", "C"],
      ["8", "Zack Gelof", "2B"],
      ["9", "Lawrence Butler", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-30 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 0.4, tb2Pct: 15.0, tier: "HR D / TB D", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 5.5, tb2Pct: 35.7, tier: "HR D / TB A", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 13.5, tier: "HR D / TB D", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Salvador Perez", team: "KC", hrPct: 2.6, tb2Pct: 18.9, tier: "HR D / TB D", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Nick Loftin", team: "KC", hrPct: 0.4, tb2Pct: 16.3, tier: "HR D / TB D", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Starling Marte", team: "KC", hrPct: 0.4, tb2Pct: 19.2, tier: "HR D / TB D", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 3.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Carter Jensen", team: "KC", hrPct: 4.9, tb2Pct: 28.7, tier: "HR D / TB B", note: "Display only — Top 7th — KC 2, ATH 5; LHB vs LHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Elias Díaz", team: "KC", hrPct: 2.9, tb2Pct: 33.7, tier: "HR D / TB B", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Jacob Wilson", team: "ATH", hrPct: 5.4, tb2Pct: 28.2, tier: "HR D / TB B", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; limited power profile; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 14.7, tb2Pct: 52.3, tier: "HR A+ / TB A+", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+); HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 16.0, tb2Pct: 54.4, tier: "HR A+ / TB A+", note: "Display only — Top 7th — KC 2, ATH 5; LHB vs LHP; elite power indicators; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Colby Thomas", team: "ATH", hrPct: 3.6, tb2Pct: 16.6, tier: "HR D / TB D", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Darell Hernaiz", team: "ATH", hrPct: 6.9, tb2Pct: 25.4, tier: "HR C / TB C", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 17.5, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Top 7th — KC 2, ATH 5; LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+); HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Austin Wynns", team: "ATH", hrPct: 1.1, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 7.5, tb2Pct: 28.9, tier: "HR C / TB B", note: "Display only — Top 7th — KC 2, ATH 5; RHB vs LHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 7.2, tb2Pct: 26.5, tier: "HR C / TB C", note: "Display only — Top 7th — KC 2, ATH 5; LHB vs LHP; hard-contact profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "SF@PHI",
    venue: "MLB Park",
    away: "SF",
    home: "PHI",
    timeEt: "5:35 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -145,
    impliedAwayPct: 43.51,
    impliedHomePct: 56.49,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "PASS",
    decisionTier: "data_blocked",
    edgeOnPickPct: 0.00,
    modelConfidence: "data_blocked",
    analystConfidence: "Low",
    flags: "market_moneyline_missing;market_total_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: TBD vs TBD. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Heliot Ramos", "LF"],
      ["2", "Matt Chapman", "3B"],
      ["3", "Luis Arraez", "2B"],
      ["4", "Casey Schmitt", "1B"],
      ["5", "Rafael Devers", "DH"],
      ["6", "Willy Adames", "SS"],
      ["7", "Jung Hoo Lee", "RF"],
      ["8", "Eric Haase", "C"],
      ["9", "Drew Gilbert", "CF"],
    ],
    homeLineup: [
      ["1", "Trea Turner", "SS"],
      ["2", "Kyle Schwarber", "LF"],
      ["3", "Bryce Harper", "DH"],
      ["4", "Adolis García", "RF"],
      ["5", "Bryson Stott", "2B"],
      ["6", "Alec Bohm", "3B"],
      ["7", "Justin Crawford", "CF"],
      ["8", "Felix Reyes", "1B"],
      ["9", "Garrett Stubbs", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-30 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Heliot Ramos", team: "SF", hrPct: 6.5, tb2Pct: 35.2, tier: "HR C / TB A", note: "Display only — Yet to begin; RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.4, tb2Pct: 7.1, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 6.1, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 6.1, tb2Pct: 32.3, tier: "HR C / TB B", note: "Display only — Yet to begin; RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Rafael Devers", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Willy Adames", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 0.4, tb2Pct: 23.6, tier: "HR D / TB C", note: "Display only — Yet to begin; LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Eric Haase", team: "SF", hrPct: 3.9, tb2Pct: 40.4, tier: "HR D / TB A", note: "Display only — Yet to begin; RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 1.1, tb2Pct: 16.5, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs LHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Trea Turner", team: "PHI", hrPct: 3.5, tb2Pct: 20.3, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 12.7, tb2Pct: 40.0, tier: "HR A / TB A", note: "Display only — Yet to begin; LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 10.1, tb2Pct: 40.5, tier: "HR B / TB A", note: "Display only — Yet to begin; LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Adolis García", team: "PHI", hrPct: 6.5, tb2Pct: 29.5, tier: "HR C / TB B", note: "Display only — Yet to begin; RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Bryson Stott", team: "PHI", hrPct: 3.5, tb2Pct: 23.4, tier: "HR D / TB C", note: "Display only — Yet to begin; LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.6, tb2Pct: 9.2, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Justin Crawford", team: "PHI", hrPct: 1.0, tb2Pct: 11.5, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Felix Reyes", team: "PHI", hrPct: 5.6, tb2Pct: 18.6, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Garrett Stubbs", team: "PHI", hrPct: 3.0, tb2Pct: 21.2, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "TOR@MIN",
    venue: "MLB Park",
    away: "TOR",
    home: "MIN",
    timeEt: "7:40 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -135,
    homeAmerican: 115,
    impliedAwayPct: 55.26,
    impliedHomePct: 44.74,
    modelAwayPct: 56.47,
    modelHomePct: 43.53,
    edgeAwayPct: 1.21,
    edgeHomePct: -1.21,
    prediction: "TOR",
    decisionTier: "C",
    edgeOnPickPct: 1.21,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Kevin Gausman vs Bailey Ober. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "George Springer", "DH"],
      ["2", "Jesús Sánchez", "RF"],
      ["3", "Vladimir Guerrero Jr.", "1B"],
      ["4", "Kazuma Okamoto", "3B"],
      ["5", "Daulton Varsho", "CF"],
      ["6", "Ernie Clement", "2B"],
      ["7", "Yohendrick Pinango", "LF"],
      ["8", "Andrés Giménez", "SS"],
      ["9", "Brandon Valenzuela", "C"],
    ],
    homeLineup: [
      ["1", "Byron Buxton", "CF"],
      ["2", "Trevor Larnach", "LF"],
      ["3", "Ryan Jeffers", "C"],
      ["4", "Josh Bell", "DH"],
      ["5", "Austin Martin", "RF"],
      ["6", "Kody Clemens", "1B"],
      ["7", "Luke Keaschall", "2B"],
      ["8", "Brooks Lee", "SS"],
      ["9", "Royce Lewis", "3B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-30 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "George Springer", team: "TOR", hrPct: 1.2, tb2Pct: 20.5, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 5.5, tb2Pct: 29.7, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 4.5, tb2Pct: 33.4, tier: "HR D / TB B", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 4.9, tb2Pct: 25.3, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Daulton Varsho", team: "TOR", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.4, tb2Pct: 16.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Yohendrick Pinango", team: "TOR", hrPct: 0.4, tb2Pct: 21.5, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 0.4, tb2Pct: 12.9, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Brandon Valenzuela", team: "TOR", hrPct: 2.4, tb2Pct: 15.2, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 4.5, tb2Pct: 23.8, tier: "HR D / TB C", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 0.4, tb2Pct: 16.9, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Ryan Jeffers", team: "MIN", hrPct: 3.5, tb2Pct: 27.7, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Josh Bell", team: "MIN", hrPct: 0.4, tb2Pct: 7.8, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Austin Martin", team: "MIN", hrPct: 0.4, tb2Pct: 13.6, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Kody Clemens", team: "MIN", hrPct: 3.4, tb2Pct: 22.8, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 0.6, tb2Pct: 15.2, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Royce Lewis", team: "MIN", hrPct: 0.9, tb2Pct: 12.0, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
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

function formatAmerican(value: number | null): string {
  if (value === null) return "NA";
  return value > 0 ? `+${value}` : String(value);
}

function GameCard({ g }: { g: SlateGame }) {
  const ml = `${g.away} ${formatAmerican(g.awayAmerican)} / ${g.home} ${formatAmerican(g.homeAmerican)}`;
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

export default function Apr30Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 30, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-30
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
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,game_status_bucket,game_state,game_state_detail,game_status_note,away_score,home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,raw_model_away_win_pct,raw_model_home_win_pct,final_away_win_pct,final_home_win_pct,market_blend_alpha,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary,scoring_status
2026-04-30,DET,ATL,12:15 PM,Framber Valdez,Bryce Elder,,,,,,64F / 8 mph wind / 0% precip / Open,63.6,8.3,0,0.404,0.460,0.600,0.504,final,Final,Final,"Final — DET 5, ATL 2",5,2,Partial,hr_market_integrity_degraded|market_odds_unavailable,50.00,50.00,,,,,,,,,,,not_scored,,not_scored,hr_market_integrity_degraded;market_odds_unavailable,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Framber Valdez vs Bryce Elder. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-30,STL,PIT,12:35 PM,Hunter Dobbins,Paul Skenes,,,,,,48F / 10 mph wind / 1% precip / Open,48.2,10.3,1,0.355,0.383,0.574,0.473,final,Final,Final,"Final — STL 10, PIT 5",10,5,Partial,hr_market_integrity_degraded|market_odds_unavailable,50.00,50.00,,,,,,,,,,,not_scored,,not_scored,hr_market_integrity_degraded;market_odds_unavailable,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Hunter Dobbins vs Paul Skenes. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-30,COL,CIN,12:40 PM,Michael Lorenzen,Andrew Abbott,,,,,,56F / 9 mph wind / 0% precip / Open,55.9,9.2,0,0.422,0.394,0.470,0.638,final,Final,Final,"Final — COL 4, CIN 6",4,6,Partial,hr_market_integrity_degraded|market_odds_unavailable,50.00,50.00,,,,,,,,,,,not_scored,,not_scored,hr_market_integrity_degraded;market_odds_unavailable,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Michael Lorenzen vs Andrew Abbott. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-30,WSH,NYM,1:10 PM,Miles Mikolas,Freddy Peralta,,,,,,55F / 3 mph wind / 0% precip / Open,54.8,3.1,0,0.373,0.414,0.439,0.458,final,Final,Final,"Final — WSH 5, NYM 4",5,4,Partial,hr_market_integrity_degraded|market_odds_unavailable,50.00,50.00,,,,,,,,,,,not_scored,,not_scored,hr_market_integrity_degraded;market_odds_unavailable,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Miles Mikolas vs Freddy Peralta. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-30,AZ,MIL,1:40 PM,Michael Soroka,Brandon Woodruff,110,-125,,,,45F / 12 mph wind / 3% precip / Retractable,45.2,11.9,3,0.390,0.472,0.592,0.413,final,Final,Final,"Final — AZ 1, MIL 13",1,13,Partial,hr_market_integrity_degraded,46.15,53.85,,,,,,,,,,,not_scored,,not_scored,hr_market_integrity_degraded,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Michael Soroka vs Brandon Woodruff. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-30,KC,ATH,3:05 PM,Noah Cameron,Jeffrey Springs,105,-125,,,,75F / 3 mph wind / 0% precip / Open,74.7,3.4,0,0.359,0.447,0.579,0.545,live,Live,In Progress,"Top 7th — KC 2, ATH 5",2,5,Partial,rotowire_hr_home_side_missing,46.75,53.25,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Noah Cameron vs Jeffrey Springs. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-30,SF,PHI,5:35 PM,Adrian Houser,Tim Mayza,120,-144,8.5,-110,-110,60F / 5 mph wind / 3% precip / Open,59.8,5.0,3,0.519,0.541,0.536,0.428,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,market_moneyline_missing|market_total_missing,43.51,56.49,,,,,,,,,,PASS,data_blocked,,data_blocked,market_moneyline_missing;market_total_missing,Low,"Auto-generated live scaffold from MLB schedule + market odds: TBD vs TBD. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
2026-04-30,TOR,MIN,7:40 PM,Kevin Gausman,Bailey Ober,-135,115,8.0,-105,-105,48F / 6 mph wind / 1% precip / Open,48.2,5.9,1,0.472,0.373,0.542,0.481,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,55.26,44.74,67.34,32.66,56.47,43.53,0.10,56.47,43.53,1.21,-1.21,TOR,C,1.21,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Kevin Gausman vs Bailey Ober. Run compute to refresh lineups, weather, and model outputs before staking.",scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,hr_market_integrity,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-30,DET@ATL,DET,Kevin McGonigle,Bryce Elder,,,,,NA,,1.5,150,,0.676,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,DET,Gleyber Torres,Bryce Elder,,,,,NA,,1.5,300,,0.475,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,DET,Colt Keith,Bryce Elder,,,,,NA,,1.5,150,,0.433,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,DET,Riley Greene,Bryce Elder,,,,,NA,,1.5,150,,0.858,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,DET,Spencer Torkelson,Bryce Elder,,,,,NA,,1.5,250,,0.831,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,DET,Kerry Carpenter,Bryce Elder,,,,,NA,,1.5,150,,0.813,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,DET,Matt Vierling,Bryce Elder,,,,,NA,,1.5,150,,0.383,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,DET,Hao-Yu  Lee,Bryce Elder,,,,,NA,,1.5,150,,0.574,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,DET,Jake Rogers,Bryce Elder,,,,,NA,,1.5,150,,0.354,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Ronald Acuña Jr.,Framber Valdez,,,,,NA,,1.5,150,,0.469,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Drake Baldwin,Framber Valdez,,,,,NA,,1.5,150,,0.566,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Ozzie Albies,Framber Valdez,,,,,NA,,1.5,350,,0.791,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Matt Olson,Framber Valdez,,,,,NA,,1.5,150,,0.827,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Austin Riley,Framber Valdez,,,,,NA,,1.5,150,,0.405,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Mauricio Dubón,Framber Valdez,,,,,NA,,1.5,150,,0.314,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Kyle Farmer,Framber Valdez,,,,,NA,,1.5,150,,0.425,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Jorge Mateo,Framber Valdez,,,,,NA,,1.5,150,,0.180,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,DET@ATL,ATL,Eli White,Framber Valdez,,,,,NA,,1.5,150,,0.562,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,JJ Wetherholt,Paul Skenes,,,,,NA,,1.5,550,,0.698,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,Iván Herrera,Paul Skenes,,,,,NA,,1.5,150,,0.792,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,Alec Burleson,Paul Skenes,,,,,NA,,1.5,250,,0.578,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,Jordan Walker,Paul Skenes,,,,,NA,,1.5,450,,0.325,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,Nolan Gorman,Paul Skenes,,,,,NA,,1.5,150,,0.500,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,Masyn Winn,Paul Skenes,,,,,NA,,1.5,100,,0.577,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,Nathan Church,Paul Skenes,,,,,NA,,1.5,150,,0.724,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,Pedro Pagés,Paul Skenes,,,,,NA,,1.5,250,,0.740,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,STL,Victor Scott II,Paul Skenes,,,,,NA,,1.5,100,,0.233,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Oneil Cruz,Hunter Dobbins,,,,,NA,,1.5,150,,0.579,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Brandon Lowe,Hunter Dobbins,,,,,NA,,1.5,300,,0.407,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Bryan Reynolds,Hunter Dobbins,,,,,NA,,1.5,450,,0.293,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Ryan O'Hearn,Hunter Dobbins,,,,,NA,,1.5,150,,0.609,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Nick Gonzales,Hunter Dobbins,,,,,NA,,1.5,150,,0.572,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Spencer Horwitz,Hunter Dobbins,,,,,NA,,1.5,100,,0.646,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Konnor Griffin,Hunter Dobbins,,,,,NA,,1.5,150,,0.531,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Jake Mangum,Hunter Dobbins,,,,,NA,,1.5,150,,0.438,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,STL@PIT,PIT,Henry Davis,Hunter Dobbins,,,,,NA,,1.5,150,,0.180,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,Jordan Beck,Andrew Abbott,,,,,NA,,1.5,150,,0.274,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,Brenton Doyle,Andrew Abbott,,,,,NA,,1.5,150,,0.388,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,Hunter Goodman,Andrew Abbott,,,,,NA,,1.5,150,,0.950,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,Tyler Freeman,Andrew Abbott,,,,,NA,,1.5,450,,0.418,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,Willi Castro,Andrew Abbott,,,,,NA,,1.5,100,,0.612,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,TJ Rumfield,Andrew Abbott,,,,,NA,,1.5,150,,0.489,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,Kyle Karros,Andrew Abbott,,,,,NA,,1.5,150,,0.396,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,Ezequiel Tovar,Andrew Abbott,,,,,NA,,1.5,150,,0.180,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,COL,Troy Johnston,Andrew Abbott,,,,,NA,,1.5,100,,0.520,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,TJ Friedl,Michael Lorenzen,,,,,NA,,1.5,450,,0.459,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,Matt McLain,Michael Lorenzen,,,,,NA,,1.5,150,,0.546,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,Elly De La Cruz,Michael Lorenzen,,,,,NA,,1.5,250,,0.732,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,Sal Stewart,Michael Lorenzen,,,,,NA,,1.5,150,,0.512,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,Nathaniel Lowe,Michael Lorenzen,,,,,NA,,1.5,550,,0.944,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,Tyler Stephenson,Michael Lorenzen,,,,,NA,,1.5,150,,0.298,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,JJ Bleday,Michael Lorenzen,,,,,NA,,1.5,150,,0.950,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,Spencer Steer,Michael Lorenzen,,,,,NA,,1.5,150,,0.614,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,COL@CIN,CIN,Will Benson,Michael Lorenzen,,,,,NA,,1.5,100,,0.683,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,James Wood,Freddy Peralta,,,,,NA,,1.5,100,,0.758,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,Luis García Jr.,Freddy Peralta,,,,,NA,,1.5,250,,0.337,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,Daylen Lile,Freddy Peralta,,,,,NA,,1.5,150,,0.665,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,CJ Abrams,Freddy Peralta,,,,,NA,,1.5,150,,0.367,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,José Tena,Freddy Peralta,,,,,NA,,1.5,150,,0.535,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,Jorbit Vivas,Freddy Peralta,,,,,NA,,1.5,150,,0.381,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,Nasim Nuñez,Freddy Peralta,,,,,NA,,1.5,100,,0.297,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,Drew Millas,Freddy Peralta,,,,,NA,,1.5,100,,0.317,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,WSH,Jacob Young,Freddy Peralta,,,,,NA,,1.5,150,,0.296,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,Bo Bichette,Miles Mikolas,,,,,NA,,1.5,150,,0.444,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,Juan Soto,Miles Mikolas,,,,,NA,,1.5,150,,0.757,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,MJ Melendez,Miles Mikolas,,,,,NA,,1.5,550,,0.561,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,Mark Vientos,Miles Mikolas,,,,,NA,,1.5,250,,0.484,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,Brett Baty,Miles Mikolas,,,,,NA,,1.5,150,,0.508,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,Marcus Semien,Miles Mikolas,,,,,NA,,1.5,150,,0.436,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,Carson Benge,Miles Mikolas,,,,,NA,,1.5,150,,0.454,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,Luis Torrens,Miles Mikolas,,,,,NA,,1.5,150,,0.208,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,WSH@NYM,NYM,Ronny Mauricio,Miles Mikolas,,,,,NA,,1.5,100,,0.269,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,Geraldo Perdomo,Brandon Woodruff,,,,,NA,,1.5,150,,0.760,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,Ketel Marte,Brandon Woodruff,,,,,NA,,1.5,150,,0.491,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,Corbin Carroll,Brandon Woodruff,,,,,NA,,1.5,350,,0.612,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,Adrian Del Castillo,Brandon Woodruff,,,,,NA,,1.5,150,,0.394,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,Ildemaro Vargas,Brandon Woodruff,,,,,NA,,1.5,200,,0.923,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,Lourdes Gurriel Jr.,Brandon Woodruff,,,,,NA,,1.5,250,,0.227,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,Nolan Arenado,Brandon Woodruff,,,,,NA,,1.5,100,,0.950,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,Alek Thomas,Brandon Woodruff,,,,,NA,,1.5,100,,0.791,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,AZ,James McCann,Brandon Woodruff,,,,,NA,,1.5,150,,0.180,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,Garrett Mitchell,Michael Soroka,,,,,NA,,1.5,250,,0.393,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,Brice Turang,Michael Soroka,,,,,NA,,1.5,250,,0.514,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,William Contreras,Michael Soroka,,,,,NA,,1.5,750,,0.300,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,Jake Bauers,Michael Soroka,,,,,NA,,1.5,150,,0.472,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,Tyler Black,Michael Soroka,,,,,NA,,1.5,150,,0.519,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,Luis Rengifo,Michael Soroka,,,,,NA,,1.5,250,,0.445,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,Sal Frelick,Michael Soroka,,,,,NA,,1.5,150,,0.485,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,Greg Jones,Michael Soroka,,,,,NA,,1.5,150,,0.180,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,AZ@MIL,MIL,David Hamilton,Michael Soroka,,,,,NA,,1.5,150,,0.407,0,,,,,,not_scored,degraded,not_scored,Display only,partial,not_scored
2026-04-30,KC@ATH,KC,Maikel Garcia,Jeffrey Springs,0.40,14.98,+24900,+568,NA,,1.5,600,0.69,0.353,0,D,D,D,,,unpriced,partial,priced_below_prob_gate,Display only,partial,not_scored
2026-04-30,KC@ATH,KC,Bobby Witt Jr.,Jeffrey Springs,5.50,35.73,+1718,+180,1400,-1.16,1.5,500,19.06,0.744,0,A,D,A,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-30,KC@ATH,KC,Lane Thomas,Jeffrey Springs,0.40,13.54,+24900,+638,2800,-3.05,1.5,850,3.02,0.611,0,D,D,D,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-30,KC@ATH,KC,Salvador Perez,Jeffrey Springs,2.63,18.88,+3699,+430,950,-6.89,1.5,135,-23.67,0.587,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-30,KC@ATH,KC,Nick Loftin,Jeffrey Springs,0.40,16.32,+24900,+513,2000,-4.36,1.5,475,-1.07,0.498,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-30,KC@ATH,KC,Starling Marte,Jeffrey Springs,0.40,19.21,+24900,+420,2000,-4.36,3.5,265,,0.461,0,D,D,D,,,priced_no_edge,partial,line_mismatch_3.5,Display only,partial,not_scored
2026-04-30,KC@ATH,KC,Carter Jensen,Jeffrey Springs,4.90,28.72,+1942,+248,1350,-2.00,1.5,500,12.06,0.714,0,B,D,B,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-30,KC@ATH,KC,Isaac Collins,Jeffrey Springs,0.40,6.00,+24900,+1567,2500,-3.45,1.5,308,-18.51,0.430,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-30,KC@ATH,KC,Elias Díaz,Jeffrey Springs,2.87,33.74,+3388,+196,2400,-1.13,1.5,800,22.63,0.813,0,B,D,B,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-30,KC@ATH,ATH,Jacob Wilson,Noah Cameron,5.43,28.24,+1741,+254,NA,,2.5,120,,0.556,0,B,D,B,,,unpriced,partial,line_mismatch_2.5,Display only,partial,not_scored
2026-04-30,KC@ATH,ATH,Shea Langeliers,Noah Cameron,14.69,52.33,+581,-110,NA,,1.5,450,34.15,0.637,0,A+,A+,A+,2+ TB,A+,unpriced,partial,qualified,Display only,partial,not_scored
2026-04-30,KC@ATH,ATH,Nick Kurtz,Noah Cameron,15.96,54.43,+526,-119,NA,,2.5,210,,0.796,0,A+,A+,A+,,,unpriced,partial,line_mismatch_2.5,Display only,partial,not_scored
2026-04-30,KC@ATH,ATH,Colby Thomas,Noah Cameron,3.56,16.58,+2708,+503,NA,,1.5,600,2.29,0.396,0,D,D,D,,,unpriced,partial,priced_below_prob_gate,Display only,partial,not_scored
2026-04-30,KC@ATH,ATH,Darell Hernaiz,Noah Cameron,6.87,25.42,+1355,+293,NA,,2.5,275,,0.502,0,C,C,C,,,unpriced,partial,line_mismatch_2.5,Display only,partial,not_scored
2026-04-30,KC@ATH,ATH,Carlos Cortes,Noah Cameron,17.54,55.00,+470,-122,NA,,1.5,322,31.30,0.950,0,A+,A+,A+,2+ TB,A+,unpriced,partial,qualified,Display only,partial,not_scored
2026-04-30,KC@ATH,ATH,Austin Wynns,Noah Cameron,1.06,6.00,+9333,+1567,NA,,1.5,800,-5.11,0.180,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-30,KC@ATH,ATH,Zack Gelof,Noah Cameron,7.52,28.95,+1230,+245,NA,,1.5,350,6.72,0.486,0,B,C,B,,,unpriced,partial,priced_below_prob_gate,Display only,partial,not_scored
2026-04-30,KC@ATH,ATH,Lawrence Butler,Noah Cameron,7.15,26.47,+1298,+278,NA,,1.5,375,5.42,0.397,0,C,C,C,,,unpriced,partial,priced_below_prob_gate,Display only,partial,not_scored
2026-04-30,SF@PHI,SF,Heliot Ramos,Tim Mayza,6.52,35.18,+1434,+184,430,-12.35,1.5,118,-10.70,0.837,0,A,C,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,SF,Matt Chapman,Tim Mayza,0.40,7.10,+24900,+1309,589,-14.11,1.5,160,-31.36,0.430,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,SF,Luis Arraez,Tim Mayza,0.40,6.09,+24900,+1541,1540,-5.70,1.5,120,-39.36,0.404,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,SF,Casey Schmitt,Tim Mayza,6.12,32.26,+1535,+210,418,-13.19,1.5,140,-9.41,0.690,0,B,C,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,SF,Rafael Devers,Tim Mayza,0.40,6.00,+24900,+1567,391,-19.97,1.5,150,-34.00,0.279,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,SF,Willy Adames,Tim Mayza,0.40,6.00,+24900,+1567,544,-15.13,1.5,158,-32.76,0.180,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,SF,Jung Hoo Lee,Tim Mayza,0.40,23.57,+24900,+324,1020,-8.53,1.5,172,-13.20,0.740,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,SF,Eric Haase,Tim Mayza,3.93,40.36,+2447,+148,860,-6.49,1.5,225,9.60,0.708,0,A,D,A,,,priced_no_edge,full,priced_below_prob_gate,Display only,full,data_blocked
2026-04-30,SF@PHI,SF,Drew Gilbert,Tim Mayza,1.13,16.46,+8745,+507,850,-9.40,1.5,254,-11.78,0.555,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Trea Turner,Adrian Houser,3.50,20.32,+2761,+392,660,-9.66,1.5,110,-27.30,0.447,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Kyle Schwarber,Adrian Houser,12.69,40.00,+688,+150,280,-13.63,1.5,120,-5.46,0.550,0,A,A,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Bryce Harper,Adrian Houser,10.12,40.49,+888,+147,377,-10.85,1.5,110,-7.13,0.618,0,A,B,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Adolis García,Adrian Houser,6.53,29.53,+1431,+239,461,-11.30,1.5,136,-12.85,0.494,0,B,C,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Bryson Stott,Adrian Houser,3.52,23.35,+2745,+328,800,-7.60,1.5,154,-16.02,0.391,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Alec Bohm,Adrian Houser,0.59,9.16,+16837,+992,890,-9.51,1.5,155,-30.06,0.276,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Justin Crawford,Adrian Houser,1.01,11.50,+9847,+770,1040,-7.77,1.5,185,-23.59,0.276,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Felix Reyes,Adrian Houser,5.57,18.58,+1696,+438,810,-5.42,1.5,176,-17.65,0.416,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,SF@PHI,PHI,Garrett Stubbs,Adrian Houser,2.97,21.20,+3264,+372,1280,-4.27,1.5,255,-6.97,0.384,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-30,TOR@MIN,TOR,George Springer,Bailey Ober,1.15,20.49,+8562,+388,474,-16.27,1.5,110,-27.13,0.658,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,TOR,Jesús Sánchez,Bailey Ober,5.51,29.74,+1715,+236,458,-12.41,1.5,130,-13.74,0.542,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,TOR,Vladimir Guerrero Jr.,Bailey Ober,4.46,33.39,+2142,+199,490,-12.49,1.5,100,-16.61,0.661,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,TOR,Kazuma Okamoto,Bailey Ober,4.89,25.28,+1946,+296,564,-10.17,1.5,158,-13.48,0.593,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,TOR,Daulton Varsho,Bailey Ober,0.40,6.00,+24900,+1567,515,-15.86,1.5,135,-36.55,0.271,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,TOR,Ernie Clement,Bailey Ober,0.40,15.96,+24900,+526,1100,-7.93,1.5,130,-27.52,0.619,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,TOR,Yohendrick Pinango,Bailey Ober,0.40,21.52,+24900,+365,720,-11.80,1.5,171,-15.38,0.518,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,TOR,Andrés Giménez,Bailey Ober,0.40,12.88,+24900,+676,840,-10.24,1.5,158,-25.88,0.455,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,TOR,Brandon Valenzuela,Bailey Ober,2.41,15.22,+4044,+557,790,-8.82,1.5,194,-18.79,0.560,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Byron Buxton,Kevin Gausman,4.54,23.76,+2104,+321,363,-17.06,1.5,115,-22.76,0.633,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Trevor Larnach,Kevin Gausman,0.40,16.87,+24900,+493,780,-10.96,1.5,162,-21.30,0.506,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Ryan Jeffers,Kevin Gausman,3.54,27.73,+2722,+261,640,-9.97,1.5,151,-12.11,0.607,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Josh Bell,Kevin Gausman,0.40,7.80,+24900,+1181,730,-11.65,1.5,140,-33.86,0.276,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Austin Martin,Kevin Gausman,0.40,13.56,+24900,+637,1160,-7.54,1.5,202,-19.55,0.502,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Kody Clemens,Kevin Gausman,3.38,22.83,+2856,+338,531,-12.47,1.5,175,-13.53,0.521,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Luke Keaschall,Kevin Gausman,0.40,6.00,+24900,+1567,1320,-6.64,1.5,184,-29.21,0.329,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Brooks Lee,Kevin Gausman,0.61,15.22,+16264,+557,1160,-7.33,1.5,199,-18.23,0.577,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-30,TOR@MIN,MIN,Royce Lewis,Kevin Gausman,0.92,11.98,+10725,+735,571,-13.98,1.5,172,-24.79,0.378,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
<!-- batter-outlooks-csv:end -->
*/
