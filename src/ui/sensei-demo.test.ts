/// <reference types="node" />
// Sensei's demo choreography (src/ui/SenseiDemo.tsx, docs/DEMO_CHOREOGRAPHY.md): the order of a demo (the rule, "Let me
// show you.", the announcement, the paw's flight on "now", "Look!", the press, and only then the effect and its sound,
// the `then` lines, the paw home and a calm beat), the timing rules (nothing within 400 ms of the line that announces it,
// the paw hovers before it presses), several actions, Show me again at the same pace, cancelling, a scene that goes
// away, __snState for bots, the ninja's watch hook, the phone held upright, a line with no audio, the paw's path (up
// into a card from below, never across the cards beside it), and the child's taps while Sensei talks (demoTap: the word
// at her next pause, never on top of her, and the demo carries on).
// Everything runs on a fake clock (below): the world (speech, clips, word timings, the paw) is faked through `demoEnv`.
// Run: bun test ./src/ui/sensei-demo.test.ts
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// SenseiDemo.tsx imports the audio engine, the nav layer and the stage helpers: a minimal browser for importing them
// (nothing here renders or plays audio)
const mem = new Map<string, string>();
const g = globalThis as Record<string, unknown>;
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
g.document ??= { addEventListener() {}, visibilityState: "visible", createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), querySelector: () => null, querySelectorAll: () => [], body: {} };
g.window ??= globalThis;
g.addEventListener ??= () => {};
g.removeEventListener ??= () => {};
g.location ??= { search: "", href: "http://localhost/", pathname: "/", hash: "" };
g.navigator ??= { userAgent: "bun" };
g.matchMedia ??= () => ({ matches: false, addEventListener() {} });
g.Image ??= class { set src(_v: string) {} };
g.requestAnimationFrame ??= () => 0;
g.AudioContext ??= class { createGain() { return { gain: { value: 1, setValueAtTime() {} }, connect() {} }; } get destination() { return {}; } };

const D = await import("./SenseiDemo");
const { senseiDemo, cancelDemo, demoEnv, DEMO, wordTime, arcPath, demoTap, demoPause, demoTalk, pawOutline, PAW_TILT, speechIslands } = D;
type Say = Parameters<typeof demoEnv.say>[0][number];

// ---------------------------------------------------------------- the fake clock (game ms; FAST is 1 here)
let vt = 0;
let seq = 0;
const timers: { at: number; n: number; fn: () => void }[] = [];
const setT = (fn: () => void, ms: number) => void timers.push({ at: vt + Math.max(0, ms), n: seq++, fn });
const flush = async () => {
  for (let k = 0; k < 60; k++) await null;
};
/** Advance the fake clock by `ms`: each timer fires at its own time, and promise chains settle after each. */
async function run(ms: number) {
  const end = vt + ms;
  await flush();
  for (;;) {
    timers.sort((a, b) => a.at - b.at || a.n - b.n);
    const next = timers[0];
    if (!next || next.at > end) break;
    timers.shift();
    vt = next.at;
    next.fn();
    await flush();
  }
  vt = end;
  await flush();
}
/** Run the fake clock until `p` settles. */
async function play<T>(p: Promise<T>, maxMs = 60_000): Promise<T> {
  let done = false;
  void p.finally(() => (done = true));
  for (let t = 0; t < maxMs && !done; t += 10) await run(10);
  assert.ok(done, "the demo never ended");
  return p;
}

