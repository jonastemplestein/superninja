# Filmstrip for reviewing a take: python3 assets-src/intro-v3/strip.py <video> <out.jpg> [step=0.5] [end=8] [w=320]
import sys, subprocess, tempfile, os
from PIL import Image, ImageDraw, ImageFont
v, out = sys.argv[1], sys.argv[2]
step = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
end = float(sys.argv[4]) if len(sys.argv) > 4 else 8
w = int(sys.argv[5]) if len(sys.argv) > 5 else 320
d = tempfile.mkdtemp()
subprocess.run(["ffmpeg", "-loglevel", "error", "-i", v, "-vf", f"fps=1/{step},scale={w}:-1", "-t", str(end), f"{d}/f_%03d.jpg"], check=True)
fs = sorted(os.listdir(d)); ims = [Image.open(f"{d}/{f}") for f in fs]
cols = 6; rows = (len(ims) + cols - 1) // cols; h = ims[0].height
sheet = Image.new("RGB", (cols * w, rows * (h + 16)), (30, 30, 30)); dr = ImageDraw.Draw(sheet)
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 13)
for i, im in enumerate(ims):
    x, y = (i % cols) * w, (i // cols) * (h + 16)
    sheet.paste(im, (x, y)); dr.text((x + 4, y + h + 1), f"{i * step:.1f}s", fill=(255, 220, 120), font=font)
sheet.save(out, quality=85); print(out, len(ims))
