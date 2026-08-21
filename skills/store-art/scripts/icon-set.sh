#!/bin/sh
# Derive store icon sizes from a 1024×1024 master PNG (macOS sips, no deps).
#   sh icon-set.sh assets/images/icon.png out/
set -eu
src=$1; out=${2:-./icons}
mkdir -p "$out"
w=$(sips -g pixelWidth "$src" | awk '/pixelWidth/{print $2}')
[ "$w" -ge 1024 ] || { echo "master must be ≥1024px (got $w)"; exit 1; }
sips -z 1024 1024 "$src" --out "$out/icon-1024.png" >/dev/null   # App Store
sips -z 512 512   "$src" --out "$out/icon-512.png"  >/dev/null   # Google Play (≤1 MB, 32-bit)
sips -z 180 180   "$src" --out "$out/icon-180.png"  >/dev/null   # preview
for f in "$out"/icon-*.png; do printf '%s %s bytes\n' "$f" "$(wc -c < "$f" | tr -d ' ')"; done
