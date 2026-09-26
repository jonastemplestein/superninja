// The petal shape and colour helpers, shared by the World Flower (src/scenes/Tree.tsx) and the sound pictures
// (src/ui/SoundBadge.tsx), so scenes that show a sound don't import the World Flower. docs/NAVIGATION.md §4.
// (Tree.tsx still has its own copies of teardrop/teardropAt/mix; it should import these instead when it is next edited.)
import type { PhonemeId } from "../content/phonics";
import { chartOf } from "../content/flower";

/** Teardrop petal (round top, point at the bottom), centred on 0,0: the shape on the school's sheet. */
export const teardrop = (w: number, h: number) => teardropAt(w, h, 0, 0);
/** The same teardrop centred on (x, y), e.g. for a CSS clip-path, which works in the element's own box. */
export function teardropAt(w: number, h: number, x: number, y: number) {
  const r = w / 2;
  const cy = -h / 2 + r;
  const P = (px: number, py: number) => `${+(px + x).toFixed(2)},${+(py + y).toFixed(2)}`;
  return `M${P(0, h / 2)} C${P(-w * 0.12, h * 0.28)} ${P(-r, h * 0.06)} ${P(-r, cy)} A${r},${r} 0 0 1 ${P(r, cy)} C${P(r, h * 0.06)} ${P(w * 0.12, h * 0.28)} ${P(0, h / 2)} Z`;
}

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
/** Mix two #rrggbb colours: t = 0 is `a`, 1 is `b`. */
export const mix = (a: string, b: string, t: number) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));

/** The sound's chart picture (public/a/i/petal_<id>.webp): what a child sees for a sound, never letters. */
export const petalImg = (p: PhonemeId) => `/a/i/petal_${p}.webp`;
/** The sound's chart colour; the chart's ink-dark /or/ is painted deep bronze so it doesn't read as a hole. */
export const petalColour = (p: PhonemeId) => {
  const c = chartOf(p)?.colour ?? "#a08a74";
  return c === "#2b1d14" ? "#7a4a24" : c;
};
