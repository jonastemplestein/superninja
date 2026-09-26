// @treadmill-stage — "one take, or joined?" (docs/FIRST_MINUTES.md §12, check 5): every place where the game splices a
// clip into a sentence (a lead-in, then a pure sound, a stretched or held word, or a word), rebuilt from a transcript
// run's audio log exactly as the child heard it (the clips, with the real gaps), and played to the audio judge. The
// joins are allowed by design; what fails is an AUDIBLE join: a jump in voice, loudness or room sound, or a gap too
// long or too short.
//   bun scripts/treadmill/transcript.ts --only w1-wu1,w1-wu2 --persona perfect      (makes playtest/transcripts/<run>/)
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/treadmill/joins.ts playtest/transcripts/<run> [runDir] [--max 40]
// Writes <transcripts>/joins.json (every join judged) and, given a runDir, <runDir>/joins.json ({ findings }).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { judgeAudio } from "../tts";
import { pool } from "../gemini";
import type { Finding } from "./types";
import { LINES } from "../../src/content/lines";

const [dir, runDir] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!dir) throw new Error("Usage: bun scripts/treadmill/joins.ts <transcriptDir> [runDir] [--max 40]");
const maxArg = process.argv.indexOf("--max");
const MAX = maxArg > 0 ? Number(process.argv[maxArg + 1]) : 40;
const ROOT = join(import.meta.dir, "../..");
const DUR: Record<string, number> = JSON.parse(readFileSync(join(ROOT, "public/a/durations.json"), "utf8"));
const FAST = 4; // transcript.ts plays at ?fast=4 and reports game seconds

type Ev = { t: number; kind: string; text: string; url?: string };
const durOf = (url: string) => (DUR[url.replace(/^\/a\//, "").replace(/\.mp3$/, "")] ?? 800) / 1000;
const spliced = (e: Ev) => ["sound", "word", "stretch", "onset"].includes(e.kind);

/** Each splice: a lead-in line that ends on "..." and the pure sound, word, stretched or held word played straight after
 *  it (less than 0.9 s between them), plus any further spliced clips as close behind. */
const LEAD = new Set(LINES.filter((l) => /\.\.\.$/.test(l.text.trim())).map((l) => l.id));
const lineId = (e: Ev) => e.url?.match(/\/a\/l\/([^/]+)\.mp3/)?.[1];
function sequences(evs: Ev[]): Ev[][] {
  const speech = evs.filter((e) => e.url && e.kind !== "story");
  const out: Ev[][] = [];
  const close = (a: Ev, b: Ev) => b.t - (a.t + durOf(a.url!)) <= 0.9;
  for (let i = 0; i + 1 < speech.length; i++) {
    const lead = speech[i];
    if (lead.kind !== "say" || !LEAD.has(lineId(lead) ?? "") || !spliced(speech[i + 1]) || !close(lead, speech[i + 1])) continue;
    const seq = [lead, speech[i + 1]];
    // (only more spliced clips: a next lead-in is a new join, or a question cut short by an eager tap, which is allowed)
    for (let k = i + 2; k < speech.length && seq.length < 4 && close(seq[seq.length - 1], speech[k]) && spliced(speech[k]); k++) seq.push(speech[k]);
    out.push(seq);
  }
  return out;
}

const files = readdirSync(dir).filter((f) => /^journey-.*\.json$/.test(f));
const seen = new Map<string, { seq: Ev[]; where: string }>();
for (const f of files)
  for (const c of JSON.parse(readFileSync(join(dir, f), "utf8")) as { name: string; events: Ev[] }[])
    for (const seq of sequences(c.events ?? [])) {
      const sig = seq.map((e) => e.url).join(" + ");
      if (!seen.has(sig)) seen.set(sig, { seq, where: c.name });
    }
const todo = [...seen.values()].slice(0, MAX);
console.log(`${seen.size} distinct joins in ${files.join(", ")}; judging ${todo.length}`);

const tmp = join(ROOT, "assets-src/tmp/joins");
mkdirSync(tmp, { recursive: true });
/** The sequence as heard: each clip, then silence for the real gap (clamped to 0-0.9 s). */
function render(seq: Ev[], out: string) {
  const args = ["-hide_banner", "-loglevel", "error", "-y"];
  const parts: string[] = [];
  seq.forEach((e, i) => {
    args.push("-i", join(ROOT, "public", e.url!));
    const gap = i + 1 < seq.length ? Math.max(0, Math.min(0.9, seq[i + 1].t - (e.t + durOf(e.url!)))) : 0;
    parts.push(`[${i}:a]aresample=44100,aformat=channel_layouts=mono,apad=pad_dur=${gap.toFixed(3)}[a${i}]`);
  });
  const filter = parts.join(";") + ";" + seq.map((_, i) => `[a${i}]`).join("") + `concat=n=${seq.length}:v=0:a=1[out]`;
  execFileSync("ffmpeg", [...args, "-filter_complex", filter, "-map", "[out]", "-ac", "1", out]);
}

const RUBRIC = (said: string) =>
  `This is one moment of a phonics game for British 3-to-5-year-olds: a teacher's recorded sentence with a pure speech sound or a single word (sometimes said slowly) played straight after it, as separate recordings. What the child should hear: ${said}. Separate recordings are intended; judge whether it SOUNDS like one teacher speaking naturally in one room. Score 10 if the voice, loudness, pitch and background match and the pauses feel natural; score low for an audible join: a jump in loudness or voice, a click, a change of room sound, a pause that is awkwardly long or clipped, or a word that sounds pasted in.`;
const results: { where: string; clips: string[]; score: number; heard: string; notes: string }[] = [];
await pool(todo, 6, async ({ seq, where }, i) => {
  const out = join(tmp, `join_${i}.wav`);
  render(seq, out);
  const said = seq.map((e) => (e.kind === "say" ? `"${e.text}"` : e.kind === "sound" ? `the pure sound ${e.text}` : `the word "${e.text}"${e.kind === "stretch" ? " said slowly" : e.kind === "onset" ? " with its first sound held" : ""}`)).join(", then ");
  const r = await judgeAudio(out, RUBRIC(said));
  results.push({ where, clips: seq.map((e) => e.url!), score: r.score, heard: r.heard, notes: r.notes });
  console.log(`${r.score >= 7 ? "✓" : "✗"} ${r.score} ${where}: ${seq.map((e) => e.url!.split("/").pop()).join(" + ")}${r.score < 7 ? ` — ${r.notes}` : ""}`);
});
writeFileSync(join(dir, "joins.json"), JSON.stringify(results.sort((a, b) => a.score - b.score), null, 1));
const findings: Finding[] = results.filter((r) => r.score < 7).map((r) => ({
  sig: `joins:${r.clips.map((c) => c.split("/").pop()).join("+")}`, source: "critic", severity: r.score <= 4 ? "major" : "minor", case: r.where,
  title: `audible join: ${r.clips.map((c) => c.split("/").pop()).join(" + ")}`, detail: `${r.notes} (judge ${r.score}/10; heard: ${r.heard})`, evidence: r.clips,
}));
if (runDir) {
  mkdirSync(runDir, { recursive: true });
  writeFileSync(join(runDir, "joins.json"), JSON.stringify({ findings }, null, 1));
}
console.log(`${results.length} joins judged: ${findings.length} audible (${findings.filter((f) => f.severity === "major").length} major) → ${join(dir, "joins.json")}`);
void existsSync;
