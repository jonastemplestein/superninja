// The lines lane's acceptance numbers (FIX_PLAN §13 TV-F2.1/F2.5/F2.8, this lane's brief), from the files themselves.
//   bun playtest/voice/acceptance.ts   → playtest/voice/acceptance.json
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LINES, RETIRED_LINES } from "../../src/content/lines";
import { lineTags } from "../../src/core/content/line-tags";
import { lineHash } from "../../src/core/content/linebook";
const ROOT = join(import.meta.dir, "../..");
const J = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const doc = readFileSync(join(ROOT, "docs/TEACHER_SCRIPT.md"), "utf8").split("### 7.1 New lines to record")[1].split("**The generated families")[0];
const tsIds = [...doc.matchAll(/^\| \d+ \| [\d.]+ \| `([^`]+)` \|/gm)].map((m) => m[1]);
const ids = new Set(LINES.map((l) => l.id));
const clip = (id: string) => existsSync(join(ROOT, `public/a/l/${id}.mp3`));
const members = (fid: string) => LINES.filter((l) => l.id.startsWith(fid.split("<")[0])).map((l) => l.id);
const tsMissing = tsIds.filter((fid) => (fid.includes("<") ? !members(fid).some(clip) : !ids.has(fid) || !clip(fid)));
const texts: Record<string, string> = J("playtest/voice/texts.json");
const qa = J("playtest/voice/qa.json").clips as Record<string, any>;
const dur: Record<string, number> = J("public/a/durations.json");
const rep = J("assets-src/audio-report.json");
const mine = Object.keys(texts);
const lufs = mine.map((i) => qa[i]).filter(Boolean);
const out = {
  ts_7_1_ids: tsIds.length, ts_7_1_missing_or_no_clip: tsMissing,
  families: tsIds.filter((i) => i.includes("<")).map((f) => ({ family: f, members: members(f) })),
  recorded: mine.length,
  first_qa: J("playtest/voice/qa-first.json"),
  final_qa: { exact: lufs.filter((q) => q.exact).length, of: lufs.length, letters: lufs.filter((q) => q.letters?.length).length, fast: lufs.filter((q) => q.fast).length, max_wps: Math.max(...lufs.map((q) => q.wps)), lead_blips: lufs.filter((q) => q.blip != null).length },
  loudness: {
    sentences: lufs.filter((q) => q.seconds >= 1.2).length, sentences_off: lufs.filter((q) => q.seconds >= 1.2 && !q.lufs_ok).map((q) => q.text),
    short_under_1_2s: lufs.filter((q) => q.seconds < 1.2).length, short_off: lufs.filter((q) => q.seconds < 1.2 && !q.lufs_ok).map((q) => q.text),
    short_mean_lufs: Math.round((lufs.filter((q) => q.seconds < 1.2).reduce((s, q) => s + q.lufs, 0) / Math.max(1, lufs.filter((q) => q.seconds < 1.2).length)) * 10) / 10,
  },
  helped: {
    pauses_widened: mine.filter((i) => rep[`public/a/l/${i}.mp3`]?.widened).length,
    lengthened: mine.filter((i) => rep[`public/a/l/${i}.mp3`]?.lengthened).map((i) => [i, rep[`public/a/l/${i}.mp3`].lengthened]).sort((a, b) => b[1] - a[1]),
  },
  durations_missing: mine.filter((i) => !dur[`l/${i}`]),
  tags_missing: LINES.filter((l) => !lineTags[l.id]).map((l) => l.id),
  tags_stale_mine: mine.filter((i) => lineTags[i] && lineTags[i].hash !== lineHash(texts[i], lineTags[i].who)),
  retired_marked: Object.keys(RETIRED_LINES).length,
  word_timings: readFileSync(join(import.meta.dir, "ids-words.txt"), "utf8").split(/\s+/).filter(Boolean).filter((i) => existsSync(join(ROOT, `public/a/l/${i}.words.json`))).length,
};
writeFileSync(join(import.meta.dir, "acceptance.json"), JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ ...out, families: out.families.length, helped: { pauses_widened: out.helped.pauses_widened, lengthened: out.helped.lengthened.length, over_1_3: out.helped.lengthened.filter((x) => (x[1] as number) > 1.3) } }, null, 1));
