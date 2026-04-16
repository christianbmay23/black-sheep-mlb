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

/** Mirrors games-csv + enriched UI fields. Probables / posted LUs: MLB Stats API (2026-04-16). */
const SLATE: SlateGame[] = [
  {
    gameKey: "WSH@PIT",
    venue: "PNC Park",
    away: "WSH",
    home: "PIT",
    timeEt: "12:35 PM",
    awaySp: "Foster Griffin",
    homeSp: "Braxton Ashcraft",
    awayAmerican: 118,
    homeAmerican: -132,
    impliedAwayPct: 44.64,
    impliedHomePct: 55.36,
    modelAwayPct: 46.8,
    modelHomePct: 53.2,
    edgeAwayPct: 2.16,
    edgeHomePct: -2.16,
    prediction: "PIT",
    decisionTier: "C",
    edgeOnPickPct: -2.16,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
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
      { batter: "James Wood", team: "WSH", hrPct: 7.8, tb2Pct: 26.0, tier: "B", note: "LHB power vs RHP spot starter" },
    ],
    propsHome: [
      { batter: "Oneil Cruz", team: "PIT", hrPct: 6.9, tb2Pct: 24.5, tier: "B", note: "Barrels vs contact-oriented arm" },
      { batter: "Marcell Ozuna", team: "PIT", hrPct: 7.4, tb2Pct: 27.0, tier: "B", note: "Lift path vs FB-heavy approach" },
    ],
  },
  {
    gameKey: "SF@CIN",
    venue: "Great American Ball Park",
    away: "SF",
    home: "CIN",
    timeEt: "12:40 PM",
    awaySp: "Landen Roupp",
    homeSp: "Chase Burns",
    awayAmerican: 128,
    homeAmerican: -148,
    impliedAwayPct: 42.36,
    impliedHomePct: 57.64,
    modelAwayPct: 41.5,
    modelHomePct: 58.5,
    edgeAwayPct: -0.86,
    edgeHomePct: 0.86,
    prediction: "CIN",
    decisionTier: "B",
    edgeOnPickPct: 0.86,
    modelConfidence: "Medium",
    analystConfidence: "Medium-High",
    flags: "approx_market_ml",
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
      { batter: "Matt Chapman", team: "SF", hrPct: 7.0, tb2Pct: 24.0, tier: "B", note: "Fly-ball power vs power RHP" },
    ],
    propsHome: [
      { batter: "Elly De La Cruz", team: "CIN", hrPct: 8.2, tb2Pct: 30.0, tier: "A", note: "Elite tools + GABP" },
      { batter: "Spencer Steer", team: "CIN", hrPct: 6.5, tb2Pct: 25.0, tier: "C", note: "Lift vs LHP" },
    ],
  },
  {
    gameKey: "KC@DET",
    venue: "Comerica Park",
    away: "KC",
    home: "DET",
    timeEt: "1:10 PM",
    awaySp: "Kris Bubic",
    homeSp: "Keider Montero",
    awayAmerican: 108,
    homeAmerican: -124,
    impliedAwayPct: 46.48,
    impliedHomePct: 53.52,
    modelAwayPct: 44.2,
    modelHomePct: 55.8,
    edgeAwayPct: -2.28,
    edgeHomePct: 2.28,
    prediction: "DET",
    decisionTier: "C",
    edgeOnPickPct: 2.28,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
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
      { batter: "Vinnie Pasquantino", team: "KC", hrPct: 7.6, tb2Pct: 26.5, tier: "B", note: "LHB power vs RHP" },
      { batter: "Bobby Witt Jr.", team: "KC", hrPct: 6.2, tb2Pct: 24.0, tier: "B", note: "Speed + XB upside" },
    ],
    propsHome: [
      { batter: "Gleyber Torres", team: "DET", hrPct: 6.8, tb2Pct: 25.5, tier: "C", note: "RHB vs LHP" },
    ],
  },
  {
    gameKey: "LAA@NYY",
    venue: "Yankee Stadium",
    away: "LAA",
    home: "NYY",
    timeEt: "1:35 PM",
    awaySp: "Brent Suter",
    homeSp: "Max Fried",
    awayAmerican: 205,
    homeAmerican: -245,
    impliedAwayPct: 31.59,
    impliedHomePct: 68.41,
    modelAwayPct: 29.5,
    modelHomePct: 70.5,
    edgeAwayPct: -2.09,
    edgeHomePct: 2.09,
    prediction: "NYY",
    decisionTier: "PASS",
    edgeOnPickPct: 2.09,
    modelConfidence: "High",
    analystConfidence: "High",
    flags: "approx_market_ml",
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
      { batter: "Mike Trout", team: "LAA", hrPct: 7.0, tb2Pct: 25.0, tier: "B", note: "K watch vs Fried’s swing-miss" },
    ],
    propsHome: [
      { batter: "Aaron Judge", team: "NYY", hrPct: 11.5, tb2Pct: 34.0, tier: "A", note: "RHB vs soft LHP" },
      { batter: "Giancarlo Stanton", team: "NYY", hrPct: 8.5, tb2Pct: 28.0, tier: "A", note: "Short porch path" },
    ],
  },
  {
    gameKey: "TOR@MIL",
    venue: "American Family Field",
    away: "TOR",
    home: "MIL",
    timeEt: "1:40 PM",
    awaySp: "Patrick Corbin",
    homeSp: "Brandon Sproat",
    awayAmerican: -102,
    homeAmerican: -108,
    impliedAwayPct: 49.3,
    impliedHomePct: 50.7,
    modelAwayPct: 48.8,
    modelHomePct: 51.2,
    edgeAwayPct: -0.5,
    edgeHomePct: 0.5,
    prediction: "MIL",
    decisionTier: "PASS",
    edgeOnPickPct: 0.5,
    modelConfidence: "Low",
    analystConfidence: "Low",
    flags: "approx_market_ml;corbin_platoons",
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
      { batter: "Vladimir Guerrero Jr.", team: "TOR", hrPct: 8.0, tb2Pct: 29.0, tier: "B", note: "Hard contact vs volatile RHP" },
      { batter: "Daulton Varsho", team: "TOR", hrPct: 5.9, tb2Pct: 22.0, tier: "C", note: "K spot — swing-and-miss risk" },
    ],
    propsHome: [
      { batter: "William Contreras", team: "MIL", hrPct: 7.1, tb2Pct: 26.5, tier: "B", note: "RHB vs LHP" },
    ],
  },
  {
    gameKey: "TB@CWS",
    venue: "Rate Field",
    away: "TB",
    home: "CWS",
    timeEt: "2:10 PM",
    awaySp: "Steven Matz",
    homeSp: "Jordan Leasure",
    awayAmerican: -142,
    homeAmerican: 124,
    impliedAwayPct: 56.79,
    impliedHomePct: 43.21,
    modelAwayPct: 57.8,
    modelHomePct: 42.2,
    edgeAwayPct: 1.01,
    edgeHomePct: -1.01,
    prediction: "TB",
    decisionTier: "C",
    edgeOnPickPct: 1.01,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "approx_market_ml",
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
      { batter: "Junior Caminero", team: "TB", hrPct: 7.8, tb2Pct: 26.0, tier: "B", note: "Raw power vs opener/stretched SP" },
      { batter: "Yandy Díaz", team: "TB", hrPct: 5.2, tb2Pct: 21.5, tier: "C", note: "Contact > lift" },
    ],
    propsHome: [
      { batter: "Andrew Benintendi", team: "CWS", hrPct: 4.5, tb2Pct: 18.0, tier: "D", note: "K spot vs LHP shape" },
    ],
  },
  {
    gameKey: "TEX@ATH",
    venue: "Sutter Health Park",
    away: "TEX",
    home: "ATH",
    timeEt: "3:05 PM",
    awaySp: "Jack Leiter",
    homeSp: "Jacob Lopez",
    awayAmerican: -118,
    homeAmerican: 108,
    impliedAwayPct: 52.96,
    impliedHomePct: 47.04,
    modelAwayPct: 53.2,
    modelHomePct: 46.8,
    edgeAwayPct: 0.24,
    edgeHomePct: -0.24,
    prediction: "TEX",
    decisionTier: "PASS",
    edgeOnPickPct: 0.24,
    modelConfidence: "Low",
    analystConfidence: "Low",
    flags: "approx_market_ml;oak_coliseum_env",
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
      { batter: "Wyatt Langford", team: "TEX", hrPct: 7.0, tb2Pct: 25.0, tier: "B", note: "Lift vs RHP" },
      { batter: "Josh Jung", team: "TEX", hrPct: 6.6, tb2Pct: 23.5, tier: "B", note: "Pull power" },
    ],
    propsHome: [
      { batter: "Lawrence Butler", team: "ATH", hrPct: 6.9, tb2Pct: 24.0, tier: "B", note: "Athletic RH power" },
    ],
  },
  {
    gameKey: "BAL@CLE",
    venue: "Progressive Field",
    away: "BAL",
    home: "CLE",
    timeEt: "6:10 PM",
    awaySp: "Shane Baz",
    homeSp: "Parker Messick",
    awayAmerican: -128,
    homeAmerican: 118,
    impliedAwayPct: 55.03,
    impliedHomePct: 44.97,
    modelAwayPct: 54.6,
    modelHomePct: 45.4,
    edgeAwayPct: -0.43,
    edgeHomePct: 0.43,
    prediction: "BAL",
    decisionTier: "C",
    edgeOnPickPct: -0.43,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "approx_market_ml;lineup_not_posted_api",
    rationale:
      "Baz’s stuff plays when the heater is elevated; Messick needs to limit barrels. Small lean to Baltimore’s lineup ceiling if Baz holds a normal starter workload.",
    awayLuLabel: "Projected (away not posted — active roster)",
    homeLuLabel: "Posted (MLB API)",
    awayLineup: [
      ["1", "Gunnar Henderson", "SS"],
      ["2", "Colton Cowser", "LF"],
      ["3", "Pete Alonso", "1B"],
      ["4", "Coby Mayo", "3B"],
      ["5", "Leody Taveras", "CF"],
      ["6", "Taylor Ward", "DH"],
      ["7", "Samuel Basallo", "C"],
      ["8", "Dylan Beavers", "RF"],
      ["9", "Jeremiah Jackson", "2B"],
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
      { batter: "Gunnar Henderson", team: "BAL", hrPct: 6.8, tb2Pct: 25.0, tier: "B", note: "Power SS vs LHP" },
      { batter: "Coby Mayo", team: "BAL", hrPct: 6.2, tb2Pct: 22.0, tier: "C", note: "K risk — chase profile" },
    ],
    propsHome: [
      { batter: "David Fry", team: "CLE", hrPct: 6.0, tb2Pct: 23.5, tier: "C", note: "RHB vs Baz (stuff game)" },
    ],
  },
  {
    gameKey: "COL@HOU",
    venue: "Daikin Park",
    away: "COL",
    home: "HOU",
    timeEt: "8:10 PM",
    awaySp: "Juan Mejia",
    homeSp: "Ryan Weiss",
    awayAmerican: 240,
    homeAmerican: -290,
    impliedAwayPct: 28.34,
    impliedHomePct: 71.66,
    modelAwayPct: 24.0,
    modelHomePct: 76.0,
    edgeAwayPct: -4.34,
    edgeHomePct: 4.34,
    prediction: "HOU",
    decisionTier: "PASS",
    edgeOnPickPct: 4.34,
    modelConfidence: "High",
    analystConfidence: "High",
    flags: "approx_market_ml;lineup_not_posted_api",
    rationale:
      "Road Rockies vs Houston’s overall talent is a steep mismatch; Crawford Boxes pull-side HRs matter. Chalk is heavy — PASS unless you model innings/hooks differently.",
    awayLuLabel: "Projected (not posted — active roster)",
    homeLuLabel: "Projected (not posted — active roster)",
    awayLineup: [
      ["1", "Brenton Doyle", "CF"],
      ["2", "Ezequiel Tovar", "SS"],
      ["3", "Hunter Goodman", "1B"],
      ["4", "Jordan Beck", "RF"],
      ["5", "Mickey Moniak", "LF"],
      ["6", "Edouard Julien", "DH"],
      ["7", "Willi Castro", "3B"],
      ["8", "Tyler Freeman", "2B"],
      ["9", "Brett Sullivan", "C"],
    ],
    homeLineup: [
      ["1", "Jose Altuve", "2B"],
      ["2", "Yordan Alvarez", "DH"],
      ["3", "Christian Walker", "1B"],
      ["4", "Isaac Paredes", "3B"],
      ["5", "Carlos Correa", "SS"],
      ["6", "Yainer Diaz", "C"],
      ["7", "Cam Smith", "RF"],
      ["8", "Joey Loperfido", "LF"],
      ["9", "Taylor Trammell", "CF"],
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
      { batter: "Hunter Goodman", team: "COL", hrPct: 7.8, tb2Pct: 26.0, tier: "B", note: "Power path only — tough spot" },
    ],
    propsHome: [
      { batter: "Yordan Alvarez", team: "HOU", hrPct: 9.5, tb2Pct: 31.0, tier: "A", note: "LHB vs RHP spot starter" },
      { batter: "Christian Walker", team: "HOU", hrPct: 6.5, tb2Pct: 23.0, tier: "B", note: "Lift vs FB" },
    ],
  },
  {
    gameKey: "SEA@SD",
    venue: "Petco Park",
    away: "SEA",
    home: "SD",
    timeEt: "8:40 PM",
    awaySp: "Luis Castillo",
    homeSp: "Walker Buehler",
    awayAmerican: -104,
    homeAmerican: -112,
    impliedAwayPct: 49.11,
    impliedHomePct: 50.89,
    modelAwayPct: 49.8,
    modelHomePct: 50.2,
    edgeAwayPct: 0.69,
    edgeHomePct: -0.69,
    prediction: "SD",
    decisionTier: "PASS",
    edgeOnPickPct: -0.69,
    modelConfidence: "Medium",
    analystConfidence: "Medium",
    flags: "approx_market_ml;lineup_not_posted_api",
    rationale:
      "Castillo vs Buehler is a true ace duel; Petco suppresses offense. Side market is rightfully tight — prefer game props over ML.",
    awayLuLabel: "Projected (not posted — active roster)",
    homeLuLabel: "Projected (not posted — active roster)",
    awayLineup: [
      ["1", "J.P. Crawford", "SS"],
      ["2", "Julio Rodríguez", "CF"],
      ["3", "Cal Raleigh", "C"],
      ["4", "Josh Naylor", "1B"],
      ["5", "Randy Arozarena", "LF"],
      ["6", "Dominic Canzone", "DH"],
      ["7", "Luke Raley", "RF"],
      ["8", "Brendan Donovan", "2B"],
      ["9", "Connor Joe", "3B"],
    ],
    homeLineup: [
      ["1", "Fernando Tatis Jr.", "RF"],
      ["2", "Xander Bogaerts", "SS"],
      ["3", "Manny Machado", "3B"],
      ["4", "Jackson Merrill", "CF"],
      ["5", "Jake Cronenworth", "2B"],
      ["6", "Ty France", "1B"],
      ["7", "Luis Campusano", "C"],
      ["8", "Nick Castellanos", "LF"],
      ["9", "Miguel Andujar", "DH"],
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
      { batter: "Julio Rodríguez", team: "SEA", hrPct: 6.2, tb2Pct: 23.5, tier: "C", note: "K watch vs Buehler" },
    ],
    propsHome: [
      { batter: "Fernando Tatis Jr.", team: "SD", hrPct: 6.5, tb2Pct: 24.0, tier: "C", note: "Athleticism vs elite stuff" },
      { batter: "Manny Machado", team: "SD", hrPct: 5.8, tb2Pct: 22.5, tier: "C", note: "Contact-over-HR vs Castillo" },
    ],
  },
];

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

