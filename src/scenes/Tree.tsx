// The World Flower: the heart of the Island of Sounds (docs/ART_STYLE.md, assets-src/world-flower/model_sheet.png).
// View 0 is the flower itself: 44 glassy teardrop petals, one per sound, in the school chart's colours. A petal glows
// once all its gems are won, fills in as gems are won, is inked in once its sound is met, and is a pale ghost before.
// View 1 is the petal chart as a ninja scroll the child swipes: the school's "Extended Code alternative spellings"
// sheet (sheet 1, sheet 2, then the extra sounds) as one row of big teardrop petals with every spelling inside.
// Every spelling is a gem: dim until taught, charging with practice, glowing when its Gem Trial is ready, and a solid
// jewel once won. Tap a petal (on the flower or the scroll) to open it: tap a gem to hear Sensei explain how it spells
// the sound, and tap the green gate to practise it in the dojo.
// World Flower 2.0 (docs/FEEDBACK.md Round 12): the game also brings children here (engine/gems.ts FlowerVisit): a gem
// won in its Gem Trial plays the victory sequence below (GemVictory); new spellings, a new land and a finished practice
// play their trips (Intros.tsx GemFound and WorldVisit, and the practised beat here). What Sensei says is in teach.ts.
// Layout: nothing interactive in the bottom-left 330×340 (the player's ninja) or the bottom-right 150×150 (Sensei's help).
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { PETALS, CHART_PETALS, chartOf, neededGems, gemByKey, type Petal, type Gem, type ChartPetal } from "../content/flower";
import { PHONEMES, WORD_BY_TEXT, type PhonemeId, type Word } from "../content/phonics";
import { introGem, introPetal, sameSound, exampleWords, victoryScript, practisedScript, type Explanation } from "../content/teach";
import { say, sfx, playMusic, load, urls, audioCtx, settings, isSpeaking, preload, onClip } from "../engine/audio";
import { TEACH_WORD_TIMES } from "../content/teach-word-times.gen";
import { PIC_PLATES, PLATE_COLOURS } from "../content/pic-plates.gen";
import { FAST } from "../engine/fast";
import { useSave, store, type Save } from "../engine/store";
import {
  gemState, energyOf, petalComplete, flowerComplete, knownNow, readyGems, canPractise, waysKnown, markVisited, lastPractice, petalOfGem, isMet, isWayToSpell,
  type GemState, type FlowerVisit,
} from "../engine/gems";
import { img, RoundButton, Icon, fx, SenseiDock, tapProps, useHelp, TalkingFace, stageRect, sleep, shakeStage } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { useNav, usePresentation, navAgain, nudgeNext, type Step as NavStep } from "../ui/nav";
import { SoundBadge } from "../ui/SoundBadge";
import { teardrop, teardropAt, mix, petalImg } from "../ui/petal";
import { FlowerIntro, WorldVisit, GemFound } from "./Intros";
import "../styles/tree-teach.css";
import "../styles/tree-visit.css";

// the petal shape and colour helpers live in src/ui/petal.ts (scenes that show a sound don't import the World Flower)
export { teardrop, teardropAt, mix };

const petalOf = (p: PhonemeId) => PETALS.find((x) => x.p === p)!;

// ---------------------------------------------------------------- a trip that is due
// A World Flower trip due after a reward stays due until it has played to its end: Home on the reward, or mid-trip,
// keeps it, and the map's World Flower button pulses until it is played (docs/NAVIGATION.md §3.3). (Kept in the save as
// `tripDue`; engine/store.ts's Save type doesn't list it yet.)
type TripSave = Save & { tripDue?: FlowerVisit | null };
/** The trip still due, if any (spellings met, or a new land: gem victories and practice trips are never left due). */
export const tripDue = (s: Save = store.get()): FlowerVisit | null => (s as TripSave).tripDue ?? null;
export function setTripDue(v: FlowerVisit | null) {
  if (v && v.kind !== "spelling" && v.kind !== "world") return;
  if (!v && !tripDue()) return;
  store.set((s) => void ((s as TripSave).tripDue = v));
}

// ---------------------------------------------------------------- the World Flower (SVG, matches the painted design)
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function hue(h: string) {
  const [r, g, b] = rgb(h).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (mx < 0.25 || d / (mx || 1) < 0.25) return 2; // greys and browns go last, as in the painting
  const x = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return x / 6;
}
/** The chart's /or/ petal is ink-dark; on the flower it is painted deep bronze so it doesn't read as a hole. */
export const flowerColour = (c: string) => (c === "#2b1d14" ? "#7a4a24" : c);
/** Inner ring: the 20 vowel sounds; outer ring: the 24 consonants. Each ring runs round in rainbow order. */
export const FLOWER_RINGS: ChartPetal[][] = [
  CHART_PETALS.filter((c) => PHONEMES[c.p].vowel).sort((a, b) => hue(a.colour) - hue(b.colour)),
  CHART_PETALS.filter((c) => !PHONEMES[c.p].vowel).sort((a, b) => hue(a.colour) - hue(b.colour)),
];
// geometry in bloom units (the bloom's viewBox is -480..480)
const RING = [
  { r0: 92, len: 176, w: 66, off: 0 }, // inner: points at r=92, round tips at r=268
  { r0: 190, len: 252, w: 98, off: 360 / 48 }, // outer: sits between the inner petals, round tips at r=442
];
const HEART = 104;

/** How lit a petal is: 1 = back on the flower; 0.15..0.9 = some of its gems won; a touch of ink (0.06) once its sound
 *  has been met, so the child can see which sounds they know; 0 = still missing. */
export function petalLight(p: PhonemeId, save: Save, known: Set<string> = knownNow(save)) {
  const pt = petalOf(p);
  if (petalComplete(pt, save)) return 1;
  const need = neededGems(pt);
  const won = need.filter((g) => save.gems.includes(g.key)).length;
  if (won) return 0.15 + (0.75 * won) / need.length;
  return pt.gems.some((g) => isMet(gemState(g, save, known))) ? 0.06 : 0;
}

let flowerIds = 0;
/**
 * The World Flower, sized by its container (the bloom fills the box; the painted stem hangs below it, outside the box).
 * `light(p)` 0..1 per petal, `ready` petals get a pulsing gold outline, `landing` animates one petal flying home,
 * `hint` petals shimmer through the mist (sounds hiding in this land), and `flash` lights one petal up for a moment.
 * `misty`: the missing petals are drawn in their own colours, softened (a flower still lost in the mist, over a dimmed
 * stage), not as pale ghosts. `bloom`: this petal pops out to twice its size and settles, bigger and glowing, on top.
 */
