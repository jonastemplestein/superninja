// The map layout's geometry check (docs/MAP_DESIGN.md §9.2): for every land and every stone that could be the next
// one, lay the map out and measure. Exits 1 on any violation.
//   bun docs/map-design/final/check.ts [--json out.json]
// Checks, in stage px (1 stage px = 0.47–0.55 CSS px on the phones we test):
//   ninja×next   the ninja's box over the glowing stone's box, bounce included: must be 0 × 0
//   ninja×taps   how far any other tappable stone's tap circle reaches into the ninja's box: must be ≤ 0
//   ninja×seen   how far any other stone's visible disc reaches into the ninja's box: must be ≤ 0
//   next room    the gap from the glowing stone's tap circle to the nearest other tap circle (want ≥ 24)
//   ring         the glowing stone's tap circle (disc + NEXT_RING) must not reach the ninja's box
//   taps×taps    any two tap circles overlapping (must not)
//   hand         the hand's painted box over any other tap circle (must be ≤ 0), and inside the stage
//   zones        the ninja's box clear of the Help zone, the Home zone, the side column and the banner; the hand's box
//                clear of the Help zone, the Home zone and the side column
//   size         the glowing stone ≥ 56 CSS px at the smallest scale (667 × 375 touch: 0.4708)
import { writeFileSync } from "node:fs";
// @ts-ignore: plain script modules
import "./worlds.js";
// @ts-ignore
import L from "./layout.js";

const WORLDS = (globalThis as any).MAP_WORLDS as { id: number; name: string; levels: { id: string; kind: string }[] }[];
const out: any[] = [];
let bad = 0;
const fails: string[] = [];
const SIDE = { l: 1146, t: 110, r: 1280, b: 560 }, HELP = { l: 1116, t: 556, r: 1280, b: 720 }, HOME = { l: 0, t: 0, r: 124, b: 122 }, BANNER = { l: 240, t: 0, r: 1040, b: 110 };
const hits = (a: any, b: any) => L.rectOverlap(a, b).area > 0;
for (const w of WORLDS) {
  const n = w.levels.length;
  const worst = { ninjaNext: 0, ninjaTaps: -1e9, ninjaSeen: -1e9, room: 1e9, tapsTaps: -1e9, hand: -1e9, cssNext: 0, zones: 0 };
  for (let k = 0; k < n; k++) {
    const lay = L.layout(w.levels, (i: number) => (i < k ? "done" : i === k ? "next" : "locked"));
    const nx = lay.next, nj = lay.ninja, nb = L.nextBox(nx);
    const ov = L.rectOverlap(nj.box, nb);
    worst.ninjaNext = Math.max(worst.ninjaNext, ov.area);
    // and the glowing stone's tap circle (its disc plus NEXT_RING) must not reach the ninja's box either
    const ring = L.circleRectDepth(nx.x, nx.y, nx.hit / 2, nj.box);
    if (ring > 0) (bad++, fails.push(`${w.name} next ${nx.id}: the stone's tap circle reaches ${ring.toFixed(1)} px into the ninja's box`));
    for (const s of lay.stones) {
      if (s === nx) continue;
      const seen = L.circleRectDepth(s.x, s.y, s.size / 2, nj.box);
      worst.ninjaSeen = Math.max(worst.ninjaSeen, seen);
      if (s.hit) {
        worst.ninjaTaps = Math.max(worst.ninjaTaps, L.circleRectDepth(s.x, s.y, s.hit / 2, nj.box));
        worst.room = Math.min(worst.room, Math.hypot(s.x - nx.x, s.y - nx.y) - nx.hit / 2 - s.hit / 2);
      }
    }
    const taps = lay.stones.filter((s: any) => s.hit);
    for (let a = 0; a < taps.length; a++)
      for (let b = a + 1; b < taps.length; b++) worst.tapsTaps = Math.max(worst.tapsTaps, taps[a].hit / 2 + taps[b].hit / 2 - Math.hypot(taps[a].x - taps[b].x, taps[a].y - taps[b].y));
    worst.hand = Math.max(worst.hand, lay.hand.overlap);
    worst.cssNext = nx.size * L.MIN_SCALE;
    const z = [SIDE, HELP, HOME, BANNER].filter((zone) => hits(nj.box, zone)).length + (nj.box.l < 16 || nj.box.r > 1264 || nj.box.t < 0 ? 1 : 0)
      + [SIDE, HELP, HOME].filter((zone) => hits(lay.hand.box, zone)).length; // the hand too
    worst.zones += z;
    const row = { land: w.name, next: nx.id, rows: lay.type, ninja: nj.box, stone: nb, ninjaOverNext: `${ov.w}×${ov.h}`, hand: lay.hand.place, handOverlap: lay.hand.overlap };
    out.push(row);
    const why: string[] = [];
    if (ov.area > 0) why.push(`ninja over the stone ${ov.w}×${ov.h}`);
    if (z) why.push("the ninja or the hand in a reserved zone");
    if (lay.hand.overlap > 0) why.push(`hand over a stone by ${lay.hand.overlap}`);
    if (why.length) (bad++, fails.push(`${w.name} next ${nx.id}: ${why.join("; ")}`));
  }
  if (worst.ninjaTaps > 0 || worst.ninjaSeen > 0 || worst.tapsTaps > 0 || worst.cssNext < 56) (bad++, fails.push(`${w.name}: ninja×taps ${worst.ninjaTaps.toFixed(1)}, ninja×seen ${worst.ninjaSeen.toFixed(1)}, taps×taps ${worst.tapsTaps.toFixed(1)}, next ${worst.cssNext.toFixed(1)} CSS px`));
  console.log(
    `${w.name.padEnd(16)} n=${String(n).padStart(2)} rows=${L.rowCount(n)}  ninja×next max ${worst.ninjaNext} px²  ninja×taps ${worst.ninjaTaps.toFixed(1)}  ninja×seen ${worst.ninjaSeen.toFixed(1)}  next room ≥ ${worst.room.toFixed(1)}  taps×taps ${worst.tapsTaps.toFixed(1)}  hand ${worst.hand.toFixed(1)}  zones ${worst.zones}  next ${worst.cssNext.toFixed(1)} CSS px`,
  );
}
const j = process.argv.indexOf("--json");
if (j > 0) writeFileSync(process.argv[j + 1], JSON.stringify(out, null, 1));
console.log(bad ? `\n${bad} problem(s):\n${fails.join("\n")}` : `\nall ${out.length} layouts pass: the ninja never touches the glowing stone`);
process.exit(bad ? 1 : 0);
