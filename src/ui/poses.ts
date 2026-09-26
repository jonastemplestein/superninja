// Hero pose sprites: public/a/i/hero_<kai|suki>_<pose>.webp.
// The move poses (kick, punch, spin, power, think, listen, ready, flip) are newer art. Until a file exists, a pose falls back
// to the nearest original pose; a startup probe (Image onload/onerror) switches each one over by itself.
// New sprites are trimmed to their content, so a flying kick is drawn at a different pixel scale from the idle pose.
// poseFit() measures each sprite's painted area and centre so every pose shows the ninja at the same size and spot.
import { useSyncExternalStore } from "react";

export type Hero = "kai" | "suki";
export type Pose = "idle" | "run" | "jump" | "throw" | "cast" | "hurt" | "cheer" | "kick" | "punch" | "spin" | "power" | "think" | "listen" | "ready" | "flip";
export const BASE_POSES: Pose[] = ["idle", "run", "jump", "throw", "cast", "hurt", "cheer"];
/** Move pose → the original pose used until its sprite exists. */
export const FALLBACK: Partial<Record<Pose, Pose>> = { kick: "throw", punch: "throw", spin: "jump", power: "cheer", think: "idle", listen: "think", ready: "idle", flip: "jump" };
/** Hand-tuned size multipliers per pose, applied on top of the measured fit (1 = trust the measurement). */
const TWEAK: Partial<Record<Pose, number>> = { flip: 0.9, spin: 0.95 };

const url = (h: string, p: string) => `/a/i/hero_${h}_${p}.webp`;
interface Fit {
  /** natural size */
  w: number;
  h: number;
  /** opaque area in natural pixels */
  area: number;
  /** opaque centroid x as a fraction of the width */
  cx: number;
}
const fits = new Map<string, Fit>();
const missing = new Set<string>();
let version = 0;
const subs = new Set<() => void>();
const bump = () => {
  version++;
  subs.forEach((f) => f());
};

function measure(im: HTMLImageElement): Fit {
  const w = im.naturalWidth, h = im.naturalHeight;
  let area = w * h * 0.55, cx = 0.5;
  try {
    const sw = 96, sh = Math.max(1, Math.round((h * sw) / w));
    const c = document.createElement("canvas");
    c.width = sw;
    c.height = sh;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(im, 0, 0, sw, sh);
    const d = g.getImageData(0, 0, sw, sh).data;
    let n = 0, sx = 0;
    for (let y = 0; y < sh; y++)
      for (let x = 0; x < sw; x++)
        if (d[(y * sw + x) * 4 + 3] > 110) {
          n++;
          sx += x;
        }
    if (n > 50) {
      area = n * (w / sw) * (h / sh);
      cx = sx / n / sw;
    }
  } catch {}
  return { w, h, area, cx };
}

let probed = false;
/** Probe every hero pose once (called on first use). */
export function probePoses() {
  if (probed || typeof window === "undefined") return;
  probed = true;
  for (const h of ["kai", "suki"])
    for (const p of [...BASE_POSES, ...(Object.keys(FALLBACK) as Pose[])]) {
      const im = new Image();
      im.onload = () => {
        fits.set(`${h}_${p}`, measure(im));
        missing.delete(`${h}_${p}`);
        bump();
      };
      im.onerror = () => {
        missing.add(`${h}_${p}`);
      };
      im.src = url(h, p);
    }
}
if (typeof window !== "undefined") setTimeout(probePoses, 0);

/** Is this pose's own sprite available (not a fallback)? */
export const hasPose = (hero: string, pose: Pose) => fits.has(`${hero}_${pose}`);

/** The pose actually drawn (the move pose if its sprite exists, else its fallback). */
export function resolvePose(hero: string, pose: Pose): Pose {
  if (BASE_POSES.includes(pose)) return pose;
  return fits.has(`${hero}_${pose}`) ? pose : (FALLBACK[pose] ?? "idle");
}
export const poseSrc = (hero: string, pose: Pose) => url(hero, resolvePose(hero, pose));

/**
 * How to draw a pose so the ninja stays the same size and in the same place: `scale` multiplies the display width
 * (1 = as wide as the idle sprite), `dx` shifts it sideways as a fraction of the idle display width, and `aspect` is
 * height / width.
 */
export function poseFit(hero: string, pose: Pose): { scale: number; dx: number; aspect: number } {
  const r = resolvePose(hero, pose);
  const f = fits.get(`${hero}_${r}`);
  const idle = fits.get(`${hero}_idle`);
  if (!f) return { scale: 1, dx: 0, aspect: r === "idle" ? 1.34 : 1.3 };
  // the original poses share one canvas scale (640 px wide): draw them as they always were
  if (BASE_POSES.includes(r) || !idle) return { scale: 1, dx: 0, aspect: f.h / f.w };
  const k = (f.w / idle.w) * Math.sqrt(idle.area / f.area) * (TWEAK[r] ?? 1);
  const scale = Math.max(0.6, Math.min(1.9, k));
  // line the pose's centre of mass up with the idle pose's
  return { scale, dx: idle.cx - 0.5 - scale * (f.cx - 0.5), aspect: f.h / f.w };
}

/** Re-render when a probe lands (so new sprites switch in without a reload). */
export function usePoseVersion() {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => void subs.delete(cb);
    },
    () => version,
  );
}
