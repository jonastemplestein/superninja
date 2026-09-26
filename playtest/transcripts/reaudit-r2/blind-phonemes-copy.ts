import { readFileSync } from "node:fs";
import { PHONEMES } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/phonics";
import { generate, textOf, pool } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/gemini";
const rows: any[] = [];
await pool(Object.values(PHONEMES), 8, async (ph) => {
  const j = await generate("gemini-3.8-flash", { contents: [{ parts: [
    { inlineData: { mimeType: "audio/mp3", data: readFileSync(`/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/public/a/p/${ph.id}.mp3`).toString("base64") } },
    { text: `This is a single speech sound recorded for a British phonics game. WITHOUT any context, identify it. Reply JSON only: {"ipa": "<the phoneme(s) you hear>", "addedVowel": <true if an extra schwa/uh or vowel follows a consonant>, "isLetterName": <true if it sounds like the alphabet letter name>, "clarity": <0-10>}` },
  ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  try { rows.push({ id: ph.id, target: ph.ipa, ...JSON.parse(textOf(j)) }); } catch { rows.push({ id: ph.id, target: ph.ipa, err: textOf(j).slice(0, 80) }); }
});
rows.sort((a, b) => a.id.localeCompare(b.id));
console.table(rows);
