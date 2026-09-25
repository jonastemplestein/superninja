// Mouth-shape (viseme) frames for talking characters.
// For each character face (assets-src/faces/<char>_idle.png) ask Gemini to redraw ONLY the mouth in each shape;
// scripts/composite-visemes.py then pastes just the mouth area onto the base face so nothing else flickers.
// Usage: doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-visemes.ts [char...]
import { existsSync } from "node:fs";
import { makeImage } from "./img";
import { pool } from "./gemini";

export const VISEMES: Record<string, string> = {
  rest: "mouth gently CLOSED, lips together, calm",
  ah: "mouth WIDE OPEN as if saying 'aah', jaw dropped, tongue visible",
  ee: "mouth stretched WIDE and flat as if saying 'eee', teeth showing, lips spread",
  oh: "mouth open in a ROUND 'oh' shape, medium size",
  oo: "lips pushed forward into a SMALL round pucker as if saying 'ooo'",
  ss: "teeth together with lips slightly apart as if saying 'sss'",
  eh: "mouth HALF open as if saying 'eh', relaxed",
};

const chars = process.argv.slice(2).length ? process.argv.slice(2) : ["sensei", "baron"];
const jobs = chars.flatMap((c) => Object.keys(VISEMES).map((v) => ({ c, v })));
await pool(jobs, 6, async ({ c, v }) => {
  const out = `assets-src/faces/${c}_v_${v}.png`;
  if (existsSync(out)) return;
  await makeImage({
    out,
    refs: [`assets-src/faces/${c}_idle.png`],
    prompt: `Edit this exact image. Keep EVERYTHING identical — same character, same pose, same framing, same size and position, same colours, same line art, same background (plain), same eyes, same expression otherwise — and change ONLY the mouth: ${VISEMES[v]}. The mouth must stay in exactly the same place on the face. Same hand-painted cartoon style with bold dark-brown ink outlines. No text.`,
  });
  console.log("✓", c, v);
});
