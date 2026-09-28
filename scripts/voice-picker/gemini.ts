// Voice picker, the Gemini renderer: render the accent test script (scripts/voice-picker/audit-script.ts) with every
// Gemini TTS prebuilt voice that suits a role, judge each candidate, and write playtest/voice-picker/candidates-gemini.json.
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/voice-picker/gemini.ts [stage...] [--only id,id] [--force]
// Stages (all, in order, when none is named; each skips work already done, so a rerun resumes):
//   render   take 1 of every line, plus takes 2 and 3 of the probe lines (MULTI_TAKE), finished like the game's clips:
//            trimmed, 25 ms fades, two-pass −16 LUFS, −1.5 dBTP limiter, 112 kbps CBR mono MP3 (the brief asks for
//            96–128 kbps; the game's -q:a 4 gives ~80 kbps on mono speech)
//   judge    the audit's briefed accent judge (audit-judge.ts, prompt copied verbatim): 3 votes a take on sensei-2,
//            sensei-6, narrator-1, baron-1 and baron-2, giving a Southern-British score 1–10 and American features
//   abx      the audit's calibrated ABX judge (audit-judge-abx.ts, prompt copied verbatim), same clips and votes, against
//            the audit's anchors (ElevenLabs Alice ~ OpenAI coral; ElevenLabs George ~ OpenAI ash for the Baron).
//            The audit found the briefed judge cannot tell (it called macOS Samantha "Southern British" 15/18), so the
//            ranking leans on this one and on the acoustics
//   fit      role fit, 2 votes a line on every take-1 line: Sensei "teacher warmth", narrator "storytelling", Baron "villain"
//   measure  the audit's acoustics (audit-measure.py: F3 in r-words, the BATH index, t closures) on every take, via
//            scripts/voice-picker/gemini-measure.py (Whisper medium.en word timings, as the audit, snapped to pauses)
//   collect  write candidates-gemini.json
// Raw takes and judge data: playtest/runs/voice-picker/gemini/. Finished audio: playtest/voice-picker/audio/gemini/<id>/.
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { tts, gainTo, measureLufs, durationOf, SPEECH_LUFS } from "../tts";
import { generate, inlineParts, pool, textOf } from "../gemini";
import { TEST_SCRIPT, type Role, type TestLine } from "./audit-script";
import { wordCount } from "../lib/words";

const ROOT = join(import.meta.dir, "../..");
const RUN = join(ROOT, "playtest/runs/voice-picker/gemini");
const AUDIO = join(ROOT, "playtest/voice-picker/audio/gemini");
const OUT_JSON = join(ROOT, "playtest/voice-picker/candidates-gemini.json");
const args = process.argv.slice(2);
const argOf = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const force = args.includes("--force");
const only = argOf("--only")?.split(",");
const stages = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--only");
const want = (s: string) => !stages.length || stages.includes(s);
const JUDGE_MODEL = "gemini-3.8-flash";
const VOTES = 3;
const FIT_VOTES = 2;
const TAKES = 3;
/** Lines rendered three times: the accent probes (the audit found accent is a property of each take, not each voice). */
const MULTI_TAKE = new Set(["sensei-2", "sensei-4", "sensei-6", "narrator-1", "baron-1", "baron-2"]);
/** Lines the accent judges hear (the brief: Sensei lines 2 and 6, narrator line 1; the Baron's two lines). */
const JUDGED = new Set(["sensei-2", "sensei-6", "narrator-1", "baron-1", "baron-2"]);

// ------------------------------------------------------------------ the candidates
/** Gemini's prebuilt voices, with Google's one-word character for each. */
const CHARACTER: Record<string, string> = {
  Sulafat: "warm", Vindemiatrix: "gentle", Achernar: "soft", Aoede: "breezy", Callirrhoe: "easy-going", Despina: "smooth",
  Leda: "youthful", Gacrux: "mature", Autonoe: "bright", Erinome: "clear", Laomedeia: "upbeat", Zephyr: "bright",
  Kore: "firm", Pulcherrima: "forward", Charon: "informative", Sadaltager: "knowledgeable", Algieba: "smooth",
  Iapetus: "clear", Enceladus: "breathy", Algenib: "gravelly", Fenrir: "excitable", Sadachbia: "lively",
  Alnilam: "firm", Puck: "upbeat",
};
const FEMALE = new Set(["Sulafat", "Vindemiatrix", "Achernar", "Aoede", "Callirrhoe", "Despina", "Leda", "Gacrux", "Autonoe", "Erinome", "Laomedeia", "Zephyr", "Kore", "Pulcherrima"]);
const MODEL = "gemini-3.8-flash-tts";
/** USD a minute of speech: audio out at 25 tokens a second (text in is negligible). Gemini API price list, 27 Sep 2026;
 *  3.8 Flash and Flash-Lite TTS double on 1 Jan 2027 ($18 and $12 per 1M audio tokens). */
