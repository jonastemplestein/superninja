#!/bin/bash
# Films dojo takes one after another (one browser at a time), each in its own process; the log of each beside it.
#   bash assets-src/clips/2026-09-27/dojo/takes.sh "<take> <level> <hero> <seconds> [flags]" ["..." ...]
# (drive.ts adds nothing here: every take is 720p; drive.ts waits for the machine's load to ease first)
D="$(cd "$(dirname "$0")" && pwd)"
for spec in "$@"; do
  read -r -a a <<< "$spec"
  bun "$D/drive.ts" "${a[@]}" --720p --load=16 > "$D/takes/${a[0]}.log" 2>&1
  echo "${a[0]} exit $? $(grep -o '"fps": [0-9.]*' "$D/takes/${a[0]}.log") $(grep -o '"residualMaxAbsMs": [0-9.]*' "$D/takes/${a[0]}.log") hitches $(grep -c ' hitch ' "$D/takes/${a[0]}.log")"
done
