// The adventure: six lands, each a sequence of levels following the teaching order.
import { UNITS, WORDS, dictationSafe, type Word, type PhonemeId } from "./phonics";
import { EARLY_PACE, type Pace } from "./pace";

export type LevelKind = "dojo" | "battle" | "boss" | "run" | "swap" | "story" | "sort" | "listen" | "firstsound" | "soundhunt" | "ears" | "picread";

export interface Level {
  id: string;
  world: number;
  kind: LevelKind;
  /** units whose words are practised */
  units: number[];
  /** new spellings taught (dojo) */
  teach?: string[];
  /** monster id for battles */
  monster?: string;
  story?: string;
  /** sort levels: the sound and its spellings */
  sort?: { sound: PhonemeId; spellings: string[] };
  /** review levels: treat as if played right after this level */
  upTo?: string;
  /** Gem Trial: the spelling→sound key being tested */
  trialGem?: string;
  /** exact words to build, in order (early levels: fixed, not random) */
  words?: string[];
  /** "who read it right?" pairs: [correct, wrong] */
  read?: [string, string][];
  /** fixed Sound Swap chain */
  chain?: string[];
  /** extra wrong tiles in battles (early levels keep this low) */
  distractors?: number;
  /** warm-up stones (docs/FIRST_MINUTES.md §10): the script in src/content/warmups.ts */
  warmup?: string;
  /** a cut lesson: it ends at the first item boundary after this many ms (the first session on a school path, §9) */
  budgetMs?: number;
  /** pace follows mastery (content/pace.ts): a child on track skips the extra practice and moves on sooner */
  pace?: Pace;
}

export interface World {
  id: number;
  key: string;
  name: string;
  colour: string;
  /** dark ink shade for this world's UI */
  deep: string;
  music: string;
  levels: Level[];
}

/** A level. Ids never change once released (saves keep stars by id); a new stone gets an explicit `id`. */
const L = (world: number, n: number, kind: LevelKind, rest: Partial<Level> & { units: number[] }): Level => ({
  id: rest.id ?? `w${world}-${n}`, world, kind, ...rest,
});
/** A warm-up stone: game-only listening and picture-reading before Initial Code Unit 1 (no letters). */
const WU = (n: number, kind: "ears" | "picread"): Level => L(1, 0, kind, { id: `w1-wu${n}`, units: [1], warmup: `W${n}` });

