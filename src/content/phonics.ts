// Super Ninja phonics content — the single source of truth for sounds, spellings, units and words.
//
// Principles (linguistic / synthetic phonics, British English):
// - A sound (phoneme) is primary. Letters are *spellings* of sounds (graphemes).
// - A word is a sequence of sounds; each sound is written with a spelling of 1–4 letters.
// - Pure sounds, no added "uh". Southern British pronunciation. We avoid words whose
//   vowels differ across British accents (bath, grass, plant, mask …) and US-only words.
// - No mnemonics attached to letters: no letter mascots, songs or actions.

export type PhonemeId =
  | "a" | "i" | "m" | "s" | "t" | "n" | "o" | "p" | "b" | "k" | "g" | "h" | "d" | "e" | "f" | "v"
  | "l" | "r" | "u" | "j" | "w" | "z" | "ks" | "y" | "sh" | "ch" | "th" | "dh" | "ng" | "kw"
  | "ae" | "ee" | "ie" | "oe" | "oo" | "ar" | "or" | "er" | "ou" | "oy"
  | "ue" | "uu" | "air" | "eer" | "zh" | "schwa";

export interface Phoneme {
  id: PhonemeId;
  /** how we write the sound between slashes for grown-ups, e.g. /sh/ */
  label: string;
  ipa: string;
  /** a word that starts with / contains the sound, for grown-ups */
  example: string;
  /** petal colour on the World Flower */
  colour: string;
  /** plain-text spellings to feed TTS when generating the pure sound (best take is chosen by an audio judge) */
  tts: string[];
  /** description for the audio judge */
  judge: string;
  vowel?: boolean;
}

const C = {
  // consonant petals: cool/leafy colours; vowels: warm blossom colours
  stop: "#5b8def", cont: "#35b6a8", nasal: "#8a6cf0", liquid: "#2fa0d8", glide: "#48c27a",
  vShort: "#ff6b8a", vLong: "#ff9f43", vR: "#f7b733", vDip: "#e56bd1",
};

