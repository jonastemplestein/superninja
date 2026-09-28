// A facing check: each take's monster just after it has landed (the right half of the frame, big), labelled, four
// across. The ninja stands on the left: every monster should look (and lean) left.
//   bun assets-src/clips/2026-09-27/supercut/facing.ts <take>…
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { anchors, loadTake } from "./anchors";

const HERE = dirname(fileURLToPath(import.meta.url));
const names = process.argv.slice(2);
const tw = 480, th = 400;
const bufs: Buffer[] = [];
const labels: string[] = [];
for (const n of names) {
  const tk = loadTake(n);
  const a = anchors(tk);
  const t = (a.entrance?.land ?? 3) + 1.2;
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(t), "-i", tk.master, "-frames:v", "1", "-vf", `crop=960:800:960:120,scale=${tw}:${th},format=rgb24`, "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 26 });
  bufs.push(r.stdout.subarray(0, tw * th * 3));
  labels.push(`${n} @${t.toFixed(2)}`);
}
const out = join(HERE, "review", "facing.jpg");
const py = `
import sys, json
from PIL import Image, ImageDraw, ImageFont
raw = sys.stdin.buffer.read(); tw, th, n, cols = ${tw}, ${th}, ${names.length}, 4
labels = json.loads(sys.argv[2]); rows = (n + cols - 1) // cols; lh = 18
sheet = Image.new("RGB", (cols * tw, rows * (th + lh)), (24, 22, 30)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 14)
except Exception: font = ImageFont.load_default()
for k in range(n):
    im = Image.frombytes("RGB", (tw, th), raw[k*tw*th*3:(k+1)*tw*th*3]); x, y = (k % cols) * tw, (k // cols) * (th + lh)
    sheet.paste(im, (x, y)); d.text((x + 4, y + th + 1), labels[k], fill=(235, 235, 235), font=font)
sheet.save(sys.argv[1], quality=85)
`;
const p = spawnSync("python3", ["-c", py, out, JSON.stringify(labels)], { input: Buffer.concat(bufs), maxBuffer: 1 << 30 });
if (p.status !== 0) throw new Error(p.stderr.toString());
console.log(out);
process.exit(0);
