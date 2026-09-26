// The World Flower: the heart of the Island of Sounds (docs/ART_STYLE.md, assets-src/world-flower/model_sheet.png).
// View 0 is the flower itself: 44 glassy teardrop petals, one per sound, in the school chart's colours. A petal glows
// once all its gems are won, fills in as gems are won, and is a dim outline while it is still missing.
// View 1 is the petal chart as a ninja scroll the child swipes: the school's "Extended Code alternative spellings"
// sheet (sheet 1, sheet 2, then the extra sounds) as one row of big teardrop petals with every spelling inside.
// Every spelling is a gem: dim until taught, charging with practice, glowing when its Gem Trial is ready, and a solid
// jewel once won. Tap a petal (on the flower or the scroll) to open it.
// Layout: nothing interactive in the bottom-left 330×340 (the player's ninja) or the bottom-right 150×150 (Sensei's help).
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PETALS, CHART_PETALS, chartOf, neededGems, type Petal, type Gem, type ChartPetal } from "../content/flower";
import { PHONEMES, WORDS, WORD_BY_TEXT, type PhonemeId, type Word } from "../content/phonics";
import { introGem, introPetal, sameSound, type Explanation } from "../content/teach";
import { say, sfx, playMusic } from "../engine/audio";
import { useSave, store, type Save } from "../engine/store";
import { gemState, energyOf, petalComplete, flowerComplete, knownNow, readyGems, type GemState } from "../engine/gems";
import { img, RoundButton, Icon, fx, SenseiDock, tapProps, useHelp } from "../ui/ui";
import { GemIcon } from "../ui/Gem";
import { FlowerIntro } from "./Intros";
import "../styles/tree-teach.css";

/** Teardrop petal (round top, point at the bottom), centred on 0,0 — the shape on the school's sheet. */
export const teardrop = (w: number, h: number) => {
  const r = w / 2;
  const cy = -h / 2 + r;
  return `M0,${h / 2} C${-w * 0.12},${h * 0.28} ${-r},${h * 0.06} ${-r},${cy} A${r},${r} 0 0 1 ${r},${cy} C${r},${h * 0.06} ${w * 0.12},${h * 0.28} 0,${h / 2} Z`;
};

const petalOf = (p: PhonemeId) => PETALS.find((x) => x.p === p)!;

// ---------------------------------------------------------------- the World Flower (SVG, matches the painted design)
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));
function hue(h: string) {
  const [r, g, b] = rgb(h).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (mx < 0.25 || d / (mx || 1) < 0.25) return 2; // greys and browns go last, as in the painting
  const x = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return x / 6;
}
/** The chart's /or/ petal is ink-dark; on the flower it is painted deep bronze so it doesn't read as a hole. */
const flowerColour = (c: string) => (c === "#2b1d14" ? "#7a4a24" : c);
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

/** How lit a petal is: 1 = back on the flower; 0..1 = share of its gems won so far. */
export function petalLight(p: PhonemeId, save: Save) {
  const pt = petalOf(p);
  if (petalComplete(pt, save)) return 1;
  const need = neededGems(pt);
  return need.length ? (0.9 * need.filter((g) => save.gems.includes(g.key)).length) / need.length : 0;
}

let flowerIds = 0;
/**
 * The World Flower, sized by its container (the bloom fills the box; the painted stem hangs below it, outside the box).
 * `light(p)` 0..1 per petal, `ready` petals get a pulsing gold outline, `landing` animates one petal flying home.
 */
