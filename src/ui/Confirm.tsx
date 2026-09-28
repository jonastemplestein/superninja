// The confirm (docs/CONFIRM.md §3): before a tap that costs something (an old stone on the map, Home in the middle of a
// level, a boss or a gem battle), Sensei asks, out loud, and the child answers with one of two big pictures.
//
//   const r = await confirmWith(QUESTIONS.leave({ pic: img(levelIcon) }));   // r.yes, r.how
//
// - The two answers are the map's pattern (CONFIRM §1.2, §2.3 rule 4): YES is a picture of where the tap goes (the
//   house, the World Flower, the old stone's own picture) in a quiet cream circle, on the left. NO is the game's green ▶,
//   "keep playing": bigger, on the right where Next always is, with the child's ninja beside it giving a thumbs up. So
//   the answer a pre-reader is drawn to (green, big, glowing, pointed at, their own ninja) is the one that costs nothing.
//   YES is 216 stage px (≥ 96 CSS px on the smallest phone we allow for), the ▶ 252. Each says itself as it is tapped.
// - NO is the safe answer: it leaves everything as it was. It pops in first, is named last, the pointing hand goes to
//   it, and so does waiting: after 40 s of quiet (game time) the question closes as NO. Nothing costly is ever picked by
//   waiting.
// - Home: under a question whose YES is where Home goes (`home: "yes"`: the leave questions) Home never answers; after
//   2.5 s it shows the way to YES (the hand on the house, and Sensei: "To go home, tap this house."), so a child who
//   wants to leave finds the house, and a child mashing Home never leaves. Otherwise (the map's question) Home is NO
//   after 2.5 s.
// - A tap that isn't on an answer (the backdrop, Sensei's face, her bubble) shows the way: the hand and the glow come
//   onto NO at once, and Sensei names the answers again if she is quiet (at most every 6 s). A wrong tap teaches the
//   right one, as on the map (MAP_DESIGN §2.7).
// - The idle ladder (docs/NAVIGATION.md §3.2): 8 s the ▶ glows and hops with the hand on it; 16 s Sensei asks again;
//   40 s it counts as NO. It waits while Sensei talks and while the phone is upright; any tap starts it again.
// - Mashing: taps on the answers in the first 700 game ms are ignored, and the answers are drawn away from where the tap
//   that opened the question landed (`from`), so a child tapping the same spot again hits the backdrop.
// - Sensei's bubble never shows the same picture as an answer (the map's question gives its stone's picture to YES, so
//   the bubble shows her "?"), and it is smaller than the answers: the biggest pictures are the ones that answer.
// - The screen underneath pauses: its speech waits at its next clip (audio.ts pauseSpeech, as when the phone is turned
//   upright; a clip that was cut off is said again after NO), lesson clocks stop, music ducks, and the nav layer shows
//   only Home over it (a modal entry). Scenes with their own timers read useConfirmOpen() (a battle's charge).
// - Sensei's own lines play outside the game's speech queue (like the turn-your-phone line), so they never wait on that
//   gate, never enter Hear it again's register, and a hush() from the screen can't cut them off.
// - Bots: while it is open window.__snState is { scene: "confirm", id, ready, safe: "no", home, point, ... } (the
//   screen's own state comes back when it closes); the answers are [data-confirm="yes"] and [data-confirm="no"]
//   (aria-label "Yes" / "No"); window.__snNavLog gets { kind: "step", id: "confirm:<id>", to: 0 } on opening and
//   { from: 0, to: null, via: how }.
//
// Mounting: App renders <ConfirmLayer/> once, after <NavLayer/> (docs/fix-requests.md). Until then, confirm() mounts one
// itself inside the stage, so it already works from any screen. Styles: src/styles/confirm.css.
import { useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { audioCtx, load, urls, hush as hushGame, pauseSpeech, sfxOver, setMusicVolume, settings as audioSettings, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { pauseLessonClock, resumeLessonClock } from "../engine/lessonClock";
import { useSave } from "../engine/store";
import { LINES } from "../content/lines";
import { wordAt as lineWordAt } from "../content/word-times";
import type { GameId } from "../content/games";
import { Icon, TapHint, img, useHero, pushHelp, isUpright, onUpright, stageXY } from "./ui";
import { useNav, navLog, ReplayButton } from "./nav";
import "../styles/confirm.css";

// ---------------------------------------------------------------- the API
/** How a question was answered: an answer tapped, Home (= no, where Home isn't YES), 40 s of quiet (= no), or `cancel`
 *  (another question replaced it, or cancelConfirm(): the screen changed underneath). */
export type ConfirmHow = "yes" | "no" | "home" | "timeout" | "cancel";
export interface ConfirmResult {
  yes: boolean;
  how: ConfirmHow;
}
/** Slot values for the templated speech (docs/speech-templates/inventory.md): once the template renderer lands, a
 *  question line with a {game} or {word} slot is filled from here. Today they are published in __snState for bots, and
 *  `word` gives the picture when `pic` is left out. */
export interface ConfirmSlots {
  game?: GameId;
  word?: string;
}
export interface ConfirmYes {
  /** The picture of where YES goes: an image URL or any node (<Icon.home/>, <Icon.tree/>). Default: the question's
   *  `pic` (and then Sensei's bubble shows "?"), else a tick. */
  pic?: string | ReactNode;
  /** Said as it is tapped (default tv_confirm_yes "Yes, please!"); null: nothing. */
  say?: Say[] | null;
  /** With `home: "yes"`, said when Home is tapped: the way to YES (default: the `how` line). */
  nudge?: Say[];
  /** The only look (a picture); kept so older calls (MAP_DESIGN §7) compile. */
  look?: "pic";
}
export interface ConfirmNo {
  /** Said as it is tapped (default tv_confirm_keep "Let's keep going!"); null: nothing. */
  say?: Say[] | null;
  /** The only look (the green ▶); kept so older calls (MAP_DESIGN §7) compile. */
  look?: "next";
}
export interface ConfirmOpts {
  /** Names the question for bots, the sweep and the log: "replay", "leave", "leave-boss", "leave-trial", … */
  id: string;
  /** Sensei's question: whole recorded lines (tv_confirm_leave …). A `{ word }` or `{ sound }` clip may follow a line. */
  ask: Say | Say[];
  /** Said after the question, naming the two answers by their pictures. Default tv_confirm_how_pic ("Tap the picture
   *  for yes. Or tap the green arrow to keep playing."); the presets name theirs (the house, the flower; the map's
   *  tv_map_replay_how). null: nothing. */
  how?: Say[] | null;
  /** The 16 s re-ask (default: the question and `how` again). */
  again?: Say[];
  /** The picture in Sensei's bubble: what the question is about (the level being left, the boss). Default: the picture
   *  of `slots.word`, else a big question mark. Never drawn twice: when YES shows the same picture, the bubble shows "?". */
  pic?: string | ReactNode;
  slots?: ConfirmSlots;
  yes?: ConfirmYes;
  no?: ConfirmNo;
  /** What Home means here. "no" (default): Home is NO once homeGuardMs has passed (the map's question: Home stays on
   *  the map). "yes": YES goes where Home goes (the leave questions), so Home never answers: after homeGuardMs it points
   *  at YES and says `yes.nudge`. */
  home?: "no" | "yes";
  /** Where the tap that opened the question landed (the tapped element, or a stage point): the answers are drawn where
   *  it wasn't (above or below the question), so the same tap again lands on the backdrop. */
  from?: Element | { x: number; y: number } | null;
  /** Game ms of quiet (not counting Sensei talking) before the question closes as NO. Default 40 000; null: never (it
   *  asks again at 40 s instead). */
  timeoutMs?: number | null;
  /** Game ms after opening in which taps on the answers are ignored. Default 700. */
  guardMs?: number;
  /** Game ms after opening in which Home is ignored. Default 2500: a child mashing Home doesn't open and close the
   *  question over and over, or get pointed at the house by the very taps that opened it. */
  homeGuardMs?: number;
}

/** Sensei asks; resolves true for YES, false for NO, Home, 40 s of quiet, or a cancel. */
export function confirm(o: ConfirmOpts): Promise<boolean> {
  return confirmWith(o).then((r) => r.yes);
}

// ---------------------------------------------------------------- the questions (CONFIRM §1.2, §3.3)
/** Home's centre, stage px: the leave questions are opened by Home, so their answers are drawn away from it. */
const HOME_AT = { x: 68, y: 66 };
const L = (line: string): Say[] => [{ line }];
/** A preset with the call site's own values on top (its `yes` and `no` merged into the preset's). */
const withOpts = (base: ConfirmOpts, o: Partial<ConfirmOpts> = {}): ConfirmOpts => ({ ...base, ...o, yes: { ...base.yes, ...o.yes }, no: { ...base.no, ...o.no } });
const leaving = (id: string, line: string): ConfirmOpts => ({
  id,
  ask: { line },
  how: L("tv_confirm_how_home"), // "Tap the house to go home. Or tap the green arrow to keep playing."
  home: "yes",
  from: HOME_AT,
  yes: { pic: <Icon.home />, say: L("tv_confirm_bye"), nudge: L("tv_confirm_home_nudge") },
});
/** The questions the game asks, as data: pass the call site's own values (the bubble's `pic`, `from`, `slots`). */
export const QUESTIONS = {
  /** A finished stone (CONFIRM row 1), without the map's own lines (MAP_DESIGN §7 has those): YES is the stone's picture
   *  (pass it as `pic`). */
  replay: (o?: Partial<ConfirmOpts>) => withOpts({ id: "replay", ask: { line: "tv_confirm_play_again" }, how: L("tv_confirm_how_pic") }, o),
  /** Home in a level after the first answer (rows 2 and 5): "Do you want to stop this game and go home?" */
  leave: (o?: Partial<ConfirmOpts>) => withOpts(leaving("leave", "tv_confirm_leave"), o),
  /** The same in a first-session lesson, whose Home goes to the title ("go home" fits both). */
  leaveFirst: (o?: Partial<ConfirmOpts>) => withOpts(leaving("leave-first", "tv_confirm_leave"), o),
  /** Home in a boss battle (row 5). */
  leaveBoss: (o?: Partial<ConfirmOpts>) => withOpts(leaving("leave-boss", "tv_confirm_leave_boss"), o),
  /** Home in a Gem Trial (row 4): YES is the World Flower, where its Home goes. */
  leaveTrial: (o?: Partial<ConfirmOpts>) =>
    withOpts(
      {
        id: "leave-trial",
        ask: { line: "tv_confirm_leave_trial" },
        how: L("tv_confirm_how_flower"), // "Tap the flower to stop for now. Or tap the green arrow to keep battling."
        home: "yes",
        from: HOME_AT,
        yes: { pic: <Icon.tree />, nudge: L("tv_confirm_flower_nudge") },
      },
      o,
    ),
};

// ---------------------------------------------------------------- layout (stage px, 1280×720)
/** YES's diameter: 216 stage px is 97 CSS px at a stage scale of 0.45 (a 360-dp-tall phone held landscape). */
export const ANSWER_D = 216;
/** The green ▶'s diameter: the safe answer is the bigger one. */
export const NEXT_D = 252;
const YES_X = 480; // YES on the left
const NO_X = 830; // the ▶ on the right, where Next lives (116 px of backdrop between the two)
const ANS_Y = { low: 540, high: 206 } as const;
const ASK_Y = { low: 196, high: 522 } as const; // the question row: Sensei's face, the bubble, the speaker
type Layout = keyof typeof ANS_Y;
const FACE = { x: 400, d: 168 };
const BUBBLE = { x: 680, w: 300, h: 210 };
const SPEAKER = { x: 930, d: 100 };
const NINJA_W = 150;

/** Where the two answers sit. */
function slots(layout: Layout) {
  const y = ANS_Y[layout];
  return { yes: { x: YES_X, y }, no: { x: NO_X, y } };
}
/** The layout whose nearest answer is farthest from the opening tap (low, with the answers below, when it's a tie). */
export function pickLayout(_o: ConfirmOpts, at: { x: number; y: number } | null): Layout {
  if (!at) return "low";
  const clear = (l: Layout) => {
    const s = slots(l);
    return Math.min(Math.hypot(s.yes.x - at.x, s.yes.y - at.y) - ANSWER_D / 2, Math.hypot(s.no.x - at.x, s.no.y - at.y) - NEXT_D / 2);
  };
  return clear("high") > clear("low") + 1 ? "high" : "low";
}
/** The pictures drawn: YES's, and the bubble's (null: Sensei's "?"). The same picture is never drawn twice. */
export function pictures(o: ConfirmOpts): { yes: string | ReactNode | null; bubble: string | ReactNode | null } {
  const q = o.pic ?? (o.slots?.word ? img(`pic_${o.slots.word}`) : null);
  const yes = o.yes?.pic ?? q;
  return { yes, bubble: q != null && q !== yes ? q : null };
}

// ---------------------------------------------------------------- the world it touches (tests replace these)
/** Sensei's voice outside the game's speech queue: each clip straight to the output, in order (a line, a word, a sound,
 *  a gap). Resolves false if stopped. */
let voiceToken = 0;
let voiceSrc: AudioBufferSourceNode | null = null;
function clipUrl(it: Say): string | null {
  if ("line" in it) return urls.line(it.line);
  if ("word" in it) return urls.word(it.word);
  if ("sound" in it) return urls.sound(it.sound);
  return null;
}
async function voice(items: Say[], onClip?: (id: string, ms: number) => void): Promise<boolean> {
  const my = ++voiceToken;
  const bufs = items.map((it) => {
    const u = clipUrl(it);
    return u ? load(u) : Promise.resolve(null);
  });
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (my !== voiceToken) return false;
    if ("gap" in it && !("sounds" in it)) {
      await new Promise((r) => setTimeout(r, it.gap));
      continue;
    }
    const buf = await bufs[i];
    if (my !== voiceToken) return false;
    if (!buf) continue;
    await new Promise<void>((resolve) => {
      const c = audioCtx();
      const src = c.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = FAST;
      src.connect(c.destination);
      const done = () => (clearTimeout(guard), voiceSrc === src && (voiceSrc = null), resolve());
      // never hang on a suspended context (no gesture yet): time out after the clip's length (setTimeout is game time)
      const guard = setTimeout(done, buf.duration * 1000 + 250);
      src.onended = done;
      voiceSrc = src;
      src.start();
      ((window as any).__audioLog as unknown[] | undefined)?.push({ t: Date.now(), url: clipUrl(it), kind: "speech", confirm: true });
      if ("line" in it) onClip?.(it.line, (buf.duration * 1000) / FAST);
    });
  }
  return my === voiceToken;
}
function hushVoice() {
  voiceToken++;
  try {
    voiceSrc?.stop();
  } catch {}
  voiceSrc = null;
}
let musicWas: number | null = null;
/** What the confirm does to the world. Production values; confirm.test.ts swaps in fakes. */
export const confirmEnv = {
  /** game ms */
  now: () => performance.now() * FAST,
  /** Sensei's voice (see voice()): resolves false if stopped; `onClip(line, realMs)` as each line starts */
  say: (items: Say[], onClip?: (id: string, ms: number) => void): Promise<boolean> => voice(items, onClip),
  hush: () => hushVoice(),
  /** drop the screen's own speech (YES: the screen is being left, so a line waiting at the gate is never said) */
  drop: () => hushGame(),
  /** the screen underneath: its speech waits at its next clip, lesson clocks stop, music ducks */
  pause: (on: boolean) => {
    // (while the phone is upright the turn-your-phone prompt holds the gate, and opens it when it goes)
    if (on || !isUpright()) pauseSpeech(on);
    if (on) {
      pauseLessonClock();
      musicWas = audioSettings.music;
      setMusicVolume(musicWas * 0.35);
    } else {
      resumeLessonClock();
      if (musicWas != null) setMusicVolume(musicWas);
      musicWas = null;
    }
  },
  sfx: (name: string) => {
    try {
      sfxOver(name);
    } catch {}
  },
  upright: () => isUpright(),
  onUpright: (f: () => void) => onUpright(f),
  /** make sure a ConfirmLayer is mounted */
  mount: () => ensureLayer(),
  /** the idle ladder's first two steps, game ms of quiet: the glow and the hand, then the question again */
  idle: [8000, 16000] as [number, number],
  /** game ms between two "show the way" lines after taps off the answers, and between two Home nudges */
  showGapMs: 6000,
  nudgeGapMs: 4000,
};

// ---------------------------------------------------------------- the question on screen
type Where = "face" | "bubble" | "backdrop";
interface Q {
  seq: number;
  o: ConfirmOpts;
  layout: Layout;
  t0: number;
  /** past the guard: taps count */
  ready: boolean;
  /** Sensei is talking */
  talking: boolean;
  /** the answer the hand points at and that glows and hops: NO on the ladder, Help and taps off the answers; YES on a
   *  Home tap under a `home: "yes"` question */
  point: "yes" | "no" | null;
  spot: "yes" | "no" | null;
  chosen: "yes" | "no" | null;
  closing: boolean;
  over: boolean;
  helpN: number;
  promise: Promise<ConfirmResult>;
  tap(which: "yes" | "no" | "home"): boolean;
  replay(): Promise<unknown>;
  help(): void;
  /** a tap off the answers (Sensei's face, her bubble, the backdrop): the way to NO */
  show(where: Where): void;
  finish(how: ConfirmHow): void;
}
let cur: Q | null = null;
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
const openSubs = new Set<(open: boolean) => void>();

const LINE_TEXT = new Map(LINES.map((l) => [l.id, l.text]));
const asList = (s: Say | Say[]): Say[] => (Array.isArray(s) ? s : [s]);
const howOf = (o: ConfirmOpts): Say[] => (o.how === undefined ? L("tv_confirm_how_pic") : o.how ?? []);
const askOf = (o: ConfirmOpts): Say[] => {
  const how = howOf(o);
  return [...asList(o.ask), ...(how.length ? [{ gap: 250 }, ...how] : [])];
};
const againOf = (o: ConfirmOpts): Say[] => o.again ?? askOf(o);
/** The words that name each answer in a line ("Tap the house to go home. Or tap the green arrow…"): each answer is
 *  spotlit as it is named. */
const NAMES = { yes: ["picture", "house", "flower", "book", "tick"], no: ["arrow"] } as const;

/** When `words` is first said in line `id`, in real ms from the clip's start: measured (content/word-times.ts) if the
 *  line has timings, else estimated from its text (letters, with a pause at each full stop or comma), as nav.tsx does. */
function wordMs(id: string, words: readonly string[], durMs: number): number | null {
  const text = LINE_TEXT.get(id);
  if (!text) return null;
  const toks = text.split(/\s+/).filter(Boolean);
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z']/g, "");
  const i = toks.findIndex((t) => words.includes(norm(t)));
  if (i < 0) return null;
  const measured = lineWordAt(id, norm(toks[i]));
  if (measured !== undefined) return (measured * 1000) / FAST;
  const weight = (t: string) => t.replace(/[^A-Za-z']/g, "").length + (/[.!?…]$/.test(t) ? 7 : /[,;:]$/.test(t) ? 3 : 1);
  const all = toks.reduce((n, t) => n + weight(t), 0);
  const before = toks.slice(0, i).reduce((n, t) => n + weight(t), 0);
  return all ? (durMs * before) / all : null;
}

/** window.__snState while a question is up: the screen's own value is kept and comes back when it closes (a scene that
 *  re-renders meanwhile writes to the kept value, not over the question). */
function holdState(pub: () => Record<string, unknown>): () => void {
  const w = window as any;
  let under = w.__snState;
  try {
    Object.defineProperty(w, "__snState", { configurable: true, enumerable: true, get: pub, set: (v) => void (under = v) });
  } catch {
    return () => {};
  }
  return () => {
    delete w.__snState;
    w.__snState = under;
  };
}

/** Sensei asks. Resolves once the question is answered (after the answer has said itself) with YES or NO and how. The
 *  same question asked again while it is up (a double tap) gets the same answer; a different one replaces it (the old
 *  one resolves `cancel`). */
export function confirmWith(o: ConfirmOpts): Promise<ConfirmResult> {
  const env = confirmEnv;
  if (cur && !cur.over && !cur.chosen && cur.o.id === o.id) return cur.promise;
  if (cur && !cur.over) cur.finish(cur.chosen ?? "cancel"); // (one being answered keeps its answer)
  env.mount();
  const at = o.from == null ? null : "x" in o.from && typeof (o.from as { x: unknown }).x === "number" ? (o.from as { x: number; y: number }) : stageXY(o.from as Element);
  const guardMs = o.guardMs ?? 700;
  const homeGuardMs = o.homeGuardMs ?? Math.max(guardMs, 2500);
  const endMs = o.timeoutMs === null ? null : o.timeoutMs ?? 40_000;
  let resolveP!: (r: ConfirmResult) => void;
  const promise = new Promise<ConfirmResult>((r) => (resolveP = r));
  const timers = new Set<number>();
  const later = (ms: number, f: () => void) => {
    const t = window.setTimeout(() => (timers.delete(t), f()), ms);
    timers.add(t);
    return t;
  };
  const q: Q = {
    seq: ++seqN,
    o,
    layout: pickLayout(o, at),
    t0: env.now(),
    ready: guardMs <= 0,
    talking: false,
    point: null,
    spot: null,
    chosen: null,
    closing: false,
    over: false,
    helpN: 0,
    promise,
    tap,
    replay: () => speak(askOf(o)),
    help,
    show,
    finish,
  };
  const id = `confirm:${o.id}`;
  const open = () => !q.over && !q.chosen;
  const setPoint = (p: Q["point"]) => {
    if (q.point !== p) {
      q.point = p;
      bump();
    }
  };

  // Sensei's voice, with the spotlight on each answer as it is named
  let spotN = 0;
  const spotOn = (k: "yes" | "no", realMs: number) =>
    later(Math.max(0, realMs) * FAST, () => {
      if (!open()) return;
      const my = ++spotN;
      q.spot = k;
      bump();
      later(1400, () => my === spotN && ((q.spot = null), bump()));
    });
  const onClip = (line: string, durMs: number) => {
    const yesAt = wordMs(line, NAMES.yes, durMs);
    const noAt = wordMs(line, NAMES.no, durMs);
    if (yesAt != null) spotOn("yes", yesAt);
    if (noAt != null) spotOn("no", noAt);
  };
  let sayN = 0;
  /** a Home nudge that came while Sensei was talking: said when she stops, if the hand is still on YES */
  let nudgeDue = false;
  function speak(items: Say[]): Promise<boolean> {
    if (q.over) return Promise.resolve(false);
    const my = ++sayN;
    q.talking = true;
    bump();
    lad.sync();
    return env.say(items, onClip).then((ok) => {
      if (my === sayN) {
        q.talking = false;
        bump();
        lad.sync();
        if (nudgeDue && open()) {
          nudgeDue = false;
          if (q.point === "yes") sayNudge();
        }
      }
      return ok;
    });
  }

  // the idle ladder, in game ms of quiet (Sensei not talking, the phone not upright): the glow and the hand on NO, the
  // question again, then NO. Counted from timestamps; one timeout sleeps until the next step (no polling, no frames)
  const [glowAt, againAt] = env.idle;
  const steps = [glowAt, againAt].filter((s) => endMs == null || s < endMs);
  const last = endMs ?? 40_000;
  steps.push(last);
  const lad = (() => {
    let idle = 0, from = 0, step = 0, t = 0;
    const quiet = () => !q.talking && !env.upright();
    const fire = (k: number) => {
      const ms = steps[k];
      if (ms === last && endMs != null) return finish("timeout");
      if (ms >= againAt) void speak(againOf(o)); // 16 s, and 40 s when it never times out
      setPoint("no");
    };
    const sync = () => {
      if (q.over) return;
      if (from) idle += env.now() - from;
      from = 0;
      clearTimeout(t);
      while (step < steps.length && idle >= steps[step] - 5 && !q.over) fire(step++);
      if (!q.over && step < steps.length && quiet()) {
        from = env.now();
        t = window.setTimeout(sync, steps[step] - idle);
      }
    };
    const reset = () => {
      if (q.over) return;
      idle = 0;
      from = 0;
      step = 0;
      nudgeDue = false;
      setPoint(null);
      sync();
    };
    return { sync, reset, stop: () => clearTimeout(t) };
  })();
  // any finger down anywhere starts the ladder again (capture: before the tapped thing's own handler)
  const onDown = () => lad.reset();

  let showSaidAt = -Infinity;
  /** a tap off the answers: the hand and the glow onto NO; the answers named again if she's quiet (at most every 6 s) */
  function show(where: Where) {
    if (!open() || env.now() - q.t0 < guardMs) return;
    setPoint("no");
    if (q.talking || env.now() - showSaidAt < env.showGapMs) return;
    showSaidAt = env.now();
    const how = howOf(o);
    void speak(where === "face" || !how.length ? askOf(o) : how);
  }
  let nudgeSaidAt = -Infinity;
  function sayNudge() {
    if (env.now() - nudgeSaidAt < env.nudgeGapMs) return;
    nudgeSaidAt = env.now();
    void speak(o.yes?.nudge ?? howOf(o));
  }

  function tap(which: "yes" | "no" | "home"): boolean {
    if (!open()) return false;
    const since = env.now() - q.t0;
    if (which === "home") {
      if (since < homeGuardMs) return false; // the tap that opened it, or a mash
      if (o.home !== "yes") {
        finish("home");
        return true;
      }
      // YES goes where Home goes: show the way to it (never answer: a mash on Home can't leave)
      setPoint("yes");
      if (q.talking) nudgeDue = true;
      else sayNudge();
      return true;
    }
    if (since < guardMs) return false;
    q.chosen = which;
    q.point = null;
    q.spot = null;
    nudgeDue = false;
    bump();
    lad.stop();
    env.sfx("tap");
    const line = o[which]?.say === undefined ? L(which === "yes" ? "tv_confirm_yes" : "tv_confirm_keep") : o[which]!.say;
    const said = line && line.length ? speak(line) : Promise.resolve(true);
    // the answer says itself before the screen moves on (at most 2 s)
    void Promise.race([said, new Promise((r) => later(2000, () => r(false)))]).then(() => finish(which));
    return true;
  }
  function help() {
    if (!open() || env.now() - q.t0 < guardMs) return;
    q.helpN++;
    if (q.helpN === 1) return void speak(askOf(o));
    setPoint("no");
    void speak(againOf(o));
  }
  const popHelp = pushHelp(() => help());
  const releaseState = holdState(() => ({
    scene: "confirm",
    id: o.id,
    ready: q.ready && open(),
    safe: "no",
    home: o.home ?? "no",
    point: q.point,
    yes: "Yes",
    no: "No",
    layout: q.layout,
    slots: o.slots ?? null,
    chosen: q.chosen,
  }));
  // the phone turned upright: Sensei stops (the turn-your-phone prompt speaks); turned back, the question again. The
  // prompt opens the game's speech gate when it goes, so it is shut again straight after
  let wasUpright = env.upright();
  const offUpright = env.onUpright(() => {
    const up = env.upright();
    if (up === wasUpright) return;
    wasUpright = up;
    if (up) {
      sayN++;
      env.hush();
      q.talking = false;
      lad.sync();
    } else {
      for (const ms of [0, 60]) later(ms, () => !q.over && pauseSpeechAgain());
      later(700, () => open() && void speak(askOf(o)));
    }
  });
  const pauseSpeechAgain = () => {
    try {
      pauseSpeech(true);
    } catch {}
  };

  function finish(how: ConfirmHow) {
    if (q.over) return;
    q.over = true;
    q.closing = true;
    lad.stop();
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    window.removeEventListener?.("pointerdown", onDown, true);
    offUpright();
    popHelp();
    releaseState();
    if (how !== "yes" && how !== "no") {
      sayN++;
      env.hush();
    }
    if (how === "yes") env.drop();
    env.pause(false);
    navLog({ kind: "step", id, from: 0, to: null, via: how });
    openSubs.forEach((f) => f(false));
    bump();
    // the layer fades out (180 ms), then goes; the answer is given at once
    window.setTimeout(() => {
      if (cur === q) {
        cur = null;
        bump();
      }
    }, 180);
    resolveP({ yes: how === "yes", how });
  }

  cur = q;
  env.pause(true);
  window.addEventListener?.("pointerdown", onDown, true);
  if (!q.ready) later(guardMs, () => ((q.ready = true), bump()));
  navLog({ kind: "step", id, from: null, to: 0 });
  openSubs.forEach((f) => f(true));
  bump();
  env.sfx("pop");
  void speak(askOf(o));
  return promise;
}

/** The question on screen now (bots, tests, a scene's own button): its id, whether it takes answers yet, what the hand
 *  points at, a tap on an answer or Home as the buttons do (false if ignored: the guard), and a tap off the answers.
 *  Null when none is up, or once it is answered. */
export function confirmNow(): { id: string; ready: boolean; point: "yes" | "no" | null; tap(which: "yes" | "no" | "home"): boolean; show(where: Where): void } | null {
  const q = cur;
  if (!q || q.over || q.chosen) return null;
  return { id: q.o.id, ready: q.ready, point: q.point, tap: (w) => q.tap(w), show: (w) => q.show(w) };
}
/** Close the question as `cancel` (resolves false). App calls it when the route changes. */
export function cancelConfirm() {
  if (cur && !cur.over) cur.finish("cancel");
}
/** Is a question up? (A scene's timers: a battle's charge waits while it is.) */
export const isConfirmOpen = () => !!cur && !cur.over;
/** Hear a question open or close. Returns an unsubscribe function. */
export function onConfirmOpen(fn: (open: boolean) => void): () => void {
  openSubs.add(fn);
  return () => void openSubs.delete(fn);
}
/** True while a question is up (re-renders on open and close). */
export function useConfirmOpen(): boolean {
  return useSyncExternalStore(subscribe, isConfirmOpen);
}

// ---------------------------------------------------------------- the layer
let layers = 0;
let autoHost: HTMLElement | null = null;
/** A ConfirmLayer inside the stage if App hasn't mounted one (so confirm() works from any screen already). */
function ensureLayer() {
  if (layers > 0 || autoHost || typeof document === "undefined" || !document.querySelector) return;
  const stage = document.querySelector(".stage");
  if (!stage) return;
  autoHost = document.createElement("div");
  autoHost.className = "cf-host";
  stage.appendChild(autoHost);
  createRoot(autoHost).render(<ConfirmLayer auto />);
}

/** Draws the question that is up, if any. Render once, inside the Stage, after <NavLayer/>. (`auto`: the one confirm()
 *  mounted itself, which steps aside once App mounts its own.) */
export function ConfirmLayer({ auto = false }: { auto?: boolean }) {
  useSyncExternalStore(subscribe, () => version);
  useEffect(() => {
    if (auto) return;
    layers++;
    bump();
    return () => void layers--;
  }, []);
  const q = cur;
  if (!q || (auto && layers > 0)) return null;
  return <ConfirmView key={q.seq} q={q} />;
}

/** A tap on the dimmed Help button (Sensei's corner, HERO.md's Help zone x 1116–1280, y 556–720) is Help. */
function inHelpZone(e: { clientX: number; clientY: number; currentTarget: Element }): boolean {
  const r = e.currentTarget.getBoundingClientRect();
  const k = r.width / 1280;
  return (e.clientX - r.left) / k >= 1116 && (e.clientY - r.top) / k >= 556;
}
const at = (x: number, y: number, w: number, h = w): CSSProperties => ({ left: x - w / 2, top: y - h / 2, width: w, height: h });
const picNode = (p: string | ReactNode, cls: string) => (typeof p === "string" ? <img className={cls} src={p} alt="" draggable={false} /> : <span className={cls}>{p}</span>);

function ConfirmView({ q }: { q: Q }) {
  const { o } = q;
  const hero = useHero();
  const captions = useSave((s) => s.settings.captions);
  // a modal nav entry: the screen's own Back, Hear it again, paw and Next go; Home stays on top (NO, or the way to YES)
  useNav({ modal: true, home: () => void q.tap("home"), again: () => q.replay(), againAt: "own", back: null, show: null, sound: null, next: null });
  const [shown, setShown] = useState(false); // the thumbs-up ninja pops in once the answers have
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 260);
    return () => clearTimeout(t);
  }, []);
  const s = slots(q.layout);
  const askY = ASK_Y[q.layout];
  const pics = pictures(o);
  const cap = captions ? askOf(o).flatMap((it) => ("line" in it && LINE_TEXT.get(it.line) ? [LINE_TEXT.get(it.line)!] : [])).join(" ") : "";
  const cls = ["cf-root", q.closing && "closing", q.point && `point-${q.point}`, q.chosen && `chose chose-${q.chosen}`, !q.ready && "guard", q.layout].filter(Boolean).join(" ");
  const off = (where: Where) => (e: { preventDefault(): void; button?: number }) => {
    if ((e.button ?? 0) > 0) return;
    e.preventDefault();
    q.show(where);
  };
  const answer = (k: "yes" | "no") => {
    const p = s[k];
    const d = k === "no" ? NEXT_D : ANSWER_D;
    return (
      <div key={k} className={`cf-ans ${k} ${q.spot === k ? "spot" : ""} ${q.chosen === k ? "picked" : ""}`} style={at(p.x, p.y, d)}>
        <div className="cf-bob">
          <button
            className={`cf-btn ${k === "no" ? "next" : "pic"}`}
            data-confirm={k}
            aria-label={k === "yes" ? "Yes" : "No"}
            onPointerDown={(e) => {
              if (e.button > 0) return;
              e.preventDefault();
              e.stopPropagation();
              q.tap(k);
            }}
            onClick={(e) => e.detail === 0 && q.tap(k)}
          >
            {k === "no" ? <Icon.next /> : pics.yes != null ? picNode(pics.yes, "cf-btn-pic") : <TickIcon />}
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className={cls} role="dialog" aria-modal="true" aria-label="Sensei is asking" data-modal data-confirm-id={o.id} data-point={q.point ?? ""}>
      {/* the backdrop: a tap never answers; it shows the way (the dimmed Help corner is Help) */}
      <div className="cf-dim" onPointerDown={(e) => (e.preventDefault(), inHelpZone(e) ? q.help() : q.show("backdrop"))} />
      <button className={`cf-face ${q.talking ? "talking" : ""}`} aria-label="Sensei" style={at(FACE.x, askY, FACE.d)} onPointerDown={off("face")} onClick={(e) => e.detail === 0 && q.show("face")}>
        <img src={img("sensei_mouth_base")} alt="" draggable={false} />
        <img className="cf-m cf-m1" src={img("sensei_mouth_ah")} alt="" draggable={false} />
        <img className="cf-m cf-m2" src={img("sensei_mouth_oh")} alt="" draggable={false} />
      </button>
      <div className="cf-bubble" data-confirm-bubble style={at(BUBBLE.x, askY, BUBBLE.w, BUBBLE.h)} onPointerDown={off("bubble")}>
        {pics.bubble != null ? picNode(pics.bubble, "cf-pic") : <span className="cf-q">?</span>}
        {cap && <span className="cf-cap">{cap}</span>}
      </div>
      <ReplayButton layer onReplay={() => q.replay()} size={SPEAKER.d} className="cf-speaker" style={{ position: "absolute", ...at(SPEAKER.x, askY, SPEAKER.d) }} />
      {answer("no")}
      {answer("yes")}
      {shown && (
        <img className="cf-ninja" src={img(`hero_${hero}_thumbsup`)} alt="" draggable={false} style={{ left: s.no.x + NEXT_D / 2 + 4, top: s.no.y + NEXT_D / 2 + 14 - NINJA_W * 1.43, width: NINJA_W }} />
      )}
      {/* the pointing hand (its fingertip just below the answer's centre): NO on the ladder, Help and taps off the
          answers; YES on Home under a leave question */}
      {q.point && !q.chosen && <TapHint show style={{ left: s[q.point].x - 53 + 34, top: s[q.point].y - 20 + 40, zIndex: 3 }} />}
    </div>
  );
}

// the fallback picture for a YES with none: a gold tick, drawn twice (ink under gold) so it reads on the cream circle
// (never green: green is the ▶, the safe answer)
function TickIcon() {
  const d = "M14 34l12 12 25-28";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d={d} fill="none" stroke="#2b1d14" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#ffc53d" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
