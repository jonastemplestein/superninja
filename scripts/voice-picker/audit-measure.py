#!/usr/bin/env python3
"""Accent audit, step 3: acoustic checks (Praat via parselmouth) of the accent markers.

Run: uv run --with numpy --with praat-parselmouth --with faster-whisper \
  python scripts/voice-picker/audit-measure.py            # the test script, the word library, the pure sounds
  ... python scripts/voice-picker/audit-measure.py library    # every shipped line and story page with a marker word

- Rhoticity: a rhotic r (car, four, bird, water) pulls F3 down, to about 0.65-0.8 of the speaker's usual F3;
  a non-rhotic vowel keeps F3 near it. We report F3 (smoothed minimum over the vowel's second half) / the speaker's
  median F3.
- BATH: the BATH vowel /a:/ has a low F2, like START (car); an American TRAP /ae/ has a high F2, like "mat".
  BATH index = (F2 of the BATH word - F2 of START) / (F2 of TRAP - F2 of START): 0 = British, 1 = American.
- T between vowels (water, butter, bottle): a flap is voiced straight through (a gap of < 20 ms); a British t is a
  voiceless closure (aspirated, or a glottal stop) of 40 ms or more.
- tomato: the stressed vowel's F2, on the same BATH index (British /a:/ ~ 0; American /eI/ well above 1).

Words are located with faster-whisper word timestamps (test script) or are whole clips (the game's word library).
Measurements are evidence, not recognition: a human should still listen.
"""
from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import parselmouth

ROOT = Path(__file__).resolve().parents[2]
AUD = ROOT / "playtest/runs/voice-picker/audit"
STEP = 0.005

SEX = {"sulafat": "f", "algenib": "m", "george": "m", "sulafat-en-us": "f", "mac-daniel": "m", "eleven-alice": "f",
       "mac-samantha": "f", "openai-coral": "f", "game-sulafat": "f", "game-algenib": "m"}

RHOTIC_WORDS = {"car", "four", "far", "are", "dear", "first", "world", "words", "stormy", "water", "butter", "another",
                "together", "flower", "her", "bird", "fur", "girl", "turn", "shirt", "work", "word", "nurse", "church",
                "burn", "hurt", "star", "park", "farm", "jar", "dark", "card", "more", "door", "floor", "horse", "fork",
                "sport", "born", "corn", "short", "after", "daughter"}
BATH_WORDS = {"grass", "bath", "fast", "dance", "can't", "half", "past", "after", "laugh", "aunt", "rather", "ask", "class", "castle"}
TRAP_WORDS = {"mat", "brand", "that's", "cat", "hat", "man", "map", "fan", "pan", "sat", "van", "bag"}
START_WORDS = {"car", "far", "palm", "calm", "star", "park", "farm", "jar", "dark", "card"}
T_WORDS = {"water", "butter", "bottle", "daughter", "tomato"}


def to_wav(path: Path) -> Path:
    if path.suffix == ".wav":
        return path
    out = Path(tempfile.mkdtemp()) / (path.stem + ".wav")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(path), "-ac", "1", "-ar", "44100", str(out)], check=True)
    return out


class Track:
    """Per-frame f0, F1-F3, intensity and high-frequency share for one clip."""

    def __init__(self, path: Path, sex: str):
        snd = parselmouth.Sound(str(to_wav(path)))
        if snd.n_channels > 1:
            snd = snd.convert_to_mono()
        floor, ceil = (120, 500) if sex == "f" else (65, 300)
        self.dur = snd.duration
        self.t = np.arange(STEP, snd.duration - STEP, STEP)
        pitch = snd.to_pitch_ac(time_step=STEP, pitch_floor=floor, pitch_ceiling=ceil)
        fmt = snd.to_formant_burg(time_step=STEP, max_number_of_formants=5, maximum_formant=5500 if sex == "f" else 5000,
                                  window_length=0.025)
        inten = snd.to_intensity(minimum_pitch=floor, time_step=STEP)
        self.f0 = np.array([pitch.get_value_at_time(x) for x in self.t])
        self.F = {k: np.array([fmt.get_value_at_time(k, x) for x in self.t]) for k in (1, 2, 3)}
        self.I = np.array([inten.get_value(x) for x in self.t])
        spec = snd.to_spectrogram(window_length=0.01, maximum_frequency=min(11000, snd.sampling_frequency / 2), time_step=STEP)
        freqs = np.array(spec.ys())
        vals = spec.values
        times = np.array(spec.xs())
        hi = vals[freqs > 3000].sum(axis=0)
        tot = vals.sum(axis=0) + 1e-20
        self.hf = np.interp(self.t, times, hi / tot)
        self.voiced = ~np.isnan(self.f0)

    def idx(self, a: float, b: float):
        return np.where((self.t >= a) & (self.t <= b))[0]


