#!/bin/zsh
# One take per enemy, one browser at a time (27 Sep): bun supercut/drive.ts take <enemy>-<tag> <enemy> for each enemy
# given (default: all but gloop, whose t2 is kept). Prints one summary line per take (frame rate, hitches, the end).
#   zsh assets-src/clips/2026-09-27/supercut/takes.sh <tag> [enemy…]
D=/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/clips/2026-09-27/supercut
TAG=$1
shift
if (( $# )); then ENEMIES=($@); else ENEMIES=(bamboo_bandit crabble petal_imp snow_puff rock_golem kappa puffer lantern_ghost thunder_drum shadow_bat cloud_sprite gem_guardian boss_panda boss_oni boss_yeti boss_serpent boss_knight boss_baron); fi
for e in $ENEMIES; do
  bun $D/drive.ts take $e-$TAG $e $EXTRA > $D/logs/$e-$TAG.log 2>&1
  echo "$e-$TAG exit $? $(grep -m1 '^{' $D/logs/$e-$TAG.log | python3 -c 'import sys,json; d=json.loads(sys.stdin.read() or "{}"); f=d.get("frames",{}); print("fps",f.get("fps"),"hitches",f.get("hitches"),"rep",f.get("repeatedSlots"),"max",f.get("max"),"sync",d.get("sync",{}).get("maxAbs"),"|",d.get("ended"),"|",d.get("advice",""))' 2>&1)"
done
echo ALLDONE
