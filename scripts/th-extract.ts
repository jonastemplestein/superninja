import { tts, finishAudio } from "./tts";
import { pool } from "./gemini";
import { execFileSync } from "node:child_process";
const words = ["thhhhin.", "thhhhick.", "thhhumb.", "thin.", "thick.", "thhhhhing."];
await pool(words.flatMap((w) => [0, 1].map((t) => ({ w, t }))), 6, async ({ w, t }) => {
  const f = `assets-src/th/${w.replace(/\W/g, "")}_${t}.mp3`;
  finishAudio(await tts({ text: w, voice: "Erinome" }), f);
  execFileSync("uv", ["run", "--with", "numpy", "python", "scripts/extract-th.py", f, f.replace(".mp3", "_th.mp3")], { stdio: "inherit" });
});
