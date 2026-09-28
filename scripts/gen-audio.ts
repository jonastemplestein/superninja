// Generate all speech: words, special words, lines, story pages. Each clip is judged; bad takes are retried.
// Usage: bun scripts/gen-audio.ts [words|lines|stories]...  (skips existing files; --force to redo)
//   --only id,id | --only-file ids.txt   lines: just these line ids (with --force, only these are redone)
//   --takes N                            lines: at most N takes per line (default 4; a line that is only too fast gets
//                                        up to 2N)
//   --lead-takes N                       lead-ins: at most N takes while the only fault is a falling tail (default 6 ×
//                                        --takes); a falling take isn't sent to the judge
//   --max-wps W                          lines: a slower pace to take these lines at (default and ceiling 3.3)
// Lines (docs/TEACHER_SCRIPT.md §7.4, docs/teacher-voice/mechanics.md §7.4; FIX_PLAN TV-F2.8):
//   - a clip shorter than 1.2 s is levelled 3 LU under the sentences (−19 LUFS, not −16), so a one-word clip ("Listen...",
//     "Brilliant!") never lands at a whole sentence's loudness and sounds barked;
//   - a take faster than 3.3 words a second is taken again (warm and unhurried); the slowest good take is kept, with a
//     warning if even that is too fast. Words are counted by scripts/lib/words.ts `wordCount`, the count script-audit's
//     `fast-line` uses;
//   - a lead-in ending on "..." must end cleanly (no breath or stray sound) and suspended (its pitch falls no more than
//     2 semitones over its last 300 ms, by the larger of the gate's Praat measure and a low-floor one: tailFall()), so
//     a pure sound or a word can follow it. A take that falls is never kept over the clip already there: the line is reported and the run exits 1.
import { existsSync, readFileSync, writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { WORDS, SPECIAL_WORDS, ORAL_WORDS } from "../src/content/phonics";
import { LINES } from "../src/content/lines";
import { STORIES } from "../src/content/stories";
import { tts, finishAudio, judgeAudio, trailingBlip, checkLoudness, gainTo, measureLufs, durationOf, SPEECH_LUFS } from "./tts";
import { pool, generate, textOf } from "./gemini";
import { wordCount } from "./lib/words";

export const VOICES = { sensei: "Erinome", baron: "Algenib" } as const;
const args = process.argv.slice(2);
const force = args.includes("--force");
const argOf = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const onlyIds = argOf("--only")?.split(",") ?? (argOf("--only-file") ? readFileSync(argOf("--only-file")!, "utf8").split(/\s+/).filter(Boolean) : undefined);
const only = onlyIds ? new Set(onlyIds) : null;
const TAKES = Number(argOf("--takes") ?? 4);
const LEAD_TAKES = Number(argOf("--lead-takes") ?? TAKES * 6);
const kinds = args.filter((a, i) => !a.startsWith("--") && !["--only", "--only-file", "--takes", "--lead-takes", "--max-wps"].includes(args[i - 1]));
const want = (k: string) => !kinds.length || kinds.includes(k);

// Isolated special words that TTS would otherwise read as letter names
const SAY: Record<string, string> = { fin: "Fin!", sniff: "Sniff!", hum: "Hum!", huff: "Huff!", a: "uh.", I: "I.", the: "the.", to: "to.", of: "of.", said: "said.", was: "was." };

/** `lead`: a lead-in ("This is how we spell...") that a pure sound or word is spliced after: its tail must be clean.
 *  `line`: a LINES clip (loudness by length, pace). */
interface Job { out: string; text: string; voice: string; rubric: string; blindWord?: string; lead?: boolean; line?: boolean }
/** A one-phrase line ending on "..." (a lead-in); "Is it? No! It's..." has a pause before its last words by design. */
const isLeadIn = (t: string) => t.trim().endsWith("...") && !/[.?!]\s/.test(t.trim().replace(/\.\.\.$/, ""));
/** A longer lead-in: whole sentences, then the phrase a sound follows ("Now the last sound. Listen right to the end..."). */
const endsOnLead = (t: string) => t.trim().endsWith("...");

/** Line loudness: sentences at the library's −16 LUFS; a clip under 1.2 s 3 LU quieter (mechanics §7.4). */
export const SHORT_CLIP_S = 1.2;
export const SHORT_LUFS = SPEECH_LUFS - 3;
/** The fastest a line may be spoken: words a second over the finished clip (TEACHER_SCRIPT §7.4, FIX_PLAN `fast-line`). */
export const MAX_WPS = 3.3;
/** This run's pace: MAX_WPS, or slower with --max-wps (a line to take more slowly than the rule asks). */
const PACE = Math.min(MAX_WPS, Number(argOf("--max-wps") ?? MAX_WPS));
/** Words in a line: the shared `wordCount` (scripts/lib/words.ts), the count script-audit's `fast-line` check uses, so
 *  a take this script passes also passes that check (27 Sep: the two counted "grown-up" differently, so `tv_opt_ask`
 *  was 3.25 words a second here and 3.72 there). */
export const wordsIn = wordCount;

/** finishAudio() (trim, 25 ms fades, two-pass loudness, −1.5 dBTP limiter, 50 ms pad) with the target chosen by the
 *  trimmed length: −16 LUFS, or −19 for a clip under 1.2 s. The filters are finishAudio's, so the two stay alike. */
/** Praat's pitch-synchronous overlap-add ("Lengthen (overlap-add)"): a speech clip made longer by a factor, keeping its
 *  pitch and voice. Cleaner on a voice than a tempo filter. */
const PSOLA = `import parselmouth, sys
from parselmouth.praat import call
s = parselmouth.Sound(sys.argv[1])
o = call(s, "Lengthen (overlap-add)", 75, 600, float(sys.argv[3]))
if call(o, "Get absolute extremum", 0, 0, "None") > 0.99: call(o, "Scale peak", 0.99)
o.save(sys.argv[2], "WAV")`;
/** The most a take is lengthened to be unhurried (the last resort, after every take and its own pauses). */
export const MAX_LENGTHEN = 1.5;

export function finishLine(wav: Buffer, outMp3: string, o: { widen?: { seconds: number; gaps: number }; lengthen?: number } = {}): { lufs: number; target: number; seconds: number; widened: number } {
  const dir = mkdtempSync(join(tmpdir(), "sn-line-"));
  const inp = join(dir, "in.wav");
  writeFileSync(inp, wav);
  mkdirSync(dirname(outMp3), { recursive: true });
  const trim =
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03," +
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  const fades = "afade=t=in:d=0.025,areverse,afade=t=in:d=0.025,areverse";
  let trimmed = join(dir, "trim.wav");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", inp, "-af", `${trim},${fades}`, "-ar", "44100", "-ac", "1", trimmed]);
  let widened = 0;
  if (o.widen) ({ file: trimmed, added: widened } = widenPauses(trimmed, o.widen.seconds, o.widen.gaps, join(dir, "wide.wav")));
  if (o.lengthen && o.lengthen > 1) {
    const slow = join(dir, "slow.wav");
    execFileSync("uv", ["run", "-q", "--with", "praat-parselmouth", "python", "-c", PSOLA, trimmed, slow, o.lengthen.toFixed(3)]);
    trimmed = slow;
  }
  const target = durationOf(trimmed) + 0.05 < SHORT_CLIP_S ? SHORT_LUFS : SPEECH_LUFS;
  const gain = gainTo(trimmed, target);
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-i", trimmed,
    "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=0.05`,
    "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "4", outMp3,
  ]);
  return { lufs: measureLufs(outMp3), target, seconds: durationOf(outMp3), widened };
}