const PRICE_PER_M_AUDIO: Record<string, number> = { "gemini-3.8-flash-tts": 9, "gemini-3.8-flash-lite-tts": 6, "gemini-2.5-pro-preview-tts": 20 };
const perMinute = (model: string) => Math.round(1500 * PRICE_PER_M_AUDIO[model] / 1e6 * 10000) / 10000;

interface Candidate { id: string; voice: string; lang: string | null; model: string; roles: Role[]; sex: "f" | "m"; label: string; current?: Role[] }
const slug = (s: string) => s.toLowerCase();
const cand = (voice: string, roles: Role[], o: { lang?: string | null; model?: string; current?: Role[] } = {}): Candidate => {
  const lang = o.lang === undefined ? "en-GB" : o.lang;
  const model = o.model ?? MODEL;
  const modelTag = model === MODEL ? "" : model.includes("lite") ? "-lite" : model.includes("2.5-pro") ? "-pro25" : "-" + model;
  return {
    id: `gemini-${slug(voice)}-${lang ? slug(lang).replace("-", "") : "nolang"}${modelTag}`,
    voice, lang, model, roles, sex: FEMALE.has(voice) ? "f" : "m", current: o.current,
    label: `Gemini ${voice} (${CHARACTER[voice]}), ${lang ?? "no language code"}${model === MODEL ? "" : `, ${model}`}`,
  };
};
const SENSEI_VOICES = ["Sulafat", "Vindemiatrix", "Achernar", "Aoede", "Callirrhoe", "Despina", "Leda", "Gacrux", "Autonoe", "Erinome", "Laomedeia", "Zephyr", "Kore", "Pulcherrima"];
export const CANDIDATES: Candidate[] = [
  // Sensei Maple is a woman: every female prebuilt voice. Sulafat is today's Sensei, and she narrates today's stories
  // and film; Gacrux ("mature") is tried as a narrator too.
  ...SENSEI_VOICES.map((v) => cand(v, v === "Sulafat" || v === "Gacrux" ? ["sensei", "narrator"] : ["sensei"], { current: v === "Sulafat" ? ["sensei", "narrator"] : undefined })),
  // Narrators: storytelling voices.
  ...["Charon", "Sadaltager", "Algieba", "Iapetus", "Enceladus"].map((v) => cand(v, ["narrator"])),
  // Baron Muddle: a comic villain.
  cand("Algenib", ["baron"], { current: ["baron"] }),
  ...["Fenrir", "Sadachbia", "Alnilam", "Puck"].map((v) => cand(v, ["baron"])),
  // en-GB versus no language code, on four voices.
  cand("Sulafat", ["sensei", "narrator"], { lang: null }),
  cand("Gacrux", ["sensei", "narrator"], { lang: null }),
  cand("Charon", ["narrator"], { lang: null }),
  cand("Algenib", ["baron"], { lang: null }),
  // The same voice on the other Gemini TTS models (a setting, not a voice).
  cand("Sulafat", ["sensei", "narrator"], { model: "gemini-2.5-pro-preview-tts" }),
  cand("Sulafat", ["sensei", "narrator"], { model: "gemini-3.8-flash-lite-tts" }),
];
const CANDS = CANDIDATES.filter((c) => !only || only.includes(c.id));

// ------------------------------------------------------------------ render
interface Render { id: string; line: string; role: Role; text: string; take: number; wav: string; mp3: string; seconds?: number; wps?: number; lufs?: number }
const rel = (p: string) => p.replace(ROOT + "/", "");
const rendersPath = join(RUN, "renders.json");
const loadJson = (p: string, d: any) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);

