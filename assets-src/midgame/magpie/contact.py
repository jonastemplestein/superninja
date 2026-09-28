# Contact sheets for the Sky Magpie, at game size. Battle.tsx: a boss with scale 1.5 is 400 px tall in a 472 px box,
# feet at y 574, centred at x 1040 of the 1280 x 720 stage; Gloop (scale 1) is 286 px at x 1020. The HP bar face is
# .bt-hp-face (battle.css): a 62 px circle, 4 px ink border, the img at 124 % from -12 % / -4 %, object-fit cover, top.
#   uv run --with pillow python assets-src/midgame/magpie/contact.py
# Writes sheets/contact.jpg (the pick in context) and sheets/candidates.jpg (all eight, cut, on the Sky Temple).
import json, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
I = "public/a/i/"
picks = json.load(open(os.path.join(HERE, "picks.json")))
PICK = picks["picks"][0]["cut"][:-4]
names = sorted(n[:-4] for n in os.listdir(os.path.join(HERE, "cut")) if n.endswith(".png"))
cand = {n: Image.open(os.path.join(HERE, "cut", n + ".png")).convert("RGBA") for n in names}
load = lambda p: Image.open(p).convert("RGBA")
sprite, face_file = load(I + "mon_boss_magpie.webp"), load(I + "mon_boss_magpie_face.webp")
interim = load(os.path.join(HERE, "prev", "mon_boss_magpie.interim-2026-09-27-1922.webp"))
refs = {n: load(I + f"mon_{n}.webp") for n in ["boss_panda", "boss_knight", "gloop"]}
# (panda and Gloop are MONSTER_INFO facing "right": the game mirrors them to face the ninja, and so do these sheets)


def font(size):
    try:
        return ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", size)
    except OSError:
        return ImageFont.load_default()


F, FS = font(26), font(34)


def fit(im, scale=1.5, flip=False):
    h = round(286 * (1 + (scale - 1) * 0.8))
    s = min(h / im.height, round(h * 1.18) / im.width)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im


