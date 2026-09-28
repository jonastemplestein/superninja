// Voice picker, the Cloudflare Workers AI renderer. Renders the accent test script (audit-script.ts) with the TTS models
// the dev account can run through /ai/run: the Cloudflare-hosted ones (@cf/deepgram/aura-2-en, @cf/deepgram/aura-1,
// @cf/myshell-ai/melotts) and the third-party ones billed through AI Gateway Unified Billing (inworld/tts-2,
// minimax/speech-2.8-hd, xai/grok-tts). ElevenLabs, OpenAI and Gemini voices are other renderers' jobs.
//
//   doppler run -p os-legacy-2026-04 -c dev -- doppler run -p os -c dev -- bun scripts/voice-picker/workers-ai.ts <step> [ids]
//   (os/dev is the inner run so its Cloudflare token wins; os-legacy supplies APP_CONFIG_GEMINI_API_KEY for the judges)
//
// Steps:
//   screen   render sensei-2 and sensei-6 with every voice in SCREEN (about 60) and ask the ABX judge (2 votes a clip)
//            whose accent each shares, British or American. Out: playtest/runs/voice-picker/workers-ai/screen.json
//   render   render the whole test script with the CANDIDATES (plus takes 2 and 3 of the accent lines), finished to
//            playtest/voice-picker/audio/workers-ai/<id>/<line>.mp3 (-16 LUFS, trimmed, 112 kbps mono)
//   judge    the audit's briefed judge (3 votes on sensei-2, sensei-6, narrator-1), the ABX judge (3 votes a take),
//            teacher warmth (Sensei), storytelling (narrator) and villainy (Baron). Out: .../workers-ai/judge.json
//   write    playtest/voice-picker/candidates-workers-ai.json
//   all      render + judge + write
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { generate, pool, textOf } from "../gemini";
import { gainTo, durationOf, measureLufs, SPEECH_LUFS } from "../tts";
import { TEST_SCRIPT, type Role, type TestLine } from "./audit-script";

const ROOT = join(import.meta.dir, "../..");
const RUNS = join(ROOT, "playtest/runs/voice-picker/workers-ai");
const PICKER = join(ROOT, "playtest/voice-picker");
const AUDIO = join(PICKER, "audio/workers-ai");
const ANCHORS = join(ROOT, "playtest/runs/voice-picker/audit/raw");
const JUDGE_MODEL = "gemini-3.8-flash";
const args = process.argv.slice(2);
const step = args[0];
const only = args[1] && !args[1].startsWith("--") ? args[1].split(",") : undefined;
const force = args.includes("--force");
const refinish = args.includes("--refinish"); // re-finish the mp3s from the cached raw takes

// ---------------------------------------------------------------------------------------------------------------------
// Engines

type Engine = "aura-2" | "aura-1" | "melotts" | "inworld" | "minimax" | "grok";
interface Voice {
  id: string;
  engine: Engine;
  model: string;
  voice: string;
  settings: Record<string, unknown>;
  /** Extra text put before each line of a role (Inworld's bracketed steering). */
  steer?: Partial<Record<Role, string>>;
  gender: "f" | "m";
  label: string;
}

/** List prices, USD. Cloudflare-hosted: the account's model catalogue. Third-party: the provider's on-demand rate
 *  (Unified Billing passes provider pricing through; the dashboard shows the exact figure). */
const PRICE: Record<Engine, { perChar?: number; perAudioMinute?: number; source: string }> = {
  "aura-2": { perChar: 0.03 / 1000, source: "Workers AI catalogue: $0.03 per 1k characters" },
  "aura-1": { perChar: 0.015 / 1000, source: "Workers AI catalogue: $0.015 per 1k characters" },
  melotts: { perAudioMinute: 0.000205, source: "Workers AI catalogue: $0.000205 per audio minute" },
  inworld: { perChar: 25 / 1e6, source: "Inworld on-demand: $25 per 1M characters (TTS-2)" },
  minimax: { perChar: 100 / 1e6, source: "MiniMax pay-as-you-go: $100 per 1M characters (Speech 2.8 HD)" },
  grok: { perChar: 15 / 1e6, source: "xAI: $15 per 1M characters (Grok TTS)" },
};

const CF = () => `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run`;
const cfHeaders = () => ({ authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "content-type": "application/json" });

