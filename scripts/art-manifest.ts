// Every generated image in the game. `cut` = remove background to transparent sprite.
import { WORDS } from "../src/content/phonics";
import { LIVING_WORDS } from "../src/content/living";

export const STYLE =
  "Art style: premium hand-painted 2D children's video game art. Bold, clean, confident dark-brown ink outlines of even weight, rich saturated cel-shaded colours with soft painterly texture, warm rim light, big readable silhouettes, expressive friendly faces, charming and slightly cheeky, high production value like a top-tier mobile adventure game. Not photorealistic, no 3D render look. Absolutely no text, no letters, no numbers, no watermark, no signature, no border.";

const SPRITE = "A single full-body character, centred, on a plain flat pure white background, no ground, no shadow, no scenery, nothing else in the image.";
const SCENE = "Wide landscape game background painting, no characters, no people, no animals, no text.";

export interface ArtJob {
  id: string;
  prompt: string;
  aspect?: string;
  cut?: boolean;
  refs?: string[]; // ids of other art jobs used as reference images
  model?: string;
  /** output width in px for webp */
  w: number;
  /** word pictures: the card's colour, when the picture needs a particular one (read by scripts/gen-pic-plates.py) */
  plate?: string;
}

const HERO_KAI = "SUPER NINJA KAI: a brave, cheerful 6-year-old child ninja with warm brown skin and a messy black top-knot, deep indigo ninja outfit with golden trim, a bright red headband with long fluttering tails, golden sash, white wrapped hands and feet, big bright eyes and a huge confident grin. Chibi proportions (big head, small body).";
const HERO_SUKI = "SUPER NINJA SUKI: a brave, cheerful 6-year-old child ninja girl with light skin, freckles and two bouncy auburn bunches, teal ninja outfit with coral-pink trim, a coral-pink headband with long fluttering tails, golden sash, white wrapped hands and feet, big bright eyes and a huge confident grin. Chibi proportions (big head, small body).";
const SENSEI = "SENSEI MAPLE: a wise, kind and funny old GRANDMOTHER red panda ninja master (clearly female, like a beloved grandma). Soft white fluffy cheek fur and white eyebrows, absolutely NO beard, NO moustache, NO chin tuft. Her silvery-white head-fur is swept up into a neat little bun on top of her head held by a wooden hair stick with a tiny pink blossom flower, round wire spectacles on her nose, gentle long eyelashes, rosy cheeks, a warm twinkly smile. She wears a flowing moss-green robe with a darker green sash and carries a little bamboo walking staff; big fluffy striped red-and-cream tail. Chibi-ish proportions (about 2.5 heads tall, big head, big kind eyes).";
const BARON = "BARON MUDDLE, the villain: a menacing, sneering shadow-sorcerer toad with dark charcoal-green warty skin, glowing red eyes with slit pupils, a wide sharp-toothed evil grin, a jagged black iron crown with a glowing purple gem, a huge high-collared black and crimson cloak with torn spiky edges, clawed hands crackling with swirling purple muddle-magic, and a dark tattered war fan. Clearly the evil villain of the story (think Bowser or Jafar), dramatic and intimidating but still a cartoon suitable for 5-year-olds, not gory or horrifying. Dark palette of black, crimson and toxic purple."

const heroPoses: [string, string][] = [
  ["idle", "standing in a heroic ready stance, three-quarter view facing right"],
  ["run", "running fast to the right, mid-stride, body leaning forward, headband tails streaming behind, side view facing right"],
  ["jump", "leaping high in the air to the right with knees tucked, arms up, joyful, side view facing right"],
  ["throw", "throwing a glowing shuriken star forward to the right with a dynamic lunge, side view facing right"],
  ["cast", "casting a magic spell with both palms pushed forward to the right, glowing golden energy swirling at the hands, side view facing right"],
  ["hurt", "knocked back, dizzy and surprised with swirly eyes, comic, not hurt, facing right"],
  ["cheer", "jumping for joy with both fists in the air, eyes closed with happiness, facing the viewer"],
];

