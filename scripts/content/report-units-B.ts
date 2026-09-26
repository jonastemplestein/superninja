import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BRIDGING_UNIT, EXTENDED_CODE_UNITS, SW_SEQUENCE, gpcsOfUnit, type SwUnitId } from "../../src/content/sw";
import { ACCENT_SENSITIVE } from "./lists";
import { POLICY, parseSegs } from "./core";
import { jevScore } from "./judgements";
import { loadUnit, validateUnits } from "./validate-units";

const units = SW_SEQUENCE.slice(0, SW_SEQUENCE.indexOf("EC26") + 1) as SwUnitId[];
const reports = await validateUnits(units);
const data = new Map(await Promise.all(units.map(async u => [u, await loadUnit(u)] as const)));
const assets: Record<string, { ok: boolean; attempts: number; detail?: string }> = {};
for (const name of ["unit-assets.json", "unit-assets-audio.json"]) {
  const assetFile = join(import.meta.dir, `../../playtest/content/${name}`);
  if (existsSync(assetFile)) Object.assign(assets, JSON.parse(readFileSync(assetFile, "utf8")));
}
const lines = [
  "# Sounds~Write phase B: Year 1 Extended Code and all unit assets",
  "",
  "The files use the September 2024 Sounds~Write policy: no split spellings. Counts are compared with the design quotas in `contentQuota()`. A shortfall remains a shortfall; no validator rule was relaxed to fill it.",
  "",
  "## Unit counts and rule checks",
  "",
  "| Unit | Words | Pictures | Sort coverage | Chains | Sentences | Poly | Failed rules |",
  "|---|---:|---:|---|---:|---:|---:|---:|",
];

function coverage(unit: SwUnitId) {
  const d = data.get(unit)!;
  if (unit === "BR") return BRIDGING_UNIT.sounds.flatMap(s => s.spellings.map(g => `${g} ${d.words.filter(w => w.tags.includes(`sort:${g}`)).length}/10`)).join(", ");
  if (unit === "IC11") return [...new Set(gpcsOfUnit(unit, POLICY).map(k => k.split(">")[0]))].map(g => `${g} ${d.words.filter(w => w.tags.includes(`sort:${g}`)).length}/8`).join(", ");
  const ec = EXTENDED_CODE_UNITS.find(x => x.id === unit);
  if (!ec) return "—";
  return gpcsOfUnit(unit, POLICY).map(k => {
    const [g, p] = k.split(">");
    if (ec.kind === "sound" && p !== ec.sound) return null;
    const n = d.words.filter(w => {
      if (ec.kind === "sound" && !w.tags.includes(`sort:${g}`)) return false;
      const segs = parseSegs(w.segs);
      return segs.filter(s => s.g === g && s.p === p).length === 1 && segs.filter(s => s.p === p).length === 1;
    }).length;
    return `${g}/${p} ${n}/8`;
  }).filter(Boolean).join(", ");
}
for (const r of reports) lines.push(`| ${r.unit} | ${r.counts.words}/${r.quota.words} | ${r.counts.pictures}/${r.quota.pictures} | ${coverage(r.unit)} | ${r.counts.chains}/${r.quota.swapChains} | ${r.counts.sentences}/${r.quota.sentences} | ${r.counts.poly}/${r.quota.polysyllabic} | ${r.rules.filter(x => !x.pass).length} |`);
const failed = reports.flatMap(r => r.rules.filter(x => !x.pass).map(x => `${r.unit} ${x.rule}: ${x.reasons.join("; ")}`));
lines.push("", `Rule statistics: ${failed.length} failed rule groups in ${reports.reduce((n, r) => n + r.rules.length, 0)} checks across ${reports.length} files.`, "");
if (failed.length) lines.push("### Failures", "", ...failed.map(x => `- ${x}`), "");

lines.push("## Content limits and uncertainty", "");
lines.push("The public manual's word lists predate the 2024 change, so consonant-plus-e words were resegmented to the official current policy. The files follow the current `sw.ts` inventory. Its EC1–EC26 inventories now cite official sources and carry no `TODO(verify)` marker. Current Portal word lists are not public, so these example pools still need teacher comparison before release.", "");
const uncertain = EXTENDED_CODE_UNITS.filter(x => x.unit <= 26 && x.gpcsConf !== "official");
for (const ec of uncertain) lines.push(`- ${ec.id} ${ec.title}: inventory confidence **${ec.gpcsConf}** in ` + "`sw.ts`" + ".");
if (!uncertain.length) lines.push("- No EC1–EC26 unit inventory is currently marked uncertain in `sw.ts`; the Bridging Unit still notes that its Lesson 6 script and Lessons 7–8 word lists are not public.");
lines.push("", "Unit 18 includes `<al>`, `<el>`, `<il>` and `<ol>` primarily in polysyllabic words; the one-syllable sort quota for those spellings is unattainable. EC24 `<a>` for /ar/ is strongly accent dependent. The spelling units' per-sound counts can be below eight where the public, age-appropriate one-syllable examples are sparse. EC1–EC3 have no `poly`; polysyllabic lessons begin at EC4. The `poly` pools reuse published Initial Code examples for review across later units.", "");
lines.push("IC3 remains below the word quota because its early code yields few familiar CVC words. IC4 gained four words. IC6 remains at 11; extra candidates did not pass the age, usage or code checks. IC11 and BR exceed their overall word quotas to improve spelling sort coverage, while their rare `<q>`, `<u>`, `<ve>` and `<wh>` baskets still fall short.", "");

