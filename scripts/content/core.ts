import { GRAPHEMES, WORDS, type PhonemeId } from "../../src/content/phonics";
import {
  DEFAULT_SPLIT, SW_SEQUENCE, gpcsOfUnit, knownGpcsAt, isDecodableAt,
  renderSegs, structureOf, type SwSeg, type SwUnitId,
} from "../../src/content/sw";

export const POLICY = { split: DEFAULT_SPLIT, psc: false } as const;
export const ALL_GPCS = new Set(SW_SEQUENCE.flatMap(u => gpcsOfUnit(u, POLICY)));
export const EXISTING = new Map(WORDS.map(w => [w.text, w]));

// Ambiguous single spellings in the published Lesson 10 word sets. The
// pronunciation, rather than the current unit's ranking bonus, decides these.
const SOUND_OVERRIDES: Record<string, Partial<Record<string, PhonemeId>>> = {
  great: { ea: "ae" }, break: { ea: "ae" }, steak: { ea: "ae" },
  go: { o: "oe" }, no: { o: "oe" }, so: { o: "oe" }, old: { o: "oe" },
  hole: { o: "oe" }, pole: { o: "oe" }, mole: { o: "oe" },
  mile: { i: "ie" }, tile: { i: "ie" }, file: { i: "ie" }, pile: { i: "ie" }, smile: { i: "ie" },
  rule: { u: "oo" },
  most: { o: "oe" }, post: { o: "oe" }, host: { o: "oe" }, both: { o: "oe" }, fro: { o: "oe" },
  book: { oo: "uu" }, cook: { oo: "uu" }, foot: { oo: "uu" }, good: { oo: "uu" },
  look: { oo: "uu" }, shook: { oo: "uu" }, took: { oo: "uu" }, wood: { oo: "uu" },
  hook: { oo: "uu" }, crook: { oo: "uu" }, rook: { oo: "uu" },
  cousin: { ou: "u" }, double: { ou: "u" }, touch: { ou: "u" }, trouble: { ou: "u" }, young: { ou: "u" },
  soup: { ou: "oo" }, group: { ou: "oo" },
  brow: { ow: "ou" }, crowd: { ow: "ou" }, crown: { ow: "ou" },
  frown: { ow: "ou" }, how: { ow: "ou" }, wow: { ow: "ou" },
  new: { ew: "ue" }, few: { ew: "ue" }, knew: { ew: "ue" }, stew: { ew: "ue" },
  chew: { ew: "ue" }, blew: { ew: "oo" }, flew: { ew: "oo" }, grew: { ew: "oo" }, drew: { ew: "oo" }, brew: { ew: "oo" },
  was: { a: "o", s: "z" }, wasp: { a: "o" }, wash: { a: "o" }, watch: { a: "o" },
  want: { a: "o" }, what: { a: "o" }, wand: { a: "o" }, swat: { a: "o" }, swan: { a: "o" }, squash: { a: "o" },
  his: { s: "z" }, is: { s: "z" }, has: { s: "z" }, as: { s: "z" },
  lids: { s: "z" }, eggs: { s: "z" }, hills: { s: "z" }, tins: { s: "z" },
  trees: { s: "z" }, shoes: { s: "z" }, prams: { s: "z" }, crabs: { s: "z" }, lines: { s: "z" },
  news: { ew: "ue", s: "z" }, stairs: { s: "z" },
  rough: { ou: "u", gh: "f" }, tough: { ou: "u", gh: "f" },
  enough: { ou: "u", gh: "f" }, laugh: { au: "ar", gh: "f" },
  huge: { u: "ue", ge: "j" },
  dogs: { s: "z" }, pigs: { s: "z" }, beds: { s: "z" }, bags: { s: "z" }, hens: { s: "z" }, pens: { s: "z" },
  this: { th: "dh" }, that: { th: "dh" }, then: { th: "dh" }, them: { th: "dh" },
  there: { th: "dh" }, their: { th: "dh" },
};
const AE_A_WORDS = new Set(["cake", "make", "take", "bake", "gate", "game", "same", "cave", "flame", "shake", "whale", "sale", "tale", "pale"]);

