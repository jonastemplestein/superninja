// The Sky Magpie, w6-11's guardian (Baron final only, 27 Sep; MIDGAME_ENDGAME §2.5.2). Candidates only: raws land in
// assets-src/midgame/magpie/raw/, the pick is cut and exported by ./cut.py (see ./picks.json for why that one).
//   doppler run -p os-legacy-2026-04 -c dev -- bun assets-src/midgame/magpie/gen-magpie.ts [--n=4] [--tag=b]
// (no tag: round a's PROMPT, raw/magpie_N.png; --tag=b: PROMPT_B, raw/magpieb_N.png)
// Style refs are the house monsters' masters (the chunky panda, the knight and Gloop), used for style only.
import { existsSync, mkdirSync } from "node:fs";
import { makeImage } from "../../../scripts/img";
import { STYLE } from "../../../scripts/art-manifest";
import { pool } from "../../../scripts/gemini";

const SPRITE = "A single full-body creature, centred, on a plain flat pure white background, no ground, no shadow, no scenery, nothing else in the image.";
const REFS = ["assets-src/art/mon_boss_panda.png", "assets-src/art/mon_boss_knight.png", "assets-src/art/mon_gloop.png"];

export const PROMPT = `Using the attached images ONLY as the art-style reference (the same hand-painted style, the same bold dark-brown ink outline, the same colouring, chunky rounded proportions and level of detail as these monsters; do not copy their characters), draw a new BOSS monster for a kids' ninja adventure game: cute but cheeky, funny, never scary (the players are four years old).
BOSS: THE SKY MAGPIE, a big, plump, chunky cartoon magpie lady and a cocky show-off gem thief. Glossy black head and back, a big round snowy-white tummy, blue-green shimmer on her wings and a long fan tail sticking out behind her. She wears a black ninja-thief's eye mask (a burglar's bandit mask across her eyes, tied at the back of her head with two little fluttering ribbon tails); her big bright friendly eyes with long eyelashes sparkle through the mask. A stubby dark beak with a smug, cheeky grin, one eyebrow raised. Short sturdy legs with little claws, feet planted wide.
On her back, strapped on like a backpack, sits a big round twiggy nest overflowing with glittering stolen jewels: faceted gems in ruby red, sapphire blue, emerald green, gold, pink and purple, with little sparkles. The nest sits behind her shoulders and does NOT rise above the top of her head.
POSE: both wings on her hips (hands-on-hips, akimbo), chest puffed out, beak tilted up proudly, as if saying "Catch me if you can!". Big readable chunky silhouette, as big and imposing as the attached bosses, but round and lovable. Three-quarter view, facing LEFT: her beak and body point to the left side of the picture.
${SPRITE} ${STYLE}`;

// Round b (after round a's four): a black mask vanished on her black head, and she looked mild beside the house bosses.
export const PROMPT_B = `Using the attached images ONLY as the art-style reference (the same hand-painted style, the same THICK bold dark-brown ink outline, the same rich saturated colouring with warm rim light, the same chunky rounded proportions and level of detail as these monsters; do not copy their characters), draw a new BOSS monster for a kids' ninja adventure game: cute but cheeky, funny, never scary (the players are four years old).
BOSS: THE SKY MAGPIE, a big, plump, very chunky cartoon magpie lady (a round egg-shaped body), a cocky show-off gem thief. Glossy black head and back with a blue sheen, a big round snowy-white tummy, iridescent blue-green wings and a long blue-green fan tail sticking out behind her.
She wears a BRIGHT PURPLE ninja-thief's bandit mask (a classic burglar's domino mask across her eyes, clearly standing out against her black head), with two long purple ribbon tails fluttering from the knot behind her head. Through the mask's eye-holes: big round white eyes with shiny dark pupils and long eyelashes. Her beak is open in a wide, smug, laughing grin with a little pink tongue, one eyebrow cocked: cheeky, pleased with herself, not mean.
On her back, strapped on like a backpack, a big round twiggy nest overflowing with glittering stolen jewels: big faceted gems in ruby red, sapphire blue, emerald green, gold, pink and orange, twinkling with sparkles. The nest sits behind her shoulders and does NOT rise above the top of her head.
POSE: both wings planted on her hips (hands-on-hips, akimbo), chest puffed out, beak tilted up proudly, feet planted wide: "Catch me if you can!". Big readable chunky silhouette, as big and imposing as the attached bosses, but round and lovable. Three-quarter view, facing LEFT: her beak and body point to the left side of the picture.
${SPRITE} ${STYLE}`;

const args = process.argv.slice(2);
const n = Number(args.find((a) => a.startsWith("--n="))?.slice(4) ?? 4);
const tag = args.find((a) => a.startsWith("--tag="))?.slice(6) ?? "";
const model = args.find((a) => a.startsWith("--model="))?.slice(8) ?? "gemini-3-pro-image";
mkdirSync("assets-src/midgame/magpie/raw", { recursive: true });
const todo = Array.from({ length: n }, (_, i) => `assets-src/midgame/magpie/raw/magpie${tag}_${i + 1}.png`).filter((o) => !existsSync(o));
console.log(`${todo.length} to generate with ${model}`);
await pool(todo, 4, async (out) => {
  const t = Date.now();
  try {
    await makeImage({ out, prompt: tag === "b" ? PROMPT_B : PROMPT, refs: REFS, aspect: "1:1", model });
    console.log("✓", out, ((Date.now() - t) / 1000).toFixed(0) + "s");
  } catch (e) {
    console.log("✗", out, String(e).slice(0, 200));
  }
});
