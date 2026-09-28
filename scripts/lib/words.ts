// Words in a spoken line, counted one way everywhere: scripts/gen-audio.ts gates a take's pace with it (3.3 words a
// second, TEACHER_SCRIPT §7.4), and scripts/treadmill/script-audit.ts `fast-line` and its turn and bare-command
// counts use it on durations.json and the transcripts. One module, so the two can't drift apart again (27 Sep: they
// counted "grown-up" differently, and `tv_opt_ask` was 3.25 words a second in one and 3.72 in the other).

/** A line's text as the counts read it: "…" as "...", curly apostrophes straight, trimmed. */
export const normText = (s: string) => s.replace(/…/g, "...").replace(/[’]/g, "'").trim();

/** Words in a line: the space-separated pieces with a letter in them, so "grown-up" and "Mwa-ha-ha!" are one word each,
 *  and "..." or a lone "–" is none. */
export const wordCount = (s: string) => normText(s).split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;

/** Words a second over a clip of `seconds` (0 for a clip under two words: one-word clips aren't paced). */
export const wordsPerSecond = (text: string, seconds: number) => (wordCount(text) >= 2 && seconds > 0 ? wordCount(text) / seconds : 0);
