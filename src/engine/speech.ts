// Speech templates at run time (docs/SPEECH_TEMPLATES.md §5): a template id and its values → the Say[] that audio.ts's
// say() plays.
//
//   say(speak("w_say_slowly", { word: "mat" }))          "Say mat slowly." (one recorded take)
//   say(speak("s_say_the_sound", { sound: "a" }))        "Say the sound…" · breath · /a/ (the checked pure sound)
//
// speak() picks, every time, between two ways of saying it:
//   - the TEMPLATE: its recorded pieces (/a/t/<template>/<piece>-<key>.mp3) with designed joins, when audio.ts can play
//     them (setTemplatePlayback) and the manifest (/a/t/manifest.json, loadManifest) lists every piece;
//   - the FALLBACK: the template's own fallback, built only from recorded lines and library clips (today's composition),
//     with its joins turned into audio.ts's gaps. Never half of one and half of the other.
// So a scene can move to speak() today with no change to what the child hears, and each template switches over as its
// recordings land. Pure apart from the manifest and the playback flag: no DOM, no audio (the headless runner can use it).
import type { Say, SoundAt, SoundShow } from "./audio";
import { WORD_BY_TEXT, ORAL_WORDS, type Seg } from "../content/phonics";
import { STRETCHED, HELD_ONSET } from "../content/stretch";
import { TEMPLATES, fid, lineRecorded, lineRetired, missingSlots, templateParts, textOf, tplUrl, type FallbackPart, type Join, type Part, type TemplateId, type Values, type ValuesOf } from "../content/templates";

// ---------------------------------------------------------------- the parts audio.ts learns to play
/** A recorded template piece. `text` is its caption ("Say the sound..."); `hide` the values the grown-ups' caption hides
 *  until revealed; `fallback` what to play instead, whole, if the clip fails to load (a 404, no network). */
export type TplSay = { tpl: TemplateId; piece: number; key: string; text: string; url: string; hide?: string[]; fallback?: Say[] };
/** A designed pause, timed from the end of one clip's speech to the start of the next's (not a `gap`, which is timed
 *  between files). */
export type JoinSay = { join: Join };
export type SpeechSay = Say | TplSay | JoinSay;
export const isTplSay = (it: object): it is TplSay => "tpl" in it;
export const isJoinSay = (it: object): it is JoinSay => "join" in it;

/** Speech-to-speech pause lengths (ms). `breath` before a pure sound or a demonstration at a phrase end, and before
 *  the words that carry on after it; `sentence` between sentences. 150 is the critic's starting value (SPT3 amended);
 *  Jonas's A/B picks the final one, so this is the one place to change it. */
export const JOIN_MS: Record<Join, number> = { breath: 150, sentence: 450 };
/** The silence today's clips carry at a join, which a `{ gap }` adds to: about 110 ms after a line's speech (60 ms kept
 *  by the trim plus 50 ms of pad), about 30 ms before the next clip's, and the onended hop. A lowered join is its
 *  length less this. */
export const CLIP_EDGE_MS = 150;

export interface SpeakOpts {
  /** the job of the template's pure sounds (docs/SOUND_DISPLAY.md): default "petal" */
  show?: SoundShow;
  /** where a petal pops */
  at?: SoundAt;
  /** show the hidden values in the caption (after a mistake) */
  reveal?: boolean;
  /** FS1: false in a spelling moment before a second miss (the plain word instead of the gapped slow word) */
  slow?: boolean;
  /** the word's sounds, for a read-back; default: the content's */
  segs?: Seg[];
}

// ---------------------------------------------------------------- the manifest: which pieces are recorded
export const MANIFEST_URL = "/a/t/manifest.json";
/** One recorded piece: `h` the input hash (voice, model, the exact text, the finishing), `ms` its length, `on`/`off`
 *  where its speech starts and ends (ms into the file). */
export interface ManifestEntry { h: string; ms: number; on: number; off: number }
export interface ManifestTemplate {
  /** the template's text when it was rendered: a template whose words have changed since plays its fallback */
  text: string;
  /** "<piece>-<key>" → the recorded piece */
  entries: Record<string, ManifestEntry>;
  /** "<piece>-<key>" → why no take passed the gates (never shipped: the fallback plays) */
  failed?: Record<string, string>;
}
export interface TemplateManifest {
  v: 1;
  voice: string;
  model: string;
  /** the MP3s' sample rate and bit rate */
  rate: number;
  kbps: number;
  updated: string;
  templates: Record<string, ManifestTemplate>;
}
let manifest: TemplateManifest | null = null;
/** Use this manifest (null: none, so every template plays its fallback). */
export function useManifest(m: TemplateManifest | null) {
  manifest = m && m.v === 1 && m.templates && typeof m.templates === "object" ? m : null;
}
/** Fetch /a/t/manifest.json. A missing or non-JSON answer (Cloudflare's single-page fallback is `200 text/html`) keeps
 *  every template on its fallback. Resolves true when a manifest is in use. */
