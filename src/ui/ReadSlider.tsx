// The read slider (docs/READ_SLIDER.md; Jonas, 27 Sep): "drag their finger from left to right … as they go under a sound
// or a word, it says that word … If you go from right to left, it says, no, that's not the right way. You always go
// from left to right." One continuous left-to-right sweep, never a punch per item.
//
// A bamboo rail runs under the items (picture cards, or the sound dots under one picture). The tortoise sits on a
// glowing start dot at its left end: it is the handle (≥ 64 CSS px on an 844×390 phone), with a painted arrow pointing
// right. The child puts a finger on the tortoise and slides it to the right:
//   · the slow way: each item lights, and its clip plays, as the tortoise reaches it (a word, or a pure sound cut from
//     the word's checked slow word, public/a/x); an ELASTIC RATCHET means clips never overlap and are never cut off: the
//     next item waits for the last clip's end plus a gap (300 ms for words, SLOW_GAP_MS for sounds), and the tortoise
//     waits just before it, stretched towards the finger, then catches up. A flick still reads every item in order;
//   · the fast way: the rabbit at the right-hand end wakes, and its tap says the whole word (the cards bloom into the
//     whole picture). At 8 s it hops and glows; at 12 s Sensei says the fast way herself;
//   · the wrong way (a sweep to the left: a touch that starts right of the tortoise, or on it or the first card before
//     anything is read, and moves left; or the tortoise pulled back across what it has read): nothing more is read,
//     the tortoise pops home (it never walks back to the left), the start dot pulses, a light sweeps the rail left to
//     right, and Sensei says one of three gentle lines;
//   · a tap without a drag: nothing moves, the tortoise bounces and the arrow pulses (a ghost hand shows the slide),
//     and the turn waits again; a start in the middle wiggles the tortoise, and the second time Sensei says "Let's start
//     on this side…";
//   · a tall touch band (the cards and the rail, only x matters) for wobbly fingers; only the first finger counts (a
//     palm that holds nothing gives way to the finger that takes the tortoise);
//   · demo mode: Sensei's own red panda's paw comes out of her portrait and drives it slowly (slideDemo()), including
//     her backwards gag ("bow… rain"), and after it rides the rail left to right (home());
//   · the idle ladder (game time, paused while anyone speaks, while a nav hold is up or the phone is upright), and the
//     bot contract: window.__snState { scene: "slider", next: "drag" | "rabbit" }, window.__snSlider.drag().
// Performance (docs/PERF.md): transform and opacity only; the tortoise's transform is written straight to the DOM in
// pointermove (at most one requestAnimationFrame per frame while a finger is down, none when idle); the only endless
// animations are the waiting tortoise's glow and the waiting rabbit's pulse, both on the compositor.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { say, hush, isSpeaking, onSpeaking, audioCtx, load, preload, urls, nextClip, sfx, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import type { PhonemeId } from "../content/phonics";
import { SLOW_TIMES, SLOW_GAP_MS } from "../content/stretch";
import { NEW_SLOW_TIMES } from "../content/compounds";
import { PIC_PLATES, PLATE_COLOURS } from "../content/pic-plates.gen";
import { img, fx, isUpright, onUpright, useHelp, W } from "./ui";
import { ninja } from "./Ninja";
import { useNav, useHeld, navLog } from "./nav";
import "../styles/read-slider.css";

// ---------------------------------------------------------------- items and geometry (stage px, 1280×720)
/** A part the tortoise reads: a picture word (said as { word }), or a sound (a slice of `word`'s slow word). */
export type SliderItem = { kind: "word"; w: string; pic?: string } | { kind: "sound"; p: PhonemeId; word?: string; i?: number };
export type SliderMode = "words" | "sounds";
type Box = { x: number; y: number; w: number; h: number };
export interface Geo {
  /** the start dot (the tortoise's home) and the rail's right-hand end, x */
  start: number;
  end: number;
  railY: number;
  /** a touch at or left of this starts a fresh read (the tortoise, the dot, and into the first item) */
  startZone: number;
  /** an item fires when the tortoise reaches this x (reading forwards) */
  fire: number[];
  /** Sensei's backwards gag: an item fires when the tortoise, walking left, reaches this x */
  fireBack: number[];
  /** while the voice is busy the tortoise waits here, just before the next item */
  wait: number[];
  /** the slow way is finished once the tortoise has passed this (or the finger has lifted) */
  doneX: number;
  /** the items' own boxes (cards, or sound dots), and the whole picture's */
  boxes: Box[];
  whole: Box;
  /** sounds mode: the picture over the dots */
  pic: Box | null;
  rabbit: { x: number; y: number; d: number };
  band: Box;
}
export const RAIL = { start: 400, end: 985, y: 460 } as const;
/** The tortoise handle's width in stage px: 140 × 0.49 = 69 CSS px on an 844×390 phone (docs/READ_SLIDER.md §2). */
export const HANDLE_W = 140;
const HANDLE_H = Math.round((HANDLE_W * 169) / 256);

/** Where everything goes, for `n` items in `mode`. The play area is x 340–1110 (docs/HERO.md); the band stops above
 *  the nav row (y 562), and the rabbit stays clear of the Help zone (x 1116, y 556) and of a two-line caption bubble
 *  (grown-ups' captions: its top is near y 480). */
export function geoFor(n: number, mode: SliderMode): Geo {
  const start = RAIL.start, end = RAIL.end, railY = RAIL.y;
  const boxes: Box[] = [];
  let pic: Box | null = null;
  if (mode === "words") {
    const plate = n <= 2 ? 220 : n === 3 ? 170 : 130;
    const gap = n <= 2 ? 40 : 24;
    const span = n * plate + (n - 1) * gap;
    const cx = (start + 90 + end - 30) / 2;
    for (let i = 0; i < n; i++) boxes.push({ x: cx - span / 2 + i * (plate + gap), y: railY - 95 - plate, w: plate, h: plate });
  } else {
    const d = 78;
    const left = 545, right = 885;
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? (left + right) / 2 : left + ((right - left) * i) / (n - 1);
      boxes.push({ x: x - d / 2, y: railY - d / 2, w: d, h: d });
    }
    pic = { x: (left + right) / 2 - 115, y: railY - 70 - 230, w: 230, h: 230 };
  }
  const fire = boxes.map((b) => (mode === "words" ? b.x + b.w * 0.35 : b.x + b.w * 0.3));
  const fireBack = boxes.map((b) => (mode === "words" ? b.x + b.w * 0.65 : b.x + b.w * 0.7));
  const wait = boxes.map((b, i) => Math.max(i ? fire[i - 1] + 1 : start, b.x - (mode === "words" ? 16 : 26)));
  const first = boxes[0];
  const startZone = first ? Math.max(start + 70, first.x + first.w * (mode === "words" ? 0.6 : 0.2)) : start + 70;
  const last = boxes[boxes.length - 1];
  const doneX = Math.min(end - 10, last ? last.x + last.w + 8 : end - 10);
  const wholeSize = mode === "words" ? 250 : 230;
  const wcx = boxes.length ? (boxes[0].x + last.x + last.w) / 2 : (start + end) / 2;
  const whole = mode === "words" ? { x: wcx - wholeSize / 2, y: railY - 95 - wholeSize + 15, w: wholeSize, h: wholeSize } : pic!;
  return {
    start, end, railY, startZone, fire, fireBack, wait, doneX, boxes, whole, pic,
    rabbit: { x: 1060, y: railY - 44, d: 124 },
    band: { x: 336, y: 112, w: 668, h: 540 - 112 },
  };
}

// ---------------------------------------------------------------- the slide's rules (pure: src/ui/read-slider.test.ts)
/** A sweep this far to the left (stage px; 49 CSS px on a phone) is the wrong way. Less is a wobble. */
export const BACK_PX = 100;
/** A touch right of the tortoise that moves this far right is a start in the middle. */
export const MIDDLE_PX = 60;
/** A touch this close to a paused tortoise picks it up again. */
export const CARRY_PX = 120;
/** A tap: less movement than this, in less time than TAP_MS. */
export const TAP_PX = 14;
export const TAP_MS = 450;
/** The gap between two words, and after the last before the slow way counts as done. Sounds use SLOW_GAP_MS. */
export const WORD_GAP_MS = 300;
/** A slide from the first item to the end in less than this is a flick (the parts still play, with their gaps). */
export const FLICK_MS = 450;

/** How far the finger may be behind the tortoise and still count as holding it (the pull-back is measured from there). */
export const HOLD_SLACK = 24;