def smooth(x, k=7):
    out = x.copy()
    h = k // 2
    for i in range(len(x)):
        w = x[max(0, i - h): i + h + 1]
        w = w[~np.isnan(w)]
        out[i] = np.median(w) if len(w) else np.nan
    return out


def nucleus(tr: Track, a: float, b: float, db=12):
    """Voiced frames in [a, b] within `db` of the loudest voiced frame there."""
    ix = tr.idx(a, b)
    ix = ix[tr.voiced[ix]]
    if len(ix) == 0:
        return ix
    top = np.nanmax(tr.I[ix])
    return ix[tr.I[ix] >= top - db]


def f3_late(tr: Track, a: float, b: float):
    """Smoothed minimum F3 over the second half of the word's voiced nucleus (edges trimmed)."""
    ix = nucleus(tr, a, b)
    if len(ix) < 6:
        return None
    lo, hi = ix[int(len(ix) * 0.4)], ix[int(len(ix) * 0.92)]
    f3 = smooth(tr.F[3])[lo:hi + 1]
    f2 = smooth(tr.F[2])[lo:hi + 1]
    ok = (~np.isnan(f3)) & (f3 > np.nan_to_num(f2) + 250) & tr.voiced[lo:hi + 1]
    return float(np.min(f3[ok])) if ok.any() else None


def f2_vowel(tr: Track, a: float, b: float, db=5):
    """Median F2 over the loudest voiced frames of the word (its stressed vowel)."""
    ix = nucleus(tr, a, b, db)
    if len(ix) < 3:
        return None
    f2 = tr.F[2][ix]
    f2 = f2[~np.isnan(f2)]
    return float(np.median(f2)) if len(f2) else None


