// Sorting dojo (Extended Code): same sound, different spellings. A word floats down (Sensei says it) and the child
// taps the chest for the spelling it uses. The word turns green where it is, and the ninja (bottom-left) clenches its
// fists and powers up at once while Sensei sounds the word out: each spelling lights up as it's said and sends a silent
// spark into the ninja's glowing fists. Once the whole word has been said, the ninja lets the power go: a kick, punch,
// shuriken, spin, leap or flip knocks the word spinning into the chest, or a spell lifts it and floats it in. The chest
// gulps it and the word stands up inside with the others. The move's sounds never land on the teaching sounds.
// Words fall faster as you go (timed, but never fails). Layout: src/styles/sort.css and docs/HERO.md.
//
// The introduction (docs/TEACHER_SCRIPT.md §4.3, SCRIPT_FIXES C1, SOUND_DISPLAY r44; the teacher's voice, FIX_PLAN §13):
// the sound's petal stands big (hero) above three closed, sleeping chests, and Sensei says the sound once, with it. Each
// chest then opens (on the child's own tap the first time a child meets Sorting: "Tap each chest to open it."): a star
// flies from the petal into it, its lid flies off, light spills out and its spelling springs out of it, while Sensei says
// ONE sentence with one example word ("This is the way we spell it in cat." · "In kit, it's spelt like this."), and
// "It's two letters, but it's one sound." only on the one chest whose spelling is due. Then the petal shrinks into the
// top bar. A first meeting (and a later day's recap) then has Sensei's narrated demo ("I'll sort the first one. My word
// is… back. I can see this spelling at the end. So it goes in this chest.": the paw taps the chest and the ninja kicks the
// word in), and the full form holds on Ready in the right-hand column ("Now you do one. Are you ready?"; the paw replays
// the demo). A known game says one line ("Sorting time! Same sound, different spellings.") and the chests. The form is
// the game ledger's (narrate.tsx gameForm: full, recap, short).
// Navigation (docs/NAVIGATION.md §5.D): Home is the nav layer's (top-left). Top-right, the sound being sorted as its
// petal (header: every chest is a spelling of this one sound) and "Hear the word", the screen's Hear it again: on the
// first word it says the introduction again, each chest hopping with its sentence, then the word; later, the word.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import { WORDS, WORD_BY_TEXT, type Word } from "../content/phonics";
import { LINES } from "../content/lines";
import { worldOf, knownSpellings } from "../content/worlds";
import { say, sfx, playMusic, preload, urls, hush, isSpeaking, nextClip, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { shuffle } from "../engine/learner";
import { recordRead, store, useSave } from "../engine/store";
import { streak, useStreak, streakLine, tierLineSaid, type Tier } from "../engine/streak";
import { pictureCorrection, praiseFor } from "../engine/feedback";
import { img, Progress, fx, stageRect, Tile, TapHint, tapProps, useHelp, SenseiDock, isUpright, shakeStage, sleep, useHero } from "../ui/ui";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { SESSIONS, dueInSessions, lettersKey, lettersLine, sortWaysLine, type Exposure } from "../content/narrative";
import { levelWrap } from "../content/games";
import { LETTERS, NarrOverlay, beginLevel, framed, gameForm, heard as told, lettersFor, played, readyAsk, sessionNow, struggledIn, taughtThisSession } from "./narrate";
import { useLessonClock } from "../engine/lessonClock";
import { useNav, ReplayButton, TopBar, holdReady, readyTap, readyHeld, navLog } from "../ui/nav";
import { SoundBadge } from "../ui/SoundBadge";
import "../styles/sort.css";
import "../styles/nav-D.css";

const HAS = new Set(LINES.map((l) => l.id));
const L = (id: string): Say[] => (HAS.has(id) ? [{ line: id }] : []);
/** "In kit, it's spelt like this." (TEACHER_SCRIPT §4.3's `tv_spelt_like_this_<w>`): the words it was recorded for. */
const SPELT_WORDS = LINES.flatMap((l) => l.id.match(/^tv_spelt_like_this_([a-z]+)$/)?.[1] ?? []);
/** A recorded "…in cat." sentence's example word. */
const lineWord = (id: string) => LINES.find((l) => l.id === id)?.text.match(/\bin ([a-z]+)\.?$/i)?.[1]?.toLowerCase() ?? null;
/** `tg_<g>_<p>_way`, "This is the way we spell it in cat." (teach-lines.gen.ts). */
const wayLine = (g: string, p: string) => `tg_${g.replace(/-/g, "")}_${p}_way`;

/** The introduction as it was said, for the first word's Hear it again: the lead (without the Bridging line and "Tap
 *  each chest…"), each chest's sentence as it was said (without its letters line), and whether a demo played. */
type Part = { g: string; say: Say[] };
type Intro = { lead: Say[]; chests: Part[] };

const ROUNDS = 8;
const TOP0 = 112; // the word's top edge as it appears (just under the top bar)
const FALL = 188; // how far it sinks (its bottom stays above the chests)
const COLS: Record<Tier, string[]> = {
  0: ["#fff4dc", "#ffe38a", "#ffc53d"],
  1: ["#ffe38a", "#ffc53d", "#ff9a3d", "#fff4dc"],
  2: ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"],
  3: ["#ff5a5a", "#ffb03d", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"],
};
/** The strikes that knock a word in, per streak tier (the ninja's own pools without "cast": a spell is its own way in). */
const POOL: Record<Tier, Move[]> = {
  0: ["kick", "punch", "throw"],
  1: ["kick", "punch", "throw", "spin", "jump"],
  2: ["kick", "spin", "flip", "throw", "jump"],
  3: ["flip", "spin", "kick", "throw"],
};
const SPELL_CHANCE: Record<Tier, number> = { 0: 0.2, 1: 0.25, 2: 0.25, 3: 0.25 };
/** Where the fists are in the "power" (and "ready") sprite, as fractions of the sprite's box. */
const FISTS: Record<string, [number, number][]> = {
  kai: [[0.31, 0.54], [0.91, 0.55]],
  suki: [[0.41, 0.66], [0.91, 0.65]],
};
/** Where a sorted word stands in its chest, by age (0 = the newest): the newest in front, the older ones a row further
 *  back and a step higher each, so every word's letters (and its pink spelling) show above the ones in front. `x` is a
 *  fraction of the chest's opening (sort.css moves the word there with `translate`, so a reshuffle never lays out). */
function chipAt(rank: number, count: number) {
  const row = Math.ceil(rank / 2); // 0 | 1, 2 | 3, 4
  const first = row === 0 ? 0 : row * 2 - 1;
  const inRow = row === 0 ? 1 : Math.min(2, count - first);
  const side = rank - first;
  const k = Math.min(row, 3);
  return {
    x: inRow === 1 ? 0.5 : side === 0 ? 0.26 : 0.74,
    b: [0, 34, 64, 90][k],
    s: [1, 0.86, 0.76, 0.7][k],
    r: inRow === 1 ? (row % 2 ? 3 : -2) : side === 0 ? -5 : 5,
  };
}
type Pt = { x: number; y: number };
type Mood = "no" | "yum";
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Let go of a filling Web Animation once its element has gone (a moment later, after React has removed it, so it never
 *  snaps back on screen first): a paused or filling animation keeps a removed element, and all of its tree, alive. */
const dropAnim = (a: Animation | null | undefined) => void (a && setTimeout(() => a.cancel(), 250));
const centre = (el: Element): Pt => {
  const r = stageRect(el);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};
/** A trail's glows, at most 60 a second (docs/PERF.md fix 7): `drop` runs on a frame only if 1/60 s has passed since
 *  the last one. On a 60 Hz screen that is every frame, exactly as before; a 120 Hz screen no longer lays twice as many. */
function trailBy(drop: (p: Pt) => void) {
  let last = -Infinity;
  return (p: Pt) => {
    const now = performance.now();
    if (now - last < 15) return; // (15, not 16.7 ms: a 60 Hz frame that comes a little early still counts)
    last = now;
    drop(p);
  };
}
/** Wait until cond() holds, or ms (game time) have passed. */
async function until(cond: () => boolean, ms: number) {
  const t0 = performance.now();
  while (!cond() && (performance.now() - t0) * FAST < ms) await sleep(40);
}
/** "c... a... t... cat!" (as sayBlend: the sounds are the letters' voices, "tile"), telling onSeg which spelling is
 *  sounding (-1 = the whole word). */
const blend = (w: Word, onSeg: (k: number) => void): Say[] => [{ sounds: w.segs, onSeg, gap: 260, show: "tile" }, { gap: 150 }, { word: w.text }];

/** Send the word element into the chest's opening, shrinking as it goes in, with a sparkle trail.
 *  "knock": off the hit it arcs up and dunks in, spinning a full turn. "spell": it glows, lifts off with a wobble,
 *  then floats over in a high, gentle swoop. Resolves when it's in. */
function flyIn(el: HTMLElement, to: Pt, tier: Tier, style: "knock" | "spell", ms: number): Promise<void> {
  const r = stageRect(el);
  const from = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  const spell = style === "spell";
  const lift = spell ? 56 : 0; // the spell raises it first (the first 28% of the time)
  const start = { x: from.x, y: from.y - lift };
  const c = { x: start.x + (to.x - start.x) * (spell ? 0.45 : 0.55), y: Math.min(start.y, to.y) - (spell ? 170 : 130) - tier * 12 };
  const dir = to.x >= from.x ? 1 : -1;
  const end = Math.min(0.34, 120 / Math.max(1, r.w));
  el.style.animation = "none";
  if (spell) el.style.filter = `drop-shadow(0 0 10px ${COLS[tier][1]}) drop-shadow(0 0 26px ${COLS[tier][0]})`;
  const glowTrail = trailBy((p) => {
    if (spell) {
      fx.glow(p.x, p.y, COLS[tier], 2, 46 + tier * 6, 1.2, 20);
      if (Math.random() < 0.5) fx.twinkle(p.x, p.y, COLS[tier], 1, 2, 22);
    } else {
      fx.glow(p.x, p.y, COLS[tier], 1, 38 + tier * 6, 0.6, 16);
      if (tier >= 1 && Math.random() < 0.4) fx.twinkle(p.x, p.y, COLS[tier], 1, 1.5, 20);
    }
  });
  return new Promise((resolve) => {
    const t0 = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const guard = setTimeout(finish, ms + 400); // setTimeout is FAST-scaled already
    const frame = (now: number) => {
      if (done) return;
      if (!el.isConnected) return finish();
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      let p: Pt, rot: number, s: number;
      if (spell) {
        const L = 0.28;
        if (t < L) {
          const k = easeOut(t / L);
          p = { x: from.x, y: from.y - lift * k };
          rot = Math.sin(k * Math.PI * 2) * 6;
          s = 1 + 0.08 * k;
        } else {
          const k = (t - L) / (1 - L);
          const e = k * k * (3 - 2 * k);
          p = bez(start, c, to, e);
          rot = Math.sin(k * Math.PI * 3) * 9 * (1 - k);
          s = 1.08 - (1.08 - end) * Math.pow(e, 1.4);
        }
        glowTrail(p);
      } else {
        p = bez(from, c, to, t);
        rot = dir * (t < 0.15 ? -14 * (t / 0.15) : -14 + 374 * Math.pow((t - 0.15) / 0.85, 1.3));
        s = 1 - (1 - end) * Math.pow(t, 1.5);
        if (t > 0.04) glowTrail(p);
      }
      el.style.transform = `translate(${p.x - from.x}px, ${p.y - from.y}px) rotate(${rot}deg) scale(${s})`;
      if (t >= 1) {
        clearTimeout(guard);
        finish();
      } else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/** A silent spark of power from a letter to the ninja's fist (the target is re-read every frame, so it homes in on
 *  the fist as the ninja breathes); also the star that carries the sound from its petal into a chest as the chest
 *  opens. Resolves when it arrives. */
function spark(layer: HTMLElement, a: Pt, to: () => Pt, cols: string[], ms: number, bend: number): Promise<void> {
  const el = document.createElement("div");
  el.className = "so-spark";
  el.innerHTML = `<svg viewBox="0 0 40 40"><path d="M20 2 L24.5 15.5 L38 20 L24.5 24.5 L20 38 L15.5 24.5 L2 20 L15.5 15.5 Z" /></svg>`;
  layer.appendChild(el);
  fx.twinkle(a.x, a.y, cols, 5, 4, 18);
  const glowTrail = trailBy((p) => {
    fx.glow(p.x, p.y, cols, 2, 30, 0.6, 14);
    if (Math.random() < 0.3) fx.twinkle(p.x, p.y, cols, 1, 1.5, 14);
  });
  return new Promise((resolve) => {
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      const b = to();
      const c = { x: (a.x + b.x) / 2 + bend, y: Math.min(a.y, b.y) - 90 };
      const e = t * t * (3 - 2 * t);
      const p = bez(a, c, b, e);
      el.style.translate = `${p.x}px ${p.y}px`;
      el.style.scale = `${1 - 0.35 * t}`;
      if (t > 0.05) glowTrail(p);
      if (t >= 1 || !layer.isConnected) {
        el.remove();
        resolve();
      } else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

interface Charge {
  /** a spelling was just said: a spark flies from it to a fist, and the fists glow a little bigger */
  feed(from?: Element): void;
  /** the whole word: every letter sparks at once, the fists blaze and the ninja trembles with power */
  full(from: Element[]): void;
  /** the ninja strikes: the power goes into the move */
  release(): void;
  /** gone at once (leaving the scene) */
  cancel(): void;
}
/** The ninja powers up while Sensei sounds the word out: fists clenched, gritted teeth, a glow gathering in each fist
 *  and a warm light behind. Completely silent, so the sounds of the word are all the child hears. */
function startCharge(layer: HTMLElement | null, power: HTMLElement | null, hero: string, tier: Tier): Charge {
  const cols = COLS[Math.max(1, tier) as Tier];
  const spot = () => layer?.parentElement?.querySelector(".ninja-spot") as HTMLElement | null;
  let level = 0, sent = 0, done = false, gone = false, tremble: Animation | null = null;
  const last: Pt[] = [];
  /** Where fist k is now (null until the ninja is in the fists-clenched pose, e.g. still finishing a "think"). */
  const fist = (k: number): Pt | null => {
    const s = spot();
    const im = s?.querySelector(".nj-img");
    if (s && im && (s.dataset.pose === "power" || s.dataset.pose === "ready")) {
      const r = stageRect(im);
      const f = (FISTS[hero] ?? FISTS.kai)[k];
      last[k] = { x: r.x + r.w * f[0], y: r.y + r.h * f[1] };
    }
    return last[k] ?? null;
  };
  const body = (): Pt => {
    const s = spot();
    if (!s) return { x: 165, y: 500 };
    const r = stageRect(s);
    return { x: r.x + r.w / 2, y: r.y + r.h * 0.55 };
  };
  ninja.pose("power");
  const fists = [0, 1].map(() => {
    const d = document.createElement("div");
    d.className = `so-fist t${tier}`;
    d.innerHTML = "<i></i><i></i><b></b>";
    d.style.scale = "0";
    layer?.appendChild(d);
    return d;
  });
  const grow = () => fists.forEach((d) => (d.style.scale = `${Math.min(1.25, 0.42 + level * 0.1)}`));
  power?.classList.remove("full", "go");
  power?.classList.add("on");
  power?.style.setProperty("--p", "0.25");
  // ignite: a little flare in each fist the moment the chest is tapped
  requestAnimationFrame(() => {
    if (done) return;
    grow();
    fists.forEach((_, k) => {
      const p = fist(k);
      if (p) fx.twinkle(p.x, p.y, cols, 5, 4, 18);
    });
  });
  const track = () => {
    if (gone || !layer?.isConnected) return; // (it keeps following the fists while they flare out on release)
    fists.forEach((d, k) => {
      const p = fist(k);
      // (a fist not placed yet is paused, not just see-through: its crackle never runs hidden)
      d.classList.toggle("off", !p);
      if (p) d.style.translate = `${p.x}px ${p.y}px`;
    });
    requestAnimationFrame(track);
  };
  track();
  // a spark landing: the fist's core flashes (opacity and scale: no filter on the ninja, docs/PERF.md)
  const flash = (k: number) => fists[k]?.querySelector("b")?.animate([{ opacity: 1, scale: "1.5" }, { opacity: 0, scale: "1" }], { duration: 260 / FAST, easing: "ease-out" });
  const send = (el: Element, k: number, bend: number) => {
    if (!layer) return Promise.resolve();
    return spark(layer, centre(el), () => fist(k) ?? body(), cols, 300, bend).then(() => {
      if (done) return;
      level++;
      grow();
      flash(k);
      power?.style.setProperty("--p", `${Math.min(1, 0.25 + level * 0.1)}`);
    });
  };
  return {
    feed(from) {
      if (done || !from) return;
      const k = sent++ % 2;
      void send(from, k, k ? 60 : -60);
    },
    full(from) {
      if (done) return;
      const all = from.map((el, j) => new Promise<void>((r) => setTimeout(() => void send(el, j % 2, (j - from.length / 2) * 30).then(r), j * 40)));
      void Promise.all(all).then(() => {
        if (done) return;
        level = Math.max(level, 8);
        grow();
        power?.classList.add("full");
        power?.style.setProperty("--p", "1");
        const s = spot();
        if (s) {
          const c = body();
          fx.implode(c.x, c.y, cols, 16, 180, 16);
          fx.ring(c.x, c.y, { color: cols[0], r0: 30, r1: 190, width: 10, life: 18 });
          tremble = s.animate([{ translate: "0 0" }, { translate: "2px -1px" }, { translate: "-2px 1px" }, { translate: "1px 1px" }, { translate: "0 0" }], { duration: 130, iterations: Infinity });
        }
      });
    },
    release() {
      if (done) return;
      done = true;
      tremble?.cancel();
      // the glow bursts out of the fists as the move begins (following them), and the power light flares
      fists.forEach((d, k) => {
        const p = last[k];
        if (p) fx.ring(p.x, p.y, { color: cols[0], r0: 16, r1: 90, width: 8, life: 12 });
        // (the animation is cancelled as the fist goes: a filling animation would keep the removed element alive)
        const a = d.animate([{ scale: d.style.scale || "1", opacity: 1 }, { scale: "1.35", opacity: 0.9, offset: 0.25 }, { scale: "0.2", opacity: 0 }], { duration: 150 / FAST, easing: "ease-in", fill: "forwards" });
        const drop = () => ((gone = true), d.remove(), a.cancel());
        a.finished.then(drop, drop);
      });
      power?.classList.remove("full");
      power?.classList.add("go");
      power?.classList.remove("on");
    },
    cancel() {
      done = gone = true;
      tremble?.cancel();
      fists.forEach((d) => d.remove());
      power?.classList.remove("on", "full", "go");
    },
  };
}

/** The chest's face, drawn over its painted eyes (item_chest.webp is 320×312): it blinks now and then (Sort's blink
 *  timer adds "blink" for one short blink), squeezes its eyes shut ("> <") as it shakes its head, and smiles with its
 *  eyes ("^ ^") when it gulps a word. A closed chest sleeps (its lids down) until it opens. */
//  The lids (the ellipses at 175,198 r 22×21 and 242,191 r 20×22) and the lashes that show as they shut are HTML layers
//  the compositor animates (sort.css); the faces are still SVG. (Animating the SVG shapes laid the page out every frame
//  of a blink.)
function ChestEyes({ mood, eyesRef }: { mood?: Mood; eyesRef?: (el: HTMLSpanElement | null) => void }) {
  return (
    <span ref={eyesRef} className={`so-eyes ${mood ?? ""}`} aria-hidden="true">
      <i className="lid l" />
      <i className="lid r" />
      <i className="lash">
        <svg viewBox="0 0 320 312">
          <path d="M157 205 Q175 213 193 205 M226 198 Q242 206 258 198" />
        </svg>
      </i>
      <svg viewBox="0 0 320 312">
        <path className="yum" d="M157 207 Q175 180 193 207 M225 200 Q242 173 259 200" />
        <path className="nope" d="M160 184 L190 198 L160 212 M257 177 L227 191 L257 205" />
      </svg>
    </span>
  );
}
/** A closed chest's lid (the chest art is drawn open, so a closed chest shows its front with this dome over the
 *  opening), in the art's 320×312 box: wood, a gold strap and a keyhole. Still SVG in an HTML wrapper that the
 *  compositor moves when it flies off (sort.css .so-lid). */
function ChestLid({ lidRef, state }: { lidRef?: (el: HTMLSpanElement | null) => void; state: "on" | "drop" }) {
  return (
    <span ref={lidRef} className={`so-lid ${state}`} aria-hidden="true">
      <svg viewBox="0 0 320 312">
        <defs>
          <linearGradient id="so-lid-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c98a4f" />
            <stop offset="0.55" stopColor="#a8622f" />
            <stop offset="1" stopColor="#7e3a1e" />
          </linearGradient>
        </defs>
        {/* the dome */}
        <path d="M10 152 L8 110 C10 72 74 56 162 54 C252 52 310 66 314 104 L314 139 L268 146 L200 152 L150 156 L100 161 L58 157 Z" fill="url(#so-lid-wood)" stroke="#3a150c" strokeWidth="7" strokeLinejoin="round" />
        {/* planks and the lip */}
        <path d="M88 62 Q84 106 86 156 M236 58 Q240 102 238 146" fill="none" stroke="#6b2f16" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
        <path d="M12 134 L58 139 L100 143 L150 138 L200 134 L268 128 L312 121" fill="none" stroke="#5a2410" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M30 100 C42 76 92 64 150 62" fill="none" stroke="#f0bb7a" strokeWidth="7" strokeLinecap="round" opacity="0.75" />
        {/* the gold strap and the keyhole plate */}
        <path d="M142 55 L182 54 L181 152 L143 156 Z" fill="#f0c052" stroke="#3a150c" strokeWidth="5" strokeLinejoin="round" />
        <path d="M150 60 L150 150" stroke="#fff1b8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <rect x="136" y="100" width="52" height="46" rx="10" fill="#f7d36b" stroke="#3a150c" strokeWidth="5" />
        <circle cx="162" cy="116" r="7" fill="#3a150c" />
        <path d="M158 118 L166 118 L169 135 L155 135 Z" fill="#3a150c" />
      </svg>
    </span>
  );
}

export function Sort({ level, onDone }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render)
  const world = worldOf(level);
  const hero = useHero();
  const relaxed = useSave((s) => s.settings.relaxed);
  const { tier } = useStreak();
  const { sound, spellings } = level.sort!;
  const known = knownSpellings(level);
  /** How the game is introduced today (TEACHER_SCRIPT §2.2): the first meeting in full, a later day's recap, or one
   *  line once it is known. Read once, as the level opens. */
  const [form] = useState(() => gameForm("sort", { opening: true }));
  /** The first meeting of three chests: the child opens them ("Tap each chest to open it."); otherwise they open by
   *  themselves, one on each of Sensei's sentences. */
  const [tapToOpen] = useState(() => form === "full" && spellings.length === 3 && HAS.has("tv_sort_open"));
  /** A word can be sorted if it has exactly one spelling of the sound, in one of the chests, and every spelling in it is
   *  one the child knows. The chests' example words (and the demo's word) are kept out of the rounds while there are
   *  enough others. */
  const pools = useRef<{ words: Word[]; demo: Word | null } | null>(null);
  if (!pools.current) {
    const fits = (w: Word) => w.unit <= Math.max(...level.units) && w.segs.filter((s) => s.p === sound).length === 1 && w.segs.some((s) => s.p === sound && spellings.includes(s.g)) && w.segs.every((s) => known.has(s.g));
    const all = WORDS.filter(fits);
    const examples = new Set([...spellings.map((g) => lineWord(wayLine(g, sound))), ...SPELT_WORDS].filter((x): x is string => !!x));
    const spellingIn = (w: Word) => w.segs.find((s) => s.p === sound && spellings.includes(s.g))!.g;
    // the demo's word (TEACHER_SCRIPT §4.3: "back"): the last chest's spelling, at the end of the word ("I can see this
    // spelling at the end."), not one of the chests' examples; else any spelling at the end; else any
    const endsIn = (w: Word, g?: string) => { const s = w.segs.at(-1)!; return s.p === sound && (g ? s.g === g : spellings.includes(s.g)); };
    const free = all.filter((w) => !examples.has(w.text));
    const demo = shuffle(free.filter((w) => endsIn(w, spellings.at(-1))))[0] ?? shuffle(free.filter((w) => endsIn(w)))[0] ?? shuffle(free)[0] ?? null;
    const per = Math.ceil(ROUNDS / spellings.length);
    const words = shuffle(
      spellings.flatMap((g) => {
        const mine = all.filter((w) => spellingIn(w) === g && w !== demo);
        const fresh = mine.filter((w) => !examples.has(w.text));
        // the words the chests weren't shown with first; a chest's own example word only to make up the numbers
        return [...shuffle(fresh), ...shuffle(mine.filter((w) => examples.has(w.text)))].slice(0, per);
      }),
    ).slice(0, ROUNDS);
    // never open on a chest's example word ("In pie, it's spelt like this." · "pie"): the answer was just given
    const lead = words.findIndex((w) => !examples.has(w.text));
    if (lead > 0) [words[0], words[lead]] = [words[lead], words[0]];
    pools.current = { words, demo };
  }
  const words = pools.current.words;
  const demoWord = pools.current.demo;
  const [i, setI] = useState(-1);
  const timeUp = useLessonClock(level);
  /** Where the level is: the introduction (Sensei talking), the chests waiting to be opened, Sensei's demo, the Ready
   *  hold, the child's turns, the end. */
  const [stage, setStage] = useState<"intro" | "chests" | "demo" | "ready" | "play" | "done">("intro");
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [nope, setNope] = useState<string | null>(null); // the chest that was tapped by mistake (it shakes its head)
  const [gone, setGone] = useState(false); // the word has left for its chest
  const [lit, setLit] = useState<number | null>(null); // the spelling being sounded out (-1: the whole word; null: not blending)
  const [asked, setAsked] = useState(false); // the turn is open: the word is being said (the first word: and "Tap the chest…" after it)
  const [fixLit, setFixLit] = useState(false); // the word's spelling of the sound lights (the demo's "I can see this spelling", a correction)
  const [baskets, setBaskets] = useState<Record<string, Word[]>>(Object.fromEntries(spellings.map((g) => [g, []])));
  const [shine, setShine] = useState<Record<string, number>>({});
  const [moods, setMoods] = useState<Record<string, Mood | undefined>>({});
  const [helpLvl, setHelpLvl] = useState(0);
  const [introLit, setIntroLit] = useState<string | null>(null); // the chest being shown in the introduction
  /** Chests still closed (their lid on, asleep, the spelling inside); every sort opens them in its introduction. */
  const [shut, setShut] = useState<string[]>(() => [...spellings]);
  const shutRef = useRef(shut);
  shutRef.current = shut;
  /** Lids on screen: "on" (a closed chest's), "drop" (dropping back on at the end, "the chests close, glowing"). */
  const [lids, setLids] = useState<Record<string, "on" | "drop">>(() => Object.fromEntries(spellings.map((g) => [g, "on" as const])));
  const [waitG, setWaitG] = useState<string | null>(null); // the closed chest the child is asked to tap next
  const [chestsAsked, setChestsAsked] = useState(false); // "…Tap each chest to open it." has been said to the end
  const [heroUp, setHeroUp] = useState(true); // the hero petal above the chests (the introduction)
  const [heroLeaving, setHeroLeaving] = useState(false); // it is shrinking into the top bar (no longer a button)
  const [hdrShown, setHdrShown] = useState(false); // the top bar's petal (once the hero has shrunk into it)
  const [demo, setDemo] = useState<{ w: Word; n: number } | null>(null); // Sensei's demo word on screen
  const [paw, setPaw] = useState<Pt | null>(null); // the demo's paw (TapHint), where it is
  const [point, setPoint] = useState<Pt | null>(null); // the pointing hand (idle, Help, a second miss)
  const alive = useRef(true); // false once the child has left: nothing may carry on after that
  const timers = useRef<number[]>([]);
  const misses = useRef(0);
  const missedThis = useRef(0); // wrong tries on this word (its right answer is then no longer a streak hit)
  const hard = useRef<boolean[]>([]); // per word: the second miss or Help's glow came (TEACHER_SCRIPT §2.2 "struggled")
  const hintUntil = useRef(-1); // after a miss, the pink "look here" shows on that word and the next one
  const busy = useRef(false);
  const frozen = useRef(false); // stop the fall while Sensei explains, and once the word is sorted
  const said = useRef(false); // the word has been said (it only starts falling then)
  const fallSync = useRef<(() => void) | null>(null); // (the fall pauses or goes on at once when either changes)
  const setFrozen = (v: boolean) => void ((frozen.current = v), fallSync.current?.());
  const setSaid = () => void ((said.current = true), fallSync.current?.());
  const lineGate = useRef<Promise<void> | null>(null); // a streak line (or praise) the next word waits for
  const lastCheer = useRef(-Infinity); // when the last streak line or praise ended (game ms): praise never stacks on one
  /** When the last praise, streak line or "Keep going, ninja." started (game ms): two of them (or one and the closing
   *  line) never start within 5 s of each other (TEACHER_SCRIPT §5.3; script-audit's praise-stacks). */
  const cheerAt = useRef(-Infinity);
  const wordGate = useRef<Promise<void> | null>(null); // (the same, for the word on screen)
  const helpQueued = useRef(false); // Help was pressed mid-move: help with the next word once it's said
  const recentMoves = useRef<Move[]>([]);
  const lastWay = useRef<Move | null>(null);
  const charge = useRef<Charge | null>(null);
  const phase = useRef<"charge" | "strike" | null>(null); // (for the bots and review films)
  const moodTimers = useRef<Record<string, number>>({});
  const chestRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const eyesRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const mouthRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lidRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const wordRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chargeRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroSwRef = useRef<HTMLDivElement>(null);
  const hdrRef = useRef<HTMLDivElement>(null);
  const w = words[i];
  /** The word on the panel: the turn's word, or Sensei's demo word before the turns. */
  const pw = w ?? demo?.w;
  const spellingOf = (w: Word) => w.segs.find((s) => s.p === sound && spellings.includes(s.g))!.g;
  /** A one-off timeout that's cleared (and never runs) once the child has left. */
  const later = (fn: () => void, ms: number) => void timers.current.push(window.setTimeout(() => alive.current && fn(), ms));
  const intro = useRef<Intro | null>(null);
  /** A tap on a closed chest while the child is asked to open them (the chest phase's waiter). */
  const waiter = useRef<((g: string) => void) | null>(null);
  /** Said before the first word on a recap with no Ready hold ("Now it's your turn."). */
  const turnLead = useRef<Say[]>([]);
  /** A recap with no hold is framed (TEACHER_SCRIPT §2.2) at the child's first answer. */
  const frameAtAnswer = useRef(false);

  // ---------------------------------------------------------------- the introduction's pieces
  /** The chest's mouth, its opening (where a word goes in). */
  const mouthOf = (g: string): Pt => centre(mouthRefs.current[g] ?? document.body);
  /** The hero petal's round top (where the star to a chest sets off). */
  const heroTop = (): Pt => {
    const r = stageRect(heroRef.current);
    return r.w ? { x: r.x + r.w / 2, y: r.y + r.w / 2 } : { x: 682, y: 260 };
  };
  const swellHero = () => heroSwRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)", offset: 0.35 }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
  /** A chest opens: a star flies from the petal into it; its lid flies off, light and blossoms spill out, it wakes up and
   *  its spelling springs out of it onto its label. */
  function openChest(g: string, k: number) {
    if (!shutRef.current.includes(g)) return;
    hop(g, 22);
    sfx.pop();
    swellHero();
    const layer = chargeRef.current;
    const land = () => {
      if (!alive.current) return;
      const lid = lidRefs.current[g];
      const off = lid?.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: "translate(-4%, -30%) rotate(-10deg) scale(1.04)", opacity: 1, offset: 0.45 },
          { transform: "translate(-8%, -52%) rotate(-18deg) scale(1.08)", opacity: 0 },
        ],
        { duration: 420 / FAST, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" },
      );
      off?.finished.then(
        () => {
          if (alive.current) setLids((l) => { const n = { ...l }; delete n[g]; return n; });
          dropAnim(off);
        },
        () => {},
      );
      setShut((s) => s.filter((x) => x !== g));
      setShine((s) => ({ ...s, [g]: (s[g] ?? 0) + 1 }));
      const m = mouthOf(g);
      sfx.sparkle();
      fx.burst(m.x, m.y - 10, "blossoms", 12, 0.8);
      fx.twinkle(m.x, m.y - 20, COLS[1], 10, 7);
      fx.ring(m.x, m.y, { color: "#ffe38a", r0: 20, r1: 130, width: 10, life: 20 });
      // it wakes: one blink as the eyes open
      const eyes = eyesRefs.current[g];
      if (eyes) {
        eyes.classList.add("blink");
        later(() => eyes.classList.remove("blink"), 320);
      }
      // its spelling springs out of its mouth onto the label
      const label = labelRefs.current[g], chest = chestRefs.current[g];
      if (label && chest) {
        const cw = chest.offsetWidth, ch = chest.offsetHeight;
        const dx = (0.55 - 0.19) * cw, dy = (0.37 - 0.71) * ch;
        label.animate(
          [
            { translate: `${dx}px ${dy}px`, scale: "0.3", opacity: 0 },
            { translate: `${dx * 0.4}px ${dy * 1.5}px`, scale: "1.15", opacity: 1, offset: 0.5 },
            { translate: "0 0", scale: "1", opacity: 1 },
          ],
          { duration: 520 / FAST, easing: "cubic-bezier(.3,1.3,.5,1)", fill: "backwards" },
        );
      }
    };
    if (layer) void spark(layer, heroTop(), () => mouthOf(g), COLS[1], 360, k % 2 ? 70 : -70).then(land);
    else land();
  }
  /** One chest's sentence (SCRIPT_FIXES C1, TEACHER_SCRIPT §4.3): the first opened, "This is the way we spell it in cat."
   *  (tg_<g>_<p>_way); the others, "In kit, it's spelt like this." with an example word no other chest has used. */
  const usedWords = useRef(new Set<string>());
  const chestSay = (g: string, first: boolean): Say[] => {
    const used = usedWords.current;
    const way = wayLine(g, sound);
    const wayWord = lineWord(way);
    if (first && HAS.has(way) && !(wayWord && used.has(wayWord))) {
      if (wayWord) used.add(wayWord);
      return [{ line: way }];
    }
    const spelt = SPELT_WORDS.find((x) => !used.has(x) && WORD_BY_TEXT[x]?.segs.some((s) => s.g === g && s.p === sound));
    if (spelt) {
      used.add(spelt);
      return [{ line: `tv_spelt_like_this_${spelt}` }];
    }
    if (HAS.has(way)) {
      if (wayWord) used.add(wayWord);
      return [{ line: way }];
    }
    // (older recordings: "This is the way we spell… /k/ …in cat.")
    const tail = `tg_${g.replace(/-/g, "")}_${sound}_in`;
    return HAS.has("t_way_we_spell") && HAS.has(tail) ? [{ line: "t_way_we_spell" }, { gap: 80 }, { sound, show: "petal" }, { gap: 80 }, { line: tail }] : [{ sound, show: "petal" }];
  };
  /** The one chest whose "It's two letters, but it's one sound." is due (SCRIPT_FIXES C1: spaced in sessions, never a
   *  spelling taught this session, at most one chest a sort). */
  const dueChest = useRef<string | null | undefined>(undefined);
  const lettersDue = (): string | null => {
    if (dueChest.current !== undefined) return dueChest.current;
    const narr = ((store.get() as { narr?: Record<string, Exposure> }).narr ?? {}) as Record<string, Exposure>;
    return (dueChest.current =
      spellings.find((g) => !!lettersLine({ g, p: sound }) && !taughtThisSession(lettersKey(g)) && dueInSessions(narr[lettersKey(g)], sessionNow(), SESSIONS.reminder)) ?? null);
  };
  /** Say a chest's part: its sentence (the chest's label glowing), and its letters line when it is the due one, ending
   *  on the sound as the hero petal swells (Dec4: "It's two letters, but it's one sound. /k/"). Resolves false if it was
   *  cut off. */
  const sayChest = async (g: string, first: boolean): Promise<boolean> => {
    const sentence = chestSay(g, first);
    const letters = g === lettersDue() ? lettersFor({ g, p: sound }) : [];
    intro.current?.chests.push({ g, say: sentence });
    setIntroLit(g);
    const end: Say[] = letters.length && g !== "x" ? [{ gap: 200 }, { sound, show: "petal" }] : [];
    const ok = await say([...sentence, ...(letters.length ? [{ gap: 220 }, ...letters, ...end] : [])]);
    if (ok && letters.length) told(lettersKey(g), LETTERS);
    if (alive.current) setIntroLit(null);
    return ok;
  };
  /** The hero petal shrinks into the top bar, where it stays for the game. */
  const heroToHeader = async () => {
    const el = heroRef.current, hd = hdrRef.current;
    if (!el || !hd) return void (setHeroUp(false), setHdrShown(true));
    setHeroLeaving(true);
    const a = stageRect(el), b = stageRect(hd.firstElementChild ?? hd);
    const dx = b.x + b.w / 2 - (a.x + a.w / 2), dy = b.y + b.h / 2 - (a.y + a.h / 2), s = b.w / Math.max(1, a.w);
    sfx.swish();
    const an = el.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.7}px) scale(${(1 + s) / 2})`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 1, offset: 0.85 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0 },
      ],
      { duration: 640 / FAST, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" },
    );
    later(() => {
      setHdrShown(true);
      const r = stageRect(hd);
      fx.twinkle(r.x + r.w / 2, r.y + r.w / 2, COLS[1], 8, 4, 18);
    }, 560);
    await an.finished.catch(() => {});
    if (alive.current) setHeroUp(false);
    dropAnim(an);
  };

  // ---------------------------------------------------------------- Sensei's demo (TEACHER_SCRIPT §4.3)
  /** "I'll sort the first one. My word is… back. I can see this spelling at the end. So it goes in this chest.": the
   *  word drops in and sinks, its spelling of the sound lights, the paw taps its chest and the ninja kicks it in. Also
   *  the paw's replay in the Ready hold (`live` stops it). */
  const demoN = useRef(0);
  const demoFall = useRef<Animation | null>(null);
  async function runDemo(live: () => boolean = () => alive.current, o: { wordAfter?: number } = {}) {
    const dw = demoWord;
    if (!dw) return;
    const g = spellingOf(dw);
    const ok = () => alive.current && live();
    const tidy = () => {
      dropAnim(demoFall.current);
      demoFall.current = null;
      if (!alive.current) return;
      setPaw(null);
      setFixLit(false);
      setDemo(null);
    };
    setGone(false);
    setFixLit(false);
    const named = say([...L("tv_sort_ido"), { gap: 100 }, { word: dw.text }]);
    // (straight after the chests, Sensei starts at once and the word drops in once the petal has left the middle)
    if (o.wordAfter) await sleep(o.wordAfter);
    if (!ok()) return tidy();
    setDemo({ w: dw, n: ++demoN.current });
    // the word sinks to just above the chests (on the compositor) while it is named
    await until(() => !alive.current || !!wordRef.current?.isConnected, 600);
    dropAnim(demoFall.current);
    demoFall.current = wordRef.current?.animate([{ translate: "-50% 0" }, { translate: `-50% ${FALL * 0.62}px` }], { duration: 2600 / FAST, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" }) ?? null;
    if (!(await named) || !ok()) return tidy();
    const s = dw.segs.at(-1)!;
    const atEnd = s.p === sound && s.g === g;
    setFixLit(true); // < ck > in the word lights
    if (atEnd && HAS.has("tv_sort_see")) {
      await sleep(120);
      if (!(await say({ line: "tv_sort_see" })) || !ok()) return tidy();
    } else await sleep(500);
    if (!ok()) return tidy();
    // the paw sets off from Sensei's corner as the line starts, taps the chest on "this chest", and the ninja kicks
    const chest = chestRefs.current[g];
    const r = stageRect(chest);
    navLog({ kind: "paw", id: `sort:${dw.text}` });
    setPaw({ x: 1110, y: 520 });
    const cue = nextClip("tv_sort_so", 2500);
    const so = say(L("tv_sort_so"));
    await sleep(40);
    if (ok()) setPaw({ x: r.x + r.w * 0.55 - 53, y: r.y + r.h * 0.3 - 11 });
    await cue;
    await sleep(950);
    if (!ok()) return tidy();
    hop(g, 18);
    sfx.tap();
    const m = mouthOf(g);
    fx.twinkle(m.x, m.y, COLS[1], 6, 4, 16);
    await kickIn(g, dw, ok);
    if (!ok()) return tidy();
    setPaw(null);
    await so;
    tidy();
  }
  /** The demo's word goes in: a kick from the ninja (no charge: Sensei is showing where it goes). `live`: a replay the
   *  child has answered stops here. */
  async function kickIn(g: string, word: Word, live: () => boolean) {
    const box = wordRef.current, panel = panelRef.current;
    const t = streak.tier;
    if (!box || !panel) return land(g, word, t, false);
    phase.current = "strike";
    await ninja.strike(panel, { move: "kick" });
    if (!live()) return void (phase.current = null);
    await flyIn(box, mouthOf(g), t, "knock", 400);
    phase.current = null;
    if (!live()) return;
    setGone(true);
    land(g, word, t, false);
  }

  useEffect(() => {
    alive.current = true;
    let live = true;
    playMusic("dojo");
    /** The chests' and the demo's lines, then the words and their sounds, fetched once the lead is under way (not at
     *  mount: downloads queued ahead of the lead held the level's first line back by seconds on a busy phone), so
     *  nothing waits on a download later (a gap in the talk). */
    const warmIntro = () =>
      void preload([
        ...[
          ...(tapToOpen ? ["tv_sort_open"] : []),
          ...spellings.map((g) => wayLine(g, sound)),
          ...SPELT_WORDS.filter((x) => WORD_BY_TEXT[x]?.segs.some((s) => s.p === sound && spellings.includes(s.g))).map((x) => `tv_spelt_like_this_${x}`),
          ...((g) => (g ? [lettersLine({ g, p: sound }) ?? "", "st_two_letters_too"] : []))(lettersDue()),
          ...(form === "full" || form === "recap" ? ["tv_sort_ido", "tv_sort_see", "tv_sort_so", readyAsk("sort", form)?.line ?? "tv_now_your_turn"] : []),
          "help_sort",
        ]
          .filter((id) => HAS.has(id))
          .map(urls.line),
        ...(demoWord ? [urls.word(demoWord.text)] : []),
        ...words.map((w) => urls.word(w.text)),
        ...new Set(words.flatMap((w) => w.segs.map((s) => urls.sound(s.p)))),
      ]);
    streak.reset();
    spellings.forEach((_, k) => later(() => sfx.pop(), 330 + k * 160));
    (async () => {
      const on = () => live && alive.current;
      const petal: Say = { sound, show: "petal" };
      // the sound, once, with its petal (SCRIPT_FIXES C1: "say the sound once in the lead"; SOUND_DISPLAY r44)
      const soundLead: Say[] = HAS.has("tv_here_sound") ? [{ line: "tv_here_sound" }, { gap: 120 }, petal] : [petal];
      const waysId = sortWaysLine(spellings.length);
      const ways = waysId ? L(waysId) : [];
      const opener = form === "full" ? L("tv_sort_frame") : form === "recap" ? L("tv_sort_recap") : L("audit_sort_again");
      intro.current = { lead: [...opener, { gap: 300 }, ...soundLead, { gap: 350 }, ...ways], chests: [] };
      // full: "Here's the sound… /k/ · You know this sound! Now let's look at the different ways we spell it. · This game is
      // called Sorting. Every word goes in the chest with the same spelling. · (This sound can be spelt in three ways. Tap
      // each chest to open it.)"; recap: "It's Sorting again…" · the sound · the ways; short: "Sorting time! Same sound,
      // different spellings." · the sound · the ways
      const lead: Say[] =
        form === "full"
          ? [...soundLead, { gap: 400 }, ...L("audit_bridging_first"), { gap: 300 }, ...L("tv_sort_frame"), ...(tapToOpen ? [] : [{ gap: 300 }, ...ways])]
          : [...opener, { gap: 300 }, ...soundLead, { gap: 350 }, ...ways];
      await sleep(250 + spellings.length * 160); // (the chests and the petal pop in)
      if (!on()) return;
      const leadSaid = say(lead);
      later(warmIntro, 1200);
      if (!(await leadSaid) || !on()) return;
      if (tapToOpen) {
        // the chests open on the child's taps; the next closed one wiggles (and after 8 s the hand points at it)
        setStage("chests");
        const opening = say(L("tv_sort_open"));
        let first = true;
        let tapped = new Promise<string>((r) => (waiter.current = r));
        // the first chest wiggles as the line starts (TEACHER_SCRIPT §4.3), and is live from its first word
        setWaitG(shutRef.current[0] ?? null);
        void opening.then(() => alive.current && setChestsAsked(true));
        // (a tap during "…Tap each chest to open it." opens the chest at once; its sentence waits for the line. A tap
        // while a chest's sentence is said only nods: nothing is queued behind Sensei's back)
        let g: string | null = await Promise.race([tapped, opening.then(() => null)]);
        while (on()) {
          if (g === null) {
            if (!waiter.current) tapped = new Promise<string>((r) => (waiter.current = r));
            setWaitG(shutRef.current[0] ?? null);
            g = await tapped;
          }
          if (!on()) return;
          setWaitG(null);
          setPoint(null);
          openChest(g, spellings.indexOf(g));
          await opening;
          if (!on()) return;
          const was = g;
          const left = shutRef.current.filter((x) => x !== was).length;
          await sayChest(was, first);
          first = false;
          if (!on() || !left) break;
          g = null;
        }
        waiter.current = null;
        setWaitG(null);
      } else {
        // each chest opens as its sentence is said, left to right
        for (const [k, g] of spellings.entries()) {
          openChest(g, k);
          await sayChest(g, k === 0);
          if (!on()) return;
          await sleep(150);
        }
      }
      if (!on()) return;
      setStage("demo");
      // the petal shrinks into the top bar as Sensei moves on
      const toBar = heroToHeader();
      if (form === "full" || form === "recap") {
        await runDemo(on, { wordAfter: 450 });
        if (!on()) return;
        // (the ninja finishes its kick before it turns to ▶ in its ready stance)
        await until(() => !on() || !ninja.busy, 900);
        if (!on()) return;
        const ask = readyAsk("sort", form);
        if (ask && HAS.has(ask.line)) {
          setStage("ready");
          const how = await holdReady("sort", {
            ask: [{ line: ask.line }],
            again: () => say([...opener, { gap: 300 }, { line: ask.line }]),
            show: (liveNow) => runDemo(() => on() && liveNow()),
            at: "column",
          });
          if (how === false || !on()) return;
          framed("sort", ask);
        } else if (form === "recap") {
          turnLead.current = [...L("tv_now_your_turn"), { gap: 200 }];
          frameAtAnswer.current = true;
        }
      }
      await toBar;
      if (!on()) return;
      setDemo(null);
      setPaw(null);
      setStage("play");
      setI(0);
    })();
    return () => {
      live = false;
      alive.current = false;
      timers.current.forEach(clearTimeout);
      Object.values(moodTimers.current).forEach(clearTimeout);
      charge.current?.cancel();
      ninja.pose(null);
      hush();
    };
  }, []);

  // The chests blink now and then: every 5.6 s each, the first ones staggered as before (1.4 s + 1.9 s a chest, then
  // most of a cycle). Each blink is one short animation started here: an endless animation on an SVG shape is repainted
  // on the main thread every frame, even while the eyes are open. (A face pulled meanwhile wins: see sort.css; a closed
  // chest sleeps, so it doesn't blink.)
  useEffect(() => {
    const ts = new Set<number>();
    const after = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => (ts.delete(id), fn()), ms);
      ts.add(id);
    };
    spellings.forEach((g, k) => {
      const blink = () => {
        const el = eyesRefs.current[g];
        if (el && !shutRef.current.includes(g)) {
          el.classList.add("blink");
          after(() => el.classList.remove("blink"), 320);
        }
        after(blink, 5600);
      };
      after(blink, 1400 + k * 1900 + 5342);
    });
    return () => ts.forEach(clearTimeout);
  }, []);

  // The chests waiting to be opened: 8 s without a tap once Sensei has asked, the hand points at the one that wiggles
  useEffect(() => {
    if (!waitG || !chestsAsked) return;
    const t = window.setTimeout(() => alive.current && setPoint(pointAt(waitG)), 8000);
    return () => clearTimeout(t);
  }, [waitG, chestsAsked]);

  // new word: it pops in, Sensei says it (after any streak line or praise) and it starts falling (the fall pauses while
  // the phone is upright or Sensei is explaining, and stops once it's sorted). The first word comes with its question:
  // "[cap] · Tap the chest with the same spelling as the word." (TEACHER_SCRIPT §4.3, every time).
  useEffect(() => {
    if (i < 0 || i >= words.length) return;
    setResult(null);
    setNope(null);
    setGone(false);
    setLit(null);
    setFixLit(false);
    setPoint(null);
    setAsked(false);
    missedThis.current = 0;
    frozen.current = false;
    said.current = false;
    let live = true;
    const gate = (wordGate.current = lineGate.current);
    lineGate.current = null;
    const sayIt = setTimeout(async () => {
      if (gate) await gate;
      if (!live || !alive.current || busy.current) return;
      if (turnLead.current.length) {
        const lead = turnLead.current;
        turnLead.current = [];
        await say(lead);
        if (!live || !alive.current || busy.current) return;
      }
      setSaid();
      if (i > 0) setAsked(true);
      await say([{ word: words[i].text }, ...(i === 0 ? [{ gap: 250 }, ...L("help_sort")] : [])]);
      if (live && alive.current) setAsked(true);
      if (!live || !alive.current || busy.current || !helpQueued.current) return;
      helpQueued.current = false;
      help(1);
    }, 320);
    if (relaxed) return () => void ((live = false), clearTimeout(sayIt));
    const dur = 9000 - i * 500;
    // The word sinks on the compositor: a translate animation, paused until the word has been said, while Sensei
    // explains and while the phone is upright (docs/PERF.md: moving it with style.top laid the page out every frame).
    // (fast.ts speeds it up for bots, as the frame loop's FAST did.)
    const fall = wordRef.current?.animate([{ translate: "-50% 0" }, { translate: `-50% ${FALL}px` }], { duration: dur, fill: "forwards" }) ?? null;
    fall?.pause();
    let held = true; // (only a pause of ours is lifted here)
    const sync = () => {
      if (!fall || fall.playState === "finished") return;
      const go = !frozen.current && said.current && !isUpright();
      if (go && held && fall.playState === "paused") {
        fall.play();
        held = false;
      } else if (!go && fall.playState === "running") {
        fall.pause();
        held = true;
      }
    };
    fallSync.current = sync;
    // (the phone turned upright: checked a few times a second, not every frame)
    const upright = window.setInterval(sync, 250);
    return () => {
      live = false;
      clearTimeout(sayIt);
      clearInterval(upright);
      if (fallSync.current === sync) fallSync.current = null;
      // (a paused or filling animation keeps its element, and the whole word, alive after it has gone: docs/PERF.md)
      fall?.cancel();
    };
  }, [i]);

  /** A happy little hop (the chest that was just picked, or all of them cheering at the end). */
  const hop = (g: string, h = 16) =>
    chestRefs.current[g]?.animate(
      [
        { translate: "0 0", scale: "1" },
        { translate: `0 -${h}px`, scale: "0.95 1.07", offset: 0.4 },
        { translate: "0 0", scale: "1.05 0.95", offset: 0.75 },
        { translate: "0 0", scale: "1" },
      ] as Keyframe[],
      { duration: 340, easing: "ease-out" },
    );
  /** A chest that can't be opened now (Sensei is talking) nods: a small wiggle and a tink. */
  const nod = (g: string) => {
    chestRefs.current[g]?.animate([{ rotate: "0deg" }, { rotate: "-4deg", offset: 0.3 }, { rotate: "3deg", offset: 0.65 }, { rotate: "0deg" }] as Keyframe[], { duration: 320, easing: "ease-in-out" });
    sfx.tink();
  };
  /** Where the pointing hand stands to point at chest g (its fingertip on the chest's opening). */
  const pointAt = (g: string): Pt => {
    const r = stageRect(chestRefs.current[g] ?? null);
    return { x: r.x + r.w * 0.55 - 53, y: r.y + r.h * 0.34 - 11 };
  };

  /** A chest pulls a face for a moment. */
  const face = (g: string, m: Mood, ms: number) => {
    clearTimeout(moodTimers.current[g]);
    setMoods((s) => ({ ...s, [g]: m }));
    moodTimers.current[g] = window.setTimeout(() => setMoods((s) => ({ ...s, [g]: undefined })), ms);
  };

  /** The chest gulps the word: squash and stretch, a happy squint, light spills out, blossoms and sparkles, and the
   *  word stands up inside. (A word already in the chest, the demo's replayed, isn't added twice.) */
  function land(g: string, word: Word, t: Tier, big: boolean) {
    const chest = chestRefs.current[g];
    const m = mouthOf(g);
    sfx.coin();
    sfx.place();
    chest?.animate(
      [
        { scale: "1" },
        { scale: "1.13 0.84", offset: 0.18 },
        { scale: "0.94 1.1", offset: 0.45 },
        { scale: "1.03 0.98", offset: 0.72 },
        { scale: "1" },
      ] as Keyframe[],
      { duration: 520, easing: "ease-out" },
    );
    face(g, "yum", 900);
    setShine((s) => ({ ...s, [g]: (s[g] ?? 0) + 1 }));
    fx.burst(m.x, m.y - 10, "blossoms", 10 + t * 4, 0.8);
    fx.twinkle(m.x, m.y - 20, COLS[t], 10 + t * 3, 7 + t);
    fx.ring(m.x, m.y, { color: COLS[t][0], r0: 20, r1: 120 + t * 24, width: 10, life: 20 });
    if (t >= 1) fx.burst(m.x, m.y - 20, "stars", 3 + t * 2, 0.8);
    if (big) {
      sfx.boom();
      shakeStage();
      fx.ring(m.x, m.y, { color: "#fff", r0: 30, r1: 260, width: 14, life: 26 });
      fx.burst(m.x, m.y - 30, "confetti", 30, 1.1);
    }
    setBaskets((b) => (b[g].some((x) => x.text === word.text) ? b : { ...b, [g]: [...b[g], word] }));
  }

  /** Which move sends this word in: a kick to open, a big flip to close, otherwise a strike from the streak tier's
   *  pool and now and then a spell, never the same as either of the last two. */
  function pickMove(finale: boolean, t: Tier): Move {
    const recent = recentMoves.current;
    let m: Move;
    if (finale) m = recent.includes("flip") ? "kick" : "flip";
    else if (i === 0) m = "kick";
    else if (!recent.includes("cast") && Math.random() < SPELL_CHANCE[t]) m = "cast";
    else {
      const pool = POOL[t].filter((x) => !recent.includes(x));
      m = pool[(Math.random() * pool.length) | 0] ?? POOL[t][0];
    }
    recent.push(m);
    if (recent.length > 2) recent.shift();
    lastWay.current = m;
    return m;
  }

  /** The ninja lets its power go and sends the word into chest g. Resolves once it has landed. */
  async function sendIn(g: string, word: Word, finale: boolean, c: Charge) {
    const box = wordRef.current, panel = panelRef.current;
    const t = streak.tier;
    if (!box || !panel) {
      c.cancel();
      ninja.pose(null);
      return land(g, word, t, finale);
    }
    const move = pickMove(finale, t);
    phase.current = "strike";
    const hit = move === "cast" ? ninja.act("cast", panel, { react: false }) : ninja.strike(panel, { move });
    ninja.pose(null); // (after the move has begun, so the fists-clenched pose goes straight into the move)
    c.release();
    await hit;
    if (!alive.current) return;
    await flyIn(box, mouthOf(g), t, move === "cast" ? "spell" : "knock", move === "cast" ? 520 : finale ? 500 : 400);
    if (!alive.current) return;
    setGone(true);
    land(g, word, t, finale);
  }

  /** Game time (what the child hears: the fast-forward factor included). */
  const gameNow = () => performance.now() * FAST;
  /** Say a cheer (praise, a streak line, "Keep going, ninja."), noting when it started and ended. */
  const cheer = async (id: string): Promise<boolean> => {
    cheerAt.current = gameNow();
    const ok = await say({ line: id });
    lastCheer.current = gameNow();
    return ok;
  };
  /** Wait until the last cheer started at least `ms` ago (game time). */
  const afterCheer = (ms = 5200): Promise<void> => {
    const wait = ms - (gameNow() - cheerAt.current);
    return wait > 0 ? sleep(wait).then(() => {}) : Promise.resolve();
  };

  /** A wrong chest (TEACHER_SCRIPT §5.4): the chest shakes its head and the word bounces back out; its spelling of the
   *  sound lights; "Let's look again. Which chest has the same spelling?" A second miss on the word: "Let's do it
   *  together. It's this one. Now you tap it." with the right chest glowing and the hand pointing at it. Never "No". */
  async function wrongChest(g: string, w: Word) {
    busy.current = true;
    setFrozen(true);
    setSaid();
    misses.current++;
    const attempt = ++missedThis.current;
    if (attempt >= 2) hard.current[i] = true;
    hintUntil.current = i + 1;
    if (frameAtAnswer.current) {
      frameAtAnswer.current = false;
      framed("sort");
    }
    setResult("wrong");
    setNope(g);
    face(g, "no", 900);
    hush();
    const m = mouthOf(g);
    fx.puff(m.x, m.y + 10, 8);
    // the word bounces off the chest and back up
    const drop = wordRef.current?.firstElementChild as HTMLElement | null;
    const p = panelRef.current;
    if (drop && p) {
      const a = centre(p), c = mouthOf(g);
      drop.animate(
        [{ transform: "none" }, { transform: `translate(${(c.x - a.x) * 0.22}px, ${Math.max(0, c.y - a.y) * 0.3}px) scale(0.92)`, offset: 0.4 }, { transform: "translate(0, -14px)", offset: 0.72 }, { transform: "none" }],
        { duration: 480, easing: "ease-out" },
      );
    }
    // the ninja has a little think by itself when a streak was going. "Keep going, ninja." (a lost streak of 3 or more)
    // is said here, FIRST, as the other scenes do: left to the ninja it came after the correction, so the child tried
    // again with the encouragement in their ears instead of the question, and it stacked on the next praise or the close
    // (not straight after praise: "That's the right chest." then "Keep going, ninja." within 5 s is a stack, and the
    // correction follows anyway)
    const e = streak.miss({ line: false });
    if (e.prevN < 3) sfx.wrong(); // (a lost streak of 3+ gets the ninja's soft fizzle instead)
    if (e.prevN === 0 && !ninja.busy) void ninja.act("think");
    const lost = gameNow() - cheerAt.current < 5200 ? null : streakLine(e);
    await sleep(320);
    if (!alive.current) return;
    if (lost) {
      await cheer(lost);
      if (!alive.current) return;
      await sleep(150);
    }
    setFixLit(true);
    const right = spellingOf(w);
    let fix: Say[];
    if (attempt >= 2 && HAS.has("tv_fix_together")) {
      setHelpLvl(2); // the right chest glows
      setPoint(pointAt(right));
      fix = [{ line: "tv_fix_together" }];
    } else fix = pictureCorrection({ game: "sort", tapped: g, target: right, attempt }).say;
    if (!fix.length) fix = [{ word: w.text }];
    await say(fix);
    if (!alive.current) return;
    setFixLit(false);
    setNope(null);
    setResult(null);
    setFrozen(false);
    busy.current = false;
  }

  const choose = async (g: string) => {
    if (!w || result || busy.current) return;
    const right = spellingOf(w) === g;
    recordRead(w, right);
    if (!right) return wrongChest(g, w);
    if (frameAtAnswer.current) {
      frameAtAnswer.current = false;
      framed("sort");
    }
    busy.current = true;
    setFrozen(true);
    setSaid();
    setPoint(null);
    setFixLit(false);
    setResult("right"); // the word turns green where it is
    sfx.good();
    hop(g);
    const finale = i + 1 >= words.length || timeUp(); // (a cut lesson ends after this word when its time is up)
    const retry = missedThis.current > 0;
    // the ninja powers up while the word is sounded out: each spelling lights up as it's said and sends a spark
    const c = (charge.current = startCharge(chargeRef.current, powerRef.current, hero, streak.tier));
    phase.current = "charge";
    // a streak line still to come or being said ("Wow! Super ninja streak!") finishes first, while the ninja charges
    if (wordGate.current) await wordGate.current;
    if (!alive.current) return;
    const letters = () => [...(panelRef.current?.querySelectorAll(".so-letters > span") ?? [])];
    const onSeg = (k: number) => {
      if (!alive.current) return;
      setLit(k);
      if (k >= 0) c.feed(letters()[k]);
      else c.full(letters());
    };
    // the model answer: the word sounded out, each spelling lighting as it is said (after a miss too: the correction
    // was about looking, so this is where the child hears it)
    await say([{ gap: 120 }, ...blend(w, onSeg)]);
    if (!alive.current) return;
    // then the ninja sends it into the chest (the move's sounds never land on the teaching sounds)
    await sendIn(g, w, finale, c);
    charge.current = phase.current = null;
    if (!alive.current) return;
    let tierUp = false;
    if (!retry) {
      // the ninja powers up at once on a new tier; its line ("Ninja power!") is said here, as this answer's praise, never
      // within 5 s of the last cheer (the next word waits for it). On the last word the power-up is silent, as the
      // closing line is the level's praise (nothing is stacked on it)
      const e = streak.hit({ line: false });
      tierUp = e.tierUp;
      const id = tierUp && !finale ? streakLine(e) : null;
      if (id)
        lineGate.current = (async () => {
          await afterCheer();
          if (alive.current) tierLineSaid(id, await cheer(id));
        })();
    }
    // (the gem's first fill, audit_gem_first, is not explained here: it no longer interrupts the child's own sorting and
    // is said at the level's reward instead, TEACHER_SCRIPT §5.7, FIX_PLAN TV-B1.3)
    // praise now and then (TEACHER_SCRIPT §5.3: "That's the right chest.", at most every second right answer; here every
    // fourth, as the ninja's move is the praise in between and a sort moves fast), never with a tier line or the close
    // (a streak line under 7 s ago was this answer's cheer too: "Ninja power!" then "That's the right chest." is a stack)
    const cheered = gameNow() - lastCheer.current < 7000;
    const line = praiseFor({ game: "sort", every: retry ? 2 : 4, replaced: tierUp || cheered, closingNext: finale, keptGoing: retry, helped: helpLvl >= 2 });
    if (!finale) {
      if (line)
        lineGate.current = (async () => {
          await afterCheer();
          if (alive.current) await cheer(line);
        })();
      // the next word pops straight in (it's said once the streak line or praise, if any, is over). A chest tap before it
      // is said is a second tap for this word (a quick double tap), not an answer to the next one: it only nods
      said.current = false;
      busy.current = false;
      setI(i + 1);
      return;
    }
    if (tierUp) {
      await lineGate.current;
      await until(() => !alive.current || !ninja.busy, 1600);
      if (!alive.current) return;
    }
    setStage("done");
    played("sort", { struggled: struggledIn(words.map((_, k) => !!hard.current[k])) });
    fx.rain("confetti", 60);
    // the chests close, glowing (TEACHER_SCRIPT §4.3): each lid drops back on with a hop, a happy squint and a sparkle,
    // left to right, while the ninja celebrates
    spellings.forEach((cg, k) =>
      later(() => {
        setLids((l) => ({ ...l, [cg]: "drop" }));
        later(() => {
          hop(cg, 26);
          face(cg, "yum", 1400);
          const m = mouthOf(cg);
          fx.twinkle(m.x, m.y - 20, COLS[1], 12, 7);
          fx.ring(m.x, m.y - 10, { color: "#ffe38a", r0: 30, r1: 150, width: 10, life: 22 });
          sfx.pop();
        }, 260);
      }, 800 + k * 170),
    );
    // the level's closing line (games.ts levelWrap, said once): "Same sound, different spellings. You sorted them all."
    const wrap = levelWrap(level).filter((id) => HAS.has(id));
    const closing = wrap[0] ?? "sort_done";
    // (never within 5 s of the last cheer: "Keep going, ninja." or praise, then the close, is a stack)
    const close = afterCheer().then(() => (alive.current ? say((wrap.length ? wrap : ["sort_done"]).flatMap((id, k) => [...(k ? [{ gap: 250 }] : []), { line: id }])) : false));
    await Promise.all([close, ninja.celebrate()]);
    if (!alive.current) return;
    onDone(misses.current <= 1 ? 3 : misses.current <= 3 ? 2 : 1, { closing });
  };

  /** Every tap on a chest: opening it (the introduction), "I'm ready" (the Ready hold), or an answer. */
  const tapChest = (g: string) => {
    if (stage === "chests") {
      if (shutRef.current.includes(g) && waiter.current) {
        const r = waiter.current;
        waiter.current = null;
        return r(g);
      }
      return nod(g);
    }
    if (readyHeld()) {
      if (readyTap({ label: `basket ${g}` })) hop(g, 14);
      return;
    }
    if (stage !== "play") return nod(g);
    // (a word that hasn't been said yet can't be answered: the tap was meant for the word before it)
    if (!said.current && !result) return nod(g);
    void choose(g);
  };

  /** Sensei heard you (Help or the speaker pressed while he's busy): his button nods and the word bounces. */
  const heard = () => {
    document.querySelector(".help-btn")?.animate(
      [
        { rotate: "0deg", translate: "0 0" },
        { rotate: "-10deg", translate: "0 -12px", offset: 0.25 },
        { rotate: "8deg", translate: "0 -4px", offset: 0.55 },
        { rotate: "0deg", translate: "0 0" },
      ],
      { duration: 520, easing: "ease-out" },
    );
    const p = panelRef.current;
    if (!p || gone) return;
    p.animate([{ scale: "1" }, { scale: "1.1", offset: 0.3 }, { scale: "0.97", offset: 0.65 }, { scale: "1" }] as Keyframe[], { duration: 420, easing: "ease-out" });
    const r = stageRect(p);
    fx.ring(r.x + r.w / 2, r.y + r.h / 2, { color: "#ffe38a", r0: r.w * 0.3, r1: r.w * 0.75, width: 12, life: 18 });
    fx.twinkle(r.x + r.w / 2, r.y + r.h / 2, COLS[1], 8, 6, 20);
  };
  /** Help with the word on screen (TEACHER_SCRIPT §5.5): first the word and the question again (its spelling of the
   *  sound lights pink); then the right chest glows: "Look for the glow."; then the hand points at it: "Here it is. Tap it
   *  when you're ready." It never answers for the child. */
  const help = (n: number) => {
    if (!w) return;
    setHelpLvl((h) => Math.max(h, Math.min(n, 2)));
    if (n === 1) return void say([{ word: w.text }, { gap: 200 }, ...L("help_sort")]);
    hard.current[i] = true;
    if (n === 2) return void say(HAS.has("tv_look_glow") ? L("tv_look_glow") : [...L("help_look"), { word: w.text }]);
    setPoint(pointAt(spellingOf(w)));
    void say(HAS.has("tv_idle_point") ? L("tv_idle_point") : [{ word: w.text }]);
  };

  /** Hear it again ("Hear the word", top-right): on the first word, the introduction again (each chest hopping with its
   *  sentence), then the word and the question; later, the word. The word stops falling while the introduction is
   *  replayed. While Sensei is sounding a word out, his button nods instead (he heard). */
  const replayTok = useRef(0);
  const replay = async () => {
    // opening the chests: "This sound can be spelt in three ways. Tap each chest to open it.", the next chest hopping
    if (stage === "chests") {
      if (!waitG || !chestsAsked) return heard();
      hop(waitG, 18);
      return void say(L("tv_sort_open"));
    }
    if (!w) return;
    if (busy.current) return heard();
    const my = ++replayTok.current;
    const on = () => alive.current && my === replayTok.current && !busy.current;
    const script = i === 0 ? intro.current : null;
    if (script) {
      setFrozen(true);
      let ok = await say(script.lead);
      for (const part of script.chests) {
        if (!ok || !on()) break;
        setIntroLit(part.g);
        hop(part.g, 20);
        sfx.pop();
        ok = await say([{ gap: 150 }, ...part.say]);
      }
      if (my === replayTok.current && !busy.current) {
        setFrozen(false);
        setIntroLit(null);
      }
      if (!ok || !on()) return;
      await sleep(150);
      if (!on()) return;
      return void say([{ word: w.text }, { gap: 250 }, ...L("help_sort")]);
    }
    await say({ word: w.text });
  };
  // (always "own": the scene draws both in its top bar, so the nav row never shows them over the chests)
  useNav({ again: replay, againAt: "own", sound });
  // the turn's idle ladder (TEACHER_SCRIPT §5.5): 8 s the word and the question again; 16 s the hand points at the right
  // chest (it never taps it): "Here it is. Tap it when you're ready."; 24 s "Take your time, ninja."; then quiet. Any tap
  // starts it again, and nothing is said over Sensei (Hear it again replaying the introduction, Help, a correction).
  const idleOn = stage === "play" && !!w && asked && !result;
  useEffect(() => {
    if (!idleOn || !w) return;
    let ts: number[] = [];
    const quiet = () => alive.current && !busy.current && !isSpeaking();
    const start = () => {
      ts.forEach(clearTimeout);
      ts = [
        window.setTimeout(() => void (quiet() && say([{ word: w.text }, { gap: 250 }, ...L("help_sort")])), 8000),
        window.setTimeout(() => {
          if (!alive.current || busy.current) return;
          hard.current[i] = true;
          setPoint(pointAt(spellingOf(w)));
          if (quiet()) void say(L("tv_idle_point"));
        }, 16000),
        window.setTimeout(() => void (quiet() && say(L("tv_take_time"))), 24000),
      ];
    };
    start();
    window.addEventListener("pointerdown", start);
    return () => {
      ts.forEach(clearTimeout);
      window.removeEventListener("pointerdown", start);
    };
  }, [idleOn, i]);
  useEffect(() => setHelpLvl(0), [i]);
  useHelp(
    (n) => {
      if (stage === "chests") {
        // "This sound can be spelt in three ways. Tap each chest to open it.", then the hand on the next chest
        if (n === 1 && HAS.has("tv_sort_open") && !isSpeaking()) void say({ line: "tv_sort_open" });
        else if (waitG) setPoint(pointAt(waitG));
        return;
      }
      if (!w) return heard();
      if (busy.current) {
        // Sensei is already sounding it out: he shows he heard, and helps with the next word if this one is done
        heard();
        if (result === "right" && i + 1 < words.length) helpQueued.current = true;
        return;
      }
      help(n);
    },
    [i, stage],
  );
  // where to look is a hint (after a miss, for that word and the next, or a help press), not given away up front;
  // once sorted, it shows why; Sensei's demo shows it as he says so
  const showWhere = (!!w && (i <= hintUntil.current || helpLvl >= 1 || result === "right")) || (!w && fixLit);
  const target = (s: Word["segs"][number]) => s.p === sound && spellings.includes(s.g);
  const playing = stage === "play" && !!w;
  (window as any).__snState = {
    scene: "sort",
    game: "sort",
    stage,
    form,
    // the chest to open (the introduction), or the answer; nothing while Sensei talks, shows or holds. (The first chest
    // wiggles and is live from the first word of "…Tap each chest to open it.", but a child listens to the end first:
    // it is published once the line is over, as the first word is a turn once "[cap] · Tap the chest…" has been said.)
    next: stage === "chests" ? (chestsAsked ? waitG : null) : playing && asked ? spellingOf(w) : null,
    busy: stage === "chests" ? !waitG || !chestsAsked : playing ? !!result || !asked : true,
    i,
    last: i === words.length - 1,
    streak: streak.n,
    lit,
    hint: showWhere,
    demo: demo?.w.text ?? null,
    get said() {
      return said.current;
    },
    get phase() {
      return phase.current;
    },
    get way() {
      return lastWay.current;
    },
  };
  return (
    <div className={`scene so-scene tier-${tier} n${spellings.length} ${stage === "ready" ? "holding" : ""}`}>
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      <TopBar>
        <div className="spacer" />
        <Progress value={Math.max(0, i) / words.length} />
        <div className="spacer" />
        {/* the sound being sorted, as its petal (header: every chest is a spelling of this one sound), and Hear it again
            (docs/NAVIGATION.md §3.1: top-right on sorting). The petal arrives from the introduction's hero. */}
        <div className="nav-d-topctl">
          <div ref={hdrRef} className={`so-hdr ${hdrShown ? "" : "hid"}`}>
            <SoundBadge p={sound} tier="header" />
          </div>
          {w ? <ReplayButton onReplay={replay} size={100} label="Hear the word" /> : stage === "chests" ? <ReplayButton onReplay={replay} size={100} /> : <div style={{ width: 100 }} />}
        </div>
      </TopBar>
      {heroUp && (
        <div ref={heroRef} className={`so-hero ${heroLeaving ? "leaving" : ""}`}>
          <div className="so-hero-in">
            <div ref={heroSwRef} className="so-hero-sw">
              <SoundBadge p={sound} tier="hero" busy={!waitG} passive={heroLeaving} />
            </div>
          </div>
        </div>
      )}
      {pw && (
        <div key={w ? w.text : `demo:${demo?.n}`} ref={wordRef} className={`so-word ${gone ? "gone" : ""}`} style={{ top: TOP0 }}>
          <div className="drop-in">
            <div ref={panelRef} className={`so-panel ${result === "wrong" ? "no" : result === "right" ? "yes" : ""} ${lit !== null ? "blend" : ""}`}>
              {/* the rainbow ring on a master streak (sort.css: shown at tier 3 only) */}
              <span className="so-rb" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              {pw.pic && <img src={img(`pic_${pw.text}`)} alt="" />}
              <span className="so-letters">
                {pw.segs.map((s, k) => {
                  const on = lit === k || lit === -1;
                  const fix = fixLit && target(s);
                  return (
                    <span key={k} className={`${showWhere && target(s) ? "hl" : ""} ${on || fix ? "lit" : ""} ${lit === k || fix ? "now" : ""}`}>
                      {s.g}
                      <i className={`sb ${s.g === "x" ? "two" : s.g.length > 1 ? "bar" : "dot"} ${on ? "lit" : ""}`} />
                    </span>
                  );
                })}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className={`so-chests n${spellings.length}`}>
        {spellings.map((g, k) => {
          const b = baskets[g];
          return (
            <div key={g} className={`so-chest ${shut.includes(g) ? "shut" : ""} ${lids[g] === "drop" ? "lidded" : ""} ${waitG === g ? "next" : ""} ${introLit === g ? "lit" : ""} ${nope === g ? "no" : ""}`} style={{ "--k": k } as CSSProperties}>
              <button ref={(el) => void (chestRefs.current[g] = el)} {...tapProps(() => tapChest(g))} aria-label={`basket ${g}`}>
                <div key={shine[g] ?? 0} className={`so-shine ${shine[g] ? "on" : ""}`} />
                <img className="so-art back" src={img("item_chest")} alt="" draggable={false} />
                <div className="so-loot">
                  {b.map((bw, j) => {
                    const count = b.length;
                    const rank = count - 1 - j; // 0 = the newest
                    const at = chipAt(rank, count);
                    return (
                      <span key={bw.text} className={`so-chip ${rank === 0 ? "new" : ""}`} style={{ "--xf": at.x, "--b": `${at.b}px`, "--s": at.s, "--r": `${at.r}deg`, "--z": 9 - rank } as CSSProperties}>
                        {bw.segs.map((s, j2) => (
                          <span key={j2} className={target(s) ? "hl" : undefined}>
                            {s.g}
                          </span>
                        ))}
                      </span>
                    );
                  })}
                </div>
                <img className="so-art front" src={img("item_chest")} alt="" draggable={false} />
                {lids[g] && <ChestLid state={lids[g]} lidRef={(el) => void (lidRefs.current[g] = el)} />}
                <ChestEyes mood={moods[g]} eyesRef={(el) => void (eyesRefs.current[g] = el)} />
                <div ref={(el) => void (mouthRefs.current[g] = el)} className="so-mouth" />
                <div ref={(el) => void (labelRefs.current[g] = el)} className="so-label">
                  <Tile g={g} state={result === "right" && w && spellingOf(w) === g ? "right" : nope === g ? "wrong" : (helpLvl >= 2 && w && spellingOf(w) === g) || introLit === g ? "hint" : ""} />
                </div>
              </button>
            </div>
          );
        })}
      </div>
      <div ref={powerRef} className="so-power" />
      <NinjaSpot />
      <div ref={chargeRef} className="so-charge" />
      {paw && (
        <div className="so-paw" style={{ transform: `translate(${paw.x}px, ${paw.y}px)` }}>
          <TapHint show style={{ position: "relative" }} />
        </div>
      )}
      {point && <TapHint show style={{ left: point.x, top: point.y, zIndex: 16 }} />}
      <NarrOverlay />
      <SenseiDock />
    </div>
  );
}
