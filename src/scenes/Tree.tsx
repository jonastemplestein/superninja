// The World Flower: the heart of the Island of Sounds (docs/ART_STYLE.md, assets-src/world-flower/model_sheet.png), v2
// (docs/SCROLL_DESIGN.md, the mockup docs/scroll-design/final/). One life cycle, two views: a petal is missing until its
// sound is met, comes back as a faint outline, fills with colour as its gems charge and are won (the colour is its whole
// chart column, true to area), gets a gold line when every gem the child can win for now is won, and is complete (star,
// gloss, a gold aura) when its whole column is won. Every spelling met has a gem meter: pencil glass whose lower half
// fills with practice, the gold gem with rays when its battle is ready, a solid ink jewel once won.
// View 0 is the radial flower (WorldFlower); view 1 is the petal chart: the school's two laminated sheets and a third
// for the sounds they leave out, half a sheet per screen, swiped up and down (PetalChart). Tap a petal (on either view)
// and its card grows out of it (PetalDetail): the chosen spelling and its gem, three words, ONE action (the gem guardian
// for a ready gem's battle, else the dojo gate), and the fork panel for a spelling with more than one sound.
// World Flower 2.0 (docs/FEEDBACK.md Round 12): the game also brings children here (engine/gems.ts FlowerVisit): a gem
// won in its Gem Trial plays the victory sequence below (GemVictory); new spellings, a new land and a finished practice
// play their trips (Intros.tsx GemFound and WorldVisit, and the practised beat here). What Sensei says is in teach.ts.
// Layout: nothing interactive in the bottom-left 330×340 (the player's ninja) or the bottom-right 150×150 (Sensei's help).
import { memo, startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { PETALS, CHART_PETALS, chartOf, neededGems, gemByKey, type Petal, type Gem, type ChartPetal } from "../content/flower";
import { PHONEMES, WORD_BY_TEXT, type PhonemeId, type Word } from "../content/phonics";
import { LINES } from "../content/lines";
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
import { img, RoundButton, Icon, fx, SenseiDock, tapProps, useHelp, stageRect, sleep, shakeStage } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { useNav, usePresentation, navAgain, nudgeNext, type Step as NavStep } from "../ui/nav";
import { teardrop, teardropAt, mix, petalImg, petalColour } from "../ui/petal";
import {
  levelFromPoint, flowerDrop, STAR, GOLD_GEM, STAR_D, GEM_D, CHART, HINT, PETAL_DROP, BIG_DROP, PETAL_LEVEL, BIG_LEVEL, SHEET_FIT, CARD_FIT, chartMasks, chartColours, colourVars,
  linesOf, lineSig, isMetLine, layoutVars, snapLevel, soundLineImage, landingHalf, halfOf, gemW, type Line,
} from "../ui/chartPetal";
import { lookFromLight, petalLook, petalLooks, gemLook, soundLineOf, type PetalLook, type GemLook } from "../ui/petalLook";
import { flowerOverview, petalProgress, multiSoundSpellings, soundsOfSpelling, swUnitOf, ENERGY_FULL, type PetalProgress, type MultiSound } from "../content/progress";
import { FlowerIntro, WorldVisit, GemFound } from "./Intros";
import { gemReadySay, gemLineHeard, heard, onceInSave } from "./narrate";
import "../styles/tree-teach.css";
import "../styles/tree-visit.css";
import "../styles/tree-chart.css";

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
/** The flower's area-true colour levels, from the point (the heart) outwards, one table per ring (the mockup measured
 *  them by rasterising the path; these are measured on the path itself). */
const RING_LEVEL = RING.map((g) => levelFromPoint(flowerDrop(g.w, g.len)));
const f3 = (x: number) => Math.max(0, Math.min(1, x)).toFixed(3);
/** the flower's surface line: 3 % of the petal long, ending at the level */
const SURFACE = 0.03;
/** A flower petal's gradient stops (from the heart outwards, 0..1): the colour, deep at the heart and full from 55 % of
 *  the way to where it ends (T); the surface line from T to the level L (the colour with 35 % ink, gold when all won for
 *  now); then nothing. Complete: the colour all the way. */
function flowerStops(col: string, L: number, caught: boolean) {
  const T = L < 1 ? Math.max(0, L - SURFACE) : 1, surf = caught ? "#ffc53d" : mix(col, "#2b1d14", 0.35);
  return (
    <>
      <stop offset="0" stopColor={mix(col, "#2b1d14", 0.18)} />
      <stop offset={f3(T * 0.55)} stopColor={col} />
      <stop offset={f3(T)} stopColor={col} />
      {L < 1 && (
        <>
          <stop offset={f3(T)} stopColor={surf} />
          <stop offset={f3(L)} stopColor={surf} />
          <stop offset={f3(L)} stopColor="#ffffff" stopOpacity={0} />
        </>
      )}
    </>
  );
}
/**
 * The World Flower (docs/SCROLL_DESIGN.md §3.5), sized by its container (the bloom fills the box; the painted stem hangs
 * below it). Every petal is drawn by its look (ui/petalLook.ts): a missing petal is not there (a gap, or a faint dotted
 * outline for a sound hiding in the child's land), a met one comes back as a faint outline with its picture, fills with
 * its colour out from the heart (true to area: the petal's share of its whole chart column), gets a gold surface when
 * every gem the child can win for now is won, and is complete (full colour, gloss, a thin gold line, the ring's glow)
 * when its whole column is won. The heart counts the petals on the flower; its stamens light with the whole flower.
 * `look` per petal (v2); callers that still pass `light` (0..1) get lookFromLight. `ready`: petals with a gem ready for
 * its battle (a gold gem at the tip, hopping three times on arrival and on each change of `arrive`). `hint`: sounds
 * hiding in this land shimmer (WorldVisit). `misty`: the lost flower (the first visit): missing petals in their own
 * colours, softened. `landing` flies one petal home, `bloom` pops one out bigger, `flash` lights one for a moment,
 * `grow` grows one out of the heart as a faint outline (a sound just met), `rise` animates one petal's colour from
 * `from` to its level (a gem just won, 1.6 s: the one animation that isn't transform or opacity, SCROLL_DESIGN §5.4).
 *
 * Performance (docs/PERF.md fix 9, SCROLL_DESIGN §6): nothing in the SVG animates, so it is painted once; the sparkles
 * and gold gems are an HTML layer that twinkles and hops a few times, then rests. Nothing is endless (a `hint` shimmer
 * is, while WorldVisit shows it, on its own layer: its opacity).
 */
export const WorldFlower = memo(function WorldFlower({ light, look, ready, landing, count, onPetal, stem = true, label = "The World Flower", hint, flash, misty, bloom, pics = true, grow, rise, arrive = 0 }: {
  /** every met petal shows its sound's picture near its round tip, upright, like the school chart; missing ones don't */
  pics?: boolean;
  misty?: boolean;
  bloom?: PhonemeId | null;
  /** v2: each petal's look (from the progress model: petalLooks(flowerOverview(save))) */
  look?: (p: PhonemeId) => PetalLook;
  /** legacy: 0..1 per petal (petalLight), mapped by lookFromLight */
  light?: (p: PhonemeId) => number;
  ready?: Set<string>;
  landing?: PhonemeId | null;
  count?: [number, number];
  onPetal?: (p: PhonemeId) => void;
  stem?: boolean;
  label?: string;
  hint?: Set<PhonemeId>;
  flash?: PhonemeId | null;
  grow?: PhonemeId | null;
  rise?: { p: PhonemeId; from: number } | null;
  /** each change replays the arrival: the sparkles twinkle twice and the ready gems hop three times */
  arrive?: number;
}) {
  const uid = useMemo(() => `wf${++flowerIds}`, []);
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);
  const all = FLOWER_RINGS.flat();
  const lookOf = (p: PhonemeId): PetalLook => look?.(p) ?? lookFromLight(p, light?.(p) ?? 0, !!hint?.has(p));
  const looks = new Map(all.map((c) => [c.p, lookOf(c.p)]));
  // how far through the whole chart the flower is (the mean colour of all 44): the stamens and the halo grow with it
  const W = all.reduce((s, c) => s + looks.get(c.p)!.level, 0) / all.length;

  // a tap anywhere on the bloom picks the nearest petal (a missing one too: its sound is still a secret)
  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
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

  // `rise`: this petal's colour grows from `from` to its level (the gradient's stops move, on the main thread, 1.6 s)
  useEffect(() => {
    if (!rise) return;
    const ri = FLOWER_RINGS[0].some((c) => c.p === rise.p) ? 0 : 1;
    const to = looks.get(rise.p)!;
    const L1 = to.stage === "complete" ? 1 : RING_LEVEL[ri](to.level), L0 = RING_LEVEL[ri](Math.max(0, rise.from));
    const grad = boxRef.current?.querySelector(`#${uid}-f-${CSS.escape(rise.p)}`);
    const stops = grad ? [...grad.querySelectorAll("stop")] : [];
    if (stops.length < 3) return;
    const t0 = performance.now(), D = 1600 / FAST;
    let raf = 0;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const frame = () => {
      const k = Math.min(1, (performance.now() - t0) / D), L = L0 + (L1 - L0) * ease(k), T = L < 1 ? Math.max(0, L - SURFACE) : 1;
      const offs = [0, T * 0.55, T, T, L, L];
      stops.forEach((s, i) => s.setAttribute("offset", f3(offs[i] ?? L)));
      if (k < 1) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [rise?.p, rise?.from]);

  const defs: React.ReactNode[] = [];
  const fxNodes: React.ReactNode[] = [];
  /** Where a petal sits on the bloom, and the classes of the group that carries its landing, bloom or growth. */
  const place = (c: ChartPetal, i: number, ri: number) => {
    const g = RING[ri];
    return {
      g,
      a: (i / FLOWER_RINGS[ri].length) * 360 + g.off,
      d: teardrop(g.w, g.len),
      cls: landing === c.p ? "wf-land" : bloom === c.p ? "wf-bloom" : grow === c.p ? "wf-grow" : undefined,
    };
  };
  const petal = (c: ChartPetal, i: number, ri: number) => {
    const { g, a, d, cls } = place(c, i, ri);
    const lk = looks.get(c.p)!;
    const col = flowerColour(c.colour);
    const tf = `rotate(${a.toFixed(2)}) translate(0 ${-(g.r0 + g.len / 2)})`;
    let body: React.ReactNode;
    if (lk.stage === "missing") {
      body = misty ? (
        // the lost flower (its first visit): the missing petals in their own colours, softened, in the mist
        <path d={d} data-p={c.p} aria-label={`petal ${c.p}`} fill={mix(col, "#7d7a96", 0.4)} fillOpacity={0.72} stroke="#2b1d14" strokeOpacity={0.4} strokeWidth={3.5} pointerEvents="visiblePainted" />
      ) : (
        // MISSING: nothing there; a sound hiding in this land is a faint white dotted outline; the gap still takes a tap
        <path d={d} data-p={c.p} aria-label={`petal ${c.p}`} fill="#fffaf0" fillOpacity={lk.soon ? 0.16 : 0} stroke={lk.soon ? "#fffaf0" : "none"} strokeOpacity={0.9} strokeWidth={5} strokeLinecap="round" strokeDasharray="0.1 13" pointerEvents="all" />
      );
    } else {
      // ONE gradient carries the colour (deep at the heart, full to its edge), a crisp surface line (the colour deepened,
      // or gold when all won for now) and the empty rest: hard stops at the area-true level, from the heart outwards, so
      // a parent reads where the colour ends (a colour that paled towards the level read as a flower far fuller than it
      // is). The stops never run backwards (SVG clamps them, and the surface line would have no width). 3–5 paths and a
      // picture a petal, no clip paths.
      const lv = lk.stage === "complete" ? 1 : RING_LEVEL[ri](lk.level);
      if (lv > 0) defs.push(<linearGradient key={c.p} id={`${uid}-f-${c.p}`} x1="0" y1="1" x2="0" y2="0">{flowerStops(col, lv, lk.caught)}</linearGradient>);
      const done = lk.stage === "complete";
      const pc = -g.len / 2 + g.w * 0.5, ps = g.w * 0.56;
      body = (
        <>
          <path d={d} data-p={c.p} aria-label={`petal ${c.p}`} fill={mix(col, "#fffaf0", lk.stage === "filling" ? 0.95 : 0.86)} fillOpacity={done ? 1 : lk.stage === "outline" ? 0.42 : 0.82} pointerEvents="visiblePainted" style={{ cursor: onPetal ? "pointer" : undefined }} />
          {lv > 0 && <path d={d} fill={`url(#${uid}-f-${c.p})`} pointerEvents="none" />}
          {done && !lk.matte && <ellipse cx={-g.w * 0.16} cy={-g.len / 2 + g.w * 0.36} rx={g.w * 0.13} ry={g.w * 0.24} fill="#fff" opacity={0.6} transform={`rotate(-18 ${-g.w * 0.16} ${-g.len / 2 + g.w * 0.36})`} pointerEvents="none" />}
          {/* OUTLINE: faint, in the petal's colour; FILLING: firm; COMPLETE: the ink outline of a finished petal */}
          <path d={d} fill="none" stroke={done ? "#2b1d14" : lk.stage === "filling" ? mix(col, "#2b1d14", 0.25) : col} strokeWidth={done ? 5 : lk.stage === "filling" ? 4.5 : 4} strokeOpacity={lk.stage === "outline" ? 0.6 : 1} pointerEvents="none" />
          {done && <path d={d} fill="none" stroke="#ffd24a" strokeWidth={3} transform="scale(.9)" pointerEvents="none" />}
          {flash === c.p && <path key={`f${c.p}`} className="wf-flash" d={d} fill="#fff6c8" stroke="#ffc53d" strokeWidth={12} pointerEvents="none" />}
          {/* the sound's picture in the round part, upright (a sound is shown as its picture) */}
          {pics && <image href={petalImg(c.p)} x={-ps / 2} y={pc - ps / 2} width={ps} height={ps} transform={`rotate(${(-a).toFixed(2)} 0 ${pc})`} opacity={lk.stage === "outline" ? 0.8 : 1} pointerEvents="none" preserveAspectRatio="xMidYMid meet" />}
        </>
      );
      // the fx layer (HTML): a sparkle at a complete petal's tip, a gold gem where a gem is ready for its battle
      const rad = ((a - 90) * Math.PI) / 180;
      if (done && !lk.matte) {
        const R = g.r0 + g.len + 4;
        fxNodes.push(<i key={`s${c.p}`} className={ri ? "big" : undefined} style={{ left: `${(50 + (Math.cos(rad) * R) / 9.6).toFixed(2)}%`, top: `${(50 + (Math.sin(rad) * R) / 9.6).toFixed(2)}%`, "--d": `${((i * 0.13) % 1).toFixed(2)}s` } as CSSProperties} />);
      }
      if ((lk.ready || ready?.has(c.p)) && !done) {
        const R = g.r0 + g.len + 2;
        fxNodes.push(<b key={`r${c.p}`} data-ready={c.p} style={{ left: `${(50 + (Math.cos(rad) * R) / 9.6).toFixed(2)}%`, top: `${(50 + (Math.sin(rad) * R) / 9.6).toFixed(2)}%` }} />);
      }
    }
    return (
      <g key={c.p} transform={tf} data-stage={lk.stage}>
        <g className={cls ? `pg ${cls}` : "pg"}>{body}</g>
      </g>
    );
  };
  /** A sound hiding in this land (WorldVisit's hint): a white shimmer in the petal's place, on its own layer. */
  const shimmer = (c: ChartPetal, i: number, ri: number) => {
    const { g, a, d } = place(c, i, ri);
    return (
      <g key={c.p} transform={`rotate(${a}) translate(0 ${-(g.r0 + g.len / 2)})`}>
        <path d={d} fill="#fff" fillOpacity={0.3} stroke="#fff" strokeWidth={7} strokeDasharray="16 12" />
      </g>
    );
  };

  // The drawing order: the halo; the outer ring, then the inner (each: the missing petals, the rest, then the complete
  // ones in one glowing group); the heart; a blooming petal over everything. A hint's shimmer ends its SVG layer and
  // gets an HTML layer of its own (its opacity pulses on the compositor), so the petals drawn after it still cover it.
  const layers: { pulse?: boolean; nodes: React.ReactNode[] }[] = [{ nodes: [] }];
  const top = () => layers[layers.length - 1].nodes;
  top().push(<circle key="halo" r={300 + 170 * W} fill={`url(#${uid}-halo)`} opacity={0.35 + 0.65 * W} pointerEvents="none" />);
  for (const ri of [1, 0]) {
    const ring = FLOWER_RINGS[ri];
    const lit: React.ReactNode[] = [];
    const stageOf = (c: ChartPetal) => looks.get(c.p)!;
    ring.forEach((c, i) => {
      if (c.p === bloom || stageOf(c).stage !== "missing") return;
      top().push(petal(c, i, ri));
      if (hint?.has(c.p)) layers.push({ pulse: true, nodes: [shimmer(c, i, ri)] }, { nodes: [] });
    });
    ring.forEach((c, i) => {
      const lk = stageOf(c);
      if (c.p === bloom || lk.stage === "missing") return;
      if (lk.stage === "complete" && !lk.matte) lit.push(petal(c, i, ri));
      else top().push(petal(c, i, ri));
    });
    // the ring's complete petals glow together (one static filter, painted once)
    if (lit.length) top().push(<g key={`lit${ri}`} filter={`url(#${uid}-glow)`}>{lit}</g>);
  }
  // the golden heart, with NO NUMBER (SCROLL_DESIGN §3.5: a count in the heart is the first thing a parent reads, and
  // "30 of 44" read as 68 % done where the colour says 42 %). Its 28 stamens are a gauge round it: the first
  // round(28 × whole), clockwise from the top, gold and bigger, the rest small and grey-brown. (`count` still draws a
  // number for a caller that passes one; Tree doesn't.)
  // (the stamens are two paths, the lit ones and the rest: 28 circles each would be 26 more nodes on the flower)
  const N = 28, on = Math.round(N * W);
  const dots = (from: number, to: number, r: number) =>
    Array.from({ length: Math.max(0, to - from) }, (_, j) => {
      const t = ((from + j) / N) * Math.PI * 2, x = Math.sin(t) * (HEART + 11), y = -Math.cos(t) * (HEART + 11);
      return `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
    }).join("");
  top().push(
    <g key="heart" pointerEvents="none">
      {on < N && <path d={dots(on, N, 6)} fill="#9a8c79" stroke="#2b1d14" strokeWidth={2.5} />}
      {on > 0 && <path d={dots(0, on, 8.5)} fill="#ffcf2e" stroke="#2b1d14" strokeWidth={2.5} />}
      <circle r={HEART} fill={`url(#${uid}-heart)`} stroke="#2b1d14" strokeWidth={6} />
      <ellipse cx={-30} cy={-38} rx={34} ry={20} fill="#fff" opacity={0.45} transform="rotate(-25 -30 -38)" />
      {count && (
        <>
          <text y={16} textAnchor="middle" fontFamily="Luckiest Guy, sans-serif" fontSize={86} fill="#fff" stroke="#2b1d14" strokeWidth={9} paintOrder="stroke">{count[0]}</text>
          <text y={60} textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight={800} fontSize={30} fill="#2b1d14">of {count[1]}</text>
        </>
      )}
    </g>,
  );
  // a blooming petal, over the heart and every other petal
  if (bloom) [0, 1].forEach((ri) => FLOWER_RINGS[ri].forEach((c, i) => c.p === bloom && top().push(<g key="bloom" filter={`url(#${uid}-glow)`}>{petal(c, i, ri)}</g>)));
  if (!top().length) layers.pop();

  const layer = { position: "absolute", inset: 0, overflow: "visible", zIndex: 1, pointerEvents: "none" } as const;
  return (
    <div ref={boxRef} role={onPetal ? "button" : "img"} aria-label={label} onPointerDown={onPetal ? pick : undefined} className="wf-box-in" style={{ position: "relative", width: "100%", height: "100%", touchAction: onPetal ? "none" : undefined, "--star": STAR, "--gold-gem": GOLD_GEM } as CSSProperties}>
      {stem && (
        // the painted stem (assets-src/world-flower/world_flower_stem.png): its calyx sits under the bloom's centre
        <img src={img("world_flower_stem")} alt="" style={{ position: "absolute", left: "18.96%", top: "40.2%", width: "95.6%", zIndex: 0, pointerEvents: "none" }} />
      )}
      {layers.map((ly, n) =>
        ly.pulse ? (
          <div key={n} className="wf-layer wf-pulse hint" aria-hidden="true">
            <svg viewBox="-480 -480 960 960" width="100%" height="100%" style={layer}>{ly.nodes}</svg>
          </div>
        ) : (
          <svg key={n} ref={n === 0 ? svgRef : undefined} viewBox="-480 -480 960 960" width="100%" height="100%" style={layer}>
            {n === 0 && (
              <defs>
                <radialGradient id={`${uid}-heart`} cx="40%" cy="35%" r="70%">
                  <stop offset="0" stopColor="#fff6c8" />
                  <stop offset=".55" stopColor="#ffc53d" />
                  <stop offset="1" stopColor="#e08a12" />
                </radialGradient>
                <radialGradient id={`${uid}-halo`}>
                  <stop offset="0" stopColor="#fff6c8" stopOpacity=".9" />
                  <stop offset=".5" stopColor="#ffe7a0" stopOpacity=".35" />
                  <stop offset="1" stopColor="#ffd970" stopOpacity="0" />
                </radialGradient>
                <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
                  <feColorMatrix in="b" type="matrix" values="1 0 0 0 .08  0 1 0 0 .06  0 0 1 0 0  0 0 0 .75 0" result="bb" />
                  <feMerge>
                    <feMergeNode in="bb" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {defs}
              </defs>
            )}
            {ly.nodes}
          </svg>
        ),
      )}
      {/* the sparkles on complete petals and the ready gems: twinkle / hop a few times on arrival, then rest */}
      {fxNodes.length > 0 && (
        <div key={`fx${arrive}`} className="wf-fx arrive" aria-hidden="true">
          {fxNodes}
        </div>
      )}
    </div>
  );
});

// ---------------------------------------------------------------- the petal chart (the school's sheets: SCROLL_DESIGN §3.4)
const met = isMet;
/** Andika's width of a text at `px`: measured once per text at 100 px and scaled (a canvas measures text linearly),
 *  so fitting a column costs one measurement per spelling, not one per size tried (the fit is pure: it takes this). */
const widths = new Map<string, number>();
let measureCtx: CanvasRenderingContext2D | null | undefined;
const textW = (s: string, px: number) => {
  let w = widths.get(s);
  if (w === undefined) {
    measureCtx ??= typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
    if (!measureCtx) return s.length * px * 0.5;
    measureCtx.font = "400 100px Andika";
    w = measureCtx.measureText(s).width / 100;
    widths.set(s, w);
  }
  return w * px;
};
/** The fit waits for Andika (SCROLL_DESIGN §7.3): a new generation once it has loaded, so the letters are refitted. */
let fontGen = 0;
function useLettersFont(): number {
  const ok = () => {
    try {
      return document.fonts.check("400 50px Andika");
    } catch {
      return true;
    }
  };
  const [gen, setGen] = useState(() => (ok() ? fontGen : -1));
  useEffect(() => {
    if (gen >= 0) return;
    let live = true;
    void document.fonts
      .load("400 50px Andika")
      .catch(() => undefined)
      .then(() => {
        widths.clear();
        fontGen++;
        if (live) setGen(fontGen);
      });
    return () => void (live = false);
  }, []);
  return gen;
}
/** A petal's layout on the chart (or the card), memoised per its lines' looks and the font. */
const layoutCache = new Map<string, ReturnType<typeof layoutVars>>();
function layoutOf(lines: Line[], card: boolean, gen: number) {
  const key = `${card ? "B" : "S"}${gen}|${lines.map(lineSig).join(",")}`;
  let l = layoutCache.get(key);
  if (!l) {
    l = card ? layoutVars(lines, BIG_DROP, CARD_FIT, textW, "B") : layoutVars(lines, PETAL_DROP, SHEET_FIT, textW);
    if (layoutCache.size > 400) layoutCache.clear();
    layoutCache.set(key, l);
  }
  return l;
}
/** The snapped colour level of a petal (0..1 from the top), for its look and lines. */
function levelOf(look: PetalLook, lines: Line[], boxes: [number, number][], card: boolean, area = look.level) {
  if (look.stage === "complete") return 1;
  if (area <= 0) return 0;
  return card ? snapLevel(BIG_LEVEL(area), boxes, CHART.big.h, lines) : snapLevel(PETAL_LEVEL(area), boxes, CHART.petal.h, lines);
}
/** a spelling with a descender (g j p q y): its sound line drops below the tail (SCROLL_DESIGN §3.3) */
const DESC = /[gjpqy]/;
const markClass = (lk: GemLook) => (lk.mark === "won" ? "w" : lk.mark === "mastered" ? "w mx" : lk.mark === "ready" ? "r" : lk.mark === "fill" ? "c" : "n");
/** One line of a petal's column: a hint word, a pencil spelling (still to find) or a met one with its gem meter. */
function LineEl({ p, ln, i, big, sel, focus, extra, energy }: { p: PhonemeId; ln: Line; i: number; big?: boolean; sel?: boolean; focus?: boolean; extra?: string; energy?: number }) {
  const lk = ln.look;
  const style = { "--d": `${i * 90}ms`, "--e": (energy ?? lk?.e ?? 0).toFixed(2), "--pol": (lk?.polish ?? 0).toFixed(2), ...(ln.line ? { "--ms": soundLineImage(ln.line) } : {}) } as CSSProperties;
  if (ln.hint) {
    const [a, b, c] = HINT[p]!;
    return (
      <span className="pc-ln hint" style={style}>
        “{a}
        <b>{b}</b>
        {c}”
      </span>
    );
  }
  const ms = ln.line ? (DESC.test(ln.g) ? " ms dsc" : " ms") : "";
  const bigAttrs = big ? { "data-key": ln.key, "data-st": lk?.mark === "none" ? "hidden" : lk?.mark, "aria-label": `gem ${ln.g} ${lk?.mark === "none" ? "hidden" : lk?.mark}` } : {};
  if (!lk || lk.mark === "none")
    return (
      <span className={`pc-ln f${ms}${sel ? " sel" : ""}`} style={style} {...bigAttrs}>
        {ln.g}
      </span>
    );
  return (
    <span className={`pc-ln m ${markClass(lk)}${lk.dusty ? " dust" : ""}${ms}${sel ? " sel" : ""}${focus ? " focus" : ""}${extra ? ` ${extra}` : ""}`} data-gem-chip={ln.key} style={style} {...bigAttrs}>
      {ln.g}
    </span>
  );
}

interface ChartPetalProps {
  p: PhonemeId;
  /** the memo key: everything below, as text */
  sig: string;
  look: PetalLook;
  lines: Line[];
  gen: number;
  focus?: string | null;
  /** "unlock": the sound was just met (it comes back as a faint outline); "ink": a spelling just met is inked in */
  reveal?: "unlock" | "ink" | null;
  inked?: string[];
  /** a gem landing here: its meter waits, then lands */
  pending?: string | null;
  landed?: string | null;
  /** the practised beat: this gem's meter shows this charge (then fills to the real one) */
  energy?: Record<string, number>;
  /** the gems whose meters fill on this visit (they keep the `--e` transition after the shown charge has cleared) */
  filling?: Set<string>;
  /** the colour's level before (area), while it grows (`rising`) */
  riseFrom?: number | null;
  rising?: boolean;
}
/** One petal on the chart (SCROLL_DESIGN §7.5): one node when missing, 6 + its lines when met. Memoised on `sig`. */
const ChartPetal = memo(
  function ChartPetal({ p, look, lines, gen, focus, reveal, inked, pending, landed, energy, filling, riseFrom, rising }: ChartPetalProps) {
    const c = chartOf(p);
    const vars = colourVars(c.colour);
    const base = { role: "button", tabIndex: 0, "aria-label": `petal ${p}`, "data-p": p, "data-stage": look.stage };
    if (look.stage === "missing") return <div {...base} className="pc-petal mys" style={vars as CSSProperties} />;
    const { vars: lay, boxes } = layoutOf(lines, false, gen);
    const lv = levelOf(look, lines, boxes, false, riseFrom != null && !rising ? riseFrom : look.level);
    const done = look.stage === "complete";
    const inkedLook = look.stage !== "outline";
    const cls = ["pc-petal", done && "done full", look.stage === "outline" && "outl", look.caught && "caught", inkedLook && "inked", look.matte && "matte", reveal === "unlock" && "unlock"].filter(Boolean).join(" ");
    return (
      <div {...base} className={cls} style={{ ...vars, ...lay, "--lv": lv.toFixed(3) } as CSSProperties}>
        {reveal === "unlock" && <i className="pc-dots-tmp" />}
        <i className="pc-gl" />
        {inkedLook && (
          <i className={`pc-fl${rising ? " rising" : ""}`}>
            <i />
            {done && !look.matte && <b />}
          </i>
        )}
        <img className="pc-pic" src={petalImg(p)} alt="" draggable={false} decoding="async" />
        <span className="pc-col">
          {lines.map((ln, i) => (
            <LineEl key={ln.key ?? ln.g} p={p} ln={ln} i={i} focus={!!focus && ln.key === focus} energy={ln.key && energy && ln.key in energy ? energy[ln.key] : undefined}
              extra={[ln.key && inked?.includes(ln.key) && "inked", ln.key === pending && "pending", ln.key === landed && "landed", ln.key && filling?.has(ln.key) && "filling"].filter(Boolean).join(" ")} />
          ))}
        </span>
      </div>
    );
  },
  (a, b) => a.sig === b.sig,
);

/** The grown-ups' key, in sheet 3's empty last row (SCROLL_DESIGN §3.4.5; the mockup's keyHTML). */
const ChartKey = memo(function ChartKey() {
  const k = chartColours(chartOf("ae").colour);
  const { w: PW, h: PH } = CHART.petal;
  const petal = (id: number, f: number, o: { dots?: boolean; faint?: boolean; caught?: boolean; full?: boolean } = {}) => {
    const lv = f >= 1 ? 1 : PETAL_LEVEL(f), y1 = PH * lv;
    return (
      <svg className="kp" viewBox={`-12 -12 ${PW + 24} ${PH + 40}`}>
        {f > 0 && (
          <>
            <clipPath id={`kp${id}`}>
              <rect x={0} y={0} width={PW} height={y1} />
            </clipPath>
            <path d={PETAL_DROP.d} fill={k.w0} clipPath={`url(#kp${id})`} />
          </>
        )}
        {f > 0 && f < 1 && <rect x={6} y={y1 - (o.caught ? 6 : 4)} width={PW - 12} height={o.caught ? 12 : 8} fill={o.caught ? "#ffc53d" : k.surf} />}
        <path d={PETAL_DROP.d} fill="none" stroke={o.dots ? k.ghost : k.c} strokeWidth={o.full ? 16 : 11} strokeDasharray={o.dots ? "0.01 30" : undefined} strokeLinecap={o.dots ? "round" : undefined} strokeOpacity={o.faint ? 0.5 : undefined} />
        {o.full && <path transform={`translate(44 ${PH - 26}) scale(1.2)`} d={STAR_D} fill="#ffc53d" stroke="#2b1d14" strokeWidth={3} />}
      </svg>
    );
  };
  // the key's gems are the meter's four looks (§3.2), in /ae/'s red: pencil glass, its pavilion filling, the gold gem on
  // its disc with rays (the chart's own ready mark), and the solid ink jewel (a glint; the sparkle when mastered; specks
  // when dusty)
  const gem = (e: number, look = "") => {
    if (look === "ready") return <i className="kg kr" />;
    const won = look === "won" || look === "mastered" || look === "dust";
    // a charge: the pavilion (below the girdle at y 12) coloured from the point (y 34) to .056 + .611 × √e of the height
    const y = 36 - 36 * (0.056 + 0.611 * Math.sqrt(e)), hw = (18 * (34 - y)) / 22;
    return (
      <svg className="kg" viewBox="-6 -8 52 50">
        {won ? (
          <>
            <path d={GEM_D} fill={k.cj} />
            <path d="M2 12h36l-18 22z" fill={k.jdeep} fillOpacity={0.45} />
          </>
        ) : (
          <>
            <path d={GEM_D} fill="#f2ede5" />
            {e > 0 && <path d={`M20 34L${(20 - hw).toFixed(1)} ${y.toFixed(1)}H${(20 + hw).toFixed(1)}z`} fill={k.cj} />}
          </>
        )}
        {look === "won" && <ellipse cx={13.6} cy={10.8} rx={4} ry={3.6} fill="#fff" fillOpacity={0.9} />}
        {look === "mastered" && <path d="M14 1.5c.9 4.6 2.4 6.1 7 7-4.6.9-6.1 2.4-7 7-.9-4.6-2.4-6.1-7-7 4.6-.9 6.1-2.4 7-7z" fill="#fff" />}
        {look === "dust" && <path d="M9 6.1a1.9 1.9 0 1 1 0 3.8a1.9 1.9 0 1 1 0-3.8M24 9a2 2 0 1 1 0 4a2 2 0 1 1 0-4M13 13.4a1.6 1.6 0 1 1 0 3.2a1.6 1.6 0 1 1 0-3.2M31 5.6a1.4 1.4 0 1 1 0 2.8a1.4 1.4 0 1 1 0-2.8M21 17.5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 1 1 0-3" fill="#9a9086" stroke="#6f655b" strokeWidth={0.5} />}
        <path d={`${GEM_D}M2 12h36M10 2l4 10 6 22 6-22 4-10`} fill="none" stroke={won ? "#2b1d14" : "#a1968a"} strokeWidth={3} strokeLinejoin="round" />
      </svg>
    );
  };
  const seg = (sure: boolean) => <i className="ks" style={{ background: sure ? "linear-gradient(90deg,#f5821f 0 48%,transparent 0 52%,#e8312f 0)" : "repeating-linear-gradient(90deg,rgba(245,130,31,.55) 0 5px,transparent 5px 8px)" }} />;
  return (
    <div className="pc-key" aria-label="For grown-ups: what the chart shows">
      <b className="kt">For grown-ups.</b> A petal: <span>{petal(1, 0, { dots: true })} not met yet</span> <span>{petal(2, 0, { faint: true })} met</span> <span>{petal(3, 0.3)} filling</span>{" "}
      <span>{petal(4, 0.3, { caught: true })} all won for now</span> <span>{petal(6, 1, { full: true })} complete</span>
      <br />
      The colour is the whole chart column: every way to spell the sound. <b className="kl">ai</b> met, <b className="kl" style={{ color: "#9a8f84" }}>ea</b> still to find.
      <br />
      A gem: <span>{gem(0)} met</span> <span>{gem(0.75)} filling with practice</span> <span>{gem(1, "ready")} ready for its gem battle</span> <span>{gem(1, "won")} won</span>{" "}
      <span>{gem(1, "mastered")} mastered</span> <span>{gem(1, "dust")} dusty</span>
      <br />
      <span>
        {seg(false)}
        {seg(true)}
      </span>{" "}
      a spelling that represents more than one sound: faint until the child is sure which, then solid
    </div>
  );
});

/** Where the chart is: six dots in three pairs (a pair per sheet), the current one a pill. Tap or drag to jump. */
function PageDots({ go, dotsRef }: { go: (half: number) => void; dotsRef: React.RefObject<HTMLDivElement | null> }) {
  const at = CHART.dots.at;
  // the nearest dot where it is drawn: the current one is a pill (40 tall) and the ones after it sit 24 lower to make
  // room for it (setCurrent), so a tap on the fifth dot from the top half-sheet lands on the fifth, not the sixth (the
  // sweep's tree-chart page dot 4, 27 Sep)
  const hit = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget;
    const r = box.getBoundingClientRect();
    const y = ((e.clientY - r.top) / r.height) * CHART.dots.h;
    const cur = [...box.children].findIndex((d) => d.classList.contains("on"));
    const centre = (i: number) => at[i] + 20 + (i === cur ? 20 : 8) + (cur >= 0 && i > cur ? 24 : 0);
    let best = 0;
    at.forEach((_, i) => {
      if (Math.abs(y - centre(i)) < Math.abs(y - centre(best))) best = i;
    });
    return best;
  };
  const last = useRef(-1);
  return (
    <div
      ref={dotsRef}
      className="pc-dots"
      role="navigation"
      aria-label="Chart pages"
      onPointerDown={(e) => {
        if (e.button > 0) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        last.current = hit(e);
        go(last.current);
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
        const i = hit(e);
        if (i !== last.current) go((last.current = i));
      }}
    >
      {at.map((y, i) => (
        <i key={i} data-i={i} style={{ top: y + 20 }} />
      ))}
    </div>
  );
}

const SHEET_PETALS = [1, 2, 3].map((n) => CHART_PETALS.filter((c) => c.page === n).map((c) => c.p));
const NO_LINES: Line[] = [];
const NO_MULTI: MultiSound[] = [];
// Warm the progress model's slow first call (the Sounds~Write unit that first teaches each spelling walks the whole
// programme) in idle moments after start-up, a few spellings at a time, so the World Flower opens without it.
if (typeof window !== "undefined" && typeof requestIdleCallback === "function") {
  const keys = PETALS.flatMap((pt) => pt.gems.map((g) => g.key));
  let i = 0;
  const work = (d: IdleDeadline) => {
    while (i < keys.length && (d.didTimeout ? i % 8 !== 7 : d.timeRemaining() > 4)) swUnitOf(keys[i++]);
    if (i < keys.length) requestIdleCallback(work, { timeout: 4000 });
  };
  setTimeout(() => requestIdleCallback(work, { timeout: 4000 }), 3000);
}
const P = CHART.page;

/**
 * The petal chart (SCROLL_DESIGN §3.4, §4, §7.5): the school's two laminated sheets and a third for the sounds they
 * leave out, half a sheet per screen, swiped up and down (native scrolling with mandatory snap: one swipe, one
 * half-sheet), with page dots to jump. It opens, before its first paint, on the half-sheet with the thing to do next.
 * Nothing moves by itself. A tap counts only if the sheet didn't move (the tap guard). Every petal is drawn by its look;
 * nothing on it runs for ever (the ready gems hop three times as their half-sheet arrives).
 */
function PetalChart({ looks, progressOf, multi, onOpen, focus, at, energyShow, riseFrom, reveal, landing, onLanded, helpKey }: {
  looks: Map<PhonemeId, PetalLook>;
  /** a petal's progress (memoised per save): the chart asks only for the petals it draws */
  progressOf: (p: PhonemeId) => PetalProgress;
  multi: MultiSound[];
  onOpen: (pt: Petal, from: HTMLElement) => void;
  /** a trip's gem (?gem=, focusGem()): land there, ring it */
  focus?: string | null;
  /** a gem to open the chart on, without a ring (a trip's spelling, a practice) */
  at?: string | null;
  /** the practised beat: this gem's meter shows this charge first, then fills */
  energyShow?: Record<string, number>;
  /** petal → the colour's level before (area): it grows once the meter has filled (practice) or the gem has landed */
  riseFrom?: Record<string, number>;
  /** spellings just met (after their trip): a new sound's petal unlocks, a new spelling is inked in */
  reveal?: string[];
  /** a gem just won (its petal not complete): it flies in and lands beside its spelling, then onLanded() */
  landing?: string | null;
  onLanded?: () => void;
  /** each change: Help was pressed (the ready gems on the half-sheet hop again) */
  helpKey?: number;
}) {
  const gen = useLettersFont();
  const ref = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;
  const petalOfKey = (k?: string | null) => (k ? PETALS.find((pt) => pt.gems.some((g) => g.key === k))?.p ?? null : null);
  // a petal's lines, worked out when it is first drawn (the progress model and the fit are the entry's cost)
  const lines = useMemo(() => {
    const m = new Map<PhonemeId, Line[]>();
    return (p: PhonemeId) => m.get(p) ?? (m.set(p, linesOf(progressOf(p), multi)), m.get(p)!);
  }, [progressOf, multi]);
  // one-off moments, each a small state the petals it touches re-render for
  const [unlock, setUnlock] = useState<Set<PhonemeId>>(new Set());
  const [inked, setInked] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(landing ?? null);
  const [landed, setLanded] = useState<string | null>(null);
  const [rising, setRising] = useState<Set<string>>(new Set());
  const risingFrom = riseFrom ?? {};
  // the practised gem's meter fills from where it was: its line keeps the transition for the rest of the visit
  const filling = useRef(new Set<string>()).current;
  for (const k of Object.keys(energyShow ?? {})) filling.add(k);
  // the grown-ups' key (sheet 3's last row) is drawn once the child is near it
  const [keyOn, setKeyOn] = useState(false);

  // the half-sheet it opens on, before the first paint (never a smooth scroll on arrival)
  const first = useMemo(() => {
    // With nothing ready and no trip: the first petal in the chart's order that is still growing (an outline, or
    // filling), else the first one met. This is the mockup's rule and its stills' (SCROLL_DESIGN §3.4.4: 08 lands on
    // /s/'s half, 09 on sheet 2's top). It was "the last spelling taught in the levels played" until 27 Sep (the
    // verify round): that jumped to wherever the newest lesson's petal sat, a different half after every lesson, often
    // on a petal already coloured in. Chart order is the school's reading order, so the chart opens where the colour
    // still has room to grow, on the same half-sheet visit after visit until that petal is done.
    const stage = (p: PhonemeId) => looks.get(p)?.stage;
    const newest = (CHART_PETALS.find((c) => stage(c.p) === "filling" || stage(c.p) === "outline") ?? CHART_PETALS.find((c) => (stage(c.p) ?? "missing") !== "missing"))?.p ?? null;
    return landingHalf({ landing: petalOfKey(landing), focus: petalOfKey(focus ?? at), reveal: petalOfKey(reveal?.[0]), ready: (p) => !!looks.get(p)?.ready, newest });
  }, []);
  const current = useRef(-1);
  // The half-sheet's arrival (its ready gems hop, a complete petal shines) waits until the sheet has stopped moving:
  // restyling a half-sheet mid-glide cost a frame on a slow phone, and a hop is seen best on a still sheet. The key is
  // drawn then too, once the child is near sheet 3.
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arriveNow = () => {
    settle.current = null;
    const i = current.current;
    ref.current?.querySelectorAll(".pc-half").forEach((h, j) => h.classList.toggle("arrive", j === i));
    if (i >= 3) setKeyOn(true);
  };
  const arriveSoon = () => {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(arriveNow, 160);
  };
  useEffect(() => () => void (settle.current && clearTimeout(settle.current)), []);
  const setCurrent = (i: number, byChild: boolean) => {
    if (i === current.current) return;
    const firstTime = current.current < 0;
    current.current = i;
    dotsRef.current?.querySelectorAll("i").forEach((d, j) => {
      d.classList.toggle("on", j === i);
      // (the `translate` property, so the pill's own spring, a transform, stays on the compositor with it)
      (d as HTMLElement).style.translate = j > i ? "0 24px" : "";
    });
    if (firstTime) arriveNow();
    else arriveSoon();
    halfNow = i;
    const st = (window as any).__snState;
    if (st && st.scene === "tree") st.half = i;
    if (byChild && !firstTime) sfx.page();
  };
  useLayoutEffect(() => {
    const el = ref.current!;
    el.scrollTop = first * P;
    setCurrent(first, false);
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setCurrent(Number((e.target as HTMLElement).dataset.half), true)), { root: el, threshold: 0.6 });
    el.querySelectorAll(".pc-half").forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, []);
  // Help: the ready gems on the half-sheet on screen hop again
  useEffect(() => {
    if (!helpKey) return;
    const h = ref.current?.querySelectorAll(".pc-half")[current.current];
    if (!h) return;
    h.classList.remove("arrive");
    void (h as HTMLElement).offsetWidth;
    h.classList.add("arrive");
  }, [helpKey]);
  // One swipe, one half-sheet (SCROLL_DESIGN §4.1). scroll-snap-stop: always should hold every fling at the next
  // half-sheet, but Chromium lets a hard fling run past it (a bare snap page does the same; the finger has carried the
  // sheet most of the way when the fling starts): 330 px in 90 ms turned two half-sheets (verify round 2, and the
  // mockup). So while a finger is on the sheet, only the half-sheet the swipe begins on and its two neighbours are snap
  // points (.swipe, tree-chart.css): the fling is planned against them, and a hard one lands on the neighbour with the
  // engine's own ease, overshooting a little and settling back. Stopping a fling from script instead (a scrollTop
  // write, a smooth scrollTo, overflow hidden for a frame) fought the compositor's fling in Chromium: it jumped back,
  // resumed at the next touch, or swallowed the next swipe (playtest/runs/fix/B2/v2/snaprepro). A few class changes per
  // touch, nothing per frame. The dots and the mouse drag clear it first: they may cross half-sheets.
  const halves = () => ref.current?.querySelectorAll<HTMLElement>(".pc-half") ?? [];
  const swipeFrom = (sc: HTMLElement) => {
    const from = Math.round(sc.scrollTop / P);
    halves().forEach((h, i) => h.classList.toggle("snap", Math.abs(i - from) <= 1));
    sc.classList.add("swipe");
  };
  const swipeEnd = () => ref.current?.classList.remove("swipe");
  // (and once the sheet has been still for 300 ms after a swipe, every half-sheet is a snap point again)
  const swipeRest = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (swipeRest.current && clearTimeout(swipeRest.current)), []);
  const go = (half: number) => {
    swipeEnd();
    ref.current?.scrollTo({ top: half * P, behavior: "smooth" });
  };

  // the tap guard: a tap counts only if the sheet moved no more than 6 px and no scroll came in the last 90 ms
  const down = useRef({ top: 0, at: 0, x: 0, y: 0, live: false });
  const lastScroll = useRef(0);
  const drag = useRef<{ y: number; top: number } | null>(null);
  const tap = (target: EventTarget, keyboard = false) => {
    const el = (target as Element).closest?.(".pc-petal") as HTMLElement | null;
    const sc = ref.current;
    if (!el || !sc) return;
    // (a tap that stops a gliding sheet opens nothing: the sheet moved, or it scrolled in the last 90 ms)
    if (!keyboard && (Math.abs(sc.scrollTop - down.current.top) > 6 || performance.now() - lastScroll.current < 90)) return;
    const p = el.dataset.p as PhonemeId;
    if (looks.get(p)?.stage === "missing") {
      // a sound not met yet: a small shake, and it stays a secret
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
      sfx.petal();
      void say({ line: "petal_secret" });
      return;
    }
    sfx.petal();
    void say({ sound: p, show: "petal" });
    openRef.current(petalOf(p), el);
  };

  // the reveal: spellings just met, in the chart's order, 400 ms apart: a new sound unlocks, a new spelling inks in
  useEffect(() => {
    if (!reveal?.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // (real time, not game time: the unlock's steps are CSS delays, and its sounds go with them)
    const at = (ms: number, f: () => void) => timers.push(setTimeout(f, ms));
    const order = [...reveal].sort((a, b) => CHART_PETALS.findIndex((c) => c.p === petalOfKey(a)) - CHART_PETALS.findIndex((c) => c.p === petalOfKey(b)));
    const newSound = (k: string) => {
      const p = petalOfKey(k)!;
      const pr = progressOf(p);
      return !!pr && pr.spellings.every((sp) => sp.stage === "unseen" || reveal.includes(sp.key));
    };
    const doneP = new Set<PhonemeId>();
    let t = 0;
    for (const k of order) {
      const p = petalOfKey(k);
      if (!p || looks.get(p)?.stage === "missing") continue;
      if (newSound(k)) {
        if (doneP.has(p)) continue;
        doneP.add(p);
        const t0 = t;
        at(t0, () => setUnlock((s) => new Set(s).add(p)));
        at(t0 + 700, () => sfx.petal());
        at(t0 + 1800, () => sfx.twinkle());
        at(t0 + 2400, () => void sayIf("petal_outline"));
        at(t0 + 3500, () => setUnlock((s) => ((s = new Set(s)), s.delete(p), s)));
      } else {
        at(t, () => {
          setInked((l) => [...l, k]);
          sfx.tink();
          const line = ref.current?.querySelector(`[data-gem-chip="${CSS.escape(k)}"]`);
          if (line) {
            const r = stageRect(line);
            fx.burst(r.x + r.w / 2, r.y + r.h / 2, "sparks", 10, 0.8);
          }
        });
      }
      t += 400;
    }
    return () => timers.forEach(clearTimeout);
  }, [reveal?.join()]);

  // the practised beat: when the meter has filled (the energy shown has cleared), the petal's colour grows
  const shown = energyShow && Object.keys(energyShow).length > 0;
  useEffect(() => {
    if (shown || !riseFrom || landing) return;
    const keys = Object.keys(riseFrom);
    if (!keys.length) return;
    const t = setTimeout(() => {
      setRising(new Set(keys));
      sfx.magic();
    }, 1400 / FAST);
    return () => clearTimeout(t);
  }, [shown, riseFrom]);

  // the landing (a gem won, its petal not complete): the jewel flies in from where the victory left it and lands
  const flyer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!landing) return;
    const p = petalOfKey(landing)!;
    let live = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms / FAST)));
    (async () => {
      await wait(700);
      const line = ref.current?.querySelector(`[data-gem-chip="${CSS.escape(landing)}"]`) as HTMLElement | null;
      const f = flyer.current;
      if (!live || !line || !f) return onLanded?.();
      const M = parseFloat(getComputedStyle(line).fontSize) || 40;
      const r = stageRect(line);
      const to = { x: r.x + r.w + M * 0.36, y: r.y + r.h / 2 - M * 0.06 };
      const from = { x: 640, y: 380 }, peak = { x: from.x + (to.x - from.x) * 0.45, y: Math.min(from.y, to.y) - 120 }, k = (gemW(M) * 1) / 110;
      f.style.display = "block";
      const anim = f.animate(
        [
          { transform: `translate(${from.x}px,${from.y}px) scale(.4) rotate(-20deg)`, opacity: 0 },
          { transform: `translate(${from.x}px,${from.y - 20}px) scale(1.5) rotate(0deg)`, opacity: 1, offset: 0.22 },
          { transform: `translate(${peak.x}px,${peak.y}px) scale(1.15) rotate(160deg)`, opacity: 1, offset: 0.6 },
          { transform: `translate(${to.x}px,${to.y}px) scale(${k}) rotate(360deg)`, opacity: 1 },
        ],
        { duration: 1300 / FAST, easing: "cubic-bezier(.4,0,.3,1)", fill: "forwards" },
      );
      const trail = fx.trail(petalColour(p), { every: 60, size: 10 });
      const tick = () => {
        if (!live || anim.playState !== "running") return;
        const m = new DOMMatrix(getComputedStyle(f).transform);
        trail({ x: m.e, y: m.f });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      await anim.finished.catch(() => undefined);
      if (!live) return;
      f.style.display = "none";
      setPending(null);
      setLanded(landing);
      fx.ring(to.x, to.y, { color: mix(petalColour(p), "#2b1d14", 0.15), r0: 16, r1: 150, width: 12, life: 26 });
      fx.ring(to.x, to.y, { color: "#ffd24a", r0: 12, r1: 100, width: 10, life: 22 });
      fx.burst(to.x, to.y, "sparks", 16, 1.1);
      sfx.great();
      sfx.sparkle();
      await wait(200);
      if (!live) return;
      setRising(new Set([p]));
      sfx.magic();
      await wait(1700);
      if (live) onLanded?.();
    })();
    return () => {
      live = false;
      timers.forEach(clearTimeout);
    };
  }, [landing]);

  // The first frame draws the half-sheet the chart opens on; the rest follow in a transition, which React renders in
  // short slices, so opening the chart is never one long task (SCROLL_DESIGN §6, PERF fix 9). Off-screen halves skip
  // their layout and paint (content-visibility: auto).
  const [allDrawn, setAllDrawn] = useState(false);
  useEffect(() => startTransition(() => setAllDrawn(true)), []);
  // Then, in idle moments at rest, each half-sheet is laid out and painted once, nearest first (`.near` lifts its
  // content-visibility), so a swipe never has to draw a half-sheet as it comes on screen: that cost a 35–50 ms frame
  // at the start of every swipe to a half-sheet not seen yet (phone ×4).
  useEffect(() => {
    if (!allDrawn) return;
    const sc = ref.current;
    if (!sc || typeof requestIdleCallback !== "function") return void sc?.querySelectorAll(".pc-half").forEach((h) => h.classList.add("near"));
    let id = 0;
    const next = () => {
      const halves = [...sc.querySelectorAll<HTMLElement>(".pc-half:not(.near)")];
      if (!halves.length) return;
      const at = Math.max(0, current.current);
      halves.sort((a, b) => Math.abs(Number(a.dataset.half) - at) - Math.abs(Number(b.dataset.half) - at))[0].classList.add("near");
      id = requestIdleCallback(next, { timeout: 3000 });
    };
    id = requestIdleCallback(next, { timeout: 3000 });
    return () => cancelIdleCallback(id);
  }, [allDrawn]);
  const drawn = (p: PhonemeId) => allDrawn || halfOf(p) === first;
  const sigOf = (p: PhonemeId) => {
    const lk = looks.get(p)!;
    if (lk.stage === "missing") return `${p}|missing`;
    if (!drawn(p)) return `${p}|later`;
    const ls = lines(p);
    const mine = (k: string) => petalOfKey(k) === p;
    return [
      p, gen, lk.stage, lk.level.toFixed(3), lk.caught, lk.matte, ls.map(lineSig).join(","), focus && mine(focus) ? focus : "", unlock.has(p) ? "U" : "",
      inked.filter(mine).join("+"), pending && mine(pending) ? `P${pending}` : "", landed && mine(landed) ? `L${landed}` : "",
      energyShow ? Object.entries(energyShow).filter(([k]) => mine(k)).map(([k, v]) => `${k}=${v}`).join("") : "", p in risingFrom ? `R${risingFrom[p]}` : "", rising.has(p) ? "r" : "",
    ].join("|");
  };
  const vars = chartMasks();
  const land = landing ? chartColours(chartOf(petalOfKey(landing) ?? "a").colour) : null;
  return (
    <div className="pc-view" style={vars as CSSProperties}>
      <div
        ref={ref}
        className="scrollable petal-scroll pc-scroller"
        onPointerDown={(e) => {
          down.current = { top: ref.current!.scrollTop, at: performance.now(), x: e.clientX, y: e.clientY, live: e.button === 0 };
          if (e.pointerType === "mouse" && e.button === 0) {
            swipeEnd();
            drag.current = { y: e.clientY, top: ref.current!.scrollTop };
            ref.current!.classList.add("dragging");
          }
        }}
        onPointerMove={(e) => {
          if (!drag.current || !e.buttons) return;
          const sc = ref.current!;
          sc.scrollTop = drag.current.top - (e.clientY - drag.current.y) / (sc.getBoundingClientRect().height / sc.clientHeight);
        }}
        onPointerUp={(e) => {
          const d = down.current;
          if (d.live && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 12) tap(e.target);
          d.live = false;
          if (!drag.current) return;
          drag.current = null;
          const sc = ref.current!;
          sc.classList.remove("dragging");
          sc.scrollTo({ top: Math.round(sc.scrollTop / P) * P, behavior: "smooth" });
        }}
        onPointerCancel={() => void (down.current.live = false)}
        onTouchStart={(e) => {
          if (e.touches.length !== 1) return;
          if (swipeRest.current) clearTimeout(swipeRest.current);
          swipeFrom(ref.current!);
        }}
        onTouchEnd={(e) => {
          // (a tap moves nothing: the rest timer starts at the lift too, and a fling's scroll events keep resetting it)
          if (e.touches.length || !ref.current!.classList.contains("swipe")) return;
          if (swipeRest.current) clearTimeout(swipeRest.current);
          swipeRest.current = setTimeout(swipeEnd, 300);
        }}
        onScroll={() => {
          lastScroll.current = performance.now();
          if (settle.current) arriveSoon();
          if (!ref.current!.classList.contains("swipe")) return;
          if (swipeRest.current) clearTimeout(swipeRest.current);
          swipeRest.current = setTimeout(swipeEnd, 300);
        }}
        // (Enter on a focused petal, or a script's element.click(): no pointer went down)
        onClick={(e) => e.detail === 0 && tap(e.target, true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && tap(e.target, true)}
      >
        <div className="pc-board">
          {SHEET_PETALS.map((ps, n) => (
            <section key={n} className="pc-sheet" data-sheet={n + 1}>
              {[0, 1].map((h) => (
                <div key={h} className={`pc-half${h ? " lo" : ""}`} data-half={n * 2 + h}>
                  {ps.slice(h * 8, h * 8 + 8).map((p) => {
                    const mine = (k?: string | null) => !!k && petalOfKey(k) === p;
                    const lk = looks.get(p)!;
                    // (a met petal off the first half-sheet: its cell, drawn a moment later)
                    if (lk.stage !== "missing" && !drawn(p)) return <div key={p} className="pc-petal pc-later" role="button" aria-label={`petal ${p}`} data-p={p} />;
                    return (
                      <ChartPetal
                        key={p}
                        p={p}
                        sig={sigOf(p)}
                        look={lk}
                        lines={lk.stage === "missing" ? NO_LINES : lines(p)}
                        gen={gen}
                        focus={mine(focus) ? focus : null}
                        reveal={unlock.has(p) ? "unlock" : null}
                        inked={inked}
                        pending={mine(pending) ? pending : null}
                        landed={mine(landed) ? landed : null}
                        energy={energyShow}
                        filling={filling}
                        riseFrom={p in risingFrom ? risingFrom[p] : null}
                        rising={rising.has(p)}
                      />
                    );
                  })}
                  {n === 2 && h === 1 && (keyOn || first >= 4) && <ChartKey />}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
      <i className="pc-edge t" />
      <i className="pc-edge b" />
      <PageDots go={go} dotsRef={dotsRef} />
      {landing && land && (
        <div ref={flyer} className="pc-flyer" style={{ display: "none", ...(colourVars(land.c) as CSSProperties) }}>
          <i />
        </div>
      )}
    </div>
  );
}

/** A spelling the child hasn't met yet: a dark crystal with a faint glint (no letters). The glint is its own HTML layer
 *  whose opacity the compositor animates (docs/PERF.md fix 9: an SVG animation repaints on the main thread every frame,
 *  and the chart has dozens of these). */
export function DarkCrystal({ size = 34 }: { size?: number }) {
  const w = size, h = size * 1.18;
  return (
    <span role="img" aria-label="a hidden gem" className="dark-crystal" style={{ width: w, height: h }}>
      <svg viewBox="0 0 34 40" width={w} height={h}>
        <polygon points="17,1 32,11 32,29 17,39 2,29 2,11" fill="#3b3450" stroke="#2b1d14" strokeWidth={2.5} strokeLinejoin="round" />
        <polygon points="17,1 32,11 17,17 2,11" fill="#5b5274" />
      </svg>
      <span className="dc-glint" style={{ animationDelay: `${(size * 7) % 3}s` }}>
        <svg viewBox="0 0 34 40" width={w} height={h}>
          <polygon points="9,8 14,5 12,13" fill="#fff" />
        </svg>
      </span>
    </span>
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

/** The view toggle's pictures (the mockup's): a mini chart (on the flower) and a mini flower (on the chart). */
const ChartIcon = () => (
  <svg viewBox="-60 -60 120 120">
    <rect x={-40} y={-46} width={80} height={92} rx={10} fill="#fffdf8" stroke="#2b1d14" strokeWidth={5} />
    {([[-20, -18, "#e8312f"], [0, -18, "#f5821f"], [20, -18, "#f3c74a"], [-20, 20, "#2fa65a"], [0, 20, "#4a7dff"], [20, 20, "#8a3be0"]] as const).map(([x, y, c]) => (
      <path key={c} d={`M${x},${y + 16} C${x - 2},${y + 8} ${x - 8},${y} ${x - 8},${y - 6} A8,8 0 0 1 ${x + 8},${y - 6} C${x + 8},${y} ${x + 2},${y + 8} ${x},${y + 16} Z`} fill="none" stroke={c} strokeWidth={4} />
    ))}
  </svg>
);
const MiniFlowerIcon = () => (
  <svg viewBox="-60 -60 120 120">
    {["#e8312f", "#f7a23b", "#f3c74a", "#2fa65a", "#2ec4b6", "#4a7dff", "#8a3be0", "#f0226b"].map((c, i) => (
      <path key={c} d="M0,20 C-2.88,11.2 -12,2.4 -12,-8 A12,12 0 0 1 12,-8 C12,2.4 2.88,11.2 0,20 Z" transform={`rotate(${i * 45}) translate(0 -34)`} fill={c} stroke="#2b1d14" strokeWidth={4} />
    ))}
    <circle r={17} fill="#ffc53d" stroke="#2b1d14" strokeWidth={5} />
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
/** Where a big petal's picture sits (SOUND_DISPLAY r54, r57): on the round top's right shoulder, like the chart's
 *  petals, 30 % of the petal's width, standing out past the outline with about 15 % of it over the outline. Stage px
 *  from the petal's top-left: its box and centre (the height doesn't matter: the round top is w wide). */
export function bigPetalPic(w: number) {
  const size = w * 0.3;
  const r = (w - 14) / 2, cx = w / 2, cy = 7 + r; // the round top (teardropAt(w − 14, h − 14) centred in the box)
  const k = Math.SQRT1_2, out = size * 0.35; // the shoulder, 45° up and right; the picture's centre 35 % of it outside
  const x = cx + k * (r + out), y = cy - k * (r + out);
  return { left: x - size / 2, top: y - size / 2, size, x, y };
}

/**
 * One petal, big: the teardrop in its chart colour, filling from the point as its gems are won, its picture on the
 * shoulder, and every spelling as a gem in its round top. Used by the gem victory (Tree), the new-gem trip and the land
 * trip (Intros). It is the sound's petal: a tap says the sound (a nod and a tink while Sensei is talking: never cut her
 * off), and it swells whenever its sound is said, from anywhere (SOUND_DISPLAY §4.3). `data-p` and `data-petal` let the
 * nav row hide its duplicate (F3.7).
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
  const pic = bigPetalPic(w);
  const root = useRef<HTMLDivElement>(null);
  // the petal swells as its sound is said ("This is the way we spell /ae/…"): the compositor scales it, no re-render
  useEffect(
    () =>
      onClip((id) => {
        if (id !== `sound:${p}` || mist) return;
        root.current?.animate([{ scale: "1" }, { scale: "1.07", offset: 0.3 }, { scale: "1" }], { duration: 650, easing: "cubic-bezier(.3,1.4,.5,1)" });
      }),
    [p, mist],
  );
  const tap = (e: React.PointerEvent) => {
    if (e.button > 0 || mist) return;
    e.stopPropagation();
    if (isSpeaking()) {
      // Sensei is explaining: the petal nods, and she carries on
      sfx.tink();
      root.current?.animate([{ rotate: "0deg" }, { rotate: "-4deg", offset: 0.3 }, { rotate: "3deg", offset: 0.65 }, { rotate: "0deg" }], { duration: 420 });
      return;
    }
    sfx.petal();
    void say({ sound: p, show: "petal" });
  };
  return (
    <div
      ref={root}
      className={`big-petal ${done ? "done" : ""} ${className}`}
      data-petal={p}
      data-p={mist ? undefined : p}
      role={mist ? undefined : "button"}
      aria-label={mist ? undefined : "Hear the sound"}
      title={mist ? undefined : `/${p}/`}
      onPointerDown={mist ? undefined : tap}
      style={{ width: w, height: h, "--petal": col, cursor: mist ? undefined : "pointer", ...style } as CSSProperties}
    >
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
        <div className="bp-gems" style={{ left: w * 0.13, right: w * 0.13, top: h * 0.1, height: h * 0.54 }}>
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
        {/* a sound not met yet: ink mist over the whole petal, which clears when it is found (its "?" pulses only while
            the mist is there) */}
        <div className={`bp-mist ${mist ? "on" : ""}`} style={{ clipPath: `path("${d}")`, opacity: mist ? 1 : 0 }}>
          <span>?</span>
        </div>
        {/* the sound's picture on the shoulder (a sound is shown as its picture, next to its petal: SOUND_DISPLAY r54) */}
        <img className="bp-pic" src={img(`petal_${p}`)} alt="" draggable={false} style={{ left: pic.left, top: pic.top, width: pic.size, height: pic.size, opacity: mist ? 0 : 1 }} onError={(e) => (e.currentTarget.style.display = "none")} />
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
      // the flower it flies home to (SCROLL_DESIGN §5.4): every petal as it is now; this one as it was, until it lands,
      // then its colour grows from where it was
      looksAfter: petalLooks(flowerOverview(after)),
      lookBefore: petalLook(flowerOverview(before).petals.find((x) => x.p === pt.p)!),
      wholeBefore: petalProgress(before, pt.p).whole,
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
      fx.rain("blossoms", 46);
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
            // every sound is home: the rainbow petals are the flower's all-the-sounds petals (Dec6)
            fx.rain("rainbow", 60);
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
      {/* (flying home it shrinks into its place on the flower: no longer a thing to tap) */}
      <div ref={petalRef} className="gv-petal" style={{ left: VP.left, top: VP.top }} aria-hidden={home !== "" || undefined} inert={home !== ""}>
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
          <WorldFlower look={(p) => (p === pt.p && !landing ? data.lookBefore : data.looksAfter.get(p)!)} rise={landing ? { p: pt.p, from: data.wholeBefore } : null} flash={landing} bloom={landing} stem={false} label="The World Flower" />
        </div>
      )}
      <NinjaSpot />
    </div>
  );
}

// ---------------------------------------------------------------- the scene
type View = 0 | 1; // 0 = the World Flower, 1 = the petal chart (the school's sheets)
/** What the bots read beside the scene's own state: the half-sheet on screen, and the fork panel's spelling. */
let halfNow: number | null = null;
let forkNow: string | null = null;

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
function takeVisit(): { visit: FlowerVisit | null; focus: string | null; open?: boolean; chart?: boolean } {
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
    // &chart=1 opens on the petal chart
    if (q.get("chart") === "1") return { visit: null, focus: null, chart: true };
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

/** Lines that aren't recorded yet (SCROLL_DESIGN §4.4's new ones, F2's to record) are left out, and nothing waits. */
const HAS_LINE = new Set(LINES.map((l) => l.id));
const sayIf = (id: string) => (HAS_LINE.has(id) ? say({ line: id }) : Promise.resolve(false));

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
  const practise = onPractice;
  // why the child is here: a trip (a gem won, spellings met, a new land, a practice done), a failed trial, or a look
  const [{ visit, focus, failed, openFocus, chart }] = useState((): { visit: FlowerVisit | null; focus: string | null; failed: string | null; openFocus?: boolean; chart?: boolean } => {
    if (celebrate) return celebrate.won ? { visit: { kind: "gem", gem: celebrate.gem }, focus: null, failed: null } : { visit: null, focus: celebrate.gem, failed: celebrate.gem };
    if (visitProp) return { visit: visitProp, focus: null, failed: null };
    const t = takeVisit();
    return { visit: t.visit, focus: t.focus, failed: null, openFocus: t.open, chart: t.chart };
  });
  const tripGem = visit?.kind === "spelling" ? visit.gems[0] : visit?.kind === "practised" ? visit.gem : null;
  const chartFocus = focus ?? tripGem;
  const [view, setView] = useState<View>(chartFocus || chart ? 1 : 0);
  // a child's first time here starts with the World Flower's introduction (not before a victory: that comes first)
  const [step, setStep] = useState<Step>(() => (!store.get().seenFlower && visit?.kind !== "gem" ? "intro" : visit ? "visit" : "free"));
  const [open, setOpen] = useState<Petal | null>(() => (failed ? petalOfGem(failed) : openFocus && focus ? petalOfGem(focus) : null));
  /** where the card grows from (stage px), measured at the tap, before the card is in the page */
  const [openFrom, setOpenFrom] = useState<Rect | null>(null);
  const fromEl = (el: Element | null | undefined) => (el?.isConnected ? stageRect(el) : null);
  const [openQuiet, setOpenQuiet] = useState(!!failed);
  const [openLead, setOpenLead] = useState<string | null>(null);
  const [bloomed, setBloomed] = useState<PhonemeId | null>(null);
  const [rise, setRise] = useState<{ p: PhonemeId; from: number } | null>(null);
  const [nudge, setNudge] = useState(false);
  const [energyShow, setEnergyShow] = useState<Record<string, number>>(() => (visit?.kind === "practised" ? { [visit.gem]: visit.from ?? lastPractice()?.from ?? 0 } : {}));
  const [reveal, setReveal] = useState<string[]>([]);
  const [landing, setLanding] = useState<string | null>(null);
  const [beat, setBeat] = useState("");
  const [helpKey, setHelpKey] = useState(0);

  // the progress model, once per save (SCROLL_DESIGN §7.7): every petal's look
  const overview = useMemo(() => flowerOverview(save), [save]);
  const looks = useMemo(() => petalLooks(overview), [overview]);
  const lookOf = useCallback((p: PhonemeId) => looks.get(p)!, [looks]);
  // a petal's progress with its spellings, when the chart or a card first asks for it (memoised per save)
  const progressOf = useMemo(() => {
    const m = new Map<PhonemeId, PetalProgress>();
    return (p: PhonemeId) => m.get(p) ?? (m.set(p, petalProgress(save, p)), m.get(p)!);
  }, [save]);
  // (the spellings with more than one sound: their sound lines come a moment after the chart's first frame; on the
  // flower they are worked out in the first idle moment, so a petal's card doesn't wait for them as it opens)
  const [multiOn, setMultiOn] = useState(false);
  useEffect(() => {
    if (multiOn) return;
    if (view === 1 || open) return void startTransition(() => setMultiOn(true));
    const warm = () => startTransition(() => setMultiOn(true));
    if (typeof requestIdleCallback !== "function") {
      const t = setTimeout(warm, 800);
      return () => clearTimeout(t);
    }
    const id = requestIdleCallback(warm, { timeout: 2500 });
    return () => cancelIdleCallback(id);
  }, [view, open]);
  const multi = useMemo(() => (multiOn ? multiSoundSpellings(save) : NO_MULTI), [save, multiOn]);
  // the colour's level before a practice (the gem's charge set back to where it was), for the chart's rise (§5.3)
  const [riseFrom] = useState<Record<string, number> | undefined>(() => {
    if (visit?.kind !== "practised") return undefined;
    const g = gemByKey(visit.gem);
    if (!g) return undefined;
    const from = visit.from ?? lastPractice()?.from ?? 0;
    const s0 = store.get();
    return { [g.p]: petalProgress({ ...s0, energy: { ...s0.energy, [visit.gem]: from * ENERGY_FULL } }, g.p).whole };
  });
  const [landFrom, setLandFrom] = useState<Record<string, number> | undefined>(undefined);

  // a trip is a show over the flower (the intro, the victory, new spellings, a new land): the flower under it is out of
  // reach until it ends. The practised trip plays on the chart itself.
  const overlay = step === "intro" || (step === "visit" && visit?.kind !== "practised");
  // under a trip's veil the chart waits (the meadow shows through instead): it opens as the trip ends, with its reveal
  const chartLater = overlay && view === 1;
  const tripOn = step === "intro" || step === "visit" || !!landing;
  // the three shows report their held steps (Intros.tsx onStep): while one waits on a ready ▶, the child's tap on it is
  // the thing to do, so the scene isn't busy then (B3's request, integration 27 Sep). Other trips stay busy throughout.
  const [showReady, setShowReady] = useState(false);
  const onShowStep = useCallback((_k: string, ready: boolean) => setShowReady(ready), []);
  useEffect(() => setShowReady(false), [step, visit]);
  // A trip that plays on the chart (back from practice, a gem landing) and its held Next: the chart is out of reach
  // until Next (the one thing to do then). The nav row along the bottom sits over the lower petals' cells, and a cell
  // under ▶ would take a tap meant for it.
  const chartHeld = view === 1 && !chartLater && (tripOn || step === "done");
  // Help: on a trip's held steps, the step again, then point at Next; after a trip, the arrow; the flower: how it fills
  // (then what a bouncing gem means), and its sparkles and ready gems play again; the chart: the ready gems hop again
  useHelp(
    (n) => {
      if (tripOn) return n === 1 ? navAgain() : nudgeNext();
      if (step === "done") return n === 1 ? void say({ line: "help_next" }) : nudgeNext();
      setHelpKey((k) => k + 1);
      if (view === 0 && n === 1 && HAS_LINE.has("help_flower_fill")) return void say({ line: "help_flower_fill" });
      void say({ line: "help_flower" });
    },
    [step, view, tripOn],
  );
  // Hear it again (top-right, docs/NAVIGATION.md §3.1): what was said on arrival; after a trip, Next carries on.
  // After a trip that ended on the chart (spellings met, a gem landed) Hear it again and Next stand in the right-hand
  // column, where the page dots rest meanwhile (the chart is held): in the nav row they sat over the lower petals the
  // child had just been shown. The held chart can't be tapped, so Hear it again says what to do then, not "Tap a
  // petal…".
  useNav({
    again: tripOn ? undefined : chartHeld ? () => say({ line: "help_next" }) : () => say({ line: "flower_tap" }),
    againAt: chartHeld && step === "done" ? "column" : "top-right",
    next: step === "done" ? { ready: true, go: onBack } : null,
  });

  const ready = useMemo(() => new Set(readyGems(save).flatMap((g) => PETALS.filter((pt) => pt.gems.some((x) => x.key === g.key)).map((pt) => pt.p))), [save]);

  useEffect(() => {
    if (visit?.kind !== "gem") playMusic("world_blossom");
    const t = setTimeout(() => setNudge(true), 6000); // invite a look at the chart
    if (step === "free" && !failed && !open && store.get().seenFlower) say({ line: "flower_tap" });
    return () => clearTimeout(t);
  }, []);
  // the letterbox is painted to match the view (the wall on the chart, the meadow's tan on the flower)
  useEffect(() => {
    const vp = document.querySelector(".viewport");
    vp?.classList.toggle("vp-chart", view === 1 && !chartLater);
    vp?.classList.toggle("vp-flower", view === 0 || chartLater);
    return () => vp?.classList.remove("vp-chart", "vp-flower");
  }, [view, chartLater]);

  // bots and the treadmill read what is happening here (scripts/treadmill/bot.ts); the chart adds `half` as it scrolls
  (window as any).__snState = { scene: "tree", game: null, view, open: open?.p ?? null, visit: visit?.kind ?? null, step, beat, intro: step === "intro", busy: tripOn && !showReady, done: step === "done", half: view === 1 ? halfNow : null, landing: !!landing, fork: open ? forkNow : null };

  const openPetal = (p: PhonemeId) => {
    if (looks.get(p)?.stage === "missing") {
      // a gap on the flower: this sound is still a secret
      sfx.petal();
      void say({ line: "petal_secret" });
      return;
    }
    sfx.petal();
    setOpenQuiet(false);
    setOpenLead(null);
    setOpenFrom(fromEl(document.querySelector(`[aria-label="The World Flower: tap a petal"] g[data-stage] [data-p="${CSS.escape(p)}"]`)));
    setOpen(petalOf(p));
    say({ sound: p, show: "petal" });
  };
  // (stable for the memoised WorldFlower: a card opening doesn't re-render the flower)
  const openPetalRef = useRef(openPetal);
  openPetalRef.current = openPetal;
  const onPetal = useCallback((p: PhonemeId) => openPetalRef.current(p), []);
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
    setLanding(null);
    setStep("done");
  };

  return (
    <div className={`scene ${view === 1 && !chartLater ? "tree-chart" : "tree-flower"}${open ? " tree-card-open" : ""}`} style={{ background: "#f7ddd0", overflow: "hidden" }}>
      {(view === 0 || chartLater) && (
        <>
          <img className="bg-img" src={img("world_flower_bg")} alt="" style={{ filter: "saturate(.9) brightness(1.04)" }} />
          <div className="tree-light" />
        </>
      )}

      <div className="tree-base" aria-hidden={overlay || chartHeld || undefined} inert={overlay || chartHeld}>
        {view === 0 ? (
          // the World Flower, big: one tap target, the nearest petal opens
          <div key="flower" style={{ position: "absolute", left: 405, top: 26, width: 580, height: 580 }}>
            <WorldFlower look={lookOf} ready={ready} bloom={bloomed} rise={rise} onPetal={onPetal} arrive={helpKey} label="The World Flower: tap a petal" />
          </div>
        ) : chartLater ? null : (
          (
            <PetalChart
              looks={looks}
              progressOf={progressOf}
              multi={multi}
              onOpen={(pt, el) => (setOpenQuiet(false), setOpenLead(null), setOpenFrom(fromEl(el)), setOpen(pt))}
              focus={focus}
              at={tripGem}
              energyShow={energyShow}
              riseFrom={landing ? landFrom : riseFrom}
              reveal={reveal}
              landing={landing}
              onLanded={endTrip}
              helpKey={helpKey}
            />
          )
        )}

        {/* switch between the flower and the chart (under Home, in both views; its picture is the other view) */}
        <div className="tree-toggle">
          <RoundButton label={view === 0 ? "Petal chart" : "The World Flower"} className={`pink ${view === 0 && nudge && step === "free" ? "nudge" : ""}`} onClick={next}>
            {view === 0 ? <ChartIcon /> : <MiniFlowerIcon />}
          </RoundButton>
        </div>
      </div>

      {step === "intro" && (
        <FlowerIntro
          onStep={onShowStep}
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
            playMusic("world_blossom");
            const g = gemByKey(visit.gem);
            const s0 = store.get();
            const before = g ? petalProgress({ ...s0, gems: s0.gems.filter((k) => k !== visit.gem) }, g.p).whole : 0;
            if (home || !g) {
              // the petal that has just come home is picked out on the big flower too: it blooms (bigger and glowing
              // while the child is here) and its colour grows to where it is now (SCROLL_DESIGN §5.4)
              setView(0);
              if (home) {
                setBloomed(home);
                setRise({ p: home, from: before });
                setTimeout(() => {
                  const el = document.querySelector(`[aria-label="The World Flower: tap a petal"] [data-p="${home}"]`);
                  const r = el ? stageRect(el) : null;
                  if (r?.w) fx.burst(r.x + r.w / 2, r.y + r.h / 2, "sparks", 30);
                }, 450);
              }
              endTrip();
            } else {
              // otherwise the gem lands on the chart, beside its spelling, and the petal's colour grows (§5.4)
              setLandFrom({ [g.p]: before });
              setLanding(visit.gem);
              setView(1);
              setStep("free");
            }
          }}
        />
      )}
      {step === "visit" && visit?.kind === "spelling" && (
        <GemFound
          gems={visit.gems}
          onBeat={setBeat}
          onStep={onShowStep}
          onDone={() => {
            setReveal(visit.gems);
            endTrip();
          }}
        />
      )}
      {step === "visit" && visit?.kind === "world" && <WorldVisit world={visit.world} onBeat={setBeat} onStep={onShowStep} onDone={endTrip} />}
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
              // gemReadySay's rules (narrate.tsx; SCRIPT_FIXES C8.2): only to a child who can be offered a gem battle,
              // the save's first ready gem says what a glowing gem means (flower_i5, shared with the reward's
              // rewardGemFocus), later ones "A gem is glowing!…" once a session; otherwise it glows in silence
              const lead = gemReadySay();
              setOpenQuiet(true);
              setOpenLead(lead?.line ?? null);
              setOpenFrom(fromEl(document.querySelector(`[data-gem-chip="${CSS.escape(visit.gem)}"]`)?.closest(".pc-petal")));
              setOpen(petalOfGem(visit.gem));
              if (lead) void say({ line: lead.line }).then((ok) => ok && gemLineHeard(lead.line));
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
          progress={progressOf(open.p)}
          multi={multi}
          from={openFrom}
        />
      )}
      <SenseiDock hidden />
    </div>
  );
}

