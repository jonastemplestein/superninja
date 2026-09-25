// Generate one image: bun scripts/img.ts <out.png> "<prompt>" [ref1.png ref2.png ...] [--model=...] [--aspect=1:1]
import { generate, inlineParts, writeFile, fileToPart, type Part } from "./gemini";

export const STYLE =
  "Art style: premium hand-painted 2D children's video game art. Bold, clean, confident dark-brown ink outlines of even weight, rich saturated cel-shaded colours with soft painterly texture inside the shapes, warm rim light, big readable silhouettes, expressive friendly faces, charming and slightly cheeky, high production value like a top-tier mobile adventure game. Not photorealistic, no 3D render look, no text, no letters, no watermark, no signature.";

export async function makeImage(opts: {
  out: string;
  prompt: string;
  refs?: string[];
  model?: string;
  aspect?: string;
  size?: string;
}) {
  const parts: Part[] = [...(opts.refs ?? []).map(fileToPart), { text: opts.prompt }];
  const json = await generate(opts.model ?? "gemini-3-pro-image", {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: opts.aspect ?? "1:1", ...(opts.size ? { imageSize: opts.size } : {}) },
    },
  });
  const img = inlineParts(json).find((p) => p.mimeType.startsWith("image/"));
  if (!img) throw new Error("No image returned: " + JSON.stringify(json).slice(0, 400));
  writeFile(opts.out, img.data);
  return opts.out;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
  const [out, prompt, ...refs] = args.filter((a) => !a.startsWith("--"));
  await makeImage({ out, prompt, refs, model: flags.model, aspect: flags.aspect, size: flags.size });
  console.log("wrote", out);
}
