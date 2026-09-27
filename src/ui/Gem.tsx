// A faceted gemstone with a spelling on it. States: future (outline), hidden (mystery), charging (energy: the petal's
// colour rising inside the stone like a liquid, re-audit r2), ready (glowing, bouncing), won (sparkling jewel).
// Everything that moves for ever is an HTML layer moved with transform or opacity (docs/PERF.md fix 4): the liquid's
// rocking surface slides as one layer inside a gem-shaped clip, and a ready gem's pulsing glow is a gem-shaped layer
// behind it (styles.css .gem-icon::before) whose opacity pulses.
import { useEffect, useState, type CSSProperties } from "react";
import type { GemState } from "../engine/gems";

// jewel colours: vowels warm, consonants cool (matches petal colours)
function shades(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const mix = (t: number, to: number) => `rgb(${Math.round(r + (to - r) * t)},${Math.round(g + (to - g) * t)},${Math.round(b + (to - b) * t)})`;
  return { light: mix(0.55, 255), mid: hex, dark: mix(0.45, 20) };
}

const GEM = "50,4 88,24 96,62 50,96 4,62 12,24";
/** The same outline as a CSS clip (the gem's box is 100 units, so a unit is 1 %). */
const GEM_CLIP = "polygon(50% 4%, 88% 24%, 96% 62%, 50% 96%, 4% 62%, 12% 24%)";
/** The liquid's surface, 40 units a wave, drawn from x -20 to 140 so that sliding it 40 units left loops seamlessly. */
const WAVE = "M-20,0 Q0,-5 20,0 T60,0 T100,0 T140,0";

export function GemIcon({ g, colour, state, energy = 0, size = 110, style }: { g: string; colour: string; state: GemState; energy?: number; size?: number; style?: CSSProperties }) {
  const c = shades(colour);
  const on = state === "won";
  const dim = state === "future" || state === "hidden";
  const id = `gm${Math.random().toString(36).slice(2, 8)}`;
  const font = g.length > 3 ? 20 : g.length > 2 ? 24 : g.length > 1 ? 30 : 36;
  const charging = state === "charging";
  // the energy's surface: from the gem's point (y 96, empty) up to its top (y 4, full)
  const level = 96 - Math.max(0, Math.min(1, energy)) * 92;
  // the surface starts rocking once the gem has arrived (1.2 s): a gem popping in (the reward's, one after another)
  // is invisible for its first moments, and nothing loops unseen
  const [rocking, setRocking] = useState(false);
  useEffect(() => {
    if (!charging) return;
    const t = window.setTimeout(() => setRocking(true), 1200);
    return () => clearTimeout(t);
  }, [charging]);
  const box: CSSProperties = { position: "absolute", inset: charging ? "4%" : "10%", width: charging ? "92%" : "80%", height: charging ? "92%" : "80%", overflow: "visible" };
  const glow = on || state === "ready" ? `drop-shadow(0 0 8px ${c.light})` : charging && energy > 0 ? `drop-shadow(0 0 ${3 + energy * 6}px ${c.light})` : undefined;
  const fill = (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={dim ? "#efe6d6" : on ? c.light : charging ? "#fffaf0" : "#fff6e6"} />
      <stop offset="1" stopColor={dim ? "#cfc3ae" : on ? c.dark : charging ? "#e3dbe8" : "#e8d8bd"} />
    </linearGradient>
  );
  // over the stone (and over the liquid when charging): facets, the highlight and the spelling
  const top = (
    <>
      {!dim && (
        <g stroke="#2b1d14" strokeWidth="2" opacity={on ? 0.5 : 0.25} fill="none">
          <polyline points="12,24 30,30 50,24 70,30 88,24" />
          <polyline points="30,30 50,96 70,30" />
          <path d="M4,62 L30,30 M96,62 L70,30" />
        </g>
      )}
      {(on || charging) && <polygon points="24,20 40,14 34,30" fill="#fff" opacity={on ? 0.75 : 0.6} />}
      <text x="50" y="60" textAnchor="middle" fontFamily="Andika, sans-serif" fontWeight={700} fontSize={charging ? font * 1.1 : font} fill={on ? "#fff" : "#2b1d14"} opacity={dim ? 0.35 : 1} style={on ? { paintOrder: "stroke", stroke: "#2b1d14", strokeWidth: 5 } : charging ? { paintOrder: "stroke", stroke: "#fffaf0", strokeWidth: 6 } : undefined}>
        {state === "hidden" ? "?" : g}
      </text>
    </>
  );
  return (
    <div className={`gem-icon ${state}${state === "ready" ? " gem-ready" : ""}`} style={{ position: "relative", width: size, height: size, ...style }}>
      {charging ? (
        // the stone, the liquid (an HTML layer, so its rocking runs on the compositor) and the outline over it, glowing
        // together
        <div style={{ ...box, filter: glow }}>
          <svg viewBox="0 0 100 100" className="gem-layer">
            <defs>{fill}</defs>
            <polygon points={GEM} fill={`url(#${id})`} />
          </svg>
          <div className="gem-liq" style={{ clipPath: GEM_CLIP }}>
            {/* the petal's colour rising inside the stone, with a gently rocking surface */}
            <div className="gem-liq-level" style={{ transform: `translateY(${level}%)` }}>
              <div className={`gem-liquid ${rocking ? "on" : ""}`}>
                <svg viewBox="-20 -5 160 125" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={c.light} />
                      <stop offset="0.35" stopColor={c.mid} />
                      <stop offset="1" stopColor={c.dark} />
                    </linearGradient>
                  </defs>
                  <path d={`${WAVE} V120 H-20 Z`} fill={`url(#${id}f)`} />
                  <path d={WAVE} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
          <svg viewBox="0 0 100 100" className="gem-layer">
            <polygon points={GEM} fill="none" stroke="#2b1d14" strokeWidth="5" strokeLinejoin="round" />
            {top}
          </svg>
        </div>
      ) : (
        <svg viewBox="0 0 100 100" style={{ ...box, filter: glow }}>
          <defs>{fill}</defs>
          {/* cut gem: table + crown facets */}
          <polygon points={GEM} fill={`url(#${id})`} stroke="#2b1d14" strokeWidth="5" strokeLinejoin="round" strokeDasharray={state === "future" ? "7 7" : undefined} />
          {top}
        </svg>
      )}
      {on && <span className="gem-sparkle" />}
    </div>
  );
}
