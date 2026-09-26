// The warm-ups (docs/FIRST_MINUTES.md §5, §7, §9, §10): EarsLevel (Ninja Ears) and PicReadLevel (Ninjas Read This
// Way). The lesson scripts are data (src/content/warmups.ts); this scene plays them beat by beat.
//
// Every game type opens with "Let me show you!": Sensei names what's there, the paw taps one item and the ninja moves,
// and the child only watches. Then "Now you try!" (the Amendment). Rules for every beat (§3):
//   · every picture is named aloud when it first appears, with its card spotlit (a warm-white ring, never gold);
//   · a tap while Sensei is naming spotlights that card (and says its word when she has finished); a tap during a
//     question is an answer, and cuts her off;
//   · idle: 8 s → the answer glows and Sensei asks again; 16 s → the paw points at it and waits (it never answers);
//     then the question every 12 s, three times, then quiet (docs/NAVIGATION.md rule 5: no timer ever moves on);
//   · mistakes are errorless: the card wobbles and says its own word ("mmmoon… Moon starts with a different sound."),
//     then "Listen again." + the question; a second miss: the answer glows, "It's this one!". Nothing is re-queued;
//   · Help: once → the question again; twice → the answer glows; three times → the paw points at it (and waits);
//   · navigation (docs/NAVIGATION.md): Home top-left (the nav layer's); Hear it again (the speaker, nav row) replays
//     this turn's bundle: what Sensei said in this beat that the child needs (the naming, an explanation) and the
//     question, never an older question; it is dim while Sensei is still talking. Show me again (the paw) replays the
//     demo that led into this turn and never answers. The sound picture (the petal) shows while a beat is about a
//     sound. Where a show ends and the next beat starts with another show, the lesson holds on Next (holdNext);
//   · the ninja's move is the praise: Sensei adds a praise line at most every third right answer;
//   · lesson beads (top-centre) instead of a progress bar, with a sticker as the last bead;
//   · the time governor: an optional beat (and the which-did-I-read demo) is skipped when the lesson is behind its
//     target clock (time at a held Next and on replays doesn't count); at the hard cap the answers glow and the child's
//     turn waits for their first tap; then the paw finishes the beat ("Here's the last one!" only when exactly one
//     answer is left) and the lesson closes;
//   · the streak: only real choices between pictures count, and in the warm-ups a tier-up powers the ninja up without
//     a spoken line (the first streak is explained in the first lesson where the child reads or spells).
// Layout (docs/HERO.md): the ninja bottom-left, Help bottom-right, everything to tap in the play area x 340–1110.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import { say, sfx, hush, isSpeaking, preload, urls, nextClip, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { store, noteAttempt } from "../engine/store";
import { streak } from "../engine/streak";
import { pickPraise } from "../engine/feedback";
import {
  warmupScript, skipOptional, skipDemo, overCap, beadsOf, showLine, tryLine, nameLine, diffLine, onset, stretch, plain, canStretch,
  segsOf, WORD_TIMES, hasLine, type Beat, type Which,
} from "../content/warmups";
import { img, fx, sleep, tapProps, useHelp, TapHint, Tile, stageRect, stageXY } from "../ui/ui";
import { ninja } from "../ui/Ninja";
import {
  Frame, PicCard, LIVING, rightAnswer, afterLanding, useLevelAudio, gift, cornerOf,
  launch, crossesTier, moveNinja, PLAY_CX, TurnNav, type CardState, type Spec,
} from "./Early";
import { heard, isDue } from "./narrate";
import { useHome, holdNext } from "../ui/nav";
import { lessonPausedMs } from "../engine/lessonClock";
import type { PhonemeId } from "../content/phonics";
import "../styles/warmup.css";
import "../styles/nav-C.css";

// ---------------------------------------------------------------- what is on screen
interface CardView {
  w: string;
  x: number; // stage centre
  y: number;
  size: number; // the plate
  gutter?: number;
  state?: CardState;
  /** leaving (shrinks and fades away), or not arrived yet */
  out?: boolean;
  /** the elastic stretch (slow) or the hop (fast) on the fast/slow stage */
  fx?: "" | "stretch" | "hop" | "zip" | "joy";
  fxMs?: number;
  /** sound dots under the card (notice): how many, and which swell to gold */
  dots?: { n: number; gold: number[] };
  /** sound lines under the card (Reception): one per sound, with the spellings written so far */
  lines?: { n: number; show: { i: number; g: string }[] };
  /** a light under it (the reading rail) */
  lit?: boolean;
  /** gliding into or out of a merge: not tappable for that moment */
  moving?: boolean;
  key?: string;
}
type Btn = "" | "pulse" | "flash" | "glow" | "dim" | "wrong";
interface View {
  cards: CardView[];
  spot: string | null;
  /** the tortoise (slow) and rabbit (fast) buttons */
  speed: null | { tortoise: Btn; rabbit: Btn; at: "stage" | "rail" };
  /** the sound ribbon under the fast/slow card */
  ribbon: null | { mode: "idle" | "zip" | "draw"; ms: number; dots: number; shown: number; pulse: number };
  pockets: null | { n: number; filled: string[] };
  rail: null | { arrow: "" | "glow" | "pulse"; light: number | null };
  rails: null | { rows: string[][]; state: Btn[]; light: [number, number] | null };
  dots: null | { word: string; n: number; tapped: number; lit: number; sweep: boolean; wrong: number };
  /** the paw on its way to tap something (a demo) */
  paw: { x: number; y: number } | null;
  /** the paw pointing at the answer and waiting (idle help, Help's third press): it never taps */
  point: { x: number; y: number } | null;
  /** Hear it again is on screen (from the first question on) */
  speaker: boolean;
  /** the sound this beat is about: its sound picture sits beside Hear it again (docs/NAVIGATION.md §4) */
  sound: PhonemeId | null;
  lit: number; // beads lit
  burst: boolean; // the sticker bead bursts
}
const EMPTY: View = { cards: [], spot: null, speed: null, ribbon: null, pockets: null, rail: null, rails: null, dots: null, paw: null, point: null, speaker: false, sound: null, lit: 0, burst: false };
type Live = () => boolean;

// ---------------------------------------------------------------- layouts (stage px; the play area is x 340–1110)
const G = 20;
function row(ws: string[], size = 210, cy = 300, gap = 0, gutter = G): CardView[] {
  const el = size + 2 * gutter;
  const total = ws.length * el + (ws.length - 1) * gap;
  const x0 = PLAY_CX - total / 2 + el / 2;
  return ws.map((w, i) => ({ w, x: x0 + i * (el + gap), y: cy, size, gutter }));
}
/** a grid of 4–6 cards (3 across), left of the pockets */
function grid(ws: string[]): CardView[] {
  const size = 180, gutter = 16, el = size + 2 * gutter, cx = PLAY_CX - 62;
  const rows = ws.length <= 4 ? [ws.slice(0, 2), ws.slice(2)] : [ws.slice(0, 3), ws.slice(3)];
  return rows.flatMap((r, ri) => r.map((w, i) => ({ w, x: cx + (i - (r.length - 1) / 2) * el, y: 202 + ri * el, size, gutter })));
}
const RAIL_Y = 520;
/** pictures standing on the reading rail, left to right */
function onRail(ws: string[]): CardView[] {
  const size = ws.length >= 3 ? 196 : 230, gutter = G, gap = ws.length >= 3 ? 16 : 40;
  return row(ws, size, RAIL_Y - 12 - size / 2, gap, gutter);
}
const STAGE = { x: PLAY_CX, y: 280, size: 290 };

