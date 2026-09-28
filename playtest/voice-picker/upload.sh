#!/bin/sh
# Uploads the voice picker (index.html and every clip under audio/) to the public R2 bucket superninja-share
# (Jonas personal account), under the unguessable prefix in .r2-prefix (git-ignored; it also holds the Worker URL).
# Run: doppler run -p os -c dev -- sh playtest/voice-picker/upload.sh [--page-only]
# Rebuild the page's data first: bun scripts/voice-picker/picker-build.ts
set -eu
export CLOUDFLARE_ACCOUNT_ID=05958bb7b57a2ac7eb5d3906fd3cf8bb
D=$(dirname "$0")
. "$D/.r2-prefix"
npx wrangler r2 object put "superninja-share/$PREFIX/index.html" --remote --file "$D/index.html" --content-type "text/html; charset=utf-8" --cache-control no-cache >/dev/null
if [ "${1:-}" != "--page-only" ]; then
  RUN="$D/../runs/voice-picker/picker"
  mkdir -p "$RUN"
  python3 - "$D" "$PREFIX" > "$RUN/upload-list.json" <<'EOF'
import json, os, sys
d, prefix = sys.argv[1], sys.argv[2]
out = []
for root, dirs, files in os.walk(os.path.join(d, "audio")):
    dirs.sort()
    for f in sorted(files):
        if f.endswith(".mp3"):
            p = os.path.join(root, f)
            out.append({"key": prefix + "/" + os.path.relpath(p, d), "file": p})
print(json.dumps(out))
EOF
  npx wrangler r2 bulk put superninja-share --remote --filename "$RUN/upload-list.json" --content-type audio/mpeg --cache-control "public, max-age=604800" --force --concurrency 16
fi
echo "https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/$PREFIX/index.html"
