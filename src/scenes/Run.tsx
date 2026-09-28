// Ninja Run: auto-running platformer. Tap/space to jump (double jump). Word events:
//  - "blend": Sensei says the sounds (c-a-t); lanterns carry written words; catch the one that blends to them.
//  - "read": a word appears on the banner; lanterns carry pictures; catch the matching picture.
// The lanterns come in as a group. Once they are all in view the ninja stops in a ready stance while Sensei speaks,
// then the world drifts on slowly so each lantern passes overhead in turn. No fail state.
//
// The runner's ninja is drawn on the canvas and is the player's ninja (docs/HERO.md), so there is no <NinjaSpot/> here.
// It is 200 px wide and runs on the run's ground line (feet at y ≈ 620, not the 700 of <NinjaSpot/>), home at x 235.
// It wears the answer streak (src/engine/streak.ts) itself: a row of flames over its head (one per answer), a golden
// aura, light rays, a glowing rim and rising sparkles at 3 in a row, a multicolour aura with afterimages, a ribbon trail
// and speed lines at 6, a rainbow aura with an orbiting energy ring at 10. A tapped lantern gets a flying leap, then a
// move (kick, double punch, front flip, pirouette, spell) that bursts it with a POW; the word rises out of it, on top of
// everything, and lights up sound by sound while Sensei blends it. Crossing into a tier, Sensei's streak line ("Ninja
// power!") is the praise and the ninja powers up as it's said. A wrong lantern gets a puzzled "hm?" and a hop back to a
// gap between the lanterns, and Sensei's correction starts with "Keep going, ninja!" if a streak of 3+ was lost. On a
// streak the ninja kicks crates out of the way and flips over spikes; without one it trips and hops over them (never
// hurt). At the end the gong is already in view: a flying kick on it, a backflip, a ground-pound and a cheer.
// Speech always leads: the moves run alongside it and never make the child wait.
// The teacher's voice (docs/TEACHER_SCRIPT.md §3.21, §4.1, §4.5; FIX_PLAN §13 TV-D5.1): the world waits on the start
// line for ▶ on every run, the starting gun. The first run of a save (the full form) says what the game is ("This game
// is called Ninja Run…"), asks for a practice jump (a tap anywhere; the pointing hand taps the play area), floats two
// example lanterns past as it says who does what, and holds on "Are you ready? Tap the green arrow, and off we go!";
// a later day's first run says "It's Ninja Run again!…" as the gun and has the practice jump on the move, and a known
// game just the gun. The ninja stands ready facing ▶ and bows on the answer. On the full form the first lantern group
// goes straight to its question, since "When the lanterns come…" has just said who does what ("Here come the
// lanterns…" only if that was over a minute ago: never the same thing twice within seconds); on later runs, once a
// session, it opens with fast and slow's "I'll say it the slow way. You catch the whole word." (§9.3). Groups 1–3 are asked "Listen for the word…" + the sounds + "Tap the lantern with my word."
// (the first group's answer glows after 2 s on the full form), but never a third time within a minute; from the fourth,
// the sounds alone (SCRIPT_FIXES C16).
// The sounds are the question, so no petals: neutral dots light in the banner, one per sound (Dec1, SD r38). The first
// catch of a session reads it back slow, then fast ("Let's say it the slow way…" · the sounds · "And now the fast
// way…" · the word; no rabbit tap: a tap anywhere is a jump), with the tortoise and the rabbit beside the speaker. A
// wrong lantern: "That's a different word. Listen again…" + the sounds, taking turns with the slow way's stuck recap.
// Lanterns missed come round again, with a quiet child's ladder (§5.5): the question; then the right one glows and the
// hand taps it ("Here it is. Tap it when you're ready."); then "Take your time, ninja."; then the sounds alone.
// After a word, at most one of a tier line, a reminder (its petal pops above the lit spelling), the gem's first fill
// and praise (afterWordSay, SCRIPT_FIXES C4, C15); praise every third word at most, a tier line counting as praise
// (and silent on the last word, whose praise is the gong's). The counter and the pickups are stars: a teardrop always
// means a sound (Dec6, SD r41).
// Navigation (docs/NAVIGATION.md §5.D): Home is the nav layer's (top-left). Hear it again is a speaker in the top bar,
// between the progress bar and the star counter, for every word in both modes: it says the word's question again
// ("Listen for the word…", the sounds with the dots lighting, "Tap the lantern with my word."; in reading mode the
// cue, with the arrow under the word again if the left-to-right line was said), and the ninja holds still while it
// plays. During the Ready hold it is the hold's (the frame and the question).
import { useEffect, useRef, useState } from "react";
import { FAST } from "../engine/fast";
import type { LevelProps } from "../App";
import type { Seg, Word } from "../content/phonics";
import { levelWords, worldOf } from "../content/worlds";
import { LINES } from "../content/lines";
import { say, sayBlend, sfx, playMusic, preload, urls, hush, onClip, onSay, type Say, type SoundAt } from "../engine/audio";
import { chooseWords, shuffle } from "../engine/learner";
import { recordRead } from "../engine/store";
import { praiseBy, praiseWanted } from "../engine/feedback";
import { streak, tierLineId, tierLineSaid, type Tier } from "../engine/streak";
import { img, Progress, fx, useHero, W, H, sleep, useHelp, SenseiDock, isUpright, shakeStage } from "../ui/ui";
import { poseSrc, poseFit, probePoses, hasPose, type Pose } from "../ui/poses";
import { adjacentSlots, adjacentUnit, gemSeg, runBlendCue, RUN_BLEND_CUES } from "../content/narrative";
import {
  NarrOverlay, afterWordSay, beginLevel, explainGemEnergy, framed, fsHeardThisSession, fsPraise, fsReadback, fsSaid, fsStuck, gameForm, heard as told, isDue,
  lettersReminder, onceInSave, played, readThisWay, readyAsk, struggledIn, sweepUnder, twoSoundsReminder,
} from "./narrate";
import { useNav, ReplayButton, TopBar, holdReady, navSpeed } from "../ui/nav";
import { SoundDots } from "../ui/SoundBadge";
import "../styles/run.css";
import "../styles/nav-D.css";

const GROUND = 612;
const GRAV = 3000;
const JUMP_V = -1280;
/** Words per level. World 1 has only six words; later worlds get eight, so a streak has time to reach "super" (6 in a
 *  row) and show it off for a couple of words before the gong. */
/** Words per run (the streak carries over from level to level, so the top tiers are still within reach). */
const eventsFor = (_world: number) => 6;
const HX = 235; // the ninja's home x: inside the ninja zone (x 0-330)
const HW = 200; // the ninja's width in the run pose
const S = HW / 170; // body offsets below were tuned at 170 px wide
const BODY = 90 * S; // feet to tummy
const PIVOT = HW * 0.62; // flips and spins turn around the tummy
const LANTERN_Y = 252;
/** The tortoise and rabbit badges' centre (the nav layer's FastSlowBadges, TEACHER_SCRIPT §9.6). */
const SPEED_AT = { x: 1142, y: 160 }; // high enough that the caption bubble above Sensei (bottom-right) never covers a lantern
/** Everyday praise every this many right words (see catchLantern). */
const PRAISE_EVERY = 3;
/** The group's cue and "Tap the lantern with my word." are said on groups 1–3, but never a third time in this many
 *  seconds (SCRIPT_STYLE: no line more than twice a minute): a quick child's third group has the sounds alone. */
const CUE_WINDOW = 60;
/** "Here come the lanterns. I'll say the sounds of a word." at the first group of a full-form run only if "When the
 *  lanterns come, I'll say some sounds, and you catch the word." began more than this many seconds ago (a child who
 *  lingered at ▶): straight after it, the two say the same thing twice within ten seconds. */
const HOW_WINDOW = 60;
/** Running between words (px) after the praise: a breather with a crate or some stars, not a wait. */
const BETWEEN = 600;
/** Lanterns come in as a group, this far apart (three still fit between the ninja and the caption bubble). */
const SPACING = { 2: 330, 3: 285 } as const;
/** The group has arrived once its last lantern is this far in: the ninja stops while Sensei speaks. */
const LAST_IN = 990;
/** How far the world runs from a word's start until its lanterns have arrived (about 3 s). */
const APPROACH = 1000;
/** A tapped lantern further right than this comes to the ninja (the world dashes on), so the hit lands well on screen. */
const HOMING_MAX = 860;
/** Backgrounds whose art ends in a blurred, out-painted strip: the image row where the painting ends. That row is drawn
 *  just behind the ground line (the scene zooms in a little) so the strip never shows. Measured by edge energy per row. */
const BG_FLOOR: Record<string, number> = { river: 516, mountain: 490 };
const INK = "#2b1d14";
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

type Lantern = { x: number; y: number; word: Word; correct: boolean; popped: boolean; phase: number; gone?: number; burst?: boolean; wiggle?: number };
type Thing = { x: number; kind: "crate" | "spikes" | "star"; y: number; got?: boolean; kicked?: boolean; flipped?: boolean };
type Pt = { x: number; y: number };

// ---------------------------------------------------------------- moves
type Move = "kick" | "punch" | "spin" | "flip" | "cast" | "power" | "think" | "crate" | "gongkick" | "backflip" | "cheer" | "stumble" | "bow";
const DUR: Record<Move, number> = { kick: 0.5, punch: 0.46, spin: 0.6, flip: 0.56, cast: 0.5, power: 0.95, think: 1.3, crate: 0.34, gongkick: 0.6, backflip: 0.6, cheer: 1.3, stumble: 0.62, bow: 0.9 };
/** What a right lantern gets, by streak tier (never one of the last two). */
const POOLS: Record<Tier, Move[]> = {
  0: ["kick", "punch", "flip", "cast"],
  1: ["kick", "punch", "flip", "spin", "cast"],
  2: ["kick", "spin", "flip", "cast"],
  3: ["flip", "spin", "kick", "cast"],
};
type Look = { pose: Pose; rot: number; sx: number; sy: number; dx: number; dy: number };

// ---------------------------------------------------------------- colours
// A copy of src/ui/Ninja.tsx's palette and flame art (it doesn't export them yet). Import them from there once it does.
const COLS: Record<Tier, string[]> = {
  0: ["#fff4dc", "#ffe38a", "#ffc53d"],
  1: ["#ffe38a", "#ffc53d", "#ff9a3d", "#fff4dc"],
  2: ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"],
  3: ["#ff5a5a", "#ffb03d", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"],
};
const RAINBOW = ["#ff5a5a", "#ffb03d", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"];
const SUPER = ["#ff7aa2", "#ffc53d", "#5ec8f2", "#b48cff"];
/** The spell sphere: [highlight, body, rim] per tier. */
const ORB: Record<Tier, [string, string, string]> = {
  0: ["#fff6c2", "#ffc53d", "#d86a00"],
  1: ["#fff6c2", "#ffc53d", "#d86a00"],
  2: ["#ffe0f0", "#ff7aa2", "#7a2fa8"],
  3: ["#e8fbff", "#4ab8ff", "#6a3fc8"],
};
const GLOW_RGB: Record<Tier, string> = { 0: "255,205,80", 1: "255,205,80", 2: "255,122,190", 3: "255,233,74" };
const FLAME_COLS: Record<Tier, string[][]> = {
  0: [["#ff8a3d", "#ffc53d", "#fff4b0"]],
  1: [["#ff5a1a", "#ffb02e", "#fff6c8"]],
  2: [["#ff3d7a", "#ffb02e", "#fff8e0"], ["#ff5a1a", "#ffd23d", "#fffbe8"]],
  3: [["#ff3b3b", "#ffb02e", "#fff8e0"], ["#ff8a1a", "#ffe23a", "#fffbe8"], ["#3fbf3f", "#ffe23a", "#fffbe8"], ["#2f8fff", "#ffd23d", "#fffbe8"], ["#9b5cf0", "#ffb02e", "#fff8e0"]],
};
const FLAME_GLOW: Record<Tier, string> = { 0: "rgba(0,0,0,0)", 1: "rgba(255,170,40,0.95)", 2: "rgba(255,90,170,0.95)", 3: "rgba(255,255,255,0.95)" };

// ---------------------------------------------------------------- easing
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeIn = (x: number) => Math.pow(clamp01(x), 3);
const easeInOut = (x: number) => ((x = clamp01(x)), x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x: number) => ((x = clamp01(x)), 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2));
/** 0 → 1 → 0 between a and b */
const hump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin(((x - a) / (b - a)) * Math.PI));

// ---------------------------------------------------------------- textures (built once, drawn every frame)
function mkCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}
const rgb = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
function mixCols(cols: string[], k: number, cyclic = true): string {
  const n = cols.length;
  const x = cyclic ? (((k % 1) + 1) % 1) * n : clamp01(k) * (n - 1);
  const i = Math.floor(x) % n;
  const j = cyclic ? (i + 1) % n : Math.min(n - 1, i + 1);
  const f = x - Math.floor(x);
  const a = rgb(cols[i]), b = rgb(cols[j]);
  return `rgb(${(a[0] + (b[0] - a[0]) * f) | 0},${(a[1] + (b[1] - a[1]) * f) | 0},${(a[2] + (b[2] - a[2]) * f) | 0})`;
}
const tex = new Map<string, HTMLCanvasElement>();
function cached(key: string, make: () => HTMLCanvasElement) {
  let c = tex.get(key);
  if (!c) tex.set(key, (c = make()));
  return c;
}
/** Let go of every baked texture (the run is over): about 12 MB of canvases would otherwise stay for the session. */
function dropTextures() {
  for (const c of tex.values()) c.width = c.height = 0; // (frees the backing store now, not at the next GC)
  tex.clear();
}
/** Only a soft glow, baked once: the shape drawn far off the canvas with its shadow thrown back onto it (a live
 *  shadowBlur every frame is slow on phones). `draw` fills the shape in local units, centred on (0, 0) within ±r. The
 *  caller draws the shape itself over it, as the canvas draws a shadow under its shape. `k` = local units → texture px. */
