/// <reference types="node" />
// The narrative ledger's runtime (src/scenes/narrate.tsx): read-back reminders spaced in sessions (SCRIPT_FIXES C4,
// Dec4), the letters line at a teach moment (A2), the two-letter correction (C5), and the teacher's voice per game
// (TEACHER_SCRIPT §2.2–§2.3: gameForm, framed, played, readyAsk, the old-save migration, the map preview).
// Run: bun test src/engine/narrate.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

// narrate.tsx draws pictures and speaks: a minimal browser for importing it (nothing here plays audio)
const mem = new Map<string, string>();
const g = globalThis as Record<string, unknown>;
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
g.document ??= { addEventListener() {}, visibilityState: "visible", createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), querySelector: () => null, body: {} };
g.window ??= globalThis;
g.addEventListener ??= () => {};
g.location ??= { search: "", href: "http://localhost/", pathname: "/", hash: "" };
g.navigator ??= { userAgent: "bun" };
g.matchMedia ??= () => ({ matches: false, addEventListener() {} });
g.Image ??= class { set src(_v: string) {} };
g.requestAnimationFrame ??= () => 0;
g.AudioContext ??= class { createGain() { return { gain: { value: 1, setValueAtTime() {} }, connect() {} }; } get destination() { return {}; } };

// game time is performance.now() (× FAST): the tests move it on
const realNow = performance.now.bind(performance);
let skipped = 0;
performance.now = () => realNow() + skipped;
const later = (minutes: number) => void (skipped += minutes * 60_000);

const N = await import("../scenes/narrate");
const { store } = await import("./store");
const { LEVELS } = await import("../content/worlds");
const { WORD_BY_TEXT } = await import("../content/phonics");
const { LINES } = await import("../content/lines");
const HAS = new Set(LINES.map((l) => l.id));
const lv = (id: string) => LEVELS.find((l) => l.id === id)!;
const session = (n: number) => store.set((s) => void (s.sessions = n));
const lines = (xs: { line?: string }[]) => xs.flatMap((x) => ("line" in x && x.line ? [x.line] : []));
const segs = (w: string) => WORD_BY_TEXT[w].segs;

test("C4/Dec4: a read-back reminder ends on the sound's petal; one a level; not again that session", () => {
  store.reset();
  session(5);
  N.beginLevel(lv("w4-2"));
  const at = {} as Element;
  const r = N.lettersReminder(segs("ship"), () => at);
  assert.ok(r, "an old spelling's first reminder is due");
  assert.equal(r!.p, "sh");
  const last = r!.say.at(-1) as { sound?: string; show?: string; at?: unknown };
  assert.deepEqual([last.sound, last.show, last.at], ["sh", "petal", at], "…it's one sound. /sh/, popping above the lit tile");
  assert.deepEqual(lines(r!.say as never), ["t_two_letters"]);
  r!.done();
  assert.equal(N.lettersReminder(segs("chip")), null, "one a level");
  N.beginLevel(lv("w4-3"));
  assert.equal(N.lettersReminder(segs("shop")), null, "sh: not twice in a session");
  const ch = N.lettersReminder(segs("chip"));
  assert.ok(ch, "another spelling, the next level");
  ch!.done();
  N.beginLevel(lv("w4-4"));
  assert.equal(N.lettersReminder(segs("thin")), null, "two a session");
  session(6);
  N.beginLevel(lv("w4-5"));
  assert.ok(N.lettersReminder(segs("shop")), "sh again in the next session");
});

test("C4: no reminder for a spelling taught this session", () => {
  store.reset();
  session(8);
  N.beginLevel(lv("w5-1"));
  const taught = lv("w5-1").teach ?? [];
  assert.ok(taught.length > 0);
  assert.equal(N.taughtThisSession("letters:sh"), taught.some((t) => t.split("=")[0] === "sh"));
  if (taught.some((t) => t.split("=")[0] === "sh")) assert.equal(N.lettersReminder(segs("ship")), null);
});

