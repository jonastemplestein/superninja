// Experiment: can Gemini TTS produce pure British phonics sounds? Tries strategies x voices, judges each.
import { tts, finishAudio, judgeAudio, durationOf } from "./tts";
import { pool } from "./gemini";

const OUT = "assets-src/phoneme-exp";
const sounds = [
  { id: "m", spoken: "mmmmm", desc: "the continuous sound /m/ (lips closed, humming) held for about a second", as: "m in 'map'" },
  { id: "s", spoken: "sssss", desc: "the continuous hissing sound /s/ held for about a second, unvoiced", as: "s in 'sun'" },
  { id: "t", spoken: "t", desc: "the short, crisp, unvoiced /t/ sound, just a tiny whispered tap of the tongue, no vowel after it", as: "t in 'top'" },
  { id: "a", spoken: "a", desc: "the short vowel /a/ (Southern British English, like 'a' in 'ant', 'cat'), short and clear", as: "a in 'ant'" },
  { id: "p", spoken: "p", desc: "the short unvoiced /p/, a tiny puff of air, no vowel after it", as: "p in 'pig'" },
  { id: "w", spoken: "wwoo", desc: "the phonics sound for w, said the Sounds-Write way as a short 'wwoo' (lips rounded, gliding)", as: "w in 'wet'" },
];
const strategies = {
  teacher: (s: (typeof sounds)[0]) =>
    `You are a warm, clear British reception-class teacher in England teaching synthetic phonics. Say only ONE pure phonics sound: ${s.desc}. It is the sound of ${s.as}. Do NOT add any 'uh' or schwa after it, do not say the letter name, and say nothing else at all:\n\n${s.spoken}`,
  bare: (s: (typeof sounds)[0]) => `Say this single speech sound, clipped and pure, with no vowel added, British English (${s.as}): ${s.spoken}`,
};
const voices = ["Sulafat", "Achird", "Vindemiatrix"];

const jobs = sounds.flatMap((s) => Object.keys(strategies).flatMap((st) => voices.map((v) => ({ s, st, v }))));
const results: any[] = [];
await pool(jobs, 6, async ({ s, st, v }) => {
  const wav = await tts({ text: (strategies as any)[st](s), voice: v });
  const f = `${OUT}/${s.id}_${st}_${v}.mp3`;
  finishAudio(wav, f);
  const j = await judgeAudio(
    f,
    `The clip is supposed to contain ONLY the pure phonics sound for ${s.as}: ${s.desc}. Score 10 if it is exactly that pure sound with no added vowel/schwa and nothing else; score low if there is an added 'uh', a letter name, extra words, or wrong sound.`,
  );
  results.push({ id: s.id, st, v, dur: durationOf(f).toFixed(2), ...j });
  console.log(s.id, st, v, durationOf(f).toFixed(2), j.score, j.heard, "-", j.notes);
});
results.sort((a, b) => a.id.localeCompare(b.id) || b.score - a.score);
console.table(results.map(({ id, st, v, dur, score, heard }) => ({ id, st, v, dur, score, heard })));