function glowOnly(key: string, r: { w: number; h: number }, blur: number, colour: string, k: number, draw: (g: CanvasRenderingContext2D) => void) {
  return cached(`glow|${key}`, () => {
    const pad = blur * 1.6;
    const c = mkCanvas((r.w + pad * 2) * k, (r.h + pad * 2) * k);
    const g = c.getContext("2d")!;
    const far = c.width + 100;
    g.shadowColor = colour;
    g.shadowBlur = blur * k;
    g.shadowOffsetX = far;
    g.translate(c.width / 2 - far, c.height / 2);
    g.scale(k, k);
    draw(g);
    return c;
  });
}
/** The aura behind the ninja: warm gold (tier 1), a swirl of colours (2), a rainbow (3). */
function auraTex(tier: Tier) {
  return cached(`aura${tier}`, () => {
    const c = mkCanvas(256, 256);
    const g = c.getContext("2d")!;
    const R = 128;
    if (tier <= 1) {
      const gr = g.createRadialGradient(R, R, 0, R, R, R);
      gr.addColorStop(0, "rgba(255,250,215,0.95)");
      gr.addColorStop(0.36, "rgba(255,205,80,0.75)");
      gr.addColorStop(0.64, "rgba(255,205,80,0.32)");
      gr.addColorStop(1, "rgba(255,205,80,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 256);
      return c;
    }
    const cols = tier === 2 ? SUPER : RAINBOW;
    const N = 96;
    for (let i = 0; i < N; i++) {
      g.fillStyle = mixCols(cols, i / N);
      g.beginPath();
      g.moveTo(R, R);
      g.arc(R, R, R, (i / N) * TAU, ((i + 1.6) / N) * TAU);
      g.closePath();
      g.fill();
    }
    g.globalCompositeOperation = "destination-in";
    const m = g.createRadialGradient(R, R, 0, R, R, R);
    m.addColorStop(0, "rgba(0,0,0,1)");
    m.addColorStop(0.26, "rgba(0,0,0,0.95)");
    m.addColorStop(0.58, "rgba(0,0,0,0.5)");
    m.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = m;
    g.fillRect(0, 0, 256, 256);
    g.globalCompositeOperation = "source-over";
    const core = g.createRadialGradient(R, R, 0, R, R, R * 0.5);
    core.addColorStop(0, "rgba(255,255,255,0.85)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = core;
    g.fillRect(0, 0, 256, 256);
    return c;
  });
}
/** Light rays fanning out behind the ninja. */
function raysTex(tier: Tier) {
  return cached(`rays${tier}`, () => {
    const c = mkCanvas(512, 512);
    const g = c.getContext("2d")!;
    const R = 256;
    const wedge = (a0: number, a1: number, col: string) => {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(R, R);
      g.arc(R, R, R, a0 * DEG, a1 * DEG);
      g.closePath();
      g.fill();
    };
    if (tier <= 1) for (let a = 0; a < 360; a += 20) wedge(a, a + 7, "rgba(255,246,200,0.8)");
    else if (tier === 2)
      for (let a = 0; a < 360; a += 40) {
        wedge(a, a + 7, "rgba(255,190,225,0.8)");
        wedge(a + 20, a + 27, "rgba(160,225,255,0.8)");
      }
    else
      for (let a = 0; a < 360; a += 60) {
        wedge(a, a + 6, "rgba(255,110,110,0.75)");
        wedge(a + 15, a + 21, "rgba(255,233,74,0.8)");
        wedge(a + 30, a + 36, "rgba(95,211,95,0.75)");
        wedge(a + 45, a + 51, "rgba(74,184,255,0.8)");
      }
    g.globalCompositeOperation = "destination-in";
    const m = g.createRadialGradient(R, R, 0, R, R, R);
    m.addColorStop(0, "rgba(0,0,0,1)");
    m.addColorStop(0.2, "rgba(0,0,0,1)");
    m.addColorStop(0.7, "rgba(0,0,0,0)");
    g.fillStyle = m;
    g.fillRect(0, 0, 512, 512);
    return c;
  });
}
/** A soft glowing dot (sparkles, orbiting energy, trophy halo). */
function glowDot(color: string) {
  return cached(`dot${color}`, () => {
    const c = mkCanvas(64, 64);
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.28, color);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return c;
  });
}
/** A four-point star (sparkles), on any context. */
function star4On(g: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 ? s * 0.22 : s * 0.5;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  g.fill();
  g.restore();
}
/** An orbiting energy dot (tier 3): its coloured glow and white core, baked (drawn 68 px across at scale 1). */
function orbitDot(col: string) {
  return cached(`orbit|${col}`, () => {
    const c = mkCanvas(68, 68);
    const g = c.getContext("2d")!;
    g.drawImage(glowDot(col), 0, 0, 68, 68);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(34, 34, 5, 0, TAU);
    g.fill();
    return c;
  });
}
/** The ninja's silhouette filled with a colour (afterimages) or glowing (the rim light on a streak). */
type TintKind = "t1" | "t2" | "t3" | "g2" | "g3";
const TINTS: Record<TintKind, { fill: string[]; shadow?: string }> = {
  t1: { fill: ["#fff6c8", "#ffd86a"], shadow: "rgba(255,176,40,1)" },
  t2: { fill: ["#ffb3d4", "#ff7aa2", "#7fd0ff", "#b48cff"], shadow: "rgba(255,100,180,1)" },
  t3: { fill: RAINBOW, shadow: "rgba(255,245,150,1)" },
  g2: { fill: ["#ffe0f0", "#ff7aa2", "#5ec8f2"] },
  g3: { fill: RAINBOW },
};
const GLOW_PAD = 26;
function tinted(im: HTMLImageElement, w: number, h: number, kind: TintKind): HTMLCanvasElement | null {
  if (!im.complete || !im.naturalWidth) return null;
  return cached(`${im.src}|${Math.round(w)}|${kind}`, () => {
    const s = mkCanvas(w, h);
    const sg = s.getContext("2d")!;
    sg.drawImage(im, 0, 0, s.width, s.height);
    sg.globalCompositeOperation = "source-in";
    const t = TINTS[kind];
    const gr = sg.createLinearGradient(0, 0, 0, s.height);
    t.fill.forEach((c, i) => gr.addColorStop(i / Math.max(1, t.fill.length - 1), c));
    sg.fillStyle = gr;
    sg.fillRect(0, 0, s.width, s.height);
    if (!t.shadow) return s;
    const c = mkCanvas(s.width + GLOW_PAD * 2, s.height + GLOW_PAD * 2);
    const g = c.getContext("2d")!;
    g.shadowColor = t.shadow;
    g.shadowBlur = 16;
    g.drawImage(s, GLOW_PAD, GLOW_PAD);
    g.drawImage(s, GLOW_PAD, GLOW_PAD);
    return c;
  });
}

/** A pose drawn at its size on the stage, resampled once with care (the art is 600-1000 px wide; a 3× smaller draw every
 *  frame was both a raster cost and a little jagged). */
function heroSprite(im: HTMLImageElement, w: number, h: number): HTMLCanvasElement | null {
  if (!im.complete || !im.naturalWidth) return null;
  return cached(`hero|${im.src}|${Math.round(w)}`, () => {
    const c = mkCanvas(w, h);
    const g = c.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    g.drawImage(im, 0, 0, c.width, c.height);
    return c;
  });
}
/** The rim of light round the ninja on a streak: its glowing silhouette drawn RIM_K× larger, at RIM_ALPHA. */
const RIM_K = 1.05, RIM_ALPHA = 0.9;
/** The ninja on a streak: the rim of light and the ninja over it, baked into one sprite, centred like the silhouette. */
function litHero(im: HTMLImageElement, w: number, h: number, kind: TintKind): HTMLCanvasElement | null {
  const rim = tinted(im, w, h, kind), body = heroSprite(im, w, h);
  if (!rim || !body) return null;
  return cached(`lit|${im.src}|${Math.round(w)}|${kind}`, () => {
    const c = mkCanvas(rim.width * RIM_K, rim.height * RIM_K);
    const g = c.getContext("2d")!;
    g.globalAlpha = RIM_ALPHA;
    g.drawImage(rim, 0, 0, c.width, c.height);
    g.globalAlpha = 1;
    g.drawImage(body, c.width / 2 - w / 2, c.height / 2 - h / 2, w, h);
    return c;
  });
}

// flames over the head: the same drawing as <NinjaSpot/>'s
let FLAME: Path2D[] | null = null;
const flamePaths = () =>
  (FLAME ??= [
    new Path2D("M20 2 C25 12 36 18 36 32 C36 44 29 52 20 52 C11 52 4 44 4 33 C4 25 9 20 12 14 C13 21 16 24 19 25 C17 17 17 9 20 2 Z"),
    new Path2D("M20 12 C24 20 31 26 31 36 C31 44 26 49 20 49 C14 49 9 44 9 37 C9 31 13 27 15 22 C16 27 18 29 20 29 C19 23 18 17 20 12 Z"),
    new Path2D("M20 26 C23 31 26 35 26 40 C26 44 23 47 20 47 C17 47 14 44 14 40 C14 35 18 31 20 26 Z"),
  ]);
/** One streak flame (40×54 units, 2× oversampled), its glow baked in: a live shadowBlur per flame is slow on phones. */
const FLAME_K = 2, FLAME_PAD = 12;
function flameSprite(cols: string[], glow: string) {
  return cached(`flame${cols.join()}|${glow}`, () => {
    const c = mkCanvas((40 + FLAME_PAD * 2) * FLAME_K, (54 + FLAME_PAD * 2) * FLAME_K);
    const g = c.getContext("2d")!;
    const P = flamePaths();
    g.scale(FLAME_K, FLAME_K);
    g.translate(FLAME_PAD, FLAME_PAD);
    g.lineJoin = "round";
    if (glow) {
      g.shadowColor = glow;
      g.shadowBlur = 10 * FLAME_K;
    }
    g.fillStyle = cols[0];
    g.fill(P[0]);
    g.shadowBlur = 0;
    g.strokeStyle = INK;
    g.lineWidth = 3.5;
    g.stroke(P[0]);
    g.fillStyle = cols[1];
    g.fill(P[1]);
    g.fillStyle = cols[2];
    g.fill(P[2]);
    return c;
  });
}
/** The power circle on the ground (an ellipse 224×48, glow baked in). */
function circleSprite(tier: Tier) {
  return cached(`circle${tier}`, () => {
    const c = mkCanvas(300, 110);
    const g = c.getContext("2d")!;
    g.translate(150, 55);
    g.lineWidth = 5;
    g.shadowBlur = 20;
    if (tier === 3) {
      const gr = g.createLinearGradient(-110, 0, 110, 0);
      RAINBOW.forEach((col, i) => gr.addColorStop(i / (RAINBOW.length - 1), col));
      g.strokeStyle = gr;
      g.shadowColor = "rgba(255,233,74,0.9)";
    } else {
      g.strokeStyle = tier === 2 ? "#ff9ac6" : `rgba(${GLOW_RGB[tier]},0.95)`;
      g.shadowColor = `rgba(${GLOW_RGB[tier]},0.8)`;
    }
    g.beginPath();
    g.ellipse(0, 0, 112, 24, 0, 0, TAU);
    g.stroke();
    g.shadowBlur = 0;
    g.fillStyle = `rgba(${GLOW_RGB[tier]},0.18)`;
    g.fill();
    return c;
  });
}
let SLASH: Path2D | null = null;
const slashPath = () => (SLASH ??= new Path2D("M14 4 C62 18 62 82 14 96 C40 74 40 26 14 4 Z"));
/** The slash of a flying kick, with its glow, baked per tier (a live shadowBlur each frame was a raster cost). */
const SLASH_PAD = 14, SLASH_K = 2;
function slashSprite(tier: Tier) {
  return cached(`slash${tier}`, () => {
    const c = mkCanvas((62 + SLASH_PAD * 2) * SLASH_K, (100 + SLASH_PAD * 2) * SLASH_K);
    const g = c.getContext("2d")!;
    g.scale(SLASH_K, SLASH_K);
    g.translate(SLASH_PAD, SLASH_PAD);
    let fill: CanvasGradient;
    if (tier >= 3) {
      fill = g.createLinearGradient(0, 0, 0, 100);
      RAINBOW.forEach((col, k) => fill.addColorStop(k / 5, col));
    } else {
      fill = g.createLinearGradient(0, 0, 62, 0);
      fill.addColorStop(0, "#fff");
      fill.addColorStop(0.5, tier === 2 ? "#ffd1e3" : "#fff4dc");
      fill.addColorStop(1, tier === 2 ? "#ff7aa2" : "#ffc53d");
    }
    g.shadowColor = "rgba(255,240,190,.9)";
    g.shadowBlur = 8 * SLASH_K; // (the live 12 px glow, drawn at about 1.5×)
    g.fillStyle = fill;
    g.fill(slashPath());
    g.shadowBlur = 0;
    g.strokeStyle = INK;
    g.lineWidth = 4.5;
    g.lineJoin = "round";
    g.stroke(slashPath());
    return c;
  });
}
/** The spell's sphere at radius ORB_R, its glow baked: drawn scaled to the radius it has now. */
const ORB_R = 66, ORB_PAD = 36;
function orbSprite(tier: Tier) {
  return cached(`orbsphere${tier}`, () => {
    const R = ORB_R, P = ORB_PAD;
    const c = mkCanvas((R + P) * 2, (R + P) * 2);
    const g = c.getContext("2d")!;
    g.translate(R + P, R + P);
    const [c0, c1, c2] = ORB[tier];
    const gr = g.createRadialGradient(-R * 0.3, -R * 0.34, 0, 0, 0, R);
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(0.18, c0);
    gr.addColorStop(0.55, c1);
    gr.addColorStop(1, c2);
    g.shadowColor = c1;
    g.shadowBlur = 30;
    g.fillStyle = gr;
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.fill();
    g.shadowBlur = 0;
    g.strokeStyle = INK;
    g.lineWidth = 4;
    g.stroke();
    return c;
  });
}
// the pointing hand of <TapHint/> (src/ui/ui.tsx), fingertip at (31, 7) in a 64-unit box
let HAND: Path2D | null = null;
const handPath = () =>
  (HAND ??= new Path2D("M26 30V12a5 5 0 0 1 10 0v16l3-1a5 5 0 0 1 6 3l1 1a5 5 0 0 1 6 4v8c0 9-6 16-15 16h-3c-6 0-10-3-13-8l-7-11a4 4 0 0 1 6-5l6 6z"));

/**
 * The run's background loops, but the paintings are composed as single scenes, not tiles. A mirrored copy made a
 * symmetric "Rorschach" picture at every join, so instead the painting's right end is stitched onto its own left end
 * along the seam where the two differ least (image quilting: a minimum-cost path through the overlap, found on a
 * quarter-size copy), feathered a little. One tile is the painting minus the overlap.
 */
function loopTile(src: HTMLCanvasElement): HTMLCanvasElement {
  const w = src.width, h = src.height;
  const F = Math.round(w * 0.23); // overlap
  const T = w - F;
  const q = 4;
  const sw = Math.ceil(F / q), sh = Math.ceil(h / q);
  const small = mkCanvas(sw * 2, sh);
  const sg = small.getContext("2d", { willReadFrequently: true })!;
  sg.drawImage(src, T, 0, F, h, 0, 0, sw, sh); // the end of the painting...
  sg.drawImage(src, 0, 0, F, h, sw, 0, sw, sh); // ...and its start, which the tile continues into
  const px = sg.getImageData(0, 0, sw * 2, sh).data;
  const cost = new Float32Array(sw * sh);
  const edge = 5;
  for (let y = 0; y < sh; y++)
    for (let x = 0; x < sw; x++) {
      const a = (y * sw * 2 + x) * 4, b = a + sw * 4;
      const d = (px[a] - px[b]) ** 2 + (px[a + 1] - px[b + 1]) ** 2 + (px[a + 2] - px[b + 2]) ** 2;
      cost[y * sw + x] = x < edge || x >= sw - edge ? 1e12 : d;
    }
  for (let y = 1; y < sh; y++)
    for (let x = 0; x < sw; x++) {
      const p = (y - 1) * sw;
      cost[y * sw + x] += Math.min(cost[p + x], x > 0 ? cost[p + x - 1] : Infinity, x < sw - 1 ? cost[p + x + 1] : Infinity);
    }
  const seam = new Int32Array(sh);
  let best = 0;
  for (let x = 1; x < sw; x++) if (cost[(sh - 1) * sw + x] < cost[(sh - 1) * sw + best]) best = x;
  seam[sh - 1] = best;
  for (let y = sh - 2; y >= 0; y--) {
    const x = seam[y + 1];
    let m = x;
    for (const c of [x - 1, x + 1]) if (c >= 0 && c < sw && cost[y * sw + c] < cost[y * sw + m]) m = c;
    seam[y] = m;
  }
  // the tile: the painting's start, with its end laid over the overlap up to the seam
  const tile = mkCanvas(T, h);
  const tg = tile.getContext("2d")!;
  tg.drawImage(src, 0, 0);
  const over = mkCanvas(F, h);
  const og = over.getContext("2d", { willReadFrequently: true })!;
  og.drawImage(src, T, 0, F, h, 0, 0, F, h);
  const id = og.getImageData(0, 0, F, h);
  const fw = 16; // feather, full-size px
  for (let y = 0; y < h; y++) {
    const fy = y / q;
    const y0 = Math.min(sh - 1, Math.floor(fy)), y1 = Math.min(sh - 1, y0 + 1);
    const sx = (seam[y0] + (seam[y1] - seam[y0]) * (fy - y0) + 0.5) * q;
    for (let x = 0; x < F; x++) {
      let a = clamp01((x - sx + fw) / (2 * fw));
      a = a * a * (3 - 2 * a);
      id.data[(y * F + x) * 4 + 3] = Math.round(255 * (1 - a));
    }
  }
  og.putImageData(id, 0, 0);
  tg.drawImage(over, 0, 0);
  return tile;
}

function starPts(n: number, r1: number, r2: number, jitter = 0.12) {
  const pts: number[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * TAU - Math.PI / 2;
    const r = (i % 2 ? r2 : r1) * (1 + (Math.random() - 0.5) * jitter * 2);
    pts.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  return pts;
}

// canvas effects, in stage coordinates
type CFx =
  | { k: "pow"; x: number; y: number; t0: number; size: number; tier: Tier; rot: number; outer: number[]; inner: number[] }
  | { k: "slash"; x0: number; y0: number; x1: number; y1: number; t0: number; size: number; tier: Tier }
  | { k: "ribbon"; t0: number; dur: number; r: number; from: number; sweep: number; squash: number; tier: Tier; oy: number }
  | { k: "piece"; x: number; y: number; t0: number; im: HTMLImageElement; w: number; vx: number; vy: number; vr: number; half: -1 | 0 | 1; life: number; g?: number }
  | { k: "orb"; x: number; y: number; t0: number; tier: Tier };

function similar(target: Word, pool: Word[], n: number): Word[] {
  const score = (w: Word) => {
    if (w.text === target.text) return -1;
    let s = 0;
    if (w.segs.length === target.segs.length) s += 3;
    for (let i = 0; i < Math.min(w.segs.length, target.segs.length); i++) if (w.segs[i].p === target.segs[i].p) s += 2;
    return s + Math.random();
  };
  return pool.filter((w) => w.text !== target.text).sort((a, b) => score(b) - score(a)).slice(0, n);
}

export function Run({ level, onDone }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render)
  const world = worldOf(level);
  const EVENTS = eventsFor(level.world);
  const hero = useHero();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const farRef = useRef<HTMLCanvasElement>(null); // the painted background, sliding behind the canvas
  const landRef = useRef<HTMLCanvasElement>(null); // the ground, sliding behind the canvas
  const underRef = useRef<HTMLCanvasElement>(null); // the lower canvas: what stands under the ninja's aura
  const raysRef = useRef<HTMLCanvasElement>(null); // the aura's light rays
  const auraRef = useRef<HTMLCanvasElement>(null); // the aura
  const haloRef = useRef<HTMLDivElement>(null); // the caught word's warm glow
  const anchorRef = useRef<HTMLDivElement>(null); // a reminder's petal pops above this (see anchorAt)
  const flashRef = useRef<HTMLDivElement>(null); // an impact's flash (see flash)
  const [progress, setProgress] = useState(0);
  // the banner under the progress bar: the neutral dots of a group's sounds (blend: the sounds are the question, Dec1),
  // or the word to read (its spellings, one lit while it is modelled after a second miss); `dot`: the lit one
  const [banner, setBanner] = useState<{ text: string; mode: "read" | "blend"; segs: Seg[] } | null>(null);
  const [dot, setDot] = useState(-1);
  const [stars, setStars] = useState(0); // stars caught on the track (Dec6: a teardrop always means a sound)
  const [jumpAsk, setJumpAsk] = useState(false); // the practice jump is asked (Hear it again says it again)
  const api = useRef<{ jump: () => void; tapAt: (x: number, y: number) => void; repeat: () => unknown }>({ jump: () => {}, tapAt: () => {}, repeat: () => {} });

  useEffect(() => {
    playMusic("run");
    streak.reset();
    probePoses();
    const pool = levelWords(level);
    const targets = chooseWords(level, EVENTS, "read");
    preload(targets.map((w) => urls.word(w.text)));
    // Two canvases (docs/PERF.md fix 8): what stands under the ninja's aura (crates, spikes, stars, the lanterns it
    // has done with, the gong, the power circle and speed lines) on `under`, and the rest on `c`, the top one, which
    // takes the taps. The aura and the light rays between them are DOM layers the compositor turns and scales (placeAura).
    // `g` is whichever canvas is being drawn: every drawing helper below draws on it.
    const c = canvasRef.current!;
    const under = underRef.current!;
    const gTop = c.getContext("2d")!, gUnder = under.getContext("2d")!;
    let g = gTop;
    const im = (id: string) => {
      const i = new Image();
      i.src = img(id);
      return i;
    };
    const I = {
      bg: im(`run_${world.key}`),
      crate: im("item_crate"), spikes: im("item_spikes"), star: im("item_star"), lantern: im("item_lantern"), gong: im("item_gong"),
      pics: Object.fromEntries(pool.filter((w) => w.pic).map((w) => [w.text, im(`pic_${w.text}`)])) as Record<string, HTMLImageElement>,
    };
    // hero poses (the move poses switch in by themselves once poses.ts has probed them)
    const heroImgs = new Map<string, HTMLImageElement>();
    const poseImg = (p: Pose): HTMLImageElement => {
      const src = poseSrc(hero, p);
      let i = heroImgs.get(src);
      if (!i) {
        i = new Image();
        i.src = src;
        heroImgs.set(src, i);
      }
      return i;
    };
    const POSES: Pose[] = ["run", "jump", "hurt", "cheer", "kick", "punch", "spin", "flip", "power", "think", "ready", "cast", "bow"];
    POSES.forEach(poseImg);
    const ok = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;

    // ---- state
    let alive = true;
    let t = 0; // game time (stops while the phone is upright, and for a hit-stop)
    let dist = 0;
    // The world waits on the start line for ▶, the starting gun (TEACHER_SCRIPT §2.3, §3.21): until then the ninja jogs
    // on the spot while Sensei frames the game, then stands ready facing ▶, and bows on the answer.
    let started = false;
    let speed = 0;
    let targetSpeed = 0;
    const hs = { x: HX, y: GROUND, vy: 0, jumps: 0, bumpT: 0, homing: null as Lantern | null };
    // a flight: at a tapped lantern (an arc that rises, then comes down onto it), or back home after a miss
    let fly: { x0: number; y0: number; t0: number; dur: number; rise: number } | null = null;
    let back: { x0: number; y0: number; t0: number; dur: number; x1: number } | null = null;
    let restX: number | null = null; // where the ninja stands to think after a miss (a gap between the lanterns)
    let touched = false; // the child has tapped a lantern during this word (the tap hint goes away)
    let hintFrom = -1; // when the tap hint may show
    let things: Thing[] = [];
    let lanterns: Lantern[] = [];
    let eventIdx = 0;
    let firstTry = 0;
    let eventMisses = 0;
    let cueDone = true; // Sensei has finished the prompt (the sounds, the word to read, a correction)
    let heard = true; // this word's sounds have been said: until then a lantern can't be caught (no guessing)
    let cueN = 0;
    let allInAt = -1; // when every lantern of this word came into view
    let catching = false; // streak.hit() from a caught lantern: its tier-up waits for the streak line (see catchLantern)
    let helped = false; // the biggest help clue flew the ninja to the right lantern: no streak point for that one
    let busy = false; // an event (a group of lanterns) is running
    let introBusy = true; // the opening: Sensei frames the game and holds on ▶ (a tap is a jump, never an answer)
    let readingBack = false; // a caught word is being read back, and what follows it (the scene takes no answer)
    let stance: "jog" | "ready" = "jog"; // before the gun: jogging on the spot, then the ready stance facing ▶
    let jumpWait: (() => void) | null = null; // the practice jump waits for a tap anywhere (once its line has begun)
    let jumpAsked = false, jumpLineDone = false; // "Tap anywhere to make your ninja jump…" has begun / ended
    let tapHand = -1; // the pointing hand taps the play area from this time ("Tap anywhere to make your ninja jump.")
    /** Two example lanterns floating past as Sensei says "When the lanterns come…" (screen x, not the world's). */
    type Demo = { x0: number; x1: number; y: number; t0: number; phase: number; word: string | null; leave?: number };
    let demos: Demo[] = [];
    let glowFrom = -1; // the right lantern glows from this time: the first group of a first run (a "we do"), Help's 2nd
    let blendN = 0; // blend groups asked so far in this run: the cue and "Tap the lantern with my word." for the first 3
    let loops = 0; // how many times this group's lanterns have come back round, missed (the quiet child's ladder)
    const turns: boolean[] = []; // per group: the second miss or Help's biggest clue was reached (struggledIn)
    let holding = false; // a held explanation (the first gem to fill) waits on Next: the world stops (docs/NAVIGATION.md)
    let nextEventAt = 900; // distance
    let gongX: number | null = null;
    let finished = false;
    let mode: "blend" | "read" = "blend";
    let current: Word | null = null;
    let collected = 0;
    // the ninja's show
    let mv: { kind: Move; t0: number; tier: Tier } | null = null;
    const recent: Move[] = [];
    let freeze = 0; // hit-stop
    let autoAir = false; // in the air from an automatic flip over spikes: it never catches a lantern by itself
    let thinkUntil = -1;
    let flameA = 1; // the streak flames fade back while a lantern the child still has to read passes behind them
    let aura = 0; // 0..1, fades in on a streak and out on a miss
    // The tier the ninja shows. A tier-up shows with its power-up, which comes with Sensei's "Ninja power!" once the
    // word has been blended, so the glow, the flame colours and the line arrive together.
    let glow: Tier = 0;
    let visTier: Tier = 1; // the tier the aura shows (kept while it fades out after a miss)
    let bloomAt = -9; // power-up: the aura blooms
    let slamAt = -9; // ground-pound: the power circle flares
    let flameBirth: number[] = [];
    let puff: { n: number; t0: number } | null = null;
    let pendingPower: { at: number; tier: Tier } | null = null;
    const cfx: CFx[] = [];
    const timers: { at: number; fn: () => void }[] = [];
    const after = (s: number, fn: () => void) => void timers.push({ at: t + s, fn });
    const ribbon: { x: number; y: number; t: number }[] = [];
    const ghosts: { x: number; feet: number; pose: Pose; rot: number; sx: number; sy: number; t: number }[] = [];
    const speedLines: { x: number; y: number; len: number; t0: number }[] = [];
    let lastGhost = -1, lastLine = -1;
    /** The caught word, risen under the progress bar. `low`: when it dropped a little so a reminder's petal has room to
     *  pop above its lit spelling (and `rise`, when it went back up). */
    type Trophy = { w: Word; mode: "blend" | "read"; x0: number; y0: number; t0: number; lit: number; all: boolean; leave?: number; low?: number; rise?: number };
    let trophy: Trophy | null = null;
    let ending: { phase: "fly" | "rebound" | "cheer" | "done"; t0: number; x0: number } | null = null;
    let gongHitAt = -9;
    let endSpoken = false;
    let doneCalled = false;
    const SPARKS = Array.from({ length: 14 }, () => ({ l: Math.random() * 1.1 - 0.55, d: Math.random() * 2.4, s: 0.6 + Math.random() * 0.7 }));

    /** The scene takes no answer now: Sensei frames the game or holds on ▶ (the practice jump excepted), asks a group's
     *  question before its sounds are heard, or reads a caught word back (docs/NAVIGATION.md, the bots' `busy`). */
    const busyNow = () => (introBusy && !jumpWait) || readingBack || holding || finished || (!!current && mode === "blend" && !heard);
    const publish = () =>
      ((window as any).__snState = {
        scene: "run", game: "run", event: eventIdx, of: EVENTS, mode, streak: streak.n, tier: streak.tier, glow, gong: gongX !== null, finished,
        // `next`: the practice jump, or the word whose lantern can be caught now: a word to read once its line has been
        // said, a blend as soon as its sounds have been heard (the question is "Listen for the word… /s/ /a/ /t/"; the
        // lantern takes the tap during "Tap the lantern with my word.", tapAt)
        started, busy: busyNow(), ...(jumpWait ? { next: "jump" } : current && (mode === "blend" ? heard : cueDone) ? { next: current.text } : {}),
      });
    publish();
    const hasLine = (id: string) => LINES.some((l) => l.id === id);
    /** Sensei's prompt for the lanterns: the ninja holds still while it plays (see the speeds in update). Resolves true
     *  if every part was said. */
    const cue = async (parts: (Say | Say[])[], opts: { reveal?: boolean } = {}): Promise<boolean> => {
      const k = ++cueN;
      cueDone = false;
      try {
        // stop if something else took over (a right answer's blend must never be cut off by the rest of the prompt)
        for (const p of parts) if (!(await say(p, opts))) return false;
        return true;
      } finally {
        if (k === cueN) {
          cueDone = heard = true;
          publish();
        }
      }
    };
    /** A group's sounds, the question (oral blending, Dec1): no petals, the banner's neutral dots light one per sound
     *  ("hidden"), and the tortoise steps on each (the slow way, TEACHER_SCRIPT §9.6). A lantern can be caught once
     *  they have all been heard, while Sensei finishes ("Tap the lantern with my word."). */
    const question = (w: Word): Say => ({
      sounds: w.segs,
      gap: 330,
      show: "hidden",
      onSeg: (i) => {
        if (i === 0) navSpeed("slow");
        if (i >= 0) return void setDot(i);
        setDot(w.segs.length); // (every dot softly lit)
        navSpeed(null);
        if (current === w && !heard) {
          heard = true;
          publish();
        }
      },
    });
    // the cue before a group's sounds (TEACHER_SCRIPT §3.21 "Listen for the word…", else the rotated C16 cues)
    let lastCue: string | null = null;
    const heardAt = new Map<string, number[]>(); // when each cue line, "Tap the lantern…" and "When the lanterns come…" began (game time)
    // this word's question as it was asked, for Hear it again (and whether it swept the arrow under the word)
    let prompted: { parts: (Say | Say[])[]; sweep: boolean } | null = null;
    const adjUnit = adjacentUnit(level.units);
    const offStreak = streak.on((e) => {
      publish();
      if (e.type === "reset") {
        flameBirth = [];
        puff = null;
        glow = e.tier;
        return;
      }
      if (e.type === "hit") {
        for (let i = e.prevN; i < Math.min(10, e.n); i++) flameBirth[i] = t;
        // a caught lantern powers up with its streak line (catchLantern); anything else (dev) straight away
        if (e.tierUp && !catching) pendingPower = { at: t + 0.45, tier: e.tier };
        else if (!e.tierUp) glow = e.tier;
      } else if (e.type === "miss") {
        glow = 0;
        pendingPower = null;
        if (e.prevN > 0) {
          puff = { n: Math.min(10, e.prevN), t0: t };
          flameBirth = [];
        }
        // "Keep going, ninja." opens Sensei's correction (catchLantern), so the sounds are the last thing the child hears
        if (e.prevN >= 3) sfx.fizzle();
      }
    });
    glow = streak.tier; // a streak carried over from the last level (streak.reset() above ran before this listener)

    // obstacles & stars ahead
    const spawnStuff = (fromX: number, toX: number) => {
      for (let x = fromX; x < toX; x += 420 + Math.random() * 380) {
        const r = Math.random();
        if (r < 0.35) things.push({ x, kind: Math.random() < 0.6 ? "crate" : "spikes", y: GROUND });
        else for (let k = 0; k < 4; k++) things.push({ x: x + k * 70, kind: "star", y: GROUND - 120 - Math.sin((k / 3) * Math.PI) * 120 });
      }
    };
    spawnStuff(900, 1800);

    /** After the last word the gong is already peeking in at the right edge: no long run with nothing to do. */
    const placeGong = () => {
      if (gongX !== null) return;
      gongX = dist + W - 100;
      // a clear run-in to the gong (the flying kick needs the stage)
      things = things.filter((th) => th.x < dist + W - 320 || th.x > gongX! + 800);
      publish();
    };

    // ---------------------------------------------------------------- the opening (TEACHER_SCRIPT §3.21, §4.1)
    const form = gameForm("run", { opening: true });
    const ready = readyAsk("run", form);
    // the opening's lines, decoded before they are needed: no gap opens between one line and the next, or between the
    // Ready hold and its question
    const opening = form === "full" ? ["tv_run_frame", "tv_run_jump", "tv_run_jump_ok", "tv_run_lanterns_how", "tv_run_lanterns"] : form === "recap" ? ["tv_run_jump", "tv_run_jump_ok"] : [];
    void preload([...opening, ready?.line ?? "nav_ready", "tv_guess_q", "tv_run_which", "tv_fs_run"].filter(hasLine).map(urls.line));
    /** The practice jump (full and recap forms): "Tap anywhere to make your ninja jump. Can you try it now?" while the
     *  pointing hand taps the play area (Hear it again says it again). Resolves true once the child has jumped (a jump
     *  during the line ends it: the child has answered). After 8 s of quiet Sensei asks once more, and 8 s after that
     *  the run goes on without it (false): the jump is practice, never a gate. */
    const practiceJump = async (): Promise<boolean> => {
      if (!hasLine("tv_run_jump")) return false;
      let jumped = false, talking = true;
      jumpAsked = jumpLineDone = false;
      const done = new Promise<void>((r) => (jumpWait = () => ((jumped = true), r())));
      tapHand = t;
      setJumpAsk(true);
      publish();
      const ask = () => ((talking = true), say({ line: "tv_run_jump" }).finally(() => ((talking = false), (jumpLineDone = jumpAsked = true))));
      await Promise.race([done, ask()]);
      for (let k = 0; k < 2 && !jumped && alive; k++) {
        await Promise.race([done, sleep(8000)]);
        if (k === 0 && !jumped && alive) await Promise.race([done, ask()]);
      }
      if (jumped && talking) hush();
      jumpWait = null;
      tapHand = -1;
      setJumpAsk(false);
      publish();
      return jumped;
    };
    /** "When the lanterns come…": two example lanterns float in from the right, lit, and bob; they drift up and away as
     *  the world starts. Their plates carry two of the level's words that this run doesn't ask. */
    const floatDemos = () => {
      const spare = [...shuffle(pool.filter((x) => !targets.includes(x))), ...shuffle(targets.slice(2))].map((x) => x.text);
      demos = [0, 1].map((i) => ({ x0: W + 140 + i * 330, x1: 700 + i * 300, y: LANTERN_Y + (i % 2) * 24, t0: t + i * 0.25, phase: Math.random() * 6, word: spare[i] ?? null }));
    };
    const intro = async () => {
      if (form === "full") {
        await say({ line: "tv_run_frame" });
        if (!alive) return;
        await sleep(250);
        const jumped = await practiceJump();
        if (!alive) return;
        if (jumped && hasLine("tv_run_jump_ok")) await say({ line: "tv_run_jump_ok" });
        if (!alive) return;
        if (hasLine("tv_run_lanterns_how")) {
          floatDemos();
          await sleep(200);
          await say({ line: "tv_run_lanterns_how" });
          if (!alive) return;
        }
      }
      // Ready (the starting gun, on every run): the ninja stands ready facing ▶
      stance = "ready";
      const askLine = ready && hasLine(ready.line) ? ready.line : "nav_ready";
      const again: Say[] =
        form === "full" ? [{ line: "tv_run_frame" }, { gap: 300 }, ...(hasLine("tv_run_lanterns_how") ? [{ line: "tv_run_lanterns_how" }, { gap: 300 }] : []), { line: askLine }] : [{ line: askLine }];
      // (the world is stopped while the hold waits on ▶: once the ninja has settled the frame loop sleeps, one frame
      // drawn, no rAF, and wakes on a tap, a resize or the go; verify 28 Sep: 60 rAF/s and 35-37 % of the main thread
      // at phone ×4, where every other game's Ready hold costs under 1 %)
      nap(true);
      const how = await holdReady("run", { ask: [{ line: askLine }], again: () => say(again), pose: false });
      nap(false);
      if (!alive || how === false) return;
      framed("run", ready);
      // the bow (a ninja's rei), and off we go as it springs up
      startMove("bow");
      for (const d of demos) d.leave = t;
      await sleep(420);
      if (!alive) return;
      started = true;
      sfx.whoosh();
      fx.burst(hs.x - 50, GROUND, "dust", 10);
      publish();
      if (form === "recap") {
        // a later day: the practice jump comes after the gun, on the move (TEACHER_SCRIPT §4.1)
        await sleep(700);
        if (!alive) return;
        const jumped = await practiceJump();
        if (!alive) return;
        if (jumped && hasLine("tv_run_jump_ok")) await say({ line: "tv_run_jump_ok" });
        nextEventAt = Math.max(nextEventAt, dist + 450);
      }
      introBusy = false;
      publish();
    };

    // ---------------------------------------------------------------- a group of lanterns
    const startEvent = async () => {
      if (eventIdx >= EVENTS) return placeGong();
      busy = true;
      helped = false;
      touched = false;
      hintFrom = -1;
      glowFrom = -1;
      loops = 0;
      const w = targets[eventIdx];
      current = w;
      mode = eventIdx % 2 === 0 || !w.pic ? "blend" : "read";
      if (mode === "read") {
        const withPics = pool.filter((x) => x.pic);
        if (withPics.length < 3) mode = "blend";
      }
      const n = level.world === 1 ? 1 : 2; // beginners: two lanterns, not three moving choices
      const others = mode === "blend" ? similar(w, pool, n) : similar(w, pool.filter((x) => x.pic && x.text !== w.text), n);
      const opts = shuffle([w, ...others]);
      eventMisses = 0;
      heard = false;
      publish();
      // The group spawns off screen so that it always runs in the same distance (APPROACH) before it has arrived.
      const sp = opts.length >= 3 ? SPACING[3] : SPACING[2];
      const zoneStart = dist + LAST_IN + APPROACH - (opts.length - 1) * sp;
      // Clear the lantern zone, and any crate or spikes that would still be in front of the ninja once the lanterns have
      // arrived (they'd sit there while it stops to listen). Those are behind Sensei's corner or off screen by now.
      things = things.filter((th) =>
        th.kind === "star" ? th.x < zoneStart - 200 || th.x > zoneStart + 1400 : th.x < dist + HX - 90 + APPROACH || th.x > zoneStart + 1400,
      );
      lanterns = opts.map((o, i) => ({ x: zoneStart + i * sp, y: LANTERN_Y + (mode === "read" ? 14 : 0) + (i % 2) * 24, word: o, correct: o === w, popped: false, phase: Math.random() * 6 }));
      allInAt = -1;
      setDot(-1);
      setBanner({ text: w.text, mode, segs: w.segs });
      if (mode === "blend") {
        const first = eventIdx === 0;
        const bi = blendN++;
        const lead: Say[] = [];
        // the first group of a first run (the full form): its question straight away, since the opening's "When the
        // lanterns come, I'll say some sounds, and you catch the word." has just said it (HOW_WINDOW); "Here come the
        // lanterns. I'll say the sounds of a word." only if that was long ago. Later runs: once a session, fast and
        // slow's "I'll say it the slow way. You catch the whole word." (TEACHER_SCRIPT §9.3)
        let fsRun = false;
        if (first && form === "full") {
          const how = heardAt.get("tv_run_lanterns_how")?.at(-1);
          if (hasLine("tv_run_lanterns") && (how === undefined || t - how >= HOW_WINDOW)) lead.push({ line: "tv_run_lanterns" }, { gap: 300 });
        } else if (first && hasLine("tv_fs_run") && !fsHeardThisSession("tv_fs_run")) {
          lead.push({ line: "tv_fs_run" }, { gap: 300 });
          fsRun = true;
        }
        // units 8-10: "some sounds sit close together", spaced (NARRATIVE_AUDIT F12)
        const adj = !!adjUnit && adjacentSlots(w.segs).length > 1 && isDue("adjacent:remind", "concept");
        if (adj) lead.push({ line: "audit_neighbours_short" }, { gap: 300 });
        // groups 1–3: "Listen for the word…" · the sounds · "Tap the lantern with my word."; from the 4th, the sounds
        // (never a third time within CUE_WINDOW s, counted from when each was heard: then the sounds alone, as from
        // the 4th)
        const recent = (id: string) => (heardAt.get(id) ?? []).filter((at) => t - at < CUE_WINDOW).length;
        const cand = runBlendCue(bi, hasLine, lastCue);
        const line = cand && recent(cand) < 2 && recent("tv_run_which") < 2 ? cand : null;
        if (line) lastCue = line;
        const ask: Say[] = [...(line ? [{ line }, { gap: 250 }] : []), question(w)];
        const which: Say[] = line && bi < 3 && hasLine("tv_run_which") ? [{ gap: 300 }, { line: "tv_run_which" }] : [];
        // Hear it again: the question (never the lanterns' or fast and slow's lead-in, TEACHER_SCRIPT §9.7 rule 6)
        const re = line ?? (hasLine("tv_guess_q") ? "tv_guess_q" : null);
        prompted = { parts: [[...(re ? [{ line: re }, { gap: 250 }] : []), question(w), ...which]], sweep: false };
        const said = await cue([[...lead, ...ask, ...which]]);
        if (said && adj) told("adjacent:remind");
        if (said && fsRun) fsSaid("tv_fs_run", "run");
        // the first group of a first run is a "we do": its answer glows 2 s after the question
        if (said && first && form === "full" && current === w) glowFrom = t + 2;
      } else {
        // the first reading group of a save: "Now it's your turn to read. Read the word at the top, and catch its
        // picture." (TEACHER_SCRIPT §4.5); later ones "Read the word, and catch the matching picture."
        const firstRead = onceInSave("run:read") && hasLine("tv_run_read_first");
        const readLine = firstRead ? "tv_run_read_first" : "run_read";
        // the left-to-right line with the arrow under the word, once per land in lands 1–2 (narrate.tsx readThisWay)
        let ltr = false;
        if (level.world <= 2 && isDue(`left-right:w${level.world}`, "once")) {
          cueDone = false;
          await sleep(350); // (the banner has dropped in)
          if (current !== w) return;
          ltr = await readThisWay(document.querySelector(".run-banner"), level.world);
          if (current !== w) return;
        }
        prompted = { parts: [[{ line: readLine }]], sweep: ltr };
        const said = await cue(prompted.parts);
        if (said && firstRead) told("run:read");
      }
    };

    // ---------------------------------------------------------------- the ninja's moves
    const chooseMove = (tier: Tier): Move => {
      const forced = (window as any).__runMove as Move | undefined; // dev (filming)
      if (forced) return forced;
      const opts = POOLS[tier].filter((m) => !recent.includes(m));
      const m = opts[(Math.random() * opts.length) | 0] ?? POOLS[tier][0];
      recent.push(m);
      if (recent.length > 2) recent.shift();
      return m;
    };
    const feet = () => hs.y + 8;
    const startMove = (kind: Move, target?: Pt) => {
      const tier = glow;
      mv = { kind, t0: t, tier };
      const f = feet();
      if (kind === "kick") {
        sfx.kick();
        // the flying kick gets a second whoosh (the synthesised kiai buzzed too much like the "wrong" sound)
        if (tier >= 2) sfx.whoosh();
        if (target) cfx.push({ k: "slash", x0: hs.x + 20, y0: f - 170 * S, x1: target.x + 30, y1: target.y + 10, t0: t, size: 150 + tier * 26, tier });
      } else if (kind === "punch") {
        sfx.swish();
        if (tier >= 1) after(0.2, () => sfx.swish());
      } else if (kind === "spin") {
        sfx.spin();
        cfx.push({ k: "ribbon", t0: t, dur: 0.34, r: HW * 0.66, from: 160, sweep: 340, squash: 0.62, tier, oy: -10 });
        cfx.push({ k: "ribbon", t0: t + 0.05, dur: 0.34, r: HW * 0.56, from: 340, sweep: 320, squash: 0.66, tier, oy: 36 });
      } else if (kind === "flip" || kind === "backflip") {
        sfx.jump();
        sfx.spin();
        cfx.push({ k: "ribbon", t0: t, dur: 0.42, r: HW * 0.72, from: kind === "flip" ? 240 : 300, sweep: kind === "flip" ? 330 : -330, squash: 0.1, tier, oy: 0 });
      } else if (kind === "cast") {
        sfx.magic();
        fx.implode(hs.x + 70 * S, f - 130 * S, COLS[tier], 12 + tier * 4, 130, 14);
      } else if (kind === "stumble") {
        sfx.bounce();
        fx.puff(hs.x + 30, GROUND - 6, 8);
        fx.burst(hs.x + 40, GROUND - 20, "dust", 8);
      } else if (kind === "bow") {
        // "I'm ready" (TEACHER_SCRIPT §2.3): a rustle as it bows, a "hup" as it springs up, dust as it lands
        after(0.14, () => sfx.bow());
        after(0.46, () => sfx.hup());
        after(0.73, () => fx.burst(hs.x, GROUND, "dust", 5));
      }
    };
    /** A comic-book impact at p (the lantern the child got right, a crate, the gong). */
    const impact = (p: Pt, kind: "hit" | "magic" | "star" | "boom", tier: Tier, size = 190) => {
      const cols = COLS[tier];
      cfx.push({ k: "pow", x: p.x, y: p.y, t0: t, size: (kind === "boom" ? size * 1.25 : size) * (1 + tier * 0.14), tier, rot: (Math.random() * 60 - 30) * DEG, outer: starPts(11, 48, 26), inner: starPts(9, 26, 14, 0.2) });
      fx.ring(p.x, p.y, { color: cols[0], r1: 110 + tier * 32, width: 14 });
      if (tier >= 1 || kind === "boom") fx.ring(p.x, p.y, { color: cols[1 % cols.length], r1: 170 + tier * 36, width: 9, life: 30 });
      fx.lines(p.x, p.y, 8 + tier * 2, "#fff4dc", 60 + tier * 12);
      fx.twinkle(p.x, p.y, cols, 8 + tier * 4, 7 + tier * 1.5);
      if (kind === "magic" || tier >= 2) fx.glow(p.x, p.y, cols, 12 + tier * 4, 56, 5, 30);
      if (kind === "star" || tier >= 1) fx.burst(p.x, p.y, "stars", 5 + tier * 3, 0.9);
      if (kind === "hit") sfx.thwack();
      else if (kind === "magic") sfx.sparkle();
      else if (kind === "star") (sfx.twinkle(), sfx.thwack());
      else sfx.boom();
      if (tier >= 2 && (kind === "hit" || kind === "boom")) shakeStage();
      if (tier >= 2 || kind === "boom") flash(p.x, p.y, 0.16 + tier * 0.04);
    };
    /** The right lantern: the ninja strikes it and it bursts; the others float away. */
    const strikeLantern = (l: Lantern) => {
      const tier = glow;
      const bob = Math.sin(t * 2.5 + l.phase) * 10;
      const sx = l.x - dist;
      // the ninja is on the lantern by now: the hit lands just in front of its fist or foot, never over its face, and
      // always fully on screen (clear of the right edge and Sensei's corner)
      const p = { x: Math.min(W - 170, Math.max(sx, hs.x + 95 * S)), y: Math.min(l.y + 20 + bob, hs.y + 8 - 120 * S) };
      const kind = chooseMove(tier);
      startMove(kind, p);
      freeze = 0.07;
      hs.homing = null;
      hs.vy = Math.min(hs.vy, -480); // bounce up off it: air time for the move
      hs.jumps = 2;
      impact(p, kind === "cast" ? "magic" : kind === "flip" ? "star" : kind === "kick" && tier >= 2 ? "boom" : "hit", tier);
      if (kind === "punch" && tier >= 1)
        after(0.2, () => {
          sfx.thwack();
          fx.twinkle(p.x + 10, p.y - 10, COLS[tier], 6, 6);
          cfx.push({ k: "pow", x: p.x + 18, y: p.y - 14, t0: t, size: 130, tier, rot: 0.3, outer: starPts(11, 48, 26), inner: starPts(9, 26, 14, 0.2) });
        });
      if (kind === "cast") cfx.push({ k: "orb", x: p.x, y: p.y, t0: t, tier });
      after(0.12, () => sfx.great());
      // the lantern breaks in two and its halves tumble away sideways and down, clear of the word rising out of it
      l.burst = true;
      const ly = l.y - 14 + bob;
      cfx.push({ k: "piece", x: sx, y: ly, t0: t, im: I.lantern, w: 120, vx: -420 - Math.random() * 80, vy: -160, vr: -6, half: -1, life: 0.8, g: 1500 });
      cfx.push({ k: "piece", x: sx, y: ly, t0: t, im: I.lantern, w: 120, vx: 460 + Math.random() * 80, vy: -120, vr: 7, half: 1, life: 0.8, g: 1500 });
      fx.burst(sx, ly, "blossoms", 22);
      fx.glow(sx, ly, ["#ffe38a", "#ffc53d", "#fff4dc"], 14, 60, 4, 28);
      lanterns.forEach((o) => {
        if (o !== l && !o.popped) {
          o.popped = true;
          o.gone = t;
        }
      });
    };
    const startPower = (tier: Tier) => {
      startMove("power");
      glow = Math.max(glow, tier) as Tier;
      publish();
      if (hs.y >= GROUND - 2) hs.vy = -560;
      const c = () => ({ x: hs.x, y: feet() - 110 * S });
      const p0 = c();
      fx.implode(p0.x, p0.y, COLS[tier], 30, 240, 18);
      sfx.charge();
      after(0.18, () => {
        const p = c();
        sfx.powerup();
        bloomAt = t;
        flash(p.x, p.y, 0.32);
        fx.ring(p.x, p.y, { color: COLS[tier][0], r0: 40, r1: 340, width: 20, life: 30 });
        fx.ring(p.x, p.y, { color: COLS[tier][1], r0: 20, r1: 250, width: 13, life: 26 });
        fx.ring(p.x, p.y, { color: "#fff", r0: 10, r1: 170, width: 8, life: 20 });
        fx.twinkle(p.x, p.y, COLS[tier], 22, 13, 34);
        fx.lines(p.x, p.y, 14, "#fff4dc", 90);
        fx.glow(p.x, p.y, COLS[tier], 16, 70, 6, 30);
      });
    };
    const kickCrate = (th: Thing, sx: number) => {
      const tier = glow;
      th.got = th.kicked = true;
      startMove("crate");
      sfx.kick();
      const p = { x: sx - 20, y: GROUND - 50 };
      after(0.04, () => impact(p, "hit", tier, 150));
      cfx.push({ k: "piece", x: sx, y: GROUND - 44, t0: t, im: I.crate, w: 104, vx: 900 + speed, vy: -950, vr: 9, half: 0, life: 1.2 });
    };

    /** The reminder's petal stands above the caught word's lit spelling: the anchor (a DOM box, the word is drawn on the
     *  canvas) is moved over it as the petal's sound is cued (SOUND_DISPLAY r40, Dec4). */
    const anchorAt = (i: number): SoundAt => () => {
      const el = anchorRef.current;
      const r = trophy ? segRect(trophy, i) : null;
      if (!el || !r) return null;
      Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
      return el;
    };
    const catchLantern = async (l: Lantern) => {
      if (l.popped || !current || ending) return;
      l.popped = true;
      const w = current;
      if (l.correct) {
        if (eventMisses === 0) firstTry++;
        recordRead(w, eventMisses === 0);
        cueN++; // whatever Sensei was saying about this word is over
        cueDone = true;
        readingBack = true;
        const keptGoing = eventMisses > 0, wasHelped = helped;
        turns[eventIdx] ||= eventMisses >= 2 || helped;
        catching = true;
        const hit = eventMisses === 0 && !helped ? streak.hit() : null;
        catching = false;
        strikeLantern(l);
        const bob = Math.sin(t * 2.5 + l.phase) * 10;
        trophy = { w, mode, x0: Math.min(W - 170, l.x - dist), y0: l.y + 90 + bob, t0: t + 0.04, lit: -1, all: false };
        setBanner(null);
        current = null;
        glowFrom = -1;
        publish();
        // a beat for the impact while the word rises clear of it, then Sensei reads it back as each spelling lights up
        // (the spellings' voices, "tile"), the tortoise stepping on each sound and the rabbit hopping on the word
        await sleep(280);
        const light = (i: number) => {
          if (i === 0) navSpeed("slow");
          if (!trophy || trophy.w !== w) return;
          if (i < 0) (trophy.all = true), (trophy.lit = -1);
          else trophy.lit = i;
        };
        if (fsReadback("run") === "rabbit" && hasLine("tv_fs_say_slow") && hasLine("tv_fs_now_fast")) {
          // the session's first catch: slow, then fast (TEACHER_SCRIPT §9.3; no rabbit tap: a tap anywhere is a jump)
          const slow = await say([{ line: "tv_fs_say_slow" }, { gap: 200 }, { sounds: w.segs, gap: 300, show: "tile", onSeg: light }]);
          if (slow) navSpeed("fast"); // (the rabbit lights on "And now the fast way…", and hops on the word)
          const fast = slow && (await say([{ line: "tv_fs_now_fast" }, { gap: 150 }, { word: w.text }]));
          if (fast) fsSaid("tv_fs_say_slow", "run");
        } else await sayBlend(w.segs, w.text, light);
        // Crossing into a tier: the streak line ("Ninja power!") is this word's praise, and the ninja powers up as it's
        // said. (Dec2: a tier's line needs whole answers; before that the power-up is silent.) On the last word it is
        // silent too: the gong's "Bong! You made it to the gong!" follows within seconds, and is the praise.
        const closingNext = eventIdx === EVENTS - 1;
        const tierLine = hit?.tierUp && !closingNext ? tierLineId(hit.tier) : null;
        if (hit?.tierUp) pendingPower = { at: t, tier: hit.tier };
        const tierSaid = !!tierLine && hasLine(tierLine);
        if (tierSaid) tierLineSaid(tierLine, await say({ line: tierLine! }));
        // Then at most one of: a spaced reminder about one of its spellings, lit, its petal popping above it ("It's two
        // letters, but it's one sound." /sh/); the first time right answers fill a gem (a held step: the world stops);
        // praise, or fast and slow's praise in its slot (SCRIPT_FIXES A7, C4, C15; TEACHER_SCRIPT §9.3)
        const reminder = twoSoundsReminder(w.segs, anchorAt) ?? lettersReminder(w.segs, anchorAt);
        const seg = gemSeg(w, level.teach);
        const gemFirst = seg && isDue("gem-energy", "once")
          ? async () => {
              holding = true;
              publish();
              await explainGemEnergy(seg, { x: 1010, y: 196 }, () => alive); // (right of the word, which rests at 640, 166)
              holding = false;
              publish();
            }
          : null;
        const offRemind = reminder
          ? onSay((items) => {
              if (items !== reminder.say || !trophy || trophy.w !== w) return;
              trophy.all = false;
              trophy.lit = reminder.i;
              trophy.low = t; // (down a little: the petal needs room above the spelling, under the progress bar)
            })
          : null;
        // Praise every third word at most (TEACHER_SCRIPT §5.3 says every second at most): the runner's words come
        // quickly, and the ninja's move and the streak lines praise the words in between (script-audit's praise-rate,
        // ≤ 1.5 a minute). Fast and slow's praise takes a slot when one is due.
        const praise = { keptGoing, helped: wasHelped, every: PRAISE_EVERY };
        const said = await afterWordSay({
          tierUp: tierSaid, leftRight: false, reminder, gemFirst, closingNext, game: "run", praise,
          fs: !tierSaid && praiseWanted({ ...praise, closingNext }) ? fsPraise("run", "listen") : null,
        });
        // a streak line was this word's praise: the rhythm starts again from it, so praise never follows it next word
        if (tierSaid) praiseBy(tierLine!);
        offRemind?.();
        if (said === "reminder" && trophy && trophy.w === w) {
          // the spelling stays lit, and the word low, until its petal has gone (a pop leaves 700 ms after its sound,
          // SOUND_DISPLAY §4.4): rising sooner, the word would slide up under the petal
          await sleep(980);
          if (trophy && trophy.w === w) {
            trophy.lit = -1;
            trophy.all = true;
            trophy.rise = t;
          }
          await sleep(300);
        }
        if (trophy && trophy.w === w) trophy.leave = t;
        readingBack = false;
        eventIdx++;
        setProgress(eventIdx / EVENTS);
        busy = false;
        publish();
        if (eventIdx >= EVENTS) placeGong();
        else {
          nextEventAt = dist + BETWEEN;
          spawnStuff(dist + W + 200, dist + W + 1400);
        }
      } else {
        eventMisses++;
        if (eventMisses >= 2) turns[eventIdx] = true;
        recordRead(w, false);
        const miss = streak.miss({ line: false });
        sfx.wrong();
        l.gone = t;
        const sx = l.x - dist;
        fx.puff(sx, l.y + 40, 10);
        fx.burst(sx, l.y + 40, "dust", 10);
        hopBack();
        startMove("think");
        thinkUntil = t + DUR.think;
        after(0.22, () => sfx.hmm());
        // Gentle correction (TEACHER_SCRIPT §5.4): the ninja holds still until it's said, and the right sounds are the
        // last thing the child hears before choosing again. "Keep going, ninja." first if a streak of 3+ was lost.
        const lost: Say[] = miss.prevN >= 3 && hasLine("streak_lost") ? [{ line: "streak_lost" }, { gap: 200 }] : [];
        let fix: Say[];
        if (mode === "blend") {
          // "That's a different word. Listen again…" + the sounds (the dots light again), taking turns with fast and
          // slow's stuck recap, "Here's the slow way again, one sound at a time…" (§9.3)
          const lead = fsStuck("run", "again", { item: w.text }) ?? (hasLine("tv_run_fix") ? "tv_run_fix" : "listen_again");
          fix = [{ line: lead }, { gap: 200 }, question(w)];
        } else if (eventMisses < 2) {
          // reading: the tapped picture says its word, then Sounds~Write's "Say the sounds, and read the word."
          fix = [{ word: l.word.text }, { gap: 300 }, { line: "say_sounds_read" }];
        } else {
          // a second miss: Sensei models it, the banner's spellings lighting with their sounds, then the word
          fix = [{ line: "say_sounds_read" }, { gap: 250 }, { sounds: w.segs, gap: 300, show: "tile", onSeg: (i) => setDot(i) }, { gap: 150 }, { word: w.text }];
        }
        await cue([[...lost, ...fix]]);
      }
    };
    /** After a wrong lantern: a little hop back down to a gap between the lanterns still in play, so none of their
     *  plates covers the ninja's puzzled face. No catching on the way: that could turn a miss into a right answer. */
    const hopBack = () => {
      hs.homing = null;
      fly = null;
      autoAir = true;
      const plates = lanterns.filter((o) => !o.popped).map((o) => o.x - dist);
      let bestX = HX, bestScore = -Infinity;
      for (let x = 150; x <= 330; x += 10) {
        const clear = Math.min(260, ...plates.map((px) => Math.abs(px - x)));
        const score = Math.min(clear, 170) * 4 - Math.abs(x - HX); // clear of every plate first, then near home
        if (score > bestScore) (bestScore = score), (bestX = x);
      }
      restX = bestX;
      back = { x0: hs.x, y0: hs.y, t0: t, dur: 0.24 + Math.min(0.3, Math.abs(hs.x - bestX) / 1800), x1: bestX };
    };
    /** Fly at a tapped lantern: up in an arc, then down onto it. */
    const flyAt = (l: Lantern) => {
      hs.homing = l;
      back = null;
      restX = null;
      const dx = Math.abs(Math.min(l.x - dist, HOMING_MAX) - hs.x);
      fly = { x0: hs.x, y0: hs.y, t0: t, dur: Math.min(0.5, 0.2 + dx / 2400), rise: Math.min(45, 20 + dx * 0.04) };
    };

    // ---- the end: a flying kick on the gong, a backflip, a ground-pound and a cheer
    const gongC = () => (gongX ?? 0) - dist + 120;
    const startEnding = () => {
      finished = true;
      publish();
      ending = { phase: "fly", t0: t, x0: hs.x };
      hs.homing = null;
      fly = back = null;
      restX = null;
      trophy = null;
      startMove("gongkick");
      sfx.jump();
      sfx.whoosh();
    };
    const gongImpact = () => {
      if (!ending) return;
      const tier = Math.max(1, glow) as Tier;
      ending.phase = "rebound";
      ending.t0 = t;
      gongHitAt = t;
      freeze = 0.1;
      const disc = { x: gongC(), y: GROUND + 8 - 118 };
      sfx.kick();
      sfx.gong();
      impact({ x: disc.x - 40, y: disc.y }, "boom", tier, 170);
      shakeStage();
      for (let i = 0; i < 3; i++) after(0.1 + i * 0.16, () => fx.ring(gongC(), disc.y, { color: i === 1 ? "#fff4dc" : "#ffc53d", r0: 60, r1: 330, width: 12, life: 34 }));
      fx.burst(disc.x, disc.y, "confetti", 40, 1.2);
      fx.rain("blossoms", 60);
      hs.vy = -650;
      hs.jumps = 2;
      startMove("backflip");
      void say({ line: "run_end" }).then(() => (endSpoken = true));
    };
    const groundPound = () => {
      if (!ending) return;
      const tier = Math.max(1, glow) as Tier;
      ending.phase = "cheer";
      ending.t0 = t;
      slamAt = t;
      sfx.land();
      fx.puff(hs.x, GROUND, 18);
      fx.ring(hs.x, GROUND - 6, { color: "#fff4dc", r0: 30, r1: 280, width: 16, life: 26 });
      fx.twinkle(hs.x, GROUND - 60, COLS[tier], 14, 9);
      startMove("cheer");
      const pop = () => {
        const p = { x: hs.x + 10, y: feet() - 230 * S };
        fx.burst(p.x, p.y, "confetti", 26, 1.1);
        fx.twinkle(p.x, p.y, COLS[tier], 12, 9, 30);
        sfx.twinkle();
      };
      after(0.12, () => (hs.vy = -560));
      after(0.3, pop);
      after(0.72, () => (hs.vy = -440));
      after(0.86, pop);
      after(0.2, () => sfx.great());
      after(1.3, () => ending && (ending.phase = "done"));
    };

    // dev: how far the world has run (the game waits while the phone is upright)
    (window as any).__runDist = () => dist;
    // dev (filming): put an obstacle just ahead
    (window as any).__runSpawn = (kind: "crate" | "spikes", ahead = 700) => things.push({ x: dist + hs.x + ahead, kind, y: GROUND });
    // dev (filming): are the lanterns well into view?
    (window as any).__runReady = () => !!current && lanterns.length > 0 && lanterns.every((l) => l.popped || l.x - dist < W - 180);
    // bots: fly to the right lantern once it's well on screen (`wrong` = a wrong one, for filming a miss; `far` = the
    // furthest one that fits, e.g. a wrong lantern beyond the right one)
    // The bots' taps are real taps on the canvas (a pointerdown at the lantern, or on open ground to jump), so the
    // harnesses' input logs see the child answer. The canvas carries the tap's name while it is dispatched
    // (`lantern "sit"`, `jump`), which is what their tap logs record.
    const botTap = (x: number, y: number, label: string) => {
      const r = c.getBoundingClientRect();
      c.setAttribute("aria-label", label);
      c.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, isPrimary: true, pointerType: "touch", clientX: r.left + (x / W) * r.width, clientY: r.top + (y / H) * r.height }));
      c.removeAttribute("aria-label");
    };
    (window as any).__snRun = (wrong?: boolean, far?: boolean) => {
      // the practice jump: a tap on open ground, once the child has heard the invitation
      if (jumpWait) {
        if (!jumpLineDone) return { busy: false, eventIdx, finished, x: null, flew: null };
        botTap(700, 430, "jump");
        return { busy: false, eventIdx, finished, x: null, flew: null, jumped: true };
      }
      // a child who listens waits for the question before choosing (a lantern tapped before the sounds only wiggles;
      // one tapped during "Tap the lantern with my word." counts, but the bot lets Sensei finish)
      if (current && (!cueDone || (mode === "blend" && !heard))) return { busy: busyNow(), eventIdx, finished, x: null, flew: null };
      const cs = lanterns.filter((l) => l.correct === !wrong && !l.popped && l.x - dist < W - 150);
      const l = far ? cs[cs.length - 1] : cs[0];
      const fly = !!l && !finished && l !== hs.homing;
      if (fly) botTap(l.x - dist, l.y + 30 + Math.sin(t * 2.5 + l.phase) * 10, `lantern "${l.word.text}"`);
      // `tapped`: the lantern's word when this call tapped it (`flew` stays null: the tap is logged as a tap already)
      return { busy: busyNow(), eventIdx, finished, x: l ? Math.round(l.x - dist) : null, flew: null, tapped: fly && hs.homing === l ? l.word.text : null };
    };
    // dev (filming): where the lanterns are, and whether Sensei's prompt is still playing
    (window as any).__runLanterns = () => ({ cueDone, lanterns: lanterns.map((l) => ({ x: Math.round(l.x - dist), y: l.y, word: l.word.text, correct: l.correct, popped: l.popped })) });
    // Help (Sensei in the corner, TEACHER_SCRIPT §5.5): the first press asks the question again; the second makes the
    // right lantern glow ("Look for the glow."); the third flies the ninja to it. With no lanterns up: how to play.
    (window as any).__snRunHelp = (n: number) => {
      if (!current) return say({ line: "help_run" });
      if (n === 1) return api.current.repeat();
      if (n === 2) {
        glowFrom = t;
        return say({ line: hasLine("tv_look_glow") ? "tv_look_glow" : "help_run" });
      }
      turns[eventIdx] = true;
      // biggest clue: the ninja flies to the right lantern (one still coming in is pulled to it)
      const l = lanterns.find((l) => l.correct && !l.popped && l.x - dist < W + 240);
      say({ line: "help_look" });
      if (l) {
        helped = true;
        autoAir = false;
        flyAt(l);
      }
    };
    // this run's hooks on window, which the cleanup deletes (they would keep the whole run alive until the next Run)
    const hooks = Object.fromEntries(["__runDist", "__runSpawn", "__runReady", "__snRun", "__runLanterns", "__snRunHelp"].map((k) => [k, (window as any)[k]]));
    api.current.repeat = () => {
      if (jumpWait && !current) return say({ line: "tv_run_jump" }); // the practice jump's invitation
      if (!current || !prompted) return;
      if (prompted.sweep) window.setTimeout(() => void sweepUnder(document.querySelector(".run-banner")), 350);
      return cue(prompted.parts);
    };
    api.current.jump = () => {
      if (finished) return;
      wake();
      if (hintFrom >= 0) hintFrom = Math.max(hintFrom, t + 2.5); // busy jumping: the hint waits for a pause
      if (hs.jumps < 2 && !hs.homing) {
        back = null;
        autoAir = false;
        hs.vy = JUMP_V * (hs.jumps ? 0.85 : 1);
        hs.jumps++;
        sfx.jump();
        if (hs.jumps === 1) fx.burst(hs.x, GROUND, "dust", 6);
        // the practice jump ("Can you try it now?"): the child did it (a jump before the line began is just a jump)
        if (jumpWait && jumpAsked) {
          const f = jumpWait;
          jumpWait = null;
          fx.burst(hs.x, GROUND - 230, "stars", 7, 0.9);
          sfx.twinkle();
          f();
        }
      }
    };
    api.current.tapAt = (x, y) => {
      if (finished) return;
      wake();
      // a lantern mostly on screen (one further right is pulled to the ninja, see HOMING_MAX)
      const hit = lanterns.find((l) => !l.popped && l.x - dist < W - 90 && Math.hypot(l.x - dist - x, l.y + 30 - y) < 110);
      if (hit) {
        if (!heard && mode === "blend") {
          // too soon: Sensei hasn't said the sounds yet. The lantern wiggles and the ninja stays ready: listen first
          hit.wiggle = t;
          sfx.bounce();
          return;
        }
        touched = true;
        if (hit !== hs.homing) flyAt(hit);
        sfx.whoosh();
        return;
      }
      api.current.jump();
    };

    // ---------------------------------------------------------------- the scenery (docs/PERF.md fix 8)
    // The painted background and the ground never change as the world runs, they only slide. So each is baked once
    // into a wide strip behind the canvas (one loop longer than the stage), and the compositor slides it along with a
    // transform: no full-stage redraw of static art every frame. The canvas above only draws what moves on them.
    const far = farRef.current!, land = landRef.current!;
    const place = (el: HTMLCanvasElement, w: number, h: number, top: number) => {
      el.width = Math.ceil(w);
      el.height = Math.ceil(h);
      Object.assign(el.style, { width: `${el.width}px`, height: `${el.height}px`, top: `${top}px` });
    };
    // the background, baked at its drawn size with its colour grade and stitched into a loop (loopTile), then laid
    // end to end across the strip; it slides at a quarter of the running speed
    let farLoop = 0;
    const bakeFar = () => {
      if (farLoop || !ok(I.bg)) return;
      const floor = BG_FLOOR[world.key];
      const k = floor ? (GROUND + 14) / floor : (GROUND + 60) / I.bg.naturalHeight;
      const h = Math.round(I.bg.naturalHeight * k);
      const w = Math.round(I.bg.naturalWidth * k);
      const c = mkCanvas(w, Math.min(h, GROUND + 60)); // only what shows above the earth
      const b = c.getContext("2d")!;
      b.filter = "saturate(0.9) brightness(1.03)";
      b.drawImage(I.bg, 0, 0, w, h);
      let tile = c;
      try {
        tile = loopTile(c);
      } catch {
        // a plain repeat rather than no background
      }
      farLoop = tile.width;
      place(far, W + farLoop, tile.height, 0);
      const fg = far.getContext("2d")!;
      for (let x = 0; x < far.width; x += farLoop) fg.drawImage(tile, x, 0);
      c.width = tile.width = 0; // (only the strip is kept)
    };
    // the ground: earth, the grass lip with its ink outline (a scallop every 40 px) and the pale stones (a stone every
    // 173 px, repeating every 1480 px, a whole number of scallops), exactly as they were drawn at each moment
    const LAND_TOP = GROUND - 16;
    const LAND_LOOP = W + 200;
    const bakeLand = () => {
      place(land, W + LAND_LOOP, H - LAND_TOP, LAND_TOP);
      const b = land.getContext("2d")!;
      const RW = land.width;
      b.translate(0, -LAND_TOP);
      const grd = b.createLinearGradient(0, GROUND, 0, H);
      grd.addColorStop(0, "#8b5a3c");
      grd.addColorStop(1, "#5a3624");
      b.fillStyle = grd;
      b.fillRect(0, GROUND + 10, RW, H - GROUND);
      const lip = () => {
        b.moveTo(-10, GROUND + 2);
        for (let x = -10; x <= RW + 40; x += 40) b.quadraticCurveTo(x + 20, GROUND - 10, x + 40, GROUND + 2);
      };
      b.fillStyle = world.colour;
      b.strokeStyle = INK;
      b.lineWidth = 6;
      b.beginPath();
      lip();
      b.lineTo(RW + 80, GROUND + 26);
      b.lineTo(-10, GROUND + 26);
      b.closePath();
      b.fill();
      b.beginPath();
      lip();
      b.stroke();
      b.fillStyle = "rgba(255,244,220,.25)";
      for (let i = 0; i < 12; i++)
        for (let k = -1; k <= 2; k++) {
          const x = ((((i * 173 - 100) % LAND_LOOP) + LAND_LOOP) % LAND_LOOP) + k * LAND_LOOP;
          b.beginPath();
          b.ellipse(x, GROUND + 50 + (i % 3) * 22, 18 + (i % 4) * 6, 8, 0, 0, TAU);
          b.fill();
        }
    };
    bakeLand();
    let farAt = NaN, landAt = NaN;
    const slide = (el: HTMLCanvasElement, x: number, was: number) => {
      if (Math.abs(x - was) > 0.005) el.style.transform = `translate3d(${x}px, 0, 0)`;
      return x;
    };
    const drawScenery = () => {
      bakeFar();
      if (farLoop) farAt = slide(far, -((dist * 0.25) % farLoop), farAt);
      landAt = slide(land, -(dist % LAND_LOOP), landAt);
    };
    // The canvas is drawn at the stage's 1280×720, or at the screen's own size where that is smaller (a small, low
    // density window): never more pixels than the screen shows.
    let ck = 1;
    const fitCanvas = () => {
      const r = c.getBoundingClientRect();
      const k = r.width ? Math.min(1, Math.round(((r.width * (window.devicePixelRatio || 1)) / W) * 20) / 20) : 1;
      if (k === ck && c.width === Math.round(W * k)) return;
      ck = k;
      for (const el of [c, under]) {
        el.width = Math.round(W * k);
        el.height = Math.round(H * k);
      }
    };
    fitCanvas();
    window.addEventListener("resize", fitCanvas);

    // ---------------------------------------------------------------- drawing helpers
    const drawSprite = (image: HTMLImageElement, cx: number, bottom: number, w: number, rot = 0, sx = 1, sy = 1) => {
      if (!ok(image)) return;
      const h = (image.naturalHeight / image.naturalWidth) * w;
      g.save();
      g.translate(cx, bottom);
      g.rotate(rot);
      g.scale(sx, sy);
      g.drawImage(image, -w / 2, -h, w, h);
      g.restore();
    };
    // The plates are baked once each (PERF 8.2: text and shadows drawn on the canvas every frame were a raster cost), at
    // PLATE_K× so they stay sharp when the caught word is drawn at 1.25×.
    const PLATE_K = 1.5;
    const measure = mkCanvas(1, 1).getContext("2d")!;
    const drawBaked = (c: HTMLCanvasElement, cx: number, cy: number) => g.drawImage(c, cx - c.width / PLATE_K / 2, cy - c.height / PLATE_K / 2, c.width / PLATE_K, c.height / PLATE_K);
    /** A lantern's word plate. */
    const plateTex = (text: string) =>
      cached(`plate|${text}`, () => {
        measure.font = "700 54px Andika";
        const w = measure.measureText(text).width + 40, h = 72;
        const c = mkCanvas((w + 10) * PLATE_K, (h + 10) * PLATE_K);
        const b = c.getContext("2d")!;
        b.scale(PLATE_K, PLATE_K);
        b.translate((w + 10) / 2, (h + 10) / 2);
        b.fillStyle = "#fff4dc";
        b.strokeStyle = INK;
        b.lineWidth = 5;
        b.beginPath();
        b.roundRect(-w / 2, -h / 2, w, h, 16);
        b.fill();
        b.stroke();
        b.font = "700 54px Andika";
        b.fillStyle = INK;
        b.textAlign = "center";
        b.textBaseline = "middle";
        b.fillText(text, 0, 2);
        return c;
      });
    const plate = (text: string, cx: number, cy: number) => drawBaked(plateTex(text), cx, cy);
    /** A reading lantern's picture plate (once its picture has loaded). */
    const picPlate = (word: string, cx: number, top: number) => {
      const p = I.pics[word];
      const draw = (b: CanvasRenderingContext2D, x: number, y: number) => {
        b.fillStyle = "#fff4dc";
        b.strokeStyle = INK;
        b.lineWidth = 5;
        b.beginPath();
        b.roundRect(x - 70, y, 140, 120, 18);
        b.fill();
        b.stroke();
        if (ok(p)) {
          const k = Math.min(120 / p.naturalWidth, 104 / p.naturalHeight);
          b.drawImage(p, x - (p.naturalWidth * k) / 2, y + 8, p.naturalWidth * k, p.naturalHeight * k);
        }
      };
      if (!ok(p)) return draw(g, cx, top);
      const c = cached(`pic|${word}`, () => {
        const c = mkCanvas(150 * PLATE_K, 130 * PLATE_K);
        const b = c.getContext("2d")!;
        b.scale(PLATE_K, PLATE_K);
        draw(b, 75, 5);
        return c;
      });
      g.drawImage(c, cx - 75, top - 5, 150, 130);
    };
    /** The caught word's spellings: their widths (local units) with the plate's font. */
    const segWidths = (segs: readonly Seg[]) => {
      measure.font = "700 60px Andika";
      return segs.map((s) => Math.max(40, measure.measureText(s.g).width + 10));
    };
    /** The caught word, spelling by spelling; `lit` lights the spelling whose sound is being said; `all`: the whole word
     *  glows warm (said fast). One texture per state. */
    const wordPlateTex = (segs: Seg[], lit: number, all: boolean) =>
      cached(`word|${segs.map((s) => s.g).join("|")}|${lit}|${all ? 1 : 0}`, () => {
        const ws = segWidths(segs);
        const tw = ws.reduce((a, b) => a + b, 0);
        const w = tw + 48, h = 84;
        const pad = all ? 46 : 8;
        const c = mkCanvas((w + pad * 2) * PLATE_K, (h + pad * 2) * PLATE_K);
        const b = c.getContext("2d")!;
        b.scale(PLATE_K, PLATE_K);
        b.translate(w / 2 + pad, h / 2 + pad);
        if (all) {
          // its warm glow (the plate is drawn at about 1.25×: the blur is in plate units, so it looks as it did)
          const rw = Math.round(w);
          const gl = glowOnly(`plate${rw}`, { w: rw, h }, 28 / 1.25, "rgba(255,190,60,0.95)", 1, (x) => {
            x.beginPath();
            x.roundRect(-rw / 2, -h / 2, rw, h, 18);
            x.fill();
          });
          b.drawImage(gl, -gl.width / 2, -gl.height / 2);
        }
        b.fillStyle = all ? "#fff1b8" : "#fff4dc";
        b.strokeStyle = INK;
        b.lineWidth = 5;
        b.beginPath();
        b.roundRect(-w / 2, -h / 2, w, h, 18);
        b.fill();
        b.stroke();
        b.font = "700 60px Andika";
        b.textAlign = "center";
        b.textBaseline = "middle";
        let x = -tw / 2;
        segs.forEach((s, i) => {
          const on = i === lit;
          const mid = x + ws[i] / 2;
          if (on) {
            b.fillStyle = "#ffc53d";
            b.strokeStyle = INK;
            b.lineWidth = 3.5;
            b.beginPath();
            b.roundRect(x + 1, -35, ws[i] - 2, 70, 12);
            b.fill();
            b.stroke();
          }
          b.save();
          b.translate(mid, 2 - (on ? 3 : 0));
          if (on) b.scale(1.14, 1.14);
          b.fillStyle = INK;
          b.fillText(s.g, 0, 0);
          b.restore();
          x += ws[i];
        });
        return c;
      });
    const wordPlate = (segs: Seg[], cx: number, cy: number, lit: number, all: boolean) => drawBaked(wordPlateTex(segs, lit, all), cx, cy);
    const star4 = (x: number, y: number, s: number, rot: number) => star4On(g, x, y, s, rot);

    // ---- the ninja: pose and body motion for this frame
    const lookNow = (): Look => {
      const air = hs.y < GROUND - 2 || !!hs.homing || ending?.phase === "fly";
      // stopped to listen (the world holds while Sensei gives the sounds): a bouncy fighting stance, ready to jump
      // (on the start line before the gun: jogging on the spot while Sensei frames the game, then the ready stance)
      const L: Look = { pose: air ? "jump" : !started && stance === "jog" ? "run" : speed < 60 && !finished ? "ready" : "run", rot: 0, sx: 1, sy: 1, dx: 0, dy: 0 };
      if (hs.homing) {
        // tapped a lantern: up in a tuck, then a flying kick down onto it
        const q = fly ? (t - fly.t0) / fly.dur : 1;
        L.pose = q < 0.32 ? "jump" : "kick";
        L.rot = (q < 0.32 ? -4 : -10) * DEG;
      }
      if (ending?.phase === "done") L.pose = "cheer";
      if (!mv) return L;
      const e = t - mv.t0;
      const rest: Pose = L.pose === "ready" ? "ready" : air ? "jump" : "run";
      switch (mv.kind) {
        case "kick": {
          const fly = mv.tier >= 2;
          const out = e < 0.07 ? easeOut(e / 0.07) : e < 0.26 ? 1 : 1 - easeInOut((e - 0.26) / 0.2);
          return { pose: e < 0.34 ? "kick" : rest, rot: (fly ? -18 : -10) * DEG * out, sx: 1 + 0.07 * out, sy: 1 - 0.05 * out, dx: (fly ? 36 : 24) * out, dy: fly ? -10 * out : 0 };
        }
        case "punch": {
          const two = mv.tier >= 1;
          const out = Math.max(hump(e, 0, 0.2), two ? hump(e, 0.2, 0.4) : 0);
          return { pose: e < (two ? 0.4 : 0.24) ? "punch" : rest, rot: -4 * DEG * out, sx: 1 + 0.1 * out, sy: 1 - 0.07 * out, dx: 26 * out, dy: 0 };
        }
        case "spin": {
          const q = clamp01(e / 0.44);
          const cs = Math.cos(easeInOut(q) * TAU);
          return { pose: e < 0.46 ? "spin" : rest, rot: 0, sx: (cs < 0 ? -1 : 1) * Math.max(0.14, Math.abs(cs)) * 1.04, sy: 1, dx: 0, dy: -14 * hump(q, 0, 1) };
        }
        case "flip":
          return { pose: e < 0.44 ? "flip" : rest, rot: easeInOut(e / 0.5) * TAU, sx: 1, sy: 1 - 0.1 * hump(e, 0, 0.12), dx: 0, dy: 0 };
        case "backflip":
          return { pose: e < 0.46 ? "flip" : rest, rot: -easeInOut(e / 0.52) * TAU, sx: 1, sy: 1, dx: 0, dy: 0 };
        case "cast": {
          const push = hump(e, 0.04, 0.36);
          return { pose: e < 0.4 ? "cast" : rest, rot: -3 * DEG * push, sx: 1 + 0.06 * push, sy: 1 - 0.05 * push, dx: 16 * push, dy: 0 };
        }
        case "power": {
          const crouch = e < 0.18 ? easeOut(e / 0.18) : e < 0.3 ? 1 - (e - 0.18) / 0.12 : 0;
          const stretch = hump(e, 0.18, 0.44);
          const buzz = e > 0.3 && e < 0.62 ? Math.sin(e * 95) * 3 : 0;
          return { pose: e < 0.18 ? "ready" : e < 0.8 ? "power" : rest, rot: 0, sx: 1 + 0.14 * crouch - 0.06 * stretch, sy: 1 - 0.16 * crouch + 0.1 * stretch, dx: buzz, dy: 0 };
        }
        case "think": {
          const tilt = Math.min(1, e / 0.25) * Math.min(1, (DUR.think - e) / 0.3);
          // puzzled even in the air (hopping back): the arms-up jump pose would look like cheering a wrong answer
          return { pose: "think", rot: -5 * DEG * tilt * (1 + 0.3 * Math.sin(e * 5)), sx: air ? 0.97 : 1, sy: air ? 1.03 : 1, dx: 0, dy: 0 };
        }
        case "crate": {
          const out = hump(e, 0, 0.32);
          return { pose: e < 0.26 ? "kick" : rest, rot: -8 * DEG * out, sx: 1 + 0.06 * out, sy: 1 - 0.05 * out, dx: 26 * out, dy: -6 * out };
        }
        case "gongkick":
          return { pose: "kick", rot: -16 * DEG, sx: 1.05, sy: 0.97, dx: 0, dy: 0 };
        case "cheer":
          return { pose: "cheer", rot: 0, sx: 1, sy: 1, dx: 0, dy: 0 };
        case "bow": {
          // a ninja's rei, facing ▶: with its own art a small lean; until it lands, the ready stance nods forward from
          // the hips and springs up into a little hop (as Ninja.tsx's fallback). The lean turns round the tummy, so the
          // feet are moved back under it.
          const art = hasPose(hero, "bow");
          const nod = e < 0.16 ? easeInOut(e / 0.16) : e < 0.36 ? 1 : e < 0.45 ? 1 - easeInOut((e - 0.36) / 0.09) : 0;
          const r = (art ? 3 : 16) * DEG * nod;
          const squash = hump(e, 0.36, 0.52);
          const hop = e > 0.45 && e < 0.73 ? Math.sin(((e - 0.45) / 0.28) * Math.PI) : 0;
          return { pose: art && e > 0.12 && e < 0.72 ? "bow" : "ready", rot: r, sx: 1 + 0.08 * squash - 0.04 * hop, sy: 1 - 0.1 * squash + 0.06 * hop, dx: PIVOT * Math.sin(r), dy: PIVOT * (1 - Math.cos(r)) - 36 * hop };
        }
        case "stumble": {
          // bumped a crate or spikes without a streak: a comic trip, wobble and hop (never a hurt pose)
          const wob = Math.sin(e * 14) * Math.exp(-e * 5);
          const squash = hump(e, 0, 0.14);
          return { pose: e < 0.42 ? "jump" : rest, rot: 24 * DEG * wob, sx: 1 + 0.08 * squash, sy: 1 - 0.1 * squash, dx: -16 * hump(e, 0, 0.3), dy: 0 };
        }
      }
      return L;
    };
    /** Draw the ninja (or a silhouette of it) with the move's body transform: spins and flips turn round the tummy. */
    const heroGeom = (pose: Pose) => {
      let i = poseImg(pose);
      let p = pose;
      if (!ok(i)) (i = poseImg("run")), (p = "run");
      const f = poseFit(hero, p);
      const w = HW * f.scale;
      const h = (w * i.naturalHeight) / Math.max(1, i.naturalWidth);
      return { i, w, h, left: HW * f.dx - w / 2 };
    };
    const withBody = (x: number, fy: number, rot: number, sx: number, sy: number, fn: () => void) => {
      g.save();
      g.translate(x, fy);
      if (rot) {
        g.translate(0, -PIVOT);
        g.rotate(rot);
        g.translate(0, PIVOT);
      }
      g.scale(sx, sy);
      fn();
      g.restore();
    };
    /** A point on the ninja's body (local offset from the feet) after the body transform. */
    const bodyPt = (x: number, fy: number, rot: number, sx: number, sy: number, px: number, py: number): Pt => {
      const X = px * sx, Y = py * sy + PIVOT;
      const c = Math.cos(rot), s = Math.sin(rot);
      return { x: x + c * X - s * Y, y: fy + s * X + c * Y - PIVOT };
    };

    // ---------------------------------------------------------------- loop
    let last = performance.now();
    let raf = 0;
    let cur: Look = lookNow();
    let heroX = HX, heroFeet = GROUND + 8, heroRot = 0, heroSx = 1, heroSy = 1;

    const update = (dt: number) => {
      t += dt;
      const tier = glow;
      const thinking = t < thinkUntil && hs.y >= GROUND - 2;
      // The lanterns come in briskly as a group and brake as the last one arrives, so every choice is on screen within
      // about 3 s of the word starting. Then the ninja stops in a ready stance while Sensei speaks (and a moment more to
      // look at the pictures), and the world drifts on slowly so each lantern passes overhead in turn.
      let lastSx = -Infinity;
      if (current) for (const l of lanterns) if (!l.popped) lastSx = Math.max(lastSx, l.x - dist);
      const choosing = lastSx > -Infinity;
      if (choosing && allInAt < 0 && lastSx <= LAST_IN + 4) allInAt = t;
      const hold = !cueDone || t - allInAt < (mode === "read" ? 1.6 : 0.6);
      // after the prompt the lanterns drift over the ninja one by one (to jump for), slowly enough for a 4-year-old to
      // decode each word as it comes; tapping a lantern is the fast way, and the tap hint shows it
      targetSpeed = !started || finished || thinking || holding ? 0
        : choosing ? (allInAt < 0 ? Math.min(340, 24 + (lastSx - LAST_IN) * 2.4) : hold ? 0 : 80) // time to decode each one
        : hs.bumpT > 0 ? 220 : 360;
      if (choosing && cueDone && allInAt >= 0 && hintFrom < 0) hintFrom = t + (eventIdx === 0 ? 0.5 : 2.5);
      if (restX !== null && !back && cueDone && !thinking) restX = null; // the world moves on: jog back home
      speed += (targetSpeed - speed) * Math.min(1, dt * (choosing && allInAt < 0 ? 6 : 4));
      dist += speed * dt;

      for (let i = timers.length - 1; i >= 0; i--)
        if (t >= timers[i].at) {
          const f = timers[i].fn;
          timers.splice(i, 1);
          f();
        }
      if (mv && t - mv.t0 >= DUR[mv.kind]) mv = null;
      if (pendingPower && t >= pendingPower.at && (!mv || mv.kind === "think") && !ending) {
        startPower(pendingPower.tier);
        pendingPower = null;
      }
      if (tier >= 1) visTier = tier;
      aura += ((tier >= 1 ? 1 : 0) - aura) * Math.min(1, dt * (tier >= 1 ? 3 : 2.4));

      // hero physics
      const wasAir = hs.y < GROUND;
      if (ending?.phase === "fly") {
        // the flying kick: a short arc onto the gong's face
        const q = clamp01((t - ending.t0) / 0.32);
        hs.x = ending.x0 + (gongC() - 150 - ending.x0) * easeOut(q);
        hs.y = GROUND - 96 * Math.sin((q * Math.PI) / 2);
        hs.vy = 0;
        if (q >= 1) gongImpact();
      } else if (hs.homing && !hs.homing.popped) {
        const l = hs.homing;
        // a lantern still far right comes to the ninja (the world dashes on), so the hit lands well on screen
        const over = l.x - dist - HOMING_MAX;
        if (over > 0) dist += Math.min(over, 1500 * dt);
        // up in an arc and down onto the lantern, tummy to its middle (the flying ninja is drawn over the other lanterns)
        const bob = Math.sin(t * 2.5 + l.phase) * 10;
        const tx = Math.min(l.x - dist, HOMING_MAX),
          ty = l.y + 30 + bob + BODY;
        const f = (fly ??= { x0: hs.x, y0: hs.y, t0: t, dur: 0.35, rise: 30 });
        const q = clamp01((t - f.t0) / f.dur);
        // up first, then across and down onto it (the flames stay clear of the progress bar)
        hs.x = f.x0 + (tx - f.x0) * (1 - (1 - q) * (1 - q));
        hs.y = Math.max(350, f.y0 + (ty - f.y0) * (1 - Math.pow(1 - q, 3)) - f.rise * Math.sin(Math.PI * q));
        hs.vy = 0;
        hs.jumps = 2;
      } else if (back) {
        // back down after a wrong lantern, with a little hop, to a gap between the lanterns
        const q = clamp01((t - back.t0) / back.dur);
        hs.x = back.x0 + (back.x1 - back.x0) * easeInOut(q);
        hs.y = back.y0 + (GROUND - back.y0) * q * q - 60 * Math.sin(Math.PI * q);
        hs.vy = 0;
        if (q >= 1) {
          back = null;
          hs.y = GROUND;
          hs.jumps = 0;
          autoAir = false;
          fx.burst(hs.x, GROUND, "dust", 5);
          sfx.land();
        }
      } else {
        hs.homing = null;
        fly = null;
        const home = ending ? Math.max(HX, Math.min(gongC() - 260, HX + 60)) : (restX ?? HX);
        hs.x += (home - hs.x) * Math.min(1, dt * (ending ? 3 : 2));
        hs.vy += GRAV * dt;
        hs.y += hs.vy * dt;
        if (hs.y >= GROUND) {
          if (hs.jumps > 0 && hs.vy > 400) {
            fx.burst(hs.x, GROUND, "dust", 4);
            if (tier >= 1) fx.puff(hs.x, GROUND, 6);
          }
          hs.y = GROUND;
          hs.vy = 0;
          hs.jumps = 0;
          autoAir = false;
          if (wasAir && ending?.phase === "rebound" && t - ending.t0 > 0.25) groundPound();
        }
      }
      hs.bumpT = Math.max(0, hs.bumpT - dt);

      // events
      if (!busy && started && !introBusy && !finished && gongX === null && dist > nextEventAt) startEvent();
      if (gongX !== null && !ending) {
        const d = gongC() - hs.x;
        if ((d < 430 && hs.y >= GROUND - 2 && !hs.homing) || d < 240) startEnding();
      }
      if (ending?.phase === "done" && endSpoken && !doneCalled) {
        doneCalled = true;
        // the end of the game's play (TEACHER_SCRIPT §2.2): a struggle brings the recap, with its hold, next time
        played("run", { struggled: struggledIn(turns) });
        const stars = firstTry >= EVENTS - 1 ? 3 : firstTry >= EVENTS - 3 ? 2 : 1;
        sleep(300).then(() => alive && onDone(stars, { closing: "run_end" }));
      }

      // collisions
      for (const th of things) {
        const sx = th.x - dist;
        if (th.got) continue;
        // on a streak the ninja deals with obstacles itself: crates get kicked away, spikes get flipped over
        if (tier >= 1 && !ending && !hs.homing) {
          if (th.kind === "crate" && sx - hs.x > 30 && sx - hs.x < 120 && hs.y > GROUND - 60) {
            kickCrate(th, sx);
            continue;
          }
          // take off so the spikes pass under the top of the flip, whatever the speed
          if (th.kind === "spikes" && sx - hs.x > 60 && sx - hs.x < 60 + 0.1 * Math.max(160, speed) && hs.y >= GROUND - 2) {
            th.got = th.flipped = true;
            autoAir = true;
            hs.vy = JUMP_V * 0.72;
            hs.jumps = 1;
            startMove("flip");
            fx.burst(hs.x, GROUND, "dust", 6);
            continue;
          }
        }
        if (sx < hs.x - 60 || sx > hs.x + 60) continue;
        if (th.kind === "star") {
          if (Math.abs(th.y - (hs.y - BODY)) < 90) {
            th.got = true;
            collected++;
            setStars(collected);
            sfx.coin();
            fx.burst(sx, th.y, "sparks", 6);
            fx.twinkle(sx, th.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 5, 5);
          }
        } else if (hs.y > GROUND - 70 && hs.bumpT <= 0 && !back) {
          // no streak yet: a comic trip and hop over it (the ninja is never hurt in the run)
          th.got = true;
          hs.bumpT = 0.8;
          hs.vy = -760;
          hs.jumps = 1;
          autoAir = true;
          startMove("stumble");
          fx.burst(sx, GROUND - 40, "dust", 8);
        }
      }
      for (const l of lanterns) {
        if (l.popped) continue;
        const sx = l.x - dist;
        // flying at a tapped lantern: only that one counts (not one it passes on the way)
        const reach = hs.homing ? hs.homing === l : !autoAir && !back;
        if (reach && (heard || mode === "read") && Math.abs(sx - hs.x) < 80 && Math.abs(l.y + 40 - (hs.y - BODY)) < 110) catchLantern(l);
        if (sx < -120 && !l.popped) {
          // missed them all: loop the lanterns round again
          if (lanterns.every((o) => o.popped || o.x - dist < -120)) {
            const left = lanterns.filter((o) => !o.popped);
            const sp = left.length >= 3 ? SPACING[3] : SPACING[2];
            left.forEach((o, i) => (o.x = dist + W + 150 + i * sp));
            allInAt = -1;
            things = things.filter((th) => th.x < dist + W || th.x > dist + W + 1400);
            // As they come back round, a quiet child's ladder (TEACHER_SCRIPT §5.5; never the word itself, which is the
            // answer): the question again; then the right one glows, the hand taps it, "Here it is. Tap it when you're
            // ready."; then once "Take your time, ninja."; after that only the sounds (a reading group: nothing more)
            if (current) {
              const k = ++loops;
              const lead = k === 1 ? (mode === "blend" ? (hasLine("tv_guess_q") ? "tv_guess_q" : "listen_again") : "run_read") : k === 2 ? "tv_idle_point" : k === 3 ? "tv_take_time" : null;
              if (k === 2) {
                glowFrom = t;
                touched = false;
                turns[eventIdx] = true;
              }
              const ask = mode === "blend" ? [question(current)] : [];
              const parts: Say[] = [...(lead && hasLine(lead) ? [{ line: lead }, ...(ask.length ? [{ gap: 250 }] : [])] : []), ...ask];
              if (parts.length) void cue([parts]);
            }
          }
        }
      }

      // the ninja's pose, and its trails on a super streak
      cur = lookNow();
      const running = cur.pose === "run";
      const step = Math.sin(t * 18);
      heroX = hs.x + cur.dx;
      heroFeet = hs.y + 8 + cur.dy - (running ? Math.abs(step) * 8 : 0);
      heroRot = cur.rot + (running ? step * 0.05 : 0);
      heroSx = cur.sx;
      heroSy = cur.sy * (running ? 1 + Math.abs(step) * 0.03 : 1);
      if (cur.pose === "ready") {
        // bouncing on its toes
        const b = Math.abs(Math.sin(t * 5.2));
        heroFeet -= b * 5;
        heroSy *= 0.975 + 0.035 * b;
        heroSx *= 1.012 - 0.018 * b;
      }
      // the streak flames give way to any lantern the child still has to read as it passes over the ninja's head
      const n = Math.min(10, streak.n);
      const half = n > 0 ? ((n - 1) / 2) * (n > 8 ? 25 : n > 5 ? 29 : 33) + 26 : 0;
      const fy = heroFeet - 236 * S;
      const under = n > 0 && lanterns.some((l) => {
        if (l.popped || l === hs.homing) return false;
        const sx = l.x - dist;
        return Math.abs(sx - (heroX + 6)) < half + 80 && l.y + 30 < fy + 16 && l.y + 150 > fy - 64;
      });
      flameA += ((under ? 0.22 : 1) - flameA) * Math.min(1, dt * 9);
      if (visTier >= 2 && aura > 0.05) {
        const knot = bodyPt(heroX, heroFeet, heroRot, heroSx, heroSy, -44 * S, -176 * S);
        ribbon.push({ x: knot.x, y: knot.y, t });
        if (t - lastGhost > 0.09) {
          lastGhost = t;
          ghosts.push({ x: heroX, feet: heroFeet, pose: cur.pose, rot: heroRot, sx: heroSx, sy: heroSy, t });
        }
        if (speed > 150 && t - lastLine > 0.045) {
          lastLine = t;
          speedLines.push({ x: hs.x + 60 + Math.random() * 220, y: heroFeet - 20 - Math.random() * 190 * S, len: 60 + Math.random() * 90, t0: t });
        }
      }
      while (ribbon.length && t - ribbon[0].t > 0.34) ribbon.shift();
      while (ghosts.length && t - ghosts[0].t > 0.3) ghosts.shift();
      while (speedLines.length && t - speedLines[0].t0 > 0.28) speedLines.shift();
    };

    // ---- drawing the ninja and its streak
    // The aura and the light rays behind the ninja: its two textures (auraTex, raysTex) on two DOM layers between the
    // canvases, turned, scaled and faded by the compositor. Drawn on the canvas they were the biggest part of a streak
    // frame (two large rotated images, every frame).
    const raysEl = raysRef.current!, auraEl = auraRef.current!;
    let auraShown = false, auraTier = -1;
    const placeAura = () => {
      const vt = visTier;
      if (aura <= 0.02) {
        if (auraShown) raysEl.style.visibility = auraEl.style.visibility = "hidden";
        auraShown = false;
        return;
      }
      if (auraTier !== vt) {
        auraTier = vt;
        for (const [el, tx] of [[raysEl, raysTex(vt)], [auraEl, auraTex(vt)]] as const) {
          el.width = el.height = tx.width;
          el.style.width = el.style.height = `${tx.width}px`;
          el.getContext("2d")!.drawImage(tx, 0, 0);
        }
      }
      const cx = heroX, cy = heroFeet - 108 * S;
      const be = t - bloomAt;
      const bloom = be >= 0 && be < 0.9 ? (be < 0.3 ? 0.3 + 1.15 * easeOut(be / 0.3) : 1.45 - 0.45 * easeOut((be - 0.3) / 0.6)) : 1;
      const beat = 0.5 + 0.5 * Math.sin((t * TAU) / 1.4);
      // light rays
      const rs = 500 * S * (0.96 + 0.08 * beat) * bloom;
      const rr = raysEl.width / 2;
      raysEl.style.opacity = `${aura * (vt === 1 ? 0.75 : 0.7)}`;
      raysEl.style.transform = `translate(${cx - rr}px, ${cy - rr}px) rotate(${(t * TAU) / (vt === 3 ? 6 : vt === 2 ? 9 : 14)}rad) scale(${rs / raysEl.width})`;
      // the aura
      const pulse = vt === 1 ? 0.94 + 0.12 * beat : 1;
      const k = (300 * S * pulse * bloom) / auraEl.width;
      const ar = auraEl.width / 2;
      auraEl.style.opacity = `${aura * (vt === 1 ? 0.8 + 0.2 * beat : 0.95)}`;
      auraEl.style.transform = `translate(${cx - ar}px, ${cy - ar}px) scale(${k}, ${1.12 * k})${vt >= 2 ? ` rotate(${(t * TAU) / (vt === 3 ? 1.6 : 3)}rad)` : ""}`;
      if (!auraShown) raysEl.style.visibility = auraEl.style.visibility = "visible";
      auraShown = true;
    };
    // The caught word's warm glow is added onto everything under it (canvas "lighter"), the painting included, which
    // is a DOM layer now: so the glow is one too, summed the same way (mix-blend-mode: plus-lighter), only while the
    // word is up.
    /** An impact's flash: a warm white light from the hit, gone in 260 ms. A DOM layer the compositor fades (a
     *  full-stage gradient on the canvas each frame, "screen"-blended, was the biggest raster spike of a hit). */
    const flashEl = flashRef.current!;
    const flash = (x: number, y: number, a: number) => {
      flashEl.style.background = `radial-gradient(circle 700px at ${Math.round(x)}px ${Math.round(y)}px, rgba(255,250,230,0.64), rgba(255,250,230,0.32) 37%, rgba(255,250,230,0.112))`;
      flashEl.animate([{ opacity: Math.min(1, a / 0.32) }, { opacity: 0 }], { duration: 260, easing: "linear" });
    };
    const haloEl = haloRef.current!;
    let haloOn = false;
    const placeHalo = (h: { x: number; y: number; rx: number; ry: number; a: number } | null) => {
      if (!h) {
        if (haloOn) haloEl.classList.remove("on");
        haloOn = false;
        return;
      }
      haloEl.style.opacity = `${h.a}`;
      haloEl.style.transform = `translate(${h.x - 100}px, ${h.y - 100}px) scale(${h.rx / 100}, ${h.ry / 100})`;
      if (!haloOn) haloEl.classList.add("on");
      haloOn = true;
    };
    const drawPowerCircle = () => {
      const vt = visTier;
      const high = clamp01((GROUND - hs.y) / 320);
      const se = t - slamAt;
      const slam = se >= 0 && se < 0.6 ? (se < 0.24 ? 0.5 + 1.2 * easeOut(se / 0.24) : 1.7 - 0.7 * easeOut((se - 0.24) / 0.36)) : 1;
      const s = (0.96 + 0.09 * (0.5 + 0.5 * Math.sin((t * TAU) / 1.4))) * slam * (1 - high * 0.25);
      g.save();
      g.globalAlpha = aura * (1 - high * 0.5);
      g.translate(hs.x, GROUND + 6);
      g.scale(s * S, s * S);
      g.drawImage(circleSprite(vt), -150, -55);
      g.restore();
    };
    const drawRibbon = () => {
      if (ribbon.length < 3) return;
      // every other knot, the newest always (half the strokes; the round joins keep it smooth)
      const knots = ribbon.filter((_, i) => (ribbon.length - 1 - i) % 2 === 0);
      if (knots.length < 3) return;
      const pts = knots.map((p) => ({ x: p.x - (t - p.t) * speed, y: p.y, a: 1 - (t - p.t) / 0.34 }));
      const cols = visTier >= 3 ? RAINBOW : ["#ff7aa2", "#b48cff", "#5ec8f2"];
      g.save();
      g.lineCap = "round";
      g.lineJoin = "round";
      for (let pass = 0; pass < 2; pass++)
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i];
          const k = b.a;
          g.globalAlpha = aura * k * (pass ? 0.95 : 0.4);
          g.strokeStyle = pass ? mixCols(cols, (1 - k) * (visTier >= 3 ? 1 : 0.999), visTier >= 3) : INK;
          g.lineWidth = 5 + 22 * k + (pass ? 0 : 7);
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.lineTo(b.x, b.y);
          g.stroke();
        }
      g.restore();
    };
    const drawGhosts = () => {
      const vs = Math.max(speed, 320);
      for (const gh of ghosts) {
        const age = t - gh.t;
        if (age < 0.05) continue;
        const { i, w, h, left } = heroGeom(gh.pose);
        const c = tinted(i, w, h, visTier >= 3 ? "g3" : "g2");
        if (!c) continue;
        g.save();
        g.globalAlpha = aura * 0.5 * (1 - age / 0.3);
        const x = gh.x - age * vs * 0.7;
        // an afterimage of a flip or spin turns with it; otherwise it is drawn upright, 1:1 on whole pixels (the cheap
        // blit: the running wobble is invisible in a fading silhouette)
        if (Math.abs(gh.rot) > 0.12) withBody(x, gh.feet, gh.rot, gh.sx, gh.sy, () => g.drawImage(c, left, -h, w, h));
        else g.drawImage(c, Math.round(x + left), Math.round(gh.feet - c.height));
        g.restore();
      }
    };
    const drawSpeedLines = () => {
      g.save();
      g.lineCap = "round";
      g.strokeStyle = "#fffdf6";
      g.lineWidth = 4;
      for (const s of speedLines) {
        const e = t - s.t0;
        const x = s.x - e * 1500;
        g.globalAlpha = aura * 0.6 * (1 - e / 0.28);
        g.beginPath();
        g.moveTo(x, s.y);
        g.lineTo(x + s.len, s.y);
        g.stroke();
      }
      g.restore();
    };
    const drawOrbit = (front: boolean) => {
      const cx = heroX, cy = heroFeet - HW * 0.46;
      for (let k = 0; k < 9; k++) {
        const a = (t * TAU) / 2.4 + (k * TAU) / 9;
        const s = Math.sin(a);
        if (s > 0 !== front) continue;
        const x = cx + Math.cos(a) * HW * 0.7, y = cy + s * HW * 0.16;
        const sz = 34 * (1 + 0.35 * s);
        g.save();
        g.globalAlpha = aura * (0.7 + 0.3 * s);
        g.drawImage(orbitDot(RAINBOW[k % 6]), x - sz, y - sz, sz * 2, sz * 2);
        g.restore();
      }
    };
    const drawSparkles = () => {
      const vt = visTier;
      const n = vt >= 3 ? 14 : vt === 2 ? 11 : 7;
      for (let i = 0; i < n; i++) {
        const s = SPARKS[i];
        const ph = ((t + s.d) % 2.4) / 2.4;
        const al = ph < 0.15 ? ph / 0.15 : ph > 0.8 ? (1 - ph) / 0.2 : 1;
        const x = hs.x + s.l * HW * 1.3;
        const y = heroFeet - 10 - ph * HW * 1.35;
        const col = vt >= 3 ? ["#ff8a8a", "#9fe3ff", "#fff6c8", "#a6f0a6", "#d8c2ff", "#ffe94a"][i % 6] : vt === 2 ? (i % 2 ? "#ffd1e8" : "#9fe3ff") : i % 3 ? "#fff6c8" : "#ffc53d";
        g.save();
        g.globalAlpha = aura * al;
        const d = 22 * s.s;
        g.drawImage(glowDot(`rgba(${GLOW_RGB[vt]},0.8)`), x - d, y - d, d * 2, d * 2);
        g.fillStyle = col;
        star4(x, y, 26 * s.s, ph * Math.PI);
        g.restore();
      }
    };
    const drawFlames = (cx: number, base: number) => {
      const n = Math.min(10, streak.n);
      const tier = glow;
      const flame = (x: number, y: number, size: number, cols: string[], glow: string, rot: number, sx: number, sy: number, alpha: number) => {
        g.save();
        g.globalAlpha = alpha;
        // (a flicker of scale, and a lean only when it is big enough to see: a rotated draw is the slow path)
        g.translate(x, y);
        if (Math.abs(rot) > 0.06) g.rotate(rot);
        g.scale((sx * size) / 40 / FLAME_K, (sy * size) / 40 / FLAME_K);
        g.drawImage(flameSprite(cols, glow === FLAME_GLOW[0] ? "" : glow), -(20 + FLAME_PAD) * FLAME_K, -(50 + FLAME_PAD) * FLAME_K);
        g.restore();
      };
      const row = (count: number, i: number) => {
        const gap = count > 8 ? 25 : count > 5 ? 29 : 33;
        const x = (i - (count - 1) / 2) * gap;
        const half = Math.max(1, ((count - 1) / 2) * gap);
        return { x, y: -10 * (1 - (x / half) ** 2) };
      };
      if (n > 0) {
        const size = tier >= 3 ? 40 : tier >= 1 ? 36 : 28;
        const set = FLAME_COLS[tier];
        for (let i = 0; i < n; i++) {
          const p = row(n, i);
          const age = t - (flameBirth[i] ?? -9);
          const pop = age < 0.45 ? (age < 0.27 ? 1.35 * easeOut(age / 0.27) : 1.35 - 0.35 * easeOut((age - 0.27) / 0.18)) : 1;
          const fl = Math.sin(((t + ((i * 0.17) % 0.46)) * TAU) / 0.92);
          flame(cx + p.x * (tier === 0 ? 0.85 : 1), base + p.y, size * pop, set[i % set.length], FLAME_GLOW[tier], fl * 5 * DEG, 1 + 0.06 * fl, 1 - 0.055 * fl, flameA);
        }
      } else if (puff) {
        const e = t - puff.t0;
        if (e > 0.6) puff = null;
        else
          for (let i = 0; i < puff.n; i++) {
            const p = row(puff.n, i);
            const q = e / 0.6;
            flame(cx + p.x, base + p.y - 30 * easeOut(q), 30 * (q < 0.4 ? 1 + 0.3 * (q / 0.4) : 1.3 - 1.1 * ((q - 0.4) / 0.6)), ["#c9c2bb", "#e8e2dc", "#fbf8f4"], FLAME_GLOW[0], 0, 1, 1, (1 - q) * flameA);
          }
      }
    };
    const drawThought = (x: number, y: number) => {
      if (!mv || mv.kind !== "think") return;
      const e = t - mv.t0;
      const d = DUR.think;
      const s = e < 0.16 ? 0.3 + 0.78 * easeOut(e / 0.16) : e < 0.26 ? 1.08 - 0.08 * ((e - 0.16) / 0.1) : 1;
      const al = e > d - 0.2 ? (d - e) / 0.2 : Math.min(1, e / 0.1);
      g.save();
      g.globalAlpha = clamp01(al);
      g.translate(x, y);
      g.scale(s, s);
      g.fillStyle = "#fffdf6";
      g.strokeStyle = INK;
      g.lineWidth = 5;
      // up and behind the head (the lanterns are in front), bubbles leading down to it
      for (const [bx, by, r] of [[30, 44, 8], [18, 30, 12]] as const) {
        g.beginPath();
        g.arc(bx, by, r, 0, TAU);
        g.fill();
        g.stroke();
      }
      g.beginPath();
      g.ellipse(-22, -1, 46, 37, 0, 0, TAU);
      g.fillStyle = "rgba(43,29,20,.35)";
      g.fill();
      g.beginPath();
      g.ellipse(-22, -6, 46, 37, 0, 0, TAU);
      g.fillStyle = "#fffdf6";
      g.fill();
      g.stroke();
      g.translate(-22, -4);
      g.rotate(Math.sin(e * 7) * 8 * DEG);
      g.font = "52px 'Luckiest Guy'";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.lineWidth = 6;
      g.strokeText("?", 0, 4);
      g.fillStyle = "#ffc53d";
      g.fillText("?", 0, 4);
      g.restore();
    };
    /** What glows behind the ninja, under its aura (on the lower canvas): the power circle and the speed lines. */
    const drawNinjaUnder = () => {
      const lit = aura > 0.02;
      if (lit) drawPowerCircle();
      if (lit && visTier >= 2) drawSpeedLines();
    };
    /** ...and over the aura (placeAura), behind the ninja: the ribbon, afterimages, the back of the ring, its shadow. */
    const drawNinjaBack = () => {
      const lit = aura > 0.02;
      if (lit && visTier >= 2) {
        drawRibbon();
        drawGhosts();
      }
      if (lit && visTier >= 3) drawOrbit(false);
      // shadow on the ground
      g.save();
      g.globalAlpha = 0.35;
      g.fillStyle = INK;
      g.beginPath();
      g.ellipse(hs.x, GROUND + 4, Math.max(20, 60 * S - (GROUND - hs.y) / 8), 12, 0, 0, TAU);
      g.fill();
      g.restore();
    };
    /** The ninja, with a rim of light on a streak, and its flames and thoughts. */
    const drawNinjaFront = () => {
      const lit = aura > 0.02;
      const { i, w, h, left } = heroGeom(cur.pose);
      withBody(heroX, heroFeet, heroRot, heroSx, heroSy, () => {
        const kind: TintKind = visTier >= 3 ? "t3" : visTier === 2 ? "t2" : "t1";
        // on a streak: the rim of light and the ninja baked into one sprite (one draw a frame, not two); while the aura
        // fades in or out, the rim is drawn under the ninja at the aura's strength
        const lc = lit && aura > 0.97 ? litHero(i, w, h, kind) : null;
        if (lc) return void g.drawImage(lc, left + w / 2 - lc.width / 2, -h / 2 - lc.height / 2);
        if (lit) {
          const c = tinted(i, w, h, kind);
          if (c) {
            const k = RIM_K;
            g.save();
            g.globalAlpha = aura * RIM_ALPHA;
            g.translate(left + w / 2, -h * 0.5);
            g.scale(k, k);
            g.drawImage(c, -w / 2 - GLOW_PAD, -h / 2 - GLOW_PAD);
            g.restore();
          }
        }
        const sp = heroSprite(i, w, h);
        if (sp) g.drawImage(sp, left, -h, w, h);
      });
      if (lit && visTier >= 3) drawOrbit(true);
      if (lit) drawSparkles();
      // never up into the progress bar (y 48-76): above a high ninja they sit lower, beside its head
      drawFlames(heroX + 6 * S, Math.max(150, heroFeet - 236 * S));
      if (hs.y > GROUND - 250) drawThought(heroX - 60, Math.max(160, heroFeet - 262 * S)); // once it's back down
      
    };

    // ---- canvas effects
    const drawCfx = () => {
      for (let n = cfx.length - 1; n >= 0; n--) {
        const c = cfx[n];
        const e = t - c.t0;
        let live = true;
        g.save();
        if (c.k === "pow") {
          const p = e / 0.3;
          if (p >= 1) live = false;
          else if (p >= 0) {
            const sc = p < 0.25 ? 0.2 + 0.95 * (p / 0.25) : p < 0.55 ? 1.15 - 0.2 * ((p - 0.25) / 0.3) : 0.95 - 0.55 * ((p - 0.55) / 0.45);
            g.globalAlpha = p < 0.55 ? 1 : 1 - (p - 0.55) / 0.45;
            const poly = (pts: number[]) => {
              g.beginPath();
              for (let k = 0; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]);
              g.closePath();
            };
            // its drop shadow, 5 px down (a fill of its own: a canvas shadow is an extra layer pass)
            const k = (c.size / 100) * sc;
            g.save();
            g.translate(c.x, c.y + 5);
            g.rotate(c.rot);
            g.scale(k, k);
            poly(c.outer);
            g.fillStyle = "rgba(43,29,20,.35)";
            g.fill();
            g.restore();
            g.translate(c.x, c.y);
            g.rotate(c.rot);
            g.scale(k, k);
            poly(c.outer);
            if (c.tier >= 3) {
              const gr = g.createRadialGradient(0, 0, 0, 0, 0, 50);
              gr.addColorStop(0, "#fff");
              gr.addColorStop(0.35, "#ffe94a");
              gr.addColorStop(0.6, "#ff7aa2");
              gr.addColorStop(1, "#4ab8ff");
              g.fillStyle = gr;
            } else g.fillStyle = c.tier === 2 ? "#ffd1e3" : "#fff4dc";
            g.fill();
            g.strokeStyle = INK;
            g.lineWidth = 5;
            g.lineJoin = "round";
            g.stroke();
            poly(c.inner);
            g.fillStyle = c.tier >= 2 ? "#ffffff" : "#ffe38a";
            g.fill();
          }
        } else if (c.k === "slash") {
          const p = e / 0.28;
          if (p >= 1) live = false;
          else {
            const q = easeOut(e / 0.1);
            const x = c.x0 + (c.x1 - c.x0) * q, y = c.y0 + (c.y1 - c.y0) * q;
            const s = (c.size / 100) * (0.7 + 0.5 * q);
            g.globalAlpha = p < 0.5 ? 1 : 1 - (p - 0.5) / 0.5;
            g.translate(x, y);
            g.rotate(Math.atan2(c.y1 - c.y0, c.x1 - c.x0));
            g.scale(s, s);
            g.drawImage(slashSprite(c.tier), -31 - SLASH_PAD, -50 - SLASH_PAD, 62 + SLASH_PAD * 2, 100 + SLASH_PAD * 2);
          }
        } else if (c.k === "ribbon") {
          if (e >= c.dur * 1.5) live = false;
          else if (e >= 0) {
            const q = easeOut(e / c.dur);
            const a0 = c.from * DEG, a1 = (c.from + c.sweep * q) * DEG;
            g.globalAlpha = e < c.dur * 1.05 ? 1 : 1 - (e - c.dur * 1.05) / (c.dur * 0.45);
            g.translate(hs.x + 10, feet() - PIVOT + c.oy);
            g.scale(1, 1 - c.squash);
            const cols = c.tier >= 3 ? ["#ff5a5a", "#ffe94a", "#4ab8ff"] : c.tier === 2 ? ["#ff7aa2", "#b48cff", "#5ec8f2"] : ["#fff4dc", "#ffe38a", "#ffc53d"];
            const gr = g.createLinearGradient(-c.r, 0, c.r, 0);
            cols.forEach((col, k) => gr.addColorStop(k / 2, col));
            g.lineCap = "round";
            g.beginPath();
            g.arc(0, 0, c.r, a0, a1, c.sweep < 0);
            g.strokeStyle = "rgba(43,29,20,.55)";
            g.lineWidth = 30;
            g.stroke();
            g.strokeStyle = gr;
            g.lineWidth = 22;
            g.stroke();
          }
        } else if (c.k === "piece") {
          if (e > c.life || !ok(c.im)) live = e <= c.life;
          else {
            const x = c.x + c.vx * e, y = c.y + c.vy * e + (c.g ?? 900) * e * e;
            if (x > W + 200 || y > H + 200) live = false;
            else {
              const w = c.w, h = (c.im.naturalHeight / c.im.naturalWidth) * w;
              g.globalAlpha = clamp01((c.life - e) / 0.3);
              g.translate(x, y);
              g.rotate(c.vr * e);
              if (c.half) {
                g.beginPath();
                g.rect(c.half < 0 ? -w / 2 : 0, -h / 2 - 4, w / 2, h + 8);
                g.clip();
              }
              g.drawImage(c.im, -w / 2, -h / 2, w, h);
            }
          }
        } else if (c.k === "orb") {
          // the spell: a glowing sphere swells on the lantern and bursts inside a spinning magic circle
          if (e >= 0.55) live = false;
          else {
            const [c0, c1] = ORB[c.tier];
            const r = e < 0.16 ? 66 * backOut(e / 0.16) : 66 * (1 - easeIn((e - 0.16) / 0.22));
            g.translate(c.x, c.y);
            const R = 70 + 90 * easeOut(e / 0.55);
            g.globalAlpha = 1 - clamp01((e - 0.25) / 0.3);
            g.rotate(e * 5);
            g.lineWidth = 7;
            g.strokeStyle = INK;
            g.setLineDash([18, 12]);
            g.beginPath();
            g.arc(0, 0, R, 0, TAU);
            g.stroke();
            g.lineWidth = 4;
            g.strokeStyle = c1;
            g.stroke();
            g.setLineDash([]);
            g.fillStyle = c0;
            for (let k = 0; k < 6; k++) {
              const a = (k / 6) * TAU;
              g.save();
              g.fillStyle = c.tier >= 3 ? RAINBOW[k] : k % 2 ? c0 : c1;
              star4(Math.cos(a) * R, Math.sin(a) * R, 30, -e * 8);
              g.restore();
            }
            g.globalAlpha = 1;
            if (r > 1) {
              // the sphere, its glow baked (orbSprite), drawn at its size now
              const k = r / ORB_R;
              g.drawImage(orbSprite(c.tier), -(ORB_R + ORB_PAD) * k, -(ORB_R + ORB_PAD) * k, (ORB_R + ORB_PAD) * 2 * k, (ORB_R + ORB_PAD) * 2 * k);
              g.strokeStyle = "#ffffff";
              g.lineWidth = 5;
              g.lineCap = "round";
              g.beginPath();
              g.arc(0, 0, r * 1.2, -e * 22, -e * 22 + 1.6);
              g.stroke();
            }
          }
        }
        g.restore();
        if (!live) cfx.splice(n, 1);
      }
    };
    /** Where the caught word is now: it rises from its lantern to rest under the progress bar (640, 166), clear of the
     *  impact burst; drops REMIND_DROP while a reminder's petal stands above one of its spellings (and rises back); and
     *  goes into the progress bar at the end (`q`: how far, 0–1; -1 before). */
    const REMIND_DROP = 116;
    const trophyGeom = (tr: Trophy) => {
      const e = Math.max(0, t - tr.t0);
      const tx = 640, ty = 166;
      const k = easeOut(e / 0.38);
      let x = tr.x0 + (tx - tr.x0) * k;
      let y = tr.y0 + (ty - tr.y0) * k - Math.sin(k * Math.PI) * 70;
      let s = 1 + 0.25 * backOut(e / 0.5);
      let a = 1, q = -1;
      if (tr.low != null) y += REMIND_DROP * (tr.rise != null ? 1 - easeInOut((t - tr.rise) / 0.3) : easeOut((t - tr.low) / 0.3));
      if (tr.leave != null) {
        q = clamp01((t - tr.leave) / 0.42);
        x = tx;
        y = ty + (40 - ty) * easeIn(q);
        s *= 1 - 0.8 * easeIn(q);
        a = 1 - 0.3 * q;
      }
      return { x, y, s, a, q };
    };
    /** Where the caught word's spelling `i` is on the stage (the lit tile's box). */
    const segRect = (tr: Trophy, i: number) => {
      const { x, y, s } = trophyGeom(tr);
      const ws = segWidths(tr.w.segs);
      const tw = ws.reduce((a, b) => a + b, 0);
      const wx = tr.mode === "read" && I.pics[tr.w.text] ? -(150 + 18 + tw + 48) / 2 + 168 + (tw + 48) / 2 : 0;
      const x0 = wx - tw / 2 + ws.slice(0, i).reduce((a, b) => a + b, 0);
      return { x: x + x0 * s, y: y - 35 * s, w: (ws[i] ?? 40) * s, h: 70 * s };
    };
    const drawTrophy = () => {
      const tr = trophy!;
      const { x, y, s, a, q } = trophyGeom(tr);
      if (q >= 1) {
        // into the progress bar
        fx.twinkle(640, 40, COLS[Math.max(1, glow) as Tier], 12, 6);
        sfx.twinkle();
        trophy = null;
        placeHalo(null);
        return;
      }
      // a warm glow behind it (added onto the painting: a DOM layer, as the painting is no longer on the canvas)
      const gr = 150 + (tr.all ? 40 : 0) + Math.sin(t * 6) * 8;
      placeHalo({ x, y, rx: gr * s * (tr.mode === "read" ? 1.5 : 1), ry: gr * s, a: a * (tr.all ? 0.55 : 0.35) });
      g.save();
      g.globalAlpha = a;
      g.translate(x, y);
      g.scale(s, s);
      // "read": the picture the child caught, beside the word it goes with
      let wx = 0;
      if (tr.mode === "read" && I.pics[tr.w.text]) {
        const pw = segWidths(tr.w.segs).reduce((a, b) => a + b, 0) + 48;
        const total = 150 + 18 + pw;
        wx = -total / 2 + 168 + pw / 2;
        picPlate(tr.w.text, -total / 2 + 75, -60);
      }
      wordPlate(tr.w.segs, wx, 0, tr.lit, tr.all);
      g.restore();
    };

    /** The pointing hand tapping at `tip` (`ph` 0–1 through one tap): pulled back, pressed, and a ring pops out. It
     *  points down and to the left (the play area), or to the left (`side`: at a lantern, from its right, so the hand
     *  never reaches up under the question's banner). */
    const drawTapHand = (tip: Pt, ph: number, side = false) => {
      const dir = side ? { x: -1, y: 0 } : { x: -0.5, y: 0.866 };
      const pull = ph < 0.45 ? 34 * easeOut(ph / 0.45) : ph < 0.6 ? 34 * (1 - easeIn((ph - 0.45) / 0.15)) : 0;
      const alpha = Math.min(1, ph / 0.12, (1 - ph) / 0.12);
      if (ph > 0.6 && ph < 0.95) {
        // the tap: a ring pops out where the fingertip lands
        const r = (ph - 0.6) / 0.35;
        g.save();
        g.globalAlpha = alpha * (1 - r);
        g.strokeStyle = "#fffdf6";
        g.lineWidth = 7;
        g.beginPath();
        g.arc(tip.x + dir.x * 18, tip.y + dir.y * 18, 20 + 56 * easeOut(r), 0, TAU);
        g.stroke();
        g.restore();
      }
      g.save();
      g.globalAlpha = alpha;
      g.translate(tip.x - dir.x * pull, tip.y - dir.y * pull);
      g.rotate((side ? 270 : 210) * DEG);
      const k = 2.3 * (ph > 0.55 && ph < 0.7 ? 0.92 : 1);
      g.scale(k, k);
      g.translate(-31, -7);
      g.lineJoin = "round";
      // a soft light behind it so it reads on any sky (baked: 14 px of blur at the hand's usual 2.3×)
      const gl = glowOnly("hand", { w: 64, h: 64 }, 14 / 2.3, "rgba(255,250,225,0.95)", 2.3, (b) => {
        b.translate(-32, -32);
        b.fill(handPath());
      });
      g.drawImage(gl, 32 - gl.width / 4.6, 32 - gl.height / 4.6, gl.width / 2.3, gl.height / 2.3);
      g.fillStyle = "#ffffff";
      g.fill(handPath());
      g.strokeStyle = INK;
      g.lineWidth = 3.4;
      g.stroke(handPath());
      g.restore();
    };
    /** First word (and whenever a child seems stuck): a hand taps each lantern in turn, left to right, to show that a
     *  lantern can be tapped. It visits them all, so it never gives the answer away, except while the right one glows
     *  as a clue: then it taps that one. Gone at the first tap or jump.
     *  During the practice jump it taps the open play area ahead of the ninja ("Tap anywhere…"). */
    const drawHint = () => {
      if (tapHand >= 0) {
        const PER = 1.15;
        const e = Math.max(0, t - tapHand);
        return drawTapHand({ x: 700, y: 430 }, (e % PER) / PER);
      }
      if (touched || hintFrom < 0 || t < hintFrom || !current || hs.homing || finished) return;
      const all = lanterns.filter((l) => !l.popped && l.x - dist > 300 && l.x - dist < W - 150).sort((a, b) => a.x - b.x);
      // while the right one glows as a clue (a first run's "we do", Help's second press), the hand taps only that one
      const clue = glowFrom >= 0 && t >= glowFrom ? all.filter((l) => l.correct) : [];
      const live = clue.length ? clue : all;
      if (!live.length) return;
      const PER = 1.15;
      const e = t - hintFrom;
      const l = live[Math.floor(e / PER) % live.length];
      const bob = Math.sin(t * 2.5 + l.phase) * 10;
      // the fingertip on the lantern's right side, the hand off to its right, clear of the word below it and of the
      // banner above
      drawTapHand({ x: l.x - dist + 58, y: l.y - 14 + bob }, (e % PER) / PER, true);
    };
    /** A lantern at screen x `sx` (the string, the lantern, its word or picture plate), and its warm light when `lit`
     *  (0–1): the example lanterns, or (`clue`) the right one glowing as a clue. */
    const drawLanternAt = (sx: number, y: number, word: string | null, pic: boolean, lit: number, clue = false) => {
      if (lit > 0 && !clue) {
        // a warm light round it
        g.save();
        g.globalAlpha = lit;
        g.drawImage(glowDot("rgba(255,196,70,0.95)"), sx - 170, y - 190, 340, 340);
        g.restore();
      } else if (lit > 0) {
        // the clue: a wider light, a brighter heart and a soft ring swelling out of it every 1.2 s (it has to be plain
        // to a three-year-old on any sky)
        g.save();
        g.globalAlpha = lit;
        g.drawImage(glowDot("rgba(255,196,70,0.95)"), sx - 210, y - 230, 420, 420);
        g.globalAlpha = lit * 0.75;
        g.drawImage(glowDot("rgba(255,242,190,1)"), sx - 110, y - 130, 220, 220);
        const q = (t % 1.2) / 1.2;
        g.globalAlpha = lit * 0.8 * (1 - q);
        g.strokeStyle = "#fff6c8";
        g.lineWidth = 6;
        g.beginPath();
        g.arc(sx, y - 20, 74 + 70 * easeOut(q), 0, TAU);
        g.stroke();
        g.restore();
      }
      g.strokeStyle = INK;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(sx, 0);
      g.lineTo(sx, y - 70);
      g.stroke();
      drawSprite(I.lantern, sx, y + 50, 120);
      if (!word) return;
      if (pic) picPlate(word, sx, y + 30);
      else plate(word, sx, y + 90);
    };
    const drawLantern = (l: Lantern) => {
      const sx = l.x - dist;
      if (sx < -160 || sx > W + 160) return;
      let lift = 0;
      g.save();
      if (l.popped) {
        // the others float away
        if (l.gone == null || l.burst || t - l.gone > 0.6) {
          g.restore();
          return;
        }
        const e = t - l.gone;
        g.globalAlpha = 1 - e / 0.6;
        lift = -e * 80 - e * e * 500;
      }
      const bob = Math.sin(t * 2.5 + l.phase) * 10 + lift;
      // a tap before the sounds were said: a little "not yet" shake
      const we = l.wiggle != null ? t - l.wiggle : 9;
      if (we < 0.45) {
        const r = Math.sin(we * 40) * 9 * DEG * (1 - we / 0.45);
        g.translate(sx, 0);
        g.rotate(r);
        g.translate(-sx, 0);
      }
      // the clue: the right lantern glows (a first run's first group, 2 s after the question; Help's second press)
      const lit = l.correct && !l.popped && glowFrom >= 0 && t >= glowFrom ? Math.min(1, (t - glowFrom) / 0.4) * (0.72 + 0.28 * Math.sin((t - glowFrom) * 5)) : 0;
      drawLanternAt(sx, l.y + bob, l.word.text, mode === "read" && !!I.pics[l.word.text], lit, true);
      g.restore();
    };
    /** The two example lanterns ("When the lanterns come…"): they float in, lit, and drift up and away at the gun. */
    const drawDemos = () => {
      for (let i = demos.length - 1; i >= 0; i--) {
        const d = demos[i];
        const e = t - d.t0;
        if (e < 0) continue;
        const x = d.x0 + (d.x1 - d.x0) * easeOut(e / 1.8);
        let y = d.y + Math.sin(t * 2.5 + d.phase) * 10;
        let a = Math.min(1, e / 0.3);
        if (d.leave != null) {
          const q = t - d.leave;
          y -= q * 80 + q * q * 500;
          a *= 1 - q / 0.8;
          if (a <= 0) {
            demos.splice(i, 1);
            continue;
          }
        }
        g.save();
        g.globalAlpha = a;
        drawLanternAt(x, y, d.word, false, 0.8 + 0.2 * Math.sin(t * 3 + d.phase));
        g.restore();
      }
    };
    const draw = () => {
      drawScenery();
      // the lower canvas: what stands under the aura
      g = gUnder;
      g.setTransform(ck, 0, 0, ck, 0, 0);
      g.clearRect(0, 0, W, H);
      for (const th of things) {
        const sx = th.x - dist;
        if (sx < -120 || sx > W + 120 || th.kicked || (th.got && th.kind === "star")) continue;
        // a star bobs and turns gently on the track (Dec6: stars, not the rainbow teardrop)
        if (th.kind === "star") drawSprite(I.star, sx, th.y + 26 + Math.sin(t * 4 + th.x) * 5, 54, Math.sin(t * 2 + th.x) * 0.22);
        else drawSprite(th.kind === "crate" ? I.crate : I.spikes, sx, GROUND + 8, th.kind === "crate" ? 104 : 120, th.got && !th.flipped ? 0.2 : 0);
      }
      // Lanterns the child still has to read are drawn over the ninja, its flames, aura and "?" cloud (below), so no
      // streak decoration ever covers a word or picture in play. The one it is flying at, and the ones floating away,
      // go underneath. While it flies at a lantern the choice is made: the ninja goes over the others (its glow stays
      // underneath), so it never vanishes behind a nearer lantern on the way. The caught word is always on top.
      const behind = (l: Lantern) => l.popped || l === hs.homing;
      for (const l of lanterns) if (behind(l)) drawLantern(l);
      if (gongX !== null) {
        // BONG: the gong shudders and swells when kicked
        const ge = t - gongHitAt;
        const shudder = ge >= 0 && ge < 1.6 ? Math.sin(ge * 38) * 0.05 * Math.exp(-ge * 3) : 0;
        const swell = ge >= 0 && ge < 0.35 ? 1 + 0.1 * Math.sin((ge / 0.35) * Math.PI) : 1;
        drawSprite(I.gong, gongC(), GROUND + 8, 220 * swell, shudder);
      }
      drawNinjaUnder();
      placeAura();
      // the top canvas: the ninja and everything over it
      g = gTop;
      g.setTransform(ck, 0, 0, ck, 0, 0);
      g.clearRect(0, 0, W, H);
      drawNinjaBack();
      if (!hs.homing) drawNinjaFront();
      for (const l of lanterns) if (!behind(l)) drawLantern(l);
      if (hs.homing) drawNinjaFront();
      drawDemos();
      drawCfx();
      if (trophy) drawTrophy();
      else placeHalo(null);
      drawHint();
    };

    /** The frame loop sleeps (draws nothing, asks no rAF) while `napping` and nothing on the stage moves: the Ready hold. */
    let napping = false, napFrom = 0, asleep = false;
    const calm = () =>
      t - napFrom > 1 && !started && timers.length === 0 && cfx.length === 0 && !mv && freeze <= 0 && Math.abs(speed) < 0.5 && hs.y >= GROUND - 1 && hs.vy === 0 && !hs.homing && tapHand < 0;
    const wake = () => {
      if (!asleep || !alive) return;
      asleep = false;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    window.addEventListener("resize", wake); // (a resize clears the canvases: draw them again)
    function nap(on: boolean) {
      napping = on;
      napFrom = t;
      if (!on) wake();
    }
    const frame = (now: number) => {
      const real = Math.min(0.05, (now - last) / 1000) / ((window as any).__runSlow || 1);
      last = now;
      // the game waits while the phone is upright (the turn-your-phone picture covers it), and for a hit-stop
      const perf = (window as any).__runPerf as { ms: number; n: number; max: number; flush?: boolean } | undefined; // dev: frame cost
      const p0 = perf ? performance.now() : 0;
      if (!isUpright()) {
        if (FAST === 1) {
          if (freeze > 0) freeze -= real;
          else update(real);
        } else
          // the bots' fast-forward (?fast=N) runs the world N× too, as it does speech, timers and effects, in steps of at
          // most a frame so nothing is jumped over; otherwise a run's transcript shows its running N× longer than a
          // child ever waits
          for (let left = real * FAST, k = 0; left > 1e-4 && k < 16; k++) {
            const dt = Math.min(left, 1 / 60);
            left -= dt;
            if (freeze > 0) freeze -= dt;
            else update(dt);
          }
      }
      draw();
      if (perf?.flush) {
        // include the raster work, not only the JS
        gUnder.getImageData(0, 0, 1, 1);
        gTop.getImageData(0, 0, 1, 1);
      }
      if (perf) {
        const d = performance.now() - p0;
        perf.ms += d;
        perf.n++;
        perf.max = Math.max(perf.max, d);
      }
      if (napping && calm()) {
        asleep = true;
        return;
      }
      if (alive) raf = requestAnimationFrame(frame);
    };
    Promise.all([document.fonts.load("700 60px Andika"), document.fonts.load("52px 'Luckiest Guy'")]).finally(() => {
      last = performance.now();
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      void intro();
    });
    // fast and slow's lead-in for the first group, "I'll say it the slow way. You catch the whole word.": the tortoise
    // lights with it, then the rabbit on "whole word" (TEACHER_SCRIPT §9.4)
    const offClip = onClip((id, start, end) => {
      if (id === "tv_run_jump") jumpAsked = true;
      if (id === "tv_run_which" || (RUN_BLEND_CUES as readonly string[]).includes(id) || id === "tv_guess_q" || id === "tv_run_lanterns_how")
        heardAt.set(id, [...(heardAt.get(id) ?? []), t].slice(-4));
      if (id !== "tv_fs_run") return;
      navSpeed("slow");
      window.setTimeout(() => alive && navSpeed("fast"), (end - start) * FAST * 0.6);
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        api.current.jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      offStreak();
      offClip();
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", fitCanvas);
      window.removeEventListener("resize", wake);
      hush();
      // the run's canvases go now, not at some later GC (PERF 8.3: they kept about 12 MB for the rest of the session)
      dropTextures();
      for (const el of [far, land, under, c, raysEl, auraEl]) el.width = el.height = 0;
      // the dev and bot hooks close over this run (its canvases, its DOM and their listeners): let them go with it
      // (only if they are still this run's, never a newer Run's)
      const w = window as any;
      for (const [k, f] of Object.entries(hooks)) if (w[k] === f) delete w[k];
    };
  }, []);

  useHelp((n) => (window as any).__snRunHelp?.(n));
  // Hear it again: the speaker in the top bar (docs/NAVIGATION.md §3.1), while a word is being asked. The tortoise and
  // the rabbit (TEACHER_SCRIPT §9.6) sit under it, on the right, clear of the lanterns and the caught word
  useNav({ again: banner || jumpAsk ? () => api.current.repeat() : null, againAt: "own", speed: { at: SPEED_AT } });
  const onPointer = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    api.current.tapAt(x, y);
  };

  return (
    <div className="scene run-scene">
      <div className="run-scenery" aria-hidden="true">
        <canvas ref={farRef} className="run-far" width={0} height={0} />
        <canvas ref={landRef} className="run-land" width={0} height={0} />
      </div>
      <canvas ref={underRef} className="run-under" aria-hidden="true" />
      <div className="run-aura" aria-hidden="true">
        <canvas ref={raysRef} width={0} height={0} />
        <canvas ref={auraRef} width={0} height={0} />
        <div ref={haloRef} className="run-halo" />
      </div>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} onPointerDown={onPointer} />
      <div ref={flashRef} className="run-flash" aria-hidden="true" />
      <TopBar>
        <div className="spacer" />
        <Progress value={progress} />
        <div className="spacer" />
        {/* Hear it again, between the progress bar and the star counter (clear of the Home zone), for every word */}
        <div className="nav-d-topctl">{banner || jumpAsk ? <ReplayButton onReplay={() => api.current.repeat()} size={100} /> : <div style={{ width: 100 }} />}</div>
        {/* the stars caught on the track (Dec6, SD r41: a teardrop always means a sound, so the counter is stars) */}
        <div className="panel run-stars" data-stars={stars}>
          <img src={img("item_star")} alt="" />
          <span className="display">{stars}</span>
        </div>
      </TopBar>
      {/* a group's question: its sounds as neutral dots (the sounds are the question: no petals, Dec1); a reading
          group's word, its spellings (one lights while Sensei models it after a second miss) */}
      {banner?.mode === "blend" && (
        <div className="panel drop-in run-banner run-dots" data-fs-avoid>
          <SoundDots n={banner.segs.length} lit={dot} size={46} />
        </div>
      )}
      {banner?.mode === "read" && (
        <div className="panel drop-in run-banner" data-fs-avoid>
          {banner.segs.map((sg, i) => (
            <span key={i} className={i === dot ? "rb-seg lit" : "rb-seg"}>
              {sg.g}
            </span>
          ))}
        </div>
      )}
      {/* where a reminder's petal pops: moved over the caught word's lit spelling (the word is drawn on the canvas) */}
      <div ref={anchorRef} className="run-anchor" aria-hidden="true" />
      <NarrOverlay />
      <SenseiDock />
    </div>
  );
}