function confTone(c: string): "success" | "warning" | "info" | "neutral" {
  if (c === "High") return "success";
  if (c === "Medium" || c === "Medium-High") return "warning";
  return "neutral";
}

function GameCard({ g }: { g: SlateGame }) {
  const ml = `${g.away} ${g.awayAmerican > 0 ? `+${g.awayAmerican}` : g.awayAmerican} / ${g.home} ${g.homeAmerican > 0 ? `+${g.homeAmerican}` : g.homeAmerican}`;
  const pickIsHome = g.prediction === g.home;
  const propsAwayRows = g.propsAway.map((p) => [
    p.batter,
    `${p.hrPct.toFixed(1)}%`,
    `${p.tb2Pct.toFixed(1)}%`,
    p.tier,
    p.note,
  ]);
  const propsHomeRows = g.propsHome.map((p) => [
    p.batter,
    `${p.hrPct.toFixed(1)}%`,
    `${p.tb2Pct.toFixed(1)}%`,
    p.tier,
    p.note,
  ]);

  return (
    <Card collapsible defaultOpen={false}>
      <CardHeader
        trailing={
          <Row gap={6}>
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
                headers={["Batter", "HR%", "2+ TB%", "Tier", "Notes"]}
                rows={propsAwayRows}
                framed={false}
              />
            </Stack>
            <Stack gap={4}>
              <Text weight="semibold">{g.home}</Text>
              <Table
                headers={["Batter", "HR%", "2+ TB%", "Tier", "Notes"]}
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

function allPropRows(): { batter: string; game: string; hr: number; tb2: number; tier: string }[] {
  const out: { batter: string; game: string; hr: number; tb2: number; tier: string }[] = [];
  for (const g of SLATE) {
    for (const p of [...g.propsAway, ...g.propsHome]) {
      out.push({ batter: p.batter, game: g.gameKey, hr: p.hrPct, tb2: p.tb2Pct, tier: p.tier });
    }
  }
  return out;
}

export default function Apr16Canvas() {
  const props = allPropRows();
  const topHr = [...props].sort((a, b) => b.hr - a.hr).slice(0, 8);
  const topTb = [...props].sort((a, b) => b.tb2 - a.tb2).slice(0, 8);
  const bestBets = [
    ["CIN ML (lean)", "SF@CIN", "B", "Best tier vs approx line; GABP run env", "Medium-High"],
    ["DET ML (small)", "KC@DET", "C", "Largest raw edge vs approx; still modest tier", "Medium"],
    ["TB ML (small)", "TB@CWS", "C", "Rays roster vs stretched starter", "Medium"],
  ];
  const passList = [
    "LAA@NYY — ML PASS (price reflects Fried vs Suter)",
    "TOR@MIL — ML PASS (coin flip; command volatility both sides)",
    "TEX@ATH — ML PASS (tight market, short leashes)",
    "COL@HOU — ML PASS (heavy chalk)",
    "SEA@SD — ML PASS (ace duel; Petco)",
  ];

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
        rows={topHr.map((r, i) => [String(i + 1), r.batter, r.game, `${r.hr.toFixed(1)}%`, r.tier])}
      />

      <H3>Top 2+ TB targets (model)</H3>
      <Table
        headers={["Rank", "Batter", "Game", "2+ TB%", "Tier"]}
        rows={topTb.map((r, i) => [String(i + 1), r.batter, r.game, `${r.tb2.toFixed(1)}%`, r.tier])}
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
report_date,away,home,start_time_et,away_sp,home_sp,away_american,home_american,implied_away_pct_nv,implied_home_pct_nv,model_away_win_pct,model_home_win_pct,edge_away_pct,edge_home_pct,prediction,decision_tier_vs_market,edge_on_pick_pct,model_confidence,missing_data_flags,analyst_confidence,rationale_summary
2026-04-16,WSH,PIT,12:35 PM,Foster Griffin,Braxton Ashcraft,118,-132,44.64,55.36,46.80,53.20,2.16,-2.16,PIT,C,-2.16,Medium,approx_market_ml,Medium,Probables Griffin (WSH) and Ashcraft (PIT) look like swing/spot roles without big separator stuff. PNC is slightly pitcher-friendly; Pirates get a small home edge but the price is close to fair.
2026-04-16,SF,CIN,12:40 PM,Landen Roupp,Chase Burns,128,-148,42.36,57.64,41.50,58.50,-0.86,0.86,CIN,B,0.86,Medium,approx_market_ml,Medium-High,"Burns at home brings premium velocity; Roupp works contact and weak barrels. GABP raises HR/TB volatility — lean Reds, but mostly a props/team-total environment."
2026-04-16,KC,DET,1:10 PM,Kris Bubic,Keider Montero,108,-124,46.48,53.52,44.20,55.80,-2.28,2.28,DET,C,2.28,Medium,approx_market_ml,Medium,Bubic vs Montero is young-starter volatility; Comerica trims some extra-base noise. Slight DET home lean without a commanding pitching edge.
2026-04-16,LAA,NYY,1:35 PM,Brent Suter,Max Fried,205,-245,31.59,68.41,29.50,70.50,-2.09,2.09,NYY,PASS,2.09,High,approx_market_ml,High,Suter vs Fried is a massive talent mismatch; short porch amplifies fly-ball damage. Market already prices a big NYY edge — PASS on ML unless you have a materially better number.
2026-04-16,TOR,MIL,1:40 PM,Patrick Corbin,Brandon Sproat,-102,-108,49.30,50.70,48.80,51.20,-0.50,0.50,MIL,PASS,0.50,Low,approx_market_ml;corbin_platoons,Low,"Corbin vs Sproat is command volatility on both sides; Milwaukee navigation is a hair better at home, but this is effectively a coin flip for betting."
2026-04-16,TB,CWS,2:10 PM,Steven Matz,Jordan Leasure,-142,124,56.79,43.21,57.80,42.20,1.01,-1.01,TB,C,1.01,Medium,approx_market_ml,Medium,Matz’s LHP shape matters against Chicago’s lefty bats; Leasure stretched as a starter adds volatility. Rays are the cleaner roster spot — edge is modest.
2026-04-16,TEX,ATH,3:05 PM,Jack Leiter,Jacob Lopez,-118,108,52.96,47.04,53.20,46.80,0.24,-0.24,TEX,PASS,0.24,Low,approx_market_ml;oak_coliseum_env,Low,"Leiter vs Lopez profiles as short-leash, high-volatility. No compelling gap vs a tight market without a better posted price."
2026-04-16,BAL,CLE,6:10 PM,Shane Baz,Parker Messick,-128,118,55.03,44.97,54.60,45.40,-0.43,0.43,BAL,C,-0.43,Medium,approx_market_ml;lineup_not_posted_api,Medium,Baz’s stuff plays when the heater is elevated; Messick needs to limit barrels. Small lean to Baltimore’s lineup ceiling if Baz holds a normal starter workload.
2026-04-16,COL,HOU,8:10 PM,Juan Mejia,Ryan Weiss,240,-290,28.34,71.66,24.00,76.00,-4.34,4.34,HOU,PASS,4.34,High,approx_market_ml;lineup_not_posted_api,High,Road Rockies vs Houston’s overall talent is a steep mismatch; Crawford Boxes pull-side HRs matter. Chalk is heavy — PASS unless you model innings/hooks differently.
2026-04-16,SEA,SD,8:40 PM,Luis Castillo,Walker Buehler,-104,-112,49.11,50.89,49.80,50.20,0.69,-0.69,SD,PASS,-0.69,Medium,approx_market_ml;lineup_not_posted_api,Medium,Castillo vs Buehler is a true ace duel; Petco suppresses offense. Side market is rightfully tight — prefer game props over ML.
<!-- games-csv:end -->

<!-- batter-outlooks-csv:start -->
report_date,game,team,batter,opponent_pitcher,hr_prob_pct,tb2_prob_pct,fair_hr_american,fair_2tb_american,market_hr_american,edge_hr_pct,tier,data_confidence
2026-04-16,WSH@PIT,WSH,James Wood,Braxton Ashcraft,7.80,26.00,+1182,+285,NA,0.00,B,High — posted LU
2026-04-16,WSH@PIT,PIT,Oneil Cruz,Foster Griffin,6.90,24.50,+1349,+308,NA,0.00,B,High — posted LU
2026-04-16,WSH@PIT,PIT,Marcell Ozuna,Foster Griffin,7.40,27.00,+1251,+270,NA,0.00,B,High — posted LU
2026-04-16,SF@CIN,CIN,Elly De La Cruz,Landen Roupp,8.20,30.00,+1120,+233,NA,0.00,A,High — posted LU
2026-04-16,SF@CIN,CIN,Spencer Steer,Landen Roupp,6.50,25.00,+1438,+300,NA,0.00,C,High — posted LU
2026-04-16,SF@CIN,SF,Matt Chapman,Chase Burns,7.00,24.00,+1329,+317,NA,0.00,B,High — posted LU
2026-04-16,KC@DET,DET,Gleyber Torres,Kris Bubic,6.80,25.50,+1371,+292,NA,0.00,C,High — posted LU
2026-04-16,KC@DET,KC,Vinnie Pasquantino,Keider Montero,7.60,26.50,+1216,+277,NA,0.00,B,High — posted LU
2026-04-16,KC@DET,KC,Bobby Witt Jr.,Keider Montero,6.20,24.00,+1513,+317,NA,0.00,B,High — posted LU
2026-04-16,LAA@NYY,NYY,Aaron Judge,Brent Suter,11.50,34.00,+770,+194,NA,0.00,A,High — posted LU
2026-04-16,LAA@NYY,NYY,Giancarlo Stanton,Brent Suter,8.50,28.00,+1076,+257,NA,0.00,A,High — posted LU
2026-04-16,LAA@NYY,LAA,Mike Trout,Max Fried,7.00,25.00,+1329,+300,NA,0.00,B,High — posted LU (K watch)
2026-04-16,TOR@MIL,TOR,Vladimir Guerrero Jr.,Brandon Sproat,8.00,29.00,+1150,+245,NA,0.00,B,High — posted LU
2026-04-16,TOR@MIL,MIL,William Contreras,Patrick Corbin,7.10,26.50,+1308,+277,NA,0.00,B,High — posted LU
2026-04-16,TOR@MIL,TOR,Daulton Varsho,Brandon Sproat,5.90,22.00,+1595,+355,NA,0.00,C,High — posted LU (K spot)
2026-04-16,TB@CWS,TB,Junior Caminero,Jordan Leasure,7.80,26.00,+1182,+285,NA,0.00,B,High — posted LU
2026-04-16,TB@CWS,TB,Yandy Díaz,Jordan Leasure,5.20,21.50,+1823,+365,NA,0.00,C,High — posted LU
2026-04-16,TB@CWS,CWS,Andrew Benintendi,Steven Matz,4.50,18.00,+2122,+456,NA,0.00,D,High — posted LU (K spot)
2026-04-16,TEX@ATH,TEX,Wyatt Langford,Jacob Lopez,7.00,25.00,+1329,+300,NA,0.00,B,High — posted LU
2026-04-16,TEX@ATH,TEX,Josh Jung,Jacob Lopez,6.60,23.50,+1415,+326,NA,0.00,B,High — posted LU
2026-04-16,TEX@ATH,ATH,Lawrence Butler,Jack Leiter,6.90,24.00,+1349,+317,NA,0.00,B,High — posted LU
2026-04-16,BAL@CLE,BAL,Gunnar Henderson,Parker Messick,6.80,25.00,+1371,+300,NA,0.00,B,Med — active roster (LU TBD)
2026-04-16,BAL@CLE,BAL,Coby Mayo,Parker Messick,6.20,22.00,+1513,+355,NA,0.00,C,Med — roster (K risk)
2026-04-16,BAL@CLE,CLE,David Fry,Shane Baz,6.00,23.50,+1567,+326,NA,0.00,C,Med — active roster (LU TBD)
2026-04-16,COL@HOU,HOU,Yordan Alvarez,Juan Mejia,9.50,31.00,+953,+223,NA,0.00,A,Med — active roster (LU TBD)
2026-04-16,COL@HOU,HOU,Christian Walker,Juan Mejia,6.50,23.00,+1438,+335,NA,0.00,B,Med — roster
2026-04-16,COL@HOU,COL,Hunter Goodman,Ryan Weiss,7.80,26.00,+1182,+285,NA,0.00,B,Med — roster (power path)
2026-04-16,SEA@SD,SD,Fernando Tatis Jr.,Luis Castillo,6.50,24.00,+1438,+317,NA,0.00,C,Med — roster (ace matchup)
2026-04-16,SEA@SD,SD,Manny Machado,Luis Castillo,5.80,22.50,+1624,+344,NA,0.00,C,Med — roster
2026-04-16,SEA@SD,SEA,Julio Rodríguez,Walker Buehler,6.20,23.50,+1513,+326,NA,0.00,C,Med — roster (K watch)
<!-- batter-outlooks-csv:end -->
*/
