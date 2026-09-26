#!/usr/bin/env python3
"""Acoustic gate for the 46 British phonics clips.

Run: uv run --with numpy --with praat-parselmouth --with faster-whisper \
  python scripts/phonemes/qa.py [--before DIR] [--no-whisper]

Measurements are evidence, not phonetic recognition: a human must still listen.
The vowel boxes are deliberately broad for Sulafat's higher female formants.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import re
import subprocess
import tempfile

import numpy as np
import parselmouth

ROOT = Path(__file__).resolve().parents[2]
IDS = ("a i m s t n o p b k g h d e f v l r u j w z ks y sh ch th dh ng kw "
       "ae ee ie oe oo ar or er ou oy ue uu air eer zh schwa").split()
VOICELESS_STOPS = {"p", "t", "k", "ch"}
VOICED_STOPS = {"b", "d", "g", "j"}
UNVOICED_CONT = {"s", "f", "sh", "th", "h"}
VOICED_CONT = {"m", "n", "l", "r", "v", "z", "w", "y", "ng", "zh", "dh"}
PAIRS = {"ks", "kw"}
SHORT = {"a", "e", "i", "o", "u", "uu", "schwa"}
MONO_LONG = {"ee", "oo", "ar", "or", "er"}
DIP = {"ae", "ie", "oe", "ou", "oy", "ue", "air", "eer"}
# Southern British vowel nuclei: female connected-speech means in Deterding (1997),
# JIPA 27:47–55, Table 2 (e.g. /ɪ/ 384/2174, /æ/ 1018/1799,
# /ɒ/ 751/1215, /ʌ/ 914/1459, /uː/ 328/1437 Hz).
# https://repository.nie.edu.sg/server/api/core/bitstreams/846cf9d9-c799-4773-a96a-0026e608613c/content
# The boxes are deliberately wider for this female voice, context and Praat variance;
# diphthongs additionally need the expected direction of movement.
# Hz: (F1 min/max, F2 min/max). The trajectory test below handles diphthongs.
VOWEL_BOX = {
    "a": (590, 1100, 1300, 2600), "e": (400, 850, 1550, 2900),
    "i": (260, 670, 1650, 3100), "o": (450, 1050, 650, 1750),
    "u": (420, 980, 850, 2050), "uu": (250, 700, 600, 1900),
    "schwa": (250, 900, 850, 2350), "ee": (220, 600, 1800, 3500),
    "oo": (200, 680, 400, 2100), "ar": (550, 1100, 650, 1850),
    "or": (330, 830, 550, 1650), "er": (300, 850, 900, 2400),
    "ae": (350, 850, 1250, 2900), "ie": (400, 1150, 950, 3000),
    "oe": (250, 850, 650, 2500), "ou": (400, 1150, 650, 2600),
    "oy": (300, 900, 650, 2850), "ue": (200, 800, 450, 3400),
    "air": (350, 950, 1150, 2900), "eer": (250, 750, 1100, 3100),
}
LETTER_NAMES = {
    "a": {"a", "ay", "eh"}, "b": {"b", "bee", "be"}, "k": {"k", "kay", "kei"},
    "d": {"d", "dee"}, "e": {"e", "ee"}, "f": {"f", "eff"}, "g": {"g", "gee"},
    "h": {"h", "aitch", "haitch"}, "i": {"i", "eye"}, "j": {"j", "jay"},
    "l": {"l", "el", "ell"}, "m": {"m", "em"}, "n": {"n", "en"},
    "o": {"o", "oh"}, "p": {"p", "pee"}, "r": {"r", "ar", "are"},
    "s": {"s", "ess"}, "t": {"t", "tee"}, "u": {"u", "you"},
    "v": {"v", "vee"}, "w": {"w", "double u", "double you"},
    "y": {"y", "why"}, "z": {"z", "zed", "zee"}, "ks": {"x", "ex"},
    "kw": {"q", "queue"},
}


def decode(path: Path, out: Path) -> None:
    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(path),
                    "-ac", "1", "-ar", "44100", str(out)], check=True)


def _median(values):
    good = np.asarray([v for v in values if math.isfinite(v) and v > 0])
    return round(float(np.median(good))) if len(good) else None


def measure(path: Path) -> dict:
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "a.wav"
        decode(path, wav)
        sound = parselmouth.Sound(str(wav))
        sr = sound.sampling_frequency
        x = sound.values[0]
        hop = round(.010 * sr)
        width = round(.020 * sr)
        centers = np.arange(width // 2, len(x) - width // 2, hop)
        if not len(centers):
            raise ValueError("empty audio")
        rms = np.array([np.sqrt(np.mean(x[c-width//2:c+width//2]**2)) for c in centers])
        db = 20 * np.log10(np.maximum(rms, 1e-7))
        peak = float(np.max(db))
        active = db > max(peak - 32, -48)
        where = np.where(active)[0]
        if not len(where):
            raise ValueError("no audible segment")
        lo, hi = int(where[0]), int(where[-1])
        time = centers / sr
        pitch = sound.to_pitch_ac(time_step=.010, pitch_floor=75, pitch_ceiling=600)
        voiced = np.array([active[i] and pitch.get_value_at_time(float(t)) > 0
                           for i, t in enumerate(time)])
        runs = np.diff(np.r_[False, voiced, False].astype(int))
        starts, ends = np.where(runs == 1)[0], np.where(runs == -1)[0]
        longest = int(np.max(ends - starts)) if len(starts) else 0
        # Exclude turn-on/off; compare successive 50 ms windows to find consonant/vowel level steps.
        steps = []
        for i in range(lo + 5, hi - 4):
            left = float(np.median(db[i-5:i]))
            right = float(np.median(db[i:i+5]))
            steps.append((round(right-left, 1), round(float(time[i]-time[lo]), 3)))
        central = [(v, t) for v, t in steps if .12 < t < (time[hi]-time[lo]-.10)]
        rise = max(central, default=(0, 0))
        fall = min(central, default=(0, 0))
        formant = sound.to_formant_burg(time_step=.010, max_number_of_formants=5,
                                       maximum_formant=6200, window_length=.025, pre_emphasis_from=50)
        def sample(a, b):
            indices = [i for i in range(lo, hi+1) if a <= (i-lo)/max(1,hi-lo) <= b and active[i]]
            return [_median(formant.get_value_at_time(n, float(time[i])) for i in indices)
                    for n in (1, 2)]
        f_early, f_mid, f_late = sample(.12,.35), sample(.35,.65), sample(.65,.88)
        def delta(a,b):
            return round(b-a) if a is not None and b is not None else None
        return {
            "duration_ms": round(1000*len(x)/sr),
            "active_ms": round(1000*(time[hi]-time[lo]+.010)),
            "voiced_ms": int(np.sum(voiced)*10), "longest_voiced_ms": longest*10,
            "intensity": {"median_dbfs": round(float(np.median(db[lo:hi+1])),1),
                          "rise_db": rise[0], "rise_at_ms": round(rise[1]*1000),
                          "fall_db": fall[0], "fall_at_ms": round(fall[1]*1000)},
            "formants_hz": {"early":f_early, "middle":f_mid, "late":f_late,
                            "f1_change":delta(f_early[0],f_late[0]),
                            "f2_change":delta(f_early[1],f_late[1])},
        }


def verdict(id: str, m: dict) -> list[str]:
    reasons = []
    dur, vd = m["active_ms"], m["voiced_ms"]
    longest = m["longest_voiced_ms"]
    rise, fall = m["intensity"]["rise_db"], m["intensity"]["fall_db"]
    fm = m["formants_hz"]
    f1, f2 = fm["middle"]
    f1d, f2d = fm["f1_change"], fm["f2_change"]
    if id in VOICELESS_STOPS | VOICED_STOPS:
        if dur > (175 if id in {"ch","j"} else 120):
            reasons.append(f"stop/affricate is {dur} ms (limit {'175' if id in {'ch','j'} else '120'} ms)")
        limit = 60 if id in VOICELESS_STOPS else 100
        if vd > limit: reasons.append(f"{vd} ms voiced (limit {limit} ms)")
        if longest > limit: reasons.append(f"{longest} ms continuous voicing indicates a following vowel")
    elif id in UNVOICED_CONT:
        if vd > 65: reasons.append(f"{vd} ms voiced in voiceless continuant")
        if dur < (45 if id == "h" else 100): reasons.append(f"fricative too short: {dur} ms")
        if rise > 9: reasons.append(f"{rise} dB internal rise suggests a following vowel")
    elif id in VOICED_CONT:
        if dur < 140 or dur > 900: reasons.append(f"continuant duration {dur} ms outside 140–900 ms")
        if id not in {"w", "y"} and longest < min(100, dur*.4):
            reasons.append(f"voiced continuant has only {longest} ms sustained voicing")
        if id not in {"w", "y"} and (rise > 9 or fall < -9):
            reasons.append(f"internal intensity step {rise:+.1f}/{fall:+.1f} dB suggests an attached vowel")
        # Nasals have weak/unstable F1; for oral voiced continuants, a large formant
        # move paired with an intensity step is strong evidence of an extra vowel.
        if id in {"l","r","v","z","zh","dh"} and f2d is not None and abs(f2d)>650 and (rise>5 or fall < -5):
            reasons.append(f"F2 moves {f2d:+d} Hz with a level step (possible vowel)")
        if id == "r" and f1d is not None and f2d is not None and f1d > 450 and f2d > 650:
            reasons.append(f"F1/F2 rise {f1d:+d}/{f2d:+d} Hz indicates /r/ moving into a vowel")
        if id == "w" and fm["late"][0] is not None and f1d is not None and fm["late"][0] > 900 and f1d > 450:
            reasons.append(f"late F1 {fm['late'][0]} Hz indicates an open vowel after /w/ (target wwoo)")
    elif id in PAIRS:
        if dur < 90 or dur > 500: reasons.append(f"two-sound segment duration {dur} ms outside 90–500 ms")
        if vd > 100: reasons.append(f"{vd} ms voicing in /{id}/ pair")
    else:
        low1, high1, low2, high2 = VOWEL_BOX[id]
        if dur < 110 or dur > (900 if id in DIP | MONO_LONG else 650):
            reasons.append(f"vowel duration {dur} ms outside expected range")
        if f1 is None or f2 is None:
            reasons.append("unreliable vowel formants")
        elif not (low1 <= f1 <= high1 and low2 <= f2 <= high2):
            reasons.append(f"F1/F2 {f1}/{f2} Hz outside /{id}/ target {low1}–{high1}/{low2}–{high2}")
        if id in SHORT | MONO_LONG:
            if f2d is not None and abs(f2d) > (550 if id in SHORT else 650):
                reasons.append(f"F2 moves {f2d:+d} Hz: diphthong rather than steady /{id}/")
            if f1d is not None and abs(f1d) > (310 if id in SHORT else 360):
                reasons.append(f"F1 moves {f1d:+d} Hz: not a steady vowel")
        elif id in {"ie", "oy"} and f2d is not None and f2d < 250:
            reasons.append(f"F2 rise {f2d:+d} Hz is too small for /{id}/")
        elif id in {"oe", "ou", "ue"} and f2d is not None and f2d > -150:
            reasons.append(f"F2 fall {f2d:+d} Hz is too small for /{id}/")
        elif id == "ae" and f2d is not None and f2d < 150 and (f1d is None or f1d > -130):
            reasons.append("/eɪ/ has no clear closing movement")
    return reasons


def whisper_transcribe(paths: dict[str, Path], model_name: str) -> dict[str, str]:
    from faster_whisper import WhisperModel
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    result = {}
    for id, path in paths.items():
        with tempfile.TemporaryDirectory() as td:
            wav = Path(td)/"a.wav"
            decode(path, wav)
            segments, _ = model.transcribe(str(wav), language="en", beam_size=1,
                                           condition_on_previous_text=False,
                                           no_speech_threshold=.3)
            result[id] = " ".join(seg.text.strip() for seg in segments).strip()
    return result


def letter_name(id: str, transcription: str) -> bool:
    if id not in LETTER_NAMES: return False
    heard = re.sub(r"[^a-z ]", "", transcription.lower()).strip()
    return heard in LETTER_NAMES[id]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--before", type=Path, help="directory of archived original MP3s")
    ap.add_argument("--clips-dir", type=Path, default=ROOT/"public/a/p")
    ap.add_argument("--output", type=Path, default=ROOT/"playtest/phonemes/qa.json")
    ap.add_argument("--no-whisper", action="store_true")
    ap.add_argument("--model", default="tiny.en", help="faster-whisper model")
    args = ap.parse_args()
    clips = {id: args.clips_dir/f"{id}.mp3" for id in IDS}
    before = ({id: (args.before/f"{id}.mp3" if (args.before/f"{id}.mp3").exists() else clips[id])
               for id in IDS} if args.before else {})
    paths = {**clips, **{f"before:{id}": p for id,p in before.items() if p != clips[id]}}
    transcriptions = {} if args.no_whisper else whisper_transcribe(paths, args.model)
    out = {"method": "Praat autocorrelation pitch, 10 ms intensity, Burg F1/F2; faster-whisper secondary",
           "vowel_reference": "Deterding (1997), JIPA 27:47–55, Table 2; female Standard Southern British means with widened QA boxes",
           "model": None if args.no_whisper else args.model, "clips": {}}
    for id in IDS:
        entry = {}
        for stage, path in (("before",before.get(id)),("after",clips[id])):
            if not path or not path.exists(): continue
            m = measure(path)
            why = verdict(id,m)
            key = f"before:{id}" if stage=="before" and path != clips[id] else id
            heard = transcriptions.get(key)
            if heard is not None and letter_name(id,heard):
                why.append(f"Whisper hears letter name {heard!r}")
            entry[stage] = {"verdict":"FAIL" if why else "PASS", "reasons":why,
                            "whisper":heard, "metrics":m, "path":str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path)}
        out["clips"][id] = entry
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(out,indent=2)+"\n")
    for id, row in out["clips"].items():
        a = row.get("after",{})
        print(f"{id:6} {a.get('verdict','MISSING'):7} {'; '.join(a.get('reasons',[]))}")
    print(f"Wrote {args.output}")
    if any(row.get("after", {}).get("verdict") != "PASS" for row in out["clips"].values()):
        raise SystemExit(1)


if __name__ == "__main__": main()
