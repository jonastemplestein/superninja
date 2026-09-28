#!/bin/sh
# Speech-template pilot: re-render the lead-ins whose joins stayed over the design's limits (join-flags.json), and
# finish what the TTS quota stopped on 27 Sep (w_say_slowly's last 47 pieces). Needs TTS quota: the key's
# gemini-3.8-flash-tts limit is 10,000 requests a day per project, reset at midnight Pacific (08:00 BST); the pilot hit
# it at 11:55 BST on 27 Sep, shared with the other workflows.
#   sh playtest/speech-templates/pilot/regen.sh
# Flagged pieces are moved (never deleted) to .trash/retakes-2026-09-28/speech-pilot-regen/; the generator then renders exactly what is
# missing, with medium.en as the Whisper gate (it hears "fin", not "Finn"; small.en's name spellings failed 12 pieces).
set -eu
R=$(dirname "$0")/../../..
P=$R/playtest/runs/speech-templates/pilot
T=$R/.trash/retakes-2026-09-28/speech-pilot-regen/$(date +%Y%m%d-%H%M%S)
mkdir -p "$T"
for piece in s_here_sound/0-_ ws_starts_with/0-bib ws_starts_with/0-den ws_starts_with/0-dog ws_starts_with/0-man ws_starts_with/0-net ws_starts_with/0-pot ws_starts_with/0-sausage ws_starts_with/0-vet; do
  mkdir -p "$T/$(dirname "$piece")"
  [ -f "$P/$piece.mp3" ] && mv "$P/$piece.mp3" "$T/$piece.mp3"
done
# ww_change is left out: its 10 failures are Gemini rushing the 8-word take, which needs the template split first
doppler run -p os-legacy-2026-04 -c dev -- bun "$R/scripts/gen-templates.ts" --unit IC4 --concurrency 6 --whisper medium.en --root "$P" \
  --only s_here_sound,ws_starts_with,w_say_slowly,w_position_q,w_your_word,w_listen_again,ws_way_we_spell
bun "$R/playtest/speech-templates/pilot/plan.ts"
mkdir -p "$T/audio" && mv "$R/playtest/speech-templates/pilot/audio" "$T/audio/previous"
"$R/playtest/runs/speech-templates/.venv/bin/python" "$R/playtest/speech-templates/pilot/assemble.py"
"$R/playtest/runs/speech-templates/.venv/bin/python" "$R/playtest/speech-templates/pilot/flags.py"
python3 "$R/playtest/speech-templates/pilot/stats.py" >/dev/null
# votes on pairs whose audio changed are stale: judge.json keeps only ids whose files are unchanged (see judge.ts)
doppler run -p os-legacy-2026-04 -c dev -- bun "$R/playtest/speech-templates/pilot/judge.ts"
bun "$R/playtest/speech-templates/pilot/page.ts"
doppler run -p os -c dev -- sh "$R/playtest/speech-templates/pilot/upload.sh"
