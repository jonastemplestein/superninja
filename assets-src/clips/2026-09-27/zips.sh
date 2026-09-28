#!/bin/zsh
# Zips the 27 Sep clip kit (clips.ts): one zip per level type and one with everything, each clip's MP4 and JPG poster
# at the zip's top level (zip -j). Stored, not deflated (-0): MP4 and JPG are compressed already.
# -FS syncs an existing zip to the list (so a re-run never needs rm).
#   zsh assets-src/clips/2026-09-27/zips.sh     → assets-src/clips/2026-09-27/zips/*.zip
set -eu
D=${0:A:h}
mkdir -p $D/zips
all=()
for line in "${(@f)$(bun $D/clips.ts groups)}"; do
  key=${line%% *}
  list=()
  for f in ${=${line#* }}; do list+=($D/$f.mp4 $D/$f.jpg); done
  zip -q -j -X -0 -FS $D/zips/superninja-clips-2026-09-27-$key.zip $list
  echo "zips/superninja-clips-2026-09-27-$key.zip (${#list} files)"
  all+=($list)
done
zip -q -j -X -0 -FS $D/zips/superninja-clips-2026-09-27.zip $all
echo "zips/superninja-clips-2026-09-27.zip (${#all} files)"
