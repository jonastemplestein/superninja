// The player's ninja: <NinjaSpot/> stands in the ninja zone (bottom-left, stage x 0-330, y 380-720) on every level,
// breathing and ready. The `ninja` controller makes it move: kicks, punches, spins, spells, shuriken, leaps and flips,
// each with anticipation, squash and stretch, a hit-stop, an effect that travels to the target, and an impact burst.
// It also wears the answer streak (src/engine/streak.ts): flames over its head, a glowing aura, tier-up power-ups.
// See docs/HERO.md for the API and how each level type should use it.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { fx, fxDom, img, stageRect, useHero, shakeStage, setFxSpeed } from "./ui";
import { sfx, say, isSpeaking, onCaption } from "../engine/audio";
import { LINES } from "../content/lines";
import { FAST } from "../engine/fast";
import { streak, useStreak, TIER_AT, type Tier, type StreakEvent } from "../engine/streak";
import { poseSrc, poseFit, probePoses, usePoseVersion, BASE_POSES, FALLBACK, type Pose } from "./poses";

export type Move = "kick" | "punch" | "spin" | "cast" | "throw" | "jump" | "flip" | "cheer" | "think" | "hurt" | "power";
export const MOVES: Move[] = ["kick", "punch", "spin", "cast", "throw", "jump", "flip", "cheer", "think", "hurt", "power"];
export type Pt = { x: number; y: number };
export type Target = Element | Pt | null | undefined;
export interface StrikeOpts {
  /** force a particular move instead of the streak-based choice */
  move?: Move;
  /** squash-and-flash the target element on impact (default true) */
  react?: boolean;
  /** teaching speech follows at once: no whooshes, kiai, booms, landing thuds or screen shake, just one soft tink as
   *  it lands, so the move never masks the word Sensei is modelling */
  soft?: boolean;
  /** a point the main projectile passes near (the control point of its curve), e.g. high above a row of answers so
   *  it never crosses a wrong one */
  via?: Pt;
}
export type { Pose };

// ---------------------------------------------------------------- time
let slow = 1; // the demo's slow motion
const rate = () => FAST / slow;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms * slow)); // setTimeout is already FAST-scaled

// ---------------------------------------------------------------- the mounted spot
interface Spot {
  root: HTMLDivElement;
  body: HTMLDivElement;
  img: HTMLImageElement;
  rim: HTMLDivElement;
  shadow: HTMLDivElement;
  hero: string;
  size: number;
  rest: Pose;
}
let spot: Spot | null = null;
let restOverride: Pose | null = null;
let lastMoveAt = 0;
const restPose = (): Pose => restOverride ?? (spot && spot.rest !== "idle" ? spot.rest : streak.tier >= 1 ? "ready" : "idle");

function setPose(p: Pose) {
  const s = spot;
  if (!s) return;
  const src = poseSrc(s.hero, p);
  const f = poseFit(s.hero, p);
  const w = s.size * f.scale;
  const left = s.size * (0.5 + f.dx) - w / 2;
  if (s.img.getAttribute("src") !== src) s.img.setAttribute("src", src);
  s.img.style.width = `${w}px`;
  s.img.style.left = `${left}px`;
  s.rim.style.width = `${w}px`;
  s.rim.style.height = `${w * f.aspect}px`;
  s.rim.style.left = `${left}px`;
  s.rim.style.setProperty("-webkit-mask-image", `url(${src})`);
  s.rim.style.setProperty("mask-image", `url(${src})`);
  s.root.dataset.pose = p;
}

// ---------------------------------------------------------------- geometry (stage coordinates)
/** The ninja's feet line: x = left edge of the idle sprite, y = feet, w = idle width. */
function geo() {
  const s = spot;
  if (s && s.root.isConnected) {
    const r = stageRect(s.root);
    if (r.w > 0) return { x: r.x, y: r.y + r.h, w: s.size };
  }
  return { x: 40, y: 702, w: 250 };
}
/** A point on the ninja: fx = fraction of its width from the left, fy = fraction of its width above the feet. */
function at(fxw: number, fyw: number, dx = 0, dy = 0): Pt {
  const g = geo();
  return { x: g.x + g.w * fxw + dx, y: g.y - g.w * fyw + dy };
}
const HAND = [0.9, 0.8] as const;
const CAST_HANDS = [0.86, 0.74] as const;
const FOOT = [1.0, 0.5] as const;
const CENTRE = [0.5, 0.66] as const;
const HEAD = [0.54, 1.1] as const;

function pointOf(t: Target): Pt {
  if (!t) return { x: 780, y: 380 };
  if (t instanceof Element) {
    const r = stageRect(t);
    if (!r.w && !r.h) return { x: 780, y: 380 };
    // big things (a monster, a chest) get hit on the side facing the ninja
    return { x: r.x + r.w * (r.w > 260 ? 0.38 : 0.5), y: r.y + r.h * (r.h > 260 ? 0.45 : 0.5) };
  }
  return t;
}

// ---------------------------------------------------------------- colours per streak tier
const COLS: Record<Tier, string[]> = {
  0: ["#fff4dc", "#ffe38a", "#ffc53d"],
  1: ["#ffe38a", "#ffc53d", "#ff9a3d", "#fff4dc"],
  2: ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"],
  3: ["#ff5a5a", "#ffb03d", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"],
};
/** A shockwave ring's colour: never red (red means "wrong" everywhere else in the game). */
const ringCol = (tier: Tier) => (tier >= 3 ? "#ffe38a" : COLS[tier][0]);

/** How a move is played: react = squash the target on impact; soft = teaching follows (see StrikeOpts). */
interface Ctx {
  react: boolean;
  soft: boolean;
  via?: Pt;
}
/** The move's sound effects: all of them, or (soft) none; a soft impact still makes one gentle tink. */
const MUTED: Record<string, () => void> = new Proxy({}, { get: () => () => {} });
const snd = (o: Ctx) => (o.soft ? MUTED : sfx);

// ---------------------------------------------------------------- a move in progress
class Run {
  timers: number[] = [];
  must: { go: () => void; skip?: () => void }[] = [];
  anims: Animation[] = [];
  done = false;
  /** the NinjaSpot went away (quit to the map): nothing more lands, flies or makes a sound */
  cancelled = false;
  /** which NinjaSpot mount this move belongs to (see spotGen) */
  gen = spotGen;
  /** cancelled, or its NinjaSpot has gone (a move interrupted earlier whose effect is still in flight) */
  get dead() {
    return this.cancelled || this.gen !== spotGen;
  }
  /** an idle fidget (a hop or a stance bounce), not a real move */
  idle = false;
  private resolveEnd!: () => void;
  end = new Promise<void>((r) => (this.resolveEnd = r));
  /** Schedule fn at ms. `must` callbacks (launching the effect a promise waits for) run at once if interrupted by
   *  another move; if the ninja is unmounted instead, `skip` runs (it settles the promise without launching). */
  at(ms: number, fn: () => void, must = false, skip?: () => void) {
    let ran = false;
    const go = () => {
      if (ran) return;
      ran = true;
      fn();
    };
    this.timers.push(window.setTimeout(() => (!this.done || must) && !this.dead && go(), ms * slow));
    if (must) this.must.push({ go, skip: () => void (!ran && ((ran = true), skip?.())) });
  }
  /** Interrupted by the next move: the effects already promised still launch. */
  stop() {
    if (this.done) return;
    this.done = true;
    this.timers.forEach(clearTimeout);
    this.must.forEach((m) => m.go());
    this.anims.forEach((a) => a.cancel());
    this.resolveEnd();
  }
  /** The ninja left the screen: stop everything, launch nothing, and settle every promise. */
  cancel() {
    this.cancelled = true;
    this.timers.forEach(clearTimeout);
    this.must.forEach((m) => m.skip?.());
    this.anims.forEach((a) => a.cancel());
    this.done = true;
    this.resolveEnd();
  }
  finish() {
    this.done = true;
    this.resolveEnd();
  }
}
let cur: Run | null = null;
/** Bumped each time a NinjaSpot unmounts: every move started before then is dead. */
let spotGen = 0;
let blendFrom: string | null = null;
function begin(): Run {
  blendFrom = null;
  if (cur && !cur.done && spot) {
    const t = getComputedStyle(spot.body).transform;
    if (t && t !== "none") blendFrom = t;
  }
  cur?.stop();
  // a new move ends a "hm?" at once: its thought cloud goes with it
  spot?.root.querySelectorAll(".nj-thought").forEach((el) => el.remove());
  const r = new Run();
  cur = r;
  lastMoveAt = performance.now();
  return r;
}

/** One body keyframe: [ms, x, y, rotate°, scaleX, scaleY, easing of the segment that starts here]. */
type KF = [number, number, number, number, number, number, string?];
const SNAP = "cubic-bezier(.15,.85,.25,1.15)";
const IN = "cubic-bezier(.55,0,.85,.4)";
function play(run: Run, total: number, keys: KF[]) {
  const s = spot;
  if (!s) {
    run.at(total, () => run.finish());
    return;
  }
  const C = s.size * 0.62; // spins and flips turn around the tummy, squashes happen at the feet
  const tf = (k: KF) => `translate(${k[1]}px, ${k[2]}px) translateY(${-C}px) rotate(${k[3]}deg) translateY(${C}px) scale(${k[4]}, ${k[5]})`;
  const frames: Keyframe[] = keys.map((k) => ({ offset: k[0] / total, transform: tf(k), easing: k[6] ?? "ease-in-out" }));
  if (blendFrom) frames[0].transform = blendFrom;
  const a = s.body.animate(frames, { duration: total });
  a.playbackRate = rate();
  run.anims.push(a);
  const sh = s.shadow.animate(
    keys.map((k) => ({ offset: k[0] / total, transform: `translateX(${k[1] * 0.7}px) scale(${Math.max(0.4, 1 + k[2] / 240)})`, opacity: Math.max(0.3, 1 + k[2] / 260), easing: k[6] ?? "ease-in-out" })),
    { duration: total },
  );
  sh.playbackRate = rate();
  run.anims.push(sh);
  // the streak flames ride along (translation only, so they stay upright in flips)
  const fl = s.root.querySelector(".nj-flames");
  if (fl) {
    const f = fl.animate(keys.map((k) => ({ offset: k[0] / total, translate: `${k[1] * 0.9}px ${k[2] * 0.75}px`, easing: k[6] ?? "ease-in-out" })) as Keyframe[], { duration: total });
    f.playbackRate = rate();
    run.anims.push(f);
  }
  a.finished.then(
    () => {
      if (cur === run) setPose(restPose());
      run.finish();
    },
    () => {},
  );
}
/** A one-shot CSS flare on the spot (the aura's bloom, the power circle's slam); the class comes off afterwards, so
 *  the tier's own looping animation carries on. */
function flare(cls: string, ms: number) {
  const r = spot?.root;
  if (!r) return;
  r.classList.remove(cls);
  void r.offsetWidth;
  r.classList.add(cls);
  window.setTimeout(() => r.classList.remove(cls), ms * slow + 50); // (setTimeout is already FAST-scaled)
}
/** Swap the pose at ms; pass restPose itself (not its value) for the resting pose as it is then. */
const poseAt = (run: Run, ms: number, p: Pose | (() => Pose)) => run.at(ms, () => setPose(typeof p === "function" ? p() : p));

// ---------------------------------------------------------------- DOM effects
function layer() {
  return fxDom();
}
/** Every effect element the ninja has put on the fx layer, so leaving the screen can clear what is still in flight. */
const owned = new Set<HTMLElement>();
function node(cls: string, w: number, h: number, html = ""): HTMLDivElement {
  const d = document.createElement("div");
  d.className = cls;
  d.style.width = `${w}px`;
  d.style.height = `${h}px`;
  d.innerHTML = html;
  layer()?.appendChild(d);
  if (owned.size > 120) owned.forEach((e) => !e.isConnected && owned.delete(e));
  owned.add(d);
  return d;
}
function animate(el: Element, frames: Keyframe[], ms: number, o: KeyframeAnimationOptions = {}) {
  const a = el.animate(frames, { duration: ms, fill: "forwards", ...o });
  a.playbackRate = rate();
  return a;
}
function place(el: HTMLElement, p: Pt, w: number, h: number, extra = "") {
  el.style.transform = `translate(${p.x - w / 2}px, ${p.y - h / 2}px) ${extra}`;
}
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });

