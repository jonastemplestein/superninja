// bun playtest/speech-templates/design/sizes.ts
// Sizes the catalogue (catalogue.ts) per tier: clips to render, clips already recorded (adopted families and lines),
// bytes at 24 kHz / 48 kbps, decoded size at 24 kHz, and render time. Domain sizes: the unit data in src/content/units
// (via ../spaces.json and ../estimate.json, the inventory lane's counts) plus two counts made here (two-sound words,
// swap chains), scaled to the planned programme (≈ 850 words to the end of Year 1, ≈ 2,100 and ≈ 800 pictures to EC49).
// Writes sizes.json next to this file and prints the tables that docs/SPEECH_TEMPLATES.md quotes.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LINES } from "../../../src/content/lines";
import { CATALOGUE } from "./catalogue";
import { parse, type TemplateDef } from "./template";

const here = import.meta.dir;
const root = join(here, "../../..");
const est = JSON.parse(readFileSync(join(here, "../estimate.json"), "utf8"));
const tiers = ["R", "Y1", "Y2"] as const;
type Tier = (typeof tiers)[number];

// ---- counts made here from the unit files: two-sound words (a last-sound first ask) and swap chains
const sw = await import(join(root, "src/content/sw.ts"));
const seq: string[] = [...sw.SW_SEQUENCE];
const tierOf = (id: string): Tier => (id.startsWith("IC") || id === "BR" ? "R" : Number(id.slice(2)) <= 26 ? "Y1" : "Y2");
const seen = new Set<string>();
const acc = { twoSound: 0, words: 0, chains: 0 };
const cum: Record<Tier, typeof acc> = { R: { ...acc }, Y1: { ...acc }, Y2: { ...acc } };
for (const t of tiers) {
  for (const id of seq.filter((i) => tierOf(i) === t)) {
    const m = await import(join(root, "src/content/units", `${id}.ts`));
    for (const w of m.words as { text: string; segs: string }[]) {
      if (seen.has(w.text)) continue;
      seen.add(w.text);
      acc.words++;
      if (String(w.segs).split(".").length === 2) acc.twoSound++;
    }
    acc.chains += (m.chains ?? []).length;
  }
  cum[t] = { ...acc };
}
const plan = est.plan as Record<Tier, Record<string, number>>;
const scale = (t: Tier, n: number) => Math.round((n * plan[t].words) / cum[t].words);
const units: Record<Tier, number> = { R: seq.filter((i) => tierOf(i) === "R").length, Y1: seq.filter((i) => tierOf(i) !== "Y2").length, Y2: seq.length };

// ---- domain sizes per tier. Upper bounds where the reachable set isn't known yet (noted in the doc).
const D: Record<string, Record<Tier, number>> = {};
const set = (k: string, f: (t: Tier) => number) => (D[k] = { R: f("R"), Y1: f("Y1"), Y2: f("Y2") });
set("words", (t) => plan[t].words);
set("build-items", (t) => plan[t].words + scale(t, cum[t].twoSound)); // the first ask names the word; a VC word may start at the end
set("fixed-next-last", () => 2);
set("demo-words", (t) => 2 * units[t]);
set("demo-positions", (t) => 3 * 2 * units[t]);
set("read-words", (t) => ({ R: 120, Y1: 180, Y2: 240 })[t]); // 2 readers × read-check words (12 pairs today, early levels only)
set("read-wrong", (t) => ({ R: 36, Y1: 54, Y2: 72 })[t]);
set("sort-words", (t) => ({ R: 90, Y1: 90 + plan.Y1.words - plan.R.words, Y2: 90 + plan.Y2.words - plan.R.words })[t]);
set("sort-demos", (t) => ({ R: 9, Y1: 25, Y2: 35 })[t]);
set("chest-examples", (t) => ({ R: 12, Y1: 72, Y2: 129 })[t]);
set("swap-steps", (t) => plan[t].steps);
set("swap-starts", (t) => scale(t, cum[t].chains));
set("swap-demo-steps", (t) => scale(t, cum[t].chains));
set("pictures", (t) => plan[t].pics);
set("three-sound-pictures", (t) => plan[t].cvcPics);
set("find-pictures", () => plan.R.pics); // the pre-code picture games (W1, listen levels, placement)
set("demo-pictures", () => 20);
set("fastslow-pictures", () => 6);
set("slowpick-pictures", () => 10);
set("notice-pairs", () => 1);
set("demo-pairs", () => 20);
set("hunt-pairs", (t) => ({ R: 5, Y1: 20, Y2: 24 })[t]);
set("stories", (t) => ({ R: 6, Y1: 30, Y2: 60 })[t]);
set("specials", (t) => ({ R: 15, Y1: 35, Y2: 60 })[t]);
set("sounds", (t) => plan[t].sounds);
set("spellings", (t) => plan[t].gpcs);
set("second-spellings", (t) => ({ R: 12, Y1: 72, Y2: 129 })[t]);
set("multi-spelling-sounds", (t) => ({ R: 9, Y1: 25, Y2: 35 })[t]);
set("sound-pairs", (t) => ({ R: 3, Y1: 49, Y2: 84 })[t]);
set("letter-counts", () => 3);
set("ways-counts", () => 9);
set("won-counts", () => 3);
set("fixed-x", () => 1);
set("placement-gaps", () => 20);
set("fixed", () => 1);

