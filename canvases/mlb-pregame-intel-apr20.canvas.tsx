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
    flags: "market_odds_unavailable;not_scored_non_pregame",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Jack Flaherty vs Sonny Gray. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 4th — HOU 6, CLE 2",
    awayScore: 6,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 83.04,
    impliedHomePct: 16.96,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Spencer Arrighetti vs Slade Cecconi. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Carlos Correa", team: "HOU", hrPct: 2.4, tb2Pct: 22.3, tier: "HR D / TB C", note: "Display only — Bottom 4th — HOU 6, CLE 2; RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 17.9, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jose Altuve", team: "HOU", hrPct: 2.5, tb2Pct: 22.3, tier: "HR D / TB C", note: "Display only — Bottom 4th — HOU 6, CLE 2; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Christian Walker", team: "HOU", hrPct: 5.8, tb2Pct: 25.1, tier: "HR D / TB C", note: "Display only — Bottom 4th — HOU 6, CLE 2; RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 4.5, not 1.5-aligned" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 4th — HOU 6, CLE 2; RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 5.5, not 1.5-aligned" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 2.6, tb2Pct: 27.6, tier: "HR D / TB B", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 4th — HOU 6, CLE 2; RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Dustin Harris", team: "HOU", hrPct: 0.4, tb2Pct: 6.7, tier: "HR D / TB D", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brice Matthews", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 4th — HOU 6, CLE 2; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 3.8, tb2Pct: 22.4, tier: "HR D / TB C", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "José Ramírez", team: "CLE", hrPct: 8.3, tb2Pct: 40.2, tier: "HR B / TB A+", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 0.4, tb2Pct: 15.2, tier: "HR D / TB D", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 0.4, tb2Pct: 8.7, tier: "HR D / TB D", note: "Display only — Bottom 4th — HOU 6, CLE 2; RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "George Valera", team: "CLE", hrPct: 0.4, tb2Pct: 21.0, tier: "HR D / TB C", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Juan Brito", team: "CLE", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Bo Naylor", team: "CLE", hrPct: 3.2, tb2Pct: 22.5, tier: "HR D / TB C", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 1.4, tb2Pct: 20.1, tier: "HR D / TB C", note: "Display only — Bottom 4th — HOU 6, CLE 2; LHB vs RHP; contact-driven profile; vs tough pitcher" },
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
    gameStatusNote: "Top 3rd — CIN 2, TB 1",
    awayScore: 2,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 58.62,
    impliedHomePct: 41.38,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Rhett Lowder vs Jesse Scholtens. Run compute to refresh lineups, weather, and model outputs before staking.",
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
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 9.5, tb2Pct: 39.2, tier: "HR B / TB A+", note: "Display only — Top 3rd — CIN 2, TB 1; LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 11.8, tb2Pct: 43.1, tier: "HR A / TB A+", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; elite power indicators; vs tough pitcher; TB book at 4.5, not 1.5-aligned" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 0.6, tb2Pct: 15.8, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 3.7, tb2Pct: 20.7, tier: "HR D / TB C", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 4.6, tb2Pct: 22.9, tier: "HR D / TB C", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.4, tb2Pct: 9.1, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Junior Caminero", team: "TB", hrPct: 6.8, tb2Pct: 31.1, tier: "HR C / TB B", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 4.4, tb2Pct: 24.1, tier: "HR D / TB C", note: "Display only — Top 3rd — CIN 2, TB 1; LHB vs RHP; hard-contact profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 3.4, tb2Pct: 27.1, tier: "HR D / TB B", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jake Fraley", team: "TB", hrPct: 0.4, tb2Pct: 12.0, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 1.1, tb2Pct: 13.8, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Nick Fortes", team: "TB", hrPct: 1.3, tb2Pct: 23.3, tier: "HR D / TB C", note: "Display only — Top 3rd — CIN 2, TB 1; RHB vs RHP; hard-contact profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Richie Palacios", team: "TB", hrPct: 2.5, tb2Pct: 24.1, tier: "HR D / TB C", note: "Display only — Top 3rd — CIN 2, TB 1; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.4, tb2Pct: 7.1, tier: "HR D / TB D", note: "Display only — Top 3rd — CIN 2, TB 1; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
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
    gameStatusNote: "Top 4th — STL 0, MIA 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 1.72,
    impliedHomePct: 98.28,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Michael McGreevy vs Max Meyer. Run compute to refresh lineups, weather, and model outputs before staking.",
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
      { batter: "JJ Wetherholt", team: "STL", hrPct: 3.2, tb2Pct: 19.4, tier: "HR D / TB D", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Iván Herrera", team: "STL", hrPct: 4.5, tb2Pct: 24.2, tier: "HR D / TB C", note: "Display only — Top 4th — STL 0, MIA 0; RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Alec Burleson", team: "STL", hrPct: 9.1, tb2Pct: 41.2, tier: "HR B / TB A+", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jordan Walker", team: "STL", hrPct: 17.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Top 4th — STL 0, MIA 0; RHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 1.8, tb2Pct: 11.8, tier: "HR D / TB D", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.4, tb2Pct: 14.9, tier: "HR D / TB D", note: "Display only — Top 4th — STL 0, MIA 0; RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ramón Urías", team: "STL", hrPct: 4.9, tb2Pct: 25.3, tier: "HR D / TB C", note: "Display only — Top 4th — STL 0, MIA 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Thomas Saggese", team: "STL", hrPct: 0.4, tb2Pct: 9.6, tier: "HR D / TB D", note: "Display only — Top 4th — STL 0, MIA 0; RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Victor Scott II", team: "STL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 1.7, tb2Pct: 10.6, tier: "HR D / TB D", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Kyle Stowers", team: "MIA", hrPct: 13.3, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 12.9, tb2Pct: 49.9, tier: "HR A / TB A+", note: "Display only — Top 4th — STL 0, MIA 0; RHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; priced lean: HR (A)" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 6.8, tb2Pct: 32.8, tier: "HR C / TB A", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 9.1, tb2Pct: 38.0, tier: "HR B / TB A+", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Agustín Ramírez", team: "MIA", hrPct: 4.5, tb2Pct: 22.6, tier: "HR D / TB C", note: "Display only — Top 4th — STL 0, MIA 0; RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 10.1, tb2Pct: 34.3, tier: "HR B / TB A", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Graham Pauley", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 4th — STL 0, MIA 0; LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Connor Norby", team: "MIA", hrPct: 7.8, tb2Pct: 32.3, tier: "HR C / TB A", note: "Display only — Top 4th — STL 0, MIA 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
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
    gameStatusNote: "Bottom 3rd — ATL 0, WSH 2",
    awayScore: 0,
    homeScore: 2,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: null,
    homeAmerican: null,
    impliedAwayPct: 31.17,
    impliedHomePct: 68.83,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Bryce Elder vs Jake Irvin. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 7.3, tb2Pct: 36.7, tier: "HR C / TB A", note: "Display only — Bottom 3rd — ATL 0, WSH 2; RHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 9.8, tb2Pct: 39.7, tier: "HR B / TB A+", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Matt Olson", team: "ATL", hrPct: 12.4, tb2Pct: 44.1, tier: "HR A / TB A+", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Austin Riley", team: "ATL", hrPct: 7.7, tb2Pct: 34.2, tier: "HR C / TB A", note: "Display only — Bottom 3rd — ATL 0, WSH 2; RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 4.1, tb2Pct: 22.6, tier: "HR D / TB C", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Michael Harris II", team: "ATL", hrPct: 14.9, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; priced lean: HR (A+)" },
      { batter: "Dominic Smith", team: "ATL", hrPct: 11.9, tb2Pct: 45.8, tier: "HR A / TB A+", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jorge Mateo", team: "ATL", hrPct: 7.0, tb2Pct: 35.2, tier: "HR C / TB A", note: "Display only — Bottom 3rd — ATL 0, WSH 2; RHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Mike Yastrzemski", team: "ATL", hrPct: 1.9, tb2Pct: 11.6, tier: "HR D / TB D", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "James Wood", team: "WSH", hrPct: 10.6, tb2Pct: 45.8, tier: "HR A / TB A+", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; hard-contact profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brady House", team: "WSH", hrPct: 0.4, tb2Pct: 7.8, tier: "HR D / TB D", note: "Display only — Bottom 3rd — ATL 0, WSH 2; RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 5.3, tb2Pct: 36.2, tier: "HR D / TB A", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 0.4, tb2Pct: 13.6, tier: "HR D / TB D", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.4, tb2Pct: 14.2, tier: "HR D / TB D", note: "Display only — Bottom 3rd — ATL 0, WSH 2; RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "José Tena", team: "WSH", hrPct: 0.4, tb2Pct: 14.4, tier: "HR D / TB D", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 3rd — ATL 0, WSH 2; LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "BAL@KC",
    venue: "MLB Park",
    away: "BAL",
    home: "KC",
    timeEt: "7:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "Warmup",
    gameStatusNote: "Warmup — Top 1st — BAL 0, KC 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -115,
    homeAmerican: -105,
    impliedAwayPct: 51.20,
    impliedHomePct: 48.80,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Kyle Bradish vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 7.1, tb2Pct: 28.8, tier: "HR C / TB B", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 1.7, tb2Pct: 23.2, tier: "HR D / TB C", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 2.3, tb2Pct: 19.2, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; RHB vs RHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 3.5, tb2Pct: 15.9, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 8.0, tb2Pct: 34.8, tier: "HR B / TB A", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Colton Cowser", team: "BAL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 3.6, tb2Pct: 30.2, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Blaze Alexander", team: "BAL", hrPct: 0.4, tb2Pct: 9.3, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; RHB vs RHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 1.5, tb2Pct: 18.4, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 2.7, tb2Pct: 28.2, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.4, tb2Pct: 6.2, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Salvador Perez", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Carter Jensen", team: "KC", hrPct: 7.9, tb2Pct: 30.4, tier: "HR B / TB B", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 3.5, tb2Pct: 26.4, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — BAL 0, KC 0; LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "PHI@CHC",
    venue: "MLB Park",
    away: "PHI",
    home: "CHC",
    timeEt: "7:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "Warmup",
    gameStatusNote: "Warmup — Top 1st — PHI 0, CHC 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -105,
    homeAmerican: -115,
    impliedAwayPct: 48.77,
    impliedHomePct: 51.23,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Aaron Nola vs Colin Rea. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 10.7, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 12.1, tb2Pct: 43.5, tier: "HR A / TB A+", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 6.9, tb2Pct: 38.2, tier: "HR C / TB A+", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Adolis García", team: "PHI", hrPct: 1.0, tb2Pct: 11.4, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; RHB vs RHP; above-average damage; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 2.1, tb2Pct: 24.6, tier: "HR D / TB C", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; RHB vs RHP; limited power profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Bryson Stott", team: "PHI", hrPct: 0.4, tb2Pct: 6.7, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Justin Crawford", team: "PHI", hrPct: 0.4, tb2Pct: 13.2, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; limited power profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Rafael Marchán", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 1.9, tb2Pct: 24.8, tier: "HR D / TB C", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 0.4, tb2Pct: 12.3, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Ian Happ", team: "CHC", hrPct: 7.6, tb2Pct: 32.9, tier: "HR C / TB A", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 11.9, tb2Pct: 44.4, tier: "HR A / TB A+", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Michael Conforto", team: "CHC", hrPct: 2.2, tb2Pct: 29.3, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Miguel Amaya", team: "CHC", hrPct: 0.4, tb2Pct: 10.1, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.6, tb2Pct: 15.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; LHB vs RHP; hard-contact profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 5.4, tb2Pct: 25.8, tier: "HR D / TB C", note: "Display only — Warmup — Top 1st — PHI 0, CHC 0; RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "LAD@COL",
    venue: "MLB Park",
    away: "LAD",
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
    awayAmerican: -220,
    homeAmerican: 184,
    impliedAwayPct: 66.13,
    impliedHomePct: 33.87,
    modelAwayPct: 65.14,
    modelHomePct: 34.86,
    edgeAwayPct: -0.99,
    edgeHomePct: 0.99,
    prediction: "LAD",
    decisionTier: "D",
    edgeOnPickPct: -0.99,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Justin Wrobleski vs Jose Quintana. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Shohei Ohtani", "DH"],
      ["2", "Alex Call", "RF"],
      ["3", "Will Smith", "C"],
      ["4", "Teoscar Hernández", "LF"],
      ["5", "Andy Pages", "CF"],
      ["6", "Miguel Rojas", "SS"],
      ["7", "Max Muncy", "3B"],
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
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 18.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Alex Call", team: "LAD", hrPct: 8.7, tb2Pct: 39.1, tier: "HR B / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Will Smith", team: "LAD", hrPct: 9.2, tb2Pct: 34.2, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 13.5, tb2Pct: 41.2, tier: "HR A+ / TB A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Andy Pages", team: "LAD", hrPct: 14.6, tb2Pct: 53.5, tier: "HR A+ / TB A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Miguel Rojas", team: "LAD", hrPct: 7.6, tb2Pct: 38.4, tier: "HR C / TB A+", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Max Muncy", team: "LAD", hrPct: 18.6, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Santiago Espinal", team: "LAD", hrPct: 4.1, tb2Pct: 14.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 25.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
    ],
    propsHome: [
      { batter: "Jordan Beck", team: "COL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 0.4, tb2Pct: 10.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 8.5, tb2Pct: 35.6, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Tyler Freeman", team: "COL", hrPct: 0.4, tb2Pct: 8.9, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 1.8, tb2Pct: 21.7, tier: "HR D / TB C", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Troy Johnston", team: "COL", hrPct: 2.8, tb2Pct: 28.9, tier: "HR D / TB B", note: "LHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Willi Castro", team: "COL", hrPct: 1.1, tb2Pct: 18.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Kyle Karros", team: "COL", hrPct: 1.0, tb2Pct: 16.3, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brett Sullivan", team: "COL", hrPct: 0.4, tb2Pct: 14.2, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
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
    awayAmerican: -116,
    homeAmerican: -102,
    impliedAwayPct: 51.44,
    impliedHomePct: 48.56,
    modelAwayPct: 50.20,
    modelHomePct: 49.80,
    edgeAwayPct: -1.24,
    edgeHomePct: 1.24,
    prediction: "TOR",
    decisionTier: "D",
    edgeOnPickPct: -1.24,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Dylan Cease vs Reid Detmers. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
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
      { batter: "Davis Schneider", team: "TOR", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.4, tb2Pct: 12.8, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 1.7, tb2Pct: 25.3, tier: "HR D / TB C", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Eloy Jiménez", team: "TOR", hrPct: 0.4, tb2Pct: 8.5, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 0.7, tb2Pct: 13.9, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Lenyn Sosa", team: "TOR", hrPct: 0.4, tb2Pct: 12.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Daulton Varsho", team: "TOR", hrPct: 1.4, tb2Pct: 21.7, tier: "HR D / TB C", note: "LHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Myles Straw", team: "TOR", hrPct: 2.4, tb2Pct: 26.6, tier: "HR D / TB B", note: "RHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Tyler Heineman", team: "TOR", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Zach Neto", team: "LAA", hrPct: 0.7, tb2Pct: 17.3, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Mike Trout", team: "LAA", hrPct: 10.4, tb2Pct: 42.9, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 3.5, tb2Pct: 22.4, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 0.4, tb2Pct: 9.1, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jo Adell", team: "LAA", hrPct: 0.7, tb2Pct: 18.6, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 0.4, tb2Pct: 18.3, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
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
    awayAmerican: 120,
    homeAmerican: -142,
    impliedAwayPct: 43.32,
    impliedHomePct: 56.68,
    modelAwayPct: 44.30,
    modelHomePct: 55.70,
    edgeAwayPct: 0.98,
    edgeHomePct: -0.98,
    prediction: "SEA",
    decisionTier: "D",
    edgeOnPickPct: -0.98,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: J.T. Ginn vs Emerson Hancock. Run compute to refresh lineups, weather, and model outputs before staking.",
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
      { batter: "Nick Kurtz", team: "ATH", hrPct: 6.0, tb2Pct: 32.2, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 5.1, tb2Pct: 31.0, tier: "HR D / TB B", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 0.4, tb2Pct: 16.5, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 0.9, tb2Pct: 18.8, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.4, tb2Pct: 9.7, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.4, tb2Pct: 12.8, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Max Muncy", team: "ATH", hrPct: 3.2, tb2Pct: 25.3, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 0.4, tb2Pct: 8.4, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 0.4, tb2Pct: 13.1, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 2.0, tb2Pct: 21.4, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 0.4, tb2Pct: 10.4, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 1.2, tb2Pct: 21.5, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Luke Raley", team: "SEA", hrPct: 11.0, tb2Pct: 49.1, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 5.0, tb2Pct: 31.2, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
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
2026-04-20,DET,BOS,11:10 AM,Jack Flaherty,Sonny Gray,,,,,,48F / 10 mph wind / 0% precip / Open,47.6,10.1,0,0.445,0.467,0.468,0.406,final,Final,Final,"Final — DET 6, BOS 8",6,8,Partial,market_odds_unavailable,50.00,50.00,,,,,,,,,,,not_scored,,not_scored,market_odds_unavailable,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Jack Flaherty vs Sonny Gray. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,HOU,CLE,6:10 PM,Spencer Arrighetti,Slade Cecconi,-750,455,12.5,-115,-115,38F / 5 mph wind / 0% precip / Open,37.8,4.7,0,0.317,0.335,0.439,0.507,live,Live,In Progress,"Bottom 4th — HOU 6, CLE 2",6,2,Verified,,83.04,16.96,,,,,,,,,,,not_scored,,not_scored,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Spencer Arrighetti vs Slade Cecconi. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,CIN,TB,6:40 PM,Rhett Lowder,Jesse Scholtens,-164,128,9.5,110,-145,Live weather via compute,,,,0.367,0.338,0.421,0.475,live,Live,In Progress,"Top 3rd — CIN 2, TB 1",2,1,Verified,,58.62,41.38,,,,,,,,,,,not_scored,,not_scored,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Rhett Lowder vs Jesse Scholtens. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,STL,MIA,6:40 PM,Michael McGreevy,Max Meyer,-1,-130,5.5,-125,-105,74F / 10 mph wind / 43% precip / Retractable,73.5,10.5,43,0.299,0.420,0.506,0.511,live,Live,In Progress,"Top 4th — STL 0, MIA 0",0,0,Verified,,1.72,98.28,,,,,,,,,,,not_scored,,not_scored,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Michael McGreevy vs Max Meyer. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,ATL,WSH,6:45 PM,Bryce Elder,Jake Irvin,202,-272,7.0,-130,100,52F / 13 mph wind / 0% precip / Open,51.8,13.0,0,0.461,0.326,0.608,0.487,live,Live,In Progress,"Bottom 3rd — ATL 0, WSH 2",0,2,Verified,,31.17,68.83,,,,,,,,,,,not_scored,,not_scored,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Bryce Elder vs Jake Irvin. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,BAL,KC,7:40 PM,Kyle Bradish,Seth Lugo,-115,-104,9.0,-106,-115,71F / 12 mph wind / 0% precip / Open,71.1,12.3,0,0.473,0.314,0.476,0.369,live,Live,Warmup,"Warmup — Top 1st — BAL 0, KC 0",0,0,Verified,,51.20,48.80,,,,,,,,,,,not_scored,,not_scored,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Kyle Bradish vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,PHI,CHC,7:40 PM,Aaron Nola,Colin Rea,-102,-113,7.5,-115,-105,46F / 12 mph wind / 1% precip / Open,46.5,11.5,1,0.462,0.413,0.429,0.553,live,Live,Warmup,"Warmup — Top 1st — PHI 0, CHC 0",0,0,Verified,,48.77,51.23,,,,,,,,,,,not_scored,,not_scored,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Aaron Nola vs Colin Rea. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-20,LAD,COL,8:40 PM,Justin Wrobleski,Jose Quintana,-220,184,12.0,-108,-114,75F / 7 mph wind / 0% precip / Open,74.9,6.6,0,0.346,0.377,0.610,0.514,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,66.13,33.87,62.17,37.83,65.14,34.86,0.25,65.14,34.86,-0.99,0.99,LAD,D,-0.99,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Justin Wrobleski vs Jose Quintana. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-20,TOR,LAA,9:38 PM,Dylan Cease,Reid Detmers,-115,-102,7.5,-114,-108,66F / 7 mph wind / 0% precip / Open,66.2,6.9,0,0.422,0.384,0.481,0.593,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,51.44,48.56,46.48,53.52,50.20,49.80,0.25,50.20,49.80,-1.24,1.24,TOR,D,-1.24,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Dylan Cease vs Reid Detmers. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-20,ATH,SEA,9:40 PM,J.T. Ginn,Emerson Hancock,123,-142,8.0,-116,-105,67F / 0 mph wind / 4% precip / Retractable,66.6,0.4,4,0.392,0.393,0.480,0.470,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,43.32,56.68,47.25,52.75,44.30,55.70,0.25,44.30,55.70,0.98,-0.98,SEA,D,-0.98,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: J.T. Ginn vs Emerson Hancock. Run compute to refresh lineups, weather, and model outputs before staking.",scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-20,DET@BOS,DET,Kevin McGonigle,Sonny Gray,,,,,NA,,1.5,150,,0.618,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,DET,Gleyber Torres,Sonny Gray,,,,,NA,,1.5,150,,0.375,9,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,DET,Colt Keith,Sonny Gray,,,,,NA,,1.5,150,,0.387,3,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,DET,Riley Greene,Sonny Gray,,,,,NA,,1.5,150,,0.522,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,DET,Dillon Dingler,Sonny Gray,,,,,NA,,1.5,150,,0.814,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,DET,Kerry Carpenter,Sonny Gray,,,,,NA,,1.5,100,,0.711,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,DET,Matt Vierling,Sonny Gray,,,,,NA,,1.5,250,,0.430,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,DET,Hao-Yu  Lee,Sonny Gray,,,,,NA,,1.5,150,,0.180,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,DET,Jake Rogers,Sonny Gray,,,,,NA,,1.5,150,,0.180,4,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Roman Anthony,Jack Flaherty,,,,,NA,,1.5,150,,0.389,0,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Willson Contreras,Jack Flaherty,,,,,NA,,1.5,150,,0.865,30,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Wilyer Abreu,Jack Flaherty,,,,,NA,,1.5,150,,0.297,8,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Masataka Yoshida,Jack Flaherty,,,,,NA,,1.5,150,,0.537,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Trevor Story,Jack Flaherty,,,,,NA,,1.5,150,,0.470,11,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Jarren Duran,Jack Flaherty,,,,,NA,,1.5,150,,0.327,5,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Caleb Durbin,Jack Flaherty,,,,,NA,,1.5,250,,0.375,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Marcelo Mayer,Jack Flaherty,,,,,NA,,1.5,150,,0.212,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,DET@BOS,BOS,Carlos Narváez,Jack Flaherty,,,,,NA,,1.5,200,,0.180,2,,,,,,not_scored,not_scored,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Carlos Correa,Slade Cecconi,2.42,22.26,+4035,+349,1900,-2.58,2.5,132,,0.427,2,C,D,C,,,priced_no_edge,line_mismatch_2.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Yordan Alvarez,Slade Cecconi,17.92,55.00,+458,-122,750,6.16,1.5,142,13.68,0.912,2,A+,A+,A+,2+ TB,A+,qualified,qualified,Display only,full,not_scored
2026-04-20,HOU@CLE,HOU,Jose Altuve,Slade Cecconi,2.52,22.31,+3862,+348,1300,-4.62,0.5,150,,0.492,4,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Christian Walker,Slade Cecconi,5.80,25.09,+1624,+298,850,-4.73,4.5,110,,0.455,0,C,D,C,,,priced_no_edge,line_mismatch_4.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Isaac Paredes,Slade Cecconi,0.40,6.00,+24900,+1567,1050,-8.30,5.5,124,,0.256,3,D,D,D,,,priced_no_edge,line_mismatch_5.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Taylor Trammell,Slade Cecconi,2.57,27.60,+3793,+262,850,-7.96,0.5,125,,0.523,3,B,D,B,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Yainer Diaz,Slade Cecconi,0.40,6.00,+24900,+1567,1700,-5.16,1.5,121,-39.25,0.308,4,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,HOU@CLE,HOU,Dustin Harris,Slade Cecconi,0.40,6.71,+24900,+1390,2200,-3.95,0.5,180,,0.396,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,HOU,Brice Matthews,Slade Cecconi,0.40,6.00,+24900,+1567,1100,-7.93,2.5,198,,0.180,1,D,D,D,,,priced_no_edge,line_mismatch_2.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Steven Kwan,Spencer Arrighetti,0.40,6.00,+24900,+1567,1150,-7.60,0.5,-130,,0.409,5,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Chase DeLauter,Spencer Arrighetti,3.83,22.40,+2512,+346,700,-8.67,0.5,-118,,0.366,0,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,José Ramírez,Spencer Arrighetti,8.25,40.18,+1112,+149,575,-6.56,2.5,-8,,0.873,6,A+,B,A+,,,priced_no_edge,line_mismatch_2.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Kyle Manzardo,Spencer Arrighetti,0.40,15.20,+24831,+558,700,-12.10,1.5,128,-28.66,0.536,1,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,HOU@CLE,CLE,Rhys Hoskins,Spencer Arrighetti,0.40,8.73,+24900,+1046,600,-13.89,1.5,122,-36.32,0.413,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,HOU@CLE,CLE,George Valera,Spencer Arrighetti,0.40,21.02,+24900,+376,950,-9.12,1.5,138,-20.99,0.479,0,C,D,C,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,HOU@CLE,CLE,Juan Brito,Spencer Arrighetti,0.40,6.00,+24900,+1567,1700,-5.16,0.5,125,,0.310,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Bo Naylor,Spencer Arrighetti,3.24,22.47,+2988,+345,800,-7.87,0.5,150,,0.463,3,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,HOU@CLE,CLE,Brayan Rocchio,Spencer Arrighetti,1.36,20.11,+7280,+397,1800,-3.91,1.5,150,-19.89,0.713,2,C,D,C,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,CIN@TB,CIN,TJ Friedl,Jesse Scholtens,0.40,6.00,+24900,+1567,900,-9.60,0.5,-143,,0.272,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Matt McLain,Jesse Scholtens,0.40,6.00,+24900,+1567,850,-10.13,2.5,-139,,0.285,1,D,D,D,,,priced_no_edge,line_mismatch_2.5,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Elly De La Cruz,Jesse Scholtens,9.45,39.22,+958,+155,600,-4.83,0.5,-150,,0.682,0,A+,B,A+,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Sal Stewart,Jesse Scholtens,11.83,43.09,+746,+132,550,-3.56,4.5,-146,,0.707,0,A+,A,A+,,,priced_no_edge,line_mismatch_4.5,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Eugenio Suárez,Jesse Scholtens,0.55,15.79,+18072,+534,510,-15.84,0.5,-141,,0.523,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Spencer Steer,Jesse Scholtens,3.72,20.65,+2591,+384,750,-8.05,0.5,-110,,0.492,0,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Tyler Stephenson,Jesse Scholtens,4.59,22.88,+2077,+337,650,-8.74,0.5,-112,,0.456,0,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Rece Hinds,Jesse Scholtens,0.40,6.00,+24900,+1567,700,-12.10,0.5,-115,,0.189,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,CIN,Ke'Bryan Hayes,Jesse Scholtens,0.40,6.00,+24900,+1567,800,-10.71,0.5,-148,,0.180,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Chandler Simpson,Rhett Lowder,0.40,9.11,+24900,+998,2400,-3.60,1.5,-130,-47.41,0.406,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,CIN@TB,TB,Junior Caminero,Rhett Lowder,6.80,31.07,+1371,+222,390,-13.61,1.5,-168,-31.62,0.671,0,B,C,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,CIN@TB,TB,Jonathan Aranda,Rhett Lowder,4.41,24.14,+2169,+314,650,-8.93,0.5,-148,,0.441,0,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Yandy Díaz,Rhett Lowder,3.45,27.14,+2799,+268,750,-8.31,0.5,-186,,0.511,0,B,D,B,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Jake Fraley,Rhett Lowder,0.44,12.00,+22554,+733,750,-11.32,0.5,-124,,0.411,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Cedric Mullins,Rhett Lowder,1.10,13.82,+8994,+624,575,-13.72,0.5,-11,,0.539,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Nick Fortes,Rhett Lowder,1.29,23.34,+7633,+328,950,-8.23,0.5,-124,,0.452,0,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Richie Palacios,Rhett Lowder,2.51,24.08,+3879,+315,850,-8.01,0.5,105,,0.508,0,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,CIN@TB,TB,Taylor Walls,Rhett Lowder,0.40,7.05,+24900,+1318,1100,-7.93,0.5,115,,0.332,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,JJ Wetherholt,Max Meyer,3.23,19.37,+2994,+416,1200,-4.46,0.5,10,,0.515,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,Iván Herrera,Max Meyer,4.45,24.21,+2147,+313,1000,-4.64,0.5,-2,,0.466,3,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,Alec Burleson,Max Meyer,9.11,41.23,+998,+143,800,-2.00,0.5,-4,,0.623,2,A+,B,A+,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,Jordan Walker,Max Meyer,16.98,55.00,+489,-122,850,6.45,1.5,115,8.49,0.889,3,A+,A+,A+,2+ TB,A+,qualified,qualified,Display only,full,not_scored
2026-04-20,STL@MIA,STL,Nolan Gorman,Max Meyer,1.75,11.78,+5608,+749,600,-12.53,0.5,102,,0.389,3,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,Masyn Winn,Max Meyer,0.40,14.90,+24900,+571,900,-9.60,0.5,-140,,0.533,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,Ramón Urías,Max Meyer,4.93,25.32,+1927,+295,950,-4.59,0.5,-125,,0.539,0,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,Thomas Saggese,Max Meyer,0.40,9.61,+24900,+941,1000,-8.69,0.5,-124,,0.411,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,STL,Victor Scott II,Max Meyer,0.40,6.00,+24900,+1567,1800,-4.86,0.5,108,,0.190,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Jakob Marsee,Michael McGreevy,1.73,10.64,+5695,+840,900,-8.27,0.5,-146,,0.308,3,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Kyle Stowers,Michael McGreevy,13.32,55.00,+651,-122,575,-1.49,0.5,-157,,0.950,0,A+,A+,A+,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Otto Lopez,Michael McGreevy,12.89,49.88,+676,+100,1150,4.89,0.5,-166,,0.697,4,A,A,A+,HR,A,qualified,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Xavier Edwards,Michael McGreevy,6.81,32.76,+1369,+205,1900,1.81,0.5,-195,,0.431,3,A,C,A,,,priced_below_tier,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Liam Hicks,Michael McGreevy,9.11,38.05,+998,+163,1800,3.84,0.5,-118,,0.549,3,A+,B,A+,,,priced_below_tier,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Agustín Ramírez,Michael McGreevy,4.49,22.63,+2126,+342,1050,-4.20,0.5,-108,,0.438,4,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Owen Caissie,Michael McGreevy,10.11,34.34,+889,+191,800,-1.00,0.5,-105,,0.343,0,A,B,A,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Graham Pauley,Michael McGreevy,0.40,6.00,+24900,+1567,1900,-4.60,0.5,125,,0.246,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,STL@MIA,MIA,Connor Norby,Michael McGreevy,7.79,32.33,+1184,+209,1700,2.23,0.5,102,,0.634,0,A,C,A,,,priced_below_tier,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Ronald Acuña Jr.,Jake Irvin,7.34,36.65,+1262,+173,600,-6.94,0.5,-160,,0.572,5,A,C,A,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Drake Baldwin,Jake Irvin,9.84,39.75,+917,+152,700,-2.66,0.5,-158,,0.516,4,A+,B,A+,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Matt Olson,Jake Irvin,12.36,44.07,+709,+127,575,-2.46,0.5,-122,,0.699,18,A+,A,A+,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Austin Riley,Jake Irvin,7.65,34.16,+1206,+193,650,-5.68,0.5,-130,,0.686,12,A,C,A,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Ozzie Albies,Jake Irvin,4.14,22.60,+2314,+342,900,-5.86,0.5,-121,,0.580,13,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Michael Harris II,Jake Irvin,14.93,55.00,+570,-122,750,3.17,0.5,-121,,0.905,20,A+,A+,A+,HR,A+,qualified,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Dominic Smith,Jake Irvin,11.89,45.83,+741,+118,950,2.36,0.5,-113,,0.782,7,A+,A,A+,,,priced_below_gate,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Jorge Mateo,Jake Irvin,7.04,35.16,+1321,+184,1100,-1.30,0.5,107,,0.425,0,A,C,A,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,ATL,Mike Yastrzemski,Jake Irvin,1.91,11.63,+5135,+760,1050,-6.79,0.5,150,,0.309,12,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,James Wood,Bryce Elder,10.60,45.83,+843,+118,650,-2.73,0.5,121,,0.907,6,A+,A,A+,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,Luis García Jr.,Bryce Elder,0.40,6.00,+24900,+1567,1100,-7.93,0.5,120,,0.180,12,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,Brady House,Bryce Elder,0.40,7.83,+24900,+1176,800,-10.71,1.5,8,-84.76,0.376,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,ATL@WSH,WSH,CJ Abrams,Bryce Elder,5.35,36.22,+1770,+176,700,-7.15,0.5,-142,,0.775,17,A,D,A,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,Daylen Lile,Bryce Elder,0.40,13.55,+24900,+638,950,-9.12,0.5,-156,,0.476,4,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,Jacob Young,Bryce Elder,0.40,14.21,+24900,+604,1300,-6.74,1.5,-120,-40.34,0.484,1,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,ATL@WSH,WSH,José Tena,Bryce Elder,0.40,14.44,+24900,+593,1100,-7.93,0.5,-112,,0.549,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,Drew Millas,Bryce Elder,0.40,6.00,+24900,+1567,1800,-4.86,0.5,-103,,0.392,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,ATL@WSH,WSH,Nasim Nuñez,Bryce Elder,0.40,6.00,+24900,+1567,1100,-7.93,0.5,115,,0.248,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,BAL@KC,BAL,Gunnar Henderson,Seth Lugo,7.06,28.77,+1316,+248,385,-13.56,1.5,-115,-24.71,0.646,6,B,C,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Taylor Ward,Seth Lugo,1.66,23.23,+5928,+330,462,-16.13,1.5,120,-22.22,0.548,7,C,D,C,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Dylan Beavers,Seth Lugo,0.40,6.00,+24900,+1567,512,-15.94,1.5,141,-35.49,0.210,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Pete Alonso,Seth Lugo,2.25,19.19,+4344,+421,350,-19.97,1.5,103,-30.07,0.439,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Samuel Basallo,Seth Lugo,3.53,15.90,+2736,+529,490,-13.42,1.5,132,-27.20,0.454,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Jeremiah Jackson,Seth Lugo,8.00,34.79,+1150,+187,512,-8.34,1.5,122,-10.25,0.912,0,A,B,A,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Colton Cowser,Seth Lugo,0.40,6.00,+24900,+1567,538,-15.27,0.5,-130,,0.192,3,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,BAL@KC,BAL,Leody Taveras,Seth Lugo,3.57,30.24,+2698,+231,700,-8.93,1.5,145,-10.58,0.635,1,B,D,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,BAL,Blaze Alexander,Seth Lugo,0.40,9.26,+24900,+980,700,-12.10,0.5,-148,,0.245,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Maikel Garcia,Kyle Bradish,1.46,18.41,+6758,+443,675,-11.44,1.5,116,-27.89,0.406,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Bobby Witt Jr.,Kyle Bradish,2.68,28.18,+3627,+255,415,-16.73,1.5,-110,-24.20,0.518,0,B,D,B,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Vinnie Pasquantino,Kyle Bradish,0.40,6.24,+24900,+1503,430,-18.47,1.5,124,-38.41,0.350,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Salvador Perez,Kyle Bradish,0.40,6.00,+24900,+1567,370,-20.88,1.5,120,-39.45,0.217,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Carter Jensen,Kyle Bradish,7.86,30.38,+1172,+229,538,-7.81,0.5,-155,,0.740,0,B,B,B,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Michael Massey,Kyle Bradish,0.40,6.00,+24900,+1567,575,-14.41,1.5,170,-31.04,0.291,0,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,BAL@KC,KC,Jac Caglianone,Kyle Bradish,3.46,26.43,+2791,+278,650,-9.87,0.5,-146,,0.439,0,B,D,B,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Isaac Collins,Kyle Bradish,0.40,6.00,+24900,+1567,825,-10.41,0.5,-132,,0.180,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,BAL@KC,KC,Kyle Isbel,Kyle Bradish,0.40,6.00,+24900,+1567,900,-9.60,0.5,-146,,0.180,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Trea Turner,Colin Rea,0.40,10.66,+24900,+838,650,-12.93,1.5,118,-35.21,0.463,17,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,PHI@CHC,PHI,Kyle Schwarber,Colin Rea,12.15,43.46,+723,+130,248,-16.59,1.5,110,-4.16,0.749,15,A+,A,A+,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,PHI@CHC,PHI,Bryce Harper,Colin Rea,6.94,38.16,+1341,+162,415,-12.48,1.5,126,-6.09,0.836,14,A+,C,A+,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,PHI@CHC,PHI,Adolis García,Colin Rea,1.04,11.44,+9492,+774,475,-16.35,0.5,-172,,0.268,3,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Brandon Marsh,Colin Rea,2.06,24.63,+4747,+306,800,-9.05,0.5,-164,,0.418,9,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Alec Bohm,Colin Rea,0.40,6.00,+24900,+1567,850,-10.13,0.5,-196,,0.180,11,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Bryson Stott,Colin Rea,0.40,6.72,+24900,+1388,950,-9.12,0.5,-148,,0.290,15,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Justin Crawford,Colin Rea,0.40,13.16,+24900,+660,900,-9.60,0.5,-136,,0.477,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,PHI,Rafael Marchán,Colin Rea,0.40,6.00,+24900,+1567,875,-9.86,0.5,-120,,0.180,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Nico Hoerner,Aaron Nola,1.85,24.82,+5301,+303,900,-8.15,1.5,121,-20.43,0.705,18,C,D,C,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,PHI@CHC,CHC,Michael Busch,Aaron Nola,0.40,6.00,+24900,+1567,450,-17.78,1.5,146,-34.65,0.197,9,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,PHI@CHC,CHC,Alex Bregman,Aaron Nola,0.40,12.32,+24900,+712,512,-15.94,1.5,147,-28.16,0.390,11,D,D,D,,,priced_no_edge,priced_no_edge,Display only,full,not_scored
2026-04-20,PHI@CHC,CHC,Ian Happ,Aaron Nola,7.60,32.93,+1215,+204,425,-11.45,0.5,-154,,0.673,22,A,C,A,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Moisés Ballesteros,Aaron Nola,11.90,44.44,+740,+125,588,-2.63,0.5,-145,,0.950,2,A+,A,A+,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Michael Conforto,Aaron Nola,2.18,29.25,+4487,+242,550,-13.20,0.5,-122,,0.720,58,B,D,B,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Miguel Amaya,Aaron Nola,0.40,10.14,+24900,+886,825,-10.41,0.5,-135,,0.299,2,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Pete Crow-Armstrong,Aaron Nola,0.58,15.00,+17162,+567,538,-15.09,0.5,-160,,0.420,7,D,D,D,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,PHI@CHC,CHC,Dansby Swanson,Aaron Nola,5.45,25.76,+1736,+288,675,-7.46,0.5,-124,,0.624,70,C,D,C,,,priced_no_edge,line_mismatch_0.5,Display only,partial,not_scored
2026-04-20,LAD@COL,LAD,Shohei Ohtani,Jose Quintana,17.95,55.00,+457,-122,194,-16.06,2.5,110,,0.693,6,A+,A+,A+,,,priced_no_edge,line_mismatch_2.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,LAD@COL,LAD,Alex Call,Jose Quintana,8.71,39.07,+1047,+156,700,-3.79,1.5,102,-10.43,0.450,4,A+,B,A+,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,LAD,Will Smith,Jose Quintana,9.22,34.17,+985,+193,362,-12.42,1.5,-126,-21.58,0.465,12,A,B,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,LAD,Teoscar Hernández,Jose Quintana,13.55,41.17,+638,+143,300,-11.45,1.5,-142,-17.51,0.640,6,A+,A+,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,LAD,Andy Pages,Jose Quintana,14.63,53.47,+584,-115,415,-4.79,1.5,-140,-4.86,0.633,8,A+,A+,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,LAD,Miguel Rojas,Jose Quintana,7.63,38.44,+1211,+160,725,-4.49,1.5,115,-8.07,0.646,17,A+,C,A+,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,LAD,Max Muncy,Jose Quintana,18.64,55.00,+436,-122,298,-6.48,1.5,114,8.27,0.782,13,A+,A+,A+,2+ TB,A+,priced_no_edge,qualified,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,LAD,Santiago Espinal,Jose Quintana,4.13,14.30,+2319,+599,950,-5.39,1.5,118,-31.57,0.231,10,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,LAD,Dalton Rushing,Jose Quintana,25.00,55.00,+300,-122,340,2.27,1.5,100,5.00,0.950,2,A+,A+,A+,2+ TB,A+,priced_below_gate,qualified,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,COL,Jordan Beck,Justin Wrobleski,0.40,6.00,+24900,+1567,562,-14.71,1.5,110,-41.62,0.407,4,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,COL,Brenton Doyle,Justin Wrobleski,0.40,9.97,+24900,+903,570,-14.53,1.5,108,-38.10,0.505,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,COL,Hunter Goodman,Justin Wrobleski,8.51,35.62,+1076,+181,318,-15.42,1.5,-109,-16.53,0.828,2,A,B,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,COL,Tyler Freeman,Justin Wrobleski,0.40,8.90,+24900,+1023,825,-10.41,1.5,111,-38.49,0.389,2,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,COL,Ezequiel Tovar,Justin Wrobleski,1.78,21.66,+5505,+362,512,-14.56,1.5,114,-25.07,0.382,3,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,COL,Troy Johnston,Justin Wrobleski,2.82,28.85,+3451,+247,800,-8.29,1.5,134,-13.88,0.692,0,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,COL,Willi Castro,Justin Wrobleski,1.08,18.31,+9175,+446,725,-11.04,1.5,141,-23.19,0.568,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,LAD@COL,COL,Kyle Karros,Justin Wrobleski,0.95,16.32,+10400,+513,825,-9.86,0.5,-189,,0.470,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,LAD@COL,COL,Brett Sullivan,Justin Wrobleski,0.40,14.21,+24900,+604,775,-11.03,0.5,-156,,0.387,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,TOR,Davis Schneider,Reid Detmers,0.40,6.00,+24900,+1567,462,-17.39,0.5,-117,,0.313,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,TOR,Ernie Clement,Reid Detmers,0.40,12.78,+24900,+682,800,-10.71,1.5,123,-32.06,0.496,6,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,TOR@LAA,TOR,Vladimir Guerrero Jr.,Reid Detmers,1.70,25.26,+5786,+296,370,-19.58,1.5,110,-22.36,0.575,8,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,TOR@LAA,TOR,Eloy Jiménez,Reid Detmers,0.40,8.48,+24900,+1079,475,-16.99,1.5,135,-34.07,0.427,3,D,D,D,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,TOR@LAA,TOR,Kazuma Okamoto,Reid Detmers,0.73,13.92,+13619,+619,488,-16.28,0.5,-156,,0.404,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,TOR,Lenyn Sosa,Reid Detmers,0.40,12.67,+24900,+689,525,-15.60,1.5,134,-30.07,0.463,4,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,TOR@LAA,TOR,Daulton Varsho,Reid Detmers,1.36,21.70,+7279,+361,550,-14.03,0.5,-143,,0.837,3,C,D,C,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,TOR,Myles Straw,Reid Detmers,2.41,26.55,+4050,+277,1000,-6.68,1.5,255,-1.62,0.586,11,B,D,B,,,priced_no_edge,priced_no_edge,"Medium — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,TOR@LAA,TOR,Tyler Heineman,Reid Detmers,0.40,6.00,+24900,+1567,1100,-7.93,0.5,-128,,0.225,1,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,LAA,Zach Neto,Dylan Cease,0.72,17.30,+13852,+478,525,-15.28,0.5,-148,,0.560,5,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,LAA,Mike Trout,Dylan Cease,10.40,42.94,+862,+133,345,-12.07,1.5,128,-0.92,0.836,9,A+,A,A+,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,TOR@LAA,LAA,Nolan Schanuel,Dylan Cease,0.40,6.00,+24900,+1567,825,-10.41,0.5,-185,,0.308,6,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,LAA,Jorge Soler,Dylan Cease,3.48,22.35,+2776,+347,470,-14.07,0.5,-122,,0.896,27,C,D,C,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,LAA,Yoán Moncada,Dylan Cease,0.40,9.09,+24900,+1000,625,-13.39,0.5,-122,,0.565,3,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,LAA,Jo Adell,Dylan Cease,0.71,18.63,+13947,+437,475,-16.68,0.5,-141,,0.652,6,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,LAA,Josh Lowe,Dylan Cease,0.40,6.00,+24900,+1567,725,-11.72,0.5,-125,,0.536,8,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,LAA,Logan O'Hoppe,Dylan Cease,0.40,6.00,+24900,+1567,600,-13.89,0.5,-122,,0.428,5,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,TOR@LAA,LAA,Adam Frazier,Dylan Cease,0.40,18.35,+24900,+445,1025,-8.49,0.5,-119,,0.560,18,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,ATH,Nick Kurtz,Emerson Hancock,6.02,32.23,+1560,+210,285,-19.95,1.5,116,-14.06,0.612,2,A,C,A,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,ATH@SEA,ATH,Shea Langeliers,Emerson Hancock,5.05,30.99,+1879,+223,340,-17.67,1.5,123,-13.85,0.574,5,B,D,B,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,ATH@SEA,ATH,Carlos Cortes,Emerson Hancock,0.41,16.49,+24410,+506,588,-14.13,0.5,-186,,0.451,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,ATH,Tyler Soderstrom,Emerson Hancock,0.90,18.81,+11067,+432,475,-16.50,1.5,144,-22.18,0.486,6,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,ATH@SEA,ATH,Jacob Wilson,Emerson Hancock,0.40,9.72,+24900,+928,800,-10.71,1.5,141,-31.77,0.485,4,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,ATH@SEA,ATH,Jeff McNeil,Emerson Hancock,0.40,12.75,+24900,+684,725,-11.72,0.5,-179,,0.530,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,ATH,Max Muncy,Emerson Hancock,3.24,25.29,+2985,+295,650,-10.09,1.5,198,-8.27,0.409,0,C,D,C,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,ATH@SEA,ATH,Lawrence Butler,Emerson Hancock,0.40,8.35,+24900,+1097,520,-15.73,0.5,-124,,0.373,6,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,ATH,Zack Gelof,Emerson Hancock,0.40,13.12,+24900,+662,725,-11.72,0.5,103,,0.402,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"Medium — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,SEA,J.P. Crawford,J.T. Ginn,2.04,21.44,+4802,+366,675,-10.86,0.5,-189,,0.510,3,C,D,C,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,SEA,Cal Raleigh,J.T. Ginn,0.40,6.00,+24900,+1567,292,-25.11,1.5,123,-38.84,0.416,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,ATH@SEA,SEA,Julio Rodríguez,J.T. Ginn,0.40,10.43,+24900,+859,420,-18.83,1.5,120,-35.03,0.494,3,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,ATH@SEA,SEA,Josh Naylor,J.T. Ginn,0.40,6.00,+24900,+1567,430,-18.47,1.5,126,-38.25,0.415,0,D,D,D,,,priced_no_edge,priced_no_edge,"High — stats+savant+recent+BvP, confirmed lineup, live markets matched",full,scored
2026-04-20,ATH@SEA,SEA,Randy Arozarena,J.T. Ginn,1.22,21.54,+8073,+364,505,-15.31,0.5,-154,,0.588,3,C,D,C,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,SEA,Luke Raley,J.T. Ginn,10.96,49.07,+812,+104,488,-6.04,0.5,-124,,0.819,2,A+,A,A+,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,SEA,Dominic Canzone,J.T. Ginn,4.96,31.24,+1915,+220,512,-11.38,0.5,-152,,0.449,0,B,D,B,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,SEA,Cole Young,J.T. Ginn,0.40,6.00,+24900,+1567,750,-11.36,0.5,-118,,0.323,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-20,ATH@SEA,SEA,Leo Rivas,J.T. Ginn,0.40,6.00,+24900,+1567,1100,-7.93,0.5,-107,,0.219,0,D,D,D,,,priced_no_edge,line_mismatch_0.5,"High — stats+savant+recent+BvP, confirmed lineup, limited or misaligned live markets",partial,scored
<!-- batter-outlooks-csv:end -->
*/
