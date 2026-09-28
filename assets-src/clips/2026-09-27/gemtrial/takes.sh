#!/bin/zsh
# Second 1080p GPU takes of each clip, one browser at a time (27 Sep).
D=/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/clips/2026-09-27/gemtrial
bun $D/drive.ts take c1-1080gpu-t4 1 --gpu --nowait > $D/takes-c1-t4.log 2>&1
bun $D/drive.ts take c2-1080gpu-t3 2 --gpu --nowait > $D/takes-c2-t3.log 2>&1
bun $D/drive.ts take c3-1080gpu-t4 3 --gpu --nowait > $D/takes-c3-t4.log 2>&1
echo ALLDONE
