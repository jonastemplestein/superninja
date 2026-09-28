# RMS (dBFS) of a video's sound in 20 ms steps over [from, to]: to see where a voice ends against a cut or a fade.
#   python3 assets-src/clips/2026-09-27/gemtrial/envelope.py <file> <from> <to>
import math, struct, subprocess, sys
f, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", f, "-ss", str(a), "-t", str(b - a), "-vn", "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = struct.unpack(f"<{len(raw) // 4}f", raw)
step = 960
for k in range(0, len(x) - step + 1, step):
    s = sum(v * v for v in x[k:k + step]) / step
    print(f"{a + k / 48000:.3f}  {10 * math.log10(s) if s > 0 else -120:.1f} dB")