export const PHONEMES: Record<PhonemeId, Phoneme> = {
  a: { id: "a", label: "a", ipa: "æ", example: "ant", colour: C.vShort, vowel: true, tts: ["a.", "æ", "a", "æ.", "a (as in ant)", "at, a... a"], judge: "the short vowel /æ/ as in 'ant' and 'cat' (Southern British), short and clear, not 'ay', not 'ah'" },
  i: { id: "i", label: "i", ipa: "ɪ", example: "insect", colour: C.vShort, vowel: true, tts: ["i.", "ih.", "ɪ", "ih"], judge: "the short vowel /ɪ/ as in 'it' and 'insect', not 'eye', not 'ee'" },
  o: { id: "o", label: "o", ipa: "ɒ", example: "octopus", colour: C.vShort, vowel: true, tts: ["o!", "oh.", "ɒ", "ɑ"], judge: "the short British vowel /ɒ/ as in 'hot' and 'octopus' (rounded, Southern British), not 'oh', not American 'ah'" },
  e: { id: "e", label: "e", ipa: "e", example: "egg", colour: C.vShort, vowel: true, tts: ["e.", "eh.", "ɛ", "eh", "e"], judge: "the short vowel /e/ as in 'egg' and 'bed', not 'ee'" },
  u: { id: "u", label: "u", ipa: "ʌ", example: "up", colour: C.vShort, vowel: true, tts: ["u.", "uh.", "ʌ", "uh"], judge: "the short Southern British vowel /ʌ/ as in 'up' and 'cup' (it IS a vowel here, so an open 'u' sound is correct), not 'you', not 'oo'" },
  m: { id: "m", label: "m", ipa: "m", example: "map", colour: C.nasal, tts: ["mmmmm", "mmm", "mmmm."], judge: "a sustained /m/ hum with lips closed, no vowel before or after" },
  n: { id: "n", label: "n", ipa: "n", example: "net", colour: C.nasal, tts: ["nnnnn", "nnn", "nnnn."], judge: "a sustained /n/ with no vowel before or after" },
  s: { id: "s", label: "s", ipa: "s", example: "sun", colour: C.cont, tts: ["sssss", "sss", "ssss."], judge: "a sustained hissing /s/ (not /sh/), no vowel" },
  t: { id: "t", label: "t", ipa: "t", example: "top", colour: C.stop, tts: ["t", "t.", "tt"], judge: "a single short crisp unvoiced /t/, just the tap and puff, absolutely no vowel after it" },
  p: { id: "p", label: "p", ipa: "p", example: "pig", colour: C.stop, tts: ["p", "p.", "pp"], judge: "a single short unvoiced /p/ puff, no vowel after" },
  b: { id: "b", label: "b", ipa: "b", example: "bat", colour: C.stop, tts: ["b", "b.", "bb", "b!", "bh", "bp"], judge: "a single short voiced /b/ with the smallest possible release, no 'buh', not the letter name 'bee'" },
  k: { id: "k", label: "c", ipa: "k", example: "cat", colour: C.stop, tts: ["k", "k.", "kk", "kh", "k!", "kk."], judge: "a single short unvoiced /k/, no vowel after, not the letter name 'kay'" },
  g: { id: "g", label: "g", ipa: "ɡ", example: "gap", colour: C.stop, tts: ["g", "g.", "gg", "g!", "ɡ", "gk"], judge: "a single short voiced /g/ with minimal release, no 'guh', not the letter name 'jee'" },
  h: { id: "h", label: "h", ipa: "h", example: "hat", colour: C.cont, tts: ["h", "hh", "hhh.", "h."], judge: "a breathy unvoiced /h/, like a little puff of warm air, no vowel after" },
  d: { id: "d", label: "d", ipa: "d", example: "dog", colour: C.stop, tts: ["d", "d.", "dd", "d!"], judge: "a single short voiced /d/, minimal release, no 'duh', not 'dee'" },
  f: { id: "f", label: "f", ipa: "f", example: "fan", colour: C.cont, tts: ["fffff", "fff", "ffff."], judge: "a sustained unvoiced /f/ (teeth on lip), no vowel" },
  v: { id: "v", label: "v", ipa: "v", example: "van", colour: C.cont, tts: ["vvvvv", "vvv", "vvvv."], judge: "a sustained voiced /v/ buzz, no vowel, not 'vee'" },
  l: { id: "l", label: "l", ipa: "l", example: "leg", colour: C.liquid, tts: ["lllll", "lll", "llll."], judge: "a sustained /l/, no vowel before or after, not 'el'" },
  r: { id: "r", label: "r", ipa: "ɹ", example: "red", colour: C.liquid, tts: ["rrrrr", "rrr", "rrrr.", "rr", "ɹɹɹ", "rrrh"], judge: "a sustained British /r/ (non-rolled), no vowel after, not 'ar'" },
  j: { id: "j", label: "j", ipa: "dʒ", example: "jam", colour: C.stop, tts: ["j", "j.", "dj", "dʒ", "jj", "dʒ."], judge: "a single short /dʒ/ as at the start of 'jam', minimal release, not 'jay', no 'juh'" },
  w: { id: "w", label: "w", ipa: "w", example: "wet", colour: C.glide, tts: ["wwoo", "woo.", "wuh", "w'oo"], judge: "the phonics sound for w said as a short 'wwoo' (rounded lips gliding into a very short oo) — that is the correct teaching form; not 'double-u', not 'whoa'" },
  z: { id: "z", label: "z", ipa: "z", example: "zip", colour: C.cont, tts: ["zzzzz", "zzz", "zzzz."], judge: "a sustained buzzing /z/, no vowel, not 'zed'" },
  ks: { id: "ks", label: "cs", ipa: "ks", example: "fox", colour: C.stop, tts: ["ks", "ks.", "cks", "x."], judge: "the sound pair /ks/ as at the end of 'box' — a short k then s, no vowel, not the letter name 'ex'" },
  y: { id: "y", label: "y", ipa: "j", example: "yes", colour: C.glide, tts: ["yyee", "yee.", "yih", "y'ee"], judge: "the phonics sound for y said as a short 'yyee' (as at the start of 'yes'), not 'why'" },
  sh: { id: "sh", label: "sh", ipa: "ʃ", example: "ship", colour: C.cont, tts: ["shhhhh", "shhh", "shhhh."], judge: "a sustained /ʃ/ 'shhh', no vowel" },
  ch: { id: "ch", label: "ch", ipa: "tʃ", example: "chip", colour: C.stop, tts: ["ch", "ch.", "tch", "tʃ"], judge: "a single short /tʃ/ as at the start of 'chip', no vowel after, not 'chuh'" },
  th: { id: "th", label: "th", ipa: "θ", example: "thin", colour: C.cont, tts: ["thhhh", "th.", "θθθ", "thh", "θ", "θː", "thhhhhh", "θθθθθ", "th th", "thhh."], judge: "a sustained unvoiced /θ/ as at the start of 'thin' (tongue between teeth), no vowel, not 'f'" },
  dh: { id: "dh", label: "th", ipa: "ð", example: "this", colour: C.cont, tts: ["ðððð", "thhh (as in this)", "dhhh", "ðð.", "ðːː", "ð", "ðð", "dhh"], judge: "a sustained voiced /ð/ as at the start of 'this' and 'that', no vowel, not 'd'" },
  ng: { id: "ng", label: "ng", ipa: "ŋ", example: "ring", colour: C.nasal, tts: ["ngngng", "ŋŋŋ", "nnggg", "ng."], judge: "a sustained /ŋ/ as at the end of 'ring' and 'song', no vowel, no hard g release" },
  kw: { id: "kw", label: "qu", ipa: "kw", example: "quick", colour: C.stop, tts: ["kw", "kw.", "kwh", "cw", "kwoo", "kwu"], judge: "the phonics sound for qu said as a short 'coo'/'kwoo' (/kw/ as at the start of 'queen'), not the letter name 'queue'" },
  // Extended Code sounds (Sky Temple)
  ae: { id: "ae", label: "ae", ipa: "eɪ", example: "rain", colour: C.vLong, vowel: true, tts: ["ay", "ay.", "eɪ", "a (as in rain)"], judge: "the long vowel /eɪ/ as in 'rain' and 'day'" },
  ee: { id: "ee", label: "ee", ipa: "iː", example: "tree", colour: C.vLong, vowel: true, tts: ["ee", "ee.", "iː", "eee"], judge: "the long vowel /iː/ as in 'tree' and 'sea'" },
  ie: { id: "ie", label: "ie", ipa: "aɪ", example: "night", colour: C.vLong, vowel: true, tts: ["eye", "aɪ", "igh", "eye."], judge: "the long vowel /aɪ/ as in 'night' and 'pie'" },
  oe: { id: "oe", label: "oe", ipa: "əʊ", example: "boat", colour: C.vLong, vowel: true, tts: ["oh", "oh.", "əʊ", "oe"], judge: "the Southern British long vowel /əʊ/ as in 'boat' and 'snow'" },
  oo: { id: "oo", label: "oo", ipa: "uː", example: "moon", colour: C.vLong, vowel: true, tts: ["oo", "ooo.", "uː", "oo!"], judge: "the long vowel /uː/ as in 'moon'" },
  ar: { id: "ar", label: "ar", ipa: "ɑː", example: "car", colour: C.vR, vowel: true, tts: ["ah", "ar.", "ɑː", "aah"], judge: "the long vowel /ɑː/ as in 'car' (non-rhotic British, no r sound)" },
  or: { id: "or", label: "or", ipa: "ɔː", example: "fork", colour: C.vR, vowel: true, tts: ["or", "or.", "ɔː", "aw"], judge: "the long vowel /ɔː/ as in 'fork' (non-rhotic British)" },
  er: { id: "er", label: "er", ipa: "ɜː", example: "bird", colour: C.vR, vowel: true, tts: ["er", "er.", "ɜː", "ur", "err", "urr"], judge: "the long vowel /ɜː/ as in 'bird' and 'fern' (non-rhotic British)" },
  ou: { id: "ou", label: "ou", ipa: "aʊ", example: "cloud", colour: C.vDip, vowel: true, tts: ["ow", "ow.", "aʊ", "ou"], judge: "the vowel /aʊ/ as in 'cloud' and 'cow'" },
  ue: { id: "ue", label: "ue", ipa: "juː", example: "cube", colour: C.vLong, vowel: true, tts: ["you", "yoo.", "juː", "ue"], judge: "the vowel /juː/ as in 'cube' and 'new' (like the word 'you')" },
  uu: { id: "uu", label: "oo", ipa: "ʊ", example: "book", colour: C.vShort, vowel: true, tts: ["ʊ", "uh (as in book)", "oo.", "ʊ."], judge: "the short vowel /ʊ/ as in 'book' and 'put' (not the long 'oo' of 'moon')" },
  air: { id: "air", label: "air", ipa: "eə", example: "chair", colour: C.vR, vowel: true, tts: ["air", "air.", "eə", "ɛː"], judge: "the Southern British vowel /eə/ as in 'chair' and 'bear' (non-rhotic, no r sound)" },
  eer: { id: "eer", label: "eer", ipa: "ɪə", example: "deer", colour: C.vR, vowel: true, tts: ["ear", "ear.", "ɪə", "eer"], judge: "the Southern British vowel /ɪə/ as in 'deer' and 'ear' (non-rhotic, no r sound)" },
  zh: { id: "zh", label: "zh", ipa: "ʒ", example: "treasure", colour: C.cont, tts: ["zhhhh", "ʒʒʒ", "zh.", "ʒ"], judge: "a sustained voiced /ʒ/ as in the middle of 'treasure' and 'measure', no vowel" },
  schwa: { id: "schwa", label: "uh", ipa: "ə", example: "sofa", colour: C.vShort, vowel: true, tts: ["uh.", "ə", "ə.", "uh"], judge: "the short neutral schwa vowel /ə/ as at the end of 'sofa' or the start of 'about'" },
  oy: { id: "oy", label: "oy", ipa: "ɔɪ", example: "boy", colour: C.vDip, vowel: true, tts: ["oy", "oy.", "ɔɪ", "oi"], judge: "the vowel /ɔɪ/ as in 'boy' and 'coin'" },
};

