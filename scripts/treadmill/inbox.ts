// Treadmill stage 4: merge every source's findings for a run into one de-duplicated inbox, tracked across runs.
// playtest/known.json remembers each signature: status open | fixed | wontfix (edit by hand, or `--fixed sig,sig`).
// Writes <runDir>/findings.json and playtest/INBOX.md (newest run, new + regressed first).
// Usage: bun scripts/treadmill/inbox.ts <runDir> [--fixed sig1,sig2] [--wontfix sig]
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import type { Finding, Severity } from "./types";

type Known = Record<string, { status: "open" | "fixed" | "wontfix"; title: string; case: string; source: string; firstSeen: string; lastSeen: string; runs: number; note?: string }>;
const KNOWN = "playtest/known.json";
const ORDER: Severity[] = ["blocker", "major", "minor", "polish"];

export function mergeRun(runDir: string) {
  const known: Known = existsSync(KNOWN) ? JSON.parse(readFileSync(KNOWN, "utf8")) : {};
  const arg = (k: string) => {
    const i = process.argv.indexOf(`--${k}`);
    return i > 0 ? process.argv[i + 1].split(",") : [];
  };
  for (const s of arg("fixed")) known[s] && (known[s].status = "fixed");
  for (const s of arg("wontfix")) known[s] && (known[s].status = "wontfix");

  const read = (f: string): Finding[] => {
    try {
      const j = JSON.parse(readFileSync(`${runDir}/${f}`, "utf8"));
      return Array.isArray(j) ? j : j.findings ?? [];
    } catch {
      return [];
    }
  };
  const files = readdirSync(runDir).filter((f) => /^(sweep|critic|pics|joins|script|sound|sound-splitter|soak|persona-.*|jev-.*)\.json$/.test(f));
  const bySig = new Map<string, Finding>();
  for (const f of files) for (const x of read(f)) if (x?.sig && !bySig.has(x.sig)) bySig.set(x.sig, x);
  const findings = [...bySig.values()];

  const now = new Date().toISOString().slice(0, 16);
  const tagged = findings.map((f) => {
    const k = known[f.sig];
    const tag = !k ? "new" : k.status === "fixed" ? "regressed" : k.status === "wontfix" ? "wontfix" : "open";
    known[f.sig] = { status: k?.status === "wontfix" ? "wontfix" : "open", title: f.title, case: f.case, source: f.source, firstSeen: k?.firstSeen ?? now, lastSeen: now, runs: (k?.runs ?? 0) + 1, note: k?.note };
    return { ...f, tag };
  });
  // deterministic sources that didn't reappear for a case we covered this run are probably fixed
  let sweepCases: string[] = [];
  try { sweepCases = Object.keys(JSON.parse(readFileSync(`${runDir}/sweep.json`, "utf8")).results).map((c) => c.replace("~monkey", "")); } catch {}
  const gone = Object.entries(known).filter(([sig, k]) => k.status === "open" && !bySig.has(sig) && (k.source === "invariant" || k.source === "bot") && sweepCases.includes(k.case));
  for (const [, k] of gone) k.status = "fixed";
  for (const s of arg("wontfix")) known[s] && (known[s].status = "wontfix"); // also dismisses first sightings
  writeFileSync(KNOWN, JSON.stringify(known, null, 1));
  writeFileSync(`${runDir}/findings.json`, JSON.stringify(tagged, null, 1));

  // ------------------------------------------------------------ INBOX.md
  const live = tagged.filter((f) => f.tag !== "wontfix");
  const count = (sev: Severity) => live.filter((f) => f.severity === sev).length;
  const rel = (p: string) => relative("playtest", `${runDir}/${p}`);
  const line = (f: (typeof tagged)[number]) =>
    `- **${f.title}** · \`${f.case}\` · ${f.source}${f.tag === "new" ? " · 🆕" : f.tag === "regressed" ? " · ⚠️ regressed" : ""}\n  ${f.detail.replace(/\n+/g, " ").slice(0, 400)}${f.evidence?.length ? `\n  ${f.evidence.slice(0, 3).map((e) => `[${e.split("/").pop()}](${rel(e)})`).join(" · ")}` : ""}${f.repro ? `\n  repro: ${f.repro.slice(0, 200)}` : ""}\n  <sub>${f.sig}</sub>`;
  let sweep: any = {};
  try { sweep = JSON.parse(readFileSync(`${runDir}/sweep.json`, "utf8")); } catch {}
  const res = Object.values<any>(sweep.results ?? {});
  let md = `# Playtest inbox\n\nRun \`${runDir}\` · ${now} · bots finished ${res.filter((r) => r.ok).length}/${res.length} cases in ${sweep.secs ?? "?"}s at ${sweep.fast ?? "?"}× · sources: ${files.join(", ")}\n\n`;
  md += `**${count("blocker")} blockers · ${count("major")} major · ${count("minor")} minor · ${count("polish")} polish** — ${live.filter((f) => f.tag === "new").length} new, ${live.filter((f) => f.tag === "regressed").length} regressed, ${gone.length} auto-closed since last run.\n\n`;
  md += `Triage: fix, then rerun; mark false alarms with \`bun scripts/treadmill/inbox.ts ${runDir} --wontfix <sig>\`.\n\n`;
  // Jev triage (jev-triage.ts) groups findings that share a root cause: show those first, most severe and child-facing on top
  try {
    const tri = JSON.parse(readFileSync(`${runDir}/jev-triage.json`, "utf8"));
    const clusters: { id: string; title: string; findings: number; cases: string[]; severity: Severity; area: string; impact: number; childFacing: number }[] = tri.clusters ?? [];
    const liveSigs = new Set(live.map((f) => f.sig));
    const open = clusters.filter((c) => Object.entries<any>(tri.triage ?? {}).some(([sig, t]) => t.cluster === c.id && liveSigs.has(sig)));
    open.sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity) || b.impact * b.childFacing - a.impact * a.childFacing);
    if (open.length) md += `## Root causes (Jev triage)\n\n${open.map((c) => `- **[${c.severity}] ${c.title}** — ${c.area}, ${c.findings} findings in ${c.cases.slice(0, 8).join(", ")}${c.cases.length > 8 ? ` +${c.cases.length - 8}` : ""}`).join("\n")}\n\n`;
  } catch {}
  for (const sev of ORDER) {
    const xs = live.filter((f) => f.severity === sev).sort((a, b) => (a.tag === "open" ? 1 : 0) - (b.tag === "open" ? 1 : 0) || a.case.localeCompare(b.case));
    if (xs.length) md += `## ${sev[0].toUpperCase() + sev.slice(1)} (${xs.length})\n\n${xs.map(line).join("\n")}\n\n`;
  }
  if (gone.length) md += `## Auto-closed (no longer seen)\n\n${gone.map(([s, k]) => `- ~~${k.title}~~ \`${k.case}\` <sub>${s}</sub>`).join("\n")}\n`;
  writeFileSync("playtest/INBOX.md", md);
  return { total: live.length, blockers: count("blocker"), major: count("major"), new: live.filter((f) => f.tag === "new").length };
}

if (import.meta.main) {
  const runDir = process.argv[2];
  if (!runDir) throw new Error("usage: inbox.ts <runDir>");
  console.log(mergeRun(runDir));
}
