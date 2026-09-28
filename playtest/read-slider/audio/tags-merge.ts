// Picture reading v2: merge the read-slider block's line tags (docs/read-slider/line-tags.json, from meta.ts) into
// src/core/content/line-tags.ts in place, for these ids only (rs_* and pr_* of playtest/read-slider/audio/ids.txt): an
// existing entry is replaced on its own line, a new one is appended before the closing brace. content.test.ts 6b
// ("every current spoken line has runtime metadata") needs them. Same shape as playtest/demo/audio/tags.ts.
//   bun playtest/read-slider/audio/meta.ts && bun playtest/read-slider/audio/tags-merge.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = join(import.meta.dir, "../../..");
const FILE = join(ROOT, "src/core/content/line-tags.ts");
const tags = JSON.parse(readFileSync(join(ROOT, "docs/read-slider/line-tags.json"), "utf8")) as Record<string, unknown>;
let src = readFileSync(FILE, "utf8");
let replaced = 0, added = 0;
const fresh: string[] = [];
for (const [id, meta] of Object.entries(tags)) {
  if (!/^(rs|pr)_/.test(id)) throw new Error(`not a read-slider id: ${id}`);
  const line = `  ${JSON.stringify(id)}: ${JSON.stringify(meta)},`;
  const re = new RegExp(`^  ${JSON.stringify(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: .*,$`, "m");
  if (re.test(src)) (src = src.replace(re, line)), replaced++;
  else fresh.push(line), added++;
}
const end = src.lastIndexOf("\n};");
if (end < 0) throw new Error("no closing brace");
src = src.slice(0, end) + (fresh.length ? "\n" + fresh.join("\n") : "") + src.slice(end);
writeFileSync(FILE, src);
console.log(`line-tags.ts: ${replaced} replaced, ${added} added`);
