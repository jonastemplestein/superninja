/// <reference types="node" />
// The jump-ahead offer (Dec9, SCRIPT_FIXES A8; src/engine/gems.ts). Run: bun test src/engine/gems.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

const mem = new Map<string, string>();
const g = globalThis as Record<string, unknown>;
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
g.document ??= { addEventListener() {}, visibilityState: "visible" };
g.window ??= globalThis;
g.addEventListener ??= () => {};
const { shouldOfferJump, JUMP_OFFER } = await import("./gems");
const { store } = await import("./store");

/** A child who got three stars on the first three levels, in session `n`. */
const perfectIn = (n: number, levels = ["w1-wu1", "w1-wu2", "w1-wu3"]) =>
  store.set((s) => {
    s.sessions = n;
    for (const id of levels) s.stars[id] = 3;
  });

test("Dec9: no jump offer in sessions 1–2; one in 3 (recorded as made); none in 4; one again in 5", () => {
  store.reset();
  perfectIn(1);
  assert.equal(shouldOfferJump(), false, "session 1");
  perfectIn(2);
  assert.equal(shouldOfferJump(), false, "session 2");
  perfectIn(3);
  assert.equal(shouldOfferJump(), true, "session 3");
  assert.deepEqual((store.get() as { narr?: Record<string, { s?: number[] }> }).narr?.[JUMP_OFFER]?.s, [3], "recorded with its session");
  assert.equal(shouldOfferJump(), true, "the same reward asked again gives the same answer");
  perfectIn(3, ["w1-wu4"]);
  assert.equal(shouldOfferJump(), false, "at most once a session");
  perfectIn(4, ["w1-wu5"]);
  assert.equal(shouldOfferJump(), false, "session 4: resting");
  perfectIn(5, ["w1-wu6"]);
  assert.equal(shouldOfferJump(), true, "session 5");
});
test("the offer still needs three perfect levels in a row", () => {
  store.reset();
  store.set((s) => {
    s.sessions = 9;
    s.stars["w1-wu1"] = 3;
    s.stars["w1-wu2"] = 2;
    s.stars["w1-wu3"] = 3;
  });
  assert.equal(shouldOfferJump(), false);
});
