// Teacher language for sounds (petals) and spellings (gems): spoken explanations with examples, built from short
// Sensei clips (lines.ts, "Teacher language" block) + pure sounds + word clips. The wording follows the official
// Sounds~Write scripts (assets-src/sw-sources/research/sections/teacher-language.md):
//   "This is the way we spell /k/ in this word." · "It's two letters, but it's one sound." · "This is another way to
//   spell the sound /f/." · "different spellings of /ae/, not different /ae/ sounds" · "This can be /a/, but in this
//   word, it's /ae/." · "This is /X/. Say /X/ here." · "Say the sounds and listen for the word."
// Never: letter names, letters that "say" or "make" sounds, rules, "magic e", "silent letters", "tricky words".
// Each moment has several phrasings, rotated per sound/spelling, so coming back to the World Flower never sounds canned.
import type { Say } from "../engine/audio";
import { WORDS, WORD_BY_TEXT, PHONEMES, type PhonemeId, type Word } from "./phonics";
import { PETALS, type Gem } from "./flower";
import { LINES } from "./lines";
import { PIC_NAMES } from "./pic-names";
import { TEACH_EXAMPLES } from "./teach-lines.gen";

const HAS = new Set(LINES.map((l) => l.id));
/** a clip, or nothing if it hasn't been recorded yet (so new wording can ship before its audio) */
const L = (id: string): Say[] => (HAS.has(id) ? [{ line: id }] : []);
const S = (p: PhonemeId): Say => ({ sound: p });
const W = (w: Word): Say => ({ word: w.text });
const G = (ms: number): Say => ({ gap: ms });
const letters = (g: string) => g.replace(/-/g, "").length;

// ---------------------------------------------------------------- examples
const clearPic = (w: Word) => !!w.pic && !PIC_NAMES[w.text];
const soundAt = (w: Word, p: PhonemeId) => w.segs.findIndex((s) => s.p === p);

/** Example words for one spelling of a sound, best first: words the child has met, clear pictures, short and early. */
export function examplesFor(g: string, p: PhonemeId, opts: { n?: number; met?: Set<string>; exclude?: string[] } = {}): Word[] {
  const pool = WORDS.filter((w) => w.segs.some((s) => s.g === g && s.p === p) && !opts.exclude?.includes(w.text));
  const score = (w: Word) =>
    (opts.met?.has(w.text) ? 8 : 0) + (clearPic(w) ? 4 : w.pic ? 1 : 0) - w.segs.length - w.unit * 0.3 - (w.segs.filter((s) => s.p === p).length > 1 ? 3 : 0);
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, opts.n ?? 3);
}

/** Example words for a sound in any spelling. Consonants prefer words that start with the sound (easiest to hear). */
export function soundExamples(p: PhonemeId, opts: { n?: number; met?: Set<string> } = {}): Word[] {
  const vowel = !!PHONEMES[p].vowel;
  const pool = WORDS.filter((w) => soundAt(w, p) >= 0);
  const score = (w: Word) =>
    (opts.met?.has(w.text) ? 6 : 0) + (clearPic(w) ? 5 : 0) + (!vowel && soundAt(w, p) === 0 ? 3 : 0) - w.segs.length - w.unit * 0.3;
  const n = opts.n ?? 3;
  const ranked = [...pool].sort((a, b) => score(b) - score(a));
  // spread the examples across spellings where possible ("rain, play, great"), then fill with the best of the rest
  const out: Word[] = [];
  const spellings = new Set<string>();
  for (const w of ranked) {
    const g = w.segs[soundAt(w, p)].g;
    if (out.length < n && !spellings.has(g)) (out.push(w), spellings.add(g));
  }
  for (const w of ranked) if (out.length < n && !out.includes(w)) out.push(w);
  return out;
}

/** "rain, play… and great" */
function list(words: Word[]): Say[] {
  return words.flatMap((w, i) => (i > 0 && i === words.length - 1 ? [...L("t_and"), W(w)] : [W(w), G(i < words.length - 1 ? 260 : 0)]));
}

// ---------------------------------------------------------------- variety
const COUNTS_KEY = "superninja.teach.v1";
const counts: Record<string, number> = (() => {
  try {
    return JSON.parse(localStorage.getItem(COUNTS_KEY) ?? "{}");
  } catch {
    return {};
  }
})();
/** Next phrasing for this moment and item, rotating through the variants across visits. */
function pick<T>(moment: string, key: string, variants: T[]): T {
  const k = `${moment}:${key}`;
  const i = (counts[k] ?? 0) % variants.length;
  counts[k] = (counts[k] ?? 0) + 1;
  try {
    localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  } catch {}
  return variants[i];
}

