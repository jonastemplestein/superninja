// The warm-ups (docs/FIRST_MINUTES.md §5, §7, §9, §10): EarsLevel (Ninja Ears) and PicReadLevel (Ninjas Read This
// Way). The lesson scripts are data (src/content/warmups.ts); this scene plays them game by game.
//
// Every game is taught the way a teacher would (docs/TEACHER_SCRIPT.md §3.5–§3.12, the forms in §2.2, the registry in
// src/content/games.ts): Sensei says what the game is and who does what (the frame), does one herself, thinking aloud in
// the first person while the paw moves (the demo), asks whether the child wants a go (the Ready hold: ▶ = "I'm ready",
// the paw = "show me again", a tap on the board = ready too), and hands over in the demo's own words ("Your word is
// sock. Can you find the sock?"). A game the child already knows is a one-line recap or a short line (gameForm), never
// the full frame again. Rules for every turn (§5):
//   · every picture is named aloud when it first appears, with its card spotlit (a warm-white ring, never gold);
//   · a tap while Sensei is naming spotlights that card (and says its word when she has finished); a tap during a
//     question is an answer, and cuts her off;
//   · idle (§5.5): 8 s → the game's rephrase (the answer glows); 12 s → "Not sure? Tap my paw…" (once a save); 16 s →
//     the paw points at the answer ("Here it is. Tap it when you're ready."); 24 s → "Take your time, ninja."; then the
//     question twice more, then quiet (docs/NAVIGATION.md rule 5: nothing ever answers for the child);
//   · mistakes are gentle (§5.4): the tapped card wobbles and says its own word, Sensei rephrases and ends on the
//     answer; a second miss: "Let's do it together. It's this one. Now you tap it." (the answer glows, the paw points);
//   · Help: once → the rephrase; twice → the answer glows ("Look for the glow."); three times → the paw points;
//   · navigation (docs/NAVIGATION.md): Home top-left; Hear it again (the speaker) replays this turn's bundle (the frame
//     on a game's first turn, the naming, the question), dim while Sensei is talking; Show me again (the paw) replays
//     the demo, never answers; a sound's petal sits beside the speaker while a game is about a sound (SOUND_DISPLAY);
//   · the ninja's move is the praise; a praise line comes at most every third right answer (§5.3);
//   · lesson beads (top-centre) instead of a progress bar, with a sticker as the last bead;
//   · the time governor: an optional beat (◇) is skipped when the lesson is behind its target clock (time at a held
//     Next and on replays doesn't count); a first meeting's frame, demo and Ready are never skipped; at the hard cap the
//     answers glow and the child's turn waits for their first tap, then the paw finishes the beat;
//   · fast and slow (TEACHER_SCRIPT §9): the scene's own big tortoise and rabbit light on every slow word and every fast
//     word after one, and the rabbit's tap is the child's own "say it fast" (the nav layer's small badges hide:
//     `speed: { own: true }`);
//   · the streak: only real choices between pictures count, and in the warm-ups a tier-up powers the ninja up without
//     a spoken line.
// Layout (docs/HERO.md): the ninja bottom-left, Help bottom-right, everything to tap in the play area x 340–1110; the
// tortoise and the rabbit sit in the right-hand column (x 1196) when the stage isn't theirs.
// Performance (docs/PERF.md): everything moves on transform and opacity (cards glide on `translate`, a size change is a
// scale from the old size), nothing endless runs on a hidden element, and there is no rAF loop.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import { say, sfx, hush, isSpeaking, preload, urls, nextClip, type Say } from "../engine/audio";
import { speak } from "../engine/speech";
import { FAST } from "../engine/fast";
import { store, noteAttempt, recordFoundation } from "../engine/store";
import { streak } from "../engine/streak";
import { praiseFor, praiseBy, praiseWanted } from "../engine/feedback";
import {
  warmupScript, skipOptional, skipDemo, overCap, beadCount, beadsIn, gameOf, diffLine, stretch, plain, firstSay,
  segsOf, hasLine, WORD_TIMES, WHICH_DEMO, SQUISH_DEMO, type Beat,
} from "../content/warmups";
import { GAMES, fillLine, openingLines, playsDemo, type GameId, type LineSlots } from "../content/games";
import { FS_IDEAS, FS_IDEA_ALSO, FS_IDEA_CAP, type FrameForm } from "../content/narrative";
import { SLOW_TIMES } from "../content/stretch";
import { wordAt } from "../content/word-times";
import { img, fx, sleep, tapProps, useHelp, TapHint, Tile, stageRect, stageXY } from "../ui/ui";
import { ninja } from "../ui/Ninja";
import { Frame, PicCard, LIVING, rightAnswer, afterLanding, useLevelAudio, gift, cornerOf, launch, crossesTier, moveNinja, PLAY_CX, type CardState, type Spec } from "./Early";
import { heard, onceInSave, beginLevel, gameForm, readyAsk, framed, played, struggledIn, fsIdea, fsPraise, fsReadback, fsSaid, fsStuckSay, fsHeardThisSession } from "./narrate";
import { useNav, useHome, holdNext, holdReady, readyTap, readyHeld, readyStop, navLog, useHeld, ReplayButton, NAV_SLOTS, slotStyle, type ReadyAnswer } from "../ui/nav";
import { SoundBadge, SoundDots, badgeHeight, TIER_WIDTH } from "../ui/SoundBadge";
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
  /** the hop (fast), a notch wider on each sound of the slow way (`step`), the joy bounce (a merged picture) */
  fx?: "" | "hop" | "step" | "joy";
  step?: number;
  /** sound dots under the card: how many, and which swell to gold */
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
type SpeedId = "tortoise" | "rabbit";
interface SpeedView {
  tortoise: Btn;
  rabbit: Btn;
  /** either side of the big card (the rabbit and the tortoise's own game), or the right-hand column */
  at: "stage" | "side";
  /** not popped in yet */
  hide?: SpeedId[];
  /** the rabbit waits for the child's tap (Move 1): it grows to a full tap target */
  big?: boolean;
  /** on the move between the stage and the column: not tappable for that moment */
  moving?: boolean;
  /** moved while unseen (popped out, then in): their place changes at once, with no glide (SpeedButtons' `jump`) */
  jump?: boolean;
}
interface View {
  cards: CardView[];
  spot: string | null;
  speed: SpeedView | null;
  /** the sound ribbon under the rabbit and the tortoise's card: the dots pop on as each sound of the slow way starts */
  ribbon: null | { mode: "idle" | "zip" | "step"; dots: number; shown: number; pulse: number };
  pockets: null | { n: number; filled: string[]; glow?: boolean };
  rail: null | { arrow: "" | "glow" | "pulse"; light: number | null };
  rails: null | { rows: string[][]; state: Btn[]; light: [number, number] | null };
  /** Sound Dots (W6): a dot becomes its sound's mini petal once it has sounded; `x`, the row's (and its picture's)
   *  centre, and `pitch`, the room each dot has (DOTS_AT) */
  dots: null | { word: string; ps: PhonemeId[]; tapped: number; lit: number; sweep: boolean; wrong: number; pulse: number; arrow: boolean; x: number; pitch: number };
  /** Guess My Word (W5): neutral dots, one per sound (Dec1), that bloom into mini petals under the chosen picture */
  sdots: null | { n: number; lit: number; bloom: PhonemeId[] | null; x: number; y: number; key: string };
  /** a sound's petal arriving (hero size): its introduction animation, then the child's tap, then it glides to the nav row */
  hero: null | { p: PhonemeId; intro: boolean; wait: boolean; x: number; y: number; key: string };
  /** the cards step back (dim) while a new sound's petal arrives in front of them */
  scrim: boolean;
  /** the paw on its way to tap something (a demo) */
  paw: { x: number; y: number } | null;
  /** the paw pointing at the answer and waiting (idle help, Help's third press): it never taps */
  point: { x: number; y: number } | null;
  /** Hear it again is on screen (from the first question on) */
  speaker: boolean;
  /** the sound this game is about: its petal sits beside Hear it again (docs/NAVIGATION.md §4) */
  sound: PhonemeId | null;
  /** the paw (Show me again) pulses: "Not sure? Tap my paw…" */
  showPulse: boolean;
  lit: number; // beads lit
  burst: boolean; // the sticker bead bursts
}
const EMPTY: View = { cards: [], spot: null, speed: null, ribbon: null, pockets: null, rail: null, rails: null, dots: null, sdots: null, hero: null, scrim: false, paw: null, point: null, speaker: false, sound: null, showPulse: false, lit: 0, burst: false };
type Live = () => boolean;
type Answer = { id: string; el: Element | null; auto: boolean; helped: boolean };

// ---------------------------------------------------------------- layouts (stage px; the play area is x 340–1110)
const G = 20;
function row(ws: string[], size = 210, cy = 300, gap = 0, gutter = G): CardView[] {
  const el = size + 2 * gutter;
  const total = ws.length * el + (ws.length - 1) * gap;
  const x0 = PLAY_CX - total / 2 + el / 2;
  return ws.map((w, i) => ({ w, x: x0 + i * (el + gap), y: cy, size, gutter }));
}
/** a grid of 4–6 cards (3 across), left of the pockets */
const GRID_CX = PLAY_CX - 62;
function grid(ws: string[]): CardView[] {
  const size = 180, gutter = 16, el = size + 2 * gutter;
  const rows = ws.length <= 4 ? [ws.slice(0, 2), ws.slice(2)] : [ws.slice(0, 3), ws.slice(3)];
  return rows.flatMap((r, ri) => r.map((w, i) => ({ w, x: GRID_CX + (i - (r.length - 1) / 2) * el, y: 202 + ri * el, size, gutter })));
}
const RAIL_Y = 520;
/** pictures standing on the reading rail, left to right */
function onRail(ws: string[]): CardView[] {
  const size = ws.length >= 3 ? 196 : 230, gutter = G, gap = ws.length >= 3 ? 16 : 40;
  return row(ws, size, RAIL_Y - 12 - size / 2, gap, gutter);
}
const STAGE = { x: PLAY_CX, y: 280, size: 290 };
/** The notice: the two cards far enough apart for the petal to arrive between them. */
const NOTICE = { size: 200, y: 250, xs: [482, 978] as const };
/** Where a sound's petal arrives (hero size, 220 × 302): between the notice's cards, or over the Pocket Hunt grid. */
const HERO_AT = { notice: { x: PLAY_CX, y: 250 }, grid: { x: GRID_CX, y: 300 } };
/** With captions on (a grown-ups' setting, off by default), Sensei's bubble reaches left to x 802 below y 400 (right 18,
 *  max-width 460, up to three lines: ui/nav.tsx FS_CAPTION). The rows of dots under a picture keep left of it, so no dot
 *  or mini petal is ever under the bubble (verify round 2: W6's third petal, /t/ of cat, under "If you say the sounds,
 *  you can hear the word."). Without captions they stay centred in the play area. */
const captionsOn = () => !!store.get().settings?.captions;
/** Sound Dots (W6): the picture and its dot row, centred; with captions, 110 px left and the dots a little closer, so
 *  the last one ends at x 794 and the arrow at the row's left end stays in the play area (x ≥ 340). */
const DOTS_AT = { plain: { x: PLAY_CX, pitch: 136 }, captions: { x: 620, pitch: 124 } };
/** Guess My Word's neutral dots (W5, 192 px for three): under the middle picture; with captions, ending at x 790. */
const SDOTS_X = { plain: PLAY_CX, captions: 694 };
/** The tortoise and the rabbit: either side of the big card, or the right-hand column (clear of the play area, the
 *  nav row, ▶ and Help), tortoise above rabbit. Drawn 128 px, scaled. */
const SPEED_AT = {
  stage: { tortoise: { x: STAGE.x - 280, y: STAGE.y }, rabbit: { x: STAGE.x + 280, y: STAGE.y }, k: 1 },
  side: { tortoise: { x: 1196, y: 262 }, rabbit: { x: 1196, y: 404 }, k: 0.8 },
};
const SPEED_D = 128;
/** Move 1's live rabbit in the column: grown to 128 (160 as it pulses), so it steps in from the edge to stay whole on
 *  the stage (its ring included), clear of the cards (x ≤ 1100) and Help. */
const SPEED_LIVE = { x: 1170, y: 400 };

