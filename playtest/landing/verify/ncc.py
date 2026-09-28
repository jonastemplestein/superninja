# For each target media file, find where each phoneme recording (old vs current) occurs, by normalised cross-correlation.
import sys, subprocess, hashlib, glob, os
import numpy as np
from scipy.signal import fftconvolve
SR = 16000
def load(p):
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def trim(x, thr=0.02):
    idx = np.where(np.abs(x) > thr*np.abs(x).max())[0]
    return x[idx[0]:idx[-1]+1] if len(idx) else x
def ncc(sig, tpl):
    tpl = tpl - tpl.mean(); n = len(tpl)
    num = fftconvolve(sig, tpl[::-1], mode="valid")
    c1 = np.concatenate([[0], np.cumsum(sig)]); c2 = np.concatenate([[0], np.cumsum(sig*sig)])
    s1 = c1[n:] - c1[:-n]; s2 = c2[n:] - c2[:-n]
    var = np.maximum(s2 - s1*s1/n, 1e-12)
    return num / (np.sqrt(var) * np.linalg.norm(tpl))
ROOT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja"
cur = f"{ROOT}/public/a/p"
olddirs = [f"{ROOT}/playtest/phonemes/before", f"{ROOT}/.trash/phonemes-2026-09-26", f"{ROOT}/.trash/phonemes-2026-09-26/intervening", f"{ROOT}/playtest/phonemes/candidates"]
md5 = lambda p: hashlib.md5(open(p,"rb").read()).hexdigest()
tpls = []  # (label, phoneme, array)
for f in sorted(glob.glob(f"{cur}/*.mp3")):
    ph = os.path.basename(f)[:-4]
    tpls.append((f"NOW:{ph}", ph, trim(load(f))))
    seen = {md5(f)}
    for d in olddirs:
        g = f"{d}/{ph}.mp3"
        if os.path.exists(g) and md5(g) not in seen:
            seen.add(md5(g)); tpls.append((f"OLD[{os.path.basename(d)}]:{ph}", ph, trim(load(g))))
THR = float(os.environ.get("THR", "0.6"))
for target in sys.argv[1:]:
    sig = load(target)
    print(f"===== {target} ({len(sig)/SR:.1f}s)")
    hits = []
    for label, ph, t in tpls:
        if len(t) < 800 or len(t) > len(sig): continue
        r = ncc(sig, t)
        # peaks above threshold, non-max suppressed within template length
        order = np.argsort(r)[::-1]
        taken = []
        for i in order[:2000]:
            if r[i] < THR: break
            if any(abs(i-j) < len(t) for j in taken): continue
            taken.append(i); hits.append((i/SR, r[i], label, len(t)/SR))
    # keep best label per location
    hits.sort(key=lambda h: -h[1])
    final = []
    for h in hits:
        if any(abs(h[0]-f[0]) < 0.15 for f in final): continue
        final.append(h)
    for t0, score, label, dur in sorted(final):
        print(f"  {t0:6.2f}s  ncc={score:.2f}  {label}  ({dur:.2f}s)")
    KEY = os.environ.get("KEY", "b,k,t,p,g,d,ch,j,h").split(",")
    summ = []
    for label, ph, t in tpls:
        if ph in KEY and len(t) <= len(sig):
            summ.append(f"{label}={ncc(sig, t).max():.2f}")
    print("  max NCC:", "  ".join(summ))
