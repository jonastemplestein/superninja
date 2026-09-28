// The World Flower v2's petal chart: pure helpers (docs/SCROLL_DESIGN.md §7.3). Geometry, the CSS masks and marks,
// the colours, a petal's lines, the fit of its letters, the colour's level and where it snaps, the sound line, and the
// half-sheet the chart opens on. Ported from the final mockup (docs/scroll-design/final/index.html: dropPath, tabled,
// levelTableTop, coloursOf, linesOf, fit, lineBoxes, snapLevel, stripeOf), not re-derived. No React, no DOM (except
// the `measure` callers pass in), so it is tested on its own (chartPetal.test.ts).
import type { PhonemeId } from "../content/phonics";
import { CHART_PETALS } from "../content/flower";
import type { PetalProgress } from "../content/progress";
import { mix } from "./petal";
import { gemLook, soundLineOf, type GemLook, type SoundLine } from "./petalLook";
import type { MultiSound } from "../content/progress";

/** The chart's layout, stage px (1280 × 720). */
export const CHART = {
  page: 720, row: 334, col: 234, sheetX: 172, sheetW: 936, padTop: [40, 12],
  petal: { x: 49, y: 30, w: 136, h: 296, stroke: 6, strokeDone: 8 }, pic: { x: 154, y: -2, size: 72 },
  big: { w: 250, h: 560, stroke: 8, strokeDone: 11 },
  star: { x: 97, y: 303, size: 42 }, glow: { x: 33, y: 14, w: 168, h: 328 },
  dots: { x: 1150, y: 176, w: 96, h: 368, at: [0, 28, 120, 148, 240, 268] },
} as const;

export const PAPER = "#fffdf8", INK = "#2b1d14";

// ---------------------------------------------------------------- shapes
export interface Drop {
  d: string;
  /** the half-width at y (0 = the round top) */
  half(y: number): number;
  t: Float32Array;
  H: number;
}
/** The chart's slim teardrop, W × H with a stroke of sw inside the box (the mockup's dropPath), tabled per row. */
export function chartDrop(W: number, H: number, sw: number): Drop {
  const r = (W - sw) / 2, cx = W / 2, cy = sw / 2 + r, ty = H - sw / 2 - 0.5, L = sw / 2, R = W - sw / 2;
  const k1 = cy + 0.4 * (ty - cy), k2x = cx - 0.15 * W, k2y = ty - 0.22 * (ty - cy);
  const f = (n: number) => +n.toFixed(2);
  const d = `M${f(cx)} ${f(ty)}C${f(k2x)} ${f(k2y)} ${f(L)} ${f(k1)} ${f(L)} ${f(cy)}A${f(r)} ${f(r)} 0 0 1 ${f(R)} ${f(cy)}C${f(R)} ${f(k1)} ${f(W - k2x)} ${f(k2y)} ${f(cx)} ${f(ty)}Z`;
  const B = (t: number, a: number, b: number, c: number, e: number) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * e;
  const exact = (y: number) => {
    if (y <= L) return 0;
    if (y <= cy) return Math.sqrt(Math.max(0, r * r - (cy - y) ** 2));
    if (y >= ty) return 0;
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) {
      const m = (lo + hi) / 2;
      if (B(m, cy, k1, k2y, ty) < y) lo = m;
      else hi = m;
    }
    return cx - B(lo, L, L, k2x, cx);
  };
  const t = new Float32Array(H + 1);
  for (let y = 0; y <= H; y++) t[y] = exact(y);
  return { d, half: (y) => t[Math.max(0, Math.min(H, Math.round(y)))], t, H };
}
/** Colouring in from the round top: the height (0..1 of the petal, from the top) above which `area` of it is coloured
 *  (true to area: the round top holds most of it, so a quarter-full petal is coloured about a third of the way). */