def stage(im, kai=True):
    bg = load(I + "bg_sky.webp")
    bg = bg.resize((1280, round(bg.height * 1280 / bg.width)), Image.LANCZOS).crop((0, 0, 1280, 720))
    if kai:  # roughly where the ninja stands (approximate: Ninja.tsx places it)
        k = load(I + "hero_kai_ready.webp")
        k = k.resize((round(k.width * 300 / k.height), 300), Image.LANCZOS)
        bg.alpha_composite(k, (150 - k.width // 2, 572 - k.height))
    sp = fit(im)
    sh = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse((1040 - sp.width * 0.38, 562, 1040 + sp.width * 0.38, 586), fill=(43, 29, 20, 70))
    bg.alpha_composite(sh)
    bg.alpha_composite(sp, (round(1040 - sp.width / 2), 574 - sp.height))
    return bg


def hp_face(im, flip=False, k=3):
    D, box = 62 * k, round(77 * k)
    s = max(box / im.width, box / im.height)  # object-fit: cover
    sp = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    if flip:
        sp = sp.transpose(Image.FLIP_LEFT_RIGHT)
    ox = (sp.width - box) // 2  # object-position: 50% 0
    sp = sp.crop((ox, 0, ox + box, box))
    tile = Image.new("RGBA", (D, D), (255, 217, 138, 255))
    tile.alpha_composite(sp, (0, 0), (round(0.12 * D), round(0.04 * D)))  # left -12 %, top -4 %
    mask = Image.new("L", (D, D), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, D - 1, D - 1), fill=255)
    out = Image.new("RGBA", (D, D), (0, 0, 0, 0))
    out.paste(tile, (0, 0), mask)
    ImageDraw.Draw(out).ellipse((0, 0, D - 1, D - 1), outline=(43, 29, 20, 255), width=4 * k)
    return out


def caption(d, xy, text, f=F, fill=(25, 25, 25)):
    d.text(xy, text, fill=fill, font=f)


# ---- sheets/contact.jpg
W = 1960
sheet = Image.new("RGBA", (W, 1960), (236, 233, 226, 255))
d = ImageDraw.Draw(sheet)
caption(d, (30, 20), "The Sky Magpie (w6-11), pick: " + PICK + " -> public/a/i/mon_boss_magpie.webp, faces LEFT", FS)

# 1. the lineup at game size (the game mirrors panda and Gloop, facing "right", to face the ninja)
caption(d, (30, 80), "1. At game size beside the house monsters (as the game shows them), and the interim Magpie it replaces")
x, base = 30, 560
for label, im in [("boss_panda", fit(refs["boss_panda"], 1.5, True)), ("boss_knight", fit(refs["boss_knight"])), ("gloop", fit(refs["gloop"], 1.0, True)), ("NEW mon_boss_magpie", fit(sprite)), ("interim (replaced)", fit(interim))]:
    sheet.alpha_composite(im, (x, base - im.height))
    caption(d, (x, base + 8), label)
    x += im.width + 40

# 2. on the Sky Temple at game size, with Kai, scaled to half
caption(d, (30, 620), "2. On bg_sky at game size (shown at 0.75), the ninja on the left")
st = stage(sprite).resize((960, 540), Image.LANCZOS)
sheet.alpha_composite(st, (30, 660))
st2 = stage(interim).resize((640, 360), Image.LANCZOS)
sheet.alpha_composite(st2, (1010, 660))
caption(d, (1010, 1030), "(the interim Magpie, for comparison)")

# 3. the HP bar faces, drawn 3x
caption(d, (30, 1230), "3. HP bar faces (.bt-hp-face, drawn 3x): the house bosses; the new sprite as today's CSS crops it; the new face file under the same CSS")
x = 30
for label, f in [("panda", hp_face(refs["boss_panda"], True)), ("knight", hp_face(refs["boss_knight"])), ("gloop", hp_face(refs["gloop"], True)), ("magpie sprite", hp_face(sprite)), ("magpie _face file", hp_face(face_file)), ("interim", hp_face(interim))]:
    sheet.alpha_composite(f, (x, 1270))
    caption(d, (x, 1466), label)
    x += 230
thumb = fit(sprite).resize((96, round(96 * sprite.height / sprite.width)), Image.LANCZOS)
sheet.alpha_composite(thumb, (x + 20, 1300))
caption(d, (x + 20, 1466), "at 96 px wide")

# 4. all eight candidates
caption(d, (30, 1520), "4. The eight candidates (round a: black mask; round b: purple mask). Pick outlined.")
x = 30
for n, im in cand.items():
    t = im.resize((round(im.width * 180 / im.height), 180), Image.LANCZOS)
    if n == PICK:
        d.rectangle((x - 8, 1560 - 8, x + t.width + 8, 1560 + 188), outline=(214, 60, 40), width=6)
    sheet.alpha_composite(t, (x, 1560))
    caption(d, (x, 1756), n)
    x += t.width + 36
note = "Staggered variant: none (no boss has one; version 1 poses by transform and tint)."
caption(d, (30, 1820), note)
caption(d, (30, 1860), "MONSTER_INFO: boss_magpie { hp: 9, facing: \"left\", scale: 1.5 } (facing unchanged from the interim sprite).")
sheet.convert("RGB").save(os.path.join(HERE, "sheets", "contact.jpg"), quality=86)

# ---- sheets/candidates.jpg: every candidate on the Sky Temple at game size (half scale)
tiles = []
for n, im in cand.items():
    t = stage(im, kai=False).resize((640, 360), Image.LANCZOS)
    td = ImageDraw.Draw(t)
    td.rectangle((0, 0, td.textlength(n, font=F) + 20, 40), fill=(255, 255, 255, 220))
    td.text((10, 6), n, fill=(20, 20, 20), font=F)
    tiles.append(t)
g = Image.new("RGB", (2 * 650 + 10, ((len(tiles) + 1) // 2) * 370 + 10), (40, 40, 40))
for i, t in enumerate(tiles):
    g.paste(t.convert("RGB"), (10 + (i % 2) * 650, 10 + (i // 2) * 370))
g.save(os.path.join(HERE, "sheets", "candidates.jpg"), quality=85)
print("wrote sheets/contact.jpg and sheets/candidates.jpg")
