#!/usr/bin/env python3
"""Stretch-artefact measures for the pure sounds (27 Sep; Jonas: the /h/ "sounds like a duck quacking").

  uv run --with numpy --with scipy --with praat-parselmouth --with matplotlib \
    python scripts/phonemes/artefacts.py [--plots]

Measures every public/a/p/<id>.mp3 and every playtest/runs/pure-sounds/controls/*.mp3 (scripts/phonemes/
stretch-controls.py) and writes playtest/runs/pure-sounds/metrics.json; --plots also writes a spectrogram per sound to
playtest/runs/pure-sounds/spectro/. All measures are taken on the sound's active region (from the first to the last
10 ms frame within 20 dB of its loudest, widened while within 40 dB).

Breath noise (unvoiced sounds):
  noise_std_db   spread of 20·log10|X| over independent 23 ms frames and 0.5–10 kHz bins, after removing each bin's mean
                 and each frame's mean (corrected for the degrees of freedom). Gaussian noise gives 5.57 dB (the log of
                 an exponential). A phase vocoder carries each bin's magnitude and phase across frames, so stretched
                 noise turns into slowly drifting sinusoids and the spread falls ("phasey", "tonal").
  persist_r      correlation of the fine spectral detail between neighbouring independent frames: 0 for noise; a
                 tonal line or harmonic that persists raises it.
  tonal_z_max    the largest time-averaged spectral peak above its neighbours, in standard errors of noise with the same
                 number of frames (about 3 for pure noise; a steady tone is much more).
  voiced_ms      Praat pitch (autocorrelation, 75–600 Hz) frames in the active region: an unvoiced sound should have none.
  hnr_db         Praat harmonicity (cross-correlation), median over frames Praat could measure.
  cpp_db         cepstral peak prominence, 60–400 Hz, median over frames: periodic energy, whether voice or buzz.
  resid_r        the largest normalised autocorrelation, 2.5–13 ms, of the LPC residual (whitened signal): periodicity
                 that isn't just the spectral envelope.
Any sound:
  flux_db        median frame-to-frame spectral change (5.8 ms hop), and flux_spike (95th percentile over median):
                 jumps where the processing splices or resets.
  flux_period_r  the largest autocorrelation of the flux series at 17–230 ms lags: a regular, looped change.
  env_buzz_r     the largest autocorrelation of the fast amplitude envelope at 2.5–20 ms lags (50–400 Hz): a buzz
                 (for voiced sounds this is just the voice).
  warble_pct     rms depth of the amplitude modulation between 4 and 40 Hz (the sound "wobbling").
  kurt           median kurtosis of the LPC residual in voiced frames: a natural voice is a train of sharp glottal pulses
                 (high); a phase vocoder smears them (lower, "phasey", "hollow").
  jitter_pct, shimmer_pct, f0_wobble_st: Praat jitter and shimmer, and the median F0 step between 5 ms frames.
  lead_click_db, tail_click_db: the loudest 1 ms in the silence before and after the sound, relative to the sound's
                 median level; onset_ms and offset_ms: rise and fall between −40 and −10 dB of the peak.
  click_ratio    the largest second-difference spike over its local 5 ms rms (a sample-level discontinuity).
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import subprocess

import numpy as np
import parselmouth
from parselmouth.praat import call
import scipy.linalg as sl
import scipy.signal as ss

ROOT = Path(__file__).resolve().parents[2]
RUN = ROOT / "playtest/runs/pure-sounds"
SR = 44100
IDS = ("a i m s t n o p b k g h d e f v l r u j w z ks y sh ch th dh ng kw "
       "ae ee ie oe oo ar or er ou oy ue uu air eer zh schwa").split()
UNVOICED = {"h", "s", "f", "sh", "th", "k", "t", "p", "ch", "ks"}
# How each clip in public/a/p was made (recipes.json, docs/DECISIONS.md, the slow-words page for /o/ and /u/).
PROVENANCE = {
    "h": "cut from 'hat' 0.02–0.145 s, STRETCHED 2.16x to 0.27 s (rubberband R3 -F)",
    "r": "cut from 'red' 0.025–0.084 s, crossfade-looped to 0.24 s, STRETCHED 2.08x to 0.5 s",
    "oo": "cut from 'food' 0.26–0.48 s, STRETCHED 1.95x to 0.43 s",
    "ou": "cut from 'cow' 0.12–0.51 s, STRETCHED 1.15x to 0.45 s",
    "air": "cut from 'chair' 0.19–0.45 s, STRETCHED 1.65x to 0.43 s",
    "schwa": "cut from 'sofa' 0.44–0.555 s, STRETCHED 3.48x to 0.4 s",
    "o": "cut from 'hop', natural length 0.13 s (27 Sep; replaced the stretched 'dog' cut)",
    "u": "cut from 'up', natural length 0.11 s (27 Sep; replaced the stretched 'cut' cut)",
    "i": "steady vowel of a TTS 'ih.' take, unstretched",
    "t": "cut from 'tip', unstretched", "p": "cut from 'pig', unstretched", "g": "cut from 'gap', unstretched",
    "j": "cut from 'jam', unstretched", "ch": "cut from 'chip', unstretched", "kw": "cut from 'quick', unstretched",
    "b": "released /b/ at the end of 'grab', unstretched",
    "k": "TTS 'k' take", "ks": "TTS 'cks' take", "w": "TTS 'wwwoo' take, trimmed to 0.62 s",
    "y": "TTS 'yy' take", "th": "unvoiced part of a TTS 'thhhhhing' take",
    "d": "original TTS take (Jonas's choice; not to be touched)",
}
for _id in IDS:
    PROVENANCE.setdefault(_id, "original TTS take (gen-phonemes.ts), unedited")


def load(path: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def frame_db(x: np.ndarray, win: int, hop: int) -> np.ndarray:
    n = max(1, 1 + (len(x) - win)//hop)
    idx = np.arange(win)[None, :] + hop*np.arange(n)[:, None]
    idx = np.minimum(idx, len(x)-1)
    return 10*np.log10(np.mean(x[idx]**2, axis=1) + 1e-12)


def active(x: np.ndarray) -> tuple[int, int]:
    win, hop = 441, 110
    e = frame_db(x, win, hop)
    mx = e.max()
    hot = np.flatnonzero(e > mx-20)
    a, b = hot[0], hot[-1]
    while a > 0 and e[a-1] > mx-40: a -= 1
    while b < len(e)-1 and e[b+1] > mx-40: b += 1
    return a*hop, min(len(x), b*hop+win)


def band_bins(n_fft: int, lo: float, hi: float) -> slice:
    f = np.fft.rfftfreq(n_fft, 1/SR)
    return slice(int(np.searchsorted(f, lo)), int(np.searchsorted(f, hi)))


def noise_texture(y: np.ndarray) -> dict:
    """Independent (non-overlapping) 1024-sample Hann frames, 0.5–10 kHz."""
    n = 1024
    frames = [y[i:i+n] for i in range(0, len(y)-n+1, n)]
    if len(frames) < 3: return {"frames": len(frames)}
    F = np.array(frames)
    lvl = 10*np.log10(np.mean(F**2, axis=1)+1e-12)
    keep = lvl > lvl.max()-25
    F = F[keep]
    if len(F) < 3: return {"frames": int(len(F))}
    X = np.abs(np.fft.rfft(F*np.hanning(n), axis=1))[:, band_bins(n, 500, 10000)]
    M = 20*np.log10(X+1e-9)
    f_, b_ = M.shape
    resid = M - M.mean(0, keepdims=True) - M.mean(1, keepdims=True) + M.mean()
    std = float(resid.std() / math.sqrt((f_-1)*(b_-1)/(f_*b_)))
    detail = M - ss.medfilt(M, kernel_size=(1, 9))
    pers = [np.corrcoef(detail[t], detail[t+1])[0, 1] for t in range(f_-1)]
    md = detail.mean(0)
    z = (md - np.median(md))*math.sqrt(f_)/5.57
    return {"frames": int(f_), "noise_std_db": round(std, 2), "persist_r": round(float(np.mean(pers)), 3),
            "tonal_z_max": round(float(z.max()), 1), "tonal_bins_z4": int((z > 4).sum()),
            "ltas_peak_db": round(float((md - np.median(md)).max()), 1)}


def lpc_residual(frame: np.ndarray, order: int = 18) -> np.ndarray:
    w = frame*np.hanning(len(frame))
    r = np.correlate(w, w, "full")[len(w)-1:len(w)+order]
    if r[0] <= 0: return np.zeros_like(frame)
    r[0] *= 1.0001
    a = sl.solve_toeplitz(r[:order], r[1:order+1])
    return ss.lfilter(np.r_[1, -a], [1], frame)


def periodicity16(y: np.ndarray) -> dict:
    y16 = ss.resample_poly(y, 160, 441)
    sr = 16000
    win, hop = 640, 160
    frames = [y16[i:i+win] for i in range(0, len(y16)-win+1, hop)]
    if not frames: return {}
    lv = np.array([10*np.log10(np.mean(f**2)+1e-12) for f in frames])
    good = lv > lv.max()-20
    cpps, rr, kurts = [], [], []
    q = np.arange(2048)/sr
    qlo, qhi = int(sr/400), int(sr/60)
    for f, g in zip(frames, good):
        if not g: continue
        spec = 20*np.log10(np.abs(np.fft.fft(f*np.hanning(win), 2048))+1e-9)
        cep = 20*np.log10(np.abs(np.fft.ifft(spec))+1e-9)
        k = qlo + int(np.argmax(cep[qlo:qhi]))
        sel = slice(int(.001*sr), int(.02*sr))
        p = np.polyfit(q[sel], cep[sel], 1)
        cpps.append(cep[k] - np.polyval(p, q[k]))
        e = lpc_residual(f)[40:]
        ac = np.correlate(e, e, "full")[len(e)-1:]
        if ac[0] > 0:
            rr.append(float((ac[40:214]/ac[0]).max()))
        kurts.append(float(np.mean(e**4)/(np.mean(e**2)**2+1e-18)))
    return {"cpp_db": round(float(np.median(cpps)), 1) if cpps else None,
            "resid_r": round(float(np.median(rr)), 3) if rr else None, "_kurts": kurts}


def praat(x: np.ndarray, a: int, b: int) -> dict:
    snd = parselmouth.Sound(x, SR)
    t0, t1 = a/SR, b/SR
    pitch = snd.to_pitch_ac(time_step=0.005, pitch_floor=75, pitch_ceiling=600)
    ts = pitch.xs()
    f0 = pitch.selected_array["frequency"]
    inside = (ts >= t0) & (ts <= t1)
    voiced = inside & (f0 > 0)
    hnr = snd.to_harmonicity_cc(time_step=0.01, minimum_pitch=75, silence_threshold=0.1, periods_per_window=1.0)
    hv = hnr.values[0]
    hx = hnr.xs()
    hin = hv[(hx >= t0) & (hx <= t1)]
    hin = hin[hin > -199]
    out = {"voiced_ms": int(voiced.sum()*5), "voiced_frac": round(float(voiced.sum()/max(1, inside.sum())), 2),
           "hnr_db": round(float(np.median(hin)), 1) if len(hin) else None,
           "f0_hz": round(float(np.median(f0[voiced]))) if voiced.any() else None}
    if voiced.sum() >= 6:
        st = 12*np.log2(f0[voiced])
        runs = np.diff(np.flatnonzero(voiced)) == 1
        steps = np.abs(np.diff(st))[runs]
        out["f0_wobble_st"] = round(float(np.median(steps)), 3) if len(steps) else None
        try:
            pp = call(snd, "To PointProcess (periodic, cc)", 75, 600)
            out["jitter_pct"] = round(100*call(pp, "Get jitter (local)", t0, t1, 0.0001, 0.02, 1.3), 2)
            out["shimmer_pct"] = round(100*call([snd, pp], "Get shimmer (local)", t0, t1, 0.0001, 0.02, 1.3, 1.6), 2)
        except Exception:
            pass
    return out


def flux_env(y: np.ndarray) -> dict:
    n, hop = 1024, 256
    out: dict = {}
    if len(y) > n + 4*hop:
        f, t, Z = ss.stft(y, SR, window="hann", nperseg=n, noverlap=n-hop, boundary=None, padded=False)
        M = 20*np.log10(np.abs(Z[band_bins(n, 300, 10000)])+1e-9)
        M = np.maximum(M, M.max()-70)
        lvl = M.mean(0)
        keep = lvl > lvl.max()-20
        fl = np.sqrt(np.mean(np.diff(M, axis=1)**2, axis=0))[keep[1:] & keep[:-1]]
        if len(fl) > 4:
            med = float(np.median(fl))
            out["flux_db"] = round(med, 2)
            out["flux_spike"] = round(float(np.percentile(fl, 95)/med), 2)
            d = fl - fl.mean()
            if len(d) > 12 and d.std() > 0:
                ac = np.correlate(d, d, "full")[len(d)-1:]/(d.var()*len(d))
                lo, hi = 3, min(40, len(d)//2)
                if hi > lo:
                    k = lo + int(np.argmax(ac[lo:hi]))
                    out["flux_period_r"] = round(float(ac[k]), 2)
                    out["flux_period_ms"] = round(k*hop/SR*1000)
    sos = ss.butter(4, [300, 10000], "bandpass", fs=SR, output="sos")
    env = np.abs(ss.hilbert(ss.sosfiltfilt(sos, y)))
    env = ss.resample_poly(ss.sosfiltfilt(ss.butter(4, 500, fs=SR, output="sos"), env), 2000, SR)
    e_sr = 2000
    edge = int(.02*e_sr)
    env = env[edge:len(env)-edge]
    if len(env) > int(.06*e_sr):
        trend = np.convolve(env, np.ones(40)/40, "same") + 1e-9
        fluc = env/trend - 1
        fluc = fluc[20:-20]
        if len(fluc) > 50 and fluc.std() > 0:
            ac = np.correlate(fluc, fluc, "full")[len(fluc)-1:]/(fluc.var()*len(fluc))
            k = 5 + int(np.argmax(ac[5:41]))
            out["env_buzz_r"] = round(float(ac[k]), 2)
            out["env_buzz_hz"] = round(e_sr/k)
    if len(env) > int(.2*e_sr):
        sm = np.convolve(env, np.ones(20)/20, "same")
        trend = np.convolve(sm, np.ones(300)/300, "same") + 1e-9
        valid = slice(150, len(sm)-150) if len(sm) > 400 else slice(20, len(sm)-20)
        mod = (sm/trend - 1)[valid]
        if len(mod) > 40:
            F = np.fft.rfft(mod*np.hanning(len(mod)))
            fr = np.fft.rfftfreq(len(mod), 1/e_sr)
            band = (fr >= 4) & (fr <= 40)
            pw = np.abs(F)**2
            depth = math.sqrt(2*pw[band].sum()/(np.sum(np.hanning(len(mod))**2)*len(mod)))
            out["warble_pct"] = round(100*depth, 1)
            if band.any(): out["warble_hz"] = round(float(fr[band][np.argmax(pw[band])]), 1)
    return out


def edges(x: np.ndarray, a: int, b: int) -> dict:
    ms = 44
    lv = frame_db(x, ms, ms)
    body = frame_db(x[a:b], 441, 441)
    ref = float(np.median(body))
    pk = lv.max()
    a_f, b_f = a//ms, b//ms
    out = {}
    lead = lv[:max(0, a_f-2)]
    tail = lv[b_f+2:]
    out["lead_click_db"] = round(float(lead.max()-ref), 1) if len(lead) else None
    out["tail_click_db"] = round(float(tail.max()-ref), 1) if len(tail) else None
    above40 = np.flatnonzero(lv > pk-40)
    above10 = np.flatnonzero(lv > pk-10)
    out["onset_ms"] = int(above10[0]-above40[0])
    out["offset_ms"] = int(above40[-1]-above10[-1])
    d2 = np.abs(np.diff(x, 2))
    loc = np.sqrt(np.convolve(d2**2, np.ones(220)/220, "same")) + 1e-6
    ratio = d2/loc
    audible = np.convolve(np.abs(x[1:-1]), np.ones(441)/441, "same") > 10**((pk-50)/20)
    ratio[~audible] = 0
    k = int(np.argmax(ratio))
    out["click_ratio"] = round(float(ratio[k]), 1)
    out["click_at_ms"] = round(k/SR*1000)
    return out


def measure(path: Path) -> dict:
    x = load(path)
    a, b = active(x)
    y = x[a:b]
    m = {"file": str(path.relative_to(ROOT)), "dur_ms": round(len(x)/SR*1000), "active_ms": round((b-a)/SR*1000)}
    m.update(noise_texture(y))
    p16 = periodicity16(y)
    kurts = p16.pop("_kurts", [])
    m.update(p16)
    m.update(praat(x, a, b))
    if m.get("voiced_ms", 0) >= 30 and kurts:
        # kurtosis over the frames where Praat hears voicing is close enough to "all loud frames" for a steady sound
        m["kurt"] = round(float(np.median(kurts)), 1)
    m.update(flux_env(y))
    m.update(edges(x, a, b))
    return m


# ---------- plots

def spectro_png(x: np.ndarray, title: str, sub: str, out: Path, note: str = ""):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    t = np.arange(len(x))/SR
    fig, ax = plt.subplots(3, 1, figsize=(10, 8.2), sharex=True, gridspec_kw={"height_ratios": [1, 2.2, 2.2]})
    ax[0].plot(t*1000, x, lw=.5, color="#333")
    ax[0].set_ylim(-1, 1)
    ax[0].set_ylabel("wave")
    for axis, n, hop, label in ((ax[1], 256, 32, "wideband 5.8 ms"), (ax[2], 2048, 64, "narrowband 46 ms")):
        f, tt, S = ss.spectrogram(np.r_[np.zeros(n//2), x, np.zeros(n//2)], SR, window="hann", nperseg=n,
                                  noverlap=n-hop, mode="psd")
        D = 10*np.log10(S+1e-14)
        axis.pcolormesh((tt-n/2/SR)*1000, f/1000, D, vmin=D.max()-75, vmax=D.max(), cmap="magma", shading="auto")
        axis.set_ylim(0, 11)
        axis.set_ylabel(f"kHz ({label})")
    ax[2].set_xlabel("ms")
    fig.suptitle(title, x=.01, ha="left", fontsize=13, fontweight="bold")
    fig.text(.01, .935, sub, fontsize=9, ha="left")
    if note: fig.text(.01, .005, note, fontsize=7.5, ha="left", family="monospace")
    fig.tight_layout(rect=(0, .04 if note else 0, 1, .93))
    fig.savefig(out, dpi=90)
    plt.close(fig)


def compare_png(items: list[tuple[str, Path]], out: Path, fmax: float = 11, n: int = 2048, hop: int = 64,
                title: str = ""):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    xs = [load(p) for _, p in items]
    tmax = max(len(x) for x in xs)/SR*1000
    fig, ax = plt.subplots(len(items), 1, figsize=(10, 2.1*len(items)), sharex=True)
    for axis, (label, _), x in zip(ax, items, xs):
        f, tt, S = ss.spectrogram(np.r_[np.zeros(n//2), x, np.zeros(n//2)], SR, window="hann", nperseg=n,
                                  noverlap=n-hop, mode="psd")
        D = 10*np.log10(S+1e-14)
        axis.pcolormesh((tt-n/2/SR)*1000, f/1000, D, vmin=D.max()-70, vmax=D.max(), cmap="magma", shading="auto")
        axis.set_ylim(0, fmax)
        axis.set_xlim(0, tmax)
        axis.set_ylabel("kHz")
        axis.text(.005, .93, label, transform=axis.transAxes, color="w", fontsize=9, va="top",
                  bbox=dict(fc="black", alpha=.55, lw=0))
    ax[-1].set_xlabel("ms")
    if title: fig.suptitle(title, fontsize=11)
    fig.tight_layout()
    fig.savefig(out, dpi=90)
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plots", action="store_true")
    args = ap.parse_args()
    res = {"sounds": {}, "controls": {}}
    for id in IDS:
        m = measure(ROOT/"public/a/p"/f"{id}.mp3")
        m["provenance"] = PROVENANCE[id]
        m["class"] = "unvoiced" if id in UNVOICED else "voiced"
        res["sounds"][id] = m
        print(id, json.dumps({k: v for k, v in m.items() if k not in ("file", "provenance")}))
    ctl = sorted((RUN/"controls").glob("*.mp3"))
    for p in ctl:
        m = measure(p)
        res["controls"][p.stem] = m
        print("ctl", p.stem, json.dumps({k: v for k, v in m.items() if k != "file"}))
    for extra, p in (("h.original-tts", ROOT/"playtest/phonemes/before/h.mp3"),):
        if p.exists():
            res["controls"][extra] = measure(p)
    (RUN/"metrics.json").write_text(json.dumps(res, indent=1) + "\n")
    if args.plots:
        sp = RUN/"spectro"
        sp.mkdir(parents=True, exist_ok=True)
        keys = ("noise_std_db", "persist_r", "tonal_z_max", "voiced_ms", "hnr_db", "cpp_db", "resid_r", "kurt",
                "flux_db", "flux_spike", "flux_period_r", "env_buzz_r", "warble_pct", "click_ratio")
        def note(m):
            return "  ".join(f"{k}={m[k]}" for k in keys if m.get(k) is not None)
        for id, m in res["sounds"].items():
            spectro_png(load(ROOT/"public/a/p"/f"{id}.mp3"), f"/{id}/  public/a/p/{id}.mp3", m["provenance"],
                        sp/f"{id}.png", note(m))
        for name, m in res["controls"].items():
            p = ROOT/m["file"]
            spectro_png(load(p), f"control: {name}", m["file"], sp/f"ctl-{name}.png", note(m))
        C = RUN/"controls"
        compare_png([("/h/ in the game (hat cut, stretched 2.16x)", ROOT/"public/a/p/h.mp3"),
                     ("/h/ same hat cut, NOT stretched (control)", C/"h.natural.mp3"),
                     ("/s/ in the game (TTS, unstretched)", ROOT/"public/a/p/s.mp3"),
                     ("/f/ in the game (TTS, unstretched)", ROOT/"public/a/p/f.mp3"),
                     ("band-passed noise, 0.27 s (control)", C/"noise.natural.mp3"),
                     ("the same noise, 0.125 s stretched 2.16x like /h/ (control)", C/"noise.stretched.mp3")],
                    sp/"_compare-h-s-f.png", title="Narrowband (46 ms) spectrograms, 0–11 kHz")
        compare_png([("/h/ in the game (stretched)", ROOT/"public/a/p/h.mp3"),
                     ("/h/ not stretched (control)", C/"h.natural.mp3"),
                     ("noise stretched like /h/", C/"noise.stretched.mp3")],
                    sp/"_zoom-h-0-5k.png", fmax=5, n=4096, hop=64, title="/h/ zoom: 0–5 kHz, 93 ms window")
        rows = [(f"/{i}/ game (stretched)" if "STRETCHED" in PROVENANCE[i] else f"/{i}/ game", ROOT/"public/a/p"/f"{i}.mp3")
                for i in ("r", "oo", "air", "schwa", "ou")]
        pairs = []
        for label, p in rows:
            i = label.split("/")[1]
            pairs += [(label, p), (f"/{i}/ same cut, not stretched (control)", C/f"{i}.natural.mp3")]
        compare_png(pairs, sp/"_compare-stretched-vowels.png", fmax=6, title="Stretched clips vs the same cut unstretched, 0–6 kHz")
        compare_png([("/o/ old: 'dog' cut stretched to 0.4 s", C/"o.stretched.mp3"),
                     ("/o/ now: 'hop', natural length", ROOT/"public/a/p/o.mp3"),
                     ("/u/ old: 'cut' cut stretched to 0.4 s", C/"u.stretched.mp3"),
                     ("/u/ now: 'up', natural length", ROOT/"public/a/p/u.mp3")],
                    sp/"_compare-o-u.png", fmax=6, title="/o/ and /u/: old stretched vs now")


if __name__ == "__main__":
    main()
