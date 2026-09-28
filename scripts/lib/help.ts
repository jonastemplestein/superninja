// --help for the treadmill's command-line scripts: print the file's leading comment block (its usage) and exit, before
// the script starts anything. Several of them used to ignore --help and quietly start a real run, some against the shared
// dev server on 5173 (the fix workflow's preflight, lanes A and F1; integration, 27 Sep).
import { readFileSync } from "node:fs";

/** Call first thing after a script's imports: `helpGuard(import.meta.url)`. */
export function helpGuard(url: string) {
  const argv = process.argv.slice(2);
  if (!argv.includes("--help") && !argv.includes("-h")) return;
  const head: string[] = [];
  for (const line of readFileSync(new URL(url), "utf8").split("\n")) {
    if (!line.startsWith("//")) break;
    head.push(line.replace(/^\/\/ ?/, ""));
  }
  console.log(head.join("\n") || "(no usage comment at the top of this script)");
  process.exit(0);
}
