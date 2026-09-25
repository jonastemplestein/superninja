// Picks practice items: weighted toward this level's new spellings and toward the child's weaker spelling→sound
// pairs, with ~20% review from earlier levels. Keeps success high (~75-85%) by limiting new difficulty per round.
import { gpcKey, GRAPHEMES, WORDS, WORD_BY_TEXT, type Word, type Seg } from "../content/phonics";
import { levelWords, knownSpellings, LEVELS, type Level } from "../content/worlds";
import { store, mastery } from "./store";

export const shuffle = <T,>(a: T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

function weightedSample<T>(items: T[], weight: (t: T) => number, n: number): T[] {
  const pool = items.map((t) => ({ t, w: Math.max(0.01, weight(t)) }));
  const out: T[] = [];
  while (out.length < n && pool.length) {
    const total = pool.reduce((a, b) => a + b.w, 0);
    let r = Math.random() * total;
    let i = 0;
    for (; i < pool.length - 1; i++) if ((r -= pool[i].w) <= 0) break;
    out.push(pool[i].t);
    pool.splice(i, 1);
  }
  return out;
}

/** Choose n words for a level. mode decides whether reading or spelling mastery drives the weights. */
export function chooseWords(level: Level, n: number, mode: "read" | "spell", opts: { needPic?: boolean; maxLen?: number } = {}): Word[] {
  const s = store.get();
  const skills = mode === "read" ? s.read : s.spell;
  let pool = levelWords(level);
  if (opts.needPic) pool = pool.filter((w) => w.pic);
  if (opts.maxLen) pool = pool.filter((w) => w.segs.length <= opts.maxLen!);
  const teach = new Set(level.teach ?? []);
  const weight = (w: Word) => {
    const weakness = w.segs.reduce((a, seg) => a + (1 - mastery(skills[gpcKey(seg)])), 0) / w.segs.length;
    const newness = w.segs.some((seg) => teach.has(seg.g)) ? 1.8 : 1;
    const seen = s.words[w.text];
    const recent = seen && Date.now() - seen.last < 60_000 ? 0.2 : 1;
    return (0.3 + weakness) * newness * recent;
  };
  const main = weightedSample(pool, weight, Math.ceil(n * 0.8));
  // review: earlier levels' words the child found hard
  const idx = LEVELS.indexOf(level);
  const earlier = new Set(LEVELS.slice(0, idx).flatMap((l) => levelWords(l).map((w) => w.text)));
  const known = knownSpellings(level);
  let review = WORDS.filter((w) => earlier.has(w.text) && !main.includes(w) && w.segs.every((sg) => known.has(sg.g)));
  if (opts.needPic) review = review.filter((w) => w.pic);
  if (opts.maxLen) review = review.filter((w) => w.segs.length <= opts.maxLen!);
  const rev = weightedSample(review, weight, n - main.length);
  const all = [...main, ...rev];
  // top up if pools were small
  if (all.length < n) all.push(...weightedSample(pool.filter((w) => !all.includes(w)), () => 1, n - all.length));
  while (all.length < n && pool.length) all.push(pick(pool));
  return shuffle(all).slice(0, n);
}

/** Letter tiles for spelling a word: its spellings plus plausible distractors from known spellings. */
export function tileBank(word: Word, level: Level, extra = 3): string[] {
  const known = [...knownSpellings(level)];
  const need = word.segs.map((s) => s.g);
  const confusable: Record<string, string[]> = {
    b: ["d", "p"], d: ["b", "p"], p: ["b", "q"], m: ["n", "w"], n: ["m", "h"], i: ["e", "l"], e: ["i", "a"], a: ["o", "u"],
    o: ["a", "u"], u: ["o", "a"], c: ["k", "ck"], k: ["c", "ck"], ck: ["c", "k"], s: ["z", "sh"], sh: ["s", "ch"], ch: ["sh", "tch"],
    th: ["f", "v"], f: ["th", "v"], v: ["f", "w"], w: ["wh", "v"], t: ["d", "f"], g: ["j", "c"], j: ["g", "ch"], ll: ["l"], ff: ["f"], ss: ["s"],
    ai: ["ay", "a"], ay: ["ai", "a"], ee: ["ea", "e"], ea: ["ee", "e"], igh: ["ie", "i"], ie: ["igh", "i"], oa: ["ow", "o"], ow: ["oa", "o"],
  };
  extra = Math.max(Math.min(extra, 7 - new Set(need).size), 0);
  const pool = new Set<string>();
  const needSounds = new Set(word.segs.map((s) => s.p));
  const ok = (c: string) => known.includes(c) && !need.includes(c) && !needSounds.has(GRAPHEMES[c]);
  for (const g of need) for (const c of confusable[g] ?? []) if (ok(c)) pool.add(c);
  const distractors = shuffle([...pool]).slice(0, extra);
  const others = shuffle(known.filter((g) => ok(g) && !distractors.includes(g)));
  while (distractors.length < extra && others.length) distractors.push(others.pop()!);
  return shuffle([...new Set([...need, ...distractors])]);
}

/** Pairs of words that differ by exactly one sound in the same position. */
function oneSwap(a: Word, b: Word): number {
  if (a.segs.length !== b.segs.length || a.text === b.text) return -1;
  let diff = -1;
  for (let i = 0; i < a.segs.length; i++) {
    if (a.segs[i].p !== b.segs[i].p || a.segs[i].g !== b.segs[i].g) {
      if (diff >= 0) return -1;
      diff = i;
    }
  }
  return diff;
}

/** A word ladder (hat → hot → hop → mop ...) within the level's words. */
export function swapChain(level: Level, len = 5): { from: Word; to: Word; pos: number }[] {
  const pool = levelWords(level).concat(
    LEVELS.slice(0, LEVELS.indexOf(level)).flatMap((l) => levelWords(l)),
  );
  const uniq = [...new Map(pool.map((w) => [w.text, w])).values()];
  let best: Word[] = [];
  for (let attempt = 0; attempt < 60; attempt++) {
    const start = pick(uniq.filter((w) => level.units.includes(w.unit)));
    const chain = [start];
    let lastPos = -1;
    while (chain.length < len + 1) {
      const cur = chain[chain.length - 1];
      const nexts = uniq.filter((w) => !chain.includes(w) && oneSwap(cur, w) >= 0 && oneSwap(cur, w) !== lastPos);
      if (!nexts.length) break;
      const prefer = nexts.filter((w) => w.pic);
      const nx = pick(prefer.length && Math.random() < 0.6 ? prefer : nexts);
      lastPos = oneSwap(cur, nx);
      chain.push(nx);
    }
    if (chain.length > best.length) best = chain;
    if (best.length >= len + 1) break;
  }
  return best.slice(1).map((to, i) => ({ from: best[i], to, pos: oneSwap(best[i], to) }));
}

export const wordOf = (t: string) => WORD_BY_TEXT[t];
export const graphemeSound = (g: string) => GRAPHEMES[g];
export type { Word, Seg };
