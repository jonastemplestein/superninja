"""Summarise a blind-judge file: mean confidence per accent family, per cast (and per clip with -v)."""
import json, sys, collections, statistics as st
path = sys.argv[1]; verbose = "-v" in sys.argv
d = json.load(open(path))
BRIT = {"Southern British English"}
OTHER_UK = {"Northern English", "Scottish", "Irish"}
NA = {"General American", "Canadian"}
def fam(conf):
    tot = sum(v for v in conf.values() if isinstance(v, (int, float))) or 1
    g = lambda s: sum(conf.get(k, 0) for k in s) / tot * 100
    return g(BRIT), g(OTHER_UK), g(NA), 100 - g(BRIT) - g(OTHER_UK) - g(NA)
by = collections.defaultdict(list)
for k, v in sorted(d.items()):
    fs = [fam(x["confidence"]) for x in v["votes"] if x and "confidence" in x]
    if not fs: continue
    top = [max(x["confidence"], key=x["confidence"].get) for x in v["votes"] if x and "confidence" in x]
    by[v["cast"]].append((k, fs, top))
    if verbose:
        print(f"  {k:34s} SSB {st.mean(f[0] for f in fs):5.1f}  NAm {st.mean(f[2] for f in fs):5.1f}  top={collections.Counter(top).most_common(2)}")
print(f"{'cast':30s} clips  SSB%  otherUK%  NorthAm%  other%  top-choice counts")
for c, rows in by.items():
    allf = [f for _, fs, _ in rows for f in fs]
    tops = collections.Counter(t for _, _, ts in rows for t in ts)
    print(f"{c:30s} {len(rows):5d} {st.mean(f[0] for f in allf):5.1f} {st.mean(f[1] for f in allf):8.1f} {st.mean(f[2] for f in allf):9.1f} {st.mean(f[3] for f in allf):7.1f}  {dict(tops.most_common(3))}")
