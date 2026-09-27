// A listening judge for delivery (Gemini audio, the one tts.ts uses): warmth, pace, shouting, naturalness and letter names,
// for ranking the takes to do again. Lenient on shouting (TEACHER_SCRIPT §7.4), so it ranks, it doesn't gate.
//   doppler run -p os-legacy-2026-04 -c dev -- bun playtest/voice/judge.ts [--ids a,b] [--out playtest/voice/judge.json] [--dir d]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generate, pool, textOf } from "../../scripts/gemini";

const ROOT = join(import.meta.dir, "../..");
const args = process.argv.slice(2);
const argOf = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const texts: Record<string, string> = JSON.parse(readFileSync(join(import.meta.dir, "texts.json"), "utf8"));
const ids = argOf("--ids")?.split(",") ?? Object.keys(texts);
const out = argOf("--out") ?? join(import.meta.dir, "judge.json");
const prev: Record<string, unknown> = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
const dir = argOf("--dir") ?? join(ROOT, "public/a/l");

const res: Record<string, unknown> = { ...prev };
await pool(ids.filter((i) => existsSync(join(dir, `${i}.mp3`))), 12, async (id) => {
  const text = texts[id];
  const lead = text.trim().endsWith("...");
  const r = await generate("gemini-3.8-flash", { contents: [{ parts: [
    { inlineData: { mimeType: "audio/mp3", data: readFileSync(join(dir, `${id}.mp3`)).toString("base64") } },
    { text: `You are a Reception teacher and voice director judging one line spoken by Sensei, a warm British teacher in a phonics game for 3-to-5-year-olds. The script is: "${text}"${lead ? " (it is a lead-in: a pure sound or a word is joined straight after it, so it should end suspended, as if about to go on)" : ""}.
Reply JSON only: {"exact": <true if every word matches the script>, "warmth": <0-10>, "pace": <0-10, 10 = unhurried and easy for a 3-year-old to follow, low = rushed or dragging>, "natural": <0-10, low if robotic, processed or time-stretched>, "shouted": <true if any word is barked or shouted>, "letter_names": <true if any letter name is spoken>, "ending": "${lead ? "suspended|falling|clipped|noise" : "n/a"}", "notes": "<short>"}` },
  ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  try { res[id] = JSON.parse(textOf(r)); } catch { res[id] = { error: textOf(r).slice(0, 200) }; }
});
writeFileSync(out, JSON.stringify(res, null, 1) + "\n");
console.log(`judged ${ids.length} → ${out}`);
