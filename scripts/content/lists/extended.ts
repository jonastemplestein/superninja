/** Public Sounds~Write manual and 2026 progress-check examples, transcribed in
 * assets-src/sw-sources/research/sections/extended-code.md. The manual list
 * predates September 2024; segmentations are checked against today's policy. */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const research = readFileSync(join(import.meta.dir, "../../../assets-src/sw-sources/research/sections/extended-code.md"), "utf8");

function words(cell: string): string[] {
  return cell.toLowerCase().split(/\s+/).map(x => x.replace(/^\*+|[.,;:]+$/g, ""))
    .filter(x => /^[a-z]+$/.test(x));
}

const result: Record<string, string[]> = {};
const manual = research.split("### 4.8 Official word lists")[1]?.split("### 4.9")[0] ?? "";
for (const row of manual.matchAll(/^\| (\d+) \|[^\n]*?\| ([^|]+) \|$/gm)) {
  const n = +row[1];
  if (n > 26) continue;
  const cell = row[2].split("; after Unit")[0].replace(/\([^)]*\)/g, "").replace(/\*/g, "");
  result[`EC${n}`] = words(cell);
}
const checks = research.split("**Words by unit (2026 edition)**")[1]?.split("**What the word sets show**")[0] ?? "";
for (const row of checks.matchAll(/^\| (\d+) [^|]*\| ([^|]+) \| ([^|]+) \|/gm)) {
  const n = +row[1];
  if (n > 26) continue;
  result[`EC${n}`] = [...new Set([...(result[`EC${n}`] ?? []), ...words(row[2]), ...words(row[3])])];
}

export const OFFICIAL_EC_WORDS = result;
