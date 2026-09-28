#!/usr/bin/env python3
"""Cut pure-sound candidates out of the Erinome source takes (27 Sep; scripts/phonemes/erinome-sources.ts).

  uv run -q --with numpy --with scipy --with praat-parselmouth --with soundfile --with pyworld --with "setuptools<81" \
    python scripts/phonemes/erinome-cut.py [ids...]

For every (sound, text, take) in erinome-plan.json it finds the sound in the take (per the text's mode) and writes one
wav per cut variant to playtest/runs/pure-sounds-erinome/cand/<id>/, with cand/<id>/manifest.json describing each.

The lessons from the Sulafat rebuild (Jonas's ear, 27 Sep) are rules here:
  - stops are a burst and a short release, never a vowel (the "dog" /d/ that included the vowel onset was "duh");
  - short vowels stay short, at their natural length (0.12-0.24 s): /o/ and /u/ stretched to 0.41 s were "or" and "ar";
  - unvoiced sounds are NEVER time-stretched (the stretched /h/ "quacked", the /s/ was "robotic"): a fricative that is
    too short is lengthened with fresh noise of its own spectrum, spliced into its middle (noise-grain extension);
  - a voiced continuant that is too short is lengthened by WORLD resynthesis (pyworld), its frames revisited in a slow
    random walk and its pitch given a natural drift and jitter, never a phase vocoder or PSOLA.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np
import parselmouth
import scipy.signal as ss
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "playtest/runs/pure-sounds-erinome"
SRC = WORK / "src"
CAND = WORK / "cand"
PLAN = json.loads((Path(__file__).parent / "erinome-plan.json").read_text())["sounds"]
SR = 24000
HOP = 120   # 5 ms
WIN = 600   # 25 ms

SHORT_V = {"a", "e", "i", "o", "u", "uu", "schwa"}
LONG_V = {"ae", "ee", "ie", "oe", "oo", "ar", "or", "er", "ou", "oy", "ue", "air", "eer"}
UNV_CONT = {"s", "f", "sh", "th", "h"}
VD_CONT = {"m", "n", "ng", "l", "r", "v", "z", "zh", "dh"}
GLIDES = {"w", "y"}
VL_STOP = {"p", "t", "k", "ch"}
VD_STOP = {"b", "d", "g", "j"}
PAIRS = {"ks", "kw"}
# the shortest a held sound should be (s); shorter natural cuts are lengthened to TARGET (noise or WORLD)
MIN_HOLD = {**{k: .40 for k in ("s", "f", "sh", "th")}, "h": .16,
            **{k: .40 for k in VD_CONT}}
TARGET = {**{k: .55 for k in ("s", "f", "sh", "th")}, "h": .22, **{k: .55 for k in VD_CONT}}
# a held sound longer than this is cut down (with a fade), never sped up
MAX_HOLD = {**{k: .80 for k in UNV_CONT | VD_CONT}, "h": .32}
SHORT_MAX = .24
# what the carrier word being cut starts with ("vowel", "h" or "cons"): set per text in main()
PLAN_TEXT: dict[str, str] = {}


def slug(t: str) -> str:
    out = []
    for c in t:
        if c.isascii() and c.isalnum(): out.append(c)
        elif c == ".": out.append("_d")
        elif c == "!": out.append("_x")
        elif c == "?": out.append("_q")
        elif c == " ": out.append("-")
        else: out.append(f"_u{ord(c):x}")
    return "".join(out)


def load(p: Path) -> np.ndarray:
    x, sr = sf.read(str(p), dtype="float64")
    if x.ndim > 1: x = x.mean(1)
    assert sr == SR, (p, sr)
    return x


# ---------------------------------------------------------------- analysis

class A:
    """Frame features at 5 ms: level (dB), voicing (Praat), high-band share, log-mel spectrum."""

    def __init__(self, x: np.ndarray):
        self.x = x
        n = max(1, 1 + (len(x) - WIN) // HOP)
        self.n = n
        idx = np.arange(WIN)[None, :] + HOP * np.arange(n)[:, None]
        idx = np.minimum(idx, len(x) - 1)
        fr = x[idx]
        self.db = 10 * np.log10(np.mean(fr ** 2, axis=1) + 1e-12)
        self.peak = float(self.db.max())
        self.t = (HOP * np.arange(n) + WIN / 2) / SR
        snd = parselmouth.Sound(x, SR)
        # Erinome's voice is low (115-160 Hz) and often creaky: Praat's default voicing threshold drops whole vowels
        pitch = snd.to_pitch_ac(time_step=HOP / SR, pitch_floor=60, pitch_ceiling=500, voicing_threshold=.35,
                                silence_threshold=.01)
        f0 = np.array([pitch.get_value_at_time(float(t)) for t in self.t])
        self.f0 = np.nan_to_num(f0, nan=0.0)
        v = (self.f0 > 0) & (self.db > self.peak - 40)
        # close voicing dropouts of up to 40 ms where the level stays within 20 dB of the peak (creak inside a vowel)
        idx = np.flatnonzero(v)
        for a, b in zip(idx[:-1], idx[1:]):
            if 1 < b - a <= 9 and (self.db[a:b] > self.peak - 20).all(): v[a:b] = True
        self.voiced = v
        spec = np.abs(np.fft.rfft(fr * np.hanning(WIN), axis=1)) ** 2
        freqs = np.fft.rfftfreq(WIN, 1 / SR)
        hi = spec[:, (freqs >= 2500) & (freqs < 11000)].sum(1)
        tot = spec[:, (freqs >= 80) & (freqs < 11000)].sum(1) + 1e-12
        self.hf = hi / tot
        # 24 mel bands 100 Hz - 10 kHz
        mel = lambda f: 2595 * np.log10(1 + f / 700)
        imel = lambda m: 700 * (10 ** (m / 2595) - 1)
        edges = imel(np.linspace(mel(100), mel(10000), 26))
        fb = np.zeros((24, len(freqs)))
        for k in range(24):
            lo, c, hi_ = edges[k], edges[k + 1], edges[k + 2]
            fb[k] = np.clip(np.minimum((freqs - lo) / (c - lo), (hi_ - freqs) / (hi_ - c)), 0, None)
        self.mel = 10 * np.log10(spec @ fb.T + 1e-10)
        self.active = self.db > max(self.peak - 45, -70)
        # the sound's extent: ignore isolated blips and clicks (a run of under 40 ms at the start, 25 ms at the end)
        rs = self.runs(self.active, gap=3)
        first = [r for r in rs if r[1] - r[0] + 1 >= 8] or rs
        last = [r for r in rs if r[1] - r[0] + 1 >= 5] or rs
        self.a0, self.a1 = (int(first[0][0]), int(last[-1][1])) if rs else (0, n - 1)

    def s(self, i: float) -> int:
        """frame index -> sample (frame start + half hop, i.e. near the frame centre minus the window's reach)"""
        return int(max(0, min(len(self.x), round(i * HOP + (WIN - HOP) / 2))))

    def runs(self, mask: np.ndarray, gap: int = 0) -> list[tuple[int, int]]:
        m = mask.copy()
        if gap:  # close gaps up to `gap` frames
            idx = np.flatnonzero(m)
            for a, b in zip(idx[:-1], idx[1:]):
                if 1 < b - a <= gap + 1: m[a:b] = True
        d = np.diff(np.r_[0, m.astype(int), 0])
        return list(zip(np.flatnonzero(d == 1), np.flatnonzero(d == -1) - 1))

    def voiced_runs(self, min_ms=40, rel_db=30):
        v = self.voiced & (self.db > self.peak - rel_db)
        return [(a, b) for a, b in self.runs(v, gap=2) if (b - a + 1) * 5 >= min_ms]

    def spec_dist(self, i: int, ref: np.ndarray) -> float:
        return float(np.sqrt(np.mean((self.mel[i] - ref) ** 2)))


# ---------------------------------------------------------------- cutting modes (return [(variant, a, b, info)] in samples)

def seg_iso(an: A, id: str):
    out = []
    a0, a1 = an.a0, an.a1
    if id in UNV_CONT:
        unv = an.active & ~(an.voiced & (an.db > an.peak - 25))
        rs = [(a, b) for a, b in an.runs(unv, gap=4)]
        if not rs: return []
        a, b = max(rs, key=lambda r: r[1] - r[0])
        out.append(("whole", an.s(a), an.s(b + 1), {}))
    elif id in VL_STOP | VD_STOP:
        return seg_stop_init(an, id, iso=True)
    elif id in GLIDES:
        return seg_glide(an, id)
    else:
        out.append(("whole", an.s(a0), an.s(a1 + 1), {}))
        if id in VD_CONT:
            c = stable_core(an, a0, a1)
            if c and (c[1] - c[0]) < (a1 - a0) * .85:
                out.append(("core", an.s(c[0]), an.s(c[1] + 1), {}))
        if id in SHORT_V:
            vr = an.voiced_runs(min_ms=30)
            if vr:
                a, b = max(vr, key=lambda r: an.db[r[0]:r[1] + 1].max())
                out.append(("voiced", an.s(a), an.s(b + 1), {}))
    return out


def stable_core(an: A, a: int, b: int):
    """The longest stretch of [a, b] whose spectrum stays within 5 dB rms of its own median."""
    if b - a < 12: return None
    ref = np.median(an.mel[a:b + 1], axis=0)
    ok = np.array([an.spec_dist(i, ref) < 5.0 and an.db[i] > an.peak - 30 for i in range(a, b + 1)])
    rs = an.runs(ok, gap=3)
    if not rs: return None
    s, e = max(rs, key=lambda r: r[1] - r[0])
    return a + s, a + e


def seg_init_vl(an: A, id: str):
    vr = [r for r in an.voiced_runs(min_ms=40, rel_db=25) if r[0] > an.a0 + 4]
    if not vr: return []
    v0 = vr[0][0]
    a0 = an.a0
    out = []
    for d in (0, 3):  # 0 or 15 ms before voicing
        b = v0 - d
        if b - a0 < 6: continue
        out.append((f"to-voicing-{d * 5}ms", an.s(a0), an.s(b), {"voicing_at": round(an.t[v0], 3)}))
    return out


def seg_final_vl(an: A, id: str):
    vr = [r for r in an.voiced_runs(min_ms=40, rel_db=25) if r[1] < an.a1 - 4]
    if not vr: return []
    v1 = vr[-1][1]
    out = []
    for d in (3, 7):  # 15 or 35 ms after the voicing
        a = v1 + d
        if an.a1 - a < 8: continue
        out.append((f"after-voicing-{d * 5}ms", an.s(a), an.s(an.a1 + 1), {"voicing_end": round(an.t[v1], 3)}))
    return out


def seg_init_hold(an: A, id: str):
    a0 = an.a0
    start = a0 + 8
    ref_end = a0 + 24
    if ref_end >= an.a1: return []
    t = None
    for _ in range(2):
        ref = np.median(an.mel[start:ref_end], axis=0)
        lvl = float(np.median(an.db[start:ref_end]))
        d = np.array([an.spec_dist(i, ref) for i in range(an.n)])
        d = np.convolve(d, np.ones(3) / 3, "same")
        t = None
        for i in range(ref_end, an.a1):
            if d[i] > 6.5 or an.db[i] > lvl + 6:
                t = i
                break
        if t is None: return []
        ref_end = max(start + 8, t - 8)
    out = []
    for m in (4, 9):  # 20 or 45 ms before the vowel's transition
        b = t - m
        if b - a0 < 20: continue
        out.append((f"hold-{m * 5}ms", an.s(a0), an.s(b), {"transition_at": round(an.t[t], 3)}))
    return out


def seg_final_vd(an: A, id: str):
    a1 = an.a1
    e = a1 - 6
    s = a1 - 22
    if s <= an.a0 + 10: return []
    t = None
    for _ in range(2):
        ref = np.median(an.mel[s:e], axis=0)
        lvl = float(np.median(an.db[s:e]))
        d = np.array([an.spec_dist(i, ref) for i in range(an.n)])
        d = np.convolve(d, np.ones(3) / 3, "same")
        t = None
        for i in range(s, an.a0, -1):
            if d[i] > 6.5 or an.db[i] > lvl + 6:
                t = i
                break
        if t is None: return []
        s = min(e - 8, t + 8)
    out = []
    for m in (4, 9):
        a = t + m
        if a1 - a < 16: continue
        out.append((f"after-vowel-{m * 5}ms", an.s(a), an.s(a1 + 1), {"transition_at": round(an.t[t], 3)}))
    return out


def burst_after(an: A, i0: int, i1: int):
    """The frame of the strongest level jump (a release) in [i0, i1)."""
    best, k = 0.0, None
    for i in range(max(i0, 2), min(i1, an.n)):
        j = an.db[i] - an.db[i - 2]
        if j > best: best, k = j, i
    return k, best


def refine_burst(an: A, k: int) -> int:
    """The burst's sample: the steepest 2 ms rise of the 1 ms envelope in frames k-3..k+2."""
    a, b = an.s(k - 3), an.s(k + 2)
    seg = np.abs(an.x[a:b])
    if len(seg) < 100: return an.s(k)
    env = np.convolve(seg, np.ones(24) / 24, "same")
    rise = env[48:] - env[:-48]
    j = int(np.argmax(rise))
    # step back to where this rise starts (the envelope within 20% of the local floor)
    floor = float(np.min(env[max(0, j - 72):j + 1])) if j > 0 else float(env[0])
    top = float(env[min(len(env) - 1, j + 48)])
    while j > 0 and env[j] > floor + .15 * (top - floor): j -= 1
    return a + j


def seg_stop_final(an: A, id: str):
    loud = an.db > an.peak - 15
    rs = an.runs(loud, gap=4)
    if not rs: return []
    vend = rs[-1][1] if len(rs) == 1 else max(rs, key=lambda r: an.db[r[0]:r[1] + 1].max())[1]
    k, jump = burst_after(an, vend + 6, an.a1 + 1)
    if k is None or jump < 6: return []
    b0 = refine_burst(an, k)
    # /dʒ/ has the short releases too (27 Sep): with 90 ms and more of frication the judge heard every Erinome /dʒ/ as /tʃ/
    caps = {"b": (35, 55, 90), "d": (35, 55, 90), "g": (40, 60, 100), "j": (45, 65, 90, 130, 170), "p": (60, 100, 140),
            "t": (60, 100, 140), "k": (70, 110, 160), "ch": (120, 160, 200)}.get(id, (60, 100, 140))
    last = an.s(an.a1 + 1)
    # a vowel after the release (a "uh"): voiced, loud frames more than 25 ms after the burst
    kb = int((b0 - (WIN - HOP) / 2) / HOP)
    for i in range(kb + 5, an.a1 + 1):
        if an.voiced[i] and an.db[i] > an.peak - 20:
            last = min(last, an.s(i))
            break
    out = []
    ends = sorted({min(last, b0 + int(ms / 1000 * SR)) for ms in caps})
    for e in ends:
        ms = round((e - b0) / SR * 1000)
        out.append((f"release-{ms}ms", b0 - int(.004 * SR), e, {"burst_at": round(b0 / SR, 3)}))
        if id in VD_STOP:
            cs = an.s(vend + 1)
            for bar in (30, 60):
                a = max(cs + int(.01 * SR), b0 - int(bar / 1000 * SR))
                if b0 - a > int(.012 * SR):
                    out.append((f"voicebar-{bar}ms-release-{ms}ms", a, e, {"burst_at": round(b0 / SR, 3)}))
    return out


def seg_stop_init(an: A, id: str, iso: bool = False):
    a0 = an.a0
    # an isolated take can start with a long voiced lead-in ("d" said "nd..."): look for the release anywhere in it
    k, jump = burst_after(an, a0, an.a1 if iso else a0 + 16)
    if k is None: k = a0
    b0 = refine_burst(an, k) if jump >= 6 else an.s(a0)
    vr = [r for r in an.voiced_runs(min_ms=30, rel_db=25) if an.s(r[1]) > b0 + int(.01 * SR)]
    v0 = an.s(vr[0][0]) if vr else an.s(an.a1 + 1)
    out = []
    pre = int(.004 * SR)
    if id in VL_STOP or id == "ks":
        for d in (0, 10):
            e = v0 - int(d / 1000 * SR)
            if e - b0 > int(.015 * SR):
                out.append((f"to-voicing-{d}ms", b0 - pre, min(e, b0 + int(.18 * SR)), {"burst_at": round(b0 / SR, 3)}))
        if iso and not vr:
            out.append(("whole", an.s(a0), an.s(an.a1 + 1), {}))
    elif id == "kw":
        for d in (0, 30, 60):
            e = v0 + int(d / 1000 * SR)
            out.append((f"voicing+{d}ms", b0 - pre, e, {"burst_at": round(b0 / SR, 3)}))
        if iso:
            out.append(("whole", an.s(a0), an.s(an.a1 + 1), {}))
    else:  # voiced stop / affricate: prevoicing, burst, a short release; never into the vowel
        loud = np.flatnonzero(an.db > an.peak - 10)
        vowel_on = an.s(loud[0]) if len(loud) else an.s(an.a1)
        start = max(an.s(a0), b0 - int(.06 * SR)) if an.s(a0) < b0 - pre else b0 - pre
        caps = (60, 90) if id == "j" else (15, 30)
        for ms in caps:
            e = min(b0 + int(ms / 1000 * SR), max(b0 + int(.008 * SR), vowel_on - int(.01 * SR)))
            out.append((f"burst+{ms}ms", start, e, {"burst_at": round(b0 / SR, 3)}))
        if id == "j" and not iso:
            # the Sulafat /dʒ/ that passed was the first 85 ms of "jam", into the voicing: the same, uncapped
            for ms in (85, 100):
                out.append((f"burst+{ms}ms-uncapped", start, b0 + int(ms / 1000 * SR), {"burst_at": round(b0 / SR, 3)}))
        if id == "j" and not iso and vr:
            # an initial /dʒ/ ("jam") is mostly voiceless frication that runs into the vowel's voicing: the vowel
            # onset caps the cuts above at ~55 ms, so also cut to 20 or 40 ms into the voicing (never the vowel's body)
            for d in (20, 40):
                out.append((f"voicing+{d}ms", start, min(v0 + int(d / 1000 * SR), vowel_on + int(.01 * SR)),
                            {"burst_at": round(b0 / SR, 3)}))
    return out


def formants(an: A, a: int, b: int):
    snd = parselmouth.Sound(an.x, SR)
    fm = snd.to_formant_burg(time_step=HOP / SR, max_number_of_formants=5, maximum_formant=5800, window_length=.025)
    F = np.array([[fm.get_value_at_time(n, float(an.t[i])) for n in (1, 2)] for i in range(a, b + 1)])
    return np.nan_to_num(F, nan=0.0)


def seg_vowel(an: A, id: str, tail: bool = False):
    """The vowel: the level-defined region (within 12 dB of the peak) around the loudest (or, with tail, the last)
    voiced stretch. A short vowel keeps its natural attack when the word starts with it or with /h/ (the variants
    "attack-*"), else starts 30 ms in, past the consonant's transition; it ends 20-40 ms before the level falls into
    the next consonant (whose transition that is), and is never longer than 0.24 s."""
    loud = an.db > an.peak - 12
    rs = [r for r in an.runs(loud, gap=3) if an.voiced[r[0]:r[1] + 1].mean() > .4]
    if not rs: return []
    a, b = rs[-1] if tail else max(rs, key=lambda r: an.db[r[0]:r[1] + 1].max())
    out = []
    first = PLAN_TEXT.get("first", "")
    if id in SHORT_V:
        natural_attack = first in ("vowel", "h")
        for back in (6,):  # 30 ms before the level falls
            e = b + 1 - back
            for L in (SHORT_MAX, .16):
                nf = int(L / .005)
                if natural_attack:
                    s0 = a
                    if e - s0 >= 18:
                        out.append((f"attack-{int(L * 1000)}-end{back * 5}", an.s(s0), an.s(min(e, s0 + nf)), {}))
                s0 = a + 6
                if e - s0 >= 18:
                    out.append((f"in30-{int(L * 1000)}-end{back * 5}", an.s(s0), an.s(min(e, s0 + nf)), {}))
    else:
        # a long vowel or diphthong: the whole vowel, from the loud onset (after any consonant) to where the level falls
        vb = b
        if tail:  # the word's end: let the vowel die away naturally
            while vb < an.n - 1 and an.db[vb + 1] > an.peak - 35: vb += 1
        for off in ((0, 6) if tail or PLAN_TEXT.get("first") not in ("vowel", "h") else (0,)):
            st = a + off
            en = vb if tail else b - 4
            if en - st < 16: continue
            out.append((f"{'tail' if tail else 'nucleus'}+{off * 5}ms", an.s(st), an.s(en + 1), {}))
    return out


def seg_vowel_f1(an: A, id: str):
    """A short vowel's nucleus found by its F1 (added 27 Sep): seg_vowel starts at the loudest voiced run, which in
    "sun", "nut" or "rub" begins with the consonant (the judge heard those cuts as /s/, /n/, /ɹ/). An open or mid
    vowel has F1 above ~420 Hz in this voice; /m n ŋ l ɹ/ and a fricative do not. The longest such run, from 10 ms
    after its start to 15 ms before its end, at most 0.16, 0.20 or 0.24 s."""
    snd = parselmouth.Sound(an.x, SR)
    fm = snd.to_formant_burg(time_step=HOP / SR, max_number_of_formants=5, maximum_formant=5500, window_length=.025)
    f1 = np.nan_to_num(np.array([fm.get_value_at_time(1, float(t)) for t in an.t]), nan=0.0)
    ok = an.voiced & (an.db > an.peak - 18) & (f1 > 420)
    rs = [r for r in an.runs(ok, gap=2) if r[1] - r[0] + 1 >= 14]
    if not rs: return []
    a, b = max(rs, key=lambda r: r[1] - r[0])
    s0, e = a + 2, b - 3
    out = []
    for L in (.16, .20, SHORT_MAX):
        nf = int(L / .005)
        if e - s0 < 14: break
        out.append((f"f1-{int(L * 1000)}", an.s(s0), an.s(min(e, s0 + nf)), {"f1_median_hz": int(np.median(f1[a:b + 1]))}))
        if e - s0 <= nf: break
    return out


def seg_medial(an: A, id: str):
    loud = an.voiced & (an.db > an.peak - 12)
    rs = an.runs(loud, gap=2)
    if len(rs) < 2: return []
    (a1, b1), (a2, b2) = rs[0], rs[1]
    dip0, dip1 = b1 + 1, a2 - 1
    if dip1 - dip0 < 6: return []
    out = []
    for m in (1, 3):
        out.append((f"dip-{m * 5}ms", an.s(dip0 + m), an.s(dip1 - m + 1), {}))
    return out


def seg_f3dip(an: A, id: str):
    """/ɹ/ in a plain word ("red.", "sorry."): British /ɹ/ pulls F3 far below the voice's usual ~2800 Hz, so the r is
    the longest voiced stretch whose F3 is under 2350 Hz. Added 27 Sep because every Erinome take asked to hold an r
    ("rrr", "rrrred") came out as a trill the blind judge called robotic (naturalness 2-3 of 10)."""
    snd = parselmouth.Sound(an.x, SR)
    fm = snd.to_formant_burg(time_step=HOP / SR, max_number_of_formants=5, maximum_formant=5500, window_length=.025)
    f3 = np.nan_to_num(np.array([fm.get_value_at_time(3, float(t)) for t in an.t]), nan=0.0)
    ok = an.voiced & (an.db > an.peak - 25) & (f3 > 1200) & (f3 < 2350)
    rs = [r for r in an.runs(ok, gap=2) if r[1] - r[0] + 1 >= 8]
    if not rs: return []
    a, b = max(rs, key=lambda r: r[1] - r[0])
    info = {"f3_median_hz": int(np.median(f3[a:b + 1]))}
    out = [("f3dip", an.s(a), an.s(b + 1), info)]
    if b - a >= 16: out.append(("f3dip-in10", an.s(a + 2), an.s(b - 1), info))
    return out


def seg_glide(an: A, id: str):
    a0, a1 = an.a0, an.a1
    out = [("whole", an.s(a0), an.s(a1 + 1), {})]
    if (a1 - a0) * .005 > .66:
        out.append(("cap620", an.s(a0), an.s(a0) + int(.62 * SR), {}))
    return out


MODES = {"iso": seg_iso, "init_vl": seg_init_vl, "final_vl": seg_final_vl, "init_hold": seg_init_hold,
         "final_vd": seg_final_vd, "stop_final": seg_stop_final, "stop_init": seg_stop_init,
         "vowel": seg_vowel, "tail_vowel": lambda an, id: seg_vowel(an, id, tail=True), "medial": seg_medial,
         "glide": seg_glide, "f3dip": seg_f3dip, "vowel_f1": seg_vowel_f1}


# ---------------------------------------------------------------- lengthening

def trim_quiet(y: np.ndarray, rel_db=-42) -> np.ndarray:
    n = 120
    if len(y) < 3 * n: return y
    e = np.array([10 * np.log10(np.mean(y[i:i + n] ** 2) + 1e-12) for i in range(0, len(y) - n + 1, n // 2)])
    ok = np.flatnonzero(e > e.max() + rel_db)
    if not len(ok): return y
    return y[ok[0] * (n // 2): min(len(y), ok[-1] * (n // 2) + n)]


def trim_click(y: np.ndarray) -> np.ndarray:
    """Drop a click or lip smack before the sound: a short burst in the first 30 ms that is louder than the 30 ms after
    it and is followed by a dip (TTS often puts one before a fricative)."""
    n = 48  # 2 ms
    if len(y) < 40 * n: return y
    e = np.array([10 * np.log10(np.mean(y[i:i + n] ** 2) + 1e-12) for i in range(0, 40 * n, n)])
    k = int(np.argmax(e[:15]))
    after = float(np.median(e[15:30]))
    if e[k] < after + 4: return y
    m = k + int(np.argmin(e[k:22]))
    if e[m] > e[k] - 6: return y
    return y[m * n:]


def noise_extend(y: np.ndarray, target_s: float, rng: np.random.Generator, how: str = "shaped") -> np.ndarray:
    """Lengthen a noise sound without stretching it: new noise, spliced into the middle with equal-power crossfades.
    shaped: Gaussian noise given the sound's own (smoothed) spectrum, frame by frame with random phase.
    grains: 30 ms sqrt-Hann grains drawn at random places (and polarity) from the sound's middle, 50% overlap."""
    need = int(target_s * SR) - len(y)
    if need <= 0: return y
    n = len(y)
    core = y[int(n * .2): int(n * .8)]
    rms = math.sqrt(float(np.mean(core ** 2)) + 1e-12)
    xf = int(.03 * SR)
    L = need + 2 * xf
    if how == "shaped":
        nfft = 512
        f, P = ss.welch(core, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
        # smooth over about 250 Hz so no single bin becomes a tone
        k = 5
        P = np.convolve(np.r_[np.full(k, P[0]), P, np.full(k, P[-1])], np.ones(2 * k + 1) / (2 * k + 1), "same")[k:-k]
        mag = np.sqrt(P)
        hop = nfft // 4
        frames = L // hop + 4
        win = np.hanning(nfft)
        out = np.zeros(frames * hop + nfft)
        norm = np.zeros_like(out)
        for i in range(frames):
            ph = rng.uniform(0, 2 * np.pi, len(mag))
            spec = mag * np.exp(1j * ph)
            g = np.fft.irfft(spec, nfft) * win
            out[i * hop:i * hop + nfft] += g
            norm[i * hop:i * hop + nfft] += win ** 2
        z = out / np.maximum(norm, 1e-6)
        z = z[nfft:nfft + L]
    else:
        g = int(.03 * SR)
        hop = g // 2
        w = np.sqrt(np.hanning(g + 1)[:g])
        count = L // hop + 3
        z = np.zeros(count * hop + g)
        for i in range(count):
            s = rng.integers(0, max(1, len(core) - g))
            z[i * hop:i * hop + g] += core[s:s + g] * w * rng.choice([-1, 1])
        z = z[g:g + L]
    # a slow natural drift of level (about +-0.7 dB over ~120 ms), not a steady machine hiss
    drift = np.cumsum(rng.normal(0, 1, L // 600 + 2))
    drift = np.interp(np.arange(L), np.linspace(0, L, len(drift)), drift)
    drift = (drift - drift.mean()) / (drift.std() + 1e-9) * .08
    z = z / (math.sqrt(float(np.mean(z ** 2))) + 1e-12) * rms * np.exp(drift)
    m = n // 2
    fin = np.sin(np.linspace(0, np.pi / 2, xf))
    fout = np.cos(np.linspace(0, np.pi / 2, xf))
    left = y[:m + xf // 2].copy()
    right = y[m - xf // 2:].copy()
    mid = z.copy()
    # equal-power crossfades (the signals are uncorrelated noise)
    head = left[-xf:] * fout + mid[:xf] * fin
    tailx = mid[-xf:] * fout + right[:xf] * fin
    return np.r_[left[:-xf], head, mid[xf:-xf], tailx, right[xf:]]


def world_extend(y: np.ndarray, target_s: float, rng: np.random.Generator) -> np.ndarray:
    """Resynthesise a voiced continuant with WORLD at `target_s`: its onset and offset frames as they were, the middle
    revisited in a slow random walk over its steady frames; F0 follows the walk plus a slow drift (+-0.25 st) and a
    little per-frame jitter, so it never goes flat."""
    import pyworld as pw
    fp = 5.0
    f0, t = pw.harvest(y, SR, f0_floor=80, f0_ceil=500, frame_period=fp)
    sp = pw.cheaptrick(y, f0, t, SR)
    ap = pw.d4c(y, f0, t, SR)
    n = len(f0)
    need = int(target_s * 1000 / fp)
    if need <= n:
        return pw.synthesize(f0, sp, ap, SR, fp)[:len(y)]
    c0, c1 = int(n * .25), int(n * .75)
    if c1 - c0 < 6: c0, c1 = max(1, n // 2 - 3), min(n - 1, n // 2 + 3)
    m = (c0 + c1) // 2
    extra = need - n
    walk = []
    pos, vel = float(m), 0.0
    for _ in range(extra):
        vel = .85 * vel + rng.normal(0, .35)
        vel = max(-1.0, min(1.0, vel))
        pos += vel
        if pos < c0: pos, vel = c0 + (c0 - pos), abs(vel)
        if pos > c1: pos, vel = c1 - (pos - c1), -abs(vel)
        walk.append(pos)
    idx = np.r_[np.arange(0, m), np.array(walk), np.arange(m, n)]
    lo = np.floor(idx).astype(int).clip(0, n - 1)
    hi = (lo + 1).clip(0, n - 1)
    fr = (idx - lo)[:, None]
    sp2 = np.exp((1 - fr) * np.log(sp[lo] + 1e-16) + fr * np.log(sp[hi] + 1e-16))
    ap2 = (1 - fr) * ap[lo] + fr * ap[hi]
    f02 = (1 - fr[:, 0]) * f0[lo] + fr[:, 0] * f0[hi]
    voiced = f02 > 0
    if voiced.any():
        drift = np.cumsum(rng.normal(0, 1, len(idx) // 20 + 2))
        drift = np.interp(np.arange(len(idx)), np.linspace(0, len(idx), len(drift)), drift)
        drift = (drift - drift.mean()) / (drift.std() + 1e-9) * .25  # semitones
        jit = rng.normal(0, .06, len(idx))  # semitones, frame to frame
        f02 = np.where(voiced, f02 * 2 ** ((drift + jit) / 12), 0)
    return pw.synthesize(np.ascontiguousarray(f02), np.ascontiguousarray(sp2), np.ascontiguousarray(ap2), SR, fp)


def world_resynth(y: np.ndarray) -> np.ndarray:
    import pyworld as pw
    f0, t = pw.harvest(y, SR, f0_floor=80, f0_ceil=500, frame_period=5.0)
    return pw.synthesize(f0, pw.cheaptrick(y, f0, t, SR), pw.d4c(y, f0, t, SR), SR, 5.0)[:len(y)]


# ---------------------------------------------------------------- finishing a candidate

def fade(y: np.ndarray, fin_ms: float, fout_ms: float) -> np.ndarray:
    y = y.copy()
    a = min(len(y) // 4, int(fin_ms / 1000 * SR))
    b = min(len(y) // 3, int(fout_ms / 1000 * SR))
    if a > 0: y[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if b > 0: y[-b:] *= np.cos(np.linspace(0, np.pi / 2, b)) ** 2
    return y


def finish(id: str, y: np.ndarray, natural_start: bool, natural_end: bool) -> np.ndarray:
    if id in VL_STOP | VD_STOP | PAIRS:
        y = fade(y, 1.5, 12)
    elif id in SHORT_V | LONG_V:
        y = fade(y, 6 if natural_start else 18, 25 if natural_end else 40)
    else:
        y = fade(y, 8 if natural_start else 20, 30 if natural_end else 45)
    pk = np.max(np.abs(y)) + 1e-9
    y = y / pk * 10 ** (-3 / 20)
    return np.r_[np.zeros(int(.04 * SR)), y, np.zeros(int(.06 * SR))]


def lengthen(id: str, y: np.ndarray, rng) -> list[tuple[str, np.ndarray]]:
    """[(how, y)]: the natural cut when it is long enough, else lengthened ones; a too-long hold is cut, not sped up."""
    L = len(y) / SR
    out = []
    if id in MAX_HOLD and L > MAX_HOLD[id]:
        y = y[:int(MAX_HOLD[id] * SR)]
        L = MAX_HOLD[id]
    if id in UNV_CONT:
        if L >= MIN_HOLD[id]:
            out.append(("natural", y))
        else:
            out.append(("natural-short", y))
            if L >= .05:
                out.append(("noise-shaped", noise_extend(y, TARGET[id], rng, "shaped")))
                out.append(("noise-grains", noise_extend(y, TARGET[id], rng, "grains")))
    elif id in VD_CONT:
        if L >= MIN_HOLD[id]:
            out.append(("natural", y))
        else:
            out.append(("natural-short", y))
            if L >= .05:
                try:
                    out.append(("world", world_extend(y, TARGET[id], rng)))
                except Exception as e:  # pragma: no cover
                    print("world failed", id, e, file=sys.stderr)
    elif id in SHORT_V:
        if L > .30: y = y[:int(SHORT_MAX * SR)]
        out.append(("natural", y))
    else:
        out.append(("natural", y))
    return out


def main():
    ids = sys.argv[1:] or list(PLAN)
    for id in ids:
        d = CAND / id
        d.mkdir(parents=True, exist_ok=True)
        rows = []
        rng = np.random.default_rng(abs(hash(id)) % 2**32)
        for text, mode in PLAN[id]:
            for src in sorted(SRC.glob(f"{slug(text)}.*.wav")):
                if src.name.endswith(".tmp"): continue
                take = src.stem.split(".")[-1]
                x = load(src)
                an = A(x)
                c0 = text.strip()[0].lower()
                PLAN_TEXT["first"] = "vowel" if c0 in "aeiou" else "h" if c0 == "h" else "cons"
                try:
                    segs = MODES[mode](an, id)
                except Exception as e:
                    print(f"{id} {text} {take} {mode}: {e}", file=sys.stderr)
                    continue
                for var, a, b, info in segs:
                    a, b = max(0, int(a)), min(len(x), int(b))
                    if b - a < int(.012 * SR): continue
                    y = x[a:b]
                    if id not in VL_STOP | VD_STOP | PAIRS: y = trim_click(trim_quiet(y))
                    nat_start = mode in ("iso", "glide", "init_vl", "init_hold", "stop_init") or var.startswith("attack")
                    nat_end = mode in ("iso", "glide", "final_vl", "final_vd", "stop_final", "tail_vowel")
                    if mode in ("f3dip", "vowel_f1"): nat_start = nat_end = False
                    for how, z in lengthen(id, y, rng):
                        out = finish(id, z, nat_start, nat_end)
                        name = f"{slug(text)}.{take}.{mode}.{var}.{how}.wav"
                        sf.write(str(d / name), out, SR, subtype="PCM_16")
                        rows.append({"id": id, "file": str((d / name).relative_to(ROOT)), "text": text, "take": take,
                                     "mode": mode, "variant": var, "how": how, "src": str(src.relative_to(ROOT)),
                                     "cut_s": [round(a / SR, 3), round(b / SR, 3)], "natural_s": round(len(y) / SR, 3),
                                     "dur_s": round(len(z) / SR, 3), **info})
        (d / "manifest.json").write_text(json.dumps(rows, indent=1) + "\n")
        print(f"{id}: {len(rows)} candidates")


if __name__ == "__main__":
    main()