// ---- per template
const HAS = new Set(LINES.map((l) => l.id));
const wordsOf = (s: string) => s.replace(/\{[^}]+\}/g, "word").split(/\s+/).filter((w) => /\w/.test(w)).length;
const secs = (text: string) => wordsOf(text) / 2.6 + 0.25; // Sensei's median pace, plus the finished clip's edges
const KB = (s: number) => 6.3 * s + 0.3; // measured: a 1.25 s sentence is 7.9 KB at 24 kHz CBR 48 kbps (delivery.md §3.1)
const DECODED = (s: number) => (s * 24000 * 4) / 1024; // KiB at 24 kHz float32 (delivery.md §4.2)
const legacyRecorded = (pattern: string) => {
  if (!/<[a-z0-9]+>/.test(pattern)) return HAS.has(pattern) ? 1 : 0;
  const re = new RegExp(`^${pattern.replace(/<[a-z0-9]+>/g, "[a-z0-9_]+")}$`);
  return LINES.filter((l) => re.test(l.id)).length;
};
interface Row { id: string; tier: TemplateDef["tier"]; domain: string; lane: string; inventory: number[]; pieces: number; perMember: number; fixed: number; clips: Record<Tier, number>; recorded: number; secs: number; kb: number }
const rows: Row[] = CATALOGUE.map((t) => {
  const speech = parse(t).filter((p) => p.kind === "speech") as Extract<ReturnType<typeof parse>[number], { kind: "speech" }>[];
  let perMember = 0, fixed = 0, recorded = 0, s = 0;
  speech.forEach((p, i) => {
    const src = t.src?.[i];
    if (p.slots.length) perMember++;
    else fixed++;
    if (src) recorded += legacyRecorded(src);
    s += secs(p.text);
  });
  // a piece keyed only by small slots (a reader's name, a count, first/next/last) has that many members, not the domain's
  const SMALL: Partial<Record<string, number>> = { name: 2, pos: 3, count: 3, n: 9 };
  const clips = Object.fromEntries(tiers.map((tier) => [tier, speech.reduce((n, p) => {
    if (!p.slots.length) return n + 1;
    const small = p.slots.every((k) => SMALL[t.slots[k]] !== undefined);
    const dom = D[t.domain]?.[tier] ?? NaN;
    return n + (small ? Math.min(dom, p.slots.reduce((m, k) => m * SMALL[t.slots[k]]!, 1)) : dom);
  }, 0)])) as Record<Tier, number>;
  return { id: t.id, tier: t.tier, domain: t.domain, lane: t.lane, inventory: t.inventory ?? [], pieces: speech.length, perMember, fixed, clips, recorded, secs: s / Math.max(1, speech.length), kb: KB(s / Math.max(1, speech.length)) };
});

const total = (f: (r: Row) => boolean, tier: Tier) => rows.filter(f).reduce((n, r) => n + r.clips[tier], 0);
const bytes = (f: (r: Row) => boolean, tier: Tier) => rows.filter(f).reduce((n, r) => n + r.clips[tier] * r.kb, 0) / 1024;
const recorded = (f: (r: Row) => boolean) => rows.filter(f).reduce((n, r) => n + r.recorded, 0);
const byTier = (k: TemplateDef["tier"]) => (r: Row) => r.tier === k;
const all = () => true;

const out = { domains: D, cum, rows, totals: {} as Record<string, unknown> };
console.log("\n| tier | templates | clips: Year R | to end of Y1 | whole programme | recorded today (adopted) | MB (whole programme) |");
console.log("|---|---:|---:|---:|---:|---:|---:|");
for (const k of ["whole", "sound", "sequence", "splice"] as const) {
  const f = byTier(k);
  const n = rows.filter(f).length;
  if (!n) { console.log(`| ${k} | 0 | 0 | 0 | 0 | 0 | 0 |`); continue; }
  console.log(`| ${k} | ${n} | ${total(f, "R").toLocaleString()} | ${total(f, "Y1").toLocaleString()} | ${total(f, "Y2").toLocaleString()} | ${recorded(f)} | ${bytes(f, "Y2").toFixed(0)} |`);
}
console.log(`| **all** | ${rows.length} | ${total(all, "R").toLocaleString()} | ${total(all, "Y1").toLocaleString()} | ${total(all, "Y2").toLocaleString()} | ${recorded(all)} | ${bytes(all, "Y2").toFixed(0)} |`);
for (const tier of tiers) {
  const n = total(all, tier);
  const newClips = n - recorded(all);
  (out.totals as any)[tier] = {
    clips: n, newClips, mb: +bytes(all, tier).toFixed(1),
    files: n + 4200,
    // two takes a clip (three for a lead-in), ≈ 4 s a take with the machine gates, 6 in parallel
    renderHours: +((newClips * 2.1 * 4) / 6 / 3600).toFixed(1),
    ttsDollars: +(newClips * 2.1 * 0.00034).toFixed(2),
  };
}
console.log("\ntotals", JSON.stringify(out.totals));
console.log("\n| template | tier | domain | pieces (per member + fixed) | R | Y1 | all | recorded today | s/clip | KB/clip |");
console.log("|---|---|---|---|---:|---:|---:|---:|---:|---:|");
for (const r of [...rows].sort((a, b) => b.clips.Y2 - a.clips.Y2)) console.log(`| \`${r.id}\` | ${r.tier} | ${r.domain} | ${r.perMember} + ${r.fixed} | ${r.clips.R.toLocaleString()} | ${r.clips.Y1.toLocaleString()} | ${r.clips.Y2.toLocaleString()} | ${r.recorded} | ${r.secs.toFixed(2)} | ${r.kb.toFixed(1)} |`);
console.log("\ndomains", JSON.stringify(D));
console.log("counted here", JSON.stringify(cum), "units", JSON.stringify(units));
writeFileSync(join(here, "sizes.json"), JSON.stringify(out, null, 1));
