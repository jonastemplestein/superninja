// {id: text} for the read-slider block's lines (playtest/read-slider/audio/ids.txt), for playtest/voice/qa.py and the
// accent judge. Also prints each line's accent-judge target words (BATH, r, flap).
//   bun playtest/read-slider/audio/texts.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LINES } from "../../../src/content/lines";
const ids = readFileSync(join(import.meta.dir, "ids.txt"), "utf8").split(/\s+/).filter(Boolean);
const text = Object.fromEntries(LINES.map((l) => [l.id, l.text]));
writeFileSync(join(import.meta.dir, "texts.json"), JSON.stringify(Object.fromEntries(ids.map((i) => [i, text[i]])), null, 1) + "\n");
const findWords = process.env.GEMINI_API_KEY || process.env.APP_CONFIG_GEMINI_API_KEY ? (await import("../../../scripts/accent-judge")).findWords : null;
if (findWords) for (const i of ids) {
  const w = findWords(text[i]);
  if (w.bath?.length) console.log(i, "bath:", w.bath.join(","));
}
console.log(`${ids.length} lines → texts.json`);
