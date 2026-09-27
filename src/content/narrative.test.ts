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

// ---------------------------------------------------------------- SCRIPT_FIXES A1–A9 (docs/SCRIPT_FIXES.md Part A)
import {
  SESSIONS, afterWord, arrivalLines, dueInSessions, fadeForm, freshWords, jumpOfferDue, lettersForm, praiseDue, rewardLead, runBlendCue,
  splitsSpelling, stemFor, STEMS, RUN_BLEND_CUES, LISTEN_AGAIN, frameForm, recapHold, openingForm, GAME_REFRESH_MS, type GameExposure, type LettersSaid,
} from "./narrative";
import { GAMES, GAME_IDS, GAMES_MIGRATED, demoLines, fillLine, framedEntry, gamesOfLevel, levelWrap, migrateGames, openingLines, playedEntry, playsDemo, previewOf, readyLine, type GameId } from "./games";
const GAMES_ENTRY = { framedEntry, playedEntry };
import { LEVELS } from "./worlds";
import { LINES, RETIRED_LINES } from "./lines";

test("A1: spacing in sessions: told in 4 → not again in 4, due in 5; three tellings retire it; an old exposure is due", () => {
  let e: Exposure | undefined = told(undefined, 10, 4);
  assert.deepEqual(e.s, [4]);
  assert.equal(dueInSessions(e, 4, SESSIONS.reminder), false, "not twice in one session");
  assert.equal(dueInSessions(e, 5, SESSIONS.reminder), true);
  e = told(e, 11, 5);
  assert.equal(dueInSessions(e, 5, SESSIONS.reminder), false);
  assert.equal(dueInSessions(e, 6, SESSIONS.reminder), true);
  e = told(e, 12, 6);
  assert.equal(dueInSessions(e, 30, SESSIONS.reminder), false, "retired after three tellings");
  assert.equal(dueInSessions({ n: 1, at: [3] }, 9, SESSIONS.reminder), true, "an old exposure (no sessions) gets one more telling");
  assert.equal(dueInSessions(undefined, 1, SESSIONS.reminder), true);
  assert.deepEqual(told(undefined, 2).s, [], "no session given: none recorded");
});

test("A1: told keeps a game's own fields", () => {
  const e = told<GameExposure>({ n: 1, at: [1], s: [1], lastAt: 5, struggled: true }, 2, 2);
  assert.equal(e.n, 2);
  assert.equal(e.lastAt, 5);
  assert.equal(e.struggled, true);
});

const ago = (ms: number, form: LettersSaid["form"] = "full", n = 2): LettersSaid => ({ at: 1_000_000 - ms, form, n });
test("A2: the letters line at a teach moment: full, then 'too', then none; three letters always in full", () => {
  const now = 1_000_000;
  assert.equal(lettersForm({ g: "sh", p: "sh" }, [], now), "full", "nothing recent");
  assert.equal(lettersForm({ g: "ch", p: "ch" }, [ago(15_000)], now), "too", "a two-letter full 15 s ago");
  assert.equal(lettersForm({ g: "th", p: "th" }, [ago(15_000), ago(5_000, "too")], now), "none", "full 15 s and too 5 s ago");
  assert.equal(lettersForm({ g: "th", p: "th" }, [ago(180_000)], now), "full", "full 3 minutes ago");
  assert.equal(lettersForm({ g: "tch", p: "ch" }, [ago(15_000), ago(5_000, "too")], now), "full", "< tch > is always said in full");
  assert.equal(lettersForm({ g: "ie", p: "ie" }, [ago(20_000, "full", 3)], now), "full", "< ie > 20 s after < igh >");
  assert.equal(lettersForm({ g: "x", p: "ks" }, [ago(5_000)], now), "full", "< x > is two sounds, its own news");
});

