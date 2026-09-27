# Lint only the new lines with jev-lint-lines.ts and MERGE them into playtest/jev/lines.json (running it with --only
# rewrites the whole file with just those rows: the known gotcha). Keeps every other row and finding as it was.
#   python3 playtest/voice/jev-merge.py [ids-file]      (default playtest/voice/ids-all.txt; needs doppler os/dev)
import json, pathlib, shutil, subprocess, sys, datetime
ROOT = pathlib.Path(__file__).resolve().parents[2]
LJ = ROOT / "playtest/jev/lines.json"
ids = [i for i in (pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "playtest/voice/ids-all.txt").read_text().split() if i]
run = ROOT / "playtest/runs/voice"
run.mkdir(parents=True, exist_ok=True)
before = json.loads(LJ.read_text())
shutil.copy(LJ, run / "jev-lines.before.json")
r = subprocess.run(["doppler", "run", "-p", "os", "-c", "dev", "--", "bun", "scripts/treadmill/jev-lint-lines.ts", str(run), "--only", ",".join(ids)],
                   cwd=ROOT, capture_output=True, text=True)
(run / "jev-lint.log").write_text(r.stdout + r.stderr)
if r.returncode != 0:
    shutil.copy(run / "jev-lines.before.json", LJ)
    sys.exit(f"jev-lint-lines failed ({r.returncode}); lines.json restored. See {run / 'jev-lint.log'}")
new = json.loads(LJ.read_text())
shutil.copy(LJ, run / "jev-lines.new-only.json")
got = {row["id"] for row in new["rows"]}
case = lambda f: f["case"].split(":", 1)[1]
merged = dict(before)
merged["generated"] = new["generated"]
merged["merged"] = {"at": datetime.datetime.now().isoformat(timespec="seconds"), "ids": len(got), "usage": new["usage"], "note": "teacher-voice lines lane: only these ids re-linted; every other row is from the earlier full run"}
merged["rows"] = [row for row in before["rows"] if row["id"] not in got] + new["rows"]
merged["findings"] = [f for f in before["findings"] if case(f) not in got] + new["findings"]
tmp = LJ.with_suffix(".json.tmp")
tmp.write_text(json.dumps(merged, indent=1, ensure_ascii=False) + "\n")
tmp.replace(LJ)
print(f"linted {len(got)} of {len(ids)}; rows {len(before['rows'])} → {len(merged['rows'])}; findings for them: {len(new['findings'])}")
for f in new["findings"]:
    print(f"  {f['severity']:6} {f['title']} — {f['detail'][:120]}")
