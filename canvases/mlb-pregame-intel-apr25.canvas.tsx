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
    gameKey: "ATH@TEX",
    venue: "MLB Park",
    away: "ATH",
    home: "TEX",
    timeEt: "7:05 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 109,
    homeAmerican: -126,
    impliedAwayPct: 46.18,
    impliedHomePct: 53.82,
    modelAwayPct: 53.39,
    modelHomePct: 46.61,
    edgeAwayPct: 7.20,
    edgeHomePct: -7.20,
    prediction: "ATH",
    decisionTier: "A",
    edgeOnPickPct: 7.20,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Jeffrey Springs vs MacKenzie Gore. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Shea Langeliers", "DH"],
      ["2", "Nick Kurtz", "1B"],
      ["3", "Colby Thomas", "RF"],
      ["4", "Tyler Soderstrom", "LF"],
      ["5", "Jacob Wilson", "SS"],
      ["6", "Max Muncy", "3B"],
      ["7", "Darell Hernaiz", "2B"],
      ["8", "Austin Wynns", "C"],
      ["9", "Zack Gelof", "CF"],
    ],
    homeLineup: [
      ["1", "Brandon Nimmo", "RF"],
      ["2", "Andrew McCutchen", "DH"],
      ["3", "Corey Seager", "SS"],
      ["4", "Jake Burger", "1B"],
      ["5", "Josh Jung", "3B"],
      ["6", "Ezequiel Duran", "2B"],
      ["7", "Danny Jansen", "C"],
      ["8", "Evan Carter", "CF"],
      ["9", "Sam Haggerty", "LF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-25 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Shea Langeliers", team: "ATH", hrPct: 11.1, tb2Pct: 43.5, tier: "HR A / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 15.0, tb2Pct: 54.5, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Colby Thomas", team: "ATH", hrPct: 4.5, tb2Pct: 20.8, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 7.4, tb2Pct: 34.1, tier: "HR C / TB B", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 2.1, tb2Pct: 20.6, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Max Muncy", team: "ATH", hrPct: 4.8, tb2Pct: 20.9, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Darell Hernaiz", team: "ATH", hrPct: 5.8, tb2Pct: 26.3, tier: "HR C / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Austin Wynns", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 6.4, tb2Pct: 29.1, tier: "HR C / TB B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 4.7, tb2Pct: 30.2, tier: "HR D / TB B", note: "LHB vs LHP; above-average damage; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Andrew McCutchen", team: "TEX", hrPct: 0.4, tb2Pct: 7.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Corey Seager", team: "TEX", hrPct: 4.7, tb2Pct: 26.4, tier: "HR D / TB C", note: "LHB vs LHP; elite power indicators; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jake Burger", team: "TEX", hrPct: 2.8, tb2Pct: 19.5, tier: "HR D / TB D", note: "RHB vs LHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Josh Jung", team: "TEX", hrPct: 4.8, tb2Pct: 33.6, tier: "HR D / TB B", note: "RHB vs LHP; hard-contact profile; vs tough pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Ezequiel Duran", team: "TEX", hrPct: 0.4, tb2Pct: 19.5, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Danny Jansen", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Evan Carter", team: "TEX", hrPct: 1.8, tb2Pct: 17.9, tier: "HR D / TB D", note: "LHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Sam Haggerty", team: "TEX", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned; HR market partial via rotowire_only, HR tier downgraded" },
    ],
  },
  {
    gameKey: "LAA@KC",
    venue: "MLB Park",
    away: "LAA",
    home: "KC",
    timeEt: "7:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 125,
    homeAmerican: -142,
    impliedAwayPct: 43.10,
    impliedHomePct: 56.90,
    modelAwayPct: 51.07,
    modelHomePct: 48.93,
    edgeAwayPct: 7.98,
    edgeHomePct: -7.98,
    prediction: "LAA",
    decisionTier: "A+",
    edgeOnPickPct: 7.98,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Walbert Urena vs Cole Ragans. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Zach Neto", "SS"],
      ["2", "Mike Trout", "CF"],
      ["3", "Jo Adell", "RF"],
      ["4", "Jorge Soler", "DH"],
      ["5", "Oswald Peraza", "3B"],
      ["6", "Vaughn Grissom", "2B"],
      ["7", "Nolan Schanuel", "1B"],
      ["8", "Logan O'Hoppe", "C"],
      ["9", "Bryce Teodosio", "LF"],
    ],
    homeLineup: [
      ["1", "Carter Jensen", "C"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Vinnie Pasquantino", "1B"],
      ["4", "Salvador Perez", "DH"],
      ["5", "Jac Caglianone", "RF"],
      ["6", "Isaac Collins", "LF"],
      ["7", "Michael Massey", "2B"],
      ["8", "Nick Loftin", "3B"],
      ["9", "Kyle Isbel", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-25 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Zach Neto", team: "LAA", hrPct: 7.9, tb2Pct: 28.7, tier: "HR B / TB B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Mike Trout", team: "LAA", hrPct: 19.5, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Jo Adell", team: "LAA", hrPct: 7.9, tb2Pct: 32.4, tier: "HR B / TB B", note: "RHB vs LHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 8.9, tb2Pct: 28.5, tier: "HR B / TB B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 12.6, tb2Pct: 45.5, tier: "HR A / TB A+", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Vaughn Grissom", team: "LAA", hrPct: 5.6, tb2Pct: 28.7, tier: "HR D / TB B", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 4.5, tb2Pct: 22.8, tier: "HR D / TB C", note: "LHB vs LHP; limited power profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Logan O'Hoppe", team: "LAA", hrPct: 5.1, tb2Pct: 19.6, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Bryce Teodosio", team: "LAA", hrPct: 2.6, tb2Pct: 11.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Carter Jensen", team: "KC", hrPct: 4.8, tb2Pct: 28.9, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 0.4, tb2Pct: 22.1, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.4, tb2Pct: 9.8, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Salvador Perez", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 2.3, tb2Pct: 22.9, tier: "HR D / TB C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.4, tb2Pct: 18.8, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Nick Loftin", team: "KC", hrPct: 0.4, tb2Pct: 9.6, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.4, tb2Pct: 9.4, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "NYY@HOU",
    venue: "MLB Park",
    away: "NYY",
    home: "HOU",
    timeEt: "7:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -152,
    homeAmerican: 130,
    impliedAwayPct: 58.11,
    impliedHomePct: 41.89,
    modelAwayPct: 53.87,
    modelHomePct: 46.13,
    edgeAwayPct: -4.24,
    edgeHomePct: 4.24,
    prediction: "NYY",
    decisionTier: "D",
    edgeOnPickPct: -4.24,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Ryan Weathers vs Mike Burrows. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Trent Grisham", "CF"],
      ["2", "Ben Rice", "1B"],
      ["3", "Aaron Judge", "RF"],
      ["4", "Cody Bellinger", "LF"],
      ["5", "Jazz Chisholm Jr.", "2B"],
      ["6", "Amed Rosario", "DH"],
      ["7", "Austin Wells", "C"],
      ["8", "Ryan McMahon", "3B"],
      ["9", "José Caballero", "SS"],
    ],
    homeLineup: [
      ["1", "Carlos Correa", "SS"],
      ["2", "Yordan Alvarez", "LF"],
      ["3", "Isaac Paredes", "3B"],
      ["4", "Jose Altuve", "2B"],
      ["5", "Christian Walker", "1B"],
      ["6", "Yainer Diaz", "DH"],
      ["7", "Cam Smith", "RF"],
      ["8", "Christian Vázquez", "C"],
      ["9", "Brice Matthews", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-25 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Trent Grisham", team: "NYY", hrPct: 5.9, tb2Pct: 26.9, tier: "HR C / TB C", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Ben Rice", team: "NYY", hrPct: 16.9, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 14.6, tb2Pct: 51.3, tier: "HR A+ / TB A+", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 4.7, tb2Pct: 30.1, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 1.4, tb2Pct: 16.4, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Amed Rosario", team: "NYY", hrPct: 9.6, tb2Pct: 39.8, tier: "HR B / TB A", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Austin Wells", team: "NYY", hrPct: 2.0, tb2Pct: 15.2, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ryan McMahon", team: "NYY", hrPct: 6.1, tb2Pct: 25.1, tier: "HR C / TB C", note: "LHB vs RHP; above-average damage; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "José Caballero", team: "NYY", hrPct: 1.1, tb2Pct: 19.5, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Carlos Correa", team: "HOU", hrPct: 2.3, tb2Pct: 23.9, tier: "HR D / TB C", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 18.5, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+)" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.6, tb2Pct: 12.1, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Jose Altuve", team: "HOU", hrPct: 2.1, tb2Pct: 20.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Christian Walker", team: "HOU", hrPct: 6.0, tb2Pct: 28.5, tier: "HR C / TB B", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 1.8, tb2Pct: 16.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Cam Smith", team: "HOU", hrPct: 4.2, tb2Pct: 22.7, tier: "HR D / TB C", note: "RHB vs LHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Christian Vázquez", team: "HOU", hrPct: 8.9, tb2Pct: 46.0, tier: "HR B / TB A+", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brice Matthews", team: "HOU", hrPct: 0.5, tb2Pct: 9.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "PIT@MIL",
    venue: "MLB Park",
    away: "PIT",
    home: "MIL",
    timeEt: "7:10 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 120,
    homeAmerican: -139,
    impliedAwayPct: 43.87,
    impliedHomePct: 56.13,
    modelAwayPct: 43.51,
    modelHomePct: 56.49,
    edgeAwayPct: -0.36,
    edgeHomePct: 0.36,
    prediction: "MIL",
    decisionTier: "D",
    edgeOnPickPct: 0.36,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Mitch Keller vs Jacob Misiorowski. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Oneil Cruz", "CF"],
      ["2", "Brandon Lowe", "2B"],
      ["3", "Bryan Reynolds", "RF"],
      ["4", "Ryan O'Hearn", "DH"],
      ["5", "Nick Gonzales", "3B"],
      ["6", "Spencer Horwitz", "1B"],
      ["7", "Jake Mangum", "LF"],
      ["8", "Konnor Griffin", "SS"],
      ["9", "Henry Davis", "C"],
    ],
    homeLineup: [
      ["1", "Brice Turang", "2B"],
      ["2", "William Contreras", "C"],
      ["3", "Jake Bauers", "1B"],
      ["4", "Tyler Black", "DH"],
      ["5", "Garrett Mitchell", "CF"],
      ["6", "Sal Frelick", "RF"],
      ["7", "Greg Jones", "LF"],
      ["8", "David Hamilton", "3B"],
      ["9", "Joey Ortiz", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-25 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 10.1, tb2Pct: 39.9, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 4.5, tb2Pct: 25.8, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Bryan Reynolds", team: "PIT", hrPct: 0.4, tb2Pct: 14.1, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ryan O'Hearn", team: "PIT", hrPct: 3.0, tb2Pct: 28.2, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.4, tb2Pct: 7.5, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Spencer Horwitz", team: "PIT", hrPct: 0.4, tb2Pct: 9.9, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Jake Mangum", team: "PIT", hrPct: 0.4, tb2Pct: 10.9, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.4, tb2Pct: 7.4, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Henry Davis", team: "PIT", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Brice Turang", team: "MIL", hrPct: 5.4, tb2Pct: 31.9, tier: "HR D / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "William Contreras", team: "MIL", hrPct: 0.8, tb2Pct: 19.9, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 5.5, tb2Pct: 28.8, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Tyler Black", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Garrett Mitchell", team: "MIL", hrPct: 1.4, tb2Pct: 16.4, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Sal Frelick", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Greg Jones", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "David Hamilton", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "DET@CIN",
    venue: "MLB Park",
    away: "DET",
    home: "CIN",
    timeEt: "7:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: -110,
    homeAmerican: -106,
    impliedAwayPct: 50.45,
    impliedHomePct: 49.55,
    modelAwayPct: 51.58,
    modelHomePct: 48.42,
    edgeAwayPct: 1.13,
    edgeHomePct: -1.13,
    prediction: "DET",
    decisionTier: "C",
    edgeOnPickPct: 1.13,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Jack Flaherty vs Brady Singer. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Kevin McGonigle", "SS"],
      ["2", "Matt Vierling", "CF"],
      ["3", "Colt Keith", "3B"],
      ["4", "Riley Greene", "LF"],
      ["5", "Dillon Dingler", "C"],
      ["6", "Kerry Carpenter", "DH"],
      ["7", "Spencer Torkelson", "1B"],
      ["8", "Wenceel Pérez", "RF"],
      ["9", "Javier Báez", "2B"],
    ],
    homeLineup: [
      ["1", "TJ Friedl", "CF"],
      ["2", "Matt McLain", "2B"],
      ["3", "Elly De La Cruz", "SS"],
      ["4", "Sal Stewart", "1B"],
      ["5", "Nathaniel Lowe", "DH"],
      ["6", "Spencer Steer", "LF"],
      ["7", "Tyler Stephenson", "C"],
      ["8", "Will Benson", "RF"],
      ["9", "Ke'Bryan Hayes", "3B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-25 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Kevin McGonigle", team: "DET", hrPct: 7.6, tb2Pct: 42.1, tier: "HR C / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Matt Vierling", team: "DET", hrPct: 3.7, tb2Pct: 25.5, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Colt Keith", team: "DET", hrPct: 6.1, tb2Pct: 33.9, tier: "HR C / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Riley Greene", team: "DET", hrPct: 11.0, tb2Pct: 47.4, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Dillon Dingler", team: "DET", hrPct: 12.6, tb2Pct: 47.5, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Kerry Carpenter", team: "DET", hrPct: 13.1, tb2Pct: 42.0, tier: "HR A / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 8.0, tb2Pct: 33.7, tier: "HR B / TB B", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Javier Báez", team: "DET", hrPct: 2.4, tb2Pct: 21.2, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Matt McLain", team: "CIN", hrPct: 2.3, tb2Pct: 19.4, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 11.9, tb2Pct: 45.2, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 11.9, tb2Pct: 43.9, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Nathaniel Lowe", team: "CIN", hrPct: 8.0, tb2Pct: 36.7, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 7.7, tb2Pct: 33.4, tier: "HR C / TB B", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Tyler Stephenson", team: "CIN", hrPct: 3.6, tb2Pct: 16.3, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Will Benson", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "CHC@LAD",
    venue: "MLB Park",
    away: "CHC",
    home: "LAD",
    timeEt: "7:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 108,
    homeAmerican: -126,
    impliedAwayPct: 46.30,
    impliedHomePct: 53.70,
    modelAwayPct: 53.48,
    modelHomePct: 46.52,
    edgeAwayPct: 7.17,
    edgeHomePct: -7.17,
    prediction: "CHC",
    decisionTier: "A",
    edgeOnPickPct: 7.17,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Colin Rea vs Roki Sasaki. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Nico Hoerner", "2B"],
      ["2", "Michael Busch", "1B"],
      ["3", "Alex Bregman", "3B"],
      ["4", "Ian Happ", "LF"],
      ["5", "Seiya Suzuki", "RF"],
      ["6", "Moisés Ballesteros", "DH"],
      ["7", "Dansby Swanson", "SS"],
      ["8", "Pete Crow-Armstrong", "CF"],
      ["9", "Miguel Amaya", "C"],
    ],
    homeLineup: [
      ["1", "Shohei Ohtani", "DH"],
      ["2", "Freddie Freeman", "1B"],
      ["3", "Max Muncy", "3B"],
      ["4", "Kyle Tucker", "RF"],
      ["5", "Teoscar Hernández", "LF"],
      ["6", "Dalton Rushing", "C"],
      ["7", "Andy Pages", "CF"],
      ["8", "Hyeseong Kim", "SS"],
      ["9", "Alex Freeland", "2B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-25 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 4.4, tb2Pct: 25.5, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Michael Busch", team: "CHC", hrPct: 3.1, tb2Pct: 19.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 5.8, tb2Pct: 30.6, tier: "HR D / TB B", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ian Happ", team: "CHC", hrPct: 10.3, tb2Pct: 37.0, tier: "HR A / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 8.2, tb2Pct: 35.7, tier: "HR B / TB A", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Moisés Ballesteros", team: "CHC", hrPct: 14.2, tb2Pct: 52.1, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 11.7, tb2Pct: 42.7, tier: "HR A / TB A+", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 3.8, tb2Pct: 23.1, tier: "HR D / TB C", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Miguel Amaya", team: "CHC", hrPct: 2.0, tb2Pct: 11.3, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 6.8, tb2Pct: 30.6, tier: "HR C / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 5.8, tb2Pct: 37.0, tier: "HR D / TB A", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Max Muncy", team: "LAD", hrPct: 10.5, tb2Pct: 43.0, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 0.4, tb2Pct: 14.1, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 2.6, tb2Pct: 19.5, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 22.3, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Andy Pages", team: "LAD", hrPct: 2.9, tb2Pct: 22.6, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Hyeseong Kim", team: "LAD", hrPct: 2.7, tb2Pct: 28.5, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Alex Freeland", team: "LAD", hrPct: 0.4, tb2Pct: 6.8, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
  },
  {
    gameKey: "PHI@ATL",
    venue: "MLB Park",
    away: "PHI",
    home: "ATL",
    timeEt: "7:15 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 115,
    homeAmerican: -133,
    impliedAwayPct: 44.90,
    impliedHomePct: 55.10,
    modelAwayPct: 39.92,
    modelHomePct: 60.08,
    edgeAwayPct: -4.97,
    edgeHomePct: 4.97,
    prediction: "ATL",
    decisionTier: "B",
    edgeOnPickPct: 4.97,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Zack Wheeler vs Bryce Elder. Run compute to refresh lineups, weather, and model outputs before staking.",
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
      ["9", "Rafael Marchán", "C"],
    ],
    homeLineup: [
      ["1", "Ronald Acuña Jr.", "RF"],
      ["2", "Drake Baldwin", "C"],
      ["3", "Matt Olson", "1B"],
      ["4", "Ozzie Albies", "2B"],
      ["5", "Michael Harris II", "DH"],
      ["6", "Austin Riley", "3B"],
      ["7", "Mauricio Dubón", "SS"],
      ["8", "Mike Yastrzemski", "LF"],
      ["9", "Eli White", "CF"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-25 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Trea Turner", team: "PHI", hrPct: 0.4, tb2Pct: 10.3, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher" },
      { batter: "Kyle Schwarber", team: "PHI", hrPct: 7.8, tb2Pct: 30.8, tier: "HR B / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Bryce Harper", team: "PHI", hrPct: 5.9, tb2Pct: 32.9, tier: "HR C / TB B", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Adolis García", team: "PHI", hrPct: 0.4, tb2Pct: 16.4, tier: "HR D / TB D", note: "RHB vs RHP; hard-contact profile; vs tough pitcher" },
      { batter: "Brandon Marsh", team: "PHI", hrPct: 3.1, tb2Pct: 26.5, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Bryson Stott", team: "PHI", hrPct: 0.4, tb2Pct: 8.5, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Alec Bohm", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Justin Crawford", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Rafael Marchán", team: "PHI", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Ronald Acuña Jr.", team: "ATL", hrPct: 3.6, tb2Pct: 26.4, tier: "HR D / TB C", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Drake Baldwin", team: "ATL", hrPct: 7.8, tb2Pct: 35.7, tier: "HR C / TB A", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Matt Olson", team: "ATL", hrPct: 10.0, tb2Pct: 41.4, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Ozzie Albies", team: "ATL", hrPct: 2.4, tb2Pct: 22.2, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Michael Harris II", team: "ATL", hrPct: 15.6, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Austin Riley", team: "ATL", hrPct: 3.4, tb2Pct: 22.0, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Mauricio Dubón", team: "ATL", hrPct: 0.4, tb2Pct: 11.1, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Mike Yastrzemski", team: "ATL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Eli White", team: "ATL", hrPct: 2.8, tb2Pct: 18.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
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

export default function Apr25Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 25, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-25
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
2026-04-25,ATH,TEX,7:05 PM,Jeffrey Springs,MacKenzie Gore,109,-126,8.0,-110,-110,86F / 13 mph wind / 3% precip / Retractable,86.5,12.6,3,0.433,0.465,0.543,0.466,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,46.18,53.82,75.00,25.00,53.39,46.61,0.25,53.39,46.61,7.20,-7.20,ATH,A,7.20,High,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Jeffrey Springs vs MacKenzie Gore. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-25,LAA,KC,7:10 PM,Walbert Urena,Cole Ragans,125,-142,8.5,-120,100,77F / 6 mph wind / 1% precip / Open,77.3,6.0,1,0.377,0.297,0.537,0.470,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,43.10,56.90,75.00,25.00,51.07,48.93,0.25,51.07,48.93,7.98,-7.98,LAA,A+,7.98,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Walbert Urena vs Cole Ragans. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-25,NYY,HOU,7:10 PM,Ryan Weathers,Mike Burrows,-152,130,9.0,-125,105,82F / 8 mph wind / 2% precip / Retractable,82.5,8.1,2,0.432,0.372,0.660,0.531,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,58.11,41.89,41.15,58.85,53.87,46.13,0.25,53.87,46.13,-4.24,4.24,NYY,D,-4.24,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Ryan Weathers vs Mike Burrows. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-25,PIT,MIL,7:10 PM,Mitch Keller,Jacob Misiorowski,120,-139,8.0,-110,-110,46F / 10 mph wind / 0% precip / Retractable,46.4,10.0,0,0.431,0.421,0.514,0.359,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,43.87,56.13,42.43,57.57,43.51,56.49,0.25,43.51,56.49,-0.36,0.36,MIL,D,0.36,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Mitch Keller vs Jacob Misiorowski. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-25,DET,CIN,7:15 PM,Jack Flaherty,Brady Singer,-110,-106,9.5,-105,-115,74F / 9 mph wind / 0% precip / Open,73.8,9.4,0,0.342,0.349,0.596,0.523,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,50.45,49.55,54.97,45.03,51.58,48.42,0.25,51.58,48.42,1.13,-1.13,DET,C,1.13,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Jack Flaherty vs Brady Singer. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-25,CHC,LAD,7:15 PM,Colin Rea,Roki Sasaki,108,-126,9.5,-105,-115,63F / 12 mph wind / 3% precip / Open,62.8,11.9,3,0.430,0.375,0.611,0.557,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,46.30,53.70,75.00,25.00,53.48,46.52,0.25,53.48,46.52,7.17,-7.17,CHC,A,7.17,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Colin Rea vs Roki Sasaki. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-25,PHI,ATL,7:15 PM,Zack Wheeler,Bryce Elder,115,-133,8.5,-120,100,70F / 3 mph wind / 19% precip / Open,69.5,3.2,19,0.448,0.440,0.459,0.567,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,44.90,55.10,25.00,75.00,39.92,60.08,0.25,39.92,60.08,-4.97,4.97,ATL,B,4.97,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Zack Wheeler vs Bryce Elder. Run compute to refresh lineups, weather, and model outputs before staking.",scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,hr_market_integrity,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-25,ATH@TEX,ATH,Shea Langeliers,MacKenzie Gore,11.13,43.54,+799,+130,382,-9.62,1.5,114,-3.19,0.674,0,A+,A,A+,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-25,ATH@TEX,ATH,Nick Kurtz,MacKenzie Gore,15.02,54.49,+566,-120,376,-5.99,0.5,-154,,0.857,0,A+,A+,A+,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,ATH,Colby Thomas,MacKenzie Gore,4.51,20.82,+2115,+380,588,-10.02,0.5,-141,,,0,D,D,D,,,priced_no_edge,partial,line_mismatch_0.5,"Low — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,ATH,Tyler Soderstrom,MacKenzie Gore,7.37,34.15,+1256,+193,588,-7.16,1.5,155,-5.07,0.652,0,B,C,B,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-25,ATH@TEX,ATH,Jacob Wilson,MacKenzie Gore,2.08,20.62,+4696,+385,1200,-5.61,1.5,128,-23.24,0.569,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-25,ATH@TEX,ATH,Max Muncy,MacKenzie Gore,4.84,20.92,+1968,+378,438,-13.75,1.5,148,-19.40,0.277,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-25,ATH@TEX,ATH,Darell Hernaiz,MacKenzie Gore,5.82,26.29,+1617,+280,1230,-1.70,0.5,-156,,0.675,0,C,C,C,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,ATH,Austin Wynns,MacKenzie Gore,0.40,6.00,+24900,+1567,840,-10.24,0.5,-117,,0.196,0,D,D,D,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,ATH,Zack Gelof,MacKenzie Gore,6.42,29.08,+1457,+244,980,-2.84,0.5,102,,0.543,0,B,C,B,,,priced_no_edge,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Brandon Nimmo,Jeffrey Springs,4.68,30.23,+2037,+231,NA,,1.5,123,-14.62,0.630,0,B,D,B,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Andrew McCutchen,Jeffrey Springs,0.40,7.27,+24900,+1275,NA,,0.5,-142,,0.210,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Corey Seager,Jeffrey Springs,4.73,26.42,+2012,+278,NA,,1.5,108,-21.65,0.543,0,C,D,C,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Jake Burger,Jeffrey Springs,2.78,19.48,+3491,+413,NA,,1.5,126,-24.77,0.490,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Josh Jung,Jeffrey Springs,4.77,33.56,+1996,+198,NA,,1.5,141,-7.94,0.889,0,B,D,B,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Ezequiel Duran,Jeffrey Springs,0.40,19.46,+24900,+414,NA,,0.5,-167,,0.467,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Danny Jansen,Jeffrey Springs,0.40,6.00,+24900,+1567,NA,,0.5,-118,,0.292,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Evan Carter,Jeffrey Springs,1.78,17.85,+5525,+460,NA,,0.5,-122,,0.491,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,ATH@TEX,TEX,Sam Haggerty,Jeffrey Springs,0.40,6.00,+24900,+1567,NA,,0.5,119,,0.180,0,D,D,D,,,unpriced,partial,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-25,LAA@KC,LAA,Zach Neto,Cole Ragans,7.91,28.72,+1164,+248,539,-7.74,1.5,124,-15.93,0.408,0,B,B,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,LAA@KC,LAA,Mike Trout,Cole Ragans,19.46,55.00,+414,-122,449,1.25,1.5,130,11.52,0.950,0,A+,A+,A+,2+ TB,A+,priced_below_gate,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,LAA@KC,LAA,Jo Adell,Cole Ragans,7.85,32.36,+1174,+209,395,-12.35,1.5,120,-13.10,0.492,0,B,B,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,LAA@KC,LAA,Jorge Soler,Cole Ragans,8.85,28.54,+1029,+250,461,-8.97,0.5,-140,,0.421,0,B,B,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,LAA,Oswald Peraza,Cole Ragans,12.57,45.51,+696,+120,690,-0.09,0.5,-138,,0.887,0,A+,A,A+,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,LAA,Vaughn Grissom,Cole Ragans,5.60,28.69,+1685,+249,1000,-3.49,0.5,-173,,0.479,0,B,D,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,LAA,Nolan Schanuel,Cole Ragans,4.54,22.79,+2103,+339,1180,-3.27,0.5,-164,,0.468,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,LAA,Logan O'Hoppe,Cole Ragans,5.05,19.55,+1880,+411,650,-8.28,0.5,-141,,0.417,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,LAA,Bryce Teodosio,Cole Ragans,2.61,11.73,+3735,+753,1580,-3.34,0.5,109,,0.307,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,KC,Carter Jensen,Walbert Urena,4.82,28.89,+1976,+246,421,-14.38,1.5,124,-15.76,0.690,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,LAA@KC,KC,Bobby Witt Jr.,Walbert Urena,0.40,22.09,+24900,+353,489,-16.58,1.5,-112,-30.74,0.472,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,LAA@KC,KC,Vinnie Pasquantino,Walbert Urena,0.40,9.77,+24900,+923,592,-14.05,1.5,126,-34.47,0.519,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,LAA@KC,KC,Salvador Perez,Walbert Urena,0.40,6.00,+24900,+1567,527,-15.55,1.5,117,-40.08,0.304,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,LAA@KC,KC,Jac Caglianone,Walbert Urena,2.29,22.91,+4261,+337,566,-12.72,1.5,136,-19.46,0.535,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,LAA@KC,KC,Isaac Collins,Walbert Urena,0.40,6.00,+24900,+1567,1140,-7.66,0.5,-170,,0.307,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,KC,Michael Massey,Walbert Urena,0.40,18.83,+24900,+431,760,-11.23,0.5,-175,,0.538,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,KC,Nick Loftin,Walbert Urena,0.40,9.60,+24900,+941,1020,-8.53,0.5,-172,,0.448,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,LAA@KC,KC,Kyle Isbel,Walbert Urena,0.40,9.45,+24900,+958,1140,-7.66,0.5,-162,,0.419,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,NYY@HOU,NYY,Trent Grisham,Mike Burrows,5.94,26.91,+1584,+272,431,-12.89,1.5,139,-14.93,0.550,0,C,C,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,NYY,Ben Rice,Mike Burrows,16.94,55.00,+490,-122,286,-8.97,1.5,102,5.50,0.910,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,NYY,Aaron Judge,Mike Burrows,14.57,51.26,+587,-105,221,-16.59,1.5,-105,0.04,0.898,0,A+,A+,A+,,,priced_no_edge,full,priced_below_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,NYY,Cody Bellinger,Mike Burrows,4.73,30.07,+2015,+233,468,-12.88,1.5,107,-18.24,0.631,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,NYY,Jazz Chisholm Jr.,Mike Burrows,1.44,16.45,+6844,+508,458,-16.48,0.5,-179,,0.586,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,NYY@HOU,NYY,Amed Rosario,Mike Burrows,9.58,39.83,+943,+151,670,-3.40,0.5,-188,,0.587,0,A,B,A,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,NYY@HOU,NYY,Austin Wells,Mike Burrows,1.96,15.16,+5005,+560,484,-15.16,0.5,-149,,0.414,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,NYY@HOU,NYY,Ryan McMahon,Mike Burrows,6.08,25.08,+1546,+299,660,-7.08,0.5,-123,,0.661,0,C,C,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,NYY@HOU,NYY,José Caballero,Mike Burrows,1.07,19.51,+9244,+413,1080,-7.40,0.5,-129,,0.698,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,NYY@HOU,HOU,Carlos Correa,Ryan Weathers,2.30,23.94,+4251,+318,576,-12.49,1.5,121,-21.31,0.465,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,HOU,Yordan Alvarez,Ryan Weathers,18.54,55.00,+439,-122,302,-6.33,1.5,-107,3.31,0.950,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,HOU,Isaac Paredes,Ryan Weathers,0.57,12.14,+17303,+724,468,-17.03,1.5,140,-29.53,0.454,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,HOU,Jose Altuve,Ryan Weathers,2.13,19.97,+4592,+401,610,-11.95,1.5,135,-22.58,0.424,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,HOU,Christian Walker,Ryan Weathers,6.01,28.54,+1565,+250,437,-12.62,1.5,141,-12.95,0.504,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,HOU,Yainer Diaz,Ryan Weathers,1.79,15.98,+5478,+526,750,-9.97,1.5,148,-24.35,0.509,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,NYY@HOU,HOU,Cam Smith,Ryan Weathers,4.25,22.69,+2253,+341,720,-7.95,0.5,-152,,0.336,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,NYY@HOU,HOU,Christian Vázquez,Ryan Weathers,8.94,46.05,+1018,+117,880,-1.26,0.5,-136,,0.820,0,A+,B,A+,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,NYY@HOU,HOU,Brice Matthews,Ryan Weathers,0.54,9.35,+18470,+970,610,-13.55,0.5,104,,0.320,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,PIT,Oneil Cruz,Jacob Misiorowski,10.15,39.87,+885,+151,357,-11.73,0.5,-142,,0.646,0,A,B,A,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,PIT,Brandon Lowe,Jacob Misiorowski,4.51,25.85,+2117,+287,457,-13.44,0.5,-136,,0.739,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,PIT,Bryan Reynolds,Jacob Misiorowski,0.40,14.08,+24900,+610,510,-15.99,0.5,-141,,0.425,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,PIT,Ryan O'Hearn,Jacob Misiorowski,3.01,28.19,+3227,+255,770,-8.49,0.5,-148,,0.575,0,B,D,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,PIT,Nick Gonzales,Jacob Misiorowski,0.40,7.54,+24900,+1227,1060,-8.22,1.5,150,-32.46,0.389,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PIT@MIL,PIT,Spencer Horwitz,Jacob Misiorowski,0.40,9.87,+24900,+913,1040,-8.37,0.5,-129,,0.644,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,PIT,Jake Mangum,Jacob Misiorowski,0.40,10.88,+24900,+819,1160,-7.54,0.5,-189,,0.566,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,PIT,Konnor Griffin,Jacob Misiorowski,0.40,7.35,+24900,+1260,880,-9.80,0.5,-130,,0.451,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,PIT,Henry Davis,Jacob Misiorowski,0.40,6.00,+24900,+1567,930,-9.31,0.5,100,,0.187,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,MIL,Brice Turang,Mitch Keller,5.36,31.88,+1766,+214,630,-8.34,1.5,132,-11.22,0.641,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PIT@MIL,MIL,William Contreras,Mitch Keller,0.83,19.89,+11969,+403,600,-13.46,1.5,130,-23.59,0.472,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PIT@MIL,MIL,Jake Bauers,Mitch Keller,5.51,28.84,+1716,+247,447,-12.77,1.5,130,-14.63,0.561,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PIT@MIL,MIL,Tyler Black,Mitch Keller,0.40,6.00,+24900,+1567,810,-10.59,0.5,-135,,0.180,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,MIL,Garrett Mitchell,Mitch Keller,1.36,16.44,+7266,+508,544,-14.17,0.5,-136,,0.411,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,MIL,Sal Frelick,Mitch Keller,0.40,6.00,+24900,+1567,1200,-7.29,0.5,-170,,0.245,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,MIL,Greg Jones,Mitch Keller,0.40,6.00,+24900,+1567,571,-14.50,0.5,-125,,0.208,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,MIL,David Hamilton,Mitch Keller,0.40,6.00,+24900,+1567,1100,-7.93,0.5,-124,,0.328,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PIT@MIL,MIL,Joey Ortiz,Mitch Keller,0.40,6.00,+24900,+1567,1380,-6.36,0.5,-123,,0.186,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,DET@CIN,DET,Kevin McGonigle,Brady Singer,7.64,42.10,+1209,+138,367,-13.77,1.5,-103,-8.64,0.703,0,A+,C,A+,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,DET,Matt Vierling,Brady Singer,3.74,25.54,+2575,+292,610,-10.35,1.5,130,-17.94,0.470,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,DET,Colt Keith,Brady Singer,6.07,33.87,+1546,+195,513,-10.24,1.5,146,-6.78,0.401,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,DET,Riley Greene,Brady Singer,11.04,47.44,+806,+111,299,-14.02,1.5,106,-1.10,0.916,0,A+,A,A+,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,DET,Dillon Dingler,Brady Singer,12.61,47.51,+693,+110,377,-8.35,1.5,106,-1.03,0.631,0,A+,A,A+,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,DET,Kerry Carpenter,Brady Singer,13.14,41.97,+661,+138,293,-12.30,1.5,128,-1.89,0.950,0,A,A,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,DET,Spencer Torkelson,Brady Singer,7.99,33.72,+1151,+197,421,-11.20,0.5,-156,,0.644,0,B,B,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,DET@CIN,DET,Wenceel Pérez,Brady Singer,0.40,6.00,+24900,+1567,660,-12.76,0.5,-156,,0.197,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,DET@CIN,DET,Javier Báez,Brady Singer,2.45,21.19,+3988,+372,820,-8.42,0.5,-172,,0.448,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,DET@CIN,CIN,TJ Friedl,Jack Flaherty,0.40,6.00,+24900,+1567,800,-10.71,1.5,140,-35.67,0.275,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,CIN,Matt McLain,Jack Flaherty,2.26,19.40,+4323,+415,650,-11.07,0.5,-169,,0.541,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,DET@CIN,CIN,Elly De La Cruz,Jack Flaherty,11.92,45.24,+739,+121,349,-10.36,1.5,121,-0.01,0.787,0,A+,A,A+,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,CIN,Sal Stewart,Jack Flaherty,11.94,43.93,+737,+128,315,-12.15,1.5,104,-5.09,0.640,0,A+,A,A+,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,CIN,Nathaniel Lowe,Jack Flaherty,7.96,36.69,+1156,+173,498,-8.76,1.5,149,-3.48,0.831,0,A,B,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,DET@CIN,CIN,Spencer Steer,Jack Flaherty,7.68,33.39,+1203,+200,529,-8.22,0.5,-156,,0.741,0,B,C,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,DET@CIN,CIN,Tyler Stephenson,Jack Flaherty,3.61,16.35,+2668,+512,512,-12.73,0.5,-145,,0.276,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,DET@CIN,CIN,Will Benson,Jack Flaherty,0.40,6.00,+24900,+1567,502,-16.21,0.5,-134,,0.377,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,DET@CIN,CIN,Ke'Bryan Hayes,Jack Flaherty,0.40,6.00,+24900,+1567,1000,-8.69,0.5,-140,,0.242,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,CHC,Nico Hoerner,Roki Sasaki,4.38,25.51,+2185,+292,940,-5.24,1.5,116,-20.79,0.565,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,CHC,Michael Busch,Roki Sasaki,3.14,19.64,+3080,+409,456,-14.84,1.5,134,-23.10,0.568,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,CHC,Alex Bregman,Roki Sasaki,5.80,30.59,+1625,+227,481,-11.41,1.5,120,-14.86,0.572,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,CHC,Ian Happ,Roki Sasaki,10.28,37.04,+873,+170,451,-7.87,0.5,-156,,0.617,0,A,A,A,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,CHC,Seiya Suzuki,Roki Sasaki,8.18,35.69,+1122,+180,405,-11.62,1.5,128,-8.17,0.662,0,A,B,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,CHC,Moisés Ballesteros,Roki Sasaki,14.20,52.14,+604,-109,600,-0.09,0.5,-142,,0.950,0,A+,A+,A+,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,CHC,Dansby Swanson,Roki Sasaki,11.75,42.74,+751,+134,555,-3.52,0.5,-143,,0.845,0,A+,A,A+,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,CHC,Pete Crow-Armstrong,Roki Sasaki,3.79,23.12,+2539,+333,482,-13.39,0.5,-154,,0.450,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,CHC,Miguel Amaya,Roki Sasaki,2.04,11.27,+4808,+787,800,-9.07,0.5,-140,,0.268,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,LAD,Shohei Ohtani,Colin Rea,6.75,30.57,+1381,+227,175,-29.61,1.5,-132,-26.33,0.501,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,LAD,Freddie Freeman,Colin Rea,5.78,36.98,+1631,+170,364,-15.78,1.5,102,-12.53,0.550,0,A,D,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,LAD,Max Muncy,Colin Rea,10.52,43.03,+851,+132,NA,,1.5,132,-0.07,0.782,0,A+,A,A+,,,unpriced,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,LAD,Kyle Tucker,Colin Rea,0.40,14.06,+24900,+611,502,-16.21,1.5,139,-27.78,0.464,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,LAD,Teoscar Hernández,Colin Rea,2.61,19.47,+3738,+413,414,-16.85,1.5,130,-24.00,0.480,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,LAD,Dalton Rushing,Colin Rea,22.31,55.00,+348,-122,397,2.18,0.5,-156,,0.950,0,A+,A+,A+,,,priced_below_gate,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,LAD,Andy Pages,Colin Rea,2.95,22.57,+3292,+343,526,-13.03,1.5,144,-18.41,0.383,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,CHC@LAD,LAD,Hyeseong Kim,Colin Rea,2.65,28.53,+3673,+250,1040,-6.12,0.5,-150,,0.630,0,B,D,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,CHC@LAD,LAD,Alex Freeland,Colin Rea,0.40,6.82,+24900,+1365,930,-9.31,0.5,-107,,0.277,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PHI@ATL,PHI,Trea Turner,Bryce Elder,0.40,10.35,+24900,+866,870,-9.91,1.5,110,-37.27,0.526,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,PHI,Kyle Schwarber,Bryce Elder,7.82,30.77,+1179,+225,244,-21.25,1.5,115,-15.74,0.679,0,B,B,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,PHI,Bryce Harper,Bryce Elder,5.88,32.87,+1602,+204,428,-13.06,1.5,113,-14.08,0.739,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,PHI,Adolis García,Bryce Elder,0.40,16.43,+24900,+509,529,-15.50,1.5,143,-24.72,0.487,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,PHI,Brandon Marsh,Bryce Elder,3.07,26.55,+3160,+277,830,-7.69,1.5,158,-12.21,0.627,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,PHI,Bryson Stott,Bryce Elder,0.40,8.55,+24900,+1070,1040,-8.37,0.5,-172,,0.354,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PHI@ATL,PHI,Alec Bohm,Bryce Elder,0.40,6.00,+24900,+1567,1120,-7.80,0.5,-200,,0.216,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PHI@ATL,PHI,Justin Crawford,Bryce Elder,0.40,6.00,+24900,+1567,1240,-7.06,0.5,-164,,0.318,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PHI@ATL,PHI,Rafael Marchán,Bryce Elder,0.40,6.00,+24900,+1567,1020,-8.53,0.5,-136,,0.180,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PHI@ATL,ATL,Ronald Acuña Jr.,Zack Wheeler,3.58,26.36,+2694,+279,497,-13.17,1.5,120,-19.09,0.507,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,ATL,Drake Baldwin,Zack Wheeler,7.75,35.70,+1190,+180,447,-10.53,1.5,114,-11.03,0.553,0,A,C,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,ATL,Matt Olson,Zack Wheeler,9.95,41.37,+905,+142,307,-14.62,1.5,116,-4.93,0.681,0,A,B,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,ATL,Ozzie Albies,Zack Wheeler,2.38,22.18,+4099,+351,680,-10.44,1.5,142,-19.15,0.650,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,ATL,Michael Harris II,Zack Wheeler,15.61,55.00,+541,-122,496,-1.17,1.5,112,7.83,0.950,0,A+,A+,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,ATL,Austin Riley,Zack Wheeler,3.35,22.04,+2881,+354,567,-11.64,1.5,145,-18.77,0.548,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-25,PHI@ATL,ATL,Mauricio Dubón,Zack Wheeler,0.40,11.14,+24900,+798,1060,-8.22,0.5,-164,,0.328,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PHI@ATL,ATL,Mike Yastrzemski,Zack Wheeler,0.40,6.00,+24900,+1567,710,-11.95,0.5,-108,,0.285,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-25,PHI@ATL,ATL,Eli White,Zack Wheeler,2.85,18.82,+3414,+431,1200,-4.85,0.5,-110,,0.601,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"Medium — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
<!-- batter-outlooks-csv:end -->
*/
