#!/usr/bin/env python3
"""faster-whisper for retake.ts: playtest/voice/qa.py's word-for-word check on any clip, and its word timings.

  uv run -q --with numpy --with praat-parselmouth --with faster-whisper python playtest/read-slider/audio/whisper.py \
    check <clip.mp3> "<script>"            # prints {"heard", "exact", "diff"} (small.en, qa.py's normalising)
    words <id> <clip.mp3> "<script>"       # writes public/a/l/<id>.words.json (a temp file, then a rename)
"""
from __future__ import annotations
import difflib, importlib.util, json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location("qa", ROOT / "playtest/voice/qa.py")
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)


def transcribe(p: str):
    from faster_whisper import WhisperModel
    model = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=8)
    segs, _ = model.transcribe(p, language="en", beam_size=5, temperature=0, condition_on_previous_text=False,
                               initial_prompt=qa.GLOSSARY, word_timestamps=True, vad_filter=False)
    return list(segs)


def check(p: str, text: str) -> dict:
    segs = transcribe(p)
    heard = " ".join(s.text.strip() for s in segs).strip()
    want, got = qa.norm(text), qa.norm(heard)
    ops = [o for o in difflib.SequenceMatcher(None, want, got).get_opcodes() if o[0] != "equal"]
    ops = [o for o in ops if not (o[0] == "replace" and qa.homophones(want[o[1]:o[2]], got[o[3]:o[4]]))]
    exact = not ops or "".join(want) == "".join(got)
    diff = [] if exact else [f"{op} {' '.join(want[a1:a2])!r}→{' '.join(got[b1:b2])!r}" for op, a1, a2, b1, b2 in ops]
    return {"heard": heard, "exact": exact, "diff": diff}


def words(i: str, p: str, text: str) -> dict:
    segs = transcribe(p)
    ws = [{"w": re.sub(r"[^A-Za-z']", "", w.word), "start": round(w.start, 2), "end": round(w.end, 2)}
          for s in segs for w in (s.words or []) if re.search("[A-Za-z]", w.word)]
    ws = qa.place(ws, qa.islands(Path(p)))
    out = ROOT / "public/a/l" / f"{i}.words.json"
    tmp = out.with_name(f".{out.name}.tmp-{os.getpid()}")
    tmp.write_text(json.dumps({"id": i, "text": text, "note": "at: when each word starts (s), for spotlights; start/end: Whisper's span", "words": ws}) + "\n")
    os.replace(tmp, out)
    return {"id": i, "words": [(w["w"], w["at"]) for w in ws]}


if __name__ == "__main__":
    if sys.argv[1] == "check":
        print(json.dumps(check(sys.argv[2], sys.argv[3])))
    elif sys.argv[1] == "words":
        print(json.dumps(words(sys.argv[2], sys.argv[3], sys.argv[4])))
