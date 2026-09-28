#!/bin/sh
# Uploads the 27 Sep clip kit (clips.ts; zips from zips.sh, index.html from page.ts) to the public R2 bucket
# superninja-share on Jonas's personal Cloudflare account, under the unguessable prefix in .r2-prefix (git-ignored).
# Run: doppler run -p os -c dev -- sh assets-src/clips/2026-09-27/upload.sh
# Page: https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/<prefix>/index.html  (check it with verify.ts)
# Remove: npx wrangler r2 object delete superninja-share/<prefix>/<file> --remote (per file),
#         or npx wrangler r2 bucket dev-url disable superninja-share to take the whole bucket offline.
#
# Files up to 300 MiB go up with wrangler, as the 26 Sep tweet kit did. wrangler refuses anything bigger, so the
# everything-zip (~800 MB) goes up through R2's S3 API (aws s3 cp, multipart) with credentials derived from the same
# Cloudflare API token (access key = the token's id, secret = SHA-256 of the token: Cloudflare's documented scheme).
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
DIR=$(cd "$(dirname "$0")" && pwd)
PREFIX=$(cat "$DIR/.r2-prefix")
BUCKET=superninja-share
MAX=$((300 * 1024 * 1024))

s3put() { # key file content-type disposition cache-control
  if [ -z "${AWS_ACCESS_KEY_ID:-}" ]; then
    AWS_ACCESS_KEY_ID=$(curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      https://api.cloudflare.com/client/v4/user/tokens/verify | python3 -c 'import sys, json; print(json.load(sys.stdin)["result"]["id"])')
    AWS_SECRET_ACCESS_KEY=$(printf %s "$CLOUDFLARE_API_TOKEN" | shasum -a 256 | cut -d' ' -f1)
    export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION=auto
  fi
  aws s3 cp "$2" "s3://$BUCKET/$PREFIX/$1" --endpoint-url "https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com" \
    --content-type "$3" --content-disposition "$4" --cache-control "$5" --only-show-errors
}

put() { # key file content-type disposition [cache-control]
  echo "put $1"
  if [ "$(wc -c < "$2")" -gt "$MAX" ]; then
    s3put "$1" "$2" "$3" "$4" "${5:-public, max-age=3600}"
  else
    npx wrangler r2 object put "$BUCKET/$PREFIX/$1" --remote --file "$2" \
      --content-type "$3" --content-disposition "$4" --cache-control "${5:-public, max-age=3600}" >/dev/null
  fi
}

ONLY=${ONLY:-} # e.g. ONLY=index.html to re-upload just the page
want() { [ -z "$ONLY" ] || [ "$ONLY" = "$1" ]; }
bun "$DIR/clips.ts" groups > "$DIR/zips/.groups"
while read -r key files; do
  z="superninja-clips-2026-09-27-$key.zip"
  for f in $files; do
    if want "$f.mp4"; then put "$f.mp4" "$DIR/$f.mp4" video/mp4 "attachment; filename=\"$f.mp4\""; fi
    if want "$f.jpg"; then put "$f.jpg" "$DIR/$f.jpg" image/jpeg inline; fi
  done
  if want "$z"; then put "$z" "$DIR/zips/$z" application/zip "attachment; filename=\"$z\""; fi
done < "$DIR/zips/.groups"
z=superninja-clips-2026-09-27.zip
if want "$z"; then put "$z" "$DIR/zips/$z" application/zip "attachment; filename=\"$z\""; fi
# the page last, so it never links to a file that isn't up yet
if want index.html; then put index.html "$DIR/index.html" "text/html; charset=utf-8" inline no-cache; fi
echo "done: $PREFIX"
