/// <reference types="node" />
// Corrections and praise (src/engine/feedback.ts; SCRIPT_FIXES C5, A4; TEACHER_SCRIPT §5.3–§5.4).
// Run: bun test src/engine/feedback.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { PRAISE_EVERYDAY, REWARD_PRAISE, correction, freshPraise, praiseFor, praiseStep, resetPraise, type PraiseOpts, type PraiseState } from "./feedback";
import type { Say } from "./audio";

const ids = (xs: Say[]) => xs.map((x) => ("line" in x ? x.line : "sound" in x ? `/${x.sound}/` : "stretch" in x ? `[${x.stretch}]` : "gap" in x ? null : "?")).filter(Boolean);
const sh = { g: "sh", p: "sh" as const };

test("C5: < s > for /sh/ gives the two-letter correction, on the first miss, with no 'listen again' before it", () => {
  assert.deepEqual(ids(correction("s", sh, "shop", 1)), ["thats", "/s/", "we_need", "/sh/", "t_two_letters"]);
  assert.deepEqual(ids(correction("h", sh, "shop", 2)), ["thats", "/h/", "we_need", "/sh/", "t_two_letters"]);
});
test("C5: < t > for /sh/ keeps the listening branch; the second miss shows and hands the turn back", () => {
  const first = ids(correction("t", sh, "shop", 1));
  assert.equal(first.length, 2);
  assert.ok(["tv_listen_here", "listen_here", "audit_listen_slowly", "audit_listen_next", "audit_spelling_help_plain"].includes(first[0] as string), String(first[0]));
  assert.deepEqual(ids(correction("t", sh, "shop", 2)), ["thats", "/t/", "we_need", "/sh/", "its_this_one"]);
});
test("C5: the same sound in another spelling is about spelling, not listening (< s > for < ss > isn't a split)", () => {
  assert.deepEqual(ids(correction("s", { g: "ss", p: "s" }, "hiss", 1)), ["same_sound_spelling", "/s/"]);
});
test("SD r23/r27: every correction sound is a petal, at the wrong tile or the slot", () => {
  const wrong = {} as Element, slot = {} as Element;
  const c = correction("s", sh, "shop", 1, { wrong, slot });
  const sounds = c.filter((x): x is Extract<Say, { sound: string }> => "sound" in x);
  assert.deepEqual(sounds.map((x) => [x.sound, x.show, x.at]), [["s", "petal", wrong], ["sh", "petal", slot]]);
});

// ---------------------------------------------------------------- praise
const env = (has: (id: string) => boolean = () => true) => ({ has, rand: () => 0 });
function run(answers: PraiseOpts[], has?: (id: string) => boolean): (string | null)[] {
  let s: PraiseState = freshPraise();
  return answers.map((o) => {
    const r = praiseStep(s, { every: 2, ...o }, env(has));
    s = r.state;
    return r.line;
  });
}
test("A4: praise every second right answer, never when replaced, never before the closing line", () => {
  const out = run(Array.from({ length: 6 }, () => ({})));
  assert.deepEqual(out.map((x) => x !== null), [false, true, false, true, false, true]);
  const replaced = run([{}, { replaced: true }, {}, { closingNext: true }]);
  assert.deepEqual(replaced.map((x) => x !== null), [false, false, true, false]);
  assert.deepEqual(run([{ every: 3 }, { every: 3 }, { every: 3 }]).map((x) => x !== null), [false, false, true], "warm-ups: every third");
});
test("TS §5.3: specific praise first, then generic: generic is at most half; never the same line twice running", () => {
  // a level of ten answers: five praise lines
  const out = run(Array.from({ length: 10 }, () => ({ game: "firstsound" as const }))).filter((x): x is string => !!x);
  assert.equal(out.length, 5);
  assert.equal(out[0], "tv_praise_start", "the game's own line first");
  const generic = out.filter((x) => (PRAISE_EVERYDAY as readonly string[]).includes(x));
  assert.ok(generic.length <= out.length / 2, out.join());
  for (let i = 1; i < out.length; i++) assert.notEqual(out[i], out[i - 1], out.join());
  const long = run(Array.from({ length: 30 }, () => ({ game: "firstsound" as const })));
  assert.ok(long.filter((x) => x === "tv_praise_start").length <= 3, "a specific line at most three times a level");
  const two = run(Array.from({ length: 8 }, () => ({ game: "which" as const }))).filter(Boolean);
  assert.deepEqual(two.filter((x) => x!.startsWith("tv_praise")), ["tv_praise_row", "tv_praise_order"], "a game's specific lines take turns");
});
test("TS §5.3: after a miss, 'you kept going'; after help, 'now you've got it'", () => {
  assert.deepEqual(run([{}, { keptGoing: true, game: "build" }]), [null, "tv_praise_kept_going"]);
  assert.deepEqual(run([{}, { helped: true }]), [null, "tv_praise_helped"]);
});
test("TS §5.3: the big words are out of the everyday rotation", () => {
  for (const id of ["yay_3", "yay_5", "yay_6", "yay_9", "yay_10"]) assert.ok(!(PRAISE_EVERYDAY as readonly string[]).includes(id), id);
  assert.ok(!(REWARD_PRAISE as readonly string[]).includes("yay_6"), "yay_6 is the streak's own line");
  const out = run(Array.from({ length: 10 }, () => ({})), (id) => !id.startsWith("tv_")).filter(Boolean);
  for (const x of out) assert.ok(["yay_1", "yay_2", "yay_4", "yay_8"].includes(x as string), String(x));
});
test("praiseFor encourages every answer by default while respecting competing feedback", () => {
  resetPraise();
  assert.notEqual(praiseFor(), null);
  assert.notEqual(praiseFor(), null);
  assert.equal(praiseFor({ replaced: true }), null);
  assert.equal(praiseFor({ closingNext: true }), null);
  resetPraise();
  assert.notEqual(praiseFor(), null, "encourage the first answer of a new level");
});

