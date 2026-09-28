# Checks a built website film (public/media/intro_film.mp4, from scripts/intro-film.py) against its inputs:
#   cuts      the picture cuts (ffmpeg scdet) land within 20 ms of intro_timing.json's plan (sum of the earlier minMs)
#   sync      each line public/a/l/film_N.mp3 is found in the soundtrack (normalised cross-correlation, 8 kHz) at its
#             expected onset: its shot's detected cut + lineDelayMs.
#             A present line scores about 0.93-0.99; an absent one about 0.03-0.08.
#   --absent DIR   old takes that must NOT be in the film (e.g. .trash/sulafat-2026-09-27/public/a/l after a voice change):
#             every DIR/film_N.mp3 must score below 0.3 anywhere in the film
#   loudness  integrated loudness, LRA and true peak (intro-film.py normalises to -17 LUFS, -1.5 dBTP)
#   streams   the video and audio lengths agree
#   --sheet out.jpg   a contact sheet: each shot's first frame, middle and last frame (a row a shot)
#   --whisper       faster-whisper small.en per shot, word error rate against src/content/lines.ts
# Usage: uv run --with numpy --with scipy --with pillow [--with faster-whisper] python scripts/intro-film-check.py \
#          [film.mp4] [--timing public/a/v/intro_timing.json] [--absent DIR] [--sheet out.jpg] [--whisper]
# Exit 1 if a cut drifts more than 20 ms, a line is missing or out of sync by more than 40 ms, or an --absent take is found.
import argparse, io, json, os, re, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve

ap = argparse.ArgumentParser()
ap.add_argument("film", nargs="?", default="public/media/intro_film.mp4")
ap.add_argument("--timing", default="public/a/v/intro_timing.json")
ap.add_argument("--lines", default="public/a/l")
ap.add_argument("--absent", action="append", default=[])
ap.add_argument("--sheet")
ap.add_argument("--whisper", action="store_true")
a = ap.parse_args()
SR = 8000

def load(p):
    raw = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-i", p, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return np.diff(x, prepend=x[0])  # first difference: the voice's formants count, the bed's low end less

def trim(x):
    e = np.abs(x); i = np.where(e > e.max() * 0.02)[0]
    return x[i[0]:i[-1] + 1], i[0] / SR

film = load(a.film)
cs = np.concatenate([[0], np.cumsum(film * film)])
def ncc(clip):
    num = fftconvolve(film, clip[::-1], mode="valid"); L = len(clip)
    win = (cs[L:] - cs[:-L])[:len(num)]
    return num / np.sqrt(np.maximum(win, 1e-12) * np.sum(clip * clip))

timing = json.load(open(a.timing)); start = {}; t = 0.0
for s in timing: start[s["shot"]] = t; t += s["minMs"] / 1000
bad = []
print(f"{a.film}: {len(timing)} shots, {t:.2f} s + the end hold")
# where the picture actually cuts (scene detection), against intro_timing.json; each line is then expected lineDelayMs
# after its shot's real cut, so "sync" is the narration against the picture, not against the plan
sc = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", a.film, "-an", "-vf", "scdet=threshold=10", "-f", "null", "-"], capture_output=True, text=True).stderr
cuts = [float(x) for x in re.findall(r"lavfi\.scd\.time: ([\d.]+)", sc)]
for s in timing[1:]:
    n = s["shot"]; near = [c for c in cuts if abs(c - start[n]) <= 0.25]
    if near:
        c = min(near, key=lambda c: abs(c - start[n])); drift = (c - start[n]) * 1000
        print(f"  cut to shot {n}: {c:6.3f} s (planned {start[n]:6.3f}, {drift:+4.0f} ms)")
        if abs(drift) > 20: bad.append(f"shot {n} cut {drift:+.0f} ms")
        start[n] = c
    else: print(f"  cut to shot {n}: not detected near {start[n]:.3f} s (using the plan)")
