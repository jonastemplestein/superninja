# Paste only the mouth area of each generated viseme frame onto the base face (so eyes/fur never flicker).
# Aligns each frame to the base (small translation search), finds the changed region around the mouth,
# feathers it, and writes public/a/i/<char>_mouth_<viseme>.webp (256 px).
import glob, numpy as np
from PIL import Image, ImageFilter
def on_white(im):
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255)); bg.alpha_composite(im); return np.asarray(bg.convert("RGB"), dtype=np.float32)
REGION = {"sensei": (.5, .9, .28, .72), "baron": (.3, .6, .3, .82)}  # mouth box (y0, y1, x0, x1) as fractions
for char in ("sensei", "baron"):
    base = Image.open(f"assets-src/faces/{char}_idle.png").convert("RGBA")
    W, H = base.size
    B = on_white(base)
    for f in sorted(glob.glob(f"assets-src/faces/{char}_v_*.png")):
        v = f.split("_v_")[-1][:-4]
        var = Image.open(f).convert("RGBA").resize((W, H), Image.LANCZOS)
        # align using the upper face (eyes) region
        best, bd = (0, 0), 1e18
        V0 = on_white(var)
        ys, ye = (int(H * .25), int(H * .55)) if char == "sensei" else (int(H * .05), int(H * .3))
        for dx in range(-16, 17, 2):
            for dy in range(-16, 17, 2):
                sh = np.roll(np.roll(V0, dy, 0), dx, 1)
                d = np.abs(sh[ys:ye, int(W*.2):int(W*.8)] - B[ys:ye, int(W*.2):int(W*.8)]).mean()
                if d < bd: bd, best = d, (dx, dy)
        var = Image.fromarray(np.roll(np.roll(np.asarray(var), best[1], 0), best[0], 1))
        V = on_white(var)
        diff = np.abs(V - B).mean(axis=2)
        mask = np.zeros((H, W), np.float32)
        ry0, ry1, rx0, rx1 = REGION[char]
        y0, y1, x0, x1 = int(H * ry0), int(H * ry1), int(W * rx0), int(W * rx1)
        mask[y0:y1, x0:x1] = (diff[y0:y1, x0:x1] > 22).astype(np.float32)
        m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(7))
        out = base.copy()
        out.paste(var, (0, 0), m)
        out.putalpha(base.split()[3])
        out.resize((256, 256), Image.LANCZOS).save(f"public/a/i/{char}_mouth_{v}.webp", "WEBP", quality=88)
        print(char, v, "shift", best, "err", round(bd, 1))
    base.resize((256, 256), Image.LANCZOS).save(f"public/a/i/{char}_mouth_base.webp", "WEBP", quality=88)
