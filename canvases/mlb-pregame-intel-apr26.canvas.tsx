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
    awayAmerican: -151,
    homeAmerican: 119,
    impliedAwayPct: 57.50,
    impliedHomePct: 42.50,
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
    homeAmerican: 113,
    impliedAwayPct: 54.95,
    impliedHomePct: 45.05,
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
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
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
      { batter: "Ketel Marte", team: "AZ", hrPct: 5.4, tb2Pct: 30.5, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs RHP; above-average damage; vs tough pitcher; TB book at 2.5, not 1.5-aligned" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 4.5, tb2Pct: 30.7, tier: "HR D / TB B", note: "Display only — Yet to begin; LHB vs RHP; above-average damage; vs tough pitcher; TB book at 2.5, not 1.5-aligned" },
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
    homeAmerican: -123,
    impliedAwayPct: 46.69,
    impliedHomePct: 53.31,
    modelAwayPct: 44.52,
    modelHomePct: 55.48,
    edgeAwayPct: -2.17,
    edgeHomePct: 2.17,
    prediction: "SF",
    decisionTier: "C",
    edgeOnPickPct: 2.17,
    modelConfidence: "High",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Max Meyer vs Landen Roupp. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
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
      { batter: "Kyle Stowers", team: "MIA", hrPct: 0.4, tb2Pct: 22.4, tier: "HR D / TB C", note: "LHB vs RHP; elite power indicators; vs tough pitcher" },
      { batter: "Otto Lopez", team: "MIA", hrPct: 1.6, tb2Pct: 24.8, tier: "HR D / TB C", note: "RHB vs RHP; above-average damage; vs tough pitcher" },
      { batter: "Xavier Edwards", team: "MIA", hrPct: 0.4, tb2Pct: 17.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Liam Hicks", team: "MIA", hrPct: 0.8, tb2Pct: 21.3, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Owen Caissie", team: "MIA", hrPct: 0.4, tb2Pct: 6.1, tier: "HR D / TB D", note: "LHB vs RHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Connor Norby", team: "MIA", hrPct: 0.4, tb2Pct: 9.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs tough pitcher" },
      { batter: "Graham Pauley", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Heriberto Hernández", team: "MIA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 2.0, tb2Pct: 25.6, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.4, tb2Pct: 9.8, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Luis Arraez", team: "SF", hrPct: 0.4, tb2Pct: 13.4, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 6.8, tb2Pct: 33.7, tier: "HR C / TB B", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Rafael Devers", team: "SF", hrPct: 0.4, tb2Pct: 10.2, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Heliot Ramos", team: "SF", hrPct: 7.9, tb2Pct: 37.2, tier: "HR B / TB A", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 4.5, tb2Pct: 22.8, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Christian Koss", team: "SF", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.6, tb2Pct: 11.4, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
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
    awayAmerican: -101,
    homeAmerican: -114,
    impliedAwayPct: 48.54,
    impliedHomePct: 51.46,
    modelAwayPct: 50.79,
    modelHomePct: 49.21,
    edgeAwayPct: 2.25,
    edgeHomePct: -2.25,
    prediction: "LAA",
    decisionTier: "C",
    edgeOnPickPct: 2.25,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Reid Detmers vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
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
      { batter: "Zach Neto", team: "LAA", hrPct: 1.5, tb2Pct: 13.6, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Mike Trout", team: "LAA", hrPct: 13.2, tb2Pct: 50.0, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; neutral pitcher matchup; priced lean: 2+ TB (A+)" },
      { batter: "Yoán Moncada", team: "LAA", hrPct: 2.9, tb2Pct: 18.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Jorge Soler", team: "LAA", hrPct: 3.5, tb2Pct: 21.7, tier: "HR D / TB D", note: "RHB vs RHP; above-average damage; neutral pitcher matchup" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.4, tb2Pct: 11.1, tier: "HR D / TB D", note: "LHB vs RHP; limited power profile; neutral pitcher matchup" },
      { batter: "Jo Adell", team: "LAA", hrPct: 3.7, tb2Pct: 25.4, tier: "HR D / TB C", note: "RHB vs RHP; hard-contact profile; neutral pitcher matchup" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Travis d'Arnaud", team: "LAA", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Adam Frazier", team: "LAA", hrPct: 2.3, tb2Pct: 21.7, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Lane Thomas", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs tough pitcher" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 2.1, tb2Pct: 27.5, tier: "HR D / TB C", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.4, tb2Pct: 12.9, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Salvador Perez", team: "KC", hrPct: 1.1, tb2Pct: 14.5, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Starling Marte", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Carter Jensen", team: "KC", hrPct: 5.3, tb2Pct: 30.0, tier: "HR D / TB B", note: "LHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Nick Loftin", team: "KC", hrPct: 0.4, tb2Pct: 18.9, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Isaac Collins", team: "KC", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Michael Massey", team: "KC", hrPct: 1.4, tb2Pct: 21.8, tier: "HR D / TB D", note: "LHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
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
    awayAmerican: 104,
    homeAmerican: -121,
    impliedAwayPct: 47.24,
    impliedHomePct: 52.76,
    modelAwayPct: 49.85,
    modelHomePct: 50.15,
    edgeAwayPct: 2.61,
    edgeHomePct: -2.61,
    prediction: "LAD",
    decisionTier: "D",
    edgeOnPickPct: -2.61,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Shota Imanaga vs Justin Wrobleski. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Nico Hoerner", "SS"],
      ["2", "Alex Bregman", "3B"],
      ["3", "Ian Happ", "LF"],
      ["4", "Seiya Suzuki", "RF"],
      ["5", "Carson Kelly", "C"],
      ["6", "Michael Busch", "1B"],
      ["7", "Dansby Swanson", "DH"],
      ["8", "Matt Shaw", "2B"],
      ["9", "Pete Crow-Armstrong", "CF"],
    ],
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
    propsAway: [
      { batter: "Nico Hoerner", team: "CHC", hrPct: 0.8, tb2Pct: 19.7, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Alex Bregman", team: "CHC", hrPct: 1.6, tb2Pct: 21.8, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Ian Happ", team: "CHC", hrPct: 6.0, tb2Pct: 29.1, tier: "HR C / TB B", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Seiya Suzuki", team: "CHC", hrPct: 6.7, tb2Pct: 35.5, tier: "HR C / TB A", note: "RHB vs LHP; elite power indicators; neutral pitcher matchup" },
      { batter: "Carson Kelly", team: "CHC", hrPct: 6.1, tb2Pct: 35.0, tier: "HR C / TB B", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Michael Busch", team: "CHC", hrPct: 0.4, tb2Pct: 12.2, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; neutral pitcher matchup" },
      { batter: "Dansby Swanson", team: "CHC", hrPct: 7.1, tb2Pct: 32.4, tier: "HR C / TB B", note: "RHB vs LHP; above-average damage; neutral pitcher matchup" },
      { batter: "Matt Shaw", team: "CHC", hrPct: 2.5, tb2Pct: 28.4, tier: "HR D / TB B", note: "RHB vs LHP; contact-driven profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
      { batter: "Pete Crow-Armstrong", team: "CHC", hrPct: 0.4, tb2Pct: 12.2, tier: "HR D / TB D", note: "LHB vs LHP; hard-contact profile; neutral pitcher matchup; TB book at 0.5, not 1.5-aligned" },
    ],
    propsHome: [
      { batter: "Shohei Ohtani", team: "LAD", hrPct: 3.6, tb2Pct: 22.4, tier: "HR D / TB C", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Freddie Freeman", team: "LAD", hrPct: 3.2, tb2Pct: 30.9, tier: "HR D / TB B", note: "LHB vs LHP; elite power indicators; vs tough pitcher" },
      { batter: "Teoscar Hernández", team: "LAD", hrPct: 0.4, tb2Pct: 13.0, tier: "HR D / TB D", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Andy Pages", team: "LAD", hrPct: 1.9, tb2Pct: 22.1, tier: "HR D / TB C", note: "RHB vs LHP; above-average damage; vs tough pitcher" },
      { batter: "Kyle Tucker", team: "LAD", hrPct: 0.4, tb2Pct: 11.7, tier: "HR D / TB D", note: "LHB vs LHP; contact-driven profile; vs tough pitcher" },
      { batter: "Miguel Rojas", team: "LAD", hrPct: 3.5, tb2Pct: 32.2, tier: "HR D / TB B", note: "RHB vs LHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Dalton Rushing", team: "LAD", hrPct: 17.5, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs LHP; elite power indicators; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Santiago Espinal", team: "LAD", hrPct: 0.4, tb2Pct: 9.9, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
      { batter: "Hyeseong Kim", team: "LAD", hrPct: 0.4, tb2Pct: 24.1, tier: "HR D / TB C", note: "LHB vs LHP; above-average damage; vs tough pitcher; TB book at 0.5, not 1.5-aligned" },
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
2026-04-26,COL,NYM,1:45 PM,TBD,Kodai Senga,-156,122,5.5,-120,-110,53F / 9 mph wind / 0% precip / Open,53.0,9.1,0,0.444,0.403,,,pregame,Yet To Begin,Scheduled,Yet to begin,,,Partial,hr_market_integrity_degraded|lineup_not_posted_api|recent_form_missing|starter_verification_failed,57.50,42.50,,,,,,,,,,PASS,data_blocked,,data_blocked,hr_market_integrity_degraded;lineup_not_posted_api;recent_form_missing;starter_verification_failed,Low,"Auto-generated live scaffold from MLB schedule + market odds: TBD vs Kodai Senga. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
2026-04-26,SD,AZ,4:05 PM,Michael King,Ryne Nelson,-134,113,15.0,-105,-115,Conservative fallback / Retractable,,,,0.497,0.409,0.490,0.561,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,weather_fallback_conservative|weather_geocode_failed|weather_live_missing,54.95,45.05,,,,,,,,,,PASS,data_blocked,,data_blocked,weather_fallback_conservative;weather_geocode_failed;weather_live_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Michael King vs Ryne Nelson. Run compute to refresh lineups, weather, and model outputs before staking.",data_blocked
2026-04-26,MIA,SF,4:05 PM,Max Meyer,Landen Roupp,107,-123,7.5,-105,-115,60F / 12 mph wind / 1% precip / Open,59.5,12.3,1,0.509,0.457,0.491,0.496,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,46.69,53.31,25.00,75.00,44.52,55.48,0.10,44.52,55.48,-2.17,2.17,SF,C,2.17,High,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Max Meyer vs Landen Roupp. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-26,LAA,KC,4:10 PM,Reid Detmers,Seth Lugo,-101,-114,8.5,-115,-105,78F / 15 mph wind / 17% precip / Open,77.7,15.1,17,0.384,0.306,0.512,0.480,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,48.54,51.46,71.08,28.92,50.79,49.21,0.10,50.79,49.21,2.25,-2.25,LAA,C,2.25,Medium,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Reid Detmers vs Seth Lugo. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-26,CHC,LAD,4:10 PM,Shota Imanaga,Justin Wrobleski,104,-121,8.5,-120,100,65F / 15 mph wind / 0% precip / Open,64.8,14.9,0,0.437,0.359,0.653,0.572,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,47.24,52.76,73.37,26.63,49.85,50.15,0.10,49.85,50.15,2.61,-2.61,LAD,D,-2.61,Medium,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Shota Imanaga vs Justin Wrobleski. Run compute to refresh lineups, weather, and model outputs before staking.",scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,hr_market_integrity,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-26,SD@AZ,SD,Ramón Laureano,Ryne Nelson,8.41,36.11,+1088,+177,240,-21.00,2.5,-103,,0.498,0,A,B,A,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,SD,Fernando Tatis Jr.,Ryne Nelson,5.95,28.43,+1580,+252,225,-24.82,2.5,-105,,0.382,0,B,C,B,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,SD,Jackson Merrill,Ryne Nelson,6.31,27.89,+1485,+259,261,-21.39,2.5,100,,0.446,0,C,C,C,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,SD,Manny Machado,Ryne Nelson,1.63,11.92,+6027,+739,273,-25.18,2.5,114,,0.268,0,D,D,D,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,SD,Xander Bogaerts,Ryne Nelson,8.01,38.16,+1149,+162,345,-14.47,1.5,-142,-20.52,0.729,0,A,B,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,SD,Gavin Sheets,Ryne Nelson,7.27,32.53,+1276,+207,248,-21.47,1.5,-138,-25.45,0.519,0,B,C,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,SD,Miguel Andujar,Ryne Nelson,2.82,26.17,+3448,+282,529,-13.08,1.5,-135,-31.28,0.533,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,SD,Luis Campusano,Ryne Nelson,11.03,49.42,+806,+102,466,-6.64,1.5,-116,-4.29,0.715,0,A+,A,A+,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,SD,Jake Cronenworth,Ryne Nelson,1.58,11.65,+6215,+759,471,-15.93,1.5,110,-35.97,0.324,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Ildemaro Vargas,Michael King,7.56,37.79,+1223,+165,387,-12.97,1.5,-138,-20.19,0.785,0,A,C,A,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Ketel Marte,Michael King,5.37,30.53,+1762,+228,209,-26.99,2.5,115,,0.633,0,B,D,B,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,AZ,Corbin Carroll,Michael King,4.53,30.72,+2107,+225,222,-26.52,2.5,106,,0.588,0,B,D,B,,,priced_no_edge,full,line_mismatch_2.5,Display only,partial,data_blocked
2026-04-26,SD@AZ,AZ,Lourdes Gurriel Jr.,Michael King,0.40,6.00,+24900,+1567,412,-19.13,1.5,-140,-52.33,0.180,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Adrian Del Castillo,Michael King,0.85,15.37,+11650,+550,431,-17.98,1.5,101,-34.38,0.439,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Jose Fernandez,Michael King,0.79,20.20,+12548,+395,489,-16.19,1.5,-101,-30.05,0.468,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Nolan Arenado,Michael King,3.15,23.64,+3076,+323,400,-16.85,1.5,112,-23.53,0.929,0,C,D,C,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Alek Thomas,Michael King,5.08,29.09,+1870,+244,509,-11.34,1.5,109,-18.76,0.735,0,B,D,B,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,SD@AZ,AZ,Tim Tawa,Michael King,0.40,6.00,+24900,+1567,547,-15.06,1.5,143,-35.15,0.292,0,D,D,D,,,priced_no_edge,full,priced_no_edge,Display only,full,data_blocked
2026-04-26,MIA@SF,MIA,Jakob Marsee,Landen Roupp,0.40,6.00,+24900,+1567,1240,-7.06,1.5,155,-33.22,0.492,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Kyle Stowers,Landen Roupp,0.40,22.41,+24900,+346,470,-17.14,1.5,130,-21.07,0.606,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Otto Lopez,Landen Roupp,1.58,24.82,+6236,+303,890,-8.52,1.5,104,-24.20,0.634,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Xavier Edwards,Landen Roupp,0.40,17.63,+24900,+467,1160,-7.54,1.5,131,-25.66,0.539,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Liam Hicks,Landen Roupp,0.76,21.27,+13110,+370,1280,-6.49,0.5,-182,,0.662,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,MIA,Owen Caissie,Landen Roupp,0.40,6.08,+24900,+1545,920,-9.40,0.5,-122,,0.253,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,MIA,Connor Norby,Landen Roupp,0.40,9.77,+24900,+923,840,-10.24,1.5,165,-27.96,0.537,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,MIA,Graham Pauley,Landen Roupp,0.40,6.00,+24900,+1567,1160,-7.54,0.5,-104,,0.422,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,MIA,Heriberto Hernández,Landen Roupp,0.40,6.00,+24900,+1567,1120,-7.80,0.5,-118,,0.279,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,SF,Jung Hoo Lee,Max Meyer,2.04,25.61,+4807,+290,960,-7.40,1.5,117,-20.47,0.677,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Matt Chapman,Max Meyer,0.40,9.83,+24900,+917,660,-12.76,1.5,143,-31.32,0.377,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Luis Arraez,Max Meyer,0.40,13.44,+24900,+644,1260,-6.95,1.5,124,-31.20,0.474,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Casey Schmitt,Max Meyer,6.76,33.66,+1379,+197,610,-7.32,1.5,134,-9.07,0.671,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Rafael Devers,Max Meyer,0.40,10.19,+24900,+881,500,-16.27,0.5,-167,,0.286,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,SF,Heliot Ramos,Max Meyer,7.87,37.20,+1170,+169,630,-5.82,1.5,130,-6.28,0.828,0,A,B,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,MIA@SF,SF,Drew Gilbert,Max Meyer,4.51,22.76,+2117,+339,980,-4.75,0.5,-132,,0.560,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,SF,Christian Koss,Max Meyer,0.40,6.00,+24900,+1567,1080,-8.07,0.5,-159,,0.180,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,MIA@SF,SF,Patrick Bailey,Max Meyer,0.64,11.40,+15476,+777,860,-9.77,0.5,-118,,0.412,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,LAA@KC,LAA,Zach Neto,Seth Lugo,1.47,13.63,+6717,+634,470,-16.08,1.5,114,-33.10,0.336,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,LAA,Mike Trout,Seth Lugo,13.16,50.02,+660,-100,331,-10.04,1.5,110,2.40,0.933,0,A+,A,A+,2+ TB,A+,priced_no_edge,full,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,LAA,Yoán Moncada,Seth Lugo,2.89,18.62,+3355,+437,600,-11.39,1.5,153,-20.90,0.621,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,LAA,Jorge Soler,Seth Lugo,3.55,21.71,+2717,+361,462,-14.24,1.5,140,-19.96,0.493,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,LAA,Nolan Schanuel,Seth Lugo,0.40,11.07,+24900,+803,940,-9.22,1.5,146,-29.58,0.435,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,LAA,Jo Adell,Seth Lugo,3.74,25.36,+2571,+294,444,-14.64,1.5,124,-19.29,0.559,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,LAA,Josh Lowe,Seth Lugo,0.40,6.00,+24900,+1567,720,-11.80,1.5,166,-31.59,0.369,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,LAA,Travis d'Arnaud,Seth Lugo,0.40,6.00,+24900,+1567,660,-12.76,0.5,-141,,0.327,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,LAA@KC,LAA,Adam Frazier,Seth Lugo,2.32,21.71,+4218,+361,1120,-5.88,0.5,-145,,0.534,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,LAA@KC,KC,Lane Thomas,Reid Detmers,0.40,6.00,+24900,+1567,650,-12.93,1.5,138,-36.02,0.376,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,KC,Bobby Witt Jr.,Reid Detmers,2.09,27.51,+4691,+263,331,-21.11,1.5,-120,-27.03,0.538,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,KC,Vinnie Pasquantino,Reid Detmers,0.40,12.89,+24900,+676,690,-12.26,1.5,135,-29.66,0.539,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,KC,Salvador Perez,Reid Detmers,1.15,14.46,+8626,+591,468,-16.46,1.5,118,-31.41,0.440,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,KC,Starling Marte,Reid Detmers,0.40,6.00,+24900,+1567,630,-13.30,1.5,145,-34.82,0.317,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,KC,Carter Jensen,Reid Detmers,5.34,29.97,+1774,+234,578,-9.41,1.5,156,-9.09,0.690,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,LAA@KC,KC,Nick Loftin,Reid Detmers,0.40,18.89,+24900,+429,830,-10.35,0.5,-134,,0.530,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,LAA@KC,KC,Isaac Collins,Reid Detmers,0.40,6.00,+24900,+1567,900,-9.60,0.5,-140,,0.363,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,LAA@KC,KC,Michael Massey,Reid Detmers,1.37,21.79,+7195,+359,900,-8.63,0.5,-123,,0.528,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,CHC@LAD,CHC,Nico Hoerner,Justin Wrobleski,0.82,19.74,+12123,+407,830,-9.93,1.5,107,-28.57,0.618,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,CHC,Alex Bregman,Justin Wrobleski,1.64,21.83,+6009,+358,436,-17.02,1.5,108,-26.25,0.556,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,CHC,Ian Happ,Justin Wrobleski,6.01,29.07,+1563,+244,551,-9.35,1.5,138,-12.95,0.653,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,CHC,Seiya Suzuki,Justin Wrobleski,6.74,35.55,+1384,+181,392,-13.59,1.5,115,-10.97,0.790,0,A,C,A,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,CHC,Carson Kelly,Justin Wrobleski,6.06,34.96,+1549,+186,493,-10.80,1.5,140,-6.71,0.758,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,CHC,Michael Busch,Justin Wrobleski,0.40,12.18,+24900,+721,598,-13.93,1.5,155,-27.03,0.571,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,CHC,Dansby Swanson,Justin Wrobleski,7.13,32.43,+1303,+208,620,-6.76,1.5,150,-7.57,0.816,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,CHC,Matt Shaw,Justin Wrobleski,2.48,28.43,+3934,+252,710,-9.87,0.5,-171,,0.698,0,B,D,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,CHC@LAD,CHC,Pete Crow-Armstrong,Justin Wrobleski,0.40,12.23,+24900,+718,660,-12.76,0.5,-148,,0.417,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,CHC@LAD,LAD,Shohei Ohtani,Shota Imanaga,3.59,22.40,+2683,+347,187,-31.25,1.5,-112,-30.43,0.416,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,LAD,Freddie Freeman,Shota Imanaga,3.20,30.90,+3026,+224,425,-15.85,1.5,116,-15.40,0.519,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,LAD,Teoscar Hernández,Shota Imanaga,0.40,13.03,+24900,+668,339,-22.38,1.5,112,-34.14,0.383,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,LAD,Andy Pages,Shota Imanaga,1.86,22.06,+5273,+353,397,-18.26,1.5,122,-22.98,0.406,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,LAD,Kyle Tucker,Shota Imanaga,0.40,11.70,+24900,+755,433,-18.36,1.5,152,-27.98,0.497,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-26,CHC@LAD,LAD,Miguel Rojas,Shota Imanaga,3.51,32.16,+2745,+211,660,-9.64,0.5,-179,,0.950,0,B,D,B,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,CHC@LAD,LAD,Dalton Rushing,Shota Imanaga,17.52,55.00,+471,-122,413,-1.97,0.5,-135,,0.950,0,A+,A+,A+,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,CHC@LAD,LAD,Santiago Espinal,Shota Imanaga,0.40,9.86,+24900,+914,1080,-8.07,0.5,-143,,0.400,0,D,D,D,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
2026-04-26,CHC@LAD,LAD,Hyeseong Kim,Shota Imanaga,0.40,24.13,+24865,+314,970,-8.95,0.5,-119,,0.627,0,C,D,C,,,priced_no_edge,full,line_mismatch_0.5,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets",partial,scored
<!-- batter-outlooks-csv:end -->
*/
