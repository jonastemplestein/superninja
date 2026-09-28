// bun playtest/speech-templates/design/report.ts
// Writes docs/speech-templates/catalogue.md: the proposed catalogue (catalogue.ts) with its sizes (sizes.json), the
// recorded pieces it adopts, the lines to re-record and the new lines it needs, and what happens to every lead-in and
// continuation line in lines.ts (the 297 lines that end or start on "..."). Read-only on the game's files.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LINES, RETIRED_LINES } from "../../../src/content/lines";
import { CATALOGUE } from "./catalogue";
import { check, parse, positions, type TemplateDef } from "./template";

const here = import.meta.dir;
const root = join(here, "../../..");
const sizes = JSON.parse(readFileSync(join(here, "sizes.json"), "utf8"));
const rowOf = new Map<string, any>(sizes.rows.map((r: any) => [r.id, r]));
const TEXT = new Map(LINES.map((l) => [l.id, l.text]));
const retired = new Set(Object.keys(RETIRED_LINES ?? {}));
const norm = (s: string) => s.toLowerCase().replace(/\.\.\.|…/g, " ").replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
const esc = (s: string) => s.replace(/\|/g, "\\|");

// ---- adopted pieces, re-records, requested lines
const reRecord: string[] = [];
const requested = new Map<string, string[]>();
const adoptedBy = new Map<string, string>();
const replacedBy = new Map<string, string[]>();
const sample: Record<string, string> = { pos: "next", name: "kai", n: "3", count: "two", picture: "mop", word: "mat", spelling: "m_m", sound: "m" };
for (const t of CATALOGUE) {
  const speech = parse(t).filter((p) => p.kind === "speech") as Extract<ReturnType<typeof parse>[number], { kind: "speech" }>[];
  speech.forEach((p, i) => {
    const src = t.src?.[i];
    if (!src) return;
    if (/<[a-z0-9]+>/.test(src)) {
      const re = new RegExp(`^${src.replace(/<[a-z0-9]+>/g, "[a-z0-9_]+")}$`);
      const members = LINES.filter((l) => re.test(l.id));
      for (const l of members) adoptedBy.set(l.id, t.id);
      // a family's shape must match the piece: a lead-in ends on "...", a continuation starts on it
      const wrong = members.filter((l) => p.lead !== /(\.\.\.|…)$/.test(l.text.trim()) || p.cont !== /^(\.\.\.|…)/.test(l.text.trim()));
      if (wrong.length) reRecord.push(`| \`${src}\` (${wrong.length} of ${members.length}) | ${esc(wrong[0].text)} | ${esc((p.cont ? "..." : "") + p.text + (p.lead ? "..." : ""))} | \`${t.id}\` |`);
      return;
    }
    adoptedBy.set(src, t.id);
    const have = TEXT.get(src);
    if (have === undefined) return;
    const want = p.text + (p.lead ? "..." : "");
    const shapeOk = p.lead === /(\.\.\.|…)$/.test(have.trim()) && p.cont === /^(\.\.\.|…)/.test(have.trim());
    if (norm(have) !== norm(p.text) || !shapeOk) reRecord.push(`| \`${src}\` | ${esc(have)} | ${esc((p.cont ? "..." : "") + want)} | \`${t.id}\` |`);
  });
  for (const name of t.slots.name ? ["kai", "suki"] : ["kai"]) {
    const fb = t.fallback?.(Object.fromEntries(Object.entries(t.slots).map(([k]) => [k, k === "name" ? name : sample[k] ?? "mat"]))) ?? [];
    for (const s of fb) if ("line" in s && !TEXT.has(s.line) && !requested.get(s.line)?.includes(t.id)) requested.set(s.line, [...(requested.get(s.line) ?? []), t.id]);
  }
  for (const r of t.replaces ?? []) for (const m of r.matchAll(/(?<![a-z0-9_<])([a-z][a-z0-9]*(?:_(?:[a-z0-9]+|<[a-z0-9]+>))*)(?![a-z0-9_>])/g)) {
    const id = m[1];
    if (!id.includes("_") && !TEXT.has(id)) continue;
    const re = /<[a-z]+>/.test(id) ? new RegExp(`^${id.replace(/<[a-z]+>/g, "[a-z0-9_]+")}$`) : null;
    for (const l of LINES) if (l.id === id || re?.test(l.id)) replacedBy.set(l.id, [...new Set([...(replacedBy.get(l.id) ?? []), t.id])]);
  }
}

