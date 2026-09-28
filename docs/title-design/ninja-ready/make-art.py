# Makes the "ninja-ready" mockup's art variants from the game's own paintings (nothing new is painted):
#   art/dusk-2400.webp, art/dusk-1600.webp  world_flower_bg (the World Flower's meadow) widened to 2.1:1 and graded to dusk
#   art/badge-kai.webp, art/badge-suki.webp  head crops of the idle poses, for the profile badges
# Run: uv run --with numpy --with pillow python docs/title-design/ninja-ready/make-art.py
import numpy as np
from PIL import Image, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / "art"
OUT.mkdir(exist_ok=True)

src = Image.open(ROOT / "public/a/i/world_flower_bg.webp").convert("RGB")
W, H = src.size  # 1920x1072

# 1. widen to 2.1:1: mirror the bamboo edges outwards and cross-fade the seam
ext = int(round((H * 2.1 - W) / 2))  # ~166 px each side
a = np.asarray(src).astype(np.float32) / 255
left = a[:, :ext][:, ::-1]
right = a[:, -ext:][:, ::-1]
wide = np.concatenate([left, a, right], axis=1)
# soften the mirrored strips a touch (they are only ever seen in the side bleed)
img = Image.fromarray((wide * 255).astype(np.uint8))
blur = np.asarray(img.filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
ramp = np.zeros(wide.shape[1], np.float32)
ramp[:ext] = np.linspace(1, 0, ext)
ramp[-ext:] = np.linspace(0, 1, ext)
wide = wide * (1 - ramp[None, :, None] * 0.6) + blur * (ramp[None, :, None] * 0.6)
h, w = wide.shape[:2]
yy = (np.arange(h, dtype=np.float32) / (h - 1))[:, None]
xx = (np.arange(w, dtype=np.float32) / (w - 1))[None, :]

# 2. dusk grade: a vertical multiply ramp (violet sky -> rose -> gold horizon -> warm meadow -> dusky foreground)
stops = [
    (0.00, (0.74, 0.60, 0.96)),
    (0.22, (1.00, 0.70, 0.84)),
    (0.40, (1.06, 0.80, 0.70)),
    (0.49, (1.10, 0.93, 0.74)),
    (0.56, (1.00, 0.98, 0.82)),
    (0.78, (0.96, 0.94, 0.84)),
    (1.00, (0.80, 0.72, 0.80)),
]
ys = np.array([s[0] for s in stops], np.float32)
ramp_rgb = np.stack([np.interp(yy[:, 0], ys, [s[1][c] for s in stops]) for c in range(3)], axis=-1)[:, None, :]
g = wide * ramp_rgb
# a warm glow behind where the World Flower stands (screen blend), and a soft sunset band on the horizon
cx, cy = 0.60, 0.36
d = np.sqrt(((xx - cx) * 2.1) ** 2 + (yy - cy) ** 2)
glow = np.clip(1 - d / 0.62, 0, 1) ** 2.2
glow_col = np.array([1.0, 0.86, 0.55], np.float32)
g = 1 - (1 - g) * (1 - glow[..., None] * glow_col * 0.55)
band = np.exp(-(((yy - 0.47) / 0.07) ** 2)) * np.ones_like(xx)
g = 1 - (1 - g) * (1 - band[..., None] * np.array([1.0, 0.72, 0.5], np.float32) * 0.22)
# vignette only at the very edges (not the old 35 % ink)
vx = np.clip(np.abs(xx - 0.5) * 2, 0, 1) ** 3
vy = np.clip(yy - 0.75, 0, 1) / 0.25
vig = 1 - 0.14 * vx - 0.12 * vy ** 2
g = g * vig[..., None]
g = np.clip(g, 0, 1)
dusk = Image.fromarray((g * 255).astype(np.uint8))
for tw in (2400, 1600):
    th = round(tw / w * h)
    dusk.resize((tw, th), Image.LANCZOS).save(OUT / f"dusk-{tw}.webp", quality=82, method=6)
print("dusk", w, h, "mean luma", float((g @ np.array([0.299, 0.587, 0.114], np.float32)).mean() * 255))

# 3. badge heads (square, transparent), cropped from the idle poses
for hero, box in {"kai": (190, 20, 600, 430), "suki": (170, 10, 630, 470)}.items():
    im = Image.open(ROOT / f"public/a/i/hero_{hero}_idle.webp").convert("RGBA").crop(box)
    im.resize((192, 192), Image.LANCZOS).save(OUT / f"badge-{hero}.webp", quality=88, method=6)
