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
// Explanations (docs/NARRATIVE_AUDIT.md, ./narrate.tsx): the cue before a word's sounds rotates between whole
// sentences after the first; the first reading cue in each land says "Ninjas read this way!" with an arrow under the
// word (F10); units 8-10 get a spaced "some sounds sit close together" reminder (F12); a caught word can bring a
// spaced "two letters, one sound" reminder with that spelling lit; the first catch of a save shows its gem filling.
// Navigation (docs/NAVIGATION.md §5.D): Home is the nav layer's (top-left). Hear it again is a speaker in the top bar,
// between the progress bar and the petal counter, for every word in both modes: it says the word's prompt again as it
// was said ("Ninja Run! Tap to jump..." on the first word, the cue, and the sounds; in reading mode the cue, with the
// arrow under the word again if "Ninjas read this way!" was said), and the ninja holds still while it plays.
import { useEffect, useRef, useState } from "react";
import type { LevelProps } from "../App";
import type { Seg, Word } from "../content/phonics";
import { levelWords, worldOf } from "../content/worlds";
import { LINES } from "../content/lines";
import { say, sayBlend, sfx, playMusic, preload, urls, hush, type Say } from "../engine/audio";
import { chooseWords, shuffle } from "../engine/learner";
import { recordRead } from "../engine/store";
import { streak, tierLineId, tierLineSaid, type Tier } from "../engine/streak";
import { img, Progress, fx, useHero, W, H, sleep, useHelp, SenseiDock, isUpright, shakeStage } from "../ui/ui";
import { poseSrc, poseFit, probePoses, type Pose } from "../ui/poses";
import { pickPraise } from "../engine/feedback";
import { adjacentSlots, adjacentUnit, gemSeg, rotate, RUN_BLEND_CUES } from "../content/narrative";
import { NarrOverlay, beginLevel, explainGemEnergy, heard as told, isDue, lettersReminder, sweepUnder, twoSoundsReminder } from "./narrate";
import { useNav, ReplayButton, TopBar } from "../ui/nav";
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
const LANTERN_Y = 252; // high enough that the caption bubble above Sensei (bottom-right) never covers a lantern
/** Running between words (px) after the praise: a breather with a crate or some petals, not a wait. */
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
type Thing = { x: number; kind: "crate" | "spikes" | "petal"; y: number; got?: boolean; kicked?: boolean; flipped?: boolean };
type Pt = { x: number; y: number };