// ---- every lead-in / continuation line
const lead = LINES.filter((l) => /(\.\.\.|…)$/.test(l.text.trim()) || /^(\.\.\.|…)/.test(l.text.trim()));
const disposition = (id: string) =>
  retired.has(id) ? "retired already" : adoptedBy.has(id) ? `adopted by \`${adoptedBy.get(id)}\`` : replacedBy.has(id) ? `replaced by ${replacedBy.get(id)!.map((x) => `\`${x}\``).join(", ")}` : "";
const leadRows = lead.map((l) => ({ id: l.id, text: l.text, d: disposition(l.id) }));
const counts = { adopted: leadRows.filter((r) => r.d.startsWith("adopted")).length, replaced: leadRows.filter((r) => r.d.startsWith("replaced")).length, retired: leadRows.filter((r) => r.d.startsWith("retired")).length, open: leadRows.filter((r) => !r.d).length };

// ---- families: collapse the per-member ids (fs_mop, fs_sun…) into one row each
const famOf = (id: string) => id.replace(/^(fs|mid|fm_name|fm_diff|fm_not_in|tg_[a-z]+_[a-z]+|tp_[a-z]+|t_ways|tv_won|tv_pocket_more|tv_pocket_middle_more)_?.*$/, (m, a) => (m === id && a ? `${a}_<…>` : m));
const grouped = new Map<string, { ids: string[]; text: string; d: string }>();
for (const r of leadRows) {
  const k = /^(fs|mid|tg|tp|t_ways|tv_won|tv_pocket_more|tv_pocket_middle_more)_/.test(r.id) ? famOf(r.id) : r.id;
  const g = grouped.get(k) ?? { ids: [], text: r.text, d: r.d };
  g.ids.push(r.id);
  if (!g.d && r.d) g.d = r.d;
  grouped.set(k, g);
}

const T = (t: TemplateDef) => {
  const r = rowOf.get(t.id);
  const src = Object.entries(t.src ?? {}).map(([i, s]) => `${i}: \`${s}\``).join(", ");
  const pos = Object.entries(positions(t)).map(([k, v]) => `${k}: ${v}`).join(", ");
  return `| \`${t.id}\` | ${esc(t.text)} | ${pos || "–"} | ${t.tier} | ${t.domain} | ${r.clips.R.toLocaleString()} / ${r.clips.Y1.toLocaleString()} / ${r.clips.Y2.toLocaleString()} | ${r.recorded} | ${src || "–"} | ${(t.inventory ?? []).join(", ")} | ${t.lane} |`;
};
const warnings = CATALOGUE.flatMap((t) => check(t).warnings);
const md = `# Speech templates: the catalogue, generated

*Generated by \`bun playtest/speech-templates/design/report.ts\` from \`catalogue.ts\` and \`sizes.json\` in \`playtest/speech-templates/design/\`. Don't edit by hand: change the catalogue and re-run. The design is [../SPEECH_TEMPLATES.md](../SPEECH_TEMPLATES.md).*

${CATALOGUE.length} templates. Clips are the speech pieces to render per tier (Year R / to the end of Year 1 / the whole programme, at the planned 2,100 words and 800 pictures); pure sounds, slow words and word clips are the existing library and are not counted. Slot positions: a text slot's place in its intonation phrase (I initial, M medial, F final); a clip slot's place in the sentence (end, phrase: a phrase carries on after it, alone: between sentences). "Recorded" counts the pieces already in \`public/a/l/\` that the template adopts (legacy families and lead-ins). Pieces are numbered from 0 in speaking order; \`src\` maps a piece to the line or family that already records it.

## 1. The catalogue

| template | text | slot positions | tier | domain | clips R / Y1 / all | recorded | src | inventory rows | call-site lanes (FIX_PLAN §2) |
|---|---|---|---|---|---|---:|---|---|---|
${CATALOGUE.map(T).join("\n")}

**Totals:** ${Object.entries(sizes.totals).map(([k, v]: [string, any]) => `${k === "Y2" ? "whole programme" : k === "Y1" ? "to the end of Year 1" : "Year R"}: ${v.clips.toLocaleString()} clips (${v.newClips.toLocaleString()} new), ${v.mb} MB`).join("; ")}.

## 2. Lines to re-record for their template (${reRecord.length})

A piece a template adopts must say exactly the template's words, in the template's shape (a lead-in ends on "...", recorded suspended; a continuation starts on "..."). These don't yet.

| line | recorded text | template text | template |
|---|---|---|---|
${reRecord.join("\n")}

## 3. New lines the fallbacks need (${requested.size})

| line | text | used by |
|---|---|---|
${[...requested].map(([id, by]) => `| \`${id}\` | ${id === "tv_listen_word" ? "Listen to your word." : id.startsWith("tv_kai") ? "Here's how Kai reads it." : id.startsWith("tv_suki") ? "Here's how Suki reads it." : "?"} | ${by.map((b) => `\`${b}\``).join(", ")} |`).join("\n")}

## 4. Every lead-in and continuation line in lines.ts (${lead.length}: ${counts.adopted} adopted, ${counts.replaced} replaced, ${counts.retired} retired already, ${counts.open} not a template's)

"Adopted" lines stay: a template plays them as one of its pieces. "Replaced" lines retire once their template ships (add them to \`RETIRED_LINES\`). A line with no entry is not part of a template: it is either a lead-in to a stand-alone clip that the migration re-records as a whole sentence (§6.3 of the design), or an unused line for integration to retire. Per-member families are collapsed to one row.

| line(s) | text | what happens |
|---|---|---|
${[...grouped].map(([k, g]) => `| \`${k}\`${g.ids.length > 1 ? ` (${g.ids.length})` : ""} | ${esc(g.text)} | ${g.d || "not a template's: see the design §6.3"} |`).join("\n")}

## 5. Style warnings (${warnings.length})

${warnings.length ? warnings.map((w) => `- ${w}`).join("\n") : "None."}
`;
writeFileSync(join(root, "docs/speech-templates/catalogue.md"), md);
console.log(`catalogue.md: ${CATALOGUE.length} templates, ${reRecord.length} re-records, ${requested.size} new lines, ${lead.length} lead-ins (${JSON.stringify(counts)}), ${warnings.length} warnings`);
