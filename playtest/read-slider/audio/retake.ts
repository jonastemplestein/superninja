// Re-take read-slider lines until one passes every gate, and install the best (fix round 1, 27 Sep).
// gen-audio.ts has no model flag and runs its whole job list on import, so its line finishing and gates are copied here:
//   finishLine: trim, 25 ms fades, −16 LUFS (−19 under 1.2 s), −1.5 dBTP limiter, 50 ms pad
//   the judge (gen-audio's rubric) ≥ 8; ≤ 3.3 words a second; a lead-in ("..."): a clean tail (tts.ts trailingBlip),
//   a fall of at most 1.5 semitones and a rise of at most 8 (gen-audio's FALL_PY, read from its source, AIM_FALL, MAX_RISE)
// and the judge's gates from fix round 1: the calibrated accent judge (scripts/accent-judge.ts: every r, flap and BATH
// word British on ≥ 80 % of 21 votes; 6 first, 15 more only if it can still pass) and a warmth listen (8 votes of
// gemini-3.1-pro-preview: warmth ≥ 4.0, or ≥ 4.3 with at most one "a child would feel told off" for the correction
// lines and the frame; British ≥ 4; every word clear on 6 of 8).
// Every take is kept (playtest/runs/read-slider/retakes/), with its numbers in state.json; nothing in public/ changes
// until --install, which copies each id's best passing take over public/a/l/<id>.mp3 (the old clip to .trash/).
//   doppler run -p os-legacy-2026-04 -c dev -- bun playtest/read-slider/audio/retake.ts id id ...
//   … retake.ts --install id id ...      (env: MODEL, default gemini-3.8-flash-tts; TAKES a round, 3; ROUNDS, 4;
//                                          RETAKES: the folder for the takes and state.json)
// Fix round 1 ran it on MODEL=gemini-3.8-flash-lite-tts: the shared key's 3.8-flash-tts quota (10,000 a day) was used
// up at 13:20 BST.
// The 28 Sep retakes (docs/tts-retakes.md) added: a faster-whisper word-for-word gate on every take (whisper.py, qa.py's
// check), before the judge; the warmth listen at 15 votes for the strict ids (the correction lines, the frame and the
// backwards gags: ≥ 4.3 and at most one of 15 "told off"); a "gonna" vote for lines that say "going to" (at most one);
// accent words the finder skips (EXTRA_WORDS: "your"); and --install writes atomically (a temp file, then a rename),
// with the old clip to TRASH (env; default .trash/read-slider-retakes-2026-09-27).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, mkdtempSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";

const ROOT = join(import.meta.dir, "../../..");
const { calibrate, vote, tally, findWords, calibrationLine, verdictLine } = await import(`${ROOT}/scripts/accent-judge.ts`);
const { generate, textOf, pool } = await import(`${ROOT}/scripts/gemini.ts`);
const { tts, judgeAudio, trailingBlip, gainTo, measureLufs, durationOf, SPEECH_LUFS } = await import(`${ROOT}/scripts/tts.ts`);
const { wordCount } = await import(`${ROOT}/scripts/lib/words.ts`);
const { LINES } = await import(`${ROOT}/src/content/lines.ts`);
const HERE = process.env.RETAKES ?? join(ROOT, "playtest/runs/read-slider/retakes");
const TAKES = join(HERE, "takes");
mkdirSync(TAKES, { recursive: true });
const MODEL = process.env.MODEL ?? "gemini-3.8-flash-tts";
const PER_ROUND = Number(process.env.TAKES ?? 3);
const ROUNDS = Number(process.env.ROUNDS ?? 4);
const INSTALL = process.argv.includes("--install");
const ids: string[] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const text: Record<string, string> = Object.fromEntries(LINES.map((l: any) => [l.id, l.text]));
const WARM_STRICT = new Set(["rs_back_1", "rs_back_2", "rs_start_here", "pr_frame", "pr_back_snowman", "pr_back_cupcake", "pr_back_football", "pr_back_pancake"]);
/** Accent-judge words the finder leaves out (R_SKIP: unstressed "your"), where a listen heard them American. */
const EXTRA_WORDS: Record<string, Record<string, string[]>> = { pr_what_football: { r: ["your"] } };
const whisper = (file: string, t: string): { heard: string; exact: boolean; diff: string[] } =>
  JSON.parse(execFileSync("uv", ["run", "-q", "--with", "numpy", "--with", "praat-parselmouth", "--with", "faster-whisper", "python", join(ROOT, "playtest/read-slider/audio/whisper.py"), "check", file, t]).toString());
const STATE = join(HERE, "state.json");
const state: { takes: any[] } = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { takes: [] };
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 1));
const log = (s: string) => (console.log(s), writeFileSync(join(HERE, "retake.log"), s + "\n", { flag: "a" }));

