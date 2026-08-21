#!/bin/sh
# Apply this template onto an Expo project created with create-expo-app.
# Idempotent: files are copied only if absent; JSON is deep-merged (existing
# keys win, except arrays which are unioned).
#
#   sh path/to/mobile-shipkit/template/scripts/apply.sh [app-dir] [options]
#
# Modules (template/modules/*): base modules are always applied; optional ones
# (native: admob, revenuecat) are asked about interactively on a TTY, or chosen
# with flags:
#   --with admob,revenuecat   pick optional modules (non-interactive)
#   --all                     every optional module
#   --base-only               no optional modules
#   --install                 run the npm / npx expo install commands at the end
set -eu
here=$(cd "$(dirname "$0")/.." && pwd)
app=.
with=""; mode=""; do_install=0
for a in "$@"; do
  case "$a" in
    --with=*) with=${a#--with=}; mode=with ;;
    --with) mode=with_next ;;
    --all) mode=all ;;
    --base-only) mode=none ;;
    --install) do_install=1 ;;
    -*) echo "unknown option $a"; exit 2 ;;
    *) if [ "$mode" = with_next ]; then with=$a; mode=with; else app=$a; fi ;;
  esac
done
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

# ---- modules ---------------------------------------------------------------
optional=""
for d in "$here"/modules/*/; do
  m=$(basename "$d")
  if node -e "process.exit(require('$d/module.json').base ? 0 : 1)"; then continue; fi
  optional="$optional $m"
done
selected=""
case "$mode" in
  all) selected=$optional ;;
  none|"" ) selected="" ;;
  with) selected=$(echo "$with" | tr ',' ' ') ;;
esac
if [ -z "$mode" ] && [ -t 0 ]; then
  echo
  echo "Optional modules (native — each one changes the OTA fingerprint):"
  for m in $optional; do
    title=$(node -p "require('$here/modules/$m/module.json').title")
    printf "  add %s? [y/N] " "$title"
    read -r ans </dev/tty || ans=n
    case "$ans" in y|Y|yes) selected="$selected $m" ;; esac
  done
fi
for m in $selected; do
  [ -f "$here/modules/$m/module.json" ] || { echo "unknown module: $m (have:$optional)"; exit 2; }
done
base=""
for d in "$here"/modules/*/; do
  m=$(basename "$d")
  node -e "process.exit(require('$d/module.json').base ? 0 : 1)" && base="$base $m"
done
modules="$base $selected"
echo "modules:$modules"

node - "$here" $modules <<'JS'
const fs = require('fs');
const here = process.argv[2];
const modules = process.argv.slice(3);
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
  let cur = JSON.parse(fs.readFileSync(f, 'utf8'));
  cur = merge(cur, JSON.parse(fs.readFileSync(`${here}/${f}.merge`, 'utf8')));
  for (const m of modules) {
    const p = `${here}/modules/${m}/${f}.merge`;
    if (fs.existsSync(p)) { cur = merge(cur, JSON.parse(fs.readFileSync(p, 'utf8'))); console.log(`merge  ${f} <- modules/${m}`); }
  }
  fs.writeFileSync(f, JSON.stringify(cur, null, 2) + '\n');
  console.log(`merge  ${f}`);
}
// collect packages → .shipkit-install.sh
const expo = [], npm = [], dev = [];
for (const m of modules) {
  const j = JSON.parse(fs.readFileSync(`${here}/modules/${m}/module.json`, 'utf8'));
  expo.push(...(j.expo || [])); npm.push(...(j.npm || [])); dev.push(...(j.dev || []));
  for (const f of ['README.md']) {
    const src = `${here}/modules/${m}/${f}`;
    if (fs.existsSync(src)) { fs.mkdirSync('docs/shipkit', { recursive: true }); fs.copyFileSync(src, `docs/shipkit/${m}.md`); }
  }
}
const uniq = a => [...new Set(a)];
const lines = ['#!/bin/sh', 'set -e', 'npm install'];
if (npm.length) lines.push(`npm install ${uniq(npm).join(' ')}`);
if (dev.length) lines.push(`npm install -D ${uniq(dev).join(' ')}`);
lines.push(`npx expo install ${uniq(expo).join(' ')}`);
fs.writeFileSync('.shipkit-install.sh', lines.join('\n') + '\n');
console.log('write  .shipkit-install.sh');
JS
if [ "$do_install" = 1 ]; then sh .shipkit-install.sh; fi

cat <<'TXT'

Next:
  sh .shipkit-install.sh           # npm install + expo install for the chosen modules (or rerun with --install)
  eas init && eas update:configure # fills extra.eas.projectId + updates.url
  # edit: eas.json submit.ascAppId, i18n/native/*.json names, store/**
  sh scripts/check-lockfile.sh
TXT
