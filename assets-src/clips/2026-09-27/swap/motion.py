# Per-frame motion in a master between two times, full frame and by region (mean grey difference from the frame
# before, at 1/4 size): tells a still moment (nothing animating) from a frozen one.
#   python3 assets-src/clips/2026-09-27/swap/motion.py <master.mp4> <from> <to>
import subprocess, sys
f, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
W, H = 480, 270
d = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", f, "-ss", str(a), "-t", str(b - a), "-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
px = W * H; fr = [d[i:i + px] for i in range(0, len(d) - px + 1, px)]
regions = {"all": (0, 0, W, H), "ninja": (0, 120, 160, 150), "sensei": (400, 200, 80, 70), "baron": (380, 0, 100, 100), "word": (140, 90, 200, 70)}
def diff(p, q, r):
    x0, y0, w, h = r; s = 0
    for y in range(y0, y0 + h):
        o = y * W
        for x in range(x0 + o, x0 + o + w): s += abs(p[x] - q[x])
    return s / (w * h)
for k in range(1, len(fr)):
    print(f"{a + k / 30:.3f} " + " ".join(f"{n}:{diff(fr[k], fr[k - 1], r):.2f}" for n, r in regions.items()))
