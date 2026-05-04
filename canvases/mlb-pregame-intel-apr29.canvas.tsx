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
    gameKey: "AZ@MIL",
    venue: "MLB Park",
    away: "AZ",
    home: "MIL",
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
    homeAmerican: -130,
    impliedAwayPct: 45.73,
    impliedHomePct: 54.27,
    modelAwayPct: 46.61,
    modelHomePct: 53.39,
    edgeAwayPct: 0.88,
    edgeHomePct: -0.88,
    prediction: "MIL",
    decisionTier: "D",
    edgeOnPickPct: -0.88,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Eduardo Rodriguez vs Brandon Sproat. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Geraldo Perdomo", "SS"],
      ["2", "Ketel Marte", "2B"],
      ["3", "Corbin Carroll", "RF"],
      ["4", "Adrian Del Castillo", "C"],
      ["5", "Ildemaro Vargas", "1B"],
      ["6", "Lourdes Gurriel Jr.", "LF"],
      ["7", "Nolan Arenado", "3B"],
      ["8", "Jose Fernandez", "DH"],
      ["9", "Alek Thomas", "CF"],
    ],
    homeLineup: [
      ["1", "Brandon Lockridge", "LF"],
      ["2", "Brice Turang", "2B"],
      ["3", "William Contreras", "C"],
      ["4", "Jake Bauers", "1B"],
      ["5", "Gary Sánchez", "DH"],
      ["6", "Luis Rengifo", "3B"],
      ["7", "Greg Jones", "RF"],
      ["8", "Blake Perkins", "CF"],
      ["9", "Joey Ortiz", "SS"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-29 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Geraldo Perdomo", team: "AZ", hrPct: 1.0, tb2Pct: 22.5, tier: "HR D / TB C", note: "LHB vs RHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Ketel Marte", team: "AZ", hrPct: 4.5, tb2Pct: 24.5, tier: "HR D / TB C", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Corbin Carroll", team: "AZ", hrPct: 5.3, tb2Pct: 30.7, tier: "HR D / TB B", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Adrian Del Castillo", team: "AZ", hrPct: 1.9, tb2Pct: 14.5, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Ildemaro Vargas", team: "AZ", hrPct: 10.3, tb2Pct: 44.1, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Lourdes Gurriel Jr.", team: "AZ", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Nolan Arenado", team: "AZ", hrPct: 3.5, tb2Pct: 25.8, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jose Fernandez", team: "AZ", hrPct: 4.6, tb2Pct: 28.8, tier: "HR D / TB B", note: "RHB vs RHP; hard-contact profile; vs vulnerable pitcher" },
      { batter: "Alek Thomas", team: "AZ", hrPct: 6.4, tb2Pct: 33.1, tier: "HR C / TB B", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher" },
    ],
    propsHome: [
      { batter: "Brandon Lockridge", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
      { batter: "Brice Turang", team: "MIL", hrPct: 6.7, tb2Pct: 31.9, tier: "HR C / TB B", note: "LHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "William Contreras", team: "MIL", hrPct: 2.3, tb2Pct: 19.3, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Jake Bauers", team: "MIL", hrPct: 6.5, tb2Pct: 31.9, tier: "HR C / TB B", note: "LHB vs LHP; above-average damage; vs vulnerable pitcher" },
      { batter: "Gary Sánchez", team: "MIL", hrPct: 7.6, tb2Pct: 31.5, tier: "HR C / TB B", note: "RHB vs LHP; elite power indicators; vs vulnerable pitcher" },
      { batter: "Luis Rengifo", team: "MIL", hrPct: 0.4, tb2Pct: 11.6, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Greg Jones", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Blake Perkins", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; contact-driven profile; vs vulnerable pitcher" },
      { batter: "Joey Ortiz", team: "MIL", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs LHP; limited power profile; vs vulnerable pitcher" },
    ],
  },
  {
    gameKey: "KC@ATH",
    venue: "MLB Park",
    away: "KC",
    home: "ATH",
    timeEt: "9:40 PM",
    gameStatusBucket: "pregame",
    gameState: "Yet To Begin",
    gameStateDetail: "Pre-Game",
    gameStatusNote: "Yet to begin",
    awayScore: null,
    homeScore: null,
    awaySp: "TBD",
    homeSp: "TBD",
    awayAmerican: 100,
    homeAmerican: -120,
    impliedAwayPct: 47.83,
    impliedHomePct: 52.17,
    modelAwayPct: 48.77,
    modelHomePct: 51.23,
    edgeAwayPct: 0.94,
    edgeHomePct: -0.94,
    prediction: "ATH",
    decisionTier: "D",
    edgeOnPickPct: -0.94,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "rotowire_hr_home_side_missing",
    rationale: "Auto-generated live scaffold from MLB schedule + market odds: Michael Wacha vs Luis Severino. Run compute to refresh lineups, weather, and model outputs before staking.",
    awayLuLabel: "Confirmed (MLB API + Multi-Source)",
    homeLuLabel: "Confirmed (MLB API + Multi-Source)",
    awayLineup: [
      ["1", "Maikel Garcia", "3B"],
      ["2", "Bobby Witt Jr.", "SS"],
      ["3", "Carter Jensen", "C"],
      ["4", "Salvador Perez", "1B"],
      ["5", "Michael Massey", "2B"],
      ["6", "Isaac Collins", "LF"],
      ["7", "Jac Caglianone", "DH"],
      ["8", "Lane Thomas", "RF"],
      ["9", "Kyle Isbel", "CF"],
    ],
    homeLineup: [
      ["1", "Nick Kurtz", "1B"],
      ["2", "Shea Langeliers", "C"],
      ["3", "Carlos Cortes", "LF"],
      ["4", "Brent Rooker", "DH"],
      ["5", "Jacob Wilson", "SS"],
      ["6", "Jeff McNeil", "2B"],
      ["7", "Zack Gelof", "CF"],
      ["8", "Lawrence Butler", "RF"],
      ["9", "Darell Hernaiz", "3B"],
    ],
    spAwayNotes: ["Auto-generated 2026-04-29 scaffold — run compute for live probable + stats."],
    spHomeNotes: ["Run compute for live probable, weather, and bullpen context."],
    matchupBullets: ["Live schedule scaffold: generated from MLB schedule + live odds before compute."],
    propsAway: [
      { batter: "Maikel Garcia", team: "KC", hrPct: 3.1, tb2Pct: 20.6, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 8.6, tb2Pct: 41.4, tier: "HR B / TB A", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Carter Jensen", team: "KC", hrPct: 8.8, tb2Pct: 35.4, tier: "HR B / TB A", note: "LHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Salvador Perez", team: "KC", hrPct: 6.0, tb2Pct: 25.4, tier: "HR C / TB C", note: "RHB vs RHP; above-average damage; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Michael Massey", team: "KC", hrPct: 4.7, tb2Pct: 26.8, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Isaac Collins", team: "KC", hrPct: 1.9, tb2Pct: 13.4, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jac Caglianone", team: "KC", hrPct: 9.4, tb2Pct: 38.1, tier: "HR B / TB A", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Lane Thomas", team: "KC", hrPct: 1.1, tb2Pct: 18.3, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Kyle Isbel", team: "KC", hrPct: 4.4, tb2Pct: 24.8, tier: "HR D / TB C", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
    ],
    propsHome: [
      { batter: "Nick Kurtz", team: "ATH", hrPct: 12.2, tb2Pct: 46.2, tier: "HR A / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Shea Langeliers", team: "ATH", hrPct: 10.9, tb2Pct: 45.4, tier: "HR A / TB A+", note: "RHB vs RHP; elite power indicators; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Carlos Cortes", team: "ATH", hrPct: 14.3, tb2Pct: 55.0, tier: "HR A+ / TB A+", note: "LHB vs RHP; elite power indicators; vs vulnerable pitcher; priced lean: 2+ TB (A+); HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Brent Rooker", team: "ATH", hrPct: 0.4, tb2Pct: 6.0, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jacob Wilson", team: "ATH", hrPct: 1.4, tb2Pct: 20.1, tier: "HR D / TB D", note: "RHB vs RHP; limited power profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Jeff McNeil", team: "ATH", hrPct: 1.3, tb2Pct: 20.6, tier: "HR D / TB D", note: "LHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Zack Gelof", team: "ATH", hrPct: 4.1, tb2Pct: 24.5, tier: "HR D / TB C", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Lawrence Butler", team: "ATH", hrPct: 1.6, tb2Pct: 13.4, tier: "HR D / TB D", note: "LHB vs RHP; hard-contact profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
      { batter: "Darell Hernaiz", team: "ATH", hrPct: 2.4, tb2Pct: 15.8, tier: "HR D / TB D", note: "RHB vs RHP; contact-driven profile; vs vulnerable pitcher; HR market partial via rotowire_only, HR tier downgraded" },
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

export default function Apr29Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const { bestBets, passList } = deriveSummaryBoard(SLATE);

  return (
    <Stack gap={20} style={{ maxWidth: 1120 }}>
      <H1>Black Sheep — MLB Pregame Intel (Apr 29, 2026)</H1>
      <Text tone="secondary" size="small">
        Dashboard + export pipeline. Probables and posted lineups from MLB Stats API where available; late games show
        projected orders from active roster (confirm at lock). Game moneylines are approximate modeling inputs (not live
        scraped). Regenerate CSV/HTML: python canvases/exports/build_ml_exports.py --date 2026-04-29
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
2026-04-29,AZ,MIL,7:40 PM,Eduardo Rodriguez,Brandon Sproat,110,-130,8.5,-110,-110,44F / 3 mph wind / 6% precip / Retractable,43.7,3.1,6,0.430,0.466,0.607,0.350,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Verified,,45.73,54.27,54.57,45.43,46.61,53.39,0.10,46.61,53.39,0.88,-0.88,MIL,D,-0.88,Medium,,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Eduardo Rodriguez vs Brandon Sproat. Run compute to refresh lineups, weather, and model outputs before staking.",scored
2026-04-29,KC,ATH,9:40 PM,Michael Wacha,Luis Severino,100,-120,9.5,-110,-110,74F / 9 mph wind / 0% precip / Open,74.0,9.4,0,0.311,0.428,0.557,0.569,pregame,Yet To Begin,Pre-Game,Yet to begin,,,Partial,rotowire_hr_home_side_missing,47.83,52.17,57.26,42.74,48.77,51.23,0.10,48.77,51.23,0.94,-0.94,ATH,D,-0.94,Medium,rotowire_hr_home_side_missing,Medium,"Auto-generated live scaffold from MLB schedule + market odds: Michael Wacha vs Luis Severino. Run compute to refresh lineups, weather, and model outputs before staking.",scored
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,market_tb_line,market_tb_over_american,edge_tb_pct,recent_form_score,bvp_pa,tier,hr_tier,tb2_tier,recommended_prop,recommended_tier,hr_market_status,hr_market_integrity,tb2_market_status,data_confidence,market_data_status,scoring_status
2026-04-29,AZ@MIL,AZ,Geraldo Perdomo,Brandon Sproat,1.04,22.48,+9515,+345,960,-8.39,1.5,148,-17.84,0.734,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,AZ,Ketel Marte,Brandon Sproat,4.45,24.46,+2145,+309,397,-15.67,1.5,115,-22.05,0.366,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,AZ,Corbin Carroll,Brandon Sproat,5.34,30.66,+1772,+226,461,-12.48,1.5,119,-15.00,0.573,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,AZ,Adrian Del Castillo,Brandon Sproat,1.91,14.49,+5149,+590,548,-13.53,1.5,170,-22.55,0.394,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,AZ,Ildemaro Vargas,Brandon Sproat,10.26,44.07,+875,+127,910,0.35,1.5,154,4.70,0.944,0,A+,A,A+,,,priced_below_gate,full,priced_below_prob_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,AZ,Lourdes Gurriel Jr.,Brandon Sproat,0.40,6.00,+24900,+1567,790,-10.84,1.5,145,-34.82,0.180,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,AZ,Nolan Arenado,Brandon Sproat,3.45,25.84,+2795,+287,780,-7.91,1.5,182,-9.62,0.842,0,C,D,C,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,AZ,Jose Fernandez,Brandon Sproat,4.61,28.79,+2067,+247,870,-5.70,1.5,198,-4.76,0.592,0,B,D,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,AZ,Alek Thomas,Brandon Sproat,6.44,33.14,+1452,+202,790,-4.79,1.5,202,0.03,0.839,0,B,C,B,,,priced_no_edge,full,priced_below_prob_gate,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,Brandon Lockridge,Eduardo Rodriguez,0.40,6.00,+24900,+1567,1020,-8.53,1.5,150,-34.00,0.350,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,Brice Turang,Eduardo Rodriguez,6.74,31.89,+1384,+214,780,-4.63,1.5,140,-9.77,0.436,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,William Contreras,Eduardo Rodriguez,2.30,19.28,+4242,+419,549,-13.11,1.5,122,-25.76,0.356,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,Jake Bauers,Eduardo Rodriguez,6.46,31.91,+1447,+213,529,-9.43,1.5,143,-9.24,0.438,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,Gary Sánchez,Eduardo Rodriguez,7.61,31.51,+1214,+217,366,-13.85,1.5,148,-8.82,0.429,0,B,C,B,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,Luis Rengifo,Eduardo Rodriguez,0.40,11.59,+24900,+763,790,-10.84,1.5,148,-28.73,0.392,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,Greg Jones,Eduardo Rodriguez,0.40,6.00,+24900,+1567,690,-12.26,1.5,196,-27.78,0.180,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,Blake Perkins,Eduardo Rodriguez,0.40,6.00,+24900,+1567,830,-10.35,1.5,215,-25.75,0.256,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,AZ@MIL,MIL,Joey Ortiz,Eduardo Rodriguez,0.40,6.00,+24900,+1567,1200,-7.29,1.5,211,-26.15,0.312,0,D,D,D,,,priced_no_edge,full,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched",full,scored
2026-04-29,KC@ATH,KC,Maikel Garcia,Luis Severino,3.11,20.62,+3116,+385,768,-8.41,1.5,105,-28.16,0.353,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,KC,Bobby Witt Jr.,Luis Severino,8.57,41.38,+1066,+142,365,-12.93,1.5,-130,-15.14,0.692,0,A,B,A,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,KC,Carter Jensen,Luis Severino,8.77,35.43,+1040,+182,322,-14.93,1.5,110,-12.19,0.661,0,A,B,A,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,KC,Salvador Perez,Luis Severino,5.99,25.42,+1569,+293,395,-14.21,1.5,104,-23.60,0.559,0,C,C,C,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,KC,Michael Massey,Luis Severino,4.74,26.85,+2009,+272,500,-11.92,1.5,140,-14.82,0.534,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,KC,Isaac Collins,Luis Severino,1.87,13.45,+5260,+644,795,-9.31,1.5,164,-24.43,0.465,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,KC,Jac Caglianone,Luis Severino,9.38,38.06,+966,+163,445,-8.97,1.5,130,-5.42,0.658,0,A,B,A,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,KC,Lane Thomas,Luis Severino,1.13,18.33,+8738,+446,840,-9.51,1.5,178,-17.65,0.567,0,D,D,D,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,KC,Kyle Isbel,Luis Severino,4.37,24.77,+2190,+304,850,-6.16,1.5,178,-11.20,0.527,0,C,D,C,,,priced_no_edge,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, live markets matched — HR market partial via rotowire_only",full,scored
2026-04-29,KC@ATH,ATH,Nick Kurtz,Michael Wacha,12.21,46.24,+719,+116,NA,,1.5,104,-2.78,0.751,0,A+,A,A+,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-29,KC@ATH,ATH,Shea Langeliers,Michael Wacha,10.89,45.40,+818,+120,NA,,1.5,-112,-7.43,0.736,0,A+,A,A+,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-29,KC@ATH,ATH,Carlos Cortes,Michael Wacha,14.29,55.00,+600,-122,NA,,1.5,112,7.83,0.950,0,A+,A+,A+,2+ TB,A+,unpriced,partial,qualified,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-29,KC@ATH,ATH,Brent Rooker,Michael Wacha,0.40,6.00,+24900,+1567,NA,,1.5,114,-40.73,0.180,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-29,KC@ATH,ATH,Jacob Wilson,Michael Wacha,1.42,20.15,+6930,+396,NA,,1.5,107,-28.16,0.601,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-29,KC@ATH,ATH,Jeff McNeil,Michael Wacha,1.33,20.59,+7428,+386,NA,,1.5,140,-21.08,0.512,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-29,KC@ATH,ATH,Zack Gelof,Michael Wacha,4.06,24.46,+2366,+309,NA,,1.5,157,-14.45,0.554,0,C,D,C,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-29,KC@ATH,ATH,Lawrence Butler,Michael Wacha,1.56,13.37,+6291,+648,NA,,1.5,164,-24.51,0.291,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
2026-04-29,KC@ATH,ATH,Darell Hernaiz,Michael Wacha,2.41,15.84,+4046,+531,NA,,1.5,174,-20.65,0.546,0,D,D,D,,,unpriced,partial,priced_no_edge,"High — stats+savant+recent; BvP disabled, confirmed lineup, limited or misaligned live markets — HR market partial via rotowire_only",partial,scored
<!-- batter-outlooks-csv:end -->
*/