// ---- gen-audio's finishing, rubric and gates
const SHORT_LUFS = SPEECH_LUFS - 3;
function finishLine(wav: Buffer, outMp3: string) {
  const dir = mkdtempSync(join(tmpdir(), "rs-line-"));
  const inp = join(dir, "in.wav");
  writeFileSync(inp, wav);
  mkdirSync(dirname(outMp3), { recursive: true });
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  const fades = "afade=t=in:d=0.025,areverse,afade=t=in:d=0.025,areverse";
  const trimmed = join(dir, "trim.wav");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", inp, "-af", `${trim},${fades}`, "-ar", "44100", "-ac", "1", trimmed]);
  const target = durationOf(trimmed) + 0.05 < 1.2 ? SHORT_LUFS : SPEECH_LUFS;
  const gain = gainTo(trimmed, target);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", trimmed, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=0.05`, "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "4", outMp3]);
  return { lufs: measureLufs(outMp3), target, seconds: durationOf(outMp3) };
}
const src = readFileSync(join(ROOT, "scripts/gen-audio.ts"), "utf8");
const FALL_PY = src.match(/const FALL_PY = `([\s\S]*?)`;/)![1];
const fallOf = (f: any) => (f == null || (f.gate == null && f.low == null) ? null : Math.max(f.gate ?? -99, f.low ?? -99));
const tails = (file: string) => JSON.parse(execFileSync("uv", ["run", "-q", "--with", "praat-parselmouth", "--with", "numpy", "python", "-c", FALL_PY, file]).toString())[0];
/** gen-audio's riseOf: a lead-in that rises more than 8 semitones on either measure sounds like a question */
const riseOf = (f: any) => (f == null || (f.gate == null && f.low == null) ? null : -Math.min(f.gate ?? 99, f.low ?? 99));
const rubric = (t: string) => {
  const leadOut = t.trim().endsWith("...");
  return `The clip should be a British-accented voice reading exactly this script, expressively, with nothing added or missed: "${t}". Score 10 if it matches the script exactly with a natural British accent. Score low if words are missing/added, if it reads stage directions or instructions aloud, or if the accent is not British. It is spoken by a warm, calm Reception teacher to a 3-to-5-year-old: score 6 or less if it sounds rushed, shouted or barked.` +
    (leadOut ? ` It is a lead-in that another clip follows straight after, so it must end cleanly on its last word ("${t.trim().replace(/\.\.\.$/, "").split(" ").at(-1)}"), suspended, as if a sound is about to follow: score 4 or less if there is any breath, hiss, "shh", click or extra sound after it, and 6 or less if it ends on a strongly falling, finished full-stop intonation.` : "");
};

// ---- warmth (the judge's warmth.ts prompt), 8 votes
const padWav = (file: string, ms: number) => {
  const out = join(HERE, "pad", `w-${createHash("sha1").update(file + ms).digest("hex").slice(0, 10)}.wav`);
  mkdirSync(join(HERE, "pad"), { recursive: true });
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-t", String(ms / 1000), "-i", "anullsrc=r=44100:cl=mono", "-i", file, "-filter_complex", "[1:a]aresample=44100,aformat=channel_layouts=mono[b];[0:a][b]concat=n=2:v=0:a=1", out]);
  return out;
};
const ask = (t: string) => `You are judging one recorded line from a phonics game for 3-year-olds in England. The teacher character is a kind old red panda called Sensei. The line is meant to say exactly: "${t}"
Listen and answer ONLY with JSON: {"warmth": 1-5 (5 = warm, gentle, encouraging, smiling; 1 = cold, flat, stern or scolding), "british": 1-5 (5 = clearly Southern British English; 1 = clearly American), "scolding": true/false (would a shy 3-year-old feel told off?), "clear": true/false (every word clear and the text matches)${/going to/i.test(t) ? `, "gonna": true/false (did the speaker say "gonna" instead of the two full words "going to"?)` : ""}, "issue": "one short phrase or empty"}`;
async function warmth(file: string, t: string, votes = 8) {
  const res: any[] = [];
  await pool(Array.from({ length: votes }, (_, k) => k), 15, async (k: number) => {
    const body = { contents: [{ role: "user", parts: [{ inlineData: { mimeType: "audio/wav", data: readFileSync(padWav(file, 430 + 10 * k)).toString("base64") } }, { text: ask(t) }] }], generationConfig: { temperature: 1, responseMimeType: "application/json" } };
    try {
      res.push(JSON.parse(textOf(await generate("gemini-3.1-pro-preview", body))));
    } catch (e) {}
  });
  const ok = res.filter((r) => r.warmth != null);
  const avg = (k: string) => ok.reduce((s, r) => s + (Number(r[k]) || 0), 0) / Math.max(1, ok.length);
  return { warmth: avg("warmth"), british: avg("british"), scold: ok.filter((r) => r.scolding === true).length, clear: ok.filter((r) => r.clear === true).length, gonna: ok.filter((r) => r.gonna === true).length, n: ok.length, issues: ok.map((r) => r.issue).filter(Boolean) };
}
async function accent(file: string, t: string, key: string) {
  const words = findWords(t);
  for (const [f, ws] of Object.entries(EXTRA_WORDS[key] ?? {})) words[f] = [...new Set([...(words[f] ?? []), ...ws])];
  const n = (words.bath?.length ?? 0) + (words.r?.length ?? 0) + (words.flap?.length ?? 0);
  if (!n) return { p: null as number | null, line: `${key}: no target words` };
  const item = { key, file, text: t, words };
  const [c] = await vote([item], { votes: 6 });
  if (c.words.every((w: any) => w.uk >= 4)) {
    const [more] = await vote([item], { votes: 15, start: 6 });
    for (const w of c.words) {
      const m = more.words.find((x: any) => x.feature === w.feature && x.word === w.word);
      if (m) w.votes.push(...m.votes);
    }
    tally(c);
  }
  return { p: c.p as number | null, line: verdictLine(c) };
}

