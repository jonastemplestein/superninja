# Cut and export the picks for "Baron final only" (see ./gen-baron-final-only.ts and ./picks.json), the way
# scripts/post-art.py cuts sprites: rembg isnet-anime, faint alpha cleaned, trimmed with a 6 px pad, WebP q86.
#   uv run --with 'rembg[cpu]' --with pillow python assets-src/midgame/art/cut.py
# New files only: it refuses to overwrite anything already in public/a/i/.
import json, os
from PIL import Image
from rembg import new_session, remove

HERE = os.path.dirname(os.path.abspath(__file__))
picks = json.load(open(os.path.join(HERE, "picks.json")))
session = new_session("isnet-anime")
os.makedirs(os.path.join(HERE, "cut"), exist_ok=True)

for p in picks["picks"]:
    src = os.path.join(HERE, "raw", p["raw"])
    out = p["out"]
    if out.startswith("public/") and os.path.exists(out):
        print("skip (exists, new files only):", out)
        continue
    im = Image.open(src).convert("RGBA")
    im = remove(im, session=session, post_process_mask=True)
    im.save(os.path.join(HERE, "cut", os.path.basename(p["raw"])))
    a = im.split()[3].point(lambda v: 0 if v < 12 else v)
    im.putalpha(a)
    bbox = a.getbbox()
    if bbox:
        pad = 6
        im = im.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad)))
    w = p["w"]
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, "WEBP", quality=86, method=6)
    print("✓", out, im.size)
