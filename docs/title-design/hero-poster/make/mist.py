"""A seamless strip of soft morning mist (cream, alpha only) that the title slides slowly across the bottom of the
painting, in front of the hills and the World Flower's roots and behind the words: cheap depth that never repaints.

    python3 docs/title-design/hero-poster/make/mist.py      (writes docs/title-design/hero-poster/mist.webp)
"""
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent.parent
W, H = 1600, 220
random.seed(7)
a = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(a)
for _ in range(90):
    w = random.randint(140, 420)
    h = random.randint(50, 120)
    x = random.randint(0, W)
    y = random.randint(int(H * 0.25), H - 20)
    v = random.randint(40, 110)
    # draw at x and x - W so the strip tiles left to right without a seam
    for dx in (0, -W, W):
        d.ellipse([x + dx - w // 2, y - h // 2, x + dx + w // 2, y + h // 2], fill=v)
a = a.filter(ImageFilter.GaussianBlur(26))
# fade out towards the top so it sits on the ground
fade = Image.linear_gradient("L").resize((W, H))  # 0 at top -> 255 at bottom
a = Image.composite(a, Image.new("L", (W, H), 0), fade.point(lambda v: min(255, int(v * 1.6))))
img = Image.new("RGBA", (W, H), (255, 247, 232, 0))
img.putalpha(a)
img.save(HERE / "mist.webp", quality=80, method=6)
print("mist.webp", (HERE / "mist.webp").stat().st_size // 1024, "KB")
