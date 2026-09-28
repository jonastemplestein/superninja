// Voice picker: finish the OpenAI renderer's extra takes (takes 2 and 3 of the accent lines, rendered for the 30
// leaders) the same way openai.ts finishes take 1, so the picker can play them like every other provider's takes.
// Raw:      playtest/runs/voice-picker/openai/raw/<id>/<line>.t<k>.wav
// Finished: playtest/voice-picker/audio/openai/<id>/<line>.take<k>.mp3 (trimmed, 25 ms fades, -16 LUFS, -1.5 dBTP, 112 kbps mono)
//
//   bun scripts/voice-picker/picker-openai-takes.ts [--force]
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";
// gainTo as in scripts/tts.ts (inlined: importing tts.ts pulls in the Gemini client, which wants an API key)
function gainTo(file: string, target: number): number {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=framelog=quiet", "-f", "null", "-"]);
  const m = String(r.stderr).match(/I:\s+(-?[\d.]+) LUFS/g);
  const lufs = m ? parseFloat(m[m.length - 1].replace(/[^-\d.]/g, "")) : NaN;
  return Number.isFinite(lufs) && lufs > -70 ? target - lufs : 0;
}

const ROOT = join(import.meta.dir, "../..");
const RAW = join(ROOT, "playtest/runs/voice-picker/openai/raw");
const OUT = join(ROOT, "playtest/voice-picker/audio/openai");
const TMP = join(ROOT, "playtest/runs/voice-picker/picker/tmp");
const FORCE = process.argv.includes("--force");

const ids = new Set((JSON.parse(readFileSync(join(ROOT, "playtest/voice-picker/candidates-openai.json"), "utf8")) as any[]).map((c) => c.id));

function finish(wav: string, outMp3: string, tmp: string) {
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  const fades = "afade=t=in:d=0.025,areverse,afade=t=in:d=0.025,areverse";
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", wav, "-af", `${trim},${fades}`, "-ar", "44100", "-ac", "1", tmp]);
  let gain = gainTo(tmp, -16);
  for (let pass = 0; pass < 3; pass++) {
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", tmp, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=0.05`,
      "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "112k", outMp3]);
    const off = gainTo(outMp3, -16);
    if (Math.abs(off) <= 0.5) break;
    gain += off;
  }
}

let done = 0, skipped = 0;
for (const id of readdirSync(RAW)) {
  if (!ids.has(id)) continue;
  for (const f of readdirSync(join(RAW, id))) {
    const m = f.match(/^(.+)\.t([23])\.wav$/);
    if (!m) continue;
    const out = join(OUT, id, `${m[1]}.take${m[2]}.mp3`);
    if (!existsSync(join(OUT, id))) continue; // only candidates the app shows
    if (existsSync(out) && !FORCE) { skipped++; continue; }
    mkdirSync(join(TMP, id), { recursive: true });
    finish(join(RAW, id, f), out, join(TMP, id, `${m[1]}.take${m[2]}.trim.wav`));
    done++;
  }
}
console.log(`finished ${done} OpenAI extra takes (${skipped} already there)`);
