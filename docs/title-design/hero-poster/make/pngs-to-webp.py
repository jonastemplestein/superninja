"""Turn the rendered PNGs (make/logo.ts) into .webp, keeping alpha, and move the PNGs to the repo's .trash/ (never rm).

    python3 docs/title-design/hero-poster/make/pngs-to-webp.py
"""
from PIL import Image
from pathlib import Path
import shutil, time

HERE = Path(__file__).resolve().parent.parent
ROOT = HERE.parent.parent.parent
trash = ROOT / ".trash" / f"title-hero-poster-{int(time.time())}"


def done(png: Path, name: str):
    print(" ->", f"{name}.webp", (HERE / f"{name}.webp").stat().st_size // 1024, "KB")
    trash.mkdir(parents=True, exist_ok=True)
    shutil.move(str(png), str(trash / png.name))


# the lockup and its glint mask are cropped to the lockup's own box, so the mask lines up with it exactly
if (HERE / "logo.png").exists():
    crop = Image.open(HERE / "logo.png").getbbox()
    for name, q in [("logo", 88), ("logo-fill", 70)]:
        png = HERE / f"{name}.png"
        im = Image.open(png).convert("RGBA").crop(crop)
        print(name, im.size, "box", crop)
        if name == "logo-fill":  # the mask only needs alpha: store it white
            white = Image.new("RGBA", im.size, (255, 255, 255, 0))
            white.putalpha(im.getchannel("A"))
            im = white
        im.save(HERE / f"{name}.webp", quality=q, method=6)
        done(png, name)

# Play's word, cropped to its own box
png = HERE / "play-word.png"
if png.exists():
    im = Image.open(png).convert("RGBA")
    im = im.crop(im.getbbox())
    print("play-word", im.size)
    im.save(HERE / "play-word.webp", quality=90, method=6)
    done(png, "play-word")
