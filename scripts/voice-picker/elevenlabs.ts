// Voice picker: ElevenLabs candidates for Sensei, the narrator and Baron Muddle, rendered from the accent test script
// (scripts/voice-picker/audit-script.ts) through Cloudflare /ai/run (AI Gateway unified billing on the dev account).
//
//   doppler run -p os -c dev -- bun scripts/voice-picker/elevenlabs.ts render screen   # whole pool, "steady" preset, take 1, + anchors
//   uv run --with numpy --with praat-parselmouth --with mlx-whisper python scripts/voice-picker/elevenlabs-measure.py
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/voice-picker/elevenlabs.ts judge screen
//   bun scripts/voice-picker/elevenlabs.ts select                                        # ranks the pool, writes finalists.json
//   doppler run -p os -c dev -- bun scripts/voice-picker/elevenlabs.ts render final    # finalists: "lively" preset, takes 2-3 of the probe lines
//   (measure again), then: doppler run -p os-legacy-2026-04 -c dev -- bun scripts/voice-picker/elevenlabs.ts judge final
//   bun scripts/voice-picker/elevenlabs.ts summary                                       # writes playtest/voice-picker/candidates-elevenlabs.json
//
// Why a pool and a screen: the ElevenLabs voice library search (/v1/shared-voices with filters) needs an ElevenLabs login,
// and neither a key nor the gateway passthrough gives one. The pool below was picked from the public catalogue
// (json2video.com's ElevenLabs list and elevenlabs.io collection pages) by accent and description, then screened by ear
// (judges) and by acoustics. Library voices work by id through /ai/run.
//
// Judges (Gemini 3.8 Flash, 3 votes a clip, temperature 1):
//   j1    the audit's Judge 1, as briefed (British score 1-10 + American features). The audit showed it is too kind:
//         it called an American control "Southern British". Reported because every renderer reports it.
//   abx   the audit's ABX judge with ElevenLabs anchors (same model, same preset): a British and an American voice say
//         the same line, and the judge says whose accent X shares. Same-engine anchors, so only the accent differs.
//   abxA  the audit's own ABX pair (ElevenLabs v3 Alice vs OpenAI coral; v3 George vs OpenAI ash), for comparison with
//         the audit's numbers. Alice is ElevenLabs too, so this pair leans British for ElevenLabs voices.
//   fit   role fit: Sensei's teacher warmth, the narrator's storytelling, the Baron's pantomime villainy.
// Acoustics (F3 in r-words, the BATH vowel, t between vowels): elevenlabs-measure.py, from the audit's audit-measure.py.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { TEST_SCRIPT, type Role, type TestLine } from "./audit-script";

const ROOT = join(import.meta.dir, "../..");
const RUNS = join(ROOT, "playtest/runs/voice-picker/elevenlabs");
const AUDIO = join(ROOT, "playtest/voice-picker/audio/elevenlabs");
const OUT_JSON = join(ROOT, "playtest/voice-picker/candidates-elevenlabs.json");
const RENDERS = join(RUNS, "renders.json");
const JUDGE = join(RUNS, "judge.json");
const MEASURES = join(RUNS, "measures.json");
const FINALISTS = join(RUNS, "finalists.json");
const rel = (p: string) => p.replace(ROOT + "/", "");

export const MODEL = "elevenlabs/eleven-multilingual-v2";
/** Cloudflare's unified-billing price for eleven-multilingual-v2 and eleven-v3: $0.0001 a character (turbo/flash: $0.00005). */
export const USD_PER_CHAR = 0.0001;

export const PRESETS = {
  steady: { stability: 0.5, similarity_boost: 0.75, style: 0.3, speed: 0.95, use_speaker_boost: true },
  lively: { stability: 0.35, similarity_boost: 0.75, style: 0.6, speed: 0.95, use_speaker_boost: true },
} as const;
export type Preset = keyof typeof PRESETS;

type Kind = "candidate" | "anchor" | "control";
export interface Voice { key: string; id: string; name: string; sex: "f" | "m"; roles: Role[]; kind: Kind; source: string; lines?: string[]; truth?: "uk" | "us" }

