// The demo inventory's cutter: for each demo in demos.json (a window of one recording), makes
//   · a frame strip: docs/demo-choreography/current/<id>.jpg (strip.py), one cell per moment that matters (each line
//     Sensei starts, the paw appearing and tapping, each ninja move, the board changing by itself, the child's turn
//     opening), labelled with its time from the demo's start, what happens, and what Sensei is saying then;
//   · a clip at real speed with its sound: docs/demo-choreography/current/clips/<id>.mp4;
//   · demos-table.json: each demo's moments with analyze.ts's flags, for the inventory's tables.
//
//   bun playtest/demo/inventory/strips.ts [demo-id ...]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { analyze } from "./analyze";
import type { Ev } from "./build";

const HERE = resolve(import.meta.dir);
const ROOT = resolve(HERE, "../../..");
const OUT = join(ROOT, "docs/demo-choreography/current");
const CLIPS = join(OUT, "clips");
mkdirSync(CLIPS, { recursive: true });

export interface Demo {
  id: string;
  case: string;
  game: string;
  title: string;
  /** the demo window (video seconds): from its first line to the child's turn opening */
  from: number;
  to: number;
  /** extra seconds of clip before and after (default 0.8, 1.5) */
  pre?: number;
  post?: number;
  /** cells to add ({t, label}) or drop (times, s) */
  add?: { t: number; label: string; flag?: string }[];
  drop?: number[];
  /** a label for the paw's target where the probe couldn't read it (e.g. "tortoise") */
  pawOver?: string[];
  cols?: number;
  max?: number;
}

const demos: Demo[] = JSON.parse(readFileSync(join(HERE, "demos.json"), "utf8"));
const only = process.argv.slice(2);
const table: Record<string, unknown> = existsSync(join(HERE, "demos-table.json")) ? JSON.parse(readFileSync(join(HERE, "demos-table.json"), "utf8")) : {};