async function cfNative(model: string, input: unknown): Promise<Buffer> {
  const res = await fetch(`${CF()}/${model}`, { method: "POST", headers: cfHeaders(), body: JSON.stringify(input) });
  const ct = res.headers.get("content-type") ?? "";
  if (!res.ok) throw new Error(`${model} ${res.status} ${(await res.text()).slice(0, 300)}`);
  if (ct.startsWith("audio/")) return Buffer.from(await res.arrayBuffer());
  const json: any = await res.json();
  const audio = json?.result?.audio;
  if (!audio) throw new Error(`${model}: no audio ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(audio, "base64");
}

async function cfThirdParty(model: string, input: unknown): Promise<Buffer> {
  const res = await fetch(CF(), { method: "POST", headers: cfHeaders(), body: JSON.stringify({ model, input }) });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(`${model} ${res.status} ${JSON.stringify(json.errors ?? json).slice(0, 300)}`);
  const r = json.result?.result ?? json.result;
  if (!r?.audio) throw new Error(`${model}: no audio ${JSON.stringify(json).slice(0, 300)}`);
  const a = await fetch(r.audio);
  if (!a.ok) throw new Error(`${model}: audio fetch ${a.status}`);
  return Buffer.from(await a.arrayBuffer());
}

async function synth(v: Voice, text: string): Promise<Buffer> {
  switch (v.engine) {
    case "aura-2":
    case "aura-1":
      return cfNative(v.model, { text, speaker: v.voice, encoding: "linear16", container: "wav", sample_rate: 48000 });
    case "melotts":
      return cfNative(v.model, { prompt: text, ...v.settings });
    case "inworld":
      return cfThirdParty(v.model, { text, voice_id: v.voice, output_format: "wav", sample_rate: 48000, timestamp_type: "none", temperature: 1, ...v.settings });
    case "minimax":
      return cfThirdParty(v.model, { text, voice_id: v.voice, format: "wav", speed: 1, volume: 1, pitch: 0, ...v.settings });
    case "grok":
      return cfThirdParty(v.model, { text, voice_id: v.voice, language: "en", output_format: { codec: "mp3", sample_rate: 44100, bit_rate: 192000 }, ...v.settings });
  }
}

const ffmpeg = (a: string[]) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);

/** Render one take to a 44.1 kHz mono wav (kept raw, for the judges). Retries; cached unless --force. */
async function renderRaw(v: Voice, line: TestLine, take: number, dir: string): Promise<string> {
  const out = join(dir, v.id, `${line.id}.t${take}.wav`);
  if (existsSync(out) && !force) return out;
  mkdirSync(dirname(out), { recursive: true });
  const text = (v.steer?.[line.role] ? v.steer[line.role] + " " : "") + line.text;
  let buf: Buffer | undefined;
  for (let attempt = 0; ; attempt++) {
    try { buf = await synth(v, text); break; } catch (e) {
      if (attempt >= 3) throw e;
      await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
    }
  }
  const src = out.replace(/\.wav$/, ".src");
  writeFileSync(src, buf!);
  ffmpeg(["-i", src, "-ac", "1", "-ar", "44100", out]);
  return out;
}

/** Like scripts/tts.ts finishAudio (trim, 25 ms fades, two-pass gain to -16 LUFS, -1.5 dBTP limiter), but a
 *  112 kbps CBR mono MP3 for the picker. */
function finish(wav: string, outMp3: string) {
  const dir = mkdtempSync(join(tmpdir(), "vp-wai-"));
  mkdirSync(dirname(outMp3), { recursive: true });
  const trim =
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03," +
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  const fades = "afade=t=in:d=0.025,areverse,afade=t=in:d=0.025,areverse";
  const trimmed = join(dir, "trim.wav");
  ffmpeg(["-i", wav, "-af", `${trim},${fades}`, "-ar", "44100", "-ac", "1", trimmed]);
  // The limiter pulls peaky takes (a shouting Baron) below target, so re-measure the encoded clip and correct (≤ 3 passes)
  let gain = gainTo(trimmed, SPEECH_LUFS);
  for (let pass = 0; pass < 3; pass++) {
    ffmpeg(["-i", trimmed, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=0.05`,
      "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "112k", outMp3]);
    const off = SPEECH_LUFS - measureLufs(outMp3);
    if (!Number.isFinite(off) || Math.abs(off) <= 0.3) break;
    gain += off;
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Voices

const aura = (engine: "aura-2" | "aura-1", voice: string, gender: "f" | "m", accent: string): Voice => ({
  id: `deepgram-${engine.replace("-", "")}-${voice}`, engine, model: `@cf/deepgram/${engine === "aura-2" ? "aura-2-en" : "aura-1"}`, voice,
  settings: { speaker: voice, encoding: "linear16", container: "wav", sample_rate: 48000 }, gender,
  label: `Deepgram ${engine === "aura-2" ? "Aura-2" : "Aura-1"} ${cap(voice)} (${accent}, Cloudflare-hosted)`,
});
const inworld = (voice: string, gender: "f" | "m", note = ""): Voice => ({
  id: `inworld-tts2-${voice.toLowerCase()}`, engine: "inworld", model: "inworld/tts-2", voice, settings: { temperature: 1 }, gender,
  label: `Inworld TTS-2 ${voice}${note ? ` (${note})` : ""}`,
});
const minimax = (voice: string, gender: "f" | "m"): Voice => ({
  id: `minimax-hd-${voice.replace(/^English_/, "").replace(/[_\s]+/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`,
  engine: "minimax", model: "minimax/speech-2.8-hd", voice, settings: {}, gender,
  label: `MiniMax Speech 2.8 HD ${voice.replace(/^English_/, "").replace(/_/g, " ")}`,
});
const grok = (voice: string, gender: "f" | "m"): Voice => ({
  id: `xai-grok-${voice}`, engine: "grok", model: "xai/grok-tts", voice, settings: {}, gender, label: `xAI Grok TTS ${cap(voice)}`,
});
function cap(s: string) { return s[0].toUpperCase() + s.slice(1); }

/** The screening pool: every voice on the account that might be British (plus a few to check). */
const SCREEN: Voice[] = [
  aura("aura-2", "draco", "m", "British male"), aura("aura-2", "pandora", "f", "British female"),
  aura("aura-1", "athena", "f", "British female"), aura("aura-1", "helios", "m", "British male"),
  { id: "melotts-en", engine: "melotts", model: "@cf/myshell-ai/melotts", voice: "EN default", settings: { lang: "en" }, gender: "f", label: "MeloTTS, lang en (Cloudflare-hosted)" },
  { id: "melotts-en-gb", engine: "melotts", model: "@cf/myshell-ai/melotts", voice: "lang en-GB", settings: { lang: "en-GB" }, gender: "f", label: "MeloTTS, lang en-GB" },
  // Inworld: British by its own tags (Clive, Craig, Olivia, Ronald, Wendy) or by third-party listings; the rest checked
  ...["Sophie", "Eleanor", "Victoria", "Olivia", "Wendy", "Elizabeth", "Evelyn", "Claire", "Miranda", "Celeste", "Deborah", "Serena"].map((v) => inworld(v, "f")),
  ...["Rupert", "Graham", "Clive", "Craig", "Ronald", "James", "Gareth", "Felix", "Duncan", "Cedric", "Sebastian", "Malcolm", "Lucian", "Theodore", "Edward", "Mortimer", "Hades"].map((v) => inworld(v, "m")),
  // MiniMax system English voices (no accent labels published; the judge sorts them)
  ...["English_Graceful_Lady", "English_Wiselady", "English_SereneWoman", "English_CalmWoman", "English_AssertiveQueen", "English_compelling_lady1",
    "English_captivating_female1", "English_Kind-heartedGirl", "English_Upbeat_Woman", "English_radiant_girl", "English_ConfidentWoman", "English_SentimentalLady"].map((v) => minimax(v, "f")),
  ...["English_expressive_narrator", "English_CaptivatingStoryteller", "English_WiseScholar", "English_ImposingManner", "English_Deep-VoicedGentleman",
    "English_Steadymentor", "English_Trustworth_Man", "English_Gentle-voiced_man", "English_magnetic_voiced_man", "English_MatureBoss", "English_PatientMan", "English_ManWithDeepVoice"].map((v) => minimax(v, "m")),
  ...(["eve", "ara"] as const).map((v) => grok(v, "f")), ...(["rex", "sal", "leo"] as const).map((v) => grok(v, "m")),
];

/** The full candidates (chosen from the screen, see candidates-workers-ai.json notes). Filled in after screening. */
const CANDIDATE_IDS: { id: string; roles: Role[]; variant?: Partial<Voice> & { id: string; label: string } }[] = JSON.parse(
  existsSync(join(RUNS, "candidates.json")) ? readFileSync(join(RUNS, "candidates.json"), "utf8") : "[]",
);
function candidates(): (Voice & { roles: Role[] })[] {
  return CANDIDATE_IDS.map((c) => {
    const base = SCREEN.find((v) => v.id === c.id);
    if (!base) throw new Error("unknown voice " + c.id);
    const v = c.variant ? { ...base, ...c.variant, settings: { ...base.settings, ...(c.variant.settings ?? {}) } } : base;
    return { ...v, roles: c.roles };
  }).filter((c) => !only || only.includes(c.id));
}

// ---------------------------------------------------------------------------------------------------------------------
// Judges (prompts copied from audit-judge.ts and audit-judge-abx.ts, so the scores compare with the audit's)

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const audioPart = (f: string) => ({ inlineData: { mimeType: f.endsWith(".mp3") ? "audio/mp3" : "audio/wav", data: readFileSync(f).toString("base64") } });

const ACCENTS = ["Southern British English (RP or modern standard)", "another British accent", "American", "Australian", "another accent"];
const FEATURES = [
  "a rhotic r: an r sounded after a vowel, as in car, bird, four or water",
  "a flapped t: a quick d-like t between vowels, as in water or butter",
  "the TRAP vowel (as in cat) in bath, grass, dance, fast, after or can't",
  "'tomayto' (the FACE vowel in tomato)",
];
function briefedPrompt(text: string, accents: string[], features: string[]) {
  return `Listen carefully to this speech clip. The words are: "${text}"

Which accent is this: ${accents.slice(0, -1).join(", ")} or ${accents.at(-1)}?
Rate 1-10 how convincingly Southern British it is (10 = unmistakably Southern British, like a CBeebies presenter; 1 = clearly not British).
List any American features you actually hear, naming the word where you hear it. Features to listen for:
${features.map((f) => `- ${f}`).join("\n")}
List only features you hear in this clip; an empty list is fine.

Reply ONLY with JSON: {"accent": "<one of: ${accents.join(" | ")}>", "southern_british": <1-10>, "american_features": [{"feature": "<short name>", "word": "<word>"}], "british_features": ["<short evidence, e.g. non-rhotic car>"], "notes": "<one sentence>"}`;
}
const ABX_QUESTION = `Clips A and B are two different speakers with two different accents, saying the same sentence. Clip X is a third speaker saying it too.
Ignore the voice itself (pitch, gender, age, timbre, speed, emotion, recording quality). Compare ONLY pronunciation: the vowels (for example in fast, bath, grass, dance, can't, half, past, mat), whether an r is sounded after a vowel (car, four, first, word, world), and how a t between vowels sounds (water, butter).
Whose accent does X share: A's or B's?
Reply ONLY with JSON: {"closer": "A" | "B", "p_A": <0-100, how likely X's accent is A's>, "reason": "<one sentence naming the words that decided it>"}`;
/** Anchors from the audit: ElevenLabs Alice (British) vs OpenAI coral (American); for the Baron, ElevenLabs George vs OpenAI ash. */
const anchorsFor = (line: TestLine) => (line.role === "baron" ? ["eleven-george-baron", "openai-ash"] : ["eleven-alice", "openai-coral"]).map((c) => join(ANCHORS, c, `${line.id}.t1.wav`));

const FIT: Record<Role, { key: string; prompt: string }> = {
  sensei: {
    key: "warmth",
    prompt: `This is a casting audition for Sensei, the kind ninja teacher who teaches British children aged 3 to 8 to read with phonics (think a favourite reception-class teacher, or a CBeebies presenter).
Rate 1-10 its TEACHER WARMTH: warm, kind, patient, encouraging and clear, speaking to a small child (10), versus cold, flat, robotic, salesy, rushed or talking down (1).
Also rate 1-10 how natural and human it sounds (10 = could be a real person; 1 = obviously synthetic, glitchy or garbled).`,
  },
  narrator: {
    key: "storytelling",
    prompt: `This is a casting audition for the narrator of a children's animated film and bedtime-style story (British children aged 3 to 8).
Rate 1-10 its STORYTELLING: warm, magical, engaging, well paced, making a child lean in (10), versus flat, rushed, corporate or robotic (1).
Also rate 1-10 how natural and human it sounds (10 = could be a real person; 1 = obviously synthetic, glitchy or garbled).`,
  },
  baron: {
    key: "villainy",
    prompt: `This is a casting audition for Baron Muddle, the comic villain of a children's phonics game (children aged 3 to 8): a theatrical pantomime baddie who hates words, fun-scary but never truly frightening.
Rate 1-10 its VILLAINY: characterful, theatrical, gleefully wicked, with real energy on the capitalised words (10), versus flat, polite, bored or robotic (1).
Also rate 1-10 how natural and human it sounds (10 = could be a real person; 1 = obviously synthetic, glitchy or garbled).`,
  },
};
function fitPrompt(line: TestLine) {
  const f = FIT[line.role];
  return `Listen carefully to this speech clip. The words should be: "${line.text}"

${f.prompt}
Then check the words: list any word that is missing, added, mispronounced, or spelled out letter by letter (e.g. a capitalised word read as letters). An empty list is fine.

Reply ONLY with JSON: {"${f.key}": <1-10>, "naturalness": <1-10>, "word_errors": ["<word: what went wrong>"], "notes": "<one sentence on the delivery>"}`;
}

async function ask(parts: any[], tries = 3): Promise<any> {
  let last: any;
  for (let i = 0; i < tries; i++) {
    const json = await generate(JUDGE_MODEL, { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 1 } });
    try { return JSON.parse(textOf(json)); } catch { last = { error: textOf(json).slice(0, 200) }; }
  }
  return last;
}

async function abxVote(line: TestLine, x: string) {
  const [uk, us] = anchorsFor(line);
  const ukIsA = Math.random() < 0.5;
  const [a, b] = ukIsA ? [uk, us] : [us, uk];
  const vote = await ask([{ text: "Clip A:" }, audioPart(a), { text: "Clip B:" }, audioPart(b), { text: "Clip X:" }, audioPart(x), { text: ABX_QUESTION }]);
  const pA = typeof vote.p_A === "number" ? vote.p_A : vote.closer === "A" ? 100 : 0;
  return { ...vote, ukIsA, p_uk: ukIsA ? pA : 100 - pA, pick: (vote.closer === "A") === ukIsA ? "uk" : "us" };
}

// ---------------------------------------------------------------------------------------------------------------------
// Steps

const line = (id: string) => TEST_SCRIPT.find((l) => l.id === id)!;
const ACCENT_LINES = ["sensei-2", "sensei-6", "narrator-1"];
const EXTRA_TAKES = ["sensei-2", "sensei-6"]; // takes 2 and 3: accent drifts take to take (audit.md)

async function screen() {
  const dir = join(RUNS, "screen-raw");
  const out = join(RUNS, "screen.json");
  const res: Record<string, any> = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
  const pool_ = SCREEN.filter((v) => !only || only.includes(v.id));
  const lines = ["sensei-2", "sensei-6"].map(line);
  const failures: Record<string, string> = {};
  await pool(pool_.flatMap((v) => lines.map((l) => ({ v, l }))), 6, async ({ v, l }) => {
    try { await renderRaw(v, l, 1, dir); } catch (e) { failures[v.id] = String(e).slice(0, 300); console.log("✗", v.id, l.id, String(e).slice(0, 200)); }
  });
  const jobs = shuffle(pool_.flatMap((v) => lines.flatMap((l) => [0, 1].map((k) => ({ v, l, k })))))
    .filter(({ v, l, k }) => existsSync(join(dir, v.id, `${l.id}.t1.wav`)) && !res[v.id]?.votes?.[`${l.id}.${k}`]);
  console.log(`screen: ${pool_.length} voices, ${jobs.length} ABX votes`);
  await pool(jobs, 10, async ({ v, l, k }) => {
    const vote = await abxVote(l, join(dir, v.id, `${l.id}.t1.wav`));
    res[v.id] ??= { label: v.label, engine: v.engine, gender: v.gender, votes: {} };
    res[v.id].votes[`${l.id}.${k}`] = vote;
  });
  for (const [id, f] of Object.entries(failures)) (res[id] ??= { votes: {} }).error = f;
  writeFileSync(out, JSON.stringify(res, null, 1));
  const rows = Object.entries(res).map(([id, r]: [string, any]) => {
    const vs = Object.values(r.votes ?? {}) as any[];
    return { id, n: vs.length, uk: vs.filter((x) => x.pick === "uk").length, p: vs.length ? vs.reduce((s, x) => s + x.p_uk, 0) / vs.length : NaN, err: r.error };
  }).sort((a, b) => b.p - a.p);
  for (const r of rows) console.log(`${r.id.padEnd(40)} ${r.uk}/${r.n}  P(UK) ${r.p.toFixed(0)}${r.err ? "  ERROR " + r.err.slice(0, 100) : ""}`);
}

/** Second screen, for the voices the ABX screen called British (3 or more of 4 votes): render a Sensei, a narrator and
 *  a Baron line and ask the role-fit judge (2 votes a clip). Out: playtest/runs/voice-picker/workers-ai/screen2.json */
async function screen2() {
  const dir = join(RUNS, "screen-raw");
  const s1: Record<string, any> = JSON.parse(readFileSync(join(RUNS, "screen.json"), "utf8"));
  const british = SCREEN.filter((v) => Object.values(s1[v.id]?.votes ?? {}).filter((x: any) => x.pick === "uk").length >= 3 && (!only || only.includes(v.id)));
  const out = join(RUNS, "screen2.json");
  const res: Record<string, any> = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
  const lines = ["sensei-1", "sensei-5", "narrator-1", "baron-1"].map(line);
  await pool(british.flatMap((v) => lines.map((l) => ({ v, l }))), 6, async ({ v, l }) => {
    try { await renderRaw(v, l, 1, dir); } catch (e) { console.log("✗", v.id, l.id, String(e).slice(0, 200)); }
  });
  const jobs = shuffle(british.flatMap((v) => lines.flatMap((l) => [0, 1].map((k) => ({ v, l, k })))))
    .filter(({ v, l, k }) => existsSync(join(dir, v.id, `${l.id}.t1.wav`)) && !res[v.id]?.[`${l.id}.${k}`]);
  console.log(`screen2: ${british.length} voices, ${jobs.length} votes`);
  await pool(jobs, 10, async ({ v, l, k }) => {
    (res[v.id] ??= {})[`${l.id}.${k}`] = await ask([audioPart(join(dir, v.id, `${l.id}.t1.wav`)), { text: fitPrompt(l) }]);
  });
  writeFileSync(out, JSON.stringify(res, null, 1));
  const m = (r: any, prefix: string, k: string) => r1(mean(Object.entries(r).filter(([key]) => key.startsWith(prefix)).map(([, v]: any) => Number(v[k])).filter(Number.isFinite)));
  const rows = british.filter((v) => res[v.id]).map((v) => {
    const r = res[v.id];
    return { id: v.id, g: v.gender, warm: m(r, "sensei", "warmth"), story: m(r, "narrator", "storytelling"), villain: m(r, "baron", "villainy"), nat: m(r, "", "naturalness"),
      errs: Object.values(r).flatMap((x: any) => x.word_errors ?? []).length };
  });
  for (const r of rows.sort((a, b) => b.warm + b.nat - a.warm - a.nat))
    console.log(`${r.id.padEnd(40)} ${r.g} warm ${r.warm} story ${r.story} villain ${r.villain} natural ${r.nat} word-errors ${r.errs}`);
}

async function render() {
  const cands = candidates();
  const jobs = cands.flatMap((c) => TEST_SCRIPT.flatMap((l) => [1, ...(EXTRA_TAKES.includes(l.id) ? [2, 3] : [])].map((take) => ({ c, l, take }))));
  console.log(`render: ${cands.length} candidates, ${jobs.length} takes`);
  const failures: string[] = [];
  await pool(jobs, 6, async ({ c, l, take }) => {
    try {
      const wav = await renderRaw(c, l, take, join(RUNS, "raw"));
      const mp3 = join(AUDIO, c.id, `${l.id}${take > 1 ? `.take${take}` : ""}.mp3`);
      if (!existsSync(mp3) || force || refinish) finish(wav, mp3);
    } catch (e) { failures.push(`${c.id}/${l.id}.t${take}: ${String(e).slice(0, 200)}`); }
  });
  if (failures.length) console.log("FAILED\n" + failures.join("\n"));
}

async function judge() {
  const out = join(RUNS, "judge.json");
  const res: Record<string, any> = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
  const raw = (c: Voice, l: string, t = 1) => join(RUNS, "raw", c.id, `${l}.t${t}.wav`);
  type Job = { c: Voice; kind: "briefed" | "abx" | "fit"; l: TestLine; take: number; v: number };
  const jobs: Job[] = [];
  for (const c of candidates()) {
    for (const id of [...ACCENT_LINES, "baron-1"]) for (let v = 0; v < 3; v++) jobs.push({ c, kind: "briefed", l: line(id), take: 1, v });
    for (const id of [...ACCENT_LINES, "baron-1"]) for (const take of EXTRA_TAKES.includes(id) ? [1, 2, 3] : [1]) for (let v = 0; v < 3; v++) jobs.push({ c, kind: "abx", l: line(id), take, v });
    for (const id of ["sensei-1", "sensei-3", "sensei-5", "baron-1", "baron-2"]) for (let v = 0; v < 3; v++) jobs.push({ c, kind: "fit", l: line(id), take: 1, v });
    for (const id of ["narrator-1", "narrator-2", "narrator-3"]) for (let v = 0; v < 2; v++) jobs.push({ c, kind: "fit", l: line(id), take: 1, v });
  }
  const key = (j: Job) => `${j.c.id}|${j.kind}|${j.l.id}.t${j.take}`;
  const todo = shuffle(jobs).filter((j) => existsSync(raw(j.c, j.l.id, j.take)) && !res[key(j)]?.[j.v]);
  console.log(`judge: ${todo.length} votes`);
  let n = 0;
  await pool(todo, 10, async (j) => {
    const x = raw(j.c, j.l.id, j.take);
    let vote: any;
    if (j.kind === "briefed") {
      const accents = shuffle(ACCENTS), features = shuffle(FEATURES);
      vote = await ask([audioPart(x), { text: briefedPrompt(j.l.text, accents, features) }]);
    } else if (j.kind === "abx") vote = await abxVote(j.l, x);
    else vote = await ask([audioPart(x), { text: fitPrompt(j.l) }]);
    (res[key(j)] ??= [])[j.v] = vote;
    if (++n % 25 === 0) { writeFileSync(out, JSON.stringify(res, null, 1)); process.stdout.write(`${n} `); }
  });
  writeFileSync(out, JSON.stringify(res, null, 1));
  console.log("\nwrote", out);
}

/** Minutes of Sensei and Baron speech in the game today (public/a/l, w, x, s, o, p; measured 27 Sep 2026). */
const LIBRARY_MINUTES = 106;
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const r1 = (x: number) => Math.round(x * 10) / 10;

function write() {
  const J: Record<string, any[]> = JSON.parse(readFileSync(join(RUNS, "judge.json"), "utf8"));
  const votes = (id: string, kind: string, lineIds: string[], takes = [1, 2, 3]) =>
    lineIds.flatMap((l) => takes.flatMap((t) => (J[`${id}|${kind}|${l}.t${t}`] ?? []).filter((v) => v && !v.error)));
  const mPath = join(RUNS, "measures.json");
  const MEASURES: Record<string, any> = existsSync(mPath) ? JSON.parse(readFileSync(mPath, "utf8")) : {};
  const out = candidates().map((c) => {
    const briefed = votes(c.id, "briefed", ACCENT_LINES, [1]);
    const briefedBaron = votes(c.id, "briefed", ["baron-1"], [1]);
    const abx = votes(c.id, "abx", ACCENT_LINES);
    const abxBaron = votes(c.id, "abx", ["baron-1"]);
    const feats: Record<string, number> = {};
    for (const v of [...briefed, ...briefedBaron]) for (const f of v.american_features ?? []) {
      const k = `${String(f.feature ?? f).toLowerCase()}${f.word ? ` ("${String(f.word).toLowerCase()}")` : ""}`;
      feats[k] = (feats[k] ?? 0) + 1;
    }
    const nVotes = briefed.length + briefedBaron.length;
    const fit = (lineIds: string[], k: string) => mean(votes(c.id, "fit", lineIds, [1]).map((v) => Number(v[k])).filter(Number.isFinite));
    const wordErrors = [...new Set(votes(c.id, "fit", TEST_SCRIPT.map((l) => l.id), [1]).flatMap((v) => v.word_errors ?? []).map(String))];
    const files: Partial<Record<Role, string[]>> = {};
    const extraTakes: Record<string, string[]> = {};
    let chars = 0, seconds = 0;
    for (const l of TEST_SCRIPT) {
      const f = join(AUDIO, c.id, `${l.id}.mp3`);
      if (!existsSync(f)) continue;
      (files[l.role] ??= []).push(f.replace(PICKER + "/", ""));
      chars += l.text.length + (c.steer?.[l.role] ? c.steer[l.role]!.length + 1 : 0);
      seconds += durationOf(f);
      const extra = [2, 3].map((t) => join(AUDIO, c.id, `${l.id}.take${t}.mp3`)).filter(existsSync);
      if (extra.length) extraTakes[l.id] = extra.map((f) => f.replace(PICKER + "/", ""));
    }
    const price = PRICE[c.engine];
    const costPerMinuteUSD = price.perAudioMinute ?? (price.perChar! * chars) / (seconds / 60);
    const s = (xs: any[]) => ({ britishVotes: xs.filter((x) => x.pick === "uk").length, votes: xs.length, pUK: Math.round(mean(xs.map((x) => x.p_uk))) });
    // The briefed judge rarely hears anything (the audit found it calls American voices British), so the American
    // features also list what the ABX judge and the acoustics (workers-ai-measure.py) found, each marked with its source.
    const ac = MEASURES[c.id]?.summary;
    const abxUs = [...abx, ...abxBaron].filter((x) => x.pick === "us").map((x) => `ABX judge: ${String(x.reason ?? "").slice(0, 160)}`);
    const acoustic = ac ? [
      ...(ac.rFlags.length ? [`acoustics: r-coloured vowel in ${ac.rColoured} r-words: ${ac.rFlags.join(", ")}`] : []),
      ...(ac.bathFlags.length ? [`acoustics: flat (TRAP) vowel in ${ac.bathFlat} BATH words: ${ac.bathFlags.join(", ")}`] : []),
      ...(ac.tFlags.length ? [`acoustics: flapped t in ${ac.tFlapped} t-words: ${ac.tFlags.join(", ")}`] : []),
    ] : [];
    return {
      id: c.id, provider: `Cloudflare Workers AI: ${c.model}`, voice: c.voice, model: c.model, label: c.label, gender: c.gender,
      settings: { ...c.settings, ...(c.steer ? { steer: c.steer } : {}) }, roles: c.roles, files, extraTakes,
      britishScore: r1(mean(briefed.map((v) => Number(v.southern_british)).filter(Number.isFinite))),
      britishScoreBaronLine: r1(mean(briefedBaron.map((v) => Number(v.southern_british)).filter(Number.isFinite))),
      accentVerdicts: Object.fromEntries(Object.entries(briefed.reduce((m: any, v) => ((m[v.accent] = (m[v.accent] ?? 0) + 1), m), {}))),
      americanFeatures: [...Object.entries(feats).sort((a, b) => b[1] - a[1]).map(([f, n]) => `briefed judge: ${f}, ${n}/${nVotes} votes`), ...abxUs, ...acoustic],
      acoustics: ac ?? null,
      abx: { accentLines: s(abx), baronLine: s(abxBaron), note: "ABX judge from the audit (anchors ElevenLabs Alice vs OpenAI coral; Baron: George vs ash), 3 votes a take, takes 1-3 of sensei-2 and sensei-6" },
      warmth: r1(fit(["sensei-1", "sensei-3", "sensei-5"], "warmth")),
      storytelling: r1(fit(["narrator-1", "narrator-2", "narrator-3"], "storytelling")),
      villainy: r1(fit(["baron-1", "baron-2"], "villainy")),
      naturalness: r1(fit(TEST_SCRIPT.map((l) => l.id), "naturalness")),
      wordErrors,
      costPerMinuteUSD: Math.round(costPerMinuteUSD * 10000) / 10000,
      costSource: price.source,
      /** One take of the whole speech library (~106 minutes: lines 58, stretched words 29, words 14, stories 5). */
      fullLibraryOneTakeUSD: Math.round(costPerMinuteUSD * LIBRARY_MINUTES * 100) / 100,
      pathsRelativeTo: "playtest/voice-picker",
      notes: "",
    };
  });
  // Notes: kept from a hand-written notes file if present
  const notesFile = join(RUNS, "notes.json");
  const notes: Record<string, { notes: string; rank?: Partial<Record<Role, number>> }> = existsSync(notesFile) ? JSON.parse(readFileSync(notesFile, "utf8")) : {};
  for (const c of out) Object.assign(c, { notes: notes[c.id]?.notes ?? "", rank: notes[c.id]?.rank ?? {} });
  const path = join(PICKER, "candidates-workers-ai.json");
  writeFileSync(path, JSON.stringify(out, null, 1));
  console.log("wrote", path);
  for (const c of out) console.log(`${c.id.padEnd(36)} UK ${c.britishScore} ABX ${c.abx.accentLines.britishVotes}/${c.abx.accentLines.votes} baronABX ${c.abx.baronLine.britishVotes}/${c.abx.baronLine.votes} warm ${c.warmth} story ${c.storytelling} villain ${c.villainy} nat ${c.naturalness} $${c.costPerMinuteUSD}/min  r ${c.acoustics?.rColoured} bath ${c.acoustics?.bathFlat} t ${c.acoustics?.tFlapped}`);
}

if (step === "screen") await screen();
else if (step === "screen2") await screen2();
else if (step === "render") await render();
else if (step === "judge") await judge();
else if (step === "write") write();
else if (step === "all") { await render(); await judge(); write(); }
else console.log("usage: workers-ai.ts <screen|render|judge|write|all> [ids] [--force]");