export type SlideEvent =
  | { kind: "grab" }
  | { kind: "restart" }
  | { kind: "fire"; i: number }
  | { kind: "wrong"; why: "backwards" | "reversed" }
  | { kind: "middle"; n: number }
  | { kind: "tap"; x: number; grabbed: boolean }
  | { kind: "lift" }
  /** the finger took the tortoise and let go without reading anything (a tap, or a press and no drag) */
  | { kind: "drop" }
  | { kind: "slowDone"; flick: boolean };

/**
 * The read slider's rules, with no DOM and no audio: a finger's x (stage px) and game time in, events out. The tortoise
 * is at handle(t). `hw` (the high-water mark) is the furthest the finger has taken it; it only grows during a read, so
 * moving back never un-reads or re-reads anything. A part fires when the voice is free and the tortoise reaches it;
 * while a clip plays (and for `gapMs` after it) the next part waits: the ratchet.
 *
 * The tortoise only moves once the finger has moved right (TAP_PX): a tap, even on its right half, leaves it where it
 * is. The wrong way while holding it ("reversed") is measured from the tortoise, not from the finger's furthest point:
 * `down.anchor` is where the tortoise was when the finger was last with it (or ahead of it, on the elastic band), so a
 * finger that ran ahead and comes back towards a waiting tortoise is not pulling it back (the judge, 27 Sep: 960 → 760
 * with the tortoise at 726 was taken for a backwards pull). Before anything is read, a finger that took the tortoise (on
 * it, or on the first card, which is in the start zone) and sweeps BACK_PX to the left is "backwards", as a touch that
 * holds nothing is.
 */
export class SlideCore {
  readonly geo: Geo;
  readonly n: number;
  readonly gapMs: number;
  hw: number;
  fired = 0;
  playing: number | null = null;
  freeAt = 0;
  over = false;
  /** a wrong way was seen: nothing more fires until reset() */
  halted = false;
  wrongs = 0;
  middles = 0;
  flicks = 0;
  down: { x0: number; t0: number; max: number; min: number; last: number; grabbed: boolean; middle: boolean; wrong: boolean; drag: boolean; anchor: number } | null = null;
  private firstAt = 0;
  constructor(geo: Geo, gapMs: number) {
    this.geo = geo;
    this.n = geo.fire.length;
    this.gapMs = gapMs;
    this.hw = geo.start;
  }
  /** Is a clip playing, or its gap still running? */
  busy(t: number) {
    return this.playing !== null || t < this.freeAt;
  }
  /** Where the tortoise is drawn: the finger's furthest point, held just before the next part while the voice is busy. */
  handle(t: number): number {
    const g = this.geo;
    const cap = this.fired < this.n ? (this.busy(t) ? g.wait[this.fired] : g.fire[this.fired]) : g.end;
    return Math.max(g.start, Math.min(this.hw, cap, g.end));
  }
  /** Has a read begun (something fired, or the tortoise has moved)? */
  get begun() {
    return this.fired > 0 || this.hw > this.geo.start + 1;
  }
  reset() {
    this.hw = this.geo.start;
    this.fired = 0;
    this.over = false;
    this.halted = false;
    this.down = null;
    this.firstAt = 0;
    // (a clip still playing keeps `playing` until clipDone: it is never cut off)
  }
  pump(t: number): SlideEvent[] {
    const out: SlideEvent[] = [];
    if (this.over || this.halted) return out;
    const g = this.geo;
    if (!this.busy(t) && this.fired < this.n && this.hw >= g.fire[this.fired]) {
      if (!this.fired) this.firstAt = t;
      out.push({ kind: "fire", i: this.fired });
      this.playing = this.fired++;
    }
    if (this.fired === this.n && !this.busy(t) && (!this.down || this.hw >= g.doneX)) {
      this.over = true;
      const flick = this.reachedEndAt > 0 && this.reachedEndAt - this.firstAt < FLICK_MS;
      if (flick) this.flicks++;
      out.push({ kind: "slowDone", flick });
    }
    return out;
  }
  private reachedEndAt = 0;
  private advance(x: number, t: number): SlideEvent[] {
    if (x <= this.hw) return [];
    this.hw = Math.min(x, this.geo.end);
    if (this.hw >= this.geo.doneX && !this.reachedEndAt) this.reachedEndAt = t;
    return this.pump(t);
  }
  /** The part's clip has ended (at game time t): the voice is free again after the gap. */
  clipDone(i: number, t: number): SlideEvent[] {
    if (this.playing === i) this.playing = null;
    this.freeAt = t + this.gapMs;
    return this.pump(t);
  }
  /** A paused read and a touch back on the start dot (the tortoise well past it, the voice free): a fresh read. */
  private restartsAt(x: number, t: number) {
    return this.begun && x <= this.geo.startZone && this.handle(t) > this.geo.startZone + CARRY_PX && !this.busy(t);
  }
  /** Would a touch at x take the tortoise (a fresh start, a restart, or picking up a paused read)? */
  wouldGrab(x: number, t: number): boolean {
    if (this.over || this.halted) return false;
    if (!this.begun || this.restartsAt(x, t)) return x <= this.geo.startZone;
    return x <= this.handle(t) + CARRY_PX;
  }
  pointerDown(x: number, t: number): SlideEvent[] {
    if (this.over || this.halted) return [];
    const out: SlideEvent[] = [];
    if (this.restartsAt(x, t)) {
      this.reset();
      out.push({ kind: "restart" });
    }
    const grabbed = this.wouldGrab(x, t);
    this.down = { x0: x, t0: t, max: x, min: x, last: x, grabbed, middle: false, wrong: false, drag: false, anchor: this.handle(t) };
    // (the tortoise stays put until the finger moves right: a tap, even on its right half, moves nothing)
    if (grabbed) out.push({ kind: "grab" });
    return out;
  }
  /** Forget the finger that is down, with no events (a resting palm, replaced by the finger that takes the tortoise). */
  cancelDown() {
    this.down = null;
  }
  pointerMove(x: number, t: number): SlideEvent[] {
    const d = this.down;
    if (!d || this.over || d.wrong) return [];
    d.last = x;
    d.max = Math.max(d.max, x);
    d.min = Math.min(d.min, x);
    if (d.grabbed) {
      // nothing read yet and a sweep to the left (a swipe that starts on the tortoise or the first card, which take the
      // tortoise): the wrong way, as for a touch that holds nothing (the judge, 27 Sep: it read nothing and said nothing)
      if (!this.fired && d.max - x >= BACK_PX) return this.wrong("backwards");
      if (!d.drag && x - d.x0 >= TAP_PX) d.drag = true;
      const out = d.drag && x > this.hw ? this.advance(x, t) : [];
      const h = this.handle(t);
      // the finger is with the tortoise, or ahead of it on the elastic band: this is where it holds it
      if (x >= h - HOLD_SLACK) d.anchor = h;
      // the tortoise pulled back (the finger 100 px left of where it last held it), with more still to read: the wrong
      // way (the tortoise catching up past a finger that came back towards it is not a pull)
      else if (this.fired > 0 && this.fired < this.n && d.anchor - x >= BACK_PX) return this.wrong("reversed");
      return out;
    }
    if (d.max - x >= BACK_PX) return this.wrong("backwards");
    if (!d.middle && x - d.x0 >= MIDDLE_PX) {
      d.middle = true;
      return [{ kind: "middle", n: ++this.middles }];
    }
    return [];
  }
  pointerUp(x: number, t: number): SlideEvent[] {
    const d = this.down;
    this.down = null;
    if (!d || this.over) return [];
    const out: SlideEvent[] = [];
    if (!d.wrong && Math.abs(x - d.x0) < TAP_PX && d.max - d.min < TAP_PX * 2 && t - d.t0 < TAP_MS) out.push({ kind: "tap", x, grabbed: d.grabbed });
    if (d.wrong || this.halted) return out;
    out.push(...this.pump(t));
    if (!this.over && this.begun) out.push({ kind: "lift" });
    else if (!this.over && d.grabbed) out.push({ kind: "drop" });
    return out;
  }
  /** A tap on part `i` (a child who can't drag yet): the next part in order counts as the tortoise reaching it. */
  tapPart(i: number, t: number): SlideEvent[] {
    if (this.over || this.halted || i !== this.fired) return [];
    return this.advance(Math.max(this.hw, this.geo.fire[i]), t);
  }
  private wrong(why: "backwards" | "reversed"): SlideEvent[] {
    if (this.down) this.down.wrong = true;
    this.halted = true;
    this.wrongs++;
    return [{ kind: "wrong", why }];
  }
}

