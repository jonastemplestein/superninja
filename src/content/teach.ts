// Teacher language for sounds (petals) and spellings (gems): spoken explanations with examples, built from short
// Sensei clips (lines.ts, "Teacher language" block) + pure sounds + word clips. The wording follows the official
// Sounds~Write scripts (assets-src/sw-sources/research/sections/teacher-language.md):
//   "This is the way we spell /k/ in this word." · "It's two letters, but it's one sound." · "This is another way to
//   spell the sound /f/." · "different spellings of /ae/, not different /ae/ sounds" · "This can be /a/, but in this
//   word, it's /ae/." · "This is /X/. Say /X/ here." · "Say the sounds and listen for the word."
// Never: letter names, letters that "say" or "make" sounds, rules, "magic e", "silent letters", "tricky words".
// Each moment has several phrasings, rotated per sound/spelling, so coming back to the World Flower never sounds canned.
// A sound said as a sound is a petal ({ sound, show: "petal" }, docs/SOUND_DISPLAY.md). The official "This is the way
// we spell /m/ in mat." is said with the sound ending its sentence once its recording exists (docs/TEACHER_SCRIPT.md
// T11): "Here's the sound… /m/ · This is the way we spell it in mat." (tv_here_sound + tg_<g>_<p>_way).
import type { Say, SoundAt } from "../engine/audio";
import { WORDS, WORD_BY_TEXT, PHONEMES, type PhonemeId, type Word } from "./phonics";
import { PETALS, type Gem } from "./flower";
import { LINES } from "./lines";
import { PIC_NAMES } from "./pic-names";
import { TEACH_EXAMPLES } from "./teach-lines.gen";
import { freshWords } from "./narrative";

const HAS = new Set(LINES.map((l) => l.id));
/** "This is a spelling of the sound..." (wf_spelling_of: re-recorded, the older take ends in a stray /k/) */
const SPELLING_OF = HAS.has("wf_spelling_of") ? "wf_spelling_of" : "t_spelling_of";
/** a clip, or nothing if it hasn't been recorded yet (so new wording can ship before its audio) */
const L = (id: string): Say[] => (HAS.has(id) ? [{ line: id }] : []);
const S = (p: PhonemeId, at?: SoundAt): Say => ({ sound: p, show: "petal", ...(at ? { at } : {}) });
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
/** "You can hear it in bat, bag and bin." (tp_<p>_hear, one recording), with a spelling `g`: only when every one of
 *  its example words spells the sound with `g` (TEACHER_SCRIPT §3.26: tp_k_hear has "king" and "duck", which aren't
 *  spelt with < c >), else the sentence spliced from words that are. */
export function hearIn(p: PhonemeId, g?: string | null, met?: Set<string>): { say: Say[]; words: Word[] } {
  const ex = canon(`petal:${p}`) ?? soundExamples(p, { n: 3, met });
  const spelt = (w: Word) => w.segs.some((s) => s.p === p && s.g === g);
  if (!g || ex.every(spelt)) return { say: clip(`tp_${p}_hear`, [...L("t_you_can_hear_it_in"), G(120), ...list(ex)]), words: ex };
  const own = examplesFor(g, p, { n: 3, met });
  return own.length ? { say: [...L("t_you_can_hear_it_in"), G(120), ...list(own)], words: own } : { say: [], words: [] };
}

/** Introduce a sound (a petal). `g`: the spelling being taught with it (its examples must use it). */
export function introPetal(p: PhonemeId, ctx: { met?: Set<string>; g?: string | null } = {}): Explanation {
  const h = hearIn(p, ctx.g, ctx.met);
  const ex = h.words.length ? h.words : canon(`petal:${p}`) ?? soundExamples(p, { n: 3, met: ctx.met });
  const hear = h.say;
  const words = clip(`tp_${p}_list`, list(ex));
  const say = pick("petal", p, [
    [...L("t_petal_is"), G(120), S(p), G(450), ...hear, G(400), ...L("t_now_you_say_it"), G(900), S(p)],
    [...L("t_listen_can_you_hear"), G(100), S(p), G(80), ...L("t_in_these_words"), G(350), ...words, G(400), ...L("t_they_all_have"), G(100), S(p)],
    [...L("t_this_is_sound"), G(120), S(p), G(300), ...L("t_everyone_say"), G(250), S(p), G(600), ...hear],
  ]);
  return { say, show: shown(ex, null, p) };
}

