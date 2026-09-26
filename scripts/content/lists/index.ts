import { WORDS } from "../../../src/content/phonics";
import { BRIDGING_UNIT } from "../../../src/content/sw";
import { OFFICIAL_EC_WORDS } from "./extended";
export { EC_PICTURE_PROMPTS } from "./ec-pictures";

/** Deliberately small curated British children's lexicon. Expand and re-audit in later phases. */
export const EXTRA_WORDS: Record<string, string[]> = {
  IC2: ["tam", "tot", "tom", "pint"],
  IC3: ["ham", "hog", "nag", "cog", "cop", "bam", "gag", "gab"],
  IC4: ["hem", "fad", "vat", "fad", "veg", "fob", "dab", "deaf", "dove", "dig", "sad", "mad", "nod", "pod", "pad", "dim"],
  IC5: ["ram", "rum", "rut", "dug", "lug", "lad", "luck", "lark"],
  IC6: ["job", "jot", "jut", "wit", "wed", "wok", "wad", "wiz", "zig", "zag", "jig"],
  IC7: ["mill", "fill", "pill", "dull", "lull", "moss", "loss", "jell", "tiff", "buff"],
  IC8: ["mint", "hint", "dent", "lent", "list", "land", "fund", "mask", "wind", "mast", "mist", "ramp", "pest", "pelt", "silt", "limp"],
  IC9: ["slam", "slap", "slop", "slid", "slim", "plod", "plop", "plan", "plum", "clog", "clot", "club", "clad", "glad", "glum", "gram", "grit", "grub", "grab", "pram", "prod", "prig", "drag", "drop", "drum", "drip", "brim", "brag", "brat", "blab", "blip", "flap", "flit", "flop", "fret", "frog", "friz", "skit", "skid", "smog", "smug", "snag", "snip", "snap", "spin", "stem", "step", "swim", "swam", "twin", "twig", "trim"],
  IC10: ["swift", "slump", "stink", "grand", "print", "blast", "bland", "blunt", "brand", "brunt", "clump", "cramp", "drift", "flint", "frisk", "glint", "grump", "grunt", "plump", "skimp", "spent", "spilt", "stint", "stomp", "stunt", "swept", "tramp", "trend", "tempt", "lists", "lumps", "pumps", "cuffs", "puffs", "ants", "silks", "belts", "tents", "hints", "dents", "gifts", "fists", "mints", "rests", "tests", "mists", "lamps", "lifts", "steps", "stops", "flaps", "rafts", "claps", "slips", "skips", "snaps", "flips", "trips", "drops"],
  IC11: ["sham", "shag", "shack", "shill", "shuck", "shush", "chill", "chug", "chum", "chap", "chick", "thatch", "thick", "thank", "think", "bank", "tank", "pink", "wink", "sink", "chunk", "lunch", "bunch", "crunch", "quill", "quilt", "quit", "whack", "whiff", "wham", "whisk", "whip", "pitch", "ditch", "hatch", "itch", "witch", "watch", "quiz", "quick", "quest", "blink", "drink", "sling", "bring", "sting", "switch", "twitch", "patch", "batch", "latch", "notch", "live"],
  EC1: ["sail", "wait", "hail", "chain"],
  EC2: ["sheep", "leaf", "bean", "seed", "peep", "beep", "wheel"],
  EC4: ["soap", "road", "toad", "foam", "loaf", "roast", "coast", "toast", "groan", "moan", "oak", "oat", "goal", "coal", "hold", "gold", "mole", "hole", "rope", "cone", "stone"],
  EC6: ["fur", "burn", "surf", "nurse", "purse", "stir", "third", "term"],
  EC8: ["down", "howl", "sound", "found", "pound"],
  EC10: ["boot", "pool", "tool", "cool", "zoo", "roof", "noon", "soon", "stool"],
  EC11: ["kite", "ride", "hide", "wide", "slide", "dive", "drive", "time", "lime", "bike", "hike", "like", "spike", "stripe", "spine"],
  EC19: ["paw", "jaw", "law", "lawn", "storm", "corn", "horn", "thorn", "sport", "sort", "ball", "wall"],
  EC20: ["hare", "mare", "scare", "spare", "flare"],
  EC21: ["dune", "fuse", "mule"],
  EC23: ["foil", "oink", "moist"],
  EC24: ["arm", "barn", "yard", "hard", "park", "dark", "bark", "mark", "shark", "spark", "scarf"],
  EC17: ["dogs", "pigs", "beds", "bags", "hens", "pens", "cups", "hats"],
  EC18: ["mile", "hole", "pole", "rule", "sale", "tale", "pale", "tile", "file", "pile", "mole", "smile"],
  EC26: ["cake", "make", "take", "bake", "gate", "game", "same", "cave", "flame", "shake", "whale", "was", "wash", "watch", "wasp", "want", "what", "wand", "swat"],
};

