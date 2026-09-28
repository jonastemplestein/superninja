// Slow words, sound by sound, the Sounds~Write way ("c · a · t"): public/a/x/<word>.mp3, composed from the QA'd pure
// sounds the game plays on their own (public/a/p/<sound>.mp3, so the voice is the same), with a little gap between them.
// They replace the "elastic" stretched TTS words (scripts/gen-stretch.ts: "mmmaaat"), which ran the sounds together
// (Jonas, 27 Sep 2026: "read the slow way to say a word with actual little gaps between the sounds. It is too smooth").
// The held first sounds in public/a/o/ (gen-stretch.ts --onset) stay as they are.
//
//   bun scripts/gen-slow-words.ts                every word with a segmentation → public/a/x/ + src/content/slow-times.gen.ts
//   bun scripts/gen-slow-words.ts --only a,b     just those words (slow-times.gen.ts keeps every other word's entry)
//   bun scripts/gen-slow-words.ts --audition 180,250,320 --only a,b --out <dir>    one clip per gap in <dir>/<gap>/
//   bun scripts/gen-slow-words.ts --measure      measure public/a/x: gaps between sounds against the word's sounds,
//                                                length, loudness, and the onsets against SLOW_TIMES
//   bun scripts/gen-slow-words.ts --sounds       each pure sound as trimmed and levelled (length, loudness, gain)
//   ... --from <dir>                             take <dir>/<sound>.mp3 where it exists instead of public/a/p (to
//                                                audition candidate sounds, with --audition)
//
// Words: src/content/phonics.ts WORDS, then the unit word files (src/content/units/*.ts), then ORAL_WORDS with `segs`,
// then the compound bank's new words (compounds.ts NEW_WORDS), in that order (the first segmentation of a word wins; on
// 27 Sep none disagreed). No TTS and no key: it only splices.
//
// Each sound: leading and trailing silence trimmed (so the gaps are exact), a held consonant cut to HOLD_MS and a short
// vowel to SHORT_MS, levelled to the others, a 5 ms fade in and a 12 ms fade out; a voiced stop in VOICE_BAR gets a
// voiced closure before its release. GAP_MS of digital silence between sounds, LEAD_MS before the first and TAIL_MS
// after the last. The whole word is then brought to SPEECH_LUFS (-16, like every other speech clip) under a -1.5 dBTP
// true-peak limiter (4x oversampled and look-ahead, with no delay, so SLOW_TIMES stays exact), encoded like finishAudio
// (44.1 kHz mono, LAME -q:a 4), and made again with a lower ceiling if the MP3's true peak is still over -1.5 dBTP.
// --measure checks both. A slow word is mostly silence, so at -16 LUFS its sounds peak over the ceiling, and the
// limiter turns the peakiest down: a stop's burst or a short vowel by 1.5–6 dB (measured on 57 words, 27 Sep), a long
// vowel, a fricative or a nasal hardly at all. In 897 of the 997 words it holds the gain steady through each sound; in
// the other 100 (short sounds, like "kick") it also takes the tops off the loudest voice pulses (LIMITER). Until 27 Sep
// the word was written as 16-bit before the limiter, which clipped every sound levelled over full scale, and 76 words
// ended over -1 dBTP.
import { execFile, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename, dirname } from "node:path";
import { promisify } from "node:util";
import { GRAPHEMES, ORAL_WORDS, WORDS, type PhonemeId } from "../src/content/phonics";
import { NEW_WORDS } from "../src/content/compounds";

const ROOT = join(import.meta.dir, "..");
const SR = 44100;
/** The gap between sounds. 180, 250 and 320 ms were auditioned on eight words (docs/DECISIONS.md, 27 Sep): 250 ms. */
export const GAP_MS = 250;
const LEAD_MS = 30;
const TAIL_MS = 60;
const FADE_IN_MS = 5;
const FADE_OUT_MS = 12;
/** Trimming: a sound is every run of frames within 40 dB of its loudest frame, from the first run that reaches within
 *  20 dB of it to the last (a stray click in the lead-in, as in e.mp3's first 0.47 s, is not a run that reaches it). */
const EDGE_DB = 40;
const BODY_DB = 20;
/** A held consonant (/s/, /m/, /l/...) is cut to HOLD_MS with a HOLD_FADE_MS fade: on their own they are held for up
 *  to 0.8 s, which in a word makes "s · t · a · m · p" nearly 3 s long, a hum demonstration rather than a word. The
 *  sound doesn't change as it's held, so a shorter one is the same sound. Vowels and the glides /w/ /y/ keep their full
 *  length (a diphthong's glide is the sound, and /w/ is loudest at its end). */
