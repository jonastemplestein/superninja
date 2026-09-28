// Sensei's "I do" demo, choreographed (docs/DEMO_CHOREOGRAPHY.md; Jonas, 27 Sep: "The sensei should be shooting at the
// word … Let me show you. I'm gonna tap on the sausage now. Look!"). One helper for every game's demo:
//   (a) the rule as a hypothetical   "Let's pretend I say, ‘Find the sausage.’ Then you tap on the sausage."
//   (b) "Let me show you."           Sensei's paw comes out of her portrait (bottom right) as she says it
//   (c) the action, announced        "I'm going to tap on the sausage… now…": the paw sets off on "now" (the line's word
//                                     timings, public/a/l/<id>.words.json) and flies a gentle arc to the target, her
//                                     colours trailing, so the child can follow it with their eyes
//   (d) "Look!", then the press       the paw hovers, presses (a squash, a ripple, her paw print), and only THEN does the
//                                     effect happen (`press()`, with `sound` said on the press: the thing's own sound,
//                                     the word or the pure sound, never the child's reward chime, sfx.good)
//   (e) the child's ninja only watches (`onWatch`: the scene turns its ninja towards the paw, then the target)
//   (f) a calm beat                   the paw goes home; nothing new for about 700 ms
// Timing rules: nothing happens within 400 ms of the line that announces it, and the press waits half a second after
// "Look!"; the paw is always visible while it moves (it pauses while the phone is upright), and never appears at a
// target without travelling there. Show me again replays the same function at the same pace (`replay: true`: "Of
// course. Watch my paw again." instead of the rule).
// The board stays live throughout (TEACHER_SCRIPT §0.1: the child can always act): the scene lights a tapped card at once
// and hands its word to `demoTap()`, which says it at Sensei's next pause (between the demo's lines, or after its
// calm beat), never on top of her and never cutting her off; the demo carries on.
//
//   <SenseiDemoLayer />   once in the Stage (like <FxLayer/>): the paw, its trail, the halo, the ripple and the print
//   await senseiDemo({ rule: [L("tv_demo_rule_find_sausage")], announce: [L("tv_demo_now_tap_sausage")],
//                      target: sausageEl, press: () => setGreen("sausage"), sound: [{ word: "sausage" }] });
//   onCardTap: if (!readyTap(...)) { light(card); demoTap([{ word: card }], { onSay: () => light(card) }); }
//
// Bots: window.__snState is { scene: "demo", id, step, i, of, busy: true } while it runs (the screen's own state comes
// back after), window.__snDemoLog lists every step with its time, and the nav log gets `paw` entries (fly, press).
// Compositor only: transform and opacity through the Web Animations API; when no demo is running the layer is
// display: none, so nothing animates and no frame is requested.
import { useEffect, useRef, type ReactNode } from "react";
import { say, nextClip, sfx, isSpeaking, load, urls, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { LINES } from "../content/lines";
import { LINE_WORDS } from "../content/word-times";
import { stageRect, isUpright, onUpright } from "./ui";
import { navLog } from "./nav";
import "../styles/sensei-demo.css";

// ---------------------------------------------------------------- types
export type DemoPoint = { x: number; y: number };
/** What the paw taps: an element (its middle), a stage point, or a getter evaluated when the paw sets off. */
export type DemoTarget = Element | DemoPoint | null | (() => Element | DemoPoint | null);
/** `paw`: the paw has come out of Sensei's portrait (look at her corner); `target`: it is flying to the target (look
 *  there, and keep looking through the effect); `done`: the demo is over (back to the resting pose). */
export type WatchPhase = "paw" | "target" | "done";
export type DemoStep = "rule" | "show" | "announce" | "fly" | "look" | "press" | "effect" | "then" | "home" | "beat" | "done" | "cancelled";

/** One action of a demo (a demo with several, like Word Building's tiles or Sound Dots' dots, announces each). */
export interface DemoAction {
  /** the first-person announcement ("I'm going to tap on the sausage… now…"); the paw sets off on its word `go` */
  announce?: Say[];
  /** the word of the announce line the paw sets off on (default "now"); a number: seconds into the line's clip */
  go?: string | number;
  /** the word on which the target's halo lights ("sausage"); default: tv_demo_now_tap_<w>'s <w>, "this", else arrival */
  spotOn?: string | null;
  target: DemoTarget;
  /** "Look!" before the press; default: the first action only */
  look?: Say[] | false;
  /** the effect: called at the bottom of the press, never before */
  press?: () => unknown;
  /** said as the paw presses: the pure sound, the word */
  sound?: Say | Say[];
  /** said after the effect (the model answer, "So into the pocket it goes!"), after a short breath */
  then?: Say[];
  /** ms the paw stays on the target after the press, so the cause is still there while the effect shows (550) */
  hold?: number;
  /** this flight's length (default: the first 1050 ms, later hops 850 ms; Sound Dots' next dot can be quicker) */
  flight?: number;
}
export interface SenseiDemoOpts extends Partial<DemoAction> {
  /** for logs and __snState ("tap:sausage") */
  id?: string;
  /** (a) the rule as a hypothetical; skipped on a replay */
  rule?: Say[];
  /** (b) "Let me show you." (default tv_demo_show); false: none (the paw comes out as the announcement starts). On a
   *  replay the default is tv_show_again ("Of course. Watch my paw again.") */
  show?: Say[] | false;
  /** several actions; without it the demo is the one action given at the top level (announce, target, press, …) */
  actions?: DemoAction[];
  /** calm after the last effect before the demo resolves (default 700 ms) */
  beat?: number;
  /** the first flight's length (default 1050 ms; later hops between targets 850 ms) */
  flight?: number;
  /** the scene's ninja watches: map it to the ninja's look pose (docs/fix-requests.md: ninja.watch) */
  onWatch?: (target: Element | DemoPoint | null, phase: WatchPhase) => void;
  /** Show me again: no rule, "Of course. Watch my paw again.", then the same actions at the same pace */
  replay?: boolean;
  /** the scene is still on screen (checked between steps) */
  alive?: () => boolean;
  /** where the paw comes from (default: Sensei's portrait, the Help button) */
  from?: Element | DemoPoint;
  /** called after the calm beat, once the result has been seen: the scene clears the demo's result for the turn (the
   *  sausage back from green), before any tapped card's waiting word and the Ready hold */
  clear?: () => void;
}

// ---------------------------------------------------------------- timings (game ms; docs/DEMO_CHOREOGRAPHY.md §3)
export const DEMO = {
  /** a breath between the rule, "Let me show you." and the announcement */
  breath: 250,
  /** no action (a press) within this long of the end of the line that announces it */
  afterAnnounce: 400,
  /** the paw hovers over the target at least this long before it presses */
  hover: 300,
  /** "Look!" ends → the press: half a second, so the press never follows the one quick word straight away (Jonas: "it
   *  says, look, it's just one quick word, and then it activates something"); T1's 400 ms, with room to spare */
  lookToPress: 500,
  /** the first flight, and later hops between targets */
  flight: 1050,
  hop: 850,
  /** the paw comes out of the portrait; goes back home */
  emerge: 480,
  home: 700,
  /** the press: down (the effect happens at the bottom), then up */
  down: 160,
  up: 260,
  /** the paw stays on the target after the press */
  hold: 550,
  /** the sound, and the effect, end → the `then` lines */
  thenGap: 250,
  /** calm at the end */
  beat: 700,
  /** the phone turned back from upright: a moment to look again before anything moves on */
  resume: 600,
  /** where the paw waits after coming out, from the portrait's centre: beside it, a little above its middle, and clear
   *  of the caption bubble (whose bottom edge is level with the portrait's top) */
  peek: { x: -175, y: -22 },
  /** the paw hovers this far from the press point (just above it: the paw comes up from below, so its arm stays under
   *  the target and off the cards beside it) */
  hoverOff: { x: -4, y: -30 },
  /** after the press it draws back down along its arm this far from the press point, so her paw print and the picture
   *  show while the effect plays, and the paw is still on the card */
  liftOff: { x: 20, y: 62 },
} as const;

/** The words of the show line the paw comes out on: "Let me show you.", "Of course. Watch my paw again." (on "paw", not
 *  "Watch"), "I'll go first." */
const EMERGE_ON = ["show", "paw", "first"];

// ---------------------------------------------------------------- the paw's driver (DOM here, faked in the tests)
export type TargetBox = { x: number; y: number; w: number; h: number };
export interface PawDriver {
  /** come out of the portrait (at `from`) to the peek point; resolves when it is out */
  emerge(from: DemoPoint, peek: DemoPoint, ms: number): Promise<void>;
  /** fly an arc from where it is to `to` (the fingertip's point); resolves on arrival */
  fly(to: DemoPoint, ms: number): Promise<void>;
  /** the halo on the target (null: off) */
  halo(box: TargetBox | null): void;
  /** press at `at`: resolves at the bottom of the press (the moment of the effect); the ripple and the print play */
  press(at: DemoPoint, downMs: number): Promise<void>;
  /** after the press: it draws back a little (DEMO.liftOff), so the print and the picture show, and stays on the card */
  lift(to: DemoPoint, ms: number): Promise<void>;
  /** back into the portrait, then hidden */
  home(to: DemoPoint, ms: number): Promise<void>;
  /** hide at once (cancel) */
  hide(): void;
  /** freeze or resume every running animation (the phone held upright) */
  freeze(on: boolean): void;
}

/** A clip as it starts: performance.now() ms of its start and end (engine/audio.ts nextClip). */
type ClipAt = { start: number; end: number } | null;
type Word = { w: string; at: number };

const LINE_TEXT = new Map(LINES.map((l) => [l.id, l.text]));
const wordsCache = new Map<string, Promise<Word[] | undefined>>();
/** A line's word timings: public/a/l/<id>.words.json, else content/word-times.ts LINE_WORDS. */
function loadWords(id: string): Promise<Word[] | undefined> {
  let p = wordsCache.get(id);
  if (!p) {
    const known = LINE_WORDS[id];
    p =
      typeof fetch === "function"
        ? fetch(`/a/l/${id}.words.json`)
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => (Array.isArray(j?.words) ? (j.words as { w: string; at?: number; start?: number }[]).map((x) => ({ w: x.w, at: x.at ?? x.start ?? 0 })) : undefined))
            .catch(() => undefined)
            .then((ws) => ws ?? known?.map(([w, at]) => ({ w, at })))
        : Promise.resolve(known?.map(([w, at]) => ({ w, at })));
    wordsCache.set(id, p);
  }
  return p;
}

