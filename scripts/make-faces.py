# Centred face portraits for the Help button: find the head in each Sensei sprite (the widest blob in the
# top part of the silhouette, excluding the staff) and crop a square around it.
# Usage: uv run --with pillow --with numpy python scripts/make-faces.py
import numpy as np
from PIL import Image
CHARS = [("sensei", ("idle", "talk", "cheer")), ("baron", ("idle",))]
for pose in ("idle", "talk", "cheer"):
    src = f"assets-src/cut/sensei_{pose}.png"
    im = Image.open(src).convert("RGBA")
    a = np.array(im)[:, :, 3] > 60
    ys, xs = np.nonzero(a)
    top, bot = ys.min(), ys.max()
    h = bot - top
    # head region: top 42% of the character
    band = a[top: top + int(h * 0.42)]
    cols = band.sum(axis=0)
    # ignore thin vertical things (staff, ears tips): keep columns with substantial coverage
    solid = np.nonzero(cols > cols.max() * 0.35)[0]
    cx = int((solid.min() + solid.max()) / 2)
    head_w = solid.max() - solid.min()
    rows = np.nonzero(a[:, solid.min():solid.max()].sum(axis=1) > 0)[0]
    head_top = rows.min()
    size = int(head_w * 1.12)
    cy = head_top + int(size * 0.5)
    box = (cx - size // 2, cy - size // 2, cx + size // 2, cy + size // 2)
    face = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    face.paste(im.crop(box), (0, 0))
    face = face.resize((256, 256), Image.LANCZOS)
    face.save(f"public/a/i/sensei_face_{pose}.webp", "WEBP", quality=88)
    face.resize((512, 512), Image.LANCZOS) if False else None
    big = Image.new("RGBA", (size, size), (0, 0, 0, 0)); big.paste(im.crop(box), (0, 0))
    import os; os.makedirs("assets-src/faces", exist_ok=True)
    big.resize((768, 768), Image.LANCZOS).save(f"assets-src/faces/sensei_{pose}.png")
    print(pose, "head_w", head_w, "box", box)

# Baron face (for his talking portrait)
im = Image.open("assets-src/cut/baron_idle.png").convert("RGBA")
a = np.array(im)[:, :, 3] > 60
ys, xs = np.nonzero(a); top, bot = ys.min(), ys.max(); h = bot - top
band = a[top: top + int(h * 0.45)]
cols = band.sum(axis=0); solid = np.nonzero(cols > cols.max() * 0.45)[0]
cx = int((solid.min() + solid.max()) / 2); head_w = solid.max() - solid.min()
size = int(head_w * 1.25); cy = top + int(size * 0.5)
box = (cx - size // 2, cy - size // 2, cx + size // 2, cy + size // 2)
big = Image.new("RGBA", (size, size), (0, 0, 0, 0)); big.paste(im.crop(box), (0, 0))
big.resize((768, 768), Image.LANCZOS).save("assets-src/faces/baron_idle.png")
big.resize((256, 256), Image.LANCZOS).save("public/a/i/baron_face_idle.webp", "WEBP", quality=88)
print("baron", box)
