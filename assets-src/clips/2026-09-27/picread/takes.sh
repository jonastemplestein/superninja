#!/bin/bash
# Record takes one after another (each waits for a quiet machine): bash takes.sh wu2:take2 wu4:take3 ...
ROOT=/Users/jonastemplestein/src/github.com/jonastemplestein/superninja
for pair in "$@"; do
  lvl=${pair%%:*}; rest=${pair#*:}; take=${rest%%:*}; opt=""; [[ "$rest" == *:* ]] && opt=${rest#*:}
  echo "=== $lvl $take $opt start $(date +%T)"
  bun "$ROOT/assets-src/clips/2026-09-27/picread/drive.ts" "$lvl" "$take" ${opt//:/ } > "$ROOT/assets-src/clips/2026-09-27/picread/raw/$lvl-$take.log" 2>&1
  echo "=== $lvl $take done $(date +%T)"
  grep "filming\|advice\|tweet-clips\]" "$ROOT/assets-src/clips/2026-09-27/picread/raw/$lvl-$take.log"
  python3 "$ROOT/assets-src/clips/2026-09-27/picread/analyze.py" "$lvl-$take" | head -1
done