// ---------------------------------------------------------------- the scene
/** Ninja Ears (warm-up W1, W3, W5) and Ninjas Read This Way (W2, W4, W6): one player for both kinds. */
export function WarmupLevel({ level, onDone, onQuit }: LevelProps) {
  const band = store.get().band;
  const [script] = useState(() => warmupScript(level.warmup ?? "W1", band));
  const beads = beadsOf(script.beats);
  const [view, setView] = useState<View>(EMPTY);
  const viewRef = useRef(view);
  const patch = (p: Partial<View> | ((v: View) => Partial<View>)) => {
    const next = { ...viewRef.current, ...(typeof p === "function" ? p(viewRef.current) : p) };
    viewRef.current = next;
    setView(next);
  };
  const setCards = (f: (cs: CardView[]) => CardView[]) => patch((v) => ({ cards: f(v.cards) }));
  // cards that have left are removed once their exit has played (so no two cards share a name on screen for long)
  useEffect(() => {
    const gone = view.cards.filter((c) => c.out);
    if (!gone.length) return;
    const t = setTimeout(() => patch((v) => ({ cards: v.cards.filter((c) => !gone.includes(c)) })), 650);
    return () => clearTimeout(t);
  }, [view.cards]);
  const setCard = (w: string, p: Partial<CardView>) => setCards((cs) => cs.map((c) => (c.w === w ? { ...c, ...p } : c)));
  const [beatKind, setBeatKind] = useState<string>("");
  const alive = useRef(true);
  const isAlive: Live = () => alive.current;
  useLevelAudio();
  useHome(onQuit);

  // ---- Hear it again (docs/NAVIGATION.md §3.5): this beat's bundle, what Sensei has said in it that the child needs
  // (the naming of new pictures, the game's introduction, an explanation), said with told(); Hear it again says it and
  // then the question being asked. It starts again at each beat (and at each item of a many-item game), so it never
  // replays an older question. Feedback (praise, "Listen again", corrections) is said with plain say().
  const bundle = useRef<Say[]>([]);
  const told = (x: Say | Say[]) => {
    const l = Array.isArray(x) ? x : [x];
    bundle.current = bundle.current.length ? [...bundle.current, { gap: 300 }, ...l] : [...l];
    return say(l);
  };
  const clearTold = () => void (bundle.current = []);
  const again = () => {
    const p = pending.current;
    const q = p && !p.done ? p.prompt : prompt.current;
    return say([...bundle.current, ...(bundle.current.length && q.length ? [{ gap: 350 }] : []), ...q]);
  };
  /** A hold covers the lesson (holdNext): its controls are the nav layer's, so the lesson's own are hidden. */
  const [holding, setHolding] = useState(false);

  // ---- asking (the child's turn)
  interface Pending {
    answers: () => string[];
    prompt: Say[];
    resolve: (r: { id: string; el: Element | null; auto: boolean }) => void;
    onWrong?: (id: string, el: Element | null) => Promise<void>;
    /** taps on these are ignored (e.g. the dots already tapped) */
    ignore?: (id: string) => boolean;
    glowAfterMs?: number;
    busy: boolean;
    done: boolean;
    /** the question has been said in full (bots that model a child answer ~1.2 s after this) */
    asked?: boolean;
    timers: number[];
  }
  const pending = useRef<Pending | null>(null);
  const [askN, setAskN] = useState(0);
  const prompt = useRef<Say[]>([]);
  const capped = useRef(false);
  const t0 = useRef(0);
  const p0 = useRef(0);
  // lesson seconds (game time), less the time lesson clocks were paused: a held Next beyond 1.5 s, and replays
  // (Hear it again, Show me again), so a child who replays or sits at a hold never loses a beat for it (§3.7)
  const elapsedS = () => (performance.now() * FAST - t0.current - (lessonPausedMs() - p0.current) * FAST) / 1000;
  const score = useRef({ first: 0, total: 0, right: 0 });
  const shown = useRef(0); // demos so far (to alternate "Let me show you!" / "Watch me first!")
  const tried = useRef(0);

  const el = (id: string): Element | null =>
    document.querySelector(`.wu .wu-slot:not(.out) [aria-label="${CSS.escape(id)}"]`) ??
    document.querySelector(`.wu [aria-label="${CSS.escape(id)}"]`) ??
    document.querySelector(`.wu [data-pic="${CSS.escape(id)}"]`);
  const glow = (ids: string[], on = true) => {
    for (const id of ids) {
      if (id === "tortoise" || id === "rabbit") patch((v) => ({ speed: v.speed && { ...v.speed, [id]: on ? "glow" : "" } }));
      else if (id.startsWith("rail ")) patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s, i) => (`rail ${i}` === id ? (on ? "glow" : "") : s)) } }));
      else if (id.startsWith("dot ")) void 0;
      else setCard(id, { state: on ? "glow" : "" });
    }
  };
  const clearTimers = (p: Pending) => {
    p.timers.forEach(clearTimeout);
    p.timers = [];
  };
  /** The paw points at the (first) answer and stays there: idle help, never an answer. */
  const pointAt = (p: Pending) => {
    const t = el(p.answers()[0] ?? "");
    if (!t) return;
    const r = stageRect(t);
    patch({ point: { x: r.x + r.w * 0.55, y: r.y + r.h * 0.5 } });
  };
  /** Idle ladder (docs/NAVIGATION.md §3.2): 8 s → the answer glows and Sensei asks again; 16 s → the paw points at it
   *  and waits; then the question every 12 s, three times, then quiet. Nothing answers for the child. Past the cap the
   *  answers glow at once; once the child has tapped since the cap, the paw finishes the question (pawClose). */
  const startIdle = (p: Pending) => {
    clearTimers(p);
    if (p.done) return;
    if (capped.current && p.asked) {
      if (capTried.current) return void pawClose(p);
      glow(p.answers());
    }
    const later = (ms: number, f: () => void) => p.timers.push(window.setTimeout(() => !p.done && !p.busy && f(), ms));
    if (p.glowAfterMs != null) later(p.glowAfterMs, () => glow(p.answers().slice(0, 1)));
    later(8000, () => {
      glow(p.answers());
      void say(p.prompt);
    });
    later(16000, () => pointAt(p));
    for (const ms of [28000, 40000, 52000]) later(ms, () => void say(p.prompt));
  };
  /** The paw answers: only past the cap, once the child has had their try (pawClose). */
  const pawAnswer = async (p: Pending) => {
    const id = p.answers()[0];
    if (!id || p.done) return;
    p.busy = true;
    await pawAt(el(id));
    p.busy = false;
    p.resolve({ id, el: el(id), auto: true });
  };
  /** Arm a question: taps count from now (even while the prompt is being said: a tap cuts Sensei off). */
  const ask = (o: Omit<Pending, "resolve" | "busy" | "done" | "timers">, sayPrompt = true): Promise<{ id: string; el: Element | null; auto: boolean }> =>
    new Promise((resolve) => {
      const p: Pending = {
        ...o, busy: false, done: false, timers: [],
        resolve: (r) => {
          if (p.done) return;
          p.done = true;
          clearTimers(p);
          if (pending.current === p) pending.current = null;
          if (viewRef.current.point) patch({ point: null });
          setAskN((n) => n + 1);
          resolve(r);
        },
      };
      pending.current = p;
      prompt.current = o.prompt;
      patch({ speaker: true });
      setAskN((n) => n + 1);
      (async () => {
        if (sayPrompt) await say(o.prompt);
        if (p.done || !alive.current) return;
        p.asked = true;
        setAskN((n) => n + 1);
        startIdle(p);
      })();
    });
  const saidLast = useRef(false);
  const closedByPaw = useRef(false);
  /** The child has tapped since the cap came (in this beat): their try is had, and the paw may finish what is left. */
  const capTried = useRef(false);
  /** The paw finishes the question. "Here's the last one!" only when exactly one answer is left (and only once). */
  const pawClose = async (p: Pending) => {
    if (p.done || p.busy) return;
    closedByPaw.current = true;
    if (!saidLast.current && p.answers().length === 1) {
      saidLast.current = true;
      p.busy = true;
      await say({ line: "fm_last_one" });
      p.busy = false;
    }
    await pawAnswer(p);
  };
  // the hard cap, checked while the child is being asked: once what is left (the paw answering, the beat's own ending
  // and the closing line) would otherwise run past the cap, the answers glow and the turn waits for the child's tap
  useEffect(() => {
    const t = window.setInterval(() => {
      if (!t0.current || capped.current) return;
      const doneS = script.beats.find((x) => x.kind === "done")?.secs ?? 4;
      // (a tap-all ends with "You found them both!", and Reception's "/a/ in it" with how we spell /a/ too)
      const b = beatNow.current;
      const endS = b?.kind === "tapall" ? (b.spell && b.how === "in" ? TAPALL_SPELL_END_S : TAPALL_END_S) : END_S;
      if (overCap(script, elapsedS() + doneS + endS)) {
        capped.current = true;
        setAskN((n) => n + 1); // (__snState.capped)
        // (a question still being asked is said in full first: ask() then starts the child's turn)
        const p = pending.current;
        if (p && !p.busy && !p.done && p.asked) startIdle(p);
      }
    }, 500);
    return () => clearInterval(t);
  }, []);

  // ---- Show me again (docs/NAVIGATION.md §3.6): the demo that led into this turn. A beat with a demo (or Sensei's
  // half of a game whose child's half follows) stores it; it plays over the turn (the demo's own pictures put back when
  // the turn shows others), then the turn's view comes back and its question is asked again. It never answers: a tap
  // meanwhile stops it (and counts, when the turn's own pictures were on screen). It goes when another game starts.
  type Show = { game: string; same: boolean; run: (live: Live) => Promise<unknown> };
  const lastShow = useRef<Show | null>(null);
  const showTok = useRef(0);
  const showing = useRef<{ same: boolean; restore: () => void } | null>(null);
  const snapshot = () => {
    const v = viewRef.current;
    return { cards: v.cards.filter((c) => !c.out), speed: v.speed, ribbon: v.ribbon, rail: v.rail, rails: v.rails, dots: v.dots, spot: null };
  };
  const restoreTo = (s: ReturnType<typeof snapshot>) =>
    patch((v) => ({
      ...s,
      paw: null,
      // the demo's own pictures leave; the turn's come back as they were
      cards: [...v.cards.filter((c) => !c.out && !s.cards.some((x) => (x.key ?? x.w) === (c.key ?? c.w))).map((c) => ({ ...c, out: true })), ...s.cards],
    }));
  const showAgain = async () => {
    const p = pending.current, s = lastShow.current;
    if (!p || p.done || p.busy || !p.asked || !s || showing.current) return;
    const my = ++showTok.current;
    const live = () => my === showTok.current && alive.current && !p.done;
    clearTimers(p);
    hush();
    const snap = snapshot();
    showing.current = { same: s.same, restore: () => restoreTo(snap) };
    p.busy = true;
    patch({ point: null });
    setAskN((n) => n + 1);
    try {
      await s.run(live);
    } catch (e) {
      console.error("show me again", e);
    }
    if (!live()) return;
    await sleep(300);
    if (!live()) return;
    endShow();
    // the turn again: its question (a tap on an answer cuts it off, as ever)
    await sleep(250);
    if (!live() || p.busy) return;
    await say(p.prompt);
    if (!p.done && !p.busy && my === showTok.current) startIdle(p);
  };
  /** Back to the turn: its view as it was, its taps open. */
  const endShow = () => {
    const sh = showing.current;
    showing.current = null;
    slowmo(false);
    sh?.restore();
    const p = pending.current;
    if (p && !p.done) p.busy = false;
    setAskN((n) => n + 1);
  };
  const stopShow = () => {
    showTok.current++;
    hush();
    endShow();
    const p = pending.current;
    if (p && !p.done) startIdle(p);
  };

  /** A tap on anything in the lesson (a card, a button, a rail, a dot). */
  const tap = async (id: string, target: Element | null) => {
    // during Show me again: the tap stops it; on the turn's own pictures it is also the child's answer
    if (showing.current) {
      const same = showing.current.same;
      stopShow();
      if (!same) return;
    }
    const p = pending.current;
    if (!p || p.done) return earlyTap(id);
    if (p.busy || p.ignore?.(id)) return;
    clearTimers(p);
    if (capped.current) capTried.current = true;
    if (p.answers().includes(id)) {
      hush();
      p.resolve({ id, el: target, auto: false });
      return;
    }
    if (!p.onWrong) return startIdle(p);
    p.busy = true;
    setAskN((n) => n + 1);
    hush();
    try {
      await p.onWrong(id, target);
    } finally {
      p.busy = false;
      setAskN((n) => n + 1); // the question is open again (and bots can see it)
    }
    if (!p.done) startIdle(p);
  };
  /** Not the child's turn yet (Sensei is naming or showing): the card lights up, and says its word once she's quiet. */
  const earlyTap = (id: string) => {
    if (!viewRef.current.cards.some((c) => c.w === id && !c.out)) return;
    sfx.tap();
    if (viewRef.current.spot) return;
    patch({ spot: id });
    setTimeout(() => viewRef.current.spot === id && patch({ spot: null }), 700);
    if (!isSpeaking()) void say(plain(id));
  };

  /** The paw (a friendly pointing hand) goes to something and taps it (a demo). */
  const pawAt = async (target: Element | { x: number; y: number } | null, live: Live = isAlive) => {
    if (!target) return;
    const r = target instanceof Element ? stageRect(target) : { x: target.x - 40, y: target.y - 40, w: 80, h: 80 };
    patch({ paw: { x: r.x + r.w * 0.55, y: r.y + r.h * 0.5 } });
    await sleep(750);
    if (live()) sfx.tap();
    patch({ paw: null });
  };

  // ---- teaching helpers
  const named = namedThisSession;
  /** Name each card that hasn't been named yet, spotlit from 100 ms before its clip until 150 ms after (the naming joins
   *  this beat's Hear it again). */
  const nameCards = async (ws: string[]) => {
    for (const w of ws) {
      if (named.has(w) || !alive.current) continue;
      named.add(w);
      patch({ spot: w });
      await sleep(100);
      const id = nameLine(w);
      await told(id ? { line: id } : plain(w));
      await sleep(150);
      patch({ spot: null });
    }
  };
  const showMe = () => say({ line: showLine(shown.current++) });
  const youTry = () => say({ line: tryLine(tried.current++) });
  /** A right answer from the child: the ninja's move (the praise), and the streak. */
  const childRight = (target: Element | null, w: string, o: { first: boolean; auto?: boolean; soft?: boolean }) => {
    const first = o.first && !o.auto;
    score.current.total++;
    if (first) score.current.first++;
    noteAttempt(first);
    return rightAnswer(target, "pic", { first, living: LIVING.has(w) || w === "fishdog" || w === "dogfish" || w === "starfish", soft: o.soft ?? true });
  };
  /** A first-try choice between pictures counts towards the streak. In the warm-ups a tier-up powers the ninja up
   *  without a line: the first streak is explained in the first lesson where the child reads or spells (it cost
   *  Lesson 1 3.6 s; docs/DECISIONS.md). */
  const hit = () => streak.hit({ line: false });
  /** A hit held back because it starts a new tier (rightAnswer): the power-up, seen for a moment. */
  const tierQuiet = async () => {
    if (hit().tierUp) await sleep(250); // (the power-up plays on under what comes next)
  };
  /** Praise at most every third right answer, never over a streak beat. */
  const praise = async (held: boolean) => {
    if (held) return tierQuiet();
    score.current.right++;
    if (score.current.right % 3 === 0) await say({ line: pickPraise() });
  };
  /** A slip: the ninja tilts its head ("hmm?"). In the warm-ups a lost streak is silent too (no "Keep going, ninja!":
   *  the correction that follows is the child's help). */
  const childWrong = async () => {
    score.current.total++;
    noteAttempt(false);
    const e = streak.miss({ line: false });
    if (e.prevN === 0) void ninja.act("think");
    ninja.pose("think");
  };
  /** "Listen again." and the question, after a first slip; past the cap the paw finishes the question instead, so it
   *  isn't asked again (the child has had their try). */
  const askAgain = (x: Say[]) => (capped.current ? Promise.resolve(true) : say(x));
  const bead = () => patch((v) => ({ lit: v.lit + 1 }));

  // ---- the ninja's special moves
  /** A dash out and back (fast), or a slow kata (slow): whole-body motion on the ninja's float layer. */
  const dash = () => moveNinja(DASH, streak.tier);
  const runAlong = (toX: number, ms: number) => moveNinja(runSpec(toX, ms), streak.tier);
  const slowmo = (on: boolean) => ninja.setSlowmo(on ? 2.8 : 1);

  // ---------------------------------------------------------------- beats
  const run: { [K in Beat["kind"]]: (b: Extract<Beat, { kind: K }>) => Promise<void> } = {
    // ---- cards drop in; "Ninja ears on!"
    hello: async (b) => {
      patch({ cards: row(b.cards).map((c, i) => ({ ...c, key: `${c.w}-in-${i}` })) });
      ninja.pose("ready");
      await say({ line: b.line });
      ninja.pose(null);
    },
    name: async (b) => {
      await nameCards(b.cards);
    },

    // ---- "Let me show you! Tap the sun!" → "Now you try! Tap the sock!"
    tap: async (b) => {
      patch({ cards: layoutRow(viewRef.current.cards, b.options) });
      await nameCards(b.options);
      if (b.demo) {
        const demo = b.demo;
        // the paw sets off as Sensei starts "Tap the sun!", and taps it as she finishes (Show me again plays it again)
        const show = async (live: Live) => {
          const d = el(demo.target);
          const said = say({ line: demo.prompt ?? "fm_tap_sun" });
          await sleep(250);
          if (!live()) return;
          await pawAt(d, live);
          await said;
          if (!live()) return;
          setCard(demo.target, { state: "right" });
          sfx.good();
          const { landed } = rightAnswer(d, "pic", { first: false, living: LIVING.has(demo.target), soft: true });
          await afterLanding(landed);
          await sleep(200);
          setCard(demo.target, { state: "" });
        };
        await showMe();
        await show(isAlive);
        lastShow.current = { game: "tap", same: true, run: show };
        await youTry();
      }
      let misses = 0;
      const r = await ask({
        answers: () => [b.target],
        prompt: [{ line: b.prompt }],
        glowAfterMs: b.glowAfterMs,
        onWrong: async (id) => {
          misses++;
          sfx.wrong();
          setCard(id, { state: "wrong" });
          await childWrong();
          await say(plain(id));
          setCard(id, { state: "" });
          ninja.pose(null);
          if (misses === 1) await askAgain([{ line: "listen_again" }, { gap: 200 }, { line: b.prompt }]);
          else {
            glow([b.target]);
            await say({ line: "fm_its_this" });
          }
        },
      });
      setCard(b.target, { state: "right" });
      sfx.good();
      const target = r.el ?? el(b.target);
      let held = false;
      if (script.key === "W1" && !r.auto && misses === 0 && !LIVING.has(b.target) && target) {
        // the hook of the whole game: the very first tap gets a kick at the card's corner, and a star stamp
        score.current.total++;
        score.current.first++;
        noteAttempt(true);
        held = false;
        hit();
        const kick = ninja.act("kick", cornerOf(target), { react: false, soft: true }).then(() => target.isConnected && target.classList.add("struck"));
        await Promise.race([kick, sleep(450)]);
      } else {
        const res = childRight(target, b.target, { first: misses === 0, auto: r.auto });
        held = res.held;
        await afterLanding(res.landed);
        await say(plain(b.target));
      }
      bead();
      await praise(held);
      await sleep(150);
      setCards((cs) => cs.map((c) => ({ ...c, state: "" })));
    },

    // ---- fast and slow
    fastslow: async (b) => {
      if (b.by === "sensei") {
        // the other cards slide back; the word's card moves to the centre, big, with its ribbon and the two buttons
        const segs = segsOf(b.word).length || 3;
        patch((v) => ({
          cards: [...v.cards.filter((c) => c.w !== b.word).map((c) => ({ ...c, out: true })), { w: b.word, x: STAGE.x, y: STAGE.y, size: STAGE.size, gutter: 24, key: `${b.word}-stage` }],
          speed: { tortoise: "", rabbit: "", at: "stage" },
          ribbon: { mode: "idle", ms: 0, dots: segs, shown: 0, pulse: -1 },
        }));
        await nameCards([b.word]);
        // "Watch me first!" as the stage settles
        await showMe();
        await fastSlowShow(b, isAlive);
        // the child's fast and slow turns that follow can watch it again (Show me again)
        lastShow.current = { game: "fastslow", same: true, run: (live) => fastSlowShow(b, live) };
        return;
      }
      // the child's turn: "Your turn! Tap the tortoise, and say it slowly with me." / "Now tap the rabbit, and say it fast!"
      const which = b.speed === "slow" ? "tortoise" : "rabbit";
      patch((v) => ({ speed: v.speed && { ...v.speed, [which]: "pulse" } }));
      let misses = 0;
      const line = b.speed === "slow" ? "fm_tap_tortoise" : "fm_tap_rabbit";
      const r = await ask({
        answers: () => [which],
        prompt: [{ line }],
        onWrong: async (id) => {
          misses++;
          // the other button still says the word its way (never wrong to hear it), then the question again
          patch((v) => ({ speed: v.speed && { ...v.speed, [id]: "flash" } }));
          if (id === "rabbit") {
            fastHop(b.word);
            await say(plain(b.word));
          } else await slowWord(b.word);
          patch((v) => ({ speed: v.speed && { ...v.speed, [id]: "" } }));
          await say({ line });
        },
      });
      // (graded, but not a streak hit: the button pulses, so it isn't a choice between pictures)
      score.current.total++;
      if (misses === 0 && !r.auto) score.current.first++;
      noteAttempt(misses === 0 && !r.auto);
      patch((v) => ({ speed: v.speed && { ...v.speed, [which]: "flash" } }));
      if (b.speed === "slow") await slowWord(b.word);
      else {
        fastHop(b.word);
        await say(plain(b.word));
      }
      patch((v) => ({ speed: v.speed && { ...v.speed, [which]: "" } }));
      bead();
      await sleep(250);
    },

    // ---- "Listen to my slow word... [caaat] Which picture is it?" → "caaat… cat!"
    slowpick: async (b) => {
      tidyStage();
      patch({ cards: layoutRow(viewRef.current.cards, b.options) });
      await sleep(400);
      await nameCards(b.options);
      if (b.demo) {
        const demo = b.demo;
        // "Let me show you!": Sensei says her slow word and the paw finds its picture; "mmmuuug… mug!"
        const show = async (live: Live) => {
          await say([{ line: "fm_slow_listen" }, { gap: 400 }, stretch(demo.target), { gap: 300 }, { line: "fm_which_pic" }]);
          if (!live()) return;
          const d = el(demo.target);
          await pawAt(d, live);
          if (!live()) return;
          setCard(demo.target, { state: "right" });
          sfx.good();
          slowmo(true);
          const { landed } = rightAnswer(d, "pic", { first: false, living: LIVING.has(demo.target), soft: true });
          await say([stretch(demo.target), { gap: 300 }]);
          slowmo(false);
          if (!live()) return;
          await say(plain(demo.target));
          await afterLanding(landed);
          setCard(demo.target, { state: "" });
        };
        await showMe();
        await show(isAlive);
        lastShow.current = { game: "slowpick", same: true, run: show };
        await youTry();
      }
      const lead = b.again || b.demo ? "fm_slow_another" : "fm_slow_listen";
      const q: Say[] = [{ line: lead }, { gap: 400 }, stretch(b.target), { gap: 300 }, { line: "fm_which_pic" }];
      let misses = 0;
      const r = await ask({
        answers: () => [b.target],
        prompt: q,
        glowAfterMs: b.glowAfterMs,
        onWrong: async (id) => {
          misses++;
          sfx.wrong();
          setCard(id, { state: "wrong" });
          await childWrong();
          await say(canStretch(id) ? stretch(id) : plain(id));
          setCard(id, { state: "" });
          ninja.pose(null);
          if (misses === 1) await askAgain([{ line: "listen_again" }, { gap: 250 }, stretch(b.target)]);
          else {
            glow([b.target]);
            await say({ line: "fm_its_this" });
          }
        },
      });
      setCard(b.target, { state: "right" });
      sfx.good();
      // bullet time: the move plays slowly under the stretched word, and snaps to full speed on the word
      slowmo(true);
      const res = childRight(r.el ?? el(b.target), b.target, { first: misses === 0, auto: r.auto, soft: true });
      await say([stretch(b.target), { gap: 350 }]);
      slowmo(false);
      await say(plain(b.target));
      bead();
      await praise(res.held);
      await sleep(300);
      setCards((cs) => cs.map((c) => ({ ...c, state: "" })));
    },

    // ---- "Listen to the very first sound." [sssun] [sssock] "Did you notice?…" [/s/] "Say that sound with me!" [/s/]
    notice: async (b) => {
      tidyStage();
      const [a, c] = b.words;
      const ns = (w: string) => segsOf(w).length || 3;
      patch((v) => ({
        cards: [
          ...v.cards.filter((x) => !b.words.includes(x.w)).map((x) => ({ ...x, out: true })),
          ...row([a, c], 240, 262, 70).map((x) => ({ ...x, dots: { n: ns(x.w), gold: [] }, key: `${x.w}-notice` })),
        ],
      }));
      // (the cards are already known: Sensei starts as they glide into place)
      await sleep(named.has(a) && named.has(c) ? 150 : 500);
      await nameCards(b.words);
      await noticeShow(b, isAlive);
    },

    // ---- tap all the pictures that start with /s/ (or have /a/ in them)
    tapall: async (b) => {
      tidyStage();
      const cards = grid(b.cards).map((c) => ({ ...c, key: `${c.w}-grid` }));
      patch((v) => ({ cards: [...v.cards.filter((x) => !b.cards.includes(x.w)).map((x) => ({ ...x, out: true })), ...cards], pockets: { n: b.targets.length, filled: [] } }));
      await sleep(250);
      await nameCards(b.cards);
      const lead = b.how === "in" ? "fm_tap_all_in" : b.quick ? "fm_quick_tap_all" : "fm_tap_all_start";
      const q: Say[] = [{ line: lead }, { gap: 400 }, { sound: b.p }];
      const found: string[] = [];
      // a find says its held first sound ("sssock"; audio.ts falls back to the stretched word, then the word)
      const findSay = (w: string): Say => (b.how === "start" ? onset(w) : canStretch(w) ? stretch(w) : plain(w));
      const spellOn = async (w: string) => {
        if (!b.spell || b.how !== "start") return;
        const segs = segsOf(w);
        const n = segs.length || 1; // picture-only words (sausage) show just their first line
        const at = b.how === "start" ? 0 : Math.max(0, segs.findIndex((s, i) => i > 0 && s.p === b.p));
        const g = segs[at]?.g ?? (b.p === "s" ? "s" : b.p);
        setCard(w, { lines: { n, show: [] } });
        await sleep(200);
        if (!spelt.current.has(g)) {
          spelt.current.add(g);
          const done = castOn(w, at, () => setCard(w, { lines: { n, show: [{ i: at, g }] } }));
          await say([{ line: "how_we_spell" }, { gap: 150 }, { sound: b.p }]);
          await done;
        } else setCard(w, { lines: { n, show: [{ i: at, g }] } });
      };
      const pocket = async (w: string) => {
        const from = el(w);
        const slot = document.querySelectorAll(".wu-pocket")[found.length - 1] ?? null;
        if (from && slot) await flyCopy(from, slot, 460);
        patch((v) => ({ pockets: v.pockets && { ...v.pockets, filled: [...v.pockets.filled, w] } }));
      };
      if (b.demo) {
        const demoW = b.demo;
        // "Let me show you!": the paw sets off on the sound and finds one as the question ends; it flies into its pocket
        await showMe();
        // the sound picture, from the question on (docs/NAVIGATION.md §4)
        patch({ sound: b.p });
        const d = el(demoW);
        const started = nextClip(lead, 1500);
        const asked = say(q);
        const c = await started;
        // (the clip's own clock: the paw leaves as the lead-in ends, and lands on the sound)
        if (c) await sleep(Math.max(0, (c.end - performance.now()) * FAST - 250));
        await pawAt(d);
        await asked;
        found.push(demoW);
        setCard(demoW, { state: "found" });
        sfx.good();
        void ninja.act("throw", d ? cornerOf(d) : undefined, { react: false, soft: true });
        void pocket(demoW);
        await say(findSay(demoW));
        await spellOn(demoW);
        // Show me again: the question again, and the paw finds the demo's picture (already in its pocket) once more
        lastShow.current = {
          game: "tapall",
          same: true,
          run: async (live) => {
            const d2 = el(demoW);
            const started2 = nextClip(lead, 1500);
            const asked2 = say(q);
            const c2 = await started2;
            if (c2) await sleep(Math.max(0, (c2.end - performance.now()) * FAST - 250));
            if (!live()) return;
            await pawAt(d2, live);
            await asked2;
            if (!live()) return;
            sfx.good();
            if (d2) {
              const at = stageXY(d2);
              fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 10, 6);
            }
            void ninja.act("throw", d2 ? cornerOf(d2) : undefined, { react: false, soft: true });
            await say(findSay(demoW));
          },
        };
        await youTry();
      }
      patch({ sound: b.p });
      let misses = 0;
      let first = true;
      let askPrompt = !b.demo;
      let childFound = 0; // the child's own finds (not the demo's, the idle paw's or the cap's)
      while (found.length < b.targets.length && alive.current) {
        const left = () => b.targets.filter((t) => !found.includes(t));
        const r = await ask(
          {
            answers: left,
            prompt: q,
            ignore: (id) => found.includes(id),
            onWrong: async (id) => {
              misses++;
              first = false;
              sfx.wrong();
              setCard(id, { state: "wrong" });
              await childWrong();
              // "mmmoon… Moon starts with a different sound."
              const diff = diffLine(id, b.how);
              await say([findSay(id), { gap: 250 }, ...(diff ? [{ line: diff }] : [])]);
              setCard(id, { state: "" });
              ninja.pose(null);
              if (misses === 2) {
                // the ones left glow: "Look! This one starts with..." [/s/]
                glow(left());
                await say(b.how === "start" && hasLine("fm_look_this") ? [{ line: "fm_look_this" }, { gap: 350 }, { sound: b.p }] : [{ line: "fm_its_this" }]);
              } else if (misses === 1) await askAgain([{ line: "listen_again" }, { gap: 200 }, ...q]);
            },
          },
          askPrompt,
        );
        askPrompt = false;
        found.push(r.id);
        if (!r.auto) childFound++;
        setCards((cs) => cs.map((c) => (c.w === r.id ? { ...c, state: "found" } : c.state === "glow" && !found.includes(c.w) && misses < 2 ? { ...c, state: "" } : c)));
        sfx.good();
        const target = r.el ?? el(r.id);
        // each find: a shuriken pins a star on the card's corner, and a mini-card flies to its pocket
        const isFirst = first && !r.auto;
        score.current.total++;
        if (isFirst) score.current.first++;
        noteAttempt(isFirst);
        const held = isFirst ? tierHeld() : false;
        if (isFirst && !held) hit();
        const move = LIVING.has(r.id) ? gift(target) : ninja.act("throw", target ? cornerOf(target) : undefined, { react: false, soft: true }).then(() => target?.isConnected && target.classList.add("struck"));
        await Promise.race([move, sleep(300)]);
        void pocket(r.id);
        await say(findSay(r.id));
        await spellOn(r.id);
        if (held) await tierQuiet();
        first = true;
      }
      // all found: the ninja's biggest move for its tier, and a spell burst over every find
      bead();
      const finds = found.map((w) => el(w)).filter(Boolean) as Element[];
      void ninja.act(streak.tier >= 2 ? "flip" : streak.tier >= 1 ? "spin" : "cast", finds[0] ? stageXY(finds[0]) : undefined, { react: false });
      finds.forEach((f, i) => setTimeout(() => {
        const p = stageXY(f);
        fx.twinkle(p.x, p.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 12, 7);
        fx.ring(p.x, p.y, { color: "#ffe38a", r0: 20, r1: 150, width: 9 });
      }, 250 + i * 140));
      // "You found them both/all!" only for what the child found; the paw's finds (at the cap) aren't theirs
      const helped = childFound < found.length - (b.demo ? 1 : 0);
      if (b.how === "in") await say([...(helped ? [] : [{ line: "fm_found_all" }, { gap: 250 }]), { line: "t_they_all_have" }, { gap: 350 }, { sound: b.p }]);
      else if (!helped && childFound === 2) await say([{ line: "fm_found_both" }, { gap: 300 }, { sound: b.p }]);
      else await say([...(helped ? [] : [{ line: "fm_found_all" }, { gap: 250 }]), { line: "fm_all_start" }, { gap: 400 }, { sound: b.p }]);
      if (b.spell && b.how === "in") {
        // Reception: < a > on cat's middle line
        const w = b.targets[0];
        const segs = segsOf(w);
        const at = segs.findIndex((s, i) => i > 0 && s.p === b.p);
        if (at > 0) {
          setCard(w, { lines: { n: segs.length, show: [] } });
          await sleep(250);
          const done = castOn(w, at, () => setCard(w, { lines: { n: segs.length, show: [{ i: at, g: segs[at].g }] } }));
          await say([{ line: "how_we_spell" }, { gap: 150 }, { sound: b.p }]);
          await done;
          await sleep(500);
        }
      }
      patch({ pockets: null });
    },

    // ---- the reading rail: "Ninjas read this way!"
    rail: async (b) => {
      const merged = viewRef.current.cards.find((c) => c.w === b.merge && !c.out);
      if (!viewRef.current.rail) {
        tidyStage();
        patch((v) => ({ cards: v.cards.map((c) => ({ ...c, out: true })), rail: { arrow: "glow", light: null } }));
        await sleep(450);
      }
      if (b.intro) {
        // "Ninjas read this way!": the ninja runs along the rail from left to right (the reading finger), and back
        const said = say({ line: b.intro });
        runAlong(760, 1500);
        await said;
        await sleep(250);
      }
      if (merged) {
        // the fish-dog splits back into a fish and a dog
        patch((v) => ({ cards: [...v.cards.filter((c) => c.w !== b.merge), ...onRail(b.cards).map((c) => ({ ...c, x: PLAY_CX, moving: true, key: `${c.w}-split` }))] }));
        await sleep(60);
        patch((v) => ({ cards: v.cards.map((c) => onRail(b.cards).find((x) => x.w === c.w) ? { ...c, ...onRail(b.cards).find((x) => x.w === c.w)!, key: c.key } : c) }));
        fx.burst(PLAY_CX, 380, "stars", 14);
        await sleep(500);
        setCards((cs) => cs.map((c) => ({ ...c, moving: false })));
      } else if (!b.cards.every((w) => viewRef.current.cards.some((c) => c.w === w && !c.out))) {
        patch((v) => ({ cards: [...v.cards.filter((c) => !b.cards.includes(c.w)).map((c) => ({ ...c, out: true })), ...onRail(b.cards).map((c) => ({ ...c, key: `${c.w}-rail` }))] }));
        await sleep(450);
      }
      await nameCards(b.cards);
      if (b.by === "sensei") {
        if (b.demo) await showMe();
        // "Fish... dog. Fish dog!": a light passes under each card on its word; the ninja runs along with it
        await readAlong(b.cards, b.line);
        // the fish-dog appears, and once it is clean Sensei says it again: "Fish dog!"
        if (b.merge) await merge(b.cards, b.merge, { line: b.after });
        // the child's turn that follows can watch Sensei read them again (Show me again): the light under each picture
        lastShow.current = {
          game: "rail",
          same: true,
          run: async (live) => {
            if (b.intro) {
              const said = say({ line: b.intro });
              runAlong(760, 1500);
              await said;
              await sleep(250);
              if (!live()) return;
            }
            await readAlong(b.cards, b.line, undefined, live);
            if (live() && b.after) await say({ line: b.after });
          },
        };
        return;
      }
      // the child taps them in order, left to right; the first one pulses
      let k = 0;
      let slips = 0;
      setCard(b.cards[0], { state: "glow" });
      await say({ line: b.line });
      while (k < b.cards.length && alive.current) {
        const want = b.cards[k];
        const r = await ask(
          {
            answers: () => [want],
            prompt: [{ line: b.line }],
            ignore: (id) => b.cards.indexOf(id) >= 0 && b.cards.indexOf(id) < k,
            onWrong: async (id) => {
              if (!b.cards.includes(id)) return;
              slips++;
              // the other way: it wiggles, the arrow pulses from the left: "Start here, on this side!"
              setCard(id, { state: "wrong" });
              patch((v) => ({ rail: v.rail && { ...v.rail, arrow: "pulse" } }));
              await say({ line: "fm_l2_start" });
              setCard(id, { state: "" });
              setCard(want, { state: "glow" });
              patch((v) => ({ rail: v.rail && { ...v.rail, arrow: "glow" } }));
            },
          },
          false,
        );
        setCard(want, { state: "", lit: true });
        const at = el(want);
        if (at) {
          const p = stageRect(at);
          patch((v) => ({ rail: v.rail && { ...v.rail, light: p.x + p.w / 2 } }));
          runAlong(Math.max(0, p.x + p.w / 2 - 250), 360);
        }
        void r;
        await say(plain(want));
        k++;
        if (k < b.cards.length) setCard(b.cards[k], { state: "glow" });
      }
      score.current.total++;
      if (!slips) score.current.first++;
      noteAttempt(!slips);
      if (!slips) hit();
      bead();
      await sleep(250);
      if (b.merge) await merge(b.cards, b.merge, { quick: true, line: b.after });
      else if (b.after) await say({ line: b.after });
      setCards((cs) => cs.map((c) => ({ ...c, lit: false, state: "" })));
      patch((v) => ({ rail: v.rail && { ...v.rail, light: null } }));
    },

    // ---- "Whoops! Now they're the other way round. Dog... fish. Dog fish!"
    swap: (b) => swapShow(b, isAlive),

    // ---- "Which did I read?"
    which: async (b) => {
      tidyStage();
      patch((v) => ({ cards: v.cards.map((c) => ({ ...c, out: true })), rail: null }));
      await sleep(350);
      const show = async (w: Which) => {
        patch({ rails: { rows: w.rails, state: ["", ""], light: null } });
        await sleep(450);
        await nameCards([...new Set(w.rails.flat())]);
      };
      const sweep = async (row: number, live: Live = isAlive) => {
        const n = viewRef.current.rails?.rows[row].length ?? 2;
        for (let i = 0; i < n; i++) {
          if (!live()) return;
          patch((v) => ({ rails: v.rails && { ...v.rails, light: [row, i] } }));
          await sleep(260);
        }
        if (live()) patch((v) => ({ rails: v.rails && { ...v.rails, light: null, state: v.rails.state.map((s, i) => (i === row ? "glow" : s)) } }));
      };
      // (the demo re-reads a pair the child has just heard read both ways: a lesson that is behind drops it)
      if (b.demo && !skipDemoNow.current) {
        const demo = b.demo;
        // the paw sets off as Sensei finishes the pair, and taps its rail as she ends
        const play = async (live: Live, during?: () => Promise<unknown>) => {
          const r = el(`rail ${demo.answer}`);
          const said = say({ line: demo.line });
          const times = WORD_TIMES[demo.line];
          await sleep(Math.max(0, ((times?.[times.length - 1] ?? 1.7) - 0.4) * 1000));
          if (!live()) return;
          await pawAt(r, live);
          await said;
          if (!live()) return;
          sfx.good();
          patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s, i) => (i === demo.answer ? "flash" : s)) } }));
          void gift(r, { shape: "around" });
          await Promise.all([sweep(demo.answer, live), during?.()]);
        };
        await show(demo);
        await showMe();
        await play(isAlive, youTry);
        // Show me again: the demo's two rails come back, Sensei reads, the paw taps the one she read
        lastShow.current = {
          game: "which",
          same: false,
          run: async (live) => {
            patch({ rails: { rows: demo.rails, state: ["", ""], light: null } });
            await sleep(450);
            if (live()) await play(live);
          },
        };
      }
      await show(b.pick);
      let misses = 0;
      const q: Say[] = [{ line: b.pick.line }];
      const r = await ask({
        answers: () => [`rail ${b.pick.answer}`],
        prompt: q,
        onWrong: async (id) => {
          if (!id.startsWith("rail ")) return;
          misses++;
          sfx.wrong();
          patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s, i) => (`rail ${i}` === id ? "wrong" : s)) } }));
          await childWrong();
          await sleep(400);
          patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s, i) => (`rail ${i}` === id ? "" : s)) } }));
          ninja.pose(null);
          if (misses === 1) await askAgain([{ line: "listen_again" }, { gap: 200 }, ...q]);
          else {
            glow([`rail ${b.pick.answer}`]);
            await say({ line: "fm_its_this" });
          }
        },
      });
      sfx.good();
      patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((_, i) => (i === b.pick.answer ? "flash" : "")) } }));
      score.current.total++;
      const first = misses === 0 && !r.auto;
      if (first) score.current.first++;
      noteAttempt(first);
      const held = first ? tierHeld() : false;
      if (first && !held) hit();
      // a crown of stars round the rail, as its light sweeps left to right
      void gift(r.el ?? el(`rail ${b.pick.answer}`), { shape: "around" });
      await sweep(b.pick.answer);
      if (b.pick.after) await say({ line: b.pick.after });
      bead();
      await praise(held);
      await sleep(300);
      patch({ rails: null });
    },

    // ---- two little words make one big word
    compound: async (b) => {
      tidyStage();
      if (viewRef.current.rails) patch({ rails: null });
      patch((v) => ({
        cards: [...v.cards.map((c) => ({ ...c, out: true })), ...onRail(b.parts).map((c) => ({ ...c, key: `${c.w}-cmp` }))],
        rail: v.rail ?? { arrow: "glow", light: null },
        speed: { tortoise: "", rabbit: "", at: "rail" },
      }));
      if (b.by === "sensei") {
        const [intro] = b.lines;
        // "Two little words can make one big word!" as the cards arrive on the rail
        if (intro) await told({ line: intro });
        else await sleep(450);
        await nameCards(b.parts);
        await compoundShow(b, isAlive);
        // the child's big word that follows can watch this one made again (Show me again): its two pictures come back
        lastShow.current = {
          game: "compound",
          same: false,
          run: async (live) => {
            patch((v) => ({
              cards: [...v.cards.filter((c) => !c.out).map((c) => ({ ...c, out: true })), ...onRail(b.parts).map((c) => ({ ...c, key: `${c.w}-cmpr` }))],
              speed: { tortoise: "", rabbit: "", at: "rail" },
            }));
            await sleep(450);
            if (!live()) return;
            if (intro) await say({ line: intro });
            if (live()) await compoundShow(b, live);
          },
        };
        return;
      }
      // the child: "Star... fish. Tap the rabbit to say them fast!" (a pause to say it), then the rabbit pulses
      await sleep(450);
      await nameCards(b.parts);
      const main = b.lines[0];
      const times = WORD_TIMES[main] ?? [0, 1.2];
      const t = performance.now();
      const at = (s: number) => sleep(Math.max(0, s * 1000 - (performance.now() - t) * FAST));
      let misses = 0;
      const answered = ask({
        answers: () => ["rabbit"],
        prompt: [{ line: main }],
        onWrong: async (id) => {
          if (id !== "tortoise") return;
          misses++;
          // the tortoise says them slowly again (not wrong to hear), then the rabbit pulses
          patch((v) => ({ speed: v.speed && { ...v.speed, tortoise: "flash" } }));
          await say([plain(b.parts[0]), { gap: 500 }, plain(b.parts[1])]);
          patch((v) => ({ speed: v.speed && { ...v.speed, tortoise: "", rabbit: "glow" } }));
        },
      });
      await at(times[0]);
      setCard(b.parts[0], { lit: true });
      await at(times[1]);
      setCard(b.parts[1], { lit: true });
      await at((times[2] ?? 2.3) + 1.8);
      patch((v) => ({ speed: v.speed && v.speed.rabbit === "" ? { ...v.speed, rabbit: "pulse" } : v.speed }));
      const r = await answered;
      // (graded, but not a streak hit: the rabbit pulses, so it isn't a choice between pictures)
      score.current.total++;
      const first = misses === 0 && !r.auto;
      if (first) score.current.first++;
      noteAttempt(first);
      patch((v) => ({ speed: v.speed && { ...v.speed, rabbit: "flash" } }));
      if (b.via === "star") {
        // the ninja throws its golden star onto the fish, which becomes a starfish (and a crown of stars lands on it)
        const fish = el(b.parts[1]);
        await Promise.race([ninja.act("throw", fish ? cornerOf(fish) : undefined, { react: false }), sleep(700)]);
      } else void ninja.act("cast", { x: PLAY_CX, y: 380 }, { react: false });
      // "Starfish!" once the starfish is clean, then it holds (merge)
      await merge(b.parts, b.word, { quick: true, line: b.after });
      bead();
      patch((v) => ({ speed: v.speed && { ...v.speed, rabbit: "" } }));
    },

    // ---- W5: "I'll say the sounds. You listen for the word!"
    sounds: async (b) => {
      tidyStage();
      const sayWord = (w: string): Say[] => {
        const segs = segsOf(w);
        return segs.length ? [{ sounds: segs, gap: 420 }] : [plain(w)];
      };
      const demoCards = (key: string) => row(b.demo.options, 240, 300, 40, 24).map((c) => ({ ...c, key: `${c.w}-${key}` }));
      patch((v) => ({ cards: [...v.cards.map((c) => ({ ...c, out: true })), ...demoCards("d")] }));
      await sleep(450);
      await nameCards(b.demo.options);
      // the game's introduction joins its first item's Hear it again
      const intro: Say[] = [];
      // "Words are made of sounds" (Lesson 1), recalled before the first sounds-only game (NARRATIVE_AUDIT F02)
      if (isDue("made-of-sounds", "once")) {
        intro.push({ line: "audit_made_of_sounds" }, { gap: 300 });
        if (await say({ line: "audit_made_of_sounds" })) heard("made-of-sounds");
      }
      intro.push({ line: "fm_sounds_intro" });
      // "Let me show you!": Sensei says the sounds, the paw finds the word's picture (Show me again plays it again)
      const play = async (live: Live) => {
        await say({ line: "fm_sounds_intro" });
        if (!live()) return;
        await say(sayWord(b.demo.target));
        if (!live()) return;
        await pawAt(el(b.demo.target), live);
        if (!live()) return;
        setCard(b.demo.target, { state: "right" });
        sfx.good();
        const { landed } = rightAnswer(el(b.demo.target), "pic", { first: false, living: LIVING.has(b.demo.target), soft: true });
        await afterLanding(landed);
        if (!live()) return;
        await say(plain(b.demo.target));
        await sleep(300);
      };
      await showMe();
      await play(isAlive);
      lastShow.current = {
        game: "sounds",
        same: false,
        run: async (live) => {
          patch((v) => ({ cards: [...v.cards.filter((c) => !c.out).map((c) => ({ ...c, out: true })), ...demoCards("dr")] }));
          await sleep(450);
          if (live()) await play(live);
        },
      };
      await youTry();
      let n = 2, run2 = 0;
      for (const [k, it] of b.items.entries()) {
        if (!alive.current) return;
        if (capped.current) break;
        const opts = shuffleStable(it.options.slice(0, n), it.target);
        patch((v) => ({ cards: [...v.cards.map((c) => ({ ...c, out: true })), ...row(opts, n >= 3 ? 210 : 240, 300, n >= 3 ? 0 : 40, n >= 3 ? G : 24).map((c) => ({ ...c, key: `${c.w}-${it.target}` }))] }));
        // each word is a new question: its own Hear it again (the game's introduction on the first)
        bundle.current = k === 0 ? [...intro] : [];
        await sleep(450);
        await nameCards(opts);
        const q: Say[] = [...sayWord(it.target), { gap: 300 }, { line: "fm_which_pic" }];
        let misses = 0;
        const r = await ask({
          answers: () => [it.target],
          prompt: q,
          onWrong: async (id) => {
            misses++;
            sfx.wrong();
            setCard(id, { state: "wrong" });
            await childWrong();
            await say(plain(id));
            setCard(id, { state: "" });
            ninja.pose(null);
            if (misses === 1) await askAgain([{ line: "listen_again" }, { gap: 200 }, ...sayWord(it.target)]);
            else {
              glow([it.target]);
              await say({ line: "fm_its_this" });
            }
          },
        });
        setCard(it.target, { state: "right" });
        sfx.good();
        const res = childRight(r.el ?? el(it.target), it.target, { first: misses === 0, auto: r.auto });
        await afterLanding(res.landed);
        await say([...sayWord(it.target), { gap: 250 }, plain(it.target)]);
        bead();
        await praise(res.held);
        // choices grow from 2 to 3 after two first tries in a row, and go back to 2 after a miss (§10)
        run2 = misses === 0 && !r.auto ? run2 + 1 : 0;
        n = misses || r.auto ? 2 : run2 >= 2 ? 3 : n;
        await sleep(250);
      }
    },

    // ---- W6: sound dots under the pictures, tapped this way
    dots: async (b) => {
      tidyStage();
      const showWord = async (w: string) => {
        const n = segsOf(w).length;
        patch((v) => ({ cards: [...v.cards.filter((c) => !c.out).map((c) => ({ ...c, out: true })), { w, x: PLAY_CX, y: 240, size: 250, gutter: G, key: `${w}-dots` }], dots: { word: w, n, tapped: 0, lit: -1, sweep: false, wrong: -1 } }));
        await sleep(450);
        await nameCards([w]);
      };
      const sweepSay = async (w: string, live: Live = isAlive) => {
        patch((v) => ({ dots: v.dots && { ...v.dots, sweep: true, lit: -1 } }));
        runAlong(420, 700);
        await sleep(350);
        if (live()) await say(plain(w));
        patch((v) => ({ dots: v.dots && { ...v.dots, sweep: false } }));
      };
      // "Let me show you!": the paw taps each dot left to right, each says its sound, then the word
      const play = async (live: Live) => {
        await say({ line: "fm_dots_intro" });
        const segs = segsOf(b.demo);
        for (let i = 0; i < segs.length; i++) {
          if (!live()) return;
          await pawAt(el(`dot ${i}`), live);
          if (!live()) return;
          patch((v) => ({ dots: v.dots && { ...v.dots, tapped: i + 1, lit: i } }));
          await say({ sound: segs[i].p });
        }
        await sleep(300);
        if (live()) await sweepSay(b.demo, live);
      };
      await showWord(b.demo);
      await showMe();
      await play(isAlive);
      lastShow.current = {
        game: "dots",
        same: false,
        run: async (live) => {
          const n = segsOf(b.demo).length;
          patch((v) => ({ cards: [...v.cards.filter((c) => !c.out).map((c) => ({ ...c, out: true })), { w: b.demo, x: PLAY_CX, y: 240, size: 250, gutter: G, key: `${b.demo}-dotsr` }], dots: { word: b.demo, n, tapped: 0, lit: -1, sweep: false, wrong: -1 } }));
          await sleep(450);
          if (live()) await play(live);
        },
      };
      await sleep(400);
      for (const [k, w] of b.words.entries()) {
        if (!alive.current || capped.current) break;
        clearTold();
        await showWord(w);
        const ws = segsOf(w);
        if (k === 0) await say({ line: "fm_dots_turn" });
        let slips = 0;
        for (let i = 0; i < ws.length; i++) {
          const want = `dot ${i}`;
          const r = await ask(
            {
              answers: () => [want],
              prompt: [{ line: "fm_dots_turn" }],
              ignore: (id) => id.startsWith("dot ") && Number(id.slice(4)) < i,
              onWrong: async (id) => {
                if (!id.startsWith("dot ")) return;
                slips++;
                patch((v) => ({ dots: v.dots && { ...v.dots, wrong: Number(id.slice(4)) } }));
                if (i === 0) await say({ line: "fm_l2_start" });
                else await sleep(450);
                patch((v) => ({ dots: v.dots && { ...v.dots, wrong: -1 } }));
              },
            },
            false,
          );
          void r;
          patch((v) => ({ dots: v.dots && { ...v.dots, tapped: i + 1, lit: i } }));
          await say({ sound: ws[i].p });
        }
        score.current.total++;
        if (!slips) score.current.first++;
        noteAttempt(!slips);
        if (!slips) hit();
        await sleep(250);
        if (k === 0) {
          await say({ line: "fm_dots_say" });
          await sleep(1000); // time to say it
        }
        await sweepSay(w);
        void gift(el(w));
        bead();
        await sleep(500);
      }
      patch({ dots: null });
    },

    // ---- every bead lit; the closing line; the ninja celebrates (the reward's Hear it again starts with the line)
    done: async (b) => {
      pending.current = null;
      patch({ speaker: false, sound: null, point: null, burst: true, lit: beads.length });
      sfx.great();
      const r = stageXY(document.querySelector(".wu-bead.sticker"));
      fx.burst(r.x, r.y, "stars", 22);
      // the ninja's big finish plays with the closing line (a tier-up line still pending comes first)
      await Promise.race([ninja.linesDone(), sleep(2500)]);
      await Promise.all([say({ line: b.line }), sleep(500).then(() => (alive.current ? ninja.celebrate() : undefined))]);
    },
  };

  // ---- the shows (their first time, and their replays: Show me again, a hold's Hear it again). Each stops at its next
  // step once `live()` turns false (the child tapped, went on, or left).
  /** Sensei's fast and slow: the paw taps the rabbit ("I can say a word fast. Sun!": the card hops, the ribbon zips,
   *  the ninja dashes), then the tortoise ("Or I can say it slowly..." sssuuunnn: the card stretches, the ribbon draws
   *  with a dot per sound); in full, "Fast or slow, it's the same word. Sun!" and "Words are made of sounds!". */
  const fastSlowShow = async (b: Extract<Beat, { kind: "fastslow"; by: "sensei" }>, live: Live) => {
    const segs = segsOf(b.word).length || 3;
    if (b.show === "full") {
      const fast = say({ line: hasLine(`fm_fast_${b.word}`) ? `fm_fast_${b.word}` : "fm_fast_sun" });
      await pawAt(el("rabbit"), live);
      if (!live()) return;
      patch((v) => ({ speed: v.speed && { ...v.speed, rabbit: "flash" } }));
      await sleep(700);
      if (!live()) return;
      fastHop(b.word);
      await fast;
    } else {
      await pawAt(el("rabbit"), live);
      if (!live()) return;
      patch((v) => ({ speed: v.speed && { ...v.speed, rabbit: "flash" } }));
      fastHop(b.word);
      await say(plain(b.word));
    }
    if (!live()) return;
    patch((v) => ({ speed: v.speed && { ...v.speed, rabbit: "" } }));
    // slow: the paw taps the tortoise: "Or I can say it slowly..." [sssuuunnn], the card stretching like elastic,
    // the ribbon drawing along in time and a dot popping on for each sound; the ninja does a slow kata
    const slow = say({ line: "fm_slow" });
    await pawAt(el("tortoise"), live);
    if (!live()) return;
    patch((v) => ({ speed: v.speed && { ...v.speed, tortoise: "flash" } }));
    await slow;
    await sleep(120);
    if (!live()) return;
    await slowWord(b.word, live);
    patch((v) => ({ speed: v.speed && { ...v.speed, tortoise: "" } }));
    if (b.show !== "full" || !live()) return;
    // "Fast or slow, it's the same word. Sun!" (a hop on "Sun!")
    const same = say({ line: "fm_same_word" });
    await sleep(2700);
    if (!live()) return;
    fastHop(b.word);
    await same;
    if (!live()) return;
    // "Slowly, I can hear all its sounds. Words are made of sounds!" (the dots pulse in turn on "its sounds"; on
    // "made of sounds" a ki pulse at the dots). The 7.2 s "When I say a word slowly, I can hear the sounds that
    // make up the word..." is the fallback while the short take isn't recorded.
    const short = hasLine("fm_hear_sounds_short");
    const hear = say({ line: short ? "fm_hear_sounds_short" : "fm_hear_sounds" });
    const [dotsAt, kiAt] = short ? HEAR_SHORT_AT : [2.3, 5.4];
    const t = performance.now();
    const at = (s: number) => sleep(Math.max(0, s * 1000 - (performance.now() - t) * FAST));
    await at(dotsAt);
    for (let i = 0; i < segs && live(); i++) {
      patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, pulse: i } }));
      await sleep(340);
    }
    patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, pulse: -1 } }));
    if (!live()) return;
    await at(kiAt);
    if (live()) kiAtDots();
    await hear;
  };
  /** "Listen to the very first sound." sssun, sssock (the first dot under each goes gold), "Did you notice? Sun and sock
   *  start with the same sound..." /s/ (the sound picture comes in), "Say that sound with me!" /s/. `again`: the
   *  hold's Hear it again (the dots start grey again; nothing joins the bundle). */
  const noticeShow = async (b: Extract<Beat, { kind: "notice" }>, live: Live, again = false) => {
    const tell = again ? say : told;
    const ns = (w: string) => segsOf(w).length || 3;
    if (again) for (const w of b.words) setCard(w, { dots: { n: ns(w), gold: [] } });
    ninja.pose("listen"); // a hand cupped behind its ear
    try {
      await tell({ line: "fm_first_listen" });
      for (const w of b.words) {
        if (!live()) return;
        await sleep(60);
        setCard(w, { dots: { n: ns(w), gold: [0] } });
        await tell(onset(w));
      }
      if (!live()) return;
      await sleep(60);
      const notice = tell([{ line: b.line }, { gap: 300 }, { sound: b.p }]);
      await sleep(3000); // on "the same sound"
      if (!live()) return;
      kiAtFirstDots(b.words);
      patch({ sound: b.p });
      await notice;
      if (!live()) return;
      ninja.pose(null);
      await tell([{ line: "t_everyone_say" }, { gap: 200 }, { sound: b.p }]);
      await sleep(1000); // time for the child to say it
    } finally {
      ninja.pose(null);
    }
  };
  /** "Whoops!": a merged picture on the rail (the fish-dog) splits back into its two pictures, the ninja leapfrogs them
   *  and they swap places as Sensei starts, she reads them, and they merge again (the dog-fish). */
  const swapShow = async (b: Extract<Beat, { kind: "swap" }>, live: Live) => {
    const merged = viewRef.current.cards.filter((c) => !c.out && !b.cards.includes(c.w));
    if (merged.length) {
      const before = onRail([...b.cards].reverse());
      patch((v) => ({ cards: [...v.cards.filter((c) => !merged.includes(c)), ...before.map((c) => ({ ...c, x: PLAY_CX, moving: true, key: `${c.w}-sw` }))] }));
      await sleep(60);
      patch((v) => ({ cards: v.cards.map((c) => { const t = before.find((x) => x.w === c.w); return t && !c.out ? { ...c, x: t.x } : c; }) }));
      await sleep(450);
      setCards((cs) => cs.map((c) => ({ ...c, moving: false })));
      if (!live()) return;
    }
    const to = onRail(b.cards);
    await readAlong(b.cards, b.line, async () => {
      void ninja.act("flip");
      await sleep(300);
      if (!live()) return;
      patch((v) => ({ cards: v.cards.map((c) => { const t = to.find((x) => x.w === c.w); return t && !c.out ? { ...c, x: t.x } : c; }) }));
      sfx.whoosh();
    }, live);
    if (b.merge && live()) await merge(b.cards, b.merge, { quick: true, line: b.after }, live);
  };
  /** Sensei's big word: "Say them slowly: sun... flower." (the paw taps the tortoise; the cards light in turn) "Say
   *  them fast: sunflower!" (the paw taps the rabbit; the cards zip together and bloom into one, clean on the word). */
  const compoundShow = async (b: Extract<Beat, { kind: "compound" }>, live: Live) => {
    const main = b.lines[1] ?? b.lines[0];
    const times = WORD_TIMES[main] ?? [1.5, 2.6, 4.9];
    const t = performance.now();
    const at = (s: number) => sleep(Math.max(0, s * 1000 - (performance.now() - t) * FAST));
    void pawAt(el("tortoise"), live);
    const said = say({ line: main });
    patch((v) => ({ speed: v.speed && { ...v.speed, tortoise: "flash" } }));
    await at(times[0]);
    if (!live()) return;
    setCard(b.parts[0], { lit: true });
    await at(times[1]);
    if (!live()) return;
    setCard(b.parts[1], { lit: true });
    patch((v) => ({ speed: v.speed && { ...v.speed, tortoise: "" } }));
    await at(times[2] - 1.2);
    if (!live()) return;
    void pawAt(el("rabbit"), live);
    patch((v) => ({ speed: v.speed && { ...v.speed, rabbit: "flash" } }));
    // the cards zip together early enough that the sunflower is clean as Sensei says "sunflower!" (merge: the
    // glide, the pop and the fading sparkle take about 0.8 s), then it holds
    await at(times[2] - 0.85);
    if (!live()) return;
    void ninja.act("cast", { x: PLAY_CX, y: 380 }, { react: false });
    await merge(b.parts, b.word, { quick: true, saying: said }, live);
    patch((v) => ({ speed: v.speed && { ...v.speed, rabbit: "" } }));
  };
  /** What a hold's Hear it again plays: the show that has just ended, again. */
  const replayShow = async (b: Beat, live: Live) => {
    if (b.kind === "notice") return noticeShow(b, live, true);
    if (b.kind === "swap") return swapShow(b, live);
    if (b.kind === "fastslow" && b.by === "sensei") return fastSlowShow(b, live);
    if (b.kind === "compound" && b.by === "sensei") return say(b.lines.map((l) => ({ line: l })));
    if (b.kind === "rail" && b.by === "sensei") return say([{ line: b.line }, ...(b.after ? [{ gap: 300 }, { line: b.after }] : [])]);
  };

  // ---- small animations used by the beats
  const fastHop = (w: string) => {
    setCard(w, { fx: "hop" });
    patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, mode: "zip", ms: 300, shown: v.ribbon.dots } }));
    dash();
    sfx.whoosh();
    setTimeout(() => {
      setCard(w, { fx: "" });
      patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, mode: "idle" } }));
    }, 520);
  };
  /** The stretched word: the card stretches like elastic in time with the clip, the ribbon draws along it and a dot
   *  pops on as each sound begins; the ninja's slow kata plays in slow motion; then it all snaps back. */
  const slowWord = async (w: string, live: Live = isAlive) => {
    const ms = STRETCH_MS[w] ?? 1400;
    const n = segsOf(w).length || 3;
    setCard(w, { fx: "stretch", fxMs: ms });
    patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, mode: "draw", ms, shown: 0 } }));
    slowmo(true);
    void ninja.act("cast", { x: STAGE.x, y: STAGE.y + 210 }, { react: false, soft: true });
    const said = say(stretch(w));
    for (let i = 0; i < n && live(); i++) {
      patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, shown: i + 1 } }));
      await sleep(ms / n);
    }
    await said;
    slowmo(false);
    setCard(w, { fx: "" });
    patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, mode: "idle" } }));
  };
  const kiAtDots = () => {
    document.querySelectorAll(".wu-ribbon .wu-dot").forEach((d, i) => setTimeout(() => {
      const p = stageXY(d);
      fx.ring(p.x, p.y, { color: "#ffe38a", r0: 10, r1: 80, width: 8 });
      fx.twinkle(p.x, p.y, ["#fff4dc", "#ffe38a"], 6, 4);
    }, i * 120));
  };
  const kiAtFirstDots = (ws: string[]) => {
    ws.forEach((w, i) => setTimeout(() => {
      const d = document.querySelector(`.wu-slot[data-w="${w}"] .wu-cdot`);
      if (!d) return;
      const p = stageXY(d);
      fx.ring(p.x, p.y, { color: "#ffc53d", r0: 10, r1: 90, width: 9 });
      fx.glow(p.x, p.y, ["#ffe38a", "#ffc53d"], 6, 34, 1.2);
    }, i * 300));
  };
  const tidyStage = () => {
    if (viewRef.current.speed?.at === "stage" || viewRef.current.ribbon) patch({ speed: null, ribbon: null });
    if (viewRef.current.rail && !["rail", "swap", "compound"].includes(beatRef.current)) patch({ rail: null, speed: null });
  };
  const beatRef = useRef("");
  const beatNow = useRef<Beat | null>(null);
  /** the governor dropped this beat's demo (skipDemo) */
  const skipDemoNow = useRef(false);
  /** Sensei reads the pictures left to right: a light passes under each card on its word, and the ninja runs along
   *  with it, pausing under each. */
  const readAlong = async (ws: string[], line: string, during?: () => Promise<void>, live: Live = isAlive) => {
    const times = WORD_TIMES[line] ?? ws.map((_, i) => 0.1 + i * 0.7);
    // the lights follow the clip's own clock (audio.ts onClip): exact even when the clip starts late
    const started = nextClip(line, 1500);
    let t = performance.now();
    const said = say({ line });
    if (during) await during();
    const c = await started;
    if (c) t = c.start;
    for (let i = 0; i < ws.length && live(); i++) {
      await sleep(Math.max(0, times[i] * 1000 - (performance.now() - t) * FAST));
      if (!live()) break;
      const at = el(ws[i]);
      setCards((cs) => cs.map((c) => ({ ...c, lit: c.w === ws[i] })));
      if (at) {
        const p = stageRect(at);
        patch((v) => ({ rail: v.rail && { ...v.rail, light: p.x + p.w / 2 } }));
        runAlong(Math.max(0, p.x + p.w / 2 - 250), 320);
      }
    }
    // the whole pair, fast
    if (times[ws.length] != null && live()) {
      await sleep(Math.max(0, times[ws.length] * 1000 - (performance.now() - t) * FAST));
      if (live()) {
        setCards((cs) => cs.map((c) => ({ ...c, lit: ws.includes(c.w) })));
        patch((v) => ({ rail: v.rail && { ...v.rail, light: null } }));
      }
    }
    await said;
    if (!live()) return;
    setCards((cs) => cs.map((c) => ({ ...c, lit: false })));
    patch((v) => ({ rail: v.rail && { ...v.rail, light: null } }));
  };
  /**
   * The pictures bump together and merge into one (fish + dog → the fish-dog): the payoff of the lesson, so it is seen.
   * The sparkle bursts from all round the new picture and the ninja's gift of stars settles round it, not on it, both
   * gone within 0.4 s; then, on the clean picture, Sensei says the new word (`line`, "Fish dog!") while it bounces with
   * joy, and it holds, clean, for 1.5 s before the next beat (the beats' `secs` in warmups.ts count this).
   */
  const merge = async (ws: string[], into: string, o: { quick?: boolean; line?: string; saying?: Promise<unknown> } = {}, live: Live = isAlive) => {
    patch((v) => ({ cards: v.cards.map((c) => (ws.includes(c.w) ? { ...c, x: PLAY_CX, lit: false, moving: true } : c)) }));
    await sleep(o.quick ? 280 : 380);
    if (!live()) return;
    sfx.pop();
    const cy = RAIL_Y - 12 - 130, box = 260 + 2 * G;
    fx.halo(PLAY_CX, cy, box, box, ["#fff4dc", "#ffe38a", "#ffc53d"], 18, 22);
    fx.ring(PLAY_CX, cy, { color: "#fff4dc", r0: box / 2 + 6, r1: box / 2 + 90, width: 10, life: 20 });
    patch((v) => ({ cards: [...v.cards.filter((c) => !ws.includes(c.w)), { w: into, x: PLAY_CX, y: cy, size: 260, gutter: G, key: `${into}-merge` }] }));
    const living = LIVING.has(into) || ["fishdog", "dogfish", "starfish"].includes(into);
    await sleep(120);
    const gifted = living ? gift(el(into), { shape: "halo", brief: true }) : Promise.resolve();
    // the picture is clean again once the gift has landed and faded (≤ 0.4 s after it lands)
    await Promise.race([gifted.then(() => sleep(420)), sleep(1400)]);
    if (!live()) return;
    setCard(into, { fx: "joy" });
    if (o.line) await say({ line: o.line });
    // (a line already under way says the new word as the picture comes clean: it finishes first)
    if (o.saying) await o.saying;
    if (!live()) return;
    await sleep(1500);
    setCard(into, { fx: "" });
  };
  const tierHeld = () => crossesTier();
  /** "This is how we spell /s/": the ninja's spell drifts onto sound line `i` under a card, and the spelling appears. */
  const castOn = (w: string, i: number, show: () => void): Promise<void> => {
    const line = document.querySelectorAll(`.wu-slot[data-w="${w}"] .wu-lines .sound-line`)[i];
    if (!line) {
      show();
      return Promise.resolve();
    }
    return Promise.race([launch("cast", null, stageXY(line), { land: "chime" }), sleep(1500)]).then(show);
  };
  const spelt = useRef(new Set<string>());

  /** A hold on Next between two shows (docs/NAVIGATION.md rule 2: a step never moves on by itself): the show that has
   *  just ended stays on screen, Hear it again plays it again (and its sound picture stays), and the lesson goes on
   *  when the child taps Next. False: the lesson was left meanwhile. */
  const hold = async (key: string, prev: Beat) => {
    clearTold();
    setHolding(true);
    patch({ point: null });
    let tok = 0;
    const again = () => {
      const my = ++tok;
      hush();
      return replayShow(prev, () => my === tok && alive.current);
    };
    const ok = await holdNext(key, again, { sound: viewRef.current.sound ?? undefined });
    // (a replay still under way stops at its next step)
    if (tok) {
      tok++;
      hush();
    }
    slowmo(false);
    setHolding(false);
    return ok && alive.current;
  };

  // ---------------------------------------------------------------- the director
  useEffect(() => {
    alive.current = true;
    preload([
      ...script.beats.flatMap((b) => ("line" in b && b.line ? [urls.line(b.line)] : [])),
      ...["fm_show_me", "fm_you_try", "fm_show_me_2", "fm_you_try_2", "fm_its_this", "fm_last_one", "listen_again", "nav_ready"].map(urls.line),
      ...script.stickers.map(urls.word),
    ]);
    (async () => {
      await sleep(350);
      const lead = warmupLead.line;
      warmupLead.line = null;
      if (lead) await say({ line: lead });
      t0.current = performance.now() * FAST;
      p0.current = lessonPausedMs();
      // for the treadmill: when each beat started (lesson seconds), which the governor skipped, and where it held
      const log: { i: number; kind: string; at: number; skipped?: string; held?: number }[] = ((window as any).__snBeats = []);
      let prev: Beat | null = null;
      for (let i = 0; i < script.beats.length && alive.current; i++) {
        const b = script.beats[i];
        const last = b.kind === "done";
        // at the hard cap the beat under way is finished by the paw, then the lesson closes: after the cap, a new beat
        // only starts if it can still finish (with the paw's help and the closing line) by the cap
        const doneS = script.beats.find((x) => x.kind === "done")?.secs ?? 4;
        const capSkip = capped.current && (!!b.optional || elapsedS() + b.secs + doneS > script.capS);
        if (!last && (capSkip || skipOptional(script.beats, i, elapsedS(), script.targetS))) {
          log.push({ i, kind: b.kind, at: Math.round(elapsedS() * 10) / 10, skipped: capSkip ? "cap" : "behind" });
          if (!capSkip) skipBead(b);
          continue;
        }
        skipDemoNow.current = skipDemo(script.beats, i, elapsedS(), script.targetS);
        // a show that ends on Sensei (not on the child's answer), then a beat that opens with another show: hold on
        // Next in between, so the second never runs straight on from the first (W1: the notice → tap all; W2: the
        // swap → which did I read)
        let heldS: number | undefined;
        if (prev && endsWithShow(prev) && startsWithShow(b, skipDemoNow.current)) {
          const h0 = performance.now();
          if (!(await hold(`${script.key}:${i}`, prev))) return;
          heldS = Math.round(((performance.now() - h0) * FAST) / 100) / 10;
        }
        log.push({ i, kind: b.kind, at: Math.round(elapsedS() * 10) / 10, ...(skipDemoNow.current ? { skipped: "demo" } : {}), ...(heldS != null ? { held: heldS } : {}) });
        // a new game: its own Hear it again; Show me again goes, unless this is the child's half of Sensei's game
        clearTold();
        const ls = lastShow.current;
        if (!(ls && ls.game === b.kind && "by" in b && b.by === "child")) lastShow.current = null;
        capTried.current = false;
        patch({ sound: null, point: null });
        beatRef.current = b.kind;
        beatNow.current = b;
        setBeatKind(b.kind);
        await (run[b.kind] as (b: Beat) => Promise<void>)(b);
        prev = b;
      }
      if (!alive.current) return;
      patch({ speaker: false });
      store.set((s) => void ((s.warmups ??= {})[level.id] = { first: score.current.first, total: score.current.total }));
      (window as any).__snWarmup = { key: script.key, version: script.version, secs: Math.round(elapsedS()), score: score.current, closedByPaw: closedByPaw.current, skipped: log.filter((x) => x.skipped).map((x) => `${x.kind} (${x.skipped})`) };
      // the closing line goes to the reward, which says it first (docs/NAVIGATION.md rule 7): no hold here
      const closing = script.beats.find((x) => x.kind === "done");
      if (alive.current) onDone(1, closing?.kind === "done" ? { closing: closing.line } : undefined);
    })();
    return () => {
      alive.current = false;
      showTok.current++;
      ninja.setSlowmo(1);
      hush();
    };
  }, []);
  // a skipped optional beat's bead lights anyway (it was the child's turn that the clock took away)
  const skipBead = (b: Beat) => {
    if (beads.some((x) => x.b === b)) bead();
  };

  // ---- Help: once → the question again; twice → the answer glows; three times → the paw points at it (it never
  // answers for the child: docs/NAVIGATION.md rule 5). While Sensei shows something, what she has said in this beat.
  useHelp(
    (n) => {
      const p = pending.current;
      if (!p || p.done) {
        if (bundle.current.length) void say(bundle.current);
        return;
      }
      if (n === 1) void say(p.prompt);
      else {
        glow(p.answers());
        if (n >= 3 && !p.busy) pointAt(p);
        void say(p.prompt);
      }
    },
    [askN],
  );

  // ---- for bots (scripts/treadmill/bot.ts). During Show me again the turn is still the child's (busy): `next` stays.
  const p = pending.current;
  const sh = !!showing.current;
  (window as any).__snState = { scene: "warmup", key: script.key, beat: beatKind, next: p && !p.done && (!p.busy || sh) ? p.answers()[0] ?? null : null, asked: !!p?.asked, busy: !p || p.busy, capped: capped.current };
  // the child's turn is waiting: Hear it again and Show me again are live (dim while Sensei is still talking)
  const turn = !!p && !p.done && !p.busy && !!p.asked && !sh;

  // ---------------------------------------------------------------- render
  const v = view;
  return (
    <Frame level={level} className="wu" top={<LessonBeads n={beads.length} lit={v.lit} burst={v.burst} />}>
      {v.rail && <Rail arrow={v.rail.arrow} light={v.rail.light} />}
      <div className={`wu-cards pick-row ${v.spot ? "has-spot" : ""}`}>
        {v.cards.map((c) => (
          <CardSlot key={c.key ?? c.w} c={c} spot={v.spot === c.w} onTap={(t) => void tap(c.w, t)} />
        ))}
      </div>
      {v.ribbon && <Ribbon r={v.ribbon} />}
      {v.speed && <SpeedButtons s={v.speed} onTap={(id, t) => void tap(id, t)} />}
      {v.pockets && <Pockets n={v.pockets.n} filled={v.pockets.filled} />}
      {v.rails && <StackedRails rails={v.rails} spot={v.spot} onTap={(id, t) => void tap(id, t)} />}
      {v.dots && <Dots d={v.dots} onTap={(id, t) => void tap(id, t)} />}
      {v.paw && <TapHint show style={{ left: v.paw.x, top: v.paw.y, zIndex: 60 }} />}
      {v.point && !v.paw && <TapHint show style={{ left: v.point.x, top: v.point.y, zIndex: 60 }} />}
      <TurnNav ready={turn} again={v.speaker ? again : null} show={lastShow.current ? showAgain : null} sound={v.sound} hidden={holding || !v.speaker} />
    </Frame>
  );
}
export const EarsLevel = WarmupLevel;
/** A line to open the next warm-up with (the first check's "Let's do some warm-up training first!"). */
export const warmupLead: { line: string | null } = { line: null };
export const PicReadLevel = WarmupLevel;

