// Gem progression: practice charges a spelling's gem; a full gem unlocks a timed Gem Trial; won gems fill petals.
import { GEMS, PETALS, neededGems, gemByKey, type Gem, type Petal } from "../content/flower";
import { WORDS, UNITS, dictationSafe, type Word } from "../content/phonics";
import { LEVELS, knownSpellings, setTrialLevel, MILESTONES, startLevelAfter, type Level } from "../content/worlds";
import { store, ENERGY_FULL, type Save } from "./store";

export type GemState = "future" | "hidden" | "charging" | "ready" | "won";

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
