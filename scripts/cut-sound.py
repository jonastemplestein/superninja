# Cut one pure sound out of a carrier word said by the teacher voice (scripts/gen-pure-sounds.ts).
# TTS can't say some sounds on their own without a letter name or an added vowel (b → "bee", x → "ex",
# w → "woo", y → "yee"), but it says them perfectly inside words. So: say the word, then keep only the sound.
#
# Usage: python scripts/cut-sound.py <in.mp3|wav> <out.wav> <mode> [ms]
#   onset    ms   keep the first <ms> of the word, from its first audible frame (b in "bat", w in "wet", y in "yes")
#   glide    ms   like onset, but fade out over the second half, so the glide dies away before any vowel shows
#   burst    ms   like onset, but start at the loudest rise in the first 150 ms (a stop's release), keep <ms> after it
#   unvoiced      keep the word's unvoiced start, up to where voicing begins (k in "cat", th in "thin")
#   coda          keep the word's unvoiced end, from where voicing stops (ks in "box")
#   vowel         keep from the start until the level drops for a closure (i in "it")
#   tail          keep the word's end, from where its vowel dies away (a released b at the end of "tub")
#   wcut     r    keep a /w/ up to where its vowel starts: the upper formants (1.4–3 kHz against 0.1–1 kHz) pass ratio
#                 r as the lips unround into a front vowel ("win")
#   ycut     r    keep a /j/ up to where its vowel starts: the first formant climbs (0.55–1.1 kHz against 0.15–0.45 kHz)
#                 past ratio r as the tongue drops into an open vowel ("yak")
# Voicing is a normalised autocorrelation in the 80–400 Hz pitch range. The cut gets a short fade and 40 ms of silence
# on both sides, so finishAudio's 25 ms fades land on silence, not on the sound.
import sys, subprocess, io, wave
import numpy as np

src, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]
ms = float(sys.argv[4]) if len(sys.argv) > 4 else 0
sr = 24000
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
hop, win = int(0.005 * sr), int(0.03 * sr)
frames = range(0, max(1, len(x) - win), hop)
rms = np.array([np.sqrt(np.mean(x[i:i + win] ** 2)) for i in frames])
peak = rms.max() + 1e-9


def voiced(i: int) -> bool:
    fr = x[i:i + win] - np.mean(x[i:i + win])
    if np.sqrt(np.mean(fr ** 2)) < 0.02 * peak * 3:
        return False
    ac = np.correlate(fr, fr, "full")[win - 1:]
    lo, hi = sr // 400, sr // 80
    return ac[0] > 0 and ac[lo:hi].max() / ac[0] > 0.55


vo = np.array([voiced(i) for i in frames])
start = int(np.argmax(rms > 0.03 * peak))  # first audible frame
end = len(rms) - 1 - int(np.argmax(rms[::-1] > 0.03 * peak))

if mode in ("onset", "glide"):
    a = max(0, start * hop - int(0.01 * sr))
    b = start * hop + int(ms / 1000 * sr)
elif mode == "burst":
    look = rms[start:start + int(0.15 * sr / hop)]
    rise = np.diff(look, prepend=look[0])
    k = start + int(np.argmax(rise))
    a = max(0, (k - 2) * hop)
    b = k * hop + int(ms / 1000 * sr)
elif mode == "unvoiced":
    v = start
    while v < len(vo) and not vo[v]:
        v += 1
    a, b = start * hop, max(start * hop + hop, v * hop)
elif mode == "coda":
    v = end
    while v > start and not vo[v]:
        v -= 1
    a, b = (v + 2) * hop + win // 2, end * hop + win
elif mode == "vowel":
    k = start + int(np.argmax(rms[start:]))
    v = k
    while v < len(rms) and rms[v] > 0.25 * peak:
        v += 1
    a, b = start * hop, v * hop
elif mode in ("wcut", "ycut"):
    spec_hop, n_fft = int(0.01 * sr), 1024
    freqs = np.fft.rfftfreq(n_fft, 1 / sr)
    def band(fr, lo, hi):
        return fr[(freqs >= lo) & (freqs < hi)].sum() + 1e-9
    ratios = []
    for i in range(start * hop, min(len(x) - n_fft, start * hop + int(0.6 * sr)), spec_hop):
        fr = np.abs(np.fft.rfft(x[i:i + n_fft] * np.hanning(n_fft))) ** 2
        ratios.append(band(fr, 1400, 3000) / band(fr, 100, 1000) if mode == "wcut" else band(fr, 550, 1100) / band(fr, 150, 450))
    ratios = np.convolve(np.array(ratios), np.ones(3) / 3, mode="same")
    # the vowel has arrived once the band ratio passes `ms` (an absolute ratio: the glide itself is near 0), at least
    # 60 ms in (the onset's first frames are noise)
    level = ms if ms else (0.1 if mode == "wcut" else 0.6)
    k = 6
    while k < len(ratios) and ratios[k] < level:
        k += 1
    a, b = max(0, start * hop - int(0.01 * sr)), start * hop + max(k - 1, 4) * spec_hop
elif mode == "tail":
    k = int(np.argmax(rms))
    v = k
    while v < len(rms) and rms[v] > 0.12 * peak:
        v += 1
    a, b = v * hop, end * hop + win
else:
    raise SystemExit("unknown mode " + mode)

seg = x[a:b].copy()
n = len(seg)
if n < int(0.01 * sr):
    raise SystemExit(f"cut too short ({n / sr:.3f} s)")
fade_out = n // 2 if mode == "glide" else min(n // 3, int(0.03 * sr))
if mode in ("wcut", "ycut"):
    fade_out = min(n // 3, int(0.045 * sr))
seg[-fade_out:] *= np.linspace(1, 0, fade_out) ** (2 if mode == "glide" else 1)
fade_in = min(n // 6, int(0.004 * sr))
if fade_in:
    seg[:fade_in] *= np.linspace(0, 1, fade_in)
pad = np.zeros(int(0.04 * sr), dtype=np.float32)
seg = np.concatenate([pad, seg, pad])
buf = io.BytesIO()
with wave.open(out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((np.clip(seg, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"{out} {n / sr:.3f}s")