const HOLD_MS = Number(process.env.HOLD_MS ?? 450);
const HOLD_FADE_MS = 60;
const HELD = new Set<PhonemeId>(["m", "n", "s", "f", "v", "z", "l", "r", "sh", "th", "dh", "ng", "zh"]);
/** A short vowel is cut to SHORT_MS with a SHORT_FADE_MS fade, so it never drifts towards a long one. In British
 *  English length is what tells /o/ (hot) from /or/ (fork) and /u/ (cup) from /ar/ (pass): on 27 Sep the stretched
 *  0.41 s /o/ and /u/ made hot "ought", dog "dork" and bus "pass". */
const SHORT_MS = Number(process.env.SHORT_MS ?? 240);
const SHORT_FADE_MS = 40;
const SHORT = new Set<PhonemeId>(["a", "e", "i", "o", "u"]);
/** A voiced stop (/g/, /b/) gets a voiced closure: VOICE_BAR_MS of its own voicing, low-passed to the murmur that
 *  comes through the cheeks while the tongue or lips are closed, VOICE_BAR_DB under it, just before the release. Said
 *  alone, a voiced stop's release is short-lag like /k/'s or /p/'s, and the voicing before it is what says /g/ (27 Sep:
 *  log was heard as "lock"). Padded blind judge, 6 votes each: /g/ as a slow word plays it was heard as /k/ 6 of 6,
 *  with a 30–60 ms bar at -14 dB as /g/ 6 of 6 (at -8 dB, 3 of 6). In 51 slow words, 3 votes each, the bar took g→k
 *  from 2 of 57 to 0 and b→p from 5 of 48 to 0. /d/ is not touched: Jonas's ear decides it (he rejected a rebuilt
 *  /d/ as "duh"). */
const VOICE_BAR_MS = Number(process.env.VOICE_BAR_MS ?? 45);
const VOICE_BAR_DB = Number(process.env.VOICE_BAR_DB ?? -14);
const VOICE_BAR = new Set<PhonemeId>((process.env.VOICE_BAR ?? "g,b").split(",").filter(Boolean) as PhonemeId[]);
/** --from <dir>: take <dir>/<sound>.mp3 where it exists instead of public/a/p (to audition candidate sounds). */
const FROM = (() => { const i = process.argv.indexOf("--from"); return i >= 0 ? process.argv[i + 1] : undefined; })();

/** scripts/tts.ts SPEECH_LUFS (tts.ts itself can't be imported without the Gemini key). */
const SPEECH_LUFS = -16;
const fid = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_"); // as src/engine/audio.ts urls

// ------------------------------------------------------------------------------------------------ the words
export function slowWords(): Map<string, PhonemeId[]> {
  const out = new Map<string, PhonemeId[]>();
  for (const w of WORDS) out.set(w.text, w.segs.map((s) => s.p));
  const dir = join(ROOT, "src/content/units");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
    const m = require(join(dir, f)) as { words?: readonly { text: string; segs: string }[] };
    for (const w of m.words ?? []) {
      if (out.has(w.text) || !w.segs) continue;
      // as parseSegs in src/core/content/curriculum.ts: "g", "g=p", optionally ":gap"
      out.set(w.text, w.segs.split(".").map((part) => {
        const [, g, p] = part.match(/^([^=:]+)(?:=([^:]+))?(?::(\d+))?$/) ?? [];
        if (!g) throw new Error(`${w.text}: bad segment ${part}`);
        return (p ?? GRAPHEMES[g]) as PhonemeId;
      }));
    }
  }
  for (const [text, o] of Object.entries(ORAL_WORDS)) if (o.segs && !out.has(text)) out.set(text, [...o.segs]);
  // the read slider's compound bank (src/content/compounds.ts NEW_WORDS, not yet in ORAL_WORDS; its gag pictures have
  // no slow word). Until 28 Sep playtest/read-slider/audio/slow.ts made these and their onsets went to NEW_SLOW_TIMES;
  // ReadSlider reads SLOW_TIMES first, so they are timed here with the rest (the Erinome pure sounds, 28 Sep).
  for (const [text, o] of Object.entries(NEW_WORDS)) if (!o.gag && !out.has(text)) out.set(text, [...o.segs]);
  return out;
}

