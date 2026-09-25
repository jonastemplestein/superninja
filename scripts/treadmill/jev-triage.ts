// @treadmill-stage — triage for a treadmill run: group findings, rate each group with Jev, merge groups that
// share a root cause. Adds no new findings; it annotates existing ones so the inbox can sort and collapse them.
//   doppler run -p os -c dev -- bun scripts/treadmill/jev-triage.ts <runDir>
// Reads <runDir>/{sweep,critic,pics,persona-*}.json. Writes <runDir>/jev-triage.json:
//   { findings: [], triage: { [sig]: { group, cluster, childFacing, impact, area, severity, stuck? } }, clusters: [...] }
// and a copy at playtest/jev/triage-<run>.json. ~20–40 group calls + ≤150 pair calls, a few seconds, < $0.01.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { Finding, Severity } from "./types";
import { ask, choice, noul, pool, r2, score, usage, writeOut } from "./jev-lib";

const runDir = process.argv[2];
if (!runDir || !existsSync(runDir)) throw new Error("usage: jev-triage.ts <runDir>");

// ---------------------------------------------------------------- load + deterministic grouping
const read = (f: string): Finding[] => {
  try {
    const j = JSON.parse(readFileSync(join(runDir, f), "utf8"));
    return Array.isArray(j) ? j : j.findings ?? [];
  } catch {
    return [];
  }
};
const files = readdirSync(runDir).filter((f) => /^(sweep|critic|pics|persona-.*)\.json$/.test(f));
const all = [...new Map(files.flatMap(read).filter((f) => f?.sig).map((f) => [f.sig, f])).values()];

