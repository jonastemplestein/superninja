// Reference implementation of the speech-template model in docs/SPEECH_TEMPLATES.md (§1, §5). Pure: no DOM, no audio.
// A later workflow copies this into src/content/templates.ts (the catalogue and speak()) and src/core (the part kinds).
//
// A template is one sentence (or a short run of sentences) with slots:
//   "Say {word} slowly."                         a text slot: said inside one TTS take, rendered once per member
//   "Say the sound {sound}."                     a clip slot: the QA'd pure sound from /a/p/, never synthesised
//   "Let's listen to {word} again. {word~slow}"  a clip slot made from a text slot's value (the slow way, /a/x/)
// parse() cuts the text into pieces: speech pieces (TTS takes) and clip slots, with a designed join between them.

export type Speaker = "sensei" | "baron";
export type PhonemeId = string;
export interface Seg { g: string; p: PhonemeId }

/** Text slots are spoken inside a take. Clip slots are library clips. A key slot is never spoken. */
export type SlotType =
  | "word" | "picture" | "name" | "n" | "pos" | "title" | "list" | "count" // text slots
  | "sound" | "sounds"                                                   // clip slots (pure sounds)
  | "spelling" | "key";                                                  // key slots: select members, never said
/** `~slow` the slow way (/a/x/), `~first` the held first sound (/a/o/), `~bare` the word clip alone (/a/w/),
 *  `~fast` the same word clip as a performance (the rabbit's fast way, a model reading), `~sounds` the word's pure
 *  sounds one by one, `~a` the word with its article ("an apple": still a text slot).
 *  The line between `~bare` and `~fast` is the rule that matters (R5): a word the sentence talks ABOUT is said inside
 *  the sentence ("Say mat slowly."); a word the sentence introduces as a DEMONSTRATION may follow a suspended lead-in,
 *  like a pure sound ("And now the fast way… mat"). A word clip that is neither stands alone between sentences. */
export type Mod = "slow" | "first" | "bare" | "fast" | "sounds" | "a";
export type ClipKind = "sound" | "sounds" | "slow" | "first" | "bare" | "fast";
export type Join = "breath" | "sentence";
/** Where a clip slot sits: at a sentence end, at the end of a phrase that carries on, or alone between sentences. */
export type ClipAt = "end" | "phrase" | "alone";

export type Piece =
  | { kind: "speech"; text: string; slots: string[]; lead: boolean; cont: boolean }
  | { kind: "clip"; slot: string; clip: ClipKind; at: ClipAt; after: string }
  | { kind: "join"; join: Join };

export type SlotValue = string | number | Seg[] | PhonemeId[];
export type Values = Record<string, SlotValue>;

/** The Say items a template resolves to: audio.ts's today, plus `tpl` and `join` (docs/SPEECH_TEMPLATES.md §5.2). */
export type Say =
  | { line: string }
  | { word: string; demo?: true }
  | { stretch: string }
  | { onset: string }
  | { sound: PhonemeId; show?: "petal" | "tile" | "hidden" }
  | { sounds: Seg[]; gap?: number; show?: "tile" | "hidden" }
  | { tpl: string; piece: number; key: string; text: string; hide?: string[]; fallback?: Say[] }
  | { join: Join };

export interface TemplateDef {
  id: string;
  text: string;
  /** slot name → type; clip modifiers ({word~slow}) need no entry of their own */
  slots: Record<string, SlotType>;
  who?: Speaker;
  purpose: "instruction" | "question" | "explanation" | "demo" | "correction" | "hint" | "praise" | "transition";
  /** see §2 of the design */
  tier: "whole" | "sound" | "sequence" | "splice";
  /** the content domain that enumerates the members (design §3.1) */
  domain: string;
  /** a speech piece recorded already: speech-piece ordinal (0 = the first speech piece) → a line id, or a family
   *  pattern ("fs_<picture>"). Rendered files are numbered by the same ordinal: /a/t/<id>/<ordinal>-<key>.mp3 */
  src?: Record<number, string>;
  /** a slot whose value is worked out from the others at render time (canonical example words, a spelling's sound) */
  derive?: Record<string, (v: Values) => SlotValue>;
  /** played instead when any rendered piece is missing: recorded lines and clip slots only, never a word inside a sentence */
  fallback?: (v: Values) => Say[];
  /** the lines and families it retires or adopts */
  replaces?: string[];
  inventory?: number[];
  lane: string;
  /** words hidden in the grown-ups' caption unless revealed (a dictation word written out would give the spelling away) */
  hide?: boolean;
}