const s = (ms: number) => ms / 1000;
for (const d of demos) {
  if (only.length && !only.includes(d.id)) continue;
  const dir = join(HERE, "runs", d.case);
  const tl: Ev[] = JSON.parse(readFileSync(join(dir, "timeline.json"), "utf8"));
  const acts = analyze(d.case);
  const inWin = (t: number) => t >= d.from * 1000 - 5 && t <= d.to * 1000 + 5;
  const says = tl.filter((e) => e.kind === "say");
  const sayingAt = (t: number) => says.filter((e) => e.t <= t + 30 && e.end! > t).map((e) => e.text).join(" ");
  let paws = 0;
  let lastStrike = -1e9, lastRun = -1e9, lastPoseMove = -1e9;
  type Cell = { t: number; label: string; say?: string; flag?: string; prio: number };
  const cells: Cell[] = [];
  const rel = (t: number) => `+${Math.max(0, t / 1000 - d.from).toFixed(2)} s`;
  const flagAt = (t: number, actor?: string) => {
    const a = acts.find((x) => Math.abs(x.t - t) < 30 && (!actor || x.actor === actor));
    if (!a) return undefined;
    if (a.flags.includes("NINJA")) return "the ninja acts";
    if (a.flags.includes("SUDDEN")) return "sudden";
    if (a.flags.includes("UNANNOUNCED")) return "not announced";
    return undefined;
  };
  for (const e of tl) {
    if (!inWin(e.t)) continue;
    if (e.kind === "say" && !e.id?.startsWith("sound:") && !e.id?.startsWith("word:")) cells.push({ t: e.t + 120, label: `${rel(e.t)}  ${e.id?.startsWith("baron") ? "Baron" : "Sensei"}: ${e.text}`, prio: 2 });
    else if (e.kind === "say" && e.id?.startsWith("word:")) cells.push({ t: e.t + 80, label: `${rel(e.t)}  Sensei says the word ${e.text}`, prio: 4 });
    else if (e.kind === "paw") {
      const over = d.pawOver?.[paws] ?? (/^rail \d/.test(e.el ?? "") ? `row ${Number(e.el!.slice(5)) + 1}` : e.el);
      paws++;
      cells.push({ t: e.t + 60, label: `${rel(e.t)}  the paw pops in over the ${over}`, flag: flagAt(e.t, "paw"), prio: 1 });
    } else if (e.kind === "paw-off") cells.push({ t: e.t + 40, label: `${rel(e.t)}  the paw taps and vanishes`, prio: 3 });
    else if (e.kind === "ninja" && e.id !== "pose") {
      if (e.id === "act" && e.t - lastStrike < 30) continue; // (a strike calls act)
      if (e.id === "strike") lastStrike = e.t;
      const tgt = e.el && !e.el.startsWith("(") ? ` at the ${e.el}` : "";
      cells.push({ t: e.t + 180, label: `${rel(e.t)}  the ninja: ${e.id === "strike" || e.id === "act" ? e.move : e.id}${tgt}`, flag: flagAt(e.t, "ninja") ?? "the ninja acts", prio: 1 });
    } else if (e.kind === "pose" && e.move === "run" && e.t - lastRun > 400 && !tl.some((x) => x.kind === "tap" && e.t - x.t >= 0 && e.t - x.t < 3000)) {
      lastRun = e.t;
      cells.push({ t: e.t + 150, label: `${rel(e.t)}  the ninja dashes along`, flag: "the ninja acts", prio: 2 });
    } else if (e.kind === "pose" && ["cast", "throw", "punch", "kick", "jump", "spin", "flip"].includes(e.move ?? "") && e.t - lastStrike > 400 && e.t - lastPoseMove > 400 && !tl.some((x) => x.kind === "ninja" && x.id !== "pose" && Math.abs(x.t - e.t) < 400) && !tl.some((x) => x.kind === "tap" && e.t - x.t >= 0 && e.t - x.t < 3000)) {
      lastPoseMove = e.t;
      cells.push({ t: e.t + 200, label: `${rel(e.t)}  the ninja: ${e.move} (a spell or launch)`, flag: "the ninja acts", prio: 1 });
    } else if (e.kind === "pose" && e.move === "run") lastRun = e.t;
    else if (e.kind === "state" && e.add?.includes("struck")) cells.push({ t: e.t + 60, label: `${rel(e.t)}  the ninja's move lands on the ${e.el} (a star stamp)`, prio: 3 });
    else if (e.kind === "state" && e.add?.some((c) => ["right", "found", "flash"].includes(c)) && !tl.some((x) => x.kind === "tap" && e.t - x.t >= 0 && e.t - x.t < 3000))
      cells.push({ t: e.t + 60, label: `${rel(e.t)}  ${e.el} ${e.add.includes("right") ? "turns green" : e.add.includes("found") ? "is found" : "flashes"}`, prio: 3 });
    else if (e.kind === "turn") cells.push({ t: e.t + 200, label: `${rel(e.t)}  the child's turn`, prio: 2 });
  }
  for (const a of d.add ?? []) cells.push({ t: a.t * 1000, label: `${rel(a.t * 1000)}  ${a.label}`, flag: a.flag, prio: 0 });
  // one cell per moment: events within 150 ms are one picture (the most important label wins, the rest join it)
  cells.sort((a, b) => a.t - b.t);
  const merged: Cell[] = [];
  for (const c of cells) {
    const last = merged.at(-1);
    if (last && c.t - last.t < 150) {
      if (c.prio < last.prio) {
        last.label = `${c.label}; ${last.label.replace(/^\+[\d.]+ s\s+/, "")}`;
        last.prio = c.prio;
      } else last.label = `${last.label}; ${c.label.replace(/^\+[\d.]+ s\s+/, "")}`;
      last.flag ??= c.flag;
    } else merged.push({ ...c });
  }
  let keep = merged.filter((c) => !(d.drop ?? []).some((t) => Math.abs(t * 1000 - c.t) < 200));
  const max = d.max ?? 9;
  while (keep.length > max) {
    // drop the least important, latest-first among equals
    let worst = 0;
    keep.forEach((c, i) => (c.prio > keep[worst].prio || (c.prio === keep[worst].prio && i > worst)) && (worst = i));
    keep.splice(worst, 1);
  }
  for (const c of keep) c.say = sayingAt(c.t) || undefined;
  const video = join(dir, "final.mp4");
  const spec = [{ video, out: join(OUT, `${d.id}.jpg`), title: `${d.title} (video ${d.from.toFixed(1)}–${d.to.toFixed(1)} s of ${d.case})`, cols: d.cols ?? 3, cells: keep.map((c) => ({ t: s(c.t), label: c.label, say: c.say, flag: c.flag })) }];
  const specFile = join(dir, `strip-${d.id}.json`);
  writeFileSync(specFile, JSON.stringify(spec, null, 1));
  const r = spawnSync("python3", [join(HERE, "strip.py"), specFile], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr);
  // the clip
  const clip = join(CLIPS, `${d.id}.mp4`);
  if (existsSync(clip)) {
    mkdirSync(join(ROOT, ".trash", "demo-inventory"), { recursive: true });
    renameSync(clip, join(ROOT, ".trash", "demo-inventory", `${Date.now()}-${d.id}.mp4`));
  }
  const a = Math.max(0, d.from - (d.pre ?? 0.8)), b = d.to + (d.post ?? 1.5);
  const f = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", a.toFixed(3), "-i", video, "-t", (b - a).toFixed(3), "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", clip], { encoding: "utf8" });
  if (f.status !== 0) throw new Error(f.stderr);
  table[d.id] = { ...d, actions: acts.filter((x) => inWin(x.t)), cells: keep };
  console.log(`${d.id}: ${keep.length} cells, clip ${(b - a).toFixed(1)} s`);
}
writeFileSync(join(HERE, "demos-table.json"), JSON.stringify(table, null, 1));