export async function loadManifest(url = MANIFEST_URL, get: (url: string) => Promise<Response> = (u) => fetch(u)): Promise<boolean> {
  try {
    const r = await get(url);
    if (!r.ok || !/json/.test(r.headers.get("content-type") ?? "")) return false;
    useManifest((await r.json()) as TemplateManifest);
  } catch {
    return false;
  }
  return manifest != null;
}
/** A recorded piece, if the manifest lists it for the template's current words. */
export function recordedPiece(tpl: TemplateId, piece: number, key: string): ManifestEntry | undefined {
  const t = manifest?.templates[tpl];
  return t && t.text === TEMPLATES[tpl].text ? t.entries[`${piece}-${key}`] : undefined;
}

// ---------------------------------------------------------------- can audio.ts play templates yet?
let playsTemplates = false;
/** audio.ts calls this once its say() plays `{ tpl }` and `{ join }` (docs/fix-requests.md, "Speech templates"). Until
 *  then every template plays its fallback. */
export function setTemplatePlayback(on: boolean) {
  playsTemplates = on;
}
export const templatePlayback = () => playsTemplates;

// ---------------------------------------------------------------- speak
const vals = (v: object) => v as Values;
/** A word's sounds: the caller's, else the content's (phonics.ts words, then the oral picture words). */
const segsOf = (o: SpeakOpts) => (w: string): Seg[] | undefined =>
  o.segs ?? WORD_BY_TEXT[w]?.segs ?? ORAL_WORDS[w]?.segs?.map((p) => ({ g: p, p }));

/** How a template was resolved: what to play, which way, and the template pieces not recorded (URLs). `parts` is the
 *  template as designed, for the core's log and the text adventure. */
export interface Resolved { say: Say[]; via: "template" | "fallback"; missing: string[]; parts: SpeechSay[] }

/** The template as designed, every speech piece a `{ tpl }` (with the fallback attached), joins as `{ join }`. */
export function speakParts<T extends TemplateId>(id: T, values: ValuesOf<T>, o: SpeakOpts = {}): SpeechSay[] {
  const t = TEMPLATES[id];
  const fallback = fallbackSay(id, values, o, true);
  return templateParts(t, vals(values), { slow: o.slow, segs: segsOf(o), reveal: o.reveal }).map((p) => partSay(p, o, fallback));
}
function partSay(p: Part, o: SpeakOpts, fallback: Say[]): SpeechSay {
  if ("tpl" in p) return { ...p, tpl: p.tpl as TemplateId, url: tplUrl(p.tpl, p.piece, p.key), fallback };
  if ("sound" in p) return { sound: p.sound, show: o.show ?? p.show ?? "petal", ...(o.at ? { at: o.at } : {}) };
  return p;
}

/** Resolve a template for these values (see the top of the file). */
export function resolveSpeech<T extends TemplateId>(id: T, values: ValuesOf<T>, o: SpeakOpts = {}): Resolved {
  const lack = missingSlots(TEMPLATES[id], vals(values));
  if (lack.length) console.warn(`speak(${id}): no value for ${lack.join(", ")}`);
  const parts = speakParts(id, values, o);
  const missing = parts.flatMap((p) => (isTplSay(p) && !recordedPiece(p.tpl, p.piece, p.key) ? [p.url] : []));
  if (playsTemplates && !missing.length && !lack.length) return { say: parts as unknown as Say[], via: "template", missing, parts };
  if (playsTemplates) logMiss(id, missing);
  return { say: fallbackSay(id, values, o), via: "fallback", missing, parts };
}
/** What to play for a template and its values: `say(speak("w_say_slowly", { word: "mat" }))`. */
export function speak<T extends TemplateId>(id: T, values: ValuesOf<T>, o: SpeakOpts = {}): Say[] {
  return resolveSpeech(id, values, o).say;
}

/** The template's fallback as Say items: line candidates resolved (a recorded line that isn't retired first), empty
 *  parts dropped, joins tidied, and the joins lowered to gaps unless audio.ts plays joins. */
