"""Method E, step 2: pick each F5-TTS edit's better seed (Whisper hears the target words, then the lower WER, then
seed 0), finish it like every other clip (trim, fades, −16 LUFS) and list it for measure.py and judge.ts
(playtest/runs/speech-templates/e_items.json). The joins are the edges of the regenerated region.
Run: playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/e_finish.py
"""
from __future__ import annotations

import re
import sys
import warnings

warnings.filterwarnings("ignore")
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from lib import *  # noqa: E402,F403


def norm(s):
    return [x for x in re.sub(r"[^a-z' ]", " ", s.lower()).split() if x]


def main():
    from faster_whisper import WhisperModel
    wm = WhisperModel("medium.en", device="cpu", compute_type="int8")
    rep = json.loads((RUNS / "f5_report.json").read_text())
    jobs = {j["id"]: j for j in json.loads((RUNS / "f5_jobs.json").read_text())}
    by = {}
    for r in rep["jobs"]:
        by.setdefault(r["id"], []).append(r)
    items = []
    for jid, runs in by.items():
        j = jobs[jid]
        want = norm(j["target"])
        scored = []
        for r in runs:
            segs, _ = wm.transcribe(str(ROOT / r["file"]), language="en", beam_size=5, temperature=0,
                                    condition_on_previous_text=False)
            heard = norm(" ".join(s.text for s in segs))
            hit = all(w.lower() in heard or (w.lower() == "kai" and any(h in heard for h in ("kye", "ky", "chi")))
                      for w in j["item"])
            miss = sum(1 for w in want if w not in heard)
            scored.append((not hit, miss, r["seed"], r, " ".join(heard)))
        scored.sort(key=lambda s: s[:3])
        _, _, seed, r, heard = scored[0]
        x = load(ROOT / r["file"])
        y = finish(x)
        _, off = trim(x)
        joins = []
        for a, b in r["regions"]:
            if a > 0.02:
                joins.append((round(a - off, 4), round(a - off, 4)))
            if b < len(x) / SR - 0.02:
                joins.append((round(b - off, 4), round(b - off, 4)))
        wav = RUNS / f"out/E/{jid}.wav"
        save_wav(y, wav)
        mp3 = EXP / "E" / f"{jid}.mp3"
        save_mp3(wav, mp3)
        items.append(dict(method="E", template=j["template"], item=j["item"], id=jid, label=j["label"],
                          wav=str(wav.relative_to(ROOT)), mp3=str(mp3.relative_to(ROOT)), joins=joins,
                          seed=seed, seconds_gen=r["seconds"], seed_heard=[s[4] for s in scored]))
        print(jid, "seed", seed, "|", heard, flush=True)
    dump(items, RUNS / "e_items.json")


if __name__ == "__main__":
    main()