/** Default sound for each spelling. Word-level overrides use the "spelling=sound" notation. */
export const GRAPHEMES: Record<string, PhonemeId> = {
  a: "a", i: "i", m: "m", s: "s", t: "t", n: "n", o: "o", p: "p", b: "b", c: "k", g: "g", h: "h",
  d: "d", e: "e", f: "f", v: "v", k: "k", l: "l", r: "r", u: "u", j: "j", w: "w", z: "z", x: "ks",
  y: "y", ff: "f", ll: "l", ss: "s", zz: "z",
  sh: "sh", ch: "ch", th: "th", ck: "k", ng: "ng", wh: "w", q: "k", ve: "v", tch: "ch",
  ai: "ae", ay: "ae", ee: "ee", ea: "ee", igh: "ie", ie: "ie", oa: "oe", ow: "oe", oo: "oo",
};

// Longest first so greedy segmentation prefers "tch" over "t" + "ch".
const MULTI = Object.keys(GRAPHEMES).filter((g) => g.length > 1).sort((a, b) => b.length - a.length);

export interface Seg { g: string; p: PhonemeId }
export interface Word {
  text: string;
  segs: Seg[];
  unit: number;
  /** picture prompt if the word is picturable */
  pic?: string;
}

/**
 * Parse a word spec. Plain words are segmented greedily with the spellings available at that unit.
 * Explicit form: "th=dh.i.s" (dots separate spellings, "=sound" overrides the default sound).
 */
