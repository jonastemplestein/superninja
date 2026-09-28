#!/bin/bash
# Ship the current working copy: gates → build → preview (https://next.superninja.templestein.com) → live check →
# production (https://superninja.templestein.com). Jonas wants production updated as often as possible, so every
# preview that passes goes live too. `--preview-only` stops after the preview. Full releases with fresh landing-page
# media and a version bump still go through scripts/release.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
ONLY_PREVIEW=false; [ "${1:-}" = "--preview-only" ] && ONLY_PREVIEW=true
npx tsc -b
bun scripts/ops/check-voice.ts   # never ship a mixed Sensei voice (the Erinome re-record); do NOT bypass
bun scripts/treadmill/run.ts --quick --no-jev | tail -3
grep -q '"blockers": 0\|0 blockers' playtest/INBOX.md || { echo "✗ quick treadmill found blockers: see playtest/INBOX.md"; exit 1; }
bunx vite build --logLevel warn
big=$(find dist -type f -size +25M); [ -z "$big" ] || { echo "✗ over 25 MiB: $big"; exit 1; }

# freeze the build so a concurrent `vite build` can't change it between the preview and production deploys
F=playtest/.promote
mkdir -p "$F" .trash
[ -d "$F/dist" ] && mv "$F/dist" ".trash/promote-dist-$(date +%s)"
cp -R dist "$F/dist"
sed -e 's#node_modules/wrangler#../../node_modules/wrangler#' wrangler.next.jsonc > "$F/wrangler.next.jsonc"
sed -e 's#node_modules/wrangler#../../node_modules/wrangler#' wrangler.jsonc > "$F/wrangler.jsonc"
HASH=$(md5 -q "$F/dist/play/index.html" 2>/dev/null || md5sum "$F/dist/play/index.html" | cut -d' ' -f1)

export CLOUDFLARE_API_TOKEN=$(doppler secrets get CLOUDFLARE_API_TOKEN -p os -c dev --plain)
unset CLOUDFLARE_ACCOUNT_ID
bunx wrangler deploy --config "$F/wrangler.next.jsonc"
bun scripts/ops/check-live.ts https://next.superninja.templestein.com "$HASH"
echo "→ https://next.superninja.templestein.com/play/"
$ONLY_PREVIEW && exit 0

bunx wrangler deploy --config "$F/wrangler.jsonc"
bun scripts/ops/check-live.ts https://superninja.templestein.com "$HASH"
echo "→ https://superninja.templestein.com/play/ (production)"