/** Seconds from the paw answering an asked question to the end of its beat ("Here's the last one!", the move, the
 *  beat's last line); a tap-all takes longer (the paw finds what is left, then "You found them both!"). */
const END_S = 7;
const TAPALL_END_S = 10;
const TAPALL_SPELL_END_S = 15;
/** A beat that ends on Sensei's show, not on the child's answer (docs/NAVIGATION.md §5.C: the holds). */
const endsWithShow = (b: Beat) => b.kind === "notice" || b.kind === "swap" || ((b.kind === "fastslow" || b.kind === "rail" || b.kind === "compound") && b.by === "sensei");
/** A beat that opens with a show before the child's turn: a demo, Sensei's half of a game, or new pictures named. */
const startsWithShow = (b: Beat, noDemo: boolean) =>
  b.kind === "tapall" || b.kind === "notice" || b.kind === "swap" || b.kind === "sounds" || b.kind === "dots" ||
  ((b.kind === "tap" || b.kind === "slowpick") && !!b.demo) || (b.kind === "which" && !!b.demo && !noDemo) ||
  ((b.kind === "fastslow" || b.kind === "rail" || b.kind === "compound") && b.by === "sensei");
/** fm_hear_sounds_short "Slowly, I can hear all its sounds. Words are made of sounds!": when "its sounds" starts (the
 *  dots pulse) and when "made of sounds" starts (the ki pulse), in seconds into the clip. */
