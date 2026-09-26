#!/bin/bash
# Cut one pure sound out of a clip (re-audit r3: b from the end of "grab", i from a TTS "ih."), optionally stretch it
# with rubberband, fade it, and level it like the rest of public/a/p (loudnorm to -16 LUFS, or -1.5 dBFS peak for a
# clip too short to measure). The sources are in assets-src/phonemes-r3/ (scripts/gen-pure-sounds.ts).
# Usage: bash scripts/phonemes/r3-cut.sh <src> <out.mp3> <start s> <end s> [stretch to s]
# e.g.   bash scripts/phonemes/r3-cut.sh assets-src/phonemes-r3/b/w_grab_3_tail.mp3 /tmp/b.mp3 0.085 0.26
set -e
src=$1; out=$2; a=$3; b=$4; tgt=$5
T=$(mktemp -d)
ffmpeg -nostdin -loglevel error -y -i "$src" -ac 1 -ar 44100 -ss $a -to $b -c:a pcm_s16le $T/seg.wav
if [ -n "$tgt" ]; then rubberband -q -3 -F -D$tgt $T/seg.wav $T/st.wav; else cp $T/seg.wav $T/st.wav; fi
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $T/st.wav)
fo=$(python3 -c "print(min(0.04, $d/3))")
st=$(python3 -c "print($d-$fo)")
ffmpeg -nostdin -loglevel error -y -i $T/st.wav -af "afade=t=in:d=0.004,afade=t=out:st=$st:d=$fo,adelay=25,apad=pad_dur=0.055,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 44100 -ac 1 $T/norm.wav
l=$(ffmpeg -hide_banner -nostats -i $T/norm.wav -af ebur128=framelog=quiet -f null - 2>&1 | grep -E "^ *I:" | tail -1 | awk '{print $2}')
m=$(ffmpeg -hide_banner -nostats -i $T/norm.wav -af volumedetect -f null - 2>&1 | grep max_volume | awk '{print $5}')
g=$(python3 -c "l='$l'; m=float('$m'); print(-16-float(l) if l not in ('','-70.0') and float(l)>-69 else -1.5-m)")
ffmpeg -nostdin -loglevel error -y -i $T/norm.wav -af "volume=${g}dB,alimiter=limit=0.8414:level=disabled" -ar 44100 -ac 1 -codec:a libmp3lame -q:a 4 "$out"
echo "$out $d s gain $g"
