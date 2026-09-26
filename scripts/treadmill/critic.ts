// Visual review of treadmill screenshots. Run with Doppler so scripts/gemini.ts has its API key.
// bun scripts/treadmill/critic.ts <runDir> [--only w1-4,w1-2] [--concurrency 6] [--monkey]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { generate, pool, textOf } from "../gemini";
import type { CaseMeta, Finding, Severity } from "./types";

type Frame = CaseMeta["frames"][number] & { label: string; path: string };
type Review = { score: number; summary: string; problems: Problem[] };
type Problem = {
  kind: string;
  title: string;
  detail: string;
  severity: "critical" | "high" | "medium" | "low";
  frames: string[];
};
type Verdict = "confirmed" | "refuted" | "unsure";
type Verification = {
  case: string;
  kind: string;
  title: string;
  claim: string;
  frames: string[];
  originalSeverity: Severity;
  verdict: Verdict;
  reason: string;
};

const python = String.raw`
import base64, io, json, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

data = json.load(sys.stdin)
frames = data["frames"]
width, gap, label_height = 760, 12, 36
height = round(width * 390 / 844)
columns = min(3, len(frames))
rows = (len(frames) + columns - 1) // columns
sheet = Image.new("RGB", (columns * width + (columns + 1) * gap,
                          rows * (height + label_height) + (rows + 1) * gap), "#211b2d")
draw = ImageDraw.Draw(sheet)
images = {}
try:
    font = ImageFont.truetype("DejaVuSans.ttf", 23)
except OSError:
    font = ImageFont.load_default()
for index, frame in enumerate(frames):
    x = gap + (index % columns) * (width + gap)
    y = gap + (index // columns) * (height + label_height + gap)
    with Image.open(frame["path"]) as source:
        full = source.convert("RGB")
        stream = io.BytesIO()
        full.save(stream, "JPEG", quality=85, optimize=True)
        images[frame["file"]] = base64.b64encode(stream.getvalue()).decode("ascii")
        picture = ImageOps.contain(full, (width, height), Image.Resampling.LANCZOS)
    sheet.paste(picture, (x + (width - picture.width) // 2, y + label_height))
    draw.text((x + 7, y + 3), frame["label"], fill="#fff4dc", font=font)
sheet.save(data["output"], "JPEG", quality=86, optimize=True)
json.dump(images, sys.stdout)
`;

function usage(): never {
  throw new Error("Usage: bun scripts/treadmill/critic.ts <runDir> [--only w1-4,w1-2] [--concurrency 6] [--monkey]");
}

function options() {
  const args = process.argv.slice(2);
  const runArg = args.shift();
  if (!runArg || runArg.startsWith("--")) usage();
  let only: Set<string> | undefined;
  let concurrency = 6;
  let monkey = false;
  while (args.length) {
    const arg = args.shift()!;
    if (arg === "--only" || arg.startsWith("--only=")) {
      const value = arg === "--only" ? args.shift() : arg.slice(7);
      if (!value) usage();
      only = new Set(value.split(",").map((s) => s.trim()).filter(Boolean));
      if (!only.size) usage();
    } else if (arg === "--concurrency" || arg.startsWith("--concurrency=")) {
      const value = arg === "--concurrency" ? args.shift() : arg.slice(14);
      concurrency = Number(value);
      if (!Number.isSafeInteger(concurrency) || concurrency < 1) usage();
    } else if (arg === "--monkey") {
      monkey = true;
    } else usage();
  }
  return { runDir: resolve(runArg), only, concurrency, monkey };
}

