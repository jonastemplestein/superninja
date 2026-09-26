/** Keep only cards that exist and passed the phase-C blind naming screen. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WORDS } from "../../src/content/phonics";
import { SW_SEQUENCE, type SwUnitId } from "../../src/content/sw";
import { parseSegs } from "./core";
import { loadUnit } from "./validate-units";
import type { UnitData } from "./types";

const ROOT = join(import.meta.dir, "../..");
const status = JSON.parse(readFileSync(join(ROOT, "playtest/content/unit-assets.json"), "utf8")) as Record<string, { ok: boolean; attempts: number; detail?: string }>;
const all = new Map<SwUnitId, UnitData>();
for (const u of SW_SEQUENCE) all.set(u, await loadUnit(u));
const homophones = new Map<string, Set<string>>();
for (const w of [...WORDS.map(w => ({ text: w.text, segs: w.segs })), ...[...all.values()].flatMap(d => d.words.map(w => ({ text: w.text, segs: parseSegs(w.segs) })))]) {
  const key = w.segs.map(s => s.p).join("-");
  (homophones.get(key) ?? homophones.set(key, new Set()).get(key)!).add(w.text);
}
const dropped = new Map<string, { word: string; reason: string; attempts: number }>();
for (const [u, data] of all) {
  let changed = false;
  for (const w of data.words) {
    if (!w.tags.includes("picture")) continue;
    const file = join(ROOT, `public/a/i/pic_${w.text}.webp`);
    const row = status[`picture:${w.text}`];
    if (existsSync(file) && (!row || row.ok)) continue;
    const reason = row?.detail ?? "missing card";
    dropped.set(w.text, { word: w.text, reason, attempts: row?.attempts ?? 0 });
    delete w.pic;
    w.tags = w.tags.filter(t => t !== "picture" && t !== "new-prompt" && t !== "dictation-safe" && t !== "reading-only");
    const key = parseSegs(w.segs).map(s => s.p).join("-");
    w.tags.push((homophones.get(key)?.size ?? 0) > 1 ? "reading-only" : "dictation-safe");
    changed = true;
  }
  if (!changed) continue;
  const file = join(ROOT, `src/content/units/${u}.ts`);
  const header = readFileSync(file, "utf8").split("\n")[0];
  const body = (["words", "sentences", "chains", "nonsense", "poly"] as const).map(k => `export const ${k} = ${JSON.stringify(data[k] ?? [], null, 2)} as const;`).join("\n\n");
  writeFileSync(file, `${header}\n${body}\n`);
  console.log(`Picture tags updated: ${u}`);
}
const rows = [...dropped.values()].sort((a, b) => a.word.localeCompare(b.word));
writeFileSync(join(ROOT, "playtest/content/picture-dropped.json"), JSON.stringify(rows, null, 2) + "\n");
console.log(`Dropped ${rows.length} ambiguous or missing picture tags`);