/** Fly an effect element from a to b along an arc. Resolves on arrival (and removes it unless keep). */
function fly(
  el: HTMLElement, a: Pt, b: Pt, ms: number,
  o: { arc?: number; via?: Pt; spin?: number; orient?: boolean; ease?: (t: number) => number; scale?: (t: number) => number; onFrame?: (p: Pt, t: number) => void; keep?: boolean } = {},
): Promise<void> {
  const w = el.offsetWidth || parseFloat(el.style.width), h = el.offsetHeight || parseFloat(el.style.height);
  const c = o.via ?? { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - (o.arc ?? 60) };
  const ease = o.ease ?? ((t: number) => t);
  return new Promise((resolve) => {
    const t0 = performance.now();
    let finished = false;
    const end = () => {
      if (finished) return;
      finished = true;
      if (!o.keep) el.remove();
      resolve();
    };
    const guard = window.setTimeout(end, ms * slow + 400);
    const frame = (now: number) => {
      if (finished) return;
      if (!el.isConnected) return end(); // cleared (the ninja left the screen)
      const t = Math.min(1, ((now - t0) * rate()) / ms);
      const e = ease(t);
      const p = bez(a, c, b, e);
      let rot = (o.spin ?? 0) * t;
      if (o.orient) {
        const q = bez(a, c, b, Math.min(1, e + 0.02));
        const r = bez(a, c, b, Math.max(0, e - 0.02));
        rot += (Math.atan2(q.y - r.y, q.x - r.x) * 180) / Math.PI;
      }
      place(el, p, w, h, `rotate(${rot}deg) scale(${o.scale ? o.scale(t) : 1})`);
      o.onFrame?.(p, t);
      if (t >= 1) {
        clearTimeout(guard);
        end();
      } else requestAnimationFrame(frame);
    };
    place(el, a, w, h, "scale(0.2)");
    requestAnimationFrame(frame);
  });
}

function starPoints(n: number, r1: number, r2: number, jitter = 0.12) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = (i % 2 ? r2 : r1) * (1 + (Math.random() - 0.5) * jitter * 2);
    pts.push(`${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}
/** The comic-book impact star. */
function pow(p: Pt, tier: Tier, size = 190) {
  const s = size * (1 + tier * 0.14);
  const fill = tier >= 3 ? "url(#pow-rainbow)" : tier === 2 ? "#ffd1e3" : "#fff4dc";
  const core = tier >= 2 ? "#ffffff" : "#ffe38a";
  const el = node(
    "fx-pow", s, s,
    `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="pow-rainbow"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffe94a"/><stop offset=".6" stop-color="#ff7aa2"/><stop offset="1" stop-color="#4ab8ff"/></radialGradient></defs>` +
      `<polygon points="${starPoints(11, 48, 26)}" fill="${fill}" stroke="#2b1d14" stroke-width="5" stroke-linejoin="round"/>` +
      `<polygon points="${starPoints(9, 26, 14, 0.2)}" fill="${core}"/></svg>`,
  );
  const r = Math.random() * 60 - 30;
  place(el, p, s, s);
  const base = `translate(${p.x - s / 2}px, ${p.y - s / 2}px) rotate(${r}deg)`;
  animate(
    el,
    [
      { transform: `${base} scale(.2)`, opacity: 1 },
      { transform: `${base} scale(1.15)`, opacity: 1, offset: 0.25 },
      { transform: `${base} scale(.95)`, opacity: 1, offset: 0.55 },
      { transform: `${base} scale(.4)`, opacity: 0 },
    ],
    300,
    { easing: "ease-out" },
  ).finished.then(() => el.remove());
}
function flash(alpha = 0.35, color = "255,250,230", at?: Pt) {
  const el = node("fx-flash", 1280, 720);
  const c = at ?? { x: 640, y: 360 };
  el.style.background = `radial-gradient(circle at ${c.x}px ${c.y}px, rgba(${color},${Math.min(1, alpha * 2)}) 0, rgba(${color},${alpha}) 260px, rgba(${color},${alpha * 0.35}) 700px)`;
  animate(el, [{ opacity: 1 }, { opacity: 0 }], 260, { easing: "ease-out" }).finished.then(() => el.remove());
}
/** Squash-and-flash whatever got hit. */
function reactTo(el: Element, tier: Tier) {
  try {
    const a = el.animate(
      [
        { scale: "1", filter: "brightness(1)" },
        { scale: `${1.16 + tier * 0.03} ${0.86 - tier * 0.02}`, filter: "brightness(1.8)", offset: 0.18 },
        { scale: "0.93 1.08", filter: "brightness(1.2)", offset: 0.45 },
        { scale: "1.03 0.97", offset: 0.7 },
        { scale: "1", filter: "brightness(1)" },
      ] as Keyframe[],
      { duration: 440, easing: "ease-out" },
    );
    a.playbackRate = rate();
  } catch {}
}
type Hit = "hit" | "magic" | "tink" | "star" | "boom";
function impact(run: Run, p: Pt, kind: Hit, tier: Tier, target: Target, o: Ctx) {
  if (run.dead) return;
  const cols = COLS[tier];
  pow(p, tier, kind === "tink" ? 150 : kind === "boom" ? 240 : 190);
  fx.ring(p.x, p.y, { color: ringCol(tier), r1: 110 + tier * 32, width: 14 });
  if (tier >= 1 || kind === "boom") fx.ring(p.x, p.y, { color: cols[1 % cols.length], r1: 170 + tier * 36, width: 9, life: 30 });
  fx.lines(p.x, p.y, 8 + tier * 2, "#fff4dc", 60 + tier * 12);
  fx.twinkle(p.x, p.y, cols, 8 + tier * 4, 7 + tier * 1.5);
  if (kind === "magic" || tier >= 2) fx.glow(p.x, p.y, cols, 12 + tier * 4, 56, 5, 30);
  if (kind === "star" || tier >= 1) fx.burst(p.x, p.y, "stars", 5 + tier * 3, 0.9);
  if (o.soft) sfx.tink();
  else if (kind === "hit") sfx.thwack();
  else if (kind === "magic") sfx.sparkle();
  else if (kind === "tink") sfx.tink();
  else if (kind === "star") (sfx.twinkle(), sfx.thwack());
  else sfx.boom();
  if (o.react && target instanceof Element) reactTo(target, tier);
  if (!o.soft && tier >= 2 && (kind === "hit" || kind === "boom")) shakeStage();
  if (tier >= 2 || kind === "boom") flash(0.16 + tier * 0.04, "255,250,230", p);
}

