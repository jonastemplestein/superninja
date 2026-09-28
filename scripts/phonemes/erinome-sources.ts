// Renders the Erinome source takes for the pure sounds (27 Sep: Sensei is now Erinome; docs/DECISIONS.md).
// Every text in scripts/phonemes/erinome-plan.json (isolated sounds like "sss", and carrier words like "hop."), TAKES
// takes each (default 2), as the raw 24 kHz wav Gemini returns (no trimming, no levelling: the cutter needs the
// untouched signal). Existing takes are kept, so a rerun only fills gaps; TAKES=4 adds takes 3 and 4.
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/phonemes/erinome-sources.ts [ids...] [--texts "a.,b."]
// Writes playtest/runs/pure-sounds-erinome/src/<slug>.<take>.wav. Plain text only (Gemini TTS reads instructions
// aloud), en-GB. Four requests at a time; gemini.ts backs off on errors (429 included).
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tts } from "../tts";
import { pool } from "../gemini";

const REPO = resolve(import.meta.dir, "../..");
const OUT = join(REPO, "playtest/runs/pure-sounds-erinome/src");
const VOICE = "Erinome";
const plan = JSON.parse(readFileSync(join(import.meta.dir, "erinome-plan.json"), "utf8")).sounds as Record<string, [string, string][]>;

export const slug = (t: string) =>
  [...t].map((c) => (/[A-Za-z0-9]/.test(c) ? c : c === "." ? "_d" : c === "!" ? "_x" : c === "?" ? "_q" : c === " " ? "-" : `_u${c.codePointAt(0)!.toString(16)}`)).join("");

if (import.meta.main) {
  const args = process.argv.slice(2);
  const ti = args.indexOf("--texts");
  const extra = ti >= 0 ? args.splice(ti, 2)[1].split(",").filter(Boolean) : [];
  const ids = args.length ? args : extra.length ? [] : Object.keys(plan);
  const TAKES = Number(process.env.TAKES ?? 2);
  mkdirSync(OUT, { recursive: true });
  const texts = [...new Set([...ids.flatMap((id) => (plan[id] ?? []).map(([t]) => t)), ...extra])];
  const jobs = texts.flatMap((text) => Array.from({ length: TAKES }, (_, t) => ({ text, file: join(OUT, `${slug(text)}.${t + 1}.wav`) })))
    .filter((j) => !existsSync(j.file));
  console.log(`${texts.length} texts, ${jobs.length} takes to render`);
  let done = 0;
  await pool(jobs, 4, async ({ text, file }) => {
    const wav = await tts({ text, voice: VOICE, lang: "en-GB" });
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, wav);
    renameSync(tmp, file);
    if (++done % 20 === 0) console.log(`${done}/${jobs.length}`);
  });
  console.log("done", done);
}