/** The injectable world (the tests swap these for fakes; the game uses the real ones). */
export const demoEnv = {
  now: (): number => performance.now(),
  /** game ms (at ?fast=N setTimeout is N× faster: engine/fast.ts) */
  sleep: (ms: number): Promise<void> => new Promise((r) => setTimeout(r, Math.max(0, ms))),
  say: (items: Say[]): Promise<boolean> => say(items),
  /** is anything being said now (a line, a word)? */
  speaking: (): boolean => isSpeaking(),
  nextClip: (id: string, ms: number): Promise<ClipAt> => nextClip(id, ms),
  words: loadWords,
  /** a line's decoded audio (the engine's cache: the clip being said is already loaded), for its pauses */
  pcm: (id: string): Promise<{ rate: number; data: Float32Array } | null> =>
    typeof fetch === "function" ? load(urls.line(id)).then((b) => (b ? { rate: b.sampleRate, data: b.getChannelData(0) } : null)).catch(() => null) : Promise.resolve(null),
  text: (id: string): string | undefined => LINE_TEXT.get(id),
  fast: FAST,
  sfx: (name: string) => void sfx[name]?.(),
  paw: null as PawDriver | null,
  /** Sensei's portrait, the Help button (docs/HERO.md: 124 px at right 14, bottom 14) */
  portrait: (): DemoPoint => {
    const el = typeof document !== "undefined" ? document.querySelector(".help-btn") : null;
    if (el) {
      const r = stageRect(el);
      if (r.w > 0) return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    }
    return { x: 1204, y: 644 };
  },
  rect: (el: Element): TargetBox => stageRect(el),
  isElement: (t: unknown): t is Element => typeof Element !== "undefined" && t instanceof Element,
  upright: (): boolean => isUpright(),
  onUpright: (fn: () => void): (() => void) => onUpright(fn),
  publish: (st: Record<string, unknown> | null) => {
    if (typeof window === "undefined") return;
    (window as any).__snState = st;
  },
  current: (): unknown => (typeof window === "undefined" ? undefined : (window as any).__snState),
  log: (e: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    const w = window as any;
    const log: unknown[] = (w.__snDemoLog ??= []);
    log.push({ t: Math.round(performance.now()), ...e });
    if (log.length > 400) log.splice(0, log.length - 400);
  },
  navLog: (id: string, via: string) => {
    try {
      navLog({ kind: "paw", id, via });
    } catch {}
  },
};

