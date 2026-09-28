// A sound, shown to a child as its petal (docs/SOUND_DISPLAY.md, docs/NAVIGATION.md §4): the teardrop in its
// school-chart colour with the chart picture in its round top, never letters. Spellings (gems, tiles, chests) still show
// letters; that is the point. Everything here animates transform and opacity only (docs/PERF.md): one-shot moves are
// Web Animations on HTML wrappers, the only endless one is the breathing pulse (a scale), and nothing runs a rAF loop.
//
// - SoundBadge: one sound's petal in five tiers (hero, turn, header, pop, mini); mist with "?" for a sound not met yet
//   (never a blank petal); the introduction animation (`intro`, SD §4.6); a join-in tap (`wait`, `busy`); /ks/ and /kw/
//   drawn as pairs (Dec7). A turn or header petal steps aside while a hero, BigPetal or pop of its sound is up (SD A7).
// - SoundPair: two sounds side by side: a contrast (the first dims and shakes when the second plays) or together (+).
// - SoundDots: neutral dots for oral blending, one per sound (Dec1: no petals while the sounds are the question).
// - SoundRow: a row of petals: the Dojo's misty petals waiting their turn, the Learn's two mini petals (Dec6).
// - SoundPops (NavLayer mounts it), popSound(), useSoundAnchor(): a "petal" sound with no petal of it on screen pops
//   one above its anchor 150 ms before the clip; it leaves 700 ms after the clip ends (SD §4.4).
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { PHONEMES, type PhonemeId } from "../content/phonics";
import { onClip, onSoundCue, onSay, onSpeaking, isSpeaking, say, sfx, type SoundAt } from "../engine/audio";
import { FAST } from "../engine/fast";
import { Icon, tapProps, fx, stageRect, W, H } from "./ui";
import { mix, petalColour, petalImg, teardropAt, hasPetal, MIST } from "./petal";

// ---------------------------------------------------------------- sizes
export type SoundTier = "hero" | "turn" | "header" | "pop" | "mini";
/** Default widths in stage px (SD §4.2): a sound being taught (hero), a turn's sound (the nav row), a header (a top bar,
 *  a land's recap), a pop (a correction, Help, a reminder) and a mini petal (a row: W6's dots, the Dojo tally). */
export const TIER_WIDTH: Record<SoundTier, number> = { hero: 220, turn: 104, header: 104, pop: 104, mini: 72 };
/** Dec1: oral blending shows no petals while the sounds play (W5, Ninja Run's blend mode): neutral SoundDots instead. */
export const ORAL_BLEND_PETALS = false;
/** Height of a badge `size` wide (the chart's teardrop: 96 × 132). */
export const badgeHeight = (size: number) => Math.round(size * 1.375);
/** The picture's share of the width, centred in the round top. SD §4.2 says 70%; that is kept on the big petals, but a
 *  touch phone's stage is scaled to 0.49, not 0.54 (844×390 less the safe edges: ui.tsx Stage), so below 160 px wide the
 *  picture is 77%: a 104 petal's picture is then 80 stage px, 39 CSS px on the phone (≥ 38), and a mini's 27. */
export const picShare = (w: number) => (w >= 160 ? 0.7 : 0.77);
/** The speaker glyph in the point: only on petals this wide (a hero); smaller petals are wholly the button. */
export const SPEAKER_FROM = 160;
/** Sounds that are two sounds (Dec7): never a petal of their own, always a pair with a "+". */
export const PAIRS: Readonly<Record<string, readonly [PhonemeId, PhonemeId]>> = { ks: ["k", "s"], kw: ["k", "w"] };
const tierOfSize = (w: number): SoundTier => (w >= 160 ? "hero" : w <= 80 ? "mini" : "turn");

// ---------------------------------------------------------------- motion helpers (compositor only)
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
function play(el: Element | null | undefined, frames: Keyframe[], o: KeyframeAnimationOptions): Animation | null {
  const h = el as HTMLElement | null | undefined;
  if (!h || typeof h.animate !== "function") return null;
  try {
    return h.animate(frames, o);
  } catch {
    return null;
  }
}
const SWELL: Keyframe[] = [{ transform: "scale(1)" }, { transform: "scale(1.14)", offset: 0.4 }, { transform: "scale(1)" }];
const NOD: Keyframe[] = [{ transform: "rotate(0deg)" }, { transform: "rotate(-9deg)", offset: 0.3 }, { transform: "rotate(6deg)", offset: 0.65 }, { transform: "rotate(0deg)" }];
const SHAKE: Keyframe[] = [{ transform: "translateX(0)" }, { transform: "translateX(-8%)", offset: 0.18 }, { transform: "translateX(7%)", offset: 0.42 }, { transform: "translateX(-4%)", offset: 0.66 }, { transform: "translateX(0)" }];
const swell = (el: Element | null | undefined) => play(el, SWELL, { duration: 300, easing: "ease-out" });

/** Is this element on screen for a child: laid out, in the viewport, not hidden or see-through? */
function visible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  if (r.width < 6 || r.height < 6 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
  for (let e: Element | null = el; e; e = e.parentElement) {
    const s = getComputedStyle(e);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.25) return false;
  }
  return true;
}
/** Is a petal of this sound on screen (a SoundBadge, a BigPetal, a World Flower or scroll petal with its picture)? The
 *  same test as the sweep's sound-without-petal (scripts/treadmill/sweep.ts). */
export function petalOnScreen(p: string): boolean {
  if (typeof document === "undefined") return false;
  const q = (s: string) => [...document.querySelectorAll(s)].filter((e) => !e.closest(".sound-pop.leaving")); // (a pop on its way out won't be there for the sound)
  return (
    q(`.sound-badge[data-p="${p}"], [data-petal="${p}"]`).some(visible) ||
    q(`[role="button"][data-p="${p}"]`).some((e) => !!e.querySelector("img") && visible(e)) ||
    q(`svg path[data-p="${p}"]`).some((e) => !!e.parentElement?.querySelector("image") && visible(e))
  );
}

