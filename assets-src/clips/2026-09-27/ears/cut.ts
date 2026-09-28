// The cut of one ears clip from a take recorded by ./drive.ts: one continuous window of the master, through the rig's
// trim() (H.264 High yuv420p 1920×1080 30 fps, AAC 128k 48 kHz, faststart, −16 LUFS, a JPG poster), plus a contact sheet.
//
//   bun assets-src/clips/2026-09-27/ears/cut.ts <take name> <start> <end> <out name> <posterAt> [tailFadeMs]
//     e.g. bun assets-src/clips/2026-09-27/ears/cut.ts w1-wu3-t6 2.8 24.1 ears-2 13.5 600
//   → assets-src/clips/2026-09-27/<out>.mp4 + .jpg, and ears/<out>.sheet.jpg (a frame every second)
//
// The dojo music runs under every warm-up, so the sound gets a gentle fade over its last `tailFadeMs` (default 600)
// instead of only trim()'s 80 ms (the fish-dog cut's way, 26 Sep): an edit master beside the take, the same picture
// (a hard link) and the take's WAV with that fade written in at the end, so the loudness pass hears the finished sound.
// `posterAt` is in master seconds.
import { copyFileSync, existsSync, linkSync, mkdirSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { contactSheet, trim } from "../../../../scripts/tweet-clips";

const [take, a, b, outName, p, tf] = process.argv.slice(2);
if (!take || !a || !b || !outName || !p) {
  console.log("usage: bun assets-src/clips/2026-09-27/ears/cut.ts <take> <start> <end> <out> <posterAt> [tailFadeMs]");
  process.exit(1);
}
const DIR = resolve(import.meta.dir);
const TAKES = join(DIR, "takes");
const TRASH = resolve(DIR, "../../../../.trash/clips-2026-09-27-ears");
const start = Number(a), end = Number(b), posterAt = Number(p), tail = Number(tf ?? 600) / 1000;
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
const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", `${src}.master.wav`, "-af", `afade=t=out:st=${(end - tail).toFixed(4)}:d=${tail.toFixed(4)}:curve=tri`, "-c:a", "pcm_f32le", `${dst}.master.wav`]);
if (r.status !== 0) throw new Error(r.stderr.toString());
const out = resolve(DIR, "..", `${outName}.mp4`);
const res = trim(`${dst}.master.mp4`, start, end, out, { posterAt: posterAt - Math.round(start * 30) / 30 });
const sheet = join(DIR, `${outName}.sheet.jpg`);
retire(sheet);
contactSheet(out, 1, sheet);
console.log(JSON.stringify({ ...res, sheet }, null, 1));
process.exit(0);