// ---------------------------------------------------------------- helpers
const bare = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");
const lineOf = (items: readonly Say[] | undefined): string | null => {
  for (const it of items ?? []) if ("line" in it) return it.line;
  return null;
};
/** A clip's speech islands (s): runs of voice between pauses of at least 200 ms (10 ms frames, quieter than 8 % of
 *  the loudest frame's level). */
export function speechIslands(pcm: { rate: number; data: Float32Array }, minGap = 0.2): [number, number][] {
  const n = Math.max(1, Math.round(pcm.rate * 0.01));
  const rms: number[] = [];
  for (let i = 0; i + n <= pcm.data.length; i += n) {
    let e = 0;
    for (let k = i; k < i + n; k++) e += pcm.data[k] * pcm.data[k];
    rms.push(Math.sqrt(e / n));
  }
  const top = Math.max(0, ...rms);
  if (!top) return [];
  const out: [number, number][] = [];
  let from = -1;
  rms.forEach((v, f) => {
    const on = v > top * 0.08;
    if (on && from < 0) from = f;
    if (!on && from >= 0) (out.push([from / 100, f / 100]), (from = -1));
  });
  if (from >= 0) out.push([from / 100, rms.length / 100]);
  // pauses shorter than minGap are inside a phrase (a stop consonant, a breath between words)
  const merged: [number, number][] = [];
  for (const r of out) {
    const last = merged.at(-1);
    if (last && r[0] - last[1] < minGap) last[1] = r[1];
    else merged.push([...r]);
  }
  return merged.filter(([a, b]) => b - a >= 0.05);
}
/** Seconds into line `id` when the first of `words` is said: measured timings (public/a/l/<id>.words.json, else
 *  content/word-times.ts); else estimated: each phrase of the text (up to a full stop, comma or "…") mapped to one of
 *  the clip's own speech islands when they match one for one ("Of course. … Watch my paw again." has a long pause the
 *  letters can't know), its words spread by their letters; else by letters and punctuation over the clip's length
 *  `durS`. */
