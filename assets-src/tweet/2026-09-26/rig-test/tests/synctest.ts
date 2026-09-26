// Rig test 2: A/V sync on the game's own events. Each bot tap plays the game's tap sfx and (same event) shows the touch
// ripple over the tile; on the finished master, the sfx onset should land on the first frame that shows the ripple.
// Music off for this one, so the tap sound's onset is clean; taps with speech around them are skipped.
import { record, onsetAt, tweetSave, type TimelineEvent } from "../../../../../scripts/tweet-clips.ts";
import { spawnSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";

const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/tweet/2026-09-26/rig-test/sync";
const reuse = process.argv[2]?.endsWith(".json") ? process.argv[2] : undefined; // a timeline.json to re-measure
const level = process.argv[2] && !reuse ? process.argv[2] : "w2-2";
let master: string, events: TimelineEvent[], scale: number, sync: any, frames: any;
if (reuse) {
  const tl = JSON.parse(readFileSync(reuse, "utf8"));
  master = reuse.replace(".timeline.json", ".master.mp4");
  events = tl.events;
  scale = tl.width / 1280;
  sync = tl.sync;
  frames = tl.frames;
} else {
  const r = await record({
    name: `sync-taps-${level}`, url: `/play/?level=${level}`, seconds: 45, outDir: OUT, sheetEvery: 2,
    save: tweetSave({ settings: { music: 0 } }),
    drive: async (_page, rig) => rig.bot({ every: 1300, mistakes: 0.25 }),
  });
  master = r.master;
  events = r.events;
  scale = r.width / 1280;
  sync = r.sync;
  frames = r.frames;
}
const FPS = 30;
/** first frame (seconds) in [from, from+len) where region differs clearly from the first frame of the window */
function changeAt(file: string, from: number, len: number, rect: number[]): number | null {
  const start = Math.floor(from * FPS) / FPS;
  const [x, y, w, h] = rect.map((v) => Math.round(v * scale));
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(start), "-i", file, "-t", String(len), "-vf", `crop=${w}:${h}:${x}:${y},scale=16:16,format=gray`, "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 26 });
  const px = 256, n = Math.floor(r.stdout.length / px);
  const f = (k: number) => r.stdout.subarray(k * px, (k + 1) * px);
  const ref = f(0);
  for (let k = 1; k < n; k++) {
    let d = 0;
    const cur = f(k);
    for (let i = 0; i < px; i++) d += Math.abs(cur[i] - ref[i]);
    if (d / px > 10) return start + k / FPS;
  }
  return null;
}
const rows: any[] = [];
for (const tap of events.filter((e) => e.kind === "tap" && e.text?.startsWith("rect"))) {
  const sfx = events.find((e) => e.kind === "sfx" && Math.abs(e.t - tap.t) < 0.012);
  if (!sfx) continue;
  // nothing sounding just before the tap; the audio window ends just before the next sound after it (the game often
  // says the tile's sound 35–60 ms after the tap sfx)
  const busy = events.some((e) => (e.kind === "speech" || e.kind === "sfx" || e.kind === "sting") && e !== sfx && e.t < tap.t - 0.002 && e.t + (e.dur ?? 0.3) > tap.t - 0.12);
  if (busy) continue;
  const next = events.filter((e) => (e.kind === "speech" || e.kind === "sfx") && e !== sfx && e.t > tap.t + 0.004).sort((x, y) => x.t - y.t)[0];
  const until = Math.min(tap.t + 0.08, next ? next.t - 0.004 : Infinity);
  const rect = tap.text!.slice(5).split(",").map(Number);
  const v = changeAt(master, tap.t - 0.2, 0.5, rect);
  const a = onsetAt(master, tap.t - 0.1, until - (tap.t - 0.1));
  if (v == null || a == null) continue;
  if (v < tap.t - 0.02) continue; // the tile was already changing before the tap (an animation): not this tap's change
  rows.push({ t: tap.t, tile: tap.id, sfx: sfx.id, visual: +v.toFixed(3), audio: +a.toFixed(3), offsetMs: Math.round((a - v) * 1000) });
}
const offs = rows.map((r) => r.offsetMs).sort((a, b) => a - b);
const summary = {
  master, taps: rows.length, sync, frames,
  offsetMs: { min: offs[0], median: offs[Math.floor(offs.length / 2)], max: offs.at(-1), mean: Math.round(offs.reduce((a, b) => a + b, 0) / Math.max(1, offs.length)), within80: offs.filter((x) => Math.abs(x) <= 80).length },
  note: "offset = tap sfx onset minus the first frame showing the ripple (positive: sound after picture). Frames are 33 ms apart, so ±17 ms is quantisation.",
  rows,
};
writeFileSync(master.replace(".master.mp4", ".sync-report.json"), JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ ...summary, rows: rows.length }, null, 1));
process.exit(0);
