// The check of a finished cut: one frame per enemy, just before its first shot's anchor (the monster in full view,
// before the burst covers it), big enough to see which way it faces; labelled with the enemy and the time in the cut.
//   bun assets-src/clips/2026-09-27/supercut/check.ts long|short
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beatAt, place, type Plan } from "./edit";

const HERE = dirname(fileURLToPath(import.meta.url));
const which = process.argv[2] ?? "long";
const plans: Record<string, Plan> = await import("./plans");
const plan = plans[which.toUpperCase()];
const file = join(plan.dir ?? join(HERE, ".."), `${plan.name}.mp4`);
const placed = place(plan);
const seen = new Set<string>();
const picks: { t: number; label: string }[] = [];
for (const p of placed) {
  if (seen.has(p.shot.enemy)) continue;
  seen.add(p.shot.enemy);
  const t = Math.max(p.v, beatAt(p.shot.beat) - (p.shot.anchor === "entrance" ? -0.5 : 0.2));
  picks.push({ t, label: `${p.shot.enemy} @${t.toFixed(2)}s` });
}
const tw = 480, th = 270;
const bufs = picks.map((x) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(x.t), "-i", file, "-frames:v", "1", "-vf", `scale=${tw}:${th},format=rgb24`, "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 26 });
  return r.stdout.subarray(0, tw * th * 3);
});
const out = join(HERE, `${plan.name}.enemies.jpg`);
const py = `
import sys, json
from PIL import Image, ImageDraw, ImageFont
raw = sys.stdin.buffer.read(); tw, th, n, cols = ${tw}, ${th}, ${picks.length}, 4
labels = json.loads(sys.argv[2]); rows = (n + cols - 1) // cols; lh = 18
sheet = Image.new("RGB", (cols * tw, rows * (th + lh)), (24, 22, 30)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 14)
except Exception: font = ImageFont.load_default()
for k in range(n):
    im = Image.frombytes("RGB", (tw, th), raw[k*tw*th*3:(k+1)*tw*th*3]); x, y = (k % cols) * tw, (k // cols) * (th + lh)
    sheet.paste(im, (x, y)); d.text((x + 4, y + th + 1), labels[k], fill=(235, 235, 235), font=font)
sheet.save(sys.argv[1], quality=88)
`;
const p = spawnSync("python3", ["-c", py, out, JSON.stringify(picks.map((x) => x.label))], { input: Buffer.concat(bufs), maxBuffer: 1 << 30 });
if (p.status !== 0) throw new Error(p.stderr.toString());
console.log(out, `${picks.length} enemies`);
process.exit(0);
