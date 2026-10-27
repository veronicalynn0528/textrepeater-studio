#!/usr/bin/env bash
# P16-175b: 只把公开页和资源组装到 dist-public/，再从该目录部署。
# 不要再整目录直传（会把 STATUS.md、docs/ 等建站文件一起发到线上）。
set -euo pipefail

cd "$(dirname "$0")/.."

OUT=dist-public
PUBLIC_FILES=(
  index.html
  emoji-repeater.html
  word-repeater.html
  letter-repeater.html
  whatsapp-text-repeater.html
  privacy.html
  terms.html
  404.html
  site-consent.js
  site-consent.css
  robots.txt
  sitemap.xml
  2be1c1d370264bcf8938529e2fc996aa.txt
)

rm -rf "$OUT"
mkdir -p "$OUT"

for f in "${PUBLIC_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "missing public file: $f" >&2
    exit 1
  fi
  cp -p "$f" "$OUT/$f"
done

echo "built $OUT with ${#PUBLIC_FILES[@]} files:"
ls -1 "$OUT"