/** Back from the dojo: the chart opens on the practised gem, its meter fills from where it was ("Your gem filled
 *  up…"), then the petal's colour grows (one held step; docs/NAVIGATION.md). `onDone(ready)`: after Next; `ready`: the
 *  gem is full now. */
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
  // (it plays on the chart: Hear it again and Next go to the right-hand column, off the lower row's petals)
  usePresentation(steps, { id: "practised", onDone: () => onDone(isReady), state: false, againAt: "column" });
  return null;
}

// ---------------------------------------------------------------- the petal card (SCROLL_DESIGN §3.6, §7.6)
type Rect = { x: number; y: number; w: number; h: number };
/** The card's box on the stage (tree-chart.css .pd-card). */
const CARD_BOX: Rect = { x: 150, y: 20, w: 980, h: 680 };
/** The words on the card: three cards, pictures first, the spelling in the petal's colour on a wash of it; the word
 *  Sensei is saying is lit; a tap says it. */
function CardWords({ show, className = "pd-shelf" }: { show: Explanation["show"]; className?: string }) {
  const spot = useSpokenWord(show.map((s) => s.word.text));
  return (
    <div className={className} onPointerDown={(e) => e.stopPropagation()}>
      {show.map(({ word, highlight }, i) => (
        <button key={word.text + i} className={`pd-wc ${spot === word.text ? "spot" : ""}`} data-w={word.text} aria-label={`word ${word.text}`} {...tapProps(() => say({ word: word.text }))}>
          {word.pic && <img src={img(`pic_${word.text}`)} alt="" />}
          <span className="wt">
            {word.segs.map((s, j) => (s.g === highlight.g && s.p === highlight.p ? <b key={j}>{s.g.replace("-", "")}</b> : <span key={j}>{s.g.replace("-", "")}</span>))}
          </span>
        </button>
      ))}
    </div>
  );
}
/** The words for a spelling: Sensei's examples, then the words the child has found with it, pictures first, three. */
function wordsFor(p: PhonemeId, g: string | null, save: Save, first: Explanation["show"] = []): Explanation["show"] {
  const metSet = new Set(Object.keys(save.words ?? {}));
  const found = Object.entries(save.words ?? {})
    .sort((a, b) => b[1].last - a[1].last)
    .map(([t]) => WORD_BY_TEXT[t])
    .filter((w): w is Word => !!w && w.segs.some((s) => s.p === p && (!g || s.g === g)))
    .map((word) => ({ word, highlight: { g: g ?? word.segs.find((s) => s.p === p)!.g, p } }));
  const all = [...first, ...exampleWords(p, g, metSet), ...found];
  const seen = new Set<string>();
  const out = all.filter((x) => !seen.has(x.word.text) && (seen.add(x.word.text), true));
  return [...out.filter((x) => x.word.pic), ...out.filter((x) => !x.word.pic)].slice(0, 3);
}
/** What the gem's meter says, in small print for grown-ups (the child reads the gem itself). */
const captionOf = (lk: GemLook) =>
  lk.dusty
    ? `${lk.mark === "mastered" ? "mastered" : "won"} · dusty: practise to polish it`
    : ({ none: "", glass: "just met: practice fills the gem", fill: "filling with practice", ready: "ready for its gem battle", won: "won: use it to make it sparkle", mastered: "mastered" } as const)[lk.mark];
