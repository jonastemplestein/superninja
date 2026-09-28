import type { FoundationTarget } from "../core/learner/foundations";
// Early-learning mini-games (docs/PEDAGOGY.md), in the teacher's voice (docs/TEACHER_SCRIPT.md §3.13–§3.19, §5, §9):
// every game says what it is and who does what (the frame), Sensei does one first and thinks aloud (the narrated I do,
// with a join-in tap that means something: the petal, the word card, "Can you find the last one?"), asks whether the
// child is ready (the Ready hold, on a game's first meeting) and hands over: the we do (the answer glows after 2 s),
// then the you do. Later plays open on one line (the recap or short form, narrate.tsx gameForm). A new sound arrives as
// its petal in the middle (misty, blooming on its sound the first time), the child taps it and says it, and it glides
// to the nav row. A spelling is written at the child's own first right answer (the we do), once per level.
// Errors: 1st → back to listening (the tapped card says its word; the fast and slow stuck recap takes turns with it);
// 2nd → "Let's do it together. It's this one. Now you tap it." (the answer glows, the paw points); the item is
// re-queued, so the round always ends with a success. Stars count only first-try "youdo" items.
// The player's ninja (docs/HERO.md) stands bottom-left on every screen here and answers every right answer with a move
// aimed at the thing the child got right: kicks, punches, shuriken and spells at objects and letters (landing on the
// corner, never over the picture), and for people, animals, the two readers and a finished word a friendly gift instead
// (a star or a spell that settles as a crown of stars and hearts on top). A spell writes each new spelling on its line,
// and when building, the ninja launches each letter into its slot a different way every time (a spell, a throw, a
// punch, a flying kick, a leap, a spin, a backflip). First-try answers build the streak that makes it glow; a new
// streak tier gets its own short beat in place of the praise, so its line is heard in full and never over teaching.
// Sound order: a word Sensei models ("nest starts with /n/") always comes after the move has landed, so no impact
// sound falls on it; praise and a letter's sound run alongside the (quiet) moves, which never make the child wait.
// Navigation (docs/NAVIGATION.md): Home is the nav layer's (useHome); every turn has Hear it again (the speaker in the
// nav row, dim while Sensei is still talking), the sound picture for a sound game, and, after an I do, Show me again
// (the paw), which plays the demo again and never answers. Nothing here moves on by itself: the demos lead straight
// into the child's turn, which waits for an answer; idle help glows, asks again and points, but never answers.
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { LevelProps } from "../App";
import { WORD_BY_TEXT, WORDS, ORAL_WORDS, GRAPHEMES, PHONEMES, type Word, type PhonemeId } from "../content/phonics";
import { knownSpellings, worldOf, LEVELS, type Level } from "../content/worlds";
import { picSaysFirst } from "../content/pic-names";
import { LINES } from "../content/lines";
import { say, sfx, playMusic, preload, urls, hush, onClip, clipId, isSpeaking, type Say, type SoundAt } from "../engine/audio";
import { speak, resolveSpeech } from "../engine/speech";
import { FAST } from "../engine/fast";
import { shuffle } from "../engine/learner";
import { store, recordSpell, recordRead, recordWordSpelt, recordFoundation } from "../engine/store";
import { streak, useStreak, tierOf, streakLine, tierLineSaid, type Tier } from "../engine/streak";
import { img, heroImg, Tile, fx, fxDom, stageRect, sleep, tapProps, useHelp, useHero, TapHint, WordCard, SenseiDock } from "../ui/ui";
import { NinjaSpot, ninja, type Move, type Pose } from "../ui/Ninja";
import { pictureCorrection, praiseBy, praiseFor, praiseWanted, pickPraise, type PraiseOpts } from "../engine/feedback";
import { practiceGemOf } from "../engine/gems";
import { STEMS, stemFor, fadeForm, type FrameForm } from "../content/narrative";
import { GAMES, levelWrap, openingLines, type GameId } from "../content/games";
import { nameLine, WARMUPS } from "../content/warmups";
import { LIVING_WORDS } from "../content/living";
import {
  NarrOverlay, beginLevel, heard, heardBefore, onceInSave, sweepUnder, gameForm, readyAsk, framed, played, struggledIn, afterWordSay,
  fsReadback, fsIdea, fsPraise, fsPair, fsSaid, fsStuckSay, correctionFor, revealsNow, lettersReminder,
} from "./narrate";
import { HELD_ONSET, SLOW_TIMES, STRETCHED } from "../content/stretch";
import { wordAt } from "../content/word-times";
import { PIC_PLATES, PLATE_COLOURS } from "../content/pic-plates.gen";
import { nextItem, ownWords, paceOf, type Pace, type PaceItem, type PaceTally, type PhaseKind, type PhaseTally } from "../content/pace";
import { useHome, useNav, useHeld, navAgain, navLog, navSpeed, rabbitTap, holdReady, readyTap, readyHeld, ReplayButton, ShowAgainButton, NAV_SLOTS, slotStyle, type SpeedSpec } from "../ui/nav";
import { SoundBadge, SoundDots, badgeHeight } from "../ui/SoundBadge";
import { iconWordOf } from "../ui/petal";
import { senseiDemo, cancelDemo, demoRunning, demoTap, SenseiDemoLayer } from "../ui/SenseiDemo";
import "../styles/early.css";
import "../styles/nav-C.css";

export type Mode = "ido" | "wedo" | "youdo";
/** The slow way: since 27 Sep the word's pure sounds one by one, with little gaps (public/a/x, every word). FS1
 *  (docs/DECISIONS.md): for reading and blending, and Sensei's own demos; never in a first-sound or sound-hunt question
 *  (it would hand over the answer), and a spelling's first miss gets the plain word. */
const x = (w: string): Say => ({ stretch: w });
type Pt = { x: number; y: number };

// ---------------------------------------------------------------- the ninja's part
// Living things (animals, people, people doing things) are never kicked or hit: they get a friendly gift (see gift()).
export const LIVING = LIVING_WORDS;
// the strike pools of src/ui/Ninja.tsx, so a scene can leave a move out (e.g. a spell when a spell comes next anyway)
const STRIKES: Record<Tier, Move[]> = {
  0: ["kick", "punch", "throw", "cast"],
  1: ["kick", "punch", "throw", "cast", "spin", "jump"],
  2: ["kick", "spin", "cast", "flip", "throw", "jump"],
  3: ["flip", "spin", "cast", "kick", "throw"],
};
/** Pick from a pool so the ninja never repeats itself: every move in the pool comes round once, in a random order,
 *  before any comes back, and never the same one twice running. `memory` holds this round's picks (the scene's moves,
 *  or its letter launches); a bigger pool at a new streak tier brings its new moves in straight away. */
function chooseFrom<T>(pool: T[], memory: T[], avoid: T[] = []): T {
  const ok = pool.filter((m) => !avoid.includes(m));
  const from = ok.length ? ok : pool;
  let fresh = from.filter((m) => !memory.includes(m));
  if (!fresh.length) {
    const last = memory.at(-1); // a new round, which does not start with the move that ended the last one
    memory.length = 0;
    fresh = from.filter((m) => m !== last);
    if (!fresh.length) fresh = from;
  }
  const pick = fresh[(Math.random() * fresh.length) | 0];
  remember(pick, memory);
  return pick;
}
/** The last moves across this scene (picks, gifts, spelling spells). */
const recent: Move[] = [];
function remember<T>(m: T, memory: T[] = recent as T[]) {
  memory.push(m);
  if (memory.length > 6) memory.shift();
}
const chooseMove = (pool: Move[], avoid: Move[] = []) => chooseFrom(pool, recent, avoid);

/** Would one more first-try answer take the streak into a new tier? */
export const crossesTier = () => tierOf(streak.n + 1) > streak.tier;
export type Aim = "pic" | "tile" | "reader";
/** Quick strikes for when Sensei models a word straight after: they land within about 0.45 s (no flying kick, spin,
 *  leap or backflip), and are played soft (no whooshes, booms or landing thuds, one gentle tink), so the word is heard
 *  clearly while the move is still in the air. */
const SOFT_STRIKES: Record<Tier, Move[]> = { 0: ["kick", "punch", "throw"], 1: ["kick", "punch", "throw"], 2: ["punch", "throw"], 3: ["punch", "throw"] };
/** A right answer: the ninja makes a move at the thing the child got right, and it counts toward the streak if it was
 *  the first try (and the child's own). Objects and letters get the full attack set (kicks, punches, shuriken, spins;
 *  flying kicks, triple shuriken and big spells on a streak), aimed at the card's corner; people, animals and the
 *  readers get a friendly gift. Returns `held`: this answer would start a new streak tier, so it is not counted yet
 *  (call tierBeat() in place of the praise, once the teaching for it has been said); and `landed`, when the move hits.
 *  `soft`: teaching follows at once (see SOFT_STRIKES; afterLanding waits at most about 0.3 s). `avoid`: moves to leave
 *  out (picture games whose spelling then appears by a spell leave out the spell); `self`: the reader is the player's
 *  own hero (it cheers, nothing flies). */
export function rightAnswer(el: Element | null, aim: Aim, o: { first: boolean; living?: boolean; avoid?: Move[]; self?: boolean; soft?: boolean }): { held: boolean; landed: Promise<void> } {
  const held = o.first && crossesTier();
  let landed = Promise.resolve();
  if (aim === "reader" || o.living) landed = gift(el, { self: o.self, shape: aim === "reader" ? "around" : "top" });
  else if (el) {
    const target = cornerOf(el, aim);
    landed = ninja.strike(target, { move: chooseMove((o.soft ? SOFT_STRIKES : STRIKES)[streak.tier], o.avoid), react: false, soft: o.soft }).then(() => {
      if (!el.isConnected) return;
      bump(el);
      el.classList.add("struck");
    });
  }
  // counted once the move is under way; a hit that starts a new tier waits for its own beat (tierBeat)
  if (o.first && !held) streak.hit();
  return { held, landed };
}
/** Before Sensei models a word: a soft strike is still in the air (its one tink is ducked under the word by audio.ts),
 *  so the word follows the tap at once: at most about 0.3 s. */
export const afterLanding = (landed: Promise<void>) => Promise.race([landed.then(() => sleep(60)), sleep(300)]);
/** Where a strike lands: a top corner of the picture or letter, where its star stamp then appears, so the impact never
 *  hides the answer while Sensei names it. A letter in a row is hit on its outer corner (top-right for the rightmost,
 *  top-left for the leftmost), so the burst scatters away from the other letters. If it was tapped while its row was
 *  still dropping in (quick answers in "find the letter"), aim at where it will land, so the move can set off at once. */
export function cornerOf(el: Element, aim: Aim = "pic"): Pt {
  const r = stageRect(el);
  const box = el.closest(".drop-in");
  const moving = box?.getAnimations().some((a) => a.playState === "running");
  const dy = box && moving ? new DOMMatrix(getComputedStyle(box).transform).m42 : 0; // stage px: the stage scales everything inside it
  let left = false;
  if (aim === "tile" && box?.parentElement) {
    const sibs = [...box.parentElement.children];
    left = sibs.length > 1 && sibs.indexOf(box) === 0;
  }
  return { x: left ? r.x + 6 : r.x + r.w - 6, y: r.y + 6 - dy };
}
/** What the ninja hit squashes and flashes (the ninja only does that for element targets; strikes here aim at a point). */
export function bump(el: Element) {
  try {
    el.animate(
      [
        { scale: "1", filter: "brightness(1)" },
        { scale: "1.1 0.9", filter: "brightness(1.45)", offset: 0.2 },
        { scale: "0.96 1.05", filter: "brightness(1.1)", offset: 0.5 },
        { scale: "1", filter: "brightness(1)" },
      ] as Keyframe[],
      { duration: 420, easing: "ease-out" },
    ).playbackRate = FAST;
  } catch {}
}
/** "This is how we write it": the ninja casts, a glowing spell drifts onto sound line `i` and the spelling appears
 *  there in a flash of light (a spell that writes, so no impact star over the letter). Runs alongside Sensei's line
 *  (it lands in about 0.6 s); resolves once the spelling shows. */
export function castSpelling(i: number, show: () => void): Promise<void> {
  const line = document.querySelectorAll(".sound-lines .sound-line")[i];
  if (!line) {
    show();
    return Promise.resolve();
  }
  remember("cast");
  const r = stageRect(line);
  return Promise.race([launch("cast", null, { x: r.x + r.w / 2, y: r.y + r.h / 2 }, { land: "chime" }), sleep(1500)]).then(show);
}
/** Picture games whose spelling then appears by a spell (castSpelling) choose the picture with other moves. */
const NO_SPELL: Move[] = ["cast"];

// ---------------------------------------------------------------- friendly gifts: no kick, no POW
// Colours per streak tier (as the ninja's own): warm, gold, pink and blue, rainbow.
export const COLS: Record<Tier, string[]> = {
  0: ["#fff4dc", "#ffe38a", "#ffc53d"],
  1: ["#ffe38a", "#ffc53d", "#ff9a3d", "#fff4dc"],
  2: ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"],
  3: ["#ff5a5a", "#ffb03d", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"],
};
/** A point on the ninja (fractions of its width from its left edge and above its feet), in stage coordinates. */
export function ninjaAt(fw: number, fh: number): Pt {
  const r = stageRect(document.querySelector(".ninja-spot"));
  const left = r.w ? r.x : 40, feet = r.w ? r.y + r.h : 702, w = r.w || 250;
  return { x: left + w * fw, y: feet - w * fh };
}
/** A picture (star or heart) floating along an arc from a to b, with a glowing trail. Resolves on arrival. */
function floatTo(src: string, size: number, a: Pt, b: Pt, ms: number, tier: Tier): Promise<void> {
  const layer = fxDom();
  if (!layer) return Promise.resolve();
  const el = document.createElement("img");
  el.src = src;
  el.alt = "";
  el.className = "early-gift";
  el.style.width = el.style.height = `${size}px`;
  layer.appendChild(el);
  const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 150 };
  // the trail: one glow every 22 stage px travelled, whatever the frame rate (docs/PERF.md fix 7, fx.trail)
  const trailAt = fx.trail(COLS[tier], { size: 30, drift: 0.5, life: 18, also: (x, y) => void (Math.random() < 0.3 && fx.twinkle(x, y, COLS[tier], 1, 1.5, 16)) });
  return new Promise((resolve) => {
    const t0 = performance.now();
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      el.remove();
      resolve();
    };
    const frame = (now: number) => {
      if (done) return;
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      const e = t * t * (3 - 2 * t);
      const p = { x: (1 - e) ** 2 * a.x + 2 * (1 - e) * e * c.x + e * e * b.x, y: (1 - e) ** 2 * a.y + 2 * (1 - e) * e * c.y + e * e * b.y };
      el.style.transform = `translate(${p.x - size / 2}px, ${p.y - size / 2}px) rotate(${Math.sin(t * Math.PI * 2) * 18}deg) scale(${0.55 + 0.45 * t + 0.25 * Math.sin(t * Math.PI)})`;
      trailAt(p);
      if (t < 1) requestAnimationFrame(frame);
      else end();
    };
    requestAnimationFrame(frame);
    setTimeout(end, ms + 600); // never hang (a hidden tab pauses animation frames)
  });
}
/** How a gift sits on each kind of target. A picture card has room above it: the star lands on its top edge and the
 *  crown arches over it. A reader has the sound tiles just above: it lands on the hair, and the stars settle round the
 *  upper half of the portrait, clear of the tiles and never over the face. A built word has its picture above: the
 *  stars go to both ends of the word. */
export type Crown = "top" | "around" | "sides" | "halo";
function crownSpots(r: { x: number; y: number; w: number; h: number }, shape: Crown, n: number) {
  const cx = r.x + r.w / 2;
  if (shape === "top") {
    const rx = Math.min(r.w * 0.52, 170);
    return { land: { x: cx, y: r.y + 4 }, rise: 34, spots: Array.from({ length: n }, (_, i) => Math.PI * (1.1 + (0.8 * i) / (n - 1))).map((a) => ({ x: cx + Math.cos(a) * rx, y: r.y + 4 + Math.sin(a) * 50 - 16 })) };
  }
  const round = (deg: number[], cy: number, rx: number, ry: number) => deg.slice(0, n).map((d) => ({ x: cx + Math.cos((d * Math.PI) / 180) * rx, y: cy + Math.sin((d * Math.PI) / 180) * ry }));
  // a picture that is the joke (the starfish): the star lands above it and the stars settle all round, off the picture
  if (shape === "halo") return { land: { x: cx, y: r.y - 34 }, rise: 16, spots: round([200, 340, 160, 20, 250, 290, 180], r.y + r.h / 2, r.w / 2 + 44, r.h / 2 + 30) };
  if (shape === "around") {
    const cy = r.y + r.w / 2; // the round portrait window (as wide as the reader) sits at the top
    return { land: { x: cx, y: r.y + 44 }, rise: 10, spots: round([232, 308, 196, 344, 160, 20, 140], cy, r.w / 2 + 14, r.w / 2 + 16) };
  }
  return { land: { x: cx, y: r.y + 10 }, rise: 24, spots: round([180, 0, 214, 326, 146, 34, 250], r.y + r.h / 2, r.w / 2 + 52, r.h / 2 + 14) };
}
/** Stars (and hearts on a streak) pop out of the landing point and settle round the target (see crownSpots), then
 *  float and fade, with a chime. More of them, and brighter, the higher the streak. */
export function crown(r: { x: number; y: number; w: number; h: number }, tier: Tier, shape: Crown, brief = false) {
  const layer = fxDom();
  if (!layer) return;
  const n = [3, 5, 5, 7][tier];
  const { land, spots, rise } = crownSpots(r, shape, n);
  sfx.petal();
  fx.twinkle(land.x, land.y, COLS[tier], brief ? 6 : 10 + tier * 4, 4.5, brief ? 18 : 24);
  if (!brief) fx.glow(land.x, land.y, COLS[tier], 6 + tier * 3, 46, 1.6, 26);
  if (tier >= 2 && !brief) fx.ring(land.x, land.y, { color: COLS[tier][0], r0: 10, r1: 130 + tier * 20, width: 8, life: 24 });
  spots.forEach((p, i) => {
    const mid = shape === "top" && i === (n - 1) / 2;
    const heart = tier >= 2 ? i % 2 === 1 || mid : tier === 1 && (mid || (shape !== "top" && i === 2));
    const s = (mid ? 70 : 56) + tier * 4;
    const el = document.createElement("img");
    el.src = img(heart ? "item_heart" : "item_star");
    el.alt = "";
    el.className = "early-gift";
    el.style.width = el.style.height = `${s}px`;
    layer.appendChild(el);
    const at = (x0: number, y0: number, k: number, rot = 0) => `translate(${x0 - s / 2}px, ${y0 - s / 2}px) rotate(${rot}deg) scale(${k})`;
    const tilt = (p.x < land.x ? -1 : 1) * (8 + (i % 3) * 5);
    // `brief`: out, a pop, and gone within about 0.4 s of landing (the picture it celebrates must be seen)
    const anim = el.animate(
      brief
        ? [
            { transform: at(land.x, land.y, 0.2), opacity: 0 },
            { transform: at(p.x, p.y, 1.15, tilt), opacity: 1, offset: 0.3, easing: "ease-out" },
            { transform: at(p.x, p.y - rise, 0.6, tilt), opacity: 0 },
          ]
        : [
            { transform: at(land.x, land.y, 0.2), opacity: 0 },
            { transform: at(p.x, p.y, 1.22, tilt), opacity: 1, offset: 0.2, easing: "ease-in-out" },
            { transform: at(p.x, p.y, 1, tilt), opacity: 1, offset: 0.32, easing: "ease-in-out" },
            { transform: at(p.x, p.y - rise * 0.25, 1.04, -tilt / 2), opacity: 1, offset: 0.7, easing: "ease-in" },
            { transform: at(p.x, p.y - rise, 0.7, tilt), opacity: 0 },
          ],
      { duration: brief ? 560 : 1500, delay: i * (brief ? 25 : 45), easing: "cubic-bezier(.3,1.4,.5,1)", fill: "both" },
    );
    anim.playbackRate = FAST;
    anim.finished.then(() => el.remove(), () => el.remove());
  });
}
/** A friendly move for people, animals, the readers and a finished word (docs/HERO.md: never a kick at a cat): the
 *  ninja cheers and a star floats over, or it casts and a glowing spell drifts over; either way it lands gently and
 *  settles as a crown of stars (and hearts on a streak) with a chime. No POW, no thwack, no shake. The player's own
 *  hero (a reader) just cheers with it: nothing flies at itself. Resolves when it lands. */
export function gift(el: Element | null, o: { self?: boolean; shape?: Crown; brief?: boolean } = {}): Promise<void> {
  const r = stageRect(el);
  if (!el || !r.w) return Promise.resolve();
  const tier = streak.tier;
  const shape = o.shape ?? "top";
  const brief = !!o.brief;
  const { land } = crownSpots(r, shape, 1);
  if (o.self) {
    remember("cheer");
    void ninja.act("cheer");
    return sleep(260).then(() => crown(r, tier, shape, brief));
  }
  if (chooseMove(["cheer", "cast"]) === "cast") return launch("cast", null, land, { land: "none" }).then(() => crown(r, tier, shape, brief));
  void ninja.act("cheer");
  // up at the top of the cheer's first bounce, the star leaves the ninja's raised hands
  return sleep(240)
    .then(() => floatTo(img(tier >= 2 ? "item_heart" : "item_star"), 76 + tier * 8, ninjaAt(0.6, 1.3), land, 520, tier))
    .then(() => crown(r, tier, shape, brief));
}

// ---------------------------------------------------------------- the ninja's launches: letters into slots, spells
// Word building sends a letter from the bank into its slot 15-30 times a level, so the ninja launches it a different
// way each time, never the same twice running, and more acrobatically as the streak grows: a spell, a throw, a punch,
// a flying kick, a leap, a pirouette or a backflip. A launch is a sprite pose (ninja.pose) plus whole-body motion on
// the ninja's float layer (the moves in src/ui/Ninja.tsx animate the body inside it, so the two never fight), a streak
// of light from the ninja's hand or foot to the letter, the letter's glowing copy swooping up into its slot (swinging,
// darting, corkscrewing or hopping on the way, but always the right way up) with a trail in the streak's colours
// (braided twin and triple trails at 6 and 10 in a row, with afterimages of the ninja), and a gold ring where it lands
// (never red: red means wrong). A letter launch makes no
// sound of its own but a soft tock as it lands: the letter's sound is being said as it flies. With no letter, the same
// machinery casts a spell orb from the ninja's hands (writing a spelling on its line, a gift), with a quiet shimmer.
export type Launch = "cast" | "throw" | "punch" | "kick" | "leap" | "spin" | "flip";
const LAUNCHES: Record<Tier, Launch[]> = {
  0: ["cast", "throw", "punch"],
  1: ["cast", "throw", "punch", "kick", "leap"],
  2: ["kick", "leap", "spin", "flip", "throw"],
  3: ["flip", "spin", "leap", "kick"],
};
const recentLaunch: Launch[] = [];
/** One keyframe of the whole ninja: [ms, x, y, rotate°, scaleX, scaleY, easing of the segment that starts here].
 *  Squash and stretch happen at the feet; rotation turns round the tummy. */
