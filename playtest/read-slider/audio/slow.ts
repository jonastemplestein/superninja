// Picture reading v2: the slow words (public/a/x/<word>.mp3: the word's pure sounds one by one, 250 ms apart) for the
// compound bank's new words, made by scripts/gen-slow-words.ts's own compose() and finish() (the same sounds, levels,
// gaps, voice bars, loudness and true-peak ceiling as every other slow word). gen-slow-words.ts --only needs the word in
// the content (ORAL_WORDS is an existing file) and rewrites slow-times.gen.ts, so the onsets go to
// playtest/read-slider/audio/slow-times.json and src/content/compounds.ts NEW_SLOW_TIMES instead, until the follow-up
// adds the words to ORAL_WORDS and runs gen-slow-words.ts --only (docs/fix-requests.md). New files only.
//   bun playtest/read-slider/audio/slow.ts [word...]
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compose, finish, GAP_MS } from "../../../scripts/gen-slow-words";
import { NEW_WORDS } from "../../../src/content/compounds";
import type { PhonemeId } from "../../../src/content/phonics";

const ROOT = join(import.meta.dir, "../../..");
const only = process.argv.slice(2);
const dir = mkdtempSync(join(tmpdir(), "rs-slow-"));
const times: Record<string, number[]> = {};
for (const [w, o] of Object.entries(NEW_WORDS)) {
  if (o.gag || (only.length && !only.includes(w))) continue;
  const out = join(ROOT, `public/a/x/${w}.mp3`);
  const { y, onsets } = compose([...o.segs] as PhonemeId[], GAP_MS);
  times[w] = onsets;
  if (existsSync(out)) {
    console.log("·", w, "exists (onsets computed only)");
    continue;
  }
  const r = await finish(y, out, dir);
  console.log("✓", w, o.segs.join("·"), JSON.stringify({ onsets, lufs: r.lufs, truePeak: r.truePeak }));
}
writeFileSync(join(import.meta.dir, "slow-times.json"), JSON.stringify(times, null, 1) + "\n");
console.log(Object.entries(times).map(([w, t]) => `  ${w}: [${t.join(", ")}],`).join("\n"));