/** A lesser hit on the way to the final one (the first jab, the first shuriken). */
function minor(run: Run, p: Pt, tier: Tier, o: Ctx, big = false) {
  if (run.dead) return;
  if (!o.soft) (big ? sfx.thwack : sfx.tink)();
  fx.twinkle(p.x, p.y, COLS[tier], 6, 6);
  if (big) pow(p, tier, 120);
}

// projectile makers
function shuriken(size: number) {
  return node("fx-shuriken", size, size, `<img src="${img("item_shuriken")}" alt="" draggable="false">`);
}
function orb(tier: Tier, size: number) {
  return node(`fx-orb t${tier}`, size, size, `<i></i><b></b>`);
}
function wave(tier: Tier, size: number) {
  const fill = tier >= 3 ? "url(#wave-rb)" : tier === 2 ? "url(#wave-pk)" : "url(#wave-gd)";
  return node(
    "fx-wave", size * 0.62, size,
    `<svg viewBox="0 0 62 100" width="100%" height="100%"><defs>` +
      `<linearGradient id="wave-gd" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff4dc"/><stop offset="1" stop-color="#ffc53d"/></linearGradient>` +
      `<linearGradient id="wave-pk" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#ffd1e3"/><stop offset="1" stop-color="#ff7aa2"/></linearGradient>` +
      `<linearGradient id="wave-rb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff5a5a"/><stop offset=".25" stop-color="#ffe94a"/><stop offset=".5" stop-color="#5fd35f"/><stop offset=".75" stop-color="#4ab8ff"/><stop offset="1" stop-color="#b48cff"/></linearGradient>` +
      `</defs><path d="M14 4 C62 18 62 82 14 96 C40 74 40 26 14 4 Z" fill="${fill}" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>` +
      `<path d="M22 22 C40 36 40 64 22 78" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/></svg>`,
  );
}
function comet(tier: Tier, len: number) {
  const c1 = tier >= 2 ? "#ff7aa2" : "#ffc53d";
  const c2 = tier >= 3 ? "#4ab8ff" : tier === 2 ? "#b48cff" : "#ff9a3d";
  return node(
    "fx-comet", len, len * 0.42,
    `<svg viewBox="0 0 120 50" width="100%" height="100%"><defs><linearGradient id="cm${tier}" x1="0" x2="1"><stop offset="0" stop-color="${c2}" stop-opacity="0"/><stop offset=".55" stop-color="${c1}"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>` +
      `<path d="M4 25 C40 14 70 6 92 6 A19 19 0 0 1 92 44 C70 44 40 36 4 25 Z" fill="url(#cm${tier})" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>` +
      `<circle cx="95" cy="25" r="11" fill="#fff"/></svg>`,
  );
}
function starShot(size: number) {
  return node("fx-starshot", size, size, `<img src="${img("item_star")}" alt="" draggable="false">`);
}
/** A swoosh ribbon around the ninja (spins and flips). */
function ribbon(c: Pt, r: number, from: number, sweep: number, tier: Tier, ms: number, squash = 0.42) {
  const size = r * 2 + 60;
  const cols = tier >= 3 ? ["#ff5a5a", "#ffe94a", "#4ab8ff"] : tier === 2 ? ["#ff7aa2", "#b48cff", "#5ec8f2"] : ["#fff4dc", "#ffe38a", "#ffc53d"];
  const a0 = (from * Math.PI) / 180, a1 = ((from + sweep) * Math.PI) / 180;
  const R = r, cx = size / 2, cy = size / 2;
  const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
  const large = Math.abs(sweep) > 180 ? 1 : 0, dir = sweep > 0 ? 1 : 0;
  const id = `rb${Math.random().toString(36).slice(2, 7)}`;
  const len = (Math.abs(sweep) / 180) * Math.PI * R;
  const el = node(
    "fx-ribbon", size, size,
    `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${cols[0]}"/><stop offset=".5" stop-color="${cols[1]}"/><stop offset="1" stop-color="${cols[2]}"/></linearGradient></defs>` +
      `<path d="M${x0} ${y0} A${R} ${R} 0 ${large} ${dir} ${x1} ${y1}" fill="none" stroke="#2b1d14" stroke-width="30" stroke-linecap="round" opacity=".55" stroke-dasharray="${len}" stroke-dashoffset="${len}"/>` +
      `<path d="M${x0} ${y0} A${R} ${R} 0 ${large} ${dir} ${x1} ${y1}" fill="none" stroke="url(#${id})" stroke-width="22" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len}"/></svg>`,
  );
  place(el, c, size, size, `scale(1, ${1 - squash})`);
  el.querySelectorAll("path").forEach((p) => animate(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms, { easing: "ease-out" }));
  animate(el, [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], ms * 1.5).finished.then(() => el.remove());
}
/** Afterimages: coloured silhouettes of the ninja left behind in fast moves (tier 2 and up). */
function ghost(tier: Tier) {
  const s = spot;
  if (!s || tier < 2) return;
  const g = document.createElement("div");
  g.className = `nj-ghost t${tier}`;
  g.style.transform = getComputedStyle(s.body).transform;
  const m = document.createElement("div");
  m.className = "nj-ghost-fill";
  for (const k of ["width", "height", "left"] as const) m.style[k] = s.rim.style[k];
  const src = s.img.getAttribute("src") ?? "";
  m.style.setProperty("-webkit-mask-image", `url(${src})`);
  m.style.setProperty("mask-image", `url(${src})`);
  g.appendChild(m);
  s.body.parentElement?.insertBefore(g, s.body);
  animate(g, [{ opacity: 0.6 }, { opacity: 0 }], 320, { easing: "ease-out" }).finished.then(() => g.remove());
}
function ghosts(run: Run, from: number, to: number, tier: Tier, every = 45) {
  if (tier < 2) return;
  for (let t = from; t <= to; t += every) run.at(t, () => ghost(tier));
}
function dust(p: Pt, n = 8) {
  fx.puff(p.x, p.y, n);
}
/** A little thought cloud with a question mark (the gentle "hmm" after a wrong answer). */
function thought(ms: number) {
  const s = spot;
  if (!s) return;
  const el = document.createElement("div");
  el.className = "nj-thought";
  el.innerHTML = `<i></i><i></i><span>?</span>`;
  s.root.querySelector(".nj-float")?.appendChild(el);
  animate(el, [{ opacity: 0, scale: "0.3" }, { opacity: 1, scale: "1.08", offset: 0.12 }, { opacity: 1, scale: "1", offset: 0.2 }, { opacity: 1, scale: "1", offset: 0.85 }, { opacity: 0, scale: "0.7" }] as Keyframe[], ms).finished.then(() => el.remove());
}
function dizzy(ms: number) {
  const s = spot;
  if (!s) return;
  const el = document.createElement("div");
  el.className = "nj-dizzy";
  el.innerHTML = `<i></i><i></i><i></i>`;
  s.root.querySelector(".nj-float")?.appendChild(el);
  animate(el, [{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], ms).finished.then(() => el.remove());
}
function kiaiBurst() {
  const s = spot;
  if (!s) return;
  const el = document.createElement("div");
  el.className = "nj-kiai";
  el.innerHTML = `<svg viewBox="0 0 100 100"><polygon points="${starPoints(9, 48, 30, 0.1)}" fill="#fff" stroke="#2b1d14" stroke-width="5" stroke-linejoin="round"/><text x="50" y="66" text-anchor="middle">!</text></svg>`;
  s.root.querySelector(".nj-float")?.appendChild(el);
  animate(el, [{ opacity: 0, scale: "0.2", rotate: "-20deg" }, { opacity: 1, scale: "1.1", rotate: "6deg", offset: 0.2 }, { opacity: 1, scale: "1", rotate: "0deg", offset: 0.7 }, { opacity: 0, scale: "0.8" }] as Keyframe[], 650).finished.then(() => el.remove());
}

// ---------------------------------------------------------------- the moves
const distMs = (a: Pt, b: Pt, pxPerSec: number, min = 200, max = 560) => Math.max(min, Math.min(max, (Math.hypot(b.x - a.x, b.y - a.y) / pxPerSec) * 1000));
/** Each move returns [impact promise (or end), the run]. */
type MoveFn = (t: Pt, tier: Tier, target: Target, o: Ctx) => { hit: Promise<void>; run: Run };

function launchLater(run: Run, ms: number, go: () => Promise<void>): Promise<void> {
  return new Promise<void>((resolve) => run.at(ms, () => void go().then(resolve), true, resolve));
}

const kick: MoveFn = (t, tier, target, o) => {
  const run = begin();
  const S = snd(o);
  const flying = tier >= 2;
  if (!flying) {
    play(run, 560, [
      [0, 0, 0, 0, 1, 1, "ease-out"],
      [90, -16, 4, 5, 1.1, 0.88, SNAP],
      [175, 118, -46, -6, 1.12, 0.92, "linear"],
      [255, 124, -42, -5, 1.04, 0.98, IN],
      [390, 20, 0, 1, 1.1, 0.9, "ease-out"],
      [470, -6, 0, 1, 0.98, 1.02, "ease-out"],
      [560, 0, 0, 0, 1, 1],
    ]);
    poseAt(run, 0, "ready");
    poseAt(run, 95, "kick");
    poseAt(run, 330, "jump");
    poseAt(run, 390, restPose);
    run.at(95, () => S.kick());
    run.at(390, () => dust(at(0.6, 0.02), 6));
  } else {
    play(run, 720, [
      [0, 0, 0, 0, 1, 1, "ease-out"],
      [110, -14, 8, 6, 1.14, 0.84, SNAP],
      [265, 124, -112, -14, 1.08, 0.95, "linear"],
      [340, 128, -106, -12, 1.04, 0.98, IN],
      [590, 0, 0, 0, 1.14, 0.86, "ease-out"],
      [720, 0, 0, 0, 1, 1],
    ]);
    poseAt(run, 0, "ready");
    poseAt(run, 115, "kick");
    poseAt(run, 450, "jump");
    poseAt(run, 590, restPose);
    run.at(115, () => (S.kick(), S.kiai()));
    run.at(590, () => (S.land(), dust(at(0.5, 0.02), 10)));
    ghosts(run, 130, 330, tier, 40);
  }
  const launchAt = flying ? 250 : 165;
  const hit = launchLater(run, launchAt, () => {
    const from = flying ? at(FOOT[0], FOOT[1], 124, -112) : at(FOOT[0], FOOT[1], 118, -46);
    const w = wave(tier, 150 + tier * 24);
    fx.ring(from.x, from.y, { color: "#fff4dc", r0: 6, r1: 80, width: 9, life: 14 });
    fx.lines(from.x, from.y, 7, "#fff4dc", 46);
    return fly(w, from, t, distMs(from, t, 2100), {
      arc: 20, via: o.via, orient: true, ease: (x) => 1 - Math.pow(1 - x, 1.6), scale: (x) => 0.7 + x * 0.5,
      onFrame: (p) => fx.glow(p.x, p.y, COLS[tier], 1, 40, 0.6, 16),
    }).then(() => impact(run, t, flying ? "boom" : "hit", tier, target, o));
  });
  return { hit, run };
};

const punch: MoveFn = (t, tier, target, o) => {
  const run = begin();
  const S = snd(o);
  const jabs = tier >= 1 ? 2 : 1;
  const total = jabs === 2 ? 620 : 460;
  const keys: KF[] = [
    [0, 0, 0, 0, 1, 1, "ease-out"],
    [80, -18, 2, 4, 0.95, 1.04, SNAP],
    [150, 74, -4, -3, 1.13, 0.93, "linear"],
    [220, 78, -4, -3, 1.05, 0.97, "ease-in-out"],
  ];
  if (jabs === 2) keys.push([290, 30, -2, 1, 0.98, 1.02, SNAP], [360, 86, -6, -4, 1.14, 0.92, "linear"], [420, 88, -6, -4, 1.05, 0.97, "ease-in-out"]);
  keys.push([total, 0, 0, 0, 1, 1]);
  play(run, total, keys);
  poseAt(run, 0, "ready");
  poseAt(run, 85, "punch");
  if (jabs === 2) (poseAt(run, 275, "ready"), poseAt(run, 300, "punch"));
  poseAt(run, total - 150, restPose());
  const shot = (ms: number, dx: number, final: boolean) =>
    launchLater(run, ms, () => {
      const from = at(HAND[0], HAND[1], dx, -4);
      S.swish();
      fx.twinkle(from.x, from.y, COLS[tier], 5, 5, 22);
      fx.ring(from.x, from.y, { color: "#fff", r0: 4, r1: 46, width: 7, life: 12 });
      const c = comet(tier, 150 + tier * 20);
      return fly(c, from, t, distMs(from, t, 2600, 170, 420), {
        arc: 10 + Math.random() * 20, via: o.via, orient: true, scale: (x) => 0.8 + x * 0.35,
        onFrame: (p) => fx.glow(p.x, p.y, COLS[tier], 1, 30, 0.5, 12),
      }).then(() => (final ? impact(run, t, "hit", tier, target, o) : minor(run, t, tier, o, true)));
    });
  const first = shot(140, 74, jabs === 1);
  const hit = jabs === 2 ? shot(350, 86, true) : first;
  return { hit, run };
};

const throwMove: MoveFn = (t, tier, target, o) => {
  const run = begin();
  const S = snd(o);
  play(run, 500, [
    [0, 0, 0, 0, 1, 1, "ease-out"],
    [110, -14, 0, 9, 0.96, 1.04, SNAP],
    [180, 46, -6, -6, 1.11, 0.94, "ease-out"],
    [310, 38, -4, -4, 1.02, 0.99, "ease-in-out"],
    [500, 0, 0, 0, 1, 1],
  ]);
  poseAt(run, 0, "ready");
  poseAt(run, 120, "throw");
  poseAt(run, 330, restPose);
  const n = tier >= 2 ? 3 : tier === 1 ? 2 : 1;
  const hits: Promise<void>[] = [];
  for (let i = 0; i < n; i++) {
    hits.push(
      launchLater(run, 150 + i * 55, () => {
        const from = at(HAND[0], HAND[1], 46, -6);
        S.shuriken();
        const s = shuriken(72 + tier * 8);
        const arcs = [70, 150, -10];
        return fly(s, from, { x: t.x + (i - (n - 1) / 2) * 14, y: t.y + (i - (n - 1) / 2) * 10 }, distMs(from, t, 1900, 220, 480), {
          arc: arcs[i] ?? 60, via: i === n - 1 && o.via ? o.via : undefined, spin: 1080, scale: (x) => 0.8 + x * 0.3,
          onFrame: (p, x) => x > 0.05 && fx.glow(p.x, p.y, COLS[tier], 1, 26, 0.4, 12),
        }).then(() => (i === n - 1 ? impact(run, t, "tink", tier, target, o) : minor(run, t, tier, o)));
      }),
    );
  }
  return { hit: hits[n - 1], run };
};

const cast: MoveFn = (t, tier, target, o) => {
  const run = begin();
  const S = snd(o);
  const big = tier >= 2;
  play(run, 720, [
    [0, 0, 0, 0, 1, 1, "ease-in-out"],
    [270, -12, -10, 4, 0.97, 1.05, SNAP],
    [345, 36, -4, -3, 1.09, 0.95, "ease-out"],
    [500, 28, -2, -2, 1.02, 0.99, "ease-in-out"],
    [720, 0, 0, 0, 1, 1],
  ]);
  poseAt(run, 0, "cast");
  poseAt(run, 560, restPose);
  const size = big ? 110 + tier * 12 : 84 + tier * 10;
  const held = 0.5; // how big the orb is while it charges in the hands
  let charge: HTMLDivElement | null = null;
  run.at(0, () => {
    const h = at(CAST_HANDS[0], CAST_HANDS[1], -12, -10);
    S.charge();
    fx.implode(h.x, h.y, COLS[tier], 14 + tier * 4, 150, 18);
    charge = orb(tier, size);
    place(charge, h, size, size, "scale(0)");
    const at0 = `translate(${h.x - size / 2}px, ${h.y - size / 2}px)`;
    animate(charge, [{ transform: `${at0} scale(0)` }, { transform: `${at0} scale(${held * 1.15})`, offset: 0.7 }, { transform: `${at0} scale(${held})` }], 280, { easing: "ease-out" });
  });
  const hit = launchLater(run, 320, () => {
    const from = at(CAST_HANDS[0], CAST_HANDS[1], 36, -4);
    const ob = charge ?? orb(tier, size);
    ob.getAnimations().forEach((a) => a.cancel());
    ob.style.zIndex = "1";
    S.magic();
    fx.ring(from.x, from.y, { color: ringCol(tier), r0: 10, r1: 90, width: 10, life: 14 });
    // big spells bring two little moons circling the orb
    const moons = big ? [orb(tier, size * 0.34), orb(tier, size * 0.34)] : [];
    const ms = distMs(from, t, 1500, 320, 580);
    return fly(ob, from, t, ms, {
      arc: 110, via: o.via, ease: (x) => x * x * (3 - 2 * x) * 0.4 + x * 0.6, scale: (x) => (held + (1 - held) * Math.min(1, x * 5)) * (1 + Math.sin(x * Math.PI * 6) * 0.06),
      onFrame: (p, x) => {
        fx.glow(p.x, p.y, COLS[tier], 2, 44 + tier * 6, 1.4, 22);
        moons.forEach((m, i) => {
          const a = x * Math.PI * 5 + i * Math.PI;
          const r = size * 0.72;
          const q = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 0.55 };
          place(m, q, size * 0.34, size * 0.34, `scale(${0.8 + 0.3 * Math.sin(a)})`);
          m.style.zIndex = Math.sin(a) > 0 ? "2" : "0";
          fx.glow(q.x, q.y, COLS[tier], 1, 20, 0.2, 10);
        });
      },
    }).then(() => {
      moons.forEach((m) => m.remove());
      impact(run, t, big ? "boom" : "magic", tier, target, o);
    });
  });
  return { hit, run };
};

