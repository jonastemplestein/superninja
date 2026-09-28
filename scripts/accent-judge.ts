// The calibrated accent judge: is each target word in a clip said the Southern British way?
//
// Three features, each a question about one word of the clip:
//   bath  the BATH vowel: "fast", "last", "after", "ask" with the long /ɑː/ of "father" (British), not the /æ/ of "cat"
//   r     an r after a vowel, before a consonant or a pause ("word", "car", "first"): none (British), or r-coloured
//   flap  a t between vowels ("water", "petal"): a real /t/ or a glottal stop (British), not a quick "d" flap
// Gemini (gemini-3.1-pro-preview, temperature 1) hears the clip with 400 ms of silence in front (it misreads a clip
// that starts at once; each vote adds 10 ms more, so no two votes send the same bytes), is told the sentence, and is
// asked about one word, with "between" allowed. The r and the flap are asked ABX: a British and an American "Bird." (or
// "Water.") first, in a fresh order each vote, then "is the r in <word> like clip 1's or clip 2's?" (asked directly,
// it heard half of the American reference's flaps as British, and was unsure of a British "Car."). A word's British
// probability is its share of votes for the British form ("between" counts against it); a clip's is its lowest word's.
//
// Every run first judges the reference clips in playtest/voice-picker/audio/accent-refs (refs.json: the same
// sentences read by ElevenLabs Alice and George, British, and by OpenAI coral with no accent instruction, American)
// on each feature it is about to judge, and refuses to judge (exit 2) unless that feature separates them: the British
// references at least 85 % British votes, the American at most 15 % (25 % for the r: coral's own r is not always
// r-coloured, the accent audit measured 8 of 10), and at least 90 % of reference words on the right side of 50 %. The
// BATH prompt is the fast-and-slow checker's (27 Sep); on it Alice was 52/54 British and coral 0/54.
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/accent-judge.ts tv_fs_made tv_ts_fast   # line ids (public/a/l)
//   … bun scripts/accent-judge.ts path/to/clip.mp3 --text "Now say it fast."                         # any clip
//   … bun scripts/accent-judge.ts --in items.json    # [{ key, file, text, words?: { bath?: [], r?: [], flap?: [] } }]
//   --votes N         votes a word (default 21)
//   --features f,f    which of bath,r,flap to judge (default all three, where the text has such a word)
//   --bath w,w  --r w,w  --flap w,w   these words instead of the ones found in the text (with one clip)
//   --json out.json   everything, votes included     --calibrate-only   just the calibration
//   --cal-votes N     votes a reference word (default 3 for bath, 4 for r and flap)
//   --model m   --conc N (16 requests at once)
// Exit: 0 judged, 2 the calibration failed and nothing was judged, 1 an error.
// As a module: `calibrate(features)`, then `judge(items)`; `findWords(text)` gives the target words.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { generate, pool, textOf } from "./gemini";

export type Feature = "bath" | "r" | "flap";
export const FEATURES: Feature[] = ["bath", "r", "flap"];
export type Words = Partial<Record<Feature, string[]>>;
export interface Item { key: string; file: string; text: string; words?: Words }
/** A vote: the British form, the American one, in between, or no answer. */
export type Vote = "UK" | "US" | "mid" | "?";
export interface WordVerdict { feature: Feature; word: string; votes: Vote[]; uk: number; n: number; p: number }
export interface ClipVerdict { key: string; file: string; text: string; words: WordVerdict[]; p: number | null }
export interface FeatureCalibration { feature: Feature; british: { uk: number; n: number; share: number }; american: { uk: number; n: number; share: number }; rightSide: number; words: number; ok: boolean; clips: ClipVerdict[] }
export interface Calibration { model: string; ok: boolean; features: FeatureCalibration[] }

const REPO = resolve(import.meta.dir, "..");
export const REFS = join(REPO, "playtest/voice-picker/audio/accent-refs/refs.json");
export const MODEL = "gemini-3.1-pro-preview";
export const PAD_MS = 400;
/** Calibration gates: the British references' share of British votes, the American references', and the share of
 *  reference words on the right side of 50 %. */
export const CAL = { british: 0.85, american: { bath: 0.15, r: 0.25, flap: 0.15 } as Record<Feature, number>, rightSide: 0.9 };

// ---- the target words ----

