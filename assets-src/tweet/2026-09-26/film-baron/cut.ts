// Cut a film-baron take (raw/<take>.master.mp4 from drive.ts) into the tweet clip.
//
//   bun assets-src/tweet/2026-09-26/film-baron/cut.ts <take> [--out <file.mp4>] [--poster <sec into clip>] [--no-sync]
//                                                        [--open <brightness 0–1>]
//
// 1. Finds the film's cuts on the master: each shot starts on a dark frame (the <video> is empty while it swaps clips),
//    then fades in over ~0.4 s.
// 2. Measures lip-sync: which frame of the preview's own clip (public/a/v/intro_N.mp4, 24 fps) each master frame shows,
//    so when the clip's t = 0 was on screen, and where the line starts against the film's authored line delay
//    (public/a/v/intro_timing.json: the Seedance takes were lip-synced to the line starting there). The preview fetches
//    and decodes each line when its shot starts, so the voice comes 70–90 ms after the lips in a capture on this
//    machine; the clip slips the whole soundtrack earlier by the median of the three shots (the film has no taps or
//    sound effects to keep in step, and the music doesn't care), which puts every line back on its authored mark.
// 3. The window: from shot 3's fade-in once the picture is ~75% up (so the first frame isn't dark; Baron's "Words..."
//    follows ~0.17 s later) to the last frame before shot 6 (the end of "...all over the island!", held on shot 5's
//    last frame as the film does).
// 4. trim() from the rig (−16 LUFS, X spec) and checks.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PREVIEW, trim, type TimelineEvent } from "../../../../scripts/tweet-clips";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, "raw");
const FPS = 30, W = 64, H = 36;
const args = process.argv.slice(2);
const take = args[0] ?? "take1";
const flag = (k: string) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const out = resolve(flag("--out") ?? join(HERE, "cuts", `${take}.mp4`));
const noSync = args.includes("--no-sync");
const openAt = Number(flag("--open") ?? 0.75);

