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
import { foundScript, hearIn, sameSpelling, canBe, introGem, sameSound, worldScript } from "./teach";
import { TEACH_EXAMPLES } from "./teach-lines.gen";
import type { Say } from "../engine/audio";
const lineIds = (xs: Say[]) => xs.flatMap((x) => ("line" in x ? [x.line] : []));
const soundsOf = (xs: Say[]) => xs.filter((x): x is Extract<Say, { sound: string }> => "sound" in x);
const beatSay = (b: { say: Say[] }[]) => b.flatMap((x) => x.say);
const has = (id: string) => LINE_IDS.has(id);
const SPELLING_OF_ID = LINE_IDS.has("wf_spelling_of") ? "wf_spelling_of" : "t_spelling_of";
const gem = (g: string, p: string, newSound: boolean, knownWays = 1, others: string[] = []) => ({ gem: { g, p: p as never }, newSound, knownWays, others: others as never[] });
const TEXT_OF = new Map(LINES.map((l) => [l.id, l.text]));
/** a clip that continues a sentence ("…in…", "…like in sit, sun and bus.") or leaves one hanging ("It's a spelling of the sound…") */
const opens = (id: string) => (TEXT_OF.get(id) ?? "").startsWith("...");
const hangs = (id: string) => (TEXT_OF.get(id) ?? "").endsWith("...");
const speech = (xs: Say[]) => xs.filter((x) => !("gap" in x));
/** the trips of the verify round's runs (the gem keys as GemFound passes them, all just taught) */
const TRIPS: [string, ReturnType<typeof gem>[], number][] = [
  ["the first visit (after w1-2): /s/ is the petal just met", [gem("s", "s", false, 1), gem("m", "m", true)], 1],
  ["w1-3", [gem("a", "a", true), gem("t", "t", true)], 1],
  ["w2-1", [gem("b", "b", true), gem("c", "k", true), gem("g", "g", true), gem("h", "h", true)], 2],
  ["w5-1", [gem("sh", "sh", true), gem("ch", "ch", true), gem("th", "th", true, 1, ["dh"]), gem("th", "dh", true, 1, ["th"])], 5],
  ["the w5 gems", [gem("q", "k", false, 4), gem("u", "w", false, 3, ["u"]), gem("ve", "v", false, 2), gem("tch", "ch", false, 2)], 5],
  ["w6-1", [gem("ai", "ae", true), gem("ay", "ae", false, 2)], 6],
];
const trip = (items: ReturnType<typeof gem>[], world: number) => foundScript(items, { justTaught: new Set(items.map((x) => `${x.gem.g}>${x.gem.p}`)), used: new Set(), world });

