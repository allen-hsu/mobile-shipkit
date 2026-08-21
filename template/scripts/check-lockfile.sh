#!/bin/sh
# Verify package-lock.json the way the EAS builder will: `npm ci` in a CLEAN
# directory. Passing in-place on macOS proves nothing — platform-specific
# optional deps drift and only Linux notices. If this fails, regenerate:
#   rm -rf node_modules package-lock.json && npm install
set -eu
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp package.json package-lock.json "$tmp"/
[ -d patches ] && cp -R patches "$tmp"/ || true
cd "$tmp"
npm ci --dry-run --ignore-scripts >/dev/null
echo "lockfile ok (clean-dir npm ci --dry-run passed)"