export type Key = [number, number, number, number, number, number, string?];
const SNAP = "cubic-bezier(.15,.85,.25,1.15)";
const FALL = "cubic-bezier(.55,0,.85,.4)";
const CROUCH = "cubic-bezier(.2,.8,.4,1)";
export interface Spec {
  total: number;
  keys: Key[];
  poses: [number, Pose][];
  /** when the streak of light leaves the ninja (the letter follows it), and where from: [fraction of the ninja's width
   *  from its left edge, fraction of its width above its feet], carried along by the body's motion */
  depart: number;
  from: [number, number];
  /** the flight: how a letter moves on its way (see flyStyle), a spell orb's arc height, and the speed in stage px
   *  per second (a letter always swoops up into its slot from below: see flyTo) */
  style: Fly;
  arc?: number;
  speed: number;
  /** the streak of light: an arched beam (spells), a straight ki bolt (strikes) or a line of stars (acrobatics) */
  bolt: "beam" | "ki" | "stars";
  /** afterimages from..to ms (6 or more in a row) */
  air?: [number, number];
}
function specOf(l: Launch, tier: Tier): Spec {
  switch (l) {
    case "cast":
      return {
        total: 520, depart: 170, from: [0.86, 0.74], arc: 130, style: "glide", speed: 1300, bolt: "beam",
        keys: [[0, 0, 0, 0, 1, 1], [150, -10, -6, 4, 0.97, 1.04, SNAP], [230, 30, -4, -3, 1.08, 0.95, "ease-out"], [520, 0, 0, 0, 1, 1]],
        poses: [[0, "cast"]],
      };
    case "throw":
      return {
        total: 480, depart: 160, from: [0.9, 0.8], style: "whirl", speed: 1500, bolt: "ki",
        keys: [[0, 0, 0, 0, 1, 1, "ease-out"], [90, -14, 0, 8, 0.96, 1.04, SNAP], [170, 48, -6, -6, 1.1, 0.94, "ease-out"], [300, 36, -4, -3, 1.02, 0.99], [480, 0, 0, 0, 1, 1]],
        poses: [[0, "ready"], [90, "throw"]],
      };
    case "punch":
      return {
        total: 460, depart: 150, from: [0.92, 0.8], style: "dart", speed: 1800, bolt: "ki",
        keys: [[0, 0, 0, 0, 1, 1, "ease-out"], [80, -18, 2, 4, 0.95, 1.04, SNAP], [150, 76, -4, -3, 1.13, 0.93, "linear"], [230, 80, -4, -3, 1.05, 0.97], [460, 0, 0, 0, 1, 1]],
        poses: [[0, "ready"], [80, "punch"]],
      };
    case "kick": {
      const fly = tier >= 2; // a flying kick, tilted into it
      const hit = fly ? 230 : 180;
      return {
        total: fly ? 620 : 540, depart: hit, from: [1.0, 0.5], style: "dart", speed: 1700, bolt: "ki",
        keys: [
          [0, 0, 0, 0, 1, 1, "ease-out"], [100, -14, 6, 5, 1.12, 0.86, SNAP],
          [hit, 112, fly ? -92 : -42, fly ? -12 : -6, 1.1, 0.93, "linear"], [hit + 80, 118, fly ? -88 : -40, fly ? -10 : -5, 1.04, 0.98, FALL],
          [fly ? 500 : 400, 16, 0, 1, 1.12, 0.88, "ease-out"], [fly ? 620 : 540, 0, 0, 0, 1, 1],
        ],
        poses: [[0, "ready"], [100, "kick"], [fly ? 400 : 330, "jump"]],
        air: fly ? [110, 360] : undefined,
      };
    }
    case "leap":
      return {
        total: 620, depart: 180, from: [0.9, 0.8], style: "whirl", speed: 1600, bolt: "stars",
        keys: [[0, 0, 0, 0, 1, 1, "ease-out"], [100, 0, 8, 0, 1.13, 0.84, CROUCH], [270, 50, -144, -4, 0.93, 1.1, "ease-out"], [360, 54, -150, -4, 1, 1, FALL], [540, 0, 0, 0, 1.12, 0.88, "ease-out"], [620, 0, 0, 0, 1, 1]],
        poses: [[0, "ready"], [100, "jump"], [190, "throw"], [420, "jump"]],
        air: [120, 420],
      };
    case "spin":
      return {
        total: 600, depart: 260, from: [0.95, 0.66], style: "corkscrew", speed: 1600, bolt: "stars",
        keys: [
          [0, 0, 0, 0, 1, 1, "ease-out"], [80, -6, 6, 0, 1.12, 0.86, "ease-in"], [150, 8, -34, -4, 0.12, 1.04, "linear"], [220, 20, -54, -6, -1.02, 1.02, "linear"],
          [290, 32, -60, -4, -0.12, 1.02, "linear"], [370, 40, -56, -3, 1.06, 0.98, FALL], [490, 16, 0, 0, 1.12, 0.88, "ease-out"], [600, 0, 0, 0, 1, 1],
        ],
        poses: [[0, "ready"], [80, "spin"], [490, "ready"]],
        air: [100, 440],
      };
    case "flip":
      return {
        total: 680, depart: 260, from: [0.5, 0.95], style: "hop", speed: 1500, bolt: "stars",
        keys: [[0, 0, 0, 0, 1, 1, "ease-out"], [100, 0, 8, 0, 1.13, 0.84, CROUCH], [190, 14, -96, -30, 0.95, 1.08, "linear"], [300, 30, -158, -180, 0.96, 1.04, "linear"], [460, 26, -96, -335, 1, 1, FALL], [570, 0, 0, -360, 1.14, 0.86, "ease-out"], [680, 0, 0, -360, 1, 1]],
        poses: [[0, "ready"], [100, "flip"], [460, "jump"], [570, "ready"]],
        air: [120, 500],
      };
  }
}
/** The body's offset, turn and horizontal scale at `ms` (linear between keyframes; for aiming, not drawing). */
function keyAt(keys: Key[], ms: number) {
  const j = Math.max(1, keys.findIndex((k) => k[0] >= ms));
  const [a, b] = [keys[j - 1], keys[j] ?? keys[j - 1]];
  const u = b[0] > a[0] ? Math.min(1, Math.max(0, (ms - a[0]) / (b[0] - a[0]))) : 1;
  const mix = (i: number) => a[i] as number + ((b[i] as number) - (a[i] as number)) * u;
  return { x: mix(1), y: mix(2), rot: mix(3), sx: mix(4) };
}
/** Where `s.from` is on the moving ninja at `ms` (turned round the tummy in a flip, mirrored in a pirouette). */
function onNinja(s: Spec, ms: number): Pt {
  const k = keyAt(s.keys, ms);
  const p = ninjaAt(s.from[0], s.from[1]);
  const c = ninjaAt(0.5, 0.62);
  const a = (k.rot * Math.PI) / 180;
  const dx = (p.x - c.x) * k.sx, dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a) + k.x, y: c.y + dx * Math.sin(a) + dy * Math.cos(a) + k.y };
}

/** Put a pose on now, for a launch (the launch drives the whole body itself, on the float layer). Back to rest only
 *  from a pose put on here: never over a real move's own pose (a cheer that has just begun). */
let shown: Pose | null = null;
function showPose(p: Pose | null) {
  const mine = shown;
  shown = p;
  ninja.pose(p, { now: !!p || ninja.currentPose === mine });
}

let moving: { anims: Animation[]; timers: number[] } | null = null;
/** Whole-body motion for a launch: poses on cue, the float layer's keyframes, the shadow staying on the ground, the
 *  streak flames kept upright, and afterimages on a big streak. A new launch cuts the last one short. */
export function moveNinja(s: Spec, tier: Tier) {
  if (moving) {
    moving.anims.forEach((a) => a.cancel());
    moving.timers.forEach(clearTimeout);
  }
  const m = (moving = { anims: [] as Animation[], timers: [] as number[] });
  const later = (ms: number, f: () => void) => void m.timers.push(window.setTimeout(f, ms));
  for (const [ms, p] of s.poses) later(ms, () => showPose(p));
  later(s.total, () => {
    showPose(null);
    if (moving === m) moving = null;
  });
  const root = document.querySelector<HTMLElement>(".ninja-spot");
  const float = root?.querySelector<HTMLElement>(".nj-float");
  if (!root || !float) return;
  const C = (root.offsetWidth || 250) * 0.62; // feet to tummy
  const at = (k: Key) => ({ offset: k[0] / s.total, easing: k[6] ?? "ease-in-out" });
  const go = (el: Element | null, frames: Keyframe[]) => {
    if (!el) return;
    const a = el.animate(frames, { duration: s.total });
    a.playbackRate = FAST;
    m.anims.push(a);
  };
  go(float, s.keys.map((k) => ({ ...at(k), transform: `translate(${k[1]}px, ${k[2]}px) translateY(${-C}px) rotate(${k[3]}deg) translateY(${C}px) scale(${k[4]}, ${k[5]})` })));
  go(root.querySelector(".nj-shadow"), s.keys.map((k) => ({ ...at(k), translate: `${k[1] * 0.7}px 0px`, scale: `${Math.max(0.4, 1 + k[2] / 240)}`, opacity: Math.max(0.3, 1 + k[2] / 260) })));
  go(root.querySelector(".nj-flames"), s.keys.map((k) => ({ ...at(k), rotate: `${-k[3]}deg` })));
  if (tier >= 2 && s.air) for (let t = s.air[0]; t <= s.air[1]; t += 45) later(t, () => afterimage(root, float, tier));
}
/** A coloured silhouette of the ninja left behind where it was (the look of src/ui/Ninja.tsx's afterimages, placed
 *  outside the float layer so it stays put while the ninja moves on). */
function afterimage(root: HTMLElement, float: HTMLElement, tier: Tier) {
  const body = float.querySelector<HTMLElement>(".nj-body");
  const rim = float.querySelector<HTMLElement>(".nj-rim");
  const src = float.querySelector(".nj-img")?.getAttribute("src");
  if (!body || !rim || !src || !root.isConnected) return;
  const fs = getComputedStyle(float);
  const wrap = document.createElement("div");
  wrap.className = "early-ghost";
  wrap.style.transform = fs.transform;
  wrap.style.translate = fs.translate;
  const g = document.createElement("div");
  g.className = `nj-ghost t${tier}`;
  g.style.transform = getComputedStyle(body).transform;
  const fill = document.createElement("div");
  fill.className = "nj-ghost-fill";
  for (const k of ["width", "height", "left"] as const) fill.style[k] = rim.style[k];
  fill.style.setProperty("-webkit-mask-image", `url(${src})`);
  fill.style.setProperty("mask-image", `url(${src})`);
  g.appendChild(fill);
  wrap.appendChild(g);
  root.insertBefore(wrap, float);
  const a = wrap.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: 320, easing: "ease-out", fill: "forwards" });
  a.playbackRate = FAST;
  a.finished.then(() => wrap.remove(), () => wrap.remove());
}
/** The streak of light from the ninja to the letter it launches. */
function bolt(a: Pt, b: Pt, tier: Tier, kind: Spec["bolt"]) {
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const lift = Math.sin(t * Math.PI) * (kind === "beam" ? 44 : kind === "stars" ? 24 : 0);
    const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - lift };
    setTimeout(() => (kind === "stars" ? fx.twinkle(p.x, p.y, COLS[tier], 1, 1.4, 20) : fx.glow(p.x, p.y, COLS[tier], 1, kind === "ki" ? 24 : 30, 0.4, 14)), i * 7);
  }
  fx.ring(a.x, a.y, { color: "#fff4dc", r0: 6, r1: 56, width: 8, life: 14 });
  if (kind === "ki") fx.lines(a.x, a.y, 7, "#fff4dc", 46);
}
/** Trail lanes per tier: one warm glow, one gold, a pink and blue pair, a triple rainbow braid. */
const TRAILS: Record<Tier, string[][]> = {
  0: [["#fff4dc", "#ffe38a"]],
  1: [["#ffe38a", "#ffc53d", "#fff4dc"]],
  2: [["#ff7aa2", "#ffd1e3"], ["#5ec8f2", "#c8f0ff"]],
  3: [["#ffb03d", "#ffe94a"], ["#5fd35f", "#a6f0a6"], ["#4ab8ff", "#b48cff"]],
};
/** A letter's trail: one fx.trail per lane (docs/PERF.md fix 7: a glow every 20 stage px travelled, whatever the frame
 *  rate, so a 120 Hz phone lays no more than a 60 Hz one). Each lane is fed a point behind the letter, swung to its side
 *  of the braid; nothing is laid once the letter slows into its slot (t > 0.8), so it is readable on landing. */
function letterTrail(tier: Tier) {
  const lanes = TRAILS[tier];
  const emit = lanes.map((cols, i) =>
    fx.trail(cols, { every: 20, size: lanes.length > 1 ? 26 : 34, drift: 0.4, life: 14, also: i === 0 && tier >= 1 ? (x, y) => void (Math.random() < 0.35 && fx.twinkle(x, y, COLS[tier], 1, 3, 16)) : undefined }),
  );
  return (p: Pt, prev: Pt, t: number) => {
    if (t > 0.8) return;
    const len = Math.hypot(p.x - prev.x, p.y - prev.y);
    if (len < 0.5) return;
    const ux = (p.x - prev.x) / len, uy = (p.y - prev.y) / len;
    // the trail streams out behind the letter, never over its face
    const back = { x: p.x - ux * 56, y: p.y - uy * 56 };
    emit.forEach((f, i) => {
      const off = lanes.length > 1 ? Math.sin(t * Math.PI * 3 + (i * Math.PI * 2) / lanes.length) * 24 : 0;
      f({ x: back.x - uy * off, y: back.y + ux * off });
    });
  };
}
/** How a launched letter moves. A letter is never turned more than about 25 degrees, mirrored or flipped over: children
 *  learning b, d, p and q must never see one upside down on its way to its slot (a spinning p passes through d).
 *  glide: a smooth arc (spells); whirl: swings to and fro (a throw, a leap); dart: leans into a fast, stretched line (a
 *  punch, a kick); corkscrew: loops round its path (a pirouette); hop: squashes and stretches, bouncing along (a flip). */
export type Fly = "glide" | "whirl" | "dart" | "corkscrew" | "hop";
function flyStyle(style: Fly, t: number, k: number): { dx: number; dy: number; css: string } {
  const bell = Math.sin(t * Math.PI);
  switch (style) {
    case "whirl":
      return { dx: 0, dy: 0, css: `rotate(${Math.sin(t * Math.PI * 2.5) * 24 * bell}deg) scale(${k})` };
    case "dart":
      return { dx: 0, dy: 0, css: `rotate(${-16 * (1 - t) * bell}deg) scale(${k * (1 + 0.16 * bell)}, ${k * (1 - 0.12 * bell)})` };
    case "corkscrew": {
      const a = t * Math.PI * 4, r = 26 * bell;
      return { dx: Math.sin(a) * r, dy: (Math.cos(a) - 1) * r * 0.6, css: `rotate(${Math.sin(a) * 16 * bell}deg) scale(${k})` };
    }
    case "hop": {
      const q = Math.sin(t * Math.PI * 3);
      return { dx: 0, dy: 0, css: `scale(${k * (1 + 0.16 * q * bell)}, ${k * (1 - 0.14 * q * bell)})` };
    }
    default:
      return { dx: 0, dy: 0, css: `scale(${k})` };
  }
}
/** Fly a launched thing from a to b. `hold` ms first, where it lifts and shivers on the spot (the ninja winds up),
 *  then a flight of `ms`: an arc `arc` high (a spell), or with `swoop` a letter's path from the bank below into its
 *  slot: up out of the bank, across the gap between the two rows, and up into its slot from underneath, so it never
 *  passes over the letters already in the word. Resolves on arrival (and removes it). */
function flyTo(el: HTMLElement, size: { w: number; h: number }, a: Pt, b: Pt, o: { hold: number; ms: number; arc: number; swoop?: boolean; style: Fly; scale: (t: number) => number; tier: Tier }): Promise<void> {
  const lift = o.hold ? 12 : 0;
  const a2 = { x: a.x, y: a.y - lift };
  const c = { x: (a2.x + b.x) / 2, y: Math.min(a2.y, b.y) - o.arc };
  const c1 = { x: a2.x, y: a2.y - 80 }, c2 = { x: b.x, y: b.y + 160 };
  const at = (e: number): Pt => {
    const u = 1 - e;
    if (o.swoop) return { x: u ** 3 * a2.x + 3 * u * u * e * c1.x + 3 * u * e * e * c2.x + e ** 3 * b.x, y: u ** 3 * a2.y + 3 * u * u * e * c1.y + 3 * u * e * e * c2.y + e ** 3 * b.y };
    return { x: u * u * a2.x + 2 * u * e * c.x + e * e * b.x, y: u * u * a2.y + 2 * u * e * c.y + e * e * b.y };
  };
  const put = (p: Pt, extra: string) => (el.style.transform = `translate(${p.x - size.w / 2}px, ${p.y - size.h / 2}px) ${extra}`);
  const trail = letterTrail(o.tier);
  return new Promise((resolve) => {
    const t0 = performance.now();
    let done = false;
    let last = a2;
    const end = () => {
      if (done) return;
      done = true;
      el.remove();
      resolve();
    };
    const frame = (now: number) => {
      if (done) return;
      const e0 = (now - t0) * FAST;
      if (e0 < o.hold) {
        const u = e0 / o.hold;
        put({ x: a.x, y: a.y - lift * Math.sin((u * Math.PI) / 2) }, `rotate(${Math.sin(u * Math.PI * 5) * 5 * u}deg) scale(${1 + 0.12 * u})`);
      } else {
        const t = Math.min(1, (e0 - o.hold) / o.ms);
        const e = t * t * (3 - 2 * t) * 0.5 + t * 0.5;
        const f = flyStyle(o.style, t, o.scale(t));
        const q = at(e);
        const p = { x: q.x + f.dx, y: q.y + f.dy };
        put(p, f.css);
        trail(p, last, t);
        last = p;
        if (t >= 1) return end();
      }
      requestAnimationFrame(frame);
    };
    put(a, "");
    requestAnimationFrame(frame);
    setTimeout(end, o.hold + o.ms + 500); // never hang (a hidden tab pauses animation frames)
  });
}
/** Where a launch lands: gold and white rings (never red), sparkles, and a soft sound. */
function landing(b: Pt, tier: Tier, how: "place" | "chime" | "none") {
  if (how === "none") return;
  fx.ring(b.x, b.y, { color: tier >= 2 ? "#fff4dc" : "#ffe38a", r1: 104 + tier * 10, width: 10 });
  if (tier >= 1) fx.ring(b.x, b.y, { color: tier >= 2 ? "#ffe38a" : "#fff4dc", r1: 150 + tier * 14, width: 6, life: 26 });
  // sparkles fly clear of the letter fast, so it is readable as Sensei asks for the next sound
  fx.twinkle(b.x, b.y, COLS[tier], 7 + tier * 2, 14 + tier, 20);
  (how === "chime" ? sfx.twinkle : sfx.place)();
}
const centreOf = (el: Element): Pt => {
  const r = stageRect(el);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};
/** The ninja launches letter tile `from` into `to` (its glowing copy flies; the caller hides the real one), or with no
 *  `from` casts a spell orb from its hands to `to`. Resolves when it lands (about 0.45-0.65 s). `land`: the landing's
 *  rings and sound (a soft place, a chime, or nothing when the caller celebrates the landing itself). */
export function launch(l: Launch, from: Element | null, to: Element | Pt, o: { land?: "place" | "chime" | "none" } = {}): Promise<void> {
  const tier = streak.tier;
  const s = specOf(from ? l : "cast", tier);
  const layer = fxDom();
  moveNinja(s, tier);
  const dst = to instanceof Element ? centreOf(to) : to;
  const hand = () => onNinja(s, s.depart);
  if (s.poses[0][1] === "cast") {
    const h = onNinja(s, 0);
    fx.implode(h.x, h.y, COLS[tier], 12 + tier * 4, 130, 16);
  }
  if (from && layer) {
    // the letter: a glowing copy lifts off the bank tile as the ninja winds up, and leaves when the light reaches it
    const r = stageRect(from);
    const src = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    const el = document.createElement("div");
    el.className = `fx-carry early-fly t${tier}`;
    el.style.width = `${r.w}px`;
    el.style.height = `${r.h}px`;
    const c = from.cloneNode(true) as HTMLElement;
    c.classList.remove("pop-in", "drop-in", "wrong", "hint", "pressed", "used");
    Object.assign(c.style, { position: "absolute", inset: "0", margin: "0", width: "100%", height: "100%", transform: "none", translate: "none", animation: "none" });
    el.appendChild(c);
    layer.appendChild(el);
    const toR = to instanceof Element ? stageRect(to) : null;
    const endScale = toR?.w ? Math.min(1.4, Math.max(0.5, toR.w / r.w)) : 1;
    const ms = Math.max(260, Math.min(440, (Math.hypot(dst.x - src.x, dst.y - src.y) / s.speed) * 1000));
    // silent: the letter's own sound is being said as it goes (only a soft tock as it lands)
    setTimeout(() => bolt(hand(), src, tier, s.bolt), s.depart);
    return flyTo(el, r, src, dst, {
      hold: s.depart + 50, ms, arc: 0, swoop: true, style: s.style, tier,
      scale: (t) => (1.12 + (endScale - 1.12) * t) * (1 + Math.sin(t * Math.PI) * 0.16),
    }).then(() => landing(dst, tier, o.land ?? "place"));
  }
  // a spell: an orb leaves the ninja's hands
  return sleep(s.depart).then(() => {
    sfx.magic();
    const from = hand();
    if (!layer) return;
    const size = 70 + tier * 8;
    const orb = document.createElement("div");
    orb.className = `fx-orb t${tier}`;
    orb.style.width = orb.style.height = `${size}px`;
    orb.innerHTML = "<i></i><b></b>";
    layer.appendChild(orb);
    fx.ring(from.x, from.y, { color: "#fff4dc", r0: 8, r1: 80, width: 9, life: 14 });
    const ms = Math.max(300, Math.min(560, (Math.hypot(dst.x - from.x, dst.y - from.y) / s.speed) * 1000));
    return flyTo(orb, { w: size, h: size }, from, dst, { hold: 0, ms, arc: s.arc ?? 120, style: "glide", tier, scale: (t) => Math.min(1, 0.45 + t * 3) * (1 + Math.sin(t * Math.PI * 6) * 0.05) }).then(() =>
      landing(dst, tier, o.land ?? "place"),
    );
  });
}

// ---------------------------------------------------------------- lines
const LINE_IDS = new Set(LINES.map((l) => l.id));
const HAS_LINE = (id: string) => LINE_IDS.has(id);
const hasLine = HAS_LINE;
/** A line, if it is recorded (TEACHER_SCRIPT §7.3: every caller guards, so the wording can ship before its audio). */
const L = (id: string | null | undefined): Say[] => (id && HAS_LINE(id) ? [{ line: id }] : []);
/** Clips in a row, with a short gap between the parts that say something. */
const seq = (...parts: Say[][]): Say[] => parts.filter((p) => p.length).flatMap((p, i) => (i ? [{ gap: 250 } as Say, ...p] : p));
/** A pure sound presented to the child: its petal is on screen (the nav row's, the hero's), or pops above `at`. */
const petalS = (p: PhonemeId, at?: SoundAt): Say => ({ sound: p, show: "petal", ...(at ? { at } : {}) });
/** A letter tile's voice (a spelling saying its sound as it lights or flies): the letters are the display (SD §1 B). */
const tileS = (p: PhonemeId): Say => ({ sound: p, show: "tile" });
/** [w, first]: the word with its first sound held where there is a held clip, else the plain word (/t/ can't be held;
 *  never the slow way in a first-sound game, FS1). */
const heldFirst = (w: string): Say => (HELD_ONSET.has(w) ? { onset: w } : { word: w });
/** "This is a mop." (docs/SPEECH_TEMPLATES.md `w_name_pic`: today the whole recording `fm_name_<w>`, which every card
 *  here has; a picture without one is named by its word alone, never "This is a…" spliced onto it). */
const nameSay = (w: string): Say[] => speak("w_name_pic", { picture: w });
/** The files a list of clips plays (lines, words, slow words, pure sounds), to fetch and decode ahead of time. */
const sayUrls = (s: readonly Say[]): string[] =>
  s.flatMap((it) => ("line" in it ? [urls.line(it.line)] : "word" in it ? [urls.word(it.word)] : "stretch" in it ? [urls.stretch(it.stretch)] : "sound" in it ? [urls.sound(it.sound)] : []));
/** A game's opening lines on this form, the recorded ones (games.ts; `variant` picks a short opening). */
const openingSay = (game: GameId, form: FrameForm, variant?: string): Say[] => seq(...openingLines(GAMES[game], form, {}, variant).map((id) => L(id)));
/** The id of the last clip a list of clips plays (a run of sounds: its last sound), as onClip() names it. */
const lastClipOf = (s: readonly Say[]): string | null => {
  for (let k = s.length - 1; k >= 0; k--) {
    const it = s[k];
    if ("sounds" in it) {
      const p = it.sounds.at(-1)?.p;
      if (p) return `sound:${p}`;
      continue;
    }
    const id = clipId(it);
    if (id) return id;
  }
  return null;
};
/** Do `fn` once, when the clip `id` starts (at once when there is none). Returns the unsubscribe. */
const whenClip = (id: string | null, fn: () => void): (() => void) => {
  if (!id) return fn(), () => {};
  const off = onClip((c) => {
    if (c !== id) return;
    off();
    fn();
  });
  return off;
};
/** Publish the scene for bots and the checks (`game`: the registry's id, TEACHER_SCRIPT §2.6). */
const publish = (st: Record<string, unknown>) => void ((window as any).__snState = st);

// ---------------------------------------------------------------- streak beats
/** Count an answer held back by rightAnswer, once its teaching has been said: the ninja powers up (the flash, the
 *  rings, one more flame) and its line ("Ninja power!", "Super ninja streak!", "Ten in a row!…") is said at once, here,
 *  as the praise for that answer. `part`: a letter of a word (Dec2: it lights the flames; the word is the answer). */
export async function tierBeat(o: { part?: boolean; quiet?: boolean } = {}): Promise<void> {
  const e = streak.hit({ line: false, part: o.part });
  if (!e.tierUp) return;
  // `quiet`: the level's closing line or the next game's frame comes straight after (it is the praise there, and the
  // talk before the child's next tap stays short): the power-up is seen, not said
  const id = o.quiet ? null : streakLine(e);
  if (id) tierLineSaid(id, await say({ line: id }));
  else await sleep(o.quiet ? 600 : 800); // no line (Dec2: not earned yet, or quiet): let the power-up be seen
}
/** A wrong answer. From a streak the ninja reacts by itself; from zero it still tilts its head ("hmm?"), so every slip
 *  gets the same gentle look and never a hurt one. It keeps its puzzled look through the correction (the caller puts it
 *  back with ninja.pose(null)). A lost streak of 3 or more: its flames puff out and "Keep going, ninja." comes before
 *  the correction, so the correction's target is the last thing heard. */
