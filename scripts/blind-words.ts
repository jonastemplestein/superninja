import { readFileSync, writeFileSync } from "node:fs";
import { WORDS, SPECIAL_WORDS } from "../src/content/phonics";
import { generate, textOf, pool } from "./gemini";
const all = [...WORDS.map((w) => w.text), ...SPECIAL_WORDS];
const bad: any[] = [];
const fid = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_");
await pool(all, 6, async (w) => {
  const j = await generate("gemini-3.8-flash", { contents: [{ parts: [
    { inlineData: { mimeType: "audio/mp3", data: readFileSync(`public/a/w/${fid(w)}.mp3`).toString("base64") } },
    { text: `Transcribe this single spoken English word (British accent). Reply JSON only: {"word": "<the word, lowercase>", "accent": "<British|American|other>", "extra": <true if there is anything besides one word>}` },
  ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  try {
    const o = JSON.parse(textOf(j));
    const got = String(o.word).toLowerCase().replace(/[^a-z]/g, "");
    if (got !== w.toLowerCase() || o.accent !== "British" || o.extra) bad.push({ w, ...o });
  } catch { bad.push({ w, err: true }); }
});
console.table(bad);
writeFileSync("assets-src/blind-words.json", JSON.stringify(bad, null, 1));
