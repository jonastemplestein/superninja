// Write docs/read-slider/videos/README.md from the recorder's logs (docs/read-slider/videos/<case>-<speed>.json): each
// video's length, its real touches (the drag's intended and real length) and what is heard when.
//   bun playtest/read-slider/videos-readme.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const DIR = join(import.meta.dir, "../../docs/read-slider/videos");
const RUNS = ["compound-normal", "compound-slow", "compound-fast", "wrong-normal", "wrong-fast", "sounds-normal", "sounds-slow"];
const WHAT: Record<string, string> = {
  compound: "W2's first meeting (PICTURE_READING §3 A–E): the frame (the rail's light on \"this\"), Sensei's slow demo on rain + bow (\"Two little words can make one long word…\"; her red panda's paw out of her portrait on \"Watch\"), the child's rabbit, her backwards show (bow… rain, the bow-rain picture; on \"We\" the tortoise pops home and her paw rides the rail left to right), the Ready, then the child's slides on snow + man (praise only after the child's own tap) and cup + cake.",
  wrong: "The child's turn on snowman: a right-to-left swipe (reads nothing), then the tortoise pulled back across \"snow\" (nothing more is read), then a slide the right way and the rabbit.",
  sounds: "\"Say the sounds with me\": Sensei's paw (out of her portrait on \"show\") under sun's three dots (/s/ /u/ /n/, slices of the slow word), the child's rabbit, then the child slides under mop (/m/ /o/ /p/) and taps the rabbit.",
};
const LOOK: Record<string, string> = {
  compound: "Sensei's red panda's paw (never the cream glove, which is only the ghost hand) flying from her portrait, pressing once she has finished, and staying on the tortoise; the tortoise waiting under \"rain\" until the word ends; the bloom on the child's tap; the tortoise walking back and the bow-rain picture; the pop home onto the start dot on \"We\" and the paw riding the rail left to right; the Ready's ▶; the lit cards following the voice, not the finger",
  wrong: "no word on the backwards swipe; \"snow\" finishing (never cut off) before the correction; the tortoise popping onto the start dot (never walking left); the dot, the arrow and the rail's light pulsing left to right; the ninja's think pose",
  sounds: "each dot lighting on its sound; the gaps between the sounds; the dots drawing together on the fast word; any sound cutting off Sensei if the slide starts, or restarts, while she talks",
};
const dur = (f: string) => Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim());
const name = (u: string) => {
  const m = u.match(/\/a\/(l|w|x)\/([^.#]+)\.mp3(#(\d+))?/);
  if (!m) return u;
  if (m[1] === "l") return `\`${m[2]}\``;
  if (m[1] === "w") return `[${m[2]}]`;
  return `/${m[2]}#${m[4]}/`;
};
let out = `# The read slider's videos\n\nRecorded ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC by \`playtest/read-slider/record.ts\` (docs/READ_SLIDER.md §10): the frozen harness build at 844×390 (device scale 2, so the files are 1688×780), real touch events through CDP, the soundtrack rebuilt from the page's own audio log. Each has a contact sheet (\`.jpg\`, a frame every 1.5 s) and a log (\`.json\`).\n\n**Art note:** the harness serves the rain redraw (\`docs/read-slider/art/pic_rain.webp\`, a fix request) over today's \`pic_rain\`, which the picture audit names "cloud". Everything else is the game's own art and audio.\n\n`;
for (const r of RUNS) {
  const j = join(DIR, `${r}.json`);
  if (!existsSync(j)) continue;
  const d = JSON.parse(readFileSync(j, "utf8"));
  const [cse, speed] = r.split("-");
  const len = dur(join(DIR, `${r}.mp4`));
  out += `## ${r}.mp4 (${len.toFixed(0)} s)\n\n${WHAT[cse]}\n\n`;
  const drags = (d.events as any[]).filter((e) => e.kind === "drag");
  if (drags.length) out += `Touches (${speed}): ${drags.map((e) => `${e.why} (${e.ms} ms asked${e.realMs ? `, ${e.realMs} ms real, ${e.moves} moves` : ""})`).join("; ")}.\n\n`;
  out += `What is heard, with the video's time (s):\n\n| t | clip |\n|---|---|\n`;
  for (const c of d.clips as any[]) out += `| ${c.at} | ${name(c.url)} |\n`;
  out += `\nLook at: ${LOOK[cse]}.\n\n`;
}
writeFileSync(join(DIR, "README.md"), out);
console.log("→", join(DIR, "README.md"));
