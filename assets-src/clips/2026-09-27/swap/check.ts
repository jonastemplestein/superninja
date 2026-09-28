// Check a clip (a final, or a window of a master) for the 27 Sep spec and for stutter, and make its contact sheet.
//
//   bun assets-src/clips/2026-09-27/swap/check.ts <clip.mp4> [sheetEvery=0.5]
//   bun assets-src/clips/2026-09-27/swap/check.ts <master.mp4> --from=S --to=E          (stutter in a window only)
//
// Stutter: every frame against the one before (a 160×90 grey copy): a mean difference under 0.03 grey levels is the
// same picture again (a repeated frame). The game always has something moving (the ninja breathes, the lanterns sway,
// and the filmed page carries the anti-sampler specks), so a run of 3+ repeated frames (100 ms) in the middle of a clip
// is a freeze the eye can catch; the longest such runs are listed. (Checked on 27 Sep: a clean take's window has 0–1
// repeated frames; the stuttering end of w1-8-kai-t1, 47–62 s, has 151 of 450 in runs of 6–9.) Spec: codec, profile, pixel format, size, frame rate,
// audio, faststart, loudness (EBU R128), and the contact sheet into ./review/.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { contactSheet } from "../../../../scripts/tweet-clips";

const args = process.argv.slice(2);
const f = resolve(args[0]);
const from = Number(args.find((a) => a.startsWith("--from="))?.slice(7) ?? NaN);
const to = Number(args.find((a) => a.startsWith("--to="))?.slice(5) ?? NaN);
const every = Number(args.find((a) => !a.startsWith("--") && a !== args[0]) ?? 0.5);

export function stutter(file: string, start?: number, end?: number, th = 0.03) {
  const W = 160, H = 90;
  const win = Number.isFinite(start) && Number.isFinite(end) ? ["-ss", String(start), "-t", String(end! - start!)] : [];
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, ...win, "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
  const d = r.stdout, px = W * H, n = Math.floor(d.length / px);
  const diffs: number[] = [];
  for (let k = 1; k < n; k++) {
    let s = 0;
    for (let i = 0; i < px; i++) s += Math.abs(d[k * px + i] - d[(k - 1) * px + i]);
    diffs.push(s / px);
  }
  const runs: { at: number; frames: number }[] = [];
  let cur = 0;
  for (let k = 0; k <= diffs.length; k++) {
    if (k < diffs.length && diffs[k] < th) cur++;
    else {
      if (cur >= 2) runs.push({ at: +((k - cur) / 30 + (start ?? 0)).toFixed(2), frames: cur + 1 });
      cur = 0;
    }
  }
  const sorted = [...diffs].sort((a, b) => a - b);
  return { frames: n, stillFrames: diffs.filter((x) => x < th).length, p50: +sorted[Math.floor(sorted.length / 2)].toFixed(3), freezes: runs.sort((a, b) => b.frames - a.frames).slice(0, 8) };
}

if (import.meta.main) {
  if (Number.isFinite(from)) {
    console.log(JSON.stringify(stutter(f, from, to)));
    process.exit(0);
  }
  const p = JSON.parse(spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", f]).stdout.toString());
  const v = p.streams.find((s: any) => s.codec_type === "video"), a = p.streams.find((s: any) => s.codec_type === "audio");
  const loud = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", f, "-vn", "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"]).stderr.toString();
  const sum = loud.slice(loud.lastIndexOf("Summary:"));
  const head = readFileSync(f).subarray(0, 200_000).toString("latin1");
  const moov = head.indexOf("moov"), mdat = head.indexOf("mdat");
  mkdirSync(join(import.meta.dir, "review"), { recursive: true });
  const sheet = contactSheet(f, every, join(import.meta.dir, "review", basename(f).replace(/\.mp4$/, ".sheet.jpg")));
  console.log(JSON.stringify({
    file: f,
    video: `${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.width}x${v.height} ${v.r_frame_rate} ${v.color_space ?? ""}`,
    audio: `${a.codec_name} ${a.profile} ${a.sample_rate} Hz ${a.channels}ch ${Math.round(Number(a.bit_rate) / 1000)} kb/s`,
    duration: Number(p.format.duration), faststart: moov >= 0 && (mdat < 0 || moov < mdat),
    loudness: { I: sum.match(/I:\s+(-?[\d.]+)/)?.[1], LRA: sum.match(/LRA:\s+(-?[\d.]+)/)?.[1], TP: sum.match(/Peak:\s+(-?[\d.]+)/)?.[1] },
    stutter: stutter(f), sheet,
  }, null, 1));
  process.exit(0);
}