/** A lead-in's pitch fall over its last 300 ms of voicing, in semitones (positive = falls): the larger of two measures,
 *  so a take can't pass by falling where one of them can't see it. Both use Praat's autocorrelation pitch (10 ms steps)
 *  on the clip at 24 kHz and the fall of a straight line fitted to the voiced frames of the last 300 ms.
 *  - `gate`: the gate's measure (27 Sep): 120–500 Hz, frames more than 6 semitones from their median dropped. It can't
 *    see a fall to the bottom of the voice (under 120 Hz) or a steep final fall (dropped as "more than 6 from the
 *    median"): picked from 20-odd takes, 7 of 20 retakes that passed it at 1.5 fell 3.8 to 18 semitones on `low`.
 *  - `low`: 75–500 Hz, and an octave jump between neighbouring frames folded back instead of dropping frames. On the
 *    recorded library it says the same as `gate` for groups (full-stop sentences fall a median 3.6, 64% over 2; the
 *    63 teacher-voice lead-ins the gate passed rise a median 3.0, 10% over 2).
 *  null if neither can be measured (fewer than 4 voiced frames). A lead-in is recorded suspended: it falls no more than
 *  2 semitones (docs/FIRST_MINUTES.md §12, TEACHER_SCRIPT §1). A take is accepted at once only at 1.5 or less: the judge
 *  still heard 1.8 as falling (`tv_here_it_comes`). (The earlier hand-rolled autocorrelation read octave slips as −14 to
 *  +14 semitones and passed takes that fall 3 to 7.) */
