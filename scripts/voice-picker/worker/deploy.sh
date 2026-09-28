#!/bin/sh
# Deploys superninja-voice-picks (the voice picker's save endpoint) to Jonas's personal Cloudflare account and sets its key
# (the page's unguessable R2 prefix, from playtest/voice-picker/.r2-prefix, which is git-ignored).
# Run: doppler run -p os -c dev -- sh scripts/voice-picker/worker/deploy.sh
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
D=$(dirname "$0")
. "$D/../../../playtest/voice-picker/.r2-prefix"
npx wrangler deploy --config "$D/wrangler.jsonc"
printf '%s' "$PREFIX" | npx wrangler secret put PICKER_KEY --config "$D/wrangler.jsonc"