export function parseWord(spec: string, allowed: Set<string>): Seg[] {
  if (spec.includes(".")) {
    return spec.split(".").map((part) => {
      const [g, p] = part.split("=");
      return { g, p: (p as PhonemeId) ?? GRAPHEMES[g] };
    });
  }
  const segs: Seg[] = [];
  let i = 0;
  while (i < spec.length) {
    const multi = MULTI.find((g) => allowed.has(g) && spec.startsWith(g, i));
    const g = multi ?? spec[i];
    if (!GRAPHEMES[g]) throw new Error(`Unknown spelling ${g} in ${spec}`);
    segs.push({ g, p: GRAPHEMES[g] });
    i += g.length;
  }
  return segs;
}

export interface Unit {
  id: number;
  /** new spellings introduced in this unit */
  spellings: string[];
  /** Conceptual focus, for grown-ups */
  focus: string;
  /** word specs; "word|picture prompt" marks a picturable word */
  words: string[];
}

export const UNITS: Unit[] = [
  {
    id: 1, spellings: ["a", "i", "m", "s", "t"], focus: "One sound, one letter",
    words: ["at", "am", "it", "sat", "mat|a rectangular striped mat with a short fringe at both ends, lying flat, seen from slightly above", "sit|one smiling little girl sitting down: curly brown hair, a friendly face with two eyes and a big smile, a yellow T-shirt and blue shorts, sitting on a small red chair that is mostly hidden under her, both feet on the floor, facing the viewer, the whole girl visible from head to toe"],
  },
  {
    id: 2, spellings: ["n", "o", "p"], focus: "One sound, one letter",
    words: [
      "an", "in", "on", "man|a grown-up man with a friendly face (two eyes and a big smile), short brown hair, a green jumper and blue jeans, whole from head to toe, facing the viewer and waving", "pan|a frying pan", "nap|a sleepy cat taking a nap", "tap|a kitchen water tap",
      "map|a treasure map", "pat", "pit", "pin|a big red drawing pin (a push pin) standing on its point, seen from the side", "tin|a tin can", "nip", "tip", "sip", "pot|a clay cooking pot",
      "top|a spinning top toy", "not", "mop|a floor mop", "pop", "pip", "tan",
    ],
  },
  {
    id: 3, spellings: ["b", "c", "g", "h"], focus: "One sound, one letter",
    words: [
      "cat|a cat", "cap|a baseball cap", "can", "cot|a baby's cot", "bat|a cute bat flying", "bag|a school bag", "big",
      "bin|a rubbish bin", "bit", "bib|a baby bib", "hat|a red woolly bobble hat with a big white bobble on top", "hit", "him", "hop|one happy child hopping on one bare foot, other knee lifted high, arms out for balance, shown side-on with an energetic upward bounce", "hot|a bowl of steaming hot soup with big curly steam",
      "hip", "gap", "gas", "got", "pig|a round pink pig standing side-on with its head turned to smile at the viewer, flat snout, curly tail", "cab|a black taxi cab", "tag", "cob|a yellow corn on the cob with green leaves",
      "big", "hob|one built-in black glass kitchen hob seen from slightly above, a completely flat rectangular top with four circular electric cooking rings and four small controls along one edge, no raised cooker body, oven, pan or food",
    ],
  },
  {
    id: 4, spellings: ["d", "e", "f", "v"], focus: "One sound, one letter",
    words: [
      "dad", "did", "dog|a friendly brown-and-white puppy sitting and facing the viewer, floppy ears, big shiny eyes, a little pink tongue, a wagging tail", "dot|a single big shiny red ball-shaped spot, like a round red button", "den|a small cosy den made of blankets draped over chairs", "dip", "fan|an electric fan", "fit",
      "fig|one whole purple fig fruit beside a cut half showing its distinctive pink seed-filled centre, short stem and teardrop shape", "fog|a small tree half hidden in thick swirling grey fog", "fin|a shark fin", "fed", "bed|a bed", "pet", "peg|a clothes peg", "pen|a pen",
      "hen|a hen", "ten", "net|a fishing net", "get", "set", "men", "vet|a friendly woman vet in teal scrubs examining a small puppy on a low table, wearing a stethoscope around her neck, full person and puppy both clearly visible", "van|a tall boxy delivery van with a large windowless cargo box behind the cab, two front seats only, sliding side door and rear doors, in bright blue", "beg",
    ],
  },
  {
    id: 5, spellings: ["k", "l", "r", "u"], focus: "One sound, one letter",
    words: [
      "kit", "kid", "leg|one isolated bare human leg from the upper thigh to all five toes, bent slightly at the clearly visible knee, natural skin colour, no sock, shoe, trousers or rest of body", "lid|a pot lid", "lip", "lap", "let", "lot", "log|a log", "red", "rat|one large brown rat side-on, with a long pointed snout, visible front teeth, very small ears, coarse fur and a long thick bare pink tail curling behind it, no mouse", "rag", "rip",
      "rod|a fishing rod", "run|a child running", "rub", "rug|a round colourful rug", "cup|a small shallow porcelain teacup with a delicate curved handle, wide open rim, sitting on a matching saucer, empty inside", "cut", "sun|the sun", "bun|a single soft round iced bun with a little swirl of white icing on top, no plate or bread slices", "bus|a red double-decker bus",
      "bug|a bug", "hug|two cute teddy bears giving each other a big hug", "mug|a mug", "nut|a shelled walnut cracked open to show the wrinkled nut kernel inside, no acorn cap", "gum", "hut|a tiny rustic round thatched hut with a simple wooden door and no windows, made of straw and timber, clearly a one-room shelter", "tub|a bath tub", "up", "us",
      "mum", "dug", "fun", "pup|a puppy", "cub|a bear cub", "rub", "kin",
    ],
  },
  {
    id: 6, spellings: ["j", "w", "z"], focus: "One sound, one letter",
    words: [
      "jam|a jar of jam", "jet|a jet plane", "jog", "jug|a jug", "jab", "jig", "web|a spider web", "wet", "wig|a bright purple curly wig resting on a simple plain wooden wig stand, with the wig cap edge visible below the curls", "win",
      "wag", "zip|a zip", "zap", 
    ],
  },
  {
    id: 7, spellings: ["x", "y", "ff", "ll", "ss", "zz"], focus: "Two letters can spell one sound",
    words: [
      "box|a simple open cardboard box with four folded flaps, hollow inside and clearly made of brown cardboard", "fox|an orange fox sitting and facing the viewer with a friendly face: two big shiny eyes, a little black nose and a smile, white cheeks and chest, black-tipped ears, a bushy white-tipped tail", "six", "fix", "mix", "wax", "yes", "yak|a yak", "yum", "yet", "yap", "yell", "off", "puff",
      "huff", "cuff", "doll|a doll", "bell|a bell", "hill|a green hill", "well|a stone well", "fell", "sell", "tell", "bill",
      "kiss", "mess", "boss", "less", "fuss", "hiss", "miss", "buzz", "fizz", "jazz",
    ],
  },
  {
    id: 8, spellings: [], focus: "Words with two consonants together at the end",
    words: [
      "and", "ant|an ant", "end", "elf|an elf", "imp", "help", "milk|a glass of milk", "belt|a belt", "tent|a tent", "lamp|a lamp",
      "camp", "pond|a pond", "hand|one open cartoon hand waving hello, palm facing the viewer, five fingers spread", "sand|a small golden sandcastle with a little flag on top, sitting on a heap of sand", "bend", "mend", "send", "jump|a child in ordinary bright clothes jumping straight up with both feet clearly off the ground, knees tucked, arms raised joyfully, no costume or cape", "bump", "lump",
      "damp", "hunt", "gift|a wrapped gift", "left", "soft", "lift", "kept", "desk|a desk", "tusk|an elephant tusk in extreme close-up: one enormous long white ivory tusk curves upward from a tiny piece of grey elephant jaw visible at its base; the tusk dominates the image, elephant head and trunk are outside the frame", "dusk",
      "best", "nest|a bird nest", "rest", "test", "vest|a vest", "west", "just", "must", "dust", "rust", "lost", "cost", "fist", "mist",
      "golf", "silk", "film", "melt", "felt", "went", "pump", "bulb|a light bulb",
    ],
  },
  {
    id: 9, spellings: [], focus: "Words with two consonants together at the start",
    words: [
      "stop", "spot", "step", "swim|a child actively swimming across a little patch of bright blue water, side view with face above the water and one arm reaching forward in a swimming stroke, small splashes around them", "frog|a green frog sitting and facing the viewer, big round eyes with shiny black pupils, a wide smile", "flag|a flag", "flat", "plug|a plug", "plum|a plum", "pram|a pram",
      "drum|a drum", "drip", "crab|a crab", "clap", "clip", "trip", "trap", "slip", "snap", "snip", "spin", "skip",
      "skid", "grin", "grub", "grip", "glum", "glad", "twig|a twig", "swam", "brag", "blot", "flip", "flop", "from", "prop",
      "slim", "smug", "snug", "spit", "stem", "stun", "trim", "trot", "twin", "scab", "sniff", "stuff", "spell", "smell", "dress|one simple bright red child-sized dress on a plain hanger, clear fitted bodice and wide flared skirt, shown full length with no person",
    ],
  },
  {
    id: 10, spellings: [], focus: "Longer words with three or four consonants together",
    words: [
      "stamp|a single postage stamp with a picture of a flower and a wavy edge", "stump|a tree stump", "crust", "trust", "twist", "frost", "blend", "crisp|one very thin golden potato crisp with a wavy curled edge and a few darker toasted patches, shown tilted so its thinness is obvious, no whole potato", "spend", "split",
      "strap", "strip", "scrub", "scrap", "splat", "next", "text", "stand", "slept", "swept",
      "plump", "brisk", "crept",
    ],
  },
  {
    id: 11, spellings: ["sh", "ch", "th", "ck", "ng", "wh", "q", "ve", "tch"], focus: "Two or three letters can spell one sound",
    words: [
      "ship|one big ocean liner ship with a tall funnel, several decks and rows of round portholes along a long hull, floating on a small patch of blue water, no sails", "shop|a shop", "shed|a garden shed", "shell|a sea shell", "fish|an orange goldfish swimming side-on, one big round friendly eye, a small smile, flowing tail fins", "dish", "wish", "cash", "rush", "shut",
      "chip", "chop", "chin", "chat", "chest|a plain wooden storage chest with a curved lid and simple iron bands, closed, no treasure or coins or lock", "rich", "much", "lunch", "bench|a park bench", "munch", "chimp|a chimpanzee with black fur, pale face, large round ears and long arms walking on its knuckles, no tail, seen full-body from the side",
      "thin", "thick", "moth|a moth", "cloth", "thud", "thump", "th=dh.i.s", "th=dh.a.t", "th=dh.e.m", "th=dh.e.n", "w.i.th=dh",
      "duck|a white farm duck standing side-on with a friendly face: one big round shiny black eye clearly drawn on its head, an orange beak with a little smile, and orange feet", "sock|a sock", "rock|a rock", "kick", "pick", "back", "neck", "lock|a padlock", "stuck", "snack", "black", "clock|a clock", "ring|a ring", "king|a friendly grown-up king wearing a golden crown and a long red royal robe, with his face, full body and hands visible, waving", "sing", "song", "long", "wing|a wing", "bang", "hang",
      "strong", "swing|a swing", "thing", "when", "which", "whip", "whisk|a whisk", "q.u=w.i.ck", "q.u=w.i.z", "q.u=w.i.t", "q.u=w.i.l.t|a quilt",
      "s.q.u=w.i.d|a squid", "q.u=w.a.ck", "h.a.ve", "g.i.ve", "catch", "patch", "match|a match stick", "fetch", "witch|a friendly full-body witch with a face, purple pointed hat and dark dress, holding a little broom, clearly a person rather than just a hat", "itch",
      "hutch|a rabbit hutch", "ditch", "sketch", "chick|a chick", "shock", "check",
    ],
  },
  {
    id: 12, spellings: ["ai", "ay", "ee", "ea", "igh", "ie", "oa", "ow"], focus: "One sound can be spelt in different ways",
    words: [
      "rain|rain falling from a cloud", "train|a steam train", "snail|a snail", "tail|a fox tail", "nail|a nail", "paint|a paint pot",
      "day", "play", "tray|a tray", "stay", "say", "spray", "tree|a tree", "bee|a bee", "feet|a pair of bare cartoon feet side by side with wiggly toes", "sheep|a sheep", "green",
      "q.u=w.ee.n|a queen", "sleep", "sea|a big curling blue ocean wave with white foam", "tea|a cup of tea", "eat", "leaf|a leaf", "dream", "beach|a beach", "seat",
      "night|a sleepy yellow crescent moon wearing a nightcap, with two small stars", "light|a glowing lamp light bulb shining", "high", "fight", "bright", "pie|a pie", "tie|a tie", "lie",
      "boat|a boat", "goat|a goat", "coat|a coat", "road|a road", "soap|a pink bar of soap covered in white foam with shiny soap bubbles floating around it", "toast|toast", "snow|snow",
      "grow", "slow", "blow", "crow|a crow",
    ],
  },
];