/** BATH words (Southern British /ɑː/, General American /æ/). */
const BATH = /^(fast(er|est)?|baths?|grass(es|y)?|glass(es)?|class(es|room)?|can't|after(noon|wards)?|ask(s|ed|ing)?|answer(s|ed|ing)?|danc(e|es|ed|ing)|chances?|last(s|ed|ly)?|past|paths?|laugh(s|ed|ing|ter)?|half|halves|rather|plant(s|ed|ing)?|masters?|castles?|branch(es)?|crafty?|examples?|bananas?|pass(es|ed|ing)?|baskets?|tasks?|masks?|aunts?|giraffes?|vast|blast|grasp|staff|nasty|calf|chant|command|demand|glance|advance|samples?|brass)$/;
/** Unstressed or too short to judge an r in: left out of the r words unless named with --r. */
const R_SKIP = new Set(["for", "or", "are", "your", "you're", "her", "our", "their", "they're", "there", "there's", "here", "here's", "where", "where's", "were", "we're", "sir", "per"]);
/** An r after a vowel that British speech drops: before a consonant ("word", "tortoise") or at the end ("car", "flower",
 *  "more"). A word-final r before a word starting with a vowel is left out: British speech links it ("together and"). */
const R_SPOT = /[aeiouy]rr?(?=[^aeiouyr]|$)|[aeiou]re$/;
/** A t between vowels, before an unstressed syllable, that American speech flaps ("water", "little", "petal", "party"). */
const FLAP = /[aeiouy]r?tt?(?=(er|le|ling|ly|y|ie|ies|ier|ing|ed|en|al|el|o|a|ow|oise)s?(?![a-z]))/;

/** The target words of a text, per feature, as written (first spelling of each). */
export function findWords(text: string): Words {
  // each word with what follows it, so a word-final r before a vowel (British linking r) can be told from one before a
  // full stop
  const ws = [...text.replace(/[’‘]/g, "'").matchAll(/([A-Za-z][A-Za-z'-]*)([^A-Za-z]*)/g)].map((m) => ({ w: m[1].replace(/'+$/, ""), after: m[2] }));
  const out: Record<Feature, string[]> = { bath: [], r: [], flap: [] };
  const add = (f: Feature, w: string) => { if (!out[f].some((x) => x.toLowerCase() === w.toLowerCase())) out[f].push(w); };
  ws.forEach(({ w, after }, i) => {
    const lw = w.toLowerCase();
    const parts = lw.replace(/'s$/, "").split("-");
    if (BATH.test(lw)) add("bath", w);
    parts.forEach((part, k) => {
      if (!R_SKIP.has(lw) && R_SPOT.test(part)) {
        const final = k === parts.length - 1 && /r$|re$/.test(part) && !R_SPOT.test(part.replace(/re?$/, ""));
        const linked = final && /^[aeiou]/i.test(ws[i + 1]?.w ?? "") && !/[.;:!?…]/.test(after);
        if (!linked) add("r", w);
      }
      if (FLAP.test(part)) add("flap", w);
    });
  });
  return Object.fromEntries(FEATURES.filter((f) => out[f].length).map((f) => [f, out[f]])) as Words;
}

// ---- the question ----

function ask(f: Feature, text: string, word: string): string {
  const said = `The speaker in this clip says: "${text}"\n`;
  if (f === "bath") return said + `Focus only on the stressed vowel of the word "${word}". Southern British English (RP) speakers say it with the long, open back vowel /ɑː/ (as in "father", "car"). General American speakers say it with the short, front vowel /æ/ (as in "cat", "trap"). Some speakers land in between.
Which vowel did THIS speaker actually use in "${word}"? Judge by the sound, not by what you would expect.
Reply ONLY with JSON: {"vowel": "ɑː" | "æ" | "between", "confidence": <0-100>}`;
  // the r and the flap are asked ABX (anchors() below): asked directly, the judge heard half the flaps as British
  if (f === "r") return `Clip 1 and clip 2 are two speakers each saying the single word "Bird.". One of them says it with no r sound at all, the British way (/bɜːd/); the other puts an r colour into the vowel, the American way (/bɝd/).
Clip 3 is another speaker saying: "${text}"
Listen only to the word "${word}" in clip 3, and to whether its vowel has an r sound in it. Is it made the way clip 1 says "bird", or the way clip 2 does? Judge by that one sound only, not by the voice or the rest of the accent.
Reply ONLY with JSON: {"like": "clip 1" | "clip 2" | "between", "confidence": <0-100>}`;
  return `Clip 1 and clip 2 are two speakers each saying the single word "Water.". One of them says the t as a crisp /t/ (a short silence, then a puff), the British way; the other says it as a quick voiced flap, like a soft "d" ("wadder"), the American way.
Clip 3 is another speaker saying: "${text}"
Listen only to the t in the word "${word}" in clip 3. Is it made the way clip 1 makes the t in "water", or the way clip 2 does? Judge by the sound of that one consonant only, not by the voice or the rest of the accent.
Reply ONLY with JSON: {"like": "clip 1" | "clip 2" | "between", "confidence": <0-100>}`;
}

/** A feature's two anchors (refs.json `anchors`): a British and an American "Bird." for the r, "Water." for the flap.
 *  Clip 1 is the British one on even votes, the American one on odd votes. */
function anchors(f: Feature): { british: string; american: string } | null {
  const a = JSON.parse(readFileSync(REFS, "utf8")).anchors?.[f];
  return a ? { british: pad(join(dirname(REFS), a.british), PAD_MS), american: pad(join(dirname(REFS), a.american), PAD_MS) } : null;
}

function classify(f: Feature, raw: string, britishFirst: boolean): Vote {
  let v = "";
  try {
    const j = JSON.parse(raw);
    v = String(f === "bath" ? j.vowel : j.like).toLowerCase();
  } catch {
    return "?";
  }
  if (v.includes("between")) return "mid";
  if (f === "bath") return v.includes("æ") || v === "ae" ? "US" : v.includes("ɑ") || v.startsWith("a") ? "UK" : "?";
  const one = v.includes("1"), two = v.includes("2");
  return one === two ? "?" : one === britishFirst ? "UK" : "US";
}

// ---- votes ----

const TMP = mkdtempSync(join(tmpdir(), "accent-judge-"));
const padded = new Map<string, string>();
/** The clip with `ms` of silence in front, as 44.1 kHz mono wav. */
function pad(file: string, ms: number): string {
  const key = `${file}|${ms}`;
  const hit = padded.get(key);
  if (hit) return hit;
  const out = join(TMP, `${padded.size}.wav`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-t", String(ms / 1000), "-i", "anullsrc=r=44100:cl=mono", "-i", file,
    "-filter_complex", "[1]aresample=44100,aformat=channel_layouts=mono[b];[0][b]concat=n=2:v=0:a=1", out]);
  padded.set(key, out);
  return out;
}

export interface JudgeOptions { votes?: number; features?: Feature[]; model?: string; conc?: number; /** the first vote's index (for adding votes to an earlier judgement: the padding goes on from there) */ start?: number }

/** Votes on every target word of every item. Items without words get `findWords(text)`. No calibration: use judge(). */
export async function vote(items: Item[], o: JudgeOptions = {}): Promise<ClipVerdict[]> {
  const votes = o.votes ?? 21, start = o.start ?? 0, model = o.model ?? MODEL, feats = o.features ?? FEATURES;
  const out: ClipVerdict[] = items.map((it) => {
    const ws = it.words ?? findWords(it.text);
    return { key: it.key, file: it.file, text: it.text, p: null, words: feats.flatMap((f) => (ws[f] ?? []).map((word) => ({ feature: f, word, votes: [] as Vote[], uk: 0, n: 0, p: 0 }))) };
  });
  const jobs = out.flatMap((c) => c.words.flatMap((w) => Array.from({ length: votes }, (_, k) => ({ c, w, k: start + k }))));
  // pad on this thread first (ffmpeg is synchronous), then ask in parallel
  for (const j of jobs) pad(j.c.file, PAD_MS + 10 * (j.k % 20));
  const anc = { bath: null, r: jobs.some((j) => j.w.feature === "r") ? anchors("r") : null, flap: jobs.some((j) => j.w.feature === "flap") ? anchors("flap") : null };
  const audio = (f: string) => ({ inlineData: { mimeType: "audio/wav", data: readFileSync(f).toString("base64") } });
  await pool(jobs, o.conc ?? 16, async ({ c, w, k }) => {
    const wav = pad(c.file, PAD_MS + 10 * (k % 20));
    const britishFirst = k % 2 === 0;
    const a = anc[w.feature];
    const parts = a
      ? [{ text: "Clip 1:" }, audio(britishFirst ? a.british : a.american), { text: "Clip 2:" }, audio(britishFirst ? a.american : a.british), { text: "Clip 3:" }, audio(wav), { text: ask(w.feature, c.text, w.word) }]
      : [audio(wav), { text: ask(w.feature, c.text, w.word) }];
    let v: Vote = "?";
    try {
      const r = await generate(model, { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 1 } });
      v = classify(w.feature, textOf(r), britishFirst);
    } catch {}
    w.votes.push(v);
  });
  for (const c of out) tally(c);
  return out;
}
/** Recount a clip's words and its British probability (after votes were added). */
export function tally(c: ClipVerdict): ClipVerdict {
  for (const w of c.words) {
    w.n = w.votes.filter((v) => v !== "?").length;
    w.uk = w.votes.filter((v) => v === "UK").length;
    w.p = w.n ? w.uk / w.n : 0;
  }
  c.p = c.words.length ? Math.min(...c.words.map((w) => w.p)) : null;
  return c;
}

