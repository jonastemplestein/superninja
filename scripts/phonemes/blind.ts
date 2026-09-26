// Weak third signal only. Acoustic QA and the listening page remain authoritative.
import { readFileSync, writeFileSync } from "node:fs";
import { generate, textOf, pool } from "../gemini";

const recipes = JSON.parse(readFileSync("playtest/phonemes/recipes.json", "utf8"));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(recipes);
const results: Record<string, unknown> = await Bun.file("playtest/phonemes/gemini-blind.json").exists()
  ? JSON.parse(readFileSync("playtest/phonemes/gemini-blind.json", "utf8")) : {};
await pool(ids, 4, async (id: string) => {
  const audio = readFileSync(`playtest/phonemes/candidates/${id}.mp3`).toString("base64");
  try {
    const response = await generate("gemini-3.8-flash", {
      contents: [{ parts: [
        { inlineData: { mimeType: "audio/mp3", data: audio } },
        { text: "Listen blind to this very short British speech clip. Transcribe the whole audible sound in IPA and plain English. Does it contain an alphabet letter name, an added vowel, or a recognisable word? Answer JSON only: {\"ipa\":\"...\",\"heard\":\"...\",\"letterName\":true/false,\"extraVowel\":true/false,\"word\":true/false,\"notes\":\"...\"}. If it is too short to recognise, say so. No target sound is supplied." },
      ] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    });
    results[id] = JSON.parse(textOf(response));
  } catch (error) {
    results[id] = { error: String(error) };
  }
  console.log(id, JSON.stringify(results[id]));
  writeFileSync("playtest/phonemes/gemini-blind.json", JSON.stringify(results, null, 2) + "\n");
});