/** Sensei's line for the chosen gem (§4.4), after her explanation: the new ones only once they are recorded. A ready
 *  gem's is gemReadySay's (narrate.tsx; SCRIPT_FIXES C8.2): only to a child who can be offered a gem battle, the save's
 *  first says what a glowing gem means (flower_i5, shared with the reward's rewardGemFocus and the practised trip),
 *  later ones "A gem is glowing!…" at most once a session, else none (the gem glows in silence). Record a ready line
 *  with gemLineHeard once said in full. */
function gemLineOf(lk: GemLook, petal: PetalLook): string | null {
  const pick = (...ids: string[]) => ids.find((id) => HAS_LINE.has(id)) ?? null;
  if (petal.stage === "outline" && lk.mark !== "ready") return pick("petal_outline", "t_practise_invite");
  if (lk.mark === "ready") return gemReadySay()?.line ?? null;
  if (lk.dusty) return pick("gem_dusty", "t_practise_invite");
  if (lk.mark === "mastered") return pick("gem_sparkle");
  if (lk.mark === "won") return petal.caught ? pick("petal_caught_up", "gem_won_shine") : pick("gem_won_shine");
  return "t_practise_invite";
}
const MARK_CLASS: Record<GemLook["mark"], string> = { none: "", glass: "", fill: "", ready: "r", won: "w", mastered: "w mx" };
/** The magnifying glass (Sound Detective's gate: MULTI_SOUND.md §7.4). */
const LensIcon = () => (
  <svg viewBox="0 0 64 64">
    <path d="M41 41l15 15" stroke="#2b1d14" strokeWidth={14} strokeLinecap="round" />
    <path d="M41 41l15 15" stroke="#a0561c" strokeWidth={6.5} strokeLinecap="round" />
    <circle cx={27} cy={27} r={20} fill="#f4fbff" stroke="#2b1d14" strokeWidth={7.5} />
    <circle cx={27} cy={27} r={20} fill="none" stroke="#ffc53d" strokeWidth={3.2} />
    <path d="M15.5 21.5a13 13 0 0 1 9.5-8" fill="none" stroke="#bfe6ff" strokeWidth={4.5} strokeLinecap="round" />
  </svg>
);

