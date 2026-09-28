// Speech-template pilot: the "before" of Jonas's own example, "Say this word slowly: mat". The game has no such line
// (today's w_say_slowly fallback is Sensei modelling: "Let's say it the slow way… m-a-t", a different speech act), so
// the A/B's "today" side for w_say_slowly is this carrier, recorded as today's lead-in lines are (Erinome, plain text
// ending "...", finishAudio at −16 LUFS), then the plain word clip from /a/w/. 4 takes; the judge's best is kept.
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/pilot/carrier.ts
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import * as T from "../../../scripts/tts";

const OUT = join(import.meta.dir, "carrier");
mkdirSync(OUT, { recursive: true });
const TEXT = "Say this word slowly...";
const RUBRIC =
  `The clip should be a warm, calm British (Southern English) teacher saying exactly "Say this word slowly" to a four-year-old. ` +
  `It is a lead-in that a word clip follows straight after, so it must end cleanly on "slowly", suspended, as if a word is about to follow: ` +
  `score 4 or less if there is any breath, hiss, click or extra sound after it, and 6 or less if it ends on a strongly falling, finished full-stop intonation. Score 10 for a natural, suspended, British delivery.`;
const takes: { f: string; score: number; notes: string }[] = [];
for (let i = 0; i < 4; i++) {
  const f = join(OUT, `take${i}.mp3`);
  T.finishAudio(await T.tts({ text: TEXT, voice: "Erinome" }), f);
  const j = await T.judgeAudio(f, RUBRIC);
  const blip = T.trailingBlip(f);
  takes.push({ f, score: j.score - (blip != null ? 3 : 0), notes: `${j.notes}${blip != null ? ` (trailing sound ${blip} s)` : ""}` });
  console.log(i, j.score, blip, j.notes);
}
const best = takes.sort((a, b) => b.score - a.score)[0];
copyFileSync(best.f, join(OUT, "say_this_word_slowly.mp3"));
console.log("kept", best.f, best.score, best.notes);
