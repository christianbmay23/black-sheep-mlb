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
    gameKey: "WSH@PIT",
    venue: "PNC Park",
    away: "WSH",
    home: "PIT",
    timeEt: "12:35 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — WSH 8, PIT 7",
    awayScore: 8,
    homeScore: 7,
    awaySp: "Foster Griffin",
    homeSp: "Braxton Ashcraft",
    awayAmerican: 118,
    homeAmerican: -132,
    impliedAwayPct: 44.64,
    impliedHomePct: 55.36,
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
    rationale:
      "Probables Griffin (WSH) and Ashcraft (PIT) look like swing/spot roles without big separator stuff. PNC is slightly pitcher-friendly; Pirates get a small home edge but the price is close to fair.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "James Wood", "RF"],
      ["2", "Luis García Jr.", "1B"],
      ["3", "Brady House", "3B"],
      ["4", "Daylen Lile", "LF"],
      ["5", "CJ Abrams", "SS"],
      ["6", "Jacob Young", "CF"],
      ["7", "Jorbit Vivas", "DH"],
      ["8", "Drew Millas", "C"],
      ["9", "Nasim Nuñez", "2B"],
    ],
    homeLineup: [
      ["1", "Jake Mangum", "RF"],
      ["2", "Nick Gonzales", "3B"],
      ["3", "Oneil Cruz", "CF"],
      ["4", "Marcell Ozuna", "DH"],
      ["5", "Nick Yorke", "1B"],
      ["6", "Brandon Lowe", "2B"],
      ["7", "Joey Bart", "C"],
      ["8", "Konnor Griffin", "SS"],
      ["9", "Billy Cook", "LF"],
    ],
    spAwayNotes: [
      "RHP spot/swing role — prioritize weak contact and early-count strikes; thin track record as a traditional starter.",
      "WSH must steal innings behind him — bullpen game risk if command wavers.",
    ],
    spHomeNotes: [
      "Ashcraft works the zone; PNC suppresses some HR noise — matchup leans on barrels over walks.",
      "Pirates can match RHB power (Cruz, Ozuna) vs a non-elite swing-miss profile.",
    ],
    matchupBullets: [
      "Handedness: Griffin (R) vs Cruz/Ozuna (RHB) — no platoon gift; Wood (LHB) vs Ashcraft is the clearest opposite-side spot.",
      "Pitch mix: expect fastball/slider volume; Pirates with top-of-scale EV can punish mistakes middle-in.",
      "HR / TB: PNC leans pitcher-friendly — downgrade pure HR equity vs GABP, but Ozuna/Cruz stay in the power conversation.",
    ],
    propsAway: [
      { batter: "James Wood", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Luis García Jr.", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Brady House", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Daylen Lile", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "CJ Abrams", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Jacob Young", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Jorbit Vivas", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Drew Millas", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Nasim Nuñez", team: "WSH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
    ],
    propsHome: [
      { batter: "Jake Mangum", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Nick Gonzales", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Oneil Cruz", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Nick Yorke", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Brandon Lowe", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Joey Bart", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Konnor Griffin", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
      { batter: "Billy Cook", team: "PIT", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — WSH 8, PIT 7" },
    ],
  },
  {
    gameKey: "SF@CIN",
    venue: "Great American Ball Park",
    away: "SF",
    home: "CIN",
    timeEt: "12:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — SF 3, CIN 0",
    awayScore: 3,
    homeScore: 0,
    awaySp: "Landen Roupp",
    homeSp: "Chase Burns",
    awayAmerican: 128,
    homeAmerican: -148,
    impliedAwayPct: 42.36,
    impliedHomePct: 57.64,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Medium-High",
    flags: "rotowire_missing;not_scored_non_pregame",
    rationale:
      "Burns at home brings premium velocity; Roupp works contact and weak barrels. GABP raises HR/TB volatility — lean Reds, but mostly a props/team-total environment.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Luis Arraez", "2B"],
      ["2", "Willy Adames", "SS"],
      ["3", "Rafael Devers", "1B"],
      ["4", "Matt Chapman", "3B"],
      ["5", "Jung Hoo Lee", "RF"],
      ["6", "Will Brennan", "LF"],
      ["7", "Casey Schmitt", "DH"],
      ["8", "Drew Gilbert", "CF"],
      ["9", "Patrick Bailey", "C"],
    ],
    homeLineup: [
      ["1", "TJ Friedl", "CF"],
      ["2", "Matt McLain", "2B"],
      ["3", "Elly De La Cruz", "SS"],
      ["4", "Sal Stewart", "1B"],
      ["5", "Eugenio Suárez", "DH"],
      ["6", "Spencer Steer", "LF"],
      ["7", "Rece Hinds", "RF"],
      ["8", "Ke'Bryan Hayes", "3B"],
      ["9", "P.J. Higgins", "C"],
    ],
    spAwayNotes: [
      "LHP Roupp: contact management profile — lives on weak barrels more than empty swings.",
      "SF must string hits in a bandbox; Devers/Chapman carry ceiling vs RHP.",
    ],
    spHomeNotes: [
      "Burns (R): velocity plays at home; miss bats enough to cap long rallies if splitter/slider are sharp.",
      "GABP inflates HR/TB — Reds RH power (De La Cruz, Steer) is the game’s central story.",
    ],
    matchupBullets: [
      "Handedness: Roupp (L) vs heavy RH Cincinnati core — classic LHP-on-RHB leverage spots for Cincinnati power.",
      "Pitch-type: Burns velocity/separation vs SF’s contact-first bats (Arraez) — SF may need sequential hits; CIN can score in one swing.",
      "HR / TB: Highest run-environment game on the slate — prioritize HR / 2+ TB and team-total angles over a skinny ML edge.",
    ],
    propsAway: [
      { batter: "Luis Arraez", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Willy Adames", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Rafael Devers", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Matt Chapman", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Jung Hoo Lee", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Will Brennan", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Casey Schmitt", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Drew Gilbert", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Patrick Bailey", team: "SF", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
    ],
    propsHome: [
      { batter: "TJ Friedl", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Matt McLain", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Sal Stewart", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Eugenio Suárez", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Rece Hinds", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "Ke'Bryan Hayes", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
      { batter: "P.J. Higgins", team: "CIN", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SF 3, CIN 0" },
    ],
  },
  {
    gameKey: "KC@DET",
    venue: "Comerica Park",
    away: "KC",
    home: "DET",
    timeEt: "1:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — KC 9, DET 10",
    awayScore: 9,
    homeScore: 10,
    awaySp: "Kris Bubic",
    homeSp: "Keider Montero",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
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
    rationale:
      "Bubic vs Montero is young-starter volatility; Comerica trims some extra-base noise. Slight DET home lean without a commanding pitching edge.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Maikel Garcia", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Vinnie Pasquantino", "1B"],
      ["4", "Salvador Perez", "DH"],
      ["5", "Carter Jensen", "C"],
      ["6", "Jonathan India", "2B"],
      ["7", "Jac Caglianone", "RF"],
      ["8", "Michael Massey", "LF"],
      ["9", "Kyle Isbel", "CF"],
    ],
    homeLineup: [
      ["1", "Gleyber Torres", "2B"],
      ["2", "Kevin McGonigle", "3B"],
      ["3", "Jahmai Jones", "DH"],
      ["4", "Dillon Dingler", "C"],
      ["5", "Riley Greene", "LF"],
      ["6", "Matt Vierling", "CF"],
      ["7", "Spencer Torkelson", "1B"],
      ["8", "Wenceel Pérez", "RF"],
      ["9", "Javier Báez", "SS"],
    ],
    spAwayNotes: [
      "LHP Bubic: deception and shape vs raw velocity — volatility when FB command drifts.",
    ],
    spHomeNotes: [
      "Montero (R): young arm; Comerica helps keep balls in the yard if he avoids middle-middle.",
    ],
    matchupBullets: [
      "Handedness: Bubic (L) vs DET RHB cluster — watch Torres / Torkelson lift spots.",
      "Pitch-type: if Bubic leans CH/SL, Witt and Pasquantino become chase-or-damage swings.",
      "HR / TB: Comerica dampens pure HR — 2+ TB and barrels matter more than HR lottery.",
    ],
    propsAway: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Salvador Perez", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Carter Jensen", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Jonathan India", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Michael Massey", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
    ],
    propsHome: [
      { batter: "Gleyber Torres", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Kevin McGonigle", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Jahmai Jones", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Dillon Dingler", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Riley Greene", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Matt Vierling", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Spencer Torkelson", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Wenceel Pérez", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
      { batter: "Javier Báez", team: "DET", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — KC 9, DET 10" },
    ],
  },
  {
    gameKey: "LAA@NYY",
    venue: "Yankee Stadium",
    away: "LAA",
    home: "NYY",
    timeEt: "1:35 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — LAA 11, NYY 4",
    awayScore: 11,
    homeScore: 4,
    awaySp: "Brent Suter",
    homeSp: "Max Fried",
    awayAmerican: 205,
    homeAmerican: -245,
    impliedAwayPct: 31.59,
    impliedHomePct: 68.41,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "High",
    flags: "rotowire_missing;not_scored_non_pregame",
    rationale:
      "Suter vs Fried is a massive talent mismatch; short porch amplifies fly-ball damage. Market already prices a big NYY edge — PASS on ML unless you have a materially better number.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Zach Neto", "SS"],
      ["2", "Mike Trout", "DH"],
      ["3", "Jo Adell", "RF"],
      ["4", "Oswald Peraza", "3B"],
      ["5", "Vaughn Grissom", "2B"],
      ["6", "Nolan Schanuel", "1B"],
      ["7", "Travis d'Arnaud", "C"],
      ["8", "Josh Lowe", "LF"],
      ["9", "Bryce Teodosio", "CF"],
    ],
    homeLineup: [
      ["1", "Trent Grisham", "CF"],
      ["2", "Aaron Judge", "RF"],
      ["3", "Cody Bellinger", "LF"],
      ["4", "Giancarlo Stanton", "DH"],
      ["5", "Ben Rice", "1B"],
      ["6", "Amed Rosario", "3B"],
      ["7", "Jazz Chisholm Jr.", "2B"],
      ["8", "José Caballero", "SS"],
      ["9", "J.C. Escarra", "C"],
    ],
    spAwayNotes: [
      "LHP Suter: soft-tossing, weak-contact profile — NYY RH power is the nightmare matchup.",
    ],
    spHomeNotes: [
      "LHP Fried: bat-miss + weak contact — stabilizes innings; short RF porch helps Judge/Stanton.",
    ],
    matchupBullets: [
      "Handedness: Fried (L) vs LAA RHB-heavy heart — Trout still dangerous but Fried’s shape limits barrels.",
      "Pitch-type: Suter’s low-velo mix elevates HR risk to Judge/Stanton RHB — classic Bronx profile.",
      "HR / TB: Top HR environment on slate — props > ML (price already steep).",
    ],
    propsAway: [
      { batter: "Zach Neto", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Mike Trout", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Jo Adell", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Oswald Peraza", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Vaughn Grissom", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Nolan Schanuel", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Travis d'Arnaud", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Josh Lowe", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Bryce Teodosio", team: "LAA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
    ],
    propsHome: [
      { batter: "Trent Grisham", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Aaron Judge", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Cody Bellinger", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Ben Rice", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Amed Rosario", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "Jazz Chisholm Jr.", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "José Caballero", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
      { batter: "J.C. Escarra", team: "NYY", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — LAA 11, NYY 4" },
    ],
  },
  {
    gameKey: "TOR@MIL",
    venue: "American Family Field",
    away: "TOR",
    home: "MIL",
    timeEt: "1:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TOR 1, MIL 2",
    awayScore: 1,
    homeScore: 2,
    awaySp: "Patrick Corbin",
    homeSp: "Brandon Sproat",
    awayAmerican: -102,
    homeAmerican: -108,
    impliedAwayPct: 49.30,
    impliedHomePct: 50.70,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Low",
    flags: "rotowire_missing;not_scored_non_pregame",
    rationale:
      "Corbin vs Sproat is command volatility on both sides; Milwaukee navigation is a hair better at home, but this is effectively a coin flip for betting.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Davis Schneider", "LF"],
      ["2", "Daulton Varsho", "CF"],
      ["3", "Vladimir Guerrero Jr.", "DH"],
      ["4", "Jesús Sánchez", "RF"],
      ["5", "Lenyn Sosa", "2B"],
      ["6", "Kazuma Okamoto", "1B"],
      ["7", "Andrés Giménez", "SS"],
      ["8", "Ernie Clement", "3B"],
      ["9", "Tyler Heineman", "C"],
    ],
    homeLineup: [
      ["1", "Brandon Lockridge", "CF"],
      ["2", "Brice Turang", "2B"],
      ["3", "William Contreras", "C"],
      ["4", "Gary Sánchez", "DH"],
      ["5", "Luis Rengifo", "1B"],
      ["6", "Luis Matos", "RF"],
      ["7", "Greg Jones", "LF"],
      ["8", "David Hamilton", "3B"],
      ["9", "Joey Ortiz", "SS"],
    ],
    spAwayNotes: [
      "LHP Corbin: FB command volatility — barrels spike when he misses arm-side.",
    ],
    spHomeNotes: [
      "RHP Sproat: power stuff but control risk — game can turn on walks + hard contact clusters.",
    ],
    matchupBullets: [
      "Handedness: LHP vs MIL lineup — Contreras / Sánchez are classic HR paths if FB is elevated.",
      "Pitch-type: Corbin SL/CH usage vs TOR RHB — Vlad is the swing matchup.",
      "HR / TB: Dome helps keep balls in play — prefer selective props over sides.",
    ],
    propsAway: [
      { batter: "Davis Schneider", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Daulton Varsho", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Jesús Sánchez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Lenyn Sosa", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Kazuma Okamoto", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Andrés Giménez", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Ernie Clement", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Tyler Heineman", team: "TOR", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
    ],
    propsHome: [
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Brice Turang", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "William Contreras", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Luis Matos", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Greg Jones", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "David Hamilton", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TOR 1, MIL 2" },
    ],
  },
  {
    gameKey: "TB@CWS",
    venue: "Rate Field",
    away: "TB",
    home: "CWS",
    timeEt: "2:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TB 5, CWS 3",
    awayScore: 5,
    homeScore: 3,
    awaySp: "Steven Matz",
    homeSp: "Jordan Leasure",
    awayAmerican: -142,
    homeAmerican: 124,
    impliedAwayPct: 56.79,
    impliedHomePct: 43.21,
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
    rationale:
      "Matz’s LHP shape matters against Chicago’s lefty bats; Leasure stretched as a starter adds volatility. Rays are the cleaner roster spot — edge is modest.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Chandler Simpson", "LF"],
      ["2", "Junior Caminero", "3B"],
      ["3", "Cedric Mullins", "CF"],
      ["4", "Yandy Díaz", "DH"],
      ["5", "Ryan Vilade", "1B"],
      ["6", "Ben Williamson", "2B"],
      ["7", "Jonny DeLuca", "RF"],
      ["8", "Nick Fortes", "C"],
      ["9", "Taylor Walls", "SS"],
    ],
    homeLineup: [
      ["1", "Miguel Vargas", "3B"],
      ["2", "Chase Meidroth", "2B"],
      ["3", "Munetaka Murakami", "1B"],
      ["4", "Everson Pereira", "RF"],
      ["5", "Edgar Quero", "C"],
      ["6", "Tanner Murray", "SS"],
      ["7", "Andrew Benintendi", "DH"],
      ["8", "Derek Hill", "CF"],
      ["9", "Sam Antonacci", "LF"],
    ],
    spAwayNotes: [
      "LHP Matz: CH-heavy — good vs same-side and soft-contact swings when ahead.",
    ],
    spHomeNotes: [
      "Leasure stretched from pen: volatility + short leash — TB can stack traffic early.",
    ],
    matchupBullets: [
      "Handedness: Matz (L) vs Benintendi / Meidroth — classic L-on-L grind spots.",
      "Pitch-type: if Leasure is FB-heavy, Caminero/Mullins carry damage paths.",
      "HR / TB: Caminero power vs length risk — 2+ TB more stable than HR.",
    ],
    propsAway: [
      { batter: "Chandler Simpson", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Junior Caminero", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Cedric Mullins", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Ryan Vilade", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Ben Williamson", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Jonny DeLuca", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Nick Fortes", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Taylor Walls", team: "TB", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
    ],
    propsHome: [
      { batter: "Miguel Vargas", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Chase Meidroth", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Munetaka Murakami", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Everson Pereira", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Edgar Quero", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Tanner Murray", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Derek Hill", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
      { batter: "Sam Antonacci", team: "CWS", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TB 5, CWS 3" },
    ],
  },
  {
    gameKey: "TEX@ATH",
    venue: "Sutter Health Park",
    away: "TEX",
    home: "ATH",
    timeEt: "3:05 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — TEX 9, ATH 6",
    awayScore: 9,
    homeScore: 6,
    awaySp: "Jack Leiter",
    homeSp: "Jacob Lopez",
    awayAmerican: -118,
    homeAmerican: 108,
    impliedAwayPct: 52.96,
    impliedHomePct: 47.04,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "Low",
    flags: "rotowire_missing;not_scored_non_pregame",
    rationale:
      "Leiter vs Lopez profiles as short-leash, high-volatility. No compelling gap vs a tight market without a better posted price.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Brandon Nimmo", "RF"],
      ["2", "Wyatt Langford", "CF"],
      ["3", "Jake Burger", "1B"],
      ["4", "Josh Jung", "3B"],
      ["5", "Kyle Higashioka", "C"],
      ["6", "Andrew McCutchen", "DH"],
      ["7", "Sam Haggerty", "LF"],
      ["8", "Josh Smith", "2B"],
      ["9", "Ezequiel Duran", "SS"],
    ],
    homeLineup: [
      ["1", "Jeff McNeil", "2B"],
      ["2", "Shea Langeliers", "DH"],
      ["3", "Nick Kurtz", "1B"],
      ["4", "Tyler Soderstrom", "LF"],
      ["5", "Jacob Wilson", "SS"],
      ["6", "Carlos Cortes", "RF"],
      ["7", "Lawrence Butler", "CF"],
      ["8", "Austin Wynns", "C"],
      ["9", "Darell Hernaiz", "3B"],
    ],
    spAwayNotes: [
      "RHP Leiter: swing-and-miss upside with command volatility — short leash likely.",
    ],
    spHomeNotes: [
      "RHP Lopez: similar volatility profile — game may be decided by pens.",
    ],
    matchupBullets: [
      "Handedness: both teams can stack RHB power — Langford/Jung vs Lopez FB command is the swing factor.",
      "Pitch-type: whoever lands breaker early wins traffic — HRs come on mistakes, not volume.",
      "HR / TB: PASS side — only play props if you get a price; volatility cuts confidence.",
    ],
    propsAway: [
      { batter: "Brandon Nimmo", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Wyatt Langford", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Jake Burger", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Josh Jung", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Kyle Higashioka", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Andrew McCutchen", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Sam Haggerty", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Josh Smith", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Ezequiel Duran", team: "TEX", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
    ],
    propsHome: [
      { batter: "Jeff McNeil", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Nick Kurtz", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Tyler Soderstrom", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Austin Wynns", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
      { batter: "Darell Hernaiz", team: "ATH", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — TEX 9, ATH 6" },
    ],
  },
  {
    gameKey: "BAL@CLE",
    venue: "Progressive Field",
    away: "BAL",
    home: "CLE",
    timeEt: "6:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — BAL 2, CLE 4",
    awayScore: 2,
    homeScore: 4,
    awaySp: "Shane Baz",
    homeSp: "Parker Messick",
    awayAmerican: -128,
    homeAmerican: 118,
    impliedAwayPct: 55.03,
    impliedHomePct: 44.97,
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
    rationale:
      "Baz’s stuff plays when the heater is elevated; Messick needs to limit barrels. Small lean to Baltimore’s lineup ceiling if Baz holds a normal starter workload.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Taylor Ward", "LF"],
      ["2", "Gunnar Henderson", "DH"],
      ["3", "Pete Alonso", "1B"],
      ["4", "Johnathan Rodríguez", "RF"],
      ["5", "Samuel Basallo", "C"],
      ["6", "Jeremiah Jackson", "2B"],
      ["7", "Coby Mayo", "3B"],
      ["8", "Leody Taveras", "CF"],
      ["9", "Blaze Alexander", "SS"],
    ],
    homeLineup: [
      ["1", "Steven Kwan", "CF"],
      ["2", "Chase DeLauter", "DH"],
      ["3", "José Ramírez", "3B"],
      ["4", "Kyle Manzardo", "1B"],
      ["5", "George Valera", "RF"],
      ["6", "Angel Martínez", "LF"],
      ["7", "Juan Brito", "2B"],
      ["8", "Austin Hedges", "C"],
      ["9", "Brayan Rocchio", "SS"],
    ],
    spAwayNotes: [
      "RHP Baz: premium velo — game breaks on fastball command and secondary consistency.",
    ],
    spHomeNotes: [
      "LHP Messick: command-over-stuff — minimize barrels vs BAL power.",
    ],
    matchupBullets: [
      "Handedness: Messick (L) vs BAL RHB core — Alonso/Henderson are focal points.",
      "Pitch-type: Baz FB/SL vs Ramírez/Kwan — Cleveland’s contact vs Baltimore’s damage.",
      "HR / TB: Confirm BAL lineup at lock — props carry extra variance until LU posts.",
    ],
    propsAway: [
      { batter: "Taylor Ward", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Pete Alonso", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Johnathan Rodríguez", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Samuel Basallo", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Jeremiah Jackson", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Leody Taveras", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Blaze Alexander", team: "BAL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
    ],
    propsHome: [
      { batter: "Steven Kwan", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Chase DeLauter", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "José Ramírez", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Kyle Manzardo", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "George Valera", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Angel Martínez", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Juan Brito", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Austin Hedges", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
      { batter: "Brayan Rocchio", team: "CLE", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — BAL 2, CLE 4" },
    ],
  },
  {
    gameKey: "COL@HOU",
    venue: "Daikin Park",
    away: "COL",
    home: "HOU",
    timeEt: "8:10 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — COL 3, HOU 2",
    awayScore: 3,
    homeScore: 2,
    awaySp: "Juan Mejia",
    homeSp: "Ryan Weiss",
    awayAmerican: 240,
    homeAmerican: -290,
    impliedAwayPct: 28.34,
    impliedHomePct: 71.66,
    modelAwayPct: 0.00,
    modelHomePct: 0.00,
    edgeAwayPct: 0.00,
    edgeHomePct: 0.00,
    prediction: "Not Scored",
    decisionTier: "Not Scored",
    edgeOnPickPct: 0.00,
    modelConfidence: "Not Scored",
    analystConfidence: "High",
    flags: "rotowire_missing;not_scored_non_pregame",
    rationale:
      "Road Rockies vs Houston’s overall talent is a steep mismatch; Crawford Boxes pull-side HRs matter. Chalk is heavy — PASS unless you model innings/hooks differently.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Edouard Julien", "2B"],
      ["2", "Tyler Freeman", "RF"],
      ["3", "TJ Rumfield", "1B"],
      ["4", "Hunter Goodman", "C"],
      ["5", "Mickey Moniak", "LF"],
      ["6", "Ezequiel Tovar", "SS"],
      ["7", "Troy Johnston", "DH"],
      ["8", "Kyle Karros", "3B"],
      ["9", "Brenton Doyle", "CF"],
    ],
    homeLineup: [
      ["1", "Jose Altuve", "2B"],
      ["2", "Yordan Alvarez", "DH"],
      ["3", "Isaac Paredes", "3B"],
      ["4", "Carlos Correa", "SS"],
      ["5", "Christian Walker", "1B"],
      ["6", "Joey Loperfido", "LF"],
      ["7", "Cam Smith", "RF"],
      ["8", "Taylor Trammell", "CF"],
      ["9", "Yainer Diaz", "C"],
    ],
    spAwayNotes: [
      "Road spot starter profile for Colorado — thin margin for mistakes vs Houston’s lineup.",
    ],
    spHomeNotes: [
      "Weiss: not an ace label — Astros may lean on pen early; still a huge team-context edge.",
    ],
    matchupBullets: [
      "Handedness: Houston’s LHB power (Alvarez) vs RHP — classic pull-side HR setup in Minute Maid.",
      "Pitch-type: if Mejia is FB-heavy without secondaries, Alvarez/Walker punish mistakes.",
      "HR / TB: PASS ML — only shop props if price exists; chalk crushes edge.",
    ],
    propsAway: [
      { batter: "Edouard Julien", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Tyler Freeman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "TJ Rumfield", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Hunter Goodman", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Mickey Moniak", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Ezequiel Tovar", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Troy Johnston", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Kyle Karros", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Brenton Doyle", team: "COL", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
    ],
    propsHome: [
      { batter: "Jose Altuve", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Isaac Paredes", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Carlos Correa", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Christian Walker", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Joey Loperfido", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Cam Smith", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Taylor Trammell", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
      { batter: "Yainer Diaz", team: "HOU", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — COL 3, HOU 2" },
    ],
  },
  {
    gameKey: "SEA@SD",
    venue: "Petco Park",
    away: "SEA",
    home: "SD",
    timeEt: "8:40 PM",
    gameStatusBucket: "final",
    gameState: "Final",
    gameStateDetail: "Final",
    gameStatusNote: "Final — SEA 2, SD 5",
    awayScore: 2,
    homeScore: 5,
    awaySp: "Luis Castillo",
    homeSp: "Walker Buehler",
    awayAmerican: -104,
    homeAmerican: -112,
    impliedAwayPct: 49.11,
    impliedHomePct: 50.89,
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
    rationale:
      "Castillo vs Buehler is a true ace duel; Petco suppresses offense. Side market is rightfully tight — prefer game props over ML.",
    awayLuLabel: "Posted (MLB API)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Brendan Donovan", "3B"],
      ["2", "Cal Raleigh", "C"],
      ["3", "Julio Rodríguez", "CF"],
      ["4", "Josh Naylor", "1B"],
      ["5", "Randy Arozarena", "LF"],
      ["6", "Luke Raley", "RF"],
      ["7", "J.P. Crawford", "SS"],
      ["8", "Dominic Canzone", "DH"],
      ["9", "Cole Young", "2B"],
    ],
    homeLineup: [
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
    spAwayNotes: [
      "RHP Castillo: elite stuff — Petco helps, but swing-miss plays anywhere.",
    ],
    spHomeNotes: [
      "RHP Buehler: command starter — limits barrels when FB/CT are on.",
    ],
    matchupBullets: [
      "Handedness: ace-on-ace — fewer platoon exploits; sequencing matters more than splits.",
      "Pitch-type: Castillo’s change/slider vs SD’s contact; Buehler’s CT vs Seattle’s chase decisions.",
      "HR / TB: Petco suppresses HR — lower HR prop priority; F5 / pitch props often cleaner.",
    ],
    propsAway: [
      { batter: "Brendan Donovan", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Cal Raleigh", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Josh Naylor", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Randy Arozarena", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Luke Raley", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "J.P. Crawford", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Dominic Canzone", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Cole Young", team: "SEA", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
    ],
    propsHome: [
      { batter: "Ramón Laureano", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Jackson Merrill", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Manny Machado", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Xander Bogaerts", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Gavin Sheets", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Miguel Andujar", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Luis Campusano", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
      { batter: "Jake Cronenworth", team: "SD", hrPct: 0.0, tb2Pct: 0.0, tier: "Not Scored", note: "Not scored — Final — SEA 2, SD 5" },
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

export default function Apr16Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 16, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-16
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
Export marker blocks for canvases/exports/build_ml_exports.py (matched as substrings in this file).

<!-- games-csv:start -->
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,market_total,market_over_american,market_under_american,weather_summary,weather_temp_f,weather_wind_mph,weather_precip_pct,bullpen_away_score,bullpen_home_score,recent_form_away_score,recent_form_home_score,game_status_bucket,game_state,game_state_detail,game_status_note,away_score,home_score,verification_status,verification_notes,implied_away_pct_nv,implied_home_pct_nv,raw_model_away_win_pct,raw_model_home_win_pct,final_away_win_pct,final_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary,scoring_status
2026-04-16,WSH,PIT,12:35 PM,Foster Griffin,Braxton Ashcraft,118,-132,,,,47F / 8 mph wind / 12% precip / Open,47.2,7.9,12,0.350,0.376,0.502,0.406,final,Final,Final,"Final — WSH 8, PIT 7",8,7,Partial,rotowire_missing,44.64,55.36,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Probables Griffin (WSH) and Ashcraft (PIT) look like swing/spot roles without big separator stuff. PNC is slightly pitcher-friendly; Pirates get a small home edge but the price is close to fair.,not_scored
2026-04-16,SF,CIN,12:40 PM,Landen Roupp,Chase Burns,128,-148,,,,58F / 13 mph wind / 5% precip / Open,58.1,12.7,5,0.401,0.406,0.444,0.442,final,Final,Final,"Final — SF 3, CIN 0",3,0,Partial,rotowire_missing,42.36,57.64,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium-High,"Burns at home brings premium velocity; Roupp works contact and weak barrels. GABP raises HR/TB volatility — lean Reds, but mostly a props/team-total environment.",not_scored
2026-04-16,KC,DET,1:10 PM,Kris Bubic,Keider Montero,108,-124,,,,44F / 12 mph wind / 4% precip / Open,43.9,12.2,4,0.354,0.462,0.399,0.491,final,Final,Final,"Final — KC 9, DET 10",9,10,Partial,rotowire_missing,46.48,53.52,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Bubic vs Montero is young-starter volatility; Comerica trims some extra-base noise. Slight DET home lean without a commanding pitching edge.,not_scored
2026-04-16,LAA,NYY,1:35 PM,Brent Suter,Max Fried,205,-245,,,,47F / 8 mph wind / 13% precip / Open,46.6,7.7,13,0.356,0.385,0.448,0.512,final,Final,Final,"Final — LAA 11, NYY 4",11,4,Partial,rotowire_missing,31.59,68.41,,,,,,,,not_scored,,not_scored,rotowire_missing,High,Suter vs Fried is a massive talent mismatch; short porch amplifies fly-ball damage. Market already prices a big NYY edge — PASS on ML unless you have a materially better number.,not_scored
2026-04-16,TOR,MIL,1:40 PM,Patrick Corbin,Brandon Sproat,-102,-108,,,,dome / mild,,,,0.418,0.398,0.485,0.393,final,Final,Final,"Final — TOR 1, MIL 2",1,2,Partial,rotowire_missing,49.30,50.70,,,,,,,,not_scored,,not_scored,rotowire_missing,Low,"Corbin vs Sproat is command volatility on both sides; Milwaukee navigation is a hair better at home, but this is effectively a coin flip for betting.",not_scored
2026-04-16,TB,CWS,2:10 PM,Steven Matz,Jordan Leasure,-142,124,,,,62F / clear,,,,0.304,0.378,0.513,0.452,final,Final,Final,"Final — TB 5, CWS 3",5,3,Partial,rotowire_missing,56.79,43.21,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Matz’s LHP shape matters against Chicago’s lefty bats; Leasure stretched as a starter adds volatility. Rays are the cleaner roster spot — edge is modest.,not_scored
2026-04-16,TEX,ATH,3:05 PM,Jack Leiter,Jacob Lopez,-118,108,,,,76F / 6 mph wind / 0% precip / Open,75.8,6.4,0,0.437,0.384,0.435,0.470,final,Final,Final,"Final — TEX 9, ATH 6",9,6,Partial,rotowire_missing,52.96,47.04,,,,,,,,not_scored,,not_scored,rotowire_missing,Low,"Leiter vs Lopez profiles as short-leash, high-volatility. No compelling gap vs a tight market without a better posted price.",not_scored
2026-04-16,BAL,CLE,6:10 PM,Shane Baz,Parker Messick,-128,118,,,,44F / 13 mph wind / 16% precip / Open,43.6,13.2,16,0.394,0.366,0.495,0.537,final,Final,Final,"Final — BAL 2, CLE 4",2,4,Partial,rotowire_missing,55.03,44.97,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Baz’s stuff plays when the heater is elevated; Messick needs to limit barrels. Small lean to Baltimore’s lineup ceiling if Baz holds a normal starter workload.,not_scored
2026-04-16,COL,HOU,8:10 PM,Juan Mejia,Ryan Weiss,240,-290,,,,65F / 4 mph wind / 0% precip / Retractable,65.4,4.2,0,0.414,0.334,0.491,0.530,final,Final,Final,"Final — COL 3, HOU 2",3,2,Partial,rotowire_missing,28.34,71.66,,,,,,,,not_scored,,not_scored,rotowire_missing,High,Road Rockies vs Houston’s overall talent is a steep mismatch; Crawford Boxes pull-side HRs matter. Chalk is heavy — PASS unless you model innings/hooks differently.,not_scored
2026-04-16,SEA,SD,8:40 PM,Luis Castillo,Walker Buehler,-104,-112,,,,71F / 8 mph wind / 0% precip / Open,71.2,7.8,0,0.433,0.524,0.446,0.591,final,Final,Final,"Final — SEA 2, SD 5",2,5,Partial,rotowire_missing,49.11,50.89,,,,,,,,not_scored,,not_scored,rotowire_missing,Medium,Castillo vs Buehler is a true ace duel; Petco suppresses offense. Side market is rightfully tight — prefer game props over ML.,not_scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-16,WSH@PIT,WSH,James Wood,Braxton Ashcraft,,,,,NA,,,,,0.866,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,WSH,Luis García Jr.,Braxton Ashcraft,,,,,NA,,,,,0.518,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,WSH,Brady House,Braxton Ashcraft,,,,,NA,,,,,0.413,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,WSH,Daylen Lile,Braxton Ashcraft,,,,,NA,,,,,0.263,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,WSH,CJ Abrams,Braxton Ashcraft,,,,,NA,,,,,0.950,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,WSH,Jacob Young,Braxton Ashcraft,,,,,NA,,,,,0.548,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,WSH,Jorbit Vivas,Braxton Ashcraft,,,,,NA,,,,,0.486,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,WSH,Drew Millas,Braxton Ashcraft,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,WSH,Nasim Nuñez,Braxton Ashcraft,,,,,NA,,,,,0.291,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Jake Mangum,Foster Griffin,,,,,NA,,,,,0.401,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Nick Gonzales,Foster Griffin,,,,,NA,,,,,0.248,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Oneil Cruz,Foster Griffin,,,,,NA,,,,,0.638,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Marcell Ozuna,Foster Griffin,,,,,NA,,,,,0.236,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Nick Yorke,Foster Griffin,,,,,NA,,,,,0.449,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Brandon Lowe,Foster Griffin,,,,,NA,,,,,0.685,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Joey Bart,Foster Griffin,,,,,NA,,,,,0.380,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Konnor Griffin,Foster Griffin,,,,,NA,,,,,0.308,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,WSH@PIT,PIT,Billy Cook,Foster Griffin,,,,,NA,,,,,0.308,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Luis Arraez,Chase Burns,,,,,NA,,,,,0.543,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Willy Adames,Chase Burns,,,,,NA,,,,,0.664,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Rafael Devers,Chase Burns,,,,,NA,,,,,0.458,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Matt Chapman,Chase Burns,,,,,NA,,,,,0.494,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Jung Hoo Lee,Chase Burns,,,,,NA,,,,,0.444,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Will Brennan,Chase Burns,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Casey Schmitt,Chase Burns,,,,,NA,,,,,0.842,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Drew Gilbert,Chase Burns,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,SF,Patrick Bailey,Chase Burns,,,,,NA,,,,,0.189,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,TJ Friedl,Landen Roupp,,,,,NA,,,,,0.279,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,Matt McLain,Landen Roupp,,,,,NA,,,,,0.353,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,Elly De La Cruz,Landen Roupp,,,,,NA,,,,,0.810,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,Sal Stewart,Landen Roupp,,,,,NA,,,,,0.802,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,Eugenio Suárez,Landen Roupp,,,,,NA,,,,,0.486,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,Spencer Steer,Landen Roupp,,,,,NA,,,,,0.695,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,Rece Hinds,Landen Roupp,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,Ke'Bryan Hayes,Landen Roupp,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SF@CIN,CIN,P.J. Higgins,Landen Roupp,,,,,NA,,,,,0.191,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Maikel Garcia,Keider Montero,,,,,NA,,,,,0.574,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Bobby Witt Jr.,Keider Montero,,,,,NA,,,,,0.403,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Vinnie Pasquantino,Keider Montero,,,,,NA,,,,,0.225,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Salvador Perez,Keider Montero,,,,,NA,,,,,0.271,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Carter Jensen,Keider Montero,,,,,NA,,,,,0.698,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Jonathan India,Keider Montero,,,,,NA,,,,,0.399,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Jac Caglianone,Keider Montero,,,,,NA,,,,,0.427,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Michael Massey,Keider Montero,,,,,NA,,,,,0.292,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,KC,Kyle Isbel,Keider Montero,,,,,NA,,,,,0.305,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Gleyber Torres,Kris Bubic,,,,,NA,,,,,0.441,13,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Kevin McGonigle,Kris Bubic,,,,,NA,,,,,0.574,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Jahmai Jones,Kris Bubic,,,,,NA,,,,,0.180,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Dillon Dingler,Kris Bubic,,,,,NA,,,,,0.601,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Riley Greene,Kris Bubic,,,,,NA,,,,,0.479,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Matt Vierling,Kris Bubic,,,,,NA,,,,,0.556,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Spencer Torkelson,Kris Bubic,,,,,NA,,,,,0.399,10,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Wenceel Pérez,Kris Bubic,,,,,NA,,,,,0.475,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,KC@DET,DET,Javier Báez,Kris Bubic,,,,,NA,,,,,0.710,14,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Zach Neto,Max Fried,,,,,NA,,,,,0.626,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Mike Trout,Max Fried,,,,,NA,,,,,0.719,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Jo Adell,Max Fried,,,,,NA,,,,,0.592,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Oswald Peraza,Max Fried,,,,,NA,,,,,0.610,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Vaughn Grissom,Max Fried,,,,,NA,,,,,0.441,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Nolan Schanuel,Max Fried,,,,,NA,,,,,0.276,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Travis d'Arnaud,Max Fried,,,,,NA,,,,,0.180,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Josh Lowe,Max Fried,,,,,NA,,,,,0.390,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,LAA,Bryce Teodosio,Max Fried,,,,,NA,,,,,0.200,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,Trent Grisham,Brent Suter,,,,,NA,,,,,0.454,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,Aaron Judge,Brent Suter,,,,,NA,,,,,0.866,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,Cody Bellinger,Brent Suter,,,,,NA,,,,,0.430,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,Giancarlo Stanton,Brent Suter,,,,,NA,,,,,0.262,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,Ben Rice,Brent Suter,,,,,NA,,,,,0.805,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,Amed Rosario,Brent Suter,,,,,NA,,,,,0.871,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,Jazz Chisholm Jr.,Brent Suter,,,,,NA,,,,,0.305,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,José Caballero,Brent Suter,,,,,NA,,,,,0.434,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,LAA@NYY,NYY,J.C. Escarra,Brent Suter,,,,,NA,,,,,0.180,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Davis Schneider,Brandon Sproat,,,,,NA,,,,,0.446,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Daulton Varsho,Brandon Sproat,,,,,NA,,,,,0.771,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Vladimir Guerrero Jr.,Brandon Sproat,,,,,NA,,,,,0.640,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Jesús Sánchez,Brandon Sproat,,,,,NA,,,,,0.472,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Lenyn Sosa,Brandon Sproat,,,,,NA,,,,,0.541,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Kazuma Okamoto,Brandon Sproat,,,,,NA,,,,,0.247,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Andrés Giménez,Brandon Sproat,,,,,NA,,,,,0.503,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Ernie Clement,Brandon Sproat,,,,,NA,,,,,0.376,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,TOR,Tyler Heineman,Brandon Sproat,,,,,NA,,,,,0.366,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,Brandon Lockridge,Patrick Corbin,,,,,NA,,,,,0.331,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,Brice Turang,Patrick Corbin,,,,,NA,,,,,0.616,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,William Contreras,Patrick Corbin,,,,,NA,,,,,0.611,10,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,Gary Sánchez,Patrick Corbin,,,,,NA,,,,,0.719,13,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,Luis Rengifo,Patrick Corbin,,,,,NA,,,,,0.235,15,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,Luis Matos,Patrick Corbin,,,,,NA,,,,,0.334,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,Greg Jones,Patrick Corbin,,,,,NA,,,,,,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,David Hamilton,Patrick Corbin,,,,,NA,,,,,0.335,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TOR@MIL,MIL,Joey Ortiz,Patrick Corbin,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Chandler Simpson,Jordan Leasure,,,,,NA,,,,,0.464,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Junior Caminero,Jordan Leasure,,,,,NA,,,,,0.619,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Cedric Mullins,Jordan Leasure,,,,,NA,,,,,0.427,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Yandy Díaz,Jordan Leasure,,,,,NA,,,,,0.633,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Ryan Vilade,Jordan Leasure,,,,,NA,,,,,0.562,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Ben Williamson,Jordan Leasure,,,,,NA,,,,,0.499,0,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Jonny DeLuca,Jordan Leasure,,,,,NA,,,,,0.525,0,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Nick Fortes,Jordan Leasure,,,,,NA,,,,,0.444,0,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,TB,Taylor Walls,Jordan Leasure,,,,,NA,,,,,0.450,0,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Miguel Vargas,Steven Matz,,,,,NA,,,,,0.270,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Chase Meidroth,Steven Matz,,,,,NA,,,,,0.310,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Munetaka Murakami,Steven Matz,,,,,NA,,,,,0.461,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Everson Pereira,Steven Matz,,,,,NA,,,,,0.950,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Edgar Quero,Steven Matz,,,,,NA,,,,,0.258,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Tanner Murray,Steven Matz,,,,,NA,,,,,0.548,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Andrew Benintendi,Steven Matz,,,,,NA,,,,,0.366,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Derek Hill,Steven Matz,,,,,NA,,,,,0.415,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TB@CWS,CWS,Sam Antonacci,Steven Matz,,,,,NA,,,,,0.491,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Brandon Nimmo,Jacob Lopez,,,,,NA,,,,,0.625,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Wyatt Langford,Jacob Lopez,,,,,NA,,,,,0.512,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Jake Burger,Jacob Lopez,,,,,NA,,,,,0.573,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Josh Jung,Jacob Lopez,,,,,NA,,,,,0.526,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Kyle Higashioka,Jacob Lopez,,,,,NA,,,,,0.813,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Andrew McCutchen,Jacob Lopez,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Sam Haggerty,Jacob Lopez,,,,,NA,,,,,0.180,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Josh Smith,Jacob Lopez,,,,,NA,,,,,0.223,7,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,TEX,Ezequiel Duran,Jacob Lopez,,,,,NA,,,,,0.279,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Jeff McNeil,Jack Leiter,,,,,NA,,,,,0.524,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Shea Langeliers,Jack Leiter,,,,,NA,,,,,0.498,13,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Nick Kurtz,Jack Leiter,,,,,NA,,,,,0.494,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Tyler Soderstrom,Jack Leiter,,,,,NA,,,,,0.606,13,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Jacob Wilson,Jack Leiter,,,,,NA,,,,,0.447,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Carlos Cortes,Jack Leiter,,,,,NA,,,,,0.568,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Lawrence Butler,Jack Leiter,,,,,NA,,,,,0.481,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Austin Wynns,Jack Leiter,,,,,NA,,,,,0.207,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,TEX@ATH,ATH,Darell Hernaiz,Jack Leiter,,,,,NA,,,,,0.405,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Taylor Ward,Parker Messick,,,,,NA,,,,,0.533,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Gunnar Henderson,Parker Messick,,,,,NA,,,,,0.771,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Pete Alonso,Parker Messick,,,,,NA,,,,,0.392,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Johnathan Rodríguez,Parker Messick,,,,,NA,,,,,0.233,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Samuel Basallo,Parker Messick,,,,,NA,,,,,0.486,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Jeremiah Jackson,Parker Messick,,,,,NA,,,,,0.944,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Coby Mayo,Parker Messick,,,,,NA,,,,,0.311,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Leody Taveras,Parker Messick,,,,,NA,,,,,0.516,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,BAL,Blaze Alexander,Parker Messick,,,,,NA,,,,,0.264,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,Steven Kwan,Shane Baz,,,,,NA,,,,,0.434,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,Chase DeLauter,Shane Baz,,,,,NA,,,,,0.546,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,José Ramírez,Shane Baz,,,,,NA,,,,,0.552,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,Kyle Manzardo,Shane Baz,,,,,NA,,,,,0.546,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,George Valera,Shane Baz,,,,,NA,,,,,0.708,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,Angel Martínez,Shane Baz,,,,,NA,,,,,0.723,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,Juan Brito,Shane Baz,,,,,NA,,,,,0.355,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,Austin Hedges,Shane Baz,,,,,NA,,,,,0.462,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,BAL@CLE,CLE,Brayan Rocchio,Shane Baz,,,,,NA,,,,,0.509,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,Edouard Julien,Ryan Weiss,,,,,NA,,,,,0.586,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,Tyler Freeman,Ryan Weiss,,,,,NA,,,,,0.301,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,TJ Rumfield,Ryan Weiss,,,,,NA,,,,,0.414,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,Hunter Goodman,Ryan Weiss,,,,,NA,,,,,0.578,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,Mickey Moniak,Ryan Weiss,,,,,NA,,,,,0.824,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,Ezequiel Tovar,Ryan Weiss,,,,,NA,,,,,0.388,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,Troy Johnston,Ryan Weiss,,,,,NA,,,,,0.561,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,Kyle Karros,Ryan Weiss,,,,,NA,,,,,0.320,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,COL,Brenton Doyle,Ryan Weiss,,,,,NA,,,,,0.444,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Jose Altuve,Juan Mejia,,,,,NA,,,,,0.427,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Yordan Alvarez,Juan Mejia,,,,,NA,,,,,0.833,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Isaac Paredes,Juan Mejia,,,,,NA,,,,,0.314,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Carlos Correa,Juan Mejia,,,,,NA,,,,,0.418,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Christian Walker,Juan Mejia,,,,,NA,,,,,0.781,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Joey Loperfido,Juan Mejia,,,,,NA,,,,,0.410,2,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Cam Smith,Juan Mejia,,,,,NA,,,,,0.681,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Taylor Trammell,Juan Mejia,,,,,NA,,,,,0.490,0,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,COL@HOU,HOU,Yainer Diaz,Juan Mejia,,,,,NA,,,,,0.420,1,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,Brendan Donovan,Walker Buehler,,,,,NA,,,,,0.450,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,Cal Raleigh,Walker Buehler,,,,,NA,,,,,0.396,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,Julio Rodríguez,Walker Buehler,,,,,NA,,,,,0.483,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,Josh Naylor,Walker Buehler,,,,,NA,,,,,0.411,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,Randy Arozarena,Walker Buehler,,,,,NA,,,,,0.561,6,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,Luke Raley,Walker Buehler,,,,,NA,,,,,0.706,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,J.P. Crawford,Walker Buehler,,,,,NA,,,,,0.361,9,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,Dominic Canzone,Walker Buehler,,,,,NA,,,,,0.278,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SEA,Cole Young,Walker Buehler,,,,,NA,,,,,0.370,4,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Ramón Laureano,Luis Castillo,,,,,NA,,,,,0.597,5,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Fernando Tatis Jr.,Luis Castillo,,,,,NA,,,,,0.367,12,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Jackson Merrill,Luis Castillo,,,,,NA,,,,,0.614,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Manny Machado,Luis Castillo,,,,,NA,,,,,0.479,21,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Xander Bogaerts,Luis Castillo,,,,,NA,,,,,0.757,8,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Gavin Sheets,Luis Castillo,,,,,NA,,,,,0.674,11,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Miguel Andujar,Luis Castillo,,,,,NA,,,,,0.646,109,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Luis Campusano,Luis Castillo,,,,,NA,,,,,0.892,3,,,,,,not_scored,not_scored,Display only,none,not_scored
2026-04-16,SEA@SD,SD,Jake Cronenworth,Luis Castillo,,,,,NA,,,,,0.296,13,,,,,,not_scored,not_scored,Display only,none,not_scored
<!-- batter-outlooks-csv:end -->
*/
