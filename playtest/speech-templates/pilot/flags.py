"""Speech-template pilot (SPT11), step 4: every join in joins-all.json against the design's limits (docs/SPEECH_TEMPLATES.md
§7.2), grouped by the recorded piece that would be re-rendered, plus the per-sound gain table §1.6 asks for.

  breath      speech to speech 150 +/- 20 ms (SPT3 at the critic's 150)      sentence   450 +/- 30 ms
  level       a pure sound's active level within +/- 3 dB of the lead-in's last 500 ms (and of the words after it)
  fall        a lead-in's tail falls <= 2 st                                   longest    <= 600 ms of silence inside
  f0          |F0 step| <= 2.5 st: the splice limit (§3.3). Across a designed pause it is information, not a gate.

Writes join-flags.json (read by page.ts). Run after assemble.py:
  playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/pilot/flags.py
"""
from __future__ import annotations

import json
import statistics
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
rows = json.loads((HERE / "joins-all.json").read_text())
prev = json.loads((HERE / "join-flags.json").read_text()) if (HERE / "join-flags.json").exists() else {}
TOL = {"breath": 20, "sentence": 30}


def sound_of(j):
    for k in ("to", "from"):
        if j.get(f"{k}_kind") == "sound":
            return Path(j[k]).stem
    return None


# the gain table: the median level step per sound, over every lead-in it follows (§1.6: gain is the only change allowed)
steps = defaultdict(list)
for r in rows:
    for j in r["joins"]:
        if j.get("level_db") is not None and j["kind"] == "breath" and j["from_kind"] == "tpl" and j["to_kind"] == "sound":
            steps[sound_of(j)].append(j["level_db"])
gain = {p: round(-statistics.median(v) * 2) / 2 for p, v in sorted(steps.items())}

flags, by_piece = [], defaultdict(list)
counts = defaultdict(lambda: {"joins": 0, "timing": 0, "level": 0, "level_after_gain": 0, "fall": 0, "longest": 0, "f0_info": 0})
for r in rows:
    c = counts[r["tpl"]]
    if r["longest_ms"] > 600:
        c["longest"] += 1
        flags.append({"where": r["id"], "what": f"longest silence {r['longest_ms']:.0f} ms (limit 600)", "piece": None, "kind": "longest"})
    for j in r["joins"]:
        c["joins"] += 1
        piece = j["from"] if j["from_kind"] == "tpl" else j["to"] if j["to_kind"] == "tpl" else None
        if j["gap_ms"] is not None and abs(j["gap_ms"] - j["design_ms"]) > TOL[j["kind"]]:
            c["timing"] += 1
            flags.append({"where": r["id"], "what": f"{j['kind']} {j['gap_ms']} ms (design {j['design_ms']} ± {TOL[j['kind']]}) {j['from']} → {j['to']}", "piece": piece, "kind": "timing"})
            by_piece[piece].append("timing")
        if j.get("level_db") is not None:
            p = sound_of(j)
            after = j["level_db"] + gain.get(p, 0)  # level_db is always the sound's level minus the speech's
            if abs(j["level_db"]) > 3:
                c["level"] += 1
            if abs(after) > 3:
                c["level_after_gain"] += 1
                flags.append({"where": r["id"], "what": f"level {j['level_db']:+.1f} dB, {after:+.1f} with the gain table ({j['from']} → {j['to']})", "piece": piece, "kind": "level"})
                by_piece[piece].append("level")
        if j.get("fall_st") is not None and j["fall_st"] > 2:
            c["fall"] += 1
            flags.append({"where": r["id"], "what": f"lead-in tail falls {j['fall_st']} st (limit 2)", "piece": piece, "kind": "fall"})
            by_piece[piece].append("fall")
        if j.get("f0_st") is not None and j["f0_st"] > 2.5:
            c["f0_info"] += 1

done = prev.get("done", {})
for f in flags:
    f["done"] = done.get(f["where"], "")
out = {
    "limits": {"breath_ms": "150 ± 20", "sentence_ms": "450 ± 30", "level_db": "± 3", "fall_st": "≤ 2", "longest_ms": "≤ 600"},
    "utterances": len(rows), "joins": sum(c["joins"] for c in counts.values()),
    "by_template": counts, "gain_table_db": gain, "level_steps_db": {p: sorted(v) for p, v in steps.items()},
    "pieces": {p: sorted(set(v)) for p, v in by_piece.items() if p},
    "flags": flags, "done": done, "regenerated": prev.get("regenerated", []),
}
(HERE / "join-flags.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(json.dumps({k: out[k] for k in ("utterances", "joins", "by_template", "gain_table_db", "pieces")}, indent=1))
print(f"{len(flags)} flags")
