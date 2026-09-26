// Rig test 3: trim a window of a master into an X-ready clip; check the spec, loudness and sync on the finished file.
import { trim, contactSheet, toneAt, flashAt } from "../../../../../scripts/tweet-clips.ts";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const [tlPath, a, b, out] = process.argv.slice(2);
const tl = JSON.parse(readFileSync(tlPath, "utf8"));
const master = tlPath.replace(".timeline.json", ".master.mp4");
const start = Number(a), end = Number(b);
const r = trim(master, start, end, out);
const sheet = contactSheet(r.mp4, 1);
// the waveform of the finished clip, to look at the mix (speech peaks over the music bed)
spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", r.mp4, "-filter_complex", "showwavespic=s=1920x360:split_channels=0:colors=0x66ccff", "-frames:v", "1", out.replace(/\.mp4$/, ".wave.png")]);
const full = JSON.parse(spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", r.mp4]).stdout.toString());
const v = full.streams.find((s: any) => s.codec_type === "video"), au = full.streams.find((s: any) => s.codec_type === "audio");
const report = {
  ...r, sheet,
  probe: { v: { codec: v.codec_name, profile: v.profile, level: v.level, pix: v.pix_fmt, size: `${v.width}x${v.height}`, fps: v.r_frame_rate, avg: v.avg_frame_rate, bitrate: v.bit_rate, color: `${v.color_space}/${v.color_primaries}/${v.color_transfer}/${v.color_range}`, dar: v.display_aspect_ratio }, a: { codec: au.codec_name, profile: au.profile, rate: au.sample_rate, ch: au.channels, bitrate: au.bit_rate }, faststart: null as any },
};
// +faststart: the moov atom comes before mdat
const head = readFileSync(r.mp4).subarray(0, 4096).toString("latin1");
report.probe.faststart = head.indexOf("moov") >= 0 && (head.indexOf("mdat") < 0 || head.indexOf("moov") < head.indexOf("mdat"));
writeFileSync(out.replace(/\.mp4$/, ".report.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