/** "This is the way we spell /ae/ in rain." as the official formula with the sound ending its sentence (TEACHER_SCRIPT
 *  T11): `lead` ("Here's the sound…", or "And here's another new sound…") · /ae/ · "This is the way we spell it in
 *  rain." (tg_<g>_<p>_way, one recording per spelling). Until those clips exist, or when the recorded example word is
 *  already in use on this screen, the older splice: "This is the way we spell… /ae/ …in rain." */
function wayWeSpell(g: string, p: PhonemeId, first: Word, o: { lead?: string; used?: ReadonlySet<string>; at?: SoundAt } = {}): { say: Say[]; word: Word } {
  const k = safe(`${g}>${p}`);
  const lead = o.lead ?? "tv_here_sound";
  // the recorded clips say the spelling's canonical first example; another word is spliced
  const baked = canon(`gem:${g}>${p}`)?.[0] ?? first;
  if (HAS.has(`tg_${k}_way`) && HAS.has(lead) && !o.used?.has(baked.text)) return { say: [...L(lead), G(100), S(p, o.at), G(400), ...L(`tg_${k}_way`)], word: baked };
  const w = o.used?.has(first.text) ? freshWords(examplesFor(g, p, { n: 6 }), o.used)[0] ?? first : first;
  return { say: [...L("t_way_we_spell"), G(100), S(p, o.at), G(80), ...(w === baked ? clip(`tg_${k}_in`, [...L("t_in"), G(60), W(w)]) : [...L("t_in"), G(60), W(w)])], word: w };
}
/** "We see this spelling in man and map." (tg_<g>_<p>_see), from words not yet used on this screen (or kept for a
 *  later gem's example: `avoid`). */
function weSeeIt(g: string, p: PhonemeId, rest: Word[], avoid?: ReadonlySet<string>): { say: Say[]; words: Word[] } {
  if (!rest.length) return { say: [], words: [] };
  if (!avoid || rest.every((w) => !avoid.has(w.text))) return { say: clip(`tg_${safe(`${g}>${p}`)}_see`, [...L("t_we_see_it_in"), G(100), ...list(rest)]), words: rest };
  const fresh = freshWords(examplesFor(g, p, { n: 6 }), avoid, 2);
  return { say: fresh.length ? [...L("t_we_see_it_in"), G(100), ...list(fresh)] : [], words: fresh };
}

/** Introduce a spelling (a gem). `knownWays`: how many spellings of this sound the child now knows (for "Now you know
 *  three ways to spell /ae/"). `another`: the child already knew another spelling of this sound. `facts: false`: no
 *  letters line, no double-letter note and no "Say that sound with me!" (a trip right after the teach moment,
 *  SCRIPT_FIXES C3). `see: false`: no "We see this spelling in…" (a trip before land 2: the child can't read yet,
 *  TEACHER_SCRIPT T21). `used`: example words already said on this screen (they aren't said again; the words said here
 *  are added). */
