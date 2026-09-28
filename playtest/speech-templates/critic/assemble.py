# Critic pass on docs/SPEECH_TEMPLATES.md, step 2 (no network).
#  a) Fluency of whole takes: the longest silence inside each take (not its edges), and speech-only pace, for the
#     experiment's A takes (T1, T2, T6) and the phrasing takes from render.ts.
#  b) The design's exact sound shape, which the experiment never built: the "Say the sound..." lead-in (A's take),
#     then the pure clip at 150 / 250 / 400 ms from speech end to speech start. Rebuilt from A's assembled WAVs.
# Run: playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/critic/assemble.py
import json, os, subprocess, glob
import numpy as np
import soundfile as sf
import librosa

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
RUNS = os.path.join(ROOT, "playtest/runs/speech-templates")
OUT = os.path.join(RUNS, "critic")
SR = 44100
HOP = int(SR * 0.005)


def load(p):
    y, _ = librosa.load(p, sr=SR, mono=True)
    return y


def db_frames(y):
    n = len(y) // HOP
    f = y[: n * HOP].reshape(n, HOP)
    return 10 * np.log10((f ** 2).mean(axis=1) + 1e-12)


def inner_silences(y, thr=-45.0, min_ms=60):
    d = db_frames(y)
    loud = np.where(d > thr)[0]
    if not len(loud):
        return [], 0.0, 0.0
    a, b = loud[0], loud[-1]
    runs, start = [], None
    for i in range(a, b + 1):
        q = d[i] <= thr
        if q and start is None:
            start = i
        if not q and start is not None:
            ms = (i - start) * 5
            if ms >= min_ms:
                runs.append((round(start * 5 / 1000, 3), ms))
            start = None
    return runs, a * 5 / 1000, (b + 1) * 5 / 1000


def words(t):
    return len([w for w in t.replace("...", " ").split() if any(c.isalpha() for c in w)])


fluency = []
for p in sorted(glob.glob(os.path.join(ROOT, "playtest/speech-templates/experiments/A/T[126]_*.mp3"))):
    n = os.path.basename(p)[:-4]
    text = {"T1": "Say {} slowly.", "T2": "Can you find the {}?", "T6": "Tap {}, then tap {}."}[n[:2]]
    runs, on, off = inner_silences(load(p))
    fluency.append({"set": "A", "id": n, "longest_ms": max([r[1] for r in runs], default=0), "runs": runs,
                    "wps_speech": round(words(text) / (off - on), 2)})
man = json.load(open(os.path.join(OUT, "phrasing/manifest.json")))
for m in man:
    runs, on, off = inner_silences(load(m["mp3"]))
    fluency.append({"set": m["p"], "id": f'{m["p"]}_{m["w"]}_t{m["k"]}', "text": m["text"], "longest_ms": max([r[1] for r in runs], default=0),
                    "runs": runs, "wps_speech": round(words(m["text"]) / (off - on), 2)})
json.dump(fluency, open(os.path.join(OUT, "fluency.json"), "w"), indent=1)
print("set   n  longest inner silence: median / max ms   takes with one >= 150 ms   speech-only pace (words/s) median")
for s in ["A"] + sorted({f["set"] for f in fluency if f["set"] != "A"}):
    rows = [f for f in fluency if f["set"] == s and (s != "A" or f["id"].startswith("T1"))]
    L = [r["longest_ms"] for r in rows]
    print(f'{s + (" T1" if s == "A" else ""):6} {len(rows):2}  {np.median(L):6.0f} / {max(L):4.0f}   {sum(1 for x in L if x >= 150):2}/{len(rows)}   {np.median([r["wps_speech"] for r in rows]):.2f}')
for t in ["T2", "T6"]:
    rows = [f for f in fluency if f["set"] == "A" and f["id"].startswith(t)]
    L = [r["longest_ms"] for r in rows]
    print(f'A {t}   {len(rows):2}  {np.median(L):6.0f} / {max(L):4.0f}   {sum(1 for x in L if x >= 150):2}/{len(rows)}   {np.median([r["wps_speech"] for r in rows]):.2f}')

# ---- b) the design's sound shape at three breaths
build = json.load(open(os.path.join(RUNS, "build.json")))["items"]
os.makedirs(os.path.join(OUT, "breath"), exist_ok=True)
made = []
for it in build:
    if it["method"] != "A" or it["template"] != "T3":
        continue
    y = load(os.path.join(ROOT, it["mp3"]))
    j0, j1 = it["joins"][0]
    d = db_frames(y)
    lead_end = max(i for i in range(0, int((j0 + 0.1) / 0.005)) if d[i] > -45) + 1
    snd_on = min(i for i in range(int((j1 - 0.1) / 0.005), len(d)) if d[i] > -45)
    lead, snd = y[: lead_end * HOP].copy(), y[snd_on * HOP:].copy()
    fade = int(SR * 0.005)
    lead[-fade:] *= np.linspace(1, 0, fade)
    for g in (150, 250, 400):
        out = np.concatenate([lead, np.zeros(int(SR * g / 1000)), snd])
        wav = os.path.join(OUT, "breath", f'{it["id"]}_{g}.wav')
        mp3 = wav[:-4] + ".mp3"
        sf.write(wav, out, SR)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-codec:a", "libmp3lame", "-q:a", "4", mp3], check=True)
        made.append({"id": it["id"], "gap": g, "mp3": os.path.relpath(mp3, ROOT)})
json.dump(made, open(os.path.join(OUT, "breath/manifest.json"), "w"), indent=1)
print(len(made), "breath variants")
