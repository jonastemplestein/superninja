# Cut out and export the thumbs-up ninja (playtest/confirm/gen-thumbs.ts) the way scripts/post-art.py does sprites:
# rembg isnet-anime, trim, webp. Usage: uv run --with 'rembg[cpu]' --with pillow python playtest/confirm/cut-thumbs.py [take]
import sys
from PIL import Image
from rembg import new_session, remove

take = sys.argv[1] if len(sys.argv) > 1 else "1"
session = new_session("isnet-anime")
for h in ("kai", "suki"):
    im = Image.open(f"playtest/confirm/art/hero_{h}_thumbsup_t{take}.png").convert("RGBA")
    cut = remove(im, session=session, post_process_mask=True)
    cut = cut.crop(cut.getbbox())
    w = 420
    cut = cut.resize((w, round(cut.height * w / cut.width)), Image.LANCZOS)
    cut.save(f"playtest/confirm/art/hero_{h}_thumbsup_cut.png")
    cut.save(f"public/a/i/hero_{h}_thumbsup.webp", "WEBP", quality=88, method=6)
    print(h, cut.size)