const HEAR_SHORT_AT: [number, number] = [1.5, 3.0];
/** Pictures Sensei has named in this session (a card is named once, the first time it appears, across lessons). */
const namedThisSession = new Set<string>();

/** Stretched clip lengths (ms), for the elastic card and the ribbon (public/a/x/*.mp3). */
const STRETCH_MS: Record<string, number> = { sun: 2440, sock: 900, cat: 1330, dog: 810, mug: 1500 };
/** A stable shuffle (the same child sees the same order on a replay of the same item). */
function shuffleStable(a: string[], seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return [...a].sort((x, y) => ((x.charCodeAt(0) * 7 + h) % 5) - ((y.charCodeAt(0) * 7 + h) % 5));
}
/** Keep cards already on screen where they are when a beat reuses them; bring the others in as a row. */
function layoutRow(cs: CardView[], ws: string[]): CardView[] {
  const target = row(ws);
  return [...cs.filter((c) => !ws.includes(c.w)).map((c) => ({ ...c, out: true })), ...target.map((t) => ({ ...(cs.find((c) => c.w === t.w && !c.out) ?? {}), ...t, state: "" as CardState, key: cs.find((c) => c.w === t.w && !c.out)?.key ?? `${t.w}-row` }))];
}

// ---------------------------------------------------------------- the ninja's whole-body moves (Early's float layer)
/** A lightning dash out and back (fast). */
const DASH: Spec = {
  total: 460, depart: 120, from: [0.9, 0.7], style: "dart", speed: 1800, bolt: "ki",
  keys: [[0, 0, 0, 0, 1, 1, "ease-out"], [90, -12, 2, 4, 0.94, 1.05, "cubic-bezier(.15,.85,.25,1.15)"], [190, 170, -6, -6, 1.18, 0.9, "linear"], [260, 176, -6, -5, 1.05, 0.97, "ease-in"], [460, 0, 0, 0, 1, 1]],
  poses: [[0, "ready"], [90, "run"], [300, "ready"]],
  air: [80, 300],
};
/** Run along the reading rail to `toX` and back (the reading finger). */
function runSpec(toX: number, ms: number): Spec {
  const out = ms * 0.45, stay = ms * 0.15;
  return {
    total: ms, depart: 0, from: [0.5, 0.5], style: "glide", speed: 1500, bolt: "stars",
    keys: [[0, 0, 0, 0, 1, 1, "ease-in"], [out, toX, -4, -3, 1.04, 0.97, "ease-out"], [out + stay, toX, 0, 0, 1, 1, "ease-in"], [ms, 0, 0, 0, 1, 1]],
    poses: [[0, "run"], [out, "ready"], [out + stay, "run"], [ms - 40, "idle"]],
    air: [0, out],
  };
}

