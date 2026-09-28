# RMS envelope (dBFS) of a master's sound between two times, in 20 ms steps, to find quiet cut points:
#   python3 assets-src/clips/2026-09-27/swap/env.py <master.wav|mp4> <from> <to> [step_ms=20]
import subprocess, sys, struct, math
f, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]); step = float(sys.argv[4]) / 1000 if len(sys.argv) > 4 else 0.02
d = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", f, "-ss", str(a), "-t", str(b - a), "-vn", "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], capture_output=True).stdout
x = struct.unpack(f"<{len(d)//4}f", d); n = int(48000 * step)
print(" ".join(f"{a + k / 48000:.2f}:{20 * math.log10(math.sqrt(sum(v * v for v in x[k:k + n]) / n) or 1e-9):.0f}" for k in range(0, len(x) - n + 1, n)))