function pcmToWav(pcm: Buffer, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/** tts() always sends a languageCode (en-GB by default); the no-language candidates need the same call without one. */
async function speak(c: Candidate, text: string): Promise<Buffer> {
  if (c.lang) return tts({ text, voice: c.voice, lang: c.lang, model: c.model });
  const json = await generate(c.model, {
    contents: [{ parts: [{ text }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: c.voice } } } },
  });
  const a = inlineParts(json).find((p) => p.mimeType.startsWith("audio/"));
  if (!a) throw new Error("no audio: " + JSON.stringify(json).slice(0, 300));
  return a.data.subarray(0, 4).toString() === "RIFF" ? a.data : pcmToWav(a.data);
}

/** finishAudio() from scripts/tts.ts (the same trim, fades, two-pass loudness and limiter), encoded at 112 kbps CBR. */
function finish(wav: Buffer, outMp3: string) {
  const dir = mkdtempSync(join(tmpdir(), "sn-vp-"));
  const inp = join(dir, "in.wav");
  writeFileSync(inp, wav);
  mkdirSync(dirname(outMp3), { recursive: true });
  const trim =
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03," +
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  const fades = "afade=t=in:d=0.025,areverse,afade=t=in:d=0.025,areverse";
  const trimmed = join(dir, "trim.wav");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", inp, "-af", `${trim},${fades}`, "-ar", "44100", "-ac", "1", trimmed]);
  const gain = gainTo(trimmed, SPEECH_LUFS);
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-i", trimmed,
    "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=0.05`,
    "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "112k", outMp3,
  ]);
}

const linesFor = (c: Candidate) => TEST_SCRIPT.filter((l) => c.roles.includes(l.role));
const mp3Path = (c: Candidate, l: TestLine, take: number) => join(AUDIO, c.id, `${l.id}${take > 1 ? `.take${take}` : ""}.mp3`);
const wavPath = (c: Candidate, l: TestLine, take: number) => join(RUN, "raw", c.id, `${l.id}.t${take}.wav`);

async function stageRender() {
  const jobs = CANDS.flatMap((c) => linesFor(c).flatMap((l) => Array.from({ length: MULTI_TAKE.has(l.id) ? TAKES : 1 }, (_, i) => ({ c, l, take: i + 1 }))));
  const prev: Render[] = loadJson(rendersPath, []);
  const byKey = new Map(prev.map((r) => [`${r.id}/${r.line}.t${r.take}`, r]));
  const failures: string[] = [];
  console.log(`render: ${jobs.length} takes`);
  await pool(jobs, 6, async ({ c, l, take }) => {
    const wav = wavPath(c, l, take), mp3 = mp3Path(c, l, take);
    if (!force && existsSync(wav) && existsSync(mp3) && byKey.has(`${c.id}/${l.id}.t${take}`)) return;
    let buf: Buffer | undefined;
    let err: unknown;
    for (let attempt = 0; attempt < 4 && !buf; attempt++) {
      try { buf = await speak(c, l.text); } catch (e) { err = e; await new Promise((r) => setTimeout(r, 3000 * (attempt + 1))); }
    }
    if (!buf) { failures.push(`${c.id}/${l.id}.t${take}: ${String(err).slice(0, 200)}`); return; }
    mkdirSync(dirname(wav), { recursive: true });
    writeFileSync(wav, buf);
    finish(buf, mp3);
    const seconds = Math.round(durationOf(mp3) * 100) / 100;
    byKey.set(`${c.id}/${l.id}.t${take}`, {
      id: c.id, line: l.id, role: l.role, text: l.text, take, wav: rel(wav), mp3: rel(mp3), seconds,
      wps: Math.round((wordCount(l.text) / seconds) * 100) / 100, lufs: Math.round(measureLufs(mp3) * 10) / 10,
    });
    process.stdout.write(".");
  });
  console.log();
  const all = [...byKey.values()].sort((a, b) => a.id.localeCompare(b.id) || a.line.localeCompare(b.line) || a.take - b.take);
  mkdirSync(RUN, { recursive: true });
  writeFileSync(rendersPath, JSON.stringify(all, null, 1));
  if (failures.length) { console.log("render failures:\n" + failures.join("\n")); writeFileSync(join(RUN, "render-failures.json"), JSON.stringify(failures, null, 1)); }
}

