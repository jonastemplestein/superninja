// Speech templates (docs/SPEECH_TEMPLATES.md): sentences with slots, recorded so that Sensei sounds like one teacher
// talking, not a quiz machine. "Say mat slowly." instead of "Say this word slowly… mat"; "Say the sound… /a/" instead
// of "Say this sound: a" (Jonas, 27 Sep).
//
// A template is one sentence, or a short run of them, with slots in braces:
//   "Say {word} slowly."                          a TEXT slot: said inside one recorded take, one take per value
//   "Say the sound {sound}."                      a CLIP slot: the checked pure sound from /a/p/, never synthesised
//   "Let's listen to {word} again. {word~slow}"   a clip made from a text slot's value (the slow way, /a/x/)
// parse() cuts the text into speech pieces (one TTS take each, /a/t/<template>/<piece>-<key>.mp3), clip slots, and the
// designed joins between them. The rules that keep it natural are check()'s (§1.3, R1–R10).
//
// Pure data and pure functions: no DOM, no audio. The game resolves templates through src/engine/speech.ts, the
// generator is scripts/gen-templates.ts, and transcripts decode clip ids with src/content/templates-decode.ts.
//
// This file holds the first 16 templates: the inventory's top 12 rows (docs/speech-templates/inventory.md §1), with the
// companions rows 1 and 2 need, plus Jonas's two examples. The rest of the design's 122 go in the same way.
import { PHONEMES, type PhonemeId, type Seg } from "./phonics";
import { LINES, RETIRED_LINES } from "./lines";

// ---------------------------------------------------------------- types
/** Text slots are said inside a take; clip slots are library clips; a key slot is never said (it picks a member). */
export type SlotType =
  | "word" | "picture" | "pos" | "name" | "n" | "title" | "list" // text slots
  | "sound" | "sounds" //                                              clip slots (the checked pure sounds)
  | "spelling"; //                                                      key slot: a spelling said aloud would be letter names (R8)
/** `~slow` the slow way (/a/x/), `~first` the held first sound (/a/o/), `~bare` the word clip alone between sentences
 *  (/a/w/), `~fast` the word clip as a performance, `~sounds` the word's pure sounds one by one, `~a` the picture's noun
 *  phrase ("a sock", "some jam", "the sun"): still a text slot. */
export type Mod = "slow" | "first" | "bare" | "fast" | "sounds" | "a";
export type ClipKind = "sound" | "sounds" | "slow" | "first" | "bare" | "fast";
/** Designed pauses, timed from the end of one clip's speech to the start of the next's (speech.ts JOIN_MS). */
export type Join = "breath" | "sentence";
/** Where a clip slot sits: at a sentence end after a lead-in, at the end of a phrase that carries on, or alone. */
export type ClipAt = "end" | "phrase" | "alone";
/** whole: values inside the take · sound: speech pieces around a pure sound or a demonstration · sequence: whole
 *  sentences, then clips standing alone (docs/SPEECH_TEMPLATES.md §2). Computed from the text, never declared. */
export type Tier = "whole" | "sound" | "sequence";
export type Purpose = "instruction" | "question" | "explanation" | "demo" | "correction" | "hint" | "praise" | "transition";
/** The content set that lists a template's members (members()). */
export type Domain = "words" | "build-items" | "positions" | "swap-steps" | "pictures" | "pictures-np" | "spellings" | "fixed";

export type Piece =
  /** one recorded take. `n`: its number in speaking order (the file's piece number). `lead`: a lead-in recorded
   *  suspended ("Say the sound..."). `cont`: a continuation after a clip ("...in mat.") */
  | { kind: "speech"; n: number; text: string; slots: string[]; lead: boolean; cont: boolean }
  | { kind: "clip"; slot: string; clip: ClipKind; at: ClipAt; after: string }
  | { kind: "join"; join: Join };

export type SlotValue = string | number | readonly string[];
export type Values = Readonly<Record<string, SlotValue | undefined>>;

/** What a template says, part by part. The library kinds are audio.ts's own `Say` kinds; `tpl` and `join` are the two
 *  it gains (docs/fix-requests.md, "Speech templates"). */
export type Part =
  | { tpl: string; piece: number; key: string; text: string; hide?: string[] }
  | { join: Join }
  | { line: string }
  | { word: string }
  | { stretch: string }
  | { onset: string }
  | { sound: PhonemeId; show?: "petal" | "tile" | "hidden" }
  | { sounds: Seg[]; show?: "tile" | "hidden" };
/** A fallback's part: library parts and joins, and a line given as candidates (the first recorded one plays; if none
 *  is, the part is dropped). Never a template piece. */
