// The cut of a "picread" clip, from a take recorded by ./drive.ts.
//
//   bun assets-src/clips/2026-09-27/picread/cut.ts <n> <take> <start> <end> <posterAt> [tailFadeMs] [headFadeMs] [soundEarlierMs]
//
// Cuts raw/<take>.master.mp4 [start, end] (master seconds) to ../picread-<n>.mp4 + ../picread-<n>.jpg with the rig's
// trim() (−16 LUFS; H.264 High yuv420p 1920×1080 30 fps, AAC 128k 48 kHz, faststart). The dojo music is still playing
// at both cuts, so (as in the tweet kit's fish-dog/cut.ts) the take's WAV gets a gentle fade written in over the last
// `tailFadeMs` (default 700) and the first `headFadeMs` (default 250) before trim() (whose own fades are 80 ms): an edit
// master beside the take, the same picture (a hard link) and that faded WAV, so the loudness pass sees the finished
// sound. Pick windows with no speech inside either fade. `posterAt` is in master seconds. `soundEarlierMs` moves the
// whole soundtrack earlier, for a take whose in-picture check (./synccheck.py: the tap ripples against the taps' own
// times) shows the sound late.
import { existsSync, linkSync, mkdirSync, copyFileSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { trim } from "../../../../scripts/tweet-clips";

const [n, take, a, b, p, tf, hf, se] = process.argv.slice(2);
if (!n || !take || !a || !b || !p) {
  console.log("usage: bun assets-src/clips/2026-09-27/picread/cut.ts <n> <take> <start> <end> <posterAt> [tailFadeMs] [headFadeMs] [soundEarlierMs]");
  process.exit(1);
}
const DIR = resolve(import.meta.dir);
const RAW = join(DIR, "raw");
const TRASH = resolve(DIR, "../../../../.trash/clips-2026-09-27-picread");
const start = Math.round(Number(a) * 30) / 30, end = Number(b), posterAt = Number(p);
const tail = Number(tf ?? 700) / 1000, head = Number(hf ?? 250) / 1000, earlier = Number(se ?? 0) / 1000;
const src = join(RAW, take);
const edit = join(RAW, ".edit");
mkdirSync(edit, { recursive: true });
const dst = join(edit, `${take}-cut${n}`);
/** never delete: move an old file out of the way */
const retire = (f: string) => {
  if (!existsSync(f)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(f, join(TRASH, `${Date.now()}-${f.split("/").pop()}`));
};
for (const ext of [".master.mp4", ".master.wav", ".timeline.json"]) retire(dst + ext);
linkSync(`${src}.master.mp4`, `${dst}.master.mp4`);
copyFileSync(`${src}.timeline.json`, `${dst}.timeline.json`);
const af = [
  ...(earlier > 0 ? [`atrim=start=${earlier.toFixed(4)}`, "asetpts=PTS-STARTPTS", "apad"] : []),
  ...(head > 0 ? [`afade=t=in:st=${start.toFixed(4)}:d=${head.toFixed(4)}:curve=tri`] : []),
  `afade=t=out:st=${(end - tail).toFixed(4)}:d=${tail.toFixed(4)}:curve=tri`,
].join(",");
const dur = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `${src}.master.wav`]).stdout.toString().trim();
const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", `${src}.master.wav`, "-af", af, "-t", dur, "-c:a", "pcm_f32le", `${dst}.master.wav`]);
if (r.status !== 0) throw new Error(r.stderr.toString());
const out = resolve(DIR, `../picread-${n}.mp4`);
const res = trim(`${dst}.master.mp4`, start, end, out, { posterAt: posterAt - start });
console.log(JSON.stringify(res, null, 1));
process.exit(0);
