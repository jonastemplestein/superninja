#!/bin/bash
# Film takes one after another (each waits for a quiet machine): bash takes.sh c2-t1:2 c3-t1:3 c1-t3:1:--720p ...
ROOT=/Users/jonastemplestein/src/github.com/jonastemplestein/superninja
D=$ROOT/assets-src/clips/2026-09-27/story
for pair in "$@"; do
  name=${pair%%:*}; rest=${pair#*:}; clip=${rest%%:*}; opt=""; [[ "$rest" == *:* ]] && opt=${rest#*:}
  echo "=== $name (clip $clip $opt) start $(date +%T)"
  timeout 900 bun "$D/drive.ts" take "$name" "$clip" ${opt//:/ } > "$D/takes/$name.log" 2>&1
  echo "=== $name done $(date +%T)"
  grep -E "filming|advice|^\{" "$D/takes/$name.log" | cut -c1-600
done
