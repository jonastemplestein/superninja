// Blind picture-naming audit. Run with Doppler for the Gemini API key:
// doppler run -p os-legacy-2026-04 -c dev -- bun scripts/treadmill/pic-audit.ts <runDir> [--only sand,soap] [--concurrency 6]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ORAL_WORDS, PHONEMES, WORDS } from "../../src/content/phonics";
import type { PhonemeId, Word } from "../../src/content/phonics";
import { generate, pool, textOf } from "../gemini";
import type { Finding, Severity } from "./types";

type Name = { name: string; probability: number };
type Answer = { index: number; names: Name[] };
type Picture = { word: string; path: string; first: PhonemeId; vowel?: PhonemeId };
type Result = {
  word: string;
  names: Name[];
  intendedRank: number | null;
  sharesFirstSound: boolean;
  sharesVowel: boolean | null;
  severity: Severity | null;
};

const BATCH_SIZE = 12;
const pictureDir = fileURLToPath(new URL("../../public/a/i/", import.meta.url));

function usage(): never {
  throw new Error("Usage: bun scripts/treadmill/pic-audit.ts <runDir> [--only sand,soap] [--concurrency 6]");
}

function options() {
  const args = process.argv.slice(2);
  const runArg = args.shift();
  if (!runArg || runArg.startsWith("--")) usage();
  let only: Set<string> | undefined;
  let concurrency = 6;
  while (args.length) {
    const arg = args.shift()!;
    if (arg === "--only" || arg.startsWith("--only=")) {
      const value = arg === "--only" ? args.shift() : arg.slice(7);
      if (!value) usage();
      only = new Set(value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
      if (!only.size) usage();
    } else if (arg === "--concurrency" || arg.startsWith("--concurrency=")) {
      const value = arg === "--concurrency" ? args.shift() : arg.slice(14);
      concurrency = Number(value);
      if (!Number.isSafeInteger(concurrency) || concurrency < 1) usage();
    } else usage();
  }
  return { runDir: resolve(runArg), only, concurrency };
}

function firstVowel(word: Word): PhonemeId | undefined {
  return word.segs.find((s) => PHONEMES[s.p]?.vowel)?.p;
}

function pictures(): Picture[] {
  const byWord = new Map<string, Picture>();
  for (const word of WORDS) {
    if (word.pic) byWord.set(word.text, {
      word: word.text,
      path: join(pictureDir, `pic_${word.text}.webp`),
      first: word.segs[0].p,
      vowel: firstVowel(word),
    });
  }
  for (const [word, entry] of Object.entries(ORAL_WORDS)) {
    byWord.set(word, {
      word,
      path: join(pictureDir, `pic_${word}.webp`),
      first: entry.first,
      vowel: guessSounds(word).vowel,
    });
  }
  return [...byWord.values()].sort((a, b) => a.word.localeCompare(b.word));
}

// Deliberately small spelling heuristic for an unlabelled, guessed name. Initial sh/ch/th,
// ph/wh/qu, hard/soft c and g, and the first written vowel or common vowel digraph are
// enough to sort obvious mismatches. English exceptions (e.g. "one") can be wrong;
// intended teaching words instead use their authoritative phonics segments above.
function guessSounds(raw: string): { first?: string; vowel?: PhonemeId } {
  const word = raw.toLowerCase().replace(/^(?:a|an|the)\s+/, "").match(/[a-z]+/)?.[0] ?? "";
  if (!word) return {};
  const start = word.startsWith("kn") ? "n"
    : word.startsWith("wr") ? "r"
    : word.startsWith("ph") ? "f"
    : word.startsWith("wh") ? "w"
    : word.startsWith("qu") ? "kw"
    : word.startsWith("sh") ? "sh"
    : word.startsWith("ch") ? "ch"
    : word.startsWith("th") ? "th"
    : word[0] === "c" ? (/[eiy]/.test(word[1] ?? "") ? "s" : "k")
    : word[0] === "g" && /[eiy]/.test(word[1] ?? "") ? "j"
    : word[0];
  const first = start === "k" && word[0] === "q" ? "kw" : start;
  const vowels: [RegExp, PhonemeId][] = [
    [/^(?:air|are)/, "air"], [/^(?:ear|eer)/, "eer"],
    [/^(?:igh|ie)/, "ie"], [/^(?:ai|ay)/, "ae"], [/^(?:ee|ea)/, "ee"],
    [/^(?:oa|ow)/, "oe"], [/^oo/, "oo"], [/^(?:ar)/, "ar"],
    [/^(?:or|aw|au)/, "or"], [/^(?:er|ir|ur)/, "er"],
    [/^(?:ou|ow)/, "ou"], [/^(?:oi|oy)/, "oy"],
    [/^a/, "a"], [/^e/, "e"], [/^i/, "i"], [/^o/, "o"], [/^u/, "u"],
  ];
  const vowelStart = word.search(/[aeiouy]/);
  const tail = vowelStart < 0 ? "" : word.slice(vowelStart);
  return { first, vowel: vowels.find(([pattern]) => pattern.test(tail))?.[1] };
}

function normaliseName(name: string): string {
  return name.toLowerCase().trim().replace(/^(?:a|an|the)\s+/, "")
    .replace(/[^a-z\s-]/g, "").replace(/\s+/g, " ").trim();
}

function sameWord(name: string, intended: string): boolean {
  const clean = normaliseName(name);
  return clean === intended || clean === `${intended}s` ||
    (intended.endsWith("y") && clean === `${intended.slice(0, -1)}ies`) ||
    (intended.endsWith("s") && clean === `${intended}es`);
}

async function preparedImages(selected: Picture[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  try {
    const sharp = (await import("sharp")).default;
    await pool(selected, 12, async ({ word, path }) => {
      const jpeg = await sharp(path).flatten({ background: "#fff4dc" }).jpeg({ quality: 88 }).toBuffer();
      out.set(word, jpeg.toString("base64"));
    });
    if (out.size !== selected.length) throw new Error("Could not prepare every image with sharp");
    return out;
  } catch {
    // Pillow fallback, kept in memory so the audit only writes the requested JSON files.
    const python = String.raw`
import base64, io, json, sys
from PIL import Image
result = {}
for word, path in json.load(sys.stdin):
    with Image.open(path) as source:
        source = source.convert("RGBA")
        canvas = Image.new("RGBA", source.size, "#fff4dc")
        canvas.alpha_composite(source)
        stream = io.BytesIO()
        canvas.convert("RGB").save(stream, "JPEG", quality=88)
        result[word] = base64.b64encode(stream.getvalue()).decode("ascii")
json.dump(result, sys.stdout)
`;
    const json = execFileSync("uv", ["run", "--with", "pillow", "python", "-c", python], {
      input: JSON.stringify(selected.map(({ word, path }) => [word, path])),
      maxBuffer: 32 * 1024 * 1024,
    }).toString();
    return new Map(Object.entries(JSON.parse(json) as Record<string, string>));
  }
}

function schema() {
  return {
    type: "OBJECT",
    properties: {
      pictures: { type: "ARRAY", items: { type: "OBJECT", properties: {
        index: { type: "INTEGER" },
        names: { type: "ARRAY", items: { type: "OBJECT", properties: {
          name: { type: "STRING" }, probability: { type: "NUMBER" },
        }, required: ["name", "probability"] } },
      }, required: ["index", "names"] } },
    },
    required: ["pictures"],
  };
}

function parseAnswers(raw: string, count: number): Answer[] {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { pictures?: unknown }).pictures)) {
    throw new Error("Invalid Gemini picture response");
  }
  const answers = (parsed as { pictures: Answer[] }).pictures;
  const indexes = new Set<number>();
  for (const answer of answers) {
    if (!Number.isInteger(answer.index) || answer.index < 1 || answer.index > count || indexes.has(answer.index) ||
        !Array.isArray(answer.names) || answer.names.length !== 3 ||
        answer.names.some((n) => typeof n.name !== "string" || !n.name.trim() ||
          typeof n.probability !== "number" || n.probability < 0 || n.probability > 1)) {
      throw new Error("Invalid Gemini picture names or indexes");
    }
    indexes.add(answer.index);
  }
  if (answers.length !== count) throw new Error(`Gemini returned ${answers.length}/${count} pictures`);
  return answers.sort((a, b) => a.index - b.index);
}