// Treadmill frame times are milliseconds from the start of the case.
function timestamp(t: number): string {
  const seconds = Math.round(t / 100) / 10;
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${(seconds % 60).toFixed(1).padStart(4, "0")}`;
}

function framesFor(meta: CaseMeta, caseDir: string): Frame[] {
  if (!Array.isArray(meta.frames) || !meta.frames.length) throw new Error("No frames in meta.json");
  const ordered = [...meta.frames].sort((a, b) => a.t - b.t);
  const selected = ordered.length <= 10
    ? ordered
    : Array.from({ length: 10 }, (_, i) => ordered[Math.round(i * (ordered.length - 1) / 9)]);
  return selected.map((frame) => {
    if (!Number.isFinite(frame.t) || typeof frame.file !== "string" || basename(frame.file) !== frame.file) {
      throw new Error("Invalid frame entry in meta.json");
    }
    const path = join(caseDir, frame.file);
    if (!existsSync(path)) throw new Error(`Missing frame ${frame.file}`);
    return { ...frame, label: timestamp(frame.t), path };
  });
}

function prepareImages(frames: Frame[], output: string): Map<string, string> {
  const raw = execFileSync("uv", ["run", "--with", "pillow", "python", "-c", python], {
    input: JSON.stringify({ frames: frames.map(({ path, label, file }) => ({ path, label, file })), output }),
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 10 * 1024 * 1024,
  });
  return new Map(Object.entries(JSON.parse(raw.toString()) as Record<string, string>));
}

function responseSchema(labels: string[]) {
  return {
    type: "OBJECT",
    properties: {
      score: { type: "INTEGER", description: "Clarity for a four-year-old, from 0 to 10." },
      summary: { type: "STRING" },
      problems: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            kind: { type: "STRING", description: "Stable, short kebab-case problem kind." },
            title: { type: "STRING" },
            detail: { type: "STRING" },
            severity: { type: "STRING", enum: ["critical", "high", "medium", "low"] },
            frames: { type: "ARRAY", items: { type: "STRING", enum: labels } },
          },
          required: ["kind", "title", "detail", "severity", "frames"],
        },
      },
    },
    required: ["score", "summary", "problems"],
  };
}

function prompt(meta: CaseMeta, frames: Frame[]): string {
  const frameList = frames.map((f) => `${f.file} (${f.label})`).join(", ");
  return `You are a children's game UX designer and a Reception teacher. Review the following chronological, full-resolution screenshots as a child aged 3–5 would see them on a phone in landscape mode. Use British English. Each image follows its own frame label and caption. The screenshots, not the captions, are the visual evidence.\n\n` +
    `Activity: ${meta.title}\nKind: ${meta.kind}\nIntended child action: ${meta.intent}\nAvailable frames: ${frameList}\n\n` +
    `Look for concrete, visible problems only:\n` +
    `- Is it obvious what to tap right now? Is there one clear focus? Are targets large and clear of speech bubbles, characters, the help button at bottom left, and screen edges? Do speech bubbles actually cover letter tiles?\n` +
    `- Are images, text or tiles overlapping, clipped, cut off, or off-screen? Are picture cards blank, unrecognisable as the target object, or replaced by alt text, "undefined", NaN, or placeholder icons?\n` +
    `- Does the visual style stay consistent enough for a child to identify controls? Interactive tiles should be cream paper with thick dark-brown ink borders and chunky shadows. Picture cards should show one recognisable object when an illustration is present. Do not treat an audio prompt with a speaker icon as a missing picture. Ignore minor colour or pose differences that do not obstruct the task.\n` +
    `- Does the action appear frozen across several consecutive frames when nothing invites a tap? Distinguish a waiting-for-input scene from a freeze, and do not claim a freeze just because the player has not tapped.\n` +
    `- Visible pedagogy red flags: letter names, spellings described as "says" or "makes" a sound, or written instructions a child who cannot yet read must read to proceed. On story questions, check whether a visible replay control lets the child hear the question again. Judge only text and controls actually visible; you cannot hear the audio.\n` +
    `- Is feedback or celebration visible when the child succeeds? Only flag its absence if success is visible in these frames.\n\n` +
    `These are sparse stills, not a continuous recording. Never infer what happened between two frames. A word appearing in slots may be a teaching demonstration, and a later empty slot does not prove there was no feedback in between. In word-swap activities, the old word is intentionally fully filled and the offered letters are replacements, so they need not match the old word. Inline speaker symbols are audio controls, not raw placeholders. Picture art may deliberately extend outside its card; report it only if it actually obscures a target. A translucent object in one frame may be mid-animation. Count letter slots and inspect glyphs at full resolution before claiming either is wrong. Only call something an overlap if it visibly covers or touches the target itself; being close is not an overlap. If a proposed defect relies on a guessed action, spoken instruction, missing intermediate animation, or unseen outcome, omit it.\n\n` +
    `Report only specific defects supported by the images, citing the exact PNG filename(s) in frames and explaining what is visible and why it matters to a four-year-old. Do not invent audio, interaction outcomes, or unseen screens. Do not offer generic design advice. Use a distinct short kebab-case kind for each issue. Severity: critical means the child cannot proceed; high means a substantial obstacle; medium means a clear but lesser problem; low means cosmetic. Score clarity for a four-year-old from 0 (unusable) to 10 (immediately clear). An empty problems array is fine. Return JSON only.`;
}