const spin: MoveFn = (t, tier, target, o) => {
  const run = begin();
  const S = snd(o);
  play(run, 760, [
    [0, 0, 0, 0, 1, 1, "ease-out"],
    [110, -6, 6, 0, 1.12, 0.86, "ease-in"],
    [185, 8, -34, -4, 0.12, 1.04, "linear"],
    [260, 20, -58, -6, -1.02, 1.02, "linear"],
    [335, 32, -66, -4, -0.12, 1.02, "linear"],
    [420, 42, -62, -3, 1.06, 0.98, "ease-in-out"],
    [480, 44, -56, -3, 1.02, 1, IN],
    [590, 22, 0, 0, 1.12, 0.88, "ease-out"],
    [760, 0, 0, 0, 1, 1],
  ]);
  poseAt(run, 0, "ready");
  poseAt(run, 110, "spin");
  poseAt(run, 590, restPose);
  run.at(110, () => {
    S.spin();
    const c = at(CENTRE[0], CENTRE[1], 24, -30);
    ribbon(c, spot ? spot.size * 0.66 : 160, 160, 340, tier, 330, 0.62);
    ribbon({ x: c.x, y: c.y + 40 }, spot ? spot.size * 0.56 : 140, 340, 320, tier, 330, 0.66);
  });
  run.at(590, () => (S.land(), dust(at(0.5, 0.02), 8)));
  ghosts(run, 150, 470, tier, 40);
  const hit = launchLater(run, 420, () => {
    const from = at(0.95, 0.66, 42, -62);
    fx.lines(from.x, from.y, 8, "#fff4dc", 50);
    const w = wave(tier, 130 + tier * 24);
    const w2 = wave(tier, 90 + tier * 16);
    const d = distMs(from, t, 2000);
    void fly(w2, from, t, d * 1.08, { arc: -30, via: o.via && { x: o.via.x, y: o.via.y + 40 }, orient: true, spin: 0, scale: (x) => 0.6 + x * 0.4 });
    return fly(w, from, t, d, { arc: 40, via: o.via, orient: true, scale: (x) => 0.7 + x * 0.5, onFrame: (p) => fx.glow(p.x, p.y, COLS[tier], 1, 36, 0.6, 14) }).then(() =>
      impact(run, t, "hit", tier, target, o),
    );
  });
  return { hit, run };
};