// ---------------------------------------------------------------- the faked world
/** How long each clip plays (ms), and where its words start (s). */
const DUR: Record<string, number> = {
  tv_demo_rule_find_sausage: 4200,
  tv_demo_show: 1100,
  tv_show_again: 1900,
  tv_demo_now_tap_sausage: 2400,
  tv_demo_now_tap_sun: 2200,
  tv_demo_now_first_sound: 2300,
  tv_demo_now_last_sound: 2300,
  tv_demo_look: 600,
  "word:sausage": 700,
  "sound:a": 400,
  "sound:m": 600,
  tv_so_pocket: 1600,
};
const WORDS: Record<string, { w: string; at: number }[]> = {
  tv_demo_show: [{ w: "Let", at: 0.02 }, { w: "me", at: 0.18 }, { w: "show", at: 0.36 }, { w: "you", at: 0.7 }],
  tv_demo_now_tap_sausage: [{ w: "I'm", at: 0.03 }, { w: "going", at: 0.2 }, { w: "to", at: 0.42 }, { w: "tap", at: 0.55 }, { w: "on", at: 0.8 }, { w: "the", at: 0.95 }, { w: "sausage", at: 1.1 }, { w: "now", at: 1.9 }],
  tv_demo_now_first_sound: [{ w: "I'm", at: 0.03 }, { w: "going", at: 0.2 }, { w: "to", at: 0.4 }, { w: "find", at: 0.55 }, { w: "the", at: 0.8 }, { w: "first", at: 0.95 }, { w: "sound", at: 1.35 }, { w: "now", at: 1.8 }],
};
/** A clip's audio, for the lines whose word times are estimated from their pauses: `spans` of voice (s), silence
 *  between, at 8 kHz. */
const pcmOf = (durS: number, spans: [number, number][]) => {
  const rate = 8000;
  const data = new Float32Array(Math.round(durS * rate));
  for (const [a, b] of spans) for (let k = Math.round(a * rate); k < Math.round(b * rate); k++) data[k] = 0.3 * Math.sin(k * 0.3);
  return { rate, data };
};
const PCM: Record<string, { rate: number; data: Float32Array }> = {};
const idOf = (it: Say): string => ("line" in it ? it.line : "word" in it ? `word:${it.word}` : "sound" in it ? `sound:${it.sound}` : "?");
type Ev = { t: number; kind: string; what?: string; args?: unknown };
let events: Ev[] = [];
let t0 = 0;
const now = () => Math.round(vt - t0);
const ev = (kind: string, what?: string, args?: unknown) => events.push({ t: now(), kind, what, args });
const clipWaiters: { id: string; resolve: (c: { start: number; end: number }) => void }[] = [];
let missingAudio = new Set<string>();
let upright = false;
const uprightSubs = new Set<() => void>();
let snState: unknown = null;
let speakingN = 0;

function fakeSay(items: Say[]): Promise<boolean> {
  return (async () => {
    speakingN++;
    try {
      for (const it of items) {
        const id = idOf(it);
        if (missingAudio.has(id)) continue; // no clip: nothing plays (engine: load() → null)
        const d = DUR[id] ?? 800;
        const start = vt;
        ev("say", id);
        for (const w of clipWaiters.filter((c) => c.id === id)) {
          clipWaiters.splice(clipWaiters.indexOf(w), 1);
          w.resolve({ start, end: start + d });
        }
        await new Promise<void>((r) => setT(r, d));
        ev("said", id);
      }
    } finally {
      speakingN--;
    }
    return true;
  })();
}
/** A paw that records what it is asked to do and takes the time it is given. */
const fakePaw: NonNullable<typeof demoEnv.paw> = {
  emerge: (from, peek, ms) => (ev("paw", "emerge", { from, peek }), new Promise<void>((r) => setT(r, ms))),
  fly: (to, ms) => (ev("paw", "fly", { to, ms }), new Promise<void>((r) => setT(() => (ev("paw", "arrive", { to }), r()), ms))),
  halo: (box) => ev("paw", box ? "halo" : "halo-off", box),
  press: (at, ms) => (ev("paw", "press", { at }), new Promise<void>((r) => setT(() => (ev("paw", "bottom", { at }), r()), ms))),
  lift: (to, ms) => (ev("paw", "lift", { to }), new Promise<void>((r) => setT(r, ms))),
  home: (to, ms) => (ev("paw", "home", { to }), new Promise<void>((r) => setT(() => (ev("paw", "in"), r()), ms))),
  hide: () => ev("paw", "hide"),
  freeze: (on) => ev("paw", on ? "freeze" : "unfreeze"),
};
/** An element the demo can aim at (stageRect is faked through demoEnv.rect). */
const el = (name: string, x: number, y: number, w = 200, h = 220) => ({ __el: name, x, y, w, h });
type FakeEl = ReturnType<typeof el>;

