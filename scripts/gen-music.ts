// Generate the soundtrack with Lyria; trim the outro so it loops (engine crossfades).
import { existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { generate, inlineParts, writeFile, pool } from "./gemini";
const COMMON = "Instrumental only: absolutely no vocals, no voices, no shouts, no chanting. Japanese-flavoured family adventure game score (koto, shamisen, shakuhachi/bamboo flute, taiko, plus warm orchestra), polished, warm, loopable with a steady groove, no big ending.";
const TRACKS: Record<string, string> = {
  title: "An epic, heroic, uplifting main theme for a kids' ninja adventure game title screen. Big warm orchestral swells with taiko and a memorable bamboo-flute melody, 100 bpm.",
  world_bamboo: "Cheerful, bouncy world-map theme for a sunny bamboo village: plucked koto and shamisen melody, light taiko and wooden clappers, pizzicato strings, playful and warm, 110 bpm.",
  world_blossom: "Gentle, sparkly, happy spring theme for cherry-blossom hills: koto arpeggios, flute melody, soft strings, glockenspiel twinkles, 96 bpm.",
  world_mountain: "Crisp, adventurous theme for snowy misty mountains: shakuhachi melody over bright strings, sleigh-bell sparkle, bold taiko, sense of wonder, 104 bpm.",
  world_river: "Flowing, sunny, playful theme for a turquoise dragon river: rippling koto, marimba, flute, gentle swing, 100 bpm.",
  world_castle: "Spooky-but-cute mischievous theme for a purple shadow castle: pizzicato strings sneaking, bassoon, celesta, soft taiko, playful not scary, 92 bpm.",
  world_sky: "Majestic, soaring, magical theme for a golden temple in the clouds: choir-like synth pads (no words), harp, flute, big warm strings, 90 bpm.",
  battle: "Energetic, exciting but kid-friendly battle music: driving taiko, fast shamisen riffs, staccato strings, heroic brass stabs, 140 bpm.",
  boss: "Big dramatic but fun boss battle music for kids: heavy taiko, bold brass, fast strings, a cheeky villain motif on bassoon, 145 bpm.",
  run: "Fast, upbeat, bouncy running-level music for a platformer: galloping taiko, bright shamisen, whistles, 160 bpm, super energetic and happy.",
  story: "Soft, cosy storybook music for reading together: gentle koto, warm felt piano, soft strings, calm and tender, 76 bpm, quiet background level.",
  dojo: "Calm, focused, friendly training dojo music: soft koto, shakuhachi, light hand percussion, peaceful and encouraging, 84 bpm, quiet background level.",
  finale: "Triumphant joyful celebration finale: full orchestra with taiko, soaring flute melody, bells, festive and heart-warming, 110 bpm.",
};
await pool(Object.entries(TRACKS), 4, async ([id, prompt]) => {
  const out = `public/a/m/${id}.mp3`;
  if (existsSync(out)) return;
  const raw = `assets-src/music/${id}.mp3`;
  mkdirSync("public/a/m", { recursive: true });
  if (!existsSync(raw)) {
  const json = await generate("lyria-3.5", { contents: [{ parts: [{ text: `${prompt} ${COMMON}` }] }] });
  const a = inlineParts(json).find((p) => p.mimeType.startsWith("audio/"));
  if (!a) throw new Error("no audio for " + id);
  writeFile(raw, a.data);
  }
  const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw]).toString());
  const keep = Math.max(20, dur - 7);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", raw, "-t", String(keep), "-af", `afade=t=in:d=0.3,afade=t=out:st=${keep - 2.5}:d=2.5,loudnorm=I=-20:TP=-2`, "-ar", "44100", "-b:a", "112k", out]);
  console.log("✓", id, dur.toFixed(0) + "s → " + keep.toFixed(0) + "s");
});
