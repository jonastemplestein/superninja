// The World Flower v2: the one mapping from the progress model (src/content/progress.ts) to what is drawn
// (docs/SCROLL_DESIGN.md §3.1, §3.2, §7.2). A petal is missing → outline → filling → complete, the same on the flower
// and the chart; a gem's meter is none → glass → fill → ready → won → mastered, with dust when it fades. Pure: no React.
import type { PhonemeId } from "../content/phonics";
import type { FlowerOverview, GemProgress, MultiSound, PetalSummary } from "../content/progress";
import { petalColour } from "./petal";

export type LookStage = "missing" | "outline" | "filling" | "complete";
export interface PetalLook {
  p: PhonemeId;
  /** missing: state "missing" · complete: complete.full · outline: whole ≤ 0.004 · else filling */
  stage: LookStage;
  /** 0..1 of the petal's area to colour: `whole` (1 when complete, 0 when missing or outline) */
  level: number;
  /** all won for now (state "complete", not complete.full): the gold surface line */
  caught: boolean;
  /** complete and fading: no gloss, sparkles or shine (the star stays) */
  matte: boolean;
  /** missing, and a lesson in the child's land teaches it: the flower's dotted hint */
  soon: boolean;
  /** a gem is ready for its battle: the hopping gold gem */
  ready: boolean;
}

/** The look of one petal (SCROLL_DESIGN §3.1). The colour is `whole` (it only ever rises), never `fill`. */
export function petalLook(s: PetalSummary): PetalLook {
  const stage: LookStage = s.state === "missing" ? "missing" : s.complete.full ? "complete" : s.whole > 0.004 ? "filling" : "outline";
  return {
    p: s.p,
    stage,
    level: stage === "complete" ? 1 : stage === "filling" ? s.whole : 0,
    caught: s.state === "complete" && !s.complete.full,
    matte: s.complete.full && s.fading,
    soon: s.state === "missing" && s.soon,
    ready: s.ready > 0,
  };
}
export function petalLooks(o: FlowerOverview): Map<PhonemeId, PetalLook> {
  return new Map(o.petals.map((s) => [s.p, petalLook(s)]));
}
/** For legacy callers of WorldFlower's `light` (0 missing · 0.06 outline · 0.15..0.9 filling · 1 complete). */
export function lookFromLight(p: PhonemeId, light: number, soon = false): PetalLook {
  const stage: LookStage = light >= 1 ? "complete" : light >= 0.15 ? "filling" : light > 0 ? "outline" : "missing";
  return { p, stage, level: stage === "complete" ? 1 : stage === "filling" ? Math.min(1, Math.max(0.02, (light - 0.15) / 0.75)) : 0, caught: false, matte: false, soon: stage === "missing" && soon, ready: false };
}

export type GemMark = "none" | "glass" | "fill" | "ready" | "won" | "mastered";
export interface GemLook {
  key: string;
  g: string;
  /** unseen none · met glass · practising fill · ready ready · won won · mastered mastered */
  mark: GemMark;
  /** 0..1: the charge (1 once ready or won) */
  e: number;
  /** 0..1: consolidation when won, 1 when mastered: the won jewel's white glint grows with it (SCROLL_DESIGN §3.2) */
  polish: number;
  /** a won gem not used for a while: grey specks */
  dusty: boolean;
  /** still to find: the letters in pencil at size F, no gem */
  pencil: boolean;
}
const MARK: Record<GemProgress["stage"], GemMark> = { unseen: "none", met: "glass", practising: "fill", ready: "ready", won: "won", mastered: "mastered" };
export function gemLook(g: GemProgress): GemLook {
  const mark = MARK[g.stage];
  const done = mark === "won" || mark === "mastered";
  return {
    key: g.key,
    g: g.g,
    mark,
    e: done || mark === "ready" ? 1 : mark === "none" ? 0 : Math.max(0, Math.min(1, g.parts.energy)),
    polish: mark === "mastered" ? 1 : done ? Math.max(0, Math.min(1, g.parts.consolidation)) : 0,
    dusty: g.fading,
    pencil: mark === "none",
  };
}

export interface SoundLine {
  g: string;
  segments: { p: PhonemeId; colour: string; sure: boolean }[];
}
/** The sound line under spelling `g` in petal `here` (MULTI_SOUND §7.2): one segment per sound it represents at the
 *  child's stage (`multi`), less < u > as the /w/ of < qu >, never < x >; null under two. `here` first, then teaching
 *  order. `sure`: Sound Detective's forkProgress(g).sure once it exists; until then every segment is faint. */
export function soundLineOf(g: string, here: PhonemeId, multi: readonly MultiSound[], sure?: (g: string, p: PhonemeId) => boolean): SoundLine | null {
  if (g === "x") return null;
  const m = multi.find((x) => x.g === g);
  if (!m) return null;
  const sounds = m.sounds.filter((s) => s.key !== "u>w" && !s.together);
  if (sounds.length < 2 || !sounds.some((s) => s.p === here)) return null;
  const ordered = [...sounds.filter((s) => s.p === here), ...sounds.filter((s) => s.p !== here)];
  return { g, segments: ordered.map((s) => ({ p: s.p, colour: petalColour(s.p), sure: !!sure?.(g, s.p) })) };
}
