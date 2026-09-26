// Gem progression: practice charges a spelling's gem; a full gem unlocks a timed Gem Trial; won gems fill petals.
import { GEMS, PETALS, neededGems, gemByKey, petalsOfGem, type Gem, type Petal } from "../content/flower";
import { WORDS, UNITS, dictationSafe, teachEntry, type PhonemeId, type Word } from "../content/phonics";
import { LEVELS, WORLDS, knownSpellings, setTrialLevel, MILESTONES, startLevelAfter, type Level } from "../content/worlds";
import { store, ENERGY_FULL, type Save } from "./store";

export type GemState = "future" | "hidden" | "charging" | "ready" | "won";
/** Has the child met this spelling (it has been taught, so its gem shows its letters)? */
export const isMet = (st: GemState) => st === "charging" || st === "ready" || st === "won";

/** The level the child is up to (first without stars, respecting placement). */
export function frontier(s: Save = store.get()): Level {
  const start = s.placedAt ? LEVELS.findIndex((l) => l.id === s.placedAt) : 0;
  return LEVELS.find((l, i) => i >= start && !(s.stars[l.id] > 0)) ?? LEVELS[LEVELS.length - 1];
}

export function knownNow(s: Save = store.get()): Set<string> {
  const k = knownSpellings(frontier(s));
  for (const g of s.petals) k.add(g);
  return k;
}

export function gemState(gem: Gem, s: Save = store.get(), known = knownNow(s)): GemState {
  if (!gem.inPlay) return "future";
  if (s.gems.includes(gem.key)) return "won";
  const spelling = gem.g === "u" && gem.p === "w" ? "q" : gem.g;
  if (!known.has(spelling)) return "hidden";
  // full energy is not enough: a trial needs real words to spell (after only m and s there are none), so it waits
  return (s.energy[gem.key] ?? 0) >= ENERGY_FULL && trialPool(gem.key, known).length >= 3 ? "ready" : "charging";
}

/** Words that can test this gem: they use its spelling for its sound, and only spellings the child knows. */
function trialPool(key: string, known: Set<string>): Word[] {
  return WORDS.filter((w) => w.segs.some((s) => `${s.g}>${s.p}` === key || (key === "x>ks" && s.g === "x")) && w.segs.every((s) => known.has(s.g)) && dictationSafe(w));
}

export const energyOf = (key: string, s: Save = store.get()) => Math.min(1, (s.energy[key] ?? 0) / ENERGY_FULL);

export function readyGems(s: Save = store.get()): Gem[] {
  const known = knownNow(s);
  const seen = new Set<string>();
  return GEMS.filter((g) => !seen.has(g.key) && seen.add(g.key) && gemState(g, s, known) === "ready");
}

/** A petal is placed when every gem this version of the game can teach has been won. */
export function petalComplete(pt: Petal, s: Save = store.get()) {
  const need = neededGems(pt);
  return need.length > 0 && need.every((g) => s.gems.includes(g.key));
}
export const placeablePetals = () => PETALS.filter((pt) => neededGems(pt).length > 0);
export const flowerComplete = (s: Save = store.get()) => placeablePetals().every((pt) => petalComplete(pt, s));

/** Words for a Gem Trial: contain the gem's spelling→sound and only use spellings the child knows. */
export function trialWords(key: string, n = 5): Word[] {
  const known = knownNow();
  const pool = trialPool(key, known);
  const shuffled = pool.sort(() => Math.random() - 0.5).sort((a, b) => a.segs.length - b.segs.length > 1 ? 1 : 0);
  const out: Word[] = [];
  while (out.length < n && shuffled.length) out.push(shuffled[out.length % shuffled.length]);
  return out.slice(0, Math.min(n, Math.max(3, pool.length)));
}

let trial: Level | null = null;
export function makeTrial(key: string): Level {
  const f = frontier();
  trial = { id: "trial", world: f.world, kind: "battle", units: [...new Set(LEVELS.flatMap((l) => l.units))], monster: "gem_guardian", upTo: f.id, trialGem: key };
  setTrialLevel(trial);
  return trial;
}
export const currentTrial = () => trial;
export { gemByKey };

// ---------------------------------------------------------------- practice (the petal detail's "Practise" button)
/** A practice dojo is a Level with the gem it practises. */
export type PracticeLevel = Level & { practiceGem: string };

/** Words for practising one spelling: they use it for its sound, the child can decode every other spelling in them,
 *  and they can be dictated. Short words first (4 sounds at most), then words with clear pictures, then words met. */