test("C3: a just-taught gem of a known sound: 'You found a new gem!… /ae/ · <a whole example sentence>', one step, and no re-teaching", () => {
  const b = foundScript([gem("ay", "ae", false, 2)], { justTaught: new Set(["ay>ae"]), world: 6 });
  const lines = lineIds(beatSay(b));
  assert.equal(lines[0], "wf_found_gem");
  assert.ok(!lines.includes("same_sound_new"));
  assert.ok(!lines.includes("t_two_letters"), "no letters line right after the teach moment");
  assert.ok(!lines.includes("t_way_we_spell") && !lines.some((l) => l.endsWith("_like") || l === "t_like_in"), "never '…/ae/ …like in tray…'");
  // the lead and its sound and example are one held step (verify round 2: "…/s/" [▶] "…like in sit, sun and bus.")
  assert.deepEqual(lineIds(b[0].say).slice(0, 1), ["wf_found_gem"]);
  assert.ok(lineIds(b[0].say).some((l) => /^tg_ay_ae_(way|see)$/.test(l)), lineIds(b[0].say).join());
  assert.ok(lines.some((l) => l.startsWith("t_ways_")), "then the count of ways");
});
test("verify round 2: every trip beat is whole sentences, and a pure sound only ends a sentence (TS §2.4 rule 4)", () => {
  for (const [name, items, world] of TRIPS) {
    for (const b of trip(items, world)) {
      const sp = speech(b.say);
      const first = sp[0], last = sp[sp.length - 1];
      assert.ok(!(first && "line" in first && opens(first.line)), `${name}: a step opens mid-sentence: ${first && "line" in first ? first.line : ""}`);
      assert.ok(!(last && "line" in last && hangs(last.line)), `${name}: a step ends mid-sentence: ${last && "line" in last ? last.line : ""}`);
      // (the same-spelling beat is SCRIPT_FIXES C20's and Sounds~Write's two-sound formula)
      if (b.cue === "same-spelling") continue;
      sp.forEach((x, i) => {
        const next = sp[i + 1];
        if ("sound" in x && next) assert.ok("line" in next && !opens(next.line), `${name}: /${x.sound}/ inside a sentence, then ${JSON.stringify(next)}`);
      });
    }
  }
});
test("verify round 2: the first World Flower visit: /s/ and /m/ as sounds, in TS §3.14's words, never 'gem' or 'spelling'", () => {
  const b = trip(TRIPS[0][1], 1);
  const lines = lineIds(beatSay(b));
  assert.ok(!lines.includes("wf_found_gem") && !lines.includes(SPELLING_OF_ID) && !lines.includes("t_another_way"), lines.join());
  if (has("tv_here_sound") && has("tv_another_sound") && has("tg_s_s_way") && has("tg_m_m_way")) {
    assert.deepEqual(b.map((x) => lineIds(x.say)), [["tv_here_sound", "tg_s_s_way"], ["tv_another_sound", "tg_m_m_way"]]);
    assert.deepEqual(b.map((x) => soundsOf(x.say).map((s) => s.sound)), [["s"], ["m"]]);
  }
});
test("pre-ship fix: a trip is one routine (one lead, one example form, never the Dojo's series), and splices nothing", () => {
  const ONCE = ["tv_here_sound", "wf_found_gem", "t_another_way", SPELLING_OF_ID, "tv_and_another_way", "st_found_new_sounds", "wf_found_sound"];
  for (const [name, items, world] of TRIPS) {
    const b = trip(items, world);
    const lines = lineIds(beatSay(b));
    for (const l of ONCE) assert.ok(lines.filter((x) => x === l).length <= 1, `${name}: ${l} twice: ${lines.join(" ")}`);
    assert.ok(!lines.includes("tv_learn_next") && !lines.includes("tv_learn_last"), `${name}: the Dojo's series: ${lines.join(" ")}`);
    // the new sounds' beats all take one example form ("way", "see" or "hear")
    const forms = new Set(b.filter((x) => x.cue === "explain" && lineIds(x.say)[0] && ["tv_here_sound", "tv_another_sound"].includes(lineIds(x.say)[0])).map((x) => lineIds(x.say).find((l) => /^t[gp]_/.test(l))?.replace(/^.*_/, "")));
    assert.ok(forms.size <= 1, `${name}: ${[...forms].join()}: ${lines.join(" ")}`);
    for (const bare of ["t_in", "t_and", "t_like_in", "t_we_see_it_in", "t_you_can_hear_it_in", "t_way_we_spell"]) assert.ok(!lines.includes(bare), `${name}: ${bare}`);
    const words = beatSay(trip(items, world)).flatMap((x) => ("word" in x ? [x.word] : []));
    assert.equal(new Set(words).size, words.length, `${name}: ${words.join()}`);
  }
  // w2-1: four new sounds, one routine ("Here's the sound… /b/ · This is the way we spell it in bat.", then "And here's
  // another new sound… /k/ · This is the way we spell it in cat." for each), not "…in bat", "…in cat", "We see this
  // spelling in…", "You can hear it in…" (the verify round's 42:59)
  const b21 = trip(TRIPS[2][1], 2);
  const w21 = lineIds(beatSay(b21));
  if (["tv_here_sound", "tv_another_sound"].every(has)) assert.deepEqual(w21.filter((l) => l.startsWith("tv_")), ["tv_here_sound", "tv_another_sound", "tv_another_sound", "tv_another_sound"]);
  if (["tg_b_b_way", "tg_c_k_way", "tg_g_g_way", "tg_h_h_way"].every(has)) assert.deepEqual(w21.filter((l) => l.startsWith("tg_") || l.startsWith("tp_")), ["tg_b_b_way", "tg_c_k_way", "tg_g_g_way", "tg_h_h_way"]);
});
test("verify round 2: < th > as /th/ and /dh/ in one trip is explained once, after /dh/, never in the 7-clip splice", () => {
  const b = trip(TRIPS[3][1], 5);
  const same = b.filter((x) => x.cue === "same-spelling");
  assert.equal(same.length, 1);
  assert.equal(same[0].gem, "th>dh");
  assert.equal(b[b.length - 1], same[0]);
  // whole sentences, each sound ending one (SCRIPT_STYLE §7's "Never" was the C20 splice): never a fragment that opens
  // mid-sentence, and a pure sound is followed by a gap and a sentence that starts afresh
  const sp = speech(same[0].say);
  for (const x of sp) if ("line" in x) assert.ok(!opens(x.line), `opens mid-sentence: ${x.line}`);
  sp.forEach((x, i) => {
    if ("sound" in x && sp[i + 1]) assert.ok("line" in sp[i + 1] || "word" in sp[i + 1], JSON.stringify(sp[i + 1]));
  });
  assert.deepEqual(soundsOf(same[0].say).map((s) => s.sound), ["th", "dh"]);
  assert.ok(!lineIds(same[0].say).some((l) => ["st_th_moth_sometimes", "tg_th_dh_in", "t_but_in_this_word", "t_and_sometimes", "t_in"].includes(l)), lineIds(same[0].say).join());
  // /u/ and /w/ (the w5 gems): the same whole sentences, or the word then "This can be… /u/ · But in this word, it's… /w/"
  const u = trip(TRIPS[4][1], 5).find((x) => x.cue === "same-spelling")!;
  assert.ok(!lineIds(u.say).some((l) => opens(l)), lineIds(u.say).join());
  assert.deepEqual(soundsOf(u.say).map((s) => s.sound), ["u", "w"]);
});
test("verify round 2: the world visit's recap: 'Let's remember the ways to spell… /s/', its words, 'Same sound, different spellings!'", () => {
  const e = sameSound("s" as never, [{ g: "s", p: "s" as never }, { g: "ss", p: "s" as never }]);
  const lines = lineIds(e.say);
  assert.ok(!lines.includes("t_and") && !lines.includes("t_same_sound"), lines.join());
  if (has("t_lets_remember") && has("same_sound_diff")) assert.deepEqual(lines, ["t_lets_remember", "same_sound_diff"]);
  for (let i = 0; i < 4; i++) {
    const w = worldScript({ multi: [], recent: [], twoSounds: [{ g: "u", a: "u" as never, b: "w" as never }], hidden: 0 });
    assert.ok(!lineIds(beatSay(w)).some((l) => l === "t_in" || l === "t_and_sometimes"), "no generic spliced 'same spelling' form");
  }
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
  const spelt = (ws: { segs: readonly { p: string; g: string }[] }[], p: string, g: string) => ws.every((w) => w.segs.some((s) => s.p === p && s.g === g));
  // a sound's recorded examples are spelt with its first-taught spelling (tp_k_hear: cat, cap and cot, not king and
  // duck), so the one recording serves the Dojo lesson that teaches /k/ with < c >
  const k = hearIn("k", "c");
  assert.ok(spelt(k.words, "k", "c"), k.words.map((w) => w.text).join());
  if (has("tp_k_hear")) assert.deepEqual(lineIds(k.say), ["tp_k_hear"]);
  // a later spelling: spliced from its own words, never the recording
  const kk = hearIn("k", "k");
  assert.ok(!lineIds(kk.say).includes("tp_k_hear"));
  assert.ok(kk.words.length > 0 && spelt(kk.words, "k", "k"), kk.words.map((w) => w.text).join());
  if (has("tp_b_hear")) assert.deepEqual(lineIds(hearIn("b", "b").say), ["tp_b_hear"]);
  // every petal's recorded examples share one spelling of the sound
  for (const [key, ws] of Object.entries(TEACH_EXAMPLES)) {
    if (!key.startsWith("petal:")) continue;
    const p = key.slice(6);
    const gs = new Set(ws.map((t) => WORD_BY_TEXT[t]?.segs.find((s) => s.p === p)?.g));
    assert.equal(gs.size, 1, `${key}: ${ws.join(", ")}`);
  }
});
test("pre-ship fix (a): < th > as /th/ then /dh/ in whole sentences, each sound ending its sentence; both sounds petals", () => {
  const say = sameSpelling("th", "th", "dh").say;
  const then = has("tv_and_sometimes_be") ? "tv_and_sometimes_be" : "t_this_can_be";
  if (has("tg_th_th_way") && has("tg_th_dh_way")) assert.deepEqual(lineIds(say), ["t_same_spelling_sometimes", "tg_th_th_way", then, "tg_th_dh_way"]);
  assert.deepEqual(soundsOf(say).map((s) => [s.sound, s.show]), [["th", "petal"], ["dh", "petal"]]);
  // each sound is followed by a whole sentence (never "…in moth, and sometimes…" or "…in this.")
  const sp = speech(say);
  sp.forEach((x, i) => {
    const next = sp[i + 1];
    if ("sound" in x && next) assert.ok("line" in next && !opens(next.line), JSON.stringify(next));
  });
  // a word already said on this screen isn't said again: that sentence is left out
  const used = new Set(["moth"]);
  assert.ok(!lineIds(sameSpelling("th", "th", "dh", { used }).say).includes("tg_th_th_way"));
  assert.ok(used.has("this") || !has("tg_th_dh_way"), "the words said are added");
  // "This can be… /u/ · But in this word, it's… /w/": two sentences, never the "…but in this word, it's…" fragment
  const cb = canBe("u", "w");
  assert.deepEqual(soundsOf(cb).map((s) => s.show), ["petal", "petal"]);
  assert.deepEqual(lineIds(cb), ["t_this_can_be", has("tv_but_in_this_word") ? "tv_but_in_this_word" : "t_in_this_word_this_is"]);
  assert.ok(!lineIds(cb).some(opens));
});

