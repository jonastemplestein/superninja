// A faceted gemstone with a spelling on it. States: future (outline), hidden (mystery), charging (energy ring),
// ready (glowing, bouncing), won (sparkling jewel).
import type { CSSProperties } from "react";
import type { GemState } from "../engine/gems";

// jewel colours: vowels warm, consonants cool (matches petal colours)
function shades(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const mix = (t: number, to: number) => `rgb(${Math.round(r + (to - r) * t)},${Math.round(g + (to - g) * t)},${Math.round(b + (to - b) * t)})`;
  return { light: mix(0.55, 255), mid: hex, dark: mix(0.45, 20) };
}

export function GemIcon({ g, colour, state, energy = 0, size = 110, style }: { g: string; colour: string; state: GemState; energy?: number; size?: number; style?: CSSProperties }) {
  const c = shades(colour);
  const on = state === "won";
  const dim = state === "future" || state === "hidden";
  const id = `gm${Math.random().toString(36).slice(2, 8)}`;
  const font = g.length > 3 ? 20 : g.length > 2 ? 24 : g.length > 1 ? 30 : 36;
  return (
    <div className={state === "ready" ? "gem-ready" : ""} style={{ position: "relative", width: size, height: size, ...style }}>
      {state === "charging" && (
        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(43,29,20,.18)" strokeWidth="7" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#ffc53d" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${energy * 289} 289`} transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.3,1.2,.5,1)" }} />
        </svg>
      )}
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: "10%", width: "80%", height: "80%", overflow: "visible", filter: on || state === "ready" ? `drop-shadow(0 0 8px ${c.light})` : undefined }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={dim ? "#efe6d6" : on ? c.light : "#fff6e6"} />
            <stop offset="1" stopColor={dim ? "#cfc3ae" : on ? c.dark : "#e8d8bd"} />
          </linearGradient>
        </defs>
        {/* cut gem: table + crown facets */}
        <polygon points="50,4 88,24 96,62 50,96 4,62 12,24" fill={`url(#${id})`} stroke="#2b1d14" strokeWidth="5" strokeLinejoin="round" strokeDasharray={state === "future" ? "7 7" : undefined} />
        {!dim && (
          <g stroke="#2b1d14" strokeWidth="2" opacity={on ? 0.5 : 0.25} fill="none">
            <polyline points="12,24 30,30 50,24 70,30 88,24" />
            <polyline points="30,30 50,96 70,30" />
            <path d="M4,62 L30,30 M96,62 L70,30" />
          </g>
        )}
        {on && <polygon points="24,20 40,14 34,30" fill="#fff" opacity={0.75} />}
        <text x="50" y="60" textAnchor="middle" fontFamily="Andika, sans-serif" fontWeight={700} fontSize={font} fill={on ? "#fff" : "#2b1d14"} opacity={dim ? 0.35 : 1} style={on ? { paintOrder: "stroke", stroke: "#2b1d14", strokeWidth: 5 } : undefined}>
          {state === "hidden" ? "?" : g}
        </text>
      </svg>
      {on && <span className="gem-sparkle" />}
    </div>
  );
}