export function practiceWords(key: string, s: Save = store.get(), n = 3): Word[] {
  const known = knownNow(s);
  const has = (w: Word) => w.segs.some((sg) => `${sg.g}>${sg.p}` === key || (key === "x>ks" && sg.g === "x"));
  const pool = WORDS.filter((w) => has(w) && w.segs.every((sg) => known.has(sg.g)) && dictationSafe(w) && w.segs.length <= 4);
  const score = (w: Word) => (w.segs.length === 3 ? 3 : w.segs.length === 2 ? 2 : 0) + (w.pic ? 2 : 0) + (s.words[w.text] ? 1 : 0) - w.unit * 0.05;
  const ranked = pool.sort((a, b) => score(b) - score(a));
  // the first word is the one Sensei models ("This word has three sounds!"): two or three sounds, never four
  const first = ranked.findIndex((w) => w.segs.length <= 3);
  if (first < 0) return [];
  if (first > 0) ranked.unshift(...ranked.splice(first, 1));
  return ranked.slice(0, n);
}

/** Can this gem be practised now? It must be met, not a future gem, and have at least two words to build. */
export function canPractise(key: string, s: Save = store.get()): boolean {
  const gem = gemByKey(key);
  if (!gem?.inPlay) return false;
  return isMet(gemState(gem, s)) && practiceWords(key, s).length >= 2;
}

let practice: { level: PracticeLevel; from: number } | null = null;
/**
 * A short practice dojo for one spelling, from words the child can decode (mirrors makeTrial). The dojo builds them
 * with gradual release: Sensei models the first word, you build it together, then the child builds them all (the
 * word-building dojo that plays levels with fixed `words`). Every letter charges its gem as usual.
 * It uses the same one-off level slot as Gem Trials: route to it with go({ name: "level", id: "trial" }), and when it
 * is done, practiceGemOf(level) says which gem it practised (send the child back to the World Flower with
 * visitFlower({ kind: "practised", gem })).
 */
export function makePractice(key: string): PracticeLevel {
  const f = frontier();
  const gem = gemByKey(key);
  const words = practiceWords(key);
  const level: PracticeLevel = {
    id: "trial",
    world: f.world,
    kind: "dojo",
    units: [...new Set([gem?.unit ?? 0, ...words.map((w) => w.unit)].filter((u) => u > 0 && u < 99))],
    upTo: f.id,
    words: words.map((w) => w.text),
    distractors: 1,
    practiceGem: key,
  };
  practice = { level, from: energyOf(key) };
  setTrialLevel(level);
  return level;
}
/** The gem a level practises, if it is a practice dojo. */
export const practiceGemOf = (l: Level | null | undefined): string | null => (l && (l as PracticeLevel).practiceGem) || null;
/** The last practice: its gem and how full the gem was before it (the World Flower animates the gain). */
export const lastPractice = () => (practice ? { gem: practice.level.practiceGem, from: practice.from } : null);

// ---------------------------------------------------------------- trips to the World Flower (docs/FEEDBACK.md Round 12)
/**
 * Why the child is being brought to the World Flower. Each one plays once per child (see flowerVisitAfter):
 * - `gem`: a gem was just won in its Gem Trial (the victory sequence; its petal may come home too)
 * - `spelling`: a level has just taught these spellings for the first time: their gems appear in their petals
 * - `world`: the start of a new land: the flower so far, one re-explanation, and the sounds hiding in this land
 * - `practised`: back from a practice dojo: the gem's energy fills up (and it may be ready for its battle)
 */
export type FlowerVisit =
  | { kind: "gem"; gem: string }
  | { kind: "spelling"; gems: string[] }
  | { kind: "world"; world: number }
  | { kind: "practised"; gem: string; from?: number };

const visitId = (v: FlowerVisit) => (v.kind === "spelling" ? v.gems.map((g) => `spelling:${g}`) : v.kind === "world" ? [`world:${v.world}`] : v.kind === "gem" ? [`gem:${v.gem}`] : []);
/** Has this child had this trip already? */
export function visited(id: string, s: Save = store.get()): boolean {
  return !!s.flowerSeen?.includes(id);
}
/** Remember that a trip has played (the World Flower calls this as it starts). */
export function markVisited(v: FlowerVisit) {
  const ids = visitId(v);
  if (!ids.length) return;
  store.set((s) => {
    const seen = (s.flowerSeen ??= []);
    for (const id of ids) if (!seen.includes(id)) seen.push(id);
  });
}

/** The gem key for a level's teach entry ("th=dh" → "th>dh"; <x> is one gem for /k/+/s/). */
export const gemKeyOfTeach = (t: string) => {
  const sg = teachEntry(t);
  return sg.g === "x" ? "x>ks" : `${sg.g}>${sg.p}`;
};

