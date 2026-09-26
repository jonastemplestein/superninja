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
/** "This is a spelling of the sound..." (wf_spelling_of: re-recorded, the older take ends in a stray /k/) */
const SPELLING_OF = HAS.has("wf_spelling_of") ? "wf_spelling_of" : "t_spelling_of";
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
  /** the same speech in labelled parts, so a scene can time its pictures to them (`say` is all of them in order) */
  beats?: Beat[];
}
/** One part of an explanation or a trip to the World Flower. `cue` tells the scene what to show while it plays. */
export interface Beat {
  cue: string;
  say: Say[];
  /** words to show during this part */
  show?: Explanation["show"];
  /** the sound (petal) or gem this part is about */
  p?: PhonemeId;
  gem?: string;
}
const flat = (beats: Beat[]): Say[] => beats.flatMap((b, i) => (i && b.say.length ? [G(350), ...b.say] : b.say));
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

/** The example words Sensei uses for a sound or one of its spellings, to show before she speaks (no rotation). */
export function exampleWords(p: PhonemeId, g?: string | null, met?: Set<string>): Explanation["show"] {
  const ex = g ? canon(`gem:${g}>${p}`) ?? examplesFor(g, p, { n: 3, met }) : canon(`petal:${p}`) ?? soundExamples(p, { n: 3, met });
  return shown(ex, g ?? null, p);
}

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
export function introGem(gem: Pick<Gem, "g" | "p">, ctx: { met?: Set<string>; knownWays?: number; another?: boolean; phrasing?: "way" } = {}): Explanation {
  const { g, p } = gem;
  const key = `${g}>${p}`;
  const k = safe(key);
  const ex = canon(`gem:${key}`) ?? examplesFor(g, p, { n: 3, met: ctx.met });
  const [first, ...rest] = ex;
  const facts: Say[][] = [lettersLine(gem), doubleNote(g)].filter((f) => f.length);
  // a long spelling for one sound: the child says the sound while looking at it ("Say that sound with me!"),
  // the Sounds~Write "This is /ie/. Say /ie/ here." routine (NARRATIVE_AUDIT F21)
  if (letters(g) >= 3 && !(g === "x" && p === "ks")) facts.push([...L("t_everyone_say"), G(250), S(p)]);
  const factsSay = facts.length ? [G(350), ...facts.flatMap((f, i) => (i ? [G(250), ...f] : f))] : [];
  const ways = waysLine(p, ctx.knownWays);
  const beats = (main: Say[]): Beat[] => [{ cue: "explain", say: main, show: shown(ex, g, p), gem: key, p }, ...(ways.length ? [{ cue: "ways", say: ways, gem: key, p }] : [])];
  if (!first) {
    // no example words yet (a spelling taught later): the spelling and its facts only
    const b = beats([...L(SPELLING_OF), G(100), S(p), ...factsSay]);
    return { say: flat(b), show: [], beats: b };
  }
  const variants: Say[][] = [
    // "This is the way we spell /ae/ in rain." + facts + "We see this spelling in play and paint."
    [...L("t_way_we_spell"), G(100), S(p), G(80), ...clip(`tg_${k}_in`, [...L("t_in"), G(60), W(first)]), ...factsSay,
      ...(rest.length ? [G(400), ...clip(`tg_${k}_see`, [...L("t_we_see_it_in"), G(100), ...list(rest)])] : [])],
    // "This is a spelling of the sound /ae/." + facts + "…like in rain, play and paint."
    [...L(SPELLING_OF), G(100), S(p), ...factsSay, G(300), ...clip(`tg_${k}_like`, [...L("t_like_in"), G(80), ...list(ex)])],
  ];
  // a spelling of a sound the child already knows: "This is another way to spell the sound /ae/" comes first
  if (ctx.another) variants.unshift([...L("t_another_way"), G(100), S(p), ...factsSay, G(300), ...clip(`tg_${k}_like`, [...L("t_like_in"), G(80), ...list(ex)])]);
  // `phrasing: "way"`: always "This is the way we spell /ae/ in rain…" (when the line before has already said the rest)
  const b = beats(ctx.phrasing === "way" ? variants[ctx.another ? 1 : 0] : pick("gem", key, variants));
  return { say: flat(b), show: shown(ex, g, p), beats: b };
}
/** "Now you know three ways to spell /ae/." (from two ways on) */
function waysLine(p: PhonemeId, n?: number): Say[] {
  return n && n >= 2 ? [...L(`t_ways_${Math.min(10, n)}`), G(100), S(p), { gap: 1 } as Say] : [];
}

