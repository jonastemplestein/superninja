# Before/after for the script checks (FIX_PLAN §11.2, §13.3, §13.5): the P0 baseline's script-metrics.json beside the
# final one, one row per check, one column pair per run. Run: python3 playtest/fix/final/compare-script.py [after.json]
import json, sys, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
before = json.load(open(f"{ROOT}/playtest/fix/baseline/script-metrics.json"))
after = json.load(open(sys.argv[1] if len(sys.argv) > 1 else f"{ROOT}/playtest/fix/final/script-metrics.json"))
ORDER = ["C-P", "C-L", "C5-P", "C5-L", "C6-P", "C6-L", "C5-S", "C-W"]


def by(d):
    out = {}
    for r in d["runs"]:
        for m in r["metrics"]:
            out.setdefault(m["id"], {"row": m["row"], "target": m.get("target", "")})[r["label"]] = m
    return out


b, a = by(before), by(after)
ids = list(dict.fromkeys([*a.keys(), *b.keys()]))
mark = lambda m: "" if m is None else (" ✓" if m.get("pass") is True else (" ✗" if m.get("pass") is False else ""))
val = lambda m: "–" if m is None else str(m.get("value", "")).replace("|", "/")[:60]
lines = ["| check | target | " + " | ".join(ORDER) + " |", "|---|---|" + "---|" * len(ORDER)]
fails = []
for i in ids:
    row = a.get(i) or b.get(i)
    cells = []
    for r in ORDER:
        mb, ma = b.get(i, {}).get(r), a.get(i, {}).get(r)
        if mb is None and ma is None:
            cells.append("")
            continue
        cells.append(f"{val(mb)}{mark(mb)} → **{val(ma)}**{mark(ma)}")
        if ma and ma.get("pass") is False:
            fails.append((i, r, ma.get("value"), (ma.get("detail") or [])[:3]))
    lines.append(f"| `{i}` {row['row'][:70]} | {str(row.get('target', ''))[:30]} | " + " | ".join(cells) + " |")
print("\n".join(lines))
print(f"\n{len(fails)} failing cells after:")
for i, r, v, d in fails:
    print(f"- `{i}` {r}: {v}" + ("".join(f"\n  - {x[:220]}" for x in d)))
