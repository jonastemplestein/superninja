// Sound Swap: Baron Muddle has muddled the words. Change ONE sound to make the next word (mat → sat → sit …).
// Tap the sound that must change: the ninja kicks it out of the word, the picture goes wobbly, and the new spellings
// pop up. Choose the new one: a spell carries it in under the word and it shoots up into the gap, the picture turns into
// the new word, and a star bonks Baron. At the end he runs away. Trains phoneme manipulation. Layout: docs/HERO.md
// (ninja bottom-left, Sensei bottom-right; the word, its picture and the choices sit in the middle, Baron top-right).
//
// The teacher's voice (docs/TEACHER_SCRIPT.md §3.20, §4.1, §5; FIX_PLAN §9 D3 and TV-D3.1):
// - The first meeting (the `full` form): "Oh dear. Baron Muddle has been muddling up words." (nothing tappable) · the
//   child reads the start word first, tapping each tile as a sound button (Sounds~Write: read the word before the
//   swapping begins) · the rabbit reads it fast (Move 1, TEACHER_SCRIPT §9.3, once a session) · "In Sound Swap, we change
//   just one sound, to make a new word." · a Ready hold before the demo ("I'll show you first. Are you ready to
//   watch?") · Sensei's swap, narrated in the first person, with the child's kick in the middle ("I'll change it to…
//   sat" · the slow pair · "The first sound changes. Can you tap it, and kick it out?" · /m/ · "And in goes… /s/", the
//   paw taps the new spelling) · the Ready hold after it ("Now you swap one. Do you want to have a go?"; the paw replays
//   the demo with no join-in: the kick line goes and the paw kicks) · the child's turns.
// - A later day (`recap`): "It's Sound Swap again…" · the read · the demo again · (a Ready only after 21 days or a
//   struggle) · the turns. A known game (`short`): "It's Sound Swap again…" · the read · "If you'd like to see me do one
//   first, tap my paw." · the turns.
// - Each turn: "Now let's change it to… sit" · "Listen to them both… [sat, slowly] [sit, slowly]" · "What do we need to
//   change?", the tiles waking as it starts (from the child's third step, after two first tries in a row, only "Now
//   let's change it to… sit" while it is fresh, else the word alone, the tiles waking as it ends; the slow pair and the
//   question come back after a miss: SF C11) · the right tile: "Yes, the middle sound changes!" (protected: no tap cuts
//   it; in a faded step the kick alone says "yes", bar one place line every 30 s or so) · "Now tap the new one." (the
//   choices wake as it starts; it fades with the question) · /s/ /i/ /t/ sit. A turn can come every 10 s, and no line
//   may be said more than twice in a minute (SCRIPT_STYLE §5), so the full question rotates between whole sentences and
//   a place line said twice in the minute rests (see questionOf). A game is at most 8 swaps (MAX_TURNS: a longer fixed
//   chain is cut to its best path). Verify round 2 found w1-12's 13 swaps on one cycle long and samey.
// - The demo on w1-8 is the chain's own first step (mat → sat); elsewhere it is the chain's first step when that changes
//   the first sound (the kick line says "The first sound changes."), else the canonical mat → sat on its own board.
//
// Sounds (docs/SOUND_DISPLAY.md rows 34–37): the tiles' voices and blends are "tile"; "That's… /h/ That sound stays
// the same." pops /h/ above the tapped letter; the demo's /m/ and /s/ pop above the gap; Help 3 in the pick ("Let me
// show you… /o/") pops above the gap; a wrong spelling's correction goes through correctionFor with its anchors (the
// two-letter correction for a split, SF C5); the read-back reminder pops its petal above the lit tile (Dec4). Nothing
// names the new sound while the child picks it (SD A8).
// Streak (Dec2): the two first-try taps of a step are `part` hits; the fixed word is the whole answer (streak.answer()),
// counted once the child has heard it blended, so a tier-up's shout comes after the word. The scene stays quiet while the
// ninja says a streak line (streakLineSaid).
// Nothing ever covers the new letter or the new picture: their sparkles burst out from BEHIND them (Halo).
// Navigation (docs/NAVIGATION.md §5.D): Home is the nav layer's. "Hear the target word" beside the card (or the card
// itself for a word with no picture) is the screen's Hear it again: the read's instruction, the kick's, the turn's
// question, or the pick's; the paw (Show me again) replays the demo in the change half of a turn. The tortoise and the
// rabbit sit beside it (NavSpec.speed): the tortoise lights on every slow word and read-back's sounds, the rabbit on the
// fast word after it.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import type { PhonemeId, Word } from "../content/phonics";
import { knownSpellings, worldOf, type Level } from "../content/worlds";
import { LINES } from "../content/lines";
import { say, sayBlend, sfx, playMusic, preload, urls, hush, onCaption, onClip, onSpeaking, isSpeaking, nextClip, clipId, type Say, type SoundAt } from "../engine/audio";
import { FAST } from "../engine/fast";
import { swapChain, shuffle } from "../engine/learner";
import { WORD_BY_TEXT, GRAPHEMES } from "../content/phonics";
import { SLOW_TIMES } from "../content/stretch";
import { recordRead, recordSpell, store } from "../engine/store";
import { streak, tierLineEarned, TIER_AT, FIRST_STREAK, type StreakEvent } from "../engine/streak";
import { SenseiDock, Tile, TapHint, img, Progress, fx, stageRect, sleep, useHelp, useBaronOnScreen, isUpright, onUpright } from "../ui/ui";
import { WordCardAgain } from "./Dojo";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { positionName, SWAP_POSITION_LINE, fadeForm, lettersLine, splitsSpelling } from "../content/narrative";
import { levelWrap } from "../content/games";
import type { FrameForm } from "../content/narrative";
import {
  NarrOverlay, beginLevel, correctionFor, revealsNow, lettersReminder, twoSoundsReminder, afterWordSay, gameForm, readyAsk, framed, played, struggledIn,
  fsReadback, fsIdea, fsSaid, sweepUnder,
} from "./narrate";
import { useLessonClock } from "../engine/lessonClock";
import { useNav, ReplayButton, TopBar, holdReady, readyTap, readyHeld, navLog, navSpeed, rabbitTap, type SpeedSpec } from "../ui/nav";
import "../styles/swap.css";

type Step = { from: Word; to: Word; pos: number };
/** What the child can do now: nothing (Sensei is talking, or a demo plays), read the start word, kick out the demo's old
 *  sound, pick the sound that changes, or pick the new spelling. */
type Phase = "wait" | "read" | "kick" | "change" | "pick";

const HAS = new Set(LINES.map((l) => l.id));
/** A line, or its older stand-in while the new one isn't recorded (every caller guards: the words ship before the audio). */
const L = (id: string, old?: string): Say[] => (HAS.has(id) ? [{ line: id }] : old && HAS.has(old) ? [{ line: old }] : []);
const TEXT = new Map(LINES.map((l) => [l.id, l.text]));
/** The place of the sound that changes (SF C11.3): "Yes, the first sound changes!" (the older audit_swap_* stand in). */
const ST_PLACE = { first: "st_first_changes", middle: "st_middle_changes", last: "st_last_changes" } as const;
/** The turn's question, in rotation (SCRIPT_STYLE §5: a line at most twice in a minute; a turn can come every 10 s):
 *  "What do we need to change?", "Which sound changes?", "Which sound needs to change?". */
const ASKS = ["st_what_change", "tv_which_changes", "swap_which"] as const;

function fixedChain(ws: string[]): Step[] {
  const w = ws.map((t) => WORD_BY_TEXT[t]);
  // only single-sound swaps (same number of sounds); a length change starts a new mini-chain
  return w
    .slice(1)
    .map((to, i) => ({ from: w[i], to, pos: to.segs.findIndex((s, k) => s.g !== w[i].segs[k]?.g) }))
    .filter((c) => c.from.segs.length === c.to.segs.length && c.pos >= 0);
}
/** A Sound Swap is at most this many of the child's swaps (a minute and a half or so). w1-12's chain has 13: 2.5 minutes
 *  on one cycle, long and samey for a three-year-old (verify round 2). */
const MAX_TURNS = 8;
/** The place of the one sound that differs between two words of one length, or -1. */
const swapPos = (a: Word, b: Word) => {
  if (a.segs.length !== b.segs.length || a.text === b.text) return -1;
  const d = a.segs.flatMap((s, k) => (s.g !== b.segs[k].g || s.p !== b.segs[k].p ? [k] : []));
  return d.length === 1 ? d[0] : -1;
};
/** A fixed chain of more than MAX_TURNS swaps, cut down to its best path: the chain's own words, in order, from its start
 *  word (TEACHER_SCRIPT §3.22: w1-12 opens on sat), each one sound away from the one before. Chosen by, in order: the
 *  most sounds met (nothing the level practises is lost if it can be helped), the most swaps, the place changing from
 *  step to step, the most pictures (the card turning into the new word is the payoff), the fewest words skipped. w1-12:
 *  sat → sit → pit → pin → pan → man → map → mop → top (all eight sounds, the place different every step). A short
 *  chain comes back as it is. (A few dozen paths, under a millisecond, once.) */
function trimChain(ws: string[]): string[] {
  const w = ws.map((t) => WORD_BY_TEXT[t]).filter(Boolean);
  const swaps = w.slice(1).filter((b, i) => swapPos(w[i], b) >= 0).length;
  if (swaps <= MAX_TURNS || w.length > 24) return ws;
  const score = (path: number[]) => {
    const sounds = new Set(path.flatMap((i) => w[i].segs.map((s) => s.p))).size;
    const pos = path.slice(1).map((i, k) => swapPos(w[path[k]], w[i]));
    const varied = pos.filter((p, k) => k === 0 || p !== pos[k - 1]).length;
    const pics = path.filter((i) => w[i].pic).length;
    return sounds * 1e4 + (path.length - 1) * 500 + varied * 30 + pics * 3 - (path[path.length - 1] - (path.length - 1));
  };
  let best = [0], top = -Infinity;
  const walk = (path: number[]) => {
    const sc = score(path);
    if (sc > top) [top, best] = [sc, [...path]];
    if (path.length > MAX_TURNS) return;
    const last = path[path.length - 1];
    for (let j = last + 1; j < w.length; j++) {
      if (swapPos(w[last], w[j]) < 0) continue;
      path.push(j);
      walk(path);
      path.pop();
    }
  };
  walk([0]);
  return best.map((i) => w[i].text);
}
/** A random chain: the best of 16 by how many of its words have a picture (the picture turning into the new word is the
 *  scene's payoff; a word without one is a speaker card) and how many are the level's own words (so the pull towards
 *  pictured words never drifts it back to easier units). A full-length chain always wins first. Takes ~2-15 ms, once. */