/** Sounds whose first spelling is taught in this land: the petals still hiding in the mist there. */
export function worldNewSounds(world: number): PhonemeId[] {
  const before = new Set(LEVELS.filter((l) => l.world < world).flatMap((l) => (l.teach ?? []).map((t) => teachEntry(t).p)));
  const out: PhonemeId[] = [];
  for (const l of WORLDS[world - 1]?.levels ?? []) for (const t of l.teach ?? []) {
    const p = teachEntry(t).p;
    if (!before.has(p) && !out.includes(p)) out.push(p);
  }
  return out;
}

/**
 * The trip to the World Flower that should follow a finished level, if any (the level host asks after the reward):
 * - a level that taught spellings for the first time → `spelling` (their gems appear in their petals)
 * - otherwise, the last level of a land → `world` for the next land (from the second land on)
 * Trips already had are skipped, so replaying a level never repeats one.
 */
export function flowerVisitAfter(level: Level, s: Save = store.get()): FlowerVisit | null {
  if (level.id === "review" || level.trialGem || practiceGemOf(level)) return null;
  const gems = [...new Set((level.teach ?? []).map(gemKeyOfTeach))].filter((k) => gemByKey(k)?.inPlay && !visited(`spelling:${k}`, s));
  if (gems.length) return { kind: "spelling", gems };
  const w = WORLDS[level.world - 1];
  if (w && w.levels[w.levels.length - 1].id === level.id && level.world < WORLDS.length) return flowerVisitForWorld(level.world + 1, s);
  return null;
}
/** The start-of-land trip, for a land the child is entering (null if had already, or for the first land). */
export function flowerVisitForWorld(world: number, s: Save = store.get()): FlowerVisit | null {
  if (world < 2 || world > WORLDS.length || visited(`world:${world}`, s)) return null;
  return { kind: "world", world };
}

/** Is this gem one way to spell its petal's sound? Not <x>: it spells two sounds, /k/ and /s/, so although it sits in
 *  both petals (as on the school's chart) it is never counted as a way to spell /k/ or /s/. */
export const isWayToSpell = (g: Pick<Gem, "key">) => g.key !== "x>ks";
/** How many ways to spell this sound the child knows now (met or won), for "Now you know three ways to spell /ae/". */
export function waysKnown(p: PhonemeId, s: Save = store.get()): number {
  const known = knownNow(s);
  const pt = PETALS.find((x) => x.p === p);
  return pt ? pt.gems.filter((g) => isWayToSpell(g) && isMet(gemState(g, s, known))).length : 0;
}
/** The petal a gem lives in (the first, for <x>, which lives in both /k/ and /s/). */
export const petalOfGem = (key: string): Petal | null => petalsOfGem(key)[0] ?? null;
/** Other sounds this spelling spells that the child already knows (e.g. <th> is /th/ in thin and /dh/ in this). */
export function otherSoundsOf(key: string, s: Save = store.get()): PhonemeId[] {
  const gem = gemByKey(key);
  if (!gem || key === "x>ks") return [];
  const known = knownNow(s);
  return GEMS.filter((g) => g.g === gem.g && g.p !== gem.p && g.key !== "x>ks" && isMet(gemState(g, s, known))).map((g) => g.p);
}

/** Put a child at a point in the school year: unlock earlier levels, add their sounds to the flower and
 *  half-charge those gems (they still earn each gem in a trial). Used by "Show Sensei" and "Jump ahead". */
export function placeAtUnit(unit: number) {
  store.set((s) => {
    s.seenPlacement = true;
    if (unit <= 0) return;
    s.placedAt = startLevelAfter(unit).id;
    for (const u of UNITS.filter((u) => u.id <= unit)) for (const g of u.spellings) if (!s.petals.includes(g)) s.petals.push(g);
    for (const gem of GEMS) if (gem.inPlay && gem.unit <= unit) s.energy[gem.key] = Math.max(s.energy[gem.key] ?? 0, ENERGY_FULL / 2);
  });
}
/** Offer "jump ahead" when the last 3 levels played were all perfect (3 stars) and there is somewhere to jump. */
export function shouldOfferJump(s: Save = store.get()): boolean {
  const done = LEVELS.filter((l) => (s.stars[l.id] ?? 0) > 0);
  const last3 = done.slice(-3);
  return last3.length === 3 && last3.every((l) => s.stars[l.id] === 3) && MILESTONES.some((m) => startLevelAfter(m.unit).id !== frontier(s).id && LEVELS.indexOf(startLevelAfter(m.unit)) > LEVELS.indexOf(frontier(s)));
}
