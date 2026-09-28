#!/bin/zsh
# Record run takes one after another (one browser at a time; each take waits for the load to ease first).
#   zsh assets-src/clips/2026-09-27/run/takes.sh "c1-w1-9-kai-720-t1 1 --720p --seconds=36" "c2-w3-5-suki-720-t1 2 --720p" ...
# Each take's log: takes/<name>.log; a line per take in takes/takes.log
R=/Users/jonastemplestein/src/github.com/jonastemplestein/superninja
T=$R/assets-src/clips/2026-09-27/run/takes
for spec in "$@"; do
  name=${spec%% *}
  echo "[$(date +%H:%M:%S)] start $spec (load $(sysctl -n vm.loadavg | awk '{print $2}'))" >> $T/takes.log
  timeout 900 bun $R/assets-src/clips/2026-09-27/run/drive.ts take ${=spec} > $T/$name.log 2>&1
  echo "[$(date +%H:%M:%S)] end $name: $(grep -o '"fps":[0-9.]*' $T/$name.log) $(grep -o '"hitches":[0-9]*' $T/$name.log) $(grep -o '"maxAbs":[0-9.-]*' $T/$name.log) $(grep '^hitches:' $T/$name.log)" >> $T/takes.log
done
echo "[$(date +%H:%M:%S)] all done" >> $T/takes.log