export const MONSTERS: { id: string; desc: string; world: number; boss?: boolean }[] = [
  { id: "gloop", world: 1, desc: "a funny grumpy purple jelly blob monster with one big eye and tiny horns" },
  { id: "bamboo_bandit", world: 1, desc: "a cheeky raccoon-like bandit monster in a bamboo-leaf mask carrying a sack", boss: false },
  { id: "boss_panda", world: 1, desc: "BOSS: a huge grumpy sumo panda monster with a purple muddle-swirl painted on its belly, arms crossed", boss: true },
  { id: "crabble", world: 2, desc: "a snappy little orange crab monster with googly eyes on stalks and big pincers" },
  { id: "petal_imp", world: 2, desc: "a mischievous pink flying imp monster with bat wings made of cherry petals" },
  { id: "boss_oni", world: 2, desc: "BOSS: a big goofy red oni ogre with one horn, wild white hair and a spiky wooden club, pulling a silly face", boss: true },
  { id: "snow_puff", world: 3, desc: "a round fluffy white snow monster with icy blue cheeks and tiny tusks" },
  { id: "rock_golem", world: 3, desc: "a small chunky grey rock golem monster with mossy shoulders and glowing blue eyes" },
  { id: "boss_yeti", world: 3, desc: "BOSS: a giant shaggy blue-white yeti monster roaring with icicles on its fur, big but lovable", boss: true },
  { id: "kappa", world: 4, desc: "a silly green river frog-kappa monster with a lily-pad hat and a big wide mouth" },
  { id: "puffer", world: 4, desc: "a spiky yellow pufferfish monster, puffed up and cross" },
  { id: "boss_serpent", world: 4, desc: "BOSS: a long coiling turquoise river dragon serpent with golden whiskers and big goofy eyes", boss: true },
  { id: "lantern_ghost", world: 5, desc: "a floating paper-lantern ghost monster with a mischievous grin and a wispy tail" },
  { id: "shadow_bat", world: 5, desc: "a small purple shadow bat monster with huge ears and sparkly eyes" },
  { id: "boss_knight", world: 5, desc: "BOSS: a big hollow suit of dark purple samurai armour monster with glowing yellow eyes inside the helmet and a muddle-swirl crest", boss: true },
  { id: "cloud_sprite", world: 6, desc: "a small grumpy storm-cloud monster with little lightning bolt arms" },
  { id: "thunder_drum", world: 6, desc: "a floating taiko-drum monster with angry eyebrows and drumstick arms" },
  { id: "gem_guardian", world: 0, desc: "the GEM GUARDIAN: a friendly-but-proud crystal lion-dog guardian (like a Japanese komainu statue) made of glowing faceted pink and teal gemstones, with a curly crystal mane, sitting up tall and alert, sparkles" },
  { id: "boss_baron", world: 6, desc: "BOSS: " + BARON + " Standing tall, fan raised, laughing villainously", boss: true },
];

export const WORLDS = [
  { id: 1, key: "bamboo", name: "Bamboo Village", scene: "a lush green bamboo forest village with paper lanterns, wooden huts on stilts and a winding stone path, bright sunny morning" },
  { id: 2, key: "blossom", name: "Blossom Hills", scene: "rolling hills covered in pink cherry-blossom trees with a red pagoda on a hilltop, petals drifting, soft spring afternoon" },
  { id: 3, key: "mountain", name: "Misty Mountains", scene: "snowy mountain peaks with waterfalls, pine trees, rope bridges and mist, crisp blue sky" },
  { id: 4, key: "river", name: "Dragon River", scene: "a wide turquoise river with arching red bridges, lily pads, koi fish, stepping stones and willow trees, golden late afternoon" },
  { id: 5, key: "castle", name: "Shadow Castle", scene: "a spooky-but-cute purple castle at dusk with glowing lanterns, twisty towers and fireflies, magical twilight" },
  { id: 6, key: "sky", name: "Sky Temple", scene: "a golden temple floating on fluffy clouds high in the sky with rainbow light, floating islands and gentle sunbeams" },
];

