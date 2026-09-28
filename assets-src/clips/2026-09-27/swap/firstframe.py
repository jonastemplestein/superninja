# Which master frame is a final's first (and last) frame? Mean grey difference against master frames near the cut.
#   python3 assets-src/clips/2026-09-27/swap/firstframe.py <final.mp4> <master.mp4> <start> <end>
import subprocess, sys
fin, mas, s, e = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
def frames(f, ss=None, n=1, last=False):
    args = ["ffmpeg", "-hide_banner", "-loglevel", "error"] + (["-sseof", "-0.2"] if last else []) + ["-i", f] + (["-ss", str(ss)] if ss is not None else []) + ["-frames:v", str(n) if not last else "100", "-vf", "scale=160:90,format=gray", "-f", "rawvideo", "-"]
    d = subprocess.run(args, capture_output=True).stdout; px = 160 * 90
    return [d[i:i + px] for i in range(0, len(d) - px + 1, px)]
diff = lambda a, b: sum(abs(x - y) for x, y in zip(a, b)) / len(a)
first = frames(fin)[0]; last = frames(fin, last=True)[-1]
for label, fr, t0 in (("first", first, s), ("last", last, e - 1 / 30)):
    cands = frames(mas, round((t0 - 3 / 30) * 30) / 30, 7)
    print(label, " ".join(f"{round((t0 - 3 / 30) * 30) / 30 + k / 30:.3f}:{diff(fr, c):.2f}" for k, c in enumerate(cands)))
