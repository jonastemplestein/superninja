#!/bin/zsh
# Record battle takes one after another (one browser at a time; each take waits for the load to ease first).
#   zsh assets-src/clips/2026-09-27/battle/takes.sh "w3-9-kai-t1 w3-9 kai 85 --slip=3:1" "w5-9-suki-t1 w5-9 suki 85" ...
# Each take's log: takes/<name>.log
R=/Users/jonastemplestein/src/github.com/jonastemplestein/superninja
for spec in "$@"; do
  name=${spec%% *}
  echo "[$(date +%H:%M:%S)] start $spec"
  bun $R/assets-src/clips/2026-09-27/battle/drive.ts take ${=spec} > $R/assets-src/clips/2026-09-27/battle/takes/$name.log 2>&1
  echo "[$(date +%H:%M:%S)] end $name: $(grep -o '"fps": [0-9.]*' $R/assets-src/clips/2026-09-27/battle/takes/$name.log) $(grep -o '"repeatedSlots": [0-9]*' $R/assets-src/clips/2026-09-27/battle/takes/$name.log) $(grep '^window[23]' $R/assets-src/clips/2026-09-27/battle/takes/$name.log | tr '\n' ' ')"
done
