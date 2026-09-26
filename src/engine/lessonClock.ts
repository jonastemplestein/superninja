// A cut lesson's clock (docs/FIRST_MINUTES.md §9): on a school path, the first session's lessons end at the first item
// boundary after `level.budgetMs` (90 s, then 60 s; content/worlds.ts lessonBudgetMs). The scenes ask at each boundary
// and finish there instead of starting another item, so a lesson is never cut mid-word.
import { useRef } from "react";
import { FAST } from "./fast";
import type { Level } from "../content/worlds";

/** `timeUp()`: has this lesson used its budget? Always false for a level without one. Game time (bots at ?fast=N). */
export function useLessonClock(level: Pick<Level, "budgetMs">): () => boolean {
  const t0 = useRef(0);
  if (!t0.current) t0.current = performance.now();
  return () => !!level.budgetMs && (performance.now() - t0.current) * FAST >= level.budgetMs;
}
