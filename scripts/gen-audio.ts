// Generate all speech: words, special words, lines, story pages. Each clip is judged; bad takes are retried.
// Usage: bun scripts/gen-audio.ts [words|lines|stories]...  (skips existing files; --force to redo)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { WORDS, SPECIAL_WORDS, ORAL_WORDS } from "../src/content/phonics";
import { LINES } from "../src/content/lines";
import { STORIES } from "../src/content/stories";
import { tts, finishAudio, judgeAudio } from "./tts";
import { pool, generate, textOf } from "./gemini";

export const VOICES = { sensei: "Sulafat", baron: "Algenib" } as const;
const args = process.argv.slice(2);
const force = args.includes("--force");
const kinds = args.filter((a) => !a.startsWith("--"));
const want = (k: string) => !kinds.length || kinds.includes(k);

// Isolated special words that TTS would otherwise read as letter names
const SAY: Record<string, string> = { fin: "Fin!", sniff: "Sniff!", hum: "Hum!", huff: "Huff!", a: "uh.", I: "I.", the: "the.", to: "to.", of: "of.", said: "said.", was: "was." };

interface Job { out: string; text: string; voice: string; rubric: string; blindWord?: string }
const jobs: Job[] = [];
const fileId = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_");

// every word a child can tap in a story needs a clip too
const storyTokens = STORIES.flatMap((st) => st.pages.flatMap((p) => (p.kind === "read" ? p.text.split(/\s+/) : p.kind === "choice" ? p.options.map((o) => o.word) : [])))
  .map((t) => t.replace(/[^A-Za-z']/g, ""))
  .filter(Boolean)
  .map((t) => (t === "I" || /^[A-Z]/.test(t) && !["It", "The", "A", "He", "Tip", "Run", "Get", "Hop", "Yuk", "Kick", "Tap", "Jam", "Drift", "Frog"].includes(t) ? t : t.toLowerCase()));
const HOMOPHONES: Record<string, string[]> = { to: ["two", "too"], I: ["eye", "i"], bee: ["be"], sea: ["see", "c"], be: ["bee"], tea: ["tee", "t"], they: [], a: ["uh", "a"], high: ["hi"], knight: ["night"], night: ["knight"], witch: ["which"], which: ["witch"], tail: ["tale"], pie: [], tie: [], seat: [], blew: [] };
async function blindWord(file: string, w: string): Promise<boolean> {
  const r = await generate("gemini-3.8-flash", { contents: [{ parts: [
    { inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } },
    { text: `Transcribe this single spoken English word (British accent). Reply JSON only: {"word": "<the word, lowercase>"}` },
  ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  try {
    const got = String(JSON.parse(textOf(r)).word).toLowerCase().replace(/[^a-z]/g, "");
    return got === w.toLowerCase() || (HOMOPHONES[w] ?? []).includes(got);
  } catch {
    return false;
  }
}
const FORCE_WORDS = new Set((process.env.WORDS ?? "").split(",").filter(Boolean));

if (want("words")) {
  for (const w of [...new Set([...WORDS.map((w) => w.text), ...SPECIAL_WORDS, ...storyTokens, ...Object.keys(ORAL_WORDS)])]) {
    const say = SAY[w] ?? `${w}.`;
    jobs.push({
      out: `public/a/w/${fileId(w)}.mp3`, text: say, voice: VOICES.sensei, blindWord: w,
      rubric: `The clip must be ONE English word, "${w}", said clearly and naturally ONCE in a Southern British accent, as a teacher would say it to a 5-year-old. Score 10 if it is exactly the word "${w}" (British pronunciation), nothing else. Score low for a different word, a letter name, extra words, American accent, or repeats.`,
    });
  }
}
if (want("lines")) {
  for (const l of LINES) {
    jobs.push({
      out: `public/a/l/${l.id}.mp3`, text: l.text, voice: VOICES[l.who ?? "sensei"],
      rubric: `The clip should be a British-accented voice reading exactly this script, expressively, with nothing added or missed: "${l.text}". Score 10 if it matches the script exactly with a natural British accent. Score low if words are missing/added, if it reads stage directions or instructions aloud, or if the accent is not British.`,
    });
  }
}
if (want("stories")) {
  for (const st of STORIES) {
    for (const p of st.pages) {
      const who = p.kind === "narr" ? p.who ?? "sensei" : "sensei";
      const text = p.kind === "choice" || p.kind === "question" ? p.text : p.text;
      jobs.push({
        out: `public/a/s/${st.id}_${p.id}.mp3`, text, voice: VOICES[who],
        rubric: `The clip should be a warm British storyteller reading exactly: "${text}". Score 10 if every word matches with a natural British accent and expressive storytelling. Score low for missing/added words or non-British accent.`,
      });
    }
    jobs.push({
      out: `public/a/s/${st.id}_title.mp3`, text: `${st.title}.`, voice: VOICES.sensei,
      rubric: `The clip should be a British voice saying the story title: "${st.title}". Score 10 if exact.`,
    });
  }
}

const todo = jobs.filter((j) => force || !existsSync(j.out) || (j.blindWord && FORCE_WORDS.has(j.blindWord)));
console.log(`${todo.length} clips to generate of ${jobs.length}`);
const LOG = "assets-src/audio-report.json";
const report: Record<string, any> = existsSync(LOG) ? JSON.parse(readFileSync(LOG, "utf8")) : {};
let done = 0;

await pool(todo, 10, async (j) => {
  let best: { score: number; wav: Buffer; heard: string } | null = null;
  for (let attempt = 0; attempt < (j.blindWord ? 6 : 4); attempt++) {
    const wav = await tts({ text: j.text, voice: j.voice });
    const tmp = j.out.replace(/\.mp3$/, `.try${attempt}.mp3`).replace("public/a/", "assets-src/tmp/");
    finishAudio(wav, tmp);
    const r = await judgeAudio(tmp, j.rubric);
    // words must ALSO be recognised blind (without telling the judge the target)
    const blindOk = j.blindWord ? await blindWord(tmp, j.blindWord) : true;
    const hz = j.blindWord ? parseFloat(execFileSync("uv", ["run", "--with", "numpy", "python", "scripts/pitch.py", tmp]).toString()) || 0 : 0;
    const pitchOk = !j.blindWord || hz === 0 || (hz >= 140 && hz <= 290);
    const score = r.score + (blindOk ? 10 : 0) - (pitchOk ? 0 : 6);
    if (!best || score > best.score) best = { score, wav, heard: r.heard + (blindOk ? "" : " [blind✗]") };
    if (r.score >= 8 && blindOk && pitchOk) break;
  }
  if (j.blindWord) best!.score -= 10;
  finishAudio(best!.wav, j.out);
  report[j.out] = { score: best!.score, heard: best!.heard, text: j.text };
  done++;
  if (best!.score < 8) console.log("⚠", j.out, best!.score, best!.heard);
  if (done % 25 === 0) {
    console.log(`${done}/${todo.length}`);
    writeFileSync(LOG, JSON.stringify(report, null, 1));
  }
});
writeFileSync(LOG, JSON.stringify(report, null, 1));
console.log("done");
