/// <reference types="node" />
// The World Flower v2's look mapping (docs/SCROLL_DESIGN.md §8.3), on the progress model's own simulated children
// (flower-children.fixture.json: playtest/runs/flower-v2/saves/export.ts, from src/content/progress.test.ts's simulator).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Save } from "../engine/store";
import { PETALS } from "../content/flower";
import { flowerOverview, multiSoundSpellings, petalProgress } from "../content/progress";
import { gemLook, petalLook, soundLineOf } from "./petalLook";
import KIDS from "./flower-children.fixture.json";

type Kid = { now: string; save?: unknown; same?: string };
const kids = KIDS as Record<string, Kid>;
export const childOf = (id: string): { save: Save; now: number } => {
  const k = kids[id];
  const save = (k.same ? kids[k.same].save : k.save) as Save;
  return { save, now: Date.parse(k.now) };
};
const IDS = ["new", "first", "reception", "year1", "away"];

describe("petalLook", () => {
  for (const id of IDS)
    test(`${id}: every petal's look agrees with the model`, () => {
      const { save, now } = childOf(id);
      for (const s of flowerOverview(save, { now }).petals) {
        const lk = petalLook(s);
        assert.equal(lk.stage === "missing", s.state === "missing");
        assert.equal(lk.stage === "complete", s.complete.full);
        assert.equal(lk.caught, s.state === "complete" && !s.complete.full);
        if (lk.stage === "filling") assert.equal(lk.level, s.whole);
        if (lk.stage === "complete") assert.equal(lk.level, 1);
        if (lk.matte) assert.equal(lk.stage, "complete");
      }
    });
  test("time never takes colour away: the away child has the year1 child's stages and levels", () => {
    const a = childOf("year1"), b = childOf("away");
    const x = flowerOverview(a.save, { now: a.now }).petals.map(petalLook);
    const y = flowerOverview(b.save, { now: b.now }).petals.map(petalLook);
    assert.deepEqual(y.map((l) => [l.stage, l.level]), x.map((l) => [l.stage, l.level]));
  });
});

describe("gemLook", () => {
  for (const id of IDS)
    test(`${id}: every gem's mark matches its stage`, () => {
      const { save, now } = childOf(id);
      const want = { unseen: "none", met: "glass", practising: "fill", ready: "ready", won: "won", mastered: "mastered" } as const;
      for (const pt of PETALS)
        for (const sp of petalProgress(save, pt.p, { now }).spellings) {
          const g = gemLook(sp);
          assert.equal(g.mark, want[sp.stage]);
          if (sp.stage === "mastered") assert.equal(g.polish, 1);
          assert.equal(g.dusty, sp.fading);
          assert.equal(g.pencil, sp.stage === "unseen");
        }
    });
});

describe("soundLineOf", () => {
  const { save, now } = childOf("year1");
  const multi = multiSoundSpellings(save, { now });
  test("th gives two segments on year1, this petal's sound first", () => {
    const a = soundLineOf("th", "th", multi), b = soundLineOf("th", "dh", multi);
    assert.deepEqual(a?.segments.map((s) => s.p), ["th", "dh"]);
    assert.deepEqual(b?.segments.map((s) => s.p), ["dh", "th"]);
    assert.equal(a!.segments.every((s) => !s.sure), true);
  });
  test("u gives none; x never", () => {
    assert.equal(soundLineOf("u", "u", multi), null);
    assert.equal(soundLineOf("u", "w", multi), null);
    assert.equal(soundLineOf("x", "k", multi), null);
  });
});