const PREMADE = "ElevenLabs premade";
const LIB = "ElevenLabs voice library";
/** The pool: British voices by the library's own description. Sensei candidates also read the narrator lines, since Sensei narrates the stories and the film today. */
export const VOICES: Voice[] = [
  // Sensei (female teacher / storyteller)
  { key: "alice", id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice – Clear, Engaging Educator (British, middle-aged)", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: PREMADE },
  { key: "lily", id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily – Velvety Actress (British, middle-aged)", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: PREMADE },
  { key: "beth", id: "8N2ng9i2uiUWqstgmWlH", name: "Beth – gentle and nurturing (warm, motherly British)", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "lucie", id: "GPTk4QbvF7snDhImF5UF", name: "Lucie – Children's Storyteller & Professional Actress (British)", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "elizabeth", id: "AXdMgz6evoL7OPd7eU12", name: "Elizabeth – Professional British Narrator, kind and friendly", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "laura", id: "vxO9F6g9yqYJ4RsWvMbc", name: "Laura – Southern England accent, mid-40s, warm and clear", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "amelia", id: "ZF6FPAbjXT4488VcRRnw", name: "Amelia – young British, enthusiastic and expressive", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "emilia", id: "E4IXevHtHpKGh0bvrPPr", name: "Emilia Bennett – young British narrator, warm and welcoming", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "eliza", id: "gbJ8VWbkBuPQMKXJXrhz", name: "Eliza Whitmore – lively British storyteller", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "articulate", id: "5TRppDPuxBF23owe37hG", name: "Articulate British Female – neutral, south of England, warm", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "ana", id: "rCmVtv8cYU60uhlsOo1M", name: "Ana – young British, emotional, children's book narration", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "isabella", id: "0sGQQaD2G2X1s87kHM5b", name: "Isabella – young British, calm, educational", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "lyndy", id: "8z5UhJ1uv7X8TN5yg8oI", name: "Lyndy Lane – native British, informative and educational", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "dorothy", id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy – British, children's stories (legacy premade)", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: PREMADE + " (legacy)" },
  { key: "juliet", id: "QJksobp1edMNvmwcG5lm", name: "Juliet – British storyteller and presenter, warm", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "charlotte", id: "6fZce9LFNG3iEITDfqZZ", name: "Charlotte – sweet, modern British, bright", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  { key: "shelley", id: "4CrZuIW9am7gYAxgo2Af", name: "Shelley – clear, confident British (teacher collection)", sex: "f", roles: ["sensei", "narrator"], kind: "candidate", source: LIB },
  // Narrator (stories and the intro film)
  { key: "george", id: "JBFqnCBsd6RMkjVDRZzb", name: "George – Warm, Captivating Storyteller (British; the trailer's narrator)", sex: "m", roles: ["narrator"], kind: "candidate", source: PREMADE },
  { key: "victoria", id: "IZnNrZQBS9lhLjXgYVT8", name: "Victoria – senior British actress, twinkly headmistress", sex: "f", roles: ["narrator"], kind: "candidate", source: LIB },
  { key: "beatrice", id: "kkPJzQOWz2Oz9cUaEaQd", name: "Beatrice – mature British storyteller, warm and rich", sex: "f", roles: ["narrator"], kind: "candidate", source: LIB },
  { key: "fatherchristmas", id: "1wg2wOjdEWKA7yQD8Kca", name: "Father Christmas – magical storyteller, older British RP male", sex: "m", roles: ["narrator"], kind: "candidate", source: LIB },
  { key: "emmataylor", id: "S9EGwlCtMF7VXtENq79v", name: "Emma Taylor – soft, gentle London storyteller", sex: "f", roles: ["narrator"], kind: "candidate", source: LIB },
  { key: "eleanor", id: "U1xXYn8cDFT02st4a5oq", name: "Eleanor Grace – warm, expressive British storyteller", sex: "f", roles: ["narrator"], kind: "candidate", source: LIB },
  { key: "poppy", id: "m8PfgWULna67DKNOKhKR", name: "Poppy Adderly – strong, elegant British storyteller", sex: "f", roles: ["narrator"], kind: "candidate", source: LIB },
  { key: "claire", id: "tmtVLLFJVXmAZYwJoVdL", name: "Claire – classic British RP, soft, warm storyteller", sex: "f", roles: ["narrator"], kind: "candidate", source: LIB },
  { key: "beezle", id: "BBfN7Spa3cqLPH1xAS22", name: "Beezle Wheezelby – wise old British fantasy narrator", sex: "m", roles: ["narrator"], kind: "candidate", source: LIB },
  { key: "nathaniel", id: "7S3KNdLDL7aRgBVRQb1z", name: "Nathaniel – deep, rich, mature British character actor and comedian", sex: "m", roles: ["narrator", "baron"], kind: "candidate", source: LIB },
  // Baron Muddle (a pantomime villain)
  { key: "blackwood", id: "agL69Vji082CshT65Tcy", name: "Blackwood – sinister British snob, posh aristocratic drawl", sex: "m", roles: ["baron"], kind: "candidate", source: LIB },
  { key: "pompous", id: "cwo4ramDmreHdb4b1Jxz", name: "Well Spoken English – calm, slightly pompous Englishman", sex: "m", roles: ["baron"], kind: "candidate", source: LIB },
  { key: "edward", id: "zYcjlYFOd3taleS0gkk3", name: "Edward – cocky villain, smug and charismatic", sex: "m", roles: ["baron"], kind: "candidate", source: LIB },
  { key: "oxley", id: "3SF4rB1fGBMXU9xRM7pz", name: "Oxley – eccentric evil guy, quiet menace", sex: "m", roles: ["baron"], kind: "candidate", source: LIB },
  { key: "johnny", id: "HMCmDsbKeaSZp5LMOYKR", name: "Johnny the Villain – mischievous, mocking, cartoonish", sex: "m", roles: ["baron"], kind: "candidate", source: LIB },
  { key: "theatrical", id: "UlQzP061AqptrSLuYnFf", name: "British Theatrical – sophisticated, dramatic", sex: "m", roles: ["baron"], kind: "candidate", source: LIB },
  { key: "arkadi", id: "ZUz67EWNNT6d1i38Xmcm", name: "Archivist Arkadi – baritone wizard, velvet menace", sex: "m", roles: ["baron"], kind: "candidate", source: LIB },
  { key: "obsidian", id: "G9mW0YfLl5FDeeGAfU3o", name: "Obsidian – dark, wily, playful menace", sex: "m", roles: ["baron"], kind: "candidate", source: LIB },
  // ABX anchors (same model and preset as the candidates, so only the accent differs) and same-engine controls
  { key: "anchor-us-f", id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda (American female, premade)", sex: "f", roles: ["sensei", "narrator"], kind: "anchor", source: PREMADE, lines: ["sensei-2", "sensei-6", "narrator-1", "narrator-2"], truth: "us" },
  { key: "anchor-uk-m", id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel (British male, premade)", sex: "m", roles: ["narrator", "baron"], kind: "anchor", source: PREMADE, lines: ["narrator-1", "narrator-2", "baron-1", "baron-2"], truth: "uk" },
  { key: "anchor-us-m", id: "nPczCjzI2devNBz1zQrb", name: "Brian (American male, premade)", sex: "m", roles: ["narrator", "baron"], kind: "anchor", source: PREMADE, lines: ["narrator-1", "narrator-2", "baron-1", "baron-2"], truth: "us" },
  { key: "ctrl-us-f", id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (American female, premade): control", sex: "f", roles: ["sensei", "narrator"], kind: "control", source: PREMADE, lines: ["sensei-2", "sensei-6", "narrator-1", "narrator-2"], truth: "us" },
  { key: "ctrl-us-m", id: "cjVigY5qzO86Huf0OWal", name: "Eric (American male, premade): control", sex: "m", roles: ["narrator", "baron"], kind: "control", source: PREMADE, lines: ["narrator-1", "narrator-2", "baron-1", "baron-2"], truth: "us" },
];
const voiceOf = (key: string) => VOICES.find((v) => v.key === key)!;

/** The lines each judge hears, by role. */
export const PROBE: Record<Role, string[]> = { sensei: ["sensei-2", "sensei-6"], narrator: ["narrator-1", "narrator-2"], baron: ["baron-1", "baron-2"] };
/** Lines rendered three times (takes 2 and 3 are for the acoustics: accent is a property of each take). */
const EXTRA_TAKES: Record<Role, string[]> = { sensei: ["sensei-2", "sensei-4", "sensei-6"], narrator: ["narrator-1"], baron: ["baron-1"] };

export const candId = (key: string, preset: Preset) => `eleven-${key}-${preset}`;

export interface Render { cand: string; key: string; voiceId: string; sex: string; kind: Kind; preset: Preset; line: string; role: Role; take: number; text: string; chars: number; src: string; wav: string; mp3: string | null; dur: number }

const readJson = <T,>(p: string, d: T): T => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const ffmpeg = (a: string[]) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);
const duration = (f: string) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
function lufs(file: string): number {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=framelog=quiet", "-f", "null", "-"]);
  const m = String(r.stderr).match(/I:\s+(-?[\d.]+) LUFS/g);
  return m ? parseFloat(m[m.length - 1].replace(/[^-\d.]/g, "")) : NaN;
}
/** As the game's finishAudio (scripts/tts.ts): trim silence, 25 ms fades, two-pass gain to -16 LUFS, -1.5 dBTP limiter;
 *  then 112 kbps CBR mono MP3. */
function finish(src: string, out: string, trimmed: string) {
  mkdirSync(dirname(out), { recursive: true });
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  const fades = "afade=t=in:d=0.025,areverse,afade=t=in:d=0.025,areverse";
  ffmpeg(["-i", src, "-af", `${trim},${fades}`, "-ar", "44100", "-ac", "1", trimmed]);
  const l = lufs(trimmed);
  let gain = Number.isFinite(l) && l > -70 ? -16 - l : 0;
  // the limiter takes a little off expressive takes (up to 1.7 LU in a test): measure the MP3 and correct, twice at most
  for (let pass = 0; pass < 3; pass++) {
    ffmpeg(["-i", trimmed, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=0.05`, "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "112k", out]);
    const got = lufs(out);
    if (!Number.isFinite(got) || Math.abs(got + 16) <= 0.3) break;
    gain += -16 - got;
  }
  return out;
}

async function elevenRender(text: string, voiceId: string, preset: Preset, seed: number): Promise<Buffer> {
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID, token = process.env.CLOUDFLARE_API_TOKEN;
  if (!acct || !token) throw new Error("Missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN (doppler run -p os -c dev)");
  let last: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/ai/run`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ model: MODEL, input: { text, voice_id: voiceId, output_format: "mp3_44100_128", language_code: "en", seed, voice_settings: PRESETS[preset] } }),
      });
      const json: any = await res.json();
      if (!json.success) throw new Error(`${res.status} ${JSON.stringify(json.errors ?? json).slice(0, 300)}`);
      const r = json.result?.result ?? json.result;
      if (!r?.audio) throw new Error("no audio: " + JSON.stringify(r).slice(0, 200));
      const a = await fetch(r.audio);
      if (!a.ok) throw new Error(`download ${a.status}`);
      return Buffer.from(await a.arrayBuffer());
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
    }
  }
  throw last;
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) {
      const it = items[next++];
      try { await fn(it); } catch (e) { console.error("FAILED", JSON.stringify(it).slice(0, 160), String(e).slice(0, 300)); }
    }
  }));
}

