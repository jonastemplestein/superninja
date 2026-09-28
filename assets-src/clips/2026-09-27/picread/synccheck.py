#!/usr/bin/env python3
"""An in-picture A/V check on a take: for each tap on a sound dot or a card, when does the tapped thing change on screen
(the first frame after the tap whose pixels in the tapped rect change clearly) and when does the sound it says start
(its speech event on the master clock, which is where the soundtrack puts it)? The difference should be steady and small
(the game lights the dot and starts the sound in the same moment). The tap's own time on the master's sound clock is exact
(the page logs it in the same handler that draws the ripple), so the gap between it and the ripple's first frame is how
far the soundtrack sits from the picture at that moment.

  python3 assets-src/clips/2026-09-27/picread/synccheck.py <take>"""
import json, math, os, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__))
take = sys.argv[1]
d = json.load(open(os.path.join(here, "raw", f"{take}.timeline.json")))
master = os.path.join(here, "raw", f"{take}.master.mp4")
ev = d["events"]
S = 1.5  # CSS px → device px
offs = []
for i, e in enumerate(ev):
    if e["kind"] != "tap" or not (e.get("text") or "").startswith("rect"):
        continue
    x, y, w, h = [int(v) for v in e["text"][5:].split(",")]
    sp = next((s for s in ev[i:] if s["kind"] == "speech" and s["t"] >= e["t"] - 0.1), None)
    t0 = e["t"] - 0.25
    # (the tap ripple's first frame covers ~16 CSS px round the tapped element's middle: look only there, where a card's
    # glow ring or a dot's pulse doesn't reach)
    X, Y, W, H = int((x + w / 2) * S) - 15, int((y + h / 2) * S) - 15, 30, 30
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{max(0, t0):.3f}", "-i", master, "-t", "0.8",
                        "-vf", f"crop={W}:{H}:{X}:{Y},scale=16:16,format=rgb24", "-f", "rawvideo", "-"], capture_output=True)
    px = 16 * 16 * 3
    fr = [r.stdout[k:k + px] for k in range(0, len(r.stdout) - px + 1, px)]
    base = fr[0]
    change = None
    for k, f in enumerate(fr):
        diff = sum(abs(a - b) for a, b in zip(f, base)) / px
        if diff > 10:
            # (an accurate seek starts at the first frame at or after t0; frames sit on k/30 s)
            change = round(math.ceil(max(0, t0) * 30 - 1e-6) / 30 + k / 30, 3)
            break
    if change is None or not sp:
        print(f"{e['t']:7.2f} tap {e['id']:8} no change seen" if change is None else "")
        continue
    print(f"{e['t']:7.2f} tap {e['id']:8} ripple shows {change:7.3f}  tap on the sound clock − ripple {1000 * (e['t'] - change):+5.0f} ms  (then {sp['id']} at {sp['t']:7.3f})")
    offs.append(e["t"] - change)
if offs:
    offs.sort()
    print(f"median (tap on the sound clock − ripple): {1000 * offs[len(offs) // 2]:+.0f} ms over {len(offs)} taps; ~0 is in sync (the rig's shift includes the"
          " average wait for the next 1/30 s frame), positive: the sound is late by about that much")
