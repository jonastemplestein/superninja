#!/usr/bin/env python3
"""What a take holds, for picking a window: speech, taps, marks and freezes (hitch events: the browser drew nothing new
for over 70 ms) from raw/<take>.timeline.json, and the take's frame stats and sync.

  python3 assets-src/clips/2026-09-27/picread/analyze.py <take> [start end]

With a window: only events inside it, and a verdict (freezes inside, a line cut at either end)."""
import json, sys, os

here = os.path.dirname(os.path.abspath(__file__))
take = sys.argv[1]
d = json.load(open(os.path.join(here, "raw", f"{take}.timeline.json")))
a = float(sys.argv[2]) if len(sys.argv) > 3 else None
b = float(sys.argv[3]) if len(sys.argv) > 3 else None
f = d["frames"]
print(f"{take}: {f['fps']} fps, p95 {f['p95']} ms, max {f['max']} ms, gaps>50ms {f['hitches']}, repeated {f['repeatedSlots']}/{f['slots']}; "
      f"sync shift {d['sync']['audioShiftMs']} ms, residual median {d['sync']['residualMedianMs']} max {d['sync']['residualMaxAbsMs']} {d['sync']['residualMs']}")
bad = []
for e in d["events"]:
    if e["kind"] not in ("speech", "tap", "mark", "hitch", "sting", "scene"):
        continue
    t, t1 = e["t"], e["t"] + (e.get("dur") or 0)
    if a is not None and (t1 < a - 0.5 or t > b + 0.5):
        continue
    flag = ""
    if a is not None:
        if e["kind"] == "hitch" and a <= t < b:
            bad.append(f"freeze {e['id']} at {t}")
            flag = "  <-- FREEZE"
        if e["kind"] == "speech" and t < a < t1:
            bad.append(f"starts inside {e['id']}")
            flag = "  <-- CUT"
        if e["kind"] == "speech" and t < b < t1:
            bad.append(f"ends inside {e['id']}")
            flag = "  <-- CUT"
    print(f"{t:7.2f} {e['kind']:6} {e['id']} {e.get('text','')!s:.60} {e.get('dur','')}{flag}")
if a is not None:
    print("VERDICT:", "clean" if not bad else "; ".join(bad))
