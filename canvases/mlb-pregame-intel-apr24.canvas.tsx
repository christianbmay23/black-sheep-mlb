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
    gameKey: "DET@CIN",
    venue: "MLB Park",
    away: "DET",
    home: "CIN",
    timeEt: "6:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 2nd — DET 1, CIN 0",
    awayScore: 1,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -118,
    homeAmerican: -102,
    impliedAwayPct: 51.74,
    impliedHomePct: 48.26,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Framber Valdez vs Andrew Abbott. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Jahmai Jones", "RF"],
      ["2", "Gleyber Torres", "DH"],
      ["3", "Kevin McGonigle", "3B"],
      ["4", "Matt Vierling", "CF"],
      ["5", "Dillon Dingler", "C"],
      ["6", "Riley Greene", "LF"],
      ["7", "Spencer Torkelson", "1B"],
      ["8", "Hao-Yu  Lee", "2B"],
      ["9", "Javier Báez", "SS"],
    ],
    homeLineup: [
      ["1", "Dane Myers", "CF"],
      ["2", "Matt McLain", "2B"],
      ["3", "Elly De La Cruz", "SS"],
      ["4", "Sal Stewart", "1B"],
      ["5", "Spencer Steer", "LF"],
      ["6", "Nathaniel Lowe", "DH"],
      ["7", "Tyler Stephenson", "C"],
      ["8", "Rece Hinds", "RF"],
      ["9", "Ke'Bryan Hayes", "3B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Jahmai Jones", team: "DET", hrPct: 11.9, tb2Pct: 40.3, tier: "HR A / TB A", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.4, tb2Pct: 8.9, tier: "HR D / TB D", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Kevin McGonigle", team: "DET", hrPct: 7.0, tb2Pct: 41.0, tier: "HR C / TB A", note: "Display only — Bottom 2nd — DET 1, CIN 0; LHB vs LHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Matt Vierling", team: "DET", hrPct: 3.5, tb2Pct: 24.4, tier: "HR D / TB C", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Dillon Dingler", team: "DET", hrPct: 13.6, tb2Pct: 50.6, tier: "HR A+ / TB A+", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Riley Greene", team: "DET", hrPct: 9.2, tb2Pct: 44.3, tier: "HR B / TB A+", note: "Display only — Bottom 2nd — DET 1, CIN 0; LHB vs LHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 5.4, tb2Pct: 24.9, tier: "HR D / TB C", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Hao-Yu  Lee", team: "DET", hrPct: 0.4, tb2Pct: 10.9, tier: "HR D / TB D", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Javier Báez", team: "DET", hrPct: 1.2, tb2Pct: 18.4, tier: "HR D / TB D", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Dane Myers", team: "CIN", hrPct: 2.6, tb2Pct: 23.7, tier: "HR D / TB C", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 11.6, tb2Pct: 44.8, tier: "HR A / TB A+", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 11.3, tb2Pct: 43.3, tier: "HR A / TB A+", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 7.0, tb2Pct: 31.4, tier: "HR C / TB B", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Nathaniel Lowe", team: "CIN", hrPct: 0.4, tb2Pct: 14.7, tier: "HR D / TB D", note: "Display only — Bottom 2nd — DET 1, CIN 0; LHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 2.7, tb2Pct: 14.4, tier: "HR D / TB D", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 2nd — DET 1, CIN 0; RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "BOS@BAL",
    venue: "MLB Park",
    away: "BOS",
    home: "BAL",
    timeEt: "7:05 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Bottom 1st — BOS 0, BAL 1",
    awayScore: 0,
    homeScore: 1,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 102,
    homeAmerican: -120,
    impliedAwayPct: 47.58,
    impliedHomePct: 52.42,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Brayan Bello vs Brandon Young. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Jarren Duran", "LF"],
      ["2", "Ceddanne Rafaela", "CF"],
      ["3", "Masataka Yoshida", "DH"],
      ["4", "Willson Contreras", "1B"],
      ["5", "Wilyer Abreu", "RF"],
      ["6", "Trevor Story", "SS"],
      ["7", "Marcelo Mayer", "2B"],
      ["8", "Caleb Durbin", "3B"],
      ["9", "Carlos Narváez", "C"],
    ],
    homeLineup: [
      ["1", "Gunnar Henderson", "SS"],
      ["2", "Taylor Ward", "LF"],
      ["3", "Adley Rutschman", "C"],
      ["4", "Pete Alonso", "1B"],
      ["5", "Dylan Beavers", "RF"],
      ["6", "Samuel Basallo", "DH"],
      ["7", "Leody Taveras", "CF"],
      ["8", "Coby Mayo", "3B"],
      ["9", "Jeremiah Jackson", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Jarren Duran", team: "BOS", hrPct: 0.4, tb2Pct: 12.9, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Ceddanne Rafaela", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Masataka Yoshida", team: "BOS", hrPct: 0.4, tb2Pct: 9.1, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Willson Contreras", team: "BOS", hrPct: 3.4, tb2Pct: 24.7, tier: "HR D / TB C", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Wilyer Abreu", team: "BOS", hrPct: 0.6, tb2Pct: 14.1, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Trevor Story", team: "BOS", hrPct: 0.4, tb2Pct: 8.9, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; limited power profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Marcelo Mayer", team: "BOS", hrPct: 0.4, tb2Pct: 8.3, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Caleb Durbin", team: "BOS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; limited power profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Carlos Narváez", team: "BOS", hrPct: 0.8, tb2Pct: 18.4, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; hard-contact profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 9.2, tb2Pct: 29.4, tier: "HR B / TB B", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; hard-contact profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Taylor Ward", team: "BAL", hrPct: 5.6, tb2Pct: 28.2, tier: "HR D / TB B", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Adley Rutschman", team: "BAL", hrPct: 12.5, tb2Pct: 48.0, tier: "HR A / TB A+", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 8.3, tb2Pct: 34.0, tier: "HR B / TB B", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; hard-contact profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Dylan Beavers", team: "BAL", hrPct: 3.3, tb2Pct: 17.2, tier: "HR D / TB D", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 8.7, tb2Pct: 29.3, tier: "HR B / TB B", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 8.7, tb2Pct: 38.6, tier: "HR B / TB A", note: "Display only — Bottom 1st — BOS 0, BAL 1; LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 5.2, tb2Pct: 22.3, tier: "HR D / TB C", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 11.4, tb2Pct: 41.2, tier: "HR A / TB A", note: "Display only — Bottom 1st — BOS 0, BAL 1; RHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "CLE@TOR",
    venue: "MLB Park",
    away: "CLE",
    home: "TOR",
    timeEt: "7:07 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 1st — CLE 1, TOR 0",
    awayScore: 1,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -125,
    homeAmerican: 105,
    impliedAwayPct: 53.25,
    impliedHomePct: 46.75,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Gavin Williams vs Max Scherzer. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Daniel Schneemann", "2B"],
      ["2", "Chase DeLauter", "RF"],
      ["3", "José Ramírez", "3B"],
      ["4", "Kyle Manzardo", "1B"],
      ["5", "Rhys Hoskins", "DH"],
      ["6", "George Valera", "LF"],
      ["7", "Angel Martínez", "CF"],
      ["8", "Bo Naylor", "C"],
      ["9", "Brayan Rocchio", "SS"],
    ],
    homeLineup: [
      ["1", "Nathan Lukes", "RF"],
      ["2", "Ernie Clement", "2B"],
      ["3", "Vladimir Guerrero Jr.", "1B"],
      ["4", "Jesús Sánchez", "LF"],
      ["5", "Lenyn Sosa", "DH"],
      ["6", "Daulton Varsho", "CF"],
      ["7", "Kazuma Okamoto", "3B"],
      ["8", "Andrés Giménez", "SS"],
      ["9", "Tyler Heineman", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Daniel Schneemann", team: "CLE", hrPct: 10.9, tb2Pct: 45.5, tier: "HR A / TB A+", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 7.8, tb2Pct: 31.7, tier: "HR B / TB B", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "José Ramírez", team: "CLE", hrPct: 12.8, tb2Pct: 48.1, tier: "HR A / TB A+", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 4.4, tb2Pct: 22.5, tier: "HR D / TB C", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Rhys Hoskins", team: "CLE", hrPct: 3.8, tb2Pct: 16.0, tier: "HR D / TB D", note: "Display only — Top 1st — CLE 1, TOR 0; RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "George Valera", team: "CLE", hrPct: 2.5, tb2Pct: 17.2, tier: "HR D / TB D", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Angel Martínez", team: "CLE", hrPct: 7.4, tb2Pct: 30.6, tier: "HR C / TB B", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Bo Naylor", team: "CLE", hrPct: 6.0, tb2Pct: 22.1, tier: "HR C / TB C", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 5.3, tb2Pct: 28.3, tier: "HR D / TB B", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Nathan Lukes", team: "TOR", hrPct: 0.4, tb2Pct: 12.5, tier: "HR D / TB D", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.4, tb2Pct: 17.1, tier: "HR D / TB D", note: "Display only — Top 1st — CLE 1, TOR 0; RHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 4.4, tb2Pct: 32.9, tier: "HR D / TB B", note: "Display only — Top 1st — CLE 1, TOR 0; RHB vs RHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 3.2, tb2Pct: 25.1, tier: "HR D / TB C", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Lenyn Sosa", team: "TOR", hrPct: 0.4, tb2Pct: 18.5, tier: "HR D / TB D", note: "Display only — Top 1st — CLE 1, TOR 0; RHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Daulton Varsho", team: "TOR", hrPct: 2.4, tb2Pct: 22.3, tier: "HR D / TB C", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 1.1, tb2Pct: 12.3, tier: "HR D / TB D", note: "Display only — Top 1st — CLE 1, TOR 0; RHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 0.4, tb2Pct: 15.1, tier: "HR D / TB D", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tyler Heineman", team: "TOR", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 1st — CLE 1, TOR 0; LHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "COL@NYM",
    venue: "MLB Park",
    away: "COL",
    home: "NYM",
    timeEt: "7:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 1st — COL 0, NYM 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 175,
    homeAmerican: -210,
    impliedAwayPct: 34.93,
    impliedHomePct: 65.07,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Michael Lorenzen vs Freddy Peralta. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Mickey Moniak", "DH"],
      ["2", "Hunter Goodman", "C"],
      ["3", "TJ Rumfield", "1B"],
      ["4", "Tyler Freeman", "2B"],
      ["5", "Troy Johnston", "RF"],
      ["6", "Kyle Karros", "3B"],
      ["7", "Ezequiel Tovar", "SS"],
      ["8", "Jake McCarthy", "LF"],
      ["9", "Brenton Doyle", "CF"],
    ],
    homeLineup: [
      ["1", "Bo Bichette", "3B"],
      ["2", "Juan Soto", "DH"],
      ["3", "Francisco Alvarez", "C"],
      ["4", "Brett Baty", "RF"],
      ["5", "Mark Vientos", "1B"],
      ["6", "Marcus Semien", "2B"],
      ["7", "Carson Benge", "LF"],
      ["8", "Tyrone Taylor", "CF"],
      ["9", "Ronny Mauricio", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Mickey Moniak", team: "COL", hrPct: 12.9, tb2Pct: 44.2, tier: "HR A / TB A+", note: "Display only — Top 1st — COL 0, NYM 0; LHB vs RHP; elite power indicators; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 9.6, tb2Pct: 38.8, tier: "HR B / TB A", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 2.7, tb2Pct: 21.8, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; LHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tyler Freeman", team: "COL", hrPct: 0.4, tb2Pct: 11.7, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Troy Johnston", team: "COL", hrPct: 2.3, tb2Pct: 26.6, tier: "HR D / TB C", note: "Display only — Top 1st — COL 0, NYM 0; LHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Kyle Karros", team: "COL", hrPct: 1.2, tb2Pct: 17.1, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 0.4, tb2Pct: 10.2, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jake McCarthy", team: "COL", hrPct: 0.4, tb2Pct: 20.2, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; LHB vs RHP; limited power profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 0.4, tb2Pct: 9.7, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; limited power profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Bo Bichette", team: "NYM", hrPct: 3.5, tb2Pct: 24.7, tier: "HR D / TB C", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Juan Soto", team: "NYM", hrPct: 4.0, tb2Pct: 21.7, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Francisco Alvarez", team: "NYM", hrPct: 8.4, tb2Pct: 32.7, tier: "HR B / TB B", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brett Baty", team: "NYM", hrPct: 4.5, tb2Pct: 19.3, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Mark Vientos", team: "NYM", hrPct: 3.1, tb2Pct: 15.6, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Marcus Semien", team: "NYM", hrPct: 2.3, tb2Pct: 20.2, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Carson Benge", team: "NYM", hrPct: 4.4, tb2Pct: 21.9, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; LHB vs RHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tyrone Taylor", team: "NYM", hrPct: 2.4, tb2Pct: 13.0, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Ronny Mauricio", team: "NYM", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 1st — COL 0, NYM 0; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "MIN@TB",
    venue: "MLB Park",
    away: "MIN",
    home: "TB",
    timeEt: "7:10 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Middle 1st — MIN 0, TB 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 115,
    homeAmerican: -138,
    impliedAwayPct: 44.51,
    impliedHomePct: 55.49,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Taj Bradley vs Drew Rasmussen. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Byron Buxton", "DH"],
      ["2", "Trevor Larnach", "LF"],
      ["3", "Austin Martin", "CF"],
      ["4", "Victor Caratini", "C"],
      ["5", "Kody Clemens", "1B"],
      ["6", "Royce Lewis", "3B"],
      ["7", "Matt Wallner", "RF"],
      ["8", "Brooks Lee", "SS"],
      ["9", "Tristan Gray", "2B"],
    ],
    homeLineup: [
      ["1", "Chandler Simpson", "LF"],
      ["2", "Junior Caminero", "3B"],
      ["3", "Jonathan Aranda", "1B"],
      ["4", "Yandy Díaz", "DH"],
      ["5", "Jonny DeLuca", "RF"],
      ["6", "Cedric Mullins", "CF"],
      ["7", "Ben Williamson", "2B"],
      ["8", "Nick Fortes", "C"],
      ["9", "Taylor Walls", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Byron Buxton", team: "MIN", hrPct: 6.1, tb2Pct: 28.2, tier: "HR C / TB B", note: "Display only — Middle 1st — MIN 0, TB 0; RHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Trevor Larnach", team: "MIN", hrPct: 1.0, tb2Pct: 19.7, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Austin Martin", team: "MIN", hrPct: 1.6, tb2Pct: 27.5, tier: "HR D / TB C", note: "Display only — Middle 1st — MIN 0, TB 0; RHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Victor Caratini", team: "MIN", hrPct: 0.4, tb2Pct: 12.9, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Kody Clemens", team: "MIN", hrPct: 3.7, tb2Pct: 21.2, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Royce Lewis", team: "MIN", hrPct: 0.4, tb2Pct: 8.8, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; RHB vs RHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Matt Wallner", team: "MIN", hrPct: 0.4, tb2Pct: 6.9, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brooks Lee", team: "MIN", hrPct: 1.3, tb2Pct: 17.1, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tristan Gray", team: "MIN", hrPct: 5.5, tb2Pct: 28.2, tier: "HR D / TB B", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Junior Caminero", team: "TB", hrPct: 5.2, tb2Pct: 29.5, tier: "HR D / TB B", note: "Display only — Middle 1st — MIN 0, TB 0; RHB vs RHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jonathan Aranda", team: "TB", hrPct: 1.8, tb2Pct: 15.4, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 0.9, tb2Pct: 22.7, tier: "HR D / TB C", note: "Display only — Middle 1st — MIN 0, TB 0; RHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jonny DeLuca", team: "TB", hrPct: 1.7, tb2Pct: 22.4, tier: "HR D / TB C", note: "Display only — Middle 1st — MIN 0, TB 0; RHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Ben Williamson", team: "TB", hrPct: 0.4, tb2Pct: 6.2, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; RHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Nick Fortes", team: "TB", hrPct: 0.4, tb2Pct: 12.8, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; RHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Middle 1st — MIN 0, TB 0; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "PHI@ATL",
    venue: "MLB Park",
    away: "PHI",
    home: "ATL",
    timeEt: "7:15 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "In Progress",
    gameStatusNote: "Top 1st — PHI 0, ATL 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 130,
    homeAmerican: -155,
    impliedAwayPct: 41.70,
    impliedHomePct: 58.30,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Andrew Painter vs Grant Holmes. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Trea Turner", "SS"],
      ["2", "Kyle Schwarber", "DH"],
      ["3", "Bryce Harper", "1B"],
      ["4", "Adolis García", "RF"],
      ["5", "Brandon Marsh", "LF"],
      ["6", "Bryson Stott", "2B"],
      ["7", "Alec Bohm", "3B"],
      ["8", "Justin Crawford", "CF"],
      ["9", "Garrett Stubbs", "C"],
    ],
    homeLineup: [
      ["1", "Ronald Acuña Jr.", "RF"],
      ["2", "Drake Baldwin", "C"],
      ["3", "Matt Olson", "1B"],
      ["4", "Ozzie Albies", "2B"],
      ["5", "Austin Riley", "3B"],
      ["6", "Dominic Smith", "DH"],
      ["7", "Mauricio Dubón", "SS"],
      ["8", "Mike Yastrzemski", "LF"],
      ["9", "Eli White", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 9.5, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; RHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 9.8, tb2Pct: 35.5, tier: "HR B / TB A", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 7.0, tb2Pct: 36.5, tier: "HR C / TB A", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Adolis García", team: "PHI", hrPct: 2.0, tb2Pct: 16.7, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; RHB vs RHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 6.1, tb2Pct: 33.1, tier: "HR C / TB B", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Bryson Stott", team: "PHI", hrPct: 0.4, tb2Pct: 12.3, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; RHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Justin Crawford", team: "PHI", hrPct: 0.4, tb2Pct: 10.7, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Garrett Stubbs", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 1.4, tb2Pct: 22.2, tier: "HR D / TB C", note: "Display only — Top 1st — PHI 0, ATL 0; RHB vs RHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 6.8, tb2Pct: 35.0, tier: "HR C / TB B", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Matt Olson", team: "ATL", hrPct: 9.4, tb2Pct: 40.1, tier: "HR B / TB A", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 0.8, tb2Pct: 18.5, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Austin Riley", team: "ATL", hrPct: 2.2, tb2Pct: 20.8, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; RHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Dominic Smith", team: "ATL", hrPct: 7.4, tb2Pct: 40.2, tier: "HR C / TB A", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 0.4, tb2Pct: 10.0, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; RHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Mike Yastrzemski", team: "ATL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; LHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Eli White", team: "ATL", hrPct: 1.4, tb2Pct: 14.5, tier: "HR D / TB D", note: "Display only — Top 1st — PHI 0, ATL 0; RHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "LAA@KC",
    venue: "MLB Park",
    away: "LAA",
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
    awayAmerican: -110,
    homeAmerican: -110,
    impliedAwayPct: 50.00,
    impliedHomePct: 50.00,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "PASS",
    decisionTier: "data_blocked",
    edgeOnPickPct: 0.00,
    modelConfidence: "data_blocked",
    analystConfidence: "Medium",
    flags: "market_moneyline_missing;market_total_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Yusei Kikuchi vs Noah Cameron. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
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
    homeLineup: [
      ["1", "Nick Loftin", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Salvador Perez", "1B"],
      ["4", "Lane Thomas", "CF"],
      ["5", "Starling Marte", "RF"],
      ["6", "Carter Jensen", "DH"],
      ["7", "Isaac Collins", "LF"],
      ["8", "Elias Díaz", "C"],
      ["9", "Michael Massey", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Zach Neto", team: "LAA", hrPct: 9.6, tb2Pct: 34.6, tier: "HR B / TB B", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mike Trout", team: "LAA", hrPct: 20.1, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Yet to begin; RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jo Adell", team: "LAA", hrPct: 8.5, tb2Pct: 33.4, tier: "HR B / TB B", note: "Display only — Yet to begin; RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 10.7, tb2Pct: 35.8, tier: "HR A / TB A", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 12.8, tb2Pct: 45.2, tier: "HR A / TB A+", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs vulnerable pitcher; priced lean: HR (A)" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 5.4, tb2Pct: 25.1, tier: "HR D / TB C", note: "Display only — Yet to begin; LHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Vaughn Grissom", team: "LAA", hrPct: 3.7, tb2Pct: 16.2, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 5.4, tb2Pct: 20.1, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Bryce Teodosio", team: "LAA", hrPct: 2.0, tb2Pct: 6.6, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Nick Loftin", team: "KC", hrPct: 5.5, tb2Pct: 37.7, tier: "HR D / TB A", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 5.4, tb2Pct: 32.9, tier: "HR D / TB B", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Salvador Perez", team: "KC", hrPct: 2.9, tb2Pct: 15.6, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 7.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Starling Marte", team: "KC", hrPct: 0.4, tb2Pct: 9.5, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Carter Jensen", team: "KC", hrPct: 10.5, tb2Pct: 40.1, tier: "HR A / TB A", note: "Display only — Yet to begin; LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Elias Díaz", team: "KC", hrPct: 9.4, tb2Pct: 55.0, tier: "HR B / TB A+", note: "Display only — Yet to begin; RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Michael Massey", team: "KC", hrPct: 5.0, tb2Pct: 28.7, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs LHP; above-average damage; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "WSH@CWS",
    venue: "MLB Park",
    away: "WSH",
    home: "CWS",
    timeEt: "7:40 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 105,
    homeAmerican: -125,
    impliedAwayPct: 46.75,
    impliedHomePct: 53.25,
    modelAwayPct: 41.31,
    modelHomePct: 58.69,
    edgeAwayPct: -5.44,
    edgeHomePct: 5.44,
    prediction: "CWS",
    decisionTier: "A",
    edgeOnPickPct: 5.44,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: PJ Poulin vs Bryan Hudson. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "James Wood", "RF"],
      ["2", "Daylen Lile", "LF"],
      ["3", "Brady House", "DH"],
      ["4", "CJ Abrams", "SS"],
      ["5", "Jacob Young", "CF"],
      ["6", "Jorbit Vivas", "3B"],
      ["7", "Nasim Nuñez", "2B"],
      ["8", "Luis García Jr.", "1B"],
      ["9", "Drew Millas", "C"],
    ],
    homeLineup: [
      ["1", "Everson Pereira", "DH"],
      ["2", "Chase Meidroth", "2B"],
      ["3", "Munetaka Murakami", "1B"],
      ["4", "Miguel Vargas", "3B"],
      ["5", "Colson Montgomery", "SS"],
      ["6", "Edgar Quero", "C"],
      ["7", "Sam Antonacci", "LF"],
      ["8", "Luisangel Acuña", "CF"],
      ["9", "Tristan Peters", "RF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "James Wood", team: "WSH", hrPct: 16.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A+); HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 3.6, tb2Pct: 29.2, tier: "HR D / TB B", note: "LHB vs LHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brady House", team: "WSH", hrPct: 0.4, tb2Pct: 10.5, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 7.9, tb2Pct: 37.7, tier: "HR B / TB A", note: "LHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.9, tb2Pct: 17.9, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs LHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.4, tb2Pct: 11.0, tier: "HR D / TB D", note: "LHB vs LHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Everson Pereira", team: "CWS", hrPct: 13.3, tb2Pct: 47.4, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 5.4, tb2Pct: 26.6, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 21.2, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+); HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 11.8, tb2Pct: 39.6, tier: "HR A / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 14.0, tb2Pct: 44.6, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Edgar Quero", team: "CWS", hrPct: 1.2, tb2Pct: 6.5, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 7.0, tb2Pct: 26.6, tier: "HR C / TB C", note: "LHB vs LHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Luisangel Acuña", team: "CWS", hrPct: 2.2, tb2Pct: 11.4, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tristan Peters", team: "CWS", hrPct: 2.3, tb2Pct: 19.0, tier: "HR D / TB D", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "PIT@MIL",
    venue: "MLB Park",
    away: "PIT",
    home: "MIL",
    timeEt: "7:40 PM",
    gameStatusBucket: "live",
    gameState: "Live",
    gameStateDetail: "Warmup",
    gameStatusNote: "Warmup — Top 1st — PIT 0, MIL 0",
    awayScore: 0,
    homeScore: 0,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -120,
    homeAmerican: 102,
    impliedAwayPct: 51.32,
    impliedHomePct: 48.68,
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
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Paul Skenes vs Brandon Woodruff. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Oneil Cruz", "CF"],
      ["2", "Brandon Lowe", "2B"],
      ["3", "Bryan Reynolds", "LF"],
      ["4", "Marcell Ozuna", "DH"],
      ["5", "Ryan O'Hearn", "RF"],
      ["6", "Nick Gonzales", "3B"],
      ["7", "Spencer Horwitz", "1B"],
      ["8", "Konnor Griffin", "SS"],
      ["9", "Henry Davis", "C"],
    ],
    homeLineup: [
      ["1", "Brice Turang", "2B"],
      ["2", "William Contreras", "C"],
      ["3", "Jake Bauers", "1B"],
      ["4", "Tyler Black", "DH"],
      ["5", "Luis Rengifo", "3B"],
      ["6", "Garrett Mitchell", "CF"],
      ["7", "Sal Frelick", "RF"],
      ["8", "Brandon Lockridge", "LF"],
      ["9", "David Hamilton", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 11.8, tb2Pct: 45.1, tier: "HR A / TB A+", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 5.6, tb2Pct: 28.7, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 1.8, tb2Pct: 21.1, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 0.8, tb2Pct: 16.9, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 3.6, tb2Pct: 28.7, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.4, tb2Pct: 8.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Spencer Horwitz", team: "PIT", hrPct: 0.4, tb2Pct: 11.9, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Henry Davis", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Brice Turang", team: "MIL", hrPct: 3.7, tb2Pct: 29.9, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "William Contreras", team: "MIL", hrPct: 0.4, tb2Pct: 16.1, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 4.6, tb2Pct: 28.4, tier: "HR D / TB B", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Tyler Black", team: "MIL", hrPct: 0.4, tb2Pct: 8.5, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 0.4, tb2Pct: 13.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Sal Frelick", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "David Hamilton", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Warmup — Top 1st — PIT 0, MIL 0; LHB vs RHP; limited power profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "ATH@TEX",
    venue: "MLB Park",
    away: "ATH",
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
    awayAmerican: 117,
    homeAmerican: -140,
    impliedAwayPct: 44.66,
    impliedHomePct: 55.34,
    modelAwayPct: 39.75,
    modelHomePct: 60.25,
    edgeAwayPct: -4.92,
    edgeHomePct: 4.92,
    prediction: "TEX",
    decisionTier: "B",
    edgeOnPickPct: 4.92,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Luis Severino vs Nathan Eovaldi. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
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
      ["1", "Brandon Nimmo", "RF"],
      ["2", "Joc Pederson", "DH"],
      ["3", "Corey Seager", "SS"],
      ["4", "Jake Burger", "1B"],
      ["5", "Josh Jung", "3B"],
      ["6", "Evan Carter", "CF"],
      ["7", "Kyle Higashioka", "C"],
      ["8", "Josh Smith", "2B"],
      ["9", "Alejandro Osuna", "LF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Nick Kurtz", team: "ATH", hrPct: 11.8, tb2Pct: 46.8, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 9.2, tb2Pct: 40.6, tier: "HR B / TB A", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 7.4, tb2Pct: 38.8, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 3.9, tb2Pct: 26.0, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.4, tb2Pct: 18.8, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.6, tb2Pct: 21.5, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Max Muncy", team: "ATH", hrPct: 3.2, tb2Pct: 20.5, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 1.1, tb2Pct: 13.5, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 9.7, tb2Pct: 40.5, tier: "HR B / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 3.5, tb2Pct: 21.9, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Corey Seager", team: "TEX", hrPct: 10.2, tb2Pct: 35.6, tier: "HR A / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jake Burger", team: "TEX", hrPct: 7.7, tb2Pct: 29.6, tier: "HR C / TB B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Josh Jung", team: "TEX", hrPct: 8.9, tb2Pct: 42.1, tier: "HR B / TB A+", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Evan Carter", team: "TEX", hrPct: 7.7, tb2Pct: 31.3, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Kyle Higashioka", team: "TEX", hrPct: 3.1, tb2Pct: 15.1, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Josh Smith", team: "TEX", hrPct: 1.7, tb2Pct: 13.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Alejandro Osuna", team: "TEX", hrPct: 6.1, tb2Pct: 40.1, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "NYY@HOU",
    venue: "MLB Park",
    away: "NYY",
    home: "HOU",
    timeEt: "8:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -154,
    homeAmerican: 130,
    impliedAwayPct: 58.30,
    impliedHomePct: 41.70,
    modelAwayPct: 59.65,
    modelHomePct: 40.35,
    edgeAwayPct: 1.35,
    edgeHomePct: -1.35,
    prediction: "NYY",
    decisionTier: "C",
    edgeOnPickPct: 1.35,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Will Warren vs Lance McCullers Jr.. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Trent Grisham", "CF"],
      ["2", "Aaron Judge", "RF"],
      ["3", "Cody Bellinger", "LF"],
      ["4", "Ben Rice", "1B"],
      ["5", "Giancarlo Stanton", "DH"],
      ["6", "Jazz Chisholm Jr.", "2B"],
      ["7", "J.C. Escarra", "C"],
      ["8", "Ryan McMahon", "3B"],
      ["9", "José Caballero", "SS"],
    ],
    homeLineup: [
      ["1", "Carlos Correa", "SS"],
      ["2", "Yordan Alvarez", "DH"],
      ["3", "Isaac Paredes", "3B"],
      ["4", "Jose Altuve", "2B"],
      ["5", "Christian Walker", "1B"],
      ["6", "Cam Smith", "RF"],
      ["7", "Dustin Harris", "LF"],
      ["8", "Yainer Diaz", "C"],
      ["9", "Brice Matthews", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Trent Grisham", team: "NYY", hrPct: 7.8, tb2Pct: 30.4, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 16.3, tb2Pct: 54.4, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 6.2, tb2Pct: 32.8, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Ben Rice", team: "NYY", hrPct: 17.7, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 8.2, tb2Pct: 32.4, tier: "HR B / TB B", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.4, tb2Pct: 7.8, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 3.0, tb2Pct: 23.7, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Ryan McMahon", team: "NYY", hrPct: 5.0, tb2Pct: 22.2, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "José Caballero", team: "NYY", hrPct: 0.8, tb2Pct: 18.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
    ],
    propsHome: [
      { batter: "Carlos Correa", team: "HOU", hrPct: 0.5, tb2Pct: 21.6, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 17.4, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.4, tb2Pct: 10.1, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Jose Altuve", team: "HOU", hrPct: 0.4, tb2Pct: 11.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Christian Walker", team: "HOU", hrPct: 3.8, tb2Pct: 22.4, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Cam Smith", team: "HOU", hrPct: 2.3, tb2Pct: 19.1, tier: "HR D / TB D", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Dustin Harris", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Brice Matthews", team: "HOU", hrPct: 0.4, tb2Pct: 11.2, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
    ],
  },
  {
    gameKey: "SEA@STL",
    venue: "MLB Park",
    away: "SEA",
    home: "STL",
    timeEt: "8:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -145,
    homeAmerican: 124,
    impliedAwayPct: 57.07,
    impliedHomePct: 42.93,
    modelAwayPct: 61.55,
    modelHomePct: 38.45,
    edgeAwayPct: 4.48,
    edgeHomePct: -4.48,
    prediction: "SEA",
    decisionTier: "B",
    edgeOnPickPct: 4.48,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: George Kirby vs Andre Pallante. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
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
    homeLineup: [
      ["1", "JJ Wetherholt", "2B"],
      ["2", "Iván Herrera", "C"],
      ["3", "Alec Burleson", "1B"],
      ["4", "Jordan Walker", "RF"],
      ["5", "Nolan Gorman", "DH"],
      ["6", "Masyn Winn", "SS"],
      ["7", "Nathan Church", "CF"],
      ["8", "Ramón Urías", "3B"],
      ["9", "José Fermín", "LF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 4.8, tb2Pct: 24.7, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 7.2, tb2Pct: 28.9, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 2.9, tb2Pct: 23.7, tier: "HR D / TB C", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 3.6, tb2Pct: 23.0, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 5.2, tb2Pct: 29.4, tier: "HR D / TB B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luke Raley", team: "SEA", hrPct: 14.6, tb2Pct: 54.2, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 12.7, tb2Pct: 49.1, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Cole Young", team: "SEA", hrPct: 1.7, tb2Pct: 13.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "JJ Wetherholt", team: "STL", hrPct: 0.4, tb2Pct: 10.4, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Iván Herrera", team: "STL", hrPct: 2.9, tb2Pct: 25.5, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Alec Burleson", team: "STL", hrPct: 5.2, tb2Pct: 32.4, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Jordan Walker", team: "STL", hrPct: 10.8, tb2Pct: 43.0, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.4, tb2Pct: 18.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Nathan Church", team: "STL", hrPct: 0.4, tb2Pct: 15.2, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Ramón Urías", team: "STL", hrPct: 0.4, tb2Pct: 6.7, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "José Fermín", team: "STL", hrPct: 0.4, tb2Pct: 14.9, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "CHC@LAD",
    venue: "MLB Park",
    away: "CHC",
    home: "LAD",
    timeEt: "10:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 138,
    homeAmerican: -160,
    impliedAwayPct: 40.88,
    impliedHomePct: 59.12,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "PASS",
    decisionTier: "data_blocked",
    edgeOnPickPct: 0.00,
    modelConfidence: "data_blocked",
    analystConfidence: "Medium",
    flags: "draftkings_hr_away_side_missing;lineup_not_posted_api;recent_form_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Jameson Taillon vs Emmet Sheehan. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Not Posted",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [],
    homeLineup: [
      ["1", "Shohei Ohtani", "DH"],
      ["2", "Freddie Freeman", "1B"],
      ["3", "Will Smith", "C"],
      ["4", "Kyle Tucker", "RF"],
      ["5", "Teoscar Hernández", "LF"],
      ["6", "Max Muncy", "3B"],
      ["7", "Andy Pages", "CF"],
      ["8", "Hyeseong Kim", "SS"],
      ["9", "Alex Freeland", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [],
    propsHome: [
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 9.4, tb2Pct: 36.6, tier: "HR B / TB A", note: "Display only — Yet to begin; LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 8.4, tb2Pct: 42.5, tier: "HR B / TB A+", note: "Display only — Yet to begin; LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Will Smith", team: "LAD", hrPct: 2.0, tb2Pct: 17.4, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 2.7, tb2Pct: 19.3, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 5.3, tb2Pct: 25.5, tier: "HR D / TB C", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Max Muncy", team: "LAD", hrPct: 14.9, tb2Pct: 49.6, tier: "HR A+ / TB A+", note: "Display only — Yet to begin; LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Andy Pages", team: "LAD", hrPct: 6.7, tb2Pct: 33.8, tier: "HR C / TB B", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Hyeseong Kim", team: "LAD", hrPct: 4.6, tb2Pct: 30.1, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 1.3, tb2Pct: 11.3, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via draftkings, HR tier downgraded" },
    ],
  },
  {
    gameKey: "MIA@SF",
    venue: "MLB Park",
    away: "MIA",
    home: "SF",
    timeEt: "10:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -115,
    homeAmerican: -105,
    impliedAwayPct: 51.08,
    impliedHomePct: 48.92,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "PASS",
    decisionTier: "data_blocked",
    edgeOnPickPct: 0.00,
    modelConfidence: "data_blocked",
    analystConfidence: "Medium",
    flags: "draftkings_hr_away_side_missing;lineup_not_posted_api;recent_form_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Sandy Alcantara vs Adrian Houser. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Not Posted",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [],
    homeLineup: [
      ["1", "Willy Adames", "SS"],
      ["2", "Luis Arraez", "2B"],
      ["3", "Matt Chapman", "3B"],
      ["4", "Rafael Devers", "1B"],
      ["5", "Casey Schmitt", "DH"],
      ["6", "Jung Hoo Lee", "RF"],
      ["7", "Heliot Ramos", "LF"],
      ["8", "Drew Gilbert", "CF"],
      ["9", "Eric Haase", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-24 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [],
    propsHome: [
      { batter: "Willy Adames", team: "SF", hrPct: 0.9, tb2Pct: 15.8, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; limited power profile; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.4, tb2Pct: 6.5, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; limited power profile; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Rafael Devers", team: "SF", hrPct: 0.4, tb2Pct: 11.6, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 4.2, tb2Pct: 28.6, tier: "HR D / TB B", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 0.4, tb2Pct: 17.0, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 4.1, tb2Pct: 27.8, tier: "HR D / TB C", note: "Display only — Yet to begin; RHB vs RHP; elite power indicators; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 0.4, tb2Pct: 11.0, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Eric Haase", team: "SF", hrPct: 0.4, tb2Pct: 12.1, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; contact-driven profile; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
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

export default function Apr24Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 24, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-24
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
2026-04-24,DET,CIN,6:40 PM,Framber Valdez,Andrew Abbott,-118,-102,,,,78F / 10 mph wind / 17% precip / Open,78.1,10.2,17,0.420,0.433,0.586,0.485,live,Live,In Progress,"Bottom 2nd — DET 1, CIN 0",1,0,Partial,rotowire_hr_home_side_missing,51.74,48.26,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Framber Valdez vs Andrew Abbott. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-24,BOS,BAL,7:05 PM,Brayan Bello,Brandon Young,102,-120,,,,67F / 3 mph wind / 11% precip / Open,67.3,3.0,11,0.456,0.490,0.403,0.581,live,Live,In Progress,"Bottom 1st — BOS 0, BAL 1",0,1,Partial,rotowire_hr_home_side_missing,47.58,52.42,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Brayan Bello vs Brandon Young. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-24,CLE,TOR,7:07 PM,Gavin Williams,Max Scherzer,-125,105,,,,43F / 9 mph wind / 1% precip / Retractable,43.4,9.4,1,0.418,0.492,0.553,0.505,live,Live,In Progress,"Top 1st — CLE 1, TOR 0",1,0,Partial,rotowire_hr_home_side_missing,53.25,46.75,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Gavin Williams vs Max Scherzer. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-24,COL,NYM,7:10 PM,Michael Lorenzen,Freddy Peralta,175,-210,,,,54F / 10 mph wind / 1% precip / Open,54.2,9.8,1,0.417,0.346,0.535,0.356,live,Live,In Progress,"Top 1st — COL 0, NYM 0",0,0,Partial,rotowire_hr_home_side_missing,34.93,65.07,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Michael Lorenzen vs Freddy Peralta. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-24,MIN,TB,7:10 PM,Taj Bradley,Drew Rasmussen,115,-138,,,,77F / 8 mph wind / 0% precip / Dome,77.4,7.8,0,0.405,0.337,0.515,0.471,live,Live,In Progress,"Middle 1st — MIN 0, TB 0",0,0,Partial,rotowire_hr_home_side_missing,44.51,55.49,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Taj Bradley vs Drew Rasmussen. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-24,PHI,ATL,7:15 PM,Andrew Painter,Grant Holmes,130,-155,,,,79F / 6 mph wind / 1% precip / Open,78.8,6.5,1,0.441,0.475,0.462,0.566,live,Live,In Progress,"Top 1st — PHI 0, ATL 0",0,0,Partial,rotowire_hr_home_side_missing,41.70,58.30,,,,,,,,,,,not_scored,,not_scored,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Andrew Painter vs Grant Holmes. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-24,LAA,KC,7:40 PM,Yusei Kikuchi,Noah Cameron,-110,-110,8.5,-110,-110,69F / 6 mph wind / 0% precip / Open,69.2,6.5,0,0.421,0.319,0.540,0.534,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,market_moneyline_missing|market_total_missing,50.00,50.00,,,,,,,,,,PASS,data_blocked,,data_blocked,market_moneyline_missing;market_total_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Yusei Kikuchi vs Noah Cameron. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
2026-04-24,WSH,CWS,7:40 PM,PJ Poulin,Bryan Hudson,105,-125,9.5,-110,-110,66F / 5 mph wind / 1% precip / Open,65.8,4.8,1,0.338,0.335,0.477,0.543,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,46.75,53.25,25.00,75.00,41.31,58.69,0.25,41.31,58.69,-5.44,5.44,CWS,A,5.44,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: PJ Poulin vs Bryan Hudson. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-24,PIT,MIL,7:40 PM,Paul Skenes,Brandon Woodruff,-115,-103,7.0,-110,-110,65F / 9 mph wind / 0% precip / Retractable,65.0,9.0,0,0.413,0.373,0.503,0.443,live,Live,Warmup,"Warmup — Top 1st — PIT 0, MIL 0",0,0,Verified,,51.32,48.68,,,,,,,,,,,not_scored,,not_scored,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Paul Skenes vs Brandon Woodruff. Run compute to refresh lineups, weather, and model outputs before staking.",not_scored
2026-04-24,ATH,TEX,8:05 PM,Luis Severino,Nathan Eovaldi,115,-136,8.0,-110,-110,87F / 7 mph wind / 0% precip / Retractable,86.6,6.9,0,0.447,0.410,0.533,0.559,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,44.66,55.34,25.00,75.00,39.75,60.25,0.25,39.75,60.25,-4.92,4.92,TEX,B,4.92,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Luis Severino vs Nathan Eovaldi. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-24,NYY,HOU,8:10 PM,Will Warren,Lance McCullers Jr.,-155,130,9.0,-111,-111,77F / 0 mph wind / 12% precip / Retractable,76.6,0.0,12,0.436,0.372,0.629,0.453,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,58.30,41.70,63.70,36.30,59.65,40.35,0.25,59.65,40.35,1.35,-1.35,NYY,C,1.35,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Will Warren vs Lance McCullers Jr.. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-24,SEA,STL,8:15 PM,George Kirby,Andre Pallante,-146,124,8.0,-110,-110,69F / 2 mph wind / 18% precip / Open,69.2,2.2,18,0.428,0.353,0.556,0.550,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,57.07,42.93,75.00,25.00,61.55,38.45,0.25,61.55,38.45,4.48,-4.48,SEA,B,4.48,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: George Kirby vs Andre Pallante. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-24,CHC,LAD,10:15 PM,Jameson Taillon,Emmet Sheehan,135,-160,9.0,-110,-110,63F / 8 mph wind / 0% precip / Open,62.7,7.6,0,0.409,0.439,,0.530,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,draftkings_hr_away_side_missing|lineup_not_posted_api|recent_form_missing,40.88,59.12,,,,,,,,,,PASS,data_blocked,,data_blocked,draftkings_hr_away_side_missing;lineup_not_posted_api;recent_form_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Jameson Taillon vs Emmet Sheehan. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
2026-04-24,MIA,SF,10:15 PM,Sandy Alcantara,Adrian Houser,-115,-105,7.5,-110,-110,55F / 11 mph wind / 0% precip / Open,54.7,11.0,0,0.541,0.477,,0.484,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,draftkings_hr_away_side_missing|lineup_not_posted_api|recent_form_missing,51.08,48.92,,,,,,,,,,PASS,data_blocked,,data_blocked,draftkings_hr_away_side_missing;lineup_not_posted_api;recent_form_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Sandy Alcantara vs Adrian Houser. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,hr_market_integrity,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-24,DET@CIN,DET,Jahmai Jones,Andrew Abbott,11.87,40.30,+742,+148,575,-2.94,1.5,192,6.06,0.950,0,A,A,A,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-24,DET@CIN,DET,Gleyber Torres,Andrew Abbott,0.40,8.86,+24900,+1028,650,-12.93,1.5,180,-26.85,0.356,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,DET@CIN,DET,Kevin McGonigle,Andrew Abbott,6.99,41.00,+1330,+144,625,-6.80,1.5,170,3.96,0.700,0,A,C,A,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-24,DET@CIN,DET,Matt Vierling,Andrew Abbott,3.47,24.44,+2782,+309,700,-9.03,1.5,185,-10.65,0.482,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,DET@CIN,DET,Dillon Dingler,Andrew Abbott,13.59,50.63,+636,-103,340,-9.13,1.5,100,0.63,0.670,0,A+,A+,A+,,,priced_no_edge,partial,priced_below_gate,Display only,full,not_scored
2026-04-24,DET@CIN,DET,Riley Greene,Andrew Abbott,9.22,44.27,+985,+126,390,-11.19,1.5,130,0.80,0.817,0,A+,B,A+,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-24,DET@CIN,DET,Spencer Torkelson,Andrew Abbott,5.36,24.94,+1765,+301,425,-13.68,1.5,135,-17.61,0.495,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,DET@CIN,DET,Hao-Yu  Lee,Andrew Abbott,0.45,10.94,+22206,+814,575,-14.37,1.5,150,-29.06,0.342,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,DET@CIN,DET,Javier Báez,Andrew Abbott,1.17,18.44,+8454,+442,725,-10.95,1.5,152,-21.24,0.461,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,DET@CIN,CIN,Dane Myers,Framber Valdez,2.58,23.66,+3778,+323,NA,,1.5,-160,-37.88,0.691,0,C,D,C,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,DET@CIN,CIN,Matt McLain,Framber Valdez,0.40,6.00,+24900,+1567,NA,,1.5,220,-25.25,0.286,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,DET@CIN,CIN,Elly De La Cruz,Framber Valdez,11.56,44.78,+765,+123,NA,,1.5,180,9.07,0.853,0,A+,A,A+,,,unpriced,partial,priced_below_prob_gate,Display only,partial,not_scored
2026-04-24,DET@CIN,CIN,Sal Stewart,Framber Valdez,11.27,43.25,+787,+131,NA,,1.5,111,-4.14,0.654,0,A+,A,A+,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,DET@CIN,CIN,Spencer Steer,Framber Valdez,7.02,31.39,+1324,+219,NA,,1.5,135,-11.16,0.691,0,B,C,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,DET@CIN,CIN,Nathaniel Lowe,Framber Valdez,0.40,14.67,+24900,+582,NA,,1.5,178,-21.30,0.462,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,DET@CIN,CIN,Tyler Stephenson,Framber Valdez,2.73,14.37,+3558,+596,NA,,1.5,180,-21.35,0.247,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,DET@CIN,CIN,Rece Hinds,Framber Valdez,0.40,6.00,+24900,+1567,NA,,1.5,195,-27.90,0.230,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,DET@CIN,CIN,Ke'Bryan Hayes,Framber Valdez,0.40,6.00,+24900,+1567,NA,,1.5,202,-27.11,0.253,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,BOS@BAL,BOS,Jarren Duran,Brandon Young,0.40,12.90,+24900,+675,625,-13.39,1.5,165,-24.84,0.411,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BOS,Ceddanne Rafaela,Brandon Young,0.40,6.00,+24900,+1567,800,-10.71,1.5,170,-31.04,0.348,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BOS,Masataka Yoshida,Brandon Young,0.40,9.12,+24900,+997,725,-11.72,1.5,135,-33.43,0.390,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BOS,Willson Contreras,Brandon Young,3.35,24.68,+2882,+305,450,-14.83,1.5,135,-17.87,0.530,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BOS,Wilyer Abreu,Brandon Young,0.56,14.12,+17638,+608,395,-19.64,1.5,120,-31.34,0.260,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BOS,Trevor Story,Brandon Young,0.40,8.87,+24900,+1028,650,-12.93,1.5,142,-32.45,0.434,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BOS,Marcelo Mayer,Brandon Young,0.40,8.33,+24900,+1101,700,-12.10,1.5,155,-30.89,0.389,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BOS,Caleb Durbin,Brandon Young,0.40,6.00,+24900,+1567,1100,-7.93,1.5,165,-31.74,0.320,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BOS,Carlos Narváez,Brandon Young,0.84,18.39,+11829,+444,800,-10.27,1.5,225,-12.38,0.542,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,BOS@BAL,BAL,Gunnar Henderson,Brayan Bello,9.21,29.36,+986,+241,NA,,1.5,100,-20.64,0.431,0,B,B,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,BOS@BAL,BAL,Taylor Ward,Brayan Bello,5.57,28.15,+1695,+255,NA,,1.5,127,-15.90,0.426,0,B,D,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,BOS@BAL,BAL,Adley Rutschman,Brayan Bello,12.47,47.97,+702,+108,NA,,1.5,134,5.23,0.950,0,A+,A,A+,,,unpriced,partial,priced_below_prob_gate,Display only,partial,not_scored
2026-04-24,BOS@BAL,BAL,Pete Alonso,Brayan Bello,8.29,34.04,+1106,+194,NA,,1.5,120,-11.41,0.585,0,B,B,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,BOS@BAL,BAL,Dylan Beavers,Brayan Bello,3.34,17.23,+2898,+481,NA,,1.5,168,-20.09,0.314,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,BOS@BAL,BAL,Samuel Basallo,Brayan Bello,8.72,29.34,+1046,+241,NA,,1.5,150,-10.66,0.482,0,B,B,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,BOS@BAL,BAL,Leody Taveras,Brayan Bello,8.65,38.56,+1056,+159,NA,,1.5,160,0.10,0.642,0,A,B,A,,,unpriced,partial,priced_below_prob_gate,Display only,partial,not_scored
2026-04-24,BOS@BAL,BAL,Coby Mayo,Brayan Bello,5.19,22.30,+1827,+348,NA,,1.5,190,-12.18,0.531,0,C,D,C,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,BOS@BAL,BAL,Jeremiah Jackson,Brayan Bello,11.37,41.15,+780,+143,NA,,1.5,175,4.79,0.873,0,A,A,A,,,unpriced,partial,priced_below_prob_gate,Display only,partial,not_scored
2026-04-24,CLE@TOR,CLE,Daniel Schneemann,Max Scherzer,10.94,45.50,+814,+120,512,-5.40,1.5,136,3.13,0.892,0,A+,A,A+,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-24,CLE@TOR,CLE,Chase DeLauter,Max Scherzer,7.84,31.67,+1175,+216,360,-13.90,1.5,-108,-20.26,0.411,0,B,B,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,CLE@TOR,CLE,José Ramírez,Max Scherzer,12.85,48.15,+678,+108,360,-8.89,1.5,108,0.07,0.883,0,A+,A,A+,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-24,CLE@TOR,CLE,Kyle Manzardo,Max Scherzer,4.43,22.54,+2158,+344,390,-15.98,1.5,150,-17.46,0.523,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,CLE@TOR,CLE,Rhys Hoskins,Max Scherzer,3.79,16.03,+2542,+524,370,-17.49,0.5,-142,,0.381,0,D,D,D,,,priced_no_edge,partial,line_mismatch_0.5,Display only,partial,not_scored
2026-04-24,CLE@TOR,CLE,George Valera,Max Scherzer,2.50,17.19,+3902,+482,625,-11.29,1.5,165,-20.55,0.359,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,CLE@TOR,CLE,Angel Martínez,Max Scherzer,7.39,30.55,+1254,+227,600,-6.90,1.5,160,-7.91,0.538,0,B,C,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,CLE@TOR,CLE,Bo Naylor,Max Scherzer,5.99,22.08,+1570,+353,500,-10.68,1.5,200,-11.25,0.335,0,C,C,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,CLE@TOR,CLE,Brayan Rocchio,Max Scherzer,5.35,28.25,+1770,+254,950,-4.18,1.5,220,-3.00,0.654,0,B,D,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,CLE@TOR,TOR,Nathan Lukes,Gavin Williams,0.40,12.45,+24900,+703,NA,,1.5,145,-28.37,0.490,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,CLE@TOR,TOR,Ernie Clement,Gavin Williams,0.40,17.10,+24900,+485,NA,,1.5,125,-27.34,0.584,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,CLE@TOR,TOR,Vladimir Guerrero Jr.,Gavin Williams,4.43,32.91,+2158,+204,NA,,1.5,102,-16.59,0.678,0,B,D,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,CLE@TOR,TOR,Jesús Sánchez,Gavin Williams,3.19,25.09,+3033,+299,NA,,0.5,-160,,0.447,0,C,D,C,,,unpriced,partial,line_mismatch_0.5,Display only,partial,not_scored
2026-04-24,CLE@TOR,TOR,Lenyn Sosa,Gavin Williams,0.40,18.46,+24900,+442,NA,,1.5,147,-22.02,0.495,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,CLE@TOR,TOR,Daulton Varsho,Gavin Williams,2.44,22.29,+4001,+349,NA,,1.5,155,-16.93,0.804,0,C,D,C,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,CLE@TOR,TOR,Kazuma Okamoto,Gavin Williams,1.12,12.28,+8795,+714,NA,,1.5,190,-22.20,0.353,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,CLE@TOR,TOR,Andrés Giménez,Gavin Williams,0.40,15.14,+24900,+560,NA,,1.5,200,-18.19,0.510,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,CLE@TOR,TOR,Tyler Heineman,Gavin Williams,0.40,6.00,+24900,+1567,NA,,1.5,260,-21.78,0.180,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,COL,Mickey Moniak,Freddy Peralta,12.94,44.23,+673,+126,418,-6.37,1.5,136,1.85,0.950,0,A+,A,A+,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-24,COL@NYM,COL,Hunter Goodman,Freddy Peralta,9.57,38.81,+944,+158,410,-10.03,1.5,164,0.93,0.869,0,A,B,A,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,not_scored
2026-04-24,COL@NYM,COL,TJ Rumfield,Freddy Peralta,2.70,21.80,+3600,+359,795,-8.47,1.5,185,-13.29,0.405,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,COL@NYM,COL,Tyler Freeman,Freddy Peralta,0.40,11.72,+24900,+753,1200,-7.29,1.5,202,-21.39,0.373,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,COL@NYM,COL,Troy Johnston,Freddy Peralta,2.35,26.64,+4160,+275,810,-8.64,1.5,200,-6.69,0.535,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,COL@NYM,COL,Kyle Karros,Freddy Peralta,1.22,17.13,+8082,+484,1100,-7.11,1.5,266,-10.19,0.433,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,COL@NYM,COL,Ezequiel Tovar,Freddy Peralta,0.40,10.22,+24900,+878,730,-11.65,1.5,212,-21.83,0.203,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,COL@NYM,COL,Jake McCarthy,Freddy Peralta,0.40,20.20,+24900,+395,1250,-7.01,1.5,262,-7.42,0.669,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,COL@NYM,COL,Brenton Doyle,Freddy Peralta,0.40,9.67,+24900,+934,900,-9.60,1.5,241,-19.65,0.379,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,COL@NYM,NYM,Bo Bichette,Michael Lorenzen,3.53,24.71,+2735,+305,NA,,1.5,-102,-25.78,0.456,0,C,D,C,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,NYM,Juan Soto,Michael Lorenzen,3.99,21.73,+2407,+360,NA,,1.5,118,-24.14,0.327,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,NYM,Francisco Alvarez,Michael Lorenzen,8.40,32.69,+1091,+206,NA,,1.5,140,-8.98,0.453,0,B,B,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,NYM,Brett Baty,Michael Lorenzen,4.53,19.27,+2109,+419,NA,,1.5,155,-19.95,0.341,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,NYM,Mark Vientos,Michael Lorenzen,3.13,15.58,+3094,+542,NA,,1.5,147,-24.91,0.291,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,NYM,Marcus Semien,Michael Lorenzen,2.32,20.18,+4212,+395,NA,,1.5,140,-21.48,0.414,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,NYM,Carson Benge,Michael Lorenzen,4.36,21.86,+2193,+357,NA,,1.5,180,-13.86,0.460,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,NYM,Tyrone Taylor,Michael Lorenzen,2.43,13.03,+4017,+667,NA,,1.5,226,-17.64,0.282,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,COL@NYM,NYM,Ronny Mauricio,Michael Lorenzen,0.40,6.00,+24900,+1567,NA,,1.5,195,-27.90,0.180,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,MIN,Byron Buxton,Drew Rasmussen,6.09,28.16,+1541,+255,332,-17.05,1.5,111,-19.24,0.734,0,B,C,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,MIN,Trevor Larnach,Drew Rasmussen,1.00,19.67,+9923,+408,745,-10.84,1.5,178,-16.30,0.555,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,MIN,Austin Martin,Drew Rasmussen,1.61,27.49,+6106,+264,1000,-7.48,1.5,180,-8.22,0.835,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,MIN,Victor Caratini,Drew Rasmussen,0.40,12.91,+24900,+675,865,-9.96,1.5,158,-25.85,0.426,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,MIN,Kody Clemens,Drew Rasmussen,3.71,21.16,+2595,+373,514,-12.58,1.5,165,-16.57,0.462,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,MIN,Royce Lewis,Drew Rasmussen,0.40,8.80,+24809,+1036,598,-13.93,1.5,170,-28.24,0.180,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,MIN,Matt Wallner,Drew Rasmussen,0.40,6.94,+24900,+1340,550,-14.98,1.5,208,-25.53,0.196,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,MIN,Brooks Lee,Drew Rasmussen,1.35,17.09,+7329,+485,900,-8.65,1.5,193,-17.04,0.636,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,MIN,Tristan Gray,Drew Rasmussen,5.54,28.23,+1706,+254,690,-7.12,1.5,206,-4.45,0.615,0,B,D,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,MIN@TB,TB,Chandler Simpson,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,130,-37.48,0.353,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,TB,Junior Caminero,Taj Bradley,5.23,29.48,+1812,+239,NA,,1.5,106,-19.07,0.736,0,B,D,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,TB,Jonathan Aranda,Taj Bradley,1.76,15.42,+5585,+548,NA,,1.5,164,-22.45,0.405,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,TB,Yandy Díaz,Taj Bradley,0.90,22.69,+11019,+341,NA,,1.5,130,-20.78,0.551,0,C,D,C,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,TB,Jonny DeLuca,Taj Bradley,1.69,22.42,+5832,+346,NA,,1.5,155,-16.80,0.585,0,C,D,C,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,TB,Cedric Mullins,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,182,-29.46,0.429,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,TB,Ben Williamson,Taj Bradley,0.40,6.16,+24900,+1522,NA,,1.5,198,-27.39,0.463,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,TB,Nick Fortes,Taj Bradley,0.40,12.77,+24900,+683,NA,,1.5,190,-21.71,0.402,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,MIN@TB,TB,Taylor Walls,Taj Bradley,0.40,6.00,+24900,+1567,NA,,1.5,296,-19.25,0.319,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,PHI,Trea Turner,Grant Holmes,0.40,9.53,+24900,+950,700,-12.10,1.5,115,-36.98,0.425,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,PHI,Kyle Schwarber,Grant Holmes,9.84,35.54,+916,+181,280,-16.48,1.5,125,-8.90,0.693,0,A,B,A,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,PHI,Bryce Harper,Grant Holmes,7.01,36.45,+1327,+174,425,-12.04,1.5,118,-9.42,0.719,0,A,C,A,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,PHI,Adolis García,Grant Holmes,1.99,16.70,+4929,+499,525,-14.01,1.5,152,-22.98,0.407,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,PHI,Brandon Marsh,Grant Holmes,6.11,33.12,+1537,+202,782,-5.23,1.5,144,-7.86,0.742,0,B,C,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,PHI,Bryson Stott,Grant Holmes,0.40,12.26,+24900,+715,1020,-8.53,1.5,168,-25.05,0.375,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,PHI,Alec Bohm,Grant Holmes,0.40,6.00,+24900,+1567,1100,-7.93,1.5,170,-31.04,0.180,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,PHI,Justin Crawford,Grant Holmes,0.40,10.68,+24900,+836,965,-8.99,1.5,194,-23.33,0.441,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,PHI,Garrett Stubbs,Grant Holmes,0.40,6.00,+24900,+1567,1230,-7.12,1.5,272,-20.88,0.180,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,not_scored
2026-04-24,PHI@ATL,ATL,Ronald Acuña Jr.,Andrew Painter,1.40,22.23,+7055,+350,NA,,1.5,-104,-28.75,0.505,0,C,D,C,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,ATL,Drake Baldwin,Andrew Painter,6.75,34.95,+1380,+186,NA,,1.5,100,-15.05,0.616,0,B,C,B,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,ATL,Matt Olson,Andrew Painter,9.39,40.08,+965,+149,NA,,1.5,110,-7.54,0.743,0,A,B,A,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,ATL,Ozzie Albies,Andrew Painter,0.79,18.54,+12573,+439,NA,,1.5,126,-25.71,0.624,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,ATL,Austin Riley,Andrew Painter,2.20,20.78,+4446,+381,NA,,1.5,120,-24.68,0.587,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,ATL,Dominic Smith,Andrew Painter,7.35,40.23,+1260,+149,NA,,1.5,146,-0.42,0.803,0,A,C,A,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,ATL,Mauricio Dubón,Andrew Painter,0.40,10.05,+24900,+895,NA,,1.5,150,-29.95,0.362,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,ATL,Mike Yastrzemski,Andrew Painter,0.40,6.00,+24900,+1567,NA,,1.5,215,-25.75,0.259,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,PHI@ATL,ATL,Eli White,Andrew Painter,1.45,14.54,+6819,+588,NA,,1.5,181,-21.04,0.593,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,not_scored
2026-04-24,LAA@KC,LAA,Zach Neto,Noah Cameron,9.56,34.59,+946,+189,472,-7.93,1.5,-105,-16.63,0.506,0,B,B,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,LAA,Mike Trout,Noah Cameron,20.08,55.00,+398,-122,351,-2.09,1.5,104,5.98,0.932,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,Display only,full,data_blocked
2026-04-24,LAA@KC,LAA,Jo Adell,Noah Cameron,8.52,33.36,+1074,+200,469,-9.06,1.5,114,-13.37,0.468,0,B,B,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,LAA,Jorge Soler,Noah Cameron,10.66,35.84,+838,+179,543,-4.90,1.5,148,-4.49,0.558,0,A,A,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,LAA,Oswald Peraza,Noah Cameron,12.80,45.17,+681,+121,940,3.19,1.5,158,6.41,0.942,0,A,A,A+,HR,A,qualified,full,priced_below_prob_gate,Display only,full,data_blocked
2026-04-24,LAA@KC,LAA,Nolan Schanuel,Noah Cameron,5.42,25.05,+1746,+299,1220,-2.16,1.5,162,-13.12,0.458,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,LAA,Vaughn Grissom,Noah Cameron,3.68,16.23,+2619,+516,1300,-3.46,1.5,150,-23.77,0.373,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,LAA,Logan O'Hoppe,Noah Cameron,5.39,20.05,+1756,+399,700,-7.11,1.5,164,-17.83,0.407,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,LAA,Bryce Teodosio,Noah Cameron,1.96,6.57,+4994,+1421,1420,-4.62,1.5,288,-19.20,0.213,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Nick Loftin,Yusei Kikuchi,5.50,37.67,+1720,+165,860,-4.92,1.5,145,-3.14,0.881,0,A,D,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Bobby Witt Jr.,Yusei Kikuchi,5.35,32.92,+1768,+204,527,-10.59,1.5,-112,-19.91,0.472,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Salvador Perez,Yusei Kikuchi,2.91,15.60,+3334,+541,555,-12.36,1.5,119,-30.06,0.342,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Lane Thomas,Yusei Kikuchi,0.40,6.99,+24900,+1331,930,-9.31,1.5,160,-31.47,0.372,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Starling Marte,Yusei Kikuchi,0.40,9.48,+24900,+955,970,-8.95,1.5,145,-31.34,0.305,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Carter Jensen,Yusei Kikuchi,10.52,40.06,+851,+150,700,-1.98,1.5,180,4.34,0.773,0,A,A,A,,,priced_no_edge,full,priced_below_prob_gate,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Isaac Collins,Yusei Kikuchi,0.40,6.00,+24900,+1567,950,-9.12,1.5,184,-29.21,0.238,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Elias Díaz,Yusei Kikuchi,9.38,55.00,+966,-122,820,-1.49,1.5,180,19.29,0.871,0,A+,B,A+,2+ TB,A+,priced_no_edge,full,qualified,Display only,full,data_blocked
2026-04-24,LAA@KC,KC,Michael Massey,Yusei Kikuchi,5.00,28.68,+1900,+249,870,-5.31,1.5,208,-3.79,0.556,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-24,WSH@CWS,WSH,James Wood,Bryan Hudson,16.03,55.00,+524,-122,278,-10.42,1.5,100,5.00,0.896,0,A+,A+,A+,2+ TB,A+,priced_no_edge,partial,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,WSH,Daylen Lile,Bryan Hudson,3.64,29.17,+2647,+243,625,-10.15,1.5,104,-19.85,0.711,0,B,D,B,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,WSH,Brady House,Bryan Hudson,0.40,10.50,+24900,+852,700,-12.10,1.5,135,-32.05,0.254,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,WSH,CJ Abrams,Bryan Hudson,7.93,37.72,+1161,+165,422,-11.23,1.5,123,-7.12,0.706,0,A,B,A,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,WSH,Jacob Young,Bryan Hudson,0.86,17.90,+11493,+459,1220,-6.71,1.5,165,-19.84,0.457,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,WSH,Jorbit Vivas,Bryan Hudson,0.40,6.00,+24900,+1567,1135,-7.70,1.5,186,-28.97,0.425,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,WSH,Nasim Nuñez,Bryan Hudson,0.40,6.00,+24900,+1567,1060,-8.22,1.5,195,-27.90,0.262,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,WSH,Luis García Jr.,Bryan Hudson,0.40,11.00,+24900,+809,675,-12.50,1.5,137,-31.20,0.278,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,WSH,Drew Millas,Bryan Hudson,0.40,6.00,+24900,+1567,1100,-7.93,1.5,202,-27.11,0.302,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,WSH@CWS,CWS,Everson Pereira,PJ Poulin,13.26,47.41,+654,+111,NA,,1.5,130,3.93,0.691,0,A+,A+,A+,,,unpriced,partial,priced_below_prob_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,WSH@CWS,CWS,Chase Meidroth,PJ Poulin,5.44,26.64,+1738,+275,NA,,1.5,136,-15.73,0.430,0,C,D,C,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,WSH@CWS,CWS,Munetaka Murakami,PJ Poulin,21.21,55.00,+371,-122,NA,,1.5,112,7.83,0.908,0,A+,A+,A+,2+ TB,A+,unpriced,partial,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,WSH@CWS,CWS,Miguel Vargas,PJ Poulin,11.76,39.61,+751,+152,NA,,1.5,119,-6.05,0.614,0,A,A,A,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,WSH@CWS,CWS,Colson Montgomery,PJ Poulin,13.99,44.61,+615,+124,NA,,1.5,114,-2.12,0.861,0,A+,A+,A+,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,WSH@CWS,CWS,Edgar Quero,PJ Poulin,1.16,6.48,+8499,+1442,NA,,1.5,146,-34.17,0.249,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,WSH@CWS,CWS,Sam Antonacci,PJ Poulin,6.99,26.65,+1330,+275,NA,,1.5,160,-11.81,0.467,0,C,C,C,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,WSH@CWS,CWS,Luisangel Acuña,PJ Poulin,2.20,11.42,+4451,+776,NA,,1.5,152,-28.26,0.202,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,WSH@CWS,CWS,Tristan Peters,PJ Poulin,2.28,19.04,+4286,+425,NA,,1.5,224,-11.83,0.470,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,PIT@MIL,PIT,Oneil Cruz,Brandon Woodruff,11.76,45.09,+751,+122,276,-14.84,1.5,123,0.25,0.708,0,A+,A,A+,,,priced_no_edge,full,priced_below_prob_gate,Display only,full,not_scored
2026-04-24,PIT@MIL,PIT,Brandon Lowe,Brandon Woodruff,5.55,28.73,+1701,+248,428,-13.39,1.5,145,-12.09,0.774,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,PIT,Bryan Reynolds,Brandon Woodruff,1.81,21.14,+5437,+373,552,-13.53,1.5,170,-15.90,0.513,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,PIT,Marcell Ozuna,Brandon Woodruff,0.79,16.92,+12482,+491,488,-16.21,1.5,160,-21.54,0.514,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,PIT,Ryan O'Hearn,Brandon Woodruff,3.61,28.69,+2668,+249,730,-8.44,1.5,172,-8.07,0.523,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,PIT,Nick Gonzales,Brandon Woodruff,0.40,7.95,+24900,+1158,1000,-8.69,1.5,160,-30.51,0.363,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,PIT,Spencer Horwitz,Brandon Woodruff,0.40,11.92,+24900,+739,950,-9.12,1.5,224,-18.94,0.659,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,PIT,Konnor Griffin,Brandon Woodruff,0.40,6.00,+24900,+1567,910,-9.50,1.5,212,-26.05,0.295,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,PIT,Henry Davis,Brandon Woodruff,0.40,6.00,+24900,+1567,950,-9.12,1.5,260,-21.78,0.180,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,Brice Turang,Paul Skenes,3.73,29.86,+2582,+235,670,-9.26,1.5,166,-7.74,0.669,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,William Contreras,Paul Skenes,0.40,16.11,+24900,+521,640,-13.11,1.5,151,-23.73,0.500,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,Jake Bauers,Paul Skenes,4.61,28.41,+2070,+252,456,-13.38,1.5,189,-6.20,0.697,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,Tyler Black,Paul Skenes,0.40,8.48,+24900,+1080,820,-10.47,1.5,204,-24.42,,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,Luis Rengifo,Paul Skenes,0.40,6.00,+24900,+1567,770,-11.09,1.5,172,-30.76,0.327,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,Garrett Mitchell,Paul Skenes,0.40,12.96,+24900,+671,810,-10.59,1.5,236,-16.80,0.417,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,Sal Frelick,Paul Skenes,0.40,6.00,+24900,+1567,1220,-7.18,1.5,238,-23.59,0.237,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,Brandon Lockridge,Paul Skenes,0.40,6.00,+24900,+1567,1200,-7.29,1.5,272,-20.88,0.397,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,PIT@MIL,MIL,David Hamilton,Paul Skenes,0.40,6.00,+24900,+1567,1140,-7.66,1.5,300,-19.00,0.307,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,not_scored
2026-04-24,ATH@TEX,ATH,Nick Kurtz,Nathan Eovaldi,11.82,46.77,+746,+114,290,-13.82,1.5,120,1.32,0.758,0,A+,A,A+,,,priced_no_edge,partial,priced_below_prob_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,ATH,Shea Langeliers,Nathan Eovaldi,9.20,40.64,+987,+146,368,-12.17,1.5,120,-4.82,0.699,0,A,B,A,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,ATH,Carlos Cortes,Nathan Eovaldi,7.37,38.77,+1257,+158,577,-7.40,1.5,135,-3.79,0.635,0,A,C,A,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,ATH,Tyler Soderstrom,Nathan Eovaldi,3.85,26.03,+2497,+284,510,-12.54,1.5,140,-15.64,0.552,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,ATH,Jacob Wilson,Nathan Eovaldi,0.40,18.83,+24900,+431,1300,-6.74,1.5,150,-21.17,0.647,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,ATH,Jeff McNeil,Nathan Eovaldi,0.59,21.47,+16777,+366,850,-9.93,1.5,148,-18.85,0.557,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,ATH,Max Muncy,Nathan Eovaldi,3.20,20.49,+3023,+388,660,-9.96,1.5,185,-14.60,0.329,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,ATH,Lawrence Butler,Nathan Eovaldi,1.09,13.55,+9079,+638,640,-12.42,1.5,180,-22.17,0.350,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,ATH,Zack Gelof,Nathan Eovaldi,0.40,6.00,+24900,+1567,800,-10.71,1.5,240,-23.41,0.269,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-24,ATH@TEX,TEX,Brandon Nimmo,Luis Severino,9.69,40.53,+932,+147,NA,,1.5,118,-5.34,0.656,0,A,B,A,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,ATH@TEX,TEX,Joc Pederson,Luis Severino,3.54,21.89,+2728,+357,NA,,1.5,170,-15.14,0.486,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,ATH@TEX,TEX,Corey Seager,Luis Severino,10.23,35.61,+878,+181,NA,,1.5,107,-12.70,0.567,0,A,A,A,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,ATH@TEX,TEX,Jake Burger,Luis Severino,7.67,29.63,+1204,+238,NA,,1.5,135,-12.93,0.490,0,B,C,B,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,ATH@TEX,TEX,Josh Jung,Luis Severino,8.94,42.12,+1018,+137,NA,,1.5,140,0.45,0.890,0,A+,B,A+,,,unpriced,partial,priced_below_prob_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,ATH@TEX,TEX,Evan Carter,Luis Severino,7.75,31.28,+1191,+220,NA,,1.5,185,-3.80,0.597,0,B,C,B,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,ATH@TEX,TEX,Kyle Higashioka,Luis Severino,3.12,15.13,+3102,+561,NA,,1.5,185,-19.95,0.278,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,ATH@TEX,TEX,Josh Smith,Luis Severino,1.74,13.64,+5633,+633,NA,,1.5,202,-19.48,0.350,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,ATH@TEX,TEX,Alejandro Osuna,Luis Severino,6.12,40.08,+1533,+149,NA,,1.5,242,10.84,0.721,0,A,C,A,,,unpriced,partial,priced_below_prob_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-24,NYY@HOU,NYY,Trent Grisham,Lance McCullers Jr.,7.78,30.39,+1185,+229,445,-10.56,1.5,126,-13.86,0.566,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,NYY,Aaron Judge,Lance McCullers Jr.,16.27,54.43,+515,-119,233,-13.76,1.5,-106,2.98,0.889,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,NYY,Cody Bellinger,Lance McCullers Jr.,6.20,32.75,+1512,+205,498,-10.52,1.5,124,-11.89,0.622,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,NYY,Ben Rice,Lance McCullers Jr.,17.67,55.00,+466,-122,346,-4.75,1.5,118,9.13,0.947,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,NYY,Giancarlo Stanton,Lance McCullers Jr.,8.23,32.39,+1115,+209,323,-15.41,1.5,123,-12.45,0.490,0,B,B,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,NYY,Jazz Chisholm Jr.,Lance McCullers Jr.,0.40,7.84,+24900,+1175,542,-15.18,1.5,157,-31.07,0.401,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,NYY,J.C. Escarra,Lance McCullers Jr.,3.03,23.68,+3198,+322,590,-11.46,1.5,174,-12.82,0.633,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,NYY,Ryan McMahon,Lance McCullers Jr.,5.02,22.22,+1894,+350,680,-7.80,1.5,218,-9.22,0.539,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,NYY,José Caballero,Lance McCullers Jr.,0.83,17.97,+11978,+457,1100,-7.51,1.5,236,-11.79,0.572,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Carlos Correa,Will Warren,0.54,21.63,+18388,+362,780,-10.82,1.5,135,-20.92,0.483,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Yordan Alvarez,Will Warren,17.38,55.00,+475,-122,242,-11.86,1.5,-114,1.73,0.950,0,A+,A+,A+,,,priced_no_edge,full,priced_below_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Isaac Paredes,Will Warren,0.40,10.14,+24900,+886,563,-14.68,1.5,163,-27.89,0.501,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Jose Altuve,Will Warren,0.40,11.84,+24900,+745,690,-12.26,1.5,150,-28.16,0.348,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Christian Walker,Will Warren,3.77,22.42,+2550,+346,528,-12.15,1.5,151,-17.42,0.460,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Cam Smith,Will Warren,2.33,19.08,+4193,+424,800,-8.78,1.5,179,-16.77,0.322,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Dustin Harris,Will Warren,0.40,6.00,+24900,+1567,890,-9.70,1.5,188,-28.72,0.236,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Yainer Diaz,Will Warren,0.40,6.00,+24900,+1567,960,-9.03,1.5,168,-31.31,0.362,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,NYY@HOU,HOU,Brice Matthews,Will Warren,0.40,11.24,+24900,+790,594,-14.01,1.5,222,-19.82,0.415,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,J.P. Crawford,Andre Pallante,4.80,24.71,+1983,+305,1020,-4.13,1.5,138,-17.30,0.471,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,Cal Raleigh,Andre Pallante,7.20,28.86,+1289,+246,371,-14.03,1.5,119,-16.80,0.660,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,Julio Rodríguez,Andre Pallante,2.92,23.71,+3329,+322,810,-8.07,1.5,104,-25.31,0.602,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,Josh Naylor,Andre Pallante,3.64,23.01,+2647,+335,780,-7.72,1.5,127,-21.04,0.594,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,Randy Arozarena,Andre Pallante,5.17,29.42,+1834,+240,750,-6.59,1.5,145,-11.40,0.640,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,Luke Raley,Andre Pallante,14.62,54.21,+584,-118,640,1.10,1.5,176,17.98,0.771,0,A+,A+,A+,2+ TB,A+,priced_below_gate,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,Dominic Canzone,Andre Pallante,12.67,49.11,+689,+104,640,-0.85,1.5,145,8.29,0.680,0,A+,A,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,Cole Young,Andre Pallante,1.73,12.96,+5671,+672,1080,-6.74,1.5,186,-22.01,0.308,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,SEA,Leo Rivas,Andre Pallante,0.40,6.00,+24900,+1567,1600,-5.48,1.5,233,-24.03,0.276,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,JJ Wetherholt,George Kirby,0.40,10.39,+24900,+863,950,-9.12,1.5,164,-27.49,0.491,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,Iván Herrera,George Kirby,2.91,25.54,+3331,+291,950,-6.61,1.5,136,-16.83,0.633,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,Alec Burleson,George Kirby,5.17,32.44,+1833,+208,593,-9.26,1.5,130,-11.03,0.611,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,Jordan Walker,George Kirby,10.79,42.96,+826,+133,720,-1.40,1.5,148,2.63,0.681,0,A+,A,A+,,,priced_no_edge,full,priced_below_prob_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,Nolan Gorman,George Kirby,0.40,6.00,+24900,+1567,690,-12.26,1.5,178,-29.97,0.353,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,Masyn Winn,George Kirby,0.40,18.03,+24900,+455,1260,-6.95,1.5,172,-18.73,0.768,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,Nathan Church,George Kirby,0.40,15.18,+24900,+559,1160,-7.54,1.5,202,-17.93,0.663,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,Ramón Urías,George Kirby,0.40,6.71,+24900,+1391,1060,-8.22,1.5,185,-28.38,0.247,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-24,SEA@STL,STL,José Fermín,George Kirby,0.41,14.91,+24507,+571,NA,,1.5,218,-16.54,0.508,0,D,D,D,,,unpriced,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-24,CHC@LAD,LAD,Shohei Ohtani,Jameson Taillon,9.36,36.63,+968,+173,191,-25.00,1.5,-130,-19.89,0.517,0,A,B,A,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,CHC@LAD,LAD,Freddie Freeman,Jameson Taillon,8.40,42.49,+1090,+135,364,-13.15,1.5,-2,40.53,0.554,0,A+,B,A+,,,priced_no_edge,partial,priced_below_prob_gate,Display only,full,data_blocked
2026-04-24,CHC@LAD,LAD,Will Smith,Jameson Taillon,1.99,17.45,+4923,+473,NA,,1.5,122,-27.60,0.380,0,D,D,D,,,unpriced,partial,priced_no_edge,Display only,partial,data_blocked
2026-04-24,CHC@LAD,LAD,Kyle Tucker,Jameson Taillon,2.74,19.29,+3556,+418,435,-15.96,1.5,130,-24.19,0.481,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,CHC@LAD,LAD,Teoscar Hernández,Jameson Taillon,5.28,25.49,+1795,+292,381,-15.51,1.5,120,-19.97,0.513,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,CHC@LAD,LAD,Max Muncy,Jameson Taillon,14.90,49.56,+571,+102,NA,,1.5,139,7.72,0.950,0,A+,A+,A+,,,unpriced,partial,priced_below_prob_gate,Display only,partial,data_blocked
2026-04-24,CHC@LAD,LAD,Andy Pages,Jameson Taillon,6.72,33.81,+1388,+196,477,-10.61,1.5,125,-10.64,0.543,0,B,C,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,CHC@LAD,LAD,Hyeseong Kim,Jameson Taillon,4.58,30.07,+2083,+233,990,-4.59,1.5,200,-3.26,0.568,0,B,D,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,CHC@LAD,LAD,Alex Freeland,Jameson Taillon,1.29,11.35,+7652,+781,760,-10.34,1.5,230,-18.96,0.267,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Willy Adames,Sandy Alcantara,0.93,15.82,+10676,+532,564,-14.13,1.5,138,-26.20,0.452,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Luis Arraez,Sandy Alcantara,0.40,6.00,+24900,+1567,1360,-6.45,1.5,120,-39.45,0.385,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Matt Chapman,Sandy Alcantara,0.40,6.48,+24900,+1444,730,-11.65,1.5,151,-33.36,0.373,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Rafael Devers,Sandy Alcantara,0.40,11.63,+24900,+760,436,-18.26,1.5,133,-31.29,0.335,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Casey Schmitt,Sandy Alcantara,4.18,28.59,+2291,+250,640,-9.33,1.5,145,-12.22,0.618,0,B,D,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Jung Hoo Lee,Sandy Alcantara,0.40,17.01,+24900,+488,1360,-6.45,1.5,150,-22.99,0.610,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Heliot Ramos,Sandy Alcantara,4.09,27.77,+2348,+260,900,-5.91,1.5,162,-10.39,0.688,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Drew Gilbert,Sandy Alcantara,0.40,10.98,+24900,+811,1000,-8.69,1.5,220,-20.27,0.453,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-24,MIA@SF,SF,Eric Haase,Sandy Alcantara,0.40,12.15,+24900,+723,1160,-7.54,1.5,250,-16.42,,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
<!-- batter-outlooks-csv:end -->
*/
