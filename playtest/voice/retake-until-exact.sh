#!/bin/zsh
# Re-take lines until Whisper hears every word (at most $2 rounds). Each round's rejected clip goes to
# .trash/voice-lane/retakes/<id>.r<n>.mp3. Usage: zsh playtest/voice/retake-until-exact.sh ids.txt [rounds]
ROOT=/Users/jonastemplestein/src/github.com/jonastemplestein/superninja
IDS=$1; ROUNDS=${2:-4}
mkdir -p $ROOT/.trash/voice-lane/retakes $ROOT/playtest/runs/voice/retake
cp $IDS $ROOT/playtest/runs/voice/retake/todo.txt
for n in $(seq 1 $ROUNDS); do
  [ -s $ROOT/playtest/runs/voice/retake/todo.txt ] || break
  for i in $(cat $ROOT/playtest/runs/voice/retake/todo.txt); do mv $ROOT/public/a/l/$i.mp3 $ROOT/.trash/voice-lane/retakes/$i.$(basename $IDS .txt).r$n.mp3; done
  (cd $ROOT && doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-audio.ts lines --only-file playtest/runs/voice/retake/todo.txt > playtest/runs/voice/retake/gen-r$n.log 2>&1)
  (cd $ROOT && uv run -q --with numpy --with praat-parselmouth --with faster-whisper python playtest/voice/qa.py --ids $(tr '\n' ',' < playtest/runs/voice/retake/todo.txt | sed 's/,$//') --out playtest/runs/voice/retake/qa-r$n.json > /dev/null 2>&1)
  python3 -c "
import json; d=json.load(open('$ROOT/playtest/runs/voice/retake/qa-r$n.json'))['clips']
bad=[k for k,v in d.items() if not v['exact'] or v.get('fast') or v.get('blip') is not None or v.get('letters')]
open('$ROOT/playtest/runs/voice/retake/todo.txt','w').write(''.join(k+'\n' for k in bad))
print('round $n:', len(d)-len(bad), 'passed;', 'still', bad, [d[k]['heard'] for k in bad])"
done
