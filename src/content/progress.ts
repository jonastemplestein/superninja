// Progress on the World Flower: how far each petal (a sound) and each gem in it (one spelling of that sound) has come.
// Pure functions of a save and a time: no React, no store, no clock unless you leave `now` out. The model and the
// reasons for every number are in docs/scroll-design/progress-model.md.
//
// A petal is MISSING until the child meets one of its spellings in a lesson, then a faint OUTLINE, then FILLING as its
// gems charge and are won, then COMPLETE (for the child's stage) when every spelling taught so far has been won. The
// chart still shows the spellings still to come, and `complete.full` says when the whole column is won.
// A gem climbs unseen → met → practising → ready → won → mastered, with a value 0..1 towards mastery. Time never takes
// a stage away; it makes the gem dusty (`fading`), and its `value` falls towards half of what was achieved.
//
// It reads only what the save records (engine/store.ts): energy, gems won, the reading and spelling records per
// spelling>sound pair, the words read and spelt, stars, placement and the World Flower trips. The tested learner model
// in src/core (BKT plus forgetting) is not wired into the game yet; when it is, `evidenceOf` and `recallOf` are where its
// pKnown, recall and status take over (progress-model.md §6).
import type { Save } from "../engine/store";
import { PETALS, type Gem, type Petal } from "./flower";
import { GRAPHEMES, UNITS, WORDS, dictationSafe, teachEntry, type PhonemeId, type Word } from "./phonics";
import { LEVELS, knownSpellings, type Level } from "./worlds";
import { firstTaught, unitIndex, SW_SEQUENCE, type GpcKey, type SwUnitId } from "./sw";
import { twoSoundsKey } from "./narrative";

// ================================================================================================= the numbers

/** A gem is full at this much energy (engine/store.ts ENERGY_FULL; the test checks they agree). */
export const ENERGY_FULL = 8;
export const DAY = 86_400_000;

/** A gem's value (0..1, towards mastery) at each rung. Practising runs from `met` to `ready` with the gem's energy;
 *  won runs from `won` to `mastered` with consolidation (the four MASTERY criteria). */
export const LADDER = { met: 0.05, ready: 0.6, won: 0.8, mastered: 1 } as const;

/** Mastered = won, and all four: right at least 80% of the time (the Sounds~Write 75–80% proficiency rule and the core's
 *  `secure.pKnown`), over at least 10 answers (a spelt sound counts 1, a word read ½, as gem energy does), in at least 3
 *  different words (fewer if the game has fewer), on at least 2 different days (the core's `secure.minSessions`). */
export const MASTERY = { accuracy: 0.8, attempts: 10, words: 3, days: 2 } as const;

/** Forgetting. Half-life in days: 7 while practising, 14 once won, doubled for each further day of use (up to 3 times).
 *  A won gem is fading when recall is below 0.8 (the core's `desiredRetention`); forgetting costs at most half of what
 *  was achieved (the core's `rFloor`). Uses on the same day (within 12 hours) count as one. A petal is dusty when at
 *  least a tenth of its fill is (what its won gems at the fading line would give). */
export const MEMORY = { practising: 7, won: 14, doublings: 3, fadeBelow: 0.8, floor: 0.5, sameDayH: 12, dustyPetal: 0.1 } as const;

/** How much a spelling counts in its petal's fill, by where Sounds~Write first teaches it: the Initial Code and the
 *  Bridging Unit (the basic code, in the most words) 3; the Extended Code in Year 1 (first spellings) 2; Year 2 (more
 *  spellings) and anything the code units never teach (the polysyllabic strand) 1. Sounds~Write orders by frequency. */
export type SpellingTier = "basic" | "first" | "more" | "beyond";
export const TIER_WEIGHT: Record<SpellingTier, number> = { basic: 3, first: 2, more: 1, beyond: 1 };

// ================================================================================================= types

export type GemStage = "unseen" | "met" | "practising" | "ready" | "won" | "mastered";
export const GEM_STAGES: readonly GemStage[] = ["unseen", "met", "practising", "ready", "won", "mastered"];
export type PetalState = "missing" | "outline" | "filling" | "complete";
export const PETAL_STATES: readonly PetalState[] = ["missing", "outline", "filling", "complete"];

export interface ProgressOpts {
  /** the time to judge recency at (default Date.now()); tests and replays pass it */
  now?: number;
}