/** "Different spellings of /ae/… but it's the same sound!" then one example word for each spelling the child knows. */
export function sameSound(p: PhonemeId, knownGems: Pick<Gem, "g" | "p">[], ctx: { met?: Set<string> } = {}): Explanation {
  // one example word per spelling (a spelling with no word yet is left out, and <x>, which spells two sounds)
  const pairs = knownGems.filter((gm) => gm.g !== "x").map((gm) => ({ g: gm.g, w: examplesFor(gm.g, p, { n: 1, met: ctx.met })[0] })).filter((x) => !!x.w);
  const ex = pairs.map((x) => x.w);
  const say = pick("same", p, [
    [...L("t_diff_spellings_of"), G(80), S(p), G(80), ...L("t_same_sound"), G(450), ...list(ex)],
    [...L("t_lets_remember"), G(100), S(p), G(350), ...list(ex), G(450), ...L("t_diff_spellings_of"), G(80), S(p), G(80), ...L("t_same_sound")],
  ]);
  return { say, show: pairs.map(({ g, w }) => ({ word: w, highlight: { g, p } })) };
}

/** One spelling, different sounds (Extended Code): "The same spelling can sometimes be /o/ and sometimes /oe/." */
export function sameSpelling(g: string, a: PhonemeId, b: PhonemeId, ctx: { met?: Set<string> } = {}): Explanation {
  const wa = examplesFor(g, a, { n: 1, met: ctx.met });
  const wb = examplesFor(g, b, { n: 1, met: ctx.met });
  // "The same spelling can sometimes be /th/ in moth, and sometimes /dh/ in this."
  const inW = (w: Word[]) => (w.length ? [G(60), ...L("t_in"), G(40), W(w[0])] : []);
  const say = [...L("t_same_spelling_sometimes"), G(80), S(a), ...inW(wa), G(350), ...L("t_and_sometimes"), G(80), S(b), ...inW(wb)];
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
  // (wf_new_gem_here: the same words re-recorded in Sensei's British voice; t_new_gem_here came out American)
  const beats: Beat[] = [{ cue: "here", say: HAS.has("wf_new_gem_here") ? L("wf_new_gem_here") : L("t_new_gem_here"), gem: `${gem.g}>${gem.p}`, p: gem.p }, ...(e.beats ?? [])];
  return { say: flat(beats), show: e.show, beats };
}

// ---------------------------------------------------------------- trips to the World Flower (src/scenes/Tree.tsx, Intros.tsx)
// What Sensei says when the game brings the child to the World Flower (engine/gems.ts FlowerVisit says when). Each
// script is a list of beats; the scene shows the matching picture for each cue while its speech plays.

/** A gem won in its Gem Trial: the victory sequence. Cues: won → (the gem flies home, music only) → here, explain,
 *  ways → petal-home (its petal is complete and flies back onto the World Flower) → flower-done. */
export function victoryScript(gem: Pick<Gem, "g" | "p">, ctx: { met?: Set<string>; knownWays: number; petalDone: boolean; flowerDone: boolean }): Beat[] {
  const key = `${gem.g}>${gem.p}`;
  return [
    { cue: "won", say: L("trial_win"), gem: key, p: gem.p },
    ...(newGem(gem, ctx).beats ?? []),
    ...(ctx.petalDone ? [{ cue: "petal-home", say: L("petal_complete"), p: gem.p, gem: key }] : []),
    ...(ctx.flowerDone ? [{ cue: "flower-done", say: L("flower_complete") }] : []),
  ];
}

/** Spellings met for the first time in a level: each gem appears in its petal. A new sound is announced as a sound
 *  ("You found a new sound!"); a new spelling of a known sound as a gem in that sound's petal, then "another way to
 *  spell", the number of ways, and, when the spelling also spells a sound the child knows, "the same spelling can
 *  sometimes be…". Cues per gem: found → explain → ways → same-spelling. Several gems in one level get the short
 *  form after the first, so the trip stays short. */
