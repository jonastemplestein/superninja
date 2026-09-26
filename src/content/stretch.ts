// Words with a stretched ("elastic") recording in public/a/x/<word>.mp3, for modelling the Sounds~Write way
// (mmmaaat, sssuuunnn). scripts/gen-stretch.ts records exactly this list; add a word here and run it to record it.
// say({ stretch }) plays the plain word for anything not listed, without trying to fetch a missing file.
export const STRETCH_WORDS: readonly string[] = [
  "sun", "mat", "fan", "man", "dog", "bus", "cup", "hat", "map", "mop", "mug", "milk", "sock", "sand", "sit", "sat", "am", "at", "it", "an", "in", "on",
  "ant", "tap", "tin", "top", "tent", "tub", "fin", "pin", "pan", "lid", "pig", "cat", "wig", "bin", "bag", "zip", "jam", "pot", "cot", "hot", "log", "leg", "fox", "van",
  "nap", "not", "net", "nut", "nest", "pen", "peg", "pup", "tip", "pit", "pat", "tan", "sip", "nip", "pop",
];
export const STRETCHED: ReadonlySet<string> = new Set(STRETCH_WORDS);