export interface GemParts {
  /** the game can teach it (it has words); a gem that is not is "far away" */
  inPlay: boolean;
  /** the lesson that teaches it has been played, or the child was placed past it, or it has been used */
  taught: boolean;
  /** the gem's charge 0..1 (energy / ENERGY_FULL); 1 once won (a won gem charges no more) */
  energy: number;
  /** its Gem Trial has been won */
  trial: boolean;
  /** answers with this pairing: each spelt sound counts 1, each word read ½ (as gem energy does) */
  attempts: number;
  /** share right, smoothed (right + 1) / (attempts + 2); the game records a sound as right only with no miss in the word
   *  so far, so this is close to "right first time" */
  accuracy: number;
  /** the current run of right answers (the better of reading and spelling) */
  streak: number;
  /** different words with this pairing read or spelt right */
  words: number;
  /** the words needed for mastery: MASTERY.words, or fewer if the game has fewer words with it */
  wordsNeeded: number;
  /** different days it was used on (a lower bound: the save keeps only the last time per word and per pairing) */
  days: number;
  /** the last time it was used (ms), null if never */
  lastAt: number | null;
  daysSince: number | null;
  /** half-life of the memory, in days */
  halfLife: number;
  /** 0..1: 2^(-daysSince / halfLife); null before it has been used */
  recall: number | null;
  /** charged by placement (Show Sensei / the school-year start), not by play */
  assumed: boolean;
  /** 0..1 after the trial: the mean of the four MASTERY criteria (1 = mastered) */
  consolidation: number;
  /** the value before forgetting: what has been achieved (it never falls with time) */
  achieved: number;
}

export interface GemProgress {
  key: string;
  g: string;
  p: PhonemeId;
  stage: GemStage;
  /** 0..1 progress towards mastery now: `parts.achieved` less what has been forgotten (at most half) */
  value: number;
  /** won, but not used for a while: recall below MEMORY.fadeBelow (the core's "fading" is likewise a status of what was
   *  secure). Shown as dust; practice polishes it. A gem still charging loses value with time but is never dusty */
  fading: boolean;
  /** the Sounds~Write unit that first teaches it (null: the code units never do) */
  sw: SwUnitId | null;
  tier: SpellingTier;
  parts: GemParts;
}

export interface PetalSpelling extends GemProgress {
  /** counts towards "complete for your stage": taught to this child (or won) */
  expected: boolean;
  /** its weight in the petal's fill (TIER_WEIGHT; <x> 1) */
  weight: number;
  /** the other sounds this spelling represents on the chart (ea in /ee/: ["ae", "e"]) */
  otherSounds: PhonemeId[];
  /** a word with this spelling for this sound (a game word when the game has one) */
  example: string | null;
}

export interface PetalSummary {
  p: PhonemeId;
  state: PetalState;
  /** 0..1 towards complete for the child's stage, from what was achieved (never falls with time) */
  fill: number;
  /** 0..1, `fill` after forgetting (≤ fill, at least half of it): the part between them is dusty */
  fresh: number;
  /** 0..1 past complete towards mastered: every expected gem mastered = 1 */
  polish: number;
  /** 0..1 over the whole chart column (every spelling of the sound, the whole programme) */
  whole: number;
  /** dusty: at least MEMORY.dustyPetal of the fill has been forgotten (fill − fresh) */
  fading: boolean;
  complete: {
    /** every spelling taught so far is won: the petal is full, for now ("complete for your stage") */
    stage: boolean;
    /** every spelling this version of the game can teach is won (engine/gems.ts petalComplete: the petal flies home) */
    game: boolean;
    /** every spelling on the chart is won: the whole programme */
    full: boolean;
  };
  /** the game can teach at least one of its spellings */
  reachable: boolean;
  /** missing, but a lesson in the child's current land teaches one of its spellings: "hiding in this land" (the World
   *  Flower's hint shimmer; engine/gems.ts worldNewSounds) */
  soon: boolean;
  /** gems ready for a Gem Trial (the map's gold dot) */
  ready: number;
  counts: { spellings: number; inPlay: number; expected: number; won: number; mastered: number };
}

export interface PetalProgress extends PetalSummary {
  /** every spelling on the chart, in the chart's order */
  spellings: PetalSpelling[];
}

