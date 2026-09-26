// Rig test 1: capture method × resolution. Same moment (battle w2-2, the bot playing), four recordings, one at a time.
import { record } from "../../../../../scripts/tweet-clips.ts";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/tweet/2026-09-26/rig-test/compare";
const variants = [
  { name: "cdp-1080", capture: "cdp", size: "1080p" },
  { name: "cdp-720", capture: "cdp", size: "720p" },
  { name: "pw-1080", capture: "playwright", size: "1080p" },
  { name: "pw-720", capture: "playwright", size: "720p" },
] as const;
const only = process.argv.slice(2);
const results: any[] = [];
for (const v of variants.filter((x) => !only.length || only.includes(x.name))) {
  const load = spawnSync("sysctl", ["-n", "vm.loadavg"]).stdout.toString().trim();
  const r = await record({ name: v.name, url: "/play/?level=w2-2", seconds: 18, outDir: OUT, capture: v.capture, size: v.size, sheetEvery: 2 });
  // pacing on the finished master: how many output frames differ from the one before (framemd5 of the decoded video)
  const md5 = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(r.game.start + 0.5), "-to", String(r.game.end - 0.2), "-i", r.master, "-an", "-f", "framemd5", "-"], { maxBuffer: 1 << 28 }).stdout.toString()
    .split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split(",").pop()!.trim());
  let unique = 0, run = 0, longest = 0;
  for (let i = 1; i < md5.length; i++) {
    if (md5[i] !== md5[i - 1]) { unique++; run = 0; } else longest = Math.max(longest, ++run);
  }
  results.push({ ...v, load, frames: r.frames, sync: r.sync, masterFrames: md5.length, changedFrames: unique, changedPct: Math.round((100 * unique) / Math.max(1, md5.length - 1)), longestRepeat: longest, game: r.game, master: r.master });
  console.log(JSON.stringify(results.at(-1)));
}
writeFileSync(`${OUT}/compare-${only.join("_") || "all"}.json`, JSON.stringify(results, null, 1));
