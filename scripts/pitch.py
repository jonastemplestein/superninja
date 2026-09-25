# Median F0 (Hz) of voiced frames for each mp3 given. Simple autocorrelation.
import sys, subprocess, numpy as np
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg","-loglevel","error","-i",f,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32)/32768
    f0s=[]; w=640
    for i in range(0, len(x)-w, 160):
        fr = x[i:i+w]*np.hanning(w)
        if np.sqrt(np.mean(fr**2)) < 0.02: continue
        ac = np.correlate(fr, fr, "full")[w-1:]
        lo, hi = 16000//500, 16000//70
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] > 0.4*ac[0]: f0s.append(16000/k)
    print(f"{np.median(f0s) if f0s else 0:7.1f} Hz  {len(f0s):3d}fr  {f}")
