/// <reference types="node" />
// The read slider's rules (src/ui/ReadSlider.tsx SlideCore, docs/READ_SLIDER.md §4): direction (a sweep to the left is
// the wrong way, a wobble is not; a start in the middle; a restart), the ratchet (a part fires only when the voice is
// free and the tortoise reaches it; clips never overlap; a flick reads every part in order with its gaps; the tortoise
// never passes the next part while the voice is busy and never moves left), lifting part-way, taps, and the geometry
// (a ≥ 64 CSS px handle on an 844×390 phone, the band clear of the nav row, the ninja zone and the Help zone).
// Run: bun test ./src/ui/read-slider.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

// ReadSlider.tsx draws with React and speaks: a minimal browser for importing it (nothing here renders or plays audio)
const mem = new Map<string, string>();
const g = globalThis as Record<string, unknown>;
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
g.document ??= { addEventListener() {}, visibilityState: "visible", createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), querySelector: () => null, querySelectorAll: () => [], body: {}, documentElement: {} };
g.window ??= globalThis;
g.addEventListener ??= () => {};
g.removeEventListener ??= () => {};
g.location ??= { search: "", href: "http://localhost/", pathname: "/", hash: "" };
g.navigator ??= { userAgent: "bun" };
g.matchMedia ??= () => ({ matches: false, addEventListener() {} });
g.Image ??= class { set src(_v: string) {} };
g.requestAnimationFrame ??= () => 0;
g.AudioContext ??= class { createGain() { return { gain: { value: 1, setValueAtTime() {} }, connect() {} }; } get destination() { return {}; } };

const R = await import("./ReadSlider");
const { SlideCore, geoFor, BACK_PX, MIDDLE_PX, CARRY_PX, WORD_GAP_MS, HANDLE_W, FLICK_MS } = R;
type Ev = ReturnType<InstanceType<typeof SlideCore>["pump"]>[number];

/** A little world: the core, a clock, and a voice that says each fired part for `clipMs`. */
function world(n = 2, mode: "words" | "sounds" = "words", clipMs = 700) {
  const geo = geoFor(n, mode);
  const core = new SlideCore(geo, mode === "words" ? WORD_GAP_MS : 250);
  let t = 0;
  const log: Ev[] = [];
  const playing: { i: number; end: number }[] = [];
  const said: { i: number; start: number; end: number }[] = [];
  const handles: number[] = [];
  const take = (evs: Ev[]) => {
    for (const e of evs) {
      log.push(e);
      if (e.kind === "fire") {
        playing.push({ i: e.i, end: t + clipMs });
        said.push({ i: e.i, start: t, end: t + clipMs });
      }
    }
    handles.push(core.handle(t));
  };
  /** time passes in 10 ms steps: clips end, the voice frees, parts fire */
  const tick = (ms: number) => {
    for (let k = 0; k < ms; k += 10) {
      t += 10;
      for (const p of [...playing]) if (t >= p.end) {
        playing.splice(playing.indexOf(p), 1);
        take(core.clipDone(p.i, t));
      }
      take(core.pump(t));
    }
  };
  const down = (x: number) => take(core.pointerDown(x, t));
  const move = (x: number) => take(core.pointerMove(x, t));
  const up = (x: number) => take(core.pointerUp(x, t));
  const tapPart = (i: number) => {
    const evs = core.tapPart(i, t);
    take(evs);
    return evs;
  };
  /** a finger from x0 to x1 over `ms`, moving every 16 ms */
  const slide = (x0: number, x1: number, ms: number, lift = true) => {
    down(x0);
    const steps = Math.max(1, Math.round(ms / 16));
    for (let k = 1; k <= steps; k++) {
      tick(ms / steps);
      move(x0 + ((x1 - x0) * k) / steps);
    }
    if (lift) up(x1);
  };
  const kinds = () => log.map((e) => e.kind);
  const fired = () => log.filter((e): e is Extract<Ev, { kind: "fire" }> => e.kind === "fire").map((e) => e.i);
  return { geo, core, log, said, handles, tick, down, move, up, slide, tapPart, kinds, fired, now: () => t };
}