export const ART: ArtJob[] = [];

// Characters
for (const [key, desc] of [["kai", HERO_KAI], ["suki", HERO_SUKI]] as const) {
  ART.push({ id: `hero_${key}_idle`, w: 640, cut: true, prompt: `${SPRITE} ${desc} ${heroPoses[0][1]}. ${STYLE}` });
  for (const [pose, how] of heroPoses.slice(1)) {
    ART.push({
      id: `hero_${key}_${pose}`, w: 640, cut: true, refs: [`hero_${key}_idle`],
      prompt: `Using the attached image as the exact character reference (same character, same outfit, same colours, same face, same art style and line weight), draw this character ${how}. ${SPRITE} ${STYLE}`,
    });
  }
}
ART.push({ id: "sensei_idle", w: 640, cut: true, prompt: `${SPRITE} ${SENSEI} Standing warmly, leaning on ONE single bamboo walking staff held in her right paw (only one staff, her other paw resting on her tummy), smiling, facing the viewer, three-quarter view. ${STYLE}` });
ART.push({ id: "sensei_talk", w: 640, cut: true, refs: ["sensei_idle"], prompt: `Using the attached image as the exact character reference, draw the same grandmother red panda sensei (female, hair bun with hair stick and flower, round spectacles, white cheek fur, NO beard) explaining something, one paw raised with a finger up, mouth open mid-sentence, friendly. ${SPRITE} ${STYLE}` });
ART.push({ id: "sensei_cheer", w: 640, cut: true, refs: ["sensei_idle"], prompt: `Using the attached image as the exact character reference, draw the same grandmother red panda sensei (female, hair bun with hair stick and flower, round spectacles, white cheek fur, NO beard) cheering with delight, staff raised high, tail swishing, eyes closed with a huge smile. ${SPRITE} ${STYLE}` });
ART.push({ id: "baron_idle", w: 720, cut: true, prompt: `${SPRITE} ${BARON} Looming menacingly with an evil grin, one claw raised crackling with purple magic, facing left. ${STYLE}` });
ART.push({ id: "baron_angry", w: 720, cut: true, refs: ["baron_idle"], prompt: `Using the attached image as the exact character reference, draw the same villain furious and roaring, eyes blazing red, purple lightning crackling around him, cloak billowing. ${SPRITE} ${STYLE}` });
ART.push({ id: "baron_defeated", w: 720, cut: true, refs: ["baron_idle"], prompt: `Using the attached image as the exact character reference, draw the same villain defeated: slumped on the floor, crown askew, the red glow gone from his eyes, fan broken, looking sheepish and a little sorry. ${SPRITE} ${STYLE}` });

for (const m of MONSTERS) {
  ART.push({ id: `mon_${m.id}`, w: m.boss ? 720 : 480, cut: true, prompt: `${SPRITE.replace("character", "creature")} A monster for a kids' ninja adventure game, funny not scary: ${m.desc}. Facing left, in a battle-ready pose. ${STYLE}` });
}