export const WORLDS: World[] = [
  {
    id: 1, key: "bamboo", name: "Bamboo Village", colour: "#6cc04a", deep: "#1f4d1a", music: "world_bamboo",
    levels: [
      // The warm-ups (docs/FIRST_MINUTES.md §10): listening games and picture reading, no letters. They replace the old
      // w1-1 "Listening Ears" (retired). Then the sound-first beginning (docs/PEDAGOGY.md): first sounds → 2-sound
      // words → 3-sound words
      WU(1, "ears"),
      WU(2, "picread"),
      WU(3, "ears"),
      WU(4, "picread"),
      WU(5, "ears"),
      WU(6, "picread"),
      // (pace: after about three words right first time and one reading check, a child on track goes on to the reward,
      // and past about 120 s at the next item: content/pace.ts, ARCHITECTURE §15.6)
      L(1, 2, "firstsound", { units: [1], teach: ["m", "s"], pace: EARLY_PACE }),
      L(1, 3, "firstsound", { units: [1], teach: ["a", "t"], pace: EARLY_PACE }),
      L(1, 4, "dojo", { units: [1], words: ["am", "at"], read: [["am", "at"], ["at", "am"], ["am", "at"]], pace: EARLY_PACE }),
      L(1, 5, "dojo", { units: [1], words: ["mat", "sat"], read: [["mat", "sat"], ["sat", "at"], ["mat", "am"]], pace: EARLY_PACE }),
      L(1, 6, "battle", { units: [1], monster: "gloop", words: ["am", "at", "mat", "sat"], distractors: 1 }),
      L(1, 7, "soundhunt", { units: [1], teach: ["i"], words: ["it", "sit"], read: [["sit", "sat"], ["it", "at"], ["sit", "it"]], pace: EARLY_PACE }),
      L(1, 8, "swap", { units: [1], chain: ["mat", "sat", "sit", "sat", "mat", "am", "at", "it"] }), // one sound changes each step; mat → am starts a fresh two-sound chain
      L(1, 9, "run", { units: [1] }),
      L(1, 10, "firstsound", { units: [2], teach: ["n", "p"], words: ["an", "in", "nap", "pan", "pin", "tin"], pace: EARLY_PACE }),
      L(1, 11, "soundhunt", { units: [2], teach: ["o"], words: ["on", "pot", "top", "mop"], read: [["top", "tap"], ["pot", "pit"], ["mop", "map"]], pace: EARLY_PACE }),
      L(1, 12, "swap", { units: [1, 2], chain: ["sat", "sit", "pit", "pin", "tin", "tan", "pan", "pat", "mat", "man", "map", "mop", "top", "tap"] }),
      L(1, 13, "battle", { units: [2], monster: "bamboo_bandit", distractors: 2 }),
      L(1, 14, "story", { units: [1, 2], story: "s1" }),
      L(1, 15, "boss", { units: [1, 2], monster: "boss_panda" }),
    ],
  },
  {
    id: 2, key: "blossom", name: "Blossom Hills", colour: "#ff7aa2", deep: "#6e1f3d", music: "world_blossom",
    levels: [
      L(2, 1, "dojo", { units: [3], teach: ["b", "c", "g", "h"] }),
      L(2, 2, "battle", { units: [3], monster: "crabble" }),
      L(2, 3, "run", { units: [2, 3] }),
      L(2, 4, "dojo", { units: [4], teach: ["d", "e", "f", "v"] }),
      L(2, 5, "swap", { units: [3, 4] }),
      L(2, 6, "battle", { units: [4], monster: "petal_imp" }),
      L(2, 7, "story", { units: [3, 4], story: "s2" }),
      L(2, 8, "boss", { units: [3, 4], monster: "boss_oni" }),
    ],
  },
  {
    id: 3, key: "mountain", name: "Misty Mountains", colour: "#5ec8f2", deep: "#113c5c", music: "world_mountain",
    levels: [
      // (no sorting here: "the same sound can be spelt in different ways" is taught formally in the Bridging Unit, after
      // IC11, at the start of the Sky Temple; NARRATIVE_AUDIT F25. w3-2, w3-7 and w3-10 were sorts until 26 Sep 2026)
      L(3, 1, "dojo", { units: [5], teach: ["k", "l", "r", "u"] }),
      L(3, 2, "swap", { units: [3, 5] }),
      L(3, 3, "battle", { units: [5], monster: "snow_puff" }),
      L(3, 4, "dojo", { units: [6], teach: ["j", "w", "z"] }),
      L(3, 5, "run", { units: [5, 6] }),
      L(3, 6, "dojo", { units: [7], teach: ["x", "y", "ff", "ll", "ss", "zz"] }),
      L(3, 7, "run", { units: [6, 7] }),
      L(3, 8, "swap", { units: [5, 6, 7] }),
      L(3, 9, "battle", { units: [7], monster: "rock_golem" }),
      L(3, 10, "dojo", { units: [5, 6, 7] }),
      L(3, 11, "story", { units: [5, 6, 7], story: "s3" }),
      L(3, 12, "boss", { units: [5, 6, 7], monster: "boss_yeti" }),
    ],
  },
  {
    id: 4, key: "river", name: "Dragon River", colour: "#2ec4b6", deep: "#0d4541", music: "world_river",
    levels: [
      L(4, 1, "dojo", { units: [8] }),
      L(4, 2, "run", { units: [8] }),
      L(4, 3, "dojo", { units: [9] }),
      L(4, 4, "battle", { units: [9], monster: "kappa" }),
      L(4, 5, "swap", { units: [8, 9] }),
      L(4, 6, "dojo", { units: [10] }),
      L(4, 7, "battle", { units: [10], monster: "puffer" }),
      L(4, 8, "story", { units: [8, 9, 10], story: "s4" }),
      L(4, 9, "boss", { units: [8, 9, 10], monster: "boss_serpent" }),
    ],
  },
  {
    id: 5, key: "castle", name: "Shadow Castle", colour: "#9b6cf0", deep: "#2c1856", music: "world_castle",
    levels: [
      L(5, 1, "dojo", { units: [11], teach: ["sh", "ch", "th", "th=dh"] }),
      L(5, 2, "battle", { units: [11], monster: "lantern_ghost" }),
      L(5, 3, "dojo", { units: [11], teach: ["ck", "ng", "wh"] }),
      L(5, 4, "swap", { units: [11] }), // (was the c/k/ck sort, now in the Bridging Unit)
      L(5, 5, "run", { units: [11] }),
      L(5, 6, "dojo", { units: [11], teach: ["q", "u=w", "ve", "tch"] }),
      L(5, 7, "battle", { units: [11], monster: "thunder_drum" }), // (was the ch/tch sort, now in the Bridging Unit)
      L(5, 8, "swap", { units: [11] }),
      L(5, 9, "battle", { units: [11], monster: "shadow_bat" }),
      L(5, 10, "story", { units: [11], story: "s5" }),
      L(5, 11, "boss", { units: [11], monster: "boss_knight" }),
    ],
  },
  {
    id: 6, key: "sky", name: "Sky Temple", colour: "#ffc53d", deep: "#5c3b00", music: "world_sky",
    levels: [
      // The Bridging Unit (after IC11): the same sound can be spelt in different ways, formally, by sorting (the official
      // order: /k/ < c k ck >, /ch/ < ch tch >; /w/ and /v/ are still to come). NARRATIVE_AUDIT F25.
      L(6, 0, "sort", { id: "w6-br1", units: [3, 5, 11], sort: { sound: "k", spellings: ["c", "k", "ck"] } }),
      L(6, 0, "sort", { id: "w6-br2", units: [11], sort: { sound: "ch", spellings: ["ch", "tch"] } }),
      // The Extended Code in the official order (NARRATIVE_AUDIT F26): EC1 /ae/, EC2 /ee/, EC4 /oe/, then EC11 /ie/
      // (EC3, < ea > as two sounds, and the units between still need their words and pictures)
      L(6, 1, "dojo", { units: [12], teach: ["ai", "ay"] }),
      L(6, 2, "sort", { units: [12], sort: { sound: "ae", spellings: ["ai", "ay"] } }),
      L(6, 3, "dojo", { units: [12], teach: ["ee", "ea"] }),
      L(6, 4, "sort", { units: [12], sort: { sound: "ee", spellings: ["ee", "ea"] } }),
      L(6, 5, "battle", { units: [12], monster: "cloud_sprite" }),
      L(6, 6, "dojo", { units: [12], teach: ["oa", "ow"] }),
      L(6, 8, "sort", { units: [12], sort: { sound: "oe", spellings: ["oa", "ow"] } }),
      L(6, 0, "dojo", { id: "w6-ec11", units: [12], teach: ["igh", "ie"] }),
      L(6, 7, "sort", { units: [12], sort: { sound: "ie", spellings: ["igh", "ie"] } }),
      L(6, 9, "run", { units: [12] }),
      L(6, 10, "story", { units: [12], story: "s6" }),
      // the Sky Magpie: the Sky Temple's guardian. Baron Muddle is fought once, in the final battle (docs/MIDGAME_ENDGAME.md R.3)
      L(6, 11, "boss", { units: [12], monster: "boss_magpie" }),
    ],
  },
];

