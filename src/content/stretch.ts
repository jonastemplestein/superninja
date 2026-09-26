// Words with a stretched ("elastic") recording in public/a/x/<word>.mp3, for modelling the Sounds~Write way
// (mmmaaat, sssuuunnn). scripts/gen-stretch.ts records exactly this list; add a word here and run it to record it.
// say({ stretch }) plays the plain word for anything not listed, without trying to fetch a missing file.
export const STRETCH_WORDS: readonly string[] = [
  "sun", "mat", "fan", "man", "dog", "bus", "cup", "hat", "map", "mop", "mug", "milk", "sock", "sand", "sit", "sat", "am", "at", "it", "an", "in", "on",
  "ant", "tap", "tin", "top", "tent", "tub", "fin", "pin", "pan", "lid", "pig", "cat", "wig", "bin", "bag", "zip", "jam", "pot", "cot", "hot", "log", "leg", "fox", "van",
  "nap", "not", "net", "nut", "nest", "pen", "peg", "pup", "tip", "pit", "pat", "tan", "sip", "nip", "pop",
  // Units 8-10 (adjacent consonants): the words a child spells there, so "These sounds sit next to each other. Listen
  // for each one as we say the word slowly" and Help's "Listen to the word slowly" can say them slowly (NARRATIVE_AUDIT
  // F12). Not every word: bump, must, cost, pump, spot, step, drip, clip, trap, blot, flop, flip, prop, spit, trot,
  // stem, splat, swept and crept failed the judge in 8 takes each (26 Sep 2026), so they are said plainly.
  "and", "end", "elf", "imp", "help", "belt", "lamp", "camp", "pond", "hand", "bend", "mend", "send", "jump", "lump",
  "damp", "hunt", "gift", "left", "soft", "lift", "kept", "desk", "tusk", "dusk", "best", "rest", "test", "vest",
  "west", "just", "dust", "rust", "lost", "fist", "mist", "golf", "silk", "film", "melt", "felt", "went", "bulb",
  "stop", "swim", "frog", "flag", "flat", "plug", "plum", "pram", "drum", "crab", "clap", "trip", "slip", "snap",
  "snip", "spin", "skip", "skid", "grin", "grub", "grip", "glum", "glad", "twig", "swam", "brag", "from", "slim",
  "smug", "snug", "stun", "trim", "twin", "scab", "sniff", "stuff", "spell", "smell", "dress", "stamp", "stump",
  "crust", "trust", "twist", "frost", "blend", "crisp", "spend", "split", "strap", "strip", "scrub", "scrap", "next",
  "text", "stand", "slept", "plump", "brisk",
];
export const STRETCHED: ReadonlySet<string> = new Set(STRETCH_WORDS);

// Words with a held first sound ("sssun", "mmmoon") in public/a/o/<word>.mp3, for noticing first sounds in the
// warm-ups (docs/FIRST_MINUTES.md §12). Only words that start with a sound that can be held. `bun scripts/gen-stretch.ts
// --onset` records exactly this list. say({ onset }) falls back to the stretched word, then the plain word.
// (sunflower failed the judge in 12 takes: "ssssunflower" came out stretched all through, so it says the word)
export const ONSET_WORDS: readonly string[] = ["sun", "sock", "sausage", "moon", "fish", "mug", "map"];
export const HELD_ONSET: ReadonlySet<string> = new Set(ONSET_WORDS);