// ---------------------------------------------------------------- word timings, and what Hear it again replays
import { wordAt, LINE_WORDS, WORD_TIMES } from "./word-times";
import { isFeedback, isInstruction, isRegisterable } from "./instructions";
test("TV-F2.1: word timings for the lines that spotlight: wordAt(id, word)", () => {
  for (const id of ["tv_ready_first", "tv_ready_paw", "tv_choose_q", "tv_opt_notyet", "tv_opt_yes", "tv_ts_meet", "tv_ears_demo", "tv_pocket_frame", "tv_learn_frame_four"]) assert.ok(LINE_WORDS[id]?.length, id);
  // (the 28 Sep Erinome take of tv_ready_first: its words.json)
  assert.equal(wordAt("tv_ready_first", "arrow"), 4.92);
  assert.equal(wordAt("tv_ready_first", "Too"), 2.92, "the script's spelling, whatever Whisper heard");
  assert.ok(wordAt("tv_choose_q", "Kai")! < wordAt("tv_choose_q", "Suki")!);
  assert.equal(wordAt("tv_ready_first", "ready", 1), 2.72, "the second 'ready'");
  assert.equal(wordAt("tv_ready_first", "paw"), undefined);
  assert.equal(wordAt("no_such_line", "paw"), undefined);
  for (const [id, ws] of Object.entries(LINE_WORDS)) for (let i = 1; i < ws.length; i++) assert.ok(ws[i][1] >= ws[i - 1][1], `${id}: word ${i} starts before word ${i - 1}`);
  assert.deepEqual(WORD_TIMES.fm_starfish_q, [0.04, 1.16, 2.02], "the 28 Sep Erinome take");
});
test("TS §5.3–5.4: praise and corrections are feedback, never replayed; nudges aren't the question", () => {
  for (const id of ["tv_praise_found", "tv_yay_lovely", "tv_said_well", "tv_streak_10", "tv_fix_together", "tv_fix_start", "tv_slow_again", "tv_guess_again", "tv_find_again_sock", "tv_which_fix_cat_dog", "tv_right_kai", "tv_listen_here", "tv_run_fix", "tv_sort_fix", "streak_lost"]) {
    if (LINES.some((l) => l.id === id)) assert.ok(isFeedback(id) && !isInstruction(id), id);
  }
  for (const id of ["tv_ready_first", "tv_learn_frame_four", "tv_ears_frame", "tv_find_write"]) if (LINES.some((l) => l.id === id)) assert.ok(isInstruction(id) && isRegisterable(id), id);
  for (const id of ["tv_take_time", "tv_idle_point", "tv_offer_show", "tv_show_offer"]) if (LINES.some((l) => l.id === id)) assert.ok(!isRegisterable(id), id);
});

