// Navigation (docs/NAVIGATION.md): Home on every screen, nothing a child can miss (Hear it again, Show me again, Back),
// and nothing that moves on by itself (a finished step holds on a big green Next arrow until the child taps it).
//
// One NavLayer (rendered once by App, next to <HelpButton/>) draws Home top-left and the nav row along the bottom:
//   [◀ Back]  [paw Show me again]  [speaker Hear it again]  [petal Sound picture]        [▶ Next]
// Screens say what those do with useNav() (a stack: a dialog or a hold sits over its screen), or use the pieces below
// directly. usePresentation() runs a show as held steps; holdNext() holds a scripted scene at one step.
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { say, hush, onSay, onSpeaking, isSpeaking, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { pauseLessonClock, resumeLessonClock } from "../engine/lessonClock";
import { isRegisterable } from "../content/instructions";
import type { PhonemeId } from "../content/phonics";
import { Icon, RoundButton, TapHint, useHelp, pushHelp, isUpright, onUpright, tapProps } from "./ui";
import { ninja } from "./Ninja";
import { SoundBadge, badgeHeight } from "./SoundBadge";
import "../styles/nav.css";

// ---------------------------------------------------------------- types
/** Where Hear it again (and the sound picture) sit: the nav row (default); a story's right-hand `column` (Back and Next
 *  move there too); the `top-right` corner (the World Flower, the Sticker Book, Sorting); the map's `side` column; or
 *  `own`: the scene draws its own speaker (marked data-nav="again", e.g. beside a word card) and its own SoundBadge. */
export type Anchor = "row" | "column" | "top-right" | "side" | "own";
export type NavKind = "home" | "back" | "again" | "show" | "sound" | "next";
/**
 * What the nav controls do on this screen. For every field, `undefined` inherits from the entry below it on the stack
 * (e.g. a scene's `home` under its presentation's steps) and `null` hides the control. A `modal` entry (a dialog, a
 * hold) hides everything below it except Home.
 */
export interface NavSpec {
  /** Where Home goes (default: NavLayer's `home`, App's route rule); null: no Home (the title, which is home). */
  home?: (() => void) | null;
  back?: (() => void) | null;
  /** Hear it again. "told": the screen's told() bundle, else the last instruction said (drawn only once there is one). */
  again?: (() => unknown) | "told" | null;
  againAt?: Anchor;
  /** Hear it again pulses with the pointing hand (the Dojo welcome's speaker step). */
  againHint?: boolean;
  /** Show me again (the paw): replays the demo that led into this turn. It must never count as the child's answer. */
  show?: (() => unknown) | null;
  /** The sound picture beside Hear it again (docs/NAVIGATION.md §4). */
  sound?: PhonemeId | null;
  /** The green arrow: dim (a tap wiggles it) until `ready`, then pulsing, with the idle nudge. */
  next?: { go: () => void; ready: boolean } | null;
  /** This is a step of a show (bots and the sweep read it): usePresentation and holdNext set it. */
  pres?: { id: string; step: number; of: number } | null;
  /** A dialog or a hold: nothing below shows through except Home. */
  modal?: boolean;
}

// ---------------------------------------------------------------- the stack
type Entry = { seq: number; spec: { current: NavSpec } };
const stack: Entry[] = [];
let seqN = 0;
let version = 0;
const subs = new Set<() => void>();
const bump = () => {
  version++;
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => void subs.delete(f);
};
function addEntry(e: Entry) {
  stack.push(e);
  stack.sort((a, b) => a.seq - b.seq); // render order: a screen before the dialogs it opens, and holds on top
  bump();
}
function removeEntry(e: Entry) {
  const i = stack.indexOf(e);
  if (i >= 0) stack.splice(i, 1);
  bump();
}
const sigOf = (s: NavSpec) => {
  const f = (v: unknown) => (v === undefined ? "u" : v === null ? "n" : typeof v === "function" ? "f" : String(v));
  return [f(s.home), f(s.back), f(s.again), s.againAt ?? "", s.againHint ? 1 : 0, f(s.show), f(s.sound), s.next === undefined ? "u" : s.next === null ? "n" : s.next.ready ? "r" : "w", s.pres ? `${s.pres.id}#${s.pres.step}/${s.pres.of}` : f(s.pres), s.modal ? 1 : 0].join("|");
};

/**
 * Register this screen's nav controls. Always current: handlers are read when tapped, so no deps are needed. The newest
 * mounted component is on top (a dialog over its screen); a component's entry is under its children's.
 */
export function useNav(spec: NavSpec): void {
  const ref = useRef(spec);
  ref.current = spec;
  const [seq] = useState(() => ++seqN);
  useEffect(() => {
    const e = { seq, spec: ref };
    addEntry(e);
    return () => removeEntry(e);
  }, []);
  const sig = sigOf(spec);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) return void (first.current = false);
    bump();
  }, [sig]);
}
/** One line for a screen that only needs to say where Home goes (`null`: no Home). */
export const useHome = (go: (() => void) | null) => useNav({ home: go });