// ---- calibration ----

interface Ref { file: string; voice: string; accent: "british" | "american"; text: string; words: Words }

/** Judge the reference clips on these features; `ok` only when each feature separates British from American. */
export async function calibrate(features: Feature[] = FEATURES, o: { votes?: number; model?: string; conc?: number } = {}): Promise<Calibration> {
  const { refs } = JSON.parse(readFileSync(REFS, "utf8")) as { refs: Ref[] };
  const res: FeatureCalibration[] = [];
  await Promise.all(features.map(async (f) => {
    const mine = refs.filter((r) => r.words[f]?.length);
    const items: Item[] = mine.map((r) => ({ key: `${r.accent}:${r.file}`, file: join(dirname(REFS), r.file), text: r.text, words: { [f]: r.words[f] } }));
    for (const it of items) if (!existsSync(it.file)) throw new Error(`reference clip missing: ${it.file}`);
    const clips = await vote(items, { votes: o.votes ?? { bath: 3, r: 4, flap: 4 }[f], features: [f], model: o.model, conc: o.conc });
    const side = (a: "british" | "american") => {
      const ws = clips.filter((c) => c.key.startsWith(a)).flatMap((c) => c.words);
      const uk = ws.reduce((s, w) => s + w.uk, 0), n = ws.reduce((s, w) => s + w.n, 0);
      return { uk, n, share: n ? uk / n : 0, ws };
    };
    const b = side("british"), a = side("american");
    const right = b.ws.filter((w) => w.p >= 0.5).length + a.ws.filter((w) => w.p <= 0.5).length;
    const words = b.ws.length + a.ws.length;
    const ok = b.n > 0 && a.n > 0 && b.share >= CAL.british && a.share <= CAL.american[f] && right / words >= CAL.rightSide;
    res.push({ feature: f, british: { uk: b.uk, n: b.n, share: b.share }, american: { uk: a.uk, n: a.n, share: a.share }, rightSide: right / words, words, ok, clips });
  }));
  res.sort((x, y) => FEATURES.indexOf(x.feature) - FEATURES.indexOf(y.feature));
  return { model: o.model ?? MODEL, ok: res.every((r) => r.ok), features: res };
}