// ------------------------------------------------------------------ render
async function render(stage: "screen" | "final") {
  const finalists: string[] = readJson(FINALISTS, { keys: [] as string[] }).keys;
  if (stage === "final" && !finalists.length) throw new Error("no finalists.json: run select first");
  const jobs: { v: Voice; preset: Preset; line: TestLine; take: number }[] = [];
  for (const v of VOICES) {
    const lines = TEST_SCRIPT.filter((l) => v.roles.includes(l.role) && (!v.lines || v.lines.includes(l.id)));
    if (v.kind !== "candidate") { for (const line of lines) jobs.push({ v, preset: "steady", line, take: 1 }); continue; }
    if (stage === "screen") { for (const line of lines) jobs.push({ v, preset: "steady", line, take: 1 }); continue; }
    if (!finalists.includes(v.key)) continue;
    for (const preset of ["steady", "lively"] as Preset[]) {
      for (const line of lines) {
        jobs.push({ v, preset, line, take: 1 });
        if (v.roles.some((r) => EXTRA_TAKES[r].includes(line.id))) for (const take of [2, 3]) jobs.push({ v, preset, line, take });
      }
    }
  }
  const renders: Render[] = readJson(RENDERS, []);
  const have = new Set(renders.map((r) => `${r.cand}|${r.line}|${r.take}`));
  console.log(`${jobs.length} takes (${jobs.filter((j) => !have.has(`${candId(j.v.key, j.preset)}|${j.line.id}|${j.take}`)).length} new)`);
  let n = 0;
  await pool(jobs, 6, async ({ v, preset, line, take }) => {
    const cand = candId(v.key, preset);
    const base = join(RUNS, "raw", cand, `${line.id}.t${take}`);
    const src = base + ".mp3", wav = base + ".wav";
    if (!existsSync(src)) {
      mkdirSync(dirname(src), { recursive: true });
      writeFileSync(src, await elevenRender(line.text, v.id, preset, 100 + take));
    }
    if (!existsSync(wav)) ffmpeg(["-i", src, "-ac", "1", "-ar", "44100", wav]);
    let mp3: string | null = null;
    if (v.kind === "candidate" && take === 1) {
      mp3 = join(AUDIO, cand, `${line.id}.mp3`);
      if (!existsSync(mp3)) finish(src, mp3, base + ".trim.wav");
    }
    const r: Render = { cand, key: v.key, voiceId: v.id, sex: v.sex, kind: v.kind, preset, line: line.id, role: line.role, take, text: line.text, chars: line.text.length, src: rel(src), wav: rel(wav), mp3: mp3 && rel(mp3), dur: Math.round(duration(mp3 ?? src) * 100) / 100 };
    const i = renders.findIndex((x) => x.cand === cand && x.line === line.id && x.take === take);
    if (i >= 0) renders[i] = r; else renders.push(r);
    if (++n % 20 === 0) { writeFileSync(RENDERS, JSON.stringify(renders, null, 1)); process.stdout.write(`${n} `); }
  });
  renders.sort((a, b) => a.cand.localeCompare(b.cand) || a.line.localeCompare(b.line) || a.take - b.take);
  writeFileSync(RENDERS, JSON.stringify(renders, null, 1));
  console.log("\nwrote", rel(RENDERS), renders.length);
}