const jump: MoveFn = (t, tier, target, o) => {
  const run = begin();
  const S = snd(o);
  play(run, 780, [
    [0, 0, 0, 0, 1, 1, "ease-out"],
    [120, 0, 8, 0, 1.13, 0.84, "cubic-bezier(.2,.8,.4,1)"],
    [380, 58, -152, -4, 0.93, 1.1, "ease-out"],
    [470, 62, -160, -4, 1, 1, IN],
    [670, 0, 0, 0, 1.14, 0.86, "ease-out"],
    [780, 0, 0, 0, 1, 1],
  ]);
  poseAt(run, 0, "ready");
  poseAt(run, 120, "jump");
  poseAt(run, 390, "throw"); // a point at the apex
  poseAt(run, 560, "jump");
  poseAt(run, 670, restPose);
  run.at(120, () => S.jump());
  run.at(670, () => (S.land(), dust(at(0.5, 0.02), 10)));
  ghosts(run, 140, 380, tier, 50);
  const hit = launchLater(run, 400, () => {
    const from = at(HAND[0], HAND[1], 60, -158);
    fx.ring(from.x, from.y, { color: "#fff4dc", r0: 6, r1: 60, width: 8, life: 14 });
    const s = starShot(90 + tier * 14);
    return fly(s, from, t, distMs(from, t, 2000, 220, 460), {
      arc: -20, via: o.via, spin: 540, scale: (x) => 0.7 + x * 0.5,
      onFrame: (p) => (fx.glow(p.x, p.y, COLS[tier], 1, 34, 0.5, 18), Math.random() < 0.35 && fx.twinkle(p.x, p.y, COLS[tier], 1, 1.5, 18)),
    }).then(() => impact(run, t, "star", tier, target, o));
  });
  return { hit, run };
};

const flip: MoveFn = (t, tier, target, o) => {
  const run = begin();
  const S = snd(o);
  play(run, 860, [
    [0, 0, 0, 0, 1, 1, "ease-out"],
    [120, 0, 8, 0, 1.13, 0.84, "cubic-bezier(.2,.8,.4,1)"],
    [340, 34, -160, -170, 0.96, 1.04, "linear"],
    [540, 30, -104, -330, 1, 1, IN],
    [660, 0, 0, -360, 1.14, 0.86, "ease-out"],
    [860, 0, 0, -360, 1, 1],
  ]);
  poseAt(run, 0, "ready");
  poseAt(run, 120, "flip");
  poseAt(run, 560, "jump");
  poseAt(run, 660, restPose);
  run.at(120, () => {
    S.jump();
    S.spin();
    const c = at(CENTRE[0], CENTRE[1], 30, -100);
    ribbon(c, spot ? spot.size * 0.7 : 170, 60, -330, tier, 420, 0.1);
  });
  run.at(660, () => (S.land(), dust(at(0.5, 0.02), 12)));
  ghosts(run, 140, 540, tier, 45);
  const n = tier >= 2 ? 3 : 2;
  const hits: Promise<void>[] = [];
  for (let i = 0; i < n; i++)
    hits.push(
      launchLater(run, 520 + i * 45, () => {
        const from = at(HAND[0], HAND[1] + 0.1, 30, -104);
        const s = starShot(62 + tier * 10);
        S.shuriken();
        return fly(s, from, { x: t.x + (i - (n - 1) / 2) * 18, y: t.y + (i - (n - 1) / 2) * 12 }, distMs(from, t, 2100, 200, 440), {
          arc: 40 + i * 50, via: o.via && { x: o.via.x + (i - (n - 1) / 2) * 30, y: o.via.y - i * 20 }, spin: 720, onFrame: (p) => fx.glow(p.x, p.y, COLS[tier], 1, 26, 0.4, 14),
        }).then(() => (i === n - 1 ? impact(run, t, "star", tier, target, o) : minor(run, t, tier, o)));
      }),
    );
  return { hit: hits[n - 1], run };
};

const cheer: MoveFn = (_t, tier) => {
  const run = begin();
  play(run, 940, [
    [0, 0, 0, 0, 1, 1, "ease-out"],
    [100, 0, 6, 0, 1.12, 0.88, "ease-out"],
    [280, 0, -64, -3, 0.93, 1.09, IN],
    [420, 0, 0, 0, 1.12, 0.88, "ease-out"],
    [570, 0, -44, 3, 0.96, 1.05, IN],
    [700, 0, 0, 0, 1.07, 0.94, "ease-out"],
    [940, 0, 0, 0, 1, 1],
  ]);
  poseAt(run, 0, "cheer");
  const pop = () => {
    const h = at(HEAD[0], HEAD[1] + 0.1, 0, -50);
    fx.burst(h.x, h.y, "confetti", 22, 1);
    fx.twinkle(h.x, h.y, COLS[Math.max(1, tier) as Tier], 10, 7, 28);
  };
  run.at(280, pop);
  run.at(570, pop);
  run.at(90, () => sfx.twinkle());
  return { hit: run.end, run };
};

const think: MoveFn = () => {
  const run = begin();
  play(run, 1300, [
    [0, 0, 0, 0, 1, 1, "ease-in-out"],
    [260, -6, 0, -5, 1, 1, "ease-in-out"],
    [640, -4, 0, -3, 1.01, 0.99, "ease-in-out"],
    [900, -6, 0, -6, 1, 1, "ease-in-out"],
    [1300, 0, 0, 0, 1, 1],
  ]);
  poseAt(run, 0, "think");
  run.at(60, () => (sfx.hmm(), thought(1200)));
  return { hit: run.end, run };
};