// ------------------------------------------------------------------------------------------------ audio
const DECODE = (file: string) => ["-loglevel", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"];
const toF32 = (raw: Buffer) => new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
export function decode(file: string): Float32Array {
  return toF32(execFileSync("ffmpeg", DECODE(file), { maxBuffer: 1 << 28 }));
}
const ffmpeg = (args: string[]) => promisify(execFile)("ffmpeg", args, { maxBuffer: 1 << 28, encoding: "buffer" });
async function decodeAsync(file: string): Promise<Float32Array> {
  return toF32((await ffmpeg(DECODE(file))).stdout);
}
/** Runs fn over items, `n` at a time (the work is mostly waiting on ffmpeg). */
async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (next < items.length) await fn(items[next++]); }));
}
const JOBS = Number(process.env.JOBS ?? 8);
/** A 32-bit float WAV, so nothing over full scale is clipped before the limiter. */
function writeWav(file: string, x: Float32Array) {
  const pcm = Buffer.from(x.buffer, x.byteOffset, x.byteLength);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  writeFileSync(file, Buffer.concat([h, pcm]));
}
/** RMS level (dBFS) of 5 ms windows every 1 ms. */
function envelope(x: Float32Array, winMs = 5, hopMs = 1): Float64Array {
  const win = Math.round((winMs / 1000) * SR), hop = Math.round((hopMs / 1000) * SR);
  const n = Math.max(1, Math.floor((x.length - win) / hop) + 1);
  const env = new Float64Array(n);
  for (let f = 0; f < n; f++) {
    let s = 0;
    for (let k = f * hop; k < f * hop + win && k < x.length; k++) s += x[k] * x[k];
    env[f] = 10 * Math.log10(s / win + 1e-12);
  }
  return env;
}
/** [start, end) samples of the sound itself (see EDGE_DB / BODY_DB). */
function soundSpan(x: Float32Array): [number, number] {
  const env = envelope(x), hop = SR / 1000, win = 5 * hop;
  const max = Math.max(...env);
  const runs: [number, number, number][] = []; // start frame, end frame (inclusive), loudest
  for (let f = 0; f < env.length; f++) {
    if (env[f] < max - EDGE_DB) continue;
    const a = f;
    let top = -Infinity;
    while (f < env.length && env[f] >= max - EDGE_DB) top = Math.max(top, env[f++]);
    runs.push([a, f - 1, top]);
  }
  const body = runs.filter((r) => r[2] >= max - BODY_DB);
  return [Math.round(body[0][0] * hop), Math.min(x.length, Math.round(body.at(-1)![1] * hop + win))];
}
function fade(x: Float32Array, inMs: number, outMs: number) {
  const a = Math.min(x.length, Math.round((inMs / 1000) * SR)), b = Math.min(x.length, Math.round((outMs / 1000) * SR));
  for (let i = 0; i < a; i++) x[i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / a);
  for (let i = 0; i < b; i++) x[x.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / b);
}
/** K-weighting (ITU-R BS.1770: a +4 dB shelf above ~1.7 kHz and a 38 Hz high-pass), the two filters worked out for
 *  44.1 kHz from their analogue parameters, as pyloudnorm does. */
