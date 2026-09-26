// First-minutes art that isn't a word picture (docs/FIRST_MINUTES.md, Appendix B): the opt-in cards, the class door,
// the ninjas in school jumpers, the thought cloud, the tortoise and rabbit buttons and the Sticker Book.
// Word pictures (pic_*) go through src/content/phonics.ts and scripts/gen-art.ts instead.
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-first-minutes-art.ts [idPrefix...] [--force]
//   uv run --with "rembg[cpu]" --with pillow python scripts/post-art.py <ids>
//
// Skips ids whose raw PNG (assets-src/art/<id>.png) exists unless --force; move a take into .trash/ to redo it.
// post-art.py only knows the jobs in assets-src/art-jobs.json, which scripts/export-art-jobs.ts rewrites from the
// manifest, so every run (and `--export` alone) merges these jobs back into that file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { STYLE, PIC_OBJECT, PIC_LIVING, type ArtJob } from "./art-manifest";
const SPRITE = "A single full-body character, centred, on a plain flat pure white background, no ground, no shadow, no scenery, nothing else in the image.";
const ITEM = "centred, as a game item sprite on a plain flat pure white background, nothing else.";
const SCHOOL = (hero: string): ArtJob => ({
  id: `hero_${hero}_school`, w: 640, cut: true, refs: [`hero_${hero}_idle`],
  prompt: `Using the attached image as the exact character reference (same character, same outfit, same colours, same face, same art style and line weight), draw this character wearing a red British school jumper over the ninja outfit and carrying a blue book bag, standing proudly and facing the viewer. ${SPRITE} ${STYLE}`,
});

export const FIRST_MINUTES_ART: ArtJob[] = [
  // opt-in screen A: "Not yet? Tap the teddy!" / "Yes? Tap the school!"
  { id: "opt_teddy", w: 512, cut: true, prompt: `a soft brown teddy bear sitting and facing the viewer, with a friendly stitched smile and a red bow at its neck. ${PIC_LIVING}` },
  { id: "opt_school", w: 512, cut: true, prompt: `a small friendly British primary school building in red brick, with a big blue front door, white windows, a little bell on the roof and green railings in front; no signs. ${PIC_OBJECT}` },
  // opt-in screen B: three doors (tinted in CSS), the child's ninja in a school jumper at each, and "Not sure?"
  { id: "class_door", w: 512, cut: true, aspect: "3:4", prompt: `a single bright classroom door painted sunny yellow, standing slightly open with warm light spilling out, a round window near the top; no signs. ${PIC_OBJECT}` },
  SCHOOL("kai"),
  SCHOOL("suki"),
  // (no face: the UI draws a "?" on it, and STYLE's "expressive friendly faces" gave take 1 a smiley)
  { id: "item_think_cloud", w: 320, cut: true, prompt: `a single fluffy white thought cloud with two small round puffs trailing below it, a plain cloud shape with NO face, no eyes and no mouth, ${ITEM} ${STYLE}` },
  // Lesson 1 and 2: the slow and fast buttons
  { id: "ui_rabbit", w: 256, cut: true, prompt: `a white bunny rabbit leaping to the right, ears streaming back, a happy face. ${PIC_LIVING}` },
  { id: "ui_tortoise", w: 256, cut: true, prompt: `a green tortoise walking slowly to the right with a sleepy, happy smile. ${PIC_LIVING}` },
  // Reward 1: the Sticker Book arrives
  { id: "item_sticker_book", w: 512, cut: true, prompt: `a chunky closed red leather sticker book with rounded corners and a gold ninja-star clasp on the front cover, three-quarter view, ${ITEM} ${STYLE}` },
];

const JOBS_FILE = "assets-src/art-jobs.json";
function exportJobs() {
  const jobs: { id: string; cut: boolean; w: number }[] = existsSync(JOBS_FILE) ? JSON.parse(readFileSync(JOBS_FILE, "utf8")) : [];
  const mine = new Set(FIRST_MINUTES_ART.map((j) => j.id));
  const merged = [...jobs.filter((j) => !mine.has(j.id)), ...FIRST_MINUTES_ART.map(({ id, cut, w }) => ({ id, cut: !!cut, w }))];
  writeFileSync(JOBS_FILE, JSON.stringify(merged, null, 1));
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  exportJobs();
  if (args.includes("--export")) process.exit(0);
  const { makeImage } = await import("./img"); // (needs the Gemini key, so `--export` alone runs without Doppler)
  const { pool } = await import("./gemini");
  const force = args.includes("--force");
  const prefixes = args.filter((a) => !a.startsWith("--"));
  const raw = (id: string) => `assets-src/art/${id}.png`;
  const todo = FIRST_MINUTES_ART.filter((j) => (!prefixes.length || prefixes.some((p) => j.id.startsWith(p))) && (force || !existsSync(raw(j.id))));
  console.log(`${todo.length} to generate of ${FIRST_MINUTES_ART.length}`);
  await pool(todo, 6, async (j) => {
    const refs = (j.refs ?? []).map(raw);
    for (const r of refs) if (!existsSync(r)) throw new Error(`missing ref ${r} for ${j.id}`);
    const t = Date.now();
    await makeImage({ out: raw(j.id), prompt: j.prompt, refs, aspect: j.aspect ?? "1:1", model: j.model });
    console.log("✓", j.id, ((Date.now() - t) / 1000).toFixed(0) + "s");
  });
}
