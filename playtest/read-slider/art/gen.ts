// Picture reading v2 (docs/PICTURE_READING.md §8): four candidates for every new picture in the compound bank
// (src/content/compounds.ts NEW_WORDS), in the house style (scripts/art-manifest.ts PIC_OBJECT / PIC_LIVING, the same
// model as scripts/gen-art.ts), plus redraw candidates for pictures the audit names wrongly (rain → "cloud",
// sea → "wave"), which are for a fix request only and never replace a file here.
//   doppler run -p os-legacy-2026-04 -c dev -- bun playtest/read-slider/art/gen.ts [word...] [--n 4]
// Writes playtest/read-slider/art/raw/<word>_<k>.png (skips existing). Then: uv run … post.py, judge.ts, sheets.
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { makeImage } from "../../../scripts/img";
import { pool } from "../../../scripts/gemini";
import { PIC_LIVING, PIC_OBJECT } from "../../../scripts/art-manifest";
import { NEW_WORDS } from "../../../src/content/compounds";

const ROOT = join(import.meta.dir, "../../..");
const RAW = join(import.meta.dir, "raw");
mkdirSync(RAW, { recursive: true });
const args = process.argv.slice(2);
const N = Number(args.includes("--n") ? args[args.indexOf("--n") + 1] : 4);
const only = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--n");

/** Redraws, for the fix request only (docs/read-slider/research.md §4.5): the audit names today's rain "cloud". */
const REDRAW: Record<string, { pic: string; living?: boolean }> = {
  "redraw-rain": { pic: "rain: lots of big blue raindrops pouring down in slanted lines from one small grey cloud into a little blue puddle below; the falling rain is the main thing and fills most of the picture, the cloud is small" },
  "redraw-sea": { pic: "the sea: a wide calm blue sea with a few small rolling waves and a sandy strip of beach at the bottom, seen from the beach, simple and flat, no boats, no animals" },
};
const refs: Record<string, string[]> = {
  bowrain: ["assets-src/art/pic_bow.png"],
  coatrain: ["assets-src/art/pic_coat.png"],
};

type Job = { word: string; k: number; prompt: string; refs: string[] };
const jobs: Job[] = [];
for (const [word, w] of [...Object.entries(NEW_WORDS), ...Object.entries(REDRAW)]) {
  if (only.length && !only.includes(word)) continue;
  const style = "gag" in w && w.gag ? PIC_OBJECT.replace("exactly ONE single object", "exactly ONE small scene: one cloud and the things falling from it") : w.living ? PIC_LIVING : PIC_OBJECT;
  const prompt = `${w.pic}. ${style}`;
  for (let k = 0; k < N; k++) jobs.push({ word, k, prompt, refs: (refs[word] ?? []).map((r) => join(ROOT, r)) });
}
const todo = jobs.filter((j) => !existsSync(join(RAW, `${j.word}_${j.k}.png`)));
console.log(`${todo.length} to generate of ${jobs.length}`);
await pool(todo, 8, async (j) => {
  const t = Date.now();
  try {
    await makeImage({ out: join(RAW, `${j.word}_${j.k}.png`), prompt: j.prompt, refs: j.refs, aspect: "1:1" });
    console.log("✓", j.word, j.k, ((Date.now() - t) / 1000).toFixed(0) + "s");
  } catch (e) {
    console.log("✗", j.word, j.k, String(e).slice(0, 200));
  }
});
console.log("done");
