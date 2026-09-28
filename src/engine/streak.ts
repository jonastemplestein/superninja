// The answer streak: how many first-try correct answers in a row. It powers the ninja up (see src/ui/Ninja.tsx,
// docs/HERO.md): tier 1 "glow" at 3, tier 2 "super" at 6, tier 3 "master" at 10. Scenes only report what happened:
//   streak.reset() at level start, streak.hit() on a first-try correct answer, streak.miss() on a wrong answer.
// The ninja listens and does the rest (auras, flame icons, tier-up celebrations, the gentle "think" on a miss).
// A streak carries over from a level the child finished into the next one (streak.bank(), called by the level host),
// so short levels can still reach the top tiers; quitting a level or a long break starts afresh.
//
// Dec2 (FIX_PLAN §1): the flames still light per letter, but a tier's spoken line needs real answers. A scene that counts
// parts of an answer (a word's letters, an errorless "say it with me" tap) passes `part: true`, and calls
// streak.answer() once the whole answer (the word, the item) is done. A tier line is said only once the streak holds
// LINE_AFTER[tier] whole answers and at least one of them came in this level; before that the tier-up is a silent
// power-up. A plain hit() (no `part`) still counts as one answer, so scenes that haven't moved over keep working.
//
// Errorless taps (pre-ship fix, 28 Sep): part hits that no answer() closes (the Learn's "say it with me" taps, the
// Training kicks) light their flames, but they don't count towards a whole answer's streak: the next plain hit()
// takes them back off first (never below the tier already lit), so the first Ninja Eyes answer after a Learn is one
// answer, not a "Ninja power!" (the verify round's streak_3 on the first answer).
import { useSyncExternalStore } from "react";
import { LINES } from "../content/lines";
import { store } from "./store";

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
  /** Dec2: part of an answer (a letter of a word; an errorless "say it with me" tap): it counts for the flames and
   *  `n`, not as an answer. Call streak.answer() when the whole answer is done. */
  part?: boolean;
}
type Listener = (e: StreakEvent) => void;

let n = 0;
/** whole answers in the current streak, and in this level (Dec2) */
let answers = 0;
let levelAnswers = 0;
/** part hits since the last whole answer: a word's letters until its answer(), or errorless taps no answer closes */
let pending = 0;
let snap = { n: 0, tier: 0 as Tier };
let banked: { n: number; answers: number; at: number } | null = null;
const CARRY_MS = 20 * 60_000;
const listeners = new Set<Listener>();
const subs = new Set<() => void>();

/** For the checks (script-audit's `master-early`, the bots): the streak as plain data, kept current on every change, and
 *  each tier line granted with the whole answers it rested on (the last 50). `window.__snStreak`. */
export interface StreakProbe {
  n: number;
  tier: Tier;
  /** whole answers in the current streak (Dec2) */
  answers: number;
  /** whole answers since this level started */
  levelAnswers: number;
  /** tier lines granted by tierLineId(), oldest first: `t` is performance.now() */
  lines: { t: number; id: string; tier: Tier; n: number; answers: number; levelAnswers: number }[];
}
const probe: StreakProbe = { n: 0, tier: 0, answers: 0, levelAnswers: 0, lines: [] };
function publish() {
  probe.n = n;
  probe.tier = tierOf(n);
  probe.answers = answers;
  probe.levelAnswers = levelAnswers;
}