// ---------------------------------------------------------------- lines, audio and the world (injectable for tests)
export interface SliderLines {
  /** how to slide (the ghost hand's words): the 16 s idle and Help's first press */
  how: string;
  idle: string;
  /** the wrong way, in turn (the save's first is the one that says "left to right") */
  back: readonly string[];
  /** the second start in the middle in a turn */
  startHere: string;
  /** a slide that stopped part-way: 10 s */
  keepGoing: string;
  /** …and after 22 s the tortoise goes home for a fresh start */
  again: string;
  /** Sensei's fast way (the rabbit's 12 s, or `fast: "auto"`), then the whole word */
  autoFast: string;
  /** after three flicks in a session, once (◇) */
  slowly: string;
}
export const SLIDER_LINES: SliderLines = {
  how: "rs_how",
  idle: "rs_idle",
  back: ["rs_back_1", "rs_back_2", "rs_back_3"],
  startHere: "rs_start_here",
  keepGoing: "rs_keep_going",
  again: "rs_again",
  autoFast: "tv_fs_fast_rabbit",
  slowly: "rs_slowly",
};
/** The line said as the rabbit wakes after the child's slide (null: none). */
export const RABBIT_ASK = "rs_now_fast";

let sliceSrc: AudioBufferSourceNode | null = null;
/** One sound of a slow word (public/a/x/<word>.mp3): from its onset to the next onset less the gap (the last to the
 *  clip's end), so /g/ and /b/ keep their voiced closure and short vowels stay short (TEACHER_SCRIPT §9.1). Music ducks
 *  under it (a silent say() of the same length). Resolves when it has played. */
async function playSlowSound(word: string, i: number): Promise<boolean> {
  const times = SLOW_TIMES[word] ?? NEW_SLOW_TIMES[word];
  const buf = await load(urls.stretch(word));
  if (!times || !buf || times[i] == null) return false;
  const from = Math.max(0, times[i] - 0.012);
  const to = i + 1 < times.length ? times[i + 1] - SLOW_GAP_MS / 1000 + 0.03 : buf.duration;
  const dur = Math.max(0.05, to - from);
  const c = audioCtx();
  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = FAST;
  const g = c.createGain();
  const t0 = c.currentTime;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(1, t0 + 0.006);
  g.gain.setValueAtTime(1, t0 + Math.max(0.007, dur / FAST - 0.02));
  g.gain.linearRampToValueAtTime(0, t0 + dur / FAST);
  src.connect(g);
  g.connect(c.destination);
  void say([{ gap: (dur * 1000) / FAST }], { keep: true }); // (music ducks, and Sensei counts as speaking)
  sliceSrc = src;
  src.start(t0, from, dur);
  ((window as any).__audioLog as unknown[] | undefined)?.push({ t: Date.now(), url: `${urls.stretch(word)}#${i}`, kind: "speech", slider: true });
  await new Promise<void>((resolve) => {
    const done = () => (clearTimeout(guard), resolve());
    const guard = setTimeout(done, dur * 1000 + 250); // (never hang on a suspended context)
    src.onended = done;
  });
  if (sliceSrc === src) sliceSrc = null;
  return true;
}

/** What the slider does to the world. Production values; read-slider.test.ts swaps in fakes. */
export const sliderEnv = {
  /** game ms */
  now: () => performance.now() * FAST,
  say: (items: Say[]): Promise<boolean> => say(items),
  hush: () => {
    hush();
    try {
      sliceSrc?.stop();
    } catch {}
  },
  /** a part: its word, or its sound (a slice of the slow word; else the pure sound) */
  part: async (it: SliderItem): Promise<void> => {
    if (it.kind === "word") return void (await say([{ word: it.w }]));
    if (it.word != null && it.i != null && (await playSlowSound(it.word, it.i))) return;
    await say([{ sound: it.p, show: "tile" }]);
  },
  /** resolves when clip `id` ("word:rain") starts, or null */
  clipStart: (id: string, ms = 2500) => nextClip(id, ms),
  speaking: () => isSpeaking(),
  sfx: (name: string) => {
    try {
      sfx[name]?.();
    } catch {}
  },
};

// ---------------------------------------------------------------- the controller (one slider at a time)
export interface SlideResult {
  /** how the fast way came: the child's rabbit tap, Sensei at 12 s, Sensei by design ("auto"), or none */
  how: "tap" | "timeout" | "auto" | "none";
  wrongWays: number;
  middles: number;
  flick: boolean;
  /** game ms from the first touch to the end of the fast word */
  ms: number;
}
export interface DemoOpts {
  /** Sensei's backwards gag: the tortoise hops to the right-hand end and walks back, reading the parts in reverse; with
   *  `gag`, the cards then merge into that picture ("bowrain") */
  backwards?: boolean;
  gag?: string;
  /** the paw's pace, stage px a second (default 170: the rail in about 3.5 s, plus the voice's waits) */
  pace?: number;
}
export interface SliderState {
  scene: "slider";
  id: string;
  mode: SliderMode;
  phase: Phase;
  /** what a child would do now: "drag" the tortoise, tap the "rabbit", or nothing (Sensei's turn) */
  next: "drag" | "rabbit" | null;
  from: { x: number; y: number };
  to: { x: number; y: number };
  rabbit: { x: number; y: number };
  fired: number;
  n: number;
  lit: number[];
  wrongWays: number;
  demo: boolean;
  busy: boolean;
}
type Ctl = {
  demo(o: DemoOpts): Promise<boolean>;
  cue(): void;
  home(o: { whole?: boolean }): Promise<void>;
  gag(pic: string | null): void;
  drag(o: { from?: number; to?: number; ms?: number }): Promise<void>;
  tapRabbit(): void;
  state(): SliderState;
};
let active: Ctl | null = null;
/** The mounted slider, driven from outside: Sensei's demos, the gag, bots. */
export const readSlider = {
  get mounted() {
    return !!active;
  },
  /** Sensei's paw slides the tortoise slowly (the slow way), or does her backwards gag. Resolves true when the slow way
   *  has been read (the rabbit then wakes, or Sensei says the fast way: the `fast` prop), false if the slider went. */
  demo: (o: DemoOpts = {}) => active?.demo(o) ?? Promise.resolve(false),
  /** The tortoise pops home (never walking left), the start dot pulses and a light sweeps the rail left to right;
   *  `whole`: a gag picture turns back into the whole word's. */
  home: (o: { whole?: boolean } = {}) => active?.home(o) ?? Promise.resolve(),
  /** Show a gag picture in the whole's place (null: back to the whole). */
  gag: (pic: string | null) => active?.gag(pic),
  /** "…this way": the start dot and the arrow pulse and a light runs the rail left to right (the frame line's word "this"). */
  cue: () => active?.cue(),
  /** A programmatic drag (bots, tests): the same rules as a finger, in stage x (default: the start dot to the end). */
  drag: (o: { from?: number; to?: number; ms?: number } = {}) => active?.drag(o) ?? Promise.resolve(),
  tapRabbit: () => active?.tapRabbit(),
  state: (): SliderState | null => active?.state() ?? null,
};
/** Sensei's paw drives the mounted slider (see readSlider.demo). */
export const slideDemo = (o: DemoOpts = {}) => readSlider.demo(o);
/** What a scene publishes as window.__snState while a slider is up (docs/READ_SLIDER.md §9). */
export const sliderState = () => readSlider.state();
if (typeof window !== "undefined") (window as any).__snSlider = readSlider;

/** The wrong-way lines take turns across the session (the save's first backwards slide hears "left to right"). */
let backTurn = 0;
/** Flicks this session: after three, `rs_slowly` once (◇, `coachSpeed`). */
let flicksInSession = 0;
let slowlySaid = false;

