# After a re-take pass: compare each new take (public/a/l/<id>.mp3) with the old one (in --old), by rank.py's score over
# the QA and the listening judge, and keep the better. The loser goes to --old as <id>.lost.mp3 (never deleted), and the
# audio report gets the kept take's entry back. Writes <out>: per id, both scores and which was kept.
#   python3 playtest/voice/keep-better.py --ids-file playtest/voice/ids-worst.txt --old .trash/voice-lane/worst-pass1 \
#     --qa-new q1.json --qa-old q0.json --judge-new j1.json --judge-old j0.json --report-old before.json --out result.json
import argparse, json, pathlib, shutil, sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "playtest/voice"))
from rank import score  # noqa: E402

ap = argparse.ArgumentParser()
for k in ("--ids-file", "--old", "--qa-new", "--qa-old", "--judge-new", "--judge-old", "--report-old", "--out"):
    ap.add_argument(k, required=True)
a = ap.parse_args()
ids = pathlib.Path(a.ids_file).read_text().split()
old_dir = ROOT / a.old
L = lambda p: json.loads(pathlib.Path(p).read_text())
qn, qo = L(a.qa_new)["clips"], L(a.qa_old)["clips"]
jn, jo = L(a.judge_new), L(a.judge_old)
ro = L(a.report_old)
REPORT = ROOT / "assets-src/audio-report.json"
rep = L(REPORT)
out = {}
for i in ids:
    new_mp3, old_mp3 = ROOT / f"public/a/l/{i}.mp3", old_dir / f"{i}.mp3"
    gn = rep.get(f"public/a/l/{i}.mp3", {})
    wn, wo = score(qn[i], jn.get(i, {}), gn), score(qo[i], jo.get(i, {}), ro.get(i) or {})
    sn, so = round(sum(wn.values()), 2), round(sum(wo.values()), 2)
    keep = "new" if sn <= so else "old"
    if keep == "old":
        shutil.move(new_mp3, old_dir / f"{i}.lost.mp3")
        shutil.move(old_mp3, new_mp3)
        if ro.get(i): rep[f"public/a/l/{i}.mp3"] = ro[i]
    else:
        shutil.move(old_mp3, old_dir / f"{i}.lost.mp3")
    out[i] = {"kept": keep, "new": {"score": sn, "why": wn}, "old": {"score": so, "why": wo}}
tmp = REPORT.with_suffix(".json.tmp")
tmp.write_text(json.dumps(rep, indent=1))
tmp.replace(REPORT)
pathlib.Path(a.out).write_text(json.dumps(out, indent=1) + "\n")
kept_new = sum(v["kept"] == "new" for v in out.values())
print(f"kept the new take for {kept_new} of {len(out)}; the old one for {len(out) - kept_new}")
for i, v in out.items(): print(f"  {i:28} {v['kept']:4} new {v['new']['score']:6.2f}  old {v['old']['score']:6.2f}")
