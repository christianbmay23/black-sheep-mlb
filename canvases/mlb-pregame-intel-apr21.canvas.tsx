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
    gameKey: "HOU@CLE",
    venue: "MLB Park",
    away: "HOU",
    home: "CLE",
    timeEt: "6:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 4th — HOU 0, CLE 2",
    awayScore: 0,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 320,
    homeAmerican: -460,
    impliedAwayPct: 22.47,
    impliedHomePct: 77.53,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing;rotowire_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Ryan Weiss vs Parker Messick. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Carlos Correa", "SS"],
      ["2", "Yordan Alvarez", "DH"],
      ["3", "Jose Altuve", "2B"],
      ["4", "Christian Walker", "1B"],
      ["5", "Isaac Paredes", "3B"],
      ["6", "Cam Smith", "RF"],
      ["7", "Yainer Diaz", "C"],
      ["8", "Brice Matthews", "CF"],
      ["9", "Dustin Harris", "LF"],
    ],
    homeLineup: [
      ["1", "Steven Kwan", "CF"],
      ["2", "Chase DeLauter", "DH"],
      ["3", "José Ramírez", "3B"],
      ["4", "Kyle Manzardo", "1B"],
      ["5", "George Valera", "RF"],
      ["6", "Daniel Schneemann", "2B"],
      ["7", "Angel Martínez", "LF"],
      ["8", "Austin Hedges", "C"],
      ["9", "Brayan Rocchio", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Carlos Correa", team: "HOU", hrPct: 0.4, tb2Pct: 16.8, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; RHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 14.1, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs LHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jose Altuve", team: "HOU", hrPct: 0.4, tb2Pct: 11.7, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Christian Walker", team: "HOU", hrPct: 3.7, tb2Pct: 25.5, tier: "HR D / TB C", note: "Display only — Top 4th — HOU 0, CLE 2; RHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; RHB vs LHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Cam Smith", team: "HOU", hrPct: 1.1, tb2Pct: 15.9, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; RHB vs LHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brice Matthews", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Dustin Harris", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 9.0, tb2Pct: 32.4, tier: "HR B / TB A", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "José Ramírez", team: "CLE", hrPct: 13.9, tb2Pct: 50.6, tier: "HR A+ / TB A+", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 5.6, tb2Pct: 24.5, tier: "HR D / TB C", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "George Valera", team: "CLE", hrPct: 5.3, tb2Pct: 31.6, tier: "HR D / TB B", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 11.9, tb2Pct: 48.0, tier: "HR A / TB A+", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Angel Martínez", team: "CLE", hrPct: 8.4, tb2Pct: 35.1, tier: "HR B / TB A", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Austin Hedges", team: "CLE", hrPct: 1.8, tb2Pct: 12.0, tier: "HR D / TB D", note: "Display only — Top 4th — HOU 0, CLE 2; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 6.7, tb2Pct: 33.1, tier: "HR C / TB A", note: "Display only — Top 4th — HOU 0, CLE 2; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "CIN@TB",
    venue: "MLB Park",
    away: "CIN",
    home: "TB",
    timeEt: "6:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Middle 2nd — CIN 4, TB 0",
    awayScore: 4,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -118,
    homeAmerican: 101,
    impliedAwayPct: 52.11,
    impliedHomePct: 47.89,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing;rotowire_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Chase Burns vs Steven Matz. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Dane Myers", "CF"],
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
      ["7", "Richie Palacios", "2B"],
      ["8", "Hunter Feduccia", "C"],
      ["9", "Taylor Walls", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Dane Myers", team: "CIN", hrPct: 1.3, tb2Pct: 14.2, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.4, tb2Pct: 6.1, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 10.1, tb2Pct: 40.3, tier: "HR B / TB A+", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 14.0, tb2Pct: 49.2, tier: "HR A+ / TB A+", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 1.6, tb2Pct: 19.5, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 5.7, tb2Pct: 26.4, tier: "HR D / TB B", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 4.6, tb2Pct: 19.7, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.4, tb2Pct: 8.1, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Junior Caminero", team: "TB", hrPct: 5.2, tb2Pct: 27.7, tier: "HR D / TB B", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 2.8, tb2Pct: 19.7, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; LHB vs RHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 2.3, tb2Pct: 22.6, tier: "HR D / TB C", note: "Display only — Middle 2nd — CIN 4, TB 0; RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Jake Fraley", team: "TB", hrPct: 1.3, tb2Pct: 17.5, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.4, tb2Pct: 6.4, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Richie Palacios", team: "TB", hrPct: 1.7, tb2Pct: 21.5, tier: "HR D / TB C", note: "Display only — Middle 2nd — CIN 4, TB 0; LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Hunter Feduccia", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Middle 2nd — CIN 4, TB 0; LHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "STL@MIA",
    venue: "MLB Park",
    away: "STL",
    home: "MIA",
    timeEt: "6:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 2nd — STL 1, MIA 1",
    awayScore: 1,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -106,
    homeAmerican: -119,
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
    flags: "rotowire_hr_home_side_missing;rotowire_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Dustin May vs Chris Paddack. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
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
      ["1", "Jakob Marsee", "CF"],
      ["2", "Kyle Stowers", "LF"],
      ["3", "Otto Lopez", "SS"],
      ["4", "Xavier Edwards", "2B"],
      ["5", "Liam Hicks", "C"],
      ["6", "Agustín Ramírez", "DH"],
      ["7", "Owen Caissie", "RF"],
      ["8", "Graham Pauley", "3B"],
      ["9", "Connor Norby", "1B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "JJ Wetherholt", team: "STL", hrPct: 1.2, tb2Pct: 14.7, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 2.5, not 1.5-aligned" },
      { batter: "Iván Herrera", team: "STL", hrPct: 2.7, tb2Pct: 22.1, tier: "HR D / TB C", note: "Display only — Bottom 2nd — STL 1, MIA 1; RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Alec Burleson", team: "STL", hrPct: 6.9, tb2Pct: 36.3, tier: "HR C / TB A", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Jordan Walker", team: "STL", hrPct: 14.4, tb2Pct: 51.9, tier: "HR A+ / TB A+", note: "Display only — Bottom 2nd — STL 1, MIA 1; RHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 0.4, tb2Pct: 8.3, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.4, tb2Pct: 16.0, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Nathan Church", team: "STL", hrPct: 0.4, tb2Pct: 13.9, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Pedro Pagés", team: "STL", hrPct: 0.4, tb2Pct: 10.6, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Victor Scott II", team: "STL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Kyle Stowers", team: "MIA", hrPct: 6.0, tb2Pct: 44.5, tier: "HR C / TB A+", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 8.4, tb2Pct: 41.1, tier: "HR B / TB A+", note: "Display only — Bottom 2nd — STL 1, MIA 1; RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 3.4, tb2Pct: 28.5, tier: "HR D / TB B", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 4.9, tb2Pct: 30.7, tier: "HR D / TB B", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 2.1, tb2Pct: 17.5, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 5.2, tb2Pct: 23.0, tier: "HR D / TB C", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Graham Pauley", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 2nd — STL 1, MIA 1; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Connor Norby", team: "MIA", hrPct: 3.7, tb2Pct: 24.7, tier: "HR D / TB C", note: "Display only — Bottom 2nd — STL 1, MIA 1; RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "MIL@DET",
    venue: "MLB Park",
    away: "MIL",
    home: "DET",
    timeEt: "6:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 2nd — MIL 1, DET 0",
    awayScore: 1,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -103,
    homeAmerican: -118,
    impliedAwayPct: 48.38,
    impliedHomePct: 51.62,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing;rotowire_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Kyle Harrison vs Keider Montero. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Brice Turang", "2B"],
      ["2", "William Contreras", "C"],
      ["3", "Jake Bauers", "1B"],
      ["4", "Gary Sánchez", "DH"],
      ["5", "Garrett Mitchell", "CF"],
      ["6", "Luis Rengifo", "3B"],
      ["7", "Sal Frelick", "RF"],
      ["8", "David Hamilton", "SS"],
      ["9", "Blake Perkins", "LF"],
    ],
    homeLineup: [
      ["1", "Jahmai Jones", "DH"],
      ["2", "Gleyber Torres", "2B"],
      ["3", "Kevin McGonigle", "SS"],
      ["4", "Matt Vierling", "RF"],
      ["5", "Dillon Dingler", "C"],
      ["6", "Riley Greene", "LF"],
      ["7", "Spencer Torkelson", "1B"],
      ["8", "Hao-Yu  Lee", "3B"],
      ["9", "Javier Báez", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Brice Turang", team: "MIL", hrPct: 6.8, tb2Pct: 39.1, tier: "HR C / TB A+", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "William Contreras", team: "MIL", hrPct: 0.4, tb2Pct: 19.8, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 5.1, tb2Pct: 28.1, tier: "HR D / TB B", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 6.1, tb2Pct: 30.4, tier: "HR C / TB B", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 0.4, tb2Pct: 13.6, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Sal Frelick", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "David Hamilton", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Blake Perkins", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jahmai Jones", team: "DET", hrPct: 3.7, tb2Pct: 23.9, tier: "HR D / TB C", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Kevin McGonigle", team: "DET", hrPct: 3.9, tb2Pct: 33.9, tier: "HR D / TB A", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Matt Vierling", team: "DET", hrPct: 0.4, tb2Pct: 15.9, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Dillon Dingler", team: "DET", hrPct: 11.5, tb2Pct: 48.5, tier: "HR A / TB A+", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Riley Greene", team: "DET", hrPct: 3.2, tb2Pct: 29.1, tier: "HR D / TB B", note: "Display only — Top 2nd — MIL 1, DET 0; LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Hao-Yu  Lee", team: "DET", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Javier Báez", team: "DET", hrPct: 0.4, tb2Pct: 19.7, tier: "HR D / TB D", note: "Display only — Top 2nd — MIL 1, DET 0; RHB vs LHP; contact-driven profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "ATL@WSH",
    venue: "MLB Park",
    away: "ATL",
    home: "WSH",
    timeEt: "6:45 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 1st — ATL 0, WSH 3",
    awayScore: 0,
    homeScore: 3,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -158,
    homeAmerican: 132,
    impliedAwayPct: 58.69,
    impliedHomePct: 41.31,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing;rotowire_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Reynaldo López vs Foster Griffin. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Ronald Acuña Jr.", "RF"],
      ["2", "Drake Baldwin", "DH"],
      ["3", "Ozzie Albies", "2B"],
      ["4", "Matt Olson", "1B"],
      ["5", "Austin Riley", "3B"],
      ["6", "Mauricio Dubón", "SS"],
      ["7", "Michael Harris II", "CF"],
      ["8", "Jonah Heim", "C"],
      ["9", "Eli White", "LF"],
    ],
    homeLineup: [
      ["1", "James Wood", "RF"],
      ["2", "Luis García Jr.", "1B"],
      ["3", "Jacob Young", "CF"],
      ["4", "CJ Abrams", "SS"],
      ["5", "Daylen Lile", "LF"],
      ["6", "Nasim Nuñez", "2B"],
      ["7", "Jorbit Vivas", "3B"],
      ["8", "José Tena", "DH"],
      ["9", "Drew Millas", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 5.3, tb2Pct: 33.3, tier: "HR D / TB A", note: "Display only — Bottom 1st — ATL 0, WSH 3; RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 6.3, tb2Pct: 32.9, tier: "HR C / TB A", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 2.2, tb2Pct: 19.9, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Matt Olson", team: "ATL", hrPct: 11.4, tb2Pct: 44.9, tier: "HR A / TB A+", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Austin Riley", team: "ATL", hrPct: 5.6, tb2Pct: 29.3, tier: "HR D / TB B", note: "Display only — Bottom 1st — ATL 0, WSH 3; RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 1.7, tb2Pct: 20.4, tier: "HR D / TB C", note: "Display only — Bottom 1st — ATL 0, WSH 3; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Michael Harris II", team: "ATL", hrPct: 11.7, tb2Pct: 47.9, tier: "HR A / TB A+", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jonah Heim", team: "ATL", hrPct: 0.5, tb2Pct: 17.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Eli White", team: "ATL", hrPct: 0.4, tb2Pct: 9.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 12.8, tb2Pct: 48.9, tier: "HR A / TB A+", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.5, tb2Pct: 18.1, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 7.3, tb2Pct: 38.1, tier: "HR C / TB A+", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 1.4, tb2Pct: 22.6, tier: "HR D / TB C", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "José Tena", team: "WSH", hrPct: 0.4, tb2Pct: 17.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — ATL 0, WSH 3; LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "NYY@BOS",
    venue: "MLB Park",
    away: "NYY",
    home: "BOS",
    timeEt: "6:45 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 2nd — NYY 1, BOS 0",
    awayScore: 1,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -125,
    impliedAwayPct: 46.39,
    impliedHomePct: 53.61,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing;rotowire_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Luis Gil vs Connelly Early. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Amed Rosario", "3B"],
      ["2", "Aaron Judge", "RF"],
      ["3", "Ben Rice", "1B"],
      ["4", "Giancarlo Stanton", "DH"],
      ["5", "Cody Bellinger", "CF"],
      ["6", "Randal Grichuk", "LF"],
      ["7", "Jazz Chisholm Jr.", "2B"],
      ["8", "José Caballero", "SS"],
      ["9", "Austin Wells", "C"],
    ],
    homeLineup: [
      ["1", "Roman Anthony", "LF"],
      ["2", "Willson Contreras", "1B"],
      ["3", "Masataka Yoshida", "DH"],
      ["4", "Wilyer Abreu", "RF"],
      ["5", "Trevor Story", "SS"],
      ["6", "Ceddanne Rafaela", "CF"],
      ["7", "Marcelo Mayer", "2B"],
      ["8", "Caleb Durbin", "3B"],
      ["9", "Carlos Narváez", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Amed Rosario", team: "NYY", hrPct: 10.7, tb2Pct: 42.5, tier: "HR A / TB A+", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 16.7, tb2Pct: 52.9, tier: "HR A+ / TB A+", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Ben Rice", team: "NYY", hrPct: 18.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Top 2nd — NYY 1, BOS 0; LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 4.5, tb2Pct: 17.0, tier: "HR D / TB D", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 5.1, tb2Pct: 29.1, tier: "HR D / TB B", note: "Display only — Top 2nd — NYY 1, BOS 0; LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Randal Grichuk", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 2nd — NYY 1, BOS 0; LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "José Caballero", team: "NYY", hrPct: 0.9, tb2Pct: 17.5, tier: "HR D / TB D", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Austin Wells", team: "NYY", hrPct: 3.4, tb2Pct: 20.5, tier: "HR D / TB C", note: "Display only — Top 2nd — NYY 1, BOS 0; LHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Roman Anthony", team: "BOS", hrPct: 6.6, tb2Pct: 26.6, tier: "HR C / TB B", note: "Display only — Top 2nd — NYY 1, BOS 0; LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 12.2, tb2Pct: 44.9, tier: "HR A / TB A+", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Masataka Yoshida", team: "BOS", hrPct: 5.3, tb2Pct: 31.8, tier: "HR D / TB B", note: "Display only — Top 2nd — NYY 1, BOS 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 7.8, tb2Pct: 28.2, tier: "HR B / TB B", note: "Display only — Top 2nd — NYY 1, BOS 0; LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Trevor Story", team: "BOS", hrPct: 5.2, tb2Pct: 25.8, tier: "HR D / TB C", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 4.9, tb2Pct: 26.5, tier: "HR D / TB B", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Marcelo Mayer", team: "BOS", hrPct: 3.4, tb2Pct: 13.1, tier: "HR D / TB D", note: "Display only — Top 2nd — NYY 1, BOS 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 1.4, tb2Pct: 14.0, tier: "HR D / TB D", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Carlos Narváez", team: "BOS", hrPct: 4.2, tb2Pct: 20.4, tier: "HR D / TB C", note: "Display only — Top 2nd — NYY 1, BOS 0; RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "MIN@NYM",
    venue: "MLB Park",
    away: "MIN",
    home: "NYM",
    timeEt: "7:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "Warmup",
    gameStatusNote: "Warmup — Top 1st — MIN 0, NYM 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 139,
    homeAmerican: -161,
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
    flags: "rotowire_hr_home_side_missing;rotowire_missing;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Simeon Woods Richardson vs Nolan McLean. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Byron Buxton", "CF"],
      ["2", "Trevor Larnach", "LF"],
      ["3", "Josh Bell", "DH"],
      ["4", "Ryan Jeffers", "C"],
      ["5", "Kody Clemens", "1B"],
      ["6", "Luke Keaschall", "2B"],
      ["7", "Matt Wallner", "RF"],
      ["8", "Royce Lewis", "3B"],
      ["9", "Brooks Lee", "SS"],
    ],
    homeLineup: [
      ["1", "Marcus Semien", "2B"],
      ["2", "Francisco Lindor", "SS"],
      ["3", "Luis Robert Jr.", "CF"],
      ["4", "Bo Bichette", "3B"],
      ["5", "MJ Melendez", "DH"],
      ["6", "Francisco Alvarez", "C"],
      ["7", "Brett Baty", "RF"],
      ["8", "Mark Vientos", "1B"],
      ["9", "Carson Benge", "LF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 0.4, tb2Pct: 17.3, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 0.4, tb2Pct: 16.9, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Josh Bell", team: "MIN", hrPct: 0.4, tb2Pct: 17.4, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Ryan Jeffers", team: "MIN", hrPct: 2.4, tb2Pct: 26.4, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Kody Clemens", team: "MIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Luke Keaschall", team: "MIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Matt Wallner", team: "MIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Royce Lewis", team: "MIN", hrPct: 0.4, tb2Pct: 9.9, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 0.4, tb2Pct: 8.8, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Marcus Semien", team: "NYM", hrPct: 0.8, tb2Pct: 12.2, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Francisco Lindor", team: "NYM", hrPct: 3.6, tb2Pct: 22.3, tier: "HR D / TB C", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luis Robert Jr.", team: "NYM", hrPct: 3.4, tb2Pct: 21.6, tier: "HR D / TB C", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Bo Bichette", team: "NYM", hrPct: 2.4, tb2Pct: 19.7, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "MJ Melendez", team: "NYM", hrPct: 12.4, tb2Pct: 54.4, tier: "HR A / TB A+", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Francisco Alvarez", team: "NYM", hrPct: 8.9, tb2Pct: 35.2, tier: "HR B / TB A", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Brett Baty", team: "NYM", hrPct: 1.0, tb2Pct: 10.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 2.8, tb2Pct: 14.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Carson Benge", team: "NYM", hrPct: 0.4, tb2Pct: 7.1, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — MIN 0, NYM 0; LHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "BAL@KC",
    venue: "MLB Park",
    away: "BAL",
    home: "KC",
    timeEt: "7:40 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 109,
    homeAmerican: -125,
    impliedAwayPct: 46.63,
    impliedHomePct: 53.37,
    modelAwayPct: 48.32,
    modelHomePct: 51.68,
    edgeAwayPct: 1.69,
    edgeHomePct: -1.69,
    prediction: "KC",
    decisionTier: "D",
    edgeOnPickPct: -1.69,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Shane Baz vs Kris Bubic. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Taylor Ward", "LF"],
      ["2", "Gunnar Henderson", "SS"],
      ["3", "Adley Rutschman", "C"],
      ["4", "Pete Alonso", "DH"],
      ["5", "Jeremiah Jackson", "2B"],
      ["6", "Weston Wilson", "3B"],
      ["7", "Leody Taveras", "CF"],
      ["8", "Coby Mayo", "1B"],
      ["9", "Blaze Alexander", "RF"],
    ],
    homeLineup: [
      ["1", "Maikel Garcia", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Vinnie Pasquantino", "1B"],
      ["4", "Salvador Perez", "C"],
      ["5", "Carter Jensen", "DH"],
      ["6", "Michael Massey", "2B"],
      ["7", "Jac Caglianone", "RF"],
      ["8", "Isaac Collins", "LF"],
      ["9", "Kyle Isbel", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Taylor Ward", team: "BAL", hrPct: 4.4, tb2Pct: 30.9, tier: "HR D / TB B", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 7.8, tb2Pct: 30.5, tier: "HR C / TB B", note: "LHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Adley Rutschman", team: "BAL", hrPct: 4.1, tb2Pct: 31.6, tier: "HR D / TB B", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 4.4, tb2Pct: 22.9, tier: "HR D / TB C", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 10.0, tb2Pct: 38.7, tier: "HR B / TB A+", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Weston Wilson", team: "BAL", hrPct: 3.1, tb2Pct: 28.2, tier: "HR D / TB B", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 7.5, tb2Pct: 37.4, tier: "HR C / TB A", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Blaze Alexander", team: "BAL", hrPct: 0.4, tb2Pct: 10.9, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 2.2, tb2Pct: 19.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 3.8, tb2Pct: 30.1, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.6, tb2Pct: 7.8, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Salvador Perez", team: "KC", hrPct: 1.3, tb2Pct: 10.3, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Carter Jensen", team: "KC", hrPct: 7.4, tb2Pct: 28.4, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 6.9, tb2Pct: 34.0, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "PHI@CHC",
    venue: "MLB Park",
    away: "PHI",
    home: "CHC",
    timeEt: "7:40 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 110,
    homeAmerican: -128,
    impliedAwayPct: 45.73,
    impliedHomePct: 54.27,
    modelAwayPct: 44.79,
    modelHomePct: 55.21,
    edgeAwayPct: -0.94,
    edgeHomePct: 0.94,
    prediction: "CHC",
    decisionTier: "D",
    edgeOnPickPct: 0.94,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Jesús Luzardo vs Shota Imanaga. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Trea Turner", "SS"],
      ["2", "Kyle Schwarber", "DH"],
      ["3", "Bryce Harper", "1B"],
      ["4", "Felix Reyes", "LF"],
      ["5", "Adolis García", "RF"],
      ["6", "J.T. Realmuto", "C"],
      ["7", "Alec Bohm", "3B"],
      ["8", "Brandon Marsh", "CF"],
      ["9", "Edmundo Sosa", "2B"],
    ],
    homeLineup: [
      ["1", "Nico Hoerner", "2B"],
      ["2", "Alex Bregman", "DH"],
      ["3", "Ian Happ", "LF"],
      ["4", "Seiya Suzuki", "RF"],
      ["5", "Carson Kelly", "C"],
      ["6", "Michael Busch", "1B"],
      ["7", "Dansby Swanson", "SS"],
      ["8", "Matt Shaw", "3B"],
      ["9", "Pete Crow-Armstrong", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 9.7, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 9.1, tb2Pct: 36.7, tier: "HR B / TB A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 5.4, tb2Pct: 35.9, tier: "HR D / TB A", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Felix Reyes", team: "PHI", hrPct: 25.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Adolis García", team: "PHI", hrPct: 0.4, tb2Pct: 8.8, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "J.T. Realmuto", team: "PHI", hrPct: 0.4, tb2Pct: 13.6, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 0.4, tb2Pct: 18.1, tier: "HR D / TB D", note: "LHB vs LHP; hard-contact profile; vs tough pitcher" },
      { batter: "Edmundo Sosa", team: "PHI", hrPct: 2.2, tb2Pct: 23.7, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 2.3, tb2Pct: 24.5, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 2.0, tb2Pct: 20.9, tier: "HR D / TB C", note: "RHB vs LHP; hard-contact profile; vs tough pitcher" },
      { batter: "Ian Happ", team: "CHC", hrPct: 7.3, tb2Pct: 32.4, tier: "HR C / TB A", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Carson Kelly", team: "CHC", hrPct: 9.0, tb2Pct: 43.1, tier: "HR B / TB A+", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 7.0, tb2Pct: 30.9, tier: "HR C / TB B", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Matt Shaw", team: "CHC", hrPct: 2.7, tb2Pct: 26.2, tier: "HR D / TB B", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.4, tb2Pct: 12.2, tier: "HR D / TB D", note: "LHB vs LHP; hard-contact profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "PIT@TEX",
    venue: "MLB Park",
    away: "PIT",
    home: "TEX",
    timeEt: "8:05 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 100,
    homeAmerican: -116,
    impliedAwayPct: 48.02,
    impliedHomePct: 51.98,
    modelAwayPct: 49.67,
    modelHomePct: 50.33,
    edgeAwayPct: 1.65,
    edgeHomePct: -1.65,
    prediction: "TEX",
    decisionTier: "D",
    edgeOnPickPct: -1.65,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Carmen Mlodzinski vs Kumar Rocker. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Oneil Cruz", "CF"],
      ["2", "Ryan O'Hearn", "RF"],
      ["3", "Bryan Reynolds", "LF"],
      ["4", "Marcell Ozuna", "DH"],
      ["5", "Nick Yorke", "3B"],
      ["6", "Spencer Horwitz", "1B"],
      ["7", "Nick Gonzales", "2B"],
      ["8", "Konnor Griffin", "SS"],
      ["9", "Henry Davis", "C"],
    ],
    homeLineup: [
      ["1", "Brandon Nimmo", "RF"],
      ["2", "Wyatt Langford", "LF"],
      ["3", "Corey Seager", "SS"],
      ["4", "Jake Burger", "1B"],
      ["5", "Joc Pederson", "DH"],
      ["6", "Josh Jung", "3B"],
      ["7", "Evan Carter", "CF"],
      ["8", "Danny Jansen", "C"],
      ["9", "Josh Smith", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 10.4, tb2Pct: 41.7, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 5.2, tb2Pct: 31.5, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 3.4, tb2Pct: 24.9, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 2.7, tb2Pct: 21.9, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 1.4, tb2Pct: 20.0, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Spencer Horwitz", team: "PIT", hrPct: 0.4, tb2Pct: 14.7, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 7.9, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Henry Davis", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 4.7, tb2Pct: 29.7, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.4, tb2Pct: 16.8, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Corey Seager", team: "TEX", hrPct: 4.4, tb2Pct: 22.0, tier: "HR D / TB C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Jake Burger", team: "TEX", hrPct: 3.6, tb2Pct: 21.8, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.4, tb2Pct: 9.4, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Josh Jung", team: "TEX", hrPct: 3.4, tb2Pct: 32.1, tier: "HR D / TB A", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Evan Carter", team: "TEX", hrPct: 0.9, tb2Pct: 13.9, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Danny Jansen", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Josh Smith", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "SD@COL",
    venue: "MLB Park",
    away: "SD",
    home: "COL",
    timeEt: "8:40 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -145,
    homeAmerican: 125,
    impliedAwayPct: 57.11,
    impliedHomePct: 42.89,
    modelAwayPct: 54.86,
    modelHomePct: 45.14,
    edgeAwayPct: -2.25,
    edgeHomePct: 2.25,
    prediction: "SD",
    decisionTier: "D",
    edgeOnPickPct: -2.25,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Randy Vásquez vs Jimmy Herget. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Ramón Laureano", "LF"],
      ["2", "Fernando Tatis Jr.", "RF"],
      ["3", "Jackson Merrill", "CF"],
      ["4", "Manny Machado", "3B"],
      ["5", "Xander Bogaerts", "SS"],
      ["6", "Gavin Sheets", "1B"],
      ["7", "Miguel Andujar", "DH"],
      ["8", "Freddy Fermin", "C"],
      ["9", "Jake Cronenworth", "2B"],
    ],
    homeLineup: [
      ["1", "Edouard Julien", "2B"],
      ["2", "Mickey Moniak", "RF"],
      ["3", "Hunter Goodman", "C"],
      ["4", "TJ Rumfield", "DH"],
      ["5", "Troy Johnston", "1B"],
      ["6", "Ezequiel Tovar", "SS"],
      ["7", "Kyle Karros", "3B"],
      ["8", "Jordan Beck", "LF"],
      ["9", "Brenton Doyle", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Ramón Laureano", team: "SD", hrPct: 9.4, tb2Pct: 41.6, tier: "HR B / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 5.4, tb2Pct: 30.6, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 5.5, tb2Pct: 27.2, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Manny Machado", team: "SD", hrPct: 0.4, tb2Pct: 8.9, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 6.3, tb2Pct: 33.5, tier: "HR C / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Gavin Sheets", team: "SD", hrPct: 7.0, tb2Pct: 34.9, tier: "HR C / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 1.5, tb2Pct: 25.5, tier: "HR D / TB C", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Freddy Fermin", team: "SD", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jake Cronenworth", team: "SD", hrPct: 1.0, tb2Pct: 9.8, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Edouard Julien", team: "COL", hrPct: 6.5, tb2Pct: 33.4, tier: "HR C / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 13.0, tb2Pct: 43.4, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 11.1, tb2Pct: 39.6, tier: "HR A / TB A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 4.7, tb2Pct: 22.0, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Troy Johnston", team: "COL", hrPct: 5.3, tb2Pct: 32.2, tier: "HR D / TB A", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 4.7, tb2Pct: 28.4, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Kyle Karros", team: "COL", hrPct: 5.2, tb2Pct: 27.4, tier: "HR D / TB B", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Jordan Beck", team: "COL", hrPct: 2.4, tb2Pct: 18.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 3.4, tb2Pct: 22.8, tier: "HR D / TB C", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "TOR@LAA",
    venue: "MLB Park",
    away: "TOR",
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
    awayAmerican: -104,
    homeAmerican: -114,
    impliedAwayPct: 48.92,
    impliedHomePct: 51.08,
    modelAwayPct: 49.13,
    modelHomePct: 50.87,
    edgeAwayPct: 0.22,
    edgeHomePct: -0.22,
    prediction: "LAA",
    decisionTier: "D",
    edgeOnPickPct: -0.22,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Patrick Corbin vs Jack Kochanowicz. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Nathan Lukes", "LF"],
      ["2", "Ernie Clement", "2B"],
      ["3", "Vladimir Guerrero Jr.", "1B"],
      ["4", "Jesús Sánchez", "RF"],
      ["5", "Eloy Jiménez", "DH"],
      ["6", "Daulton Varsho", "CF"],
      ["7", "Kazuma Okamoto", "3B"],
      ["8", "Andrés Giménez", "SS"],
      ["9", "Brandon Valenzuela", "C"],
    ],
    homeLineup: [
      ["1", "Zach Neto", "SS"],
      ["2", "Mike Trout", "CF"],
      ["3", "Jo Adell", "RF"],
      ["4", "Jorge Soler", "DH"],
      ["5", "Oswald Peraza", "3B"],
      ["6", "Nolan Schanuel", "1B"],
      ["7", "Vaughn Grissom", "2B"],
      ["8", "Logan O'Hoppe", "C"],
      ["9", "Bryce Teodosio", "LF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Nathan Lukes", team: "TOR", hrPct: 0.4, tb2Pct: 11.4, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.4, tb2Pct: 16.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 6.6, tb2Pct: 38.3, tier: "HR C / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 5.0, tb2Pct: 29.7, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Eloy Jiménez", team: "TOR", hrPct: 0.6, tb2Pct: 21.1, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Daulton Varsho", team: "TOR", hrPct: 4.1, tb2Pct: 25.3, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 2.7, tb2Pct: 15.4, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 1.8, tb2Pct: 18.8, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Brandon Valenzuela", team: "TOR", hrPct: 1.6, tb2Pct: 10.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 10.5, tb2Pct: 36.8, tier: "HR A / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mike Trout", team: "LAA", hrPct: 18.8, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jo Adell", team: "LAA", hrPct: 9.5, tb2Pct: 37.3, tier: "HR B / TB A", note: "RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 12.9, tb2Pct: 40.6, tier: "HR A / TB A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 13.1, tb2Pct: 45.3, tier: "HR A / TB A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 3.6, tb2Pct: 17.1, tier: "HR D / TB D", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Vaughn Grissom", team: "LAA", hrPct: 3.8, tb2Pct: 16.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 5.8, tb2Pct: 19.4, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Bryce Teodosio", team: "LAA", hrPct: 1.2, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "ATH@SEA",
    venue: "MLB Park",
    away: "ATH",
    home: "SEA",
    timeEt: "9:40 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 138,
    homeAmerican: -164,
    impliedAwayPct: 40.09,
    impliedHomePct: 59.91,
    modelAwayPct: 45.08,
    modelHomePct: 54.92,
    edgeAwayPct: 4.99,
    edgeHomePct: -4.99,
    prediction: "SEA",
    decisionTier: "D",
    edgeOnPickPct: -4.99,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Jacob Lopez vs Luis Castillo. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      ["1", "Rob Refsnyder", "RF"],
      ["2", "Cal Raleigh", "DH"],
      ["3", "Julio Rodríguez", "CF"],
      ["4", "Josh Naylor", "1B"],
      ["5", "Randy Arozarena", "LF"],
      ["6", "J.P. Crawford", "SS"],
      ["7", "Mitch Garver", "C"],
      ["8", "Cole Young", "2B"],
      ["9", "Leo Rivas", "3B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Nick Kurtz", team: "ATH", hrPct: 13.1, tb2Pct: 46.8, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 11.3, tb2Pct: 43.6, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 9.2, tb2Pct: 40.5, tier: "HR B / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 6.2, tb2Pct: 28.4, tier: "HR C / TB B", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 2.8, tb2Pct: 20.5, tier: "HR D / TB C", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jeff McNeil", team: "ATH", hrPct: 3.3, tb2Pct: 26.0, tier: "HR D / TB B", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Max Muncy", team: "ATH", hrPct: 7.8, tb2Pct: 32.7, tier: "HR C / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 5.1, tb2Pct: 24.4, tier: "HR D / TB C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 1.0, tb2Pct: 8.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Rob Refsnyder", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 0.5, tb2Pct: 9.5, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 0.5, tb2Pct: 16.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.4, tb2Pct: 14.1, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 2.9, tb2Pct: 22.9, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "J.P. Crawford", team: "SEA", hrPct: 2.1, tb2Pct: 18.9, tier: "HR D / TB D", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Mitch Garver", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.4, tb2Pct: 7.8, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "CWS@AZ",
    venue: "MLB Park",
    away: "CWS",
    home: "AZ",
    timeEt: "9:40 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 129,
    homeAmerican: -149,
    impliedAwayPct: 41.70,
    impliedHomePct: 58.30,
    modelAwayPct: 40.37,
    modelHomePct: 59.63,
    edgeAwayPct: -1.33,
    edgeHomePct: 1.33,
    prediction: "AZ",
    decisionTier: "C",
    edgeOnPickPct: 1.33,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Sean Burke vs Merrill Kelly. Run compute to refresh lineups, weather, and model outputs before staking.",
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
      ["1", "Ketel Marte", "2B"],
      ["2", "Corbin Carroll", "RF"],
      ["3", "Geraldo Perdomo", "SS"],
      ["4", "Adrian Del Castillo", "C"],
      ["5", "Lourdes Gurriel Jr.", "LF"],
      ["6", "Jose Fernandez", "DH"],
      ["7", "Nolan Arenado", "3B"],
      ["8", "Ildemaro Vargas", "1B"],
      ["9", "Alek Thomas", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 4.0, tb2Pct: 26.9, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 13.6, tb2Pct: 46.8, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 1.5, tb2Pct: 12.3, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 5.0, tb2Pct: 24.3, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 9.9, tb2Pct: 45.2, tier: "HR B / TB A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 0.4, tb2Pct: 16.4, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Tristan Peters", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Reese McGuire", team: "CWS", hrPct: 0.4, tb2Pct: 8.1, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Ketel Marte", team: "AZ", hrPct: 7.3, tb2Pct: 32.7, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 7.5, tb2Pct: 38.9, tier: "HR C / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Geraldo Perdomo", team: "AZ", hrPct: 0.4, tb2Pct: 8.5, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 4.8, tb2Pct: 30.2, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jose Fernandez", team: "AZ", hrPct: 2.8, tb2Pct: 23.8, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 1.7, tb2Pct: 14.6, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 4.5, tb2Pct: 32.6, tier: "HR D / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 1.0, tb2Pct: 16.1, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "LAD@SF",
    venue: "MLB Park",
    away: "LAD",
    home: "SF",
    timeEt: "9:45 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -184,
    homeAmerican: 154,
    impliedAwayPct: 62.34,
    impliedHomePct: 37.66,
    modelAwayPct: 57.88,
    modelHomePct: 42.12,
    edgeAwayPct: -4.46,
    edgeHomePct: 4.46,
    prediction: "LAD",
    decisionTier: "D",
    edgeOnPickPct: -4.46,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Yoshinobu Yamamoto vs Landen Roupp. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Shohei Ohtani", "DH"],
      ["2", "Kyle Tucker", "RF"],
      ["3", "Freddie Freeman", "1B"],
      ["4", "Teoscar Hernández", "LF"],
      ["5", "Max Muncy", "3B"],
      ["6", "Dalton Rushing", "C"],
      ["7", "Hyeseong Kim", "SS"],
      ["8", "Alex Call", "CF"],
      ["9", "Alex Freeland", "2B"],
    ],
    homeLineup: [
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
    spAwayNotes: ["Auto-generated 2026-04-21 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 6.4, tb2Pct: 33.6, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 0.4, tb2Pct: 10.9, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 5.1, tb2Pct: 37.1, tier: "HR D / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 1.0, tb2Pct: 16.2, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Max Muncy", team: "LAD", hrPct: 11.0, tb2Pct: 41.5, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 23.9, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Hyeseong Kim", team: "LAD", hrPct: 0.7, tb2Pct: 22.5, tier: "HR D / TB C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Alex Call", team: "LAD", hrPct: 0.4, tb2Pct: 10.7, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 0.4, tb2Pct: 9.1, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Willy Adames", team: "SF", hrPct: 3.8, tb2Pct: 25.6, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 8.1, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.4, tb2Pct: 10.2, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Rafael Devers", team: "SF", hrPct: 0.9, tb2Pct: 16.0, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 5.9, tb2Pct: 34.5, tier: "HR C / TB A", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 0.4, tb2Pct: 16.2, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 3.9, tb2Pct: 26.6, tier: "HR D / TB B", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 4.3, tb2Pct: 28.5, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
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

export default function Apr21Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 21, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-21
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
2026-04-21,HOU,CLE,6:10 PM,Ryan Weiss,Parker Messick,320,-460,,,,72F / 13 mph wind / 1% precip / Open,72.0,13.2,1,0.402,0.363,0.448,0.556,live,Live,In Progress,"Top 4th — HOU 0, CLE 2",0,2,Partial,rotowire_hr_home_side_missing|rotowire_missing,22.47,77.53,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing;rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Ryan Weiss vs Parker Messick. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-21,CIN,TB,6:40 PM,Chase Burns,Steven Matz,-118,101,,,,67F / 21 mph wind / Dome,67.0,21.0,,0.395,0.374,0.438,0.417,live,Live,In Progress,"Middle 2nd — CIN 4, TB 0",4,0,Partial,rotowire_hr_home_side_missing|rotowire_missing,52.11,47.89,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing;rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Chase Burns vs Steven Matz. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-21,STL,MIA,6:40 PM,Dustin May,Chris Paddack,-106,-119,,,,74F / 13 mph wind / 0% precip / Retractable,74.5,13.2,0,0.327,0.439,0.516,0.505,live,Live,In Progress,"Bottom 2nd — STL 1, MIA 1",1,1,Partial,rotowire_hr_home_side_missing|rotowire_missing,48.64,51.36,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing;rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Dustin May vs Chris Paddack. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-21,MIL,DET,6:40 PM,Kyle Harrison,Keider Montero,-103,-118,,,,68F / 7 mph wind / 11% precip / Open,68.4,7.2,11,0.439,0.444,0.428,0.536,live,Live,In Progress,"Top 2nd — MIL 1, DET 0",1,0,Partial,rotowire_hr_home_side_missing|rotowire_missing,48.38,51.62,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing;rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Kyle Harrison vs Keider Montero. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-21,ATL,WSH,6:45 PM,Reynaldo López,Foster Griffin,-158,132,,,,60F / 9 mph wind / 1% precip / Open,60.5,9.3,1,0.498,0.322,0.596,0.455,live,Live,In Progress,"Bottom 1st — ATL 0, WSH 3",0,3,Partial,rotowire_hr_home_side_missing|rotowire_missing,58.69,41.31,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing;rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Reynaldo López vs Foster Griffin. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-21,NYY,BOS,6:45 PM,Luis Gil,Connelly Early,108,-125,,,,43F / 9 mph wind / 0% precip / Open,42.9,9.3,0,0.457,0.418,0.546,0.425,live,Live,In Progress,"Top 2nd — NYY 1, BOS 0",1,0,Partial,rotowire_hr_home_side_missing|rotowire_missing,46.39,53.61,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing;rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Luis Gil vs Connelly Early. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-21,MIN,NYM,7:10 PM,Simeon Woods Richardson,Nolan McLean,139,-165,7.5,-110,-110,41F / 12 mph wind / Open,41.0,12.0,,0.377,0.396,0.507,0.394,live,Live,Warmup,"Warmup — Top 1st — MIN 0, NYM 0",0,0,Partial,rotowire_hr_home_side_missing|rotowire_missing,40.19,59.81,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing;rotowire_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Simeon Woods Richardson vs Nolan McLean. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-21,BAL,KC,7:40 PM,Shane Baz,Kris Bubic,106,-125,9.0,-111,-111,74F / 15 mph wind / 0% precip / Open,74.1,15.4,0,0.404,0.287,0.514,0.373,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,46.63,53.37,53.38,46.62,48.32,51.68,0.25,48.32,51.68,1.69,-1.69,KC,D,-1.69,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Shane Baz vs Kris Bubic. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-21,PHI,CHC,7:40 PM,Jesús Luzardo,Shota Imanaga,110,-130,8.5,-112,-112,64F / 5 mph wind / 1% precip / Open,63.5,4.9,1,0.502,0.436,0.544,0.558,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,45.73,54.27,41.97,58.03,44.79,55.21,0.25,44.79,55.21,-0.94,0.94,CHC,D,0.94,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Jesús Luzardo vs Shota Imanaga. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-21,PIT,TEX,8:05 PM,Carmen Mlodzinski,Kumar Rocker,100,-118,8.0,-110,-110,61F / 6 mph wind / 8% precip / Retractable,61.0,6.4,8,0.374,0.446,0.495,0.523,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,48.02,51.98,54.63,45.37,49.67,50.33,0.25,49.67,50.33,1.65,-1.65,TEX,D,-1.65,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Carmen Mlodzinski vs Kumar Rocker. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-21,SD,COL,8:40 PM,Randy Vásquez,Jimmy Herget,-145,125,11.0,-110,-110,80F / 8 mph wind / 1% precip / Open,79.6,8.4,1,0.544,0.382,0.483,0.537,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,57.11,42.89,48.10,51.90,54.86,45.14,0.25,54.86,45.14,-2.25,2.25,SD,D,-2.25,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Randy Vásquez vs Jimmy Herget. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-21,TOR,LAA,9:38 PM,Patrick Corbin,Jack Kochanowicz,-105,-115,9.0,-112,-112,66F / 9 mph wind / 1% precip / Open,65.5,9.3,1,0.394,0.414,0.513,0.544,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,48.92,51.08,49.78,50.22,49.13,50.87,0.25,49.13,50.87,0.22,-0.22,LAA,D,-0.22,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Patrick Corbin vs Jack Kochanowicz. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-21,ATH,SEA,9:40 PM,Jacob Lopez,Luis Castillo,140,-165,8.0,-110,-110,57F / 6 mph wind / 18% precip / Retractable,56.8,6.5,18,0.372,0.362,0.500,0.424,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,40.09,59.91,60.05,39.95,45.08,54.92,0.25,45.08,54.92,4.99,-4.99,SEA,D,-4.99,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Jacob Lopez vs Luis Castillo. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-21,CWS,AZ,9:40 PM,Sean Burke,Merrill Kelly,130,-155,9.0,-112,-112,86F / 11 mph wind / 0% precip / Retractable,85.6,11.1,0,0.364,0.520,0.499,0.483,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,41.70,58.30,36.39,63.61,40.37,59.63,0.25,40.37,59.63,-1.33,1.33,AZ,C,1.33,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Sean Burke vs Merrill Kelly. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-21,LAD,SF,9:45 PM,Yoshinobu Yamamoto,Landen Roupp,-185,155,7.5,-110,-110,54F / 10 mph wind / 12% precip / Open,54.2,10.5,12,0.403,0.462,0.613,0.543,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,62.34,37.66,44.51,55.49,57.88,42.12,0.25,57.88,42.12,-4.46,4.46,LAD,D,-4.46,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Yoshinobu Yamamoto vs Landen Roupp. Run compute to refresh lineups, weather, and model outputs before staking.",scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-21,HOU@CLE,HOU,Carlos Correa,Parker Messick,0.40,16.84,+24900,+494,900,-9.60,0.5,-140,,0.456,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,HOU,Yordan Alvarez,Parker Messick,14.10,55.00,+609,-122,475,-3.30,0.5,-150,,0.920,1,A+,A+,A+,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,HOU,Jose Altuve,Parker Messick,0.40,11.72,+24900,+753,850,-10.13,0.5,-120,,0.382,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,HOU,Christian Walker,Parker Messick,3.73,25.48,+2579,+292,900,-6.27,0.5,100,,0.590,0,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,HOU,Isaac Paredes,Parker Messick,0.40,6.00,+24900,+1567,1000,-8.69,0.5,110,,0.473,1,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,HOU,Cam Smith,Parker Messick,1.10,15.94,+8952,+527,1100,-7.23,1.5,121,-29.31,0.299,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,HOU@CLE,HOU,Yainer Diaz,Parker Messick,0.40,6.00,+24900,+1567,1200,-7.29,0.5,-110,,0.301,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,HOU,Brice Matthews,Parker Messick,0.40,6.00,+24900,+1567,1350,-6.50,0.5,195,,0.270,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,HOU,Dustin Harris,Parker Messick,0.40,6.00,+24900,+1567,1350,-6.50,0.5,165,,0.342,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,Steven Kwan,Ryan Weiss,0.40,6.00,+24900,+1567,NA,,0.5,-130,,0.285,0,D,D,D,,,unpriced,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,Chase DeLauter,Ryan Weiss,9.01,32.42,+1010,+208,NA,,0.5,-110,,0.356,1,A,B,A,,,unpriced,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,José Ramírez,Ryan Weiss,13.86,50.61,+622,-102,NA,,1.5,-109,-1.54,0.882,2,A+,A+,A+,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,Kyle Manzardo,Ryan Weiss,5.55,24.55,+1701,+307,NA,,1.5,100,-25.45,0.520,0,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,George Valera,Ryan Weiss,5.25,31.63,+1804,+216,NA,,1.5,-120,-22.92,0.484,0,B,D,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,Daniel Schneemann,Ryan Weiss,11.90,48.00,+740,+108,NA,,0.5,-120,,0.924,1,A+,A,A+,,,unpriced,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,Angel Martínez,Ryan Weiss,8.39,35.12,+1092,+185,NA,,1.5,450,16.94,0.645,1,A,B,A,,,unpriced,priced_below_prob_gate,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,Austin Hedges,Ryan Weiss,1.83,12.04,+5352,+731,NA,,0.5,140,,0.199,0,D,D,D,,,unpriced,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,HOU@CLE,CLE,Brayan Rocchio,Ryan Weiss,6.68,33.11,+1398,+202,NA,,0.5,-110,,0.706,1,A,C,A,,,unpriced,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,CIN@TB,CIN,Dane Myers,Steven Matz,1.33,14.24,+7412,+602,725,-10.79,1.5,180,-21.47,0.347,5,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,CIN@TB,CIN,Matt McLain,Steven Matz,0.40,6.11,+24900,+1536,750,-11.36,1.5,195,-27.79,0.313,7,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,CIN@TB,CIN,Elly De La Cruz,Steven Matz,10.14,40.27,+886,+148,NA,,1.5,450,22.09,0.640,3,A+,B,A+,,,unpriced,priced_below_prob_gate,Display only,partial,not_scored
2026-04-21,CIN@TB,CIN,Sal Stewart,Steven Matz,14.04,49.18,+612,+103,440,-4.48,1.5,142,7.85,0.826,0,A+,A+,A+,2+ TB,A+,priced_no_edge,qualified,Display only,full,not_scored
2026-04-21,CIN@TB,CIN,Eugenio Suárez,Steven Matz,1.62,19.55,+6080,+412,500,-15.05,1.5,200,-13.79,0.552,13,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,CIN@TB,CIN,Spencer Steer,Steven Matz,5.68,26.44,+1661,+278,700,-6.82,1.5,210,-5.81,0.552,6,B,D,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,CIN@TB,CIN,Tyler Stephenson,Steven Matz,4.63,19.74,+2061,+407,600,-9.66,1.5,150,-20.26,0.280,4,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,CIN@TB,CIN,Rece Hinds,Steven Matz,0.40,6.00,+24900,+1567,538,-15.27,1.5,160,-32.46,0.250,1,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,CIN@TB,CIN,Ke'Bryan Hayes,Steven Matz,0.40,6.00,+24900,+1567,750,-11.36,1.5,168,-31.31,0.180,9,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,CIN@TB,TB,Chandler Simpson,Chase Burns,0.40,8.12,+24900,+1132,NA,,1.5,190,-26.37,0.398,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,CIN@TB,TB,Junior Caminero,Chase Burns,5.21,27.75,+1821,+260,NA,,1.5,175,-8.62,0.593,0,B,D,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,CIN@TB,TB,Jonathan Aranda,Chase Burns,2.82,19.69,+3451,+408,NA,,0.5,-120,,0.383,0,D,D,D,,,unpriced,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,CIN@TB,TB,Yandy Díaz,Chase Burns,2.27,22.62,+4307,+342,NA,,1.5,200,-10.71,0.470,1,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,CIN@TB,TB,Jake Fraley,Chase Burns,1.27,17.50,+7762,+471,NA,,1.5,210,-14.76,0.529,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,CIN@TB,TB,Cedric Mullins,Chase Burns,0.40,6.38,+24900,+1467,NA,,1.5,185,-28.71,0.389,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,CIN@TB,TB,Richie Palacios,Chase Burns,1.66,21.46,+5936,+366,NA,,1.5,250,-7.12,0.474,0,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,CIN@TB,TB,Hunter Feduccia,Chase Burns,0.40,6.00,+24900,+1567,NA,,0.5,100,,0.234,0,D,D,D,,,unpriced,line_mismatch_0.5,Display only,partial,not_scored
2026-04-21,CIN@TB,TB,Taylor Walls,Chase Burns,0.40,6.00,+24900,+1567,NA,,1.5,260,-21.78,0.284,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,STL@MIA,STL,JJ Wetherholt,Chris Paddack,1.25,14.69,+7917,+581,700,-11.25,2.5,-173,,0.484,0,D,D,D,,,priced_no_edge,line_mismatch_2.5,Display only,partial,not_scored
2026-04-21,STL@MIA,STL,Iván Herrera,Chris Paddack,2.71,22.11,+3595,+352,750,-9.06,1.5,155,-17.10,0.503,0,C,D,C,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,STL@MIA,STL,Alec Burleson,Chris Paddack,6.85,36.32,+1360,+175,575,-7.96,1.5,-220,-32.43,0.620,0,A,C,A,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,STL@MIA,STL,Jordan Walker,Chris Paddack,14.45,51.95,+592,-108,500,-2.22,1.5,155,12.73,0.821,0,A+,A+,A+,2+ TB,A+,priced_no_edge,qualified,Display only,full,not_scored
2026-04-21,STL@MIA,STL,Nolan Gorman,Chris Paddack,0.40,8.30,+24900,+1104,532,-15.42,1.5,210,-23.95,0.399,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,STL@MIA,STL,Masyn Winn,Chris Paddack,0.40,16.02,+24900,+524,925,-9.36,1.5,147,-24.47,0.617,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,STL@MIA,STL,Nathan Church,Chris Paddack,0.40,13.93,+24900,+618,800,-10.71,1.5,150,-26.07,0.629,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,STL@MIA,STL,Pedro Pagés,Chris Paddack,0.40,10.56,+24900,+847,750,-11.36,1.5,170,-26.47,0.368,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,STL@MIA,STL,Victor Scott II,Chris Paddack,0.40,6.00,+24900,+1567,2000,-4.36,1.5,190,-28.48,0.199,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,STL@MIA,MIA,Jakob Marsee,Dustin May,0.40,6.00,+24900,+1567,NA,,1.5,450,-12.18,0.320,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,STL@MIA,MIA,Kyle Stowers,Dustin May,5.97,44.46,+1574,+125,NA,,1.5,165,6.72,0.818,3,A+,C,A+,,,unpriced,priced_below_prob_gate,Display only,partial,not_scored
2026-04-21,STL@MIA,MIA,Otto Lopez,Dustin May,8.43,41.14,+1086,+143,NA,,1.5,170,4.11,0.703,2,A+,B,A+,,,unpriced,priced_below_prob_gate,Display only,partial,not_scored
2026-04-21,STL@MIA,MIA,Xavier Edwards,Dustin May,3.39,28.46,+2853,+251,NA,,1.5,132,-14.64,0.492,3,B,D,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,STL@MIA,MIA,Liam Hicks,Dustin May,4.93,30.71,+1927,+226,NA,,1.5,145,-10.11,0.570,0,B,D,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,STL@MIA,MIA,Agustín Ramírez,Dustin May,2.06,17.54,+4764,+470,NA,,1.5,145,-23.27,0.468,3,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,STL@MIA,MIA,Owen Caissie,Dustin May,5.24,23.04,+1810,+334,NA,,1.5,170,-14.00,0.297,0,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,STL@MIA,MIA,Graham Pauley,Dustin May,0.40,6.00,+24900,+1567,NA,,1.5,188,-28.72,0.221,2,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,STL@MIA,MIA,Connor Norby,Dustin May,3.72,24.71,+2586,+305,NA,,1.5,160,-13.75,0.652,0,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIL@DET,MIL,Brice Turang,Keider Montero,6.78,39.11,+1375,+156,1000,-2.31,1.5,160,0.65,0.826,3,A+,C,A+,,,priced_no_edge,priced_below_prob_gate,Display only,full,not_scored
2026-04-21,MIL@DET,MIL,William Contreras,Keider Montero,0.40,19.82,+24900,+405,700,-12.10,1.5,160,-18.64,0.551,3,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIL@DET,MIL,Jake Bauers,Keider Montero,5.12,28.10,+1852,+256,700,-7.38,1.5,-122,-26.86,0.679,0,B,D,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIL@DET,MIL,Gary Sánchez,Keider Montero,6.07,30.35,+1546,+229,562,-9.03,1.5,230,0.05,0.611,0,B,C,B,,,priced_no_edge,priced_below_prob_gate,Display only,full,not_scored
2026-04-21,MIL@DET,MIL,Garrett Mitchell,Keider Montero,0.40,13.61,+24746,+635,NA,,1.5,100,-36.39,0.372,2,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIL@DET,MIL,Luis Rengifo,Keider Montero,0.40,6.00,+24900,+1567,1100,-7.93,1.5,150,-34.00,0.218,1,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIL@DET,MIL,Sal Frelick,Keider Montero,0.40,6.00,+24900,+1567,1350,-6.50,1.5,160,-32.46,0.230,4,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIL@DET,MIL,David Hamilton,Keider Montero,0.40,6.00,+24900,+1567,1150,-7.60,1.5,175,-30.36,0.180,4,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIL@DET,MIL,Blake Perkins,Keider Montero,0.40,6.00,+24900,+1567,900,-9.60,1.5,180,-29.71,0.180,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIL@DET,DET,Jahmai Jones,Kyle Harrison,3.74,23.91,+2576,+318,NA,,1.5,225,-6.86,0.751,3,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIL@DET,DET,Gleyber Torres,Kyle Harrison,0.40,6.00,+24900,+1567,NA,,1.5,210,-26.26,0.375,2,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIL@DET,DET,Kevin McGonigle,Kyle Harrison,3.88,33.93,+2477,+195,NA,,1.5,230,3.62,0.647,0,A,D,A,,,unpriced,priced_below_prob_gate,Display only,partial,not_scored
2026-04-21,MIL@DET,DET,Matt Vierling,Kyle Harrison,0.40,15.88,+24900,+530,NA,,1.5,230,-14.42,0.430,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIL@DET,DET,Dillon Dingler,Kyle Harrison,11.54,48.47,+767,+106,NA,,1.5,145,7.66,0.739,2,A+,A,A+,,,unpriced,priced_below_prob_gate,Display only,partial,not_scored
2026-04-21,MIL@DET,DET,Riley Greene,Kyle Harrison,3.25,29.07,+2981,+244,NA,,1.5,140,-12.59,0.604,2,B,D,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIL@DET,DET,Spencer Torkelson,Kyle Harrison,0.40,6.00,+24900,+1567,NA,,1.5,172,-30.76,0.322,2,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIL@DET,DET,Hao-Yu  Lee,Kyle Harrison,0.40,6.00,+24900,+1567,NA,,1.5,165,-31.74,0.290,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIL@DET,DET,Javier Báez,Kyle Harrison,0.40,19.70,+24900,+408,NA,,1.5,155,-19.51,0.663,2,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,ATL@WSH,ATL,Ronald Acuña Jr.,Foster Griffin,5.32,33.27,+1779,+201,465,-12.38,1.5,135,-9.29,0.616,1,A,D,A,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,ATL@WSH,ATL,Drake Baldwin,Foster Griffin,6.26,32.88,+1498,+204,675,-6.65,1.5,165,-4.85,0.462,0,A,C,A,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,ATL@WSH,ATL,Ozzie Albies,Foster Griffin,2.19,19.92,+4460,+402,825,-8.62,1.5,160,-18.55,0.596,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,ATL@WSH,ATL,Matt Olson,Foster Griffin,11.41,44.89,+776,+123,395,-8.79,1.5,128,1.03,0.768,0,A+,A,A+,,,priced_no_edge,priced_below_prob_gate,Display only,full,not_scored
2026-04-21,ATL@WSH,ATL,Austin Riley,Foster Griffin,5.61,29.28,+1681,+242,500,-11.05,1.5,112,-17.89,0.673,0,B,D,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,ATL@WSH,ATL,Mauricio Dubón,Foster Griffin,1.69,20.45,+5820,+389,925,-8.07,1.5,150,-19.55,0.436,0,C,D,C,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,ATL@WSH,ATL,Michael Harris II,Foster Griffin,11.70,47.88,+755,+109,625,-2.10,1.5,132,4.78,0.919,0,A+,A,A+,,,priced_no_edge,priced_below_prob_gate,Display only,full,not_scored
2026-04-21,ATL@WSH,ATL,Jonah Heim,Foster Griffin,0.55,16.96,+18185,+490,800,-10.56,1.5,172,-19.81,0.502,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,ATL@WSH,ATL,Eli White,Foster Griffin,0.40,8.97,+24900,+1015,950,-9.12,1.5,210,-23.29,0.396,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,ATL@WSH,WSH,James Wood,Reynaldo López,12.76,48.86,+684,+105,NA,,1.5,150,8.86,0.769,5,A+,A,A+,,,unpriced,priced_below_prob_gate,Display only,partial,not_scored
2026-04-21,ATL@WSH,WSH,Luis García Jr.,Reynaldo López,0.40,6.00,+24900,+1567,NA,,1.5,-150,-54.00,0.180,7,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,ATL@WSH,WSH,Jacob Young,Reynaldo López,0.46,18.12,+21589,+452,NA,,1.5,150,-21.88,0.453,4,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,ATL@WSH,WSH,CJ Abrams,Reynaldo López,7.25,38.12,+1279,+162,NA,,1.5,110,-9.50,0.697,7,A+,C,A+,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,ATL@WSH,WSH,Daylen Lile,Reynaldo López,1.40,22.62,+7065,+342,NA,,1.5,130,-20.86,0.578,0,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,ATL@WSH,WSH,Nasim Nuñez,Reynaldo López,0.40,6.00,+24900,+1567,NA,,1.5,200,-27.33,0.228,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,ATL@WSH,WSH,Jorbit Vivas,Reynaldo López,0.40,6.00,+24900,+1567,NA,,1.5,260,-21.78,0.411,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,ATL@WSH,WSH,José Tena,Reynaldo López,0.40,16.97,+24900,+489,NA,,1.5,220,-14.28,0.512,4,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,ATL@WSH,WSH,Drew Millas,Reynaldo López,0.40,6.00,+24900,+1567,NA,,1.5,230,-24.30,0.265,2,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,NYY,Amed Rosario,Connelly Early,10.66,42.54,+838,+135,900,0.66,1.5,162,4.37,0.737,0,A+,A,A+,,,priced_below_gate,priced_below_prob_gate,Display only,full,not_scored
2026-04-21,NYY@BOS,NYY,Aaron Judge,Connelly Early,16.73,52.92,+498,-112,335,-6.25,1.5,140,11.25,0.827,0,A+,A+,A+,2+ TB,A+,priced_no_edge,qualified,Display only,full,not_scored
2026-04-21,NYY@BOS,NYY,Ben Rice,Connelly Early,17.98,55.00,+456,-122,650,4.65,1.5,208,22.53,0.950,0,A+,A+,A+,2+ TB,A+,qualified,qualified,Display only,full,not_scored
2026-04-21,NYY@BOS,NYY,Giancarlo Stanton,Connelly Early,4.50,17.02,+2121,+488,432,-14.30,1.5,152,-22.66,0.275,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,NYY@BOS,NYY,Cody Bellinger,Connelly Early,5.10,29.10,+1859,+244,850,-5.42,1.5,125,-15.35,0.578,0,B,D,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,NYY@BOS,NYY,Randal Grichuk,Connelly Early,0.40,6.00,+24900,+1567,725,-11.72,1.5,185,-29.09,0.223,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,NYY@BOS,NYY,Jazz Chisholm Jr.,Connelly Early,0.40,6.00,+24900,+1567,1000,-8.69,1.5,220,-25.25,0.268,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,NYY@BOS,NYY,José Caballero,Connelly Early,0.86,17.53,+11557,+471,1200,-6.83,1.5,228,-12.96,0.578,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,NYY@BOS,NYY,Austin Wells,Connelly Early,3.40,20.50,+2841,+388,900,-6.60,1.5,225,-10.27,0.479,0,C,D,C,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,NYY@BOS,BOS,Roman Anthony,Luis Gil,6.56,26.65,+1425,+275,NA,,1.5,170,-10.39,0.383,3,B,C,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,BOS,Willson Contreras,Luis Gil,12.17,44.89,+722,+123,NA,,1.5,-140,-13.44,0.639,1,A+,A,A+,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,BOS,Masataka Yoshida,Luis Gil,5.25,31.76,+1804,+215,NA,,1.5,150,-8.24,0.570,12,B,D,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,BOS,Wilyer Abreu,Luis Gil,7.84,28.20,+1176,+255,NA,,1.5,126,-16.04,0.280,3,B,B,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,BOS,Trevor Story,Luis Gil,5.25,25.76,+1806,+288,NA,,1.5,142,-15.56,0.499,6,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,BOS,Ceddanne Rafaela,Luis Gil,4.86,26.53,+1958,+277,NA,,1.5,150,-13.47,0.491,8,B,D,B,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,BOS,Marcelo Mayer,Luis Gil,3.43,13.15,+2813,+661,NA,,1.5,170,-23.89,0.258,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,BOS,Caleb Durbin,Luis Gil,1.36,13.97,+7261,+616,NA,,1.5,185,-21.11,0.382,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,NYY@BOS,BOS,Carlos Narváez,Luis Gil,4.20,20.41,+2283,+390,NA,,1.5,195,-13.49,0.320,4,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIN@NYM,MIN,Byron Buxton,Nolan McLean,0.42,17.33,+23488,+477,394,-19.82,1.5,131,-25.96,0.665,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,MIN,Trevor Larnach,Nolan McLean,0.40,16.86,+24900,+493,925,-9.36,1.5,210,-15.40,0.538,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,MIN,Josh Bell,Nolan McLean,0.40,17.36,+24900,+476,628,-13.34,1.5,172,-19.41,0.523,22,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,MIN,Ryan Jeffers,Nolan McLean,2.41,26.38,+4044,+279,720,-9.78,1.5,200,-6.95,0.792,0,B,D,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,MIN,Kody Clemens,Nolan McLean,0.40,6.00,+24900,+1567,550,-14.98,1.5,200,-27.33,0.456,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,MIN,Luke Keaschall,Nolan McLean,0.40,6.00,+24900,+1567,1100,-7.93,1.5,185,-29.09,0.307,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,MIN,Matt Wallner,Nolan McLean,0.40,6.00,+24900,+1567,600,-13.89,1.5,218,-25.45,0.236,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,MIN,Royce Lewis,Nolan McLean,0.40,9.88,+24900,+913,588,-14.13,1.5,192,-24.37,0.427,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,MIN,Brooks Lee,Nolan McLean,0.40,8.84,+24900,+1031,975,-8.90,1.5,244,-20.23,0.616,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-21,MIN@NYM,NYM,Marcus Semien,Simeon Woods Richardson,0.82,12.23,+12114,+717,NA,,1.5,145,-28.58,0.293,6,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIN@NYM,NYM,Francisco Lindor,Simeon Woods Richardson,3.60,22.34,+2678,+348,NA,,1.5,128,-21.51,0.428,3,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIN@NYM,NYM,Luis Robert Jr.,Simeon Woods Richardson,3.39,21.65,+2852,+362,NA,,1.5,134,-21.09,0.409,5,C,D,C,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIN@NYM,NYM,Bo Bichette,Simeon Woods Richardson,2.37,19.71,+4113,+407,NA,,1.5,128,-24.15,0.408,4,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIN@NYM,NYM,MJ Melendez,Simeon Woods Richardson,12.43,54.38,+705,-119,NA,,1.5,190,19.90,0.873,5,A+,A,A+,2+ TB,A+,unpriced,qualified,Display only,partial,not_scored
2026-04-21,MIN@NYM,NYM,Francisco Alvarez,Simeon Woods Richardson,8.85,35.20,+1029,+184,NA,,1.5,154,-4.17,0.482,0,A,B,A,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIN@NYM,NYM,Brett Baty,Simeon Woods Richardson,1.03,10.04,+9603,+896,NA,,1.5,197,-23.63,0.207,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIN@NYM,NYM,Mark Vientos,Simeon Woods Richardson,2.77,14.03,+3513,+613,NA,,1.5,168,-23.28,0.180,2,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,MIN@NYM,NYM,Carson Benge,Simeon Woods Richardson,0.40,7.07,+24900,+1315,NA,,1.5,220,-24.18,0.271,0,D,D,D,,,unpriced,priced_no_edge,Display only,partial,not_scored
2026-04-21,BAL@KC,BAL,Taylor Ward,Kris Bubic,4.38,30.88,+2184,+224,426,-14.63,1.5,102,-18.63,0.555,5,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,BAL,Gunnar Henderson,Kris Bubic,7.79,30.45,+1183,+228,525,-8.21,1.5,110,-17.17,0.561,5,B,C,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,BAL,Adley Rutschman,Kris Bubic,4.06,31.55,+2364,+217,650,-9.27,1.5,129,-12.12,0.548,5,B,D,B,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,BAL,Pete Alonso,Kris Bubic,4.37,22.87,+2187,+337,400,-15.63,1.5,118,-23.00,0.444,0,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,BAL,Jeremiah Jackson,Kris Bubic,10.02,38.70,+898,+158,690,-2.63,1.5,128,-5.16,0.872,0,A+,B,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,BAL,Weston Wilson,Kris Bubic,3.06,28.16,+3165,+255,690,-9.60,1.5,181,-7.43,0.538,0,B,D,B,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,BAL,Leody Taveras,Kris Bubic,7.47,37.40,+1239,+167,700,-5.03,1.5,147,-3.09,0.689,2,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,BAL,Coby Mayo,Kris Bubic,0.40,6.00,+24900,+1567,725,-11.72,1.5,185,-29.09,0.215,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,BAL,Blaze Alexander,Kris Bubic,0.40,10.88,+24900,+819,755,-11.30,1.5,168,-26.43,0.202,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,BAL@KC,KC,Maikel Garcia,Shane Baz,2.22,19.01,+4394,+426,NA,,1.5,104,-30.01,0.392,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,BAL@KC,KC,Bobby Witt Jr.,Shane Baz,3.78,30.14,+2543,+232,NA,,1.5,-120,-24.40,0.508,6,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,BAL@KC,KC,Vinnie Pasquantino,Shane Baz,0.61,7.80,+16189,+1182,NA,,1.5,123,-37.04,0.329,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,BAL@KC,KC,Salvador Perez,Shane Baz,1.27,10.30,+7767,+870,NA,,1.5,118,-35.57,0.293,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,BAL@KC,KC,Carter Jensen,Shane Baz,7.38,28.38,+1256,+252,NA,,1.5,140,-13.29,0.612,0,B,C,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,BAL@KC,KC,Michael Massey,Shane Baz,0.40,6.00,+24900,+1567,NA,,1.5,165,-31.74,0.253,3,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,BAL@KC,KC,Jac Caglianone,Shane Baz,6.88,34.03,+1353,+194,NA,,1.5,156,-5.03,0.554,3,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,BAL@KC,KC,Isaac Collins,Shane Baz,0.40,6.00,+24900,+1567,NA,,1.5,200,-27.33,0.235,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,BAL@KC,KC,Kyle Isbel,Shane Baz,0.40,6.00,+24900,+1567,NA,,1.5,190,-28.48,0.180,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,PHI,Trea Turner,Shota Imanaga,0.40,9.75,+24900,+926,470,-17.14,1.5,-104,-41.23,0.449,6,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,PHI,Kyle Schwarber,Shota Imanaga,9.08,36.70,+1001,+172,255,-19.09,1.5,121,-8.55,0.714,3,A,B,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,PHI,Bryce Harper,Shota Imanaga,5.35,35.91,+1769,+178,400,-14.65,1.5,124,-8.73,0.753,3,A,D,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,PHI,Felix Reyes,Shota Imanaga,25.00,55.00,+300,-122,540,9.38,1.5,138,12.98,0.950,0,A+,A+,A+,2+ TB,A+,qualified,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,PHI,Adolis García,Shota Imanaga,0.40,8.84,+24900,+1031,358,-21.43,1.5,124,-35.80,0.278,6,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,PHI,J.T. Realmuto,Shota Imanaga,0.40,13.62,+24900,+634,545,-15.10,1.5,141,-27.87,0.440,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,PHI,Alec Bohm,Shota Imanaga,0.40,6.00,+24900,+1567,675,-12.50,1.5,140,-35.67,0.180,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,PHI,Brandon Marsh,Shota Imanaga,0.40,18.09,+24900,+453,770,-11.09,1.5,228,-12.39,0.426,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,PHI,Edmundo Sosa,Shota Imanaga,2.23,23.70,+4384,+322,638,-11.32,1.5,190,-10.78,0.709,5,C,D,C,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PHI@CHC,CHC,Nico Hoerner,Jesús Luzardo,2.35,24.48,+4161,+308,NA,,1.5,-108,-27.44,0.705,17,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,CHC,Alex Bregman,Jesús Luzardo,2.04,20.88,+4810,+379,NA,,1.5,128,-22.98,0.475,13,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,CHC,Ian Happ,Jesús Luzardo,7.30,32.36,+1270,+209,NA,,1.5,142,-8.96,0.652,21,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,CHC,Seiya Suzuki,Jesús Luzardo,0.40,6.00,+24900,+1567,NA,,1.5,130,-37.48,0.367,15,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,CHC,Carson Kelly,Jesús Luzardo,8.99,43.14,+1012,+132,NA,,1.5,140,1.47,0.876,7,A+,B,A+,,,unpriced,priced_below_prob_gate,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,CHC,Michael Busch,Jesús Luzardo,0.40,6.00,+24900,+1567,NA,,1.5,192,-28.25,0.213,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,CHC,Dansby Swanson,Jesús Luzardo,6.95,30.88,+1339,+224,NA,,1.5,162,-7.29,0.724,25,B,C,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,CHC,Matt Shaw,Jesús Luzardo,2.72,26.21,+3582,+281,NA,,1.5,186,-8.75,0.575,5,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PHI@CHC,CHC,Pete Crow-Armstrong,Jesús Luzardo,0.40,12.16,+24900,+723,NA,,1.5,198,-21.40,0.435,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,PIT,Oneil Cruz,Kumar Rocker,10.44,41.71,+858,+140,352,-11.69,1.5,115,-4.80,0.620,3,A+,A,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,PIT,Ryan O'Hearn,Kumar Rocker,5.23,31.49,+1814,+218,620,-8.66,1.5,134,-11.24,0.525,0,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,PIT,Bryan Reynolds,Kumar Rocker,3.40,24.93,+2845,+301,700,-9.10,1.5,139,-16.91,0.539,3,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,PIT,Marcell Ozuna,Kumar Rocker,2.74,21.95,+3550,+356,532,-13.08,1.5,156,-17.11,0.629,2,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,PIT,Nick Yorke,Kumar Rocker,1.41,19.96,+6970,+401,900,-8.59,1.5,145,-20.86,0.441,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,PIT,Spencer Horwitz,Kumar Rocker,0.40,14.67,+24900,+581,940,-9.22,1.5,184,-20.54,0.680,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,PIT,Nick Gonzales,Kumar Rocker,0.40,6.00,+24900,+1567,900,-9.60,1.5,159,-32.61,0.291,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,PIT,Konnor Griffin,Kumar Rocker,0.40,7.94,+24900,+1159,900,-9.60,1.5,198,-25.62,0.400,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,PIT,Henry Davis,Kumar Rocker,0.40,6.00,+24900,+1567,700,-12.10,1.5,228,-24.49,0.325,2,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,PIT@TEX,TEX,Brandon Nimmo,Carmen Mlodzinski,4.69,29.65,+2031,+237,NA,,1.5,122,-15.39,0.661,1,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,TEX,Wyatt Langford,Carmen Mlodzinski,0.40,16.82,+24900,+495,NA,,1.5,140,-24.85,0.592,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,TEX,Corey Seager,Carmen Mlodzinski,4.37,21.98,+2190,+355,NA,,1.5,122,-23.06,0.471,1,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,TEX,Jake Burger,Carmen Mlodzinski,3.60,21.75,+2678,+360,NA,,1.5,145,-19.06,0.488,1,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,TEX,Joc Pederson,Carmen Mlodzinski,0.40,9.41,+24900,+963,NA,,1.5,200,-23.93,0.457,1,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,TEX,Josh Jung,Carmen Mlodzinski,3.40,32.08,+2838,+212,NA,,1.5,170,-4.96,0.861,1,A,D,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,TEX,Evan Carter,Carmen Mlodzinski,0.91,13.89,+10891,+620,NA,,1.5,189,-20.71,0.465,1,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,TEX,Danny Jansen,Carmen Mlodzinski,0.40,6.00,+24900,+1567,NA,,1.5,225,-24.77,0.351,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,PIT@TEX,TEX,Josh Smith,Carmen Mlodzinski,0.40,6.00,+24900,+1567,NA,,1.5,218,-25.45,0.365,1,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,SD,Ramón Laureano,Jimmy Herget,9.36,41.58,+969,+140,382,-11.39,1.5,-122,-13.37,0.656,9,A+,B,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,SD,Fernando Tatis Jr.,Jimmy Herget,5.36,30.59,+1765,+227,382,-15.39,1.5,-115,-22.90,0.433,9,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,SD,Jackson Merrill,Jimmy Herget,5.53,27.19,+1709,+268,410,-14.08,1.5,-137,-30.62,0.402,5,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,SD,Manny Machado,Jimmy Herget,0.42,8.92,+23698,+1021,418,-18.88,1.5,100,-41.08,0.315,6,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,SD,Xander Bogaerts,Jimmy Herget,6.30,33.46,+1487,+199,598,-8.02,1.5,-105,-17.76,0.697,6,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,SD,Gavin Sheets,Jimmy Herget,6.96,34.93,+1337,+186,455,-11.06,1.5,105,-13.85,0.650,3,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,SD,Miguel Andujar,Jimmy Herget,1.48,25.48,+6656,+293,900,-8.52,1.5,110,-22.14,0.572,2,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,SD,Freddy Fermin,Jimmy Herget,0.40,6.00,+24900,+1567,925,-9.36,1.5,139,-35.84,0.297,2,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,SD,Jake Cronenworth,Jimmy Herget,0.99,9.78,+9987,+923,592,-13.46,1.5,136,-32.60,0.326,7,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,SD@COL,COL,Edouard Julien,Randy Vásquez,6.49,33.41,+1440,+199,NA,,1.5,134,-9.32,0.528,3,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,COL,Mickey Moniak,Randy Vásquez,12.96,43.42,+672,+130,NA,,1.5,-121,-11.33,0.785,12,A+,A,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,COL,Hunter Goodman,Randy Vásquez,11.10,39.65,+801,+152,NA,,1.5,-104,-11.33,0.794,14,A+,A,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,COL,TJ Rumfield,Randy Vásquez,4.75,21.98,+2007,+355,NA,,1.5,110,-25.64,0.313,3,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,COL,Troy Johnston,Randy Vásquez,5.26,32.17,+1802,+211,NA,,1.5,123,-12.67,0.512,3,A,D,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,COL,Ezequiel Tovar,Randy Vásquez,4.72,28.38,+2018,+252,NA,,1.5,110,-19.24,0.348,15,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,COL,Kyle Karros,Randy Vásquez,5.20,27.45,+1824,+264,NA,,1.5,140,-14.22,0.495,5,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,COL,Jordan Beck,Randy Vásquez,2.35,17.98,+4151,+456,NA,,1.5,146,-22.67,0.531,11,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,SD@COL,COL,Brenton Doyle,Randy Vásquez,3.37,22.78,+2868,+339,NA,,1.5,140,-18.88,0.532,16,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,TOR,Nathan Lukes,Jack Kochanowicz,0.40,11.45,+24900,+773,800,-10.71,1.5,119,-34.21,0.413,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,TOR,Ernie Clement,Jack Kochanowicz,0.40,16.68,+24900,+499,1000,-8.69,1.5,110,-30.94,0.485,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,TOR,Vladimir Guerrero Jr.,Jack Kochanowicz,6.58,38.35,+1419,+161,475,-10.81,1.5,100,-11.65,0.723,3,A+,C,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,TOR,Jesús Sánchez,Jack Kochanowicz,5.02,29.69,+1892,+237,482,-12.16,1.5,124,-14.95,0.448,0,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,TOR,Eloy Jiménez,Jack Kochanowicz,0.59,21.09,+16798,+374,630,-13.11,1.5,131,-22.20,0.496,0,C,D,C,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,TOR,Daulton Varsho,Jack Kochanowicz,4.10,25.28,+2339,+296,382,-16.65,1.5,120,-20.18,0.778,3,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,TOR,Kazuma Okamoto,Jack Kochanowicz,2.68,15.42,+3626,+549,638,-10.87,1.5,178,-20.55,0.358,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,TOR,Andrés Giménez,Jack Kochanowicz,1.82,18.80,+5401,+432,875,-8.44,1.5,152,-20.89,0.523,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,TOR,Brandon Valenzuela,Jack Kochanowicz,1.59,9.95,+6208,+905,825,-9.23,1.5,200,-23.38,0.390,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,TOR@LAA,LAA,Zach Neto,Patrick Corbin,10.51,36.77,+851,+172,NA,,1.5,110,-10.84,0.501,12,A,A,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,LAA,Mike Trout,Patrick Corbin,18.82,55.00,+431,-122,NA,,1.5,119,9.34,0.797,14,A+,A+,A+,2+ TB,A+,unpriced,qualified,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,LAA,Jo Adell,Patrick Corbin,9.48,37.28,+955,+168,NA,,1.5,-108,-14.65,0.557,12,A,B,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,LAA,Jorge Soler,Patrick Corbin,12.89,40.63,+676,+146,NA,,1.5,135,-1.92,0.870,26,A+,A,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,LAA,Oswald Peraza,Patrick Corbin,13.10,45.31,+663,+121,NA,,1.5,142,3.99,0.886,4,A+,A,A+,,,unpriced,priced_below_prob_gate,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,LAA,Nolan Schanuel,Patrick Corbin,3.61,17.12,+2667,+484,NA,,1.5,180,-18.59,0.328,5,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,LAA,Vaughn Grissom,Patrick Corbin,3.76,15.99,+2558,+525,NA,,1.5,158,-22.77,0.386,2,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,LAA,Logan O'Hoppe,Patrick Corbin,5.77,19.42,+1633,+415,NA,,1.5,149,-20.74,0.395,7,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,TOR@LAA,LAA,Bryce Teodosio,Patrick Corbin,1.21,6.00,+8196,+1567,NA,,1.5,280,-20.32,0.180,3,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,ATH,Nick Kurtz,Luis Castillo,13.10,46.83,+663,+114,375,-7.95,1.5,126,2.58,0.665,3,A+,A,A+,,,priced_no_edge,priced_below_prob_gate,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,ATH,Shea Langeliers,Luis Castillo,11.33,43.61,+783,+129,418,-7.97,1.5,130,0.13,0.616,22,A+,A,A+,,,priced_no_edge,priced_below_prob_gate,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,ATH,Carlos Cortes,Luis Castillo,9.23,40.51,+983,+147,800,-1.88,1.5,160,2.05,0.649,3,A+,B,A+,,,priced_no_edge,priced_below_prob_gate,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,ATH,Tyler Soderstrom,Luis Castillo,6.24,28.37,+1502,+252,588,-8.29,1.5,152,-11.31,0.503,8,B,C,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,ATH,Jacob Wilson,Luis Castillo,2.77,20.50,+3510,+388,1165,-5.14,1.5,150,-19.50,0.497,4,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,ATH,Jeff McNeil,Luis Castillo,3.26,26.03,+2965,+284,980,-6.00,1.5,150,-13.97,0.527,14,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,ATH,Max Muncy,Luis Castillo,7.79,32.67,+1184,+206,900,-2.21,1.5,220,1.42,0.391,2,A,C,A,,,priced_no_edge,priced_below_prob_gate,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,ATH,Lawrence Butler,Luis Castillo,5.09,24.35,+1866,+311,700,-7.41,1.5,215,-7.39,0.395,11,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,ATH,Zack Gelof,Luis Castillo,0.95,8.67,+10410,+1054,700,-11.55,1.5,240,-20.74,0.256,6,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,ATH@SEA,SEA,Rob Refsnyder,Jacob Lopez,0.40,6.00,+24900,+1567,NA,,1.5,170,-31.04,0.475,0,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,SEA,Cal Raleigh,Jacob Lopez,0.50,9.51,+20023,+951,NA,,1.5,124,-35.13,0.394,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,SEA,Julio Rodríguez,Jacob Lopez,0.47,16.74,+21236,+497,NA,,1.5,132,-26.36,0.534,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,SEA,Josh Naylor,Jacob Lopez,0.40,14.12,+24900,+608,NA,,1.5,153,-25.40,0.548,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,SEA,Randy Arozarena,Jacob Lopez,2.94,22.94,+3306,+336,NA,,1.5,154,-16.43,0.549,2,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,SEA,J.P. Crawford,Jacob Lopez,2.13,18.88,+4605,+430,NA,,1.5,182,-16.58,0.478,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,SEA,Mitch Garver,Jacob Lopez,0.40,6.00,+24900,+1567,NA,,1.5,194,-28.01,0.187,2,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,SEA,Cole Young,Jacob Lopez,0.40,7.78,+24900,+1185,NA,,1.5,222,-23.27,0.345,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,ATH@SEA,SEA,Leo Rivas,Jacob Lopez,0.40,6.00,+24900,+1567,NA,,1.5,260,-21.78,0.310,0,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,CWS,Andrew Benintendi,Merrill Kelly,4.02,26.91,+2386,+272,525,-11.98,1.5,116,-19.39,0.534,3,B,D,B,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,CWS,Munetaka Murakami,Merrill Kelly,13.59,46.79,+636,+114,340,-9.14,1.5,126,2.54,0.709,0,A+,A+,A+,,,priced_no_edge,priced_below_prob_gate,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,CWS,Miguel Vargas,Merrill Kelly,1.50,12.32,+6570,+711,575,-13.32,1.5,125,-32.12,0.368,2,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,CWS,Colson Montgomery,Merrill Kelly,4.96,24.30,+1915,+311,422,-14.20,1.5,130,-19.17,0.658,0,C,D,C,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,CWS,Everson Pereira,Merrill Kelly,9.91,45.22,+909,+121,715,-2.36,1.5,155,6.00,0.931,2,A+,B,A+,,,priced_no_edge,priced_below_prob_gate,"Low — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,CWS,Sam Antonacci,Merrill Kelly,0.40,6.00,+24900,+1567,1350,-6.50,1.5,152,-33.68,0.222,0,D,D,D,,,priced_no_edge,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,CWS,Chase Meidroth,Merrill Kelly,0.40,16.38,+24900,+511,1200,-7.29,1.5,149,-23.78,0.397,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,CWS,Tristan Peters,Merrill Kelly,0.40,6.00,+24900,+1567,1000,-8.69,1.5,180,-29.71,0.180,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,CWS,Reese McGuire,Merrill Kelly,0.40,8.13,+24900,+1129,1120,-7.80,1.5,180,-27.58,0.489,0,D,D,D,,,priced_no_edge,priced_no_edge,"Low — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,CWS@AZ,AZ,Ketel Marte,Sean Burke,7.32,32.67,+1267,+206,NA,,1.5,105,-16.11,0.582,3,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,AZ,Corbin Carroll,Sean Burke,7.55,38.89,+1225,+157,NA,,1.5,100,-11.11,0.648,0,A+,C,A+,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,AZ,Geraldo Perdomo,Sean Burke,0.40,8.52,+24900,+1073,NA,,1.5,146,-32.13,0.407,3,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,AZ,Adrian Del Castillo,Sean Burke,4.78,30.22,+1994,+231,NA,,1.5,146,-10.43,0.622,0,B,D,B,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,AZ,Lourdes Gurriel Jr.,Sean Burke,0.40,6.00,+24900,+1567,NA,,1.5,110,-41.62,0.180,2,D,D,D,,,unpriced,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,AZ,Jose Fernandez,Sean Burke,2.81,23.78,+3457,+321,NA,,1.5,150,-16.22,0.442,0,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,AZ,Nolan Arenado,Sean Burke,1.71,14.62,+5755,+584,NA,,1.5,140,-27.04,0.545,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,AZ,Ildemaro Vargas,Sean Burke,4.54,32.59,+2103,+207,NA,,1.5,155,-6.62,0.577,0,A,D,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,CWS@AZ,AZ,Alek Thomas,Sean Burke,0.99,16.06,+9960,+522,NA,,1.5,180,-19.65,0.345,2,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,LAD,Shohei Ohtani,Landen Roupp,6.44,33.62,+1454,+197,298,-18.69,1.5,-113,-19.43,0.615,6,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,LAD,Kyle Tucker,Landen Roupp,0.40,10.88,+24900,+819,755,-11.30,1.5,132,-32.22,0.515,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,LAD,Freddie Freeman,Landen Roupp,5.07,37.13,+1872,+169,625,-8.72,1.5,115,-9.39,0.560,6,A,D,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,LAD,Teoscar Hernández,Landen Roupp,0.95,16.23,+10411,+516,705,-11.47,1.5,144,-24.75,0.498,5,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,LAD,Max Muncy,Landen Roupp,10.97,41.50,+811,+141,575,-3.84,1.5,165,3.76,0.950,2,A+,A,A+,,,priced_no_edge,priced_below_prob_gate,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,LAD,Dalton Rushing,Landen Roupp,23.87,55.00,+319,-122,390,3.46,1.5,131,11.71,0.950,2,A+,A+,A+,2+ TB,A+,qualified,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,LAD,Hyeseong Kim,Landen Roupp,0.70,22.49,+14255,+345,2200,-3.65,1.5,195,-11.41,0.614,4,C,D,C,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,LAD,Alex Call,Landen Roupp,0.40,10.73,+24900,+832,1300,-6.74,1.5,210,-21.53,0.425,0,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,LAD,Alex Freeland,Landen Roupp,0.40,9.09,+24900,+1000,1300,-6.74,1.5,256,-19.00,0.390,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-21,LAD@SF,SF,Willy Adames,Yoshinobu Yamamoto,3.78,25.64,+2542,+290,NA,,1.5,162,-12.52,0.633,12,C,D,C,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,SF,Luis Arraez,Yoshinobu Yamamoto,0.40,8.14,+24900,+1128,NA,,1.5,142,-33.18,0.468,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,SF,Matt Chapman,Yoshinobu Yamamoto,0.40,10.20,+24900,+881,NA,,1.5,184,-25.02,0.447,12,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,SF,Rafael Devers,Yoshinobu Yamamoto,0.92,16.04,+10772,+523,NA,,1.5,175,-20.33,0.425,9,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,SF,Casey Schmitt,Yoshinobu Yamamoto,5.88,34.51,+1601,+190,NA,,1.5,183,-0.82,0.744,12,A,C,A,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,SF,Jung Hoo Lee,Yoshinobu Yamamoto,0.40,16.20,+24900,+517,NA,,1.5,178,-19.77,0.564,10,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,SF,Heliot Ramos,Yoshinobu Yamamoto,3.93,26.56,+2444,+276,NA,,1.5,200,-6.77,0.712,15,B,D,B,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,SF,Drew Gilbert,Yoshinobu Yamamoto,4.33,28.46,+2207,+251,NA,,1.5,283,2.35,0.664,4,B,D,B,,,unpriced,priced_below_prob_gate,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-21,LAD@SF,SF,Patrick Bailey,Yoshinobu Yamamoto,0.40,6.00,+24900,+1567,NA,,1.5,299,-19.06,0.230,6,D,D,D,,,unpriced,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
<!-- batter-outlooks-csv:end -->
*/