function kWeight(x: Float32Array): Float64Array {
  const run = (b: number[], a: number[], inp: ArrayLike<number>) => {
    const out = new Float64Array(inp.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < inp.length; i++) {
      const y = (b[0] * inp[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2) / a[0];
      x2 = x1; x1 = inp[i]; y2 = y1; y1 = y;
      out[i] = y;
    }
    return out;
  };
  let w0 = (2 * Math.PI * 1681.9744509555319) / SR, q = 0.7071752369554193, A = Math.pow(10, 3.99984385397 / 40);
  let al = Math.sin(w0) / (2 * q), c = Math.cos(w0), r = 2 * Math.sqrt(A) * al;
  const shelf = run(
    [A * (A + 1 + (A - 1) * c + r), -2 * A * (A - 1 + (A + 1) * c), A * (A + 1 + (A - 1) * c - r)],
    [A + 1 - (A - 1) * c + r, 2 * (A - 1 - (A + 1) * c), A + 1 - (A - 1) * c - r], x);
  w0 = (2 * Math.PI * 38.13547087613982) / SR; q = 0.5003270373253953; al = Math.sin(w0) / (2 * q); c = Math.cos(w0);
  return run([(1 + c) / 2, -(1 + c), (1 + c) / 2], [1 + al, -2 * c, 1 - al], shelf);
}
/** Integrated loudness (ITU-R BS.1770-4: 400 ms blocks every 100 ms, gated at -70 LUFS and at 10 LU under the mean of
 *  the rest); -70 if too short. It reads 0.05–0.3 LU under ffmpeg's ebur128 (60 slow words), so finish() corrects once. */
export function integratedLufs(x: Float32Array): number {
  const k = kWeight(x), B = Math.round(0.4 * SR), H = Math.round(0.1 * SR);
  const cs = new Float64Array(k.length + 1);
  for (let i = 0; i < k.length; i++) cs[i + 1] = cs[i] + k[i] * k[i];
  const L = (q: number) => -0.691 + 10 * Math.log10(q + 1e-20);
  const blocks: number[] = [];
  for (let a = 0; a + B <= k.length; a += H) blocks.push((cs[a + B] - cs[a]) / B);
  const mean = (q: number[]) => q.reduce((m, v) => m + v, 0) / q.length;
  const loud = blocks.filter((q) => L(q) > -70);
  if (!loud.length) return -70;
  const rel = L(mean(loud)) - 10;
  return L(mean(loud.filter((q) => L(q) > rel)));
}
/** How loud a sound is heard, alone: the LUFS of its loudest EVENT_MS (a shorter sound counts silence up to EVENT_MS).
 *  The ear sums loudness over about 200 ms, so a 40 ms /t/ burst at a vowel's level is heard as quieter than the vowel,
 *  and a plain loudness meter (LUFS while it sounds) would make every stop too loud or every vowel too quiet. */
const EVENT_MS = 200;
function eventLufs(x: Float32Array): number {
  const k = kWeight(x), n = Math.round((EVENT_MS / 1000) * SR);
  let s = 0, best = 0;
  for (let i = 0; i < k.length; i++) {
    s += k[i] * k[i];
    if (i >= n) s -= k[i - n] * k[i - n];
    best = Math.max(best, s);
  }
  return -0.691 + 10 * Math.log10(best / n + 1e-15);
}
const peakDb = (x: Float32Array) => 20 * Math.log10(x.reduce((m, v) => Math.max(m, Math.abs(v)), 1e-9));
const gainBy = (x: Float32Array, db: number) => x.map((v) => v * Math.pow(10, db / 20));
const rms = (x: ArrayLike<number>, a = 0, b = x.length) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };

/** A 2nd-order Butterworth low-pass (RBJ), run forwards and then backwards so it adds no delay. */
function lowpass(x: Float32Array, hz: number): Float32Array {
  const w0 = (2 * Math.PI * hz) / SR, al = Math.sin(w0) / Math.SQRT2, c = Math.cos(w0);
  const b0 = (1 - c) / 2 / (1 + al), b1 = (1 - c) / (1 + al), a1 = (-2 * c) / (1 + al), a2 = (1 - al) / (1 + al);
  const pass = (inp: Float32Array) => {
    const out = new Float32Array(inp.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < inp.length; i++) {
      const y = b0 * inp[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = inp[i]; y2 = y1; y1 = y; out[i] = y;
    }
    return out;
  };
  return pass(pass(x).reverse()).reverse();
}
/** The stop with a voiced closure in front (see VOICE_BAR_MS): the stretch of its release where the low band (< 400 Hz)
 *  is loudest, low-passed, reversed so its pitch runs into the release's, faded in, and set `db` under that stretch. */
function withVoiceBar(x: Float32Array, ms: number, db: number): Float32Array {
  const lo = lowpass(lowpass(x, 400), 400);
  const env = envelope(lo);
  const max = Math.max(...env);
  let s = env.indexOf(max);
  while (s > 0 && env[s - 1] >= max - 6) s--;
  const start = Math.round(((s + 3) / 1000) * SR);
  const n = Math.min(Math.round((ms / 1000) * SR), lo.length - start);
  const bar = lo.slice(start, start + n).reverse();
  const k = (rms(x, start, start + n) * Math.pow(10, db / 20)) / (rms(bar) || 1);
  for (let i = 0; i < n; i++) bar[i] *= k;
  fade(bar, 15, 3);
  const y = new Float32Array(n + x.length);
  y.set(bar, 0);
  y.set(x, n);
  return y;
}

/** True peak as BS.1770 reads it: each sample and the three points between it and the next, 4× oversampled with a
 *  Hann-windowed sinc (8 taps each side). */
const TP_TAPS = [1, 2, 3].map((k) => {
  const t: number[] = [];
  for (let j = -7; j <= 8; j++) {
    const d = k / 4 - j, w = 0.5 + 0.5 * Math.cos((Math.PI * d) / 8.5);
    t.push((d === 0 ? 1 : Math.sin(Math.PI * d) / (Math.PI * d)) * w);
  }
  return t;
});
function truePeaks(x: Float32Array): Float32Array {
  const tp = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    let m = Math.abs(x[i]);
    for (const taps of TP_TAPS) {
      let v = 0;
      for (let j = -7; j <= 8; j++) { const n = i + j; if (n >= 0 && n < x.length) v += x[n] * taps[j + 7]; }
      m = Math.max(m, Math.abs(v));
    }
    tp[i] = m;
  }
  // the points between x[i-1] and x[i] belong to both samples
  for (let i = x.length - 1; i > 0; i--) tp[i] = Math.max(tp[i], tp[i - 1]);
  return tp;
}
/** A look-ahead true-peak limiter with no delay (it works on the whole clip, so SLOW_TIMES stays exact): the gain
 *  falls over `attackMs` before a peak over `ceilDb` and comes back over `releaseMs` after it. The gain at each sample
 *  is the running minimum of the gain each peak needs, over [i − release, i + attack], averaged over ±attack: every
 *  sample within ±attack of a peak has a minimum at least that low, so the average is too (release ≥ attack). */