export function WorldFlower({ light, ready, landing, count, onPetal, stem = true, label = "The World Flower" }: {
  light: (p: PhonemeId) => number;
  ready?: Set<string>;
  landing?: PhonemeId | null;
  count?: [number, number];
  onPetal?: (p: PhonemeId) => void;
  stem?: boolean;
  label?: string;
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
    return (
      <g key={c.p} transform={`rotate(${a}) translate(0 ${-(g.r0 + g.len / 2)})`}>
        <g className={landing === c.p ? "wf-land" : undefined}>
          <path
            d={d}
            data-p={c.p}
            aria-label={`petal ${c.p}`}
            // missing petals are pale ghosts with a hint of their colour (as in the painted "partly regrown" state);
            // petals with some gems won fill in with their colour
            fill={on ? `url(#${uid}-${c.p})` : l > 0 ? col : mix(col, "#fff4dc", 0.72)}
            fillOpacity={on ? 1 : l > 0 ? 0.25 + 0.5 * l : 0.3}
            stroke={on || l > 0 ? "#2b1d14" : "#fff4dc"}
            strokeOpacity={on ? 1 : l > 0 ? 0.5 : 0.9}
            strokeWidth={on ? 5 : 3.5}
            style={{ cursor: onPetal ? "pointer" : undefined }}
          />
          {on && <ellipse cx={-g.w * 0.16} cy={-g.len / 2 + g.w * 0.36} rx={g.w * 0.13} ry={g.w * 0.24} fill="#fff" opacity={0.55} transform={`rotate(-18 ${-g.w * 0.16} ${-g.len / 2 + g.w * 0.36})`} pointerEvents="none" />}
          {ready?.has(c.p) && (
            <path d={d} fill="none" stroke="#ffc53d" strokeWidth={9} pointerEvents="none">
              <animate attributeName="stroke-opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite" />
            </path>
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
        <style>{`.wf-land{transform-box:fill-box;transform-origin:50% 100%;animation:wfland 1s cubic-bezier(.3,1.4,.5,1) both}@keyframes wfland{from{transform:translateY(-160px) scale(.2) rotate(-50deg);opacity:0}to{transform:none;opacity:1}}`}</style>
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
            <g>{FLOWER_RINGS[ri].map((c, i) => (light(c.p) >= 1 ? null : petal(c, i, ri)))}</g>
            <g filter={`url(#${uid}-lit)`}>{FLOWER_RINGS[ri].map((c, i) => (light(c.p) >= 1 ? petal(c, i, ri) : null))}</g>
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
const met = (st: GemState) => st === "charging" || st === "ready" || st === "won";

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

/** One spelling inside a scroll petal, as a gem chip: met spellings are readable stone (charging, with an energy bar),
 *  a ready gem glows gold, a won gem is a polished jewel in the petal's colour, and unmet spellings are dark crystals. */
function GemChip({ gem, st, energy, colour, size, focus }: { gem: Gem; st: GemState; energy: number; colour: string; size: number; focus?: boolean }) {
  if (!met(st)) return <DarkCrystal size={size * 0.95} />;
  const base: React.CSSProperties = { position: "relative", fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: size, lineHeight: 1.12, padding: "0 7px 2px", borderRadius: 9, whiteSpace: "nowrap", border: "2.5px solid #2b1d14" };
  const glow = focus ? { outline: "4px solid #ffc53d", outlineOffset: 2, animation: "wffocus 1s ease-in-out infinite" } : {};
  if (st === "won")
    return <span className="gem-won" style={{ ...base, ...glow, color: "#fff", background: `linear-gradient(160deg, ${mix(colour, "#ffffff", 0.45)}, ${colour} 55%, ${mix(colour, "#2b1d14", 0.25)})`, textShadow: "0 1.5px 0 #2b1d14, 0 0 2px #2b1d14", boxShadow: `inset 0 3px 0 rgba(255,255,255,.55), 0 0 10px ${colour}` }}>{gem.g}</span>;
  if (st === "ready") return <span className="gem-ready" style={{ ...base, ...glow, color: "#2b1d14", background: "linear-gradient(160deg, #fff1b8, #ffc53d)", boxShadow: "0 0 12px #ffc53d" }}>{gem.g}</span>;
  // charging: unpolished stone with an energy bar filling along the bottom
  return (
    <span style={{ ...base, ...glow, color: "rgba(43,29,20,.86)", background: "repeating-linear-gradient(45deg, rgba(120,100,80,.07) 0 3px, transparent 3px 7px), #efe6d6", overflow: "hidden" }}>
      {gem.g}
      <i style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${Math.max(6, energy * 100)}%`, background: "#ffc53d", borderTop: "1.5px solid #2b1d14" }} />
    </span>
  );
}

function ScrollPetal({ p, save, known, onOpen, focusGem }: { p: PhonemeId; save: Save; known: Set<string>; onOpen: (p: Petal) => void; focusGem?: string | null }) {
  const pt = petalOf(p);
  const c = chartOf(p);
  const done = petalComplete(pt, save);
  const states = pt.gems.map((g) => gemState(g, save, known));
  const known1 = states.some(met); // has the child met this sound yet?
  const fill = done ? 1 : petalLight(p, save);
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
      {known1 && <img src={img(`petal_${p}`)} alt="" draggable={false} style={{ position: "absolute", right: -4, top: -8, width: 52, height: 52, objectFit: "contain", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))", pointerEvents: "none" }} onError={(e) => (e.currentTarget.style.display = "none")} />}
      {/* the spellings flow inside the round part of the teardrop, like the sheet but big enough to read */}
      {known1 && (
        <div style={{ position: "absolute", left: w * 0.1, right: w * 0.1, top: h * 0.08, height: h * 0.6, display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "center", justifyContent: "center", gap: n > 9 ? "4px 5px" : "6px 6px", pointerEvents: "none" }}>
          {pt.gems.map((g, i) => (
            <GemChip key={g.key + g.g} gem={g} st={states[i]} energy={energyOf(g.key, save)} colour={c.colour} size={n > 9 ? 25 : n > 6 ? 27 : 30} focus={g.key === focusGem} />
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
  const W = 1080, H = 34;
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
const FlowerIcon = () => (
  <svg viewBox="-60 -60 120 120">
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d={teardrop(24, 40)} transform={`rotate(${i * 45}) translate(0 -34)`} fill={["#e8312f", "#f7a23b", "#f3c74a", "#2fa65a", "#2ec4b6", "#4a7dff", "#8a3be0", "#f0226b"][i]} stroke="#2b1d14" strokeWidth={4} />
    ))}
    <circle r={17} fill="#ffc53d" stroke="#2b1d14" strokeWidth={5} />
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

// ---------------------------------------------------------------- the scene
type View = 0 | 1; // 0 = the World Flower, 1 = the petal scroll (the school chart)

// ---------------------------------------------------------------- extension points
/**
 * Open the World Flower screen on the scroll, focused on one gem: the scroll moves to its petal, the petal and the gem
 * glow, and "celebrate" also plays a small fanfare (the full gem-mastered victory sequence is future work).
 * Call it, then route to the tree scene (App: go({ name: "tree" })). The same focus works from a URL:
 * /play/?scene=tree&gem=<key>&celebrate=1, where <key> is a gem key such as "ai>ae" (spelling>sound, see content/flower.ts).
 */
export function focusGem(gemKey: string, how: "glow" | "celebrate" = "glow") {
  pendingFocus = { gem: gemKey, how };
}
export const celebrateGem = (gemKey: string) => focusGem(gemKey, "celebrate");
let pendingFocus: { gem: string; how: "glow" | "celebrate" } | null = null;
function takeFocus(): { gem: string; how: "glow" | "celebrate" } | null {
  const f = pendingFocus;
  pendingFocus = null;
  if (f) return f;
  try {
    const q = new URLSearchParams(location.search);
    const gem = q.get("gem");
    if (gem && PETALS.some((pt) => pt.gems.some((g) => g.key === gem))) return { gem, how: q.get("celebrate") ? "celebrate" : "glow" };
  } catch {}
  return null;
}

/** Slots in the petal detail panel, for a follow-up to fill. Each is optional and renders only when given. */
export interface PetalDetailSlots {
  /** the words the child has met with this sound or spelling (tap to hear, with a picture) */
  words?: ReactNode;
  /** actions such as a "Practise" button that opens a dojo practice for this sound */
  actions?: ReactNode;
  /** a teacher-language explanation of the sound and its spellings, with many examples */
  explanation?: ReactNode;
}
/** Builds the slots for a petal (and the focused gem, if any). Empty for now; the follow-up implements it. */
export function petalDetailSlots(pt: Petal, gem: Gem | null, save: Save): PetalDetailSlots {
  const known = knownNow(save);
  const metGems = pt.gems.filter((g) => met(gemState(g, save, known)));
  if (!metGems.length) return {}; // a secret petal: nothing to explain yet
  return {
    words: <MetWords pt={pt} gem={gem} save={save} />,
    explanation: <Explain key={`${pt.p}:${gem?.key ?? ""}`} pt={pt} gem={gem && met(gemState(gem, save, known)) ? gem : null} metGems={metGems} save={save} />,
  };
}

/** The words the child has met with this sound (or this spelling), each with its picture and the spelling of the
 *  sound coloured in. Tap to hear. Before any are met: the example words Sensei uses. */
function MetWords({ pt, gem, save }: { pt: Petal; gem: Gem | null; save: Save }) {
  const has = (w: Word) => w.segs.some((s) => s.p === pt.p && (!gem || s.g === gem.g));
  const metWords = Object.entries(save.words ?? {})
    .sort((a, b) => b[1].last - a[1].last)
    .map(([t]) => WORD_BY_TEXT[t])
    .filter((w): w is Word => !!w && has(w))
    .slice(0, 8);
  const shown = metWords.length ? metWords : (gem ? introGem(gem, {}).show : introPetal(pt.p, {}).show).map((x) => x.word);
  const colour = chartOf(pt.p).colour;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <RoundButton sm label="Hear about these words" onClick={() => say({ line: "t_words_you_found" })}><Icon.speaker /></RoundButton>
        <span style={{ font: "700 18px/1.1 var(--font-ui)", color: "var(--ink-soft)" }}>{metWords.length ? "Words you found" : "Words with this sound"}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {shown.map((w) => (
          <button key={w.text} aria-label={`word ${w.text}`} className="met-word" {...tapProps(() => say({ word: w.text }))}>
            {w.pic && <img src={img(`pic_${w.text}`)} alt="" />}
            <span>
              {w.segs.map((s, i) => (
                <b key={i} style={s.p === pt.p && (!gem || s.g === gem.g) ? { color: colour, WebkitTextStroke: "1px #2b1d14" } : undefined}>{s.g.replace("-", "")}</b>
              ))}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/** Sensei explains the sound, the chosen spelling, or "same sound, different spellings", in Sounds~Write teacher
 *  language (content/teach.ts), automatically when the petal opens and again on the big button. Rotates phrasings. */
function Explain({ pt, gem, metGems, save }: { pt: Petal; gem: Gem | null; metGems: Gem[]; save: Save }) {
  const [shown, setShown] = useState<Explanation["show"]>([]);
  const metSet = useMemo(() => new Set(Object.keys(save.words ?? {})), [save.words]);
  const explain = () => {
    const e: Explanation = gem
      ? introGem(gem, { met: metSet, another: metGems.length > 1 })
      : metGems.length > 1 && Math.random() < 0.5
        ? sameSound(pt.p, metGems, { met: metSet })
        : introPetal(pt.p, { met: metSet });
    setShown(e.show);
    say(e.say);
  };
  useEffect(() => {
    const t = setTimeout(explain, 500); // after the panel pops in
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <button className="explain-btn" aria-label="Sensei explains" {...tapProps(explain)}>
        <img src={img("sensei_face_talk")} alt="" />
      </button>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {shown.map(({ word, highlight }) => (
          <span key={word.text} className="explain-word">
            {word.segs.map((s, i) => (
              <b key={i} style={s.g === highlight.g && s.p === highlight.p ? { color: chartOf(pt.p).colour, WebkitTextStroke: "1px #2b1d14" } : undefined}>{s.g.replace("-", "")}</b>
            ))}
          </span>
        ))}
      </div>
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

export function Tree({ onBack, onTrial, celebrate }: { onBack: () => void; onTrial: (key: string) => void; celebrate?: { gem: string; won: boolean } }) {
  const save = useSave((s) => s);
  const known = useMemo(() => knownNow(save), [save]);
  const [focus] = useState(() => (celebrate ? null : takeFocus()));
  const [view, setView] = useState<View>(focus ? 1 : 0);
  const [intro, setIntro] = useState(() => !store.get().seenFlower && !celebrate);
  const celebratePetal = celebrate ? PETALS.find((p) => p.gems.some((g) => g.key === celebrate.gem)) ?? null : null;
  const [open, setOpen] = useState<Petal | null>(celebratePetal);
  const [landing, setLanding] = useState<PhonemeId | null>(null);
  const [nudge, setNudge] = useState(false);
  useHelp(() => say({ line: "help_flower" }));

  const ready = useMemo(() => new Set(readyGems(save).flatMap((g) => PETALS.filter((pt) => pt.gems.some((x) => x.key === g.key)).map((pt) => pt.p))), [save]);
  const light = (p: PhonemeId) => petalLight(p, save);
  const placed = PETALS.filter((pt) => petalComplete(pt, save)).length;

  useEffect(() => {
    playMusic("world_blossom");
    const t = setTimeout(() => setNudge(true), 6000); // invite a look at the chart
    if (celebrate?.won) {
      (async () => {
        sfx.fanfare();
        fx.rain("petals", 50);
        await say({ line: "trial_win" });
        const pt = celebratePetal;
        if (pt && petalComplete(pt)) {
          sfx.gong();
          fx.rain("confetti", 90);
          await say({ line: "petal_complete" });
        }
        if (flowerComplete()) await say({ line: "flower_complete" });
      })();
    } else if (store.get().seenFlower) say({ line: "flower_tap" });
    return () => clearTimeout(t);
  }, []);

  const openPetal = (p: PhonemeId) => {
    sfx.petal();
    setOpen(petalOf(p));
    say({ sound: p });
  };
  const closeDetail = () => {
    // a petal that has just come home flies onto the flower when the child comes back to it
    if (open && celebrate?.won && open === celebratePetal && petalComplete(open)) {
      setView(0);
      setLanding(open.p);
      setTimeout(() => fx.burst(700, 300, "sparks", 30), 500);
    }
    setOpen(null);
  };

  const next = () => {
    sfx.page();
    setNudge(false);
    setView(view ? 0 : 1);
  };

  return (
    <div className="scene" style={{ background: "#f7ddd0", overflow: "hidden" }}>
      <img className="bg-img" src={img("world_flower_bg")} alt="" style={{ filter: view === 0 ? "saturate(.85) brightness(1.05)" : "saturate(.6) brightness(1.1) blur(3px)" }} />
      <div className="vignette" />

      {view === 0 ? (
        // the World Flower, big: one tap target, the nearest petal opens
        <div key="flower" className="pop-in" style={{ position: "absolute", left: 405, top: 26, width: 580, height: 580 }}>
          <WorldFlower light={light} ready={ready} landing={landing} count={[placed, PETALS.length]} onPetal={openPetal} label="The World Flower: tap a petal" />
        </div>
      ) : (
        <PetalScroll save={save} known={known} onOpen={(pt) => setOpen(pt)} light={light} placed={placed} focus={focus} />
      )}

      {/* switch between the flower and the scroll (clear of the scroll band and of the Help corner) */}
      <div style={{ position: "absolute", right: 16, top: 424 }}>
        <RoundButton label={view === 0 ? "Petal chart" : "The World Flower"} className={`pink ${view === 0 && nudge ? "pulse" : ""}`} onClick={next}>
          {view === 0 ? <ChartIcon /> : <FlowerIcon />}
        </RoundButton>
      </div>

      {intro && (
        <FlowerIntro
          onDone={() => {
            store.set((s) => void (s.seenFlower = true));
            setIntro(false);
            say({ line: "flower_tap" });
          }}
        />
      )}
      {open && <PetalDetail pt={open} gem={celebrate?.gem ?? focus?.gem ?? null} onClose={closeDetail} onTrial={onTrial} celebrateGem={celebrate?.won ? celebrate.gem : undefined} />}

      <div className="topbar">
        <RoundButton sm label="back" onClick={onBack}><Icon.home /></RoundButton>
      </div>
      <SenseiDock hidden />
    </div>
  );
}

/** The petal chart as a ninja scroll: one row of big petals in the school sheet's order, swiped sideways. */
function PetalScroll({ save, known, onOpen, light, placed, focus }: { save: Save; known: Set<string>; onOpen: (p: Petal) => void; light: (p: PhonemeId) => number; placed: number; focus?: { gem: string; how: "glow" | "celebrate" } | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(() => !hintSeen() && !focus);
  const touched = useRef(!!focus);
  const userSwiped = useRef(false);
  const swipeFrom = useRef(0);
  useEffect(() => {
    const el = ref.current!;
    if (focus) {
      // move the focused gem's petal to the middle of the scroll, then let it glow
      const pt = PETALS.find((x) => x.gems.some((g) => g.key === focus.gem));
      const target = pt && (el.querySelector(`[data-p="${pt.p}"]`) as HTMLElement | null);
      if (target) {
        const box = el.getBoundingClientRect(), t = target.getBoundingClientRect(), k = box.width / el.clientWidth; // the stage is scaled
        const left = el.scrollLeft + (t.left - box.left) / k - (el.clientWidth - t.width / k) / 2;
        setTimeout(() => el.scrollTo({ left, behavior: "smooth" }), 350);
        if (focus.how === "celebrate") setTimeout(() => (sfx.fanfare(), fx.burst(640, 230, "sparks", 36)), 1100);
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
                  <ScrollPetal key={c.p} p={c.p} save={save} known={known} onOpen={onOpen} focusGem={focus?.gem} />
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
 * One petal up close: the sound, its picture, and every spelling as a gem (tap a ready gem for its Gem Trial).
 * `gem` is the focused gem (it glows). The words / actions / explanation slots come from petalDetailSlots() and
 * render in their own labelled areas when a follow-up provides them.
 */
export function PetalDetail({ pt, gem, onClose, onTrial, celebrateGem }: { pt: Petal; gem?: string | null; onClose: () => void; onTrial: (key: string) => void; celebrateGem?: string }) {
  const save = useSave((s) => s);
  const known = knownNow(save);
  const slots = petalDetailSlots(pt, pt.gems.find((g) => g.key === gem) ?? null, save);
  const c = chartOf(pt.p);
  const example = WORDS.find((w) => w.pic && w.segs.some((s) => s.p === pt.p));
  const tapGem = (key: string) => {
    const gem = pt.gems.find((g) => g.key === key)!;
    const st = gemState(gem, save, known);
    if (st === "ready") {
      sfx.great();
      onTrial(key);
    } else if (st === "won") say({ sound: pt.p });
    else if (st === "charging") say([{ sound: pt.p }, { gap: 200 }, { line: "gem_charging" }]);
    else if (st === "hidden") say({ line: "gem_hidden" });
    else say({ line: "gem_future" });
  };
  const n = pt.gems.length;
  return (
    <div data-modal style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(29,18,48,.55)" }} {...tapProps(onClose)}>
      <div className="sheet pop-in" onPointerDown={(e) => e.stopPropagation()} style={{ position: "absolute", left: 340, right: 160, top: 28, bottom: 28, padding: 20, display: "flex", gap: 16 }}>
        <div style={{ width: 220, flex: "none", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div {...tapProps(() => say({ sound: pt.p }))} style={{ position: "relative", cursor: "pointer" }}>
            <svg viewBox="-110 -160 220 320" width="190" height="276" style={{ overflow: "visible" }}>
              <path d={teardrop(200, 300)} fill="#fff" stroke={c.colour} strokeWidth={9} />
              <text x="0" y="-40" textAnchor="middle" fontFamily="Andika, sans-serif" fontWeight={700} fontSize={PHONEMES[pt.p].label.length > 2 ? 60 : 78} fill={c.colour} style={{ paintOrder: "stroke", stroke: "#2b1d14", strokeWidth: 3 }}>
                {PHONEMES[pt.p].label}
              </text>
            </svg>
            <img src={img(`petal_${pt.p}`)} alt="" style={{ position: "absolute", left: 47, top: 114, width: 96, height: 96, objectFit: "contain" }} onError={(e) => (e.currentTarget.style.display = "none")} />
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <RoundButton label="Hear the sound" onClick={() => say({ sound: pt.p })}><Icon.speaker /></RoundButton>
            {example && <img src={img(`pic_${example.text}`)} alt="" style={{ width: 84, height: 84, objectFit: "contain", cursor: "pointer" }} {...tapProps(() => say({ word: example.text }))} />}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexWrap: "wrap", alignContent: "center", justifyContent: "center", gap: 6, marginRight: 56 }}>
          {pt.gems.map((g) => {
            const st = gemState(g, save, known);
            return (
              <div key={g.key + g.g} role="button" aria-label={`gem ${g.g} ${st}`} {...tapProps(() => tapGem(g.key))} className={g.key === celebrateGem ? "pop-in" : ""} style={{ textAlign: "center", cursor: "pointer" }}>
                {met(st) ? (
                  <GemIcon g={g.g} colour={c.colour} state={st} energy={energyOf(g.key, save)} size={n > 8 ? 104 : n > 5 ? 122 : n > 3 ? 140 : 170} style={g.key === gem ? { filter: "drop-shadow(0 0 14px #ffc53d)" } : undefined} />
                ) : (
                  <div style={{ width: n > 8 ? 104 : n > 5 ? 122 : n > 3 ? 140 : 170, display: "grid", placeItems: "center", aspectRatio: "1" }}>
                    <DarkCrystal size={(n > 8 ? 104 : n > 5 ? 122 : n > 3 ? 140 : 170) * 0.55} />
                  </div>
                )}
                {st === "ready" && (
                  <div className="btn-round go pulse" style={{ width: 78, height: 78, margin: "-6px auto 0" }}>
                    <Icon.play />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* extension slots (petalDetailSlots): words met with this sound, actions such as Practise, and an explanation */}
        {(slots.words || slots.actions || slots.explanation) && (
          <div data-slot="petal-extras" style={{ width: 260, flex: "none", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
            {slots.words && <section data-slot="words">{slots.words}</section>}
            {slots.actions && <section data-slot="actions">{slots.actions}</section>}
            {slots.explanation && <section data-slot="explanation">{slots.explanation}</section>}
          </div>
        )}
        <div style={{ position: "absolute", right: 14, top: 14 }}>
          <RoundButton sm label="close" onClick={onClose}><Icon.check /></RoundButton>
        </div>
      </div>
    </div>
  );
}

export { neededGems };
