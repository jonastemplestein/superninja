# Motion moment (the streak power-up), 2x zoom on the ninja: compression under motion.
import json, subprocess
from PIL import Image, ImageDraw, ImageFont
D = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/tweet/2026-09-26/rig-test/compare/"
names = ["cdp-1080", "cdp-720", "pw-1080", "pw-720"]
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
box = (150, 560, 510, 830)  # 360x270 → 2x = 720x540
w, h = (box[2] - box[0]) * 2, (box[3] - box[1]) * 2
sheet = Image.new("RGB", (2 * w, 2 * h)); d = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    tl = json.load(open(D + n + ".timeline.json"))
    t = [e for e in tl["events"] if e["id"] == "powerup"][0]["t"] + 0.2
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(t), "-i", D + n + ".master.mp4", "-frames:v", "1",
                          "-vf", "scale=1920:1080:flags=lanczos,format=rgb24", "-f", "rawvideo", "-"], capture_output=True).stdout
    im = Image.frombytes("RGB", (1920, 1080), raw).crop(box).resize((w, h), Image.NEAREST)
    x, y = (i % 2) * w, (i // 2) * h
    sheet.paste(im, (x, y)); d.rectangle((x, y, x + 170, y + 30), fill=(0, 0, 0)); d.text((x + 6, y + 3), n, fill=(255, 255, 0), font=font)
sheet.save(D + "crop-motion-2x.png"); print(D + "crop-motion-2x.png")