export const MAX_FALL = 2;
export const AIM_FALL = 1.5;
/** A lead-in that isn't a question is taken again, if it can be, when it rises more than this on either measure:
 *  Whisper heard "Let's check. Say the sounds with me..." (a 10.7-semitone rise) as "...with me?" and "You won back a
 *  sound..." (17.6) as a question. Such a take is still kept when no other is right. */
export const MAX_RISE = 8;
export const riseOf = (f: Falls) => (f.gate == null && f.low == null ? null : -Math.min(f.gate ?? 99, f.low ?? 99));
const FALL_PY = `import json, subprocess, sys, tempfile, numpy as np, parselmouth
def fit(t, st):
    if len(t) < 4: return None
    return round(float(-np.polyfit(t, st, 1)[0] * (t[-1] - t[0])), 2)
def falls(p):
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-ac", "1", "-ar", "24000", d + "/a.wav"], check=True)
        s = parselmouth.Sound(d + "/a.wav")
    out = {}
    for name, floor in (("gate", 120), ("low", 75)):
        pitch = s.to_pitch_ac(time_step=0.01, pitch_floor=floor, pitch_ceiling=500)
        f = pitch.selected_array["frequency"]; t = pitch.xs()
        v = np.where(f > 0)[0]
        if len(v) < 5: out[name] = None; continue
        st = 12 * np.log2(np.maximum(f, 1) / 100)
        if name == "gate":
            m = (t >= t[v[-1]] - 0.3) & (f > 0)
            tt, ff = t[m], st[m]
            if len(tt) < 4: out[name] = None; continue
            keep = np.abs(ff - np.median(ff)) < 6
            out[name] = fit(tt[keep], ff[keep])
        else:
            for a, b in zip(v[:-1], v[1:]):
                while st[b] - st[a] > 7: st[b] -= 12
                while st[a] - st[b] > 7: st[b] += 12
            m = [i for i in v if t[i] >= t[v[-1]] - 0.3]
            out[name] = fit(t[m], st[m])
    return out
print(json.dumps([falls(p) for p in sys.argv[1:]]))`;
export type Falls = { gate: number | null; low: number | null };
export const fallOf = (f: Falls) => (f.gate == null && f.low == null ? null : Math.max(f.gate ?? -99, f.low ?? -99));
export function tailFalls(files: string[]): Falls[] {
  if (!files.length) return [];
  return JSON.parse(execFileSync("uv", ["run", "-q", "--with", "praat-parselmouth", "--with", "numpy", "python", "-c", FALL_PY, ...files]).toString());
}
export const tailFall = (file: string) => fallOf(tailFalls([file])[0]);

/** The pauses a line's punctuation asks for: sentence ends, commas and a "..." inside it (not the one it ends on). */
export const pausesIn = (t: string) => (t.trim().replace(/\.\.\.$/, "").match(/[.?!,;:](?=\s)|\.\.\.(?=\s)/g) ?? []).length;

/**
 * Unhurried delivery without a new voice: lengthen a take's own pauses (the silences at its sentence ends and commas) by
 * `seconds` in all, at most 0.25 s each, spread over its `gaps` longest inner pauses. Used only when a word-perfect line
 * stays faster than 3.3 words a second after every take (TEACHER_SCRIPT §7.4). Silence goes in the middle of an existing
 * pause, so no word is touched and nothing is time-stretched.
 */
