// Ask Gemini for a second opinion on a contact sheet or a set of images.
// Run: doppler run -p os-legacy-2026-04 -c dev -- bun assets-src/world-flower/judge.ts "<question>" img1 [img2 ...]
import { generate, textOf, fileToPart } from "../../scripts/gemini";
const [q, ...files] = process.argv.slice(2);
const r = await generate(process.env.JUDGE_MODEL ?? "gemini-3.8-flash", {
  contents: [{ parts: [...files.map(fileToPart), { text: q }] }],
  generationConfig: { temperature: 0.2 },
});
console.log(textOf(r));
