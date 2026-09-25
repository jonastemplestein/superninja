// Extra TTS takes for one line, to pick a tighter or better-matched read.
// Run: doppler run -p os-legacy-2026-04 -c dev -- bun assets-src/world-flower/takes.ts <lineId> <n>
// Writes assets-src/tmp/takes/<id>_<k>.mp3 and prints duration, median pitch and judge score for each.
import { execFileSync } from "node:child_process";
import { LINES } from "../../src/content/lines";
import { tts, finishAudio, judgeAudio, durationOf } from "../../scripts/tts";
const VOICES = { sensei: "Sulafat", baron: "Algenib" } as const;
const [id, n = "3"] = process.argv.slice(2);
const l = LINES.find((x) => x.id === id)!;
await Promise.all(Array.from({ length: +n }, async (_, k) => {
  const out = `assets-src/tmp/takes/${id}_${k}.mp3`;
  finishAudio(await tts({ text: l.text, voice: VOICES[l.who ?? "sensei"] }), out);
  const j = await judgeAudio(out, `The clip should be a British-accented voice reading exactly this script, expressively, with nothing added or missed: "${l.text}". Score 10 if it matches the script exactly with a natural British accent.`);
  const hz = execFileSync("uv", ["run", "--with", "numpy", "python", "scripts/pitch.py", out]).toString().trim().split(/\s+/)[0];
  console.log(out, durationOf(out).toFixed(2) + "s", hz + "Hz", "score", j.score, j.heard);
}));
