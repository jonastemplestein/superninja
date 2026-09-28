"""Shared audio helpers for the speech-template experiment (playtest/speech-templates/experiments).

Everything works on mono float32 at 24 kHz (Gemini TTS's own rate). Run with the experiment venv:
  playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/<script>.py
"""
from __future__ import annotations

import json
import math
import subprocess
from functools import lru_cache
from pathlib import Path

import numpy as np
import parselmouth
from parselmouth.praat import call
from scipy.signal import lfilter

SR = 24000
ROOT = Path(__file__).resolve().parents[4]
RUNS = ROOT / "playtest/runs/speech-templates"
EXP = ROOT / "playtest/speech-templates/experiments"
LUFS = -16.0


# ---------------------------------------------------------------- io
def load(path: str | Path) -> np.ndarray:
    out = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(out, dtype=np.float32).copy()


def save_wav(x: np.ndarray, path: str | Path) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "pcm_s16le", str(path)], input=np.clip(x, -1, 1).astype(np.float32).tobytes(), check=True)


def save_mp3(wav: str | Path, mp3: str | Path) -> None:
    Path(mp3).parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(wav), "-ar", "44100", "-ac", "1",
                    "-codec:a", "libmp3lame", "-q:a", "4", str(mp3)], check=True)


def lufs_of(x: np.ndarray) -> float:
    """Integrated loudness via ffmpeg ebur128 (NaN if unmeasurable)."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                        "-af", "ebur128=framelog=quiet", "-f", "null", "-"], input=x.astype(np.float32).tobytes(),
                       capture_output=True)
    import re
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr.decode())
    return float(m[-1]) if m else float("nan")


def sil(sec: float) -> np.ndarray:
    return np.zeros(int(round(sec * SR)), dtype=np.float32)


# ---------------------------------------------------------------- framing
def frame_db(x: np.ndarray, hop: float = 0.005, win: float = 0.02) -> tuple[np.ndarray, np.ndarray]:
    h, w = int(hop * SR), int(win * SR)
    n = max(1, 1 + (len(x) - w) // h)
    idx = np.arange(w)[None, :] + h * np.arange(n)[:, None]
    idx = np.clip(idx, 0, len(x) - 1)
    rms = np.sqrt(np.mean(x[idx] ** 2, axis=1) + 1e-12)
    t = (np.arange(n) * h + w / 2) / SR
    return t, 20 * np.log10(rms + 1e-9)


def trim(x: np.ndarray, thr_db: float = -45, pre: float = 0.01, post: float = 0.03) -> tuple[np.ndarray, float]:
    """Trim leading/trailing silence (like finishAudio's −45 dB). Returns (trimmed, seconds removed at the start)."""
    t, db = frame_db(x, 0.005, 0.01)
    on = np.where(db > thr_db)[0]
    if not len(on):
        return x, 0.0
    a = max(0, int((t[on[0]] - 0.005 - pre) * SR))
    b = min(len(x), int((t[on[-1]] + 0.005 + post) * SR))
    return x[a:b].copy(), a / SR


def fade(x: np.ndarray, fin: float = 0.025, fout: float = 0.025) -> np.ndarray:
    x = x.copy()
    if fin > 0:
        n = min(len(x), int(fin * SR)); x[:n] *= np.sin(np.linspace(0, np.pi / 2, n)) ** 2
    if fout > 0:
        n = min(len(x), int(fout * SR)); x[len(x) - n:] *= np.cos(np.linspace(0, np.pi / 2, n)) ** 2
    return x


# ---------------------------------------------------------------- loudness (K-weighted, BS.1770 filters at 24 kHz)
@lru_cache(None)
def _kfilt():
    # BS.1770 K-weighting as RBJ biquads at SR (the pyloudnorm form): +4 dB high shelf at 1.5 kHz, 38 Hz high-pass
    def shelf(f0, g, q):
        A = 10 ** (g / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q); c = np.cos(w); r = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + r), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - r)]
        a = [(A + 1) - (A - 1) * c + r, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - r]
        return np.array(b) / a[0], np.array(a) / a[0]

    def hp(f0, q):
        w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
        return np.array(b) / a[0], np.array(a) / a[0]

    b1, a1 = shelf(1500.0, 4.0, 1 / np.sqrt(2))
    b2, a2 = hp(38.0, 0.5)
    return b1, a1, b2, a2


