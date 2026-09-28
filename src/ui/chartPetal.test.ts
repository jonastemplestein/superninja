/// <reference types="node" />
// The petal chart's pure helpers (docs/SCROLL_DESIGN.md §8.3): v1's fit invariants, the area-true level, the snap, and
// the half-sheets. Letters are measured with a fixed-width stand-in (Andika is about 0.5 em a letter); the invariants
// hold for any measure, since the fit checks every line against the shape with the measure it is given.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { CHART_PETALS, PETALS } from "../content/flower";
import { multiSoundSpellings, petalProgress } from "../content/progress";
import { BIG_DROP, CARD_FIT, CHART, PETAL_DROP, SHEET_FIT, fitColumn, halfOf, isMetLine, landingHalf, levelFromTop, lineBoxes, linesOf, snapLevel, type Drop, type FitOpts } from "./chartPetal";
import { childOf } from "./petalLook.test";

const measure = (s: string, px: number) => s.length * px * 0.46;
const IDS = ["first", "reception", "year1"];

describe("fitColumn", () => {
  const check = (drop: Drop, o: FitOpts, card: boolean) => {
    for (const id of IDS) {
      const { save, now } = childOf(id);
      const multi = multiSoundSpellings(save, { now });
      for (const pt of PETALS) {
        const pr = petalProgress(save, pt.p, { now });
        if (pr.state === "missing") continue;
        const lines = linesOf(pr, multi);
        const f = fitColumn(lines, drop, o, measure);
        const boxes = lineBoxes(lines, f, card);
        assert.ok(f.F >= o.Fmin, `${f.F} ≥ ${o.Fmin}`);
        // no line below the bottom
        assert.ok(boxes[boxes.length - 1][1] <= o.bottom + f.gap + 1, `${boxes[boxes.length - 1][1]} ≤ ${o.bottom + f.gap + 1}`);
        // every line inside the teardrop (its middle), with its mark
        lines.forEach((ln, i) => {
          const [a, b] = boxes[i];
          const px = ln.hint ? Math.min(f.F, f.M * 0.6) : isMetLine(ln) ? f.M : f.F;
          const w = measure(ln.hint ? `“${ln.g}”` : ln.g, px) + (card ? 28 : 0);
          const h = b - a;
          const avail = Math.min(drop.half(a + h * 0.15), drop.half(a + h * 0.9)) - o.pad;
          // (the card lays met lines out at 1.14 M where the fit counts 1.12 M, as the mockup does: a line or two lower)
          assert.ok(w / 2 <= avail + (card ? 2 : 1), `${w / 2} ≤ ${avail + (card ? 2 : 1)}`);
        });
      }
    }
  };
  test("every chart petal's lines fit inside its teardrop, F ≥ 22", () => check(PETAL_DROP, SHEET_FIT, false));
  test("every card's lines fit inside its big teardrop, F ≥ 34", () => check(BIG_DROP, CARD_FIT, true));
});

describe("levelFromTop", () => {
  const area = (drop: Drop, lv: number) => {
    let a = 0, all = 0;
    for (let y = 0; y < drop.H; y++) {
      all += 2 * drop.t[y];
      if (y < lv * drop.H) a += 2 * drop.t[y];
    }
    return a / all;
  };
  test("monotonic and true to area (±1 %)", () => {
    const L = levelFromTop(PETAL_DROP);
    let prev = 0;
    for (let f = 0.02; f < 1; f += 0.02) {
      const lv = L(f);
      assert.ok(lv >= prev, `${lv} ≥ ${prev}`);
      prev = lv;
      assert.ok(Math.abs(area(PETAL_DROP, lv) - f) < 0.01, `${Math.abs(area(PETAL_DROP, lv) - f)} < ${0.01}`);
    }
  });
});

describe("snapLevel", () => {
  test("never inside a line; a won line straddled is in; pencil never coloured; within two lines of the real level", () => {
    for (const id of IDS) {
      const { save, now } = childOf(id);
      const multi = multiSoundSpellings(save, { now });
      const H = CHART.petal.h;
      const check = (lines: ReturnType<typeof linesOf>, boxes: [number, number][], lv: number, gap: number, real: boolean) => {
        const s = snapLevel(lv, boxes, H, lines) * H;
        for (const [a, b] of boxes) assert.equal(s > a + 0.5 && s < b - 0.5, false);
        boxes.forEach(([a, b], i) => {
          const mk = lines[i].look?.mark;
          if ((mk === "won" || mk === "mastered") && lv * H > a && lv * H < b) assert.ok(s >= b - 0.5, `${s} ≥ ${b - 0.5}`);
        });
        // the line just above the surface is never a pencil one (a spelling still to find is left out of the colour)
        const above = boxes.map(([, b]) => b <= s + 0.5).lastIndexOf(true);
        if (above >= 0 && s > 0) assert.equal(!lines[above].hint && !isMetLine(lines[above]), false);
        if (real) {
          const tall = Math.max(...boxes.map(([a, b]) => b - a)) + gap;
          assert.ok(Math.abs(s - lv * H) <= 2 * tall + 1, `${Math.abs(s - lv * H)} ≤ ${2 * tall + 1}`);
        }
      };
      for (const pt of PETALS) {
        const pr = petalProgress(save, pt.p, { now });
        if (pr.state === "missing") continue;
        const lines = linesOf(pr, multi);
        const f = fitColumn(lines, PETAL_DROP, SHEET_FIT, measure);
        const boxes = lineBoxes(lines, f);
        if (pr.whole > 0.004 && !pr.complete.full) check(lines, boxes, levelFromTop(PETAL_DROP)(pr.whole), f.gap, true);
        for (let lv = 0.05; lv < 1; lv += 0.05) check(lines, boxes, lv, f.gap, false);
      }
    }
  });
});

describe("the half-sheets", () => {
  test("halfOf maps the 44 petals to 6 half-sheets, 8 at most each", () => {
    const n = [0, 0, 0, 0, 0, 0];
    for (const c of CHART_PETALS) n[halfOf(c.p)]++;
    assert.equal(n.reduce((a, b) => a + b), 44);
    assert.ok(Math.max(...n) <= 8, `${Math.max(...n)} ≤ ${8}`);
  });
  test("landingHalf: a landing, then a trip's gem, then the first ready petal, then the newest", () => {
    const ready = (p: string) => p === "e";
    assert.equal(landingHalf({ landing: "ee", focus: "s", ready }), halfOf("ee"));
    assert.equal(landingHalf({ focus: "s", ready }), halfOf("s"));
    assert.equal(landingHalf({ ready }), halfOf("e"));
    assert.equal(landingHalf({ ready: () => false, newest: "oe" }), halfOf("oe"));
    assert.equal(landingHalf({ ready: () => false }), 0);
  });
});