function parseReview(raw: string, labels: string[]): Review {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid critic response");
  const review = parsed as Review;
  if (!Number.isInteger(review.score) || review.score < 0 || review.score > 10 ||
      typeof review.summary !== "string" || !review.summary.trim() || !Array.isArray(review.problems)) {
    throw new Error("Invalid critic response shape");
  }
  for (const p of review.problems) {
    if (!p || typeof p.kind !== "string" || !p.kind.trim() ||
        typeof p.title !== "string" || !p.title.trim() ||
        typeof p.detail !== "string" || !p.detail.trim() ||
        !["critical", "high", "medium", "low"].includes(p.severity) ||
        !Array.isArray(p.frames) || !p.frames.length ||
        p.frames.some((file) => !labels.includes(file))) {
      throw new Error("Invalid critic problem");
    }
  }
  return review;
}

function imageParts(frames: Frame[], images: Map<string, string>, includeCaption = true) {
  return frames.flatMap((frame) => {
    const data = images.get(frame.file);
    if (!data) throw new Error(`Missing JPEG for ${frame.file}`);
    const number = frame.file.match(/^f_(\d+)\.png$/)?.[1] ?? frame.file;
    return [
      { text: includeCaption
        ? `Frame ${number} at ${frame.label} — caption: ${frame.caption?.trim() || "(none)"}; file: ${frame.file}${(frame as any).settling ? " — MID-ANIMATION: elements may still be popping or dropping in, so don't report clipping, missing or overlapping elements from this frame alone" : ""}`
        : `Frame ${number} at ${frame.label}; file: ${frame.file}` },
      { inlineData: { mimeType: "image/jpeg", data } },
    ];
  });
}

function focusedPrompt(meta: CaseMeta, kinds: string[]): string {
  const checks: Record<string, string> = {
    "speech-bubble-overlap": "Inspect every screenshot's bottom letter bank. Does an instruction speech bubble physically cover any selectable letter tile, including the leftmost tile partly hidden behind the bubble? Cite only frames where the overlap is visible.",
    "missing-story-question-replay": "On a story comprehension question screen, does the written question have a visible button to replay or hear that question? A help button at bottom left is not a replay control. If no replay control is visible on the question screen, report that specific obstacle for a child who cannot read the question yet.",
    "picture-word-mismatch": "Where a recognisable picture is shown with a spelled word, compare the picture to the object named by the visible letter tiles. Report a picture that looks like a different everyday object or is ambiguous enough to mislead a child (for example, a cleaning tool that looks like a broom when the tiles spell mop). Do not report audio-only cards with speaker icons.",
  };
  return `Perform a narrow second visual audit of these chronological full-resolution screenshots from ${meta.title}. The activity is ${meta.intent} Use British English. Check EACH provided frame for ONLY the following concrete problems:\n${kinds.map((kind) => `- ${kind}: ${checks[kind]}`).join("\n")}\n\nReport each observed problem once, using exactly one of these kind values: ${kinds.join(", ")}. Give the exact PNG filename(s) in frames. For a severe obstacle use high, for a clear but smaller one use medium. Do not invent unseen actions, audio behaviour, or absent screens. Ignore cosmetic details and return an empty problems array if none is supported. Include a brief summary and a 0–10 clarity score. Return JSON only.`;
}

