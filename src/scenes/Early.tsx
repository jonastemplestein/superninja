// Early-learning mini-games (docs/PEDAGOGY.md). Every item runs "I do → We do → You do":
//   ido   – Sensei demonstrates; the child watches (a paw taps the answer)
//   wedo  – the answer glows (hint), the child taps it
//   youdo – no hint; help after an error or 8 s of silence
// Errors: 1st → back to listening; 2nd → choices shrink, the answer glows, "It's this one!"; the item is re-queued
// so the round always ends with a success. Stars count only first-try "youdo" items.
// The player's ninja (docs/HERO.md) stands bottom-left on every screen here and answers every right answer with a move
// aimed at the thing the child got right: kicks, punches, shuriken and spells at objects and letters (landing on the
// corner, never over the picture), and for people, animals, the two readers and a finished word a friendly gift instead
// (a star or a spell that settles as a crown of stars and hearts on top). A spell writes each new spelling on its line,
// and when building, the ninja launches each letter into its slot a different way every time (a spell, a throw, a
// punch, a flying kick, a leap, a spin, a backflip). First-try answers build the streak that makes it glow; a new
// streak tier gets its own short beat in place of the praise, so its line is heard in full and never over teaching.
// Sound order: a word Sensei models ("nest starts with /n/") always comes after the move has landed, so no impact
// sound falls on it; praise and a letter's sound run alongside the (quiet) moves, which never make the child wait.
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { LevelProps } from "../App";
import { WORD_BY_TEXT, WORDS, ORAL_WORDS, GRAPHEMES, PHONEMES, type Word, type PhonemeId } from "../content/phonics";
import { knownSpellings, worldOf, type Level } from "../content/worlds";
import { picSaysFirst } from "../content/pic-names";
import { LINES } from "../content/lines";
import { say, sfx, playMusic, preload, urls, hush, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { shuffle } from "../engine/learner";
import { recordSpell, recordRead, recordWordSpelt } from "../engine/store";
import { streak, useStreak, tierOf, streakLine, tierLineSaid, type Tier } from "../engine/streak";
import { img, heroImg, Tile, RoundButton, Icon, fx, fxDom, stageXY, stageRect, sleep, tapProps, useHelp, useHero, TapHint, WordCard, SenseiDock } from "../ui/ui";
import { NinjaSpot, ninja, type Move, type Pose } from "../ui/Ninja";
import { pickPraise, listenLead } from "../engine/feedback";
import { practiceGemOf } from "../engine/gems";
import { gemSeg } from "../content/narrative";
import { nameLine } from "../content/warmups";
import { LIVING_WORDS } from "../content/living";
import { NarrOverlay, beginLevel, explainGemEnergy, heard, isDue, sweepUnder } from "./narrate";
import { STRETCHED } from "../content/stretch";
import { PIC_PLATES, PLATE_COLOURS } from "../content/pic-plates.gen";
import { nextItem, ownWords, paceOf, type Pace, type PaceItem, type PaceTally, type PhaseKind, type PhaseTally } from "../content/pace";
import "../styles/early.css";

export type Mode = "ido" | "wedo" | "youdo";
const x = (w: string): Say => ({ stretch: w });
// STRETCHED (src/content/stretch.ts): a picture is only a first-sound target if Sensei can say it stretched after a
// slip. Without a stretched recording, x() plays the plain word, and the long first sound the child was promised never comes.
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
      fx.glow(p.x, p.y, COLS[tier], 1, 30, 0.5, 18);
      if (Math.random() < 0.3) fx.twinkle(p.x, p.y, COLS[tier], 1, 1.5, 16);
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
  // a picture that is the joke (the fish-dog): the star lands above it and the stars settle all round, off the picture
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
function trail(p: Pt, prev: Pt, tier: Tier, t: number) {
  if (t > 0.8) return; // nothing piles up on the letter as it slows into its slot: it must be readable on landing
  const len = Math.hypot(p.x - prev.x, p.y - prev.y);
  if (len < 0.5) return;
  const ux = (p.x - prev.x) / len, uy = (p.y - prev.y) / len;
  // the trail streams out behind the letter, never over its face
  const back = { x: p.x - ux * 56, y: p.y - uy * 56 };
  const lanes = TRAILS[tier];
  lanes.forEach((cols, i) => {
    const off = lanes.length > 1 ? Math.sin(t * Math.PI * 3 + (i * Math.PI * 2) / lanes.length) * 24 : 0;
    fx.glow(back.x - uy * off, back.y + ux * off, cols, 1, lanes.length > 1 ? 26 : 34, 0.4, 14);
  });
  if (tier >= 1 && Math.random() < 0.35) fx.twinkle(back.x, back.y, COLS[tier], 1, 3, 16);
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
        trail(p, last, o.tier, t);
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

// ---------------------------------------------------------------- streak beats
const hasLine = (id: string) => LINES.some((l) => l.id === id);
/** Count an answer held back by rightAnswer, once its teaching has been said: the ninja powers up (the flash, the
 *  rings, one more flame) and its line ("Ninja power!", "Super ninja streak!", "You're a ninja master!") is said at
 *  once, here, as the praise for that answer. */
export async function tierBeat(): Promise<void> {
  const e = streak.hit({ line: false });
  if (!e.tierUp) return;
  const id = streakLine(e);
  if (id) tierLineSaid(id, await say({ line: id }));
  else await sleep(800); // no line: let the power-up be seen
}
/** A wrong answer. From a streak the ninja reacts by itself; from zero it still tilts its head ("hmm?"), so every slip
 *  gets the same gentle look and never a hurt one. It keeps its puzzled look through the correction (the caller puts it
 *  back with ninja.pose(null)). A lost streak of 3 or more: its flames puff out and "Keep going, ninja!" comes before
 *  the correction, so the correction's target is the last thing heard. */
export async function wrongAnswer(): Promise<void> {
  const e = streak.miss({ line: false });
  if (e.prevN === 0) void ninja.act("think");
  ninja.pose("think");
  const lost = streakLine(e);
  if (lost) await say({ line: lost });
}
/** Level start: the audio engine exists before any child scene speaks (its speech counter only works once it does),
 *  and the streak lines are ready to play. */
export function useLevelAudio() {
  useLayoutEffect(() => {
    playMusic("dojo");
    preload(["streak_3", "streak_6", "streak_10", "streak_lost"].filter(hasLine).map(urls.line));
  }, []);
}
/** End of the level: the ninja's big finish, then the reward screen (unless the child has gone home meanwhile). */
export function useFinish(onDone: (stars: number) => void) {
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
    await ninja.celebrate();
    if (alive.current) onDone(n);
  };
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

/** Lines under a picture: one per sound; `show` = which positions have their spelling revealed. */
export function SoundLines({ word, show, lit }: { word: Word | null; show: number[]; lit?: number }) {
  if (!word) return null;
  return (
    <div className="sound-lines">
      {word.segs.map((s, i) => (
        <div key={i} className={`sound-line ${lit === i ? "lit" : ""}`}>
          {show.includes(i) && <span aria-hidden style={{ display: "contents" }}><Tile g={s.g} className="reveal drop-in" style={{ pointerEvents: "none" }} /></span>}
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
const HAS_AN = LINES.some((l) => l.id === "this_is_an");
const LINE_IDS = new Set(LINES.map((l) => l.id));
const HAS_LINE = (id: string) => LINE_IDS.has(id);
const picWords = (f: (w: Word) => boolean) => WORDS.filter((w) => w.pic && f(w)).map((w) => w.text);
const firstIs = (w: string, p: PhonemeId) => (WORD_BY_TEXT[w]?.segs[0].p ?? ORAL_WORDS[w]?.first) === p;
const hasMiddle = (w: string, p: PhonemeId) => WORD_BY_TEXT[w]?.segs.some((s, i) => i > 0 && s.p === p);

// ---------------------------------------------------------------- the pick-game engine
export interface PickItem {
  mode: Mode;
  /** extra practice a child on track skips (content/pace.ts) */
  optional?: boolean;
  options: string[]; // ids
  answer: string;
  prompt: Say[];
  /** said when a picture first appears (naming) */
  name?: boolean;
  /** the teaching said once it is right ("I can hear map", "apple starts with /a/"), after the ninja's move has landed.
   *  `held`: a streak tier beat follows it (so it need not linger at the end) */
  onRight?: (o: { held: boolean }) => Promise<void>;
  /** praise after onRight too (a first-try answer that starts a new streak tier gets its tier beat instead) */
  praise?: boolean;
  /** tidy up just before the next item (what onRight showed stays up through the praise or tier beat) */
  after?: () => void;
  listenAgain: Say[];
}

const pickEl = (id: string) => document.querySelector(`.pick-row [aria-label="${CSS.escape(id)}"]`);

function usePickGame(items: PickItem[], opts: { onFinish: (firstTry: number, youdo: number) => void; kind: "pic" | "tile"; avoid?: Move[] }) {
  const pace = usePhasePace("pick");
  const [queue, setQueue] = useState<PickItem[]>(items);
  const [i, setI] = useState(0);
  const [state, setState] = useState<Record<string, "glow" | "right" | "wrong" | "dim" | "">>({});
  const [paw, setPaw] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const misses = useRef(0);
  const firstTry = useRef(0);
  const youdo = useRef(0);
  const named = useRef(new Set<string>());
  const promptLive = useRef(false);
  const answeredEarly = useRef(false);
  const [waitTap, setWaitTap] = useState<string | null>(null);
  const [finished, setFinished] = useState(false); // the last answer is in: the board stays up for the finish, but off
  const item = queue[i];
  useReportProgress(i / queue.length);

  const prevMode = useRef<Mode | null>(null);
  const present = async (it: PickItem) => {
    setBusy(true);
    setState({});
    setPaw(null);
    misses.current = 0;
    const seq: Say[] = [];
    const before = prevMode.current;
    prevMode.current = it.mode;
    if (it.mode === "ido" && before !== "ido") seq.push({ line: "ido" }, { gap: 250 });
    if (it.mode === "wedo" && before === "ido") seq.push({ line: "wedo" }, { gap: 250 });
    if (it.mode === "youdo" && before && before !== "youdo") seq.push({ line: "youdo" }, { gap: 250 });
    // name pictures the first times they appear
    if (opts.kind === "pic")
      for (const o of it.options)
        if (!named.current.has(o)) {
          named.current.add(o);
          // one whole recorded sentence ("This is an apple.", Round 13: no spliced word), or, for a picture without
          // one, "This is a..." and the word
          const whole = nameLine(o);
          const article = /^[aeiou]/.test(o) ? (HAS_AN ? "this_is_an" : "this_is") : "this_is_a";
          seq.push(...(whole ? [{ line: whole }] : [{ line: article }, { gap: 80 }, { word: o }]), { gap: 350 });
        }
    if (seq.length) await say(seq);
    // while the question itself is playing, an eager answer counts: it interrupts Sensei (see choose)
    promptLive.current = it.mode !== "ido";
    answeredEarly.current = false;
    await say(it.prompt);
    promptLive.current = false;
    if (answeredEarly.current) return;
    if (it.mode === "wedo") setState({ [it.answer]: "glow" });
    if (it.mode === "ido") {
      setPaw(it.answer);
      await sleep(1100);
      await choose(it.answer, true);
      return;
    }
    setBusy(false);
  };

  useEffect(() => {
    if (item) present(item);
  }, [i]);

  const choose = async (id: string, auto = false, el?: Element | null) => {
    if (!item || finished) return; // the level is over: the board stays up for the finish, but a tap does nothing
    if (busy && !auto) {
      if (!promptLive.current) {
        // too early (pictures still being named): show we noticed, and to wait
        setWaitTap(id);
        setTimeout(() => setWaitTap(null), 450);
        return;
      }
      promptLive.current = false;
      answeredEarly.current = true;
      hush();
    }
    if (id === item.answer) {
      setBusy(true);
      setPaw(null);
      setState({ [id]: "right" });
      sfx.good();
      // Sensei's own demonstration (I do) shows the ninja's reaction too, but only the child's answers build the streak
      const { held, landed } = rightAnswer(el ?? pickEl(id), opts.kind, { first: !auto && misses.current === 0, living: opts.kind === "pic" && LIVING.has(id), avoid: opts.avoid, soft: !!item.onRight });
      if (item.mode === "youdo") {
        youdo.current++;
        if (misses.current === 0) firstTry.current++;
      }
      if (!auto) pace.answered(item.mode, misses.current === 0);
      // the word Sensei models follows the tap at once, while the (soft) move is still in the air
      if (item.onRight) {
        await afterLanding(landed);
        await item.onRight({ held });
      }
      // a new streak tier is this answer's praise: the ninja powers up and says so, in its own quiet moment
      if (held) await tierBeat();
      else if (!auto && (!item.onRight || item.praise)) await say({ line: pickPraise() });
      await sleep(300);
      item.after?.();
      // (a child on track skips the extra practice: content/pace.ts)
      const n = pace.next(queue, i + 1);
      if (n < queue.length) setI(n);
      else {
        setFinished(true);
        opts.onFinish(firstTry.current, youdo.current);
      }
      return;
    }
    // wrong
    misses.current++;
    sfx.wrong();
    setBusy(true);
    setState((s) => ({ ...s, [id]: "wrong" }));
    await wrongAnswer();
    if (misses.current === 1) {
      await say(item.listenAgain);
      ninja.pose(null);
      setState((s) => ({ ...s, [id]: "" }));
    } else {
      ninja.pose(null);
      // show the answer, dim the rest, and bring this item back later as "youdo"
      const dims = Object.fromEntries(item.options.filter((o) => o !== item.answer).map((o) => [o, "dim" as const]));
      setState({ ...dims, [item.answer]: "glow" });
      await say({ line: "its_this_one" });
      if (!queue.slice(i + 1).some((q) => q.answer === item.answer && q.prompt === item.prompt)) setQueue((q) => [...q, { ...item, mode: "youdo" }]);
    }
    setBusy(false);
  };

  // idle help in youdo: glow after 8 s
  useEffect(() => {
    if (busy || !item || item.mode !== "youdo") return;
    const t = setTimeout(() => setState((s) => ({ ...s, [item.answer]: "glow" })), 8000);
    return () => clearTimeout(t);
  }, [busy, i]);

  useHelp(
    (n) => {
      if (!item) return;
      if (n >= 2) setState((s) => ({ ...s, [item.answer]: "glow" }));
      say(item.prompt);
    },
    [i],
  );

  return { item, i, total: queue.length, state, paw, choose, waitTap, busy, finished };
}

function PickBoard({ game, kind, reveal }: { game: ReturnType<typeof usePickGame>; kind: "pic" | "tile"; reveal?: ReactNode }) {
  const { item, state, paw, choose } = game;
  if (!item) return null;
  const n = item.options.length;
  return (
    <>
      {/* letters sit a little right of centre (x 430-1090 for three), clear of a long row of streak flames riding a lunge */}
      <div key={game.i} className={`row pick-row pick-${kind} n${n}`} style={{ position: "absolute", ...(kind === "pic" ? PLAY : { left: 400, right: 160 }), top: kind === "pic" ? 146 : 170, gap: n >= 3 ? 36 : 60, flexWrap: "nowrap" }}>
        {item.options.map((o, k) => (
          <div key={o} style={{ position: "relative", animationDelay: `${k * 0.08}s` }} className="drop-in">
            {kind === "pic" ? (
              <PicCard w={o} size={240} state={state[o] ?? ""} wait={game.waitTap === o} onTap={(el) => choose(o, false, el)} />
            ) : (
              <Tile g={o} size={n <= 3 ? "xl" : "lg"} state={state[o] === "glow" ? "hint" : state[o] === "right" ? "right" : state[o] === "wrong" ? "wrong" : ""} onTap={(el) => choose(o, false, el)} className={state[o] === "dim" ? "dimmed" : ""} />
            )}
            {paw === o && <TapHint show style={{ right: -50, bottom: -50 }} />}
          </div>
        ))}
      </div>
      {reveal}
      {!game.finished && (
        <div style={{ position: "absolute", left: PLAY_CX, bottom: 26, translate: "-50% 0" }}>
          <RoundButton label="Hear it again" onClick={() => say(item.prompt)}><Icon.speaker /></RoundButton>
        </div>
      )}
    </>
  );
}

const stars = (first: number, youdo: number) => (youdo === 0 ? 3 : first / youdo >= 0.9 ? 3 : first / youdo >= 0.7 ? 2 : 1);
/** The "how we write it" lines under the chosen picture, in the play area. */
/** The "how we write it" lines, under the picture the child chose (at stage x `x`), kept inside the play area. */
const RevealAt = ({ word, show, x }: { word: Word | null; show: number[]; x: number }) => {
  if (!word) return null;
  // four or more sounds: narrower lines, so the row keeps clear of the ninja's aura and flames (x 380 on)
  const n = word.segs.length;
  const lw = n >= 4 ? 124 : 140, gap = n >= 4 ? 12 : 18;
  const w = n * lw + (n - 1) * gap;
  const left = Math.max(380, Math.min(1090 - w, x - w / 2)); // clear of the ninja and the Help corner
  return (
    <div className={n >= 4 ? "reveal-narrow" : ""} style={{ position: "absolute", left, width: w, top: 448, pointerEvents: "none" }}>
      <SoundLines word={word} show={show} />
    </div>
  );
};
/** Where the chosen picture is (stage x of its centre), so its spelling can appear under it. */
const picX = (id: string) => {
  const r = stageRect(pickEl(id));
  return r.w ? r.x + r.w / 2 : PLAY_CX;
};

// ---------------------------------------------------------------- M1: Listening Ears (no letters)
export function ListenLevel({ level, onDone, onQuit }: LevelProps) {
  const items = useRef<PickItem[]>(
    (() => {
      const mk = (mode: Mode, answer: string, other: string, how: "word" | "slow" | "sounds"): PickItem => {
        const w = WORD_BY_TEXT[answer];
        const prompt: Say[] = how === "word" ? [{ line: "listen_tap" }, { gap: 350 }, { word: answer }] : how === "slow" ? [{ line: "listen_slow" }, { gap: 350 }, x(answer)] : [{ line: "listen_sounds" }, { gap: 350 }, { sounds: w.segs, gap: 420 }];
        return {
          mode, answer, options: shuffle([answer, other]), prompt, listenAgain: [{ line: "listen_again" }, { gap: 200 }, ...prompt.slice(2)],
          onRight: () => say([{ line: "i_can_hear" }, { gap: 100 }, { word: answer }]).then(() => {}),
          praise: true,
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
  useEffect(() => {
    preload(items.flatMap((it) => [urls.word(it.answer), `/a/x/${it.answer}.mp3`]));
    (async () => {
      await say({ line: "listen_intro" });
      setStarted(true);
    })();
    return () => hush();
  }, []);
  // one Frame for the whole level, so the ninja (and its streak) stays put from the intro to the finish
  return (
    <Frame level={level} range={[0, 1]}>
      <div className="topbar"><RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton></div>
      {started && <PickInner items={items} kind="pic" onFinish={(f, y) => finish(stars(f, y))} />}
    </Frame>
  );
}

// ---------------------------------------------------------------- M2 First Sound + M4 Symbol Search (+ optional build)
export function FirstSoundLevel(props: LevelProps) {
  const { level } = props;
  const [phase, setPhase] = useState<"first" | "find" | "build" | "read">("first");
  const first = useRef(0);
  const youdo = useRef(0);
  const finish = useFinish(props.onDone);
  const teach = (level.teach ?? []).map((g) => g.split("=")[0]);
  const sounds = teach.map(soundOf);
  const [revealWord, setRevealWord] = useState<Word | null>(null);
  const [revealShow, setRevealShow] = useState<number[]>([]);
  const [revealX, setRevealX] = useState(PLAY_CX);
  const introduced = useRef(new Set<string>());
  const foils = ["dog", "bus", "cup", "hat", "hen", "jam", "bed", "fox", "web", "zip", "van", "cat", "pig", "fan"];
  const items = useRef<PickItem[]>(
    (() => {
      const out: PickItem[] = [];
      // only pictures a child names with the right first sound (blind picture audit → content/pic-names.ts)
      // (no consonant clusters to start: stop, frog; a vowel then a consonant is fine: ant), and only words Sensei can
      // say stretched after a slip ("mmmap"). Picture-only words (apple, octopus) fill in for the vowels, which have
      // few decodable pictures; they are named plainly. (Other picture-only words belong to other games: some are
      // clusters, like star, and some have no picture yet.)
      const targets = (p: PhonemeId) =>
        shuffle([
          ...picWords((w) => w.segs[0].p === p && w.segs.length <= 4 && !["sh", "ch"].includes(w.segs[0].g) && !(w.segs[1] && !PHONEMES[w.segs[0].p].vowel && !PHONEMES[w.segs[1].p].vowel) && STRETCHED.has(w.text)),
          ...Object.keys(ORAL_WORDS).filter((w) => ORAL_WORDS[w].first === p && PHONEMES[p].vowel),
        ].filter(picSaysFirst));
      // each sound's pictures come round in turn: every one is used before any comes back, never the same twice running
      const decks = new Map<PhonemeId, { left: string[]; last?: string }>();
      const next = (p: PhonemeId) => {
        const d = decks.get(p) ?? { left: [] };
        decks.set(p, d);
        if (!d.left.length) {
          d.left = targets(p);
          if (d.left.length > 1 && d.left[0] === d.last) d.left.push(d.left.shift()!);
        }
        return (d.last = d.left.shift()!);
      };
      const mk = (mode: Mode, p: PhonemeId, answer: string, other: string, optional?: boolean): PickItem => ({
        mode, optional, answer, options: shuffle([answer, other]),
        prompt: [{ line: "first_q" }, { gap: 300 }, { sound: p }],
        listenAgain: [{ line: "listen_again" }, { gap: 150 }, STRETCHED.has(answer) ? x(answer) : { word: answer }, { gap: 250 }, { line: "first_q" }, { gap: 200 }, { sound: p }],
        onRight: async ({ held }) => {
          const g = teach[sounds.indexOf(p)];
          // picture-only words (apple, astronaut…) have no spelling data: show just the first sound's spelling
          const w = WORD_BY_TEXT[answer] ?? ({ text: answer, segs: [{ g, p }] } as unknown as Word);
          setRevealWord(w);
          setRevealX(picX(answer));
          setRevealShow([]);
          // "Mop starts with..." [/m/]: the word and its lead-in are one recording (only the pure sound is joined)
          await say(HAS_LINE(`fs_${answer}`) ? [{ line: `fs_${answer}` }, { gap: 120 }, { sound: p }] : [{ word: answer }, { gap: 100 }, { line: "starts_with" }, { gap: 100 }, { sound: p }]);
          if (!introduced.current.has(g) || mode !== "youdo") {
            introduced.current.add(g);
            // the ninja's spell writes the spelling on its line while Sensei says how we spell it. The very first
            // spelling a child sees says what a spelling is (NARRATIVE_AUDIT F11): we hear a sound, we see its spelling
            const written = castSpelling(0, () => setRevealShow([0]));
            const hearSee = isDue("hear-see:w1", "once");
            const ok = await say([{ line: hearSee ? "audit_hear_see" : "how_we_spell" }, { gap: 150 }, { sound: p }]);
            if (ok && hearSee) heard("hear-see:w1");
            await written;
          } else {
            // a spelling the child has met: it simply appears, and stays a moment to be seen (a tier beat is that moment)
            setRevealShow([0]);
            if (!held) await sleep(350);
          }
        },
        after: () => setRevealWord(null),
      });
      for (const p of sounds) {
        const f = shuffle(foils.filter((w) => picSaysFirst(w) && !firstIs(w, p) && !sounds.includes(WORD_BY_TEXT[w].segs[0].p)));
        // (the second "your turn" is extra practice: a child on track goes on, content/pace.ts)
        out.push(mk("ido", p, next(p), f[0]), mk("wedo", p, next(p), f[1]), mk("youdo", p, next(p), f[2]), mk("youdo", p, next(p), f[3], true));
      }
      if (sounds.length > 1) {
        // head to head: the other picture starts with the other sound
        const [a, b] = sounds;
        const others = new Map(sounds.map((q) => [q, shuffle(targets(q))]));
        for (let k = 0; k < 4; k++) {
          const p = k % 2 ? b : a;
          const answer = next(p);
          const pool = others.get(p === a ? b : a)!;
          out.push(mk("youdo", p, answer, pool[k % pool.length], k >= 2));
        }
      }
      return out;
    })(),
  ).current;
  const known = [...knownSpellings(level)].filter((g) => g.length === 1);
  const findItems = useRef<PickItem[]>(
    (() => {
      const out: PickItem[] = [];
      const pool = [...new Set([...teach, ...shuffle(known.filter((g) => !teach.includes(g)))])];
      for (let k = 0; k < 4; k++) {
        const g = teach[k % teach.length];
        const n = teach.length > 1 ? 2 : 2;
        const opts = shuffle([g, ...shuffle(pool.filter((o) => o !== g)).slice(0, n - 1 + (k > 1 && pool.length > 2 ? 1 : 0))]);
        out.push({ mode: "youdo", optional: k >= 2, answer: g, options: opts, prompt: [{ line: "find_q" }, { gap: 300 }, { sound: soundOf(g) }], listenAgain: [{ line: "listen_again" }, { gap: 150 }, { sound: soundOf(g) }] });
      }
      return out;
    })(),
  ).current;

  // the intro is the only explanation of the game a non-reader gets: it is said in full before the first pictures come
  const [started, setStarted] = useState(false);
  useLevelAudio();
  useEffect(() => {
    say({ line: "first_intro" }).then(() => setStarted(true));
    return () => hush();
  }, []);

  const tally = (f: number, y: number) => {
    first.current += f;
    youdo.current += y;
  };
  const finishAll = () => finish(stars(first.current, youdo.current));

  return (
    <Frame level={level} range={phase === "first" ? [0, 0.5] : phase === "find" ? [0.5, 0.75] : [0.75, 1]}>
      <div className="topbar"><RoundButton sm label="map" onClick={props.onQuit}><Icon.home /></RoundButton></div>
      {phase === "first" && started && (
        <PickInner items={items} kind="pic" avoid={NO_SPELL} onFinish={(f, y) => { tally(f, y); setPhase("find"); }} reveal={<RevealAt word={revealWord} show={revealShow} x={revealX} />} />
      )}
      {phase === "find" && <PickInner items={findItems} kind="tile" onFinish={(f, y) => { tally(f, y); level.words?.length ? setPhase("build") : finishAll(); }} />}
      {phase === "build" && <BuildSequence level={level} words={level.words!} onFinish={(f, y) => { tally(f, y); finishAll(); }} />}
    </Frame>
  );
}

/** `avoid`: moves the ninja leaves out here (a spell, when the spelling then appears by a spell). */
function PickInner({ items, kind, onFinish, reveal, avoid }: { items: PickItem[]; kind: "pic" | "tile"; onFinish: (f: number, y: number) => void; reveal?: ReactNode; avoid?: Move[] }) {
  const game = usePickGame(items, { kind, onFinish, avoid });
  (window as any).__snState = { scene: "pick", next: game.item?.answer, busy: game.busy };
  return <PickBoard game={game} kind={kind} reveal={reveal} />;
}

// ---------------------------------------------------------------- M3 Sound Hunt (middle sound) → build → read
export function SoundHuntLevel(props: LevelProps) {
  const { level } = props;
  const g = (level.teach ?? ["i"])[0];
  const p = soundOf(g);
  const [phase, setPhase] = useState<"hunt" | "build" | "read">("hunt");
  const [revealWord, setRevealWord] = useState<Word | null>(null);
  const [revealShow, setRevealShow] = useState<number[]>([]);
  const [revealX, setRevealX] = useState(PLAY_CX);
  const first = useRef(0);
  const youdo = useRef(0);
  const finish = useFinish(props.onDone);
  const PAIRS: Record<string, [string, string][]> = {
    // every picture here passed the blind picture audit (children name it as the word): no fin→"shark", wig→"hair", hot→"soup"
    // (every word here has a stretched clip in public/a/x: the middle sound must be heard long)
    i: [["pin", "pan"], ["tin", "tap"], ["zip", "jam"], ["lid", "mat"], ["pig", "cat"], ["milk", "mug"], ["bin", "bag"]],
    o: [["mop", "map"], ["top", "tap"], ["pot", "pan"], ["cot", "cat"], ["log", "leg"], ["dog", "bag"], ["fox", "fan"]],
  };
  const pairs = PAIRS[g] ?? PAIRS.i;
  const items = useRef<PickItem[]>(
    pairs.map(([ans, other], k): PickItem => ({
      mode: k === 0 ? "ido" : k < 3 ? "wedo" : "youdo",
      // extra practice a child on track skips (content/pace.ts): the second "together" and all but the first alone
      // (I do, we do, you do: as each sound in the first-sound game)
      optional: k === 2 || k >= 4,
      answer: ans, options: shuffle([ans, other]),
      prompt: [{ line: "hunt_q" }, { gap: 250 }, { sound: p }, { gap: 350 }, x(ans), { gap: 350 }, x(other)],
      listenAgain: [{ line: "listen_again" }, { gap: 150 }, x(ans), { gap: 300 }, x(other)],
      onRight: async ({ held }) => {
        const w = WORD_BY_TEXT[ans];
        setRevealWord(w);
        setRevealX(picX(ans));
        setRevealShow([]);
        // "Pin has this sound in the middle..." [/i/], in one recording up to the pure sound
        await say(HAS_LINE(`mid_${ans}`) ? [{ line: `mid_${ans}` }, { gap: 120 }, { sound: p }] : [{ word: ans }, { gap: 100 }, { line: "has_in_middle" }, { gap: 100 }, { sound: p }]);
        const at = w.segs.findIndex((s, i) => i > 0 && s.p === p);
        if (k < 3) {
          const written = castSpelling(at, () => setRevealShow([at]));
          await say([{ line: "how_we_spell" }, { gap: 150 }, { sound: p }]);
          await written;
        } else {
          setRevealShow([at]);
          if (!held) await sleep(350);
        }
      },
      after: () => setRevealWord(null),
    })),
  ).current;
  const [started, setStarted] = useState(false);
  useLevelAudio();
  useEffect(() => {
    // what "the middle" means, before the first hunt and once more a level later (NARRATIVE_AUDIT F09)
    const middle = isDue("place:middle", "twice");
    say([{ line: "hunt_intro" }, ...(middle ? [{ gap: 300 }, { line: "audit_middle_place" }] : [])]).then((ok) => {
      if (ok && middle) heard("place:middle");
      setStarted(true);
    });
    return () => hush();
  }, []);
  void hasMiddle;
  const tally = (f: number, y: number) => ((first.current += f), (youdo.current += y));
  const finishAll = () => finish(stars(first.current, youdo.current));
  return (
    <Frame level={level} range={phase === "hunt" ? [0, 0.4] : phase === "build" ? [0.4, 0.8] : [0.8, 1]}>
      <div className="topbar"><RoundButton sm label="map" onClick={props.onQuit}><Icon.home /></RoundButton></div>
      {phase === "hunt" && started && (
        <PickInner items={items} kind="pic" avoid={NO_SPELL} onFinish={(f, y) => { tally(f, y); setPhase(level.words?.length ? "build" : "read"); }} reveal={<RevealAt word={revealWord} show={revealShow} x={revealX} />} />
      )}
      {phase === "build" && <BuildSequence level={level} words={level.words!} onFinish={(f, y) => { tally(f, y); level.read?.length ? setPhase("read") : finishAll(); }} />}
      {phase === "read" && level.read && <ReadCheck pairs={level.read} onFinish={(f, y) => { tally(f, y); finishAll(); }} />}
    </Frame>
  );
}

// ---------------------------------------------------------------- Dojo: M5 build (gradual release) → M6 read
export function EarlyDojo(props: LevelProps) {
  const { level } = props;
  const [phase, setPhase] = useState<"build" | "read">("build");
  const first = useRef(0);
  const youdo = useRef(0);
  const finish = useFinish(props.onDone);
  useLevelAudio();
  useEffect(() => () => hush(), []);
  const tally = (f: number, y: number) => ((first.current += f), (youdo.current += y));
  return (
    <Frame level={level} range={phase === "build" ? [0, 0.7] : [0.7, 1]}>
      <div className="topbar"><RoundButton sm label="map" onClick={props.onQuit}><Icon.home /></RoundButton></div>
      {phase === "build" && <BuildSequence level={level} words={level.words!} intro onFinish={(f, y) => { tally(f, y); level.read?.length ? setPhase("read") : finish(stars(first.current, youdo.current)); }} />}
      {phase === "read" && level.read && <ReadCheck pairs={level.read} onFinish={(f, y) => { tally(f, y); finish(stars(first.current, youdo.current)); }} />}
    </Frame>
  );
}

interface BuildItem { word: Word; mode: Mode; extra: number; optional?: boolean }
/** Word building with gradual release: I do the first word, we do the next two, then you do. */
export function BuildSequence({ level, words, onFinish, intro }: { level: Level; words: string[]; onFinish: (f: number, y: number) => void; intro?: boolean }) {
  const seq = useRef<BuildItem[]>(
    (() => {
      const ws = words.map((w) => WORD_BY_TEXT[w]).filter(Boolean);
      // a practice dojo (the World Flower's Practise gate) practises a spelling the child has been taught: no "watch
      // me", one word together, then the child's own (five builds, not seven)
      const practice = !!practiceGemOf(level);
      const out: BuildItem[] = practice ? [{ word: ws[0], mode: "wedo", extra: 0 }] : [{ word: ws[0], mode: "ido", extra: 0 }, { word: ws[0], mode: "wedo", extra: 0 }];
      // (the second word together is extra practice for a child who built the first one right: content/pace.ts)
      if (ws[1] && !practice) out.push({ word: ws[1], mode: "wedo", extra: 0, optional: true });
      // on their own: the words not built yet first, so a child who moves on early has still built every word it can
      const you = paceOf(level) ? ownWords(ws, out.map((b) => b.word), Math.max(4, ws.length)) : [...ws, ...ws.slice().reverse()].slice(0, Math.max(4, ws.length));
      you.forEach((w, k) => out.push({ word: w, mode: "youdo", extra: k < 2 ? 0 : 1 }));
      return out;
    })(),
  ).current;
  const [k, setK] = useState(-1);
  const first = useRef(0);
  const youdo = useRef(0);
  const pace = usePhasePace("build", !!level.read?.length);
  const prev = useRef<Mode | null>(null);
  useReportProgress(Math.max(0, k) / seq.length);
  useEffect(() => {
    (async () => {
      // the dojo, the first time a child comes to one (NARRATIVE_AUDIT F08; it counts as the Dojo's first welcome)
      if (intro && isDue("dojo:first", "once")) {
        if (await say([{ line: "audit_dojo_first" }, { gap: 300 }])) {
          heard("dojo:first");
          heard("dojo:welcome");
        }
      }
      if (intro) await say({ line: seq[0].word.segs.length === 2 ? "two_sounds" : "three_sounds" });
      setK(0);
    })();
  }, []);
  if (k < 0) return null;
  const it = seq[k];
  return (
    <BuildOne
      key={k}
      level={level}
      item={it}
      announce={prev.current !== it.mode ? it.mode : null}
      onDone={(firstTry) => {
        prev.current = it.mode;
        if (it.mode === "youdo") {
          youdo.current++;
          if (firstTry) first.current++;
        }
        pace.answered(it.mode, firstTry);
        // a child on track moves on after about three words right first time (content/pace.ts)
        const n = pace.next(seq, k + 1);
        if (n < seq.length) setK(n);
        else onFinish(first.current, youdo.current);
      }}
    />
  );
}

function BuildOne({ level, item, announce, onDone }: { level: Level; item: BuildItem; announce: Mode | null; onDone: (firstTry: boolean) => void }) {
  const { word, mode, extra } = item;
  const known = [...knownSpellings(level)];
  const need = word.segs.map((s) => s.g);
  const [bank] = useState(() => shuffle([...need, ...shuffle(known.filter((g) => !need.includes(g) && g.length === 1)).slice(0, extra)]));
  // bank tiles that have left (flying or landed), and the letters that have landed in their slots
  const [taken, setTaken] = useState<number[]>([]);
  const takenRef = useRef<number[]>([]);
  const [filled, setFilled] = useState<string[]>([]);
  const [lit, setLit] = useState(-1);
  const [glow, setGlow] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [paw, setPaw] = useState<number | null>(null);
  const [built, setBuilt] = useState(false);
  const misses = useRef(0);
  const slotMisses = useRef(0);
  /** first-try letters not counted yet: one of them starts a new streak tier, which waits until the word has been read */
  const held = useRef(0);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bankRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotsRef = useRef<HTMLDivElement>(null);
  const slotQ = (i: number) => (i === 0 ? "first_sound_q" : i === word.segs.length - 1 ? "last_sound_q" : "next_sound_q");

  const ask = async (i: number) => {
    setLit(i);
    const last = i > 0 && i === word.segs.length - 1 && isDue("place:last", "twice");
    const ok = await say([...(last ? [{ line: "audit_last_place" }, { gap: 300 }] : []), { line: slotQ(i) }, { gap: 200 }, x(word.text)]);
    if (ok && last) heard("place:last");
    if (mode === "wedo") setGlow(word.segs[i].g);
  };

  /** The ninja launches bank tile j into slot i, a different way each time (the real tile turns into its faded ghost as
   *  the glowing copy flies). */
  const carry = async (j: number, i: number) => {
    const from = bankRefs.current[j]?.querySelector(".tile");
    const to = slotRefs.current[i];
    const flight = from && to ? launch(chooseFrom(LAUNCHES[streak.tier], recentLaunch), from, to) : Promise.resolve();
    takenRef.current = [...takenRef.current, j];
    setTaken(takenRef.current);
    await flight;
    if (!from || !to) sfx.place();
    setFilled((f) => [...f, bank[j]]);
  };

  const finishWord = async () => {
    setBusy(true);
    setLit(-1);
    await sleep(300);
    await say({ line: "say_sounds_read" });
    for (let i = 0; i < word.segs.length; i++) {
      setLit(i);
      await say({ sound: word.segs[i].p });
      await sleep(250);
    }
    setLit(-1);
    await sleep(900); // time for the child to read it aloud
    await say({ word: word.text });
    sfx.great();
    const c = stageXY(slotsRef.current);
    fx.burst(c.x, c.y, "petals", 18);
    // the built word hops, letter by letter, and the ninja celebrates it: a cheer, or on a streak a gift of stars and
    // hearts that settles on the word. If the word took the streak into a new tier, the power-up is its celebration,
    // with its line as the praise.
    setBuilt(true);
    recordWordSpelt(word, misses.current === 0);
    if (held.current) {
      for (; held.current > 0; held.current--) await tierBeat();
    } else {
      void (streak.tier === 0 || mode === "ido" ? ninja.act("cheer") : gift(slotsRef.current, { shape: "sides" }));
      if (mode !== "ido") await say({ line: pickPraise() });
    }
    // the first word the child builds fills a gem (NARRATIVE_AUDIT F04, once per save): it pops up beside the word
    if (mode !== "ido") await explainGemEnergy(gemSeg(word, level.teach), { x: PLAY_CX + 250, y: 190 }, () => !!slotsRef.current?.isConnected);
    onDone(misses.current === 0);
  };

  useEffect(() => {
    (async () => {
      const pre: Say[] = [];
      if (announce) pre.push({ line: announce }, { gap: 250 });
      if (mode === "ido") {
        await say([...pre, { line: "build_ido_1" }, { gap: 200 }, { word: word.text }, { gap: 350 }, { line: "build_ido_2" }, { gap: 200 }, x(word.text), { gap: 300 }]);
        // the picture rail's "Ninjas read this way!" (warm-up W2) carried over to printed words (NARRATIVE_AUDIT F10)
        if (isDue("left-right:build", "once")) {
          const [ok] = await Promise.all([say([{ line: "fm_l2_way" }, { gap: 200 }, { line: "audit_left_right" }]), sweepUnder(slotsRef.current, 1800)]);
          if (ok) heard("left-right:build");
        }
        await say({ line: "build_ido_3" });
        for (let i = 0; i < word.segs.length; i++) {
          setLit(i);
          await say(x(word.text));
          const j = bank.findIndex((g, b) => g === word.segs[i].g && !takenRef.current.includes(b));
          setPaw(j);
          await sleep(700);
          setPaw(null);
          await Promise.all([carry(j, i), say({ sound: word.segs[i].p })]);
          await sleep(300);
        }
        await finishWord();
        return;
      }
      await say([...pre, { word: word.text }]);
      await ask(0);
      setBusy(false);
    })();
  }, []);

  const tap = async (g: string, j: number) => {
    if (busy) return;
    const i = filled.length;
    const s = word.segs[i];
    if (g === s.g) {
      // a repeated letter (pop, dad): whichever copy was tapped, send one that is still in the bank
      if (takenRef.current.includes(j)) j = bank.findIndex((b, k) => b === g && !takenRef.current.includes(k));
      if (j < 0) return;
      recordSpell(s, misses.current === 0);
      setGlow(null);
      setBusy(true);
      // the sound is said as the spell carries the letter home
      const flight = carry(j, i);
      // counted once the spell is under way; we-do (the answer glows) still counts, gently: it was their tap. A letter
      // that would start a new streak tier (and any after it) is counted once the word has been read (finishWord)
      if (slotMisses.current === 0) {
        if (held.current || crossesTier()) held.current++;
        else streak.hit();
      }
      slotMisses.current = 0;
      await Promise.all([flight, say({ sound: s.p })]);
      if (i + 1 === word.segs.length) return finishWord();
      await ask(i + 1);
      setBusy(false);
    } else {
      misses.current++;
      slotMisses.current++;
      recordSpell(s, false);
      setWrong(g);
      sfx.wrong();
      setBusy(true);
      // letters held back for a tier-up that never came: the streak ends here anyway
      held.current = 0;
      await wrongAnswer();
      // never segment for the child: stretch the word and point at the slot; 2nd miss shows the answer
      if (misses.current % 2 === 1) await say([{ line: listenLead(word.text) }, { gap: 200 }, x(word.text)]);
      else {
        setGlow(s.g);
        await say({ line: "its_this_one" });
      }
      ninja.pose(null);
      setWrong(null);
      setBusy(false);
    }
  };
  // `next` stays set while busy (taps are ignored then), so a bot never falls back to tapping some other tile
  (window as any).__snState = { scene: "build", next: word.segs[filled.length]?.g ?? null, busy };
  useHelp(
    (n) => {
      if (n >= 2) setGlow(word.segs[filled.length]?.g ?? null);
      say([{ line: listenLead(word.text) }, { gap: 150 }, x(word.text)]);
    },
    [filled.length],
  );

  const cx = PLAY_CX;
  const card = word.pic ? { w: 240, h: 190, top: 64 } : { w: 200, h: 170, top: 74 };
  return (
    <>
      <WordCard word={word} className="pop-in" onHear={() => say(x(word.text))} style={{ left: cx - card.w / 2, top: card.top, width: card.w, height: card.h }} />
      <div style={{ position: "absolute", ...PLAY, top: 296, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div ref={slotsRef} className={`slots ${built ? "built" : ""}`}>
          {word.segs.map((_, i) => (
            <div key={i} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${i < filled.length ? "filled" : lit === i ? "active" : ""}`} style={{ position: "relative", animationDelay: built ? `${i * 0.09}s` : undefined }}>
              {i < filled.length && <Tile g={filled[i]} className="landed" withButtons lit={lit === i} />}
              {lit === i && i >= filled.length && <span className="slot-arrow" />}
            </div>
          ))}
        </div>
      </div>
      {/* the letters to choose from, along the bottom of the play area (x 340-1120) and low enough (top edge at y 570)
          to stay clear of Sensei's caption bubble; five or more get a little smaller */}
      <div className={`row build-bank ${bank.length >= 5 ? "many" : ""}`} style={{ position: "absolute", ...PLAY, bottom: 18, gap: bank.length >= 5 ? 14 : 18, flexWrap: "nowrap" }}>
        {bank.map((g, j) => (
          <div key={g + j} ref={(el) => void (bankRefs.current[j] = el)} style={{ position: "relative" }}>
            <Tile g={g} size="lg" state={taken.includes(j) ? "used" : wrong === g ? "wrong" : glow === g ? "hint" : ""} onTap={() => tap(g, j)} />
            {paw === j && <TapHint show style={{ right: -50, bottom: -50 }} />}
          </div>
        ))}
      </div>
      {word.pic && (
        <div style={{ position: "absolute", left: cx + card.w / 2 + 28, top: 112 }}>
          <RoundButton sm label="Hear the word" onClick={() => say(x(word.text))}><Icon.speaker /></RoundButton>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- M6: Who read it right?
export function ReadCheck({ pairs, onFinish }: { pairs: [string, string][]; onFinish: (f: number, y: number) => void }) {
  const [k, setK] = useState(-1);
  const first = useRef(0);
  const done = useRef(0);
  const pace = usePhasePace("read");
  const items = useRef<PaceItem[]>(pairs.map(() => ({ mode: "youdo" }))).current;
  useReportProgress(Math.max(0, k) / pairs.length);
  useEffect(() => {
    (async () => {
      await say({ line: "read_intro" });
      setK(0);
    })();
  }, []);
  if (k < 0) return null;
  const [right, wrongW] = pairs[k];
  return (
    <ReadOne
      key={k}
      right={WORD_BY_TEXT[right]}
      wrong={WORD_BY_TEXT[wrongW]}
      onDone={(ok) => {
        if (ok) first.current++;
        done.current++;
        pace.answered("youdo", ok);
        // one reading check right first time is enough for a child on track (content/pace.ts)
        const n = pace.next(items, k + 1);
        if (n < pairs.length) setK(n);
        else onFinish(first.current, done.current);
      }}
    />
  );
}
/** The reading check's own area: a little left of the play area's centre (x 388-972 for the readers), so Sensei's
 *  caption bubble (bottom-right, narrowed here in early.css) never covers a reader. */
const READ = { left: 380, right: 320 } as const;
function ReadOne({ right, wrong, onDone }: { right: Word; wrong: Word; onDone: (firstTry: boolean) => void }) {
  const hero = useHero();
  const [tapped, setTapped] = useState<number[]>([]);
  const [lit, setLit] = useState(-1);
  // either of them may be the one who reads it right (and where they stand is shuffled too)
  const [readers] = useState(() => {
    const kaiRight = Math.random() < 0.5;
    return shuffle([{ who: "kai", word: kaiRight ? right : wrong }, { who: "suki", word: kaiRight ? wrong : right }]);
  });
  const [heard, setHeard] = useState(false);
  const [state, setState] = useState<Record<string, string>>({});
  const misses = useRef(0);
  const busy = useRef(false);
  const tappedRef = useRef(new Set<number>());
  /** tap: the child taps the sounds; who: the readers are reading; pick: tap the one who read it right */
  const phase = useRef<"tap" | "who" | "pick">("tap");
  // "Tap the sounds..." is said in full first (a tap before it ends wiggles: wait for Sensei)
  const [ready, setReady] = useState(false);
  const [wiggle, setWiggle] = useState(-1);
  useEffect(() => {
    say({ line: "read_tap_sounds" }).then(() => setReady(true));
  }, []);
  const tapSound = async (i: number) => {
    if (!ready) {
      setWiggle(i);
      setTimeout(() => setWiggle((w) => (w === i ? -1 : w)), 450);
      return;
    }
    // while the readers read, or Sensei is answering a choice, a sound tap would cut them off: they come first (a
    // little wiggle says "wait", so a tap is never ignored)
    if (phase.current === "who" || busy.current) {
      setWiggle(i);
      setTimeout(() => setWiggle((w) => (w === i ? -1 : w)), 450);
      return;
    }
    setLit(i);
    await say({ sound: right.segs[i].p });
    setLit((l) => (l === i ? -1 : l));
    tappedRef.current.add(i);
    setTapped([...tappedRef.current]);
    // the last sound is in: the readers read, once (a double tap must not start it twice)
    if (tappedRef.current.size === right.segs.length && phase.current === "tap") {
      phase.current = "who";
      setLit(-1);
      await sleep(600);
      await say({ line: "read_who" });
      for (const r of readers) {
        setTalking(r.who);
        await say([{ line: r.who === "kai" ? "kai_says" : "suki_says" }, { gap: 100 }, { word: r.word.text }]);
        await sleep(250);
      }
      setTalking(null);
      setHeard(true);
      phase.current = "pick";
    }
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
  const pickReader = async (who: string, el: Element) => {
    if (!heard || busy.current) {
      // not yet (they are still reading, or Sensei is answering): a little wiggle says "wait", so a tap is never ignored
      setReaderWait(who);
      setTimeout(() => setReaderWait((w) => (w === who ? null : w)), 450);
      return;
    }
    const r = readers.find((x) => x.who === who)!;
    busy.current = true;
    if (r.word === right) {
      setState({ [who]: "right" });
      sfx.good();
      recordRead(right, misses.current === 0);
      // the player's ninja sends the reader who got it right a gift of stars; if that reader is its own hero, it cheers
      // along with its portrait
      const { held, landed } = rightAnswer(el, "reader", { first: misses.current === 0, self: who === hero, soft: true });
      // as the gift settles on the reader, Sensei reads the word it read, sound by sound, each tile lighting as its
      // sound is said, then the whole word with every tile lit
      await afterLanding(landed);
      await say({ sounds: right.segs, gap: 250, onSeg: setLit });
      setLit(-2);
      await say({ word: right.text });
      setLit(-1);
      if (held) await tierBeat();
      else await say({ line: pickPraise() });
      onDone(misses.current === 0);
      return;
    }
    misses.current++;
    setState({ [who]: "wrong" });
    sfx.wrong();
    await wrongAnswer();
    ninja.pose(null);
    // correct at the exact place: "If it was sit, this would be /i/. Is it? No! It's /a/."
    const d = right.segs.findIndex((s, i) => wrong.segs[i]?.p !== s.p);
    setLit(d);
    await say([{ line: "if_it_was" }, { gap: 100 }, { word: wrong.text }, { gap: 150 }, { line: "this_would_be" }, { gap: 100 }, { sound: wrong.segs[d]?.p ?? right.segs[d].p }, { gap: 200 }, { line: "is_it_no" }, { gap: 100 }, { sound: right.segs[d].p }], { reveal: true });
    setLit(-1);
    setState({});
    busy.current = false;
  };
  (window as any).__snState = { scene: "read", next: heard ? readers.find((r) => r.word === right)!.who : null, tapIdx: ready && tapped.length < right.segs.length ? right.segs.findIndex((_, i) => !tapped.includes(i)) : null };
  return (
    <>
      <div className="row" style={{ position: "absolute", ...READ, top: 92, gap: 12, flexWrap: "nowrap" }}>
        {right.segs.map((s, i) => (
          <button key={i} aria-label={`sound ${i}`} className={`tile lg ${lit === i || lit === -2 ? "hint" : tapped.includes(i) ? "right" : ""} ${wiggle === i ? "wait" : ""}`} {...tapProps(() => tapSound(i))}>
            <span className="g">{s.g}</span>
            <span className={`sb ${s.g.length > 1 ? "bar" : "dot"} ${lit === i ? "lit" : ""}`} />
          </button>
        ))}
      </div>
      {/* the readers are Kai and Suki in round portrait windows, each holding an open book. They wait (soft grey) while
          the child taps the sounds; whoever is reading lights up, with sound waves coming off the window. One of them is
          the player's own hero: when it reads, the ninja bottom-left speaks too (the same waves by its head), so the
          portrait reads as "my ninja reading", and it cheers or thinks along with the portrait when the child judges it */}
      <div className="row readers" style={{ position: "absolute", ...READ, top: 266, gap: 84, flexWrap: "nowrap" }}>
        {readers.map((r) => {
          const st = state[r.who] ?? "";
          const pose = st === "right" ? "cheer" : st === "wrong" ? "think" : "idle";
          return (
            <button key={r.who} aria-label={`reader ${r.who}`} data-who={r.who} data-me={r.who === hero || undefined} className={`reader ${st} ${talking === r.who ? "talking" : !heard && talking !== r.who ? "waiting" : ""} ${readerWait === r.who ? "wait" : ""}`} {...tapProps<HTMLButtonElement>((el) => pickReader(r.who, el))}>
              <span className="reader-window">
                <img src={heroImg(r.who, pose)} alt="" key={pose} className={`pose-${pose}`} />
              </span>
              <svg className="reader-book" viewBox="0 0 124 66" aria-hidden="true">
                <path className="cover" d="M3 16v44c24-6 44-6 59 3 15-9 35-9 59-3V16" />
                <path className="page" d="M62 13C46 4 24 4 7 10v44c17-6 39-6 55 3z" />
                <path className="page" d="M62 13c16-9 38-9 55-3v44c-17-6-39-6-55 3z" />
                <path className="text" d="M17 20c11-3 23-3 35 1M17 30c11-3 23-3 35 1M17 40c11-3 23-3 35 1M72 21c12-4 24-4 35-1M72 31c12-4 24-4 35-1M72 41c12-4 24-4 35-1" />
              </svg>
              {talking === r.who && (
                <svg className="reader-waves" viewBox="0 0 60 80" aria-hidden="true">
                  <path d="M8 22c8 8 8 28 0 36" />
                  <path d="M22 12c14 14 14 42 0 56" />
                  <path d="M36 2c20 20 20 56 0 76" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {talking === hero && (
        <svg className="reader-waves me-waves" viewBox="0 0 60 80" aria-hidden="true">
          <path d="M8 22c8 8 8 28 0 36" />
          <path d="M22 12c14 14 14 42 0 56" />
          <path d="M36 2c20 20 20 56 0 76" />
        </svg>
      )}
    </>
  );
}