test("A3: a wrong tile that splits a two-letter spelling", () => {
  assert.equal(splitsSpelling("s", { g: "sh" }), true);
  assert.equal(splitsSpelling("h", { g: "sh" }), true);
  assert.equal(splitsSpelling("a", { g: "ai" }), true);
  assert.equal(splitsSpelling("ch", { g: "tch" }), true);
  assert.equal(splitsSpelling("t", { g: "sh" }), false);
  assert.equal(splitsSpelling("sh", { g: "sh" }), false);
  assert.equal(splitsSpelling("k", { g: "x" }), false);
  assert.equal(splitsSpelling("a", { g: "a-e" }), true, "a split digraph's letter");
});

test("A4: praise every second right answer, never replaced, never before the closing line; warm-ups every third", () => {
  assert.equal(praiseDue({ rightSincePraise: 0 }), false);
  assert.equal(praiseDue({ rightSincePraise: 1 }), true);
  assert.equal(praiseDue({ rightSincePraise: 1, replaced: true }), false);
  assert.equal(praiseDue({ rightSincePraise: 5, closingNext: true }), false);
  assert.equal(praiseDue({ rightSincePraise: 1, every: 3 }), false);
  assert.equal(praiseDue({ rightSincePraise: 2, every: 3 }), true);
});

test("A5: question stems rotate after the first two items; one recorded stem is always used", () => {
  const all = () => true;
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => stemFor(STEMS.first, n, all)), ["first_q", "first_q", "st_first_q2", "st_first_q3", "first_q"]);
  assert.deepEqual([0, 3, 4].map((n) => stemFor(STEMS.first, n, (id) => id === "first_q")), ["first_q", "first_q", "first_q"]);
  // never more than three times running
  const seq = Array.from({ length: 12 }, (_, n) => stemFor(STEMS.write, n, all));
  for (let i = 3; i < seq.length; i++) assert.ok(!(seq[i] === seq[i - 1] && seq[i] === seq[i - 2] && seq[i] === seq[i - 3]), seq.join());
});

test("A6: instructions fade after two first tries in a row", () => {
  assert.equal(fadeForm(0), "full");
  assert.equal(fadeForm(1), "full");
  assert.equal(fadeForm(2), "short");
  assert.equal(fadeForm(3, 3), "short");
});

test("A7: after a word, at most one thing", () => {
  const base = { tierUp: false, leftRight: false, reminder: false, gemFirst: false, praise: false };
  assert.deepEqual(afterWord({ ...base, praise: true }), { say: "praise", defer: [] });
  assert.deepEqual(afterWord({ ...base, reminder: true, praise: true }), { say: "reminder", defer: [] });
  assert.deepEqual(afterWord({ ...base, tierUp: true, reminder: true }), { say: null, defer: ["reminder"] });
  assert.deepEqual(afterWord({ ...base, leftRight: true, gemFirst: true }), { say: null, defer: ["gem-first"] });
  assert.deepEqual(afterWord({ ...base, reminder: true, gemFirst: true, praise: true }), { say: "reminder", defer: ["gem-first"] });
});

test("A8: the map says the land's welcome once, the hint on two visits, a preview in its place", () => {
  assert.deepEqual(arrivalLines({ world: 1, welcomed: 1, lead: null, hintsSaid: 2 }), [], "after a level in the same land");
  assert.deepEqual(arrivalLines({ world: 2, welcomed: 1, lead: null, hintsSaid: 2 }), ["world_2"], "a new land");
  assert.deepEqual(arrivalLines({ world: 1, welcomed: null, lead: "tv_welcome_back", hintsSaid: 0 }), ["tv_welcome_back", "map_hint"]);
  assert.deepEqual(arrivalLines({ world: 1, welcomed: 1, lead: null, hintsSaid: 1, has: () => true }), ["tv_map_hint"]);
  assert.deepEqual(arrivalLines({ world: 1, welcomed: 1, lead: null, hintsSaid: 0, preview: "tv_map_next_sounds" }), ["tv_map_next_sounds"], "the preview says to tap the stone");
});