// ---------------------------------------------------------------- moves
type Move = "kick" | "punch" | "spin" | "flip" | "cast" | "power" | "think" | "crate" | "gongkick" | "backflip" | "cheer" | "stumble";
const DUR: Record<Move, number> = { kick: 0.5, punch: 0.46, spin: 0.6, flip: 0.56, cast: 0.5, power: 0.95, think: 1.3, crate: 0.34, gongkick: 0.6, backflip: 0.6, cheer: 1.3, stumble: 0.62 };
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
  | { k: "flash"; x: number; y: number; t0: number; a: number }
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
  const [progress, setProgress] = useState(0);
  const [banner, setBanner] = useState<{ text: string; mode: "read" | "blend" } | null>(null);
  const [petals, setPetals] = useState(0);
  const api = useRef<{ jump: () => void; tapAt: (x: number, y: number) => void; repeat: () => unknown }>({ jump: () => {}, tapAt: () => {}, repeat: () => {} });

  useEffect(() => {
    playMusic("run");
    streak.reset();
    probePoses();
    const pool = levelWords(level);
    const targets = chooseWords(level, EVENTS, "read");
    preload(targets.map((w) => urls.word(w.text)));
    // Two canvases (docs/PERF.md fix 8): what stands under the ninja's aura (crates, spikes, petals, the lanterns it
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
      crate: im("item_crate"), spikes: im("item_spikes"), petal: im("item_petal"), lantern: im("item_lantern"), gong: im("item_gong"),
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
    const POSES: Pose[] = ["run", "jump", "hurt", "cheer", "kick", "punch", "spin", "flip", "power", "think", "ready", "cast"];
    POSES.forEach(poseImg);
    const ok = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;

    // ---- state
    let alive = true;
    let t = 0; // game time (stops while the phone is upright, and for a hit-stop)
    let dist = 0;
    let speed = 400;
    let targetSpeed = 400;
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
    let busy = false; // an event is running
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
    type Trophy = { w: Word; mode: "blend" | "read"; x0: number; y0: number; t0: number; lit: number; all: boolean; leave?: number };
    let trophy: Trophy | null = null;
    let ending: { phase: "fly" | "rebound" | "cheer" | "done"; t0: number; x0: number } | null = null;
    let gongHitAt = -9;
    let endSpoken = false;
    let doneCalled = false;
    const SPARKS = Array.from({ length: 14 }, () => ({ l: Math.random() * 1.1 - 0.55, d: Math.random() * 2.4, s: 0.6 + Math.random() * 0.7 }));

    const publish = () =>
      ((window as any).__snState = { scene: "run", event: eventIdx, of: EVENTS, mode, streak: streak.n, tier: streak.tier, glow, gong: gongX !== null, finished });
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
        if (k === cueN) cueDone = heard = true;
      }
    };
    // the cue before a word's sounds, rotating after the first (run_blend was said 39 times in one journey)
    let lastCue: string | null = null;
    // this word's prompt as it was said, for Hear it again (and whether it swept the arrow under the word)
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
        // "Keep going, ninja!" opens Sensei's correction (catchLantern), so the sounds are the last thing the child hears
        if (e.prevN >= 3) sfx.fizzle();
      }
    });
    glow = streak.tier; // a streak carried over from the last level (streak.reset() above ran before this listener)

    // obstacles & petals ahead
    const spawnStuff = (fromX: number, toX: number) => {
      for (let x = fromX; x < toX; x += 420 + Math.random() * 380) {
        const r = Math.random();
        if (r < 0.35) things.push({ x, kind: Math.random() < 0.6 ? "crate" : "spikes", y: GROUND });
        else for (let k = 0; k < 4; k++) things.push({ x: x + k * 70, kind: "petal", y: GROUND - 120 - Math.sin((k / 3) * Math.PI) * 120 });
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
    const startEvent = async () => {
      if (eventIdx >= EVENTS) return placeGong();
      busy = true;
      helped = false;
      touched = false;
      hintFrom = -1;
      const w = targets[eventIdx];
      current = w;
      mode = eventIdx % 2 === 0 || !w.pic ? "blend" : "read";
      if (mode === "read") {
        const withPics = pool.filter((x) => x.pic);
        if (withPics.length < 3) mode = "blend";
      }
      publish();
      const n = level.world === 1 ? 1 : 2; // beginners: two lanterns, not three moving choices
      const others = mode === "blend" ? similar(w, pool, n) : similar(w, pool.filter((x) => x.pic && x.text !== w.text), n);
      const opts = shuffle([w, ...others]);
      eventMisses = 0;
      heard = false;
      // The group spawns off screen so that it always runs in the same distance (APPROACH) before it has arrived.
      const sp = opts.length >= 3 ? SPACING[3] : SPACING[2];
      const zoneStart = dist + LAST_IN + APPROACH - (opts.length - 1) * sp;
      // Clear the lantern zone, and any crate or spikes that would still be in front of the ninja once the lanterns have
      // arrived (they'd sit there while it stops to listen). Those are behind Sensei's corner or off screen by now.
      things = things.filter((th) =>
        th.kind === "petal" ? th.x < zoneStart - 200 || th.x > zoneStart + 1400 : th.x < dist + HX - 90 + APPROACH || th.x > zoneStart + 1400,
      );
      lanterns = opts.map((o, i) => ({ x: zoneStart + i * sp, y: LANTERN_Y + (mode === "read" ? 14 : 0) + (i % 2) * 24, word: o, correct: o === w, popped: false, phase: Math.random() * 6 }));
      allInAt = -1;
      if (mode === "blend") {
        setBanner({ text: "", mode });
        const line = eventIdx === 0 ? "run_blend" : rotate(RUN_BLEND_CUES, lastCue);
        lastCue = line;
        // units 8-10: "some sounds sit close together", spaced (NARRATIVE_AUDIT F12)
        const adj = !!adjUnit && adjacentSlots(w.segs).length > 1 && isDue("adjacent:remind", "concept");
        const lead: Say[] = [...(eventIdx === 0 ? [{ line: "run_start" }, { gap: 300 }] : []), ...(adj ? [{ line: "audit_neighbours_short" }, { gap: 300 }] : []), { line: line }];
        prompted = { parts: [lead, { sounds: w.segs, gap: 330 }], sweep: false };
        const said = await cue(prompted.parts);
        if (said && adj) told("adjacent:remind");
      } else {
        setBanner({ text: w.text, mode });
        // the first reading in each land: "Ninjas read this way!", with an arrow under the word (NARRATIVE_AUDIT F10)
        const ltrKey = `left-right:w${level.world}`;
        const ltr = isDue(ltrKey, "once");
        if (ltr) window.setTimeout(() => void sweepUnder(document.querySelector(".run-banner")), 350);
        prompted = { parts: [[...(ltr ? [{ line: "fm_l2_way" }, { gap: 350 }] : []), { line: "run_read" }]], sweep: ltr };
        const said = await cue(prompted.parts);
        if (said && ltr) told(ltrKey);
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
      if (tier >= 2 || kind === "boom") cfx.push({ k: "flash", x: p.x, y: p.y, t0: t, a: 0.16 + tier * 0.04 });
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
      fx.burst(sx, ly, "petals", 22);
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
        cfx.push({ k: "flash", x: p.x, y: p.y, t0: t, a: 0.32 });
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

    const catchLantern = async (l: Lantern) => {
      if (l.popped || !current || ending) return;
      l.popped = true;
      const w = current;
      if (l.correct) {
        if (eventMisses === 0) firstTry++;
        recordRead(w, eventMisses === 0);
        cueN++; // whatever Sensei was saying about this word is over
        cueDone = true;
        catching = true;
        const hit = eventMisses === 0 && !helped ? streak.hit() : null;
        catching = false;
        strikeLantern(l);
        const bob = Math.sin(t * 2.5 + l.phase) * 10;
        trophy = { w, mode, x0: Math.min(W - 170, l.x - dist), y0: l.y + 90 + bob, t0: t + 0.04, lit: -1, all: false };
        setBanner(null);
        current = null;
        // a beat for the impact while the word rises clear of it, then Sensei blends it as each spelling lights up
        await sleep(280);
        await sayBlend(w.segs, w.text, (i) => {
          if (!trophy || trophy.w !== w) return;
          if (i < 0) (trophy.all = true), (trophy.lit = -1);
          else trophy.lit = i;
        });
        // a spaced reminder about one of its spellings, with that spelling lit ("It's two letters, but it's one sound.")
        const remind = twoSoundsReminder(w.segs) ?? lettersReminder(w.segs);
        if (remind && trophy && trophy.w === w) {
          trophy.all = false;
          trophy.lit = remind.i;
          if (await say([{ gap: 200 }, ...remind.say])) remind.done();
          if (trophy && trophy.w === w) {
            trophy.lit = -1;
            trophy.all = true;
          }
        }
        // Crossing into a tier: the streak line is the praise ("Ninja power!"), and the ninja powers up as it's said.
        const line = hit?.tierUp ? tierLineId(hit.tier) : null;
        if (hit?.tierUp) pendingPower = { at: t, tier: hit.tier };
        const praised = await say({ line: line && hasLine(line) ? line : pickPraise() });
        tierLineSaid(line, praised);
        // the first time right answers fill a gem (once per save): it pops up, and fills, while the word is still up
        if (eventIdx === 0) {
          holding = true;
          await explainGemEnergy(gemSeg(w, level.teach), { x: 1010, y: 196 }, () => alive); // (right of the word, which rests at 640, 166)
          holding = false;
        }
        if (trophy && trophy.w === w) trophy.leave = t;
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
        recordRead(w, false);
        const miss = streak.miss();
        sfx.wrong();
        l.gone = t;
        const sx = l.x - dist;
        fx.puff(sx, l.y + 40, 10);
        fx.burst(sx, l.y + 40, "dust", 10);
        hopBack();
        startMove("think");
        thinkUntil = t + DUR.think;
        after(0.22, () => sfx.hmm());
        // specific: "(Keep going, ninja!) That's c-o-t, cot. Listen: c-a-t." The ninja holds still until it's said, and
        // the right sounds are the last thing the child hears before choosing again.
        const lost = miss.prevN >= 3 && hasLine("streak_lost") ? [{ line: "streak_lost" }, { gap: 200 }] : [];
        await cue([[...lost, { line: "that_says" }, { sounds: l.word.segs, gap: 200 }, { word: l.word.text }, { gap: 250 }, { line: "listen" }, ...(mode === "blend" ? [{ sounds: w.segs, gap: 300 }] : [{ word: w.text }])]], { reveal: true });
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
      fx.rain("petals", 60);
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
    (window as any).__snRun = (wrong?: boolean, far?: boolean) => {
      const c = lanterns.filter((l) => l.correct === !wrong && !l.popped && l.x - dist < W - 150);
      const l = far ? c[c.length - 1] : c[0];
      const fly = !!l && !finished && l !== hs.homing;
      if (fly) flyAt(l);
      // `flew`: the lantern's word when this call sent the ninja (a child's tap on it), for the transcript's tap log
      return { busy, eventIdx, finished, x: l ? Math.round(l.x - dist) : null, flew: fly ? l.word.text : null };
    };
    // dev (filming): where the lanterns are, and whether Sensei's prompt is still playing
    (window as any).__runLanterns = () => ({ cueDone, lanterns: lanterns.map((l) => ({ x: Math.round(l.x - dist), y: l.y, word: l.word.text, correct: l.correct, popped: l.popped })) });
    (window as any).__snRunHelp = (n: number) => {
      if (!current) return say({ line: "help_run" });
      if (n === 1) return cue(mode === "blend" ? [[{ line: "run_blend" }, { sounds: current.segs, gap: 330 }]] : [[{ line: "run_read" }]]);
      if (n === 2) return say({ line: "help_run" });
      // biggest clue: the ninja flies to the right lantern (one still coming in is pulled to it)
      const l = lanterns.find((l) => l.correct && !l.popped && l.x - dist < W + 240);
      say({ line: "help_look" });
      if (l) {
        helped = true;
        autoAir = false;
        flyAt(l);
      }
    };
    api.current.repeat = () => {
      if (!current || !prompted) return;
      if (prompted.sweep) window.setTimeout(() => void sweepUnder(document.querySelector(".run-banner")), 350);
      return cue(prompted.parts);
    };
    api.current.jump = () => {
      if (finished) return;
      if (hintFrom >= 0) hintFrom = Math.max(hintFrom, t + 2.5); // busy jumping: the hint waits for a pause
      if (hs.jumps < 2 && !hs.homing) {
        back = null;
        autoAir = false;
        hs.vy = JUMP_V * (hs.jumps ? 0.85 : 1);
        hs.jumps++;
        sfx.jump();
        if (hs.jumps === 1) fx.burst(hs.x, GROUND, "dust", 6);
      }
    };
    api.current.tapAt = (x, y) => {
      if (finished) return;
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
    const plate = (text: string, cx: number, cy: number) => {
      g.font = "700 54px Andika";
      const tw = g.measureText(text).width;
      const w = tw + 40,
        h = 72;
      g.fillStyle = "#fff4dc";
      g.strokeStyle = INK;
      g.lineWidth = 5;
      g.beginPath();
      g.roundRect(cx - w / 2, cy - h / 2, w, h, 16);
      g.fill();
      g.stroke();
      g.fillStyle = INK;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(text, cx, cy + 2);
    };
    /** The caught word, spelling by spelling; `lit` lights the spelling whose sound is being said. */
    const wordPlate = (segs: Seg[], cx: number, cy: number, lit: number, all: boolean) => {
      g.font = "700 60px Andika";
      g.textAlign = "center";
      g.textBaseline = "middle";
      const ws = segs.map((s) => Math.max(40, g.measureText(s.g).width + 10));
      const tw = ws.reduce((a, b) => a + b, 0);
      const w = tw + 48, h = 84;
      g.save();
      if (all) {
        // its warm glow, baked (the plate is drawn at about 1.25×: the blur is in plate units, so it looks as it did)
        const rw = Math.round(w);
        const gl = glowOnly(`plate${rw}`, { w: rw, h }, 28 / 1.25, "rgba(255,190,60,0.95)", 1, (b) => {
          b.beginPath();
          b.roundRect(-rw / 2, -h / 2, rw, h, 18);
          b.fill();
        });
        g.drawImage(gl, cx - gl.width / 2, cy - gl.height / 2);
      }
      g.fillStyle = all ? "#fff1b8" : "#fff4dc";
      g.strokeStyle = INK;
      g.lineWidth = 5;
      g.beginPath();
      g.roundRect(cx - w / 2, cy - h / 2, w, h, 18);
      g.fill();
      g.stroke();
      g.restore();
      let x = cx - tw / 2;
      segs.forEach((s, i) => {
        const on = i === lit;
        const mid = x + ws[i] / 2;
        if (on) {
          g.save();
          g.fillStyle = "#ffc53d";
          g.strokeStyle = INK;
          g.lineWidth = 3.5;
          g.beginPath();
          g.roundRect(x + 1, cy - 35, ws[i] - 2, 70, 12);
          g.fill();
          g.stroke();
          g.restore();
        }
        g.save();
        g.translate(mid, cy + 2 - (on ? 3 : 0));
        if (on) g.scale(1.14, 1.14);
        g.fillStyle = INK;
        g.fillText(s.g, 0, 0);
        g.restore();
        x += ws[i];
      });
    };
    const star4 = (x: number, y: number, s: number, rot: number) => {
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
    };

    // ---- the ninja: pose and body motion for this frame
    const lookNow = (): Look => {
      const air = hs.y < GROUND - 2 || !!hs.homing || ending?.phase === "fly";
      // stopped to listen (the world holds while Sensei gives the sounds): a bouncy fighting stance, ready to jump
      const L: Look = { pose: air ? "jump" : speed < 60 && !finished ? "ready" : "run", rot: 0, sx: 1, sy: 1, dx: 0, dy: 0 };
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
      targetSpeed = finished || thinking || holding ? 0
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
      if (!busy && !finished && gongX === null && dist > nextEventAt) startEvent();
      if (gongX !== null && !ending) {
        const d = gongC() - hs.x;
        if ((d < 430 && hs.y >= GROUND - 2 && !hs.homing) || d < 240) startEnding();
      }
      if (ending?.phase === "done" && endSpoken && !doneCalled) {
        doneCalled = true;
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
        if (th.kind === "petal") {
          if (Math.abs(th.y - (hs.y - BODY)) < 90) {
            th.got = true;
            collected++;
            setPetals(collected);
            sfx.coin();
            fx.burst(sx, th.y, "sparks", 6);
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
            if (current) void cue([mode === "blend" ? [{ line: "listen_again" }, { sounds: current.segs, gap: 330 }] : [{ line: "run_catch" }, { gap: 450 }, { word: current.text }]]);
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
        if (t - lastGhost > 0.05) {
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
      const pts = ribbon.map((p) => ({ x: p.x - (t - p.t) * speed, y: p.y, a: 1 - (t - p.t) / 0.34 }));
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
        withBody(gh.x - age * vs * 0.7, gh.feet, gh.rot, gh.sx, gh.sy, () => g.drawImage(c, left, -h, w, h));
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
        g.drawImage(glowDot(RAINBOW[k % 6]), x - sz, y - sz, sz * 2, sz * 2);
        g.fillStyle = "#fff";
        g.beginPath();
        g.arc(x, y, 5 * (1 + 0.3 * s), 0, TAU);
        g.fill();
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
        g.translate(x, y);
        g.rotate(rot);
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
        if (lit) {
          const c = tinted(i, w, h, visTier >= 3 ? "t3" : visTier === 2 ? "t2" : "t1");
          if (c) {
            const k = 1.05;
            g.save();
            g.globalAlpha = aura * (0.78 + 0.22 * Math.sin((t * TAU) / 1.4));
            g.translate(left + w / 2, -h * 0.5);
            g.scale(k, k);
            g.drawImage(c, -w / 2 - GLOW_PAD, -h / 2 - GLOW_PAD);
            g.restore();
          }
        }
        if (ok(i)) g.drawImage(i, left, -h, w, h);
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
            g.translate(c.x, c.y);
            g.rotate(c.rot);
            g.scale((c.size / 100) * sc, (c.size / 100) * sc);
            const poly = (pts: number[]) => {
              g.beginPath();
              for (let k = 0; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]);
              g.closePath();
            };
            g.shadowColor = "rgba(43,29,20,.35)";
            g.shadowOffsetY = 5;
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
            g.shadowColor = "transparent";
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
            g.translate(-31, -50);
            let fill: CanvasGradient;
            if (c.tier >= 3) {
              fill = g.createLinearGradient(0, 0, 0, 100);
              RAINBOW.forEach((col, k) => fill.addColorStop(k / 5, col));
            } else {
              fill = g.createLinearGradient(0, 0, 62, 0);
              fill.addColorStop(0, "#fff");
              fill.addColorStop(0.5, c.tier === 2 ? "#ffd1e3" : "#fff4dc");
              fill.addColorStop(1, c.tier === 2 ? "#ff7aa2" : "#ffc53d");
            }
            g.shadowColor = "rgba(255,240,190,.9)";
            g.shadowBlur = 12;
            g.fillStyle = fill;
            g.fill(slashPath());
            g.shadowBlur = 0;
            g.strokeStyle = INK;
            g.lineWidth = 4.5;
            g.lineJoin = "round";
            g.stroke(slashPath());
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
        } else if (c.k === "flash") {
          const p = e / 0.26;
          if (p >= 1) live = false;
          else {
            g.globalCompositeOperation = "screen";
            g.globalAlpha = 1 - p;
            const gr = g.createRadialGradient(c.x, c.y, 0, c.x, c.y, 700);
            gr.addColorStop(0, `rgba(255,250,230,${Math.min(1, c.a * 2)})`);
            gr.addColorStop(0.37, `rgba(255,250,230,${c.a})`);
            gr.addColorStop(1, `rgba(255,250,230,${c.a * 0.35})`);
            g.fillStyle = gr;
            g.fillRect(0, 0, W, H);
          }
        } else if (c.k === "orb") {
          // the spell: a glowing sphere swells on the lantern and bursts inside a spinning magic circle
          if (e >= 0.55) live = false;
          else {
            const [c0, c1, c2] = ORB[c.tier];
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
              const gr = g.createRadialGradient(-r * 0.3, -r * 0.34, 0, 0, 0, r);
              gr.addColorStop(0, "#ffffff");
              gr.addColorStop(0.18, c0);
              gr.addColorStop(0.55, c1);
              gr.addColorStop(1, c2);
              g.shadowColor = c1;
              g.shadowBlur = 30;
              g.fillStyle = gr;
              g.beginPath();
              g.arc(0, 0, r, 0, TAU);
              g.fill();
              g.shadowBlur = 0;
              g.strokeStyle = INK;
              g.lineWidth = 4;
              g.stroke();
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
    const drawTrophy = () => {
      const tr = trophy!;
      const e = Math.max(0, t - tr.t0);
      const tx = 640, ty = 166; // high, under the progress bar: clear of the impact burst at the lantern it came out of
      const k = easeOut(e / 0.38);
      let x = tr.x0 + (tx - tr.x0) * k;
      let y = tr.y0 + (ty - tr.y0) * k - Math.sin(k * Math.PI) * 70;
      let s = 1 + 0.25 * backOut(e / 0.5);
      let a = 1;
      if (tr.leave != null) {
        // into the progress bar
        const q = clamp01((t - tr.leave) / 0.42);
        x = tx;
        y = ty + (40 - ty) * easeIn(q);
        s *= 1 - 0.8 * easeIn(q);
        a = 1 - 0.3 * q;
        if (q >= 1) {
          fx.twinkle(640, 40, COLS[Math.max(1, glow) as Tier], 12, 6);
          sfx.twinkle();
          trophy = null;
          placeHalo(null);
          return;
        }
      }
      // a warm glow behind it (added onto the painting: a DOM layer, as the painting is no longer on the canvas)
      const gr = 150 + (tr.all ? 40 : 0) + Math.sin(t * 6) * 8;
      placeHalo({ x, y, rx: gr * s * (tr.mode === "read" ? 1.5 : 1), ry: gr * s, a: a * (tr.all ? 0.55 : 0.35) });
      g.save();
      g.globalAlpha = a;
      g.translate(x, y);
      g.scale(s, s);
      // "read": the picture the child caught, beside the word it goes with
      const p = tr.mode === "read" ? I.pics[tr.w.text] : undefined;
      let wx = 0;
      if (p) {
        g.font = "700 60px Andika";
        const pw = tr.w.segs.reduce((a, sg) => a + Math.max(40, g.measureText(sg.g).width + 10), 0) + 48;
        const total = 150 + 18 + pw;
        const cx = -total / 2 + 75;
        wx = -total / 2 + 168 + pw / 2;
        g.fillStyle = "#fff4dc";
        g.strokeStyle = INK;
        g.lineWidth = 5;
        g.beginPath();
        g.roundRect(cx - 75, -64, 150, 128, 20);
        g.fill();
        g.stroke();
        if (ok(p)) {
          const sc = Math.min(130 / p.naturalWidth, 112 / p.naturalHeight);
          g.drawImage(p, cx - (p.naturalWidth * sc) / 2, -(p.naturalHeight * sc) / 2, p.naturalWidth * sc, p.naturalHeight * sc);
        }
      }
      wordPlate(tr.w.segs, wx, 0, tr.lit, tr.all);
      g.restore();
    };

    /** First word (and whenever a child seems stuck): a hand taps each lantern in turn, left to right, to show that a
     *  lantern can be tapped. It visits them all, so it never gives the answer away. Gone at the first tap or jump. */
    const drawHint = () => {
      if (touched || hintFrom < 0 || t < hintFrom || !current || hs.homing || finished) return;
      const live = lanterns.filter((l) => !l.popped && l.x - dist > 300 && l.x - dist < W - 150).sort((a, b) => a.x - b.x);
      if (!live.length) return;
      const PER = 1.15;
      const e = t - hintFrom;
      const l = live[Math.floor(e / PER) % live.length];
      const ph = (e % PER) / PER;
      const bob = Math.sin(t * 2.5 + l.phase) * 10;
      // the fingertip on the lantern's upper right, the hand up and away from the word below it, pointing down-left
      const tip = { x: l.x - dist + 30, y: l.y - 12 + bob };
      const dir = { x: -0.5, y: 0.866 };
      const pull = ph < 0.45 ? 34 * easeOut(ph / 0.45) : ph < 0.6 ? 34 * (1 - easeIn((ph - 0.45) / 0.15)) : 0;
      const alpha = Math.min(1, ph / 0.12, (1 - ph) / 0.12);
      if (ph > 0.6 && ph < 0.95) {
        // the tap: a ring pops out of the lantern
        const r = (ph - 0.6) / 0.35;
        g.save();
        g.globalAlpha = alpha * (1 - r);
        g.strokeStyle = "#fffdf6";
        g.lineWidth = 7;
        g.beginPath();
        g.arc(tip.x - 8, tip.y + 16, 20 + 56 * easeOut(r), 0, TAU);
        g.stroke();
        g.restore();
      }
      g.save();
      g.globalAlpha = alpha;
      g.translate(tip.x - dir.x * pull, tip.y - dir.y * pull);
      g.rotate(210 * DEG);
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
      g.strokeStyle = INK;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(sx, 0);
      g.lineTo(sx, l.y - 70 + bob);
      g.stroke();
      drawSprite(I.lantern, sx, l.y + 50 + bob, 120);
      if (mode === "blend" || !I.pics[l.word.text]) plate(l.word.text, sx, l.y + 90 + bob);
      else {
        const p = I.pics[l.word.text];
        g.fillStyle = "#fff4dc";
        g.strokeStyle = INK;
        g.lineWidth = 5;
        g.beginPath();
        g.roundRect(sx - 70, l.y + 30 + bob, 140, 120, 18);
        g.fill();
        g.stroke();
        if (ok(p)) {
          const s = Math.min(120 / p.naturalWidth, 104 / p.naturalHeight);
          g.drawImage(p, sx - (p.naturalWidth * s) / 2, l.y + 38 + bob, p.naturalWidth * s, p.naturalHeight * s);
        }
      }
      g.restore();
    };
    const draw = () => {
      drawScenery();
      // the lower canvas: what stands under the aura
      g = gUnder;
      g.setTransform(ck, 0, 0, ck, 0, 0);
      g.clearRect(0, 0, W, H);
      for (const th of things) {
        const sx = th.x - dist;
        if (sx < -120 || sx > W + 120 || th.kicked || (th.got && th.kind === "petal")) continue;
        if (th.kind === "petal") drawSprite(I.petal, sx, th.y + 25 + Math.sin(t * 4 + th.x) * 5, 52, Math.sin(t * 2 + th.x) * 0.3);
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
      drawCfx();
      if (trophy) drawTrophy();
      else placeHalo(null);
      drawHint();
    };

    const frame = (now: number) => {
      const real = Math.min(0.05, (now - last) / 1000) / ((window as any).__runSlow || 1);
      last = now;
      // the game waits while the phone is upright (the turn-your-phone picture covers it), and for a hit-stop
      const perf = (window as any).__runPerf as { ms: number; n: number; max: number; flush?: boolean } | undefined; // dev: frame cost
      const p0 = perf ? performance.now() : 0;
      if (!isUpright()) {
        if (freeze > 0) freeze -= real;
        else update(real);
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
      if (alive) raf = requestAnimationFrame(frame);
    };
    Promise.all([document.fonts.load("700 60px Andika"), document.fonts.load("52px 'Luckiest Guy'")]).finally(() => {
      last = performance.now();
      if (alive) raf = requestAnimationFrame(frame);
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
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", fitCanvas);
      hush();
      // the run's canvases go now, not at some later GC (PERF 8.3: they kept about 12 MB for the rest of the session)
      dropTextures();
      for (const el of [far, land, under, c, raysEl, auraEl]) el.width = el.height = 0;
    };
  }, []);

  useHelp((n) => (window as any).__snRunHelp?.(n));
  // Hear it again: the speaker in the top bar (docs/NAVIGATION.md §3.1), while a word is being asked
  useNav({ again: banner ? () => api.current.repeat() : null, againAt: "own" });
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
      <TopBar>
        <div className="spacer" />
        <Progress value={progress} />
        <div className="spacer" />
        {/* Hear it again, between the progress bar and the petal counter (clear of the Home zone), for every word */}
        <div className="nav-d-topctl">{banner ? <ReplayButton onReplay={() => api.current.repeat()} size={100} /> : <div style={{ width: 100 }} />}</div>
        <div className="panel" style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 16px 4px 8px", borderRadius: 40 }}>
          <img src={img("item_petal")} alt="" style={{ width: 44 }} />
          <span className="display" style={{ fontSize: 34 }}>{petals}</span>
        </div>
      </TopBar>
      {banner?.mode === "read" && <div className="panel drop-in run-banner">{banner.text}</div>}
      <NarrOverlay />
      <SenseiDock />
    </div>
  );
}