const hurt: MoveFn = () => {
  const run = begin();
  play(run, 700, [
    [0, 0, 0, 0, 1, 1, "cubic-bezier(.1,.9,.3,1)"],
    [80, -48, -12, -11, 1.05, 0.95, "ease-out"],
    [170, -40, 0, -8, 1, 1, "ease-in-out"],
    [250, -34, 0, -3, 1, 1, "ease-in-out"],
    [330, -38, 0, -7, 1, 1, "ease-in-out"],
    [700, 0, 0, 0, 1, 1],
  ]);
  poseAt(run, 0, "hurt");
  run.at(0, () => {
    sfx.hurt();
    if (spot) animate(spot.img, [{ filter: "brightness(2.2) saturate(0.4)" }, { filter: "brightness(1)" }], 140, { fill: "none" });
    const h = at(0.3, 0.7);
    fx.twinkle(h.x, h.y, ["#fff4dc", "#ff8a3d"], 6, 5);
    dizzy(900);
  });
  poseAt(run, 560, restPose);
  return { hit: run.end, run };
};

const power: MoveFn = (_t, tier) => {
  const run = begin();
  const tt = Math.max(1, tier) as Tier;
  play(run, 1100, [
    [0, 0, 0, 0, 1, 1, "ease-out"],
    [190, 0, 10, 0, 1.15, 0.83, SNAP],
    [330, 0, -38, 0, 0.92, 1.12, "ease-out"],
    [420, 3, -32, 0, 1.03, 1.02, "linear"],
    [480, -3, -32, 0, 1.03, 1.02, "linear"],
    [540, 3, -32, 0, 1.03, 1.02, "linear"],
    [600, -2, -32, 0, 1.03, 1.02, "ease-in-out"],
    [880, 0, 0, 0, 1.08, 0.94, "ease-out"],
    [1100, 0, 0, 0, 1, 1],
  ]);
  poseAt(run, 0, "ready");
  poseAt(run, 190, "power");
  poseAt(run, 900, restPose);
  run.at(0, () => {
    const c = at(CENTRE[0], CENTRE[1], 0, 6);
    fx.implode(c.x, c.y, COLS[tt], 30, 240, 18);
    sfx.charge();
  });
  run.at(190, () => {
    const c = at(CENTRE[0], CENTRE[1], 0, -30);
    sfx.powerup();
    flash(0.32, tt >= 2 ? "255,235,250" : "255,248,220", c);
    fx.ring(c.x, c.y, { color: ringCol(tt), r0: 40, r1: 340, width: 20, life: 30 });
    fx.ring(c.x, c.y, { color: COLS[tt][1], r0: 20, r1: 250, width: 13, life: 26 });
    fx.ring(c.x, c.y, { color: "#fff", r0: 10, r1: 170, width: 8, life: 20 });
    fx.twinkle(c.x, c.y, COLS[tt], 22, 13, 34);
    fx.lines(c.x, c.y, 14, "#fff4dc", 90);
    fx.glow(c.x, c.y, COLS[tt], 16, 70, 6, 30);
    const g = at(0.5, 0.02);
    dust(g, 14);
    flare("powering", 900);
  });
  ghosts(run, 200, 520, tier, 60);
  return { hit: run.end, run };
};

const IMPL: Record<Move, MoveFn> = { kick, punch, spin, cast, throw: throwMove, jump, flip, cheer, think, hurt, power };

// ---------------------------------------------------------------- choosing a strike
const POOLS: Record<Tier, Move[]> = {
  0: ["kick", "punch", "throw", "cast"],
  1: ["kick", "punch", "throw", "cast", "spin", "jump"],
  2: ["kick", "spin", "cast", "flip", "throw", "jump"],
  3: ["flip", "spin", "cast", "kick", "throw"],
};
/** Soft strikes (teaching follows at once) only use the quick moves, which land within about 0.45 s. */
const SOFT_POOLS: Record<Tier, Move[]> = { 0: ["kick", "punch", "throw"], 1: ["kick", "punch", "throw"], 2: ["punch", "throw"], 3: ["punch", "throw"] };
const recent: Move[] = [];
function chooseMove(tier: Tier, soft = false): Move {
  const all = (soft ? SOFT_POOLS : POOLS)[tier];
  const avoid = all.length > 3 ? recent : recent.slice(-1); // never the last two (or, from a small pool, the last one)
  const pool = all.filter((m) => !avoid.includes(m));
  const m = pool[(Math.random() * pool.length) | 0] ?? all[0];
  recent.push(m);
  if (recent.length > 2) recent.shift();
  return m;
}

// ---------------------------------------------------------------- streak reactions
const hasLine = (id: string) => LINES.some((l) => l.id === id);
const tierLineId = (tier: Tier) => (hasLine(`streak_${TIER_AT[tier]}`) ? `streak_${TIER_AT[tier]}` : null);
/** Bumped whenever a queued line must be dropped: the ninja left the screen, or a newer streak event came (a new level,
 *  or the child has already answered the next question, so the line would be stale). A higher tier-up drops a lower
 *  one's line this way too. */
let lineGen = 0;
/** Tier-ups and lines still playing out, for linesDone(). */
const busy = new Set<Promise<unknown>>();
function track<T>(p: Promise<T>): Promise<T> {
  busy.add(p);
  void p.finally(() => busy.delete(p));
  return p;
}
/** A deferred tier-up waiting for ninja.streakLine() (the highest one reached). */
let heldTier: Tier = 0;

/** Say a line at the next quiet moment (280 ms after speech stops, so never over teaching), and not before `gate`
 *  opens. Dropped if it can't start within `within` ms, or a newer streak event comes, or the ninja leaves the screen.
 *  Resolves when it has been said. */
async function sayWhenQuiet(id: string, within = 6500, gate?: Promise<void>): Promise<void> {
  if (!hasLine(id)) return;
  const gen = lineGen;
  const t0 = performance.now();
  let open = !gate;
  void gate?.then(() => (open = true));
  let quietSince = 0;
  while (performance.now() - t0 < within / FAST) {
    if (gen !== lineGen || !spot) return;
    if (isSpeaking()) quietSince = 0;
    else if (!quietSince) quietSince = performance.now();
    else if (open && performance.now() - quietSince >= 280 / FAST) {
      await say({ line: id });
      return;
    }
    await new Promise((r) => setTimeout(r, 40));
  }
}
/** A new tier: once the strike that earned it has landed (0.9 s at most), the power-up, and its line with the power-up's
 *  flash (at the next quiet moment), so the words and the transformation arrive together. */
async function powerUp(tier: Tier, withLine: boolean): Promise<void> {
  const prev = cur;
  const mine = spot;
  let flashed = () => {};
  const flash = new Promise<void>((r) => (flashed = r));
  const id = withLine ? tierLineId(tier) : null;
  const line = id ? sayWhenQuiet(id, 6500, flash) : Promise.resolve();
  if (prev && !prev.done) await Promise.race([prev.end, wait(900)]);
  if (!mine || spot !== mine || !mine.root.isConnected) return;
  const p = ninja.act("power");
  window.setTimeout(flashed, 150 * slow); // the power move's flash is at 190 ms
  await Promise.all([p, line]);
}
function onStreak(e: StreakEvent) {
  lineGen++;
  if (e.type !== "hit") heldTier = 0;
  if (!spot) return;
  if (e.tierUp) {
    if (e.defer) {
      heldTier = Math.max(heldTier, e.tier) as Tier;
      return;
    }
    heldTier = 0;
    void track(powerUp(e.tier, e.line));
  } else if (e.type === "miss" && e.prevN > 0) {
    if (e.prevN >= 3) {
      sfx.fizzle();
      if (e.line) void track(sayWhenQuiet("streak_lost", 5000));
    }
    if (!cur || cur.done || spot.root.dataset.pose !== "think") void ninja.act("think");
  }
}
streak.on(onStreak);

