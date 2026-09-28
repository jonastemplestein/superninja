// Check a final clip against the 27 Sep spec and make its contact sheet (every 0.5 s, into ./sheets/):
//   bun assets-src/clips/2026-09-27/picread/check.ts <clip.mp4>
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { contactSheet } from "../../../../scripts/tweet-clips";

const f = process.argv[2];
const p = JSON.parse(spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", f]).stdout.toString());
const v = p.streams.find((s: any) => s.codec_type === "video"), a = p.streams.find((s: any) => s.codec_type === "audio");
const loud = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", f, "-vn", "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"]).stderr.toString();
const sum = loud.slice(loud.lastIndexOf("Summary:"));
// faststart: the moov atom comes before mdat
const head = spawnSync("head", ["-c", "200000", f]).stdout;
const moov = head.indexOf("moov"), mdat = head.indexOf("mdat");
// duplicated frames: how many frames are identical to the one before (a still screen repeats legitimately; a freeze shows
// as a run of them in the middle of motion)
const md = spawnSync("ffmpeg", ["-hide_banner", "-i", f, "-vf", "mpdecimate=hi=64*4:lo=64*2:frac=0.1,showinfo", "-f", "null", "-"]).stderr.toString();
const kept = (md.match(/showinfo.*n:\s*\d+/g) ?? []).length;
console.log(JSON.stringify({
  file: f,
  video: `${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.width}x${v.height} ${v.r_frame_rate} ${v.color_space ?? ""}`,
  frames: Number(v.nb_frames), distinctFrames: kept,
  audio: `${a.codec_name} ${a.profile} ${a.sample_rate} Hz ${a.channels}ch ${Math.round(Number(a.bit_rate) / 1000)} kb/s`,
  duration: Number(p.format.duration), faststart: moov >= 0 && (mdat < 0 || moov < mdat),
  loudness: { I: sum.match(/I:\s+(-?[\d.]+)/)?.[1], LRA: sum.match(/LRA:\s+(-?[\d.]+)/)?.[1], TP: sum.match(/Peak:\s+(-?[\d.]+)/)?.[1] },
  sheet: (mkdirSync(join(import.meta.dir, "sheets"), { recursive: true }), contactSheet(f, 0.5, join(import.meta.dir, "sheets", basename(f).replace(/\.mp4$/, ".sheet.jpg")))),
}, null, 1));
process.exit(0);
