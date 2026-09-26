// Rig test 4: a heavy scene (the gem victory on the World Flower), 1080p q92 vs q80 vs 720p: delivered fps and hitches.
import { record, tweetSave } from "../../../../../scripts/tweet-clips.ts";
import { spawnSync } from "node:child_process";
const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/tweet/2026-09-26/rig-test/heavy";
const FLOWER = {
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "ay>ae"],
  energy: { "o>o": 5, "c>k": 3, "b>b": 6, "ai>ae": 8, "ss>s": 4, "l>l": 7 },
};
const variants = [
  { name: "victory-1080-q92", size: "1080p", quality: 92 },
  { name: "victory-1080-q80", size: "1080p", quality: 80 },
  { name: "victory-720-q92", size: "720p", quality: 92 },
  { name: "victory-1080-gpu", size: "1080p", quality: 92, gpu: true },
  { name: "battle-1080-gpu", size: "1080p", quality: 92, gpu: true, url: "/play/?level=w2-2" },
] as const;
const only = process.argv.slice(2);
for (const v of variants.filter((x) => !only.length || only.includes(x.name))) {
  const load = spawnSync("sysctl", ["-n", "vm.loadavg"]).stdout.toString().trim();
  const r = await record({ name: v.name, url: (v as any).url ?? "/play/?scene=tree&gem=ai%3Eae&celebrate=1", gpu: (v as any).gpu, save: tweetSave(FLOWER), seconds: 20, outDir: OUT, size: v.size, quality: v.quality, sheetEvery: 2, drive: async (_p, rig) => ((v as any).url ? rig.bot() : rig.wait(30000)) });
  console.log(JSON.stringify({ ...v, load, frames: r.frames, sync: { shift: r.sync.audioShiftMs, median: r.sync.residualMedianMs, maxAbs: r.sync.residualMaxAbsMs } }));
}
process.exit(0);
