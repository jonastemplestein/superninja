# Share of spectral energy above 12 kHz in speech clips (delivery.md §3). uv run --with numpy python playtest/speech-templates/delivery/measure/bandwidth.py (from the repo root)
import subprocess, numpy as np, sys, glob, random
random.seed(1)
files = random.sample(glob.glob("public/a/l/*.mp3"), 30) + random.sample(glob.glob("public/a/w/*.mp3"), 20) + glob.glob("public/a/p/*.mp3")
res = {}
for f in files:
    raw = subprocess.run(["ffmpeg","-v","error","-i",f,"-f","f32le","-ac","1","-ar","44100","-"],capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    X = np.abs(np.fft.rfft(x))**2
    fr = np.fft.rfftfreq(len(x), 1/44100)
    tot = X.sum()
    res.setdefault(f.split("/")[2], []).append((X[fr>12000].sum()/tot, X[(fr>11000)&(fr<=12000)].sum()/tot, X[fr>16000].sum()/tot))
for k,v in res.items():
    a = np.array(v)
    print(k, "n=%d energy >12k: mean %.2e max %.2e | 11-12k mean %.2e | >16k max %.2e" % (len(a), a[:,0].mean(), a[:,0].max(), a[:,1].mean(), a[:,2].max()))
