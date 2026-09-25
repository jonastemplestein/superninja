// Build-time checks that child-facing text is decodable with the sounds taught so far.
import { ALL_SPELLINGS_BY_UNIT, SPECIAL_WORDS, parseWord, PHONEMES, type Seg } from "./phonics";
import { STORIES } from "./stories";

const SPECIAL = new Set(SPECIAL_WORDS.map((w) => w.toLowerCase()));

export function tokenize(text: string) {
  return text.split(/\s+/).map((t) => t.replace(/[^A-Za-z']/g, "")).filter(Boolean);
}

/** Segment a word for a given max unit, or null if it isn't decodable yet. */
export function decode(word: string, maxUnit: number): Seg[] | null {
  const w = word.toLowerCase();
  if (SPECIAL.has(w)) return null;
  const allowed = new Set(ALL_SPELLINGS_BY_UNIT[Math.min(maxUnit, ALL_SPELLINGS_BY_UNIT.length) - 1]);
  try {
    const segs = parseWord(w, allowed);
    if (!segs.every((s) => allowed.has(s.g))) return null;
    // word structure: adjacent consonant sounds arrive in units 8 (final), 9 (initial), 10 (3+)
    const cons = segs.map((s) => !PHONEMES[s.p].vowel);
    const firstV = cons.indexOf(false);
    const lastV = cons.lastIndexOf(false);
    const onset = firstV, coda = segs.length - 1 - lastV;
    if (maxUnit < 8 && (onset > 1 || coda > 1)) return null;
    if (maxUnit < 9 && onset > 1) return null;
    if (maxUnit < 10 && onset + coda > 3) return null;
    return segs;
  } catch {
    return null;
  }
}

export function validateStories(): string[] {
  const problems: string[] = [];
  for (const st of STORIES) {
    for (const p of st.pages) {
      const texts = p.kind === "read" ? [p.text] : p.kind === "choice" ? p.options.map((o) => o.word) : [];
      for (const t of texts)
        for (const w of tokenize(t))
          if (!SPECIAL.has(w.toLowerCase()) && !decode(w, st.maxUnit)) problems.push(`${st.id}/${p.id}: "${w}" not decodable at unit ${st.maxUnit}`);
    }
  }
  return problems;
}

if ((import.meta as any).main) {
  const p = validateStories();
  console.log(p.length ? p.join("\n") : "All story text decodable ✓");
}