Object.assign(demoEnv, {
  now: () => vt,
  sleep: (ms: number) => new Promise<void>((r) => setT(r, ms)),
  say: fakeSay,
  speaking: () => speakingN > 0,
  nextClip: (id: string, ms: number) =>
    new Promise((resolve) => {
      const w = { id, resolve };
      clipWaiters.push(w);
      setT(() => {
        const i = clipWaiters.indexOf(w);
        if (i < 0) return;
        clipWaiters.splice(i, 1);
        resolve(null);
      }, ms);
    }),
  words: async (id: string) => WORDS[id],
  pcm: async (id: string) => PCM[id] ?? null,
  fast: 1,
  sfx: (name: string) => ev("sfx", name),
  paw: fakePaw,
  portrait: () => ({ x: 1204, y: 644 }),
  rect: (e: FakeEl) => ({ x: e.x, y: e.y, w: e.w, h: e.h }),
  isElement: (t: unknown) => !!t && typeof t === "object" && "__el" in (t as object),
  upright: () => upright,
  onUpright: (fn: () => void) => (uprightSubs.add(fn), () => void uprightSubs.delete(fn)),
  publish: (st: unknown) => {
    snState = st;
    if (st && (st as { scene?: string }).scene === "demo") ev("state", (st as { step: string }).step);
  },
  current: () => snState,
  log: () => {},
  navLog: (id: string, via: string) => ev("nav", via, id),
});

const L = (line: string): Say => ({ line });
const first = (kind: string, what?: string) => events.find((e) => e.kind === kind && (what === undefined || e.what === what));
const all = (kind: string, what?: string) => events.filter((e) => e.kind === kind && (what === undefined || e.what === what));
const sausage = el("sausage", 560, 200);
const sausageDemo = (o: Partial<Parameters<typeof senseiDemo>[0]> = {}) =>
  senseiDemo({
    id: "tap:sausage",
    rule: [L("tv_demo_rule_find_sausage")],
    announce: [L("tv_demo_now_tap_sausage")],
    target: sausage as unknown as Element,
    press: () => ev("effect", "sausage green"),
    sound: { word: "sausage" },
    ...o,
  });

beforeEach(() => {
  timers.length = 0;
  events = [];
  t0 = vt;
  missingAudio = new Set();
  upright = false;
  uprightSubs.clear();
  snState = { scene: "warmup", next: "sock" };
  clipWaiters.length = 0;
  speakingN = 0;
});
afterEach(() => {
  cancelDemo();
  timers.length = 0;
});

// ---------------------------------------------------------------- the order
test("the order: rule, show, announce, the flight on 'now', Look!, the press, then the effect and its sound, home, beat", async () => {
  await play(sausageDemo({ then: [L("tv_so_pocket")] }));
  const says = all("say").map((e) => e.what);
  assert.deepEqual(says, ["tv_demo_rule_find_sausage", "tv_demo_show", "tv_demo_now_tap_sausage", "tv_demo_look", "word:sausage", "tv_so_pocket"]);
  const paw = all("paw").map((e) => e.what);
  assert.deepEqual(paw, ["emerge", "halo", "fly", "arrive", "press", "bottom", "halo-off", "lift", "home", "in"]);
  const t = (k: string, w?: string) => first(k, w)!.t;
  // the paw comes out on "show", after the rule
  assert.ok(t("paw", "emerge") > t("said", "tv_demo_rule_find_sausage"), `${t("paw", "emerge")} > ${t("said", "tv_demo_rule_find_sausage")}`);
  assert.ok(t("paw", "emerge") - t("say", "tv_demo_show") >= 350, `${t("paw", "emerge") - t("say", "tv_demo_show")} >= ${350}`);
  assert.ok(t("paw", "emerge") - t("say", "tv_demo_show") <= 380, `${t("paw", "emerge") - t("say", "tv_demo_show")} <= ${380}`);
  // the effect: at the bottom of the press, after "Look!", with its word; the `then` line after the word
  assert.equal(t("effect"), t("paw", "bottom"));
  assert.ok(t("effect") > t("said", "tv_demo_look"), `${t("effect")} > ${t("said", "tv_demo_look")}`);
  assert.equal(t("say", "word:sausage"), t("effect"));
  assert.ok(t("say", "tv_so_pocket") >= t("said", "word:sausage") + DEMO.thenGap, `${t("say", "tv_so_pocket")} >= ${t("said", "word:sausage") + DEMO.thenGap}`);
  // "Look!" is said while the paw hovers, and the press waits a real moment after it (never within 300 ms of it)
  assert.ok(t("say", "tv_demo_look") >= t("paw", "arrive"), "Look! while it hovers");
  assert.ok(t("paw", "press") - t("said", "tv_demo_look") >= DEMO.lookToPress, "a moment after Look!");
  assert.ok(t("paw", "press") - t("said", "tv_demo_look") <= DEMO.lookToPress + 20, "and not much more");
  // (Jonas: "it says, look, it's just one quick word, and then it activates something": 450–600 ms, the judge's bar)
  assert.ok(DEMO.lookToPress >= 450 && DEMO.lookToPress <= 600, `${DEMO.lookToPress} in 450–600`);
  // nothing before the paw is there: the effect never precedes the press, the press never precedes the arrival
  assert.ok(t("paw", "press") >= t("paw", "arrive") + DEMO.hover, `${t("paw", "press")} >= ${t("paw", "arrive") + DEMO.hover}`);
  // the calm beat: the demo resolves no sooner than DEMO.beat after the paw set off home
  const done = all("state").at(-1)!;
  assert.equal(done.what, "done");
  assert.ok(done.t - t("paw", "home") >= DEMO.beat, `${done.t - t("paw", "home")} >= ${DEMO.beat}`);
});