// ---------------------------------------------------------------- the controller
export const ninja = {
  /** A varied attack toward the target (the thing the child just got right), chosen from the streak tier.
   *  Resolves when the effect lands. */
  strike(target?: Target, opts: StrikeOpts = {}): Promise<void> {
    const tier = streak.tier;
    const move = opts.move ?? chooseMove(tier, opts.soft);
    return ninja.act(move, target, opts);
  },
  /** Perform one move. With a target, resolves when its effect lands there; without one, when the move is done. */
  act(move: Move, target?: Target, opts: StrikeOpts = {}): Promise<void> {
    const tier = streak.tier;
    const t = pointOf(target);
    const { hit } = IMPL[move](t, tier, target, { react: opts.react ?? true, soft: !!opts.soft, via: opts.via });
    return hit;
  },
  /** Play a tier-up held back by streak.hit({ defer: true }): the power-up and (unless `line: false`) the highest
   *  tier's line, said now. Resolves when both are done; at once if nothing is held. */
  async streakLine(opts: { line?: boolean } = {}): Promise<void> {
    const t = heldTier;
    heldTier = 0;
    if (!t || !spot) return;
    const id = opts.line === false ? null : tierLineId(t);
    await track(Promise.all([ninja.act("power"), id ? say({ line: id }) : null]));
  },
  /** The tier held back for streakLine() (0 if none). */
  get heldTier(): Tier {
    return heldTier;
  },
  /** Resolves when the ninja's own tier-ups and lines (streak_3/6/10, streak_lost) have played out: at once if none. */
  async linesDone(): Promise<void> {
    while (busy.size) await Promise.all([...busy]);
  },
  /** End of level: power up, a big backflip, a ground-pound landing and a cheer. Resolves when done (~1.9 s). */
  async celebrate(): Promise<void> {
    if (!spot) return;
    const tier = Math.max(1, streak.tier) as Tier;
    const run = begin();
    play(run, 1900, [
      [0, 0, 0, 0, 1, 1, "ease-out"],
      [180, 0, 10, 0, 1.16, 0.82, "cubic-bezier(.2,.8,.4,1)"],
      [460, 44, -196, -180, 0.95, 1.06, "linear"],
      [700, 36, -126, -350, 1, 1, IN],
      [820, 0, 0, -360, 1.2, 0.8, "ease-out"],
      [960, 0, 0, -360, 1, 1, "ease-out"],
      [1120, 0, -70, -363, 0.93, 1.09, IN],
      [1260, 0, 0, -360, 1.12, 0.88, "ease-out"],
      [1420, 0, -46, -357, 0.96, 1.05, IN],
      [1560, 0, 0, -360, 1.07, 0.94, "ease-out"],
      [1900, 0, 0, -360, 1, 1],
    ]);
    poseAt(run, 0, "ready");
    poseAt(run, 180, "flip");
    poseAt(run, 700, "jump");
    poseAt(run, 820, "cheer");
    run.at(0, () => {
      const c = at(CENTRE[0], CENTRE[1]);
      fx.implode(c.x, c.y, COLS[tier], 20, 200, 16);
      sfx.charge();
    });
    run.at(180, () => {
      sfx.jump();
      sfx.spin();
      ribbon(at(CENTRE[0], CENTRE[1], 40, -130), spot ? spot.size * 0.72 : 180, 60, -330, tier, 480, 0.1);
    });
    ghosts(run, 200, 700, 2, 50);
    run.at(820, () => {
      const g = at(0.5, 0.02);
      sfx.boom();
      shakeStage();
      flash(0.3, "255,250,230", at(CENTRE[0], CENTRE[1]));
      dust(g, 18);
      fx.ring(g.x, g.y - 10, { color: "#fff4dc", r0: 30, r1: 300, width: 16, life: 26 });
      fx.twinkle(g.x, g.y - 60, COLS[tier], 16, 10);
      flare("landing", 600);
    });
    for (const ms of [1120, 1420])
      run.at(ms, () => {
        const h = at(HEAD[0], HEAD[1] + 0.2, 0, -60);
        fx.burst(h.x, h.y, "confetti", 26, 1.1);
        fx.twinkle(h.x, h.y, COLS[tier], 12, 9, 30);
        sfx.twinkle();
      });
    run.at(900, () => sfx.great());
    await run.end;
  },
  /** Kiai! A quick shout burst by the head. */
  say(): void {
    sfx.kiai();
    kiaiBurst();
  },
  /** A magic spell carries `from` (e.g. the tile just tapped) into `to` (its slot). A glowing copy of `from` flies;
   *  hide or move the real one yourself. Resolves when it arrives. `burst: false` skips the arrival ring and stars;
   *  `arc` is how high the copy flies over the midpoint (default 120). */
  async carry(from: Element | Pt, to: Target, opts: { react?: boolean; burst?: boolean; arc?: number } = {}): Promise<void> {
    if (!spot) return;
    const tier = streak.tier;
    const run = begin();
    play(run, 560, [
      [0, 0, 0, 0, 1, 1, "ease-in-out"],
      [180, -8, -8, 3, 0.97, 1.05, SNAP],
      [260, 30, -4, -3, 1.08, 0.95, "ease-out"],
      [560, 0, 0, 0, 1, 1],
    ]);
    poseAt(run, 0, "cast");
    poseAt(run, 420, restPose);
    const hand = at(CAST_HANDS[0], CAST_HANDS[1], 30, -4);
    const a = from instanceof Element ? stageRect(from) : { x: from.x - 50, y: from.y - 50, w: 100, h: 100 };
    const src = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    const dst = pointOf(to);
    sfx.magic();
    beam(hand, src, tier);
    fx.twinkle(src.x, src.y, COLS[tier], 8, 5);
    let clone: HTMLElement;
    if (from instanceof Element) {
      clone = node("fx-carry", a.w, a.h);
      const c = from.cloneNode(true) as HTMLElement;
      c.removeAttribute("id");
      c.style.position = "absolute";
      c.style.inset = "0";
      c.style.margin = "0";
      c.style.width = "100%";
      c.style.height = "100%";
      c.style.transform = "none";
      c.style.translate = "none";
      c.style.animation = "none";
      c.classList.remove("pop-in", "drop-in", "wrong", "hint", "pressed");
      clone.appendChild(c);
    } else clone = orb(tier, 70);
    place(clone, src, a.w, a.h);
    const toR = to instanceof Element ? stageRect(to) : null;
    const endScale = toR && toR.w ? Math.min(1.4, Math.max(0.5, toR.w / a.w)) : 1;
    await wait(120);
    if (run.dead) return void clone.remove();
    await fly(clone, src, dst, distMs(src, dst, 1300, 280, 520), {
      arc: opts.arc ?? 120, ease: (x) => x * x * (3 - 2 * x), scale: (x) => 1 + Math.sin(x * Math.PI) * 0.22 + (endScale - 1) * x,
      onFrame: (p, x) => x < 0.9 && fx.glow(p.x, p.y, COLS[tier], 1, 36, 1, 14),
    });
    if (run.dead) return;
    if (opts.burst ?? true) {
      fx.ring(dst.x, dst.y, { color: ringCol(tier), r1: 110, width: 10 });
      fx.twinkle(dst.x, dst.y, COLS[tier], 10, 6);
    }
    sfx.place();
    if ((opts.react ?? true) && to instanceof Element) reactTo(to, tier);
  },
  /** A spin kick knocks `el` out: a copy of it flies off spinning. Hide the real one yourself. Resolves as it leaves. */
  async knock(el: Element, opts: { dir?: 1 | -1 } = {}): Promise<void> {
    if (!spot) return;
    const tier = streak.tier;
    const t = pointOf(el);
    const { hit, run } = spin(t, tier, el, { react: false, soft: false });
    await hit;
    if (run.dead) return;
    const r = stageRect(el);
    const clone = node("fx-carry", r.w, r.h);
    const c = el.cloneNode(true) as HTMLElement;
    c.style.cssText += ";position:absolute;inset:0;margin:0;width:100%;height:100%;transform:none;translate:none;animation:none";
    clone.appendChild(c);
    const from = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    const dir = opts.dir ?? 1;
    await fly(clone, from, { x: from.x + dir * 520, y: -160 }, 620, { arc: 160, spin: dir * 900, ease: (x) => x * (2 - x), scale: (x) => 1 - x * 0.4 });
  },
  /** Set the resting pose (e.g. "run" in the run level); null goes back to the default (idle, or ready on a streak).
   *  It shows at once unless a real move is playing (an idle fidget is stopped for it); a move ends in it.
   *  `now`: show it this instant even mid-move (a scene driving the whole body itself, e.g. Early's letter launches). */
  pose(p: Pose | null, opts: { now?: boolean } = {}): void {
    restOverride = p;
    if (cur && !cur.done && cur.idle) cur.stop();
    if (opts.now || !cur || cur.done) setPose(restPose());
  },
  /** The pose showing right now. */
  get currentPose(): Pose | null {
    return (spot?.root.dataset.pose as Pose | undefined) ?? null;
  },
  /** Is a move playing? */
  get busy(): boolean {
    return !!cur && !cur.done;
  },
  /** Dev only (the demo's slow motion): 1 = normal, 4 = four times slower. */
  setSlowmo(k: number): void {
    slow = Math.max(0.1, k);
    setFxSpeed(1 / slow);
  },
  /** Is a <NinjaSpot/> on screen? */
  get mounted(): boolean {
    return !!spot?.root.isConnected;
  },
};
if (typeof window !== "undefined") (window as any).__ninja = ninja;

/** A quick sparkling beam from the ninja's hands to something (carry's "grab"). */
function beam(a: Pt, b: Pt, tier: Tier) {
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 40 };
    setTimeout(() => fx.glow(p.x, p.y, COLS[tier], 1, 30, 0.4, 16), i * 8 * slow);
  }
}

