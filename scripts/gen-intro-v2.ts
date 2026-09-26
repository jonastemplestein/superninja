// Intro film (v3, the World Flower): start frames (gemini-3-pro-image) + Gemini Omni 1.1 Flash image-to-video takes.
// Usage:
//   bun scripts/gen-intro-v2.ts refs   [id ...]        -> assets-src/intro-v2/refs/<id>.png (on-style villager sprites used as frame refs)
//   bun scripts/gen-intro-v2.ts frames [n ...] [--v=k] -> assets-src/intro-v3/shotN_frame[_k].png (candidates; the chosen one is copied to shotN_frame.png)
//   bun scripts/gen-intro-v2.ts video  [n ...] [--take=k] -> assets-src/intro-v3/shotN_takeK.mp4 (Omni, 1080p, with audio;
//                                                            the take's length follows the [mm:ss] timestamps in the prompt)
//   bun scripts/gen-intro-v2.ts finale [--take=k]      -> assets-src/intro-v3/finale_takeK.mp4 (the World Flower blooms again;
//                                                            first frame finale_frame.png, last frame finale_last.png = the story_s6_bloom art)
// Run under: doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-intro-v2.ts ...
// See docs/INTRO_STORYBOARD.md for the shot list. The chosen take per shot is copied to shotN_raw.mp4, and
// scripts/intro-v2-encode.sh cuts and encodes the film. Omni takes drift off-model after about 4 s, so every
// motion prompt front-loads its key action.
import { mkdirSync, existsSync } from "node:fs";
import { makeImage, STYLE } from "./img";
import { genOmni } from "./trailer/providers";

const DIR = "assets-src/intro-v3";
mkdirSync(DIR, { recursive: true });

const SENSEI = "Sensei Maple: a wise, kind old GRANDMOTHER red panda ninja master (female), silvery-white fur swept up into a neat bun on top of her head held by a wooden hair stick with a tiny pink blossom, round wire spectacles, white eyebrows and soft white cheek fur, NO beard and NO moustache, long moss-green robe with a green sash, striped bushy tail, holding ONE bamboo staff (exactly like the red panda reference image)";
const BARON = "Baron Muddle: a dark charcoal-green toad sorcerer with glowing red eyes, a jagged black iron crown with a purple gem, torn black-and-crimson cloak, clawed hands crackling with purple magic, holding a dark tattered war fan (exactly like the toad reference image)";
const KAI = "Kai: a small boy ninja with spiky black hair in a top knot, a long red headband with flowing tails, navy-purple ninja gi with a gold sash, bandaged wrists and feet (exactly like the boy reference)";
const SUKI = "Suki: a small girl ninja with two big auburn hair buns, a pink headband with flowing tails, freckles, teal trousers, cream-and-pink top with a gold sash (exactly like the girl reference)";
const FLOWER = "THE WORLD FLOWER (exactly like the World Flower reference image): a gigantic magical flower as tall as a temple, growing from a mossy crag at the very heart of the island. Its huge bloom is two rings of separate glassy TEARDROP-shaped petals (round outer tips, pointed where they meet the centre), every petal a different glowing colour in rainbow order, around a glowing domed golden centre, with a thin golden halo ring and soft rays of light. It has an S-curved jade-green stem with big curling leaves veined with glowing gold, and ancient roots gripping the rock. It is NOT a tree and there is no cherry-blossom tree anywhere near it";
const FLOWER_DARK = "THE WORLD FLOWER in its DESTROYED state (exactly like the destroyed World Flower reference image): the same gigantic flower plant as tall as a temple, but every single petal is gone; its bare round centre is a dull dark grey-brown with drooping stamens, hanging down sadly on its bent stem; the big leaves hang limp and grey; no glow, no halo, no light at all. It is NOT a tree";
const FRAME = `${STYLE} Cinematic widescreen 16:9 film still for an animated children's cutscene. Clear staging, one strong focal point, uncluttered. Characters must match the reference sprites exactly (same colours, costume, proportions, chibi ~2.5 heads tall). No text anywhere.`;
const MOTION = "Hand-painted 2D cartoon animation in exactly the same illustrated style as the image: bold dark-brown ink outlines, rich cel-shaded colours, painterly texture. Keep every character exactly on-model for the whole shot. One continuous shot: no cuts, no fades, no flashes to white. No text, no captions, no subtitles. No speech, no dialogue, no talking voices: only music and sound effects. Family friendly for young children.";
const HUGE = "SCALE: the World Flower is ENORMOUS, a landmark as tall as a temple. It stands in the background behind the characters and towers far above them; its glowing bloom alone is many times wider than Sensei is tall and fills the upper part of the sky. The characters stand in the foreground, at a normal readable size.";
const SENSEI_LOOKS = "Sensei Maple's eyes stay on the action the whole time: she never looks away, never turns her back and never closes her eyes; her round spectacles, silver bun and hair stick stay on.";

