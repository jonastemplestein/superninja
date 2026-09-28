// The tempo and beat grid of a music file (for cutting on the beat): an onset envelope (half-wave rectified change of
// band energies, 10 ms hops), its autocorrelation over 70–190 BPM, then the phase that best fits the onsets.
//   bun assets-src/clips/2026-09-27/supercut/tempo.ts <file.mp3> [from=0] [len=90]
import { spawnSync } from "node:child_process";

export function tempo(file: string, from = 0, len = 90) {
  const sr = 22050, hop = 220; // 10 ms
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-ss", String(from), "-t", String(len), "-ac", "1", "-ar", String(sr), "-f", "f32le", "pipe:1"], { maxBuffer: 1 << 30 });
  const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
  // crude bands: the signal, a one-pole low-pass (<200 Hz: kick), and the high residue (hats, snare)
  const n = Math.floor(x.length / hop);
  const lowE = new Float64Array(n), highE = new Float64Array(n);
  let lp = 0;
  const a = Math.exp((-2 * Math.PI * 200) / sr);
  for (let i = 0; i < n * hop; i++) {
    lp = a * lp + (1 - a) * x[i];
    const k = Math.floor(i / hop);
    lowE[k] += lp * lp;
    highE[k] += (x[i] - lp) ** 2;
  }
  const flux = new Float64Array(n);
  for (let k = 1; k < n; k++) {
    const l = Math.log1p(1e3 * lowE[k]) - Math.log1p(1e3 * lowE[k - 1]);
    const h = Math.log1p(1e3 * highE[k]) - Math.log1p(1e3 * highE[k - 1]);
    flux[k] = Math.max(0, l) * 1.5 + Math.max(0, h);
  }
  // remove the local mean
  const env = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let s = 0, c = 0;
    for (let j = Math.max(0, k - 25); j < Math.min(n, k + 25); j++) (s += flux[j]), c++;
    env[k] = Math.max(0, flux[k] - s / c);
  }
  const lags: { bpm: number; score: number }[] = [];
  for (let bpm = 70; bpm <= 190; bpm += 0.25) {
    const lag = 6000 / bpm; // in hops
    let s = 0;
    for (let k = 0; k + lag * 4 + 2 < n; k++) {
      const v = (d: number) => {
        const p = k + d * lag, i = Math.floor(p), f = p - i;
        return env[i] * (1 - f) + env[i + 1] * f;
      };
      s += env[k] * (v(1) + 0.5 * v(2) + 0.5 * v(4));
    }
    lags.push({ bpm, score: s / n });
  }
  lags.sort((p, q) => q.score - p.score);
  const bpm = lags[0].bpm, period = 6000 / bpm;
  // the phase: the offset whose comb hits the most onset energy
  let best = -1, phase = 0;
  for (let p = 0; p < period; p += 0.25) {
    let s = 0;
    for (let t = p; t < n - 1; t += period) {
      const i = Math.floor(t), f = t - i;
      s += env[i] * (1 - f) + env[i + 1] * f;
    }
    if (s > best) (best = s), (phase = p);
  }
  // which of four beats carries the most low-band onset energy (a guess at the downbeat)
  const bar = [0, 0, 0, 0];
  let b = 0;
  for (let t = phase; t < n - 1; t += period, b++) {
    const i = Math.round(t);
    let s = 0;
    for (let j = Math.max(1, i - 2); j <= Math.min(n - 1, i + 2); j++) s += Math.max(0, Math.log1p(1e3 * lowE[j]) - Math.log1p(1e3 * lowE[j - 1]));
    bar[b % 4] += s;
  }
  const down = bar.indexOf(Math.max(...bar));
  return { bpm, beat: period / 100, firstBeat: from + phase / 100, downbeatIndex: down, top: lags.slice(0, 6).map((l) => `${l.bpm}:${l.score.toFixed(4)}`), bar: bar.map((v) => +v.toFixed(1)) };
}

if (import.meta.main) {
  const [f, from, len] = process.argv.slice(2);
  console.log(JSON.stringify(tempo(f, Number(from ?? 0), Number(len ?? 90)), null, 1));
}
