// Hash-bucketed asset versions (docs/speech-templates/delivery.md §4): the build half, as a reference for vite.config.ts.
// Every file under public/a/ belongs to one bucket: its folder ("l", "t/say_slowly") and a 16-way hash of its file name.
// A bucket's version is a hash of its files' names and bytes, so re-recording one clip changes one bucket's version
// and the service worker drops only that bucket's cached clips.
//
//   bun playtest/speech-templates/delivery/buckets.ts [root=public/a]   → prints stats; writes nothing
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const NB = 16; // buckets per folder
export const W = 6; // hex chars per bucket version (24 bits)

/** FNV-1a over the file name's UTF-16 code units: the same function runs in the service worker. */
export function fnv(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** { folder: NB×W hex chars }, folder relative to root ("l", "t/say_slowly"). An empty bucket is "0"×W. */
export function assetBuckets(root: string): { table: Record<string, string>; files: number; perDir: Record<string, number> } {
  const byDir = new Map<string, string[][]>();
  let files = 0;
  const walk = (dir: string, rel: string) => {
    for (const n of readdirSync(dir).sort()) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) walk(p, rel ? `${rel}/${n}` : n);
      else if (rel) {
        let buckets = byDir.get(rel);
        if (!buckets) byDir.set(rel, (buckets = Array.from({ length: NB }, () => [])));
        buckets[fnv(n) % NB].push(`${n}\0${createHash("sha1").update(readFileSync(p)).digest("hex")}`);
        files++;
      }
    }
  };
  walk(root, "");
  const table: Record<string, string> = {};
  const perDir: Record<string, number> = {};
  for (const [dir, buckets] of [...byDir].sort(([a], [b]) => a.localeCompare(b))) {
    table[dir] = buckets.map((b) => (b.length ? createHash("sha1").update(b.join("\n")).digest("hex").slice(0, W) : "0".repeat(W))).join("");
    perDir[dir] = buckets.reduce((s, b) => s + b.length, 0);
  }
  return { table, files, perDir };
}

if (import.meta.main) {
  const root = process.argv[2] ?? "public/a";
  const t0 = performance.now();
  const { table, files, perDir } = assetBuckets(root);
  const ms = performance.now() - t0;
  const json = JSON.stringify(table);
  console.log(`${files} files in ${Object.keys(table).length} folders, hashed in ${ms.toFixed(0)} ms`);
  console.log(`table: ${json.length} bytes of JSON (${Object.keys(table).length} folders × ${NB} buckets × ${W} chars)`);
  for (const [d, n] of Object.entries(perDir)) console.log(`  ${d.padEnd(28)} ${String(n).padStart(6)} files, ~${Math.ceil(n / NB)} per bucket`);
}
