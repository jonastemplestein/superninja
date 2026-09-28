/// <reference types="node" />
// The confirm (src/ui/Confirm.tsx, docs/CONFIRM.md §3): every way a question resolves (YES, NO, Home, 40 s of quiet, a
// cancel), the guard against the tap that opened it, the idle ladder and where the hand points, Home under a leave
// question (it points at the house, never answers), taps off the answers (they show the way), the presets' wording, what
// the screen underneath is told (paused, resumed, its speech dropped only on YES), __snState while it is up, where the
// answers are drawn, and the pictures (never the same one twice).
// Run: bun test ./src/ui/confirm.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

// Confirm.tsx draws with React and speaks: a minimal browser for importing it (nothing here renders or plays audio)
const mem = new Map<string, string>();
const g = globalThis as Record<string, unknown>;
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
g.document ??= { addEventListener() {}, visibilityState: "visible", createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), querySelector: () => null, body: {} };
g.window ??= globalThis;
g.addEventListener ??= () => {};
g.removeEventListener ??= () => {};
g.location ??= { search: "", href: "http://localhost/", pathname: "/", hash: "" };
g.navigator ??= { userAgent: "bun" };
g.matchMedia ??= () => ({ matches: false, addEventListener() {} });
g.Image ??= class { set src(_v: string) {} };
g.requestAnimationFrame ??= () => 0;
g.AudioContext ??= class { createGain() { return { gain: { value: 1, setValueAtTime() {} }, connect() {} }; } get destination() { return {}; } };

const C = await import("./Confirm");
const { LINES } = await import("../content/lines");
type Say = Parameters<typeof C.confirmEnv.say>[0];

