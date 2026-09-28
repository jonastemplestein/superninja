# Stutter check on a finished clip: the difference between each frame and the one before (a 160×90 grey copy), and
# the runs of frames where nothing moved at all (the game always has something moving: the ninja breathes, the lanterns
# glow), so a run of 3+ repeated frames (100 ms) is a freeze the eye can catch.
#   python3 assets-src/clips/2026-09-27/soundhunt/stutter.py <clip.mp4> [threshold=0.08]
import subprocess, sys
f = sys.argv[1]; th = float(sys.argv[2]) if len(sys.argv) > 2 else 0.08
W, H = 160, 90
d = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", f, "-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
n = len(d) // (W * H)
diffs = []
for k in range(1, n):
    a = d[(k - 1) * W * H:k * W * H]; b = d[k * W * H:(k + 1) * W * H]
    diffs.append(sum(abs(a[i] - b[i]) for i in range(0, W * H)) / (W * H))
runs, cur = [], 0
for k, x in enumerate(diffs):
    if x < th: cur += 1
    else:
        if cur >= 2: runs.append((k - cur + 1, cur))
        cur = 0
if cur >= 2: runs.append((len(diffs) - cur + 1, cur))
s = sorted(diffs)
print(f"{f.split('/')[-1]}: {n} frames; diff p5 {s[len(s)//20]:.3f} p50 {s[len(s)//2]:.3f}; still frames (<{th}) {sum(1 for x in diffs if x < th)}")
for (k, c) in runs: print(f"  {c + 1} identical frames from {k / 30:.2f} s ({(c) * 1000 / 30:.0f} ms frozen)")
