// The cut of a First Sounds clip from a take recorded by ./drive.ts.
//
//   bun assets-src/clips/2026-09-27/firstsound/cut.ts <take> <start> <end> <posterAt> <out.mp4> [headFadeMs=0] [tailFadeMs=400] [edgeFadeMs=20]
//
// Cuts takes/<take>.master.mp4 [start, end] (master seconds) to <out.mp4> + its .jpg poster (posterAt: master seconds)
// with the rig's trim() (X spec: H.264 High yuv420p 30 fps, AAC-LC 128k 48 kHz, faststart, −16 LUFS). As in the 26 Sep
// fish-dog cut, the dojo music is playing at both cuts, so it can get a gentle fade in over `headFadeMs` and out over
// the last `tailFadeMs`: an edit master beside the take (a hard link of the picture, and the take's WAV with those fades
// written in) so trim()'s loudness pass hears the finished sound. trim()'s own fade at both edges is `edgeFadeMs`
// (20 ms: the clips cut in on the frame a new turn's pictures appear, ~30 ms before Sensei's first word, so trim()'s
// default 80 ms would soften the word's start). The cut points must sit where nobody is speaking (the timeline says;
// trim() warns otherwise).
// Then a contact sheet of the finished clip (every 0.5 s) beside it, and the take's frame and sync report for the window.
import { copyFileSync, existsSync, linkSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { trim, contactSheet, type TimelineEvent } from "../../../../scripts/tweet-clips";

const [take, a, b, p, outArg, hf, tf, ef] = process.argv.slice(2);
if (!take || !a || !b || !p || !outArg) {
  console.log("usage: bun assets-src/clips/2026-09-27/firstsound/cut.ts <take> <start> <end> <posterAt> <out.mp4> [headFadeMs] [tailFadeMs]");
  process.exit(1);
}
const DIR = resolve(import.meta.dir);
const TAKES = join(DIR, "takes");
const TRASH = resolve(DIR, "../../../../.trash/clips-2026-09-27-firstsound");
const start = Number(a), end = Number(b), posterAt = Number(p);
const head = Number(hf ?? 0) / 1000, tail = Number(tf ?? 400) / 1000, edge = Number(ef ?? 20);
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
const out = resolve(outArg);
const res = trim(`${dst}.master.mp4`, start, end, out, { posterAt: posterAt - Math.round(start * 30) / 30, fadeMs: edge });
mkdirSync(join(DIR, "review"), { recursive: true });
const sheet = contactSheet(out, 0.5, join(DIR, "review", out.split("/").pop()!.replace(/\.mp4$/, ".sheet.jpg")));
// the window's report from the take: speech inside it, freezes, and the take's sync
const tl = JSON.parse(readFileSync(`${src}.timeline.json`, "utf8"));
const ev: TimelineEvent[] = tl.events;
const inside = ev.filter((e) => e.t >= start - 0.05 && e.t < end && ["speech", "mark", "hitch"].includes(e.kind));
const edges = ev.filter((e) => e.kind === "speech" && ((e.t < start && e.t + (e.dur ?? 0) > start) || (e.t < end && e.t + (e.dur ?? 0) > end)));
console.log(JSON.stringify({ ...res, sheet, takeFrames: tl.frames, takeSync: tl.sync, cutThroughSpeech: edges.map((e) => `${e.id} ${e.t}–${(e.t + (e.dur ?? 0)).toFixed(3)}`) }, null, 1));
for (const e of inside) console.log(`${(e.t - start).toFixed(2)} ${e.kind} ${e.id}${e.text ? ` "${e.text}"` : ""}`);
process.exit(0);
