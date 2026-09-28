"""Speech-template pilot: the render's numbers from the generator's journal (playtest/runs/speech-templates/pilot/_gen).
Writes stats.json (read by page.ts).  python3 playtest/speech-templates/pilot/stats.py
"""
import json
import statistics
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
RUN = ROOT / "playtest/runs/speech-templates/pilot"
plan = [json.loads(l) for l in (RUN / "_gen/plan.jsonl").read_text().splitlines() if l.strip()]
last = {}
for line in (RUN / "_gen/journal.jsonl").read_text().splitlines():
    if line.strip():
        e = json.loads(line)
        last[e["clip"]] = e  # the latest outcome of each piece (a re-render supersedes)
entries = [json.loads(l) for l in (RUN / "_gen/journal.jsonl").read_text().splitlines() if l.strip()]
man = json.loads((RUN / "manifest.json").read_text())
want = {p["clip"] for p in plan}
def in_manifest(clip):
    tpl, pk = clip[2:].split("/", 1)
    return pk in man["templates"].get(tpl, {}).get("entries", {})


recorded = sum(1 for p in plan if in_manifest(p["clip"]))
failed = [c for c in want if c in last and not last[c]["ok"]]
per = defaultdict(lambda: {"pieces": 0, "ok": 0, "failed": 0, "takes": [], "silence": [], "tightened": 0, "judged": 0})
for c in want:
    t = c[2:].split("/")[0]
    per[t]["pieces"] += 1
    e = last.get(c)
    if not e:
        continue
    per[t]["ok" if e["ok"] else "failed"] += 1
    per[t]["takes"].append(e.get("takes", 0))
    if e["ok"]:
        per[t]["silence"].append(e.get("silence", 0))
        per[t]["tightened"] += 1 if e.get("tightened") else 0
        per[t]["judged"] += 1 if e.get("judge") is not None else 0
start = int((RUN / "_gen-start").read_text()) if (RUN / "_gen-start").exists() else None
end = int((RUN / "_gen-end").read_text()) if (RUN / "_gen-end").exists() else None
extra = json.loads((HERE / "rerender-minutes.json").read_text()) if (HERE / "rerender-minutes.json").exists() else {}
out = {
    "pieces": len(want), "recorded": recorded, "failed": len(failed), "failed_clips": sorted(failed),
    "takes": sum(e.get("takes", 0) for e in entries), "judged": sum(1 for e in entries if e.get("judge") is not None),
    "minutes": round(((end - start) if start and end else 0) / 60 + sum(extra.values())),
    "render_minutes": {"first run": round(((end - start) if start and end else 0) / 60), **extra},
    "by_template": {t: {"pieces": v["pieces"], "ok": v["ok"], "failed": v["failed"], "takes/piece": round(statistics.mean(v["takes"]), 2) if v["takes"] else 0,
                        "odd pause p50": statistics.median(v["silence"]) if v["silence"] else 0, "odd pause max": max(v["silence"]) if v["silence"] else 0,
                        "tightened": v["tightened"], "judged": v["judged"]} for t, v in sorted(per.items())},
    "bytes": sum(f.stat().st_size for f in RUN.glob("*/*.mp3") if not f.parent.name.startswith("_")),
}
(HERE / "stats.json").write_text(json.dumps(out, indent=1) + "\n")
print(json.dumps(out, indent=1))