for (const w of WORLDS) {
  ART.push({ id: `bg_${w.key}`, w: 1920, aspect: "16:9", prompt: `${SCENE} ${w.scene}. Composed as a battle arena backdrop: open flat ground across the lower third where characters can stand, interesting detail in the upper two thirds. ${STYLE}` });
  ART.push({ id: `run_${w.key}`, w: 2400, aspect: "21:9", prompt: `${SCENE} ${w.scene}. A side-scrolling platformer game background (far layer only): horizon and scenery, sky in the upper half, NO foreground ground or platforms in the bottom fifth (keep the bottom fifth as soft distant scenery). Edges should be similar on the left and right so it can tile. ${STYLE}` });
}
ART.push({ id: "worldmap", w: 1600, aspect: "9:16", prompt: `A tall illustrated fantasy adventure map of a magical island seen from above at a slight angle, like a treasure map painted as a game level-select screen. A winding dotted stone path climbs from the bottom to the top through six regions in order: at the bottom ${WORLDS[0].scene}; then ${WORLDS[1].scene}; then ${WORLDS[2].scene}; then ${WORLDS[3].scene}; then ${WORLDS[4].scene}; and at the very top ${WORLDS[5].scene}. Rich detail, cosy and magical. No characters, no text, no labels. ${STYLE}` });
// The World Flower: the heart of the island, 44 glassy teardrop petals (one per sound) in the school chart's colours round a
// golden centre. Its design, model sheet and the recipes for these jobs (with the model sheet as refs) are in
// assets-src/world-flower/ (rounds.ts, model_sheet.png); the prompts here are summaries for regeneration.
const WORLD_FLOWER = "THE WORLD FLOWER: a gigantic magical flower whose bloom is two rings of separate glowing glassy teardrop-shaped petals (round outer tips, pointed at the centre), every petal a different colour in rainbow order, around a glowing domed golden centre with a thin golden halo, on an S-curved jade-green stem with big curling leaves veined with glowing gold and ancient roots gripping a mossy rock. Never a tree.";
ART.push({ id: "title_bg", w: 1920, aspect: "16:9", prompt: `Epic cinematic title screen background for a kids' ninja adventure game, at sunrise: ${WORLD_FLOWER} It towers on a grassy cliff top on the right, its bloom high in the upper right; Baron Muddle's storm has torn many of its petals away (the missing ones are faint pale outlines) and a long glowing ribbon of rainbow teardrop petals streams off it across the sky to the left, over a valley of bamboo forests, a pagoda and misty mountains. Dark storm clouds linger at the top right. Leave the left third calmer for a logo. No characters, no text. ${STYLE}` });
ART.push({ id: "world_flower_stem", w: 900, cut: true, prompt: `${WORLD_FLOWER} Draw the plant with the WHOLE BLOOM REMOVED: the stem ends at the top in a small round green cup (a calyx) facing the viewer, where the bloom sits (the game draws the bloom on top). Plain flat pure white background, nothing else. ${STYLE}` });
ART.push({ id: "world_flower_bg", w: 1920, aspect: "16:9", prompt: `${SCENE} The grassy hilltop at the heart of the Island of Sounds at a soft golden dawn: an open green hilltop with wildflowers across the bottom third and an empty patch of grass in the middle (the World Flower is drawn on top in game); far below, misty bamboo forest, pink blossom hills with a pagoda, snowy mountains, a turquoise river and a golden temple on a cloud; a big calm peach and gold sky with swirl clouds. ${STYLE}` });
ART.push({ id: "dojo_bg", w: 1920, aspect: "16:9", prompt: `${SCENE} The inside of a warm, cosy wooden ninja training dojo with tatami mats, paper screen doors open to a garden with a cherry tree, hanging scrolls with ink paintings of mountains (no writing), lanterns, soft golden light. ${STYLE}` });

// Items
const items: [string, string][] = [
  ["shuriken", "a single shiny golden ninja throwing star (shuriken) with a glowing edge"],
  ["petal", "a single magical World Flower petal: a plump glassy teardrop (round top, pointed bottom) glowing with a shimmering iridescent rainbow sheen, bold ink outline, two tiny sparkles"],
  ["scroll", "a single rolled-open blank paper scroll with wooden handles, completely empty parchment, no writing"],
  ["lantern", "a single glowing round red paper lantern with a golden top, blank with no writing"],
  ["heart", "a single cute glossy red heart gem"],
  ["star", "a single chunky glossy golden star"],
  ["chest", "a single wooden treasure chest bursting open with golden light and cherry petals"],
  ["gong", "a single big bronze gong on a red wooden stand"],
  ["crate", "a single wooden crate obstacle with rope bindings"],
  ["spikes", "a small cluster of cartoon bamboo spikes sticking out of the ground, a game obstacle"],
  ["cloud_platform", "a single small fluffy floating cloud platform, flat on top"],
  ["stone_platform", "a single small floating mossy stone platform, flat on top, with grass tufts"],
];
for (const [id, d] of items) ART.push({ id: `item_${id}`, w: 320, cut: true, prompt: `${d}, centred, as a game item sprite on a plain flat pure white background, nothing else. ${STYLE}` });

