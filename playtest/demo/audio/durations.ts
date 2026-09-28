// public/a/durations.json for the demo choreography's clips only (the tv_demo_* lines): each clip's length in ms, as
// scripts/gen-durations.ts measures it (ffprobe), merged into the file without re-measuring anything else.
//   bun playtest/demo/audio/durations.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { LINES } from "../../../src/content/lines";

const ROOT = join(import.meta.dir, "../../..");
const FILE = join(ROOT, "public/a/durations.json");
const dur: Record<string, number> = JSON.parse(readFileSync(FILE, "utf8"));
let n = 0;
for (const l of LINES.filter((x) => x.id.startsWith("tv_demo_"))) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", join(ROOT, `public/a/l/${l.id}.mp3`)], { encoding: "utf8" });
  const s = Number(r.stdout.trim());
  if (!(s > 0)) continue;
  dur[`l/${l.id}`] = Math.round(s * 1000);
  n++;
}
writeFileSync(FILE, JSON.stringify(Object.fromEntries(Object.entries(dur).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");
console.log(`${n} clips measured into public/a/durations.json`);