function emit(type: StreakEvent["type"], prevN: number, o: { line?: boolean; defer?: boolean } = {}) {
  const prevTier = tierOf(prevN);
  const tier = tierOf(n);
  snap = { n, tier };
  publish();
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
  /** Whole answers in the current streak (Dec2). */
  get answers() {
    return answers;
  },
  /** Whole answers since this level started. */
  get levelAnswers() {
    return levelAnswers;
  },
  /** First-try correct answer(s). Without `part`, the call is one whole answer (whatever its `count`). */
  hit(opts: HitOpts = {}): StreakEvent {
    const p = n;
    const k = Math.max(1, opts.count ?? 1);
    if (opts.part) pending += k;
    else {
      // parts no answer() closed were errorless taps: they don't count towards this answer (never below the lit tier)
      if (pending) n = Math.max(TIER_AT[tierOf(n)], n - pending);
      pending = 0;
      answers += 1;
      levelAnswers += 1;
    }
    n += k;
    return emit("hit", p, opts);
  },
  /** A whole answer is done (a word built with no miss, after its `part` hits): it counts towards the spoken tier
   *  lines. Call it whether or not a tier was crossed, and before the deferred ninja.streakLine(). */
  answer(): void {
    pending = 0;
    answers += 1;
    levelAnswers += 1;
    publish();
  },
  /** A wrong answer: the streak is gently lost (the ninja thinks; "Keep going, ninja!" if it was 3 or more, unless
   *  `line: false`, for a scene that says streak_lost itself, e.g. before its correction). */
  miss(opts: { line?: boolean } = {}): StreakEvent {
    const p = n;
    n = 0;
    answers = 0;
    pending = 0;
    return emit("miss", p, opts);
  },
  /** Level start, silently: back to zero, or to the streak banked by the level finished just before. */
  reset(): StreakEvent {
    const p = n;
    const carry = banked && performance.now() - banked.at < CARRY_MS ? banked : null;
    n = carry?.n ?? 0;
    answers = carry?.answers ?? 0;
    levelAnswers = 0;
    pending = 0;
    banked = null;
    return emit("reset", p);
  },
  /** A level was finished: its streak carries over into the next level's reset(). */
  bank(): void {
    banked = n > 0 ? { n, answers, at: performance.now() } : null;
  },
  /** Forget any banked streak (the child left the level early). */
  drop(): void {
    banked = null;
  },
  /** Dev/demo only: jump straight to a streak length (fires a "hit" event, with tierUp if it crossed a tier). */
  set(to: number): StreakEvent {
    const p = n;
    n = Math.max(0, to);
    answers = levelAnswers = n;
    pending = 0;
    return emit(n >= p ? "hit" : "reset", p);
  },
  /** Subscribe to streak events. Returns an unsubscribe function. */
  on(fn: Listener): () => void {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },
};

const HAS = new Set(LINES.map((l) => l.id));
const hasLine = (id: string) => HAS.has(id);
/** The first time a child's streak reaches the first tier (once per save), the tier-up explains itself instead of
 *  "Ninja power!" (NARRATIVE_AUDIT F17: streaks were named but never explained). */
export const FIRST_STREAK = "audit_streak_first";
/** Dec2: the whole answers a streak must hold before a tier's line is said (tiers 0–3). */
export const LINE_AFTER = [0, 0, 4, 7] as const;
/** Is a tier's line earned yet (Dec2): LINE_AFTER[tier] whole answers in the streak, one of them in this level. */
export const tierLineEarned = (tier: Tier, o: { answers: number; levelAnswers: number } = { answers, levelAnswers }) => o.levelAnswers >= 1 && o.answers >= LINE_AFTER[tier];
/** The line for crossing into a tier: streak_3/6, "Ten in a row! Look how your ninja is glowing!" (tv_streak_10, in
 *  place of streak_10's "ninja master"), or the first-streak explanation (once per save); null while the line isn't
 *  earned (a silent power-up, Dec2). */
export function tierLineId(tier: Tier): string | null {
  if (!tierLineEarned(tier)) return null;
  const id = tier === 1 && !store.get().seenStreak && hasLine(FIRST_STREAK) ? FIRST_STREAK : tier === 3 && hasLine("tv_streak_10") ? "tv_streak_10" : `streak_${TIER_AT[tier]}`;
  if (!hasLine(id)) return null;
  probe.lines.push({ t: typeof performance !== "undefined" ? Math.round(performance.now()) : 0, id, tier, n, answers, levelAnswers });
  if (probe.lines.length > 50) probe.lines.shift();
  return id;
}
/** Call when a tier line has been said: the first-streak explanation is then never said again for this child. */
export function tierLineSaid(id: string | null | undefined, finished = true) {
  if (id === FIRST_STREAK && finished && !store.get().seenStreak) store.set((s) => void (s.seenStreak = true));
}
/** The line that goes with an event (a tier line on a tier-up, streak_lost on a miss that ended a streak of 3 or
 *  more), or null. Only ids that exist in LINES. A scene that says a tier line itself calls tierLineSaid() after. */
export function streakLine(e: StreakEvent | null | undefined): string | null {
  if (!e) return null;
  if (e.tierUp) return tierLineId(e.tier);
  const id = e.type === "miss" && e.prevN >= 3 ? "streak_lost" : null;
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

if (typeof window !== "undefined") {
  (window as any).__streak = streak;
  (window as any).__snStreak = probe;
}
