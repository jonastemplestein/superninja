#!/bin/sh
# Prints Jonas's latest voice picks: what the voice picker page saved through the superninja-voice-picks Worker
# (R2 superninja-share, voice-picker/picks/latest.json, plus one voice-picker/picks/<iso-time>.json per save).
#   sh scripts/voice-picker/read-picks.sh             picks, then every rating and note
#   sh scripts/voice-picker/read-picks.sh --json      the raw JSON
#   sh scripts/voice-picker/read-picks.sh --history   the newest 100 saves (keys)
# Needs playtest/voice-picker/.r2-prefix (git-ignored; PREFIX is the Worker's key, WORKER its URL). Without the Worker:
#   doppler run -p os -c dev -- env CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb \
#     npx wrangler r2 object get superninja-share/voice-picker/picks/latest.json --remote --pipe
set -eu
D=$(dirname "$0")
. "$D/../../playtest/voice-picker/.r2-prefix"
case "${1:-}" in
  --json) curl -fsS "$WORKER/picks/latest?key=$PREFIX"; echo; exit 0 ;;
  --history) curl -fsS "$WORKER/picks/history?key=$PREFIX" | python3 -c 'import json,sys; [print(o["key"], o["size"], "bytes") for o in json.load(sys.stdin)]'; exit 0 ;;
esac
curl -fsS "$WORKER/picks/latest?key=$PREFIX" | python3 -c '
import json, sys
d = json.load(sys.stdin)
if not d.get("picks") and not d.get("ratings"):
    print("No voice picks saved yet" + (" (" + d["note"] + ")" if d.get("note") else "") + ".")
    sys.exit(0)
names = {"sensei": "Sensei", "narrator": "Narrator", "baron": "Baron Muddle"}
print("Voice picks saved " + str(d.get("receivedAt", "?")) + " from device " + str(d.get("device", "?")) + (" [TEST SAVE]" if d.get("test") else ""))
for r, n in names.items():
    p = (d.get("picks") or {}).get(r)
    print("  %-9s %s" % (n.split()[0] + ":", (p["label"] + "  [" + p["id"] + "]") if p and p.get("id") else "no pick"))
rated = [(k, v) for k, v in (d.get("ratings") or {}).items() if v.get("stars") or (v.get("notes") or "").strip()]
if rated:
    print("\nRatings and notes:")
    for r, n in names.items():
        rows = sorted([(k, v) for k, v in rated if k.startswith(r + ":")], key=lambda kv: -kv[1].get("stars", 0))
        if not rows:
            continue
        print("  " + n)
        for k, v in rows:
            stars = int(v.get("stars") or 0)
            note = (v.get("notes") or "").strip().replace("\n", " ")
            print("    " + "*" * stars + "-" * (5 - stars) + "  " + str(v.get("label") or k) + "  [" + k.split(":", 1)[1] + "]" + ("\n        \"" + note + "\"" if note else ""))
'
