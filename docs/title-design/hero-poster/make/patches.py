"""Cut three feathered 'breathing' patches out of the marketing hero (public/media/landing/hero-wide.webp).

Each patch is the painting's own pixels (so a late-loading patch never pops) with a soft alpha edge, sized for the
game's title where the painting is drawn ~0.59x (the stage is 1280x720). The title moves each patch a few pixels on the
compositor: the heroes hover, Baron swells in his cloud, Sensei breathes.

    python3 docs/title-design/hero-poster/make/patches.py      (writes docs/title-design/hero-poster/patch-*.webp)
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
ROOT = HERE.parent.parent.parent
art = Image.open(ROOT / "public/media/landing/hero-wide.webp").convert("RGBA")
W, H = art.size  # 2400 x 1340

PATCHES = {
    # Kai and Suki leaping (one patch: Suki's buns tuck under Kai's feet)
    "heroes": [(972, 640), (1030, 575), (1110, 548), (1215, 560), (1320, 600), (1360, 680), (1360, 735), (1440, 735), (1510, 790),
               (1520, 880), (1500, 960), (1470, 1040), (1430, 1098), (1345, 1100), (1300, 1050), (1270, 985), (1190, 985),
               (1135, 1012), (1070, 1004), (1030, 915), (990, 820), (962, 720)],
    # Baron Muddle and the heart of his storm cloud
    "baron": [(1850, -10), (2410, -10), (2410, 560), (2260, 590), (2080, 560), (1930, 500), (1860, 380), (1840, 200)],
    # Sensei Maple (feet at y 1225)
    "sensei": [(2010, 960), (2040, 870), (2110, 830), (2200, 832), (2275, 880), (2330, 960), (2370, 1050), (2380, 1160),
               (2350, 1245), (2040, 1250), (2012, 1160)],
}
FEATHER = {"heroes": 14, "baron": 22, "sensei": 12}

check = art.convert("RGB").copy()
cd = ImageDraw.Draw(check)
for name, poly in PATCHES.items():
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(FEATHER[name]))
    box = m.getbbox()
    out = art.copy()
    out.putalpha(m)
    out = out.crop(box)
    out.save(HERE / f"patch-{name}.webp", quality=86, method=6)
    cd.polygon(poly, outline=(255, 0, 255), width=4)
    print(name, "box", box, "size", out.size, (HERE / f"patch-{name}.webp").stat().st_size // 1024, "KB")
check.resize((W // 2, H // 2)).save(ROOT / "playtest/runs/title-design/hero-poster/patch-check.jpg", quality=85)
