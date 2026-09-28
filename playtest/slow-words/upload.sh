#!/bin/sh
# Uploads the slow-words listening page (the words before and after, the three gaps, the short-vowel before and after,
# the fast and slow lines, and the "British or not?" takes in ear/)
# to the public R2 bucket superninja-share (Jonas personal account). The random part of the prefix is in the gitignored .r2-prefix.
# Run: doppler run -p os -c dev -- sh playtest/slow-words/upload.sh
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
D=$(dirname "$0"); P="slow-words-2026-09-27-$(cat "$D/.r2-prefix")"
npx wrangler r2 object put "superninja-share/$P/index.html" --remote --file "$D/index.html" --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
# the clips, eight at a time; each lands at the same relative path the page asks for (before/cat.mp3, gaps/250/cat.mp3,
# short/after/o.mp3, lines/tv_fs_gaps.mp3, ear/tv_fs_made/now.mp3)
find "$D/before" "$D/after" "$D/gaps" "$D/short" "$D/lines" "$D/ear" -name '*.mp3' | sort | xargs -P 8 -I{} sh -c '
  npx wrangler r2 object put "superninja-share/$2/${1#"$3"/}" --remote --file "$1" --content-type audio/mpeg --cache-control no-cache >/dev/null
' _ {} "$P" "$D"
echo "https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/$P/index.html"
