#!/usr/bin/env python3
"""QA for recorded line clips: word-perfect (faster-whisper), no letter names, pace, loudness, lead-in tails.

  bun playtest/voice/texts.ts                      # writes playtest/voice/texts.json: {id: text} for the lines to check
  uv run -q --with numpy --with praat-parselmouth --with faster-whisper \
    python playtest/voice/qa.py [--ids a,b] [--out playtest/voice/qa.json] [--words id,id] [--model small.en]

Per clip:
  exact      Whisper's transcript equals the script, after normalising case, punctuation, numbers and a few spellings
             Whisper can't know (Kai/Kye, practise/practice, compounds written apart, and homophones where the script has
             the word: "mat" heard as "Matt", "bee" as "B", "to"/"too")
  letters    a letter name or a lone letter heard that isn't in the script
  wps        words a second over the finished clip (≤ 3.3: TEACHER_SCRIPT §7.4); words counted as script-audit's
             `wordCount` counts them (space-separated pieces with a letter: "grown-up" is one), which gen-audio.ts imports
  lufs       integrated loudness; −16 for a sentence, −19 for a clip under 1.2 s (±1 LU)
  blip       a lead-in's stray tail (a short burst after a pause at the very end), as tts.ts trailingBlip()
  fall       a lead-in's pitch fall over its last 300 ms of voicing, in semitones, as the gate measures it (Praat AC
             pitch 120–500 Hz at 24 kHz, frames over 6 st from the median dropped, a fitted line); fall_low: the same
             from 75 Hz with octave jumps folded back (gen-audio.ts tailFalls()). A check: either over 2 is
             `lead_falling` (TEACHER_SCRIPT §1)
--words writes public/a/l/<id>.words.json for the lines that spotlight things: each word's start ("at", moved to the
speech island it begins, as gen-teach-word-times.py does) and Whisper's span (start, end), in seconds.
"""
from __future__ import annotations
import argparse, difflib, json, math, re, subprocess, tempfile
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
CLIPS = ROOT / "public/a/l"
GLOSSARY = ("Sensei Maple, Kai, Suki, Baron Muddle, dojo, ninja, World Flower, Bamboo Village, Pocket Hunt, Word Squish, "
            "Ninja Ears, Ninja Eyes, Sound Swap, Sound Hunt, Sound Dots, Story Time, Sticker Book, tiptoe, sunflower, starfish.")
NUMS = {str(i): w for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve".split())}
ALIAS = {"kye": "kai", "ky": "kai", "chi": "kai", "sookie": "suki", "sukey": "suki", "sooki": "suki", "suky": "suki",
         "hm": "hmm", "mm": "hmm", "mmm": "hmm", "hmmm": "hmm", "practice": "practise", "practiced": "practised",
         "learned": "learnt", "okay": "ok", "tip-toe": "tiptoe", "sensai": "sensei", "dojos": "dojo",
         "whoa": "woah",
         # homophones in Southern British English: the audio can't tell them apart, so neither can the check
         "too": "to", "two": "to", "pour": "paw", "pore": "paw", "poor": "paw"}
LETTER_NAMES = {"ess", "em", "en", "tee", "dee", "bee", "cee", "pee", "kay", "gee", "jay", "aitch", "haitch", "eff",
                "el", "ell", "zed", "zee", "ex", "vee", "double", "ay"}


def norm(t: str) -> list[str]:
    t = t.lower().replace("…", " ").replace("...", " ").replace("-", " ").replace("’", "'")
    t = re.sub(r"[^a-z0-9' ]+", " ", t)
    out = []
    for w in t.split():
        w = w.strip("'")
        w = NUMS.get(w, w)
        out.append(ALIAS.get(w, w))
    return [w for w in out if w]


# Spellings Whisper picks for a word the script has, that sound the same in Southern British English: counted as the
# script's word only where the script has it, so a stray letter name elsewhere still fails.
HOMOPHONES = [{"mat", "matt"}, {"pie", "pi"}, {"tray", "trey"}, {"bee", "b", "be"}, {"for", "four"}, {"read it", "reddit"},
              {"sun", "son"}, {"sea", "see", "c"}, {"tea", "tee", "t"}, {"knight", "night"}, {"high", "hi"}, {"tail", "tale"},
              {"write", "right"}, {"won", "one"}, {"pan", "pam"}, {"sock", "sok"}, {"yak", "yack"}, {"kit", "kitt"}]


def homophones(want: list[str], got: list[str]) -> bool:
    w, g = " ".join(want), " ".join(got)
    if w == g: return True
    if any(w in h and g in h for h in HOMOPHONES): return True
    return len(want) == len(got) and all(x == y or any(x in h and y in h for h in HOMOPHONES) for x, y in zip(want, got))


def ffprobe_dur(p: Path) -> float:
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout.strip())


