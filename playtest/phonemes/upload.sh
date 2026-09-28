#!/bin/sh
# Uploads the pure-sound listening page to the public R2 bucket superninja-share (Jonas personal account).
# Run: doppler run -p os -c dev -- sh playtest/phonemes/upload.sh
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
D=$(dirname "$0"); P="sounds-2026-09-27-$(cat "$D/.r2-prefix")"
npx wrangler r2 object put "superninja-share/$P/index.html" --remote --file "$D/index.html" --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
for dir in sulafat erinome alt; do [ -d "$D/$dir" ] || continue; for f in "$D/$dir"/*.mp3; do
  npx wrangler r2 object put "superninja-share/$P/$dir/$(basename "$f")" --remote --file "$f" --content-type audio/mpeg >/dev/null
done; done
echo "https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/$P/index.html"
