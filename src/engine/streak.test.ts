/// <reference types="node" />
// The streak's spoken tier lines need whole answers (Dec2; src/engine/streak.ts). Run: bun test src/engine/streak.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

// streak.ts reads the save (engine/store.ts), which expects a browser: a minimal one
const mem = new Map<string, string>();
const g = globalThis as Record<string, unknown>;
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
g.document ??= { addEventListener() {}, visibilityState: "visible" };
g.window ??= globalThis;
g.addEventListener ??= () => {};
const { streak, tierLineId, tierLineEarned, LINE_AFTER } = await import("./streak");
const { store } = await import("./store");

const fresh = () => {
  streak.drop();
  streak.miss({ line: false });
  streak.reset();
};
test("Dec2: 10 letter hits and one answer → no tier-3 line (a silent power-up)", () => {
  fresh();
  for (let i = 0; i < 10; i++) streak.hit({ part: true, defer: true });
  streak.answer();
  assert.equal(streak.tier, 3);
  assert.equal(streak.answers, 1);
  assert.equal(tierLineId(3), null);
});
test("Dec2: seven whole answers → the tier-3 line, 'Ten in a row!…' once recorded", () => {
  fresh();
  for (let i = 0; i < 6; i++) streak.hit({ count: 1 });
  assert.equal(tierLineId(3), null, "six answers aren't enough");
  streak.hit();
  assert.equal(streak.answers, 7);
  assert.ok(["tv_streak_10", "streak_10"].includes(tierLineId(3) ?? ""), String(tierLineId(3)));
});
test("Dec2: tier 2's line needs four answers", () => {
  fresh();
  for (let i = 0; i < 6; i++) streak.hit({ part: true });
  streak.answer();
  streak.answer();
  streak.answer();
  assert.equal(tierLineId(2), null);
  streak.answer();
  assert.equal(tierLineId(2), "streak_6");
  assert.deepEqual([...LINE_AFTER], [0, 0, 4, 7]);
});
test("Dec2: a carried streak says no line before this level's first answer", () => {
  fresh();
  for (let i = 0; i < 9; i++) streak.hit();
  streak.bank();
  streak.reset();
  assert.equal(streak.n, 9, "the streak carries over");
  assert.equal(streak.answers, 9, "with its answers");
  assert.equal(streak.levelAnswers, 0);
  const e = streak.hit({ part: true });
  assert.equal(e.tierUp, true);
  assert.equal(tierLineId(3), null, "no answer in this level yet");
  streak.answer();
  assert.notEqual(tierLineId(3), null);
});
test("Dec2: a plain hit still counts as one answer; a miss starts the answers again", () => {
  fresh();
  store.set((s) => void (s.seenStreak = true));
  streak.hit({ count: 3 });
  assert.equal(streak.answers, 1);
  assert.equal(tierLineId(1), "streak_3");
  streak.miss({ line: false });
  assert.equal(streak.answers, 0);
  assert.equal(tierLineEarned(2, { answers: 3, levelAnswers: 3 }), false);
  assert.equal(tierLineEarned(2, { answers: 4, levelAnswers: 1 }), true);
});