test("the paw sets off on the word 'now' (the line's word timings), and the target lights on its name", async () => {
  await play(sausageDemo());
  const said = first("say", "tv_demo_now_tap_sausage")!.t;
  const fly = first("paw", "fly")!.t;
  assert.ok(fly - said >= 1890, `${fly - said} >= ${1890}`);
  assert.ok(fly - said <= 1920, `${fly - said} <= ${1920}`);
  assert.ok(first("paw", "halo")!.t - said >= 1090, `${first("paw", "halo")!.t - said} >= ${1090}`);
  assert.ok(first("paw", "halo")!.t - said <= 1120, `${first("paw", "halo")!.t - said} <= ${1120}`);
  // the fingertip hovers just above the press point, then presses low on the card, a little right of its middle (the
  // paw comes up from below, so the picture stays in sight)
  const to = (first("paw", "fly")!.args as { to: { x: number; y: number } }).to;
  const at = (first("paw", "press")!.args as { at: { x: number; y: number } }).at;
  assert.deepEqual(at, { x: 560 + 200 * 0.6, y: 200 + 220 * 0.64 });
  assert.deepEqual(to, { x: at.x + DEMO.hoverOff.x, y: at.y + DEMO.hoverOff.y });
});

test("no action within 400 ms of the line that announces it (even with no 'Look!'), and the paw hovers first", async () => {
  // a fast flight that lands before the announcement ends: the press still waits 400 ms after it
  await play(sausageDemo({ look: false, flight: 200 }));
  const end = first("said", "tv_demo_now_tap_sausage")!.t;
  const press = first("paw", "press")!.t;
  assert.ok(press - end >= DEMO.afterAnnounce, `${press - end} >= ${DEMO.afterAnnounce}`);
  assert.ok(press - end <= DEMO.afterAnnounce + 20, `${press - end} <= ${DEMO.afterAnnounce + 20}`);
  // a slow flight that lands late: it hovers DEMO.hover before it presses
  events = [];
  t0 = vt;
  await play(sausageDemo({ look: false, flight: 2400 }));
  assert.ok(first("paw", "press")!.t - first("paw", "arrive")!.t >= DEMO.hover, `${first("paw", "press")!.t - first("paw", "arrive")!.t} >= ${DEMO.hover}`);
});

