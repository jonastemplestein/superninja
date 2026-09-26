#!/bin/bash
# Deploy the current working copy to the preview channel https://next.superninja.templestein.com
# (production is untouched; releases go through scripts/release.sh). Runs a quick bot check first.
set -euo pipefail
cd "$(dirname "$0")/.."
npx tsc -b
bun scripts/treadmill/run.ts --quick --no-jev | tail -3
grep -q '"blockers": 0\|0 blockers' playtest/INBOX.md || { echo "✗ quick treadmill found blockers: see playtest/INBOX.md"; exit 1; }
bunx vite build --logLevel warn
big=$(find dist -type f -size +25M); [ -z "$big" ] || { echo "✗ over 25 MiB: $big"; exit 1; }
export CLOUDFLARE_API_TOKEN=$(doppler secrets get CLOUDFLARE_API_TOKEN -p os -c dev --plain)
unset CLOUDFLARE_ACCOUNT_ID
bunx wrangler deploy --config wrangler.next.jsonc
echo "→ https://next.superninja.templestein.com/play/"