// ---------------------------------------------------------------- the drawing
const inkOf = (w: number) => Math.max(5, (15 * w) / 200); // the chart look (Tree.tsx .pd-petal): a colour line over ink
const lineOf = (w: number) => Math.max(3, (9 * w) / 200);
const shadowOf = (w: number) => Math.max(3, Math.min(6, w * 0.035));
/** The teardrop in its chart colour (the shadow is drawn in, not a filter). */
function PetalShape({ w, h, p }: { w: number; h: number; p: PhonemeId }) {
  const ink = inkOf(w);
  const d = teardropAt(w - ink, h - ink, w / 2, h / 2);
  const colour = petalColour(p);
  return (
    <svg className="sb-shape" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <path d={d} transform={`translate(0 ${shadowOf(w)})`} fill="rgba(43,29,20,0.28)" />
      <path d={d} fill="#fff" stroke="#2b1d14" strokeWidth={ink} strokeLinejoin="round" />
      <path d={d} fill={mix(colour, "#ffffff", 0.82)} stroke={colour} strokeWidth={lineOf(w)} strokeLinejoin="round" />
    </svg>
  );
}
/** A sound not met yet: grey-lilac mist with soft clouds and a "?" (as on the flower and the scroll). Static. */
function MistArt({ w, h, uid, shadow }: { w: number; h: number; uid: string; shadow?: boolean }) {
  const ink = inkOf(w);
  const d = teardropAt(w - ink, h - ink, w / 2, h / 2);
  const cy = w / 2;
  return (
    <svg className="sb-shape" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={MIST.fill} />
          <stop offset="1" stopColor={MIST.deep} />
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      {shadow && <path d={d} transform={`translate(0 ${shadowOf(w)})`} fill="rgba(43,29,20,0.28)" />}
      <path d={d} fill="#fff" stroke="#2b1d14" strokeWidth={ink} strokeLinejoin="round" />
      <path d={d} fill={`url(#${uid}g)`} stroke={MIST.line} strokeWidth={lineOf(w)} strokeLinejoin="round" />
      <g clipPath={`url(#${uid}c)`} fill="#fff">
        <ellipse cx={w * 0.3} cy={cy - w * 0.2} rx={w * 0.26} ry={w * 0.1} opacity={0.2} />
        <ellipse cx={w * 0.72} cy={cy + w * 0.12} rx={w * 0.24} ry={w * 0.09} opacity={0.16} />
        <ellipse cx={w * 0.42} cy={h * 0.7} rx={w * 0.2} ry={w * 0.08} opacity={0.14} />
      </g>
      <text x={w / 2} y={cy + w * 0.16} textAnchor="middle" fontFamily="'Luckiest Guy', sans-serif" fontSize={w * 0.46} fill={MIST.q} stroke="#2b1d14" strokeWidth={Math.max(3, w * 0.035)} strokeLinejoin="round" paintOrder="stroke">
        ?
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------- the nav row's duplicate (SD A7)
const bigSel = (p: string) => `.sound-badge[data-tier="hero"][data-p="${p}"], .sound-pop .sound-badge[data-p="${p}"], .big-petal[data-petal="${p}"], .big-petal[data-p="${p}"]`;
/** True while a hero, BigPetal or pop of this sound is on screen (of every one of them, for a pair: "k s"). Checked when
 *  the stage's DOM changes (a MutationObserver, debounced) and when a clip starts: no polling, no rAF. */
function useDupHidden(p: string, on: boolean): boolean {
  const [dup, setDup] = useState(false);
  useEffect(() => {
    if (!on || typeof MutationObserver === "undefined") return void setDup(false);
    let t = 0, t2 = 0;
    const check = () => setDup(p.split(" ").every((s) => [...document.querySelectorAll(bigSel(s))].some(visible)));
    // soon after a change, and again once a hero's pop-in has faded up
    const soon = () => {
      t ||= window.setTimeout(() => ((t = 0), check()), 60);
      t2 ||= window.setTimeout(() => ((t2 = 0), check()), 450);
    };
    check();
    soon();
    const mo = new MutationObserver(soon);
    mo.observe(document.querySelector(".stage") ?? document.body, { childList: true, subtree: true });
    const off = onClip(soon);
    return () => {
      mo.disconnect();
      off();
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [p, on]);
  return dup;
}

// ---------------------------------------------------------------- SoundBadge
export interface SoundBadgeProps {
  /** The sound. "ks" and "kw" are two sounds: they draw a SoundPair (Dec7). A sound with no chart petal draws mist. */
  p: PhonemeId | string;
  /** The size class (default: from `size`, else "turn"). */
  tier?: SoundTier;
  /** Width in stage px (default: the tier's, TIER_WIDTH); the height is badgeHeight(size). */
  size?: number;
  /** The introduction animation (SD §4.6), for the first time a child meets this sound: the petal appears in the mist,
   *  and blooms on the next `sound:<p>` clip (the mist wipes up, the colour fills from the point, the picture pops, a
   *  ring and six twinkles), then breathes until the first tap. Reduced motion: a 300 ms cross-fade. */
  intro?: boolean;
  /** A sound not met yet: grey-lilac mist with "?" (no picture, no data-p: it names nothing). */
  unknown?: boolean;
  /** The attention bounce. */
  pulse?: boolean;
  /** A join-in: Sensei is waiting for the child to tap the petal ("Tap the petal, and say it with me."). It breathes until
   *  tapped; the tap says the sound (or `onTap`). */
  wait?: boolean;
  /** Sensei is explaining: a tap nods the petal with a tink and never cuts her off (SD §4.3). */
  busy?: boolean;
  /** The first sound of a contrast ("That's /s/…" once "…/m/" plays): dimmed, and it shakes once as it dims. */
  dim?: boolean;
  /** A picture only (a caption, a list): no button, no speaker, never hidden as a duplicate. */
  still?: boolean;
  /** Drawn but not a button (a pop over a tile must never catch the tile's tap). */
  passive?: boolean;
  /** The speaker glyph in the point (default: from SPEAKER_FROM px wide). */
  speaker?: boolean;
  /** Float in from this element as it mounts (a misty row petal floating down to the middle): transform only. */
  from?: Element | null;
  /** More clip ids that swell it (a pair's own clip, "sound:ks"). */
  also?: string[];
  /** Replaces the tap's default (say the pure sound, marked "petal"). */
  onTap?: () => void;
  /** A pair (/ks/): drawn at full size, the two petals side by side with room for the "+" between their pictures (2.3 ×
   *  `size` wide, spilling evenly either side of the badge's box), rather than fitted into the box's 1.8 × `size`. For a
   *  layout that makes room for it (the nav row: nav.tsx pairSlot). */
  spread?: boolean;
  /** Never steps aside as a duplicate (SD A7): a pair's halves, whose pair decides for both. */
  nodup?: boolean;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

/**
 * `<SoundBadge p="s" tier="turn" />`: the sound's petal. A tap says the pure sound (`say({ sound, show: "petal" })`); it
 * swells whenever its sound's clip starts, from anywhere, so the picture and the sound arrive together. `data-p`,
 * `data-tier`, `data-nav="sound"`, `aria-label` "Hear the sound"; grown-ups get /ae/ as a tooltip, children see no letters.
 */
export function SoundBadge(props: SoundBadgeProps) {
  const pair = PAIRS[props.p];
  if (pair) return <PairBadge {...props} pair={pair} />;
  return <Badge {...props} />;
}
/** How wide a sound is drawn at `size` (or its tier's width): a pair (/ks/) is wider than its box, and spills evenly
 *  either side of it, so a layout that puts something beside it should leave this much room. */
export function soundWidth(p: string, size?: number, tier?: SoundTier, spread?: boolean): number {
  const w = size ?? TIER_WIDTH[tier ?? "turn"];
  if (!PAIRS[p]) return w;
  const t = tier ?? tierOfSize(w);
  if (spread) return pairWidth(w, "together");
  const half = t === "hero" ? Math.round(w * 0.66) : w;
  return t === "hero" ? pairWidth(half, "together") : half * 1.8;
}

/**
 * < x > (/ks/) and /kw/: two sounds, so two petals with a "+" (Dec7), and ONE button: a tap says the pair's sound, and
 * both petals swell on it. (Two buttons would overlap in a nav slot, and each would say half of the spelling's sound.)
 * The pair steps aside while both its sounds are shown big elsewhere (the Dojo's hero pair, a pop of the pair).
 */
function PairBadge({ p, pair, tier: tierIn, size, pulse, wait, busy, still, passive, spread, nodup, onTap, className = "", style, label = "Hear the sound" }: SoundBadgeProps & { pair: readonly [PhonemeId, PhonemeId] }) {
  const w = size ?? TIER_WIDTH[tierIn ?? "turn"];
  const t = tierIn ?? tierOfSize(w);
  // (a hero pair is two smaller petals, so the pair stays about 1.5 heroes wide)
  const half = spread ? w : t === "hero" ? Math.round(w * 0.66) : w;
  const inert = !!(still || passive);
  const dup = useDupHidden(pair.join(" "), (t === "turn" || t === "header") && !inert && !nodup);
  const [waitTapped, setWaitTapped] = useState(false);
  useEffect(() => void (wait && setWaitTapped(false)), [wait]);
  const nodRef = useRef<HTMLSpanElement>(null);
  // the pair's own footprint, centred on the box (as the badge it stands in for)
  const { total: tw, h: th } = pairBox(half, t, "together", spread);
  const at: CSSProperties = { position: "absolute", left: (w - tw) / 2, top: (badgeHeight(w) - th) / 2, width: tw, height: th };
  const drawn = <SoundPair a={pair[0]} b={pair[1]} mode="together" tier={t} size={half} passive nodup spread={spread} also={[`sound:${p}`]} />;
  const box: CSSProperties = { position: "relative", display: "inline-block", width: w, height: badgeHeight(w), ...style };
  if (inert)
    return (
      <span className={`sound-pair-box ${className}`} style={box}>
        <span style={at}>{drawn}</span>
      </span>
    );
  const tap = () => {
    if (wait) setWaitTapped(true);
    if (busy) {
      play(nodRef.current, NOD, { duration: 380, easing: "ease-in-out" });
      sfx.tink();
      return;
    }
    if (onTap) return onTap();
    void say({ sound: p as PhonemeId, show: "petal" });
  };
  const breathe = !reduced() && !!wait && !waitTapped;
  // one button over exactly what the child sees (the two petals and the "+")
  return (
    <span className={`sound-pair-box ${className}`} style={box}>
      <button
        className={`sound-badge sound-pair-btn tier-${t} ${pulse ? "pulse" : ""} ${dup ? "dup" : ""}`}
        aria-label={label}
        data-nav="sound"
        data-p={p}
        data-tier={t}
        title={`/${PHONEMES[p as PhonemeId]?.label ?? p}/`}
        style={at}
        {...tapProps(tap)}
      >
        <span ref={nodRef} className={`spb-nod ${breathe ? "breathe" : ""}`}>
          {drawn}
        </span>
      </button>
    </span>
  );
}
/** A pair's geometry for halves `w` wide (SD §4.5): each petal `s` wide, `gap` apart, `total` wide and `h` tall, and its
 *  "+" (`plus` wide, centred at `plusX`, `plusY`). A compact pair (turn and header tiers, not `spread`) fits into 1.8 ×
 *  `w` for a nav slot: two petals 12 % apart that never overlap, the "+" low in the notch between them, clear of both
 *  pictures. Every other pair draws its petals at `w`, a together pair's 0.3 × `w` apart with the "+" between the
 *  pictures. */
function pairBox(w: number, t: SoundTier, mode: "contrast" | "together", spread?: boolean) {
  const compact = !spread && (t === "turn" || t === "header");
  const s = compact ? (w * 1.8) / 2.12 : w;
  const gap = compact || mode === "contrast" ? s * 0.12 : s * 0.3;
  const plus = compact ? s * 0.34 : s * 0.3; // (in the 0.3 gap: it sits between the pictures, touching neither)
  return { compact, s, gap, total: 2 * s + gap, h: badgeHeight(s), plus, plusX: s + gap / 2, plusY: compact ? s * 0.93 : s * 0.5 };
}

function Badge({ p, tier: tierIn, size, intro, unknown, pulse, wait, busy, dim, still, passive, speaker, from, also, onTap, nodup, className = "", style, label = "Hear the sound" }: SoundBadgeProps) {
  const w = size ?? TIER_WIDTH[tierIn ?? "turn"];
  const tier = tierIn ?? tierOfSize(w);
  const h = badgeHeight(w);
  const known = hasPetal(p);
  const misty = !!unknown || !known;
  const [phase, setPhase] = useState<"mist" | "bloom" | "done">(intro && !misty ? "mist" : "done");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [tapped, setTapped] = useState(false);
  const [waitTapped, setWaitTapped] = useState(false);
  useEffect(() => void (wait && setWaitTapped(false)), [wait]);
  const uid = "sb" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef<HTMLElement>(null);
  const inRef = useRef<HTMLSpanElement>(null);
  const swellRef = useRef<HTMLSpanElement>(null);
  const breatheRef = useRef<HTMLSpanElement>(null);
  const picRef = useRef<HTMLSpanElement>(null);
  const mistRef = useRef<HTMLSpanElement>(null);
  const mistInRef = useRef<HTMLSpanElement>(null);
  const dup = useDupHidden(p, (tier === "turn" || tier === "header") && !still && !nodup && known);

  // its clip: the introduction's bloom the first time, then a swell every time
  const alsoKey = (also ?? []).join(",");
  useEffect(() => {
    const ids = new Set([`sound:${p}`, ...(also ?? [])]);
    return onClip((id, _start, _end, info) => {
      if (!ids.has(id)) return;
      if (phaseRef.current === "mist") {
        if (id === `sound:${p}` && info?.show !== "tile" && info?.show !== "hidden") setPhase("bloom");
        return;
      }
      if (phaseRef.current === "done") swell(swellRef.current);
    });
  }, [p, alsoKey]);
  // (never mist for ever: if its clip never plays, say the audio failed to load, it blooms after 20 s anyway)
  useEffect(() => {
    if (phase !== "mist") return;
    const t = setTimeout(() => phaseRef.current === "mist" && setPhase("bloom"), 20_000);
    return () => clearTimeout(t);
  }, [phase]);

  // arrival: the introduction's mist grows in (0.6 → 1, 250 ms); `from`: float from there (FLIP, transform only)
  useLayoutEffect(() => {
    if (phase === "mist" && !reduced()) play(breatheRef.current, [{ transform: "scale(0.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 250, easing: "cubic-bezier(.3,1.5,.6,1)" });
    const el = inRef.current;
    if (!el || !from || !from.isConnected) return;
    const a = from.getBoundingClientRect(), b = el.getBoundingClientRect();
    if (!b.width || !a.width) return;
    const k = b.width / w; // client px per stage px
    const dx = (a.left + a.width / 2 - (b.left + b.width / 2)) / k, dy = (a.top + a.height / 2 - (b.top + b.height / 2)) / k, s = a.width / b.width;
    play(el, [{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: `translate(${dx * 0.35}px, ${dy * 0.55}px) scale(${(s + 1) / 2})`, offset: 0.5 }, { transform: "none" }], { duration: reduced() ? 1 : 850, easing: "cubic-bezier(.45,.05,.3,1)" });
  }, []);

  // the bloom (SD §4.6), all within about 350 ms of the sound's onset
  useLayoutEffect(() => {
    if (phase !== "bloom") return;
    const red = reduced();
    if (red) {
      play(mistRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
      play(picRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "backwards" });
    } else {
      const ease = "cubic-bezier(.55,0,.35,1)";
      // the mist's window slides up while its content stays put: the mist wipes up from the point, and the colour
      // underneath fills in from the point upwards
      play(mistRef.current, [{ transform: "translateY(0)" }, { transform: `translateY(${-h}px)` }], { duration: 380, easing: ease, fill: "forwards" });
      play(mistInRef.current, [{ transform: "translateY(0)" }, { transform: `translateY(${h}px)` }], { duration: 380, easing: ease, fill: "forwards" });
      play(picRef.current, [{ transform: "scale(0.4)", opacity: 0 }, { transform: "scale(1.12)", opacity: 1, offset: 0.6 }, { transform: "scale(1)", opacity: 1 }], { duration: 440, delay: 40, easing: "cubic-bezier(.3,1.25,.5,1)", fill: "backwards" });
      const el = root.current;
      if (el) {
        const r = stageRect(el), k = w / 220, c = petalColour(p as PhonemeId);
        const x = r.x + r.w / 2, y = r.y + r.w / 2; // the round top's centre (the box is w wide; the circle is w/2 down)
        fx.ring(x, y, { color: c, r0: 40 * k, r1: 220 * k, width: Math.max(6, 12 * k), life: 26 });
        fx.twinkle(x, y, [c, "#fff4dc", "#ffe38a"], 6, 3 + 5 * k, 14 + 16 * k);
      }
    }
    const t = setTimeout(() => setPhase("done"), red ? 320 : 480);
    return () => clearTimeout(t);
  }, [phase]);

  // the first sound of a contrast: shake once as it dims
  const dimmed = useRef(false);
  useEffect(() => {
    if (dim && !dimmed.current && !reduced()) play(swellRef.current, SHAKE, { duration: 440, easing: "ease-in-out" });
    dimmed.current = !!dim;
  }, [dim]);

  const tap = () => {
    setTapped(true);
    if (wait) setWaitTapped(true);
    if (busy || (!onTap && (misty || phaseRef.current !== "done"))) {
      play(swellRef.current, NOD, { duration: 380, easing: "ease-in-out" });
      sfx.tink();
      return;
    }
    if (onTap) return onTap();
    void say({ sound: p as PhonemeId, show: "petal" });
  };

  const pic = w * picShare(w);
  const withSpeaker = !still && !passive && !misty && (speaker ?? w >= SPEAKER_FROM);
  const sp = w * 0.2;
  const breathe = !still && !passive && !reduced() && ((!!intro && phase === "done" && !tapped) || (!!wait && !waitTapped));
  const mistOn = misty || phase !== "done";
  const inner = (
    <span ref={inRef} className="sb-in">
      <span ref={swellRef} className="sb-swell">
        <span ref={breatheRef} className={`sb-breathe ${breathe ? "breathe" : ""}`}>
          {!misty && <PetalShape w={w} h={h} p={p as PhonemeId} />}
          {!misty && (
            <span ref={picRef} className={`sb-pic ${phase === "mist" ? "hid" : ""}`} style={{ left: (w - pic) / 2, top: w / 2 - pic / 2, width: pic, height: pic }}>
              <img src={petalImg(p as PhonemeId)} alt="" draggable={false} onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
            </span>
          )}
          {withSpeaker && phase === "done" && (
            <span className="sound-badge-hear" style={{ left: (w - sp) / 2, top: h * 0.735 - sp / 2, width: sp, height: sp, borderWidth: Math.max(3, sp * 0.08) }}>
              <Icon.speaker />
            </span>
          )}
          {mistOn && (
            <span ref={mistRef} className="sb-mist">
              <span ref={mistInRef} className="sb-mist-in">
                <MistArt w={w} h={h} uid={uid} shadow={misty} />
              </span>
            </span>
          )}
        </span>
      </span>
    </span>
  );
  const title = known ? `/${PHONEMES[p as PhonemeId]?.label ?? p}/` : undefined;
  const cls = `sound-badge tier-${tier} ${tier === "mini" ? "mini" : ""} ${pulse ? "pulse" : ""} ${dim ? "dim" : ""} ${dup ? "dup" : ""} ${misty ? "misty" : ""} ${className}`;
  const data = { "data-p": misty ? undefined : p, "data-mist": misty ? p : undefined, "data-tier": tier };
  if (still || passive)
    return (
      <span ref={root as RefObject<HTMLSpanElement>} className={`${cls} ${still ? "still" : "passive"}`} {...data} title={title} aria-hidden="true" style={{ width: w, height: h, ...style }}>
        {inner}
      </span>
    );
  return (
    <button ref={root as RefObject<HTMLButtonElement>} className={cls} aria-label={label} data-nav="sound" {...data} title={title} style={{ width: w, height: h, ...style }} {...tapProps(tap)}>
      {inner}
    </button>
  );
}

// ---------------------------------------------------------------- SoundPair (SD §4.5)
/**
 * Two sounds side by side, in the order they are said. `contrast` ("That's /s/. We need /m/.", "This can be /th/, but
 * in this word, it's /dh/."): the first dims and shakes once when the second's clip plays (or at once with `dim`).
 * `together` (< x >: /k/ + /s/): a small gold "+" between them, both bright. `appear: "clip"`: each half pops in as its
 * own clip starts (a half already there just swells). Turn and header pairs overlap a little so the pictures keep their
 * size in a nav slot. `centred`: the width of a box to centre it on (SoundBadge draws /ks/ this way, spilling evenly).
 */
export function SoundPair({ a, b, mode = "contrast", tier, size, appear = "now", dim, hideB, passive, also, centred, spread, nodup, className = "", style }: {
  a: PhonemeId;
  b: PhonemeId;
  mode?: "contrast" | "together";
  tier?: SoundTier;
  size?: number;
  appear?: "now" | "clip";
  dim?: boolean;
  /** Keep the second half hidden (a pop waiting for its second sound). */
  hideB?: boolean;
  passive?: boolean;
  also?: string[];
  centred?: number;
  /** Full-size petals even at a turn or header tier (see SoundBadge's `spread`). */
  spread?: boolean;
  /** The halves never step aside as duplicates (a pair drawn as one button decides for both). */
  nodup?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const w0 = size ?? TIER_WIDTH[tier ?? "turn"];
  const t = tier ?? tierOfSize(w0);
  const { compact, s: w, gap, total, h, plus, plusX, plusY } = pairBox(w0, t, mode, spread);
  const [shown, setShown] = useState<[boolean, boolean]>(appear === "now" ? [true, true] : [false, false]);
  const [dimA, setDimA] = useState(false);
  const alsoKey = (also ?? []).join(",");
  useEffect(
    () =>
      onClip((id) => {
        if (id === `sound:${a}`) setShown((s) => (s[0] ? s : [true, s[1]]));
        else if (id === `sound:${b}`) {
          setShown((s) => (s[1] ? s : [s[0], true]));
          if (mode === "contrast") setDimA(true);
        } else if (also?.includes(id)) setShown([true, true]);
      }),
    [a, b, mode, alsoKey],
  );
  const offset = w + gap; // where the second half starts: side by side, never overlapping (SD §4.5)
  const showB = shown[1] && !hideB;
  return (
    <span
      className={`sound-pair ${mode} ${compact ? "compact" : ""} ${className}`}
      data-pair={`${a}+${b}`}
      style={{ width: total, height: h, ...(centred ? { position: "absolute", left: (centred - total) / 2, top: (badgeHeight(centred) - h) / 2 } : null), ...style }}
    >
      <span className={`sp-half b ${showB ? "" : "hid"}`} style={{ left: offset }}>
        <SoundBadge p={b} tier={t} size={w} passive={passive} nodup={nodup} also={also} />
      </span>
      <span className={`sp-half a ${shown[0] ? "" : "hid"}`} style={{ left: 0 }}>
        <SoundBadge p={a} tier={t} size={w} passive={passive} nodup={nodup} also={also} dim={mode === "contrast" && (dim || dimA)} />
      </span>
      {mode === "together" && (
        <i className="sp-plus" aria-hidden="true" style={{ left: plusX - plus / 2, top: plusY - plus / 2, width: plus, height: plus, borderWidth: Math.max(3, plus * 0.1) }} />
      )}
    </span>
  );
}

// ---------------------------------------------------------------- SoundDots (Dec1)
/**
 * Oral blending's neutral dots: one per sound, nothing that names a sound. `lit`: the dot whose sound is playing (the
 * ones before it stay softly lit; -1: none). `bloom`: after the right answer (or W6's sounded dots), a dot may become its
 * sound's mini petal. Scenes drive `lit` from `{ sounds, onSeg, show: "hidden" }`.
 */
export function SoundDots({ n, lit = -1, bloom, size = 40, gap, className = "", style }: { n: number; lit?: number; bloom?: readonly (PhonemeId | null | undefined)[]; size?: number; gap?: number; className?: string; style?: CSSProperties }) {
  const g = gap ?? size * 0.6;
  return (
    <span className={`sound-dots ${className}`} data-dots={n} aria-hidden="true" style={{ gap: g, height: bloom?.some(Boolean) ? badgeHeight(TIER_WIDTH.mini) : size, ...style }}>
      {Array.from({ length: n }, (_, i) => {
        const p = bloom?.[i];
        return p ? <SoundBadge key={`p${i}`} p={p} tier="mini" passive className="sd-bloom" /> : <i key={`d${i}`} className={`sd-dot ${i === lit ? "on" : i < lit ? "done" : ""}`} style={{ width: size, height: size }} />;
      })}
    </span>
  );
}

// ---------------------------------------------------------------- SoundRow
/**
 * A row of petals. `mist`: sounds waiting their turn (the Dojo lesson's four new sounds): grey-lilac mist with "?", no
 * pictures and nothing pulsing; `twinkle` (a counter) or `twinkleOn` (a clip id, `twinkleAt` s into it) makes them
 * twinkle one after another ("four new sounds"). `out`: the ones that have floated down (their place stays empty; pass
 * the slot as the hero's `from`, via `slotRef`). `lit`: how many are lit from the left, the rest faint (the Learn's two
 * mini petals under the letter, Dec6); each lights with a pop. Passive unless `onTap`.
 */
export function SoundRow({ ps, tier = "mini", size, mist, out, lit, twinkle, twinkleOn, twinkleAt = 0, gap, slotRef, onTap, className = "", style }: {
  ps: readonly PhonemeId[];
  tier?: SoundTier;
  size?: number;
  mist?: boolean;
  out?: readonly number[];
  lit?: number;
  twinkle?: number;
  twinkleOn?: string;
  twinkleAt?: number;
  gap?: number;
  slotRef?: (i: number, el: HTMLElement | null) => void;
  onTap?: (i: number) => void;
  className?: string;
  style?: CSSProperties;
}) {
  const w = size ?? TIER_WIDTH[tier];
  const h = badgeHeight(w);
  const slots = useRef<(HTMLElement | null)[]>([]);
  const sparkle = () => {
    if (reduced()) return;
    slots.current.forEach((el, i) => {
      if (!el || out?.includes(i)) return;
      setTimeout(() => {
        if (!el.isConnected) return;
        play(el.firstElementChild, [{ transform: "scale(1)" }, { transform: "scale(1.12) rotate(-4deg)", offset: 0.4 }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
        const r = stageRect(el);
        fx.twinkle(r.x + r.w / 2, r.y + r.w / 2, ["#f3eeff", "#fff4dc", "#cdbfe8"], 4, 3, 22);
      }, (i * 170) / FAST);
    });
  };
  const first = useRef(true);
  useEffect(() => {
    if (first.current) return void (first.current = false);
    sparkle();
  }, [twinkle]);
  useEffect(() => {
    if (!twinkleOn) return;
    let t = 0;
    const off = onClip((id) => void (id === twinkleOn && (t = window.setTimeout(sparkle, (twinkleAt * 1000) / FAST))));
    return () => (off(), clearTimeout(t));
  }, [twinkleOn, twinkleAt, out?.join()]);
  // a petal lighting up pops
  const litWas = useRef(lit ?? 0);
  useEffect(() => {
    const was = litWas.current;
    litWas.current = lit ?? 0;
    if (lit === undefined || lit <= was || reduced()) return;
    for (let i = was; i < lit; i++) play(slots.current[i]?.firstElementChild, [{ transform: "scale(0.7)" }, { transform: "scale(1.18)", offset: 0.55 }, { transform: "scale(1)" }], { duration: 380, easing: "cubic-bezier(.3,1.4,.5,1)" });
  }, [lit]);
  return (
    <span className={`sound-row ${mist ? "mist" : ""} ${className}`} data-row={ps.join(" ")} style={{ gap: gap ?? w * 0.22, height: h, ...style }}>
      {ps.map((p, i) => (
        <span
          key={i}
          className={`sr-slot ${lit !== undefined && i >= lit ? "unlit" : ""} ${out?.includes(i) ? "out" : ""}`}
          style={{ width: w, height: h }}
          ref={(el) => {
            slots.current[i] = el;
            slotRef?.(i, el);
          }}
        >
          {!out?.includes(i) && <SoundBadge p={p} tier={tier} size={w} unknown={mist} passive={!onTap} onTap={onTap ? () => onTap(i) : undefined} />}
        </span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------- pops (SD §4.4)
const RISE = 150; // ms a pop asks the sequence to wait: it rises (200 ms) and the sound lands on it
const GAP = 12; // a pop stands this far above its anchor's top edge
const LEAVE = 700; // ms after its clip ends
const LINGER = 3000; // a pop waits this long after its clip for a contrast partner in the same say()
const FALLBACK = { x: 1080, y: 470 }; // no anchor: just left of Sensei (the Help corner)
type Tail = "down" | "left" | "right" | "none";
interface Pop {
  id: number;
  p: PhonemeId;
  with?: PhonemeId;
  mode?: "contrast" | "together";
  withShown: boolean;
  at: Element | null;
  x: number;
  y: number;
  w: number;
  h: number;
  tail: Tail;
  /** the say() it belongs to (-1: an explicit popSound() that adopts the next say) */
  gen: number;
  born: number;
  clipEnd: number | null;
  dim: boolean;
  leaving: boolean;
  /** leaves together with this pop (the second of its contrast) */
  partner: number | null;
}
let pops: Pop[] = [];
let popSeq = 0;
let popVersion = 0;
const popSubs = new Set<() => void>();
const popBump = () => {
  popVersion++;
  popSubs.forEach((f) => f());
};
const anchors: RefObject<Element | null>[] = [];
/** The scene's default spot for a pop (the word card, the active slot), while the calling component is mounted. The
 *  newest mounted anchor wins. */
export function useSoundAnchor(ref: RefObject<Element | null>) {
  useEffect(() => {
    anchors.push(ref);
    return () => {
      const i = anchors.lastIndexOf(ref);
      if (i >= 0) anchors.splice(i, 1);
    };
  }, [ref]);
}
const sceneAnchor = (): Element | null => {
  for (let i = anchors.length - 1; i >= 0; i--) {
    const el = anchors[i].current;
    if (el?.isConnected) return el;
  }
  return null;
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** Where a pop `bw` × `bh` stands: above its anchor (the tail down at it); beside it when there's no room above; left
 *  of Sensei with no anchor. Always upright, always on the stage, never over the anchor. */
function placePop(at: Element | null, bw: number, bh: number): { x: number; y: number; tail: Tail } {
  if (!at || !at.isConnected) return { x: FALLBACK.x - bw / 2, y: FALLBACK.y - bh / 2, tail: "none" };
  const r = stageRect(at);
  let x = r.x + r.w / 2 - bw / 2, y = r.y - GAP - bh;
  let tail: Tail = "down";
  if (y < 6) {
    y = clamp(r.y + r.h / 2 - bh / 2, 6, H - bh - 6);
    x = r.x + r.w + GAP;
    tail = "left";
    if (x + bw > W - 6) {
      x = r.x - GAP - bw;
      tail = "right";
    }
  }
  return { x: clamp(x, 6, W - bw - 6), y, tail };
}
const pairWidth = (w: number, mode: "contrast" | "together") => 2 * w + (mode === "together" ? w * 0.3 : w * 0.12);
function addPop(o: { p: PhonemeId; with?: PhonemeId; mode?: "contrast" | "together"; withShown?: boolean; at: Element | null; gen: number }): Pop {
  const w = TIER_WIDTH.pop, h = badgeHeight(w);
  const bw = o.with ? pairWidth(w, o.mode ?? "contrast") : w;
  const pl = placePop(o.at, bw, h);
  // one pop per anchor: a new sound on the same anchor replaces the old one (unless it pairs with it)
  if (o.at) for (const q of pops) if (q.at === o.at && !q.leaving) leavePop(q, true);
  const pop: Pop = { id: ++popSeq, p: o.p, with: o.with, mode: o.mode, withShown: o.withShown ?? false, at: o.at, ...pl, w: bw, h, gen: o.gen, born: performance.now(), clipEnd: null, dim: false, leaving: false, partner: null };
  pops = [...pops, pop];
  popBump();
  // a pop whose clip never comes (the say was cut off) goes after 4 s
  setTimeout(() => pop.clipEnd === null && !pop.leaving && pop.partner === null && leavePop(pop), 4000 / FAST);
  return pop;
}
function leavePop(q: Pop, now = false) {
  if (q.leaving) return;
  q.leaving = true;
  pops = pops.map((x) => x);
  popBump();
  for (const o of pops) if (o.partner === q.id) leavePop(o, now);
  setTimeout(() => {
    pops = pops.filter((x) => x !== q);
    popBump();
  }, now ? 200 : 260);
}
/** Leave 700 ms after the clip ends, but linger (up to 3 s) while the same say() goes on: a contrast may be coming. */
function checkLeave(q: Pop) {
  if (q.leaving || q.partner !== null || q.clipEnd === null) return;
  const t = performance.now();
  const due = q.clipEnd + LEAVE / FAST;
  if (t < due - 5) return void setTimeout(() => checkLeave(q), due - t);
  if (q.gen === sayGen && isSpeaking() && t < q.clipEnd + LINGER / FAST) return void setTimeout(() => checkLeave(q), 250);
  leavePop(q);
}
function dimPop(q: Pop) {
  if (q.dim || q.leaving) return;
  q.dim = true;
  pops = pops.map((x) => x);
  popBump();
}
/** Clear every pop at once (NavLayer, when the screen changes). */
export function clearPops() {
  if (!pops.length) return;
  pops = [];
  popBump();
}
let sayGen = 0;
let popsLive = 0;
let offPops: (() => void) | null = null;
function listen() {
  const offCue = onSoundCue((p, info) => {
    const now = performance.now();
    const pair = PAIRS[p];
    const at = info.at ?? sceneAnchor();
    if (pair) {
      if (petalOnScreen(pair[0]) && petalOnScreen(pair[1])) return 0;
      addPop({ p: pair[0], with: pair[1], mode: "together", withShown: true, at, gen: sayGen });
      return RISE;
    }
    // earlier pops of this say(), of another sound, still up: this sound is their contrast
    const prior = pops.filter((q) => !q.leaving && q.gen === sayGen && q.p !== p && !q.with && (q.clipEnd === null || now - q.clipEnd < LINGER / FAST));
    if (petalOnScreen(p)) {
      prior.forEach(dimPop);
      return 0;
    }
    const same = at ? prior.find((q) => q.at === at) : undefined;
    if (same) {
      // the same anchor: the pop becomes a pair over it, the first sound on the left, dimmed
      const bw = pairWidth(same.w, "contrast");
      Object.assign(same, { with: p, mode: "contrast", withShown: true, dim: true, w: bw, clipEnd: null }, placePop(at, bw, same.h));
      pops = pops.map((x) => x);
      popBump();
      return RISE;
    }
    const q = addPop({ p, at, gen: sayGen });
    for (const o of prior) {
      dimPop(o);
      o.partner = q.id;
    }
    return RISE;
  });
  const offClip = onClip((id, _start, end) => {
    if (!id.startsWith("sound:")) return;
    const s = id.slice(6);
    for (const q of pops) {
      if (q.leaving) continue;
      const pairClip = !!q.with && PAIRS[s]?.[0] === q.p && PAIRS[s]?.[1] === q.with; // "sound:ks" for /k/ + /s/
      if (s === q.with) Object.assign(q, { withShown: true, dim: q.mode === "contrast" });
      else if (s !== q.p && !pairClip) continue;
      q.clipEnd = end;
      pops = pops.map((x) => x);
      popBump();
      setTimeout(() => checkLeave(q), Math.max(0, end - performance.now()) + LEAVE / FAST);
    }
  });
  const offSay = onSay(() => {
    sayGen++;
    for (const q of pops) if (q.gen === -1) q.gen = sayGen;
    for (const q of pops) if (q.clipEnd !== null) checkLeave(q);
  });
  const offSpeak = onSpeaking((on) => void (!on && pops.forEach((q) => q.clipEnd !== null && checkLeave(q))));
  return () => (offCue(), offClip(), offSay(), offSpeak());
}

/**
 * Pop a sound's petal above an element now (SD §4.4): e.g. the tile a child tapped, before "That's… /d/". `with`: a
 * second sound, drawn beside it (`mode` "together": both now; "contrast", the default: it appears on its own clip, and
 * the first dims). Resolves once the pop stands (200 ms), so a sound said next lands on it; it leaves 700 ms after its
 * clip ends (4 s if none comes). The cue listener pops by itself for "petal" sounds; this is for pops a scene wants now.
 */
export function popSound(p: PhonemeId, at: SoundAt, o: { with?: PhonemeId; mode?: "contrast" | "together" } = {}): Promise<void> {
  let el: Element | null = null;
  try {
    el = (typeof at === "function" ? at() : at) ?? null;
  } catch {}
  const pair = PAIRS[p];
  if (pair) addPop({ p: pair[0], with: pair[1], mode: "together", withShown: true, at: el, gen: -1 });
  else addPop({ p, with: o.with, mode: o.with ? o.mode ?? "contrast" : undefined, withShown: !!o.with && o.mode === "together", at: el, gen: -1 });
  return new Promise((r) => setTimeout(r, 200 / FAST));
}

/** The pops, drawn over the scene (NavLayer mounts one). Also listens for "petal" cues while mounted. */
export function SoundPops() {
  useSyncExternalStore(
    (f) => (popSubs.add(f), () => void popSubs.delete(f)),
    () => popVersion,
  );
  useEffect(() => {
    if (popsLive++ === 0) offPops = listen();
    return () => {
      if (--popsLive === 0) {
        offPops?.();
        offPops = null;
        clearPops();
      }
    };
  }, []);
  return (
    <div className="sound-pops" aria-hidden="true">
      {pops.map((q) => (
        <div key={q.id} className={`sound-pop tail-${q.tail} ${q.leaving ? "leaving" : ""}`} data-pop={q.with ? `${q.p}+${q.with}` : q.p} style={{ left: q.x, top: q.y, width: q.w, height: q.h }}>
          {q.with ? <SoundPair a={q.p} b={q.with} mode={q.mode ?? "contrast"} tier="pop" passive hideB={!q.withShown} dim={q.mode === "contrast" && q.dim} /> : <SoundBadge p={q.p} tier="pop" passive dim={q.dim} />}
          {q.tail !== "none" && <i className="sound-pop-tail" style={{ "--tail": petalColour(q.p) } as CSSProperties} />}
        </div>
      ))}
    </div>
  );
}