export function WorldFlower({ light, ready, landing, count, onPetal, stem = true, label = "The World Flower", hint, flash, misty, bloom, pics = true }: {
  /** every met petal shows its sound's picture near its round tip, upright, like the school chart (§4); unmet ones don't */
  pics?: boolean;
  misty?: boolean;
  bloom?: PhonemeId | null;
  light: (p: PhonemeId) => number;
  ready?: Set<string>;
  landing?: PhonemeId | null;
  count?: [number, number];
  onPetal?: (p: PhonemeId) => void;
  stem?: boolean;
  label?: string;
  hint?: Set<PhonemeId>;
  flash?: PhonemeId | null;
}) {
  const uid = useMemo(() => `wf${++flowerIds}`, []);
  const svgRef = useRef<SVGSVGElement>(null);
  const lastTap = useRef(0);
  const all = FLOWER_RINGS.flat();
  const progress = all.reduce((s, c) => s + (light(c.p) >= 1 ? 1 : 0), 0) / all.length;
  const glow = 0.25 + 0.75 * progress;

  // a tap anywhere on the bloom picks the nearest petal, so small fingers never miss
  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onPetal || e.button > 0) return;
    e.preventDefault();
    const now = performance.now();
    if (now - lastTap.current < 250) return;
    lastTap.current = now;
    const hit = (e.target as Element).closest?.("[data-p]")?.getAttribute("data-p");
    if (hit) return onPetal(hit as PhonemeId);
    const svg = svgRef.current!;
    const m = svg.getScreenCTM();
    if (!m) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const r = Math.hypot(pt.x, pt.y);
    if (r < HEART * 0.8 || r > 470) return;
    const ri = r < 262 ? 0 : 1;
    const ring = FLOWER_RINGS[ri];
    const deg = ((Math.atan2(pt.x, -pt.y) * 180) / Math.PI - RING[ri].off + 360) % 360;
    onPetal(ring[Math.round(deg / (360 / ring.length)) % ring.length].p);
  };

  const petal = (c: ChartPetal, i: number, ri: number) => {
    const g = RING[ri];
    const a = (i / FLOWER_RINGS[ri].length) * 360 + g.off;
    const l = light(c.p);
    const col = flowerColour(c.colour);
    const on = l >= 1;
    const d = teardrop(g.w, g.len);
    const blooming = bloom === c.p;
    return (
      <g key={c.p} transform={`rotate(${a}) translate(0 ${-(g.r0 + g.len / 2)})`}>
        <g className={landing === c.p ? "wf-land" : blooming ? "wf-bloom" : undefined} filter={blooming ? `url(#${uid}-lit)` : undefined}>
          <path
            d={d}
            data-p={c.p}
            aria-label={`petal ${c.p}`}
            // missing petals are pale ghosts with a hint of their colour (as in the painted "partly regrown" state), or
            // in the mist their own colours softened; met petals are inked in; petals with some gems won fill in
            fill={on ? `url(#${uid}-${c.p})` : l > 0 ? col : misty ? mix(col, "#7d7a96", 0.4) : mix(col, "#fff4dc", 0.72)}
            fillOpacity={on ? 1 : l > 0 ? 0.25 + 0.5 * l : misty ? 0.72 : 0.3}
            stroke={on || l > 0 || misty ? "#2b1d14" : "#fff4dc"}
            strokeOpacity={on ? 1 : l > 0 ? 0.5 : misty ? 0.4 : 0.9}
            strokeWidth={on ? 5 : 3.5}
            style={{ cursor: onPetal ? "pointer" : undefined, transition: "fill-opacity .8s" }}
          />
          {on && <ellipse cx={-g.w * 0.16} cy={-g.len / 2 + g.w * 0.36} rx={g.w * 0.13} ry={g.w * 0.24} fill="#fff" opacity={0.55} transform={`rotate(-18 ${-g.w * 0.16} ${-g.len / 2 + g.w * 0.36})`} pointerEvents="none" />}
          {ready?.has(c.p) && (
            <path d={d} fill="none" stroke="#ffc53d" strokeWidth={9} pointerEvents="none">
              <animate attributeName="stroke-opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite" />
            </path>
          )}
          {hint?.has(c.p) && (
            <path d={d} fill="#fff" fillOpacity={0.3} stroke="#fff" strokeWidth={7} strokeDasharray="16 12" pointerEvents="none">
              <animate attributeName="opacity" values="0.15;1;0.15" dur="1.6s" repeatCount="indefinite" />
            </path>
          )}
          {flash === c.p && <path key={`f${c.p}`} className="wf-flash" d={d} fill="#fff6c8" stroke="#ffc53d" strokeWidth={12} pointerEvents="none" />}
          {/* the sound's picture in the round part of every met petal, turned upright (a sound is shown as its picture) */}
          {pics && l > 0 && (
            <image
              href={petalImg(c.p)}
              x={-g.w * 0.275}
              y={-g.len / 2 + g.w * 0.5 - g.w * 0.275}
              width={g.w * 0.55}
              height={g.w * 0.55}
              transform={`rotate(${-a} 0 ${-g.len / 2 + g.w * 0.5})`}
              opacity={on ? 1 : 0.55 + 0.45 * l}
              pointerEvents="none"
              preserveAspectRatio="xMidYMid meet"
            />
          )}
        </g>
      </g>
    );
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {stem && (
        // the painted stem (assets-src/world-flower/world_flower_stem.png): its calyx sits under the bloom's centre
        <img
          src={img("world_flower_stem")}
          alt=""
          style={{ position: "absolute", left: "18.96%", top: "40.2%", width: "95.6%", zIndex: 0, pointerEvents: "none", filter: `saturate(${0.35 + 0.65 * glow}) brightness(${0.8 + 0.2 * glow})`, transition: "filter 1s" }}
        />
      )}
      <svg ref={svgRef} viewBox="-480 -480 960 960" width="100%" height="100%" role={onPetal ? "button" : "img"} aria-label={label} onPointerDown={onPetal ? pick : undefined} style={{ position: "absolute", inset: 0, overflow: "visible", zIndex: 1, touchAction: "none" }}>
        <style>{`.wf-land{transform-box:fill-box;transform-origin:50% 100%;animation:wfland 1s cubic-bezier(.3,1.4,.5,1) both}@keyframes wfland{from{transform:translateY(-160px) scale(.2) rotate(-50deg);opacity:0}to{transform:none;opacity:1}}.wf-flash{animation:wfflash .7s ease-out both}@keyframes wfflash{0%{opacity:0}25%{opacity:1}100%{opacity:0}}.wf-bloom{transform-box:fill-box;transform-origin:50% 100%;animation:wfbloom 1.7s cubic-bezier(.3,1.5,.5,1) both}@keyframes wfbloom{0%{transform:scale(1)}26%{transform:scale(2.1)}52%{transform:scale(1.62)}74%{transform:scale(1.4)}100%{transform:scale(1.32)}}`}</style>
        <defs>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0" stopColor="#fff6c8" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#ffd970" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffc53d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-heart`} cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor={mix("#fff6c8", "#b8ab94", 1 - glow)} />
            <stop offset="0.55" stopColor={mix("#ffc53d", "#9b8f7a", 1 - glow)} />
            <stop offset="1" stopColor={mix("#e08a12", "#6f6656", 1 - glow)} />
          </radialGradient>
          <linearGradient id={`${uid}-ray`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ffe9a0" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffe9a0" stopOpacity="0" />
          </linearGradient>
          {all.map((c) => {
            const col = flowerColour(c.colour);
            return (
              <linearGradient key={c.p} id={`${uid}-${c.p}`} x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0" stopColor={mix(col, "#ffffff", 0.42)} />
                <stop offset="0.55" stopColor={col} />
                <stop offset="1" stopColor={mix(col, "#2b1d14", 0.18)} />
              </linearGradient>
            );
          })}
          <filter id={`${uid}-lit`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* radiance: glow, slowly turning rays and the halo ring all grow with the number of petals home */}
        <circle r={470} fill={`url(#${uid}-glow)`} opacity={0.35 + 0.65 * progress} pointerEvents="none" />
        <g opacity={progress * 0.9} pointerEvents="none">
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d="M-26,-150 L26,-150 L64,-560 L-64,-560 Z" fill={`url(#${uid}-ray)`} transform={`rotate(${i * 22.5})`} />
          ))}
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="90s" repeatCount="indefinite" />
        </g>
        <circle r={458} fill="none" stroke="#ffe08a" strokeWidth={5} opacity={0.15 + 0.7 * progress} pointerEvents="none" />
        {/* outer ring first, so the inner petals overlap its pointed bases */}
        {[1, 0].map((ri) => (
          <g key={ri}>
            <g>{FLOWER_RINGS[ri].map((c, i) => (light(c.p) >= 1 || c.p === bloom ? null : petal(c, i, ri)))}</g>
            <g filter={`url(#${uid}-lit)`}>{FLOWER_RINGS[ri].map((c, i) => (light(c.p) >= 1 && c.p !== bloom ? petal(c, i, ri) : null))}</g>
          </g>
        ))}
        {/* the golden heart with its ring of stamens */}
        <g pointerEvents="none">
          {Array.from({ length: 28 }, (_, i) => (
            <circle key={i} cx={Math.sin((i / 28) * Math.PI * 2) * (HEART + 10)} cy={-Math.cos((i / 28) * Math.PI * 2) * (HEART + 10)} r={7} fill={mix("#ffd35a", "#8f8470", 1 - glow)} stroke="#2b1d14" strokeWidth={2.5} />
          ))}
          <circle r={HEART} fill={`url(#${uid}-heart)`} stroke="#2b1d14" strokeWidth={6} />
          <ellipse cx={-30} cy={-38} rx={34} ry={20} fill="#fff" opacity={0.25 + 0.35 * glow} transform="rotate(-25 -30 -38)" />
          {count && (
            <>
              <text y={14} textAnchor="middle" fontFamily="Luckiest Guy, sans-serif" fontSize={84} fill="#fff" stroke="#2b1d14" strokeWidth={9} paintOrder="stroke">{count[0]}</text>
              <text y={58} textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight={800} fontSize={30} fill="#2b1d14">of {count[1]}</text>
            </>
          )}
        </g>
        {/* a blooming petal, over the heart and every other petal */}
        {bloom && [0, 1].map((ri) => FLOWER_RINGS[ri].map((c, i) => (c.p === bloom ? petal(c, i, ri) : null)))}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------- the chart (the school's sheet)
/** Tap for things inside the swipeable scroll: fires on release, and only if the finger barely moved. */
function scrollTap(fn: () => void) {
  let start: { x: number; y: number; sl: number } | null = null;
  const scroller = (el: Element) => el.closest(".scrollable") as HTMLElement | null;
  return {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button > 0) return;
      start = { x: e.clientX, y: e.clientY, sl: scroller(e.currentTarget)?.scrollLeft ?? 0 };
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const s0 = start;
      start = null;
      if (!s0) return;
      const moved = Math.hypot(e.clientX - s0.x, e.clientY - s0.y) > 10 || Math.abs((scroller(e.currentTarget)?.scrollLeft ?? 0) - s0.sl) > 6;
      if (!moved) fn();
    },
    onPointerCancel: () => void (start = null),
    // keyboard activation (Enter/Space) still works
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (e.detail === 0) fn();
    },
  };
}

const PETAL_H = 262;
const met = isMet;

/** A spelling the child hasn't met yet: a dark crystal with a faint glint (no letters). */
export function DarkCrystal({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 34 40" width={size} height={size * 1.18} aria-label="a hidden gem" style={{ flex: "none", overflow: "visible" }}>
      <polygon points="17,1 32,11 32,29 17,39 2,29 2,11" fill="#3b3450" stroke="#2b1d14" strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points="17,1 32,11 17,17 2,11" fill="#5b5274" />
      <polygon points="9,8 14,5 12,13" fill="#fff" opacity={0.5}>
        <animate attributeName="opacity" values="0.1;0.8;0.1" dur="2.6s" begin={`${(size * 7) % 3}s`} repeatCount="indefinite" />
      </polygon>
    </svg>
  );
}

/**
 * A spelling as a cut jewel with its letters big enough to read on a phone (the flying gem, the big petal and the
 * petal detail). Won: a polished jewel in the petal's colour. Ready: gold, bouncing. Charging: pale stone with a ring
 * of gold energy round it.
 */
