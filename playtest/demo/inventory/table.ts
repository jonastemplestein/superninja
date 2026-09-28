// The demo inventory's tables: prints a demo's beat-by-beat timeline (demos.json window) as a markdown table, with
// times in ms from the demo's first line, what Sensei says (and for how long), what moves, who appears to do it, and
// how it sits against the words (the gap from the end of the last thing said, or "under" the line playing).
//
//   bun playtest/demo/inventory/table.ts <demo-id> [...]
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { analyze } from "./analyze";
import type { Ev } from "./build";
import type { Demo } from "./strips";

const HERE = resolve(import.meta.dir);
const demos: Demo[] = JSON.parse(readFileSync(join(HERE, "demos.json"), "utf8"));

/** An element's label, as a person would say it. */
const nice = (el: string) =>
  el.startsWith("wu-ribbon") ? "the sound ribbon" : el.startsWith("wu-dot") ? "a dot on the ribbon" : /^rail \d/.test(el) ? `row ${Number(el.slice(5)) + 1}` : /^dot \d/.test(el) ? `dot ${Number(el.slice(4)) + 1}` : el.replace(/^w:/, "the ");

export function table(d: Demo): string {
  const tl: Ev[] = JSON.parse(readFileSync(join(HERE, "runs", d.case, "timeline.json"), "utf8"));
  const acts = analyze(d.case);
  const t0 = d.from * 1000;
  const inWin = (t: number) => t >= t0 - 5 && t <= d.to * 1000 + 5;
  const says = tl.filter((e) => e.kind === "say");
  const rows: string[] = ["| ms | Sensei says | what moves | who appears to do it | against the words |", "|---:|---|---|---|---|"];
  const ms = (t: number) => String(Math.max(0, Math.round(t - t0)));
  const against = (t: number) => {
    const during = says.find((s) => s.t <= t && s.end! > t + 30);
    if (during) return `under “${during.text}” (${Math.round(t - during.t)} ms into it)`;
    // the last thing said that has started by now (one ending within 30 ms counts as ended: "0 ms after")
    const prev = says.filter((s) => s.t <= t).reduce<Ev | null>((a, s) => (!a || s.end! > a.end! ? s : a), null);
    return prev ? `${Math.max(0, Math.round(t - prev.end!))} ms after “${prev.text}” ends` : "";
  };
  const flags = (t: number, actor: string) => {
    const a = acts.find((x) => Math.abs(x.t - t) < 30 && x.actor === actor);
    return a ? a.flags.filter((f) => f !== "ANNOUNCED-GENERIC").map((f) => `**${f}**`).join(" ") : "";
  };
  let paws = 0, lastStrike = -1e9, lastRun = -1e9, lastLaunch = -1e9;
  const taps = tl.filter((e) => e.kind === "tap").map((e) => e.t);
  const child = (t: number) => taps.some((x) => t - x >= 0 && t - x < 3000);
  for (const e of tl) {
    if (!inWin(e.t)) continue;
    if (e.kind === "say") {
      const dur = e.end! - e.t;
      rows.push(`| ${ms(e.t)} | ${e.text}${e.cut ? " ✂" : ""} *(${(dur / 1000).toFixed(1)} s)* | | Sensei's voice | |`);
    } else if (e.kind === "paw") {
      const over = d.pawOver?.[paws] ?? (/^rail \d/.test(e.el ?? "") ? `row ${Number(e.el!.slice(5)) + 1}` : e.el);
      paws++;
      rows.push(`| ${ms(e.t)} | | the paw pops in over the **${over}** (no arm; it bobs where it lands) | the paw | ${against(e.t)} ${flags(e.t, "paw")} |`);
    } else if (e.kind === "paw-off") {
      // (the warm-ups' paw clicks as it goes; Early's makes no sound of its own)
      const click = tl.some((x) => x.kind === "sfx" && x.id === "tap" && Math.abs(x.t - e.t) < 25);
      rows.push(`| ${ms(e.t)} | | the paw vanishes${click ? " with a tap click" : " (no sound of its own)"} | the paw | ${against(e.t)} |`);
    }
    else if (e.kind === "ninja" && e.id !== "pose") {
      if (e.id === "act" && e.t - lastStrike < 30) continue;
      if (e.id === "strike") lastStrike = e.t;
      const tgt = e.el && !e.el.startsWith("(") ? ` at the ${e.el}` : "";
      const what = e.id === "strike" || e.id === "act" ? `${e.move}${tgt}` : e.id;
      rows.push(`| ${ms(e.t)} | | the ninja: **${what}**${e.text === "soft" ? " (a soft strike: one tink)" : ""} | ${child(e.t) ? "the ninja (the child's answer)" : "**the ninja**"} | ${against(e.t)} ${child(e.t) ? "" : flags(e.t, "ninja")} |`);
    } else if (e.kind === "pose" && e.move === "run") {
      if (e.t - lastRun > 400 && !child(e.t)) rows.push(`| ${ms(e.t)} | | the ninja dashes / runs along | **the ninja** | ${against(e.t)} ${flags(e.t, "ninja")} |`);
      lastRun = e.t;
    } else if (e.kind === "pose" && ["cast", "throw", "punch", "kick", "jump", "spin", "flip"].includes(e.move ?? "") && e.t - lastStrike > 400 && e.t - lastLaunch > 400 && !tl.some((x) => x.kind === "ninja" && x.id !== "pose" && Math.abs(x.t - e.t) < 400)) {
      lastLaunch = e.t;
      rows.push(`| ${ms(e.t)} | | the ninja: **${e.move}** (a spell or launch) | ${child(e.t) ? "the ninja (the child's answer)" : "**the ninja**"} | ${against(e.t)} ${child(e.t) ? "" : flags(e.t, "ninja")} |`);
    } else if (e.kind === "state" && e.add?.some((c) => ["right", "found", "flash", "lit", "glow", "struck", "zip", "pulse"].includes(c))) {
      const c = e.add.find((x) => ["right", "found", "flash", "lit", "glow", "struck", "zip", "pulse"].includes(x))!;
      const word = { right: "turns green (a tick)", found: "is found (flies to its pocket)", flash: "flashes", lit: "lights up", glow: "glows", struck: "gets the star stamp (the move lands)", zip: "zips", pulse: "pulses" }[c];
      const el = nice(e.el ?? "");
      if (c === "lit" && e.id === "wu-dot") continue;
      rows.push(`| ${ms(e.t)} | | ${el} ${word} | ${child(e.t) ? "(the child's answer)" : c === "struck" ? "the ninja's move" : "the board, by itself"} | ${child(e.t) ? "" : against(e.t)} |`);
    } else if (e.kind === "tap") rows.push(`| ${ms(e.t)} | | | **the child taps ${e.el}** | |`);
    else if (e.kind === "turn") rows.push(`| ${ms(e.t)} | | *the child's turn opens* | | |`);
    else if (e.kind === "hold") rows.push(`| ${ms(e.t)} | | *held on Next* | | |`);
  }
  return rows.join("\n");
}

if (import.meta.main) for (const id of process.argv.slice(2)) {
  const d = demos.find((x) => x.id === id);
  if (d) console.log(`### ${d.title}\n\n${table(d)}\n`);
}
