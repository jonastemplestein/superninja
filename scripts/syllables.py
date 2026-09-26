# Count loudness "parts" in a short clip: a pure sound is ONE part; "eye-ee" (letter names) is two.
# A new part starts when the level drops more than 12 dB below the running peak and then recovers to within 18 dB of
# the loudest point. Prints the number of parts. Usage: python scripts/syllables.py file.mp3
import subprocess, sys
import numpy as np
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", sys.argv[1], "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(float) / 32768
w = 480  # 30 ms frames
env = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + w] ** 2)) + 1e-9) for i in range(0, max(1, len(x) - w), w)])
top = env.max()
parts, inside, low = 0, False, False
for v in env:
    if not inside and v > top - 18:
        parts += 1
        inside, low = True, False
    elif inside and v < top - 24:
        inside = False
print(parts)