// ---------------------------------------------------------------- spelling facts
/** What Sounds~Write says about how many letters a spelling has (said to children as "two letters, one sound"). */
function lettersLine(gem: Pick<Gem, "g" | "p">): Say[] {
  if (gem.g === "x" && gem.p === "ks") return L("t_one_spelling_two_sounds");
  const n = letters(gem.g);
  return n === 2 ? L("t_two_letters") : n === 3 ? L("t_three_letters") : n === 4 ? L("t_four_letters") : [];
}
/** The official Unit 7 note for double consonants: "We often spell /f/ like this at the end of some short words." */
const doubleNote = (g: string): Say[] => (["ff", "ll", "ss", "zz"].includes(g) ? L("t_often_end_short") : []);

export interface Explanation {
  say: Say[];
  /** the words to show while it plays, each with the spelling to highlight */
  show: { word: Word; highlight: { g: string; p: PhonemeId } }[];
}
const shown = (words: Word[], g: string | null, p: PhonemeId): Explanation["show"] =>
  words.map((w) => ({ word: w, highlight: { g: g ?? w.segs[soundAt(w, p)]?.g ?? "", p } }));

// ---------------------------------------------------------------- whole-sentence example clips (natural list intonation)
const safe = (k: string) => k.replace(">", "_").replace(/-/g, "");
const canon = (key: string): Word[] | null => {
  const ws = TEACH_EXAMPLES[key]?.map((t) => WORD_BY_TEXT[t]).filter(Boolean);
  return ws?.length ? ws : null;
};
/** a recorded sentence if there is one, else the spliced fallback */
const clip = (id: string, fallback: Say[]): Say[] => (HAS.has(id) ? [{ line: id }] : fallback);

// ---------------------------------------------------------------- moments
/** Introduce a sound (a petal). */
export function introPetal(p: PhonemeId, ctx: { met?: Set<string> } = {}): Explanation {
  const ex = canon(`petal:${p}`) ?? soundExamples(p, { n: 3, met: ctx.met });
  const hear = clip(`tp_${p}_hear`, [...L("t_you_can_hear_it_in"), G(120), ...list(ex)]);
  const words = clip(`tp_${p}_list`, list(ex));
  const say = pick("petal", p, [
    [...L("t_petal_is"), G(120), S(p), G(450), ...hear, G(400), ...L("t_now_you_say_it"), G(900), S(p)],
    [...L("t_listen_can_you_hear"), G(100), S(p), G(80), ...L("t_in_these_words"), G(350), ...words, G(400), ...L("t_they_all_have"), G(100), S(p)],
    [...L("t_this_is_sound"), G(120), S(p), G(300), ...L("t_everyone_say"), G(250), S(p), G(600), ...hear],
  ]);
  return { say, show: shown(ex, null, p) };
}

/** Introduce a spelling (a gem). `knownWays`: how many spellings of this sound the child now knows (for "Now you know
 *  three ways to spell /ae/"). `another`: the child already knew another spelling of this sound. */
export function introGem(gem: Pick<Gem, "g" | "p">, ctx: { met?: Set<string>; knownWays?: number; another?: boolean } = {}): Explanation {
  const { g, p } = gem;
  const k = safe(`${g}>${p}`);
  const ex = canon(`gem:${g}>${p}`) ?? examplesFor(g, p, { n: 3, met: ctx.met });
  const [first, ...rest] = ex;
  const facts = [...lettersLine(gem), ...doubleNote(g)];
  const factsSay = facts.length ? [G(350), ...facts.flatMap((f, i) => (i ? [G(250), f] : [f]))] : [];
  const ways = ctx.knownWays && ctx.knownWays >= 2 ? [G(450), ...L(`t_ways_${Math.min(10, ctx.knownWays)}`), G(100), S(p), { gap: 1 } as Say] : [];
  if (!first) {
    // no example words yet (a spelling taught later): the spelling and its facts only
    return { say: [...L("t_spelling_of"), G(100), S(p), ...factsSay, ...ways], show: [] };
  }
  const variants: Say[][] = [
    // "This is the way we spell /ae/ in rain." + facts + "We see this spelling in play and paint."
    [...L("t_way_we_spell"), G(100), S(p), G(80), ...clip(`tg_${k}_in`, [...L("t_in"), G(60), W(first)]), ...factsSay,
      ...(rest.length ? [G(400), ...clip(`tg_${k}_see`, [...L("t_we_see_it_in"), G(100), ...list(rest)])] : []), ...ways],
    // "This is a spelling of the sound /ae/." + facts + "…like in rain, play and paint."
    [...L("t_spelling_of"), G(100), S(p), ...factsSay, G(300), ...clip(`tg_${k}_like`, [...L("t_like_in"), G(80), ...list(ex)]), ...ways],
  ];
  if (ctx.another) variants.push([...L("t_another_way"), G(100), S(p), ...factsSay, G(300), ...clip(`tg_${k}_like`, [...L("t_like_in"), G(80), ...list(ex)]), ...ways]);
  return { say: pick("gem", `${g}>${p}`, variants), show: shown(ex, g, p) };
}