export const LEVELS: Level[] = WORLDS.flatMap((w) => w.levels);
/** The final battle's level id: the finale plays only when it is first won. null until Muddle Castle exists (MIDGAME_ENDGAME §2.2). */
export const FINALE_LEVEL: string | null = null;
/** The first win here plays the Baron's escape, once per save (docs/fix-requests.md, "Baron final only"). */
export const TRICK_LEVEL = "w6-11";
let review: Level | null = null;
/** Sensei's Challenge: a review battle over everything learned so far (weakest spellings first). */
export function makeReview(current: Level): Level {
  const idx = LEVELS.indexOf(current);
  const done = LEVELS.slice(0, Math.max(1, idx));
  const last = done[done.length - 1];
  const monsters = done.filter((l) => l.monster && l.kind !== "boss").map((l) => l.monster!);
  review = {
    id: "review", world: last.world, kind: "battle", upTo: last.id,
    units: [...new Set(done.flatMap((l) => l.units))],
    monster: monsters.length ? monsters[Math.floor(Math.random() * monsters.length)] : "gloop",
  };
  return review;
}
let trialLevel: Level | null = null;
export const setTrialLevel = (l: Level) => (trialLevel = l);
export const levelById = (id: string) => (id === "review" && review ? review : id === "trial" && trialLevel ? trialLevel : LEVELS.find((l) => l.id === id)!);
export const worldOf = (l: Level) => WORLDS[l.world - 1];
export const maxUnitOf = (l: Level) => Math.max(...l.units);