lines.push("## Words for human review", "");
const review = units.flatMap(u => data.get(u)!.words.map(w => ({ unit: u, word: w.text, score: jevScore(w.text) })))
  .filter(x => ACCENT_SENSITIVE.has(x.word) || (x.score && (x.score.known >= 0.5 || x.score.unsafe >= 0.35)))
  .map(x => `- ${x.unit} **${x.word}**: ${x.score ? `Jev unfamiliar ${x.score.known.toFixed(2)}, unsuitable ${x.score.unsafe.toFixed(2)}` : "accent sensitive"}.`);
lines.push(...(review.length ? review : ["No selected word crosses the review threshold."]), "");

const all = SW_SEQUENCE.slice(0, SW_SEQUENCE.indexOf("EC26") + 1) as SwUnitId[];
const audio = new Set<string>();
const pics = new Map<string, string>();
for (const u of all) {
  const d = await loadUnit(u);
  for (const w of d.words) { audio.add(w.text); if (w.pic) pics.set(w.text, w.pic); }
  for (const p of d.poly) audio.add(p.text);
}
const missingAudio = [...audio].filter(w => !existsSync(join(import.meta.dir, `../../public/a/w/${w}.mp3`)));
const missingPics = [...pics.keys()].filter(w => !existsSync(join(import.meta.dir, `../../public/a/i/pic_${w}.webp`)));
const madeAudio = Object.entries(assets).filter(([k, x]) => k.startsWith("audio:") && x.ok);
const madePics = Object.entries(assets).filter(([k, x]) => k.startsWith("picture:") && x.ok);
const failures = Object.entries(assets).filter(([, x]) => !x.ok);
const auditFile = join(import.meta.dir, "../../playtest/runs/pics-units/pics-all.json");
const pictureAudit: { word: string; intendedRank: number | null }[] = existsSync(auditFile) ? JSON.parse(readFileSync(auditFile, "utf8")) : [];
lines.push("## Assets", "");
lines.push(`- Unique unit words including poly: **${audio.size}**. New audio clips made: **${madeAudio.length}**. Still missing: **${missingAudio.length}**.`);
lines.push(`- Unique picture-tagged words: **${pics.size}**. New or replacement pictures accepted by blind naming: **${madePics.length}**. Still missing: **${missingPics.length}**.`);
lines.push("- Phase A replacements requested: 16; three more existing pictures (bug, desk, jump) were flagged by the combined validation. Picture takes and blind names are in `playtest/runs/pics-units/unit-asset-audit.json`.");
const phaseAReplacements = "nap hen dot fog fin hug tub pup cub jet hill twig stamp ship quilt squid".split(" ");
lines.push(`- Phase A replacements accepted: **${phaseAReplacements.filter(w => assets[`picture:${w}`]?.ok).length}/16**; additional flagged pictures accepted: **${"bug desk jump".split(" ").filter(w => assets[`picture:${w}`]?.ok).length}/3**. Accepted replacements moved the prior files into .trash/.`);
if (pictureAudit.length) lines.push(`- Independent pic-audit.ts pass: **${pictureAudit.filter(x => x.intendedRank === 1).length}/${pictureAudit.length}** pictures had the intended word as the top name. Its findings are in playtest/runs/pics-units/pics.json.`);
lines.push("- A failed redraw leaves the last published picture in place; that picture may itself have failed the independent audit. Its status remains a failure below. Missing new cards are not silently counted as complete.");
lines.push("", "### Missing or failed assets", "");
if (!failures.length && !missingAudio.length && !missingPics.length) lines.push("None.");
else {
  for (const [k, x] of failures) lines.push(`- ${k}: ${x.detail ?? "failed"} (${x.attempts} takes)`);
  if (missingAudio.length) lines.push(`- Missing audio files: ${missingAudio.join(", ")}`);
  if (missingPics.length) lines.push(`- Missing picture files: ${missingPics.join(", ")}`);
}
lines.push("", "The word and picture model checks are screens. A teacher should review a 10% word sample and the remaining ambiguous pictures before release. The unit file format has no story field; story quotas are not included in this phase's count.", "");

const out = join(import.meta.dir, "../../playtest/content/units-B-report.md");
mkdirSync(join(import.meta.dir, "../../playtest/content"), { recursive: true });
writeFileSync(out, lines.join("\n") + "\n");
console.log(out);