// ---------------------------------------------------------------- pieces
function CardSlot({ c, spot, onTap }: { c: CardView; spot: boolean; onTap: (el: HTMLElement) => void }) {
  const gutter = c.gutter ?? G;
  const el = c.size + 2 * gutter;
  const state: CardState = spot ? "spot" : c.state ?? "";
  return (
    <div
      className={`wu-slot ${c.out ? "out" : ""} ${c.moving ? "moving" : ""} ${c.fx ? `fx-${c.fx}` : ""} ${c.lit ? "lit" : ""}`}
      data-w={c.w}
      aria-hidden={c.out || c.moving || undefined}
      style={{ left: c.x - el / 2, top: c.y - el / 2, width: el, height: el, "--fx-ms": `${c.fxMs ?? 300}ms` } as CSSProperties}
    >
      <PicCard w={c.w} size={c.size} gutter={gutter} state={state} onTap={onTap} />
      {c.dots && (
        <div className="wu-cdots" aria-hidden="true">
          {Array.from({ length: c.dots.n }, (_, i) => <span key={i} className={`${i === 0 ? "wu-cdot" : ""} ${c.dots!.gold.includes(i) ? "gold" : ""}`} />)}
        </div>
      )}
      {c.lines && (
        <div className="wu-lines" aria-hidden="true">
          {Array.from({ length: c.lines.n }, (_, i) => {
            const s = c.lines!.show.find((x) => x.i === i);
            return <span key={i} className="sound-line">{s && <Tile g={s.g} size="sm" className="reveal" style={{ pointerEvents: "none" }} />}</span>;
          })}
        </div>
      )}
    </div>
  );
}