export const US_DENY = new Set(["color", "gray", "mom", "candy", "diaper", "pajamas", "favorite", "center", "meter", "theater", "cookie", "sidewalk", "truck", "gasoline", "soccer", "sneakers"]);
export const ACCENT_SENSITIVE = new Set(["bath", "grass", "path", "fast", "last", "castle", "after", "plant", "mask", "ask", "chance", "dance", "class", "glass", "book", "look", "put", "pull", "pudding"]);
export const SLANG_DENY = new Set(["knob", "shag", "bum", "willy", "snog", "slag", "tit", "fag", "prat", "git", "bonk", "hump", "nob", "cock", "dick", "piss", "crap", "twat", "fob", "zit"]);
export const UNSUITABLE_DENY = new Set(["kill", "gun", "shot", "stab", "blood", "dead", "die", "died", "ghost", "demon", "drug", "beer", "wine", "poo", "pee", "fart", "spit", "scab", "witch", "horror", "monster", "whomp", "wham", "jab", "zap", "hit", "blast"]);
export const EARLY_WORD_DENY = new Set(["bam", "gab", "gag", "nag", "cop", "cob", "wiz", "wit", "hob", "fig", "yak", "job", "fund", "trust", "grump", "hints", "tests"]);
export const BRAND_DENY = new Set(["lego", "google", "disney", "barbie", "nike", "ipad", "coke"]);
export const PROPER_NAME_DENY = new Set(["spain", "jean", "joe", "june", "paul", "arthur", "roy", "ben", "bob", "tom", "ann", "dan", "david", "hazel", "bill", "alice", "welsh"]);
export const CHILD_ALLOW = new Set([
  ...WORDS.map(w => w.text),
  ...Object.values(EXTRA_WORDS).flat(),
  ...BRIDGING_UNIT.sounds.flatMap(s => Object.values(s.words).flat()),
  ...Object.values(OFFICIAL_EC_WORDS).flat(),
]);
export { OFFICIAL_EC_WORDS } from "./extended";
export const TAUGHT_NAMES = new Set(["Sam", "Tim", "Pip"]);
/** Words kept for reading/spelling but too hard to name from a single still picture. */
export const NON_PICTUREABLE = new Set(["hot", "cab", "hog", "wet", "job", "wad", "yum", "fund", "plump", "swept", "black"]);

/** A prompt may be replaced after the old image proved ambiguous in a blind naming audit. */
export const REPLACEMENT_PROMPTS: Record<string, string> = {
  bug: "one small green six-legged garden bug, shown alone with its body and legs clearly visible",
  cab: "one black London taxi with a tall roof and a small yellow lamp with no writing",
  cub: "one young bear cub standing alone, small round ears and short snout, no adult bear",
  dot: "one small black round dot centred on a plain white square, no other marks",
  desk: "one wooden writing desk with a wide flat top, a single drawer and an empty chair pushed under it, no writing",
  fin: "one single bright orange fan-shaped fish fin with thin ribs, shown alone against a plain background; no fish, shark, water or other object",
  fog: "one patch of thick grey fog curling across a field, no trees or buildings",
  hen: "one adult brown hen standing alone, with a red comb and short beak",
  hill: "one smooth green grassy hill rising above a flat plain, no food or buildings",
  hob: "one flat black glass electric hob with four circular cooking rings, no oven or pan",
  hot: "one red metal kettle with heat waves rising from it, no food",
  hug: "two children facing each other in one clear hug, both full bodies visible",
  jet: "one grey jet aircraft with swept wings and two engines, flying alone",
  jump: "one child jumping straight up with both feet in the air, full body clearly visible",
  nap: "one child asleep on a small bed in daylight, shoes off and blanket folded back",
  pup: "one very young puppy standing alone with oversized paws and floppy ears",
  ship: "one large ship with a tall funnel, decks and portholes, floating on water",
  squid: "one squid swimming alone, with a long pointed mantle and ten trailing arms",
  stamp: "one postage stamp with a scalloped edge and a simple flower picture, no letters or numbers",
  tub: "one freestanding bath tub with four little feet and no taps",
  twig: "one thin twig with two small side branches and a few leaves, lying alone",
  quilt: "one stitched patchwork quilt folded on a plain bed, with a repeating square pattern",
};

