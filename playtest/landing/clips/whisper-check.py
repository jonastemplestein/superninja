#!/usr/bin/env python3
"""Do the landing clips' soundtracks say pure sounds, or letter names ("bee", "kay")?

Run: uv run --with faster-whisper python playtest/landing/clips/whisper-check.py

1. Every pure sound in each new clip (its moments come from assets-src/clips-raw/<name>.clip.json, the game's own
   audio log on the clip's clock) is cut out of the clip's soundtrack, padded with silence and transcribed on its own.
   A letter name for that sound (b: "B", "bee", "be"; k: "K", "kay", "okay"; ...) is a FAIL.
2. The whole soundtrack of each new clip and of the original 25 Sep clip (before/originals/) is transcribed with word
   times, for comparison.
3. The game's own sound files the clips were mixed from (production's, fetched by the rig into
   assets-src/clips-raw/.audio/a/p/) are compared byte for byte with public/a/p/ and transcribed too.
Whisper is a secondary signal for such short sounds (docs/TREADMILL.md): the check is for letter names, not accuracy.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "assets-src/clips-raw"
CLIPS = ROOT / "public/media/clips"
BEFORE = Path(__file__).resolve().parent / "before/originals"
OUT = Path(__file__).resolve().parent / "whisper.json"
NAMES = ["battle", "run", "dojo", "swap", "story", "boss", "map", "flower", "trial"]
# letter names Whisper might write for a consonant said as its name (the vowels' names are too close to ordinary
# transcriptions of the pure vowels, "a", "I", "oh", to judge this way; they are listed, not judged)
LETTER = {
    "b": r"\b(b|bee|be|bea)\b", "k": r"\b(k|kay|okay|ok|cay|c|see|sea)\b", "d": r"\b(d|dee)\b", "g": r"\b(g|gee|jee)\b",
    "p": r"\b(p|pee|pea)\b", "t": r"\b(t|tee|tea)\b", "h": r"\b(h|aitch|haitch)\b", "m": r"\b(m|em)\b", "n": r"\b(n|en)\b",
    "s": r"\b(es|ess)\b",
}

model = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=2)


def wav(src: Path, start: float | None = None, dur: float | None = None, pad: float = 0.0) -> Path:
    f = Path(tempfile.mkstemp(suffix=".wav")[1])
    cut = (["-ss", f"{start:.3f}"] if start is not None else []) + (["-t", f"{dur:.3f}"] if dur is not None else [])
    af = f"adelay={int(pad * 1000)}:all=1,apad=pad_dur={pad}" if pad else "anull"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), *cut, "-vn", "-ac", "1", "-ar", "16000", "-af", af, str(f)], check=True)
    return f


def say(path: Path, words: bool = False):
    segs, _ = model.transcribe(str(path), language="en", beam_size=5, vad_filter=False, word_timestamps=words, condition_on_previous_text=False)
    segs = list(segs)
    text = " ".join(s.text.strip() for s in segs).strip()
    if not words:
        return text
    return text, [(round(w.start, 2), w.word.strip()) for s in segs for w in (s.words or [])]


report: dict = {"sounds": [], "files": {}, "whole": {}}
fails = 0
# 1. each pure sound in each new clip
for name in NAMES:
    meta = RAW / f"{name}.clip.json"
    if not meta.exists():
        continue
    clip = json.loads(meta.read_text())
    for e in clip["events"]:
        if e["kind"] != "speech" or not e["id"].startswith("sound:") or e["t"] < 0:
            continue
        p = e["id"][6:]
        dur = min(e.get("dur") or 0.6, 1.2)
        text = say(wav(CLIPS / f"{name}.mp4", max(0, e["t"] - 0.03), dur + 0.12, pad=0.4))
        bad = bool(LETTER.get(p) and re.search(LETTER[p], text.lower()))
        fails += bad
        report["sounds"].append({"clip": name, "t": e["t"], "sound": p, "whisper": text, "letterName": bad})
        print(f"{'FAIL' if bad else 'ok  '} {name:7} {e['t']:6.2f}s /{p}/ → {text!r}")
# 3. the sound files themselves
for f in sorted((RAW / ".audio/a/p").glob("*.mp3")):
    local = ROOT / "public/a/p" / f.name
    same = local.exists() and local.read_bytes() == f.read_bytes()
    text = say(wav(f, pad=0.4))
    p = f.stem
    bad = bool(LETTER.get(p) and re.search(LETTER[p], text.lower()))
    report["files"][f.name] = {"sameAsPublic": same, "whisper": text, "letterName": bad}
    print(f"{'FAIL' if bad else 'ok  '} file /{p}/ (production{' = public/a/p' if same else ', DIFFERS from public/a/p'}) → {text!r}")
# 2. whole soundtracks, before and after
for name in NAMES:
    for label, src in (("before", BEFORE / f"{name}.mp4"), ("after", CLIPS / f"{name}.mp4")):
        if src.exists():
            text, words = say(wav(src), words=True)
            report["whole"].setdefault(name, {})[label] = {"text": text, "words": words}
            print(f"{label:6} {name:7} {text}")
OUT.write_text(json.dumps(report, indent=1))
print(f"\n{fails} letter-name fails; report: {OUT.relative_to(ROOT)}")
sys.exit(1 if fails else 0)