// ---------------------------------------------------------------- the scene
/** Ninja Ears (warm-up W1, W3, W5) and Ninjas Read This Way (W2, W4, W6): one player for both kinds. */
export function WarmupLevel({ level, onDone, onQuit }: LevelProps) {
  const band = store.get().band;
  const [script] = useState(() => {
    // a new level for the voice's per-level caps, the praise rhythm and fast and slow (narrate.tsx)
    beginLevel(level);
    return warmupScript(level.warmup ?? "W1", band);
  });
  const nBeads = beadCount(script.beats);
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
  const setCard = (w: string, p: Partial<CardView>) => setCards((cs) => cs.map((c) => (c.w === w && !c.out ? { ...c, ...p } : c)));
  const setSpeed = (p: Partial<SpeedView> | null) => patch((v) => ({ speed: p === null ? null : v.speed ? { ...v.speed, ...p } : { tortoise: "", rabbit: "", at: "side", ...p } }));
  const light = (id: SpeedId, b: Btn) => patch((v) => ({ speed: v.speed && { ...v.speed, [id]: b } }));
  const [beatKind, setBeatKind] = useState<string>("");
  const alive = useRef(true);
  const isAlive: Live = () => alive.current;
  useLevelAudio();
  useHome(onQuit);

  // ---- the game being played (TEACHER_SCRIPT §2.2): its form for this child, and what its turns needed
  // (the lesson's first game from the first frame, so __snState.game is never a bare "warmup" while it opens)
  const [game, setGame] = useState<GameId | null>(() => (script.beats[0] ? gameOf(script.beats[0]) : null));
  const gameRef = useRef<GameId | null>(null);
  const formRef = useRef<FrameForm>("full");
  const opened = useRef(false);
  /** this game's telling has been recorded (framed): on the Ready's answer, or a recap's first answer */
  const toldGame = useRef(false);
  /** per turn of this game: whether it reached the second-miss help or the 16 s point ("struggled") */
  const turns = useRef<boolean[]>([]);
  /** the games this lesson has played so far */
  const playedHere = useRef(new Set<GameId>());
  const startGame = (g: GameId): FrameForm => {
    // (a level never opens on "none": its first game says at least its short line. "none" is a later play of the same
    // game inside a level (TEACHER_SCRIPT §2.2): a game met earlier this session, in another lesson, is short here, as
    // W3's rabbit and tortoise after W1, and W4's games after W2 (§3.9, §3.10))
    const f0 = gameForm(g, { opening: !opened.current });
    const f = f0 === "none" && !playedHere.current.has(g) ? "short" : f0;
    playedHere.current.add(g);
    opened.current = true;
    gameRef.current = g;
    formRef.current = f;
    toldGame.current = false;
    turns.current = [];
    setGame(g);
    clearTold();
    return f;
  };
  const endGame = () => {
    const g = gameRef.current;
    if (g) played(g, { struggled: struggledIn(turns.current) });
  };
  /** Record the telling at the child's first answer where no Ready hold did: a recap without its hold, and a full form
   *  that has no Ready (the notice, a show the child drives). */
  const firstAnswer = () => {
    const g = gameRef.current;
    if (!g || toldGame.current) return;
    const f = formRef.current;
    if (f === "recap" || (f === "full" && !GAMES[g].full.ready)) {
      framed(g);
      toldGame.current = true;
    }
  };
  /** Line ids that are recorded, as one say() list with small gaps. */
  const lines = (ids: readonly string[], gap = 250): Say[] => ids.filter(hasLine).flatMap((id, i) => (i ? [{ gap }, { line: id }] : [{ line: id }]));
  const lineOr = (id: string, or: Say[]): Say[] => (hasLine(id) ? [{ line: id }] : or);
  const petalSay = (p: PhonemeId): Say => ({ sound: p, show: "petal" });

  // ---- Hear it again (docs/NAVIGATION.md §3.5): this game's bundle, what Sensei has said that the child needs (the
  // frame, the naming of new pictures, an explanation), said with told(); Hear it again says it and then the question
  // being asked. It starts again at each game (and at each item of a many-item game), so it never replays an older
  // question. Feedback (praise, corrections) is said with plain say().
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
  /** A hold covers the lesson (holdReady, holdNext): its controls are the nav layer's, so the lesson's own are hidden. */
  const [holding, setHolding] = useState(false);

  // ---- asking (the child's turn)
  interface Pending {
    answers: () => string[];
    prompt: Say[];
    resolve: (r: { id: string; el: Element | null; auto: boolean }) => void;
    onWrong?: (id: string, el: Element | null) => Promise<void>;
    /** taps on these are ignored (e.g. the dots already tapped) */
    ignore?: (id: string) => boolean;
    /** a gentle glow on the answer after this long (the first turn of all is guided) */
    glowAfterMs?: number;
    /** the 8 s idle (§5.5): the game's own rephrase; default: the answers glow and the question again */
    idle?: () => unknown;
    /** this turn goes on by itself after this long (the petal join-in: "12 s, the lesson goes on") */
    autoMs?: number;
    /** the tortoise and the rabbit are on screen but aren't answers to this question (Slow Words, Guess My Word): the
     *  tortoise says the slow way again (`tortoise`); the rabbit only wiggles (it would say the answer fast) */
    speed?: { tortoise: () => Promise<unknown> };
    /** the question is the clip with this id (the slow word, the first sound): a picture tapped before it starts is
     *  spotlit and says its word, as while Sensei is naming; from its start a tap is an answer (TEACHER_SCRIPT §3.11:
     *  "a picture works from the first sound") */
    armOn?: string;
    /** false until `armOn`'s clip starts */
    armed?: boolean;
    /** 12 s idle: the paw pulses and Sensei offers it ("first": the save's first full-form turn; "short": a known
     *  game's canonical demo) */
    offer?: "first" | "short";
    helped?: boolean;
    /** the second-miss help or the 16 s point was reached (TEACHER_SCRIPT §2.2's "struggled") */
    struggle?: boolean;
    tookTime?: boolean;
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

  const el = (id: string): Element | null =>
    document.querySelector(`.wu .wu-slot:not(.out) [aria-label="${CSS.escape(id)}"]`) ??
    document.querySelector(`.wu [aria-label="${CSS.escape(id)}"]`) ??
    document.querySelector(`.wu [data-pic="${CSS.escape(id)}"]`);
  const glow = (ids: string[], help = true) => {
    if (help && pending.current) pending.current.helped = true;
    for (const id of ids) {
      if (id === "tortoise" || id === "rabbit") light(id, "glow");
      else if (id.startsWith("rail ")) patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s, i) => (`rail ${i}` === id ? "glow" : s)) } }));
      else if (id.startsWith("dot ")) patch((v) => ({ dots: v.dots && { ...v.dots, pulse: Number(id.slice(4)) } }));
      else if (id.startsWith("petal ")) void 0; // (the petal breathes by itself while it waits)
      else setCard(id, { state: "glow" });
    }
  };
  const clearTimers = (p: Pending) => {
    p.timers.forEach(clearTimeout);
    p.timers = [];
  };
  /** The paw points at the (first) answer and stays there: idle help, never an answer. */
  const pointAt = (p: Pending) => {
    p.helped = true;
    const t = el(p.answers()[0] ?? "");
    if (!t) return;
    const r = stageRect(t);
    patch({ point: { x: r.x + r.w * 0.55, y: r.y + r.h * 0.5 } });
  };
  /** The 8 s rephrase (and Help's first press). */
  const rephrase = (p: Pending) => {
    if (p.idle) return p.idle();
    glow(p.answers());
    return say(p.prompt);
  };
  /** "Not sure? Tap my paw, and I'll show you again." (the save's first full-form turn, once) or "If you'd like to see me
   *  do one first, tap my paw." (a known game with its own demo, once a game): the paw pulses until the turn ends. */
  const offered = useRef(false);
  const offerShow = (p: Pending) => {
    if (!lastShow.current || offered.current) return;
    const id = p.offer === "first" ? "tv_show_offer" : "tv_show_offer_short";
    if (p.offer === "first" && !onceInSave("offer:show")) return;
    offered.current = true;
    patch({ showPulse: true });
    void say({ line: id }).then((ok) => ok && p.offer === "first" && heard("offer:show"));
  };
  /** Idle ladder (TEACHER_SCRIPT §5.5; docs/NAVIGATION.md §3.2), game time from the question: 8 s the rephrase, 12 s the
   *  paw's offer, 16 s the paw points ("Here it is. Tap it when you're ready."), 24 s "Take your time, ninja.", then the
   *  question twice more, then quiet. Nothing answers for the child. Past the cap the answers glow at once; once the
   *  child has tapped since the cap, the paw finishes the question (pawClose). */
  const startIdle = (p: Pending) => {
    clearTimers(p);
    if (p.done) return;
    if (capped.current && p.asked) {
      if (capTried.current) return void pawClose(p);
      glow(p.answers());
    }
    const later = (ms: number, f: () => void) => p.timers.push(window.setTimeout(() => !p.done && !p.busy && !showing.current && f(), ms));
    if (p.glowAfterMs != null) later(p.glowAfterMs, () => glow(p.answers().slice(0, 1), false));
    later(8000, () => void rephrase(p));
    // (a join-in that goes on by itself: the petal, the rabbit; no pointing, nothing more)
    if (p.autoMs != null) return void later(p.autoMs, () => p.resolve({ id: p.answers()[0] ?? "", el: null, auto: true }));
    if (p.offer) later(12000, () => offerShow(p));
    later(16000, () => {
      pointAt(p);
      p.struggle = true;
      void say({ line: "tv_idle_point" });
    });
    later(24000, () => {
      if (p.tookTime) return;
      p.tookTime = true;
      void say({ line: "tv_take_time" });
    });
    for (const ms of [36000, 48000]) later(ms, () => void say(p.prompt));
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
  /** `sayPrompt`: say the prompt now (then the turn is asked); false: it was said already (asked at once); "later": the
   *  caller says it and marks the turn asked (askWith). */
  const ask = (o: Omit<Pending, "resolve" | "busy" | "done" | "timers">, sayPrompt: boolean | "later" = true): Promise<Answer> =>
    new Promise((resolve) => {
      const p: Pending = {
        ...o, busy: false, done: false, timers: [],
        resolve: (r) => {
          if (p.done) return;
          p.done = true;
          clearTimers(p);
          if (pending.current === p) pending.current = null;
          if (viewRef.current.point || viewRef.current.showPulse) patch({ point: null, showPulse: false });
          turns.current.push(!!p.struggle);
          if (!r.auto) firstAnswer();
          setAskN((n) => n + 1);
          resolve({ ...r, helped: !!p.helped });
        },
      };
      pending.current = p;
      prompt.current = o.prompt;
      patch({ speaker: true });
      if (o.armOn) {
        p.armed = false;
        // (armed as the clip starts, or after 4 s whatever happens: a turn never stays closed)
        void nextClip(o.armOn, 4000).then(() => {
          p.armed = true;
          setAskN((n) => n + 1);
        });
      }
      setAskN((n) => n + 1);
      (async () => {
        if (sayPrompt === "later") return;
        if (sayPrompt && o.prompt.length) await say(o.prompt);
        if (p.done || !alive.current) return;
        p.asked = true;
        setAskN((n) => n + 1);
        startIdle(p);
      })();
    });
  /** Arm a question whose asking the game says itself (the tortoise lit on its slow word, the rows glowing): the turn is
   *  open from the start, and asked once `speak` has finished. */
  const askWith = (o: Omit<Pending, "resolve" | "busy" | "done" | "timers">, speak: () => Promise<unknown>): Promise<Answer> => {
    const answered = ask(o, "later");
    const mine = pending.current;
    void (async () => {
      await speak();
      if (!mine || mine.done || mine.asked || !alive.current) return;
      mine.asked = true;
      setAskN((n) => n + 1);
      startIdle(mine);
    })();
    return answered;
  };
  /** Say something with the tortoise lit (a slow word, or sounds after a slow lead-in): the child sees which way it is. */
  const withTortoise = async (x: Say[]) => {
    const on = !!viewRef.current.speed;
    if (on) light("tortoise", "flash");
    const ok = await say(x);
    if (on) light("tortoise", "");
    return ok;
  };
  const saidLast = useRef(false);
  const closedByPaw = useRef(false);
  /** The child has tapped since the cap came (in this beat): their try is had, and the paw may finish what is left. */
  const capTried = useRef(false);
  /** The paw finishes the question: "Here's the last one." when one find of several is left (a Pocket Hunt), "It's this
   *  one!" for a single answer (SCRIPT_FIXES C17.3). */
  const pawClose = async (p: Pending) => {
    if (p.done || p.busy) return;
    closedByPaw.current = true;
    const many = beatNow.current?.kind === "tapall";
    if (!saidLast.current && p.answers().length === 1) {
      saidLast.current = many;
      p.busy = true;
      await say({ line: many ? "fm_last_one" : "fm_its_this" });
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

  // ---- Show me again (docs/NAVIGATION.md §3.6, TEACHER_SCRIPT §5.2): the demo that led into this turn. It plays over
  // the turn (the demo's own pictures put back when the turn shows others), after "Of course. Watch my paw again.",
  // then the turn's view comes back: "Now it's your turn again." and its question. It never answers: a tap meanwhile
  // stops it (and counts, when the turn's own pictures were on screen). It goes when another game starts.
  type Show = { game: string; same: boolean; run: (live: Live) => Promise<unknown> };
  const lastShow = useRef<Show | null>(null);
  const showTok = useRef(0);
  const showing = useRef<{ same: boolean; restore: () => void } | null>(null);
  const snapshot = () => {
    const v = viewRef.current;
    return { cards: v.cards.filter((c) => !c.out), speed: v.speed, ribbon: v.ribbon, rail: v.rail, rails: v.rails, dots: v.dots, sdots: v.sdots, spot: null };
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
    patch({ point: null, showPulse: false });
    setAskN((n) => n + 1);
    try {
      await say(lineOr("tv_show_again", []));
      if (live()) await s.run(live);
    } catch (e) {
      console.error("show me again", e);
    }
    if (!live()) return;
    await sleep(300);
    if (!live()) return;
    endShow();
    // the turn again: "Now it's your turn again." and its question (a tap on an answer cuts it off, as ever)
    await sleep(250);
    if (!live() || p.busy) return;
    await say([...lineOr("tv_turn_again", []), ...(p.prompt.length ? [{ gap: 250 }, ...p.prompt] : [])]);
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

  // ---- the Ready hold (TEACHER_SCRIPT §2.3): after the demo on every full form (and a recap after 21 days or a
  // struggle). ▶ is "I'm ready"; the paw replays the demo; a tap on the board is "I'm ready" too (the card says its
  // word); on a hand-over Ready ("Now you find the other two. Are you ready?") a right answer is ready and the first
  // answer. The telling counts when the child answers (framed).
  const readyBoard = useRef<{ answers: (() => string[]) | null; tapped: { id: string; el: Element | null; how: ReadyAnswer } | null; replaying: boolean; own: boolean } | null>(null);
  const readyHold = async (g: GameId, form: FrameForm, o: { show?: (live: Live) => Promise<unknown>; again: Say[]; answers?: () => string[]; own?: boolean; sound?: PhonemeId; slots?: LineSlots; enter?: () => void }) => {
    const r = readyAsk(g, form, o.slots);
    if (!r || !hasLine(r.line)) return null;
    const handover = !!o.answers && !!GAMES[g].full.handover && r.line === fillLine(GAMES[g].full.ready ?? "", o.slots ?? {});
    readyBoard.current = { answers: handover ? o.answers! : null, tapped: null, replaying: false, own: !!o.own };
    clearTimersAll();
    setHolding(true);
    patch({ point: null, paw: null, showPulse: false });
    setAskN((n) => n + 1);
    o.enter?.();
    // (the save's first Ready has only ▶: the paw is introduced at the second, "Or tap my paw to see it again.", T5)
    const show = o.show && r.once !== "ready:first"
      ? async (live: Live) => {
          const rb = readyBoard.current;
          if (rb) rb.replaying = true;
          const snap = snapshot();
          try {
            await o.show!(live);
          } finally {
            if (rb) rb.replaying = false;
            slowmo(false);
            restoreTo(snap);
          }
        }
      : undefined;
    const how = await holdReady(`${script.key}:${g}`, {
      ask: [{ line: r.line }],
      again: () => say([...o.again, ...(o.again.length ? [{ gap: 300 } as Say] : []), { line: r.line }]),
      show,
      handover,
      answer: handover ? o.answers!()[0] : undefined,
      sound: o.sound,
    });
    const tapped = readyBoard.current?.tapped ?? null;
    readyBoard.current = null;
    setHolding(false);
    setAskN((n) => n + 1);
    if (how !== false) {
      framed(g, r);
      toldGame.current = true;
    }
    return { how, tapped };
  };
  /** A card tapped as the answer to a Ready (not an answer: the question hasn't been asked) says its own word. */
  const echoBoard = async (t: { id: string; how: ReadyAnswer } | null | undefined) => {
    if (!t || t.how !== "board" || !viewRef.current.cards.some((c) => c.w === t.id && !c.out)) return;
    patch({ spot: t.id });
    await say(plain(t.id));
    patch({ spot: null });
  };
  const clearTimersAll = () => {
    const p = pending.current;
    if (p) clearTimers(p);
  };

  /** A tap on anything in the lesson (a card, a button, a rail, a dot, the petal). */
  const tap = async (id: string, target: Element | null) => {
    // a Ready hold is up: the tap answers it (or, during the paw's replay on the demo's own pictures, only stops it)
    if (readyHeld() && readyBoard.current) {
      const b = readyBoard.current;
      if (b.replaying && b.own) return void readyStop();
      const how = readyTap({ right: !!b.answers?.().includes(id), label: id });
      if (how) b.tapped = { id, el: target, how };
      return;
    }
    // during Show me again: the tap stops it; on the turn's own pictures it is also the child's answer
    if (showing.current) {
      const same = showing.current.same;
      stopShow();
      if (!same) return;
    }
    const p = pending.current;
    if (!p || p.done || p.armed === false) return earlyTap(id);
    if (p.busy || p.ignore?.(id)) return;
    clearTimers(p);
    if (p.speed && (id === "tortoise" || id === "rabbit") && !p.answers().includes(id)) {
      // not an answer, and not a miss: the tortoise says it slowly again; the rabbit wiggles
      sfx.tap();
      if (id === "rabbit") wiggle(target);
      else {
        p.busy = true;
        setAskN((n) => n + 1);
        hush();
        try {
          await p.speed.tortoise();
        } finally {
          p.busy = false;
          setAskN((n) => n + 1);
        }
      }
      if (!p.done) startIdle(p);
      return;
    }
    // (a join-in that goes on by itself, the petal or the rabbit, isn't the child's try at the game's question)
    if (capped.current && p.autoMs == null) capTried.current = true;
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

  /** A small no-thank-you wiggle (on `rotate`, so it composes with the button's own transform). */
  const wiggle = (target: Element | null) => {
    const a = (target as HTMLElement | null)?.animate?.([{ rotate: "0deg" }, { rotate: "-12deg" }, { rotate: "10deg" }, { rotate: "-6deg" }, { rotate: "0deg" }], { duration: 420, easing: "ease-in-out" });
    if (a) a.playbackRate = FAST;
  };
  /** The paw (a friendly pointing hand) goes to something and taps it (a demo). Logged for the checks. */
  const pawAt = async (target: Element | { x: number; y: number } | null, live: Live = isAlive, travel = 750) => {
    if (!target) return;
    const r = target instanceof Element ? stageRect(target) : { x: target.x - 40, y: target.y - 40, w: 80, h: 80 };
    navLog({ kind: "paw", id: `${script.key}:${target instanceof Element ? target.getAttribute("aria-label") ?? "" : "spot"}` });
    patch({ paw: { x: r.x + r.w * 0.55, y: r.y + r.h * 0.5 } });
    await sleep(travel);
    if (live()) sfx.tap();
    patch({ paw: null });
  };
  /** The paw sets off towards something and rests on it (no tap yet). */
  const pawTo = (target: Element | null) => {
    if (!target) return;
    const r = stageRect(target);
    navLog({ kind: "paw", id: `${script.key}:${target.getAttribute("aria-label") ?? ""}` });
    patch({ paw: { x: r.x + r.w * 0.55, y: r.y + r.h * 0.5 } });
  };
  /** Sleep until `s` seconds into a clip (its own clock, from nextClip; game ms, so it holds at ?fast=N too). */
  const clipAt = (c: { start: number } | null) => {
    const t = c?.start ?? performance.now();
    return (s: number) => sleep(Math.max(0, s * 1000 - (performance.now() - t) * FAST));
  };

  // ---- teaching helpers
  const named = namedThisSession;
  /** Name each card that hasn't been named yet, spotlit from 100 ms before its clip until 150 ms after (the naming joins
   *  this game's Hear it again). */
  const nameCards = async (ws: string[]) => {
    for (const w of ws) {
      if (named.has(w) || !alive.current) continue;
      named.add(w);
      patch({ spot: w });
      await sleep(100);
      // "This is a sock." (the template, SPEECH_TEMPLATES: its fallback is the recorded fm_name_<w>, else the word)
      await told(speak("w_name_pic", { picture: w }));
      await sleep(150);
      patch({ spot: null });
    }
  };
  /** A right answer from the child: the ninja's move (the praise), and the streak. */
  const childRight = (target: Element | null, w: string, o: { first: boolean; auto?: boolean; soft?: boolean }) => {
    const first = o.first && !o.auto;
    score.current.total++;
    if (first) score.current.first++;
    noteAttempt(first);
    return rightAnswer(target, "pic", { first, living: LIVING.has(w) || w === "fishdog" || w === "dogfish" || w === "starfish", soft: o.soft ?? true });
  };
  /** A graded tap that isn't a choice between pictures (the tortoise, the rabbit, the dots): not a streak hit. */
  const graded = (first: boolean) => {
    score.current.total++;
    if (first) score.current.first++;
    noteAttempt(first);
  };
  /** A first-try choice between pictures counts towards the streak. In the warm-ups a tier-up powers the ninja up
   *  without a line: the first streak is explained in the first lesson where the child reads or spells (it cost
   *  Lesson 1 3.6 s; docs/DECISIONS.md). */
  const hit = () => streak.hit({ line: false });
  /** A hit held back because it starts a new tier (rightAnswer): the power-up, seen for a moment. */
  const tierQuiet = async () => {
    if (hit().tierUp) await sleep(250); // (the power-up plays on under what comes next)
  };
  /** A right answer's praise slot (TEACHER_SCRIPT §5.3): every third right answer in the warm-ups, the game's own
   *  specific line first; a fast and slow praise line (`fs`, §9.5) takes the slot when there is one. Never on a
   *  streak beat. */
  const praiseSlot = async (g: GameId, o: { held?: boolean; fs?: () => string | null; keptGoing?: boolean; helped?: boolean; last?: boolean } = {}) => {
    if (o.held) return tierQuiet();
    score.current.right++;
    // (never straight before the closing line: that is the level's praise, SCRIPT_STYLE §8)
    const opts = { game: g, every: 3, keptGoing: o.keptGoing, helped: o.helped, closingNext: !!o.last && closesNext() };
    if (o.fs && praiseWanted(opts)) {
      const id = o.fs();
      if (id && hasLine(id)) {
        praiseBy(id);
        markPraise(id);
        if (await say({ line: id })) fsSaid(id, g);
        return;
      }
    }
    const line = praiseFor(opts);
    if (line) {
      markPraise(line);
      await say({ line });
    }
  };
  /** When the last praise-like line started (performance.now()): the closing line waits until 5 s after it, so the two
   *  are never stacked (§5.3). Marked as it is asked for, and again when its clip really starts (`id`). */
  const praiseAt = useRef(0);
  const markPraise = (id?: string) => {
    praiseAt.current = performance.now();
    if (id) void nextClip(id, 3000).then((c) => c && (praiseAt.current = Math.max(praiseAt.current, c.start)));
  };
  /** The beat being played (its index in the script). */
  const beatIdx = useRef(0);
  /** The close comes next: the next beat is the `done` beat, or every beat before it is a ◇ the governor would drop now
   *  (W2's quick Pocket Hunt on a first session), so no praise line is stacked on the closing line (SCRIPT_STYLE §8). */
  const closesNext = () => {
    const bs = script.beats;
    for (let j = beatIdx.current + 1; j < bs.length; j++) {
      const x = bs[j];
      if (x.kind === "done") return true;
      if (!x.optional || !(capped.current || skipOptional(bs, j, elapsedS(), script.targetS))) return false;
    }
    return false;
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
  /** The second miss (§5.4): "Let's do it together. It's this one. Now you tap it." The answer glows and the paw points. */
  const fixTogether = async (ids: string[]) => {
    const p = pending.current;
    glow(ids);
    if (p) {
      p.struggle = true;
      pointAt(p);
    }
    await say(lineOr("tv_fix_together", [{ line: "fm_its_this" }]));
  };
  /** The rephrase after a first slip; past the cap the paw finishes the question instead, so it isn't asked again (the
   *  child has had their try). */
  const askAgain = (x: Say[]) => (capped.current ? Promise.resolve(true) : say(x));
  const bead = (n = 1) => patch((v) => ({ lit: v.lit + n }));

  // ---- the ninja's special moves
  /** A dash out and back (fast), or a slow kata (slow): whole-body motion on the ninja's float layer. */
  const dash = () => moveNinja(DASH, streak.tier);
  const runAlong = (toX: number, ms: number) => moveNinja(runSpec(toX, ms), streak.tier);
  const slowmo = (on: boolean) => ninja.setSlowmo(on ? 2.8 : 1);

  // ---- the slow way (TEACHER_SCRIPT §9.1): the word's pure sounds with little gaps. Everything that moves with it
  // follows the clip's own clock (SLOW_TIMES: each sound's onset), never a fixed length
  /** Say the slow way of `w`, with `onSound(i)` as sound i starts (and `onSound(-1)` as the clip ends). The tortoise, if
   *  it is on screen, lights for the whole clip (the child sees which way this is). */
  const slowSay = async (w: string, o: { onSound?: (i: number) => void; live?: Live; flash?: boolean } = {}) => {
    const live = o.live ?? isAlive;
    const tort = o.flash !== false && !!viewRef.current.speed && !viewRef.current.speed.hide?.includes("tortoise");
    if (tort) light("tortoise", "flash");
    const c = nextClip(`stretch:${w}`, 2500);
    const said = say(stretch(w));
    const clip = await c;
    if (clip && o.onSound) {
      const at = clipAt(clip);
      for (const [i, s] of (SLOW_TIMES[w] ?? []).entries()) {
        await at(s);
        if (!live()) break;
        o.onSound(i);
      }
    }
    await said;
    o.onSound?.(-1);
    if (tort) light("tortoise", "");
  };
  /** The fast way: the word, with the rabbit lit (and hopping) while it is said. */
  const fastSay = async (w: string) => {
    const rab = !!viewRef.current.speed && !viewRef.current.speed.hide?.includes("rabbit");
    if (rab) light("rabbit", "flash");
    await say(plain(w));
    if (rab) light("rabbit", "");
  };
  /** The stage's slow way: the card steps one notch wider on each sound, the ribbon's dots pop on as each sound
   *  begins, the ninja does its slow kata, and it all snaps back as the clip ends. */
  const slowWord = async (w: string, live: Live = isAlive) => {
    patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, mode: "step", shown: 0 } }));
    slowmo(true);
    void ninja.act("cast", { x: STAGE.x, y: STAGE.y + 210 }, { react: false, soft: true });
    await slowSay(w, {
      live,
      onSound: (i) => {
        if (i < 0) return;
        setCard(w, { fx: "step", step: i + 1 });
        patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, shown: i + 1 } }));
      },
    });
    slowmo(false);
    setCard(w, { fx: "", step: 0 });
    patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, mode: "idle" } }));
  };
  /** The tortoise and the rabbit pop out where they stand (scale and opacity, held unseen), so the scene can move them
   *  with no glide (`jump`); popSpeedIn brings them back where they now are, with a spring. Transform and opacity only. */
  const popSpeedOut = (): Animation[] => {
    const out: Animation[] = [];
    for (const id of ["tortoise", "rabbit"] as const) {
      const e = document.querySelector(`.wu .wu-speed.${id}`) as HTMLElement | null;
      const a = e?.animate?.([{ opacity: 1, scale: "1" }, { opacity: 0, scale: "0.5" }], { duration: 180, easing: "ease-in", fill: "forwards" });
      if (!a) continue;
      a.playbackRate = FAST;
      out.push(a);
    }
    return out;
  };
  const popSpeedIn = (out: Animation[]) => {
    for (const id of ["tortoise", "rabbit"] as const) {
      const e = document.querySelector(`.wu .wu-speed.${id}`) as HTMLElement | null;
      const a = e?.animate?.([{ opacity: 0, scale: "0.5" }, { opacity: 1, scale: "1" }], { duration: 420, easing: "cubic-bezier(0.3, 1.5, 0.5, 1)" });
      if (a) a.playbackRate = FAST;
    }
    out.forEach((a) => a.cancel());
    setSpeed({ moving: false, jump: false });
  };
  const fastHop = (w: string) => {
    setCard(w, { fx: "hop" });
    patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, mode: "zip", shown: v.ribbon.dots } }));
    dash();
    sfx.whoosh();
    setTimeout(() => {
      setCard(w, { fx: "" });
      patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, mode: "idle" } }));
    }, 520);
  };

  // ---- a sound's petal arriving (SOUND_DISPLAY §4.6): the petal comes in misty, blooms as its sound plays, breathes
  // until the child taps it and says the sound with Sensei, then glides into the nav row's sound slot (it stays there
  // while the game is about that sound)
  const heroRef = useRef<HTMLDivElement>(null);
  const heroN = useRef(0);
  const showHero = (p: PhonemeId, where: "notice" | "grid", intro: boolean) =>
    patch({ hero: { p, intro, wait: false, key: `hero-${p}-${++heroN.current}`, ...HERO_AT[where] }, scrim: where === "grid" });
  /** "That sound has its very own petal. Tap the petal, and say the sound with me." (the first petal of all), "It's a new
   *  sound. Tap its petal, and say it with me." (a new sound), else "Tap the petal, and say it with me.". At 8 s the petal
   *  swells and says its sound; at 12 s the lesson goes on (§3.5 C). */
  const petalTap = async (p: PhonemeId, line: string) => {
    patch((v) => ({ hero: v.hero && { ...v.hero, wait: true } }));
    const id = `petal ${p}`;
    const r = await ask({
      answers: () => [id],
      prompt: lineOr(line, lineOr("tv_petal_say", [])),
      idle: () => say(petalSay(p)),
      autoMs: 12000,
    });
    patch((v) => ({ hero: v.hero && { ...v.hero, wait: false } }));
    // the tap: the petal swells on its sound (the child says it along)
    if (!r.auto) await say(petalSay(p));
    heard(`petal:${p}`);
    await sleep(350);
  };
  const glideHero = async () => {
    const h = heroRef.current, hv = viewRef.current.hero;
    patch({ scrim: false }); // (the dusk lifts as the petal flies)
    if (h && hv) {
      const S = NAV_SLOTS.row.sound;
      const k = S.d / TIER_WIDTH.hero;
      const a = h.animate([{ transform: "translate(0, 0) scale(1)" }, { transform: `translate(${S.x - hv.x}px, ${S.y - hv.y}px) scale(${k})` }], { duration: 620, easing: "cubic-bezier(.5,0,.25,1)", fill: "forwards" });
      a.playbackRate = FAST;
      await a.finished.catch(() => undefined);
    }
    patch({ hero: null, scrim: false, sound: hv?.p ?? viewRef.current.sound });
  };

  // ---------------------------------------------------------------- the games
  const run: { [K in Beat["kind"]]: (b: Extract<Beat, { kind: K }>) => Promise<void> } = {
    // ---- Ninja Ears (§3.5 A): "I'll say a word. Then you find its picture." · the others named · "I'll go first. My
    // word is sun… There it is!" · Ready · "Your word is sock. Can you find the sock?"
    tap: async (b) => {
      const form = startGame("tap");
      const def = GAMES.tap;
      patch({ cards: row(b.cards).map((c, i) => ({ ...c, key: `${c.w}-in-${i}` })), speed: null });
      await sleep(450);
      const frame = openingLines(def, form);
      if (frame.length) await told(lines(frame));
      const demoOn = playsDemo(def, form);
      // the pictures, each spotlit as it is named; on the demo's form its own picture is named by the demo
      await nameCards(b.cards.filter((w) => !(demoOn && w === b.demo)));
      // the paw sets off on "sun" and taps the sun on "There"; the ninja kicks its corner; a star stamp
      const show = async (live: Live) => {
        const c = nextClip("tv_ears_demo", 2500);
        const said = say({ line: "tv_ears_demo" });
        const at = clipAt(await c);
        await at(wordAt("tv_ears_demo", b.demo) ?? 2.88);
        if (!live()) return;
        pawTo(el(b.demo));
        await at((wordAt("tv_ears_demo", "there") ?? 4.4) - 0.1);
        if (!live()) return;
        const d = el(b.demo);
        sfx.tap();
        patch({ paw: null });
        setCard(b.demo, { state: "right" });
        sfx.good();
        if (d) void ninja.act("kick", cornerOf(d), { react: false, soft: true }).then(() => d.isConnected && d.classList.add("struck"));
        await said;
        await sleep(350);
        setCard(b.demo, { state: "" });
      };
      let board: { id: string; how: ReadyAnswer } | null = null;
      if (demoOn) {
        await show(isAlive);
        named.add(b.demo);
        lastShow.current = { game: "tap", same: true, run: show };
        const r = await readyHold("tap", form, { show, again: lines(frame) });
        if (!alive.current || r?.how === false) return;
        board = r?.tapped ?? null;
      } else lastShow.current = null;
      await echoBoard(board);
      // the hand-over: the child's version of the demo
      const q = lineOr(`tv_your_word_${b.target}`, [plain(b.target)]);
      let misses = 0;
      const r = await ask({
        answers: () => [b.target],
        prompt: q,
        glowAfterMs: form === "full" ? 2000 : undefined,
        offer: form === "full" ? "first" : undefined,
        idle: () => {
          glow([b.target]);
          return say(lineOr(`tv_idle_look_${b.target}`, q));
        },
        onWrong: async (id) => {
          misses++;
          sfx.wrong();
          setCard(id, { state: "wrong" });
          await childWrong();
          await say(plain(id));
          setCard(id, { state: "" });
          ninja.pose(null);
          if (misses === 1) await askAgain(lineOr(`tv_find_again_${b.target}`, q));
          else await fixTogether([b.target]);
        },
      });
      setCard(b.target, { state: "right" });
      sfx.good();
      const target = r.el ?? el(b.target);
      // the model answer is the feedback: [sock], the kick at the card's corner and a star stamp (no praise line)
      const first = misses === 0 && !r.auto;
      score.current.total++;
      if (first) score.current.first++;
      noteAttempt(first);
      const held = first ? tierHeld() : false;
      if (first && !held) hit();
      if (target && !LIVING.has(b.target)) {
        const kick = ninja.act("kick", cornerOf(target), { react: false, soft: true }).then(() => target.isConnected && target.classList.add("struck"));
        await Promise.race([kick, sleep(450)]);
      } else await afterLanding(gift(target));
      await say(plain(b.target));
      bead();
      if (held) await tierQuiet();
      await sleep(150);
      setCards((cs) => cs.map((c) => ({ ...c, state: "" })));
      endGame();
    },

    // ---- the rabbit and the tortoise (§3.5 B; a recap or short form §3.9 A)
    fastslow: async (b) => {
      const form = startGame("fastslow");
      const full = form === "full";
      const w = b.word;
      // the stage: the other cards slide back; the word's card to the centre, big, above its sound ribbon
      const segs = segsOf(w).length || 3;
      patch((v) => ({
        cards: [...v.cards.filter((c) => c.w !== w).map((c) => ({ ...c, out: true })), { w, x: STAGE.x, y: STAGE.y, size: STAGE.size, gutter: 24, key: `${w}-stage` }],
        ribbon: { mode: "idle", dots: segs, shown: 0, pulse: -1 },
        speed: { tortoise: "", rabbit: "", at: "stage", hide: ["tortoise", "rabbit"] },
        rail: null, rails: null, pockets: null, sound: null,
      }));
      await sleep(400);
      const popIn = (id: SpeedId) => {
        patch((v) => ({ speed: v.speed && { ...v.speed, hide: (v.speed.hide ?? []).filter((x) => x !== id), [id]: "flash" } }));
        sfx.pop();
        setTimeout(() => light(id, ""), 900);
      };
      if (full) {
        // "Here are my friends, the rabbit and the tortoise.": each pops in, spotlit, on its name
        const c = nextClip("tv_ts_meet", 2500);
        const said = told({ line: "tv_ts_meet" });
        const at = clipAt(await c);
        await at(wordAt("tv_ts_meet", "rabbit") ?? 1.74);
        popIn("rabbit");
        await at(wordAt("tv_ts_meet", "tortoise") ?? 2.8);
        popIn("tortoise");
        await said;
        await nameCards([w]);
      } else {
        // "Here come the rabbit and the tortoise again." as they pop in either side, then the new picture's name
        const said = told(lineOr("tv_ts_again", []));
        await sleep(500);
        popIn("rabbit");
        await sleep(350);
        popIn("tortoise");
        await said;
        await nameCards([w]);
      }
      // the demo: full, the rabbit's fast word then the tortoise's slow one; a recap or short form, the slow one only
      const show = async (live: Live) => {
        if (full) {
          // "The rabbit says words fast…" [sun]: the paw taps the rabbit as the clip starts; the card hops, the ribbon
          // zips across, the ninja dashes out and back
          const said = say({ line: "tv_ts_fast" });
          await pawAt(el("rabbit"), live, 600);
          if (!live()) return;
          light("rabbit", "flash");
          await said;
          if (!live()) return;
          fastHop(w);
          await say(plain(w));
          light("rabbit", "");
          if (!live()) return;
          await sleep(300);
        }
        // "The tortoise says them slowly…" [sun, slowly]: the paw taps the tortoise; the card steps wider on each sound,
        // the ribbon's dots pop on, the ninja's slow-motion kata
        const said = say(lineOr(full ? "tv_ts_slow" : "tv_ts_slow_one", [{ line: "tv_ts_slow" }]));
        await pawAt(el("tortoise"), live, 600);
        if (!live()) return;
        light("tortoise", "flash");
        await said;
        if (!live()) return;
        await slowWord(w, live);
      };
      await show(isAlive);
      lastShow.current = { game: "fastslow", same: true, run: show };
      const rr = await readyHold("fastslow", form, { show, again: bundle.current.slice() });
      if (!alive.current || rr?.how === false) return;
      // the child's two taps: the tortoise (the slow way), then the rabbit (the fast way)
      const turn = async (which: SpeedId, line: string) => {
        light(which, "pulse");
        let misses = 0;
        const r = await ask({
          answers: () => [which],
          prompt: [{ line }],
          onWrong: async (id) => {
            if (id !== "tortoise" && id !== "rabbit") return;
            misses++;
            // the other one still says the word its way (never wrong to hear it), then which one is which
            light(which, "");
            if (id === "rabbit") {
              light("rabbit", "flash");
              fastHop(w);
              await say(plain(w));
              light("rabbit", "");
              await say(lineOr("tv_ts_wrong_rabbit", [{ line }]));
            } else {
              await slowWord(w);
              await say(lineOr("tv_ts_wrong_tortoise", [{ line }]));
            }
            light(which, "pulse");
          },
        });
        // (graded, but not a streak hit: the button pulses, so it isn't a choice between pictures)
        graded(misses === 0 && !r.auto);
        recordFoundation({ target: { kind: "joining", speed: which === "tortoise" ? "slow" : "fast", task: "production" }, result: "unassessed", source: "practice", support: "guided" });
        light(which, "");
      };
      // "Now you tap the tortoise, and say it slowly with me." → [sun, slowly] (the child says it along)
      await turn("tortoise", "fm_tap_tortoise");
      await slowWord(w);
      bead();
      if (!alive.current) return;
      await sleep(400);
      if (full && hasLine("tv_same_word")) {
        // "Fast or slow, it's the same word. When I say it slowly, I can hear its sounds.": the card snaps back; the
        // ribbon's dots pulse in turn on "its sounds" (W1's telling of fast and slow counts as its idea)
        const c = nextClip("tv_same_word", 2500);
        const said = say({ line: "tv_same_word" });
        const t = await c;
        if (t) {
          await clipAt(t)(((t.end - t.start) * FAST * 0.74) / 1000);
          for (let i = 0; i < segs && alive.current; i++) {
            patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, shown: segs, pulse: i } }));
            await sleep(340);
          }
          patch((v) => ({ ribbon: v.ribbon && { ...v.ribbon, pulse: -1 } }));
        }
        if (await said) fsSaid("tv_same_word", "fastslow");
      } else {
        // a later session: the idea again (§9.3, FS4), in place of "You said it slowly, just like the tortoise." when
        // both are due; the praise is said once a save
        const idea = fsIdea("fastslow", "listen");
        if (idea) {
          if (await say({ line: idea })) fsSaid(idea, "fastslow");
        } else if (onceInSave("praise:slowly") && hasLine("tv_praise_slowly")) {
          markPraise("tv_praise_slowly");
          if (await say({ line: "tv_praise_slowly" })) heard("praise:slowly");
        }
      }
      // "Now tap the rabbit, and say it fast." → [sun] (the hop, the dash)
      await turn("rabbit", "fm_tap_rabbit");
      fsSaid("fm_tap_rabbit", "fastslow");
      light("rabbit", "flash");
      fastHop(w);
      await say(plain(w));
      light("rabbit", "");
      bead();
      await sleep(250);
      endGame();
    },

    // ---- Slow Words (§3.9 B): "Let's play Slow Words. I say a word slowly. You find its picture." · "Here's my slow
    // word…" [mug, slowly] · "I can hear mug!" · Ready · "Here's your slow word…" [van, slowly] · "Which picture is it?"
    slowpick: async (b) => {
      const form = startGame("slowpick");
      const def = GAMES.slowpick;
      // the rabbit and the tortoise tuck away to the right-hand column; the other pictures drop in beside the demo's.
      // From beside the big card they pop out where they stand and pop back in in the column once the pictures have
      // landed: a glide there would pass over the new pictures (verify round 2, w1-wu3: over the bag)
      const fromStage = viewRef.current.speed?.at === "stage";
      const popped = fromStage ? popSpeedOut() : null;
      if (fromStage) {
        patch({ ribbon: null }); // (the sound ribbon goes with them)
        await sleep(180);
      }
      if (!alive.current) return;
      patch((v) => ({ ribbon: null, rail: null, rails: null, pockets: null, speed: { tortoise: "", rabbit: "", at: "side", moving: fromStage, jump: fromStage }, cards: layoutRow(v.cards, b.options) }));
      if (popped) void sleep(380).then(() => alive.current && popSpeedIn(popped));
      // (the frame starts as the new pictures land: the run from the rabbit's word to the Ready is TEACHER_SCRIPT §6's)
      await sleep(250);
      const frame = openingLines(def, form);
      if (frame.length) await told(lines(frame));
      const demoOn = playsDemo(def, form);
      const show = async (live: Live) => {
        // "Here's my slow word…" [mug, slowly]: the ninja goes into bullet time; the paw glides towards the mug
        await say(lineOr("tv_slow_demo", []));
        if (!live()) return;
        slowmo(true);
        pawTo(el(b.demo));
        await slowSay(b.demo, { live });
        slowmo(false);
        if (!live()) return;
        // "I can hear mug!": the paw taps the mug; a bullet-time gift, snapping to full speed
        const d = el(b.demo);
        sfx.tap();
        patch({ paw: null });
        setCard(b.demo, { state: "right" });
        sfx.good();
        const { landed } = rightAnswer(d, "pic", { first: false, living: LIVING.has(b.demo), soft: true });
        await say(lineOr(`tv_i_hear_${b.demo}`, [plain(b.demo)]));
        // (the gift settles as the Ready comes: TEACHER_SCRIPT §6's run from the rabbit to the Ready)
        await Promise.race([afterLanding(landed), sleep(250)]);
        setCard(b.demo, { state: "" });
      };
      if (demoOn) {
        await nameCards([b.demo]);
        await show(isAlive);
        const r = await readyHold("slowpick", form, { show, again: lines(frame) });
        if (!alive.current || r?.how === false) return;
        await echoBoard(r?.tapped);
      }
      lastShow.current = { game: "slowpick", same: true, run: show };
      // the new pictures, named as the turn starts
      await nameCards(b.options);
      const q: Say[] = [...lineOr("tv_slow_yours", [{ line: "fm_slow_listen" }]), { gap: 300 }, stretch(b.target), { gap: 300 }, { line: "fm_which_pic" }];
      let misses = 0;
      // (the tortoise lights on every slow word: the question's own is said here, not by ask(), so it can light)
      const r = await askWith({
        answers: () => [b.target],
        prompt: q,
        offer: form === "short" ? "short" : undefined,
        // 8 s: the slow way again, one sound at a time (never "Where's the van?": it would say the answer, FS2)
        idle: () => withTortoise(fsStuckSay("slowpick", b.target, { always: true }) ?? q),
        speed: { tortoise: () => withTortoise([stretch(b.target)]) },
        armOn: `stretch:${b.target}`,
        onWrong: async (id) => {
          recordFoundation({ target: { kind: "joining", speed: "slow", task: "recognition" }, result: "incorrect", source: "choice", support: misses === 0 && !pending.current?.helped ? "independent" : "guided" });
          misses++;
          sfx.wrong();
          setCard(id, { state: "wrong" });
          await childWrong();
          await say(plain(id));
          setCard(id, { state: "" });
          ninja.pose(null);
          if (misses === 1) {
            // "Let's listen again…" [van, slowly], taking turns with "Here's the slow way again, one sound at a time…"
            const stuck = fsStuckSay("slowpick", b.target, { attempt: 1 });
            if (!capped.current) await withTortoise(stuck ?? [...lineOr("tv_slow_again", [{ line: "listen_again" }]), { gap: 300 }, stretch(b.target)]);
          } else await fixTogether([b.target]);
        },
      }, () => withTortoise(q));
      recordFoundation({ target: { kind: "joining", speed: "slow", task: "recognition" }, result: r.auto ? "unassessed" : "correct", source: "choice", support: misses === 0 && !r.auto && !r.helped ? "independent" : "guided" });
      setCard(b.target, { state: "right" });
      sfx.good();
      // bullet time: the move plays slowly under the slow way, and snaps to full speed on the word
      slowmo(true);
      const res = childRight(r.el ?? el(b.target), b.target, { first: misses === 0, auto: r.auto, soft: true });
      await slowSay(b.target);
      slowmo(false);
      if (!r.auto && fsReadback("slowpick") === "rabbit") {
        // Move 1 (§9.3): [van, slowly] · the idea · "Now tap the rabbit, and say it fast." · the tap · [van]
        const idea = fsIdea("slowpick", "listen", { tight: true });
        if (idea && (await say({ line: idea }))) fsSaid(idea, "slowpick");
        await rabbitTurn("slowpick", () => slowSay(b.target));
      }
      await fastSay(b.target);
      bead();
      await praiseSlot("slowpick", { held: res.held, fs: () => fsPraise("slowpick", "listen"), keptGoing: misses > 0 && !r.auto, helped: r.helped, last: true });
      await sleep(300);
      setCards((cs) => cs.map((c) => ({ ...c, state: "" })));
      endGame();
    },

    // ---- ninja ears, the first sound (§3.5 C): the child taps each card to hear how it starts, notices the sound, and
    // meets its petal
    notice: async (b) => {
      const form = startGame("notice");
      const full = form === "full";
      const ns = (w: string) => segsOf(w).length || 3;
      patch((v) => ({
        speed: null, ribbon: null, rail: null, rails: null, pockets: null,
        cards: [
          ...v.cards.filter((x) => !b.words.includes(x.w)).map((x) => ({ ...x, out: true })),
          ...b.words.map((w, i) => ({ w, x: NOTICE.xs[i], y: NOTICE.y, size: NOTICE.size, gutter: G, dots: { n: ns(w), gold: [] }, key: `${w}-notice` })),
        ],
      }));
      await sleep(450);
      // "Now let's listen for the very first sound." · "Look, your ninja has its ninja ears on. That means listening
      // really carefully." (the ninja cups its hand behind its ear)
      if (form !== "none") await told(lineOr("tv_notice_frame", []));
      ninja.pose("listen");
      if (full && hasLine("tv_ears_on")) await told({ line: "tv_ears_on" });
      await nameCards(b.words);
      // "Tap the sun, and listen to how it starts." [sun, first] · "Now tap the sock…" [sock, first]: each first dot
      // swells gold as its held first sound plays
      const heardStart = new Set<string>();
      const hearStart = async (w: string) => {
        heardStart.add(w);
        setCard(w, { state: "", dots: { n: ns(w), gold: [0] } });
        await say(firstSay(w));
      };
      for (const [k, w] of b.words.entries()) {
        if (heardStart.has(w) || !alive.current) continue;
        const line = k === 0 ? `tv_tap_hear_${w}` : `tv_now_tap_hear_${w}`;
        setCard(w, { state: "glow" });
        const r = await ask({
          answers: () => [w],
          prompt: lineOr(line, lineOr(`tv_tap_hear_${w}`, [plain(w)])),
          idle: () => glow([w]),
          // (the other card: it says how it starts too, and counts; the question stays on this one)
          onWrong: async (id) => {
            if (!b.words.includes(id)) return;
            if (heardStart.has(id)) await say(firstSay(id));
            else await hearStart(id);
          },
        });
        void r;
        await hearStart(w);
        await sleep(150);
      }
      if (!alive.current) return;
      // "Sun and sock start with the same sound… /s/": both gold dots pulse; the petal arrives in the middle, misty,
      // and blooms on the sound (its introduction, for a child who starts here their very first petal)
      const fresh = onceInSave(`petal:${b.p}`);
      showHero(b.p, "notice", fresh);
      await sleep(80);
      const cn = nextClip("fm_notice_sun_sock", 2500);
      const notice = say([{ line: "fm_notice_sun_sock" }, { gap: 300 }, petalSay(b.p)]);
      void cn.then((t) => t && clipAt(t)(((t.end - t.start) * FAST * 0.62) / 1000).then(() => alive.current && kiAtFirstDots(b.words)));
      await notice;
      ninja.pose(null);
      if (!alive.current) return;
      // "That sound has its very own petal. Tap the petal, and say the sound with me." → /s/ → into the nav row
      await petalTap(b.p, fresh ? "tv_petal_first" : "tv_petal_say");
      await glideHero();
      bead();
      endGame();
    },

    // ---- Pocket Hunt (§3.5 D, §3.9 C–D; the short form §3.7 E)
    tapall: async (b) => {
      const g: GameId = b.how === "in" ? "tapall:in" : "tapall";
      const form = startGame(g);
      const def = GAMES[g];
      const mid = b.how === "in";
      const cards = grid(b.cards).map((c) => ({ ...c, key: `${c.w}-grid` }));
      // the known sound's petal is in the nav row from the start (it swells on "this sound"); a new one arrives below
      const fresh = onceInSave(`petal:${b.p}`);
      patch((v) => ({
        ribbon: null, rail: null, rails: null, sdots: null, dots: null,
        speed: mid ? { tortoise: "", rabbit: "", at: "side" } : null,
        cards: [...v.cards.filter((x) => !b.cards.includes(x.w)).map((x) => ({ ...x, out: true })), ...cards],
        pockets: { n: b.targets.length, filled: [] },
        sound: fresh ? null : b.p,
      }));
      await sleep(350);
      const found: string[] = [];
      const left = () => b.targets.filter((t) => !found.includes(t));
      const demoOn = playsDemo(def, form) && b.targets.includes(b.demo);
      const slots: LineSlots = { p: b.p, n: b.targets.length - (demoOn ? 1 : 0) };
      const shortLine = fillLine(def.short[0], slots);
      // a find says its held first sound ("sssock"), or the plain word where there is none; in the middle, the slow way
      const findSay = async (w: string, onSound?: (i: number) => void) => (mid ? slowSay(w, { onSound }) : say(firstSay(w)));
      // the frame (full, recap), with the pockets glowing on "Pocket" and the petal swelling on "this sound"
      let q: Say[];
      if (form === "full" || form === "recap") {
        const frame = openingLines(def, form, slots);
        const c = nextClip(frame[0] ?? "", 2500);
        const said = told(lines(frame));
        void c.then(async (t) => {
          if (!t) return;
          const at = clipAt(t);
          await at(wordAt(frame[0], "pocket") ?? 0.2);
          if (alive.current) patch((v) => ({ pockets: v.pockets && { ...v.pockets, glow: true } }));
          await at(wordAt(frame[0], "sound") ?? ((t.end - t.start) * FAST * 0.85) / 1000);
          if (alive.current) swellNavPetal();
          await sleep(900);
          if (alive.current) patch((v) => ({ pockets: v.pockets && { ...v.pockets, glow: false } }));
        });
        await said;
        q = [...lines(frame), { gap: 300 }, petalSay(b.p)];
      } else q = [...lineOr(shortLine, lineOr(mid ? "fm_tap_all_in" : "fm_tap_all_start", [])), { gap: 250 }, petalSay(b.p)];
      if (!alive.current) return;
      // the sound: "Here's the sound… /a/" (in the middle, or a new sound), or the short form's own line and its sound;
      // a new sound's petal arrives misty over the pictures and blooms on it, then the child taps it
      const shortForm = form === "short" || form === "none";
      if (shortForm || mid || fresh) {
        if (fresh) showHero(b.p, "grid", true);
        await sleep(fresh ? 250 : 0);
        await told(shortForm ? q : [{ line: "tv_here_sound" }, { gap: 250 }, petalSay(b.p)]);
        if (fresh) {
          await petalTap(b.p, "tv_new_petal_say");
          await glideHero();
        }
      }
      if (!alive.current) return;
      // Reception (§4.8): the child's first find writes the spelling on the card's line (the ninja's spell), and the
      // other finds (the demo's too) show it. (Not on the demo's own find: "Now watch my ninja write it." is said to the
      // child, and would lengthen the talk before the hand-over past the age limit.)
      const letterOn = (w: string) => {
        const segs = segsOf(w);
        const n = segs.length || 1; // picture-only words (sausage) show just their first line
        setCard(w, { lines: { n, show: [{ i: 0, g: segs[0]?.g ?? b.p }] } });
      };
      const spellOn = async (w: string) => {
        if (!b.spell || mid) return;
        const segs = segsOf(w);
        const n = segs.length || 1;
        const g0 = segs[0]?.g ?? b.p;
        setCard(w, { lines: { n, show: [] } });
        await sleep(200);
        if (!spelt.current.has(g0)) {
          spelt.current.add(g0);
          await say(lineOr("tv_watch_write", []));
          const done = castOn(w, 0, () => setCard(w, { lines: { n, show: [{ i: 0, g: g0 }] } }));
          await done;
          found.filter((x) => x !== w).forEach(letterOn);
          await say([...lineOr("tv_how_we_write", [{ line: "how_we_spell" }]), { gap: 150 }, petalSay(b.p)]);
        } else letterOn(w);
      };
      const pocket = async (w: string) => {
        const from = el(w);
        const slot = document.querySelectorAll(".wu-pocket")[found.length - 1] ?? null;
        if (from && slot) await flyCopy(from, slot, 460);
        patch((v) => ({ pockets: v.pockets && { ...v.pockets, filled: [...v.pockets.filled, w] } }));
      };
      // the demo: "I'll find one first." · (start) "Sun starts with… /s/" · "So into the pocket it goes!" / (middle)
      // [cat, slowly] (the middle dot glows while its sound is held) · "I can hear it in the middle." · "So into…"
      const show = async (live: Live, again = false) => {
        const d = () => el(b.demo);
        const said = say(lineOr("tv_pocket_ido", []));
        await sleep(400);
        if (!live()) return;
        pawTo(d());
        await said;
        if (!live()) return;
        if (mid) {
          const n = segsOf(b.demo).length || 3;
          const at = segsOf(b.demo).findIndex((s, i) => i > 0 && s.p === b.p);
          setCard(b.demo, { dots: { n, gold: [] } });
          await findSay(b.demo, (i) => setCard(b.demo, { dots: { n, gold: i === at ? [at] : [] } }));
          if (!live()) return;
          await say(lineOr("tv_hear_middle", []));
          if (!live()) return;
        }
        sfx.tap();
        patch({ paw: null });
        if (!again) {
          found.push(b.demo);
          setCard(b.demo, { state: "found", dots: undefined });
        }
        sfx.good();
        const dd = d();
        void ninja.act("throw", dd ? cornerOf(dd) : undefined, { react: false, soft: true }).then(() => dd?.isConnected && dd.classList.add("struck"));
        if (!mid) await say([...lineOr(`fs_${b.demo}`, [firstSay(b.demo)]), { gap: 250 }, petalSay(b.p)]);
        if (!live()) return;
        if (!again) void pocket(b.demo);
        else if (dd) {
          const at = stageXY(dd);
          fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 10, 6);
        }
        await say(lineOr("tv_so_pocket", []));
      };
      let first: { id: string; el: Element | null; how: ReadyAnswer } | null = null;
      if (demoOn) {
        await show(isAlive);
        lastShow.current = { game: g, same: true, run: (live) => show(live, true) };
        const rr = await readyHold(g, form, { show: (live) => show(live, true), again: lines(openingLines(def, form, slots)), answers: left, sound: b.p, slots });
        if (!alive.current || rr?.how === false) return;
        first = rr?.tapped ?? null;
        if (!rr) await say(lineOr("tv_now_your_turn", [])); // (a recap without its hold: a spoken hand-over)
      } else lastShow.current = null;
      if (!alive.current) return;
      patch({ sound: b.p });
      await echoBoard(first);
      let misses = 0;
      let firstTry = true;
      let childFound = 0; // the child's own finds (not the demo's, the idle paw's or the cap's)
      let ideaDone = false;
      const handle = async (r: { id: string; el: Element | null; auto: boolean }) => {
        found.push(r.id);
        if (!r.auto) childFound++;
        setCards((cs) => cs.map((c) => (c.w === r.id ? { ...c, state: "found" } : c.state === "glow" && !found.includes(c.w) && misses < 2 ? { ...c, state: "" } : c)));
        sfx.good();
        const target = r.el ?? el(r.id);
        // each find: a shuriken pins a star on the card's corner, and a mini-card flies to its pocket
        const isFirst = firstTry && !r.auto;
        score.current.total++;
        if (isFirst) score.current.first++;
        noteAttempt(isFirst);
        const held = isFirst ? tierHeld() : false;
        if (isFirst && !held) hit();
        const move = LIVING.has(r.id) ? gift(target) : ninja.act("throw", target ? cornerOf(target) : undefined, { react: false, soft: true }).then(() => target?.isConnected && target.classList.add("struck"));
        await Promise.race([move, sleep(300)]);
        void pocket(r.id);
        await findSay(r.id);
        // the middle: the child's first find says the idea of the slow way (§9.3)
        if (mid && !r.auto && !ideaDone) {
          ideaDone = true;
          const idea = fsIdea("tapall:in", "build");
          if (idea && (await say({ line: idea }))) fsSaid(idea, "tapall:in");
        }
        await spellOn(r.id);
        if (held) await tierQuiet();
        firstTry = true;
      };
      // a right answer tapped during the hand-over Ready: it is the first find (T4)
      if (first?.how === "answer" && left().includes(first.id)) {
        firstAnswer();
        await handle({ id: first.id, el: first.el, auto: false });
      }
      // the pictures the child hasn't met, named as the turn starts
      await nameCards(b.cards);
      let askPrompt = !demoOn && !shortForm && !(mid || fresh);
      while (left().length && alive.current) {
        const r = await ask(
          {
            answers: left,
            prompt: q,
            ignore: (id) => found.includes(id),
            offer: undefined,
            // 8 s: the answers glow, and "Tap the petal if you want to hear the sound again." (once a save)
            idle: () => {
              glow(left());
              if (onceInSave("hint:petal") && hasLine("tv_petal_hint")) return say({ line: "tv_petal_hint" }).then((ok) => ok && heard("hint:petal"));
              return swellNavPetal();
            },
            onWrong: async (id) => {
              if (!b.cards.includes(id)) return;
              misses++;
              firstTry = false;
              sfx.wrong();
              setCard(id, { state: "wrong" });
              await childWrong();
              setCard(id, { state: "" });
              ninja.pose(null);
              if (misses >= 2) return fixTogether(left());
              // "[moon, first] · Moon starts with a different sound. · Listen for the start… /s/" (in the middle: the slow
              // way, "Dog doesn't have that sound in it.", "Listen for the middle…")
              await findSay(id);
              const diff = diffLine(id, b.how);
              await askAgain([...(diff ? [{ line: diff }, { gap: 250 } as Say] : []), ...lineOr(mid ? "tv_fix_middle" : "tv_fix_start", []), { gap: 200 }, petalSay(b.p)]);
            },
          },
          askPrompt,
        );
        askPrompt = false;
        await handle(r);
      }
      // all found: the ninja's biggest move for its tier, and a spell burst over every find
      bead();
      const finds = found.map((w) => el(w)).filter(Boolean) as Element[];
      void ninja.act(streak.tier >= 2 ? "flip" : streak.tier >= 1 ? "spin" : "cast", finds[0] ? stageXY(finds[0]) : undefined, { react: false });
      finds.forEach((f, i) => setTimeout(() => {
        const pt = stageXY(f);
        fx.twinkle(pt.x, pt.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 12, 7);
        fx.ring(pt.x, pt.y, { color: "#ffe38a", r0: 20, r1: 150, width: 9 });
      }, 250 + i * 140));
      // "You found them both!…" only for what the child found; the paw's finds (at the cap) aren't theirs
      const helped = childFound < found.length - (demoOn ? 1 : 0);
      if (!helped) markPraise(mid || childFound !== 2 ? "fm_found_all" : "fm_found_both");
      if (mid) await say([...(helped ? [] : [{ line: "fm_found_all" }, { gap: 250 }]), { line: "t_they_all_have" }, { gap: 350 }, petalSay(b.p)]);
      else if (!helped && childFound === 2) await say([{ line: "fm_found_both" }, { gap: 300 }, petalSay(b.p)]);
      else await say([...(helped ? [] : [{ line: "fm_found_all" }, { gap: 250 }]), { line: "fm_all_start" }, { gap: 400 }, petalSay(b.p)]);
      if (b.spell && mid) {
        // Reception: < a > on cat's middle line
        const w = b.targets[0];
        const segs = segsOf(w);
        const at = segs.findIndex((s, i) => i > 0 && s.p === b.p);
        if (at > 0) {
          setCard(w, { lines: { n: segs.length, show: [] } });
          await sleep(250);
          await say(lineOr("tv_watch_write", []));
          await castOn(w, at, () => setCard(w, { lines: { n: segs.length, show: [{ i: at, g: segs[at].g }] } }));
          await say([...lineOr("tv_how_we_write", [{ line: "how_we_spell" }]), { gap: 150 }, petalSay(b.p)]);
          await sleep(500);
        }
      }
      patch({ pockets: null });
      endGame();
    },

    // ---- Ninja Reading (§3.7 A; again, §3.10): "Let's play Ninja Reading. Ninjas always start on this side, and go this
    // way." · "I'll read them first. Then you read them." · "Fish… dog. Fish dog!" · Ready ("Now you read them. Do you
    // want to have a go?") · "Tap each picture, starting on this side."
    rail: async (b) => {
      const form = startGame("rail");
      const full = form === "full";
      const def = GAMES.rail;
      patch((v) => ({ cards: v.cards.map((c) => ({ ...c, out: true })), rail: { arrow: "glow", light: null }, rails: null, speed: null, ribbon: null, pockets: null, sound: null }));
      await sleep(450);
      // the frame: the ninja runs the rail on "this way" (the reading finger)
      const frame = openingLines(def, form);
      if (frame.length) {
        const c = nextClip(frame[0], 2500);
        const said = told(lines(frame));
        void c.then(async (t) => {
          if (!t || !alive.current) return;
          await clipAt(t)(((t.end - t.start) * FAST * (full ? 0.66 : 0.25)) / 1000);
          if (alive.current) runAlong(760, 1500);
        });
        await said;
      }
      // the pictures land on the rail
      patch((v) => ({ cards: [...v.cards.filter((c) => !b.cards.includes(c.w)).map((c) => ({ ...c, out: true })), ...onRail(b.cards).map((c) => ({ ...c, key: `${c.w}-rail` }))] }));
      await sleep(450);
      const demoOn = playsDemo(def, form);
      // (Sensei's reading names the pictures; with no reading, each is named as it lands)
      if (!demoOn) await nameCards(b.cards);
      /** Put the pictures back on the rail, apart (after a merge). */
      const split = async () => {
        if (!b.merge || !viewRef.current.cards.some((c) => c.w === b.merge && !c.out)) return;
        patch((v) => ({ cards: [...v.cards.filter((c) => c.w !== b.merge), ...onRail(b.cards).map((c) => ({ ...c, x: PLAY_CX, moving: true, key: `${c.w}-split` }))] }));
        await sleep(60);
        patch((v) => ({ cards: v.cards.map((c) => onRail(b.cards).find((x) => x.w === c.w) ? { ...c, ...onRail(b.cards).find((x) => x.w === c.w)!, key: c.key } : c) }));
        fx.burst(PLAY_CX, 380, "stars", 14);
        await sleep(500);
        setCards((cs) => cs.map((c) => ({ ...c, moving: false })));
      };
      const show = async (live: Live) => {
        await split();
        await say(lineOr("tv_rail_ido", []));
        if (!live()) return;
        // "Fish… dog. Fish dog!": a light passes under each card on its word; they bump and merge on "Fish dog!"
        await readAlong(b.cards, b.line, undefined, live, b.merge);
        b.cards.forEach((w) => named.add(w)); // (the reading has named them)
      };
      if (demoOn) {
        await show(isAlive);
        lastShow.current = { game: "rail", same: true, run: show };
        const rr = await readyHold("rail", form, { show, again: lines(frame), answers: () => [b.cards[0]], enter: () => void split() });
        if (!alive.current || rr?.how === false) return;
        await split();
        const tapped = rr?.tapped ?? null;
        await echoBoard(tapped);
        // the hand-over (the Ready named the task); a recap without its hold says "Now you read them." first
        if (!rr) await say(lineOr("tv_rail_yours", []));
        await childRail(b, full, tapped?.how === "answer" ? tapped : null);
      } else {
        lastShow.current = { game: "rail", same: true, run: show };
        await say(lineOr("tv_rail_yours", []));
        await childRail(b, full, null);
      }
      endGame();
    },

    // ---- the pictures swap places (a show), then a held step: "When you're ready for the next game, tap the green
    // arrow." (§3.7 B, §3.10); Hear it again plays the swap again
    swap: async (b) => {
      gameRef.current = null;
      setGame(null);
      clearTold();
      lastShow.current = null;
      await swapShow(b, isAlive);
      if (!alive.current) return;
      let tok = 0;
      await nextGameHold(() => {
        const my = ++tok;
        hush();
        return swapShow(b, () => my === tok && alive.current);
      });
      if (tok) tok++;
    },

    // ---- two rows (§3.7 C; again, §3.10): "Here are two rows of pictures. I'll read one, and you tap it." · "I'll go
    // first. Fish… dog." · "Fish came first. So I tap this row." · Ready · "Here I go. Cat… dog. Which row did I read?"
    which: async (b) => {
      const form = startGame("which");
      const def = GAMES.which;
      patch((v) => ({ cards: v.cards.map((c) => ({ ...c, out: true })), rail: null, speed: null, sound: null }));
      await sleep(350);
      // the governor drops the demo only on a recap (a first meeting always has it)
      const demoOn = playsDemo(def, form) && !(form === "recap" && skipDemoNow.current);
      const showRows = async (rows: string[][]) => {
        patch({ rails: { rows, state: ["", ""], light: null } });
        await sleep(450);
      };
      const sweep = async (r: number, live: Live = isAlive) => {
        const n = viewRef.current.rails?.rows[r].length ?? 2;
        for (let i = 0; i < n; i++) {
          if (!live()) return;
          patch((v) => ({ rails: v.rails && { ...v.rails, light: [r, i] } }));
          await sleep(260);
        }
        if (live()) patch((v) => ({ rails: v.rails && { ...v.rails, light: null, state: v.rails.state.map((s, i) => (i === r ? "glow" : s)) } }));
      };
      /** Light each picture of row `r` as its word is said in `line` (its word timings). */
      const readRow = async (line: string, r: number, live: Live) => {
        const rowWs = viewRef.current.rails?.rows[r] ?? [];
        const c = nextClip(line, 2500);
        const said = say({ line });
        const at = clipAt(await c);
        for (const [i, w] of rowWs.entries()) {
          const s = wordAt(line, w);
          if (s === undefined) continue;
          await at(s);
          if (!live()) break;
          patch((v) => ({ rails: v.rails && { ...v.rails, light: [r, i] } }));
        }
        await said;
        patch((v) => ({ rails: v.rails && { ...v.rails, light: null } }));
      };
      await showRows(demoOn ? WHICH_DEMO.rows : b.rows);
      // the frame: each row glows in turn
      const frame = openingLines(def, form);
      if (frame.length) {
        const c = nextClip(frame[0], 2500);
        const said = told(lines(frame));
        void c.then(async (t) => {
          if (!t) return;
          const at = clipAt(t), d = ((t.end - t.start) * FAST) / 1000;
          for (const [r, s] of [[0, 0.45], [1, 0.72]] as const) {
            await at(d * s);
            if (!alive.current) return;
            patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((_, i) => (i === r ? "glow" : "")) } }));
          }
          await at(d);
          if (alive.current) patch((v) => ({ rails: v.rails && { ...v.rails, state: ["", ""] } }));
        });
        await said;
      }
      await nameCards([...new Set((demoOn ? WHICH_DEMO.rows : b.rows).flat())]);
      // the demo on its own rows: "I'll go first. Fish… dog." (a light under each) · "Fish came first. So I tap this row."
      // (the paw taps the top row; it glows; a crown of stars)
      const show = async (live: Live) => {
        if (viewRef.current.rails?.rows !== WHICH_DEMO.rows) await showRows(WHICH_DEMO.rows);
        await readRow("tv_which_demo", WHICH_DEMO.answer, live);
        if (!live()) return;
        const r = () => el(`rail ${WHICH_DEMO.answer}`);
        const said = say(lineOr("tv_which_so", []));
        await sleep(900);
        if (!live()) return;
        await pawAt(r(), live, 600);
        if (!live()) return;
        sfx.good();
        patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s, i) => (i === WHICH_DEMO.answer ? "flash" : s)) } }));
        void gift(r(), { shape: "around" });
        await Promise.all([sweep(WHICH_DEMO.answer, live), said]);
      };
      if (demoOn) {
        await show(isAlive);
        const rr = await readyHold("which", form, { show, own: true, again: lines(frame), enter: () => void showRows(b.rows) });
        if (!alive.current || rr?.how === false) return;
        if (!rr) await showRows(b.rows);
      }
      lastShow.current = { game: "which", same: false, run: show };
      if (viewRef.current.rails?.rows !== b.rows) await showRows(b.rows);
      await nameCards([...new Set(b.rows.flat())]);
      const qid = `tv_which_q_${b.rows[b.answer].join("_")}`;
      const q: Say[] = lineOr(qid, [{ line: "fm_which_cat_dog" }]);
      let misses = 0;
      // "Here I go. Cat… dog. Which row did I read?": both rows glow while it is asked (no light under either row's
      // pictures: that would say which one)
      const r = await askWith({
        answers: () => [`rail ${b.answer}`],
        prompt: q,
        offer: form === "short" ? "short" : undefined,
        onWrong: async (id) => {
          if (!id.startsWith("rail ")) return;
          recordFoundation({ target: { kind: "directionality", aspect: "track-order" }, result: "incorrect", source: "choice", support: misses === 0 && !pending.current?.helped ? "independent" : "guided" });
          misses++;
          sfx.wrong();
          patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s, i) => (`rail ${i}` === id ? "wrong" : s)) } }));
          await childWrong();
          await sleep(400);
          patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s, i) => (`rail ${i}` === id ? "" : s)) } }));
          ninja.pose(null);
          // "Let's listen again. Cat… dog. Which row has the cat first?"
          if (misses === 1) await askAgain(lineOr(`tv_which_fix_${b.rows[b.answer].join("_")}`, q));
          else await fixTogether([`rail ${b.answer}`]);
        },
      }, async () => {
        patch((v) => ({ rails: v.rails && { ...v.rails, state: ["glow", "glow"] } }));
        await say(q);
        patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((s) => (s === "glow" ? "" : s)) } }));
      });
      sfx.good();
      patch((v) => ({ rails: v.rails && { ...v.rails, state: v.rails.state.map((_, i) => (i === b.answer ? "flash" : "")) } }));
      score.current.total++;
      const first = misses === 0 && !r.auto;
      if (first) score.current.first++;
      noteAttempt(first);
      recordFoundation({ target: { kind: "directionality", aspect: "track-order" }, result: r.auto ? "unassessed" : "correct", source: "choice", support: first && !r.helped ? "independent" : "guided" });
      const held = first ? tierHeld() : false;
      if (first && !held) hit();
      // a crown of stars round the row, as its light sweeps left to right: "Cat dog!"
      void gift(r.el ?? el(`rail ${b.answer}`), { shape: "around" });
      const after = b.rows[b.answer].length >= 3 ? `fm_triple_${b.rows[b.answer].join("_")}` : `fm_pair_${b.rows[b.answer].join("_")}`;
      await Promise.all([sweep(b.answer), hasLine(after) ? say({ line: after }) : Promise.resolve(true)]);
      bead();
      await praiseSlot("which", { held, keptGoing: misses > 0 && !r.auto, helped: r.helped, last: true });
      await sleep(150);
      patch({ rails: null });
      endGame();
    },

    // ---- Word Squish (§3.7 D; again, §3.10): "Here's a new game, called Word Squish." · "Tap the green arrow, and
    // let's begin." (▶, the full form's held step) · "I tap the tortoise, and say them slowly. Sun… flower." · "Then I tap the rabbit, and squish them. Sunflower!" · Ready ("Two little words make
    // one big word. Now you make one. Are you ready?") · "This is a star." · "Star… fish. Tap the rabbit, and say them
    // fast." · the tap · "Starfish!"
    compound: async (b) => {
      const form = startGame("compound");
      const def = GAMES.compound;
      const demoOn = playsDemo(def, form);
      const board = demoOn ? SQUISH_DEMO.parts : b.parts;
      patch((v) => ({
        rails: null, ribbon: null, pockets: null, sound: null,
        cards: [...v.cards.map((c) => ({ ...c, out: true })), ...onRail(board).map((c) => ({ ...c, key: `${c.w}-cmp` }))],
        rail: v.rail ?? { arrow: "glow", light: null },
        speed: { tortoise: "", rabbit: "", at: "side" },
      }));
      // (the frame names the game, not the cards: it starts as they land, TEACHER_SCRIPT §6's run from the last row)
      await sleep(120);
      // (the shorter "This game is called Word Squish." once recorded: the frame and the narrated demo inside 12 s)
      const frame = openingLines(def, form).map((id) => (id === "tv_squish_frame" && hasLine("tv_squish_meet") ? "tv_squish_meet" : id));
      if (frame.length) await told(lines(frame));
      // (no held step between the frame and the demo: Story Time's borrowed "Tap the green arrow, and let's begin." made
      // two ▶ holds in about 14 s with the demo's Ready; verify 28 Sep. The demo's Ready is the child's tap.)
      if (!alive.current) return;
      // the demo: the paw taps the tortoise and each card lights in turn; then the rabbit, and the cards zip together and
      // bloom into the sunflower, clean on "Sunflower!"
      const show = async (live: Live) => {
        if (!viewRef.current.cards.some((c) => c.w === SQUISH_DEMO.parts[0] && !c.out)) {
          patch((v) => ({ cards: [...v.cards.filter((c) => !c.out).map((c) => ({ ...c, out: true })), ...onRail(SQUISH_DEMO.parts).map((c) => ({ ...c, key: `${c.w}-cmpr` }))], speed: v.speed ?? { tortoise: "", rabbit: "", at: "side" } }));
          await sleep(450);
          if (!live()) return;
        }
        const slow = "tv_squish_slow", fast = "tv_squish_fast";
        const c1 = nextClip(slow, 2500);
        const said1 = say({ line: slow });
        const at1 = clipAt(await c1);
        await at1((wordAt(slow, "tortoise") ?? 0.62) - 0.5);
        if (!live()) return;
        void pawAt(el("tortoise"), live, 500);
        light("tortoise", "flash");
        const sunAt = wordAt(slow, "sunflower") ?? wordAt(slow, "sun") ?? 3.4;
        await at1(sunAt);
        if (!live()) return;
        setCard(SQUISH_DEMO.parts[0], { lit: true });
        await at1(sunAt + 0.9);
        if (!live()) return;
        setCard(SQUISH_DEMO.parts[1], { lit: true });
        await said1;
        light("tortoise", "");
        if (!live()) return;
        const c2 = nextClip(fast, 2500);
        const said2 = say({ line: fast });
        const at2 = clipAt(await c2);
        await at2((wordAt(fast, "rabbit") ?? 0.94) - 0.5);
        if (!live()) return;
        void pawAt(el("rabbit"), live, 500);
        light("rabbit", "flash");
        // (the merge's glide, pop and fading sparkle take about 0.8 s: start it so the sunflower is clean on the word)
        await at2((wordAt(fast, "sunflower") ?? 3.26) - 0.85);
        if (!live()) return;
        void ninja.act("cast", { x: PLAY_CX, y: 380 }, { react: false });
        // (no hold after "Sunflower!": the Ready follows at once, as the sunflower still bounces; TEACHER_SCRIPT §6)
        await merge(SQUISH_DEMO.parts, SQUISH_DEMO.word, { quick: true, saying: said2, hold: 60, keep: true }, live);
        light("rabbit", "");
      };
      if (demoOn) {
        await show(isAlive);
        // the child's pictures land on the rail as the Ready asks
        const enter = () => patch((v) => ({ cards: [...v.cards.filter((c) => !c.out).map((c) => ({ ...c, out: true })), ...onRail(b.parts).map((c) => ({ ...c, key: `${c.w}-cmp` }))] }));
        const rr = await readyHold("compound", form, { show, own: true, again: lines(frame), enter });
        if (!alive.current || rr?.how === false) return;
        if (!rr) enter();
        await sleep(450);
      }
      lastShow.current = { game: "compound", same: false, run: show };
      await nameCards(b.parts);
      // "Star… fish. Tap the rabbit, and say them fast.": each card lights on its word; the rabbit pulses after a pause
      const main = b.q;
      const times = WORD_TIMES[main] ?? [0, 1.2];
      let misses = 0;
      const c = nextClip(main, 2500);
      const answered = ask({
        answers: () => ["rabbit"],
        prompt: [{ line: main }],
        offer: form === "short" ? "short" : undefined,
        onWrong: async (id) => {
          if (id !== "tortoise") return;
          misses++;
          // the tortoise says them slowly again (not wrong to hear), then the rabbit glows
          light("tortoise", "flash");
          await say([plain(b.parts[0]), { gap: 500 }, plain(b.parts[1])]);
          light("tortoise", "");
          light("rabbit", "glow");
        },
      });
      const at = clipAt(await c);
      await at(times[0]);
      setCard(b.parts[0], { lit: true });
      await at(times[1]);
      setCard(b.parts[1], { lit: true });
      await at((times[2] ?? 2.3) + 1.5);
      patch((v) => ({ speed: v.speed && v.speed.rabbit === "" ? { ...v.speed, rabbit: "pulse" } : v.speed }));
      const r = await answered;
      // (graded, but not a streak hit: the rabbit pulses, so it isn't a choice between pictures)
      graded(misses === 0 && !r.auto);
      light("rabbit", "flash");
      if (b.via === "star") {
        // the ninja throws its golden star onto the fish, which becomes a starfish (and a crown of stars lands on it)
        const fish = el(b.parts[1]);
        await Promise.race([ninja.act("throw", fish ? cornerOf(fish) : undefined, { react: false }), sleep(700)]);
      } else void ninja.act("cast", { x: PLAY_CX, y: 380 }, { react: false });
      // "Starfish!" once the starfish is clean, then it holds (merge)
      await merge(b.parts, b.word, { quick: true, line: b.after, hold: 900 });
      light("rabbit", "");
      bead();
      // "You squished them into one big word!": the first squish of all only; later, the every-third praise
      if (onceInSave("praise:squish") && hasLine("tv_praise_squish") && !closesNext()) {
        praiseBy("tv_praise_squish");
        markPraise("tv_praise_squish");
        if (await say({ line: "tv_praise_squish" })) heard("praise:squish");
      } else await praiseSlot("compound", { keptGoing: misses > 0 && !r.auto, helped: r.helped, last: true });
      endGame();
    },

    // ---- Guess My Word (§3.11): "I'll say the sounds, and you listen for the word." · "My sounds are…" /s/ /u/ /n/
    // (neutral dots, Dec1) · "I can hear sun. So I tap the sun." (the dots bloom into petals under it) · Ready · each
    // word: its pictures named, "Listen for the word…" and its sounds, "Which picture is it?"
    sounds: async (b) => {
      const form = startGame("sounds");
      const def = GAMES.sounds;
      const demoOn = playsDemo(def, form);
      const sayWord = (w: string, onSeg?: (i: number) => void): Say[] => {
        const segs = segsOf(w);
        return segs.length ? [{ sounds: segs, gap: 420, show: "hidden", onSeg }] : [plain(w)];
      };
      const dotsFor = (w: string, key: string) => patch({ sdots: { n: segsOf(w).length || 3, lit: -1, bloom: null, x: captionsOn() ? SDOTS_X.captions : SDOTS_X.plain, y: 470, key } });
      const litDot = (i: number) => patch((v) => ({ sdots: v.sdots && { ...v.sdots, lit: i } }));
      /** The dots bloom into the word's mini petals under the chosen picture (after the answer: SOUND_DISPLAY A1). */
      const bloomUnder = (w: string) => {
        const c = viewRef.current.cards.find((x) => x.w === w && !x.out);
        if (!c) return;
        const bottom = c.y + c.size / 2 + (c.gutter ?? G);
        patch((v) => ({ sdots: v.sdots && { ...v.sdots, lit: -1, bloom: segsOf(w).map((s) => s.p), x: c.x, y: bottom - 6 } }));
      };
      const cardsFor = (opts: string[], key: string) => {
        const n = opts.length;
        patch((v) => ({ cards: [...v.cards.map((c) => ({ ...c, out: true })), ...row(opts, n >= 3 ? 210 : 240, 300, n >= 3 ? 0 : 40, n >= 3 ? G : 24).map((c) => ({ ...c, key: `${c.w}-${key}` }))] }));
      };
      patch({ speed: { tortoise: "", rabbit: "", at: "side" }, ribbon: null, rail: null, rails: null, pockets: null, sound: null });
      cardsFor(demoOn ? b.demo.options : b.items[0].options, "d");
      dotsFor(demoOn ? b.demo.target : b.items[0].target, "d");
      await sleep(450);
      const frame = openingLines(def, form);
      if (frame.length) await told(lines(frame));
      // the demo: the paw lifts, a dot lights on each sound; then it taps the sun, which bounces; its dots bloom
      const show = async (live: Live) => {
        if (!viewRef.current.cards.some((c) => c.w === b.demo.target && !c.out)) {
          cardsFor(b.demo.options, "dr");
          await sleep(450);
        }
        dotsFor(b.demo.target, `d${Date.now()}`);
        // (the demo's pictures aren't named first: "I can hear sun." names the answer, and naming them would say it
        // before the sounds; TEACHER_SCRIPT §3.11, §6's 22 words from the stone to the Ready)
        if (!live()) return;
        await say([...lineOr("tv_my_sounds", []), { gap: 350 }, ...sayWord(b.demo.target, litDot)]);
        if (!live()) return;
        const c = nextClip(`tv_guess_so_${b.demo.target}`, 2500);
        const said = say(lineOr(`tv_guess_so_${b.demo.target}`, [plain(b.demo.target)]));
        const at = clipAt(await c);
        await at(1.1);
        if (!live()) return;
        await pawAt(el(b.demo.target), live, 450);
        if (!live()) return;
        setCard(b.demo.target, { state: "right" });
        sfx.good();
        const { landed } = rightAnswer(el(b.demo.target), "pic", { first: false, living: LIVING.has(b.demo.target), soft: true });
        bloomUnder(b.demo.target);
        await afterLanding(landed);
        await said;
        await sleep(300);
        setCard(b.demo.target, { state: "" });
      };
      if (demoOn) {
        await show(isAlive);
        const rr = await readyHold("sounds", form, { show, own: true, again: lines(frame), enter: () => (cardsFor(shuffleStable(b.items[0].options.slice(0, 3), b.items[0].target), b.items[0].target), patch({ sdots: null })) });
        if (!alive.current || rr?.how === false) return;
      }
      lastShow.current = { game: "sounds", same: false, run: show };
      // (three pictures from the start, as the Ready brings them in; back to two after a miss, three again after two
      // first tries in a row: §10)
      let n = 3, run2 = 0, firstTries = 0;
      for (const [k, it] of b.items.entries()) {
        if (!alive.current) return;
        if (capped.current) break;
        const opts = shuffleStable(it.options.slice(0, n), it.target);
        if (!(k === 0 && demoOn && viewRef.current.cards.some((c) => c.w === it.target && !c.out))) cardsFor(opts, it.target);
        dotsFor(it.target, it.target);
        // each word is a new question: its own Hear it again (the game's frame on the first)
        bundle.current = k === 0 ? [...lines(frame)] : [];
        await sleep(450);
        await nameCards(viewRef.current.cards.filter((c) => !c.out).map((c) => c.w));
        if (k === b.items.length - 1 && b.items.length > 1 && hasLine("fm_last_one")) await say({ line: "fm_last_one" });
        // "Listen for the word… /m/ /a/ /p/ · Which picture is it?" (dropped after two first tries in a row, SF A6)
        const q: Say[] = [...lineOr("tv_guess_q", [{ line: "listen" }]), { gap: 300 }, ...sayWord(it.target, litDot), ...(firstTries >= 2 ? [] : [{ gap: 300 }, { line: "fm_which_pic" }])];
        let misses = 0;
        const segs = segsOf(it.target);
        const r = await ask({
          answers: () => [it.target],
          prompt: q,
          speed: { tortoise: () => withTortoise(sayWord(it.target, litDot)) },
          ...(segs.length ? { armOn: `sound:${segs[0].p}` } : {}),
          // 8 s: "Say the sounds with me. Then push them together, fast." and the sounds (never a line with the word)
          idle: () => {
            const s = fsStuckSay("sounds", it.target, { always: true, segs });
            return s ? withTortoise(s.map((x) => ("sounds" in x ? { ...x, onSeg: litDot } : x))) : say(q);
          },
          onWrong: async (id) => {
            misses++;
            sfx.wrong();
            setCard(id, { state: "wrong" });
            await childWrong();
            await say(plain(id));
            setCard(id, { state: "" });
            ninja.pose(null);
            if (misses >= 2) return fixTogether([it.target]);
            // "Let's listen again… /m/ /a/ /p/", taking turns with the stuck recap (the tortoise lights on its sounds)
            const s = fsStuckSay("sounds", it.target, { attempt: 1, segs });
            if (capped.current) return;
            if (s) await withTortoise(s.map((x) => ("sounds" in x ? { ...x, onSeg: litDot } : x)));
            else await say([...lineOr("tv_guess_again", [{ line: "listen_again" }]), { gap: 250 }, ...sayWord(it.target, litDot)]);
          },
        });
        setCard(it.target, { state: "right" });
        sfx.good();
        const res = childRight(r.el ?? el(it.target), it.target, { first: misses === 0, auto: r.auto });
        // (the dots bloom as the gift lands, a moment after the tap: never while a sound of the question is heard)
        void sleep(220).then(() => alive.current && bloomUnder(it.target));
        await afterLanding(res.landed);
        await say(plain(it.target));
        if (misses === 0 && !r.auto) firstTries++;
        else firstTries = 0;
        if (!r.auto && fsReadback("sounds", { afterMiss: misses > 0 }) === "rabbit") {
          // Move 1 (§9.3): "Let's say the sounds, the slow way…" /m/ /a/ /p/ (the bloomed petals swell, the tortoise
          // walks) · the idea · "Now tap the rabbit, and say it fast." · the tap · [map]. When the close will say "If you
          // say the sounds, you can hear the word." (W5's), that is this game's idea, and no second one is said here
          light("tortoise", "flash");
          await say([...lineOr("tv_fs_say_sounds_slow", []), { gap: 300 }, ...segs.flatMap((s, i) => [...(i ? [{ gap: 300 }] : []), petalSay(s.p)])]);
          light("tortoise", "");
          fsSaid("tv_fs_say_sounds_slow", "sounds");
          const idea = closeIdeaDue() ? null : fsIdea("sounds", "listen", { tight: true });
          if (idea && (await say({ line: idea }))) fsSaid(idea, "sounds");
          await rabbitTurn("sounds", () => withTortoise(segs.flatMap((sg, i) => [...(i ? [{ gap: 300 }] : []), petalSay(sg.p)])));
          await fastSay(it.target);
        } else if (k === 0 && form === "full" && hasLine("tv_guess_together")) {
          // "Let's say it together." /m/ /a/ /p/ [map]
          await say([{ line: "tv_guess_together" }, { gap: 300 }, ...segs.flatMap((s, i) => [...(i ? [{ gap: 300 }] : []), petalSay(s.p)]), { gap: 300 }, plain(it.target)]);
        }
        bead();
        await praiseSlot("sounds", { held: res.held, fs: () => fsPraise("sounds", "listen"), keptGoing: misses > 0 && !r.auto, helped: r.helped, last: k === b.items.length - 1 });
        // choices grow from 2 to 3 after two first tries in a row, and go back to 2 after a miss (§10)
        run2 = misses === 0 && !r.auto ? run2 + 1 : 0;
        n = misses || r.auto ? 2 : run2 >= 2 ? 3 : n;
        await sleep(250);
      }
      patch({ sdots: null });
      endGame();
    },

    // ---- Sound Dots (§3.12): "Every dot is one sound in the word." · "I start here, and go this way." · the paw taps
    // each dot (each becomes its sound's mini petal) · "Then I say the word…" [sun] · Ready ("Now you tap the dots, and
    // say the sounds with me. Are you ready?") · each word: its name, the child's dot taps, the word
    dots: async (b) => {
      const form = startGame("dots");
      const def = GAMES.dots;
      const demoOn = playsDemo(def, form);
      patch({ speed: { tortoise: "", rabbit: "", at: "side" }, ribbon: null, rail: null, rails: null, pockets: null, sound: null, sdots: null });
      const showWord = async (w: string, named = true) => {
        const ps = segsOf(w).map((s) => s.p);
        // (with captions on, the picture and its dots sit left of the caption bubble's reach: DOTS_AT)
        const at = captionsOn() ? DOTS_AT.captions : DOTS_AT.plain;
        patch((v) => ({ cards: [...v.cards.filter((c) => !c.out).map((c) => ({ ...c, out: true })), { w, x: at.x, y: 240, size: 250, gutter: G, key: `${w}-dots-${Date.now()}` }], dots: { word: w, ps, tapped: 0, lit: -1, sweep: false, wrong: -1, pulse: -1, arrow: false, ...at } }));
        await sleep(450);
        if (named) await nameCards([w]);
      };
      const sweepSay = async (w: string, live: Live = isAlive) => {
        patch((v) => ({ dots: v.dots && { ...v.dots, sweep: true, lit: -1, pulse: -1 } }));
        runAlong(420 + (viewRef.current.dots?.x ?? PLAY_CX) - PLAY_CX, 700);
        await sleep(350);
        if (live()) await fastSay(w);
        patch((v) => ({ dots: v.dots && { ...v.dots, sweep: false } }));
      };
      /** Dot i sounds: it lights and becomes its sound's mini petal, which swells as the sound plays. */
      const sound = async (i: number) => {
        const ps = viewRef.current.dots?.ps ?? [];
        patch((v) => ({ dots: v.dots && { ...v.dots, tapped: i + 1, lit: i, pulse: -1 } }));
        await sleep(60); // (the petal is on screen as its sound starts)
        // (the dots' sounds are the slow way: the tortoise lights with each)
        await withTortoise([petalSay(ps[i])]);
      };
      await showWord(demoOn ? b.demo : b.words[0], !demoOn);
      const frame = openingLines(def, form);
      if (frame.length) {
        // "Every dot is one sound in the word.": the dots glow in turn
        const c = nextClip(frame[0], 2500);
        const said = told(lines(frame));
        void c.then(async (t) => {
          if (!t) return;
          const at = clipAt(t), d = ((t.end - t.start) * FAST) / 1000, n = viewRef.current.dots?.ps.length ?? 3;
          for (let i = 0; i < n && alive.current; i++) {
            await at(d * (0.35 + (0.5 * i) / n));
            patch((v) => ({ dots: v.dots && v.dots.tapped === 0 ? { ...v.dots, pulse: i } : v.dots }));
          }
          await at(d);
          patch((v) => ({ dots: v.dots && { ...v.dots, pulse: -1 } }));
        });
        await said;
      }
      // the demo: "I start here, and go this way." (the paw at the first dot; the arrow glows) · the paw taps each dot ·
      // "Then I say the word…" [sun] (the paw sweeps along the row)
      const show = async (live: Live) => {
        if (viewRef.current.dots?.word !== b.demo) await showWord(b.demo);
        if (!live()) return;
        patch((v) => ({ dots: v.dots && { ...v.dots, arrow: true } }));
        const said = say(lineOr("tv_dots_ido", []));
        await sleep(300);
        pawTo(el("dot 0"));
        await said;
        patch((v) => ({ dots: v.dots && { ...v.dots, arrow: false } }));
        const n = viewRef.current.dots?.ps.length ?? 0;
        for (let i = 0; i < n; i++) {
          if (!live()) return;
          await pawAt(el(`dot ${i}`), live, i ? 500 : 250);
          if (!live()) return;
          await sound(i);
        }
        await sleep(250);
        if (!live()) return;
        await say(lineOr("tv_dots_word_ido", []));
        if (live()) await sweepSay(b.demo, live);
      };
      if (demoOn) {
        await nameCards([b.demo]);
        await show(isAlive);
        const rr = await readyHold("dots", form, { show, own: true, again: lines(frame), enter: () => void showWord(b.words[0], false) });
        if (!alive.current || rr?.how === false) return;
      }
      lastShow.current = { game: "dots", same: false, run: show };
      for (const [k, w] of b.words.entries()) {
        if (!alive.current || capped.current) break;
        clearTold();
        if (viewRef.current.dots?.word !== w || (viewRef.current.dots?.tapped ?? 0) > 0) await showWord(w, false);
        await nameCards([w]);
        const ps = viewRef.current.dots?.ps ?? [];
        let slips = 0;
        for (let i = 0; i < ps.length; i++) {
          const want = `dot ${i}`;
          patch((v) => ({ dots: v.dots && { ...v.dots, pulse: i } }));
          await ask(
            {
              answers: () => [want],
              prompt: [],
              ignore: (id) => id.startsWith("dot ") && Number(id.slice(4)) < i,
              idle: () => glow([want]),
              onWrong: async (id) => {
                if (!id.startsWith("dot ")) return;
                slips++;
                patch((v) => ({ dots: v.dots && { ...v.dots, wrong: Number(id.slice(4)), arrow: true } }));
                // "Ninjas start on this side. Tap this one first." (the arrow glows; the dot to tap pulses)
                if (i === 0) await say(lineOr("tv_rail_start", [{ line: "fm_l2_start" }]));
                else await sleep(450);
                patch((v) => ({ dots: v.dots && { ...v.dots, wrong: -1, arrow: false, pulse: i } }));
              },
            },
            false,
          );
          await sound(i);
        }
        graded(!slips);
        if (!slips) hit();
        await sleep(250);
        if (k === 0 && fsReadback("dots") === "rabbit") {
          // Move 1 (§9.3): "Now tap the rabbit, and say it fast." · the tap · [cat] with the sweep · "If you say the
          // sounds, you can hear the word." (once a save; the idea) or the idea
          await rabbitTurn("dots", () => withTortoise((viewRef.current.dots?.ps ?? []).flatMap((p, i) => [...(i ? [{ gap: 300 }] : []), petalSay(p)])));
          await sweepSay(w);
          if (onceInSave("sw:if-you-say") && ifSayDue()) {
            patch((v) => ({ dots: v.dots && { ...v.dots, pulse: -2 } }));
            if (await say({ line: IF_SAY })) {
              heard("sw:if-you-say");
              fsSaid(IF_SAY, "dots");
            }
            patch((v) => ({ dots: v.dots && { ...v.dots, pulse: -1 } }));
          } else {
            const idea = fsIdea("dots", "listen");
            if (idea && (await say({ line: idea }))) fsSaid(idea, "dots");
          }
        } else {
          // "Now say the whole word…" (the first two words), a moment to say it, then the sweep
          if (k < 2 && hasLine("tv_now_say_word")) await say({ line: "tv_now_say_word" });
          await sleep(1500);
          await sweepSay(w);
        }
        void gift(el(w));
        bead();
        if (k > 0) await praiseSlot("dots", { fs: () => fsPraise("dots", "listen"), keptGoing: slips > 0, last: k === b.words.length - 1 });
        await sleep(500);
      }
      patch({ dots: null });
      endGame();
    },

    // ---- every bead lit; the closing lines (§5.6); the ninja celebrates (the reward's Hear it again starts with them)
    done: async (b) => {
      gameRef.current = null;
      setGame(null);
      pending.current = null;
      patch({ speaker: false, sound: null, point: null, burst: true, lit: nBeads, speed: null, hero: null, scrim: false });
      sfx.great();
      const r = stageXY(document.querySelector(".wu-bead.sticker"));
      fx.burst(r.x, r.y, "stars", 22);
      // the ninja's big finish plays with the closing line (a tier-up line still pending comes first); the closing line
      // is the level's praise, so it keeps 5 s from the last praise line ("You found them both!…")
      await Promise.race([ninja.linesDone(), sleep(2500)]);
      const since = (performance.now() - praiseAt.current) * FAST;
      if (since < 5300) await sleep(5300 - since);
      // "If you say the sounds, you can hear the word." (W5's close) is a fast/slow idea: said once a session, within
      // the session's idea lines (§9.5), and it counts as Guess My Word's idea
      const ifSay = b.lines.includes(IF_SAY) && closeIdeaDue();
      const said = say(lines(b.lines.filter((id) => id !== IF_SAY || ifSay), 300));
      await Promise.all([said, sleep(500).then(() => (alive.current ? ninja.celebrate() : undefined))]);
      if ((await said) && ifSay) {
        fsSaid(IF_SAY, "sounds");
        heard("sw:if-you-say");
      }
    },
  };

  /** The held step between two games (§3.7 B): "When you're ready for the next game, tap the green arrow." ▶ goes on;
   *  Hear it again replays the show before it (`replay`), or the line. A swap the governor drops still leaves this
   *  step, so the child's tap splits the talk between two games. */
  const nextGameHold = async (replay: (() => Promise<unknown>) | null) => {
    clearTold();
    setHolding(true);
    patch({ point: null });
    const line = lineOr("tv_next_game", [{ line: "nav_ready" }]);
    void say(line);
    // (Hear it again: the show again, or, when there was none, the line)
    await holdNext(`${script.key}:next-game`, replay ?? (() => say(line))); // (false: the screen was left, and the director stops with it)
    if (isSpeaking()) hush();
    slowmo(false);
    setHolding(false);
  };
  /** Will this lesson's close say "If you say the sounds, you can hear the word." (W5's)? Only when it hasn't been said
   *  this session and the session still has room for an idea line (TEACHER_SCRIPT §9.5: 4 a session). */
  const closeIdeaDue = () => script.beats.some((x) => x.kind === "done" && x.lines.includes(IF_SAY)) && ifSayDue();
  /** "If you say the sounds…" may be said now: recorded, not said this session, and room for an idea line. */
  const ifSayDue = () => hasLine(IF_SAY) && !fsHeardThisSession(IF_SAY) && [...FS_IDEAS, ...FS_IDEA_ALSO].filter(fsHeardThisSession).length < FS_IDEA_CAP.session;

  // ---- Move 1's rabbit (TEACHER_SCRIPT §9.2): "Now tap the rabbit, and say it fast." The scene's own rabbit grows,
  // pulses and waits for the child's tap (a child action that splits the talk); at 12 s Sensei says the fast way herself.
  const rabbitTurn = async (g: GameId, slow: () => Promise<unknown>) => {
    setSpeed({ big: true, rabbit: "pulse" });
    // (it hops in from its corner and grows, a CSS glide of 0.55 s in real time, before Sensei asks for it)
    await new Promise((r) => setTimeout(r, 560));
    const r = await ask({
      answers: () => ["rabbit"],
      prompt: lineOr("fm_tap_rabbit", []),
      // (live from the first word of "Now tap the rabbit…": the rabbit's tap is the child's answer to it)
      ...(hasLine("fm_tap_rabbit") ? { armOn: "fm_tap_rabbit" } : {}),
      autoMs: 12000,
      // 8 s: the rabbit hops and glows (no line); a tap on the tortoise says the slow way again, then W1's correction
      // (TEACHER_SCRIPT §3.5 B, row tv_ts_wrong_tortoise): "That's my tortoise. It says words slowly. Now tap the rabbit
      // to say it fast." as the rabbit pulses, so the fast word is led again (verify round 2: [van, slowly] and then
      // [van] with nothing between them)
      idle: () => light("rabbit", "glow"),
      onWrong: async (id) => {
        if (id !== "tortoise") return;
        navLog({ kind: "rabbit", how: "slow" });
        light("rabbit", "");
        await slow();
        light("rabbit", "pulse");
        if (alive.current && hasLine("tv_ts_wrong_tortoise")) await say({ line: "tv_ts_wrong_tortoise" });
      },
    });
    navLog({ kind: "rabbit", how: r.auto ? "timeout" : "tap" });
    fsSaid("fm_tap_rabbit", g);
    setSpeed({ big: false, rabbit: "" });
    if (r.auto && hasLine("tv_fs_now_fast")) await say({ line: "tv_fs_now_fast" });
  };
  /** The nav row's petal swells (on "this sound"): transform only, once. */
  const swellNavPetal = () => {
    const e = document.querySelector('.nav-ctl.sound-badge[data-p] .sb-swell, .wu-navsound .sb-swell') as HTMLElement | null;
    const a = e?.animate([{ transform: "scale(1)" }, { transform: "scale(1.16)", offset: 0.4 }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
    if (a) a.playbackRate = FAST;
  };

  // ---- the child's half of Ninja Reading: the pictures tapped in order, left to right; the first one pulses
  const childRail = async (b: Extract<Beat, { kind: "rail" }>, full: boolean, pre: { id: string; el: Element | null } | null) => {
    let k = 0;
    let slips = 0;
    /** The rail's light slides under a picture; returns its centre (stage x), or null when the picture isn't drawn. */
    const lightUnder = (w: string) => {
      const at = el(w);
      if (!at) return null;
      const p = stageRect(at);
      patch((v) => ({ rail: v.rail && { ...v.rail, light: p.x + p.w / 2 } }));
      return p.x + p.w / 2;
    };
    const tapped = async (want: string, auto: boolean) => {
      recordFoundation({ target: { kind: "directionality", aspect: k === 0 ? "start-left" : "track-order" }, result: auto ? "unassessed" : "correct", source: "choice", support: "guided" });
      setCard(want, { state: "", lit: true });
      const x = lightUnder(want);
      if (x != null) runAlong(Math.max(0, x - 250), 360);
      await say(plain(want));
      k++;
      if (k < b.cards.length) setCard(b.cards[k], { state: "glow" });
    };
    setCard(b.cards[0], { state: "glow" });
    if (pre && pre.id === b.cards[0]) {
      firstAnswer();
      await tapped(b.cards[0], false);
    }
    // "Tap each picture, starting on this side." (not when the child has started already, at the Ready)
    const q = lineOr("tv_rail_turn", [{ line: "fm_l2_turn" }]);
    let sayIt = k === 0;
    while (k < b.cards.length && alive.current) {
      const want = b.cards[k];
      const r = await ask(
        {
          answers: () => [want],
          prompt: q,
          ignore: (id) => b.cards.indexOf(id) >= 0 && b.cards.indexOf(id) < k,
          // (8 s: the picture to tap glows, and the question again; part-way along, "Tap the next one." once recorded)
          idle: () => {
            glow([want]);
            return say(k > 0 ? lineOr("tv_rail_next", q) : q);
          },
          onWrong: async (id) => {
            if (!b.cards.includes(id)) return;
            recordFoundation({ target: { kind: "directionality", aspect: k === 0 ? "start-left" : "track-order" }, result: "incorrect", source: "choice", support: "guided" });
            slips++;
            setCard(id, { state: "wrong" });
            if (k === 0) {
              // the other way: it wiggles, the arrow pulses from the left: "Ninjas start on this side. Tap this one first."
              patch((v) => ({ rail: v.rail && { ...v.rail, arrow: "pulse" } }));
              await say(lineOr("tv_rail_start", [{ line: "fm_l2_start" }]));
              setCard(id, { state: "" });
            } else {
              // a picture further along, after a right start (verify round 2: "Ninjas start on this side" was wrong here,
              // since the child had): it wiggles, and Sensei reads again what has been read, the light under each
              // picture on its word ("Cat…"), then the light steps on to the next one, which glows, like a teacher's
              // finger; `tv_rail_next` ("Ninjas go this way, one at a time. Tap the next one.") once it is recorded.
              // (the wobble is 0.4 s)
              await sleep(450);
              setCard(id, { state: "" });
              for (const w of b.cards.slice(0, k)) {
                if (!alive.current) return;
                lightUnder(w);
                await say(plain(w));
              }
              lightUnder(want);
              setCard(want, { state: "glow" });
              if (hasLine("tv_rail_next")) await say({ line: "tv_rail_next" });
            }
            setCard(want, { state: "glow" });
            patch((v) => ({ rail: v.rail && { ...v.rail, arrow: "glow" } }));
          },
        },
        sayIt,
      );
      sayIt = false;
      await tapped(want, r.auto);
    }
    score.current.total++;
    if (!slips) score.current.first++;
    noteAttempt(!slips);
    if (!slips) hit();
    bead();
    await sleep(120);
    // "Fish dog!" · "What a silly animal!" (the merge, clean; the ninja laughs), or "Cat dog fish!"
    const silly = full && b.silly && hasLine("tv_silly");
    if (silly) setTimeout(() => alive.current && void ninja.act("cheer", undefined, { react: false }), 1400);
    // (a short hold: the swap's show, or the next game, follows; its own sparkle carries the moment)
    if (b.merge) await merge(b.cards, b.merge, { quick: true, line: b.after, also: silly ? "tv_silly" : undefined, hold: 350 });
    else if (b.after) await say({ line: b.after });
    if (!silly) await praiseSlot("rail", { keptGoing: slips > 0, last: true });
    setCards((cs) => cs.map((c) => ({ ...c, lit: false, state: "" })));
    patch((v) => ({ rail: v.rail && { ...v.rail, light: null } }));
  };

  // ---- the shows, and their replays. Each stops at its next step once `live()` turns false (the child tapped, went on,
  // or left).
  /** "Whoops!": a merged picture on the rail (the fish-dog) splits back into its two pictures, the ninja leapfrogs them
   *  and they swap places as Sensei starts, she reads them, and they merge again (the dog-fish). */
  const swapShow = async (b: Extract<Beat, { kind: "swap" }>, live: Live) => {
    if (!viewRef.current.rail) patch({ rail: { arrow: "glow", light: null }, speed: null });
    const merged = viewRef.current.cards.filter((c) => !c.out && !b.cards.includes(c.w));
    if (merged.length || !b.cards.every((w) => viewRef.current.cards.some((c) => c.w === w && !c.out))) {
      const before = onRail([...b.cards].reverse());
      patch((v) => ({ cards: [...v.cards.filter((c) => !merged.includes(c) && !b.cards.includes(c.w)).map((c) => ({ ...c, out: true })), ...before.map((c) => ({ ...c, x: merged.length ? PLAY_CX : c.x, moving: !!merged.length, key: `${c.w}-sw` }))] }));
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
    }, live, b.merge);
  };

  // ---- small animations used by the games
  const kiAtFirstDots = (ws: string[]) => {
    ws.forEach((w, i) => setTimeout(() => {
      const d = document.querySelector(`.wu-slot[data-w="${w}"] .wu-cdots span`);
      if (!d) return;
      const p = stageXY(d);
      fx.ring(p.x, p.y, { color: "#ffc53d", r0: 10, r1: 90, width: 9 });
      fx.glow(p.x, p.y, ["#ffe38a", "#ffc53d"], 6, 34, 1.2);
    }, i * 300));
  };
  const beatNow = useRef<Beat | null>(null);
  /** the governor dropped this beat's demo (skipDemo; a recap only) */
  const skipDemoNow = useRef(false);
  /** Sensei reads the pictures left to right: a light passes under each card on its word, and the ninja runs along
   *  with it, pausing under each. `mergeInto`: they bump together into one picture, clean on the whole word. */
  const readAlong = async (ws: string[], line: string, during?: () => Promise<void>, live: Live = isAlive, mergeInto?: string) => {
    const times = WORD_TIMES[line] ?? ws.map((_, i) => 0.1 + i * 0.7);
    // the lights follow the clip's own clock (audio.ts onClip): exact even when the clip starts late
    const started = nextClip(line, 1500);
    let t = performance.now();
    const said = say({ line });
    if (during) await during();
    const c = await started;
    if (c) t = c.start;
    const at = (s: number) => sleep(Math.max(0, s * 1000 - (performance.now() - t) * FAST));
    for (let i = 0; i < ws.length && live(); i++) {
      await at(times[i]);
      if (!live()) break;
      const e = el(ws[i]);
      setCards((cs) => cs.map((x) => ({ ...x, lit: x.w === ws[i] })));
      if (e) {
        const p = stageRect(e);
        patch((v) => ({ rail: v.rail && { ...v.rail, light: p.x + p.w / 2 } }));
        runAlong(Math.max(0, p.x + p.w / 2 - 250), 320);
      }
    }
    // the whole pair, fast (and the merge, clean on the word)
    if (times[ws.length] != null && live()) {
      if (mergeInto) {
        await at(Math.max(times[ws.length - 1] + 0.3, times[ws.length] - 0.85));
        if (live()) {
          patch((v) => ({ rail: v.rail && { ...v.rail, light: null } }));
          await merge(ws, mergeInto, { quick: true, saying: said, hold: 300 }, live);
        }
      } else {
        await at(times[ws.length]);
        if (live()) {
          setCards((cs) => cs.map((x) => ({ ...x, lit: ws.includes(x.w) })));
          patch((v) => ({ rail: v.rail && { ...v.rail, light: null } }));
        }
      }
    }
    await said;
    if (!live()) return;
    setCards((cs) => cs.map((x) => ({ ...x, lit: false })));
    patch((v) => ({ rail: v.rail && { ...v.rail, light: null } }));
  };
  /**
   * The pictures bump together and merge into one (fish + dog → the fish-dog): the payoff of the lesson, so it is seen.
   * The sparkle bursts from all round the new picture and the ninja's gift of stars settles round it, not on it, both
   * gone within 0.4 s; then, on the clean picture, Sensei says the new word (`line`, "Fish dog!") while it bounces with
   * joy, and it holds, clean, for 1.5 s before the next beat (the beats' `secs` in warmups.ts count this).
   */
  const merge = async (ws: string[], into: string, o: { quick?: boolean; line?: string; also?: string; hold?: number; saying?: Promise<unknown>; keep?: boolean } = {}, live: Live = isAlive) => {
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
    if (o.line) await say(lines([o.line, ...(o.also ? [o.also] : [])], 300));
    // (a line already under way says the new word as the picture comes clean: it finishes first)
    if (o.saying) await o.saying;
    if (!live()) return;
    await sleep(o.hold ?? 1500);
    // (`keep`: the bounce plays out; the picture leaves with what comes next)
    if (!o.keep) setCard(into, { fx: "" });
  };
  const tierHeld = () => crossesTier();
  /** "This is how we write /s/": the ninja's spell drifts onto sound line `i` under a card, and the spelling appears. */
  const castOn = (w: string, i: number, show: () => void): Promise<void> => {
    const line = document.querySelectorAll(`.wu-slot[data-w="${w}"] .wu-lines .sound-line`)[i];
    if (!line) {
      show();
      return Promise.resolve();
    }
    return Promise.race([launch("cast", null, stageXY(line), { land: "chime" }), sleep(1500)]).then(show);
  };
  const spelt = useRef(new Set<string>());

  // ---------------------------------------------------------------- the director
  useEffect(() => {
    alive.current = true;
    const wanted = new Set<string>(["tv_ready_first", "tv_ready_paw", "tv_ready_go", "tv_show_again", "tv_ready_now", "tv_fix_together", "tv_idle_point", "fm_its_this", "fm_last_one", "nav_ready", "fm_which_pic"]);
    for (const b of script.beats) {
      const g = gameOf(b);
      if (g) for (const id of [...GAMES[g].full.frame, ...GAMES[g].full.demo, GAMES[g].full.ready ?? "", ...GAMES[g].recap.line, ...GAMES[g].short]) if (id && !id.includes("<")) wanted.add(id);
      if (b.kind === "done") b.lines.forEach((id) => wanted.add(id));
    }
    preload([...[...wanted].filter(hasLine).map(urls.line), ...script.stickers.map(urls.word)]);
    (async () => {
      await sleep(350);
      const lead = warmupLead.line;
      warmupLead.line = null;
      if (lead) await say({ line: lead });
      t0.current = performance.now() * FAST;
      p0.current = lessonPausedMs();
      // for the treadmill: when each beat started (lesson seconds), and which the governor skipped
      const log: { i: number; kind: string; game?: string | null; form?: FrameForm; at: number; skipped?: string }[] = ((window as any).__snBeats = []);
      for (let i = 0; i < script.beats.length && alive.current; i++) {
        const b = script.beats[i];
        const last = b.kind === "done";
        // at the hard cap the beat under way is finished by the paw, then the lesson closes: after the cap, a new beat
        // only starts if it can still finish (with the paw's help and the closing line) by the cap
        const doneS = script.beats.find((x) => x.kind === "done")?.secs ?? 4;
        const capSkip = capped.current && (!!b.optional || elapsedS() + b.secs + doneS > script.capS);
        if (!last && (capSkip || skipOptional(script.beats, i, elapsedS(), script.targetS))) {
          log.push({ i, kind: b.kind, at: Math.round(elapsedS() * 10) / 10, skipped: capSkip ? "cap" : "behind" });
          if (!capSkip) bead(beadsIn(b));
          // (the swap's show goes, its held step stays: the child's tap between two games)
          if (b.kind === "swap" && !capSkip && script.beats[i + 1] && script.beats[i + 1].kind !== "done") {
            beatNow.current = b;
            setBeatKind(b.kind);
            gameRef.current = null;
            setGame(null);
            lastShow.current = null;
            await nextGameHold(null);
          }
          continue;
        }
        skipDemoNow.current = skipDemo(script.beats, i, elapsedS(), script.targetS);
        const at = Math.round(elapsedS() * 10) / 10;
        // a new game: its own Hear it again and Show me again
        clearTold();
        lastShow.current = null;
        offered.current = false;
        capTried.current = false;
        patch({ point: null, showPulse: false });
        beatNow.current = b;
        beatIdx.current = i;
        setBeatKind(b.kind);
        await (run[b.kind] as (b: Beat) => Promise<void>)(b);
        const g = gameOf(b);
        log.push({ i, kind: b.kind, game: g, form: g ? formRef.current : undefined, at, ...(skipDemoNow.current && b.kind === "which" && formRef.current === "recap" ? { skipped: "demo" } : {}) });
      }
      if (!alive.current) return;
      patch({ speaker: false });
      store.set((s) => void ((s.warmups ??= {})[level.id] = { first: score.current.first, total: score.current.total }));
      (window as any).__snWarmup = { key: script.key, version: script.version, secs: Math.round(elapsedS()), score: score.current, closedByPaw: closedByPaw.current, skipped: log.filter((x) => x.skipped).map((x) => `${x.kind} (${x.skipped})`) };
      // the closing line goes to the reward, which says it first (docs/NAVIGATION.md rule 7): no hold here
      const closing = script.beats.find((x) => x.kind === "done");
      if (alive.current) onDone(1, closing?.kind === "done" && closing.lines[0] ? { closing: closing.lines[0] } : undefined);
    })();
    return () => {
      alive.current = false;
      showTok.current++;
      ninja.setSlowmo(1);
      hush();
    };
  }, []);

  // ---- Help (TEACHER_SCRIPT §5.5): once → the rephrase; twice → the answer glows ("Look for the glow."); three times →
  // the paw points at it and waits (it never answers for the child: docs/NAVIGATION.md rule 5). While Sensei shows
  // something, what she has said in this game.
  useHelp(
    (n) => {
      const p = pending.current;
      if (!p || p.done) {
        if (bundle.current.length) void say(bundle.current);
        return;
      }
      if (n === 1) void rephrase(p);
      else if (n === 2) {
        glow(p.answers());
        void say(lineOr("tv_look_glow", p.prompt));
      } else {
        glow(p.answers());
        p.struggle = true;
        if (!p.busy) pointAt(p);
        void say(lineOr("tv_idle_point", p.prompt));
      }
    },
    [askN],
  );

  // ---- for bots (scripts/treadmill/bot.ts). During Show me again the turn is still the child's (busy): `next` stays.
  // During a hold the scene is busy and has no question (the Ready is the nav layer's: __snNav.ready).
  const p = pending.current;
  const sh = !!showing.current;
  const bn = beatNow.current;
  (window as any).__snState = {
    scene: "warmup", key: script.key, beat: beatKind, game, how: bn?.kind === "tapall" ? bn.how : undefined,
    next: !holding && p && !p.done && p.armed !== false && (!p.busy || sh) ? p.answers()[0] ?? null : null,
    asked: !!p?.asked, busy: holding || !p || p.busy, capped: capped.current,
  };
  // the child's turn is waiting: Hear it again and Show me again are live (dim while Sensei is still talking)
  const turn = !!p && !p.done && !p.busy && !!p.asked && !sh;
  const heroLive = !!p && !p.done && !!view.hero && p.answers().includes(`petal ${view.hero.p}`);

  // ---------------------------------------------------------------- render
  const v = view;
  return (
    <Frame level={level} className="wu" top={<LessonBeads n={nBeads} lit={v.lit} burst={v.burst} />}>
      {v.rail && <Rail arrow={v.rail.arrow} light={v.rail.light} />}
      {/* (while a new sound's petal arrives over the pictures, they step back behind the dusk: not tappable) */}
      <div className={`wu-cards pick-row ${v.spot ? "has-spot" : ""} ${v.scrim && v.hero ? "veiled" : ""}`} aria-hidden={(v.scrim && !!v.hero) || undefined}>
        {v.cards.map((c) => (
          <CardSlot key={c.key ?? c.w} c={c} spot={v.spot === c.w} onTap={(t) => void tap(c.w, t)} />
        ))}
      </div>
      {v.ribbon && <Ribbon r={v.ribbon} />}
      {v.speed && <SpeedButtons s={v.speed} onTap={(id, t) => void tap(id, t)} />}
      {v.pockets && <Pockets n={v.pockets.n} filled={v.pockets.filled} glow={!!v.pockets.glow} />}
      {v.rails && <StackedRails rails={v.rails} spot={v.spot} onTap={(id, t) => void tap(id, t)} />}
      {v.dots && <Dots d={v.dots} onTap={(id, t) => void tap(id, t)} />}
      {v.sdots && (
        <div className="wu-sdots" style={{ transform: `translate(${v.sdots.x}px, ${v.sdots.y}px) translateX(-50%)` }}>
          <SoundDots key={v.sdots.bloom ? `${v.sdots.key}-bloom` : v.sdots.key} n={v.sdots.n} lit={v.sdots.lit} bloom={v.sdots.bloom ?? undefined} size={44} gap={30} />
        </div>
      )}
      <div className={`wu-veil ${v.scrim && v.hero ? "on" : ""}`} style={{ "--x": `${HERO_AT.grid.x}px`, "--y": `${HERO_AT.grid.y}px` } as CSSProperties} aria-hidden="true" />
      {v.hero && (
        <div ref={heroRef} className="wu-hero" style={{ left: v.hero.x - TIER_WIDTH.hero / 2, top: v.hero.y - badgeHeight(TIER_WIDTH.hero) / 2 }}>
          <SoundBadge key={v.hero.key} p={v.hero.p} tier="hero" intro={v.hero.intro} wait={v.hero.wait} busy={!heroLive} label={`petal ${v.hero.p}`} onTap={() => void tap(`petal ${v.hero!.p}`, heroRef.current)} />
        </div>
      )}
      {v.paw && <TapHint show style={{ left: 0, top: 0, translate: `${v.paw.x}px ${v.paw.y}px`, zIndex: 60 }} />}
      {v.point && !v.paw && <TapHint show style={{ left: 0, top: 0, translate: `${v.point.x}px ${v.point.y}px`, zIndex: 60 }} />}
      <WuNav ready={turn} again={v.speaker ? again : null} show={lastShow.current ? showAgain : null} sound={v.hero ? null : v.sound} hidden={holding || !v.speaker} pulse={v.showPulse} />
    </Frame>
  );
}
export const EarsLevel = WarmupLevel;
/** A line to open the next warm-up with (the first check's "Let's do some warm-up training first!"). */
export const warmupLead: { line: string | null } = { line: null };
export const PicReadLevel = WarmupLevel;

