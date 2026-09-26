// Bring speech clips that are more than 1 LU off the library's loudness (scripts/tts.ts SPEECH_LUFS) to it, with one
// gain each (a re-encode: use it for clips whose TTS source is gone, not as a habit; new clips come out right from
// finishAudio). Short pure sounds that can't be measured are left alone. The originals go to .trash/relevel/.
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/relevel-audio.ts public/a/l/fs_*.mp3 ...   (--dry: report only)
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, renameSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { SPEECH_LUFS, checkLoudness, gainTo } from "./tts";

const dry = process.argv.includes("--dry");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const trash = join(import.meta.dir, "../.trash/relevel");
mkdirSync(trash, { recursive: true });
let fixed = 0;
for (const f of files) {
  const before = checkLoudness(f);
  if (before.ok) continue;
  const g = gainTo(f, SPEECH_LUFS);
  if (dry) {
    console.log(`${f}: ${before.lufs} LUFS → would apply ${g.toFixed(1)} dB`);
    continue;
  }
  const keep = join(trash, `${basename(dirname(f))}_${basename(f)}`);
  copyFileSync(f, keep);
  const tmp = f.replace(/\.mp3$/, ".relevel.mp3");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", f, "-af", `volume=${g.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled`, "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "4", tmp]);
  renameSync(tmp, f);
  const after = checkLoudness(f);
  console.log(`${after.ok ? "✓" : "⚠"} ${f}: ${before.lufs} → ${after.lufs} LUFS`);
  fixed++;
}
console.log(`${fixed} of ${files.length} clips re-levelled${dry ? " (dry run)" : ""}`);
