#!/usr/bin/env python3
"""Claude Code status line for this project. Saves the status JSON (including rate_limits, when Claude Code sends
them) to ~/.local/state/superninja/statusline.json for scripts/ops/wake-watchdog.py, and shows the quota."""
import datetime as dt
import json
import os
import sys

raw = sys.stdin.read()
state = os.path.expanduser("~/.local/state/superninja")
os.makedirs(state, exist_ok=True)
with open(f"{state}/statusline.json", "w") as f:
    f.write(raw)
try:
    j = json.loads(raw)
except ValueError:
    sys.exit(0)
parts = [(j.get("model") or {}).get("display_name", "")]
for k, v in (j.get("rate_limits") or {}).items():
    if not isinstance(v, dict):
        continue
    pct = v.get("used_percentage", v.get("utilization"))
    r = v.get("resets_at")
    when = ""
    if isinstance(r, (int, float)):
        when = " → " + dt.datetime.fromtimestamp(r).strftime("%a %H:%M")
    elif r:
        when = " → " + str(r)[:16]
    parts.append(f"{k.replace('_', ' ')} {pct if pct is not None else '?'}%{when}")
print("  ·  ".join(p for p in parts if p))
