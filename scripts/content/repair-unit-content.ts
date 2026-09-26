/** Refresh Year 2 poly review and resolve homophone tags after all units exist. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WORDS } from "../../src/content/phonics";
import { SW_SEQUENCE, type SwUnitId } from "../../src/content/sw";
import { buildPoly } from "./build-unit";
import { parseSegs } from "./core";
import { loadUnit } from "./validate-units";
import type { UnitData } from "./types";

const units = SW_SEQUENCE as SwUnitId[];
const all = new Map<SwUnitId, UnitData>();
for (const u of units) all.set(u, await loadUnit(u));
const homophones = new Map<string, Set<string>>();
for (const w of [...WORDS.map(w => ({ text: w.text, segs: w.segs })), ...[...all.values()].flatMap(d => d.words.map(w => ({ text: w.text, segs: parseSegs(w.segs) })))]) {
  const key = w.segs.map(s => s.p).join("-");
  (homophones.get(key) ?? homophones.set(key, new Set()).get(key)!).add(w.text);
}
for (const u of units) {
  const data = all.get(u)!;
  let changed = false;
  for (const w of data.words) {
    const sounds = parseSegs(w.segs).map(s => s.p).join("-");
    if ((homophones.get(sounds)?.size ?? 0) <= 1 || w.tags.includes("picture") || !w.tags.includes("dictation-safe")) continue;
    if (data.sentences.some(s => new RegExp(`\\b${w.text}\\b`, "i").test(s.text))) continue;
    w.tags = w.tags.map(t => t === "dictation-safe" ? "reading-only" : t);
    changed = true;
  }
  if (u === "EC8") {
    for (const s of data.sentences) if (s.text === "A little bird sat on the fence.") {
      s.text = "A little bird sat on a log.";
      changed = true;
    }
  }
  if (u.startsWith("EC") && +u.slice(2) >= 27) {
    data.poly = buildPoly(u);
    changed = true;
  }
  if (!changed) continue;
  const file = join(import.meta.dir, `../../src/content/units/${u}.ts`);
  const old = readFileSync(file, "utf8");
  const keys = ["words", "sentences", "chains", "nonsense", "poly"] as const;
  const body = keys.map(k => `export const ${k} = ${JSON.stringify(data[k] ?? [], null, 2)} as const;`).join("\n\n");
  writeFileSync(file, old.slice(0, old.indexOf("\n") + 1) + body + "\n");
  console.log(`Repaired ${u}`);
}
