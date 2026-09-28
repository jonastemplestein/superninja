#!/usr/bin/env python3
"""A labelled strip of frames from a video, for choosing in and out points by eye.

  python3 assets-src/clips/2026-09-27/gemtrial/strip.py <video> <from> <to> <out.jpg> [fps=10] [cols=6] [width=320]

Each frame is labelled with its time on the video's clock (seconds, 3 decimals), and with the mean absolute
difference from the frame before (0-255), so a frozen or repeated frame (d=0.0) stands out.
"""
import subprocess, sys
from PIL import Image, ImageDraw, ImageFont

video, t0, t1, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
fps = float(sys.argv[5]) if len(sys.argv) > 5 else 10
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 6
w = int(sys.argv[7]) if len(sys.argv) > 7 else 320
h = round(w * 9 / 16)
start = round(t0 * 30) / 30
raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", video, "-ss", str(start), "-t", str(t1 - start),
                      "-vf", f"fps={fps}:start_time={start}:round=near,scale={w}:{h},format=rgb24", "-f", "rawvideo", "pipe:1"],
                     capture_output=True, check=True).stdout
n = len(raw) // (w * h * 3)
rows = (n + cols - 1) // cols
lh = 16
sheet = Image.new("RGB", (cols * w, rows * (h + lh)), (24, 22, 30))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
except Exception:
    font = ImageFont.load_default()
prev = None
for k in range(n):
    buf = raw[k * w * h * 3:(k + 1) * w * h * 3]
    im = Image.frombytes("RGB", (w, h), buf)
    diff = 0.0
    if prev is not None:
        diff = sum(abs(a - b) for a, b in zip(buf[::97], prev[::97])) / len(buf[::97])
    prev = buf
    x, y = (k % cols) * w, (k // cols) * (h + lh)
    sheet.paste(im, (x, y))
    d.text((x + 4, y + h + 1), f"{start + k / fps:.3f}s  d={diff:.1f}", fill=(235, 235, 235), font=font)
sheet.save(out, quality=85)
print(out, n, "frames")
