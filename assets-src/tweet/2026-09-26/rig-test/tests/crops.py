# Same moment from each comparison master, scaled to 1920x1080, cropped 1:1 (a 2x2 grid per crop, labelled).
import json, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
D = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/tweet/2026-09-26/rig-test/compare/"
names = ["cdp-1080", "cdp-720", "pw-1080", "pw-720"]
at = float(sys.argv[1]) if len(sys.argv) > 1 else 3.0
frames = {}
for n in names:
    tl = json.load(open(D + n + ".timeline.json"))
    # the moment: the first speech line after the game starts, `at` s in
    sp = [e for e in tl["events"] if e["kind"] == "speech"]
    t = (sp[0]["t"] if sp else tl["game"]["start"]) + at
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(t), "-i", D + n + ".master.mp4", "-frames:v", "1",
                          "-vf", "scale=1920:1080:flags=lanczos,format=rgb24", "-f", "rawvideo", "-"], capture_output=True).stdout
    frames[n] = Image.frombytes("RGB", (1920, 1080), raw)
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
crops = {"caption": (1380, 640, 1920, 1080), "ninja": (120, 520, 660, 960), "tiles": (560, 860, 1100, 1060)}
for cname, box in crops.items():
    w, h = box[2] - box[0], box[3] - box[1]
    sheet = Image.new("RGB", (2 * w, 2 * h), (0, 0, 0))
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(names):
        x, y = (i % 2) * w, (i // 2) * h
        sheet.paste(frames[n].crop(box), (x, y))
        d.rectangle((x, y, x + 170, y + 30), fill=(0, 0, 0))
        d.text((x + 6, y + 3), n, fill=(255, 255, 0), font=font)
    sheet.save(D + f"crop-{cname}.png")
    print(D + f"crop-{cname}.png")