export function Jewel({ g, colour, state, energy = 0, size = 110, className = "", lit = 0 }: { g: string; colour: string; state: GemState; energy?: number; size?: number; className?: string; lit?: number }) {
  const uid = useMemo(() => `jw${++flowerIds}`, []);
  const won = state === "won", ready = state === "ready";
  const txt = g.replace(/-/g, "");
  const font = txt.length > 3 ? 27 : txt.length > 2 ? 34 : txt.length > 1 ? 44 : 54;
  const [c0, c1] = won ? [mix(colour, "#ffffff", 0.5), mix(colour, "#2b1d14", 0.28)] : ready ? ["#fff6c8", "#ffc53d"] : ["#fffaf0", "#e8d8bd"];
  return (
    <div className={`jewel ${ready ? "gem-ready" : ""} ${lit > txt.length ? "joined" : ""} ${className}`} style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible", filter: won ? `drop-shadow(0 0 ${size * 0.06}px ${mix(colour, "#ffffff", 0.5)})` : ready ? "drop-shadow(0 0 8px #ffc53d)" : undefined }}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c0} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
        </defs>
        {state === "charging" && (
          <>
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(43,29,20,.2)" strokeWidth="6" />
            <circle cx="50" cy="50" r="49" fill="none" stroke="#ffc53d" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${Math.max(0.02, energy) * 308} 308`} transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.3,1.2,.5,1)" }} />
          </>
        )}
        <polygon points="50,7 86,25 93,61 50,93 7,61 14,25" fill={`url(#${uid})`} stroke="#2b1d14" strokeWidth="5" strokeLinejoin="round" />
        <g stroke="#2b1d14" strokeWidth="1.8" opacity={won ? 0.45 : 0.2} fill="none">
          <polyline points="14,25 31,31 50,25 69,31 86,25" />
          <path d="M31,31 L50,93 L69,31 M7,61 L31,31 M93,61 L69,31" />
        </g>
        {won && <polygon points="24,22 39,16 34,31" fill="#fff" opacity={0.7} />}
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontFamily="Andika, sans-serif" fontWeight={700} fontSize={font} fill={won ? "#fff" : "#2b1d14"} stroke={won ? "#2b1d14" : "#fffaf0"} strokeWidth={won ? 7 : 5} paintOrder="stroke">
          {/* `lit`: its letters light one by one ("It's two letters…"), then all together ("…but it's one sound") */}
          {lit ? [...txt].map((ch, i) => <tspan key={i} className={i < lit ? "jw-lit" : undefined}>{ch}</tspan>) : txt}
        </text>
      </svg>
      {won && <span className="gem-sparkle" />}
    </div>
  );
}

/** One spelling inside a scroll petal, as a gem chip: met spellings are readable stone (charging, with an energy bar),
 *  a ready gem glows gold, a won gem is a polished jewel in the petal's colour, and unmet spellings are dark crystals.
 *  `reveal` pops it in with a burst of light (a spelling just met, after its trip here). */
function GemChip({ gem, st, energy, colour, size, focus, reveal }: { gem: Gem; st: GemState; energy: number; colour: string; size: number; focus?: boolean; reveal?: boolean }) {
  if (!met(st)) return <DarkCrystal size={size * 0.95} />;
  const base: React.CSSProperties = { position: "relative", fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: size, lineHeight: 1.12, padding: "0 7px 2px", borderRadius: 9, whiteSpace: "nowrap", border: "2.5px solid #2b1d14" };
  const glow = focus ? { outline: "4px solid #ffc53d", outlineOffset: 2, animation: "wffocus 1s ease-in-out infinite" } : {};
  const cls = reveal ? "chip-reveal" : "";
  if (st === "won")
    return <span data-gem-chip={gem.key} className={`gem-won ${cls}`} style={{ ...base, ...glow, color: "#fff", background: `linear-gradient(160deg, ${mix(colour, "#ffffff", 0.45)}, ${colour} 55%, ${mix(colour, "#2b1d14", 0.25)})`, textShadow: "0 1.5px 0 #2b1d14, 0 0 2px #2b1d14", boxShadow: `inset 0 3px 0 rgba(255,255,255,.55), 0 0 10px ${colour}` }}>{gem.g}</span>;
  if (st === "ready") return <span data-gem-chip={gem.key} className={`gem-ready ${cls}`} style={{ ...base, ...glow, color: "#2b1d14", background: "linear-gradient(160deg, #fff1b8, #ffc53d)", boxShadow: "0 0 12px #ffc53d" }}>{gem.g}</span>;
  // charging: unpolished stone with an energy bar filling along the bottom
  return (
    <span data-gem-chip={gem.key} className={cls} style={{ ...base, ...glow, color: "rgba(43,29,20,.86)", background: "repeating-linear-gradient(45deg, rgba(120,100,80,.07) 0 3px, transparent 3px 7px), #efe6d6", overflow: "hidden" }}>
      {gem.g}
      <i style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${Math.max(6, energy * 100)}%`, background: "#ffc53d", borderTop: "1.5px solid #2b1d14", transition: "width 1.4s cubic-bezier(.3,1.2,.5,1)" }} />
    </span>
  );
}

function ScrollPetal({ p, save, known, onOpen, focusGem, energyShow, reveal }: { p: PhonemeId; save: Save; known: Set<string>; onOpen: (p: Petal) => void; focusGem?: string | null; energyShow?: Record<string, number>; reveal?: string[] }) {
  const pt = petalOf(p);
  const c = chartOf(p);
  const done = petalComplete(pt, save);
  // a gem whose energy is being shown filling up (back from practice) stays a charging stone until it is full
  const states = pt.gems.map((g) => ((st) => (st === "ready" && energyShow && g.key in energyShow ? "charging" : st))(gemState(g, save, known)));
  const known1 = states.some(met); // has the child met this sound yet?
  const fill = done ? 1 : petalLight(p, save, known);
  const focused = !!focusGem && pt.gems.some((g) => g.key === focusGem);
  // petals widen with the number of spellings (1 to about 12), so every spelling stays big enough to read
  const n = pt.gems.length;
  const w = n > 9 ? 268 : n > 6 ? 232 : n > 3 ? 200 : 180;
  const h = PETAL_H;
  const d = teardrop(w - 12, h - 8);
  const cid = `sp-${p}`;
  return (
    <div
      role="button"
      aria-label={`petal ${p}`}
      data-p={p}
      tabIndex={0}
      {...scrollTap(() => {
        if (!known1) {
          // a sound the child hasn't met: it stays a mystery
          sfx.petal();
          say({ line: "petal_secret" });
          return;
        }
        sfx.petal();
        onOpen(pt);
        say({ sound: p });
      })}
      style={{ position: "relative", flex: "none", width: w, height: h, cursor: "pointer", scrollSnapAlign: "center" }}
    >
      <svg viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <clipPath id={cid}>
            <path d={d} />
          </clipPath>
          <radialGradient id={`${cid}-g`} cx="50%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor={c.colour} stopOpacity=".38" />
          </radialGradient>
          <radialGradient id={`${cid}-mist`}>
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {known1 ? (
          <>
            <path d={d} fill={done ? `url(#${cid}-g)` : "#fffaf0"} />
            {/* the petal fills with its colour from the point upwards as its gems are won */}
            {!done && fill > 0 && <rect x={-w / 2} y={h / 2 - fill * h} width={w} height={fill * h} fill={c.colour} opacity={0.3} clipPath={`url(#${cid})`} />}
          </>
        ) : (
          // a sound not met yet: shrouded in drifting ink mist, with a shimmering rune
          <g clipPath={`url(#${cid})`}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#3b3450" />
            {[[-40, -60, 70], [45, -20, 80], [-20, 40, 90], [30, 80, 60]].map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill={`url(#${cid}-mist)`}>
                <animateTransform attributeName="transform" type="translate" values={`0 0; ${i % 2 ? -26 : 26} ${i % 2 ? 8 : -8}; 0 0`} dur={`${5 + i}s`} repeatCount="indefinite" />
              </ellipse>
            ))}
            <text y={-h * 0.08} textAnchor="middle" dominantBaseline="middle" fontFamily="Luckiest Guy, sans-serif" fontSize={w * 0.42} fill={mix(c.colour, "#ffffff", 0.35)} stroke="#2b1d14" strokeWidth={4} paintOrder="stroke">
              ?
              <animate attributeName="opacity" values="0.35;1;0.35" dur="2.4s" repeatCount="indefinite" />
            </text>
          </g>
        )}
        <path
          d={d}
          fill="none"
          stroke={known1 ? c.colour : mix(c.colour, "#fff4dc", 0.35)}
          strokeWidth={done ? 9 : 7}
          strokeDasharray={known1 ? undefined : "14 10"}
          style={done ? { filter: `drop-shadow(0 0 8px ${c.colour})` } : undefined}
        />
        {focused && (
          <path d={d} fill="none" stroke="#ffc53d" strokeWidth={12}>
            <animate attributeName="stroke-opacity" values="0.2;1;0.2" dur="1.1s" repeatCount="indefinite" />
          </path>
        )}
      </svg>
      {/* the sound's picture in the petal's top-right corner, like the school chart (every met petal; unmet ones keep the mist) */}
      {known1 && <img src={petalImg(p)} alt="" draggable={false} style={{ position: "absolute", right: -10, top: -14, width: 64, height: 64, objectFit: "contain", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))", pointerEvents: "none" }} onError={(e) => (e.currentTarget.style.display = "none")} />}
      {/* the spellings flow inside the round part of the teardrop, like the sheet but big enough to read */}
      {known1 && (
        <div style={{ position: "absolute", left: w * 0.1, right: w * 0.1, top: h * 0.08, height: h * 0.6, display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "center", justifyContent: "center", gap: n > 9 ? "4px 5px" : "6px 6px", pointerEvents: "none" }}>
          {pt.gems.map((g, i) => (
            <GemChip key={g.key + g.g} gem={g} st={states[i]} energy={energyShow?.[g.key] ?? energyOf(g.key, save)} colour={c.colour} size={n > 9 ? 25 : n > 6 ? 27 : 30} focus={g.key === focusGem} reveal={reveal?.includes(g.key)} />
          ))}
        </div>
      )}
      {done && <span className="gem-sparkle" style={{ right: "30%", top: "8%", width: "30%", height: "22%" }} />}
    </div>
  );
}

/** The overall progress along the top of the scroll: a vine that grows as petals come home, with one little petal
 *  marker per sound in scroll order (lit when restored, tinted while filling, pale while missing). No numbers. */
function ProgressVine({ light }: { light: (p: PhonemeId) => number }) {
  const W = 1000, H = 34; // (ends clear of Hear it again, top-right)
  const done = CHART_PETALS.filter((c) => light(c.p) >= 1).length / CHART_PETALS.length;
  const y = (x: number) => H / 2 + Math.sin(x / 38) * 4;
  const path = Array.from({ length: 55 }, (_, i) => `${i ? "L" : "M"}${(i / 54) * W},${y((i / 54) * W).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-label="petals restored" style={{ position: "absolute", left: 140, top: 52, overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <clipPath id="wf-vine-fill">
          <rect x={0} y={-10} width={W * done} height={H + 20} />
        </clipPath>
      </defs>
      <path d={path} fill="none" stroke="#b7a98a" strokeWidth={7} strokeLinecap="round" />
      <path d={path} fill="none" stroke="#2b1d14" strokeWidth={10} strokeLinecap="round" clipPath="url(#wf-vine-fill)" />
      <path d={path} fill="none" stroke="#6cc04a" strokeWidth={6} strokeLinecap="round" clipPath="url(#wf-vine-fill)" />
      {CHART_PETALS.map((c, i) => {
        const x = 12 + (i / (CHART_PETALS.length - 1)) * (W - 24);
        const l = light(c.p);
        const col = flowerColour(c.colour);
        return (
          <path key={c.p} d={teardrop(15, 23)} transform={`translate(${x} ${y(x) - 2}) rotate(180)`} fill={l >= 1 ? col : l > 0 ? mix(col, "#fff4dc", 0.55) : "#fff4dc"} stroke="#2b1d14" strokeWidth={l >= 1 ? 2.5 : 1.5} strokeOpacity={l >= 1 ? 1 : 0.45} style={l >= 1 ? { filter: `drop-shadow(0 0 3px ${col})` } : undefined} />
        );
      })}
    </svg>
  );
}

/** A wooden scroll roller (the fixed ends of the ninja scroll). */
const Roller = ({ side }: { side: "left" | "right" }) => (
  <div aria-hidden style={{ position: "absolute", [side]: 0, top: -18, bottom: -18, width: 34, zIndex: 3, pointerEvents: "none", borderRadius: 14, border: "4px solid #2b1d14", background: "linear-gradient(90deg, #5a3417 0%, #b87a42 35%, #e0a868 50%, #a0652f 70%, #5a3417 100%)", boxShadow: "0 6px 14px rgba(60,30,10,.35)" }}>
    {(["top", "bottom"] as const).map((e) => (
      <span key={e} style={{ position: "absolute", left: -8, right: -8, [e]: -14, height: 22, borderRadius: 11, border: "4px solid #2b1d14", background: "linear-gradient(90deg, #7a2a1a, #d9482b 50%, #7a2a1a)" }} />
    ))}
  </div>
);

/** A hand that swipes across the scroll, the first time it is opened (no words needed). */
const SwipeHand = () => (
  <svg viewBox="0 0 64 64" width="96" height="96" aria-hidden style={{ position: "absolute", left: "58%", top: 150, zIndex: 4, pointerEvents: "none", animation: "swipehand 1.6s ease-in-out 3", filter: "drop-shadow(0 4px 4px rgba(0,0,0,.3))" }}>
    <path fill="#fff4dc" stroke="#2b1d14" strokeWidth={3.5} strokeLinejoin="round" d="M24 30V12a4 4 0 0 1 8 0v14l1-3a4 4 0 0 1 7 1v2a4 4 0 0 1 7 1v2a4 4 0 0 1 7 1v10c0 10-6 17-15 17h-2c-6 0-9-3-12-7l-8-11a4 4 0 0 1 6-5z" />
  </svg>
);

/** A little picture of the chart for the "look at the chart" button. */
const ChartIcon = () => (
  <svg viewBox="0 0 64 64">
    <rect x="9" y="7" width="46" height="50" rx="6" fill="#fff" stroke="#2b1d14" strokeWidth={4} />
    {[["#e8312f", 22, 22], ["#2fa65a", 42, 22], ["#4a7dff", 22, 42], ["#f3c74a", 42, 42]].map(([c, x, y]) => (
      <path key={c as string} d={teardrop(13, 17)} transform={`translate(${x} ${y})`} fill="#fff" stroke={c as string} strokeWidth={3.5} />
    ))}
  </svg>
);
/** The World Flower as an icon (the same one the map and the reward screen use: ui.tsx Icon.tree). */
export const FlowerIcon = Icon.tree;

/** The dojo's gate (a torii), for the Practise button. */
export const GateIcon = () => (
  <svg viewBox="0 0 64 64">
    <path d="M6 14c14 4 38 4 52 0l-2 8c-13 3-35 3-48 0z" fill="#e8312f" stroke="#2b1d14" strokeWidth={4} strokeLinejoin="round" />
    <rect x="10" y="26" width="44" height="7" rx="2" fill="#e8312f" stroke="#2b1d14" strokeWidth={4} />
    <path d="M17 22v34M47 22v34" stroke="#2b1d14" strokeWidth={11} strokeLinecap="round" />
    <path d="M17 22v34M47 22v34" stroke="#e8312f" strokeWidth={5} strokeLinecap="round" />
    <rect x="28" y="22" width="8" height="11" fill="#fff4dc" stroke="#2b1d14" strokeWidth={3} />
  </svg>
);

/** What the gem states look like, for grown-ups (under the scroll). */
function GemKey() {
  const sample = { key: "ai>ae", g: "ai", p: "ae", unit: 0, inPlay: true } as Gem;
  const rows: [GemState, number, string][] = [["hidden", 0, "Not found yet"], ["charging", 0.55, "Charging: keep practising"], ["ready", 1, "Glowing: ready for a gem battle"], ["won", 1, "Won: it shines in its petal"]];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
      {rows.map(([st, e, t]) => (
        <div key={st} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 140 }}>
          <div style={{ height: 44, display: "grid", placeItems: "center" }}>
            <GemChip gem={sample} st={st} energy={e} colour="#e8312f" size={30} />
          </div>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 800, fontSize: 17, color: "#2b1d14", lineHeight: 1.1, textAlign: "center", textShadow: "0 1px 0 #fff4dc" }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- shared pieces for the trips (Intros.tsx uses them too)
/**
 * The example word Sensei is saying right now (Round 13: "highlight the card being named"): a word clip of one of
 * `words`, or the moment each is named inside a teacher-language sentence ("...like in rain, tail and nail.", timed by
 * scripts/gen-teach-word-times.py), on the clip's own clock. null between words.
 */
export function useSpokenWord(words: string[]): string | null {
  const [spot, setSpot] = useState<string | null>(null);
  const key = words.join(" ");
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const clear = () => timers.splice(0).forEach(clearTimeout);
    // (timers run on game time, like the clip: at ?fast=N both are N× faster)
    const at = (ms: number, f: () => void) => timers.push(setTimeout(f, Math.max(0, ms)));
    const off = onClip((id, start, end) => {
      const len = (end - start) * FAST;
      if (id.startsWith("word:")) {
        const w = id.slice(5);
        if (!words.includes(w)) return;
        clear();
        setSpot(w);
        at(len + 450, () => setSpot(null));
        return;
      }
      const hits = (TEACH_WORD_TIMES[id] ?? []).filter(([w]) => words.includes(w));
      if (!hits.length) return;
      clear();
      setSpot(null);
      // (a touch early, so the card is lit as the word begins)
      hits.forEach(([w, t]) => at(t * 1000 - 60, () => setSpot(w)));
      at(len + 450, () => setSpot(null));
    });
    return () => {
      off();
      clear();
    };
  }, [key]);
  return spot;
}
const plateOfWord = (w: string) => PIC_PLATES[w]?.plate ?? "butter";

/** Example words, each a card with its picture and the word with the spelling of the sound coloured in, on its
 *  picture's plate colour. The word Sensei is saying is spotlit (a warm-white ring, a little bigger), the others dim.
 *  Tap to hear. */
export function ExampleWords({ show, colour, vertical, className = "" }: { show: Explanation["show"]; colour: string; vertical?: boolean; className?: string }) {
  const spot = useSpokenWord(show.map((s) => s.word.text));
  if (!show.length) return null;
  return (
    <div className={`ex-words ${vertical ? "vertical" : ""} ${spot ? "has-spot" : ""} ${className}`} onPointerDown={(e) => e.stopPropagation()}>
      {show.map(({ word, highlight }, i) => (
        <button
          key={word.text + i}
          className={`ex-word ${spot === word.text ? "spot" : ""} ${plateOfWord(word.text) === "night" ? "on-night" : ""}`}
          aria-label={`word ${word.text}`}
          style={{ animationDelay: `${i * 0.14}s`, "--plate": PLATE_COLOURS[plateOfWord(word.text)] } as CSSProperties}
          {...tapProps(() => say({ word: word.text }))}
        >
          {word.pic && <img src={img(`pic_${word.text}`)} alt="" />}
          <span>
            {word.segs.map((s, j) => (
              <b key={j} style={s.g === highlight.g && s.p === highlight.p ? { color: colour, WebkitTextStroke: "1.5px #2b1d14" } : undefined}>{s.g.replace("-", "")}</b>
            ))}
          </span>
        </button>
      ))}
    </div>
  );
}

export interface PetalSlot { gem: Gem; st: GemState; energy: number }
/**
 * One petal, big: the teardrop in its chart colour, filling from the point as its gems are won, its picture, and
 * every spelling as a gem in its round top. Used by the gem victory (Tree), the new-gem trip and the land trip (Intros).
 * `socket`: this gem's place is still empty (its gem is on its way). `reveal`: this gem's dark crystal cracks open.
 * `lit`: gems lit up by a count ("Now you know three ways…"). `mist`: the whole petal is still hidden (it clears when
 * this turns false). `bloom` (a counter): each change makes the petal burst into bloom once.
 */
export function BigPetal({ p, w = 330, h = 470, light, slots, socket, reveal, lit, focus, mist, bloom = 0, home, className = "", style, pulse, letters }: {
  /** this gem pulses (each time `n` changes: its sound is being said) */
  pulse?: { key: string; n: number } | null;
  /** this gem's letters light up, `lit` of them (one more than it has: all together) */
  letters?: { key: string; lit: number } | null;
  p: PhonemeId;
  w?: number;
  h?: number;
  light: number;
  slots: PetalSlot[];
  socket?: string | null;
  reveal?: string | null;
  lit?: string[];
  focus?: string | null;
  mist?: boolean;
  bloom?: number;
  home?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const c = chartOf(p);
  const col = c.colour;
  const done = light >= 1;
  const d = teardropAt(w - 14, h - 14, w / 2, h / 2);
  // gems the child knows are big enough to read; the ones still hidden are small dark crystals
  const n = slots.filter((x) => met(x.st) || x.gem.key === socket || x.gem.key === reveal).length;
  const size = (n <= 2 ? 118 : n <= 4 ? 96 : n <= 6 ? 80 : 66) * (w / 330);
  const small = 46 * (w / 330);
  const uid = `bp-${p}`;
  return (
    <div className={`big-petal ${done ? "done" : ""} ${className}`} data-petal={p} style={{ width: w, height: h, "--petal": col, ...style } as CSSProperties}>
      <div key={bloom} className={bloom ? "bp-bloom" : ""} style={{ position: "absolute", inset: 0 }}>
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id={`${uid}-g`} x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0" stopColor={mix(flowerColour(col), "#ffffff", 0.55)} />
              <stop offset="0.6" stopColor={flowerColour(col)} />
              <stop offset="1" stopColor={mix(flowerColour(col), "#2b1d14", 0.2)} />
            </linearGradient>
          </defs>
          <path d={d} fill="#fffaf0" />
          <path d={d} fill={`url(#${uid}-g)`} style={{ opacity: done ? 1 : 0, transition: "opacity 1.2s" }} />
        </svg>
        {/* the colour rising from the point as the gems are won */}
        <div className="bp-fill" style={{ clipPath: `path("${d}")` }}>
          <i style={{ height: `${done ? 100 : Math.max(0, light) * 100}%`, background: `linear-gradient(0deg, ${col}, ${mix(col, "#ffffff", 0.35)})` }} />
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <path d={d} fill="none" stroke="#2b1d14" strokeWidth={16} />
          <path d={d} fill="none" stroke={col} strokeWidth={9} />
          {done && <ellipse cx={w * 0.33} cy={h * 0.2} rx={w * 0.07} ry={w * 0.15} fill="#fff" opacity={0.55} transform={`rotate(-20 ${w * 0.33} ${h * 0.2})`} />}
        </svg>
        <img className="bp-pic" src={img(`petal_${p}`)} alt="" draggable={false} style={{ left: w * 0.5 - w * 0.18, top: h * 0.58, width: w * 0.36, height: w * 0.36 }} onError={(e) => (e.currentTarget.style.display = "none")} />
        <div className="bp-gems" style={{ left: w * 0.13, right: w * 0.13, top: h * 0.07, height: h * 0.5 }}>
          {slots.map(({ gem, st, energy }) => {
            const on = lit?.includes(gem.key);
            const big = met(st) || socket === gem.key || reveal === gem.key;
            const sz = big ? size : small;
            return (
              <div key={gem.key + gem.g + (pulse?.key === gem.key ? pulse.n : "")} data-slot={gem.key} className={`bp-slot ${on ? "lit" : ""} ${focus === gem.key ? "focus" : ""} ${pulse?.key === gem.key && pulse.n ? "pulse" : ""}`} style={{ width: sz, height: sz }}>
                {socket === gem.key ? (
                  <span className="bp-socket" />
                ) : reveal === gem.key ? (
                  <>
                    <span className="bp-crack"><DarkCrystal size={size * 0.6} /></span>
                    <span className="bp-emerge"><Jewel g={gem.g} colour={col} state={met(st) ? st : "charging"} energy={energy} size={size} /></span>
                  </>
                ) : met(st) ? (
                  <Jewel g={gem.g} colour={col} state={st} energy={energy} size={size} lit={letters?.key === gem.key ? letters.lit : 0} />
                ) : (
                  <DarkCrystal size={small * 0.8} />
                )}
              </div>
            );
          })}
        </div>
        {/* a sound not met yet: ink mist over the whole petal, which clears when it is found */}
        <div className="bp-mist" style={{ clipPath: `path("${d}")`, opacity: mist ? 1 : 0 }}>
          <span>?</span>
        </div>
      </div>
      {done && home && <span className="gem-sparkle" style={{ right: "22%", top: "6%", width: "26%", height: "18%" }} />}
    </div>
  );
}

/** The slots for a petal as a save sees them. */
export function slotsOf(pt: Petal, save: Save, known: Set<string> = knownNow(save)): PetalSlot[] {
  return pt.gems.map((gem) => ({ gem, st: gemState(gem, save, known), energy: energyOf(gem.key, save) }));
}

/** The gem-victory music (public/a/m/gem_victory.mp3, a 10 s sting that builds, bursts and rings out), played over
 *  the World Flower's own music (which fades out for it) and ducked under Sensei's voice. */
function playSting(id: string) {
  const c = audioCtx();
  const vol = Math.min(0.95, settings.music * 2.6);
  const gain = c.createGain();
  gain.gain.value = 0.0001;
  gain.connect(c.destination);
  let src: AudioBufferSourceNode | null = null;
  let stopped = false;
  let ducked = false;
  const poll = setInterval(() => {
    const d = isSpeaking();
    if (d === ducked || !src) return;
    ducked = d;
    gain.gain.setTargetAtTime(d ? vol * 0.28 : vol, c.currentTime, 0.15);
  }, 90);
  const started = load(urls.music(id)).then((buf) => {
    if (!buf || stopped) return false;
    src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = FAST;
    src.connect(gain);
    ducked = isSpeaking();
    gain.gain.setValueAtTime(ducked ? vol * 0.28 : vol, c.currentTime);
    src.onended = () => clearInterval(poll);
    src.start();
    // (scripts/record-clips.ts mixes a "sting" once, not looped like music)
    ((window as any).__audioLog as unknown[] | undefined)?.push({ t: Date.now(), url: urls.music(id), kind: "sting" });
    return true;
  });
  return {
    started,
    stop() {
      stopped = true;
      clearInterval(poll);
      try {
        gain.gain.setTargetAtTime(0, c.currentTime, 0.25);
        const s = src;
        setTimeout(() => {
          try {
            s?.stop();
          } catch {}
          gain.disconnect();
        }, 1500);
      } catch {}
    },
  };
}

// ---------------------------------------------------------------- the gem victory
type VictoryPhase = "build" | "petal" | "fly" | "bloom" | "talk" | "home" | "out";
/** Stage coordinates of the victory (the play area between the ninja and Sensei's corner). */
const VX = 700, VY = 330;
const VP = { left: VX - 165, top: 88, w: 330, h: 470 };

/**
 * A gem won in its Gem Trial. On the victory music's shape (build 0–4 s, burst at 4 s, brass and flute to 7.5 s,
 * ring-out to 10 s): the gem spins up in the middle of the screen, charging with light while the ninja powers up
 * and Sensei says "You won the gem!"; its petal draws itself in behind it; on the burst the gem flies into its place
 * in the petal, the petal blooms (flash, rings, sparks, petals falling, the ninja's big celebration) and fills with
 * colour. As the music rings out Sensei explains the spelling (teach.ts newGem: "Your new gem goes right here! This is
 * the way we spell /ae/ in rain… Now you know two ways to spell /ae/.") with its words on cards and the known gems
 * lighting up one by one as she counts. Every beat moves something: the gem pulses each time its sound is said, its
 * letters light one by one on "It's two letters…" and together on "…but it's one sound", and each example word's card
 * is spotlit as she names it. A petal that is now complete flies home in the middle of the stage (re-audit r2): the big
 * World Flower comes in, the petal flies into its own place on it, blooms there with a burst, rays and a chime, and
 * holds. A complete petal shows only the gems it needs (petalComplete counts those), so "All the gems are in!" is
 * true of what the child sees: spellings with no words yet stay out of it.
 */
function GemVictory({ gemKey, onDone, onBeat }: { gemKey: string; onDone: (petalDone: PhonemeId | null) => void; onBeat?: (cue: string) => void }) {
  const gem = gemByKey(gemKey)!;
  const pt = petalOfGem(gemKey)!;
  const colour = chartOf(pt.p).colour;
  const data = useMemo(() => {
    const s0 = store.get();
    // as won (a deep link may not have it in the save yet)
    const after: Save = { ...s0, gems: s0.gems.includes(gemKey) ? s0.gems : [...s0.gems, gemKey] };
    const before: Save = { ...after, gems: after.gems.filter((k) => k !== gemKey) };
    const known = knownNow(after);
    const petalDone = petalComplete(pt, after);
    const needed = new Set(neededGems(pt).map((g) => g.key));
    return {
      slots: slotsOf(pt, after, known).filter((x) => !petalDone || needed.has(x.gem.key)),
      ways: waysKnown(pt.p, after),
      petalDone,
      flowerDone: petalDone && flowerComplete(after),
      lightBefore: petalLight(pt.p, before, known),
      lightAfter: petalLight(pt.p, after, known),
      met: new Set(Object.keys(after.words ?? {})),
      afterSave: after,
      known,
    };
  }, []);
  const beats = useMemo(() => victoryScript(gem, { met: data.met, knownWays: data.ways, petalDone: data.petalDone, flowerDone: data.flowerDone }), []);
  const talk = beats.slice(1);
  const homeAt = talk.findIndex((b) => b.cue === "petal-home");
  const waysAt = talk.findIndex((b) => b.cue === "ways");
  const metKeys = data.slots.filter((x) => met(x.st) && isWayToSpell(x.gem)).map((x) => x.gem.key);
  const [phase, setPhase] = useState<VictoryPhase>("build");
  const [heat, setHeat] = useState(0); // how charged the gem is while the music builds (0..3)
  const [cue, setCue] = useState("");
  const [lit, setLit] = useState<string[]>([]);
  const [words, setWords] = useState<Explanation["show"]>([]);
  const [bloom, setBloom] = useState(0);
  const [landing, setLanding] = useState<PhonemeId | null>(null);
  // the won gem pulses each time its sound is said, and its letters light up on "two letters, one sound"
  const [pulse, setPulse] = useState(0);
  const [letters, setLetters] = useState(0);
  // the homecoming: the big flower comes in, the petal steps aside, flies into its place and lands
  const [home, setHome] = useState<"" | "flower" | "landed">("");
  const flyRef = useRef<HTMLDivElement>(null);
  const petalRef = useRef<HTMLDivElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const opening = useRef<Promise<void> | null>(null);
  const openingDone = useRef(false);
  const beatTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const leaving = useRef(false);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const n = gem.g.replace(/-/g, "").length;
    const off = onClip((id, start, end) => {
      if (id === `sound:${pt.p}`) setPulse((k) => k + 1);
      if (/^t_(two|three|four)_letters$/.test(id)) {
        // "It's two letters…": each letter lights in turn; "…but it's one sound": they glow as one (game time)
        const len = (end - start) * FAST;
        for (let i = 1; i <= n; i++) timers.push(setTimeout(() => setLetters(i), 120 + ((len * 0.42) * (i - 1)) / Math.max(1, n - 1)));
        timers.push(setTimeout(() => setLetters(n + 1), len * 0.58));
        timers.push(setTimeout(() => setLetters(0), len + 1600));
      }
    });
    return () => {
      off();
      timers.forEach(clearTimeout);
    };
  }, []);
  /** The petal flies home onto the big World Flower in the middle of the stage (while Sensei says so). */
  const homecoming = async (live: () => boolean) => {
    setHome("flower");
    const el = petalRef.current;
    // the petal steps aside as the flower grows in
    el?.animate([{ transform: "none" }, { transform: "translate(330px, 70px) scale(.5) rotate(8deg)" }], { duration: 650, easing: "cubic-bezier(.3,1.3,.5,1)", fill: "forwards" });
    await sleep(900);
    if (!live()) return;
    void ninja.act("cast", flowerRef.current ?? undefined);
    // its own place on the flower: the ring, the angle and the size of the flower's petal there
    const svg = flowerRef.current?.querySelector("svg");
    const f = svg ? stageRect(svg) : null;
    const ri = FLOWER_RINGS[0].some((c) => c.p === pt.p) ? 0 : 1;
    const i = FLOWER_RINGS[ri].findIndex((c) => c.p === pt.p);
    if (el && f && f.w && i >= 0) {
      const g = RING[ri];
      const a = (i / FLOWER_RINGS[ri].length) * 360 + g.off;
      const u = f.w / 960; // stage px per bloom unit
      const rr = (g.r0 + g.len / 2) * u;
      const tx = f.x + f.w / 2 + Math.sin((a * Math.PI) / 180) * rr, ty = f.y + f.h / 2 - Math.cos((a * Math.PI) / 180) * rr;
      const cx = VP.left + VP.w / 2, cy = VP.top + VP.h / 2;
      const sx = (g.w * u) / (VP.w - 14), sy = (g.len * u) / (VP.h - 14);
      const spin = ((a + 540) % 360) - 180; // the short way round
      el.animate(
        [
          { transform: "translate(330px, 70px) scale(.5) rotate(8deg)" },
          { transform: `translate(${(tx - cx) * 0.45 + 120}px, ${ty - cy - 150}px) scale(.42) rotate(${spin * 0.4}deg)`, offset: 0.45 },
          { transform: `translate(${tx - cx}px, ${ty - cy}px) rotate(${spin}deg) scale(${sx}, ${sy})` },
        ],
        { duration: 1150, easing: "cubic-bezier(.45,0,.4,1)", fill: "forwards" },
      );
      await sleep(1150);
      if (!live()) return;
      // it lands: the petal is the flower's own now, lit, with a burst, rays and a chime
      setHome("landed");
      setLanding(pt.p);
      sfx.petal();
      sfx.great();
      fx.ring(tx, ty, { color: "#fff4dc", r0: 20, r1: 220, width: 16, life: 26 });
      fx.ring(tx, ty, { color: colour, r0: 30, r1: 360, width: 12, life: 34 });
      fx.burst(tx, ty, "sparks", 36, 1.2);
      fx.twinkle(tx, ty, ["#fff4dc", "#ffe38a", mix(colour, "#ffffff", 0.4)], 16, 8, 30);
      fx.ring(f.x + f.w / 2, f.y + f.h / 2, { color: "#ffe38a", r0: f.w * 0.3, r1: f.w * 0.75, width: 10, life: 36 });
      fx.rain("confetti", 70);
      void ninja.celebrate();
    }
  };
  /** Back to before the homecoming: the petal in the middle again, no big flower. */
  const unHome = () => {
    petalRef.current?.getAnimations().forEach((a) => a.cancel());
    setHome("");
    setLanding(null);
  };

  // the music-bound opening (step 0): it starts once and plays out whatever the child taps; step 0 (and its replays)
  // wait for it to reach the talk, at 7.2 s
  const sting = useRef<ReturnType<typeof playSting> | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      sting.current?.stop();
      beatTimers.current.forEach(clearTimeout);
    };
  }, []);
  const startOpening = () =>
    (opening.current ??= (async () => {
      const live = () => alive.current;
      sting.current = playSting("gem_victory");
      playMusic(null);
      ((window as any).__audioLog as unknown[] | undefined)?.push({ t: Date.now(), url: "", kind: "music-stop" });
      preload(beats.flatMap((b) => b.say).flatMap((s) => ("line" in s ? [urls.line(s.line)] : "sound" in s ? [urls.sound(s.sound)] : "word" in s ? [urls.word(s.word)] : [])));
      const slotEl = () => petalRef.current?.querySelector(`[data-slot="${CSS.escape(gemKey)}"]`) as HTMLElement | null;
      // the timeline runs on the music: wait (a little) for it to start
      await Promise.race([sting.current.started, sleep(1500)]);
      if (!live()) return;
      const t0 = performance.now();
      const at = async (ms: number) => {
        const left = ms / FAST - (performance.now() - t0);
        if (left > 0) await sleep(left * FAST);
        return live();
      };
      // --- the build: the gem charges up, the ninja powers up, Sensei: "You won the gem! It's going into its petal!"
      void ninja.act("power");
      void say(beats[0].say);
      for (let i = 0; i < 5; i++) {
        if (!(await at(250 + i * 680))) return;
        fx.implode(VX, VY, [colour, "#ffe38a", "#fff4dc"], 12 + i * 5, 250 + i * 20, 30);
        if (i >= 2) fx.glow(VX, VY, ["#fff4dc", "#ffe38a"], 3, 70, 3);
        setHeat(Math.min(3, 1 + (i >> 1)));
        if (i === 3) setPhase("petal"); // the petal draws itself in behind the gem
      }
      // --- the flight: the gem dives into its place in the petal, landing on the burst
      if (!(await at(3500))) return;
      setPhase("fly");
      const slot = slotEl(), fly = flyRef.current;
      if (slot && fly) {
        const a = stageRect(fly), b = stageRect(slot);
        const dx = b.x + b.w / 2 - (a.x + a.w / 2), dy = b.y + b.h / 2 - (a.y + a.h / 2), k = b.w / a.w;
        fly.animate(
          [
            { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
            { transform: `translate(${-dx * 0.08}px, 46px) scale(1.14) rotate(-12deg)`, offset: 0.3 },
            { transform: `translate(${dx}px, ${dy}px) scale(${k}) rotate(360deg)` },
          ],
          { duration: 480, easing: "cubic-bezier(.55,0,.8,.45)", fill: "forwards" },
        );
      }
      // --- the burst: the gem lands, the petal blooms
      if (!(await at(3990))) return;
      setPhase("bloom");
      setBloom(1);
      const s = slot ? stageRect(slot) : { x: VX, y: VY - 120, w: 0, h: 0 };
      const sx = s.x + s.w / 2, sy = s.y + s.h / 2;
      fx.ring(sx, sy, { color: "#fff4dc", r0: 20, r1: 260, width: 18, life: 26 });
      fx.ring(sx, sy, { color: colour, r0: 40, r1: 420, width: 16, life: 34 });
      fx.ring(VX, VY, { color: "#ffe38a", r0: 120, r1: 640, width: 12, life: 40 });
      fx.burst(sx, sy, "sparks", 44, 1.4);
      fx.twinkle(sx, sy, ["#fff4dc", "#ffe38a", mix(colour, "#ffffff", 0.4)], 16, 9, 34);
      fx.lines(sx, sy, 14, "#fff4dc", 90);
      fx.rain("petals", 46);
      shakeStage();
      void ninja.celebrate();
      // brass and flute: rainbow sparkles keep rising round the petal
      for (let i = 0; i < 6; i++) {
        if (!(await at(4500 + i * 450))) return;
        fx.twinkle(VX + (Math.random() - 0.5) * 360, VY + (Math.random() - 0.3) * 300, ["#fff4dc", "#ffe38a", "#ff9ec0", "#8fe3ff"], 5, 4, 26);
        if (i === 2) fx.rain("confetti", 50);
      }
      // --- as the music rings out, the talk begins (the music ducks under Sensei's voice)
      await at(7200);
      openingDone.current = true;
    })());

  // the steps: the opening, then each talk beat, held on Next (docs/NAVIGATION.md §5.B)
  const clearBeat = () => beatTimers.current.splice(0).forEach(clearTimeout);
  const steps: NavStep[] = [
    {
      key: "won",
      // Back to here (after the opening has played): the bloomed petal on its own again
      enter: () => {
        if (!openingDone.current) return; // (a replay during the opening leaves its animation alone)
        clearBeat();
        setCue("");
        setWords([]);
        setLit([]);
        unHome();
        setPhase("talk");
      },
      run: async () => {
        const replaying = !!opening.current;
        const o = startOpening();
        onBeat?.("won");
        // Hear it again: "You won the gem!…" once more, while the music carries on
        if (replaying) await Promise.all([say(beats[0].say), o]);
        else await o;
      },
    },
    ...talk.map(
      (b, k): NavStep => ({
        key: `${b.cue}${k}`,
        sound: b.say.find((x): x is { sound: PhonemeId } => "sound" in x)?.sound,
        enter: () => {
          clearBeat();
          onBeat?.(b.cue);
          setCue(b.cue);
          setPhase(homeAt >= 0 && k >= homeAt ? "home" : "talk");
          // the words on cards: the latest explanation's, until the petal flies home
          let w: Explanation["show"] = [];
          for (let j = 0; j <= k; j++) w = talk[j].cue === "petal-home" ? [] : talk[j].cue === "explain" ? talk[j].show ?? [] : w;
          setWords(w);
          // the gems Sensei counted stay lit after her count
          setLit(waysAt >= 0 && k > waysAt ? metKeys : []);
          if (homeAt < 0 || k < homeAt || b.cue === "petal-home") unHome();
          else {
            setHome("landed");
            setLanding(pt.p);
          }
        },
        run: async (live) => {
          if (b.cue === "ways") {
            // the gems light up one by one as Sensei counts them
            metKeys.forEach((key, i) =>
              beatTimers.current.push(
                setTimeout(() => {
                  if (!live()) return;
                  setLit((l) => (l.includes(key) ? l : [...l, key]));
                  sfx.tink();
                  const el = petalRef.current?.querySelector(`[data-slot="${CSS.escape(key)}"]`);
                  if (el) {
                    const r = stageRect(el);
                    fx.twinkle(r.x + r.w / 2, r.y + r.h / 2, ["#fff4dc", "#ffe38a"], 6, 5, 24);
                  }
                }, 350 + i * 380),
              ),
            );
            void ninja.act("cheer");
            await Promise.all([say(b.say), sleep(350 + metKeys.length * 380)]);
            return;
          }
          if (b.cue === "petal-home") {
            sfx.gong();
            // the big World Flower comes in; the ninja sends the petal home with a spell and it lands in its own place
            await Promise.all([say(b.say), homecoming(live)]);
            return;
          }
          if (b.cue === "flower-done") {
            sfx.fanfare();
            fx.rain("confetti", 120);
            fx.rain("petals", 60);
          }
          await say(b.say);
        },
      }),
    ),
  ];
  usePresentation(steps, {
    id: "gem-victory",
    state: false,
    guardMs: 40_000,
    // Next on the last step: the victory fades out, then the World Flower
    onDone: () => {
      if (leaving.current) return;
      leaving.current = true;
      setPhase("out");
      setTimeout(() => alive.current && onDone(data.petalDone ? pt.p : null), 650);
    },
  });

  const flying = phase === "build" || phase === "petal" || phase === "fly";
  const socket = flying ? gemKey : null;
  const bloomed = phase === "bloom" || phase === "talk" || phase === "home" || phase === "out";
  const light = (phase === "home" || phase === "out") && data.petalDone ? 1 : bloomed ? data.lightAfter : data.lightBefore;
  return (
    <div className={`gem-victory gv-${phase} ${data.petalDone ? "gv-complete" : ""} ${home === "landed" ? "gv-landed" : ""}`} style={{ "--petal": colour } as CSSProperties}>
      <div className="gv-rays" data-heat={heat} />
      <div className="gv-glow" data-heat={heat} />
      {/* the petal, drawing itself in behind the gem, then blooming as the gem lands */}
      <div ref={petalRef} className="gv-petal" style={{ left: VP.left, top: VP.top }}>
        <BigPetal p={pt.p} w={VP.w} h={VP.h} light={light} slots={data.slots} socket={socket} lit={lit} focus={cue === "here" ? gemKey : null} bloom={bloom} home={phase === "home"} pulse={{ key: gemKey, n: pulse }} letters={{ key: gemKey, lit: letters }} />
      </div>
      {/* the gem itself, big and spinning, until it dives into its place */}
      {flying && (
        <div ref={flyRef} className="gv-gem" style={{ left: VX - 125, top: VY - 125 }}>
          <div className="gv-spin" data-heat={heat}>
            {/* a front and a back face, so the letters never show mirrored as it turns */}
            <div className="gv-face"><Jewel g={gem.g} colour={colour} state="won" size={250} /></div>
            <div className="gv-face back"><Jewel g={gem.g} colour={colour} state="won" size={250} /></div>
          </div>
        </div>
      )}
      {phase === "bloom" && <div className="gv-flash" />}
      {/* the words Sensei uses, on cards to tap */}
      <div className="gv-words">
        <ExampleWords key={words.map((w) => w.word.text).join()} show={words} colour={colour} vertical />
      </div>
      {/* a complete petal flies home onto the big World Flower, in the middle of the stage */}
      {(phase === "home" || (phase === "out" && data.petalDone)) && home !== "" && (
        <div ref={flowerRef} className={`gv-flower ${home === "landed" ? "landed" : ""}`}>
          <WorldFlower light={(p) => (p === pt.p ? (landing ? 1 : 0) : petalLight(p, data.afterSave, data.known))} flash={landing} bloom={landing} stem={false} label="The World Flower" />
        </div>
      )}
      <NinjaSpot />
    </div>
  );
}