export async function wordTime(id: string, words: readonly string[], durS: number): Promise<number | null> {
  const want = words.map(bare);
  const ws = await demoEnv.words(id);
  const hit = ws?.find((x) => want.includes(bare(x.w)));
  if (hit) return hit.at;
  const text = demoEnv.text(id);
  if (!text) return null;
  const toks = text.split(/\s+/).filter(Boolean);
  const i = toks.findIndex((t) => want.includes(bare(t)));
  if (i < 0) return null;
  const letters = (t: string) => t.replace(/[^A-Za-z']/g, "").length + 1;
  // the phrases, and the clip's islands
  const ends = /[.!?…,;:]["'’”]?$|\.\.\.$/;
  const phrases: number[][] = [[]];
  toks.forEach((t, k) => {
    phrases.at(-1)!.push(k);
    if (ends.test(t) && k < toks.length - 1) phrases.push([]);
  });
  const pcm = phrases.length > 1 ? await demoEnv.pcm(id).catch(() => null) : null;
  let isl = pcm ? speechIslands(pcm) : [];
  // more islands than phrases: close the shortest pauses until they match
  while (isl.length > phrases.length) {
    let k = 0;
    for (let j = 1; j < isl.length - 1; j++) if (isl[j + 1][0] - isl[j][1] < isl[k + 1][0] - isl[k][1]) k = j;
    isl = [...isl.slice(0, k), [isl[k][0], isl[k + 1][1]], ...isl.slice(k + 2)];
  }
  if (isl.length === phrases.length && isl.length > 1) {
    const pi = phrases.findIndex((ph) => ph.includes(i));
    const ph = phrases[pi];
    const [a, b] = isl[pi];
    const all = ph.reduce((n, k) => n + letters(toks[k]), 0);
    const before = ph.filter((k) => k < i).reduce((n, k) => n + letters(toks[k]), 0);
    return a + ((b - a) * before) / all;
  }
  const weight = (t: string) => t.replace(/[^A-Za-z']/g, "").length + (/[.!?…]$/.test(t) ? 7 : /[,;:]$/.test(t) ? 3 : 1);
  const all = toks.reduce((n, t) => n + weight(t), 0);
  const before = toks.slice(0, i).reduce((n, t) => n + weight(t), 0);
  return all ? (durS * before) / all : null;
}
/** The word an announce line's target is named by: tv_demo_now_tap_<w> → <w>; "this row" → "this". */
function defaultSpot(id: string | null): string | null {
  if (!id) return null;
  const m = /^tv_demo_now_tap_([a-z]+)$/.exec(id);
  if (m && !["row", "chest", "card", "dots"].includes(m[1])) return m[1];
  const t = demoEnv.text(id) ?? "";
  if (/\bthis\b/i.test(t)) return "this";
  if (/\bmy word card\b/i.test(t)) return "card";
  return null;
}
const isPoint = (t: unknown): t is DemoPoint => !!t && typeof t === "object" && typeof (t as DemoPoint).x === "number" && typeof (t as DemoPoint).y === "number" && !demoEnv.isElement(t);
function resolveTarget(t: DemoTarget): Element | DemoPoint | null {
  const v = typeof t === "function" ? t() : t;
  return v ?? null;
}
function boxOf(t: Element | DemoPoint): TargetBox {
  if (isPoint(t)) return { x: t.x - 60, y: t.y - 60, w: 120, h: 120 };
  return demoEnv.rect(t);
}
/** Where the paw presses on a target: a point, or low on a card and a little right of its middle (60 % across, 64 %
 *  down): the paw comes up into it from below, so the picture stays in sight while it presses, and its arm stays under
 *  this card, off the cards beside it. */
export function pressPoint(t: Element | DemoPoint): DemoPoint {
  if (isPoint(t)) return { x: t.x, y: t.y };
  const r = demoEnv.rect(t);
  return { x: r.x + r.w * 0.6, y: r.y + r.h * 0.64 };
}
const add = (a: DemoPoint, b: DemoPoint): DemoPoint => ({ x: a.x + b.x, y: a.y + b.y });

// ---------------------------------------------------------------- the sequence
let running: { cancel(): void; token: number } | null = null;
let tokens = 0;

/** Stop the demo that is running (the child tapped an answer during a replay, left the screen): the paw goes, nothing
 *  more is said or pressed, and the screen's __snState comes back. */
export function cancelDemo() {
  running?.cancel();
}
/** Is a demo running now? */
export const demoRunning = () => !!running;

// ---------------------------------------------------------------- the child's taps while Sensei talks
// The board stays live through Sensei's names and her demo (TEACHER_SCRIPT §0.1: no stretch of talk runs more than about
// 12 s before the child can do something the game registers, and a card tap counts). A tap there is answered at once by
// the scene (the card lights, its tap sound) and its word comes at Sensei's next pause: the engine's say() cuts off what
// is being said, and two voices at once is noise to a 3-year-old, so the word waits for the end of the line she is on.
let talks = 0;
type Aside = { items: Say[]; onSay?: () => void; onDone?: () => void };
let aside: Aside | null = null;
const dropAside = () => {
  const a = aside;
  aside = null;
  a?.onDone?.();
};
/**
 * A tap on the board while Sensei may be talking (a card during her names or her demo; before the turn). Returns
 * "later" when she is in a talk (a demo, or `demoTalk()`): the word (`items`, e.g. [{ word: "sun" }]) is said at her
 * next pause (`demoPause()`: the demo calls it after the rule, after "Let me show you.", between actions and after its
 * calm beat), with `onSay` as it starts (light the card again) and `onDone` after it, or when it is dropped (a later tap
 * replaces it; the demo is cancelled). Outside a talk: "now" (said at once) if nothing is being said, else "skipped"
 * (the scene's own spotlight is the answer, as Warmup's early taps do).
 */
export function demoTap(items: Say[], o: { onSay?: () => void; onDone?: () => void } = {}): "now" | "later" | "skipped" {
  const env = demoEnv;
  env.log({ step: "tap", items: items.map((it) => ("word" in it ? it.word : "line" in it ? it.line : "?")).join(",") });
  if (talks > 0 || running) {
    dropAside();
    aside = { items, ...o };
    return "later";
  }
  if (env.speaking()) {
    o.onDone?.();
    return "skipped";
  }
  o.onSay?.();
  void env.say([...items]).finally(() => o.onDone?.());
  return "now";
}
/** Sensei's pause: say the word a tap left waiting (if any), then a breath. True if something was said. */
export async function demoPause(): Promise<boolean> {
  const a = aside;
  if (!a) return false;
  aside = null;
  const env = demoEnv;
  env.log({ step: "tap-said" });
  try {
    a.onSay?.();
    await env.say([...a.items]);
  } finally {
    a.onDone?.();
  }
  await env.sleep(DEMO.breath);
  return true;
}
/** Sensei's talk (her names before a demo, say): while `fn` runs, board taps wait for a `demoPause()` (call it between
 *  the lines), instead of being skipped. A word still waiting when the talk ends is dropped (call `demoPause()` last). */
export async function demoTalk<T>(fn: () => Promise<T>): Promise<T> {
  talks++;
  try {
    return await fn();
  } finally {
    talks--;
    if (!talks && !running) dropAside();
  }
}

/**
 * Play one "I do" demo (or its replay), paced for a child: see the header. Resolves when it has ended, after its calm
 * beat, or at once if it was cancelled or the scene went away (`alive()`); the effect is never called after that.
 */
export async function senseiDemo(o: SenseiDemoOpts): Promise<void> {
  running?.cancel();
  const token = ++tokens;
  const env = demoEnv;
  const id = o.id ?? lineOf(o.actions?.[0]?.announce ?? o.announce) ?? "demo";
  const actions: DemoAction[] = o.actions?.length ? o.actions : o.target !== undefined ? [{ announce: o.announce, go: o.go, spotOn: o.spotOn, target: o.target, look: o.look, press: o.press, sound: o.sound, then: o.then, hold: o.hold }] : [];
  let cancelled = false;
  let frozen = false;
  const wakers = new Set<() => void>();
  const prev = env.current();
  let mine: Record<string, unknown> | null = null;
  const publish = (step: DemoStep, i = 0) => {
    if (cancelled && step !== "cancelled") return;
    mine = { scene: "demo", id, step, i, of: actions.length, busy: true, replay: !!o.replay };
    env.publish(mine);
    env.log({ id, step, i });
  };
  const live = () => !cancelled && token === tokens && (o.alive?.() ?? true);
  // the phone held upright: the paw freezes where it is and the sequence waits (speech is paused by the engine too)
  const offUpright = env.onUpright(() => {
    const up = env.upright();
    if (up === frozen) return;
    frozen = up;
    env.paw?.freeze(up);
    if (!up) wakers.forEach((f) => f());
  });
  frozen = env.upright();
  /** waits while the phone is upright; once it is turned back, a moment to look again before anything moves on */
  const shown = async () => {
    if (!frozen || !live()) return;
    while (frozen && live()) await new Promise<void>((r) => (wakers.add(r), void 0)).finally(() => wakers.clear());
    await env.sleep(DEMO.resume);
  };
  /** a pause in game ms that doesn't end while the phone is upright */
  const wait = async (ms: number) => {
    if (ms > 0) await env.sleep(ms);
    await shown();
  };
  const sayIf = async (items: readonly Say[] | undefined | false) => {
    if (!items || !items.length || !live()) return;
    await shown();
    await env.say([...items]);
  };
  const paw = () => env.paw;
  const origin = (): DemoPoint => (o.from ? (isPoint(o.from) ? o.from : pressPoint(o.from)) : env.portrait());
  let out = false; // the paw is out of the portrait (or coming out)
  let emerging: Promise<void> = Promise.resolve();
  let watching = false;
  const watch = (t: Element | DemoPoint | null, phase: WatchPhase) => {
    try {
      o.onWatch?.(t, phase);
    } catch (e) {
      console.warn("senseiDemo onWatch", e);
    }
    watching = phase !== "done";
  };
  /** the paw comes out of her portrait (once; a second call waits for the first) */
  const emerge = (): Promise<void> => {
    if (out || !live()) return emerging;
    out = true;
    const from = origin();
    env.sfx("twinkle");
    watch(from, "paw");
    emerging = paw()?.emerge(from, add(from, DEMO.peek), DEMO.emerge) ?? env.sleep(DEMO.emerge);
    return emerging;
  };
  /** when word `words` of the line that `items` starts with is said, in game ms from now: waits for the clip to start
   *  (subscribe before saying). null: the line never started (no audio): act when it ends. */
  const clipOf = (items: readonly Say[] | undefined | false) => {
    const lid = items ? lineOf(items) : null;
    return lid ? env.nextClip(lid, 8000) : Promise.resolve<ClipAt>(null);
  };
  const atWord = async (lid: string | null, clip: ClipAt, words: readonly string[] | number, frac: number): Promise<number> => {
    if (!lid || !clip) return 0;
    const durS = ((clip.end - clip.start) * env.fast) / 1000; // the clip's own seconds
    const s = typeof words === "number" ? words : ((await wordTime(lid, words, durS)) ?? durS * frac);
    // real ms from the clip's start = s * 1000 / FAST; as game ms from now
    return Math.max(0, (clip.start + (s * 1000) / env.fast - env.now()) * env.fast);
  };

  running = {
    token,
    cancel: () => {
      if (cancelled) return;
      cancelled = true;
      wakers.forEach((f) => f());
      dropAside();
      paw()?.halo(null);
      paw()?.hide();
      if (watching) watch(null, "done");
      env.log({ id, step: "cancelled" });
      if (env.current() === mine) env.publish((prev as Record<string, unknown>) ?? null);
    },
  };

  try {
    // (a) the rule, as a hypothetical (not on a replay: the child has just heard it)
    if (!o.replay && o.rule?.length) {
      publish("rule");
      await sayIf(o.rule);
      await wait(DEMO.breath);
      if (live()) await demoPause(); // a card the child tapped meanwhile says its word
    }
    if (!live()) return;
    // (b) "Let me show you." (a replay: "Of course. Watch my paw again."): the paw comes out of her portrait on it
    const showLine = o.show === false ? null : (o.show ?? (o.replay ? [{ line: "tv_show_again" }] : [{ line: "tv_demo_show" }]));
    if (showLine?.length) {
      publish("show");
      const c = clipOf(showLine);
      const said = env.say([...showLine]);
      const clip = await Promise.race([c, said.then(() => null)]);
      if (clip) {
        await wait(await atWord(lineOf(showLine), clip, EMERGE_ON, 0.4));
        if (live()) void emerge();
      }
      await said;
      if (!live()) return;
      await emerge(); // (no clip: the paw comes out after the line)
      await wait(DEMO.breath);
      if (live()) await demoPause();
    }
    for (let i = 0; i < actions.length; i++) {
      const a = actions[i];
      if (i > 0 && live()) await demoPause(); // (between actions: the paw waits on the last target)
      if (!live()) return;
      // (c) the action, announced; the paw sets off on its word ("now")
      publish("announce", i);
      const lid = lineOf(a.announce);
      const c = clipOf(a.announce);
      const said = a.announce?.length ? (await shown(), env.say([...a.announce])) : Promise.resolve(true);
      const clip = a.announce?.length ? await Promise.race([c, said.then(() => null)]) : null;
      if (!out) {
        // no "Let me show you.": the paw comes out as the announcement starts
        void emerge();
      }
      const tgt = resolveTarget(a.target);
      const spot = a.spotOn === undefined ? defaultSpot(lid) : a.spotOn;
      let haloOn = false;
      if (tgt && spot && clip) {
        void atWord(lid, clip, [spot], 0.5).then(async (ms) => {
          await wait(ms);
          if (live() && !haloOn) {
            haloOn = true;
            paw()?.halo(boxOf(tgt));
          }
        });
      }
      const goMs = clip ? await atWord(lid, clip, typeof a.go === "number" ? a.go : [a.go ?? "now"], 0.8) : 0;
      let announceEnd = clip ? null : env.now();
      void said.then(() => (announceEnd = env.now()));
      await wait(goMs);
      if (!live()) return;
      await emerge(); // (it must be out before it flies)
      if (!live()) return;
      // (d) the flight: a gentle arc, visibly from her corner (or from the last target) to this one
      const pt = tgt ? pressPoint(tgt) : null;
      const hover = pt ? add(pt, DEMO.hoverOff) : null;
      publish("fly", i);
      env.navLog(`${id}:${i}`, "fly");
      if (tgt) watch(tgt, "target");
      const flightMs = a.flight ?? (i === 0 ? (o.flight ?? DEMO.flight) : DEMO.hop);
      const flown = hover ? (paw()?.fly(hover, flightMs) ?? env.sleep(flightMs)) : Promise.resolve();
      await Promise.all([said, flown]);
      if (announceEnd == null) announceEnd = env.now();
      if (!live()) return;
      if (tgt && !haloOn) {
        haloOn = true;
        paw()?.halo(boxOf(tgt));
      }
      const arrived = env.now();
      // "Look!" (the first action), then the press: never within DEMO.afterAnnounce of the announcement's end, and
      // only once the paw has hovered DEMO.hover
      const look = a.look === undefined ? (i === 0 ? [{ line: "tv_demo_look" }] : false) : a.look;
      if (look && look.length) {
        publish("look", i);
        await sayIf(look);
        await wait(DEMO.lookToPress);
      }
      const since = (t: number) => (env.now() - t) * env.fast; // game ms since a real time
      await wait(Math.max(DEMO.afterAnnounce - since(announceEnd), DEMO.hover - since(arrived), 0));
      if (!live()) return;
      // the press: down, and at the bottom the effect and its sound; then the paw draws back a little and stays a moment
      publish("press", i);
      env.navLog(`${id}:${i}`, "press");
      env.sfx("tap");
      if (pt) await (paw()?.press(pt, DEMO.down) ?? env.sleep(DEMO.down));
      else await env.sleep(DEMO.down);
      if (!live()) return;
      paw()?.halo(null);
      publish("effect", i);
      try {
        a.press?.();
      } catch (e) {
        console.warn("senseiDemo press", e);
      }
      const sound = a.sound ? (Array.isArray(a.sound) ? a.sound : [a.sound]) : [];
      const sounding = sound.length ? env.say([...sound]) : Promise.resolve(true);
      if (pt) void paw()?.lift(add(pt, DEMO.liftOff), DEMO.up);
      await Promise.all([sounding, wait(Math.max(DEMO.up, a.hold ?? DEMO.hold))]);
      if (!live()) return;
      if (a.then?.length) {
        publish("then", i);
        await wait(DEMO.thenGap);
        await sayIf(a.then);
      }
    }
    if (!live()) return;
    // (f) the paw goes home, and a calm beat
    publish("home");
    const home = out ? (paw()?.home(origin(), DEMO.home) ?? env.sleep(DEMO.home)) : Promise.resolve();
    out = false;
    publish("beat");
    await Promise.all([home, wait(o.beat ?? DEMO.beat)]);
    if (live() && o.clear) {
      try {
        o.clear();
      } catch (e) {
        console.warn("senseiDemo clear", e);
      }
    }
    // a card tapped during the action says its word now, after the calm (never between "Look!" and the press, or on
    // top of the effect's own word)
    if (live()) await demoPause();
    if (!live()) return;
    watch(null, "done");
    publish("done");
  } finally {
    offUpright();
    wakers.clear();
    if (token === tokens) {
      if (!cancelled && (!live() || out)) {
        // the scene went away mid-demo: the paw goes at once
        paw()?.halo(null);
        paw()?.hide();
        if (watching) watch(null, "done");
      }
      if (env.current() === mine) env.publish((prev as Record<string, unknown>) ?? null);
      running = null;
      if (!talks) dropAside();
    }
  }
}

// ---------------------------------------------------------------- the layer (the DOM paw)
/** Sensei's paw: a red panda's paw (four round toes, her red fur at the wrist, the green sleeve of her robe with its
 *  cream trim and a blossom), pointing up (CSS tilts it up and to the left), drawn at 150 × 190 stage px with its
 *  fingertip, the hotspot, at (75, 14). Not the white glove: the glove is the idle "tap here" hint and the Show me again
 *  icon, so the child reads it as "tap here"; this is Sensei's own hand. */
/** the paw is drawn 1.2× its viewBox (180 × 228 stage px: about 97 × 123 CSS px on an 844 × 390 phone) */
const PAW_K = 1.2;
const HOT = { x: 75 * PAW_K, y: 14 * PAW_K };
const PAW_SVG = (
  <svg viewBox="0 0 150 190" width={150 * PAW_K} height={190 * PAW_K} aria-hidden="true">
    {/* her robe's sleeve: bright green, a cream trim, a blossom */}
    <path d="M16 190 L28 126 Q75 106 122 126 L134 190 Z" fill="#6db34f" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
    <path d="M30 134 Q75 115 120 134" fill="none" stroke="#f6f1c9" strokeWidth="10" strokeLinecap="round" />
    <path d="M44 176 Q46 156 42 142" fill="none" stroke="#4f9235" strokeWidth="5" strokeLinecap="round" />
    <circle cx="100" cy="162" r="9" fill="#ff9ec0" stroke="#2b1d14" strokeWidth="3.5" />
    <circle cx="100" cy="162" r="3" fill="#fff4dc" />
    {/* the wrist: her red fur, with a cream highlight */}
    <path d="M42 128 C38 106 38 88 42 72 L108 72 C112 88 112 106 108 128 Q75 116 42 128 Z" fill="#d4652b" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
    <path d="M54 118 C51 104 51 92 54 82" fill="none" stroke="#f0a36c" strokeWidth="8" strokeLinecap="round" />
    {/* the paw: dark and soft, with a warm rim light */}
    <path d="M34 80 C27 54 38 30 56 22 C66 17 84 17 94 22 C112 30 123 54 116 80 C102 92 48 92 34 80 Z" fill="#3f2216" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
    <path d="M44 74 C39 58 44 44 54 36" fill="none" stroke="#8a5a3c" strokeWidth="6" strokeLinecap="round" />
    {/* four round toes, the middle two at the tip */}
    <ellipse cx="46" cy="44" rx="12" ry="13" fill="#57301f" stroke="#2b1d14" strokeWidth="5" />
    <ellipse cx="65" cy="27" rx="13" ry="14" fill="#57301f" stroke="#2b1d14" strokeWidth="5" />
    <ellipse cx="86" cy="27" rx="13" ry="14" fill="#57301f" stroke="#2b1d14" strokeWidth="5" />
    <ellipse cx="104" cy="44" rx="12" ry="13" fill="#57301f" stroke="#2b1d14" strokeWidth="5" />
    <path d="M58 22 Q64 17 70 20 M79 20 Q85 17 91 22" fill="none" stroke="#9a6a4a" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);
/** Her paw print, pressed onto the target (gold, fading). */
const PRINT_SVG = (
  <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
    <g fill="#ffd35a" stroke="#b9770e" strokeWidth="3">
      <ellipse cx="40" cy="52" rx="17" ry="14" />
      <ellipse cx="20" cy="30" rx="7" ry="9" />
      <ellipse cx="33" cy="19" rx="7" ry="9" />
      <ellipse cx="47" cy="19" rx="7" ry="9" />
      <ellipse cx="60" cy="30" rx="7" ry="9" />
    </g>
  </svg>
);
const TRAIL = [
  { d: 34, c: "sd-gold" },
  { d: 30, c: "sd-green" },
  { d: 26, c: "sd-pink" },
  { d: 22, c: "sd-gold" },
  { d: 18, c: "sd-green" },
  { d: 14, c: "sd-pink" },
];
const EASE = "cubic-bezier(0.45, 0.05, 0.3, 1)";
/** the paw points up and a little to the left (it comes up into a target from below); it leans 8° more in flight */
export const PAW_TILT = -16;
const TILT = PAW_TILT;
/** The paw's outline in stage px, with its fingertip at `tip`, turned `rot` degrees about it (for the checks: what the
 *  paw covers). Its toes, pad, wrist and sleeve, as drawn in PAW_SVG, each edge sampled every few px. */
export function pawOutline(tip: DemoPoint, rot = PAW_TILT): DemoPoint[] {
  const pts: [number, number][] = [[16, 190], [28, 126], [42, 128], [38, 100], [34, 80], [30, 58], [34, 44], [40, 32], [52, 30], [54, 18], [65, 13], [76, 16], [86, 13], [97, 18], [98, 30], [110, 32], [116, 44], [120, 58], [116, 80], [112, 100], [108, 128], [122, 126], [134, 190]];
  const a = (rot * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const out: DemoPoint[] = [];
  for (let k = 0; k < pts.length; k++) {
    const [x0, y0] = pts[k], [x1, y1] = pts[(k + 1) % pts.length];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6));
    for (let j = 0; j < n; j++) {
      const x = (x0 + ((x1 - x0) * j) / n) * PAW_K - HOT.x, y = (y0 + ((y1 - y0) * j) / n) * PAW_K - HOT.y;
      out.push({ x: tip.x + x * c - y * s, y: tip.y + x * s + y * c });
    }
  }
  return out;
}

/** The paw's path from a to b, a quadratic curve sampled evenly along its length (`n` points with offsets 0…1), shaped
 *  so it never passes over anything but its target:
 *  - rising (from her corner up to a card): a scoop, along below the board and then up into the target from underneath,
 *    so it never crosses the cards beside it (a card between her corner and the target is the child's next answer);
 *  - falling (from a card back to her corner): down out of the row first, then along to her portrait;
 *  - level (a hop between targets in one row), or `lift` given: bowed upwards by `lift` (a third of the distance,
 *    60–220 px). */
export function arcPath(a: DemoPoint, b: DemoPoint, n = 16, lift?: number): { p: DemoPoint; t: number }[] {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const h = lift ?? Math.max(60, Math.min(220, dist * 0.32));
  const c =
    lift == null && dy < -80
      ? { x: b.x - dx * 0.2, y: a.y } // rising: along at the start's height, then up into the target
      : lift == null && dy > 80
        ? { x: a.x + dx * 0.2, y: b.y } // falling: down out of the row, then along
        : { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - h };
  const pts: DemoPoint[] = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n, u = 1 - t;
    pts.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y });
  }
  const seg = pts.slice(1).map((p, k) => Math.hypot(p.x - pts[k].x, p.y - pts[k].y));
  const total = seg.reduce((s, v) => s + v, 0) || 1;
  let acc = 0;
  return pts.map((p, k) => {
    if (k > 0) acc += seg[k - 1];
    return { p, t: k === pts.length - 1 ? 1 : acc / total };
  });
}

function domPaw(root: HTMLElement): PawDriver {
  const q = <T extends HTMLElement>(s: string) => root.querySelector(s) as T;
  const pawEl = q(".sd-paw"), inner = q(".sd-paw-in"), halo = q(".sd-halo"), ripple = q(".sd-ripple"), print = q(".sd-print"), glow = q(".sd-glow");
  const dots = [...root.querySelectorAll<HTMLElement>(".sd-trail i")];
  const live = new Set<Animation>();
  let pos: DemoPoint = { x: 0, y: 0 };
  let frozen = false;
  const tf = (p: DemoPoint, rot = 0, s = 1) => `translate(${(p.x - HOT.x).toFixed(1)}px, ${(p.y - HOT.y).toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${s})`;
  const run = (el: HTMLElement, frames: Keyframe[], o: KeyframeAnimationOptions): Promise<void> => {
    const a = el.animate(frames, o);
    a.playbackRate = FAST;
    if (frozen) a.pause();
    live.add(a);
    return a.finished.then(
      () => void live.delete(a),
      () => void live.delete(a),
    );
  };
  const show = (el: HTMLElement, on: boolean) => (el.style.display = on ? "block" : "none");
  const place = (el: HTMLElement, x: number, y: number, w?: number, h?: number) => {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    if (w != null) el.style.width = `${w}px`;
    if (h != null) el.style.height = `${h}px`;
  };
  const settle = (p: DemoPoint, rot = TILT, s = 1) => {
    pos = p;
    pawEl.style.transform = tf(p, 0, 1);
    inner.style.transform = `rotate(${rot}deg) scale(${s})`;
  };
  /** the trail: sparkles of her colours following the fingertip's path a little behind (drawn over her arm, and on
   *  behind it), fading at both ends */
  const trail = (path: { p: DemoPoint; t: number }[], ms: number, faint = false) => {
    dots.forEach((d, k) => {
      const r = TRAIL[k].d / 2;
      show(d, true);
      const frames = path.map(({ p, t }) => ({
        offset: t,
        transform: `translate(${(p.x - r).toFixed(1)}px, ${(p.y - r).toFixed(1)}px)`,
        opacity: t < 0.06 ? 0 : t > 0.92 ? 0 : (faint ? 0.55 : 0.95) * (1 - k * 0.1),
      }));
      void run(d, frames, { duration: ms, delay: 90 + k * 110, easing: EASE, fill: "both" }).then(() => show(d, false));
    });
  };
  const flyTo = async (to: DemoPoint, ms: number, o: { lift?: number; faint?: boolean; s1?: number; fade?: boolean } = {}) => {
    const from = pos;
    const path = arcPath(from, to, 16, o.lift);
    const s1 = o.s1 ?? 1;
    const frames = path.map(({ p, t }) => ({ offset: t, transform: tf(p, 0, 1 + (s1 - 1) * t), opacity: o.fade ? (t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1) : 1 }));
    trail(path, ms, o.faint);
    // the paw leans into the flight, and settles as it arrives
    void run(inner, [{ transform: `rotate(${TILT}deg)` }, { transform: `rotate(${TILT - 8}deg)`, offset: 0.35 }, { transform: `rotate(${TILT + 4}deg)`, offset: 0.85 }, { transform: `rotate(${TILT}deg)` }], { duration: ms, easing: EASE });
    await run(pawEl, frames, { duration: ms, easing: EASE, fill: "forwards" });
    settle(to);
    pawEl.getAnimations().forEach((a) => a.cancel());
  };
  return {
    async emerge(from, peek, ms) {
      show(root, true);
      show(pawEl, true);
      pawEl.style.opacity = "1";
      const r = 62;
      place(glow, from.x - r, from.y - r, r * 2, r * 2);
      show(glow, true);
      void run(glow, [{ transform: "scale(0.9)", opacity: 0.95 }, { transform: "scale(1.4)", opacity: 0 }], { duration: 650, easing: "ease-out" }).then(() => show(glow, false));
      pos = from;
      pawEl.style.transform = tf(from, 0, 0.35);
      await run(
        pawEl,
        [
          { transform: tf(from, 0, 0.35), opacity: 0 },
          { transform: tf(add(from, { x: peek.x - from.x, y: (peek.y - from.y) * 0.5 }), 0, 0.8), opacity: 1, offset: 0.45 },
          { transform: tf(peek, 0, 1), opacity: 1 },
        ],
        { duration: ms, easing: "cubic-bezier(0.3, 1.35, 0.5, 1)", fill: "forwards" },
      );
      settle(peek);
      pawEl.getAnimations().forEach((a) => a.cancel());
      // a little wave hello
      void run(inner, [{ transform: `rotate(${TILT}deg)` }, { transform: `rotate(${TILT - 12}deg)`, offset: 0.3 }, { transform: `rotate(${TILT + 8}deg)`, offset: 0.65 }, { transform: `rotate(${TILT}deg)` }], { duration: 620, easing: "ease-in-out" });
    },
    fly: (to, ms) => flyTo(to, ms),
    halo(box) {
      if (!box) {
        if (halo.style.display === "block") void run(halo, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" }).then(() => show(halo, false));
        return;
      }
      const pad = 10;
      place(halo, box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2);
      show(halo, true);
      void run(halo, [{ opacity: 0, transform: "scale(1.06)" }, { opacity: 1, transform: "scale(1)" }], { duration: 260, easing: "ease-out", fill: "forwards" });
    },
    async press(at, downMs) {
      const start = pos;
      void run(inner, [{ transform: `rotate(${TILT}deg) scale(1)` }, { transform: `rotate(${TILT + 6}deg) scale(1.08, 0.86)` }], { duration: downMs, easing: "ease-in", fill: "forwards" });
      await run(pawEl, [{ transform: tf(start) }, { transform: tf(at) }], { duration: downMs, easing: "cubic-bezier(0.5, 0, 0.9, 0.6)", fill: "forwards" });
      pos = at;
      pawEl.style.transform = tf(at);
      pawEl.getAnimations().forEach((a) => a.cancel());
      // the ripple, and her paw print on the target
      const rr = 80;
      place(ripple, at.x - rr, at.y - rr, rr * 2, rr * 2);
      show(ripple, true);
      void run(ripple, [{ transform: "scale(0.25)", opacity: 1 }, { transform: "scale(1.45)", opacity: 0 }], { duration: 560, easing: "cubic-bezier(0.2, 0.6, 0.3, 1)" }).then(() => show(ripple, false));
      place(print, at.x - 40, at.y - 40);
      show(print, true);
      void run(print, [{ transform: "scale(0.5)", opacity: 0 }, { transform: "scale(1.05)", opacity: 1, offset: 0.2 }, { transform: "scale(1)", opacity: 0.9, offset: 0.55 }, { transform: "scale(1)", opacity: 0 }], { duration: 1100, easing: "ease-out" }).then(() => show(print, false));
    },
    async lift(to, ms) {
      void run(inner, [{ transform: `rotate(${TILT + 6}deg) scale(1.08, 0.86)` }, { transform: `rotate(${TILT}deg) scale(1)` }], { duration: ms, easing: "cubic-bezier(0.3, 1.5, 0.5, 1)", fill: "forwards" });
      await run(pawEl, [{ transform: tf(pos) }, { transform: tf(to) }], { duration: ms, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)", fill: "forwards" });
      settle(to);
      pawEl.getAnimations().forEach((a) => a.cancel());
      inner.getAnimations().forEach((a) => a.cancel());
    },
    async home(to, ms) {
      await flyTo(add(to, { x: -20, y: -10 }), ms, { faint: true, s1: 0.4, fade: true });
      const r = 62;
      place(glow, to.x - r, to.y - r, r * 2, r * 2);
      show(glow, true);
      void run(glow, [{ transform: "scale(0.9)", opacity: 0.7 }, { transform: "scale(1.3)", opacity: 0 }], { duration: 500, easing: "ease-out" }).then(() => show(glow, false));
      show(pawEl, false);
      // (the layer goes once the glow has faded; the demo doesn't wait for it)
      setTimeout(() => pawEl.style.display === "none" && show(root, false), 520);
    },
    hide() {
      live.forEach((a) => a.cancel());
      live.clear();
      [pawEl, halo, ripple, print, glow, ...dots].forEach((e) => show(e, false));
      show(root, false);
    },
    freeze(on) {
      frozen = on;
      live.forEach((a) => (on ? a.pause() : a.play()));
    },
  };
}

/**
 * The demo layer: mount once inside the Stage, right after the scene and before <HelpButton/> and <NavLayer/> (z 84: over
 * the scene's caption bubble by DOM order, so a caption never hides the paw; under the nav buttons and Sensei's portrait,
 * so her paw comes out from behind her). Nothing in it takes taps. When it unmounts (the child left), a running demo is
 * cancelled.
 */
export function SenseiDemoLayer(): ReactNode {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const d = domPaw(el);
    demoEnv.paw = d;
    return () => {
      if (demoEnv.paw === d) {
        cancelDemo();
        demoEnv.paw = null;
      }
    };
  }, []);
  return (
    <div ref={root} className="sd-layer" aria-hidden="true" data-sensei-demo="">
      <div className="sd-glow" />
      <div className="sd-halo" />
      <div className="sd-ripple" />
      <div className="sd-print">{PRINT_SVG}</div>
      <div className="sd-paw">
        <div className="sd-paw-in">{PAW_SVG}</div>
      </div>
      <div className="sd-trail">
        {TRAIL.map((t, k) => (
          <i key={k} className={t.c} style={{ width: t.d, height: t.d }} />
        ))}
      </div>
    </div>
  );
}
