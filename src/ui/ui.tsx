// Shared UI: stage scaling, sprites, icons, sensei dock, tiles, particles.
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { onCaption, currentCaption, sfx, sfxOver, say, unlockAudio, audioCtx, load, urls, pauseSpeech, settings as audioSettings, setMusicVolume } from "../engine/audio";
import { FAST } from "../engine/fast";
import { store, useSave } from "../engine/store";
import { useViseme, VISEMES } from "../engine/lipsync";
import { LINES } from "../content/lines";
import { poseSrc, usePoseVersion } from "./poses";
import { mix, petalColour, petalImg, teardropAt } from "./petal";
import { PHONEMES, type PhonemeId } from "../content/phonics";
import { chartOf } from "../content/flower";

export const W = 1280;
export const H = 720;
export const img = (id: string) => `/a/i/${id}.webp`;
/** The play area's side margins (docs/NAVIGATION.md §3.1: x 340–1120, between the ninja zone and the Help zone) and its
 *  centre line, where a screen's board is centred. (Early.tsx has its own copies; it should re-export these.) */
export const PLAY = { left: 340, right: 160 } as const;
export const PLAY_CX = (W - PLAY.right + PLAY.left) / 2;

// ---------- endless CSS animations must not wake the main thread (docs/PERF.md)
// Once any `animationiteration` listener exists in a document, Chrome has to wake the main thread (a style pass) at
// every iteration boundary of every CSS animation, to fire the event: a loop that runs on the compositor then costs
// main-thread time anyway, and loops with staggered delays (the ten flames, the orbit, the sparks, a map's petals) keep
// it busy every frame. React registers one at its root for onAnimationIteration, which the game never uses, so it is
// dropped here (this module runs before main.tsx's createRoot). Measured on the ninja at streak 10, phone ×4: 60 → 0
// style passes a second. So NOTHING on the page ever hears animationiteration: a JSX onAnimationIteration never fires,
// and nor does an addEventListener("animationiteration") (the dev build warns about the second). Scenes that need a
// loop's rhythm use onAnimationEnd or a timer instead.
if (typeof EventTarget !== "undefined") {
  const add = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, ...rest: [EventListenerOrEventListenerObject | null, (boolean | AddEventListenerOptions)?]) {
    if (type === "animationiteration") {
      // React's own registration is on the root container; anything else is someone expecting the event
      if (import.meta.env.DEV && !(this instanceof Element && this.id === "root"))
        console.warn("animationiteration listeners are dropped (src/ui/ui.tsx, docs/PERF.md): use animationend or a timer", this);
      return;
    }
    return add.call(this, type, ...rest);
  };
}

// ---------- stage scaling
let stageScale = 1;
let stageEl: HTMLElement | null = null;
export function Stage({ children, worldColour }: { children: ReactNode; worldColour?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      // Keep the game away from the screen edges on phones: the iOS home bar (bottom) and
      // Control Center / notch (top, sides) steal touches that start near the edges.
      const cs = getComputedStyle(document.documentElement);
      const inset = (v: string) => parseFloat(cs.getPropertyValue(v)) || 0;
      const touch = matchMedia("(pointer: coarse)").matches;
      const top = Math.max(inset("--sat"), touch ? 10 : 0);
      const bottom = Math.max(inset("--sab"), touch ? 26 : 0);
      const left = Math.max(inset("--sal"), touch ? 8 : 0);
      const right = Math.max(inset("--sar"), touch ? 8 : 0);
      const aw = window.innerWidth - left - right;
      const ah = window.innerHeight - top - bottom;
      const s = Math.min(aw / W, ah / H);
      stageScale = s;
      if (ref.current) {
        ref.current.style.left = `${left + aw / 2}px`;
        ref.current.style.top = `${top + ah / 2}px`;
        ref.current.style.transform = `scale(${s}) translate(-50%, -50%)`;
      }
    };
    stageEl = ref.current;
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);
  return (
    <div className="viewport" style={worldColour ? ({ "--world": worldColour } as CSSProperties) : undefined}>
      <div className="stage" ref={ref}>
        {children}
      </div>
      <RotatePrompt />
    </div>
  );
}
/** Centre of an element in stage coordinates. */
export function stageXY(el: Element | null): { x: number; y: number } {
  if (!el || !stageEl) return { x: W / 2, y: H / 2 };
  const r = el.getBoundingClientRect();
  const s = stageEl.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - s.left) / stageScale, y: (r.top + r.height / 2 - s.top) / stageScale };
}
/** An element's box in stage coordinates. */
export function stageRect(el: Element | null): { x: number; y: number; w: number; h: number } {
  if (!el || !stageEl) return { x: W / 2, y: H / 2, w: 0, h: 0 };
  const r = el.getBoundingClientRect();
  const s = stageEl.getBoundingClientRect();
  return { x: (r.left - s.left) / stageScale, y: (r.top - s.top) / stageScale, w: r.width / stageScale, h: r.height / stageScale };
}

// ---------- "turn your phone": a phone held upright gets an animated picture, an uh-oh and Sensei saying it
const PORTRAIT = "(orientation: portrait) and (max-width: 700px)";
const uprightQ = typeof window !== "undefined" ? matchMedia(PORTRAIT) : null;
const uprightSubs = new Set<() => void>();
uprightQ?.addEventListener?.("change", () => uprightSubs.forEach((f) => f()));
/** Is the phone held upright right now (the game is covered by the turn-your-phone picture)? */
export const isUpright = () => !!uprightQ?.matches;
/** Hear the phone turn upright or back. Returns an unsubscribe function. */
export function onUpright(fn: () => void): () => void {
  uprightSubs.add(fn);
  return () => void uprightSubs.delete(fn);
}
/** Scenes with timers (e.g. a monster's attack) can pause while the phone is upright. */
export function useUpright(): boolean {
  return useSyncExternalStore(
    (cb) => {
      uprightSubs.add(cb);
      return () => void uprightSubs.delete(cb);
    },
    isUpright,
  );
}
const hasLine = (id: string) => LINES.some((l) => l.id === id);
/** Play a line outside the speech queue (which is paused while the phone is upright). Returns a stop function. */
function sayOver(id: string, done: () => void): () => void {
  let src: AudioBufferSourceNode | null = null, stopped = false;
  load(urls.line(id)).then((buf) => {
    if (!buf || stopped) return done();
    const c = audioCtx();
    src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.onended = done;
    src.start();
    ((window as any).__audioLog as unknown[] | undefined)?.push({ t: Date.now(), url: urls.line(id), kind: "speech" });
  });
  return () => {
    stopped = true;
    try {
      src?.stop();
    } catch {}
  };
}

