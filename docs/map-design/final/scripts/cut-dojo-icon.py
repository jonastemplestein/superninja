# Cut the chosen dojo take out the way scripts/post-art.py cuts the game's items: rembg isnet-anime, drop faint alpha
# noise, trim to the content with a 6 px margin, 320 px wide, WebP quality 86. Writes public/a/i/item_dojo.webp.
#   uv run --with 'rembg[cpu]' --with pillow python docs/map-design/final/scripts/cut-dojo-icon.py assets-src/art/item_dojo.take1.png
import sys
from PIL import Image
from rembg import new_session, remove

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "public/a/i/item_dojo.webp"
im = remove(Image.open(src).convert("RGBA"), session=new_session("isnet-anime"), post_process_mask=True)
im.save("assets-src/cut/item_dojo.png")
a = im.split()[3].point(lambda v: 0 if v < 12 else v)
im.putalpha(a)
l, t, r, b = a.getbbox()
pad = 6
im = im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))
w = 320
if im.width > w:
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
im.save(out, "WEBP", quality=86, method=6)
print("wrote", out, im.size)