/** Picture words used only in LISTENING games (never written), e.g. first-sound /a/ in "apple". */
export const ORAL_WORDS: Record<string, { pic: string; first: PhonemeId }> = {
  apple: { pic: "a shiny red apple", first: "a" },
  astronaut: { pic: "a friendly child astronaut in a white space suit waving", first: "a" },
  insect: { pic: "a cute green beetle insect", first: "i" },
  igloo: { pic: "a small snowy igloo", first: "i" },
  octopus: { pic: "a friendly purple octopus", first: "o" },
  otter: { pic: "a cute brown otter floating on its back", first: "o" },
  // first minutes (docs/FIRST_MINUTES.md): Lesson 1 and 2 pictures, the compound words and the fish-dog gag
  sausage: { pic: "one plump golden-brown cooked sausage, slightly curved", first: "s" },
  moon: { pic: "a glowing pale-yellow crescent moon", first: "m" },
  flower: { pic: "one red flower with five round petals, a yellow middle, a green stem and two leaves", first: "f" },
  sunflower: { pic: "one tall sunflower with big bright yellow petals, a round brown middle, a green stem and two leaves", first: "s" },
  star: { pic: "one plump bright yellow five-pointed star with rounded points, on its own (no card, no frame, no background shape)", first: "s" },
  starfish: { pic: "an orange starfish with five chunky rounded arms and little dots, facing the viewer with a friendly smile", first: "s" },
  fishdog: { pic: "a funny goldfish with floppy brown puppy ears, a pink tongue and a wagging puppy tail, facing the viewer and smiling", first: "f" },
  dogfish: { pic: "a funny brown-and-white puppy with orange goldfish fins on its back and a goldfish tail, sitting and facing the viewer, smiling", first: "d" },
};