function RotatePrompt() {
  const upright = useUpright();
  const hero = useHero();
  usePoseVersion();
  const [locked, setLocked] = useState(false);
  const speakRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!upright) return;
    let alive = true, mine = false, last = -1e9, autos = 0;
    let stopLine = () => {};
    // the game pauses while upright: its speech waits (scripted scenes stop at their next line), music goes quiet
    pauseSpeech(true);
    const music = audioSettings.music;
    setMusicVolume(0);
    const speak = async () => {
      if (!alive) return;
      const running = audioCtx().state === "running";
      setLocked(!running);
      if (!running) return; // iOS before the first tap: the hand pulses, and the first tap speaks
      last = performance.now();
      mine = true;
      stopLine();
      sfxOver("oops"); // (the game's own sound effects are hushed while upright)
      await sleep(620);
      if (alive && hasLine("turn_phone")) await new Promise<void>((r) => (stopLine = sayOver("turn_phone", r)));
      mine = false;
    };
    speakRef.current = () => {
      unlockAudio().then(() => {
        setLocked(false);
        if (performance.now() - last > 1500) speak();
      });
    };
    speak();
    const tick = window.setInterval(() => {
      // only count an automatic repeat when it can actually be heard (iOS keeps audio locked until the first tap)
      if (!mine && autos < 4 && performance.now() - last > 6000 && audioCtx().state === "running") {
        autos++;
        speak();
      }
    }, 250);
    return () => {
      alive = false;
      clearInterval(tick);
      stopLine();
      setMusicVolume(music);
      pauseSpeech(false);
      // turned the right way: a happy little twinkle
      try {
        if (audioCtx().state === "running") sfxOver("twinkle");
      } catch {}
    };
  }, [upright]);
  if (!upright) return null;
  return (
    <div className="rotate" onPointerDown={() => speakRef.current()} role="dialog" aria-label="Turn your phone sideways">
      <div className="rotate-art">
        <svg viewBox="0 0 300 300" className="rotate-svg" aria-hidden="true">
          <defs>
            <linearGradient id="rot-screen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8fd8ff" />
              <stop offset="0.62" stopColor="#c9f0ff" />
              <stop offset="0.63" stopColor="#7ccf5a" />
              <stop offset="1" stopColor="#4fa83a" />
            </linearGradient>
          </defs>
          {/* the big curved arrow, drawn on as the phone turns */}
          <g className="rot-arrow">
            <path className="rot-arc-ink" d="M214 40 A126 126 0 0 0 27 126" />
            <path className="rot-arc" d="M214 40 A126 126 0 0 0 27 126" />
            <path className="rot-head" d="M4 112 L28 160 L54 114 Z" />
          </g>
          <g className="rot-phone">
            <rect x="103" y="62" width="94" height="176" rx="18" fill="#2b1d14" />
            <rect x="110" y="72" width="80" height="156" rx="11" fill="url(#rot-screen)" />
            <rect x="136" y="67" width="28" height="6" rx="3" fill="#5a4636" />
            <path className="rot-star" d="M150 118l5 11 12 1.5-9 8 2.5 12-10.5-6-10.5 6 2.5-12-9-8 12-1.5z" fill="#ffc53d" stroke="#2b1d14" strokeWidth="3" strokeLinejoin="round" />
            <g className="rot-tick">
              <circle cx="150" cy="182" r="17" fill="#3fbf6a" stroke="#2b1d14" strokeWidth="4" />
              <path d="M141 182l7 7 12-13" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </svg>
        <div className="rotate-ninja">
          <img className="rn-think" src={poseSrc(hero, "think")} alt="" />
          <img className="rn-cheer" src={poseSrc(hero, "cheer")} alt="" />
        </div>
        {locked && (
          <div className="rotate-tap">
            <span className="rotate-ring" />
            <svg viewBox="0 0 64 64" width="100%" height="100%">
              <path d="M26 30V12a5 5 0 0 1 10 0v16l3-1a5 5 0 0 1 6 3l1 1a5 5 0 0 1 6 4v8c0 9-6 16-15 16h-3c-6 0-10-3-13-8l-7-11a4 4 0 0 1 6-5l6 6z" fill="#fff4dc" stroke="#2b1d14" strokeWidth="4" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
      <div className="rotate-note">Turn your phone sideways to play</div>
    </div>
  );
}
export function shakeStage() {
  if (!stageEl) return;
  stageEl.classList.remove("screen-shake");
  void stageEl.offsetWidth;
  stageEl.classList.add("screen-shake");
}

// ---------- taps: act on finger-down, like a game. Kids often slide while tapping, which cancels a normal click.
const lastTap = new WeakMap<Element, number>();
export function tapProps<T extends Element = HTMLElement>(fn: (el: T) => void) {
  return {
    onPointerDown: (e: React.PointerEvent<T>) => {
      if (e.button > 0) return;
      e.preventDefault();
      const now = performance.now();
      const el = e.currentTarget as Element;
      if (now - (lastTap.get(el) ?? 0) < 250) return; // ignore accidental double-fire on the same button
      lastTap.set(el, now);
      fn(e.currentTarget);
    },
    // keyboard activation (Enter/Space) still works
    onClick: (e: React.MouseEvent<T>) => {
      if (e.detail === 0) fn(e.currentTarget);
    },
  };
}

// ---------- hero
export function useHero() {
  return useSave((s) => s.hero ?? "kai");
}
export const heroImg = (hero: string, pose: string) => img(`hero_${hero}_${pose}`);

// ---------- icons (hand-drawn-ish SVG, ink stroke)
const P = { fill: "none", stroke: "#2b1d14", strokeWidth: 7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
// (no ear: a bare pulsing ear that nobody explained was the first Dojo's "Listen!" opening; a sound is always its petal,
// docs/teacher-voice/mechanics.md §7)
export const Icon = {
  speaker: () => (
    <svg viewBox="0 0 64 64"><path {...P} fill="#fff4dc" d="M10 25h10l13-11v36L20 39H10z" /><path {...P} d="M42 22c5 5 5 15 0 20M49 15c9 9 9 25 0 34" /></svg>
  ),
  home: () => (
    <svg viewBox="0 0 64 64"><path {...P} fill="#fff4dc" d="M10 30 32 11l22 19v23H40V39H24v14H10z" /></svg>
  ),
  back: () => (
    <svg viewBox="0 0 64 64"><path {...P} d="M38 14 20 32l18 18" /></svg>
  ),
  next: () => (
    <svg viewBox="0 0 64 64"><path {...P} d="M26 14l18 18-18 18" /></svg>
  ),
  play: () => (
    <svg viewBox="0 0 64 64"><path {...P} fill="#fff4dc" d="M22 12l30 20-30 20z" /></svg>
  ),
  check: () => (
    <svg viewBox="0 0 64 64"><path {...P} strokeWidth={9} d="M12 34l13 13 27-30" /></svg>
  ),
  // the World Flower: eight glassy teardrop petals in the chart's colours round a golden heart (as in Tree.tsx)
  tree: () => (
    <svg viewBox="-60 -60 120 120">
      {["#e8312f", "#f7a23b", "#f3c74a", "#2fa65a", "#2ec4b6", "#4a7dff", "#8a3be0", "#f0226b"].map((c, i) => (
        <path key={c} d="M0,20 C-2.88,11.2 -12,2.4 -12,-8 A12,12 0 0 1 12,-8 C12,2.4 2.88,11.2 0,20 Z" transform={`rotate(${i * 45}) translate(0 -34)`} fill={c} stroke="#2b1d14" strokeWidth={4} />
      ))}
      <circle r={17} fill="#ffc53d" stroke="#2b1d14" strokeWidth={5} />
      <ellipse cx={-5} cy={-6} rx={5} ry={3.5} fill="#fff" opacity={0.6} transform="rotate(-25 -5 -6)" />
    </svg>
  ),
  /** A die-cut sticker peeling at one corner: the Sticker Book's counters (never a star: stars are for grown-ups). */
  sticker: () => (
    <svg viewBox="0 0 64 64">
      <path d="M14 5h36a9 9 0 0 1 9 9v25L39 59H14a9 9 0 0 1-9-9V14a9 9 0 0 1 9-9z" fill="#fff8e6" stroke="#2b1d14" strokeWidth={4} strokeLinejoin="round" />
      <path d="M15 11h34a4 4 0 0 1 4 4v22L37 53H15a4 4 0 0 1-4-4V15a4 4 0 0 1 4-4z" fill="#8fd3ff" />
      <circle cx="29" cy="29" r="10" fill="#ffc53d" stroke="#2b1d14" strokeWidth={3} />
      <path d="M22 44c4-3 10-3 14 0" fill="none" stroke="#3fbf6a" strokeWidth={4} strokeLinecap="round" />
      <path d="M59 39 39 59c-1-11 7-20 20-20z" fill="#e9dcbd" stroke="#2b1d14" strokeWidth={4} strokeLinejoin="round" />
    </svg>
  ),
  gear: () => (
    <svg viewBox="0 0 64 64"><circle {...P} cx="32" cy="32" r="9" /><path {...P} d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M15 49l6-6M43 21l6-6" /></svg>
  ),
  lock: () => (
    <svg viewBox="0 0 64 64"><rect {...P} fill="#fff4dc" x="14" y="28" width="36" height="26" rx="6" /><path {...P} d="M22 28v-8a10 10 0 0 1 20 0v8" /></svg>
  ),
  star: ({ on = true }: { on?: boolean }) => (
    <svg viewBox="0 0 64 64"><path {...P} strokeWidth={5} fill={on ? "#ffc53d" : "rgba(255,244,220,.5)"} d="M32 6l7.6 16 17.4 2.2-12.8 12 3.3 17.3L32 45l-15.5 8.5 3.3-17.3L7 24.2 24.4 22z" /></svg>
  ),
  /** The pointing hand the demos use (the paw): "Show me again". */
  paw: () => (
    <svg viewBox="0 0 64 64"><path d="M26 30V12a5 5 0 0 1 10 0v16l3-1a5 5 0 0 1 6 3l1 1a5 5 0 0 1 6 4v8c0 9-6 16-15 16h-3c-6 0-10-3-13-8l-7-11a4 4 0 0 1 6-5l6 6z" fill="#fff4dc" stroke="#2b1d14" strokeWidth={4.5} strokeLinejoin="round" /></svg>
  ),
  /** ↻ "Play again" (a whole level or reward, never "say it again": that is the speaker). */
  again: () => (
    <svg viewBox="0 0 64 64"><path fill="none" stroke="#2b1d14" strokeWidth={7} strokeLinecap="round" d="M48 34a16 16 0 1 1-6-13M44 10v12H32" /></svg>
  ),
};

/** `nav`: sets `data-nav` (docs/NAVIGATION.md §3.1: home, back, again, show, sound, next), which bots and the sweep find
 *  the navigation controls by. */
export function RoundButton({ onClick, children, className = "", label, style, sm, nav }: { onClick: () => void; children: ReactNode; className?: string; label: string; style?: CSSProperties; sm?: boolean; nav?: string }) {
  return (
    <button
      className={`btn-round ${sm ? "sm" : ""} ${className}`}
      aria-label={label}
      data-nav={nav}
      style={style}
      {...tapProps(() => {
        sfx.tap();
        onClick();
      })}
    >
      {children}
    </button>
  );
}

// ---------- live captions (for grown-ups; off by default)
/** The caption bubble. Sensei himself is the Help button (bottom-right); the bubble sits above him with its tail
 *  pointing down at him. It picks up a line already being said when it mounts. */
export function SenseiDock({ hidden }: { hidden?: boolean }) {
  const [cap, setCap] = useState(currentCaption);
  const captions = useSave((s) => s.settings.captions);
  useEffect(() => {
    setCap(currentCaption());
    return onCaption(setCap);
  }, []);
  if (hidden) return null;
  if (!cap || !captions) return null;
  return (
    <div className={`bubble ${cap.who === "baron" ? "baron" : ""}`} key={cap.text}>
      {cap.parts ? cap.parts.map((p, i) => ("sound" in p ? <CaptionSound key={i} p={p.sound} /> : <span key={i}>{p.text} </span>)) : cap.text}
    </div>
  );
}
/** A sound in a caption: its petal picture, 34 px (SD §4.2 "Caption", r62), never letters; < x > is /k/ + /s/ (Dec7).
 *  Drawn here rather than as a still SoundBadge, which carries data-p: a caption's tiny petal must never count as the
 *  sound's petal on screen (SoundPops would let it swell instead of popping one the child can see, and the sweep's
 *  sound-without-petal check would pass on it). */
function CaptionSound({ p }: { p: PhonemeId }) {
  const pair = p === "ks" ? (["k", "s"] as PhonemeId[]) : p === "kw" ? (["k", "w"] as PhonemeId[]) : null;
  if (pair)
    return (
      <span className="cap-pair" title={`/${PHONEMES[p]?.label ?? p}/`}>
        <CaptionPetal p={pair[0]} />
        <b>+</b>
        <CaptionPetal p={pair[1]} />
      </span>
    );
  return <CaptionPetal p={p} />;
}
function CaptionPetal({ p }: { p: PhonemeId }) {
  const w = 34, h = 47;
  const known = !!PHONEMES[p] && !!chartOf(p);
  const ink = 2.6, line = 1.6;
  const tw = w - ink, th = h - ink;
  const d = teardropAt(tw, th, w / 2, h / 2);
  const cy = h / 2 - th / 2 + tw / 2; // the round part's centre
  const pic = w * 0.7;
  const colour = known ? petalColour(p) : "#a99cbf";
  return (
    <span className="cap-petal" title={`/${PHONEMES[p]?.label ?? p}/`} aria-label={`/${PHONEMES[p]?.label ?? p}/`}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
        <path d={d} fill="#fff" stroke="#2b1d14" strokeWidth={ink} strokeLinejoin="round" />
        <path d={d} fill={known ? mix(colour, "#ffffff", 0.82) : "#d9d2e6"} stroke={colour} strokeWidth={line} strokeLinejoin="round" />
        {!known && (
          <text x={w / 2} y={cy + 6} textAnchor="middle" fontFamily="var(--font-display)" fontSize={18} fill="#5a4a72">
            ?
          </text>
        )}
      </svg>
      {known && <img src={petalImg(p)} alt="" draggable={false} style={{ left: (w - pic) / 2, top: cy - pic / 2, width: pic, height: pic }} onError={(e) => (e.currentTarget.style.visibility = "hidden")} />}
    </span>
  );
}

// ---------- letter tile
export function Tile({
  g, onTap, state, size, className = "", style, withButtons, lit,
}: {
  g: string; onTap?: (el: HTMLElement) => void; state?: "used" | "wrong" | "right" | "hint" | ""; size?: "sm" | "lg" | "xl"; className?: string; style?: CSSProperties;
  withButtons?: boolean; lit?: boolean;
}) {
  const inner = (
    <>
      <span className="g">{g}</span>
      {withButtons && <span className={`sb ${g === "x" ? "two" : g.length > 1 ? "bar" : "dot"} ${lit ? "lit" : ""}`} />}
    </>
  );
  // display-only tiles (built words, reveals, basket labels) are not buttons: no tap sound, and they can sit inside buttons
  if (!onTap)
    return (
      <div className={`tile ${size ?? ""} ${state ?? ""} ${className}`} style={style} aria-label={g}>
        {inner}
      </div>
    );
  return (
    <button
      className={`tile ${size ?? ""} ${state ?? ""} ${className}`}
      style={style}
      aria-label={g}
      {...tapProps<HTMLButtonElement>((el) => {
        el.classList.add("pressed");
        setTimeout(() => el.classList.remove("pressed"), 140);
        sfx.tap();
        onTap(el);
      })}
    >
      {inner}
    </button>
  );
}

// ---------- word card
/** The card above a spelling task: the word's picture, or, for words you can't draw (am, it, when), a big bouncing
 *  listen button, so it never looks like a missing picture. */
export function WordCard({ word, onHear, style, className = "" }: { word: { text: string; pic?: unknown }; onHear: () => void; style: CSSProperties; className?: string }) {
  if (word.pic)
    return (
      <div className={`card ${className}`} style={style}>
        <img src={img(`pic_${word.text}`)} alt="" key={word.text} className="pop-in" />
      </div>
    );
  return (
    <div className={`card hear-card ${className}`} style={style} role="button" aria-label="Hear the word" {...tapProps(onHear)}>
      <span className="hear-wave"><Icon.speaker /></span>
    </div>
  );
}

// ---------- hearts
export function Hearts({ n, max }: { n: number; max: number }) {
  return (
    <div className="hearts">
      {Array.from({ length: max }, (_, i) => (
        <img key={i} src={img("item_heart")} className={i >= n ? "lost" : ""} alt="" />
      ))}
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="progress">
      <div style={{ width: `${Math.min(1, value) * 100}%` }} />
    </div>
  );
}

export function Stars({ n, size = 64 }: { n: number; size?: number }) {
  return (
    <div className="row" style={{ gap: 4 }}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ width: size, height: size, display: "inline-block", transform: i === 2 ? "translateY(-12px)" : undefined }}>
          <Icon.star on={i <= n} />
        </span>
      ))}
    </div>
  );
}