export function widenPauses(wav: string, seconds: number, gaps: number, out: string): { file: string; added: number } {
  const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", "44100", "-"], { maxBuffer: 1 << 28 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const hop = 441; // 10 ms
  const db: number[] = [];
  for (let i = 0; i + hop <= x.length; i += hop) {
    let e = 0;
    for (let k = i; k < i + hop; k++) e += x[k] * x[k];
    db.push(10 * Math.log10(e / hop + 1e-12));
  }
  const peak = Math.max(...db);
  const runs: { a: number; b: number }[] = [];
  for (let i = 0, start = -1; i <= db.length; i++) {
    const quiet = i < db.length && db[i] < peak - 35;
    if (quiet && start < 0) start = i;
    if (!quiet && start >= 0) {
      if (start > 0 && i < db.length && i - start >= 6) runs.push({ a: start, b: i }); // inner pauses of 60 ms or more
      start = -1;
    }
  }
  const chosen = runs.sort((p, q) => q.b - q.a - (p.b - p.a)).slice(0, Math.max(1, gaps)).sort((p, q) => p.a - q.a);
  if (!chosen.length || seconds <= 0) return { file: wav, added: 0 };
  const each = Math.min(0.25, seconds / chosen.length);
  const pad = Math.round(each * 44100);
  const parts: Float32Array[] = [];
  let from = 0;
  for (const r of chosen) {
    const mid = Math.round(((r.a + r.b) / 2) * hop);
    parts.push(x.subarray(from, mid), new Float32Array(pad));
    from = mid;
  }
  parts.push(x.subarray(from));
  const y = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    y.set(p, at);
    at += p.length;
  }
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", "44100", "-i", "-", out], { input: Buffer.from(y.buffer) });
  return { file: out, added: Math.round(each * chosen.length * 1000) / 1000 };
}
const jobs: Job[] = [];
const fileId = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_");

