# Repeated frames in a stretch of a video, counted exactly: a frame where fewer than 20 pixels of a 480×270 grey copy
# changed by more than 6 levels from the frame before (the 30 fps rebuild repeating a slot, or a frozen picture). Unlike
# a mean difference this can't mistake a quiet moment (a breathing sprite still changes hundreds of pixels) for a
# repeat. Prints each repeat, with how much the picture moved just before and after it (a repeat in the middle of a
# shake or a lunge is a visible judder; one in a still moment is invisible).
#   python3 assets-src/clips/2026-09-27/battle/repeats.py <file.mp4> [start] [end]
import subprocess, sys
f = sys.argv[1]
a = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
b = float(sys.argv[3]) if len(sys.argv) > 3 else None
W, H = 480, 270
cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(a), "-i", f] + (["-t", str(b - a)] if b else []) + ["-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"]
d = subprocess.run(cmd, capture_output=True).stdout
n = len(d) // (W * H)
changed, mean = [], []
prev = d[0:W * H]
for k in range(1, n):
    cur = d[k * W * H:(k + 1) * W * H]
    c = 0; s = 0
    for i in range(0, W * H):
        x = cur[i] - prev[i]
        if x < 0: x = -x
        s += x
        if x > 6: c += 1
    changed.append(c); mean.append(s / (W * H)); prev = cur
reps = [k for k, c in enumerate(changed) if c < 20]
moving = lambda k: max([mean[j] for j in (k - 1, k + 1) if 0 <= j < len(mean)] or [0])
vis = [k for k in reps if moving(k) > 1.0]
print(f"{f.split('/')[-1]} [{a}–{b}]: {n} frames; repeats {len(reps)}, of them amid motion (neighbour mean diff > 1) {len(vis)}")
for k in reps: print(f"  {a + (k + 1) / 30:.3f} s  pixels changed {changed[k]}  motion around {moving(k):.2f}")