export function levelFromTop(drop: Pick<Drop, "t" | "H">): (area: number) => number {
  const H = drop.H, A = new Float32Array(H + 1);
  for (let k = 1; k <= H; k++) A[k] = A[k - 1] + 2 * drop.t[k - 1];
  return (f) => {
    if (f <= 0) return 0;
    if (f >= 1) return 1;
    const want = f * A[H];
    let k = 0;
    while (k < H && A[k] < want) k++;
    return k / H;
  };
}
/** Colour rising from the point (the flower: from the heart): the height (0..1 from the point) below which `area` is
 *  coloured. `t` is tabled from the round top (row 0) to the point (row H). */
export function levelFromPoint(drop: Pick<Drop, "t" | "H">): (area: number) => number {
  const H = drop.H, A = new Float32Array(H + 1);
  for (let k = 1; k <= H; k++) A[k] = A[k - 1] + 2 * drop.t[H - k];
  return (f) => {
    if (f <= 0) return 0;
    if (f >= 1) return 1;
    const want = f * A[H];
    let k = 0;
    while (k < H && A[k] < want) k++;
    return k / H;
  };
}
/** The game's flower teardrop (ui/petal.ts teardrop(w, h), round tip at the top, the point at the bottom), tabled: the
 *  half-width per unit row from the tip. Measured on the path itself (the mockup rasterised it once). */
export function flowerDrop(w: number, h: number): Pick<Drop, "t" | "H"> {
  const H = Math.round(h), r = w / 2, cy = r; // from the tip: the round top's centre is r down
  // the side curve, in tip coordinates: from (−r, cy) back to the point (0, h) via (−r, h/2 + .06h) and (−.12w, h/2 + .28h)
  const P0 = [-r, cy], P1 = [-r, h / 2 + h * 0.06], P2 = [-w * 0.12, h / 2 + h * 0.28], P3 = [0, h];
  const B = (t: number, i: 0 | 1) => (1 - t) ** 3 * P0[i] + 3 * (1 - t) ** 2 * t * P1[i] + 3 * (1 - t) * t * t * P2[i] + t ** 3 * P3[i];
  const t = new Float32Array(H + 1);
  for (let y = 0; y <= H; y++) {
    if (y <= cy) t[y] = Math.sqrt(Math.max(0, r * r - (cy - y) ** 2));
    else {
      let lo = 0, hi = 1;
      for (let i = 0; i < 28; i++) {
        const m = (lo + hi) / 2;
        if (B(m, 1) < y) lo = m;
        else hi = m;
      }
      t[y] = Math.max(0, -B(lo, 0));
    }
  }
  return { t, H };
}

export const PETAL_DROP = chartDrop(CHART.petal.w, CHART.petal.h, CHART.petal.stroke);
export const BIG_DROP = chartDrop(CHART.big.w, CHART.big.h, CHART.big.stroke);
export const SENSE_DROP = chartDrop(150, 300, 6);
export const PETAL_LEVEL = levelFromTop(PETAL_DROP);
export const BIG_LEVEL = levelFromTop(BIG_DROP);
export const SENSE_LEVEL = levelFromTop(SENSE_DROP);