test("several actions: each is announced before its paw moves; 'Look!' once; the paw hops from target to target", async () => {
  const a = el("a", 500, 520, 110, 110), m = el("m", 660, 520, 110, 110);
  await play(
    senseiDemo({
      id: "build:am",
      show: false,
      actions: [
        { announce: [L("tv_demo_now_first_sound")], target: a as unknown as Element, press: () => ev("effect", "a"), sound: { sound: "a" } },
        { announce: [L("tv_demo_now_last_sound")], target: m as unknown as Element, press: () => ev("effect", "m"), sound: { sound: "m" } },
      ],
    }),
  );
  assert.deepEqual(all("say").map((e) => e.what), ["tv_demo_now_first_sound", "tv_demo_look", "sound:a", "tv_demo_now_last_sound", "sound:m"]);
  assert.equal(all("paw", "emerge").length, 1);
  assert.equal(all("paw", "home").length, 1);
  assert.equal(all("paw", "fly").length, 2);
  const flights = all("paw", "fly");
  assert.ok(flights[1].t > first("say", "tv_demo_now_last_sound")!.t, `${flights[1].t} > ${first("say", "tv_demo_now_last_sound")!.t}`); // announced first
  assert.equal((flights[1].args as { ms: number }).ms, DEMO.hop);
  const presses = all("paw", "press");
  assert.ok(presses[1].t - first("said", "tv_demo_now_last_sound")!.t >= DEMO.afterAnnounce, `${presses[1].t - first("said", "tv_demo_now_last_sound")!.t} >= ${DEMO.afterAnnounce}`);
  assert.deepEqual(all("effect").map((e) => e.what), ["a", "m"]);
  // with no "Let me show you.", the paw comes out as the first announcement starts
  assert.equal(first("paw", "emerge")!.t, first("say", "tv_demo_now_first_sound")!.t);
});

test("Show me again: no rule, 'Of course. Watch my paw again.', and the same pace from the announcement to the press", async () => {
  await play(sausageDemo());
  const gap1 = first("paw", "press")!.t - first("say", "tv_demo_now_tap_sausage")!.t;
  events = [];
  t0 = vt;
  await play(sausageDemo({ replay: true }));
  assert.deepEqual(all("say").map((e) => e.what), ["tv_show_again", "tv_demo_now_tap_sausage", "tv_demo_look", "word:sausage"]);
  const gap2 = first("paw", "press")!.t - first("say", "tv_demo_now_tap_sausage")!.t;
  assert.ok(Math.abs(gap2 - gap1) <= 10, `${Math.abs(gap2 - gap1)} <= ${10}`);
  assert.equal((first("paw", "fly")!.args as { ms: number }).ms, DEMO.flight);
  // the paw comes out on "paw" ("Of course. Watch my paw again."; no word timings here, so estimated from the text), not
  // on "Watch"
  const out = first("paw", "emerge")!.t - first("say", "tv_show_again")!.t;
  const paw = (await wordTime("tv_show_again", ["paw"], 1.9))! * 1000;
  const watch = (await wordTime("tv_show_again", ["watch"], 1.9))! * 1000;
  assert.ok(Math.abs(out - paw) <= 20, `out at ${out} ms, "paw" at ${paw}`);
  assert.ok(out - watch >= 250, `${out} is well after "Watch" (${watch})`);
});

test("cancelDemo(): nothing more is pressed or said, the paw goes, and the screen's __snState comes back", async () => {
  const p = sausageDemo();
  await run(4200 + 250 + 1100 + 250 + 1000); // into the announcement
  assert.equal((snState as { scene: string }).scene, "demo");
  cancelDemo();
  await play(p);
  await run(3000);
  assert.equal(first("effect"), undefined);
  assert.equal(first("paw", "press"), undefined);
  assert.notEqual(first("paw", "hide"), undefined);
  assert.deepEqual(snState, { scene: "warmup", next: "sock" });
});

test("__snState: { scene: 'demo', step } through the steps, busy, then the screen's own state", async () => {
  const seen: unknown[] = [];
  const pub = demoEnv.publish;
  demoEnv.publish = (st) => (seen.push(st), pub(st));
  try {
    await play(sausageDemo());
  } finally {
    demoEnv.publish = pub;
  }
  const steps = seen.filter((s) => (s as { scene?: string })?.scene === "demo").map((s) => (s as { step: string }).step);
  assert.deepEqual(steps, ["rule", "show", "announce", "fly", "look", "press", "effect", "home", "beat", "done"]);
  assert.equal(seen.filter((s) => (s as { scene?: string })?.scene === "demo").every((s) => (s as { busy: boolean }).busy), true);
  assert.deepEqual(snState, { scene: "warmup", next: "sock" });
});