// ------------------------------------------------------------------ judges
const AUDIT = "playtest/runs/voice-picker/audit/raw";
/** The audit's Judge 1 prompt, verbatim (scripts/voice-picker/audit-judge.ts). */
const ACCENTS = ["Southern British English (RP or modern standard)", "another British accent", "American", "Australian", "another accent"];
const FEATURES = [
  "a rhotic r: an r sounded after a vowel, as in car, bird, four or water",
  "a flapped t: a quick d-like t between vowels, as in water or butter",
  "the TRAP vowel (as in cat) in bath, grass, dance, fast, after or can't",
  "'tomayto' (the FACE vowel in tomato)",
];
function j1Prompt(text: string, accents: string[], features: string[]) {
  return `Listen carefully to this speech clip. The words are: "${text}"

Which accent is this: ${accents.slice(0, -1).join(", ")} or ${accents.at(-1)}?
Rate 1-10 how convincingly Southern British it is (10 = unmistakably Southern British, like a CBeebies presenter; 1 = clearly not British).
List any American features you actually hear, naming the word where you hear it. Features to listen for:
${features.map((f) => `- ${f}`).join("\n")}
List only features you hear in this clip; an empty list is fine.

Reply ONLY with JSON: {"accent": "<one of: ${accents.join(" | ")}>", "southern_british": <1-10>, "american_features": [{"feature": "<short name>", "word": "<word>"}], "british_features": ["<short evidence, e.g. non-rhotic car>"], "notes": "<one sentence>"}`;
}
/** The audit's ABX question, verbatim (scripts/voice-picker/audit-judge-abx.ts). */
const ABX_Q = `Clips A and B are two different speakers with two different accents, saying the same sentence. Clip X is a third speaker saying it too.
Ignore the voice itself (pitch, gender, age, timbre, speed, emotion, recording quality). Compare ONLY pronunciation: the vowels (for example in fast, bath, grass, dance, can't, half, past, mat), whether an r is sounded after a vowel (car, four, first, word, world), and how a t between vowels sounds (water, butter).
Whose accent does X share: A's or B's?
Reply ONLY with JSON: {"closer": "A" | "B", "p_A": <0-100, how likely X's accent is A's>, "reason": "<one sentence naming the words that decided it>"}`;

const FIT: Record<Role, { lines: string[]; rubric: string }> = {
  sensei: {
    lines: ["sensei-1", "sensei-3", "sensei-5"],
    rubric: `You are casting the voice of Sensei Maple, a kind, wise ninja teacher in a phonics game for British children aged 3 to 8. She teaches them to read, praises them, and gently helps when they get it wrong. The three clips are the same speaker.
Rate TEACHER WARMTH 1-10: 10 = a favourite reception-class teacher or a CBeebies presenter: warm, smiling, patient, encouraging, calm, kind, never patronising; 5 = pleasant but neutral, corporate or like a newsreader; 1 = cold, flat, sarcastic, sultry, bored, shouty or like an advert.
Also rate CLARITY for a 3-year-old 1-10 (clear, unhurried, every sound distinct) and NATURALNESS 1-10 (10 = a real person; lower for robotic prosody, odd stresses, glitches, clipped words, breaths or noise).`,
  },
  narrator: {
    lines: ["narrator-1", "narrator-2", "narrator-3"],
    rubric: `You are casting the narrator of a children's phonics game's intro film and story pages, for British children aged 3 to 8. The three clips are the same speaker telling the story of an island, a magic World Flower and a villain, Baron Muddle.
Rate STORYTELLING 1-10: 10 = a spellbinding bedtime storyteller or CBeebies Bedtime Story reader: warm, magical, expressive, with gentle suspense that is never frightening; 5 = pleasant but flat, like reading a document; 1 = cold, monotone, sultry, over the top or scary.
Also rate CLARITY for a 3-year-old 1-10 and NATURALNESS 1-10 (10 = a real person; lower for robotic prosody, odd stresses, glitches, clipped words, breaths or noise).`,
  },
  baron: {
    lines: ["baron-1", "baron-2"],
    rubric: `You are casting Baron Muddle, the villain of a phonics game for British children aged 3 to 8: he tears the petals off the magic World Flower and hates words. He should be a pantomime villain: gloating, theatrical, silly-sinister, fun to boo, the kind of baddie children love to hate. Never truly frightening. The two clips are the same speaker.
Rate VILLAINY 1-10: 10 = a perfect pantomime baddie for small children (big, gloating, comic menace, full of character); 5 = a plain voice reading villain lines; 1 = flat, bored, or genuinely scary / horror.
Also rate CLARITY for a 3-year-old 1-10 and NATURALNESS 1-10 (10 = a real person; lower for robotic prosody, odd stresses, glitches, clipped words or noise).`,
  },
};