export async function wrongAnswer(): Promise<void> {
  const e = streak.miss({ line: false });
  if (e.prevN === 0) void ninja.act("think");
  ninja.pose("think");
  const lost = streakLine(e);
  // (not straight after a cheer: "Ninja power!" then "Keep going, ninja." within 5 s is two cheers stacked; the flames
  // puffing out say it)
  if (lost && ((performance.now() - cheeredAt) * FAST) / 1000 > CHEER_GAP_S) await say({ line: lost });
}
/** When Sensei last began a line of praise or a streak line (game time is `* FAST`), for wrongAnswer. */
let cheeredAt = -1e9;
const CHEER_GAP_S = 5.5;
const CHEER = /^(tv_praise_|tv_fs_praise_|tv_yay_|yay_|streak_(?!lost)|tv_streak_|audit_streak_first)/;
/** Listen for praise and streak lines while a level is up (useLevelAudio). */
const watchCheers = () => onClip((id) => void (CHEER.test(id) && (cheeredAt = performance.now())));
/** Level start: the audio engine exists before any child scene speaks (its speech counter only works once it does),
 *  and the streak lines are ready to play. */
export function useLevelAudio() {
  useLayoutEffect(() => {
    playMusic("dojo");
    preload(["streak_3", "streak_6", "tv_streak_10", "streak_lost"].filter(hasLine).map(urls.line));
    return watchCheers();
  }, []);
}
/** End of the level: the level's closing line (TEACHER_SCRIPT §5.6: what the child did; it is the level's praise, so
 *  nothing is stacked before it) with the ninja's big finish, then the reward screen (unless the child has gone home
 *  meanwhile), whose Hear it again says the closing line first (docs/NAVIGATION.md rule 7). */
export function useFinish(onDone: LevelProps["onDone"], closing?: readonly string[]) {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => void (alive.current = false);
  }, []);
  return async (n: number) => {
    // let the last move land, and a power-up it earned play out, so neither cuts the big finish short
    await Promise.race([ninja.linesDone(), sleep(2500)]);
    for (let t = 0; t < 8 && ninja.busy; t++) await sleep(100);
    if (!alive.current) return;
    const lines = (closing ?? []).filter(HAS_LINE);
    await Promise.all([lines.length ? say(seq(...lines.map((l) => L(l)))) : null, ninja.celebrate()]);
    if (alive.current) onDone(n, lines[0] ? { closing: lines[0] } : undefined);
  };
}

// ---------------------------------------------------------------- navigation in a turn (docs/NAVIGATION.md §3)
/**
 * Hear it again, Show me again and the sound picture for a scene whose script talks between the child's turns (the
 * picture games, the word builder, the reading check, the warm-ups). The speaker (and the sound picture) are drawn here,
 * in the nav row's slots (or at `at`), not by the nav layer (`againAt: "own"`), so the speaker can stay put and go dim
 * while Sensei is still talking: a replay then would only be cut off by her next line. A tap on the dim speaker wiggles
 * it, as on the dim Next arrow; it turns gold when the child's turn starts (`ready`). The paw is the nav layer's while
 * the turn waits (`show`), or drawn here at `showAt` (beside a word card, where the letter bank fills the row), dim
 * while not ready. `hidden`: a hold covers the scene (its own controls are the nav layer's). `speed`: the tortoise and
 * rabbit badges (TEACHER_SCRIPT §9.6) beside the speaker. `soundIn: "glide"`: the petal has just glided into its slot
 * (a hero petal handing over), so it doesn't pop in again.
 */
export function TurnNav({ ready, again, show, showAt, sound, hidden, at, size, noSpeaker, speed, soundIn, showPulse }: {
  ready: boolean;
  again: (() => Promise<unknown>) | null;
  show?: (() => Promise<unknown>) | null;
  showAt?: CSSProperties;
  sound?: PhonemeId | null;
  hidden?: boolean;
  at?: CSSProperties;
  size?: number;
  /** the scene's own control is the speaker (a word card with no picture): register Hear it again, draw no speaker */
  noSpeaker?: boolean;
  speed?: SpeedSpec | null;
  soundIn?: "pop" | "glide";
  /** the paw pulses ("Shall I show you again? Tap my paw.") */
  showPulse?: boolean;
}) {
  const [wig, setWig] = useState<"" | "again" | "show">("");
  useEffect(() => {
    if (!wig) return;
    const t = setTimeout(() => setWig(""), 420);
    return () => clearTimeout(t);
  }, [wig]);
  // (a promise either way, so a tap on a dim control never holds lesson clocks while Sensei talks on)
  const wiggle = (k: "again" | "show") => (setWig(k), Promise.resolve());
  const onAgain = () => (ready && again ? again() : wiggle("again"));
  const onShow = () => (ready && show ? show() : wiggle("show"));
  useNav({ again: again ? onAgain : null, againAt: "own", sound: sound ?? null, show: ready && show && !showAt ? show : null, showPulse: !!showPulse, ...(speed !== undefined ? { speed } : {}) });
  const held = useHeld(); // (a hold's own sound picture takes the row's slot meanwhile)
  if (hidden) return null;
  const S = NAV_SLOTS.row;
  return (
    <>
      {again && !noSpeaker && (
        <ReplayButton
          size={size ?? S.again.d}
          className={`nav-ctl navc-ctl ${ready ? "" : "navc-dim"} ${wig === "again" ? "navc-wiggle" : ""}`}
          style={at ?? slotStyle(S.again)}
          onReplay={onAgain}
        />
      )}
      {show && showAt && <ShowAgainButton size={S.show.d} pulse={showPulse} className={`nav-ctl navc-ctl navc-show ${ready ? "" : "navc-dim"} ${wig === "show" ? "navc-wiggle" : ""}`} style={showAt} onShow={onShow} />}
      {sound && !held && <SoundBadge key={sound} p={sound} size={S.sound.d} className={`nav-ctl ${soundIn === "glide" ? "" : "pop-in"}`} style={slotStyle(S.sound, S.sound.d, badgeHeight(S.sound.d))} onTap={ready ? undefined : () => sfx.tap()} />}
    </>
  );
}

// ---------------------------------------------------------------- shared bits
/** How a picture card looks right now (docs/FIRST_MINUTES.md §11 "States"): being named (spot, a warm-white ring,
 *  never gold), the answer's hint (glow, gold), right, found (a tap-all find), wrong (a wobble, never red) and dim. */
export type CardState = "glow" | "right" | "wrong" | "dim" | "spot" | "found" | "";
const plateOf = (w: string) => PIC_PLATES[w] ?? { plate: "sky" as const, grounded: true };
/** A picture card (§11): a painted plate in the picture's own swatch (the same colour on its sticker), a warm halo
 *  behind the picture, a contact shadow under grounded things, and the picture fitted by `contain` into a safe box
 *  (78% × 74% of the plate, a little above centre), so nothing ever touches the plate's edge. The plate sits inside
 *  a `gutter` that belongs to the element itself: the lift, rings, bounce and star stamp all stay inside it, so no
 *  card is ever clipped. Dimming never uses opacity (a card is never see-through). `size` is the plate. */
export function PicCard({ w, onTap, state, size = 250, gutter = 24, wait, className = "", still }: { w: string; onTap?: (el: HTMLElement) => void; state?: CardState; size?: number; gutter?: number; wait?: boolean; className?: string; still?: boolean }) {
  const p = plateOf(w);
  const style = { width: size + 2 * gutter, height: size + 2 * gutter, padding: gutter, "--plate": PLATE_COLOURS[p.plate], "--ps": `${size}px` } as React.CSSProperties;
  const plate = (
    <span className={`pcard-plate ${p.plate === "night" ? "night" : ""}`}>
      <span className="pcard-halo" aria-hidden="true" />
      {p.grounded && <span className="pcard-shadow" aria-hidden="true" />}
      <img src={img(`pic_${w}`)} alt="" draggable={false} />
      <span className="pcard-sweep" aria-hidden="true" />
      {(state === "right" || state === "found") && <span className="pcard-tick" aria-hidden="true" />}
    </span>
  );
  // `still`: a picture that is part of something bigger to tap (a reading rail) or just shown (a sticker): not a button
  if (still) return <span data-pic={w} data-plate={p.plate} className={`pcard still ${state ?? ""} ${className}`} style={style}>{plate}</span>;
  return (
    <button aria-label={w} data-pic={w} data-plate={p.plate} className={`pcard ${state ?? ""} ${wait ? "wait" : ""} ${className}`} style={style} {...tapProps<HTMLButtonElement>((el) => onTap?.(el))}>
      {plate}
    </button>
  );
}
/** The plate colour of a picture (cards, stickers and rewards all use it). */
export const plateColour = (w: string) => PLATE_COLOURS[plateOf(w).plate];

/** Lines under a picture: one per sound; `show` = which positions have their spelling revealed. `live`: the letter at
 *  that position is a join-in ("Now you tap it, and say the sound."): tappable, and glowing once `hint`. */