// ---------- particles (single canvas over the stage)
type Particle = {
  x: number; y: number; vx: number; vy: number; r: number; vr: number; life: number; max: number; size: number; kind: string; color?: string;
  /** ring: start/end radius and line width; implode: start point and target */
  r0?: number; r1?: number; w?: number; sx?: number; sy?: number; tx?: number; ty?: number;
};
const particles: Particle[] = [];
/** The most particles alive at once; beyond it the oldest go first (a 150-strike stress peaked at 461). */
export const MAX_PARTICLES = 350;
/** Wakes the particle canvas's loop (it sleeps while there is nothing to draw: docs/PERF.md fix 1). */
let wakeFx: (() => void) | null = null;
function add(p: Particle) {
  if (particles.length >= MAX_PARTICLES) particles.shift();
  particles.push(p);
  wakeFx?.();
}
/** Particle time scale (the ninja demo's slow motion sets this below 1). */
let fxSpeed = 1;
export const setFxSpeed = (s: number) => void (fxSpeed = s);
const glowCache = new Map<string, HTMLCanvasElement>();
function glowSprite(color: string) {
  let c = glowCache.get(color);
  if (!c) {
    c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    glowCache.set(color, c);
  }
  return c;
}
/** Round blossom petals (Dec6: a teardrop always means a sound, so decoration falls as blossoms): a round pink petal
 *  with a notch at its tip, drawn once per shade and reused. */