function pictureChain(level: Level) {
  const score = (c: ReturnType<typeof swapChain>) =>
    c.length && c.length * 100 + [c[0].from, ...c.map((x) => x.to)].reduce((n, w) => n + (w.pic ? 1 : 0) + (level.units.includes(w.unit) ? 1 : 0), 0);
  let best = swapChain(level, 5), top = score(best);
  for (let k = 1; k < 16; k++) {
    const c = swapChain(level, 5), sc = score(c);
    if (sc > top) {
      best = c;
      top = sc;
    }
  }
  return best;
}
/** The paw's canonical demos (TEACHER_SCRIPT §4.1: "mat to sat, with the kick"). A first-sound swap, since the kick line
 *  says "The first sound changes."; the first one that isn't the child's own turn (a short form's paw never answers). */
const CANON: readonly [string, string][] = [["mat", "sat"], ["pin", "tin"], ["hat", "cat"]];
function canonFor(avoid?: Step): Step {
  for (const [a, b] of CANON) {
    const from = WORD_BY_TEXT[a], to = WORD_BY_TEXT[b];
    if (from && to && !(avoid && (avoid.from.text === a || avoid.to.text === b))) return { from, to, pos: 0 };
  }
  return { from: WORD_BY_TEXT.mat, to: WORD_BY_TEXT.sat, pos: 0 };
}

// The ninja's moves. Knocking the old spelling out is a kick or a strike (the first one of a level is the signature
// spin kick); bonking Baron after a word is fixed arcs high over the word (shuriken, spells, stars), so it never
// looks like the word is being hit again. Both grow with the streak tier.
const KNOCK: Move[][] = [
  ["spin", "kick", "punch"],
  ["spin", "kick", "punch", "jump"],
  ["kick", "spin", "flip"],
  ["flip", "kick", "spin"],
];
const BONK: Move[][] = [["throw", "cast"], ["throw", "jump", "cast"], ["cast", "throw", "jump"], ["cast", "flip", "throw"]];
function pickMove(pool: Move[], last: { current: Move | null }) {
  const opts = pool.filter((m) => m !== last.current);
  const m = opts[(Math.random() * opts.length) | 0] ?? pool[0];
  last.current = m;
  return m;
}
/** How long the new spelling takes to shoot up from under the word into its gap (see swap-rise in swap.css). */
const RISE_MS = 190;
/** ...and until it has settled (the squash and stretch of swap-rise is done), when the word is blended: the child sees
 *  the new letter, still and uncovered, as its sound is said. The card turning and the sparkles fill this beat. */
const SETTLE_MS = RISE_MS + 260;
/** A little four-pointed star (viewBox -50 -50 100 100), like the fx twinkles. */
const STAR4 = "M0-48 L11-11 L48 0 L11 11 L0 48 L-11 11 L-48 0 L-11-11Z";
const HALO_COLS = ["#fff4dc", "#ffe38a", "#ffc53d", "#ff9ec0"];
/** A burst of stars and a shockwave from BEHIND something (the new letter, the new picture): it sits under it in the
 *  stacking order, so the stars only show around its edges and never cover what the child needs to see. `rx`/`up`/`down`
 *  are how far the stars fly (px from the centre, sideways / up / down); `ring` is the shockwave's starting shape (half
 *  width, half height, corner radius: the thing's own outline, so it starts hidden behind it); `delay` is when (ms). */
function Halo({ n = 12, rx, up, down, ring, delay = 0, className = "" }: { n?: number; rx: number; up: number; down: number; ring: [number, number, number]; delay?: number; className?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const a = ((i + Math.random() * 0.6) / n) * Math.PI * 2;
        const k = 0.78 + Math.random() * 0.34;
        const sy = Math.sin(a);
        return { x: Math.cos(a) * rx * k, y: sy * (sy < 0 ? up : down) * k, s: 26 + Math.random() * 20, d: delay + Math.random() * 110, c: HALO_COLS[i % HALO_COLS.length], r: Math.round(Math.random() * 90) };
      }),
    [],
  );
  return (
    <div className={`swap-halo ${className}`} style={{ "--rw": `${ring[0]}px`, "--rh": `${ring[1]}px`, "--rr": `${ring[2]}px`, "--d": `${delay}ms` } as CSSProperties} aria-hidden="true">
      {stars.map((st, i) => (
        <svg key={i} viewBox="-50 -50 100 100" style={{ "--x": `${st.x.toFixed(0)}px`, "--y": `${st.y.toFixed(0)}px`, "--s": `${st.s.toFixed(0)}px`, "--d": `${st.d.toFixed(0)}ms`, "--r": `${st.r}deg` } as CSSProperties}>
          <path d={STAR4} fill={st.c} stroke="#2b1d14" strokeWidth="12" strokeLinejoin="round" paintOrder="stroke" />
        </svg>
      ))}
    </div>
  );
}
/** Word tile size: longer words get smaller tiles, so the word fits between the ninja and the help corner, and its
 *  sound buttons stay above even a three-line caption bubble (y 435). */
const tileSize = (n: number) => (n <= 3 ? 132 : n === 4 ? 120 : 104);
// the picture card (stage px); the word, the card and the choices share one centre line (x 640, see swap.css)
const CARD = { left: 515, top: 84, width: 250, height: 172 };
/** Baron's muddle magic over the picture: an Archimedean spiral (viewBox 0 0 200 200). */
const SPIRAL = (() => {
  let d = "";
  for (let t = 0; t <= Math.PI * 6; t += 0.18) {
    const r = 3 + t * 4.9;
    d += `${d ? " L" : "M"}${(100 + r * Math.cos(t)).toFixed(1)} ${(100 + r * Math.sin(t)).toFixed(1)}`;
  }
  return d;
})();
/** The muddle's swirl. It spins on its HTML wrapper, which the compositor turns (an animation on the SVG itself would be
 *  repainted on the main thread every frame); the SVG and its glow stay still (D3.6). */
function Swirl({ className = "" }: { className?: string }) {
  return (
    <i className={`swap-spin ${className}`}>
      <svg viewBox="0 0 200 200">
        <path d={SPIRAL} fill="none" stroke="#2b1d14" strokeWidth="15" strokeLinecap="round" opacity="0.45" />
        <path d={SPIRAL} fill="none" stroke="#b48cff" strokeWidth="9" strokeLinecap="round" />
        <path d={SPIRAL} fill="none" stroke="#efe0ff" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 16" />
      </svg>
    </i>
  );
}
const VOWELS = ["a", "e", "i", "o", "u", "ai", "ay", "ee", "ea", "igh", "ie", "oa", "ow"];

/** The line the ninja says for a streak event (streak.ts's own rule, without asking it: tierLineId() also records a grant
 *  for the checks, and the ninja asks it once already). */
function streakLineOf(e: StreakEvent): string | null {
  if (e.tierUp) {
    if (!tierLineEarned(e.tier)) return null;
    const id = e.tier === 1 && !store.get().seenStreak && HAS.has(FIRST_STREAK) ? FIRST_STREAK : e.tier === 3 && HAS.has("tv_streak_10") ? "tv_streak_10" : `streak_${TIER_AT[e.tier]}`;
    return HAS.has(id) ? id : null;
  }
  return e.type === "miss" && e.line && e.prevN >= 3 && HAS.has("streak_lost") ? "streak_lost" : null;
}
/** The ninja says the streak lines itself ("Ninja power!" on a tier-up, "Keep going, ninja." when a streak of 3 or more
 *  is lost; src/ui/Ninja.tsx), at the first quiet moment (280 ms) within a few seconds of the hit or miss. Any say() of
 *  ours in that window would cut it off. So, straight after such a hit or miss, the scene goes quiet and waits for the
 *  line to be said (or to clearly not be coming), and only then speaks again. Call it at the moment of the hit or miss:
 *  it has to be listening before the line starts. Resolves true if the line was said. */
function streakLineSaid(e: StreakEvent | null): Promise<boolean> {
  if (!e) return Promise.resolve(false);
  const id = streakLineOf(e);
  const text = id && ninja.mounted ? TEXT.get(id) : undefined;
  if (!text) return Promise.resolve(false);
  hush(); // the child has acted, so whatever was being said is moot, and the line needs a quiet moment
  const key = text.replace(/\.\.\.$/, "").slice(0, 10);
  const within = e.type === "miss" ? 5000 : 4000; // how long the ninja keeps waiting for quiet
  return new Promise((resolve) => {
    const t0 = performance.now();
    let started = false, quietSince = -1, done = false;
    const finish = () => {
      if (done) return;
      done = true;
      off();
      clearInterval(iv);
      resolve(started);
    };
    const off = onCaption((c) => {
      const mine = !!c && c.text.startsWith(key);
      if (!started && mine) started = true;
      else if (started && !mine) finish(); // said (or cut off by something else)
    });
    const iv = window.setInterval(() => {
      const t = (performance.now() - t0) * FAST; // game ms
      if (started) return void (t > within + 6000 && finish());
      // quiet for far longer than the ninja's 280 ms, or past its window: the line isn't coming
      if (isSpeaking()) quietSince = -1;
      else if (quietSince < 0) quietSince = t;
      else if (t - quietSince > 1000) finish();
      if (t > within + 400) finish();
    }, 50);
  });
}
/** Resolves once the ninja has stopped moving (a tier-up's power-up follows straight on from the kick that earned it),
 *  or after `max` ms. */
function ninjaSettled(max = 2400): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    let still = 0;
    const iv = window.setInterval(() => {
      still = ninja.busy ? 0 : still + 1;
      if (still >= 2 || (performance.now() - t0) * FAST > max) {
        clearInterval(iv);
        resolve();
      }
    }, 50);
  });
}
/** A quiet-time ladder in game time (TEACHER_SCRIPT §5.5): `fire(k)` once steps[k] ms of quiet have passed. Quiet:
 *  nobody speaking, the phone not upright, no tap (a pointerdown starts it again). Waiting costs nothing: the quiet time
 *  is counted from timestamps and one timeout sleeps until the next step (nav.tsx's idle ladder, which isn't exported). */
function quietLadder(steps: readonly number[], fire: (k: number) => void): { stop(): void; reset(): void } {
  let idle = 0, from = 0, k = 0, t = 0, on = true;
  const sync = () => {
    if (!on) return;
    if (from) idle += (performance.now() - from) * FAST;
    from = 0;
    clearTimeout(t);
    while (on && k < steps.length && idle >= steps[k] - 5) fire(k++);
    if (on && k < steps.length && !isUpright() && !isSpeaking()) {
      from = performance.now();
      t = window.setTimeout(sync, steps[k] - idle); // (setTimeout runs in game time)
    }
  };
  const reset = () => {
    if (!on) return;
    idle = from = k = 0;
    sync();
  };
  const offSpeaking = onSpeaking(sync);
  const offUpright = onUpright(sync);
  window.addEventListener("pointerdown", reset, true);
  sync();
  return {
    reset,
    stop() {
      on = false;
      clearTimeout(t);
      offSpeaking();
      offUpright();
      window.removeEventListener("pointerdown", reset, true);
    },
  };
}
/** The tortoise and the rabbit while the paw's replay of the demo plays in a Ready hold. The hold is modal, so it hides
 *  the screen's own pair, but the replay's slow words and its read-back light them just as the demo's did (TEACHER_SCRIPT
 *  §9.6). This mounts after the hold, so its nav entry sits above the hold's; it sets nothing but the pair. */
