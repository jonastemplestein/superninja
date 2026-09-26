// Pick the take of a joining clip that sounds most natural IN CONTEXT: record N takes of each line id, render the
// explanations that use it with each take, have Gemini judge the joins, keep the best as public/a/l/<id>.mp3.
// Usage: doppler run -p os-legacy-2026-04 -c dev -- bun scripts/teach-takes.ts t_and t_but_in_this_word …
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { tts, finishAudio } from "./tts";
import { generate, textOf } from "./gemini";

const store: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v) };
const t = await import("../src/content/teach");
const { LINES } = await import("../src/content/lines");
const DIR = "assets-src/teach-takes";
mkdirSync(`${DIR}/tmp`, { recursive: true });

// which explanations exercise each joining clip
const CONTEXT: Record<string, () => any[][]> = {
  t_and: () => [t.introPetal("s").say, t.introPetal("ae").say, t.introGem({ g: "ff", p: "f" }).say],
  t_but_in_this_word: () => [t.canBe("a", "ae"), t.canBe("o", "oe")],
  t_this_can_be: () => [t.canBe("a", "ae"), t.canBe("o", "oe")],
  t_same_sound: () => [t.sameSound("ae", [{ g: "ai", p: "ae" }, { g: "ay", p: "ae" }]).say],
  t_diff_spellings_of: () => [t.sameSound("ae", [{ g: "ai", p: "ae" }, { g: "ay", p: "ae" }]).say],
  t_say_it_here: () => [t.sayHere("k"), t.sayHere("sh")],
};
const file = (s: any) => (s.line ? `public/a/l/${s.line}.mp3` : s.sound ? `public/a/p/${s.sound}.mp3` : s.word ? `public/a/w/${s.word}.mp3` : null);
function render(name: string, says: any[]) {
  const parts: string[] = [];
  says.forEach((s, i) => {
    const f = file(s), out = `${DIR}/tmp/${name}_${i}.wav`;
    if (f) execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", f, "-ar", "24000", "-ac", "1", out]);
    else if (s.gap) execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", String(s.gap / 1000), out]);
    else return;
    parts.push(out);
  });
  const list = `${DIR}/tmp/${name}.txt`;
  require("node:fs").writeFileSync(list, parts.map((p) => `file '${p.split("/").pop()}'`).join("\n"));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-b:a", "96k", `${DIR}/${name}.mp3`]);
  return `${DIR}/${name}.mp3`;
}
async function judgeJoins(f: string): Promise<number> {
  const j = await generate("gemini-3.8-flash", {
    contents: [{ parts: [
      { inlineData: { mimeType: "audio/mp3", data: readFileSync(f).toString("base64") } },
      { text: 'This clip was assembled from separate recordings of one British teacher talking to a 4-year-old. Rate ONLY how natural it sounds as one continuous, warm explanation: consistent pitch, energy and room tone across the joins, with no jarring jumps. JSON {"score": 0-10, "worst": "the worst join"}' },
    ] }],
    generationConfig: { responseMimeType: "application/json" },
  });
  return JSON.parse(textOf(j)).score;
}

for (const id of process.argv.slice(2)) {
  const line = LINES.find((l) => l.id === id);
  if (!line || !CONTEXT[id]) { console.log("skip", id); continue; }
  const pub = `public/a/l/${id}.mp3`;
  const takes = existsSync(pub) ? [`${DIR}/${id}_orig.mp3`] : [];
  if (existsSync(pub) && !existsSync(takes[0])) copyFileSync(pub, takes[0]);
  for (let k = 1; k <= 4; k++) {
    const f = `${DIR}/${id}_${k}.mp3`;
    if (!existsSync(f)) finishAudio(await tts({ text: line.text, voice: "Sulafat" }), f);
    takes.push(f);
  }
  let best = { f: "", score: -1 };
  for (const f of takes) {
    copyFileSync(f, pub);
    const scores = [];
    for (const [i, says] of CONTEXT[id]().entries()) scores.push(await judgeJoins(render(`${id}_${f.split("_").pop()!.replace(".mp3", "")}_${i}`, says)));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log(id, f.split("/").pop(), scores.join(","), "→", mean.toFixed(1));
    if (mean > best.score) best = { f, score: mean };
  }
  copyFileSync(best.f, pub);
  console.log(`✓ ${id}: ${best.f.split("/").pop()} (${best.score.toFixed(1)})`);
}
