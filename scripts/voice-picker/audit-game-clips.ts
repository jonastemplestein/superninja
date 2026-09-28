// The 20 real game clips the accent audit judges and measures (Sensei lines, the film, story pages, Baron, words).
import { LINES } from "../../src/content/lines";
import { STORIES } from "../../src/content/stories";

/** 20 real clips from the game: Sensei lines, the film, story pages, Baron Muddle, and isolated words. */
export const GAME_CLIPS: { id: string; file: string; who: string; text: string }[] = [];
const lineText = (id: string) => LINES.find((l) => l.id === id)!.text;
for (const id of ["fm_starfish_q", "tv_same_word", "fm_opt_q2", "help_name", "jump_pick", "audit_middle_place", "world_5", "film_1", "film_6", "finale"])
  GAME_CLIPS.push({ id: `l/${id}`, file: `public/a/l/${id}.mp3`, who: "sensei (Sulafat)", text: lineText(id) });
for (const [st, pg] of [["s1", "1"], ["s6", "7"]] as const) {
  const text = (STORIES.find((s) => s.id === st)!.pages.find((p: any) => p.id === pg) as any).text;
  GAME_CLIPS.push({ id: `s/${st}_${pg}`, file: `public/a/s/${st}_${pg}.mp3`, who: "story narration (Sulafat)", text });
}
for (const id of ["film_3", "film_4", "baron_final", "baron_w2"])
  GAME_CLIPS.push({ id: `l/${id}`, file: `public/a/l/${id}.mp3`, who: "baron (Algenib)", text: lineText(id) });
for (const w of ["car", "bird", "water", "after"])
  GAME_CLIPS.push({ id: `w/${w}`, file: `public/a/w/${w}.mp3`, who: "word (Sulafat)", text: w });

