// (Copied from ../soundhunt/cut.ts, 27 Sep.) The cut for the boss clips: the rig's trim() (scripts/tweet-clips.ts), with separate fades in and out. The rig's
// 80 ms fade-in would soften the first consonant of a line that starts right on the first frame ("Let's do it
// together!" starts ~55 ms in, and an earlier frame would still show the old pair); and a clip that ends on the music
// after Sensei's last sound ends more gently with a longer fade-out. Everything else is the rig's: H.264 High yuv420p
// CRF 18 at 30 fps, AAC-LC 128 kbps 48 kHz, +faststart, −16 LUFS (true peak ≤ −1.5 dBTP), a JPG poster.
//
//   bun assets-src/clips/2026-09-27/boss/cut.ts <master.mp4> <start> <end> <out.mp4> [posterAt] [fadeInMs=25] [fadeOutMs=250]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import type { TimelineEvent } from "../../../../scripts/tweet-clips";

const FPS = 30;
const TRASH = resolve(dirname(new URL(import.meta.url).pathname), "../../../../.trash/clips-2026-09-27-boss");
const run = (cmd: string, args: string[]) => {
  const r = spawnSync(cmd, args, { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 12).join(" ")}…\n${r.stderr?.toString().slice(-2000)}`);
  return r;
};
const ff = (args: string[]) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const round = (x: number, d = 3) => Math.round(x * 10 ** d) / 10 ** d;
function retire(file: string) {
  if (!existsSync(file)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(file, join(TRASH, `${new Date().toISOString().replace(/[:.]/g, "-")}-${basename(file)}`));
}
const aac = run("ffmpeg", ["-hide_banner", "-encoders"]).stdout.toString().includes("aac_at") ? "aac_at" : "aac";
const TAG_709_VF = "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv";
const TAG_709 = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];
function measure(input: string[], pre?: string): { I: number; TP: number; LRA: number } {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...input, "-vn", "-af", `${pre ? pre + "," : ""}ebur128=peak=true:framelog=quiet`, "-f", "null", "-"], { maxBuffer: 1 << 28 });
  const s = r.stderr.toString();
  const sum = s.slice(s.lastIndexOf("Summary:"));
  const num = (re: RegExp) => Number(sum.match(re)?.[1]);
  return { I: num(/I:\s+(-?[\d.]+|-inf) LUFS/), TP: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/) };
}

export function cut(master: string, start: number, end: number, out: string, o: { posterAt?: number; fadeInMs?: number; fadeOutMs?: number; lufs?: number; audioLateMs?: number } = {}) {
  start = Math.round(start * FPS) / FPS;
  const len = round(Math.round((end - start) * FPS) / FPS, 4);
  const wav = master.replace(/\.mp4$/, ".wav");
  const src = existsSync(wav) ? wav : master;
  const target = o.lufs ?? -16, fin = (o.fadeInMs ?? 25) / 1000, fout = (o.fadeOutMs ?? 250) / 1000;
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const input = ["-i", src];
  // audioLateMs: how late the master's sound runs behind its picture in this window (measured at the claps): the sound
  // is taken that much later, so it lines up
  const win = `atrim=start=${round(start + (o.audioLateMs ?? 0) / 1000, 4)}:duration=${len},asetpts=PTS-STARTPTS`;
  const m1 = measure(input, win);
  const chain = (g: number) => `${win},aresample=192000,alimiter=limit=${round(Math.min(1, Math.max(0.0625, 10 ** ((-2.2 - g) / 20))), 5)}:attack=3:release=60:level=0:latency=1,aresample=48000,volume=${round(g, 3)}dB,afade=t=in:d=${fin},afade=t=out:st=${round(len - fout, 4)}:d=${fout}`;
  const audioTmp = join(dirname(resolve(out)), `.${basename(out, ".mp4")}.audio.m4a`);
  const encode = (g: number) => {
    retire(audioTmp);
    ff([...input, "-af", chain(g), "-c:a", aac, "-b:a", "128k", "-ar", "48000", "-ac", "2", ...(aac === "aac_at" ? ["-aac_at_mode", "cbr"] : []), audioTmp]);
    return measure(["-i", audioTmp]);
  };
  let g = Number.isFinite(m1.I) ? target - m1.I : 0, m2 = encode(g);
  if (Math.abs(target - m2.I) > 0.5 || m2.TP > -1.5) {
    g += Math.min(target - m2.I, -1.5 - m2.TP);
    m2 = encode(g);
  }
  retire(out);
  ff(["-ss", String(start), "-t", String(len), "-i", master, "-i", audioTmp, "-map", "0:v", "-map", "1:a",
    "-vf", `fps=${FPS},format=yuv420p,${TAG_709_VF}`, "-c:v", "libx264", "-profile:v", "high", "-level:v", "4.1", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
    "-g", String(FPS * 2), "-bf", "2", ...TAG_709, "-c:a", "copy", "-shortest", "-movflags", "+faststart", out]);
  retire(audioTmp);
  const poster = out.replace(/\.mp4$/, ".jpg");
  retire(poster);
  ff(["-ss", String(o.posterAt ?? round(len / 3, 3)), "-i", out, "-frames:v", "1", "-q:v", "2", poster]);
  // from the master's timeline: a line cut off at either end, a freeze or a clapper inside the window
  const warnings: string[] = [];
  const tl = master.replace(/\.master\.mp4$/, ".timeline.json");
  if (tl !== master && existsSync(tl)) {
    const e2 = start + len;
    for (const e of JSON.parse(readFileSync(tl, "utf8")).events as TimelineEvent[]) {
      const e1 = e.t + (e.dur ?? 0);
      if (e.kind === "speech" && e.t < start - 0.02 && e1 > start + 0.02) warnings.push(`starts in the middle of ${e.id}`);
      if (e.kind === "speech" && e.t < e2 - 0.02 && e1 > e2 + 0.02) warnings.push(`ends in the middle of ${e.id}`);
      if (e.kind === "speech" && e1 > e2 - fout && e.t < e2) warnings.push(`${e.id} is under the fade-out`);
      if ((e.kind === "hitch" || e.kind === "slate") && e.t >= start && e.t < e2) warnings.push(`${e.kind === "hitch" ? `a ${e.id} freeze` : "the clapper"} at ${e.t} s`);
    }
  }
  const p = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", out]).stdout.toString());
  const v = p.streams.find((s: any) => s.codec_type === "video"), au = p.streams.find((s: any) => s.codec_type === "audio");
  const spec = {
    video: `${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.width}x${v.height} ${v.r_frame_rate}`,
    audio: `${au.codec_name} ${au.profile} ${au.sample_rate} Hz ${au.channels}ch ${Math.round(Number(au.bit_rate) / 1000)} kb/s`,
    faststart: (() => {
      const b = readFileSync(out).subarray(0, 64 * 1024).toString("latin1");
      return b.indexOf("moov") >= 0 && (b.indexOf("mdat") < 0 || b.indexOf("moov") < b.indexOf("mdat"));
    })(),
    sizeMB: round(Number(p.format.size) / 1e6, 2),
  };
  return { mp4: out, poster, duration: round(Number(p.format.duration)), loudness: m2, spec, warnings };
}

if (import.meta.main) {
  const a = process.argv.slice(2);
  const r = cut(resolve(a[0]), Number(a[1]), Number(a[2]), resolve(a[3]), { posterAt: a[4] ? Number(a[4]) : undefined, fadeInMs: a[5] ? Number(a[5]) : undefined, fadeOutMs: a[6] ? Number(a[6]) : undefined });
  console.log(JSON.stringify(r, null, 1));
  process.exit(0);
}