function limitTruePeak(x: Float32Array, ceilDb: number, [attackMs, releaseMs] = LIMITER[0], tp = truePeaks(x)): Float32Array {
  const ceil = Math.pow(10, ceilDb / 20), n = x.length;
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) need[i] = tp[i] > ceil ? ceil / tp[i] : 1;
  const A = Math.max(1, Math.round((attackMs / 1000) * SR)), R = Math.max(A, Math.round((releaseMs / 1000) * SR));
  // running minimum of need[i - R .. i + A] (a monotonic queue)
  const m = new Float32Array(n), q = new Int32Array(n);
  let h = 0, t = 0, next = 0;
  for (let i = 0; i < n; i++) {
    for (; next <= Math.min(n - 1, i + A); next++) {
      while (t > h && need[q[t - 1]] >= need[next]) t--;
      q[t++] = next;
    }
    while (q[h] < i - R) h++;
    m[i] = need[q[h]];
  }
  // averaged over ±A (1 beyond either end)
  const at = (j: number) => (j < 0 || j >= n ? 1 : m[j]);
  const y = new Float32Array(n);
  let s = 0;
  for (let j = -A; j <= A; j++) s += at(j);
  for (let i = 0; i < n; i++) {
    y[i] = x[i] * (s / (2 * A + 1));
    s += at(i + A + 1) - at(i - A);
  }
  return y;
}

// ------------------------------------------------------------------------------------------------ the sounds
/** Level matching. Every sound is brought to the same loudness as heard (eventLufs): the median of the vowels' and
 *  held consonants', so they hardly move. A stop's burst (/t/, /k/, /p/...) goes STOP_UNDER below it: a teacher's /t/ is
 *  a crisp, light tap, and a burst as loud as the vowel after it is the hiccup. No sound moves more than MAX_MOVE. */
const STOP_UNDER = Number(process.env.STOP_UNDER ?? 2);
const MAX_MOVE = 8;
const STOPS = new Set<PhonemeId>(["p", "b", "t", "d", "k", "g", "ch", "j", "ks", "kw"]);
type Sound = { p: PhonemeId; x: Float32Array; heard: number; gain: number; from: number };
const sounds = new Map<PhonemeId, Sound>();
let target = NaN;
function prepare(ps: Iterable<PhonemeId>) {
  const raw: { p: PhonemeId; x: Float32Array; heard: number; from: number }[] = [];
  for (const p of ps) {
    if (sounds.has(p)) continue;
    const alt = FROM && join(FROM, `${p}.mp3`);
    const src = decode(alt && existsSync(alt) ? alt : join(ROOT, `public/a/p/${p}.mp3`));
    const [a, b] = soundSpan(src);
    const cap = Math.round(((HELD.has(p) ? HOLD_MS : SHORT.has(p) ? SHORT_MS : Infinity) / 1000) * SR);
    const cut = b - a > cap;
    let x: Float32Array = src.slice(a, cut ? a + cap : b);
    fade(x, FADE_IN_MS, cut ? (HELD.has(p) ? HOLD_FADE_MS : SHORT_FADE_MS) : FADE_OUT_MS);
    if (VOICE_BAR_MS > 0 && VOICE_BAR.has(p)) x = withVoiceBar(x, VOICE_BAR_MS, VOICE_BAR_DB);
    raw.push({ p, x, heard: eventLufs(x), from: src.length / SR });
  }
  if (!Number.isFinite(target)) {
    const held = raw.filter((r) => !STOPS.has(r.p)).map((r) => r.heard).sort((a, b) => a - b);
    target = held[Math.floor(held.length / 2)];
  }
  for (const r of raw) {
    const want = STOPS.has(r.p) ? target - STOP_UNDER : target;
    const gain = Math.max(-MAX_MOVE, Math.min(MAX_MOVE, want - r.heard));
    sounds.set(r.p, { ...r, x: gainBy(r.x, gain), gain });
  }
}
const ALL_SOUNDS = readdirSync(join(ROOT, "public/a/p")).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4) as PhonemeId);
function sound(p: PhonemeId): Sound {
  if (!sounds.has(p)) prepare(ALL_SOUNDS);
  return sounds.get(p)!;
}

