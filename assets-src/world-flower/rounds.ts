// Prompts for each World Flower design round (see gen.ts). Kept as a record of how the design was reached.
import { STYLE } from "../../scripts/img";

const WF = "assets-src/world-flower/";
const WHEEL = WF + "ref_petal_wheel.png";
const STYLE_REFS = ["assets-src/cut/sensei_idle.png", "assets-src/art/bg_blossom.png"];

export const CORE =
  "THE WORLD FLOWER: a huge, mythical, magical flower, the most gorgeous thing on the Island of Sounds, the flower that all life on the island needs. " +
  "It is built from many separate, clearly distinct TEARDROP-SHAPED PETALS: each petal is rounded at its outer tip and narrows to a point where it meets the centre, and each has its own bold dark-brown ink outline. " +
  "Every petal is a different bright colour, so the whole flower is a glowing rainbow (scarlet, coral, pink, magenta, orange, amber, gold, lemon, lime, leaf green, forest green, teal, sky blue, royal blue, indigo, violet, lilac, plum, with one or two deep bronze-brown petals). " +
  "The petals radiate from a glowing golden heart. The flower pours out warm magical light. It must read instantly as 'a rainbow flower made of teardrop petals' even as a tiny thumbnail.";

const GUIDE =
  "The FIRST attached image is only a colour and structure guide for the petals (teardrop petals in two rings, sorted into a rainbow, around a golden heart): paint it as a real, living, magical flower with depth, light and texture, never as a flat diagram. " +
  "The other attached images are only style references for the painting technique (ink outlines, cel shading, painterly grain); do not draw their characters or scenery.";

const SHEET = "Concept art for the game's central magical object: the flower alone, centred, fully in frame with generous margins, on a plain warm cream paper background (#f7eedd) with only a soft glow behind it. No characters, no animals, no people, no text, no labels.";

export interface Job { id: string; prompt: string; refs: string[]; aspect?: string; size?: string }
const r1 = (id: string, idea: string, refs = [WHEEL, ...STYLE_REFS]): Job => ({ id, refs, prompt: `${CORE}\n\nDESIGN IDEA: ${idea}\n\n${GUIDE}\n\n${SHEET}\n\n${STYLE}` });

const NO_HEART = "The golden centre is ROUND (a disc or orb), never a heart shape, and there are no heart symbols anywhere. Every petal tip is ROUNDED, never pointed, and the petals never merge into one another.";
const r2 = (id: string, idea: string, refs: string[]): Job => ({
  id, refs: [...refs, ...STYLE_REFS],
  prompt: `${CORE}\n\nDESIGN: ${idea}\n\n${NO_HEART}\n\nThe first attached images are earlier concepts for this flower: keep their best qualities (clear separate teardrop petals, rainbow order, radiance) but paint a new, more beautiful and more magical version. The last two attached images are only style references for the painting technique; do not draw their characters or scenery.\n\n${SHEET}\n\n${STYLE}`,
});

const HEAD =
  "THE BLOOM: exactly two rings of separate petals: 20 smaller petals in the inner ring and 24 larger petals in the outer ring, each outer petal peeking out between two inner ones, so every single petal is clearly visible and countable. " +
  "Every petal is a plump TEARDROP like a raindrop: wide and perfectly round at its outer tip, tapering smoothly to a narrow point where it meets the centre (the exact shape in the petal guide image). " +
  "Each petal is translucent and glows from inside like coloured glass held up to the sun: richer colour at the rim, a bright soft highlight, two or three fine veins, and a bold dark-brown ink outline. The colours run round the flower in rainbow order like the guide, with a few deep jewel tones (indigo, plum, forest green, bronze). " +
  "The centre is a glowing domed golden disc ringed by tiny golden stamens. MYTHICAL RADIANCE: behind the bloom, a crown of soft golden light rays fans out and a thin glowing halo ring circles it; tiny motes of coloured light drift up from the petals like pollen.";