export class CalibrationFailed extends Error {
  constructor(public calibration: Calibration) {
    super(`accent judge calibration failed (${calibration.features.filter((f) => !f.ok).map((f) => f.feature).join(", ")}): refusing to judge`);
  }
}
export const calibrationLine = (c: FeatureCalibration) =>
  `${c.ok ? "✓" : "✗"} ${c.feature.padEnd(4)} British refs ${c.british.uk}/${c.british.n} British (${pct(c.british.share)}, need ≥ ${pct(CAL.british)}) · American refs ${c.american.uk}/${c.american.n} (${pct(c.american.share)}, need ≤ ${pct(CAL.american[c.feature])}) · ${pct(c.rightSide)} of ${c.words} words on the right side`;
const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Calibrate on the features these items need, then judge them. Throws CalibrationFailed if the calibration fails. */
export async function judge(items: Item[], o: JudgeOptions & { calVotes?: number; log?: (s: string) => void } = {}): Promise<{ calibration: Calibration; clips: ClipVerdict[] }> {
  const feats = o.features ?? FEATURES;
  const needed = feats.filter((f) => items.some((it) => (it.words ?? findWords(it.text))[f]?.length));
  const calibration = await calibrate(needed, { votes: o.calVotes, model: o.model, conc: o.conc });
  for (const f of calibration.features) o.log?.(calibrationLine(f));
  if (!calibration.ok) throw new CalibrationFailed(calibration);
  return { calibration, clips: await vote(items, o) };
}

