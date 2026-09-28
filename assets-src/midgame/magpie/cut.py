# Cut the Sky Magpie candidates and export the pick, the way scripts/post-art.py cuts sprites: rembg isnet-anime,
# faint alpha cleaned, trimmed with a 6 px pad, boss width 720, WebP q86.
#   uv run --with 'rembg[cpu]' --with pillow python assets-src/midgame/magpie/cut.py           # cut every raw into cut/
#   uv run --with 'rembg[cpu]' --with pillow python assets-src/midgame/magpie/cut.py --export  # export picks.json's picks
# cut/<name>.png are the trimmed transparent masters (full resolution). It never overwrites a file in public/a/i/ unless
# picks.json marks that pick "replaces" (mon_boss_magpie.webp: the interim sprite it replaced is kept in prev/).
import glob, json, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CUT = os.path.join(HERE, "cut")
os.makedirs(CUT, exist_ok=True)


def trim(im, pad=6):
    a = im.split()[3].point(lambda v: 0 if v < 12 else v)
    im.putalpha(a)
    bbox = a.getbbox()
    if bbox:
        im = im.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad)))
    return im


if "--export" not in sys.argv:
    from rembg import new_session, remove

    session = new_session("isnet-anime")
    for src in sorted(glob.glob(os.path.join(HERE, "raw", "*.png"))):
        out = os.path.join(CUT, os.path.basename(src))
        if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(src):
            continue
        im = remove(Image.open(src).convert("RGBA"), session=session, post_process_mask=True)
        im = trim(im)
        im.save(out)
        print("cut", os.path.basename(src), im.size)
else:
    picks = json.load(open(os.path.join(HERE, "picks.json")))
    for p in picks["picks"]:
        if os.path.exists(p["out"]) and not p.get("replaces"):
            print("skip (exists; new files only unless the pick says it replaces):", p["out"])
            continue
        im = Image.open(os.path.join(CUT, p["cut"])).convert("RGBA")
        if p.get("box"):  # a portrait: [left, top, right, bottom] in master px (may reach past the edges: transparent)
            im = im.crop(tuple(p["box"]))
        w = p["w"]
        if im.width > w:
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        os.makedirs(os.path.dirname(p["out"]), exist_ok=True)
        im.save(p["out"], "WEBP", quality=86, method=6)
        print("✓", p["out"], im.size)