export interface FlowerOverview {
  stage: Stage;
  /** all 44 petals, in the chart's order (CHART_PETALS) */
  petals: PetalSummary[];
  counts: Record<PetalState, number> & { full: number; reachable: number; fading: number; ready: number };
  /** the mean fill of the petals met (0 before any): how full the child's own flower is */
  fill: number;
  /** the mean `whole` of all 44 petals: how far through the whole chart */
  whole: number;
}

/** Where a child is: the spelling>sound pairs they have been taught (the fill's denominator). */
export interface Stage {
  /** gem keys taught (or won) */
  taught: ReadonlySet<string>;
  /** the furthest Sounds~Write unit among them (the game's Sky Temple mixes EC1, EC2, EC4 and EC11), null before any */
  unit: SwUnitId | null;
  /** the level the child is up to, when the stage comes from a save */
  frontier: string | null;
}

export interface SoundOfSpelling {
  p: PhonemeId;
  key: string;
  sw: SwUnitId | null;
  tier: SpellingTier;
  inPlay: boolean;
  example: string | null;
  /** <x>: one spelling for two sounds together (/k/ + /s/), not one of several sounds */
  together?: true;
}

export interface MultiSound {
  g: string;
  /** the sounds it represents at this stage, in teaching order (two or more) */
  sounds: SoundOfSpelling[];
  /** the sounds on the chart it will also represent later */
  later: SoundOfSpelling[];
  /** has Sensei explained that this spelling has more than one sound? (the narrative ledger; null without a save) */
  discussed: boolean | null;
  /** the ledger key (content/narrative.ts twoSoundsKey) */
  ledgerKey: string;
}

// ================================================================================================= static data

const GEM_BY_KEY = new Map<string, Gem>();
for (const pt of PETALS) for (const g of pt.gems) if (!GEM_BY_KEY.has(g.key)) GEM_BY_KEY.set(g.key, g);

const hasKey = (w: Word, key: string) => w.segs.some((s) => (key === "x>ks" ? s.g === "x" : `${s.g}>${s.p}` === key));
const WORDS_WITH = new Map<string, Word[]>();
for (const key of GEM_BY_KEY.keys()) WORDS_WITH.set(key, WORDS.filter((w) => hasKey(w, key)));

/** The spelling whose teaching makes a gem met: < q > for the /w/ of < qu > (as engine/gems.ts). */
const spellingOf = (g: Pick<Gem, "g" | "p">) => (g.g === "u" && g.p === "w" ? "q" : g.g);

const swCache = new Map<string, SwUnitId | null>();
/** The Sounds~Write unit that first teaches a pairing: under the official 2024 coding, or, for the chart's split
 *  spellings (a-e, i-e, o-e, u-e: Freshford's chart), under the split coding. Null: no code unit teaches it. */
export function swUnitOf(key: string): SwUnitId | null {
  if (!swCache.has(key)) {
    const k = key as GpcKey;
    swCache.set(key, firstTaught(k) ?? firstTaught(k, { split: "split" }) ?? null);
  }
  return swCache.get(key)!;
}
export function tierOf(key: string): SpellingTier {
  const u = swUnitOf(key);
  if (!u) return "beyond";
  if (u.startsWith("IC") || u === "BR") return "basic";
  return Number(u.slice(2)) <= 26 ? "first" : "more";
}
const weightOf = (key: string) => (key === "x>ks" ? 1 : TIER_WEIGHT[tierOf(key)]);

/** Words for the spellings the game has no words for yet: from the Sounds~Write unit word lists (src/content/units,
 *  official 2024 coding; the split spellings as their consonant + e words) and, where those have none, well-known words. */
