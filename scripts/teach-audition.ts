// Audition the teacher-language explanations (src/content/teach.ts) as a child would hear them: render each composed
// Say[] to one audio file (clips + gaps, exactly as the game queues them), then have Gemini listen for awkward joins,
// wrong sounds, accent and tone. Output: assets-src/teach-audition/<name>.mp3 and report.json.
// Usage: doppler run -p os-legacy-2026-04 -c dev -- bun scripts/teach-audition.ts
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const store: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v) };
const t = await import("../src/content/teach");
const { LINES } = await import("../src/content/lines");
const { generate, textOf } = await import("./gemini");

const OUT = "assets-src/teach-audition";
mkdirSync(`${OUT}/tmp`, { recursive: true });
const file = (s: any): string | null =>
  s.line ? `public/a/l/${s.line}.mp3` : s.sound ? `public/a/p/${s.sound}.mp3` : s.word ? `public/a/w/${s.word}.mp3` : null;
const text = (says: any[]) =>
  says.map((s) => (s.line ? LINES.find((l) => l.id === s.line)?.text : s.sound ? `/${s.sound}/` : s.word ? `"${s.word}"` : "")).filter(Boolean).join(" ");

function render(name: string, says: any[]) {
  const parts: string[] = [];
  let i = 0;
  for (const s of says) {
    const f = file(s);
    const out = `${OUT}/tmp/${name}_${i++}.wav`;
    if (f) {
      if (!existsSync(f)) throw new Error(`missing clip ${f}`);
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", f, "-ar", "24000", "-ac", "1", out]);
    } else if (s.gap) execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", `anullsrc=r=24000:cl=mono`, "-t", String(s.gap / 1000), out]);
    else continue;
    parts.push(out);
  }
  writeFileSync(`${OUT}/tmp/${name}.txt`, parts.map((p) => `file '${p.split("/").pop()}'`).join("\n"));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", `${OUT}/tmp/${name}.txt`, "-b:a", "96k", `${OUT}/${name}.mp3`]);
  return `${OUT}/${name}.mp3`;
}

const CASES: [string, any[]][] = [
  ["petal_ae_1", t.introPetal("ae").say],
  ["petal_ae_2", t.introPetal("ae").say],
  ["petal_s_3", (t.introPetal("s"), t.introPetal("s"), t.introPetal("s").say)],
  ["petal_sh", t.introPetal("sh").say],
  ["gem_ai_new", t.newGem({ g: "ai", p: "ae" }, { knownWays: 2 }).say],
  ["gem_igh", t.introGem({ g: "igh", p: "ie" }).say],
  ["gem_ff", t.introGem({ g: "ff", p: "f" }).say],
  ["gem_ck_another", t.introGem({ g: "ck", p: "k" }, { another: true, knownWays: 3 }).say],
  ["same_ae", t.sameSound("ae", [{ g: "ai", p: "ae" }, { g: "ay", p: "ae" }]).say],
  ["can_be", t.canBe("a", "ae")],
  ["say_here", t.sayHere("k")],
  ["visit", t.revisitIntro()],
];

const report: any[] = [];
for (const [name, says] of CASES) {
  const f = render(name, says);
  const intended = text(says);
  const j = await generate("gemini-3.8-flash", {
    contents: [{ parts: [
      { inlineData: { mimeType: "audio/mp3", data: readFileSync(f).toString("base64") } },
      { text: `This clip is a teacher (Southern British English) explaining phonics to a 4-year-old, assembled from separate recordings. Intended words (/x/ = a pure speech sound, e.g. /ae/ as in "rain", /s/ a hissed "sss" with no "uh"): ${intended}\nListen carefully. Reply as JSON {"score": 0-10 (natural, clear, warm, correct), "joins": "any awkward joins, gaps too long or too short, or pitch jumps between clips", "sounds": "are the pure sounds right and clean, with no added 'uh'?", "wrong_words": "anything that doesn't match the intended words", "fix": "one concrete suggestion"}` },
    ] }],
    generationConfig: { responseMimeType: "application/json" },
  });
  const r = JSON.parse(textOf(j));
  report.push({ name, intended, ...r });
  console.log(`${name}: ${r.score}/10 — joins: ${r.joins} | sounds: ${r.sounds} | wrong: ${r.wrong_words}`);
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