export function parseSegs(spec: string): SwSeg[] {
  return spec.split(".").map(part => {
    const [spelling, sound] = part.split("=");
    const [g, gap] = spelling.split(":");
    const p = (sound || GRAPHEMES[g]) as PhonemeId;
    if (!g || !p || (gap && (!/^\d+$/.test(gap) || +gap < 1))) throw new Error(`invalid segment ${part}`);
    return { g, p, ...(gap ? { gap: +gap } : {}) };
  });
}

export function formatSegs(segs: SwSeg[]): string {
  return segs.map(s => `${s.g}${s.gap ? `:${s.gap}` : ""}${GRAPHEMES[s.g] === s.p ? "" : `=${s.p}`}`).join(".");
}

/** Align a single-syllable candidate to code, preferring longer spellings and the model's default sound. */
export function align(text: string, unit: SwUnitId): SwSeg[] | null {
  const old = EXISTING.get(text);
  if (old) return old.segs;
  const known = knownGpcsAt(unit, POLICY);
  const ecKeys = unit.startsWith("EC") ? new Set(gpcsOfUnit(unit, POLICY)) : new Set<string>();
  // These spellings cannot be silently split into one-letter sounds before they are taught.
  for (const m of text.matchAll(/tch|sh|ch|th|ng|wh|ck|ff|ll|ss|zz|nk/g)) {
    const g = m[0] === "nk" ? "n" : m[0];
    const p = m[0] === "nk" ? "ng" : GRAPHEMES[g];
    if (!known.has(`${g}>${p}`)) return null;
  }
  const spellings = [...known].map(k => {
    const [g, p] = k.split(">");
    return { g, p: p as PhonemeId };
  }).filter(x => !x.g.includes("-")).sort((a, b) => b.g.length - a.g.length);
  const memo = new Map<number, { segs: SwSeg[]; score: number } | null>();
  const go = (i: number): { segs: SwSeg[]; score: number } | null => {
    if (i === text.length) return { segs: [], score: 0 };
    if (memo.has(i)) return memo.get(i)!;
    let best: { segs: SwSeg[]; score: number } | null = null;
    for (const s of spellings) {
      if (!text.startsWith(s.g, i)) continue;
      // The Lexicon analyses these words with final <gh> = /f/. The longer
      // <ough> spelling would otherwise hide that consonant at EC41.
      if (["rough", "tough", "enough"].includes(text) && s.g === "ough") continue;
      if (s.g === "st" && s.p === "s") continue; // silent t occurs in later polysyllabic words, not an onset cluster
      if (ecKeys.size && s.g.length >= 2 && s.g.endsWith("e") && !/[aeiou]/.test(s.g[0]) && i + s.g.length !== text.length) continue;
      if (s.g === "n" && text[i + 1] === "k" && s.p !== "ng") continue;
      if (s.g === "n" && text[i + 1] !== "k" && s.p === "ng") continue;
      const rest = go(i + s.g.length);
      if (!rest) continue;
      const currentTarget = ecKeys.has(`${s.g}>${s.p}`);
      // Under the 2024 policy the final e belongs to the consonant. Prefer
      // that two-letter tile, and the current unit's vowel over an older one.
      const score = rest.score + s.g.length ** 5 + (GRAPHEMES[s.g] === s.p ? 2 : 0)
        + (currentTarget ? 12 : 0)
        + (ecKeys.size && s.g.length === 2 && s.g.endsWith("e") && i + 2 === text.length && !/[aeiou]/.test(s.g[0]) ? 12 : 0);
      if (!best || score > best.score) best = { segs: [s, ...rest.segs], score };
    }
    memo.set(i, best);
    return best;
  };
  const result = go(0)?.segs ?? null;
  if (result) for (const s of result) {
    const override = (s.g === "a" && AE_A_WORDS.has(text) ? "ae" : undefined) ?? SOUND_OVERRIDES[text]?.[s.g];
    if (override && known.has(`${s.g}>${override}`)) s.p = override;
  }
  return result && renderSegs(result) === text && isDecodableAt(result, unit, POLICY) ? result : null;
}

export function firstDecodable(segs: SwSeg[]): SwUnitId | undefined {
  return SW_SEQUENCE.find(u => isDecodableAt(segs, u, POLICY));
}

export function structure(segs: SwSeg[]): string { return structureOf(segs.map(s => s.p)); }
