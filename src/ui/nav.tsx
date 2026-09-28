// Navigation (docs/NAVIGATION.md): Home on every screen, nothing a child can miss (Hear it again, Show me again, Back),
// and nothing that moves on by itself (a finished step holds on a big green Next arrow until the child taps it).
//
// One NavLayer (rendered once by App, next to <HelpButton/>) draws Home top-left and the nav row along the bottom:
//   [◀ Back]  [paw Show me again]  [speaker Hear it again]  [petal Sound picture]        [▶ Next]
// Screens say what those do with useNav() (a stack: a dialog or a hold sits over its screen), or use the pieces below
// directly. usePresentation() runs a show as held steps; holdNext() holds a scripted scene at one step.
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { say, hush, onSay, onSpeaking, onClip, isSpeaking, sfx, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { pauseLessonClock, resumeLessonClock } from "../engine/lessonClock";
import { isRegisterable } from "../content/instructions";
import { LINES } from "../content/lines";
import { wordAt as lineWordAt } from "../content/word-times";
import { SLOW_TIMES } from "../content/stretch";
import type { PhonemeId } from "../content/phonics";
import { Icon, RoundButton, TapHint, useHelp, pushHelp, isUpright, onUpright, tapProps, img, stageRect, W, H } from "./ui";
import { ninja } from "./Ninja";
import { store } from "../engine/store";
import { SoundBadge, SoundPops, clearPops, badgeHeight, soundWidth, PAIRS } from "./SoundBadge";
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
  /** The green arrow: dim (a tap wiggles it) until `ready`, then pulsing, with the idle nudge. `taken`: the child's tap
   *  has been taken and the step ends when Sensei finishes her line (a Ready hold's paw introduction), so ▶ stays
   *  pressed in, still, and a further tap only squishes it (published as `__snNav.next` "wait", `nextTaken`). */
  next?: { go: () => void; ready: boolean; taken?: boolean } | null;
  /** This is a step of a show (bots and the sweep read it): usePresentation and holdNext set it. */
  pres?: { id: string; step: number; of: number } | null;
  /** A dialog or a hold: nothing below shows through except Home. */
  modal?: boolean;
  /** The paw pulses (a Ready hold's 24 s offer, "Or I can show you again."). */
  showPulse?: boolean;
  /** The warm-white spotlight on ▶ or the paw, while Sensei names it ("Tap the green arrow."). */
  spot?: "next" | "show" | null;
  /** A Ready hold (holdReady): published as `__snNav.ready` for bots. `handover`: its line names the task, and a right
   *  answer tapped now counts (`answer`: that answer's label). */
  ready?: { handover: boolean; answer: string | null } | null;
  /** The tortoise and the rabbit (TEACHER_SCRIPT §9.6): this screen has a fast/slow moment, so the two badges sit beside
   *  Hear it again, dim until navSpeed(), a `stretch:` clip or rabbitTap() lights them. See SpeedSpec. */
  speed?: SpeedSpec | null;
}
/**
 * The tortoise and rabbit badges on a screen (NavSpec.speed). `{}`: drawn by the nav layer beside whichever Hear it
 * again is showing (the layer's own, or a scene's `own` speaker), placed clear of ▶, the paw, the petal, the caption,
 * the zones and the scene's tiles and cards. `own`: the scene draws its own big tortoise and rabbit (the warm-ups), so
 * the layer's hide. `at`: the pair's centre in stage px, for a screen that knows better (tortoise left, rabbit right);
 * `liveAt`: where the rabbit stands while rabbitTap() waits (default: placed like the pair).
 */