const run = (cmd: string, a: string[], input?: Buffer) => {
  const r = spawnSync(cmd, a, { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} ${a.slice(0, 10).join(" ")}: ${r.stderr?.toString().slice(-1500)}`);
  return r;
};
function gray(file: string, from?: number, to?: number): Buffer[] {
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, ...(from != null ? ["-ss", String(from), "-t", String(to! - from)] : []), "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-fps_mode", "passthrough", "-f", "rawvideo", "pipe:1"]);
  const n = W * H, o: Buffer[] = [];
  for (let i = 0; i + n <= r.stdout.length; i += n) o.push(r.stdout.subarray(i, i + n));
  return o;
}
const mean = (f: Buffer) => f.reduce((s, x) => s + x, 0) / f.length;
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const r3 = (x: number) => Math.round(x * 1000) / 1000;
/** House rule: never delete; a file about to be replaced goes to .trash/tweet-clips/ (as the rig does). */
const TRASH = resolve(HERE, "../../../../.trash/tweet-clips");
const retire = (f: string) => {
  if (!existsSync(f)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(f, join(TRASH, `${new Date().toISOString().replace(/[:.]/g, "-")}-${basename(f)}`));
};

// ---- the take
const master = join(RAW, `${take}.master.mp4`);
const tl = JSON.parse(readFileSync(join(RAW, `${take}.timeline.json`), "utf8"));
const events: TimelineEvent[] = tl.events;
const game = tl.game as { start: number; end: number };
const speech = (id: string) => events.find((e) => e.kind === "speech" && e.id === id);

// ---- 1. the cuts: a dark frame (luma < 40) right after a lit one
const all = gray(master);
const luma = all.map(mean);
const cuts: number[] = [];
for (let k = Math.ceil(game.start * FPS) + 1; k < Math.min(luma.length, game.end * FPS); k++) if (luma[k] < 40 && luma[k - 1] > 60) cuts.push(k);
// the shot cuts, in order, from the "shot N" marks the drive left (each cut is the first dark frame after its mark)
const shotCut = new Map<number, number>();
for (const e of events.filter((x) => x.kind === "mark" && /^shot \d+$/.test(x.id))) {
  const n = Number(e.id.split(" ")[1]);
  const k = cuts.find((c) => c / FPS >= e.t - 0.2 && c / FPS < e.t + 0.6);
  if (k != null) shotCut.set(n, k);
}
console.log("cuts (frame → s):", [...shotCut].map(([n, k]) => `shot ${n} @ ${r3(k / FPS)}`).join(", "));
for (const n of [3, 4, 5, 6]) if (!shotCut.has(n)) throw new Error(`no cut found for shot ${n}`);

// ---- 2. lip-sync against the film's own clips
const cache = join(HERE, ".src");
mkdirSync(cache, { recursive: true });
const timing: { shot: number; lineDelayMs: number }[] = await (await fetch(`${PREVIEW}/a/v/intro_timing.json`)).json();
async function srcClip(n: number) {
  const f = join(cache, `intro_${n}.mp4`);
  if (!existsSync(f)) writeFileSync(f, Buffer.from(await (await fetch(`${PREVIEW}/a/v/intro_${n}.mp4`)).arrayBuffer()));
  return f;
}
const norm = (f: Buffer) => {
  const mu = mean(f), o = new Float64Array(f.length);
  let v = 0;
  for (let i = 0; i < f.length; i++) (o[i] = f[i] - mu), (v += o[i] * o[i]);
  const sd = Math.sqrt(v) || 1;
  for (let i = 0; i < f.length; i++) o[i] /= sd;
  return o;
};
/** When (master seconds) clip N's t = 0 was on screen: match master frames in a moving stretch of the shot to the clip's
 *  frames. A frame first shows in the first 1/30 s slot at or after it is drawn (minus the rig's 8 ms look-ahead), so
 *  t_slot − k/24 lies in [t0 − 8 ms, t0 − 8 ms + 33 ms): its minimum + 8 ms is t0 (to within a few ms). */
async function clipStart(n: number, from: number, to: number) {
  const src = gray(await srcClip(n)).map(norm);
  const cut = shotCut.get(n)! / FPS;
  const m = all.slice(Math.round((cut + from) * FPS), Math.round((cut + to) * FPS));
  const k0 = Math.round((cut + from) * FPS);
  const offs: number[] = [];
  let worst = 1;
  m.forEach((f, i) => {
    const x = norm(f);
    let best = -2, bi = -1;
    src.forEach((y, j) => {
      let c = 0;
      for (let p = 0; p < x.length; p++) c += x[p] * y[p];
      if (c > best) (best = c), (bi = j);
    });
    worst = Math.min(worst, best);
    offs.push((k0 + i) / FPS - bi / 24);
  });
  const lo = Math.min(...offs), hi = Math.max(...offs);
  return { t0: lo + 0.008, spread: hi - lo, worst };
}
// (stretches of each clip with plenty of movement, video seconds after the cut)
const SPANS: Record<number, [number, number]> = { 3: [2.7, 3.7], 4: [3.8, 5.2], 5: [0.6, 1.6] };
const sync: Record<string, number> = {};
for (const n of [3, 4, 5]) {
  const s = await clipStart(n, ...SPANS[n]);
  const line = speech(`film_${n}`)!;
  const delay = (timing.find((t) => t.shot === n)?.lineDelayMs ?? 0) / 1000;
  const lag = line.t - (s.t0 + delay);
  sync[`film_${n}`] = r3(lag);
  console.log(`shot ${n}: clip t=0 on screen at ${r3(s.t0)} s (frame match spread ${Math.round(s.spread * 1000)} ms, worst r ${s.worst.toFixed(4)}); line at ${line.t} s = clip ${r3(line.t - s.t0)} s, authored ${delay} s → voice ${lag >= 0 ? "late" : "early"} by ${Math.round(Math.abs(lag) * 1000)} ms`);
}
const delta = noSync ? 0 : r3(median(Object.values(sync)));
console.log(noSync ? "no sync correction" : `slipping the soundtrack ${Math.round(delta * 1000)} ms earlier; left over per line: ${Object.entries(sync).map(([k, v]) => `${k} ${Math.round((v - delta) * 1000)} ms`).join(", ")}`);

// ---- a synced master beside the take: same picture, the soundtrack moved by delta; the timeline's sounds too
let src = master;
if (delta !== 0) {
  src = join(RAW, `${take}-synced.master.mp4`);
  const wav = join(RAW, `${take}.master.wav`), wav2 = join(RAW, `${take}-synced.master.wav`);
  const dur = tl.duration as number;
  for (const f of [src, wav2, join(RAW, `${take}-synced.timeline.json`)]) retire(f);
  run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-af", `atrim=start=${delta},asetpts=PTS-STARTPTS,apad=whole_dur=${dur}`, "-t", String(dur), "-c:a", "pcm_f32le", "-ar", "48000", wav2]);
  run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", master, "-i", wav2, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", src]);
  const moved = new Set(["speech", "sfx", "music", "sting", "music-stop", "slate"]);
  writeFileSync(join(RAW, `${take}-synced.timeline.json`), JSON.stringify({ ...tl, master: `${take}-synced.master.mp4`, audio: `${take}-synced.master.wav`, audioSlipS: -delta, events: events.map((e) => (moved.has(e.kind) ? { ...e, t: r3(e.t - delta) } : e)) }, null, 1));
}

// ---- 3. the window
const c3 = shotCut.get(3)!, c6 = shotCut.get(6)!;
const steady = luma[c3 + 18]; // 0.6 s into shot 3 the fade-in is over
const dark = luma[c3];
let k = c3;
while (k < c3 + 18 && luma[k] < dark + openAt * (steady - dark)) k++;
const start = k / FPS, end = c6 / FPS; // (end: shot 6's first, dark, frame is left out)
const f3 = speech("film_3")!, f5 = speech("film_5")!;
// where the voice really stops in film_5 (its file has ~85 ms of silence at the end)
const tail5 = 0.085;
const voice3 = f3.t - delta, voice5end = f5.t + (f5.dur ?? 0) - tail5 - delta;
console.log(`window ${r3(start)}–${r3(end)} s (${r3(end - start)} s): first word ${r3(voice3 - start)} s in; last word ends ${r3(end - voice5end)} s before the end`);

// ---- 4. trim
const posterArg = flag("--poster");
const t = trim(src, start, end, out, posterArg ? { posterAt: Number(posterArg) } : {});

// ---- captions for X (the film itself shows none): one cue per line, Baron's laugh on its own after his pause
// (film_4's file: "...is MINE!" ends at 4.48 s, "Mwa-ha-ha-ha!" starts at 5.82 s)
const clipLen = t.duration;
const cues: [number, number, string][] = [];
for (const e of events.filter((x) => x.kind === "speech" && x.text)) {
  const a = e.t - delta - start, b = a + (e.dur ?? 2);
  if (b <= 0.05 || a >= clipLen - 0.05) continue;
  if (e.id === "film_4") {
    cues.push([a, a + 4.55, "Baron: I am Baron Muddle! Every sound on this island is MINE!"]);
    cues.push([a + 5.8, b, "Baron: Mwa-ha-ha-ha!"]);
  } else cues.push([a, b, e.text!]);
}
const ts = (x: number) => {
  const ms = Math.round(Math.max(0, Math.min(clipLen, x)) * 1000);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = out.replace(/\.mp4$/, ".srt");
retire(srt);
writeFileSync(srt, cues.map(([a, b, s], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${s}\n`).join("\n"));
console.log(JSON.stringify({ ...t, srt, sync, slipMs: Math.round(delta * 1000), window: [r3(start), r3(end)] }, null, 1));
process.exit(0);
