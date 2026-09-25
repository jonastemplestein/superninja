import { pool } from "./gemini";
import { tts, finishAudio, judgeAudio } from "./tts";
const voices = ["Sulafat","Achird","Vindemiatrix","Aoede","Leda","Autonoe","Gacrux","Iapetus","Sadaltager","Algenib","Charon","Puck"];
const line = "Hello, little ninja! Oh no, Baron Muddle has blown all the sounds off the Blossom Tree. Can you help Mum find the red bus? Listen carefully: c... a... t. Cat! Brilliant!";
await pool(voices, 6, async (v) => {
  const f = `assets-src/voice-test/${v}.mp3`;
  finishAudio(await tts({ text: line, voice: v }), f);
  const j = await judgeAudio(f, `Rate how authentically SOUTHERN BRITISH (standard southern British / RP, like a CBeebies presenter) the accent is, and how warm, clear and child-friendly the delivery is for 4-7 year olds. Also check the isolated sounds 'c... a... t' are pure (no 'uh'). 10 = perfect British CBeebies-quality narrator; low if American or other accent, flat, or unclear. In notes mention perceived gender/age and accent.`);
  console.log(v.padEnd(14), j.score, "|", j.notes);
});