// ---------------------------------------------------------------- <NinjaSpot/>
export interface NinjaSpotProps {
  /** width of the idle ninja in stage px (default 250) */
  size?: number;
  /** left edge in stage px (default 40) */
  x?: number;
  /** feet above the stage bottom in stage px (default 18) */
  bottom?: number;
  /** resting pose (default idle; "ready" while on a streak) */
  pose?: Pose;
  /** hide the streak flames (e.g. a calm story page) */
  noFlames?: boolean;
  /** first-try answers already earned but not yet counted (e.g. held until a word is finished): drawn as pale
   *  outline flames after the lit ones */
  pending?: number;
  z?: number;
  className?: string;
  style?: CSSProperties;
}

const FLAME_PATH = "M20 2 C25 12 36 18 36 32 C36 44 29 52 20 52 C11 52 4 44 4 33 C4 25 9 20 12 14 C13 21 16 24 19 25 C17 17 17 9 20 2 Z";
/** Flame colours: [outer, middle, core] per tier; the master tier cycles through the rainbow, flame by flame. */
const FLAME_COLS: Record<Tier, string[][]> = {
  0: [["#ff8a3d", "#ffc53d", "#fff4b0"]],
  1: [["#ff5a1a", "#ffb02e", "#fff6c8"]],
  2: [["#ff3d7a", "#ffb02e", "#fff8e0"], ["#ff5a1a", "#ffd23d", "#fffbe8"]],
  3: [["#ff3b3b", "#ffb02e", "#fff8e0"], ["#ff8a1a", "#ffe23a", "#fffbe8"], ["#3fbf3f", "#ffe23a", "#fffbe8"], ["#2f8fff", "#ffd23d", "#fffbe8"], ["#9b5cf0", "#ffb02e", "#fff8e0"]],
};
const PALE = ["#fff4dc", "#fffaf0", "#ffffff"];
function Flame({ i, tier, n, pale }: { i: number; tier: Tier; n: number; pale?: boolean }) {
  const set = FLAME_COLS[tier];
  const [outer, mid, core] = pale ? PALE : set[i % set.length];
  // a flat, gently arched row above the head; every flame stands upright
  const gap = n > 8 ? 25 : n > 5 ? 29 : 33;
  const x = (i - (n - 1) / 2) * gap;
  const half = Math.max(1, ((n - 1) / 2) * gap);
  const y = -10 * (1 - (x / half) ** 2);
  return (
    <span className={`nj-flame ${pale ? "pale" : ""}`} style={{ "--x": `${x}px`, "--y": `${y}px`, "--d": `${((i * 0.17) % 0.46).toFixed(2)}s` } as CSSProperties}>
      <svg viewBox="0 0 40 54">
        <path d={FLAME_PATH} fill={outer} stroke="#2b1d14" strokeWidth="3.5" strokeLinejoin="round" />
        {!pale && <path d="M20 12 C24 20 31 26 31 36 C31 44 26 49 20 49 C14 49 9 44 9 37 C9 31 13 27 15 22 C16 27 18 29 20 29 C19 23 18 17 20 12 Z" fill={mid} />}
        <path d="M20 26 C23 31 26 35 26 40 C26 44 23 47 20 47 C17 47 14 44 14 40 C14 35 18 31 20 26 Z" fill={core} opacity={pale ? 0.8 : 1} />
      </svg>
    </span>
  );
}
function Flames({ n, tier, pending = 0 }: { n: number; tier: Tier; pending?: number }) {
  const [puff, setPuff] = useState(0);
  const prev = useRef(n);
  useEffect(() => {
    const p = prev.current;
    prev.current = n;
    if (n === 0 && p > 0) {
      setPuff(p);
      const t = setTimeout(() => setPuff(0), 700);
      return () => clearTimeout(t);
    }
    setPuff(0);
  }, [n]);
  const lit = Math.min(10, n || puff);
  const count = Math.min(10, lit + (puff ? 0 : Math.max(0, pending)));
  if (!count) return null;
  return (
    <div className={`nj-flames ${n === 0 && puff ? "puff" : ""}`}>
      {Array.from({ length: count }, (_, i) => (
        <Flame key={`${i}${i < lit ? "l" : "p"}`} i={i} tier={n === 0 ? 0 : tier} n={count} pale={i >= lit} />
      ))}
    </div>
  );
}

/** The player's ninja, standing in the ninja zone. Only one at a time; `ninja` drives it. */
export function NinjaSpot({ size = 250, x = 40, bottom = 18, pose = "idle", noFlames, pending = 0, z = 12, className = "", style }: NinjaSpotProps) {
  const hero = useHero();
  const { n, tier } = useStreak();
  const ver = usePoseVersion();
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const im = useRef<HTMLImageElement>(null);
  const rim = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const handle = useRef<Spot | null>(null);
  const [baron, setBaron] = useState(false);

  useLayoutEffect(() => {
    probePoses();
    const h: Spot = { root: root.current!, body: body.current!, img: im.current!, rim: rim.current!, shadow: shadow.current!, hero, size, rest: pose };
    handle.current = h;
    spot = h;
    setPose(restPose());
    return () => {
      if (spot === h) {
        // leaving the screen (e.g. Home mid-move): nothing more flies, lands or makes a sound, and queued lines drop
        cur?.cancel();
        cur = null;
        spotGen++;
        owned.forEach((el) => el.remove());
        owned.clear();
        lineGen++;
        heldTier = 0;
        spot = null;
        restOverride = null;
      }
    };
  }, []);
  // keep the handle current; re-apply the resting pose when it changes (or a new sprite lands)
  useLayoutEffect(() => {
    const h = handle.current;
    if (!h) return;
    h.hero = hero;
    h.size = size;
    h.rest = pose;
    if (!cur || cur.done) setPose(restPose());
  }, [hero, size, pose, ver, tier]);
  // preload every pose so swaps never flash
  useEffect(() => {
    for (const p of [...BASE_POSES, ...(Object.keys(FALLBACK) as Pose[])]) new Image().src = poseSrc(hero, p);
  }, [hero, ver]);
  // on guard while Baron Muddle speaks
  useEffect(
    () =>
      onCaption((c) => {
        const on = !!c && c.who === "baron";
        setBaron(on);
        if (!cur || cur.done) setPose(on ? "ready" : restPose());
      }),
    [],
  );
  // idle life: now and then a little hop or a stance bounce, so the ninja never looks frozen
  useEffect(() => {
    let t = 0;
    const next = () => {
      t = window.setTimeout(() => {
        if ((!cur || cur.done) && performance.now() - lastMoveAt > 5000 && body.current) {
          const r = new Run();
          r.idle = true;
          cur = r;
          // a scene's resting pose (e.g. a charging stance) isn't swapped for a bounce: it only hops
          const hop = restOverride != null || Math.random() < 0.5;
          play(
            r,
            hop ? 620 : 900,
            hop
              ? [
                  [0, 0, 0, 0, 1, 1, "ease-out"],
                  [110, 0, 4, 0, 1.07, 0.92, "ease-out"],
                  [280, 4, -34, 0, 0.96, 1.05, IN],
                  [420, 0, 0, 0, 1.06, 0.94, "ease-out"],
                  [620, 0, 0, 0, 1, 1],
                ]
              : [
                  [0, 0, 0, 0, 1, 1, "ease-in-out"],
                  [220, 6, 3, 2, 1.03, 0.97, "ease-in-out"],
                  [450, 0, -6, 0, 0.99, 1.01, "ease-in-out"],
                  [680, 6, 3, 2, 1.03, 0.97, "ease-in-out"],
                  [900, 0, 0, 0, 1, 1],
                ],
          );
          if (!hop) (poseAt(r, 0, "ready"), poseAt(r, 880, restPose));
        }
        next();
      }, 6000 + Math.random() * 6000);
    };
    next();
    return () => clearTimeout(t);
  }, []);

  const sparks = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ l: 8 + Math.random() * 84, d: -Math.random() * 2.4, s: 0.6 + Math.random() * 0.7, i })), []);
  const orbit = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);
  return (
    <div
      ref={root}
      className={`ninja-spot tier-${tier} ${baron ? "on-guard" : ""} ${className}`}
      data-hero={hero}
      style={{ left: x, bottom, width: size, height: size * 1.45, zIndex: z, "--nj": `${size}px`, ...style } as CSSProperties}
      aria-hidden="true"
    >
      <div ref={shadow} className="nj-shadow" />
      <div className="nj-ground" />
      <div className="nj-float">
        <div ref={body} className="nj-body">
          <div className="nj-rays" />
          <div className="nj-aura" />
          <div ref={rim} className="nj-rim" />
          <img ref={im} className="nj-img" alt="" draggable={false} />
        </div>
        <div className="nj-sparks">
          {sparks.map((s) => (
            <i key={s.i} style={{ left: `${s.l}%`, animationDelay: `${s.d}s`, scale: `${s.s}` }} />
          ))}
        </div>
        <div className="nj-orbit">
          {orbit.map((i) => (
            <i key={i} style={{ animationDelay: `${(-i * 2.4) / orbit.length}s` }} />
          ))}
        </div>
        {!noFlames && <Flames n={n} tier={tier} pending={pending} />}
      </div>
    </div>
  );
}
