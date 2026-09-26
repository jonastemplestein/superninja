// The editor's cut of the petal-scroll clip: one window of a take's master, with a soft head and a longer tail on the
// sound (the World Flower's music runs under the whole clip, so it fades in over 0.25 s and out over 0.7 s instead of the
// rig's 80 ms both ends), −16 LUFS, X-ready H.264/AAC, a poster, a contact sheet and captions (.srt: the World Flower
// draws no captions of its own).
//
//   bun assets-src/tweet/2026-09-26/petal-scroll/edit.ts <take> <start> <end> [posterAt] [audioNudgeMs]
//
// Writes assets-src/tweet/2026-09-26/petal-scroll.mp4, .jpg, .srt and petal-scroll/petal-scroll.sheet.jpg.
// `audioNudgeMs` moves the sound against the picture (positive: later), for a take whose sync in this window differs
// from the rig's whole-master correction.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { TimelineEvent } from "../../../../scripts/tweet-clips";

const HERE = import.meta.dir;
const OUT = join(HERE, "..", "petal-scroll.mp4");
const TRASH = join(HERE, "..", "..", "..", "..", ".trash", "tweet-petal-scroll");
const FPS = 30, LUFS = -16, FADE_IN = 0.25, FADE_OUT = 0.7;

const run = (cmd: string, args: string[]) => {
  const r = spawnSync(cmd, args, { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} failed\n${r.stderr?.toString().slice(-1500)}`);
  return r;
};
const ff = (args: string[]) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const retire = (f: string) => {
  if (!existsSync(f)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(f, join(TRASH, `${new Date().toISOString().replace(/[:.]/g, "-")}-${basename(f)}`));
};
const r3 = (x: number) => Math.round(x * 1000) / 1000;
function loud(args: string[]) {
  const s = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args, "-f", "null", "-"], { maxBuffer: 1 << 28 }).stderr.toString();
  const sum = s.slice(s.lastIndexOf("Summary:"));
  const n = (re: RegExp) => Number(sum.match(re)?.[1]);
  return { I: n(/I:\s+(-?[\d.]+) LUFS/), TP: n(/Peak:\s+(-?[\d.]+) dBFS/), LRA: n(/LRA:\s+(-?[\d.]+) LU/) };
}

const [take, s0, e0, posterArg, nudgeArg] = process.argv.slice(2);
const master = join(HERE, "raw", `${take}.master.mp4`);
const wav = master.replace(/\.mp4$/, ".wav");
const start = Math.round(Number(s0) * FPS) / FPS;
const len = r3(Math.round((Number(e0) - start) * FPS) / FPS);
const nudge = Number(nudgeArg ?? 0) / 1000;

// ---- the sound: the window of the float mix (shifted by the nudge), a true-peak-safe limiter, gain to −16 LUFS, fades
const aStart = start - nudge;
const win = `atrim=start=${Math.max(0, aStart)}:duration=${len},asetpts=PTS-STARTPTS`;
const pre = loud(["-i", wav, "-vn", "-af", `${win},ebur128=peak=true:framelog=quiet`]);
const chain = (g: number) =>
  `${win},aresample=192000,alimiter=limit=${r3(Math.min(1, 10 ** ((-2.2 - g) / 20)))}:attack=3:release=60:level=0:latency=1,aresample=48000,volume=${r3(g)}dB,` +
  `afade=t=in:d=${FADE_IN}:curve=qsin,afade=t=out:st=${r3(len - FADE_OUT)}:d=${FADE_OUT}:curve=qsin`;
const audio = join(HERE, ".work", "petal-scroll.audio.m4a");
mkdirSync(dirname(audio), { recursive: true });
const enc = (g: number) => {
  retire(audio);
  ff(["-i", wav, "-af", chain(g), "-c:a", "aac_at", "-aac_at_mode", "cbr", "-b:a", "128k", "-ar", "48000", "-ac", "2", audio]);
  return loud(["-i", audio, "-af", "ebur128=peak=true:framelog=quiet"]);
};
let g = LUFS - pre.I;
let m = enc(g);
if (Math.abs(LUFS - m.I) > 0.3 || m.TP > -1.5) {
  g += Math.min(LUFS - m.I, -1.5 - m.TP);
  m = enc(g);
}

// ---- the picture, and the two together
retire(OUT);
ff(["-ss", String(start), "-t", String(len), "-i", master, "-i", audio, "-map", "0:v", "-map", "1:a",
  "-vf", `fps=${FPS},format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv`,
  "-c:v", "libx264", "-profile:v", "high", "-level:v", "4.1", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-g", String(FPS * 2), "-bf", "2",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-c:a", "copy", "-shortest", "-movflags", "+faststart", OUT]);
retire(audio);
const poster = OUT.replace(/\.mp4$/, ".jpg");
retire(poster);
ff(["-ss", String(posterArg ?? r3(len * 0.7)), "-i", OUT, "-frames:v", "1", "-q:v", "2", poster]);

// ---- captions from the take's timeline: Sensei's lines, with a sound as /ae/ and a word as itself
const tl = JSON.parse(readFileSync(master.replace(/\.master\.mp4$/, ".timeline.json"), "utf8"));
const speech = (tl.events as TimelineEvent[]).filter((e) => e.kind === "speech" && e.t + (e.dur ?? 0.5) > start && e.t < start + len);
const text = (e: TimelineEvent) => e.text ?? (e.id.startsWith("sound:") ? `/${e.id.slice(6)}/` : e.id.startsWith("word:") ? e.id.slice(5) : e.id);
// lines that run on into each other (under 0.35 s apart) share a caption; a petal saying its own sound as it opens
// ("/ae/") keeps its own
const cues: { a: number; b: number; t: string }[] = [];
const soundOnly = (t: string) => /^\/\w+\/$/.test(t);
for (const e of speech) {
  const a = Math.max(0, e.t - start), b = Math.min(len, e.t + (e.dur ?? 0.5) - start);
  const last = cues.at(-1);
  if (last && a - last.b < 0.35 && !(soundOnly(last.t) && e.text) && (last.t + " " + text(e)).length < 70) (last.b = b), (last.t += " " + text(e));
  else cues.push({ a, b, t: text(e) });
}
// two lines for a long caption, broken after a sentence or "…" nearest the middle (else the space nearest it)
const wrap = (t: string) => {
  t = t.replace(/\s+/g, " ").trim();
  if (t.length <= 38) return t;
  const mid = t.length / 2;
  const at = (re: RegExp) => [...t.matchAll(re)].map((m) => m.index! + m[0].length - 1).filter((i) => i > 8 && i < t.length - 8);
  const pick = (xs: number[]) => xs.sort((x, y) => Math.abs(x - mid) - Math.abs(y - mid))[0];
  const i = pick([...at(/[.!?]\s/g), ...at(/\s(?=\.\.\.)/g)].filter((x) => Math.abs(x - mid) < t.length * 0.3)) ?? pick(at(/\s/g));
  return i == null ? t : `${t.slice(0, i).trim()}\n${t.slice(i).trim()}`;
};
const ts = (x: number) => {
  const ms = Math.round(x * 1000), h = Math.floor(ms / 3600000), mi = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
// (each caption stays up at least 1.2 s, and until the next one)
const srt = cues.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(Math.min(len, Math.max(c.b + 0.3, c.a + 1.2), cues[i + 1]?.a ?? len))}\n${wrap(c.t)}\n`).join("\n");
const srtFile = OUT.replace(/\.mp4$/, ".srt");
retire(srtFile);
writeFileSync(srtFile, srt);

// a contact sheet of the clip, a frame every 0.5 s picked by frame number (exact), labelled with its time
const sheet = join(HERE, "petal-scroll.sheet.jpg");
retire(sheet);
{
  const tw = 320, th = 180, frames = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", OUT, "-vf", `select='not(mod(n\\,${FPS / 2}))',scale=${tw}:${th},format=rgb24`, "-fps_mode", "passthrough", "-f", "rawvideo", "pipe:1"]).stdout;
  const py = `
import sys
from PIL import Image, ImageDraw, ImageFont
raw = sys.stdin.buffer.read(); tw, th, cols = ${tw}, ${th}, 6; n = len(raw) // (tw * th * 3); rows = (n + cols - 1) // cols; lh = 18
sheet = Image.new("RGB", (cols * tw, rows * (th + lh)), (24, 22, 30)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
except Exception: font = ImageFont.load_default()
for k in range(n):
    x, y = (k % cols) * tw, (k // cols) * (th + lh)
    sheet.paste(Image.frombytes("RGB", (tw, th), raw[k*tw*th*3:(k+1)*tw*th*3]), (x, y)); d.text((x + 4, y + th + 2), f"{k * 0.5:.1f}s", fill=(235, 235, 235), font=font)
sheet.save(sys.argv[1], quality=85)
`;
  const r = spawnSync("python3", ["-c", py, sheet], { input: frames, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(r.stderr.toString());
}
const p = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", OUT]).stdout.toString());
console.log(JSON.stringify({ out: OUT, poster, srt: srtFile, sheet, start, len, nudgeMs: nudge * 1000, loudness: m, gainDb: r3(g),
  video: p.streams.filter((s: any) => s.codec_type === "video").map((s: any) => `${s.codec_name} ${s.profile} ${s.pix_fmt} ${s.width}x${s.height} ${s.r_frame_rate} ${s.color_space}`),
  audio: p.streams.filter((s: any) => s.codec_type === "audio").map((s: any) => `${s.codec_name} ${s.profile} ${s.sample_rate} ${s.channels}ch ${s.bit_rate}`),
  duration: p.format.duration, sizeMB: r3(Number(p.format.size) / 1e6) }, null, 1));
console.log(srt);
process.exit(0);