const A = "assets-src/art/", C = "assets-src/cut/", R = "assets-src/intro-v2/refs/", V2 = "assets-src/intro-v2/";
const WF = "assets-src/world-flower/world_flower_glorious.png", WF_DARK = "assets-src/world-flower/world_flower_destroyed.png";
mkdirSync(R, { recursive: true });

// Villager sprites in the game's own style, so the film's islanders match the heroes and monsters.
const REF_STYLE = `A single full-body character, centred, on a plain flat pure white background, no ground, no scenery. Draw it in EXACTLY the same art style as the attached reference sprites (the game's heroes, Sensei and monsters): premium hand-painted 2D children's game art, bold clean dark-brown ink outlines of even weight, rich cel shading with one shade tone and one highlight, soft painterly grain, chibi proportions about 2.5 heads tall with a big head and big expressive eyes, chunky rounded silhouette. Not a plush toy, not 3D, not photoreal, no text. ${STYLE}`;
const STYLE_REFS = [C + "hero_kai_idle.png", C + "sensei_idle.png", C + "mon_boss_panda.png"];
const VILLAGERS: Record<string, string> = {
  panda: "A friendly grown-up giant panda villager (black-and-white panda, round ears, black eye patches) wearing a simple short indigo-blue work jacket tied with a rope belt, standing, gentle smile, holding nothing.",
  panda_kid: "A small cute giant panda child villager (black-and-white panda cub, round ears, black eye patches) wearing a little red vest, standing, big happy eyes.",
  fox: "A small cheerful red fox child villager with a fluffy white-tipped tail, wearing a little mustard-yellow tunic, holding a rolled paper scroll.",
  owl: "A round wise owl villager with brown and cream feathers and big amber eyes, wearing a little plum-coloured robe.",
  rabbit: "A small sweet white rabbit villager with long floppy-tipped ears and pink nose, wearing a little sky-blue kimono jacket, standing, shy smile.",
  tanuki: "A plump friendly tanuki (Japanese raccoon dog) villager with a dark eye mask and a round belly, wearing a little straw hat and an orange apron, standing, cheerful.",
};
// Sensei pose sprites facing RIGHT, so frames show her looking at the action instead of at the camera
// (the idle sprite faces the viewer, and frames made from it alone copy that pose).
const P = `${DIR}/refs/`;
mkdirSync(P, { recursive: true });
const PROFILE = "STRICT SIDE PROFILE facing RIGHT: her nose and muzzle point at the right edge of the picture, only her right-hand side is visible, we see only ONE eye (her far eye is hidden), her spectacles are seen from the side, and she does NOT look at the viewer";
const POSES: Record<string, string> = {
  sensei_brave: `standing firm, ${PROFILE}. Feet apart and braced, both paws gripping her bamboo staff planted in the ground in front of her, a fierce, brave, determined frown, glaring straight ahead to the right; her robe and striped tail are blown out behind her to the left by a strong wind`,
  sensei_back: "seen in REAR three-quarter view from behind her left shoulder: we see her back, her silver bun with the hair stick, her striped tail and the back of her green robe, and her head is turned away from us towards the right so we only glimpse her cheek and the side of her spectacles; she stands firm, gripping her bamboo staff planted beside her, facing into the picture towards the right",
  sensei_wonder: `${PROFILE}. Her head is tilted back, gazing UP towards the upper right at something wonderful with a warm, delighted, open-mouthed smile; one paw is raised pointing up and to the right, the other holds her bamboo staff`,
  sensei_point: `${PROFILE}. She proudly points her bamboo staff forward and out to the right, looking along it to the right with a proud, encouraging smile`,
};
const SENSEI_POSE = (k: string) => P + k + ".png";
const VILLAGER_REFS = ["panda", "panda_kid", "fox", "owl", "rabbit"].map((k) => R + k + ".png");
const VILLAGER_NOTE = "The islanders (pandas, foxes, owls, rabbits and the rest) must look exactly like the attached villager reference sprites: same chibi proportions, bold dark-brown ink outlines and cel shading as the heroes and Sensei, not soft plush-toy or realistic style.";