// ---------------------------------------------------------------- the component
export type Phase = "idle" | "sliding" | "paused" | "wrong" | "rabbit" | "fast" | "done" | "demo" | "back";
export interface ReadSliderProps {
  items: readonly SliderItem[];
  mode: SliderMode;
  /** the fast word: said on the rabbit ({ word }), and (words mode) the picture the cards bloom into */
  whole: string;
  /** sounds mode: the picture over the dots (default `whole`) */
  pic?: string;
  onDone?: (r: SlideResult) => void;
  /** a wrong-way sweep, with how many this turn (Sensei's line is the slider's own) */
  onWrongWay?: (n: number) => void;
  /** each part as it is read (i), for the scene's own effects */
  onPart?: (i: number) => void;
  /** Sensei's paw drives it (slideDemo()): the child's touches only wiggle the tortoise */
  demo?: boolean;
  /** the fast way: the child taps the rabbit (default), Sensei says it ("auto"), or none */
  fast?: "rabbit" | "auto" | "none";
  /** said as the rabbit wakes (default RABBIT_ASK; null: nothing, the rabbit only pulses) */
  rabbitAsk?: string | null;
  lines?: Partial<SliderLines>;
  /** the ghost hand shows the slide once as the turn opens (default: when not a demo) */
  hint?: boolean;
  /** after three flicks in a session, Sensei says `rs_slowly` once */
  coachSpeed?: boolean;
  /** window.__snState while it waits for the child (default true) */
  publish?: boolean;
  /** the ninja listens during the slow way and cheers on the child's fast word (default true) */
  ninja?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

type View = {
  phase: Phase;
  lit: number[];
  merged: null | "whole" | "gag";
  gagPic: string | null;
  rabbit: "sleep" | "awake" | "glow" | "hop";
  pop: "" | "out" | "in";
  pulseDot: number;
  sweep: number;
  ghost: number;
  wiggle: number;
  rwig: number;
  back: boolean;
};
const plateOf = (w: string) => PLATE_COLOURS[(PIC_PLATES[w]?.plate ?? "sky") as keyof typeof PLATE_COLOURS];

// ---------------------------------------------------------------- Sensei's paw (demo mode)
// Her own red panda's paw, the drawing of src/ui/SenseiDemo.tsx PAW_SVG (four round toes, her red fur at the wrist,
// the green sleeve of her robe with its cream trim and a blossom), so a demo on the slider looks like every other demo
// of hers. A little smaller than her tapping paw (0.95, not 1.2) and leaning the other way: it pushes the tortoise from
// behind, its fingertip on the back of the shell, so the tortoise's head and shell stay in view. NOT the cream glove: the glove is the ghost hand, "your turn" (the judge, 27 Sep: the demo
// paw was the ghost hand's glove, and sat on the tortoise from mount). It is hidden until slideDemo(): then it comes out
// of her portrait (the Help button) and flies an arc to the tortoise, presses, slides it, and flies back home.
// (A copy: SenseiDemo.tsx doesn't export PAW_SVG; docs/fix-requests.md asks for it to be exported and shared.)
type Pt = { x: number; y: number };
const PAW_K = 0.95;
/** degrees: leaning up and to the right, the arm behind the tortoise (SenseiDemo's tapping paw leans −20°) */
const PAW_TILT = 8;
/** the paw's box (stage px) and its fingertip, the hotspot, in that box */
const PAW_W = 150 * PAW_K, PAW_H = 190 * PAW_K;
const PAW_HOT: Pt = { x: 75 * PAW_K, y: 14 * PAW_K };
/** where the fingertip rests: on the back of the tortoise's shell (from the handle's centre x and the rail's y) */
const PAW_TIP = { dx: -36, dy: -66 };
/** game ms: out of the portrait to the tortoise, back home, the press */
export const PAW_MS = { fly: 1050, home: 700, press: 450, hover: 300 } as const;
const SENSEI_PAW = (
  <svg viewBox="0 0 150 190" width={PAW_W} height={PAW_H} aria-hidden="true">
    <path d="M16 190 L28 126 Q75 106 122 126 L134 190 Z" fill="#6db34f" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
    <path d="M30 134 Q75 115 120 134" fill="none" stroke="#f6f1c9" strokeWidth="10" strokeLinecap="round" />
    <path d="M44 176 Q46 156 42 142" fill="none" stroke="#4f9235" strokeWidth="5" strokeLinecap="round" />
    <circle cx="100" cy="162" r="9" fill="#ff9ec0" stroke="#2b1d14" strokeWidth="3.5" />
    <circle cx="100" cy="162" r="3" fill="#fff4dc" />
    <path d="M42 128 C38 106 38 88 42 72 L108 72 C112 88 112 106 108 128 Q75 116 42 128 Z" fill="#d4652b" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
    <path d="M54 118 C51 104 51 92 54 82" fill="none" stroke="#f0a36c" strokeWidth="8" strokeLinecap="round" />
    <path d="M34 80 C27 54 38 30 56 22 C66 17 84 17 94 22 C112 30 123 54 116 80 C102 92 48 92 34 80 Z" fill="#3f2216" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
    <path d="M44 74 C39 58 44 44 54 36" fill="none" stroke="#8a5a3c" strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="46" cy="44" rx="12" ry="13" fill="#57301f" stroke="#2b1d14" strokeWidth="5" />
    <ellipse cx="65" cy="27" rx="13" ry="14" fill="#57301f" stroke="#2b1d14" strokeWidth="5" />
    <ellipse cx="86" cy="27" rx="13" ry="14" fill="#57301f" stroke="#2b1d14" strokeWidth="5" />
    <ellipse cx="104" cy="44" rx="12" ry="13" fill="#57301f" stroke="#2b1d14" strokeWidth="5" />
    <path d="M58 22 Q64 17 70 20 M79 20 Q85 17 91 22" fill="none" stroke="#9a6a4a" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);
/** The paw's path from a to b (as SenseiDemo's arcPath): rising, along at the start's height and then up into the
 *  target from underneath (so it never crosses the cards); falling, down out of the row first; level, bowed up by `lift`. */
export function pawArc(a: Pt, b: Pt, n = 16, lift?: number): Pt[] {
  const dx = b.x - a.x, dy = b.y - a.y;
  const h = lift ?? Math.max(60, Math.min(220, Math.hypot(dx, dy) * 0.32));
  const c = lift == null && dy < -80 ? { x: b.x - dx * 0.2, y: a.y } : lift == null && dy > 80 ? { x: a.x + dx * 0.2, y: b.y } : { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - h };
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n, u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
  });
}
const pawAt = (p: Pt) => `translate3d(${(p.x - PAW_HOT.x).toFixed(1)}px, ${(p.y - PAW_HOT.y).toFixed(1)}px, 0)`;

