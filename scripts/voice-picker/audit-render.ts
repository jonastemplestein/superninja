// Accent audit, step 1: render the test script with today's voices (and calibration controls).
//   doppler run -p os -c dev -- doppler run -p os-legacy-2026-04 -c dev -- bun scripts/voice-picker/audit-render.ts [--force] [cast,cast]
// Raw takes (wav): playtest/runs/voice-picker/audit/raw/<cast>/<line>.t<k>.wav
// Today's voices, finished (−16 LUFS mp3, like the game): playtest/voice-picker/audio/current/
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tts, finishAudio } from "../tts";
import { pool } from "../gemini";
import { TEST_SCRIPT, CASTS, type Cast, type TestLine } from "./audit-script";

const ROOT = join(import.meta.dir, "../..");
const RAW = join(ROOT, "playtest/runs/voice-picker/audit/raw");
const CURRENT = join(ROOT, "playtest/voice-picker/audio/current");
const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyCasts = args.find((a) => !a.startsWith("--"))?.split(",");

const ffmpeg = (a: string[]) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);
const toWav = (inp: string, out: string) => ffmpeg(["-i", inp, "-ac", "1", "-ar", "44100", out]);

async function cfEleven(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "elevenlabs/eleven-v3", input: { text, voice_id: voiceId, output_format: "mp3_44100_192", language_code: "en" } }),
  });
  const json: any = await res.json();
  if (!json.success) throw new Error(`eleven ${res.status} ${JSON.stringify(json.errors ?? json).slice(0, 300)}`);
  const r = json.result?.result ?? json.result;
  if (!r?.audio) throw new Error("eleven: no audio " + JSON.stringify(r).slice(0, 200));
  const a = await fetch(r.audio);
  return Buffer.from(await a.arrayBuffer());
}

async function openaiTts(text: string, voice: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice, input: text, response_format: "wav" }),
  });
  if (!res.ok) throw new Error(`openai ${res.status} ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function render(cast: Cast, line: TestLine, take: number): Promise<string> {
  const out = join(RAW, cast.key, `${line.id}.t${take}.wav`);
  if (existsSync(out) && !force) return out;
  mkdirSync(dirname(out), { recursive: true });
  const tmp = out.replace(/\.wav$/, ".src");
  let buf: Buffer;
  for (let attempt = 0; ; attempt++) {
    try {
      if (cast.engine === "gemini") buf = await tts({ text: line.text, voice: cast.voice, lang: cast.lang });
      else if (cast.engine === "eleven") buf = await cfEleven(line.text, cast.voice);
      else if (cast.engine === "openai") buf = await openaiTts(line.text, cast.voice);
      else {
        execFileSync("say", ["-v", cast.voice, "-o", tmp + ".aiff", line.text]);
        buf = readFileSync(tmp + ".aiff");
      }
      break;
    } catch (e) {
      if (attempt >= 3) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  writeFileSync(tmp, buf!);
  toWav(tmp, out);
  return out;
}

const jobs: { cast: Cast; line: TestLine; take: number }[] = [];
for (const cast of CASTS) {
  if (onlyCasts && !onlyCasts.includes(cast.key)) continue;
  for (const line of TEST_SCRIPT) {
    if (!cast.roles.includes(line.role)) continue;
    if (cast.lines && !cast.lines.includes(line.id)) continue;
    for (let t = 1; t <= cast.takes; t++) jobs.push({ cast, line, take: t });
  }
}
console.log(`${jobs.length} takes`);

const manifest: any[] = [];
await pool(jobs, 6, async ({ cast, line, take }) => {
  const wav = await render(cast, line, take);
  let mp3: string | undefined;
  if (cast.kind === "current") {
    // Sulafat/Algenib take 1 is the canonical clip; other takes and the trailer narrator carry a suffix.
    const suffix = (cast.key === "george" ? ".george" : "") + (take > 1 ? `.take${take}` : "");
    mp3 = join(CURRENT, `${line.id}${suffix}.mp3`);
    if (!existsSync(mp3) || force) finishAudio(readFileSync(wav), mp3);
  }
  manifest.push({
    line: line.id, role: line.role, text: line.text, take, cast: cast.key, label: cast.label, kind: cast.kind,
    engine: cast.engine, voice: cast.voice, lang: cast.lang ?? null,
    wav: wav.replace(ROOT + "/", ""), mp3: mp3?.replace(ROOT + "/", "") ?? null,
  });
  process.stdout.write(".");
});
console.log();
manifest.sort((a, b) => a.cast.localeCompare(b.cast) || a.line.localeCompare(b.line) || a.take - b.take);
const mPath = join(ROOT, "playtest/runs/voice-picker/audit/renders.json");
const prev: any[] = existsSync(mPath) && onlyCasts ? JSON.parse(readFileSync(mPath, "utf8")).filter((m: any) => !onlyCasts.includes(m.cast)) : [];
writeFileSync(mPath, JSON.stringify([...prev, ...manifest], null, 1));
const cur = [...prev, ...manifest].filter((m) => m.kind === "current").map((m) => ({
  file: m.mp3.replace("playtest/voice-picker/audio/current/", ""), line: m.line, role: m.role, text: m.text, take: m.take,
  engine: m.engine, voice: m.cast === "george" ? "George (JBFqnCBsd6RMkjVDRZzb)" : m.voice, lang: m.lang, label: m.label,
}));
writeFileSync(join(CURRENT, "manifest.json"), JSON.stringify(cur, null, 1));
console.log("wrote", mPath);