export function SoundLines({ word, show, lit, live }: { word: Word | null; show: number[]; lit?: number; live?: { i: number; hint: boolean; onTap: () => void } | null }) {
  if (!word) return null;
  return (
    <div className="sound-lines">
      {word.segs.map((s, i) => (
        <div key={i} className={`sound-line ${lit === i ? "lit" : ""}`}>
          {show.includes(i) && (
            <span aria-hidden={live?.i === i ? undefined : true} className={`sl-letter ${live?.i === i ? "live" : ""}`} style={{ display: "contents" }} {...(live?.i === i ? tapProps(() => live.onTap()) : {})}>
              <Tile g={s.g} state={live?.i === i && live.hint ? "hint" : ""} className="reveal drop-in" style={{ pointerEvents: live?.i === i ? "auto" : "none" }} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Phases report how far through they are; the bar then moves item by item inside the phase's range. */
const SubProgress = createContext<(f: number) => void>(() => {});

/** Pace follows mastery (content/pace.ts): the level's answers and clock, shared by its phases. A level without a pace
 *  (every level outside Bamboo Village's first lessons) plays every item. */
interface LevelPace {
  pace: Pace | null;
  t0: number;
  tally: PaceTally;
}
const PaceCtx = createContext<LevelPace>({ pace: null, t0: 0, tally: { answers: 0, firstTry: 0 } });
/** One phase's pacing: `answered()` after each item the child answered; `next()` at each item boundary. */
function usePhasePace(kind: PhaseKind, readsAfter = false) {
  const lp = useContext(PaceCtx);
  const phase = useRef<PhaseTally>({ firstTry: 0, ownFirstTry: 0 });
  return {
    answered(mode: PaceItem["mode"], firstTry: boolean) {
      if (mode === "ido") return;
      lp.tally.answers++;
      if (firstTry) {
        lp.tally.firstTry++;
        phase.current.firstTry++;
        if (mode === "youdo") phase.current.ownFirstTry++;
      }
    },
    next: (items: readonly PaceItem[], from: number) => nextItem(lp.pace, kind, items, from, lp.tally, phase.current, ((performance.now() - lp.t0) * FAST) / 1000, readsAfter),
    paced: !!lp.pace,
  };
}
const useReportProgress = (f: number) => {
  const report = useContext(SubProgress);
  useEffect(() => report(f), [f]);
};

/** The play area (docs/HERO.md): right of the ninja zone (stage x 0-330) and left of the Help corner. Rows are centred in it. */
export const PLAY = { left: 340, right: 160 } as const;
export const PLAY_CX = (1280 - PLAY.right + PLAY.left) / 2;

/** A level's frame: the background, the ninja bottom-left (and its streak's light), the progress bar, the caption
 *  bubble. `top`: something in place of the progress bar (the warm-ups' lesson beads). */
export function Frame({ level, children, progress: fixed, range, top, className = "" }: { level: Level; children: ReactNode; progress?: number; range?: [number, number]; top?: ReactNode; className?: string }) {
  useState(() => beginLevel(level)); // the narrative ledger's level (during the first render, before the games ask)
  const [pace] = useState<LevelPace>(() => ({ pace: paceOf(level), t0: performance.now(), tally: { answers: 0, firstTry: 0 } }));
  const world = worldOf(level);
  const [sub, setSub] = useState(0);
  const { tier } = useStreak();
  // a new level starts a new streak; the ninja mounts after the reset, so it never arrives wearing old flames
  const [fresh, setFresh] = useState(false);
  useLayoutEffect(() => {
    streak.reset();
    setFresh(true);
  }, []);
  useEffect(() => setSub(0), [range?.[0]]);
  const progress = range ? range[0] + (range[1] - range[0]) * Math.min(1, sub) : fixed ?? 0;
  return (
    <div className={`scene early streak-${fresh ? tier : 0} ${className}`}>
      <img className="bg-img" src={img(level.kind === "listen" || level.kind === "ears" || level.kind === "picread" ? `bg_${world.key}` : "dojo_bg")} alt="" />
      <div className="vignette" />
      {/* the ninja's power lights up the room from the bottom-left, a little more with every streak tier */}
      <div className="early-light" aria-hidden="true" />
      {fresh && <NinjaSpot />}
      {top ?? (
        <div className="row" style={{ position: "absolute", left: 0, right: 0, top: 18, gap: 6, pointerEvents: "none" }}>
          <div style={{ width: 360, height: 20, borderRadius: 12, border: "4px solid var(--ink)", background: "rgba(43,29,20,.3)", overflow: "hidden" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: "linear-gradient(180deg,#ffe38a,#ffc53d)", transition: "width .4s" }} />
          </div>
        </div>
      )}
      <PaceCtx.Provider value={pace}>
        <SubProgress.Provider value={setSub}>{children}</SubProgress.Provider>
      </PaceCtx.Provider>
      <NarrOverlay />
      <SenseiDock />
    </div>
  );
}

const soundOf = (g: string) => GRAPHEMES[g] as PhonemeId;
const picWords = (f: (w: Word) => boolean) => WORDS.filter((w) => w.pic && f(w)).map((w) => w.text);
const firstIs = (w: string, p: PhonemeId) => (WORD_BY_TEXT[w]?.segs[0].p ?? ORAL_WORDS[w]?.first) === p;
/** Sounds whose petal this child has already met with its introduction: a hero petal that bloomed in First Sounds or
 *  Sound Hunt (`petal:<p>`), or the first petal of all, in a finished warm-up's notice (W1's /s/, TEACHER_SCRIPT §3.5 C).
 *  Such a sound arrives known ("Our next sound is one you know…"): no mist, and no join-in. */
function petalMet(p: PhonemeId): boolean {
  if (heardBefore(`petal:${p}`)) return true;
  const s = store.get();
  return LEVELS.some((l) => !!l.warmup && ((s.stars?.[l.id] ?? 0) > 0 || !!s.warmups?.[l.id]) && !!WARMUPS[l.warmup]?.beats.some((b) => b.kind === "notice" && b.p === p));
}

// ---------------------------------------------------------------- the pick-game engine
/** Something said with the board empty, before an item's cards come: a game's frame or link line, or a sound's petal.
 *  The petal arrives in the middle as a hero (misty, and blooming on its sound, when the child meets it here first),
 *  waits for the child's tap when it is new ("Tap the petal, and say it with me."), then glides to the nav row. */
export type PickStep = { kind: "say"; say: Say[] } | { kind: "petal"; p: PhonemeId; lead: Say[]; intro: boolean; join: Say[] | null };
/** Sensei's narrated I do (TEACHER_SCRIPT §3.13 A, §3.19): the cards drop in, each spotlit on its word in `open`
 *  (`spots`: [line, word, card]; word "*": the whole line); "Hmm, let me listen." and the held first sound or the slow
 *  word (`listen`; `dots`: the card whose sound dots light on its slow word); the model; then the paw taps the answer
 *  on `tapAt`'s word (in `tap`, or in the model when `tap` is empty). */
export interface IdoScript {
  open: Say[]; spots: [line: string, word: string, card: string][]; listen: Say[]; dots?: string; model: Say[]; tap: Say[]; tapAt?: [line: string, word: string];
}
/** The Ready hold after an I do (a game's full form; a recap after 21 days or a struggle). `again`: the frame and the
 *  question (Hear it again), never the demo (that is the paw). */
export interface PickReady { game: GameId; ask: { line: string; once?: "ready:first" | "ready:paw" }; again: Say[] }

export interface PickItem {
  foundation?: FoundationTarget;
  mode: Mode;
  /** extra practice a child on track skips (content/pace.ts) */
  optional?: boolean;
  options: string[]; // ids
  answer: string;
  /** the question; `ask` builds it from the turn's number instead (the stems rotate: SCRIPT_FIXES A5) */
  prompt: Say[];
  ask?: (n: number, o: { named: boolean }) => Say[];
  /** the game (content/games.ts), for the praise, the transcript and the dosage */
  game?: GameId;
  /** said with the board empty, before the cards come */
  steps?: PickStep[];
  /** said as the cards come, before they are named ("Let's do this one together.", "Now you do one all by yourself.") */
  lead?: Say[];
  /** Sensei's I do (mode "ido") */
  ido?: IdoScript;
  /** after the I do: the Ready hold */
  ready?: PickReady;
  /** the 8 s rephrase, and Help's first press (TEACHER_SCRIPT §5.5); the question again when unset */
  idle?: Say[];
  /** a wrong tap: what the tapped card says, then Sensei's correction (TEACHER_SCRIPT §5.4) */
  fix?: (tapped: string, attempt: number, el: Element | null) => { echo: Say[]; say: Say[] };
  /** the fast and slow idea for the praise slot (TEACHER_SCRIPT §9.3), asked each time praise is due; on an I do with a
   *  join-in, after the child's tap (Sound Hunt: its I do is where a slow word is heard, V-script2 C1) */
  fs?: () => string | null;
  /** what the idea hangs on, said straight before it: First Sounds' and Sound Hunt's answer the slow way, its lines
   *  lighting one by one (V-script C1: "The slow way has little gaps…" after a letter tap, with no slow word heard in
   *  the game, was an explanation with nothing to hang on) */
  fsHook?: () => Promise<void>;
  /** the teaching said once it is right ("Mop starts with… /m/", the letters written), after the ninja's move has
   *  landed. `held`: a streak tier beat follows it. `replay`: Show me again (say what was said, record nothing); stop
   *  when `live()` turns false */
  onRight?: (o: { held: boolean; replay?: boolean; live?: () => boolean }) => Promise<void>;
  /** the sound this item is about: its petal sits beside Hear it again from the question on (docs/NAVIGATION.md §4) */
  sound?: PhonemeId;
  /** tidy up just before the next item (what onRight showed stays up through the praise or tier beat) */
  after?: () => void;
  /** this item opens a new part with a long lead ("Now it could be either sound…"): the answer before it gets no
   *  praise line or tier line (the move is its praise), so the talk before the next question stays about 12 s */
  opens?: boolean;
  /** a retired level kind (ListenLevel): the first miss's correction */
  listenAgain?: Say[];
}

/** Games the child plays with their eyes (Ninja Eyes: find how we write the sound). */
const LOOKING: ReadonlySet<GameId> = new Set<GameId>(["find"]);
/** Everyday praise that is about listening ("Wow, great listening!"), wrong for a looking game. */
const LISTENING_PRAISE = new Set(["yay_8"]);
/** A looking game's praise slot: as narrate.tsx afterWordSay's (at most every second right answer, the game's own line
 *  and a generic one taking turns, nothing when a tier line speaks for the answer), but never a listening line (V-script2
 *  C1: w1-2's Ninja Eyes heard "Wow, great listening!"). The general rule is requested in feedback.ts. */
async function lookingPraise(o: PraiseOpts & { held: boolean }) {
  const { held, ...p } = o;
  if (held || !praiseWanted(p)) return void praiseFor({ ...p, replaced: held });
  const line = praiseFor(p);
  // (praiseFor's choice was a listening line: another everyday line, never the one just said)
  if (line) await say({ line: LISTENING_PRAISE.has(line) ? pickPraise() : line });
}

const pickEl = (id: string) => document.querySelector(`.pick-row [aria-label="${CSS.escape(id)}"]`);
/** The hero petal: 220 wide, in the middle of the play area. */
const HERO_W = 220;
const HERO_TOP = 96;
type Hero = { p: PhonemeId; intro: boolean; wait: boolean; busy: boolean; key: number };
/** The petal's join-in ("Tap the petal, and say it with me."): the petal's own label, which the bots look for. While
 *  Sensei waits for it the tap is the child's answer, not a replay, so the petal is marked data-nav="join" meanwhile
 *  (PickBoard), as the word card is in Word Building. */
const PETAL_JOIN = "Hear the sound";
type Join = { label: string } | null;

/** The pick games' engine: the frame and each new sound's petal with the board empty, Sensei's narrated I do and the
 *  Ready hold, then the child's turns (the we do's answer glows after 2 s). `intro`: the game's frame, for the first
 *  turn's Hear it again. `game`/`form`: the registry's game and this play's form (a telling counts at the Ready, or at
 *  the child's first answer on a recap without one). `closing`: this phase ends the level (no praise before its closing
 *  line). `roomyEnd`: what follows this phase is short (First Sounds' "Now let's play Ninja Eyes."), so its last answer
 *  may have praise or the fast/slow idea (otherwise the next phase's link or frame is that answer's only talk). */
function usePickGame(items: PickItem[], opts: { onFinish: (firstTry: number, youdo: number) => void; kind: "pic" | "tile"; avoid?: Move[]; intro?: Say[]; game?: GameId; form?: FrameForm; closing?: boolean; roomyEnd?: boolean }) {
  const pace = usePhasePace("pick");
  const [queue, setQueue] = useState<PickItem[]>(items);
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const [i, setI] = useState(0);
  const [state, setState] = useState<Record<string, CardState>>({});
  const [spot, setSpot] = useState<string | null>(null);
  const [paw, setPaw] = useState<string | null>(null);
  const [demoPaw, setDemoPaw] = useState<Pt | null>(null);
  const [busy, setBusy] = useState(true);
  /** the question is being asked: an answer counts already (it interrupts Sensei), so the bots and checks see a turn */
  const [asking, setAsking] = useState(false);
  const [cards, setCardsState] = useState<"in" | "out" | "leaving">("out");
  const cardsRef = useRef(cards);
  const setCards = (c: "in" | "out" | "leaving") => void ((cardsRef.current = c), setCardsState(c));
  const [hero, setHero] = useState<Hero | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTap = useRef<(() => void) | null>(null);
  const heroKey = useRef(0);
  const [dots, setDots] = useState<{ n: number; lit: number; x: number; y: number } | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [glided, setGlided] = useState(false);
  const [join, setJoin] = useState<Join>(null);
  const [showPulse, setShowPulse] = useState(false);
  const misses = useRef(0);
  const helped = useRef(false);
  const firstTry = useRef(0);
  const youdo = useRef(0);
  const named = useRef(new Set<string>());
  const promptLive = useRef(false);
  const answeredEarly = useRef(false);
  const glowT = useRef(0);
  const [waitTap, setWaitTap] = useState<string | null>(null);
  const [finished, setFinished] = useState(false); // the last answer is in: the board stays up for the finish, but off
  const item = queue[i];
  useReportProgress(i / queue.length);
  // Hear it again: this item's bundle (the game's frame on its first turn, the lead, the naming, the question)
  const bundle = useRef<Say[]>([]);
  const introduced = useRef(false);
  const curPrompt = useRef<Say[]>([]);
  const turnN = useRef(0);
  /** per turn: did the child need the second-miss help or the 16 s point (TEACHER_SCRIPT §2.2 "struggled")? */
  const struggles = useRef<boolean[]>([]);
  const turnIx = useRef(-1);
  const framedDone = useRef(false);
  const readyDone = useRef(false);
  const offeredShow = useRef(false);
  /** Help while Sensei waits in a step (the petal's join-in, the letter's): says that step's line again */
  const stepHelp = useRef<(() => void) | null>(null);
  // Show me again: the last I do, while the turns are about the same sound; it plays on the board in place of the
  // turn's pictures (`replay`), then the turn comes back and its question is asked again
  const demo = useRef<PickItem | null>(null);
  const [replay, setReplay] = useState<PickItem | null>(null);
  const replayTok = useRef(0);
  const replaying = useRef(false);
  const restore = useRef<(() => void) | null>(null);
  const presentTok = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => void ((alive.current = false), replayTok.current++, presentTok.current++, clearTimeout(glowT.current));
  }, []);
  const game = opts.game;

  /** The cards leave (the last item's pictures, or the I do's before its Ready hold). */
  const clearBoard = async () => {
    if (cardsRef.current !== "in") return;
    setCards("leaving");
    await sleep(280);
    if ((cardsRef.current as string) === "leaving") setCards("out"); // (unless a replay has brought them back)
  };
  const struggled = () => void (turnIx.current >= 0 && (struggles.current[turnIx.current] = true));

  /** Say `open`, spotlighting each card on its word (word timings, content/word-times.ts; "*": the whole line). */
  const spotSay = async (open: Say[], spots: IdoScript["spots"]) => {
    const timers: number[] = [];
    const off = onClip((id, start, end) => {
      for (const [line, word, card] of spots) {
        if (line !== id) continue;
        const at = word === "*" ? 0 : wordAt(line, word);
        timers.push(window.setTimeout(() => setSpot(card), (at ?? 0) * 1000));
        if (word === "*") timers.push(window.setTimeout(() => setSpot((s) => (s === card ? null : s)), Math.max(0, (end - start) * FAST - 60)));
      }
    });
    await say(open);
    off();
    timers.forEach(clearTimeout);
    setSpot(null);
  };
  /** Sound Hunt's three dots under a card, lit on the slow word's sounds (content/stretch.ts SLOW_TIMES); the middle one
   *  stays lit after it. Returns a stop function. */
  const lightDots = (w: string, keep: number) => {
    const el = pickEl(w);
    const r = stageRect(el);
    const n = WORD_BY_TEXT[w]?.segs.length ?? 3;
    setDots({ n, lit: -1, x: r.x + r.w / 2, y: r.y + r.h + 4 });
    const timers: number[] = [];
    const off = onClip((id) => {
      if (id !== `stretch:${w}`) return;
      (SLOW_TIMES[w] ?? []).forEach((t, k) => timers.push(window.setTimeout(() => setDots((d) => d && { ...d, lit: k }), t * 1000)));
    });
    return () => {
      off();
      timers.forEach(clearTimeout);
      setDots((d) => d && { ...d, lit: keep });
    };
  };
  /** Do `act` on `word` of `line` when that clip plays (or at 55% of it without timings); `finish()` does it now if it
   *  hasn't happened (the clip never played). */
  const onWord = (line: string | undefined, word: string | undefined, act: () => void) => {
    let done = false;
    const go = () => void (!done && ((done = true), act()));
    let t = 0;
    const off = line
      ? onClip((id, start, end) => {
          if (id !== line) return;
          off?.();
          const at = word ? wordAt(line, word) : undefined;
          t = window.setTimeout(go, at !== undefined ? at * 1000 : Math.max(0, (end - start) * FAST * 0.55));
        })
      : null;
    return { finish: () => (off?.(), clearTimeout(t), go()) };
  };

  /** Sensei's I do on the board (TEACHER_SCRIPT §3.13 A): the cards, "Hmm, let me listen.", the model, and Sensei's
   *  own paw tapping the answer, announced ("I'm going to tap on the sock… now… Look!", src/ui/SenseiDemo.tsx). She
   *  always finishes her own demo; the child's turn comes after it. A picture with no recorded announcement (or a
   *  letter): the old nav-row paw on "So I'll tap it.". False if stopped. */
  const runIdo = async (d: PickItem, live: () => boolean): Promise<boolean> => {
    const s = d.ido!;
    setState({});
    if (cardsRef.current !== "in") {
      setCards("in");
      await sleep(360); // the cards drop in
    }
    if (!live()) return false;
    d.options.forEach((o) => named.current.add(o)); // (the I do's opening names its cards)
    await spotSay(s.open, s.spots);
    if (!live()) return false;
    ninja.pose("listen");
    const stopDots = s.dots ? lightDots(s.dots, WORD_BY_TEXT[s.dots]?.segs.findIndex((g, k) => k > 0 && g.p === d.sound) ?? 1) : null;
    await say(s.listen);
    stopDots?.();
    ninja.pose(null);
    if (!live()) return false;
    const tap = async (el: Element | null = pickEl(d.answer)) => {
      if (!live()) return;
      setState({ [d.answer]: "right" });
      sfx.good();
      const { landed } = rightAnswer(el, opts.kind, { first: false, living: opts.kind === "pic" && LIVING.has(d.answer), avoid: opts.avoid, soft: true });
      await afterLanding(landed);
    };
    /** the paw sets off from its nav slot towards the answer, and taps it on `at`'s word of what is said meanwhile */
    const pawSay = async (lines: Say[][], at?: [line: string, word: string]) => {
      const from = NAV_SLOTS.row.show;
      setDemoPaw({ x: from.x - 55, y: from.y - 55 });
      navLog({ kind: "paw", id: `${d.game ?? game ?? "pick"}:${d.answer}` });
      await sleep(60);
      const r = stageRect(pickEl(d.answer));
      setDemoPaw({ x: r.x + r.w / 2 - 30, y: r.y + r.h / 2 - 20 });
      let tapped: Promise<void> = Promise.resolve();
      const when = onWord(at?.[0], at?.[1], () => void (tapped = tap()));
      for (const part of lines) {
        if (!live()) break;
        await say(part);
      }
      when.finish();
      await tapped;
      await sleep(150);
      setDemoPaw(null);
    };
    // Sensei finishes her own demo (docs/DEMO_CHOREOGRAPHY.md, Jonas 27 Sep: "Let me show you. I'm gonna tap on the
    // sausage now. Look!"): after the model, "I'm going to tap on the sock… now…", her own paw comes out of her
    // portrait and flies to the sock, "Look!", presses, and only then does the sock go green and say its word; the ninja
    // only watches; a calm beat. The child's turn comes after (the Ready hold, or the we do). Never handed to the child
    // half-way ("Here it is. Tap it when you're ready." mid-demo read as a correction: 28 Sep verifiers, C1)
    const now = `tv_demo_now_tap_${d.answer}`;
    if (opts.kind === "pic" && HAS_LINE(now)) {
      await say(s.model);
      if (!live()) return false;
      await sleep(250);
      if (!live()) return false;
      await senseiDemo({
        id: `${d.game ?? game ?? "pick"}:${d.answer}`,
        show: false,
        announce: [{ line: now }],
        target: () => pickEl(d.answer),
        press: () => void (live() && setState({ [d.answer]: "right" })),
        sound: [{ word: d.answer }],
        onWatch: (_t, phase) => ninja.pose(phase === "done" ? null : "listen"),
        alive: live,
      });
      setDots(null);
      return live();
    }
    await pawSay(s.tap.length ? [s.model, s.tap] : [s.model], s.tapAt);
    setDots(null);
    return live();
  };
  /** A sound's petal (TEACHER_SCRIPT §3.13, §3.19; SOUND_DISPLAY §4.6): the hero arrives in the middle, blooms (or
   *  swells) on its sound, waits for the child's tap when the sound is new, then glides to the nav row's sound slot. */
  const petalStep = async (s: Extract<PickStep, { kind: "petal" }>, live: () => boolean, dropNext = false) => {
    setSoundOn(false);
    setGlided(false);
    setHero({ p: s.p, intro: s.intro, wait: false, busy: true, key: ++heroKey.current });
    await sleep(s.intro ? 320 : 260); // the mist grows in (or the petal pops in)
    if (!live()) return;
    await say([...s.lead, ...(s.lead.length ? [{ gap: 150 } as Say] : []), petalS(s.p)]);
    if (s.intro) heard(`petal:${s.p}`);
    if (!live()) return;
    if (s.join?.length) {
      // the join-in: the petal breathes and waits for the child's tap, live from the line's first word. At 8 s it swells
      // and says its sound; at 12 s the lesson goes on (TEACHER_SCRIPT §3.5 C)
      await new Promise<void>((resolve) => {
        let done = false;
        const timers: number[] = [];
        const finish = () => {
          if (done) return;
          done = true;
          timers.forEach(clearTimeout);
          heroTap.current = null;
          stepHelp.current = null;
          setJoin(null);
          resolve();
        };
        heroTap.current = () => {
          if (done) return;
          heroTap.current = null;
          if (isSpeaking()) hush();
          setHero((h) => h && { ...h, wait: false, busy: true });
          setJoin(null);
          void say(petalS(s.p)).then(() => sleep(120)).then(finish);
        };
        // (the idle clock starts again when the line is said again: Help, Hear it again)
        const arm = () => {
          timers.forEach(clearTimeout);
          timers.length = 0;
          timers.push(window.setTimeout(() => !done && void say(petalS(s.p)), 8000), window.setTimeout(finish, 12000));
        };
        stepHelp.current = () => void say(s.join!).then(() => !done && live() && arm());
        setHero((h) => h && { ...h, wait: true, busy: false });
        setJoin({ label: PETAL_JOIN });
        void say(s.join!).then(() => {
          if (done || !live()) return finish();
          arm();
        });
      });
      if (!live()) return;
    }
    // the next item's cards (an I do's) drop in as the petal glides down
    const glide = glideHero();
    if (dropNext) {
      await sleep(220);
      setState({});
      setCards("in");
      await sleep(200);
    } else await glide;
  };
  /** The hero petal glides down into the nav row's sound slot (transform only), where the turn's petal takes over. */
  const glideHero = async () => {
    const el = heroRef.current;
    const slot = NAV_SLOTS.row.sound;
    if (el) {
      const r = stageRect(el);
      if (r.w) {
        const a = el.animate([{ transform: "none" }, { transform: `translate(${slot.x - (r.x + r.w / 2)}px, ${slot.y - (r.y + r.h / 2)}px) scale(${slot.d / HERO_W})` }], { duration: 560, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" });
        a.playbackRate = FAST;
        await a.finished.catch(() => {});
      }
    }
    setHero(null);
    setGlided(true);
    setSoundOn(true);
  };

  const prevMode = useRef<Mode | null>(null);
  const present = async (it: PickItem) => {
    const my = ++presentTok.current;
    const live = () => alive.current && my === presentTok.current;
    setBusy(true);
    setState({});
    setPaw(null);
    setShowPulse(false);
    setGlided(false);
    misses.current = 0;
    helped.current = false;
    clearTimeout(glowT.current);
    // 1. with the board empty: the frame, a sound's petal
    if (it.steps?.length) {
      await clearBoard();
      for (const [k, s] of it.steps.entries()) {
        if (!live()) return;
        if (s.kind === "say") await say(s.say);
        else await petalStep(s, live, k === it.steps.length - 1 && it.mode === "ido");
      }
      if (!live()) return;
    }
    prevMode.current = it.mode;
    // 2. Sensei's I do, and the Ready hold after it (TEACHER_SCRIPT §2.3: the map and the hat slide away, ▶ pops in)
    if (it.mode === "ido" && it.ido) {
      setSoundOn(true);
      if (!(await runIdo(it, live))) return;
      demo.current = it;
      if (it.ready) {
        const r = it.ready;
        setState({});
        // (the cards slide away as Sensei starts to ask: the talk before the child's tap stays short)
        void clearBoard();
        if (!live()) return;
        const how = await holdReady(r.game, {
          ask: [{ line: r.ask.line }],
          again: () => say(r.again),
          show: async (showLive) => {
            if (!(await runIdo(it, showLive))) return;
            setState({});
            await clearBoard();
          },
          sound: it.sound,
        });
        if (how === false || !live()) return;
        framed(r.game, r.ask);
        framedDone.current = true;
        readyDone.current = true;
      }
      await sleep(250);
      if (!live()) return;
      return next(pace.next(queueRef.current, i + 1));
    }
    // 3. the child's turn: the lead, the cards (each named as it is spotlit), the question
    turnIx.current = turnN.current;
    const toName = opts.kind === "pic" ? it.options.filter((o) => !named.current.has(o)) : [];
    // `named`: every card has just been named ("This is a lid. This is a mat."), so the question needn't say them again;
    // asked again later (after Show me again), it is the whole question
    const prompt = it.ask ? it.ask(turnN.current, { named: toName.length === it.options.length }) : it.prompt;
    curPrompt.current = it.ask ? it.ask(turnN.current, { named: false }) : prompt;
    turnN.current++;
    const head: Say[] = !introduced.current && opts.intro?.length ? [...opts.intro, { gap: 400 }] : [];
    introduced.current = true;
    const naming = toName.flatMap((o, k) => [...(k ? [{ gap: 250 } as Say] : []), ...nameSay(o)]);
    bundle.current = seq(head, it.lead ?? [], naming, prompt);
    setReplay(null);
    setCards("in");
    // the lead is said as the cards drop in ("Now you do one all by yourself."); they are named once they have landed
    const landed = sleep(opts.kind === "pic" ? 380 : 260);
    if (it.lead?.length) await say(it.lead);
    await landed;
    if (!live()) return;
    for (const o of toName) {
      if (!live()) return;
      named.current.add(o);
      setSpot(o);
      await say(nameSay(o));
    }
    setSpot(null);
    if (!live()) return;
    // once the question's last clip (its sound) is playing, an eager answer counts: it interrupts Sensei (see choose);
    // a tap before the sound has been heard is a guess, and gets the "wait" wiggle
    answeredEarly.current = false;
    setSoundOn(true);
    const offLive = whenClip(lastClipOf(prompt), () => ((promptLive.current = true), setAsking(true)));
    await say(prompt);
    offLive();
    setAsking(false);
    promptLive.current = false;
    if (answeredEarly.current || !live()) return;
    // the we do: the answer glows after 2 s (TEACHER_SCRIPT §3.13)
    if (it.mode === "wedo") glowT.current = window.setTimeout(() => live() && !answeredEarly.current && setState((s) => (s[it.answer] ? s : { ...s, [it.answer]: "glow" })), 2000);
    setBusy(false);
  };

  useEffect(() => {
    if (item) present(item);
  }, [i]);

  const next = (n: number) => {
    if (n < queueRef.current.length) return setI(n);
    setFinished(true);
    if (game) played(game, { struggled: struggledIn(struggles.current) });
    opts.onFinish(firstTry.current, youdo.current);
  };

  const choose = async (id: string, el?: Element | null) => {
    if (!item || finished) return; // the level is over: the board stays up for the finish, but a tap does nothing
    // a tap during Show me again stops it and brings the turn back (the board was showing the demo's pictures)
    if (replaying.current) return stopReplay();
    if (item.mode === "ido" || cardsRef.current !== "in" || (busy && !promptLive.current)) {
      // Sensei's own demo, or too early (pictures still being named): show we noticed, and to wait. During her paw's
      // demo the card says its word at her next pause, never on top of her (DEMO_CHOREOGRAPHY T15)
      setWaitTap(id);
      setTimeout(() => setWaitTap(null), 450);
      if (item.mode === "ido" && opts.kind === "pic" && demoRunning()) demoTap([{ word: id }]);
      return;
    }
    if (busy) {
      promptLive.current = false;
      answeredEarly.current = true;
      setAsking(false);
      hush();
    }
    clearTimeout(glowT.current);
    const target: FoundationTarget | undefined = item.foundation ?? (opts.kind === "tile" && item.sound ? { kind: "letter", letter: item.answer, sound: item.sound, task: "sound-to-letter" } : undefined);
    if (target) recordFoundation({ target, result: item.options.length === 1 ? "unassessed" : id === item.answer ? "correct" : "incorrect", source: "choice", support: item.mode === "youdo" && misses.current === 0 && state[item.answer] !== "glow" && !paw ? "independent" : "guided" });
    // a recap with no Ready hold, and a game with no Ready (Ninja Eyes), is told at the child's first answer (TS §2.2)
    if (game && !framedDone.current && (opts.form === "recap" || (opts.form === "full" && !GAMES[game].full.ready))) {
      framedDone.current = true;
      framed(game);
    }
    if (id === item.answer) {
      setBusy(true);
      setPaw(null);
      setShowPulse(false);
      setState({ [id]: "right" });
      sfx.good();
      const first = misses.current === 0;
      const { held, landed } = rightAnswer(el ?? pickEl(id), opts.kind, { first, living: opts.kind === "pic" && LIVING.has(id), avoid: opts.avoid, soft: true });
      if (item.mode === "youdo") {
        youdo.current++;
        if (first) firstTry.current++;
      }
      pace.answered(item.mode, first);
      // fetch and decode, while this answer's teaching plays, the clips said after it: the idea's slow word and line,
      // and the next turn's lead and card names, so none loads in the middle of the talk before the next question (a
      // phone on a slow network, or a busy one: a 1.9 s stall there took a run of talk past 12 s)
      const ahead = queueRef.current[pace.next(queueRef.current, i + 1)];
      const idea0 = item.fsHook ? item.fs?.() ?? null : null;
      void preload(sayUrls([...(idea0 ? [{ stretch: item.answer } as Say, { line: idea0 } as Say] : []), ...(ahead?.lead ?? []), ...(opts.kind === "pic" && ahead ? ahead.options.filter((o) => !named.current.has(o)).flatMap(nameSay) : [])]));
      // the model answer follows the tap at once, while the (soft) move is still in the air
      await afterLanding(landed);
      if (item.onRight) await item.onRight({ held });
      else if (opts.kind === "tile" && item.sound) await say(tileS(item.sound));
      // the praise slot (TEACHER_SCRIPT §5.3): at most every second right answer, never before the level's closing
      // line; the game's fast/slow idea takes it the first time in a session (§9.3); a new streak tier is its own praise
      const n = pace.next(queueRef.current, i + 1);
      const closingNext = !!opts.closing && n >= queueRef.current.length;
      const ahead2 = queueRef.current[n];
      // (the phase's last answer, with the next phase's link or frame after it, gets no praise either unless that is
      // short: w1-7's lid · "You heard it, right in the middle." · "Next, we're going to build some words with this
      // sound…" · "Here's our word… [it]" ran 12.1 s)
      // (nor the answer before the last one when the level's closing line follows it, which is the level's praise: a
      // two-item Ninja Eyes had "Well done." · "Find how we write…" /t/ · the tap · the closing line within 5 s)
      const nearClose = !!opts.closing && !!ahead2 && pace.next(queueRef.current, n + 1) >= queueRef.current.length;
      const quiet = closingNext || nearClose || !!ahead2?.opens || (!ahead2 && !opts.roomyEnd);
      // the game's fast and slow idea (TEACHER_SCRIPT §9.3) takes its first praise slot of the session: the first right
      // answer, whatever the praise rhythm (a phase the pace shortens may have no second); it is that answer's praise.
      // Only after a find whose talk after it has room (V-script2 C1): never on the answer that writes a new spelling
      // (the child's letter tap, then a slow word, "made no sense": `fs` says so), nor before a new sound's petal, a
      // turn with a lead of its own or the next phase's frame (the answer's model, its slow word and the idea are about
      // 7.5 s: with those the run passed 12 s)
      const roomy = ahead2 ? !ahead2.steps?.length && !ahead2.lead?.length : !!opts.roomyEnd;
      const g = item.game ?? game;
      const idea = !quiet && !held && roomy && g ? item.fs?.() ?? null : null;
      if (idea && g) {
        praiseBy(idea);
        if (item.fsHook) {
          await item.fsHook();
          await sleep(150);
        }
        if (await say({ line: idea })) fsSaid(idea, g);
      } else if (g && LOOKING.has(g)) await lookingPraise({ held, closingNext: quiet, game: g, every: 2, keptGoing: !first, helped: helped.current });
      else await afterWordSay({ tierUp: held, leftRight: false, reminder: null, gemFirst: null, closingNext: quiet, game: g, praise: { every: 2, keptGoing: !first, helped: helped.current } });
      if (held) await tierBeat({ quiet });
      await sleep(300);
      item.after?.();
      return next(n);
    }
    // wrong: the card wobbles and says its word, Sensei rephrases and hands the turn back (TEACHER_SCRIPT §5.4)
    misses.current++;
    const attempt = misses.current;
    sfx.wrong();
    setBusy(true);
    setState((s) => ({ ...s, [id]: "wrong" }));
    await wrongAnswer();
    const c = item.fix ? item.fix(id, attempt, el ?? pickEl(id)) : { echo: [] as Say[], say: item.listenAgain ?? [] };
    if (attempt >= 2) {
      // together: the answer glows, the rest step back, the paw points and waits
      struggled();
      const dims = Object.fromEntries(item.options.filter((o) => o !== item.answer && o !== id).map((o) => [o, "dim" as const]));
      setState({ ...dims, [id]: "wrong", [item.answer]: "glow" });
      setPaw(item.answer);
    }
    await say(seq(c.echo, c.say));
    // "Shall I show you again? Tap my paw.": a second miss on a first meeting's first two turns, once a game
    if (attempt === 2 && opts.form === "full" && turnIx.current <= 1 && showItem && !offeredShow.current && HAS_LINE("tv_offer_show_miss")) {
      offeredShow.current = true;
      setShowPulse(true);
      await say(L("tv_offer_show_miss"));
    }
    ninja.pose(null);
    setState((s) => ({ ...s, [id]: "" }));
    if (attempt >= 2 && !queueRef.current.slice(i + 1).some((q) => q.answer === item.answer && q.sound === item.sound)) setQueue((q) => [...q, { ...item, mode: "youdo", optional: false, steps: undefined, lead: undefined }]);
    setBusy(false);
  };

  // the turn's idle ladder (TEACHER_SCRIPT §5.5): 8 s the rephrase (the petal swells), 16 s the paw points at the answer
  // (it never taps it), 24 s "Take your time, ninja.", then quiet. Nothing answers for the child.
  useEffect(() => {
    if (busy || finished || !item || item.mode === "ido" || cards !== "in" || replay) return;
    const t = [
      window.setTimeout(() => void say(item.idle ?? curPrompt.current), 8000),
      window.setTimeout(() => {
        struggled();
        setPaw(item.answer);
        void say(L("tv_idle_point"));
      }, 16000),
      window.setTimeout(() => void say(L("tv_take_time")), 24000),
    ];
    return () => t.forEach(clearTimeout);
  }, [busy, i, cards, replay]);

  // Help (TEACHER_SCRIPT §5.5): the rephrase, then the glow ("Look for the glow."), then the paw points
  useHelp(
    (n) => {
      if (stepHelp.current) return stepHelp.current();
      if (!item || item.mode === "ido" || cardsRef.current !== "in") return;
      helped.current = true;
      if (n === 1) return void say(item.idle ?? curPrompt.current);
      setState((s) => ({ ...s, [item.answer]: "glow" }));
      if (n === 2) return void say(L("tv_look_glow"));
      struggled();
      setPaw(item.answer);
      void say(L("tv_idle_point"));
    },
    [i],
  );

  /** Show me again: "Of course. Watch my paw again.", the I do on its own pictures, "Now it's your turn again." and the
   *  turn's question. A tap on the board meanwhile stops it. It never answers for the child. */
  const showItem = !finished && item && item.mode !== "ido" && demo.current && demo.current.sound === item.sound ? demo.current : null;
  const showAgain = async () => {
    const d = showItem, cur = item;
    if (!d || !cur || busy || replaying.current) return;
    const my = ++replayTok.current;
    const live = () => my === replayTok.current && alive.current;
    const saved = state;
    replaying.current = true;
    hush();
    setBusy(true);
    setPaw(null);
    setShowPulse(false);
    setState({});
    const back = () => {
      setReplay(null);
      setDemoPaw(null);
      setDots(null);
      setState(saved);
      replaying.current = false;
    };
    restore.current = back;
    await say(L("tv_show_again"));
    if (live()) setReplay(d);
    if (live()) await runIdo(d, live);
    if (!live()) return;
    restore.current = null;
    back();
    await sleep(300);
    if (!live()) return;
    // the turn again: its question (an eager answer counts, as when it was first asked)
    answeredEarly.current = false;
    const offLive = whenClip(lastClipOf(curPrompt.current), () => ((promptLive.current = true), setAsking(true)));
    await say(seq(L("tv_turn_again"), curPrompt.current));
    offLive();
    setAsking(false);
    promptLive.current = false;
    if (live() && !answeredEarly.current) setBusy(false);
  };
  function stopReplay() {
    replayTok.current++;
    cancelDemo();
    hush();
    restore.current?.();
    restore.current = null;
    replaying.current = false;
    setBusy(false);
  }
  const again = () => say(bundle.current);

  return {
    item, i, total: queue.length, state, spot, paw, demoPaw, choose, waitTap, busy, asking, finished, replay, again, cards, hero, heroRef, heroTap, dots, join, showPulse, glided,
    showAgain: showItem ? showAgain : null, sound: soundOn ? (hero ? null : item?.sound ?? null) : null, setJoin, stepHelp, game,
  };
}
type PickGame = ReturnType<typeof usePickGame>;

/** The tortoise and the rabbit in the picture games: left of the paw's slot, on the floor, clear of the spelling's
 *  lines under a chosen picture and of the ninja, and far enough left (the rabbit ends at x 522) that the demo paw,
 *  setting off from its slot (x 540 on) up to the left-hand card, never passes over the rabbit. */
const PICK_SPEED: SpeedSpec = { at: { x: 446, y: 648 } };
/** The demo paw (Show me again's hand): it sets off from the nav row's paw slot and glides to what it taps. */
function DemoPaw({ at }: { at: Pt | null }) {
  if (!at) return null;
  return (
    <div className="navc-demo-paw" aria-hidden="true" style={{ transform: `translate(${at.x}px, ${at.y}px)` }}>
      <TapHint show style={{ position: "relative" }} />
    </div>
  );
}

function PickBoard({ game, kind, reveal }: { game: PickGame; kind: "pic" | "tile"; reveal?: ReactNode }) {
  const { item: cur, state, paw, choose } = game;
  const held = useHeld();
  // the petal's join-in: its tap is the child's answer, not the petal's Hear the sound (a replay, data-nav="sound"), so
  // the checks count it as one. (SoundBadge sets data-nav itself and never changes it, so React leaves this alone.)
  const joinWait = !!game.hero?.wait;
  useLayoutEffect(() => {
    game.heroRef.current?.querySelector("button.sound-badge")?.setAttribute("data-nav", joinWait ? "join" : "sound");
  }, [joinWait, game.hero?.key]);
  if (!cur) return null;
  // (Show me again plays the I do item on the board, in place of the turn's pictures)
  const item = game.replay ?? cur;
  const n = item.options.length;
  const spotting = !!game.spot;
  return (
    <>
      {/* letters sit a little right of centre (x 430-1090 for three), clear of a long row of streak flames riding a lunge;
          pictures sit high enough for their spelling's lines to stay clear of the nav row (y 564 on) */}
      {game.cards !== "out" && (
        <div
          key={game.replay ? `r${game.i}` : game.i}
          className={`row pick-row pick-${kind} n${n} ${spotting ? "has-spot" : ""} ${game.cards === "leaving" ? "navc-leaving" : ""}`}
          style={{ position: "absolute", ...(kind === "pic" ? PLAY : { left: 400, right: 160 }), top: kind === "pic" ? 128 : 170, gap: n >= 3 ? 36 : 60, flexWrap: "nowrap" }}
        >
          {item.options.map((o, k) => (
            <div key={o} style={{ position: "relative", animationDelay: `${k * 0.08}s` }} className="drop-in">
              {kind === "pic" ? (
                <PicCard w={o} size={240} state={game.spot === o ? "spot" : state[o] ?? ""} wait={game.waitTap === o} onTap={(el) => choose(o, el)} />
              ) : (
                <Tile g={o} size={n <= 3 ? "xl" : "lg"} state={state[o] === "glow" ? "hint" : state[o] === "right" ? "right" : state[o] === "wrong" ? "wrong" : ""} onTap={(el) => choose(o, el)} className={state[o] === "dim" ? "dimmed" : ""} />
              )}
              {paw === o && <TapHint show style={{ right: -50, bottom: -50 }} />}
            </div>
          ))}
        </div>
      )}
      {game.hero && (
        <div ref={game.heroRef} className="pick-row pick-petal" style={{ position: "absolute", left: PLAY_CX - HERO_W / 2, top: HERO_TOP, width: HERO_W, height: badgeHeight(HERO_W) }}>
          <SoundBadge key={game.hero.key} p={game.hero.p} tier="hero" size={HERO_W} intro={game.hero.intro} wait={game.hero.wait} busy={game.hero.busy} className={game.hero.intro ? "" : "pop-in"} onTap={() => (game.heroTap.current ? game.heroTap.current() : void say(petalS(game.hero!.p)))} />
        </div>
      )}
      {game.dots && <SoundDots n={game.dots.n} lit={game.dots.lit} size={30} className="navc-dots" style={{ position: "absolute", left: game.dots.x, top: game.dots.y, translate: "-50% 0" }} />}
      {reveal}
      <DemoPaw at={game.demoPaw} />
      {/* Sensei's own paw in her I do (docs/DEMO_CHOREOGRAPHY.md): over the board, under the nav buttons and her portrait */}
      <SenseiDemoLayer />
      {/* (during a join-in, the petal's or the letter's, Hear it again says what to do again: "Tap the petal…") */}
      <TurnNav
        ready={(!game.busy && !game.finished && game.cards === "in") || !!game.join}
        again={game.join ? () => (game.stepHelp.current?.(), Promise.resolve()) : game.again}
        show={game.join ? null : game.showAgain}
        sound={game.sound}
        hidden={game.finished || held}
        speed={PICK_SPEED}
        soundIn={game.glided ? "glide" : "pop"}
        showPulse={game.showPulse}
      />
    </>
  );
}

const stars = (first: number, youdo: number) => (youdo === 0 ? 3 : first / youdo >= 0.9 ? 3 : first / youdo >= 0.7 ? 2 : 1);
/** The "how we write it" lines, under the picture the child chose (at stage x `x`), kept inside the play area. `live`:
 *  the letter the child taps and says ("Now you tap it, and say the sound."). */
const RevealAt = ({ word, show, x, live, lit }: { word: Word | null; show: number[]; x: number; live?: { i: number; hint: boolean; onTap: () => void } | null; lit?: number }) => {
  if (!word) return null;
  // four or more sounds: narrower lines, so the row keeps clear of the ninja's aura and flames (x 380 on)
  const n = word.segs.length;
  const lw = n >= 4 ? 124 : 140, gap = n >= 4 ? 12 : 18;
  const w = n * lw + (n - 1) * gap;
  const left = Math.max(380, Math.min(1090 - w, x - w / 2)); // clear of the ninja and the Help corner
  // (its lines end at y 542, above the nav row's speaker and sound picture: navc-reveal in nav-C.css; the class
  // pick-row lets the bots find the live letter as they find a card)
  return (
    <div className={`navc-reveal pick-row ${n >= 4 ? "reveal-narrow" : ""}`} style={{ position: "absolute", left, width: w, top: 404, pointerEvents: "none" }}>
      <SoundLines word={word} show={show} live={live} lit={lit} />
    </div>
  );
};
/** Where the chosen picture is (stage x of its centre), so its spelling can appear under it. */
const picX = (id: string) => {
  const r = stageRect(pickEl(id));
  return r.w ? r.x + r.w / 2 : PLAY_CX;
};

/** The reveal under a chosen picture, shared by First Sounds and Sound Hunt: the spelling written by the ninja's spell
 *  at the child's first right answer for it in the level (the we do: "Now watch my ninja write it." · "This is how we
 *  write… /m/" · "Now you tap it, and say the sound." and the child's tap: TEACHER_SCRIPT §3.13, TV-C1.2), silently
 *  after that (SF C9). */
function useReveal(getGame: () => PickGame | null) {
  const [word, setWord] = useState<Word | null>(null);
  const [show, setShow] = useState<number[]>([]);
  const [x, setX] = useState(PLAY_CX);
  const [live, setLive] = useState<{ i: number; hint: boolean; onTap: () => void } | null>(null);
  const written = useRef(new Set<string>());
  /** the spelling the last reveal wrote (with its teaching and the child's letter tap), or null */
  const taught = useRef<string | null>(null);
  /** Show the answer's lines under it; `at`: the spelling's line. Writes it (with the teaching, the first time) or
   *  shows it at once. */
  const reveal = async (o: { answer: string; w: Word; g: string; p: PhonemeId; at: number; held: boolean; replay?: boolean; live: () => boolean }) => {
    setWord(o.w);
    setX(picX(o.answer));
    setShow([]);
    if (!o.replay) taught.current = null;
    if (o.replay || written.current.has(o.g)) {
      setShow([o.at]);
      if (!o.held) await sleep(350);
      return;
    }
    written.current.add(o.g);
    taught.current = o.g;
    const firstInLevel = written.current.size === 1;
    const cast = castSpelling(o.at, () => o.live() && setShow([o.at]));
    if (firstInLevel) await say(L("tv_watch_write"));
    await cast;
    if (!o.live()) return;
    await say(seq(L(firstInLevel ? "tv_how_we_write" : "tv_and_how_we_write"), [petalS(o.p)]));
    if (!o.live() || !HAS_LINE("tv_tap_it_say")) return;
    // the child taps the letter and says the sound with Sensei: live from the line's first word; at 8 s it glows (the
    // hand on it) and says its sound; at 12 s the lesson goes on
    const g = getGame();
    await new Promise<void>((resolve) => {
      let done = false;
      const timers: number[] = [];
      const finish = () => {
        if (done) return;
        done = true;
        timers.forEach(clearTimeout);
        setLive(null);
        g?.setJoin(null);
        if (g) g.stepHelp.current = null;
        resolve();
      };
      const onTap = () => {
        if (done) return;
        if (isSpeaking()) hush();
        setLive(null);
        g?.setJoin(null);
        void say(tileS(o.p)).then(() => sleep(250)).then(finish);
      };
      setLive({ i: o.at, hint: false, onTap });
      g?.setJoin({ label: o.g });
      const arm = () => {
        timers.forEach(clearTimeout);
        timers.length = 0;
        timers.push(window.setTimeout(() => !done && (setLive((l) => l && { ...l, hint: true }), void say(tileS(o.p))), 8000), window.setTimeout(finish, 12000));
      };
      if (g) g.stepHelp.current = () => void say(L("tv_tap_it_say")).then(() => !done && o.live() && arm());
      void say(L("tv_tap_it_say")).then(() => {
        if (done || !o.live()) return finish();
        arm();
      });
    });
  };
  /** The chosen picture's word the slow way, each of its lines lighting on its sound (content/stretch.ts SLOW_TIMES; the
   *  nav's tortoise steps with them): what the game's fast/slow idea hangs on, said straight before it (TEACHER_SCRIPT
   *  §9.3's First Sounds and Sound Hunt rows). After the child's answer, so it hands nothing over (FS1). */
  const [lit, setLit] = useState(-1);
  const slow = async (w: string) => {
    const timers: number[] = [];
    const off = onClip((id) => {
      if (id !== `stretch:${w}`) return;
      (SLOW_TIMES[w] ?? []).forEach((t, k) => timers.push(window.setTimeout(() => setLit(k), t * 1000)));
    });
    await say({ stretch: w });
    off();
    timers.forEach(clearTimeout);
    setLit(-1);
  };
  const clear = () => {
    setWord(null);
    setLive(null);
    setLit(-1);
    taught.current = null;
  };
  /** Does (or did) this answer write the spelling `g` with its teaching? Its letter tap ends the answer: no fast/slow
   *  idea after it (V-script2 C1: "Now you tap it, and say the sound." · < m > · [mug, slowly] · "The slow way has little
   *  gaps…" made no sense). True before the answer's reveal too. */
  const writes = (g: string) => !written.current.has(g) || taught.current === g;
  return { reveal, clear, slow, writes, node: <RevealAt word={word} show={show} x={x} live={live} lit={lit} /> };
}

// ---------------------------------------------------------------- M1: Listening Ears (no letters; a retired level kind)
export function ListenLevel({ level, onDone, onQuit }: LevelProps) {
  const items = useRef<PickItem[]>(
    (() => {
      const mk = (mode: Mode, answer: string, other: string, how: "word" | "slow" | "sounds"): PickItem => {
        const w = WORD_BY_TEXT[answer];
        // (oral blending: the sounds are the question, so no petal while they play: Dec1)
        const prompt: Say[] = how === "word" ? [{ line: "listen_tap" }, { gap: 350 }, { word: answer }] : how === "slow" ? [{ line: "listen_slow" }, { gap: 350 }, x(answer)] : [{ line: "listen_sounds" }, { gap: 350 }, { sounds: w.segs, gap: 420, show: "hidden" }];
        return {
          mode, answer, foundation: how === "word" ? undefined : { kind: "joining", speed: how === "slow" ? "slow" : "fast", task: "recognition" }, options: shuffle([answer, other]), prompt, listenAgain: prompt.slice(2),
          ido: mode === "ido" ? { open: prompt, spots: [], listen: [], model: [{ line: "i_can_hear" }, { gap: 100 }, { word: answer }], tap: [] } : undefined,
          onRight: () => say([{ line: "i_can_hear" }, { gap: 100 }, { word: answer }]).then(() => {}),
        };
      };
      return [
        mk("ido", "pan", "pin", "word"), mk("wedo", "map", "mop", "word"), mk("youdo", "top", "tap", "word"), mk("youdo", "cat", "cot", "word"),
        mk("ido", "sun", "dog", "slow"), mk("wedo", "mat", "bus", "slow"), mk("youdo", "fan", "pig", "slow"), mk("youdo", "man", "hat", "slow"),
        mk("ido", "map", "sun", "sounds"), mk("wedo", "sun", "fan", "sounds"), mk("youdo", "fan", "mug", "sounds"), mk("youdo", "mug", "map", "sounds"),
        mk("youdo", "pan", "sun", "sounds"), mk("youdo", "pig", "mug", "sounds"),
      ];
    })(),
  ).current;
  const [started, setStarted] = useState(false);
  const finish = useFinish(onDone);
  useLevelAudio();
  useHome(onQuit);
  useEffect(() => {
    preload(items.flatMap((it) => [urls.word(it.answer), urls.stretch(it.answer)]));
    (async () => {
      await say({ line: "listen_intro" });
      setStarted(true);
    })();
    return () => hush();
  }, []);
  // one Frame for the whole level, so the ninja (and its streak) stays put from the intro to the finish
  return (
    <Frame level={level} range={[0, 1]}>
      {started && <PickInner items={items} kind="pic" intro={[{ line: "listen_intro" }]} onFinish={(f, y) => finish(stars(f, y))} />}
    </Frame>
  );
}

// ---------------------------------------------------------------- First Sounds, Ninja Eyes (+ building, reading)
/** Sensei's I do per sound (TEACHER_SCRIPT §3.13, §3.15, §3.19, §3.22): the pair the recorded line names, in its order,
 *  and the answer. /p/'s recorded pair is a bus and a pig, but the pig is /p/'s own petal picture (SOUND_DISPLAY A12:
 *  the child would match two pictures), so /p/'s I do taps the pan: "I'll go first. Here's a bus and a pan." once
 *  `tv_ido_pair_bus_pan` is recorded (requested, with its word timings), and until then "Let me show you." with the
 *  cards named one by one. */
const IDO_PAIRS: Partial<Record<PhonemeId, { cards: [string, string]; answer: string; line: string | null }>> = {
  m: { cards: ["map", "hat"], answer: "map", line: "tv_ido_pair_map_hat" },
  s: { cards: ["bed", "sock"], answer: "sock", line: "tv_ido_pair_bed_sock" },
  a: { cards: ["cat", "ant"], answer: "ant", line: "tv_ido_pair_cat_ant" },
  t: { cards: ["jam", "tent"], answer: "tent", line: "tv_ido_pair_jam_tent" },
  n: { cards: ["nut", "hat"], answer: "nut", line: "tv_ido_pair_nut_hat" },
  p: { cards: ["bus", "pan"], answer: "pan", line: "tv_ido_pair_bus_pan" }, // (requested; "Let me show you." until recorded)
  i: { cards: ["pan", "pin"], answer: "pin", line: "tv_ido_pair_pan_pin" },
  o: { cards: ["map", "mop"], answer: "mop", line: "tv_ido_pair_map_mop" },
};
/** The I do's opening: the pair line (each card spotlit on its word), or, without one, "Let me show you." and each
 *  card named while it is spotlit. */
function idoOpen(cards: [string, string], line: string | null): { open: Say[]; spots: IdoScript["spots"] } {
  if (line && HAS_LINE(line)) return { open: [{ line }], spots: cards.map((c): [string, string, string] => [line, c, c]) };
  const spots = cards.flatMap((c): [string, string, string][] => (nameLine(c) ? [[nameLine(c)!, "*", c]] : []));
  // ("Let me show you.", never Pocket Hunt's "I'll find one first.", which is another game's line: 28 Sep verifiers, C1)
  return { open: seq(L("tv_demo_show"), ...cards.map(nameSay)), spots };
}
/** "Next, we're going to build some words with this sound… /i/": its petal pops above the new (empty) lines. */
const slotsEl = () => document.querySelector(".early .slots");
/** Picture words that are also orders to the child: "Tap starts with…" is heard as "Tap!" (and reads as a bare command,
 *  TEACHER_SCRIPT §2.4 rule 2). Never a First Sounds card. */
const SOUNDS_LIKE_AN_ORDER = ["tap", "hop", "kick", "jump", "catch", "push", "pick", "look", "zap"];
/** "Mop starts with…" /m/ (the `ws_starts_with` template: today one recording up to the pure sound, the fs_ line, else
 *  the word and "starts with…"), the sound's petal swelling. */
const fsModel = (w: string, p: PhonemeId): Say[] => speak("ws_starts_with", { picture: w, sound: p }, { show: "petal" });
/** "Pin has this sound in the middle…" /i/. */
const midModel = (w: string, p: PhonemeId): Say[] => (HAS_LINE(`mid_${w}`) ? [{ line: `mid_${w}` }, { gap: 120 }, petalS(p)] : [{ word: w }, { gap: 100 }, { line: "has_in_middle" }, { gap: 100 }, petalS(p)]);

export function FirstSoundLevel(props: LevelProps) {
  const { level } = props;
  const hasBuild = !!level.words?.length, hasRead = !!level.read?.length;
  const [phase, setPhase] = useState<"first" | "find" | "build" | "read">("first");
  const first = useRef(0);
  const youdo = useRef(0);
  // the closing line says what the child did last (SCRIPT_STYLE §5 "Closing lines vary by what happened"): a level that
  // ends on building (w1-10) closes on Word Building's wrap, not First Sounds' ("You listened for the first sound in every
  // word, and you found how we write it." straight after the building ignored it: V-script2 C1); its new sounds are the
  // reward's ("You won back two sounds…")
  const finish = useFinish(props.onDone, hasBuild ? [...(GAMES.build.wrap ?? [])] : levelWrap(level));
  const teach = (level.teach ?? []).map((g) => g.split("=")[0]);
  const sounds = teach.map(soundOf);
  const gameRef = useRef<PickGame | null>(null);
  const rev = useReveal(() => gameRef.current);
  const [form] = useState(() => gameForm("firstsound", { opening: true }));
  const frame = useRef(openingSay("firstsound", form, "new")).current;
  // (no zip: a word most 3-year-olds don't know, FIRST_MINUTES §11; it is on the art list with top, pin, tin and lid)
  const foils = ["dog", "bus", "cup", "hat", "jam", "bed", "fox", "web", "van", "cat", "pig", "fan"];
  const items = useRef<PickItem[]>(
    (() => {
      // the petals' own pictures are never answer cards while a petal is up (SOUND_DISPLAY A12: /a/'s apple, /p/'s pig);
      // nor a picture whose name is also an order ("Tap starts with…" is heard as "Tap!")
      const icons = new Set([...(sounds.map((p) => iconWordOf(p)).filter(Boolean) as string[]), ...SOUNDS_LIKE_AN_ORDER]);
      // only pictures a child names with the right first sound (blind picture audit → content/pic-names.ts), no
      // consonant clusters to start (stop, frog), and with their model and name recorded as whole sentences ("Mop starts
      // with…", "This is a mop."): since 27 Sep every word has a slow clip, so that is what keeps the decks to the
      // pictures a 3-year-old knows. (/a/ is left with the ant alone once the apple goes: on the art list.)
      const targets = (p: PhonemeId) => {
        const loose = [
          ...picWords((w) => w.segs[0].p === p && w.segs.length <= 4 && !["sh", "ch"].includes(w.segs[0].g) && !(w.segs[1] && !PHONEMES[w.segs[0].p].vowel && !PHONEMES[w.segs[1].p].vowel)),
          ...Object.keys(ORAL_WORDS).filter((w) => ORAL_WORDS[w].first === p && PHONEMES[p].vowel),
        ].filter((w) => picSaysFirst(w) && !icons.has(w));
        const strict = loose.filter((w) => HAS_LINE(`fs_${w}`) && !!nameLine(w));
        return shuffle(strict.length ? strict : loose);
      };
      // Each sound's pictures, least recently used first (V-script2 C1: w1-10 used the net twice, w1-3 the ant three times
      // in a minute): the I do's answer counts as used, and the turns a child on track plays take their pictures first,
      // so extra practice (optional) is where a small deck comes round again, as late as it can
      const decks = new Map<PhonemeId, string[]>();
      const deckOf = (p: PhonemeId) => {
        let d = decks.get(p);
        if (!d) decks.set(p, (d = targets(p)));
        return d;
      };
      const used = new Map<string, number>();
      let clock = 0;
      const use = (w: string) => void used.set(w, ++clock);
      const take = (p: PhonemeId): string => {
        const w = deckOf(p).reduce<string | undefined>((best, c) => (best === undefined || (used.get(c) ?? 0) < (used.get(best) ?? 0) ? c : best), undefined) ?? "map";
        use(w);
        return w;
      };
      const turn = (mode: Mode, p: PhonemeId, g: string, answer: string, other: string, o: { optional?: boolean; lead?: Say[] } = {}): PickItem => ({
        mode, optional: o.optional, answer, options: shuffle([answer, other]), sound: p, game: "firstsound", lead: o.lead, prompt: [],
        // the stems rotate (SF C9.3); "Which one starts with…" is the `s_which_starts` template (one sentence once recorded)
        ask: (n) => {
          const stem = stemFor(STEMS.first, n, HAS_LINE);
          return stem === "first_q" ? speak("s_which_starts", { sound: p }, { show: "petal" }) : [{ line: stem }, { gap: 300 }, petalS(p)];
        },
        idle: seq(L("tv_listen_sound_again"), [petalS(p)], L("tv_which_starts_it")),
        fix: (tapped, attempt) => {
          // a first miss: the fast and slow stuck recap takes turns with the held first sound (TEACHER_SCRIPT §9.3)
          const fs = attempt === 1 ? fsStuckSay("firstsound", tapped, { item: `${answer}:${tapped}` }) : null;
          if (fs) return { echo: [{ word: tapped }], say: seq(fs, L(`fm_diff_${tapped}`), seq(L("tv_fix_start"), [petalS(p)])) };
          // [w, first]: the held first sound where it is recorded, else the plain word (an `onset` with no held clip
          // plays the gapped slow way, which is FS1's "never in a first-sound question", and lights no tortoise)
          const c = pictureCorrection({ game: "firstsound", tapped, target: answer, attempt, p });
          return { ...c, echo: c.echo.map((e) => ("onset" in e ? heldFirst(e.onset) : e)) };
        },
        // the idea (TEACHER_SCRIPT §9.3) comes after the answer said the slow way, its lines lighting: never on its own,
        // and never on the answer that writes the spelling (its letter tap ends that answer: V-script2 C1)
        ...(STRETCHED.has(answer) ? { fs: () => (rev.writes(g) ? null : fsIdea("firstsound", "build", { tight: true })), fsHook: () => rev.slow(answer) } : {}),
        onRight: async ({ held, replay, live = () => true }) => {
          // picture-only words (apple, astronaut…) have no spelling data: show just the first sound's spelling
          const w = WORD_BY_TEXT[answer] ?? ({ text: answer, segs: [{ g, p }] } as unknown as Word);
          const said = say(fsModel(answer, p));
          await said;
          if (!live()) return;
          await rev.reveal({ answer, w, g, p, at: 0, held, replay, live });
        },
        after: rev.clear,
      });
      /** A turn whose picture is chosen once the plan is laid out (`take`): the I do's answers first, then the turns a
       *  child on track plays, then the extra practice. `fixed`: its picture is known (a thin sound's). */
      type Slot = { mode: Mode; p: PhonemeId; g: string; optional: boolean; lead?: Say[]; opens?: boolean; foil: string | ((answer: string, k: number) => string); fixed?: string; answer?: string; mix?: number };
      const plan: (PickItem | Slot)[] = [];
      const isSlot = (e: PickItem | Slot): e is Slot => "foil" in e;
      /** Sounds with no picture but the I do's own answer (/a/: only the ant, since SOUND_DISPLAY A12 took the apple
       *  away; more /a/ pictures are asked for). A turn right after its I do would be the same picture again, answered
       *  from memory (V-script2 C1: the ant as Sensei's answer, the child's straight after, and a mixed item: three times
       *  in a minute). So after its I do (whose join-in has the child tap it) it has no turns of its own: its one turn
       *  opens the head to head ("Now it could be either sound."), with its glow, where the child must tell it from the
       *  other sound, and the head to head's other turns are the other sound's. */
      const thin = new Set<PhonemeId>();
      for (const [si, p] of sounds.entries()) {
        const g = teach[si];
        const ip = IDO_PAIRS[p];
        // (never the I do's own cards: the we do is not the demo again)
        const f = shuffle(foils.filter((w) => picSaysFirst(w) && !firstIs(w, p) && !sounds.includes(WORD_BY_TEXT[w]?.segs[0].p) && !icons.has(w) && !ip?.cards.includes(w)));
        const idoCards: [string, string] = ip ? ip.cards : [f[4] ?? "hat", take(p)];
        const idoAnswer = ip ? ip.answer : idoCards[1];
        if (!targets(p).some((w) => w !== idoAnswer)) thin.add(p);
        const known = petalMet(p);
        // the Ready hold after the I do: the game's first sound on its first meeting (and a recap after 21 days or a
        // struggle). A later sound's I do has none (TEACHER_SCRIPT §3.13, §2.2: a new sound's teaching show "with no Ready
        // hold"; V-script2 C1 heard w1-2's /s/ get a second one): it, and every I do on a short form, ends on the child's
        // tap instead ("I'll start, and you finish"), so its talk never runs on into the we do
        // (28 Sep) Sensei now finishes her own demo (DEMO_CHOREOGRAPHY), so a later sound's I do no longer ends on the
        // child's tap, and its talk ran on into the we do (20 s in w1-2's /s/): every non-thin I do gets a Ready hold,
        // the later ones with the generic "Do you want to have a go now?"
        const hold = thin.has(p) ? null : (si === 0 ? readyAsk("firstsound", form) : null) ?? { line: "tv_ready_go" };
        const steps: PickStep[] = [
          ...(si === 0 && frame.length ? [{ kind: "say" as const, say: frame }] : []),
          // a sound the child knows arrives with no mist, and its petal is a join-in too ("Tap its petal, and say it.")
          { kind: "petal", p, lead: L(si === 0 ? "tv_first_sound" : known ? "tv_next_sound_known" : "tv_next_sound"), intro: !known, join: known ? L("tv_petal_say_short") : L("tv_petal_say") },
        ];
        const { open, spots } = idoOpen(idoCards, ip?.line ?? null);
        plan.push({
          mode: "ido", game: "firstsound", answer: idoAnswer, options: [...idoCards], sound: p, steps, prompt: [],
          ido: { open, spots, listen: seq(L("tv_let_me_listen"), [heldFirst(idoAnswer)]), model: fsModel(idoAnswer, p), tap: L("tv_so_i_tap"), tapAt: ["tv_so_i_tap", "tap"] },
          ready: hold ? { game: "firstsound", ask: hold, again: si === 0 ? seq(frame, L(hold.line)) : L(hold.line) } : undefined,
        });
        if (thin.has(p)) continue;
        // the we do (the answer glows after 2 s), the you do, and the extra practice a child on track skips
        plan.push({ mode: "wedo", p, g, optional: false, lead: hold ? [] : L("tv_together"), foil: f[1] ?? "dog" });
        plan.push({ mode: "youdo", p, g, optional: false, lead: L("tv_by_yourself"), foil: f[2] ?? "bus" });
        plan.push({ mode: "youdo", p, g, optional: true, foil: f[3] ?? "cup" });
      }
      if (sounds.length > 1) {
        // head to head ("Now it could be either sound."): the other picture starts with the other sound, never the answer
        // of the turn beside it. With a thin sound: its one turn first (glowing: its first answer), then the other's,
        // with a general foil (the thin picture only in the extra practice, so it isn't the wrong one every time)
        const t = sounds.find((q) => thin.has(q));
        const o = t ? sounds.find((q) => q !== t)! : null;
        const gen = shuffle(foils.filter((w) => picSaysFirst(w) && !sounds.some((q) => firstIs(w, q)) && !icons.has(w)));
        for (let k = 0; k < 4; k++) {
          const p = t && o ? (k === 0 ? t : o) : sounds[k % 2];
          const other = sounds.find((q) => q !== p)!;
          const foil = t && o && k > 0 ? (k === 2 ? deckOf(t)[0] : gen[k % gen.length] ?? "dog") : (answer: string, kk: number) => {
            const near = plan.filter((e): e is Slot => isSlot(e) && e.mix !== undefined && Math.abs(e.mix - kk) === 1).map((e) => e.answer);
            const pool = deckOf(other).filter((w) => w !== answer && !near.includes(w));
            return pool[kk % Math.max(1, pool.length)] ?? deckOf(other)[0] ?? "dog";
          };
          plan.push({ mode: t && k === 0 ? "wedo" : "youdo", p, g: teach[sounds.indexOf(p)], optional: k >= 2, lead: k === 0 ? L("tv_mix_up") : undefined, opens: k === 0, foil, fixed: t && k === 0 ? deckOf(t)[0] : undefined, mix: k });
        }
      }
      // the pictures: the I do's and the turns a child on track plays, in play order, then the extra practice
      for (const e of plan) if (!isSlot(e)) use(e.answer);
      else if (!e.optional) e.answer = e.fixed ?? take(e.p);
      for (const e of plan) if (isSlot(e) && e.optional) e.answer = e.fixed ?? take(e.p);
      const out: PickItem[] = plan.map((e) => {
        if (!isSlot(e)) return e;
        const foil = typeof e.foil === "string" ? e.foil : e.foil(e.answer!, e.mix ?? 0);
        const it = turn(e.mode, e.p, e.g, e.answer!, foil, { optional: e.optional, lead: e.lead });
        return e.opens ? { ...it, opens: true } : it;
      });
      return out;
    })(),
  ).current;
  // Ninja Eyes (TEACHER_SCRIPT §3.13 B): "I say a sound, and you find how we write it."; the first item is a we do
  const [neForm] = useState(() => gameForm("find", { opening: true }));
  const known = [...knownSpellings(level)].filter((g) => g.length === 1);
  const findItems = useRef<PickItem[]>(
    (() => {
      const out: PickItem[] = [];
      const pool = [...new Set([...teach, ...shuffle(known.filter((g) => !teach.includes(g)))])];
      const ne = openingSay("find", neForm, "plain");
      for (let k = 0; k < 4; k++) {
        const g = teach[k % teach.length];
        const p = soundOf(g);
        const opts = shuffle([g, ...shuffle(pool.filter((o) => o !== g)).slice(0, 1 + (k > 1 && pool.length > 2 ? 1 : 0))]);
        out.push({
          mode: k === 0 ? "wedo" : "youdo", optional: k >= 2, answer: g, options: opts, sound: p, game: "find", prompt: [],
          steps: k === 0 && ne.length ? [{ kind: "say", say: ne }] : undefined,
          // the stems rotate from the second item (TEACHER_SCRIPT §3.13 B: "Find how we write…", "Now find how we write…";
          // stemFor keeps the first stem for two items, so a two-item round said it twice: V-script2 C1). "Which of these
          // is the way we write…" is the `s_which_write` template
          ask: (n) => {
            const stems = STEMS.write.filter(HAS_LINE);
            const stem = stems.length ? stems[n % stems.length] : STEMS.write[0];
            return stem === "tv_which_write" ? speak("s_which_write", { sound: p }, { show: "petal" }) : [{ line: stem }, { gap: 300 }, petalS(p)];
          },
          idle: seq(L("tv_listen_sound_again"), [petalS(p)], L("tv_which_way_write_it")),
          fix: (tapped, attempt, el) => pictureCorrection({ game: "find", tapped, target: g, attempt, p, at: el }),
        });
      }
      return out;
    })(),
  ).current;

  useLevelAudio();
  useHome(props.onQuit);
  useEffect(() => () => hush(), []);

  const tally = (f: number, y: number) => {
    first.current += f;
    youdo.current += y;
  };
  const finishAll = () => finish(stars(first.current, youdo.current));
  const link = seq(L(sounds.length === 1 ? "tv_next_build" : "tv_next_build_plain"), sounds.length === 1 ? [petalS(sounds[0], slotsEl)] : []);

  return (
    <Frame level={level} range={phase === "first" ? [0, 0.5] : phase === "find" ? [0.5, 0.75] : [0.75, 1]}>
      {phase === "first" && <PickInner items={items} kind="pic" avoid={NO_SPELL} intro={frame} game="firstsound" form={form} roomyEnd={neForm !== "full"} gameRef={gameRef} onFinish={(f, y) => { tally(f, y); setPhase("find"); }} reveal={rev.node} />}
      {phase === "find" && <PickInner items={findItems} kind="tile" game="find" form={neForm} closing={!hasBuild} onFinish={(f, y) => { tally(f, y); if (hasBuild) setPhase("build"); else finishAll(); }} />}
      {phase === "build" && <BuildSequence level={level} words={level.words!} link={link} closing={!hasRead} onFinish={(f, y) => { tally(f, y); if (hasRead) setPhase("read"); else finishAll(); }} />}
      {phase === "read" && level.read && <ReadCheck pairs={level.read} onFinish={(f, y) => { tally(f, y); finishAll(); }} />}
    </Frame>
  );
}

/** `avoid`: moves the ninja leaves out here (a spell, when the spelling then appears by a spell). `intro`: the game's
 *  frame, said as the first item's step (the first turn's Hear it again says it again). */
function PickInner({ items, kind, onFinish, reveal, avoid, intro, game, form, closing, roomyEnd, gameRef }: { items: PickItem[]; kind: "pic" | "tile"; onFinish: (f: number, y: number) => void; reveal?: ReactNode; avoid?: Move[]; intro?: Say[]; game?: GameId; form?: FrameForm; closing?: boolean; roomyEnd?: boolean; gameRef?: { current: PickGame | null } }) {
  const g = usePickGame(items, { kind, onFinish, avoid, intro, game, form, closing, roomyEnd });
  if (gameRef) gameRef.current = g;
  // a join-in (the petal, the letter) is the child's to tap now; Sensei's own demo is nobody's
  const ido = g.item?.mode === "ido";
  publish({ scene: "pick", game: g.item?.game ?? game, next: g.join ? g.join.label : ido ? null : g.item?.answer, busy: g.join ? false : (g.busy && !g.asking) || g.cards !== "in" || ido });
  return <PickBoard game={g} kind={kind} reveal={reveal} />;
}

// ---------------------------------------------------------------- Sound Hunt (the middle sound) → build → read
export function SoundHuntLevel(props: LevelProps) {
  const { level } = props;
  const g = (level.teach ?? ["i"])[0];
  const p = soundOf(g);
  const [phase, setPhase] = useState<"hunt" | "build" | "read">("hunt");
  const first = useRef(0);
  const youdo = useRef(0);
  const finish = useFinish(props.onDone, levelWrap(level));
  const gameRef = useRef<PickGame | null>(null);
  const rev = useReveal(() => gameRef.current);
  const [form] = useState(() => gameForm("soundhunt", { opening: true }));
  const frame = useRef(openingSay("soundhunt", form)).current;
  const hasBuild = !!level.words?.length, hasRead = !!level.read?.length;
  const PAIRS: Record<string, [string, string][]> = {
    // every picture here passed the blind picture audit (children name it as the word): no fin→"shark", wig→"hair", hot→"soup"
    // (the first pair is the I do's: TEACHER_SCRIPT §3.19 names the pan and the pin)
    i: [["pin", "pan"], ["tin", "tap"], ["zip", "jam"], ["lid", "mat"], ["pig", "cat"], ["milk", "mug"], ["bin", "bag"]],
    o: [["mop", "map"], ["top", "tap"], ["pot", "pan"], ["cot", "cat"], ["log", "leg"], ["dog", "bag"], ["fox", "fan"]],
  };
  const icon = iconWordOf(p);
  const pairs = (PAIRS[g] ?? PAIRS.i).filter(([a, b]) => a !== icon && b !== icon);
  const items = useRef<PickItem[]>(
    (() => {
      const known = petalMet(p);
      const hold = readyAsk("soundhunt", form);
      return pairs.map(([ans, other], k): PickItem => {
        const w = WORD_BY_TEXT[ans];
        const at = w.segs.findIndex((s, i) => i > 0 && s.p === p);
        if (k === 0) {
          const ip = IDO_PAIRS[p];
          const cards: [string, string] = ip?.answer === ans ? ip.cards : [other, ans];
          const { open, spots } = idoOpen(cards, ip?.answer === ans ? ip.line : null);
          return {
            mode: "ido", game: "soundhunt", answer: ans, options: [...cards], sound: p, prompt: [],
            steps: [...(frame.length ? [{ kind: "say" as const, say: frame }] : []), { kind: "petal", p, lead: L("tv_here_sound"), intro: !known, join: known ? L("tv_petal_say_short") : L("tv_petal_say") }],
            // "Hmm, let me listen." and the slow way (Sensei's own demo), three dots under the pin lighting on its sounds;
            // then "I'll start, and you finish": the child taps the pin (the child has met the I do in three First Sounds
            // levels), and the game's fast/slow idea hangs on Sensei's slow word, said again with its dots (V-script2 C1:
            // after the child's first written letter it made no sense, and after the last find it ran into the build
            // phase's link past 12 s). The Ready hold (a full form) follows the tap
            ido: { open, spots, listen: seq(L("tv_let_me_listen"), [x(ans)]), dots: ans, model: midModel(ans, p), tap: [], tapAt: [`mid_${ans}`, "middle"] },
            ...(STRETCHED.has(ans) ? { fs: () => fsIdea("soundhunt", "build", { tight: true }) } : {}),
            ready: hold ? { game: "soundhunt", ask: hold, again: seq(frame, L(hold.line)) } : undefined,
          };
        }
        const options = shuffle([ans, other]);
        return {
          // (I do, we do, you do: as each sound in First Sounds; the second "together" and all but the first alone are
          // extra practice a child on track skips, content/pace.ts)
          mode: k < 3 ? "wedo" : "youdo", optional: k === 2 || k >= 4, answer: ans, options, sound: p, game: "soundhunt", prompt: [],
          lead: k === 1 ? (hold ? [] : L("tv_together")) : k === 3 ? L("tv_by_yourself") : undefined,
          // "Listen to them both…" and the two words PLAIN (FS1: a sound-hunt question never gets the slow way, which
          // would hand over the answer), then the question and the sound. When the cards have just been named ("This is
          // a lid. This is a mat."), the plain words would only say them again: then the question alone (the idle, Help
          // and Hear it again still say both)
          ask: (_n, o) => seq(o.named ? [] : seq(L("tv_swap_both"), [{ word: options[0] }], [{ word: options[1] }]), seq(L("tv_hunt_q"), [petalS(p)])),
          idle: seq(L("tv_listen_sound_again"), [petalS(p)], L("tv_swap_both"), [{ word: options[0] }], [{ word: options[1] }]),
          fix: (tapped, attempt) => pictureCorrection({ game: "soundhunt", tapped, target: ans, attempt, p }),
          // the idea (when the I do's join-in didn't say it) after the answer said the slow way, its middle line lighting
          // with the rest ("t · i · n. Saying it slowly helps us find every sound."): never on its own, and never on the
          // answer that writes the spelling
          ...(STRETCHED.has(ans) ? { fs: () => (rev.writes(g) ? null : fsIdea("soundhunt", "build", { tight: true })), fsHook: () => rev.slow(ans) } : {}),
          onRight: async ({ held, replay, live = () => true }) => {
            await say(midModel(ans, p));
            if (!live()) return;
            await rev.reveal({ answer: ans, w, g, p, at, held, replay, live });
          },
          after: rev.clear,
        };
      });
    })(),
  ).current;
  useLevelAudio();
  useHome(props.onQuit);
  useEffect(() => () => hush(), []);
  const tally = (f: number, y: number) => ((first.current += f), (youdo.current += y));
  const finishAll = () => finish(stars(first.current, youdo.current));
  const link = seq(L("tv_next_build"), [petalS(p, slotsEl)]);
  return (
    <Frame level={level} range={phase === "hunt" ? [0, 0.4] : phase === "build" ? [0.4, 0.8] : [0.8, 1]}>
      {phase === "hunt" && <PickInner items={items} kind="pic" avoid={NO_SPELL} intro={frame} game="soundhunt" form={form} gameRef={gameRef} closing={!hasBuild && !hasRead} onFinish={(f, y) => { tally(f, y); if (hasBuild) setPhase("build"); else if (hasRead) setPhase("read"); else finishAll(); }} reveal={rev.node} />}
      {phase === "build" && <BuildSequence level={level} words={level.words!} link={link} closing={!hasRead} onFinish={(f, y) => { tally(f, y); if (hasRead) setPhase("read"); else finishAll(); }} />}
      {phase === "read" && level.read && <ReadCheck pairs={level.read} onFinish={(f, y) => { tally(f, y); finishAll(); }} />}
    </Frame>
  );
}

// ---------------------------------------------------------------- Dojo: Word Building (gradual release) → Kai and Suki
export function EarlyDojo(props: LevelProps) {
  const { level } = props;
  const [phase, setPhase] = useState<"build" | "read">("build");
  const first = useRef(0);
  const youdo = useRef(0);
  const finish = useFinish(props.onDone, levelWrap(level));
  const hasRead = !!level.read?.length;
  useLevelAudio();
  useHome(props.onQuit);
  useEffect(() => () => hush(), []);
  const tally = (f: number, y: number) => ((first.current += f), (youdo.current += y));
  return (
    <Frame level={level} range={phase === "build" ? [0, 0.7] : [0.7, 1]}>
      {phase === "build" && <BuildSequence level={level} words={level.words!} opening closing={!hasRead} onFinish={(f, y) => { tally(f, y); if (hasRead) setPhase("read"); else finish(stars(first.current, youdo.current)); }} />}
      {phase === "read" && level.read && <ReadCheck pairs={level.read} onFinish={(f, y) => { tally(f, y); finish(stars(first.current, youdo.current)); }} />}
    </Frame>
  );
}

/** One word to build: Sensei's I do (the demo), or the child's we do or you do. `lead`: the demo's opening line, or what
 *  a turn says before its word ("Here's our word…", "Now you build one all by yourself. · Your word is…"); `say`: a
 *  turn's whole dictation, its word included (the `w_your_word` / `w_your_next_word` templates, then the bare word). */
interface BuildItem { word: Word; mode: Mode; extra: number; optional?: boolean; lead: Say[]; say: Say[] }
/** The I do's telling: the frame (full form, the level's opening), the join-ins (the card tap and "Can you find the last
 *  one?": full and recap forms), and the Ready hold after it (full; a recap after 21 days or a struggle). */
interface BuildDemo { frame: Say[]; joins: boolean; hold: PickReady | null }
/** The canonical word Show me again builds on a turn whose own word it would give away (TEACHER_SCRIPT §4.1: am). */
const CANON = "am";

/**
 * Word Building (TEACHER_SCRIPT §3.16 A, §3.17): full form: the frame ("This game is called Word Building…", "Each line
 * is for one sound."), the narrated I do with two join-ins (the child taps the word card; "I start, you finish": Sensei
 * finds the first sound, the child the last), the read-back said together, and the Ready hold; then the we do ("Here's
 * our word…", the answer glowing after 2 s) and the you do. A recap plays the I do with its join-ins and hands over with
 * no hold; the short form opens on one line, and Show me again offers the canonical demo. `opening`: the level opens on
 * Word Building (w1-4, w1-5); `link`: a sound game's level moves on to building ("Next, we're going to build some words
 * with this sound… /i/"). `closing`: the level ends after this phase.
 */
export function BuildSequence({ level, words, onFinish, link, closing }: { level: Level; words: string[]; onFinish: (f: number, y: number) => void; opening?: boolean; link?: Say[]; closing?: boolean }) {
  const [form] = useState(() => gameForm("build", { opening: true }));
  const plan = useRef(
    (() => {
      const ws = words.map((w) => WORD_BY_TEXT[w]).filter(Boolean);
      // a practice dojo (the World Flower's Practise gate) practises a spelling the child has been taught: no demo, one
      // word together, then the child's own
      const practice = !!practiceGemOf(level);
      const demoForm = !practice && (form === "full" || form === "recap");
      // "This word has three sounds, so there are three lines." the first time a child builds a three-sound word
      const three = ws[0]?.segs.length === 3 && !heardBefore("sym:three-lines") && HAS_LINE("tv_build_again_3");
      const opener: Say[] = practice
        ? L("tv_practise_gem")
        : form === "full"
          ? []
          : L(three ? "tv_build_again_3" : form === "recap" ? "tv_build_recap" : "tv_build_again_short");
      const hold = form === "full" ? readyAsk("build", "full") : form === "recap" ? readyAsk("build", "recap") : null;
      const frameLines = form === "full" ? seq(L("tv_build_frame"), L("tv_build_lines")) : [];
      const out: BuildItem[] = [];
      // a sound game's level moving on to building says so ("Next, we're going to build some words…"), in place of the
      // short or recap line
      const lead0 = link?.length ? link : opener;
      if (demoForm) out.push({ word: ws[0], mode: "ido", extra: 0, lead: lead0, say: [] });
      const weWord = demoForm ? ws[1] ?? ws[0] : ws[0];
      // the we do: the hold's "Now let's build one together." leads it; otherwise the opening line (or the link)
      const weLead = seq(demoForm ? [] : lead0, L("tv_our_word"));
      out.push({ word: weWord, mode: "wedo", extra: 0, lead: weLead, say: seq(weLead, [{ word: weWord.text }]) });
      // on their own: the words not built yet first, so a child who moves on early has still built every word it can
      const you = paceOf(level) ? ownWords(ws, out.map((b) => b.word), Math.max(4, ws.length)) : [...ws, ...ws.slice().reverse()].slice(0, Math.max(4, ws.length));
      // the dictation (docs/SPEECH_TEMPLATES.md): "Your word is… [am]", "Your next word is… [at]", then the bare word
      // A word the child has already built in this phase (together, or alone) is extra practice that a child on track
      // skips (content/pace.ts): V-script2 C1 heard w1-4 build am, at, am, at and w1-5 mat, sat, mat. (The demo's word
      // is the child's own first word alone, as TEACHER_SCRIPT §3.16 has it: w1-4 has only am and at.)
      you.forEach((w, k) => {
        const dictate: Say[] = k === 0 ? speak("w_your_word", { word: w.text }) : k === 1 ? speak("w_your_next_word", { word: w.text }) : [{ word: w.text }];
        const by = k === 0 ? L("tv_by_yourself_build") : [];
        const again = out.some((b) => b.mode !== "ido" && b.word === w);
        out.push({ word: w, mode: "youdo", extra: k < 2 ? 0 : 1, optional: again, lead: k < 2 ? seq(by, dictate.slice(0, 1)) : [], say: seq(by, dictate) });
      });
      const demo: BuildDemo = { frame: frameLines, joins: form === "full" || form === "recap", hold: hold ? { game: "build", ask: hold, again: seq(frameLines, L(hold.line)) } : null };
      return { out, demo, three, canon: demoForm ? ws[0] : WORD_BY_TEXT[CANON] ?? ws[1] ?? null, telling: form === "recap" && !hold };
    })(),
  ).current;
  const seqItems = plan.out;
  const [k, setK] = useState(0);
  const first = useRef(0);
  const youdo = useRef(0);
  /** words built right first time in a row (the we do's and the child's own): "What's the first sound?" and the rest
   *  fade once two are, and come back after a miss (SCRIPT_STYLE §5.1, as the Dojo and Monster Battle fade them) */
  const run = useRef(0);
  const pace = usePhasePace("build", !!level.read?.length);
  const struggles = useRef<boolean[]>([]);
  const told = useRef(false);
  /** the next word, decided as the word was finished (settle), so the praise knows whether the closing line follows */
  const nextK = useRef<number | null>(null);
  useReportProgress(k / seqItems.length);
  useEffect(() => {
    if (plan.three) heard("sym:three-lines");
    // the read-back's routines are ready to play the moment a word is built (Move 1's "Now tap the rabbit…" starts as
    // the rabbit goes live), and Kai and Suki's frame the moment the last word ends
    const readBackLines = ["tv_fs_say_sounds_slow", "tv_fs_rabbit_read", "tv_fs_now_fast", "tv_fs_say_slow", "tv_fs_slow_tortoise", "tv_fs_fast_rabbit", "say_sounds_read", "tv_lets_say_read"];
    const kaiSuki = level.read?.length ? ["tv_readers_meet", "tv_rc_how", "tv_you_read_first", "tv_readers_back", "tv_now_readers", "read_tap_sounds"] : [];
    preload([...readBackLines, ...kaiSuki].filter(HAS_LINE).map(urls.line));
  }, []);
  const it = seqItems[k];
  return (
    <BuildOne
      key={k}
      level={level}
      item={it}
      demo={it.mode === "ido" ? plan.demo : null}
      canon={plan.canon && plan.canon !== it.word ? plan.canon : null}
      /* (SCRIPT_STYLE §5.1: the we do and the child's first word alone keep the stems; then the slot lights with no stem
         once two words in a row were right first time. V-script2 C1: three full sets on every word of w1-5 and w1-11) */
      stems={it.mode !== "youdo" || youdo.current === 0 || fadeForm(run.current) === "full"}
      settle={(firstTry) => {
        // the word is built: count it now (the pace may move on after it), so its praise is never said straight
        // before the level's closing line, and the last word before Kai and Suki gets the short read-back
        pace.answered(it.mode, firstTry);
        const n = pace.next(seqItems, k + 1);
        nextK.current = n;
        const last = n >= seqItems.length;
        return { closing: !!closing && last, frameNext: !!level.read?.length && last, nextLead: !last && seqItems[n].lead.length > 0 };
      }}
      onAnswer={() => {
        // a recap with no hold is told at the child's first answer (TEACHER_SCRIPT §2.2)
        if (plan.telling && !told.current) {
          told.current = true;
          framed("build");
        }
      }}
      onDone={(firstTry, struggled) => {
        if (it.mode !== "ido") struggles.current.push(struggled);
        if (it.mode !== "ido") run.current = firstTry ? run.current + 1 : 0;
        if (it.mode === "youdo") {
          youdo.current++;
          if (firstTry) first.current++;
        }
        // a child on track moves on after about three words right first time (content/pace.ts); a built word was
        // counted as it was finished (settle), the demo is counted here
        let n = nextK.current;
        nextK.current = null;
        if (n === null) {
          pace.answered(it.mode, firstTry);
          n = pace.next(seqItems, k + 1);
        }
        if (n < seqItems.length) setK(n);
        else {
          played("build", { struggled: struggledIn(struggles.current) });
          onFinish(first.current, youdo.current);
        }
      }}
    />
  );
}

/**
 * One word. The I do (`demo`): the frame, the demo with its join-ins, the read-back together, the Ready hold. A turn:
 * the lead and the word, then each slot's question ("What's the first sound?", "Now the last sound. Listen right to the
 * end…" the first time in a save); the we do's answer glows after 2 s. A tile flies home saying its sound. The read-back
 * follows fast and slow's moves (TEACHER_SCRIPT §9: Move 1's rabbit, S~W's "Say the sounds, and read the word.", Sensei's
 * pair, the faded form), then at most one thing: a reminder, praise, or the game's fast/slow praise. `canon`: the word
 * Show me again builds (the demo's own, never this turn's), swapped onto the board for the replay.
 */
function BuildOne({ level, item, onDone, demo, canon, settle, onAnswer, stems }: {
  level: Level;
  item: BuildItem;
  onDone: (firstTry: boolean, struggled: boolean) => void;
  demo: BuildDemo | null;
  canon: Word | null;
  /** say each slot's question ("What's the first sound?"); faded, the slot only lights (a miss brings it back) */
  stems: boolean;
  /** the word is built: count it, and say whether the level's closing line (`closing`) or Kai and Suki's frame
   *  (`frameNext`) comes straight after it, or a word with a lead of its own ("Your word is…": `nextLead`) */
  settle: (firstTry: boolean) => { closing: boolean; frameNext: boolean; nextLead: boolean };
  onAnswer: () => void;
}) {
  const { word, mode, extra } = item;
  const known = [...knownSpellings(level)];
  const bankOf = (w: Word, n: number) => {
    const need = w.segs.map((s) => s.g);
    return shuffle([...need, ...shuffle(known.filter((g) => !need.includes(g) && g.length === 1)).slice(0, n)]);
  };
  const [bank] = useState(() => bankOf(word, extra));
  // Show me again builds another word: the board shows it meanwhile (`view`)
  const [view, setView] = useState<{ word: Word; bank: string[] } | null>(null);
  const vw = view?.word ?? word;
  const vbank = view?.bank ?? bank;
  const vbankRef = useRef(vbank);
  vbankRef.current = vbank;
  // bank tiles that have left (flying or landed), and the letters that have landed in their slots
  const [taken, setTaken] = useState<number[]>([]);
  const takenRef = useRef<number[]>([]);
  const [filled, setFilled] = useState<string[]>([]);
  const filledRef = useRef<string[]>([]);
  filledRef.current = filled;
  const [lit, setLit] = useState(-1);
  const [glow, setGlow] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [paw, setPaw] = useState<number | null>(null);
  const [cardPaw, setCardPaw] = useState(false);
  const [built, setBuilt] = useState(false);
  const [join, setJoin] = useState<{ label: string; next?: string } | null>(null);
  const [linesGlow, setLinesGlow] = useState(-1);
  /** the Ready hold is up in the right-hand column: the caption bubble moves left of it (nav-C.css) */
  const [colHold, setColHold] = useState(false);
  const misses = useRef(0);
  const slotMisses = useRef(0);
  const struggled = useRef(false);
  const helped = useRef(false);
  /** first-try letters not counted yet: one of them starts a new streak tier, which waits until the word has been read */
  const held = useRef(0);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bankRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  /** Show me again's run (a tap on a letter, or leaving, stops it) */
  const tok = useRef(0);
  const [replaying, setReplaying] = useState(false);
  const replayingRef = useRef<{ taken: number[]; filled: string[] } | null>(null);
  /** a join-in's waiter: the card tap, or the last tile ("Can you find the last one?") */
  const joinWait = useRef<((what: "card" | number) => void) | null>(null);
  const joinBusy = useRef(false);
  /** "Can you find the last one?" while it is being said (a tap on the letter meanwhile waits for its end) */
  const joinSaid = useRef<Promise<void> | null>(null);
  const glowT = useRef(0);
  useEffect(() => {
    alive.current = true;
    return () => void ((alive.current = false), tok.current++, clearTimeout(glowT.current));
  }, []);
  const isAlive = () => alive.current;
  const posOf = (i: number, w: Word = word) => (i === 0 ? "first" : i === w.segs.length - 1 ? "last" : "next");
  /** "What's the next sound?" (the `w_next_q` template: today first_sound_q, next_sound_q, last_sound_q) */
  const slotQ = (i: number, w: Word = word): Say[] => speak("w_next_q", { pos: posOf(i, w) });
  const slotTile = (i: number) => () => slotRefs.current[i]?.querySelector(".tile") ?? slotRefs.current[i] ?? null;

  /** The slot's question: "What's the first sound?" (TEACHER_SCRIPT §3.16). The word's first ask names it once its
   *  `w_position_q` template is recorded and played ("What's the first sound in am?"); its fallback, the question and
   *  then the word, would only say the word again straight after "Here's our word… [am]", so until then the ask is the
   *  script's. The first "last sound" (and middle) of a save gets its lead-in, once ("Now the last sound. Listen right to
   *  the end… [at]"), with the PLAIN word: the gapped slow way would segment the word for the speller (FS1). The we do's
   *  answer glows after 2 s. */
  const ask = async (i: number, live: () => boolean = isAlive, o: { first?: boolean } = {}) => {
    setLit(i);
    const last = i > 0 && i === word.segs.length - 1;
    const mid = i > 0 && !last;
    const key = last ? "sym:last-sound" : mid ? "sym:middle-sound" : null;
    const lead = key && onceInSave(key) ? (last ? "tv_last_first" : "tv_next_middle") : null;
    // the stems faded (SCRIPT_STYLE §5.1): the slot is lit and nothing is said; a miss on this word brings them back
    if (!stems && misses.current === 0 && !(lead && HAS_LINE(lead))) return;
    const named = i === 0 && o.first ? resolveSpeech("w_position_q", { pos: "first", word: word.text }) : null;
    const q: Say[] = lead && HAS_LINE(lead) ? [{ line: lead }, { gap: 200 }, { word: word.text }] : named?.via === "template" ? named.say : slotQ(i);
    const ok = await say(q);
    if (ok && lead && key && HAS_LINE(lead)) heard(key);
    if (live() && mode === "wedo") {
      clearTimeout(glowT.current);
      glowT.current = window.setTimeout(() => live() && filledRef.current.length === i && setGlow(word.segs[i].g), 2000);
    }
  };
  /** Hear it again: the word and the slot's question (never the word twice: `w_next_q`); during a join-in, what to do again ("This card is my word. Tap
   *  it, and hear the word.", "Can you find the last one?"), and its idle clock starts again. */
  const joinLine = useRef<Say[]>([]);
  const joinRearm = useRef<(() => void) | null>(null);
  const again = () =>
    joinLine.current.length
      ? say(joinLine.current).then(() => joinRearm.current?.())
      : say(seq([{ word: word.text }], slotQ(Math.min(filledRef.current.length, word.segs.length - 1))));

  /** The ninja launches bank tile j into slot i, a different way each time (the real tile turns into its faded ghost as
   *  the glowing copy flies). */
  const carry = async (j: number, i: number, live: () => boolean = isAlive) => {
    const from = bankRefs.current[j]?.querySelector(".tile");
    const to = slotRefs.current[i];
    const flight = from && to ? launch(chooseFrom(LAUNCHES[streak.tier], recentLaunch), from, to) : Promise.resolve();
    takenRef.current = [...takenRef.current, j];
    setTaken(takenRef.current);
    await flight;
    if (!live()) return;
    if (!from || !to) sfx.place();
    setFilled((f) => [...f, vbankRef.current[j]]);
  };
  const clearBoard = () => {
    takenRef.current = [];
    setTaken([]);
    setFilled([]);
    setLit(-1);
    setBuilt(false);
  };

  /** The tiles' sounds, each tile lit as it is said (the slow way: the tortoise steps on each). */
  const tileSounds = async (w: Word, live: () => boolean) => {
    navSpeed("slow");
    for (let i = 0; i < w.segs.length; i++) {
      if (!live()) break;
      setLit(i);
      await say(tileS(w.segs[i].p));
      await sleep(250);
    }
    setLit(-1);
    navSpeed(null);
  };
  /** The word, fast (the rabbit hops on it), with the sweep under the letters. */
  const fastWord = async (w: Word) => {
    setLit(-2);
    await Promise.all([say({ word: w.text }), sweepUnder(slotsRef.current, 900)]);
    setLit(-1);
  };
  /** The read-back (TEACHER_SCRIPT §3.16, §9.2). False if stopped. */
  const readBack = async (live: () => boolean, how: "demo" | ReturnType<typeof fsReadback>, w: Word = word, frameNext = false): Promise<boolean> => {
    setLit(-1);
    await sleep(how === "plain" ? 0 : 300);
    if (!live()) return false;
    if (how === "rabbit") {
      // Move 1: "Let's say the sounds, the slow way…" the tiles' sounds, then the child taps the rabbit to read the word
      // fast; at 12 s Sensei says "And now the fast way…" herself. Then the idea, in place of S~W's line this once
      if (await say(L("tv_fs_say_sounds_slow"))) fsSaid("tv_fs_say_sounds_slow", "build");
      await tileSounds(w, live);
      if (!live()) return false;
      setJoin({ label: "The rabbit" });
      joinLine.current = L("tv_fs_rabbit_read");
      const tap = await rabbitTap({ ask: L("tv_fs_rabbit_read"), slow: () => tileSounds(w, isAlive) });
      joinLine.current = [];
      setJoin(null);
      fsSaid("tv_fs_rabbit_read", "build");
      if (!live()) return false;
      if (tap === "timeout") await say(L("tv_fs_now_fast"));
      await fastWord(w);
      // (not before Kai and Suki's frame: the 12 s rule, TEACHER_SCRIPT §9.7 rule 4; it comes in a later praise slot)
      const idea = frameNext ? null : fsIdea("build", "build", { tight: true });
      if (idea && live() && (await say(L(idea)))) fsSaid(idea, "build");
      return live();
    }
    const [slow, fast] = how === "pair" ? fsPair() : [null, null];
    const lead = how === "demo" ? "tv_lets_say_read" : how === "sw" ? "say_sounds_read" : slow;
    if (lead) await say(L(lead));
    await tileSounds(w, live);
    if (!live()) return false;
    if (fast) await say(L(fast));
    else await sleep(how === "plain" ? 200 : 350); // (time for the child's own voice)
    if (!live()) return false;
    await fastWord(w);
    return live();
  };

  /** Wait for a join-in: the word card's tap (`card`) or the tile of slot `i`'s spelling. Idle: at 8 s the hand points
   *  at it; the card goes on by itself at 12 s (Sensei says the word), the last tile waits (it never answers). */
  const waitJoin = (what: "card" | number, live: () => boolean) =>
    new Promise<void>((resolve) => {
      let done = false;
      const idle: number[] = [];
      /** the idle clock: at 8 s the hand points at it; the card goes on by itself at 12 s. It starts again when the
       *  join-in's line is said again (Hear it again) */
      const arm = () => {
        idle.forEach(clearTimeout);
        idle.length = 0;
        idle.push(
          window.setTimeout(() => {
            if (!live()) return finish();
            if (what === "card") setCardPaw(true);
            else setPaw(vbankRef.current.findIndex((g, b) => g === vw.segs[what].g && !takenRef.current.includes(b)));
          }, 8000),
        );
        if (what === "card") idle.push(window.setTimeout(() => void (!done && say({ word: vw.text }).then(finish)), 12000));
      };
      const iv = window.setInterval(() => !live() && finish(), 500);
      const finish = () => {
        if (done) return;
        done = true;
        idle.forEach(clearTimeout);
        clearInterval(iv);
        joinWait.current = null;
        joinRearm.current = null;
        joinLine.current = [];
        setJoin(null);
        setCardPaw(false);
        setPaw(null);
        resolve();
      };
      joinWait.current = (got) => {
        if (got !== what) return;
        finish();
      };
      joinRearm.current = () => !done && arm();
      arm();
    });

  /** Sensei's I do (TEACHER_SCRIPT §3.16 A). `joins`: the child taps the card, and finds the last sound; on a replay
   *  (Show me again, the paw at the Ready) Sensei does it all herself, the paw tapping the card and pointing at each
   *  letter. False if stopped. */
  const runDemo = async (w: Word, live: () => boolean, joins: boolean): Promise<boolean> => {
    const b = () => vbankRef.current;
    // the card: "This card is my word. Tap it, and hear the word." (a join-in) or the paw taps it
    if (joins && HAS_LINE("tv_word_card")) {
      setJoin({ label: "Hear the word" });
      setCardPaw(true);
      joinLine.current = L("tv_word_card");
      const tapped = waitJoin("card", live);
      await say(L("tv_word_card"));
      await tapped;
    } else {
      setCardPaw(true);
      navLog({ kind: "paw", id: `build:${w.text}:card` });
      await sleep(500);
      await say({ word: w.text });
      setCardPaw(false);
    }
    if (!live()) return false;
    // "I say it slowly…" the slow way; "I can hear two sounds." (the lines pulse in turn)
    ninja.pose("listen");
    await say(seq(L("tv_i_say_slowly"), [x(w.text)]));
    ninja.pose(null);
    if (!live()) return false;
    const n = w.segs.length;
    for (let i = 0; i < n; i++) window.setTimeout(() => live() && setLinesGlow(i), i * 260);
    window.setTimeout(() => setLinesGlow(-1), n * 260 + 700);
    await say(L(n === 2 ? "st_hear_two" : n === 3 ? "st_hear_three" : null));
    if (!live()) return false;
    for (let i = 0; i < n; i++) {
      if (!live()) return false;
      setLit(i);
      const j = b().findIndex((g, k) => g === w.segs[i].g && !takenRef.current.includes(k));
      if (joins && i === n - 1 && n > 1 && HAS_LINE("tv_you_find_last")) {
        // "I start, you finish": the last line glows, the letter glows after 2 s, and the child sends it home. The letter
        // is the child's only once the question is being asked (its clip starts): a tap before it (still on Sensei's
        // first sound) is ignored, and one during it waits for the question to end, so it is never cut (F4, 28 Sep:
        // the perfect bot's < m > during "The first sound is…" cut "Can you find the last one?")
        joinLine.current = L("tv_you_find_last");
        const tapped = waitJoin(i, live);
        const offAsk = onClip((id) => id === "tv_you_find_last" && live() && setJoin({ label: w.segs[i].g, next: w.segs[i].g }));
        const asked = say(L("tv_you_find_last"));
        joinSaid.current = asked.then(() => undefined);
        await asked;
        offAsk();
        joinSaid.current = null;
        if (live() && joinWait.current) setJoin({ label: w.segs[i].g, next: w.segs[i].g });
        const t = window.setTimeout(() => live() && joinWait.current && setGlow(w.segs[i].g), 2000);
        await tapped;
        clearTimeout(t);
        setGlow(null);
        if (!live()) return false;
        continue; // (the tap carried it: see tap())
      }
      // the first sound: the slow way, "The first sound is…", the paw on the letter, the launch (the others: the paw)
      if (i === 0) await say(seq([x(w.text)], L("tv_first_is")));
      if (!live()) return false;
      setPaw(j);
      navLog({ kind: "paw", id: `build:${w.text}:${w.segs[i].g}` });
      await sleep(600);
      setPaw(null);
      if (!live()) return false;
      await Promise.all([carry(j, i, live), say(tileS(w.segs[i].p))]);
      await sleep(250);
    }
    return live() && readBack(live, "demo", w);
  };

  useEffect(() => {
    (async () => {
      if (mode === "ido" && demo) {
        publish({ scene: "build", game: "build", next: null, busy: true, word: word.text });
        // the frame (the tiles dim; "Each line is for one sound." lights the lines in turn), then the demo
        if (demo.frame.length || item.lead.length) {
          const off = onClip((id, s, e) => {
            if (id !== "tv_build_lines") return;
            const ms = (e - s) * FAST;
            word.segs.forEach((_, i) => window.setTimeout(() => setLinesGlow(i), (ms * (i + 0.4)) / word.segs.length));
            window.setTimeout(() => setLinesGlow(-1), ms + 500);
          });
          await say(seq(item.lead, demo.frame));
          off();
        }
        if (!alive.current) return;
        if (!(await runDemo(word, isAlive, demo.joins))) return;
        setBuilt(true);
        sfx.great();
        void ninja.act("cheer");
        await sleep(700);
        if (!alive.current) return;
        if (demo.hold) {
          // the tiles fly back, ▶ pops in, and Sensei asks: "Now let's build one together. Are you ready?"
          clearBoard();
          const r = demo.hold;
          setColHold(true);
          const how = await holdReady("build", {
            ask: [{ line: r.ask.line }],
            again: () => say(r.again),
            // (▶, the speaker and the paw in the right-hand column: the letters fill the nav row)
            at: "column",
            show: async (live) => {
              clearBoard();
              await sleep(300);
              if (await runDemo(word, live, false)) {
                setBuilt(true);
                await sleep(700);
              }
              clearBoard();
            },
          });
          if (alive.current) setColHold(false);
          if (how === false || !alive.current) return;
          framed("build", r.ask);
        }
        onDone(true, false);
        return;
      }
      await say(item.say);
      if (!alive.current) return;
      await ask(0, isAlive, { first: true });
      setBusy(false);
    })();
  }, []);

  /** Show me again: the demo word takes the board, Sensei builds and reads it as in the I do (the paw on the card and
   *  each letter), then the child's word and letters come back and the slot they are on is asked again. It never
   *  answers for the child. */
  const showAgain = async () => {
    if (!canon || busy || replayingRef.current) return;
    const my = ++tok.current;
    const live = () => my === tok.current && alive.current;
    const saved = { taken: takenRef.current, filled: filledRef.current };
    replayingRef.current = saved;
    setReplaying(true);
    hush();
    setBusy(true);
    setGlow(null);
    setPaw(null);
    await say(L("tv_show_again"));
    if (!live()) return;
    takenRef.current = [];
    setTaken([]);
    setFilled([]);
    setLit(-1);
    setView({ word: canon, bank: bankOf(canon, 0) });
    await sleep(400);
    if (live() && (await runDemo(canon, live, false))) {
      setBuilt(true);
      await sleep(900);
    }
    if (live()) await endReplay(live);
  };
  /** Back to the child's turn: their word and letters, "Now it's your turn again.", and the slot they are on asked again. */
  const endReplay = async (live: () => boolean) => {
    const saved = replayingRef.current;
    replayingRef.current = null;
    setReplaying(false);
    setView(null);
    setBuilt(false);
    setPaw(null);
    setCardPaw(false);
    setLit(-1);
    if (saved) {
      takenRef.current = saved.taken;
      setTaken(saved.taken);
      setFilled(saved.filled);
    }
    await sleep(300);
    if (!live()) return;
    await say(L("tv_turn_again"));
    if (!live()) return;
    await ask(saved?.filled.length ?? filledRef.current.length, live);
    if (live()) setBusy(false);
  };
  /** A tap on a letter during Show me again stops it (the child's turn comes back). */
  const stopReplay = () => {
    const my = ++tok.current;
    hush();
    void endReplay(() => my === tok.current && alive.current);
  };

  const finishWord = async () => {
    setBusy(true);
    const end = settle(misses.current === 0);
    // the phase's last word, with Kai and Suki's frame straight after: the faded read-back (the sounds and the word) and
    // no praise, so the talk before the child's next tap stays about 12 s (TEACHER_SCRIPT §6: 12.0 s)
    const counted = fsReadback("build", { afterMiss: misses.current > 0 });
    // (Sensei's pair, Move 5, runs about 9 s: before a word with a lead of its own, "Now you build one all by yourself.
    // Your word is… [sit]", S~W's line takes its place, so the run stays under 12 s: TEACHER_SCRIPT §9.2 "where §9.3
    // allows it"; the learner's w1-7 ran 12.3 s)
    const how = end.frameNext && counted !== "rabbit" ? "plain" : counted === "pair" && end.nextLead ? "sw" : counted;
    if (!(await readBack(isAlive, how, word, end.frameNext))) return;
    sfx.great();
    const r = stageRect(slotsRef.current);
    fx.burst(r.x + r.w / 2, r.y + r.h / 2, "blossoms", 14);
    // the built word hops, letter by letter, and the ninja celebrates it: a cheer, or on a streak a gift of stars and
    // hearts that settles on the word. If the word took the streak into a new tier, the power-up is its celebration,
    // with its line as the praise.
    setBuilt(true);
    recordWordSpelt(word, misses.current === 0);
    // Dec2: the letters lit the flames; the word, built right first time, is the answer
    if (misses.current === 0) streak.answer();
    const tierUp = held.current > 0;
    const next = end.closing || end.frameNext;
    if (tierUp) {
      // (after Move 1 or Sensei's pair the fast and slow read-back is this word's moment: the power-up is seen, not said)
      const quiet = next || how === "rabbit" || how === "pair";
      for (; held.current > 0; held.current--) await tierBeat({ part: true, quiet });
    } else void (streak.tier === 0 ? ninja.act("cheer") : gift(slotsRef.current, { shape: "sides" }));
    // then at most one thing (SCRIPT_FIXES A7): a two-letter reminder ending on its sound, praise, or fast and slow
    // praise. "You built that whole word by yourself!" is the you do's only (TEACHER_SCRIPT §3.16). After Sensei's
    // pair (Move 5: "Let's say it the slow way… And now, fast…") the pair is this word's model and its praise slot
    // stays quiet (the fast/slow praise waits for the next one), so the next question comes within about 12 s; the
    // fast/slow praise lines (3.4–4.4 s) also wait for a word with no lead of its own after it, for the same reason
    const own = mode === "youdo";
    const pair = how === "pair";
    // (after S~W's read-back, "Say the sounds, and read the word." and the sounds, a word with a lead of its own next,
    // "Now you build one all by yourself. Your word is… [in]", leaves no room for praise either: it waits for the next
    // word. A learner's w1-10 ran 13.7 s with "That was a tricky one, and you kept going." there)
    const roomless = end.nextLead && how === "sw";
    await afterWordSay({
      tierUp, leftRight: pair, gemFirst: null, closingNext: next || roomless,
      reminder: lettersReminder(word.segs, (i) => slotTile(i)),
      game: own ? "build" : undefined,
      praise: { every: 2, keptGoing: misses.current > 0, helped: helped.current },
      fs: own && !pair && !end.nextLead ? fsPraise("build", "build") : null,
    });
    if (alive.current) onDone(misses.current === 0, struggled.current);
  };

  const tap = async (g: string, j: number) => {
    // a Ready hold is up: the tap is the child's "I'm ready" (the turn's question hasn't been asked)
    if (readyHeld()) return void readyTap({ label: g });
    // a join-in in the demo: "Can you find the last one?" (it resolves once the letter has landed, saying its sound)
    if (joinWait.current && join?.next) {
      if (joinBusy.current) return;
      const i = filledRef.current.length;
      if (g !== vw.segs[i]?.g) {
        setWrong(g);
        sfx.wrong();
        setTimeout(() => setWrong(null), 420);
        setGlow(vw.segs[i]?.g ?? null);
        return;
      }
      if (takenRef.current.includes(j)) j = vbank.findIndex((b, k) => b === g && !takenRef.current.includes(k));
      if (j < 0) return;
      setGlow(null);
      setPaw(null);
      joinBusy.current = true;
      // (a tap while "Can you find the last one?" is still being said waits for its end: the question is never cut)
      if (joinSaid.current) await joinSaid.current;
      if (!joinWait.current) return void (joinBusy.current = false);
      await Promise.all([carry(j, i), say(tileS(vw.segs[i].p))]);
      joinBusy.current = false;
      joinWait.current?.(i);
      return;
    }
    if (replayingRef.current) return stopReplay();
    if (busy) return;
    const i = filled.length;
    const s = word.segs[i];
    clearTimeout(glowT.current);
    if (g === s.g) {
      // a repeated letter (pop, dad): whichever copy was tapped, send one that is still in the bank
      if (takenRef.current.includes(j)) j = bank.findIndex((b, k) => b === g && !takenRef.current.includes(k));
      if (j < 0) return;
      recordSpell(s, misses.current === 0);
      setGlow(null);
      setBusy(true);
      onAnswer();
      // the sound is said as the spell carries the letter home
      const flight = carry(j, i);
      // Dec2: a first-try letter lights a flame (`part`); a letter that would start a new streak tier (and any after it)
      // is counted once the word has been read (finishWord)
      if (slotMisses.current === 0) {
        if (held.current || crossesTier()) held.current++;
        else streak.hit({ part: true });
      }
      slotMisses.current = 0;
      await Promise.all([flight, say(tileS(s.p))]);
      recordFoundation({ target: { kind: "letter", letter: s.g, sound: s.p, task: "letter-to-sound" }, result: "unassessed", source: "practice", support: "guided" });
      if (!alive.current) return;
      if (i + 1 === word.segs.length) return finishWord();
      await ask(i + 1);
      setBusy(false);
      return;
    }
    misses.current++;
    slotMisses.current++;
    const attempt = slotMisses.current;
    recordSpell(s, false);
    setWrong(g);
    sfx.wrong();
    setBusy(true);
    // letters held back for a tier-up that never came: the streak ends here anyway
    held.current = 0;
    await wrongAnswer();
    // TEACHER_SCRIPT §5.4: a first miss goes back to listening (the stuck recap and the PLAIN word, FS1: the child
    // segments it); a second shows it ("That's… /s/ We need… /m/ It's this one."); a split spelling gets the two-letter
    // correction. The petals pop above the tapped tile and the slot
    if (revealsNow(g, s, attempt)) setGlow(s.g);
    if (attempt >= 2) struggled.current = true;
    const tile = bankRefs.current[j]?.querySelector(".tile") ?? null;
    await say(correctionFor(g, s, word.text, attempt, word, { wrong: tile, slot: slotRefs.current[i] }, { game: "build", item: `${word.text}:${i}` }));
    ninja.pose(null);
    setWrong(null);
    setBusy(false);
  };
  // `next` stays set while busy (taps are ignored then), so a bot never falls back to tapping some other tile; during
  // Show me again it stays the turn's own letter (the demo doesn't answer it)
  const expected = word.segs[(replayingRef.current?.filled ?? filled).length]?.g ?? null;
  // (Move 1's rabbit is the nav layer's join-in, found by __snNav.speed: the letters aren't answers meanwhile)
  const rabbitJoin = join?.label === "The rabbit";
  publish(
    join && !rabbitJoin
      ? { scene: "build", game: "build", next: join.next ?? join.label, busy: false, word: vw.text }
      : rabbitJoin
      ? { scene: "build", game: "build", next: null, busy: true, word: vw.text }
      : { scene: "build", game: "build", next: mode === "ido" ? null : expected, busy: busy || replaying || mode === "ido", word: word.text },
  );
  // the turn's idle ladder (TEACHER_SCRIPT §5.5): 8 s the stuck recap or "Let's listen again. What can you hear
  // here?" with the plain word; 16 s the paw points at the letter; 24 s "Take your time, ninja."
  const stuckSay = (): Say[] => fsStuckSay("build", word.text, { attempt: 1, item: `${word.text}:${filledRef.current.length}:idle` }) ?? seq(L("tv_listen_here"), [{ word: word.text }]);
  useEffect(() => {
    if (busy || replaying || mode === "ido") return;
    const i = filled.length;
    const t = [
      window.setTimeout(() => void say(stuckSay()), 8000),
      window.setTimeout(() => {
        struggled.current = true;
        setPaw(bank.findIndex((g, b) => g === word.segs[i]?.g && !takenRef.current.includes(b)));
        void say(L("tv_idle_point"));
      }, 16000),
      window.setTimeout(() => void say(L("tv_take_time")), 24000),
    ];
    return () => t.forEach(clearTimeout);
  }, [busy, filled.length, replaying]);
  // Help (TEACHER_SCRIPT §5.5, §5.4): the stuck line, then the glow ("Look for the glow."), then "Let me show you… /m/"
  // with the petal above the slot
  useHelp(
    (n) => {
      if (mode === "ido" || busy) return;
      const i = filled.length;
      const s = word.segs[i];
      if (!s) return;
      helped.current = true;
      if (n === 1) return void say(stuckSay());
      setGlow(s.g);
      if (n === 2) return void say(L("tv_look_glow"));
      struggled.current = true;
      void say(seq(L("help_look"), [petalS(s.p, () => slotRefs.current[i] ?? null)]));
    },
    [filled.length],
  );

  const cx = PLAY_CX;
  const card = vw.pic ? { w: 240, h: 190, top: 64 } : { w: 200, h: 170, top: 74 };
  // Hear it again and Show me again sit either side of the word card (the letter bank fills the nav row): `own`
  const S = NAV_SLOTS.row;
  const speakerAt: CSSProperties = { position: "absolute", left: cx + card.w / 2 + 28, top: 108, width: 100, height: 100 };
  const showAt: CSSProperties = { position: "absolute", left: cx - card.w / 2 - 28 - S.show.d, top: 110, width: S.show.d, height: S.show.d };
  // the tortoise and the rabbit: beside the speaker, on its right (with a picture card the speaker is its own button
  // right of the card, and the pair goes right of that, clear of it and of the paw on the left); a card with no
  // picture is the speaker, and the nav layer flanks it
  const speed: SpeedSpec = vw.pic ? { at: { x: cx + card.w / 2 + 28 + 100 + 10 + 76, y: card.top + card.h / 2 } } : {};
  // the card: the word card join-in ("Tap it, and hear the word."), or Hear it again for a word with no picture
  // a picture card's own speaker waits until the tortoise and the rabbit have hopped to their place beside it (after a
  // word with no picture they stood where this speaker goes: a tap there in that moment would land on a badge)
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(true), 520);
    return () => clearTimeout(t);
  }, []);
  const [cardWig, setCardWig] = useState(0);
  useEffect(() => {
    if (!cardWig) return;
    const t = setTimeout(() => setCardWig(0), 420);
    return () => clearTimeout(t);
  }, [cardWig]);
  // (a join-in is the child's to do: Hear it again says what to do again)
  const ready = (!busy && !replaying && mode !== "ido") || !!join;
  const navHeld = useHeld();
  const cardJoin = join?.label === "Hear the word";
  const onCard = () => {
    if (cardJoin && joinWait.current) {
      if (isSpeaking()) hush();
      setCardPaw(false);
      void say({ word: vw.text }).then(() => joinWait.current?.("card"));
      return;
    }
    if (navHeld || !ready) return vw.pic ? void say({ word: vw.text }) : setCardWig((k) => k + 1);
    if (vw.pic) return void say({ word: vw.text });
    navAgain();
  };
  return (
    <>
      <div ref={cardRef} data-nav={!vw.pic && !navHeld ? "again" : undefined} className={`navc-card ${cardWig ? "navc-wiggle" : ""} ${cardJoin ? "navc-card-live" : ""}`} style={{ position: "absolute", left: cx - card.w / 2, top: card.top, width: card.w, height: card.h }}>
        {/* (during its join-in the card is the child's answer, not Hear it again: `data-nav="join"` tells the checks) */}
        <button aria-label="Hear the word" data-nav={cardJoin ? "join" : undefined} className="navc-card-btn" {...tapProps(onCard)}>
          <WordCard key={vw.text} word={vw} className="pop-in" onHear={() => {}} style={{ left: 0, top: 0, width: card.w, height: card.h }} />
        </button>
        {/* the hand points up at the card from below its middle: clear of the tortoise and the rabbit at its sides */}
        {cardPaw && <TapHint show style={{ left: card.w / 2 - 70, bottom: -80 }} />}
      </div>
      <div style={{ position: "absolute", ...PLAY, top: 296, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div ref={slotsRef} className={`slots ${built ? "built" : ""}`}>
          {vw.segs.map((_, i) => (
            <div key={`${vw.text}${i}`} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${i < filled.length ? "filled" : lit === i ? "active" : ""} ${linesGlow === i ? "navc-line-glow" : ""} ${lit === i && i < filled.length ? "navc-say" : ""}`} style={{ position: "relative", animationDelay: built ? `${i * 0.09}s` : undefined }}>
              {i < filled.length && <Tile g={filled[i]} className="landed" withButtons lit={lit === i || lit === -2} />}
              {lit === i && i >= filled.length && <span className="slot-arrow" />}
            </div>
          ))}
        </div>
      </div>
      {/* the letters to choose from, along the bottom of the play area (x 340-1120) and low enough (top edge at y 570)
          to stay clear of Sensei's caption bubble; five or more get a little smaller. Dim during the frame. */}
      <div className={`row build-bank ${vbank.length >= 5 ? "many" : ""} ${mode === "ido" && !join && !replaying && lit < 0 && !filled.length ? "navc-bank-dim" : ""}`} style={{ position: "absolute", ...PLAY, bottom: 18, gap: vbank.length >= 5 ? 14 : 18, flexWrap: "nowrap" }}>
        {vbank.map((g, j) => (
          <div key={`${vw.text}${g}${j}`} ref={(el) => void (bankRefs.current[j] = el)} style={{ position: "relative" }}>
            <Tile g={g} size="lg" state={taken.includes(j) ? "used" : wrong === g ? "wrong" : glow === g ? "hint" : ""} onTap={() => tap(g, j)} />
            {paw === j && <TapHint show style={{ right: -50, bottom: -50 }} />}
          </div>
        ))}
      </div>
      <TurnNav ready={ready} again={again} show={mode !== "ido" && canon ? showAgain : null} showAt={showAt} at={speakerAt} size={100} noSpeaker={!vw.pic || !settled} speed={speed} hidden={navHeld} />
      {colHold && <i className="navc-hold-col" aria-hidden="true" />}
    </>
  );
}

// ---------------------------------------------------------------- Kai and Suki: who read it right?
/** Sound waves coming off a reader: three arcs, each on its own HTML wrapper that fades in and out (an animation on an
 *  SVG path is repainted on the main thread every frame; on a wrapper the compositor does it). */
const WAVE_ARCS = ["M8 22c8 8 8 28 0 36", "M22 12c14 14 14 42 0 56", "M36 2c20 20 20 56 0 76"];
function ReaderWaves({ me }: { me?: boolean }) {
  return (
    <span className={`reader-waves ${me ? "me-waves" : ""}`} aria-hidden="true">
      {WAVE_ARCS.map((d) => (
        <i key={d}>
          <svg viewBox="0 0 60 80">
            <path d={d} />
          </svg>
        </i>
      ))}
    </span>
  );
}

/**
 * Kai and Suki (TEACHER_SCRIPT §3.16 B): "Look, it's Kai and Suki. They're learning to read, like you." · "They'll both
 * read this word. Only one of them reads it right." · the child reads it first (the sound buttons live on "First, you
 * read it."), then the readers read, then the question ("Who read it right? Tap Kai, or tap Suki."). Later plays: "Kai
 * and Suki are back…". `closing`: the level ends after this phase.
 */
export function ReadCheck({ pairs, onFinish, closing = true }: { pairs: [string, string][]; onFinish: (f: number, y: number) => void; closing?: boolean }) {
  const [k, setK] = useState(0);
  const [form] = useState(() => gameForm("readcheck", { opening: true }));
  const first = useRef(0);
  const done = useRef(0);
  const told = useRef(false);
  const pace = usePhasePace("read");
  const items = useRef<PaceItem[]>(pairs.map(() => ({ mode: "youdo" }))).current;
  /** the next word, decided as this one was answered (settle) */
  const nextK = useRef<number | null>(null);
  /** who reads each word right: at random, but never the same reader three times running ("Yes! Kai read it right."
   *  three times in a minute stops being heard, and a child shouldn't learn "it's always Kai") */
  const whoRight = useRef<("kai" | "suki")[]>([]);
  if (whoRight.current[k] === undefined) {
    const [a, b] = [whoRight.current[k - 1], whoRight.current[k - 2]];
    whoRight.current[k] = a && a === b ? (a === "kai" ? "suki" : "kai") : Math.random() < 0.5 ? "kai" : "suki";
  }
  useReportProgress(k / pairs.length);
  const [right, wrongW] = pairs[k];
  const frame = k === 0 ? openingSay("readcheck", form) : [];
  return (
    <ReadOne
      key={k}
      right={WORD_BY_TEXT[right]}
      wrong={WORD_BY_TEXT[wrongW]}
      frame={frame}
      n={k}
      kaiRight={whoRight.current[k] === "kai"}
      form={form}
      settle={(ok) => {
        // counted as it is answered, so its praise is never said straight before the level's closing line
        pace.answered("youdo", ok);
        nextK.current = pace.next(items, k + 1);
        return closing && nextK.current >= pairs.length;
      }}
      onAnswer={() => {
        // no Ready here: a telling counts at the child's first answer (TEACHER_SCRIPT §2.2)
        if (!told.current && (form === "full" || form === "recap")) {
          told.current = true;
          framed("readcheck");
        }
      }}
      onDone={(ok) => {
        if (ok) first.current++;
        done.current++;
        // one reading check right first time is enough for a child on track (content/pace.ts)
        let n = nextK.current;
        nextK.current = null;
        if (n === null) {
          pace.answered("youdo", ok);
          n = pace.next(items, k + 1);
        }
        if (n < pairs.length) setK(n);
        else {
          played("readcheck");
          onFinish(first.current, done.current);
        }
      }}
    />
  );
}
/** The reading check's own area: a little left of the play area's centre (x 388-972 for the readers), so Sensei's
 *  caption bubble (bottom-right, narrowed here in early.css) never covers a reader. */
const READ = { left: 380, right: 320 } as const;
function ReadOne({ right, wrong, frame, n, kaiRight, form, settle, onAnswer, onDone }: {
  right: Word;
  wrong: Word;
  frame: Say[];
  /** which word of the reading check this is (0: the game's first) */
  n: number;
  /** Kai reads it right (else Suki) */
  kaiRight: boolean;
  form: FrameForm;
  /** answered: count it, and say whether the level's closing line comes straight after */
  settle: (firstTry: boolean) => boolean;
  onAnswer: () => void;
  onDone: (firstTry: boolean) => void;
}) {
  const firstOfGame = n === 0;
  const hero = useHero();
  const [tapped, setTapped] = useState<number[]>([]);
  const [lit, setLit] = useState(-1);
  // either of them may be the one who reads it right (ReadCheck decides: never the same one three times running), and
  // where they stand is shuffled too
  const [readers] = useState(() => shuffle([{ who: "kai", word: kaiRight ? right : wrong }, { who: "suki", word: kaiRight ? wrong : right }]));
  const rightWho = readers.find((r) => r.word === right)!.who;
  const [heard, setHeard] = useState(false);
  const [state, setState] = useState<Record<string, string>>({});
  const misses = useRef(0);
  const busy = useRef(false);
  const [busyNow, setBusyNow] = useState(false);
  const tappedRef = useRef(new Set<number>());
  /** tap: the child taps the sounds; who: the readers are reading; pick: tap the one who read it right */
  const phase = useRef<"tap" | "who" | "pick">("tap");
  // the sound buttons are live from the first word of "First, you read it…" (a tap before it wiggles: wait for Sensei)
  const [ready, setReady] = useState(false);
  const [wiggle, setWiggle] = useState(-1);
  const alive = useRef(true);
  const full = firstOfGame && (form === "full" || form === "recap");
  // the first word: the card drops in and the readers slide in from the sides (the class goes once they are in, so a
  // later wiggle or bounce never replays the entrance)
  const [entering, setEntering] = useState(firstOfGame);
  useEffect(() => {
    if (!entering) return;
    const t = setTimeout(() => setEntering(false), 1000);
    return () => clearTimeout(t);
  }, []);
  // "First, you read it. Tap each sound, and say it with me." (the full and recap forms); on the short form "Kai and
  // Suki are back. You read it first, then they read it." has said it; later words: "Tap each sound, and say it."
  const readLine = full ? "tv_you_read_first" : firstOfGame && frame.length ? null : "read_tap_sounds";
  useEffect(() => {
    alive.current = true;
    (async () => {
      if (frame.length) await say(frame);
      if (!alive.current) return;
      // the sound buttons go live as "First, you read it…" starts (a tap then cuts it: the child is doing it)
      const off = whenClip(readLine && HAS_LINE(readLine) ? readLine : null, () => setReady(true));
      await say(L(readLine));
      off();
      if (alive.current) setReady(true);
    })();
    return () => void ((alive.current = false), whoTok.current++);
  }, []);
  /** the readers read, each lighting up as it reads (the first time, and again for Hear it again), then the question.
   *  False if stopped. */
  const whoTok = useRef(0);
  const [again2, setAgain2] = useState(false); // the readers are reading again (Hear it again)
  // "Who read it right? Tap Kai, or tap Suki." on the first meeting's first word, then "Who read it right?", the longer
  // question coming back every other word (a question heard over and over in a minute stops being heard)
  const question = HAS_LINE("tv_rc_q") && ((firstOfGame && form === "full") || (n > 0 && n % 2 === 0)) ? "tv_rc_q" : "read_who";
  const readersRead = async (live: () => boolean, lead: boolean) => {
    if (lead && full) await say(L("tv_now_readers"));
    for (const r of readers) {
      if (!live()) return false;
      setTalking(r.who);
      await say([{ line: r.who === "kai" ? "kai_says" : "suki_says" }, { gap: 100 }, { word: r.word.text }]);
      await sleep(250);
    }
    if (live()) setTalking(null);
    // SF C14: the question after both readers have read
    if (live()) await say(L(question));
    return live();
  };
  const tapSound = async (i: number) => {
    // while Sensei is still framing, the readers read, or Sensei is answering a choice, a sound tap would cut them off:
    // they come first (a little wiggle says "wait", so a tap is never ignored)
    if (!ready || phase.current === "who" || busy.current || again2) {
      setWiggle(i);
      setTimeout(() => setWiggle((w) => (w === i ? -1 : w)), 450);
      return;
    }
    if (isSpeaking() && phase.current === "tap" && !tappedRef.current.size) hush(); // live from the line's first word
    setLit(i);
    await say(tileS(right.segs[i].p));
    setLit((l) => (l === i ? -1 : l));
    tappedRef.current.add(i);
    setTapped([...tappedRef.current]);
    // the last sound is in: the readers read, once (a double tap must not start it twice)
    if (tappedRef.current.size === right.segs.length && phase.current === "tap") {
      phase.current = "who";
      setLit(-1);
      await sleep(600);
      if (!alive.current) return;
      await readersRead(() => alive.current, true);
      setHeard(true);
      phase.current = "pick";
    }
  };
  /** Hear it again: before the readers have read, what to do; after, both readers again and the question. A tap on a
   *  reader meanwhile stops it and counts. */
  const again = async () => {
    if (!heard) return say(seq(frame, L(readLine)));
    const my = ++whoTok.current;
    setAgain2(true);
    await readersRead(() => my === whoTok.current && alive.current, false);
    if (my === whoTok.current && alive.current) setAgain2(false);
  };
  const stopAgain = () => {
    whoTok.current++;
    hush();
    setTalking(null);
    setAgain2(false);
  };
  const [talking, setTalking] = useState<string | null>(null);
  // the player's own hero is reading: the ninja bottom-left talks along with its portrait (a bob, and waves by its mouth)
  useEffect(() => {
    if (talking !== hero) return;
    const im = document.querySelector(".ninja-spot .nj-img");
    const a = im?.animate([{ translate: "0 0", scale: "1 1" }, { translate: "0 -7px", scale: "0.98 1.03" }] as Keyframe[], { duration: 210, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    return () => a?.cancel();
  }, [talking]);
  const [readerWait, setReaderWait] = useState<string | null>(null);
  /** The word read back: fast and slow's moves (TEACHER_SCRIPT §9.3: the first right reader of a session gets "Let's say
   *  it the slow way…" the sounds, "And now the fast way…" the word, no rabbit tap; Sensei's pair on the 3rd), each
   *  sound's tile lit as it is said. */
  const readBack = async (closingNext = false) => {
    const counted = fsReadback("readcheck", { afterMiss: misses.current > 0 });
    // (Sensei's pair straight before the level's closing line gives way to the sounds and the word: the closing line and
    // the reward's talk follow with no tap between, and w1-7's "Yes! Suki read it right." · the pair · the closing line
    // ran into the reward past 20 s. As Word Building's last word before Kai and Suki)
    const how = closingNext && counted === "pair" ? "plain" : counted;
    const [slow, fast] = how === "rabbit" ? ["tv_fs_say_slow", "tv_fs_now_fast"] : how === "pair" ? fsPair() : [null, null];
    if (slow && (await say(L(slow)))) fsSaid(slow, "readcheck");
    navSpeed("slow");
    await say({ sounds: right.segs, gap: 250, onSeg: setLit, show: "tile" });
    navSpeed(null);
    if (fast && (await say(L(fast)))) fsSaid(fast, "readcheck");
    setLit(-2);
    await say({ word: right.text });
    setLit(-1);
    return how;
  };
  const pickReader = async (who: string, el: Element) => {
    if (again2 && heard && !busy.current) stopAgain();
    else if (!heard || busy.current) {
      // not yet (they are still reading, or Sensei is answering): a little wiggle says "wait", so a tap is never ignored
      setReaderWait(who);
      setTimeout(() => setReaderWait((w) => (w === who ? null : w)), 450);
      return;
    }
    if (isSpeaking()) hush(); // (the question is live from its first word)
    busy.current = true;
    setBusyNow(true);
    onAnswer();
    if (who === rightWho) {
      setState({ [who]: "right" });
      sfx.good();
      recordRead(right, misses.current === 0);
      // the player's ninja sends the reader who got it right a gift of stars; if that reader is its own hero, it cheers
      const { held, landed } = rightAnswer(el, "reader", { first: misses.current === 0, self: who === hero, soft: true });
      await afterLanding(landed);
      const closingNext = settle(misses.current === 0);
      // "Yes! Suki read it right." then the word, sound by sound, each tile lighting as its sound is said
      await say(L(`tv_yes_${who}`));
      const how = await readBack(closingNext);
      // (Sensei's pair, Move 5, is this answer's model: its praise slot stays quiet, as in Word Building)
      const pair = how === "pair";
      await afterWordSay({ tierUp: held, leftRight: pair, reminder: null, gemFirst: null, closingNext, game: "readcheck", praise: { every: 2 }, fs: pair ? null : fsIdea("readcheck", "read") ?? fsPraise("readcheck", "letters") });
      if (held) await tierBeat({ quiet: closingNext || how === "pair" || how === "rabbit" });
      if (alive.current) onDone(misses.current === 0);
      return;
    }
    // the wrong reader: "Let's check. Say the sounds with me…" the sounds, the word, "Suki read it right." (TS §5.4)
    misses.current++;
    setState({ [who]: "wrong" });
    sfx.wrong();
    await wrongAnswer();
    ninja.pose(null);
    recordRead(right, false);
    await say(L("tv_lets_check"));
    await say({ sounds: right.segs, gap: 250, onSeg: setLit, show: "tile" });
    setLit(-2);
    await say({ word: right.text });
    setLit(-1);
    setState({ [who]: "wrong", [rightWho]: "right" });
    await say(L(`tv_right_${rightWho}`));
    await sleep(400);
    if (alive.current) onDone(false);
  };
  publish({ scene: "read", game: "readcheck", next: heard ? rightWho : null, tapIdx: ready && tapped.length < right.segs.length ? right.segs.findIndex((_, i) => !tapped.includes(i)) : null, busy: busyNow || !ready });
  // the child's turn: tapping the sounds (once Sensei has asked), or choosing a reader (once they have read)
  const turn = heard ? !busyNow && !again2 : ready && tapped.length < right.segs.length;
  return (
    <>
      <div className={`row ${entering ? "navc-read-in" : ""}`} style={{ position: "absolute", ...READ, top: 92, gap: 12, flexWrap: "nowrap" }}>
        {right.segs.map((s, i) => (
          <button key={i} aria-label={`sound ${i}`} className={`tile lg ${lit === i || lit === -2 ? "hint" : tapped.includes(i) ? "right" : ""} ${wiggle === i ? "wait" : ""} ${ready && !tapped.includes(i) && phase.current === "tap" ? "navc-sound-live" : ""}`} {...tapProps(() => tapSound(i))}>
            <span className="g">{s.g}</span>
            <span className={`sb ${s.g.length > 1 ? "bar" : "dot"} ${lit === i ? "lit" : ""}`} />
          </button>
        ))}
      </div>
      {/* the readers are Kai and Suki in round portrait windows, each holding an open book. They wait (soft grey) while
          the child taps the sounds; whoever is reading lights up, with sound waves coming off the window. One of them is
          the player's own hero: when it reads, the ninja bottom-left speaks too (the same waves by its head), so the
          portrait reads as "my ninja reading", and it cheers or thinks along with the portrait when the child judges it */}
      <div className={`row readers ${entering ? "navc-readers-in" : ""}`} style={{ position: "absolute", ...READ, top: 266, gap: 84, flexWrap: "nowrap" }}>
        {readers.map((r) => {
          const st = state[r.who] ?? "";
          const pose = st === "right" ? "cheer" : st === "wrong" ? "think" : "idle";
          return (
            <button key={r.who} aria-label={`reader ${r.who}`} data-who={r.who} data-me={r.who === hero || undefined} className={`reader ${st} ${talking === r.who ? "talking" : !heard && talking !== r.who ? "waiting" : ""} ${readerWait === r.who ? "wait" : ""}`} {...tapProps<HTMLButtonElement>((el) => pickReader(r.who, el))}>
              <span className="reader-window">
                <img src={heroImg(r.who, pose)} alt="" key={pose} className={`pose-${pose}`} />
              </span>
              <span className="reader-book" aria-hidden="true">
                <svg viewBox="0 0 124 66">
                  <path className="cover" d="M3 16v44c24-6 44-6 59 3 15-9 35-9 59-3V16" />
                  <path className="page" d="M62 13C46 4 24 4 7 10v44c17-6 39-6 55 3z" />
                  <path className="page" d="M62 13c16-9 38-9 55-3v44c-17-6-39-6-55 3z" />
                  <path className="text" d="M17 20c11-3 23-3 35 1M17 30c11-3 23-3 35 1M17 40c11-3 23-3 35 1M72 21c12-4 24-4 35-1M72 31c12-4 24-4 35-1M72 41c12-4 24-4 35-1" />
                </svg>
              </span>
              {talking === r.who && <ReaderWaves />}
            </button>
          );
        })}
      </div>
      {talking === hero && <ReaderWaves me />}
      <TurnNav ready={turn} again={again} speed={{}} />
    </>
  );
}
