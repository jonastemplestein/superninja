// The script editor's counts: reads transcripts (journey-<persona>.json from transcript.ts, continuous-<persona>.json
// from continuous.ts) and counts the composition problems docs/SCRIPT_STYLE.md names: lines said most often, the
// same utterance echoed back to back ("/ae/ It's two letters, but it's one sound. /ae/ It's two letters, but it's one
// sound."), spliced chains, stacked praise, silences, cut-off clips and explanation dosage per level.
// Usage: bun scripts/treadmill/script-audit.ts <transcript.json>... [--out report.md]
import { readFileSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const OUT = outAt >= 0 ? args[outAt + 1] : null;
const FILES = args.filter((a, i) => !a.startsWith("--") && (outAt < 0 || i !== outAt + 1));
const DUR: Record<string, number> = JSON.parse(readFileSync("public/a/durations.json", "utf8"));
const TEXT = new Map(LINES.map((l) => [l.id, l.text]));

type Ev = { t: number; kind: string; text: string; id?: string; url?: string; dur?: number; cut?: boolean; who?: string };
type Seg = { name: string; events: Ev[] };

/** Praise and celebration lines (the child hears these as "well done"). */
const PRAISE = new Set(["yay_1", "yay_2", "yay_3", "yay_4", "yay_5", "yay_6", "yay_7", "yay_8", "yay_9", "yay_10", "well_read", "well_spelt", "streak_3", "streak_6", "streak_10", "audit_streak_first", "battle_win", "battle_boss_win", "dojo_done", "sort_done", "swap_done", "fm_l1_done", "fm_l2_done", "fm_l5_done", "fm_found_all", "fm_found_both", "tut_good", "run_end", "fm_super_listener", "trial_win", "fm_help_ok", "chose", "petal_got", "petals_got"]);
/** Explanations whose dosage matters (Sounds~Write concepts, terms, ideas). */
const EXPLAIN = ["t_two_letters", "t_three_letters", "t_four_letters", "two_letters_one_sound", "t_one_spelling_two_sounds", "same_sound_diff", "same_sound_new", "audit_hear_see", "audit_spell_it", "how_we_spell", "t_way_we_spell", "wf_spelling_of", "t_spelling_of", "t_another_way", "audit_gem_first", "audit_gem_more", "r2_gems_more", "fm_hear_sounds", "fm_hear_sounds_short", "audit_made_of_sounds", "audit_middle_place", "audit_last_place", "fm_l2_way", "audit_left_right", "dojo_hello", "audit_dojo_first", "audit_dojo_back", "tut_speaker", "fm_speaker", "audit_sort_first", "audit_sort_again", "audit_sort_pair", "audit_sort_three", "t_often_end_short", "audit_neighbours", "audit_neighbours_plain", "flower_intro", "wf_i3", "audit_petal_means", "t_everyone_say", "fm_rw_every"];

function idOf(e: Ev): string | null {
  if (e.id) return e.id;
  const u = e.url ?? "";
  let m;
  if ((m = u.match(/\/a\/l\/([^/]+)\.mp3/))) return m[1];
  if ((m = u.match(/\/a\/p\/([^/]+)\.mp3/))) return `sound:${m[1]}`;
  if ((m = u.match(/\/a\/w\/([^/]+)\.mp3/))) return `word:${m[1]}`;
  if ((m = u.match(/\/a\/x\/([^/]+)\.mp3/))) return `stretch:${m[1]}`;
  if ((m = u.match(/\/a\/o\/([^/]+)\.mp3/))) return `onset:${m[1]}`;
  if ((m = u.match(/\/a\/s\/([^/]+)\.mp3/))) return `story:${m[1]}`;
  if (e.kind === "sound") return `sound:${e.text.replace(/\//g, "")}`;
  if (e.kind === "word") return `word:${e.text}`;
  if (e.kind === "stretch") return `stretch:${e.text}`;
  return null;
}
function durOf(id: string): number {
  const [k, v] = id.includes(":") ? id.split(":") : ["l", id];
  const key = k === "l" ? `l/${v}` : k === "sound" ? `p/${v}` : k === "word" ? `w/${v}` : k === "stretch" ? `x/${v}` : k === "onset" ? `o/${v}` : `s/${v}`;
  return (DUR[key] ?? 900) / 1000;
}
const SPEECH = new Set(["say", "sound", "word", "stretch", "onset", "story"]);
const label = (id: string) => (id.startsWith("sound:") ? `/${id.slice(6)}/` : id.startsWith("word:") ? `"${id.slice(5)}"` : id.startsWith("stretch:") ? `"${id.slice(8)}" (slowly)` : id.startsWith("onset:") ? `"${id.slice(6)}" (held)` : TEXT.get(id) ?? id);
/** the shape of an utterance: sounds and words become placeholders, so "/ae/ It's two letters…" and "/ee/ It's two letters…" match */
const shape = (ids: string[]) => ids.map((i) => (i.startsWith("sound:") ? "/X/" : i.startsWith("word:") || i.startsWith("stretch:") || i.startsWith("onset:") ? "W" : i)).join(" + ");
const isFragment = (id: string) => { const t = TEXT.get(id) ?? ""; return t.endsWith("...") || t.startsWith("...") || /^[a-z]/.test(t); };

function load(file: string): { persona: string; segs: Seg[]; continuous: boolean } {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const persona = file.replace(/.*\/(journey|continuous)-/, "").replace(/\.json$/, "");
  if (Array.isArray(raw)) return { persona, continuous: false, segs: raw.map((r: any) => ({ name: r.name, events: r.events })) };
  // continuous: one stream; segments start at each piece marker
  const segs: Seg[] = [];
  let cur: Seg = { name: "start", events: [] };
  for (const e of raw.evs as Ev[]) {
    if (e.kind === "piece") {
      if (cur.events.length) segs.push(cur);
      cur = { name: e.text, events: [] };
      continue;
    }
    cur.events.push(e);
  }
  if (cur.events.length) segs.push(cur);
  return { persona, continuous: true, segs };
}

type Utt = { t: number; end: number; ids: string[]; seg: string };
function utterances(segs: Seg[]): Utt[] {
  const out: Utt[] = [];
  for (const s of segs) {
    let u: Utt | null = null;
    for (const e of s.events) {
      // a tap ends the utterance (what follows is a response to it)
      if (e.kind === "tap" && u) {
        out.push(u);
        u = null;
        continue;
      }
      if (!SPEECH.has(e.kind)) continue;
      const id = idOf(e);
      if (!id) continue;
      const d = e.dur ? e.dur / 1000 : durOf(id);
      // one utterance while clips follow each other within 0.6 s of the last one's end (a composed say())
      if (u && e.t - u.end < 0.6) {
        u.ids.push(id);
        u.end = Math.max(u.end, e.t + d);
      } else {
        if (u) out.push(u);
        u = { t: e.t, end: e.t + d, ids: [id], seg: s.name };
      }
    }
    if (u) out.push(u);
  }
  return out;
}

function report(file: string): string {
  const { persona, segs, continuous } = load(file);
  const lines: string[] = [`## ${file.replace(/.*playtest\//, "playtest/")} (${persona}${continuous ? ", one continuous page" : ", one page per level"})`, ""];
  const speech = segs.flatMap((s) => s.events.filter((e) => SPEECH.has(e.kind)).map((e) => ({ ...e, seg: s.name, lid: idOf(e)! })));
  const says = speech.filter((e) => e.kind === "say");
  const utts = utterances(segs);
  lines.push(`${says.length} Sensei lines, ${speech.length - says.length} sounds and words, ${utts.length} utterances in ${segs.length} ${continuous ? "pieces" : "levels"}.`, "");

  // 1. most-said lines
  const count = new Map<string, number>();
  for (const e of says) count.set(e.lid, (count.get(e.lid) ?? 0) + 1);
  const top = [...count].sort((a, b) => b[1] - a[1]).slice(0, 30);
  lines.push("### Most-said lines", "", "| Line | Times | Text |", "|---|---|---|", ...top.map(([id, n]) => `| ${id} | ${n} | ${label(id)} |`), "");

  // 2. echoes: the same utterance shape twice or more in a row within 25 s
  const echoes: { seg: string; t: number; n: number; text: string }[] = [];
  for (let i = 0; i < utts.length; ) {
    let j = i + 1;
    const sh = shape(utts[i].ids);
    while (j < utts.length && utts[j].seg === utts[i].seg && shape(utts[j].ids) === sh && utts[j].t - utts[j - 1].t < 25 && utts[i].ids.some((x) => !x.includes(":"))) j++;
    if (j - i >= 2) echoes.push({ seg: utts[i].seg, t: utts[i].t, n: j - i, text: utts.slice(i, j).map((u) => u.ids.map(label).join(" ")).join(" ‖ ") });
    i = j;
  }
  lines.push(`### Echoes: the same utterance shape back to back (${echoes.length})`, "", ...echoes.slice(0, 40).map((e) => `- ${e.seg} @${e.t.toFixed(1)}s ×${e.n}: ${e.text.slice(0, 260)}`), "");

  // 2b. near repeats: the same line again within 15 s in the same level or piece (per line: how often, and an example)
  const near = new Map<string, { n: number; ex: string }>();
  for (let i = 0; i < says.length; i++) {
    const e = says[i];
    const prev = says.slice(Math.max(0, i - 12), i).reverse().find((x) => x.lid === e.lid && x.seg === e.seg && e.t - x.t < 15);
    if (!prev) continue;
    const r = near.get(e.lid) ?? { n: 0, ex: `${e.seg} @${prev.t.toFixed(1)}s and @${e.t.toFixed(1)}s` };
    r.n++;
    near.set(e.lid, r);
  }
  lines.push(`### Near repeats: the same line again within 15 s (${[...near.values()].reduce((a, b) => a + b.n, 0)})`, "", "| Line | Repeats | Text | Example |", "|---|---|---|---|", ...[...near].sort((a, b) => b[1].n - a[1].n).slice(0, 25).map(([id, r]) => `| ${id} | ${r.n} | ${label(id).slice(0, 60)} | ${r.ex} |`), "");

  // 3. splices: an utterance joined from a fragment line and sound/word clips; long chains
  const spliced = utts.filter((u) => u.ids.length > 1 && u.ids.some((x) => !x.includes(":") && isFragment(x)));
  const long = utts.filter((u) => u.ids.length >= 5);
  const shapes = new Map<string, number>();
  for (const u of spliced) shapes.set(shape(u.ids), (shapes.get(shape(u.ids)) ?? 0) + 1);
  lines.push(`### Spliced utterances: ${spliced.length} of ${utts.length} (${Math.round((100 * spliced.length) / Math.max(1, utts.length))}%); chains of 5+ clips: ${long.length}`, "", "Commonest spliced shapes:", "", ...[...shapes].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([s, n]) => `- ×${n} ${s.split(" + ").map((x) => (x === "/X/" || x === "W" ? x : `‹${x}›`)).join(" + ")}`), "", "Longest chains:", "", ...long.sort((a, b) => b.ids.length - a.ids.length).slice(0, 8).map((u) => `- ${u.seg} @${u.t.toFixed(1)}s (${u.ids.length} clips): ${u.ids.map(label).join(" ")}`.slice(0, 300)), "");

  // 4. stacked praise: two or more praise lines within 5 s
  const praise = says.filter((e) => PRAISE.has(e.lid));
  const stacks: string[] = [];
  for (let i = 0; i < praise.length; ) {
    let j = i + 1;
    while (j < praise.length && praise[j].seg === praise[i].seg && praise[j].t - praise[j - 1].t < 5) j++;
    if (j - i >= 2) stacks.push(`- ${praise[i].seg} @${praise[i].t.toFixed(1)}s: ${praise.slice(i, j).map((p) => `"${p.text}"`).join(" → ")}`);
    i = j;
  }
  const mins = Math.max(1, segs.reduce((s, sg) => { const ts = sg.events.map((e) => e.t); return s + (ts.length ? Math.max(...ts) - Math.min(...ts) : 0); }, 0) / 60);
  lines.push(`### Praise: ${praise.length} lines (${(praise.length / mins).toFixed(1)} a minute); stacked (2+ within 5 s): ${stacks.length}`, "", ...stacks.slice(0, 25), "");

  // 5. silences: 10 s or more with no speech, and what surrounded them
  const gaps: string[] = [];
  for (let i = 0; i + 1 < utts.length; i++) {
    const a = utts[i], b = utts[i + 1];
    if (a.seg !== b.seg) continue;
    const g = b.t - a.end;
    if (g >= 10) {
      const seg = segs.find((s) => s.name === a.seg)!;
      const taps = seg.events.filter((e) => e.kind === "tap" && e.t > a.end && e.t < b.t).length;
      gaps.push(`- ${a.seg} @${a.end.toFixed(1)}s: ${g.toFixed(1)} s silent (${taps} taps) after "${a.ids.map(label).join(" ").slice(0, 80)}", before "${b.ids.map(label).join(" ").slice(0, 60)}"`);
    }
  }
  lines.push(`### Silences of 10 s or more inside a level or piece: ${gaps.length}`, "", ...gaps.slice(0, 25), "");

  // 6. cut-off clips: the next clip started before this one could have ended
  const cuts: string[] = [];
  for (let i = 0; i + 1 < speech.length; i++) {
    const e = speech[i], n = speech[i + 1];
    const d = e.dur ? e.dur / 1000 : durOf(e.lid);
    if (e.seg === n.seg && n.t < e.t + d - 0.25) cuts.push(`- ${e.seg} @${e.t.toFixed(1)}s: "${label(e.lid).slice(0, 70)}" cut after ${(n.t - e.t).toFixed(1)} of ${d.toFixed(1)} s by ${label(n.lid).slice(0, 50)}`);
  }
  lines.push(`### Cut-off clips: ${cuts.length}`, "", ...cuts.slice(0, 25), "");

  // 7. explanation dosage per level or piece
  const dose = new Map<string, Map<string, number>>();
  for (const e of says) {
    if (!EXPLAIN.includes(e.lid)) continue;
    const m = dose.get(e.lid) ?? new Map<string, number>();
    m.set(e.seg, (m.get(e.seg) ?? 0) + 1);
    dose.set(e.lid, m);
  }
  lines.push("### Explanations: where and how often", "", "| Line | Total | Where (times) |", "|---|---|---|", ...[...dose].sort((a, b) => [...b[1].values()].reduce((x, y) => x + y) - [...a[1].values()].reduce((x, y) => x + y)).map(([id, m]) => `| ${id} "${label(id).slice(0, 50)}" | ${[...m.values()].reduce((x, y) => x + y)} | ${[...m].map(([s, n]) => `${s}${n > 1 ? ` ×${n}` : ""}`).join(", ")} |`), "");
  return lines.join("\n");
}

const md = [`# Script audit`, "", `Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.`, "", ...FILES.map(report)].join("\n");
if (OUT) writeFileSync(OUT, md);
else console.log(md);