export function foundScript(
  gems: { gem: Pick<Gem, "g" | "p">; newSound: boolean; knownWays: number; others: PhonemeId[] }[],
  ctx: { met?: Set<string> } = {},
): Beat[] {
  const out: Beat[] = [];
  gems.forEach(({ gem, newSound, knownWays, others }, i) => {
    const key = `${gem.g}>${gem.p}`;
    // a new spelling of a sound the child knows: "Ooh! You already know this sound. Here's another way to spell it!
    // Same sound, different spelling." (one whole recording), then "This is the way we spell /ae/ in tray…"
    const lead = newSound ? (i === 0 ? L("wf_found_sound") : []) : HAS.has("same_sound_new") ? L("same_sound_new") : [...L("wf_found_gem"), G(100), S(gem.p)];
    if (lead.length) out.push({ cue: "found", say: lead, gem: key, p: gem.p });
    if (i > 0 && gems.length > 2) {
      // the third gem of a level and on: just "This is the way we spell /h/ in hat."
      const ex = canon(`gem:${key}`) ?? examplesFor(gem.g, gem.p, { n: 1, met: ctx.met });
      const k = safe(key);
      out.push({ cue: "explain", say: [...L("t_way_we_spell"), G(100), S(gem.p), G(80), ...(ex[0] ? clip(`tg_${k}_in`, [...L("t_in"), G(60), W(ex[0])]) : [])], show: shown(ex.slice(0, 1), gem.g, gem.p), gem: key, p: gem.p });
      return;
    }
    const e = introGem(gem, { met: ctx.met, knownWays, phrasing: "way" });
    out.push(...(e.beats ?? []));
    for (const o of others) out.push({ ...twoSounds(gem.g, o, gem.p, ctx), cue: "same-spelling", gem: key });
  });
  return out;
}

/** The start of a new land. Cues: visit (the flower) → petals (every shining petal lights in turn) → recap (one
 *  sound re-explained, rotating between "same sound, different spellings", "do you remember this one?" and "the same
 *  spelling can sometimes be…", always with fresh examples) → hidden (the petals still in the mist here shimmer). */
export function worldScript(
  ctx: { multi: { p: PhonemeId; gems: Pick<Gem, "g" | "p">[] }[]; recent: PhonemeId[]; twoSounds: { g: string; a: PhonemeId; b: PhonemeId }[]; met?: Set<string>; hidden: number },
): Beat[] {
  const recaps: (() => Beat | null)[] = [];
  if (ctx.multi.length) {
    recaps.push(() => {
      const m = pick("world-same", "any", ctx.multi);
      const e = sameSound(m.p, m.gems, { met: ctx.met });
      return { cue: "recap", say: e.say, show: e.show, p: m.p };
    });
  }
  if (ctx.recent.length) {
    recaps.push(() => {
      const p = pick("world-recent", "any", ctx.recent);
      const e = introPetal(p, { met: ctx.met });
      return { cue: "recap", say: [...L("t_remember_this"), G(350), ...e.say], show: e.show, p };
    });
  }
  if (ctx.twoSounds.length) {
    recaps.push(() => {
      const t = pick("world-two", "any", ctx.twoSounds);
      return { ...twoSounds(t.g, t.a, t.b, { met: ctx.met }), cue: "recap" };
    });
  }
  const recap = recaps.length ? pick("world-recap", "any", recaps)() : null;
  return [
    { cue: "visit", say: revisitIntro("world") },
    { cue: "petals", say: L("wf_petals_you_know") },
    ...(recap ? [recap] : []),
    ...(ctx.hidden ? [{ cue: "hidden", say: L("wf_world_new") }] : []),
  ];
}

/** One spelling, two sounds the child knows, in turn: "The same spelling can sometimes be /th/, thin, and sometimes
 *  /dh/, this." or, with a word on screen, "This can be /th/, but in this word, it's /dh/. This." */
function twoSounds(g: string, a: PhonemeId, b: PhonemeId, ctx: { met?: Set<string> }): Beat {
  const w = examplesFor(g, b, { n: 1, met: ctx.met })[0];
  const same = sameSpelling(g, a, b, ctx);
  const variants: Beat[] = [{ cue: "", say: same.say, show: same.show, p: b }];
  if (w) variants.push({ cue: "", say: [...canBe(a, b), G(300), W(w)], show: shown([w], g, b), p: b });
  return pick("two-sounds", `${g}:${a}:${b}`, variants);
}

/** Back from a practice dojo: the gem's energy fills up. Cues: practised (the bar fills) → ready (it glows). */
export function practisedScript(gem: Pick<Gem, "g" | "p">, ready: boolean): Beat[] {
  const key = `${gem.g}>${gem.p}`;
  return [{ cue: "practised", say: L("wf_practised"), gem: key, p: gem.p }, ...(ready ? [{ cue: "ready", say: L("gem_ready"), gem: key, p: gem.p }] : [])];
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