// ---- --install: each id's best passing take (the accent, then the warmth, then the least falling tail) over its clip
if (INSTALL) {
  const trash = process.env.TRASH ? join(ROOT, process.env.TRASH) : join(ROOT, ".trash/read-slider-retakes-2026-09-27");
  mkdirSync(trash, { recursive: true });
  for (const id of ids) {
    const ok = state.takes.filter((t) => t.id === id && t.pass && t.text === text[id] && existsSync(t.file));
    if (!ok.length) {
      log(`${id}: no passing take to install`);
      continue;
    }
    const best = ok.sort((a, b) => (b.accent ?? 1) - (a.accent ?? 1) || b.warmth - a.warmth || b.scold * -1 - a.scold * -1 || Math.abs(a.fall ?? 0) - Math.abs(b.fall ?? 0))[0];
    const dest = join(ROOT, "public/a/l", `${id}.mp3`);
    if (existsSync(dest)) copyFileSync(dest, join(trash, `${id}.${Date.now()}.mp3`));
    const tmp = join(dirname(dest), `.${id}.mp3.tmp-${process.pid}`);
    copyFileSync(best.file, tmp);
    renameSync(tmp, dest);
    log(`→ ${id}: installed ${best.file.split("/").pop()} (${best.model}; accent ${best.accent ?? "–"}, warmth ${best.warmth}, scold ${best.scold}, ${best.wps} w/s${best.fall != null ? `, fall ${best.fall}` : ""})`);
  }
  process.exit(0);
}

const cal = await calibrate(["bath", "r", "flap"]);
for (const f of cal.features) log(calibrationLine(f));
if (!cal.ok) {
  log("calibration failed: nothing judged");
  process.exit(2);
}
log(`model ${MODEL}, ${PER_ROUND} takes a round, ${ROUNDS} rounds`);
/** MIN_WPS: a floor on the pace too (a lead-in that holds up the first run); AGAIN=1: look for another passing take
 *  even if one exists (--install then picks the best: the accent, the warmth, then the pace nearest 3) */
