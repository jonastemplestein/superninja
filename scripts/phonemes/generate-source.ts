// Generate the unstressed schwa carrier. All other carriers already exist in public/a/w.
import { writeFileSync, mkdirSync } from "node:fs";
import { tts, finishAudio } from "../tts";

const dir = "assets-src/phonemes";
mkdirSync(dir, { recursive: true });
const wav = await tts({ text: "Sofa.", voice: "Sulafat", lang: "en-GB" });
writeFileSync(`${dir}/sofa.wav`, wav);
finishAudio(wav, `${dir}/sofa.mp3`);