// the world, faked: what was said, and what the screen underneath was told. `talkMs` keeps Sensei "talking" that long
const said: string[][] = [];
const calls: string[] = [];
let talkMs = 0;
const lines = (xs: Say) => xs.flatMap((x) => ("line" in x ? [x.line] : []));
Object.assign(C.confirmEnv, {
  now: () => performance.now(),
  say: async (items: Say) => (said.push(lines(items)), await (talkMs ? sleep(talkMs) : Promise.resolve()), true),
  hush: () => calls.push("hush"),
  drop: () => calls.push("drop"),
  pause: (on: boolean) => calls.push(on ? "pause" : "resume"),
  sfx: () => {},
  upright: () => false,
  onUpright: () => () => {},
  mount: () => {},
  idle: [8000, 16000],
  showGapMs: 6000,
  nudgeGapMs: 4000,
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fresh = () => {
  said.length = 0;
  calls.length = 0;
  talkMs = 0;
  C.confirmEnv.idle = [8000, 16000];
  C.confirmEnv.showGapMs = 6000;
  C.confirmEnv.nudgeGapMs = 4000;
};
const leave = (o: Partial<Parameters<typeof C.confirmWith>[0]> = {}) => C.QUESTIONS.leave({ guardMs: 30, homeGuardMs: 30, ...o });
const TEXT = new Map(LINES.map((l) => [l.id, l.text]));

test("YES: resolves yes after the answer says itself; the screen is paused, then resumed with its speech dropped", async () => {
  fresh();
  const p = C.confirmWith(leave());
  assert.equal(C.isConfirmOpen(), true);
  assert.deepEqual(said[0], ["tv_confirm_leave", "tv_confirm_how_home"], "the question, then the answers by their pictures");
  assert.deepEqual(calls, ["pause"]);
  await sleep(40);
  assert.equal(C.confirmNow()?.tap("yes"), true);
  assert.deepEqual(await p, { yes: true, how: "yes" });
  assert.deepEqual(said.at(-1), ["tv_confirm_bye"], "Okay. See you soon!");
  assert.deepEqual(calls, ["pause", "drop", "resume"], "leaving: the line waiting underneath is dropped");
  assert.equal(C.isConfirmOpen(), false);
});

test("NO (the green ▶): resolves no; says \"Let's keep going!\"; the screen resumes with its speech kept", async () => {
  fresh();
  const p = C.confirm(leave());
  await sleep(40);
  assert.equal(C.confirmNow()?.tap("no"), true);
  assert.equal(await p, false);
  assert.deepEqual(said.at(-1), ["tv_confirm_keep"]);
  assert.deepEqual(calls, ["pause", "resume"]);
});

test("Home under the map's question (home: no): resolves no, quietly", async () => {
  fresh();
  const p = C.confirmWith(C.QUESTIONS.replay({ guardMs: 30, homeGuardMs: 30 }));
  await sleep(40);
  assert.equal(C.confirmNow()?.tap("home"), true);
  assert.deepEqual(await p, { yes: false, how: "home" });
  assert.equal(said.length, 1, "nothing said after the question");
  assert.deepEqual(calls, ["pause", "hush", "resume"]);
});

test("Home under a leave question never answers: it points at the house and says the way (held while she talks)", async () => {
  fresh();
  talkMs = 60; // Sensei takes 60 ms to say each thing
  const p = C.confirmWith(leave({ homeGuardMs: 30 }));
  assert.equal(C.confirmNow()?.tap("home"), false, "inside the guard: the tap that opened it");
  assert.equal(C.confirmNow()?.point, null, "and no hand on the house for it");
  await sleep(40);
  assert.equal(C.confirmNow()?.tap("home"), true, "after the guard: handled");
  assert.equal(C.isConfirmOpen(), true, "still asking: Home is not an answer here");
  assert.equal(C.confirmNow()?.point, "yes", "the hand is on the house");
  assert.equal(said.length, 1, "she is still asking: the nudge waits");
  await sleep(40);
  assert.deepEqual(said.at(-1), ["tv_confirm_home_nudge"], "To go home, tap this house.");
  assert.equal(C.confirmNow()?.tap("home"), true);
  await sleep(80);
  assert.equal(said.filter((l) => l[0] === "tv_confirm_home_nudge").length, 1, "mashing Home: the nudge at most every 4 s");
  C.confirmNow()!.tap("yes");
  assert.deepEqual(await p, { yes: true, how: "yes" });
});

test("the gem battle's leave question: the flower, and its own nudge", async () => {
  fresh();
  const p = C.confirmWith(C.QUESTIONS.leaveTrial({ guardMs: 0, homeGuardMs: 0 }));
  assert.deepEqual(said[0], ["tv_confirm_leave_trial", "tv_confirm_how_flower"]);
  await sleep(5);
  C.confirmNow()!.tap("home");
  await sleep(5);
  assert.deepEqual(said.at(-1), ["tv_confirm_flower_nudge"]);
  C.confirmNow()!.tap("no");
  assert.deepEqual(await p, { yes: false, how: "no" });
});

test("a tap off the answers (bubble, face, backdrop) shows the way: the hand on NO at once, the answers named if quiet", async () => {
  fresh();
  const p = C.confirmWith(C.QUESTIONS.replay({ guardMs: 20 }));
  C.confirmNow()!.show("bubble");
  assert.equal(C.confirmNow()?.point, null, "inside the guard: nothing");
  await sleep(30);
  C.confirmNow()!.show("bubble");
  assert.equal(C.confirmNow()?.point, "no");
  await sleep(5);
  assert.deepEqual(said.at(-1), ["tv_confirm_how_pic"], "the bubble: how to answer again");
  C.confirmNow()!.show("backdrop");
  C.confirmNow()!.show("face");
  await sleep(5);
  assert.equal(said.length, 2, "at most every 6 s");
  C.confirmEnv.showGapMs = 0;
  C.confirmNow()!.show("face");
  await sleep(5);
  assert.deepEqual(said.at(-1), ["tv_confirm_play_again", "tv_confirm_how_pic"], "her face: the whole question");
  C.cancelConfirm();
  assert.deepEqual(await p, { yes: false, how: "cancel" });
});

test("the guard: a tap in the first moment (the one that opened it, a mash) is ignored; Home for longer", async () => {
  fresh();
  const p = C.confirmWith(C.QUESTIONS.replay({ guardMs: 60, homeGuardMs: 120 }));
  assert.equal(C.confirmNow()?.ready, false);
  assert.equal(C.confirmNow()?.tap("yes"), false);
  assert.equal(C.confirmNow()?.tap("home"), false);
  assert.equal(C.isConfirmOpen(), true, "still asking");
  await sleep(80);
  assert.equal(C.confirmNow()?.tap("home"), false, "Home still inert: mashing Home can't open and close it");
  assert.equal(C.confirmNow()?.ready, true);
  assert.equal(C.confirmNow()?.tap("no"), true);
  assert.equal(C.confirmNow(), null, "answered: no second answer");
  assert.deepEqual(await p, { yes: false, how: "no" });
});

test("timeout: quiet counts as NO, after the hand on NO and the question again (the idle ladder, game ms)", async () => {
  fresh();
  C.confirmEnv.idle = [20, 40];
  const seen: unknown[] = [];
  const pub = () => (globalThis as any).__snState;
  const p = C.confirmWith(leave({ timeoutMs: 120, guardMs: 0 }));
  await sleep(30);
  seen.push(pub()?.scene, pub()?.point);
  const r = await p;
  assert.deepEqual(r, { yes: false, how: "timeout" });
  assert.ok(said.some((l) => l.join() === "tv_confirm_leave,tv_confirm_how_home"), "asked again at the second step (the question and how)");
  assert.equal(said.filter((l) => l[0] === "tv_confirm_leave").length, 2);
  assert.deepEqual(seen, ["confirm", "no"], "8 s: the hand points at NO, never at YES");
});

test("a question names its own answers; say: null says nothing", async () => {
  fresh();
  const q = C.confirmWith({ id: "replay", ask: { line: "tv_map_replay_swap" }, how: [{ line: "tv_map_replay_how" }], yes: { look: "pic", say: null }, no: { look: "next" }, guardMs: 0 });
  await sleep(5);
  C.confirmNow()!.tap("yes");
  assert.deepEqual(await q, { yes: true, how: "yes" });
  assert.deepEqual(said[0], ["tv_map_replay_swap", "tv_map_replay_how"]);
  assert.equal(said.length, 1, "say: null: the answer says nothing");
});

test("the same question twice (a double tap) is one question; a different one replaces it (cancel)", async () => {
  fresh();
  const a = C.confirmWith(leave());
  const b = C.confirmWith(leave());
  assert.equal(a, b);
  const c = C.confirmWith(C.QUESTIONS.leaveBoss({ guardMs: 0 }));
  assert.deepEqual(await a, { yes: false, how: "cancel" });
  assert.equal(C.confirmNow()?.id, "leave-boss");
  await sleep(5);
  C.confirmNow()!.tap("no");
  assert.deepEqual(await c, { yes: false, how: "no" });
});

test("__snState: the question while it is up; the screen's own value (even one written meanwhile) after", async () => {
  fresh();
  const w = globalThis as any;
  w.__snState = { scene: "map", next: "w1-5" };
  const p = C.confirmWith(leave({ guardMs: 0, slots: { game: "swap" } }));
  assert.equal(w.__snState.scene, "confirm");
  assert.equal(w.__snState.id, "leave");
  assert.equal(w.__snState.safe, "no");
  assert.equal(w.__snState.home, "yes");
  assert.deepEqual(w.__snState.slots, { game: "swap" });
  w.__snState = { scene: "map", next: "w1-6" }; // the map re-renders underneath
  assert.equal(w.__snState.scene, "confirm", "the question stays on top");
  await sleep(5);
  C.confirmNow()!.tap("no");
  await p;
  assert.deepEqual(w.__snState, { scene: "map", next: "w1-6" });
});

test("the answers are drawn away from the tap that opened the question, and are big enough", () => {
  const o = C.QUESTIONS.replay();
  assert.equal(C.pickLayout(o, null), "low", "no tap: the answers below the question");
  assert.equal(C.pickLayout(o, { x: 68, y: 66 }), "low", "Home (top-left)");
  assert.equal(C.pickLayout(o, { x: 440, y: 572 }), "high", "a stone on the bottom row: the answers go up");
  assert.equal(C.pickLayout(o, { x: 500, y: 222 }), "low", "a stone on the top row: the answers stay down");
  assert.ok(C.ANSWER_D * 0.45 >= 96, "≥ 96 CSS px at the smallest stage scale (0.45)");
  assert.ok(C.NEXT_D > C.ANSWER_D, "the safe answer (the ▶) is the bigger one");
});

test("pictures: the bubble never shows the same picture as YES", () => {
  const stone = "/a/i/pic_fishdog.webp";
  assert.deepEqual(C.pictures({ id: "replay", ask: { line: "x" }, pic: stone }), { yes: stone, bubble: null }, "YES takes the question's picture: the bubble says \"?\"");
  assert.deepEqual(C.pictures({ id: "replay", ask: { line: "x" }, pic: stone, yes: { pic: stone } }), { yes: stone, bubble: null }, "MAP §7 passes it twice");
  const lv = "/a/i/pic_mat.webp";
  const p = C.pictures(C.QUESTIONS.leave({ pic: lv }));
  assert.equal(p.bubble, lv, "leave: the level in the bubble");
  assert.notEqual(p.yes, lv, "…and the house on YES");
});

test("wording: no line says \"go back\", and each how line names the ▶ as keep playing (or the next game)", () => {
  const presets = [C.QUESTIONS.replay(), C.QUESTIONS.leave(), C.QUESTIONS.leaveFirst(), C.QUESTIONS.leaveBoss(), C.QUESTIONS.leaveTrial()];
  for (const o of presets) {
    const ids = [...lines(Array.isArray(o.ask) ? o.ask : [o.ask]), ...lines(o.how ?? []), ...lines(o.yes?.nudge ?? [])];
    for (const id of ids) {
      const t = TEXT.get(id);
      assert.ok(t, `${id} is a line`);
      assert.ok(!/go back/i.test(t!), `${o.id}: ${id} says "go back"`);
    }
    const how = lines(o.how ?? []).map((id) => TEXT.get(id)!).join(" ");
    assert.match(how, /green arrow to keep (playing|battling)/, `${o.id}: the ▶ is "keep playing"`);
  }
});