/** One bead per thing the child does, with the sticker as the last bead: the reward is in sight from the start. */
function LessonBeads({ n, lit, burst }: { n: number; lit: number; burst: boolean }) {
  return (
    <div className="wu-beads" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <span key={i} className={`wu-bead ${i < lit ? "on" : ""}`} />)}
      <span className={`wu-bead sticker ${burst ? "burst" : ""}`}><img src={img("item_star")} alt="" /></span>
    </div>
  );
}

/** The tortoise (slow) and the rabbit (fast): either side of the big card, or under the rail's right end. */
function SpeedButtons({ s, onTap }: { s: NonNullable<View["speed"]>; onTap: (id: string, el: HTMLElement) => void }) {
  const at = s.at === "stage" ? { tortoise: { x: STAGE.x - 280, y: STAGE.y }, rabbit: { x: STAGE.x + 280, y: STAGE.y } } : { tortoise: { x: 912, y: 604 }, rabbit: { x: 1040, y: 604 } };
  const size = s.at === "stage" ? 128 : 108;
  return (
    <>
      {(["tortoise", "rabbit"] as const).map((id) => (
        <button
          key={id}
          aria-label={id}
          className={`wu-speed ${id} ${s[id]}`}
          style={{ left: at[id].x - size / 2, top: at[id].y - size / 2, width: size, height: size }}
          {...tapProps<HTMLButtonElement>((el) => onTap(id, el))}
        >
          <img src={img(id === "tortoise" ? "ui_tortoise" : "ui_rabbit")} alt="" draggable={false} />
        </button>
      ))}
    </>
  );
}

