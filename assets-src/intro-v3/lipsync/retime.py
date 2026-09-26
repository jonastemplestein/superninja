# Re-time a game voice line so it matches a lip-synced video take.
# Seedance 2.5 lip-syncs Baron to our reference line but performs it with its own pacing (a slower, stompier
# "Words... words... WORDS!"). The game plays our own recording, so this warps our recording onto the take's timing:
#   1. align our line with the take's voice (Demucs vocals stem) by DTW on MFCC features (10 ms hops),
#   2. split our line into phrases at its pauses,
#   3. place each phrase where the take says it, and time-stretch it (pitch-preserving, ffmpeg atempo) to the take's
#      phrase length when they differ by more than 6 %, so the words stay under the moving mouth.
# Usage: uv run --with librosa --with soundfile python assets-src/intro-v3/lipsync/retime.py <our line.mp3> <take vocals.wav> <out.wav> [--gap=<s>] [--speech=<s>] [--tail-at=<s>]
#   --gap:    pauses at least this long split phrases (default 0.12 s; 0.04 places word by word)
#   --speech: only the first N seconds of our line are aligned by DTW (the rest, e.g. Baron's laugh, is placed as one
#             phrase at --tail-at seconds into the take, because Seedance swaps in its own laugh).
# Prints the take time of the first word (the line delay for intro_timing.json) and the phrase map.
import sys, subprocess, tempfile, os
import numpy as np
import librosa

SR = 22050
HOP = 220  # ~10 ms
args = [a for a in sys.argv[1:] if not a.startswith("--")]
flags = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--"))
line_f, take_f, out_f = args
ours, _ = librosa.load(line_f, sr=SR, mono=True)
take, _ = librosa.load(take_f, sr=SR, mono=True)
speech = float(flags.get("speech", len(ours) / SR))
tail_at = float(flags["tail-at"]) if "tail-at" in flags else None


GAP = float(flags.get("gap", 0.12))
DB = float(flags.get("db", 32))  # quieter than this many dB below the peak counts as a pause


def active(y, top_db=None):
    top_db = top_db or DB
    """Voiced intervals (s) of a clip, merged across gaps shorter than --gap (default 0.12 s)."""
    iv = librosa.effects.split(y, top_db=top_db, frame_length=1024, hop_length=HOP) / SR
    out = []
    for a, b in iv:
        if out and a - out[-1][1] < GAP:
            out[-1][1] = b
        else:
            out.append([a, b])
    return out


# 1. DTW on the speech part (the take's speech is searched as a subsequence, so its leading silence doesn't matter)
o_sp = ours[: int(speech * SR)]
t_iv = active(take)
t_sp_end = (tail_at - 0.2) if tail_at else len(take) / SR
t_sp = take[: int(t_sp_end * SR)]
feat = lambda y: librosa.feature.mfcc(y=y, sr=SR, n_mfcc=20, hop_length=HOP)
_, wp = librosa.sequence.dtw(X=feat(o_sp), Y=feat(t_sp), subseq=True, metric="cosine")
wp = wp[::-1] * HOP / SR  # (our time, take time), ascending
o2t = lambda t: float(np.interp(t, wp[:, 0], wp[:, 1]))

# 2. phrases of our line (pauses >= 0.12 s split them)
phrases = [p for p in active(o_sp) if p[1] - p[0] > 0.08]
plan = [(a, b, o2t(a), o2t(b)) for a, b in phrases]
if tail_at is not None:
    rest = [p for p in active(ours) if p[0] >= speech - 0.05]
    if rest:
        a, b = rest[0][0], rest[-1][1]
        plan.append((a, b, tail_at, tail_at + (b - a)))

# 3. render
base = plan[0][2] - 0.02  # the 20 ms pre-roll of the first phrase starts the file
tmp = tempfile.mkdtemp()
total = plan[-1][3] - base + 0.4
out = np.zeros(int(total * SR) + SR, dtype=np.float32)
print(f"{'ours':>14} -> {'take':>14}  stretch")
for i, (a, b, ta, tb) in enumerate(plan):
    pre = 0.02
    chunk = ours[int(max(0, a - pre) * SR) : int(b * SR)]
    want, have = (tb - ta) + pre, len(chunk) / SR
    ratio = have / want if want > 0 else 1
    if abs(ratio - 1) > 0.06:
        ratio = min(1.35, max(0.75, ratio))
        src, dst = f"{tmp}/c{i}.wav", f"{tmp}/c{i}s.wav"
        import soundfile as sf
        sf.write(src, chunk, SR)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-af", f"atempo={ratio:.4f}", dst], check=True)
        chunk, _ = librosa.load(dst, sr=SR, mono=True)
    else:
        ratio = 1
    f = int(0.006 * SR)
    chunk = chunk.copy()
    chunk[:f] *= np.linspace(0, 1, f)
    chunk[-f:] *= np.linspace(1, 0, f)
    s = int((ta - pre - base) * SR)
    out[s : s + len(chunk)] += chunk[: len(out) - s]
    print(f"{a:6.2f}-{b:5.2f}s -> {ta:6.2f}-{tb:5.2f}s  x{1 / ratio:.2f}")
end = len(out) - np.argmax(np.abs(out[::-1]) > 1e-4)
out = out[: end + int(0.05 * SR)]
import soundfile as sf
sf.write(out_f, out, SR)
print(f"wrote {out_f} ({len(out) / SR:.2f}s); the file starts {base:.3f}s into the take -> lineDelayMs {round(base * 1000)}")
