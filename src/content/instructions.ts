// Which spoken lines are instructions a child needs to be able to hear again (docs/NAVIGATION.md §1, §3.5, §6.2), and
// which are feedback that is never replayed: praise, streak lines, corrections and the nav nudge. Pure data, shared by
// the game (src/ui/nav.tsx: the "last instruction" register behind Hear it again) and the sweep (scripts/treadmill/
// sweep.ts: no-replay-for-instruction).
import { LINES } from "./lines";
import { LISTEN_AGAIN } from "./narrative";

const FEEDBACK = new Set<string>([
  // praise (engine/feedback.ts pickPraise and friends)
  "yay_1", "yay_2", "yay_3", "yay_4", "yay_5", "yay_6", "yay_7", "yay_8", "yay_9", "yay_10", "well_read", "well_spelt",
  // corrections and their leads (composed with a sound or word clip)
  "thats", "we_need", "that_says", "listen", "listen_again", "nearly", "not_quite", "its", "its_this_one", "fm_its_this",
  "same_sound_spelling", ...LISTEN_AGAIN.plain, ...LISTEN_AGAIN.stretched,
  // the nav layer's own nudge
  "nav_ready",
]);
const KNOWN = new Set(LINES.map((l) => l.id));

/** A line the child needs (a question, an explanation, a demo's words, a celebration): anything but praise, streak lines,
 *  corrections and `nav_ready`. Unknown ids are not instructions. */
export function isInstruction(id: string): boolean {
  return KNOWN.has(id) && !FEEDBACK.has(id) && !id.startsWith("streak_");
}

/** Lines that are said on request and are not the screen's instruction: Help's clues (`help_*`), the grown-ups gate,
 *  "Not yet!" on a locked stone, a secret petal and the turn-your-phone prompt. Hear it again never replays these in
 *  place of the question (the automatic register skips them; a scene can still add one with told()). */
const ASIDES = new Set(["grownups", "map_locked", "petal_secret", "turn_phone"]);
export function isRegisterable(id: string): boolean {
  return isInstruction(id) && !id.startsWith("help_") && !ASIDES.has(id);
}
