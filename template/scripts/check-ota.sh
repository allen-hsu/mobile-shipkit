#!/bin/sh
# OTA iron rule: an update only reaches installs with the SAME runtimeVersion
# (fingerprint). After every `eas update`, compare against what was built.
# Usage: sh scripts/check-ota.sh [branch] [platform]
set -eu
branch=${1:-production}
platform=${2:-android}
command -v jq >/dev/null || { echo "jq required"; exit 2; }
upd=$(eas update:list --branch "$branch" --limit 1 --json --non-interactive | jq -r '.currentPage[0].runtimeVersion // empty')
bld=$(eas build:list --platform "$platform" --status finished --limit 1 --json --non-interactive | jq -r '.[0].runtimeVersion // empty')
echo "latest update on $branch : ${upd:-<none>}"
echo "latest $platform build : ${bld:-<none>}"
if [ -z "$upd" ] || [ -z "$bld" ]; then echo "missing data"; exit 2; fi
if [ "$upd" = "$bld" ]; then
  echo "MATCH — installs of that build will receive the update"
else
  echo "MISMATCH — nobody on the latest build receives this update. A native change broke the fingerprint; ship a new build."
  exit 1
fi