export const NEW_PICTURE_PROMPTS: Record<string, string> = {
  ham: "one slice of pink cooked ham on a plain white plate",
  hog: "one wild hog standing alone, with a bristly coat and short tusks",
  cog: "one large metal cog wheel with clearly spaced teeth and a hole in the middle",
  vat: "one big open wooden vat with a thick rim and no contents",
  ram: "one adult ram standing alone with large curled horns",
  lad: "one smiling young boy standing alone in ordinary clothes",
  job: "one cheerful gardener watering a flower bed with a can",
  jog: "one child jogging along a clear path in trainers, seen from the side",
  wet: "one drenched yellow raincoat dripping water onto the floor",
  wag: "one happy dog's tail wagging from side to side, full dog shown",
  win: "one child crossing a finish line first with both arms raised, no writing",
  wad: "one thick wad of white cotton wool, folded and fluffy",
  kiss: "two teddy bears touching noses in a gentle kiss, full bodies visible",
  yum: "one child tasting a strawberry and smiling with delight",
  yell: "one child calling out loudly with hands cupped round the mouth",
  mess: "one messy pile of coloured toy blocks scattered on the floor",
  puff: "one soft white puff of steam rising from a kettle",
  fix: "one child fixing a broken toy wheel with a small screwdriver, full action visible",
  strap: "one plain blue fabric strap with a buckle, laid out alone",
  crust: "one crisp brown crust cut from a loaf of bread, alone",
  frost: "one garden leaf edged with white frost crystals",
  twist: "one twisted strip of bright paper, alone",
  scrub: "one hand scrubbing a dirty plate with a sponge",
  strip: "one long narrow strip of red cloth, alone",
  split: "one log split neatly into two matching halves",
  swept: "one broom sweeping a small pile of autumn leaves",
  scrap: "one small scrap of blue cloth with frayed edges, alone",
  stand: "one child standing upright with arms by their sides, full body visible",
  black: "one black square of velvet fabric, alone on a white ground",
  wok: "one black round wok with a long handle, empty and seen from above",
  mill: "one old windmill with four sails on a hill",
  moss: "one soft bright green clump of moss on a plain stone",
  mint: "one fresh mint plant with small bright green leaves in a pot",
  dent: "one clear dent in the side of a plain metal tin",
  fund: "one glass jar with coins inside and no writing",
  slam: "one wooden door swinging shut, with motion lines and no person",
  plod: "one child walking slowly through shallow mud in wellies",
  clog: "one wooden clog shoe standing alone",
  flap: "one bird flapping its wings in mid-air, clearly seen from the side",
  brand: "one plain cardboard box with a simple coloured mark and no text",
  clump: "one clump of grass with roots and soil visible",
  cramp: "one child rubbing a cramped calf muscle while seated",
  drift: "one small snowdrift piled against a plain fence",
  glint: "one bright glint of light on a silver spoon",
  plump: "one plump round orange pumpkin, alone",
  stamp: "one postage stamp with a scalloped edge and a simple flower picture, no letters or numbers",
  tents: "two small camping tents on grass, no people or writing",
  shell: "one spiral sea shell with a ridged surface, seen alone",
  chick: "one fluffy yellow chick standing alone",
  chunk: "one chunky piece of cheese cut from a block, no plate",
  sink: "one plain white kitchen sink with a tap and drain, empty and clean",
  wink: "one child winking one eye with a friendly smile, face shown close up",
  quill: "one feather quill with a pointed tip, no ink or writing",
  pitch: "one grassy sports pitch with white boundary lines and no words",
  hatch: "one little yellow chick hatching from a cracked egg",
};
