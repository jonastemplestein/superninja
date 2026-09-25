// Stretched ("elastic") word recordings for modelling, the Sounds~Write way: continuant sounds are held
// (mmmaaat, sssuuunnn), stop sounds are quick. Output public/a/x/<word>.mp3. Each take is judged; retries if bad.
import { existsSync } from "node:fs";
import { WORD_BY_TEXT, PHONEMES } from "../src/content/phonics";
import { tts, finishAudio, judgeAudio } from "./tts";
import { pool } from "./gemini";

export const STRETCH_WORDS = [
  "sun", "mat", "fan", "man", "dog", "bus", "cup", "hat", "map", "mop", "mug", "milk", "sock", "sand", "sit", "sat", "am", "at", "it", "an", "in", "on",
  "ant", "tap", "tin", "top", "tent", "tub", "fin", "pin", "pan", "lid", "pig", "cat", "wig", "bin", "bag", "zip", "jam", "pot", "cot", "hot", "log", "leg", "fox", "van",
  "nap", "not", "net", "nut", "nest", "pen", "peg", "pup", "tip", "pit", "pat", "tan", "sip", "nip", "pop",
];
const HOLD = new Set(["m", "n", "s", "f", "v", "z", "l", "r", "sh", "th", "dh", "ng", "a", "e", "i", "o", "u"]);
function stretchText(w: string) {
  const word = WORD_BY_TEXT[w];
  if (!word) return w;
  return word.segs.map((s) => (HOLD.has(s.p) ? s.g.repeat(3) : s.g)).join("");
}
await pool(STRETCH_WORDS, 8, async (w) => {
  const out = `public/a/x/${w}.mp3`;
  if (existsSync(out)) return;
  const text = stretchText(w);
  let best: { score: number; wav: Buffer } | null = null;
  for (let i = 0; i < 4; i++) {
    const wav = await tts({ text });
    const tmp = `assets-src/tmp/x_${w}_${i}.mp3`;
    finishAudio(wav, tmp);
    const r = await judgeAudio(tmp, `The clip must be the single English word "${w}" said SLOWLY by a British teacher, stretching the sounds that can be held (like "${text}") as ONE continuous word with no gaps between sounds and no added "uh". Score 10 if it is clearly "${w}", stretched and smooth; low if it's a different word, has pauses between sounds, letter names, or extra words.`);
    if (!best || r.score > best.score) best = { score: r.score, wav };
    if (r.score >= 8) break;
  }
  finishAudio(best!.wav, out);
  console.log(best!.score >= 8 ? "✓" : "⚠", w, text, best!.score);
});
void PHONEMES;