test("A8: the reward leads with its news; 'You did it!' only when the level had no closing line", () => {
  const r = { closingSaid: true, boss: false, newPetals: 0, lastInWorld: false, finale: false };
  assert.deepEqual(rewardLead(r), [], "after a dojo with its closing line");
  assert.deepEqual(rewardLead({ ...r, closingSaid: false }), ["yay_7"]);
  assert.deepEqual(rewardLead({ ...r, boss: true, lastInWorld: true }), ["battle_boss_win", "world_done"]);
  assert.deepEqual(rewardLead({ ...r, newPetals: 1 }), ["petal_got"]);
  assert.deepEqual(rewardLead({ ...r, newPetals: 2 }), ["petals_got"]);
  const has = () => true;
  assert.deepEqual(rewardLead({ ...r, newPetals: 1, toReward: true, has }), ["tv_to_reward", "tv_won_one"], "counted as sounds (Dec8)");
  assert.deepEqual(rewardLead({ ...r, newPetals: 3, has }), ["tv_won_three"]);
  assert.deepEqual(rewardLead({ ...r, newPetals: 6, has }), ["petals_got"], "past four: 'some sounds'");
});

test("A8/Dec9: the jump offer: never in the first two sessions, then once with two sessions' rest", () => {
  assert.equal(jumpOfferDue(undefined, 1), false);
  assert.equal(jumpOfferDue(undefined, 2), false);
  assert.equal(jumpOfferDue(undefined, 3), true);
  const offered = told(undefined, 0, 3);
  assert.equal(jumpOfferDue(offered, 3), false, "once a session");
  assert.equal(jumpOfferDue(offered, 4), false, "two sessions' rest");
  assert.equal(jumpOfferDue(offered, 5), true);
});

test("A9: example words not already used on this screen", () => {
  const ws = ["mat", "man", "map", "pan"].map((text) => ({ text }));
  assert.deepEqual(freshWords(ws, new Set(["mat"])).map((w) => w.text), ["man", "map", "pan"]);
  assert.deepEqual(freshWords(ws, new Set(["man"]), 2).map((w) => w.text), ["mat", "map"]);
});

test("C16: Ninja Run's cue: 'Listen for the word…' for groups 1–3, then the sounds alone; no t_listen_for_word", () => {
  assert.ok(!(RUN_BLEND_CUES as readonly string[]).includes("t_listen_for_word"));
  const has = (id: string) => id === "tv_guess_q";
  assert.deepEqual([0, 1, 2, 3, 4].map((i) => runBlendCue(i, has)), ["tv_guess_q", "tv_guess_q", "tv_guess_q", null, null]);
  assert.equal(runBlendCue(1, () => false, "run_blend"), "audit_sounds_again", "rotated until tv_guess_q is recorded");
});

test("TS §5.4: 'Let's listen again…' leads the correction rotation", () => {
  assert.equal(LISTEN_AGAIN.stretched[0], "tv_listen_here");
  assert.ok(!(LISTEN_AGAIN.plain as readonly string[]).includes("listen_again"));
});

// ---------------------------------------------------------------- TV-F2.3: full, recap, short, none (TEACHER_SCRIPT §2.2)
const DAY = 86_400_000;
const NOW = 100 * DAY;
test("TV-F2.3: nothing → full", () => {
  assert.equal(frameForm(undefined, 1, NOW), "full");
  assert.equal(frameForm({ n: 0, at: [] }, 1, NOW), "full");
});
test("TV-F2.3: told in session 1, played again in 1 → none (and a level opens on the short line)", () => {
  const e: GameExposure = { n: 1, at: [0], s: [1], lastAt: NOW, lastSession: 1 };
  assert.equal(frameForm(e, 1, NOW), "none");
  assert.equal(openingForm(frameForm(e, 1, NOW)), "short");
});
test("TV-F2.3: first play in session 2 → recap, with no Ready hold", () => {
  const e: GameExposure = { n: 1, at: [0], s: [1], lastAt: NOW - DAY, lastSession: 1 };
  assert.equal(frameForm(e, 2, NOW), "recap");
  assert.equal(recapHold(e, NOW), false);
});
test("TV-F2.3: told in 1 and 2 → short in 3, none later in 3", () => {
  const e: GameExposure = { n: 2, at: [0, 3], s: [1, 2], lastAt: NOW - DAY, lastSession: 2 };
  assert.equal(frameForm(e, 3, NOW), "short");
  assert.equal(frameForm({ ...e, lastSession: 3, lastAt: NOW }, 3, NOW), "none");
});
test("TV-F2.3: not played for 22 days → recap, with a Ready hold", () => {
  const e: GameExposure = { n: 2, at: [0, 3], s: [1, 2], lastAt: NOW - 22 * DAY, lastSession: 2 };
  assert.equal(frameForm(e, 9, NOW), "recap");
  assert.equal(recapHold(e, NOW), true);
  assert.equal(frameForm({ ...e, lastAt: NOW - GAME_REFRESH_MS + DAY }, 9, NOW), "short", "20 days is fine");
});
test("TV-F2.3: struggled last time → recap, with a Ready hold", () => {
  const e: GameExposure = { n: 2, at: [0, 3], s: [1, 2], lastAt: NOW, lastSession: 3, struggled: true };
  assert.equal(frameForm(e, 3, NOW), "recap");
  assert.equal(recapHold(e, NOW), true);
});
test("TV-F2.3: an old save's migrated entry plays short", () => {
  assert.equal(frameForm({ n: 2, at: [], s: [0, 0], lastSession: -1 }, 7, NOW), "short");
});