const BLOSSOM_SHADES = ["#ffb7cf", "#ff9dbd", "#ffd0e0", "#ff85ab"];
const blossomCache: HTMLCanvasElement[] = [];
function blossomSprite(k: number) {
  const i = Math.abs(k) % BLOSSOM_SHADES.length;
  let c = blossomCache[i];
  if (!c) {
    c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    // round all over, with the cherry blossom's notch at the tip: never a point, so it can't be read as a teardrop
    g.beginPath();
    g.moveTo(32, 17);
    g.lineTo(36.5, 8.5);
    g.bezierCurveTo(45, 3, 56, 11, 55, 29);
    g.bezierCurveTo(54, 45, 44, 58, 32, 59);
    g.bezierCurveTo(20, 58, 10, 45, 9, 29);
    g.bezierCurveTo(8, 11, 19, 3, 27.5, 8.5);
    g.closePath();
    const grad = g.createLinearGradient(32, 60, 32, 6);
    grad.addColorStop(0, "#e2537f");
    grad.addColorStop(0.35, BLOSSOM_SHADES[i]);
    grad.addColorStop(1, "#fff1f6");
    g.fillStyle = grad;
    g.fill();
    g.lineWidth = 2.5;
    g.strokeStyle = "rgba(160, 40, 80, 0.55)";
    g.stroke();
    g.beginPath(); // a soft vein
    g.moveTo(32, 53);
    g.quadraticCurveTo(30, 38, 32, 23);
    g.lineWidth = 2;
    g.strokeStyle = "rgba(255, 255, 255, 0.6)";
    g.stroke();
    blossomCache[i] = c;
  }
  return c;
}
/** The same blossom petal as an image URL (an inline SVG), for decoration drawn in the DOM rather than on the particle
 *  canvas, e.g. the title's drifting petals (Dec6). `k` picks the shade. */
