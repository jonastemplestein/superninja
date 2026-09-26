// Does trim() keep the master's sync? Find the cut's audio lag against the master WAV (cross-correlation), and its
// video lag against the master's frames (best-matching frame offset). Both 0 = the clip is the master's window exactly.
import { spawnSync } from "node:child_process";
const [master, cut, startS] = process.argv.slice(2);
const start = Math.round(Number(startS) * 30) / 30;
const pcm = (f: string, ss: number, t: number) => {
  const b = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", f, "-ss", String(ss), "-t", String(t), "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 }).stdout;
  return new Float32Array(b.buffer, b.byteOffset, b.length / 4);
};
const a = pcm(cut, 1, 6), m = pcm(master.replace(".mp4", ".wav"), start + 1 - 0.05, 6.1);
let best = -Infinity, lag = 0;
for (let L = 0; L <= 4800; L++) {
  let s = 0;
  for (let i = 0; i < a.length; i += 2) s += a[i] * m[i + L];
  if (s > best) (best = s), (lag = L);
}
console.log("audio: the cut is", ((lag - 2400) / 48).toFixed(2), "ms off the master window (0 = exact)");
const frames = (f: string, ss: number, n: number) => {
  const b = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(ss), "-i", f, "-frames:v", String(n), "-vf", "scale=64:36,format=gray", "-f", "rawvideo", "-"], { maxBuffer: 1 << 26 }).stdout;
  return Array.from({ length: n }, (_, k) => b.subarray(k * 2304, (k + 1) * 2304));
};
const cf = frames(cut, 2, 30), mf = frames(master, start + 2 - 3 / 30, 36);
for (const off of [-2, -1, 0, 1, 2]) {
  let d = 0;
  for (let k = 0; k < 30; k++) for (let i = 0; i < 2304; i++) d += Math.abs(cf[k][i] - mf[k + 3 + off][i]);
  console.log(`video: frame offset ${off}: mean diff ${(d / 30 / 2304).toFixed(2)}`);
}