def kweight(x: np.ndarray) -> np.ndarray:
    b1, a1, b2, a2 = _kfilt()
    return lfilter(b2, a2, lfilter(b1, a1, x))


def active_level(x: np.ndarray, rel: float = 20) -> float:
    """K-weighted RMS (dB) over the frames within `rel` dB of the loudest frame: the level of the speech, not the gaps."""
    if len(x) < int(0.02 * SR):
        return float("nan")
    _, db = frame_db(kweight(x), 0.005, 0.02)
    act = db[db > db.max() - rel]
    return float(10 * np.log10(np.mean(10 ** (act / 10))))


def normalise(x: np.ndarray, target: float = LUFS) -> np.ndarray:
    l = lufs_of(x)
    g = target - l if math.isfinite(l) and l > -70 else 0.0
    y = x * 10 ** (g / 20)
    peak = np.max(np.abs(y)) + 1e-9
    lim = 10 ** (-1.5 / 20)
    return y * (lim / peak) if peak > lim else y


def finish(x: np.ndarray) -> np.ndarray:
    """finishLine's order: trim, 25 ms fades, loudness to −16 LUFS (limit −1.5 dBTP), 50 ms pad."""
    y, _ = trim(x)
    y = fade(y, 0.025, 0.025)
    return np.concatenate([normalise(y), sil(0.05)])


def library_level(x: np.ndarray) -> np.ndarray:
    """A carrier as the game ships it: finishLine's −16 LUFS, or −19 for a clip under 1.2 s."""
    y, _ = trim(x)
    y = fade(y, 0.025, 0.025)
    return normalise(y, -19.0 if len(y) / SR + 0.05 < 1.2 else -16.0)


# ---------------------------------------------------------------- pitch, mfcc
def pitch(x: np.ndarray, step: float = 0.005) -> tuple[np.ndarray, np.ndarray]:
    p = parselmouth.Sound(x.astype(np.float64), SR).to_pitch_ac(time_step=step, pitch_floor=75, pitch_ceiling=500)
    f = p.selected_array["frequency"]
    return p.xs(), f


def mfcc(x: np.ndarray, hop: float = 0.005):
    import librosa
    m = librosa.feature.mfcc(y=x.astype(np.float32), sr=SR, n_mfcc=13, n_fft=int(0.025 * SR), hop_length=int(hop * SR),
                             n_mels=40, center=True)
    t = np.arange(m.shape[1]) * hop
    return t, m[1:13].T  # c1..c12


def st(a: float, b: float) -> float:
    return 12 * math.log2(b / a)


def f0_edges(x: np.ndarray, a: float, b: float, n: int = 3):
    """(first, last) F0 of the voiced frames in [a, b] s: medians of the first and last n voiced frames."""
    t, f = pitch(x)
    sel = (t >= a) & (t <= b) & (f > 0)
    v = f[sel]
    if len(v) < 2:
        return None
    # drop octave errors: frames more than 7 st from the median
    med = np.median(v)
    v = v[np.abs(12 * np.log2(v / med)) < 7]
    if len(v) < 2:
        return None
    return float(np.median(v[:n])), float(np.median(v[-n:]))


# ---------------------------------------------------------------- forced alignment (torchaudio MMS_FA, char CTC)
@lru_cache(None)
def _fa():
    import torch, torchaudio
    b = torchaudio.pipelines.MMS_FA
    return b.get_model(with_star=False), b.get_tokenizer(), b.get_aligner(), torch, torchaudio


def align(x: np.ndarray, words: list[str]) -> list[tuple[float, float]]:
    model, tok, al, torch, ta = _fa()
    w16 = ta.functional.resample(torch.from_numpy(x.astype(np.float32))[None, :], SR, 16000)
    clean = ["".join(c for c in w.lower() if c.isalpha() or c == "'") for w in words]
    with torch.inference_mode():
        em, _ = model(w16)
        spans = al(em[0], tok(clean))
    ratio = w16.size(1) / em.size(1) / 16000
    return [(s[0].start * ratio, s[-1].end * ratio) for s in spans]