test("geometry: the handle is at least 64 CSS px on an 844×390 phone, and the band is clear of the nav row and the zones", () => {
  // the stage's scale at 844×390 on a touch phone: height-bound, less Stage's touch insets (10 px top, 26 px bottom),
  // so 354 / 720 = 0.49 (measured in the harness: the 140 px handle is 69 CSS px)
  const scale = (390 - 10 - 26) / 720;
  assert.ok(HANDLE_W * scale >= 64, `handle ${HANDLE_W * scale} CSS px`);
  for (const [n, mode] of [[2, "words"], [3, "words"], [3, "sounds"], [4, "sounds"]] as const) {
    const g = geoFor(n, mode);
    assert.ok(g.band.y + g.band.h <= 562, "the band stops above the nav row (Next's top is y 562)");
    assert.ok(g.band.x >= 330, "the band is right of the ninja zone (x 0–330)");
    assert.ok(g.band.x + g.band.w <= 1116, "and left of the Help zone (x 1116)");
    assert.ok(g.band.h >= 150, "a tall band for wobbly fingers");
    assert.ok(g.rabbit.x + g.rabbit.d / 2 <= 1128 && g.rabbit.y + g.rabbit.d / 2 <= 556, "the rabbit keeps out of the Help zone");
    assert.ok(g.rabbit.y + g.rabbit.d / 2 <= 482, "and above a two-line caption bubble (grown-ups' captions)");
    for (let i = 1; i < n; i++) {
      assert.ok(g.fire[i] > g.fire[i - 1], "items read left to right");
      assert.ok(g.wait[i] > g.fire[i - 1] && g.wait[i] < g.fire[i], "the tortoise waits between the parts");
    }
    assert.ok(g.startZone < g.fire[1] && g.start < g.fire[0] && g.doneX <= g.end, "the start zone, the fire points and the end");
  }
});

test("a slow slide reads each part once, as the tortoise reaches it, then the slow way is done", () => {
  const w = world();
  w.slide(w.geo.start, w.geo.end, 4000);
  w.tick(1500);
  assert.deepEqual(w.fired(), [0, 1]);
  assert.equal(w.kinds().filter((k) => k === "slowDone").length, 1);
  assert.equal(w.core.over, true);
  // (slowly, each part fires close to where it is: the first before the finger is halfway along)
  assert.ok(w.said[0].start < w.said[1].start);
});

test("the ratchet: clips never overlap, and a gap of 300 ms comes between words", () => {
  const w = world(3, "words", 800);
  w.slide(w.geo.start, w.geo.end, 400); // quicker than the voice
  w.tick(5000);
  assert.deepEqual(w.fired(), [0, 1, 2]);
  for (let k = 1; k < w.said.length; k++) assert.ok(w.said[k].start >= w.said[k - 1].end + WORD_GAP_MS, `part ${k} started ${w.said[k].start - w.said[k - 1].end} ms after the last ended`);
});

test("a flick reads every part in order, with the gaps, and counts as a flick", () => {
  const w = world(2, "words", 600);
  w.slide(w.geo.start, w.geo.end, 120);
  w.tick(4000);
  assert.deepEqual(w.fired(), [0, 1]);
  const done = w.log.find((e) => e.kind === "slowDone");
  assert.ok(done && done.kind === "slowDone" && done.flick, "a flick");
  assert.equal(w.core.flicks, 1);
  assert.ok(w.said[1].start - w.said[0].end >= WORD_GAP_MS);
  assert.ok(FLICK_MS > 120);
});

test("the tortoise never passes the next part while the voice is busy, and never moves left during a read", () => {
  const w = world(2, "words", 900);
  w.slide(w.geo.start, w.geo.end, 200, false); // the finger races to the end and stays down
  const heldAt = w.core.handle(w.now());
  assert.ok(heldAt <= w.geo.wait[1] + 0.5, `held at ${heldAt}, before part 2 (${w.geo.wait[1]})`);
  w.tick(3000);
  w.up(w.geo.end);
  for (let k = 1; k < w.handles.length; k++) assert.ok(w.handles[k] >= w.handles[k - 1] - 0.001, `moved left at step ${k}`);
});

test("a wobble back (less than BACK_PX) is not the wrong way, and reads nothing twice", () => {
  const w = world();
  w.down(w.geo.start);
  w.move(w.geo.fire[0] + 30);
  w.tick(50);
  w.move(w.geo.fire[0] + 30 - (BACK_PX - 20)); // back a little
  w.move(w.geo.fire[0] + 60);
  w.move(w.geo.end);
  w.up(w.geo.end);
  w.tick(3000);
  assert.ok(!w.kinds().includes("wrong"));
  assert.deepEqual(w.fired(), [0, 1]);
});

test("pulling the tortoise back across what it has read is the wrong way: nothing more is read", () => {
  const w = world(3, "words", 500);
  w.down(w.geo.start);
  w.move(w.geo.fire[0] + 20);
  w.tick(20);
  w.move(w.geo.fire[0] + 20 - BACK_PX - 5);
  const wrong = w.log.find((e) => e.kind === "wrong");
  assert.ok(wrong && wrong.kind === "wrong" && wrong.why === "reversed");
  w.move(w.geo.end); // too late: halted
  w.up(w.geo.end);
  w.tick(3000);
  assert.deepEqual(w.fired(), [0], "only the part already said");
  assert.equal(w.core.halted, true);
  // after the correction the scene resets it, and a fresh slide reads everything
  w.core.reset();
  w.slide(w.geo.start, w.geo.end, 1500);
  w.tick(4000);
  assert.deepEqual(w.fired(), [0, 0, 1, 2]);
});