async function reviewCase(meta: CaseMeta, frames: Frame[], images: Map<string, string>, focus?: string[]): Promise<Review> {
  const labels = frames.map((f) => f.file);
  const body = {
    contents: [{ parts: [
      { text: focus ? focusedPrompt(meta, focus) : prompt(meta, frames) },
      ...imageParts(frames, images),
    ] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema(labels),
      temperature: 0,
    },
  };
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const review = parseReview(textOf(await generate("gemini-3.8-flash", body, 1)), labels);
      if (focus) review.problems = review.problems.filter((problem) => focus.includes(problem.kind));
      return review;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function probeBubbleOverlap(frames: Frame[], images: Map<string, string>): Promise<Problem[]> {
  const candidates = frames.filter((frame) => frame.caption?.trim());
  if (!candidates.length) return [];
  const labels = candidates.map((frame) => frame.file);
  const body = {
    contents: [{ parts: [
      { text: `Check EACH following full-resolution screenshot separately for one exact visual condition: does a white instruction speech bubble physically cover any letter choice tile in the BOTTOM ROW? The first tile may be partly hidden under the bubble. A bubble that is merely nearby does not count. Return the PNG filenames where it covers a tile, and no others. The bottom-left character icon is a help button, not part of a letter tile. Return JSON only.` },
      ...imageParts(candidates, images),
    ] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          frames: { type: "ARRAY", items: { type: "STRING", enum: labels } },
          reason: { type: "STRING" },
        },
        required: ["frames", "reason"],
      },
      temperature: 0,
    },
  };
  const answer: unknown = JSON.parse(textOf(await generate("gemini-3.8-flash", body)));
  if (!answer || typeof answer !== "object" || !("frames" in answer) ||
      !Array.isArray(answer.frames) || answer.frames.some((file) => !labels.includes(file)) ||
      !("reason" in answer) || typeof answer.reason !== "string") {
    throw new Error("Invalid overlap probe response");
  }
  if (!answer.frames.length) return [];
  return [{ kind: "speech-bubble-overlap", title: "Speech bubble obscures letter choices",
    detail: answer.reason, severity: "high", frames: [...new Set(answer.frames)] }];
}

async function verifyProblem(problem: Problem, frames: Frame[], images: Map<string, string>): Promise<{ verdict: Verdict; reason: string }> {
  const cited = problem.frames.map((file) => frames.find((frame) => frame.file === file)!);
  const body = {
    contents: [{ parts: [
      { text: `You are a sceptical visual reviewer checking a possibly hallucinated defect. Examine ONLY the following full-resolution screenshots. Try to falsify the claim. Do not assume the first reviewer was right.\n\nClaim: ${problem.title}\n${problem.detail}\n\nReturn "confirmed" only when the cited pixels directly show the claimed defect. Return "refuted" when the image contradicts it (for example, a glyph is present, a supposed line is absent, or the count of slots is wrong). Return "unsure" when the images do not establish the claim. Inspect exact positions, text and counts carefully. The bottom-left character icon is a general help button; it does not replay a story question. Do not infer audio, hidden interactions, or intermediate animation. Explain the visible evidence briefly.` },
      ...imageParts(cited, images, false),
    ] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          verdict: { type: "STRING", enum: ["confirmed", "refuted", "unsure"] },
          reason: { type: "STRING" },
        },
        required: ["verdict", "reason"],
      },
      temperature: 0,
    },
  };
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const answer: unknown = JSON.parse(textOf(await generate("gemini-3.8-flash", body, 1)));
      if (answer && typeof answer === "object" && "verdict" in answer && "reason" in answer &&
          ["confirmed", "refuted", "unsure"].includes(String(answer.verdict)) &&
          typeof answer.reason === "string" && answer.reason.trim()) {
        return answer as { verdict: Verdict; reason: string };
      }
      throw new Error("Invalid verification response");
    } catch (error) {
      lastError = error;
    }
  }
  return { verdict: "unsure", reason: `Verification failed: ${String(lastError)}` };
}

const severities: Record<Problem["severity"], Severity> = {
  critical: "blocker", high: "major", medium: "minor", low: "polish",
};
const rank: Record<Severity, number> = { blocker: 4, major: 3, minor: 2, polish: 1 };

function isBubbleOverlap(problem: Problem): boolean {
  const claim = `${problem.title} ${problem.detail}`;
  return /speech bubble/i.test(claim) && /letter|tile/i.test(claim) && /cover|obscur|overlap/i.test(claim);
}

function isUnsupportedProblem(meta: CaseMeta, problem: Problem): boolean {
  const claim = `${problem.title} ${problem.detail}`;
  if (meta.kind === "tree" && /focus|hierarchy|where to tap|interactive target|call to action/i.test(claim)) return true;
  if (meta.kind === "swap" && /already (filled|complete|solved)|no (blank|available|target) slot|choices do not match/i.test(claim)) return true;
  if (/raw speaker|speaker emoji|speaker symbol.*placeholder/i.test(claim)) return true;
  return /spill.*outside|extend.*outside|protrud.*card/i.test(claim) && !/cover|obscur|block/i.test(claim);
}

