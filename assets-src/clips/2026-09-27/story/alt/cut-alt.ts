// An alternative story-3 (27 Sep): the same take (c3-t2), the other half of the choice: after "Try again." the child
// picks "tap", the ninja's spell on the muddle-lock ("Ninja power!"), and the chest bursting open with petals ("The lid
// pops up. So much stuff!"). Cut like drive.ts final (the claps' residual interpolated at the window's middle).
//   bun assets-src/clips/2026-09-27/story/alt/cut-alt.ts
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { cut } from "../cut";
import { contactSheet } from "../../../../../scripts/tweet-clips";
const HERE = import.meta.dir;
const master = join(HERE, "..", "takes", "c3-t2.master.mp4");
const tl = JSON.parse(readFileSync(master.replace(/\.master\.mp4$/, ".timeline.json"), "utf8"));
const start = 67.167, end = 96.967, poster = 90.0;
const med = (xs: (number | null)[]) => {
  const s = xs.filter((x): x is number => x != null).sort((p, q) => p - q);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};
const head = med(tl.sync.residualMs.slice(0, 5)), tail = med(tl.sync.residualMs.slice(5));
const late = Math.round(head + ((tail - head) * ((start + end) / 2 - tl.game.start)) / (tl.game.end - tl.game.start));
const out = join(HERE, "story-3-alt-chest-opens.mp4");
const res = cut(master, start, end, out, { posterAt: poster - start, audioLateMs: late, fadeOutMs: 200 });
const sheet = contactSheet(out, 0.5, join(HERE, "story-3-alt-chest-opens.sheet.jpg"));
console.log(JSON.stringify({ ...res, audioLateMs: late, sheet }, null, 1));
process.exit(0);