/** "Different spellings of /ae/… but it's the same sound!" then one example word for each spelling the child knows. */
export function sameSound(p: PhonemeId, knownGems: Pick<Gem, "g" | "p">[], ctx: { met?: Set<string> } = {}): Explanation {
  const ex = knownGems.map((gm) => examplesFor(gm.g, p, { n: 1, met: ctx.met })[0]).filter(Boolean);
  const say = pick("same", p, [
    [...L("t_diff_spellings_of"), G(80), S(p), G(80), ...L("t_same_sound"), G(450), ...list(ex)],
    [...L("t_lets_remember"), G(100), S(p), G(350), ...list(ex), G(450), ...L("t_diff_spellings_of"), G(80), S(p), G(80), ...L("t_same_sound")],
  ]);
  return { say, show: ex.map((w, i) => ({ word: w, highlight: { g: knownGems[i]?.g ?? "", p } })) };
}

/** One spelling, different sounds (Extended Code): "The same spelling can sometimes be /o/ and sometimes /oe/." */
export function sameSpelling(g: string, a: PhonemeId, b: PhonemeId, ctx: { met?: Set<string> } = {}): Explanation {
  const wa = examplesFor(g, a, { n: 1, met: ctx.met });
  const wb = examplesFor(g, b, { n: 1, met: ctx.met });
  const say = [...L("t_same_spelling_sometimes"), G(80), S(a), G(80), ...wa.map(W), G(300), ...L("t_and_sometimes"), G(80), S(b), G(80), ...wb.map(W)];
  return { say, show: [...shown(wa, g, a), ...shown(wb, g, b)] };
}

/** "This can be /a/, but in this word, it's /ae/." (a spelling read with its other sound) */
export function canBe(a: PhonemeId, b: PhonemeId): Say[] {
  return [...L("t_this_can_be"), G(80), S(a), G(80), ...L("t_but_in_this_word"), G(80), S(b)];
}

/** "This is /k/. Say /k/ here." (a spelling the child hasn't met yet, or has forgotten) */
export function sayHere(p: PhonemeId): Say[] {
  // official "This is /k/. Say /k/ here.": the second half as one clip ("Say it here!") joins far more naturally
  return [...L("this_is"), G(80), S(p), G(350), ...L("t_say_it_here")];
}

/** "Does this word have /o/ or /oe/?" (sorting by sound) */
export function whichSound(a: PhonemeId, b: PhonemeId): Say[] {
  return [...L("t_does_it_have"), G(80), S(a), G(80), ...L("t_or"), G(80), S(b)];
}

/** Coming back to the World Flower. */
export function revisitIntro(key = "any"): Say[] {
  return pick("visit", key, [L("t_visit"), L("t_look_growing"), [...L("t_visit"), G(300), ...L("t_look_growing")]]);
}

/** A newly won gem flies into its petal: "Your new gem goes right here!" + the gem's explanation, counting the ways. */
export function newGem(gem: Pick<Gem, "g" | "p">, ctx: { met?: Set<string>; knownWays: number }): Explanation {
  const e = introGem(gem, { ...ctx, another: ctx.knownWays > 1 });
  return { say: [...L("t_new_gem_here"), G(400), ...e.say], show: e.show };
}

// ---------------------------------------------------------------- for grown-ups (text; shown on the flower and in the grown-ups area)
const slash = (p: PhonemeId) => { const l = PHONEMES[p].label; return l.startsWith("/") ? l : `/${l}/`; };
export function describeGem(gem: Pick<Gem, "g" | "p">): string {
  const ex = examplesFor(gem.g, gem.p, { n: 3 }).map((w) => w.text);
  const n = letters(gem.g);
  const kind = gem.g === "x" && gem.p === "ks" ? " (one spelling, two sounds)" : n >= 2 ? ` (${["", "", "two", "three", "four"][n]} letters, one sound)` : "";
  return `< ${gem.g} > spells ${slash(gem.p)}${kind}${ex.length ? `, as in ${ex.join(", ")}` : ""}.`;
}
export function describePetal(p: PhonemeId): string {
  const pt = PETALS.find((x) => x.p === p);
  const gems = (pt?.gems ?? []).map((gm) => `< ${gm.g} > ${examplesFor(gm.g, p, { n: 1 })[0]?.text ?? ""}`.trim());
  return `The sound ${slash(p)}, as in ${PHONEMES[p].example}. ${gems.length > 1 ? `Spellings: ${gems.join(" · ")}.` : ""}`.trim();
}