// ---------------------------------------------------------------- TV-F2.2: the registry (TEACHER_SCRIPT §4.1)
const LINE_IDS = new Set(LINES.map((l) => l.id));
test("TV-F2.2: every game type has a registry entry that says who does what", () => {
  const expected: GameId[] = ["tap", "fastslow", "notice", "tapall", "tapall:in", "rail", "which", "compound", "slowpick", "sounds", "dots", "firstsound", "find", "soundhunt", "build", "readcheck", "learn", "battle", "boss", "trial", "review", "swap", "sort", "run", "story"];
  assert.deepEqual([...GAME_IDS].sort(), [...expected].sort());
  for (const id of GAME_IDS) {
    const g = GAMES[id];
    assert.equal(g.id, id);
    assert.ok(g.full.frame.length > 0, `${id}: a frame`);
    assert.ok(g.full.show === null || g.full.demo[0] === g.full.show, `${id}: the demo starts with its show line`);
    for (const l of [...g.full.frame, ...g.full.demo, ...g.recap.line, ...g.short, ...(g.full.ready ? [g.full.ready] : [])])
      assert.ok(/^(tv_|st_|audit_|fm_|t_|battle_|run_|story_|trial_)/.test(l), `${id}: ${l} is a teacher-voice or kept line`);
  }
  // "Which Row" and "Who Read It Right" are never said aloud (TS §2.6)
  assert.equal(GAMES.which.name, null);
  assert.equal(GAMES.readcheck.name, null);
  // the Ready sits in the column where the letters or chests fill the nav row
  for (const id of ["battle", "boss", "trial", "review", "sort", "story"] as GameId[]) assert.equal(GAMES[id].readyAt, "column", id);
  // the paw never answers for the child: no canonical demo where it would take one of the turn's answers
  for (const id of ["tap", "tapall", "tapall:in", "firstsound", "soundhunt"] as GameId[]) assert.equal(GAMES[id].demoOwnPictures, false, id);
  // twelve map previews (TS §5.8)
  assert.equal(GAME_IDS.filter((id) => GAMES[id].mapPreview).length, 12);
  for (const id of GAME_IDS) if (GAMES[id].mapPreview) assert.equal(GAMES[id].mapPreview, `tv_map_next_${id}`);
  // kept lines the registry uses exist today
  for (const l of ["audit_bridging_first", "audit_sort_again", "fm_l6_done", "t_if_you_say_sounds", "battle_win", "battle_boss_win", "trial_win", "run_end", "story_end"]) assert.ok(LINE_IDS.has(l), l);
});