/** Seconds from the paw answering an asked question to the end of its beat (the move, the beat's last line); a Pocket
 *  Hunt takes longer (the paw finds what is left, then "You found them both!"). */
const END_S = 7;
const TAPALL_END_S = 10;
const TAPALL_SPELL_END_S = 15;
/** Sounds~Write's "If you say the sounds, you can hear the word." (W5's close; W6's first word). */
const IF_SAY = "t_if_you_say_sounds";
/** Pictures Sensei has named in this session (a card is named once, the first time it appears, across lessons). */
const namedThisSession = new Set<string>();

/** A stable shuffle (the same child sees the same order on a replay of the same item). */
function shuffleStable(a: string[], seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return [...a].sort((x, y) => ((x.charCodeAt(0) * 7 + h) % 5) - ((y.charCodeAt(0) * 7 + h) % 5));
}
/** Keep cards already on screen where they are when a beat reuses them; bring the others in as a row. */
function layoutRow(cs: CardView[], ws: string[]): CardView[] {
  const target = row(ws);
  return [...cs.filter((c) => !ws.includes(c.w)).map((c) => ({ ...c, out: true })), ...target.map((t) => ({ ...cs.find((c) => c.w === t.w && !c.out), ...t, state: "" as CardState, fx: "" as const, step: 0, key: cs.find((c) => c.w === t.w && !c.out)?.key ?? `${t.w}-row` }))];
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
/** A picture on its slot. It glides on `translate` (the compositor's), and a change of size plays as a scale from the
 *  old size to the new, so nothing is laid out again frame by frame (docs/PERF.md). */
function CardSlot({ c, spot, onTap }: { c: CardView; spot: boolean; onTap: (el: HTMLElement) => void }) {
  const gutter = c.gutter ?? G;
  const el = c.size + 2 * gutter;
  const state: CardState = spot ? "spot" : c.state ?? "";
  const ref = useRef<HTMLDivElement>(null);
  const was = useRef(el);
  useLayoutEffect(() => {
    const from = was.current;
    was.current = el;
    if (from === el || !ref.current || typeof ref.current.animate !== "function") return;
    ref.current.animate([{ transform: `scale(${from / el})` }, { transform: "scale(1)" }], { duration: 480, easing: "cubic-bezier(0.3, 1.2, 0.5, 1)" });
  }, [el]);
  return (
    <div
      ref={ref}
      className={`wu-slot ${c.out ? "out" : ""} ${c.moving ? "moving" : ""} ${c.fx ? `fx-${c.fx}` : ""} ${c.lit ? "lit" : ""}`}
      data-w={c.w}
      aria-hidden={c.out || c.moving || undefined}
      style={{ translate: `${c.x - el / 2}px ${c.y - el / 2}px`, width: el, height: el, "--g": `${gutter}px`, "--step": c.fx === "step" ? 1 + 0.07 * (c.step ?? 0) : 1 } as CSSProperties}
    >
      <PicCard w={c.w} size={c.size} gutter={gutter} state={state} onTap={onTap} />
      {c.dots && (
        <div className="wu-cdots" aria-hidden="true">
          {Array.from({ length: c.dots.n }, (_, i) => <span key={i} className={c.dots!.gold.includes(i) ? "gold" : ""} />)}
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

/** The tortoise (slow) and the rabbit (fast): either side of the big card, or in the right-hand column. They glide
 *  between the two on transform; the live rabbit (Move 1) grows to a full tap target. */
function SpeedButtons({ s, onTap }: { s: SpeedView; onTap: (id: string, el: HTMLElement) => void }) {
  const at = SPEED_AT[s.at];
  return (
    <>
      {(["tortoise", "rabbit"] as const).map((id) => {
        const live = id === "rabbit" && !!s.big;
        const k = at.k * (live ? 1.25 : 1);
        const hidden = s.hide?.includes(id);
        const pos = live && s.at === "side" ? SPEED_LIVE : at[id];
        return (
          <button
            key={id}
            aria-label={id}
            aria-hidden={s.moving || undefined}
            // (the live rabbit is Move 1's join-in: marked as the fast badge, so the checks can measure its size)
            {...(live ? { "data-speed": "fast", "data-live": "true" } : {})}
            className={`wu-speed ${id} ${s[id]} ${hidden ? "hid" : ""} ${live ? "live" : ""} ${s.moving ? "moving" : ""} ${s.jump ? "jump" : ""}`}
            // (placed by `translate`, sized by `transform`: the pulse's `scale` and a wiggle's `rotate` then turn about the
            // button's own centre, never about the stage's corner)
            style={{ width: SPEED_D, height: SPEED_D, translate: `${pos.x - SPEED_D / 2}px ${pos.y - SPEED_D / 2}px`, transform: `scale(${k})` }}
            {...tapProps<HTMLButtonElement>((el) => onTap(id, el))}
          >
            <img src={img(id === "tortoise" ? "ui_tortoise" : "ui_rabbit")} alt="" draggable={false} />
          </button>
        );
      })}
    </>
  );
}

/** The sound ribbon under the rabbit and the tortoise's card: it zips across (fast), or fills a step on each sound of the
 *  slow way with a dot popping on (transform only). */
function Ribbon({ r }: { r: NonNullable<View["ribbon"]> }) {
  const fill = r.mode === "step" ? r.shown / Math.max(1, r.dots) : 0;
  return (
    <div className={`wu-ribbon ${r.mode}`} style={{ left: STAGE.x - 150, top: STAGE.y + 180 }} aria-hidden="true">
      <span className="wu-ribbon-fill" style={r.mode === "step" ? { transform: `scaleX(${fill})` } : undefined} />
      <span className="wu-ribbon-dots">
        {Array.from({ length: r.dots }, (_, i) => <span key={i} className={`wu-dot ${i < r.shown ? "on" : ""} ${r.pulse === i ? "pulse" : ""}`} />)}
      </span>
    </div>
  );
}

/** Pockets beside the Pocket Hunt grid: they show how many to find, and fill with a mini-card per find. */
function Pockets({ n, filled, glow }: { n: number; filled: string[]; glow: boolean }) {
  const top = 306 - (n * 104 - 14) / 2;
  return (
    <div className={`wu-pockets ${glow ? "glow" : ""}`} style={{ top }} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`wu-pocket ${filled[i] ? "full" : ""}`}>{filled[i] && <img src={img(`pic_${filled[i]}`)} alt="" />}</span>
      ))}
    </div>
  );
}

/** The brush-stroke arrow that points the ninja way (the rail's, and Sound Dots'). An SVG, so any movement is its
 *  wrapper's. */
function BrushArrow({ className = "" }: { className?: string }) {
  return (
    <span className={`wu-arrow ${className}`}>
      <svg viewBox="0 0 120 60">
        <path d="M6 34 C30 26 62 26 92 30" fill="none" stroke="#2b1d14" strokeWidth="16" strokeLinecap="round" />
        <path d="M6 34 C30 26 62 26 92 30" fill="none" stroke="#ffc53d" strokeWidth="9" strokeLinecap="round" />
        <path d="M84 12 L114 30 L84 48 Z" fill="#ffc53d" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** The bamboo reading rail, with a brush-stroke arrow at its left end pointing right, and a light passing along it. */
function Rail({ arrow, light }: { arrow: string; light: number | null }) {
  return (
    <div className="wu-rail" style={{ top: RAIL_Y - 14 }} aria-hidden="true">
      <span className="wu-rail-bar" />
      <BrushArrow className={`wu-rail-arrow ${arrow}`} />
      {light != null && <span className="wu-rail-light" style={{ transform: `translateX(${light - 360}px)` }} />}
    </div>
  );
}

/** Two rows: two short rails, one above the other; the child taps a whole row. */
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

/** Sound dots under a picture (W6), tapped left to right like sound buttons, with the ninja's arrow at the left end.
 *  A dot that has sounded is its sound's mini petal, for this word (SOUND_DISPLAY r5, A4). */
function Dots({ d, onTap }: { d: NonNullable<View["dots"]>; onTap: (id: string, el: HTMLElement) => void }) {
  return (
    <div className={`wu-dotrow ${d.sweep ? "sweep" : ""} ${d.pulse === -2 ? "together" : ""}`} style={{ left: d.x, width: d.ps.length * d.pitch }}>
      <span className="wu-dotrow-line" />
      <span className="wu-dotrow-fill" />
      <BrushArrow className={`wu-dotrow-arrow ${d.arrow ? "glow" : ""}`} />
      {d.ps.map((p, i) => (
        <button key={i} aria-label={`dot ${i}`} className={`wu-bigdot ${i < d.tapped ? "on" : ""} ${d.lit === i ? "lit" : ""} ${d.wrong === i ? "wrong" : ""} ${d.pulse === i ? "pulse" : ""}`} {...tapProps<HTMLButtonElement>((el) => onTap(`dot ${i}`, el))}>
          {i < d.tapped && <SoundBadge p={p} tier="mini" passive className="wu-dotpetal" />}
        </button>
      ))}
    </div>
  );
}

/** Hear it again and the sound's petal in the nav row's slots, and Show me again (the paw) in the nav layer's (the
 *  warm-ups' own TurnNav: the paw can pulse, and the nav layer's small tortoise and rabbit hide, since the scene has its
 *  own big ones). The speaker stays put and goes dim while Sensei is still talking: a tap on it then wiggles. */
function WuNav({ ready, again, show, sound, hidden, pulse }: { ready: boolean; again: (() => Promise<unknown>) | null; show: (() => Promise<unknown>) | null; sound: PhonemeId | null; hidden: boolean; pulse: boolean }) {
  const [wig, setWig] = useState(false);
  useEffect(() => {
    if (!wig) return;
    const t = setTimeout(() => setWig(false), 420);
    return () => clearTimeout(t);
  }, [wig]);
  const onAgain = () => (ready && again ? again() : (setWig(true), Promise.resolve()));
  useNav({ again: again ? onAgain : null, againAt: "own", sound: sound ?? null, show: ready && show ? show : null, showPulse: pulse, speed: { own: true } });
  const held = useHeld(); // (a hold's own sound picture takes the row's slot meanwhile)
  if (hidden) return null;
  const S = NAV_SLOTS.row;
  return (
    <>
      {again && <ReplayButton size={S.again.d} className={`nav-ctl navc-ctl ${ready ? "" : "navc-dim"} ${wig ? "navc-wiggle" : ""}`} style={slotStyle(S.again)} onReplay={onAgain} />}
      {sound && !held && <SoundBadge key={sound} p={sound} size={S.sound.d} className="nav-ctl pop-in wu-navsound" style={slotStyle(S.sound, S.sound.d, badgeHeight(S.sound.d))} onTap={ready ? undefined : () => sfx.tap()} />}
    </>
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