export interface SpeedSpec {
  own?: boolean;
  at?: { x: number; y: number };
  liveAt?: { x: number; y: number };
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
  const sp = s.speed ? `${s.speed.own ? "o" : "s"}${s.speed.at ? `@${s.speed.at.x},${s.speed.at.y}` : ""}${s.speed.liveAt ? `~${s.speed.liveAt.x},${s.speed.liveAt.y}` : ""}` : f(s.speed);
  return [f(s.home), f(s.back), f(s.again), s.againAt ?? "", s.againHint ? 1 : 0, f(s.show), f(s.sound), s.next === undefined ? "u" : s.next === null ? "n" : s.next.ready ? (s.next.taken ? "t" : "r") : "w", s.pres ? `${s.pres.id}#${s.pres.step}/${s.pres.of}` : f(s.pres), s.modal ? 1 : 0, s.showPulse ? 1 : 0, s.spot ?? "", s.ready ? `${s.ready.handover}:${s.ready.answer}` : "", sp].join("|");
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
  let home: Entry | undefined, back: Entry | undefined, again: Entry | undefined, show: Entry | undefined, sound: Entry | undefined, next: Entry | undefined, speed: Entry | undefined;
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
    if (!speed && s.speed !== undefined) speed = e;
    if (s.modal) sealed = true;
  }
  return { home, back, again, show, sound, next, speed };
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
 *  a choice, "answer" for a question). `ready`: how a Ready hold was answered (`how`; `label`: the card tapped), or the
 *  paw tapped in it (`how: "show"`). `paw`: a scene's demo paw moved (the scene logs it). `speed`: the tortoise
 *  (`which: "slow"`) or the rabbit (`"fast"`) lit (`via`: "call" for navSpeed(), "stretch" for a slow word, "word" for
 *  the fast word after one, "rabbit" for rabbitTap()'s answer; `shown`: the nav badges are drawn). `rabbit`: Move 1's
 *  rabbit answered (`how: "tap"`, a child action, or `"timeout"`), or its tortoise tapped for the slow way again
 *  (`how: "slow"`). */
type NavLogEntry = { kind: "tap" | "step" | "replay" | "ready" | "paw" | "speed" | "rabbit"; nav?: NavKind; id?: string; from?: number | null; to?: number | null; via?: string; how?: ReadyHow | RabbitHow; label?: string; which?: Speed; shown?: boolean };
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
/** A `sound` slot's `d` is the petal's width (its height is badgeHeight(d)): 104 everywhere (SOUND_DISPLAY §4.2), so the
 *  picture is 39 CSS px on a phone. The row's petal (y 562–706) stays under the caption bubble (bottom edge 562) and
 *  left of Next (x 964 on); the corner's sits left of its speaker; the side column's above its speaker, clear of Help.
 *  `column.show` is the column's Back slot: a Ready hold, which has no Back, puts the paw there (TV-F3.2). */
export const NAV_SLOTS = {
  home: { x: 68, y: 66, d: NAV_MIN },
  row: { back: { x: 404, y: 646, d: NAV_MIN }, show: { x: 595, y: 646, d: 100 }, again: { x: 725, y: 636, d: 116 }, sound: { x: 858, y: 634, d: 104 }, next: { x: 1030, y: 628, d: 132 } },
  column: { back: { x: 1204, y: 196, d: NAV_MIN }, show: { x: 1204, y: 196, d: 100 }, again: { x: 1204, y: 322, d: 116 }, next: { x: 1204, y: 474, d: 132 } },
  "top-right": { again: { x: 1212, y: 66, d: NAV_MIN }, sound: { x: 1098, y: 84, d: 104 } },
  side: { again: { x: 1212, y: 504, d: NAV_MIN }, sound: { x: 1100, y: 480, d: 104 } },
} as const;
type Slot = { x: number; y: number; d: number };
/** < x > (/ks/) as the sound picture (Dec7, SD §4.5): one button, two petals side by side with the "+" between their
 *  pictures, at nearly full size (102 in the row: 38.5 CSS px pictures on the 844×390 phone, ≥ 38), so it needs about
 *  twice a petal's room. In the nav row the speaker and the paw step left to make it (the speaker to x 640, the paw to
 *  520, 16 px right of Back): the pair, 235 wide, is centred at 831, 15 px clear of the speaker and of Next. In the
 *  corner and the side column it sits left of its speaker, 14 px clear. (Drawn in the 104 slot, it overlapped itself by
 *  20 % and pressed on the speaker.) */
export const PAIR_SLOTS = {
  row: { back: NAV_SLOTS.row.back, show: { x: 520, y: 646, d: 100 }, again: { x: 640, y: 636, d: 116 }, sound: { x: 831, y: 634, d: 102 }, next: NAV_SLOTS.row.next },
  "top-right": { again: NAV_SLOTS["top-right"].again, sound: { x: 1162 - 14 - soundWidth("ks", 102, "header", true) / 2, y: 84, d: 102 } },
  side: { again: NAV_SLOTS.side.again, sound: { x: 1162 - 14 - soundWidth("ks", 102, "header", true) / 2, y: 480, d: 102 } },
} as const;
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
 *  `layer`) steps aside while a holdNext() hold is up. `pulse`: it pulses (a Ready hold's offer, a struggling first
 *  meeting's "Shall I show you again?"); `spot`: the warm-white spotlight while Sensei names it. */
export function ShowAgainButton({ onShow, size = 96, style, className = "", layer, pulse, spot }: { onShow: () => unknown; size?: number; style?: CSSProperties; className?: string; layer?: boolean; pulse?: boolean; spot?: boolean }) {
  const held = useHeld();
  if (held && !layer) return <div aria-hidden="true" className={className} style={{ width: size, height: size, ...style, visibility: "hidden", pointerEvents: "none" }} />;
  return (
    <div className={`nav-show-wrap ${spot ? "spot" : ""} ${className}`} style={{ width: size, height: size, ...style }}>
      <RoundButton nav="show" label="Show me again" className={`nav-show ${pulse ? "pulse" : ""}`} style={{ width: size, height: size }} onClick={() => (navLog({ kind: "tap", nav: "show" }), whilePaused(onShow))}>
        <PawIcon />
      </RoundButton>
    </div>
  );
}
/** Sensei's paw, the Show me again icon: her red panda's paw held up, palm out, dark with pink toe beans and pad (what
 *  a 3-year-old calls a paw at 45 px), her red fur at the wrist and the green sleeve of her robe with its cream trim (as
 *  SenseiDemo.tsx's demo paw). Sensei calls this button "my paw" (tv_ready_paw "Or tap my paw to see it again."), so it
 *  is her paw, never the cream glove: the glove is only ever the ghost hand, "your turn" (TEACHER_SCRIPT §10.2), and the
 *  idle "tap here" hint. In a button the sleeve is cut along the button's inner edge; `bare` draws it uncut. When a
 *  scene dims the button the paw goes pale (nav.css). */
export function PawIcon({ bare }: { bare?: boolean }) {
  const clip = `pw-clip${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const TOES = [
    [38, 50, 15, 16],
    [60, 30, 16, 17],
    [90, 30, 16, 17],
    [112, 50, 15, 16],
  ] as const;
  return (
    <svg className="nav-paw" viewBox="10 10 130 130" aria-hidden="true">
      {/* the button's inner circle in this box (the svg is 74 % of the button, 2 % low: nav.css) */}
      {!bare && (
        <clipPath id={clip}>
          <circle cx="75" cy="72" r="80" />
        </clipPath>
      )}
      <g clipPath={bare ? undefined : `url(#${clip})`} strokeLinejoin="round" strokeLinecap="round">
        <g transform="rotate(-6 75 80)">
          <path d="M22 178 L30 128 Q75 110 120 128 L128 178 Z" fill="#6db34f" stroke="#2b1d14" strokeWidth="9" />
          <path className="pw-line" d="M33 135 Q75 118 117 135" fill="none" stroke="#f6f1c9" strokeWidth="9" />
          <path d="M44 130 C39 112 39 98 42 86 L108 86 C111 98 111 112 106 130 Q75 118 44 130 Z" fill="#d4652b" stroke="#2b1d14" strokeWidth="9" />
          <path className="pw-line" d="M56 120 C53 110 53 102 55 96" fill="none" stroke="#f0a36c" strokeWidth="7" />
          <path d="M28 78 C24 54 44 40 75 40 C106 40 126 54 122 78 C118 100 98 108 75 108 C52 108 32 100 28 78 Z" fill="#4a2a1a" stroke="#2b1d14" strokeWidth="9" />
          {TOES.map(([x, y, rx, ry]) => (
            <ellipse key={x} cx={x} cy={y} rx={rx} ry={ry} fill="#4a2a1a" stroke="#2b1d14" strokeWidth="7" />
          ))}
          {TOES.map(([x, y, rx, ry]) => (
            <ellipse key={x} className="pw-bean" cx={x} cy={y + 1} rx={rx * 0.55} ry={ry * 0.58} fill="#ffb3c4" />
          ))}
          <path className="pw-bean" d="M75 70 C66 60 50 64 50 78 C50 90 62 96 75 96 C88 96 100 90 100 78 C100 64 84 60 75 70 Z" fill="#ffb3c4" />
        </g>
      </g>
    </svg>
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
/** A quiet-time ladder in game time: `fire(k)` once steps[k] ms of quiet have passed. Quiet: nobody speaking, the phone
 *  not upright, and no pointerdown or key (which start it again, with `onReset`). Waiting costs nothing: the quiet time
 *  is counted from timestamps, one timeout sleeps until the next step, and speech or the phone turning upright
 *  (onSpeaking, onUpright) pause the count. */
function idleLadder(steps: readonly number[], fire: (k: number) => void, onReset?: () => void): { stop(): void; reset(): void } {
  let idle = 0; // quiet game ms counted so far
  let from = 0; // performance.now() when the current quiet stretch began (0: paused)
  let step = 0; // steps done
  let t = 0;
  let alive = true;
  // bank the quiet time so far, do what is due, then sleep until the next step (or until it's quiet again)
  const sync = () => {
    if (!alive) return;
    if (from) idle += (performance.now() - from) * FAST;
    from = 0;
    clearTimeout(t);
    while (step < steps.length && idle >= steps[step] - 5) fire(step++); // (a step's line pauses the count itself)
    if (step < steps.length && !isUpright() && !isSpeaking()) {
      from = performance.now();
      t = window.setTimeout(sync, steps[step] - idle); // (setTimeout runs in game time)
    }
  };
  const reset = () => {
    if (!alive) return;
    idle = 0;
    from = 0;
    step = 0;
    onReset?.();
    sync();
  };
  const offSpeaking = onSpeaking(sync);
  const offUpright = onUpright(sync);
  window.addEventListener("pointerdown", reset, true);
  window.addEventListener("keydown", reset, true);
  sync();
  return {
    reset,
    stop() {
      alive = false;
      clearTimeout(t);
      offSpeaking();
      offUpright();
      window.removeEventListener("pointerdown", reset, true);
      window.removeEventListener("keydown", reset, true);
    },
  };
}
function useIdleNudge(active: boolean, el: RefObject<HTMLElement | null>): boolean {
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    setGlow(false);
    if (!active) return;
    // game ms of quiet: the glow, the line and the ninja's star, the line again
    const lad = idleLadder(
      [8000, 16000, 40000],
      (k) => (k === 0 ? setGlow(true) : k === 1 ? pointAt(el.current?.querySelector("button") ?? null) : void say({ line: "nav_ready" })),
      () => setGlow(false),
    );
    const now = () => {
      setGlow(true);
      pointAt(el.current?.querySelector("button") ?? null);
    };
    nudgeSubs.add(now);
    return () => {
      lad.stop();
      nudgeSubs.delete(now);
    };
  }, [active]);
  return glow;
}

/**
 * ▶ Next: big and green. Dim (grey, no pulse) until `ready`, and a tap on it then only wiggles it; ready, it pops in and
 * pulses, and runs the idle nudge (`nudge: false` turns that off). While it is held ready for more than 1.5 s, lesson
 * clocks stop.
 */
export function NextArrow({ ready = true, taken = false, onNext, size = 132, nudge = true, spot, style, className = "", label = "Next" }: { ready?: boolean; taken?: boolean; onNext: () => void; size?: number; nudge?: boolean; spot?: boolean; style?: CSSProperties; className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wiggle, setWiggle] = useState(false);
  // a tap on a taken ▶ (NavSpec.next.taken): a little squish each time (p1/p2 swap, so each tap restarts it)
  const [press, setPress] = useState(0);
  useEffect(() => setPress(0), [taken]);
  const glow = useIdleNudge(ready && nudge && !taken, ref);
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
    <div ref={ref} className={`nav-next-wrap ${spot && ready && !taken ? "spot" : ""} ${glow && ready ? "glowing" : ""} ${className}`} style={{ width: size, height: size, ...style }}>
      <button
        className={`btn-round nav-next ${ready ? "ready" : "dim"} ${ready && taken ? `taken${press ? ` p${press}` : ""}` : ""} ${glow && ready ? "glow" : ""} ${wiggle ? "wiggle" : ""}`}
        data-nav="next"
        aria-label={label}
        aria-disabled={ready && !taken ? undefined : true}
        style={{ width: size, height: size }}
        {...tapProps(() => {
          if (!ready) return setWiggle(true);
          if (taken) {
            // already taken: it answers the tap (a squish) but nothing more happens until Sensei has finished
            navLog({ kind: "tap", nav: "next", via: "taken" });
            return setPress((k) => (k === 1 ? 2 : 1));
          }
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
      clearPops();
      fsReset();
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
  const ready = next ? sp(p.next, "ready") ?? null : null;
  const spot = sp(p.next, "spot") ?? sp(p.show, "spot") ?? null;
  const speed = sp(p.speed, "speed") ?? null;
  (window as any).__snNav = { home: !!homeFn, back: !!back, again: !!again, againAt: again ? at : null, show: !!show, sound, next: next ? (next.ready && !next.taken ? "ready" : "wait") : null, nextTaken: !!next?.taken, pres, ready, speed: fsPublic() };
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
  // < x > as the sound picture: the pair's own slots (PAIR_SLOTS), the row's speaker and paw stepping left for it
  const pair = !!sound && !!PAIRS[sound] && at !== "own" && !col;
  const S = pair ? { ...NAV_SLOTS, ...PAIR_SLOTS } : NAV_SLOTS;
  const soundSlot = at === "top-right" ? S["top-right"].sound : at === "side" ? S.side.sound : S.row.sound;
  // (data-col: the controls stand in the right-hand column, so a grown-up's caption moves left of it: nav.css)
  return (
    <div className="nav-layer" data-col={col && (!!next || !!again || !!show) ? "" : undefined}>
      <SoundPops />
      {homeFn && <HomeButton onHome={call(p.home, "home")} />}
      {back && <BackButton onBack={call(p.back, "back")} className="nav-ctl" style={slotStyle(col ? S.column.back : S.row.back)} />}
      {show && <ShowAgainButton layer onShow={call(p.show, "show")} className="nav-ctl" style={slotStyle(col ? S.column.show : S.row.show)} size={S.row.show.d} pulse={!!sp(p.show, "showPulse")} spot={spot === "show"} />}
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
      {sound && at !== "own" && at !== "column" && <SoundBadge key={sound} p={sound} tier={at === "top-right" ? "header" : "turn"} size={soundSlot.d} spread={pair} className="nav-ctl nav-sound" style={slotStyle(soundSlot, soundSlot.d, badgeHeight(soundSlot.d))} />}
      {next && <NextArrow ready={next.ready} taken={!!next.taken} onNext={() => p.next?.spec.current.next?.go()} spot={spot === "next"} className="nav-ctl" style={slotStyle(col ? S.column.next : S.row.next)} />}
      <FastSlowBadges spec={speed} anchor={againSpec === undefined ? "row" : sp(p.again, "againAt") ?? "row"} />
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
  if (o.state !== false) (window as any).__snState = { scene: "present", id: o.id, step: i, of: steps.length, canNext: ready, ...o.state?.(i, ready) };
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
// ---------------------------------------------------------------- the Ready hold (TEACHER_SCRIPT §2.3, mechanics §4)
export type ReadyAnswer = "next" | "board" | "answer" | false;
/** How a Ready hold was answered (navLog `{ kind: "ready", how }`): ▶, a card on the board, a right answer during a
 *  hand-over, or the paw (which replays the show and keeps the hold). */
export type ReadyHow = "next" | "show" | "board" | "answer";
export interface ReadyOpts {
  /** The readiness question ("Do you want to have a go now?"; the save's first two: tv_ready_first, tv_ready_paw). ▶ and
   *  the paw work from its first word: a tap cuts Sensei off. */
  ask: Say[];
  /** Hear it again: the frame and the question (never the show: that is the paw). */
  again: () => unknown;
  /** Show me again: the show, narrated. ▶ is dim while it plays (a tap wiggles it). Check `live()` after every await. */
  show?: (live: () => boolean) => Promise<unknown>;
  /** Said as the paw is tapped, before the show (default tv_show_again "Of course. Watch my paw again."; null: nothing). */
  showSay?: Say[] | null;
  /** Said after a replay, as ▶ comes back (default tv_ready_now). */
  after?: Say[];
  /** Said once at 24 s of quiet, as the paw pulses (default tv_offer_show; null: no offer). Only with a `show`. */
  offer?: Say[] | null;
  /** Help's first press (default tv_ready_help with a show, nav_ready without); later presses point at ▶. */
  help?: Say[];
  /** Seconds into `ask`'s first line to spotlight ▶ (and the paw). Without it, ▶ is spotlit on "green arrow" and the paw
   *  on "paw" in every line said during the hold (from content/word-times.ts, else estimated from the line's text). */
  spot?: { next: number; show?: number };
  /** The Ready line names the task ("Now you find the other two. Are you ready?"): a right answer tapped now resolves
   *  "answer" (readyTap({ right: true })), and counts as the first answer (TS T4). */
  handover?: boolean;
  /** The hand-over's right answer (a card's label), published as `__snNav.ready.answer` for bots. */
  answer?: string;
  sound?: PhonemeId;
  /** "row" (default) or "column" (a screen whose own targets fill the nav row: ▶, the speaker and the paw go right). */
  at?: Anchor;
  /** The ninja drops into its ready stance facing ▶, and bows (or, until the bow art lands, a "hup") on the answer
   *  (default true). */
  pose?: boolean;
}
interface ReadyCtl {
  handover: boolean;
  tap(how: "board" | "answer", label?: string): void;
  stop(): boolean;
  cancel(): void;
}
let readyNow: ReadyCtl | null = null;
const LINE_TEXT = new Map(LINES.map((l) => [l.id, l.text]));
const SPOT_MS = 1700;
const SPOT_WORDS = { next: ["green", "arrow"], show: ["paw"] } as const;
/** Readies that introduce the paw (TEACHER_SCRIPT §2.5: it is explained here, once per save). ▶ tapped while one is
 *  being said is taken at once (the ninja bows) but the hold ends as the line does, the paw spotlit, so the child hears
 *  what the paw is for (a tap on "Tap the green arrow." used to cut "Or tap my paw to see it again." off for good). */
const PAW_ASKS = new Set(["tv_ready_paw"]);
/** When the first of `words` is said in line `id`, in game ms from the clip's start (what setTimeout takes: at ?fast=N
 *  both run N× faster): its measured time if the line has word timings (content/word-times.ts LINE_WORDS), else
 *  estimated from the text (letters, with a pause at each full stop or comma) and the clip's real length `durMs`. Null
 *  if the line doesn't say it. */
function wordAt(id: string, words: readonly string[], durMs: number): number | null {
  const text = LINE_TEXT.get(id);
  if (!text) return null;
  const toks = text.split(/\s+/).filter(Boolean);
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z']/g, "");
  const i = toks.findIndex((t) => words.includes(norm(t)));
  if (i < 0) return null;
  const measured = lineWordAt(id, norm(toks[i]));
  if (measured !== undefined) return measured * 1000;
  const weight = (t: string) => t.replace(/[^A-Za-z']/g, "").length + (/[.!?…]$/.test(t) ? 7 : /[,;:]$/.test(t) ? 3 : 1);
  const all = toks.reduce((n, t) => n + weight(t), 0);
  const before = toks.slice(0, i).reduce((n, t) => n + weight(t), 0);
  return all ? (durMs * FAST * before) / all : null;
}

/**
 * The readiness question after a game's show (docs/teacher-voice/mechanics.md §4, TEACHER_SCRIPT §2.3): a modal hold
 * over the scene, built like holdNext(), answered by ▶ ("I'm ready"), a tap on the board (the scene calls readyTap()),
 * or, on a hand-over, a right answer. The paw replays the show (▶ dim meanwhile, then `after`); nothing starts the turn
 * by itself. The idle ladder: 8 s ▶ glows with the hand, 16 s nav_ready and the ninja's star (NextArrow's own), 24 s
 * the paw pulses with `offer` (once), 40 s nav_ready, then quiet. Help: first `help`, then it points at ▶. Hear it again:
 * `again`. `__snNav.pres.id` is "ready:<key>"; `__snNav.ready` is { handover, answer }; each answer is logged as
 * `{ kind: "ready", id, how, label }`. Resolves how the child answered, or false if the screen was left.
 */
export function holdReady(key: string, o: ReadyOpts): Promise<ReadyAnswer> {
  readyNow?.cancel(); // (one at a time)
  return new Promise((resolve) => {
    const id = `ready:${key}`;
    let over = false;
    let replay = 0; // bumped to stop a replay
    let replaying = false;
    let offered = false;
    let spotN = 0;
    const timers = new Set<number>();
    const later = (ms: number, f: () => void) => {
      const t = window.setTimeout(() => (timers.delete(t), f()), ms);
      timers.add(t);
      return t;
    };
    // the paw's introduction (PAW_ASKS): when it ends (performance.now(); 0 until it starts), and a ▶ waiting for it
    const pawAsk = o.show ? o.ask.find((it): it is { line: string } => "line" in it && PAW_ASKS.has(it.line))?.line : undefined;
    let pawEnd = 0;
    let waiting = 0;
    let bowed = false;
    const go = () => answer("next");
    const spec: NavSpec = {
      modal: true,
      again: o.again,
      againAt: o.at,
      sound: o.sound ?? null,
      back: null,
      show: o.show ? () => showAgain() : null,
      next: { ready: true, go },
      pres: { id, step: 0, of: 1 },
      ready: { handover: !!o.handover, answer: o.answer ?? null },
      spot: null,
      showPulse: false,
    };
    const entry: Entry = { seq: ++seqN, spec: { current: spec } };
    const set = (patch: Partial<NavSpec>) => {
      if (over) return;
      Object.assign(spec, patch);
      bump();
    };
    const spotOn = (k: "next" | "show", ms: number) =>
      later(Math.max(0, ms), () => {
        const my = ++spotN;
        set({ spot: k });
        later(SPOT_MS, () => my === spotN && set({ spot: null }));
      });
    // the spotlights: on the ask's own times if given, else on "green arrow" and "paw" in whatever is said
    const askFirst = o.ask.find((it): it is { line: string } => "line" in it)?.line;
    const offClip = onClip((cid, start, end) => {
      if (over || !LINE_TEXT.has(cid)) return;
      if (cid === pawAsk && !pawEnd) pawEnd = end;
      if (o.spot && cid === askFirst) {
        spotOn("next", o.spot.next * 1000);
        if (o.spot.show != null && o.show) spotOn("show", o.spot.show * 1000);
        return;
      }
      for (const k of ["next", "show"] as const) {
        if (k === "show" && !o.show) continue;
        const ms = wordAt(cid, SPOT_WORDS[k], end - start);
        if (ms != null) spotOn(k, ms);
      }
    });
    // the ninja: its ready stance, turned to ▶ (once ▶ is drawn), and a bow (a ninja's rei) on the answer
    const posed = o.pose !== false && ninja.mounted;
    if (posed) later(60, () => ninja.mounted && ninja.pose("ready", { face: "next" }));
    const bow = () => void (posed && ninja.mounted && ninja.act("bow", undefined, { react: false }));
    // 24 s of quiet: the paw pulses, and Sensei offers to show it again (once)
    const lad = idleLadder([24000], () => {
      if (offered || !o.show || replaying || o.offer === null) return;
      offered = true;
      set({ showPulse: true });
      void say(o.offer ?? [{ line: "tv_offer_show" }]);
    });
    const popHelp = pushHelp((n) => (n === 1 ? void say(o.help ?? (o.show ? [{ line: "tv_ready_help" }] : [{ line: "nav_ready" }])) : nudgeNext()));
    const showAgain = () => {
      if (over || !o.show) return;
      if (waiting) {
        // ▶ was waiting for the paw's introduction to end, and the child tapped the paw it named: show it again instead
        clearTimeout(waiting);
        timers.delete(waiting);
        waiting = 0;
      }
      navLog({ kind: "ready", id, how: "show" });
      const my = ++replay;
      replaying = true;
      set({ next: { ready: false, go }, showPulse: false, spot: null });
      const live = () => !over && my === replay;
      return (async () => {
        try {
          if (o.showSay !== null) await say(o.showSay ?? [{ line: "tv_show_again" }]);
          if (live()) await o.show!(live);
        } catch (e) {
          console.error(`ready ${key}: the show failed`, e);
        }
        if (!live()) return;
        replaying = false;
        set({ next: { ready: true, go } });
        lad.reset();
        await say(o.after ?? [{ line: "tv_ready_now" }]);
      })();
    };
    const stop = () => {
      if (!replaying || over) return false;
      replay++;
      replaying = false;
      hush();
      set({ next: { ready: true, go } });
      lad.reset();
      return true;
    };
    const answer = (how: "next" | "board" | "answer", label?: string) => {
      if (over || (waiting && how === "next")) return;
      if (waiting) {
        // a card tapped while ▶ waits: the card wins (the scene says its word now), so the hold ends now
        clearTimeout(waiting);
        timers.delete(waiting);
        waiting = 0;
      }
      navLog({ kind: "ready", id, how, ...(label ? { label } : {}) });
      replay++;
      // ▶ during the paw's introduction: taken now (the bow), but the hold ends as the line does, with the paw spotlit
      // (a board tap can't wait: the scene says the card's word at once). ▶ shows it has been taken: pressed in and still,
      // a later tap only squishes it (NextArrow `taken`), so the child sees the tap land (verify round 2: the bots'
      // 9–13 taps on a ▶ that went on pulsing)
      const left = pawEnd - performance.now(); // (real ms: the clip's end from onClip)
      if (how === "next" && pawEnd && !replaying && left * FAST > 80) {
        bow();
        bowed = true;
        spotN++;
        set({ spot: "show", next: { ready: true, go, taken: true } });
        waiting = later(left * FAST + 120, () => ((waiting = 0), finish(how))); // (setTimeout runs FAST× faster at ?fast=N)
        return;
      }
      if (isSpeaking()) hush(); // an answer cuts Sensei off, as an answer during a question does
      if (!bowed) bow();
      finish(how);
    };
    const finish = (v: ReadyAnswer) => {
      if (over) return;
      over = true;
      replay++;
      holds.delete(cancel);
      popHelp();
      lad.stop();
      offClip();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      if (readyNow === ctl) readyNow = null;
      removeEntry(entry);
      navLog({ kind: "step", id, from: 0, to: null });
      if (posed) ninja.pose(null);
      resolve(v);
    };
    const cancel = () => finish(false);
    const ctl: ReadyCtl = { handover: !!o.handover, tap: (how, label) => answer(how, label), stop, cancel };
    readyNow = ctl;
    holds.add(cancel);
    addEntry(entry);
    navLog({ kind: "step", id, from: null, to: 0 });
    void say(o.ask);
  });
}
/**
 * A tap on the game's board while a Ready hold is up (call it before saying anything for the tap). It answers the hold:
 * "board" (the scene echoes the card: it is not an answer, the question hasn't been asked), or "answer" when the hold is
 * a hand-over and the scene judged the tap `right` (it counts as the first answer). A replay of the show in progress
 * stops. False if no Ready hold is up: handle the tap as usual. `label`: the card, for the log.
 */
export function readyTap(o: { right?: boolean; label?: string } = {}): ReadyAnswer | false {
  const h = readyNow;
  if (!h) return false;
  const how = h.handover && o.right ? "answer" : "board";
  h.tap(how, o.label);
  return how;
}
/** Stop a Ready hold's replay of the show without answering the hold (a tap on the demo's own pictures, when the demo
 *  isn't on the turn's board: mechanics §4.2). True if a replay was stopped. */
export const readyStop = (): boolean => readyNow?.stop() ?? false;
/** Is a Ready hold up? */
export const readyHeld = (): boolean => !!readyNow;

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

// ---------------------------------------------------------------- the tortoise and the rabbit (TEACHER_SCRIPT §9.6)
// Two small badges beside Hear it again while a screen has a fast/slow moment (NavSpec.speed): the tortoise (the slow
// way) on the left, the rabbit (the fast way) on the right, dim until one lights.
// - navSpeed("slow") lights the tortoise, which takes a step on each sound that plays; any `stretch:` clip (the gapped
//   slow word) lights it by itself, stepping on each sound's onset (content/stretch.ts SLOW_TIMES).
// - navSpeed("fast") lights the rabbit, which hops on the next word said; the same word said plainly within 8 s of its
//   slow way (or any word after navSpeed("slow")'s sounds) lights it by itself.
// - rabbitTap() is Move 1's join-in: the rabbit grows to a full tap target, pulses, is spotlit on "rabbit" and waits
//   for the child's tap. It is live only then: a tap on a badge at any other time only wiggles it.
// Transform and opacity only. The live rabbit's pulse (and its ring from 8 s) is the only endless animation, and it
// stops when the rabbit is answered. Nothing runs per frame; placing the pair measures the screen once when it shows,
// when the nav controls change, when the rabbit goes live, and once more half a second later.

export type Speed = "slow" | "fast";
/** How Move 1's rabbit was answered (navLog `{ kind: "rabbit", how }`): tapped, or not within the time (Sensei says the
 *  fast way herself); "slow": the tortoise tapped for the slow way again while the rabbit waits. */
export type RabbitHow = "tap" | "timeout" | "slow";
type FsState = { lit: Speed | null; live: boolean; glow: boolean; spot: boolean; force: boolean };
let fs: FsState = { lit: null, live: false, glow: false, spot: false, force: false };
let fsVer = 0;
/** The nav badges are drawn (FastSlowBadges sets it): the automatic lighting only acts then. */
let fsShown = false;
const fsSubs = new Set<() => void>();
const fsSubscribe = (f: () => void) => {
  fsSubs.add(f);
  return () => void fsSubs.delete(f);
};
/** `__snNav.speed` for bots and the sweep: { shown, lit, rabbit: "live" while rabbitTap() waits, else null }. A live
 *  rabbit is `[data-fs="rabbit"]` (aria-label "The rabbit"). */
function fsPublic() {
  return { shown: fsShown, lit: fs.lit, rabbit: fs.live ? "live" : null };
}
function fsSet(p: Partial<FsState>) {
  const n = { ...fs, ...p };
  if ((Object.keys(n) as (keyof FsState)[]).every((k) => n[k] === fs[k])) return;
  fs = n;
  fsVer++;
  const nav = (window as any).__snNav;
  if (nav) nav.speed = fsPublic();
  fsSubs.forEach((f) => f());
}
/** The mounted badges' moves (Web Animations on transform): the tortoise's step, the rabbit's hop, a wiggle. */
let fsView: { step(): void; hop(): void; wiggle(k: "tortoise" | "rabbit"): void } | null = null;

/** What lit the badge that is lit (a slow word's own light goes out with its clip; a call's stays until the next). */
let litBy: "call" | "stretch" | "word" | "rabbit" | null = null;
let fsTimers: number[] = [];
const fsLater = (ms: number, f: () => void) => void fsTimers.push(window.setTimeout(f, ms));
const fsClear = () => {
  fsTimers.forEach((t) => clearTimeout(t));
  fsTimers = [];
};
/** The rabbit is lit and hops on the next word clip (within FAST_ARM_MS of game time; else it hops then, and goes out). */
let fastArmed = false;
const FAST_ARM_MS = 5000;
/** The slow way has just played: the same `word` said plainly (any word after navSpeed("slow")'s sounds: null) before
 *  `until` (performance.now()) is the fast way, and lights the rabbit. */
let slowMemo: { word: string | null; until: number } | null = null;
const SLOW_MEMO_MS = 8000;
/** A slow slot can't last longer than this (a navSpeed("slow") nobody turned off). */
const SLOW_MAX_MS = 12000;
function slowOut() {
  if (fs.lit === "slow") {
    litBy = null;
    fsSet({ lit: null });
  }
  if (slowMemo) slowMemo.until = Math.min(slowMemo.until, performance.now() + SLOW_MEMO_MS / FAST);
}
function fastOut() {
  if (fs.lit !== "fast") return;
  litBy = null;
  fsSet({ lit: null });
}
function armFast() {
  fastArmed = true;
  fsLater(FAST_ARM_MS, () => {
    if (!fastArmed) return;
    fastArmed = false;
    fsView?.hop();
    fsLater(900, fastOut);
  });
}
/**
 * Light the tortoise ("slow": the slow way is playing; it steps on each sound, until the next call or 12 s) or the
 * rabbit ("fast": the fast word is next; it hops on it and goes out when it ends), or neither (null). A `stretch:` clip
 * and the plain word after it light them by themselves, so a scene calls this for the sounds of a read-back (the tiles'
 * voices) and the word after them. Logged as `{ kind: "speed", which, via: "call", shown }`.
 */
export function navSpeed(which: Speed | null): void {
  fsClear();
  fastArmed = false;
  if (!which) {
    if (fs.lit === "slow") slowOut();
    else fastOut();
    return;
  }
  navLog({ kind: "speed", which, via: "call", shown: fsShown });
  litBy = "call";
  fsSet({ lit: which });
  if (which === "slow") {
    slowMemo = { word: null, until: Infinity };
    fsView?.step();
    fsLater(SLOW_MAX_MS, slowOut);
  } else {
    slowMemo = null;
    armFast();
  }
}
/** Everything off (NavLayer, when the screen changes). */
function fsReset() {
  rabbitNow?.cancel();
  fsClear();
  fastArmed = false;
  slowMemo = null;
  litBy = null;
  fsSet({ lit: null, live: false, glow: false, spot: false, force: false });
}
/** The clip playing now (the rabbit's spotlight on a line already under way). */
let lastClip: { id: string; start: number; end: number } | null = null;
onClip((id, start, end) => {
  lastClip = { id, start, end };
  const ms = (end - start) * FAST; // the clip in game ms (setTimeout's clock)
  if (id.startsWith("stretch:")) {
    if (!fsShown) return;
    const w = id.slice(8);
    if (!(fs.lit === "slow" && litBy === "call")) {
      fsClear();
      fastArmed = false;
      litBy = "stretch";
      fsSet({ lit: "slow" });
      navLog({ kind: "speed", which: "slow", via: "stretch", shown: true });
      fsLater(ms + 120, () => litBy === "stretch" && slowOut());
    }
    slowMemo = { word: w, until: Infinity };
    for (const t of SLOW_TIMES[w] ?? [0]) fsLater(t * 1000, () => fsView?.step());
  } else if (id.startsWith("sound:")) {
    if (fs.lit === "slow") fsView?.step();
  } else if (id.startsWith("word:")) {
    const w = id.slice(5);
    if (fastArmed) {
      fastArmed = false;
      fsClear();
      fsView?.hop();
      fsLater(ms + 300, fastOut);
    } else if (fsShown && slowMemo && performance.now() <= slowMemo.until && (slowMemo.word === null || slowMemo.word === w)) {
      slowMemo = null;
      fsClear();
      litBy = "word";
      fsSet({ lit: "fast" });
      navLog({ kind: "speed", which: "fast", via: "word", shown: true });
      fsView?.hop();
      fsLater(ms + 300, fastOut);
    }
  }
});

// Move 1: the rabbit waits for the child's tap
export interface RabbitOpts {
  /** Game ms of quiet (not counting speech, or the phone upright; any tap starts it again) before "timeout" (default
   *  12 s). The rabbit hops and its ring glows at two thirds of it (8 s). */
  timeoutMs?: number;
  /** The tortoise's tap while the rabbit waits: the slow way again (the scene's sounds or slow word). The tortoise lights
   *  meanwhile; lesson clocks stop. Without it, a tap on the tortoise only wiggles it. */
  slow?: () => unknown;
  /** Said as the rabbit goes live, e.g. `tv_fs_rabbit_read` (the spotlight lands on "rabbit"). A scene may instead say
   *  the prompt itself, started at the same moment: the spotlight follows any line that names the rabbit. */
  ask?: Say[];
}
const RABBIT_TIMEOUT_MS = 12000;
const RABBIT_HOP_MS = 8000;
type RabbitCtl = { tap(): void; tortoise(): void; cancel(): void };
let rabbitNow: RabbitCtl | null = null;
/**
 * Move 1's join-in (TEACHER_SCRIPT §9.2, §9.3): the rabbit grows to a full tap target (112 stage px), pulses and is
 * spotlit on the word "rabbit" (`tv_fs_rabbit_read`, `fm_tap_rabbit`), and waits. At 8 s of quiet it hops and its ring
 * glows; at 12 s it resolves "timeout" (the scene says `tv_fs_now_fast` · [w]). A tap resolves "tap" (it cuts Sensei
 * off). Either way the rabbit then lights and hops on the next word said, so the scene says [w] (with the sweep) next.
 * The badges show while it waits even on a screen without `speed`. One at a time; the screen changing resolves it
 * "timeout" (the scene has gone). Logged as `{ kind: "rabbit", how }`; a tap is a child action (talk-before-action).
 */
export function rabbitTap(o: RabbitOpts = {}): Promise<"tap" | "timeout"> {
  rabbitNow?.cancel();
  return new Promise((resolve) => {
    let over = false;
    let spotN = 0;
    const timers = new Set<number>();
    const later = (ms: number, f: () => void) => {
      const t = window.setTimeout(() => (timers.delete(t), f()), Math.max(0, ms));
      timers.add(t);
    };
    const total = Math.max(1500, o.timeoutMs ?? RABBIT_TIMEOUT_MS);
    const hopAt = Math.min(RABBIT_HOP_MS, Math.round((total * 2) / 3));
    const spotAt = (ms: number) =>
      later(ms, () => {
        const my = ++spotN;
        fsSet({ spot: true });
        later(SPOT_MS, () => my === spotN && fsSet({ spot: false }));
      });
    // the spotlight on "rabbit": in any line said while it waits, or the one under way now; else at once
    const offClip = onClip((cid, start, end) => {
      if (over) return;
      const ms = wordAt(cid, ["rabbit"], end - start);
      if (ms != null) spotAt(ms);
    });
    const lc = lastClip;
    const now = performance.now();
    const cur = lc && now < lc.end ? wordAt(lc.id, ["rabbit"], lc.end - lc.start) : null;
    if (lc && cur != null) spotAt(cur - (now - lc.start) * FAST);
    else if (!o.ask) spotAt(0);
    const lad = idleLadder(
      [hopAt, total],
      (k) => {
        if (k > 0) return finish("timeout");
        fsSet({ glow: true });
        fsView?.hop();
      },
      () => fsSet({ glow: false }),
    );
    const finish = (how: "tap" | "timeout" | null) => {
      if (over) return;
      over = true;
      lad.stop();
      offClip();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      if (rabbitNow === ctl) rabbitNow = null;
      fsSet({ live: false, force: false, glow: false, spot: false });
      if (how) {
        navLog({ kind: "rabbit", how });
        // the fast way: the rabbit lights, and hops on the word (after Sensei's `tv_fs_now_fast` on a timeout)
        fsClear();
        slowMemo = null;
        litBy = "rabbit";
        fsSet({ lit: "fast" });
        navLog({ kind: "speed", which: "fast", via: "rabbit", shown: true });
        armFast();
      }
      resolve(how ?? "timeout");
    };
    const ctl: RabbitCtl = {
      tap: () => {
        if (over) return;
        if (isSpeaking()) hush(); // the child's answer cuts Sensei off
        sfx.tap?.();
        finish("tap");
      },
      tortoise: () => {
        if (over) return;
        if (!o.slow) return fsView?.wiggle("tortoise");
        navLog({ kind: "rabbit", how: "slow" });
        fsSet({ glow: false, spot: false });
        if (isSpeaking()) hush();
        navSpeed("slow");
        whilePaused(async () => {
          try {
            await o.slow!();
          } finally {
            if (!over && fs.lit === "slow" && litBy === "call") navSpeed(null);
          }
        });
      },
      cancel: () => finish(null),
    };
    rabbitNow = ctl;
    fsSet({ live: true, force: true, glow: false, spot: false });
    if (o.ask) void say(o.ask);
  });
}
/** Is Move 1's rabbit waiting for a tap? */
export const rabbitWaiting = (): boolean => !!rabbitNow;
// for the probes and bots: light the badges or call the rabbit on any screen (rabbitTap shows the badges wherever it is)
if (typeof window !== "undefined") (window as any).__snFs = { navSpeed, rabbitTap, rabbitWaiting };

// ---------------------------------------------------------------- the badges and where they go
/** The badges' sizes (stage px), tried biggest first; the live rabbit's (a full tap target, over NAV_MIN). */
const FS_SIZES = [72, 62, 54] as const;
const FS_LIVE = 112;
const FS_GAP = 10; // from the speaker
const FS_PAIR_GAP = 8; // between the tortoise and the rabbit
const FS_MARGIN = 6; // kept clear around everything else
type Pt = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number; round?: boolean; heavy?: boolean };
interface FsPlace {
  b: number;
  t: Pt;
  r: Pt;
  live: Pt;
  key: string;
}
/** Kept clear always: the Home, Help and ninja zones (docs/HERO.md); with captions on (a grown-ups' setting), also the
 *  caption bubble's reach (right 18, bottom 158, max-width 460, three lines), whether or not Sensei is talking now. */
const FS_ZONES: Box[] = [
  { x: 0, y: 0, w: 130, h: 130, heavy: true },
  { x: 1116, y: 556, w: 164, h: 164, heavy: true },
  { x: 0, y: 380, w: 330, h: 340, heavy: true },
];
const FS_CAPTION: Box = { x: 802, y: 400, w: 460, h: 162, heavy: true };
/** What the badges keep clear of on the screen: controls, tiles, slots, cards, the caption, petals, the top bar, the
 *  scenes' big furniture (a battle's monster and its bar, Baron in Sound Swap, a story's title, text and choices), and
 *  anything a scene marks `data-fs-avoid`. Nav controls, the caption and petals must never be covered ("heavy", as is
 *  `data-fs-avoid="heavy"`); the scene's own things may be touched only if nothing else fits. */
const FS_AVOID = [
  'button, [role="button"], [data-nav], [data-tap], [data-fs-avoid], .tile, .slot, .card, .pcard, .bubble, .sound-badge, .topbar > *',
  ".bt-mon, .bt-hp, .bt-meter, .swap-baron, .st-title, .st-words, .st-narr, .st-ask, .st-choices, .st-cards, .st-side",
].join(", ");
const FS_HEAVY = '[data-nav], .bubble, .sound-badge, [data-fs-avoid="heavy"]';

/** How far a circle (centre c, radius r) cuts into box b, with the margin (0: clear). */
function fsCut(c: Pt, r: number, b: Box): number {
  const m = FS_MARGIN;
  if (b.round) return Math.max(0, r + Math.min(b.w, b.h) / 2 + m - Math.hypot(c.x - (b.x + b.w / 2), c.y - (b.y + b.h / 2)));
  const nx = Math.max(b.x, Math.min(c.x, b.x + b.w)), ny = Math.max(b.y, Math.min(c.y, b.y + b.h));
  const d = Math.hypot(c.x - nx, c.y - ny);
  if (d > 0) return Math.max(0, r + m - d);
  return r + m + Math.min(c.x - b.x, b.x + b.w - c.x, c.y - b.y, b.y + b.h - c.y);
}
/** A placement's cost: off the stage or into anything heavy, 1000 a px; into the scene's own things, 40 plus 4 a px. */
function fsCost(circles: [Pt, number][], obs: Box[]): number {
  let s = 0;
  for (const [c, r] of circles) {
    s += 1000 * (Math.max(0, 10 + r - c.x) + Math.max(0, c.x + r - (W - 10)) + Math.max(0, 10 + r - c.y) + Math.max(0, c.y + r - (H - 10)));
    for (const b of obs) {
      const p = fsCut(c, r, b);
      if (p > 0) s += b.heavy ? 1000 * p : 40 + 4 * p;
    }
  }
  return s;
}
const fsVisible = (el: Element) => {
  const cs = getComputedStyle(el);
  return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) >= 0.05;
};
/** The Hear it again the badges sit beside: the nav layer's, else a scene's own (`own`), else none. */
function fsSpeaker(): Element | null {
  const stage = document.querySelector(".stage");
  if (!stage) return null;
  const all = [...stage.querySelectorAll('[data-nav="again"]')].filter((el) => !el.closest(".fs-badges") && fsVisible(el) && el.getBoundingClientRect().width > 4);
  return all.find((el) => el.closest(".nav-layer")) ?? all[0] ?? null;
}
function fsObstacles(speaker: Element | null): Box[] {
  const out: Box[] = [...FS_ZONES, ...(store.get().settings?.captions ? [FS_CAPTION] : [])];
  const stage = document.querySelector(".stage");
  if (!stage) return out;
  for (const el of stage.querySelectorAll(FS_AVOID)) {
    if (el.closest(".fs-badges, .sound-pops")) continue; // (the badges themselves; a pop comes and goes)
    if (speaker && (el === speaker || speaker.contains(el) || el.contains(speaker))) continue;
    if (!fsVisible(el)) continue;
    const r = stageRect(el);
    if (r.w < 6 || r.h < 6 || (r.w > 900 && r.h > 400)) continue; // (a whole-screen layer is not a thing)
    out.push({ ...r, round: el.classList.contains("btn-round"), heavy: el.matches(FS_HEAVY) });
  }
  return out;
}
/** Where the pair may go around the speaker box S, in order of preference: the nav row's speaker has the paw and the
 *  petal at its sides and the caption up to its right, so the pair usually goes just above it; a speaker at the right
 *  edge (the column, the top-right corner) has the pair under it or to its left; a scene's own speaker (beside a word
 *  card) has it at its sides, else to its right, under it or to its left. */
function fsPairs(S: Box, b: number): { t: Pt; r: Pt }[] {
  const sx = S.x + S.w / 2, sy = S.y + S.h / 2, g = FS_GAP, h = b / 2, off = (b + FS_PAIR_GAP) / 2;
  const pair = (cx: number, cy: number) => ({ t: { x: cx - off, y: cy }, r: { x: cx + off, y: cy } });
  const flank = { t: { x: S.x - g - h, y: sy }, r: { x: S.x + S.w + g + h, y: sy } };
  const right = pair(S.x + S.w + g + h + off, sy);
  const left = pair(S.x - g - h - off, sy);
  const shifts = [0, -24, -48, -72, -96, 24, 48, 72];
  const above = shifts.map((dx) => pair(sx + dx, S.y - g - h));
  const below = shifts.map((dx) => pair(sx + dx, S.y + S.h + g + h));
  if (sy > 540) return [flank, ...above, right, left];
  if (sx > 1100) return [...below, left, ...above];
  return [flank, right, ...below, left, ...above];
}
/** Where the live rabbit may stand, given the pair: in its own place, grown outward, risen or dropped from it (the
 *  nearest first), and (last) beyond the tortoise. */
function fsLives(t: Pt, r: Pt, b: number): Pt[] {
  const L = FS_LIVE;
  const dx = r.x - t.x, dy = r.y - t.y, n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
  const grow = (L - b) / 2 + 2;
  const out: Pt[] = [r, { x: r.x + ux * grow, y: r.y + uy * grow }];
  const near: Pt[] = [];
  for (const oy of [-20, -40, -60, -80, -100, -120, 20, 40, 60, 80, 100, 120])
    for (const ox of [0, 20, -20, 40, -40, 60]) near.push({ x: r.x + ox, y: r.y + oy });
  near.sort((a, c) => Math.hypot(a.x - r.x, a.y - r.y) - Math.hypot(c.x - r.x, c.y - r.y));
  const beyond = b / 2 + FS_PAIR_GAP + L / 2;
  return [...out, ...near, { x: t.x - ux * beyond, y: t.y - uy * beyond }];
}
/** The anchor's own speaker slot, when no speaker is showing. */
function fsSlot(anchor: Anchor): Box {
  const s = anchor === "column" ? NAV_SLOTS.column.again : anchor === "top-right" ? NAV_SLOTS["top-right"].again : anchor === "side" ? NAV_SLOTS.side.again : NAV_SLOTS.row.again;
  return { x: s.x - s.d / 2, y: s.y - s.d / 2, w: s.d, h: s.d, round: true, heavy: true };
}
/** Place the pair and the live rabbit on the screen as it is now. */
function fsPlace(spec: SpeedSpec | null, anchor: Anchor): FsPlace {
  const speaker = fsSpeaker();
  const obs = fsObstacles(speaker);
  const S: Box = speaker ? { ...stageRect(speaker), round: speaker.classList.contains("btn-round"), heavy: true } : fsSlot(anchor);
  let best: { t: Pt; r: Pt; b: number; s: number } | null = null;
  if (spec?.at) {
    const b = FS_SIZES[0], off = (b + FS_PAIR_GAP) / 2;
    best = { t: { x: spec.at.x - off, y: spec.at.y }, r: { x: spec.at.x + off, y: spec.at.y }, b, s: 0 };
  } else
    for (const b of FS_SIZES) {
      fsPairs(S, b).forEach((c, i) => {
        const s = fsCost([[c.t, b / 2], [c.r, b / 2]], [...obs, S]) + i * 0.25 + (FS_SIZES[0] - b) * 0.4;
        if (!best || s < best.s) best = { ...c, b, s };
      });
      if (best!.s < 8) break; // clear at this size
    }
  const { t, r, b } = best!;
  let live: Pt = spec?.liveAt ?? r;
  if (!spec?.liveAt) {
    const obsL = [...obs, S, { x: t.x - b / 2, y: t.y - b / 2, w: b, h: b, round: true, heavy: true }];
    const cands = fsLives(t, r, b);
    let bs = Infinity;
    cands.forEach((p, i) => {
      const s = fsCost([[p, FS_LIVE / 2]], obsL) + i * 0.25 + (i === cands.length - 1 ? 60 : 0);
      if (s < bs) (bs = s), (live = p);
    });
  }
  const q = (v: number) => Math.round(v / 8);
  return { b, t, r, live, key: `${q(S.x)},${q(S.y)},${q(S.w)},${q(S.h)}` };
}
const samePlace = (a: FsPlace | null, b: FsPlace | null) =>
  !!a && !!b && a.b === b.b && [a.t, a.r, a.live].every((p, i) => {
    const o = [b.t, b.r, b.live][i];
    return Math.abs(p.x - o.x) < 2 && Math.abs(p.y - o.y) < 2;
  });

const STEP_KF: Keyframe[] = [{ transform: "none" }, { transform: "translate(5px, -6px) rotate(-8deg)", offset: 0.4 }, { transform: "translate(7px, 0) rotate(2deg)", offset: 0.7 }, { transform: "none" }];
const HOP_KF: Keyframe[] = [{ transform: "none" }, { transform: "translateY(-24px) scale(0.96, 1.06)", offset: 0.42 }, { transform: "translateY(0) scale(1.08, 0.92)", offset: 0.78 }, { transform: "none" }];
const WIGGLE_KF: Keyframe[] = [{ transform: "none" }, { transform: "rotate(-12deg)", offset: 0.2 }, { transform: "rotate(10deg)", offset: 0.45 }, { transform: "rotate(-6deg)", offset: 0.7 }, { transform: "none" }];

/**
 * The tortoise and the rabbit beside Hear it again (NavLayer draws it; TEACHER_SCRIPT §9.6). Shown while the screen's
 * `speed` says so (and not `own`), or while rabbitTap() waits.
 */
function FastSlowBadges({ spec, anchor }: { spec: SpeedSpec | null; anchor: Anchor }) {
  useSyncExternalStore(fsSubscribe, () => fsVer);
  const shown = (!!spec && !spec.own) || fs.force;
  const [pl, setPl] = useState<FsPlace | null>(null);
  const plRef = useRef(pl);
  plRef.current = pl;
  const tMove = useRef<HTMLSpanElement>(null);
  const rMove = useRef<HTMLSpanElement>(null);
  const live = fs.live;
  useLayoutEffect(() => {
    fsShown = shown;
    const nav = (window as any).__snNav;
    if (nav) nav.speed = fsPublic();
    return () => void (fsShown = false);
  }, [shown]);
  // place the pair: when it shows, when the nav controls change, when the rabbit goes live; again once things settle
  const atKey = spec ? `${spec.at?.x},${spec.at?.y},${spec.liveAt?.x},${spec.liveAt?.y}` : "";
  useLayoutEffect(() => {
    if (!shown) return void (plRef.current && setPl(null));
    const run = () => {
      const np = fsPlace(spec, anchor);
      if (!samePlace(np, plRef.current)) setPl(np);
    };
    run();
    const t = window.setTimeout(run, 500);
    return () => clearTimeout(t);
  }, [shown, version, live, atKey, anchor]);
  useEffect(() => {
    if (!shown) return;
    const go = (el: Element | null, kf: Keyframe[], ms: number) => void el?.animate(kf, { duration: ms, easing: "ease-in-out" });
    fsView = {
      step: () => go(tMove.current, STEP_KF, 340),
      hop: () => go(rMove.current, HOP_KF, 440),
      wiggle: (k) => go(k === "tortoise" ? tMove.current : rMove.current, WIGGLE_KF, 420),
    };
    return () => void (fsView = null);
  }, [shown]);
  // a badge that moves (the rabbit growing into its live place and back, or the pair re-placed) hops there from where
  // it was: a FLIP on its move layer (transform only)
  const rp = pl ? (live ? pl.live : pl.r) : null, rd = pl ? (live ? FS_LIVE : pl.b) : 0;
  const was = useRef<{ t: Pt; r: Pt; b: number; rd: number } | null>(null);
  useLayoutEffect(() => {
    const prev = was.current;
    was.current = pl && rp ? { t: pl.t, r: rp, b: pl.b, rd } : null;
    if (!prev || !pl || !rp) return;
    const flip = (el: HTMLElement | null, from: Pt, to: Pt, fd: number, td: number) => {
      const dx = from.x - to.x, dy = from.y - to.y, s = fd / td;
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2 && Math.abs(s - 1) < 0.02) return;
      el?.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: `translate(${dx / 2}px, ${dy / 2 - 26}px) scale(${(1 + s) / 2})`, offset: 0.5 }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(0.3, 1.2, 0.5, 1)" });
    };
    flip(tMove.current, prev.t, pl.t, prev.b, pl.b);
    flip(rMove.current, prev.r, rp, prev.rd, rd);
  });
  if (!shown || !pl || !rp) return null;
  const box = (p: Pt, d: number): CSSProperties => ({ left: p.x - d / 2, top: p.y - d / 2, width: d, height: d });
  const tap = (k: "tortoise" | "rabbit") => () => {
    if (rabbitNow && fs.live) return k === "rabbit" ? rabbitNow.tap() : rabbitNow.tortoise();
    fsView?.wiggle(k);
  };
  const face = (k: "tortoise" | "rabbit", ref: RefObject<HTMLSpanElement | null>) => (
    <span className="fs-lift">
      <span className="fs-move" ref={ref}>
        <span className="fs-ring" />
        <span className="fs-face">
          <img src={img(k === "tortoise" ? "ui_tortoise" : "ui_rabbit")} alt="" draggable={false} />
        </span>
      </span>
    </span>
  );
  return (
    <div className="fs-badges">
      <div className={`fs-badge tortoise ${fs.lit === "slow" ? "lit" : ""}`} aria-hidden="true" data-fs="tortoise" style={box(pl.t, pl.b)} {...tapProps(tap("tortoise"))}>
        {face("tortoise", tMove)}
      </div>
      <div
        className={`fs-badge rabbit ${fs.lit === "fast" ? "lit" : ""} ${live ? "live" : ""} ${live && fs.glow ? "glow" : ""} ${live && fs.spot ? "spot" : ""}`}
        {...(live ? { role: "button", "aria-label": "The rabbit" } : { "aria-hidden": true })}
        data-fs="rabbit"
        style={box(rp, rd)}
        {...tapProps(tap("rabbit"))}
      >
        {face("rabbit", rMove)}
      </div>
    </div>
  );
}
