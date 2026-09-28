// Battle: spelling is spellcasting. Hear a word and spell it sound by sound while the child's ninja (src/ui/Ninja.tsx)
// fights the monster: every correct sound is a hit that travels and lands (kicks, spells, shuriken). The move starts
// as the pure sound ends, so its whooshes and thwacks never sit on the sound the child earned. When the word is
// blended, the letters light one by one; then, as the whole word is said, each sound flies from its slot into the
// ninja's hands as a glowing orb, and the finisher carries that power into the monster.
// First-try answers build the streak (src/engine/streak.ts): auras, flames, bigger moves, and at the super tier bosses
// take combos. A tier-up always comes with a word's finisher (never in the middle of spelling a word): the word's held
// hits show as pale flames that light as the finisher goes, and however many tiers they cross there is one power-up and
// one line (the top tier's), heard in full in place of the praise. While a pure sound plays, audio.ts ducks sound
// effects right down, so the sound the child earned is always heard clean. Mistakes get a gentle "hm?" from the ninja,
// then "Keep going, ninja!" if a streak was lost, then specific correction ending on the model; in Gem Trials they also
// let the monster charge, and a monster attack is the only time the ninja is hurt. Layout contract (docs/HERO.md): the ninja stands bottom-left,
// Sensei's Help button bottom-right, the monster above Sensei's corner, and the letter tiles between x 340 and 1100,
// drawn above the ninja, so a lunge never hides a letter.
// The teacher's voice (docs/TEACHER_SCRIPT.md §3.18, §3.24, §4.1, §4.2, §4.4; mechanics §6.4): every battle opens with
// its game's frame in the form the child's ledger gives (narrate.tsx gameForm: full, recap, short). The first Monster
// Battle is framed by comparison with Word Building and gets a narrated demo on the monster's first word: the child taps
// Sensei's word card, the paw zaps the first sound, and the child finds the last one ("I start, you finish"). The
// letters stay dim and can't be tapped until the Ready hold's ▶ in the right-hand column (holdReady), which is also the
// starting gun of every recap, boss and gem battle (the purple bar starts only then); a battle's short form wakes the
// letters as its one line ends. Words are asked "Your word is… [am]", then "Here's your next word…", then the word
// alone (the stems fade). Hearts are explained when the first one is lost; "Every monster you beat helps us win back
// the sounds." at the first win (once per save).
// Fast and slow (TEACHER_SCRIPT §9.3): the first word zapped in a session is read back the slow way (the tiles' sounds,
// the tortoise stepping), and the child's tap on the rabbit is the finishing zap; the 3rd and 5th read-backs are
// Sensei's pair; a gem battle has neither (only the badges, the stuck recap and the idea in its first praise slot).
// Sounds (docs/SOUND_DISPLAY.md): a tile's sound and the read-back are "tile" jobs (the lit tiles show them); every sound
// Sensei names in a correction, Help's "Let me show you…" or a reminder pops as a petal above its tile or slot.
// Navigation (docs/NAVIGATION.md §5.D): Home is the nav layer's (top-left). "Hear the word" beside the card is the
// screen's Hear it again: during play it says the question (on the first word of a short form, which has no hold, the
// frame first); during a Ready hold the hold's own speaker says the frame and the question; during a join-in of the
// demo, the invitation. A Gem Trial's monster doesn't charge while it
// plays, while the phone is upright, or while a confirm question is up.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import type { Word, PhonemeId } from "../content/phonics";
import { MONSTER_INFO, TRICK_LEVEL, worldOf } from "../content/worlds";
import { say, sayBlend, sfx, playMusic, preload, urls, hush, load, isSpeaking, type Say, type SoundAt } from "../engine/audio";
import { chooseWords, tileBank, pick, shuffle } from "../engine/learner";
import { WORD_BY_TEXT } from "../content/phonics";
import { recordSpell, recordWordSpelt, useSave, store, ENERGY_FULL } from "../engine/store";
import { trialWords, gemByKey } from "../engine/gems";
import { FAST } from "../engine/fast";
import { streak, useStreak, tierOf, streakLine, type Tier } from "../engine/streak";
import { STRETCHED } from "../content/stretch";
import { GemIcon } from "../ui/Gem";
import { BARON_TAUNTS, BOSS_CAPTIONS, LINES } from "../content/lines";
import { SenseiDock, Tile, TapHint, img, Hearts, fx, fxDom, stageRect, sleep, shakeStage, useIdlePrompt, useHelp, useBaronOnScreen, useUpright } from "../ui/ui";
import { WordCardAgain } from "./Dojo";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { useKeyTiles } from "../ui/keys";
import { adjacentSlots, adjacentUnit, type FsReadback } from "../content/narrative";
import { openingLines, levelWrap, GAMES, type GameId } from "../content/games";
import {
  NarrOverlay, SlotPointer, afterWordSay, beginLevel, correctionFor, explain, framed, fsHeardThisSession, fsIdea, fsPair, fsPraise, fsReadback, fsSaid, fsStuckSay, gameForm, heard, isDue,
  lettersReminder, onceInSave, played, readyAsk, revealsNow, spellingHelp, struggledIn, twoSoundsReminder,
} from "./narrate";
import { useLessonClock } from "../engine/lessonClock";
import { useNav, ReplayButton, TopBar, holdReady, readyTap, navLog, navSpeed, rabbitTap, NAV_SLOTS } from "../ui/nav";
import { petalColour } from "../ui/petal";
import { useConfirmOpen } from "../ui/Confirm";
import { speak, clipsFor } from "../engine/speech";
import "../styles/battle.css";

const HAS = new Set(LINES.map((l) => l.id));
const L = (id: string) => HAS.has(id);

/** One part of a battle's intro, kept for the first word's Hear it again: what was said, and what showed with it
 *  (`bar`: the purple bar glows; `hp`: the monster's health bar glows; `row`: the letter row glows). */
type IntroPart = { say: Say[]; bar?: boolean; hearts?: boolean; hp?: boolean; row?: boolean };
/** Where a battle is in its introduction: the frame, Sensei's demo, the Ready hold, or play (the letters awake). */
type Phase = "intro" | "demo" | "hold" | "play";
/** A join-in during Sensei's demo (TEACHER_SCRIPT §3.18): the word card, or the last sound's tile. */
type Join = { kind: "card" } | { kind: "tile"; g: string };
/** The demo paw's fingertip in the pointing hand (TapHint: 110 px, the finger's tip near its top); `down`: the hand
 *  turned over, pointing down from above (at a letter, so it never covers it). */
const PAW_TIP = { x: 53, y: 12 };
const PAW_TIP_DOWN = { x: 57, y: 98 };

/** The first Monster Battle's demo word goes first (TEACHER_SCRIPT §3.18: Sensei zaps "at", the child's word is "am"):
 *  the easiest word (fewest sounds, one-letter spellings; "at" if it is there), then "am" if it is there. The demo word
 *  is one of the monster's words: its finisher takes the first health pip. */
function demoFirst(ws: Word[]): Word[] {
  if (ws.length < 2) return ws;
  const ease = (w: Word) => w.segs.length * 10 + w.segs.filter((s) => s.g.length > 1).length * 5 + (w.text === "at" ? -5 : 0);
  const d = ws.reduce((a, b) => (ease(b) < ease(a) ? b : a));
  if (d.segs.length < 2) return ws;
  const rest = ws.filter((w) => w !== d);
  const am = rest.findIndex((w) => w.text === "am");
  if (am > 0) rest.unshift(...rest.splice(am, 1));
  return [d, ...rest];
}

const MAX_HEARTS = 3;
/** The letter row sits between the ninja zone and the help zone. */
const ROW_L = 340;
const ROW_R = 1100;
/** Centre of the picture card and the sound slots. */
const TOP_CX = 636;
/** The monster's feet: on the ground, above Sensei's corner and the letter row. */
const MON_FEET = 574;
/** Where a blasted-off Baron Muddle vanishes, and pops back up to shake his fist (his caption bubble points here). */
const SKY = { x: 1150, y: 150 };
/** The Ready hold's column (the paw, the speaker and ▶, NAV_SLOTS.column) stands where the monster does: while it holds,
 *  the monster steps in towards the ninja until its right edge is this far left of the column's widest button (▶). */
const HOLD_RIGHT = Math.min(...Object.values(NAV_SLOTS.column).map((s) => s.x - s.d / 2)) - 22;
/** A taunt from Baron Muddle after a boss word: now and then, never two words running, never right after he roars. */
const TAUNT_CHANCE = 0.2;

type Pt = { x: number; y: number };


/** Size the letter tiles so the row fits between the zones, as big as possible: 90 stage px is about 44 px on a phone.
 *  A tile is --size wide at least; longer spellings grow with their letters (widths measured in the letter font). */
const glyph = (c: string) => ("mw".includes(c) ? 0.84 : "iljtfr".includes(c) ? 0.36 : 0.56);
const tileW = (g: string, px: number) => Math.max(px, [...g].reduce((s, c) => s + glyph(c), 0) * 0.62 * px + 42);
function rowFit(tiles: string[]): { px: number; gap: number } {
  const room = ROW_R - ROW_L - 12;
  for (const [px, gap] of [[104, 14], [96, 10], [90, 8], [84, 6], [80, 6]]) if (tiles.reduce((s, g) => s + tileW(g, px), 0) + gap * (tiles.length - 1) <= room) return { px, gap };
  return { px: 76, gap: 4 };
}

// ---------------------------------------------------------------- moves
/** A sound's hit: quick moves that land within about half a second of the sound ending, so a hit is over before the
 *  child's next sound (the slow, showy spells and somersaults are the word's finisher). Never one of the last two. */
const TAP_MOVES: Record<Tier, Move[]> = { 0: ["kick", "punch", "throw"], 1: ["kick", "punch", "throw", "jump"], 2: ["kick", "throw", "punch", "spin"], 3: ["kick", "spin", "throw", "punch"] };
const tapRecent: Move[] = [];
function tapMove(tier: Tier): Move {
  const pool = TAP_MOVES[tier].filter((m) => !tapRecent.includes(m));
  const m = pool[(Math.random() * pool.length) | 0] ?? TAP_MOVES[tier][0];
  tapRecent.push(m);
  if (tapRecent.length > 2) tapRecent.shift();
  return m;
}
/** The move that finishes a word, by streak tier (never the same twice running). */
const FINISH: Record<Tier, Move[]> = { 0: ["cast", "kick"], 1: ["cast", "kick", "punch"], 2: ["kick", "cast", "flip"], 3: ["flip", "cast", "kick", "spin"] };
/** Bosses at the super tier take a combo; at the master tier, a three-hit combo. */
const COMBO: Move[][] = [["punch", "kick"], ["spin", "cast"], ["throw", "flip"], ["jump", "kick"], ["kick", "spin"]];
const COMBO3: Move[][] = [["punch", "spin", "kick"], ["throw", "kick", "cast"], ["jump", "spin", "flip"], ["punch", "flip", "cast"]];
function pickNot<T>(list: T[], last: { current: string }): T {
  const pool = list.filter((m) => JSON.stringify(m) !== last.current);
  const m = pool[(Math.random() * pool.length) | 0] ?? list[0];
  last.current = JSON.stringify(m);
  return m;
}

// ---------------------------------------------------------------- little effects (stage coordinates, in the fx layer)
const centre = (el: Element | null | undefined): Pt => {
  const r = stageRect(el ?? null);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};
/** A point on the ninja at rest (as Ninja.tsx measures it): fw = fraction of its width from its left edge, fh =
 *  fraction of its width above its feet, plus a stage-px offset (a move's lunge or leap at that moment). */
function onNinja(fw: number, fh: number, dx = 0, dy = 0): Pt {
  const r = stageRect(document.querySelector(".ninja-spot"));
  const g = r.w ? { x: r.x, y: r.y + r.h, w: r.w } : { x: 40, y: 702, w: 250 };
  return { x: g.x + g.w * fw + dx, y: g.y - g.w * fh + dy };
}
/** Just above the ninja's open palm in the cast pose, where a spell is held (stage px). */
const ninjaHands = () => onNinja(0.93, 0.64);
const lerp = (a: Pt, b: Pt, e: number): Pt => ({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e });
/** A point on one of the ninja's ribbon swooshes (a circle squashed vertically, as Ninja.tsx draws them). */
const onRibbon = (c: Pt, r: number, squash: number, deg: number): Pt => ({ x: c.x + r * Math.cos((deg * Math.PI) / 180), y: c.y + r * Math.sin((deg * Math.PI) / 180) * (1 - squash) });
/** Move an fx element (S px square) along a path, with an optional glowing trail (fx.trail: one glow every 18 stage px
 *  travelled, whatever the frame rate: docs/PERF.md fix 7). Resolves on arrival. */
