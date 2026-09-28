// Critic pass on docs/SPEECH_TEMPLATES.md, step 1: does "Say {word} slowly." come out fluent as a whole take, and does
// the phrasing matter? The experiment's A takes of T1 had 200–385 ms pauses after the word ("Say, rain, slowly.").
// Renders 4 phrasings × 6 words × 2 takes with the production voice, finished like every line (finishAudio).
// Run: doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/critic/render.ts
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { finishAudio, tts } from "../../../scripts/tts";
import { pool } from "../../../scripts/gemini";

const ROOT = join(import.meta.dir, "../../..");
const OUT = join(ROOT, "playtest/runs/speech-templates/critic/phrasing");
const WORDS = ["mat", "frog", "rain", "sun", "sock", "ship"];
const PHRASINGS: Record<string, string> = {
  P0: "Say {w} slowly.",
  P1: "Now say {w} slowly.",
  P2: "Can you say {w} slowly?",
  P3: "Let's say {w} slowly, together.",
};
const jobs = WORDS.flatMap((w) => Object.entries(PHRASINGS).flatMap(([p, t]) => [0, 1].map((k) => ({ w, p, k, text: t.replace("{w}", w) }))));
const manifest: { w: string; p: string; k: number; text: string; mp3: string }[] = [];
await pool(jobs, 6, async (j) => {
  const mp3 = join(OUT, `${j.p}_${j.w}_t${j.k}.mp3`);
  if (!existsSync(mp3)) finishAudio(await tts({ text: j.text }), mp3);
  manifest.push({ ...j, mp3 });
});
manifest.sort((a, b) => a.mp3.localeCompare(b.mp3));
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 1));
console.log(manifest.length, "takes in", OUT);
