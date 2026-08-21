# template/ — what to put on top of `create-expo-app`

An overlay, not a fork of the Expo template. Every file here exists because its
absence cost a build in the 2026-08 submission (see `skills/eas-build-doctor`).

```sh
npx create-expo-app@latest my-app && cd my-app
sh ~/orca/projects/mobile-shipkit/template/scripts/apply.sh . --install
# non-interactive: --base-only | --with admob,revenuecat | --all
```

`apply.sh` is idempotent: copies files only when absent, deep-merges `app.json` /
`package.json` with your values winning, writes `.shipkit-install.sh` with the
exact `npm install` / `npx expo install` lines (runs it with `--install`), and
prints the remaining manual steps. On a TTY it asks y/N per optional module.

## Modules (`modules/<name>/module.json`)

Base — always applied:

| module | packages | verified |
|---|---|---|
| `ota` | expo-updates, expo-localization | gut-game |
| `navigation-ui` | expo-router, safe-area-context, screens, gesture-handler, reanimated, expo-image/font/constants/web-browser/status-bar/splash-screen/system-ui/device/linking | create-expo-app default |
| `state` | zustand | gut-game |
| `i18n` | i18next, react-i18next | gut-game |
| `storage` | @react-native-async-storage/async-storage | gut-game |
| `ux` | expo-haptics, expo-linear-gradient, expo-clipboard, expo-sharing, expo-file-system, expo-application, expo-notifications | first two gut-game; rest common, unverified |

Optional — native, each changes the OTA fingerprint, **not yet field-tested**:

| module | packages | adds |
|---|---|---|
| `admob` | react-native-google-mobile-ads | config plugin with placeholder app IDs + ATT string; `docs/shipkit/admob.md` checklist |
| `revenuecat` | react-native-purchases | `docs/shipkit/revenuecat.md` checklist |

A module is a folder with `module.json` (`base`, `native`, `expo` / `npm` / `dev`
package lists), optional `app.json.merge` / `package.json.merge`, optional
`README.md` (copied to `docs/shipkit/<module>.md` in the app). Add your own.

Verified on a fresh SDK 57 project with `--with admob,revenuecat --install`:
expo-doctor 21/21, `prebuild` lands `APPLICATION_ID` in AndroidManifest and
`GADApplicationIdentifier` / `NSUserTrackingUsageDescription` in Info.plist.

| file | why |
|---|---|
| `eas.json` | channel ↔ branch ↔ profile triple (development / preview / production); `autoIncrement`; AAB for store |
| `.easignore` | **replaces** `.gitignore` for the archive — re-lists everything, plus project-side material the builder never reads |
| `i18n/native/*.json` | platform-split locale files (`ios.CFBundleDisplayName` / `android.app_name`); the flat form fails Android release lint with ExtraTranslation |
| `app.json.merge` | `locales`, `runtimeVersion: fingerprint`, `ITSAppUsesNonExemptEncryption: false` (skips the export-compliance prompt), `expo-localization` plugin |
| `package.json.merge` | `postinstall: patch-package`; `eas-build-post-install` hook raising Gradle Metaspace/heap with **`printf '\n…'`** (an `echo >>` onto gradle.properties' unterminated last line killed every Android build) |
| `scripts/check-lockfile.sh` | clean-directory `npm ci --dry-run` — the check that actually predicts the Linux builder |
| `scripts/check-ota.sh` | `eas update:list` vs `eas build:list` runtimeVersion; MISMATCH = nobody receives the update |
| `patches/` | the only sanctioned place for node_modules edits (`npx patch-package <pkg>`) |
| `store/` | canonical two-store copy skeleton (ASC + Play locales, release notes, minimal Data safety CSV) |

Not included on purpose: `ios/` and `android/` (CNG — never commit them),
credentials (`eas credentials`), and anything the official Expo plugin already
handles (`claude plugin install expo@claude-plugins-official`).