// ---------------------------------------------------------------- parsing
const SLOT = /\{([a-z][a-z0-9]*)(?:~(slow|first|bare|fast|sounds|a))?\}/g;
const wordsIn = (s: string) => s.replace(/\{[^}]+\}/g, "x").split(/[\s—-]+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
const clipKind = (type: SlotType | undefined, mod: Mod | undefined): ClipKind | null =>
  mod === "slow" ? "slow" : mod === "first" ? "first" : mod === "bare" ? "bare" : mod === "fast" ? "fast" : mod === "sounds" ? "sounds" : type === "sound" ? "sound" : type === "sounds" ? "sounds" : null;

/** Cut a template's text into speech pieces, clip slots and joins. */
export function parse(t: Pick<TemplateDef, "text" | "slots">): Piece[] {
  const out: Piece[] = [];
  let buf = "";
  let slots: string[] = [];
  let cont = false;
  const flush = (lead: boolean) => {
    const text = buf.trim();
    if (text) out.push({ kind: "speech", text, slots, lead, cont });
    buf = "";
    slots = [];
    cont = false;
  };
  let last = 0;
  for (const m of t.text.matchAll(SLOT)) {
    buf += t.text.slice(last, m.index);
    last = m.index! + m[0].length;
    const [, name, mod] = m as unknown as [string, string, Mod | undefined];
    const kind = clipKind(t.slots[name], mod);
    if (!kind) {
      buf += m[0];
      slots.push(name);
      continue;
    }
    // a clip slot: the speech before it is a lead-in (breath) unless it ends a sentence (the clip stands alone)
    const before = buf.trim();
    const alone = !before || (/[.?!]$/.test(before) && !/(\.\.\.|…)$/.test(before));
    flush(!alone);
    if (before) out.push({ kind: "join", join: alone ? "sentence" : "breath" });
    // what follows: a sentence end, nothing, or a phrase that carries on
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
  return out;
}

/** The grammar that keeps templated speech natural (design §1.3). Errors block the build; warnings are style. */
export function check(t: TemplateDef): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const e = (s: string) => errors.push(`${t.id}: ${s}`);
  for (const m of t.text.matchAll(SLOT)) {
    const [, name, mod] = m as unknown as [string, string, Mod | undefined];
    const type = t.slots[name];
    if (!type) e(`slot {${name}} has no type`);
    if (type === "spelling" || type === "key") e(`{${name}} is a key slot: never said (a spelling said aloud is letter names)`);
    if (mod && mod !== "a" && type && !["word", "picture"].includes(type)) e(`{${name}~${mod}} needs a word or picture slot`);
    const before = t.text.slice(0, m.index).trimEnd();
    if (before.endsWith(":")) e(`a colon before {${name}}: the carrier-plus-colon shape (Jonas, 27 Sep)`);
    if (mod === "bare" && /\b(this|the) word(\.\.\.|…)?$/i.test(before)) e(`"…the word" + a word clip: say the word inside the sentence instead`);
    if (type === "sound" && /\bthis sound\.*$/i.test(before)) warnings.push(`${t.id}: "this sound {${name}}": prefer "the sound {${name}}" (Jonas)`);
  }
  const pieces = parse(t);
  pieces.forEach((p, i) => {
    if (p.kind !== "clip") return;
    const prev = pieces[i - 2];
    const next = pieces[i + 2];
    if (p.clip === "bare" && p.at !== "alone") e(`{${p.slot}~bare} after a lead-in: a word clip may only stand alone between sentences (R5)`);
    if (i === 0 && p.at === "phrase") e(`starts on a clip slot that carries on in words (R4): "${t.text}"`);
    if (prev?.kind === "speech" && prev.lead && wordsIn(prev.text) < 2) e(`lead-in "${prev.text}" is under 2 words`);
    if (p.at === "phrase" && next?.kind === "speech") {
      const phrase = next.text.split(/[,.?!]/)[0];
      if (wordsIn(phrase) < 2) e(`the phrase after {${p.slot}} ("${phrase.trim()}") is under 2 words: one sound per phrase (R3)`);
    }
    if (p.at === "phrase" && next?.kind === "clip") e(`two clip slots in one phrase (R3)`);
    if (p.at === "end" || p.at === "phrase") {
      // a yes/no question can't end on a pure sound: its rise has nowhere to land (R7); "…or {b}?" is an alternative
      const sentence = t.text.slice(0, t.text.indexOf(`{${p.slot}`)).split(/[.!?]\s/).pop() ?? "";
      const q = t.text.slice(t.text.indexOf(`{${p.slot}`)).match(/^\{[^}]+\}\s*\?/);
      if (q && /^(is|are|does|do|did|can|could|will|has|have|shall)\b/i.test(sentence.trim()) && !/\bor\b[^.?!]*$/i.test(sentence)) e(`a yes/no question ends on {${p.slot}} (R7)`);
    }
  });
  if (t.tier === "whole" && pieces.some((p) => p.kind === "clip" && (p.clip === "sound" || p.clip === "sounds") && p.at !== "alone")) e(`tier "whole" with a pure sound inside: that's tier "sound"`);
  return { errors, warnings };
}