const CHART_EXAMPLES: Record<string, string> = {
  "a-e>ae": "cake", "ea>ae": "steak", "ei>ae": "vein", "ey>ae": "grey", "eigh>ae": "sleigh", "e>ee": "he", "y>ee": "happy", "ey>ee": "key",
  "ie>ee": "field", "i>ee": "ski", "oi>oy": "coin", "oy>oy": "boy", "i>ie": "bike", "i-e>ie": "bike", "y>ie": "sky", "o-e>oe": "bone",
  "o>oe": "bone", "oe>oe": "toe", "ou>oe": "mould", "ough>oe": "dough", "oo>uu": "foot", "u>uu": "bull", "oul>uu": "could", "er>er": "her",
  "ir>er": "girl", "ur>er": "church", "or>er": "worm", "ar>er": "collar", "ear>er": "earth", "our>er": "journey", "ar>ar": "car",
  "a>ar": "father", "al>ar": "palm", "au>ar": "aunt", "ow>ou": "cow", "ou>ou": "house", "oo>oo": "spoon", "ew>oo": "chew", "u-e>oo": "flute",
  "o>oo": "to", "ue>oo": "glue", "ough>oo": "through", "u>oo": "flute", "ui>oo": "juice", "ou>oo": "soup", "u>ue": "cube", "ew>ue": "stew",
  "u-e>ue": "cube", "ue>ue": "due", "or>or": "horse", "aw>or": "paw", "ar>or": "dwarf", "al>or": "talk", "au>or": "sauce", "a>or": "water",
  "oar>or": "board", "augh>or": "caught", "ough>or": "bought", "ore>or": "shore", "our>or": "four", "air>air": "hair", "are>air": "care",
  "ear>air": "bear", "ere>air": "there", "eir>air": "their", "st>s": "listen", "c>s": "cell", "ce>s": "fence", "se>s": "purse", "sc>s": "scent",
  "le>l": "whale", "al>l": "medal", "el>l": "camel", "il>l": "pencil", "ol>l": "petrol", "ph>f": "phone", "gh>f": "laugh", "ea>e": "head",
  "ai>e": "said", "ou>u": "touch", "o>u": "come", "a>o": "watch", "dd>d": "add", "ed>d": "played", "ui>i": "build", "e>i": "pretty",
  "y>i": "gym", "nn>n": "dinner", "ne>n": "bone", "gn>n": "gnome", "kn>n": "knee", "vv>v": "savvy", "g>j": "gentle", "ge>j": "huge",
  "dge>j": "fridge", "gg>g": "egg", "gh>g": "ghost", "gu>g": "guest", "mm>m": "jammed", "mb>m": "lamb", "mn>m": "autumn", "wh>h": "who",
  "ch>k": "school", "cc>k": "soccer", "rr>r": "carrot", "rh>r": "rhyme", "wr>r": "wrist", "tt>t": "mitt", "bt>t": "debt", "te>t": "gate",
  "ze>z": "freeze", "s>z": "dogs", "se>z": "please", "ss>z": "scissors", "ear>eer": "ear", "eer>eer": "deer", "ere>eer": "here",
  "pp>p": "apple", "bb>b": "rabbit", "ch>sh": "chef", "ti>sh": "station", "ci>sh": "special", "ssi>sh": "mission", "s>sh": "sugar",
  "n>ng": "wink", "s>zh": "treasure", "si>zh": "vision", "ge>zh": "beige", "a>schwa": "banana", "e>schwa": "garden", "o>schwa": "lemon",
  "u>schwa": "circus", "er>schwa": "sister", "our>schwa": "colour",
};
/** A word for a pairing: a game word (a short one with a picture first), else CHART_EXAMPLES. */
export function exampleOf(key: string): string | null {
  const ws = WORDS_WITH.get(key) ?? [];
  return (ws.find((w) => w.pic && w.segs.length <= 4) ?? ws.find((w) => w.pic) ?? ws[0])?.text ?? CHART_EXAMPLES[key] ?? null;
}

// ================================================================================================= what the child has been taught

/** The level the child is up to: the first without stars, from their placement on (engine/gems.ts frontier). */
export function frontierOf(s: Save): Level {
  const start = s.placedAt ? LEVELS.findIndex((l) => l.id === s.placedAt) : 0;
  return LEVELS.find((l, i) => i >= start && !((s.stars[l.id] ?? 0) > 0)) ?? LEVELS[LEVELS.length - 1];
}
/** Spellings the game treats as known (engine/gems.ts knownNow): up to and including the frontier, and placement's. */
export function knownOf(s: Save): Set<string> {
  const k = knownSpellings(frontierOf(s));
  for (const g of s.petals ?? []) k.add(g);
  return k;
}
/** Words that can test a gem in its Gem Trial: they use it, and only spellings known (engine/gems.ts trialPool). */
export function trialPool(key: string, known: ReadonlySet<string>): Word[] {
  return (WORDS_WITH.get(key) ?? []).filter((w) => w.segs.every((s) => known.has(s.g)) && dictationSafe(w));
}

/** The pairs a spelling brings when a unit or a placement teaches it (phonics.ts CHART): < th > both /th/ and /dh/,
 *  < q > /k/ and the /w/ of its < u >, < x > the /k/+/s/ gem; otherwise its usual sound. */