test("the ninja watches: Sensei's corner as the paw comes out, the target as it flies, and 'done' at the end", async () => {
  const watched: { t: number; target: unknown; phase: string }[] = [];
  await play(sausageDemo({ onWatch: (target, phase) => watched.push({ t: now(), target, phase }) }));
  assert.deepEqual(watched.map((w) => w.phase), ["paw", "target", "done"]);
  assert.deepEqual(watched[0].target, { x: 1204, y: 644 });
  assert.equal(watched[1].target, sausage);
  assert.equal(watched[1].t, first("paw", "fly")!.t);
  assert.equal(watched[2].target, null);
  assert.ok(watched[2].t > first("effect")!.t, `${watched[2].t} > ${first("effect")!.t}`);
});

test("a scene that goes away mid-demo: it stops, nothing is pressed, and the paw goes", async () => {
  let alive = true;
  const p = sausageDemo({ alive: () => alive });
  await run(4200 + 250 + 1100 + 250 + 500);
  alive = false;
  await play(p);
  assert.equal(first("effect"), undefined);
  assert.notEqual(first("paw", "hide"), undefined);
  assert.deepEqual(snState, { scene: "warmup", next: "sock" });
});

test("the phone held upright: the paw freezes and nothing moves on until it is turned back", async () => {
  const p = sausageDemo({ rule: undefined, show: false, look: false });
  await run(1950); // the paw has set off on "now"
  assert.notEqual(first("paw", "fly"), undefined);
  upright = true;
  uprightSubs.forEach((f) => f());
  assert.notEqual(first("paw", "freeze"), undefined);
  await run(5000);
  assert.equal(first("paw", "press"), undefined); // it waits
  upright = false;
  uprightSubs.forEach((f) => f());
  await play(p);
  assert.notEqual(first("paw", "unfreeze"), undefined);
  // turned back: a moment to look again before the press
  assert.ok(first("paw", "press")!.t >= first("paw", "unfreeze")!.t + DEMO.resume, `${first("paw", "press")!.t} >= ${first("paw", "unfreeze")!.t} + resume`);
});

test("a line with no audio: the paw still comes out, flies and presses, after the line", async () => {
  missingAudio = new Set(["tv_demo_show", "tv_demo_now_tap_sausage", "tv_demo_look"]);
  await play(sausageDemo({ rule: undefined }));
  assert.deepEqual(all("paw").map((e) => e.what), ["emerge", "fly", "arrive", "halo", "press", "bottom", "halo-off", "lift", "home", "in"]);
  assert.notEqual(first("effect"), undefined);
});

test("a new demo cancels the one running (only one paw)", async () => {
  const p1 = sausageDemo({ id: "one", press: () => ev("effect", "one") });
  await run(3000);
  const p2 = sausageDemo({ id: "two", rule: undefined, press: () => ev("effect", "two") });
  await play(Promise.all([p1, p2]));
  assert.deepEqual(all("effect").map((e) => e.what), ["two"]);
  assert.deepEqual(snState, { scene: "warmup", next: "sock" });
});

test("word timings: measured when there are some, else estimated from the text and the clip's length", async () => {
  assert.equal(await wordTime("tv_demo_now_tap_sausage", ["now"], 2.4), 1.9);
  // no timings: "I'm going to tap on the sun now..." — "now" is the last word, so late in the clip
  const est = (await wordTime("tv_demo_now_tap_sun", ["now"], 2.2))!;
  assert.ok(est > 1.3, `${est} > ${1.3}`);
  assert.ok(est < 2.2, `${est} < ${2.2}`);
  assert.equal(await wordTime("tv_demo_now_tap_sun", ["sausage"], 2.2), null);
});