type Job = { key: string; parts: any[]; kind: "j1" | "abx" | "abxA" | "fit"; meta: any };
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const audioPart = (f: string) => ({ inlineData: { mimeType: f.endsWith(".mp3") ? "audio/mp3" : "audio/wav", data: readFileSync(join(ROOT, f)).toString("base64") } });

/** The ElevenLabs anchor pair for a voice: same sex; the British anchor is Alice (Lily when X is Alice), or Daniel for men. */
function anchorsFor(v: Voice): { uk: string; us: string } {
  if (v.sex === "f") return { uk: candId(v.key === "alice" ? "lily" : "alice", "steady"), us: candId("anchor-us-f", "steady") };
  return { uk: candId("anchor-uk-m", "steady"), us: candId("anchor-us-m", "steady") };
}

async function judge(stage: "screen" | "final") {
  const { generate, textOf } = await import("../gemini");
  const renders: Render[] = readJson(RENDERS, []);
  const res: Record<string, any> = readJson(JUDGE, {});
  const finalists: string[] = readJson(FINALISTS, { keys: [] as string[] }).keys;
  const wavOf = (cand: string, line: string, take = 1) => renders.find((r) => r.cand === cand && r.line === line && r.take === take)?.wav;
  const jobs: Job[] = [];
  const VOTES = 3;
  const cands = [...new Set(renders.filter((r) => r.take === 1).map((r) => r.cand))];
  for (const cand of cands) {
    const r0 = renders.find((r) => r.cand === cand)!;
    const v = voiceOf(r0.key);
    if (v.kind === "anchor") continue;
    const isFinal = v.kind === "control" || finalists.includes(v.key);
    if (stage === "screen" && r0.preset !== "steady") continue;
    if (stage === "final" && !isFinal) continue;
    const { uk, us } = anchorsFor(v);
    for (const role of v.roles) {
      for (const line of PROBE[role]) {
        const x = wavOf(cand, line);
        if (!x) continue;
        const text = TEST_SCRIPT.find((l) => l.id === line)!.text;
        for (let k = 0; k < VOTES; k++) {
          // engine-matched ABX
          const a = wavOf(uk, line), b = wavOf(us, line);
          if (a && b) jobs.push({ key: `abx|${cand}|${line}|${k}`, kind: "abx", parts: [], meta: { cand, line, role, uk: a, us: b, x } });
          if (stage === "final") {
            jobs.push({ key: `j1|${cand}|${line}|${k}`, kind: "j1", parts: [], meta: { cand, line, role, text, x } });
            // the audit's own pair
            const [au, as] = role === "baron" ? [`${AUDIT}/eleven-george-baron/${line}.t1.wav`, `${AUDIT}/openai-ash/${line}.t1.wav`] : [`${AUDIT}/eleven-alice/${line}.t1.wav`, `${AUDIT}/openai-coral/${line}.t1.wav`];
            if (existsSync(join(ROOT, au)) && existsSync(join(ROOT, as))) jobs.push({ key: `abxA|${cand}|${line}|${k}`, kind: "abxA", parts: [], meta: { cand, line, role, uk: au, us: as, x } });
          }
        }
      }
      if (v.kind === "candidate") {
        const files = FIT[role].lines.map((l) => wavOf(cand, l)).filter(Boolean) as string[];
        if (files.length === FIT[role].lines.length) for (let k = 0; k < VOTES; k++) jobs.push({ key: `fit|${cand}|${role}|${k}`, kind: "fit", parts: [], meta: { cand, role, files } });
      }
    }
  }
  // cross-engine controls from the audit (known accents), through the ElevenLabs anchor pairs: does the pair discriminate?
  const crossCtl: [string, "f" | "m", "uk" | "us", Role][] = [["mac-daniel", "m", "uk", "narrator"], ["mac-samantha", "f", "us", "sensei"], ["openai-coral", "f", "us", "sensei"], ["openai-ash", "m", "us", "baron"], ["mac-daniel", "m", "uk", "baron"]];
  for (const [ctl, sex, truth, role] of crossCtl)
    for (const line of PROBE[role]) {
      const x = `${AUDIT}/${ctl}/${line}.t1.wav`;
      if (!existsSync(join(ROOT, x))) continue;
      const { uk, us } = anchorsFor({ key: ctl, sex } as Voice);
      const a = wavOf(uk, line), b = wavOf(us, line);
      if (a && b) for (let k = 0; k < VOTES; k++) jobs.push({ key: `abx|audit-${ctl}|${line}|${k}`, kind: "abx", parts: [], meta: { cand: `audit-${ctl}`, line, role, uk: a, us: b, x, truth } });
    }
  const todo = shuffle(jobs.filter((j) => !res[j.key] || res[j.key].error));
  console.log(`${stage}: ${jobs.length} votes, ${todo.length} to cast`);
  let n = 0;
  await pool(todo, 10, async (j) => {
    let parts: any[], ukIsA = false, order: any = null;
    if (j.kind === "j1") {
      const accents = shuffle(ACCENTS), features = shuffle(FEATURES);
      order = { accents };
      parts = [audioPart(j.meta.x), { text: j1Prompt(j.meta.text, accents, features) }];
    } else if (j.kind === "fit") {
      const files: string[] = j.meta.files;
      parts = [...files.flatMap((f, i) => [{ text: `Clip ${i + 1}:` }, audioPart(f)]), { text: `${FIT[j.meta.role as Role].rubric}\nReply ONLY with JSON: {"score": <1-10>, "clarity": <1-10>, "naturalness": <1-10>, "notes": "<one sentence>"}` }];
    } else {
      ukIsA = Math.random() < 0.5;
      const [a, b] = ukIsA ? [j.meta.uk, j.meta.us] : [j.meta.us, j.meta.uk];
      parts = [{ text: "Clip A:" }, audioPart(a), { text: "Clip B:" }, audioPart(b), { text: "Clip X:" }, audioPart(j.meta.x), { text: ABX_Q }];
    }
    let vote: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      const json = await generate("gemini-3.8-flash", { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 1 } });
      try { vote = JSON.parse(textOf(json)); break; } catch { vote = { error: textOf(json).slice(0, 200) }; }
    }
    if (j.kind === "abx" || j.kind === "abxA") {
      const pA = typeof vote.p_A === "number" ? vote.p_A : vote.closer === "A" ? 100 : 0;
      vote = { ...vote, ukIsA, p_uk: ukIsA ? pA : 100 - pA, pick: (vote.closer === "A") === ukIsA ? "uk" : "us" };
    }
    res[j.key] = { ...vote, meta: { ...j.meta, files: undefined }, order };
    if (++n % 25 === 0) { writeFileSync(JUDGE, JSON.stringify(res, null, 1)); process.stdout.write(`${n} `); }
  });
  writeFileSync(JUDGE, JSON.stringify(res, null, 1));
  console.log("\nwrote", rel(JUDGE));
}

