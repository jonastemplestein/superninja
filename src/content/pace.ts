// Pace follows mastery (docs/ARCHITECTURE.md §15.6) in Bamboo Village's first lessons: the first-sound, sound-hunt and
// dojo levels after the warm-ups. A child who gets it right first time moves on sooner; a child who slips gets every
// item. Until the planner lands (ARCHITECTURE §7), this is a data-level rule the scenes ask at each item boundary.
//
// Jonas, Round 13: "the same thing over and over, boring". Re-audit r2 measured a perfect child at 202–309 s a level
// (w1-4 built "am"/"at" seven times and read three checks) and exactly as long as a learner's item counts.
//
// What a child on track (at least `onTrack` of the level's answers right first time) skips:
//   - optional items: extra practice marked `optional` in the item lists (the second "we do" word, a sound's second
//     "your turn" picture, the third and fourth head-to-head and "find it" items; in a sound hunt, all but the first
//     picture alone);
//   - the rest of a build phase, once `builds` words have been built right first time (together or alone, at least
//     one alone), and the rest of the reading checks once `reads` are right first time;
//   - past `capS` of level time, the rest of any build or read phase that has had one right first-try item alone; a
//     build phase with a reading check still to come stops `readS` sooner, so the level ends near `capS`.
// Nothing is ever skipped mid-item, and "Let me show you" and "Let's do it together" always play.
import type { Level } from "./worlds";

export interface Pace {
  /** "answering correctly": this share of the level's answers so far right first time (or more) */
  onTrack: number;
  /** seconds of level time; past it, a child on track goes on at the next item boundary */
  capS: number;
  /** first-try-correct builds (together or alone) that are enough in one build phase */
  builds: number;
  /** first-try-correct reading checks that are enough */
  reads: number;
  /** what one reading check and the reward take (s): a build phase with reading still to come stops this much sooner */
  readS: number;
}

/** Bamboo Village's rule: after about 3 first-try-correct builds and 1 read, on to the reward; about 120 s a level. */
export const EARLY_PACE: Pace = { onTrack: 0.8, capS: 120, builds: 3, reads: 1, readS: 25 };

/** The level's answers so far (items the child answered: "we do" and "your turn"), and its clock. */
export interface PaceTally {
  answers: number;
  firstTry: number;
}
/** This phase's answers: right first time (together or alone), and right first time alone. */
export interface PhaseTally {
  firstTry: number;
  ownFirstTry: number;
}
export type PhaseKind = "pick" | "build" | "read";
export interface PaceItem {
  mode: "ido" | "wedo" | "youdo";
  optional?: boolean;
}

export const onTrack = (p: Pace, t: PaceTally): boolean => t.answers > 0 && t.firstTry / t.answers >= p.onTrack;

/**
 * At an item boundary, the index of the next item to play: `from` itself, a later one (optional items skipped), or
 * `items.length` when the phase is done. `secs`: the level's time so far; `readsAfter`: a reading check follows this
 * (build) phase. Pure: the scenes keep the tallies.
 */
export function nextItem(p: Pace | null | undefined, kind: PhaseKind, items: readonly PaceItem[], from: number, level: PaceTally, phase: PhaseTally, secs: number, readsAfter = false): number {
  if (!p || from >= items.length || !onTrack(p, level)) return from;
  const enough = kind === "build" ? p.builds : kind === "read" ? p.reads : null;
  if (enough !== null) {
    if (phase.firstTry >= enough && phase.ownFirstTry >= 1 && items[from].mode === "youdo") return items.length;
    const cap = p.capS - (kind === "build" && readsAfter ? p.readS : 0);
    if (secs >= cap && phase.ownFirstTry >= 1) return items.length;
  }
  let k = from;
  while (k < items.length && items[k].optional) k++;
  return k;
}

/** The pace a level plays at (null: every item, as authored). */
export const paceOf = (level: Pick<Level, "pace">): Pace | null => level.pace ?? null;

/**
 * The words a build phase has the child build alone, in order: the words not built yet in this level first (so a
 * child who moves on early has still met every word), then round again, alternating, never the same word twice
 * running where the level has two or more. `n`: how many.
 */
export function ownWords<T>(words: readonly T[], built: readonly T[], n: number): T[] {
  const fresh = words.filter((w) => !built.includes(w));
  const order = [...fresh, ...words.filter((w) => !fresh.includes(w))];
  const out: T[] = [];
  for (let i = 0; out.length < n && order.length; i++) {
    const w = order[i % order.length];
    if (out.length && out[out.length - 1] === w && order.length > 1) continue;
    out.push(w);
  }
  return out;
}
