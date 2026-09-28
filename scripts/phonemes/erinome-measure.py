#!/usr/bin/env python3
"""Measure every Erinome pure-sound candidate (scripts/phonemes/erinome-cut.py) and rank them per sound.

  uv run -q --with numpy --with scipy --with praat-parselmouth --with matplotlib --with faster-whisper \
    python scripts/phonemes/erinome-measure.py [ids...] [--whisper-top N] [--also DIR]

For each candidate: the stretch-artefact measures (scripts/phonemes/artefacts.py: noise texture, periodicity in noise,
tonal peaks, kurtosis, jitter, F0 wobble, flux, warble, edge clicks), the acoustic gate (scripts/phonemes/qa.py:
duration, voicing, formants, verdict), and a few extra checks the Sulafat lessons call for:
  post_voiced_ms  (stops) voiced frames more than 15 ms after the release: a vowel after the burst, a "duh"
  f3_hz           (ar, or, er, air, eer) the median F3 of the vowel; r-colouring pulls F3 down (British has none)
  length_ok       short vowels 0.12-0.26 s; held sounds 0.35-0.85 s; /h/ 0.12-0.35 s; stops under 0.25 s
Whisper (faster-whisper base.en) transcribes the best N per sound (default 6) for letter names.
Writes playtest/runs/pure-sounds-erinome/measures/<id>.json, rows sorted best first by `obj` (lower is better).
--also DIR measures DIR/<id>.mp3 too (the Sulafat clips, for comparison), stored under the key "ref".
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import artefacts  # noqa: E402
import qa  # noqa: E402

ROOT = HERE.parents[1]
WORK = ROOT / "playtest/runs/pure-sounds-erinome"
OUT = WORK / "measures"
SHORT_V = {"a", "e", "i", "o", "u", "uu", "schwa"}
LONG_V = {"ae", "ee", "ie", "oe", "oo", "ar", "or", "er", "ou", "oy", "ue", "air", "eer"}
UNV_CONT = {"s", "f", "sh", "th", "h"}
VD_CONT = {"m", "n", "ng", "l", "r", "v", "z", "zh", "dh"}
GLIDES = {"w", "y"}
VL_STOP = {"p", "t", "k", "ch"}
VD_STOP = {"b", "d", "g", "j"}
PAIRS = {"ks", "kw"}
R_VOWELS = {"ar", "or", "er", "air", "eer"}
# letter names and other giveaways Whisper might write for a pure sound (on top of qa.LETTER_NAMES)
NAMES = {"b": {"bee", "be", "b"}, "k": {"kay", "k", "okay", "ok"}, "h": {"aitch", "haitch", "h", "age"},
         "s": {"ess", "s", "yes", "as"}, "r": {"ar", "are", "r", "our"}, "d": {"dee", "d", "the", "duh"},
         "g": {"gee", "g", "jee"}, "j": {"jay", "j"}, "p": {"pee", "p"}, "t": {"tee", "t", "tea"},
         "f": {"eff", "f"}, "l": {"el", "ell", "l"}, "m": {"em", "m"}, "n": {"en", "n", "and"},
         "v": {"vee", "v"}, "z": {"zed", "zee", "z"}, "w": {"double you", "w"}, "y": {"why", "y"},
         "ks": {"ex", "x"}, "kw": {"queue", "q"}, "o": {"oh", "o"}, "a": {"ay", "a", "eh"}, "e": {"ee", "e"},
         "i": {"eye", "i", "aye"}, "u": {"you", "u"}}


def _py(o):
    """numpy scalars to Python ones for json"""
    return o.item() if hasattr(o, "item") else str(o)


def load24(path: Path) -> np.ndarray:
    import subprocess
    raw = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", "24000",
                          "-f", "f32le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def extras(id: str, path: Path) -> dict:
    import parselmouth
    x = load24(path)
    sr = 24000
    hop = 120
    n = max(1, (len(x) - 600) // hop)
    db = np.array([10 * np.log10(np.mean(x[i * hop:i * hop + 600] ** 2) + 1e-12) for i in range(n)])
    pk = db.max()
    act = np.flatnonzero(db > pk - 40)
    out: dict = {"active_s": round((act[-1] - act[0] + 5) * .005, 3) if len(act) else 0}
    snd = parselmouth.Sound(x, sr)
    if id in VL_STOP | VD_STOP | PAIRS:
        pitch = snd.to_pitch_ac(time_step=.005, pitch_floor=60, pitch_ceiling=500, voicing_threshold=.35,
                                silence_threshold=.01)
        t = (np.arange(n) * hop + 300) / sr
        f0 = np.nan_to_num(np.array([pitch.get_value_at_time(float(tt)) for tt in t]))
        voiced = (f0 > 0) & (db > pk - 30)
        jump = np.r_[0, 0, db[2:] - db[:-2]]
        k = int(np.argmax(jump[: max(3, n)]))
        out["burst_ms"] = round(k * 5)
        out["post_voiced_ms"] = int(voiced[k + 3:].sum() * 5)
        out["pre_voiced_ms"] = int(voiced[:k].sum() * 5)
        # the loudest voiced stretch after the burst, relative to the burst's level: a vowel is loud
        after = db[k + 3:][voiced[k + 3:]]
        out["post_voiced_rel_db"] = round(float(after.max() - db[k]), 1) if len(after) else None
    if id in R_VOWELS:
        fm = snd.to_formant_burg(time_step=.005, max_number_of_formants=5, maximum_formant=5800, window_length=.025)
        ts = [(i * hop + 300) / sr for i in range(n) if db[i] > pk - 15]
        f3 = [fm.get_value_at_time(3, t) for t in ts]
        f3 = [v for v in f3 if v and math.isfinite(v)]
        out["f3_hz"] = int(np.median(f3)) if f3 else None
        out["f3_min_hz"] = int(np.percentile(f3, 10)) if f3 else None
    return out


def length_ok(id: str, s: float) -> bool:
    if id in SHORT_V: return .10 <= s <= .27
    # 27 Sep: every lengthened Erinome /ɹ/ (a held take, WORLD) was judged robotic, as the stretched Sulafat one was
    # by Jonas; a natural /ɹ/ cut from a plain word is 0.12-0.3 s, and that is allowed
    if id == "r": return .12 <= s <= .86
    if id == "h": return .12 <= s <= .36
    if id in UNV_CONT | VD_CONT: return .35 <= s <= .86
    if id in LONG_V: return .30 <= s <= .80
    if id in GLIDES: return .25 <= s <= .70
    if id in {"ch", "j", "ks", "kw"}: return .05 <= s <= .40
    return .02 <= s <= .25


def one(args):
    id, row = args
    p = ROOT / row["file"]
    try:
        am = artefacts.measure(p)
    except Exception as e:
        am = {"error": str(e)}
    try:
        qm = qa.measure(p)
        why = qa.verdict(id, qm)
    except Exception as e:
        qm, why = {}, [f"qa error {e}"]
    ex = extras(id, p)
    return {**row, "art": am, "qa": {"verdict": "FAIL" if why else "PASS", "reasons": why,
                                     "active_ms": qm.get("active_ms"), "voiced_ms": qm.get("voiced_ms"),
                                     "longest_voiced_ms": qm.get("longest_voiced_ms"),
                                     "formants": qm.get("formants_hz"), "intensity": qm.get("intensity")},
            "ex": ex, "length_ok": bool(length_ok(id, float(ex["active_s"])))}


def objective(id: str, r: dict) -> tuple[float, list[str]]:
    """Lower is better. Penalties in rough 'points', with the reasons."""
    p, why = 0.0, []
    a, q, ex = r["art"], r["qa"], r["ex"]
    def pen(v, msg):
        nonlocal p
        p += v
        why.append(f"{msg} (+{v:.1f})")
    if q["verdict"] != "PASS": pen(6 + 2 * len(q["reasons"]), "qa: " + "; ".join(q["reasons"]))
    if not r["length_ok"]: pen(5, f"length {ex['active_s']} s")
    if r["how"] == "natural-short" and id in UNV_CONT | VD_CONT and not (id == "r" and r["length_ok"]):
        pen(4, "held sound too short")
    if r["how"] in ("noise-shaped", "noise-grains", "world"): pen(1.0, "lengthened")
    lc, tc = a.get("lead_click_db"), a.get("tail_click_db")
    if lc is not None and lc > -30: pen((lc + 30) / 5, f"lead click {lc} dB")
    if tc is not None and tc > -30: pen((tc + 30) / 5, f"tail click {tc} dB")
    if (a.get("click_ratio") or 0) > 8: pen((a["click_ratio"] - 8) / 2, f"click ratio {a['click_ratio']}")
    if id in UNV_CONT or id in VL_STOP or id == "ks":
        vm = a.get("voiced_ms") or 0
        if vm > 10: pen(min(8, vm / 15), f"{vm} ms voiced in an unvoiced sound")
        ns = a.get("noise_std_db")
        if ns is not None and id in UNV_CONT and ns > 6.6: pen((ns - 6.6) * 2, f"noise std {ns} dB (tonal/phasey)")
        pr = a.get("persist_r")
        if pr is not None and pr > .08: pen((pr - .08) * 20, f"persistent spectral detail {pr}")
        tz = a.get("tonal_z_max")
        if tz is not None and tz > 5.5: pen((tz - 5.5) / 2, f"tonal peak z {tz}")
        rr = a.get("resid_r")
        if rr is not None and rr > .16: pen((rr - .16) * 20, f"residual periodicity {rr}")
        wb = a.get("warble_pct")
        if wb is not None and wb > 16 and id != "h": pen((wb - 16) / 6, f"warble {wb}%")
    if id in VD_CONT | SHORT_V | LONG_V | GLIDES:
        k = a.get("kurt")
        if k is not None and k < 3.6: pen((3.6 - k) * 2, f"low pulse kurtosis {k} (smeared, phasey)")
        w = a.get("f0_wobble_st")
        if w is not None and w < .03: pen((.03 - w) * 100, f"flat pitch {w} st")
        j = a.get("jitter_pct")
        if j is not None and j > 4: pen((j - 4) / 2, f"jitter {j}%")
        wb = a.get("warble_pct")
        if wb is not None and wb > 25: pen((wb - 25) / 5, f"warble {wb}%")
        fp = a.get("flux_period_r")
        if fp is not None and fp > .6: pen((fp - .6) * 10, f"looped flux {fp}")
    if id in VL_STOP | VD_STOP | PAIRS:
        pv = ex.get("post_voiced_ms", 0)
        lim = {"kw": 70, "j": 40, "b": 25, "d": 25, "g": 25}.get(id, 10)
        if pv > lim: pen(min(10, (pv - lim) / 8), f"{pv} ms voiced after the release (a vowel?)")
        if id in VD_STOP and ex.get("pre_voiced_ms", 0) < 10 and pv < 10: pen(1.5, "no voicing at all in a voiced stop")
    if id in R_VOWELS and ex.get("f3_hz"):
        if ex["f3_hz"] < 2300: pen((2300 - ex["f3_hz"]) / 100, f"F3 {ex['f3_hz']} Hz (r-coloured?)")
    wh = r.get("whisper")
    if wh is not None:
        heard = re.sub(r"[^a-z ]", "", wh.lower()).strip()
        if heard and (heard in NAMES.get(id, set()) or qa.letter_name(id, wh)):
            pen(8, f"Whisper hears a letter name {wh!r}")
    return round(p, 2), why


def whisper_file(model, path: Path) -> str:
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "a.wav"
        # 400 ms of silence either side: Whisper misses a sound that starts at once
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(path),
                        "-af", "adelay=400,apad=pad_dur=0.4", "-ac", "1", "-ar", "16000", str(wav)], check=True)
        # a pure sound is a word at most; the cap stops Whisper hallucinating for minutes on a hiss
        segs, _ = model.transcribe(str(wav), language="en", beam_size=1, condition_on_previous_text=False,
                                   no_speech_threshold=.3, max_new_tokens=24)
        return " ".join(s.text.strip() for s in segs).strip()


def whisper_list(list_file: Path, ids: list[str] | None = None):
    """Whisper every clip in a shortlist (erinome-pick.py --shortlist) that has no transcription yet, in place in
    measures/<id>.json (resumable: the measures are saved after each sound)."""
    from faster_whisper import WhisperModel
    model = WhisperModel("base.en", device="cpu", compute_type="int8", cpu_threads=4)
    want: dict[str, set] = {}
    for it in json.loads(list_file.read_text()):
        if not ids or it["id"] in ids: want.setdefault(it["id"], set()).add(it["file"])
    for id, files in want.items():
        rows = json.loads((OUT / f"{id}.json").read_text())
        n = 0
        for r in rows:
            if r["file"] in files and "whisper" not in r:
                r["whisper"] = whisper_file(model, ROOT / r["file"])
                r["obj"], r["why"] = objective(id, r)
                n += 1
        rows.sort(key=lambda r: r["obj"])
        (OUT / f"{id}.json").write_text(json.dumps(rows, indent=1, default=_py) + "\n")
        heard = [r["whisper"] for r in rows if r["file"] in files]
        print(f"{id:6} {n} whispered; heard {heard}", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--whisper-top", type=int, default=6)
    ap.add_argument("--whisper-list", type=Path, help="only Whisper the clips in this shortlist, in the saved measures")
    ap.add_argument("--jobs", type=int, default=6)
    ap.add_argument("--also", type=Path)
    args = ap.parse_args()
    if args.whisper_list:
        return whisper_list(args.whisper_list, args.ids)
    ids = args.ids or [p.name for p in sorted((WORK / "cand").iterdir()) if p.is_dir()]
    OUT.mkdir(parents=True, exist_ok=True)
    work = []
    for id in ids:
        rows = json.loads((WORK / "cand" / id / "manifest.json").read_text())
        work += [(id, r) for r in rows]
        if args.also and (args.also / f"{id}.mp3").exists():
            work.append((id, {"id": id, "file": str((args.also / f"{id}.mp3").resolve().relative_to(ROOT)),
                              "text": "(old clip)", "take": "-", "mode": "ref", "variant": "-", "how": "ref"}))
    print(f"measuring {len(work)} candidates", flush=True)
    res = []
    with ProcessPoolExecutor(args.jobs) as ex:
        for i, r in enumerate(ex.map(one, work, chunksize=4)):
            res.append(r)
            if (i + 1) % 100 == 0: print(f"{i + 1}/{len(work)}", flush=True)
    by: dict[str, list] = {}
    for r in res: by.setdefault(r["id"], []).append(r)
    for id, rows in by.items():
        for r in rows: r["obj"], r["why"] = objective(id, r)
        rows.sort(key=lambda r: r["obj"])
    for id, rows in by.items():  # keep the Whisper transcriptions of a previous run (same clip file)
        prev = OUT / f"{id}.json"
        if prev.exists():
            heard = {r["file"]: r["whisper"] for r in json.loads(prev.read_text()) if "whisper" in r}
            for r in rows:
                if r["file"] in heard:
                    r["whisper"] = heard[r["file"]]
                    r["obj"], r["why"] = objective(id, r)
            rows.sort(key=lambda r: r["obj"])
    for id, rows in by.items():  # saved before Whisper too, so an interrupted run keeps the measures
        (OUT / f"{id}.json").write_text(json.dumps(rows, indent=1, default=_py) + "\n")
    if args.whisper_top:
        from faster_whisper import WhisperModel
        model = WhisperModel("base.en", device="cpu", compute_type="int8", cpu_threads=4)
        import subprocess, tempfile
        for id, rows in by.items():
            for r in rows[: args.whisper_top] + [r for r in rows if r["mode"] == "ref"]:
                with tempfile.TemporaryDirectory() as td:
                    wav = Path(td) / "a.wav"
                    # 400 ms of silence either side: Whisper misses a sound that starts at once
                    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(ROOT / r["file"]),
                                    "-af", "adelay=400,apad=pad_dur=0.4", "-ac", "1", "-ar", "16000", str(wav)], check=True)
                    segs, _ = model.transcribe(str(wav), language="en", beam_size=1, condition_on_previous_text=False,
                                               no_speech_threshold=.3)
                    r["whisper"] = " ".join(s.text.strip() for s in segs).strip()
                r["obj"], r["why"] = objective(id, r)
            rows.sort(key=lambda r: r["obj"])
    for id, rows in by.items():
        (OUT / f"{id}.json").write_text(json.dumps(rows, indent=1, default=_py) + "\n")
        best = rows[0]
        print(f"{id:6} {len(rows):4} best {best['obj']:5} {best['text']} {best['take']} {best['mode']} {best['variant']} "
              f"{best['how']} {best['ex']['active_s']}s whisper={best.get('whisper')!r} | {'; '.join(best['why'])[:160]}")


if __name__ == "__main__":
    main()