function SpeedOverHold({ spec }: { spec: SpeedSpec }) {
  useNav({ speed: spec });
  return null;
}

export function Swap({ level, onDone }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render)
  const world = worldOf(level);
  const [chain] = useState(() => (level.chain ? fixedChain(trimChain(level.chain)) : pictureChain(level)));
  /** How this game is introduced today (TEACHER_SCRIPT §2.2): the full form, a recap, or the short line. */
  const [form] = useState<FrameForm>(() => gameForm("swap", { opening: true }));
  /** The demo that leads into the turns: the chain's own first step when it changes the first sound (w1-8: mat → sat),
   *  else the canonical one on its own board. `own`: it is chain[0], so the child's turns start at step 1. */
  const [demo] = useState(() => {
    const c = chain[0];
    const own = form !== "short" && !!c && c.pos === 0;
    return { step: own ? c : canonFor(form === "short" ? c : undefined), own };
  });
  const timeUp = useLessonClock(level);
  /** the child's step in the chain (on w1-8 the demo is step 0, so the child's first is step 1) */
  const [step, setStep] = useState(0);
  /** A demo on its own board (null: the board is the child's step, chain[step]) */
  const [view, setView] = useState<Step | null>(null);
  const [phase, setPhaseS] = useState<Phase>("wait");
  /** the start word's tiles read so far (the read) */
  const [readN, setReadN] = useState(0);
  /** the sound the child picked to change (only ever the right one) */
  const [picked, setPicked] = useState<number | null>(null);
  /** ...and the ninja has kicked it out: a gap waits for the new spelling, and the choices are up */
  const [knocked, setKnocked] = useState(false);
  /** the old spelling, spinning away */
  const [flyG, setFlyG] = useState<string | null>(null);
  /** the new spelling on its way into the gap (its choice tile hides) */
  const [carried, setCarried] = useState<string | null>(null);
  /** the tile that just landed (squash and glow) */
  const [landed, setLanded] = useState(-1);
  const [wrongPos, setWrongPos] = useState<number | null>(null);
  const [wrongG, setWrongG] = useState<string | null>(null);
  /** the right choice glows at once (a two-letter split's first miss: SF C5) */
  const [revealG, setRevealG] = useState(false);
  const [shown, setShownS] = useState<Word>(() => chain[0]?.from ?? demo.step.from);
  /** the tile whose sound is said (-2: the whole word, the sweep) */
  const [lit, setLit] = useState(-1);
  /** the tile that pulses on its held sound in a slow word (k retriggers it) */
  const [beat, setBeat] = useState<{ i: number; k: number }>({ i: -1, k: 0 });
  const [busy, setBusy] = useState(true);
  const [baron, setBaron] = useState<"idle" | "bonk" | "flee" | "cast">("idle");
  /** Baron's muddle blowing past the word (the opening) */
  const [blow, setBlow] = useState(false);
  /** the target word's speaker glows ("I'll change it to…") */
  const [hearGlow, setHearGlow] = useState(0);
  /** the demo's paw (a pointing hand, stage px; `point`: idle help, it points and never taps) */
  const [paw, setPaw] = useState<{ x: number; y: number; point?: boolean } | null>(null);
  /** the paw (Show me again) pulses: the short form's offer, a struggling first meeting's */
  const [showPulse, setShowPulse] = useState(false);
  const misses = useRef(0);
  const stepMisses = useRef(0);
  const posMisses = useRef(0);
  const gMisses = useRef(0);
  /** steps right first time in a row (the question fades after two: SF A6, C11) */
  const firstTries = useRef(0);
  /** per child step: did it reach the second-miss help or the 16 s idle point (TEACHER_SCRIPT §2.2's "struggled") */
  const struggled = useRef<boolean[]>([]);
  /** a recap without a Ready hold is told at the child's first answer */
  const tellAtAnswer = useRef(false);
  /** tv_offer_show_miss, once a game */
  const offeredMiss = useRef(false);
  /** the word the child read last (a demo on its own board goes back to it without a second read) */
  const lastRead = useRef<string | null>(null);
  /** a tile tapped as the answer to a Ready hold: it says its sound before the flow goes on */
  const boardTap = useRef<PhonemeId | null>(null);
  const gapW = useRef(150);
  const gapRef = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLDivElement | null)[]>([]);
  const choiceEls = useRef<Record<string, HTMLElement | null>>({});
  const wordRef = useRef<HTMLDivElement>(null);
  /** where the new spelling shoots up from (px below the gap) and its size there (the choice tile's, relative) */
  const riseFrom = useRef({ dy: 206, scale: 0.91 });
  const baronRef = useRef<HTMLDivElement>(null);
  const baronT = useRef(0);
  const lastKnock = useRef<Move | null>(null);
  const lastBonk = useRef<Move | null>(null);
  /** After the knock that earned a tier, the choices are up while the ninja powers up ("power": a tap is kept, see
   *  pending) and then shouts about it ("line": a tap casts the spell straight away, and the word is blended once the
   *  shout is over, see lineWait). */
  const lock = useRef<"power" | "line" | "miss" | null>(null);
  /** the right choice tapped during the power-up: it is kept (and glows) and cast as soon as the power-up is done (a
   *  wrong one gets its gentle miss once the power-up and its shout are over: "miss") */
  const pending = useRef<{ g: string; el: HTMLElement } | null>(null);
  /** the tier-up shout that a spell cast during it must let finish before the blend */
  const lineWait = useRef<Promise<unknown> | null>(null);
  const [queued, setQueued] = useState<string | null>(null);
  const alive = useRef(true);
  const live = () => alive.current;
  // the latest values, for the long scripted sequences (a closure's copy would be stale)
  const phaseRef = useRef<Phase>("wait");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseS(p);
  };
  const shownRef = useRef<Word>(shown);
  const setShown = (w: Word) => {
    shownRef.current = w;
    setShownS(w);
  };
  const stepRef = useRef(step);
  stepRef.current = step;
  const viewRef = useRef<Step | null>(null);
  /** the tiles or choices take the child's tap now (once the question has been asked) */
  const accept = useRef(false);
  /** Bumped by every new turn of events (a question asked, a tap, a correction, the paw): a sequence that was cut off
   *  (its say() hushed by the child's tap) sees it has changed and stops, instead of waking the tiles again. */
  const flow = useRef(0);
  const readRef = useRef(0);
  const readDone = useRef<(() => void) | null>(null);
  const kickDone = useRef<((el: HTMLElement | null) => void) | null>(null);
  /** what Hear it again says now: the read's instruction, the kick's, the turn's question or the pick's */
  const again = useRef<Say[]>([]);
  const ladder = useRef<{ stop(): void; reset(): void } | null>(null);
  const s: Step = view ?? chain[step] ?? demo.step;
  /** the step on the board now, for the scripted sequences (never a render's stale copy) */
  const curStep = (): Step => viewRef.current ?? chain[stepRef.current] ?? demo.step;
  /** the choices are awake ("Now tap the new one.") */
  const [wake, setWake] = useState(false);
  /** the word's tiles take the "which sound changes?" tap (they glow faintly) */
  const [awake, setAwake] = useState(false);
  /** the new spelling is flying up into its gap (not a target meanwhile) */
  const [rising, setRising] = useState(false);
  /** the child's step whose change half the paw's demo is replaying in (Show me again in a turn), or null */
  const [replayIn, setReplayIn] = useState<number | null>(null);
  /** the paw's replay is playing in a Ready hold (the tortoise and the rabbit show over the hold meanwhile) */
  const [replayHeld, setReplayHeld] = useState(false);
  /** the tile the paw is on its way to kick in a replay: it glows, as it does when the child is asked to kick it */
  const [cue, setCue] = useState<number | null>(null);
  useBaronOnScreen();

  const options = useRef(new Map<Step, string[]>());
  const optionsOf = (c: Step): string[] => {
    let o = options.current.get(c);
    if (!o) {
      const known = [...knownSpellings(level)];
      const need = c.to.segs[c.pos].g;
      const old = c.from.segs[c.pos].g;
      const vowelSlot = VOWELS.includes(need);
      const same = known.filter((g) => g !== need && g !== old && VOWELS.includes(g) === vowelSlot);
      const want = level.chain ? 1 : 3;
      const others = shuffle(same).slice(0, want);
      // never a one-tile "choice": short of other spellings (unit 1 has only a and i), the old one is the distractor, which
      // is the listening contrast itself (sat → sit: a or i?)
      if (others.length < want && old !== need) others.push(old);
      options.current.set(c, (o = shuffle([need, ...others])));
    }
    return o;
  };
  const cellAt = (i: number): SoundAt => () => cells.current[i] ?? null;
  const gapAt: SoundAt = () => gapRef.current;

  // ---------------------------------------------------------------- variety (SCRIPT_STYLE §5)
  /** Game time (ms), the clock the transcripts are read in. */
  const gameNow = () => performance.now() * FAST;
  /** When each line was said in this level (game ms, the last few). A turn comes every 15 s or so, and any line may be
   *  said at most twice in 60 s (SCRIPT_STYLE §5): the turn's lines rotate or fade by this record. */
  const heardAt = useRef(new Map<string, number[]>());
  useEffect(
    () =>
      onClip((id) => {
        if (id.includes(":")) return; // (lines only)
        heardAt.current.set(id, [...(heardAt.current.get(id) ?? []).slice(-3), gameNow()]);
      }),
    [],
  );
  /** Said fewer than twice in the last minute: it may be said again now. (65 s: a line is chosen a few seconds before
   *  it plays.) */
  const fresh = (id: string) => HAS.has(id) && (heardAt.current.get(id) ?? []).filter((t) => gameNow() - t < 65_000).length < 2;
  /** The first of these lines that is fresh, or null. */
  const freshOf = (...ids: string[]) => ids.find(fresh) ?? null;
  /** The first fresh one of these recorded lines, else the one whose last-but-one use is oldest (the one that can come
   *  again soonest without a third in a minute). */
  const restedOf = (...ids: string[]): string => {
    const has = ids.filter((id) => HAS.has(id));
    const before = (id: string) => (heardAt.current.get(id) ?? []).at(-2) ?? -1e12;
    return freshOf(...has) ?? [...has].sort((a, b) => before(a) - before(b))[0] ?? ids[0];
  };
  /** A letters line ("It's two letters, but it's one sound.") said in the last minute, by a correction or a reminder */
  const lettersLately = () => ["t_two_letters", "t_three_letters", "t_four_letters", "st_two_letters_too"].some((id) => (heardAt.current.get(id) ?? []).some((t) => gameNow() - t < 65_000));
  /** When praise (or a streak shout) was last said for a word: a miss straight after it is met without the ninja's
   *  "Keep going, ninja." (two such lines within 5 s stack: SCRIPT_STYLE §4). */
  const praisedAt = useRef(-1e9);
  const missNow = () => streak.miss(gameNow() - praisedAt.current < 6000 ? { line: false } : {});
  /** the turn's question as it was asked (it rotates): Hear it again in the pick says it, then "Now tap the new one." */
  const asked = useRef<Say[]>([]);
  const pickAgain = (c: Step): Say[] => [...(asked.current.length ? asked.current : [...L("tv_swap_now_change", "swap_make"), { gap: 100 } as Say, { word: c.to.text } as Say]), { gap: 250 }, ...L("tv_swap_pick", "swap_pick")];
  /** this step's question played the slow pair (a correction then says "Listen to them both again…") */
  const pairSaid = useRef(false);
  /** this step's question was asked in full (not faded): the pick is asked in full too */
  const stepFull = useRef(true);
  /** this step's correction said "It's two letters, but it's one sound." (a split): its word gets no reminder */
  const lettersSaid = useRef(false);

  // ---------------------------------------------------------------- small pictures
  /** The lines pulse on the held sounds in a slow word (TEACHER_SCRIPT §3.20), on each sound's own onset in the clip
   *  (content/stretch.ts SLOW_TIMES): every tile in turn while the child is to hear what changed (lighting only the
   *  changed one would answer the question: SOUND_DISPLAY §1 C), only the changed one in Sensei's demo (`pos`). Listen
   *  for the clips before saying them; returns the unsubscribe. */
  const beatOnSlow = (words: string[], pos: number | "all") =>
    onClip((id) => {
      if (!id.startsWith("stretch:") || !words.includes(id.slice(8))) return;
      const ts = SLOW_TIMES[id.slice(8)] ?? [];
      ts.forEach((t, i) => {
        if (pos !== "all" && i !== pos) return;
        window.setTimeout(() => alive.current && setBeat((b) => ({ i, k: b.k + 1 })), t * 1000);
      });
    });
  /** "Listen to them both… [sat, slowly] [sit, slowly]" */
  const slowPair = (c: Step, lead: Say[] = L("tv_swap_both"), tail: Say[] = []): Say[] => [...lead, { gap: 200 }, { stretch: c.from.text }, { gap: 350 }, { stretch: c.to.text }, ...(tail.length ? [{ gap: 250 }, ...tail] : [])];
  /** say() with the lines pulsing on the held sounds of the slow words (every tile; `demo`: the changed one) */
  const sayBeats = async (items: Say[], c: Step, o: { reveal?: boolean; protect?: boolean; demo?: boolean } = {}) => {
    const off = beatOnSlow([c.from.text, c.to.text], o.demo ? c.pos : "all");
    try {
      return await say(items, { reveal: o.reveal, protect: o.protect });
    } finally {
      off();
    }
  };
  const glowHear = () => setHearGlow((n) => n + 1);
  /** Sensei's paw sets off from her corner (never over the choices) and taps `el` (a demo: navLog `paw`). Resolves as it
   *  taps. */
  const pawTap = async (el: Element | null, id: string) => {
    if (!el) return;
    setPaw({ x: 1110, y: 560 });
    navLog({ kind: "paw", id });
    await sleep(60);
    const r = stageRect(el);
    setPaw({ x: r.x + r.w / 2 - 50, y: r.y + r.h * 0.45 });
    await sleep(820);
    if (live()) sfx.tap();
  };
  /** The paw points at `el` and stays (idle help, Help's third press): it never taps. */
  const pawPoint = (el: Element | null | undefined) => {
    if (!el) return;
    const r = stageRect(el);
    setPaw({ x: r.x + r.w / 2 - 50, y: r.y + r.h * 0.45, point: true });
  };
  const pawAway = () => setPaw((p) => (p?.point ? null : p));

  // ---------------------------------------------------------------- the idle ladder
  /** 8 s: the phase's rephrase; 16 s: "Here it is. Tap it when you're ready." with the paw pointing (a struggle); 24 s:
   *  "Take your time, ninja." once (TEACHER_SCRIPT §5.5). A tap starts it again. */
  const idleFor = (p: Phase) => {
    ladder.current?.stop();
    let took = false;
    ladder.current = quietLadder([8000, 16000, 24000], (k) => {
      if (phaseRef.current !== p || !alive.current) return;
      if (k === 0) return void rephrase(p, true);
      if (k === 1) {
        markStruggle();
        pawPoint(answerEl(p));
        return void say(L("tv_idle_point"));
      }
      if (took) return;
      took = true;
      void say(L("tv_take_time"));
    });
  };
  const stopIdle = () => {
    ladder.current?.stop();
    ladder.current = null;
    pawAway();
  };
  /** The thing the child should tap now: the next tile to read, the demo's old sound, the sound that changes, or the new
   *  spelling. */
  const answerEl = (p: Phase): Element | null => {
    const c = curStep();
    if (p === "read") return cells.current[readRef.current] ?? null;
    if (p === "kick" || p === "change") return cells.current[c.pos] ?? null;
    if (p === "pick") return choiceEls.current[c.to.segs[c.pos].g] ?? null;
    return null;
  };
  const markStruggle = () => {
    const i = stepRef.current - (demo.own ? 1 : 0);
    if (i >= 0) struggled.current[i] = true;
  };
  /** The 8 s rephrase, and Help's first press: never the same words as the question (TEACHER_SCRIPT §5.5). */
  const rephrase = (p: Phase, idle = false) => {
    const c = curStep();
    if (p === "read") return void (idle ? setBeat((b) => ({ i: readRef.current, k: b.k + 1 })) : say(L("tv_swap_read_first")));
    if (p === "kick") return void (idle ? pawPoint(answerEl("kick")) : say(L("tv_swap_kick")));
    if (p === "change") return void sayBeats(slowPair(c, L("tv_both_again", "tv_swap_both"), L("tv_which_changes", "swap_which")), c);
    if (p === "pick") return void sayBeats(slowPair(c, L("tv_both_again", "tv_swap_both"), L("tv_swap_pick", "swap_pick")), c);
  };

  // ---------------------------------------------------------------- the opening
  useEffect(() => {
    alive.current = true;
    streak.reset();
    playMusic(world.music);
    preload([...chain.flatMap((c) => [urls.word(c.from.text), urls.word(c.to.text)]), urls.word(demo.step.from.text), urls.word(demo.step.to.text)]);
    new Image().src = img("baron_defeated");
    void opening();
    return () => {
      alive.current = false;
      clearTimeout(baronT.current);
      ladder.current?.stop();
      hush();
    };
  }, []);

  const opening = async () => {
    const first = demo.own ? 1 : 0;
    if (form === "full") {
      // "Oh dear. Baron Muddle has been muddling up words." Baron casts, his muddle blows past the word; nothing tappable
      again.current = L("tv_swap_oh_dear", "swap_start");
      setBaron("cast");
      setBlow(true);
      window.setTimeout(() => alive.current && (setBlow(false), setBaron((b) => (b === "cast" ? "idle" : b))), 2600);
      await say(L("tv_swap_oh_dear", "swap_start"));
      if (!live() || !(await readFirst(chain[0].from))) return;
      // "In Sound Swap, we change just one sound, to make a new word." (the ninja crouches, ready)
      if (ninja.mounted) ninja.pose("ready");
      again.current = L("tv_swap_frame");
      await say(L("tv_swap_frame"));
      if (!live()) return;
      if (ninja.mounted) ninja.pose(null);
      // "I'll show you first. Are you ready to watch? Tap the green arrow." (the one Ready before a demo: TS T2)
      if (HAS.has("tv_ready_to_watch")) {
        const w = await holdReady("swap:watch", {
          ask: L("tv_ready_to_watch"),
          again: () => say([...L("tv_swap_frame"), { gap: 300 }, ...L("tv_ready_to_watch")]),
        });
        if (!live() || w === false || !(await echoBoardTap())) return;
      }
      if (!(await runDemo(demo.step, live))) return;
      const ask = readyAsk("swap", "full");
      if (ask) {
        const r = await holdReady("swap", {
          ask: [{ line: ask.line }],
          again: () => say([...L("tv_swap_frame"), { gap: 300 }, { line: ask.line }]),
          show: (l) => replayDemo(l),
        });
        if (!live() || r === false || !(await echoBoardTap())) return;
      }
      framed("swap", ask);
    } else if (form === "recap") {
      again.current = L("tv_swap_again");
      await say(L("tv_swap_again"));
      if (!live() || !(await readFirst(chain[0].from))) return;
      if (!(await runDemo(demo.step, live))) return;
      const ask = readyAsk("swap", "recap"); // (after 21 days away or a struggle: "Do you want to have a go now?")
      if (ask) {
        const r = await holdReady("swap", { ask: [{ line: ask.line }], again: () => say([...L("tv_swap_again"), { gap: 300 }, { line: ask.line }]), show: (l) => replayDemo(l) });
        if (!live() || r === false || !(await echoBoardTap())) return;
        framed("swap", ask);
      } else tellAtAnswer.current = true;
    } else {
      // the short line; at the first turn the paw offers the canonical demo (its own pictures, never the turn's answer)
      again.current = L("tv_swap_again");
      await say(L("tv_swap_again"));
      if (!live() || !(await readFirst(chain[0].from))) return;
      setStep(first);
      stepRef.current = first;
      if (HAS.has("tv_show_offer_short")) setShowPulse(true);
      return void question(first, undefined, L("tv_show_offer_short"));
    }
    setStep(first);
    stepRef.current = first;
    await ask(first);
  };
  /** A tile tapped to answer a Ready hold ("I'm ready") says its sound before the flow goes on (TEACHER_SCRIPT §2.3). */
  const echoBoardTap = async () => {
    const p = boardTap.current;
    boardTap.current = null;
    if (p) await say({ sound: p, show: "tile" });
    return live();
  };

  // ---------------------------------------------------------------- the read (Sounds~Write: read the start word first)
  /** "First, let's read this word. Tap each sound, and say it with me." The tiles are sound buttons: the child taps
   *  them left to right (each says its sound and lights), then the word is read fast: the rabbit's (Move 1, once a
   *  session: "Now tap the rabbit, and read the word fast.") or the sweep. Resolves false if the screen was left. */
  const readFirst = async (w: Word): Promise<boolean> => {
    viewRef.current = null;
    setView(null);
    if (shownRef.current !== w) {
      setShown(w);
      await sleep(450); // (the card turns)
      if (!live()) return false;
    }
    readRef.current = 0;
    setReadN(0);
    accept.current = false;
    setPhase("read");
    setBusy(true);
    again.current = L("tv_swap_read_first", "this_is");
    const done = new Promise<void>((r) => (readDone.current = r));
    if (HAS.has("tv_swap_read_first")) await say(L("tv_swap_read_first"));
    else await say([{ line: "this_is" }, { gap: 100 }, { word: w.text }]);
    if (!live()) return false;
    accept.current = true;
    setBusy(false);
    idleFor("read");
    await done;
    stopIdle();
    if (!live()) return false;
    setBusy(true);
    setPhase("wait");
    await sleep(250);
    // the fast way: the rabbit's, once a session in this game (TEACHER_SCRIPT §9.3), else the sweep
    if (HAS.has("tv_fs_rabbit_read") && fsReadback("swap") === "rabbit") {
      // (the rabbit goes live as its prompt starts: the child can tap from the first word, and the prompt is heard)
      const started = nextClip("tv_fs_rabbit_read", 5000);
      void say(L("tv_fs_rabbit_read"));
      await started;
      if (!live()) return false;
      const how = await rabbitTap({ slow: () => say({ sounds: w.segs, show: "tile", onSeg: (i) => alive.current && setLit(i) }) });
      if (!live()) return false;
      fsSaid("tv_fs_rabbit_read", "swap");
      if (how === "timeout") await say(L("tv_fs_now_fast"));
      if (!live()) return false;
    }
    setLit(-2);
    await Promise.all([say({ word: w.text }), sweepUnder(wordRef.current, 900)]);
    if (!live()) return false;
    setLit(-1);
    lastRead.current = w.text;
    return true;
  };
  const readTap = (i: number) => {
    const w = shownRef.current;
    const n = readRef.current;
    if (!accept.current || n >= w.segs.length) return;
    if (i > n) return void setBeat((b) => ({ i: n, k: b.k + 1 })); // ninjas start on this side: the next one hops
    if (i < n) return void say({ sound: w.segs[i].p, show: "tile" }); // (a sound button says its sound again)
    readRef.current = n + 1;
    setReadN(n + 1);
    setLit(i);
    navSpeed("slow"); // the tortoise takes a step on each sound (the slow way)
    // (busy while the sound is said: a child says it along before the next tap)
    setBusy(true);
    void say({ sound: w.segs[i].p, show: "tile" }).then(() => {
      if (!alive.current) return;
      if (readRef.current >= w.segs.length) {
        accept.current = false;
        readDone.current?.();
      } else if (phaseRef.current === "read") setBusy(false);
    });
  };

  // ---------------------------------------------------------------- Sensei's swap (the demo), with the child's kick
  /** Put a step's word on the board, whole (a demo on its own board, or the turn's word back after one). */
  const board = async (c: Step | null, w: Word) => {
    const changed = shownRef.current !== w;
    setReadN(0);
    viewRef.current = c;
    setView(c);
    setShown(w);
    setPicked(null);
    setKnocked(false);
    setFlyG(null);
    setCarried(null);
    setLanded(-1);
    setLit(-1);
    setWrongPos(null);
    setWrongG(null);
    setRevealG(false);
    setCue(null);
    if (changed) await sleep(500); // (the card turns over)
  };
  /**
   * The demo (TEACHER_SCRIPT §3.20): "I'll change it to… [sat]" · [mat, slowly] [sat, slowly] · "The first sound
   * changes. Can you tap it, and kick it out?" (the child's kick; at 8 s the paw points, at 14 s it kicks) · /m/ ·
   * "And in goes…" as the paw taps the new spelling · /s/ as it lands · /s/ /a/ /t/ [sat]. On `d`'s own board. A
   * `replay` (Show me again, the paw) has no join-in: Sensei does it all herself, as Word Building's replay does, so the
   * kick line goes and the paw kicks the old sound straight after the slow pair (its tile glowing as the paw goes).
   * Resolves false if the screen was left (or the replay stopped).
   */
  const runDemo = async (d: Step, ok: () => boolean, o: { replay?: boolean } = {}): Promise<boolean> => {
    setPhase("wait");
    setBusy(true);
    await board(d, d.from);
    if (!ok()) return false;
    // "I'll change it to… sat" (its speaker glows) · the slow pair, the first tile pulsing on each held first sound
    glowHear();
    again.current = [...L("tv_swap_change_to", "swap_make"), { gap: 100 }, { word: d.to.text }];
    await say(again.current);
    if (!ok()) return false;
    await sayBeats([{ gap: 250 }, { stretch: d.from.text }, { gap: 350 }, { stretch: d.to.text }], d, { demo: true });
    if (!ok()) return false;
    const el = o.replay ? await pawKick(d, ok) : await childKick(d, ok);
    if (!ok() || !el) return false;
    setPhase("wait");
    setBusy(true);
    await knockOut(d, d.pos, el, "spin");
    if (!ok()) return false;
    await sleep(60); // (the gap is on screen: the petal stands above it)
    // /m/: out it goes (its petal pops above the gap, then fades)
    await say({ sound: d.from.segs[d.pos].p, show: "petal", at: gapAt });
    if (!ok()) return false;
    await sleep(250);
    // "And in goes…": the paw taps the new spelling in the letter row; the spell carries it in; /s/ as it lands
    const g = d.to.segs[d.pos].g;
    const said = say(L("tv_swap_in"));
    await Promise.all([said, pawTap(choiceEls.current[g] ?? null, "swap:in")]);
    if (!ok()) return false;
    const ch = choiceEls.current[g];
    setPaw(null);
    if (ch && !(await carryIn(g, ch.querySelector<HTMLElement>(".tile") ?? ch, d))) return false;
    await sleep(RISE_MS);
    if (!ok()) return false;
    await say({ sound: d.to.segs[d.pos].p, show: "petal", at: cellAt(d.pos) });
    if (!ok()) return false;
    await blendWord(d.to);
    if (!ok()) return false;
    void bonkBaron(false);
    return true;
  };
  /** A replay's kick: the old sound's tile glows, and Sensei's paw goes to it and kicks it (navLog `paw` "swap:kick").
   *  Resolves the tile, or null if the replay stopped. */
  const pawKick = async (d: Step, ok: () => boolean): Promise<HTMLElement | null> => {
    setCue(d.pos);
    await sleep(200);
    const el = ok() ? cells.current[d.pos]?.querySelector<HTMLElement>(".tile") ?? null : null;
    if (el) await pawTap(el, "swap:kick");
    setCue(null);
    setPaw(null);
    return ok() ? el : null;
  };
  /** The demo's join-in: "The first sound changes. Can you tap it, and kick it out?" and the child kicks it (nobody
   *  kicks: at 8 s the paw points at it, at 14 s Sensei's paw kicks it herself). Resolves the tile, or null if the
   *  screen was left. */
  const childKick = async (d: Step, ok: () => boolean): Promise<HTMLElement | null> => {
    setPhase("kick");
    again.current = L("tv_swap_kick");
    const kicked = new Promise<HTMLElement | null>((r) => (kickDone.current = r));
    // (the screen left: stop waiting)
    const stopper = window.setInterval(() => !ok() && kickDone.current?.(null), 250);
    const line = say(L("tv_swap_kick"));
    void line.then(() => {
      if (!ok() || phaseRef.current !== "kick") return;
      setBusy(false);
      // nobody kicks: at 8 s the paw points at it, at 14 s Sensei's paw kicks it herself (it's her demo)
      ladder.current?.stop();
      ladder.current = quietLadder([8000, 14000], (k) => {
        if (phaseRef.current !== "kick" || !ok()) return;
        if (k === 0) return void pawPoint(cells.current[d.pos]);
        const el = cells.current[d.pos]?.querySelector<HTMLElement>(".tile");
        if (!el) return;
        void pawTap(el, "swap:kick").then(() => kickDone.current?.(el));
      });
    });
    const el = await kicked;
    clearInterval(stopper);
    kickDone.current = null;
    stopIdle();
    setPaw(null);
    return ok() ? el : null;
  };
  /** Show me again (the paw) in a Ready hold: the demo again on its own board (the tortoise and the rabbit showing over
   *  the hold meanwhile), then the board as the hold found it. */
  const replayDemo = async (ok: () => boolean) => {
    const wasShown = shownRef.current, wasView = viewRef.current;
    setReplayHeld(true);
    try {
      await runDemo(demo.step, () => alive.current && ok(), { replay: true });
    } finally {
      stopIdle();
      setPaw(null);
      if (alive.current) setReplayHeld(false);
      if (alive.current && ok()) await board(wasView, wasShown);
    }
  };
  /** The paw in the change half of a turn: "Of course. Watch my paw again." · the demo · "Now it's your turn again." ·
   *  the question. */
  const showInTurn = async () => {
    if (phaseRef.current !== "change") return;
    ++flow.current;
    const i = stepRef.current;
    const c = chain[i];
    setShowPulse(false);
    stopIdle();
    liveTiles(false);
    setPhase("wait");
    setBusy(true);
    setReplayIn(i); // (the turn stays the child's while the demo plays: __snState.next keeps its answer)
    await say(L("tv_show_again"));
    if (!live()) return;
    await runDemo(demo.step, live, { replay: true });
    if (!live()) return;
    await board(null, c.from);
    if (!live()) return;
    await say(L("tv_turn_again"));
    if (!live()) return;
    setReplayIn(null);
    await question(i, true);
  };

  // ---------------------------------------------------------------- a step's pieces
  /** The ninja kicks the sound at `i` out of the word (it spins away), a gap waits, and the choices spring up. */
  const knockOut = async (c: Step, i: number, el: HTMLElement, move?: Move) => {
    sfx.pop();
    setWake(false);
    setPicked(i);
    const size = tileSize(c.from.segs.length);
    gapW.current = Math.max(size, Math.round(stageRect(el).w));
    const m: Move = move ?? pickMove(KNOCK[streak.tier], lastKnock);
    lastKnock.current = m;
    await Promise.race([ninja.act(m, el, { react: false }), sleep(1500)]);
    if (!alive.current) return;
    // the old spelling spins away, the picture goes wobbly, and the new spellings pop up
    setFlyG(c.from.segs[i].g);
    setKnocked(true);
    sfx.whoosh();
  };
  /** A spell carries the new spelling across UNDER the word, to just below the gap, and it shoots up into place from
   *  there, so the glowing copy never passes over (and hides) the sounds the child is reading. The spell's arrival
   *  sparkle stays down there: the tile leaves it at full speed (swap-rise), long before it blooms. Then the word is
   *  whole again and the picture turns over into the new word (stars from behind the card). */
  const carryIn = async (g: string, el: HTMLElement, c: Step): Promise<boolean> => {
    // (a quick child can tap while the choices are still springing in: settle them first, so the spell carries a
    // full-size copy)
    el.closest(".swap-choice")?.getAnimations().forEach((a) => a.finish());
    const gr = gapRef.current ? stageRect(gapRef.current) : { x: 574, y: 270, w: 132, h: 132 };
    const gapC = { x: gr.x + gr.w / 2, y: gr.y + gr.h / 2 };
    // (in a hold's replay the choices stand higher, clear of the hold's buttons: the spell stops nearer the word)
    const below = { x: gapC.x, y: gr.y + gr.h + (viewRef.current && readyHeld() ? 64 : 140) };
    riseFrom.current = { dy: below.y - gapC.y, scale: stageRect(el).w / tileSize(c.to.segs.length) || 1 };
    const arrive = ninja.carry(el, below, { react: false });
    setCarried(g);
    await Promise.race([arrive, sleep(1600)]);
    if (!alive.current) return false;
    setShown(c.to);
    setLanded(c.pos);
    // (it isn't a target while it flies up: it passes the nav buttons at the bottom)
    setRising(true);
    window.setTimeout(() => alive.current && setRising(false), 700);
    setPicked(null);
    setKnocked(false);
    setFlyG(null);
    setCarried(null);
    window.setTimeout(() => alive.current && sfx.pop(), RISE_MS);
    sfx.petal();
    return true;
  };
  /** /s/ /i/ /t/ sit: the tiles light in turn (their voices: "tile"), the tortoise stepping on each sound and the rabbit
   *  hopping on the word (the slow way, then the fast way: TEACHER_SCRIPT §9.6). */
  const blendWord = async (w: Word) => {
    navSpeed("slow");
    await sayBlend(w.segs, w.text, (i) => alive.current && setLit(i));
    if (alive.current) setLit(-1);
  };

  // ---------------------------------------------------------------- a turn
  /** The turn's question (SF C11, TEACHER_SCRIPT §3.20): "Now let's change it to… sit" · "Listen to them both… [sat,
   *  slowly] [sit, slowly]" · "What do we need to change?"; from the child's third step, after two first tries in a row,
   *  just "Now let's change it to… sit" (every time; the slow pair and the question come back after a miss). */
  const questionOf = (c: Step, full: boolean): Say[] => {
    // A turn comes every 10-15 s, and any line may be said at most twice in a minute (SCRIPT_STYLE §5), so the question
    // rotates between whole sentences, never a clipped order (§T.4, Jonas's "abbreviated way of talking"). Faded (the
    // instruction fades with success, SCRIPT_STYLE §5: "the stimulus alone or a whole sentence"): "Now let's change it
    // to… sit" every time, the target's speaker glowing. Never a question here: one question
    // on item after item, however it rotates, is the cycle a verify round found samey (w1-12: "Which sound changes?",
    // "Yes, the middle sound changes!", the read-back, twelve times; script-audit's ask-cycle: at most 3 running). In
    // full: "Now let's change it to… sit" · "Listen to them both… [sat, slowly] [sit, slowly]" (the
    // lead rests after the carrier: the tortoise lights on each; it always opens a question that has no carrier) · one
    // of ASKS ("What do we need to change?", "Which sound changes?", "Which sound needs to change?"): the first that
    // hasn't been said twice in the minute, else the one rested longest.
    const w: Say = { word: c.to.text };
    // The stem is said every time (TEACHER_SCRIPT §3.20 "every time"; a routine line, exempt from the 60-second rule):
    // without it the read-back of the word just made runs straight into the next bare word, and a 3-year-old hears two
    // words back to back and can't tell which one to make (verify 28 Sep, w1-12 "man · map").
    const carried: Say[] = [...L("tv_swap_now_change", "swap_make"), { gap: 100 }, w];
    if (!full) return carried;
    const target = carried;
    const lead = !target.length || fresh("tv_swap_both") ? L("tv_swap_both", "listen") : [];
    const ask = restedOf(...ASKS);
    const pair = slowPair(c, lead, L(ask, "what_changed"));
    return target.length ? [...target, { gap: 300 }, ...pair] : pair[0] && "gap" in pair[0] ? pair.slice(1) : pair;
  };
  /** The word's tiles take the child's "which sound changes?" tap (and glow faintly: TEACHER_SCRIPT §3.20). */
  const liveTiles = (on: boolean) => {
    accept.current = on;
    setAwake(on);
  };
  /** The tiles wake as the question line starts, "What do we need to change?" or "Which sound changes?" (TEACHER_SCRIPT
   *  §3.20; §6: the child can act from its first word), and the scene is no longer busy then (continuous.ts counts a
   *  tap made while busy as ignored). "Now let's change it to… sit" wakes them as it ends: the child needs the word.
   *  Returns the unsubscribe. */
  const wakeOn = (clip: string | null, my: number) =>
    onClip((id) => {
      if (!clip || id !== clip || !alive.current || my !== flow.current || phaseRef.current !== "change") return;
      liveTiles(true);
      setBusy(false);
    });
  /** The question line a question ends on (the tiles wake as it starts), or null when it ends on the word. */
  const lastOf = (q: Say[]): string | null => {
    const id = q.map(clipId).filter((x): x is string => !!x).at(-1) ?? null;
    return id && !id.includes(":") ? id : null;
  };
  /** Ask step i's question. The tiles wake as its question line starts ("What do we need to change?"), or as it ends. */
  const question = async (i: number, full?: boolean, lead: Say[] = []) => {
    const my = ++flow.current;
    const c = chain[i];
    const f = full ?? fadeForm(firstTries.current) === "full";
    const q = questionOf(c, f);
    again.current = asked.current = q;
    setReadN(0);
    liveTiles(false);
    setPhase("change");
    setBusy(true);
    window.setTimeout(() => alive.current && glowHear(), lead.length ? 2600 : 0);
    pairSaid.current = f;
    stepFull.current = f;
    const off = wakeOn(lastOf(q), my);
    try {
      await sayBeats(lead.length ? [...lead, { gap: 400 }, ...q] : q, c);
    } finally {
      off();
    }
    if (!live() || my !== flow.current || phaseRef.current !== "change") return;
    liveTiles(true);
    setBusy(false);
    idleFor("change");
  };
  const ask = async (i: number) => {
    setBusy(true);
    setLanded(-1);
    stepMisses.current = posMisses.current = gMisses.current = 0;
    lettersSaid.current = false;
    setPhase("wait");
    const c = chain[i];
    if (!c) return;
    // a new start word (a fresh mini-chain) is read first; after a demo on its own board the board goes back to the word
    // the child read (or the demo's new word is the turn's)
    if (shownRef.current.text !== c.from.text || viewRef.current) {
      if (lastRead.current === c.from.text || (viewRef.current && viewRef.current.to.text === c.from.text)) await board(null, c.from);
      else if (!(await readFirst(c.from))) return;
    }
    if (!live()) return;
    await question(i);
  };

  /** Hear it again (the speaker, the word card): whatever the child is asked now; nothing while Sensei is busy with a
   *  demo or the ninja with a kick. */
  const hear = () => {
    const p = phaseRef.current;
    if (p === "wait" && !again.current.length) return;
    if (p === "wait" && busy) return;
    return say(again.current);
  };
  const canShow = phase === "change" && !knocked && picked === null && !view;
  // the tortoise and the rabbit beside the speaker; Move 1's live rabbit stands just right of the word it reads fast
  const n = shown.segs.length, ts = tileSize(n);
  const liveAt = { x: Math.min(1060, Math.round(640 + (n * ts + (n - 1) * (ts < 132 ? 14 : 18)) / 2 + 92)), y: 336 };
  // (the pair right of the picture's speaker, clear of Baron: never beside the tiles, where their petals pop)
  const speedSpec: SpeedSpec = { at: { x: 968, y: 174 }, liveAt };
  useNav({ again: hear, againAt: "own", speed: speedSpec, show: canShow ? () => showInTurn() : null, showPulse: canShow && showPulse });

  /** A star (or a spell) bonks Baron Muddle: he sulks. The last one sends him packing. It arcs high over the picture and
   *  the word (the curve's control point is up above the stage, left of the card), so it never looks as if the ninja
   *  were hitting the word it has just fixed. */
  const bonkBaron = (final: boolean) => {
    const el = baronRef.current;
    if (!el) return Promise.resolve();
    const move: Move = final ? (streak.tier >= 2 ? "flip" : "jump") : pickMove(BONK[streak.tier], lastBonk);
    const b = stageRect(el);
    const via = { x: 450, y: (4 * 30 - 500 - (b.y + b.h / 2)) / 2 };
    return ninja.act(move, el, { via }).then(() => {
      if (!alive.current) return;
      clearTimeout(baronT.current);
      const r = stageRect(el);
      if (final) {
        setBaron("flee");
        sfx.whoosh();
        fx.puff(r.x + r.w / 2, r.y + r.h * 0.85, 12);
      } else {
        setBaron("bonk");
        fx.twinkle(r.x + r.w * 0.45, r.y + r.h * 0.2, ["#fff4dc", "#ffe38a", "#b48cff"], 6, 4, 22);
        baronT.current = window.setTimeout(() => alive.current && setBaron("idle"), 1400);
      }
    });
  };

  /** "Yes, the middle sound changes!" (protected: a quick tap can't cut it, SF C11.3), then "Now tap the new one." as
   *  the choices wake. Where the child can't use a place's name (a four-sound word's inside), only the prompt. Nothing
   *  here names the new sound: it is the question (SD A8). */
  const sayPick = async (my: number) => {
    const c = chain[stepRef.current];
    const name = c ? positionName(c.pos, c.from.segs.length) : null;
    const own = name && HAS.has(ST_PLACE[name]);
    // (a place line said twice in the last minute rests: the kick has shown the child they were right. It fades with the
    // question, too: in a faded step (two first tries in a row) the kick alone says "yes", bar one place line every 30 s
    // or so; a miss brings it back. Verify round 2: w1-12 said "Yes, the middle sound changes!" 5 times in 2.5 minutes)
    const placeLately = Object.values(ST_PLACE).some((id) => (heardAt.current.get(id) ?? []).some((t) => gameNow() - t < 30_000));
    const rest = own && !stepFull.current && placeLately;
    const place = name && !rest ? (own ? (fresh(ST_PLACE[name]) ? ST_PLACE[name] : null) : SWAP_POSITION_LINE[name]) : null;
    again.current = pickAgain(c);
    if (place) await say({ line: place }, { protect: true });
    if (!alive.current || my !== flow.current || lock.current === "miss" || phaseRef.current !== "pick") return;
    accept.current = true; // (the choices wake as the prompt starts)
    setWake(true);
    // "Now tap the new one." with a full question; it fades with the question (after two first tries: SCRIPT_STYLE §5,
    // SF C11's faded step), and rests once said twice in the minute. The choices hop awake either way
    const prompt = own ? (stepFull.current && fresh("tv_swap_pick") ? L("tv_swap_pick") : []) : place ? [] : L("tv_swap_pick", "swap_pick");
    if (!prompt.length) {
      setBusy(false);
      return void idleFor("pick");
    }
    await say(prompt);
    if (!alive.current || my !== flow.current || phaseRef.current !== "pick" || carriedRef.current) return;
    setBusy(false);
    idleFor("pick");
  };
  const carriedRef = useRef<string | null>(null);
  carriedRef.current = carried;

  /** A tile of the word tapped. */
  const tapTile = (i: number, el: HTMLElement) => {
    const p = phaseRef.current;
    if (p === "read") return readTap(i);
    if (p === "kick") {
      const d = curStep();
      if (i === d.pos && kickDone.current) return void kickDone.current(el);
      return void setBeat((b) => ({ i: d.pos, k: b.k + 1 })); // (that one stays: the first one hops)
    }
    // a Ready hold is up: a tile on the board means "I'm ready" (it says its sound, then the turn starts)
    if (readyHeld()) {
      const seg = shownRef.current.segs[i];
      if (seg && readyTap({ label: seg.g })) boardTap.current = seg.p;
      return;
    }
    if (p === "change") return void tapPos(i, el);
  };

  const tapPos = async (i: number, el: HTMLElement) => {
    const c = chain[stepRef.current];
    if (!c || !accept.current || picked !== null) return;
    const my = ++flow.current;
    stopIdle();
    setShowPulse(false);
    if (tellAtAnswer.current) {
      tellAtAnswer.current = false;
      framed("swap"); // (a recap with no hold is told at the child's first answer)
    }
    if (i === c.pos) {
      liveTiles(false);
      setWrongPos(null); // (a right tap during a correction's question: the earlier wrong tile is forgiven)
      setBusy(true);
      setPhase("pick");
      const first = posMisses.current === 0;
      const move: Move = stepRef.current === 0 && first && !demo.own ? "spin" : pickMove(KNOCK[streak.tier], lastKnock);
      // strike first, then count it: a tier-up's power-up then waits for this kick to land
      const knock = knockOut(c, i, el, move);
      const e = first ? streak.hit({ part: true }) : null;
      const tierUp = !!e?.tierUp;
      const lineSaid = streakLineSaid(e);
      await knock;
      if (!alive.current || my !== flow.current) return;
      if (!tierUp) return void sayPick(my);
      // this kick powered the ninja up: the choices spring in while the power-up plays and the ninja shouts about it.
      // A spell now would cut the power-up short, so a choice tapped meanwhile is kept (it glows: "got it") and cast
      // the moment the power-up is done. Once it is, a tap casts at once; either way the blend waits for the shout to
      // end, and the place line follows the shout
      lock.current = "power";
      lineWait.current = lineSaid;
      await ninjaSettled();
      if (!alive.current || (lock.current as string) === "miss") return; // a wrong choice meanwhile has taken over
      const pnd = pending.current;
      pending.current = null;
      if (pnd) {
        lock.current = null;
        return void chooseNew(pnd.g, pnd.el);
      }
      lock.current = "line";
      await lineSaid;
      if (!alive.current || lock.current !== "line") return; // a tap during the shout has cast the spell (or missed)
      lock.current = null;
      lineWait.current = null;
      void sayPick(flow.current);
    } else {
      // "That's… /t/ · That sound stays the same. · Listen to them both… [pat, slowly] [mat, slowly] · What do we need to
      // change?" (TEACHER_SCRIPT §5.4): the tile wobbles, its petal pops above it (SD r34)
      misses.current++;
      stepMisses.current++;
      posMisses.current++;
      firstTries.current = 0;
      if (posMisses.current >= 2) markStruggle();
      liveTiles(false);
      const lineSaid = streakLineSaid(missNow());
      setWrongPos(i);
      sfx.wrong();
      setBusy(true);
      await lineSaid; // "Keep going, ninja." when a streak of 3 or more is lost
      if (!alive.current || my !== flow.current) return;
      // "Listen to them both again…" once this step's question has played the pair (or "Listen to them both…" has been
      // said twice in the minute); the question rotates as the turn's does
      const both = pairSaid.current || !fresh("tv_swap_both") ? L("tv_both_again", "tv_swap_both") : L("tv_swap_both", "listen");
      const ask = restedOf(...ASKS);
      const fix: Say[] = [...L("thats"), { sound: c.from.segs[i].p, show: "petal", at: cellAt(i) }, { gap: 150 }, ...L("stays_same"), { gap: 300 }, ...slowPair(c, both, L(ask, "what_changed"))];
      again.current = asked.current = questionOf(c, true);
      pairSaid.current = true;
      stepFull.current = true; // (after a miss the pick is asked in full)
      // (the tiles wake again as the question starts)
      const off = wakeOn(lastOf(fix), my);
      try {
        await sayBeats(fix, c, { reveal: true });
      } finally {
        off();
      }
      if (!alive.current || my !== flow.current) return;
      setWrongPos(null);
      liveTiles(true);
      setBusy(false);
      idleFor("change");
      // a first meeting's first two turns: the second miss offers the paw (once a game)
      if (posMisses.current === 2 && form === "full" && stepRef.current - (demo.own ? 1 : 0) < 2 && !offeredMiss.current && HAS.has("tv_offer_show_miss")) {
        offeredMiss.current = true;
        setShowPulse(true);
        void say(L("tv_offer_show_miss"));
      }
    }
  };

  const tapNew = (g: string, el: HTMLElement) => {
    const c = chain[stepRef.current];
    if (phaseRef.current !== "pick" || view || !knocked || carried || !c) return;
    if (lock.current === "miss") return;
    const right = g === c.to.segs[c.pos].g;
    if ((lock.current === "power" || lock.current === "line") && !right) {
      // a wrong choice while the ninja powers up or shouts about it: never the "got it" glow; it turns pink at once,
      // and its gentle miss follows when the shout is over (so "Ninja power!" isn't cut off mid-word)
      lock.current = "miss";
      pending.current = null;
      setQueued(null);
      setWrongG(g);
      sfx.wrong();
      void ninja.linesDone().then(() => {
        if (!alive.current) return;
        lineWait.current = null;
        void chooseNew(g, el, true);
      });
      return;
    }
    if (lock.current === "power") {
      // the ninja is still powering up: keep the (right) choice and show it was heard
      pending.current = { g, el };
      setQueued(g);
      sfx.twinkle();
      return;
    }
    if (lock.current === "line") {
      // powered up and still shouting about it: cast now (the blend waits for the shout)
      lock.current = null;
      return void chooseNew(g, el);
    }
    if (!accept.current) return;
    void chooseNew(g, el);
  };
  /** The child has chosen a new spelling (straight from a tap, or kept from a tap during a power-up). `marked`: a wrong
   *  choice already marked (see tapNew). */
  const chooseNew = async (g: string, el: HTMLElement, marked = false) => {
    const i = stepRef.current;
    const c = chain[i];
    if (!c) return;
    const my = ++flow.current;
    setQueued(null);
    stopIdle();
    accept.current = false;
    const need = c.to.segs[c.pos];
    if (g === need.g) {
      recordSpell(need, stepMisses.current === 0);
      recordRead(c.to, stepMisses.current === 0);
      setBusy(true);
      setRevealG(false);
      const first = gMisses.current === 0;
      if (!(await carryIn(g, el, c))) return;
      // the blend waits for the new letter to be still: the child sees it, uncovered, as its sound is said (and for a
      // tier-up shout that is still going, so it isn't cut off)
      await Promise.all([sleep(SETTLE_MS), lineWait.current]);
      lineWait.current = null;
      if (!alive.current) return;
      await blendWord(c.to);
      if (!alive.current) return;
      sfx.good();
      // the word is fixed, and heard: now it counts (Dec2: the whole answer, then the pick's part hit). A tier-up's
      // power-up and shout ("Super ninja streak!") are the praise, and the star for Baron flies as soon as the power-up
      // is done, while the ninja is still shouting.
      if (stepMisses.current === 0) streak.answer();
      const e = first ? streak.hit({ part: true }) : null;
      firstTries.current = stepMisses.current === 0 ? firstTries.current + 1 : 0;
      const lineSaid = e?.tierUp ? streakLineSaid(e) : Promise.resolve(false);
      if (e?.tierUp) {
        await ninjaSettled(1800);
        if (!alive.current) return;
      }
      const last = i + 1 >= chain.length || timeUp(); // (a cut lesson ends after this word when its time is up)
      const bonk = bonkBaron(last);
      // After the word: at most one of the reminder about its new spelling (its petal pops above the lit tile on "one
      // sound": Dec4) and praise (every second word; the game's idea line takes the first praise slot of the session:
      // TEACHER_SCRIPT §9.3). A praise slot before a full question would make the talk before the next tap too long
      // (§0.1's 12 s), so it waits for a word whose next question is short, or the last.
      // (none while "It's two letters, but it's one sound." was said in the last minute: a split's correction, most often
      // this very step's. lettersReminder doesn't know a correction said it)
      const seg = c.to.segs[c.pos];
      const quiet = lettersSaid.current || lettersLately();
      const own = quiet ? null : (twoSoundsReminder([seg], () => cellAt(c.pos)) ?? lettersReminder([seg], () => cellAt(c.pos)));
      const remind = quiet ? null : own ? { ...own, i: c.pos } : (twoSoundsReminder(c.to.segs, cellAt) ?? lettersReminder(c.to.segs, cellAt));
      // (a fresh mini-chain opens with the child's read: a tap comes before its question)
      const nextFull = !last && chain[i + 1]?.from.text === c.to.text && fadeForm(firstTries.current) === "full";
      const cheered = e?.tierUp ? await lineSaid : false;
      if (!alive.current) return;
      if (remind && !cheered) setLit(remind.i);
      if (cheered) praisedAt.current = gameNow();
      const said = await afterWordSay({
        tierUp: cheered,
        leftRight: false,
        reminder: remind,
        gemFirst: null, // (the save's first gem is explained at the reward: TEACHER_SCRIPT §5.7)
        closingNext: last || nextFull,
        game: "swap",
        praise: { every: 2, keptGoing: stepMisses.current > 0, helped: helpLvlRef.current >= 2 },
        fs: fsIdea("swap", "build"),
      });
      if (said === "praise") praisedAt.current = gameNow();
      if (!alive.current) return;
      setLit(-1);
      if (last) {
        await Promise.race([bonk, sleep(1200)]);
        if (!alive.current) return;
        fx.rain("confetti", 60);
        // (a streak shout for the last word, "Ninja power!", has its moment before the close: two such lines within
        // 5 s stack, SCRIPT_STYLE §4; the confetti and Baron running off fill it)
        const since = gameNow() - praisedAt.current;
        if (since < 4200) await sleep(4200 - since);
        if (!alive.current) return;
        const wrap = levelWrap(level).filter((id) => HAS.has(id));
        const closing = wrap[0] ?? (HAS.has("swap_done") ? "swap_done" : undefined);
        await Promise.all([closing ? say((wrap.length ? wrap : [closing]).map((line) => ({ line }))) : null, ninja.celebrate()]);
        if (!alive.current) return;
        played("swap", { struggled: struggledIn(struggled.current) });
        onDone(misses.current <= 1 ? 3 : misses.current <= 4 ? 2 : 1, closing ? { closing } : undefined);
        return;
      }
      await Promise.race([bonk, sleep(400)]);
      if (!alive.current) return;
      setStep(i + 1);
      stepRef.current = i + 1;
      await ask(i + 1);
    } else {
      misses.current++;
      stepMisses.current++;
      gMisses.current++;
      firstTries.current = 0;
      if (gMisses.current >= 2) markStruggle();
      const lineSaid = streakLineSaid(missNow());
      setWrongG(g);
      if (!marked) sfx.wrong();
      setBusy(true);
      await lineSaid; // "Keep going, ninja." when a streak of 3 or more is lost
      if (!alive.current || my !== flow.current) return;
      const attempt = gMisses.current;
      // (the same sound's split: < l > for < ll >, < s > for < ss >, < c > for < ck >. correctionFor says "Yes, that's a
      // spelling of that sound too! But in this word, we spell it like this… /l/", and nothing about the letters: the
      // child split a two-letter spelling all the same, so the letters line follows it, as SF C5's does)
      const sameSplit = GRAPHEMES[g] === need.p && splitsSpelling(g, need) && !!lettersLine(need);
      const split = (revealsNow(g, need, 1) || sameSplit) && attempt === 1;
      if (revealsNow(g, need, 1) || sameSplit) lettersSaid.current = true; // (a split on any attempt gets the letters line)
      const at = { wrong: (() => choiceEls.current[g] ?? null) as SoundAt, slot: gapAt };
      // the same sound, another spelling; a two-letter split (SF C5: "That's… /n/ We need… /ng/ It's two letters, but it's
      // one sound.", the right one glowing at once); a second miss ("That's… /a/ We need… /i/ It's this one."): the
      // shared correction, every sound a petal above its tile. A plain first miss goes back to listening: the tapped
      // tile's sound, then "Listen to them both again…" and the prompt again (TEACHER_SCRIPT §5.4: rephrase, hand back)
      // (the same sound, spelt another way: "But in this word, we spell it like this..." shows the right one at once. It
      // can't be heard, so there is nothing to work out)
      const same = GRAPHEMES[g] === need.p;
      const shared = same || revealsNow(g, need, attempt);
      if (same || revealsNow(g, need, attempt)) setRevealG(true);
      // (a split within a minute of another "It's two letters, but it's one sound." ends on "This one's two letters too,
      // but it's just one sound." instead: never the same letters sentence twice in a minute, SCRIPT_FIXES F)
      const lately = (id: string) => (heardAt.current.get(id) ?? []).some((t) => gameNow() - t < 65_000);
      const twoToo = lately("t_two_letters") && HAS.has("st_two_letters_too") && !lately("st_two_letters_too");
      const corr = shared ? correctionFor(g, need, c.to.text, attempt, c.to, at) : [];
      const letters = sameSplit ? lettersLine(need) : null;
      if (letters && HAS.has(letters) && !corr.some((it) => "line" in it && it.line === letters)) corr.push({ gap: 250 }, { line: letters });
      const fix: Say[] = shared
        ? corr.map((it) => (twoToo && "line" in it && it.line === "t_two_letters" ? { line: "st_two_letters_too" } : it))
        : [...L("thats"), { sound: GRAPHEMES[g] ?? need.p, show: "petal", at: at.wrong }, { gap: 250 }, ...slowPair(c, L("tv_both_again", "tv_swap_both"), L("tv_swap_pick", "swap_pick"))];
      again.current = pickAgain(c);
      await sayBeats(fix, c, { reveal: attempt > 1 || split, protect: split || sameSplit });
      if (!alive.current || my !== flow.current) return;
      if (lock.current === "miss") lock.current = null;
      setWrongG(null);
      accept.current = true;
      setBusy(false);
      idleFor("pick");
    }
  };

  const [helpLvl, setHelpLvl] = useState(0);
  const helpLvlRef = useRef(0);
  helpLvlRef.current = helpLvl;
  useEffect(() => setHelpLvl(0), [step, knocked, phase]);
  useHelp(
    (n) => {
      const p = phaseRef.current;
      if (p === "wait" || (busy && p !== "kick")) return;
      setHelpLvl(n);
      if (n >= 2) markStruggle();
      const c = curStep();
      if (n === 1) return rephrase(p);
      if (p === "pick" && n >= 3) {
        // "Let me show you… /o/": its petal pops above the gap, and the new spelling glows (SD r36)
        setRevealG(true);
        return void say([...L("help_look"), { gap: 100 }, { sound: c.to.segs[c.pos].p, show: "petal", at: gapAt }], { reveal: true });
      }
      if (n === 2) return void say(L("tv_look_glow"));
      pawPoint(answerEl(p));
      void say(L("tv_idle_point"));
    },
    [step, knocked, busy, picked, phase],
  );

  // the bot (scripts/treadmill/bot.ts) taps `.slots .tile` number `pos` (the read's next tile, the demo's kick, the
  // sound to change), then `.row .tile` labelled `next`; `game` is TEACHER_SCRIPT §2.6's id (script-audit's plays)
  const need = s ? s.to.segs[s.pos] : undefined;
  (window as any).__snState = {
    scene: "swap",
    game: "swap",
    phase,
    busy: busy || phase === "wait" || (picked !== null && !knocked) || !!carried,
    picked: phase === "pick" && knocked ? picked : null,
    pos: phase === "read" ? readN : s?.pos,
    // what the child should tap now: the tile whose sound changes, then the new spelling (in a replay inside a turn,
    // still the turn's: the paw's demo never answers it)
    next: replayIn !== null && chain[replayIn] ? chain[replayIn].from.segs[chain[replayIn].pos].g : phase === "change" ? s?.from.segs[s.pos].g : phase === "pick" ? need?.g : null,
    word: s?.to.text,
    step,
    streak: streak.n,
  };
  if (!s || !shown) return null;
  const size = tileSize(shown.segs.length);
  const hintPos = (posMisses.current >= 2 || helpLvl >= 2) && picked === null && phase === "change";
  const opts = optionsOf(s);
  const tilesLive = phase === "read" || (phase === "change" && awake);
  return (
    <div className="scene swap-scene">
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      <TopBar>
        <div className="spacer" />
        <Progress value={step / chain.length} />
        <div className="spacer" />
        <div style={{ width: 68 }} />
      </TopBar>
      {/* Baron Muddle, top-right (clear of the help corner): casts his muddle at the start, sulks when a word is fixed,
          runs away at the end */}
      <div ref={baronRef} className={`swap-baron ${baron}`} aria-hidden="true">
        <div className="swap-baron-in">
          <img src={img(baron === "idle" || baron === "cast" ? "baron_idle" : "baron_defeated")} alt="" draggable={false} />
        </div>
      </div>
      {/* his muddle blows past the word as Sensei says "Oh dear…" */}
      {blow && (
        <div className="swap-blow" aria-hidden="true">
          <Swirl />
        </div>
      )}
      {/* picture of the current word: it goes wobbly while a sound is missing */}
      {/* ...and when it turns into the new word, stars burst out from behind it */}
      {landed >= 0 && (
        <div key={`halo-${shown.text}`} className="swap-card-halo" style={CARD}>
          <Halo n={14} rx={200} up={124} down={150} ring={[CARD.width / 2, CARD.height / 2, 30]} delay={80} />
        </div>
      )}
      {/* Hear it again: the speaker card itself for a word with no picture (docs/NAVIGATION.md §3.1 "own") */}
      <WordCardAgain key={shown.text} word={shown} className={`swap-card ${knocked ? "muddled" : ""} ${blow ? "wobble" : ""}`} style={CARD} />
      {knocked && (
        <div className="swap-swirl" style={CARD} aria-hidden="true">
          <Swirl />
          <Swirl className="b" />
        </div>
      )}
      {/* Hear it again beside a picture card (docs/NAVIGATION.md §3.1 "own": the word and its choices fill the bottom);
          it glows as Sensei names the word to make */}
      {shown.pic && <ReplayButton onReplay={hear} size={100} label="Hear the target word" className={`swap-hear ${hearGlow ? `glow g${hearGlow % 2}` : ""}`} style={{ position: "absolute" }} />}
      {/* the word: read it, then tap the sound that changes */}
      <div ref={wordRef} className={`slots swap-word ${landed >= 0 ? "rising" : ""} ${lit === -2 ? "sweep" : ""}`} style={{ gap: size < 132 ? 14 : 18 }}>
        {shown.segs.map((seg, i) => {
          const gap = knocked && picked === i;
          const state = wrongPos === i ? "wrong" : picked === i ? "right" : (phase === "read" && i === readN && !busy) || (phase === "kick" && i === s.pos) || cue === i || (hintPos && i === s.pos) ? "hint" : "";
          const cls = [landed === i ? "swap-rise" : "", i < readN ? "swap-read" : "", tilesLive && state !== "hint" ? "swap-live" : ""].join(" ");
          return (
            <div
              key={`${shown.text}-${i}`}
              ref={(el) => void (cells.current[i] = el)}
              className={`swap-cell ${picked === i && !knocked ? "target" : ""} ${beat.i === i ? `swap-beat b${beat.k % 2}` : ""}`}
              style={{ "--i": i } as CSSProperties}
              // (the new spelling flying up into its gap is no target: pointer-events are off as it passes the nav
              // buttons, so it is out of the tree a tap or a check reads until it has landed)
              aria-hidden={rising && landed === i ? true : undefined}
            >
              {gap ? (
                <>
                  <div ref={gapRef} className="slot active swap-gap" style={{ width: gapW.current, height: size }} />
                  {flyG && (
                    <div className="swap-flyout" aria-hidden="true">
                      <Tile g={flyG} size="lg" withButtons style={{ "--size": `${size}px` } as CSSProperties} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {landed === i && <Halo n={14} rx={size + 50} up={size * 0.5} down={size + 16} ring={[gapW.current / 2, size / 2, 26]} delay={Math.round(RISE_MS * 0.8)} className="word" />}
                  <Tile
                    g={seg.g}
                    withButtons
                    lit={lit === i || lit === -2}
                    className={cls}
                    style={{ "--size": `${size}px`, ...(landed === i ? { "--rise": `${Math.round(riseFrom.current.dy)}px`, "--from": riseFrom.current.scale.toFixed(3), ...(rising ? { pointerEvents: "none" } : {}) } : {}) } as CSSProperties}
                    state={state}
                    onTap={(el) => tapTile(i, el)}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      {/* the new spellings to choose from (they wake as Sensei says "Now tap the new one.") */}
      {knocked && (
        <div className={`row swap-choices ${phase === "pick" && wake && !view && !carried ? "live" : ""} ${view && readyHeld() ? "lifted" : ""}`}>
          {opts.map((g, k) => (
            <span key={g} ref={(el) => void (choiceEls.current[g] = el)} className="swap-choice" style={{ "--i": k } as CSSProperties}>
              <Tile
                g={g}
                className={carried === g ? "carried" : queued === g ? "queued" : ""}
                state={wrongG === g ? "wrong" : (gMisses.current >= 2 || helpLvl >= 2 || revealG) && !view && g === s.to.segs[s.pos].g ? "hint" : ""}
                onTap={(el) => tapNew(g, el)}
              />
            </span>
          ))}
        </div>
      )}
      {/* the demo's paw (and the idle help's pointing paw: it never taps) */}
      {paw && (
        <div className={`swap-paw ${paw.point ? "point" : ""}`} style={{ transform: `translate(${Math.round(paw.x)}px, ${Math.round(paw.y)}px)` }} aria-hidden="true">
          <TapHint show style={{ position: "relative" }} />
        </div>
      )}
      <NinjaSpot />
      <NarrOverlay />
      <SenseiDock />
      {replayHeld && <SpeedOverHold spec={speedSpec} />}
    </div>
  );
}