def lufs(p: Path) -> float:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1]) if m else float("nan")


def blip(p: Path, dur: float) -> float | None:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "silencedetect=noise=-42dB:d=0.1", "-f", "null", "-"],
                       capture_output=True, text=True)
    ends = [(float(a), float(b)) for a, b in re.findall(r"silence_end: ([\d.]+) \| silence_duration: ([\d.]+)", r.stderr)]
    if not ends: return None
    end, gap = ends[-1]
    if end >= dur - 0.02: return None
    island = dur - end
    return round(island, 2) if gap >= 0.2 and island < 0.7 and end > dur * 0.55 else None


def tail_fall(p: Path) -> dict:
    """gen-audio.ts tailFalls(): the gate's measure (120–500 Hz, frames over 6 st from the median dropped) and the
    low-floor one (75–500 Hz, octave jumps folded back), each the fall of a line fitted to the last 300 ms of voicing."""
    import parselmouth
    with tempfile.TemporaryDirectory() as td:
        wav = f"{td}/a.wav"
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(p), "-ac", "1", "-ar", "24000", wav], check=True)
        s = parselmouth.Sound(wav)
    def fit(t, st):
        return round(float(-np.polyfit(t, st, 1)[0] * (t[-1] - t[0])), 2) if len(t) >= 4 else None
    out = {}
    for name, floor in (("gate", 120), ("low", 75)):
        pitch = s.to_pitch_ac(time_step=0.01, pitch_floor=floor, pitch_ceiling=500)
        f = pitch.selected_array["frequency"]; t = pitch.xs()
        v = np.where(f > 0)[0]
        if len(v) < 5: out[name] = None; continue
        st = 12 * np.log2(np.maximum(f, 1) / 100)
        if name == "gate":
            m = (t >= t[v[-1]] - 0.3) & (f > 0)
            tt, ff = t[m], st[m]
            keep = np.abs(ff - np.median(ff)) < 6 if len(tt) else []
            out[name] = fit(tt[keep], ff[keep]) if len(tt) >= 4 else None
        else:
            for a, b in zip(v[:-1], v[1:]):
                while st[b] - st[a] > 7: st[b] -= 12
                while st[a] - st[b] > 7: st[b] += 12
            m = [i for i in v if t[i] >= t[v[-1]] - 0.3]
            out[name] = fit(t[m], st[m])
    return out


def islands(p: Path) -> list[float]:
    """Starts (s) of speech islands: sound after at least 50 ms 27 dB under the clip's peak (gen-teach-word-times.py)."""
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(p), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    e = np.array([np.sqrt(np.mean(x[i:i + 320] ** 2)) + 1e-6 for i in range(0, max(1, len(x) - 320), 160)])
    db = 20 * np.log10(e)
    quiet = db < db.max() - 27
    starts, run = [], 99
    for i, q in enumerate(quiet):
        if q: run += 1
        else:
            if run >= 5: starts.append(i / 100)
            run = 0
    return starts