/** Spellings known by the time this level is played (all teach of earlier units + this level). */
export function knownSpellings(l: Level): Set<string> {
  const known = new Set<string>();
  for (const lv of LEVELS) {
    for (const u of UNITS) if (u.id < Math.min(...l.units)) u.spellings.forEach((g) => known.add(g));
    lv.teach?.forEach((t) => known.add(t.split("=")[0]));
    if (lv.id === (l.upTo ?? l.id)) break;
  }
  return known;
}

/** Words usable in a level: from its units, and only using spellings already taught. */
export function levelWords(l: Level): Word[] {
  const known = knownSpellings(l);
  return WORDS.filter((w) => l.units.includes(w.unit) && w.segs.every((s) => known.has(s.g)) && dictationSafe(w));
}

/** `facing`: which way the SPRITE ART faces (a "right" sprite is mirrored so every monster faces the ninja on the left).
 *  Checked 27 Sep by eye and by five-vote vision checks of pupils, nose and leading hand (playtest/runs/facing2.ts). */
export const MONSTER_INFO: Record<string, { hp: number; facing: "left" | "right"; scale?: number; float?: boolean }> = {
  gloop: { hp: 4, facing: "right" },
  bamboo_bandit: { hp: 4, facing: "left" },
  boss_panda: { hp: 7, facing: "right", scale: 1.5 },
  crabble: { hp: 4, facing: "left" },
  petal_imp: { hp: 4, facing: "left", float: true },
  boss_oni: { hp: 7, facing: "right", scale: 1.5 },
  snow_puff: { hp: 4, facing: "left" },
  rock_golem: { hp: 5, facing: "left" },
  boss_yeti: { hp: 7, facing: "right", scale: 1.5 },
  kappa: { hp: 5, facing: "left" },
  puffer: { hp: 5, facing: "left", float: true },
  boss_serpent: { hp: 8, facing: "left", scale: 1.5 },
  lantern_ghost: { hp: 5, facing: "left", float: true },
  shadow_bat: { hp: 5, facing: "left", float: true },
  boss_knight: { hp: 8, facing: "left", scale: 1.5 },
  cloud_sprite: { hp: 5, facing: "left", float: true },
  thunder_drum: { hp: 5, facing: "left", float: true },
  boss_magpie: { hp: 9, facing: "left", scale: 1.5 },
  boss_baron: { hp: 9, facing: "right", scale: 1.5 },
  gem_guardian: { hp: 5, facing: "left", scale: 1.1 },
};

// ---------- school milestones: where "jump ahead" can take a child. Data-driven, so new lands just extend this.
// `unit` = the highest teaching unit a child at this point is secure in (see UNITS in phonics.ts).
export interface Milestone { id: string; label: string; unit: number; note: string }
export const MILESTONES: Milestone[] = [
  { id: "mid-reception", label: "Middle of Reception", unit: 7, note: "Single sounds, ff ll ss zz" },
  { id: "end-reception", label: "End of Reception", unit: 11, note: "sh ch th ck ng qu, longer words" },
  { id: "end-year-1", label: "End of Year 1", unit: 12, note: "First long-vowel spellings" },
  { id: "end-year-2", label: "End of Year 2", unit: 12, note: "All spellings in the game so far" },
];
/** The first level a child should play after being secure in `unit` (or the last land if beyond the content). */
export const startLevelAfter = (unit: number) =>
  LEVELS.find((l) => !l.warmup && Math.max(...l.units) > unit) ?? LEVELS.find((l) => l.world === WORLDS.length && !!l.teach?.length)!;

