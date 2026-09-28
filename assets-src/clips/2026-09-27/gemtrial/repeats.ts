// Repeated frames in a stretch of a video, counted exactly (after ../battle/repeats.py, in bun for speed): a frame where
// fewer than 20 pixels of a 480×270 grey copy changed by more than 6 levels from the frame before (the 30 fps rebuild
// repeating a slot, or a frozen picture). A repeat amid motion (the frames around it moved: mean difference > 1) is a
// visible judder; one in a still moment is invisible. Also the longest run of repeats (a freeze).
//   bun assets-src/clips/2026-09-27/gemtrial/repeats.ts <file.mp4> [start] [end]
import { spawnSync } from "node:child_process";

const [f, as, bs] = process.argv.slice(2);
const a = Number(as ?? 0), b = bs ? Number(bs) : undefined;
const W = 480, H = 270, N = W * H;
const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", f, "-ss", String(a), ...(b ? ["-t", String(b - a)] : []), "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 2 ** 31 });
const d = r.stdout;
const n = Math.floor(d.length / N);
const changed: number[] = [], mean: number[] = [];
for (let k = 1; k < n; k++) {
  let c = 0, s = 0;
  const o = k * N, p = (k - 1) * N;
  for (let i = 0; i < N; i++) {
    const x = Math.abs(d[o + i] - d[p + i]);
    s += x;
    if (x > 6) c++;
  }
  changed.push(c);
  mean.push(s / N);
}
const reps = changed.map((c, k) => (c < 20 ? k : -1)).filter((k) => k >= 0);
const moving = (k: number) => Math.max(0, ...[k - 1, k + 1].filter((j) => j >= 0 && j < mean.length && !reps.includes(j)).map((j) => mean[j]));
const vis = reps.filter((k) => moving(k) > 1.0);
let run = 0, best = 0, bestAt = 0;
for (let k = 0; k < changed.length; k++) {
  run = changed[k] < 20 ? run + 1 : 0;
  if (run > best) (best = run), (bestAt = k);
}
console.log(`${f.split("/").pop()} [${a}–${b ?? "end"}]: ${n} frames; repeats ${reps.length}, amid motion ${vis.length}; longest run ${best}${best ? ` (ending ${(a + (bestAt + 1) / 30).toFixed(3)} s)` : ""}`);
for (const k of vis) console.log(`  ${(a + (k + 1) / 30).toFixed(3)} s  pixels changed ${changed[k]}  motion around ${moving(k).toFixed(2)}`);
