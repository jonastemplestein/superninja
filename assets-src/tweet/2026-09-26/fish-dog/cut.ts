// The hand cut of clip #4, "fish-dog", from a take recorded by ./drive.ts.
//
//   bun assets-src/tweet/2026-09-26/fish-dog/cut.ts <take> <start> <end> <posterAt> [tailFadeMs]
//
// Cuts raw/fish-dog-<take>.master.mp4 [start, end] (master seconds) to ../fish-dog.mp4 + ../fish-dog.jpg with the rig's
// trim() (−16 LUFS, X spec). One editorial touch on top: the dojo music is still playing at the cut, so it gets a
// gentle fade over the last `tailFadeMs` (600 ms, starting 0.4 s after the last word) instead of trim()'s 80 ms, which would stop it
// short. (trim()'s fade is the same at both ends, and the head can't take a long one: "Ninjas read this way!" starts
// 0.1 s in.) Done by giving trim() an edit master beside the take: the same picture (a hard link) and the take's WAV with
// that fade written in at the end time, so the loudness pass sees the finished sound.
import { existsSync, linkSync, mkdirSync, copyFileSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { trim } from "../../../../scripts/tweet-clips";

const [take, a, b, p, tf] = process.argv.slice(2);
if (!take || !a || !b || !p) {
  console.log("usage: bun assets-src/tweet/2026-09-26/fish-dog/cut.ts <take> <start> <end> <posterAt> [tailFadeMs]");
  process.exit(1);
}
const DIR = resolve(import.meta.dir);
const RAW = join(DIR, "raw");
const TRASH = resolve(DIR, "../../../../.trash/tweet-fish-dog");
const start = Number(a), end = Number(b), posterAt = Number(p), tail = Number(tf ?? 600) / 1000;
const src = join(RAW, `fish-dog-${take}`);
const edit = join(RAW, ".edit");
mkdirSync(edit, { recursive: true });
const dst = join(edit, `fish-dog-${take}-cut`);
/** never delete: move an old file out of the way */
const retire = (f: string) => {
  if (!existsSync(f)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(f, join(TRASH, `${Date.now()}-${f.split("/").pop()}`));
};
for (const ext of [".master.mp4", ".master.wav", ".timeline.json"]) retire(dst + ext);
linkSync(`${src}.master.mp4`, `${dst}.master.mp4`);
copyFileSync(`${src}.timeline.json`, `${dst}.timeline.json`);
// (the fade ends exactly at the cut; after it, silence, which trim() leaves out)
const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", `${src}.master.wav`, "-af", `afade=t=out:st=${(end - tail).toFixed(4)}:d=${tail.toFixed(4)}:curve=tri`, "-c:a", "pcm_f32le", `${dst}.master.wav`]);
if (r.status !== 0) throw new Error(r.stderr.toString());
const out = resolve(DIR, "../fish-dog.mp4");
const res = trim(`${dst}.master.mp4`, start, end, out, { posterAt: posterAt - Math.round(start * 30) / 30 });
console.log(JSON.stringify(res, null, 1));
process.exit(0);