export function blossomUrl(k = 0): string {
  const shade = BLOSSOM_SHADES[Math.abs(k) % BLOSSOM_SHADES.length];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="b" x1="0" y1="1" x2="0" y2="0.09">` +
    `<stop offset="0" stop-color="#e2537f"/><stop offset="0.35" stop-color="${shade}"/><stop offset="1" stop-color="#fff1f6"/></linearGradient></defs>` +
    `<path d="M32 17L36.5 8.5C45 3 56 11 55 29C54 45 44 58 32 59C20 58 10 45 9 29C8 11 19 3 27.5 8.5Z" fill="url(#b)" stroke="rgba(160,40,80,.55)" stroke-width="2.5"/>` +
    `<path d="M32 53Q30 38 32 23" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
/** A blossom petal as an <img> (see blossomUrl). */
export function Blossom({ k = 0, size = 32, className, style }: { k?: number; size?: number; className?: string; style?: CSSProperties }) {
  return <img className={className} src={blossomUrl(k)} alt="" draggable={false} style={{ width: size, height: size, ...style }} />;
}
function star4(g: CanvasRenderingContext2D, s: number) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 ? s * 0.22 : s * 0.5;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  g.fill();
}
type Burst = "petals" | "blossoms" | "rainbow" | "stars" | "sparks" | "confetti" | "dust";
/** "petals" was the rainbow teardrop until Dec6; it now falls as blossoms, like "blossoms". */
const kindOf = (k: Burst): Burst => (k === "petals" ? "blossoms" : k);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
/** The DOM effects layer (projectiles, impact stars, flashes), in stage coordinates. Mounted by FxLayer. */
let fxDomEl: HTMLDivElement | null = null;
export const fxDom = (): HTMLElement | null => fxDomEl ?? stageEl;
const imgs: Record<string, HTMLImageElement> = {};
function getImg(id: string) {
  if (!imgs[id]) {
    imgs[id] = new Image();
    imgs[id].src = img(id);
  }
  return imgs[id];
}
export const fx = {
  /** `petals` (or its alias `blossoms`): round pink blossom petals, the decoration. `rainbow`: the rainbow teardrop
   *  (item_petal), only for the moments that mean all the sounds, the film and the flower's heart. Dec6: a teardrop
   *  always means a sound, so decoration never falls as teardrops. */
  burst(x: number, y: number, kind: Burst = "sparks", n = 18, spread = 1) {
    kind = kindOf(kind);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (kind === "dust" ? 2 : 4 + Math.random() * 7) * spread;
      add({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === "confetti" ? 6 : 2),
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 0,
        max: kind === "rainbow" || kind === "blossoms" || kind === "confetti" ? 80 + Math.random() * 50 : kind === "dust" ? 30 : 40 + Math.random() * 25,
        size: kind === "rainbow" || kind === "blossoms" ? 26 + Math.random() * 18 : kind === "stars" ? 22 + Math.random() * 20 : kind === "dust" ? 16 + Math.random() * 14 : 6 + Math.random() * 8,
        kind,
        color: kind === "confetti" ? ["#ff7aa2", "#ffc53d", "#5ec8f2", "#6cc04a", "#9b6cf0", "#fff4dc"][i % 6] : kind === "sparks" ? ["#fff4dc", "#ffc53d", "#ffe38a"][i % 3] : undefined,
      });
    }
  },
  rain(kind: "petals" | "blossoms" | "rainbow" | "confetti" = "confetti", n = 60) {
    kind = kindOf(kind) as typeof kind;
    for (let i = 0; i < n; i++) {
      add({
        x: Math.random() * W, y: -40 - Math.random() * 300, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, life: 0, max: 260, size: kind === "rainbow" || kind === "blossoms" ? 28 + Math.random() * 16 : 8 + Math.random() * 8, kind,
        color: ["#ff7aa2", "#ffc53d", "#5ec8f2", "#6cc04a", "#9b6cf0", "#fff4dc"][i % 6],
      });
    }
  },
  /** An expanding shockwave ring. */
  ring(x: number, y: number, o: { color?: string; r0?: number; r1?: number; width?: number; life?: number } = {}) {
    add({ x, y, vx: 0, vy: 0, r: 0, vr: 0, life: 0, max: o.life ?? 22, size: 0, kind: "ring", color: o.color ?? "#fff4dc", r0: o.r0 ?? 12, r1: o.r1 ?? 150, w: o.width ?? 12 });
  },
  /** Soft glowing dots (additive), e.g. a spell's trail. `drift` is the random speed. */
  glow(x: number, y: number, colors: string[] = ["#ffe38a"], n = 1, size = 34, drift = 1.2, life = 26) {
    for (let i = 0; i < n; i++)
      add({
        x, y, vx: (Math.random() - 0.5) * 2 * drift, vy: (Math.random() - 0.5) * 2 * drift, r: 0, vr: 0, life: 0, max: life * (0.7 + Math.random() * 0.6),
        size: size * (0.6 + Math.random() * 0.8), kind: "glow", color: colors[(Math.random() * colors.length) | 0],
      });
  },
  /** Four-pointed twinkles flying outwards. */
  twinkle(x: number, y: number, colors: string[] = ["#fff4dc", "#ffe38a"], n = 10, speed = 6, size = 26) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = speed * (0.4 + Math.random() * 0.8);
      add({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: Math.random() * 2, vr: (Math.random() - 0.5) * 0.25, life: 0, max: 30 + Math.random() * 22,
        size: size * (0.5 + Math.random() * 0.8), kind: "twinkle", color: colors[i % colors.length],
      });
    }
  },
  /** Twinkles bursting outwards from all round a target (a w×h box centred on x, y), gone within `life` frames (22:
   *  about 0.37 s): celebrates a picture without ever covering it. */
  halo(x: number, y: number, w: number, h: number, colors: string[] = ["#fff4dc", "#ffe38a", "#ffc53d"], n = 16, life = 22) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.25;
      const ux = Math.cos(a), uy = Math.sin(a);
      add({
        x: x + ux * (w / 2 + 14), y: y + uy * (h / 2 + 14), vx: ux * (5 + Math.random() * 3), vy: uy * (5 + Math.random() * 3), r: Math.random() * 2, vr: (Math.random() - 0.5) * 0.25,
        life: 0, max: life * (0.85 + Math.random() * 0.15), size: 22 + Math.random() * 12, kind: "twinkle", color: colors[i % colors.length],
      });
    }
  },
  /** Impact speed lines radiating from a point. */
  lines(x: number, y: number, n = 10, color = "#fff4dc", len = 70) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      add({ x, y, vx: 0, vy: 0, r: a, vr: 0, life: 0, max: 14 + Math.random() * 6, size: len * (0.7 + Math.random() * 0.6), kind: "line", color });
    }
  },
  /** Dust kicked up along the ground (landings). */
  puff(x: number, y: number, n = 8) {
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      add({
        x: x + side * Math.random() * 30, y: y - Math.random() * 8, vx: side * (2 + Math.random() * 5), vy: -0.3 - Math.random() * 1.2, r: 0, vr: 0, life: 0,
        max: 26 + Math.random() * 16, size: 12 + Math.random() * 14, kind: "puff",
      });
    }
  },
  /**
   * A projectile's glowing trail, for a flight's onFrame: one glow (`n` dots) every `every` stage px travelled, spread
   * along the path, whatever the frame rate (a 120 Hz phone draws no more than a 60 Hz one: docs/PERF.md fix 7). The
   * first call marks the start. `size`, `drift` and `life` are fx.glow's; `also` runs at each glow (e.g. a twinkle).
   */
  trail(
    colors: string | string[],
    o: { every?: number; size?: number; life?: number; drift?: number; n?: number; also?: (x: number, y: number) => void } = {},
  ): (p: { x: number; y: number }) => void {
    const cols = typeof colors === "string" ? [colors] : colors;
    const every = Math.max(4, o.every ?? 22), n = o.n ?? 1, size = o.size ?? 34, drift = o.drift ?? 1.2, life = o.life ?? 26;
    let last: { x: number; y: number } | null = null;
    let owed = 0;
    const emit = (x: number, y: number) => {
      fx.glow(x, y, cols, n, size, drift, life);
      o.also?.(x, y);
    };
    return (p) => {
      if (!last) {
        last = { x: p.x, y: p.y };
        return emit(p.x, p.y);
      }
      const dx = p.x - last.x, dy = p.y - last.y;
      const d = Math.hypot(dx, dy);
      owed += d;
      // a long frame (a slow phone) fills its gap, up to 4 glows
      for (let k = 0; owed >= every && k < 4; k++) {
        owed -= every;
        const f = d > 0 ? 1 - owed / d : 1;
        emit(last.x + dx * f, last.y + dy * f);
      }
      if (owed >= every) owed = 0;
      last = { x: p.x, y: p.y };
    };
  },
  /** Energy gathering inwards to a point (a power-up's anticipation). */
  implode(x: number, y: number, colors: string[] = ["#ffe38a", "#fff4dc"], n = 22, r = 190, life = 26) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, d = r * (0.6 + Math.random() * 0.5);
      add({
        x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, sx: x + Math.cos(a) * d, sy: y + Math.sin(a) * d, tx: x, ty: y,
        vx: 0, vy: 0, r: 0, vr: 0, life: -Math.random() * 8, max: life, size: 22 + Math.random() * 20, kind: "implode", color: colors[i % colors.length],
      });
    }
  },
};
export function FxLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  const domRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fxDomEl = domRef.current;
    const c = ref.current!;
    const g = c.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    const petal = getImg("item_petal");
    const star = getImg("item_star");
    const loop = (now: number) => {
      // time-based, so 120 Hz phones don't run particles at double speed
      const k = (Math.min(50, Math.max(0, now - last)) / (1000 / 60)) * fxSpeed * FAST; // bots' fast-forward too
      last = now;
      g.clearRect(0, 0, W, H);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += k;
        p.x += p.vx * k;
        p.y += p.vy * k;
        p.r += p.vr * k;
        if (p.kind === "rainbow" || p.kind === "blossoms" || p.kind === "confetti") {
          p.vx *= Math.pow(0.97, k);
          p.vy = p.vy * Math.pow(0.97, k) + 0.18 * k;
          p.x += Math.sin(p.life / 9 + i) * 0.8 * k;
        } else if (p.kind === "dust" || p.kind === "glow" || p.kind === "puff") {
          p.vx *= Math.pow(0.9, k);
          p.vy *= Math.pow(0.9, k);
        } else if (p.kind === "twinkle") {
          p.vx *= Math.pow(0.9, k);
          p.vy = p.vy * Math.pow(0.9, k) + 0.08 * k;
        } else if (p.kind === "ring" || p.kind === "line" || p.kind === "implode") {
          // positioned from life below
        } else {
          p.vx *= Math.pow(0.93, k);
          p.vy = p.vy * Math.pow(0.93, k) + 0.25 * k;
        }
        const t = p.life / p.max;
        if (t >= 1 || p.y > H + 80) {
          particles.splice(i, 1);
          continue;
        }
        if (t < 0) continue; // not started yet
        g.save();
        g.globalAlpha = t > 0.7 ? (1 - t) / 0.3 : 1;
        if (p.kind === "ring") {
          const e = easeOut(t);
          g.globalAlpha = 1 - t;
          g.strokeStyle = p.color!;
          g.lineWidth = Math.max(1, p.w! * (1 - e * 0.8));
          g.beginPath();
          g.arc(p.x, p.y, p.r0! + (p.r1! - p.r0!) * e, 0, Math.PI * 2);
          g.stroke();
          g.restore();
          continue;
        }
        if (p.kind === "line") {
          const e = easeOut(t);
          const d0 = 30 + e * p.size * 1.2, d1 = d0 + p.size * (1 - e);
          const ux = Math.cos(p.r), uy = Math.sin(p.r);
          g.globalAlpha = 1 - t * 0.8;
          g.lineCap = "round";
          g.strokeStyle = "#2b1d14";
          g.lineWidth = 11 * (1 - e) + 2;
          g.beginPath();
          g.moveTo(p.x + ux * d0, p.y + uy * d0);
          g.lineTo(p.x + ux * d1, p.y + uy * d1);
          g.stroke();
          g.strokeStyle = p.color!;
          g.lineWidth = 6 * (1 - e) + 1;
          g.stroke();
          g.restore();
          continue;
        }
        if (p.kind === "implode") {
          const e = easeIn(t);
          p.x = p.sx! + (p.tx! - p.sx!) * e;
          p.y = p.sy! + (p.ty! - p.sy!) * e;
          g.globalAlpha = Math.min(1, t * 3);
          g.globalCompositeOperation = "lighter";
          const s = p.size * (1 - t * 0.6);
          g.drawImage(glowSprite(p.color!), p.x - s / 2, p.y - s / 2, s, s);
          g.restore();
          continue;
        }
        if (p.kind === "puff") {
          g.globalAlpha = 0.6 * (1 - t);
          g.fillStyle = "#f3e6c8";
          g.beginPath();
          g.arc(p.x, p.y, p.size * (0.6 + t * 0.9), 0, Math.PI * 2);
          g.fill();
          g.restore();
          continue;
        }
        if (p.kind === "glow") {
          g.globalCompositeOperation = "lighter";
          g.globalAlpha = 1 - t;
          const s = p.size * (1 - t * 0.5);
          g.drawImage(glowSprite(p.color!), p.x - s / 2, p.y - s / 2, s, s);
          g.restore();
          continue;
        }
        g.translate(p.x, p.y);
        g.rotate(p.r);
        if (p.kind === "rainbow" && petal.complete) g.drawImage(petal, -p.size / 2, -p.size / 2, p.size, p.size);
        else if (p.kind === "blossoms") {
          // a blossom tumbles as it falls: it narrows and widens as it turns over
          g.scale(0.35 + 0.65 * Math.abs(Math.cos(p.life * 0.07 + p.size)), 1);
          g.drawImage(blossomSprite(Math.round(p.size)), -p.size / 2, -p.size / 2, p.size, p.size);
        }
        else if (p.kind === "stars" && star.complete) g.drawImage(star, -p.size / 2, -p.size / 2, p.size, p.size);
        else if (p.kind === "twinkle") {
          const s = p.size * (t < 0.2 ? t / 0.2 : 1 - (t - 0.2) * 0.6);
          g.fillStyle = "#2b1d14";
          star4(g, s + 7);
          g.fillStyle = p.color ?? "#fff";
          star4(g, s);
        } else if (p.kind === "dust") {
          g.fillStyle = "rgba(255,244,220,.8)";
          g.beginPath();
          g.arc(0, 0, p.size * (0.5 + t), 0, Math.PI * 2);
          g.fill();
        } else {
          g.fillStyle = p.color ?? "#fff";
          if (p.kind === "confetti") g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          else {
            g.beginPath();
            g.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            g.fill();
          }
        }
        g.restore();
      }
      // nothing left to draw: this frame has cleared the canvas, so sleep until the next particle (add() wakes it)
      raf = particles.length ? requestAnimationFrame(loop) : 0;
    };
    wakeFx = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    wakeFx();
    return () => {
      wakeFx = null;
      cancelAnimationFrame(raf);
      raf = 0;
      if (fxDomEl === domRef.current) fxDomEl = null;
    };
  }, []);
  return (
    <>
      <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0, zIndex: 80, pointerEvents: "none" }} />
      <div ref={domRef} className="fx-dom" aria-hidden="true" />
    </>
  );
}

