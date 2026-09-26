// Re-audit round 2: a second opinion on pure-sound clips the joins judge and the blind phoneme pass flagged.
import { judgeAudio } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/tts";
const R = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/public/a/p/";
const target: Record<string, string> = { k: "/k/ as in cat (voiceless velar stop, NOT the letter name 'kay')", b: "/b/ as in bat (NOT the letter name 'bee')", ks: "/ks/ as at the end of box (NOT the letter name 'ex')", w: "/w/ as in wet, with no vowel after it", y: "/j/ as in yes, with no vowel after it", i: "/ɪ/ as in pin", t: "/t/ (control)", p: "/p/ (control)", d: "/d/ (control)", g: "/g/ (control)" };
for (const [id, t] of Object.entries(target)) {
  const rs = [];
  for (let k = 0; k < 2; k++) rs.push(await judgeAudio(R + id + ".mp3", `The clip should be ONE pure speech sound for a Sounds~Write phonics game: ${t}. Transcribe exactly what is said. Score 10 if it is exactly that pure sound, 0 if it is a letter name or has a vowel added.`));
  console.log(id.padEnd(3), rs.map((r) => `${r.score} [${r.heard}] ${r.notes.slice(0, 90)}`).join("  ||  "));
}