function glide(el: HTMLElement, S: number, path: (t: number) => Pt, ms: number, scale: (t: number) => number, trail?: string[], fade?: boolean): Promise<void> {
  const t0 = performance.now();
  let t = 0;
  const lay = trail && fx.trail(trail, { every: 18, n: 2, size: 40, drift: 0.5, life: 16 });
  return new Promise((resolve) => {
    const frame = (now: number) => {
      t = Math.min(1, ((now - t0) * FAST) / ms);
      const p = path(t);
      el.style.transform = `translate(${p.x - S / 2}px, ${p.y - S / 2}px) scale(${scale(t)})`;
      if (fade) el.style.opacity = `${1 - t}`;
      if (lay) lay(p);
      if (t < 1 && el.isConnected) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}
function addFx(cls: string, w: number, h: number, html = ""): HTMLDivElement | null {
  const layer = fxDom();
  if (!layer) return null;
  const d = document.createElement("div");
  d.className = cls;
  d.style.width = `${w}px`;
  d.style.height = `${h}px`;
  d.innerHTML = html;
  layer.appendChild(d);
  return d;
}
const gone = (a: Animation | undefined, el: Element) => a?.finished.then(() => el.remove(), () => el.remove()) ?? el.remove();
const STAR4 = `<svg viewBox="0 0 100 100"><path d="M50 2 L60 40 L98 50 L60 60 L50 98 L40 60 L2 50 L40 40 Z" fill="#fff8d0" stroke="#2b1d14" stroke-width="6" stroke-linejoin="round"/></svg>`;
/** A spinning star of light flying along an arc (a sound becoming power). Resolves on arrival. */
function dot(a: Pt, b: Pt, ms: number, colors: string[]): Promise<void> {
  const S = 54;
  const el = addFx("bt-spark", S, S, STAR4);
  if (!el) return Promise.resolve();
  // drop out of the slot first, then swoop across to the hands (never across the other slots)
  const c = { x: a.x - (a.x - b.x) * 0.22, y: Math.max(a.y, b.y) + 30 };
  const t0 = performance.now();
  const lay = fx.trail(colors, { every: 20, n: 2, size: 40, drift: 0.6, life: 16 });
  return new Promise((resolve) => {
    const frame = (now: number) => {
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      const e = t * t * (3 - 2 * t);
      const x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * c.x + e * e * b.x;
      const y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * c.y + e * e * b.y;
      el.style.transform = `translate(${x - S / 2}px, ${y - S / 2}px) rotate(${t * 400}deg) scale(${1.1 - t * 0.45})`;
      lay({ x, y });
      if (t < 1 && el.isConnected) requestAnimationFrame(frame);
      else {
        el.remove();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
/** The health pip breaks into shards. */
function shatter(el: Element | null | undefined) {
  if (!el) return;
  const c = centre(el);
  for (let i = 0; i < 7; i++) {
    const d = addFx("bt-shard", 16, 16);
    if (!d) return;
    const a = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
    const r = 46 + Math.random() * 40;
    gone(
      d.animate(
        [
          { transform: `translate(${c.x - 8}px, ${c.y - 8}px) rotate(0deg) scale(1)`, opacity: 1 },
          { transform: `translate(${c.x - 8 + Math.cos(a) * r}px, ${c.y - 8 + Math.sin(a) * r * 0.6 + 70}px) rotate(${Math.random() * 600 - 300}deg) scale(.5)`, opacity: 0 },
        ],
        { duration: 700, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" },
      ),
      d,
    );
  }
  fx.ring(c.x, c.y, { color: "#ff9a8a", r0: 10, r1: 70, width: 8, life: 16 });
  fx.twinkle(c.x, c.y, ["#fff4dc", "#ff9a8a"], 6, 5, 20);
}
/** "Ding!": the twinkle where a blasted-off monster vanishes into the sky. */
function ding(p: Pt) {
  const S = 120;
  const d = addFx("bt-ding", S, S, STAR4);
  if (!d) return;
  const at = (s: number, r: number) => `translate(${p.x - S / 2}px, ${p.y - S / 2}px) rotate(${r}deg) scale(${s})`;
  gone(d.animate([{ transform: at(0, 0) }, { transform: at(1.25, 60), offset: 0.3 }, { transform: at(0.9, 90), offset: 0.6 }, { transform: at(0, 180) }], { duration: 700, easing: "ease-out", fill: "forwards" }), d);
  fx.twinkle(p.x, p.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 12, 6, 24);
  sfx.twinkle();
}
/** Push the monster back (and tilt it) when something lands. */
const knockAnims = new WeakMap<Element, Animation>();
function knock(el: Element | null | undefined, px: number, tilt: number) {
  if (!el) return;
  knockAnims.get(el)?.cancel();
  const a = el.animate(
    [
      { translate: "0 0", rotate: "0deg" },
      { translate: `${px}px ${-px * 0.18}px`, rotate: `${tilt}deg`, offset: 0.22, easing: "ease-out" },
      { translate: `${-px * 0.12}px 0`, rotate: `${-tilt * 0.3}deg`, offset: 0.68, easing: "ease-in-out" },
      { translate: "0 0", rotate: "0deg" },
    ] as Keyframe[],
    { duration: 320 + px * 6 },
  );
  knockAnims.set(el, a);
}

/** Squash-and-flash the monster sprite as a hit lands (like the ninja's own impact reaction, keeping its shadow). */
function squash(el: Element | null | undefined, tier: Tier, big = false) {
  const k = (big ? 1.5 : 1) * (1 + tier * 0.2);
  const shade = "drop-shadow(0 10px 8px rgba(43, 29, 20, 0.28))";
  el?.animate(
    [
      { scale: "1", filter: `brightness(1) ${shade}` },
      { scale: `${1 + 0.14 * k} ${1 - 0.13 * k}`, filter: `brightness(${big ? 2.3 : 1.8}) ${shade}`, offset: 0.18 },
      { scale: `${1 - 0.06 * k} ${1 + 0.07 * k}`, filter: `brightness(1.2) ${shade}`, offset: 0.45 },
      { scale: "1.03 .97", offset: 0.7 },
      { scale: "1", filter: `brightness(1) ${shade}` },
    ] as Keyframe[],
    { duration: big ? 560 : 440, easing: "ease-out" },
  );
}

/** The cartoon "cross" mark by an angry head. Its throb (bt-vein) is on this HTML wrapper: an animation on the SVG itself
 *  would be repainted on the main thread every frame. */
function Vein() {
  return (
    <span className="bt-vein" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <g fill="none" strokeLinecap="round">
          {[0, 1].map((k) => (
            <g key={k} stroke={k ? "#ff4a36" : "#2b1d14"} strokeWidth={k ? 11 : 21}>
              <path d="M38 8 Q40 36 10 38" />
              <path d="M62 8 Q60 36 90 38" />
              <path d="M38 92 Q40 64 10 62" />
              <path d="M62 92 Q60 64 90 62" />
            </g>
          ))}
        </g>
      </svg>
    </span>
  );
}

export function Battle({ level, onDone, onQuit }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render)
  const boss = level.kind === "boss";
  const info = MONSTER_INFO[level.monster!];
  const world = worldOf(level);
  const relaxedSetting = useSave((s) => s.settings.relaxed);
  // Time pressure only exists in Gem Trials, which a child unlocks by filling a gem with practice.
  const trialKey = level.trialGem;
  const baronHere = level.monster === "boss_baron";
  /** The Baron's balloon escape after the first win at the Sky Temple (docs/fix-requests.md, "Baron final only"):
   *  0 none, 1 risen in at the top right (he is on screen, so no cut-in), 2 drifting up and away. */
  const [balloon, setBalloon] = useState<0 | 1 | 2>(0);
  useBaronOnScreen(baronHere || balloon === 1);
  /** A boss's own words (BOSS_CAPTIONS): its caption bubble, shown whatever the captions setting (it is its only voice). */
  const [bossLine, setBossLine] = useState<string | null>(null);
  const beatenSaid = useRef<Promise<void> | null>(null);
  const timed = !!trialKey && !relaxedSetting;
  const relaxed = !timed;
  const firstTimed = useRef(timed && !store.get().seenTimer).current;
  const upright = useUpright();
  const confirmOpen = useConfirmOpen(); // a confirm question (Home's "leave?") holds the bar too
  const { tier } = useStreak();
  const [explainBar, setExplainBar] = useState(false);
  const [heartsPulse, setHeartsPulse] = useState(false);
  // the game (games.ts) and the form its introduction takes today (TEACHER_SCRIPT §2.2), read once as the level opens
  const gameId: GameId = level.id === "review" ? "review" : trialKey ? "trial" : boss ? "boss" : "battle";
  const [form] = useState(() => gameForm(gameId, { opening: true }));
  const [demoOn] = useState(() => gameId === "battle" && form === "full" && !!GAMES.battle.full.show && L("tv_battle_card"));
  const [words] = useState<Word[]>(() => {
    const ws = trialKey
      ? trialWords(trialKey, info.hp)
      : level.words
        ? shuffle(Array.from({ length: info.hp }, (_, k) => WORD_BY_TEXT[level.words![k % level.words!.length]]))
        : chooseWords(level, info.hp, "spell", { maxLen: boss ? 6 : 5 });
    return demoOn ? demoFirst(ws) : ws;
  });
  /** The first word the child spells (after the demo's word, on the first Monster Battle). */
  const firstIdx = demoOn && words.length > 1 ? 1 : 0;
  const [phase, setPhase] = useState<Phase>("intro");
  const [rowGlow, setRowGlow] = useState(false); // "the letter row glows, but stays dim"
  const [hpLook, setHpLook] = useState(false); // the monster's health bar glows while Sensei talks about it
  const [paw, setPaw] = useState<(Pt & { down: boolean }) | null>(null); // the demo paw: where its box goes (stage px)
  const [join, setJoin] = useState<(Join & { glow: boolean }) | null>(null);
  /** The join-in waiting now: `done` answers it (the child's tap, or the paw's); `again` is Hear it again and Help, which
   *  say its invitation once more (they never answer it). */
  const joinRef = useRef<(Join & { done: (how: "child" | "paw", el?: HTMLElement) => void; again: () => Promise<unknown> }) | null>(null);
  const [reveal, setReveal] = useState(-1); // the slot whose right tile glows after a correction that reveals it
  const [cueSlot, setCueSlot] = useState(false); // the line being filled glows while Sensei talks about it ("…What can you hear here?")
  const helped = useRef(false); // Help's second or third press on this word
  const struggle = useRef<boolean[]>([]); // per child word: the second-miss help or Help's second press (TEACHER_SCRIPT §2.2)
  const questions = useRef<Record<number, Say[]>>({}); // what each word was asked with, for Hear it again
  const tellOnAnswer = useRef(false); // a recap with no Ready hold counts as told at the first answer
  const heldReady = useRef(false); // the Ready hold was answered (its speaker said the frame again; play's says the question)
  const hpMax = words.length;
  // never strand a child in a battle with nothing to spell: go back to the map
  useEffect(() => {
    if (!words.length) onQuit();
  }, []);
  const [idx, setIdx] = useState(0);
  const timeUp = useLessonClock(level);
  const [hp, setHp] = useState(hpMax);
  const [chip, setChip] = useState(0); // sounds that have landed on this word: they wear its health pip down
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [dead, setDead] = useState(false);
  const [ko, setKo] = useState(false); // knocked out: the health bar goes as the monster blasts off
  const [gemFlown, setGemFlown] = useState(false);
  const [hot, setHot] = useState(false); // the charge bar is over three quarters full
  const [blasted, setBlasted] = useState(false); // the monster has blasted off out of sight: its endless effects stop
  const [filled, setFilled] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [lit, setLit] = useState(-1);
  const [locked, setLocked] = useState(true);
  const [enraged, setEnraged] = useState(false);
  const [dizzy, setDizzy] = useState(0);
  const misses = useRef(0);
  const wordMisses = useRef(0);
  /** The last word (its idx) with fast and slow talk: Move 1, the idea, the fast/slow praise or Sensei's pair. The next
   *  word has none (castSpell), so the talk is never on two words running. */
  const fsWord = useRef(-9);
  const slotMisses = useRef(0); // misses on the current slot: 1st → listen again, 2nd → show
  const knockouts = useRef(0);
  /** Correct taps waiting for their sound to finish: `hits` first-try answers for the streak, `chips` hits on the
   *  monster. `seq` counts taps, so a tap that cuts a sound short carries its hit instead. A word's last sound is
   *  counted as its finisher goes, so a power-up never plays over the blending. */
  const pend = useRef({ seq: 0, hits: 0, chips: 0 });
  const [pendN, setPendN] = useState(0); // the held first-try answers, shown as pale flames
  const hold = (n: number) => {
    pend.current.hits = n;
    setPendN(n);
  };
  const tierWait = useRef<Promise<void> | null>(null); // a tier-up still playing out (its line, its power-up)
  const tFinish = useRef(0); // when the child tapped a word's last sound (a word's drama is kept short after it)
  const lastDrama = useRef<"" | "grr" | "taunt">(""); // Baron Muddle's cut-in after the previous boss word
  const [sky, setSky] = useState(0); // Baron Muddle, blasted off: 1 shaking his fist in the sky, 2 bonked away, 3 gone
  const skyRef = useRef<HTMLDivElement>(null);
  const lastFinish = useRef("");
  const alive = useRef(true);
  const idxRef = useRef(0);
  idxRef.current = idx;
  const monPos = useRef<HTMLDivElement>(null); // entrance, attack lunge, blast-off
  const monHit = useRef<HTMLDivElement>(null); // knockbacks and taunts
  const monRef = useRef<HTMLImageElement>(null); // what the ninja aims at
  const gemRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const word = words[idx];
  const bank = useRef<Record<number, string[]>>({});
  if (word && !bank.current[idx]) bank.current[idx] = tileBank(word, level, level.distractors ?? (boss ? 4 : 3));
  const tiles = word ? bank.current[idx] : [];

  const monScale = 1 + ((info.scale ?? 1) - 1) * 0.8;
  const monH = Math.round(286 * monScale);
  const monW = Math.round(monH * 1.18);
  const monCx = boss ? 1040 : 1020;
  /** Where the ninja's hits land: the monster's front, upper chest. (That keeps impacts above Sensei's caption bubble,
   *  which sits over the monster's feet when captions are on, and spells arcing under the sound slots.) */
  const aim = (): Pt => {
    const r = stageRect(monRef.current);
    return r.w ? { x: r.x + r.w * 0.4, y: r.y + r.h * 0.42 } : { x: monCx - 60, y: MON_FEET - monH * 0.58 };
  };
  /** During the Ready hold (FIX_PLAN verify round 1, D2): the monster (its shadow, and a Gem Trial's gem) steps in
   *  towards the ninja, just clear of the column, and the caption bubble sits in the open ground left of it (battle.css
   *  `.bt-hold`). `dx` is the step (0 or less), `x0` the monster's left edge after it. The sprite is centred in its box, as
   *  wide as its picture at monH (at most monW). Everything aims at the sprite's own box, so the paw's replay lands. */
  const holdStep = (): { dx: number; x0: number } => {
    const el = monRef.current;
    const w = el?.naturalWidth ? Math.min(monW, (monH * el.naturalWidth) / el.naturalHeight) : monW;
    const dx = Math.min(0, Math.round(HOLD_RIGHT - (monCx + w / 2)));
    return { dx, x0: Math.round(monCx + dx - w / 2) };
  };

  // ---- intro: the monster drops in (flyers swoop in), the ninja shouts, Sensei frames the game (TEACHER_SCRIPT §3.18)
  /** What the frame said (and showed), for Hear it again on the child's first word. */
  const intro = useRef<IntroPart[]>([]);
  const part = (p: IntroPart) => void intro.current.push(p);
  /** Say one part of the frame with what shows with it (the purple bar, the health bar or the letter row glowing, the
   *  hearts pulsing). Resolves as say() does. */
  const showPart = async (p: IntroPart) => {
    if (p.bar) setExplainBar(true);
    if (p.hp) setHpLook(true);
    if (p.row) setRowGlow(true);
    if (p.hearts) setHeartsPulse(true);
    try {
      return await say(p.say);
    } finally {
      if (alive.current) {
        setExplainBar(false);
        setHpLook(false);
        setRowGlow(false);
        setHeartsPulse(false);
      }
    }
  };
  /** The frame's parts on today's form (games.ts openingLines): the full form's frame, a recap's or short form's line. A
   *  gem battle with no timer (the grown-ups' relaxed setting) says what it is, and nothing about a bar. */
  const openingParts = (): IntroPart[] => {
    let lines = openingLines(GAMES[gameId], form).filter(L);
    if (gameId === "trial" && relaxed) lines = L("tv_trial_frame") ? ["tv_trial_frame"] : [];
    return lines.map((id, k) => ({
      say: [...(k ? [{ gap: 250 } as Say] : []), { line: id }],
      bar: id === "tv_trial_bar",
      hp: id === "tv_boss_frame",
      row: id === "tv_battle_frame" || id === "tv_review_how",
    }));
  };
  /** The Ready hold's question on today's form (narrate.tsx readyAsk: the game's own, a recap's or a boss's starting
   *  gun), or null: a Monster Battle's short form has no hold (its letters wake as its line ends). With no timer, a gem
   *  battle's "The bar starts when you're ready." is "Are you ready to zap it?". */
  const readyFor = (): { line: string; once?: "ready:first" | "ready:paw" } | null => {
    const r = readyAsk(gameId, form);
    if (!r) return null;
    const line = gameId === "trial" && relaxed ? "tv_battle_go" : r.line;
    return L(line) ? { ...r, line } : null;
  };
  useLayoutEffect(() => void streak.reset(), []);
  useEffect(() => {
    alive.current = true;
    playMusic(boss ? "boss" : "battle");
    // (the words only: a slow word is fetched when a miss may need it, not all of them up front: docs/PERF.md's decode
    // budget; a gapped slow clip decodes to about 300 KB)
    preload([...new Set(words.flatMap((w, k) => (k === firstIdx ? clipsFor("w_your_word", { word: w.text }) : k === firstIdx + 1 ? clipsFor("w_your_next_word", { word: w.text }) : [urls.word(w.text)])))]);
    enter();
    let live = true;
    const ok = () => live && alive.current;
    (async () => {
      await sleep(600);
      if (!ok()) return;
      if (boss && !trialKey) {
        // Baron Muddle's threat (the ninja stands on guard while he speaks); the ninja answers it by powering up as his
        // last words fade
        // (at the Sky Temple he introduces his Sky Magpie: he is fought only in the final battle, MIDGAME_ENDGAME R.3)
        const threat = level.monster === "boss_magpie" ? "baron_intro_sky_temple" : `baron_w${world.id}`;
        const said = say({ line: threat });
        const buf = await load(urls.line(threat));
        await Promise.race([said, sleep(Math.max(0, (buf ? (buf.duration * 1000) / FAST : 4000) - 400))]);
        if (!ok()) return;
        void ninja.act("power");
        await said;
        if (!ok()) return;
        await sleep(450); // Sensei speaks as the power-up's fanfare fades
        if (!ok()) return;
        const start = BOSS_CAPTIONS[level.monster!]?.start;
        if (start) {
          await bossSays(start);
          if (!ok()) return;
        }
      }
      // the frame: what the game is, and who does what, as the board arrives
      const parts = openingParts();
      for (const p of parts) {
        part(p);
        await showPart(p);
        if (!ok()) return;
      }
      if (gameId === "trial" && form === "full") store.set((s) => void (s.seenTimer = true));
      // adjacent consonants (units 8-10): a short spaced reminder before the first word (NARRATIVE_AUDIT F12)
      if (!trialKey && adjacentUnit(level.units) && adjacentSlots(words[firstIdx]?.segs ?? []).length > 1) {
        if (isDue("adjacent:remind", "concept")) part({ say: [{ gap: 200 }, { line: "audit_neighbours_short" }] });
        await explain("adjacent:remind", "concept", [{ gap: 200 }, { line: "audit_neighbours_short" }]);
        if (!ok()) return;
      }
      // the first Monster Battle: Sensei zaps the first word, with the child's two join-ins
      if (demoOn) {
        setPhase("demo");
        await demo(ok, false);
        if (!ok()) return;
      }
      // Ready? ▶ in the right-hand column (the letters fill the nav row); the letters wake on the answer
      const r = readyFor();
      if (r) {
        setPhase("hold");
        const again = () => say([...parts.flatMap((p) => p.say), { gap: 300 }, { line: r.line }]);
        const how = await holdReady(gameId, {
          ask: [{ line: r.line }],
          again,
          show: demoOn ? (l) => demo(() => l() && ok(), true) : undefined,
          at: "column",
        });
        if (!ok() || how === false) return;
        heldReady.current = true;
        if (form === "full" || form === "recap") framed(gameId, r);
      } else tellOnAnswer.current = form === "recap";
      setPhase("play");
      if (demoOn && firstIdx) {
        wordMisses.current = 0;
        setFilled([]);
        setReveal(-1);
        setIdx(firstIdx);
        await sleep(250); // (the new word's card and lines pop in)
        if (!ok()) return;
      }
      await ask(words[firstIdx], firstIdx);
    })();
    return () => {
      live = false;
      alive.current = false;
      joinRef.current?.done("paw");
      hush();
    };
  }, []);

  const enter = () => {
    const el = monPos.current;
    if (!el) return;
    const flyer = !!info.float;
    const T = flyer ? 700 : 640;
    el.animate(
      flyer
        ? [
            { transform: "translate(620px, -160px) scale(.6) rotate(12deg)", opacity: 0, easing: "cubic-bezier(.2,.8,.3,1)" },
            { transform: "translate(-34px, 12px) scale(1.05) rotate(-4deg)", opacity: 1, offset: 0.72, easing: "ease-in-out" },
            { transform: "none", opacity: 1 },
          ]
        : [
            { transform: "translateY(-760px) scale(.9, 1.1)", easing: "cubic-bezier(.55,0,.9,.55)" },
            { transform: "translateY(0) scale(1.16, .82)", offset: 0.7, easing: "ease-out" },
            { transform: "translateY(-30px) scale(.96, 1.05)", offset: 0.85, easing: "ease-in" },
            { transform: "none" },
          ],
      { duration: T, delay: 150, fill: "backwards" },
    );
    setTimeout(() => {
      if (!alive.current) return;
      if (flyer) sfx.whoosh();
      else {
        sfx.boom();
        shakeStage();
        fx.puff(monCx, MON_FEET, 16);
      }
      ninja.say();
    }, 150 + T * 0.7);
  };

  /** The question (TEACHER_SCRIPT §3.18): the child's first word "Your word is… [am]" (and on the first Monster Battle
   *  "What's the first sound?"); the second "Here's your next word… [sat]"; from the third, the word alone (the stems
   *  fade, SCRIPT_STYLE §5; a miss doesn't bring the stem back here: a battle's words come every 15 s or so, and the
   *  same stem three times in a minute is the repetition Jonas heard). */
  // (speech templates, docs/SPEECH_TEMPLATES.md: today they play their fallbacks, which are these same lines)
  const question = (w: Word, n: number): Say[] => {
    if (n === 0) return [...speak("w_your_word", { word: w.text }), ...(demoOn ? [{ gap: 600 } as Say, ...speak("w_next_q", { pos: "first" })] : [])];
    if (n === 1) return speak("w_your_next_word", { word: w.text });
    return [{ gap: 150 }, { word: w.text }];
  };
  const ask = async (w: Word, i: number) => {
    setLocked(true);
    const q = (questions.current[i] = question(w, i - firstIdx));
    await say(q);
    if (alive.current) setLocked(false);
  };
  // ---- Hear it again ("Hear the word" beside the card, and the card itself): the question; on the child's first word
  // of a battle with no Ready hold (a short form), the frame first, with what showed as it was said (the bar, the letters
  // glowing). The child may answer meanwhile (that stops it); a Gem Trial's monster waits while it plays. During a join-in
  // of Sensei's demo it says the invitation again (it never answers it: the card's own tap does).
  const [replaying, setReplaying] = useState(false);
  const replayTok = useRef(0);
  const hearWord = async () => {
    const j = joinRef.current;
    if (j) return void j.again();
    if (!word || locked || dead || phase !== "play") return;
    const my = ++replayTok.current;
    const at = idx;
    const live = () => alive.current && my === replayTok.current && idxRef.current === at;
    setReplaying(true);
    try {
      // (after a Ready hold the frame was the hold's to say again: here, only the question)
      for (const p of at === firstIdx && !heldReady.current ? intro.current : []) {
        const ok = await showPart(p);
        if (!ok || !live()) return;
        await sleep(200);
        if (!live()) return;
      }
      await say(questions.current[at] ?? question(word, at - firstIdx));
    } finally {
      if (my === replayTok.current) setReplaying(false);
    }
  };
  // The tortoise and the rabbit (TEACHER_SCRIPT §9.6) sit at the top left, right of Home: TS puts them "in the column"
  // on a column screen, but during play a battle's column is the monster's (the badges would run off the stage), and
  // beside the word card they would sit where "Let me show you… /m/" and the corrections pop their petals above the
  // lines. Here nothing else ever is (the hearts of a gem battle are above them), and the live rabbit fits too.
  // A card with no picture is its own speaker: while it is the demo's join-in (the child's tap), Hear it again stands in
  // the right-hand column instead, where the Ready hold's speaker comes next, and says the invitation again.
  const cardJoin = join?.kind === "card" && !word?.pic;
  useNav({ again: () => hearWord(), againAt: cardJoin ? "column" : "own", speed: { at: { x: 292, y: 118 }, liveAt: { x: 300, y: 138 } } });

  // ---- the first Monster Battle's demo (TEACHER_SCRIPT §3.18, mechanics §6.4, T13)
  const cardRef = useRef<HTMLDivElement>(null);
  const rowTile = (g: string): HTMLElement | null => rowRef.current?.querySelector(`[aria-label="${CSS.escape(g)}"]`) ?? null;
  const slotEl = (k: number): Element | null => slotRefs.current[k]?.firstElementChild ?? slotRefs.current[k] ?? null;
  /** The paw's fingertip to an element or a point; logged for the transcripts as the demo's paw. A letter tile is
   *  pointed at from above, the fingertip on its top edge, so the letter stays in sight; the card from below. */
  const movePaw = (to: Element | Pt | null, id: string, o: { down?: boolean } = {}) => {
    if (!to) return;
    let p: Pt;
    if (to instanceof Element) {
      const r = stageRect(to);
      p = o.down ? { x: r.x + r.w * 0.5, y: r.y + 6 } : { x: r.x + r.w * 0.62, y: r.y + r.h * 0.6 };
    } else p = to;
    const tip = o.down ? PAW_TIP_DOWN : PAW_TIP;
    setPaw({ x: p.x - tip.x, y: p.y - tip.y, down: !!o.down });
    navLog({ kind: "paw", id: `battle:${id}` });
  };
  /** A join-in: the card or the last tile waits for the child's tap (live from the line's first word; a tap cuts Sensei
   *  off). The tile glows 2 s after the line. If nothing comes, Sensei's paw does it after 12 s of quiet (it is her
   *  demo: the child is invited in, never made to answer). Hear it again and Help say the invitation again (the tile's
   *  with the word: "Can you find the last one? … at"), and the paw's wait starts over after it. */
  const joinIn = (j: Join, line: Say[], live: () => boolean) =>
    new Promise<{ how: "child" | "paw"; el?: HTMLElement }>((resolve) => {
      let over = false;
      let quiet = -1; // game ms of quiet since the invitation ended (-1: it is being said)
      const done = (how: "child" | "paw", el?: HTMLElement) => {
        if (over) return;
        over = true;
        if (joinRef.current?.done === done) joinRef.current = null;
        if (alive.current) setJoin(null);
        if (how === "child" && isSpeaking()) hush();
        resolve({ how, el });
      };
      const again = async () => {
        if (over) return;
        quiet = -1;
        if (j.kind === "tile") setJoin({ ...j, glow: true });
        await say(j.kind === "card" ? [{ line: "tv_battle_card" }] : [{ line: "tv_you_find_last" }, { gap: 300 }, { word: words[0].text }]);
        if (!over) quiet = 0;
      };
      joinRef.current = { ...j, done, again };
      setJoin({ ...j, glow: false });
      void (async () => {
        await say(line);
        if (over) return;
        quiet = 0;
        const STEP = 250;
        while (!over && live() && quiet < 12000) {
          await sleep(STEP);
          if (over || quiet < 0 || isSpeaking()) continue;
          quiet += STEP;
          if (j.kind === "tile" && quiet >= 2000) setJoin((c) => (c && !c.glow ? { ...c, glow: true } : c));
        }
        if (!over && live()) done("paw");
      })();
    });
  /** A tile lands on its line during the demo: it flies up, its sound plays (a tile's job: the tile shows it) unless
   *  Sensei has just named it, and the ninja zaps the monster as it ends (the zap wears the health pip down, except in
   *  the paw's replay). */
  const landTile = (k: number, g: string, from: Element | null, o: { sound?: PhonemeId; chip?: boolean }) => {
    setFilled((f) => [...f.slice(0, k), g]);
    flyToSlot(from, k, g);
    const said = o.sound ? say({ sound: o.sound, show: "tile" }) : sleep(260);
    return said.then(async () => {
      if (!alive.current) return;
      await ninja.strike(aim(), { move: tapMove(streak.tier), react: false });
      if (!alive.current) return;
      if (o.chip) chipHit(0, 1);
      else flinch(streak.tier);
    });
  };
  /**
   * Sensei zaps the monster's first word (words[0]): "I'll zap the first one. Tap my word card, and hear the word." (the
   * child's tap) · [at] · "The first sound is… /a/" (the paw taps < a >; it flies to its line; the zap; its bar drops) ·
   * "Zap! Look, its bar went down." (once per save) · "Can you find the last one?" (the child's tap) · /a/ /t/ [at] and
   * the finisher, which takes the first health pip. `replay` (the paw, during the Ready hold): the paw does both taps,
   * nothing is asked, and the monster's health isn't touched again.
   */
  const demo = async (live: () => boolean, replay: boolean) => {
    const w = words[0];
    const segs = w.segs;
    const last = segs.length - 1;
    if (replay) {
      setFilled([]);
      await sleep(300);
      if (!live()) return;
    }
    // the word card: the child's tap (or the paw's)
    let how: "child" | "paw" = "paw";
    if (!replay) how = (await joinIn({ kind: "card" }, [{ line: "tv_battle_card" }], live)).how;
    if (!live()) return;
    // the paw steps out of its corner (where Show me again lives), then goes where Sensei works
    const from = NAV_SLOTS.column.show;
    movePaw({ x: from.x - 30, y: from.y + 20 }, "start", { down: how === "child" });
    await sleep(60);
    if (how === "paw") {
      movePaw(cardRef.current, "card");
      await sleep(750);
      if (!live()) return void setPaw(null);
      sfx.tap();
    }
    await say({ word: w.text });
    if (!live()) return void setPaw(null);
    // the paw finds every sound but the last: Sensei names it (its petal pops above the tile), the paw taps it, the zap
    for (let k = 0; k < last; k++) {
      const el = rowTile(segs[k].g);
      movePaw(el, `tile:${segs[k].g}`, { down: true });
      await say([...(k === 0 && L("tv_first_is") ? [{ line: "tv_first_is" } as Say, { gap: 120 } as Say] : [{ gap: 200 } as Say]), { sound: segs[k].p, show: "petal", at: () => rowTile(segs[k].g) }]);
      if (!live()) return void setPaw(null);
      sfx.tap();
      await landTile(k, segs[k].g, el, { chip: !replay });
      if (!live()) return void setPaw(null);
    }
    setPaw(null);
    // the bar is explained the moment it moves (once per save)
    if (!replay && onceInSave("sym:bar") && L("tv_bar_down")) {
      setHpLook(true);
      const heardIt = await say([{ gap: 200 }, { line: "tv_bar_down" }]);
      if (alive.current) setHpLook(false);
      if (heardIt) heard("sym:bar");
      if (!live()) return;
    }
    // "I start, you finish": the last sound is the child's (the paw's, in the replay)
    const g = segs[last].g;
    let el: Element | null = rowTile(g);
    if (!replay) {
      const r = await joinIn({ kind: "tile", g }, [{ gap: 200 }, { line: "tv_you_find_last" }], live);
      if (!live()) return;
      if (r.how === "paw") {
        movePaw(el, `tile:${g}`, { down: true });
        await sleep(750);
        if (!live()) return void setPaw(null);
        sfx.tap();
      } else el = r.el ?? el;
    } else {
      movePaw(el, `tile:${g}`, { down: true });
      await sleep(750);
      if (!live()) return void setPaw(null);
      sfx.tap();
    }
    setPaw(null);
    tFinish.current = performance.now();
    setFilled((f) => [...f.slice(0, last), g]);
    flyToSlot(el, last, g);
    await castSpell(say({ sound: segs[last].p, show: "tile" }), { demo: replay ? "replay" : "first", live });
    // (after the paw's replay the ninja turns back to ▶ in its ready stance: the finisher's cast pose let it go)
    if (replay && live() && ninja.mounted) ninja.pose("ready", { face: "next" });
  };

  // ---- charge timer (Gem Trials: the monster attacks when full). Waits while the phone is held upright.
  // The bar's fill grows on the compositor (a transform animation to full, timed to the charge), so nothing is
  // re-rendered while it charges (docs/PERF.md: the whole battle used to re-render 60 times a second). chargeRef is the
  // charge while the bar is still; while it grows, `charging` holds when and from where, and chargeAt() reads it.
  const chargeRef = useRef(0);
  const barRef = useRef<HTMLElement>(null);
  const shown = useRef(0);
  type Charging = { from: number; t0: number; per: number; speed: number; anim: Animation | null };
  const charging = useRef<Charging | null>(null);
  const chargeAt = (c: Charging) => Math.min(1, c.from + ((performance.now() - c.t0) / c.per) * c.speed);
  /** Show the charge v on the bar (and its "hot" look over three quarters). */
  const paintCharge = (v: number) => {
    shown.current = v;
    if (barRef.current) barRef.current.style.transform = `scaleX(${v})`;
    setHot(v > 0.75);
  };
  /** Stop the bar where it is (a pause, a wrong tap, a hit): returns the charge, now in chargeRef. */
  const holdCharge = () => {
    const c = charging.current;
    if (!c) return chargeRef.current;
    charging.current = null;
    chargeRef.current = chargeAt(c);
    paintCharge(chargeRef.current);
    c.anim?.cancel();
    return chargeRef.current;
  };
  const setCharge = (v: number) => {
    holdCharge();
    paintCharge(v);
  };
  useLayoutEffect(() => {
    if (barRef.current && !charging.current) barRef.current.style.transform = `scaleX(${shown.current})`;
  });
  useEffect(() => {
    if (relaxed || locked || dead || upright || replaying || confirmOpen || phase !== "play") return;
    const per = (boss ? 7000 : 9000) + word.segs.length * 2200;
    const speed = (enraged ? 1.35 : 1) * (firstTimed ? 0.6 : 1);
    const from = chargeRef.current;
    const ms = ((1 - from) * per) / speed; // real time until it's full
    // (in real time, as the frame loop was, even in the bots' fast mode: fast.ts leaves a playbackRate of FAST alone)
    const anim = barRef.current?.animate([{ transform: `scaleX(${from})` }, { transform: "scaleX(1)" }], { duration: Math.max(1, ms * FAST), fill: "forwards" }) ?? null;
    if (anim) anim.playbackRate = FAST;
    const me: Charging = { from, t0: performance.now(), per, speed, anim };
    charging.current = me;
    // (setTimeout is FAST-scaled in fast mode: these are real times too)
    const hotT = window.setTimeout(() => charging.current === me && setHot(true), Math.max(0, ((0.75 - from) * per) / speed) * FAST + 1);
    const full = () => {
      if (charging.current !== me) return;
      charging.current = null;
      chargeRef.current = 1;
      paintCharge(1);
      anim?.cancel();
      monsterAttack();
    };
    const fullT = anim ? 0 : window.setTimeout(full, ms * FAST);
    anim?.finished.then(full, () => {});
    return () => {
      clearTimeout(hotT);
      clearTimeout(fullT);
      if (charging.current === me) holdCharge();
    };
  }, [relaxed, locked, idx, dead, enraged, upright, replaying, confirmOpen, phase]);

  /** The monster's attacks on the word now being spelt: the first sends the child back to listening with the plain word,
   *  a second models it the slow way (FS1: the child segments first; SPEECH_TEMPLATES w_listen_again). */
  const attacked = useRef({ idx: -1, n: 0 });
  const monsterAttack = async () => {
    setLocked(true);
    const a = attacked.current;
    const attempt = a.idx === idxRef.current ? ++a.n : ((attacked.current = { idx: idxRef.current, n: 1 }), 1);
    const listenAgain = (): Say[] => speak("w_listen_again", { word: word.text }, { slow: attempt > 1 });
    chargeRef.current = 0;
    setCharge(0);
    sfx.charge();
    // wind up, then lunge across to the ninja
    const n = stageRect(document.querySelector(".ninja-spot"));
    const m = stageRect(monRef.current);
    const dx = n.w && m.w ? n.x + n.w * 0.92 - (m.x + m.w * 0.22) : -560;
    const dy = n.h && m.h ? (n.y + n.h - (m.y + m.h)) * 0.7 : 90;
    const T = 1000;
    monPos.current?.animate(
      [
        { transform: "none", easing: "ease-in-out" },
        { transform: "translate(40px, 4px) scale(1.1, .88)", offset: 0.38, easing: "cubic-bezier(.5,0,.9,.6)" },
        { transform: `translate(${dx}px, ${dy}px) scale(1.12, .94)`, offset: 0.56, easing: "ease-out" },
        { transform: `translate(${dx * 0.92}px, ${dy}px) scale(1)`, offset: 0.66, easing: "cubic-bezier(.3,0,.3,1)" },
        { transform: "none" },
      ],
      { duration: T },
    );
    setTimeout(() => sfx.whoosh(), T * 0.38);
    await sleep(T * 0.56);
    // the only time the ninja gets hurt
    void ninja.act("hurt");
    sfx.hit();
    shakeStage();
    fx.burst(n.x + n.w * 0.7, n.y + n.h * 0.5, "stars", 14);
    const h = hearts - 1;
    setHearts(h);
    await sleep(T * 0.44 + 250);
    if (h <= 0 && trialKey) {
      // trial failed: gentle, and the gem keeps most of its energy (the next try's recap names the bar again)
      store.set((s) => void (s.energy[trialKey] = ENERGY_FULL * 0.6));
      heard(`trial-fail:${trialKey}`);
      played(gameId, { struggled: true });
      await say({ line: "trial_fail" });
      if (alive.current) onDone(0);
      return;
    }
    if (h <= 0) {
      knockouts.current++;
      await say({ line: "battle_oops" });
      setHearts(MAX_HEARTS);
      // help them succeed: the next tile glows, and Sensei says the whole word again and asks about the slot they're
      // on. Never the word's sounds one by one: that would spell it for them (NARRATIVE_AUDIT F29)
      setHelpLvl(3);
      await say(spellingHelp(word.text));
    } else if (trialKey && onceInSave("sym:heart") && L("tv_trial_heart")) {
      // the hearts are explained when the first one is lost (TEACHER_SCRIPT §4.2, once per save), then the word again
      setHeartsPulse(true);
      const ok = await say({ line: "tv_trial_heart" });
      if (alive.current) setHeartsPulse(false);
      if (ok) heard("sym:heart");
      setCueSlot(true);
      await say([{ gap: 250 }, ...listenAgain()]);
    } else {
      setCueSlot(true);
      await say([{ gap: 150 }, ...listenAgain()]);
    }
    if (alive.current) setCueSlot(false);
    if (alive.current) setLocked(false);
  };

  // ---- the letter the child tapped flies up into its slot
  const fit = rowFit(tiles);
  const flyToSlot = (from: Element | null | undefined, i: number, g: string) => {
    const to = slotRefs.current[i];
    if (!from || !to) return;
    const a = stageRect(from), b = stageRect(to);
    if (!a.w || !b.w) return;
    const d = addFx("tile bt-fly", a.w, a.h, `<span class="g"></span>`);
    if (!d) return;
    d.style.setProperty("--size", `${fit.px}px`);
    d.querySelector(".g")!.textContent = g;
    const k = b.h / a.h;
    const mid = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 60 };
    gone(
      d.animate(
        [
          { transform: `translate(${a.x}px, ${a.y}px) scale(1)` },
          { transform: `translate(${mid.x}px, ${mid.y}px) scale(${((1 + k) / 2) * 1.12})`, offset: 0.55 },
          { transform: `translate(${b.x + (b.w - a.w * k) / 2}px, ${b.y}px) scale(${k})` },
        ],
        { duration: 250, easing: "ease-in-out", fill: "forwards" },
      ),
      d,
    );
  };

  // ---- sounds land on the monster: it flinches and its health pip wears down
  const chipHit = (forIdx: number, n = 1) => {
    if (idxRef.current !== forIdx || !alive.current || n <= 0) return;
    setChip((c) => c + n);
    flinch(streak.tier);
  };
  /** The monster flinches from a hit (no damage: the paw's replay of the demo). */
  const flinch = (t: Tier) => {
    squash(monRef.current, t);
    knock(monHit.current, 16 + t * 5, 3);
  };
  /** Count the waiting first-try letters into the streak, as one event: however many tiers they cross, only the top one
   *  is celebrated (one power-up, one line). They are parts of an answer (Dec2): the flames light per letter, and the
   *  word counts as a whole answer (streak.answer(), in castSpell) before its finisher's count, so a tier line waits for
   *  real answers. A tier-up returns a promise for when it has played out. `quiet`: the power-up without its line (the
   *  winning word: "Hooray! The monster ran away!" is its praise, and two would stack). */
  const countHits = (o: { quiet?: boolean } = {}): Promise<void> | null => {
    const k = pend.current.hits;
    if (k <= 0) return null;
    hold(0);
    const e = streak.hit({ count: k, part: true, ...(o.quiet ? { line: false } : {}) });
    return e.tierUp ? ninja.linesDone() : null; // the power-up and its line, played out
  };
  // ---- a wrong letter: the monster bounces with glee (it never hurts the ninja for a mistake)
  const gloat = () => {
    monHit.current?.animate(
      [
        { translate: "0 0", scale: "1 1" },
        { translate: "0 -30px", scale: ".94 1.08", offset: 0.22, easing: "ease-in" },
        { translate: "0 0", scale: "1.08 .92", offset: 0.42, easing: "ease-out" },
        { translate: "0 -16px", scale: ".97 1.04", offset: 0.62, easing: "ease-in" },
        { translate: "0 0", scale: "1.04 .96", offset: 0.82 },
        { translate: "0 0", scale: "1 1" },
      ] as Keyframe[],
      { duration: 700 },
    );
  };

  /** A tile that isn't the one: it wobbles (no sound, no line: Sensei's demo carries on, the right one glowing). */
  const wiggle = (g: string) => {
    setWrong(g);
    window.setTimeout(() => alive.current && setWrong((w) => (w === g ? null : w)), 450);
  };
  const tap = async (g: string, el?: HTMLElement) => {
    // the demo's "Can you find the last one?": the child's tap is the join-in
    const j = joinRef.current;
    if (j) {
      if (j.kind === "tile" && g === j.g) j.done("child", el ?? rowTile(g) ?? undefined);
      else wiggle(g);
      return;
    }
    // a tile during the Ready hold: "I'm ready" (the question hasn't been asked, so it isn't an answer)
    if (readyTap({ label: g })) return;
    if (locked || !word || phase !== "play") return;
    const i = filled.length;
    const need = word.segs[i];
    const P = pend.current;
    const mySeq = ++P.seq;
    const myIdx = idx;
    if (g === need.g) {
      const first = slotMisses.current === 0;
      slotMisses.current = 0;
      recordSpell(need, wordMisses.current === 0);
      if (tellOnAnswer.current) {
        tellOnAnswer.current = false;
        framed(gameId); // (a recap with no hold is told at the child's first answer: TEACHER_SCRIPT §2.2)
      }
      const f = [...filled, g];
      setFilled(f);
      setReveal(-1);
      // the pure sound, heard clean (the tile shows it: it lights as it lands); a quick child's previous hit still lands,
      // silently, while it plays
      const said = say({ sound: need.p, show: "tile" });
      flyToSlot(el ?? rowRef.current?.querySelector(`[aria-label="${CSS.escape(g)}"]`), i, g);
      if (first) hold(P.hits + 1); // a pale flame, lit as its hit goes
      if (f.length === word.segs.length) {
        tFinish.current = performance.now();
        return castSpell(said);
      }
      P.chips++;
      // Every correct sound is a hit on the monster. The move (and its whooshes and thwacks) starts as the pure sound
      // ends, so the sound the child earned is heard clean; the letter flying into its slot is the instant feedback.
      await said;
      if (P.seq !== mySeq || idxRef.current !== myIdx || !alive.current) return; // a later tap carries this hit
      const chips = P.chips;
      P.chips = 0;
      void ninja.strike(aim(), { move: tapMove(streak.tier), react: false }).then(() => chipHit(myIdx, chips));
      // The streak counts as each hit goes, except a hit that would power the ninja up: that one (and the rest of the
      // word's) waits, as a pale flame, for the word's finisher, so a tier-up (its power-up and its line) never breaks
      // into spelling a word the child is holding in their head, and its line is the word's praise.
      if (streak.tier === tierOf(streak.n + P.hits)) countHits();
    } else {
      // a hit still waiting for its sound lands quietly (its sound was cut short); its streak count is dropped
      chipHit(myIdx, P.chips);
      P.chips = 0;
      hold(0);
      misses.current++;
      wordMisses.current++;
      recordSpell(need, false);
      setWrong(g);
      // No buzzer: the ninja's own gentle "hm?" (and, if a streak of 3 or more was lost, its flames fizzling out) is the
      // sound of a miss. The ninja reacts by itself when a streak was going; "Keep going, ninja!" is said here, before
      // the correction, so the model is the last thing the child hears.
      const e = streak.miss({ line: false });
      const lost = streakLine(e);
      if (e.prevN === 0) void ninja.act("think");
      gloat();
      if (!relaxed) chargeRef.current = Math.min(0.95, holdCharge() + 0.18);
      setLocked(true);
      slotMisses.current++;
      const attempt = slotMisses.current;
      if (attempt >= 2) struggle.current[idx - firstIdx] = true;
      // a second miss may model the word slowly: fetch its slow clip now (never all of them up front)
      if (STRETCHED.has(word.text)) preload([urls.stretch(word.text)]);
      // The correction (TEACHER_SCRIPT §5.4, SCRIPT_FIXES C5): a first miss goes back to listening (or fast and slow's
      // stuck recap, in turn), with the plain word; a second shows. A tile that splits a two-letter spelling gets "That's…
      // /s/ We need… /sh/ It's two letters, but it's one sound." on any miss, with the right tile glowing at once, and a
      // quick tap can't cut it off. Every sound it names pops as a petal: the tapped tile's above it, the one we need
      // above the line being filled.
      const shows = revealsNow(g, need, attempt);
      const split = shows && attempt <= 1;
      if (shows) setReveal(i);
      const tileAt: SoundAt = () => (el?.isConnected ? el : rowTile(g));
      const slotAt: SoundAt = () => slotEl(i);
      // Sensei's first word comes once the "hm?" and the fizzle are over, so it is clear.
      setCueSlot(true);
      await say(
        [{ gap: 450 }, ...(lost ? [{ line: lost }, { gap: 250 }] : []), ...correctionFor(g, need, word.text, attempt, bank.current[idx], { wrong: tileAt, slot: slotAt }, { game: gameId, item: word.text })],
        { reveal: shows, protect: split },
      );
      if (!alive.current) return;
      setCueSlot(false);
      setWrong(null);
      setLocked(false);
    }
  };

  /** The word's power. While each sound is said its letter lights (and a ring pulses out of it, so the eye stays on the
   *  letter). Then, as the whole word is said, every sound flies from its slot into the ninja's hands, where a
   *  glowing orb grows; the finisher carries it into the monster. */
  const chargeUp = () => {
    const hand = ninjaHands();
    const t = streak.tier;
    const S = 76;
    const cols = t >= 3 ? ["#ff5a5a", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"] : t === 2 ? ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"] : ["#ffe38a", "#ffc53d", "#fff4dc"];
    const at = (s: number) => `translate(${hand.x - S / 2}px, ${hand.y - S / 2}px) scale(${s})`;
    let orb: HTMLDivElement | null = null;
    let size = 0, got = 0;
    return {
      cols,
      ping(el: Element | null | undefined) {
        if (!el) return;
        const p = centre(el);
        fx.ring(p.x, p.y, { color: "#ffe38a", r0: 44, r1: 96, width: 7, life: 16 });
      },
      gather(els: (Element | null | undefined)[]) {
        if (orb) return;
        ninja.pose("cast");
        orb = addFx(`fx-orb t${t} bt-orb`, S, S, "<i></i><b></b>");
        if (orb) orb.style.transform = at(0);
        const n = els.length;
        els.forEach((el, k) => {
          if (!el) return;
          // from below the letter (under its sound dot), so neither the dot nor its ring covers a letter as the word is said
          const r = stageRect(el);
          const p = { x: r.x + r.w / 2, y: r.y + r.h + 26 };
          setTimeout(() => {
            fx.ring(p.x, p.y, { color: cols[0], r0: 14, r1: 46, width: 7, life: 16 });
            void dot(p, hand, 400, cols).then(() => {
              got++;
              const to = 0.36 + (0.54 * got) / n;
              orb?.animate([{ transform: at(size) }, { transform: at(to * 1.3), offset: 0.45 }, { transform: at(to) }], { duration: 240, easing: "ease-out", fill: "forwards" });
              size = to;
              fx.ring(hand.x, hand.y, { color: "#fff4dc", r0: 24, r1: 90, width: 7, life: 14 });
              fx.twinkle(hand.x, hand.y, cols, 5, 4, 20);
            });
          }, k * 70);
        });
      },
      /** The orb goes into the move: a spell grows out of it; a kick or punch takes it into the foot or fist (it flashes
       *  as the blow is thrown); a spin or flip whirls it round the ninja along the ribbon; a power-up absorbs it. */
      release(move: Move) {
        ninja.pose(null);
        const o = orb;
        orb = null;
        if (!o) return;
        o.getAnimations().forEach((a) => a.cancel());
        const s0 = size || 0.4;
        const flashAt = (p: Pt) => {
          fx.ring(p.x, p.y, { color: cols[0], r0: 8, r1: 100, width: 10, life: 16 });
          fx.glow(p.x, p.y, cols, 12, 50, 4, 20);
        };
        const tier = streak.tier;
        const w = stageRect(document.querySelector(".ninja-spot")).w || 250;
        let path: (x: number) => Pt;
        let ms: number;
        let end: Pt;
        const straight = (to: Pt) => (x: number) => lerp(hand, to, x * x);
        // the striking fist or foot, read from the sprite as it moves (fw, fh: where it is on the pose's picture)
        const sprite = document.querySelector(".ninja-spot .nj-img");
        const limb = (to: Pt, fw: number, fh: number) => (x: number) => {
          const r = stageRect(sprite);
          return lerp(hand, r.w && x > 0.5 ? { x: r.x + r.w * fw, y: r.y + r.h * fh } : to, x * x);
        };
        switch (move) {
          case "cast": {
            // the ninja's own spell charges in the same hands: this one melts into it
            const hold = onNinja(0.86, 0.74, -12, -10);
            void glide(o, S, (x) => lerp(hand, hold, x), 260, (x) => s0 * (1 + 0.4 * x), undefined, true).then(() => o.remove());
            return;
          }
          case "power":
            end = onNinja(0.5, 0.66, 0, 6);
            ms = 190;
            path = straight(end);
            break;
          case "kick":
            end = tier >= 2 ? onNinja(1, 0.5, 124, -112) : onNinja(1, 0.5, 118, -46);
            ms = tier >= 2 ? 250 : 165;
            path = limb(end, 0.93, 0.52);
            break;
          case "punch":
            end = onNinja(0.9, 0.8, 74, -4);
            ms = 150;
            path = limb(end, 0.95, 0.47);
            break;
          case "jump":
            end = onNinja(0.9, 0.8, 60, -158);
            ms = 400;
            path = straight(end);
            break;
          case "spin": {
            const c = onNinja(0.5, 0.66, 24, -30), r = w * 0.66, sq = 0.62;
            end = onNinja(0.95, 0.66, 42, -62);
            ms = 420;
            path = (x) => (x < 0.26 ? lerp(hand, onRibbon(c, r, sq, 160), x / 0.26) : x < 0.86 ? onRibbon(c, r, sq, 160 + (340 * (x - 0.26)) / 0.6) : lerp(onRibbon(c, r, sq, 500), end, (x - 0.86) / 0.14));
            break;
          }
          case "flip": {
            const c = onNinja(0.5, 0.66, 30, -100), r = w * 0.7, sq = 0.1;
            end = onNinja(0.9, 0.9, 30, -104);
            ms = 520;
            path = (x) => (x < 0.23 ? lerp(hand, onRibbon(c, r, sq, 60), x / 0.23) : x < 0.84 ? onRibbon(c, r, sq, 60 - (320 * (x - 0.23)) / 0.61) : lerp(onRibbon(c, r, sq, -260), end, (x - 0.84) / 0.16));
            break;
          }
          default:
            end = onNinja(0.9, 0.8, 46, -6);
            ms = 150;
            path = straight(end);
        }
        const trail = move === "spin" || move === "flip" ? cols : undefined;
        void glide(o, S, path, ms, (x) => s0 * (1 - 0.5 * x), trail).then(() => {
          o.remove();
          if (alive.current) flashAt(path(1));
        });
      },
    };
  };
  type Charge = ReturnType<typeof chargeUp>;

  /** The finisher (or a boss combo). `first` resolves when the first blow lands, `last` when the last one does:
   *  a combo's later blows land while Sensei (or the Baron) is already talking, so combos never slow the level. */
  const finisher = (final: boolean, power: Charge): { first: Promise<void>; last: Promise<void> } => {
    // the word's first-try answers count now: a tier-up's power-up waits for this move to land
    const flush = () => void (tierWait.current = countHits({ quiet: final }) ?? tierWait.current);
    if (final && boss) {
      // the boss's last word: power up (absorbing the word's orb), and at its peak a somersault volley of stars
      const last = (async () => {
        power.release("power");
        void ninja.act("power");
        await sleep(650);
        const p = ninja.act("flip", aim(), { react: false });
        flush();
        await p;
      })();
      return { first: last, last };
    }
    const t = streak.tier;
    const plan = boss && t >= 2 ? pickNot(t >= 3 ? COMBO3 : COMBO, lastFinish) : [pickNot(FINISH[t], lastFinish)];
    power.release(plan[0]);
    let firstLanded = () => {};
    const first = new Promise<void>((r) => (firstLanded = r));
    const last = (async () => {
      for (let k = 0; k < plan.length; k++) {
        const p = ninja.act(plan[k], aim(), { react: false });
        if (k === plan.length - 1) flush();
        await p;
        if (k < plan.length - 1) {
          squash(monRef.current, streak.tier);
          knock(monHit.current, 26, 5);
          sfx.hit();
          firstLanded();
        }
      }
    })();
    return plan.length > 1 ? { first, last } : { first: last, last };
  };

  /** The word's big hit: the word's power bursts on the monster in its colours, its health pip shatters, it reels. */
  const bigHit = (final: boolean, nhp: number, cols: string[]) => {
    const c = centre(monRef.current);
    const a = aim();
    sfx.hit();
    shakeStage();
    fx.ring(a.x, a.y, { color: cols[0], r0: 30, r1: 260, width: 16, life: 24 });
    fx.glow(a.x, a.y, cols, 16, 66, 5, 30);
    fx.burst(c.x, c.y, "stars", final ? 30 : 20, final ? 1.5 : 1.2);
    fx.burst(c.x, c.y, "blossoms", 10);
    if (final) fx.ring(c.x, c.y, { color: "#fff4dc", r0: 40, r1: 420, width: 18, life: 30 });
    shatter(pipRefs.current[nhp]);
    squash(monRef.current, streak.tier, true);
    knock(monHit.current, 48, 9);
    setHp(nhp);
    setChip(0);
    chargeRef.current = Math.max(0, holdCharge() - 0.35);
    setCharge(chargeRef.current);
    if (!final) setDizzy((d) => d + 1);
  };

  /**
   * The word is built: its read-back and the finisher. Which read-back (TEACHER_SCRIPT §9.2–§9.3, fsReadback):
   * - "rabbit" (Move 1, the first word zapped in a session): "Let's say the sounds, the slow way…" and the tiles' sounds,
   *   the tortoise stepping; "Now tap the rabbit, and read the word fast." The child's tap on the rabbit is the finishing
   *   zap: a star leaps from the rabbit at the monster, the word is said as its sounds fly into the ninja's hands, and the
   *   finisher lands. Then the idea, one sentence (the word's praise);
   * - "pair" (Move 5, the 3rd and 5th): Sensei's "slow way… fast way…" around the sounds and the word;
   * - otherwise (and always in a gem battle and the demo) the plain read-back, the sounds and the word.
   * The battle's dose (verify round 2: the talk was on every word of w1-6, and 4 of 7 in the w1-15 boss): fast and slow
   * talk is never on two words running (fsWord), so a pair straight after Move 1, the idea or the fast/slow praise is
   * the plain read-back; and the knockout word never has the pair, because the win's own lines follow it.
   * The tortoise lights on the sounds and the rabbit on the word, whichever it is. `demo`: Sensei's word in the first
   * battle's demo ("first": its finisher takes the first pip; "replay": the paw's Show me again, no damage).
   */
  const castSpell = async (said: Promise<unknown>, o: { demo?: "first" | "replay"; live?: () => boolean } = {}) => {
    const live = () => alive.current && (o.live?.() ?? true);
    setLocked(true);
    const firstTry = !o.demo && wordMisses.current === 0;
    if (!o.demo) {
      recordWordSpelt(word, firstTry);
      // Dec2: a word finished with no miss is a whole answer, counted before its letters' flames (the finisher's count)
      if (firstTry) streak.answer();
    }
    const P = pend.current;
    chipHit(idx, P.chips); // earlier hits whose sounds this tap cut short land quietly
    P.chips = 0;
    // the last pure sound is heard in full before the blend starts, and so is the blend's first sound: a quick child's
    // previous hit, still flying, lands first
    await Promise.all([said, sleep(350)]);
    for (let t = 0; ninja.busy && t < 700; t += 50) await sleep(50);
    if (!live()) return;
    const power = chargeUp();
    const slots = () => word.segs.map((_, k) => slotEl(k));
    const onSeg = (i: number) => {
      setLit(i);
      if (i >= 0) power.ping(slotEl(i));
    };
    let rb: FsReadback = o.demo || gameId === "trial" ? "plain" : fsReadback(gameId, { afterMiss: wordMisses.current > 0 });
    // (the dose, above: the read-back is still counted, so the next pair keeps its place, the 5th)
    if (rb === "pair" && (fsWord.current === idx - 1 || hp - 1 <= 0 || timeUp())) rb = "plain";
    let idea: string | null = null;
    if (rb === "rabbit" && L("tv_fs_say_sounds_slow") && L("tv_fs_rabbit_read")) {
      // Move 1: the slow way (the tortoise steps on each sound), then the child pushes it fast with the rabbit
      fsWord.current = idx;
      navSpeed("slow");
      await say([{ line: "tv_fs_say_sounds_slow" }, { gap: 250 }, { sounds: word.segs, gap: 300, onSeg, show: "tile" }]);
      navSpeed(null);
      setLit(-1);
      if (!live()) return;
      const tapped = rabbitTap({ slow: () => say({ sounds: word.segs, gap: 300, onSeg: (i) => setLit(i), show: "tile" }).then(() => setLit(-1)) });
      void say({ line: "tv_fs_rabbit_read" });
      const how = await tapped;
      if (!live()) return;
      fsSaid("tv_fs_rabbit_read", gameId);
      if (how === "timeout" && L("tv_fs_now_fast")) await say({ line: "tv_fs_now_fast" });
      else rabbitLeap(power.cols);
      if (!live()) return;
      power.gather(slots());
      await say([{ gap: 120 }, { word: word.text }]);
      idea = fsIdea(gameId, "build", { tight: true });
    } else if (rb === "pair") {
      // Move 5: Sensei's pair, the slow way and the fast way (they take turns)
      const [slowL, fastL] = fsPair();
      fsWord.current = idx;
      navSpeed("slow");
      await say([...(L(slowL) ? [{ line: slowL } as Say, { gap: 250 } as Say] : []), { sounds: word.segs, gap: 300, onSeg, show: "tile" }]);
      setLit(-1);
      if (!live()) return;
      navSpeed("fast");
      power.gather(slots());
      await say([{ gap: 200 }, ...(L(fastL) ? [{ line: fastL } as Say, { gap: 150 } as Say] : []), { word: word.text }]);
    } else {
      navSpeed("slow");
      await sayBlend(word.segs, word.text, (i) => {
        onSeg(i);
        if (i < 0) {
          navSpeed("fast");
          power.gather(slots());
        }
      });
    }
    setLit(-1);
    if (!live()) return;
    if (o.demo === "replay") {
      // Sensei's word again: the finisher lands, the monster reels, and its health stays as it is
      const hits = finisher(false, power);
      await hits.last;
      if (live()) replayHit(power.cols);
      return;
    }
    const nhp = hp - 1;
    const final = !o.demo && (nhp <= 0 || timeUp()); // (a cut lesson: the monster is knocked out by this word when time is up)
    const hits = finisher(final, power);
    const landed = hits.last.then(() => void (alive.current && bigHit(final, nhp, power.cols)));
    if (o.demo) {
      await landed;
      await sleep(350);
      return;
    }
    if (final) {
      await landed;
      if (alive.current) await win();
      return;
    }
    await hits.first;
    if (!alive.current) return;
    await sleep(260);
    // A tier-up on this word: its own line ("Ninja power!") is the praise, heard in full before anything else.
    const powerUp = tierWait.current;
    tierWait.current = null;
    if (powerUp) await powerUp;
    if (!alive.current) return;
    // the idea after Move 1's rabbit (TEACHER_SCRIPT §9.3): one sentence, and it is this word's praise. After a tier-up's
    // line it isn't stacked: it comes in the game's next praise slot instead (fsIdea stays due until it is heard).
    let ideaSaid = false;
    if (idea && !powerUp) {
      await landed;
      if (!alive.current) return;
      ideaSaid = await say({ line: idea });
      if (ideaSaid) fsSaid(idea, gameId);
      if (!alive.current) return;
    }
    // Boss drama. Sensei's praise overlaps a combo's last blows; Baron Muddle's cut-in darkens the screen, so a combo
    // finishes and its stars clear first (unless he is the boss on screen, when there is no cut-in). A word never gets
    // two big moments: a power-up's line is its praise, and his half-way roar and his (rare) taunts wait for a word
    // without one; taunts are never two words running, never right after he roars, and skipped on a long word.
    const busySince = (performance.now() - tFinish.current) * FAST;
    const grr = !powerUp && boss && !enraged && nhp <= hpMax / 2;
    const taunt = !grr && !powerUp && boss && !lastDrama.current && busySince < 5000 && Math.random() < TAUNT_CHANCE;
    lastDrama.current = grr ? "grr" : taunt ? "taunt" : "";
    if (grr || taunt) {
      // the combo lands (and, before a cut-in, its stars clear) before Baron Muddle speaks
      await landed;
      await sleep(baronHere ? 200 : 650);
      if (!alive.current) return;
    }
    if (grr) {
      setEnraged(true);
      roar();
      const g = BOSS_CAPTIONS[level.monster!]?.grr;
      await (g ? bossSays(g) : say([{ line: "baron_grr" }]));
    } else if (taunt) {
      await say({ line: pick(BARON_TAUNTS) });
    }
    if (!alive.current) return;
    // After the word (SCRIPT_FIXES A7, C4; Dec4): at most one of a spaced "two letters, one sound" reminder (the tile lights
    // on "two letters", its petal pops above it on "one sound", and its sound follows) and praise, and nothing when a
    // tier-up, the idea or Baron spoke for the word. Praise comes at most every second right answer (TEACHER_SCRIPT §5.3),
    // fast and slow's building praise taking the slot once a session (a gem battle's slot takes the idea instead). The
    // gem's first fill is the reward's to explain now (TEACHER_SCRIPT §5.7).
    const spoke = !!powerUp || ideaSaid || grr || taunt;
    const remind = spoke || trialKey ? null : (twoSoundsReminder(word.segs, (k) => () => slotEl(k)) ?? lettersReminder(word.segs, (k) => () => slotEl(k)));
    if (remind) setLit(remind.i);
    // (the praise slot: the game's idea if Move 1's had to wait, else fast and slow's praise; a gem battle: the idea only.
    // Neither on a word that had fast/slow talk or straight after one (the dose), nor on a word the child missed or was
    // helped on: "…found every sound" isn't true there, and the slot is "That was a tricky one, and you kept going."
    // A line held back isn't recorded, so it comes in a later slot.)
    const fsDue = spoke ? null : (fsIdea(gameId, "build", { tight: true }) ?? (gameId === "trial" ? null : fsPraise(gameId, "build")));
    const struggled = wordMisses.current > 0 || helped.current;
    const fs = fsDue && !struggled && fsWord.current < idx - 1 ? fsDue : null;
    const after = await afterWordSay({ tierUp: spoke, leftRight: false, reminder: remind, gemFirst: null, game: gameId, praise: { every: 2, keptGoing: wordMisses.current > 0, helped: helped.current }, fs });
    if (fs && after === "praise" && fsHeardThisSession(fs)) fsWord.current = idx;
    if (remind) setLit(-1);
    // (the reminder's petal leaves 0.7 s after its sound: the word stays until it has gone, so it never points at the
    // next word's empty line)
    if (after === "reminder") await sleep(800);
    await landed;
    if (!alive.current) return;
    wordMisses.current = 0;
    helped.current = false;
    setFilled([]);
    setReveal(-1);
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    await ask(words[nextIdx], nextIdx);
  };
  /** Move 1's zap: a star leaps from the rabbit (the nav layer's badge) at the monster. */
  const rabbitLeap = (cols: string[]) => {
    const r = document.querySelector('[data-fs="rabbit"]');
    const a = r ? centre(r) : { x: 1204, y: 322 };
    void dot(a, aim(), 420, cols).then(() => {
      if (!alive.current) return;
      sfx.hit();
      flinch(streak.tier);
      const p = aim();
      fx.ring(p.x, p.y, { color: cols[0], r0: 16, r1: 120, width: 9, life: 16 });
    });
  };
  /** The replayed demo's finisher lands: a burst and a reel, and the health bar stays as it is. */
  const replayHit = (cols: string[]) => {
    const a = aim();
    sfx.hit();
    shakeStage();
    fx.ring(a.x, a.y, { color: cols[0], r0: 30, r1: 200, width: 14, life: 22 });
    fx.burst(a.x, a.y, "stars", 14, 1.1);
    squash(monRef.current, streak.tier, true);
    knock(monHit.current, 40, 7);
  };

  /** Half-way through a boss: it puffs up and roars. */
  const roar = () => {
    monHit.current?.animate(
      [{ scale: "1" }, { scale: "1.14 1.1", offset: 0.25 }, { scale: ".96 1.02", offset: 0.45 }, { scale: "1.08", offset: 0.65 }, { scale: "1" }] as Keyframe[],
      { duration: 800, easing: "ease-in-out" },
    );
    shakeStage();
    if (baronHere) sfx.thunder();
  };

  /** A boss's own words (BOSS_CAPTIONS): its caption bubble over it for a moment, a squawk and a little hop. */
  const bossSays = async (text: string) => {
    setBossLine(text);
    // (sfx.squawk is fix-requests row 8's magpie "chak-chak"; until audio.ts has it, the kiai's short squawk)
    (sfx.squawk ?? sfx.kiai)();
    monHit.current?.animate([{ translate: "0 0" }, { translate: "0 -24px", offset: 0.4 }, { translate: "0 0" }] as Keyframe[], { duration: 420, easing: "ease-out" });
    await sleep(Math.max(1800, 55 * text.length));
    if (alive.current) setBossLine((t) => (t === text ? null : t));
  };

  /** Knocked out: the monster spins away into the sky and vanishes with a twinkle. */
  const blastOff = async () => {
    const el = monPos.current;
    const end = baronHere ? SKY : { x: 990, y: 120 }; // up into the sky
    const dx = end.x - monCx;
    const dy = end.y - (MON_FEET - monH / 2);
    setKo(true);
    sfx.whoosh();
    el?.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: "translate(70px, -30px) rotate(40deg) scale(1.05)", opacity: 1, offset: 0.14 },
        { transform: `translate(${dx}px, ${dy}px) rotate(640deg) scale(.1)`, opacity: 1, offset: 0.86 },
        { transform: `translate(${dx}px, ${dy}px) rotate(720deg) scale(.04)`, opacity: 0 },
      ],
      { duration: 1000, easing: "cubic-bezier(.3,.1,.5,1)", fill: "forwards" },
    )?.finished.then(() => alive.current && setBlasted(true), () => {});
    setTimeout(() => alive.current && ding(end), 860);
    // (a boss with its own words says them as it spins; win() waits for them before the Baron speaks)
    const beaten = BOSS_CAPTIONS[level.monster!]?.beaten;
    if (beaten) beatenSaid.current = bossSays(beaten);
    await sleep(480);
  };

  /** Gem Trial won: the gem lights up in its colours and flies over the ninja's head as they land from the backflip,
   *  then is caught in a burst of sparkles. */
  const [gemLit, setGemLit] = useState(false);
  const gemToNinja = () => {
    const el = gemRef.current;
    if (!el) return;
    setGemLit(true);
    sfx.petal();
    const r = stageRect(document.querySelector(".ninja-spot"));
    const a = centre(el);
    const b = r.w ? { x: r.x + r.w * 0.54, y: r.y + r.h - r.w * 1.8 } : { x: 175, y: 252 }; // above the streak flames
    const d = { x: b.x - a.x, y: b.y - a.y };
    setTimeout(() => {
      if (!alive.current) return;
      sfx.twinkle();
      fx.ring(b.x, b.y, { color: "#fff4dc", r0: 30, r1: 150, width: 10, life: 22 });
      fx.glow(b.x, b.y, ["#fff4dc", "#ffe38a"], 10, 50, 3, 26);
    }, 400 + 1900 * 0.58);
    el.animate(
      [
        { translate: "0 0", scale: "1", opacity: 1 },
        { translate: `${d.x * 0.5}px ${d.y * 0.5 - 150}px`, scale: "1.35", opacity: 1, offset: 0.34 },
        { translate: `${d.x}px ${d.y}px`, scale: "1.1", opacity: 1, offset: 0.58 },
        { translate: `${d.x}px ${d.y - 14}px`, scale: "1.3", opacity: 1, offset: 0.72 },
        { translate: `${d.x}px ${d.y}px`, scale: "1.15", opacity: 1, offset: 0.86 },
        { translate: `${d.x}px ${d.y + 40}px`, scale: "0", opacity: 0 },
      ] as Keyframe[],
      { duration: 1900, delay: 400, easing: "ease-in-out", fill: "both" },
    ).finished.then(
      () => {
        if (!alive.current) return;
        setGemFlown(true);
        sfx.twinkle();
        fx.ring(b.x, b.y, { color: "#fff4dc", r0: 20, r1: 200, width: 14, life: 26 });
        fx.twinkle(b.x, b.y, ["#fff4dc", "#ffe38a", "#ff7aa2", "#5ec8f2"], 18, 9, 30);
        fx.glow(b.x, b.y, ["#fff4dc", "#ffe38a"], 14, 60, 4, 30);
      },
      () => {},
    );
  };

  /** Baron Muddle, blasted off, pops back up small in the sky shaking his fist while he promises to come back. Just as
   *  he finishes, the ninja leaps and flicks a star at him: bonk, ding, gone. */
  const baronFlees = async () => {
    setSky(1);
    sfx.pop();
    const said = say({ line: "baron_lose" });
    const buf = await load(urls.line("baron_lose"));
    await Promise.race([said, sleep(Math.max(0, (buf ? buf.duration * 1000 : 3800) - 600))]);
    if (!alive.current) return;
    const bonk = ninja.act("jump", skyRef.current ?? SKY, { react: false }).then(() => {
      if (!alive.current) return;
      setSky(2);
      ding(SKY);
    });
    await said;
    await bonk;
    await sleep(200);
    if (alive.current) void ninja.act("cheer");
  };

  /** The first win at the Sky Temple (once per save): it was a trick! The Baron's balloon rises in at the top right, he
   *  gloats and promises the Sky Isles, and the balloon drifts up and away; Sensei promises to follow it. Resolves true if
   *  it played to the end. */
  const baronEscapes = async (): Promise<boolean> => {
    setBalloon(1);
    sfx.pop();
    await sleep(700); // (the balloon rises in before he speaks)
    if (!alive.current) return false;
    // (an interrupted line doesn't stop the scene, but the trick then counts as unheard, for next time)
    const trick = await say({ line: "baron_trick_1" });
    if (!alive.current) return false;
    const escape = await say({ line: "baron_escape_sky" });
    if (!alive.current) return false;
    setBalloon(2);
    sfx.whoosh();
    await sleep(900);
    if (!alive.current) return false;
    const soon = await say({ line: "tv_trick_soon" });
    if (alive.current) void ninja.act("cheer");
    return trick && escape && soon && alive.current;
  };

  const win = async () => {
    setLocked(true);
    played(gameId, { struggled: struggledIn(struggle.current) });
    const powerUp = tierWait.current;
    tierWait.current = null;
    await blastOff();
    if (!alive.current) return;
    setDead(true);
    sfx.great();
    fx.rain("blossoms", 50);
    // a tier-up on the winning word plays out (its power-up and its line) before the celebration
    if (powerUp) await powerUp;
    if (!alive.current) return;
    const party = ninja.celebrate();
    if (trialKey) {
      gemToNinja();
      store.set((s) => {
        if (!s.gems.includes(trialKey)) s.gems.push(trialKey);
      });
      // (the World Flower says "You won the gem!" as it arrives, so the gem's flight and the celebration carry it here)
      await party;
      await sleep(400);
      if (alive.current) onDone(3);
      return;
    }
    if (boss) {
      // let the backflip land before Baron Muddle storms in (his cut-in darkens the screen)
      await sleep(baronHere ? 500 : 900);
      if (!alive.current) return;
      if (beatenSaid.current) await beatenSaid.current; // (the boss's last words, so the two bubbles never overlap)
      if (!alive.current) return;
      if (baronHere) await baronFlees();
      else if (level.id === TRICK_LEVEL && onceInSave("story:trick") && L("baron_trick_1")) {
        if (await baronEscapes()) heard("story:trick");
      } else {
        await say({ line: "baron_lose" });
        void ninja.act("cheer");
      }
      if (!alive.current) return;
    }
    // The level's closing line (TEACHER_SCRIPT §5.6): a Monster Battle's "Hooray! The monster ran away!", with "Every
    // monster you beat helps us win back the sounds." the first time (once per save); Sensei's Challenge's own. (A boss's
    // "You beat the boss! What a ninja!" is the reward screen's first line, so it is not said twice.)
    const closing = boss ? undefined : levelWrap(level).find(L) ?? "battle_win";
    const why = gameId === "battle" && onceInSave("battle:why") && L("tv_battle_why");
    const closed = closing ? say([{ line: closing }, ...(why ? [{ gap: 350 } as Say, { line: "tv_battle_why" } as Say] : [])]) : sleep(300);
    await Promise.all([closed, party]);
    if (why && (await closed)) heard("battle:why");
    const m = misses.current + knockouts.current * 3;
    if (alive.current) onDone(m <= 1 ? 3 : m <= 5 ? 2 : 1, { closing });
  };

  useKeyTiles(tiles, (g) => tap(g), () => void hearWord());
  // 8 s of quiet on a word (TEACHER_SCRIPT §5.5, §9.3): fast and slow's stuck recap, taking turns with "Let's listen
  // again. What can you hear here?" and the plain word (FS1: the child segments it). Never over something being said.
  useIdlePrompt(!locked && !!word && phase === "play", 8000, () => {
    if (isSpeaking()) return;
    const fs = fsStuckSay(gameId, word.text, { attempt: 1, item: `${word.text}:idle` });
    void say(fs ?? speak("w_listen_again", { word: word.text }, { slow: false }));
  }, [idx, phase]);
  const [helpLvl, setHelpLvl] = useState(0);
  useEffect(() => setHelpLvl(0), [idx, filled.length]);
  useHelp(
    (n) => {
      // a join-in of Sensei's demo: its invitation again (the last tile glows at once)
      const j = joinRef.current;
      if (j) return void j.again();
      if (!word || locked || phase !== "play") return;
      setHelpLvl(n);
      const k = filled.length;
      const need = word.segs[k] ?? word.segs[0];
      // 1: the 8 s rephrase, with the plain word (FS1: the child segments it); 2: the slow word, and an arrow at the line
      // they're on (a struggle: Sensei models it; never the sounds one by one over the tiles: NARRATIVE_AUDIT F29);
      // 3: "Let me show you… /m/", its petal popping above the line, and the right tile glowing
      if (n === 1) void say(speak("w_listen_again", { word: word.text }, { slow: false }));
      else {
        helped.current = true;
        struggle.current[idx - firstIdx] = true;
        if (n === 2) void say(spellingHelp(word.text));
        else {
          setReveal(k);
          void say([{ line: "help_look" }, { gap: 100 }, { sound: need.p, show: "petal", at: () => slotEl(k) }], { reveal: true });
        }
      }
    },
    [idx, filled.length, locked, phase],
  );
  // for the bots and the checks: the game (games.ts), what can be tapped now (a join-in's card or tile, else the next
  // tile once the question has been asked), and whether the scene is busy (the demo, a correction, the read-back)
  const liveNow = !locked && phase === "play" && !dead;
  (window as any).__snState = {
    scene: "battle", game: gameId, form, phase, locked, busy: join ? false : !liveNow, join: join?.kind ?? null,
    next: join ? (join.kind === "card" ? "word card" : join.g) : liveNow ? word?.segs[filled.length]?.g : undefined,
    word: word?.text, streak: streak.n, pending: pendN, hp,
  };

  const slotPx = !word || word.segs.length <= 4 ? 104 : word.segs.length === 5 ? 92 : 80;
  const curPip = hp - 1;
  const pipFill = word ? 100 - (70 * Math.min(chip, word.segs.length)) / word.segs.length : 100;
  const gem = trialKey ? gemByKey(trialKey) : undefined;
  const held = phase === "hold" ? holdStep() : null;
  return (
    <div
      className={`scene bt ${baronHere ? "bt-baron" : ""} ${sky === 1 || balloon > 0 ? "bt-skyon" : ""} ${balloon > 0 ? "bt-balloonon" : ""} ${held ? "bt-hold" : ""}`}
      style={held ? ({ "--hold-dx": `${held.dx}px`, "--hold-x0": `${held.x0}px` } as CSSProperties) : undefined}
    >
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      {enraged && <div className="bt-rage" style={{ "--mx": `${monCx}px` } as CSSProperties} />}

      {/* the monster: position (entrance, lunge, blast-off) > knockback > facing > sprite (breathing) */}
      <div className="shadow-blob bt-mon-shadow" style={{ left: monCx - monW * 0.38, top: MON_FEET - 12, width: monW * 0.76, opacity: dead ? 0 : 1 }} />
      <div ref={monPos} className="bt-mon" style={{ left: monCx - monW / 2, bottom: 720 - MON_FEET, width: monW }}>
        <div ref={monHit} className="bt-mon-hit">
          <div className={`bt-mon-face ${info.facing === "right" ? "flipped" : ""} ${blasted ? "" : enraged ? "angry" : tier >= 2 ? "scared" : ""}`}>
            <img ref={monRef} className={`bt-mon-img ${blasted ? "" : info.float ? "float" : "breathe"}`} src={img(`mon_${level.monster}`)} alt="" style={{ height: monH, maxWidth: monW }} />
          </div>
          {enraged && !blasted && <Vein />}
          {dizzy > 0 && (
            <div key={dizzy} className="bt-dizzy" onAnimationEnd={(e) => e.target === e.currentTarget && e.animationName === "bt-dizzy-life" && setDizzy(0)}>
              <i />
              <i />
              <i />
            </div>
          )}
        </div>
      </div>

      {/* Baron Muddle, blasted off, shaking his fist in the sky (his caption bubble points up at him) */}
      {(sky === 1 || sky === 2) && (
        // (once bonked away he is gone: 3, and his endless shake and vein with him)
        <div ref={skyRef} className={`bt-sky ${sky === 2 ? "bonk" : ""}`} style={{ left: SKY.x - 92, top: SKY.y - 92 }} onAnimationEnd={(e) => e.target === e.currentTarget && e.animationName === "bt-sky-out" && setSky(3)}>
          <div className="bt-sky-cloud" />
          <div className="bt-sky-fist">
            <img src={img(`mon_${level.monster}`)} alt="" />
          </div>
          <Vein />
        </div>
      )}

      {/* the Baron in his balloon, escaping to the Sky Isles (the first win at the Sky Temple; his bubble points up at him) */}
      {balloon > 0 && (
        <div className={"bt-balloon" + (balloon === 2 ? " away" : "")}>
          <img src={img("baron_balloon")} alt="" />
        </div>
      )}
      {/* a boss's own words (BOSS_CAPTIONS), over it */}
      {bossLine && (
        <div className="bubble bt-boss-say" style={{ left: monCx - 170, top: Math.max(112, MON_FEET - monH - 60) }}>
          {bossLine}
        </div>
      )}

      {/* the monster's health: one pip per word; each sound wears the current pip down, the finisher shatters it.
          It stays right of the "hear the word" button (x 768-860) however many pips there are. */}
      <div className={`bt-hp ${ko ? "out" : ""} ${hpLook ? "look" : ""} ${hpMax > 9 ? "lots" : hpMax > 6 ? "many" : ""}`}>
        <div className="bt-hp-face">
          <img src={img(`mon_${level.monster}`)} alt="" style={info.facing === "right" ? { scale: "-1 1" } : undefined} />
        </div>
        <div className="bt-hp-col">
          <div className="bt-pips">
            {Array.from({ length: hpMax }, (_, i) => (
              <div key={i} ref={(el) => void (pipRefs.current[i] = el)} className={`bt-pip ${i < hp ? "" : "gone"} ${i === curPip && !locked ? "cur" : ""}`}>
                <span>
                  <i style={i === curPip ? { width: `${pipFill}%` } : undefined} />
                </span>
              </div>
            ))}
          </div>
          {!relaxed && (
            <div className={`bt-meter ${explainBar ? "explain" : ""} ${hot ? "hot" : ""}`}>
              <b ref={barRef} />
            </div>
          )}
        </div>
      </div>

      {/* the prize gem in a Gem Trial, guarded by the monster */}
      {gem && !gemFlown && (
        <div ref={gemRef} className={`bt-gem ${gemLit ? "won" : ""}`} style={{ left: monCx - 55, top: MON_FEET - monH - 124, "--gem-glow": `${petalColour(gem.p)}e6` } as CSSProperties}>
          <div className="float">
            {/* (its sound's chart colour, as everywhere else: SOUND_DISPLAY r33, A6) */}
            <GemIcon g={gem.g} colour={petalColour(gem.p)} state={gemLit ? "won" : "ready"} size={110} />
          </div>
        </div>
      )}

      {/* topbar */}
      <TopBar>
        {timed && (
          <div style={heartsPulse ? { animation: "pulse 0.9s ease-in-out infinite" } : undefined}>
            <Hearts n={hearts} max={MAX_HEARTS} />
          </div>
        )}
        <div className="spacer" />
      </TopBar>

      {/* the word: picture card, sound slots, and the letter row between the ninja and Sensei */}
      {word && !dead && (
        <>
          {/* Hear it again: beside a picture card, or the speaker card itself (docs/NAVIGATION.md §3.1 "own": the letter
              row fills the bottom) */}
          {/* (while the demo's card join-in waits, the card under it is one tap target, the join-in's: see below) */}
          <div className="bt-card-wrap" aria-hidden={join?.kind === "card" ? true : undefined}>
            <WordCardAgain key={`c${idx}`} word={word} className="pop-in" style={{ left: TOP_CX - 115, top: 24, width: 230, height: 180 }} />
          </div>
          {word.pic && <ReplayButton onReplay={hearWord} size={100} label="Hear the word" style={{ position: "absolute", left: TOP_CX + 132, top: 68 }} />}
          {/* the demo's first join-in: "Tap my word card, and hear the word." (the card pulses, with the pointing hand) */}
          <div ref={cardRef} className={`bt-card-zone ${join?.kind === "card" ? "join" : ""}`} style={{ left: TOP_CX - 115, top: 24, width: 230, height: 180 }}>
            {join?.kind === "card" && (
              <>
                <button
                  type="button"
                  className="bt-card-tap"
                  aria-label="word card"
                  onPointerDown={(e) => (e.preventDefault(), joinRef.current?.kind === "card" && joinRef.current.done("child"))}
                />
                <TapHint show style={{ left: 120, top: 96 }} />
              </>
            )}
          </div>
          <div className="slots bt-slots" style={{ left: TOP_CX - 330, width: 660, "--slot": `${slotPx}px` } as CSSProperties}>
            {word.segs.map((_, i) => (
              <div key={`${idx}-${i}`} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${i < filled.length ? "filled" : i === filled.length && (!locked || cueSlot || join?.kind === "tile") ? "active" : ""} ${lit === i ? "bt-say" : ""}`}>
                {i < filled.length && <Tile g={filled[i]} className="bt-land" withButtons={filled.length === word.segs.length} lit={lit === i} />}
                {helpLvl === 2 && i === filled.length && !locked && <SlotPointer />}
              </div>
            ))}
          </div>
          {/* the letters: dim, and not yet live, until the Ready hold's ▶ (TEACHER_SCRIPT §3.18); a join-in's tile wakes */}
          <div ref={rowRef} className={`row bt-row ${phase !== "play" ? "dim" : ""} ${rowGlow ? "glow" : ""}`} style={{ left: ROW_L, width: ROW_R - ROW_L, gap: fit.gap }}>
            {tiles.map((g) => {
              const joinTile = join?.kind === "tile" && join.g === g;
              const need = word.segs[filled.length]?.g;
              const hint = joinTile ? join.glow : g === need && (slotMisses.current >= 2 || helpLvl >= 3 || reveal === filled.length);
              return (
                <Tile
                  key={`${idx}-${g}`}
                  g={g}
                  size={fit.px <= 80 ? "sm" : undefined}
                  className={joinTile ? "bt-join" : ""}
                  style={fit.px < 104 ? ({ "--size": `${fit.px}px` } as CSSProperties) : undefined}
                  state={wrong === g ? "wrong" : hint ? "hint" : ""}
                  onTap={(el) => tap(g, el)}
                />
              );
            })}
          </div>
        </>
      )}
      {/* Sensei's paw in the demo (the pointing hand), gliding from tap to tap */}
      {paw && (
        <div className={`bt-paw ${paw.down ? "down" : ""}`} style={{ transform: `translate(${paw.x}px, ${paw.y}px)` }}>
          <TapHint show style={{ position: "relative" }} />
        </div>
      )}

      {/* the streak flames, plus pale ones for the word's first-try answers held until its finisher */}
      <NinjaSpot pose="ready" pending={pendN} />
      <NarrOverlay />
      <SenseiDock />
    </div>
  );
}