/** Tap-to-begin gate that also unlocks audio. */
export async function firstTap() {
  await unlockAudio();
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export { say, store };

/** Re-prompt after the child has been idle (no taps) for `ms`, while `active`. */
export function useIdlePrompt(active: boolean, ms: number, prompt: () => void, deps: unknown[] = []) {
  const ref = useRef(prompt);
  ref.current = prompt;
  useEffect(() => {
    if (!active) return;
    let t = window.setTimeout(fire, ms);
    function fire() {
      ref.current();
      t = window.setTimeout(fire, ms * 1.6);
    }
    const reset = () => {
      clearTimeout(t);
      t = window.setTimeout(fire, ms);
    };
    window.addEventListener("pointerdown", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [active, ...deps]);
}

/** A friendly pointing hand that taps at an element — for first-time players. */
export function TapHint({ show, style }: { show: boolean; style?: CSSProperties }) {
  if (!show) return null;
  return (
    // (the taphint keyframes are in styles.css: a <style> here would restyle the whole page each time a hand appears)
    <div style={{ position: "absolute", width: 110, height: 110, pointerEvents: "none", zIndex: 70, animation: "taphint 1.4s ease-in-out infinite", ...style }}>
      <svg viewBox="0 0 64 64" width="110" height="110">
        <path d="M26 30V12a5 5 0 0 1 10 0v16l3-1a5 5 0 0 1 6 3l1 1a5 5 0 0 1 6 4v8c0 9-6 16-15 16h-3c-6 0-10-3-13-8l-7-11a4 4 0 0 1 6-5l6 6z" fill="#fff4dc" stroke="#2b1d14" strokeWidth="4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ---------- the Help button: Sensei's portrait, always in the same corner on every screen.
// Each screen registers what help means there. Tapping again (n = 2, 3, ...) gives bigger clues.
type HelpFn = (n: number) => void;
const helpStack: { fn: { current: HelpFn }; count: number }[] = [];
const nudgeListeners = new Set<(on: boolean) => void>();
/** Register this screen's help. `deps` changing (e.g. a new question) resets the clue level. */
export function useHelp(fn: HelpFn, deps: unknown[] = []) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const entry = { fn: ref, count: 0 };
    helpStack.push(entry);
    return () => {
      const i = helpStack.indexOf(entry);
      if (i >= 0) helpStack.splice(i, 1);
    };
  }, deps);
}
/** useHelp outside a component (e.g. a scripted hold, src/ui/nav.tsx holdNext): on top of the stack until the returned
 *  function removes it. */
export function pushHelp(fn: HelpFn): () => void {
  const entry = { fn: { current: fn }, count: 0 };
  helpStack.push(entry);
  return () => {
    const i = helpStack.indexOf(entry);
    if (i >= 0) helpStack.splice(i, 1);
  };
}
/** Make the help button wiggle for attention (e.g. when a child seems stuck). */
export function nudgeHelp(on = true) {
  nudgeListeners.forEach((f) => f(on));
}
export function pressHelp() {
  const top = helpStack[helpStack.length - 1];
  if (!top) return;
  top.count++;
  top.fn.current(top.count);
}

const HELP_WAVES = ["M8 22c8 8 8 28 0 36", "M22 12c14 14 14 42 0 56", "M36 2c20 20 20 56 0 76"];
export function HelpButton() {
  const [talking, setTalking] = useState(false);
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    const c = currentCaption();
    setTalking(!!c && c.who === "sensei");
    return onCaption((c) => setTalking(!!c && c.who === "sensei"));
  }, []);
  useEffect(() => {
    const f = (on: boolean) => setNudge(on);
    nudgeListeners.add(f);
    return () => void nudgeListeners.delete(f);
  }, []);
  return (
    <button
      aria-label="Help"
      className={`help-btn ${talking ? "talking" : ""} ${nudge ? "nudge" : ""}`}
      {...tapProps(() => {
        sfx.tap();
        setNudge(false);
        pressHelp();
      })}
    >
      <TalkingFace who="sensei" className="help-face" />
      {/* the talking waves: three arcs, each its own HTML layer whose opacity pulses (an animation on the SVG paths
          themselves would be repainted every frame) */}
      {talking && (
        <span className="help-waves" aria-hidden="true">
          {HELP_WAVES.map((d) => (
            <i key={d}>
              <svg viewBox="0 0 60 80">
                <path d={d} />
              </svg>
            </i>
          ))}
        </span>
      )}
      {!talking && <span className="help-q">?</span>}
    </button>
  );
}