export type FallbackPart = Exclude<Part, { tpl: string }> | { lines: readonly string[] };
export interface FallbackCtx {
  /** FS1 (docs/DECISIONS.md, 27 Sep): false in a spelling moment before a second miss: the plain word, not the gapped
   *  slow word, which would do the segmenting for the child */
  slow: boolean;
  /** is this line recorded? */
  has: (line: string) => boolean;
  /** a word's sounds, for a fallback's read-back */
  segs: (word: string) => Seg[] | undefined;
}

export interface TemplateDef {
  id: string;
  text: string;
  /** slot name → type. Clip modifiers ({word~slow}) need no entry of their own. */
  slots: Readonly<Record<string, SlotType>>;
  purpose: Purpose;
  who: "sensei";
  domain: Domain;
  /** hide word and picture values in the grown-ups' caption until revealed (a dictation word written out gives the
   *  spelling away) */
  hide?: boolean;
  /** Played instead when a piece isn't recorded yet (or audio.ts can't play templates yet): today's composition,
   *  built only from recorded lines and library clips. A word is never joined into a sentence by a template. */
  fallback: (v: Values, o: FallbackCtx) => FallbackPart[];
  /** inventory rows (docs/speech-templates/inventory.md) */
  inventory: readonly number[];
  /** the compositions and lines it replaces */
  replaces: readonly string[];
  /** the FIX_PLAN §2 lanes that own its call sites */
  lane: string;
}

// ---------------------------------------------------------------- helpers
/** A value as a file-name part: lowercase, anything else "_" (as audio.ts's urls). */
export const fid = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_");
const LINE_IDS = new Set(LINES.map((l) => l.id));
/** Is a line in the game's LINES (the scenes' own "recorded" test)? */
export const lineRecorded = (id: string) => LINE_IDS.has(id);
/** Is a line retired on the teacher-voice paths (lines.ts RETIRED_LINES)? A fallback prefers a line that isn't. */
export const lineRetired = (id: string) => id in RETIRED_LINES;

/** R10: words TTS says in a weak form or reads the wrong way unless they are quoted ("Say 'at' slowly.", not
 *  "Say /ət/ slowly."), and homographs (live, read). Every clip with one is judged, not sampled. */
export const QUOTED_WORDS: ReadonlySet<string> = new Set([
  ..."a an am as at be by do go he i if in is it me my no of on or so to up us we".split(" "),
  ..."read live tear use dove wind bow row lead close wound does sow".split(" "),
]);
export const needsQuote = (w: string) => QUOTED_WORDS.has(w.toLowerCase());

/** R9: a picture's noun phrase ("a sock", "some jam", "the sun", "snow"), for {picture~a}. The one checked source today
 *  is the recorded `fm_name_<picture>` family ("This is some jam."); src/content/nouns.ts replaces it (fix request). A
 *  picture with no noun phrase never fills a noun-phrase slot: "This is a milk." and "This is a swim." are never made. */
