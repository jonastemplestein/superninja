// The demo inventory's numbers: for each demo in demos.json, how long it runs, each paw (the gap from the last thing
// said to its arrival, what that was, how long it stays, what it lands with), the ninja's moves, and the flags; and the
// totals the inventory's summary quotes.
//
//   bun playtest/demo/inventory/stats.ts            → a markdown table on stdout, and stats.json
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { analyze } from "./analyze";
import type { Ev } from "./build";
import type { Demo } from "./strips";

const HERE = resolve(import.meta.dir);
const demos: (Demo & { intro?: boolean })[] = JSON.parse(readFileSync(join(HERE, "demos.json"), "utf8"));
const rows: any[] = [];
for (const d of demos) {
  const tl: Ev[] = JSON.parse(readFileSync(join(HERE, "runs", d.case, "timeline.json"), "utf8"));
  const acts = analyze(d.case);
  const t0 = d.from * 1000, t1 = d.to * 1000;
  const inWin = (t: number) => t >= t0 - 5 && t <= t1 + 5;
  const says = tl.filter((e) => e.kind === "say");
  const paws: any[] = [];
  const onAt = new Map<string, number>();
  for (const e of tl) {
    if (!inWin(e.t)) continue;
    if (e.kind === "paw") {
      // (as table.ts: a clip ending within 30 ms counts as ended, "0 ms after")
      const during = says.find((s) => s.t <= e.t && s.end! > e.t + 30);
      const prev = says.filter((s) => s.t <= e.t).reduce<Ev | null>((a, s) => (!a || s.end! > a.end! ? s : a), null);
      paws.push({ at: e.t - t0, over: e.el, gap: prev ? Math.max(0, e.t - prev.end!) : null, after: prev?.text, afterWords: prev?.words, during: during?.text });
      onAt.set(e.id!, e.t);
    } else if (e.kind === "paw-off" && onAt.has(e.id!)) {
      const p = paws.find((x) => x.at === onAt.get(e.id!)! - t0);
      if (p) p.stays = e.t - onAt.get(e.id!)!;
    }
  }
  const mine = acts.filter((a) => inWin(a.t));
  const ninja = mine.filter((a) => a.actor === "ninja");
  const board = mine.filter((a) => a.actor === "board" && !a.what.includes("+on"));
  const lines = says.filter((s) => inWin(s.t) && !s.id?.includes(":"));
  rows.push({
    id: d.id, game: d.game, intro: !!d.intro, secs: (t1 - t0) / 1000, lines: lines.length,
    paws, ninja: ninja.map((a) => ({ at: a.t - t0, what: a.what })), board: board.length,
    sudden: mine.filter((a) => a.flags.includes("SUDDEN")).length,
    unannounced: mine.filter((a) => a.flags.includes("UNANNOUNCED")).length,
    generic: mine.filter((a) => a.flags.includes("ANNOUNCED-GENERIC")).length,
    actions: mine.length,
  });
}
writeFileSync(join(HERE, "stats.json"), JSON.stringify(rows, null, 1));
const f = (ms: number | null) => (ms == null ? "–" : `${Math.round(ms)}`);
console.log("| demo | runs (s) | paws: gap after the last word → stays (ms) | the ninja moves | SUDDEN / UNANNOUNCED / generic of actions |");
console.log("|---|---:|---|---|---|");
for (const r of rows) {
  const p = r.paws.map((x: any) => `${f(x.gap)} → ${f(x.stays)}${x.during ? " (under a line)" : ""}`).join("; ") || "no paw";
  console.log(`| ${r.id} | ${r.secs.toFixed(1)} | ${p} | ${r.ninja.length} | ${r.sudden} / ${r.unannounced} / ${r.generic} of ${r.actions} |`);
}
const demo = rows.filter((r) => !r.intro);
const allPaws = demo.flatMap((r) => r.paws);
const gaps = allPaws.filter((p: any) => p.gap != null && !p.during).map((p: any) => p.gap).sort((a: number, b: number) => a - b);
const under = allPaws.filter((p: any) => p.during).length;
const med = (xs: number[]) => (xs.length ? xs[Math.floor(xs.length / 2)] : 0);
console.log(`\n${demo.length} demos; ${allPaws.length} paw appearances: ${under} while Sensei is still talking, the rest a median ${med(gaps)} ms after the last word (max ${gaps.at(-1)}); stays ${[...new Set(allPaws.map((p: any) => p.stays))].join("/")} ms`);
console.log(`demos where the ninja moves during Sensei's show: ${demo.filter((r) => r.ninja.length).length} of ${demo.length}; ninja moves in all: ${demo.reduce((t, r) => t + r.ninja.length, 0)}`);
console.log(`actions: ${demo.reduce((t, r) => t + r.actions, 0)}; SUDDEN ${demo.reduce((t, r) => t + r.sudden, 0)}; UNANNOUNCED ${demo.reduce((t, r) => t + r.unannounced, 0)}; generic ${demo.reduce((t, r) => t + r.generic, 0)}`);