const r3 = (id: string, idea: string, extra: string[] = []): Job => ({
  id, size: "2K", refs: [WF + "r2/rosette_2.png", WHEEL, ...extra, ...STYLE_REFS],
  prompt: `${CORE}\n\nDESIGN: ${idea}\n\n${HEAD}\n\n${NO_HEART}\n\nAttached: first an earlier concept (keep its glassy glowing material and rainbow), then the petal guide (keep its two rings of true teardrop petals), ${extra.length ? "then the plant body to keep (stem, leaves, roots, boulder), " : ""}then two images that are only style references for the painting technique (do not draw their characters or scenery). Paint the finished, most beautiful version.\n\n${SHEET}\n\n${STYLE}`,
});

const CHOSEN = WF + "r4/final_2.png";
const st = (id: string, state: string, guide: string): Job => ({
  id, size: "2K", refs: [CHOSEN, guide, ...STYLE_REFS],
  prompt: `The first attached image is THE WORLD FLOWER, the final approved design: a magical plant whose bloom is two rings of separate glassy glowing teardrop petals (one per sound of English) in rainbow order around a glowing domed golden centre, on an S-curved jade stem with big curling leaves and roots gripping a mossy boulder. Paint the SAME plant, same design, same viewpoint, same size in the frame and same painting style, in this story state:\n\n${state}\n\nThe second attached image is the petal guide for this state (coloured teardrops = petals present, grey = petals missing). The last two attached images are only style references for the painting technique; do not draw their characters or scenery.\n\n${NO_HEART}\n\n${id === "stem" ? "" : SHEET + "\n\n"}${STYLE}`,
});

