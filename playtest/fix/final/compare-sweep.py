# Before/after for the sweep (FIX_PLAN §11.3): findings by kind and severity, the P0 baseline's sweep beside the final
# one(s). Run: python3 playtest/fix/final/compare-sweep.py <before sweep.json> <after sweep.json> [more after …]
import json, sys, collections

def load(p):
    d = json.load(open(p))
    f = d if isinstance(d, list) else d.get("findings", [])
    cases = None if isinstance(d, list) else len(d.get("cases", d.get("stats", [])) or [])
    return f, cases

def kinds(fs):
    c = collections.Counter()
    for x in fs:
        k = x.get("title", "").split(":")[0]
        c[(k, x.get("severity"))] += 1
    return c

before, bcases = load(sys.argv[1])
afters = [load(p) for p in sys.argv[2:]]
kb = kinds(before)
kas = [kinds(a[0]) for a in afters]
keys = sorted(set(kb) | set().union(*[set(k) for k in kas]), key=lambda k: (["blocker", "major", "minor"].index(k[1]) if k[1] in ("blocker", "major", "minor") else 9, k[0]))
sev = lambda fs, s: sum(1 for x in fs if x.get("severity") == s)
print(f"before: {len(before)} findings ({sev(before,'blocker')} blockers, {sev(before,'major')} majors, {sev(before,'minor')} minors), cases {bcases}")
for i, (a, c) in enumerate(afters):
    print(f"after {i+1}: {len(a)} findings ({sev(a,'blocker')} blockers, {sev(a,'major')} majors, {sev(a,'minor')} minors), cases {c}")
print("\n| kind | severity | before | " + " | ".join(f"after {i+1}" for i in range(len(afters))) + " |")
print("|---|---|---|" + "---|" * len(afters))
for k in keys:
    print(f"| {k[0]} | {k[1]} | {kb.get(k, 0)} | " + " | ".join(str(ka.get(k, 0)) for ka in kas) + " |")
for i, (a, _) in enumerate(afters):
    bm = [x for x in a if x.get("severity") in ("blocker", "major")]
    if bm:
        print(f"\nafter {i+1}: blockers and majors")
        for x in bm:
            print(f"- {x.get('severity')} {x.get('case')} | {x.get('title')} | {x.get('detail','')[:200]}")