// ---------------------------------------------------------------- the masks and marks (CSS custom properties)
const enc = (s: string) => encodeURIComponent(s);
const svgUrl = (W: number, H: number, body: string) => `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'>${body}</svg>`)}")`;
const svgImg = (W: number, H: number, body: string) => `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}'>${body}</svg>`)}")`;
export const GEM_D = "M10 2h20l8 10-18 22L2 12z";
const JEWEL_LINES = `<path d='M2 12h36M10 2l4 10 6 22 6-22 4-10' fill='none' stroke='rgba(43,29,20,.38)' stroke-width='1.6' stroke-linejoin='round'/>`;
export const STAR_D = "M20 2l5.3 11.6 12.6 1.4-9.4 8.6 2.7 12.4L20 29.7 8.8 36l2.7-12.4L2.1 15l12.6-1.4z";
export const STAR = svgImg(40, 40, `<path d='${STAR_D}' fill='#ffc53d' stroke='#2b1d14' stroke-width='2.8' stroke-linejoin='round'/><path d='M14 14l3-1 1 3z' fill='#fff6c8'/>`);
export const SPARKLE = svgImg(40, 40, `<path d='M20 1C21.6 13 27 18.4 39 20 27 21.6 21.6 27 20 39 18.4 27 13 21.6 1 20 13 18.4 18.4 13 20 1z' fill='#fff' stroke='#ffc53d' stroke-width='2.2' stroke-linejoin='round'/>`);
/** READY: the gold gem (0.9 scale in a 48 box: 1.3× a won jewel) on a white halo disc (r 20.5, a #ffd96b rim), with five
 *  rays: the only mark with rays. The disc keeps it apart from a won yellow or orange jewel (/ie/, /oe/, /n/, /y/) by
 *  more than hue (SCROLL_DESIGN §3.2). */
export const GOLD_GEM = svgImg(48, 48, `<circle cx='24' cy='26.5' r='20.5' fill='#fff' stroke='#ffd96b' stroke-width='2.2'/><g stroke='#f0a000' stroke-width='3.4' stroke-linecap='round'><path d='M24 1.8v6M6 9.5l4.4 4.2M42 9.5l-4.4 4.2M2 25.5h4M46 25.5h-4'/></g><g transform='translate(6 11.9) scale(.9)'><path d='${GEM_D}' fill='#ffd23f' stroke='#2b1d14' stroke-width='3.2' stroke-linejoin='round'/>${JEWEL_LINES}<path d='M12 4h6l-4 7z' fill='#fffbe0'/></g>`);
/** a gem still to win, in pencil */
export const GEM_LINE = svgImg(40, 36, `<path d='M2 12h36M10 2l4 10 6 22 6-22 4-10' fill='none' stroke='rgba(120,106,92,.3)' stroke-width='1.6' stroke-linejoin='round'/><path d='${GEM_D}' fill='none' stroke='#a1968a' stroke-width='2.8' stroke-linejoin='round'/>`);
/** WON: the ink outline (3.2) and facets only; the jewel's colour is solid, and its glint grows with polish (the CSS) */
export const GEM_WON = svgImg(40, 36, `${JEWEL_LINES}<path d='${GEM_D}' fill='none' stroke='#2b1d14' stroke-width='3.2' stroke-linejoin='round'/>`);
/** MASTERED: the glint has become a white four-point sparkle on the top facet, with a bright table */
export const GEM_MASTERED = svgImg(40, 36, `${JEWEL_LINES}<path d='M12 4h6l-4 7z' fill='#fff' fill-opacity='.85'/><path d='M14 1.5c.9 4.6 2.4 6.1 7 7-4.6.9-6.1 2.4-7 7-.9-4.6-2.4-6.1-7-7 4.6-.9 6.1-2.4 7-7z' fill='#fff' stroke='rgba(43,29,20,.35)' stroke-width='.8'/><path d='${GEM_D}' fill='none' stroke='#2b1d14' stroke-width='3.2' stroke-linejoin='round'/>`);
/** DUSTY: grey specks (#9a9086, ringed #6f655b) on the jewel, which stays solid colour */
export const GEM_DUST = svgImg(40, 36, `<g fill='#9a9086' stroke='#6f655b' stroke-width='.5'><circle cx='9' cy='8' r='1.9'/><circle cx='17' cy='5.5' r='1.4'/><circle cx='24' cy='11' r='2'/><circle cx='31' cy='7' r='1.4'/><circle cx='13' cy='15' r='1.6'/><circle cx='21' cy='19' r='1.5'/><circle cx='28' cy='15' r='1.3'/><circle cx='18' cy='25' r='1.3'/></g>`);

