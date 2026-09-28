#!/bin/sh
# Uploads the Erinome listening page (Sensei's new voice, 28 Sep) to the public R2 bucket superninja-share (Jonas
# personal account), under erinome-2026-09-27-<the git-ignored .r2-prefix>. As playtest/phonemes/upload.sh.
# Run: doppler run -p os -c dev -- sh playtest/voice/erinome/upload.sh
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
D=$(dirname "$0"); P="erinome-2026-09-27-$(cat "$D/.r2-prefix")"
npx wrangler r2 object put "superninja-share/$P/index.html" --remote --file "$D/index.html" --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
# the clips, six at a time
(cd "$D" && find a sulafat -name '*.mp3' 2>/dev/null) | xargs -P 6 -I{} npx wrangler r2 object put "superninja-share/$P/{}" --remote --file "$D/{}" --content-type audio/mpeg >/dev/null
echo "https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/$P/index.html"
