#!/bin/bash
# Films takes one after another (one headless browser at a time; each take waits for a quieter machine itself).
#   assets-src/clips/2026-09-27/swap/takes.sh "<name> <level> <hero> <seconds> [flags]" ...
# Each take's log goes to takes/<name>.log.
D="$(dirname "$(realpath "$0")")"
for spec in "$@"; do
  set -- $spec
  name=$1
  echo "[takes] $name: $(date +%H:%M:%S) start (load $(sysctl -n vm.loadavg | awk '{print $2}'))"
  bun "$D/drive.ts" take $spec > "$D/takes/$name.log" 2>&1
  echo "[takes] $name: $(date +%H:%M:%S) done: $(grep -o '"fps":[0-9.]*' "$D/takes/$name.log") $(grep '^hitches:' "$D/takes/$name.log" | cut -c1-200)"
done
