#!/usr/bin/env bash
# Encode the intro film shots (assets-src/intro-v3/shotN_raw.mp4: the chosen Gemini Omni take per shot, see
# scripts/gen-intro-v2.ts and docs/INTRO_STORYBOARD.md) into web deliverables:
#   public/a/v/intro_N.mp4        video only, H.264 crf 26, +faststart (in-game; narration is played separately)
#   public/media/intro_N_sound.mp4 same cut with the model's own audio (AAC, loudnorm)
#   public/a/v/intro_timing.json   per-shot line delay and hold time (read by src/scenes/IntroFilm.tsx and scripts/intro-film.py)
# The narrated website film (public/media/intro_film.mp4) is built afterwards by scripts/intro-film.py.
# Everything is scaled to 1280×720 (the raws are 1080p; the trailer cuts the 1080p raws directly).
# Usage: bash scripts/intro-v2-encode.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=assets-src/intro-v3
mkdir -p public/a/v public/media "$SRC/tmp"

# Shots 3 and 4 are lip-synced Seedance 2.5 takes (Baron speaks film_3 / film_4): never retime them, and their line
# delays come from assets-src/intro-v3/lipsync/retime.py (the line files are re-timed onto each take).
# shot: start end lineDelayMs [a:b:speed]  (in/out points chosen so each key action lands on its narration words;
# lineDelayMs = when the narration line starts inside the shot; optional a:b:speed plays raw seconds a..b at that speed
# (e.g. 0.6 = slow-mo) before cutting, and start/end are then on the retimed timeline; see docs/INTRO_STORYBOARD.md "Timing")
CUTS=(
  "1 0 5.68 200 0:5:0.88"
  "2 0 5.37 0 0:4.3:0.8"
  "3 0 6.0 419"
  "4 0 7.7 200"
  "5 0 4.0 200"
  "6 0 4.0 200"
  "7 0 4.0 300"
  "8 0 3.35 250 0:2.85:0.85"
)
for c in "${CUTS[@]}"; do
  read -r n ss to delay ramp <<<"$c"
  raw="$SRC/shot${n}_raw.mp4"
  if [[ -n "${ramp:-}" ]]; then
    IFS=: read -r ra rb rs <<<"$ramp"
    ffmpeg -loglevel error -y -i "$raw" -filter_complex \
      "[0:v]split[va][vb];[va]trim=${ra}:${rb},setpts=(PTS-STARTPTS)/${rs}[v1];[vb]trim=start=${rb},setpts=PTS-STARTPTS[v2];[v1][v2]concat=n=2:v=1:a=0,fps=24[v];[0:a]asplit[aa][ab];[aa]atrim=${ra}:${rb},asetpts=PTS-STARTPTS,atempo=${rs}[a1];[ab]atrim=start=${rb},asetpts=PTS-STARTPTS[a2];[a1][a2]concat=n=2:v=0:a=1[a]" \
      -map "[v]" -map "[a]" -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p -c:a pcm_s16le "$SRC/tmp/shot${n}_timed.mov"
    raw="$SRC/tmp/shot${n}_timed.mov"
  fi
  d=$(awk "BEGIN{print $to-$ss}")
  fo=$(awk "BEGIN{print $d-0.12}")
  # silent in-game shot
  ffmpeg -loglevel error -y -ss "$ss" -to "$to" -i "$raw" -an -vf "scale=1280:720:flags=lanczos" \
    -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart "public/a/v/intro_${n}.mp4"
  # with the model's own sound (music and effects, no speech)
  ffmpeg -loglevel error -y -ss "$ss" -to "$to" -i "$raw" \
    -vf "scale=1280:720:flags=lanczos" -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.08,afade=t=out:st=${fo}:d=0.12" -ar 48000 \
    -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "public/media/intro_${n}_sound.mp4"
  echo "shot $n: ${d}s"
done

# per-shot timing for the game (src/scenes/IntroFilm.tsx) and scripts/intro-film.py:
# minMs = how long the shot is held at least (video length, or the line plus a short tail if longer)
python3 - "${CUTS[@]}" <<'PY'
import json, subprocess, sys
out = []
for c in sys.argv[1:]:
    n, ss, to, delay = c.split()[:4]; n = int(n); delay = int(delay)
    vid = (float(to) - float(ss)) * 1000
    line = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"public/a/l/film_{n}.mp3"])) * 1000
    tail = 900 if n == len(sys.argv) - 1 else 250
    out.append({"shot": n, "lineDelayMs": delay, "minMs": round(max(vid, delay + line + tail))})
json.dump(out, open("public/a/v/intro_timing.json", "w"), indent=1)
print("timing", sum(o["minMs"] for o in out) / 1000, "s")
PY

# the finale (the World Flower blooms again; src/scenes/Intro.tsx plays it muted under the "finale" line,
# and the trailer uses the version with sound)
if [[ -f "$SRC/finale_raw.mp4" ]]; then
  fd=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC/finale_raw.mp4"); ffo=$(awk "BEGIN{print $fd-0.3}")
  ffmpeg -loglevel error -y -i "$SRC/finale_raw.mp4" -an -vf "scale=1280:720:flags=lanczos" \
    -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart public/a/v/finale.mp4
  ffmpeg -loglevel error -y -i "$SRC/finale_raw.mp4" -vf "scale=1280:720:flags=lanczos" \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.08,afade=t=out:st=${ffo}:d=0.3" -ar 48000 \
    -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart public/media/finale_sound.mp4
  echo "finale: ${fd}s"
fi
rm -rf "$SRC/tmp"