// ------------------------------------------------------------------ scoring
const mean = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
const r1 = (x: number) => (Number.isFinite(x) ? Math.round(x * 10) / 10 : null);

interface Score {
  cand: string; key: string; preset: Preset; roles: Role[];
  j1: number | null; j1Votes: number; americanFeatures: { feature: string; word: string; line: string; votes: number }[];
  abx: { british: number; votes: number; pUk: number | null }; abxAudit: { british: number; votes: number; pUk: number | null };
  fit: Partial<Record<Role, { score: number | null; clarity: number | null; naturalness: number | null; notes: string[] }>>;
  acoustic: { tokens: number; american: number; flags: string[]; takes: number } | null;
  accent: number | null; overall: Partial<Record<Role, number | null>>;
}

function scoreAll(): Score[] {
  const renders: Render[] = readJson(RENDERS, []);
  const res: Record<string, any> = readJson(JUDGE, {});
  const meas: any = readJson(MEASURES, { cands: {} });
  const cands = [...new Set(renders.filter((r) => r.kind === "candidate").map((r) => r.cand))];
  return cands.map((cand) => {
    const r0 = renders.find((r) => r.cand === cand)!;
    const v = voiceOf(r0.key);
    const votes = (kind: string) => Object.entries(res).filter(([k, x]) => k.startsWith(`${kind}|${cand}|`) && !x.error).map(([, x]) => x);
    const j1 = votes("j1");
    const feats = new Map<string, { feature: string; word: string; line: string; votes: number }>();
    for (const x of j1) for (const f of x.american_features ?? []) {
      const k = `${x.meta.line}|${String(f.word).toLowerCase()}|${String(f.feature).toLowerCase().slice(0, 12)}`;
      const e = feats.get(k) ?? { feature: f.feature, word: String(f.word).toLowerCase(), line: x.meta.line, votes: 0 };
      e.votes++; feats.set(k, e);
    }
    const abx = votes("abx"), abxA = votes("abxA");
    const fit: Score["fit"] = {};
    for (const role of v.roles) {
      const f = votes("fit").filter((x) => x.meta.role === role);
      if (f.length) fit[role] = { score: r1(mean(f.map((x) => x.score))), clarity: r1(mean(f.map((x) => x.clarity))), naturalness: r1(mean(f.map((x) => x.naturalness))), notes: f.map((x) => x.notes) };
    }
    const ac = meas.cands?.[cand] ?? null;
    const abxShare = abx.length ? mean(abx.map((x) => x.p_uk)) / 100 : NaN;
    const clean = ac && ac.tokens ? 1 - ac.american / ac.tokens : NaN;
    const j1m = j1.length ? mean(j1.map((x) => x.southern_british)) : NaN;
    // accent 0-10: acoustics over three takes first (they separate the British candidates; both judges put nearly all
    // of them at the top), then the ABX judge (it does catch American voices: controls 1-2/12), Judge 1 last (too kind)
    const parts: [number, number][] = [[abxShare * 10, 0.3], [clean * 10, 0.6], [j1m, 0.1]].filter(([x]) => Number.isFinite(x)) as [number, number][];
    const accent = parts.length ? parts.reduce((s, [x, w]) => s + x * w, 0) / parts.reduce((s, [, w]) => s + w, 0) : NaN;
    const W: Record<Role, number> = { sensei: 0.55, narrator: 0.5, baron: 0.4 };
    const overall: Score["overall"] = {};
    for (const role of v.roles) {
      const f = fit[role]?.score;
      overall[role] = f != null && Number.isFinite(accent) ? r1(W[role] * accent + (1 - W[role]) * (0.75 * f + 0.25 * (fit[role]!.naturalness ?? f))) : null;
    }
    return {
      cand, key: v.key, preset: r0.preset, roles: v.roles,
      j1: r1(j1m), j1Votes: j1.length, americanFeatures: [...feats.values()].sort((a, b) => b.votes - a.votes),
      abx: { british: abx.filter((x) => x.pick === "uk").length, votes: abx.length, pUk: r1(mean(abx.map((x) => x.p_uk))) },
      abxAudit: { british: abxA.filter((x) => x.pick === "uk").length, votes: abxA.length, pUk: r1(mean(abxA.map((x) => x.p_uk))) },
      fit, acoustic: ac, accent: r1(accent), overall,
    };
  });
}

