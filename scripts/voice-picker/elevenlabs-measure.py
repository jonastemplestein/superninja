#!/usr/bin/env python3
"""Voice picker, ElevenLabs: the accent audit's acoustic checks on every take elevenlabs.ts rendered.

Run: uv run --with numpy --with praat-parselmouth --with mlx-whisper \
       python scripts/voice-picker/elevenlabs-measure.py

Reuses scripts/voice-picker/audit-measure.py (Track, measure_clip, speaker_f3, bath_index) with the audit's cut-offs
(audit-library-summary.py): an r-word is American when F3 falls below 0.72 of the speaker's usual F3; a BATH word is
American (the TRAP vowel of "mat") when its BATH index is above 0.6; a t between vowels is American when it is a flap.
Words are located with mlx-whisper (large-v3-turbo). The baseline F3 and the START/TRAP references are per voice, over
all its takes (both presets).
In:  playtest/runs/voice-picker/elevenlabs/renders.json   Out: playtest/runs/voice-picker/elevenlabs/measures.json
"""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RUNS = ROOT / "playtest/runs/voice-picker/elevenlabs"
spec = importlib.util.spec_from_file_location("am", ROOT / "scripts/voice-picker/audit-measure.py")
am = importlib.util.module_from_spec(spec)
spec.loader.exec_module(am)

RHOTIC_CUT, BATH_CUT, BATH_MIN_HZ = 0.72, 0.6, 200
# "tomato": whisper's word end often falls inside the closure of the second t, so the audit's t test reads a flap that
# isn't there (checked on spectrograms: playtest/runs/voice-picker/elevenlabs/evidence/tomato.png). The stressed vowel is
# the reliable marker: "tomayto" glides up to a high F2 (/eI/), "tomahto" stays low. The 90th-percentile F2 over the word
# separates the audit's controls: British Sulafat 1,814-1,901 Hz, ElevenLabs v3 Alice 1,985; American Samantha 2,525,
# coral 2,490, ElevenLabs Matilda 2,430, Sarah 2,493.
TOMAYTO_F2 = {"f": 2250, "m": 2000}
VOWELS = tuple("aeiouAEIOU")


def f2_p90(tr, s, e):
    import numpy as np
    ix = tr.idx(s, e + 0.05)
    ix = ix[tr.voiced[ix]]
    if len(ix) < 5:
        return None
    top = np.nanmax(tr.I[ix])
    ix = ix[tr.I[ix] >= top - 15]
    f2 = am.smooth(tr.F[2])[ix]
    f2 = f2[~np.isnan(f2)]
    return int(np.percentile(f2, 90)) if len(f2) else None


def align(items):
    cache_p = RUNS / "align.json"
    cache = json.loads(cache_p.read_text()) if cache_p.exists() else {}
    todo = [it for it in items if it["wav"] not in cache]
    if todo:
        import mlx_whisper
        for n, it in enumerate(todo):
            r = mlx_whisper.transcribe(str(ROOT / it["wav"]), path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                                       word_timestamps=True, language="en", initial_prompt=it["text"])
            cache[it["wav"]] = [{"w": w["word"].strip(), "s": w["start"], "e": w["end"]}
                                for s in r["segments"] for w in s.get("words", [])]
            if n % 20 == 0:
                cache_p.write_text(json.dumps(cache, indent=1))
                print(f"  aligned {n}/{len(todo)}", flush=True)
        cache_p.write_text(json.dumps(cache, indent=1))
    return cache


def main():
    renders = json.loads((RUNS / "renders.json").read_text())
    cache = align(renders)
    by_voice: dict[str, list] = {}
    for r in renders:
        by_voice.setdefault(r["key"], []).append(r)
    out = {"per_render": {}, "cands": {}, "voices": {}}
    for key, rs in by_voice.items():
        sex = rs[0]["sex"]
        tracks = {r["wav"]: am.Track(ROOT / r["wav"], sex) for r in rs}
        base = am.speaker_f3(tracks.values())
        ms_all = []
        for r in rs:
            words = [(w["w"], w["s"], w["e"]) for w in cache[r["wav"]]]
            # the next word, when nothing (no punctuation, so no pause) separates them
            nxt = {round(words[i][1], 3): am.norm(words[i + 1][0]) if i + 1 < len(words) and words[i][0].strip()[-1:].isalpha() else ""
                   for i in range(len(words))}
            ms = am.measure_clip(tracks[r["wav"]], words, base)
            for m in ms:
                m["cand"], m["clip"] = r["cand"], f"{r['line']}.t{r['take']}"
                # linking r: a British speaker sounds the r of "far" in "far across", so an r before a vowel is no evidence
                if m.get("f3_ratio") is not None and nxt.get(m["s"], "").startswith(VOWELS):
                    m["f3_ratio_linking"] = m.pop("f3_ratio")
                if m["word"] == "tomato":
                    m.pop("t", None)
                    m["tomato_f2_p90"] = f2_p90(tracks[r["wav"]], m["s"], m["e"])
            ms_all.extend(ms)
        bath = am.bath_index(ms_all)
        start, trap = bath["f2_start"], bath["f2_trap"]
        can_bath = bool(start and trap and trap - start >= 150)
        for m in ms_all:
            flags = []
            if m.get("f3_ratio") is not None and m["f3_ratio"] < RHOTIC_CUT:
                flags.append(f"r-coloured \"{m['word']}\" (F3 {m['f3_ratio']})")
            if can_bath and m["word"] in am.BATH_WORDS and m.get("f2"):
                bi = round((m["f2"] - start) / (trap - start), 2)
                m["bath_index"] = bi
                # and at least 200 Hz above START: many British voices have a backed TRAP [a] only 150-300 Hz above
                # START, where the index alone blows small differences up (an American flat a sits ~600 Hz above)
                if bi > BATH_CUT and m["f2"] - start >= BATH_MIN_HZ:
                    flags.append(f"flat a in \"{m['word']}\" (BATH index {bi})")
            if m.get("t") and m["t"]["kind"].startswith("flap"):
                flags.append(f"flapped t in \"{m['word']}\"")
            if m.get("tomato_f2_p90") and m["tomato_f2_p90"] > TOMAYTO_F2[sex]:
                flags.append(f"\"tomayto\" (F2 {m['tomato_f2_p90']} Hz)")
            m["flags"] = flags
            m["tested"] = (int(m.get("f3_ratio") is not None) + int("bath_index" in m) + int(bool(m.get("t")))
                           + int(bool(m.get("tomato_f2_p90"))))
        out["voices"][key] = {"baseline_f3": round(base) if base else None, "f2_start": start, "f2_trap": trap,
                              "bath_testable": can_bath}
        for cand in sorted({r["cand"] for r in rs}):
            ms = [m for m in ms_all if m["cand"] == cand]
            flags = [f"{f} [{m['clip']}]" for m in ms for f in m["flags"]]
            out["cands"][cand] = {"tokens": sum(m["tested"] for m in ms), "american": len(flags), "flags": flags,
                                  "takes": len({m['clip'] for m in ms}), "measures": ms}
        print(f"{key}: F3 {out['voices'][key]['baseline_f3']}, START {start}, TRAP {trap}, "
              + ", ".join(f"{c.split('-')[-1]} {out['cands'][c]['american']}/{out['cands'][c]['tokens']}"
                          for c in sorted({r['cand'] for r in rs})), flush=True)
    (RUNS / "measures.json").write_text(json.dumps(out, indent=1))
    print("wrote", RUNS / "measures.json")


if __name__ == "__main__":
    main()
