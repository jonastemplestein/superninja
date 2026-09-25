// Landing-page key art. Run: doppler run -p os-legacy-2026-04 -c dev -- bun assets-src/landing/gen.ts <job> [variant]
import { makeImage, STYLE } from "../../scripts/img";
const C = "assets-src/cut/";
const KAI = C + "hero_kai_jump.png", SUKI = C + "hero_suki_jump.png", SENSEI = C + "sensei_talk.png", BARON = C + "baron_angry.png", BARON_I = C + "baron_idle.png";
const ONMODEL = "The reference images show the exact characters: keep them perfectly on-model (same faces, hair, headbands, outfits, colours). Kai is a boy ninja with black spiky hair, red headband, dark navy-purple gi, gold belt. Suki is a girl ninja with two auburn curly hair buns, pink headband, teal gi, gold belt. Sensei Maple is a grandmotherly old FEMALE red panda with a silvery-white hair bun held by a wooden hair stick with a tiny pink flower, round glasses, soft white cheek fur and absolutely NO beard or moustache, a moss-green robe and a bamboo walking staff. Baron Muddle is a dark green toad sorcerer with glowing red eyes, a black iron spiked crown, a crimson-lined black cloak and a folding paper fan.";
const PAPER = "Painted like a single full-bleed illustration from an award-winning children's picture book (one continuous image: no book gutter, no centre fold, no page edges, no border, no frame): gentle watercolour washes and gouache texture, lovely light, calm composition with breathing room, a sense of wonder, Studio Ghibli atmosphere meets Nintendo charm.";
const jobs: Record<string, { prompt: string; refs: string[]; aspect: string }> = {
  hero_portrait: {
    aspect: "9:16",
    refs: [KAI, SUKI, SENSEI, BARON],
    prompt: `${ONMODEL}\n\nA tall portrait illustration for a phone screen. The top 35% of the image is calm, clean, softly glowing dawn sky (pale peach to soft cream-gold, a few very soft clouds) with NOTHING in it, reserved for a title. Below: the enormous Great Blossom Tree on a grassy hilltop, its canopy of pink blossom glowing warmly, sparkling pink petals streaming off it on the wind. Kai and Suki, drawn exactly like the reference sprites (same proportions, faces and costumes, both with gold belts and bandaged wrists), leap dynamically through the air in the middle of the picture, fists up, catching glowing petals. Sensei Maple stands on the hill at the lower left, smiling and pointing up. On the right, mid-height, Baron Muddle (exactly like the reference: crown, red eyes, cloak, fan) looms out of a big swirl of dark purple storm clouds with purple lightning, glaring and flapping his fan so a stream of petals is torn away from the tree. Misty Japanese mountains, a tiny pagoda, bamboo in the foreground at the bottom. Bottom 15% fades into soft warm cream mist. ${PAPER}\n\n${STYLE}`,
  },
  hero_landscape: {
    aspect: "16:9",
    refs: [KAI, SUKI, SENSEI, BARON],
    prompt: `${ONMODEL}\n\nA wide cinematic landscape illustration. The LEFT 45% of the image is calm, clean, softly glowing dawn sky and soft misty distant hills with no characters and no detail, reserved for a title and text. On the right half: the enormous Great Blossom Tree on a grassy hilltop, its canopy of pink blossom glowing warmly, sparkling pink petals streaming off it on the wind across the sky. Kai and Suki leap joyfully through the air in front of the tree, catching glowing petals. Sensei Maple stands at the foot of the tree, smiling and pointing up. Far away at the top right, Baron Muddle looms in a swirl of dark purple storm clouds, flapping his fan. Misty Japanese mountains, a tiny pagoda. The bottom edge fades into soft warm cream mist. ${PAPER}\n\n${STYLE}`,
  },
  story_baron: {
    aspect: "4:5",
    refs: [BARON, BARON_I],
    prompt: `${ONMODEL}\n\nNight scene. Baron Muddle stands on a rocky crag under a huge moon, cloak billowing, flapping his big paper fan with a gust of wind that blows hundreds of glowing pink blossom petals away from a great blossom tree, scattering them across a moonlit island of bamboo villages and misty mountains. Deep indigo and purple night palette with glowing pink petals and his red eyes as the only warm accents. Dramatic but not too scary for 5-year-olds: a pompous grumpy villain. ${PAPER}\n\n${STYLE}`,
  },
  flower: {
    aspect: "1:1",
    refs: [SENSEI, C + "petal_a.png", C + "petal_m.png"],
    prompt: `${ONMODEL}\n\nA magical glowing Sound Flower seen from the front: a large flower whose petals are big glossy teardrop-shaped petals (round at the outer end, pointed where they meet the centre) in many different jewel colours (red, orange, yellow, green, teal, blue, purple, pink), each with a few small sparkling gems set inside it, radiating from a golden glowing centre. A few petals are still missing and float back towards the flower, glowing. Sensei Maple stands small beside it at the bottom left, looking up with delight. The background is plain flat warm cream paper colour (#f7eedd) everywhere at the edges, with only a soft golden watercolour glow behind the flower; lots of empty space around it. ${PAPER}\n\n${STYLE}`,
  },
  reading: {
    aspect: "4:3",
    refs: [KAI, SUKI, SENSEI],
    prompt: `${ONMODEL}\n\nA cosy scene: Sensei Maple sits under a blossom tree reading a big open picture book aloud; Kai and Suki sit cross-legged beside her, leaning in, delighted, one pointing at the page. Warm late-afternoon light, a paper lantern hanging from a branch, a few petals drifting. No readable text anywhere in the book (just soft coloured pictures). The painting is a vignette whose edges fade softly into plain flat warm cream paper colour (#f7eedd) on all four sides. ${PAPER}\n\n${STYLE}`,
  },
  finale: {
    aspect: "16:9",
    refs: [KAI, SUKI, SENSEI],
    prompt: `${ONMODEL}\n\nTriumphant sunrise: the Great Blossom Tree in full glorious bloom on a hilltop, glowing, surrounded by swirling sparkling petals. Kai and Suki (exactly as in the reference sprites, both with GOLD belts, bandaged wrists) stand on the hill cheering with arms raised, Sensei Maple beside them. Golden sunrise sky, the island below full of colour. The CENTRE-TOP 40% of the sky is calm and clear for a big headline. ${PAPER}\n\n${STYLE}`,
  },
};
const [job, v = "1"] = process.argv.slice(2);
const j = jobs[job];
if (!j) throw new Error("unknown job " + job + "; have " + Object.keys(jobs));
const out = `assets-src/landing/${job}_${v}.png`;
await makeImage({ out, prompt: j.prompt, refs: j.refs, aspect: j.aspect, size: "2K" });
console.log("wrote", out);
