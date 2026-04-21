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
    gameKey: "DET@BOS",
    venue: "MLB Park",
    away: "DET",
    home: "BOS",
    timeEt: "11:10 AM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — DET 6, BOS 8",
    awayScore: 6,
    homeScore: 8,
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
    flags: "market_odds_unavailable;rotowire_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Jack Flaherty vs Sonny Gray. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Kevin McGonigle", "SS"],
      ["2", "Gleyber Torres", "2B"],
      ["3", "Colt Keith", "1B"],
      ["4", "Riley Greene", "LF"],
      ["5", "Dillon Dingler", "DH"],
      ["6", "Kerry Carpenter", "RF"],
      ["7", "Matt Vierling", "CF"],
      ["8", "Hao-Yu  Lee", "3B"],
      ["9", "Jake Rogers", "C"],
    ],
    homeLineup: [
      ["1", "Roman Anthony", "LF"],
      ["2", "Willson Contreras", "1B"],
      ["3", "Wilyer Abreu", "RF"],
      ["4", "Masataka Yoshida", "DH"],
      ["5", "Trevor Story", "SS"],
      ["6", "Jarren Duran", "CF"],
      ["7", "Caleb Durbin", "3B"],
      ["8", "Marcelo Mayer", "2B"],
      ["9", "Carlos Narváez", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Kevin McGonigle", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Colt Keith", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Riley Greene", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Dillon Dingler", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Kerry Carpenter", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Matt Vierling", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Hao-Yu  Lee", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Jake Rogers", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Masataka Yoshida", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Jarren Duran", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Marcelo Mayer", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
      { batter: "Carlos Narváez", team: "BOS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — DET 6, BOS 8" },
    ],
  },
  {
    gameKey: "HOU@CLE",
    venue: "MLB Park",
    away: "HOU",
    home: "CLE",
    timeEt: "6:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — HOU 9, CLE 2",
    awayScore: 9,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 41.55,
    impliedHomePct: 58.45,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Spencer Arrighetti vs Slade Cecconi. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Carlos Correa", "SS"],
      ["2", "Yordan Alvarez", "DH"],
      ["3", "Jose Altuve", "2B"],
      ["4", "Christian Walker", "1B"],
      ["5", "Isaac Paredes", "3B"],
      ["6", "Taylor Trammell", "CF"],
      ["7", "Yainer Diaz", "C"],
      ["8", "Dustin Harris", "RF"],
      ["9", "Brice Matthews", "LF"],
    ],
    homeLineup: [
      ["1", "Steven Kwan", "CF"],
      ["2", "Chase DeLauter", "RF"],
      ["3", "José Ramírez", "3B"],
      ["4", "Kyle Manzardo", "1B"],
      ["5", "Rhys Hoskins", "DH"],
      ["6", "George Valera", "LF"],
      ["7", "Juan Brito", "2B"],
      ["8", "Bo Naylor", "C"],
      ["9", "Brayan Rocchio", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Carlos Correa", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Jose Altuve", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Christian Walker", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Dustin Harris", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Brice Matthews", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "José Ramírez", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "George Valera", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Juan Brito", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Bo Naylor", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — HOU 9, CLE 2" },
    ],
  },
  {
    gameKey: "CIN@TB",
    venue: "MLB Park",
    away: "CIN",
    home: "TB",
    timeEt: "6:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — CIN 6, TB 1",
    awayScore: 6,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 50.89,
    impliedHomePct: 49.11,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Rhett Lowder vs Jesse Scholtens. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
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
      ["1", "Chandler Simpson", "LF"],
      ["2", "Junior Caminero", "3B"],
      ["3", "Jonathan Aranda", "1B"],
      ["4", "Yandy Díaz", "DH"],
      ["5", "Jake Fraley", "RF"],
      ["6", "Cedric Mullins", "CF"],
      ["7", "Nick Fortes", "C"],
      ["8", "Richie Palacios", "2B"],
      ["9", "Taylor Walls", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
    ],
    propsHome: [
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Junior Caminero", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Jake Fraley", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Nick Fortes", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Richie Palacios", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — CIN 6, TB 1" },
    ],
  },
  {
    gameKey: "STL@MIA",
    venue: "MLB Park",
    away: "STL",
    home: "MIA",
    timeEt: "6:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — STL 3, MIA 5",
    awayScore: 3,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 48.56,
    impliedHomePct: 51.44,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Michael McGreevy vs Max Meyer. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "JJ Wetherholt", "2B"],
      ["2", "Iván Herrera", "C"],
      ["3", "Alec Burleson", "1B"],
      ["4", "Jordan Walker", "RF"],
      ["5", "Nolan Gorman", "DH"],
      ["6", "Masyn Winn", "SS"],
      ["7", "Ramón Urías", "3B"],
      ["8", "Thomas Saggese", "LF"],
      ["9", "Victor Scott II", "CF"],
    ],
    homeLineup: [
      ["1", "Jakob Marsee", "CF"],
      ["2", "Kyle Stowers", "LF"],
      ["3", "Otto Lopez", "SS"],
      ["4", "Xavier Edwards", "2B"],
      ["5", "Liam Hicks", "DH"],
      ["6", "Agustín Ramírez", "C"],
      ["7", "Owen Caissie", "RF"],
      ["8", "Graham Pauley", "3B"],
      ["9", "Connor Norby", "1B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "JJ Wetherholt", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Iván Herrera", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Alec Burleson", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Jordan Walker", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Ramón Urías", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Thomas Saggese", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Victor Scott II", team: "STL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Kyle Stowers", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Graham Pauley", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
      { batter: "Connor Norby", team: "MIA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — STL 3, MIA 5" },
    ],
  },
  {
    gameKey: "ATL@WSH",
    venue: "MLB Park",
    away: "ATL",
    home: "WSH",
    timeEt: "6:45 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — ATL 9, WSH 4",
    awayScore: 9,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 58.32,
    impliedHomePct: 41.68,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Bryce Elder vs Jake Irvin. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Ronald Acuña Jr.", "RF"],
      ["2", "Drake Baldwin", "C"],
      ["3", "Matt Olson", "1B"],
      ["4", "Austin Riley", "3B"],
      ["5", "Ozzie Albies", "2B"],
      ["6", "Michael Harris II", "CF"],
      ["7", "Dominic Smith", "DH"],
      ["8", "Jorge Mateo", "SS"],
      ["9", "Mike Yastrzemski", "LF"],
    ],
    homeLineup: [
      ["1", "James Wood", "RF"],
      ["2", "Luis García Jr.", "1B"],
      ["3", "Brady House", "3B"],
      ["4", "CJ Abrams", "SS"],
      ["5", "Daylen Lile", "LF"],
      ["6", "Jacob Young", "CF"],
      ["7", "José Tena", "DH"],
      ["8", "Drew Millas", "C"],
      ["9", "Nasim Nuñez", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Matt Olson", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Austin Riley", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Michael Harris II", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Dominic Smith", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Jorge Mateo", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Mike Yastrzemski", team: "ATL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Brady House", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "José Tena", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATL 9, WSH 4" },
    ],
  },
  {
    gameKey: "BAL@KC",
    venue: "MLB Park",
    away: "BAL",
    home: "KC",
    timeEt: "7:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — BAL 7, KC 5",
    awayScore: 7,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -115,
    homeAmerican: -105,
    impliedAwayPct: 46.63,
    impliedHomePct: 53.37,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Kyle Bradish vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Gunnar Henderson", "SS"],
      ["2", "Taylor Ward", "LF"],
      ["3", "Dylan Beavers", "DH"],
      ["4", "Pete Alonso", "1B"],
      ["5", "Samuel Basallo", "C"],
      ["6", "Jeremiah Jackson", "2B"],
      ["7", "Colton Cowser", "RF"],
      ["8", "Leody Taveras", "CF"],
      ["9", "Blaze Alexander", "3B"],
    ],
    homeLineup: [
      ["1", "Maikel Garcia", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Vinnie Pasquantino", "1B"],
      ["4", "Salvador Perez", "DH"],
      ["5", "Carter Jensen", "C"],
      ["6", "Michael Massey", "2B"],
      ["7", "Jac Caglianone", "RF"],
      ["8", "Isaac Collins", "LF"],
      ["9", "Kyle Isbel", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Colton Cowser", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Blaze Alexander", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
    ],
    propsHome: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Salvador Perez", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Carter Jensen", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 7, KC 5" },
    ],
  },
  {
    gameKey: "PHI@CHC",
    venue: "MLB Park",
    away: "PHI",
    home: "CHC",
    timeEt: "7:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — PHI 1, CHC 5",
    awayScore: 1,
    homeScore: 5,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -105,
    homeAmerican: -115,
    impliedAwayPct: 46.10,
    impliedHomePct: 53.90,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Aaron Nola vs Colin Rea. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Trea Turner", "SS"],
      ["2", "Kyle Schwarber", "DH"],
      ["3", "Bryce Harper", "1B"],
      ["4", "Adolis García", "RF"],
      ["5", "Brandon Marsh", "LF"],
      ["6", "Alec Bohm", "3B"],
      ["7", "Bryson Stott", "2B"],
      ["8", "Justin Crawford", "CF"],
      ["9", "Rafael Marchán", "C"],
    ],
    homeLineup: [
      ["1", "Nico Hoerner", "2B"],
      ["2", "Michael Busch", "1B"],
      ["3", "Alex Bregman", "3B"],
      ["4", "Ian Happ", "LF"],
      ["5", "Moisés Ballesteros", "DH"],
      ["6", "Michael Conforto", "RF"],
      ["7", "Miguel Amaya", "C"],
      ["8", "Pete Crow-Armstrong", "CF"],
      ["9", "Dansby Swanson", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Adolis García", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Bryson Stott", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Justin Crawford", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Rafael Marchán", team: "PHI", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Ian Happ", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Michael Conforto", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Miguel Amaya", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — PHI 1, CHC 5" },
    ],
  },
  {
    gameKey: "LAD@COL",
    venue: "MLB Park",
    away: "LAD",
    home: "COL",
    timeEt: "8:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — LAD 12, COL 3",
    awayScore: 12,
    homeScore: 3,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -220,
    homeAmerican: 184,
    impliedAwayPct: 66.13,
    impliedHomePct: 33.87,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Justin Wrobleski vs Jose Quintana. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Shohei Ohtani", "DH"],
      ["2", "Alex Call", "RF"],
      ["3", "Will Smith", "C"],
      ["4", "Teoscar Hernández", "LF"],
      ["5", "Andy Pages", "CF"],
      ["6", "Max Muncy", "3B"],
      ["7", "Miguel Rojas", "SS"],
      ["8", "Santiago Espinal", "2B"],
      ["9", "Dalton Rushing", "1B"],
    ],
    homeLineup: [
      ["1", "Jordan Beck", "LF"],
      ["2", "Brenton Doyle", "CF"],
      ["3", "Hunter Goodman", "DH"],
      ["4", "Tyler Freeman", "RF"],
      ["5", "Ezequiel Tovar", "SS"],
      ["6", "Troy Johnston", "1B"],
      ["7", "Willi Castro", "2B"],
      ["8", "Kyle Karros", "3B"],
      ["9", "Brett Sullivan", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Alex Call", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Will Smith", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Andy Pages", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Max Muncy", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Miguel Rojas", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Santiago Espinal", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
    ],
    propsHome: [
      { batter: "Jordan Beck", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Tyler Freeman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Troy Johnston", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Willi Castro", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Kyle Karros", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
      { batter: "Brett Sullivan", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAD 12, COL 3" },
    ],
  },
  {
    gameKey: "TOR@LAA",
    venue: "MLB Park",
    away: "TOR",
    home: "LAA",
    timeEt: "9:38 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TOR 5, LAA 2",
    awayScore: 5,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -116,
    homeAmerican: -102,
    impliedAwayPct: 48.66,
    impliedHomePct: 51.34,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Dylan Cease vs Reid Detmers. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Davis Schneider", "LF"],
      ["2", "Ernie Clement", "SS"],
      ["3", "Vladimir Guerrero Jr.", "1B"],
      ["4", "Eloy Jiménez", "DH"],
      ["5", "Kazuma Okamoto", "3B"],
      ["6", "Lenyn Sosa", "2B"],
      ["7", "Daulton Varsho", "CF"],
      ["8", "Myles Straw", "RF"],
      ["9", "Tyler Heineman", "C"],
    ],
    homeLineup: [
      ["1", "Zach Neto", "SS"],
      ["2", "Mike Trout", "CF"],
      ["3", "Nolan Schanuel", "1B"],
      ["4", "Jorge Soler", "DH"],
      ["5", "Yoán Moncada", "3B"],
      ["6", "Jo Adell", "RF"],
      ["7", "Josh Lowe", "LF"],
      ["8", "Logan O'Hoppe", "C"],
      ["9", "Adam Frazier", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Davis Schneider", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Eloy Jiménez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Lenyn Sosa", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Daulton Varsho", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Myles Straw", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Tyler Heineman", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
    ],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Mike Trout", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Jo Adell", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 5, LAA 2" },
    ],
  },
  {
    gameKey: "ATH@SEA",
    venue: "MLB Park",
    away: "ATH",
    home: "SEA",
    timeEt: "9:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — ATH 6, SEA 4",
    awayScore: 6,
    homeScore: 4,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -142,
    impliedAwayPct: 40.19,
    impliedHomePct: 59.81,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: J.T. Ginn vs Emerson Hancock. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Nick Kurtz", "1B"],
      ["2", "Shea Langeliers", "C"],
      ["3", "Carlos Cortes", "DH"],
      ["4", "Tyler Soderstrom", "LF"],
      ["5", "Jacob Wilson", "SS"],
      ["6", "Jeff McNeil", "2B"],
      ["7", "Max Muncy", "3B"],
      ["8", "Lawrence Butler", "RF"],
      ["9", "Zack Gelof", "CF"],
    ],
    homeLineup: [
      ["1", "J.P. Crawford", "SS"],
      ["2", "Cal Raleigh", "C"],
      ["3", "Julio Rodríguez", "CF"],
      ["4", "Josh Naylor", "1B"],
      ["5", "Randy Arozarena", "LF"],
      ["6", "Luke Raley", "DH"],
      ["7", "Dominic Canzone", "RF"],
      ["8", "Cole Young", "2B"],
      ["9", "Leo Rivas", "3B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-20 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Nick Kurtz", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Max Muncy", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
    ],
    propsHome: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Luke Raley", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — ATH 6, SEA 4" },
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

export default function Apr20Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 20, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-20
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
2026-04-20,DET,BOS,11:10 AM,Jack Flaherty,Sonny Gray,,,,,,43F / 2 mph wind / 1% precip / Open,43.4,2.0,1,0.416,0.455,0.468,0.406,final,Final,Final,"Final — DET 6, BOS 8",6,8,Partial,market_odds_unavailable|rotowire_missing,50.00,50.00,,,,,,,,,,,not_scored,,not_scored,market_odds_unavailable;rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Jack Flaherty vs Sonny Gray. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,HOU,CLE,6:10 PM,Spencer Arrighetti,Slade Cecconi,132,-154,8.5,-125,105,38F / 1 mph wind / 0% precip / Open,37.6,1.3,0,0.342,0.331,0.439,0.507,final,Final,Final,"Final — HOU 9, CLE 2",9,2,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,41.55,58.45,,,,,,,,,,,not_scored,,not_scored,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Spencer Arrighetti vs Slade Cecconi. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,CIN,TB,6:40 PM,Rhett Lowder,Jesse Scholtens,-112,-104,7.5,-120,100,Live weather via compute,,,,0.370,0.354,0.421,0.475,final,Final,Final,"Final — CIN 6, TB 1",6,1,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,50.89,49.11,,,,,,,,,,,not_scored,,not_scored,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Rhett Lowder vs Jesse Scholtens. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,STL,MIA,6:40 PM,Michael McGreevy,Max Meyer,-102,-115,8.5,-120,100,73F / 10 mph wind / 33% precip / Retractable,73.2,10.5,33,0.283,0.425,0.506,0.511,final,Final,Final,"Final — STL 3, MIA 5",3,5,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,48.56,51.44,,,,,,,,,,,not_scored,,not_scored,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Michael McGreevy vs Max Meyer. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,ATL,WSH,6:45 PM,Bryce Elder,Jake Irvin,-152,132,8.5,-115,-105,50F / 9 mph wind / 0% precip / Open,49.8,9.3,0,0.472,0.325,0.608,0.487,final,Final,Final,"Final — ATL 9, WSH 4",9,4,Partial,rotowire_lineup_mismatch|starter_mismatch_rotowire,58.32,41.68,,,,,,,,,,,not_scored,,not_scored,rotowire_lineup_mismatch;starter_mismatch_rotowire,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Bryce Elder vs Jake Irvin. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,BAL,KC,7:40 PM,Kyle Bradish,Seth Lugo,106,-125,9.0,-105,-115,72F / 14 mph wind / 0% precip / Open,71.8,14.0,0,0.470,0.305,0.476,0.369,final,Final,Final,"Final — BAL 7, KC 5",7,5,Partial,rotowire_unconfirmed|starter_mismatch_rotowire,46.63,53.37,,,,,,,,,,,not_scored,,not_scored,rotowire_unconfirmed;starter_mismatch_rotowire,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Kyle Bradish vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,PHI,CHC,7:40 PM,Aaron Nola,Colin Rea,109,-127,8.5,-115,-105,48F / 9 mph wind / 0% precip / Open,47.9,9.0,0,0.466,0.413,0.429,0.553,final,Final,Final,"Final — PHI 1, CHC 5",1,5,Partial,rotowire_unconfirmed|starter_mismatch_rotowire,46.10,53.90,,,,,,,,,,,not_scored,,not_scored,rotowire_unconfirmed;starter_mismatch_rotowire,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Aaron Nola vs Colin Rea. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,LAD,COL,8:40 PM,Justin Wrobleski,Jose Quintana,-220,184,,,,76F / 8 mph wind / 0% precip / Open,75.8,7.9,0,0.353,0.359,0.610,0.514,final,Final,Final,"Final — LAD 12, COL 3",12,3,Partial,rotowire_missing,66.13,33.87,,,,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Justin Wrobleski vs Jose Quintana. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,TOR,LAA,9:38 PM,Dylan Cease,Reid Detmers,-102,-114,9.5,-105,-115,67F / 9 mph wind / 0% precip / Open,67.0,8.7,0,0.425,0.386,0.481,0.593,final,Final,Final,"Final — TOR 5, LAA 2",5,2,Partial,rotowire_unconfirmed|starter_mismatch_rotowire,48.66,51.34,,,,,,,,,,,not_scored,,not_scored,rotowire_unconfirmed;starter_mismatch_rotowire,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Dylan Cease vs Reid Detmers. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,ATH,SEA,9:40 PM,J.T. Ginn,Emerson Hancock,139,-165,8.0,-105,-115,67F / 2 mph wind / 3% precip / Retractable,66.7,2.3,3,0.398,0.392,0.480,0.470,final,Final,Final,"Final — ATH 6, SEA 4",6,4,Partial,rotowire_unconfirmed|starter_mismatch_rotowire,40.19,59.81,,,,,,,,,,,not_scored,,not_scored,rotowire_unconfirmed;starter_mismatch_rotowire,Medium,"Auto-generated live scaffold from MLB schedule + market odds: J.T. Ginn vs Emerson Hancock. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-20,DET@BOS,DET,Kevin McGonigle,Sonny Gray,,,,,NA,,,,,0.618,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,DET,Gleyber Torres,Sonny Gray,,,,,NA,,,,,0.375,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,DET,Colt Keith,Sonny Gray,,,,,NA,,,,,0.387,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,DET,Riley Greene,Sonny Gray,,,,,NA,,,,,0.522,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,DET,Dillon Dingler,Sonny Gray,,,,,NA,,,,,0.814,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,DET,Kerry Carpenter,Sonny Gray,,,,,NA,,,,,0.711,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,DET,Matt Vierling,Sonny Gray,,,,,NA,,,,,0.430,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,DET,Hao-Yu  Lee,Sonny Gray,,,,,NA,,,,,0.180,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,DET,Jake Rogers,Sonny Gray,,,,,NA,,,,,0.180,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Roman Anthony,Jack Flaherty,,,,,NA,,,,,0.389,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Willson Contreras,Jack Flaherty,,,,,NA,,,,,0.865,30,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Wilyer Abreu,Jack Flaherty,,,,,NA,,,,,0.297,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Masataka Yoshida,Jack Flaherty,,,,,NA,,,,,0.537,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Trevor Story,Jack Flaherty,,,,,NA,,,,,0.470,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Jarren Duran,Jack Flaherty,,,,,NA,,,,,0.327,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Caleb Durbin,Jack Flaherty,,,,,NA,,,,,0.375,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Marcelo Mayer,Jack Flaherty,,,,,NA,,,,,0.212,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,DET@BOS,BOS,Carlos Narváez,Jack Flaherty,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,HOU@CLE,HOU,Carlos Correa,Slade Cecconi,,,,,588,,1.5,120,,0.427,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,HOU,Yordan Alvarez,Slade Cecconi,,,,,298,,1.5,-103,,0.912,4,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,HOU,Jose Altuve,Slade Cecconi,,,,,525,,1.5,124,,0.492,7,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,HOU,Christian Walker,Slade Cecconi,,,,,512,,1.5,143,,0.455,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,HOU,Isaac Paredes,Slade Cecconi,,,,,588,,0.5,-158,,0.256,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Taylor Trammell,Slade Cecconi,,,,,NA,,,,,0.523,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,HOU@CLE,HOU,Yainer Diaz,Slade Cecconi,,,,,700,,1.5,150,,0.308,7,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,HOU,Dustin Harris,Slade Cecconi,,,,,900,,0.5,-122,,0.396,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Brice Matthews,Slade Cecconi,,,,,775,,0.5,102,,0.180,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Steven Kwan,Spencer Arrighetti,,,,,950,,1.5,131,,0.409,8,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,CLE,Chase DeLauter,Spencer Arrighetti,,,,,385,,1.5,120,,0.366,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,CLE,José Ramírez,Spencer Arrighetti,,,,,342,,1.5,101,,0.873,7,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,CLE,Kyle Manzardo,Spencer Arrighetti,,,,,380,,0.5,-148,,0.536,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Rhys Hoskins,Spencer Arrighetti,,,,,NA,,1.5,150,,0.413,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,George Valera,Spencer Arrighetti,,,,,520,,1.5,135,,0.479,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,HOU@CLE,CLE,Juan Brito,Spencer Arrighetti,,,,,NA,,1.5,150,,0.310,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Bo Naylor,Spencer Arrighetti,,,,,NA,,1.5,50,,0.463,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Brayan Rocchio,Spencer Arrighetti,,,,,900,,0.5,-134,,0.713,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,TJ Friedl,Jesse Scholtens,,,,,NA,,,,,0.272,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,CIN@TB,CIN,Matt McLain,Jesse Scholtens,,,,,600,,1.5,140,,0.285,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,CIN@TB,CIN,Elly De La Cruz,Jesse Scholtens,,,,,538,,1.5,135,,0.682,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,CIN@TB,CIN,Sal Stewart,Jesse Scholtens,,,,,395,,1.5,111,,0.707,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,CIN@TB,CIN,Eugenio Suárez,Jesse Scholtens,,,,,415,,0.5,-153,,0.523,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Spencer Steer,Jesse Scholtens,,,,,550,,0.5,-157,,0.492,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Tyler Stephenson,Jesse Scholtens,,,,,600,,0.5,-150,,0.456,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Rece Hinds,Jesse Scholtens,,,,,550,,0.5,-130,,0.189,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Ke'Bryan Hayes,Jesse Scholtens,,,,,750,,0.5,-140,,0.180,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Chandler Simpson,Rhett Lowder,,,,,12400,,1.5,138,,0.406,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,CIN@TB,TB,Junior Caminero,Rhett Lowder,,,,,312,,1.5,128,,0.671,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,CIN@TB,TB,Jonathan Aranda,Rhett Lowder,,,,,575,,0.5,-164,,0.441,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Yandy Díaz,Rhett Lowder,,,,,650,,1.5,143,,0.511,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,CIN@TB,TB,Jake Fraley,Rhett Lowder,,,,,800,,0.5,-124,,0.411,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Cedric Mullins,Rhett Lowder,,,,,625,,0.5,-120,,0.539,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Nick Fortes,Rhett Lowder,,,,,NA,,1.5,100,,0.452,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Richie Palacios,Rhett Lowder,,,,,875,,0.5,-104,,0.508,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Taylor Walls,Rhett Lowder,,,,,1025,,0.5,107,,0.332,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,JJ Wetherholt,Max Meyer,,,,,562,,1.5,132,,0.515,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,STL,Iván Herrera,Max Meyer,,,,,575,,1.5,114,,0.466,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,STL,Alec Burleson,Max Meyer,,,,,430,,1.5,0,,0.623,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,STL,Jordan Walker,Max Meyer,,,,,395,,1.5,106,,0.889,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,STL,Nolan Gorman,Max Meyer,,,,,430,,0.5,-160,,0.389,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,Masyn Winn,Max Meyer,,,,,775,,1.5,152,,0.533,2,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,STL,Ramón Urías,Max Meyer,,,,,NA,,,,,0.539,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,STL@MIA,STL,Thomas Saggese,Max Meyer,,,,,NA,,,,,0.411,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,STL@MIA,STL,Victor Scott II,Max Meyer,,,,,1025,,0.5,-133,,0.190,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Jakob Marsee,Michael McGreevy,,,,,825,,1.5,140,,0.308,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,MIA,Kyle Stowers,Michael McGreevy,,,,,445,,1.5,122,,0.950,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,MIA,Otto Lopez,Michael McGreevy,,,,,950,,1.5,120,,0.697,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,MIA,Xavier Edwards,Michael McGreevy,,,,,1025,,1.5,128,,0.431,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,MIA,Liam Hicks,Michael McGreevy,,,,,875,,1.5,145,,0.549,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,MIA,Agustín Ramírez,Michael McGreevy,,,,,675,,1.5,140,,0.438,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,STL@MIA,MIA,Owen Caissie,Michael McGreevy,,,,,725,,0.5,-134,,0.343,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Graham Pauley,Michael McGreevy,,,,,875,,0.5,-124,,0.246,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Connor Norby,Michael McGreevy,,,,,850,,0.5,-164,,0.634,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Ronald Acuña Jr.,Jake Irvin,,,,,375,,1.5,101,,0.572,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,ATL,Drake Baldwin,Jake Irvin,,,,,512,,1.5,105,,0.516,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,ATL,Matt Olson,Jake Irvin,,,,,405,,1.5,128,,0.699,19,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,ATL,Austin Riley,Jake Irvin,,,,,420,,1.5,114,,0.686,11,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,ATL,Ozzie Albies,Jake Irvin,,,,,480,,1.5,108,,0.580,15,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,ATL,Michael Harris II,Jake Irvin,,,,,550,,1.5,132,,0.905,22,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,ATL,Dominic Smith,Jake Irvin,,,,,NA,,,,,0.782,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,ATL@WSH,ATL,Jorge Mateo,Jake Irvin,,,,,700,,1.5,50,,0.425,2,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,ATL,Mike Yastrzemski,Jake Irvin,,,,,NA,,,,,0.309,14,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,ATL@WSH,WSH,James Wood,Bryce Elder,,,,,362,,1.5,132,,0.907,9,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,WSH,Luis García Jr.,Bryce Elder,,,,,570,,1.5,144,,0.180,15,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,WSH,Brady House,Bryce Elder,,,,,NA,,1.5,150,,0.376,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,CJ Abrams,Bryce Elder,,,,,588,,1.5,138,,0.775,20,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,WSH,Daylen Lile,Bryce Elder,,,,,720,,1.5,138,,0.476,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATL@WSH,WSH,Jacob Young,Bryce Elder,,,,,1025,,0.5,-192,,0.484,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,José Tena,Bryce Elder,,,,,825,,0.5,-132,,0.549,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,Drew Millas,Bryce Elder,,,,,850,,0.5,-128,,0.392,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,Nasim Nuñez,Bryce Elder,,,,,925,,0.5,-124,,0.248,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,BAL@KC,BAL,Gunnar Henderson,Seth Lugo,,,,,525,,1.5,109,,0.646,9,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Taylor Ward,Seth Lugo,,,,,405,,1.5,2,,0.548,10,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Dylan Beavers,Seth Lugo,,,,,NA,,,,,0.210,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,BAL@KC,BAL,Pete Alonso,Seth Lugo,,,,,365,,1.5,114,,0.439,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Samuel Basallo,Seth Lugo,,,,,500,,1.5,120,,0.454,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Jeremiah Jackson,Seth Lugo,,,,,625,,1.5,130,,0.912,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Colton Cowser,Seth Lugo,,,,,NA,,,,,0.192,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,BAL@KC,BAL,Leody Taveras,Seth Lugo,,,,,NA,,,,,0.635,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,BAL@KC,BAL,Blaze Alexander,Seth Lugo,,,,,700,,0.5,-139,,0.245,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Maikel Garcia,Kyle Bradish,,,,,580,,1.5,-2,,0.406,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Bobby Witt Jr.,Kyle Bradish,,,,,385,,1.5,-118,,0.518,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Vinnie Pasquantino,Kyle Bradish,,,,,450,,1.5,120,,0.350,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Salvador Perez,Kyle Bradish,,,,,385,,1.5,122,,0.217,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Carter Jensen,Kyle Bradish,,,,,550,,0.5,-169,,0.740,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Michael Massey,Kyle Bradish,,,,,575,,0.5,-168,,0.291,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Jac Caglianone,Kyle Bradish,,,,,600,,0.5,-152,,0.439,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Isaac Collins,Kyle Bradish,,,,,750,,0.5,-137,,0.180,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Kyle Isbel,Kyle Bradish,,,,,825,,0.5,-152,,0.180,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Trea Turner,Colin Rea,,,,,415,,1.5,-106,,0.463,21,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,PHI@CHC,PHI,Kyle Schwarber,Colin Rea,,,,,250,,0.5,-146,,0.749,18,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Bryce Harper,Colin Rea,,,,,420,,1.5,120,,0.836,17,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,PHI@CHC,PHI,Adolis García,Colin Rea,,,,,345,,1.5,120,,0.268,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,PHI@CHC,PHI,Brandon Marsh,Colin Rea,,,,,700,,0.5,-104,,0.418,12,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Alec Bohm,Colin Rea,,,,,550,,1.5,134,,0.180,14,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,PHI@CHC,PHI,Bryson Stott,Colin Rea,,,,,NA,,,,,0.290,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,PHI@CHC,PHI,Justin Crawford,Colin Rea,,,,,NA,,1.5,260,,0.477,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Rafael Marchán,Colin Rea,,,,,900,,0.5,-156,,0.180,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Nico Hoerner,Aaron Nola,,,,,800,,1.5,100,,0.705,21,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,PHI@CHC,CHC,Michael Busch,Aaron Nola,,,,,700,,0.5,-148,,0.197,12,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Alex Bregman,Aaron Nola,,,,,462,,1.5,124,,0.390,14,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,PHI@CHC,CHC,Ian Happ,Aaron Nola,,,,,500,,0.5,-161,,0.673,25,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Moisés Ballesteros,Aaron Nola,,,,,NA,,,,,0.950,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,PHI@CHC,CHC,Michael Conforto,Aaron Nola,,,,,NA,,,,,0.720,60,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,PHI@CHC,CHC,Miguel Amaya,Aaron Nola,,,,,600,,0.5,-135,,0.299,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Pete Crow-Armstrong,Aaron Nola,,,,,775,,0.5,-137,,0.420,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Dansby Swanson,Aaron Nola,,,,,575,,0.5,-156,,0.624,72,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,LAD@COL,LAD,Shohei Ohtani,Jose Quintana,,,,,NA,,,,,0.693,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,LAD,Alex Call,Jose Quintana,,,,,NA,,,,,0.450,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,LAD,Will Smith,Jose Quintana,,,,,NA,,,,,0.465,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,LAD,Teoscar Hernández,Jose Quintana,,,,,NA,,,,,0.640,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,LAD,Andy Pages,Jose Quintana,,,,,NA,,,,,0.633,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,LAD,Max Muncy,Jose Quintana,,,,,NA,,,,,0.782,16,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,LAD,Miguel Rojas,Jose Quintana,,,,,NA,,,,,0.646,20,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,LAD,Santiago Espinal,Jose Quintana,,,,,NA,,,,,0.231,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,LAD,Dalton Rushing,Jose Quintana,,,,,NA,,,,,0.950,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Jordan Beck,Justin Wrobleski,,,,,NA,,,,,0.407,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Brenton Doyle,Justin Wrobleski,,,,,NA,,,,,0.505,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Hunter Goodman,Justin Wrobleski,,,,,NA,,,,,0.828,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Tyler Freeman,Justin Wrobleski,,,,,NA,,,,,0.389,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Ezequiel Tovar,Justin Wrobleski,,,,,NA,,,,,0.382,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Troy Johnston,Justin Wrobleski,,,,,NA,,,,,0.692,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Willi Castro,Justin Wrobleski,,,,,NA,,,,,0.568,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Kyle Karros,Justin Wrobleski,,,,,NA,,,,,0.470,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,LAD@COL,COL,Brett Sullivan,Justin Wrobleski,,,,,NA,,,,,0.387,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,TOR@LAA,TOR,Davis Schneider,Reid Detmers,,,,,NA,,,,,0.313,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,TOR@LAA,TOR,Ernie Clement,Reid Detmers,,,,,1100,,1.5,118,,0.496,9,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,TOR,Vladimir Guerrero Jr.,Reid Detmers,,,,,440,,1.5,100,,0.575,11,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,TOR,Eloy Jiménez,Reid Detmers,,,,,600,,1.5,140,,0.427,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,TOR,Kazuma Okamoto,Reid Detmers,,,,,625,,0.5,-167,,0.404,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,TOR@LAA,TOR,Lenyn Sosa,Reid Detmers,,,,,NA,,,,,0.463,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,TOR@LAA,TOR,Daulton Varsho,Reid Detmers,,,,,345,,1.5,110,,0.837,3,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,TOR,Myles Straw,Reid Detmers,,,,,900,,1.5,150,,0.586,14,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,TOR,Tyler Heineman,Reid Detmers,,,,,925,,0.5,-144,,0.225,1,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,TOR@LAA,LAA,Zach Neto,Dylan Cease,,,,,345,,1.5,100,,0.560,8,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,LAA,Mike Trout,Dylan Cease,,,,,338,,1.5,118,,0.836,12,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,LAA,Nolan Schanuel,Dylan Cease,,,,,NA,,0.5,-165,,0.308,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,TOR@LAA,LAA,Jorge Soler,Dylan Cease,,,,,355,,1.5,125,,0.896,30,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,LAA,Yoán Moncada,Dylan Cease,,,,,700,,1.5,174,,0.565,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,LAA,Jo Adell,Dylan Cease,,,,,338,,1.5,-110,,0.652,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,LAA,Josh Lowe,Dylan Cease,,,,,NA,,,,,0.536,10,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,TOR@LAA,LAA,Logan O'Hoppe,Dylan Cease,,,,,430,,1.5,140,,0.428,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,TOR@LAA,LAA,Adam Frazier,Dylan Cease,,,,,NA,,,,,0.560,20,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,ATH@SEA,ATH,Nick Kurtz,Emerson Hancock,,,,,370,,1.5,130,,0.612,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATH@SEA,ATH,Shea Langeliers,Emerson Hancock,,,,,430,,1.5,136,,0.574,8,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATH@SEA,ATH,Carlos Cortes,Emerson Hancock,,,,,900,,0.5,-154,,0.451,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATH@SEA,ATH,Tyler Soderstrom,Emerson Hancock,,,,,538,,1.5,149,,0.486,8,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATH@SEA,ATH,Jacob Wilson,Emerson Hancock,,,,,1000,,1.5,151,,0.485,5,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATH@SEA,ATH,Jeff McNeil,Emerson Hancock,,,,,725,,1.5,140,,0.530,2,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATH@SEA,ATH,Max Muncy,Emerson Hancock,,,,,900,,1.5,226,,0.409,2,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATH@SEA,ATH,Lawrence Butler,Emerson Hancock,,,,,625,,0.5,-122,,0.373,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATH@SEA,ATH,Zack Gelof,Emerson Hancock,,,,,NA,,,,,0.402,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,ATH@SEA,SEA,J.P. Crawford,J.T. Ginn,,,,,800,,0.5,-127,,0.510,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATH@SEA,SEA,Cal Raleigh,J.T. Ginn,,,,,275,,0.5,-143,,0.416,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATH@SEA,SEA,Julio Rodríguez,J.T. Ginn,,,,,390,,1.5,134,,0.494,6,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATH@SEA,SEA,Josh Naylor,J.T. Ginn,,,,,600,,1.5,155,,0.415,0,,,,,,not_scored,not_scored,Display only,full,not_scored
2026-04-20,ATH@SEA,SEA,Randy Arozarena,J.T. Ginn,,,,,445,,0.5,-156,,0.588,6,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATH@SEA,SEA,Luke Raley,J.T. Ginn,,,,,NA,,,,,0.819,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,ATH@SEA,SEA,Dominic Canzone,J.T. Ginn,,,,,NA,,,,,0.449,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-20,ATH@SEA,SEA,Cole Young,J.T. Ginn,,,,,900,,0.5,-116,,0.323,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,ATH@SEA,SEA,Leo Rivas,J.T. Ginn,,,,,900,,0.5,104,,0.219,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
<!-- batter-outlooks-csv:end -->
*/
