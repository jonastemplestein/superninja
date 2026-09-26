// Editor's loupe for the film-baron takes: frame-by-frame motion, and labelled frame tiles.
//
//   bun look.ts diff <file.mp4> <from> <to>            per 1/30 s frame: mean abs change from the frame before (0–255)
//                                                        and mean luma; "=" marks a repeated frame
//   bun look.ts tile <file.mp4> <from> <to> <step> <out.jpg>   frames every <step> s, six across, labelled with their time
import { spawnSync } from "node:child_process";

const W = 64, H = 36;
function gray(file: string, from: number, to: number): Buffer[] {
  // (seek after -i: exact frames)
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-ss", String(from), "-t", String(to - from), "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-fps_mode", "passthrough", "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 30 });
  const n = W * H, out: Buffer[] = [];
  for (let i = 0; i + n <= r.stdout.length; i += n) out.push(r.stdout.subarray(i, i + n));
  return out;
}

const [cmd, file, a, b, c, d] = process.argv.slice(2);
if (cmd === "diff") {
  const from = Number(a), to = Number(b);
  const fr = gray(file, from, to);
  const rows: string[] = [];
  fr.forEach((f, k) => {
    let luma = 0, diff = 0;
    for (let i = 0; i < f.length; i++) {
      luma += f[i];
      if (k) diff += Math.abs(f[i] - fr[k - 1][i]);
    }
    const dm = k ? diff / f.length : NaN;
    rows.push(`${(from + k / 30).toFixed(3)} d=${Number.isNaN(dm) ? "  -  " : dm.toFixed(2).padStart(5)}${k && dm < 0.05 ? "=" : " "} y=${(luma / f.length).toFixed(0)}`);
  });
  console.log(rows.join("\n"));
} else if (cmd === "tile") {
  const from = Number(a), to = Number(b), step = Number(c), out = d;
  const times: number[] = [];
  for (let t = from; t < to - 1e-6; t += step) times.push(Math.round(t * 1000) / 1000);
  const tw = 320, th = 180;
  // exact frames (seek after -i), every one in the range, then keep the nearest to each time
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-ss", String(from), "-t", String(to - from + 0.05), "-vf", `scale=${tw}:${th}:flags=bicubic,format=rgb24`, "-fps_mode", "passthrough", "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 30 });
  const n = tw * th * 3, all: Buffer[] = [];
  for (let i = 0; i + n <= r.stdout.length; i += n) all.push(r.stdout.subarray(i, i + n));
  const pick = times.map((t) => Math.min(all.length - 1, Math.round((t - from) * 30)));
  const py = `
import sys, json
from PIL import Image, ImageDraw, ImageFont
raw = sys.stdin.buffer.read(); tw, th = ${tw}, ${th}; labels = json.loads(sys.argv[2]); n = len(labels); cols = 6
rows = (n + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 18)), (24, 22, 30)); dr = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
except Exception: font = ImageFont.load_default()
for k in range(n):
    im = Image.frombytes("RGB", (tw, th), raw[k*tw*th*3:(k+1)*tw*th*3]); x, y = (k % cols) * tw, (k // cols) * (th + 18)
    sheet.paste(im, (x, y)); dr.text((x + 4, y + th + 2), labels[k], fill=(235, 235, 235), font=font)
sheet.save(sys.argv[1], quality=88)
`;
  const buf = Buffer.concat(pick.map((i) => all[i]));
  const labels = pick.map((i) => `${(from + i / 30).toFixed(3)} s`);
  const p = spawnSync("python3", ["-c", py, out, JSON.stringify(labels)], { input: buf });
  if (p.status !== 0) console.error(p.stderr.toString());
  else console.log(out);
} else if (cmd === "match") {
  // which frame of the film's own clip (<source.mp4>, 24 fps) each master frame in [from, to) shows: normalised
  // correlation, so the shot's fade-in (opacity over a flat background) doesn't matter
  const src = a, from = Number(b), to = Number(c);
  const m = gray(file, from, to);
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", src, "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-fps_mode", "passthrough", "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 30 });
  const n = W * H, s: Buffer[] = [];
  for (let i = 0; i + n <= r.stdout.length; i += n) s.push(r.stdout.subarray(i, i + n));
  const norm = (f: Buffer) => {
    let mu = 0;
    for (const x of f) mu += x;
    mu /= f.length;
    let v = 0;
    const o = new Float64Array(f.length);
    for (let i = 0; i < f.length; i++) (o[i] = f[i] - mu), (v += o[i] * o[i]);
    const sd = Math.sqrt(v) || 1;
    for (let i = 0; i < f.length; i++) o[i] /= sd;
    return o;
  };
  const sn = s.map(norm);
  m.forEach((f, k) => {
    const x = norm(f);
    let best = -2, bi = -1, second = -2;
    sn.forEach((y, j) => {
      let c = 0;
      for (let i = 0; i < n; i++) c += x[i] * y[i];
      if (c > best) (second = best), (best = c), (bi = j);
      else if (c > second) second = c;
    });
    console.log(`${(from + k / 30).toFixed(3)} src#${bi} (${(bi / 24).toFixed(3)} s) r=${best.toFixed(4)} next=${second.toFixed(4)}`);
  });
} else console.log("usage: bun look.ts diff <file> <from> <to> | tile <file> <from> <to> <step> <out.jpg>");