const pairsOfSpelling = (g: string): string[] =>
  g === "x" ? ["x>ks"] : g === "th" ? ["th>th", "th>dh"] : g === "q" ? ["q>k", "u>w"] : GRAPHEMES[g] ? [`${g}>${GRAPHEMES[g]}`] : [];
const pairOfTeach = (t: string) => {
  const sg = teachEntry(t);
  return sg.g === "x" ? ["x>ks"] : sg.g === "q" ? ["q>k", "u>w"] : [`${sg.g}>${sg.p}`];
};
/** Pairs taught by a level and everything before it (by pair, not by spelling: when < ea > as /e/ has its own lesson, a
 *  lesson on < ea > as /ee/ does not teach it). */
function pairsUpTo(l: Level): Set<string> {
  const out = new Set<string>();
  for (const u of UNITS) if (u.id < Math.min(...l.units)) for (const g of u.spellings) for (const k of pairsOfSpelling(g)) out.add(k);
  for (const lv of LEVELS) {
    for (const t of lv.teach ?? []) for (const k of pairOfTeach(t)) out.add(k);
    if (lv.id === l.id) break;
  }
  return out;
}

interface Ctx {
  s: Save;
  now: number;
  known: Set<string>;
  frontier: Level;
  /** pairs taught by the levels played (and placement) */
  taughtPairs: Set<string>;
  /** pairs the frontier level itself introduces: the game shows them one lesson early; the child hasn't had it yet */
  comingNext: Set<string>;
  seen: Set<string>;
  /** pairs taught by the lessons of the child's current land */
  inLand: Set<string>;
  memo: Map<string, GemProgress>;
}
function ctxOf(s: Save, opts: ProgressOpts = {}): Ctx {
  const frontier = frontierOf(s);
  const i = LEVELS.indexOf(frontier);
  const played = (s.stars[frontier.id] ?? 0) > 0;
  const before = played ? pairsUpTo(frontier) : i > 0 ? pairsUpTo(LEVELS[i - 1]) : new Set<string>();
  // units wholly before the frontier's are taught too (a placed child skips their levels)
  for (const u of UNITS) if (u.id < Math.min(...frontier.units)) for (const g of u.spellings) for (const k of pairsOfSpelling(g)) before.add(k);
  for (const g of s.petals ?? []) for (const k of pairsOfSpelling(g)) before.add(k);
  const comingNext = new Set<string>();
  if (!played) for (const t of frontier.teach ?? []) for (const k of pairOfTeach(t)) if (!before.has(k)) comingNext.add(k);
  const inLand = new Set(LEVELS.filter((l) => l.world === frontier.world).flatMap((l) => (l.teach ?? []).flatMap(pairOfTeach)));
  return { s, now: opts.now ?? Date.now(), known: knownOf(s), frontier, taughtPairs: before, comingNext, seen: new Set(s.flowerSeen ?? []), inLand, memo: new Map() };
}

// ================================================================================================= evidence and memory

interface Evidence { attempts: number; right: number; accuracy: number; streak: number; words: number; wordsNeeded: number; days: number; lastAt: number | null }

/** Separate occasions among some times: a time at least `gapMs` after the last counted one starts a new one. */
function occasions(times: number[], gapMs: number): number {
  let n = 0;
  let at = -Infinity;
  for (const t of times.filter((x) => x > 0).sort((a, b) => a - b)) {
    if (t - at < gapMs) continue;
    n++;
    at = t;
  }
  return n;
}

/** What the save records about one pairing. (The core's learner model replaces this: pKnown for accuracy × attempts,
 *  its evidence window for words, its sessions for days.) */
function evidenceOf(c: Ctx, key: string): Evidence {
  const r = c.s.read?.[key];
  const sp = c.s.spell?.[key];
  const attempts = (sp?.n ?? 0) + 0.5 * (r?.n ?? 0);
  const right = (sp?.ok ?? 0) + 0.5 * (r?.ok ?? 0);
  const ws = WORDS_WITH.get(key) ?? [];
  const times: number[] = [];
  let words = 0;
  for (const w of ws) {
    const rec = c.s.words?.[w.text];
    if (!rec || !rec.n) continue;
    if (rec.ok > 0) words++;
    times.push(rec.last);
  }
  if (r?.n) times.push(r.last);
  if (sp?.n) times.push(sp.last);
  const valid = times.filter((t) => t > 0);
  return {
    attempts, right, accuracy: (right + 1) / (attempts + 2), streak: Math.max(r?.streak ?? 0, sp?.streak ?? 0),
    words, wordsNeeded: Math.min(MASTERY.words, ws.length), days: occasions(valid, MEMORY.sameDayH * 3_600_000),
    lastAt: valid.length ? Math.max(...valid) : null,
  };
}