async function nameBatch(batch: Picture[], images: Map<string, string>): Promise<Answer[]> {
  const prompt = `You are a 4-year-old British child looking at picture cards. What is each picture of? For EACH numbered picture, give the three most likely short, everyday names a child would actually say, most likely first, with a probability from 0 to 1 for each. Judge only what you see. Do not infer a target word, read a filename, or use nearby pictures as clues. Prefer the ordinary name of the most salient visible thing. If it depicts an action or scene, name what a child would say for that picture. Use British English (e.g. bin, cot, pram, vest). Keep names distinct and probabilities in descending order, roughly summing to 1. Return exactly one entry for every index 1–${batch.length}.`;
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: prompt }];
  batch.forEach((picture, i) => {
    parts.push({ text: `Picture ${i + 1}:` });
    parts.push({ inlineData: { mimeType: "image/jpeg", data: images.get(picture.word)! } });
  });
  const body = { contents: [{ parts }], generationConfig: {
    responseMimeType: "application/json", responseSchema: schema(), temperature: 0,
  } };
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return parseAnswers(textOf(await generate("gemini-3.8-flash", body, 2)), batch.length);
    } catch (error) {
      lastError = error;
      console.error(`Retrying batch ${batch[0].word}–${batch.at(-1)!.word}: ${String(error)}`);
    }
  }
  throw lastError;
}

