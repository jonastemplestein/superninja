#!/usr/bin/env python3
"""Voice picker, Workers AI renderer: the audit's acoustic accent checks (audit-measure.py) on every candidate's takes.

Run: uv run --with numpy --with praat-parselmouth --with faster-whisper --with mlx-whisper python scripts/voice-picker/workers-ai-measure.py [--mlx]
     --mlx aligns words on the Apple GPU (mlx-whisper large-v3-turbo) first; much faster when the CPU is busy.

In:  playtest/runs/voice-picker/workers-ai/raw/<id>/<line>.t<k>.wav, and the ids and genders in
     playtest/voice-picker/candidates-workers-ai.json
Out: playtest/runs/voice-picker/workers-ai/measures.json, and an `acoustics` summary merged into each candidate of
     candidates-workers-ai.json:
  - rColoured: r-words whose F3 falls below 0.8 of the speaker's usual F3 (American r; British stays near 1.0)
  - bathFlat: BATH words (grass, bath, fast, dance, can't, half, past) whose vowel sits nearer "mat" than "car"
    (BATH index > 0.6; 0 = British broad /a:/, 1 = the flat /ae/ of "tap")
  - tFlapped: t between vowels (water, butter, tomato) voiced straight through (a flap, as in American "wadder")
Evidence, not proof: the r detector raises some false flags and Whisper's timings can be loose (see audit.md).
"""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("audit_measure", ROOT / "scripts/voice-picker/audit-measure.py")
am = importlib.util.module_from_spec(spec)
spec.loader.exec_module(am)

RUNS = ROOT / "playtest/runs/voice-picker/workers-ai"
am.AUD = RUNS  # the alignment cache goes to our runs folder
CANDS = ROOT / "playtest/voice-picker/candidates-workers-ai.json"
SCRIPT = {
    "sensei-2": "Can you find the car? It's by the grass, next to the bath.",
    "sensei-4": "Say mat slowly. Now say it fast.",
    "sensei-6": "Water, butter, tomato, dance, can't, half past four.",
    "sensei-1": "Hello, ninja! Today I'm going to show you how to read a brand new word. Are you ready?",
    "sensei-5": "Oh dear, that's not quite right. Shall we have another go together?",
    "narrator-1": "Once upon a time, on an island far across the sea, grew the World Flower.",
    "narrator-2": "But one stormy night, Baron Muddle crept up the mountain…",
    "baron-1": "Words, words, WORDS! How I hate them!",
}


def main():
    cands = json.loads(CANDS.read_text())
    items = []
    for c in cands:
        for line, text in SCRIPT.items():
            for take in (1, 2, 3):
                wav = RUNS / "raw" / c["id"] / f"{line}.t{take}.wav"
                if wav.exists():
                    items.append({"cand": c["id"], "line": line, "take": take, "wav": str(wav.relative_to(ROOT)), "text": text})
    import sys
    if "--mlx" in sys.argv:
        import mlx_whisper
        cache_p = RUNS / "align.json"
        cache = json.loads(cache_p.read_text()) if cache_p.exists() else {}
        for n, it in enumerate(it for it in items if it["wav"] not in cache):
            r = mlx_whisper.transcribe(str(ROOT / it["wav"]), path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                                       word_timestamps=True, language="en", initial_prompt=it["text"])
            cache[it["wav"]] = [{"w": w["word"].strip(), "s": w["start"], "e": w["end"]} for s in r["segments"] for w in s.get("words", [])]
            cache_p.write_text(json.dumps(cache, indent=1))
            if n % 25 == 0:
                print("  mlx aligned", n, flush=True)
    cache = am.align(items, "align.json", "small.en")
    report = {}
    for c in cands:
        its = [it for it in items if it["cand"] == c["id"]]
        sex = c.get("gender", "f")
        tracks = {it["wav"]: am.Track(ROOT / it["wav"], sex) for it in its}
        base = am.speaker_f3(tracks.values())
        ms = []
        for it in its:
            words = [(w["w"], w["s"], w["e"]) for w in cache[it["wav"]]]
            for m in am.measure_clip(tracks[it["wav"]], words, base):
                m["clip"] = f"{it['line']}.t{it['take']}"
                ms.append(m)
        bath = am.bath_index(ms)
        r = [m for m in ms if m.get("f3_ratio") is not None]
        r_flags = [f"{m['word']} ({m['clip']}, {m['f3_ratio']})" for m in r if m["f3_ratio"] < 0.8]
        bath_vals = [(w, v) for w, vs in bath["words"].items() if w != "tomato" for v in vs]
        bath_flags = [f"{w} ({v})" for w, v in bath_vals if v > 0.6]
        ts = [m for m in ms if m.get("t")]
        t_flags = [f"{m['word']} ({m['clip']})" for m in ts if m["t"]["kind"].startswith("flap")]
        tomato = bath["words"].get("tomato", [])
        summary = {
            "rColoured": f"{len(r_flags)}/{len(r)}", "rFlags": r_flags,
            "bathFlat": f"{len(bath_flags)}/{len(bath_vals)}" if bath_vals else "n/a (no car/mat reference)", "bathFlags": bath_flags,
            "tFlapped": f"{len(t_flags)}/{len(ts)}", "tFlags": t_flags,
            "tomatoIndex": tomato,
        }
        report[c["id"]] = {"baseline_f3": round(base) if base else None, "summary": summary, "bath": bath, "measures": ms}
        c["acoustics"] = summary
        print(f"{c['id']:36s} r {summary['rColoured']:6s} bath-flat {summary['bathFlat']:6s} t-flap {summary['tFlapped']:5s} {r_flags[:3]} {bath_flags[:3]} {t_flags[:2]}", flush=True)
    (RUNS / "measures.json").write_text(json.dumps(report, indent=1))
    CANDS.write_text(json.dumps(cands, indent=1))
    print("wrote", RUNS / "measures.json", "and merged acoustics into", CANDS)


if __name__ == "__main__":
    main()
