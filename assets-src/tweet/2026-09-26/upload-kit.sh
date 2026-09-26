#!/bin/sh
# Uploads the tweet kit (built by build-kit.ts) to the public R2 bucket superninja-share
# on Jonas's personal Cloudflare account, under the unguessable prefix in r2-prefix.txt.
# Run: doppler run -p os -c dev -- sh assets-src/tweet/2026-09-26/upload-kit.sh
# Remove: npx wrangler r2 object delete superninja-share/<prefix>/<file> --remote (per file),
#         or npx wrangler r2 bucket dev-url disable superninja-share to take the whole bucket offline.
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
DIR=$(dirname "$0")
PREFIX=$(cat "$DIR/r2-prefix.txt")
BUCKET=superninja-share

put() { # file content-type disposition [cache-control]
  echo "put $1"
  npx wrangler r2 object put "$BUCKET/$PREFIX/$1" --remote --file "$DIR/$1" \
    --content-type "$2" --content-disposition "$3" --cache-control "${4:-public, max-age=3600}" >/dev/null
}

for c in battle-streak fish-dog film-baron gem-victory petal-scroll; do
  put "$c.mp4" video/mp4 "attachment; filename=\"$c.mp4\""
  put "$c.jpg" image/jpeg inline
done
for s in film-baron petal-scroll; do
  put "$s.srt" "application/x-subrip; charset=utf-8" "attachment; filename=\"$s.srt\""
done
put superninja-tweet-2026-09-26.zip application/zip 'attachment; filename="superninja-tweet-2026-09-26.zip"'
put tweet.txt "text/plain; charset=utf-8" inline no-cache
put tweet.md "text/markdown; charset=utf-8" inline no-cache
put index.html "text/html; charset=utf-8" inline no-cache
echo "done: $PREFIX"
