// The playtest treadmill: one command that produces a bug inbox without a human.
//   bots (sweep.ts) → visual critic (critic.ts, Gemini) → Jev triage/lint (jev-*.ts) → personas (personas.ts, Codex) → inbox.ts
// Usage:
//   bun scripts/treadmill/run.ts                 full sweep + monkey + critic + jev, no personas   (~10 min)
//   bun scripts/treadmill/run.ts --quick         one level of each kind, bots + jev only           (~1–2 min)
//   bun scripts/treadmill/run.ts --personas      also run the Codex persona playtesters            (~30–60 min)
//   bun scripts/treadmill/run.ts --pics          also blind-name every word picture (after art changes)
//   bun scripts/treadmill/run.ts --joins         also "one take, or joined?": the first minutes' spliced speech, judged
//                                                 by ear (transcript.ts, then joins.ts; ~3 min)
//   bun scripts/treadmill/run.ts --soak          also the soak check: 8 levels in one page on desktop, judged against the
//                                                 perf budgets (soak.ts --check; its own probe build; ~12 min)
//   bun scripts/treadmill/run.ts --soak-phone    the same on the phone profile (CPU 4× slower), 12 levels (~25 min)
//   bun scripts/treadmill/run.ts --script        also the script checks (docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.2): the four
//                                                 continuous runs (perfect,learner from the start with 12 stones, from w5-1
//                                                 with 12, from w6-br1 with 13; the splitter from w5-1 with 8), in parallel,
//                                                 then script-audit --check → <run>/script.json (~40–60 min); with
//                                                 --watcher also the watcher from the start to w2-1 (TEACHER_SCRIPT's
//                                                 paw at every Ready hold, FIX_PLAN §13.3)
//   bun scripts/treadmill/run.ts --sounds        also the sound display check (§11.3): sound-display --check, both
//                                                 personas, every case → <run>/sound.json (~15 min), then the
//                                                 splitter on the two-letter cases → <run>/sound-splitter.json (~5 min)
//   bun scripts/treadmill/run.ts --no-petals     the sweep without its petal and perf invariants (they are on by default
//                                                 since integration, FIX_PLAN I.2; --petals is still accepted)
//   bun scripts/treadmill/run.ts --no-bots       skip the sweep and the critic (with --script / --sounds / --soak alone)
//   bun scripts/treadmill/run.ts --no-critic     skip the visual critic;  --no-jev: skip the Jev stages
//   bun scripts/treadmill/run.ts --watch         quick run on every change under src/ (debounced)
//   bun scripts/treadmill/run.ts --help          this help (an unknown flag prints it too, and runs nothing)
// Plays a frozen build of the current source (playtest/.build on :4180; safe to keep editing); --live / --watch use the
// dev server on :5173, --base <url> a server that is already up. Secrets come from Doppler per stage.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, watch } from "node:fs";
import { frozen } from "./frozen";
import { mergeRun } from "./inbox";

const has = (f: string) => process.argv.includes(`--${f}`);
const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
// --help, and a guard: an unknown flag or word prints the help and runs nothing (a mistyped flag used to start a full
// run: the snapshot build, the sweep and the critic)
{
  const FLAGS = new Set(["quick", "personas", "pics", "joins", "soak", "soak-phone", "script", "watcher", "sounds", "petals", "no-petals", "no-bots", "no-critic", "no-jev", "watch", "live", "base", "help"]);
  const argv = process.argv.slice(2);
  const help = () => readFileSync(new URL(import.meta.url), "utf8").split("\n").filter((l, i, a) => l.startsWith("//") && a.slice(0, i).every((x) => x.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/, "")).join("\n");
  const unknown = argv.filter((a, i) => (a.startsWith("-") ? !FLAGS.has(a.replace(/^--?/, "")) : argv[i - 1] !== "--base"));
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(help());
    process.exit(0);
  }
  if (unknown.length) {
    console.error(`run.ts: unknown ${unknown.map((u) => `"${u}"`).join(", ")}: nothing was run.\n\n${help()}`);
    process.exit(2);
  }
}
// By default the bots play a frozen production build (served on :4180), so edits to src/ mid-run can't hot-reload the
// pages under them. --live plays the dev server instead (what --watch uses).
let BASE = arg("base", "http://localhost:5173")!;
async function snapshot(): Promise<() => void> {
  process.stdout.write("▶ snapshot build\n");
  try {
    const f = await frozen({ port: 4180, out: "playtest/.build", retry: 1, log: (s) => console.log(`  ${s}`) });
    BASE = f.base;
    return f.stop;
  } catch (e) {
    console.error(`  ${(e as Error).message}`);
    process.exit(1);
  }
}
const QUICK = ["w1-wu1", "w1-wu2", "w1-2", "w1-4", "w1-6", "w1-7", "w1-8", "w1-9", "w1-14", "w1-15", "w6-br1", "training", "map"];
const GEMINI = ["doppler", "run", "-p", "os-legacy-2026-04", "-c", "dev", "--"];
const CF = ["doppler", "run", "-p", "os", "-c", "dev", "--"];