function select() {
  const scores = scoreAll().filter((s) => s.preset === "steady");
  const want: Record<Role, number> = { sensei: 8, narrator: 4, baron: 3 };
  const keys = new Set<string>();
  const table: any = {};
  for (const role of ["sensei", "narrator", "baron"] as Role[]) {
    // a narrator slot goes to a narrator-pool voice (Sensei voices already read the narrator lines)
    const pool = scores.filter((s) => s.roles.includes(role) && (role !== "narrator" || !s.roles.includes("sensei")));
    const ranked = pool.sort((a, b) => (b.overall[role] ?? -1) - (a.overall[role] ?? -1));
    table[role] = ranked.map((s) => ({ key: s.key, overall: s.overall[role], accent: s.accent, fit: s.fit[role]?.score, nat: s.fit[role]?.naturalness, abx: `${s.abx.british}/${s.abx.votes}`, acoustic: s.acoustic ? `${s.acoustic.american}/${s.acoustic.tokens}` : null, flags: s.acoustic?.flags?.slice(0, 4) }));
    let taken = 0;
    for (const s of ranked) { if (taken >= want[role]) break; keys.add(s.key); taken++; }
  }
  console.log(JSON.stringify(table, null, 1));
  const prev = readJson(FINALISTS, { keys: [] as string[], note: "" });
  if (process.argv.includes("--write") || !prev.keys.length) {
    writeFileSync(FINALISTS, JSON.stringify({ keys: [...keys], note: "chosen by select (screen scores)", screen: table }, null, 1));
    console.log("wrote", rel(FINALISTS), [...keys].join(", "));
  } else console.log("finalists.json exists (pass --write to overwrite):", prev.keys.join(", "));
}