let masks: Record<string, string> | null = null;
/** Every mask and mark, as CSS custom properties: set them once on the chart's (or the card's) root. */
export function chartMasks(): Record<string, string> {
  if (masks) return masks;
  const { w: PW, h: PH, stroke: SW } = CHART.petal, { w: BW, h: BH, stroke: BSW } = CHART.big;
  const D = PETAL_DROP.d, BD = BIG_DROP.d;
  masks = {
    "--m-fill": svgUrl(PW, PH, `<path d='${D}'/>`),
    "--m-line": svgUrl(PW, PH, `<path d='${D}' fill='none' stroke='#000' stroke-width='${SW}' stroke-linejoin='round'/>`),
    "--m-line-b": svgUrl(PW, PH, `<path d='${D}' fill='none' stroke='#000' stroke-width='${SW + 2}' stroke-linejoin='round'/>`),
    "--m-dots": svgUrl(PW, PH, `<path d='${D}' fill='none' stroke='#000' stroke-width='${SW}' stroke-linecap='round' stroke-dasharray='0.01 15'/>`),
    "--m-bigline": svgUrl(BW, BH, `<path d='${BD}' fill='none' stroke='#000' stroke-width='${BSW}' stroke-linejoin='round'/>`),
    "--m-bigline-b": svgUrl(BW, BH, `<path d='${BD}' fill='none' stroke='#000' stroke-width='${BSW + 3}' stroke-linejoin='round'/>`),
    "--m-bigfill": svgUrl(BW, BH, `<path d='${BD}'/>`),
    "--m-gem": svgImg(40, 36, `<path d='${GEM_D}' stroke='#000' stroke-width='3' stroke-linejoin='round'/>`),
    "--m-glow": svgUrl(PW + 32, PH + 32, `<defs><filter id='b' x='-30%' y='-30%' width='160%' height='160%'><feGaussianBlur stdDeviation='6'/></filter></defs><path d='${D}' transform='translate(16 16)' fill='none' stroke='#000' stroke-width='12' filter='url(#b)'/>`),
    "--gem-line": GEM_LINE,
    "--gem-won": GEM_WON,
    "--gem-mastered": GEM_MASTERED,
    "--dust": GEM_DUST,
    "--gold-gem": GOLD_GEM,
    "--star": STAR,
    "--sparkle": SPARKLE,
  };
  return masks;
}