test("A2: the letters line at a Learn: full, then 'two letters too', then nothing", () => {
  store.reset();
  session(9);
  later(10);
  N.beginLevel(lv("w5-1"));
  assert.deepEqual(lines(N.lettersFor({ g: "sh", p: "sh" }) as never), ["t_two_letters"]);
  assert.deepEqual(lines(N.lettersFor({ g: "ch", p: "ch" }) as never), HAS.has("st_two_letters_too") ? ["st_two_letters_too"] : []);
  assert.deepEqual(lines(N.lettersFor({ g: "th", p: "th" }) as never), [], "two letters lines in the last minute: the letters are on screen");
  assert.deepEqual(lines(N.lettersFor({ g: "tch", p: "ch" }) as never), ["t_three_letters"], "three letters: always in full");
  assert.equal(N.taughtThisSession("ch"), true);
  later(3);
  assert.deepEqual(lines(N.lettersFor({ g: "ee", p: "ee" }) as never), ["t_two_letters"], "three minutes on: in full again");
});

test("C5: a split spelling is corrected as a spelling, and reveals the right tile on the first miss", () => {
  const need = { g: "sh", p: "sh" as const };
  const c = N.correctionFor("s", need, "shop", 1, {});
  assert.deepEqual(lines(c as never), ["thats", "we_need", "t_two_letters"]);
  assert.equal(N.revealsNow("s", need, 1), true);
  assert.equal(N.revealsNow("t", need, 1), false);
  assert.equal(N.revealsNow("t", need, 2), true);
  assert.equal(N.revealsNow("s", { g: "ss", p: "s" }, 1), false, "< s > for < ss > is the same sound");
});

test("TV §2.2: full the first time; none later that session (a level opens on short); recap the next day; short once told twice", () => {
  store.reset();
  session(1);
  N.beginLevel(lv("w1-wu5"));
  assert.equal(N.gameForm("sounds"), "full");
  const ask = N.readyAsk("sounds", "full");
  assert.deepEqual(ask, { line: "tv_ready_first", once: "ready:first" }, "the save's first Ready");
  N.framed("sounds", ask);
  assert.equal(N.onceInSave("ready:first"), false);
  assert.deepEqual(N.readyAsk("which", "full"), { line: "tv_ready_paw", once: "ready:paw" }, "the second introduces the paw");
  N.played("sounds");
  assert.equal(N.gameForm("sounds"), "none");
  assert.equal(N.gameForm("sounds", { opening: true }), "short");
  session(2);
  assert.equal(N.gameForm("sounds"), "recap");
  assert.equal(N.readyAsk("sounds", "recap"), null, "an ordinary recap has no hold");
  N.framed("sounds");
  N.framed("sounds");
  assert.equal(N.gameExposure("sounds")?.n, 2, "one telling a session");
  N.played("sounds", { struggled: true });
  session(3);
  assert.equal(N.gameForm("sounds"), "recap", "a struggle brings the recap back");
  assert.deepEqual(N.readyAsk("sounds", "recap"), { line: "tv_ready_go" }, "…with its Ready");
  N.played("sounds");
  session(4);
  assert.equal(N.gameForm("sounds"), "short");
});

test("TV §2.2: an old save plays the games it has stars in short, and w2-1 still gets its full frame", () => {
  store.reset();
  session(12);
  store.set((s) => {
    for (const id of ["w1-wu1", "w1-2", "w1-4", "w1-6"]) s.stars[id] = 3;
    (s as { narr?: Record<string, unknown> }).narr = { "dojo:welcome": { n: 1, at: [4] }, "dojo:first": { n: 1, at: [4] } };
  });
  assert.equal(N.gameForm("tap"), "short");
  assert.equal(N.gameForm("build"), "short");
  assert.equal(N.gameForm("battle"), "short");
  assert.equal(N.gameForm("learn"), "full", "the first Dojo lesson is framed in full");
  N.played("battle");
  const narr = (store.get() as { narr?: Record<string, { n: number }> }).narr!;
  assert.equal(narr["games:v1"]?.n, 1, "the migration is written with the first play");
  assert.equal(narr["game:tap"]?.n, 2);
});

test("TS §5.8: the map previews a game the child has never played, once", () => {
  store.reset();
  session(2);
  const pv = N.mapPreview(lv("w1-wu5"));
  if (!HAS.has("tv_map_next_sounds")) return;
  assert.deepEqual(pv, { game: "sounds", line: "tv_map_next_sounds", key: "map:next:sounds" });
  N.heard(pv!.key);
  assert.equal(N.mapPreview(lv("w1-wu5")), null);
  store.reset();
  N.played("build");
  assert.equal(N.mapPreview(lv("w1-4")), null, "a game already played");
});
