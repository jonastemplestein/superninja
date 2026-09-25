// Shared UI: stage scaling, sprites, icons, sensei dock, tiles, particles.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { onCaption, sfx, say, unlockAudio } from "../engine/audio";
import { store, useSave } from "../engine/store";
import { useViseme, VISEMES } from "../engine/lipsync";

export const W = 1280;
export const H = 720;
export const img = (id: string) => `/a/i/${id}.webp`;

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
      <div className="rotate">
        <img src={img("hero_kai_idle")} alt="" />
        Turn your device sideways!
      </div>
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
export const Icon = {
  ear: () => (
    <svg viewBox="0 0 64 64"><path {...P} d="M20 26a14 14 0 1 1 26 7c-3 5-8 6-8 12a7 7 0 0 1-12 4" /><path {...P} d="M28 27a5 5 0 1 1 9 3" /></svg>
  ),
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
  tree: () => (
    <svg viewBox="0 0 64 64"><path {...P} d="M32 58V34m0 6-10-8m10 2 9-9" /><circle {...P} fill="#ff7aa2" cx="20" cy="22" r="9" /><circle {...P} fill="#ff7aa2" cx="40" cy="18" r="10" /><circle {...P} fill="#ffc53d" cx="32" cy="30" r="7" /></svg>
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
};

export function RoundButton({ onClick, children, className = "", label, style, sm }: { onClick: () => void; children: ReactNode; className?: string; label: string; style?: CSSProperties; sm?: boolean }) {
  return (
    <button
      className={`btn-round ${sm ? "sm" : ""} ${className}`}
      aria-label={label}
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

// ---------- sensei dock with live captions
export function SenseiDock({ hidden, auto }: { hidden?: boolean; auto?: boolean }) {
  const [cap, setCap] = useState<{ text: string; who: string } | null>(null);
  const captions = useSave((s) => s.settings.captions);
  useEffect(() => onCaption(setCap), []);
  if (hidden) return null;
  void auto;
  // Sensei himself lives in the Help button (bottom-left); this only shows the caption bubble beside him.
  return cap && captions ? <div className={`bubble ${cap.who === "baron" ? "baron" : ""}`} key={cap.text}>{cap.text}</div> : null;
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
type Particle = { x: number; y: number; vx: number; vy: number; r: number; vr: number; life: number; max: number; size: number; kind: string; color?: string };
const particles: Particle[] = [];
const imgs: Record<string, HTMLImageElement> = {};
function getImg(id: string) {
  if (!imgs[id]) {
    imgs[id] = new Image();
    imgs[id].src = img(id);
  }
  return imgs[id];
}
export const fx = {
  burst(x: number, y: number, kind: "petals" | "stars" | "sparks" | "confetti" | "dust" = "sparks", n = 18, spread = 1) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (kind === "dust" ? 2 : 4 + Math.random() * 7) * spread;
      particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === "confetti" ? 6 : 2),
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 0,
        max: kind === "petals" || kind === "confetti" ? 80 + Math.random() * 50 : kind === "dust" ? 30 : 40 + Math.random() * 25,
        size: kind === "petals" ? 26 + Math.random() * 18 : kind === "stars" ? 22 + Math.random() * 20 : kind === "dust" ? 16 + Math.random() * 14 : 6 + Math.random() * 8,
        kind,
        color: kind === "confetti" ? ["#ff7aa2", "#ffc53d", "#5ec8f2", "#6cc04a", "#9b6cf0", "#fff4dc"][i % 6] : kind === "sparks" ? ["#fff4dc", "#ffc53d", "#ffe38a"][i % 3] : undefined,
      });
    }
  },
  rain(kind: "petals" | "confetti" = "confetti", n = 60) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W, y: -40 - Math.random() * 300, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, life: 0, max: 260, size: kind === "petals" ? 28 + Math.random() * 16 : 8 + Math.random() * 8, kind,
        color: ["#ff7aa2", "#ffc53d", "#5ec8f2", "#6cc04a", "#9b6cf0", "#fff4dc"][i % 6],
      });
    }
  },
};
export function FxLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    let raf = 0;
    const petal = getImg("item_petal");
    const star = getImg("item_star");
    const loop = () => {
      g.clearRect(0, 0, W, H);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.kind === "petals" || p.kind === "confetti") {
          p.vx *= 0.97;
          p.vy = p.vy * 0.97 + 0.18;
          p.x += Math.sin(p.life / 9 + i) * 0.8;
        } else if (p.kind === "dust") {
          p.vx *= 0.9;
          p.vy *= 0.9;
        } else {
          p.vx *= 0.93;
          p.vy = p.vy * 0.93 + 0.25;
        }
        const t = p.life / p.max;
        if (t >= 1 || p.y > H + 80) {
          particles.splice(i, 1);
          continue;
        }
        g.save();
        g.globalAlpha = t > 0.7 ? (1 - t) / 0.3 : 1;
        g.translate(p.x, p.y);
        g.rotate(p.r);
        if (p.kind === "petals" && petal.complete) g.drawImage(petal, -p.size / 2, -p.size / 2, p.size, p.size);
        else if (p.kind === "stars" && star.complete) g.drawImage(star, -p.size / 2, -p.size / 2, p.size, p.size);
        else if (p.kind === "dust") {
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
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0, zIndex: 80, pointerEvents: "none" }} />;
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
    <div style={{ position: "absolute", width: 110, height: 110, pointerEvents: "none", zIndex: 70, animation: "taphint 1.4s ease-in-out infinite", ...style }}>
      <style>{`@keyframes taphint{0%,100%{transform:translate(0,0) scale(1)}45%{transform:translate(-10px,-18px) scale(1.05)}60%{transform:translate(0,0) scale(.92)}}`}</style>
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

export function HelpButton() {
  const [talking, setTalking] = useState(false);
  const [nudge, setNudge] = useState(false);
  useEffect(() => onCaption((c) => setTalking(!!c && c.who === "sensei")), []);
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
      {talking && (
        <svg className="help-waves" viewBox="0 0 60 80" aria-hidden="true">
          <path d="M8 22c8 8 8 28 0 36" />
          <path d="M22 12c14 14 14 42 0 56" />
          <path d="M36 2c20 20 20 56 0 76" />
        </svg>
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
    <div key={n} style={{ position: "absolute", inset: 0, zIndex: 75, pointerEvents: "none" }}>
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
