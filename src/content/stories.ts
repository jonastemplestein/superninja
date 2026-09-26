// Interactive stories. Sensei reads the "narr" pages (rich language). The child reads the "read"
// pages, which must be decodable with the sounds taught so far (checked by validateStories()).
// Scene art is drawn WITHOUT the hero; the player's chosen ninja sprite is composited on top.

export type HeroPose = "idle" | "run" | "jump" | "throw" | "cast" | "hurt" | "cheer";

export type Page =
  | { id: string; kind: "narr"; text: string; who?: "sensei" | "baron"; scene: string; hero?: HeroPose; next?: string }
  | { id: string; kind: "read"; text: string; scene: string; hero?: HeroPose; next?: string }
  | { id: string; kind: "choice"; text: string; scene: string; hero?: HeroPose; options: { word: string; next: string }[] }
  | { id: string; kind: "question"; text: string; scene: string; options: { img: string; label: string; correct?: boolean }[] };

export interface Story { id: string; world: number; maxUnit: number; title: string; scenes: Record<string, string>; pages: Page[] }

export const STORIES: Story[] = [
  {
    id: "s1", world: 1, maxUnit: 2, title: "The Missing Pot",
    scenes: {
      village: "a bamboo village square with paper lanterns where three chubby pandas sit looking very sad beside an empty table, big empty space on the left side of the picture",
      map: "a close-up of an old treasure map lying on a wooden table in a bamboo village, a dotted path drawn on it leading to a cross, bamboo in the background, with calm, simple scenery on the left third of the picture",
      path: "a twisty path through a tall green bamboo forest with dappled sunlight, mysterious and fun, with calm, simple scenery on the left third of the picture",
      fork: "a forest clearing with a deep round hole in the ground on one side and a little woven straw mat on the other side, with calm, simple scenery on the left third of the picture",
      pit: "looking down into a round hole in the ground where a chubby panda is curled up fast asleep and snoring with a bubble, funny",
      mat: "a little woven straw mat in a forest clearing with a big round clay cooking pot sitting on it, glowing slightly",
      feast: "three happy pandas feasting on dumplings from a big clay pot at a table in the bamboo village, a glowing rainbow teardrop-shaped sound petal floating above the pot, celebration",
    },
    pages: [
      { id: "1", kind: "narr", scene: "village", hero: "idle", text: "In Bamboo Village, the pandas were having a terrible day. Baron Muddle had pinched their lunch pot and hidden it! But Super Ninja had a clue..." },
      { id: "2", kind: "read", scene: "map", hero: "idle", text: "Map! Tap it!" },
      { id: "3", kind: "narr", scene: "path", hero: "run", text: "The map showed a twisty path, deep into the bamboo. Super Ninja crept along, quiet as a mouse." },
      { id: "4", kind: "read", scene: "path", hero: "run", text: "Tip, tap, tip, tap." },
      { id: "5", kind: "choice", scene: "fork", hero: "idle", text: "Two places to look! Where is the pot hidden?", options: [{ word: "pit", next: "5a" }, { word: "mat", next: "6" }] },
      { id: "5a", kind: "read", scene: "pit", text: "Pip! Nap, Pip, nap.", next: "5b" },
      { id: "5b", kind: "narr", scene: "pit", text: "Shhh! Let's tiptoe away and let Pip the panda sleep. Try the other place!", next: "5" },
      { id: "6", kind: "read", scene: "mat", hero: "cheer", text: "Pot! Pot on mat!" },
      { id: "7", kind: "narr", scene: "feast", hero: "cheer", text: "The pandas cheered and gobbled up every last dumpling. And look! Inside the pot was a glowing sound petal." },
      { id: "q", kind: "question", scene: "feast", text: "What did Baron Muddle hide?", options: [{ img: "pic_pot", label: "pot", correct: true }, { img: "pic_map", label: "map" }, { img: "pic_pan", label: "pan" }] },
    ],
  },
  {
    id: "s2", world: 2, maxUnit: 4, title: "Peg in the Fog",
    scenes: {
      hills: "pink cherry blossom hills where a big swirl of grey fog is rolling in, and a small worried brown hen is running into the fog, with calm, simple scenery on the left third of the picture",
      fog: "thick grey fog on a hillside with the dim shapes of cherry trees, and a tiny brown hen peeking out looking lost, with calm, simple scenery on the left third of the picture",
      trail: "a trail of little brown feathers on a grassy hill path in soft fog, leading to two places: a cosy den made of branches and a pig sty with a pig, with calm, simple scenery on the left third of the picture",
      pigsty: "a muddy pig pen with a big pink pig sitting in the mud grinning, holding a feather in its mouth, funny",
      den: "inside a cosy den made of branches and blossom where a small brown hen sits in a nest, looking relieved",
      home: "a happy brown hen back at her little hen house on a sunny blossom hill, the fog gone, a golden egg cracked open with a glowing rainbow teardrop-shaped sound petal rising out of it",
    },
    pages: [
      { id: "1", kind: "narr", scene: "hills", hero: "idle", text: "Up on Blossom Hills lived a little hen called Peg. One morning, Baron Muddle blew a big grey fog over the hills, and poor Peg got lost!" },
      { id: "2", kind: "read", scene: "fog", hero: "idle", text: "Peg the hen is in the fog." },
      { id: "3", kind: "narr", scene: "trail", hero: "run", text: "Super Ninja followed a trail of feathers through the fog. The trail led to two places..." },
      { id: "4", kind: "choice", scene: "trail", hero: "idle", text: "Where is Peg?", options: [{ word: "pig", next: "4a" }, { word: "den", next: "5" }] },
      { id: "4a", kind: "read", scene: "pigsty", text: "It is a pig in a pen! Peg is not in the pen.", next: "4b" },
      { id: "4b", kind: "narr", scene: "pigsty", text: "The pig only had one feather. Cheeky pig! Let's look in the other place.", next: "4" },
      { id: "5", kind: "read", scene: "den", hero: "cheer", text: "Peg is in the den! Get Peg!" },
      { id: "6", kind: "read", scene: "den", hero: "idle", text: "Hop on, Peg. Hop on!" },
      { id: "7", kind: "narr", scene: "home", hero: "cheer", text: "Super Ninja carried Peg all the way home. The fog melted away, and Peg was so happy that she laid a golden egg... with a sound petal inside!" },
      { id: "q", kind: "question", scene: "home", text: "Who was lost in the fog?", options: [{ img: "pic_hen", label: "hen", correct: true }, { img: "pic_pig", label: "pig" }, { img: "pic_dog", label: "dog" }] },
    ],
  },
  {
    id: "s3", world: 3, maxUnit: 7, title: "The Yak's Bell",
    scenes: {
      mountain: "a snowy misty mountain meadow where a fluffy baby yak with no bell looks sad, and far away in the mist its big mum yak is searching, with calm, simple scenery on the left third of the picture",
      bridge: "a wobbly rope bridge over a misty mountain gorge with snowy pines, with calm, simple scenery on the left third of the picture",
      hill: "a steep snowy hill with a path going up, sparkly snow, with calm, simple scenery on the left third of the picture",
      top: "the top of a snowy hill with an open wooden box on one side and a big sparkly spider web between two rocks on the other side, with calm, simple scenery on the left third of the picture",
      web: "a big frosty spider web between rocks with a funny fluffy mountain spider waving hello",
      box: "an open wooden box in the snow with a shiny golden cow bell on a red ribbon inside",
      reunion: "a fluffy baby yak wearing a golden bell nuzzling its big mum yak in a snowy meadow, the mist clearing, a glowing rainbow teardrop-shaped sound petal tied to the bell ribbon",
    },
    pages: [
      { id: "1", kind: "narr", scene: "mountain", hero: "idle", text: "High in the Misty Mountains lived a little yak called Rex. Baron Muddle had pinched Rex's bell, so now his mum couldn't find him in the mist!" },
      { id: "2", kind: "read", scene: "mountain", hero: "idle", text: "Rex is a yak. His bell is not on him!" },
      { id: "3", kind: "narr", scene: "bridge", hero: "run", text: "Super Ninja heard a faint ding-dong, far away. Across a wobbly rope bridge they went, and then..." },
      { id: "4", kind: "read", scene: "hill", hero: "run", text: "Run, run! Up the hill!" },
      { id: "5", kind: "choice", scene: "top", hero: "idle", text: "Where is the bell?", options: [{ word: "web", next: "5a" }, { word: "box", next: "6" }] },
      { id: "5a", kind: "read", scene: "web", text: "It is a web. The bell is not in it.", next: "5b" },
      { id: "5b", kind: "narr", scene: "web", text: "The spider waved all eight legs hello. Friendly, but no bell! Try the other place.", next: "5" },
      { id: "6", kind: "read", scene: "box", hero: "cheer", text: "The bell is in the box. Yes!" },
      { id: "7", kind: "narr", scene: "reunion", hero: "cheer", text: "Ding-dong! Rex's mum heard the bell and came galloping through the mist. And tied to the bell's ribbon was a sound petal!" },
      { id: "q", kind: "question", scene: "reunion", text: "What did Rex lose?", options: [{ img: "pic_bell", label: "bell", correct: true }, { img: "pic_box", label: "box" }, { img: "pic_doll", label: "doll" }] },
    ],
  },
  {
    id: "s4", world: 4, maxUnit: 10, title: "Frog Gets Across",
    scenes: {
      bank: "a wide turquoise river with broken stepping stones, a small green frog in a straw hat standing on the near bank looking at the far bank, with calm, simple scenery on the left third of the picture",
      plan: "a river bank with a big fallen log, sticks, twigs and a belt lying on the grass, with calm, simple scenery on the left third of the picture",
      jam: "a messy splat of sticky red jam dripping off a log, a frog looking disgusted, funny",
      log: "a small green frog in a straw hat sitting on a floating log drifting down a turquoise river with koi fish, sunny, with calm, simple scenery on the left third of the picture",
      far: "the far bank of a river where a frog in a straw hat hops happily, and a glowing rainbow teardrop-shaped sound petal rests on a lily pad",
    },
    pages: [
      { id: "1", kind: "narr", scene: "bank", hero: "idle", text: "On Dragon River, Frog wanted to get to the other side, to visit his gran. But Baron Muddle had smashed all the stepping stones!" },
      { id: "2", kind: "read", scene: "bank", hero: "idle", text: "Frog must get to Gran." },
      { id: "3", kind: "narr", scene: "plan", hero: "idle", text: "Super Ninja had a plan: make a log into a boat! But what could hold the sticks on?" },
      { id: "4", kind: "choice", scene: "plan", hero: "idle", text: "What will hold the sticks on?", options: [{ word: "jam", next: "4a" }, { word: "belt", next: "5" }] },
      { id: "4a", kind: "read", scene: "jam", text: "Jam? It is a big mess!", next: "4b" },
      { id: "4b", kind: "narr", scene: "jam", text: "Splodge! Jam is yummy, but it's no good for building boats. Try again!", next: "4" },
      { id: "5", kind: "read", scene: "log", hero: "cheer", text: "Frog and I sit on the log. Drift, log, drift!" },
      { id: "6", kind: "narr", scene: "far", hero: "cheer", text: "They drifted all the way across Dragon River. Frog's gran was waiting on the far bank, with a sound petal!" },
      { id: "q", kind: "question", scene: "far", text: "What did they ride across the river?", options: [{ img: "pic_log", label: "log", correct: true }, { img: "pic_bus", label: "bus" }, { img: "pic_van", label: "van" }] },
    ],
  },
  {
    id: "s5", world: 5, maxUnit: 11, title: "The Baron's Chest",
    scenes: {
      hall: "a spooky-but-cute purple castle hall with glowing lanterns, and on a big black rock in the middle sits a wooden treasure chest with a swirly purple lock, with calm, simple scenery on the left third of the picture",
      lock: "a close-up of a wooden treasure chest with a big swirly purple magic padlock, sparkles, with calm, simple scenery on the left third of the picture",
      kick: "a treasure chest still firmly shut with a comic dust cloud and stars around it",
      open: "a wooden treasure chest bursting open with hundreds of glowing rainbow-coloured teardrop-shaped sound petals whooshing out like a rainbow snowstorm in a purple castle hall",
    },
    pages: [
      { id: "1", kind: "narr", scene: "hall", hero: "idle", text: "Deep inside Shadow Castle, Baron Muddle kept his treasure chest, stuffed full of stolen sound petals. Super Ninja crept in through a window..." },
      { id: "2", kind: "read", scene: "hall", hero: "idle", text: "The chest is on a big black rock." },
      { id: "3", kind: "narr", scene: "lock", hero: "idle", text: "But the chest was locked with a muddle-lock. How could Super Ninja open it?" },
      { id: "4", kind: "choice", scene: "lock", hero: "idle", text: "What should Super Ninja do?", options: [{ word: "kick", next: "4a" }, { word: "tap", next: "5" }] },
      { id: "4a", kind: "read", scene: "kick", hero: "hurt", text: "Kick! Thud! It is still shut.", next: "4b" },
      { id: "4b", kind: "narr", scene: "kick", text: "Ouch, that hurt a ninja toe! A muddle-lock needs a gentle touch. Try again.", next: "4" },
      { id: "5", kind: "read", scene: "lock", hero: "cast", text: "Tap, tap, tap. The lock went click!" },
      { id: "6", kind: "read", scene: "open", hero: "cheer", text: "The lid pops up. So much stuff!" },
      { id: "7", kind: "narr", scene: "open", hero: "cheer", text: "Petals whooshed out of the chest like a rainbow snowstorm, flying home to the World Flower. Now only the Sky Temple is left..." },
      { id: "q", kind: "question", scene: "open", text: "Where was the chest?", options: [{ img: "pic_rock", label: "rock", correct: true }, { img: "pic_bed", label: "bed" }, { img: "pic_box", label: "box" }] },
    ],
  },
  {
    id: "s6", world: 6, maxUnit: 12, title: "The Last Petal",
    scenes: {
      peak: "the top of a golden sky temple on the clouds, where the villain Baron Muddle: a dark charcoal-green toad sorcerer with glowing red eyes, a jagged black iron crown and a torn black and crimson cloak sits all alone on the steps looking sad, holding one glowing rainbow teardrop-shaped sound petal, with calm, simple scenery on the left third of the picture",
      talk: "the villain Baron Muddle: a dark charcoal-green toad sorcerer with glowing red eyes, a jagged black iron crown and a torn black and crimson cloak sniffing sadly, a tear in his eye, on golden temple steps in the clouds, with calm, simple scenery on the left third of the picture",
      snail: "a cosy storybook-style picture of a smiling snail slowly crossing a sunny garden path, drawn as if it is the picture inside a story book",
      goat: "a cosy storybook-style picture of a cheeky goat nibbling a coat on a washing line, drawn as if it is the picture inside a story book",
      happy: "the villain Baron Muddle: a dark charcoal-green toad sorcerer with glowing red eyes, a jagged black iron crown and a torn black and crimson cloak grinning happily, sitting on golden temple steps in the clouds, with calm, simple scenery on the left third of the picture",
      bloom: "the magical World Flower in full glorious bloom on its hilltop at sunrise: a giant flower of glowing rainbow teardrop petals around a golden heart, sparkles and rainbows, the whole island below celebrating",
    },
    pages: [
      { id: "1", kind: "narr", scene: "peak", hero: "idle", text: "At the very top of the Sky Temple, Baron Muddle sat all alone, holding the very last petal. He didn't look muddly at all. He looked... sad." },
      { id: "2", kind: "read", scene: "peak", hero: "idle", text: "He sits on his own. He is sad." },
      { id: "3", kind: "narr", scene: "talk", hero: "idle", text: "Why are you so grumpy, Baron? asked Super Ninja. The Baron sniffed. Nobody ever reads ME a story..." },
      { id: "4", kind: "read", scene: "talk", hero: "cheer", text: "I can read to you!" },
      { id: "5", kind: "choice", scene: "talk", hero: "idle", text: "Which story will you read to the Baron?", options: [{ word: "snail", next: "5a" }, { word: "goat", next: "5b" }] },
      { id: "5a", kind: "read", scene: "snail", text: "The snail is slow, slow, slow. Go, snail, go!", next: "6" },
      { id: "5b", kind: "read", scene: "goat", text: "The goat eats a coat. Yuck!", next: "6" },
      { id: "6", kind: "read", scene: "happy", hero: "cheer", text: "He is not sad. He can grin!" },
      { id: "7", kind: "narr", scene: "bloom", hero: "cheer", text: "And with a happy sniff, the Baron gave back the very last petal. The World Flower burst into bloom, and the whole island filled with sounds, words and stories once more. The end!" },
      { id: "q", kind: "question", scene: "bloom", text: "What made the Baron happy?", options: [{ img: "item_scroll", label: "a story", correct: true }, { img: "pic_rain", label: "rain" }, { img: "pic_boat", label: "a boat" }] },
    ],
  },
];
