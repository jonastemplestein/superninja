// A review sheet per take: frames around its entrance and its knockout (and any extra times), six across, each
// labelled, to check the monster, its facing and the moment to cut on.
//   bun assets-src/clips/2026-09-27/supercut/review.ts <take> [entrance offsets] [ko offsets] [extra: t,t,…]
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { anchors, loadTake } from "./anchors";

const HERE = dirname(fileURLToPath(import.meta.url));
export function review(name: string, times?: { t: number; label: string }[], out?: string) {
  const tk = loadTake(name);
  const a = anchors(tk);
  const list = times ?? [
    ...[-0.2, -0.1, 0, 0.15, 0.4, 0.8].map((d) => ({ t: (a.entrance?.t ?? 3) + d, label: `in ${d >= 0 ? "+" : ""}${d}` })),
    ...[-0.8, -0.4, -0.2, 0, 0.15, 0.3, 0.5, 0.7, 0.9, 1.1, 1.4, 1.8].map((d) => ({ t: (a.ko ?? 0) + d, label: `ko ${d >= 0 ? "+" : ""}${d}` })),
  ];
  const tw = 320, th = 180;
  const bufs: Buffer[] = [];
  for (const x of list) {
    const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(Math.max(0, x.t - 0.005)), "-i", tk.master, "-frames:v", "1", "-vf", `scale=${tw}:${th},format=rgb24`, "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 26 });
    bufs.push(r.stdout.length >= tw * th * 3 ? r.stdout.subarray(0, tw * th * 3) : Buffer.alloc(tw * th * 3));
  }
  mkdirSync(join(HERE, "review"), { recursive: true });
  const file = out ?? join(HERE, "review", `${name}.jpg`);
  const labels = list.map((x) => `${x.label}  ${x.t.toFixed(2)}s`);
  const py = `
import sys, json
from PIL import Image, ImageDraw, ImageFont
raw = sys.stdin.buffer.read(); tw, th, n, cols = ${tw}, ${th}, ${list.length}, 6
labels = json.loads(sys.argv[2]); rows = (n + cols - 1) // cols; lh = 16
sheet = Image.new("RGB", (cols * tw, rows * (th + lh)), (24, 22, 30)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
except Exception: font = ImageFont.load_default()
for k in range(n):
    im = Image.frombytes("RGB", (tw, th), raw[k*tw*th*3:(k+1)*tw*th*3]); x, y = (k % cols) * tw, (k // cols) * (th + lh)
    sheet.paste(im, (x, y)); d.text((x + 4, y + th + 1), labels[k], fill=(235, 235, 235), font=font)
sheet.save(sys.argv[1], quality=85)
`;
  const p = spawnSync("python3", ["-c", py, file, JSON.stringify(labels)], { input: Buffer.concat(bufs), maxBuffer: 1 << 30 });
  if (p.status !== 0) throw new Error(p.stderr.toString());
  return file;
}

/** Each big hit before the knockout: the throw, the impact and the reel (three frames a hit, two hits a row). */
export function hitsReview(name: string) {
  const a = anchors(loadTake(name));
  const list = a.hits.slice(0, -1).flatMap((h, i) => [-0.4, 0, 0.3].map((d) => ({ t: h + d, label: `hit ${i} ${d >= 0 ? "+" : ""}${d}` })));
  return review(name, list, join(HERE, "review", `${name}-hits.jpg`));
}

if (import.meta.main) {
  const [name, extra] = process.argv.slice(2);
  if (extra === "hits") {
    console.log(hitsReview(name));
    process.exit(0);
  }
  const times = extra ? extra.split(",").map((s) => ({ t: Number(s), label: "" })) : undefined;
  console.log(review(name, times, extra ? join(HERE, "review", `${name}-x.jpg`) : undefined));
  process.exit(0);
}
