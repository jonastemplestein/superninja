# Post-process generated art: background removal (rembg isnet-anime) for sprites, trim, resize, webp.
# Usage: uv run --with 'rembg[cpu]' --with pillow scripts/post-art.py
# Reads assets-src/art-jobs.json (written by scripts/export-art-jobs.ts).
import json, os, sys
from PIL import Image

from PIL import ImageFilter

def add_rim(im, frac=0.018):
    """Bake the Super Ninja 'sticker rim': a cream outline around the sprite's silhouette."""
    r = max(5, round(max(im.size) * frac))
    pad = r + 4
    big = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    big.paste(im, (pad, pad))
    a = big.split()[3].point(lambda v: 255 if v > 60 else 0)
    grown = a.filter(ImageFilter.MaxFilter(r * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))
    rim = Image.new("RGBA", big.size, (255, 246, 226, 255))
    rim.putalpha(grown)
    rim.alpha_composite(big)
    return rim

jobs = json.load(open("assets-src/art-jobs.json"))
only = sys.argv[1:]
session = None
os.makedirs("public/a/i", exist_ok=True)
os.makedirs("assets-src/cut", exist_ok=True)

for j in jobs:
    if only and not any(j["id"].startswith(p) for p in only):
        continue
    src = f"assets-src/art/{j['id']}.png"
    out = f"public/a/i/{j['id']}.webp"
    if not os.path.exists(src):
        continue
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(src) and not only and not os.environ.get("FORCE"):
        continue
    im = Image.open(src).convert("RGBA")
    if j.get("cut"):
        cut_path = f"assets-src/cut/{j['id']}.png"
        if os.path.exists(cut_path) and os.path.getmtime(cut_path) > os.path.getmtime(src):
            im = Image.open(cut_path).convert("RGBA")
        else:
            if session is None:
                from rembg import new_session
                session = new_session("isnet-anime")
            from rembg import remove
            im = remove(im, session=session, post_process_mask=True)
            im.save(cut_path)
        # clean up faint alpha noise then trim to content
        a = im.split()[3].point(lambda v: 0 if v < 12 else v)
        im.putalpha(a)
        bbox = a.getbbox()
        if bbox:
            pad = 6
            bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
            im = im.crop(bbox)
    w = j["w"]
    # (no sticker rim: the art already has ink outlines; a soft shadow is added in CSS)
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(out, "WEBP", quality=86, method=6)
    print("✓", j["id"], im.size)
