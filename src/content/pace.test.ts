/// <reference types="node" />
// Pace follows mastery (src/content/pace.ts). Run: bun test src/content/pace.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { EARLY_PACE, nextItem, onTrack, ownWords, type PaceItem } from "./pace";

const build: PaceItem[] = [{ mode: "ido" }, { mode: "wedo" }, { mode: "wedo", optional: true }, { mode: "youdo" }, { mode: "youdo" }, { mode: "youdo" }, { mode: "youdo" }];

test("no pace, or a child who slips: every item plays", () => {
  assert.equal(nextItem(null, "build", build, 2, { answers: 1, firstTry: 1 }, { firstTry: 1, ownFirstTry: 0 }, 10), 2);
  assert.equal(nextItem(EARLY_PACE, "build", build, 2, { answers: 2, firstTry: 1 }, { firstTry: 1, ownFirstTry: 0 }, 10), 2);
  assert.equal(onTrack(EARLY_PACE, { answers: 0, firstTry: 0 }), false);
  assert.equal(onTrack(EARLY_PACE, { answers: 5, firstTry: 4 }), true);
});

test("a child on track skips the second word together, then stops after three words right first time", () => {
  // after the first word together, right first time: the optional second one is skipped
  assert.equal(nextItem(EARLY_PACE, "build", build, 2, { answers: 1, firstTry: 1 }, { firstTry: 1, ownFirstTry: 0 }, 40), 3);
  // two right alone, three in all: the phase is done
  assert.equal(nextItem(EARLY_PACE, "build", build, 5, { answers: 3, firstTry: 3 }, { firstTry: 3, ownFirstTry: 2 }, 80), build.length);
  // three in all but none alone yet: keep going
  assert.equal(nextItem(EARLY_PACE, "build", build, 3, { answers: 3, firstTry: 3 }, { firstTry: 3, ownFirstTry: 0 }, 80), 3);
});

test("past the cap, a child on track finishes a phase once one item alone was right first time", () => {
  assert.equal(nextItem(EARLY_PACE, "build", build, 4, { answers: 2, firstTry: 2 }, { firstTry: 2, ownFirstTry: 1 }, 121), build.length);
  assert.equal(nextItem(EARLY_PACE, "read", [{ mode: "youdo" }, { mode: "youdo" }], 1, { answers: 4, firstTry: 4 }, { firstTry: 1, ownFirstTry: 1 }, 50), 2);
  // picking games only skip what is optional
  const pick: PaceItem[] = [{ mode: "youdo" }, { mode: "youdo", optional: true }, { mode: "ido" }];
  assert.equal(nextItem(EARLY_PACE, "pick", pick, 1, { answers: 2, firstTry: 2 }, { firstTry: 2, ownFirstTry: 2 }, 200), 2);
});

test("a build phase with a reading check to come stops sooner, so the level ends near the cap", () => {
  const t = { answers: 2, firstTry: 2 }, ph = { firstTry: 2, ownFirstTry: 1 };
  assert.equal(nextItem(EARLY_PACE, "build", build, 4, t, ph, 100, true), build.length);
  assert.equal(nextItem(EARLY_PACE, "build", build, 4, t, ph, 100, false), 4);
});

test("words built alone: new words first, never the same twice running", () => {
  assert.deepEqual(ownWords(["an", "in", "nap", "pan"], ["an"], 4), ["in", "nap", "pan", "an"]);
  assert.deepEqual(ownWords(["am", "at"], ["am", "at"], 4), ["am", "at", "am", "at"]);
  assert.deepEqual(ownWords(["it"], ["it"], 3), ["it", "it", "it"]);
});
