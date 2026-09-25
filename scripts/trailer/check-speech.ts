// Ask Gemini whether audio files contain any speech/singing (catches models vocalising prompts).
// bun scripts/trailer/check-speech.ts <file...>
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { geminiKey } from "./lib";
for (const f of process.argv.slice(2)) {
  const mp3 = `/tmp/sn-check-${Date.now()}.mp3`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", f, "-vn", "-ac", "1", "-b:a", "96k", mp3]);
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
    method: "POST", headers: { "x-goog-api-key": geminiKey(), "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: "audio/mp3", data: readFileSync(mp3).toString("base64") } }, { text: 'Does this audio contain any human or synthetic speech, spoken words, singing or lyrics (not counting wordless grunts)? Reply ONLY JSON: {"speech": true|false, "words": "<verbatim words heard with mm:ss timestamps, or empty>"}' }] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } }),
  });
  const j: any = await res.json();
  console.log(f.split("/").pop(), j.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(j).slice(0, 200));
}