/** What the layer draws: each control's provider entry, read live when tapped. */
function resolve() {
  let home: Entry | undefined, back: Entry | undefined, again: Entry | undefined, show: Entry | undefined, sound: Entry | undefined, next: Entry | undefined;
  let sealed = false;
  for (let k = stack.length - 1; k >= 0; k--) {
    const e = stack[k], s = e.spec.current;
    if (!home && s.home !== undefined) home = e;
    if (sealed) continue;
    if (!back && s.back !== undefined) back = e;
    if (!again && s.again !== undefined) again = e;
    if (!show && s.show !== undefined) show = e;
    if (!sound && s.sound !== undefined) sound = e;
    if (!next && s.next !== undefined) next = e;
    if (s.modal) sealed = true;
  }
  return { home, back, again, show, sound, next };
}

// ---------------------------------------------------------------- Hear it again: the screen's register
// told() says a line and adds it to the screen's bundle (a turn's question, the explanation that came with it, the
// game's introduction on its first turn). Besides that, every say() with an instruction in it (content/instructions.ts:
// not praise, streak lines, corrections, nav_ready or Help's clues) becomes the "last instruction". Hear it again with
// again: "told" replays the bundle, or else the last instruction. Both are cleared when the screen changes (NavLayer's
// `scene`) and by clearTold() (a new turn).
let bundle: Say[] = [];
let lastSaid: Say[] | null = null;
onSay((list) => {
  if (list === bundle || list === lastSaid) return; // a replay
  if (!list.some((it) => "line" in it && isRegisterable(it.line))) return;
  const had = !!lastSaid || bundle.length > 0;
  lastSaid = list;
  if (!had) bump();
});
/** Say something the child needs and add it to this screen's Hear it again bundle (`fresh`: start a new bundle, e.g. at
 *  a new question). Resolves as say() does. */
export function told(items: Say | Say[], o: { fresh?: boolean; keep?: boolean; reveal?: boolean; protect?: boolean } = {}): Promise<boolean> {
  const list = Array.isArray(items) ? items : [items];
  const had = bundle.length > 0 || !!lastSaid;
  bundle = o.fresh || !bundle.length ? [...list] : [...bundle, { gap: 300 }, ...list];
  if (!had) bump();
  return say(list, { keep: o.keep, reveal: o.reveal, protect: o.protect });
}
/** Forget the bundle and the last instruction (a new turn whose question hasn't been asked yet). */
export function clearTold() {
  const had = bundle.length > 0 || !!lastSaid;
  bundle = [];
  lastSaid = null;
  if (had) bump();
}
/** Is there anything for Hear it again (again: "told") to replay? */
export const hasTold = () => bundle.length > 0 || !!lastSaid;
/** What Hear it again (again: "told") would say now. */
export const toldNow = (): readonly Say[] => (bundle.length ? bundle : lastSaid ?? []);
/** Say the bundle again (or the last instruction). */
export function replayTold(): Promise<boolean> {
  const b = bundle.length ? bundle : lastSaid;
  return b ? say(b) : Promise.resolve(false);
}

// ---------------------------------------------------------------- the log bots and the sweep read
/** `via`: what moved a step that isn't a nav show's own (a story page: "next", "back", "read" for I read it!, "pick" for
 *  a choice, "answer" for a question). */