def place(words: list[dict], isl: list[float]) -> list[dict]:
    """Whisper stretches a word's start back into a pause before it, so a word starts at the first speech island that
    begins inside its span, if one does (gen-teach-word-times.py place())."""
    prev = -1.0
    for w in words:
        cand = [t for t in isl if w["start"] - 0.05 <= t < w["end"] - 0.05 and t > prev + 0.05]
        w["at"] = round(max(cand[0] if cand else w["start"], prev + 0.05), 2)
        prev = w["at"]
    return words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--texts", type=Path, default=ROOT / "playtest/voice/texts.json")
    ap.add_argument("--ids", default="")
    ap.add_argument("--out", type=Path, default=ROOT / "playtest/voice/qa.json")
    ap.add_argument("--words", default="", help="ids to write word timings for (public/a/l/<id>.words.json)")
    ap.add_argument("--model", default="small.en")
    ap.add_argument("--merge", action="store_true", help="update an existing --out file with these ids")
    ap.add_argument("--dir", type=Path, default=CLIPS, help="where the clips are (default public/a/l)")
    a = ap.parse_args()
    texts: dict[str, str] = json.loads(a.texts.read_text())
    ids = [i for i in a.ids.split(",") if i] or list(texts)
    words_for = set(i for i in a.words.split(",") if i)
    from faster_whisper import WhisperModel
    model = WhisperModel(a.model, device="cpu", compute_type="int8", cpu_threads=8)
    res = json.loads(a.out.read_text())["clips"] if a.merge and a.out.exists() else {}
    for n, i in enumerate(ids, 1):
        text = texts[i]
        p = a.dir / f"{i}.mp3"
        if not p.exists():
            res[i] = {"text": text, "missing": True}
            continue
        segs, _ = model.transcribe(str(p), language="en", beam_size=5, temperature=0, condition_on_previous_text=False,
                                   initial_prompt=GLOSSARY, word_timestamps=True, vad_filter=False)
        segs = list(segs)
        heard = " ".join(s.text.strip() for s in segs).strip()
        want, got = norm(text), norm(heard)
        ops = [o for o in difflib.SequenceMatcher(None, want, got).get_opcodes() if o[0] != "equal"]
        # a word Whisper spells as its homophone, where the script has that word ("mat" heard as "Matt")
        ops = [o for o in ops if not (o[0] == "replace" and homophones(want[o[1]:o[2]], got[o[3]:o[4]]))]
        exact = not ops or "".join(want) == "".join(got)
        diff = [] if exact else [f"{op} {' '.join(want[a1:a2])!r}→{' '.join(got[b1:b2])!r}" for op, a1, a2, b1, b2 in ops]
        extra = [w for o in ops for w in got[o[3]:o[4]]]
        letters = sorted({w for w in extra if w not in want and (w in LETTER_NAMES or (len(w) == 1 and w not in ("a", "i")))})
        dur = ffprobe_dur(p)
        nw = len([w for w in text.split() if re.search("[A-Za-z]", w)])  # script-audit wordCount (gen-audio uses it too)
        wps = round(nw / dur, 2) if nw >= 2 else 0.0
        L = lufs(p)
        target = -19.0 if dur < 1.2 else -16.0
        lead = text.rstrip().endswith("...")
        clarity = round(float(np.mean([sg.avg_logprob for sg in segs])), 3) if segs else None
        r = {"text": text, "heard": heard, "exact": exact, "logprob": clarity, "diff": diff, "letters": letters, "seconds": round(dur, 2),
             "words": nw, "wps": wps, "fast": wps > 3.3, "lufs": L, "target": target,
             "lufs_ok": (not math.isfinite(L)) or L < -60 or abs(L - target) <= 1.0, "lead": lead}
        if lead:
            r["blip"] = blip(p, dur)
            fl = tail_fall(p)
            r["fall"], r["fall_low"] = fl["gate"], fl["low"]
        if i in words_for:
            ws = [{"w": re.sub(r"[^A-Za-z']", "", w.word), "start": round(w.start, 2), "end": round(w.end, 2)}
                  for s in segs for w in (s.words or []) if re.search("[A-Za-z]", w.word)]
            ws = place(ws, islands(p))
            (CLIPS / f"{i}.words.json").write_text(json.dumps({"id": i, "text": text, "note": "at: when each word starts (s), for spotlights; start/end: Whisper's span", "words": ws}) + "\n")
            r["timed"] = True
        res[i] = r
        if n % 25 == 0: print(f"{n}/{len(ids)}", flush=True)
    rows = [v for k, v in res.items() if not v.get("missing")]
    summary = {
        "clips": len(res), "missing": sorted(k for k, v in res.items() if v.get("missing")),
        "exact": sum(v["exact"] for v in rows), "not_exact": sorted(k for k, v in res.items() if not v.get("missing") and not v["exact"]),
        "letters": sorted(k for k, v in res.items() if v.get("letters")),
        "fast": sorted(k for k, v in res.items() if v.get("fast")),
        "loudness_off": sorted(k for k, v in res.items() if not v.get("missing") and not v["lufs_ok"]),
        "lead_blips": sorted(k for k, v in res.items() if v.get("blip") is not None),
        "lead_falling": sorted(k for k, v in res.items() if max(v.get("fall") or 0, v.get("fall_low") or 0) > 2),
        "model": a.model,
    }
    summary["exact_rate"] = round(summary["exact"] / max(1, len(rows)), 4)
    a.out.write_text(json.dumps({"summary": summary, "clips": res}, indent=1) + "\n")
    print(json.dumps({k: (v if not isinstance(v, list) or len(v) < 30 else f"{len(v)} ids") for k, v in summary.items()}, indent=1))


if __name__ == "__main__":
    main()