/** Case-free key: the same check failing the same way on many levels is one group. */
const groupKey = (f: Finding) => {
  const parts = f.sig.split(":");
  const rest = parts.slice(2).join(":").replace(/\[aria-label="[^"]*"\]/g, "[label]").replace(/\d+×\d+px/g, "N×Npx");
  return `${parts[0]}:${rest}`.slice(0, 120);
};
interface Group { key: string; findings: Finding[]; cases: string[] }
const groups: Group[] = [];
for (const f of all) {
  const k = groupKey(f);
  let g = groups.find((x) => x.key === k);
  if (!g) groups.push((g = { key: k, findings: [], cases: [] }));
  g.findings.push(f);
  if (!g.cases.includes(f.case)) g.cases.push(f.case);
}

/** The last frames of a case's timeline (bot scene state + captions), for "did it get stuck?" questions. */
function timeline(c: string) {
  for (const d of [c, `${c}~monkey`]) {
    const f = join(runDir, "cases", d, "meta.json");
    if (!existsSync(f)) continue;
    const m = JSON.parse(readFileSync(f, "utf8"));
    return { intent: m.intent, lastFrames: m.frames.slice(-12).map((x: any) => ({ t: x.t, state: x.snState ?? x.__snState ?? null, caption: x.caption || undefined })) };
  }
  return undefined;
}

const groupState = (g: Group) => {
  const f = g.findings[0];
  return {
    game: GAME,
    finding: { source: f.source, reportedSeverity: f.severity, title: f.title, detail: f.detail.slice(0, 600) },
    occurrences: g.findings.length,
    cases: g.cases.slice(0, 20),
    ...(/did-not-finish|stuck|timeout/.test(g.key) ? { timeline: timeline(g.cases[0]) } : {}),
  };
};

const GAME =
  "Super Ninja, a phonics game for British children aged 3 to 8, played on phones. Findings come from automated bots that play every level at 3× speed, " +
  "a 'monkey' bot that taps randomly the way a small child does (so what it breaks, children will break too), DOM invariant checks (tap targets covered, too small or off screen), a vision critic and persona playtesters.";

// ---------------------------------------------------------------- questions
const GROUP_QS = {
  childFacing: noul(
    "Would a child playing the real game on a phone actually see, hear or feel this problem? Answer false for developer-console warnings with no visible effect, artefacts of the test bot or its 3× speed, and checks that are probably false alarms.",
    "a child would experience it",
    "invisible to the child, a bot artefact, or a false alarm",
  ),
  impact: score("How much would this hurt a 4-year-old's play session if it is real?", [
    "no effect on the child",
    "cosmetic: something looks a bit off",
    "slows the child down or confuses them for a moment",
    "blocks progress, crashes, loses work or upsets the child",
  ]),
  area: choice("Which part of the game does the fix belong to?", {
    layout: "screen layout: overlap, size or position of things on screen",
    art: "pictures, sprites, colours or visual clarity",
    audio: "speech, sounds or music",
    content: "words, spoken lines, teaching order or pedagogy",
    logic: "game rules, progression, scoring or saved state",
    crash: "errors, exceptions, crashes or freezes",
    harness: "the test bot or checker itself, not the game",
  }),
  severity: choice("What severity should this have in the bug inbox?", {
    blocker: "crashes, soft-locks or makes a level unplayable",
    major: "a real problem most children would hit, or one that breaks the teaching",
    minor: "a real but small problem, or one only some children hit",
    polish: "cosmetic, or developer-only",
  }),
};
const STUCK_Q = {
  stuck: choice("The bot did not finish this level in time. Looking at the timeline's last frames, what happened?", {
    stuck: "no progress: the same state repeats, nothing changes",
    slow: "still making progress (state or targets keep changing); the level is just long",
    unclear: "not enough information",
  }),
};
const PAIR_Q = {
  same: noul(
    "Findings A and B come from the same automated test run. Are they most likely caused by the same underlying bug, so that one code fix would make both go away? Similar symptoms on different screens are NOT enough; they need a shared cause (the same error, the same component, the same overlapping element).",
    "the same root cause; one fix removes both",
    "different causes, or no evidence they are linked",
  ),
};

// ---------------------------------------------------------------- run
const t0 = performance.now();
const rated = await pool(groups, 16, async (g) => {
  const st = groupState(g);
  const a = await ask(st, "timeline" in st ? { ...GROUP_QS, ...STUCK_Q } : GROUP_QS);
  return { g, a };
});

// candidate pairs: share a case, or one is a critic/persona report and the other a bot report on the same case
const pairs: [number, number][] = [];
for (let i = 0; i < groups.length; i++)
  for (let j = i + 1; j < groups.length; j++) {
    const shared = groups[i].cases.filter((c) => groups[j].cases.includes(c)).length;
    const kindI = groups[i].key.split(":")[1], kindJ = groups[j].key.split(":")[1];
    if (shared > 0 || (kindI === kindJ && kindI)) pairs.push([i, j]);
  }
const PAIR_CAP = 150;
const pairRes = await pool(pairs.slice(0, PAIR_CAP), 16, async ([i, j]) => {
  const s = (g: Group) => ({ title: g.findings[0].title, detail: g.findings[0].detail.slice(0, 300), source: g.findings[0].source, cases: g.cases.slice(0, 12) });
  const a = await ask({ game: GAME, A: s(groups[i]), B: s(groups[j]), casesInBoth: groups[i].cases.filter((c) => groups[j].cases.includes(c)) }, PAIR_Q);
  return { i, j, p: r2((a.same as any).noul) };
});

// union-find over confident merges
const parent = groups.map((_, i) => i);
const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
const MERGE_AT = 0.6;
for (const r of pairRes) if (r.p >= MERGE_AT) parent[find(r.i)] = find(r.j);

const val = (a: any) => (a.type === "noul" ? a.noul : a.type === "score" ? a.score / 3 : a.choice);
/** Separate Jev answers can disagree (a "blocker" nobody sees); combine them with a small explicit policy. */
function policy(a: any): Severity {
  if (a.stuck?.choice === "slow" && a.stuck.confidence >= 0.3) return "minor"; // a long level, not a soft-lock
  if (a.childFacing.noul < 0.35) return "polish"; // developer-only or bot artefact
  return a.severity.choice as Severity;
}
const rows = rated.map(({ g, a }, i) => ({
  i,
  key: g.key,
  cluster: find(i),
  n: g.findings.length,
  cases: g.cases,
  title: g.findings[0].title,
  source: g.findings[0].source,
  reported: g.findings[0].severity,
  childFacing: r2(val(a.childFacing)),
  impact: r2(val(a.impact)),
  area: val(a.area) as string,
  severity: policy(a),
  jevSeverity: val(a.severity) as Severity,
  ...((a as any).stuck ? { stuck: (a as any).stuck.choice, stuckP: (a as any).stuck.probabilities } : {}),
}));
const rank: Record<Severity, number> = { blocker: 0, major: 1, minor: 2, polish: 3 };
const clusters = [...new Set(rows.map((r) => r.cluster))]
  .map((c) => {
    const rs = rows.filter((r) => r.cluster === c).sort((a, b) => b.impact - a.impact);
    return {
      id: `c${c}`,
      title: rs[0].title,
      groups: rs.map((r) => r.key),
      findings: rs.reduce((n, r) => n + r.n, 0),
      cases: [...new Set(rs.flatMap((r) => r.cases))],
      impact: Math.max(...rs.map((r) => r.impact)),
      childFacing: Math.max(...rs.map((r) => r.childFacing)),
      severity: rs.map((r) => r.severity).sort((a, b) => rank[a] - rank[b])[0],
      area: rs[0].area,
    };
  })
  // Jev's severity first, then child-facing impact; developer-only noise sinks
  .sort((a, b) => rank[a.severity] - rank[b.severity] || b.impact * b.childFacing - a.impact * a.childFacing);

const triage: Record<string, unknown> = {};
for (const r of rows)
  for (const f of groups[r.i].findings)
    triage[f.sig] = { group: r.key, cluster: `c${r.cluster}`, childFacing: r.childFacing, impact: r.impact, area: r.area, severity: r.severity, ...(r.stuck ? { stuck: r.stuck } : {}) };

const u = usage(performance.now() - t0);
const out = { generated: new Date().toISOString(), run: runDir, usage: u, input: { files, findings: all.length, groups: groups.length, pairsAsked: pairRes.length, pairsSkipped: Math.max(0, pairs.length - PAIR_CAP) }, clusters, groups: rows, merges: pairRes.filter((r) => r.p >= 0.4).map((r) => ({ a: groups[r.i].key, b: groups[r.j].key, p: r.p })), findings: [] as Finding[], triage };
writeFileSync(join(runDir, "jev-triage.json"), JSON.stringify(out, null, 1) + "\n");
const copy = writeOut(`triage-${basename(runDir)}.json`, out);
console.log(`${all.length} findings → ${groups.length} groups → ${clusters.length} clusters (${pairRes.length} pairs asked)\n${JSON.stringify(u)}`);
for (const c of clusters) console.log(`${c.severity.padEnd(7)} impact ${c.impact.toFixed(2)} child ${c.childFacing.toFixed(2)} ${c.area.padEnd(8)} ×${String(c.findings).padEnd(3)} ${c.title.slice(0, 70)}${c.groups.length > 1 ? `  [+${c.groups.length - 1} merged]` : ""}`);
for (const r of rows.filter((r) => r.stuck)) console.log(`did-not-finish ${r.cases.join(",")}: ${r.stuck} ${JSON.stringify(r.stuckP)}`);
console.log(`→ ${join(runDir, "jev-triage.json")} and ${copy}`);