/** Recall now, from the last use and how spaced the uses were. (The core replaces this with its half-life memory,
 *  measured from the last scored retrieval.) */
function recallOf(ev: Evidence, won: boolean, now: number): { halfLife: number; recall: number | null; daysSince: number | null } {
  const halfLife = (won ? MEMORY.won : MEMORY.practising) * 2 ** Math.min(MEMORY.doublings, Math.max(0, ev.days - 1));
  if (ev.lastAt === null) return { halfLife, recall: null, daysSince: null };
  const daysSince = Math.max(0, now - ev.lastAt) / DAY;
  return { halfLife, recall: 2 ** (-daysSince / halfLife), daysSince };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const round = (x: number, d = 3) => Math.round(x * 10 ** d) / 10 ** d;

// ================================================================================================= gems

function isTaught(c: Ctx, gem: Gem, ev: Evidence): boolean {
  if (!gem.inPlay) return false;
  const used = ev.attempts > 0 || (c.s.energy?.[gem.key] ?? 0) > 0 || c.seen.has(`spelling:${gem.key}`);
  if (used) return true;
  if (!c.known.has(spellingOf(gem))) return false;
  return c.taughtPairs.has(gem.key) && !c.comingNext.has(gem.key);
}

function gemIn(c: Ctx, key: string): GemProgress {
  const hit = c.memo.get(key);
  if (hit) return hit;
  const gem = GEM_BY_KEY.get(key) ?? { key, g: key.split(">")[0], p: key.split(">")[1] as PhonemeId, unit: 99, inPlay: false };
  const won = c.s.gems.includes(key);
  const ev = evidenceOf(c, key);
  const taught = won || isTaught(c, gem, ev);
  const rawEnergy = c.s.energy?.[key] ?? 0;
  const energy = won ? 1 : clamp01(rawEnergy / ENERGY_FULL);
  const accOk = clamp01(ev.accuracy / MASTERY.accuracy);
  const volOk = clamp01(ev.attempts / MASTERY.attempts);
  const breadthOk = ev.wordsNeeded ? clamp01(ev.words / ev.wordsNeeded) : 0;
  const daysOk = clamp01(ev.days / MASTERY.days);
  const consolidation = won ? (accOk + volOk + breadthOk + daysOk) / 4 : 0;
  const mastered = won && accOk >= 1 && volOk >= 1 && breadthOk >= 1 && daysOk >= 1;

  let stage: GemStage;
  if (won) stage = mastered ? "mastered" : "won";
  else if (!taught) stage = "unseen";
  else if (energy >= 1 && trialPool(key, c.known).length >= 3) stage = "ready";
  else if (energy > 0 || ev.attempts > 0) stage = "practising";
  else stage = "met";

  const achieved =
    stage === "unseen" ? 0
    : stage === "met" ? LADDER.met
    : stage === "practising" || stage === "ready" ? LADDER.met + (LADDER.ready - LADDER.met) * energy
    : stage === "mastered" ? LADDER.mastered
    : LADDER.won + (LADDER.mastered - LADDER.won) * consolidation;
  const mem = recallOf(ev, won, c.now);
  const value = mem.recall === null ? achieved : achieved * (MEMORY.floor + (1 - MEMORY.floor) * mem.recall);
  const out: GemProgress = {
    key, g: gem.g, p: gem.p, stage, value: round(value), sw: swUnitOf(key), tier: tierOf(key),
    fading: won && mem.recall !== null && mem.recall < MEMORY.fadeBelow,
    parts: {
      inPlay: gem.inPlay, taught, energy: round(energy), trial: won, attempts: ev.attempts, accuracy: round(ev.accuracy), streak: ev.streak,
      words: ev.words, wordsNeeded: ev.wordsNeeded, days: ev.days, lastAt: ev.lastAt, daysSince: mem.daysSince === null ? null : round(mem.daysSince, 1),
      halfLife: mem.halfLife, recall: mem.recall === null ? null : round(mem.recall), assumed: !won && rawEnergy > 0 && ev.attempts === 0,
      consolidation: round(consolidation), achieved: round(achieved),
    },
  };
  c.memo.set(key, out);
  return out;
}

/** One gem (a spelling>sound key, "ai>ae", "x>ks") and how far it has come towards mastery. */
export function gemProgress(save: Save, gemKey: string, opts: ProgressOpts = {}): GemProgress {
  return gemIn(ctxOf(save, opts), gemKey);
}

// ================================================================================================= petals

/** How far a gem's value takes its petal towards complete: nothing when just met, all the way once won. */
const toComplete = (v: number) => clamp01((v - LADDER.met) / (LADDER.won - LADDER.met));

function petalIn(c: Ctx, pt: Petal): PetalProgress {
  const spellings: PetalSpelling[] = pt.gems.map((gem) => {
    const gp = gemIn(c, gem.key);
    const otherSounds = gem.key === "x>ks" ? [] : soundsOfSpelling(gem.g).filter((x) => x.p !== pt.p && !x.together).map((x) => x.p);
    return { ...gp, expected: gp.stage !== "unseen", weight: weightOf(gem.key), otherSounds, example: exampleOf(gem.key) };
  });
  const exp = spellings.filter((x) => x.expected);
  const wSum = (xs: PetalSpelling[], f: (x: PetalSpelling) => number) => xs.reduce((n, x) => n + x.weight * f(x), 0);
  const wExp = wSum(exp, () => 1);
  const wonOf = (x: PetalSpelling) => x.stage === "won" || x.stage === "mastered";
  const fill = wExp ? wSum(exp, (x) => toComplete(x.parts.achieved)) / wExp : 0;
  const kept = (x: PetalSpelling) => (x.parts.recall === null ? 1 : MEMORY.floor + (1 - MEMORY.floor) * x.parts.recall);
  const fresh = wExp ? wSum(exp, (x) => toComplete(x.parts.achieved) * kept(x)) / wExp : 0;
  const polish = wExp ? wSum(exp, (x) => clamp01((x.parts.achieved - LADDER.won) / (LADDER.mastered - LADDER.won))) / wExp : 0;
  const whole = wSum(spellings, (x) => toComplete(x.parts.achieved)) / wSum(spellings, () => 1);
  const inPlay = spellings.filter((x) => x.parts.inPlay);
  const stageDone = exp.length > 0 && exp.every(wonOf);
  const state: PetalState = !exp.length ? "missing" : stageDone ? "complete" : fill > 0 ? "filling" : "outline";
  const soon = state === "missing" && spellings.some((x) => c.inLand.has(x.key));
  return {
    p: pt.p, state, fill: round(stageDone ? 1 : fill), fresh: round(fresh), polish: round(polish), whole: round(whole),
    fading: fill - fresh >= MEMORY.dustyPetal,
    complete: { stage: stageDone, game: inPlay.length > 0 && inPlay.every(wonOf), full: spellings.every(wonOf) },
    reachable: inPlay.length > 0, soon, ready: spellings.filter((x) => x.stage === "ready").length,
    counts: { spellings: spellings.length, inPlay: inPlay.length, expected: exp.length, won: spellings.filter(wonOf).length, mastered: spellings.filter((x) => x.stage === "mastered").length },
    spellings,
  };
}

/** One petal (a sound) and every spelling on its chart column. */
export function petalProgress(save: Save, phoneme: PhonemeId, opts: ProgressOpts = {}): PetalProgress {
  const pt = PETALS.find((x) => x.p === phoneme);
  if (!pt) throw new Error(`No petal for /${phoneme}/`);
  return petalIn(ctxOf(save, opts), pt);
}

/** Every petal's state and fill, for the radial World Flower and the chart's map. */
export function flowerOverview(save: Save, opts: ProgressOpts = {}): FlowerOverview {
  const c = ctxOf(save, opts);
  const petals: PetalSummary[] = PETALS.map((pt) => {
    const summary: Partial<PetalProgress> = petalIn(c, pt);
    delete summary.spellings;
    return summary as PetalSummary;
  });
  const counts = { missing: 0, outline: 0, filling: 0, complete: 0, full: 0, reachable: 0, fading: 0, ready: 0 };
  for (const x of petals) {
    counts[x.state]++;
    if (x.complete.full) counts.full++;
    if (x.reachable) counts.reachable++;
    if (x.fading) counts.fading++;
    counts.ready += x.ready;
  }
  const met = petals.filter((x) => x.state !== "missing");
  return {
    stage: stageIn(c), petals, counts,
    fill: round(met.length ? met.reduce((n, x) => n + x.fill, 0) / met.length : 0),
    whole: round(petals.reduce((n, x) => n + x.whole, 0) / petals.length),
  };
}

// ================================================================================================= stage

function stageIn(c: Ctx): Stage {
  const taught = new Set<string>();
  for (const key of GEM_BY_KEY.keys()) if (gemIn(c, key).stage !== "unseen") taught.add(key);
  return { taught, unit: furthest(taught), frontier: c.frontier.id };
}
const furthest = (keys: Iterable<string>): SwUnitId | null => {
  let best: SwUnitId | null = null;
  for (const k of keys) {
    const u = swUnitOf(k);
    if (u && (!best || unitIndex(u) > unitIndex(best))) best = u;
  }
  return best;
};
/** The child's stage: what the game has taught them (the levels played, and placement). */
export function stageOf(save: Save, opts: ProgressOpts = {}): Stage {
  return stageIn(ctxOf(save, opts));
}
/** A point in the Sounds~Write programme: every chart pairing its code units have taught by the end of `unit`, in the
 *  game or not ("what the programme expects by then"). */
export function stageAtUnit(unit: SwUnitId): Stage {
  const end = unitIndex(unit);
  if (end < 0) throw new Error(`Not a code unit: ${unit}`);
  const taught = new Set<string>();
  for (const key of GEM_BY_KEY.keys()) {
    const u = swUnitOf(key);
    if (u && unitIndex(u) <= end) taught.add(key);
  }
  return { taught, unit: SW_SEQUENCE[end], frontier: null };
}

// ================================================================================================= one spelling, several sounds

/** Every petal a spelling sits in, in the order Sounds~Write teaches them (ea → /ee/ EC2, /ae/ EC1… sorted by unit,
 *  then the chart's order). < x > sits in /k/ and /s/ as one gem for the two sounds together. */
export function soundsOfSpelling(g: string): SoundOfSpelling[] {
  const out: SoundOfSpelling[] = [];
  for (const pt of PETALS) {
    const gem = pt.gems.find((x) => x.g === g);
    if (!gem) continue;
    out.push({
      p: pt.p, key: gem.key, sw: swUnitOf(gem.key), tier: tierOf(gem.key), inPlay: gem.inPlay, example: exampleOf(gem.key),
      ...(gem.key === "x>ks" ? { together: true as const } : {}),
    });
  }
  // (a stable sort: the chart's order within a unit)
  const at = (x: SoundOfSpelling) => (x.sw ? unitIndex(x.sw) : Infinity);
  return out.sort((a, b) => at(a) - at(b));
}

const CHART_SPELLINGS = [...new Set(PETALS.flatMap((pt) => pt.gems.map((g) => g.g)))];

/** Spellings that represent two or more sounds at this stage (Sounds~Write's fourth concept), in the order they became
 *  so. Give a save for the child's own stage (and whether each has been explained), or a Stage (stageAtUnit). */
export function multiSoundSpellings(stage: Stage | Save, opts: ProgressOpts = {}): MultiSound[] {
  const save = "taught" in stage ? null : stage;
  const st = save ? stageOf(save, opts) : (stage as Stage);
  const ledger = save ? ((save as Save & { narr?: Record<string, { n?: number }> }).narr ?? {}) : null;
  const out: { m: MultiSound; at: number }[] = [];
  for (const g of CHART_SPELLINGS) {
    const all = soundsOfSpelling(g).filter((x) => !x.together);
    const sounds = all.filter((x) => st.taught.has(x.key));
    if (sounds.length < 2) continue;
    const key = twoSoundsKey(g);
    const at = Math.max(...sounds.slice(0, 2).map((x) => (x.sw ? unitIndex(x.sw) : Infinity)));
    out.push({ m: { g, sounds, later: all.filter((x) => !st.taught.has(x.key)), discussed: ledger ? (ledger[key]?.n ?? 0) > 0 : null, ledgerKey: key }, at });
  }
  return out.sort((a, b) => a.at - b.at || a.m.g.localeCompare(b.m.g)).map((x) => x.m);
}