const NOUNS: ReadonlyMap<string, string> = new Map(
  LINES.flatMap((l) => {
    const m = l.id.startsWith("fm_name_") ? l.text.match(/^This is (.+)\.$/) : null;
    return m ? [[l.id.slice("fm_name_".length), m[1]] as const] : [];
  }),
);
export const nounPhrase = (picture: string): string | undefined => NOUNS.get(fid(picture));

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const SLOT = /\{([a-z][a-z0-9]*)(?:~(slow|first|bare|fast|sounds|a))?\}/g;
const wordsIn = (s: string) => s.replace(/\{[^}]+\}/g, "x").split(/[\s—]+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
const clipKind = (type: SlotType | undefined, mod: Mod | undefined): ClipKind | null =>
  mod && mod !== "a" ? mod : type === "sound" ? "sound" : type === "sounds" ? "sounds" : null;

// ---------------------------------------------------------------- parsing
const PARSED = new WeakMap<Pick<TemplateDef, "text" | "slots">, Piece[]>();
/** Cut a template's text into speech pieces, clip slots and joins (§1.2). */
export function parse(t: Pick<TemplateDef, "text" | "slots">): Piece[] {
  const hit = PARSED.get(t);
  if (hit) return hit;
  const out: Piece[] = [];
  let buf = "";
  let slots: string[] = [];
  let cont = false;
  let n = 0;
  const flush = (lead: boolean) => {
    const text = buf.trim();
    if (text) out.push({ kind: "speech", n: n++, text, slots, lead, cont });
    buf = "";
    slots = [];
    cont = false;
  };
  let last = 0;
  for (const m of t.text.matchAll(SLOT)) {
    buf += t.text.slice(last, m.index);
    last = m.index! + m[0].length;
    const name = m[1];
    const mod = m[2] as Mod | undefined;
    const kind = clipKind(t.slots[name], mod);
    if (!kind) {
      buf += m[0];
      slots.push(name);
      continue;
    }
    // the speech before a clip slot is a lead-in (a breath) unless it ends a sentence (the clip then stands alone)
    const before = buf.trim();
    const alone = !before || (/[.?!]$/.test(before) && !/(\.\.\.|…)$/.test(before));
    flush(!alone);
    if (before) out.push({ kind: "join", join: alone ? "sentence" : "breath" });
    const rest = t.text.slice(last);
    const endM = rest.match(/^\s*([.?!]+)/);
    const commaM = rest.match(/^\s*,/);
    const atEnd = !rest.trim() || !!endM;
    out.push({ kind: "clip", slot: name, clip: kind, at: atEnd ? (alone ? "alone" : "end") : "phrase", after: endM ? endM[1] : commaM ? "," : "" });
    if (endM) last += endM[0].length;
    else if (commaM) last += commaM[0].length;
    if (t.text.slice(last).trim()) {
      out.push({ kind: "join", join: atEnd ? "sentence" : "breath" });
      cont = !atEnd;
    }
  }
  buf += t.text.slice(last);
  flush(false);
  PARSED.set(t, out);
  return out;
}
export const speechPieces = (t: Pick<TemplateDef, "text" | "slots">) => parse(t).filter((p): p is Extract<Piece, { kind: "speech" }> => p.kind === "speech");

/** The tier, from the text: a pure sound or a demonstration after a lead-in makes a sound template; values inside a
 *  take make a whole one; whole sentences followed by clips standing alone make a sequence. */
export function tierOf(t: Pick<TemplateDef, "text" | "slots">): Tier {
  const ps = parse(t);
  if (ps.some((p) => p.kind === "clip" && p.at !== "alone")) return "sound";
  if (ps.some((p) => p.kind === "speech" && p.slots.length)) return "whole";
  return ps.some((p) => p.kind === "clip") ? "sequence" : "whole";
}

/** The grammar (§1.3). Errors block the build (a unit test runs it over the registry); warnings are style. */
export function check(t: Pick<TemplateDef, "id" | "text" | "slots">): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const e = (s: string) => errors.push(`${t.id}: ${s}`);
  if (!/^(w|s|ws|ww|ss|n|fs)_[a-z0-9_]+$/.test(t.id)) e(`id "${t.id}" needs a slot-kind prefix (w_ s_ ws_ ww_ ss_ n_ fs_) and snake_case (SPT9)`);
  const used = new Set<string>();
  for (const m of t.text.matchAll(SLOT)) {
    const name = m[1];
    const mod = m[2] as Mod | undefined;
    const type = t.slots[name];
    used.add(name);
    if (!type) e(`slot {${name}} has no type`);
    if (type === "spelling") e(`{${name}} is a key slot: never said (a spelling said aloud is letter names, R8)`);
    if (mod === "a" && type !== "picture") e(`{${name}~a} needs a picture slot (its noun phrase, R9)`);
    if (mod && mod !== "a" && type && type !== "word" && type !== "picture") e(`{${name}~${mod}} needs a word or picture slot`);
    const before = t.text.slice(0, m.index).trimEnd();
    if (/[:—–]$/.test(before)) e(`a colon or dash before {${name}}: the carrier-plus-colon shape (R6, Jonas 27 Sep)`);
    if (clipKind(type, mod) && /\b(this|the) word(\.\.\.|…)?$/i.test(before)) e(`"…the word" before a clip slot: say the word inside the sentence instead (R6)`);
    if (type === "sound" && /\bthis sound\.*$/i.test(before)) warnings.push(`${t.id}: "this sound {${name}}": prefer "the sound {${name}}" (Jonas)`);
  }
  for (const [name, type] of Object.entries(t.slots)) if (!used.has(name) && type !== "spelling") e(`slot "${name}" is declared but never used`);
  const pieces = parse(t);
  pieces.forEach((p, i) => {
    if (p.kind !== "clip") return;
    const prev = pieces[i - 2];
    const next = pieces[i + 2];
    // R5: a word clip after a lead-in is only ever a demonstration (the slow way, the fast way, the sounds)
    if (p.clip === "bare" && p.at !== "alone") e(`{${p.slot}~bare} after a lead-in: a word the sentence talks about is said inside the take; a bare word stands alone between sentences (R5)`);
    if (i === 0 && p.at === "phrase") e(`starts on a clip that carries on in words (R4): "${t.text}"`);
    if (prev?.kind === "speech" && prev.lead && wordsIn(prev.text) < 2) e(`lead-in "${prev.text}" is under 2 words (R2)`);
    if (p.at === "phrase" && next?.kind === "speech") {
      const phrase = next.text.split(/[,.?!]/)[0];
      if (wordsIn(phrase) < 2) e(`the phrase after {${p.slot}} ("${phrase.trim()}") is under 2 words: one sound per phrase (R2, R3)`);
    }
    if (p.at === "phrase" && next?.kind === "clip") e(`two clip slots in one phrase (R3)`);
    if (p.at !== "alone") {
      // R7: a yes/no question can't end on a pure sound: its rise has nowhere to land. "…or {b}?" is an alternative.
      const at = t.text.indexOf(`{${p.slot}`);
      const sentence = t.text.slice(0, at).split(/[.!?]\s/).pop() ?? "";
      const q = /^\{[^}]+\}\s*\?/.test(t.text.slice(at));
      if (q && /^(is|are|does|do|did|can|could|will|has|have|shall)\b/i.test(sentence.trim()) && !/\bor\b[^.?!]*$/i.test(sentence)) e(`a yes/no question ends on {${p.slot}} (R7)`);
    }
  });
  return { errors, warnings };
}