function summary() {
  const renders: Render[] = readJson(RENDERS, []);
  const finalists: string[] = readJson(FINALISTS, { keys: [] as string[] }).keys;
  const scores = scoreAll();
  const VOICE_NOTES: Record<string, string> = {
    dorothy: "Dorothy is a legacy premade voice: ElevenLabs keeps legacy voices working but may retire them.",
    emilia: "Flat a in most BATH words (bath, grass, past, dance, can't) in all three takes: a Northern (or American) a, not Southern British, although the judges call her British.",
    beth: "The warmest and most natural voice in the pool, but her accent slips: \"tomayto\", an r in \"car\" (2 of 3 takes), \"water\" and \"four\", and a flat a in \"dance\" (3 of 3).",
    johnny: "Contested accent: the audit's ABX pair (George v3 against OpenAI ash) heard an American r in \"words\" in 2 of 3 votes, and Judge 1 in 1 of 3; the acoustics measure \"words\" as non-rhotic in all 3 takes. Listen to baron-1.",
    george: "George narrates the trailer (on eleven-v3 there; here on multilingual v2), so he would tie the film to the trailer.",
    fatherchristmas: "An older, twinkly male storyteller (the voice is sold as Father Christmas): the most spellbinding narrator here, if that character suits the island.",
    lily: "Premade: ElevenLabs' own voice.",
    blackwood: "A posh, drawling snob: more sly than shouty.",
    arkadi: "A deep wizardly baritone: more grand than comic.",
  };
  const SENSEI_NOTE = "At this price a full Sensei pass (about 46,000 characters of lines, plus the words and story pages) costs roughly $7, or $15-20 with accent-gated retakes. But changing Sensei's voice means re-recording every line (about 1,250 clips in public/a/l and 65 story pages in public/a/s), every word (about 1,240 in public/a/w, the stretched and held words in public/a/x and public/a/o), and rebuilding all 46 pure sounds in public/a/p from the new voice, because today they are cut from Sulafat.";
  const out = scores.filter((s) => finalists.includes(s.key)).map((s) => {
    const v = voiceOf(s.key);
    const rs = renders.filter((r) => r.cand === s.cand && r.take === 1 && r.mp3);
    const files: Record<string, string[]> = {};
    for (const role of v.roles) files[role] = rs.filter((r) => r.role === role).sort((a, b) => a.line.localeCompare(b.line)).map((r) => r.mp3!);
    const chars = rs.reduce((a, r) => a + r.chars, 0), secs = rs.reduce((a, r) => a + r.dur, 0);
    const notes: string[] = [];
    if (s.acoustic?.flags?.length) notes.push(`Acoustic flags over three takes of the probe lines ([line.tN] = take N; takes 2-3 are the .takeN.mp3 files): ${s.acoustic.flags.join("; ")}.`);
    if (!s.acoustic?.flags?.length && s.acoustic) notes.push(`Acoustics clean: ${s.acoustic.tokens} marker words over ${s.acoustic.takes} clips, none American.`);
    for (const role of v.roles) if (s.fit[role]?.notes?.[0]) notes.push(`${role}: ${s.fit[role]!.notes[0]}`);
    if (VOICE_NOTES[v.key]) notes.push(VOICE_NOTES[v.key]);
    if (s.key === "dorothy" && s.preset === "lively") notes.push("The lively preset pushes Dorothy American: the ABX judge heard it in 4 of 12 votes, and 2 of 3 takes say \"tomayto\".");
    if (v.source === LIB) notes.push("A voice-library voice: its owner can withdraw it (after a notice period) or change its price; premade voices are ElevenLabs' own.");
    if (v.roles.includes("sensei")) notes.push(SENSEI_NOTE);
    return {
      id: s.cand, provider: "elevenlabs", model: MODEL.replace("elevenlabs/", ""), voice: v.name, voiceId: v.id, voiceSource: v.source,
      settings: { preset: s.preset, ...PRESETS[s.preset], language_code: "en", seed: 101, output_format: "mp3_44100_128" },
      roles: v.roles, files,
      britishScore: s.j1, americanFeatures: s.americanFeatures.filter((f) => f.votes >= 2).map((f) => `${f.feature} in "${f.word}" (${f.line}, ${f.votes}/3 votes)`),
      americanFeaturesAllVotes: s.americanFeatures,
      abxBritish: `${s.abx.british}/${s.abx.votes}`, abxPUk: s.abx.pUk, abxAuditPair: `${s.abxAudit.british}/${s.abxAudit.votes}`,
      extraTakes: Object.fromEntries(Object.entries(Object.groupBy(renders.filter((r) => r.cand === s.cand && r.take > 1 && r.mp3), (r) => r.line)).map(([l, rs]) => [l, rs!.sort((a, b) => a.take - b.take).map((r) => r.mp3!)])),
      acoustic: s.acoustic ? { markerWords: s.acoustic.tokens, american: s.acoustic.american, clips: s.acoustic.takes, flags: s.acoustic.flags } : null,
      accentScore: s.accent,
      warmth: s.fit.sensei?.score ?? null,
      roleFit: Object.fromEntries(v.roles.map((r) => [r, s.fit[r] ? { score: s.fit[r]!.score, clarity: s.fit[r]!.clarity, naturalness: s.fit[r]!.naturalness } : null])),
      overall: s.overall,
      costPerMinuteUSD: secs ? Math.round((chars * USD_PER_CHAR) / (secs / 60) * 1000) / 1000 : null,
      notes: notes.join(" "),
    };
  });
  const order = (x: any) => -(Math.max(...Object.values(x.overall as Record<string, number | null>).map((y) => y ?? -1)));
  out.sort((a, b) => a.roles[0].localeCompare(b.roles[0]) || order(a) - order(b));
  writeFileSync(OUT_JSON, JSON.stringify(out, null, 1));
  console.log("wrote", rel(OUT_JSON), out.length, "candidates");
  for (const role of ["sensei", "narrator", "baron"] as Role[]) {
    const top = out.filter((c) => c.roles.includes(role)).sort((a, b) => ((b.overall as any)[role] ?? -1) - ((a.overall as any)[role] ?? -1)).slice(0, 5);
    console.log(`\n${role}:`);
    for (const c of top) console.log(`  ${c.id.padEnd(34)} overall ${(c.overall as any)[role]}  accent ${c.accentScore}  J1 ${c.britishScore}  ABX ${c.abxBritish}  acoustic ${c.acoustic?.american}/${c.acoustic?.markerWords}  fit ${c.roleFit[role]?.score} nat ${c.roleFit[role]?.naturalness}`);
  }
  // calibration: the controls
  const res: Record<string, any> = readJson(JUDGE, {});
  const ctl = new Map<string, any[]>();
  for (const [k, x] of Object.entries(res)) if (/^(abx|j1)\|(eleven-ctrl|audit-)/.test(k) && !x.error) { const kk = k.split("|").slice(0, 2).join("|"); ctl.set(kk, [...(ctl.get(kk) ?? []), x]); }
  console.log("\ncontrols (known accents):");
  for (const [k, xs] of ctl) console.log(`  ${k.padEnd(40)} ${k.startsWith("abx") ? `British ${xs.filter((x) => x.pick === "uk").length}/${xs.length}` : `J1 ${r1(mean(xs.map((x) => x.southern_british)))}`}`);
}

const [mode, stage] = process.argv.slice(2);
if (mode === "render") await render((stage as any) ?? "screen");
else if (mode === "judge") await judge((stage as any) ?? "screen");
else if (mode === "select") select();
else if (mode === "summary") summary();
else if (mode === "finish") {
  // re-finish every candidate's take 1 (after a change to finish())
  const renders: Render[] = readJson(RENDERS, []);
  // takes 2 and 3 (the accent-probe lines) are finished too, as <line>.take<k>.mp3, so a listener can hear the slips
  const fin: string[] = readJson(FINALISTS, { keys: [] as string[] }).keys;
  for (const r of renders) if (r.kind === "candidate" && r.take > 1 && fin.includes(r.key)) r.mp3 = rel(join(AUDIO, r.cand, `${r.line}.take${r.take}.mp3`));
  const todo = renders.filter((r) => r.mp3 && (process.argv.includes("--all") || r.take > 1 || !existsSync(join(ROOT, r.mp3))));
  await pool(todo, 8, async (r) => { finish(join(ROOT, r.src), join(ROOT, r.mp3!), join(ROOT, r.src.replace(/\.mp3$/, ".trim.wav"))); r.dur = Math.round(duration(join(ROOT, r.mp3!)) * 100) / 100; });
  writeFileSync(RENDERS, JSON.stringify(renders, null, 1));
  console.log("re-finished", todo.length);
}
else if (mode === "voices") console.log(JSON.stringify(VOICES, null, 1));
else console.log("usage: elevenlabs.ts render|judge screen|final, select [--write], summary");
