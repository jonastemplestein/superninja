// Blind-transcribe every spoken line and compare with its script; print mismatches (extra/missing words).
import { readFileSync, writeFileSync } from "node:fs";
import { LINES } from "../src/content/lines";
import { generate, textOf, pool } from "./gemini";
const norm = (s: string) => s.toLowerCase().replace(/mwa-ha[-ha]*/g, "mwahaha").replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
const bad: { id: string; heard: string; script: string }[] = [];
await pool(LINES, 8, async (l) => {
  const j = await generate("gemini-3.8-flash", { contents: [{ parts: [{ inlineData: { mimeType: "audio/mp3", data: readFileSync(`public/a/l/${l.id}.mp3`).toString("base64") } }, { text: "Transcribe exactly every word and every stray letter-sound you hear, verbatim, nothing else. Reply JSON {\"text\": \"...\"}" }] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  let heard = "";
  try { heard = JSON.parse(textOf(j)).text; } catch { heard = textOf(j); }
  const a = norm(l.text), b = norm(heard);
  const extra = b.filter((w, i) => !a.includes(w));
  const missing = a.filter((w) => !b.includes(w));
  if (extra.length + missing.length > 0 && Math.abs(b.length - a.length) >= 1) bad.push({ id: l.id, heard, script: l.text });
});
console.table(bad.map((x) => ({ id: x.id, heard: x.heard.slice(0, 80), script: x.script.slice(0, 60) })));
writeFileSync("assets-src/line-audit.json", JSON.stringify(bad, null, 1));
