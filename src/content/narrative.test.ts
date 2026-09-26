/// <reference types="node" />
// The narrative audit's spacing and word rules (src/content/narrative.ts). Run: bun test src/content/narrative.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { adjacentSlots, adjacentUnit, clusterFirst, due, gemSeg, lettersLine, otherSound, positionName, rotate, specialWords, told, type Exposure } from "./narrative";
import { WORD_BY_TEXT } from "./phonics";

const segs = (w: string) => WORD_BY_TEXT[w].segs;

test("a concept is explained where first needed, the next level it comes up, then two levels on, then retires", () => {
  let e: Exposure | undefined;
  assert.equal(due(e, 10, "concept"), true);
  e = told(e, 10);
  assert.equal(due(e, 10, "concept"), false, "not twice in one level");
  assert.equal(due(e, 11, "concept"), true);
  e = told(e, 11);
  assert.equal(due(e, 12, "concept"), false);
  assert.equal(due(e, 13, "concept"), true);
  e = told(e, 13);
  assert.equal(due(e, 40, "concept"), false, "retired");
});

test("a special word: its page, the next page with it (same story), then a later story", () => {
  let e = told(undefined, 5);
  assert.equal(due(e, 5, "special"), true);
  e = told(e, 5);
  assert.equal(due(e, 5, "special"), false);
  assert.equal(due(e, 9, "special"), true);
  e = told(e, 9);
  assert.equal(due(e, 30, "special"), false);
});

test("once means once", () => {
  assert.equal(due(told(undefined, 1), 50, "once"), false);
});

test("two letters, one sound, in the teach.ts wording; < x > is two sounds together", () => {
  assert.equal(lettersLine({ g: "sh", p: "sh" }), "t_two_letters");
  assert.equal(lettersLine({ g: "tch", p: "ch" }), "t_three_letters");
  assert.equal(lettersLine({ g: "x", p: "ks" }), "t_one_spelling_two_sounds");
  assert.equal(lettersLine({ g: "m", p: "m" }), null);
});

test("th spells two sounds", () => {
  assert.equal(otherSound({ g: "th", p: "th" }), "dh");
  assert.equal(otherSound({ g: "th", p: "dh" }), "th");
  assert.equal(otherSound({ g: "sh", p: "sh" }), null);
});

test("adjacent consonant slots", () => {
  assert.deepEqual(adjacentSlots(segs("frog")), [0, 1]);
  assert.deepEqual(adjacentSlots(segs("stamp")), [0, 1, 3, 4]);
  assert.deepEqual(adjacentSlots(segs("mat")), []);
  assert.deepEqual(adjacentSlots(segs("chest")), [2, 3]);
  assert.equal(adjacentUnit([8, 9, 10]), 10);
  assert.equal(adjacentUnit([11]), null);
  const ws = ["tip", "fun", "must", "crisp"].map((w) => WORD_BY_TEXT[w]);
  assert.deepEqual(clusterFirst(ws, [8]).map((w) => w.text), ["must", "tip", "fun", "crisp"], "a cluster word goes first in units 8-10");
  assert.deepEqual(clusterFirst(ws, [7]).map((w) => w.text), ["tip", "fun", "must", "crisp"], "other units keep the draw");
});

test("a sound's place is named only where a young child can use the name", () => {
  assert.equal(positionName(0, 3), "first");
  assert.equal(positionName(1, 3), "middle");
  assert.equal(positionName(2, 3), "last");
  assert.equal(positionName(1, 2), "last");
  assert.equal(positionName(1, 4), null);
});

test("rotations never repeat the last item", () => {
  const list = ["a", "b", "c"];
  assert.equal(rotate(list, null), "a");
  assert.equal(rotate(list, "a"), "b");
  assert.equal(rotate(list, "c"), "a");
  assert.equal(rotate(list, "z"), "a");
});

test("special words are found in reading order, with their token index", () => {
  assert.deepEqual(specialWords("Peg the hen is in the fog."), [
    { word: "the", index: 1 },
    { word: "is", index: 3 },
    { word: "the", index: 5 },
  ]);
  assert.deepEqual(specialWords("Frog and I sit on the log."), [
    { word: "i", index: 2 },
    { word: "the", index: 5 },
  ]);
});

test("the gem shown is the level's new spelling when the word has one", () => {
  assert.equal(gemSeg(WORD_BY_TEXT["ship"], ["sh", "ch"]).g, "sh");
  assert.equal(gemSeg(WORD_BY_TEXT["ship"], []).g, "sh");
  assert.equal(gemSeg(WORD_BY_TEXT["bag"], ["g"]).g, "g");
});
