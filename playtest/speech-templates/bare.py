import sys, collections
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from freq import load, norm, LINES
for path in sys.argv[1:]:
    T = 0; bare = collections.Counter(); scenes = collections.Counter(); allv = collections.Counter()
    for name, evs in load(path):
        if not evs: continue
        T += max(e["t"] for e in evs) - min(e["t"] for e in evs)
        prev = None; taps = []; scene = name
        for e in evs:
            if e.get("kind") == "scene": scene = e.get("text")
            if e.get("kind") == "tap": taps.append((e["t"], str(e.get("text","")).lower())); continue
            n = norm(e)
            if not n: continue
            kind, i, txt, d = n; t = e["t"]
            if kind != "line":
                echo = any(0 <= t - tt <= 0.9 and (tx == txt.lower() or kind == "sound") for tt, tx in taps[-4:])
                if not echo:
                    allv[kind] += 1
                    lead = prev and prev[0] == "line" and t <= prev[3] + 0.7 and LINES.get(prev[1], "").rstrip().endswith("...")
                    chain = prev and prev[0] != "line" and t <= prev[3] + 0.7
                    if not lead and not chain and kind in ("word", "stretch"):
                        bare[kind] += 1; scenes[(name.split("-")[0] if name != "all" else scene, kind)] += 1
            prev = (kind, i, txt, t + d)
    print(path, f"{T/60:.1f} min", "non-echo var clips", dict(allv), "bare word prompts", dict(bare), {k: round(v/(T/600),2) for k, v in bare.items()})