test("no timings but the clip's own pauses: each phrase goes to its speech island ('paw', not 'Watch my')", async () => {
  // tv_show_again as recorded: "Of course." 0–0.7 s, a long pause, "Watch my paw again." 1.5–2.7 s ("paw" at 2.02 s)
  PCM.tv_show_again = pcmOf(2.73, [[0.02, 0.35], [0.42, 0.7], [1.5, 1.95], [2.02, 2.7]]);
  try {
    assert.deepEqual(speechIslands(PCM.tv_show_again).length, 2); // the 70 ms gaps are inside the phrases
    const paw = (await wordTime("tv_show_again", ["paw"], 2.73))!;
    assert.ok(Math.abs(paw - 2.02) <= 0.12, `"paw" estimated at ${paw.toFixed(2)} s, said at 2.02 s`);
    // by the letters alone it would land on "Watch my", 0.35 s early
    PCM.tv_show_again = pcmOf(2.73, [[0, 2.73]]);
    const flat = (await wordTime("tv_show_again", ["paw"], 2.73))!;
    assert.ok(flat < 1.8, `${flat}`);
  } finally {
    delete PCM.tv_show_again;
  }
});

test("the paw's path: from her corner along below the row and up into the target, never over the card beside it", () => {
  // the harness's row (stage px): the sausage's button 605–855 × 175–425 (its painted plate 625–835 × 195–405), the
  // sock's plate 875–1085 × 195–405; her peek point; the hover, press and draw-back points on the sausage
  const peek = { x: 1204 + DEMO.peek.x, y: 644 + DEMO.peek.y };
  const press = { x: 605 + 250 * 0.6, y: 175 + 250 * 0.64 };
  const hover = { x: press.x + DEMO.hoverOff.x, y: press.y + DEMO.hoverOff.y };
  const lift = { x: press.x + DEMO.liftOff.x, y: press.y + DEMO.liftOff.y };
  const sock = { x: 875, y: 195, w: 210, h: 210 };
  /** does any of the paw (its whole outline, not just the fingertip) come within `pad` px of the sock's plate? */
  const touches = (tip: { x: number; y: number }, rot: number, pad: number) =>
    pawOutline(tip, rot).some((q) => q.x > sock.x - pad && q.x < sock.x + sock.w + pad && q.y > sock.y - pad && q.y < sock.y + sock.h + pad);
  const path = arcPath(peek, hover, 64);
  assert.equal(path[0].t, 0);
  assert.equal(path.at(-1)!.t, 1);
  assert.deepEqual(path.at(-1)!.p, hover);
  for (let k = 1; k < path.length; k++) assert.ok(path[k].t > path[k - 1].t, `${path[k].t} > ${path[k - 1].t}`);
  // never above the target, never below her corner
  assert.ok(path.every(({ p }) => p.y >= hover.y - 0.5 && p.y <= peek.y + 0.5));
  // in flight (it leans 8° more by a third of the way, and 4° less near the end, as flyTo's keyframes; ±3° for the
  // easing), hovering, pressing and drawn back: never over the sock, with 8 px to spare
  const lean = (t: number) => PAW_TILT + (t < 0.35 ? (-8 * t) / 0.35 : t < 0.85 ? -8 + (12 * (t - 0.35)) / 0.5 : 4 - (4 * (t - 0.85)) / 0.15);
  for (const { p, t } of path) for (const d of [-3, 0, 3]) assert.ok(!touches(p, lean(t) + d, 8), `the paw at ${p.x.toFixed(0)},${p.y.toFixed(0)} (t ${t.toFixed(2)}, ${(lean(t) + d).toFixed(0)}°) touches the sock`);
  for (const at of [hover, press, lift]) assert.ok(!touches(at, PAW_TILT + 6, 8), `the paw at ${at.x},${at.y} touches the sock`);
  // home: down out of the row first, then along to her portrait (never back over the sock either)
  const home = arcPath(lift, { x: 1184, y: 634 }, 64);
  for (const { p } of home) assert.ok(!touches(p, PAW_TILT, 8), `going home at ${p.x.toFixed(0)},${p.y.toFixed(0)} it touches the sock`);
  // after the press the paw draws back down, off her paw print (80 px, centred on the press point)
  assert.ok(pawOutline(lift).every((q) => q.y > press.y + 40 || Math.abs(q.x - press.x) > 40), "the print shows");
  // a hop between two targets in one row bows upwards, over the row
  const hop = arcPath({ x: 500, y: 300 }, { x: 800, y: 300 });
  assert.ok(Math.min(...hop.map(({ p }) => p.y)) < 300 - 40);
});

