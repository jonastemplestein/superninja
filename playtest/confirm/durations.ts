// Write the confirm lines' lengths into public/a/durations.json, for these ids only (the rest of the file is left as it
// is, so another lane's clips are never re-measured here). Run: bun playtest/confirm/durations.ts
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const IDS = [
  "tv_confirm_yes", "tv_confirm_no", "tv_confirm_how", "tv_confirm_again", "tv_confirm_replay", "tv_confirm_leave", "tv_confirm_leave_boss", "tv_confirm_leave_trial",
  // the fix round (docs/CONFIRM.md §3.5)
  "tv_confirm_play_again", "tv_confirm_how_pic", "tv_confirm_how_home", "tv_confirm_how_flower", "tv_confirm_keep", "tv_confirm_bye", "tv_confirm_home_nudge", "tv_confirm_flower_nudge",
];
const file = "public/a/durations.json";
const measured: Record<string, number> = {};
for (const id of IDS) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", `public/a/l/${id}.mp3`], { encoding: "utf8" });
  measured[`l/${id}`] = Math.round(Number(r.stdout.trim()) * 1000);
}
const cur: Record<string, number> = JSON.parse(readFileSync(file, "utf8")); // read just before writing
Object.assign(cur, measured);
writeFileSync(file, JSON.stringify(Object.fromEntries(Object.entries(cur).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");
console.log(measured);