// ------------------------------------------------------------------------------------------------ a word
/** The slow word's samples and each sound's onset (s). */
export function compose(ps: PhonemeId[], gapMs: number): { y: Float32Array; onsets: number[] } {
  const parts = ps.map((p) => sound(p).x);
  const gap = Math.round((gapMs / 1000) * SR), lead = Math.round((LEAD_MS / 1000) * SR), tail = Math.round((TAIL_MS / 1000) * SR);
  const n = lead + parts.reduce((s, x) => s + x.length, 0) + gap * (parts.length - 1) + tail;
  const y = new Float32Array(n);
  const onsets: number[] = [];
  let at = lead;
  for (const [i, x] of parts.entries()) {
    onsets.push(Math.round((at / SR) * 1000) / 1000);
    y.set(x, at);
    at += x.length + (i < parts.length - 1 ? gap : 0);
  }
  return { y, onsets };
}
/** The ceiling for every slow word's true peak (dBTP), as finishAudio's for every other speech clip. */
const TP_CEIL_DB = -1.5;
/** The limiter's [attack, release] (ms), gentlest first. A slow word is mostly silence, so to be -16 LUFS like a plain
 *  word its sounds must be louder than a plain word's, and their peaks go over the ceiling. The gentle setting holds the
 *  gain steady through a sound (it only turns it down); if that can't reach -16 LUFS ± LUFS_OK (a word of short
 *  sounds, like "kick"), the next one lets the gain come back between the voice's pulses, which takes the tops off the
 *  loudest ones, smoothly (not the hard clipping of the old 16-bit write). */
const LIMITER: [number, number][] = [[2, 20], [1, 5], [0.5, 1.5], [0.25, 0.5]];
const LUFS_OK = 0.5;
/** To SPEECH_LUFS with its true peak under TP_CEIL_DB, then encoded (44.1 kHz mono, LAME -q:a 4). The limiter starts
 *  0.5 dB under the ceiling; if the MP3 still overshoots it (the encoder adds a little to a burst), the ceiling comes
 *  down by the overshoot and the word is made again. The loudness is measured after the limiter. Returns the encoded
 *  clip's loudness and true peak, and which LIMITER setting it took. */
