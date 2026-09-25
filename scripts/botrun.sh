#!/bin/bash
# botrun.sh <session> <level> <steps> : plays a level with the bot, prints actions, screenshots every 10 steps
S=$1; L=$2; N=${3:-60}
playwriter -s $S -e "await page.setViewportSize({width:844,height:390}); page.removeAllListeners('pageerror'); page.on('pageerror', e => console.log('PAGEERR', e.message)); await page.goto('http://localhost:5173/play/?level=$L'); await page.mouse.click(3,3); await page.waitForTimeout(1500);" 2>&1 | grep -i err
BOT=$(cat scripts/bot.js)
for i in $(seq 1 $N); do
  out=$(playwriter -s $S -e "$BOT" 2>&1 | grep -E '^\[log\]|PAGEERR|rror' | sed 's/^\[log\] //')
  echo "$i $out"
  if (( i % 10 == 0 )); then playwriter -s $S -e "await page.screenshot({path:'/tmp/claude-501/shots/bot_${L}_$i.png'})" >/dev/null 2>&1; fi
  if echo "$out" | grep -q '"scene":"reward"'; then break; fi
  sleep 1.2
done
playwriter -s $S -e "await page.screenshot({path:'/tmp/claude-501/shots/bot_${L}_end.png'}); console.log(JSON.stringify(JSON.parse(localStorage.getItem('superninja.save.v1')||'{}').stars||{}))" 2>&1 | grep log