type NavLogEntry = { kind: "tap" | "step" | "replay"; nav?: NavKind; id?: string; from?: number | null; to?: number | null; via?: string };
/** How many entries `window.__snNavLog` keeps (the newest). */
export const NAV_LOG_MAX = 500;
/** `window.__snNavLog`: every nav tap and step change, with performance.now() times (the last NAV_LOG_MAX). */
export function navLog(e: NavLogEntry) {
  const w = window as any;
  const log: unknown[] = (w.__snNavLog ??= []);
  log.push({ t: performance.now(), ...e });
  if (log.length > NAV_LOG_MAX) log.splice(0, log.length - NAV_LOG_MAX);
}

/** Run a replay (Hear it again, Show me again) with lesson clocks stopped until it has been said. */
function whilePaused(fn: () => unknown) {
  pauseLessonClock();
  let done = false;
  const resume = () => void (!done && ((done = true), resumeLessonClock()));
  let r: unknown;
  try {
    r = fn();
  } catch (e) {
    resume();
    throw e;
  }
  if (r && typeof (r as Promise<unknown>).then === "function") void (r as Promise<unknown>).then(resume, resume);
  else {
    // not a promise: until the speech it started has ended (at most 30 s)
    const t0 = performance.now();
    const poll = () => (performance.now() - t0 > 30_000 || !isSpeaking() ? resume() : void setTimeout(poll, 200));
    setTimeout(poll, 400);
  }
}

// ---------------------------------------------------------------- the controls
/** The smallest round nav control (Home, Back, a corner or word-card speaker), in stage px: 100 is still 45 px on the
 *  smallest phones we allow for (a 360-dp-tall Android phone held landscape: stage scale 0.45), above the 44 px rule. */
export const NAV_MIN = 100;
/** Stage positions (1280×720) of the nav controls: centres and sizes. Scenes may put their own buttons in unused slots
 *  (a reward: Play again in `row.back`). */
export const NAV_SLOTS = {
  home: { x: 68, y: 66, d: NAV_MIN },
  row: { back: { x: 404, y: 646, d: NAV_MIN }, show: { x: 595, y: 646, d: 100 }, again: { x: 725, y: 636, d: 116 }, sound: { x: 855, y: 630, d: 100 }, next: { x: 1030, y: 628, d: 132 } },
  column: { back: { x: 1204, y: 196, d: NAV_MIN }, again: { x: 1204, y: 322, d: 116 }, next: { x: 1204, y: 474, d: 132 } },
  "top-right": { again: { x: 1212, y: 66, d: NAV_MIN }, sound: { x: 1120, y: 58, d: 64 } },
  side: { again: { x: 1212, y: 504, d: NAV_MIN }, sound: { x: 1112, y: 504, d: 72 } },
} as const;
type Slot = { x: number; y: number; d: number };
/** Absolute CSS for a control of width `w` (and height `h`) centred on a slot. */
export const slotStyle = (s: Slot, w = s.d, h = w): CSSProperties => ({ position: "absolute", left: s.x - w / 2, top: s.y - h / 2, width: w, height: h });

/** Home: the house, gold, top-left (the Home zone, x 0–130, y 0–130), always on top. */
export function HomeButton({ onHome, style, className = "" }: { onHome: () => void; style?: CSSProperties; className?: string }) {
  return (
    <RoundButton nav="home" label="Home" className={`nav-home ${className}`} style={style} onClick={() => (navLog({ kind: "tap", nav: "home" }), onHome())}>
      <Icon.home />
    </RoundButton>
  );
}
/** ◀ Back: the previous step, played again from its start. */
export function BackButton({ onBack, style, className = "" }: { onBack: () => void; style?: CSSProperties; className?: string }) {
  return (
    <RoundButton nav="back" label="Back" className={`nav-back ${className}`} style={style} onClick={() => (navLog({ kind: "tap", nav: "back" }), onBack())}>
      <Icon.back />
    </RoundButton>
  );
}
/** The speaker, "Hear it again": replays what the child needs (default: the told() bundle, else the last instruction).
 *  Lesson clocks stop while it plays. `hint`: pulses, with the pointing hand. A scene's own speaker (not the nav
 *  layer's, `layer`) steps aside while a holdNext() hold is up, keeping its place: the hold's Hear it again is the one
 *  that means something then. */
