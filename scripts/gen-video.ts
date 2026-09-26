// Veo cutscenes (image-to-video). Usage: bun scripts/gen-video.ts
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const KEY = process.env.APP_CONFIG_GEMINI_API_KEY!;
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const STYLE = "Hand-painted 2D cartoon animation in exactly the same illustrated style as the image, bold ink outlines, rich colours. No text. Smooth, gentle camera. Family friendly.";
const jobs = [
  // "intro" is superseded by the 8-shot World Flower film (scripts/gen-intro-v2.ts, docs/INTRO_STORYBOARD.md)
  { id: "intro", frame: "assets-src/veo_intro_frame.jpg", prompt: `The sky darkens and thunder rumbles; the menacing toad sorcerer villain with glowing red eyes, a black iron crown and a torn crimson cloak raises his clawed hands crackling with purple magic and sweeps his dark fan; a sinister purple storm rips all the glowing pink blossom petals off the ancient tree and swirls them away across the valley, leaving the branches bare and grey. He laughs with an evil grin as purple lightning flashes. Dramatic and menacing but suitable for young children. ${STYLE}` },
  { id: "finale", frame: "assets-src/veo_finale_frame.jpg", prompt: `Forty-four glowing rainbow teardrop-shaped sound petals swirl home to the magical World Flower on its hilltop, and it bursts into full magnificent bloom around its golden heart with sparkles and rainbows; the sun rises; petals drift joyfully across the whole island. Triumphant, magical celebration. ${STYLE}` },
];
mkdirSync("public/a/v", { recursive: true });
await Promise.all(jobs.map(async (j) => {
  const out = `public/a/v/${j.id}.mp4`;
  if (existsSync(out)) return;
  const res = await fetch(`${BASE}/models/veo-3.1-generate-preview:predictLongRunning`, {
    method: "POST", headers: { "x-goog-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify({ instances: [{ prompt: j.prompt, image: { bytesBase64Encoded: readFileSync(j.frame).toString("base64"), mimeType: "image/jpeg" } }], parameters: { aspectRatio: "16:9", resolution: "720p" } }),
  });
  let op: any = await res.json();
  if (!op.name) throw new Error(JSON.stringify(op));
  console.log(j.id, "op", op.name);
  while (!op.done) {
    await new Promise((r) => setTimeout(r, 10000));
    op = await (await fetch(`${BASE}/${op.name}`, { headers: { "x-goog-api-key": KEY } })).json();
  }
  const uri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!uri) throw new Error(j.id + " " + JSON.stringify(op).slice(0, 500));
  const vid = Buffer.from(await (await fetch(uri, { headers: { "x-goog-api-key": KEY }, redirect: "follow" })).arrayBuffer());
  const raw = `assets-src/${j.id}_raw.mp4`;
  writeFileSync(raw, vid);
  // strip audio (we have our own), web-friendly encode
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", raw, "-an", "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
  console.log("✓", j.id);
}));