export function introGem(gem: Pick<Gem, "g" | "p">, ctx: { met?: Set<string>; knownWays?: number; another?: boolean; phrasing?: "way"; facts?: boolean; see?: boolean; used?: Set<string>; avoid?: ReadonlySet<string>; lead?: string } = {}): Explanation {
  const { g, p } = gem;
  const key = `${g}>${p}`;
  const k = safe(key);
  const ex = canon(`gem:${key}`) ?? examplesFor(g, p, { n: 3, met: ctx.met });
  const [first, ...rest] = ex;
  const facts: Say[][] = ctx.facts === false ? [] : [lettersLine(gem), doubleNote(g)].filter((f) => f.length);
  // a long spelling for one sound: the child says the sound while looking at it ("Say that sound with me!"),
  // the Sounds~Write "This is /ie/. Say /ie/ here." routine (NARRATIVE_AUDIT F21)
  if (ctx.facts !== false && letters(g) >= 3 && !(g === "x" && p === "ks")) facts.push([...L("t_everyone_say"), G(250), S(p)]);
  const factsSay = facts.length ? [G(350), ...facts.flatMap((f, i) => (i ? [G(250), ...f] : f))] : [];
  const ways = waysLine(p, ctx.knownWays);
  const beats = (main: Say[], words: Word[] = ex): Beat[] => [{ cue: "explain", say: main, show: shown(words, g, p), gem: key, p }, ...(ways.length ? [{ cue: "ways", say: ways, gem: key, p }] : [])];
  if (!first) {
    // no example words yet (a spelling taught later): the spelling and its facts only
    const b = beats([...L(SPELLING_OF), G(100), S(p), ...factsSay]);
    return { say: flat(b), show: [], beats: b };
  }
  const way = wayWeSpell(g, p, first, { used: ctx.used, lead: ctx.lead });
  const seen = ctx.see === false ? { say: [], words: [] } : weSeeIt(g, p, rest.filter((w) => w !== way.word), ctx.used || ctx.avoid ? new Set([...(ctx.used ?? []), ...(ctx.avoid ?? []), way.word.text]) : undefined);
  const see = seen.say;
  const variants: Say[][] = [
    // "Here's the sound… /ae/ · This is the way we spell it in rain." + facts + "We see this spelling in play and paint."
    [...way.say, ...factsSay, ...(see.length ? [G(400), ...see] : [])],
    // "This is a spelling of the sound /ae/." + facts + "…like in rain, play and paint."
    [...L(SPELLING_OF), G(100), S(p), ...factsSay, G(300), ...clip(`tg_${k}_like`, [...L("t_like_in"), G(80), ...list(ex)])],
  ];
  const wayVariant = variants[0];
  // a spelling of a sound the child already knows: "This is another way to spell the sound /ae/" comes first
  if (ctx.another) variants.unshift([...L("t_another_way"), G(100), S(p), ...factsSay, G(300), ...clip(`tg_${k}_like`, [...L("t_like_in"), G(80), ...list(ex)])]);
  // `phrasing: "way"`: always "This is the way we spell /ae/ in rain…" (when the line before has already said the rest)
  const chosen = ctx.phrasing === "way" ? variants[ctx.another ? 1 : 0] : pick("gem", key, variants);
  // the words said (and shown) here: the "way" variant's own; the others list them all
  const said = chosen === wayVariant ? [way.word, ...seen.words] : ex;
  const b = beats(chosen, said);
  if (ctx.used) for (const w of said) ctx.used.add(w.text);
  return { say: flat(b), show: shown(said, g, p), beats: b };
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

/** One spelling, different sounds (Extended Code): "The same spelling can sometimes be /o/ and sometimes /oe/." Both
 *  sounds are petals (a contrast pair). For < th > as /th/ then /dh/, five clips once `st_th_moth_sometimes` is recorded
 *  (SCRIPT_FIXES C20): "The same spelling can sometimes be… /th/ …in moth, and sometimes… /dh/ …in this." */
export function sameSpelling(g: string, a: PhonemeId, b: PhonemeId, ctx: { met?: Set<string>; at?: SoundAt } = {}): Explanation {
  if (g === "th" && a === "th" && b === "dh" && HAS.has("st_th_moth_sometimes") && HAS.has("tg_th_dh_in")) {
    const [moth, thisW] = [WORD_BY_TEXT["moth"], WORD_BY_TEXT["this"]];
    const say = [...L("t_same_spelling_sometimes"), G(80), S(a, ctx.at), G(60), ...L("st_th_moth_sometimes"), G(80), S(b, ctx.at), G(60), ...L("tg_th_dh_in")];
    return { say, show: [...(moth ? shown([moth], g, a) : []), ...(thisW ? shown([thisW], g, b) : [])] };
  }
  const wa = examplesFor(g, a, { n: 1, met: ctx.met });
  const wb = examplesFor(g, b, { n: 1, met: ctx.met });
  // "The same spelling can sometimes be /th/ in moth, and sometimes /dh/ in this."
  const inW = (w: Word[]) => (w.length ? [G(60), ...L("t_in"), G(40), W(w[0])] : []);
  const say = [...L("t_same_spelling_sometimes"), G(80), S(a, ctx.at), ...inW(wa), G(350), ...L("t_and_sometimes"), G(80), S(b, ctx.at), ...inW(wb)];
  return { say, show: [...shown(wa, g, a), ...shown(wb, g, b)] };
}

/** "This can be /a/, but in this word, it's /ae/." (a spelling read with its other sound; both sounds petals) */
export function canBe(a: PhonemeId, b: PhonemeId, at?: SoundAt): Say[] {
  return [...L("t_this_can_be"), G(80), S(a, at), G(80), ...L("t_but_in_this_word"), G(80), S(b, at)];
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
 *  form after the first, so the trip stays short.
 *
 *  The trip shows and counts; it doesn't re-teach (SCRIPT_FIXES C3, TEACHER_SCRIPT §3.14):
 *  - `justTaught`: the gem keys ("ai>ae") whose teach moment the child has just heard (the level that sent them here
 *    taught them). Those get no letters line, no double-letter note and no "Say that sound with me!"; a known sound's
 *    just-taught gem is "You found a new gem! It's a spelling of the sound… /ae/ …like in tray, day and say.", never
 *    `same_sound_new` and never a second "This is the way we spell…".
 *  - Two or more new sounds: "You found some new sounds!…" leads; the second new sound is "And here's another new
 *    sound… /s/"; later ones have no lead of their own.
 *  - `world`: before land 2, "We see this spelling in…" is left out (the child can't read yet, T21).
 *  - `used`: example words already said on this trip (shared with the scene); no word is said for two spellings. */
export function foundScript(
  gems: { gem: Pick<Gem, "g" | "p">; newSound: boolean; knownWays: number; others: PhonemeId[] }[],
  ctx: { met?: Set<string>; justTaught?: ReadonlySet<string>; used?: Set<string>; world?: number } = {},
): Beat[] {
  const out: Beat[] = [];
  const used = ctx.used ?? new Set<string>();
  const see = ctx.world === undefined || ctx.world >= 2;
  const newSounds = gems.filter((x) => x.newSound).length;
  // each gem's recorded example ("…in bag.") is kept for it: an earlier gem's list doesn't take it
  const clipWord = gems.map(({ gem }) => (canon(`gem:${gem.g}>${gem.p}`) ?? examplesFor(gem.g, gem.p, { n: 1, met: ctx.met }))[0]?.text);
  let nthNew = 0;
  gems.forEach(({ gem, newSound, knownWays, others }, i) => {
    const key = `${gem.g}>${gem.p}`;
    const just = !!ctx.justTaught?.has(key);
    const k = safe(key);
    const ex = canon(`gem:${key}`) ?? examplesFor(gem.g, gem.p, { n: 3, met: ctx.met });
    const nth = newSound ? nthNew++ : -1;
    // the lead: the first new sound's "You found a new sound!" (or "…some new sounds!"); the second new sound's
    // "And here's another new sound…" (said with its sound, in the explanation below, once recorded); a known
    // sound's gem: "Ooh! You already know this sound…" (not just taught) or "You found a new gem!… /ae/" (just taught)
    const splitLead = nth === 1 && HAS.has("tv_another_sound") ? "tv_another_sound" : undefined;
    let lead: Say[] = [];
    if (newSound) {
      if (nth === 0) lead = newSounds >= 2 && HAS.has("st_found_new_sounds") ? L("st_found_new_sounds") : L("wf_found_sound");
      else if (nth === 1 && !splitLead) lead = L("st_another_new_sound");
    } else if (just || !HAS.has("same_sound_new")) lead = [...L("wf_found_gem"), G(100), S(gem.p)];
    else lead = L("same_sound_new");
    if (lead.length) out.push({ cue: "found", say: lead, gem: key, p: gem.p });
    if (!newSound && just) {
      // "…like in tray, day and say." then "Now you know two ways to spell… /ae/"
      const like = ex.some((w) => used.has(w.text)) ? freshWords(examplesFor(gem.g, gem.p, { n: 5, met: ctx.met }), used, 3) : ex;
      const likeSay = like === ex ? clip(`tg_${k}_like`, [...L("t_like_in"), G(80), ...list(ex)]) : like.length ? [...L("t_like_in"), G(80), ...list(like)] : [];
      like.forEach((w) => used.add(w.text));
      if (likeSay.length) out.push({ cue: "explain", say: likeSay, show: shown(like, gem.g, gem.p), gem: key, p: gem.p });
      const ways = waysLine(gem.p, knownWays);
      if (ways.length) out.push({ cue: "ways", say: ways, gem: key, p: gem.p });
    } else if (i > 0 && gems.length > 2) {
      // the third gem of a level and on (and the second of three or more): just "Here's the sound… /h/ · This is the
      // way we spell it in hat."
      const way = ex[0] ? wayWeSpell(gem.g, gem.p, ex[0], { used, lead: splitLead }) : null;
      if (way) used.add(way.word.text);
      out.push({ cue: "explain", say: way?.say ?? [...L(SPELLING_OF), G(100), S(gem.p)], show: shown(way ? [way.word] : [], gem.g, gem.p), gem: key, p: gem.p });
    } else {
      const avoid = new Set(clipWord.filter((w, j): w is string => !!w && j > i));
      const e = introGem(gem, { met: ctx.met, knownWays, phrasing: "way", facts: !just, see, used, avoid, lead: splitLead });
      out.push(...(e.beats ?? []));
    }
    for (const o of others) out.push({ ...twoSounds(gem.g, o, gem.p, ctx), cue: "same-spelling", gem: key });
  });
  return out;
}

/** The start of a new land. Cues: visit (the flower) → petals (every shining petal lights in turn) → recap (one
 *  sound re-explained, rotating between "same sound, different spellings", "do you remember this one?" and "the same
 *  spelling can sometimes be…", always with fresh examples) → hidden (the petals still in the mist here shimmer). */
export function worldScript(
  ctx: { multi: { p: PhonemeId; gems: Pick<Gem, "g" | "p">[] }[]; recent: PhonemeId[]; twoSounds: { g: string; a: PhonemeId; b: PhonemeId }[]; met?: Set<string>; hidden: number; petalTap?: boolean },
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
      // TEACHER_SCRIPT §3.25: "Here's a sound you learnt… /o/ · You can hear it in pot, top and mop." (a statement, not
      // "Do you remember this one?"); the older rotation until tv_flower_recap is recorded
      if (HAS.has("tv_flower_recap")) {
        const h = hearIn(p, null, ctx.met);
        return { cue: "recap", say: [...L("tv_flower_recap"), G(100), S(p), G(450), ...h.say], show: shown(h.words, null, p), p };
      }
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
  // `petalTap`: the scene waits for the child to tap the recap's petal and say the sound ("Tap the petal, and say it
  // with me.", the `petal-tap` cue), TEACHER_SCRIPT §3.25
  const tap = ctx.petalTap && recap?.p && recap.say[0] && "line" in recap.say[0] && recap.say[0].line === "tv_flower_recap" && HAS.has("tv_petal_say");
  return [
    { cue: "visit", say: revisitIntro("world") },
    { cue: "petals", say: L("wf_petals_you_know") },
    ...(recap ? [recap] : []),
    ...(tap ? [{ cue: "petal-tap", say: L("tv_petal_say"), p: recap!.p }] : []),
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
