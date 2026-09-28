// Which spoken lines are instructions a child needs to be able to hear again (docs/NAVIGATION.md §1, §3.5, §6.2), and
// which are feedback that is never replayed: praise, streak lines, corrections and the nav nudge. Pure data, shared by
// the game (src/ui/nav.tsx: the "last instruction" register behind Hear it again) and the sweep (scripts/treadmill/
// sweep.ts: no-replay-for-instruction).
import { LINES } from "./lines";
import { LISTEN_AGAIN } from "./narrative";

const FEEDBACK = new Set<string>([
  // praise (engine/feedback.ts pickPraise, praiseFor and friends; TEACHER_SCRIPT §5.3)
  "yay_1", "yay_2", "yay_3", "yay_4", "yay_5", "yay_6", "yay_7", "yay_8", "yay_9", "yay_10", "well_read", "well_spelt",
  "tv_said_well", "tv_streak_10",
  // corrections and their leads (composed with a sound or word clip; TEACHER_SCRIPT §5.4)
  "thats", "we_need", "that_says", "listen", "listen_again", "nearly", "not_quite", "its", "its_this_one", "fm_its_this",
  "same_sound_spelling", ...LISTEN_AGAIN.plain, ...LISTEN_AGAIN.stretched,
  "tv_fix_together", "tv_fix_start", "tv_fix_middle", "tv_not_in_middle", "tv_slow_again", "tv_guess_again", "tv_thats_write",
  "tv_lets_check", "tv_run_fix", "tv_rail_start", "tv_sort_fix", "tv_ts_wrong_rabbit", "tv_ts_wrong_tortoise", "stays_same",
  "tv_offer_show_miss",
  // Sound Swap's confirmation that the child picked the right place ("Yes, the middle sound changes!"), and its older
  // stand-ins: feedback, not the turn's instruction (D3's request, integration 27 Sep)
  "st_first_changes", "st_middle_changes", "st_last_changes", "audit_swap_first", "audit_swap_middle", "audit_swap_last",
  // the nav layer's own nudge
  "nav_ready",
]);
/** Families of feedback lines: specific praise (`tv_praise_found`…), the calm generic praise, the corrections made one
 *  per word or pair ("Can you find the sock?", "Kai read it right.", "Cat starts with a different sound."), and fast and
 *  slow's praise and stuck recaps (TEACHER_SCRIPT §9.7 rule 6). */
const FEEDBACK_FAMILIES = ["tv_praise_", "tv_yay_", "tv_find_again_", "tv_which_fix_", "tv_right_", "fm_diff_", "fm_not_in_", "tv_fs_praise_", "tv_fs_stuck_"];
const KNOWN = new Set(LINES.map((l) => l.id));

/** Praise, a streak line, a correction or a nav nudge: said once, never replayed by Hear it again. */
export function isFeedback(id: string): boolean {
  return FEEDBACK.has(id) || id.startsWith("streak_") || FEEDBACK_FAMILIES.some((f) => id.startsWith(f));
}

/** A line the child needs (a question, an explanation, a demo's words, a celebration): anything but praise, streak lines,
 *  corrections and `nav_ready`. Unknown ids are not instructions. */
export function isInstruction(id: string): boolean {
  return KNOWN.has(id) && !isFeedback(id);
}

/** Lines that are said on request and are not the screen's instruction: Help's clues (`help_*`), the grown-ups gate,
 *  "Not yet!" on a locked stone, a secret petal and the turn-your-phone prompt; and the teacher's nudges while the child
 *  is quiet or stuck (TEACHER_SCRIPT §5.2, §5.5: "Take your time, ninja.", "Here it is. Tap it when you're ready.", the
 *  paw's offers, Help's lines at a Ready hold). Hear it again never replays these in place of the question (the automatic
 *  register skips them; a scene can still add one with told()). */
const ASIDES = new Set([
  "grownups", "map_locked", "petal_secret", "turn_phone",
  "tv_take_time", "tv_idle_point", "tv_look_glow", "tv_show_offer", "tv_offer_show", "tv_show_again", "tv_ready_help",
  "tv_dojo_help_sound",
  // the map's Help clue, "Not yet!" and its replay question (docs/MAP_DESIGN.md §6, fix-requests "Map redesign")
  "tv_map_help", "tv_map_locked", "tv_map_other", "tv_map_other_how",
]);
/** Fast and slow's idea lines and read-back lead-ins (TEACHER_SCRIPT §9.7 rule 6): asides, so Hear it again replays the
 *  turn's question, never "Let's say it the slow way…". The rabbit prompt and Ninja Run's "I'll say it the slow way. You
 *  catch the whole word." are the turn's instruction. */
const FS_INSTRUCTIONS = new Set(["tv_fs_rabbit_read", "tv_fs_run"]);
const isFsAside = (id: string) => id.startsWith("tv_fs_") && !FS_INSTRUCTIONS.has(id);
export function isRegisterable(id: string): boolean {
  return isInstruction(id) && !id.startsWith("help_") && !id.startsWith("tv_map_replay_") && !ASIDES.has(id) && !isFsAside(id);
}
