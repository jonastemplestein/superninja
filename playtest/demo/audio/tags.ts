// Line tags for the demo choreography's lines (docs/DEMO_CHOREOGRAPHY.md §5): the tv_demo_* ids only. Rewrites
// src/core/content/line-tags.ts in place: an existing entry is replaced on its own line (new hash), a new one is appended
// before the closing brace. Nothing else in the file is touched.
//   bun playtest/demo/audio/tags.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LINES } from "../../../src/content/lines";
import { lineHash } from "../../../src/core/content/linebook";
import type { Key, LineMeta, Tag } from "../../../src/core/types";

const ROOT = join(import.meta.dir, "../../..");
const FILE = join(ROOT, "src/core/content/line-tags.ts");
const mine = LINES.filter((l) => l.id.startsWith("tv_demo_"));
const M = (key: Key): Tag => ({ key, as: "mention" });
/** The rule lines mention what their game's frame mentions (TS §4.1); nothing here explains a notion on its own. */
const TAGS: Record<string, Tag[]> = {
  tv_demo_rule_tap: [M("mech:tap-picture")],
  tv_demo_rule_find_sun: [M("mech:tap-picture")],
  tv_demo_rule_find_sausage: [M("mech:tap-picture")],
  tv_demo_rule_fastslow: [M("idea:fast-and-slow-saying")],
  tv_demo_rule_tapall: [M("idea:first-sound")],
  tv_demo_rule_tapall_in: [M("idea:middle-sound")],
  tv_demo_rule_rail: [M("idea:left-to-right")],
  tv_demo_rule_sounds: [M("idea:words-are-made-of-sounds")],
  tv_demo_rule_dots: [M("idea:words-are-made-of-sounds")],
  tv_demo_rule_firstsound: [M("idea:first-sound")],
  tv_demo_rule_find: [M("idea:sounds-have-spellings")],
  tv_demo_rule_soundhunt: [M("idea:middle-sound")],
  tv_demo_rule_swap: [M("idea:change-one-sound")],
  tv_demo_rule_sort: [M("idea:same-sound-different-spellings")],
  tv_demo_watch_write: [M("idea:sounds-have-spellings")],
};
const meta = (id: string, text: string): LineMeta => {
  const instruction = id.startsWith("tv_demo_rule_") || id === "tv_demo_watch_me" || id === "tv_demo_watch_write";
  return {
    id,
    hash: lineHash(text, "sensei"),
    who: "sensei",
    purpose: instruction ? "instruction" : "model",
    tags: TAGS[id] ?? [],
    needs: [],
    repetition: "routine",
    ...(instruction ? { steps: 1 } : {}),
  };
};
let src = readFileSync(FILE, "utf8");
let added = 0, replaced = 0;
for (const l of mine) {
  const row = `  ${JSON.stringify(l.id)}: ${JSON.stringify(meta(l.id, l.text))},`;
  const re = new RegExp(`^  ${JSON.stringify(l.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: \\{.*\\},$`, "m");
  if (re.test(src)) {
    src = src.replace(re, row);
    replaced++;
  } else {
    const end = src.lastIndexOf("\n};");
    src = src.slice(0, end) + "\n" + row + src.slice(end);
    added++;
  }
}
writeFileSync(FILE, src);
console.log(JSON.stringify({ added, replaced, of: mine.length }));
