// The narrative audit's explanations in the level scenes (docs/NARRATIVE_AUDIT.md, playtest/narrative/audit.json):
// which line explains what, when it is due again, and which words and slots it points at. Typed data and small pure
// functions only; the scenes' runtime (the per-save ledger, the pictures that go with the words) is src/scenes/narrate.tsx.
//
// Spacing follows the audit's schedule: a notion is explained where it is first needed, again the next level it comes
// up, then a couple of levels later, and then only at teaching moments (a new spelling's Learn) and on errors. A
// spelling's own teaching moment always explains it. Sounds~Write wording throughout (teach.ts, teacher-language.md):
// spellings spell sounds; "It's two letters, but it's one sound."; "This is 'the', just say 'the' here."
import { PHONEMES, type PhonemeId, type Seg, type Word } from "./phonics";

// ---------------------------------------------------------------- spacing
/** Where a notion has been explained (level indices in LEVELS order, one per telling). */
export interface Exposure { n: number; at: number[] }
/**
 * Spacing schedules: entry k is the smallest number of levels between telling k and telling k+1 (0 = the same level
 * is fine, e.g. the next story page). Past the end the notion is retired (teach moments and errors still explain it).
 */
export const SPACING = {
  /** Sounds~Write concepts (two letters, one sound; one spelling, two sounds): where first needed, the next level it
   *  comes up, then two levels on */
  concept: [0, 1, 2],
  /** terms and mechanics (the dojo, the speaker button): twice, in different levels */
  twice: [0, 1],
  /** once per save (the gem energy, the first gem battle, Baron Muddle's motive, a position's name per level) */
  once: [0],
  /** a special word: its first page, the next page with it, then a later story */
  special: [0, 0, 1],
  /** the short welcome back to the dojo, after the two full ones */
  short: [0, 1, 1],
} as const satisfies Record<string, readonly number[]>;
export type Spacing = keyof typeof SPACING;

/** Is the next telling of a notion due at level index `at`? */
export function due(e: Exposure | undefined, at: number, spacing: Spacing): boolean {
  const gaps = SPACING[spacing];
  const n = e?.n ?? 0;
  if (n >= gaps.length) return false;
  if (n === 0 || !e?.at.length) return true;
  return at - e.at[e.at.length - 1] >= gaps[n];
}
/** The exposure after one more telling at level index `at`. */
export const told = (e: Exposure | undefined, at: number): Exposure => ({ n: (e?.n ?? 0) + 1, at: [...(e?.at ?? []), at] });

// ---------------------------------------------------------------- two letters, one sound
/** How many letters a spelling has, said the teach.ts way (its lettersLine): "It's two letters, but it's one sound."
 *  < x > is one spelling for two sounds. Null for a one-letter spelling. */
export function lettersLine(seg: Pick<Seg, "g" | "p">): string | null {
  if (seg.g === "x") return "t_one_spelling_two_sounds";
  const n = seg.g.replace(/-/g, "").length;
  return n === 2 ? "t_two_letters" : n === 3 ? "t_three_letters" : n === 4 ? "t_four_letters" : null;
}
/** The ledger key for a spelling's "two letters, one sound". */
export const lettersKey = (g: string) => `letters:${g}`;
/** The spellings of a word worth a "two letters, one sound" (or < x >) reminder, with their slot, first come first. */
export const multiLetter = (segs: readonly Seg[]): { i: number; seg: Seg }[] =>
  segs.map((seg, i) => ({ i, seg })).filter(({ seg }) => lettersLine(seg) !== null);

// ---------------------------------------------------------------- one spelling, two sounds
/** Spellings that spell two different sounds in the current worlds (Sounds~Write concept 4). */
export const TWO_SOUNDS: Record<string, readonly [PhonemeId, PhonemeId]> = { th: ["th", "dh"] };
/** The other sound this spelling can be, if it has one ("th" as /th/ → /dh/). */
export function otherSound(seg: Pick<Seg, "g" | "p">): PhonemeId | null {
  const pair = TWO_SOUNDS[seg.g];
  if (!pair || !pair.includes(seg.p)) return null;
  return pair[0] === seg.p ? pair[1] : pair[0];
}
export const twoSoundsKey = (g: string) => `two-sounds:${g}`;

