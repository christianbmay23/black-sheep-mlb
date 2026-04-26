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
    gameKey: "COL@NYM",
    venue: "MLB Park",
    away: "COL",
    home: "NYM",
    timeEt: "1:45 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Scheduled",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 220,
    homeAmerican: -260,
    impliedAwayPct: 30.20,
    impliedHomePct: 69.80,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "PASS",
    decisionTier: "data_blocked",
    edgeOnPickPct: 0.00,
    modelConfidence: "data_blocked",
    analystConfidence: "Low",
    flags: "hr_market_integrity_degraded;lineup_not_posted_api;recent_form_missing;starter_verification_failed",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: TBD vs Kodai Senga. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Not Posted",
    homeLuLabel: "Not Posted",
    awayLineup: [],
    homeLineup: [],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [],
    propsHome: [],
  },
  {
    gameKey: "WSH@CWS",
    venue: "MLB Park",
    away: "WSH",
    home: "CWS",
    timeEt: "2:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 102,
    homeAmerican: -120,
    impliedAwayPct: 47.58,
    impliedHomePct: 52.42,
    modelAwayPct: 47.01,
    modelHomePct: 52.99,
    edgeAwayPct: -0.57,
    edgeHomePct: 0.57,
    prediction: "CWS",
    decisionTier: "D",
    edgeOnPickPct: 0.57,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Foster Griffin vs Bryan Hudson. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "James Wood", "RF"],
      ["2", "Curtis Mead", "1B"],
      ["3", "Daylen Lile", "LF"],
      ["4", "Brady House", "3B"],
      ["5", "CJ Abrams", "SS"],
      ["6", "Jacob Young", "CF"],
      ["7", "Luis García Jr.", "DH"],
      ["8", "Nasim Nuñez", "2B"],
      ["9", "Drew Millas", "C"],
    ],
    homeLineup: [
      ["1", "Chase Meidroth", "2B"],
      ["2", "Miguel Vargas", "3B"],
      ["3", "Munetaka Murakami", "1B"],
      ["4", "Everson Pereira", "DH"],
      ["5", "Colson Montgomery", "SS"],
      ["6", "Tanner Murray", "LF"],
      ["7", "Derek Hill", "RF"],
      ["8", "Drew Romo", "C"],
      ["9", "Luisangel Acuña", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "James Wood", team: "WSH", hrPct: 14.4, tb2Pct: 50.7, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs tough pitcher; priced lean: 2+ TB (A+); HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Curtis Mead", team: "WSH", hrPct: 3.5, tb2Pct: 19.7, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 2.8, tb2Pct: 27.4, tier: "HR D / TB C", note: "LHB vs LHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brady House", team: "WSH", hrPct: 1.7, tb2Pct: 15.7, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 6.2, tb2Pct: 31.7, tier: "HR C / TB B", note: "LHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.4, tb2Pct: 12.5, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.4, tb2Pct: 14.8, tier: "HR D / TB D", note: "LHB vs LHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Chase Meidroth", team: "CWS", hrPct: 1.4, tb2Pct: 19.9, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Miguel Vargas", team: "CWS", hrPct: 7.2, tb2Pct: 31.7, tier: "HR C / TB B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 17.6, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 7.9, tb2Pct: 35.6, tier: "HR B / TB A", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Colson Montgomery", team: "CWS", hrPct: 9.6, tb2Pct: 36.6, tier: "HR B / TB A", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tanner Murray", team: "CWS", hrPct: 3.8, tb2Pct: 20.8, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Derek Hill", team: "CWS", hrPct: 3.8, tb2Pct: 22.7, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Drew Romo", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Luisangel Acuña", team: "CWS", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "NYY@HOU",
    venue: "MLB Park",
    away: "NYY",
    home: "HOU",
    timeEt: "2:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -131,
    homeAmerican: 111,
    impliedAwayPct: 54.47,
    impliedHomePct: 45.53,
    modelAwayPct: 54.11,
    modelHomePct: 45.89,
    edgeAwayPct: -0.37,
    edgeHomePct: 0.37,
    prediction: "NYY",
    decisionTier: "D",
    edgeOnPickPct: -0.37,
    modelConfidence: "Low",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Luis Gil vs Spencer Arrighetti. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Trent Grisham", "CF"],
      ["2", "Ben Rice", "DH"],
      ["3", "Aaron Judge", "RF"],
      ["4", "Cody Bellinger", "LF"],
      ["5", "Jazz Chisholm Jr.", "2B"],
      ["6", "Paul Goldschmidt", "1B"],
      ["7", "J.C. Escarra", "C"],
      ["8", "Ryan McMahon", "3B"],
      ["9", "José Caballero", "SS"],
    ],
    homeLineup: [
      ["1", "Carlos Correa", "SS"],
      ["2", "Yordan Alvarez", "DH"],
      ["3", "Isaac Paredes", "3B"],
      ["4", "Christian Walker", "1B"],
      ["5", "Cam Smith", "RF"],
      ["6", "Dustin Harris", "LF"],
      ["7", "Christian Vázquez", "C"],
      ["8", "Daniel Johnson", "CF"],
      ["9", "Braden Shewmake", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Trent Grisham", team: "NYY", hrPct: 6.9, tb2Pct: 28.6, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Ben Rice", team: "NYY", hrPct: 16.5, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 13.4, tb2Pct: 47.8, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 3.6, tb2Pct: 26.4, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.4, tb2Pct: 12.4, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Paul Goldschmidt", team: "NYY", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 0.8, tb2Pct: 19.2, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ryan McMahon", team: "NYY", hrPct: 5.0, tb2Pct: 23.1, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "José Caballero", team: "NYY", hrPct: 1.4, tb2Pct: 19.6, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Carlos Correa", team: "HOU", hrPct: 5.4, tb2Pct: 31.8, tier: "HR D / TB B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 18.8, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 1.4, tb2Pct: 13.9, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Christian Walker", team: "HOU", hrPct: 8.6, tb2Pct: 35.1, tier: "HR B / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Cam Smith", team: "HOU", hrPct: 4.3, tb2Pct: 18.9, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Dustin Harris", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Christian Vázquez", team: "HOU", hrPct: 8.6, tb2Pct: 43.1, tier: "HR B / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Daniel Johnson", team: "HOU", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Braden Shewmake", team: "HOU", hrPct: 25.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; priced lean: HR (A+)" },
    ],
  },
  {
    gameKey: "PIT@MIL",
    venue: "MLB Park",
    away: "PIT",
    home: "MIL",
    timeEt: "2:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 104,
    homeAmerican: -122,
    impliedAwayPct: 47.15,
    impliedHomePct: 52.85,
    modelAwayPct: 48.51,
    modelHomePct: 51.49,
    edgeAwayPct: 1.37,
    edgeHomePct: -1.37,
    prediction: "MIL",
    decisionTier: "D",
    edgeOnPickPct: -1.37,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Carmen Mlodzinski vs Kyle Harrison. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Jake Mangum", "LF"],
      ["2", "Nick Gonzales", "2B"],
      ["3", "Bryan Reynolds", "RF"],
      ["4", "Marcell Ozuna", "DH"],
      ["5", "Ryan O'Hearn", "1B"],
      ["6", "Nick Yorke", "3B"],
      ["7", "Konnor Griffin", "SS"],
      ["8", "Joey Bart", "C"],
      ["9", "Billy Cook", "CF"],
    ],
    homeLineup: [
      ["1", "Brice Turang", "2B"],
      ["2", "William Contreras", "C"],
      ["3", "Jake Bauers", "1B"],
      ["4", "Gary Sánchez", "DH"],
      ["5", "Garrett Mitchell", "CF"],
      ["6", "Sal Frelick", "RF"],
      ["7", "Luis Rengifo", "3B"],
      ["8", "David Hamilton", "SS"],
      ["9", "Brandon Lockridge", "LF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Jake Mangum", team: "PIT", hrPct: 0.4, tb2Pct: 11.6, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; neutral pitcher matchup" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.4, tb2Pct: 15.9, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 1.9, tb2Pct: 17.1, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 2.2, tb2Pct: 18.8, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 4.5, tb2Pct: 31.5, tier: "HR D / TB B", note: "LHB vs LHP; elite power indicators; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 0.9, tb2Pct: 11.9, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 13.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Joey Bart", team: "PIT", hrPct: 0.6, tb2Pct: 10.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Billy Cook", team: "PIT", hrPct: 1.3, tb2Pct: 26.9, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Brice Turang", team: "MIL", hrPct: 6.9, tb2Pct: 36.0, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "William Contreras", team: "MIL", hrPct: 0.6, tb2Pct: 16.2, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 6.2, tb2Pct: 31.1, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 8.1, tb2Pct: 35.9, tier: "HR B / TB A", note: "RHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 2.8, tb2Pct: 21.4, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Sal Frelick", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "David Hamilton", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "SEA@STL",
    venue: "MLB Park",
    away: "SEA",
    home: "STL",
    timeEt: "2:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -130,
    homeAmerican: 112,
    impliedAwayPct: 54.51,
    impliedHomePct: 45.49,
    modelAwayPct: 56.56,
    modelHomePct: 43.44,
    edgeAwayPct: 2.05,
    edgeHomePct: -2.05,
    prediction: "SEA",
    decisionTier: "C",
    edgeOnPickPct: 2.05,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Emerson Hancock vs Michael McGreevy. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "J.P. Crawford", "SS"],
      ["2", "Cal Raleigh", "C"],
      ["3", "Julio Rodríguez", "CF"],
      ["4", "Randy Arozarena", "LF"],
      ["5", "Luke Raley", "RF"],
      ["6", "Dominic Canzone", "DH"],
      ["7", "Connor Joe", "1B"],
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
      ["7", "Nathan Church", "LF"],
      ["8", "Ramón Urías", "3B"],
      ["9", "Victor Scott II", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "J.P. Crawford", team: "SEA", hrPct: 5.9, tb2Pct: 25.0, tier: "HR C / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 7.9, tb2Pct: 30.4, tier: "HR B / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 5.4, tb2Pct: 29.5, tier: "HR D / TB B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 6.5, tb2Pct: 32.5, tier: "HR C / TB B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Luke Raley", team: "SEA", hrPct: 17.0, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 13.9, tb2Pct: 51.5, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Connor Joe", team: "SEA", hrPct: 1.5, tb2Pct: 11.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Cole Young", team: "SEA", hrPct: 6.4, tb2Pct: 28.0, tier: "HR C / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Leo Rivas", team: "SEA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "JJ Wetherholt", team: "STL", hrPct: 3.9, tb2Pct: 24.1, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Iván Herrera", team: "STL", hrPct: 7.0, tb2Pct: 36.0, tier: "HR C / TB A", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Alec Burleson", team: "STL", hrPct: 6.8, tb2Pct: 34.5, tier: "HR C / TB B", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jordan Walker", team: "STL", hrPct: 11.3, tb2Pct: 42.4, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nolan Gorman", team: "STL", hrPct: 1.7, tb2Pct: 16.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Masyn Winn", team: "STL", hrPct: 0.7, tb2Pct: 21.3, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Nathan Church", team: "STL", hrPct: 6.4, tb2Pct: 30.4, tier: "HR C / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ramón Urías", team: "STL", hrPct: 2.1, tb2Pct: 10.7, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Victor Scott II", team: "STL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "ATH@TEX",
    venue: "MLB Park",
    away: "ATH",
    home: "TEX",
    timeEt: "2:35 PM",
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
    impliedAwayPct: 48.21,
    impliedHomePct: 51.79,
    modelAwayPct: 49.64,
    modelHomePct: 50.36,
    edgeAwayPct: 1.43,
    edgeHomePct: -1.43,
    prediction: "TEX",
    decisionTier: "D",
    edgeOnPickPct: -1.43,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: J.T. Ginn vs Kumar Rocker. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Nick Kurtz", "1B"],
      ["2", "Shea Langeliers", "C"],
      ["3", "Tyler Soderstrom", "LF"],
      ["4", "Brent Rooker", "DH"],
      ["5", "Carlos Cortes", "RF"],
      ["6", "Jacob Wilson", "SS"],
      ["7", "Jeff McNeil", "2B"],
      ["8", "Lawrence Butler", "CF"],
      ["9", "Darell Hernaiz", "3B"],
    ],
    homeLineup: [
      ["1", "Brandon Nimmo", "RF"],
      ["2", "Joc Pederson", "DH"],
      ["3", "Corey Seager", "SS"],
      ["4", "Josh Jung", "3B"],
      ["5", "Evan Carter", "CF"],
      ["6", "Jake Burger", "1B"],
      ["7", "Josh Smith", "2B"],
      ["8", "Danny Jansen", "C"],
      ["9", "Alejandro Osuna", "LF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Nick Kurtz", team: "ATH", hrPct: 12.1, tb2Pct: 47.5, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 8.1, tb2Pct: 37.5, tier: "HR B / TB A", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 3.6, tb2Pct: 23.6, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brent Rooker", team: "ATH", hrPct: 0.7, tb2Pct: 7.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 11.2, tb2Pct: 49.1, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+); HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.4, tb2Pct: 16.8, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.4, tb2Pct: 18.1, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 0.4, tb2Pct: 11.7, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Darell Hernaiz", team: "ATH", hrPct: 2.8, tb2Pct: 22.4, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 2.8, tb2Pct: 22.8, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Joc Pederson", team: "TEX", hrPct: 0.4, tb2Pct: 10.8, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Corey Seager", team: "TEX", hrPct: 4.4, tb2Pct: 26.0, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Josh Jung", team: "TEX", hrPct: 5.2, tb2Pct: 32.8, tier: "HR D / TB B", note: "RHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Evan Carter", team: "TEX", hrPct: 1.4, tb2Pct: 16.6, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jake Burger", team: "TEX", hrPct: 1.8, tb2Pct: 17.5, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Josh Smith", team: "TEX", hrPct: 0.4, tb2Pct: 7.3, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Danny Jansen", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Alejandro Osuna", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "SD@AZ",
    venue: "MLB Park",
    away: "SD",
    home: "AZ",
    timeEt: "4:05 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -134,
    homeAmerican: 114,
    impliedAwayPct: 55.07,
    impliedHomePct: 44.93,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "PASS",
    decisionTier: "data_blocked",
    edgeOnPickPct: 0.00,
    modelConfidence: "data_blocked",
    analystConfidence: "Medium",
    flags: "weather_fallback_conservative;weather_geocode_failed;weather_live_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Michael King vs Ryne Nelson. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + RotoWire)",
    awayLineup: [
      ["1", "Ramón Laureano", "LF"],
      ["2", "Fernando Tatis Jr.", "RF"],
      ["3", "Jackson Merrill", "CF"],
      ["4", "Manny Machado", "3B"],
      ["5", "Xander Bogaerts", "SS"],
      ["6", "Gavin Sheets", "1B"],
      ["7", "Miguel Andujar", "DH"],
      ["8", "Luis Campusano", "C"],
      ["9", "Jake Cronenworth", "2B"],
    ],
    homeLineup: [
      ["1", "Ildemaro Vargas", "2B"],
      ["2", "Ketel Marte", "DH"],
      ["3", "Corbin Carroll", "RF"],
      ["4", "Lourdes Gurriel Jr.", "LF"],
      ["5", "Adrian Del Castillo", "C"],
      ["6", "Jose Fernandez", "SS"],
      ["7", "Nolan Arenado", "3B"],
      ["8", "Alek Thomas", "CF"],
      ["9", "Tim Tawa", "1B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Ramón Laureano", team: "SD", hrPct: 8.4, tb2Pct: 36.1, tier: "HR B / TB A", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 6.0, tb2Pct: 28.4, tier: "HR C / TB B", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 6.3, tb2Pct: 27.9, tier: "HR C / TB C", note: "Display only — Yet to begin; LHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Manny Machado", team: "SD", hrPct: 1.6, tb2Pct: 11.9, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; limited power profile; vs vulnerable pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 8.0, tb2Pct: 38.2, tier: "HR B / TB A", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Gavin Sheets", team: "SD", hrPct: 7.3, tb2Pct: 32.5, tier: "HR C / TB B", note: "Display only — Yet to begin; LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 2.8, tb2Pct: 26.2, tier: "HR D / TB C", note: "Display only — Yet to begin; RHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Luis Campusano", team: "SD", hrPct: 11.0, tb2Pct: 49.4, tier: "HR A / TB A+", note: "Display only — Yet to begin; RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Jake Cronenworth", team: "SD", hrPct: 1.6, tb2Pct: 11.6, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; limited power profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 7.6, tb2Pct: 37.8, tier: "HR C / TB A", note: "Display only — Yet to begin; LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Ketel Marte", team: "AZ", hrPct: 5.4, tb2Pct: 30.5, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 4.5, tb2Pct: 30.7, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 0.9, tb2Pct: 15.4, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jose Fernandez", team: "AZ", hrPct: 0.8, tb2Pct: 20.2, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 3.1, tb2Pct: 23.6, tier: "HR D / TB C", note: "Display only — Yet to begin; RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 5.1, tb2Pct: 29.1, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Tim Tawa", team: "AZ", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; contact-driven profile; vs tough pitcher" },
    ],
  },
  {
    gameKey: "MIA@SF",
    venue: "MLB Park",
    away: "MIA",
    home: "SF",
    timeEt: "4:05 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 107,
    homeAmerican: -125,
    impliedAwayPct: 46.51,
    impliedHomePct: 53.49,
    modelAwayPct: 44.36,
    modelHomePct: 55.64,
    edgeAwayPct: -2.15,
    edgeHomePct: 2.15,
    prediction: "SF",
    decisionTier: "C",
    edgeOnPickPct: 2.15,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Max Meyer vs Landen Roupp. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + RotoWire)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Jakob Marsee", "CF"],
      ["2", "Kyle Stowers", "1B"],
      ["3", "Otto Lopez", "SS"],
      ["4", "Xavier Edwards", "2B"],
      ["5", "Liam Hicks", "C"],
      ["6", "Owen Caissie", "RF"],
      ["7", "Connor Norby", "DH"],
      ["8", "Graham Pauley", "3B"],
      ["9", "Heriberto Hernández", "LF"],
    ],
    homeLineup: [
      ["1", "Jung Hoo Lee", "RF"],
      ["2", "Matt Chapman", "3B"],
      ["3", "Luis Arraez", "2B"],
      ["4", "Casey Schmitt", "DH"],
      ["5", "Rafael Devers", "1B"],
      ["6", "Heliot Ramos", "LF"],
      ["7", "Drew Gilbert", "CF"],
      ["8", "Christian Koss", "SS"],
      ["9", "Patrick Bailey", "C"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Jakob Marsee", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Kyle Stowers", team: "MIA", hrPct: 0.4, tb2Pct: 22.3, tier: "HR D / TB C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 1.5, tb2Pct: 24.7, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 0.4, tb2Pct: 17.5, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 0.7, tb2Pct: 21.2, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Connor Norby", team: "MIA", hrPct: 0.4, tb2Pct: 9.7, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Graham Pauley", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Heriberto Hernández", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
    ],
    propsHome: [
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 2.0, tb2Pct: 25.5, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.4, tb2Pct: 9.7, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 13.4, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 6.7, tb2Pct: 33.6, tier: "HR C / TB B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Rafael Devers", team: "SF", hrPct: 0.4, tb2Pct: 10.1, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 7.8, tb2Pct: 37.1, tier: "HR B / TB A", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 4.5, tb2Pct: 22.7, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Christian Koss", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.6, tb2Pct: 11.3, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "LAA@KC",
    venue: "MLB Park",
    away: "LAA",
    home: "KC",
    timeEt: "4:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 100,
    homeAmerican: -114,
    impliedAwayPct: 48.42,
    impliedHomePct: 51.58,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "PASS",
    decisionTier: "data_blocked",
    edgeOnPickPct: 0.00,
    modelConfidence: "data_blocked",
    analystConfidence: "Medium",
    flags: "lineup_not_posted_api",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Reid Detmers vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (RotoWire)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Zach Neto", "SS"],
      ["2", "Mike Trout", "CF"],
      ["3", "Yoán Moncada", "3B"],
      ["4", "Jorge Soler", "DH"],
      ["5", "Nolan Schanuel", "1B"],
      ["6", "Jo Adell", "RF"],
      ["7", "Josh Lowe", "LF"],
      ["8", "Travis d'Arnaud", "C"],
      ["9", "Adam Frazier", "2B"],
    ],
    homeLineup: [
      ["1", "Lane Thomas", "CF"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Vinnie Pasquantino", "1B"],
      ["4", "Salvador Perez", "DH"],
      ["5", "Starling Marte", "RF"],
      ["6", "Carter Jensen", "C"],
      ["7", "Nick Loftin", "3B"],
      ["8", "Isaac Collins", "LF"],
      ["9", "Michael Massey", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Zach Neto", team: "LAA", hrPct: 1.5, tb2Pct: 13.7, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Mike Trout", team: "LAA", hrPct: 13.2, tb2Pct: 50.1, tier: "HR A / TB A+", note: "Display only — Yet to begin; RHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 2.9, tb2Pct: 18.7, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 3.6, tb2Pct: 21.8, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; above-average damage; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.4, tb2Pct: 11.2, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Jo Adell", team: "LAA", hrPct: 3.8, tb2Pct: 25.4, tier: "HR D / TB C", note: "Display only — Yet to begin; RHB vs RHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Travis d'Arnaud", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 2.3, tb2Pct: 21.8, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 2.2, tb2Pct: 27.8, tier: "HR D / TB C", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.4, tb2Pct: 13.2, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Salvador Perez", team: "KC", hrPct: 1.3, tb2Pct: 14.7, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Starling Marte", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Carter Jensen", team: "KC", hrPct: 5.5, tb2Pct: 30.2, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Nick Loftin", team: "KC", hrPct: 0.4, tb2Pct: 19.2, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Michael Massey", team: "KC", hrPct: 1.5, tb2Pct: 22.1, tier: "HR D / TB C", note: "Display only — Yet to begin; LHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "CHC@LAD",
    venue: "MLB Park",
    away: "CHC",
    home: "LAD",
    timeEt: "4:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 106,
    homeAmerican: -124,
    impliedAwayPct: 46.72,
    impliedHomePct: 53.28,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "PASS",
    decisionTier: "data_blocked",
    edgeOnPickPct: 0.00,
    modelConfidence: "data_blocked",
    analystConfidence: "Medium",
    flags: "draftkings_hr_away_side_missing;lineup_not_posted_api;lineup_verification_missing;recent_form_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Shota Imanaga vs Justin Wrobleski. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Not Posted",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [],
    homeLineup: [
      ["1", "Shohei Ohtani", "DH"],
      ["2", "Freddie Freeman", "1B"],
      ["3", "Teoscar Hernández", "LF"],
      ["4", "Andy Pages", "CF"],
      ["5", "Kyle Tucker", "RF"],
      ["6", "Miguel Rojas", "2B"],
      ["7", "Dalton Rushing", "C"],
      ["8", "Santiago Espinal", "3B"],
      ["9", "Hyeseong Kim", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-26 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [],
    propsHome: [
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 3.6, tb2Pct: 22.3, tier: "HR D / TB C", note: "Display only — Yet to begin; LHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 3.2, tb2Pct: 30.8, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 0.4, tb2Pct: 13.0, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Andy Pages", team: "LAD", hrPct: 1.8, tb2Pct: 22.0, tier: "HR D / TB C", note: "Display only — Yet to begin; RHB vs LHP; above-average damage; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 0.4, tb2Pct: 11.6, tier: "HR D / TB D", note: "Display only — Yet to begin; LHB vs LHP; contact-driven profile; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Miguel Rojas", team: "LAD", hrPct: 3.5, tb2Pct: 32.1, tier: "HR D / TB B", note: "Display only — Yet to begin; RHB vs LHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 17.5, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "Display only — Yet to begin; LHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Santiago Espinal", team: "LAD", hrPct: 0.4, tb2Pct: 9.8, tier: "HR D / TB D", note: "Display only — Yet to begin; RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via draftkings, HR tier downgraded" },
      { batter: "Hyeseong Kim", team: "LAD", hrPct: 0.4, tb2Pct: 24.1, tier: "HR D / TB C", note: "Display only — Yet to begin; LHB vs LHP; above-average damage; vs tough pitcher; HR market partial via draftkings, HR tier downgraded" },
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

export default function Apr26Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 26, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-26
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
2026-04-26,COL,NYM,1:45 PM,TBD,Kodai Senga,220,-260,7.0,-115,-105,52F / 9 mph wind / 0% precip / Open,51.7,9.3,0,0.444,0.403,,,pregame,Yet To Begin,Scheduled,Yet to begin,,,Partial,hr_market_integrity_degraded|lineup_not_posted_api|recent_form_missing|starter_verification_failed,30.20,69.80,,,,,,,,,,PASS,data_blocked,,data_blocked,hr_market_integrity_degraded;lineup_not_posted_api;recent_form_missing;starter_verification_failed,Low,"Auto-generated live scaffold from MLB schedule + market odds: TBD vs Kodai Senga. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
2026-04-26,WSH,CWS,2:10 PM,Foster Griffin,Bryan Hudson,102,-120,7.5,-105,-115,52F / 10 mph wind / 0% precip / Open,52.5,9.8,0,0.330,0.317,0.467,0.593,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,47.58,52.42,41.89,58.11,47.01,52.99,0.10,47.01,52.99,-0.57,0.57,CWS,D,0.57,Medium,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Foster Griffin vs Bryan Hudson. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-26,NYY,HOU,2:10 PM,Luis Gil,Spencer Arrighetti,-131,111,9.5,-110,-110,80F / 8 mph wind / 4% precip / Retractable,80.2,7.6,4,0.409,0.300,0.656,0.549,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,54.47,45.53,50.82,49.18,54.11,45.89,0.10,54.11,45.89,-0.37,0.37,NYY,D,-0.37,Low,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Luis Gil vs Spencer Arrighetti. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-26,PIT,MIL,2:10 PM,Carmen Mlodzinski,Kyle Harrison,104,-122,7.5,-103,-122,49F / 8 mph wind / 0% precip / Retractable,49.3,8.5,0,0.367,0.403,0.503,0.444,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,47.15,52.85,60.81,39.19,48.51,51.49,0.10,48.51,51.49,1.37,-1.37,MIL,D,-1.37,Medium,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Carmen Mlodzinski vs Kyle Harrison. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-26,SEA,STL,2:15 PM,Emerson Hancock,Michael McGreevy,-130,112,8.5,-105,-115,78F / 9 mph wind / 0% precip / Open,77.7,9.0,0,0.376,0.304,0.521,0.543,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,54.51,45.49,75.00,25.00,56.56,43.44,0.10,56.56,43.44,2.05,-2.05,SEA,C,2.05,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Emerson Hancock vs Michael McGreevy. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-26,ATH,TEX,2:35 PM,J.T. Ginn,Kumar Rocker,100,-116,8.5,-115,-105,81F / 13 mph wind / 0% precip / Retractable,81.4,13.2,0,0.458,0.441,0.571,0.511,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,48.21,51.79,62.47,37.53,49.64,50.36,0.10,49.64,50.36,1.43,-1.43,TEX,D,-1.43,Medium,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: J.T. Ginn vs Kumar Rocker. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-26,SD,AZ,4:05 PM,Michael King,Ryne Nelson,-134,114,15.0,-105,-115,Conservative fallback / Retractable,,,,0.497,0.409,0.490,0.561,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,weather_fallback_conservative|weather_geocode_failed|weather_live_missing,55.07,44.93,,,,,,,,,,PASS,data_blocked,,data_blocked,weather_fallback_conservative;weather_geocode_failed;weather_live_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Michael King vs Ryne Nelson. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
2026-04-26,MIA,SF,4:05 PM,Max Meyer,Landen Roupp,107,-125,7.5,-115,-105,57F / 13 mph wind / 0% precip / Open,57.4,12.6,0,0.509,0.457,0.491,0.496,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,46.51,53.49,25.00,75.00,44.36,55.64,0.10,44.36,55.64,-2.15,2.15,SF,C,2.15,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Max Meyer vs Landen Roupp. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-26,LAA,KC,4:10 PM,Reid Detmers,Seth Lugo,100,-114,8.5,-115,-105,79F / 17 mph wind / 16% precip / Open,78.7,16.7,16,0.355,0.306,0.512,0.480,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,lineup_not_posted_api,48.42,51.58,,,,,,,,,,PASS,data_blocked,,data_blocked,lineup_not_posted_api,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Reid Detmers vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
2026-04-26,CHC,LAD,4:10 PM,Shota Imanaga,Justin Wrobleski,106,-124,9.0,-110,-110,65F / 15 mph wind / 0% precip / Open,64.9,15.1,0,0.450,0.359,,0.572,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,draftkings_hr_away_side_missing|lineup_not_posted_api|lineup_verification_missing|recent_form_missing,46.72,53.28,,,,,,,,,,PASS,data_blocked,,data_blocked,draftkings_hr_away_side_missing;lineup_not_posted_api;lineup_verification_missing;recent_form_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Shota Imanaga vs Justin Wrobleski. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,hr_market_integrity,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-26,WSH@CWS,WSH,James Wood,Bryan Hudson,14.38,50.74,+596,-103,324,-9.21,1.5,121,5.49,0.763,0,A+,A+,A+,2+ TB,A+,priced_no_edge,partial,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,WSH@CWS,WSH,Curtis Mead,Bryan Hudson,3.49,19.67,+2763,+408,750,-8.27,1.5,158,-19.09,0.467,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,WSH@CWS,WSH,Daylen Lile,Bryan Hudson,2.82,27.38,+3451,+265,850,-7.71,1.5,134,-15.35,0.732,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,WSH@CWS,WSH,Brady House,Bryan Hudson,1.68,15.75,+5860,+535,850,-8.85,0.5,-164,,0.399,0,D,D,D,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,WSH,CJ Abrams,Bryan Hudson,6.23,31.70,+1505,+215,605,-7.95,1.5,148,-8.62,0.634,0,B,C,B,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,WSH@CWS,WSH,Jacob Young,Bryan Hudson,0.40,12.51,+24900,+700,1300,-6.74,0.5,-152,,0.373,0,D,D,D,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,WSH,Luis García Jr.,Bryan Hudson,0.40,14.77,+24900,+577,725,-11.72,1.5,170,-22.26,0.349,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,WSH@CWS,WSH,Nasim Nuñez,Bryan Hudson,0.40,6.00,+24900,+1567,1340,-6.54,0.5,-127,,0.223,0,D,D,D,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,WSH,Drew Millas,Bryan Hudson,0.40,6.00,+24900,+1567,1200,-7.29,1.5,280,-20.32,0.259,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,WSH@CWS,CWS,Chase Meidroth,Foster Griffin,1.41,19.87,+7002,+403,NA,,1.5,145,-20.95,0.501,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,CWS,Miguel Vargas,Foster Griffin,7.21,31.67,+1287,+216,NA,,1.5,140,-9.99,0.662,0,B,C,B,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,CWS,Munetaka Murakami,Foster Griffin,17.61,55.00,+468,-122,NA,,0.5,-135,,0.950,0,A+,A+,A+,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,CWS,Everson Pereira,Foster Griffin,7.94,35.62,+1160,+181,NA,,0.5,-154,,0.652,0,A,B,A,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,CWS,Colson Montgomery,Foster Griffin,9.56,36.60,+946,+173,NA,,1.5,135,-5.95,0.910,0,A,B,A,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,CWS,Tanner Murray,Foster Griffin,3.78,20.77,+2546,+381,NA,,0.5,-134,,0.627,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,CWS,Derek Hill,Foster Griffin,3.84,22.70,+2503,+340,NA,,0.5,-134,,0.617,0,C,D,C,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,CWS,Drew Romo,Foster Griffin,0.40,6.00,+24900,+1567,NA,,1.5,216,-25.65,,0,D,D,D,,,unpriced,partial,priced_no_edge,"Medium — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,WSH@CWS,CWS,Luisangel Acuña,Foster Griffin,0.40,6.00,+24900,+1567,NA,,0.5,-152,,0.241,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,NYY@HOU,NYY,Trent Grisham,Spencer Arrighetti,6.87,28.60,+1355,+250,533,-8.92,1.5,128,-15.26,0.687,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,NYY@HOU,NYY,Ben Rice,Spencer Arrighetti,16.53,55.00,+505,-122,310,-7.86,1.5,117,8.92,0.939,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,NYY@HOU,NYY,Aaron Judge,Spencer Arrighetti,13.39,47.76,+647,+109,211,-18.77,1.5,-110,-4.62,0.898,0,A+,A+,A+,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,NYY@HOU,NYY,Cody Bellinger,Spencer Arrighetti,3.57,26.40,+2700,+279,521,-12.53,1.5,122,-18.64,0.623,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,NYY@HOU,NYY,Jazz Chisholm Jr.,Spencer Arrighetti,0.40,12.40,+24900,+707,447,-17.88,0.5,-154,,0.553,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,NYY,Paul Goldschmidt,Spencer Arrighetti,0.40,6.00,+24900,+1567,510,-15.99,1.5,140,-35.67,0.180,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,NYY@HOU,NYY,J.C. Escarra,Spencer Arrighetti,0.78,19.19,+12709,+421,620,-13.11,0.5,-133,,0.595,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,NYY,Ryan McMahon,Spencer Arrighetti,5.00,23.10,+1898,+333,640,-8.51,0.5,-110,,0.636,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,NYY,José Caballero,Spencer Arrighetti,1.37,19.57,+7217,+411,840,-9.27,0.5,-124,,0.792,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,HOU,Carlos Correa,Luis Gil,5.43,31.77,+1740,+215,410,-14.17,1.5,132,-11.33,0.547,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,NYY@HOU,HOU,Yordan Alvarez,Luis Gil,18.81,55.00,+432,-122,205,-13.98,1.5,-121,0.25,0.898,0,A+,A+,A+,,,priced_no_edge,full,priced_below_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,NYY@HOU,HOU,Isaac Paredes,Luis Gil,1.45,13.88,+6812,+620,442,-17.00,0.5,-160,,0.464,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,HOU,Christian Walker,Luis Gil,8.59,35.09,+1064,+185,333,-14.50,1.5,134,-7.64,0.577,0,A,B,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,NYY@HOU,HOU,Cam Smith,Luis Gil,4.27,18.91,+2239,+429,670,-8.71,0.5,-156,,0.185,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,HOU,Dustin Harris,Luis Gil,0.40,6.00,+24900,+1567,780,-10.96,0.5,-132,,0.259,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,HOU,Christian Vázquez,Luis Gil,8.57,43.07,+1066,+132,890,-1.53,0.5,-136,,0.718,0,A+,B,A+,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,HOU,Daniel Johnson,Luis Gil,0.40,6.00,+24900,+1567,553,-14.91,0.5,-136,,0.347,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,NYY@HOU,HOU,Braden Shewmake,Luis Gil,25.00,55.00,+300,-122,780,13.64,0.5,-114,,0.950,0,A+,A+,A+,HR,A+,qualified,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,PIT,Jake Mangum,Kyle Harrison,0.40,11.64,+24900,+759,1200,-7.29,1.5,130,-31.84,0.501,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,PIT@MIL,PIT,Nick Gonzales,Kyle Harrison,0.40,15.86,+24900,+531,770,-11.09,1.5,129,-27.81,0.448,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,PIT@MIL,PIT,Bryan Reynolds,Kyle Harrison,1.86,17.13,+5270,+484,496,-14.92,1.5,135,-25.43,0.424,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,PIT@MIL,PIT,Marcell Ozuna,Kyle Harrison,2.22,18.82,+4410,+431,489,-14.76,0.5,-160,,0.549,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,PIT,Ryan O'Hearn,Kyle Harrison,4.55,31.47,+2098,+218,800,-6.56,0.5,-169,,0.600,0,B,D,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,PIT,Nick Yorke,Kyle Harrison,0.89,11.95,+11199,+737,660,-12.27,0.5,-175,,0.239,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,PIT,Konnor Griffin,Kyle Harrison,0.40,13.31,+24900,+651,870,-9.91,0.5,-145,,0.489,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,PIT,Joey Bart,Kyle Harrison,0.63,10.65,+15867,+839,670,-12.36,0.5,-122,,0.480,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,PIT,Billy Cook,Kyle Harrison,1.31,26.95,+7521,+271,840,-9.33,0.5,112,,0.798,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,MIL,Brice Turang,Carmen Mlodzinski,6.89,36.02,+1352,+178,700,-5.61,1.5,146,-4.63,0.655,0,A,C,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,PIT@MIL,MIL,William Contreras,Carmen Mlodzinski,0.62,16.23,+16099,+516,850,-9.91,1.5,140,-25.44,0.355,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,PIT@MIL,MIL,Jake Bauers,Carmen Mlodzinski,6.24,31.10,+1502,+222,583,-8.40,0.5,-145,,0.583,0,B,C,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,MIL,Gary Sánchez,Carmen Mlodzinski,8.13,35.86,+1130,+179,485,-8.96,0.5,-130,,0.641,0,A,B,A,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,MIL,Garrett Mitchell,Carmen Mlodzinski,2.82,21.38,+3443,+368,840,-7.82,0.5,-121,,0.429,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,MIL,Sal Frelick,Carmen Mlodzinski,0.40,6.00,+24900,+1567,1140,-7.66,0.5,-167,,0.283,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,MIL,Luis Rengifo,Carmen Mlodzinski,0.40,6.00,+24900,+1567,1040,-8.37,0.5,-162,,0.340,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,MIL,David Hamilton,Carmen Mlodzinski,0.40,6.00,+24900,+1567,1140,-7.66,0.5,-117,,0.307,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,PIT@MIL,MIL,Brandon Lockridge,Carmen Mlodzinski,0.40,6.00,+24900,+1567,1140,-7.66,0.5,-133,,0.402,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,SEA@STL,SEA,J.P. Crawford,Michael McGreevy,5.89,25.03,+1599,+299,780,-5.48,1.5,128,-18.82,0.408,0,C,C,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,SEA,Cal Raleigh,Michael McGreevy,7.88,30.38,+1169,+229,215,-23.87,1.5,-114,-22.89,0.596,0,B,B,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,SEA,Julio Rodríguez,Michael McGreevy,5.40,29.46,+1753,+239,600,-8.89,1.5,-106,-22.00,0.574,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,SEA,Randy Arozarena,Michael McGreevy,6.47,32.48,+1446,+208,595,-7.92,1.5,120,-12.98,0.570,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,SEA,Luke Raley,Michael McGreevy,16.97,55.00,+489,-122,484,-0.15,1.5,150,15.00,0.821,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,SEA,Dominic Canzone,Michael McGreevy,13.90,51.53,+620,-106,440,-4.62,1.5,122,6.48,0.670,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,SEA,Connor Joe,Michael McGreevy,1.48,11.73,+6650,+753,960,-7.95,0.5,-157,,0.396,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,SEA@STL,SEA,Cole Young,Michael McGreevy,6.40,27.98,+1463,+257,640,-7.12,0.5,-162,,0.437,0,C,C,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,SEA@STL,SEA,Leo Rivas,Michael McGreevy,0.40,6.00,+24900,+1567,1040,-8.37,0.5,-125,,0.218,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,SEA@STL,STL,JJ Wetherholt,Emerson Hancock,3.91,24.10,+2458,+315,670,-9.08,1.5,145,-16.72,0.627,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,STL,Iván Herrera,Emerson Hancock,7.05,36.02,+1319,+178,559,-8.13,1.5,114,-10.70,0.774,0,A,C,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,STL,Alec Burleson,Emerson Hancock,6.77,34.46,+1378,+190,567,-8.23,1.5,118,-11.42,0.585,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,STL,Jordan Walker,Emerson Hancock,11.33,42.35,+783,+136,376,-9.68,1.5,115,-4.16,0.524,0,A+,A,A+,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,SEA@STL,STL,Nolan Gorman,Emerson Hancock,1.66,16.01,+5910,+525,524,-14.36,0.5,-146,,0.419,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,SEA@STL,STL,Masyn Winn,Emerson Hancock,0.72,21.31,+13854,+369,1060,-7.90,0.5,-185,,0.723,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,SEA@STL,STL,Nathan Church,Emerson Hancock,6.38,30.39,+1468,+229,890,-3.72,0.5,-169,,0.872,0,B,C,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,SEA@STL,STL,Ramón Urías,Emerson Hancock,2.07,10.68,+4731,+837,840,-8.57,0.5,-169,,0.180,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,SEA@STL,STL,Victor Scott II,Emerson Hancock,0.40,6.00,+24900,+1567,1200,-7.29,0.5,-109,,0.180,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,ATH@TEX,ATH,Nick Kurtz,Kumar Rocker,12.14,47.52,+724,+110,242,-17.10,1.5,110,-0.10,0.839,0,A+,A,A+,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,ATH@TEX,ATH,Shea Langeliers,Kumar Rocker,8.08,37.46,+1138,+167,382,-12.67,1.5,120,-8.00,0.659,0,A,B,A,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,ATH@TEX,ATH,Tyler Soderstrom,Kumar Rocker,3.64,23.64,+2649,+323,445,-14.71,1.5,130,-19.84,0.435,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,ATH@TEX,ATH,Brent Rooker,Kumar Rocker,0.73,7.78,+13691,+1185,442,-17.73,1.5,130,-35.70,,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"Medium — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,ATH@TEX,ATH,Carlos Cortes,Kumar Rocker,11.15,49.13,+797,+104,580,-3.55,1.5,141,7.64,0.839,0,A+,A,A+,2+ TB,A+,priced_no_edge,partial,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,ATH@TEX,ATH,Jacob Wilson,Kumar Rocker,0.40,16.76,+24900,+497,1100,-7.93,1.5,148,-23.57,0.602,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,ATH@TEX,ATH,Jeff McNeil,Kumar Rocker,0.40,18.13,+24900,+452,900,-9.60,1.5,164,-19.75,0.496,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-26,ATH@TEX,ATH,Lawrence Butler,Kumar Rocker,0.44,11.66,+22659,+758,595,-13.95,0.5,-139,,0.356,0,D,D,D,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,ATH,Darell Hernaiz,Kumar Rocker,2.84,22.43,+3423,+346,1200,-4.85,0.5,-126,,0.680,0,C,D,C,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Brandon Nimmo,J.T. Ginn,2.76,22.81,+3521,+338,NA,,1.5,115,-23.70,0.408,0,C,D,C,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Joc Pederson,J.T. Ginn,0.40,10.80,+24900,+826,NA,,0.5,-142,,0.472,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Corey Seager,J.T. Ginn,4.36,26.01,+2195,+284,NA,,1.5,106,-22.53,0.584,0,C,D,C,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Josh Jung,J.T. Ginn,5.18,32.82,+1831,+205,NA,,1.5,140,-8.85,0.948,0,B,D,B,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Evan Carter,J.T. Ginn,1.42,16.56,+6949,+504,NA,,0.5,-170,,0.491,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Jake Burger,J.T. Ginn,1.84,17.46,+5335,+473,NA,,1.5,145,-23.35,0.490,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Josh Smith,J.T. Ginn,0.40,7.33,+24900,+1264,NA,,0.5,-152,,0.424,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Danny Jansen,J.T. Ginn,0.40,6.00,+24900,+1567,NA,,0.5,-116,,0.365,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,ATH@TEX,TEX,Alejandro Osuna,J.T. Ginn,0.40,6.00,+24900,+1567,NA,,0.5,-122,,0.421,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-26,SD@AZ,SD,Ramón Laureano,Ryne Nelson,8.41,36.11,+1088,+177,273,-18.40,2.5,106,,0.498,0,A,B,A,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,SD,Fernando Tatis Jr.,Ryne Nelson,5.95,28.43,+1580,+252,216,-25.69,2.5,-105,,0.382,0,B,C,B,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,SD,Jackson Merrill,Ryne Nelson,6.31,27.89,+1485,+259,247,-22.51,2.5,-101,,0.446,0,C,C,C,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,SD,Manny Machado,Ryne Nelson,1.63,11.92,+6027,+739,241,-27.69,2.5,109,,0.268,0,D,D,D,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,SD,Xander Bogaerts,Ryne Nelson,8.01,38.16,+1149,+162,376,-13.00,1.5,-140,-20.18,0.729,0,A,B,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,SD,Gavin Sheets,Ryne Nelson,7.27,32.53,+1276,+207,256,-20.82,1.5,-134,-24.74,0.519,0,B,C,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,SD,Miguel Andujar,Ryne Nelson,2.82,26.17,+3448,+282,584,-11.80,1.5,-132,-30.73,0.533,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,SD,Luis Campusano,Ryne Nelson,11.03,49.42,+806,+102,402,-8.89,1.5,-113,-3.63,0.715,0,A+,A,A+,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,SD,Jake Cronenworth,Ryne Nelson,1.58,11.65,+6215,+759,432,-17.21,1.5,110,-35.97,0.324,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Ildemaro Vargas,Michael King,7.56,37.79,+1223,+165,442,-10.89,1.5,-127,-18.15,0.785,0,A,C,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Ketel Marte,Michael King,5.37,30.53,+1762,+228,265,-22.03,1.5,-136,-27.09,0.633,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Corbin Carroll,Michael King,4.53,30.72,+2107,+225,241,-24.79,1.5,-146,-28.62,0.588,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Lourdes Gurriel Jr.,Michael King,0.40,6.00,+24900,+1567,404,-19.44,1.5,-139,-52.16,0.180,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Adrian Del Castillo,Michael King,0.85,15.37,+11650,+550,366,-20.61,1.5,-104,-35.61,0.439,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Jose Fernandez,Michael King,0.79,20.20,+12548,+395,560,-14.36,1.5,-105,-31.02,0.468,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Nolan Arenado,Michael King,3.15,23.64,+3076,+323,448,-15.10,1.5,114,-23.09,0.929,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Alek Thomas,Michael King,5.08,29.09,+1870,+244,531,-10.77,1.5,112,-18.08,0.735,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Tim Tawa,Michael King,0.40,6.00,+24900,+1567,568,-14.57,1.5,136,-36.37,0.292,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,MIA@SF,MIA,Jakob Marsee,Landen Roupp,0.40,6.00,+24900,+1567,1160,-7.54,1.5,155,-33.22,0.492,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Kyle Stowers,Landen Roupp,0.40,22.32,+24900,+348,470,-17.14,1.5,132,-20.79,0.606,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Otto Lopez,Landen Roupp,1.55,24.73,+6359,+304,890,-8.55,1.5,108,-23.35,0.634,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Xavier Edwards,Landen Roupp,0.40,17.54,+24900,+470,1160,-7.54,1.5,132,-25.57,0.539,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Liam Hicks,Landen Roupp,0.73,21.18,+13655,+372,1280,-6.52,0.5,-179,,0.662,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,MIA,Owen Caissie,Landen Roupp,0.40,6.00,+24900,+1567,920,-9.40,0.5,-119,,0.253,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,MIA,Connor Norby,Landen Roupp,0.40,9.68,+24900,+933,840,-10.24,0.5,-160,,0.537,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,MIA,Graham Pauley,Landen Roupp,0.40,6.00,+24900,+1567,1220,-7.18,0.5,-104,,0.422,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,MIA,Heriberto Hernández,Landen Roupp,0.40,6.00,+24900,+1567,NA,,,,,0.279,0,D,D,D,,,unpriced,full,unpriced,"High — stats+savant+recent; BvP disabled, confirmed lineup, no live markets",none,data_blocked
2026-04-26,MIA@SF,SF,Jung Hoo Lee,Max Meyer,2.01,25.52,+4880,+292,920,-7.80,1.5,116,-20.77,0.677,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Matt Chapman,Max Meyer,0.40,9.74,+24900,+927,640,-13.11,1.5,138,-32.28,0.377,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Luis Arraez,Max Meyer,0.40,13.35,+24900,+649,1200,-7.29,1.5,124,-31.29,0.474,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Casey Schmitt,Max Meyer,6.73,33.57,+1386,+198,570,-8.19,1.5,129,-10.09,0.671,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Rafael Devers,Max Meyer,0.40,10.10,+24900,+890,474,-17.02,0.5,-167,,0.286,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,SF,Heliot Ramos,Max Meyer,7.84,37.11,+1175,+170,610,-6.24,1.5,130,-6.37,0.828,0,A,B,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Drew Gilbert,Max Meyer,4.48,22.67,+2132,+341,930,-5.23,0.5,-134,,0.560,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,SF,Christian Koss,Max Meyer,0.40,6.00,+24900,+1567,1040,-8.37,0.5,-167,,0.180,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,SF,Patrick Bailey,Max Meyer,0.61,11.31,+16240,+784,820,-10.26,0.5,-118,,0.412,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,LAA@KC,LAA,Zach Neto,Seth Lugo,1.50,13.72,+6580,+629,446,-16.82,1.5,111,-33.68,0.336,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,LAA,Mike Trout,Seth Lugo,13.19,50.11,+658,-100,341,-9.49,1.5,115,3.60,0.933,0,A+,A,A+,2+ TB,A+,priced_no_edge,full,qualified,Display only,full,data_blocked
2026-04-26,LAA@KC,LAA,Yoán Moncada,Seth Lugo,2.92,18.71,+3319,+434,532,-12.90,0.5,-159,,0.621,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,LAA@KC,LAA,Jorge Soler,Seth Lugo,3.58,21.80,+2693,+359,456,-14.41,0.5,-164,,0.493,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,LAA@KC,LAA,Nolan Schanuel,Seth Lugo,0.40,11.16,+24900,+796,980,-8.86,1.5,137,-31.03,0.435,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,LAA,Jo Adell,Seth Lugo,3.77,25.45,+2550,+293,435,-14.92,1.5,123,-19.40,0.559,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,LAA,Josh Lowe,Seth Lugo,0.40,6.00,+24900,+1567,800,-10.71,0.5,-161,,0.369,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,LAA@KC,LAA,Travis d'Arnaud,Seth Lugo,0.40,6.00,+24900,+1567,680,-12.42,0.5,-141,,0.327,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,LAA@KC,LAA,Adam Frazier,Seth Lugo,2.35,21.80,+4163,+359,1180,-5.47,0.5,-141,,0.534,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,LAA@KC,KC,Lane Thomas,Reid Detmers,0.40,6.00,+24900,+1567,650,-12.93,1.5,136,-36.37,0.376,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,KC,Bobby Witt Jr.,Reid Detmers,2.20,27.78,+4436,+260,342,-20.42,1.5,-118,-26.35,0.538,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,KC,Vinnie Pasquantino,Reid Detmers,0.40,13.15,+24900,+660,670,-12.59,1.5,137,-29.04,0.539,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,KC,Salvador Perez,Reid Detmers,1.26,14.73,+7817,+579,403,-18.62,1.5,116,-31.57,0.440,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,KC,Starling Marte,Reid Detmers,0.40,6.00,+24900,+1567,610,-13.68,1.5,146,-34.65,0.317,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,KC,Carter Jensen,Reid Detmers,5.45,30.24,+1733,+231,559,-9.72,1.5,143,-10.91,0.690,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,LAA@KC,KC,Nick Loftin,Reid Detmers,0.40,19.15,+24900,+422,790,-10.84,0.5,-133,,0.530,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,LAA@KC,KC,Isaac Collins,Reid Detmers,0.40,6.00,+24900,+1567,870,-9.91,0.5,-137,,0.363,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,LAA@KC,KC,Michael Massey,Reid Detmers,1.49,22.06,+6621,+353,900,-8.51,0.5,-132,,0.528,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,CHC@LAD,LAD,Shohei Ohtani,Shota Imanaga,3.56,22.34,+2707,+348,192,-30.68,1.5,-110,-30.04,0.416,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-26,CHC@LAD,LAD,Freddie Freeman,Shota Imanaga,3.17,30.84,+3057,+224,430,-15.70,1.5,121,-14.41,0.519,0,B,D,B,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-26,CHC@LAD,LAD,Teoscar Hernández,Shota Imanaga,0.40,12.97,+24900,+671,331,-22.80,1.5,118,-32.90,0.383,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-26,CHC@LAD,LAD,Andy Pages,Shota Imanaga,1.83,22.01,+5365,+354,440,-16.69,1.5,128,-21.85,0.406,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-26,CHC@LAD,LAD,Kyle Tucker,Shota Imanaga,0.40,11.64,+24900,+759,466,-17.27,1.5,149,-28.52,0.497,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,Display only,full,data_blocked
2026-04-26,CHC@LAD,LAD,Miguel Rojas,Shota Imanaga,3.48,32.10,+2771,+212,610,-10.60,0.5,-162,,0.950,0,B,D,B,,,priced_no_edge,partial,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,CHC@LAD,LAD,Dalton Rushing,Shota Imanaga,17.49,55.00,+472,-122,413,-2.00,,,,0.950,0,A+,A+,A+,,,priced_no_edge,partial,unpriced,Display only,partial,data_blocked
2026-04-26,CHC@LAD,LAD,Santiago Espinal,Shota Imanaga,0.40,9.81,+24900,+920,1020,-8.53,0.5,-142,,0.400,0,D,D,D,,,priced_no_edge,partial,line_mismatch_0.5,Display only,partial,data_blocked
2026-04-26,CHC@LAD,LAD,Hyeseong Kim,Shota Imanaga,0.40,24.08,+24900,+315,960,-9.03,,,,0.627,0,C,D,C,,,priced_no_edge,partial,unpriced,Display only,partial,data_blocked
<!-- batter-outlooks-csv:end -->
*/
