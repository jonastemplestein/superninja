import { generate, inlineParts, pool } from "./gemini";
import { finishAudio, judgeAudio, durationOf } from "./tts";
const variants: Record<string, (w: string, d: string) => any> = {
  sys: (w, d) => ({ systemInstruction: { parts: [{ text: `You are a British reception teacher teaching synthetic phonics. Voice ONLY the transcript. It is a single pure phonics sound: ${d}. No schwa, no letter name, nothing else.` }] }, contents: [{ parts: [{ text: w }] }] }),
  short: (w, d) => ({ contents: [{ parts: [{ text: `Say purely, no added vowel: ${w}` }] }] }),
  plain: (w, d) => ({ contents: [{ parts: [{ text: w }] }] }),
  tag: (w, d) => ({ contents: [{ parts: [{ text: `[whispering phonics sound, British] ${w}` }] }] }),
};
const S = [["m","mmmmm","/m/ as in map, humming"],["t","t","/t/ as in top, a tiny unvoiced tap"],["w","wwoo","/w/ said 'wwoo' as in wet"],["s","sssss","/s/ as in sun"]];
await pool(S.flatMap(s => Object.keys(variants).map(v => ({s, v}))), 8, async ({s:[id,w,d], v}) => {
  const body = variants[v](w, d);
  const json = await generate("gemini-3.8-flash-tts", { ...body, generationConfig: { responseModalities: ["AUDIO"], speechConfig: { languageCode: "en-GB", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Sulafat" } } } } });
  const a = inlineParts(json)[0]; const f = `assets-src/phoneme-exp2/${id}_${v}.mp3`;
  finishAudio(a.data, f);
  const j = await judgeAudio(f, `Should contain ONLY the pure phonics sound ${d}. 10 = exactly that pure sound, nothing else, no schwa.`);
  console.log(id, v, durationOf(f).toFixed(2), j.score, j.heard, "|", j.notes);
});
