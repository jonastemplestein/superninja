// The moments of a take that a supercut can cut on (all on the master's clock, picture time): the entrance (the
// monster's landing boom, a flyer's whoosh, or a boss's reveal after Baron Muddle's cut-in), each word's big hit, the
// knockout (the last big hit: the blast-off's whoosh goes with it), and the lines around them.
//   bun assets-src/clips/2026-09-27/supercut/anchors.ts <take name>…
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TimelineEvent } from "../../../../scripts/tweet-clips";
import { frameDiffs } from "../boss/drive";

const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");

export interface Take {
  name: string;
  master: string;
  events: TimelineEvent[];
  game: { start: number; end: number };
  /** the claps' residual (sound minus picture, ms): head and tail medians */
  late: { head: number; tail: number };
  frames: any;
  width: number;
}
export function loadTake(name: string): Take {
  const tl = join(TAKES, `${name}.timeline.json`);
  if (!existsSync(tl)) throw new Error(`no take ${name}`);
  const d = JSON.parse(readFileSync(tl, "utf8"));
  const med = (xs: (number | null)[]) => {
    const s = xs.filter((x): x is number => x != null).sort((p, q) => p - q);
    return s.length ? s[Math.floor(s.length / 2)] : 0;
  };
  return { name, master: join(TAKES, `${name}.master.mp4`), events: d.events, game: d.game, late: { head: med(d.sync.residualMs.slice(0, 5)), tail: med(d.sync.residualMs.slice(5)) }, frames: d.frames, width: d.width };
}
/** How late the take's sound runs behind its picture at master time t (ms), from the claps. */
export const lateAt = (tk: Take, t: number) => tk.late.head + ((tk.late.tail - tk.late.head) * (t - tk.game.start)) / Math.max(1, tk.game.end - tk.game.start);

const sfx = (tk: Take, id: string) => tk.events.filter((e) => e.kind === "sfx" && e.id === id);
const lastMark = (tk: Take, re: RegExp) => [...tk.events].reverse().find((e) => e.kind === "mark" && re.test(e.id));
/** The fight in the take: from the last reload (or the kept order) to the end line. */
export function fight(tk: Take) {
  const from = lastMark(tk, /^(reload|order .* kept)$/)?.t ?? tk.game.start;
  const endLine = tk.events.find((e) => e.kind === "speech" && e.t > from && ["battle_win", "baron_lose"].includes(e.id));
  const left = tk.events.find((e) => e.kind === "mark" && e.t > from && e.id.startsWith("left battle"));
  const end = endLine?.t ?? left?.t ?? tk.game.end;
  return { from, end, endLine, left };
}
export function anchors(tk: Take) {
  const f = fight(tk);
  const inFight = (e: TimelineEvent) => e.t >= f.from && e.t <= f.end + 4;
  const boom = sfx(tk, "boom").filter(inFight)[0];
  const whoosh = sfx(tk, "whoosh").filter(inFight)[0];
  const e0 = boom && (!whoosh || boom.t <= whoosh.t + 0.2) ? { kind: "boom", t: boom.t } : whoosh ? { kind: "whoosh", t: whoosh.t } : null;
  // the picture lands ~0.1 s after the boom (the drop's animation starts a few frames after the code that times the
  // boom, on the new scene's first heavy frames): the landing is the frame of the stage's shake, the biggest change
  // in the 0.2 s after the boom
  let land = e0?.t;
  if (e0?.kind === "boom") {
    const d = frameDiffs(tk.master, e0.t - 0.02, 0.24);
    if (d.length) land = d.reduce((a, b) => (b.d > a.d ? b : a), d[0]).t;
  } else if (e0) land = Math.round((e0.t + 0.1) * 30) / 30; // a flyer's swoop has no shake: the same ~0.1 s lag (petal_imp-t1: the ninja's "!" shows ~0.1 s after its kiai)
  const entrance = e0 ? { ...e0, land: land! } : null;
  const hits = sfx(tk, "hit").filter((e) => e.t >= f.from && e.t <= f.end + 0.2).map((e) => e.t);
  // the knockout: the blast-off's whoosh at the last big hit
  const ko = [...sfx(tk, "whoosh")].reverse().find((e) => e.t <= f.end + 0.2 && hits.some((h) => Math.abs(h - e.t) < 0.05))?.t ?? hits[hits.length - 1];
  const lines = tk.events.filter((e) => e.kind === "speech" && e.t >= f.from && !/^(word|sound):/.test(e.id)).map((e) => ({ t: e.t, id: e.id, dur: e.dur, text: e.text }));
  const hitches = tk.events.filter((e) => e.kind === "hitch").map((e) => ({ t: e.t, id: e.id }));
  return { fight: f, entrance, hits, ko, lines, hitches };
}

if (import.meta.main) {
  for (const name of process.argv.slice(2)) {
    const tk = loadTake(name);
    const a = anchors(tk);
    console.log(`== ${name}  ${tk.width}p fps ${tk.frames?.fps} hitches ${tk.frames?.hitches} max ${tk.frames?.max}  late ${tk.late.head}/${tk.late.tail} ms`);
    console.log(`fight ${a.fight.from.toFixed(2)}–${a.fight.end.toFixed(2)}  entrance ${a.entrance?.kind} ${a.entrance?.t} (lands ${a.entrance?.land?.toFixed(3)})  ko ${a.ko}`);
    console.log(`hits ${a.hits.map((h) => h.toFixed(2)).join(" ")}`);
    console.log(`hitches ${a.hitches.map((h) => `${h.t}(${h.id})`).join(" ") || "none"}`);
    for (const l of a.lines) console.log(`  ${l.t.toFixed(2)} ${l.id} [${l.dur}] ${l.text ?? ""}`);
  }
  process.exit(0);
}
