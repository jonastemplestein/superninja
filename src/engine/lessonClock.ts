// A cut lesson's clock (docs/FIRST_MINUTES.md §9): on a school path, the first session's lessons end at the first item
// boundary after `level.budgetMs` (90 s, then 60 s; content/worlds.ts lessonBudgetMs). The scenes ask at each boundary
// and finish there instead of starting another item, so a lesson is never cut mid-word.
// Time the child spends at a held Next arrow (beyond 1.5 s) or on Hear it again / Show me again doesn't count
// (docs/NAVIGATION.md §3.7): the nav layer (src/ui/nav.tsx) pauses the clock then, and lesson clocks subtract it.
import { useRef } from "react";
import { FAST } from "./fast";
import type { Level } from "../content/worlds";

let pausedTotal = 0; // real ms, finished pauses
let pausedSince = 0;
let depth = 0;
/** Stop lesson clocks (nests: every pause needs its resume). */
export function pauseLessonClock() {
  if (depth++ === 0) pausedSince = performance.now();
}
export function resumeLessonClock() {
  if (depth === 0) return;
  if (--depth === 0) pausedTotal += performance.now() - pausedSince;
}
/** Real milliseconds lesson clocks have been paused since the page loaded (a lesson subtracts what accrued during it:
 *  `lessonPausedMs() - atStart`). Multiply by FAST for game time. */
export function lessonPausedMs(): number {
  return pausedTotal + (depth ? performance.now() - pausedSince : 0);
}

/** `timeUp()`: has this lesson used its budget? Always false for a level without one. Game time (bots at ?fast=N),
 *  less the time lesson clocks were paused. */
export function useLessonClock(level: Pick<Level, "budgetMs">): () => boolean {
  const t0 = useRef(0);
  const p0 = useRef(0);
  if (!t0.current) {
    t0.current = performance.now();
    p0.current = lessonPausedMs();
  }
  return () => !!level.budgetMs && (performance.now() - t0.current - (lessonPausedMs() - p0.current)) * FAST >= level.budgetMs;
}