// Word pictures (see docs/ART_STYLE.md and docs/FIRST_MINUTES.md §11): one object, or one living thing with a face
const CARD =
  "like a board-book picture, with chunky rounded simple shapes and few details, bold even dark-brown ink outlines, rich cel-shaded colour with one soft shade tone, one highlight and a subtle painterly grain, lit from the top-left. Nothing else in the picture. No flags, no text, no letters, no numbers, no scenery, no ground, no shadow. Centred on a plain flat pure white background with a wide empty margin on every side; nothing touches the edge.";
export const PIC_OBJECT = `Super Ninja picture-card style: exactly ONE single object, instantly recognisable to a British 3-year-old, drawn whole in its most typical view and usual colour, ${CARD} The object has no face.`;
export const PIC_LIVING = `Super Ninja picture-card style: exactly ONE single animal or person, instantly recognisable to a British 3-year-old, drawn whole from head to toe (or tail), facing the viewer or in three-quarter front view, never from behind, with a friendly face, two big clear eyes and a smile, ${CARD}`;
/** The picture style for a word: a living thing always gets a face (the image model drew faceless dogs and fish when one
 *  style said "no face unless it is an animal or person"). */
export const picStyleFor = (w: string) => (LIVING_WORDS.has(w) ? PIC_LIVING : PIC_OBJECT);
/** Card colours chosen by hand (the rest are picked by hue in scripts/gen-pic-plates.py): the moon and stars sit on
 *  the night plate; the others keep neighbours in the first lessons apart (fish and dog on the reading rail, sun and
 *  sunflower, star and starfish). */
export const PLATE: Record<string, string> = { moon: "night", star: "night", night: "night", dog: "lilac", sunflower: "lilac", starfish: "teal" };
/** The older single style, still used for the petal-corner pictures. */
export const PIC_STYLE =
  "Super Ninja picture-card style: exactly ONE single object, instantly recognisable to a 4-year-old, drawn with chunky rounded simple shapes and few details, bold even dark-brown ink outlines, rich cel-shaded colour with one soft shade tone, one highlight and a subtle painterly grain, three-quarter view, lit from the top-left. The object has NO face and NO eyes (unless it is an animal or person). No flags, no union jacks, no patterns of flags, no text, no letters, no numbers, no scenery, no ground, no shadow. Centred on a plain flat pure white background with a generous empty margin all around.";
for (const w of WORDS.filter((w) => w.pic)) {
  ART.push({ id: `pic_${w.text}`, w: 384, cut: true, prompt: `${w.pic}. ${picStyleFor(w.text)}`, plate: PLATE[w.text] });
}

// Story scenes (hero is composited in-game, so leave room on the left)
import { STORIES } from "../src/content/stories";
for (const st of STORIES) {
  for (const [key, desc] of Object.entries(st.scenes)) {
    ART.push({
      id: `story_${st.id}_${key}`, w: 1600, aspect: "16:9",
      prompt: `A storybook illustration for a children's ninja adventure game: ${desc}. Do not draw any ninja or child in the picture. Keep the characters' designs simple, cute and chunky with big eyes. ${STYLE}`,
    });
  }
}

// World Flower petal pictures (the little corner picture on each petal, like the school's sheet)
import { CHART_PETALS } from "../src/content/flower";
for (const c of CHART_PETALS) {
  ART.push({ id: `petal_${c.p}`, w: 256, cut: true, model: "gemini-3.1-flash-image", prompt: `${c.icon}. ${PIC_STYLE}` });
}

// Listening-game pictures (spoken only, never written)
import { ORAL_WORDS } from "../src/content/phonics";
for (const [w, o] of Object.entries(ORAL_WORDS)) ART.push({ id: `pic_${w}`, w: 384, cut: true, prompt: `${o.pic}. ${picStyleFor(w)}`, plate: PLATE[w] });
