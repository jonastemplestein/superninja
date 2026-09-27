# The first QA of every clip, re-scored with qa.py's current comparison (homophones where the script has the word):
# the Whisper transcripts saved by the first QA runs of each recording pass, before any re-take.
#   uv run -q --with numpy python playtest/voice/first-qa.py   → playtest/voice/qa-first.json
import json, sys, difflib, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "playtest/voice"))
from qa import norm, homophones  # noqa: E402
runs = ROOT / "playtest/runs/voice"
retake1 = set((ROOT / "playtest/voice/ids-retake1.txt").read_text().split())
first = {}
for f, skip in (("qa-first-tier1.json", set()), ("qa-first-run2.json", set()), ("qa-first-run3.json", retake1)):
    for i, v in json.loads((runs / f).read_text())["clips"].items():
        if i in skip or i in first: continue
        want, got = norm(v["text"]), norm(v["heard"])
        ops = [o for o in difflib.SequenceMatcher(None, want, got).get_opcodes() if o[0] != "equal"]
        ops = [o for o in ops if not (o[0] == "replace" and homophones(want[o[1]:o[2]], got[o[3]:o[4]]))]
        first[i] = {"exact": not ops or "".join(want) == "".join(got), "heard": v["heard"], "text": v["text"], "source": f}
n = len(first); ok = sum(v["exact"] for v in first.values())
out = {"clips": n, "exact": ok, "rate": round(ok / n, 4), "not_exact": {i: v["heard"] for i, v in first.items() if not v["exact"]}}
(ROOT / "playtest/voice/qa-first.json").write_text(json.dumps(out, indent=1) + "\n")
print(json.dumps(out, indent=1))
