#!/bin/sh
# Uploads the demo-slider lane's retake listening page (28 Sep) to the public R2 bucket superninja-share (Jonas personal
# account). The random part of the prefix is in the gitignored .r2-prefix. Build it first with make.ts.
# Run: doppler run -p os -c dev -- sh playtest/retakes-2026-09-28/slider-demo/listen/upload.sh
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
D=$(dirname "$0"); P="retakes-slider-demo-2026-09-28-$(cat "$D/.r2-prefix")"
npx wrangler r2 object put "superninja-share/$P/index.html" --remote --file "$D/index.html" --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
find "$D/old" "$D/new" "$D/ear" -name '*.mp3' | sort | xargs -P 8 -I{} sh -c '
  npx wrangler r2 object put "superninja-share/$2/${1#"$3"/}" --remote --file "$1" --content-type audio/mpeg --cache-control no-cache >/dev/null
' _ {} "$P" "$D"
echo "https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/$P/index.html"