export async function finish(y: Float32Array, out: string, dir: string): Promise<{ lufs: number; truePeak: number; limiter: number; gain: number }> {
  const tpY = truePeaks(y);
  let ceil = TP_CEIL_DB - 0.5;
  /** The gain and LIMITER setting that bring the word to `want` (integratedLufs), gentlest setting first. */
  const search = (want: number) => {
    let limiter = 0, lufs = NaN, z = y, used = NaN;
    for (; limiter < LIMITER.length; limiter++) {
      const last = limiter === LIMITER.length - 1;
      let gain = want - integratedLufs(y), was = NaN;
      for (let pass = 0; pass < 8; pass++) {
        const before = lufs, k = Math.pow(10, gain / 20);
        z = limitTruePeak(gainBy(y, gain), ceil, LIMITER[limiter], tpY.map((v) => v * k));
        used = gain;
        lufs = integratedLufs(z);
        const miss = want - lufs;
        if (Math.abs(miss) < 0.05) break;
        // the limiter is holding the word down: less than half of the last step came through
        if (!last && pass > 0 && miss > LUFS_OK && lufs - before < 0.5 * (gain - was)) break;
        was = gain;
        gain += miss;
      }
      if (Math.abs(want - lufs) <= LUFS_OK) break;
    }
    return { z, lufs, gain: used, limiter: Math.min(limiter, LIMITER.length - 1) };
  };
  // one scratch WAV for each word being made at the same time, reused
  const wav = SCRATCH.get(dir)?.pop() ?? join(dir, `word${scratchN++}.wav`);
  for (let round = 0; ; round++) {
    // integratedLufs reads up to 0.3 LU under ffmpeg's meter, the one --measure and the checks use: one correction
    let r = search(SPEECH_LUFS);
    writeWav(wav, r.z);
    const off = (await loudness(wav)).lufs - r.lufs;
    if (Math.abs(r.lufs + off - SPEECH_LUFS) > 0.1) { r = search(SPEECH_LUFS - off); writeWav(wav, r.z); }
    // encoded beside the target as a dotfile and renamed over it, so the game never sees a half-written clip
    const tmpOut = join(dirname(out), `.${basename(out, ".mp3")}.tmp.mp3`);
    await ffmpeg(["-loglevel", "error", "-y", "-i", wav, "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "4", tmpOut]);
    const m = await loudness(tmpOut);
    if (m.truePeak <= TP_CEIL_DB || round === 5) {
      renameSync(tmpOut, out);
      SCRATCH.set(dir, [...(SCRATCH.get(dir) ?? []), wav]);
      return { ...m, limiter: r.limiter, gain: r.gain };
    }
    ceil -= m.truePeak - TP_CEIL_DB + 0.1;
  }
}
const SCRATCH = new Map<string, string[]>();
/** Write a text file via a temp file and a rename (the dev server never reads half of it). */
function writeAtomic(file: string, text: string) {
  writeFileSync(`${file}.tmp`, text);
  renameSync(`${file}.tmp`, file);
}
let scratchN = 0;
/** A clip's integrated loudness (LUFS) and true peak (dBTP), from ffmpeg's EBU R128 meter. */
async function loudness(file: string): Promise<{ lufs: number; truePeak: number }> {
  const txt = String((await ffmpeg(["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=framelog=quiet:peak=true", "-f", "null", "-"])).stderr);
  const lufs = parseFloat(txt.match(/I:\s+(-?[\d.]+) LUFS/g)?.at(-1)?.replace(/[^-\d.]/g, "") ?? "NaN");
  const truePeak = parseFloat(txt.match(/Peak:\s+(-?[\d.inf]+) dBFS/g)?.at(-1)?.replace(/[^-\d.]/g, "") ?? "NaN");
  return { lufs, truePeak };
}

// ------------------------------------------------------------------------------------------------ measuring
/** The silent runs inside a clip (≥ minMs under -50 dBFS, not at either end): the gaps between its sounds. */
export async function measureClip(file: string, minMs: number) {
  const x = await decodeAsync(file);
  const env = envelope(x, 10, 1);
  const quiet = -50;
  const gaps: { start: number; end: number }[] = [];
  let first = env.findIndex((v) => v >= quiet), last = env.length - 1;
  while (last > 0 && env[last] < quiet) last--;
  for (let f = first; f <= last; f++) {
    if (env[f] >= quiet) continue;
    const a = f;
    while (f <= last && env[f] < quiet) f++;
    // frame f is the 10 ms from f ms: quiet from the sound's last loud sample, loud a few ms into the next sound
    if (f - a >= minMs) gaps.push({ start: a / 1000, end: (f + 5) / 1000 });
  }
  first = Math.max(0, first);
  const { lufs, truePeak } = await loudness(file);
  return { dur: x.length / SR, lufs, truePeak, gaps, soundStart: (first + 5) / 1000 };
}

// ------------------------------------------------------------------------------------------------ main
if (import.meta.main) {
  const arg = (k: string) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
  const only = arg("--only")?.split(",").filter(Boolean);
  const dir = mkdtempSync(join(tmpdir(), "slow-"));
  const words = slowWords();
  const list = only ?? [...words.keys()];
  for (const w of list) if (!words.has(w)) throw new Error(`${w}: no segmentation in the content`);

  if (process.argv.includes("--sounds")) {
    const used = new Set([...words.values()].flat());
    for (const p of [...ALL_SOUNDS].sort()) {
      const s = sound(p);
      console.log(`${p.padEnd(5)} ${(s.x.length / SR).toFixed(3)} s of ${s.from.toFixed(3)} s  heard ${s.heard.toFixed(1)} LUFS  gain ${s.gain >= 0 ? "+" : ""}${s.gain.toFixed(1)} dB  peak ${peakDb(s.x).toFixed(1)} dBFS${used.has(p) ? "" : "  (in no word)"}`);
    }
    console.log(`target ${target.toFixed(1)} LUFS as heard (stops ${STOP_UNDER} dB under)`);
  } else if (process.argv.includes("--audition")) {
    const gaps = arg("--audition")!.split(",").map(Number);
    const out = arg("--out") ?? join(ROOT, "assets-src/tmp/slow-audition");
    for (const g of gaps) {
      mkdirSync(join(out, String(g)), { recursive: true });
      await pool(list, JOBS, async (w) => { await finish(compose(words.get(w)!, g).y, join(out, String(g), `${fid(w)}.mp3`), dir); });
    }
    console.log(`${list.length} words × ${gaps.length} gaps → ${out}`);
  } else if (process.argv.includes("--measure")) {
    const { SLOW_TIMES } = await import("../src/content/slow-times.gen");
    const bad: string[] = [];
    const rows: string[] = [];
    await pool(list, JOBS, async (w) => {
      const f = join(ROOT, `public/a/x/${fid(w)}.mp3`);
      if (!existsSync(f)) { bad.push(`${w}: missing`); return; }
      const m = await measureClip(f, Math.round(GAP_MS * 0.6));
      const n = words.get(w)!.length;
      const want = SLOW_TIMES[w] ?? [];
      // each gap's end is the next sound's onset
      const got = [m.soundStart, ...m.gaps.map((g) => g.end)];
      const drift = want.length === got.length ? Math.max(...want.map((t, i) => Math.abs(t - got[i]))) : NaN;
      const g = m.gaps.map((x) => Math.round((x.end - x.start) * 1000));
      rows.push([w, n, m.gaps.length, g.length ? Math.min(...g) : "", g.length ? Math.max(...g) : "", m.dur.toFixed(3), m.lufs, m.truePeak, Number.isFinite(drift) ? Math.round(drift * 1000) : "", m.gaps.length === n - 1 ? "ok" : "GAPS"].join("\t"));
      if (m.gaps.length !== n - 1) bad.push(`${w}: ${m.gaps.length} gaps for ${n} sounds`);
      if (Math.abs(m.lufs - SPEECH_LUFS) > 1) bad.push(`${w}: ${m.lufs} LUFS`);
      if (m.truePeak > TP_CEIL_DB) bad.push(`${w}: true peak ${m.truePeak} dBTP`);
      if (drift > 0.03) bad.push(`${w}: an onset ${Math.round(drift * 1000)} ms from SLOW_TIMES`);
    });
    rows.sort();
    const tsv = join(ROOT, "assets-src/tmp/slow-words-measure.tsv");
    mkdirSync(join(ROOT, "assets-src/tmp"), { recursive: true });
    writeFileSync(tsv, "word\tsounds\tgaps\tgap_min_ms\tgap_max_ms\tlength_s\tlufs\ttrue_peak\tonset_drift_ms\tcheck\n" + rows.join("\n") + "\n");
    console.log(`${list.length} clips measured → ${tsv}`);
    console.log(bad.length ? `Problems:\n${bad.join("\n")}` : `Every clip has one gap fewer than its sounds, -16 ±1 LUFS, a true peak under ${TP_CEIL_DB} dBTP and its onsets within 30 ms of SLOW_TIMES`);
  } else {
    mkdirSync(join(ROOT, "public/a/x"), { recursive: true });
    const times: Record<string, number[]> = {};
    const file = join(ROOT, "src/content/slow-times.gen.ts");
    if (only && existsSync(file)) Object.assign(times, (await import("../src/content/slow-times.gen")).SLOW_TIMES);
    let done = 0;
    const settings = LIMITER.map(() => 0);
    let over = 0;
    await pool(list, JOBS, async (w) => {
      const { y, onsets } = compose(words.get(w)!, GAP_MS);
      const r = await finish(y, join(ROOT, `public/a/x/${fid(w)}.mp3`), dir);
      settings[r.limiter]++;
      if (r.truePeak > TP_CEIL_DB) over++;
      times[w] = onsets;
      if (++done % 100 === 0) console.log(done, "/", list.length);
    });
    console.log(`limiter settings ${LIMITER.map((l, i) => `${l.join("/")} ms: ${settings[i]}`).join(", ")}; ${over} over ${TP_CEIL_DB} dBTP`);
    const keys = Object.keys(times).sort();
    const key = (k: string) => (/^[a-z_$][a-z0-9_$]*$/i.test(k) ? k : JSON.stringify(k));
    writeAtomic(file,
      `// Generated by scripts/gen-slow-words.ts: don't edit. Every slow word (public/a/x/<word>.mp3: its sounds said one by one,\n` +
      `// ${GAP_MS} ms apart) and the time, in seconds from the clip's start, at which each of its sounds starts, one per sound in\n` +
      `// the word's segs order (WORD_BY_TEXT, else units/*.ts, else ORAL_WORDS, else compounds.ts NEW_WORDS). Light sound i's card\n` +
      `// or button at SLOW_TIMES[w][i] after the clip starts (onClip's \`start\` for "stretch:<w>"); it sounds until SLOW_GAP_MS\n` +
      `// before the next onset.\n` +
      `export const SLOW_GAP_MS = ${GAP_MS};\n` +
      `export const SLOW_TIMES: Record<string, number[]> = {\n` +
      keys.map((k) => `  ${key(k)}: [${times[k].join(", ")}],`).join("\n") +
      `\n};\n`);
    console.log(`${list.length} slow words → public/a/x/, ${keys.length} in src/content/slow-times.gen.ts`);
  }
}
