#!/bin/sh
# Uploads the speech-template pilot's listening page (index.html and audio/) to the public R2 bucket superninja-share
# (Jonas's personal account), under speech-pilot-2026-09-27-<.r2-prefix>, as playtest/phonemes/upload.sh does.
# Run: doppler run -p os -c dev -- sh playtest/speech-templates/pilot/upload.sh
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
D=$(dirname "$0")
[ -f "$D/.r2-prefix" ] || openssl rand -hex 8 > "$D/.r2-prefix"
P="speech-pilot-2026-09-27-$(cat "$D/.r2-prefix")"
export P D
ls "$D"/audio/*.mp3 | xargs -P 8 -n 1 sh -c 'npx wrangler r2 object put "superninja-share/$P/audio/$(basename "$1")" --remote --file "$1" --content-type audio/mpeg >/dev/null && printf .' _
echo
# the page last, so it never points at audio that isn't there yet
npx wrangler r2 object put "superninja-share/$P/index.html" --remote --file "$D/index.html" --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
echo "https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/$P/index.html"