test("a finger that ran ahead and comes back towards the waiting tortoise is not pulling it back (the judge, 27 Sep)", () => {
  // the judge's run: the finger at 960 while the tortoise waits (a clip playing), then back to 760, never left of it:
  // "That way is backwards…" fired 0.64 s in, because the pull was measured from the finger's furthest point
  const w = world(3, "words", 900);
  w.slide(w.geo.start, 960, 200, false);
  const held = w.core.handle(w.now());
  assert.ok(held < 760 && held <= w.geo.wait[1] + 0.5, `the tortoise waits at ${held}`);
  for (const x of [900, 820, 760, held + 10, held - 20]) w.move(x); // back towards it, a wobble at it
  assert.ok(!w.kinds().includes("wrong"), "no wrong way");
  // the clip ends and the tortoise catches up to the finger's furthest point, past the finger: still not a pull
  w.tick(1200);
  const caught = w.core.handle(w.now());
  assert.ok(caught - (held - 20) >= BACK_PX, `the tortoise (${caught}) is now well ahead of the finger`);
  w.move(held - 25);
  assert.ok(!w.kinds().includes("wrong"), "the tortoise catching up is not the child pulling it");
  w.move(w.geo.end);
  w.up(w.geo.end);
  w.tick(4000);
  assert.deepEqual(w.fired(), [0, 1, 2], "and every part is read");
});

test("…but the tortoise pulled back from where the finger holds it, while it waits, is the wrong way", () => {
  const w = world(3, "words", 900);
  w.slide(w.geo.start, 960, 200, false);
  const held = w.core.handle(w.now());
  w.move(held + 5); // back to the tortoise
  w.move(held - BACK_PX - 5); // and on past it, pulling it back
  const wrong = w.log.find((e) => e.kind === "wrong");
  assert.ok(wrong && wrong.kind === "wrong" && wrong.why === "reversed");
});

test("a tap on the tortoise (either half) moves nothing, and gives it back: a drop, not a paused read", () => {
  for (const at of [0, 45]) {
    const w = world();
    w.down(w.geo.start + at);
    w.tick(80);
    w.up(w.geo.start + at + 2);
    assert.equal(w.core.handle(w.now()), w.geo.start, "the tortoise stays on its dot");
    assert.equal(w.core.begun, false);
    assert.deepEqual(w.kinds().filter((k) => k !== "grab" && k !== "tap"), ["drop"], `at +${at}`);
  }
  // a press and no drag, held long past a tap: the same
  const w = world();
  w.down(w.geo.start);
  w.tick(2000);
  w.up(w.geo.start + 3);
  assert.deepEqual(w.kinds(), ["grab", "drop"]);
});

test("a resting palm on the cards gives way to the finger that takes the tortoise", () => {
  const w = world();
  w.down(w.geo.fire[1]); // the palm, first, on the second card: holds nothing
  assert.equal(w.core.down?.grabbed, false);
  assert.ok(w.core.wouldGrab(w.geo.start, w.now()), "a finger on the tortoise would take it");
  assert.ok(!w.core.wouldGrab(w.geo.fire[1] + 40, w.now()), "another touch on the cards would not");
  w.core.cancelDown();
  w.slide(w.geo.start, w.geo.end, 1500);
  w.tick(3000);
  assert.deepEqual(w.fired(), [0, 1]);
});

test("a touch on the right that moves left is the wrong way (backwards), and reads nothing", () => {
  const w = world();
  w.slide(w.geo.end - 10, w.geo.start + 150, 600);
  w.tick(1500);
  const wrong = w.log.find((e) => e.kind === "wrong");
  assert.ok(wrong && wrong.kind === "wrong" && wrong.why === "backwards");
  assert.deepEqual(w.fired(), []);
  assert.equal(w.core.handle(w.now()), w.geo.start, "the tortoise never left home");
});

