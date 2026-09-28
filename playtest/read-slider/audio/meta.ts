// Picture reading v2: the line tags and durations for the read-slider block's ids only (playtest/read-slider/audio/
// ids.txt), and the durations of the new word and slow-word clips (compounds.ts NEW_WORDS). line-tags.ts and
// public/a/durations.json are F2's files, so this writes them as data for F2 to merge (docs/fix-requests.md, "Picture
// reading v2 and the read slider"): docs/read-slider/line-tags.json (LineMeta, hashed as linebook.ts lineHash()) and
// docs/read-slider/durations.json ("l/<id>", "w/<word>", "x/<word>": ms, as scripts/gen-durations.ts writes them).
//   bun playtest/read-slider/audio/meta.ts
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { LINES } from "../../../src/content/lines";
import { lineHash } from "../../../src/core/content/linebook";
import { NEW_WORDS } from "../../../src/content/compounds";
import type { LineMeta, UttPurpose } from "../../../src/core/types";

const ROOT = join(import.meta.dir, "../../..");
const ids = readFileSync(join(import.meta.dir, "ids.txt"), "utf8").split(/\s+/).filter(Boolean);
const text = Object.fromEntries(LINES.map((l) => [l.id, l]));

type T = { purpose: UttPurpose; tags?: [string, string][]; needs?: [string, string][]; steps?: number; vary?: true };
const LR = "idea:left-to-right", FS = "idea:fast-and-slow-saying", WS = "idea:words-are-made-of-sounds", SR = "idea:say-the-sounds-read-the-word";
const META: Record<string, T> = {
  rs_how: { purpose: "instruction", tags: [[LR, "remind"]], steps: 2 },
  rs_back_1: { purpose: "correction", tags: [[LR, "explain"]] },
  rs_back_2: { purpose: "correction", tags: [[LR, "remind"]], steps: 1 },
  rs_back_3: { purpose: "correction", tags: [[LR, "remind"]], steps: 1 },
  rs_start_here: { purpose: "instruction", tags: [[LR, "remind"]], steps: 1 },
  rs_idle: { purpose: "hint", steps: 1 },
  rs_keep_going: { purpose: "hint", tags: [[LR, "mention"]], steps: 1 },
  rs_again: { purpose: "instruction", tags: [[LR, "mention"]], steps: 1 },
  rs_sounds_with_me: { purpose: "instruction", tags: [[SR, "ask"]], needs: [[WS, "explained"]], steps: 2 },
  rs_now_fast: { purpose: "prompt", tags: [[FS, "ask"]], needs: [[FS, "explained"]], steps: 1 },
  rs_slowly: { purpose: "hint", tags: [[FS, "remind"]], steps: 1 },
  rs_praise_1: { purpose: "praise", tags: [[FS, "mention"]], vary: true },
  rs_praise_2: { purpose: "praise", tags: [[FS, "mention"], [LR, "mention"]], vary: true },
  rs_praise_3: { purpose: "praise", tags: [[LR, "mention"]], vary: true },
  pr_frame: { purpose: "explanation", tags: [[LR, "explain"]] },
  pr_demo: { purpose: "model", tags: [[FS, "mention"]] },
  pr_demo_back: { purpose: "model", tags: [[LR, "mention"]] },
  pr_another: { purpose: "transition" },
  pr_sounds_too: { purpose: "explanation", tags: [[WS, "explain"]] },
  pr_sounds_demo: { purpose: "model", tags: [[SR, "mention"]] },
  pr_recap: { purpose: "reminder", tags: [[LR, "remind"]] },
  pr_your_turn: { purpose: "instruction", tags: [[LR, "remind"]], steps: 1 },
  pr_short: { purpose: "reminder", tags: [[LR, "remind"]], steps: 1 },
  pr_w4_done: { purpose: "praise", tags: [[LR, "mention"]], vary: true },
  pr_last_word: { purpose: "explanation" },
  pr_rw2_list: { purpose: "reward", vary: true },
  pr_rw_shiny: { purpose: "reward", tags: [["obj:sticker-book", "mention"]], vary: true },
  pr_rw2_s: { purpose: "prompt", tags: [["idea:first-sound", "ask"]], needs: [["idea:first-sound", "explained"]], steps: 1 },
  pr_map_replay: { purpose: "meta" },
};
for (const id of ids) {
  if (id.startsWith("pr_back_")) META[id] = { purpose: "explanation", tags: [[LR, "explain"]] };
  if (id.startsWith("pr_what_")) META[id] = { purpose: "explanation" };
}

const tags: Record<string, LineMeta> = {};
for (const id of ids) {
  const l = text[id];
  const m = META[id];
  if (!l || !m) throw new Error(`no line or meta for ${id}`);
  const who = (l as { who?: string }).who ?? "sensei";
  tags[id] = {
    id, hash: lineHash(l.text, who), who: who as LineMeta["who"], purpose: m.purpose,
    tags: (m.tags ?? []).map(([key, as]) => ({ key, as })) as LineMeta["tags"],
    needs: (m.needs ?? []).map(([key, level]) => ({ key, level })) as LineMeta["needs"],
    repetition: m.vary ? "vary" : "routine",
    ...(m.steps ? { steps: m.steps } : {}),
  };
}

const ms = (file: string) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file], { encoding: "utf8" });
  return Math.round(Number(r.stdout.trim()) * 1000);
};
const durations: Record<string, number> = {};
for (const id of ids) durations[`l/${id}`] = ms(join(ROOT, "public/a/l", `${id}.mp3`));
for (const [w, o] of Object.entries(NEW_WORDS)) {
  if (o.gag) continue;
  for (const g of ["w", "x"]) {
    const f = join(ROOT, "public/a", g, `${w}.mp3`);
    if (existsSync(f)) durations[`${g}/${w}`] = ms(f);
  }
}
writeFileSync(join(ROOT, "docs/read-slider/line-tags.json"), JSON.stringify(tags, null, 1) + "\n");
writeFileSync(join(ROOT, "docs/read-slider/durations.json"), JSON.stringify(durations, null, 1) + "\n");
console.log(`${Object.keys(tags).length} tags, ${Object.keys(durations).length} durations → docs/read-slider/`);