test("TV-F2.2: line families fill their slots", () => {
  assert.equal(fillLine("tv_pocket_ready_<n>", { n: 2 }), "tv_pocket_ready_two");
  assert.equal(fillLine("tv_pocket_more_<p>", { p: "s" }), "tv_pocket_more_s");
  assert.equal(fillLine("tv_map_next_<game>", { game: "tapall:in" }), "tv_map_next_tapall_in");
  assert.equal(fillLine("tv_learn_frame_<n>", {}), "tv_learn_frame_<n>", "an empty slot stays (the HAS guard skips it)");
  assert.deepEqual(openingLines(GAMES.learn, "full", { n: 4 }), ["tv_learn_frame_four", "tv_learn_how"]);
  assert.deepEqual(openingLines(GAMES.firstsound, "short", {}, "known"), ["tv_first_again_known"]);
  assert.deepEqual(openingLines(GAMES.tap, "none"), []);
  assert.equal(playsDemo(GAMES.which, "full"), true);
  assert.equal(playsDemo(GAMES.which, "short"), false);
  assert.equal(playsDemo(GAMES.battle, "recap"), false);
});

test("TV-F2.2: the Ready: the save's first two, the game's own, a recap only after a break, starting guns", () => {
  const fresh = { readyFirstDone: false, readyPawDone: false };
  assert.deepEqual(readyLine(GAMES.tap, "full", fresh), { line: "tv_ready_first", once: "ready:first" });
  assert.deepEqual(readyLine(GAMES.fastslow, "full", { readyFirstDone: true, readyPawDone: false }), { line: "tv_ready_paw", once: "ready:paw" });
  assert.deepEqual(readyLine(GAMES.which, "full", { readyFirstDone: true, readyPawDone: true }), { line: "tv_ready_go" });
  assert.deepEqual(readyLine(GAMES.tapall, "full", { ...fresh, slots: { n: 2 } }), { line: "tv_pocket_ready_two" }, "a hand-over Ready keeps its own line");
  assert.equal(GAMES.tapall.full.handover, true);
  assert.equal(readyLine(GAMES.find, "full", fresh), null, "Ninja Eyes: no Ready (its first item is a we do)");
  assert.equal(readyLine(GAMES.slowpick, "recap", { recapHeld: false }), null, "an ordinary recap has no hold");
  assert.deepEqual(readyLine(GAMES.slowpick, "recap", { recapHeld: true }), { line: "tv_ready_go" });
  assert.deepEqual(readyLine(GAMES.battle, "recap"), { line: "tv_battle_go" }, "a Monster Battle's recap: the starting gun");
  assert.equal(readyLine(GAMES.battle, "short"), null, "its short form wakes the letters as the line ends");
  assert.deepEqual(readyLine(GAMES.run, "short"), { line: "tv_run_again" }, "every run keeps its starting gun");
  assert.deepEqual(readyLine(GAMES.learn, "recap"), { line: "tv_learn_ready" });
  assert.equal(readyLine(GAMES.learn, "short"), null);
  assert.equal(GAMES.swap.full.readyBefore, "tv_ready_to_watch");
});

const lv = (id: string) => LEVELS.find((l) => l.id === id)!;
test("TV-F2.2: the games a level plays, and the map's preview", () => {
  assert.deepEqual(gamesOfLevel(lv("w1-wu1")), ["tap", "fastslow", "notice", "tapall"]);
  assert.deepEqual(gamesOfLevel(lv("w1-wu3")), ["fastslow", "slowpick", "tapall:in", "tapall"]);
  assert.deepEqual(gamesOfLevel(lv("w1-2")), ["firstsound", "find"]);
  assert.deepEqual(gamesOfLevel(lv("w1-4")), ["build", "readcheck"]);
  assert.deepEqual(gamesOfLevel(lv("w1-7")), ["soundhunt", "build", "readcheck"]);
  assert.deepEqual(gamesOfLevel(lv("w2-1")), ["learn", "find", "build"]);
  const all = () => true;
  assert.equal(previewOf(lv("w1-wu3"), all), null, "W3 has no preview (they start at W5)");
  assert.equal(previewOf(lv("w1-wu5"), all)?.line, "tv_map_next_sounds");
  assert.equal(previewOf(lv("w1-4"), all)?.line, "tv_map_next_build");
  assert.equal(previewOf(lv("w2-1"), all)?.line, "tv_map_next_learn");
  assert.deepEqual(gamesOfLevel(lv("w1-10")), ["firstsound", "find", "build"]);
  assert.equal(previewOf(lv("w1-10"), (id) => !["firstsound", "build"].includes(id)), null, "known games: no preview");
});

