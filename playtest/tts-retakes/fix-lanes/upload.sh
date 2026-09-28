#!/bin/sh
# Uploads the fix lanes' listening page (docs/tts-retakes.md: the big fix's lanes, Baron final only, the pre-ship fixes)
# to the public R2 bucket superninja-share (Jonas personal account). The random part of the prefix is in the gitignored .r2-prefix.
# Run: doppler run -p os -c dev -- sh playtest/tts-retakes/fix-lanes/upload.sh
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
D=$(dirname "$0"); P="fix-lanes-2026-09-28-$(cat "$D/.r2-prefix")"
npx wrangler r2 object put "superninja-share/$P/index.html" --remote --file "$D/index.html" --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
find "$D/clips" "$D/ear" -name '*.mp3' | sort | xargs -P 8 -I{} sh -c '
  npx wrangler r2 object put "superninja-share/$2/${1#"$3"/}" --remote --file "$1" --content-type audio/mpeg --cache-control no-cache >/dev/null
' _ {} "$P" "$D"
echo "https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/$P/index.html"