/** Special (tricky) words: taught whole, with their unusual part noted. */
export const SPECIAL_WORDS = ["the", "a", "I", "to", "no", "go", "is", "he", "she", "we", "me", "be", "was", "you", "my", "said", "of", "they", "all", "are", "her", "do", "so", "his", "has", "into", "Baron", "Muddle", "ninja", "Sensei"];

// ---- Derived data ------------------------------------------------------------------------

export const ALL_SPELLINGS_BY_UNIT: string[][] = UNITS.map((_, i) => UNITS.slice(0, i + 1).flatMap((x) => x.spellings));

export const WORDS: Word[] = [];
export const WORD_BY_TEXT: Record<string, Word> = {};
for (const [i, u] of UNITS.entries()) {
  const allowed = new Set(ALL_SPELLINGS_BY_UNIT[i]);
  for (const raw of u.words) {
    const [spec, pic] = raw.split("|");
    const segs = parseWord(spec, allowed);
    const text = segs.map((s) => s.g).join("");
    if (WORD_BY_TEXT[text]) continue;
    for (const s of segs) {
      if (!allowed.has(s.g)) throw new Error(`Word ${text} in unit ${u.id} uses spelling ${s.g} not yet taught`);
    }
    const w: Word = { text, segs, unit: u.id, pic };
    WORDS.push(w);
    WORD_BY_TEXT[text] = w;
  }
}

