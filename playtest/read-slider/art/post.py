# Picture reading v2: cut, trim and size the candidates exactly as scripts/post-art.py does a word picture (rembg
# isnet-anime, faint alpha cleaned, trimmed with a 6 px margin, at most 384 px wide, WebP q86), into cand/<word>_<k>.webp,
# then draw each word's candidates on the game's plate at 200 px and 48 px (sheets/<word>.png) to pick by eye.
#   uv run --with 'rembg[cpu]' --with pillow --with scipy python playtest/read-slider/art/post.py [word...] [--force]
# (post-art.py itself also rewrites src/content/pic-plates.gen.ts, an existing file, so it is not run here.)
import glob, os, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RAW, CAND, SHEETS = (os.path.join(HERE, d) for d in ("raw", "cand", "sheets"))
for d in (CAND, SHEETS):
    os.makedirs(d, exist_ok=True)
force = "--force" in sys.argv
only = [a for a in sys.argv[1:] if not a.startswith("--")]
session = None
# Scenes (several things on white: the gag pictures, the rain redraw): rembg keeps only the "main" thing and drops the
# rest (27 Sep: it cut bowrain down to a few ribbon ends), so these are cut by a flood fill of the white page from the
# picture's border instead: every near-white pixel joined to the border goes, and anything the ink encloses stays.
SCENES = {"bowrain", "coatrain", "redraw-rain", "redraw-sea"}


def flood_cut(im):
    import numpy as np
    from scipy import ndimage
    from PIL import ImageFilter
    rgb = np.asarray(im.convert("RGB")).astype(np.int16)
    white = (rgb.min(axis=2) >= 228) & ((rgb.max(axis=2) - rgb.min(axis=2)) <= 18)
    lab, _ = ndimage.label(white)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0])
    m = Image.fromarray((bg * 255).astype(np.uint8), "L")
    # a 1 px grow into the anti-aliased fringe, then a soft edge
    m = m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA")
    out.putalpha(m.point(lambda v: 255 - v))
    return out

words = {}
for src in sorted(glob.glob(os.path.join(RAW, "*.png"))):
    name = os.path.basename(src)[:-4]
    word, k = name.rsplit("_", 1)
    if only and word not in only:
        continue
    words.setdefault(word, []).append(name)
    out = os.path.join(CAND, name + ".webp")
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(src) and not force:
        continue
    if word in SCENES:
        im = flood_cut(Image.open(src).convert("RGBA"))
    else:
        if session is None:
            from rembg import new_session
            session = new_session("isnet-anime")
        from rembg import remove
        im = remove(Image.open(src).convert("RGBA"), session=session, post_process_mask=True)
    a = im.split()[3].point(lambda v: 0 if v < 12 else v)
    im.putalpha(a)
    bbox = a.getbbox()
    if bbox:
        pad = 6
        im = im.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad)))
    if im.width > 384:
        im = im.resize((384, round(im.height * 384 / im.width)), Image.LANCZOS)
    im.save(out, "WEBP", quality=86, method=6)
    print("✓", name, im.size)

PLATE = (0xBF, 0xE6, 0xFF)  # the "sky" plate: the fallback every new picture gets until gen-pic-plates.py runs
INK = (0x2B, 0x1D, 0x14)


def card(im, size):
    """The picture on a plate as the game draws it: a rounded plate, the picture fitted into 78% x 74% of it."""
    c = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    d.rounded_rectangle((1, 1, size - 2, size - 2), radius=max(4, size // 8), fill=PLATE + (255,), outline=INK + (255,), width=max(2, size // 40))
    bw, bh = int(size * 0.78), int(size * 0.74)
    p = im.copy()
    p.thumbnail((bw, bh), Image.LANCZOS)
    c.alpha_composite(p, (int(size * 0.11) + (bw - p.width) // 2, int(size * 0.10) + (bh - p.height) // 2))
    return c


for word, names in words.items():
    names = sorted(names)
    sheet = Image.new("RGB", (len(names) * 220 + 20, 300), (250, 246, 236))
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(names):
        f = os.path.join(CAND, n + ".webp")
        if not os.path.exists(f):
            continue
        im = Image.open(f).convert("RGBA")
        big = card(im, 200)
        small = card(im, 48)
        x = 20 + i * 220
        sheet.paste(big, (x, 10), big)
        sheet.paste(small, (x + 76, 222), small)
        d.text((x, 276), n, fill=INK)
    sheet.save(os.path.join(SHEETS, word + ".png"))
print("sheets →", SHEETS)