const MIN_WPS = Number(process.env.MIN_WPS ?? 0);
const since = Date.now();
const passed = (id: string) => state.takes.some((t) => t.id === id && t.text === text[id] && t.pass && (!process.env.AGAIN || t.at > since) && t.wps >= MIN_WPS);
/** Up to MAX_TAKES takes an id in this RETAKES folder, across runs (28 Sep: 8). */
const MAX_TAKES = Number(process.env.MAX_TAKES ?? 99);
const takesOf = (id: string) => readdirSync(TAKES).filter((f) => f.startsWith(`${id}-`)).length;
/** gen-audio's gates, the whisper check, the judge, the accent and the warmth on one finished take. */
async function judgeTake(id: string, file: string, fin: { lufs: number; target: number; seconds: number }, tag: string) {
  const t = text[id];
  const wps = wordCount(t) / fin.seconds;
  const lead = t.trim().endsWith("...");
  let blip = lead ? trailingBlip(file) : null;
  // gen-audio: a longer lead-in ("...the sun... now...") ends on a phrase, so only a very short island is a stray tail
  if (blip != null && /[.?!]\s/.test(t.trim().replace(/\.\.\.$/, "")) && blip >= 0.3) blip = null;
  const tl = lead ? tails(file) : null;
  const fall = lead ? fallOf(tl) : null;
  const rise = lead ? riseOf(tl) : null;
  const base = { id, text: t, model: MODEL, file, at: Date.now(), seconds: +fin.seconds.toFixed(2), wps: +wps.toFixed(2), lufs: fin.lufs, blip, fall, rise };
  if (wps > 3.3 || wps < MIN_WPS || !(Math.abs(fin.lufs - fin.target) <= 1) || blip != null || (fall != null && fall > 1.5) || (rise != null && rise > 8)) {
    state.takes.push({ ...base, pass: false, why: `gate: wps ${wps.toFixed(2)} lufs ${fin.lufs} blip ${blip} fall ${fall} rise ${rise}` });
    save();
    return log(`✗ ${id} ${tag} gate: ${wps.toFixed(2)} w/s, ${fin.lufs} LUFS, blip ${blip}, fall ${fall}, rise ${rise}`);
  }
  const wh = whisper(file, t);
  if (!wh.exact) {
    state.takes.push({ ...base, whisper: wh.heard, pass: false, why: `whisper ${wh.diff.join("; ")}` });
    save();
    return log(`✗ ${id} ${tag} whisper: ${wh.heard} (${wh.diff.join("; ")})`);
  }
  const j = await judgeAudio(file, rubric(t));
  if (j.score < 8) {
    state.takes.push({ ...base, whisper: wh.heard, judge: j.score, heard: j.heard, pass: false, why: "judge" });
    save();
    return log(`✗ ${id} ${tag} judge ${j.score}: ${j.heard}`);
  }
  const strict = WARM_STRICT.has(id);
  const [a, w] = await Promise.all([accent(file, t, id), warmth(file, t, strict ? 15 : 8)]);
  const pass = (a.p == null || a.p >= 0.8) && w.warmth >= (strict ? 4.3 : 4.0) && w.scold <= (strict ? 1 : 0) && w.british >= 4.0 && w.clear >= Math.ceil(0.75 * w.n) && w.gonna <= 1 && w.n >= (strict ? 12 : 6);
  state.takes.push({ ...base, whisper: wh.heard, judge: j.score, heard: j.heard, accent: a.p, words: a.line, warmth: +w.warmth.toFixed(2), british: +w.british.toFixed(2), scold: w.scold, clear: w.clear, gonna: w.gonna, n: w.n, issues: w.issues, pass });
  save();
  log(`${pass ? "✓" : "✗"} ${id} ${tag} ${a.line} · ${wps.toFixed(2)} w/s ${fin.lufs} LUFS${fall != null ? ` fall ${fall}` : ""} · warmth ${w.warmth.toFixed(2)} british ${w.british.toFixed(2)} scold ${w.scold}/${w.n} clear ${w.clear}${/going to/i.test(t) ? ` gonna ${w.gonna}` : ""} ${w.issues.join(" | ").slice(0, 120)}`);
}
// takes a stopped run made but never judged: judged first, so no TTS request is wasted
const known = new Set(state.takes.map((t) => t.file));
const orphans = readdirSync(TAKES).filter((f) => f.endsWith(".mp3") && !known.has(join(TAKES, f))).map((f) => ({ f, id: ids.find((i) => f.startsWith(`${i}-${MODEL}-`)) })).filter((o) => o.id);
await pool(orphans, 6, async ({ f, id }: { f: string; id?: string }) => {
  if (passed(id!)) return;
  const file = join(TAKES, f);
  const seconds = durationOf(file);
  await judgeTake(id!, file, { lufs: measureLufs(file), target: seconds < 1.2 ? SHORT_LUFS : SPEECH_LUFS, seconds }, "r0 (unjudged)");
});
const inflight: Record<string, number> = {};
let todo = ids.filter((id) => !passed(id) && takesOf(id) < MAX_TAKES);
for (let round = 1; round <= ROUNDS && todo.length; round++) {
  log(`== round ${round}: ${todo.join(", ")}`);
  await pool(todo.flatMap((id) => Array.from({ length: PER_ROUND }, (_, k) => ({ id, k }))), 6, async ({ id, k }: { id: string; k: number }) => {
    if (passed(id) || takesOf(id) + (inflight[id] ?? 0) >= MAX_TAKES) return;
    inflight[id] = (inflight[id] ?? 0) + 1;
    const file = join(TAKES, `${id}-${MODEL}-${Date.now()}-${round}${k}.mp3`);
    let fin;
    try {
      fin = finishLine(await tts({ text: text[id], voice: "Erinome", model: MODEL }), file);
    } catch (e) {
      return log(`${id}: tts failed ${String(e).slice(0, 120)}`);
    } finally {
      inflight[id]--;
    }
    await judgeTake(id, file, fin, `r${round}.${k}`);
  });
  todo = todo.filter((id) => !passed(id) && takesOf(id) < MAX_TAKES);
}
log(`not passed: ${ids.filter((id) => !passed(id)).map((id) => `${id} (${takesOf(id)} takes)`).join(", ") || "none"}`);