export function ReplayButton({ onReplay, hint, size = 116, style, className = "", label = "Hear it again", layer }: { onReplay?: () => unknown; hint?: boolean; size?: number; style?: CSSProperties; className?: string; label?: string; layer?: boolean }) {
  const held = useHeld();
  if (held && !layer) return <div aria-hidden="true" className={className} style={{ width: size, height: size, ...style, visibility: "hidden", pointerEvents: "none" }} />;
  return (
    <div className={`nav-again-wrap ${className}`} style={{ width: size, height: size, ...style }}>
      <RoundButton nav="again" label={label} className={`nav-again ${hint ? "pulse" : ""}`} style={{ width: size, height: size }} onClick={() => (navLog({ kind: "tap", nav: "again" }), whilePaused(onReplay ?? replayTold))}>
        <Icon.speaker />
      </RoundButton>
      <TapHint show={!!hint} style={{ left: size * 0.45, top: size * 0.55 }} />
    </div>
  );
}
/** The paw, "Show me again": replays the demo that led into this turn (it never answers). A scene's own paw (not
 *  `layer`) steps aside while a holdNext() hold is up. */
export function ShowAgainButton({ onShow, size = 96, style, className = "", layer }: { onShow: () => unknown; size?: number; style?: CSSProperties; className?: string; layer?: boolean }) {
  const held = useHeld();
  if (held && !layer) return <div aria-hidden="true" className={className} style={{ width: size, height: size, ...style, visibility: "hidden", pointerEvents: "none" }} />;
  return (
    <RoundButton nav="show" label="Show me again" className={`nav-show ${className}`} style={{ width: size, height: size, ...style }} onClick={() => (navLog({ kind: "tap", nav: "show" }), whilePaused(onShow))}>
      <Icon.paw />
    </RoundButton>
  );
}

// The idle nudge at a held Next (§3.2): 8 s glow (a gold ring, a bigger bounce, the pointing hand); 16 s Sensei says
// "Tap the arrow when you're ready!" and the ninja leaps and points a star at the arrow; 40 s the line once more; then
// quiet. Any tap starts it again; it waits while anyone is speaking and while the phone is upright. Game time.
// Waiting costs nothing: the quiet time is counted from timestamps, one timeout sleeps until the next step, and speech or
// the phone turning upright (onSpeaking, onUpright) pause the count. The glow and the hand are CSS on the compositor.
const nudgeSubs = new Set<() => void>();
/** Point at the ready Next now (Help's second press on a held step): the glow, the line and the ninja's star. */
export function nudgeNext() {
  if (!nudgeSubs.size) return void say({ line: "nav_ready" });
  nudgeSubs.forEach((f) => f());
}
function pointAt(el: Element | null) {
  void say({ line: "nav_ready" });
  if (el && ninja.mounted) void ninja.act("jump", el, { react: false });
}
function useIdleNudge(active: boolean, el: RefObject<HTMLElement | null>): boolean {
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    setGlow(false);
    if (!active) return;
    const STEPS = [8000, 16000, 40000]; // game ms of quiet: the glow, the line and the ninja's star, the line again
    let idle = 0; // quiet game ms counted so far
    let from = 0; // performance.now() when the current quiet stretch began (0: paused)
    let step = 0; // steps done
    let t = 0;
    let alive = true;
    const fire = (k: number) => {
      if (k === 0) setGlow(true);
      else if (k === 1) pointAt(el.current?.querySelector("button") ?? null);
      else void say({ line: "nav_ready" });
    };
    // bank the quiet time so far, do what is due, then sleep until the next step (or until it's quiet again)
    const sync = () => {
      if (!alive) return;
      if (from) idle += (performance.now() - from) * FAST;
      from = 0;
      clearTimeout(t);
      while (step < STEPS.length && idle >= STEPS[step] - 5) fire(step++); // (a step's line pauses the count itself)
      if (step < STEPS.length && !isUpright() && !isSpeaking()) {
        from = performance.now();
        t = window.setTimeout(sync, STEPS[step] - idle); // (setTimeout runs in game time)
      }
    };
    const reset = () => {
      idle = 0;
      from = 0;
      step = 0;
      setGlow(false);
      sync();
    };
    const now = () => {
      setGlow(true);
      pointAt(el.current?.querySelector("button") ?? null);
    };
    nudgeSubs.add(now);
    const offSpeaking = onSpeaking(sync);
    const offUpright = onUpright(sync);
    window.addEventListener("pointerdown", reset, true);
    window.addEventListener("keydown", reset, true);
    sync();
    return () => {
      alive = false;
      clearTimeout(t);
      nudgeSubs.delete(now);
      offSpeaking();
      offUpright();
      window.removeEventListener("pointerdown", reset, true);
      window.removeEventListener("keydown", reset, true);
    };
  }, [active]);
  return glow;
}