/** The sound ribbon under the fast/slow card: it zips across (fast) or draws along with a dot per sound (slow). */
function Ribbon({ r }: { r: NonNullable<View["ribbon"]> }) {
  return (
    <div className={`wu-ribbon ${r.mode}`} style={{ left: STAGE.x - 150, top: STAGE.y + 180, "--ms": `${r.ms}ms` } as CSSProperties} aria-hidden="true">
      <span className="wu-ribbon-fill" />
      <span className="wu-ribbon-dots">
        {Array.from({ length: r.dots }, (_, i) => <span key={i} className={`wu-dot ${i < r.shown ? "on" : ""} ${r.pulse === i ? "pulse" : ""}`} />)}
      </span>
    </div>
  );
}

/** Pockets beside the tap-all grid: they show how many to find, and fill with a mini-card per find. */
function Pockets({ n, filled }: { n: number; filled: string[] }) {
  const top = 306 - (n * 104 - 14) / 2;
  return (
    <div className="wu-pockets" style={{ top }} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`wu-pocket ${filled[i] ? "full" : ""}`}>{filled[i] && <img src={img(`pic_${filled[i]}`)} alt="" />}</span>
      ))}
    </div>
  );
}

/** The bamboo reading rail, with a brush-stroke arrow at its left end pointing right, and a light passing along it. */
function Rail({ arrow, light }: { arrow: string; light: number | null }) {
  return (
    <div className="wu-rail" style={{ top: RAIL_Y - 14 }} aria-hidden="true">
      <span className="wu-rail-bar" />
      <svg className={`wu-rail-arrow ${arrow}`} viewBox="0 0 120 60">
        <path d="M6 34 C30 26 62 26 92 30" fill="none" stroke="#2b1d14" strokeWidth="16" strokeLinecap="round" />
        <path d="M6 34 C30 26 62 26 92 30" fill="none" stroke="#ffc53d" strokeWidth="9" strokeLinecap="round" />
        <path d="M84 12 L114 30 L84 48 Z" fill="#ffc53d" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
      </svg>
      {light != null && <span className="wu-rail-light" style={{ left: light - 360 }} />}
    </div>
  );
}

