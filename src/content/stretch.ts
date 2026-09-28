// Words Sensei can say the slow way, in public/a/x/<word>.mp3: since 27 Sep 2026 its sounds one by one with a little
// gap ("c · a · t"), spliced from the pure sounds by scripts/gen-slow-words.ts, for every word in the content with a
// segmentation (phonics.ts, units/*.ts, ORAL_WORDS with segs). SLOW_TIMES has each sound's onset in the clip, so a scene
// can light a card or sound button on each sound. (Until then these were "elastic" TTS words, mmmaaat, for 163 words;
// they ran the sounds together, and are in .trash/stretch-2026-09-27/.) A new word: add it to the content and run
// `bun scripts/gen-slow-words.ts --only <word>`. say({ stretch }) plays the plain word for anything not listed.
import { SLOW_TIMES } from "./slow-times.gen";
export { SLOW_TIMES, SLOW_GAP_MS } from "./slow-times.gen";
export const STRETCH_WORDS: readonly string[] = Object.keys(SLOW_TIMES);
export const STRETCHED: ReadonlySet<string> = new Set(STRETCH_WORDS);

// Words with a held first sound ("sssun", "mmmoon") in public/a/o/<word>.mp3, for noticing first sounds in the
// warm-ups (docs/FIRST_MINUTES.md §12). Only words that start with a sound that can be held. `bun scripts/gen-stretch.ts
// --onset` records exactly this list. say({ onset }) falls back to the slow word (its sounds one by one), then the plain word.
// (sunflower failed the judge in 12 takes: "ssssunflower" came out stretched all through, so it says the word)
export const ONSET_WORDS: readonly string[] = ["sun", "sock", "sausage", "moon", "fish", "mug", "map"];
export const HELD_ONSET: ReadonlySet<string> = new Set(ONSET_WORDS);