/** When Baron Muddle speaks: the screen darkens, thunder rumbles and his portrait storms in with his name.
 *  When Sensei speaks, his Help-button portrait glows and talks — so it's always clear who is speaking. */
/** Scenes where Baron Muddle is already on screen switch the cut-in off (no double Baron). */
let cutInBlocked = 0;
export function useBaronOnScreen(on = true) {
  useEffect(() => {
    if (!on) return;
    cutInBlocked++;
    return () => void cutInBlocked--;
  }, [on]);
}
export function VillainCutIn() {
  const [on, setOn] = useState(false);
  const [n, setN] = useState(0);
  useEffect(
    () =>
      onCaption((c) => {
        const baron = !!c && c.who === "baron" && cutInBlocked === 0;
        setOn((was) => {
          if (baron && !was) {
            sfx.thunder();
            shakeStage();
            setN((k) => k + 1);
          }
          return baron;
        });
      }),
    [],
  );
  if (!on) return null;
  return (
    // above the effects layer (80/81), so no stars or petals drift over Baron Muddle; below the Help button (85)
    <div key={n} style={{ position: "absolute", inset: 0, zIndex: 83, pointerEvents: "none" }}>
      <div className="villain-dark" />
      <div className="villain-card">
        <div className="villain-clip">
          <TalkingFace who="baron" />
        </div>
        <div className="villain-name">Baron Muddle</div>
      </div>
    </div>
  );
}

/** A character portrait whose mouth follows the speech audio in real time (see engine/lipsync.ts). */
export function TalkingFace({ who, className, style }: { who: "sensei" | "baron"; className?: string; style?: CSSProperties }) {
  const v = useViseme(who);
  useEffect(() => {
    for (const s of VISEMES) {
      const i = new Image();
      i.src = img(`${who}_mouth_${s}`);
    }
  }, [who]);
  return <img className={className} style={style} src={img(v === "rest" ? `${who}_mouth_base` : `${who}_mouth_${v}`)} alt="" draggable={false} />;
}
