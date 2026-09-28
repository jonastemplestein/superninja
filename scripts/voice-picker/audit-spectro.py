#!/usr/bin/env python3
"""Spectrograms with Burg formant tracks (F1-F3) for chosen words, to check the measurements by eye.

Run: uv run --with numpy --with praat-parselmouth --with matplotlib python scripts/voice-picker/audit-spectro.py OUT.png \
       "label|path|start|end|sex" ...
"""
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import parselmouth

ROOT = Path(__file__).resolve().parents[2]
out = sys.argv[1]
items = [a.split("|") for a in sys.argv[2:]]
cols = 4
rows = (len(items) + cols - 1) // cols
fig, axes = plt.subplots(rows, cols, figsize=(4.2 * cols, 3.0 * rows), squeeze=False)
for ax in axes.flat:
    ax.axis("off")
for ax, (label, path, s, e, sex) in zip(axes.flat, items):
    ax.axis("on")
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    snd = parselmouth.Sound(str(p)).convert_to_mono()
    s, e = float(s), float(e)
    e = min(e, snd.duration)
    part = snd.extract_part(from_time=max(0, s), to_time=e, preserve_times=True)
    spec = part.to_spectrogram(window_length=0.005, maximum_frequency=5500)
    X, Y = spec.x_grid(), spec.y_grid()
    db = 10 * np.log10(np.maximum(spec.values, 1e-12))
    ax.pcolormesh(X, Y, db, vmin=db.max() - 60, cmap="Greys", shading="auto")
    fmax = 5500 if sex == "f" else 5000
    fmt = part.to_formant_burg(time_step=0.005, max_number_of_formants=5, maximum_formant=fmax)
    pitch = part.to_pitch_ac(time_step=0.005, pitch_floor=120 if sex == "f" else 65, pitch_ceiling=500 if sex == "f" else 300)
    ts = np.arange(part.xmin + 0.01, part.xmax - 0.01, 0.005)
    voiced = np.array([not np.isnan(pitch.get_value_at_time(t)) for t in ts])
    for k, c in ((1, "tab:blue"), (2, "tab:green"), (3, "tab:red")):
        f = np.array([fmt.get_value_at_time(k, t) for t in ts])
        ax.plot(ts[voiced], f[voiced], ".", ms=2.5, color=c)
    ax.set_ylim(0, 5000)
    ax.set_title(label, fontsize=9)
    ax.tick_params(labelsize=7)
fig.tight_layout()
fig.savefig(out, dpi=90)
print("wrote", out)
