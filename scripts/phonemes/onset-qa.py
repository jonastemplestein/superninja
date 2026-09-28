#!/usr/bin/env python3
"""QA for the held-onset clips (public/a/o, scripts/gen-stretch.ts --onset): Whisper hears the word, the first sound is
held (s/f: the unvoiced start before voicing; m: the hum before the vowel's level step), and the loudness is -16 LUFS.

  uv run -q --with numpy --with scipy --with praat-parselmouth --with soundfile --with faster-whisper \
    python scripts/phonemes/onset-qa.py [files...]      (default: public/a/o/*.mp3)
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import parselmouth

ROOT = Path(__file__).resolve().parents[2]
# Whisper (American-trained) writes British "sun" as "son"
HOMOPHONES = {("sun", "son")}


def lufs(p: Path) -> float:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1]) if m else float("nan")


def hold(p: Path, word: str) -> float:
    raw = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", str(p), "-ac", "1", "-ar", "24000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    hop = 120
    n = (len(x) - 600) // hop
    db = np.array([10 * np.log10(np.mean(x[i * hop:i * hop + 600] ** 2) + 1e-12) for i in range(n)])
    pk = db.max()
    act = np.flatnonzero(db > pk - 40)
    a0 = act[0]
    snd = parselmouth.Sound(x, 24000)
    pitch = snd.to_pitch_ac(time_step=.005, pitch_floor=60, pitch_ceiling=500, voicing_threshold=.35, silence_threshold=.01)
    t = (np.arange(n) * hop + 300) / 24000
    f0 = np.nan_to_num(np.array([pitch.get_value_at_time(float(tt)) for tt in t]))
    if word[0] in "sf":
        v = np.flatnonzero((f0 > 0) & (db > pk - 25) & (np.arange(n) > a0))
        return round((v[0] - a0) * .005, 3) if len(v) else 0.0
    # m: the hum lasts until the spectrum moves into the vowel (erinome-cut.py's held-onset finder)
    import importlib.util
    spec = importlib.util.spec_from_file_location("ec", Path(__file__).parent / "erinome-cut.py")
    ec = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ec)
    an = ec.A(x)
    segs = ec.seg_init_hold(an, "m")
    return round(segs[0][3]["transition_at"] - an.t[an.a0], 3) if segs else 0.0


def main():
    files = [Path(f) for f in sys.argv[1:]] or sorted((ROOT / "public/a/o").glob("*.mp3"))
    from faster_whisper import WhisperModel
    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    out = {}
    for f in files:
        word = f.stem.split("_")[1] if f.stem.startswith("o_") else f.stem
        with tempfile.TemporaryDirectory() as td:
            wav = Path(td) / "a.wav"
            subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(f), "-af", "adelay=300,apad=pad_dur=0.3",
                            "-ar", "16000", "-ac", "1", str(wav)], check=True)
            segs, _ = model.transcribe(str(wav), language="en", beam_size=5, condition_on_previous_text=False)
            heard = " ".join(s.text.strip() for s in segs).strip()
        h = hold(f, word)
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                                   capture_output=True, text=True).stdout)
        l = lufs(f)
        # Whisper writes a held first sound as extra letters ("Ssssun", "Mmmoon"); squeeze repeats before comparing
        squeezed = re.sub(r"(.)\1+", r"\1", re.sub(r"[^a-z]", "", heard.lower()))
        ok_word = squeezed == re.sub(r"(.)\1+", r"\1", word) or word in heard.lower() or (word, squeezed) in HOMOPHONES
        ok = ok_word and h >= .45 and abs(l + 16) <= 1
        out[str(f.relative_to(ROOT)) if f.is_relative_to(ROOT) else str(f)] = {"word": word, "whisper": heard, "hold_s": h,
                                                                               "dur_s": round(dur, 3), "lufs": l, "ok": bool(ok)}
        print(f"{'PASS' if ok else 'FAIL'} {f.name:22} whisper={heard!r:22} hold {h:.2f}s dur {dur:.2f}s {l} LUFS")
    (ROOT / "playtest/runs/pure-sounds-erinome/onset-qa.json").write_text(json.dumps(out, indent=1) + "\n")


if __name__ == "__main__":
    main()
