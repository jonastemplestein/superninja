# Labelled contact sheet: python3 assets-src/world-flower/sheet.py '<glob>' <out.jpg> [cell] [cols]
import sys, glob, math
from PIL import Image, ImageDraw, ImageFont
pat, out = sys.argv[1], sys.argv[2]
cell = int(sys.argv[3]) if len(sys.argv) > 3 else 360
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 5
files = sorted(glob.glob(pat))
rows = math.ceil(len(files) / cols)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
except Exception: font = ImageFont.load_default()
sheet = Image.new("RGB", (cols * cell, rows * (cell + 30)), (40, 36, 44))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB"); im.thumbnail((cell - 8, cell - 8))
    x, y = (i % cols) * cell, (i // cols) * (cell + 30)
    sheet.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2))
    d.text((x + 8, y + cell + 3), f.split("/")[-1].rsplit(".", 1)[0], fill=(255, 240, 200), font=font)
sheet.save(out, quality=88); print(out, len(files))
