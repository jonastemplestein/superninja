#!/bin/zsh
# Record the soundhunt takes one after another (one browser at a time; each take waits for the load to ease first).
#   zsh assets-src/clips/2026-09-27/soundhunt/takes.sh "c1-kai-b w1-7 kai 66" "c2-suki-a w1-11 suki 70 --miss=2" ...
# Each take's log: takes/<name>.log
R=/Users/jonastemplestein/src/github.com/jonastemplestein/superninja
for spec in "$@"; do
  name=${spec%% *}
  echo "[$(date +%H:%M:%S)] start $spec"
  bun $R/assets-src/clips/2026-09-27/soundhunt/drive.ts take ${=spec} > $R/assets-src/clips/2026-09-27/soundhunt/takes/$name.log 2>&1
  echo "[$(date +%H:%M:%S)] end $name: $(grep -o '"fps":[0-9.]*' $R/assets-src/clips/2026-09-27/soundhunt/takes/$name.log) $(grep -c 'hitch' $R/assets-src/clips/2026-09-27/soundhunt/takes/$name.log)"
done