// ------------------------------------------------------------------ judges
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const audio = (f: string) => ({ inlineData: { mimeType: f.endsWith(".mp3") ? "audio/mp3" : "audio/wav", data: readFileSync(join(ROOT, f)).toString("base64") } });
const renders = (): Render[] => loadJson(rendersPath, []).filter((r: Render) => !only || only.includes(r.id));

async function ask(parts: any[]): Promise<any> {
  let vote: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const json = await generate(JUDGE_MODEL, { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 1 } });
    try { return JSON.parse(textOf(json)); } catch { vote = { error: textOf(json).slice(0, 200) }; }
  }
  return vote;
}

/** Cast votes for (key, vote-index) jobs, saving as it goes. */
async function castVotes(out: string, jobs: { key: string; v: number; meta: any; run: () => Promise<any> }[], n = 10) {
  const res: Record<string, any> = loadJson(out, {});
  const todo = shuffle(jobs).filter((j) => force || !res[j.key]?.votes?.[j.v]);
  console.log(`${out.replace(ROOT + "/", "")}: ${todo.length} votes to cast`);
  let k = 0;
  await pool(todo, n, async (j) => {
    const vote = await j.run();
    res[j.key] ??= { ...j.meta, votes: [] };
    res[j.key].votes[j.v] = vote;
    if (++k % 25 === 0) { writeFileSync(out, JSON.stringify(res, null, 1)); process.stdout.write(`${k} `); }
  });
  writeFileSync(out, JSON.stringify(res, null, 1));
  console.log();
}

// Judge 1, verbatim from audit-judge.ts.
const ACCENTS = ["Southern British English (RP or modern standard)", "another British accent", "American", "Australian", "another accent"];
const FEATURES = [
  "a rhotic r: an r sounded after a vowel, as in car, bird, four or water",
  "a flapped t: a quick d-like t between vowels, as in water or butter",
  "the TRAP vowel (as in cat) in bath, grass, dance, fast, after or can't",
  "'tomayto' (the FACE vowel in tomato)",
];
function judgePrompt(text: string, accents: string[], features: string[]) {
  return `Listen carefully to this speech clip. The words are: "${text}"

Which accent is this: ${accents.slice(0, -1).join(", ")} or ${accents.at(-1)}?
Rate 1-10 how convincingly Southern British it is (10 = unmistakably Southern British, like a CBeebies presenter; 1 = clearly not British).
List any American features you actually hear, naming the word where you hear it. Features to listen for:
${features.map((f) => `- ${f}`).join("\n")}
List only features you hear in this clip; an empty list is fine.

Reply ONLY with JSON: {"accent": "<one of: ${accents.join(" | ")}>", "southern_british": <1-10>, "american_features": [{"feature": "<short name>", "word": "<word>"}], "british_features": ["<short evidence, e.g. non-rhotic car>"], "notes": "<one sentence>"}`;
}
async function stageJudge() {
  const jobs = renders().filter((r) => JUDGED.has(r.line)).flatMap((r) => Array.from({ length: VOTES }, (_, v) => ({
    key: `${r.id}/${r.line}.t${r.take}`, v, meta: { id: r.id, line: r.line, role: r.role, take: r.take, file: r.mp3 },
    run: async () => {
      const accents = shuffle(ACCENTS), features = shuffle(FEATURES);
      return { ...(await ask([audio(r.mp3), { text: judgePrompt(r.text, accents, features) }])), order: { accents, features: features.map((f) => f.split(":")[0].slice(0, 20)) } };
    },
  })));
  await castVotes(join(RUN, "judge.json"), jobs);
}