// ---------------------------------------------------------------- adjacent consonants
/** The slots of consonant sounds that sit next to another consonant sound ("frog" → 0, 1; "stamp" → 0, 1, 3, 4). */
export function adjacentSlots(segs: readonly Seg[]): number[] {
  const cons = segs.map((s) => !PHONEMES[s.p]?.vowel);
  return segs.map((_, i) => i).filter((i) => cons[i] && (cons[i - 1] || cons[i + 1]));
}
/** Units 8-10 are about adjacent consonants (Sounds~Write Initial Code: at the end, at the start, three or four). */
export const ADJACENT_UNITS = [8, 9, 10];
/** The unit whose adjacent-consonant structure a level practises, if any (its highest of 8-10). */
export const adjacentUnit = (units: readonly number[]): number | null => {
  const u = units.filter((x) => ADJACENT_UNITS.includes(x));
  return u.length ? Math.max(...u) : null;
};
/** Adjacent-consonant units (8-10): a word with sounds next to each other goes first, so the unit's explanation (at
 *  the first such word: Dojo.tsx) comes at the start of the lesson rather than whenever the draw puts one (F12). The
 *  rest keep their order. */
export function clusterFirst<T extends { segs: readonly Seg[] }>(words: T[], units: readonly number[]): T[] {
  if (!adjacentUnit(units)) return words;
  const i = words.findIndex((w) => adjacentSlots(w.segs).length > 1);
  return i <= 0 ? words : [words[i], ...words.slice(0, i), ...words.slice(i + 1)];
}

// ---------------------------------------------------------------- first, middle and last
export type Position = "first" | "middle" | "last";
/** The name of a sound's place in a word, where a young child can use it: first, last, and middle only in a
 *  three-sound word (in "frog" the /r/ is not "the middle sound"). */
export function positionName(pos: number, len: number): Position | null {
  if (pos === 0) return "first";
  if (pos === len - 1) return "last";
  return len === 3 && pos === 1 ? "middle" : null;
}
/** Sound Swap: the right sound was picked. The line names its place, then asks for the new sound. */
export const SWAP_POSITION_LINE: Record<Position, string> = { first: "audit_swap_first", middle: "audit_swap_middle", last: "audit_swap_last" };

// ---------------------------------------------------------------- rotating whole-sentence leads
/** "Listen again" corrections, rotated so a learner who misses often doesn't hear one sentence over and over. The
 *  stretched set promises a slow word, so it is only for words with a stretched recording. */
export const LISTEN_AGAIN = {
  stretched: ["listen_here", "audit_listen_slowly", "audit_listen_next"],
  plain: ["listen_here", "audit_listen_next"],
} as const;
/** Ninja Run's cue before a word's sounds (the first of a run keeps "Ninja Run! ..."). */
export const RUN_BLEND_CUES = ["run_blend", "audit_sounds_again", "t_listen_for_word"] as const;
/** The next item of a rotation after `last` (the first one when `last` isn't in it). */
export function rotate<T>(list: readonly T[], last: T | null | undefined): T {
  const i = last == null ? -1 : list.indexOf(last);
  return list[(i + 1) % list.length];
}

// ---------------------------------------------------------------- special words (stories)
/** Common words with a spelling the child hasn't been taught, as the official parent guidance handles them: "This
 *  is 'the', just say 'the' here." One recorded sentence per word. (Not "a": a text-to-speech voice reads a lone "a"
 *  as the letter name.) */
export const SPECIAL_LINE: Record<string, string> = {
  the: "audit_special_the",
  is: "audit_special_is",
  his: "audit_special_his",
  to: "audit_special_to",
  i: "audit_special_i",
  so: "audit_special_so",
  he: "audit_special_he",
  you: "audit_special_you",
  go: "audit_special_go",
};
export const specialKey = (w: string) => `special:${w}`;
/** The special words on a page that have a line, in reading order: [word, index of the token]. */
export function specialWords(text: string): { word: string; index: number }[] {
  return text
    .split(" ")
    .map((t, index) => ({ word: t.toLowerCase().replace(/[^a-z']/g, ""), index }))
    .filter(({ word }) => word in SPECIAL_LINE);
}

// ---------------------------------------------------------------- sorting
/** "This sound can be spelt in two ways." (three ways for three chests) */
export const sortWaysLine = (n: number): string | null => (n === 2 ? "audit_sort_pair" : n === 3 ? "audit_sort_three" : null);

// ---------------------------------------------------------------- gem energy
/** The gem to show when a word first fills one: the level's new spelling if the word has one, else its first. */
export function gemSeg(word: Pick<Word, "segs">, teach: readonly string[] = []): Seg {
  const taught = new Set(teach.map((t) => t.split("=")[0]));
  return word.segs.find((s) => taught.has(s.g)) ?? word.segs[0];
}