test("a swipe to the left that starts on the tortoise, or on the first card, is the wrong way too, not a drop (the judge, 27 Sep)", () => {
  // the judge's run: a right-to-left swipe from the tortoise (or the first card, which is in the start zone and so takes
  // the tortoise) read nothing and said nothing: the lift sent `drop`, never the correction
  const g0 = geoFor(2, "words");
  const firstCard = g0.boxes[0].x + g0.boxes[0].w / 2;
  for (const x0 of [g0.start + 40, firstCard]) {
    const w = world();
    assert.ok(w.core.wouldGrab(x0, w.now()), `a touch at ${x0} takes the tortoise`);
    w.slide(x0, x0 - BACK_PX - 30, 500);
    w.tick(1500);
    const wrong = w.log.find((e) => e.kind === "wrong");
    assert.ok(wrong && wrong.kind === "wrong" && wrong.why === "backwards", `from ${x0}: ${w.kinds().join(", ")}`);
    assert.ok(!w.kinds().includes("drop") && !w.kinds().includes("lift"), "the correction, not a drop");
    assert.deepEqual(w.fired(), []);
    assert.equal(w.core.handle(w.now()), w.geo.start, "the tortoise never left home");
  }
  // …but a wobble on the tortoise (less than BACK_PX to the left), then the right way, reads everything
  const w = world();
  w.down(w.geo.start + 40);
  w.move(w.geo.start + 40 - (BACK_PX - 20));
  w.move(w.geo.end);
  w.up(w.geo.end);
  w.tick(3000);
  assert.ok(!w.kinds().includes("wrong"), w.kinds().join(", "));
  assert.deepEqual(w.fired(), [0, 1]);
});

test("starting in the middle and moving right reads nothing; each time is counted", () => {
  const w = world();
  w.slide(w.geo.fire[1] - 40, w.geo.fire[1] - 40 + MIDDLE_PX + 40, 300);
  w.slide(w.geo.fire[1] - 40, w.geo.end, 300);
  w.tick(1500);
  assert.deepEqual(w.fired(), []);
  const middles = w.log.filter((e) => e.kind === "middle").map((e) => (e.kind === "middle" ? e.n : 0));
  assert.deepEqual(middles, [1, 2]);
});

test("a tap without a drag on the tortoise is a tap, not a read", () => {
  const w = world();
  w.down(w.geo.start);
  w.tick(80);
  w.up(w.geo.start + 4);
  const tap = w.log.find((e) => e.kind === "tap");
  assert.ok(tap && tap.kind === "tap" && tap.grabbed);
  assert.deepEqual(w.fired(), []);
});

test("lifting part-way keeps what was read; a touch near the tortoise carries on", () => {
  const w = world(2, "words", 500);
  w.slide(w.geo.start, w.geo.fire[0] + 40, 600);
  w.tick(800);
  assert.deepEqual(w.fired(), [0]);
  assert.ok(w.kinds().includes("lift"));
  const h = w.core.handle(w.now());
  w.slide(h + CARRY_PX - 20, w.geo.end, 800); // picks it up just ahead of the tortoise
  w.tick(2000);
  assert.deepEqual(w.fired(), [0, 1]);
  assert.ok(w.core.over);
});

test("a paused read and a touch back on the start dot: a fresh read from the start", () => {
  const w3 = world(3, "words", 400);
  w3.slide(w3.geo.start, w3.geo.fire[1] + 10, 900);
  w3.tick(1500);
  assert.deepEqual(w3.fired(), [0, 1]);
  w3.slide(w3.geo.start, w3.geo.end, 1500);
  w3.tick(3000);
  assert.ok(w3.kinds().includes("restart"));
  assert.deepEqual(w3.fired(), [0, 1, 0, 1, 2]);
  assert.ok(w3.core.over);
});

test("taps on the cards in order count as a read; out of order they don't", () => {
  const w = world(2, "words", 300);
  assert.deepEqual(w.tapPart(1), [], "the second card first: nothing");
  const a = w.tapPart(0);
  assert.deepEqual(a.map((e) => e.kind), ["fire"]);
  w.tick(700);
  const b = w.tapPart(1);
  assert.deepEqual(b.map((e) => e.kind), ["fire"]);
  w.tick(1000);
  assert.ok(w.core.over, "and the slow way is done");
});

test("sounds: three dots, gaps of SLOW_GAP_MS, in order, however quick the finger", () => {
  const w = world(3, "sounds", 240);
  w.slide(w.geo.start, w.geo.end, 150);
  w.tick(3000);
  assert.deepEqual(w.fired(), [0, 1, 2]);
  for (let k = 1; k < 3; k++) assert.ok(w.said[k].start - w.said[k - 1].end >= 250);
});

test("the slow way isn't done while the finger rests on the last part (not yet at the end), then is when it lifts", () => {
  const w = world(2, "words", 300);
  w.slide(w.geo.start, w.geo.fire[1] + 5, 1200, false);
  w.tick(1500);
  assert.deepEqual(w.fired(), [0, 1]);
  assert.ok(!w.core.over, "the finger is still down short of the end");
  w.up(w.geo.fire[1] + 5);
  assert.ok(w.core.over);
});
