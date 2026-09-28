"""The comparison and contact sheets in shots/ (from the screenshots that playtest/runs/title-design/hero-poster/shoot.ts takes).

    python3 docs/title-design/hero-poster/make/figures.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent.parent
S = HERE / "shots"
CUR = HERE.parent / "current"
F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
Fs = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 20)


def sheet(rows, cols, cells, cw, ch, out, font=F, pad=40):
    c = Image.new("RGB", (cw * cols, (ch + pad) * rows), "white")
    d = ImageDraw.Draw(c)
    for i, (label, path) in enumerate(cells):
        x, y = (i % cols) * cw, (i // cols) * (ch + pad)
        im = Image.open(path).convert("RGB")
        im = im.resize((cw - 8, int(im.height * (cw - 8) / im.width)))
        d.text((x + 8, y + 8), label, fill=(0, 0, 0), font=font)
        c.paste(im, (x + 4, y + pad))
    c.save(out, quality=86, optimize=True)
    print(out.name, c.size)


# today, the site, this design: the same phone (844x390)
sheet(3, 1, [
    ("Today: the game's title, /play/ (844x390)", CUR / "title-844x390.jpg"),
    ("The marketing site's hero, same phone", CUR / "site-hero-844x390.jpg"),
    ("Hero poster: the title redesigned (first launch)", S / "first-844x390.jpg"),
], 1266, 585, S / "compare-844x390.jpg")
# the states at 844x390
sheet(2, 2, [
    ("First launch (no players yet)", S / "first-844x390.jpg"),
    ("Returning child: Maya (Sensei: \"Welcome back, Maya!\")", S / "back-844x390.jpg"),
    ("Four children: Maya plays; Leo, Ava, Theo beside", S / "many-844x390.jpg"),
    ("Seven children: three faces and \"...\" (everyone)", S / "lots-844x390.jpg"),
], 1000, 462, S / "states-844x390.jpg", font=Fs)
# the three phones
sheet(3, 1, [
    ("iPhone SE, 667x375", S / "first-667x375.jpg"),
    ("iPhone 12-15, 844x390", S / "back-844x390.jpg"),
    ("iPhone Pro Max, 932x430", S / "many-932x430.jpg"),
], 1100, 560, S / "phones.jpg")
# Play: rest, hover, press, the 8 s paw, the flower's petal landing
crop = (300, 560, 1300, 1170)  # DPR 3 px at 844x390
cells = [("At rest (breathing)", "first"), ("Hover (a mouse or iPad pointer)", "hover"), ("Pressed", "press"), ("Idle 8 s: the paw taps it", "paw"), ("The flower's petal lands in the disc", "comet")]
c = Image.new("RGB", (500 * 5, 345), "white")
d = ImageDraw.Draw(c)
for i, (label, n) in enumerate(cells):
    im = Image.open(S / f"{n}-844x390.jpg").convert("RGB").crop(crop).resize((500, 305))
    d.text((i * 500 + 8, 8), label, fill=(0, 0, 0), font=Fs)
    c.paste(im, (i * 500, 40))
c.save(S / "play-states-844x390.jpg", quality=86, optimize=True)
print("play-states-844x390.jpg", c.size)