// ---------------------------------------------------------------- filling
export const fid = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_");
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const VOWEL_START = /^(a|e|i|o|u|ae|ee|ie|oe|ue|ar|or|er|air|ear|ou|oy|oo|uu)$/;
/** The value as said: a number word, "an apple", a list "rain, tail and nail". `firstSound`: for the article. */
function said(v: SlotValue | undefined, type: SlotType, mod: Mod | undefined, firstSound?: PhonemeId, article?: string): string {
  if (v === undefined) return "";
  if (type === "n" || type === "count") return typeof v === "number" ? NUMBER_WORDS[v] ?? String(v) : String(v);
  if (type === "list" && Array.isArray(v)) {
    const ws = v as string[];
    return ws.length > 1 ? `${ws.slice(0, -1).join(", ")} and ${ws[ws.length - 1]}` : ws[0] ?? "";
  }
  const s = String(v);
  if (mod === "a") return `${article ?? (firstSound && VOWEL_START.test(firstSound) ? "an" : "a")} ${s}`;
  return s;
}
const capFirst = (s: string) => s.replace(/^(\W*)(\w)/, (_, a, b) => a + b.toUpperCase());

export interface Content {
  /** a word's sounds, for {word~sounds} and articles */
  segs(word: string): Seg[] | undefined;
  /** is this a recorded line id? (fallbacks and legacy pieces) */
  hasLine(id: string): boolean;
  /** the article a picture takes ("a", "an", "the": "This is the sun."), when the content overrides the sound rule */
  article?(word: string): string | undefined;
}

/** All values, derived ones filled in. */
export function valuesOf(t: TemplateDef, v: Values): Values {
  const out = { ...v };
  for (const [k, f] of Object.entries(t.derive ?? {})) if (out[k] === undefined) out[k] = f(out);
  return out;
}