function sh(label: string, cmd: string[]) {
  const t0 = Date.now();
  process.stdout.write(`▶ ${label}\n`);
  const r = spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit" });
  console.log(`  ${r.status === 0 ? "done" : `exit ${r.status}`} in ${Math.round((Date.now() - t0) / 1000)}s`);
  return r.status === 0;
}
/** Several commands at once (each prefixed in the log); resolves with each one's exit code. */
function par(label: string, cmds: [string, string[]][]): Promise<number[]> {
  const t0 = Date.now();
  process.stdout.write(`▶ ${label} (${cmds.length} at once)\n`);
  return Promise.all(
    cmds.map(
      ([name, cmd]) =>
        new Promise<number>((res) => {
          const p = spawn(cmd[0], cmd.slice(1), { stdio: ["ignore", "pipe", "pipe"] });
          const out = (b: Buffer) => process.stdout.write(b.toString().replace(/^(?=.)/gm, `  [${name}] `));
          p.stdout.on("data", out);
          p.stderr.on("data", out);
          p.on("exit", (c) => {
            console.log(`  [${name}] ${c === 0 ? "done" : `exit ${c}`} in ${Math.round((Date.now() - t0) / 1000)}s`);
            res(c ?? -1);
          });
        }),
    ),
  );
}
/** The §11.2 transcript runs: [name, continuous.ts flags]. */
const SCRIPT_RUNS: [string, string[]][] = [
  ["C-PL", ["--persona", "perfect,learner", "--levels", "12"]],
  ["C5-PL", ["--persona", "perfect,learner", "--from", "w5-1", "--levels", "12"]],
  ["C6-PL", ["--persona", "perfect,learner", "--from", "w6-br1", "--levels", "13"]],
  ["C5-S", ["--persona", "splitter", "--from", "w5-1", "--levels", "8"]],
  ...(has("watcher") ? [["C-W", ["--persona", "watcher", "--levels", "19"]] as [string, string[]]] : []),
];

