// Writes playtest/voice/texts.json: {id: text} for the lines this lane records (playtest/voice/ids-tier{1,2,3}.txt), for
// qa.py, judge.ts and the listening page.
//   bun playtest/voice/texts.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LINES } from "../../src/content/lines";
const ids = ["ids-tier1.txt", "ids-tier2.txt", "ids-tier3.txt"].flatMap((f) => readFileSync(join(import.meta.dir, f), "utf8").split(/\s+/).filter(Boolean));
const text = Object.fromEntries(LINES.map((l) => [l.id, l.text]));
writeFileSync(join(import.meta.dir, "texts.json"), JSON.stringify(Object.fromEntries(ids.map((i) => [i, text[i]])), null, 1) + "\n");
console.log(`${ids.length} lines → playtest/voice/texts.json`);
