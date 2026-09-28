# Mean luma per frame of a master (or clip) in [from, from+len): python3 luma.py <file> <from> <len>
import subprocess, sys
f, s, n = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
s = round(s * 30) / 30
d = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", f, "-ss", str(s), "-t", str(n), "-vf", "scale=64:36,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
px = 64 * 36
print(" ".join(f"{s + k / 30:.3f}:{sum(d[k * px:(k + 1) * px]) / px:.0f}" for k in range(len(d) // px)))