/**
 * One petal up close (SCROLL_DESIGN §3.6): a laminated flash card that grows out of the tapped petal. The petal with
 * every spelling and its gem meter (a tap picks the nearest spelling: Sensei explains it; a ready one starts its gem
 * battle), the picture on its shoulder, ONE speaker (the sound, then the chosen spelling's words), the chosen spelling
 * with its big gem, three word cards, the fork chip when the spelling has other sounds, and ONE action: the gem guardian
 * (its gem battle) when the gem is ready, else the dojo gate (practise it), else nothing. No Sensei face: Help is Sensei.
 * `gem`: the spelling to start on. `quiet`: open without explaining (Sensei has just spoken). `invite`: straight to
 * "Shall we practise this in the dojo?" (after a Gem Trial that didn't go well). `lead`: the line said as it opened.
 */
export function PetalDetail({ pt, gem, onClose, onTrial, onPractice, quiet, invite, lead, progress: prIn, multi: multiIn, from, onDetective }: {
  pt: Petal;
  gem?: string | null;
  onClose: () => void;
  onTrial: (key: string) => void;
  onPractice?: (key: string) => void;
  quiet?: boolean;
  invite?: boolean;
  /** a line said as the panel opened (the gem is ready): Hear it again says it, until Sensei has explained */
  lead?: string | null;
  progress?: PetalProgress;
  multi?: MultiSound[];
  /** the petal it grows out of: its element, or its box in stage px (measured before the card opened: cheaper) */
  from?: Element | Rect | null;
  /** Sound Detective with this spelling (MULTI_SOUND §8); absent: the fork panel explains only */
  onDetective?: (g: string) => void;
}) {
  const save = useSave((s) => s);
  const gen = useLettersFont();
  const pr = useMemo(() => prIn ?? petalProgress(save, pt.p), [prIn, save, pt.p]);
  const multi = useMemo(() => multiIn ?? multiSoundSpellings(save), [multiIn, save]);
  const look = useMemo(() => petalLook(pr), [pr]);
  const lines = useMemo(() => linesOf(pr, multi), [pr, multi]);
  const metLines = lines.filter(isMetLine);
  const c = chartOf(pt.p);
  const [sel, setSel] = useState<string | null>(() => {
    if (gem && metLines.some((l) => l.key === gem)) return gem;
    const r = metLines.find((l) => l.look!.mark === "ready") ?? metLines.filter((l) => l.look!.mark !== "won" && l.look!.mark !== "mastered").sort((a, b) => a.look!.e - b.look!.e)[0] ?? metLines.find((l) => l.look!.dusty) ?? metLines[0];
    return r?.key ?? null;
  });
  const selLine = metLines.find((l) => l.key === sel) ?? null;
  const selGem = selLine ? gemByKey(selLine.key!) ?? null : null;
  const [fork, setFork] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [shelf, setShelf] = useState<Explanation["show"]>(() => wordsFor(pt.p, selGem?.g ?? null, save));
  const [bob, setBob] = useState<"" | "act" | "also" | "spk">("");
  const cardRef = useRef<HTMLDivElement>(null);
  const spoke = useRef(false);
  const runRef = useRef(run);
  runRef.current = run;
  const metSet = useMemo(() => new Set(Object.keys(save.words ?? {})), [save.words]);
  useHelp(() => say({ line: "wf_help_petal" }));

  // the card's layout: the big petal's column fitted, and its colour's level
  const { vars: lay, boxes, fit } = layoutOf(lines, true, gen);
  const lv = levelOf(look, lines, boxes, true);
  const selLook = selLine?.look ?? null;
  const ready = selLook?.mark === "ready";
  const showGate = !!selLook && !ready && !(selLook.mark === "mastered" && !selLook.dusty) && !!onPractice && !!selLine?.key && canPractise(selLine.key, save);
  const others = useMemo(() => {
    if (!selGem || selGem.key === "u>w") return [];
    const m = multi.find((x) => x.g === selGem.g);
    return m ? m.sounds.filter((s) => s.p !== pt.p && s.key !== "u>w" && !s.together).slice(0, 3) : [];
  }, [selGem, multi]);

  // opening: the card grows out of the petal; the letterbox dims (a tap on it closes)
  useLayoutEffect(() => {
    const card = cardRef.current;
    const vp = document.querySelector(".viewport");
    vp?.classList.add("vp-dim");
    const onVp = (e: Event) => e.target === vp && close();
    vp?.addEventListener("pointerdown", onVp);
    const fr = from instanceof Element ? (from.isConnected ? stageRect(from) : null) : from;
    if (card && fr) {
      // (the card's box is fixed, 980 × 680 at (150, 20): read nothing from the page while the card is going in)
      const cr = CARD_BOX;
      card.style.transformOrigin = `${Math.round(fr.x + fr.w / 2 - cr.x)}px ${Math.round(fr.y + fr.h * 0.4 - cr.y)}px`;
      card.animate([{ transform: "scale(.22)", opacity: 0 }, { transform: "scale(1.02)", opacity: 1, offset: 0.7 }, { transform: "none", opacity: 1 }], { duration: 300, easing: "cubic-bezier(.2,.8,.3,1)" });
    } else card?.animate([{ transform: "scale(.9)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 260, easing: "cubic-bezier(.2,.8,.3,1)" });
    return () => {
      vp?.classList.remove("vp-dim");
      vp?.removeEventListener("pointerdown", onVp);
    };
  }, []);
  const closing = useRef(false);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const card = cardRef.current;
    if (!card) return onClose();
    card.animate([{ transform: "none", opacity: 1 }, { transform: "scale(.22)", opacity: 0 }], { duration: 200, easing: "ease-in", fill: "forwards" }).onfinish = () => onClose();
  };

  // what Sensei says (§4.4): the first time in a save, what the speaker does (it rings); then her explanation; then the
  // chosen gem's line while its action bobs; the first time there is a fork chip, what it does (it bobs)
  const explain = async (first: boolean) => {
    const e: Explanation | null = !selGem
      ? null
      : first && !gem && metLines.length > 1 && Math.random() < 0.5
        ? sameSound(pt.p, metLines.map((l) => gemByKey(l.key!)!).filter(Boolean), { met: metSet })
        : first && !gem
          ? introPetal(pt.p, { met: metSet })
          : introGem(selGem, { met: metSet, another: metLines.length > 1 });
    if (e) setShelf(wordsFor(pt.p, selGem?.g ?? null, save, e.show));
    const done = e ? await say(e.say) : true;
    spoke.current = true;
    return done;
  };
  useEffect(() => {
    let live = true;
    const t = setTimeout(async () => {
      if (invite && (showGate || practiceGemFor(pt, sel, save))) {
        if ((await say({ line: "t_practise_invite" })) && live) setBob("act");
        return;
      }
      if (quiet || !selLook) return;
      if (onceInSave("wf:card-speaker") && HAS_LINE.has("tv_train_hear_again")) {
        setBob("spk");
        const ok = await say({ line: "tv_train_hear_again" });
        if (ok) heard("wf:card-speaker");
        if (!live || !ok) return;
      }
      if (!(await explain(true)) || !live) return;
      const id = gemLineOf(selLook, look);
      if (id) {
        setBob(ready || showGate ? "act" : "");
        const ok = await say({ line: id });
        if (ok) gemLineHeard(id);
        if (!ok || !live) return;
      }
      if (others.length && onceInSave("wf:fork-chip") && HAS_LINE.has("card_also_first")) {
        setBob("also");
        if (await say({ line: "card_also_first" })) heard("wf:fork-chip");
      }
    }, 750);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, []);
  // a new choice (or the same one again): Sensei explains it
  useEffect(() => {
    if (run < 1) return;
    let live = true;
    void (async () => {
      if (!(await explain(false)) || !live || !selLook) return;
      const id = gemLineOf(selLook, look);
      if (id && (id === "t_practise_invite" ? showGate : true)) {
        setBob(ready || showGate ? "act" : "");
        if (await say({ line: id })) gemLineHeard(id);
      }
    })();
    return () => void (live = false);
  }, [run]);
  // Hear it again: the line she opened with (a ready gem, a practice invite) until she has explained, then the explanation
  const replay = () => {
    const opening = invite ? "t_practise_invite" : lead;
    if (!spoke.current && opening) return say({ line: opening });
    setRun((n) => n + 1);
  };
  useNav({ modal: true, again: metLines.length || lead || invite ? replay : null, againAt: "own", sound: null });

  const hearAll = async () => {
    setBob("");
    const words = shelf.map((s) => ({ word: s.word.text }));
    await say([{ sound: pt.p, show: "petal" }, { gap: 250 }, ...words.flatMap((w, i) => (i ? [{ gap: 350 }, w] : [w]))]);
  };
  const pickLine = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    e.stopPropagation();
    let ln = (e.target as Element).closest?.(".pc-ln[data-st]") as HTMLElement | null;
    if (!ln) {
      const ls = [...e.currentTarget.querySelectorAll<HTMLElement>(".pc-ln[data-st]")];
      const mid = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      };
      ln = ls.sort((a, b) => Math.abs(e.clientY - mid(a)) - Math.abs(e.clientY - mid(b)))[0] ?? null;
    }
    const key = ln?.dataset.key;
    const line = lines.find((l) => l.key === key);
    if (!line?.look) return;
    const g = gemByKey(line.key!);
    if (line.look.mark === "none") return void say({ line: g && !g.inPlay ? "gem_future" : "gem_hidden" });
    if (line.look.mark === "ready") {
      sfx.great();
      return onTrial(line.key!);
    }
    sfx.petal();
    setSel(line.key!);
    setBob("");
    setRun((n) => n + 1);
  };

  const vars = { ...chartMasks(), ...colourVars(c.colour), ...lay, "--lv": lv.toFixed(3), "--M": `${fit.M}px` } as CSSProperties;
  const inkedLook = look.stage !== "outline";
  const bigCls = ["pd-big", look.stage === "complete" && "done", look.stage === "outline" && "outl", look.caught && "caught", inkedLook && "inked", look.matte && "matte"].filter(Boolean).join(" ");
  return (
    <div data-modal className="pd-backdrop" {...tapProps(() => close())}>
      <div ref={cardRef} className={`pd-card ${fork ? "fk-card" : ""}`} role="dialog" aria-label={fork ? `${fork}: its sounds` : `Petal ${pt.p}`} onPointerDown={(e) => e.stopPropagation()} style={vars}>
        {fork ? (
          <ForkPanel g={fork} here={pt.p} save={save} multi={multi} onDetective={onDetective} />
        ) : (
          <>
            <div className={bigCls} data-petal={pt.p} role="button" aria-label="the spellings" onPointerDown={pickLine}>
              {inkedLook && (
                <i className="pc-fl">
                  <i />
                  <b />
                </i>
              )}
              <div className="pd-big-line" />
              <div className="pd-col">
                {lines.map((ln, i) => (
                  <LineEl key={ln.key ?? ln.g} p={pt.p} ln={ln} i={i} big sel={!!ln.key && ln.key === sel} />
                ))}
              </div>
            </div>
            <img className="pd-pic" src={petalImg(pt.p)} alt="" draggable={false} />
            <RoundButton label="Hear the sound and its words" className={`pd-spk ${bob === "spk" ? "hint" : ""}`} onClick={() => void hearAll()}>
              <Icon.speaker />
            </RoundButton>
            {selLine && selLook && (
              <>
                {/* the chosen spelling, its big gem and its sound line: a tap says its sound (§3.6) */}
                <button className={`pd-chosen${selLine.line && DESC.test(selLine.g) ? " dsc" : ""}`} aria-label={`${selLine.g}: its sound`} {...tapProps(() => void say({ sound: pt.p, show: "petal" }))}>
                  <span>{selLine.g}</span>
                  <i className={`pd-gm ${MARK_CLASS[selLook.mark]}${selLook.dusty ? " dust" : ""}`} style={{ "--e": selLook.e, "--pol": selLook.polish } as CSSProperties} />
                  {selLine.line && <i className="pd-ms" style={{ "--ms": soundLineImage(selLine.line) } as CSSProperties} />}
                </button>
                <div className="pd-cap">{captionOf(selLook)}</div>
              </>
            )}
            <CardWords key={shelf.map((s) => s.word.text).join()} show={shelf} />
            {others.length > 0 && selLine && (
              <button className={`pd-also ${bob === "also" ? "pulse" : ""}`} aria-label={`${selLine.g}: its other sounds`} {...tapProps(() => (sfx.page(), setFork(selLine.g)))}>
                <span className="lk">
                  <LensIcon />
                </span>
                {others.map((s) => (
                  <span key={s.p} className="pd-mini" style={{ "--mc": petalColour(s.p) } as CSSProperties}>
                    <i className="mp" />
                    <i className="ml" />
                    <img src={petalImg(s.p)} alt="" />
                  </span>
                ))}
              </button>
            )}
            {ready && selLine ? (
              <RoundButton label={`Gem battle ${selLine.g}`} className={`pd-act battle ${bob === "act" ? "pulse" : ""}`} onClick={() => (sfx.great(), onTrial(selLine.key!))}>
                {/* the guardian's face, cropped into the round (on purpose: the picture is the whole monster, 190 % of
                    the button, framed on its head; the clip is its own layer, so the button holds no overflow) */}
                <span className="pd-act-pic">
                  <img src={img("mon_gem_guardian")} alt="" />
                </span>
              </RoundButton>
            ) : (
              showGate && (
                <RoundButton label="Practise in the dojo" className={`go pd-act ${bob === "act" ? "pulse" : ""}`} onClick={() => (sfx.great(), onPractice!(selLine!.key!))}>
                  <GateIcon />
                </RoundButton>
              )
            )}
            {(ready || showGate) && selLine && <span className="pd-act-chip">{selLine.g}</span>}
          </>
        )}
        <div className="pd-close">
          <RoundButton sm label="close" onClick={() => (fork ? setFork(null) : close())}>
            <Icon.check />
          </RoundButton>
        </div>
      </div>
    </div>
  );
}

/**
 * The fork panel (SCROLL_DESIGN §3.7; MULTI_SOUND §7): one spelling that represents more than one sound, its petals side
 * by side: each with the spelling, its gem meter, its picture and an example word; the sounds it will represent later as
 * dotted petals in pencil. The speaker says each met sound and its word in turn, lifting that petal. The magnifying glass
 * (Sound Detective) only when App passes `onDetective` and the spelling isn't one Sensei only explains.
 */
function ForkPanel({ g, here, save, multi, onDetective }: { g: string; here: PhonemeId; save: Save; multi: MultiSound[]; onDetective?: (g: string) => void }) {
  const [on, setOn] = useState<PhonemeId | null>(null);
  const [spot, setSpot] = useState<string | null>(null);
  const senses = useMemo(() => {
    const all = soundsOfSpelling(g).filter((s) => !s.together && s.key !== "u>w");
    const withLook = all.map((s) => {
      const sp = petalProgress(save, s.p).spellings.find((x) => x.key === s.key);
      const lk = sp ? gemLook(sp) : null;
      // its example word WITH A PICTURE (§3.7): the model's example when it has one, else the first of the spelling's
      // words that does (Sensei's words, then the ones the child has found), else the example (bread for < ea > as /e/)
      const ex = s.example ? WORD_BY_TEXT[s.example] ?? null : null;
      const gem = gemByKey(s.key);
      const pics = gem ? wordsFor(s.p, gem.g, save).map((x) => x.word).filter((w) => w.pic) : [];
      const word = ex?.pic ? ex : pics[0] ?? ex;
      return { s, lk, met: !!lk && lk.mark !== "none", word };
    });
    return [...withLook.filter((x) => x.met), ...withLook.filter((x) => !x.met)].slice(0, 4);
  }, [g, save]);
  const line = soundLineOf(g, senses[0]?.s.p ?? here, multi);
  const canPlay = !!onDetective && senses.filter((x) => x.met).length >= 2 && !["th", "n", "gh", "gg", "ai"].includes(g);
  const hear = async () => {
    for (const x of senses.filter((y) => y.met)) {
      setOn(x.s.p);
      setSpot(x.word?.text ?? null);
      const ok = await say([{ sound: x.s.p, show: "petal" }, { gap: 250 }, ...(x.word ? [{ word: x.word.text }] : [])]);
      if (!ok) break;
    }
    setOn(null);
    setSpot(null);
  };
  useEffect(() => {
    const st = () => (window as any).__snState;
    forkNow = g;
    if (st()?.scene === "tree") st().fork = g;
    const t = setTimeout(() => void hear(), 500);
    return () => {
      clearTimeout(t);
      forkNow = null;
      if (st()?.scene === "tree") st().fork = null;
    };
  }, []);
  return (
    <>
      <RoundButton label="Hear its sounds" className="pd-spk fk-spk" onClick={() => void hear()}>
        <Icon.speaker />
      </RoundButton>
      <div className={`fk-title${line && DESC.test(g) ? " dsc" : ""}`}>
        <span>{g}</span>
        {line && <i className="fk-ms" style={{ "--ms": soundLineImage(line) } as CSSProperties} />}
      </div>
      <div className={`fk-row n${senses.length}`}>
        {senses.map((x) => (
          <div key={x.s.key} className={`fk-sense ${on === x.s.p ? "on" : ""}`} style={colourVars(chartOf(x.s.p).colour) as CSSProperties}>
            {x.met && <i className="pc-gl" />}
            <div
              className={`fk-petal ${x.met ? "" : "mys"}`}
              data-p={x.s.p}
              role="button"
              aria-label={`${g} as in ${x.met && x.word ? x.word.text : "a secret"}`}
              {...tapProps(() => (x.met ? void say({ sound: x.s.p, show: "petal" }) : void say({ line: "gem_hidden" })))}
            >
              <i className="fk-bl" />
              <div className="fk-g">
                {g}
                {x.lk && x.met && <i className={`fk-gem ${MARK_CLASS[x.lk.mark]}${x.lk.dusty ? " dust" : ""}`} style={{ "--e": x.lk.e, "--pol": x.lk.polish } as CSSProperties} />}
              </div>
            </div>
            {x.met && <img className="fk-pic" src={petalImg(x.s.p)} alt="" />}
            {x.met && x.word && (
              <button className={`pd-wc ${spot === x.word.text ? "spot" : ""}`} aria-label={`word ${x.word.text}`} {...tapProps(() => say({ word: x.word!.text }))}>
                {x.word.pic && <img src={img(`pic_${x.word.text}`)} alt="" />}
                <span className="wt">
                  {x.word.segs.map((s, j) => (s.g === g && s.p === x.s.p ? <b key={j}>{s.g.replace("-", "")}</b> : <span key={j}>{s.g.replace("-", "")}</span>))}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
      {canPlay && (
        <>
          <RoundButton label={`Sound Detective ${g}`} className="pd-act fk-lens" onClick={() => (sfx.great(), onDetective!(g))}>
            <LensIcon />
            <span className="fk-lens-g">{g}</span>
          </RoundButton>
        </>
      )}
    </>
  );
}

export { neededGems };
