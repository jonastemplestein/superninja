#!/bin/bash
# shot.sh <session> <query> <name> [waitms] [w] [h]
S=$1; Q=$2; N=$3; WAIT=${4:-4000}; VW=${5:-844}; VH=${6:-390}
playwriter -s $S -e "
await page.setViewportSize({ width: $VW, height: $VH });
await page.goto('http://localhost:5173/$Q');
await page.mouse.click(5, 5);
await page.waitForTimeout($WAIT);
await page.screenshot({ path: '/tmp/claude-501/shots/$N.png' });
" 2>&1 | grep -iE "error|PAGEERR" | head -3
