// Landing-page key art. Run: doppler run -p os-legacy-2026-04 -c dev -- bun assets-src/landing/gen.ts <job> [variant]
import { makeImage, STYLE } from "../../scripts/img";
const C = "assets-src/cut/";
const KAI = C + "hero_kai_jump.png", SUKI = C + "hero_suki_jump.png", SENSEI = C + "sensei_talk.png", BARON = C + "baron_angry.png", BARON_I = C + "baron_idle.png";
const ONMODEL = "The reference images show the exact characters: keep them perfectly on-model (same faces, hair, headbands, outfits, colours). Kai is a boy ninja with black spiky hair, red headband, dark navy-purple gi, gold belt. Suki is a girl ninja with two auburn curly hair buns, pink headband, teal gi, gold belt. Sensei Maple is a grandmotherly old FEMALE red panda with a silvery-white hair bun held by a wooden hair stick with a tiny pink flower, round glasses, soft white cheek fur and absolutely NO beard or moustache, a moss-green robe and a bamboo walking staff. Baron Muddle is a dark green toad sorcerer with glowing red eyes, a black iron spiked crown, a crimson-lined black cloak and a folding paper fan.";
// The World Flower (assets-src/world-flower/model_sheet.png): refs for each story state.
const WF = "assets-src/world-flower/world_flower_glorious.png", WF_PART = "assets-src/world-flower/world_flower_partial.png", WF_DARK = "assets-src/world-flower/world_flower_destroyed.png", WF_FULL = "assets-src/world-flower/world_flower_restored.png";
const FLOWER = "the World Flower (exactly like the World Flower reference image): a gigantic magical flower as tall as a temple, whose bloom is two rings of separate glowing glassy TEARDROP-shaped petals (round outer tips, pointed at the centre), every petal a different colour in rainbow order, around a glowing domed golden centre with a thin golden halo, on an S-curved jade stem with big curling leaves veined with glowing gold and roots gripping a mossy rock. It is NOT a tree, and there is no cherry-blossom tree anywhere in the picture";
const PAPER = "Painted like a single full-bleed illustration from an award-winning children's picture book (one continuous image: no book gutter, no centre fold, no page edges, no border, no frame): gentle watercolour washes and gouache texture, lovely light, calm composition with breathing room, a sense of wonder, Studio Ghibli atmosphere meets Nintendo charm.";
const jobs: Record<string, { prompt: string; refs: string[]; aspect: string }> = {
  hero_portrait: {
    aspect: "9:16",
    refs: [KAI, SUKI, SENSEI, BARON, WF_PART],
    prompt: `${ONMODEL}\n\nA tall portrait illustration for a phone screen. The top 35% of the image is calm, clean, softly glowing dawn sky (pale peach to soft cream-gold, a few very soft clouds) with NOTHING in it, reserved for a title. Below: ${FLOWER}, standing enormous on a grassy hilltop and glowing warmly; the storm has torn many of its petals away, and glowing rainbow-coloured teardrop petals stream off it on the wind. Kai and Suki, drawn exactly like the reference sprites (same proportions, faces and costumes, both with gold belts and bandaged wrists), leap dynamically through the air in the middle of the picture, fists up, catching glowing petals. Sensei Maple stands on the hill at the lower left, smiling and pointing up. On the right, mid-height, Baron Muddle (exactly like the reference: crown, red eyes, cloak, fan) looms out of a big swirl of dark purple storm clouds with purple lightning, glaring and flapping his fan so a stream of rainbow petals is torn away from the World Flower. Misty Japanese mountains, a tiny pagoda, bamboo in the foreground at the bottom. Bottom 15% fades into soft warm cream mist. ${PAPER}\n\n${STYLE}`,
  },
  hero_landscape: {
    aspect: "16:9",
    refs: [KAI, SUKI, SENSEI, BARON, WF_PART],
    prompt: `${ONMODEL}\n\nA wide cinematic landscape illustration. The LEFT 45% of the image is calm, clean, softly glowing dawn sky and soft misty distant hills with no characters and no detail, reserved for a title and text. On the right half: ${FLOWER}, standing enormous on a grassy hilltop and glowing warmly; many of its petals are missing, and glowing rainbow-coloured teardrop petals stream across the sky on the wind. Kai and Suki leap joyfully through the air in front of the flower, catching glowing petals. Sensei Maple stands at the foot of the flower, smiling and pointing up at the ninjas. Far away at the top right, Baron Muddle looms in a swirl of dark purple storm clouds, flapping his fan. Misty Japanese mountains, a tiny pagoda. The bottom edge fades into soft warm cream mist. ${PAPER}\n\n${STYLE}`,
  },
  story_baron: {
    aspect: "4:5",
    refs: [BARON, BARON_I, WF],
    prompt: `${ONMODEL}\n\nNight scene. Baron Muddle stands on a rocky crag under a huge moon, cloak billowing, flapping his big paper fan with a gust of wind that tears dozens of glowing rainbow-coloured teardrop petals off ${FLOWER} (on the neighbouring hilltop, half its petals already gone), scattering them across a moonlit island of bamboo villages and misty mountains. Deep indigo and purple night palette with the glowing rainbow petals and his red eyes as the only warm accents. Dramatic but not too scary for 5-year-olds: a pompous grumpy villain. ${PAPER}\n\n${STYLE}`,
  },
  flower: {
    aspect: "1:1",
    refs: [SENSEI, WF_PART, WF],
    prompt: `${ONMODEL}\n\n${FLOWER}, seen from the front and partly regrown (like the partly regrown reference): about half of its glowing rainbow teardrop petals are back in place, each petal with a few small sparkling gems set inside it; the missing petals show as faint pale ghostly outlines, and three glowing petals float back towards their places, trailing sparkles. Sensei Maple stands small beside it at the bottom left, looking up at it with delight. The background is plain flat warm cream paper colour (#f7eedd) everywhere at the edges, with only a soft golden watercolour glow behind the flower; lots of empty space around it. ${PAPER}\n\n${STYLE}`,
  },
  reading: {
    aspect: "4:3",
    refs: [KAI, SUKI, SENSEI, WF_PART],
    prompt: `${ONMODEL}\n\nA cosy scene: Sensei Maple sits on the grass at the foot of ${FLOWER} (partly regrown: some rainbow petals glowing, some still missing; only its lower leaves and the glow of its bloom above are in the picture) reading a big open picture book aloud; Kai and Suki sit cross-legged beside her, leaning in, delighted, one pointing at the page. Warm late-afternoon light, a paper lantern hanging from one of the flower's big curling leaves, a couple of glowing rainbow petals drifting down. No readable text anywhere in the book (just soft coloured pictures). The painting is a vignette whose edges fade softly into plain flat warm cream paper colour (#f7eedd) on all four sides. ${PAPER}\n\n${STYLE}`,
  },
  finale: {
    aspect: "16:9",
    refs: [KAI, SUKI, SENSEI, WF_FULL],
    prompt: `${ONMODEL}\n\nTriumphant sunrise: ${FLOWER}, fully restored (like the restored reference) in full glorious bloom on its hilltop, every rainbow petal back and blazing with light, surrounded by swirling sparkles and ribbons of rainbow light. Kai and Suki (exactly as in the reference sprites, both with GOLD belts, bandaged wrists) stand on the hill cheering with arms raised, Sensei Maple beside them. Golden sunrise sky, the island below full of colour. The CENTRE-TOP 40% of the sky is calm and clear for a big headline. ${PAPER}\n\n${STYLE}`,
  },
};
const [job, v = "1"] = process.argv.slice(2);
const j = jobs[job];
if (!j) throw new Error("unknown job " + job + "; have " + Object.keys(jobs));
const out = `assets-src/landing/${job}_wf${v}.png`;
await makeImage({ out, prompt: j.prompt, refs: j.refs, aspect: j.aspect, size: "2K" });
console.log("wrote", out);
