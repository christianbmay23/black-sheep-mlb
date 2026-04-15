import {
  Card, CardBody, CardHeader,
  Divider, Grid, H1, H2, H3,
  Pill, Row, Stack, Stat, Table, Text,
} from "cursor/canvas";

/** Odds API / book snapshot: [away American, home American]. Synthetic pairs when only anchor printed. */
const BOOK_AMERICAN: Record<string, [number, number]> = {
  "CHC@PHI": [128, -140],
  "KC@DET": [115, -130],
  "SF@CIN": [-110, 102],
  "WSH@PIT": [152, -180],
  "LAA@NYY": [158, -190],
  "MIA@ATL": [140, -166],
  "TB@CWS": [-112, 102],
  "TOR@MIL": [-122, 104],
  "COL@HOU": [168, -190],
  "SEA@SD": [-108, 100],
  "TEX@ATH": [108, -120],
  "NYM@LAD": [164, -192],
};

function gameKey(away: string, home: string): string {
  return `${away}@${home}`;
}

function americanToImplied(a: number): number {
  if (a > 0) return 100 / (a + 100);
  return Math.abs(a) / (Math.abs(a) + 100);
}

function devigTwoWay(awayA: number, homeA: number): { away: number; home: number } {
  const ia = americanToImplied(awayA);
  const ih = americanToImplied(homeA);
  const s = ia + ih;
  if (s <= 0) return { away: 0.5, home: 0.5 };
  return { away: ia / s, home: ih / s };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function parseXERA(profile: string[][]): number | null {
  for (const row of profile) {
    const k = row[0];
    const v = row[1];
    if (v.includes("/")) {
      const m = v.match(/\/\s*([\d.]+)/);
      if (m) return parseFloat(m[1]);
    }
    if (k.includes("xERA") && !v.includes("/")) {
      const m2 = v.match(/([\d.]+)/);
      if (m2) return parseFloat(m2[1]);
    }
  }
  return null;
}

function starterScore(xera: number | null): number {
  if (xera == null || Number.isNaN(xera)) return 0.5;
  return clamp((4.85 - xera) / 2.85, 0, 1);
}

function lineupScore(rows: string[][]): number {
  if (!rows.length) return 0.44;
  let acc = 0;
  let n = 0;
  for (const row of rows) {
    const brl = row[6];
    if (brl && brl !== "—" && /^\d+$/.test(brl)) {
      acc += parseInt(brl, 10) / 100;
      n += 1;
    }
    const xw = row[3]?.replace(/[^\d.]/g, "") ?? "";
    if (xw) {
      const x = parseFloat(xw);
      if (!Number.isNaN(x)) {
        acc += clamp((x - 0.28) / 0.22, 0, 1);
        n += 1;
      }
    }
  }
  return n ? clamp(acc / n, 0.18, 0.95) : 0.44;
}

function parkSplit(weather: string, runEnv: string): { away: number; home: number } {
  let mid = 0.5;
  if (weather.toLowerCase().includes("dome")) mid = 0.52;
  if (runEnv === "High") mid = 0.54;
  if (runEnv === "Low" || runEnv === "Low-Medium") mid = 0.47;
  return { away: mid - 0.012, home: mid + 0.012 };
}

function varianceScore(profile: string[][]): number {
  const blob = JSON.stringify(profile);
  if (blob.includes("No Savant") || blob.includes("UNVERIFIED")) return 0.38;
  if (blob.includes("17 PA") || blob.includes("tiny sample") || blob.includes("36 PA")) return 0.4;
  return 0.52;
}

type ModelConf = "Low" | "Medium" | "High";

function winProbabilityModel(g: Game): {
  pAway: number;
  pHome: number;
  modelConf: ModelConf;
  missingFlags: string[];
} {
  const xa = parseXERA(g.awaySPProfile);
  const xh = parseXERA(g.homeSPProfile);
  const miss: string[] = [];
  if (xa == null) miss.push("away SP xERA");
  if (xh == null) miss.push("home SP xERA");
  if (!g.awayLineup.length) miss.push("away LU");
  if (!g.homeLineup.length) miss.push("home LU");
  const sA =
    0.4 * starterScore(xa) +
    0.2 * 0.5 +
    0.25 * lineupScore(g.awayLineup) +
    0.1 * parkSplit(g.weather, g.runEnv).away +
    0.05 * varianceScore(g.awaySPProfile);
  const sH =
    0.4 * starterScore(xh) +
    0.2 * 0.5 +
    0.25 * lineupScore(g.homeLineup) +
    0.1 * parkSplit(g.weather, g.runEnv).home +
    0.05 * varianceScore(g.homeSPProfile);
  const d = sH - sA;
  const pHome = 1 / (1 + Math.exp(-3.1 * d));
  const pAway = 1 - pHome;
  let modelConf: ModelConf = "Medium";
  if (miss.length >= 2) modelConf = "Low";
  else if (miss.length === 0 && g.awayLineup.length && g.homeLineup.length) modelConf = "High";
  return { pAway, pHome, modelConf, missingFlags: miss };
}

function tierFromEdge(edgePct: number): "A+" | "A" | "B" | "C" | "D" {
  if (edgePct >= 8) return "A+";
  if (edgePct >= 5) return "A";
  if (edgePct >= 2) return "B";
  if (edgePct > 0) return "C";
  return "D";
}

function probToAmerican(p: number): string {
  if (p <= 0.001 || p >= 0.999 || Number.isNaN(p)) return "—";
  if (p >= 0.5) {
    const m = -Math.round((p / (1 - p)) * 100);
    return String(m);
  }
  return `+${Math.round(((1 - p) / p) * 100)}`;
}

/** First initial + last name so R. Acuña Jr. ≠ L. Acuna (same surname). */
function lineupMatchKey(name: string): string {
  const stripped = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const parts = stripped.split(/\s+/).filter((p) => !/^jr\.?$/i.test(p) && !/^sr\.?$/i.test(p));
  if (parts.length >= 2) {
    const first = parts[0].replace(/[^A-Za-z]/g, "").charAt(0).toLowerCase();
    const last = parts[parts.length - 1].replace(/\./g, "").toLowerCase();
    return `${first}-${last}`;
  }
  const last = (parts[0] ?? stripped).replace(/\./g, "").trim().toLowerCase();
  return last;
}

function findLineupRow(lineup: string[][], name: string): string[] | null {
  const want = lineupMatchKey(name);
  return (
    lineup.find((r) => {
      const cell = r[1] ?? "";
      return cell === name || lineupMatchKey(cell) === want;
    }) ?? null
  );
}

function parseXslg(line: string[] | undefined): number | null {
  if (!line) return null;
  const raw = line[4] ?? "";
  const x = parseFloat(raw.replace(/[^\d.]/g, ""));
  return Number.isNaN(x) ? null : x;
}

function parseBrl(line: string[] | undefined): number | null {
  if (!line) return null;
  const brl = line[6];
  if (!brl || brl === "—" || !/^\d+$/.test(brl)) return null;
  return parseInt(brl, 10) / 100;
}

function intrinsicTierHr(hr: number): "A+" | "A" | "B" | "C" | "D" {
  if (hr >= 0.132) return "A+";
  if (hr >= 0.102) return "A";
  if (hr >= 0.078) return "B";
  if (hr >= 0.058) return "C";
  return "D";
}

function intrinsicTier2tb(p: number): "A+" | "A" | "B" | "C" | "D" {
  if (p >= 0.38) return "A+";
  if (p >= 0.32) return "A";
  if (p >= 0.26) return "B";
  if (p >= 0.2) return "C";
  return "D";
}

function batterHrTwoTb(
  g: Game,
  teamIsAway: boolean,
  batter: string,
  oppXera: number | null,
): {
  hr: number;
  tb2: number;
  fairHr: string;
  fair2tb: string;
  tier: "A+" | "A" | "B" | "C" | "D";
  conf: ModelConf;
  marketHr: string;
  edgeHrPct: string;
} {
  const lu = teamIsAway ? g.awayLineup : g.homeLineup;
  const row = findLineupRow(lu, batter);
  const brl = parseBrl(row ?? undefined);
  const xslg = parseXslg(row ?? undefined);
  const park =
    g.home === "COL" || g.away === "COL"
      ? 1.12
      : g.home === "NYY" || g.away === "NYY"
        ? 1.04
        : g.home === "CIN" || g.away === "CIN"
          ? 1.06
          : 1.0;
  let miss = 0;
  if (brl == null) miss += 1;
  if (xslg == null) miss += 1;
  if (oppXera == null) miss += 1;
  const baseHr = 0.028;
  const brlAdj = brl != null ? (brl - 0.52) * 0.09 : -0.006;
  const xslgAdj = xslg != null ? clamp((xslg - 0.4) * 0.1, -0.02, 0.09) : -0.004;
  const pitAdj = oppXera != null ? clamp((oppXera - 4.15) * 0.009, -0.018, 0.028) : 0;
  const hr = clamp(baseHr + brlAdj + xslgAdj + pitAdj + (park - 1) * 0.022, 0.006, 0.24);
  const base2 = 0.2;
  const tb2 = clamp(
    base2 +
      (brl != null ? (brl - 0.5) * 0.16 : 0) +
      (xslg != null ? (xslg - 0.38) * 0.18 : 0) +
      pitAdj * 0.6,
    0.07,
    0.52,
  );
  const fairHr = probToAmerican(hr);
  const fair2 = probToAmerican(tb2);
  const tierHr = intrinsicTierHr(hr);
  const tier2 = intrinsicTier2tb(tb2);
  const rank = (x: "A+" | "A" | "B" | "C" | "D") =>
    ({ "A+": 5, A: 4, B: 3, C: 2, D: 1 }[x]);
  const tier = rank(tierHr) >= rank(tier2) ? tierHr : tier2;
  let conf: ModelConf = "Medium";
  if (miss >= 2) conf = "Low";
  if (miss === 0 && row) conf = "High";
  return { hr, tb2, fairHr, fair2tb: fair2, tier, conf, marketHr: "—", edgeHrPct: "—" };
}

type Game = {
  away: string; home: string; time: string;
  awaySP: string; homeSP: string; spStatus: string;
  awayLuStatus: string; homeLuStatus: string;
  line: string; total: string; weather: string;
  prediction: string; runEnv: string; confidence: string;
  whyPrediction: string;
  awaySPProfile: string[][]; homeSPProfile: string[][];
  awayLineup: string[][]; homeLineup: string[][];
  awayTopMatchups: string[][]; homeTopMatchups: string[][];
  awayBatterOutlooks: string[][]; homeBatterOutlooks: string[][];
  awaySPOutlook: string[][]; homeSPOutlook: string[][];
  bestAngle: string; bestBatter: string; bestProp: string;
  biggestRisk: string; gameConf: string;
};

const GAMES: Game[] = [
  {
    away:"CHC",home:"PHI",time:"6:40 PM",awaySP:"Shota Imanaga",homeSP:"Jesus Luzardo",spStatus:"Strongly Corroborated",
    awayLuStatus:"Projected",homeLuStatus:"Projected",
    line:"PHI -140",total:"9.0",weather:"89F / wind 10mph Out",
    prediction:"PHI",runEnv:"Medium-High",confidence:"Low",
    whyPrediction:"Luzardo xERA (2.82) far better than surface ERA (6.23) — elite whiff/chase profile. Imanaga strong but lower velo limits ceiling. Hot weather + wind out elevates total. Lineups projected, not confirmed.",
    awaySPProfile:[
      ["ERA / xERA","2.81 / 2.71"],["xwOBA allowed",".265"],["K%tile","88"],["Whiff%tile","66"],["Chase%tile","97"],
      ["Top pitch","Splitter 35.4% (37.5% whiff)"],["Weakness","Low FB velo (16th %tile)"]
    ],
    homeSPProfile:[
      ["ERA / xERA","6.23 / 2.82"],["xwOBA allowed",".270"],["K%tile","95"],["Whiff%tile","94"],["Chase%tile","95"],
      ["Top pitch","Sweeper 38% (51.4% whiff)"],["Strength","Elite swing-miss on 3 pitches"]
    ],
    awayLineup:[],homeLineup:[],
    awayTopMatchups:[["Lineups not confirmed","—","—"]],
    homeTopMatchups:[["Lineups not confirmed","—","—"]],
    awayBatterOutlooks:[["Lineups projected — no outlooks","—","—","—","—"]],
    homeBatterOutlooks:[["Lineups projected — no outlooks","—","—","—","—"]],
    awaySPOutlook:[["Imanaga","Moderate (5-6)","High","Low","LEAN — elite chase rate but low velo"]],
    homeSPOutlook:[["Luzardo","Strong (6-7)","High","Moderate","LEAN — 94th %tile whiff despite rough ERA"]],
    bestAngle:"PHI ML at -140 (Luzardo xERA regression play) — LEAN",
    bestBatter:"Waiting for lineups",bestProp:"Luzardo Ks Over — WATCHLIST",
    biggestRisk:"Both lineups unconfirmed",gameConf:"Low"
  },
  {
    away:"KC",home:"DET",time:"6:40 PM",awaySP:"Seth Lugo",homeSP:"Jack Flaherty",spStatus:"Strongly Corroborated",
    awayLuStatus:"Projected",homeLuStatus:"Projected",
    line:"DET -130",total:"8.5",weather:"66F / wind 12mph R-L",
    prediction:"KC",runEnv:"Medium",confidence:"Low",
    whyPrediction:"Lugo surface ERA (1.53) masks xERA (4.89) regression risk, but Flaherty's profile is worse across the board (xERA 6.65, 6th %tile hard-hit suppression, 7th %tile chase). Market prices DET as favorite — potential value on KC if lineups confirm.",
    awaySPProfile:[
      ["ERA / xERA","1.53 / 4.89"],["xwOBA allowed",".348"],["K%tile","40"],["Whiff%tile","22"],["Chase%tile","37"],
      ["Top pitch","Curveball 20.2% (21.4% whiff)"],["Risk","Regression candidate — lucky BABIP"]
    ],
    homeSPProfile:[
      ["ERA / xERA","5.14 / 6.65"],["xwOBA allowed",".396"],["K%tile","44"],["Whiff%tile","33"],["Chase%tile","7"],
      ["Top pitch","Fastball 46.2% (20% whiff)"],["Weakness","Worst chase rate on slate (7th %tile)"]
    ],
    awayLineup:[],homeLineup:[],
    awayTopMatchups:[["Lineups not confirmed","—","—"]],
    homeTopMatchups:[["Lineups not confirmed","—","—"]],
    awayBatterOutlooks:[["Lineups projected — no outlooks","—","—","—","—"]],
    homeBatterOutlooks:[["Lineups projected — no outlooks","—","—","—","—"]],
    awaySPOutlook:[["Lugo","Low-Moderate (4-5)","Moderate","Medium-High","INFO — regression xERA"]],
    homeSPOutlook:[["Flaherty","Low-Moderate (4-5)","Moderate","High","INFO — very hittable profile"]],
    bestAngle:"KC ML +112 — WATCHLIST (needs lineup confirmation)",
    bestBatter:"Waiting for lineups",bestProp:"Flaherty ER Over — WATCHLIST",
    biggestRisk:"Both lineups unconfirmed; Lugo regression risk",gameConf:"Low"
  },
  {
    away:"SF",home:"CIN",time:"6:40 PM",awaySP:"Tyler Mahle",homeSP:"Rhett Lowder",spStatus:"Strongly Corroborated",
    awayLuStatus:"Confirmed",homeLuStatus:"Confirmed",
    line:"SF -110",total:"9.0",weather:"84F / wind 11mph R-L",
    prediction:"SF",runEnv:"High",confidence:"Medium",
    whyPrediction:"SF lineup confirmed with quality contact profiles (Schmitt 90th HH%tile, Devers 72nd). Lowder low-K profile (17th %tile) means more balls in play. CIN has power (De La Cruz, Stewart elite vs FF) but Mahle's splitter provides swing-miss floor. GABP + heat = runs.",
    awaySPProfile:[
      ["ERA / xERA","4.29 / 5.68"],["xwOBA allowed",".371"],["K%tile","56"],["Whiff%tile","23"],
      ["Top pitch","Splitter 30.6% (30.6% whiff)"],["Risk","Hard-hit 85th %tile allowed"]
    ],
    homeSPProfile:[
      ["ERA / xERA","3.31 / 4.42"],["xwOBA allowed",".333"],["K%tile","17"],["Whiff%tile","28"],
      ["Top pitch","Sinker 30% (11.8% whiff)"],["Risk","Very low K rate = balls in play"]
    ],
    awayLineup:[
      ["1","W. Adames","SS",".324 xwOBA",".459 xSLG","46 HH%","73 BRL%"],
      ["2","L. Arraez","2B",".301",".353","3","1"],
      ["3","C. Schmitt","DH",".343",".429","90","67"],
      ["4","R. Devers","1B",".295",".399","72","67"],
      ["5","M. Chapman","3B",".287",".333","24","24"],
      ["6","J.H. Lee","RF",".291",".329","38","11"],
      ["7","D. Susac","C",".465",".605","—","—"],
      ["8","W. Brennan","LF","—","—","—","—"],
      ["9","D. Gilbert","CF","—","—","—","—"],
    ],
    homeLineup:[
      ["1","TJ Friedl","CF",".226",".154","2","1"],
      ["2","M. McLain","2B",".328",".359","13","56"],
      ["3","E. De La Cruz","SS",".388",".538","88","87"],
      ["4","S. Stewart","1B",".442",".629","84","96"],
      ["5","E. Suarez","DH",".297",".373","4","65"],
      ["6","S. Steer","LF",".314",".485","17","93"],
      ["7","R. Hinds","RF",".045",".060","—","—"],
      ["8","T. Stephenson","C",".336",".407","63","73"],
      ["9","K. Hayes","3B",".305",".397","34","33"],
    ],
    awayTopMatchups:[
      ["C. Schmitt","Favorable","90th HH%tile, .283 wOBA vs SI — can drive sinker"],
      ["W. Adames","Favorable",".357 wOBA vs sinker, 73rd BRL%tile"],
      ["R. Devers","Favorable","72nd HH%tile, 67th BRL — power vs contact pitcher"],
    ],
    homeTopMatchups:[
      ["S. Stewart","Elite","96th BRL, .632 wOBA vs FF — top matchup on slate"],
      ["E. De La Cruz","Elite",".489 wOBA vs FF, 88th HH — elite power vs Mahle FF"],
      ["T. Stephenson","Favorable","63rd HH, 73rd BRL — solid contact vs FF heavy arm"],
    ],
    awayBatterOutlooks:[
      ["C. Schmitt","Moderate","Strong","Strong","Moderate","LEAN — elite HH vs contact pitcher"],
      ["W. Adames","Moderate","Moderate","Moderate","Moderate","INFO — solid floor"],
      ["D. Susac","Strong","Strong","Strong","Moderate","WATCHLIST — tiny sample (.465 xwOBA)"],
      ["R. Devers","Moderate","Moderate","Moderate","Moderate","INFO — power upside"],
    ],
    homeBatterOutlooks:[
      ["S. Stewart","Strong","Strong","Strong","Strong","LEAN — 96th BRL + .632 vs FF"],
      ["E. De La Cruz","Strong","Strong","Strong","Strong","LEAN — elite matchup vs Mahle"],
      ["S. Steer","Moderate","Strong","Strong","Moderate","INFO — 93rd BRL but uneven contact"],
    ],
    awaySPOutlook:[["Mahle","Moderate (4-5)","Moderate","Medium-High","INFO — hittable in GABP"]],
    homeSPOutlook:[["Lowder","Weak (3-4)","Moderate","Moderate","INFO — low K limits upside"]],
    bestAngle:"SF ML -110 — LEAN (lineup quality edge, high run env)",
    bestBatter:"S. Stewart vs Mahle (elite power vs FF) — LEAN",
    bestProp:"Stewart 2+ TB — LEAN",
    biggestRisk:"GABP + heat = variance; Mahle hard-hit risk",gameConf:"Medium"
  },
  {
    away:"WSH",home:"PIT",time:"6:40 PM",awaySP:"Jake Irvin",homeSP:"Mason Montgomery",spStatus:"Strongly Corroborated",
    awayLuStatus:"Projected",homeLuStatus:"Projected",
    line:"PIT -180",total:"9.5",weather:"82F / wind 10mph R-L",
    prediction:"PIT",runEnv:"Medium-High",confidence:"Low",
    whyPrediction:"Montgomery elite K profile (99th %tile, 97th velo) despite rough ERA. Irvin leaking hard contact (10th %tile HH suppression, 20% barrel rate). Heavy PIT price (-180) may be justified but limits value. Lineups projected.",
    awaySPProfile:[
      ["ERA / xERA","7.07 / 5.46"],["xwOBA allowed",".365"],["K%tile","63"],["HH% suppression","10th (terrible)"],
      ["Top pitch","Fastball 35.3% (22.2% whiff)"],["Weakness","20% barrel rate allowed"]
    ],
    homeSPProfile:[
      ["ERA / xERA","6.14 / 3.77"],["xwOBA allowed",".310"],["K%tile","99"],["Whiff%tile","93"],
      ["Top pitch","Fastball 61.6% (30.8% whiff)"],["Strength","97th velo + elite swing-miss"]
    ],
    awayLineup:[],homeLineup:[],
    awayTopMatchups:[["Lineups not confirmed","—","—"]],
    homeTopMatchups:[["Lineups not confirmed","—","—"]],
    awayBatterOutlooks:[["Lineups projected","—","—","—","—"]],
    homeBatterOutlooks:[["Lineups projected","—","—","—","—"]],
    awaySPOutlook:[["Irvin","Moderate (4-5)","Low-Moderate","High","INFO — very hittable"]],
    homeSPOutlook:[["Montgomery","Strong (6-8)","Moderate","Low","WATCHLIST — elite K stuff, small sample"]],
    bestAngle:"PIT -180 — PASS (price too steep without confirmed LU)",
    bestBatter:"Waiting for lineups",bestProp:"Montgomery Ks Over — WATCHLIST",
    biggestRisk:"Price too high; Montgomery small sample (36 PA)",gameConf:"Low"
  },
  {
    away:"LAA",home:"NYY",time:"7:05 PM",awaySP:"Jack Kochanowicz",homeSP:"Luis Gil",spStatus:"Strongly Corroborated",
    awayLuStatus:"Confirmed",homeLuStatus:"Confirmed",
    line:"NYY -190",total:"10.5",weather:"85F / wind 10mph Out",
    prediction:"NYY",runEnv:"High",confidence:"Medium",
    whyPrediction:"Both SPs project poorly (Kochanowicz xERA 6.05, Gil xERA 5.57). NYY lineup confirmed with elite contact cluster (Ben Rice 100th HH, Judge 100th BRL). Hot weather + wind out at Yankee Stadium. Total 10.5 reflects high-scoring environment. NYY lineup quality >> LAA lineup quality.",
    awaySPProfile:[
      ["ERA / xERA","3.24 / 6.05"],["xwOBA allowed",".381"],["K%tile","20"],["Whiff%tile","42"],
      ["Top pitch","Sinker 37.1% (18.5% whiff)"],["Risk","Massive regression candidate"]
    ],
    homeSPProfile:[
      ["ERA / xERA","6.75 / 5.57"],["xwOBA allowed",".368"],["K%tile","—"],["Whiff%tile","—"],
      ["Top pitch","Fastball 39.8% (7.7% whiff!)"],["Risk","Tiny sample, awful FF whiff"]
    ],
    awayLineup:[
      ["1","Z. Neto","SS",".327",".421","37","76"],
      ["2","M. Trout","CF",".481",".727","67","99"],
      ["3","N. Schanuel","1B",".324",".371","27","11"],
      ["4","J. Adell","RF",".333",".439","70","31"],
      ["5","Y. Moncada","DH",".283",".252","39","48"],
      ["6","O. Peraza","3B",".328",".419","53","57"],
      ["7","J. Lowe","LF",".228",".256","4","68"],
      ["8","L. O'Hoppe","C",".288",".272","42","46"],
      ["9","A. Frazier","2B",".322",".247","—","—"],
    ],
    homeLineup:[
      ["1","T. Grisham","CF",".379",".459","99","78"],
      ["2","B. Rice","1B",".467",".680","100","98"],
      ["3","A. Judge","RF",".427",".653","88","100"],
      ["4","C. Bellinger","LF",".—",".—","—","—"],
      ["5","G. Stanton","DH","—","—","—","—"],
      ["6","J. Chisholm","2B","—","—","—","—"],
      ["7","A. Wells","C","—","—","—","—"],
      ["8","J. Caballero","SS","—","—","—","—"],
      ["9","R. McMahon","3B","—","—","—","—"],
    ],
    awayTopMatchups:[
      ["M. Trout","Elite","99th BRL, .411 wOBA vs FF — best hitter matchup"],
      ["Z. Neto","Favorable",".397 wOBA vs FF, 76th BRL — drives fastballs"],
      ["J. Adell","Favorable","70th HH, .388 wOBA vs FF"],
    ],
    homeTopMatchups:[
      ["B. Rice","Elite","100th HH/98th BRL, .450 vs SI — crusher"],
      ["A. Judge","Elite","100th BRL, .508 vs SI — elite vs sinker"],
      ["T. Grisham","Favorable","99th HH, .278 vs SI — hard contact"],
    ],
    awayBatterOutlooks:[
      ["M. Trout","Strong","Strong","Strong","Strong","LEAN — 99th BRL vs weak Gil"],
      ["Z. Neto","Moderate","Moderate","Moderate","Strong","INFO — 76th BRL, HR upside"],
      ["J. Adell","Moderate","Moderate","Moderate","Moderate","INFO — solid contact profile"],
    ],
    homeBatterOutlooks:[
      ["B. Rice","Strong","Strong","Strong","Strong","LEAN — elite contact vs regression SP"],
      ["A. Judge","Strong","Strong","Strong","Strong","LEAN — .508 wOBA vs sinker"],
      ["G. Stanton","Moderate","Moderate","Moderate","Moderate","INFO — power upside in conditions"],
    ],
    awaySPOutlook:[["Kochanowicz","Low (3-4)","Low-Moderate","High","INFO — xERA 6.05, regression due"]],
    homeSPOutlook:[["Gil","Low (2-4)","Low","High","INFO — 7.7% FF whiff, very hittable"]],
    bestAngle:"Over 10.5 — LEAN (both SPs regressing, weather, Yankee Stadium)",
    bestBatter:"B. Rice vs Kochanowicz — LEAN (elite contact profile)",
    bestProp:"Trout HR — WATCHLIST (99th BRL vs weak SP + hot conditions)",
    biggestRisk:"NYY -190 steep; Gil could get pulled early making bullpen key",gameConf:"Medium"
  },
  {
    away:"MIA",home:"ATL",time:"7:15 PM",awaySP:"Chris Paddack",homeSP:"Bryce Elder",spStatus:"Strongly Corroborated",
    awayLuStatus:"Confirmed",homeLuStatus:"Confirmed",
    line:"ATL -166",total:"9.0",weather:"85F / wind 6mph Out",
    prediction:"ATL",runEnv:"Medium",confidence:"Medium",
    whyPrediction:"Elder xERA (2.35) backs up surface ERA (1.02) — legitimate run prevention with 88th xwOBA %tile. Paddack's underlying indicators weaker (xERA 4.30). ATL: Ronald Acuña Jr. leads off; his lineup row uses model priors where the live Savant scrape returned blanks (outlook can say Ronald Acuña Jr. or R. Acuña Jr.—row lookup matches last name + Jr.). Smith/Baldwin/Olson use full feed stats for FF matchup notes.",
    awaySPProfile:[
      ["ERA / xERA","6.14 / 4.30"],["xwOBA pctl","44"],["K%tile","40"],["Whiff%tile","62"],
      ["Top pitch","FF 27.8% / CH 24.3% (33.3% whiff)"],["Risk","Low velo, hittable to contact"]
    ],
    homeSPProfile:[
      ["ERA / xERA","1.02 / 2.35"],["xwOBA pctl","88"],["K%tile","57"],["Whiff%tile","32"],
      ["Top pitch","Slider 37.5% (28.3% whiff)"],["Strength","Elite run prevention, sustainable"]
    ],
    awayLineup:[
      ["1","J. Marsee","CF","—","—","—","—"],
      ["2","X. Edwards","2B",".402 xSLG","—","57","20"],
      ["3","O. Lopez","SS",".501","—","92","80"],
      ["4","L. Hicks","C",".452","—","41","38"],
      ["5","C. Norby","DH",".379","—","34","66"],
      ["6","O. Caissie","LF",".467","—","74","97"],
      ["7","H. Hernandez","RF",".309","—","57","38"],
      ["8","G. Pauley","3B",".169","—","2","20"],
      ["9","D. De Los Santos","1B",".509","—","—","—"],
    ],
    homeLineup:[
      ["1","R. Acuña Jr.","RF",".392",".598","82","91"],
      ["2","D. Baldwin","C",".583 xSLG","—","60","90"],
      ["3","M. Olson","1B",".548","—","68","94"],
      ["4","A. Riley","3B",".333","—","48","36"],
      ["5","O. Albies","2B",".361","—","16","21"],
      ["6","M. Yastrzemski","LF",".242","—","39","14"],
      ["7","D. Smith","DH",".599","—","57","58"],
      ["8","M. Dubon","SS",".431","—","30","50"],
      ["9","M. Harris","CF","—","—","—","—"],
    ],
    awayTopMatchups:[
      ["O. Lopez","Favorable",".686 wOBA vs slider, 80th BRL"],
      ["L. Hicks","Favorable",".760 wOBA vs slider (small sample)"],
      ["O. Caissie","Favorable","97th BRL, .358 vs SL"],
    ],
    homeTopMatchups:[
      ["R. Acuña Jr.","Favorable","Elite athlete vs FF-heavy Paddack — priors in lineup row when feed was blank; confirm vs Savant"],
      ["D. Smith","Elite",".697 wOBA vs FF, .599 xSLG — top spot"],
      ["D. Baldwin","Elite",".679 wOBA vs FF, 90th BRL"],
      ["M. Olson","Elite",".590 vs FF, 94th BRL — elite power matchup"],
    ],
    awayBatterOutlooks:[
      ["O. Caissie","Moderate","Moderate","Moderate","Moderate","INFO — BRL upside vs slider arm"],
      ["O. Lopez","Moderate","Strong","Strong","Moderate","INFO — .686 vs SL (caution: small sample)"],
    ],
    homeBatterOutlooks:[
      ["Ronald Acuña Jr.","Strong","Strong","Strong","Strong","A — priors in lineup for modeling; verify vs live Statcast"],
      ["D. Smith","Strong","Strong","Strong","Strong","LEAN — .697 vs FF, power profile"],
      ["D. Baldwin","Strong","Strong","Strong","Strong","LEAN — .679 vs FF, 90th BRL"],
      ["M. Olson","Strong","Strong","Strong","Strong","LEAN — .590 vs FF, 94th BRL"],
    ],
    awaySPOutlook:[["Paddack","Moderate (4-5)","Moderate","Medium","INFO — hittable to ATL power"]],
    homeSPOutlook:[["Elder","Moderate (4-5)","High","Low","LEAN — real run prevention"]],
    bestAngle:"ATL ML -166 — LEAN (Elder real, Paddack hittable, but price steep)",
    bestBatter:"D. Smith / D. Baldwin / M. Olson cluster vs Paddack FF — LEAN",
    bestProp:"ATL team total Over — WATCHLIST",
    biggestRisk:"ATL -166 steep; MIA has some SL matchup spots vs Elder",gameConf:"Medium"
  },
  {
    away:"TB",home:"CWS",time:"7:40 PM",awaySP:"Jesse Scholtens",homeSP:"Sean Burke",spStatus:"Strongly Corroborated",
    awayLuStatus:"Confirmed",homeLuStatus:"Confirmed",
    line:"TB -112",total:"8.5",weather:"71F / rain 58% / wind 13mph R-L",
    prediction:"TB",runEnv:"Low-Medium",confidence:"Low",
    whyPrediction:"Scholtens tiny sample (17 PA) makes analysis difficult. Burke has quality underlying numbers (xERA 3.20, 70th xwOBA %tile). CWS lineup is one of weakest in MLB. Rain risk (58%) could delay or suspend.",
    awaySPProfile:[
      ["ERA / xERA","0.00 / 3.08"],["xwOBA allowed",".282"],["Sample","17 PA — very small"],
      ["Top pitch","Slider 36.1% / Sinker 29.5%"],["Risk","Impossible to trust tiny sample"]
    ],
    homeSPProfile:[
      ["ERA / xERA","3.60 / 3.20"],["xwOBA pctl","70"],["K%tile","61"],["BB%tile","85"],
      ["Top pitch","FF 38.8% (25.9% whiff)"],["Strength","Good control, decent stuff"]
    ],
    awayLineup:[
      ["1","C. Simpson","LF","—","—","1","1"],
      ["2","J. Caminero","3B",".393 xSLG","—","33","54"],
      ["3","J. Aranda","1B",".480","—","78","65"],
      ["4","Y. Diaz","DH",".451","—","78","46"],
      ["5","J. Fraley","RF",".300","—","6","25"],
      ["6","C. Mullins","CF",".277","—","22","13"],
      ["7","R. Palacios","2B",".501","—","—","—"],
      ["8","H. Feduccia","C",".234","—","—","—"],
      ["9","T. Walls","SS",".261","—","—","—"],
    ],
    homeLineup:[
      ["1","A. Benintendi","LF",".303 xSLG","—","96","63"],
      ["2","M. Murakami","DH",".506","—","95","96"],
      ["3","M. Vargas","1B",".354","—","54","62"],
      ["4","C. Montgomery","SS",".317","—","12","65"],
      ["5","S. Antonacci","2B","—","—","—","—"],
      ["6","T. Murray","3B","—","—","—","—"],
      ["7","T. Peters","RF",".225","—","1","1"],
      ["8","R. McGuire","C",".137","—","—","—"],
      ["9","L. Acuna","CF",".266","—","22","12"],
    ],
    awayTopMatchups:[
      ["Y. Diaz","Favorable",".480 vs FF, 78th HH — drives fastballs"],
      ["J. Caminero","Favorable",".536 vs FF, 54th BRL — emerging power"],
      ["J. Aranda","Neutral","Good contact but .152 vs FF — mixed"],
    ],
    homeTopMatchups:[
      ["M. Murakami","Favorable","95th HH / 96th BRL — elite raw power"],
      ["M. Vargas","Neutral","54th HH, .188 vs SL — mixed"],
      ["C. Montgomery","Neutral","Low HH but 65th BRL — developing"],
    ],
    awayBatterOutlooks:[
      ["Y. Diaz","Moderate","Moderate","Moderate","Weak","INFO — contact over power"],
      ["J. Caminero","Moderate","Moderate","Moderate","Moderate","INFO — emerging raw power"],
    ],
    homeBatterOutlooks:[
      ["M. Murakami","Moderate","Strong","Strong","Strong","WATCHLIST — elite raw power but high whiff vs SL"],
    ],
    awaySPOutlook:[["Scholtens","Unknown","Unknown","Unknown","PASS — 17 PA sample"]],
    homeSPOutlook:[["Burke","Moderate (4-5)","Moderate","Low-Moderate","INFO — solid underlying profile"]],
    bestAngle:"PASS — rain risk + Scholtens unknown sample",
    bestBatter:"Murakami power upside — WATCHLIST",bestProp:"No clear prop edge",
    biggestRisk:"58% rain probability; Scholtens 17-PA sample",gameConf:"Low"
  },
  {
    away:"TOR",home:"MIL",time:"7:40 PM",awaySP:"Dylan Cease",homeSP:"Chad Patrick",spStatus:"Strongly Corroborated",
    awayLuStatus:"Confirmed",homeLuStatus:"Confirmed",
    line:"TOR -122",total:"7.5",weather:"Dome",
    prediction:"TOR",runEnv:"Low-Medium",confidence:"Medium",
    whyPrediction:"Cease elite swing-miss profile (97th K, 98th whiff, 85th chase) vs MIL lineup with exploitable chase/whiff holes. Patrick xERA (3.69) reveals regression from 0.73 ERA — low K (11th %tile), low whiff (31st). Dome removes weather noise. TOR lineup has enough contact (Guerrero, Sanchez, Varsho).",
    awaySPProfile:[
      ["ERA / xERA","2.46 / 2.95"],["xwOBA pctl","75"],["K%tile","97"],["Whiff%tile","98"],
      ["Top pitch","Slider 28.3% (58.3% whiff!)"],["Strength","Best swing-miss on the slate"],["Risk","Walk rate (24th %tile)"]
    ],
    homeSPProfile:[
      ["ERA / xERA","0.73 / 3.69"],["xwOBA pctl","60"],["K%tile","11"],["Whiff%tile","31"],
      ["Top pitch","Cutter 35.7% (28.6% whiff)"],["Weakness","Very low K rate — regression candidate"]
    ],
    awayLineup:[
      ["1","N. Lukes","RF","—","—","—","—"],
      ["2","D. Varsho","CF",".422 xSLG","—","28","38"],
      ["3","V. Guerrero","1B","—","—","—","—"],
      ["4","J. Sanchez","LF",".507","—","65","51"],
      ["5","K. Okamoto","DH",".364","—","41","53"],
      ["6","E. Clement","3B",".378","—","10","1"],
      ["7","A. Gimenez","SS",".377","—","17","37"],
      ["8","L. Sosa","2B",".361","—","51","1"],
      ["9","B. Valenzuela","C",".322","—","—","—"],
    ],
    homeLineup:[
      ["1","S. Frelick","RF",".307 xSLG","—","9","13"],
      ["2","W. Contreras","DH",".419","—","67","27"],
      ["3","B. Turang","2B",".522","—","77","65"],
      ["4","G. Sanchez","C",".700","—","89","100"],
      ["5","J. Bauers","1B",".570","—","94","88"],
      ["6","B. Lockridge","LF",".269","—","20","18"],
      ["7","G. Mitchell","CF",".482","—","98","95"],
      ["8","J. Ortiz","SS",".274","—","27","35"],
      ["9","D. Hamilton","3B",".269","—","7","21"],
    ],
    awayTopMatchups:[
      ["J. Sanchez","Favorable","1.038 wOBA vs FC (tiny sample), 65th HH"],
      ["D. Varsho","Neutral",".000 vs FC — concerning, but 38th BRL"],
      ["A. Gimenez","Favorable",".450 vs FC, 37th BRL — solid contact"],
    ],
    homeTopMatchups:[
      ["G. Sanchez","Elite",".755 wOBA vs FF, 100th BRL — top matchup"],
      ["B. Turang","Favorable",".394 vs FF, 77th HH — drives fastballs"],
      ["G. Mitchell","Favorable","98th HH, 95th BRL — but .336 vs FF, 43.5% whiff"],
    ],
    awayBatterOutlooks:[
      ["J. Sanchez","Moderate","Strong","Strong","Moderate","INFO — power vs cutter arm"],
      ["V. Guerrero","Strong","Strong","Strong","Moderate","INFO — no Savant yet, but .328 BA"],
    ],
    homeBatterOutlooks:[
      ["G. Sanchez","Moderate","Strong","Strong","Strong","LEAN — 100th BRL vs elite K arm is volatile"],
      ["B. Turang","Moderate","Strong","Strong","Moderate","INFO — drives FF but Cease slider is test"],
      ["G. Mitchell","Weak","Moderate","Moderate","Moderate","WATCHLIST — 98th HH but 43% whiff vs FF"],
    ],
    awaySPOutlook:[["Cease","Strong (7-9)","High","Low","BET — 97th K + 58.3% slider whiff vs chase-prone LU"]],
    homeSPOutlook:[["Patrick","Weak (2-4)","Low-Moderate","Medium","LEAN — regression from .73 ERA"]],
    bestAngle:"TOR ML -122 — BET (Cease dominance profile vs Patrick regression)",
    bestBatter:"G. Sanchez vs Cease — WATCHLIST (power but high K risk)",
    bestProp:"Cease Ks Over — BET (elite profile, dome, chase-heavy lineup)",
    biggestRisk:"Cease walk rate can raise pitch count; TOR lineup thin at bottom",gameConf:"Medium"
  },
  {
    away:"COL",home:"HOU",time:"8:10 PM",awaySP:"Jose Quintana",homeSP:"Spencer Arrighetti",spStatus:"Strongly Corroborated",
    awayLuStatus:"Confirmed",homeLuStatus:"Confirmed",
    line:"HOU -190",total:"8.5",weather:"Dome",
    prediction:"HOU",runEnv:"Medium",confidence:"Medium",
    whyPrediction:"Quintana xERA (5.86) weak. HOU lineup has elite contact cluster: Y. Alvarez (100th xwOBA %tile, .799 xSLG), C. Walker (86th BRL), Cam Smith (92nd BRL). Arrighetti no Savant data available. Dome neutralizes environment. -190 price is steep.",
    awaySPProfile:[
      ["ERA / xERA","4.15 / 5.86"],["xwOBA allowed",".376"],["Sample","19 PA"],
      ["Top pitch","FF 37.2% (27.3% whiff) / CH 24.4% (50% whiff)"],["Weakness","Small sample, xERA very high"]
    ],
    homeSPProfile:[
      ["ERA / xERA","No Savant data","—"],["K%tile","—"],["Whiff%tile","—"],
      ["Note","First start or insufficient data","UNVERIFIED"]
    ],
    awayLineup:[
      ["1","E. Julien","2B",".467 xSLG","—","69","70"],
      ["2","M. Moniak","LF",".552","—","18","83"],
      ["3","H. Goodman","C",".371","—","76","58"],
      ["4","T. Johnston","1B",".447","—","34","33"],
      ["5","TJ Rumfield","DH",".474","—","56","57"],
      ["6","E. Tovar","SS",".473","—","72","56"],
      ["7","W. Castro","3B",".285","—","31","40"],
      ["8","J. McCarthy","CF",".392","—","15","47"],
      ["9","J. Beck","RF",".326","—","22","23"],
    ],
    homeLineup:[
      ["1","C. Correa","3B",".500 xSLG","—","63","63"],
      ["2","Y. Alvarez","DH",".799","—","69","95"],
      ["3","I. Paredes","2B",".286","—","11","1"],
      ["4","C. Walker","1B",".512","—","78","86"],
      ["5","Cam Smith","RF",".528","—","89","92"],
      ["6","Y. Diaz","C",".277","—","10","12"],
      ["7","J. Loperfido","CF",".290","—","53","16"],
      ["8","N. Allen","SS",".205","—","—","—"],
      ["9","B. Matthews","LF",".314","—","—","—"],
    ],
    awayTopMatchups:[
      ["No Arrighetti Savant data","—","Cannot evaluate matchups — UNVERIFIED"]
    ],
    homeTopMatchups:[
      ["Y. Alvarez","Elite",".414 vs FF, 95th BRL — elite power matchup"],
      ["Cam Smith","Elite",".585 vs FF, 92nd BRL — drives fastballs"],
      ["C. Correa","Favorable",".339 vs FF, 63rd BRL — solid contact"],
    ],
    awayBatterOutlooks:[
      ["No Arrighetti data — all outlooks UNVERIFIED","—","—","—","—"]
    ],
    homeBatterOutlooks:[
      ["Y. Alvarez","Strong","Strong","Strong","Strong","LEAN — .799 xSLG, elite vs FF"],
      ["Cam Smith","Strong","Strong","Strong","Strong","LEAN — .585 vs FF, 92nd BRL"],
      ["C. Walker","Moderate","Strong","Strong","Moderate","INFO — 86th BRL, solid vs FF"],
    ],
    awaySPOutlook:[["Quintana","Low (3-4)","Low-Moderate","High","INFO — xERA 5.86"]],
    homeSPOutlook:[["Arrighetti","Unknown","Unknown","Unknown","PASS — no Savant data"]],
    bestAngle:"HOU -190 — PASS (price too steep, Arrighetti unknown)",
    bestBatter:"Y. Alvarez vs Quintana — LEAN (elite profile vs hittable SP)",
    bestProp:"Alvarez 2+ TB — LEAN",
    biggestRisk:"HOU -190 price; Arrighetti no data; Quintana small sample",gameConf:"Low"
  },
  {
    away:"SEA",home:"SD",time:"9:40 PM",awaySP:"Emerson Hancock",homeSP:"Randy Vasquez",spStatus:"Strongly Corroborated",
    awayLuStatus:"Confirmed",homeLuStatus:"Confirmed",
    line:"SEA -108",total:"8.0",weather:"65F / wind 9mph L-R",
    prediction:"SEA",runEnv:"Low",confidence:"Medium",
    whyPrediction:"Hancock quality run prevention (xERA 2.39, 87th xwOBA %tile, 86th HH suppression). Vasquez surface ERA (1.02) masks xERA (4.21) — regression candidate. SEA lineup has L. Raley (94th BRL, .470 vs FF) and D. Canzone (83rd BRL). Petco Park + cool weather suppresses offense.",
    awaySPProfile:[
      ["ERA / xERA","2.04 / 2.39"],["xwOBA pctl","87"],["K%tile","84"],["HH%tile","86"],
      ["Top pitch","FF 40.1% (31.5% whiff) / Sweeper 27.7% (32.1%)"],["Strength","Sustainable quality indicators"]
    ],
    homeSPProfile:[
      ["ERA / xERA","1.02 / 4.21"],["xwOBA pctl","45"],["K%tile","74"],["HH%tile","23"],
      ["Top pitch","FF 33.5% (30.4% whiff)"],["Weakness","Major xERA regression candidate"]
    ],
    awayLineup:[
      ["1","B. Donovan","3B",".390 xSLG","—","31","45"],
      ["2","C. Raleigh","C",".—","—","—","—"],
      ["3","J. Rodriguez","CF",".—","—","—","—"],
      ["4","J. Naylor","1B",".—","—","—","—"],
      ["5","R. Arozarena","LF",".431","—","56","52"],
      ["6","L. Raley","RF",".587","—","89","94"],
      ["7","D. Canzone","DH",".558","—","75","83"],
      ["8","C. Young","2B",".355","—","11","44"],
      ["9","L. Rivas","SS",".162","—","1","1"],
    ],
    homeLineup:[
      ["1","R. Laureano","LF",".557 xSLG","—","79","87"],
      ["2","J. Merrill","CF",".518","—","79","80"],
      ["3","X. Bogaerts","SS",".484","—","48","44"],
      ["4","M. Machado","3B",".392","—","25","46"],
      ["5","G. Sheets","DH",".445","—","65","68"],
      ["6","N. Castellanos","RF",".475","—","66","43"],
      ["7","T. France","1B",".724","—","—","—"],
      ["8","J. Cronenworth","2B",".372","—","29","30"],
      ["9","F. Fermin","C",".272","—","37","1"],
    ],
    awayTopMatchups:[
      ["L. Raley","Elite","94th BRL, .470 wOBA vs FF — top spot on this game"],
      ["D. Canzone","Favorable","83rd BRL, .558 xSLG — drives fastballs"],
      ["R. Arozarena","Favorable","52nd BRL, .350 vs FF — solid contact"],
    ],
    homeTopMatchups:[
      ["R. Laureano","Favorable","87th BRL, .308 vs FF — hard contact, solid profile"],
      ["J. Merrill","Favorable","80th BRL, .336 vs FF — good contact quality"],
      ["X. Bogaerts","Favorable","44th BRL, .379 vs FF — low whiff, good bat-to-ball"],
    ],
    awayBatterOutlooks:[
      ["L. Raley","Moderate","Strong","Strong","Moderate","LEAN — 94th BRL vs regression SP"],
      ["D. Canzone","Moderate","Strong","Strong","Moderate","INFO — 83rd BRL, .558 xSLG"],
      ["B. Donovan","Moderate","Moderate","Moderate","Weak","INFO — contact over power"],
    ],
    homeBatterOutlooks:[
      ["R. Laureano","Moderate","Moderate","Moderate","Moderate","INFO — solid vs Hancock FF"],
      ["J. Merrill","Moderate","Moderate","Moderate","Moderate","INFO — 80th BRL but faces elite SP"],
    ],
    awaySPOutlook:[["Hancock","Moderate (5-6)","High","Low","LEAN — sustainable quality metrics"]],
    homeSPOutlook:[["Vasquez","Moderate (4-5)","Moderate","Medium","INFO — xERA regression risk"]],
    bestAngle:"SEA ML -108 — BET (Hancock real, Vasquez regressing, Petco)",
    bestBatter:"L. Raley vs Vasquez — LEAN (94th BRL vs regression pitcher)",
    bestProp:"Under 8.0 — LEAN (Petco, cool, both bullpens strong)",
    biggestRisk:"SEA lineup has cold bats at top (Raleigh, J-Rod, Naylor)",gameConf:"Medium"
  },
  {
    away:"TEX",home:"ATH",time:"9:40 PM",awaySP:"Kumar Rocker",homeSP:"J.T. Ginn",spStatus:"Strongly Corroborated",
    awayLuStatus:"Expected",homeLuStatus:"Confirmed",
    line:"ATH -120",total:"9.5",weather:"70F / wind 8mph",
    prediction:"ATH",runEnv:"Medium-High",confidence:"Low",
    whyPrediction:"Ginn xERA (2.41) and 87th xwOBA %tile back quality profile. Rocker more hittable (xwOBA .321 vs Ginn .250). ATH lineup has Max Muncy (99th HH, .514 vs SL), Langeliers (74th BRL). TEX lineup has power (Burger .640 vs SI, Seager 90th BRL). TEX lineup only Expected.",
    awaySPProfile:[
      ["ERA / xERA","4.50 / 4.07"],["xwOBA allowed",".321"],["K%tile","27"],["HH%tile","62"],
      ["Top pitch","Slider 38% (23.5% whiff)"],["Risk","Moderate — hittable slider"]
    ],
    homeSPProfile:[
      ["ERA / xERA","3.27 / 2.41"],["xwOBA pctl","87"],["K%tile","32"],["Chase%tile","82"],
      ["Top pitch","Sinker 43.6% (17.9% whiff)"],["Strength","Elite run suppression + chase rate"]
    ],
    awayLineup:[
      ["1","B. Nimmo","RF",".443 xSLG","—","45","60"],
      ["2","W. Langford","LF",".361","—","50","45"],
      ["3","C. Seager","SS",".429","—","67","90"],
      ["4","J. Burger","1B",".463","—","89","78"],
      ["5","J. Pederson","DH",".234","—","93","1"],
      ["6","E. Carter","CF",".437","—","76","73"],
      ["7","D. Jansen","C",".283","—","32","25"],
      ["8","J. Smith","2B",".336","—","25","31"],
      ["9","J. Jung","3B",".377","—","77","1"],
    ],
    homeLineup:[
      ["1","N. Kurtz","1B",".389 xSLG","—","97","84"],
      ["2","S. Langeliers","C",".493","—","63","74"],
      ["3","C. Cortes","DH",".517","—","—","—"],
      ["4","T. Soderstrom","LF",".408","—","62","53"],
      ["5","J. Wilson","SS",".316","—","30","1"],
      ["6","J. McNeil","2B",".356","—","22","1"],
      ["7","M. Muncy","3B",".460","—","99","78"],
      ["8","L. Butler","RF",".386","—","72","35"],
      ["9","D. Clarke","CF",".205","—","87","25"],
    ],
    awayTopMatchups:[
      ["E. Carter","Favorable","76th HH, .408 vs SI — drives sinkers"],
      ["J. Burger","Favorable","89th HH, .640 vs SI — elite vs sinker"],
      ["C. Seager","Favorable","90th BRL, .357 vs SI — power vs contact pitcher"],
    ],
    homeTopMatchups:[
      ["M. Muncy","Favorable","99th HH, .514 vs slider — top matchup"],
      ["N. Kurtz","Favorable","97th HH, 84th BRL — drives balls hard"],
      ["S. Langeliers","Favorable","74th BRL, .358 vs SL — consistent contact"],
    ],
    awayBatterOutlooks:[
      ["J. Burger","Moderate","Strong","Strong","Moderate","LEAN — .640 vs SI is elite"],
      ["C. Seager","Moderate","Strong","Strong","Moderate","INFO — 90th BRL, HR upside"],
      ["E. Carter","Moderate","Moderate","Moderate","Moderate","INFO — drives sinkers well"],
    ],
    homeBatterOutlooks:[
      ["M. Muncy","Moderate","Strong","Strong","Moderate","LEAN — 99th HH, .514 vs SL"],
      ["N. Kurtz","Moderate","Moderate","Moderate","Moderate","INFO — 97th HH, emerging power"],
      ["S. Langeliers","Moderate","Moderate","Moderate","Moderate","INFO — consistent contact"],
    ],
    awaySPOutlook:[["Rocker","Moderate (4-5)","Moderate","Moderate","INFO — hittable slider"]],
    homeSPOutlook:[["Ginn","Moderate (4-5)","Moderate","Low","INFO — elite suppression profile"]],
    bestAngle:"ATH -120 — LEAN (Ginn quality edge, Rocker hittable, but TEX LU only Expected)",
    bestBatter:"J. Burger vs Ginn sinker — LEAN (.640 wOBA vs SI)",
    bestProp:"Burger 2+ TB — WATCHLIST",
    biggestRisk:"TEX lineup only Expected; Sutter Health Park inflates offense",gameConf:"Low"
  },
  {
    away:"NYM",home:"LAD",time:"10:00 PM",awaySP:"Clay Holmes",homeSP:"Shohei Ohtani",spStatus:"Strongly Corroborated",
    awayLuStatus:"Confirmed",homeLuStatus:"Confirmed",
    line:"LAD -192",total:"8.0",weather:"65F / wind 8mph Out",
    prediction:"LAD",runEnv:"Low-Medium",confidence:"Medium",
    whyPrediction:"Ohtani xERA (2.43), 87th xwOBA %tile, 88th velo — legitimate ace profile. Holmes surface ERA (1.50) masks xERA (3.59) — regression risk vs LAD contact quality. LAD lineup has Freeman (91st BRL), Muncy (99th HH, .613 vs SI), Pages (93rd HH). NYM lineup thin beyond Alvarez. Price at -192 is steep.",
    awaySPProfile:[
      ["ERA / xERA","1.50 / 3.59"],["xwOBA pctl","62"],["K%tile","20"],["Whiff%tile","44"],
      ["Top pitch","Sinker 47.9% (9.8% whiff!)"],["Risk","Very low K rate + sinker exposed to HH"],["Chase%tile","74 — decent"]
    ],
    homeSPProfile:[
      ["ERA / xERA","0.00 / 2.43"],["xwOBA pctl","87"],["K%tile","23"],["FBV%tile","88"],
      ["Top pitch","FF 36.1% / Sweeper 18.6% / CU 19.1%"],["Strength","88th velo + elite run prevention"],
      ["Risk","Low K rate for stuff level — early season sample"]
    ],
    awayLineup:[
      ["1","F. Lindor","SS",".339 xwOBA",".407","38","55"],
      ["2","L. Robert","CF","—","—","—","—"],
      ["3","B. Baty","1B",".227",".326","32","48"],
      ["4","B. Bichette","3B",".306",".373","44","10"],
      ["5","F. Alvarez","C",".465",".703","79","97"],
      ["6","C. Benge","RF",".264",".292","46","16"],
      ["7","M. Semien","2B",".276",".352","43","36"],
      ["8","MJ Melendez","DH","—","—","—","—"],
      ["9","T. Pham","LF",".313",".373","—","—"],
    ],
    homeLineup:[
      ["1","K. Tucker","RF",".303 xwOBA",".298","43","12"],
      ["2","F. Freeman","1B",".416",".618","85","91"],
      ["3","W. Smith","C",".376",".491","33","74"],
      ["4","T. Hernandez","LF",".322",".432","41","68"],
      ["5","M. Muncy","3B",".336",".460","99","78"],
      ["6","A. Pages","CF",".360",".490","93","57"],
      ["7","D. Rushing","DH",".655","1.098","—","—"],
      ["8","H. Kim","SS",".351",".372","—","—"],
      ["9","A. Freeland","2B",".287",".353","66","43"],
    ],
    awayTopMatchups:[
      ["F. Alvarez","Elite",".620 wOBA vs FF, 97th BRL — best matchup on game"],
      ["F. Lindor","Favorable",".309 vs FF, 55th BRL — consistent contact"],
      ["B. Baty","Neutral",".421 vs FF — decent but 32nd HH"],
    ],
    homeTopMatchups:[
      ["F. Freeman","Elite","91st BRL, .377 vs SI — elite power vs sinker"],
      ["M. Muncy","Elite","99th HH, .613 vs sinker — dominates SI"],
      ["A. Pages","Favorable","93rd HH, .540 vs SI — hard contact profile"],
    ],
    awayBatterOutlooks:[
      ["F. Alvarez","Strong","Strong","Strong","Strong","LEAN — .620 vs FF, 97th BRL vs Ohtani"],
      ["F. Lindor","Moderate","Moderate","Moderate","Weak","INFO — steady contact, low power"],
    ],
    homeBatterOutlooks:[
      ["M. Muncy","Strong","Strong","Strong","Moderate","LEAN — .613 vs sinker, 99th HH"],
      ["F. Freeman","Strong","Strong","Strong","Moderate","LEAN — 91st BRL vs sinker-heavy Holmes"],
      ["A. Pages","Strong","Strong","Strong","Moderate","LEAN — 93rd HH, .540 vs SI"],
      ["D. Rushing","Strong","Strong","Strong","Strong","WATCHLIST — tiny sample (.655 xwOBA)"],
    ],
    awaySPOutlook:[["Holmes","Weak (3-4)","Moderate","Medium-High","INFO — 9.8% SI whiff vs power LU"]],
    homeSPOutlook:[["Ohtani","Moderate (5-6)","High","Low","LEAN — real ace profile, 88th velo"]],
    bestAngle:"LAD -192 — PASS (price too steep). NYM +1.5 -131 — LEAN (Holmes keeps it close early)",
    bestBatter:"F. Alvarez vs Ohtani — LEAN (elite power matchup)",
    bestProp:"Muncy/Freeman 2+ TB vs Holmes sinker — LEAN",
    biggestRisk:"LAD -192 price; Holmes can limit damage via groundballs despite weak profile",gameConf:"Medium"
  },
];

function PillTag({ label, tone }: { label: string; tone?: "success"|"warning"|"info"|"neutral" }) {
  return <Pill size="sm" tone={tone} active>{label}</Pill>;
}

function outlookToPropRows(
  g: Game,
  teamIsAway: boolean,
  outlooks: string[][],
  oppXera: number | null,
): string[][] {
  return outlooks.map((row) => {
    const name = row[0];
    if (
      name.includes("Lineups") ||
      name.includes("no outlooks") ||
      name.includes("UNVERIFIED") ||
      name === "—"
    ) {
      return [name, "—", "—", "—", "—", "—", "—", "D", "Low"];
    }
    const m = batterHrTwoTb(g, teamIsAway, name, oppXera);
    return [
      name,
      `${(m.hr * 100).toFixed(1)}%`,
      `${(m.tb2 * 100).toFixed(1)}%`,
      m.fairHr,
      m.fair2tb,
      m.marketHr,
      m.edgeHrPct,
      m.tier,
      m.conf,
    ];
  });
}

function pitcherTierFromNotes(notes: string): "A+" | "A" | "B" | "C" | "D" {
  const u = notes.toUpperCase();
  if (u.includes("BET")) return "A+";
  if (u.includes("LEAN")) return "B";
  if (u.includes("WATCHLIST")) return "C";
  if (u.includes("PASS")) return "D";
  if (u.includes("INFO")) return "C";
  return "C";
}

function GameCard({ g }: { g: Game }) {
  const key = gameKey(g.away, g.home);
  const book = BOOK_AMERICAN[key] ?? [100, -110];
  const { away: impAway, home: impHome } = devigTwoWay(book[0], book[1]);
  const mod = winProbabilityModel(g);
  const edgeAwayPct = (mod.pAway - impAway) * 100;
  const edgeHomePct = (mod.pHome - impHome) * 100;
  const pickHome = g.prediction === g.home;
  const edgePick = pickHome ? edgeHomePct : edgeAwayPct;
  const impliedPick = pickHome ? impHome : impAway;
  const truePick = pickHome ? mod.pHome : mod.pAway;
  const decisionTier = tierFromEdge(edgePick);
  const displayConf =
    mod.modelConf === "Low" || g.confidence === "Low"
      ? "Low"
      : mod.modelConf === "High" && g.confidence === "Medium"
        ? "Medium"
        : g.confidence;
  const confTone =
    displayConf === "Medium" ? ("warning" as const)
    : displayConf === "Low" ? ("neutral" as const)
    : ("success" as const);
  const xa = parseXERA(g.awaySPProfile);
  const xh = parseXERA(g.homeSPProfile);
  const awayRows = outlookToPropRows(g, true, g.awayBatterOutlooks, xh);
  const homeRows = outlookToPropRows(g, false, g.homeBatterOutlooks, xa);
  const spRows = [...g.awaySPOutlook, ...g.homeSPOutlook].map((r) => {
    const notes = r[4] ?? "";
    return [...r.slice(0, 4), pitcherTierFromNotes(notes)];
  });
  return (
    <Card collapsible defaultOpen={false}>
      <CardHeader trailing={
        <Row gap={6}>
          <PillTag label={g.line} tone="info" />
          <PillTag label={`O/U ${g.total}`} tone="neutral" />
          <PillTag label={displayConf} tone={confTone} />
        </Row>
      }>
        {`${g.away} @ ${g.home} — ${g.time} ET`}
      </CardHeader>
      <CardBody>
        <Stack gap={14}>
          <H3>Probability engine (MLB Stats / Savant / RotoWire / Odds API inputs)</H3>
          <Grid columns={4} gap={12}>
            <Stat value={`${(impAway * 100).toFixed(1)}%`} label={`${g.away} implied (no-vig)`} />
            <Stat value={`${(impHome * 100).toFixed(1)}%`} label={`${g.home} implied (no-vig)`} />
            <Stat value={`${(mod.pAway * 100).toFixed(1)}%`} label={`${g.away} model`} />
            <Stat value={`${(mod.pHome * 100).toFixed(1)}%`} label={`${g.home} model`} />
          </Grid>
          <Grid columns={4} gap={12}>
            <Stat value={`${edgeAwayPct.toFixed(1)}%`} label={`Edge ${g.away}`} tone={edgeAwayPct > 2 ? "success" : "info"} />
            <Stat value={`${edgeHomePct.toFixed(1)}%`} label={`Edge ${g.home}`} tone={edgeHomePct > 2 ? "success" : "info"} />
            <Stat value={decisionTier} label={`Decision (${g.prediction})`} tone={decisionTier === "A+" || decisionTier === "A" ? "success" : "warning"} />
            <Stat value={`${edgePick.toFixed(1)}%`} label="Edge vs market (pick)" />
          </Grid>
          <Text size="small" tone="secondary">
            {`Pick ${g.prediction}: true ${(truePick * 100).toFixed(1)}% vs implied ${(impliedPick * 100).toFixed(1)}%. `}
            {mod.missingFlags.length
              ? `Model confidence ${mod.modelConf} — missing: ${mod.missingFlags.join(", ")}.`
              : `Model confidence ${mod.modelConf}.`}
          </Text>
          <Grid columns={3} gap={12}>
            <Stat value={g.prediction} label="Predicted Winner" />
            <Stat value={g.runEnv} label="Run Environment" />
            <Stat value={displayConf} label="Analyst confidence" tone={confTone} />
          </Grid>
          <Text size="small" tone="secondary">{g.whyPrediction}</Text>
          <Divider />
          <H3>{`Starting Pitchers (${g.spStatus})`}</H3>
          <Grid columns={2} gap={12}>
            <Stack gap={4}>
              <Text weight="semibold">{`${g.away}: ${g.awaySP}`}</Text>
              <Table headers={["Metric","Value"]} rows={g.awaySPProfile} framed={false} />
            </Stack>
            <Stack gap={4}>
              <Text weight="semibold">{`${g.home}: ${g.homeSP}`}</Text>
              <Table headers={["Metric","Value"]} rows={g.homeSPProfile} framed={false} />
            </Stack>
          </Grid>
          {(g.awayLineup.length > 0 || g.homeLineup.length > 0) && (
            <>
              <Divider />
              <H3>Lineups</H3>
              <Grid columns={2} gap={12}>
                {g.awayLineup.length > 0 && (
                  <Stack gap={4}>
                    <Text weight="semibold">{`${g.away} (${g.awayLuStatus})`}</Text>
                    <Table headers={["#","Name","Pos","xwOBA","xSLG","HH%","BRL%"]}
                      rows={g.awayLineup} striped stickyHeader />
                  </Stack>
                )}
                {g.homeLineup.length > 0 && (
                  <Stack gap={4}>
                    <Text weight="semibold">{`${g.home} (${g.homeLuStatus})`}</Text>
                    <Table headers={["#","Name","Pos","xwOBA","xSLG","HH%","BRL%"]}
                      rows={g.homeLineup} striped stickyHeader />
                  </Stack>
                )}
              </Grid>
            </>
          )}
          <Divider />
          <H3>Top Batter Matchups</H3>
          <Grid columns={2} gap={12}>
            <Stack gap={4}>
              <Text weight="semibold">{`${g.away} vs ${g.homeSP}`}</Text>
              <Table headers={["Batter","Rating","Why"]} rows={g.awayTopMatchups} />
            </Stack>
            <Stack gap={4}>
              <Text weight="semibold">{`${g.home} vs ${g.awaySP}`}</Text>
              <Table headers={["Batter","Rating","Why"]} rows={g.homeTopMatchups} />
            </Stack>
          </Grid>
          <Divider />
          <H3>Batter prop model (HR / 2+ TB)</H3>
          <Text size="small" tone="secondary">
            HR and 2+ TB probabilities from barrel/xSLG vs opponent xERA, park, and lineup coverage. Fair odds = 1/p. Market HR column reserved for Odds API; edge when blank.
          </Text>
          <Grid columns={2} gap={12}>
            <Stack gap={4}>
              <Text weight="semibold">{g.away}</Text>
              <Table
                headers={["Batter","HR%","2+ TB%","Fair HR","Fair 2+ TB","Mkt HR","Edge","Tier","Conf"]}
                rows={awayRows}
              />
            </Stack>
            <Stack gap={4}>
              <Text weight="semibold">{g.home}</Text>
              <Table
                headers={["Batter","HR%","2+ TB%","Fair HR","Fair 2+ TB","Mkt HR","Edge","Tier","Conf"]}
                rows={homeRows}
              />
            </Stack>
          </Grid>
          <Divider />
          <H3>Pitcher Outlooks</H3>
          <Table headers={["Pitcher","K Outlook","Outs","ER Risk","Tier"]} rows={spRows} />
          <Divider />
          <H3>Game Board</H3>
          <Table headers={["Category","Assessment"]} rows={[
            ["Best angle",g.bestAngle],
            ["Best batter matchup",g.bestBatter],
            ["Best prop angle",g.bestProp],
            ["Biggest risk",g.biggestRisk],
            ["Overall confidence",g.gameConf],
          ]} framed={false} />
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function MLBPregameIntel() {
  return (
    <Stack gap={20} style={{ maxWidth: 1100 }}>
      <H1>BLACK SHEEP — MLB Pregame Intel (Apr 15)</H1>
      <Text tone="secondary" size="small">
        12 games. Probability engine: 40% starters (Savant xERA) / 20% bullpens (neutral when unknown) / 25% lineups / 10% park–weather / 5% variance.
        Sources: MLB Stats API, Baseball Savant, RotoWire, Odds API (moneylines). No FanGraphs. Missing data degrades confidence; pipeline does not halt.
      </Text>
      <Text size="small" tone="secondary">
        Classification: A+ / A / B / C / D. Game side tier uses edge vs no-vig implied (A+ ≥8%, A ≥5%, B ≥2%, C small positive edge, D none).
        Batter tier uses the higher of intrinsic HR or 2+ TB grade from the prop model. No emojis per canvas style.
      </Text>
      <Divider />
      <H2>Game Reports</H2>
      {GAMES.map((g, i) => <GameCard key={i} g={g} />)}
      <Divider />
      <H2>Global Summary</H2>
      <H3>Best Sides / Totals</H3>
      <Table headers={["Bet","Game","Tier","Confidence","Key Logic"]}
        rows={[
          ["SEA ML -108","SEA@SD","A+","Medium","Hancock sustainable (87th xwOBA), Vasquez xERA 4.21, Petco"],
          ["TOR ML -122","TOR@MIL","A+","Medium","Cease swing-miss vs Patrick regression, dome"],
          ["SF ML -110","SF@CIN","A","Medium","SF lineup vs low-K Lowder, GABP + heat"],
          ["Over 10.5","LAA@NYY","B","Medium","Both SPs negative regression, 85F, wind out, short porch"],
          ["NYM +1.5 -131","NYM@LAD","B","Medium","Holmes groundball path vs steep LAD price"],
        ]}
        rowTone={["success","success","success","warning","warning"]}
      />
      <H3>Best HR Matchups</H3>
      <Table headers={["Batter","vs Pitcher","BRL%tile","vs Primary wOBA","Tier"]}
        rows={[
          ["S. Stewart (CIN)","T. Mahle (SF)","96th",".632 vs FF","A"],
          ["M. Trout (LAA)","L. Gil (NYY)","99th",".411 vs FF","B"],
          ["A. Judge (NYY)","J. Kochanowicz (LAA)","100th",".508 vs SI","A"],
          ["B. Rice (NYY)","J. Kochanowicz (LAA)","98th",".450 vs SI","A"],
          ["F. Alvarez (NYM)","S. Ohtani (LAD)","97th",".620 vs FF","A"],
          ["G. Sanchez (MIL)","D. Cease (TOR)","100th",".755 vs FF","C"],
          ["Y. Alvarez (HOU)","J. Quintana (COL)","95th",".414 vs FF","A"],
        ]}
      />
      <H3>Best 2+ Total Bases Matchups</H3>
      <Table headers={["Batter","vs Pitcher","xSLG","HH%tile","Tier"]}
        rows={[
          ["S. Stewart (CIN)","T. Mahle (SF)",".629","84th","A"],
          ["E. De La Cruz (CIN)","T. Mahle (SF)",".538","88th","A"],
          ["B. Rice (NYY)","J. Kochanowicz (LAA)",".680","100th","A+"],
          ["D. Rushing (LAD)","C. Holmes (NYM)","1.098","—","C"],
          ["M. Muncy (LAD)","C. Holmes (NYM)",".460","99th","A"],
          ["L. Raley (SEA)","R. Vasquez (SD)",".587","89th","A"],
          ["Y. Alvarez (HOU)","J. Quintana (COL)",".799","69th","A"],
        ]}
      />
      <H3>Best Strikeout Matchups (Pitcher)</H3>
      <Table headers={["Pitcher","K%tile","Whiff%tile","vs Lineup Profile","Tier"]}
        rows={[
          ["D. Cease (TOR)","97th","98th","MIL chase-prone, 62% avg whiff","A+"],
          ["J. Luzardo (PHI)","95th","94th","CHC lineup TBD — strong profile","C"],
          ["M. Montgomery (PIT)","99th","93rd","WSH lineup TBD — elite stuff","C"],
          ["S. Imanaga (CHC)","88th","66th","PHI lineup TBD — high chase (97th)","C"],
          ["E. Hancock (SEA)","84th","55th","SD moderate whiff exposure","C"],
        ]}
      />
      <H3>Top Passes</H3>
      <Table headers={["Game","Why Pass"]}
        rows={[
          ["TB@CWS","58% rain risk + Scholtens 17-PA sample — impossible to trust"],
          ["HOU -190 (COL@HOU)","Price too steep, Arrighetti no Savant data at all"],
          ["PIT -180 (WSH@PIT)","Price steep, lineups unconfirmed despite good SP matchup"],
          ["LAD -192 (NYM@LAD)","Price implies ~66% win probability — Holmes groundball game plan can keep it close"],
        ]}
      />
      <Divider />
      <Text tone="secondary" size="small">
        Sources: MLB Stats API (schedule/probables), RotoWire (lineups/weather/injuries),
        Baseball Savant (Statcast: xERA, xwOBA, percentiles, pitch/batter arsenals),
        Odds API (moneylines for implied probability). Optional: Action Network / Covers for line shopping.
        FanGraphs not used. No Reddit or low-quality tout sheets as primary reasoning.
      </Text>
    </Stack>
  );
}