/** A speech piece's text as recorded (TTS script): a lead-in ends on "...", a continuation starts with "...". */
export function pieceText(t: TemplateDef, p: Extract<Piece, { kind: "speech" }>, v: Values, c: Content): string {
  let text = p.text.replace(SLOT, (_m, name: string, mod: Mod | undefined) => said(v[name], t.slots[name], mod, c.segs(String(v[name]))?.[0]?.p, c.article?.(String(v[name]))));
  text = text.replace(/(^|[.?!]\s+)([a-z])/g, (_m, a, b) => a + b.toUpperCase()); // a sentence-initial value
  text = capFirst(text);
  if (p.cont) text = `...${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  if (p.lead) text = `${text.replace(/[,;]$/, "")}...`;
  return text;
}
/** A piece's member key: its own text slots' values, in order ("_" when it has none). */
export const pieceKey = (p: Extract<Piece, { kind: "speech" }>, v: Values): string =>
  p.slots.length ? p.slots.map((s) => fid(Array.isArray(v[s]) ? (v[s] as string[]).join("_") : String(v[s]))).join(".") : "_";
export const clipIdOf = (tpl: string, piece: number, key: string) => `t:${tpl}/${piece}-${key}`;
export const urlOf = (tpl: string, piece: number, key: string) => `/a/t/${tpl}/${piece}-${key}.mp3`;
/** A legacy family id for these values ("fs_<picture>" → "fs_mop"; numbers as words: "t_ways_<n>" → "t_ways_three"). */
export const legacyId = (t: TemplateDef, pattern: string, v: Values) =>
  pattern.replace(/<([a-z0-9]+)>/g, (_m, k: string) => (t.slots[k] === "n" || t.slots[k] === "count" ? said(v[k], t.slots[k], undefined) : fid(String(v[k]))));

/** The Say items for a template and its values: what scenes pass to say(), and (as parts) what the core logs. */
export function speak(t: TemplateDef, values: Values, c: Content, o: { show?: "petal" | "tile" | "hidden"; reveal?: boolean } = {}): Say[] {
  const v = valuesOf(t, values);
  const pieces = parse(t);
  const fb = t.fallback?.(v);
  const out: Say[] = [];
  let n = -1;
  pieces.forEach((p) => {
    if (p.kind === "join") return void out.push({ join: p.join });
    if (p.kind === "clip") {
      const val = v[p.slot];
      if (p.clip === "sound") return void out.push({ sound: String(val), show: o.show ?? "petal" });
      if (p.clip === "sounds") {
        const segs = Array.isArray(val) && typeof val[0] === "object" ? (val as Seg[]) : Array.isArray(val) ? (val as string[]).map((p) => ({ g: "", p })) : c.segs(String(val)) ?? [];
        return void out.push({ sounds: segs, show: "tile" });
      }
      if (p.clip === "slow") return void out.push({ stretch: String(val) });
      if (p.clip === "first") return void out.push({ onset: String(val) });
      return void out.push(p.clip === "fast" ? { word: String(val), demo: true } : { word: String(val) });
    }
    const i = ++n;
    const src = t.src?.[i];
    if (src) {
      const id = legacyId(t, src, v);
      if (c.hasLine(id)) return void out.push({ line: id });
    }
    const key = pieceKey(p, v);
    const hide = t.hide && !o.reveal ? p.slots.filter((s) => t.slots[s] === "word" || t.slots[s] === "picture").map((s) => String(v[s])) : [];
    out.push({ tpl: t.id, piece: i, key, text: pieceText(t, p, v, c), ...(hide.length ? { hide } : {}), ...(fb ? { fallback: fb } : {}) });
  });
  return out;
}

/** The whole utterance as text. "transcript": sounds as /m/, the slow way as "mat" (slowly); "caption": hidden words
 *  as 🔊 unless revealed. Every clip's text is recoverable from this and from the piece texts (design §5.4). */
export function textOf(t: TemplateDef, values: Values, c: Content, style: "transcript" | "caption" = "transcript", reveal = false): string {
  const v = valuesOf(t, values);
  const parts: string[] = [];
  for (const p of parse(t)) {
    if (p.kind === "join") continue;
    if (p.kind === "speech") {
      let s = pieceText(t, p, v, c).replace(/^\.\.\./, "").replace(/\.\.\.$/, "");
      if (style === "caption" && t.hide && !reveal) for (const name of p.slots) if (["word", "picture"].includes(t.slots[name])) s = s.replace(new RegExp(`\\b${String(v[name])}\\b`, "i"), "🔊");
      parts.push(s);
      continue;
    }
    const val = v[p.slot];
    const w = String(val);
    const shown = style === "transcript" || reveal;
    parts.push(
      p.clip === "sound" ? (shown ? `/${w}/` : "🔊")
        : p.clip === "sounds" ? (Array.isArray(val) ? (val as (Seg | string)[]).map((s) => `/${typeof s === "string" ? s : s.p}/`) : (c.segs(w) ?? []).map((s) => `/${s.p}/`)).join(" ")
        : p.clip === "slow" ? (shown ? `"${w}" (slowly)` : "🔊")
        : p.clip === "first" ? (shown ? `"${w}" (first sound held)` : "🔊")
        : p.clip === "fast" ? (shown ? `"${w}" (fast)` : "🔊")
        : shown ? `"${w}"` : "🔊",
    );
    if (p.after) parts[parts.length - 1] += p.after;
  }
  return parts.join(" ").replace(/\s+([,.?!])/g, "$1").replace(/([/)"]) ([a-z])/g, "$1 $2");
}

/** The clips a template needs for one set of values (preload, warm() and the build's coverage check). */
export function clipsOf(t: TemplateDef, values: Values, c: Content): string[] {
  return speak(t, values, c).flatMap((s) => ("tpl" in s ? [urlOf(s.tpl, s.piece, s.key)] : "line" in s ? [`/a/l/${s.line}.mp3`] : "sound" in s ? [`/a/p/${s.sound}.mp3`] : "stretch" in s ? [`/a/x/${fid(s.stretch)}.mp3`] : "word" in s ? [`/a/w/${fid(s.word)}.mp3`] : "onset" in s ? [`/a/o/${fid(s.onset)}.mp3`] : "sounds" in s ? s.sounds.map((x) => `/a/p/${x.p}.mp3`) : []));
}

/** What the generator renders for one template and one set of values: the speech pieces not already recorded. */
export function renderJobs(t: TemplateDef, values: Values, c: Content): { clip: string; url: string; text: string; lead: boolean; cont: boolean }[] {
  const v = valuesOf(t, values);
  return parse(t).filter((p): p is Extract<Piece, { kind: "speech" }> => p.kind === "speech").flatMap((p, i) => {
    if (t.src?.[i] && c.hasLine(legacyId(t, t.src[i], v))) return [];
    const key = pieceKey(p, v);
    return [{ clip: clipIdOf(t.id, i, key), url: urlOf(t.id, i, key), text: pieceText(t, p, v, c), lead: p.lead, cont: p.cont }];
  });
}

/** Each slot's prosodic position (design §1.4): a text slot's place in its intonation phrase (I initial, M medial,
 *  F final; the phrase runs between , . ? ! and a clip slot), a clip slot's place in the sentence (end, phrase, alone). */
export function positions(t: TemplateDef): Record<string, string> {
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
