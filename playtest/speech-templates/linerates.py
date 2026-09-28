import sys, collections, json
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from freq2 import pairs, fam
from freq import LINES
srcs = {
 "runA": "playtest/runs/teacher-voice/run-a/events.json",
 "jL": "playtest/transcripts/2026-09-26-script-editor/journey-learner.json",
 "jP": "playtest/transcripts/2026-09-26-script-editor/journey-perfect.json",
}
R = {}
for k, p in srcs.items():
    a, b, T, lc, ex = pairs(p)
    R[k] = (a, T, lc)
keys = set()
for k in R: keys |= set(R[k][2])
rows = []
for key in keys:
    rates = {k: R[k][2].get(key, 0) / (R[k][1] / 600) for k in R}
    slot = {}
    for k in R:
        for (l, v), n in R[k][0].items():
            if l == key: slot[v] = slot.get(v, 0) + n
    rows.append((max(rates.values()), key, rates, slot))
rows.sort(reverse=True)
print("T(min):", {k: round(R[k][1]/60,1) for k in R})
for m, key, rates, slot in rows[:170]:
    print(f"{key:28s} runA {rates['runA']:5.2f}  jL {rates['jL']:5.2f}  jP {rates['jP']:5.2f}   slots {slot}  «{LINES.get(key, '')[:60]}»")
json.dump({key: {"rates": rates, "slot": slot} for m, key, rates, slot in rows}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "linerates.json"), "w"), indent=1)
