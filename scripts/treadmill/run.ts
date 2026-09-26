// The playtest treadmill: one command that produces a bug inbox without a human.
//   bots (sweep.ts) → visual critic (critic.ts, Gemini) → Jev triage/lint (jev-*.ts) → personas (personas.ts, Codex) → inbox.ts
// Usage:
//   bun scripts/treadmill/run.ts                 full sweep + monkey + critic + jev, no personas   (~10 min)
//   bun scripts/treadmill/run.ts --quick         one level of each kind, bots + jev only           (~1–2 min)
//   bun scripts/treadmill/run.ts --personas      also run the Codex persona playtesters            (~30–60 min)
//   bun scripts/treadmill/run.ts --pics          also blind-name every word picture (after art changes)
//   bun scripts/treadmill/run.ts --joins         also "one take, or joined?": the first minutes' spliced speech, judged
//                                                 by ear (transcript.ts, then joins.ts; ~3 min)
//   bun scripts/treadmill/run.ts --watch         quick run on every change under src/ (debounced)
// Plays a frozen build of the current source (safe to keep editing); --live / --watch use the dev server on :5173.
// Secrets come from Doppler per stage.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, watch } from "node:fs";
import { mergeRun } from "./inbox";

const has = (f: string) => process.argv.includes(`--${f}`);
const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
// By default the bots play a frozen production build (served on :4180), so edits to src/ mid-run can't hot-reload the
// pages under them. --live plays the dev server instead (what --watch uses).
let BASE = arg("base", "http://localhost:5173")!;
async function snapshot(): Promise<() => void> {
  const out = "playtest/.build";
  sh("snapshot build", ["bunx", "vite", "build", "--outDir", out, "--emptyOutDir", "--logLevel", "warn"]);
  const srv = Bun.spawn(["bunx", "vite", "preview", "--outDir", out, "--port", "4180", "--strictPort"], { stdout: "ignore", stderr: "ignore" });
  for (let i = 0; i < 50; i++) {
    if (await fetch("http://localhost:4180/play/").then((r) => r.ok).catch(() => false)) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  BASE = "http://localhost:4180";
  return () => srv.kill();
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

async function once(quick: boolean) {
  const stop = !has("live") && !has("watch") && !arg("base") ? await snapshot() : () => {};
  const runDir = `playtest/runs/${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}${quick ? "-quick" : ""}`;
  const sweep = ["bun", "scripts/treadmill/sweep.ts", "--run", runDir, "--base", BASE, "--par", quick ? "6" : "8"];
  if (quick) sweep.push("--only", QUICK.join(","), "--fast", "4");
  else sweep.push("--monkey");
  sh("bots", sweep);
  if (!quick && existsSync("scripts/treadmill/critic.ts") && !has("no-critic")) sh("visual critic", [...GEMINI, "bun", "scripts/treadmill/critic.ts", runDir]);
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
  stop();
  const s = mergeRun(runDir);
  console.log(`\n📥 playtest/INBOX.md — ${s.blockers} blockers, ${s.major} major, ${s.total} total (${s.new} new)`);
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
