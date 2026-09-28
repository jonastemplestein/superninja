// The cut of one battle clip from a take recorded by ./drive.ts: one continuous window of the master, through the rig's
// trim() (H.264 High yuv420p 1920×1080 30 fps, AAC 128k 48 kHz, faststart, −16 LUFS, a JPG poster), plus a contact sheet.
//
//   bun assets-src/clips/2026-09-27/battle/cut.ts <take> <start> <end> <out name> <posterAt> [tailFadeMs=500] [headFadeMs=120]
//     e.g. bun assets-src/clips/2026-09-27/battle/cut.ts w2-2-suki-t2 31.2 62.9 battle-1 55.1
//   → assets-src/clips/2026-09-27/<out>.mp4 + .jpg, and battle/<out>.sheet.jpg (a frame every second)
//
// The battle music runs under the whole clip, so the sound gets a gentle fade at each end (the ears cut's way): an edit
// master beside the take (the same picture, hard-linked) with the take's WAV faded in over `headFadeMs` from `start`
// and out over the last `tailFadeMs`, so the loudness pass hears the finished sound. `posterAt` is in master seconds.
import { copyFileSync, existsSync, linkSync, mkdirSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { contactSheet, trim } from "../../../../scripts/tweet-clips";

const [take, a, b, outName, p, tf, hf] = process.argv.slice(2);
if (!take || !a || !b || !outName || !p) {
  console.log("usage: bun assets-src/clips/2026-09-27/battle/cut.ts <take> <start> <end> <out> <posterAt> [tailFadeMs] [headFadeMs]");
  process.exit(1);
}
const DIR = resolve(import.meta.dir);
const TAKES = join(DIR, "takes");
const TRASH = resolve(DIR, "../../../../.trash/clips-2026-09-27-battle");
const start = Math.round(Number(a) * 30) / 30, end = Number(b), posterAt = Number(p);
const tail = Number(tf ?? 500) / 1000, head = Number(hf ?? 120) / 1000;
const retire = (f: string) => {
  if (!existsSync(f)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(f, join(TRASH, `${Date.now()}-${f.split("/").pop()}`));
};
const src = join(TAKES, take);
const edit = join(TAKES, ".edit");
mkdirSync(edit, { recursive: true });
const dst = join(edit, `${take}-${outName}`);
for (const ext of [".master.mp4", ".master.wav", ".timeline.json"]) retire(dst + ext);
linkSync(`${src}.master.mp4`, `${dst}.master.mp4`);
copyFileSync(`${src}.timeline.json`, `${dst}.timeline.json`);
const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", `${src}.master.wav`, "-af",
  `afade=t=in:st=${start.toFixed(4)}:d=${head.toFixed(4)}:curve=tri,afade=t=out:st=${(end - tail).toFixed(4)}:d=${tail.toFixed(4)}:curve=tri`, "-c:a", "pcm_f32le", `${dst}.master.wav`]);
if (r.status !== 0) throw new Error(r.stderr.toString());
const out = resolve(DIR, "..", `${outName}.mp4`);
const res = trim(`${dst}.master.mp4`, start, end, out, { posterAt: posterAt - start, fadeMs: 40 });
const sheet = join(DIR, `${outName}.sheet.jpg`);
retire(sheet);
contactSheet(out, 1, sheet);
console.log(JSON.stringify({ ...res, sheet }, null, 1));
process.exit(0);
