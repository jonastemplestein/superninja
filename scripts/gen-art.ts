// Generate all art in the manifest (skips existing). Then post-process with scripts/post-art.py.
// Usage: bun scripts/gen-art.ts [idPrefix...] [--force]
import { existsSync } from "node:fs";
import { ART, type ArtJob } from "./art-manifest";
import { makeImage } from "./img";
import { pool } from "./gemini";

const args = process.argv.slice(2);
const force = args.includes("--force");
const prefixes = args.filter((a) => !a.startsWith("--"));
const raw = (id: string) => `assets-src/art/${id}.png`;

const selected = ART.filter((j) => !prefixes.length || prefixes.some((p) => j.id.startsWith(p)));
const todo = selected.filter((j) => force || !existsSync(raw(j.id)));
console.log(`${todo.length} to generate of ${selected.length}`);

async function run(j: ArtJob) {
  const refs = (j.refs ?? []).map(raw);
  for (const r of refs) if (!existsSync(r)) throw new Error(`missing ref ${r} for ${j.id}`);
  const t = Date.now();
  await makeImage({ out: raw(j.id), prompt: j.prompt, refs, aspect: j.aspect ?? "1:1", model: j.model });
  console.log("✓", j.id, ((Date.now() - t) / 1000).toFixed(0) + "s");
}

// Stage 1: no refs. Stage 2: jobs depending on refs.
await pool(todo.filter((j) => !j.refs?.length), 8, run);
await pool(todo.filter((j) => j.refs?.length), 8, run);