for s in timing:
    n = s["shot"]; clip, lead = trim(load(f"{a.lines}/film_{n}.mp3"))
    r = ncc(clip); exp = start[n] + s["lineDelayMs"] / 1000 + lead
    lo = max(0, int((exp - 1.5) * SR)); k = lo + int(np.argmax(r[lo:int((exp + 1.5) * SR)]))
    off = (k / SR - exp) * 1000; ok = r[k] > 0.8 and abs(off) <= 40
    print(f"  film_{n}: at {k / SR:6.2f} s (expected {exp:6.2f}, {off:+4.0f} ms)  match {r[k]:.3f}  {'ok' if ok else 'BAD'}")
    if not ok: bad.append(f"film_{n} sync")
for d in a.absent:
    for s in timing:
        p = f"{d}/film_{s['shot']}.mp3"
        if not os.path.exists(p): continue
        clip, _ = trim(load(p))
        m = float(ncc(clip).max())
        print(f"  absent {p}: best match {m:.3f}  {'ok' if m < 0.3 else 'FOUND'}")
        if m >= 0.3: bad.append(f"{p} present")

ln = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", a.film, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
summ = ln[ln.rfind("Summary:"):]
g = lambda k: re.search(k + r":\s+(-?[\d.]+|-inf)", summ).group(1)
print(f"  loudness {g('I')} LUFS, LRA {g('LRA')} LU, true peak {g('Peak')} dBFS")
dur = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,duration", "-of", "csv=p=0", a.film]).decode().split()
print("  streams", " ".join(dur))

if a.sheet:
    from PIL import Image, ImageDraw, ImageFont
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
    rows = []
    for s in timing:
        n = s["shot"]; st = start[n]; D = s["minMs"] / 1000
        ims = []
        for tt, lab in ((st + 0.05, "start"), (st + D * 0.5, "mid"), (st + D - 0.08, "end")):
            png = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-ss", f"{tt:.3f}", "-i", a.film, "-frames:v", "1", "-vf", "scale=384:-2", "-f", "image2pipe", "-vcodec", "png", "-"])
            im = Image.open(io.BytesIO(png)).convert("RGB"); d = ImageDraw.Draw(im)
            txt = f"shot {n} {lab} {tt:.2f}s"; bb = d.textbbox((4, 4), txt, font=font)
            d.rectangle((bb[0] - 3, bb[1] - 3, bb[2] + 3, bb[3] + 3), fill=(0, 0, 0)); d.text((4, 4), txt, fill=(255, 255, 255), font=font)
            ims.append(im)
        rows.append(ims)
    w, h = rows[0][0].size; sheet = Image.new("RGB", (3 * w, len(rows) * h))
    for r_, ims in enumerate(rows):
        for c, im in enumerate(ims): sheet.paste(im, (c * w, r_ * h))
    sheet.save(a.sheet, quality=85); print("  sheet", a.sheet)

if a.whisper:
    import tempfile
    from faster_whisper import WhisperModel
    lines = dict(re.findall(r'[sb]\("(film_\d)", "([^"]+)"\)', open("src/content/lines.ts").read()))
    wav = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", a.film, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    segs, _ = WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(wav, language="en", beam_size=5, word_timestamps=True)
    words = [(w.start, w.word.strip()) for sg in segs for w in sg.words]; os.unlink(wav)
    norm = lambda x: re.sub(r"[^a-z' ]", " ", x.lower().replace("-", " ")).split()
    def wer(x, y):
        d = [[i + j if i * j == 0 else 0 for j in range(len(y) + 1)] for i in range(len(x) + 1)]
        for i in range(1, len(x) + 1):
            for j in range(1, len(y) + 1): d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] != y[j - 1]))
        return d[-1][-1] / max(1, len(x))
    for s in timing:
        n = s["shot"]; b = start[n] + s["minMs"] / 1000
        heard = " ".join(w for st, w in words if start[n] - 0.05 <= st < b)
        print(f"  shot {n} WER {wer(norm(lines[f'film_{n}']), norm(heard)):.2f}: {heard}")

print("FAIL: " + ", ".join(bad) if bad else "ok")
sys.exit(1 if bad else 0)