// every word a child can tap in a story needs a clip too
const storyTokens = STORIES.flatMap((st) => st.pages.flatMap((p) => (p.kind === "read" ? p.text.split(/\s+/) : p.kind === "choice" ? p.options.map((o) => o.word) : [])))
  .map((t) => t.replace(/[^A-Za-z']/g, ""))
  .filter(Boolean)
  .map((t) => (t === "I" || /^[A-Z]/.test(t) && !["It", "The", "A", "He", "Tip", "Run", "Get", "Hop", "Yuk", "Kick", "Tap", "Jam", "Drift", "Frog"].includes(t) ? t : t.toLowerCase()));
const HOMOPHONES: Record<string, string[]> = { to: ["two", "too"], I: ["eye", "i"], bee: ["be"], sea: ["see", "c"], be: ["bee"], tea: ["tee", "t"], they: [], a: ["uh", "a"], high: ["hi"], knight: ["night"], night: ["knight"], witch: ["which"], which: ["witch"], tail: ["tale"], pie: [], tie: [], seat: [], blew: [] };
async function blindWord(file: string, w: string): Promise<boolean> {
  const r = await generate("gemini-3.8-flash", { contents: [{ parts: [
    { inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } },
    { text: `Transcribe this single spoken English word (British accent). Reply JSON only: {"word": "<the word, lowercase>"}` },
  ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  try {
    const got = String(JSON.parse(textOf(r)).word).toLowerCase().replace(/[^a-z]/g, "");
    return got === w.toLowerCase() || (HOMOPHONES[w] ?? []).includes(got);
  } catch {
    return false;
  }
}
const FORCE_WORDS = new Set((process.env.WORDS ?? "").split(",").filter(Boolean));

if (want("words")) {
  for (const w of [...new Set([...WORDS.map((w) => w.text), ...SPECIAL_WORDS, ...storyTokens, ...Object.keys(ORAL_WORDS)])]) {
    const say = SAY[w] ?? `${w}.`;
    jobs.push({
      out: `public/a/w/${fileId(w)}.mp3`, text: say, voice: VOICES.sensei, blindWord: w,
      rubric: `The clip must be ONE English word, "${w}", said clearly and naturally ONCE in a Southern British accent, as a teacher would say it to a 5-year-old. Score 10 if it is exactly the word "${w}" (British pronunciation), nothing else. Score low for a different word, a letter name, extra words, American accent, or repeats.`,
    });
  }
}
if (want("lines")) {
  for (const l of LINES) {
    if (only && !only.has(l.id)) continue;
    const lead = isLeadIn(l.text);
    const leadOut = endsOnLead(l.text);
    jobs.push({
      out: `public/a/l/${l.id}.mp3`, text: l.text, voice: VOICES[l.who ?? "sensei"], lead, line: true,
      rubric: `The clip should be a British-accented voice reading exactly this script, expressively, with nothing added or missed: "${l.text}". Score 10 if it matches the script exactly with a natural British accent. Score low if words are missing/added, if it reads stage directions or instructions aloud, or if the accent is not British. It is spoken by a warm, calm Reception teacher to a 3-to-5-year-old: score 6 or less if it sounds rushed, shouted or barked.` +
        (leadOut ? ` It is a lead-in that another clip follows straight after, so it must end cleanly on its last word ("${l.text.trim().replace(/\.\.\.$/, "").split(" ").at(-1)}"), suspended, as if a sound is about to follow: score 4 or less if there is any breath, hiss, "shh", click or extra sound after it, and 6 or less if it ends on a strongly falling, finished full-stop intonation.` : ""),
    });
  }
}
if (want("stories")) {
  for (const st of STORIES) {
    for (const p of st.pages) {
      const who = p.kind === "narr" ? p.who ?? "sensei" : "sensei";
      const text = p.kind === "choice" || p.kind === "question" ? p.text : p.text;
      jobs.push({
        out: `public/a/s/${st.id}_${p.id}.mp3`, text, voice: VOICES[who],
        rubric: `The clip should be a warm British storyteller reading exactly: "${text}". Score 10 if every word matches with a natural British accent and expressive storytelling. Score low for missing/added words or non-British accent.`,
      });
    }
    jobs.push({
      out: `public/a/s/${st.id}_title.mp3`, text: `${st.title}.`, voice: VOICES.sensei,
      rubric: `The clip should be a British voice saying the story title: "${st.title}". Score 10 if exact.`,
    });
  }
}

const todo = jobs.filter((j) => force || !existsSync(j.out) || (j.blindWord && FORCE_WORDS.has(j.blindWord)));
const pace = (j: Job, seconds: number) => (j.line && wordsIn(j.text) >= 2 ? wordsIn(j.text) / seconds : 0);
console.log(`${todo.length} clips to generate of ${jobs.length}`);
const LOG = "assets-src/audio-report.json";
const report: Record<string, any> = existsSync(LOG) ? JSON.parse(readFileSync(LOG, "utf8")) : {};
let done = 0;

/** Lines that fail a gate after every take (not word-perfect, a lead-in still falling, still too fast): listed at the
 *  end, and the run exits 1. */
const failed: string[] = [];

/** A line's takes. A take passes when it is exact (judge ≥ 8, clean tail), unhurried (≤ 3.3 words a second) and, for a
 *  lead-in, suspended: at most AIM_FALL (1.5 semitones) to be taken at once. The fall and the tail are measured first,
 *  on the machine, so a lead-in's falling or noisy take never costs a judge's call, and a lead-in gets up to
 *  --lead-takes takes. If none passes, the best exact take (below). A lead-in that still falls never replaces a clip
 *  already there that falls less. */
async function lineTakes(j: Job) {
  type Take = { wav: Buffer; tmp: string; heard: string; judge: number | null; wps: number; blip: number | null; seconds: number; fall: number | null; rise: number | null };
  const leadOut = endsOnLead(j.text);
  const takes: Take[] = [];
  const exactOf = (t: Take) => t.judge != null && t.judge >= 8 && t.blip == null;
  const suspended = (t: Take, max = MAX_FALL) => t.fall == null || t.fall <= max;
  const question = /\?/.test(j.text) || /^(Which|What|Who|Where|How|Is|Are|Do|Can)\b/.test(j.text);
  const level = (t: Take) => question || t.rise == null || t.rise <= MAX_RISE;
  const good = (t: Take) => exactOf(t) && suspended(t, AIM_FALL) && level(t) && t.wps <= PACE;
  const judge = async (t: Take) => {
    const r = await judgeAudio(t.tmp, j.rubric);
    t.heard = r.heard + (t.blip != null ? ` [tail ${t.blip}s]` : "");
    t.judge = t.blip != null ? Math.min(r.score, 4) : r.score;
  };
  const judged = () => takes.filter((t) => t.judge != null);
  for (let attempt = 0; attempt < (leadOut ? Math.max(LEAD_TAKES, TAKES * 2) : TAKES * 2); attempt++) {
    // after TAKES judged takes, go on only while a take is right and the one thing wrong is its pace or its tail
    if (judged().length >= TAKES && !takes.some(exactOf)) break;
    const wav = await tts({ text: j.text, voice: j.voice });
    const tmp = j.out.replace(/\.mp3$/, `.try${attempt}.mp3`).replace("public/a/", "assets-src/tmp/");
    const { seconds } = finishLine(wav, tmp);
    // a lead-in's tail: a short burst after a pause at the end is a breath, "shh" or stray consonant (tts.ts). A longer
    // lead-in ("Let's check. Say the sounds with me...") ends on a phrase, so only a very short island counts there.
    let blip = leadOut ? trailingBlip(tmp) : null;
    if (blip != null && !j.lead && blip >= 0.3) blip = null;
    const both = leadOut ? tailFalls([tmp])[0] : null;
    const t: Take = { wav, tmp, heard: "", judge: null, wps: pace(j, seconds), blip, seconds, fall: both && fallOf(both), rise: both && riseOf(both) };
    takes.push(t);
    if (blip != null || !suspended(t)) continue;
    await judge(t);
    if (good(t)) break;
  }
  // no take was right: judge the least falling of the takes skipped for their tail, so a word-perfect one can be kept
  if (!takes.some(exactOf)) {
    const skipped = takes.filter((t) => t.judge == null).sort((a, b) => Number(a.blip != null) - Number(b.blip != null) || (a.fall ?? 0) - (b.fall ?? 0));
    for (const t of skipped.slice(0, 3)) {
      await judge(t);
      if (exactOf(t)) break;
    }
  }
  const fast = (t: Take) => t.wps > PACE;
  // suspended, then not rising like a question (fm_notice_sun_sock: a 15-semitone rise ranked above a take at 1.51),
  // then at AIM_FALL, then unhurried, then the slowest (the least lengthening), then the least falling: not
  // simply the least falling, which would pick the steepest rise ("again...?" as a question)
  const exact = takes.filter(exactOf).sort((a, b) => Number(suspended(b)) - Number(suspended(a)) || Number(level(b)) - Number(level(a)) || Number(suspended(b, AIM_FALL)) - Number(suspended(a, AIM_FALL)) || Number(fast(a)) - Number(fast(b)) || a.wps - b.wps || (a.fall ?? 0) - (b.fall ?? 0));
  const best = takes.find(good) ?? exact[0] ?? judged().reduce((a, b) => ((b.judge ?? 0) > (a.judge ?? 0) ? b : a));
  done++;
  // the gate on the fall: a lead-in with no take at AIM_FALL never replaces the clip there (the same words) if that one
  // falls less; one still falling past MAX_FALL is reported
  const old = leadOut && !suspended(best, AIM_FALL) && existsSync(j.out) && report[j.out]?.text === j.text ? tailFall(j.out) : undefined;
  if (old !== undefined && (old ?? 0) <= (best.fall ?? 0)) {
    console.log(`${(old ?? 0) > MAX_FALL ? "⚠ falling tail" : "·"} ${j.out}: best take falls ${best.fall} semitones after ${takes.length} takes; kept the clip there (${old})`);
    if ((old ?? 0) > MAX_FALL) failed.push(`${j.out}: falls ${old} semitones (kept; best of ${takes.length} takes ${best.fall})`);
    return;
  }
  if (!suspended(best)) {
    failed.push(`${j.out}: falls ${best.fall} semitones after ${takes.length} takes`);
    console.log("⚠ falling tail", j.out, `${best.fall} semitones after ${takes.length} takes`);
  }
  // still too fast, but word-perfect: give its own pauses a little more room (widenPauses), never a new voice
  const need = best.wps > PACE && exactOf(best) && pausesIn(j.text) ? wordsIn(j.text) / (PACE - 0.05) - best.seconds : 0;
  const widen = need > 0 ? { widen: { seconds: need, gaps: pausesIn(j.text) } } : {};
  let f = finishLine(best.wav, j.out, widen);
  if (need > 0) best.wps = pace(j, f.seconds);
  // the last resort for a word-perfect line still too fast after every take and its pauses (short questions such as
  // "Do you want to have a go now?" come out at 4–6 words a second): lengthen it with Praat's PSOLA, at most ×1.5, to
  // 3.25 words a second. Logged in the report (`lengthened`), so a line that needs it can be split or re-written instead.
  let lengthened = 0;
  if (best.wps > PACE && exactOf(best)) {
    const factor = wordsIn(j.text) / (PACE - 0.05) / f.seconds;
    lengthened = Math.round(Math.min(MAX_LENGTHEN, factor) * 1000) / 1000;
    f = finishLine(best.wav, j.out, { ...widen, lengthen: lengthened });
    best.wps = pace(j, f.seconds);
  }
  // the clip as written, measured as the gate measures it (widening and PSOLA keep the pitch, but check)
  const both = leadOut ? tailFalls([j.out])[0] : null;
  const fall = both ? fallOf(both) : null;
  report[j.out] = { score: best.judge, heard: best.heard, text: j.text, takes: takes.length, judged: judged().length, wps: Math.round(best.wps * 100) / 100, seconds: Math.round(f.seconds * 100) / 100, lufs: f.lufs, target: f.target, ...(f.widened ? { widened: f.widened } : {}), ...(lengthened ? { lengthened } : {}), ...(fall != null ? { fall, fall_gate: both!.gate, fall_low: both!.low } : {}), ...(leadOut ? { falls: takes.map((t) => t.fall) } : {}) };
  if (!exactOf(best)) {
    console.log("⚠", j.out, best.judge, best.heard);
    failed.push(`${j.out}: judge ${best.judge}${best.blip != null ? `, tail ${best.blip}s` : ""}`);
  }
  if (fall != null && fall > MAX_FALL && suspended(best)) failed.push(`${j.out}: falls ${fall} semitones as written`);
  if (best.wps > PACE) {
    console.log("⚠ fast", j.out, `${best.wps.toFixed(2)} words/s after ${takes.length} takes: take it again, or split it`);
    failed.push(`${j.out}: ${best.wps.toFixed(2)} words a second`);
  }
  if (Number.isFinite(f.lufs) && f.lufs > -60 && Math.abs(f.lufs - f.target) > 1) console.log("⚠ loudness", j.out, `${f.lufs} LUFS (want ${f.target})`);
  if (done % 25 === 0) {
    console.log(`${done}/${todo.length}`);
    writeFileSync(LOG, JSON.stringify(report, null, 1));
  }
}

await pool(todo, 10, async (j) => {
  if (j.line) return lineTakes(j);
  let best: { score: number; wav: Buffer; heard: string; judge: number } | null = null;
  for (let attempt = 0; attempt < (j.blindWord ? 6 : 4); attempt++) {
    const wav = await tts({ text: j.text, voice: j.voice });
    const tmp = j.out.replace(/\.mp3$/, `.try${attempt}.mp3`).replace("public/a/", "assets-src/tmp/");
    finishAudio(wav, tmp);
    const r = await judgeAudio(tmp, j.rubric);
    // a lead-in's tail: a short burst after a pause at the end is a breath, "shh" or stray consonant (tts.ts)
    const blip = j.lead ? trailingBlip(tmp) : null;
    if (blip != null) (r.score = Math.min(r.score, 4)), (r.heard += ` [tail ${blip}s]`);
    // words must ALSO be recognised blind (without telling the judge the target)
    const blindOk = j.blindWord ? await blindWord(tmp, j.blindWord) : true;
    const hz = j.blindWord ? parseFloat(execFileSync("uv", ["run", "--with", "numpy", "python", "scripts/pitch.py", tmp]).toString()) || 0 : 0;
    const pitchOk = !j.blindWord || hz === 0 || (hz >= 140 && hz <= 290);
    const score = r.score + (blindOk ? 10 : 0) - (pitchOk ? 0 : 6);
    if (!best || score > best.score) best = { score, wav, heard: r.heard + (blindOk ? "" : " [blind✗]"), judge: r.score };
    if (r.score >= 8 && blindOk && pitchOk) break;
  }
  if (j.blindWord) best!.score -= 10;
  finishAudio(best!.wav, j.out);
  report[j.out] = { score: best!.score, heard: best!.heard, text: j.text };
  done++;
  // (the judge's own score: `score` also carries the blind-word bonus)
  if (best!.judge < 8) console.log("⚠", j.out, best!.judge, best!.heard);
  const loud = checkLoudness(j.out);
  if (!loud.ok) console.log("⚠ loudness", j.out, `${loud.lufs} LUFS`);
  if (done % 25 === 0) {
    console.log(`${done}/${todo.length}`);
    writeFileSync(LOG, JSON.stringify(report, null, 1));
  }
});
writeFileSync(LOG, JSON.stringify(report, null, 1));
if (failed.length) {
  console.log(`✗ ${failed.length} line(s) failed a gate:\n  ${failed.join("\n  ")}`);
  process.exitCode = 1;
}
console.log("done");