// ABX, verbatim from audit-judge-abx.ts.
const ABX_QUESTION = `Clips A and B are two different speakers with two different accents, saying the same sentence. Clip X is a third speaker saying it too.
Ignore the voice itself (pitch, gender, age, timbre, speed, emotion, recording quality). Compare ONLY pronunciation: the vowels (for example in fast, bath, grass, dance, can't, half, past, mat), whether an r is sounded after a vowel (car, four, first, word, world), and how a t between vowels sounds (water, butter).
Whose accent does X share: A's or B's?
Reply ONLY with JSON: {"closer": "A" | "B", "p_A": <0-100, how likely X's accent is A's>, "reason": "<one sentence naming the words that decided it>"}`;
const ANCHORS: Record<Role, [string, string]> = { sensei: ["eleven-alice", "openai-coral"], narrator: ["eleven-alice", "openai-coral"], baron: ["eleven-george-baron", "openai-ash"] };
const anchor = (cast: string, line: string) => `playtest/runs/voice-picker/audit/raw/${cast}/${line}.t1.wav`;
async function stageAbx() {
  const jobs = renders().filter((r) => JUDGED.has(r.line)).flatMap((r) => Array.from({ length: VOTES }, (_, v) => {
    const [uk, us] = ANCHORS[r.role];
    return {
      key: `${r.id}/${r.line}.t${r.take}`, v, meta: { id: r.id, line: r.line, role: r.role, take: r.take, uk, us, file: r.mp3 },
      run: async () => {
        const ukIsA = Math.random() < 0.5;
        const [a, b] = ukIsA ? [anchor(uk, r.line), anchor(us, r.line)] : [anchor(us, r.line), anchor(uk, r.line)];
        const vote = await ask([{ text: "Clip A:" }, audio(a), { text: "Clip B:" }, audio(b), { text: "Clip X:" }, audio(r.mp3), { text: ABX_QUESTION }]);
        const pA = typeof vote.p_A === "number" ? vote.p_A : vote.closer === "A" ? 100 : 0;
        return { ...vote, ukIsA, p_uk: ukIsA ? pA : 100 - pA, pick: (vote.closer === "A") === ukIsA ? "uk" : "us" };
      },
    };
  }));
  await castVotes(join(RUN, "abx.json"), jobs);
}

// Role fit: teacher warmth (Sensei), storytelling (narrator), villain (Baron).
const FIT_PROMPT: Record<Role, string> = {
  sensei: `You are casting the voice of Sensei Maple, a kind ninja teacher in a phonics game for British children aged 3 to 8. She teaches them to read, praises them, and gently corrects mistakes. Listen to this line.
Rate 1-10 "teacher warmth": how much this sounds like a warm, kind, encouraging, smiling infant-school teacher or a CBeebies presenter speaking to a 4-year-old. 10 = you would trust her with your child at once: warm, calm, unhurried, smiling, encouraging. 5 = neutral, like a newsreader or an automated announcement. 1 = cold, harsh, bored, sarcastic or robotic.
Also rate 1-10 "clarity" for a young child (clear articulation, an unhurried pace) and 1-10 "natural" (sounds like a real person, not a synthetic voice).
Ignore the accent. Be discerning: use the whole scale, and keep 9-10 for truly outstanding.`,
  narrator: `You are casting the narrator of the story film and storybook pages in a phonics game for British children aged 3 to 8 (a magical island, a World Flower, a comic villain called Baron Muddle). Listen to this line.
Rate 1-10 "storytelling": how much this sounds like a captivating, warm storyteller reading a bedtime story or a children's audiobook. 10 = spellbinding: warm, expressive, well paced, you want to hear what happens next. 5 = a flat, competent reading. 1 = cold, rushed, monotonous or robotic.
Also rate 1-10 "clarity" for a young child and 1-10 "natural" (sounds like a real person, not a synthetic voice).
Ignore the accent. Be discerning: use the whole scale, and keep 9-10 for truly outstanding.`,
  baron: `You are casting Baron Muddle, the comic villain of a phonics game for British children aged 3 to 8. He steals the sounds of the alphabet and hates words. He should be a theatrical pantomime villain: funny-scary, gleefully grumpy, fun for small children, never genuinely frightening. Listen to this line.
Rate 1-10 "villain": 10 = a delightful, larger-than-life pantomime baddie a 5-year-old would love to boo. 5 = a plain man reading a line. 1 = flat or bored, or so aggressive it would frighten a 3-year-old.
Also rate 1-10 "clarity" for a young child and 1-10 "natural" (sounds like a real person, not a synthetic voice).
Ignore the accent. Be discerning: use the whole scale, and keep 9-10 for truly outstanding.`,
};
const FIT_KEY: Record<Role, string> = { sensei: "warmth", narrator: "storytelling", baron: "villain" };
async function stageFit() {
  const jobs = renders().filter((r) => r.take === 1).flatMap((r) => Array.from({ length: FIT_VOTES }, (_, v) => ({
    key: `${r.id}/${r.line}.t1`, v, meta: { id: r.id, line: r.line, role: r.role, file: r.mp3 },
    run: () => ask([audio(r.mp3), { text: `${FIT_PROMPT[r.role]}\nThe words are: "${r.text}"\n\nReply ONLY with JSON: {"${FIT_KEY[r.role]}": <1-10>, "clarity": <1-10>, "natural": <1-10>, "notes": "<one sentence>"}` }]),
  })));
  await castVotes(join(RUN, "fit.json"), jobs);
}