// ---------------------------------------------------------------- fast and slow (TEACHER_SCRIPT §9, FIX_PLAN §13.5)
import { FS_BANKS, FS_IDEAS, FS_LONG, FS_PRAISE, createFastSlow, fsNextIdea, fsReadbackAt, type FsEnv } from "./narrative";
const fsEnv = (o: { world?: number; has?: (id: string) => boolean } = {}) => {
  const counts = new Map<string, number>();
  const env = { s: 1, world: o.world ?? 1, level: 1, counts } as { s: number; world: number; level: number; counts: Map<string, number> };
  const e: FsEnv = {
    session: () => env.s, world: () => env.world, level: () => env.level,
    count: (k) => counts.get(k) ?? 0, bump: (k) => void counts.set(k, (counts.get(k) ?? 0) + 1), has: o.has ?? ((id) => has(id)),
  };
  return { env, fs: createFastSlow(e) };
};
test("TS §9.5: the banks are §9.5's lists in order (long and short alternate); the long lines are the four", () => {
  const t = (...xs: string[]) => xs.map((x) => `tv_fs_${x}`);
  assert.deepEqual(FS_BANKS.listen, t("two_ways", "tortoise", "gaps", "hiding", "rabbit", "whole", "read", "turn", "same", "push", "made", "ninjas_can", "ninja"));
  assert.deepEqual(FS_BANKS.read, t("two_ways", "tortoise", "gaps", "hiding", "rabbit", "whole", "read", "push", "same", "ninja", "mantra"));
  assert.deepEqual(FS_BANKS.build, t("two_ways", "tortoise", "gaps", "next", "made", "start_end", "same", "turn", "spell", "count", "find"));
  for (const b of Object.values(FS_BANKS)) for (const id of b) assert.ok(FS_IDEAS.includes(id), id);
  assert.ok(Object.values(FS_BANKS).every((b) => b.filter((id) => !FS_LONG.has(id)).length >= 7), "a tight run has plenty to walk");
  for (const id of [...FS_IDEAS, ...Object.values(FS_PRAISE).flat()]) assert.ok(LINES.some((l) => l.id === id), `${id} is in LINES`);
  assert.deepEqual([...FS_LONG].sort(), ["tv_fs_mantra", "tv_fs_ninja", "tv_fs_rabbit", "tv_fs_tortoise"]);
  assert.equal(fsNextIdea({ pointer: 1, bank: "build", said: new Set(), tight: true }), "tv_fs_gaps", "tight skips the tortoise");
  assert.equal(fsNextIdea({ pointer: 0, bank: "build", said: new Set(FS_BANKS.build) }), null, "the whole bank said this session");
});
test("TS §9.2: read-backs: rabbit, S~W, pair, S~W, pair, then plain; S~W after a miss; Move 1 once a game a session", () => {
  const { env, fs } = fsEnv();
  assert.equal(fs.readback("build"), "rabbit");
  fs.said("tv_fs_rabbit_read", "build");
  assert.deepEqual([2, 3, 4, 5, 6].map(() => fs.readback("build")), ["sw", "pair", "sw", "pair", "plain"]);
  assert.equal(fs.readback("build", { afterMiss: true }), "sw");
  assert.equal(fs.readback("battle"), "rabbit", "each game type has its own in lands 1–2");
  env.level++;
  assert.equal(fs.readback("build"), "sw", "the same game in a later level: no Move 1 again, and S~W's routine opens the level");
  env.s++;
  assert.equal(fs.readback("build"), "rabbit", "a new session");
  assert.deepEqual([fsReadbackAt(1), fsReadbackAt(3, { afterMiss: true }), fsReadbackAt(7)], ["sw", "sw", "plain"]);
});
test("TS §9.5: Move 1 not heard (Home mid-way) comes again in the game's next level; a later read-back in the level means it played", () => {
  const { env, fs } = fsEnv();
  assert.equal(fs.readback("build"), "rabbit");
  env.level++;
  assert.equal(fs.readback("build"), "rabbit", "cut off: again");
  assert.equal(fs.readback("build"), "sw", "the next word in the same level");
  env.level++;
  assert.equal(fs.readback("build"), "pair", "…so it counted");
});
test("TS §9.5: from land 3, Move 1 and the idea only in the session's first game with one", () => {
  const { fs } = fsEnv({ world: 3 });
  assert.equal(fs.readback("battle"), "rabbit");
  fs.said("tv_fs_rabbit_read", "battle");
  assert.equal(fs.readback("swap"), "sw", "another game: S~W's read-back");
  assert.ok(fs.idea("battle", "build"));
  assert.equal(fs.idea("swap", "build"), null);
  const late = fsEnv({ world: 4 }).fs;
  assert.ok(late.idea("story", "read"), "the session's first");
  late.said(late.idea("story", "read")!, "story");
  assert.equal(late.idea("run", "listen"), null);
});
test("TS §9.5: ideas: the save's first is two_ways; once a game a session; ≤ 2 a level, ≤ 4 a session; never twice a session", () => {
  const { env, fs } = fsEnv();
  const a = fs.idea("fastslow", "listen");
  assert.equal(a, "tv_fs_two_ways");
  assert.equal(fs.idea("fastslow", "listen"), a, "not said yet: the same line again");
  fs.said(a!, "fastslow");
  assert.equal(fs.idea("fastslow", "listen"), null, "once a game a session");
  const b = fs.idea("slowpick", "listen", { tight: true });
  assert.ok(b && b !== a && !FS_LONG.has(b), String(b));
  fs.said(b!, "slowpick");
  assert.equal(fs.idea("sounds", "listen"), null, "two a level");
  env.level++;
  const said = [a, b];
  for (const g of ["sounds", "dots"] as const) {
    const id = fs.idea(g, "listen");
    assert.ok(id && !said.includes(id), `${g}: ${id}`);
    said.push(id);
    fs.said(id!, g);
    env.level++;
  }
  assert.equal(fs.idea("build", "build"), null, "four a session");
  env.s++;
  assert.notEqual(fs.idea("build", "build"), "tv_fs_two_ways", "the save's pointer walked on");
  const { fs: w } = fsEnv();
  w.said("tv_same_word", "fastslow");
  assert.equal(w.idea("fastslow", "listen"), null, "W1's tv_same_word counts as its idea");
  assert.equal(w.idea("slowpick", "listen"), "tv_fs_two_ways", "…without moving the rotation");
});
test("TS §9.5 (integration): First Sounds and Sound Hunt, whose only telling is the idea, get it past the session cap", () => {
  const { env, fs } = fsEnv();
  for (const g of ["fastslow", "slowpick", "sounds", "dots"] as const) {
    const id = fs.idea(g, "listen");
    assert.ok(id, g);
    fs.said(id!, g);
    env.level++;
  }
  assert.equal(fs.idea("build", "build"), null, "four a session");
  const first = fs.idea("firstsound", "build", { tight: true });
  assert.ok(first, "First Sounds still gets its one line");
  fs.said(first!, "firstsound");
  assert.equal(fs.idea("firstsound", "build"), null, "once a game a session");
  assert.equal(fs.idea("build", "build"), null, "and it didn't free or use a slot of the four");
  const hunt = fs.idea("soundhunt", "build", { tight: true });
  assert.ok(hunt && hunt !== first, "Sound Hunt too, a different line");
  fs.said(hunt!, "soundhunt");
  assert.equal(fs.idea("soundhunt", "build"), null);
});
test("TS §9.5: Sound Swap never gets 'the very same word'", () => {
  const counts = new Map([["fs:idea", 6]]);
  const fs = createFastSlow({ session: () => 1, world: () => 1, level: () => 1, count: (k) => counts.get(k) ?? 0, bump() {}, has });
  assert.equal(FS_BANKS.build[6], "tv_fs_same");
  assert.notEqual(fs.idea("swap", "build"), "tv_fs_same");
  assert.equal(fs.idea("build", "build"), "tv_fs_same");
});
test("TS §9.2 Move 3: the stuck recap takes turns with the game's own line, never twice on one item", () => {
  const { env, fs } = fsEnv();
  assert.equal(fs.stuck("build", "slow", { item: "mat" }), "tv_fs_stuck_slow");
  assert.equal(fs.stuck("build", "slow", { item: "sat" }), null, "the game's own line's turn");
  assert.equal(fs.stuck("build", "slow", { item: "mat" }), null, "not twice on one item");
  assert.equal(fs.stuck("build", "slow", { item: "pin" }), "tv_fs_stuck_slow");
  assert.equal(fs.stuck("sounds", "push", { item: "map", always: true }), "tv_fs_stuck_push");
  assert.equal(fs.stuck("sounds", "push", { item: "map", always: true }), "tv_fs_stuck_push", "Guess My Word's 8 s idle: always");
  env.s++;
  assert.equal(fs.stuck("build", "slow", { item: "mat" }), "tv_fs_stuck_slow", "a new session");
});
test("TS §9.2 Move 4: fast and slow praise once a game a session, not straight after the idea, rotating across the save", () => {
  const { env, fs } = fsEnv();
  fs.said("tv_fs_rabbit_read", "build");
  assert.equal(fs.praise("build", "build"), null, "the slot after Move 1 stays the game's own");
  const p = fs.praise("build", "build");
  assert.equal(p, "tv_fs_praise_every");
  assert.equal(fs.praise("build", "build"), p, "not said yet: waits");
  fs.said(p!, "build");
  assert.equal(fs.praise("build", "build"), null, "once a game a session");
  const q = fs.praise("battle", "build");
  assert.ok(q && q !== p && FS_PRAISE.build.includes(q), `another game: another line (${q})`);
  env.s++;
  assert.notEqual(fs.praise("build", "build"), "tv_fs_praise_every", "the save's rotation moved on");
});
test("TS §9.2 Move 5: the two pairs take turns; Kai and Suki's Move 1 is a pair with no tap", () => {
  const { fs } = fsEnv();
  const a = fs.pair(), b = fs.pair();
  assert.deepEqual([a, b], [["tv_fs_say_slow", "tv_fs_now_fast"], ["tv_fs_slow_tortoise", "tv_fs_fast_rabbit"]]);
  assert.equal(fs.readback("readcheck"), "rabbit");
  fs.said("tv_fs_now_fast", "readcheck");
  assert.equal(fs.readback("readcheck"), "sw");
  assert.equal(fs.heardThisSession("tv_fs_now_fast"), true);
  assert.equal(fs.heardThisSession("tv_fs_run"), false);
});
test("TS §9.7 rule 6: fast/slow praise and stuck lines are feedback; ideas and lead-ins are asides; the rabbit prompt is the instruction", () => {
  for (const id of ["tv_fs_praise_both", "tv_fs_praise_every_2", "tv_fs_stuck_slow", "tv_fs_stuck_push"]) if (has(id)) assert.ok(isFeedback(id) && !isRegisterable(id), id);
  for (const id of ["tv_fs_two_ways", "tv_fs_hiding", "tv_fs_say_sounds_slow", "tv_fs_say_slow", "tv_fs_now_fast", "tv_fs_slow_tortoise", "tv_fs_fast_rabbit"]) if (has(id)) assert.ok(isInstruction(id) && !isRegisterable(id), id);
  for (const id of ["tv_fs_rabbit_read", "tv_fs_run"]) if (has(id)) assert.ok(isRegisterable(id), id);
});

