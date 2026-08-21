#!/bin/sh
# Apply this template onto an Expo project created with create-expo-app.
# Idempotent: files are copied only if absent; JSON is deep-merged (existing
# keys win, except arrays which are unioned).
#   sh path/to/mobile-shipkit/template/scripts/apply.sh /path/to/app
set -eu
here=$(cd "$(dirname "$0")/.." && pwd)
app=${1:-.}
cd "$app"
[ -f app.json ] || { echo "no app.json in $app — run create-expo-app first"; exit 1; }

copy_if_absent() { # src dst
  if [ -e "$2" ]; then echo "keep   $2"; else mkdir -p "$(dirname "$2")"; cp "$1" "$2"; echo "add    $2"; fi
}

copy_if_absent "$here/eas.json" eas.json
copy_if_absent "$here/.easignore" .easignore
for f in "$here"/i18n/native/*.json; do copy_if_absent "$f" "i18n/native/$(basename "$f")"; done
for f in "$here"/scripts/check-*.sh; do copy_if_absent "$f" "scripts/$(basename "$f")"; done
mkdir -p patches && touch patches/.gitkeep
if [ ! -d store ]; then cp -R "$here/store" store; echo "add    store/"; else echo "keep   store/"; fi

node - "$here" <<'JS'
const fs = require('fs');
const here = process.argv[2];
function merge(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b.filter(x => !a.some(y => JSON.stringify(y) === JSON.stringify(x)))];
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) {
    const out = { ...a };
    for (const k of Object.keys(b)) out[k] = k in a ? merge(a[k], b[k]) : b[k];
    return out;
  }
  return a; // existing value wins
}
for (const f of ['app.json', 'package.json']) {
  const cur = JSON.parse(fs.readFileSync(f, 'utf8'));
  const add = JSON.parse(fs.readFileSync(`${here}/${f}.merge`, 'utf8'));
  const next = merge(cur, add);
  fs.writeFileSync(f, JSON.stringify(next, null, 2) + '\n');
  console.log(`merge  ${f}`);
}
JS

cat <<'TXT'

Next:
  npm install                      # pulls patch-package
  npx expo install expo-localization expo-updates
  eas init && eas update:configure # fills extra.eas.projectId + updates.url
  # edit: eas.json submit.ascAppId, i18n/native/*.json names, store/**
  sh scripts/check-lockfile.sh
TXT