/**
 * ▶ Next: big and green. Dim (grey, no pulse) until `ready`, and a tap on it then only wiggles it; ready, it pops in and
 * pulses, and runs the idle nudge (`nudge: false` turns that off). While it is held ready for more than 1.5 s, lesson
 * clocks stop.
 */
export function NextArrow({ ready = true, onNext, size = 132, nudge = true, style, className = "", label = "Next" }: { ready?: boolean; onNext: () => void; size?: number; nudge?: boolean; style?: CSSProperties; className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wiggle, setWiggle] = useState(false);
  const glow = useIdleNudge(ready && nudge, ref);
  useEffect(() => {
    if (!ready) return;
    let paused = false;
    const t = setTimeout(() => (pauseLessonClock(), (paused = true)), 1500);
    return () => {
      clearTimeout(t);
      if (paused) resumeLessonClock();
    };
  }, [ready]);
  useEffect(() => {
    if (!wiggle) return;
    const t = setTimeout(() => setWiggle(false), 420);
    return () => clearTimeout(t);
  }, [wiggle]);
  return (
    <div ref={ref} className={`nav-next-wrap ${className}`} style={{ width: size, height: size, ...style }}>
      <button
        className={`btn-round nav-next ${ready ? "ready" : "dim"} ${glow && ready ? "glow" : ""} ${wiggle ? "wiggle" : ""}`}
        data-nav="next"
        aria-label={label}
        aria-disabled={ready ? undefined : true}
        style={{ width: size, height: size }}
        {...tapProps(() => {
          if (!ready) return setWiggle(true);
          navLog({ kind: "tap", nav: "next" });
          onNext();
        })}
      >
        <Icon.next />
      </button>
      {/* the pointing hand, its fingertip on the arrow (it takes no taps): clear of the sound picture on its left, the
          caption bubble above and the Help zone on its right */}
      <TapHint show={glow && ready} style={{ left: size / 2 - 53, top: size / 2 - 20 }} />
    </div>
  );
}

