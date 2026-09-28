// The demo inventory's checker: reads a recording's timeline.json (build.ts) and lists everything that moves on the
// board without the child having caused it, with who appears to do it and how it sits against Sensei's words:
//   · actor: "paw" (the pointing hand appears, or taps), "ninja" (a strike, move, launch or carry by the child's own
//     ninja), "board" (a card, tile, rail or button lights, flashes, hops, glows or turns green by itself);
//   · the line playing as it starts (if any), and the last line before it: its words, when it ended, and the gap;
//   · flags (docs/demo-choreography/inventory.md §1):
//       SUDDEN     it starts within 300 ms of the end of a short line (four words or fewer: "Let me show you!",
//                  "Tap the sun!", "Watch me first!", or a lone sound or word: /m/, "sun"), or while one is being said;
//       NINJA      the ninja does it during Sensei's own demo (no child tap in the 3 s before);
//       UNANNOUNCED no line in the 4 s before it says, in the first person, that Sensei is about to do it ("I'll…",
//                  "I'm going to…", "Watch me…", "Let me…", "Now I…"); a generic "Let me show you!" counts as
//                  announced only generically (flag ANNOUNCED-GENERIC), since it never names the action.
// Actions within 3 s of a child's tap are the child's answer and its reply, not a demo, and are left out; so are the
// naming spotlights (+spot: Sensei names each card as it lights).
//
//   bun playtest/demo/inventory/analyze.ts [case ...]      → runs/<case>/actions.json, and a summary on stdout
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Ev } from "./build";

const RUNS = join(resolve(import.meta.dir), "runs");
const BOARD = new Set(["right", "found", "flash", "lit", "glow", "hop", "stretch", "zip", "pulse", "struck", "on", "dj-front", "aside"]);
const FIRST_PERSON = /\b(I'll|I'm going to|I will|Watch me|Watch my|Let me|Now I|I tap|I find|I say|I can)\b/i;
const GENERIC = /^(Let me show you!|Watch me first!|Let me show you\.\.\.)$/i;

export interface Action {
  t: number;
  actor: "paw" | "ninja" | "board";
  what: string;
  during?: string;
  before?: { text: string; id: string; end: number; words: number; gap: number };
  announce?: string;
  flags: string[];
}

export function analyze(name: string): Action[] {
  const tl: Ev[] = JSON.parse(readFileSync(join(RUNS, name, "timeline.json"), "utf8"));
  const says = tl.filter((e) => e.kind === "say");
  const taps = tl.filter((e) => e.kind === "tap").map((e) => e.t);
  const childCaused = (t: number) => taps.some((x) => t >= x && t - x < 3000);
  const out: Action[] = [];
  let lastNinjaCall = -1e9;
  for (const e of tl) {
    let actor: Action["actor"] | null = null;
    let what = "";
    if (e.kind === "paw") (actor = "paw"), (what = `the paw appears over ${e.el}`);
    else if (e.kind === "paw-off") (actor = "paw"), (what = "the paw taps and goes");
    else if (e.kind === "ninja" && e.id !== "pose") {
      actor = "ninja";
      what = `ninja ${e.id === "act" || e.id === "strike" ? e.move : e.id}${e.el ? ` at ${e.el}` : ""}`;
      if (e.id === "act" && e.t - lastNinjaCall < 20) actor = null; // (a strike calls act: counted once)
      lastNinjaCall = e.t;
    } else if (e.kind === "pose" && ["kick", "punch", "throw", "cast", "spin", "jump", "flip", "cheer", "power", "run"].includes(e.move ?? "") && e.t - lastNinjaCall > 400) {
      // a pose with no controller call just before it: one of Early.tsx's letter launches (moveNinja/launch), or the
      // warm-ups' whole-body moves (the dash on a fast word, the run along the reading rail)
      (actor = "ninja"), (what = e.move === "run" ? "the ninja dashes / runs along" : `ninja ${e.move} (a launch)`);
      lastNinjaCall = e.t;
    } else if (e.kind === "state" && e.add?.some((c) => BOARD.has(c))) {
      actor = "board";
      what = `${e.el} ${e.add.filter((c) => BOARD.has(c)).map((c) => `+${c}`).join(" ")}`;
    }
    if (!actor || childCaused(e.t)) continue;
    const during = says.find((s) => s.t <= e.t && s.end! > e.t);
    const prev = [...says].reverse().find((s) => s.end! <= e.t + 1);
    const a: Action = { t: e.t, actor, what, flags: [] };
    if (during) a.during = during.text;
    if (prev) a.before = { text: prev.text!, id: prev.id!, end: prev.end!, words: prev.words ?? 1, gap: e.t - prev.end! };
    // a short line (four words or fewer), or a lone sound or word (one word), just before it or under it
    const shortDuring = during && (during.words ?? 9) <= 4;
    const shortBefore = prev && (prev.words ?? 9) <= 4 && e.t - prev.end! <= 300;
    if (shortDuring || shortBefore) a.flags.push("SUDDEN");
    if (actor === "ninja") a.flags.push("NINJA");
    const recent = says.filter((s) => s.t >= e.t - 4000 && s.t <= e.t && !s.id?.includes(":"));
    const specific = recent.find((s) => FIRST_PERSON.test(s.text ?? "") && !GENERIC.test(s.text ?? ""));
    const generic = recent.find((s) => GENERIC.test(s.text ?? ""));
    if (specific) a.announce = specific.text;
    else if (generic) (a.announce = generic.text), a.flags.push("ANNOUNCED-GENERIC");
    else a.flags.push("UNANNOUNCED");
    out.push(a);
  }
  return out;
}

if (import.meta.main) {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(RUNS).filter((d) => existsSync(join(RUNS, d, "timeline.json")));
  for (const n of names) {
    const acts = analyze(n);
    writeFileSync(join(RUNS, n, "actions.json"), JSON.stringify(acts, null, 1));
    const f = (k: string) => acts.filter((a) => a.flags.includes(k)).length;
    console.log(`${n}: ${acts.length} actions not caused by a tap · SUDDEN ${f("SUDDEN")} · NINJA ${f("NINJA")} · UNANNOUNCED ${f("UNANNOUNCED")} · generic ${f("ANNOUNCED-GENERIC")}`);
    for (const a of acts) {
      if (a.what.includes("+on") || a.what.includes("+struck")) continue;
      console.log(`  ${(a.t / 1000).toFixed(2)} ${a.actor.padEnd(5)} ${a.what.padEnd(44)} ${a.during ? `during "${a.during}"` : a.before ? `${a.before.gap} ms after "${a.before.text}"` : ""}  ${a.flags.join(" ")}`);
    }
  }
}