def valley(x: np.ndarray, a: float, b: float) -> float:
    """Time of the quietest 10 ms in [a, b] (a word boundary between two CTC spans)."""
    a, b = max(0.0, a), min(len(x) / SR, b)
    if b - a < 0.012:
        return (a + b) / 2
    t, db = frame_db(x, 0.0025, 0.01)
    sel = np.where((t >= a) & (t <= b))[0]
    if not len(sel):
        return (a + b) / 2
    k = sel[np.argmin(db[sel])]
    return float(t[k])


def word_bounds(x: np.ndarray, spans: list[tuple[float, float]], i: int) -> tuple[float, float]:
    """Refined [start, end] of word i: the energy valley between it and its neighbours (the file edge if none)."""
    s, e = spans[i]
    left = valley(x, spans[i - 1][1] - 0.01, s + 0.015) if i > 0 else 0.0
    right = valley(x, e - 0.015, spans[i + 1][0] + 0.01) if i + 1 < len(spans) else len(x) / SR
    return left, right


# ---------------------------------------------------------------- joins
def zc(x: np.ndarray, i: int, rad: int = 36) -> int:
    """Nearest rising zero crossing to sample i (±1.5 ms)."""
    lo, hi = max(1, i - rad), min(len(x) - 1, i + rad)
    seg = x[lo - 1:hi]
    z = np.where((seg[:-1] <= 0) & (seg[1:] > 0))[0]
    if not len(z):
        return i
    c = z + lo
    return int(c[np.argmin(np.abs(c - i))])


def xjoin(parts: list[tuple[np.ndarray, int, int]], xf: float = 0.008) -> tuple[np.ndarray, list[float]]:
    """Concatenate parts [(signal, start, end)], each cut at zero crossings, with raised-cosine crossfades of xf s
    centred on each cut. Returns the signal and each join's time."""
    n = int(xf * SR)
    h = n // 2
    out = np.zeros(0, dtype=np.float32)
    joins = []
    for k, (sig, a, b) in enumerate(parts):
        a = zc(sig, a) if k > 0 else a
        b = zc(sig, b) if k + 1 < len(parts) else b
        lo = max(0, a - h) if k > 0 else a
        hi = min(len(sig), b + h) if k + 1 < len(parts) else b
        seg = sig[lo:hi].astype(np.float32)
        if k == 0:
            out = seg
            continue
        m = min(n, len(out), len(seg))
        w = np.sin(np.linspace(0, np.pi / 2, m)) ** 2
        mixed = out[len(out) - m:] * (1 - w) + seg[:m] * w
        joins.append((len(out) - m / 2) / SR)
        out = np.concatenate([out[:len(out) - m], mixed, seg[m:]])
    return out, joins


def best_cut(P: np.ndarray, p0: float, Q: np.ndarray, q0: float, win: float, shift_pen: float = 0.03) -> tuple[float, float, float]:
    """Optimal coupling: the cut pair (p in P near p0, q in Q near q0) where the two signals are most alike — MFCC
    distance, level (dB) and F0 (st) at the cut — with a small penalty for moving from the aligned boundary."""
    tp, mp = mfcc(P); tq, mq = mfcc(Q)
    _, ep = frame_db(P); _, eq = frame_db(Q)
    fpt, fp = pitch(P); fqt, fq = pitch(Q)
    step = 0.0025
    cand_p = np.arange(max(0.01, p0 - win), min(len(P) / SR - 0.01, p0 + win) + 1e-9, step)
    cand_q = np.arange(max(0.01, q0 - win), min(len(Q) / SR - 0.01, q0 + win) + 1e-9, step)
    if not len(cand_p) or not len(cand_q):
        return p0, q0, float("nan")

    def at(t, arr, times):
        return arr[min(len(arr) - 1, max(0, int(round(t / 0.005))))] if times is None else arr[np.argmin(np.abs(times - t))]

    best = (p0, q0, float("inf"))
    for p in cand_p:
        vp, dp, f_p = at(p, mp, None), at(p, ep, None), at(p, fp, fpt)
        for q in cand_q:
            c = np.linalg.norm(vp - at(q, mq, None)) / 10 + abs(dp - at(q, eq, None)) / 3
            f_q = at(q, fq, fqt)
            if f_p > 0 and f_q > 0:
                c += min(abs(st(f_p, f_q)), 12) / 1.5
            elif (f_p > 0) != (f_q > 0):
                c += 2
            c += shift_pen * 1000 * (abs(p - p0) + abs(q - q0)) / 10
            if c < best[2]:
                best = (float(p), float(q), float(c))
    return best


