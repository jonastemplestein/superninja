// Generate pure phoneme clips: every TTS candidate x takes, judged by Gemini listening; keep the best.
// Output: public/a/p/<id>.mp3 and assets-src/phonemes/report.json
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PHONEMES, type PhonemeId } from "../src/content/phonics";
import { tts, finishAudio, durationOf } from "./tts";
import { pool, generate, textOf } from "./gemini";

export const TEACHER_VOICE = "Sulafat";
const TAKES = Number(process.env.TAKES ?? 2);
const DIR = "assets-src/phonemes";
const REPORT = `${DIR}/report.json`;
mkdirSync(DIR, { recursive: true });
mkdirSync("public/a/p", { recursive: true });

const only = process.argv.slice(2) as PhonemeId[];
const ids = (only.length ? only : Object.keys(PHONEMES)) as PhonemeId[];
const report: Record<string, any[]> = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : {};

const jobs = ids.flatMap((id) => PHONEMES[id].tts.flatMap((spelling, si) => Array.from({ length: TAKES }, (_, t) => ({ id, spelling, si, t }))));

await pool(jobs, 8, async ({ id, spelling, si, t }) => {
  const f = `${DIR}/${id}/${si}_${t}.mp3`;
  if (report[id]?.some((r) => r.file === f && r.blind)) return;
  const wav = await tts({ text: spelling, voice: TEACHER_VOICE });
  finishAudio(wav, f, { pad: 0.02 });
  const dur = durationOf(f);
  const j = await blindScore(f, id);
  // natural teacher voice: penalise squeaky / growly takes (speaking pitch for this voice is ~170-260 Hz)
  const hz = pitchOf(f);
  if (hz > 0 && (hz > 290 || hz < 140)) j.score = Math.max(0, j.score - 8);
  (j as any).hz = Math.round(hz);
  report[id] = (report[id] ?? []).filter((r) => r.file !== f);
  report[id].push({ file: f, spelling, dur, blind: true, ...j });
  console.log(id.padEnd(3), JSON.stringify(spelling).padEnd(22), dur.toFixed(2), (j as any).hz + "Hz", j.score, j.heard);
});

function pitchOf(f: string): number {
  const out = execFileSync("uv", ["run", "--with", "numpy", "python", "scripts/pitch.py", f]).toString();
  return parseFloat(out) || 0;
}

// ---- blind judging: the judge is NOT told the target; a take scores only if it is identified correctly
async function blindScore(file: string, id: PhonemeId) {
  const ph = PHONEMES[id];
  const norm = (x: string) => (x ?? "").replace(/[\/\[\]ːˑ.ʰ̥ ]/g, "").replace(/ɡ/g, "g").replace(/r/g, "ɹ").replace(/ɛ/g, "e").replace(/^a$/g, "æ");
  let total = 0;
  const heard: string[] = [];
  for (let k = 0; k < 2; k++) {
    const r = await generate("gemini-3.8-flash", {
      contents: [{ parts: [
        { inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } },
        { text: `This is one speech sound recorded for a British phonics game. Without any other context, identify exactly what you hear. Reply JSON only: {"ipa": "<IPA of everything you hear>", "addedVowel": <true if a schwa/'uh' or other vowel follows a consonant>, "isLetterName": <true if it sounds like an alphabet letter NAME (e.g. 'see', 'bee', 'jay', 'ar')>, "clarity": <0-10>}` },
      ] }],
      generationConfig: { responseMimeType: "application/json", temperature: k ? 0.7 : 0 },
    });
    try {
      const o = JSON.parse(textOf(r));
      heard.push(o.ipa);
      const got = norm(o.ipa);
      const ok = got === norm(ph.ipa) || (ph.id === "w" && /^w(ʊ|u)?$/.test(got)) || (ph.id === "y" && /^j(ɪ|i)?$/.test(got)) || (ph.id === "a" && /^(æ|a)$/.test(got));
      total += ok ? 10 - (o.addedVowel ? 4 : 0) - (o.isLetterName ? 6 : 0) + (o.clarity ?? 5) / 10 : 0;
    } catch {}
  }
  return { score: +(total / 2).toFixed(1), heard: heard.join(" | ") };
}

// choose winners: highest score, prefer sensible durations
const summary: any[] = [];
for (const id of ids) {
  // objective check: a pure vowel is ONE part. Letter names read as sounds ("ie" → "eye-ee") have two (scripts/syllables.py)
  const onePart = (f: string) => PHONEMES[id].vowel ? execFileSync("uv", ["run", "-q", "--with", "numpy", "python", "scripts/syllables.py", f]).toString().trim() === "1" : true;
  const cands = (report[id] ?? []).filter((r) => r.blind && existsSync(r.file) && onePart(r.file)).slice().sort((a, b) => b.score - a.score || Math.abs(a.dur - 0.7) - Math.abs(b.dur - 0.7));
  const best = cands[0];
  if (!best || best.score <= 0) {
    console.log("⚠ no take identified correctly for", id, "— keeping previous clip");
    summary.push({ id, score: 0, spelling: "-", dur: "-", heard: best?.heard ?? "" });
    continue;
  }
  copyFileSync(best.file, `public/a/p/${id}.mp3`);
  summary.push({ id, score: best.score, spelling: best.spelling, dur: best.dur.toFixed(2), hz: best.hz, heard: best.heard });
}
writeFileSync(REPORT, JSON.stringify(report, null, 1));
console.table(summary);
