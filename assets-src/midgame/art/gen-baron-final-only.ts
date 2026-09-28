// Art for "Baron final only" (docs/fix-requests.md, "Baron final only: the interim swap (27 Sep)").
// Candidates only: raws land in assets-src/midgame/art/raw/, the picks are cut and exported by ./cut.py.
//   doppler run -p os-legacy-2026-04 -c dev -- bun assets-src/midgame/art/gen-baron-final-only.ts [magpie|balloon|shark]... [--n=4]
// - mon_boss_magpie: the Sky Magpie, w6-11's boss from the interim swap on (and Slice 1b's sprite, which Jonas approves).
// - baron_balloon: the Baron in his balloon, escaping after the Magpie falls (and the overworld's balloon prop later).
// - sand_shark (concept only): Star Dunes' guardian, the Baron's lieutenant (MIDGAME_ENDGAME §2.4, R3).
import { existsSync } from "node:fs";
import { makeImage } from "../../../scripts/img";
import { STYLE } from "../../../scripts/art-manifest";
import { pool } from "../../../scripts/gemini";

const SPRITE = "A single full-body creature, centred, on a plain flat pure white background, no ground, no shadow, no scenery, nothing else in the image.";
const REF = "assets-src/art";
const BARON = "BARON MUDDLE, the villain: a menacing, sneering shadow-sorcerer toad with dark charcoal-green warty skin, glowing red eyes with slit pupils, a wide sharp-toothed evil grin, a jagged black iron crown with a glowing purple gem, a huge high-collared black and crimson cloak with torn spiky edges, clawed hands crackling with swirling purple muddle-magic. Clearly the evil villain, but a cartoon suitable for 5-year-olds.";

const JOBS: Record<string, { refs: string[]; prompt: string; aspect?: string }> = {
  magpie: {
    refs: [`${REF}/mon_boss_knight.png`, `${REF}/mon_boss_oni.png`],
    prompt: `Using the attached images ONLY as the art-style reference (the same painting style, ink line weight, colouring and level of detail as these boss monsters; do not copy their characters), draw a new boss monster for a kids' ninja adventure game, funny not scary. BOSS: THE SKY MAGPIE, a huge greedy show-off magpie bird: glossy black head and back, a snowy white belly, iridescent blue-green shimmer on its wings and long fan tail, a big cheeky grin on its beak, glittering gem-greedy eyes, a little tuft of golden feathers on its head like a crown, and a small purple muddle-swirl badge on its chest (the mark of Baron Muddle, whom it serves). It clutches three glittering jewel gems (red, gold and blue) in one raised claw and has its wings half spread, ready to swoop. Big readable silhouette, as big and imposing as the attached bosses. Facing left, in a battle-ready pose. ${SPRITE} ${STYLE}`,
  },
  balloon: {
    refs: [`${REF}/baron_idle.png`],
    aspect: "3:4",
    prompt: `Using the attached image as the exact character reference (the same villain: same face, crown, cloak, colours and art style), draw ${BARON} He is escaping in his hot-air balloon: he stands in its small wicker basket, leaning out and laughing, waving a bulging sack that sparkles with colourful jewel gems. The balloon above him is patched and a bit wonky, striped black and crimson with one big purple swirl on it, little sandbags hanging from the basket, ropes to the basket. The whole balloon and basket are in the picture, small and complete. Facing left, three-quarter view. ${SPRITE.replace("creature", "balloon with its rider")} ${STYLE}`,
  },
  shark: {
    refs: [`${REF}/mon_boss_serpent.png`, `${REF}/mon_boss_yeti.png`],
    prompt: `Using the attached images ONLY as the art-style reference (the same painting style, ink line weight and colouring; do not copy their characters), draw a concept of a new boss monster for a kids' ninja adventure game, funny not scary. BOSS: THE SAND SHARK, Baron Muddle's lieutenant, who guards the desert dunes under the stars: a big sandy-gold and dusky purple shark that swims through sand dunes like water, bursting up out of a dune in a spray of sand, with a goofy toothy grin (round blunt cartoon teeth, not scary), a captain-like crimson and black sash with a purple muddle-swirl badge, a little star-speckled pattern on its back, and a rolled-up paper note clamped in one fin. Facing left. ${SPRITE} ${STYLE}`,
  },
};

const args = process.argv.slice(2);
const n = Number(args.find((a) => a.startsWith("--n="))?.slice(4) ?? 4);
const which = args.filter((a) => !a.startsWith("--"));
const todo = (which.length ? which : Object.keys(JOBS)).flatMap((k) =>
  Array.from({ length: k === "shark" ? Math.min(n, 2) : n }, (_, i) => ({ k, out: `assets-src/midgame/art/raw/${k}_${i + 1}.png` })),
).filter((j) => !existsSync(j.out));
console.log(`${todo.length} to generate`);
await pool(todo, 6, async (j) => {
  const t = Date.now();
  const job = JOBS[j.k];
  try {
    await makeImage({ out: j.out, prompt: job.prompt, refs: job.refs, aspect: job.aspect ?? "1:1", model: "gemini-3-pro-image" });
    console.log("✓", j.out, ((Date.now() - t) / 1000).toFixed(0) + "s");
  } catch (e) {
    console.log("✗", j.out, String(e).slice(0, 200));
  }
});