// ---------------------------------------------------------------- the scene
type View = 0 | 1; // 0 = the World Flower, 1 = the petal scroll (the school chart)

// ---------------------------------------------------------------- extension points
let pendingVisit: FlowerVisit | null = null;
let pendingFocus: string | null = null;
/** Bring the child to the World Flower for a reason (engine/gems.ts FlowerVisit), then route to the tree scene
 *  (App: go({ name: "tree" })). The same trips work from a URL, for testing: /play/?scene=tree&visit=world:2,
 *  &visit=spelling:ai>ae,ay>ae, &visit=practised:ai>ae&from=0.25, and &gem=ai>ae&celebrate=1 for the victory. */
export function visitFlower(v: FlowerVisit) {
  pendingVisit = v;
}
/**
 * Open the World Flower on the scroll, focused on one gem: the scroll moves to its petal, and the petal and the gem
 * glow. "celebrate" plays the gem victory instead. Call it, then route to the tree scene. The same focus works from
 * a URL: /play/?scene=tree&gem=<key>, where <key> is a gem key such as "ai>ae" (spelling>sound, see content/flower.ts).
 */
export function focusGem(gemKey: string, how: "glow" | "celebrate" = "glow") {
  if (how === "celebrate") pendingVisit = { kind: "gem", gem: gemKey };
  else pendingFocus = gemKey;
}
export const celebrateGem = (gemKey: string) => focusGem(gemKey, "celebrate");
function takeVisit(): { visit: FlowerVisit | null; focus: string | null; open?: boolean } {
  const v = pendingVisit, f = pendingFocus;
  pendingVisit = pendingFocus = null;
  if (v || f) return { visit: v, focus: f };
  try {
    const q = new URLSearchParams(location.search);
    const ok = (k: string | null | undefined): k is string => !!k && !!gemByKey(k);
    const [kind, arg] = (q.get("visit") ?? "").split(":");
    if (kind === "world" && Number(arg) >= 1) return { visit: { kind: "world", world: Number(arg) }, focus: null };
    if (kind === "spelling") {
      const gems = (arg ?? "").split(",").filter(ok);
      if (gems.length) return { visit: { kind: "spelling", gems }, focus: null };
    }
    if (kind === "practised" && ok(arg)) return { visit: { kind: "practised", gem: arg, from: q.has("from") ? Number(q.get("from")) : undefined }, focus: null };
    const gem = q.get("gem");
    // &open=1 opens the gem's petal as well (the treadmill and the landing-page clips use it)
    if (ok(gem)) return q.get("celebrate") ? { visit: { kind: "gem", gem }, focus: null } : { visit: null, focus: gem, open: q.has("open") };
  } catch {}
  return { visit: null, focus: null };
}