# ---------------------------------------------------------------- PSOLA (Praat overlap-add)
def psola(x: np.ndarray, st_a: float, st_b: float, dur: float = 1.0, ramp=None) -> np.ndarray:
    """Shift pitch by a linear ramp from st_a (start) to st_b (end) semitones and scale duration by `dur`, keeping the
    voice (Praat Manipulation, overlap-add). `ramp` = (t0, t1) limits the ramp to that span (0 before, st_b after)."""
    if abs(st_a) < 0.05 and abs(st_b) < 0.05 and abs(dur - 1) < 0.01:
        return x
    s = parselmouth.Sound(np.concatenate([x, np.zeros(1)]).astype(np.float64), SR)
    d = s.duration
    m = call(s, "To Manipulation", 0.005, 75, 600)
    pt = call(m, "Extract pitch tier")
    if ramp is None:
        call(pt, "Formula", f"self * 2^(({st_a} + ({st_b} - {st_a}) * x / {d}) / 12)")
    else:
        t0, t1 = ramp
        call(pt, "Formula",
             f"self * 2^((if x < {t0} then {st_a} else if x > {t1} then {st_b} else {st_a} + ({st_b} - {st_a}) * (x - {t0}) / {t1 - t0 + 1e-6} fi fi) / 12)")
    call([pt, m], "Replace pitch tier")
    if abs(dur - 1) >= 0.01:
        dt = call("Create DurationTier", "d", 0, d)
        call(dt, "Add point", d / 2, dur)
        call([dt, m], "Replace duration tier")
    o = call(m, "Get resynthesis (overlap-add)")
    return o.values[0].astype(np.float32)


def dump(obj, path: str | Path) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(obj, indent=1))


def clean_f0(t: np.ndarray, f: np.ndarray, a: float, b: float) -> tuple[np.ndarray, np.ndarray]:
    """Voiced frames in [a, b] with octave errors (more than 7 st from the median) dropped, lightly smoothed."""
    sel = (t >= a) & (t <= b) & (f > 0)
    tt, ff = t[sel], f[sel]
    if len(ff) < 3:
        return tt, ff
    med = np.median(ff)
    ok = np.abs(12 * np.log2(ff / med)) < 7
    tt, ff = tt[ok], ff[ok]
    if len(ff) >= 5:
        from scipy.signal import medfilt
        ff = medfilt(ff, 5)
    return tt, ff


def transplant(seg: np.ndarray, v0: float, v1: float, contour: np.ndarray, dur: float = 1.0, gain_st: float = 0.0) -> np.ndarray:
    """Give `seg`'s voiced stretch [v0, v1] (s, within seg) the F0 `contour` (Hz, sampled evenly over the stretch),
    and scale its duration by `dur` (Praat Manipulation, overlap-add): prosody transplantation from the master's filler."""
    s = parselmouth.Sound(np.concatenate([seg, np.zeros(1)]).astype(np.float64), SR)
    d = s.duration
    m = call(s, "To Manipulation", 0.005, 75, 600)
    pt = call("Create PitchTier", "p", 0, d)
    n = len(contour)
    for k, f in enumerate(contour):
        tk = v0 + (v1 - v0) * (k / max(1, n - 1))
        call(pt, "Add point", min(max(tk, 0.0), d), float(f) * 2 ** (gain_st / 12))
    call([pt, m], "Replace pitch tier")
    if abs(dur - 1) >= 0.01:
        dt = call("Create DurationTier", "d", 0, d)
        call(dt, "Add point", d / 2, dur)
        call([dt, m], "Replace duration tier")
    o = call(m, "Get resynthesis (overlap-add)")
    return o.values[0].astype(np.float32)