// ---------- the warm-ups and term-aware starting points (docs/FIRST_MINUTES.md §4, §9, §10)
export const isWarmup = (l: Level | null | undefined) => !!l?.warmup;
export const WARMUP_IDS = LEVELS.filter((l) => l.warmup).map((l) => l.id);
/** The first level after the warm-ups (IC Unit 1). */
export const AFTER_WARMUPS = LEVELS.find((l) => !l.warmup)!.id;

export type StartBand = "W" | "R" | "Y1" | "Y2";
export type Term = "autumn" | "spring" | "summer";
/** English school terms by the date on the device: autumn Sep–Dec, spring Jan–Mar, summer Apr–Aug. */
export const termOf = (d: Date): Term => (d.getMonth() >= 8 ? "autumn" : d.getMonth() <= 2 ? "spring" : "summer");
export interface Start {
  band: StartBand;
  /** placeAtUnit(unit) before the first lesson (0: none, the child starts at the warm-ups) */
  unit: number;
  /** the first session's two lessons */
  lessons: [string, string];
  /** school start points play cut lessons (90 s, then 60 s) */
  cut: boolean;
  /** for the grown-ups' log */
  label: string;
}
const at = (unit: number, band: StartBand, label: string): Start => {
  const first = startLevelAfter(unit);
  const next = LEVELS[LEVELS.indexOf(first) + 1] ?? first;
  return { band, unit, lessons: [first.id, next.id], cut: true, label };
};
/** Where a child starts, half a term behind the official Sounds~Write pace (§4): Reception IC1–7 in the autumn, IC8–11
 *  in the spring and the Bridging Unit in the summer; Year One EC1–26; Year Two EC27–49. Until the Extended Code is
 *  built, Years One and Two both start at the Sky Temple (w6-1), Year Two with its gems half-filled. */
export function startFor(year: "none" | "unsure" | "R" | "Y1" | "Y2" | "unset" | undefined, date = new Date()): Start {
  const term = termOf(date);
  const warm: Start = { band: "W", unit: 0, lessons: ["w1-wu1", "w1-wu2"], cut: false, label: "the warm-ups" };
  if (year === "R") {
    if (term === "autumn") return { ...warm, band: "R", label: "Reception (autumn term)" };
    return term === "spring" ? at(4, "R", "Reception (spring term)") : at(8, "R", "Reception (summer term)");
  }
  if (year === "Y1") return at(11, "Y1", "Year One");
  if (year === "Y2") return at(12, "Y2", "Year Two");
  return warm;
}
/** A cut lesson (§9): on a school path, the first session's two lessons end at the first item boundary after 90 s,
 *  then 60 s (the scenes read `level.budgetMs`). The warm-ups have their own time governor (warmups.ts). */
export function lessonBudgetMs(level: Level, first: { lessons: readonly string[] } | null | undefined): number | undefined {
  if (!first || level.warmup) return undefined;
  const i = first.lessons.indexOf(level.id);
  return i === 0 ? 90_000 : i === 1 ? 60_000 : undefined;
}
/** The level with its budget, when it is a cut lesson (a copy: level ids, not object identity, name levels). */
export const withBudget = (level: Level, first: { lessons: readonly string[] } | null | undefined): Level => {
  const b = lessonBudgetMs(level, first);
  return b ? { ...level, budgetMs: b } : level;
};
/** One band down, after a first check with 0 or 1 right (§10). A band that would start at the same level (Years One
 *  and Two, until the Extended Code exists) is passed over, so a 3-year-old who tapped "Year Two" drops at once. */
export function bandBelow(band: StartBand, date = new Date()): StartBand {
  const order: StartBand[] = ["Y2", "Y1", "R", "W"];
  const here = startFor(band === "W" ? "none" : band, date).lessons[0];
  for (let i = order.indexOf(band) + 1; i < order.length; i++) {
    const b = order[i];
    if (startFor(b === "W" ? "none" : b, date).lessons[0] !== here || b === "W") return b;
  }
  return "W";
}