/** Pick the gem the Practise gate practises: the chosen gem, or the petal's emptiest gem that can be practised. */
function practiceGemFor(pt: Petal, sel: string | null, save: Save): string | null {
  if (sel && canPractise(sel, save)) return sel;
  const known = knownNow(save);
  const cands = pt.gems.filter((g) => met(gemState(g, save, known)) && canPractise(g.key, save));
  const charging = cands.filter((g) => gemState(g, save, known) === "charging").sort((a, b) => energyOf(a.key, save) - energyOf(b.key, save));
  return (charging[0] ?? cands[0])?.key ?? null;
}

/** The words the child has met with this sound (or this spelling), each with its picture and the spelling of the
 *  sound coloured in. Tap to hear. Hidden until the child has met at least one. */
function MetWords({ pt, gem, save }: { pt: Petal; gem: Gem | null; save: Save }) {
  const has = (w: Word) => w.segs.some((s) => s.p === pt.p && (!gem || s.g === gem.g));
  const metWords = Object.entries(save.words ?? {})
    .sort((a, b) => b[1].last - a[1].last)
    .map(([t]) => WORD_BY_TEXT[t])
    .filter((w): w is Word => !!w && has(w))
    .slice(0, 5);
  if (!metWords.length) return null;
  const colour = chartOf(pt.p).colour;
  return (
    <div className="pd-found">
      <RoundButton sm label="Hear about these words" onClick={() => say({ line: "t_words_you_found" })}><Icon.speaker /></RoundButton>
      <div className="pd-found-words">
        {metWords.map((w) => (
          <button key={w.text} aria-label={`word ${w.text}`} className={`met-word ${plateOfWord(w.text) === "night" ? "on-night" : ""}`} style={{ "--plate": PLATE_COLOURS[plateOfWord(w.text)] } as CSSProperties} {...tapProps(() => say({ word: w.text }))}>
            {w.pic && <img src={img(`pic_${w.text}`)} alt="" />}
            <span>
              {w.segs.map((s, i) => (
                <b key={i} style={s.p === pt.p && (!gem || s.g === gem.g) ? { color: colour, WebkitTextStroke: "1px #2b1d14" } : undefined}>{s.g.replace("-", "")}</b>
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Sensei explains the sound, the chosen spelling, or "same sound, different spellings", in Sounds~Write teacher
 *  language (content/teach.ts), each time `run` goes up (and not before it is 1), rotating phrasings. The words she
 *  uses are shown on cards to tap. `onDone` hears whether she finished (a tap elsewhere can cut her off). */
function Explain({ pt, gem, metGems, save, run, onDone }: { pt: Petal; gem: Gem | null; metGems: Gem[]; save: Save; run: number; onDone?: (finished: boolean) => void }) {
  const metSet = useMemo(() => new Set(Object.keys(save.words ?? {})), [save.words]);
  const [shown, setShown] = useState<Explanation["show"]>(() => exampleWords(pt.p, gem?.g, metSet));
  useEffect(() => {
    if (run < 1) return;
    const e: Explanation = gem
      ? introGem(gem, { met: metSet, another: metGems.length > 1 })
      : metGems.length > 1 && Math.random() < 0.5
        ? sameSound(pt.p, metGems, { met: metSet })
        : introPetal(pt.p, { met: metSet });
    setShown(e.show);
    let live = true;
    const t = setTimeout(async () => {
      const finished = await say(e.say);
      if (live) onDone?.(finished);
    }, run === 1 ? 750 : 150); // the first time, after the panel pops in and the petal's sound has been said
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [run]);
  const colour = chartOf(pt.p).colour;
  return (
    <div className="pd-explain">
      <button className="explain-btn" data-nav="again" aria-label="Sensei explains" {...tapProps(() => void navAgain())}>
        <TalkingFace who="sensei" />
      </button>
      <ExampleWords key={shown.map((s) => s.word.text).join()} show={shown} colour={colour} />
    </div>
  );
}

const HINT_KEY = "superninja.scrollHint";
const hintSeen = () => {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true;
  }
};

type Step = "intro" | "visit" | "done" | "free";
export function Tree({ onBack, onTrial, onPractice, celebrate, visit: visitProp }: {
  /** after a trip, the green Next carries on here (App: where the trip was going, else the map; Home goes there too) */
  onBack: () => void;
  onTrial: (key: string) => void;
  /** open a practice dojo for this gem (App: makePractice(key), then go({ name: "level", id: "trial" })) */
  onPractice?: (key: string) => void;
  celebrate?: { gem: string; won: boolean };
  visit?: FlowerVisit | null;
}) {
  const save = useSave((s) => s);
  const known = useMemo(() => knownNow(save), [save]);
  const practise = onPractice;
  // why the child is here: a trip (a gem won, spellings met, a new land, a practice done), a failed trial, or a look
  const [{ visit, focus, failed, openFocus }] = useState((): { visit: FlowerVisit | null; focus: string | null; failed: string | null; openFocus?: boolean } => {
    if (celebrate) return celebrate.won ? { visit: { kind: "gem", gem: celebrate.gem }, focus: null, failed: null } : { visit: null, focus: celebrate.gem, failed: celebrate.gem };
    if (visitProp) return { visit: visitProp, focus: null, failed: null };
    const t = takeVisit();
    return { visit: t.visit, focus: t.focus, failed: null, openFocus: t.open };
  });
  const tripGem = visit?.kind === "spelling" ? visit.gems[0] : visit?.kind === "practised" ? visit.gem : null;
  const scrollFocus = focus ?? tripGem;
  const [view, setView] = useState<View>(scrollFocus ? 1 : 0);
  // a child's first time here starts with the World Flower's introduction (not before a victory: that comes first)
  const [step, setStep] = useState<Step>(() => (!store.get().seenFlower && visit?.kind !== "gem" ? "intro" : visit ? "visit" : "free"));
  const [open, setOpen] = useState<Petal | null>(() => (failed ? petalOfGem(failed) : openFocus && focus ? petalOfGem(focus) : null));
  const [openQuiet, setOpenQuiet] = useState(!!failed);
  const [openLead, setOpenLead] = useState<string | null>(null);
  const [bloomed, setBloomed] = useState<PhonemeId | null>(null);
  const [nudge, setNudge] = useState(false);
  const [energyShow, setEnergyShow] = useState<Record<string, number>>(() => (visit?.kind === "practised" ? { [visit.gem]: visit.from ?? lastPractice()?.from ?? 0 } : {}));
  const [reveal, setReveal] = useState<string[]>([]);
  const [beat, setBeat] = useState("");
  // a trip is a show over the flower (the intro, the victory, new spellings, a new land): the flower under it is out of
  // reach until it ends. The practised trip plays on the scroll itself.
  const overlay = step === "intro" || (step === "visit" && visit?.kind !== "practised");
  const tripOn = step === "intro" || step === "visit";
  // Help: on a trip's held steps, the step again, then point at Next; after a trip, the arrow; otherwise the flower
  useHelp(
    (n) => {
      if (tripOn) return n === 1 ? navAgain() : nudgeNext();
      if (step === "done") return n === 1 ? void say({ line: "help_next" }) : nudgeNext();
      void say({ line: "help_flower" });
    },
    [step],
  );
  // Hear it again (top-right, docs/NAVIGATION.md §3.1): what was said on arrival; after a trip, Next carries on
  useNav({
    again: tripOn ? undefined : () => say({ line: "flower_tap" }),
    againAt: "top-right",
    next: step === "done" ? { ready: true, go: onBack } : null,
  });

  const ready = useMemo(() => new Set(readyGems(save).flatMap((g) => PETALS.filter((pt) => pt.gems.some((x) => x.key === g.key)).map((pt) => pt.p))), [save]);
  const light = (p: PhonemeId) => petalLight(p, save, known);
  const placed = PETALS.filter((pt) => petalComplete(pt, save)).length;

  useEffect(() => {
    if (visit?.kind !== "gem") playMusic("world_blossom");
    const t = setTimeout(() => setNudge(true), 6000); // invite a look at the chart
    if (step === "free" && !failed && store.get().seenFlower) say({ line: "flower_tap" });
    return () => clearTimeout(t);
  }, []);

  // bots and the treadmill read what is happening here (scripts/treadmill/bot.ts)
  (window as any).__snState = { scene: "tree", view, open: open?.p ?? null, visit: visit?.kind ?? null, step, beat, intro: step === "intro", busy: tripOn, done: step === "done" };

  const openPetal = (p: PhonemeId) => {
    sfx.petal();
    setOpenQuiet(false);
    setOpenLead(null);
    setOpen(petalOf(p));
    say({ sound: p });
  };
  const closeDetail = () => setOpen(null);
  const next = () => {
    sfx.page();
    setNudge(false);
    setView(view ? 0 : 1);
  };
  // a trip is remembered once it has played to its end (Home mid-trip leaves it due: docs/NAVIGATION.md §3.3)
  const endTrip = () => {
    if (visit) {
      markVisited(visit);
      setTripDue(null);
    }
    setStep("done");
  };

  return (
    <div className="scene" style={{ background: "#f7ddd0", overflow: "hidden" }}>
      <img className="bg-img" src={img("world_flower_bg")} alt="" style={{ filter: view === 0 ? "saturate(.85) brightness(1.05)" : "saturate(.6) brightness(1.1) blur(3px)" }} />
      <div className="vignette" />

      <div className="tree-base" aria-hidden={overlay || undefined} inert={overlay}>
        {view === 0 ? (
          // the World Flower, big: one tap target, the nearest petal opens
          <div key="flower" className="pop-in" style={{ position: "absolute", left: 405, top: 26, width: 580, height: 580 }}>
            <WorldFlower light={light} ready={ready} bloom={bloomed} count={[placed, PETALS.length]} onPetal={openPetal} label="The World Flower: tap a petal" />
          </div>
        ) : (
          <PetalScroll save={save} known={known} onOpen={(pt) => (setOpenQuiet(false), setOpenLead(null), setOpen(pt))} light={light} placed={placed} focus={scrollFocus} energyShow={energyShow} reveal={reveal} />
        )}

        {/* switch between the flower and the scroll (clear of the scroll band and of the Help corner) */}
        <div style={{ position: "absolute", right: 16, top: 424 }}>
          <RoundButton label={view === 0 ? "Petal chart" : "The World Flower"} className={`pink ${view === 0 && nudge && step === "free" ? "pulse" : ""}`} onClick={next}>
            {view === 0 ? <ChartIcon /> : <FlowerIcon />}
          </RoundButton>
        </div>
      </div>

      {step === "intro" && (
        <FlowerIntro
          onDone={() => {
            store.set((s) => void (s.seenFlower = true));
            if (visit) setStep("visit");
            else {
              setStep("free");
              say({ line: "flower_tap" });
            }
          }}
        />
      )}
      {step === "visit" && visit?.kind === "gem" && (
        <GemVictory
          gemKey={visit.gem}
          onBeat={setBeat}
          onDone={(home) => {
            setView(0);
            playMusic("world_blossom");
            if (home) {
              // the petal that has just come home is picked out on the big flower too: it blooms, and stays bigger and
              // glowing while the child is here
              setBloomed(home);
              setTimeout(() => {
                const el = document.querySelector(`[aria-label="The World Flower: tap a petal"] [data-p="${home}"]`);
                const r = el ? stageRect(el) : null;
                if (r?.w) fx.burst(r.x + r.w / 2, r.y + r.h / 2, "sparks", 30);
              }, 450);
            }
            endTrip();
          }}
        />
      )}
      {step === "visit" && visit?.kind === "spelling" && (
        <GemFound
          gems={visit.gems}
          onBeat={setBeat}
          onDone={() => {
            setReveal(visit.gems);
            endTrip();
          }}
        />
      )}
      {step === "visit" && visit?.kind === "world" && <WorldVisit world={visit.world} onBeat={setBeat} onDone={endTrip} />}
      {step === "visit" && visit?.kind === "practised" && (
        <PractisedTrip
          gem={visit.gem}
          from={visit.from ?? lastPractice()?.from ?? 0}
          onBeat={setBeat}
          onEnergy={setEnergyShow}
          onDone={(isReady) => {
            endTrip();
            // a gem that is full now: its petal opens with the gem glowing, one tap from its Gem Trial
            if (isReady) {
              setOpenQuiet(true);
              setOpenLead("gem_ready");
              setOpen(petalOfGem(visit.gem));
              void say({ line: "gem_ready" });
            }
          }}
        />
      )}
      {open && (
        <PetalDetail
          key={open.p}
          pt={open}
          gem={failed ?? tripGem ?? focus ?? null}
          quiet={openQuiet}
          invite={!!failed}
          lead={openLead}
          onClose={closeDetail}
          onTrial={onTrial}
          onPractice={practise}
        />
      )}
      <SenseiDock hidden />
    </div>
  );
}

/** Back from the dojo: the scroll glides to the practised gem and its energy bar fills up, "Your gem filled up…" (one
 *  held step; docs/NAVIGATION.md). `onDone(ready)`: after Next; `ready`: the gem is full now. */
function PractisedTrip({ gem, from, onDone, onBeat, onEnergy }: { gem: string; from: number; onDone: (ready: boolean) => void; onBeat: (cue: string) => void; onEnergy: (e: Record<string, number>) => void }) {
  const g = gemByKey(gem)!;
  const [isReady] = useState(() => gemState(g, store.get()) === "ready");
  const beats = practisedScript(g, isReady).filter((b) => b.cue !== "ready"); // (the ready line goes with the petal)
  const steps: NavStep[] = beats.map((b) => ({
    key: b.cue,
    enter: () => {
      onBeat(b.cue);
      onEnergy({ [gem]: from });
    },
    run: async (live) => {
      await sleep(1400);
      if (!live()) return;
      onEnergy({});
      sfx.coin();
      const chip = document.querySelector(`[data-gem-chip="${CSS.escape(gem)}"]`);
      if (chip) {
        const r = stageRect(chip);
        fx.twinkle(r.x + r.w / 2, r.y + r.h / 2, ["#fff4dc", "#ffe38a"], 10, 6, 28);
        fx.glow(r.x + r.w / 2, r.y + r.h / 2, ["#ffe38a"], 4, 60, 2);
      }
      await Promise.all([say(b.say), sleep(1400)]);
    },
  }));
  usePresentation(steps, { id: "practised", onDone: () => onDone(isReady), state: false });
  return null;
}

/** The petal chart as a ninja scroll: one row of big petals in the school sheet's order, swiped sideways. */
function PetalScroll({ save, known, onOpen, light, placed, focus, energyShow, reveal }: { save: Save; known: Set<string>; onOpen: (p: Petal) => void; light: (p: PhonemeId) => number; placed: number; focus?: string | null; energyShow?: Record<string, number>; reveal?: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(() => !hintSeen() && !focus);
  const touched = useRef(!!focus);
  const userSwiped = useRef(false);
  const swipeFrom = useRef(0);
  useEffect(() => {
    const el = ref.current!;
    if (focus) {
      // move the focused gem's petal to the middle of the scroll, then let it glow
      const pt = PETALS.find((x) => x.gems.some((g) => g.key === focus));
      const target = pt && (el.querySelector(`[data-p="${pt.p}"]`) as HTMLElement | null);
      if (target) {
        const box = el.getBoundingClientRect(), t = target.getBoundingClientRect(), k = box.width / el.clientWidth; // the stage is scaled
        const left = el.scrollLeft + (t.left - box.left) / k - (el.clientWidth - t.width / k) / 2;
        setTimeout(() => el.scrollTo({ left, behavior: "smooth" }), 350);
      }
    }
    // a small automatic nudge shows that the scroll moves
    const t1 = setTimeout(() => !touched.current && el.scrollTo({ left: 170, behavior: "smooth" }), 700);
    const t2 = setTimeout(() => !touched.current && el.scrollTo({ left: 0, behavior: "smooth" }), 1500);
    const t3 = setTimeout(() => setHint(false), 5200);
    const onScroll = () => {
      // only the child's own swipe counts (not the nudge, not scroll-snap)
      if (userSwiped.current && Math.abs(el.scrollLeft - swipeFrom.current) > 60) {
        touched.current = true;
        setHint(false);
        try {
          localStorage.setItem(HINT_KEY, "1");
        } catch {}
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      [t1, t2, t3].forEach(clearTimeout);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);
  // mouse users: the wheel scrolls sideways, and dragging with the mouse pans the scroll
  const drag = useRef<{ x: number; sl: number } | null>(null);
  const groups = [1, 2, 3].map((n) => CHART_PETALS.filter((c) => c.page === n));
  return (
    <>
      <style>{`@keyframes wffocus{0%,100%{box-shadow:0 0 0 rgba(255,197,61,0)}50%{box-shadow:0 0 18px rgba(255,197,61,1)}}@keyframes swipehand{0%{transform:translateX(120px);opacity:0}15%{opacity:1}70%{transform:translateX(-200px);opacity:1}100%{transform:translateX(-220px);opacity:0}}.petal-scroll::-webkit-scrollbar{display:none}`}</style>
      {/* the parchment band, between two fixed wooden rollers */}
      <div className="pop-in" style={{ position: "absolute", left: 22, right: 22, top: 92, height: 284 }}>
        <div style={{ position: "absolute", left: 16, right: 16, top: 0, bottom: 0, borderTop: "4px solid #2b1d14", borderBottom: "4px solid #2b1d14", background: "repeating-linear-gradient(90deg, rgba(160,110,50,.05) 0 3px, transparent 3px 11px), linear-gradient(180deg, #e8cf9c 0%, #f8ebc9 12%, #fbf1d6 50%, #f3e0b3 88%, #d9b97c 100%)", boxShadow: "0 10px 24px rgba(90,50,20,.3)" }} />
        <div
          ref={ref}
          className="scrollable petal-scroll"
          onWheel={(e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) ref.current!.scrollLeft += e.deltaY;
          }}
          onPointerDown={(e) => {
            touched.current = true;
            userSwiped.current = true;
            swipeFrom.current = ref.current!.scrollLeft;
            if (e.pointerType === "mouse") drag.current = { x: e.clientX, sl: ref.current!.scrollLeft };
          }}
          onPointerMove={(e) => {
            if (drag.current && e.buttons) ref.current!.scrollLeft = drag.current.sl - (e.clientX - drag.current.x) / (ref.current!.getBoundingClientRect().width / ref.current!.clientWidth);
          }}
          onPointerUp={() => (drag.current = null)}
          style={{ position: "absolute", left: 30, right: 30, top: 4, bottom: 4, overflowX: "auto", overflowY: "hidden", touchAction: "pan-x", WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity", scrollbarWidth: "none", overscrollBehaviorX: "contain" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, height: "100%", padding: "0 44px" }}>
            {groups.map((g, gi) => (
              <div key={gi} style={{ display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
                {gi > 0 && <span aria-hidden style={{ width: 22, height: 22, borderRadius: "50%", background: "#ffc53d", border: "4px solid #2b1d14", flex: "none", margin: "0 10px" }} />}
                {g.map((c) => (
                  <ScrollPetal key={c.p} p={c.p} save={save} known={known} onOpen={onOpen} focusGem={focus} energyShow={energyShow} reveal={reveal} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <Roller side="left" />
        <Roller side="right" />
        {hint && <SwipeHand />}
      </div>
      <ProgressVine light={light} />
      {/* under the scroll: the flower keeps growing, and a key to the gems for grown-ups (decoration only) */}
      <div aria-hidden style={{ position: "absolute", left: 60, top: 404, width: 230, height: 230, pointerEvents: "none" }}>
        <WorldFlower light={light} count={[placed, PETALS.length]} />
      </div>
      <div aria-hidden style={{ position: "absolute", left: 340, right: 170, top: 420, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <GemKey />
      </div>
    </>
  );
}

/**
 * One petal up close: the sound (tap the petal to hear it), every spelling as a gem, Sensei's explanation with its
 * words, the words the child has found, and the green gate that opens a practice dojo. Tap a gem the child has met to
 * hear how it spells the sound (Sensei then invites a charging gem to the dojo); tap a glowing gem for its Gem Trial.
 * `gem`: the gem to start on. `quiet`: open without explaining (Sensei has just spoken). `invite`: straight to "Shall
 * we practise this in the dojo?" (after a Gem Trial that didn't go well).
 */
export function PetalDetail({ pt, gem, onClose, onTrial, onPractice, quiet, invite, lead }: {
  pt: Petal;
  gem?: string | null;
  onClose: () => void;
  onTrial: (key: string) => void;
  onPractice?: (key: string) => void;
  quiet?: boolean;
  invite?: boolean;
  /** a line said as the panel opened (the gem is ready): Hear it again says it, until Sensei has explained */
  lead?: string | null;
}) {
  const save = useSave((s) => s);
  const known = useMemo(() => knownNow(save), [save]);
  const c = chartOf(pt.p);
  const states = pt.gems.map((g) => gemState(g, save, known));
  const metGems = pt.gems.filter((_, i) => met(states[i]));
  const [sel, setSel] = useState<string | null>(() => (gem && metGems.some((g) => g.key === gem) ? gem : null));
  const selGem = metGems.find((g) => g.key === sel) ?? null;
  const practiseKey = onPractice ? practiceGemFor(pt, sel, save) : null;
  const [run, setRun] = useState(quiet || invite || !metGems.length ? 0 : 1);
  const [pulse, setPulse] = useState(false);
  useHelp(() => say({ line: "wf_help_petal" }));
  const runRef = useRef(run);
  runRef.current = run;
  // Hear it again (Sensei's face, docs/NAVIGATION.md §3.1 "own"): what Sensei said as the panel opened (the gem is
  // ready; shall we practise?) until she has explained, then her explanation again
  const replay = () => {
    setPulse(false);
    const opening = invite && practiseKey ? "t_practise_invite" : lead;
    if (runRef.current === 0 && opening) return say({ line: opening });
    setRun((n) => n + 1);
  };
  // a dialog: the nav controls under it (a trip's Next, the flower's Hear it again) wait until it closes; Home stays
  useNav({ modal: true, again: metGems.length || lead || invite ? replay : null, againAt: "own", sound: null });
  useEffect(() => {
    if (!invite || !practiseKey) return;
    const t = setTimeout(async () => {
      if (await say({ line: "t_practise_invite" })) setPulse(true);
    }, 900);
    return () => clearTimeout(t);
  }, []);
  // after explaining a gem that is still charging, Sensei invites the child to practise it
  const explained = async (finished: boolean) => {
    if (!finished || !selGem || !practiseKey || practiseKey !== selGem.key) return;
    if (gemState(selGem, store.get()) !== "charging") return;
    if (await say({ line: "t_practise_invite" })) setPulse(true);
  };
  const tapGem = (g: Gem, st: GemState) => {
    if (st === "ready") {
      sfx.great();
      onTrial(g.key);
    } else if (met(st)) {
      sfx.petal();
      setSel(g.key);
      setPulse(false);
      setRun((n) => n + 1);
    } else if (st === "hidden") say({ line: "gem_hidden" });
    else say({ line: "gem_future" });
  };
  const n = pt.gems.length;
  const size = n > 8 ? 92 : n > 5 ? 108 : n > 3 ? 128 : 150;
  return (
    <div data-modal className="pd-backdrop" {...tapProps(onClose)}>
      <div className="pd-sheet pop-in" onPointerDown={(e) => e.stopPropagation()} style={{ "--petal": c.colour } as CSSProperties}>
        <div className="pd-left">
          {/* The petal leads with its picture (the sound picture, docs/NAVIGATION.md §4), and is itself the "hear the
              sound" button (a speaker on it). No letters: a sound is never shown to a child as a letter string (it read
              as another spelling, next to the gems); the school's petal chart has only the picture and the spellings.
              Grown-ups get the /sound/ as a tooltip. */}
          <SoundBadge p={pt.p} size={200} />
          <div className="pd-actions">
            {practiseKey && (
              <RoundButton label="Practise in the dojo" className={`go pd-practise ${pulse ? "pulse" : ""}`} onClick={() => (sfx.great(), onPractice!(practiseKey))}>
                <GateIcon />
              </RoundButton>
            )}
          </div>
        </div>
        <div className="pd-main">
          <div className="pd-gems">
            {pt.gems.map((g, i) => {
              const st = states[i];
              return (
                <div key={g.key + g.g} role="button" aria-label={`gem ${g.g} ${st}`} {...tapProps(() => tapGem(g, st))} className={`pd-gem ${g.key === sel ? "sel" : ""}`} style={{ width: met(st) ? size : 92, height: met(st) ? size : 92 }}>
                  {met(st) ? <Jewel g={g.g} colour={c.colour} state={st} energy={energyOf(g.key, save)} size={size} /> : <DarkCrystal size={size * 0.42} />}
                  {st === "ready" && (
                    <span className="pd-play btn-round go pulse" aria-hidden>
                      <Icon.play />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {metGems.length > 0 && <Explain key={sel ?? "petal"} pt={pt} gem={selGem} metGems={metGems} save={save} run={run} onDone={explained} />}
          <MetWords pt={pt} gem={selGem} save={save} />
        </div>
        <div className="pd-close">
          <RoundButton sm label="close" onClick={onClose}><Icon.check /></RoundButton>
        </div>
      </div>
    </div>
  );
}

export { neededGems };