type Shot = { n: number; refs: string[]; frame: string; motion: string };
export const SHOTS: Shot[] = [
  {
    n: 1,
    refs: [V2 + "shot1_frame.png", WF, A + "worldmap.png", R + "panda.png", R + "fox.png"],
    frame: `Establishing aerial view of the Island of Sounds, a round green fantasy island in a sparkling turquoise sea at golden sunrise, seen from high up at a three-quarter angle (lay the lands out like the first reference image). Around the island: bottom-left a bamboo village with lantern huts, left soft pink blossom hills with a red pagoda, back-left misty snowy mountains with a waterfall, a winding turquoise river with red bridges flowing to the sea, back-right a purple fairy-tale castle, and top-right a golden temple floating on clouds. At the VERY CENTRE of the island, on a green hill, towers ${FLOWER}. It is by far the biggest and brightest thing in the picture: soft rainbow-coloured light pours from it across every land, and crowds of tiny islanders (like the villager reference sprites) are gathered happily on the hill around its roots. Peaceful, magical, inviting.`,
    motion: "One continuous shot. [00:00-00:05] A slow, smooth camera push-in from high above the island towards the giant glowing rainbow World Flower at its centre, which grows larger in frame and stays centred. The flower's teardrop petals shimmer and its golden centre pulses softly with warm light; soft waves of rainbow light ripple out from it across the lands. Smoke curls from the village huts, the waterfall flows, the river glitters, birds fly past, the tiny islanders on the hill wave. Every land stays solid and in place; nothing morphs. Gentle wind chimes, soft flute and harp music, birdsong.",
  },
  {
    n: 2,
    refs: [WF, SENSEI_POSE("sensei_wonder"), ...VILLAGER_REFS],
    frame: `A warm, happy morning on the hilltop at the foot of ${FLOWER}. The flower rises on the RIGHT half of the picture and its glowing rainbow bloom fills the top right, tilted down towards the crowd, pouring warm golden light over them. At its roots, a big happy crowd of islanders sits and stands on the grass (like the villager reference sprites): two pandas share an open picture book, a panda child points up at the flower, a fox child holds a scroll, an owl and a rabbit sing together, more islanders chat and smile in the background. In the LEFT foreground, ${SENSEI} stands in side profile facing RIGHT (exactly like the pose reference), gazing UP at the flower with a delighted smile and one paw raised towards it; she is looking at the flower, not at the viewer. Blue sky, golden light, cosy and joyful. ${HUGE}`,
    motion: `One continuous shot, gentle slow push-in towards the crowd that keeps Sensei and the flower in frame. [00:00-00:01.5] Sensei Maple gazes up at the glowing World Flower with a delighted smile, her paw raised towards it. [00:01.5-00:03] One of the flower's teardrop petals glows brighter and a ribbon of sparkling coloured light floats down from it in a gentle curve to the pandas' open picture book. [00:03-00:04.5] The book's pages light up with golden sparkles and little painted pictures; the pandas and the fox gasp and laugh. [00:04.5-00:06] The owl and the rabbit sing, the islanders sway happily and look up at the flower, and Sensei nods happily, still gazing at the flower. ${SENSEI_LOOKS} Birdsong, soft happy music, a magical chime, happy giggles.`,
  },
  {
    n: 3,
    refs: [WF, C + "baron_idle.png", SENSEI_POSE("sensei_brave"), R + "panda_kid.png", R + "fox.png", R + "rabbit.png"],
    frame: `The same hilltop, but Baron Muddle's storm has rolled in: the sky has turned dark purple with swirling storm clouds and one crack of lightning. CENTRE background: ${FLOWER}, still whole, every glowing petal in place, its light dimmed by the storm. RIGHT: ${BARON}, who has just landed on a swirl of purple storm cloud in front of the flower; he is bigger than Sensei, leaning forward, pointing a claw up at the flower and sneering. LEFT: ${SENSEI} has stepped forward to face him, in strict side profile facing RIGHT (exactly like the brave pose reference), braced with both paws on her staff, frowning, glaring straight at Baron; she is NOT looking at the viewer. Behind her, a crowd of frightened islanders (panda children, foxes, rabbits, owls) huddle together and peek out from behind her robe. Sensei and Baron clearly face each other across the frame, the flower towering between and behind them. Menacing but child-friendly. ${HUGE}`,
    motion: `One continuous shot, slow push-in keeping both characters and the flower in frame. [00:00-00:01.5] Baron Muddle stomps forward twice towards Sensei Maple, purple smoke puffing at his feet, jabbing his claw at the glowing flower; each stomp lands with a heavy thud. [00:01.5-00:02] A big bolt of lightning cracks across the purple sky behind the flower, with a loud thunder crack at the same moment. [00:02-00:03.5] Baron clenches his claw into a fist with a small purple flame in it and snarls at the flower. [00:03.5-00:04.5] He throws his head back and roars; the islanders behind Sensei duck and hug each other. Sensei Maple stays in side view facing Baron the whole time, frowning, her staff planted, never stepping back. Only Baron's eyes glow red. ${SENSEI_LOOKS} Deep ominous drums, stomp thuds, thunder exactly with the lightning.`,
  },
  {
    n: 4,
    refs: [WF, C + "baron_angry.png", SENSEI_POSE("sensei_back"), R + "panda_kid.png"],
    frame: `Stormy purple sky on the hilltop, the calm moment BEFORE the attack. RIGHT: ${BARON}, standing on a rock, gloating with a wicked grin, his dark war fan raised high above his head ready to swing, purple lightning crackling around it. CENTRE: ${FLOWER}, completely whole, every glowing rainbow teardrop petal still in place. LEFT FOREGROUND, seen from BEHIND over her shoulder (exactly like the rear-view pose reference): ${SENSEI}, facing into the picture towards Baron and the flower, bracing with her bamboo staff planted in the ground, robe and striped tail blown by the wind; we see her back, her bun and the side of her face as she glares at Baron; two little panda children cling to her robe beside her. All of them stand on one continuous grassy hilltop. ${HUGE}`,
    motion: `One continuous shot. The camera stays still and never orbits or rotates: we see Sensei Maple from behind her shoulder for the whole shot, and she never turns round to face us. [00:00-00:01.5] Baron Muddle winds up, raising his dark war fan high, purple lightning crackling around it. [00:01.5-00:02.5] He sweeps the fan down in one huge arc with a loud WHOOSH and a roaring purple whirlwind blasts into the World Flower. [00:02.5-00:04.5] The glowing rainbow teardrop petals are ripped off the flower one after another and swirl away across the sky in a long spinning rainbow ribbon of petals; the flower's round centre is left bare and grey on its stem (it keeps its round centre, its stem and its leaves). Sensei braces against the wind, holding her staff and shielding the little pandas, still facing Baron and the flower. [00:04.5-00:06.5] Baron throws his head back and laughs, shoulders shaking; Sensei holds her ground and keeps glaring at him. No new characters appear. ${SENSEI_LOOKS} Howling wind, a big whoosh on the fan sweep, thunder, dramatic music.`,
  },
  {
    n: 5,
    refs: [V2 + "shot5_frame.png", WF, A + "worldmap.png"],
    frame: `High aerial view over the whole Island of Sounds under a stormy purple sky, looking out from just above the World Flower's hilltop: at the bottom-left edge of the frame, the World Flower's bloom is being stripped by the wind (glowing rainbow teardrop petals, golden centre). A huge swirling river of rainbow-coloured glowing teardrop petals streams off it and splits into six glowing rainbow ribbons that arc away over the island towards six lands spread out below from left to right: a green bamboo village with lantern huts, pink blossom hills with a pagoda, snowy misty mountains, a turquoise river with red bridges, a purple castle, and a golden temple on clouds. Clear, readable layout: six lands, six ribbons of petals.`,
    motion: "One continuous shot, camera high above the island gliding slowly forward. [00:00-00:01.5] A river of glowing rainbow teardrop petals pours from the World Flower out over the island. [00:01.5-00:03] It bursts apart into six ribbons of coloured petals that fly outwards across the island in low, smooth, curving arcs like shooting stars, one ribbon to each land. [00:03-00:04.5] Each ribbon swoops down and lands in its land with a small sparkle, and the petals hide there. Never vertical beams, never pillars of light: only low arcs that land. Whooshing, twinkling magic sounds, dramatic sweeping music.",
  },
  {
    n: 6,
    refs: [WF_DARK, ...VILLAGER_REFS, R + "tanuki.png"],
    frame: `After the storm: the hilltop under a cold grey-violet sky, all the colour drained out of the world, a light drizzle. CENTRE background: ${FLOWER_DARK}. Filling the foreground and middle ground, a big crowd of sad, frightened islanders cower together on the grey grass (like the villager reference sprites): pandas hugging each other, a little panda child crying into its mum's tummy, foxes with their ears flat and tails wrapped round them, owls hiding their faces behind their wings, rabbits trembling, a tanuki holding its straw hat to its chest, and in front a panda holding an open book whose pages are completely blank and grey. Dozens of islanders, clearly miserable and scared but still cute, never scary.`,
    motion: "One continuous shot. [00:00-00:01.5] The last faint golden glow in the bare centre of the World Flower flickers and fades out to dark grey, and the flower's head sinks a little lower. [00:01.5-00:04] The islanders shiver and huddle closer together; the little panda sobs; an owl peeks out from behind its wings and hides again; the panda with the book turns a blank grey page, finds nothing, and looks up sadly. Gentle slow push-in towards the crowd. Soft rain, a lonely flute, quiet sad music.",
  },
  {
    n: 7,
    refs: [WF_DARK, SENSEI_POSE("sensei_brave"), C + "baron_idle.png"],
    frame: `The hilltop after the storm, the first ray of golden dawn light breaking through the purple clouds. RIGHT background: ${FLOWER_DARK}. UPPER RIGHT, in the sky: ${BARON}, small in the distance, riding away on a swirling purple storm cloud, laughing. LEFT OF CENTRE, in the foreground: ${SENSEI}, standing tall and brave in side profile facing RIGHT (like the brave pose reference), her head tilted up, glaring up at Baron, her staff planted firmly: she is standing up to him and is NOT looking at the viewer. A warm beam of light falls on her. ${HUGE.replace("glowing bloom", "bare dark head")}`,
    motion: `One continuous shot. The World Flower's bare dark round centre stays exactly as it is for the whole shot: no petals appear on it and it does not change shape. [00:00-00:01.5] Sensei Maple stands firm and glares up at Baron Muddle as he flies away laughing on his storm cloud, which shrinks into the distance. [00:01.5-00:02.5] Sensei turns round to face the viewer, looking straight out of the screen, still holding her bamboo staff. [00:02.5-00:04.5] She smiles hopefully and holds out her free paw towards the viewer, as if inviting the child to help; a warm beam of golden sunlight falls on her and one tiny coloured sparkle floats up past her face. Gentle slow push-in to a medium shot that keeps the dark flower visible behind her. Sensei stays exactly on-model: a grandmotherly old red panda lady with a silvery-white bun and hair stick, round wire spectacles, white cheek fur, NO beard. Soft hopeful music swelling into a heroic note.`,
  },
  {
    n: 8,
    refs: [WF_DARK, C + "hero_kai_idle.png", C + "hero_suki_idle.png", SENSEI_POSE("sensei_point")],
    frame: `Heroic reveal on the hilltop at golden dawn. CENTRE: ${KAI} and ${SUKI} have just landed side by side in bold ninja fighting stances, golden magic swirling around their hands, headband tails whipping in the wind, determined grins, a burst of golden light behind them. LEFT: ${SENSEI}, in side profile facing RIGHT towards the ninjas (like the pointing pose reference), smiling proudly at them and pointing her staff out across the island; she looks at the ninjas, not at the viewer. Kai and Suki are small chibi children exactly like their reference sprites (big heads, about 2.5 heads tall), no taller than Sensei. Behind them: ${FLOWER_DARK}, but with one tiny spark of golden light glinting in its dark centre. The island stretches out below in the morning light. ${HUGE.replace("glowing bloom", "bare dark head")}`,
    motion: `One continuous shot, slow heroic push-in. The World Flower behind them stays bare and dark for the whole shot, with only a tiny golden spark glinting in its round centre: no petals grow, it does not bloom, it does not change shape, and there is no big flash. [00:00-00:01] The two little ninjas land with a puff of dust and golden sparkles and snap into their fighting stances with a cool spin of their hands. [00:01-00:03] Sensei Maple looks at them, nods proudly and points her staff out across the island; the ninjas look where she points, then grin at each other. [00:03-00:04] The tiny spark in the flower's centre twinkles. ${SENSEI_LOOKS} Big heroic whoosh on the landing, then a hopeful heroic theme.`,
  },
];

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [mode, ...ns] = args.filter((a) => !a.startsWith("--"));
const pick = SHOTS.filter((s) => !ns.length || ns.includes(String(s.n)));