function assess(picture: Picture, names: Name[]): Result {
  const top = names[0].name;
  const intendedIndex = names.findIndex(({ name }) => sameWord(name, picture.word));
  const intendedRank = intendedIndex < 0 ? null : intendedIndex + 1;
  const guess = guessSounds(top);
  const sharesFirstSound = guess.first === picture.first;
  const sharesVowel = guess.vowel && picture.vowel ? guess.vowel === picture.vowel : null;
  const severity = intendedRank === 1 ? null : intendedRank !== null ? "polish"
    : sharesFirstSound ? "minor" : "major";
  return { word: picture.word, names, intendedRank, sharesFirstSound, sharesVowel, severity };
}

function finding(result: Result, picture: Picture, runDir: string): Finding | null {
  if (!result.severity) return null;
  const names = result.names.map(({ name, probability }) => `“${name}” ${Math.round(probability * 100)}%`).join(", ");
  const vowel = result.sharesVowel === null ? "unknown" : result.sharesVowel ? "same" : "different";
  return {
    sig: `pics:${result.word}`, source: "critic", severity: result.severity, case: "pictures",
    title: `pic_${result.word} looks like “${result.names[0].name}”`,
    detail: `Blind names: ${names}. Intended “${result.word}” rank: ${result.intendedRank ?? "absent"}. First sound: ${result.sharesFirstSound ? "same" : "different"}; vowel: ${vowel} (simple spelling guess for pictured name).`,
    evidence: [relative(runDir, picture.path).replaceAll("\\", "/")],
  };
}

async function main() {
  const { runDir, only, concurrency } = options();
  const available = pictures();
  if (only) {
    const missing = [...only].filter((name) => !available.some((picture) => picture.word === name));
    if (missing.length) throw new Error(`Unknown picture words: ${missing.join(", ")}`);
  }
  const selected = only ? available.filter((picture) => only.has(picture.word)) : available;
  if (!selected.length) throw new Error("No pictures selected");
  const missingFiles = selected.filter(({ path }) => !existsSync(path));
  if (missingFiles.length) throw new Error(`Missing pictures: ${missingFiles.map(({ word }) => word).join(", ")}`);
  const images = await preparedImages(selected);
  const batches = Array.from({ length: Math.ceil(selected.length / BATCH_SIZE) }, (_, i) =>
    selected.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE));
  const answers: Answer[][] = new Array(batches.length);
  const failures: string[] = [];
  await pool(batches, concurrency, async (batch, i) => {
    try {
      answers[i] = await nameBatch(batch, images);
      console.log(`Named ${batch[0].word}–${batch.at(-1)!.word} (${batch.length})`);
    } catch (error) {
      failures.push(`${batch[0].word}–${batch.at(-1)!.word}: ${String(error)}`);
    }
  });
  if (failures.length) throw new Error(`Picture audit incomplete:\n${failures.join("\n")}`);
  const results = batches.flatMap((batch, i) => batch.map((picture, j) => assess(picture, answers[i][j].names)));
  const byWord = new Map(selected.map((picture) => [picture.word, picture]));
  const findings = results.flatMap((result) => {
    const item = finding(result, byWord.get(result.word)!, runDir);
    return item ? [item] : [];
  });
  mkdirSync(runDir, { recursive: true });
  writeFileSync(join(runDir, "pics-all.json"), JSON.stringify(results, null, 2) + "\n");
  writeFileSync(join(runDir, "pics.json"), JSON.stringify(findings, null, 2) + "\n");
  const counts: Record<Severity, number> = { blocker: 0, major: 0, minor: 0, polish: 0 };
  for (const item of findings) counts[item.severity]++;
  console.log(`\n${selected.length} pictures: ${selected.length - findings.length} OK, ${counts.major} major, ${counts.minor} minor, ${counts.polish} polish`);
  console.log("Severity  Picture          Blind names (most likely first)");
  console.log("--------  ---------------  -------------------------------------------");
  const order: Record<Severity, number> = { blocker: 0, major: 1, minor: 2, polish: 3 };
  for (const result of [...results].filter((r) => r.severity).sort((a, b) =>
    (order[a.severity!] - order[b.severity!]) || a.word.localeCompare(b.word))) {
    console.log(`${result.severity!.padEnd(8)}  ${result.word.padEnd(15)}  ${result.names.map((n) => `${n.name} ${Math.round(n.probability * 100)}%`).join("; ")}`);
  }
  console.log(`Wrote ${join(runDir, "pics.json")} and pics-all.json`);
}

await main();