export function ReadSlider(p: ReadSliderProps) {
  const { items, mode, whole } = p;
  const geo = useRef<Geo>(null as unknown as Geo);
  if (!geo.current || geo.current.fire.length !== items.length) geo.current = geoFor(items.length, mode);
  const G = geo.current;
  const gapMs = mode === "sounds" ? SLOW_GAP_MS : WORD_GAP_MS;
  const core = useRef<SlideCore>(null as unknown as SlideCore);
  if (!core.current) core.current = new SlideCore(G, gapMs);
  const L = { ...SLIDER_LINES, ...p.lines };
  const P = useRef(p);
  P.current = p;
  const [v, setV] = useState<View>({ phase: p.demo ? "demo" : "idle", lit: [], merged: null, gagPic: null, rabbit: "sleep", pop: "", pulseDot: 0, sweep: 0, ghost: 0, wiggle: 0, rwig: 0, back: false });
  const V = useRef(v);
  V.current = v;
  const patch = (x: Partial<View>) => setV((o) => ({ ...o, ...x }));
  const alive = useRef(true);
  const timers = useRef(new Set<number>());
  const later = (ms: number, f: () => void) => {
    const t = window.setTimeout(() => (timers.current.delete(t), alive.current && f()), Math.max(0, ms));
    timers.current.add(t);
    return t;
  };
  const root = useRef<HTMLDivElement>(null);
  const handleEl = useRef<HTMLDivElement>(null);
  const trailEl = useRef<HTMLDivElement>(null);
  const elasticEl = useRef<HTMLDivElement>(null);
  const sweepEl = useRef<HTMLDivElement>(null);
  const ghostEl = useRef<HTMLDivElement>(null);
  const held = useHeld();
  const heldRef = useRef(held);
  heldRef.current = held;
  const stats = useRef({ t0: 0, flick: false, turnWrongs: 0 });
  const finger = useRef<{ id: number; x: number } | null>(null);
  const drawnH = useRef(G.start);
  const rafN = useRef(0);
  const backX = useRef<number | null>(null); // the backwards demo's own tortoise position
  const pawEl = useRef<HTMLDivElement>(null);
  const pressEl = useRef<HTMLDivElement>(null);
  /** the paw rides the tortoise (draw() places it); `pawPos` is where it was last put */
  const pawOn = useRef(false);
  const pawPos = useRef<Pt | null>(null);
  const pawTip = (h: number): Pt => ({ x: h + PAW_TIP.dx, y: G.railY + PAW_TIP.dy });

  // -------- drawing: the tortoise, the trail and the elastic band (straight to the DOM)
  const draw = () => {
    rafN.current = 0;
    const now = sliderEnv.now();
    const h = backX.current ?? core.current.handle(now);
    const el = handleEl.current;
    // a catch-up to the right glides; the tortoise never glides to the left (it pops home instead)
    const jump = h - drawnH.current > 24;
    const glide = jump ? `transform ${Math.round(240 / FAST)}ms cubic-bezier(.3,1.25,.5,1)` : "none";
    if (el) {
      el.style.transition = glide;
      el.style.transform = `translate3d(${(h - HANDLE_W / 2).toFixed(1)}px, 0, 0)`;
    }
    if (pawOn.current && pawEl.current) {
      pawPos.current = pawTip(h);
      pawEl.current.style.transition = glide;
      pawEl.current.style.transform = pawAt(pawPos.current);
    }
    drawnH.current = h;
    const span = G.end - G.start;
    if (trailEl.current) trailEl.current.style.transform = `scaleX(${Math.max(0, Math.min(1, (h - G.start) / span)).toFixed(4)})`;
    const f = finger.current;
    const e = elasticEl.current;
    if (e) {
      const stretch = f && core.current.down?.grabbed && backX.current == null ? Math.max(0, Math.min(G.end, f.x) - h - 30) : 0;
      e.style.opacity = stretch > 8 ? "1" : "0";
      e.style.transform = `translate3d(${(h + 30).toFixed(1)}px, 0, 0) scaleX(${Math.max(0.001, stretch).toFixed(1)})`;
    }
  };
  /** one requestAnimationFrame per frame while a finger is down; none when idle */
  const requestDraw = () => {
    if (rafN.current) return;
    rafN.current = requestAnimationFrame(draw);
  };
  useLayoutEffect(draw);

  // -------- the voice: a part at a time (the ratchet)
  const handle = (evs: SlideEvent[]) => {
    for (const e of evs) {
      if (e.kind === "fire") playPart(e.i);
      else if (e.kind === "slowDone") slowDone(e.flick);
      else if (e.kind === "wrong") wrongWay(e.why);
      else if (e.kind === "middle") middle(e.n);
      else if (e.kind === "tap") tapped(e.x, e.grabbed);
      else if (e.kind === "restart") restart();
      else if (e.kind === "grab") grab();
      else if (e.kind === "lift" && V.current.phase === "sliding") patch({ phase: "paused" });
      // taken and let go with nothing read (a tap on the tortoise): the turn is open again, and its idle ladder runs
      // (a tap on the first card, handled just before, may have begun the read: then it is a read left part-way)
      else if (e.kind === "drop" && V.current.phase === "sliding") patch({ phase: core.current.begun ? "paused" : "idle" });
    }
    draw();
  };
  const pumpAt = (t: number) => later((t - sliderEnv.now()) + 5, () => handle(core.current.pump(sliderEnv.now())));
  const playPart = (i: number) => {
    const it = P.current.items[i];
    // every part the child reads cuts Sensei off, as the rabbit's tap does: a word part would anyway (say() hushes), but a
    // sound slice plays beside her line (27 Sep, the sounds video: /m/ over "…say the sounds with me"; the judge: a paused
    // child resuming during "Keep going, all the way to the rabbit." put /o/ and /p/ over it). A part never fires while the
    // last one or its gap is playing (the ratchet), so what is speaking here is Sensei.
    if (!P.current.demo && sliderEnv.speaking()) sliderEnv.hush();
    if (!stats.current.t0) stats.current.t0 = sliderEnv.now();
    if (V.current.phase === "idle" || V.current.phase === "paused") patch({ phase: "sliding" });
    if (P.current.ninja !== false && ninja.mounted && i === 0) ninja.pose("listen");
    const light = () => {
      if (!alive.current) return;
      patch({ lit: [...V.current.lit.filter((k) => k !== i), i] });
      P.current.onPart?.(i);
      draw();
    };
    // the reading light comes on as the clip starts (the voice sets the pace, not the finger)
    if (it.kind === "word") void sliderEnv.clipStart(`word:${it.w}`).then(light);
    else light();
    void sliderEnv.part(it).then(() => {
      if (!alive.current) return;
      const t = sliderEnv.now();
      handle(core.current.clipDone(i, t));
      if (!core.current.over) pumpAt(core.current.freeAt);
    });
  };
  const grab = () => {
    if (V.current.phase === "idle" || V.current.phase === "paused") patch({ phase: "sliding", ghost: 0 });
  };
  const restart = () => {
    patch({ lit: [], phase: "sliding" });
    popHome(false);
  };

  // -------- the slow way is done → the fast way
  const slowDone = (flick: boolean) => {
    stats.current.flick = flick;
    if (flick && ++flicksInSession >= 3 && P.current.coachSpeed && !slowlySaid) {
      slowlySaid = true;
      later(200, () => void sliderEnv.say([{ line: L.slowly }]));
    }
    if (P.current.ninja !== false && ninja.mounted) ninja.pose(null);
    navLog({ kind: "speed", which: "slow", via: "slider" });
    const fast = P.current.fast ?? "rabbit";
    if (fast === "none") return finish("none");
    if (fast === "auto") return void later(600, () => void sayFast("auto"));
    // the rabbit wakes after a beat (the child's own go at the whole word), then asks
    later(700, () => {
      patch({ phase: "rabbit", rabbit: "awake" });
      const ask = P.current.rabbitAsk === undefined ? RABBIT_ASK : P.current.rabbitAsk;
      if (ask) void sliderEnv.say([{ line: ask }]);
    });
  };
  const bloom = () => {
    if (mode === "words") patch({ merged: "whole", gagPic: null });
    fx.burst(G.whole.x + G.whole.w / 2, G.whole.y + G.whole.h / 2, "stars", 14, 0.8);
  };
  /** The whole word: bloom as its clip starts. */
  const sayWhole = async (lead: Say[]) => {
    const start = sliderEnv.clipStart(`word:${whole}`, 8000);
    const said = sliderEnv.say([...lead, { word: whole }]);
    void start.then((c) => c && alive.current && bloom());
    await said;
  };
  const sayFast = async (how: "auto" | "timeout") => {
    if (!alive.current) return;
    patch({ phase: "fast", rabbit: V.current.rabbit === "sleep" ? "sleep" : "hop" });
    await sayWhole([{ line: L.autoFast }, { gap: 150 }]);
    finish(how);
  };
  const tapRabbit = () => {
    const ph = V.current.phase;
    if (ph !== "rabbit") {
      if (ph !== "fast" && ph !== "done") patch({ rwig: V.current.rwig + 1 });
      return;
    }
    navLog({ kind: "rabbit", how: "tap" });
    sliderEnv.hush(); // the child's answer cuts Sensei off
    sliderEnv.sfx("tap");
    patch({ phase: "fast", rabbit: "hop" });
    if (P.current.ninja !== false && ninja.mounted) void ninja.act("cheer", undefined, { react: false });
    void sayWhole([]).then(() => finish("tap"));
  };
  const finish = (how: SlideResult["how"]) => {
    if (!alive.current) return;
    patch({ phase: "done", rabbit: "sleep" });
    const t = sliderEnv.now();
    P.current.onDone?.({ how, wrongWays: core.current.wrongs, middles: core.current.middles, flick: stats.current.flick, ms: stats.current.t0 ? t - stats.current.t0 : 0 });
  };

  // -------- the wrong way
  const wrongWay = (why: "backwards" | "reversed") => {
    stats.current.turnWrongs++;
    P.current.onWrongWay?.(stats.current.turnWrongs);
    navLog({ kind: "tap", id: `slider:wrong:${why}` });
    patch({ phase: "wrong" });
    if (P.current.ninja !== false && ninja.mounted) void ninja.act("think", undefined, { react: false });
    const line = L.back[backTurn++ % L.back.length];
    // a clip still playing is never cut off: the correction waits for it
    const go = async () => {
      while (core.current.playing !== null && alive.current) await new Promise((r) => setTimeout(r, 60));
      if (!alive.current) return;
      patch({ lit: [] });
      void popHome(true);
      await sliderEnv.say([{ line }]);
      if (!alive.current) return;
      core.current.reset();
      patch({ phase: "idle", ghost: V.current.ghost + 1 });
      draw();
    };
    void go();
  };
  /** The tortoise pops home: out where it is, in on the start dot with a puff (never a walk to the left). `sweep`: the
   *  start dot pulses and a light sweeps the rail left to right. */
  const popHome = async (sweep: boolean) => {
    backX.current = drawnH.current; // (held where it is while it pops out)
    patch({ pop: "out" });
    await new Promise((r) => later(190, () => r(null)));
    backX.current = null;
    core.current.hw = G.start;
    drawnH.current = G.start;
    if (handleEl.current) {
      handleEl.current.style.transition = "none";
      handleEl.current.style.transform = `translate3d(${G.start - HANDLE_W / 2}px, 0, 0)`;
    }
    patch({ pop: "in", ...(sweep ? { pulseDot: V.current.pulseDot + 1, sweep: V.current.sweep + 1 } : {}) });
    fx.puff(G.start, G.railY - HANDLE_H / 2, 8);
    await new Promise((r) => later(340, () => r(null)));
    patch({ pop: "" });
    draw();
  };
  /** The tortoise tapped while the rabbit waits: the slow way again (the parts, lit in turn); the rabbit keeps waiting. */
  const again = useRef(false);
  const slowAgain = async () => {
    if (again.current) return;
    again.current = true;
    navLog({ kind: "rabbit", how: "slow" });
    patch({ lit: [], wiggle: V.current.wiggle + 1 });
    if (sliderEnv.speaking()) sliderEnv.hush(); // (the child's own go cuts off "…tap the rabbit, and say it fast")
    for (let i = 0; i < P.current.items.length && alive.current && V.current.phase === "rabbit"; i++) {
      patch({ lit: [...V.current.lit, i] });
      await sliderEnv.part(P.current.items[i]);
      await new Promise((r) => later(gapMs, () => r(null)));
    }
    again.current = false;
  };
  const middle = (n: number) => {
    patch({ wiggle: V.current.wiggle + 1, pulseDot: V.current.pulseDot + 1, ghost: V.current.ghost + 1 });
    if (n >= 2) void sliderEnv.say([{ line: L.startHere }]);
  };
  const tapped = (x: number, _grabbed: boolean) => {
    // a tap on a card in order counts as the tortoise reaching it (a child who can't drag yet); the first card is in the
    // start zone, so its tap has taken the tortoise too: only a tap on the tortoise itself is a tap on the tortoise
    const onTortoise = Math.abs(x - core.current.handle(sliderEnv.now())) <= HANDLE_W / 2 + 10;
    if (mode === "words" && !onTortoise) {
      const i = G.boxes.findIndex((b) => x >= b.x && x <= b.x + b.w);
      if (i >= 0) {
        const evs = core.current.tapPart(i, sliderEnv.now());
        if (evs.length) return handle(evs);
        return patch({ pulseDot: V.current.pulseDot + 1 });
      }
    }
    // a tap on the tortoise: it bounces, the arrow pulses, and the ghost hand shows the slide
    patch({ wiggle: V.current.wiggle + 1, pulseDot: V.current.pulseDot + 1, ghost: V.current.ghost + 1 });
  };

  // -------- the finger (pointer events on the touch band; only the first finger; only x matters)
  const stageX = (clientX: number) => {
    const r = root.current!.getBoundingClientRect();
    return ((clientX - r.left) * W) / r.width;
  };
  const inputOff = () => heldRef.current || !!P.current.demo || !["idle", "paused", "sliding"].includes(V.current.phase) || isUpright();
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    const x = stageX(e.clientX);
    if (finger.current) {
      // only the first finger counts, but a palm resting on the cards (down first, holding nothing) gives way to the
      // finger that takes the tortoise (the judge's palm-first run: nothing was read, and nothing said why)
      const d = core.current.down;
      if (!d || d.grabbed || d.middle || d.wrong || inputOff() || !core.current.wouldGrab(x, sliderEnv.now())) return;
      core.current.cancelDown();
      finger.current = null;
    }
    e.preventDefault();
    if (V.current.phase === "rabbit" && !heldRef.current && Math.abs(x - core.current.handle(sliderEnv.now())) <= CARRY_PX) return void slowAgain();
    if (inputOff()) {
      if (P.current.demo || V.current.phase === "demo") patch({ wiggle: V.current.wiggle + 1 });
      return;
    }
    finger.current = { id: e.pointerId, x };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    handle(core.current.pointerDown(x, sliderEnv.now()));
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const f = finger.current;
    if (!f || f.id !== e.pointerId) return;
    f.x = stageX(e.clientX);
    const evs = core.current.pointerMove(f.x, sliderEnv.now());
    if (evs.length) handle(evs);
    else requestDraw();
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const f = finger.current;
    if (!f || f.id !== e.pointerId) return;
    finger.current = null;
    handle(core.current.pointerUp(stageX(e.clientX), sliderEnv.now()));
  };

  // -------- Sensei's paw (demo mode)
  const wait = (ms: number) => new Promise((r) => later(ms, () => r(null)));
  /** Sensei's portrait (the Help button), in stage px */
  const portrait = (): Pt => {
    const el = typeof document !== "undefined" ? document.querySelector(".help-btn") : null;
    const r = root.current?.getBoundingClientRect();
    if (el && r && r.width > 0) {
      const b = el.getBoundingClientRect();
      const k = W / r.width;
      return { x: (b.left + b.width / 2 - r.left) * k, y: (b.top + b.height / 2 - r.top) * k };
    }
    return { x: 1204, y: 644 };
  };
  const flights = useRef(0);
  /** The paw along an arc (Web Animations, transform and opacity only), in game ms. */
  const flyPaw = async (from: Pt, to: Pt, ms: number, o: { fadeIn?: boolean; fadeOut?: boolean; lift?: number } = {}) => {
    const el = pawEl.current;
    if (!el) return;
    flights.current++;
    const pts = pawArc(from, to, 16, o.lift);
    el.style.display = "block";
    el.style.transition = "none";
    el.style.transform = pawAt(to);
    el.style.opacity = o.fadeOut ? "0" : "1";
    pawPos.current = to;
    const last = pts.length - 1;
    const frames = pts.map((p, k) => ({ transform: pawAt(p), opacity: o.fadeIn ? Math.min(1, k / 3) : o.fadeOut ? Math.min(1, (last - k) / 4) : 1, offset: k / last }));
    try {
      await el.animate(frames, { duration: ms / FAST, easing: "cubic-bezier(0.45, 0.05, 0.3, 1)" }).finished;
    } catch {}
  };
  /** Out of her portrait and onto the tortoise, where it stays (riding it) until pawHome(). */
  const pawOut = async () => {
    if (pawOn.current) return;
    await flyPaw(pawPos.current && pawEl.current?.style.display === "block" ? pawPos.current : portrait(), pawTip(drawnH.current), PAW_MS.fly, { fadeIn: true });
    if (!alive.current) return;
    pawOn.current = true;
    draw();
  };
  /** The press: down onto the shell and up (the effect, the slide, follows). */
  const pawPress = async () => {
    try {
      await pressEl.current?.animate([{ transform: "none" }, { transform: "translateY(12px) scale(0.95, 0.92)", offset: 0.4 }, { transform: "none" }], { duration: PAW_MS.press / FAST, easing: "ease-in-out" }).finished;
    } catch {}
  };
  const homing = useRef(false);
  /** Off the tortoise and back into her portrait, then hidden. */
  const pawHome = async (from?: Pt) => {
    if (homing.current || (!pawOn.current && !from)) return;
    homing.current = true;
    pawOn.current = false;
    const at = from ?? pawPos.current ?? pawTip(drawnH.current);
    const flight = flyPaw(at, portrait(), PAW_MS.home, { fadeOut: true });
    const mine = flights.current;
    await flight;
    // (hidden unless a newer flight has started meanwhile)
    if (pawEl.current && !pawOn.current && mine === flights.current) pawEl.current.style.display = "none";
    homing.current = false;
  };
  /** Sensei's lead-in ends, and a moment passes: the paw never presses while she is still talking. */
  const quiet = async (ms: number) => {
    for (let k = 0; k < 250 && alive.current && sliderEnv.speaking(); k++) await wait(60);
    await wait(ms);
  };
  const demo = async (o: DemoOpts): Promise<boolean> => {
    const pace = o.pace ?? 170;
    const step = 40; // ms between moves (setTimeout, game time: no rAF)
    if (!o.backwards) {
      core.current.reset();
      patch({ phase: "demo", lit: [], merged: null });
      // "Watch my paw...": it comes out of her portrait as she says it, and lands on the tortoise; once she has finished,
      // it waits a moment, then presses (450 ms), then slides
      await pawOut();
      if (!alive.current) return false;
      await quiet(PAW_MS.hover);
      if (!alive.current) return false;
      await pawPress();
      if (!alive.current) return false;
      let x = G.start;
      handle(core.current.pointerDown(x, sliderEnv.now()));
      finger.current = { id: -1, x };
      while (alive.current && !core.current.over && x < G.end) {
        await wait(step);
        x = Math.min(G.end, x + (pace * step) / 1000);
        finger.current = { id: -1, x };
        handle(core.current.pointerMove(x, sliderEnv.now()));
      }
      // the paw stays on the tortoise at the end until the last part has been said, then goes home
      while (alive.current && !core.current.over) await wait(80);
      finger.current = null;
      handle(core.current.pointerUp(x, sliderEnv.now()));
      void pawHome();
      return alive.current;
    }
    // the backwards gag: the cards come apart again, the paw comes out onto the tortoise (at the right-hand end after
    // her slow read, or it hops there), and walks it back, a little quicker than the slow read (it is a show, not a
    // reading pace); the picture flips as soon as the last part is said (27 Sep: the show ran 16.3 s from the rabbit tap
    // to the Ready; PICTURE_READING §3.2). The paw stays on the tortoise until home(), which ends the show the right way.
    patch({ phase: "back", merged: null, lit: [], back: true });
    backX.current = G.end;
    draw();
    await pawOut();
    if (!alive.current) return false;
    await quiet(250);
    const order = [...G.fireBack.keys()].reverse();
    const backPace = pace * 1.3;
    let x = G.end;
    for (const i of order) {
      while (alive.current && x > G.fireBack[i]) {
        await wait(step);
        x = Math.max(G.start, x - (backPace * step) / 1000);
        backX.current = x;
        draw();
      }
      if (!alive.current) return false;
      patch({ lit: [...V.current.lit, i] });
      P.current.onPart?.(i);
      await sliderEnv.part(P.current.items[i]);
      await wait(gapMs);
    }
    if (o.gag) patch({ merged: "gag", gagPic: o.gag, lit: [] });
    // the show is over: the slider holds its finished state (not `back`, which reads as busy to bots and holds)
    patch({ back: false, phase: "done" });
    // (a scene that never calls home(): the paw goes home by itself)
    later(6000, () => void (pawOn.current && pawHome()));
    return alive.current;
  };
  const home = async (o: { whole?: boolean }) => {
    if (o.whole && V.current.merged === "gag") patch({ merged: "whole", gagPic: null });
    if (V.current.phase === "back" || V.current.phase === "demo") patch({ phase: "done" });
    // after her backwards show the last thing she shows is the right way: as the tortoise pops home, her paw hops to the
    // start dot and rides the rail's light from left to right, then goes home (the judge, 27 Sep: the right-to-left walk
    // was the last movement before the child's first turn)
    const paw = pawOn.current ? (pawPos.current ?? pawTip(drawnH.current)) : null;
    if (paw) {
      pawOn.current = false;
      homing.current = true;
      void (async () => {
        const y = G.railY - 30;
        await flyPaw(paw, { x: G.start, y }, 190, { lift: 50 });
        await flyPaw({ x: G.start, y }, { x: G.end - 10, y }, 900, { lift: 0 });
        homing.current = false;
        await pawHome({ x: G.end - 10, y });
      })();
    }
    await popHome(true);
    // (a finished read stays finished: the tortoise is only home)
    core.current.reset();
    core.current.over = true;
    draw();
  };
  /** "Ninjas always read this way.": the start dot and the arrow pulse, and the light runs the rail left to right. */
  const cue = () => patch({ pulseDot: V.current.pulseDot + 1, sweep: V.current.sweep + 1 });

  // -------- the controller, the bot contract, help, the nav badges
  const ctlState = (): SliderState => {
    const ph = V.current.phase;
    const c = core.current;
    const now = sliderEnv.now();
    const next = P.current.demo || heldRef.current ? (ph === "rabbit" ? "rabbit" : null) : ph === "idle" || ph === "paused" || ph === "sliding" ? "drag" : ph === "rabbit" ? "rabbit" : null;
    return {
      scene: "slider", id: P.current.id ?? whole, mode, phase: ph, next,
      from: { x: Math.round(c.handle(now)), y: G.railY - HANDLE_H / 2 }, to: { x: G.end, y: G.railY - HANDLE_H / 2 },
      rabbit: { x: G.rabbit.x, y: G.rabbit.y }, fired: c.fired, n: c.n, lit: V.current.lit, wrongWays: c.wrongs, demo: !!P.current.demo,
      busy: ph === "wrong" || ph === "fast" || ph === "demo" || ph === "back" || isSpeaking(),
    };
  };
  const drag = async (o: { from?: number; to?: number; ms?: number }) => {
    const from = o.from ?? G.start, to = o.to ?? G.end, ms = o.ms ?? 1600;
    if (inputOff()) return;
    const t0 = sliderEnv.now();
    finger.current = { id: -2, x: from };
    handle(core.current.pointerDown(from, t0));
    const n = Math.max(2, Math.round(ms / 32));
    for (let k = 1; k <= n && alive.current; k++) {
      await new Promise((r) => later(ms / n, () => r(null)));
      const x = from + ((to - from) * k) / n;
      finger.current = { id: -2, x };
      handle(core.current.pointerMove(x, sliderEnv.now()));
    }
    finger.current = null;
    handle(core.current.pointerUp(to, sliderEnv.now()));
  };
  useEffect(() => {
    alive.current = true;
    const ctl: Ctl = { demo, cue, home, gag: (pic) => patch({ merged: pic ? "gag" : "whole", gagPic: pic }), drag, tapRabbit, state: ctlState };
    active = ctl;
    // every clip the slider says, ready before the child's finger gets there
    const us = [...items.map((it) => (it.kind === "word" ? urls.word(it.w) : it.word ? urls.stretch(it.word) : urls.sound(it.p))), urls.word(whole)];
    void preload(us);
    return () => {
      alive.current = false;
      if (active === ctl) active = null;
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
      if (rafN.current) cancelAnimationFrame(rafN.current);
      if (P.current.ninja !== false && ninja.mounted) ninja.pose(null);
    };
  }, []);
  useEffect(() => {
    if (p.demo && V.current.phase === "idle") patch({ phase: "demo" });
    if (!p.demo && V.current.phase === "demo" && !core.current.begun) patch({ phase: "idle" });
  }, [p.demo]);
  // __snState is written as the slider renders: render again whenever Sensei starts or stops, so `busy` is never stale
  const [, setTalk] = useState(0);
  useEffect(() => onSpeaking(() => setTalk((n) => n + 1)), []);
  // the slider draws its own tortoise and rabbit: the nav layer's small badges hide (TEACHER_SCRIPT §9.6)
  useNav({ speed: { own: true } });
  useHelp((n) => {
    if (V.current.phase === "idle" || V.current.phase === "paused") {
      patch({ ghost: V.current.ghost + 1, pulseDot: V.current.pulseDot + 1 });
      if (n === 1) void sliderEnv.say([{ line: L.how }]);
    } else if (V.current.phase === "rabbit") patch({ rabbit: "glow" });
  });
  if (p.publish !== false) (window as any).__snState = ctlState();

  // -------- the idle ladders (game time; quiet only: nobody speaking, no hold, the phone sideways; any touch resets)
  useQuiet(v.phase === "idle" && !p.demo && !held, [8000, 16000], (k) => {
    if (k === 0) patch({ ghost: V.current.ghost + 1 });
    else void sliderEnv.say([{ line: L.idle }]);
  });
  useQuiet(v.phase === "paused" && !held, [5000, 10000, 22000], (k) => {
    if (k === 0) patch({ ghost: V.current.ghost + 1 });
    else if (k === 1) void sliderEnv.say([{ line: L.keepGoing }]);
    else {
      // the read that stopped part-way starts again from the start (the tortoise pops home)
      core.current.reset();
      patch({ lit: [], phase: "idle" });
      void popHome(true).then(() => sliderEnv.say([{ line: L.again }]));
    }
  });
  useQuiet(v.phase === "rabbit" && !held, [8000, 12000], (k) => {
    if (k === 0) patch({ rabbit: "glow" });
    else {
      navLog({ kind: "rabbit", how: "timeout" });
      void sayFast("timeout");
    }
  });
  // the ghost hand on each `ghost` bump; the rail's light on each `sweep` (Web Animations: transform only)
  useEffect(() => {
    if (!v.ghost || !ghostEl.current) return;
    const from = core.current.handle(sliderEnv.now());
    const el = ghostEl.current;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(
      [
        { transform: `translate3d(${from - 20}px, 0, 0) scale(1)`, opacity: 0 },
        { transform: `translate3d(${from - 20}px, 0, 0) scale(.9)`, opacity: 1, offset: 0.12 },
        { transform: `translate3d(${G.end - 40}px, 0, 0) scale(.9)`, opacity: 1, offset: 0.82 },
        { transform: `translate3d(${G.end - 40}px, 0, 0) scale(1)`, opacity: 0 },
      ],
      { duration: 2000 / FAST, iterations: 1, easing: "ease-in-out" },
    );
  }, [v.ghost]);
  useEffect(() => {
    if (!v.sweep || !sweepEl.current) return;
    sweepEl.current.animate([{ transform: "translate3d(0, 0, 0)", opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { transform: `translate3d(${G.end - G.start}px, 0, 0)`, opacity: 0 }], { duration: 900 / FAST, easing: "ease-in-out" });
  }, [v.sweep]);
  useEffect(() => {
    if (p.hint ?? !p.demo) later(900, () => V.current.phase === "idle" && patch({ ghost: V.current.ghost + 1 }));
  }, []);

  // -------- render
  const ph = v.phase;
  const waitingForChild = ph === "idle" && !p.demo && !held;
  const cardStyle = (b: Box, w: string): CSSProperties => ({ left: b.x, top: b.y, width: b.w, height: b.h, "--plate": plateOf(w) } as CSSProperties);
  const merged = v.merged;
  const wholePic = merged === "gag" && v.gagPic ? v.gagPic : whole;
  const cx = G.whole.x + G.whole.w / 2;
  return (
    <div ref={root} className={`rs ${p.className ?? ""}`} data-mode={mode} data-phase={ph} style={p.style}>
      {mode === "words" &&
        items.map((it, i) => {
          if (it.kind !== "word") return null;
          const b = G.boxes[i];
          const lit = v.lit.includes(i);
          return (
            <div key={`${it.w}-${i}`} className={`rs-card ${lit ? "lit" : ""} ${merged ? "merge" : ""}`} data-pic={it.pic ?? it.w} aria-label={it.w} style={{ ...cardStyle(b, it.pic ?? it.w), "--to": `${(cx - (b.x + b.w / 2)).toFixed(0)}px` } as CSSProperties}>
              <span className="rs-plate">
                <img src={img(`pic_${it.pic ?? it.w}`)} alt="" draggable={false} />
              </span>
              <span className="rs-light" aria-hidden="true" />
            </div>
          );
        })}
      {mode === "words" && merged && (
        <div key={`${merged}-${wholePic}`} className={`rs-card rs-whole ${merged}`} data-pic={wholePic} aria-label={wholePic} style={cardStyle(G.whole, wholePic)}>
          <span className="rs-plate">
            <img src={img(`pic_${wholePic}`)} alt="" draggable={false} />
          </span>
        </div>
      )}
      {mode === "sounds" && G.pic && (
        <div className={`rs-card rs-pic ${ph === "fast" || ph === "done" ? "hop" : ""}`} data-pic={p.pic ?? whole} aria-label={p.pic ?? whole} style={cardStyle(G.pic, p.pic ?? whole)}>
          <span className="rs-plate">
            <img src={img(`pic_${p.pic ?? whole}`)} alt="" draggable={false} />
          </span>
        </div>
      )}
      <div className="rs-rail" style={{ left: G.start, top: G.railY - 12, width: G.end - G.start }}>
        <div className="rs-bar" />
        <div className="rs-trail" ref={trailEl} />
        <div className="rs-chevrons" aria-hidden="true" />
        <svg className={`rs-arrow ${v.pulseDot ? "pulse" : ""}`} key={`a${v.pulseDot}`} viewBox="0 0 60 60" aria-hidden="true">
          <path d="M8 12 L52 30 L8 48 L18 30 Z" />
        </svg>
        <div className="rs-sweep" ref={sweepEl} aria-hidden="true" />
      </div>
      <div className={`rs-dot ${waitingForChild ? "wait" : ""} ${v.pulseDot ? "pulse" : ""}`} key={`d${v.pulseDot}`} style={{ left: G.start - 34, top: G.railY - 34 }} aria-hidden="true" />
      {mode === "sounds" &&
        items.map((it, i) => (
          <div key={`s${i}`} className={`rs-sdot ${v.lit.includes(i) ? "lit" : ""} ${ph === "fast" || ph === "done" ? "together" : ""}`} data-sound={it.kind === "sound" ? it.p : ""} aria-label={`sound ${i + 1}`} style={{ left: G.boxes[i].x, top: G.boxes[i].y, width: G.boxes[i].w, height: G.boxes[i].h, "--to": `${(cx - (G.boxes[i].x + G.boxes[i].w / 2)) * 0.6}px` } as CSSProperties} />
        ))}
      <div className="rs-elastic" ref={elasticEl} style={{ top: G.railY - 4 }} aria-hidden="true" />
      <div ref={handleEl} className={`rs-handle ${waitingForChild ? "wait" : ""} ${v.pop ? `rs-pop-${v.pop}` : ""} ${v.back ? "back" : ""}`} style={{ top: G.railY - HANDLE_H + 10, width: HANDLE_W, height: HANDLE_H }} data-slider="tortoise" aria-label="The tortoise">
        <span className="rs-pop">
          <span className="rs-halo" aria-hidden="true" />
          <span className={`rs-wig ${v.wiggle ? "go" : ""}`} key={`w${v.wiggle}`}>
            <img src={img("ui_tortoise")} alt="" draggable={false} />
          </span>
        </span>
      </div>
      <div
        className="rs-band"
        data-slider="band"
        style={{ left: G.band.x, top: G.band.y, width: G.band.w, height: G.band.h }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(e) => e.preventDefault()}
      />
      <button
        type="button"
        className={`rs-rabbit ${v.rabbit} ${v.rwig ? `wig${v.rwig % 2}` : ""}`}
        data-slider="rabbit"
        aria-label="The rabbit"
        style={{ left: G.rabbit.x - G.rabbit.d / 2, top: G.rabbit.y - G.rabbit.d / 2, width: G.rabbit.d, height: G.rabbit.d }}
        onPointerDown={(e) => (e.preventDefault(), tapRabbit())}
      >
        <span className="rs-rabbit-ring" aria-hidden="true" />
        <img src={img("ui_rabbit")} alt="" draggable={false} />
      </button>
      <div className="rs-spaw" ref={pawEl} style={{ width: PAW_W, height: PAW_H }} data-slider="paw" aria-hidden="true">
        <div className="rs-spaw-press" ref={pressEl} style={{ transformOrigin: `${PAW_HOT.x}px ${PAW_HOT.y}px` }}>
          <div className="rs-spaw-in" style={{ transformOrigin: `${PAW_HOT.x}px ${PAW_HOT.y}px`, transform: `rotate(${PAW_TILT}deg)` }}>
            {SENSEI_PAW}
          </div>
        </div>
      </div>
      <div className="rs-ghost" ref={ghostEl} style={{ top: G.railY - 40 }} aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <path d="M26 30V12a5 5 0 0 1 10 0v16l3-1a5 5 0 0 1 6 3l1 1a5 5 0 0 1 6 4v8c0 9-6 16-15 16h-3c-6 0-10-3-13-8l-7-11a4 4 0 0 1 6-5l6 6z" />
        </svg>
      </div>
    </div>
  );
}

