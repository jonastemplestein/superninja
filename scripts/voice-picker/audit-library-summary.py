"""Summarise measures-library.json: r-coloured words, BATH words with a TRAP vowel, flapped t's, by speaker.
Run: python3 scripts/voice-picker/audit-library-summary.py [--flags]  (--flags prints every flagged token)"""
import json, sys, collections, statistics as st
from pathlib import Path
AUD = Path(__file__).resolve().parents[2] / "playtest/runs/voice-picker/audit"
d = json.loads((AUD / "measures-library.json").read_text())
RHOTIC_CUT, BATH_CUT = 0.72, 0.6
out = {}
for who, r in d.items():
    ms = r["measures"]
    rh = [m for m in ms if m.get("f3_ratio") is not None]
    rh_flag = [m for m in rh if m["f3_ratio"] < RHOTIC_CUT]
    b = r["bath"]
    start, trap = b["f2_start"], b["f2_trap"]
    bath = [m for m in ms if m.get("f2") and m["word"] in {"fast", "last", "past", "ask", "asked", "after", "class", "can't", "grass", "path", "bath", "glass", "castle", "rather", "laugh", "dance", "half", "plant", "branch", "answer", "banana", "master", "basket", "task", "mask"}]
    for m in bath:
        m["bath_index"] = round((m["f2"] - start) / (trap - start), 2) if start and trap else None
    bath_flag = [m for m in bath if m["bath_index"] is not None and m["bath_index"] > BATH_CUT]
    ts = [m for m in ms if m.get("t")]
    flaps = [m for m in ts if m["t"]["kind"].startswith("flap")]
    clips_rh = collections.Counter(m["clip"] for m in rh_flag)
    print(f"\n== {who}: {r['clips']} clips, baseline F3 {r['baseline_f3']} Hz, START F2 {start}, TRAP F2 {trap}")
    print(f"r-words: {len(rh)} tokens, {len(rh_flag)} with F3 ratio < {RHOTIC_CUT} ({100*len(rh_flag)/max(1,len(rh)):.0f}%), in {len(clips_rh)} clips; clips with 2+: {sum(1 for c in clips_rh.values() if c >= 2)}")
    byw = collections.defaultdict(list)
    for m in bath: byw[m["word"]].append(m["bath_index"])
    print("BATH words:", {w: f"{sum(v > BATH_CUT for v in vs if v is not None)}/{len(vs)} TRAP-like" for w, vs in sorted(byw.items())})
    print(f"t between vowels: {len(ts)} tokens, {len(flaps)} flapped:", collections.Counter(m['word'] for m in flaps))
    if "--flags" in sys.argv:
        for m in sorted(rh_flag, key=lambda m: m["f3_ratio"]): print("   r ", m["clip"], m["word"], m["f3_ratio"])
        for m in sorted(bath_flag, key=lambda m: -m["bath_index"]): print("   BATH", m["clip"], m["word"], m["bath_index"], m["f2"])
        for m in flaps: print("   flap", m["clip"], m["word"], m["t"])