// ---------------------------------------------------------------- colours
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h: string) => {
  const [r, g, b] = rgb(h).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const inkOf = (c: string) => {
  for (let t = 0; t <= 1; t += 0.05) {
    const k = mix(c, INK, t);
    if (contrast(k, PAPER) >= 4.5) return k;
  }
  return INK;
};
/** the lightest wash of a colour that ink letters still read on at 5.2 : 1 */
const washAt = (c: string, want = 5.2) => {
  for (let t = 0; t <= 1; t += 0.02) {
    const k = mix(c, PAPER, t);
    if (contrast(k, INK) >= want) return t;
  }
  return 1;
};
export interface ChartColours { c: string; cj: string; ink: string; ghost: string; deep: string; w0: string; w1: string; wd: string; surf: string; lite: string; frost: string; jdeep: string; wash: string; dust: string }
const colourCache = new Map<string, ChartColours>();
/** A petal's colours (the mockup's coloursOf): /or/'s ink petal takes the flower's bronze for its jewels and wash. */
export function chartColours(c: string): ChartColours {
  let k = colourCache.get(c);
  if (k) return k;
  const cj = c === INK ? "#7a4a24" : c;
  const t0 = Math.max(0.12, washAt(cj)), t1 = Math.min(0.9, t0 + 0.4);
  k = {
    c, cj, ink: inkOf(c), ghost: mix(c, PAPER, 0.7), deep: c === INK ? INK : mix(c, INK, 0.12),
    w0: mix(cj, PAPER, t0), w1: mix(cj, PAPER, t1), wd: mix(cj, PAPER, Math.max(t0 - 0.3, washAt(cj, 3.2))), surf: mix(cj, INK, c === INK ? 0 : 0.08),
    lite: mix(cj, "#ffffff", 0.5), frost: mix(cj, "#ffffff", 0.62), jdeep: mix(cj, INK, 0.3), wash: mix(cj, "#ffffff", 0.72), dust: mix(mix(cj, PAPER, t0), "#a39a90", 0.55),
  };
  colourCache.set(c, k);
  return k;
}
/** The colour variables a petal (on the chart, the card or the fork panel) sets on its element. */
export function colourVars(c: string): Record<string, string> {
  const k = chartColours(c);
  return {
    "--c": k.c, "--cj": k.cj, "--ink-c": k.ink, "--ghost": k.ghost, "--c-deep": k.deep, "--w0": k.w0, "--w1": k.w1, "--wd": k.wd, "--surf": k.surf,
    "--cj-lite": k.lite, "--cj-frost": k.frost, "--cj-deep": k.jdeep, "--wash": k.wash, "--dustc": k.dust,
  };
}

// ---------------------------------------------------------------- a petal's lines
/** The chart's hint words over three petals: "book" over /uu/, "thin" and "this" over the two th petals. */
export const HINT: Partial<Record<PhonemeId, [string, string, string]>> = { uu: ["b", "oo", "k"], th: ["", "th", "in"], dh: ["", "th", "is"] };
export interface Line {
  g: string;
  key?: string;
  look?: GemLook;
  hint?: boolean;
  line?: SoundLine | null;
}
/** Is a line a met spelling (in ink, with its gem)? */
export const isMetLine = (ln: Line) => !ln.hint && !!ln.look && ln.look.mark !== "none";
/** A petal's lines: its hint word first, then each spelling on its chart column once, in the chart's order. */
export function linesOf(pr: PetalProgress, multi: readonly MultiSound[] = [], sure?: (g: string, p: PhonemeId) => boolean): Line[] {
  const out: Line[] = [];
  const h = HINT[pr.p];
  if (h) out.push({ hint: true, g: h.join("") });
  const seen = new Set<string>();
  for (const sp of pr.spellings) {
    if (seen.has(sp.g)) continue;
    seen.add(sp.g);
    const look = gemLook(sp);
    out.push({ g: sp.g, key: sp.key, look, line: look.mark !== "none" ? soundLineOf(sp.g, pr.p, multi, sure) : null });
  }
  return out;
}
/** A line's signature (for memo keys). */
export const lineSig = (ln: Line) => (ln.hint ? `h${ln.g}` : `${ln.key}:${ln.look?.mark}:${ln.look?.e.toFixed(2)}:${ln.look?.polish.toFixed(2)}:${ln.look?.dusty ? 1 : 0}:${ln.line ? ln.line.segments.map((s) => s.p + (s.sure ? "!" : "")).join("") : ""}`);

// ---------------------------------------------------------------- fitting the letters (v1's fit, with room for the marks)
export interface FitOpts { top: number; bottom: number; pad: number; M0: number; Mmin: number; F0: number; Fmin: number; rLo: number; rHi: number; gapMax: number; picY?: number; picHalf?: number; card?: boolean }
export const SHEET_FIT: FitOpts = { top: 16, bottom: CHART.petal.h - 30, pad: 8, M0: 58, Mmin: 26, F0: 46, Fmin: 22, rLo: 0.62, rHi: 0.85, picY: 34, picHalf: 72, gapMax: 22 };
export const CARD_FIT: FitOpts = { top: 44, bottom: CHART.big.h - 84, pad: 12, M0: 104, Mmin: 48, F0: 70, Fmin: 34, rLo: 0.6, rHi: 0.8, card: true, gapMax: 18 };
/** a met spelling's gem meter width */
export const gemW = (M: number, card?: boolean) => (card ? Math.max(40, M * 0.52) : Math.max(24, M * 0.5));
/** the ready mark's box (the gold gem on its white disc, with rays): 1.72 × the gem meter (on the chart max(41, .86 M)) */
export const readyW = (M: number, card?: boolean) => gemW(M, card) * 1.72;
export interface Fit { M: number; F: number; gap: number; top: number }
/** The sizes that fit a petal's column (*M* met, *F* pencil), the air between lines and where the column starts. */
export function fitColumn(lines: readonly Line[], drop: Pick<Drop, "half">, o: FitOpts, measure: (text: string, px: number) => number): Fit {
  const Hh = (M: number, F: number) => Math.min(F, M * 0.6);
  const lh = (ln: Line, M: number, F: number) => (ln.hint ? Hh(M, F) * 1.3 : isMetLine(ln) ? M * 1.12 : F * 1.2);
  const mark = (ln: Line, M: number) => (ln.hint || !isMetLine(ln) ? 0 : ln.look!.mark === "ready" ? readyW(M, o.card) + M * 0.03 - 2 : gemW(M, o.card) + M * 0.1);
  const tryFit = (M: number, F: number, gap: number, top: number) => {
    let y = top;
    for (const ln of lines) {
      const h = lh(ln, M, F);
      const w = measure(ln.hint ? `“${ln.g}”` : ln.g, ln.hint ? Hh(M, F) : !isMetLine(ln) ? F : M) + (o.card ? 28 : 0);
      const avail = Math.min(drop.half(y + h * 0.15), drop.half(y + h * 0.9)) - o.pad;
      const right = o.picY && y < o.picY ? Math.min(avail, o.picHalf ?? avail) : avail;
      if (w / 2 > avail || w / 2 + mark(ln, M) > right) return false;
      y += h + gap;
    }
    return y - gap <= o.bottom;
  };
  const anyMet = lines.some(isMetLine);
  for (const [lo, hi] of [[o.rLo, o.rHi], [0, 1]])
    for (let M = o.M0; M >= o.Mmin; M -= 1)
      for (let F = Math.min(o.F0, Math.round(M * hi)); F >= Math.max(o.Fmin, Math.round(M * lo)); F -= 1) {
        const top = [0, 6, 12, 18, 24].map((d) => o.top + d).find((t) => tryFit(M, F, 0, t));
        if (top === undefined) continue;
        let gap = o.gapMax;
        while (gap > 0 && !tryFit(M, F, gap, top + gap * 0.5)) gap -= 1;
        return { M, F: anyMet ? F : Math.min(F, M), gap, top };
      }
  return { M: o.Mmin, F: o.Fmin, gap: 0, top: o.top };
}
/** Where each line sits (px from the petal's top), as the CSS lays them out: the column starts at top + gap / 2. */
export function lineBoxes(lines: readonly Line[], fit: Fit, card?: boolean): [number, number][] {
  const out: [number, number][] = [];
  let y = fit.top + fit.gap * 0.5;
  for (const ln of lines) {
    const h = ln.hint ? Math.min(fit.F, fit.M * 0.6) * 1.3 : isMetLine(ln) ? fit.M * (card ? 1.14 : 1.12) : fit.F * 1.2;
    out.push([y, y + h]);
    y += h + fit.gap;
  }
  return out;
}
/** THE SURFACE NEVER CUTS A SPELLING, AND THE COLOUR HOLDS WHAT THE CHILD HAS WON (SCROLL_DESIGN §3.4.3). The area-true
 *  level (0..1 from the top) moves to a line's edge: a won spelling is coloured in (its bottom edge), a pencil one never
 *  is (its top edge), any other goes to the nearer edge. Then won spellings straight below are taken in, and pencil ones
 *  straight above are left out. */
export function snapLevel(lv: number, boxes: readonly [number, number][], H: number, lines: readonly Line[]): number {
  if (lv <= 0 || lv >= 1) return lv;
  let y = lv * H;
  const won = (i: number) => !!lines[i].look && (lines[i].look!.mark === "won" || lines[i].look!.mark === "mastered");
  const pencil = (i: number) => !lines[i].hint && !isMetLine(lines[i]);
  for (let i = 0; i < boxes.length; i++) {
    const [a, b] = boxes[i];
    if (y > a && y < b) {
      y = lines[i].hint ? a : won(i) ? b : pencil(i) ? a : y - a < b - y ? a : b;
      break;
    }
  }
  for (let i = boxes.findIndex(([a]) => a >= y - 0.5); i >= 0 && i < boxes.length && won(i); i++) y = boxes[i][1];
  for (let i = boxes.map(([, b]) => b <= y + 0.5).lastIndexOf(true); i >= 0 && (pencil(i) || !!lines[i].hint); i--) y = boxes[i][0];
  return Math.max(0, Math.min(1, y / H));
}
/** A petal's layout as CSS variables (the mockup's layoutVars), and its line boxes. `prefix` "B" for the card. */
export function layoutVars(lines: readonly Line[], drop: Pick<Drop, "half">, o: FitOpts, measure: (text: string, px: number) => number, prefix = ""): { fit: Fit; boxes: [number, number][]; vars: Record<string, string> } {
  const fit = fitColumn(lines, drop, o, measure);
  const gw = gemW(fit.M, o.card);
  return {
    fit,
    boxes: lineBoxes(lines, fit, o.card),
    vars: {
      [`--${prefix}M`]: `${fit.M}px`, [`--${prefix}F`]: `${fit.F}px`, "--gap": `${fit.gap}px`, "--top": `${(fit.top + fit.gap * 0.5).toFixed(1)}px`,
      "--gw": `${gw.toFixed(1)}px`, "--rw": `${readyW(fit.M, o.card).toFixed(1)}px`, "--msh": `${Math.max(4, fit.M * 0.085).toFixed(1)}px`,
    },
  };
}

// ---------------------------------------------------------------- the sound line (MULTI_SOUND.md §7.2)
/** The segments as a CSS image (the mockup's stripeOf): solid when sure, two faint dashes until then. */
export function soundLineImage(s: SoundLine): string {
  let body = "";
  const n = s.segments.length;
  s.segments.forEach((x, i) => {
    const x0 = i * 100 + (i ? 5 : 0), x1 = (i + 1) * 100 - (i < n - 1 ? 5 : 0);
    if (x.sure) body += `<rect x='${x0}' y='0' width='${x1 - x0}' height='10' fill='${x.colour}'/>`;
    else for (let x2 = x0 + 4; x2 < x1 - 8; x2 += 48) body += `<rect x='${x2}' y='1' width='${Math.min(30, x1 - 4 - x2)}' height='8' fill='${x.colour}' fill-opacity='.55'/>`;
  });
  return svgUrl(n * 100, 10, body);
}

// ---------------------------------------------------------------- the half-sheets
/** The half-sheet a petal sits on (0–5): sheet 1 top, sheet 1 bottom, sheet 2 top, … */
export const halfOf = (p: PhonemeId): number => {
  const c = CHART_PETALS.find((x) => x.p === p);
  if (!c) return 0;
  const onSheet = CHART_PETALS.filter((x) => x.page === c.page);
  return (c.page - 1) * 2 + (onSheet.indexOf(c) >= 8 ? 1 : 0);
};
/** The half-sheet the chart opens on (SCROLL_DESIGN §3.4.4): a trip's gem, else the first petal (chart order) with a
 *  gem ready for its battle, else the petal of the child's newest spelling, else the top of sheet 1. */
export function landingHalf(ctx: { focus?: PhonemeId | null; landing?: PhonemeId | null; reveal?: PhonemeId | null; ready: (p: PhonemeId) => boolean; newest?: PhonemeId | null }): number {
  const p = ctx.landing ?? ctx.focus ?? ctx.reveal ?? CHART_PETALS.find((c) => ctx.ready(c.p))?.p ?? ctx.newest ?? null;
  return p ? halfOf(p) : 0;
}
