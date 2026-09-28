"""Voice picker, the Gemini renderer's acoustics: the accent audit's measurements (scripts/voice-picker/audit-measure.py:
F3 in r-words, the BATH index, t closures, tomato) on every take in playtest/runs/voice-picker/gemini/renders.json.
Words are located with Whisper medium.en (mlx-whisper) snapped to the pauses; raw takes are measured, not the MP3s.
Run (scripts/voice-picker/gemini.ts measure does this):
  uv run --with numpy --with praat-parselmouth --with mlx-whisper python scripts/voice-picker/gemini-measure.py '{"<id>": "f"|"m", ...}'
  ... gemini-measure.py --controls   (the audit's known-accent controls, to calibrate: measures-controls.json)
Out: playtest/runs/voice-picker/gemini/measures.json, align-mlx-medium.json (cache)."""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RUN = ROOT / "playtest/runs/voice-picker/gemini"
spec = importlib.util.spec_from_file_location("audit_measure", ROOT / "scripts/voice-picker/audit-measure.py")
am = importlib.util.module_from_spec(spec)
spec.loader.exec_module(am)

CONTROLS = "--controls" in sys.argv
if CONTROLS:
    # Calibration: the same pipeline on the audit's controls (known British: eleven-alice, mac-daniel,
    # eleven-george-baron; known American: openai-coral, mac-samantha, openai-ash) and on its Sulafat/Algenib takes.
    sex = dict(am.SEX, **{"eleven-george-baron": "m", "openai-ash": "m"})
    renders = [{"id": r["cast"], "line": r["line"], "take": r["take"], "wav": r["wav"], "text": r["text"]}
               for r in json.loads((ROOT / "playtest/runs/voice-picker/audit/renders.json").read_text())
               if r["cast"] in sex]
else:
    sex = json.loads(sys.argv[1])
    renders = json.loads((RUN / "renders.json").read_text())

# Word timings: Whisper medium.en (the audit's aligner model, here as mlx-whisper on the Apple GPU: the CPU was
# too loaded for faster-whisper, 27 Sep), then snapped to the pauses. Whisper's word edges are loose (±0.1-0.3 s), and
# the measures look at the end of a word (F3 over the vowel's second half; the t in "tomato"): with mlx-whisper turbo
# (align.json) the list line's words sat ~0.25 s early, so nearly every "tomato" lost its second t and measured as a
# flap. So each word goes to the stretch of sound (between pauses of 0.25 s or more) it overlaps most, and the first
# and last word of each stretch take that stretch's edges. 0.25 s is longer than any t closure (the audit: 85-210 ms),
# so a word is never cut at its own t.
cache_p = RUN / "align-mlx-medium.json"
cache = json.loads(cache_p.read_text()) if cache_p.exists() else {}
todo = [r for r in renders if r["wav"] not in cache]
if todo:
    import mlx_whisper
    for n, r in enumerate(todo):
        res = mlx_whisper.transcribe(str(ROOT / r["wav"]), path_or_hf_repo="mlx-community/whisper-medium.en-mlx",
                                     word_timestamps=True, language="en", initial_prompt=r["text"])
        cache[r["wav"]] = [{"w": w["word"].strip(), "s": float(w["start"]), "e": float(w["end"])} for s in res["segments"] for w in s.get("words", [])]
        if n % 20 == 0:
            cache_p.write_text(json.dumps(cache, indent=1))
            print(f"  aligned {n}/{len(todo)}", flush=True)
    cache_p.write_text(json.dumps(cache, indent=1))


def islands(wav: Path, min_pause=0.25, noise="-40dB"):
    """Stretches of sound between pauses of min_pause or more."""
    import re, subprocess
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(wav), "-af", f"silencedetect=noise={noise}:d={min_pause}",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    dur = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).group(3)) + 60 * float(re.search(r"Duration: (\d+):(\d+)", err).group(2))
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    sil = sorted(zip(starts, ends + [dur] * (len(starts) - len(ends))))
    out, t = [], 0.0
    for a, b in sil:
        if a - t > 0.03:
            out.append([t, a])
        t = max(t, b)
    if dur - t > 0.03:
        out.append([t, dur])
    return out


def snap(words, isl):
    """Give the first and last word of each stretch of sound that stretch's edges."""
    if not isl or not words:
        return words
    ws = [dict(w) for w in words]
    def best(w):
        ov = [max(0.0, min(w["e"], b) - max(w["s"], a)) for a, b in isl]
        if max(ov) > 0:
            return ov.index(max(ov))
        mid = (w["s"] + w["e"]) / 2
        return min(range(len(isl)), key=lambda i: min(abs(mid - isl[i][0]), abs(mid - isl[i][1])))
    group = {}
    for i, w in enumerate(ws):
        group.setdefault(best(w), []).append(i)
    for k, idx in group.items():
        a, b = isl[k]
        ws[idx[0]]["s"] = a
        ws[idx[-1]]["e"] = b
        for i in idx:  # keep every word inside its stretch
            ws[i]["s"], ws[i]["e"] = max(a, min(ws[i]["s"], b)), min(b, max(ws[i]["e"], a))
    return ws


out_p = RUN / ("measures-controls.json" if CONTROLS else "measures.json")
out = {}
by = {}
for r in renders:
    by.setdefault(r["id"], []).append(r)
for cid, rs in sorted(by.items()):
    tracks = {r["wav"]: am.Track(ROOT / r["wav"], sex.get(cid, "f")) for r in rs}
    base = am.speaker_f3(tracks.values())
    ms = []
    for r in rs:
        words = [(w["w"], w["s"], w["e"]) for w in snap(cache[r["wav"]], islands(ROOT / r["wav"]))]
        for m in am.measure_clip(tracks[r["wav"]], words, base):
            m["line"], m["take"] = r["line"], r["take"]
            ms.append(m)
    bath = am.bath_index(ms)
    start, trap = bath["f2_start"], bath["f2_trap"]
    if start and trap and trap - start >= 150:
        for m in ms:
            if m["word"] in am.BATH_WORDS | {"tomato"} and m.get("f2"):
                m["bath_index"] = round((m["f2"] - start) / (trap - start), 2)
    out[cid] = {"baseline_f3": round(base) if base else None, "bath": bath, "measures": ms}
    print(cid, "measured", len(ms), "tokens", flush=True)
out_p.write_text(json.dumps(out, indent=1))
print("wrote", out_p)