// ---------------------------------------------------------------- pre-ship fixes (28 Sep, lane F2)
test("pre-ship fix (b): S~W's 'Say the sounds, and read the word.' on the first two read-backs of every level, however quick the child", () => {
  const { env, fs } = fsEnv();
  assert.equal(fs.readback("build"), "rabbit");
  fs.said("tv_fs_rabbit_read", "build");
  // a quick child: the session's count runs on into "plain", but each new level opens on the routine
  assert.deepEqual([1, 2, 3, 4, 5].map(() => fs.readback("build")), ["sw", "pair", "sw", "pair", "plain"]);
  for (let lv = 0; lv < 5; lv++) {
    env.level++;
    assert.deepEqual([1, 2, 3, 4, 5].map(() => fs.readback("build")), ["sw", "sw", "plain", "plain", "plain"], `level ${lv}: w1-10…w2-2's five words`);
  }
  // the pure rule
  assert.deepEqual([fsReadbackAt(9, { inLevel: 1 }), fsReadbackAt(9, { inLevel: 2 }), fsReadbackAt(9, { inLevel: 3 }), fsReadbackAt(9)], ["sw", "sw", "plain", "plain"]);
  assert.equal(fsReadbackAt(3, { inLevel: 1 }), "pair", "Sensei's pair keeps its turn");
  // another game in the same level counts on its own
  assert.equal(fs.readback("battle"), "rabbit");
});