async function once(quick: boolean) {
  const stop = !has("live") && !has("watch") && !arg("base") ? await snapshot() : () => {};
  const runDir = `playtest/runs/${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}${quick ? "-quick" : ""}`;
  mkdirSync(runDir, { recursive: true });
  const bots = !has("no-bots");
  const sweep = ["bun", "scripts/treadmill/sweep.ts", "--run", runDir, "--base", BASE, "--par", quick ? "6" : "8"];
  if (quick) sweep.push("--only", QUICK.join(","), "--fast", "4");
  else sweep.push("--monkey");
  if (has("no-petals")) sweep.push("--no-petals"); // the petal invariants are the sweep's default (FIX_PLAN I.2)
  if (bots) sh("bots", sweep);
  if (bots && !quick && existsSync("scripts/treadmill/critic.ts") && !has("no-critic")) sh("visual critic", [...GEMINI, "bun", "scripts/treadmill/critic.ts", runDir]);
  if (!quick && existsSync("scripts/treadmill/pic-audit.ts") && has("pics")) sh("picture audit", [...GEMINI, "bun", "scripts/treadmill/pic-audit.ts", runDir]);
  // Jev stages: any scripts/treadmill/jev-*.ts whose header contains "@treadmill-stage" is run as `bun <file> <runDir>`
  // and writes <runDir>/jev-*.json (Finding[] or {findings}); other jev-*.ts files are libraries or one-off tools.
  const stages = readdirSync("scripts/treadmill").filter((f) => /^jev-.*\.ts$/.test(f) && readFileSync(`scripts/treadmill/${f}`, "utf8").slice(0, 600).includes("@treadmill-stage"));
  for (const f of stages.sort())
    if (!has("no-jev")) sh(`jev ${f}`, [...CF, "bun", `scripts/treadmill/${f}`, runDir]);
  if (has("joins")) {
    const tdir = `${runDir}/transcripts`;
    if (sh("transcripts (first minutes)", ["bun", "scripts/treadmill/transcript.ts", "--base", BASE, "--only", "w1-wu1,w1-wu2,w1-wu3,w1-2,w1-7", "--persona", "perfect", "--out", tdir]))
      sh("joins (one take, or joined?)", [...GEMINI, "bun", "scripts/treadmill/joins.ts", tdir, runDir]);
  }
  if (has("personas")) sh("personas", ["bun", "scripts/treadmill/personas.ts", runDir, "--base", BASE]);
  // the script checks (§11.2): the four continuous runs at once, then script-audit --check over their transcripts
  if (has("script")) {
    const tdir = `${runDir}/transcripts`;
    await par("transcripts (continuous.ts, FIX_PLAN §11.2)", SCRIPT_RUNS.map(([name, flags]) => [name, ["bun", "scripts/treadmill/continuous.ts", "--base", BASE, ...flags, "--out", tdir]]));
    const files = existsSync(tdir) ? readdirSync(tdir).filter((f) => /^continuous-.*\.json$/.test(f)).sort().map((f) => `${tdir}/${f}`) : [];
    if (files.length) sh("script checks (script-audit --check)", ["bun", "scripts/treadmill/script-audit.ts", ...files, "--out", `${runDir}/script-audit.md`, "--check", "--findings", `${runDir}/script.json`, "--metrics", `${runDir}/script-metrics.json`]);
    else console.log("  no transcripts: the script checks were skipped");
  }
  // the sound display check (§11.3): every case, both personas, then the splitter run on the cases with two-letter
  // spellings (its split-petal row; verify round 2)
  if (has("sounds")) {
    sh("sound display (sound-display --check)", ["bun", "scripts/treadmill/sound-display.ts", "--base", BASE, "--out", `${runDir}/sound`, "--check", "--findings", `${runDir}/sound.json`]);
    sh("sound display, the splitter (sound-display --persona splitter --check)", ["bun", "scripts/treadmill/sound-display.ts", "--base", BASE, "--persona", "splitter", "--only", "w2-1,w3-6,w5-1,w5-6,w6-br1,w6-1,w6-2,trial", "--out", `${runDir}/sound-splitter`, "--check", "--findings", `${runDir}/sound-splitter.json`]);
  }
  stop();
  // the soak check plays its own frozen build with the module probes (soak.vite.config.ts), on its own port
  if (has("soak") || has("soak-phone")) {
    const profile = has("soak-phone") ? ["--mobile", "--cpu", "4", "--levels", "12", "--idle", "60", "--stress", "150", "--port", "4191"] : ["--levels", "8", "--idle", "30", "--stress", "60", "--port", "4190"];
    sh(`soak check (${has("soak-phone") ? "phone ×4" : "desktop"})`, ["bun", "scripts/treadmill/soak.ts", ...profile, "--fast", "2", "--check", "--out", `${runDir}/soak`, "--findings", `${runDir}/soak.json`]);
  }
  const s = mergeRun(runDir);
  console.log(`\n📥 playtest/INBOX.md — ${s.blockers} blockers, ${s.major} major, ${s.total} total (${s.new} new)`);
  for (const [name, file, report] of [["script", "script.json", "script-audit.md"], ["sounds", "sound.json", "sound/check.md"], ["sounds (splitter)", "sound-splitter.json", "sound-splitter/check.md"]] as const)
    if (existsSync(`${runDir}/${file}`)) {
      const fails: { title: string }[] = JSON.parse(readFileSync(`${runDir}/${file}`, "utf8"));
      console.log(fails.length ? `⚠️  ${name}: ${fails.length} checks failed (${runDir}/${report})\n${fails.map((f) => `   - ${f.title}`).join("\n")}` : `✅ ${name}: every check passed (${runDir}/${report})`);
    }
  if (existsSync(`${runDir}/soak.json`)) {
    const fails: { title: string }[] = JSON.parse(readFileSync(`${runDir}/soak.json`, "utf8"));
    console.log(fails.length ? `⚠️  soak: ${fails.length} budgets failed (${runDir}/soak/summary.md)\n${fails.map((f) => `   - ${f.title}`).join("\n")}` : `✅ soak: every budget passed (${runDir}/soak/summary.md)`);
  }
}

if (has("watch")) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  const kick = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) return kick();
      running = true;
      await once(true);
      running = false;
    }, 4000);
  };
  watch("src", { recursive: true }, kick);
  console.log("👀 watching src/ — quick treadmill run after each change");
  kick();
} else await once(has("quick"));
