#!/usr/bin/env python3
"""A long-lived measuring worker for scripts/rerecord-erinome.ts: one JSON request a line on stdin, one JSON answer a
line on stdout (so the Whisper model is loaded once, not once a take).

Request: {"id": 1, "file": "take.mp3", "whisper": true, "pitch": true, "f3": false}
Answer:  {"id": 1, "text": "Cat.", "hz": 191.2, "f3_ratio": 0.97}
- text: a blind faster-whisper transcript (no prompt, no target word), the model in --model (small.en);
- hz: the median F0 of voiced frames (the autocorrelation of scripts/pitch.py, so the word gate is the same one);
- f3_ratio: for an r-word said alone, the smoothed minimum F3 over the second half of its voiced nucleus over the
  speaker's usual F3 (scripts/voice-picker/audit-measure.py's rhoticity measure: an American r pulls it to about
  0.6-0.8, a British vowel keeps it near 1). Evidence only: the calibrated judge (scripts/accent-judge.ts) decides.

Run: uv run --with numpy --with praat-parselmouth --with faster-whisper python scripts/lib/clip-worker.py \
       [--model small.en] [--baseline a.mp3,b.mp3,...]
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import parselmouth

STEP = 0.005


def pcm(path: str, rate: int) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(rate), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def median_f0(path: str) -> float:
    x = pcm(path, 16000)
    f0s = []
    w = 640
    for i in range(0, len(x) - w, 160):
        fr = x[i:i + w] * np.hanning(w)
        if np.sqrt(np.mean(fr ** 2)) < 0.02:
            continue
        ac = np.correlate(fr, fr, "full")[w - 1:]
        lo, hi = 16000 // 500, 16000 // 70
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.4 * ac[0]:
            f0s.append(16000 / k)
    return float(np.median(f0s)) if f0s else 0.0


def sound(path: str) -> parselmouth.Sound:
    with tempfile.TemporaryDirectory() as d:
        wav = str(Path(d) / "a.wav")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-ac", "1", "-ar", "44100", wav], check=True)
        return parselmouth.Sound(wav)


def smooth(x, k=7):
    out = x.copy()
    h = k // 2
    for i in range(len(x)):
        w = x[max(0, i - h): i + h + 1]
        w = w[~np.isnan(w)]
        out[i] = np.median(w) if len(w) else np.nan
    return out


def track(path: str):
    snd = sound(path)
    t = np.arange(STEP, snd.duration - STEP, STEP)
    pitch = snd.to_pitch_ac(time_step=STEP, pitch_floor=120, pitch_ceiling=500)
    fmt = snd.to_formant_burg(time_step=STEP, max_number_of_formants=5, maximum_formant=5500, window_length=0.025)
    inten = snd.to_intensity(minimum_pitch=120, time_step=STEP)
    f0 = np.array([pitch.get_value_at_time(x) for x in t])
    F = {k: np.array([fmt.get_value_at_time(k, x) for x in t]) for k in (2, 3)}
    I = np.array([inten.get_value(x) for x in t])
    return t, ~np.isnan(f0), F, I


def f3_late(path: str):
    t, voiced, F, I = track(path)
    ix = np.where(voiced)[0]
    if len(ix) == 0:
        return None
    ix = ix[I[ix] >= np.nanmax(I[ix]) - 12]
    if len(ix) < 6:
        return None
    lo, hi = ix[int(len(ix) * 0.4)], ix[int(len(ix) * 0.92)]
    f3 = smooth(F[3])[lo:hi + 1]
    f2 = smooth(F[2])[lo:hi + 1]
    ok = (~np.isnan(f3)) & (f3 > np.nan_to_num(f2) + 250) & voiced[lo:hi + 1]
    return float(np.min(f3[ok])) if ok.any() else None


def usual_f3(paths):
    vals = []
    for p in paths:
        t, voiced, F, I = track(p)
        ok = voiced & (I >= np.nanmax(I) - 10) & ~np.isnan(F[3])
        vals.extend(F[3][ok])
    return float(np.median(vals)) if vals else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="small.en")
    ap.add_argument("--baseline", default="")
    args = ap.parse_args()
    from faster_whisper import WhisperModel
    model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=4)
    base = usual_f3([p for p in args.baseline.split(",") if p]) if args.baseline else None
    print(json.dumps({"ready": True, "baseline_f3": base}), flush=True)
    for line in sys.stdin:
        if not line.strip():
            continue
        req = json.loads(line)
        out = {"id": req.get("id")}
        try:
            f = req["file"]
            if req.get("whisper", True):
                segs, _ = model.transcribe(f, language="en", beam_size=5, condition_on_previous_text=False,
                                           without_timestamps=True, vad_filter=False)
                out["text"] = " ".join(s.text.strip() for s in segs).strip()
            if req.get("pitch"):
                out["hz"] = round(median_f0(f), 1)
            if req.get("f3") and base:
                v = f3_late(f)
                out["f3_ratio"] = round(v / base, 2) if v else None
        except Exception as e:  # noqa: BLE001
            out["error"] = str(e)[:300]
        print(json.dumps(out), flush=True)


if __name__ == "__main__":
    main()