import { correction, positionCorrection, slotPosition } from "../engine/feedback";
test("pre-ship fix (c): the first miss asks about the sound the child is on (never 'What sound comes next?' after 'What's the last sound?')", () => {
  const t = { g: "t", p: "t" as never };
  assert.deepEqual([slotPosition("mat", { g: "m", p: "m" as never }), slotPosition("mat", { g: "a", p: "a" as never }), slotPosition("mat", t)], ["first", "next", "last"]);
  assert.equal(slotPosition("dad", { g: "d", p: "d" as never }), null, "a spelling the word has twice: unknown without the slot");
  assert.equal(slotPosition("dad", { g: "d", p: "d" as never }, 2), "last");
  for (let i = 0; i < 4; i++) {
    const c = lineIds(correction("p", t, "mat", 1, { pos: "last" }));
    assert.ok(!c.includes("audit_listen_next"), c.join());
    if (has("tv_listen_word_again")) assert.ok(c.includes("last_sound_q") || c.some((l) => l.startsWith("w_position_q")), c.join());
    else assert.ok(["tv_listen_here", "listen_here", "audit_spelling_help_plain"].includes(c[0]), c.join());
  }
  const pc = positionCorrection("mat", "last");
  assert.equal(pc.filter((x) => "word" in x).length <= 1, true);
  if (has("tv_listen_word_again")) assert.equal(lineIds(pc)[0], "tv_listen_word_again");
  // the question the child was asked, and the PLAIN word (FS1): never the slow word
  assert.ok(!pc.some((x) => "stretch" in x));
  // without a place: the rotation, as before
  assert.equal(correction("p", t, "mat", 1).length, 3);
});