test("TV-F2.2 (gate fix): the demo each form plays; the rabbit and the tortoise's recap; the three games with no Ready", () => {
  assert.deepEqual(GAME_IDS.filter((id) => GAMES[id].full.ready === null).sort(), ["find", "notice", "readcheck"]);
  // TS §4.1: `tv_ts_again` + `fm_name_<w>` + `tv_ts_slow_one`, and the short form "as recap" (§3.9 A)
  assert.deepEqual(openingLines(GAMES.fastslow, "recap", { w: "mug" }), ["tv_ts_again", "fm_name_mug"]);
  assert.deepEqual(demoLines(GAMES.fastslow, "recap", { w: "mug" }), ["tv_ts_slow_one"]);
  assert.deepEqual(openingLines(GAMES.fastslow, "short", { w: "mug" }), ["tv_ts_again", "fm_name_mug"]);
  assert.equal(playsDemo(GAMES.fastslow, "short"), true);
  assert.deepEqual(demoLines(GAMES.fastslow, "short"), ["tv_ts_slow_one"]);
  assert.deepEqual(demoLines(GAMES.fastslow, "full"), ["tv_ts_fast", "tv_ts_slow"]);
  assert.deepEqual(demoLines(GAMES.slowpick, "recap", { w: "mug" }), ["tv_slow_demo", "tv_i_hear_mug"], "a recap without its own demo replays the full form's");
  assert.deepEqual(demoLines(GAMES.slowpick, "short"), [], "a short form: only the paw's replay");
  assert.deepEqual(demoLines(GAMES.battle, "recap"), []);
  assert.deepEqual(demoLines(GAMES.which, "none"), []);
  for (const l of ["tv_ts_again", "tv_ts_slow_one", "fm_name_mug"]) assert.ok(LINE_IDS.has(l), l);
});

test("TV-F2.2 (gate fix): a level closes once, on TS §5.6's line; no close belongs to two games", () => {
  for (const id of ["tap", "fastslow", "notice", "tapall", "tapall:in", "rail", "which", "compound", "slowpick", "sounds", "dots", "find", "readcheck"] as GameId[])
    assert.equal(GAMES[id].wrap, undefined, `${id}: no wrap of its own`);
  const wraps = GAME_IDS.flatMap((id) => GAMES[id].wrap ?? []);
  assert.equal(new Set(wraps).size, wraps.length, "no close belongs to two games");
  assert.deepEqual(levelWrap(lv("w1-wu1")), [], "a warm-up closes on its done beat");
  assert.deepEqual(levelWrap(lv("w1-2")), ["tv_first_done"], "First Sounds and its Ninja Eyes");
  assert.deepEqual(levelWrap(lv("w1-10")), ["tv_first_done"]);
  assert.deepEqual(levelWrap(lv("w1-4")), ["tv_build_done"], "an early Word Building level");
  assert.deepEqual(levelWrap(lv("w1-7")), ["tv_hunt_done"], "Sound Hunt, after its build and reading check");
  assert.deepEqual(levelWrap(lv("w1-6")), ["battle_win"]);
  assert.deepEqual(levelWrap(lv("w1-8")), ["tv_swap_done"]);
  assert.deepEqual(levelWrap(lv("w1-15")), ["battle_boss_win"]);
  assert.deepEqual(levelWrap(lv("w2-1")), ["tv_learn_done"], "New Sounds, after the build");
  assert.deepEqual(levelWrap(lv("w3-10")), ["tv_dojo_review_done"], "a dojo with no new sounds");
  for (const l of LEVELS) for (const id of levelWrap(l)) assert.ok(LINE_IDS.has(id), `${l.id}: ${id}`);
});

