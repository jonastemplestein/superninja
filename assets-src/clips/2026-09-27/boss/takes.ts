// Films takes of one boss clip until enough of them are clean, on a machine shared with bots and other clip editors.
//
//   bun assets-src/clips/2026-09-27/boss/takes.ts <clip 1|2|3> [good=2] [maxTries=5] [--720p] [--720p-after=N] [--load=N]
//
// Each try is a separate process (bun drive.ts take: the rig's advice), which first waits for a quieter minute (see
// drive.ts waitForQuiet). A take is clean when the clip's window (drive.ts editWindow, from the take's own timeline)
// exists, has no freeze (a rig "hitch": no new frame for over 70 ms) in or near it, the browser drew at least 50 fps
// overall, and the A/V sync residual's median is within ±40 ms at the head's claps and at the tail's. --720p-after=N: tries after the Nth film at 720p
// (the other editors found 720p holds 60 fps on this machine when 1080p doesn't).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CLIPS, TAKES, editWindow } from "./drive";
import type { TimelineEvent } from "../../../../scripts/tweet-clips";

const DIR = import.meta.dir;

export function judge(timeline: string, id: string) {
  const tl = JSON.parse(readFileSync(timeline, "utf8"));
  const ev: TimelineEvent[] = tl.events;
  const problems: string[] = [];
  let w: { start: number; end: number } | null = null;
  try {
    w = editWindow(timeline.replace(/\.timeline\.json$/, ".master.mp4"), ev, id);
  } catch (e) {
    problems.push(`no window: ${(e as Error).message}`);
  }
  if (w && w.end - w.start > 35.5) problems.push(`window ${(w.end - w.start).toFixed(1)} s`);
  const freezes = w ? ev.filter((e) => e.kind === "hitch" && e.t >= w!.start - 0.1 && e.t < w!.end + 0.2) : [];
  if (freezes.length) problems.push(`freezes in the window: ${freezes.map((e) => `${e.t}(${e.id})`).join(" ")}`);
  if ((tl.frames?.fps ?? 0) < 50) problems.push(`${tl.frames?.fps} fps overall`);
  // (the head's and the tail's five claps each: their median within ±40 ms; one clap can land on a render blip)
  const med = (xs: (number | null)[]) => {
    const s = xs.filter((x): x is number => x != null).sort((a, b) => a - b);
    return s.length >= 3 ? s[Math.floor(s.length / 2)] : 999;
  };
  const r: (number | null)[] = tl.sync?.residualMs ?? [];
  const head = med(r.slice(0, 5)), tail = med(r.slice(5));
  if (Math.abs(head) > 40 || Math.abs(tail) > 40) problems.push(`sync off: head ${head} ms, tail ${tail} ms`);
  return { ok: problems.length === 0, window: w, problems, fps: tl.frames?.fps, hitches: tl.frames?.hitches, sync: tl.sync?.residualMaxAbsMs, freezes: freezes.length };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const [id, goodArg, triesArg] = args.filter((a) => !a.startsWith("--"));
  const clip = CLIPS[id];
  if (!clip) throw new Error("clip 1, 2 or 3");
  const want = Number(goodArg ?? 2), tries = Number(triesArg ?? 5);
  const after720 = Number(args.find((a) => a.startsWith("--720p-after="))?.slice(13) ?? (args.includes("--720p") ? 0 : 99));
  let good = 0;
  for (let k = 1; k <= tries && good < want; k++) {
    const p720 = k > after720;
    let n = 1;
    const name = () => `c${id}-${clip.level}-${clip.hero}${p720 ? "-720" : ""}-t${n}`;
    while (existsSync(join(TAKES, `${name()}.timeline.json`)) || existsSync(join(TAKES, `${name()}.log`))) n++;
    const take = name();
    const log = join(TAKES, `${take}.log`);
    writeFileSync(log, "");
    console.log(`[takes] ${take}: waiting / filming (${new Date().toISOString().slice(11, 19)})`);
    const r = spawnSync("bun", [join(DIR, "drive.ts"), "take", take, id, ...(p720 ? ["--720p"] : [])], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 26 });
    writeFileSync(log, (r.stdout?.toString() ?? "") + (r.stderr?.toString() ?? ""));
    const tl = join(TAKES, `${take}.timeline.json`);
    if (!existsSync(tl)) {
      console.log(`[takes] ${take}: no timeline (exit ${r.status}) ${r.stderr?.toString().slice(-400)}`);
      continue;
    }
    const j = judge(tl, id);
    if (j.ok) good++;
    const load = r.stdout?.toString().match(/at load ([\d.]+)/)?.[1];
    console.log(`[takes] ${take}: ${j.ok ? "CLEAN" : "no good"} (filmed at load ${load}) fps ${j.fps} hitches ${j.hitches} sync ±${j.sync} window ${j.window ? `${j.window.start.toFixed(2)}–${j.window.end.toFixed(2)} (${(j.window.end - j.window.start).toFixed(1)} s)` : "-"} ${j.problems.join("; ")}`);
  }
  console.log(`[takes] clip ${id}: ${good} clean`);
  process.exit(0);
}
