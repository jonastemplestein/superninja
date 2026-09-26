// Feedback every game shares, the Sounds~Write way (docs/PEDAGOGY.md): the correction for a wrong spelling, and
// everyday praise. Never letter names.
import { GRAPHEMES, type Seg } from "../content/phonics";
import type { Say } from "./audio";

/** Correction for a wrong spelling: never do the segmenting for the child.
 *  1st miss → back to listening: hear the word again, stretched (a word with no stretched recording is said plainly).
 *  2nd miss → show: "That's /s/. We need /m/." (callers also glow the right tile).
 *  Same sound but another spelling → say so; that's about spelling, not listening. */
export function correction(g: string, need: Seg, word: string, attempt: number): Say[] {
  if (GRAPHEMES[g] === need.p) return [{ line: "same_sound_spelling" }, { gap: 100 }, { sound: need.p }];
  if (attempt <= 1) return [{ line: "listen_here" }, { gap: 150 }, { stretch: word }];
  return [{ line: "thats" }, { sound: GRAPHEMES[g] }, { gap: 200 }, { line: "we_need" }, { sound: need.p }];
}

/** Everyday praise. Never yay_6 ("Ninja power!"): that is the streak's own tier-up line (streak_3), and it only means
 *  something if it is kept for powering up. */
const PRAISE = ["yay_1", "yay_2", "yay_3", "yay_4", "yay_5", "yay_9", "yay_10"];
let lastPraise = "";
/** A random praise line, never the same twice in a row (across every game). */
export function pickPraise(): string {
  const pool = PRAISE.filter((p) => p !== lastPraise);
  return (lastPraise = pool[Math.floor(Math.random() * pool.length)]);
}
