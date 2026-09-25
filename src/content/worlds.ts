// The adventure: six lands, each a sequence of levels following the teaching order.
import { UNITS, WORDS, dictationSafe, type Word, type PhonemeId } from "./phonics";

export type LevelKind = "dojo" | "battle" | "boss" | "run" | "swap" | "story" | "sort" | "listen" | "firstsound" | "soundhunt";

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

const L = (world: number, n: number, kind: LevelKind, rest: Partial<Level> & { units: number[] }): Level => ({
  id: `w${world}-${n}`, world, kind, ...rest,
});

export const WORLDS: World[] = [
  {
    id: 1, key: "bamboo", name: "Bamboo Village", colour: "#6cc04a", deep: "#1f4d1a", music: "world_bamboo",
    levels: [
      // Sound-first beginning (docs/PEDAGOGY.md): listen → first sounds → 2-sound words → 3-sound words
      L(1, 1, "listen", { units: [1] }),
      L(1, 2, "firstsound", { units: [1], teach: ["m", "s"] }),
      L(1, 3, "firstsound", { units: [1], teach: ["a", "t"] }),
      L(1, 4, "dojo", { units: [1], words: ["am", "at"], read: [["am", "at"], ["at", "am"], ["am", "at"]] }),
      L(1, 5, "dojo", { units: [1], words: ["mat", "sat"], read: [["mat", "sat"], ["sat", "at"], ["mat", "am"]] }),
      L(1, 6, "battle", { units: [1], monster: "gloop", words: ["am", "at", "mat", "sat"], distractors: 1 }),
      L(1, 7, "soundhunt", { units: [1], teach: ["i"], words: ["it", "sit"], read: [["sit", "sat"], ["it", "at"], ["sit", "it"]] }),
      L(1, 8, "swap", { units: [1], chain: ["mat", "sat", "sit", "sat", "mat", "am", "at", "it"] }), // one sound changes each step; mat → am starts a fresh two-sound chain
      L(1, 9, "run", { units: [1] }),
      L(1, 10, "firstsound", { units: [2], teach: ["n", "p"], words: ["an", "in", "nap", "pan", "pin", "tin"] }),
      L(1, 11, "soundhunt", { units: [2], teach: ["o"], words: ["on", "pot", "top", "mop"], read: [["top", "tap"], ["pot", "pit"], ["mop", "map"]] }),
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
      L(3, 1, "dojo", { units: [5], teach: ["k", "l", "r", "u"] }),
      L(3, 2, "sort", { units: [3, 5], sort: { sound: "k", spellings: ["c", "k"] } }),
      L(3, 3, "battle", { units: [5], monster: "snow_puff" }),
      L(3, 4, "dojo", { units: [6], teach: ["j", "w", "z"] }),
      L(3, 5, "run", { units: [5, 6] }),
      L(3, 6, "dojo", { units: [7], teach: ["x", "y", "ff", "ll", "ss", "zz"] }),
      L(3, 7, "sort", { units: [5, 7], sort: { sound: "l", spellings: ["l", "ll"] } }),
      L(3, 8, "swap", { units: [5, 6, 7] }),
      L(3, 9, "battle", { units: [7], monster: "rock_golem" }),
      L(3, 10, "sort", { units: [1, 2, 7], sort: { sound: "s", spellings: ["s", "ss"] } }),
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
      L(5, 4, "sort", { units: [3, 5, 11], sort: { sound: "k", spellings: ["c", "k", "ck"] } }),
      L(5, 5, "run", { units: [11] }),
      L(5, 6, "dojo", { units: [11], teach: ["q", "u=w", "ve", "tch"] }),
      L(5, 7, "sort", { units: [11], sort: { sound: "ch", spellings: ["ch", "tch"] } }),
      L(5, 8, "swap", { units: [11] }),
      L(5, 9, "battle", { units: [11], monster: "shadow_bat" }),
      L(5, 10, "story", { units: [11], story: "s5" }),
      L(5, 11, "boss", { units: [11], monster: "boss_knight" }),
    ],
  },
  {
    id: 6, key: "sky", name: "Sky Temple", colour: "#ffc53d", deep: "#5c3b00", music: "world_sky",
    levels: [
      L(6, 1, "dojo", { units: [12], teach: ["ai", "ay"] }),
      L(6, 2, "sort", { units: [12], sort: { sound: "ae", spellings: ["ai", "ay"] } }),
      L(6, 3, "dojo", { units: [12], teach: ["ee", "ea"] }),
      L(6, 4, "sort", { units: [12], sort: { sound: "ee", spellings: ["ee", "ea"] } }),
      L(6, 5, "battle", { units: [12], monster: "cloud_sprite" }),
      L(6, 6, "dojo", { units: [12], teach: ["igh", "ie", "oa", "ow"] }),
      L(6, 7, "sort", { units: [12], sort: { sound: "ie", spellings: ["igh", "ie"] } }),
      L(6, 8, "sort", { units: [12], sort: { sound: "oe", spellings: ["oa", "ow"] } }),
      L(6, 9, "run", { units: [12] }),
      L(6, 10, "story", { units: [12], story: "s6" }),
      L(6, 11, "boss", { units: [12], monster: "boss_baron" }),
    ],
  },
];

export const LEVELS: Level[] = WORLDS.flatMap((w) => w.levels);
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

export const MONSTER_INFO: Record<string, { hp: number; facing: "left" | "right"; scale?: number; float?: boolean }> = {
  gloop: { hp: 4, facing: "left" },
  bamboo_bandit: { hp: 4, facing: "right" },
  boss_panda: { hp: 7, facing: "left", scale: 1.5 },
  crabble: { hp: 4, facing: "left" },
  petal_imp: { hp: 4, facing: "left", float: true },
  boss_oni: { hp: 7, facing: "right", scale: 1.5 },
  snow_puff: { hp: 4, facing: "left" },
  rock_golem: { hp: 5, facing: "left" },
  boss_yeti: { hp: 7, facing: "right", scale: 1.5 },
  kappa: { hp: 5, facing: "right" },
  puffer: { hp: 5, facing: "left", float: true },
  boss_serpent: { hp: 8, facing: "left", scale: 1.5 },
  lantern_ghost: { hp: 5, facing: "left", float: true },
  shadow_bat: { hp: 5, facing: "left", float: true },
  boss_knight: { hp: 8, facing: "left", scale: 1.5 },
  cloud_sprite: { hp: 5, facing: "left", float: true },
  thunder_drum: { hp: 5, facing: "left", float: true },
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
export const startLevelAfter = (unit: number) => LEVELS.find((l) => Math.max(...l.units) > unit) ?? LEVELS.find((l) => l.world === WORLDS.length)!;
