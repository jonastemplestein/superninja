// The cut of a dojo clip from a take recorded by ./drive.ts, and its checks.
//
//   bun assets-src/clips/2026-09-27/dojo/cut.ts <n> <take> <start> <end> <posterAt> [headFadeMs=0] [tailFadeMs=450] [edgeFadeMs=20]
//
// Cuts takes/<take>.master.mp4 [start, end] (master seconds) to ../dojo-<n>.mp4 + ../dojo-<n>.jpg (n "alt-…": review/) (posterAt: master
// seconds) with the rig's trim() (H.264 High yuv420p 30 fps at the take's size, AAC-LC 128k 48 kHz, faststart,
// −16 LUFS, true peak ≤ −1.5 dBTP). As in the firstsound and fish-dog cuts, the dojo music plays at both cuts, so it
// gets a gentle fade in over `headFadeMs` and out over the last `tailFadeMs`, written into an edit master beside the
// take (a hard link of the picture and the take's WAV with the fades) so trim()'s loudness pass hears the finished
// sound; trim()'s own fade at the very edges is `edgeFadeMs` (20 ms, so a word starting right at the cut keeps its
// first consonant). Cut points must sit where nobody is speaking: the report lists any line the window cuts through.
//
// Then the checks: the file's spec, a contact sheet every 0.5 s (review/dojo-<n>.sheet.jpg), the take's freezes in the
// window (the rig's hitches: with the anti-sampler every one is real), runs of identical frames in the finished clip
// (the game always animates: any repeated frame is listed; 3+ in a row is a visible stutter), and every line said inside the window.
import { copyFileSync, existsSync, linkSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { trim, contactSheet, type TimelineEvent } from "../../../../scripts/tweet-clips";

const [n, take, a, b, p, hf, tf, ef] = process.argv.slice(2);
if (!n || !take || !a || !b || !p) {
  console.log("usage: bun assets-src/clips/2026-09-27/dojo/cut.ts <n> <take> <start> <end> <posterAt> [headFadeMs=0] [tailFadeMs=450] [edgeFadeMs=20]");
  process.exit(1);
}
const DIR = resolve(import.meta.dir);
const TAKES = join(DIR, "takes");
const TRASH = resolve(DIR, "../../../../.trash/clips-2026-09-27-dojo");
const start = Math.round(Number(a) * 30) / 30, end = Number(b), posterAt = Number(p);
const head = Number(hf ?? 0) / 1000, tail = Number(tf ?? 450) / 1000, edge = Number(ef ?? 20);
const src = join(TAKES, take);
const edit = join(TAKES, ".edit");
mkdirSync(edit, { recursive: true });
const dst = join(edit, `${take}-cut`);
/** never delete: move an old file out of the way */
const retire = (f: string) => {
  if (!existsSync(f)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(f, join(TRASH, `${Date.now()}-${f.split("/").pop()}`));
};
for (const ext of [".master.mp4", ".master.wav", ".timeline.json"]) retire(dst + ext);
linkSync(`${src}.master.mp4`, `${dst}.master.mp4`);
copyFileSync(`${src}.timeline.json`, `${dst}.timeline.json`);
const fades = [
  head > 0 ? `afade=t=in:st=${start.toFixed(4)}:d=${head.toFixed(4)}:curve=tri` : "",
  tail > 0 ? `afade=t=out:st=${(end - tail).toFixed(4)}:d=${tail.toFixed(4)}:curve=tri` : "",
].filter(Boolean).join(",") || "anull";
const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", `${src}.master.wav`, "-af", fades, "-c:a", "pcm_f32le", `${dst}.master.wav`]);
if (r.status !== 0) throw new Error(r.stderr.toString());
// (an "alt-…" n is a candidate cut for comparing takes: it goes to review/ instead of beside the finals)
const out = n.startsWith("alt-") ? join(DIR, "review", `${n}.mp4`) : resolve(DIR, `../dojo-${n}.mp4`);
const res = trim(`${dst}.master.mp4`, start, end, out, { posterAt: posterAt - start, fadeMs: edge });
mkdirSync(join(DIR, "review"), { recursive: true });
const sheet = contactSheet(out, 0.5, join(DIR, "review", `${n.startsWith("alt-") ? n : `dojo-${n}`}.sheet.jpg`));

// ---- the checks
const tl = JSON.parse(readFileSync(`${src}.timeline.json`, "utf8"));
const ev: TimelineEvent[] = tl.events;
const inside = ev.filter((e) => e.t >= start - 0.05 && e.t < end && ["speech", "mark", "hitch", "sting"].includes(e.kind));
const cutThrough = ev.filter((e) => e.kind === "speech" && ((e.t < start && e.t + (e.dur ?? 0) > start) || (e.t < end && e.t + (e.dur ?? 0) > end)));
const freezes = ev.filter((e) => e.kind === "hitch" && e.t >= start - 0.1 && e.t < end);
// identical frames in the finished clip (a 640×360 grey copy of each; a frame is a repeat when fewer than 20 of its
// pixels changed by more than 6 levels: the ninja's idle breathing alone changes thousands)
const W = 640, H = 360;
const raw = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", out, "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 }).stdout;
const frames = Math.floor(raw.length / (W * H));
const runs: string[] = [];
let run = 0, still = 0;
for (let k = 1; k <= frames; k++) {
  let c = 0;
  if (k < frames) for (let i = 0; i < W * H && c < 20; i++) if (Math.abs(raw[(k - 1) * W * H + i] - raw[k * W * H + i]) > 6) c++;
  const same = k < frames && c < 20;
  if (same) (run++, still++);
  else {
    if (run >= 1) runs.push(`${run + 1} identical frames from ${((k - run - 1) / 30).toFixed(2)} s`);
    run = 0;
  }
}
const pr = JSON.parse(spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", out]).stdout.toString());
const v = pr.streams.find((s: any) => s.codec_type === "video"), au = pr.streams.find((s: any) => s.codec_type === "audio");
const headBytes = spawnSync("head", ["-c", "100000", out]).stdout;
const faststart = headBytes.indexOf("moov") >= 0 && (headBytes.indexOf("mdat") < 0 || headBytes.indexOf("moov") < headBytes.indexOf("mdat"));
console.log(JSON.stringify({
  mp4: res.mp4, poster: res.poster, sheet, duration: res.duration, loudness: res.loudness, warnings: res.warnings,
  spec: `${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.width}x${v.height} ${v.r_frame_rate} ${v.color_space} | ${au.codec_name} ${au.profile} ${au.sample_rate} Hz ${au.channels}ch ${Math.round(Number(au.bit_rate) / 1000)}k | faststart ${faststart} | ${res.spec.sizeMB} MB`,
  takeFrames: tl.frames, takeSync: tl.sync, freezesInWindow: freezes.map((e) => `${(e.t - start).toFixed(2)} ${e.id}`),
  stillFrames: still, stutterRuns: runs, cutThroughSpeech: cutThrough.map((e) => `${e.id} ${e.t}–${(e.t + (e.dur ?? 0)).toFixed(3)}`),
}, null, 1));
for (const e of inside) console.log(`${(e.t - start).toFixed(2)} ${e.kind} ${e.id}${e.text ? ` "${e.text}"` : ""}${e.dur ? ` (${e.dur.toFixed(2)})` : ""}`);
process.exit(0);