/** The top bar for a screen's progress, hearts or title: it keeps clear of the Home zone (Home is the nav layer's). */
export function TopBar({ children, className = "", style }: { children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`topbar nav-topbar ${className}`} style={style}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- the layer
/**
 * Rendered once by App, after <HelpButton/>. `home`: where Home goes on this route (App's rule, docs/NAVIGATION.md
 * §3.3), unless a screen says otherwise; null draws no Home. `scene`: the route's key; when it changes, holds are dropped
 * and the Hear it again register is cleared. Publishes `window.__snNav` for bots and the sweep.
 */
export function NavLayer({ home = null, scene }: { home?: (() => void) | null; scene?: string }) {
  useSyncExternalStore(subscribe, () => version);
  const homeRef = useRef(home);
  homeRef.current = home;
  useEffect(() => {
    return () => {
      dropHolds();
      clearTold();
    };
  }, [scene]);
  const p = resolve();
  const sp = <K extends keyof NavSpec>(e: Entry | undefined, k: K): NavSpec[K] | undefined => e?.spec.current[k];
  const homeFn = p.home ? sp(p.home, "home") : home;
  const againSpec = sp(p.again, "again");
  const again = againSpec === "told" ? (hasTold() ? "told" : null) : againSpec ?? null;
  const at: Anchor = (again && sp(p.again, "againAt")) || "row";
  const back = sp(p.back, "back") ?? null;
  const show = sp(p.show, "show") ?? null;
  const sound = sp(p.sound, "sound") ?? null;
  const next = sp(p.next, "next") ?? null;
  const pres = next ? sp(p.next, "pres") ?? null : null;
  (window as any).__snNav = { home: !!homeFn, back: !!back, again: !!again, againAt: again ? at : null, show: !!show, sound, next: next ? (next.ready ? "ready" : "wait") : null, pres };
  // handlers read the provider's spec when tapped, so they are never stale
  const call = (e: Entry | undefined, k: "home" | "back" | "show") => () => {
    const f = e ? e.spec.current[k] : homeRef.current;
    if (typeof f === "function") return f();
  };
  const onAgain = () => {
    const a = p.again?.spec.current.again;
    return a === "told" ? replayTold() : typeof a === "function" ? a() : undefined;
  };
  const col = at === "column";
  const S = NAV_SLOTS;
  const soundSlot = at === "top-right" ? S["top-right"].sound : at === "side" ? S.side.sound : S.row.sound;
  return (
    <div className="nav-layer">
      {homeFn && <HomeButton onHome={call(p.home, "home")} />}
      {back && <BackButton onBack={call(p.back, "back")} className="nav-ctl" style={slotStyle(col ? S.column.back : S.row.back)} />}
      {show && <ShowAgainButton layer onShow={call(p.show, "show")} className="nav-ctl" style={slotStyle(S.row.show)} size={S.row.show.d} />}
      {again && at !== "own" && (
        <ReplayButton
          layer
          onReplay={onAgain}
          hint={!!sp(p.again, "againHint")}
          className="nav-ctl"
          size={(at === "column" ? S.column : at === "top-right" ? S["top-right"] : at === "side" ? S.side : S.row).again.d}
          style={slotStyle((at === "column" ? S.column : at === "top-right" ? S["top-right"] : at === "side" ? S.side : S.row).again)}
        />
      )}
      {sound && at !== "own" && at !== "column" && <SoundBadge p={sound} size={soundSlot.d} className="nav-ctl" style={slotStyle(soundSlot, soundSlot.d, badgeHeight(soundSlot.d))} />}
      {next && <NextArrow ready={next.ready} onNext={() => p.next?.spec.current.next?.go()} className="nav-ctl" style={slotStyle(col ? S.column.next : S.row.next)} />}
    </div>
  );
}
/** Run the screen's Hear it again now (for an `own` speaker that should do exactly what Hear it again does). */
export function navAgain() {
  const a = resolve().again?.spec.current.again;
  if (a) whilePaused(a === "told" ? replayTold : a);
}

// ---------------------------------------------------------------- shows: held steps
/** One step of a show: one idea (at most about 12 s of speech) that ends on a still picture. */
export interface Step {
  key: string;
  /** Plays the step (speech and animation) and resolves when it has finished. Check `live()` after every await: false
   *  once the child has gone back, replayed, gone on or left. */
  run(live: () => boolean): Promise<unknown> | void;
  /** Puts the picture back as this step starts (so Back and Hear it again replay it from its start). */
  enter?(): void;
  /** The sound picture beside Hear it again during this step. */
  sound?: PhonemeId;
}
export interface PresentationOpts {
  /** Names the show for bots, the sweep and the log (e.g. "film", "flower-intro"). */
  id: string;
  /** Next on the last step. */
  onDone: () => void;
  againAt?: Anchor;
  /** Help: the first press says the step again, later ones point at Next (default true; false keeps the screen's). */
  help?: boolean;
  /** No Back (e.g. a reward's steps). */
  noBack?: boolean;
  start?: number;
  /** A step that hasn't finished after this long (game ms) is marked ready anyway, so Next can't stay dim for ever. */
  guardMs?: number;
  /** window.__snState: by default { scene: "present", id, step, of, canNext }; a function adds fields to it (and may
   *  override `scene`); false leaves __snState to the screen. */
  state?: false | ((i: number, ready: boolean) => Record<string, unknown>);
}
/**
 * A show as held steps (§3.4). Step i runs `enter()` then `run()`; when it resolves, Next turns green and waits. Next
 * goes to the next step (or `onDone` after the last), Back to the previous one, Hear it again plays this step again
 * (once a step has finished, Next stays green through its replay). Nothing moves on by itself. Registers the nav
 * controls itself.
 */
export function usePresentation(steps: Step[], o: PresentationOpts): { i: number; ready: boolean; key: string; next: () => void; back: () => void; replay: () => void; go: (i: number) => void } {
  const [i, setI] = useState(o.start ?? 0);
  const [ready, setReady] = useState(false);
  const token = useRef(0);
  const cur = useRef(o.start ?? 0);
  const isReady = useRef(false);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const oRef = useRef(o);
  oRef.current = o;
  const play = (k: number, why: "start" | "step" | "replay") => {
    const my = ++token.current;
    const live = () => my === token.current;
    const from = cur.current;
    // Hear it again on a step that has already finished keeps Next green (the child has seen it; a replay is a choice,
    // not a reason to wait), as the holds' Hear it again does
    const keep = why === "replay" && k === from && isReady.current;
    cur.current = k;
    setI(k);
    if (!keep) {
      isReady.current = false;
      setReady(false);
    }
    if (why !== "start") hush();
    navLog({ kind: why === "replay" ? "replay" : "step", id: oRef.current.id, from: why === "start" ? null : from, to: k });
    const st = stepsRef.current[k];
    const done = () => {
      if (!live() || isReady.current) return;
      isReady.current = true;
      setReady(true);
    };
    const guard = setTimeout(done, oRef.current.guardMs ?? 30_000);
    (async () => {
      try {
        st.enter?.();
        await st.run(live);
      } catch (e) {
        console.error(`step ${oRef.current.id}:${st.key} failed`, e);
      } finally {
        clearTimeout(guard);
        done();
      }
    })();
  };
  useEffect(() => {
    play(o.start ?? 0, "start");
    return () => void token.current++;
  }, []);
  const next = () => {
    if (!isReady.current) return;
    const k = cur.current;
    if (k + 1 < stepsRef.current.length) return play(k + 1, "step");
    token.current++;
    navLog({ kind: "step", id: oRef.current.id, from: k, to: null });
    oRef.current.onDone();
  };
  const back = () => void (cur.current > 0 && play(cur.current - 1, "step"));
  const replay = () => play(cur.current, "replay");
  const go = (k: number) => play(Math.max(0, Math.min(stepsRef.current.length - 1, k)), "step");
  useNav({
    back: i > 0 && !o.noBack ? back : null,
    again: replay,
    againAt: o.againAt,
    next: { go: next, ready },
    pres: { id: o.id, step: i, of: steps.length },
    sound: steps[i]?.sound,
  });
  const helpOn = o.help !== false;
  useHelp((n) => {
    if (!helpOn) return;
    if (n === 1 || !isReady.current) replay();
    else nudgeNext();
  }, [i, helpOn]);
  if (o.state !== false) (window as any).__snState = { scene: "present", id: o.id, step: i, of: steps.length, canNext: ready, ...(o.state?.(i, ready) ?? {}) };
  return { i, ready, key: steps[i]?.key ?? "", next, back, replay, go };
}

// ---------------------------------------------------------------- holds for scripted scenes
const holds = new Set<() => void>();
/**
 * Hold a scripted scene (the warm-up director, the sticker rewards) at a finished step until the child taps Next: a
 * one-step show (`pres: { id: key, step: 0, of: 1 }`) over the screen, with Hear it again = `again` (none if omitted)
 * and an optional sound picture; `at: "column"` puts Hear it again and Next in the right-hand column. Help says it again, then points at Next. Resolves true on Next; false if the screen was
 * left meanwhile (stop there).
 */
export function holdNext(key: string, again?: (() => unknown) | null, o: { sound?: PhonemeId; at?: Anchor } = {}): Promise<boolean> {
  return new Promise((resolve) => {
    let over = false;
    const finish = (v: boolean) => {
      if (over) return;
      over = true;
      holds.delete(cancel);
      popHelp();
      removeEntry(entry);
      navLog({ kind: "step", id: key, from: 0, to: null });
      resolve(v);
    };
    const cancel = () => finish(false);
    const spec: NavSpec = {
      modal: true,
      again: again ?? null,
      againAt: o.at, // (e.g. "column": a screen whose own targets fill the nav row, like sorting's chests)
      sound: o.sound ?? null,
      back: null,
      next: { ready: true, go: () => finish(true) },
      pres: { id: key, step: 0, of: 1 },
    };
    const entry: Entry = { seq: ++seqN, spec: { current: spec } };
    holds.add(cancel);
    addEntry(entry);
    const popHelp = pushHelp((n) => (n === 1 && again ? void whilePaused(again) : nudgeNext()));
    navLog({ kind: "step", id: key, from: null, to: 0 });
  });
}
/** Is a holdNext() hold up? A scene whose own controls fill the nav row (a battle's letter row) hides them meanwhile,
 *  so the hold's Hear it again, sound picture and Next never sit on top of them. */
export function useHeld(): boolean {
  useSyncExternalStore(subscribe, () => version);
  return holds.size > 0;
}
/** Drop every hold (they resolve false). NavLayer does this when the screen changes. */
export function dropHolds() {
  [...holds].forEach((c) => c());
}