/** Homophones (same sounds, different spelling: which/witch). Without a picture a child can't know which one to spell. */
const bySounds = new Map<string, number>();
for (const w of WORDS) bySounds.set(w.segs.map((s) => s.p).join("-"), (bySounds.get(w.segs.map((s) => s.p).join("-")) ?? 0) + 1);
export const dictationSafe = (w: Word) => w.pic || bySounds.get(w.segs.map((s) => s.p).join("-")) === 1;

export const wordsUpTo = (unit: number) => WORDS.filter((w) => w.unit <= unit);
export const wordsIn = (units: number[]) => WORDS.filter((w) => units.includes(w.unit));
export const unitOfSpelling = (g: string) => UNITS.find((u) => u.spellings.includes(g))?.id ?? 99;

/** Parse a teach entry like "th=dh" → spelling + sound. */
export const teachEntry = (t: string): Seg => {
  const [g, p] = t.split("=");
  return { g, p: (p as PhonemeId) ?? GRAPHEMES[g] };
};

/** Spelling→sound pairs shown on the World Flower, in teaching order. <x> is one spelling for two sounds, /k/+/s/. */
export const CHART: Seg[] = UNITS.flatMap((u) =>
  u.spellings.flatMap((g): Seg[] =>
    g === "x" ? [{ g, p: "k" }, { g, p: "s" }] : g === "th" ? [{ g, p: "th" }, { g, p: "dh" }] : g === "q" ? [{ g, p: "k" }, { g: "u", p: "w" }] : [{ g, p: GRAPHEMES[g] }],
  ),
);

/** Every spelling taught, in teaching order. */
export const SPELLING_ORDER: string[] = UNITS.flatMap((u) => u.spellings);

/** Spelling→sound pairs (GPCs), the unit of mastery. key: "g>p" e.g. "c>k", "ck>k". */
export const gpcKey = (s: Seg) => `${s.g}>${s.p}`;
