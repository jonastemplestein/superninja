# Stutter check on a stretch of a video: the difference between each frame and the one before (a 160×90 grey copy),
# and the runs of frames where nothing moved at all (in a battle something always moves: the ninja breathes, the monster
# bobs, the streak flames flicker), so a run of 3+ identical frames (100 ms) is a freeze the eye can catch.
# (After ../soundhunt/stutter.py, with a window.)
#   python3 assets-src/clips/2026-09-27/battle/stutter.py <file.mp4> [start] [end] [threshold=0.08]
import subprocess, sys
f = sys.argv[1]
a = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
b = float(sys.argv[3]) if len(sys.argv) > 3 else None
th = float(sys.argv[4]) if len(sys.argv) > 4 else 0.08
W, H = 160, 90
cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(a), "-i", f] + (["-t", str(b - a)] if b else []) + ["-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"]
d = subprocess.run(cmd, capture_output=True).stdout
n = len(d) // (W * H)
diffs = []
for k in range(1, n):
    x = d[(k - 1) * W * H:k * W * H]; y = d[k * W * H:(k + 1) * W * H]
    diffs.append(sum(abs(x[i] - y[i]) for i in range(0, W * H)) / (W * H))
runs, cur = [], 0
for k, x in enumerate(diffs):
    if x < th: cur += 1
    else:
        if cur >= 1: runs.append((k - cur + 1, cur))
        cur = 0
if cur >= 1: runs.append((len(diffs) - cur + 1, cur))
s = sorted(diffs)
print(f"{f.split('/')[-1]} [{a}–{b}]: {n} frames; diff p5 {s[len(s)//20]:.3f} p50 {s[len(s)//2]:.3f}; still frames (<{th}) {sum(1 for x in diffs if x < th)}; runs of 3+ identical: {sum(1 for r in runs if r[1] >= 2)}")
for (k, c) in runs:
    if c >= 2: print(f"  {c + 1} identical frames from {a + k / 30:.2f} s ({c * 1000 / 30:.0f} ms frozen)")
