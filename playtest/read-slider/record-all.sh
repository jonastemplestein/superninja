#!/bin/sh
# Record every harness case in turn (docs/READ_SLIDER.md §10). Serve the frozen build first:
#   bun playtest/read-slider/serve.ts --port 4971
# Usage: sh playtest/read-slider/record-all.sh [port] ["case speed" ...]   (default: every case)
PORT=${1:-4971}
DIR=$(dirname "$0")
[ $# -gt 1 ] && shift || set -- "$PORT" "compound normal" "wrong normal" "sounds normal" "compound slow" "compound fast" "sounds slow" "wrong fast"
[ "$1" = "$PORT" ] && shift
for c in "$@"; do
  set -- $c
  echo "=== $1 $2"
  bun "$DIR/record.ts" "$1" "$2" --port "$PORT" --max 170 2>&1 | tail -4
done