/** A quiet-time ladder in game time (as nav.tsx's): `fire(k)` once steps[k] ms of quiet have passed while `active`.
 *  Quiet: nobody speaking, the phone not upright; any pointerdown starts it again. No polling: one timeout sleeps
 *  until the next step, and speech or the phone turning upright pause the count. */
function useQuiet(active: boolean, steps: readonly number[], fire: (k: number) => void) {
  const f = useRef(fire);
  f.current = fire;
  useEffect(() => {
    if (!active) return;
    let idle = 0, from = 0, step = 0, t = 0, alive = true;
    const sync = () => {
      if (!alive) return;
      if (from) idle += (performance.now() - from) * FAST;
      from = 0;
      clearTimeout(t);
      while (step < steps.length && idle >= steps[step] - 5) f.current(step++);
      if (step < steps.length && !isUpright() && !sliderEnv.speaking()) {
        from = performance.now();
        t = window.setTimeout(sync, steps[step] - idle);
      }
    };
    const reset = () => {
      idle = 0;
      from = 0;
      step = 0;
      sync();
    };
    const offS = onSpeaking(sync);
    const offU = onUpright(sync);
    window.addEventListener("pointerdown", reset, true);
    sync();
    return () => {
      alive = false;
      clearTimeout(t);
      offS();
      offU();
      window.removeEventListener("pointerdown", reset, true);
    };
  }, [active]);
}
