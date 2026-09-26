// The answer streak: how many first-try correct answers in a row. It powers the ninja up (see src/ui/Ninja.tsx,
// docs/HERO.md): tier 1 "glow" at 3, tier 2 "super" at 6, tier 3 "master" at 10. Scenes only report what happened:
//   streak.reset() at level start, streak.hit() on a first-try correct answer, streak.miss() on a wrong answer.
// The ninja listens and does the rest (auras, flame icons, tier-up celebrations, the gentle "think" on a miss).
// A streak carries over from a level the child finished into the next one (streak.bank(), called by the level host),
// so short levels can still reach the top tiers; quitting a level or a long break starts afresh.
import { useSyncExternalStore } from "react";
import { LINES } from "../content/lines";

export type Tier = 0 | 1 | 2 | 3;
export const TIER_AT = [0, 3, 6, 10] as const;
export const tierOf = (n: number): Tier => (n >= 10 ? 3 : n >= 6 ? 2 : n >= 3 ? 1 : 0);

export interface StreakEvent {
  type: "hit" | "miss" | "reset";
  /** streak length after the event */
  n: number;
  tier: Tier;
  /** streak length before the event */
  prevN: number;
  prevTier: Tier;
  /** true when this hit crossed into a higher tier (however many answers it counted, one event, one tier-up) */
  tierUp: boolean;
  /** false: the scene says the streak line itself (see streakLine()); the ninja still does the rest */
  line: boolean;
  /** true: a tier-up's power-up and line wait for ninja.streakLine() (the flames count at once) */
  defer: boolean;
}
export interface HitOpts {
  /** count several first-try answers at once, as ONE event (default 1) */
  count?: number;
  /** false: don't let the ninja say the tier-up line; the scene says streakLine(e) itself, in place of its praise */
  line?: boolean;
  /** true: hold a tier-up's power-up and line until the scene calls ninja.streakLine() (e.g. at the end of a word) */
  defer?: boolean;
}
type Listener = (e: StreakEvent) => void;

let n = 0;
let snap = { n: 0, tier: 0 as Tier };
let banked: { n: number; at: number } | null = null;
const CARRY_MS = 20 * 60_000;
const listeners = new Set<Listener>();
const subs = new Set<() => void>();

function emit(type: StreakEvent["type"], prevN: number, o: { line?: boolean; defer?: boolean } = {}) {
  const prevTier = tierOf(prevN);
  const tier = tierOf(n);
  snap = { n, tier };
  const e: StreakEvent = { type, n, tier, prevN, prevTier, tierUp: type === "hit" && tier > prevTier, line: o.line ?? true, defer: !!o.defer };
  listeners.forEach((f) => f(e));
  subs.forEach((f) => f());
  return e;
}

export const streak = {
  get n() {
    return n;
  },
  get tier(): Tier {
    return tierOf(n);
  },
  /** First-try correct answer(s). */
  hit(opts: HitOpts = {}): StreakEvent {
    const p = n;
    n += Math.max(1, opts.count ?? 1);
    return emit("hit", p, opts);
  },
  /** A wrong answer: the streak is gently lost (the ninja thinks; "Keep going, ninja!" if it was 3 or more, unless
   *  `line: false`, for a scene that says streak_lost itself, e.g. before its correction). */
  miss(opts: { line?: boolean } = {}): StreakEvent {
    const p = n;
    n = 0;
    return emit("miss", p, opts);
  },
  /** Level start, silently: back to zero, or to the streak banked by the level finished just before. */
  reset(): StreakEvent {
    const p = n;
    n = banked && performance.now() - banked.at < CARRY_MS ? banked.n : 0;
    banked = null;
    return emit("reset", p);
  },
  /** A level was finished: its streak carries over into the next level's reset(). */
  bank(): void {
    banked = n > 0 ? { n, at: performance.now() } : null;
  },
  /** Forget any banked streak (the child left the level early). */
  drop(): void {
    banked = null;
  },
  /** Dev/demo only: jump straight to a streak length (fires a "hit" event, with tierUp if it crossed a tier). */
  set(to: number): StreakEvent {
    const p = n;
    n = Math.max(0, to);
    return emit(n >= p ? "hit" : "reset", p);
  },
  /** Subscribe to streak events. Returns an unsubscribe function. */
  on(fn: Listener): () => void {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },
};

const hasLine = (id: string) => LINES.some((l) => l.id === id);
/** The line that goes with an event (streak_3/6/10 on a tier-up, streak_lost on a miss that ended a streak of 3 or
 *  more), or null. Only ids that exist in LINES. */
export function streakLine(e: StreakEvent | null | undefined): string | null {
  if (!e) return null;
  const id = e.tierUp ? `streak_${TIER_AT[e.tier]}` : e.type === "miss" && e.prevN >= 3 ? "streak_lost" : null;
  return id && hasLine(id) ? id : null;
}

/** The current streak for React: { n, tier }. */
export function useStreak(): { n: number; tier: Tier } {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => void subs.delete(cb);
    },
    () => snap,
  );
}

if (typeof window !== "undefined") (window as any).__streak = streak;