export const verdictLine = (c: ClipVerdict) =>
  `${c.p == null ? "  –  " : pct(c.p).padStart(4) + " "} ${c.key.padEnd(26)} ${c.words.map((w) => `${w.feature} "${w.word}" ${w.uk}/${w.n}${w.votes.some((v) => v === "mid") ? ` (${w.votes.filter((v) => v === "mid").length} between)` : ""}`).join("; ") || "no target words"}`;

// ---- the command line ----

if (import.meta.main) {
  const args = process.argv.slice(2);
  const VALUED = new Set(["--votes", "--features", "--bath", "--r", "--flap", "--json", "--cal-votes", "--model", "--conc", "--text", "--in"]);
  const argOf = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  const list = (k: string) => argOf(k)?.split(",").map((s) => s.trim()).filter(Boolean);
  const pos = args.filter((a, i) => !a.startsWith("--") && !VALUED.has(args[i - 1]));
  const features = (list("--features") as Feature[] | undefined) ?? FEATURES;
  for (const f of features) if (!FEATURES.includes(f)) throw new Error(`unknown feature ${f} (bath, r, flap)`);
  const o = { votes: Number(argOf("--votes") ?? 21), features, model: argOf("--model"), conc: argOf("--conc") ? Number(argOf("--conc")) : undefined, calVotes: argOf("--cal-votes") ? Number(argOf("--cal-votes")) : undefined, log: (s: string) => console.log(s) };
  try {
    if (args.includes("--calibrate-only")) {
      const cal = await calibrate(features, { votes: o.calVotes, model: o.model, conc: o.conc });
      for (const f of cal.features) console.log(calibrationLine(f));
      for (const f of cal.features) for (const c of f.clips) console.log("   ", verdictLine(c));
      if (argOf("--json")) writeFileSync(argOf("--json")!, JSON.stringify(cal, null, 1));
      process.exit(cal.ok ? 0 : 2);
    }
    let items: Item[];
    if (argOf("--in")) items = JSON.parse(readFileSync(argOf("--in")!, "utf8"));
    else {
      const { LINES } = await import("../src/content/lines");
      items = pos.map((p) => {
        const isFile = /\.(mp3|wav|m4a|ogg)$/i.test(p);
        const line = isFile ? undefined : LINES.find((l) => l.id === p);
        if (!isFile && !line) throw new Error(`no line ${p} (give a line id or an audio file)`);
        const file = isFile ? resolve(p) : join(REPO, `public/a/l/${p}.mp3`);
        const text = argOf("--text") ?? line?.text;
        if (!text) throw new Error(`${p}: give the clip's words with --text`);
        return { key: isFile ? p : line!.id, file, text };
      });
      const named = Object.fromEntries(FEATURES.map((f) => [f, list(`--${f}`)]).filter(([, v]) => v)) as Words;
      if (Object.keys(named).length) for (const it of items) it.words = { ...findWords(it.text), ...named };
    }
    if (!items.length) throw new Error("nothing to judge: give line ids, audio files with --text, or --in items.json");
    const { calibration, clips } = await judge(items, o);
    console.log(`\n${clips.length} clips, ${o.votes} votes a word (${calibration.model}); British probability, the lowest word's:`);
    for (const c of clips) console.log(verdictLine(c));
    if (argOf("--json")) writeFileSync(argOf("--json")!, JSON.stringify({ model: calibration.model, votes: o.votes, calibration, clips }, null, 1));
  } catch (e) {
    if (e instanceof CalibrationFailed) {
      console.log(`\n✗ ${e.message}`);
      for (const f of e.calibration.features) for (const c of f.clips) console.log("   ", verdictLine(c));
      if (argOf("--json")) writeFileSync(argOf("--json")!, JSON.stringify({ refused: true, calibration: e.calibration }, null, 1));
      process.exit(2);
    }
    throw e;
  }
}
