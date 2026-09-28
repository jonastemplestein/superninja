// Refuses a ship while Sensei's voice is mixed: every Sensei clip (lines, words, story pages, held onsets, pure sounds,
// slow words) must have been recorded after the switch to Erinome (playtest/.erinome-switch-epoch, 27 Sep 09:33).
// A mixed build would play two different voices. Used by scripts/preview.sh; `--list` prints what's still old.
// DON'T bypass this to get a ship out: finish the re-record (the revoice-erinome workflow) instead.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { LINES } from "../../src/content/lines";

const EPOCH_FILE = "playtest/.erinome-switch-epoch";
if (!existsSync(EPOCH_FILE)) process.exit(0); // no voice switch in progress
const epoch = Number(readFileSync(EPOCH_FILE, "utf8").trim()) * 1000;
const old: string[] = [];
const check = (f: string) => { if (existsSync(f) && statSync(f).mtimeMs < epoch) old.push(f); };

for (const l of LINES as { id: string; who?: string }[]) if (l.who !== "baron") check(`public/a/l/${l.id}.mp3`);
for (const dir of ["public/a/w", "public/a/o", "public/a/p", "public/a/x"])
  if (existsSync(dir)) for (const n of readdirSync(dir)) if (n.endsWith(".mp3")) check(`${dir}/${n}`);
// story pages: Baron's pages keep their voice; the rest are Sensei's
const baronPages = new Set<string>();
try {
  const { STORIES } = await import("../../src/content/stories");
  for (const st of STORIES as any[]) for (const p of st.pages ?? []) if (p.who === "baron") baronPages.add(`${st.id}_${p.id}`);
} catch {}
if (existsSync("public/a/s")) for (const n of readdirSync("public/a/s")) if (n.endsWith(".mp3") && !baronPages.has(n.replace(/\.mp3$/, ""))) check(`public/a/s/${n}`);

if (process.argv.includes("--list")) for (const f of old) console.log(f);
if (old.length) {
  console.error(`✗ Sensei's voice is mixed: ${old.length} clips are still the old voice (recorded before the Erinome switch).`);
  console.error("  Don't ship a mixed voice. Finish the re-record (revoice-erinome), then ship. `bun scripts/ops/check-voice.ts --list` lists them.");
  process.exit(1);
}
console.log("✓ Sensei's voice is consistent (all Erinome)");
