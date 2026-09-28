// Films takes of one clip until enough of them are clean, on a machine shared with bots.
//
//   bun assets-src/clips/2026-09-27/firstsound/takes.ts <clip 1|2|3> [good=2] [maxTries=6] [--720p] [--load=N]
//
// Each try is a separate process (bun drive.ts: the most reliable way to run the rig), started once the machine's
// 1-minute load is under --load (default 9). A take is clean when the clip's window (found from the take's own
// timeline: see WINDOWS) has no freeze (the drive's heartbeat makes the rig's hitches real freezes), the browser drew
// at least 50 fps overall, the A/V sync residual is within ±60 ms at every clap, and the window's beats all happened.
//
// Decision (27 Sep): the finals are 720p takes (--720p). At 1080p the shared machine (load 10–500 from bots and other
// editors) let the browser draw only 23–35 fps (w1-2-kai-t1, w1-10-kai-t1: visible stutter); at 720p every clean take
// held 60 fps with no freeze in the window, even at load ~20. Picks: firstsound-1 = w1-2-kai-720-t1 (t2 also clean,
// names one picture only), firstsound-2 = w1-3-suki-720-t4 (the correction says the stretched "aaant"; t3 clean but
// plain "apple"; t1, t2 froze), firstsound-3 = w1-10-kai-720-t1 (t2 clean, sync ±39 ms against ±21).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { loadavg } from "node:os";
import { join } from "node:path";
import type { TimelineEvent } from "../../../../scripts/tweet-clips";

const DIR = import.meta.dir;
type Clip = { level: string; hero: "kai" | "suki"; seconds: number; miss?: number; window: (ev: TimelineEvent[]) => { start: number; end: number } | null };
const speech = (ev: TimelineEvent[], id: string) => ev.filter((e) => e.kind === "speech" && e.id === id);
const endOf = (e: TimelineEvent) => e.t + (e.dur ?? 0);
export const CLIPS: Record<string, Clip> = {
  // w1-2: "Let's do it together!" for /s/ (the answer glows, the child taps it), "This is how we spell /s/" (the spell
  // writes it), then the first streak: "Three right answers in a row! Your ninja is getting stronger."
  "1": {
    level: "w1-2", hero: "kai", seconds: 86,
    window: (ev) => {
      const streak = speech(ev, "audit_streak_first")[0];
      const wedo = streak && speech(ev, "wedo").filter((e) => e.t < streak.t).pop();
      return streak && wedo ? { start: wedo.t, end: endOf(streak) } : null;
    },
  },
  // w1-3: the child's first own turn for /a/, a slip on the other picture, "Listen again...", then right, and the next
  // turn right first time (up to Sensei's "Watch me first!" for /t/)
  "2": {
    level: "w1-3", hero: "suki", seconds: 64, miss: 2,
    window: (ev) => {
      const youdo = speech(ev, "youdo")[0];
      const again = speech(ev, "listen_again")[0];
      const ido = youdo && speech(ev, "ido").find((e) => e.t > youdo.t);
      return youdo && again && ido ? { start: youdo.t, end: ido.t } : null;
    },
  },
  // w1-10: the child's own turn for /p/, then the two sounds head to head (/n/ or /p/?), to "Wow! Super ninja streak!"
  "3": {
    level: "w1-10", hero: "kai", seconds: 110,
    window: (ev) => {
      const six = speech(ev, "streak_6")[0];
      const youdo = six && speech(ev, "youdo").filter((e) => e.t < six.t).pop();
      return six && youdo ? { start: youdo.t, end: endOf(six) } : null;
    },
  },
};

/** Another clip editor's take is running (a bun drive.ts under assets-src/clips/2026-09-27/, not ours). */
function othersFilming(): boolean {
  const ps = spawnSync("ps", ["-Ao", "command"]).stdout.toString().split("\n");
  return ps.some((l) => /^bun .*clips\/2026-09-27\/(?!firstsound)[^/]+\/drive\.ts/.test(l) || /^bun drive\.ts (take|record)/.test(l));
}

export function judge(timeline: string, clip: Clip) {
  const tl = JSON.parse(readFileSync(timeline, "utf8"));
  const ev: TimelineEvent[] = tl.events;
  const w = clip.window(ev);
  const problems: string[] = [];
  if (!w) problems.push("the window's beats are missing");
  const freezes = w ? ev.filter((e) => e.kind === "hitch" && e.t >= w.start - 0.6 && e.t < w.end + 0.8) : [];
  if (freezes.length) problems.push(`freezes in the window: ${freezes.map((e) => `${e.t}(${e.id})`).join(" ")}`);
  if ((tl.frames?.fps ?? 0) < 50) problems.push(`${tl.frames?.fps} fps overall`);
  if ((tl.sync?.residualMaxAbsMs ?? 999) > 60) problems.push(`sync residual up to ${tl.sync?.residualMaxAbsMs} ms`);
  return { ok: problems.length === 0, window: w, problems, fps: tl.frames?.fps, hitches: tl.frames?.hitches, sync: tl.sync?.residualMaxAbsMs };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const [id, goodArg, triesArg] = args.filter((a) => !a.startsWith("--"));
  const clip = CLIPS[id];
  if (!clip) throw new Error("clip 1, 2 or 3");
  const want = Number(goodArg ?? 2), tries = Number(triesArg ?? 6);
  const p720 = args.includes("--720p");
  const maxLoad = Number(args.find((a) => a.startsWith("--load="))?.slice(7) ?? 9);
  let good = 0;
  for (let k = 1; k <= tries && good < want; k++) {
    let n = 1;
    const name = () => `${clip.level}-${clip.hero}${p720 ? "-720" : ""}-t${n}`;
    while (existsSync(join(DIR, "takes", `${name()}.timeline.json`))) n++;
    const take = name();
    // (the other clip editors film on this machine too: wait for their takes to finish, and for a quieter minute)
    // (after 4 min of waiting, another editor's take no longer holds us back: theirs may be waiting too)
    const since = Date.now();
    while (loadavg()[0] > maxLoad || (othersFilming() && Date.now() - since < 4 * 60_000)) await new Promise((r) => setTimeout(r, 10_000));
    console.log(`[takes] ${take}: filming at load ${loadavg()[0].toFixed(1)}`);
    const r = spawnSync("bun", [join(DIR, "drive.ts"), take, clip.level, clip.hero, String(clip.seconds), `--load=${maxLoad + 3}`, ...(clip.miss ? [`--miss=${clip.miss}`] : []), ...(p720 ? ["--720p"] : [])], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 26 });
    const tl = join(DIR, "takes", `${take}.timeline.json`);
    if (!existsSync(tl)) {
      console.log(`[takes] ${take}: no timeline (exit ${r.status}) ${r.stderr?.toString().slice(-500)}`);
      continue;
    }
    const j = judge(tl, clip);
    if (j.ok) good++;
    console.log(`[takes] ${take}: ${j.ok ? "CLEAN" : "no good"} fps ${j.fps} hitches ${j.hitches} sync ±${j.sync} window ${j.window ? `${j.window.start.toFixed(2)}–${j.window.end.toFixed(2)}` : "-"} ${j.problems.join("; ")} (load now ${loadavg()[0].toFixed(1)})`);
  }
  console.log(`[takes] clip ${id}: ${good} clean`);
  process.exit(0);
}
