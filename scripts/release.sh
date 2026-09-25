#!/usr/bin/env bash
# Super Ninja release: checks → smoke test → fresh gameplay media → build → deploy → verify.
# Usage: scripts/release.sh [patch|minor|major|none]   (default: patch). See docs/RELEASING.md.
set -euo pipefail
cd "$(dirname "$0")/.."
BUMP="${1:-patch}"
PORT=5174
BASE="http://localhost:$PORT"
DOPPLER_GEMINI=(doppler run -p os-legacy-2026-04 -c dev --)

step() { printf "\n\033[1;35m▶ %s\033[0m\n" "$*"; }

step "1. Version bump ($BUMP)"
[ "$BUMP" = none ] || npm version "$BUMP" --no-git-tag-version >/dev/null
VERSION=$(node -p "require('./package.json').version")
echo "v$VERSION"

step "2. Generate any new content assets (idempotent: only missing files are made)"
"${DOPPLER_GEMINI[@]}" bun scripts/gen-audio.ts
bun scripts/export-art-jobs.ts
"${DOPPLER_GEMINI[@]}" bun scripts/gen-art.ts
uv run --with 'rembg[cpu]' --with pillow python scripts/post-art.py
uv run --with pillow --with numpy python scripts/make-faces.py

step "3. Static checks"
npx tsc -b
bun src/content/validate.ts
bun scripts/check-assets.ts
bun scripts/stats.ts

step "4. Local server"
bunx vite --port $PORT >/tmp/superninja-release-vite.log 2>&1 &
VITE=$!
trap 'kill $VITE 2>/dev/null || true' EXIT
until curl -sf "$BASE/play/" >/dev/null; do sleep 0.5; done

step "5. Smoke test (a bot plays every kind of level to the end)"
bun scripts/smoke.ts "$BASE"

step "6. Fresh gameplay clips, screenshots and share image for the landing page"
bun scripts/record-clips.ts "$BASE"
bun scripts/screenshots.ts "$BASE"
bun scripts/og.ts "$BASE"
bun scripts/shoot-landing.ts "$BASE"
echo "Review: assets-src/landing-review/desktop.png and phone.png"

step "7. Build"
bunx vite build
# Workers static assets are capped at 25 MiB per file
big=$(find dist -type f -size +25M)
if [ -n "$big" ]; then echo "✗ files over 25 MiB won't deploy: $big"; exit 1; fi

step "8. Deploy to Cloudflare"
export CLOUDFLARE_API_TOKEN=$(doppler secrets get CLOUDFLARE_API_TOKEN -p os -c dev --plain)
unset CLOUDFLARE_ACCOUNT_ID  # account_id is pinned in wrangler.jsonc (Jonas personal, owns templestein.com)
bunx wrangler deploy

step "9. Verify production"
PROD="https://superninja.templestein.com"
for path in / /play/ /media/stats.json /media/clips/battle.mp4 /a/p/a.mp3; do
  for i in 1 2 3 4 5; do code=$(curl -s -o /dev/null -w "%{http_code}" "$PROD$path"); [ "$code" = 200 ] && break; sleep 3; done
  echo "$code $path"; [ "$code" = 200 ] || { echo "✗ $path"; exit 1; }
done
LIVE=$(curl -s -H "Cache-Control: no-cache" "$PROD/media/stats.json?v=$VERSION-$RANDOM")
[[ "$LIVE" == *"\"version\": \"$VERSION\""* ]] && echo "✓ live version is v$VERSION" || { echo "✗ live stats.json is not v$VERSION"; exit 1; }

step "Done: v$VERSION. Add a CHANGELOG.md entry and update docs/FEEDBACK.md statuses."
