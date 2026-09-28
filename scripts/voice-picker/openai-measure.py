#!/usr/bin/env python3
"""Voice picker, OpenAI renderer: the audit's acoustic accent checks (scripts/voice-picker/audit-measure.py) on every
OpenAI take, plus a check that the take says the line's words.

Run: uv run --with numpy --with praat-parselmouth --with mlx-whisper python scripts/voice-picker/openai-measure.py [--only id,id] [--reflag]

- r after a vowel (car, four, far, world, flower, words, word, first, dear...): F3 late in the vowel / the speaker's
  median F3. The audit's calibration: American r-words 0.6-0.73, British 0.93-0.99. Flagged below 0.80 (about 1 flag
  in 5 is a tracking error, so a flag is evidence, not proof).
- BATH (Sensei only; she says the references car, mat, brand, that's): (F2 of the BATH word - F2 of START) /
  (F2 of TRAP - F2 of START): 0 = British /a:/, 1 = the flat American /ae/. Flagged above 0.6. tomato above 1.0.
- t between vowels (water, butter): a flap is voiced straight through (a gap under 20 ms). Not tomato: see flag().
Words are located with mlx-whisper large-v3-turbo; its transcript also shows dropped or added words.
In:  playtest/runs/voice-picker/openai/renders.json      Out: playtest/runs/voice-picker/openai/measures.json
"""
import importlib.util
import json
import re
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
RUN = ROOT / "playtest/runs/voice-picker/openai"
spec = importlib.util.spec_from_file_location("am", ROOT / "scripts/voice-picker/audit-measure.py")
am = importlib.util.module_from_spec(spec)
spec.loader.exec_module(am)

MEASURE_LINES = {"sensei-1", "sensei-2", "sensei-3", "sensei-4", "sensei-5", "sensei-6", "narrator-1", "narrator-2", "baron-1", "baron-2"}


def words_of(s: str):
    return re.findall(r"[a-z']+", s.lower().replace("’", "'"))


def align(items):
    cache_p = RUN / "align.json"
    cache = json.loads(cache_p.read_text()) if cache_p.exists() else {}
    todo = [it for it in items if it["wav"] not in cache]
    if todo:
        import mlx_whisper
        for n, it in enumerate(todo):
            r = mlx_whisper.transcribe(str(ROOT / it["wav"]), path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                                       word_timestamps=True, language="en", initial_prompt=None)
            cache[it["wav"]] = {"text": r["text"].strip(),
                                "words": [{"w": w["word"].strip(), "s": w["start"], "e": w["end"]} for s in r["segments"] for w in s.get("words", [])]}
            if n % 25 == 0:
                cache_p.write_text(json.dumps(cache, indent=1))
                print(f"  aligned {n}/{len(todo)}", flush=True)
        cache_p.write_text(json.dumps(cache, indent=1))
    return cache


def flag(ms, bath):
    """The American features measured. Sets m["bath_index"] on BATH words and tomato (Sensei only)."""
    flags = []
    for m in ms:
        if m.get("f3_ratio") is not None and m["f3_ratio"] < 0.80:
            flags.append(f'r in "{m["word"]}" ({m["clip"]}, F3 x{m["f3_ratio"]})')
    if bath and bath.get("f2_start") and bath.get("f2_trap") and bath["f2_trap"] - bath["f2_start"] >= 150:
        # bath_index flattens takes; recompute per measure so each flag names its clip
        s0, tr = bath["f2_start"], bath["f2_trap"]
        for m in ms:
            if (m["word"] in am.BATH_WORDS or m["word"] == "tomato") and m.get("f2"):
                ix = (m["f2"] - s0) / (tr - s0)
                m["bath_index"] = round(ix, 2)
                if m["word"] != "tomato" and ix > 0.6:
                    flags.append(f'flat a in "{m["word"]}" ({m["clip"]}, index {ix:.2f})')
                if m["word"] == "tomato" and ix > 1.0:
                    flags.append(f'"tomayto" ({m["clip"]}, index {ix:.2f})')
    for m in ms:
        # Not tomato: Whisper's word end for "tomato" often falls before its second t (checked on spectrograms of
        # audio15 sage/coral and audiomini marin, which aspirate it), so the closure is outside the window.
        if m["word"] == "tomato":
            m.pop("t", None)
        elif m.get("t") and m["t"]["kind"].startswith("flap"):
            flags.append(f'flapped t in "{m["word"]}" ({m["clip"]})')
    return flags


def reflag():
    """Recompute the flags in measures.json from its stored measures (after a change to flag())."""
    d = json.loads((RUN / "measures.json").read_text())
    for cid, v in d.items():
        v["flags"] = flag(v["measures"], v.get("bath_refs"))
    (RUN / "measures.json").write_text(json.dumps(d, indent=1))
    print("reflagged", len(d))


def main(only=None):
    renders = json.loads((RUN / "renders.json").read_text())
    items = [r for r in renders.values() if r["line"] in MEASURE_LINES and (not only or r["id"] in only)]
    cache = align(items)
    by_id = {}
    for r in items:
        by_id.setdefault(r["id"], []).append(r)
    out = json.loads((RUN / "measures.json").read_text()) if only and (RUN / "measures.json").exists() else {}
    for cid, rs in sorted(by_id.items()):
        sex = rs[0]["sex"]
        tracks = {r["wav"]: am.Track(ROOT / r["wav"], sex) for r in rs}
        base = am.speaker_f3(tracks.values())
        ms, fidelity = [], []
        for r in rs:
            clip = f'{r["line"]}.t{r["take"]}'
            al = cache[r["wav"]]
            said, want = words_of(al["text"]), words_of(r["text"])
            if said != want:
                missing = [w for w in want if w not in said]
                extra = [w for w in said if w not in want]
                if missing or extra:
                    fidelity.append({"clip": clip, "heard": al["text"], "missing": missing, "extra": extra})
            words = [(w["w"], w["s"], w["e"]) for w in al["words"]]
            for m in am.measure_clip(tracks[r["wav"]], words, base):
                m["clip"] = clip
                ms.append(m)
        bath = am.bath_index(ms) if rs[0]["role"] == "sensei" else None
        flags = flag(ms, bath)
        rhotic = [m for m in ms if m.get("f3_ratio") is not None]
        out[cid] = {
            "baseline_f3": round(base) if base else None,
            "flags": flags,
            "rhotic_median": round(float(np.median([m["f3_ratio"] for m in rhotic])), 2) if rhotic else None,
            "rhotic_tokens": len(rhotic),
            "bath_refs": {"f2_start": bath and bath.get("f2_start"), "f2_trap": bath and bath.get("f2_trap")} if bath else None,
            "fidelity": fidelity,
            "measures": ms,
        }
        print(cid, len(flags), "flags", flush=True)
    (RUN / "measures.json").write_text(json.dumps(out, indent=1))
    print("wrote", RUN / "measures.json")


if __name__ == "__main__":
    import sys
    # --only id,id: re-measure just these candidates and merge them into measures.json
    if "--reflag" in sys.argv:
        reflag()
    else:
        main(set(sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else None)