function stageMeasure() {
  execFileSync("uv", ["run", "-q", "--with", "numpy", "--with", "praat-parselmouth", "--with", "mlx-whisper", "python", join(ROOT, "scripts/voice-picker/gemini-measure.py"), JSON.stringify(Object.fromEntries(CANDIDATES.map((c) => [c.id, c.sex])))], { stdio: "inherit" });
}

// ------------------------------------------------------------------ collect
const mean = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
const RHOTIC_CUT = 0.72, BATH_CUT = 0.6; // audit-library-summary.py
const RESWITCH =
  "Switching Sensei to this voice means re-recording every line (~1,250 in public/a/l, 65 story pages in public/a/s), every word (~1,240 in public/a/w, ~1,000 stretched words in public/a/x, the held first sounds in public/a/o), and rebuilding all 46 pure sounds in public/a/p from the new voice, because they are cut from Sulafat words.";

function stageCollect() {
  const rs: Render[] = loadJson(rendersPath, []);
  const judge: Record<string, any> = loadJson(join(RUN, "judge.json"), {});
  const abx: Record<string, any> = loadJson(join(RUN, "abx.json"), {});
  const fit: Record<string, any> = loadJson(join(RUN, "fit.json"), {});
  const meas: Record<string, any> = loadJson(join(RUN, "measures.json"), {});
  const failures: string[] = loadJson(join(RUN, "render-failures.json"), []);
  const align: Record<string, { w: string }[]> = loadJson(join(RUN, "align-mlx-medium.json"), {});
  const out = CANDIDATES.map((c) => {
    const mine = rs.filter((r) => r.id === c.id);
    const files: Record<string, string[]> = {};
    const takes: Record<string, string[]> = {};
    for (const role of c.roles) files[role] = mine.filter((r) => r.role === role && r.take === 1).sort((a, b) => a.line.localeCompare(b.line)).map((r) => r.mp3);
    for (const r of mine.filter((r) => r.take > 1)) (takes[r.line] ??= []).push(r.mp3);
    const byRole: Record<string, any> = {};
    const allAmerican: string[] = [];
    for (const role of c.roles) {
      const jv = Object.values(judge).filter((j: any) => j.id === c.id && j.role === role).flatMap((j: any) => j.votes.filter(Boolean).map((v: any) => ({ ...v, line: j.line, take: j.take })));
      const av = Object.values(abx).filter((j: any) => j.id === c.id && j.role === role).flatMap((j: any) => j.votes.filter((v: any) => v && "pick" in v).map((v: any) => ({ ...v, line: j.line, take: j.take })));
      const fv = Object.values(fit).filter((j: any) => j.id === c.id && j.role === role).flatMap((j: any) => j.votes.filter(Boolean));
      const key = FIT_KEY[role];
      // American features the briefed judge reported, counted over its votes
      const feat = new Map<string, number>();
      for (const v of jv) for (const f of v.american_features ?? []) {
        const k = `${String(f.feature ?? "").toLowerCase().replace(/\s+/g, " ").slice(0, 40)} in "${String(f.word ?? "").toLowerCase()}"`;
        feat.set(k, (feat.get(k) ?? 0) + 1);
      }
      const judgeFeatures = [...feat.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (judge, ${n}/${jv.length} votes)`);
      // Acoustic flags (audit-measure.py measures, the audit's cut-offs)
      const ms = (meas[c.id]?.measures ?? []).filter((m: any) => TEST_SCRIPT.find((l) => l.id === m.line)?.role === role);
      const bath = meas[c.id]?.bath ?? {};
      const rhotic = ms.filter((m: any) => m.f3_ratio != null);
      const rFlags = rhotic.filter((m: any) => m.f3_ratio < RHOTIC_CUT);
      const bathMs = ms.filter((m: any) => m.bath_index != null && m.word !== "tomato");
      const bFlags = bathMs.filter((m: any) => m.bath_index > BATH_CUT);
      const tMs = ms.filter((m: any) => m.t);
      const tFlags = tMs.filter((m: any) => String(m.t.kind).startsWith("flap"));
      const tomato = ms.filter((m: any) => m.word === "tomato" && m.bath_index != null);
      const tomFlags = tomato.filter((m: any) => m.bath_index > 1);
      const acousticFeatures = [
        ...rFlags.map((m: any) => `r-coloured "${m.word}" (acoustic, ${m.line} take ${m.take}, F3 ratio ${m.f3_ratio})`),
        ...bFlags.map((m: any) => `flat TRAP vowel in "${m.word}" (acoustic, ${m.line} take ${m.take}, BATH index ${m.bath_index})`),
        ...tFlags.map((m: any) => `flapped t in "${m.word}" (acoustic, ${m.line} take ${m.take}, ${m.t.gap_ms} ms gap)`),
        ...tomFlags.map((m: any) => `"tomayto" (acoustic, ${m.line} take ${m.take}, index ${m.bath_index})`),
      ];
      const tokens = rhotic.length + bathMs.length + tMs.length + tomato.length;
      const flags = rFlags.length + bFlags.length + tFlags.length + tomFlags.length;
      const abxUk = av.length ? av.filter((v: any) => v.pick === "uk").length / av.length : null;
      const acousticClean = tokens ? 1 - flags / tokens : null;
      const parts = [abxUk, acousticClean].filter((x): x is number => x != null);
      const accent10 = parts.length ? Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) / 10 : null;
      const fitScore = mean(fv.map((v: any) => Number(v[key])).filter(Number.isFinite));
      byRole[role] = {
        britishScore: mean(jv.map((v) => Number(v.southern_british)).filter(Number.isFinite)),
        britishVotes: `${jv.filter((v) => /southern british/i.test(v.accent ?? "")).length}/${jv.length} "Southern British"`,
        abxBritish: av.length ? `${av.filter((v: any) => v.pick === "uk").length}/${av.length}` : null,
        abxBritishPct: abxUk == null ? null : Math.round(abxUk * 100),
        abxAmericanReasons: av.filter((v: any) => v.pick === "us").map((v: any) => `${v.line} t${v.take}: ${String(v.reason ?? "").slice(0, 140)}`).slice(0, 4),
        acoustic: { tokens, flags, rhotic: `${rFlags.length}/${rhotic.length} r-coloured`, bath: `${bFlags.length}/${bathMs.length} flat`, t: `${tFlags.length}/${tMs.length} flapped`, tomato: `${tomFlags.length}/${tomato.length} tomayto`, bathIndex: bath.words ?? null },
        accent10,
        [key]: fitScore,
        clarity: mean(fv.map((v: any) => Number(v.clarity)).filter(Number.isFinite)),
        natural: mean(fv.map((v: any) => Number(v.natural)).filter(Number.isFinite)),
        fitNotes: fv.map((v: any) => v.notes).filter(Boolean).slice(0, 3),
        wpsMax: Math.max(...mine.filter((r) => r.role === role).map((r) => r.wps ?? 0)),
        americanFeatures: [...acousticFeatures, ...judgeFeatures],
        // the ranking: the calibrated accent evidence and the role fit, equally
        overall: accent10 != null && fitScore != null ? Math.round(((accent10 + fitScore) / 2) * 10) / 10 : null,
      };
      allAmerican.push(...byRole[role].americanFeatures.map((f: string) => (c.roles.length > 1 ? `${role}: ${f}` : f)));
    }
    const allJudge = c.roles.map((r) => byRole[r].britishScore).filter((x: any) => x != null);
    const notes: string[] = [];
    if (c.current) notes.push(`Today's ${c.current.join(" and ")} voice.`);
    if (!c.lang) notes.push("Rendered with no languageCode, to compare with the en-GB candidate of the same voice.");
    if (c.model !== MODEL) notes.push(`Model ${c.model} instead of the game's ${MODEL}: the same voice name, a different rendering.`);
    if (c.roles.includes("sensei") && !(c.voice === "Sulafat" && c.model === MODEL && c.lang === "en-GB")) notes.push(RESWITCH);
    if (c.voice === "Sulafat" && c.model === MODEL && c.lang === "en-GB") notes.push("The game's Sensei today: no re-recording needed. Its shipped clips have known American slips (playtest/voice-picker/audit.md).");
    const miss = failures.filter((f) => f.startsWith(c.id + "/"));
    if (miss.length) notes.push(`Render failures: ${miss.join("; ")}`);
    const slow = c.roles.flatMap((r) => mine.filter((m) => m.role === r && (m.wps ?? 0) > 3.3).map((m) => `${m.line} t${m.take} ${m.wps} words/s`));
    if (slow.length) notes.push(`Faster than the game's 3.3 words a second: ${slow.join(", ")}.`);
    // What Whisper heard, against the script: a take that drops words (a model obeying "say it slowly" instead of reading it)
    const words = (s: string) => s.toLowerCase().replace(/’/g, "'").match(/[a-z']+/g) ?? [];
    const heardWrong = mine.flatMap((m) => {
      const heard = (align[m.wav] ?? []).map((w: any) => w.w).join(" ");
      const a = words(m.text), b = words(heard);
      const missing = a.filter((w) => !b.includes(w)), extra = b.filter((w) => !a.includes(w));
      return missing.length || extra.length ? [`${m.line} take ${m.take} heard as "${heard}"`] : [];
    });
    if (heardWrong.length) notes.push(`Whisper heard these takes differently from the script: ${heardWrong.join("; ")}.`);
    if (c.model.includes("2.5-pro") && heardWrong.some((h) => /^sensei-[34]/.test(h)))
      notes.push("This model acts on teaching lines instead of reading them: given \"Say mat slowly. Now say it fast.\" it just says \"mat\", and it drops \"Let's say it the slow way first, then the fast way.\" That rules it out for Sensei, whose script is full of such lines.");
    return {
      id: c.id, provider: "gemini", voice: c.voice, label: c.label,
      settings: { model: c.model, languageCode: c.lang, voiceName: c.voice, character: CHARACTER[c.voice], sex: c.sex, input: "plain text (Gemini TTS reads style instructions aloud)", finish: "trimmed, 25 ms fades, -16 LUFS two-pass, -1.5 dBTP, 112 kbps CBR mono MP3, 44.1 kHz" },
      roles: c.roles, current: c.current ?? [],
      files, takes,
      // britishScore: the audit's briefed judge (Judge 1), as asked. The audit showed it cannot tell (macOS Samantha, an
      // American control, scored 8.4), so accentScore (ABX votes and acoustics, calibrated on known controls) is the one to rank by.
      britishScore: mean(allJudge),
      accentScore: mean(c.roles.map((r) => byRole[r].accent10).filter((x: any) => x != null)),
      americanFeatures: allAmerican,
      warmth: byRole.sensei?.warmth ?? null,
      byRole,
      costPerMinuteUSD: perMinute(c.model),
      notes: notes.join(" "),
    };
  });
  writeFileSync(OUT_JSON, JSON.stringify(out, null, 1));
  console.log("wrote", OUT_JSON, out.length, "candidates");
  for (const role of ["sensei", "narrator", "baron"] as Role[]) {
    const rows = out.filter((o) => o.roles.includes(role)).map((o) => ({ id: o.id, ...o.byRole[role] })).sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));
    console.log(`\n== ${role}`);
    console.table(rows.map((r) => ({ id: r.id, overall: r.overall, accent10: r.accent10, abx: r.abxBritish, acoustic: `${r.acoustic.flags}/${r.acoustic.tokens}`, judge1: r.britishScore, fit: r[FIT_KEY[role]], clarity: r.clarity, natural: r.natural, wps: r.wpsMax })));
  }
}

if (want("render")) await stageRender();
if (want("judge")) await stageJudge();
if (want("abx")) await stageAbx();
if (want("fit")) await stageFit();
if (want("measure")) stageMeasure();
if (want("collect")) stageCollect();