export function fallbackSay<T extends TemplateId>(id: T, values: ValuesOf<T>, o: SpeakOpts = {}, nativeJoins = playsTemplates): Say[] {
  const raw = TEMPLATES[id].fallback(vals(values), { slow: o.slow !== false, has: lineRecorded, segs: segsOf(o) });
  const items = tidy(raw.flatMap((p) => fallbackItem(p, o)));
  return nativeJoins ? (items as unknown as Say[]) : lower(items);
}
function fallbackItem(p: FallbackPart, o: SpeakOpts): (Say | JoinSay)[] {
  if ("lines" in p) {
    const id = p.lines.find((l) => lineRecorded(l) && !lineRetired(l)) ?? p.lines.find(lineRecorded);
    return id ? [{ line: id }] : [];
  }
  if ("sound" in p) return [{ sound: p.sound, show: o.show ?? p.show ?? "petal", ...(o.at ? { at: o.at } : {}) }];
  if ("sounds" in p) return p.sounds.length ? [p] : [];
  return [p];
}
/** No join at either end or two in a row (a dropped part leaves its joins behind); a sentence join beats a breath. */
function tidy(items: (Say | JoinSay)[]): (Say | JoinSay)[] {
  const out: (Say | JoinSay)[] = [];
  for (const it of items) {
    const last = out[out.length - 1];
    if (isJoinSay(it)) {
      if (!last) continue;
      if (isJoinSay(last)) {
        if (it.join === "sentence") out[out.length - 1] = it;
        continue;
      }
    }
    out.push(it);
  }
  while (out.length && isJoinSay(out[out.length - 1])) out.pop();
  return out;
}
/** Joins as today's audio.ts gaps: the join less the silence the clips already carry (CLIP_EDGE_MS). */
export function lower(items: readonly (Say | JoinSay)[]): Say[] {
  return items.map((it) => (isJoinSay(it) ? { gap: Math.max(0, JOIN_MS[it.join] - CLIP_EDGE_MS) } : it));
}

/** Template misses while audio.ts plays templates: logged beside the clips (window.__audioLog, as audio.ts logs them)
 *  for the transcript audit `template-fallback` (target 0 in a release build), and to listeners. */
type MissListener = (tpl: TemplateId, missing: string[]) => void;
const missListeners = new Set<MissListener>();
export function onTemplateMiss(fn: MissListener) {
  missListeners.add(fn);
  return () => void missListeners.delete(fn);
}
function logMiss(tpl: TemplateId, missing: string[]) {
  const log = (globalThis as { __audioLog?: unknown[] }).__audioLog;
  if (Array.isArray(log)) log.push({ t: Date.now(), url: `tpl-miss:${tpl}`, kind: "speech", missing });
  missListeners.forEach((f) => f(tpl, missing));
}

// ---------------------------------------------------------------- what it will load, and what it says
/** The URLs a list of Say items loads, as audio.ts resolves them (for warm(), preload() and coverage checks). */
export function clipUrls(items: readonly SpeechSay[]): string[] {
  const slow = (w: string) => (STRETCHED.has(w) ? `/a/x/${fid(w)}.mp3` : `/a/w/${fid(w)}.mp3`);
  const out = items.flatMap((it): string[] =>
    isTplSay(it) ? [it.url]
      : "line" in it ? [`/a/l/${it.line}.mp3`]
      : "word" in it ? [`/a/w/${fid(it.word)}.mp3`]
      : "stretch" in it ? [slow(it.stretch)]
      : "onset" in it ? [HELD_ONSET.has(it.onset) ? `/a/o/${fid(it.onset)}.mp3` : slow(it.onset)]
      : "sound" in it ? [`/a/p/${it.sound}.mp3`]
      : "sounds" in it ? it.sounds.map((s) => `/a/p/${s.p}.mp3`)
      : "story" in it ? [`/a/s/${it.story}_${it.page}.mp3`]
      : [],
  );
  return [...new Set(out)];
}
/** The clips speak() would load right now for this template and these values. */
export const clipsFor = <T extends TemplateId>(id: T, values: ValuesOf<T>, o: SpeakOpts = {}) => clipUrls(resolveSpeech(id, values, o).say);
/** The whole template as the grown-ups' caption ("Your word is 🔊.") or as a transcript ("Say the sound /a/."). */
export const captionFor = <T extends TemplateId>(id: T, values: ValuesOf<T>, o: SpeakOpts = {}) => textOf(TEMPLATES[id], vals(values), "caption", { reveal: o.reveal, slow: o.slow, segs: segsOf(o) });
export const transcriptFor = <T extends TemplateId>(id: T, values: ValuesOf<T>, o: SpeakOpts = {}) => textOf(TEMPLATES[id], vals(values), "transcript", { slow: o.slow, segs: segsOf(o) });