// ---------------------------------------------------------------- the child's taps while Sensei talks
test("a card tapped during the rule: lit at once by the scene, its word after the rule, and the demo carries on", async () => {
  const lit: string[] = [];
  const p = sausageDemo();
  await run(1500); // into the rule
  assert.equal(demoTap([{ word: "sun" }], { onSay: () => ev("lit", "sun"), onDone: () => ev("unlit", "sun") }), "later");
  lit.push("sun");
  await play(p);
  const says = all("say").map((e) => e.what);
  assert.deepEqual(says, ["tv_demo_rule_find_sausage", "word:sun", "tv_demo_show", "tv_demo_now_tap_sausage", "tv_demo_look", "word:sausage"]);
  // never on top of her: after the rule (and its breath), and "Let me show you." a breath after the word
  assert.ok(first("say", "word:sun")!.t >= first("said", "tv_demo_rule_find_sausage")!.t + DEMO.breath);
  assert.ok(first("say", "tv_demo_show")!.t >= first("said", "word:sun")!.t + DEMO.breath);
  assert.equal(first("lit", "sun")!.t, first("say", "word:sun")!.t);
  assert.equal(first("unlit", "sun")!.t, first("said", "word:sun")!.t);
  // the demo itself is whole: the flight, the press and the effect all happen
  assert.notEqual(first("effect"), undefined);
  assert.equal(all("state").at(-1)!.what, "done");
});

test("a card tapped while the paw flies: its word after the calm beat, never between 'Look!' and the press", async () => {
  const p = sausageDemo({ rule: undefined, clear: () => ev("clear") });
  for (let k = 0; k < 400 && !first("paw", "fly"); k++) await run(10);
  assert.equal(demoTap([{ word: "sock" }]), "later");
  await play(p);
  const says = all("say").map((e) => e.what);
  assert.deepEqual(says, ["tv_demo_show", "tv_demo_now_tap_sausage", "tv_demo_look", "word:sausage", "word:sock"]);
  assert.ok(first("say", "word:sock")!.t >= first("paw", "home")!.t + DEMO.beat, "after the calm beat");
  // the result is cleared first (`clear`, after the beat), so the word isn't said over a greyed-out board
  assert.ok(first("clear")!.t >= first("paw", "home")!.t + DEMO.beat && first("clear")!.t <= first("say", "word:sock")!.t);
  assert.ok(first("paw", "press")!.t - first("said", "tv_demo_look")!.t >= DEMO.lookToPress);
  assert.ok(all("state").at(-1)!.what === "done" && all("state").at(-1)!.t >= first("said", "word:sock")!.t);
});

test("demoTap outside a talk: said at once when she is quiet, skipped while something is said; the latest tap wins", async () => {
  assert.equal(demoTap([{ word: "sun" }]), "now");
  await run(2000);
  assert.deepEqual(all("say").map((e) => e.what), ["word:sun"]);
  events = [];
  const talking = fakeSay([L("tv_ready_first")]);
  await run(10);
  let skipped = false;
  assert.equal(demoTap([{ word: "sock" }], { onDone: () => (skipped = true) }), "skipped");
  assert.ok(skipped);
  await play(talking);
  // in a talk (her names): taps wait for demoPause(), and a second tap replaces the first
  events = [];
  let dropped = "";
  await play(
    demoTalk(async () => {
      const said = fakeSay([L("tv_demo_show")]);
      await run(100);
      demoTap([{ word: "sun" }], { onDone: () => (dropped ||= "sun") });
      demoTap([{ word: "sock" }]);
      await said;
      assert.equal(await demoPause(), true);
      assert.equal(await demoPause(), false);
    }),
  );
  assert.equal(dropped, "sun");
  assert.deepEqual(all("say").map((e) => e.what), ["tv_demo_show", "word:sock"]);
});

test("a demo cancelled with a word waiting: the word is dropped (the scene answers the new tap)", async () => {
  let done = 0;
  const p = sausageDemo();
  await run(1000);
  demoTap([{ word: "sun" }], { onDone: () => done++ });
  cancelDemo();
  await play(p);
  await run(3000);
  assert.equal(first("say", "word:sun"), undefined);
  assert.equal(done, 1);
});
