// The ninja giving a thumbs up, for the confirm's YES answer (src/ui/Confirm.tsx, docs/CONFIRM.md §3). One-off art job,
// done the way scripts/gen-hero-moves.ts makes a move sprite: image-to-image from the raw idle sprite with the house style.
//   doppler run -p os-legacy-2026-04 -c dev -- bun playtest/confirm/gen-thumbs.ts [kai|suki] [--take N]
// Raw takes → playtest/confirm/art/hero_<h>_thumbsup_t<N>.png; the cut-out and export are playtest/confirm/cut-thumbs.py.
import { makeImage } from "../../scripts/img";
import { STYLE } from "../../scripts/art-manifest";

const SPRITE = "A single full-body character, centred, on a plain flat pure white background, no ground, no shadow, no scenery, nothing else in the image.";
const NO_FX = "Draw only the character: no motion lines, no speed lines, no swoosh marks, no glow, no aura, no sparkles, no impact effects, no dust.";
const KEEP = {
  kai: "Keep him exactly on-model: messy black top-knot, deep indigo (not blue) ninja outfit with golden trim, bright red headband with long tails, golden sash, white wrapped hands and feet, warm brown skin.",
  suki: "Keep her exactly on-model: both round bouncy auburn bunches stay on her head (never loose hair), freckles, teal ninja outfit with coral-pink trim, coral-pink headband with long tails, golden sash, white wrapped hands and feet.",
} as const;
const HOW =
  "giving a big friendly THUMBS UP: one arm held out towards the viewer with the wrapped fist closed and the thumb pointing straight up, clearly visible and large, the other hand resting on the hip, standing relaxed and proud, a big warm encouraging grin with a wink, front view facing the viewer";

const args = process.argv.slice(2);
const heroes = (["kai", "suki"] as const).filter((h) => !args.some((a) => a === "kai" || a === "suki") || args.includes(h));
const take = args.includes("--take") ? Number(args[args.indexOf("--take") + 1]) : 1;
await Promise.all(
  heroes.map((h) =>
    makeImage({
      out: `playtest/confirm/art/hero_${h}_thumbsup_t${take}.png`,
      refs: [`assets-src/art/hero_${h}_idle.png`],
      prompt: `Using the attached image as the exact character reference (same character, same outfit, same colours, same face, same art style and line weight), draw this character ${HOW}. ${KEEP[h]} ${SPRITE} ${NO_FX} ${STYLE}`,
    }).then((f) => console.log("wrote", f)),
  ),
);