function findingsFor(caseName: string, problems: Problem[]): Finding[] {
  const bySig = new Map<string, Finding>();
  for (const problem of problems) {
    const kind = problem.kind.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "issue";
    const sig = `critic:${caseName}:${kind}`;
    const severity = severities[problem.severity];
    const detail = `${problem.frames.join(", ")}: ${problem.detail}`;
    const evidence = problem.frames.map((file) => ["cases", caseName, file].join("/"));
    const prior = bySig.get(sig);
    if (prior) {
      prior.detail += `\n${detail}`;
      if (rank[severity] > rank[prior.severity]) prior.severity = severity;
      prior.evidence = [...new Set([...prior.evidence, ...evidence])];
    } else {
      bySig.set(sig, { sig, source: "critic", severity, case: caseName,
        title: problem.title, detail, evidence });
    }
  }
  return [...bySig.values()];
}

async function main() {
  const { runDir, only, concurrency, monkey } = options();
  const casesDir = join(runDir, "cases");
  const available = readdirSync(casesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(casesDir, entry.name, "meta.json")))
    .map((entry) => entry.name).sort();
  const names = available.filter((name) => (monkey || !name.endsWith("~monkey")) && (!only || only.has(name)));
  if (!names.length) throw new Error("No cases selected");
  if (only) {
    const missing = [...only].filter((name) => !available.includes(name) || (!monkey && name.endsWith("~monkey")));
    if (missing.length) throw new Error(`Unknown cases: ${missing.join(", ")}`);
  }
  const results: { score: number | null; summary: string; findings: Finding[]; verifications: Verification[] }[] = Array.from({ length: names.length });
  await pool(names, concurrency, async (caseName, i) => {
    const caseDir = join(casesDir, caseName);
    try {
      const meta = JSON.parse(readFileSync(join(caseDir, "meta.json"), "utf8")) as CaseMeta;
      const frames = framesFor(meta, caseDir);
      const strip = join(caseDir, "strip.jpg");
      const images = prepareImages(frames, strip);
      const review = await reviewCase(meta, frames, images);
      for (const problem of review.problems) {
        if (isBubbleOverlap(problem)) problem.kind = "speech-bubble-overlap";
      }
      const focus = meta.kind === "story" ? ["missing-story-question-replay"]
        : meta.kind === "dojo" ? ["speech-bubble-overlap", "picture-word-mismatch"]
        : meta.kind === "swap" ? ["speech-bubble-overlap", "picture-word-mismatch"] : [];
      const missingChecks = focus.filter((kind) => !review.problems.some((problem) => problem.kind === kind));
      if (missingChecks.length) {
        const focused = await reviewCase(meta, frames, images, missingChecks);
        review.problems.push(...focused.problems);
      }
      if ((meta.kind === "dojo" || meta.kind === "swap") &&
          !review.problems.some((problem) => problem.kind === "speech-bubble-overlap")) {
        review.problems.push(...await probeBubbleOverlap(frames, images));
      }
      review.problems = review.problems.filter((problem) => !isUnsupportedProblem(meta, problem));
      const verifications: Verification[] = [];
      const accepted: Problem[] = [];
      for (const problem of review.problems) {
        const originalSeverity = severities[problem.severity];
        if (originalSeverity !== "major" && originalSeverity !== "blocker") {
          accepted.push(problem);
          continue;
        }
        const { verdict, reason } = await verifyProblem(problem, frames, images);
        verifications.push({ case: caseName, kind: problem.kind, title: problem.title,
          claim: problem.detail, frames: problem.frames, originalSeverity, verdict, reason });
        if (verdict === "refuted") continue;
        accepted.push(verdict === "unsure" ? { ...problem, severity: "medium" } : problem);
      }
      results[i] = { score: review.score, summary: review.summary,
        findings: findingsFor(caseName, accepted), verifications };
      console.log(`${caseName}: ${review.score}/10, ${results[i].findings.length} findings`);
    } catch (error) {
      results[i] = { score: null, summary: "Critic could not review this case.", findings: [], verifications: [] };
      console.error(`${caseName}: critic failed`, error);
    }
  });
  const cases = Object.fromEntries(names.map((name, i) => [name, {
    score: results[i].score, summary: results[i].summary,
  }]));
  const findings = results.flatMap((result) => result.findings);
  const verifications = results.flatMap((result) => result.verifications);
  writeFileSync(join(runDir, "critic.json"), JSON.stringify({ cases, findings, verifications }, null, 2) + "\n");
  console.log(`Wrote ${join(runDir, "critic.json")}`);
}

await main();
