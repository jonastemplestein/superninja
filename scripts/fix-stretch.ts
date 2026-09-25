// Second pass for stretched words that scored < 8: try alternative TTS spellings and a pitch-preserving
// slowed copy of the clean word clip (rubberband), keep whichever the judge likes best.
// Usage: doppler run -p os-legacy-2026-04 -c dev -- bun scripts/fix-stretch.ts assets-src/stretch.log
import { readFileSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tts, finishAudio, judgeAudio } from "./tts";
import { pool } from "./gemini";

const bad = readFileSync(process.argv[2], "utf8").split("\n").filter((l) => l.startsWith("⚠")).map((l) => l.split(" ")[1]);
const rubric = (w: string) => `The clip must be the single English word "${w}" said SLOWLY by a British teacher, stretching the sounds that can be held, as ONE continuous word with no gaps between sounds and no added "uh". Score 10 if it is clearly "${w}", slow and smooth; low if it's a different word, has pauses between sounds, letter names, or extra words.`;
await pool(bad, 6, async (w) => {
  const cands: string[] = [];
  for (const f of [0.6, 0.5]) {
    const out = `assets-src/tmp/xs_${w}_${f}.mp3`;
    execFileSync("bash", ["-c", `ffmpeg -loglevel error -y -i public/a/w/${w}.mp3 -ar 44100 -ac 1 /tmp/xs_${w}.wav && rubberband -q -T${f} --formant /tmp/xs_${w}.wav /tmp/xs_${w}_o.wav && ffmpeg -loglevel error -y -i /tmp/xs_${w}_o.wav -b:a 96k ${out}`]);
    cands.push(out);
  }
  for (const [i, text] of [`${w}... ${w.split("").join("")}`, w.replace(/([aeiou])/g, "$1$1"), w.replace(/([aeiou])/g, "$1$1$1$1")].entries()) {
    const out = `assets-src/tmp/xt_${w}_${i}.mp3`;
    try { finishAudio(await tts({ text: text.split("... ").pop()! }), out); cands.push(out); } catch {}
  }
  let best = { score: -1, f: "" };
  for (const f of cands) {
    const r = await judgeAudio(f, rubric(w));
    if (r.score > best.score) best = { score: r.score, f };
  }
  copyFileSync(best.f, `public/a/x/${w}.mp3`);
  console.log(best.score >= 7 ? "✓" : "⚠", w, best.score, best.f);
});
