// Picture reading v2: the word clips for the compound bank's new words (src/content/compounds.ts NEW_WORDS, not the
// gag pictures), made exactly as scripts/gen-audio.ts's word path makes a word (it only makes words in its content
// lists, and ORAL_WORDS is in an existing file): Sensei's voice (Erinome, en-GB, as gen-audio's VOICES.sensei since
// 27 Sep), "<word>." as plain text, finishAudio (−16 LUFS, −1.5 dBTP), the judge's rubric ≥ 8, Gemini's blind word
// (no target given) and the pitch gate (median F0 140–290 Hz), up to 6 takes, the best kept. New files only: a clip
// already in public/a/w is never replaced. Report: playtest/read-slider/audio/words.json.
//   doppler run -p os-legacy-2026-04 -c dev -- bun playtest/read-slider/audio/words.ts [word...]
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tts, finishAudio, judgeAudio, checkLoudness } from "../../../scripts/tts";
import { generate, pool, textOf } from "../../../scripts/gemini";
import { NEW_WORDS } from "../../../src/content/compounds";

const ROOT = join(import.meta.dir, "../../..");
const VOICE = "Erinome";
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const words = Object.entries(NEW_WORDS).filter(([w, o]) => !o.gag && (!only.length || only.includes(w))).map(([w]) => w);
const REPORT = join(import.meta.dir, "words.json");
const report: Record<string, unknown> = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : {};
const TMP = join(ROOT, "playtest/runs/read-slider/word-takes");
mkdirSync(TMP, { recursive: true });

async function blind(file: string): Promise<string> {
  const r = await generate("gemini-3.8-flash", { contents: [{ parts: [
    { inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } },
    { text: `Transcribe this single spoken English word (British accent). Reply JSON only: {"word": "<the word, lowercase>"}` },
  ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  try {
    return String(JSON.parse(textOf(r)).word).toLowerCase().replace(/[^a-z]/g, "");
  } catch {
    return "?";
  }
}
const pitch = (f: string) => parseFloat(execFileSync("uv", ["run", "-q", "--with", "numpy", "python", join(ROOT, "scripts/pitch.py"), f]).toString()) || 0;

await pool(words, 4, async (w) => {
  const out = join(ROOT, `public/a/w/${w}.mp3`);
  if (existsSync(out)) return void console.log("·", w, "exists");
  const rubric = `The clip must be ONE English word, "${w}", said clearly and naturally ONCE in a Southern British accent, as a teacher would say it to a 5-year-old. Score 10 if it is exactly the word "${w}" (British pronunciation), nothing else. Score low for a different word, a letter name, extra words, American accent, or repeats.`;
  let best: { score: number; tmp: string; heard: string; judge: number; blind: string; hz: number } | null = null;
  for (let k = 0; k < 6; k++) {
    const wav = await tts({ text: `${w}.`, voice: VOICE });
    const tmp = join(TMP, `${w}.try${k}.mp3`);
    finishAudio(wav, tmp);
    const r = await judgeAudio(tmp, rubric);
    const b = await blind(tmp);
    const hz = pitch(tmp);
    const blindOk = b === w;
    const pitchOk = hz === 0 || (hz >= 140 && hz <= 290);
    const score = r.score + (blindOk ? 10 : 0) - (pitchOk ? 0 : 6);
    if (!best || score > best.score) best = { score, tmp, heard: r.heard, judge: r.score, blind: b, hz };
    if (r.score >= 8 && blindOk && pitchOk) break;
  }
  execFileSync("cp", [best!.tmp, out]);
  const loud = checkLoudness(out);
  report[w] = { judge: best!.judge, heard: best!.heard, blind: best!.blind, hz: best!.hz, lufs: loud.lufs, voice: VOICE };
  console.log(best!.judge >= 8 && best!.blind === w ? "✓" : "⚠", w, JSON.stringify(report[w]));
});
writeFileSync(REPORT, JSON.stringify(report, null, 1));
console.log("done");