// ---------------------------------------------------------------- picture games (TEACHER_SCRIPT §5.4)
import { pictureCorrection } from "./feedback";
import { LINES } from "../content/lines";
const HAS = new Set(LINES.map((l) => l.id));
const only = (xs: string[]) => xs.filter((x) => !x.startsWith("tv_") && !x.startsWith("fm_") || HAS.has(x));
test("TS §5.4: First Sounds' first miss: the card's first sound, 'Moon starts with a different sound.', 'Listen for the start…' /s/", () => {
  const c = pictureCorrection({ game: "firstsound", tapped: "moon", target: "sun", attempt: 1, p: "s" });
  assert.deepEqual(c.echo, [{ onset: "moon" }]);
  assert.deepEqual(ids(c.say), only(["fm_diff_moon", "tv_fix_start", "/s/"]));
  const petal = c.say.find((x) => "sound" in x) as { show?: string } | undefined;
  assert.equal(petal?.show, "petal");
});
test("TS §5.4: Sound Hunt, Ninja Ears, Slow Words and Guess My Word rephrase and end on the answer", () => {
  assert.deepEqual(ids(pictureCorrection({ game: "soundhunt", tapped: "mat", target: "lid", attempt: 1, p: "i" }).say), only(["tv_not_in_middle", "tv_fix_middle", "/i/"]));
  assert.deepEqual(ids(pictureCorrection({ game: "tap", tapped: "cat", target: "sock", attempt: 1 }).say), only(["tv_find_again_sock"]));
  assert.deepEqual(ids(pictureCorrection({ game: "slowpick", tapped: "bag", target: "van", attempt: 1 }).say), [...only(["tv_slow_again"]), "[van]"]);
  const guess = pictureCorrection({ game: "sounds", tapped: "mop", target: "map", attempt: 1, segs: [{ g: "m", p: "m" }, { g: "a", p: "a" }, { g: "p", p: "p" }] });
  const blend = guess.say.find((x) => "sounds" in x) as { show?: string } | undefined;
  assert.equal(blend?.show, "hidden", "oral blending: neutral dots, no petals (Dec1)");
});
test("TS §5.4: a second miss in a picture game is done together, and hands the turn back", () => {
  const c = pictureCorrection({ game: "firstsound", tapped: "moon", target: "sun", attempt: 2, p: "s" });
  assert.deepEqual(ids(c.say), [HAS.has("tv_fix_together") ? "tv_fix_together" : "fm_its_this"]);
});

// ---------------------------------------------------------------- fast and slow (FS1, TEACHER_SCRIPT §9)
import { listenLead, praiseBy, praiseWanted } from "./feedback";
test("FS1: a spelling slip's first miss plays the plain word, never the gapped slow word; its lead never promises 'slowly'", () => {
  for (let i = 0; i < 4; i++) {
    const c = correction("t", sh, "shop", 1);
    assert.ok(c.some((x) => "word" in x && x.word === "shop"), JSON.stringify(c));
    assert.ok(!c.some((x) => "stretch" in x));
    assert.notEqual(ids(c)[0], "audit_listen_slowly");
  }
  const leads = new Set(Array.from({ length: 6 }, () => listenLead("sun", { slow: true })));
  assert.ok(leads.has("audit_listen_slowly"), "with the slow word, the 'slowly' lead rotates in");
});
test("FS-F2.1: a fast/slow line in the praise slot is the answer's praise: the rhythm starts again from it", () => {
  resetPraise();
  praiseFor({ every: 2 });
  assert.equal(praiseWanted({ every: 2 }), true);
  praiseBy("tv_fs_praise_every");
  assert.equal(praiseWanted({ every: 2 }), false, "counted as praised");
  const next = praiseFor({ game: "build" });
  assert.ok(next && next !== "tv_fs_praise_every" && !next.startsWith("tv_praise_"), `a generic line next (${next})`);
});

test("verify round 1: a first miss on the word's first sound never asks for \"the next sound\"", () => {
  const t = { g: "t", p: "t" as const }, a = { g: "a", p: "a" as const };
  const firsts = [0, 1, 2, 3].map(() => ids(correction("s", t, "tap", 1))[0]);
  for (const lead of firsts) assert.ok(["tv_listen_here", "listen_here", "audit_spelling_help_plain"].includes(lead as string), `the first sound: ${lead}`);
  assert.equal(new Set(firsts).size, 2, "two sentences take turns on the first sound");
  const later = new Set([0, 1, 2, 3].map(() => ids(correction("s", a, "tap", 1))[0]));
  assert.ok(later.has("audit_listen_next"), "a later sound still rotates in \"What sound comes next?\"");
});