/** Each slot's place (§1.4): a text slot's place in its intonation phrase (I initial, M medial, F final), a clip
 *  slot's place in the sentence (end, phrase, alone). A word at M is one the sentence talks about: the generator gives
 *  it more takes under the fluency gate. */
export function positions(t: Pick<TemplateDef, "text" | "slots">): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of parse(t)) {
    if (p.kind === "clip") out[`${p.slot}${p.clip === "sound" || p.clip === "sounds" ? "" : `~${p.clip}`}`] = p.at;
    if (p.kind !== "speech") continue;
    for (const phrase of p.text.split(/[,.?!]+/)) {
      const toks = phrase.trim().split(/\s+/).filter(Boolean);
      toks.forEach((tok, i) => {
        const m = tok.match(/\{([a-z][a-z0-9]*)(?:~a)?\}/);
        if (!m) return;
        const at = i === 0 ? "I" : i === toks.length - 1 && !p.lead ? "F" : "M";
        out[m[1]] = out[m[1]] && out[m[1]] !== at ? `${out[m[1]]}+${at}` : at;
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------- filling
/** A value as said: a number word, a list, a noun phrase, and R10's quotes round a function word or a homograph. */
function said(v: SlotValue | undefined, type: SlotType | undefined, mod: Mod | undefined): string {
  if (v === undefined) return "";
  if (type === "n") return typeof v === "number" ? (NUMBER_WORDS[v] ?? String(v)) : String(v);
  if (Array.isArray(v)) return v.length > 1 ? `${v.slice(0, -1).join(", ")} and ${v[v.length - 1]}` : (v[0] ?? "");
  const s = String(v);
  if (mod === "a") return nounPhrase(s) ?? s;
  if ((type === "word" || type === "picture") && needsQuote(s)) return `'${s}'`;
  return s;
}
/** A capital at the start and after a sentence end, past an opening quote ("'At' to 'it'."). */
const capitalise = (s: string) => s.replace(/(^|[.?!]\s+)(['"]?)([a-z])/g, (_m, a: string, q: string, c: string) => a + q + c.toUpperCase());

/** A speech piece's text as recorded and captioned: a lead-in ends on "...", a continuation starts with "...". */
export function pieceText(t: Pick<TemplateDef, "slots">, p: Extract<Piece, { kind: "speech" }>, v: Values): string {
  let text = capitalise(p.text.replace(SLOT, (_m, name: string, mod: Mod | undefined) => said(v[name], t.slots[name], mod)));
  if (p.cont) text = `...${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  if (p.lead) text = `${text.replace(/[,;]$/, "")}...`;
  return text;
}
/** A piece's member key: its own text slots' values, in order, joined by "." ("_" when it has none). */
export const pieceKey = (p: Extract<Piece, { kind: "speech" }>, v: Values): string =>
  p.slots.length ? p.slots.map((s) => fid(Array.isArray(v[s]) ? (v[s] as readonly string[]).join("_") : String(v[s] ?? ""))).join(".") : "_";
export const clipIdOf = (tpl: string, piece: number, key: string) => `t:${tpl}/${piece}-${key}`;
export const tplUrl = (tpl: string, piece: number, key: string) => `/a/t/${tpl}/${piece}-${key}.mp3`;
/** The word and picture values a piece says (hidden in captions, heard by the Whisper gate). */
const saidValues = (t: Pick<TemplateDef, "slots">, p: Extract<Piece, { kind: "speech" }>, v: Values) =>
  p.slots.filter((s) => t.slots[s] === "word" || t.slots[s] === "picture").map((s) => String(v[s] ?? ""));

/** Slots a set of values is missing (every slot is needed, a key slot too). */
export const missingSlots = (t: Pick<TemplateDef, "slots">, v: Values) => Object.keys(t.slots).filter((k) => v[k] === undefined || v[k] === "");

/** The parts of a template for these values, as designed: every speech piece is a `tpl` part. Pure and optimistic:
 *  whether each piece is recorded is speech.ts's question. `slow: false` plays the plain word for a `~slow` clip
 *  (FS1). `segs`: the word's sounds, for `~sounds`. */
export function templateParts(t: TemplateDef, v: Values, o: { slow?: boolean; segs?: (word: string) => Seg[] | undefined; reveal?: boolean } = {}): Part[] {
  const out: Part[] = [];
  for (const p of parse(t)) {
    if (p.kind === "join") out.push({ join: p.join });
    else if (p.kind === "clip") out.push(clipPart(p, v, o));
    else {
      const hide = t.hide && !o.reveal ? saidValues(t, p, v) : [];
      out.push({ tpl: t.id, piece: p.n, key: pieceKey(p, v), text: pieceText(t, p, v), ...(hide.length ? { hide } : {}) });
    }
  }
  return out;
}
function clipPart(p: Extract<Piece, { kind: "clip" }>, v: Values, o: { slow?: boolean; segs?: (word: string) => Seg[] | undefined }): Part {
  const val = String(v[p.slot] ?? "");
  if (p.clip === "sound") return { sound: val as PhonemeId, show: "petal" };
  if (p.clip === "sounds") return { sounds: o.segs?.(val) ?? [], show: "tile" };
  if (p.clip === "slow") return o.slow === false ? { word: val } : { stretch: val };
  if (p.clip === "first") return { onset: val };
  return { word: val };
}

/** The whole utterance as text. "transcript": sounds as /m/, the slow way as "mat" (slowly); "caption": hidden values
 *  and sounds as 🔊 unless revealed. Every clip's text is recoverable from this and the piece texts (§5.4). */
export function textOf(t: TemplateDef, v: Values, style: "transcript" | "caption" = "transcript", o: { reveal?: boolean; slow?: boolean; segs?: (word: string) => Seg[] | undefined } = {}): string {
  const shown = style === "transcript" || !!o.reveal;
  const parts: string[] = [];
  for (const p of parse(t)) {
    if (p.kind === "join") continue;
    if (p.kind === "speech") {
      let s = pieceText(t, p, v).replace(/^\.\.\./, "").replace(/\.\.\.$/, "");
      if (!shown && t.hide) for (const w of saidValues(t, p, v)) s = s.replace(new RegExp(`\\b${w.replace(/[^a-z0-9]/gi, "")}\\b`, "i"), "🔊");
      parts.push(s);
      continue;
    }
    const w = String(v[p.slot] ?? "");
    const slow = p.clip === "slow" && o.slow !== false;
    const label = (x: string) => `/${PHONEMES[x as PhonemeId]?.label ?? x}/`;
    parts.push(
      p.clip === "sound" ? (shown ? (style === "transcript" ? `/${w}/` : label(w)) : "🔊")
        : p.clip === "sounds" ? (shown ? (o.segs?.(w) ?? []).map((s) => (style === "transcript" ? `/${s.p}/` : label(s.p))).join(" ") : "🔊")
        : !shown ? "🔊"
        : slow ? `"${w}" (slowly)`
        : p.clip === "first" ? `"${w}" (first sound held)`
        : `"${w}"`,
    );
    if (p.after) parts[parts.length - 1] += p.after;
  }
  return parts.join(" ").replace(/\s+([,.?!])/g, "$1");
}

/** A speech piece to record: what the generator renders and the manifest lists. `text` is the TTS script and the
 *  caption (plain text: Gemini reads directions aloud). `about`: the piece talks about a word in the middle of a
 *  phrase ("Say mat slowly."), which is where TTS pauses oddly, so the fluency gate gives it more takes. `quoted`: R10
 *  values (every such clip is judged). `words`: the values the Whisper gate must hear. */
export interface RenderJob { tpl: string; piece: number; key: string; clip: string; url: string; text: string; lead: boolean; cont: boolean; about: boolean; quoted: string[]; words: string[] }
export function renderJobs(t: TemplateDef, v: Values): RenderJob[] {
  const pos = positions(t);
  return speechPieces(t).map((p) => {
    const key = pieceKey(p, v);
    const words = saidValues(t, p, v);
    return {
      tpl: t.id, piece: p.n, key, clip: clipIdOf(t.id, p.n, key), url: tplUrl(t.id, p.n, key), text: pieceText(t, p, v), lead: p.lead, cont: p.cont,
      about: p.slots.some((s) => (t.slots[s] === "word" || t.slots[s] === "picture") && /M/.test(pos[s] ?? "")),
      quoted: words.filter(needsQuote), words,
    };
  });
}

/** A piece's values from its key (the inverse of pieceKey, for transcripts): the piece's own text slots only. */
export function valuesFromKey(t: Pick<TemplateDef, "slots">, p: Extract<Piece, { kind: "speech" }>, key: string): Values | null {
  if (!p.slots.length) return key === "_" ? {} : null;
  const parts = key.split(".");
  if (parts.length !== p.slots.length) return null;
  const v: Record<string, SlotValue> = {};
  p.slots.forEach((s, i) => (v[s] = t.slots[s] === "n" && /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i].replace(/_/g, " ")));
  return v;
}

// ---------------------------------------------------------------- members: what the generator renders
/** A word in the content. `unit`: its index in the official sequence (sw.ts SW_SEQUENCE: IC1 = 0 … BR = 11, EC1 = 12). */
export interface ContentWord { text: string; unit: number; segs?: readonly { g: string; p: string }[] }
export interface TemplateContent {
  /** every word a child can meet, first unit first */
  words: readonly ContentWord[];
  /** picture words (unit-file pictures, phonics.ts pictures and the oral picture words) */
  pictures: readonly ContentWord[];
  /** Sound Swap chains, in order */
  chains: readonly { unit: number; words: readonly string[] }[];
  /** spellings with their canonical, pinned example word (teach-lines.gen.ts TEACH_EXAMPLES "gem:g>p") */
  spellings: readonly { unit: number; key: string; p: string; example: string }[];
}
export interface Member { values: Values; unit: number }
/** Every set of values a template can be said with, up to a unit (the generator's list; the build's coverage check). */
export function members(t: TemplateDef, c: TemplateContent, maxUnit = Infinity): Member[] {
  const up = <T extends { unit: number }>(xs: readonly T[]) => xs.filter((x) => x.unit <= maxUnit);
  let out: Member[] = [];
  switch (t.domain) {
    case "words":
      out = up(c.words).map((w) => ({ values: { word: w.text }, unit: w.unit }));
      break;
    case "build-items": // the item's first ask names its word (SPT5); later asks are w_next_q
      out = up(c.words).map((w) => ({ values: { pos: "first", word: w.text }, unit: w.unit }));
      break;
    case "positions":
      out = ["first", "next", "last"].map((pos) => ({ values: { pos }, unit: 0 }));
      break;
    case "swap-steps":
      out = up(c.chains).flatMap((ch) => ch.words.slice(1).flatMap((b, i) => (b !== ch.words[i] ? [{ values: { word: ch.words[i], word2: b }, unit: ch.unit }] : [])));
      break;
    case "pictures": // "{picture} starts with {sound}.": the picture's first sound
      out = up(c.pictures).flatMap((w) => (w.segs?.[0] ? [{ values: { picture: w.text, sound: w.segs[0].p }, unit: w.unit }] : []));
      break;
    case "pictures-np": // R9: only pictures with a noun phrase
      out = up(c.pictures).flatMap((w) => (nounPhrase(w.text) ? [{ values: { picture: w.text }, unit: w.unit }] : []));
      break;
    case "spellings":
      out = up(c.spellings).map((s) => ({ values: { spelling: s.key, sound: s.p, word: s.example }, unit: s.unit }));
      break;
    case "fixed":
      out = [{ values: {}, unit: 0 }];
      break;
  }
  // one member per set of recordings, at its first unit
  const seen = new Map<string, Member>();
  for (const m of out.sort((a, b) => a.unit - b.unit)) {
    const k = renderJobs(t, m.values).map((j) => j.clip).join("|");
    if (!seen.has(k)) seen.set(k, m);
  }
  return [...seen.values()];
}
/** Pictures the content has but a noun-phrase template can't say yet (R9): for the generator's report. */
export const picturesWithoutNoun = (c: TemplateContent, maxUnit = Infinity) => c.pictures.filter((w) => w.unit <= maxUnit && !nounPhrase(w.text)).map((w) => w.text);

// ---------------------------------------------------------------- the registry
const L = (...lines: string[]): FallbackPart => ({ lines });
const J = (join: Join): FallbackPart => ({ join });
const S = (v: Values, k = "sound"): FallbackPart => ({ sound: String(v[k]) as PhonemeId, show: "petal" });
const W = (v: Values, k = "word"): FallbackPart => ({ word: String(v[k]) });
/** the slow way, or the plain word in a spelling moment before a second miss (FS1) */
const SLOW = (v: Values, o: FallbackCtx, k = "word"): FallbackPart => (o.slow ? { stretch: String(v[k]) } : { word: String(v[k]) });

type Spec = Omit<TemplateDef, "id" | "who" | "slots" | "purpose"> & { slots: Readonly<Record<string, SlotType>>; purpose?: Purpose };

/** The first 16 templates. Wording follows Sounds~Write and TEACHER_SCRIPT; where the old line bent the English round a
 *  slot, the slot goes back where English puts it. */
const SPECS = {
  // ---- row 1, W.position-q (awk 4): the item's first ask names its word (the official "What's the first sound you
  // hear in 'sat'?"). No slow word after it: the question says the word, and FS1 forbids handing over the segmenting.
  w_position_q: {
    text: "What's the {pos} sound in {word}?", slots: { pos: "pos", word: "word" }, purpose: "question", domain: "build-items", hide: true,
    fallback: (v) => [L(`${v.pos}_sound_q`, "first_sound_q"), J("sentence"), W(v)], // FS1: the plain word, never the gapped one
    inventory: [1], replaces: ["first_sound_q + [w~slow] (the item's first ask)", "audit_last_place"], lane: "C1 Early, D1 Dojo, D2 Battle",
  },
  // the later asks: the word is named already (SPT5)
  w_next_q: {
    text: "What's the {pos} sound?", slots: { pos: "pos" }, purpose: "question", domain: "positions",
    fallback: (v) => [L(`${v.pos}_sound_q`, "next_sound_q")],
    inventory: [1, 49], replaces: ["first_sound_q", "next_sound_q", "last_sound_q"], lane: "C1 Early, D1 Dojo, D2 Battle",
  },
  // ---- row 2, W.your-word (the dictation prompt)
  w_your_word: {
    text: "Your word is {word}.", slots: { word: "word" }, domain: "words", hide: true,
    fallback: (v, o) => (o.has("tv_listen_word") ? [L("tv_listen_word"), J("sentence"), W(v)] : [L("tv_your_word"), J("breath"), W(v)]),
    inventory: [2], replaces: ["tv_your_word + [w]", "battle_spell + [w]", "dojo_build_word + [w]", "place_spell + [w]"], lane: "D2 Battle, D1 Dojo, C1 Early, A Placement",
  },
  w_your_next_word: {
    text: "Your next word is {word}.", slots: { word: "word" }, domain: "words", hide: true,
    fallback: (v, o) => (o.has("tv_listen_word") ? [L("tv_listen_word"), J("sentence"), W(v)] : [L("tv_next_word"), J("breath"), W(v)]),
    inventory: [2], replaces: ["tv_next_word + [w]"], lane: "D2 Battle, D1 Dojo, C1 Early",
  },
  // ---- row 3, W.listen-again (the listening correction). `slow: false` (FS1, a first spelling miss) plays the plain word.
  w_listen_again: {
    text: "Let's listen to {word} again. {word~slow}", slots: { word: "word" }, purpose: "correction", domain: "words", hide: true,
    fallback: (v, o) => (o.slow ? [L("tv_slow_again"), J("breath"), SLOW(v, o)] : [L("tv_listen_here", "listen_again"), J("sentence"), W(v)]),
    inventory: [3], replaces: ["listen_again + [w]", "tv_listen_here + [w]", "audit_listen_slowly + [w~slow]", "narrative.ts LISTEN_AGAIN leads + [w]"], lane: "F2 Voice (feedback.ts, narrate.tsx), D2 Battle",
  },
  // ---- row 4, WW.change (Sound Swap's official question: "Mat to sat. What do you think we need to change?")
  ww_change: {
    text: "{word} to {word2}. What do we need to change?", slots: { word: "word", word2: "word" }, purpose: "question", domain: "swap-steps", hide: true,
    fallback: (v) => [L("tv_swap_now_change", "swap_make"), J("breath"), W(v, "word2"), J("sentence"), L("st_what_change")],
    inventory: [4], replaces: ["tv_swap_now_change + [w] + stretches + st_what_change (four joins)"], lane: "D3 Swap",
  },
  // ---- row 5, S.which-starts
  s_which_starts: {
    text: "Which one starts with {sound}?", slots: { sound: "sound" }, purpose: "question", domain: "fixed",
    fallback: (v) => [L("first_q"), J("breath"), S(v)],
    inventory: [5], replaces: ["first_q + /s/"], lane: "C1 Early",
  },
  // ---- row 6, W.name (R9: only pictures with a noun phrase)
  w_name_pic: {
    text: "This is {picture~a}.", slots: { picture: "picture" }, purpose: "explanation", domain: "pictures-np",
    fallback: (v, o) => {
      const name = `fm_name_${fid(String(v.picture))}`; // the same sentence, recorded before templates
      return o.has(name) ? [L(name)] : [W(v, "picture")];
    },
    inventory: [6], replaces: ["fm_name_<w>", "this_is_a / this_is_an + [w] (Early.tsx's fallback)"], lane: "C2 Warm-ups, C1 Early",
  },
  // ---- row 7, S.which-write
  s_which_write: {
    text: "Which of these is the way we write {sound}?", slots: { sound: "sound" }, purpose: "question", domain: "fixed",
    fallback: (v) => [L("tv_which_write"), J("breath"), S(v)],
    inventory: [7], replaces: ["find_q", "dojo_find", "place_sound", "tv_which_write + /s/"], lane: "C1 Early, D1 Dojo, A Placement",
  },
  // ---- row 8, S.say-read (the read-back: a whole sentence, then the sounds and the word standing alone)
  s_say_read: {
    text: "Now let's say the sounds, and read the word. {word~sounds}. {word~bare}.", slots: { word: "word" }, domain: "fixed",
    fallback: (v, o) => [L("tv_lets_say_read", "say_sounds_read"), J("sentence"), { sounds: o.segs(String(v.word)) ?? [], show: "tile" }, J("sentence"), W(v)],
    inventory: [8], replaces: ["tv_lets_say_read ('…say the sounds… and read the word.')", "say_sounds_read · sounds · [w]"], lane: "C1 Early, D1 Dojo, D2 Battle, D3 Swap",
  },
  // ---- row 9, S.how-write
  s_how_write: {
    text: "This is how we write {sound}.", slots: { sound: "sound" }, purpose: "explanation", domain: "fixed",
    fallback: (v) => [L("tv_how_we_write", "how_we_spell"), J("breath"), S(v)],
    inventory: [9], replaces: ["how_we_spell + /s/", "tv_how_we_write + /s/", "audit_spell_it", "audit_hear_see"], lane: "C1 Early, C2 Warm-ups, D1 Dojo",
  },
  // ---- row 10, S.here-is
  s_here_sound: {
    text: "Here's the sound {sound}.", slots: { sound: "sound" }, domain: "fixed",
    fallback: (v) => [L("tv_here_sound"), J("breath"), S(v)],
    inventory: [10], replaces: ["tv_here_sound + /s/", "listen + /s/ (the bare 'Listen…')"], lane: "D1 Dojo, F2 Voice (teach.ts)",
  },
  // ---- row 11, WS.way-we-spell: the official formula, with the sound back in the middle. `spelling` is a key ("ai>ae"):
  // it picks the canonical example word, and the fallback's recorded "This is the way we spell it in rain."
  ws_way_we_spell: {
    text: "This is the way we spell {sound} in {word}.", slots: { sound: "sound", word: "word", spelling: "spelling" }, purpose: "explanation", domain: "spellings",
    fallback: (v, o) => {
      const way = `tg_${String(v.spelling).replace(">", "_").replace(/-/g, "")}_way`;
      return o.has(way) ? [L("tv_here_sound"), J("breath"), S(v), J("sentence"), L(way)] : [L("t_way_we_spell"), J("breath"), S(v)];
    },
    inventory: [11], replaces: ["tv_here_sound · tg_<g>_<p>_way ('…spell it in rain.')", "t_way_we_spell + /s/ + t_in + [w]"], lane: "F2 Voice (teach.ts)",
  },
  // ---- row 12, WS.starts-with
  ws_starts_with: {
    text: "{picture} starts with {sound}.", slots: { picture: "picture", sound: "sound" }, purpose: "explanation", domain: "pictures",
    fallback: (v, o) => {
      const fs = `fs_${fid(String(v.picture))}`;
      // no recorded "Mop starts with...": today's splice, as it plays now (the template exists to retire it)
      return o.has(fs) ? [L(fs), J("breath"), S(v)] : [W(v, "picture"), J("breath"), L("starts_with"), J("breath"), S(v)];
    },
    inventory: [12], replaces: ["fs_<w> + /s/", "[w] + starts_with + /s/ (the fallback)"], lane: "C1 Early, F2 Voice (feedback.ts)",
  },
  // ---- Jonas's two examples
  w_say_slowly: {
    text: "Say {word} slowly.", slots: { word: "word" }, domain: "words", hide: true,
    fallback: (v) => [L("tv_fs_say_slow"), J("breath"), { stretch: String(v.word) }],
    inventory: [14], replaces: ["'Say this word slowly: mat' (Jonas's example)", "tv_fs_say_slow + [w~slow] (the child's turn)"], lane: "C1 Early, D1 Dojo, D2 Battle",
  },
  s_say_the_sound: {
    text: "Say the sound {sound}.", slots: { sound: "sound" }, domain: "fixed",
    fallback: (v) => [L("t_say", "t_this_is_sound"), J("breath"), S(v)],
    inventory: [13], replaces: ["'Say this sound: a' (Jonas's example)", "t_say + /s/"], lane: "F2 Voice (teach.ts), D1 Dojo",
  },
} satisfies Record<string, Spec>;

type Specs = typeof SPECS;
export type TemplateId = keyof Specs;
type SlotTs<S> = S extends "n" ? number : S extends "list" ? readonly string[] : S extends "sound" ? PhonemeId : string;
/** The values a template needs: every slot, typed (a sound is a PhonemeId). */
export type ValuesOf<T extends TemplateId> = { readonly [K in keyof Specs[T]["slots"]]: SlotTs<Specs[T]["slots"][K]> };

export const TEMPLATES: Readonly<Record<TemplateId, TemplateDef>> = Object.fromEntries(
  Object.entries(SPECS).map(([id, s]) => [id, { id, who: "sensei", purpose: "instruction", ...(s as Spec) } as TemplateDef]),
) as Record<TemplateId, TemplateDef>;
export const TEMPLATE_IDS = Object.keys(SPECS) as TemplateId[];
export const TEMPLATE_LIST: readonly TemplateDef[] = TEMPLATE_IDS.map((id) => TEMPLATES[id]);
export const isTemplateId = (id: string): id is TemplateId => Object.prototype.hasOwnProperty.call(SPECS, id);