async function villager(id: string) {
  const out = R + id + ".png";
  await makeImage({ out, prompt: `${VILLAGERS[id]} ${REF_STYLE}`, refs: STYLE_REFS, aspect: "1:1" });
  console.log("ref", out);
}

async function frame(s: Shot, v: number) {
  const out = `${DIR}/shot${s.n}_frame_${v}.png`;
  const note = s.refs.some((r) => r.startsWith(R)) ? `\n\n${VILLAGER_NOTE}` : "";
  await makeImage({ out, prompt: `${s.frame}${note}\n\n${FRAME}`, refs: s.refs, aspect: "16:9", size: "2K" });
  console.log("frame", out);
}

async function video(s: Shot, take: number) {
  const img = `${DIR}/shot${s.n}_frame.png`;
  const out = `${DIR}/shot${s.n}_take${take}.mp4`;
  if (existsSync(out)) throw new Error(`${out} exists; pass --take=<n> for a new take`);
  const t = Date.now();
  await genOmni(out, { image: img, prompt: `${s.motion} ${MOTION}`, resolution: "1080p" });
  console.log("video", out, ((Date.now() - t) / 1000).toFixed(0) + "s");
}

async function pose(id: string, v = 0) {
  const out = v ? P + `${id}_${v}.png` : SENSEI_POSE(id);
  await makeImage({ out, prompt: `Using the attached images as the exact character reference (same grandmother red panda sensei: female, silvery-white hair bun with a wooden hair stick and a tiny pink flower, round wire spectacles, white cheek fur, NO beard, moss-green robe with a darker green sash, striped tail, one bamboo staff), draw her ${POSES[id]}. ${REF_STYLE}`, refs: [C + "sensei_idle.png", C + "sensei_talk.png"], aspect: "1:1" });
  console.log("pose", out);
}