test("TV-F2 (gate fix): every stem set is whole sentences: no clipped order, nothing retired", () => {
  assert.deepEqual(Object.keys(STEMS).sort(), ["first", "write"], "the Dojo's Ninja Eyes uses `write` (TS §3.26 B)");
  const text = new Map(LINES.map((l) => [l.id, l.text]));
  for (const [k, ids] of Object.entries(STEMS)) for (const id of ids) {
    assert.ok(!(id in RETIRED_LINES), `${k}: ${id} is retired`);
    const words = (text.get(id) ?? "").replace(/\.\.\.|…/g, " ").split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 4, `${k}: ${id} is ${words} words (script-audit's bare-command)`);
  }
});

test("TV-F2.4: old saves retire the games they have stars in; w1-4's dojo:welcome doesn't retire New Sounds", () => {
  const w = migrateGames({}, { "w1-wu1": 3, "w1-2": 2, "w1-4": 3 }, LEVELS);
  for (const id of ["tap", "fastslow", "notice", "tapall", "firstsound", "find", "build", "readcheck"]) assert.deepEqual(w[`game:${id}`] && { n: w[`game:${id}`].n, s: w[`game:${id}`].s, lastSession: w[`game:${id}`].lastSession }, { n: 2, s: [0, 0], lastSession: -1 }, id);
  assert.equal(w["game:learn"], undefined);
  const withWelcome = migrateGames({ "dojo:welcome": { n: 1, at: [3] }, "dojo:first": { n: 1, at: [3] } }, {}, LEVELS);
  assert.equal(withWelcome["game:learn"], undefined, "no teaching dojo played: the first Dojo lesson keeps its full frame");
  assert.equal(withWelcome["game:build"]?.n, 1, "dojo:first folds into Word Building");
  assert.equal(frameForm(withWelcome["game:build"], 5, NOW), "recap", "a folded telling plays its recap next");
  const dojoPlayer = migrateGames({ "dojo:welcome": { n: 2, at: [20, 23] } }, { "w2-1": 3 }, LEVELS);
  assert.equal(dojoPlayer["game:learn"]?.n, 2);
  assert.deepEqual(migrateGames({ [GAMES_MIGRATED]: { n: 1, at: [] } }, { "w1-wu1": 3 }, LEVELS), {}, "once per save");
});

test("TV-F2.4: a telling counts once a session; played() notes a struggle, which brings back the recap with its hold", () => {
  const { framedEntry, playedEntry } = GAMES_ENTRY;
  let e = framedEntry(undefined, 5, 1, NOW);
  assert.deepEqual([e.n, e.s, e.lastSession], [1, [1], 1]);
  assert.equal(frameForm(e, 1, NOW), "none", "a later play in the same session");
  e = framedEntry(e, 6, 1, NOW);
  assert.equal(e.n, 1, "a second telling in the same session doesn't count");
  e = playedEntry(e, 1, NOW, true);
  assert.equal(frameForm(e, 1, NOW), "recap");
  assert.equal(recapHold(e, NOW), true);
  e = framedEntry(e, 7, 2, NOW + DAY);
  e = playedEntry(e, 2, NOW + DAY, false);
  assert.deepEqual([e.n, e.s], [2, [1, 2]]);
  assert.equal(frameForm(e, 2, NOW + DAY), "none");
  assert.equal(frameForm(e, 3, NOW + 2 * DAY), "short");
});

// ---------------------------------------------------------------- the World Flower's trips (SCRIPT_FIXES C3, TEACHER_SCRIPT §3.14, TV-F2.5)
import { foundScript, hearIn, sameSpelling, canBe, introGem } from "./teach";
import type { Say } from "../engine/audio";
const lineIds = (xs: Say[]) => xs.flatMap((x) => ("line" in x ? [x.line] : []));
const soundsOf = (xs: Say[]) => xs.filter((x): x is Extract<Say, { sound: string }> => "sound" in x);
const beatSay = (b: { say: Say[] }[]) => b.flatMap((x) => x.say);
const has = (id: string) => LINE_IDS.has(id);
const gem = (g: string, p: string, newSound: boolean, knownWays = 1) => ({ gem: { g, p: p as never }, newSound, knownWays, others: [] });

