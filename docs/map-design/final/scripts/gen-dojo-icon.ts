// The dojo stone's own picture (docs/MAP_DESIGN.md §10 decision 7): a small dojo hall, so a dojo stone no longer shows
// Sensei, who is also the Help button in the same corner. Generated the way the game's items are (scripts/art-manifest.ts
// `items`, scripts/img.ts), then cut out like scripts/post-art.py does (rembg isnet-anime, trim, 320 px, WebP q86).
//   doppler run -p os-legacy-2026-04 -c dev -- bun docs/map-design/final/scripts/gen-dojo-icon.ts [takes]
//   uv run --with 'rembg[cpu]' --with pillow python docs/map-design/final/scripts/cut-dojo-icon.py <take.png>
// Takes go to assets-src/art/item_dojo.take<N>.png; the chosen one is cut to public/a/i/item_dojo.webp.
import { makeImage, STYLE } from "../../../../scripts/img";

const ROOT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja";
export const DOJO_PROMPT =
  "a single small cosy wooden ninja dojo hall seen from the front, like a little shrine building: one big sweeping curved roof of dark charcoal-grey tiles with upturned corners (a single roof, not a tower or pagoda), warm honey-coloured wooden posts and beams, wide open paper sliding doors glowing with warm golden light inside, two wide stone steps up to the door, no lanterns, no gong, no gate, no sign, no people; a chunky simple silhouette that still reads when drawn very small, centred, as a game item sprite on a plain flat pure white background, nothing else. ";
const n = Number(process.argv[2] ?? 3);
await Promise.all(
  Array.from({ length: n }, async (_, k) => {
    const out = `${ROOT}/assets-src/art/item_dojo.take${k}.png`;
    await makeImage({ out, prompt: DOJO_PROMPT + STYLE });
    console.log("wrote", out);
  }),
);
