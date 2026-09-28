// Build-time checks that child-facing text is decodable with the sounds taught so far, and (report only) that no turn
// showing a sound's petal can offer that petal's own picture as an answer card.
import { ALL_SPELLINGS_BY_UNIT, SPECIAL_WORDS, parseWord, PHONEMES, GRAPHEMES, WORDS, WORD_BY_TEXT, ORAL_WORDS, type Seg, type PhonemeId } from "./phonics";
import { STORIES } from "./stories";
import { WORLDS } from "./worlds";
import { iconWordOf } from "./flower";
import { picSaysFirst } from "./pic-names";
import { STRETCHED } from "./stretch";

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

// ---------------------------------------------------------------- petal giveaways (SOUND_DISPLAY A12)
/** A turn that shows `p`'s petal (its picture is `word`) and can offer a `word` card: the child can match two pictures
 *  instead of listening. `as`: the card's role (the answer, a foil, or the other sound's answer in a two-sound level). */
export interface Giveaway {
  where: string;
  p: PhonemeId;
  word: string;
  as: "answer" | "foil" | "other";
}
/** Early.tsx FirstSoundLevel's foils (the wrong picture beside a first-sound answer). Keep in step with the scene. */
const FIRST_SOUND_FOILS = ["dog", "bus", "cup", "hat", "hen", "jam", "bed", "fox", "web", "zip", "van", "cat", "pig", "fan"];
const firstOf = (w: string): PhonemeId | undefined => WORD_BY_TEXT[w]?.segs[0].p ?? ORAL_WORDS[w]?.first;
/** Early.tsx FirstSoundLevel's deck for a sound: pictured words a child names with that first sound (no clusters, no
 *  < sh >/< ch > starts, stretchable), plus the picture-only vowel words (apple, octopus). */
function firstSoundDeck(p: PhonemeId): string[] {
  const decodable = WORDS.filter((w) => w.pic && w.segs[0].p === p && w.segs.length <= 4 && !["sh", "ch"].includes(w.segs[0].g) && !(w.segs[1] && !PHONEMES[w.segs[0].p].vowel && !PHONEMES[w.segs[1].p].vowel) && STRETCHED.has(w.text)).map((w) => w.text);
  const oral = Object.keys(ORAL_WORDS).filter((w) => ORAL_WORDS[w].first === p && PHONEMES[p].vowel);
  return [...decodable, ...oral].filter(picSaysFirst);
}
/**
 * Report only (not a build failure: C1 and lane A take these words out at runtime). The first-sound levels' decks and
 * placement's find-all rounds that can offer the target petal's own picture word (w1-3: /a/'s apple; w1-10: /p/'s pig).
 * The decks are rebuilt here from the same rules as Early.tsx and Placement.tsx.
 */
export function petalGiveaways(): Giveaway[] {
  const out: Giveaway[] = [];
  for (const world of WORLDS)
    for (const lv of world.levels) {
      if (lv.kind !== "firstsound") continue;
      const sounds = (lv.teach ?? []).map((g) => GRAPHEMES[g.split("=")[0]]).filter(Boolean);
      for (const p of sounds) {
        const word = iconWordOf(p);
        if (!word) continue;
        const foils = FIRST_SOUND_FOILS.filter((w) => picSaysFirst(w) && firstOf(w) !== p && !sounds.includes(WORD_BY_TEXT[w]?.segs[0].p as PhonemeId));
        const others = sounds.length > 1 ? sounds.filter((q) => q !== p).flatMap(firstSoundDeck) : [];
        const as = firstSoundDeck(p).includes(word) ? "answer" : foils.includes(word) ? "foil" : others.includes(word) ? "other" : null;
        if (as) out.push({ where: lv.id, p, word, as });
      }
    }
  // placement (Placement.tsx findAllRound): the answers are pictured words with the sound in them
  for (const p of ["ae", "ee", "oe"] as PhonemeId[]) {
    const word = iconWordOf(p);
    if (word && WORDS.some((w) => w.pic && w.text === word && w.segs.some((s) => s.p === p))) out.push({ where: "placement find-all", p, word, as: "answer" });
  }
  return out;
}

if ((import.meta as any).main) {
  const p = validateStories();
  console.log(p.length ? p.join("\n") : "All story text decodable ✓");
  const g = petalGiveaways();
  const a = (w: string) => `${/^[aeiou]/.test(w) ? "an" : "a"} ${w}`;
  console.log(
    g.length
      ? `Petal giveaways (report only, SOUND_DISPLAY A12; the scenes leave these cards out at runtime):\n${g.map((x) => `  ${x.where}: /${x.p}/'s petal is ${a(x.word)}, and ${a(x.word)} card can come up (${x.as})`).join("\n")}`
      : "No petal giveaways ✓",
  );
}