test("pre-ship fix (f): the new lines wait in PRESHIP_LINES, and join LINES only once recorded (nothing plays silence)", async () => {
  const { PRESHIP_LINES } = await import("./lines");
  const DUR = (await import("../../public/a/durations.json")).default as Record<string, number>;
  for (const l of PRESHIP_LINES) assert.equal(LINE_IDS.has(l.id), DUR[`l/${l.id}`] != null, l.id);
  for (const id of ["tv_to_flower_one", "tv_learn_short_ways", "tv_learn_frame_mixed", "tv_learn_frame_ways_many", "tv_learn_frame_one_two_ways"]) assert.ok(PRESHIP_LINES.some((l) => l.id === id), id);
});

test("pre-ship fix (d): the Learn's errorless 'say it with me' taps don't feed the streak: no 'Ninja power!' on the first Ninja Eyes answer", async () => {
  // streak.ts reads the save (engine/store.ts), which expects a browser: a minimal one (as streak.test.ts)
  const mem = new Map<string, string>();
  const g = globalThis as Record<string, unknown>;
  g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
  g.document ??= { addEventListener() {}, visibilityState: "visible" };
  g.window ??= globalThis;
  g.addEventListener ??= () => {};
  const { streak, tierLineId } = await import("../engine/streak");
  streak.drop();
  streak.miss({ line: false });
  streak.hit(); // the last level's answer, carried over
  streak.bank();
  streak.reset();
  streak.hit({ part: true }); // the Learn's "say it with me" tap: a flame, no answer() follows
  assert.equal(streak.n, 2, "the tap lights its flame");
  const e = streak.hit(); // the first Ninja Eyes answer
  assert.equal(e.tierUp, false, "no tier-up (it was streak_3 on this answer)");
  assert.equal(streak.n, 2);
  assert.equal(streak.tier, 0);
  assert.equal(tierLineId(1) === "streak_3" && e.tierUp, false);
  // real answers still build it: the third answer in a row (one carried, two here) powers up
  assert.equal(streak.hit().tierUp, true);
  // a word's letters are parts that its answer() closes: they count
  streak.miss({ line: false });
  for (let i = 0; i < 3; i++) streak.hit({ part: true, defer: true });
  streak.answer();
  const next = streak.hit({ part: true });
  assert.equal(streak.n, 4, "the word's letters stayed");
  streak.answer();
  assert.ok(next.type === "hit");
  // never below the tier already lit
  streak.miss({ line: false });
  for (let i = 0; i < 4; i++) streak.hit({ part: true });
  assert.equal(streak.tier, 1);
  streak.hit();
  assert.equal(streak.tier, 1, "the flames never drop on a right answer");
});