test("C3: a just-taught gem of a known sound: 'You found a new gem!… /ae/ …like in tray, day and say.', and no re-teaching", () => {
  const say = beatSay(foundScript([gem("ay", "ae", false, 2)], { justTaught: new Set(["ay>ae"]), world: 6 }));
  const lines = lineIds(say);
  assert.equal(lines[0], "wf_found_gem");
  assert.ok(!lines.includes("same_sound_new"));
  assert.ok(!lines.includes("t_two_letters"), "no letters line right after the teach moment");
  assert.ok(!lines.includes("t_way_we_spell") && !lines.some((l) => l.endsWith("_way")), "no second 'This is the way we spell…'");
  if (has("tg_ay_ae_like")) assert.ok(lines.includes("tg_ay_ae_like"));
  assert.ok(lines.some((l) => l.startsWith("t_ways_")), "then the count of ways");
});
test("TV-F2.5: the first trip (land 1): two new sounds, the sound ending its sentence, no 'We see this spelling in…'", () => {
  const say = beatSay(foundScript([gem("m", "m", true), gem("s", "s", true)], { justTaught: new Set(["m>m", "s>s"]), world: 1 }));
  const lines = lineIds(say);
  assert.equal(lines[0], has("st_found_new_sounds") ? "st_found_new_sounds" : "wf_found_sound");
  if (has("tv_here_sound") && has("tg_m_m_way")) {
    assert.deepEqual(lines.slice(1, 3), ["tv_here_sound", "tg_m_m_way"]);
    assert.deepEqual(lines.slice(3, 5), has("tv_another_sound") ? ["tv_another_sound", "tg_s_s_way"] : ["st_another_new_sound", "tv_here_sound"]);
    // "Here's the sound…" /m/ · "This is the way we spell it in mat." : the sound ends its sentence
    const i = say.findIndex((x) => "line" in x && x.line === "tv_here_sound");
    assert.ok("gap" in say[i + 1] && "sound" in say[i + 2]);
  }
  assert.ok(!lines.some((l) => l.endsWith("_see") || l === "t_we_see_it_in"), "the child can't read yet (T21)");
  assert.ok(!lines.includes("t_two_letters") && !lines.includes("t_everyone_say"));
  for (const s of soundsOf(say)) assert.equal(s.show, "petal", "every sound on a trip is a petal");
});
test("C3: no example word twice in one trip", () => {
  const used = new Set<string>();
  const b = foundScript([gem("a", "a", true), gem("t", "t", true)], { world: 2, used });
  const words = beatSay(b).flatMap((x) => ("word" in x ? [x.word] : []));
  assert.equal(new Set(words).size, words.length, words.join());
  assert.ok(used.size > 0, "the scene's used set is filled");
});
test("C3: introGem({ facts: false }) says no letters line", () => {
  assert.ok(lineIds(introGem({ g: "sh", p: "sh" }, { facts: false, phrasing: "way" }).say).every((l) => l !== "t_two_letters"));
  assert.ok(lineIds(introGem({ g: "sh", p: "sh" }, { phrasing: "way" }).say).includes("t_two_letters"));
});
test("TV-F2.5: 'You can hear it in…' only with words spelt with the taught spelling", () => {
  const k = hearIn("k", "c");
  assert.ok(!lineIds(k.say).includes("tp_k_hear"), "tp_k_hear has king and duck");
  assert.ok(k.words.every((w) => w.segs.some((s) => s.p === "k" && s.g === "c")), k.words.map((w) => w.text).join());
  if (has("tp_b_hear")) assert.deepEqual(lineIds(hearIn("b", "b").say), ["tp_b_hear"]);
});
test("C20: < th > as /th/ then /dh/ in five clips; both sounds petals", () => {
  const say = sameSpelling("th", "th", "dh").say;
  if (has("st_th_moth_sometimes") && has("tg_th_dh_in")) assert.deepEqual(lineIds(say), ["t_same_spelling_sometimes", "st_th_moth_sometimes", "tg_th_dh_in"]);
  assert.deepEqual(soundsOf(say).map((s) => [s.sound, s.show]), [["th", "petal"], ["dh", "petal"]]);
  assert.deepEqual(soundsOf(canBe("th", "dh")).map((s) => s.show), ["petal", "petal"]);
});