def f2_vowel_start(tr: Track, a: float, b: float):
    """For START words: median F2 over the first half of the loudest frames (before any r-colouring)."""
    ix = nucleus(tr, a, b, 6)
    if len(ix) < 4:
        return None
    ix = ix[: max(3, len(ix) // 2)]
    f2 = tr.F[2][ix]
    f2 = f2[~np.isnan(f2)]
    return float(np.median(f2)) if len(f2) else None


def t_gap(tr: Track, a: float, b: float):
    """The longest voiceless stretch between the word's first and last loud voiced frames, and the high-frequency
    share (aspiration/burst noise) in and just after it."""
    ix = tr.idx(a, b)
    if len(ix) < 5:
        return None
    loud = ix[tr.voiced[ix] & (tr.I[ix] >= np.nanmax(tr.I[ix][tr.voiced[ix]]) - 20)] if tr.voiced[ix].any() else []
    if len(loud) < 2:
        return None
    lo, hi = loud[0], loud[-1]
    best, cur, start, bstart = 0, 0, lo, lo
    for i in range(lo, hi + 1):
        if not tr.voiced[i]:
            if cur == 0:
                start = i
            cur += 1
            if cur > best:
                best, bstart = cur, start
        else:
            cur = 0
    gap_ms = best * STEP * 1000
    hf = float(np.max(tr.hf[bstart: bstart + best + 4])) if best else float(np.max(tr.hf[lo:hi + 1]))
    dip = float(np.nanmax(tr.I[lo:hi + 1]) - np.nanmin(tr.I[lo + (hi - lo) // 4: hi - (hi - lo) // 4 + 1]))
    kind = "flap (voiced through)" if gap_ms < 20 else ("aspirated/released t" if hf > 0.25 else "glottal or unreleased t")
    return {"gap_ms": round(gap_ms), "hf_share": round(hf, 2), "dip_db": round(dip, 1), "kind": kind}


# ------------------------------------------------------------------ alignment (test-script renders)
def align(items, cache_name="align.json", model_name="medium.en"):
    cache_p = AUD / cache_name
    cache = json.loads(cache_p.read_text()) if cache_p.exists() else {}
    todo = [it for it in items if it["wav"] not in cache]
    if todo:
        from faster_whisper import WhisperModel
        model = WhisperModel(model_name, device="cpu", compute_type="int8")
        for n, it in enumerate(todo):
            if n % 50 == 0:
                print(f"  aligning {n}/{len(todo)}", flush=True)
            segs, _ = model.transcribe(str(ROOT / it["wav"]), language="en", word_timestamps=True, beam_size=5,
                                       initial_prompt=it["text"])
            cache[it["wav"]] = [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in s.words]
            cache_p.write_text(json.dumps(cache, indent=1))
    return cache


def norm(w: str) -> str:
    return w.lower().strip(".,!?…\"'").replace("’", "'")


def measure_clip(tr: Track, words, baseline_f3):
    """words: [(word, start, end)]. Returns per-word measures."""
    out = []
    for w, s, e in words:
        n = norm(w)
        a, b = max(0, s - 0.03), min(tr.dur, e + 0.03)
        m = {"word": n, "s": round(s, 3), "e": round(e, 3)}
        if n in RHOTIC_WORDS:
            f3 = f3_late(tr, a, b)
            m["f3_late"] = round(f3) if f3 else None
            m["f3_ratio"] = round(f3 / baseline_f3, 2) if f3 else None
        if n in BATH_WORDS | TRAP_WORDS | {"tomato"}:
            v = f2_vowel(tr, a, b)
            m["f2"] = round(v) if v else None
        if n in START_WORDS:
            v = f2_vowel_start(tr, a, b)
            m["f2_start"] = round(v) if v else None
        if n in T_WORDS:
            m["t"] = t_gap(tr, a, b)
        if len(m) > 3:
            out.append(m)
    return out


def speaker_f3(tracks):
    vals = []
    for tr in tracks:
        ok = tr.voiced & (tr.I >= np.nanmax(tr.I) - 10) & ~np.isnan(tr.F[3])
        vals.extend(tr.F[3][ok])
    return float(np.median(vals)) if vals else None


def bath_index(ms):
    def med(key, words):
        v = [m[key] for m in ms if m["word"] in words and m.get(key)]
        return float(np.median(v)) if v else None
    start = med("f2_start", START_WORDS)
    trap = med("f2", TRAP_WORDS)
    res = {"f2_start": start, "f2_trap": trap, "words": {}}
    if not start or not trap or trap - start < 150:
        return res
    for m in ms:
        if m["word"] in BATH_WORDS | {"tomato"} and m.get("f2"):
            res["words"].setdefault(m["word"], []).append(round((m["f2"] - start) / (trap - start), 2))
    return res


def main():
    renders = json.loads((AUD / "renders.json").read_text())
    cache = align(renders)
    report = {"test_script": {}, "game_words": {}, "pure_sounds": {}}

    # --- the test script, per cast
    by_cast = {}
    for r in renders:
        by_cast.setdefault(r["cast"], []).append(r)
    for cast, rs in by_cast.items():
        sex = SEX[cast]
        tracks = {r["wav"]: Track(ROOT / r["wav"], sex) for r in rs}
        base = speaker_f3(tracks.values())
        ms = []
        for r in rs:
            words = [(w["w"], w["s"], w["e"]) for w in cache[r["wav"]]]
            for m in measure_clip(tracks[r["wav"]], words, base):
                m["clip"] = f"{r['line']}.t{r['take']}"
                ms.append(m)
        report["test_script"][cast] = {"baseline_f3": round(base) if base else None, "measures": ms, "bath": bath_index(ms)}
        print(cast, "done", flush=True)

    # --- the game's word library (Sulafat) and controls saying the same words
    wordlist = sorted(RHOTIC_WORDS | BATH_WORDS | TRAP_WORDS | START_WORDS | T_WORDS)
    sets = {"game-sulafat": ROOT / "public/a/w"}
    for c in ("mac-daniel", "mac-samantha"):
        sets[c] = AUD / "words" / c
    for key, d in sets.items():
        sex = SEX[key]
        files = {w: (d / f"{w}.mp3" if (d / f"{w}.mp3").exists() else d / f"{w}.wav") for w in wordlist}
        files = {w: p for w, p in files.items() if p.exists()}
        tracks = {w: Track(p, sex) for w, p in files.items()}
        trap_tracks = [tracks[w] for w in tracks if w in TRAP_WORDS]
        base = speaker_f3(trap_tracks)
        ms = []
        for w, tr in tracks.items():
            ms.extend(measure_clip(tr, [(w, 0.0, tr.dur)], base))
        report["game_words"][key] = {"baseline_f3": round(base) if base else None, "measures": ms, "bath": bath_index(ms)}
        print(key, "words done", flush=True)

    # --- the pure sounds (Sulafat): r-colouring in ar / or / er / air / eer, vowel quality of a
    pdir = ROOT / "public/a/p"
    ptr = {p: Track(pdir / f"{p}.mp3", "f") for p in ("ar", "or", "er", "air", "eer", "a", "u", "o", "e", "i")}
    base = speaker_f3([ptr[p] for p in ("a", "u", "o", "e", "i")])
    for p, tr in ptr.items():
        f3 = f3_late(tr, 0, tr.dur)
        f2 = f2_vowel(tr, 0, tr.dur)
        f1ix = nucleus(tr, 0, tr.dur, 5)
        f1 = float(np.nanmedian(tr.F[1][f1ix])) if len(f1ix) else None
        report["pure_sounds"][p] = {"f1": round(f1) if f1 else None, "f2": round(f2) if f2 else None,
                                    "f3_late": round(f3) if f3 else None, "f3_ratio": round(f3 / base, 2) if f3 else None}
    report["pure_sounds"]["_baseline_f3"] = round(base)

    (AUD / "measures.json").write_text(json.dumps(report, indent=1))
    print("wrote", AUD / "measures.json")


# ------------------------------------------------------------------ the shipped library
LIB_RHOTIC = {"world", "word", "words", "first", "bird", "turn", "learn", "girl", "more", "four", "door", "before", "sure",
              "super", "flower", "water", "after", "better", "together", "clever", "monster", "corner", "morning", "story",
              "stories", "storm", "short", "sort", "horse", "third", "purple", "turtle", "person", "heard", "early", "earth",
              "work", "worm", "hurt", "burst", "nurse", "star", "start", "car", "far", "dark", "park", "heart", "hard", "card",
              "farm", "arm", "smart", "starfish", "garden", "party", "sharp", "here", "there", "where", "her", "yours"}
LIB_BATH = {"fast", "last", "past", "ask", "asked", "after", "class", "can't", "grass", "path", "bath", "glass", "castle",
            "rather", "laugh", "dance", "half", "plant", "branch", "answer", "banana", "master", "basket", "task", "mask"}
LIB_TRAP = {"tap", "that", "back", "cat", "hat", "map", "happy", "tapped", "trap", "black", "bag", "hand", "sad", "mat",
            "jam", "catch", "clap", "rabbit", "magic", "has", "had"}
LIB_START = {"star", "start", "car", "far", "dark", "park", "heart", "hard", "card", "farm", "arm", "smart", "starfish",
             "garden", "party", "sharp"}
LIB_T = {"water", "better", "butter", "little", "bottle", "petal", "petals", "letter", "letters", "matter", "city",
         "pretty", "getting", "sitting", "putting", "later", "eating", "meeting", "waiting", "writing", "kitten", "total",
         "metal", "forgotten", "potato", "tomato", "sweeter", "hotter", "bitter", "sitter", "splatter", "chatter"}


def main_library():
    import re
    texts = json.loads((AUD / "library-texts.json").read_text())
    targets = LIB_RHOTIC | LIB_BATH | LIB_TRAP | LIB_START | LIB_T
    sel = [t for t in texts if set(re.findall(r"[a-z']+", t["text"].lower().replace("’", "'"))) & targets]
    items = [{"wav": t["file"], "text": t["text"]} for t in sel]
    cache = align(items, "align-library.json", "small.en")
    global RHOTIC_WORDS, BATH_WORDS, TRAP_WORDS, START_WORDS, T_WORDS
    RHOTIC_WORDS, BATH_WORDS, TRAP_WORDS, START_WORDS, T_WORDS = LIB_RHOTIC, LIB_BATH, LIB_TRAP, LIB_START, LIB_T
    res = {}
    for who in ("sensei", "baron"):
        clips = [t for t in sel if t["who"] == who]
        sex = "f" if who == "sensei" else "m"
        tracks, per_clip_f3 = {}, []
        for t in clips:
            tr = Track(ROOT / t["file"], sex)
            tracks[t["id"]] = tr
            b = speaker_f3([tr])
            if b:
                per_clip_f3.append(b)
        base = float(np.median(per_clip_f3))
        ms = []
        for t in clips:
            words = [(w["w"], w["s"], w["e"]) for w in cache[t["file"]]]
            for m in measure_clip(tracks[t["id"]], words, base):
                m["clip"] = t["id"]
                ms.append(m)
        res[who] = {"baseline_f3": round(base), "clips": len(clips), "measures": ms, "bath": bath_index(ms)}
        print(who, len(clips), "clips measured", flush=True)
    (AUD / "measures-library.json").write_text(json.dumps(res, indent=1))
    print("wrote", AUD / "measures-library.json")


if __name__ == "__main__":
    import sys
    main_library() if sys.argv[1:] == ["library"] else main()
