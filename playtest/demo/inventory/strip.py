"""Frame strips for the demo inventory (docs/demo-choreography/current/).

    python3 playtest/demo/inventory/strip.py spec.json

spec.json: [{"video": ".../final.mp4", "out": "docs/.../w1-tap.jpg", "title": "...", "cols": 3,
             "cells": [{"t": 17.34, "label": "+0.00 s  the paw appears over the sun", "say": "Tap the sun!",
                        "flag": "sudden"}]}]

Each cell is the frame at t (+ 0.08 s: the screen shows a change about 50-90 ms after the code that makes it runs),
full size (844x390), with two lines under it: the time and what happens, and what Sensei is saying then (quoted).
A flag paints a red bar on the cell's top edge (sudden / the ninja acts / not announced).
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
LAT = 0.08
W, H = 694, 390  # the 16:9 stage, cropped out of the 844x390 phone screen (letterbox bars left out)
CROP = (75, 0, 769, 390)
PAD, TXT = 10, 58


def font(p, s):
    try:
        return ImageFont.truetype(p, s)
    except Exception:
        return ImageFont.load_default()


def frame(video, t, tmp):
    out = os.path.join(tmp, f"f{t:.3f}.png")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{max(0, t + LAT):.3f}", "-i", video, "-frames:v", "1", out], check=True)
    im = Image.open(out).convert("RGB")
    return im.crop(CROP) if im.size == (844, 390) else im


def wrap(d, text, f, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        nxt = (cur + " " + w).strip()
        if d.textlength(nxt, font=f) <= width:
            cur = nxt
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def build(spec):
    cells = spec["cells"]
    cols = spec.get("cols", 3)
    scale = spec.get("scale", 0.72)
    cw, ch = int(W * scale), int(H * scale)
    rows = (len(cells) + cols - 1) // cols
    head = 40 if spec.get("title") else 0
    sheet = Image.new("RGB", (cols * (cw + PAD) + PAD, head + rows * (ch + TXT + PAD) + PAD), (24, 20, 36))
    d = ImageDraw.Draw(sheet)
    fb, fr, fs = font(BOLD, 15), font(FONT, 14), font(BOLD, 20)
    if head:
        d.text((PAD, 10), spec["title"], font=fs, fill=(255, 240, 210))
    with tempfile.TemporaryDirectory() as tmp:
        for i, c in enumerate(cells):
            x = PAD + (i % cols) * (cw + PAD)
            y = head + PAD + (i // cols) * (ch + TXT + PAD)
            im = frame(spec["video"], c["t"], tmp).resize((cw, ch), Image.LANCZOS)
            sheet.paste(im, (x, y))
            if c.get("flag"):
                d.rectangle([x, y, x + cw, y + 6], fill=(235, 60, 60))
                tag = c["flag"]
                tw = d.textlength(tag, font=fb)
                d.rectangle([x + cw - tw - 12, y + 6, x + cw, y + 26], fill=(235, 60, 60))
                d.text((x + cw - tw - 6, y + 8), tag, font=fb, fill=(255, 255, 255))
            ty = y + ch + 4
            for ln in wrap(d, c.get("label", ""), fb, cw - 4)[:2]:
                d.text((x + 2, ty), ln, font=fb, fill=(255, 226, 150))
                ty += 17
            if c.get("say"):
                for ln in wrap(d, f"“{c['say']}”", fr, cw - 4)[:1]:
                    d.text((x + 2, ty), ln, font=fr, fill=(215, 215, 235))
    os.makedirs(os.path.dirname(spec["out"]), exist_ok=True)
    sheet.save(spec["out"], quality=86)
    print(spec["out"], sheet.size)


if __name__ == "__main__":
    for s in json.load(open(sys.argv[1])):
        build(s)