/** "Which did I read?": two short rails, one above the other; the child taps a whole rail. */
function StackedRails({ rails, spot, onTap }: { rails: NonNullable<View["rails"]>; spot: string | null; onTap: (id: string, el: HTMLElement) => void }) {
  const size = 150;
  return (
    <div className="wu-rails">
      {rails.rows.map((ws, r) => (
        <button key={r + ws.join()} aria-label={`rail ${r}`} className={`wu-rail-btn ${rails.state[r]}`} style={{ top: r === 0 ? 92 : 318 }} {...tapProps<HTMLButtonElement>((el) => onTap(`rail ${r}`, el))}>
          {ws.map((w, i) => (
            <span key={w} className={`wu-rail-card ${rails.light && rails.light[0] === r && rails.light[1] === i ? "lit" : ""}`}>
              <PicCard w={w} size={size} gutter={10} still state={spot === w ? "spot" : ""} />
            </span>
          ))}
          <span className="wu-rail-line" />
        </button>
      ))}
    </div>
  );
}

/** Sound dots under a picture (W6), tapped left to right like sound buttons. */
function Dots({ d, onTap }: { d: NonNullable<View["dots"]>; onTap: (id: string, el: HTMLElement) => void }) {
  return (
    <div className={`wu-dotrow ${d.sweep ? "sweep" : ""}`} style={{ width: d.n * 136 }}>
      <span className="wu-dotrow-line" />
      {Array.from({ length: d.n }, (_, i) => (
        <button key={i} aria-label={`dot ${i}`} className={`wu-bigdot ${i < d.tapped ? "on" : ""} ${d.lit === i ? "lit" : ""} ${d.wrong === i ? "wrong" : ""}`} {...tapProps<HTMLButtonElement>((el) => onTap(`dot ${i}`, el))} />
      ))}
    </div>
  );
}

/** A copy of a card flies into a pocket (a find). Resolves on arrival. */
function flyCopy(from: Element, to: Element, ms: number): Promise<void> {
  const layer = document.querySelector(".fx-dom");
  if (!layer) return Promise.resolve();
  const a = stageRect(from), b = stageRect(to);
  const img0 = from.querySelector("img");
  const c = document.createElement("img");
  c.src = img0?.getAttribute("src") ?? "";
  c.className = "wu-fly";
  c.style.width = c.style.height = `${Math.min(a.w, a.h) * 0.7}px`;
  layer.appendChild(c);
  const s0 = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, s1 = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const k = b.w / (Math.min(a.w, a.h) * 0.7);
  const size = Math.min(a.w, a.h) * 0.7;
  const anim = c.animate(
    [
      { transform: `translate(${s0.x - size / 2}px, ${s0.y - size / 2}px) scale(1)` },
      { transform: `translate(${(s0.x + s1.x) / 2 - size / 2}px, ${Math.min(s0.y, s1.y) - 120 - size / 2}px) scale(${(1 + k) / 2}) rotate(-12deg)`, offset: 0.5 },
      { transform: `translate(${s1.x - size / 2}px, ${s1.y - size / 2}px) scale(${k})` },
    ],
    { duration: ms, easing: "cubic-bezier(.3,.7,.4,1)" },
  );
  anim.playbackRate = FAST;
  return anim.finished.then(
    () => {
      c.remove();
      sfx.place();
      fx.twinkle(s1.x, s1.y, ["#fff4dc", "#ffe38a"], 8, 4);
    },
    () => c.remove(),
  );
}