export const ROUNDS: Record<string, Job[]> = {
  r1: [
    r1("sunburst", "A giant bloom facing the viewer like a sunflower, two rings of teardrop petals (about 20 inner, 24 outer), on a thick curving jade-green stem with a few big glossy leaves, rising out of a mossy rock with roots gripping it. The golden heart is a glowing domed disc with a spiral of tiny golden seeds."),
    r1("lotus", "A sacred lotus of light: layers of upright cupped teardrop petals, each a different rainbow colour, opening around a glowing golden heart, floating on a round lily pad on a small glowing pool. Seen from a low three-quarter angle so both the cup shape and the rainbow of petals read clearly."),
    r1("stainedglass", "A stained-glass flower: every teardrop petal is translucent like coloured glass with light shining through it, each outlined in thick dark ink like the leading of a church window, with soft inner veins. Face-on rosette. The golden heart glows like a little sun and throws coloured light rays outwards."),
    r1("jewel", "A jewel flower: every teardrop petal is a smooth polished gemstone cabochon (ruby, sapphire, emerald, topaz, amethyst and so on) with a bright highlight, set around a glowing golden heart like a magical brooch the size of a house. Tiny sparkles float around it. Face-on with a slight tilt."),
    r1("lantern", "A lantern flower: every teardrop petal glows softly from inside like a Japanese paper lantern, each a different rainbow colour, with fine delicate veins. Face-on, slightly tilted up, on a short sturdy stem with two big leaves. The golden heart is a warm glowing orb. Dusk-blue glow around it."),
    r1("kiku", "An imperial chrysanthemum (kiku) mandala: three tightly packed rings of teardrop petals in a perfect radial rainbow, like a sacred Japanese emblem come to life, seen perfectly face-on. The golden heart is a glowing disc with a small swirl. Rays of golden light behind."),
    r1("floating", "A mystical floating flower: the teardrop petals hover in two rings around a glowing golden orb heart, each petal separated by a small gap and joined to the heart only by threads of golden light, gently turning like a halo. It floats above a small mossy stone plinth. Makes it obvious that the petals can come loose."),
    r1("landmark", "A flower as big as a temple, growing from the top of a green hill: a thick twisting stem wrapped in leaves, the rainbow bloom tilted towards the viewer, tiny waterfalls spilling from its lowest leaves. Show the whole plant, including the hilltop it grows from, as a single iconic landmark."),
    r1("starflower", "A radiant star-flower emblem: slender teardrop petals in two layers form a sixteen-point rainbow star, with a halo ring of golden light behind the petals and a crown of tiny golden stamens around the glowing heart. Face-on, symmetrical and iconic, like a legendary treasure."),
    r1("dahlia", "A rainbow dahlia: a big round bloom made of many layered teardrop petals curling slightly outwards, colours flowing around the bloom like a colour wheel, glossy and plump. The golden heart is a tight bud of glowing gold petals. Seen three-quarter face-on, on a stem with two leaves."),
  ],
  // Round 2: refine the three strongest directions from r1 (my pick + Gemini's: stainedglass_1 / floating_2 layout,
  // kiku_2 radiance, sunburst_2 / landmark_2 plant body). No heart-shaped cores.
  r2: [
    r2("rosette", "The flower head alone, seen perfectly face-on, as a radiant rosette: exactly two rings of separate teardrop petals, about 20 smaller ones in the inner ring and 24 larger ones in the outer ring, the outer petals sitting between the inner ones. Each petal is translucent and lit from inside like coloured glass or a boiled sweet held up to the sun, deeper colour at the rim, a soft bright highlight, two or three fine veins, and a bold dark-brown ink outline. The golden centre sits just above the petals: a glowing domed golden disc ringed by tiny golden stamens. A soft halo of golden light and a few floating sparkles surround the whole bloom.", [WF + "r1/stainedglass_1.png", WF + "r1/kiku_2.png", WHEEL]),
    r2("plant", "The whole plant as an iconic landmark: the radiant rosette bloom (two rings of separate glowing teardrop petals around a glowing golden centre) sits on a thick, gently curving jade-green stem, tilted a little towards the viewer so the full rainbow face reads clearly. Two or three huge glossy leaves curl out from the stem, and strong roots grip a mossy boulder at the base. The bloom is large compared to the stem, like a giant sunflower, and is by far the brightest thing in the picture.", [WF + "r1/stainedglass_1.png", WF + "r1/sunburst_2.png", WF + "r1/landmark_2.png", WHEEL]),
    r2("floating", "A mythical floating bloom: exactly two rings of separate teardrop petals, each like a glowing piece of coloured glass with a bold ink outline, hovering around a glowing golden orb centre with tiny golden stamens, each petal joined to the centre by a faint thread of golden light. The bloom floats just above an ancient mossy stone plinth wrapped in green roots and leaves, with a golden halo ring behind it.", [WF + "r1/floating_2.png", WF + "r1/kiku_2.png", WF + "r1/jewel_1.png", WHEEL]),
  ],
  // Round 3: polish. Head = r2 rosette_2 material + the wheel's two rings of true teardrops; body = r2 plant_1.
  r3: [
    r3("head", "The flower head alone, seen perfectly face-on."),
    r3("whole", "The whole plant as the island's great landmark: the bloom sits on a tall, elegant, gently curving jade-green stem, tilted a little towards the viewer so its full rainbow face reads clearly. Three huge glossy leaves curl out from the stem, and ancient roots grip a mossy boulder at the base. The bloom is large compared to the stem, like a giant sunflower, and is by far the brightest thing in the picture.", [WF + "r2/plant_1.png"]),
  ],
  // Round 4: final polish of r3 whole_1 (the chosen design).
  r4: [
    {
      id: "final", size: "2K", refs: [WF + "r3/whole_1.png", WF + "ref_petal_wheel_art.png", ...STYLE_REFS],
      prompt: `Repaint the first attached image (THE WORLD FLOWER, the chosen design) as its final, most gorgeous version. Keep EXACTLY: the two rings of separate glassy glowing teardrop petals (round outer tips, pointed at the centre) in rainbow order, the glowing domed golden centre with its ring of tiny stamens, the thin golden halo ring, the soft golden light rays and the drifting motes of coloured light, the jade-green stem, the big curling leaves, and the roots gripping a mossy boulder. Improve: make the bloom about a third bigger compared to the plant so it dominates; make the stem taller and more elegant with a graceful S-curve; make the leaves more graceful; add a few fine glowing golden veins along the stem and leaves, as if light flows up from the roots into the bloom. The dark near-black petal near the top becomes a rich deep bronze petal (see the petal guide, the second image). Every petal glows from inside like coloured glass held up to the sun, with a bold dark-brown ink outline and a soft highlight. The last two attached images are only style references for the painting technique; do not draw their characters or scenery.\n\n${NO_HEART}\n\n${SHEET}\n\n${STYLE}`,
    },
  ],
  // Model sheet: the chosen design (r4/final_2) in each story state.
  states: [
    st("destroyed", "DESTROYED, after Baron Muddle's storm: EVERY petal has been torn away, not a single coloured petal is left. The bare centre has gone dark: a dull, cold grey-brown disc with its tiny stamens drooping, no glow at all. The stem has bent over so the bare dark core droops down sadly towards the ground, like a wilted sunflower. The leaves hang limp and faded grey-green, the golden veins have gone out, the moss on the boulder is grey. No halo, no light rays, no sparkles; only a couple of wisps of dark purple smoke curl away. The colours of the whole picture are drained and cold. It is heartbreaking but not scary.", WF + "ref_petal_wheel_dark_art.png"),
    st("partial", "PARTLY REGROWN, halfway through the adventure: only about nine petals are back in place (a red one, a coral one, an orange one, a yellow one, a pink one, two blue ones, a green one and a teal one, scattered around both rings as in the guide image), each glowing brightly in its own colour. Every other petal place is empty, shown only as a faint pale ghostly teardrop outline where a petal will grow back. The golden centre glows softly again. The stem is lifting back upright, the leaves are green again, a faint halo ring flickers back and a few motes of coloured light drift up. Hopeful.", WF + "ref_petal_wheel_partial_art.png"),
    st("restored", "FULLY RESTORED, the grand finale: every single petal is back, all glowing even more brightly than before, the full rainbow blazing. A great burst of golden and rainbow light pours out from the centre, the halo ring shines bright, big rays of light fan out, and sparkles and coloured motes of light swirl all around the bloom in a joyful spiral. The stem stands tall and proud, the leaves are lush and the golden veins glow. Triumphant and glorious.", WF + "ref_petal_wheel_art.png"),
    st("stem", "The same plant with the WHOLE BLOOM REMOVED (no petals, no golden centre, no halo, no rays, no sparkles): the elegant S-curved jade-green stem ends at the top in a small neat round green cup (a calyx) facing the viewer, where the bloom would sit. Keep the big curling leaves with their glowing golden veins, the roots and the mossy boulder exactly as they are. Plain flat pure white background (not cream), nothing else in the picture, so it can be cut out as a game sprite.", WF + "ref_petal_wheel_art.png"),
  ],
  // In-game backdrop for the World Flower screen (the flower itself is drawn in SVG on top, with the stem sprite).
  bg: [
    { id: "flower_bg", size: "2K", aspect: "16:9", refs: ["assets-src/intro-v3/shot2_frame.png", "assets-src/art/bg_blossom.png"], prompt: `Wide landscape game background painting, no characters, no people, no animals, no text. The grassy hilltop at the heart of the Island of Sounds at a soft golden dawn, seen from the side: a gentle open green hilltop with a few wildflowers fills the bottom third, and in the centre of the hilltop there is an EMPTY open patch of grass (nothing growing there: no flower, no tree, no plant, no rock). Behind and below, far away, the island's lands in soft misty colours: bamboo forest, pink blossom hills with a tiny pagoda, snowy mountains, a winding turquoise river, a golden temple on a cloud. A big soft sky of warm peach, gold and pale blue with gentle swirl clouds fills the top two thirds, calm and uncluttered so a big glowing flower can be placed in the middle. Use the first image only for the hilltop's colours and painting style; do not copy its flower or characters. ${STYLE}` },
  ],
};
