// Review a render like a film editor: bun scripts/trailer/review.ts [--no-listen] [--file=public/media/trailer.mp4]
// → assets-src/trailer/review/contact-<name>.jpg (one frame per shot, in order), strip-<name>.jpg (1 frame/second),
//   timeline.txt (shot starts), listen.md (Gemini's timestamped description of the mix).
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import cfg from "../../trailer/trailer.config";
import { duration, ensureDir, ffmpeg, geminiKey, layout, log, p } from "./lib";

const args = process.argv.slice(2);
const file = p(args.find((a) => a.startsWith("--file="))?.slice(7) ?? "public/media/trailer.mp4");
const name = basename(file, ".mp4");
const dir = ensureDir(p("assets-src/trailer/review"));
const shots = layout(cfg);
const vertical = name.includes("vertical");

// one frame from the middle of each shot, tiled 6 across
const tw = vertical ? 216 : 384, th = vertical ? 384 : 216;
const frames = shots.map((s, i) => {
  const f = join(dir, `f-${name}-${String(i).padStart(2, "0")}.jpg`);
  ffmpeg(["-ss", ((s.start + s.end) / 2).toFixed(3), "-i", file, "-frames:v", "1", "-vf", `scale=${tw}:${th}`, "-q:v", "3", f]);
  return f;
});
const cols = vertical ? 10 : 6;
const rows = Math.ceil(frames.length / cols);
ffmpeg([...frames.flatMap((f) => ["-i", f]), "-filter_complex", `${frames.map((_, i) => `[${i}]`).join("")}xstack=inputs=${frames.length}:layout=${frames.map((_, i) => `${(i % cols) * tw}_${Math.floor(i / cols) * th}`).join("|")}:fill=black`, "-q:v", "3", join(dir, `contact-${name}.jpg`)]);
const d = duration(file);
ffmpeg(["-i", file, "-vf", `fps=1,scale=${vertical ? 108 : 240}:-2,tile=${vertical ? 16 : 10}x${Math.ceil(d / (vertical ? 16 : 10))}`, "-frames:v", "1", "-q:v", "3", join(dir, `strip-${name}.jpg`)]);
writeFileSync(join(dir, "timeline.txt"), shots.map((s, i) => `${String(i).padStart(2)} ${s.start.toFixed(2).padStart(6)}s  ${s.dur.toFixed(2)}s  ${s.id}`).join("\n") + "\n");
log(`contact sheet: assets-src/trailer/review/contact-${name}.jpg (rows of ${cols}, shot order), strip: strip-${name}.jpg`);

if (!args.includes("--no-listen")) {
  const mp3 = join(dir, `${name}.mp3`);
  ffmpeg(["-i", file, "-vn", "-ac", "2", "-b:a", "160k", mp3]);
  const prompt = `You are a trailer sound supervisor. This is the full audio of a ${d.toFixed(0)}-second movie-style trailer for a children's phonics video game (British English). Listen very carefully and describe it with timestamps (mm:ss) every 2-4 seconds: what music is playing (instruments, intensity 1-10), every spoken line verbatim with who seems to speak (female mentor / villain / narrator), and sound effects (booms, risers, whooshes). Then assess: (1) does the music build to a crescendo and does the intensity escalate over the trailer? (2) are any voice lines hard to hear, clipped, overlapping or masked by music? (3) any clicks, abrupt awkward cuts, silence gaps that feel like mistakes, distortion? (4) is the loudness balance good? Be specific and critical with timestamps.`;
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
    method: "POST",
    headers: { "x-goog-api-key": geminiKey(), "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: "audio/mp3", data: readFileSync(mp3).toString("base64") } }, { text: prompt }] }], generationConfig: { temperature: 0.2 } }),
  });
  const json: any = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? JSON.stringify(json).slice(0, 500);
  writeFileSync(join(dir, `listen-${name}.md`), text);
  log(`listening notes: assets-src/trailer/review/listen-${name}.md`);
}
