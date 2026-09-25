import { readFileSync } from "node:fs";
import { generate, textOf, pool } from "./gemini";
const files = process.argv.slice(2);
await pool(files, 6, async (f) => {
  const outs: string[] = [];
  for (let k = 0; k < 3; k++) {
    const j = await generate("gemini-3.8-flash", { contents: [{ parts: [
      { inlineData: { mimeType: "audio/mp3", data: readFileSync(f).toString("base64") } },
      { text: `This is one speech sound recorded for a British phonics game. Without any other context, identify exactly what you hear. Reply JSON only: {"ipa": "<IPA>", "addedVowel": <bool>}` },
    ] }], generationConfig: { responseMimeType: "application/json", temperature: k ? 0.8 : 0 } });
    try { const o = JSON.parse(textOf(j)); outs.push(o.ipa + (o.addedVowel ? "+V" : "")); } catch {}
  }
  console.log(f.split("/").pop(), outs.join(" | "));
});
