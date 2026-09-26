// Stretched ("elastic") word recordings for modelling, the Sounds~Write way: continuant sounds are held
// (mmmaaat, sssuuunnn), stop sounds are quick. Output public/a/x/<word>.mp3. Each take is judged; retries if bad.
//   bun scripts/gen-stretch.ts            the stretched words (src/content/stretch.ts STRETCH_WORDS) → public/a/x/
//   bun scripts/gen-stretch.ts --onset    held first sounds ("sssun", "mmmoon": ONSET_WORDS) → public/a/o/
// Existing clips are skipped; WORDS=a,b re-records those. Needs APP_CONFIG_GEMINI_API_KEY (Doppler os-legacy-2026-04/dev).
import { existsSync } from "node:fs";
import { WORD_BY_TEXT, ORAL_WORDS, PHONEMES } from "../src/content/phonics";
import { tts, finishAudio, judgeAudio } from "./tts";
import { STRETCH_WORDS, ONSET_WORDS } from "../src/content/stretch";
import { pool } from "./gemini";

const HOLD = new Set(["m", "n", "s", "f", "v", "z", "l", "r", "sh", "th", "dh", "ng", "a", "e", "i", "o", "u"]);
const onsetMode = process.argv.includes("--onset");
const redo = new Set((process.env.WORDS ?? "").split(",").filter(Boolean));

function stretchText(w: string) {
  const word = WORD_BY_TEXT[w];
  if (!word) return w;
  return word.segs.map((s) => (HOLD.has(s.p) ? s.g.repeat(3) : s.g)).join("");
}
/** Only the first sound held, the rest said normally: "sssun", "mmmoon", "fffish". */
function onsetText(w: string) {
  const first = WORD_BY_TEXT[w]?.segs[0].g ?? w[0];
  const p = WORD_BY_TEXT[w]?.segs[0].p ?? ORAL_WORDS[w]?.first;
  if (!p || !HOLD.has(p)) throw new Error(`${w}: its first sound can't be held`);
  return first.repeat(4) + w.slice(first.length);
}

const jobs = (onsetMode ? ONSET_WORDS : STRETCH_WORDS).map((w) => {
  if (onsetMode) {
    const text = onsetText(w);
    return {
      w, text, out: `public/a/o/${w}.mp3`,
      rubric: `The clip must be the single English word "${w}" said by a British teacher with ONLY ITS FIRST SOUND held long (like "${text}": the first sound held for about a second), then the rest of the word said at a normal pace, as ONE continuous word with no gap and no added "uh". Score 10 if it is clearly "${w}" with a long first sound and a normal rest; low if it's a different word, if other sounds are stretched too, if there is a pause, a letter name, or extra words.`,
    };
  }
  const text = stretchText(w);
  return {
    w, text, out: `public/a/x/${w}.mp3`,
    rubric: `The clip must be the single English word "${w}" said SLOWLY by a British teacher, stretching the sounds that can be held (like "${text}") as ONE continuous word with no gaps between sounds and no added "uh". Score 10 if it is clearly "${w}", stretched and smooth; low if it's a different word, has pauses between sounds, letter names, or extra words.`,
  };
});

// takes per word (TAKES=n), and the lowest judge score that is written at all (MIN=n): a doubtful stretched word is
// worse than none (the game then says the plain word), so it is left out and listed for a retry or for removal
const TAKES = Number(process.env.TAKES ?? 4);
const MIN = Number(process.env.MIN ?? 7);
const failed: string[] = [];
await pool([...new Map(jobs.map((j) => [j.w, j])).values()], 8, async ({ w, text, out, rubric }) => {
  if (existsSync(out) && !redo.has(w)) return;
  let best: { score: number; wav: Buffer } | null = null;
  for (let i = 0; i < TAKES; i++) {
    const wav = await tts({ text });
    const tmp = `assets-src/tmp/${onsetMode ? "o" : "x"}_${w}_${i}.mp3`;
    finishAudio(wav, tmp);
    const r = await judgeAudio(tmp, rubric);
    if (!best || r.score > best.score) best = { score: r.score, wav };
    if (r.score >= 8) break;
  }
  if (best!.score < MIN) {
    failed.push(w);
    console.log("✗", w, text, best!.score, "(not written)");
    return;
  }
  finishAudio(best!.wav, out);
  console.log(best!.score >= 8 ? "✓" : "⚠", w, text, best!.score);
});
if (failed.length) console.log(`\nNot written (best take under ${MIN}): ${failed.join(",")}`);
void PHONEMES;
