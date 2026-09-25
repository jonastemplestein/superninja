// Fails if any referenced audio/image file is missing. Run before every release.
import { existsSync } from "node:fs";
import { WORDS, SPECIAL_WORDS, PHONEMES } from "../src/content/phonics";
import { LINES } from "../src/content/lines";
import { STORIES } from "../src/content/stories";
import { WORLDS, MONSTER_INFO } from "../src/content/worlds";
const fid = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_");
const need: string[] = [];
for (const w of WORDS) need.push(`public/a/w/${fid(w.text)}.mp3`), w.pic && need.push(`public/a/i/pic_${w.text}.webp`);
for (const w of SPECIAL_WORDS) need.push(`public/a/w/${fid(w)}.mp3`);
for (const p of Object.keys(PHONEMES)) need.push(`public/a/p/${p}.mp3`);
for (const l of LINES) need.push(`public/a/l/${l.id}.mp3`);
for (const s of STORIES) {
  need.push(`public/a/s/${s.id}_title.mp3`);
  for (const p of s.pages) need.push(`public/a/s/${s.id}_${p.id}.mp3`, `public/a/i/story_${s.id}_${p.scene}.webp`);
}
for (const w of WORLDS) need.push(`public/a/i/bg_${w.key}.webp`, `public/a/i/run_${w.key}.webp`, `public/a/m/${w.music}.mp3`);
for (const m of Object.keys(MONSTER_INFO)) need.push(`public/a/i/mon_${m}.webp`);
for (const c of ["battle", "run", "dojo", "swap", "story", "boss", "flower", "trial"]) need.push(`public/media/clips/${c}.mp4`);
const missing = [...new Set(need)].filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`✗ ${missing.length} missing assets:\n` + missing.join("\n"));
  process.exit(1);
}
console.log(`✓ all ${new Set(need).size} assets present`);
