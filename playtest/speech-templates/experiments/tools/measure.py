"""Speech-template experiment, step 3: objective measures of every clip in build.json (and E's, once finished).

- Whisper (faster-whisper medium.en, int8, CPU): word error rate against the method's own script; for T3/T4 the
  carrier words only (the pure sound isn't a word), plus whether every slot word was heard.
- Join metrics at each join (a = end of speech before it, b = start of speech after; a == b for a tight splice):
    f0_st      |F0 step| in semitones: last 3 voiced frames within 250 ms before a vs first 3 within 250 ms after b
    level_db   |K-weighted level step| of the speech within 200 ms each side
    energy_db  |RMS step| over the 20 ms either side (tight joins only; across a pause it is 0 by construction)
    spec       MFCC c1-c12 distance between the 10-20 ms before a and after b (tight joins only)
  A's clips are single takes: their "joins" are the slot word's boundaries, the natural reference.
Run: playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/measure.py
"""
from __future__ import annotations

import re
import sys
import warnings

warnings.filterwarnings("ignore")
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from lib import *  # noqa: E402,F403

B = json.loads((RUNS / "build.json").read_text())
items = list(B["items"])
e_path = RUNS / "e_items.json"
if e_path.exists():
    items += json.loads(e_path.read_text())

SOUND_T = ("T3", "T4")
B_TEXT = {"T1": "say this word slowly {0}", "T2": "can you find {0}", "T3": "say this sound", "T4": "change this sound to this sound",
          "T5": "the one who read it right is {0}", "T6": "tap {0} then tap {1}"}
# Whisper spells some slot words as names or homophones; those count as heard
HOMO = {"kai": {"kai", "kye", "ky", "chi", "kaye", "kie"}, "suki": {"suki", "sookie", "suky", "sukey", "sooki"},
        "mat": {"mat", "matt", "matte"}, "sun": {"sun", "son"}, "to": {"to", "two", "too"}, "rain": {"rain", "reign"}}


def expected(it):
    t, m, w = it["template"], it["method"], it["item"]
    if t in SOUND_T:
        base = B_TEXT[t] if m == "B" else ("say the sound" if t == "T3" else "change to")
        return base.split(), []
    if m == "B":
        s = B_TEXT[t].format(*w)
    else:
        s = it["label"]
    return norm(s), [x.lower() for x in w]


def norm(s):
    return [x for x in re.sub(r"[^a-z' ]", " ", s.lower()).split() if x]


def edit_distance(a, b):
    d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            cur = d[j]
            d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] != b[j - 1]))
            prev = cur
    return d[len(b)]


def lcs(a, b):
    m = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a)):
        for j in range(len(b)):
            m[i + 1][j + 1] = m[i][j] + 1 if a[i] == b[j] else max(m[i][j + 1], m[i + 1][j])
    return m[-1][-1]


def join_metrics(x, a, b):
    t, f = pitch(x)
    before = f[(t < a) & (t >= a - 0.25) & (f > 0)]
    after = f[(t > b) & (t <= b + 0.25) & (f > 0)]
    f0 = float("nan")
    if len(before) >= 3 and len(after) >= 3:
        f0 = abs(st(float(np.median(before[-3:])), float(np.median(after[:3]))))
    k = kweight(x)
    tt, db = frame_db(k, 0.005, 0.02)
    top = db.max()

    def lvl(lo, hi):
        sel = (tt >= lo) & (tt <= hi) & (db > top - 35)
        return float(10 * np.log10(np.mean(10 ** (db[sel] / 10)))) if sel.sum() >= 2 else float("nan")
    level = abs(lvl(a - 0.2, a) - lvl(b, b + 0.2))
    tight = (b - a) < 0.03
    energy = spec = float("nan")
    if tight:
        te, de = frame_db(x, 0.0025, 0.02)
        e1 = de[(te <= a) & (te >= a - 0.02)]; e2 = de[(te >= b) & (te <= b + 0.02)]
        live = len(e1) and len(e2) and max(e1.mean(), e2.mean()) > de.max() - 40
        if live:
            energy = abs(float(e1.mean() - e2.mean()))
            tm, mm = mfcc(x)
            m1 = mm[(tm <= a - 0.01) & (tm >= a - 0.02)]; m2 = mm[(tm >= b + 0.01) & (tm <= b + 0.02)]
            if len(m1) and len(m2):
                spec = float(np.linalg.norm(m1.mean(0) - m2.mean(0)))
    return dict(f0_st=f0, level_db=level, energy_db=energy, spec=spec, tight=bool(tight))


def main():
    from faster_whisper import WhisperModel
    wm = WhisperModel("medium.en", device="cpu", compute_type="int8")
    prev = json.loads((RUNS / "metrics.json").read_text()) if (RUNS / "metrics.json").exists() else []
    done = {(r["method"], r["id"]): r for r in prev}
    res = []
    for it in items:
        cached = done.get((it["method"], it["id"])) if "--all" not in sys.argv else None
        x = load(ROOT / it["wav"])
        if cached:
            heard, joins = cached["heard"], cached["joins"]
        else:
            segs, _ = wm.transcribe(str(ROOT / it["wav"]), language="en", beam_size=5, temperature=0, vad_filter=False,
                                    condition_on_previous_text=False)
            heard = " ".join(s.text for s in segs).strip()
            joins = [join_metrics(x, a, b) for a, b in it["joins"]]
        hw = norm(heard)
        exp, slots = expected(it)
        # names: count a homophone as the name
        hw2 = [next((n for n, hs in HOMO.items() if w in hs), w) for w in hw]
        if it["template"] in SOUND_T:
            wer = 1 - lcs(exp, hw2) / len(exp)  # carrier recall miss rate (the sounds may add tokens)
        else:
            wer = edit_distance(exp, hw2) / len(exp)
        slot_ok = all(s in hw2 for s in slots) if slots else None
        res.append(dict(id=it["id"], method=it["method"], template=it["template"], heard=heard, wer=round(wer, 3),
                        slot_ok=slot_ok, joins=joins, seconds=round(len(x) / SR, 3)))
        if not cached:
            print(it["method"], it["id"], round(wer, 2), slot_ok, "|", heard, flush=True)
    dump(res, RUNS / "metrics.json")


if __name__ == "__main__":
    main()