// The finale (src/scenes/Intro.tsx plays it under the "finale" line): the petals come home and the flower blooms.
const FINALE = `One continuous shot, slow gentle push-in. [00:00-00:01.5] The glowing ribbons of rainbow-coloured teardrop petals swoop down out of the dawn sky and spiral round the bare, dark World Flower on its rock, while the villagers point and gasp. [00:01.5-00:03.5] The petals land on the flower one after another, forming two rings of glowing teardrop petals round its round centre, which lights up warm gold; the stem straightens and the leaves turn glossy green with glowing gold veins. [00:03.5-00:05.5] The World Flower bursts into full glorious bloom with a warm glow and swirling rainbow sparkles; bunting and confetti appear, and the pandas, foxes, rabbit and owl cheer and dance for joy. The flower keeps its design the whole time: two rings of separate teardrop petals round a golden centre, never a tree. ${MOTION} Magical rising chimes and harp, swelling into a joyful triumphant fanfare with happy cheering.`;

if (mode === "finale") {
  const take = Number(flags.take ?? 1);
  const out = `${DIR}/finale_take${take}.mp4`;
  if (existsSync(out)) throw new Error(`${out} exists; pass --take=<n>`);
  await genOmni(out, { image: `${DIR}/finale_frame.png`, lastFrame: `${DIR}/finale_last.png`, prompt: FINALE, resolution: "1080p" });
  console.log("video", out);
} else if (mode === "poses") {
  const ids = ns.length ? ns : Object.keys(POSES);
  const vs = Number(flags.v ?? 0);
  await Promise.all(ids.flatMap((id) => (vs ? Array.from({ length: vs }, (_, i) => i + 1) : [0]).map((v) => pose(id, v).catch((e) => console.error("FAILED", id, e.message)))));
} else if (mode === "refs") {
  const ids = ns.length ? ns : Object.keys(VILLAGERS);
  await Promise.all(ids.map((id) => villager(id).catch((e) => console.error("FAILED", id, e.message))));
} else if (mode === "frames") {
  const vs = Number(flags.v ?? 2), from = Number(flags.from ?? 1);
  await Promise.all(pick.flatMap((s) => Array.from({ length: vs }, (_, i) => frame(s, from + i).catch((e) => console.error("FAILED", s.n, e.message)))));
} else if (mode === "video") {
  const takes = Number(flags.takes ?? 1), from = Number(flags.take ?? 1);
  await Promise.all(pick.flatMap((s) => Array.from({ length: takes }, (_, i) => video(s, from + i).catch((e) => console.error("FAILED", s.n, e.message)))));
}
