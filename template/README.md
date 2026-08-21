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

Base — always applied (JS-only or Expo SDK modules):

| module | packages | verified |
|---|---|---|
| `ota` | expo-updates, expo-localization | a real project |
| `navigation-ui` | expo-router, safe-area-context, screens, gesture-handler, reanimated, expo-image/font/constants/web-browser/status-bar/splash-screen/system-ui/device/linking | create-expo-app default |
| `ui-kit` | @gorhom/bottom-sheet, lottie-react-native, expo-blur, react-native-svg | svg a real project; rest installed + prebuild |
| `state` | zustand | a real project |
| `i18n` | i18next, react-i18next | a real project |
| `storage` | @react-native-async-storage/async-storage | a real project |
| `forms` | react-hook-form, zod, @hookform/resolvers | common, unverified |
| `data` | @tanstack/react-query | common, unverified |
| `platform` | expo-secure-store, expo-store-review, expo-keep-awake | SDK, installed + prebuild |
| `ux` | expo-haptics, expo-linear-gradient, expo-clipboard, expo-sharing, expo-file-system, expo-application, expo-notifications | first two a real project; rest common |
| `testing` | jest, jest-expo, @testing-library/react-native (v14: `await render`), @types/jest; `npm test` / `npm run check`; `__tests__/smoke.test.tsx`; `tsconfig types: ["jest"]` | jest-expo a real project; smoke test green on SDK 57 |

Optional — asked on a TTY or chosen with `--with` (native, permission strings, or accounts needed; **not yet field-tested**):

| module | packages | adds |
|---|---|---|
| `admob` | react-native-google-mobile-ads, expo-tracking-transparency | config plugin with placeholder app IDs + ATT string; `docs/shipkit/admob.md` |
| `revenuecat` | react-native-purchases | `docs/shipkit/revenuecat.md` |
| `media` | expo-image-picker, expo-camera | camera / photos / microphone permission strings |
| `location` | expo-location | when-in-use permission string |
| `auth` | expo-auth-session, expo-apple-authentication, expo-crypto | `ios.usesAppleSignIn` |
| `sentry` | @sentry/react-native | config plugin with placeholder org/project |
| `posthog` | posthog-react-native | — |

A module is a folder with `module.json` (`base`, `native`, `expo` / `npm` / `dev`
package lists), optional `app.json.merge` / `package.json.merge` / `tsconfig.json.merge`,
optional `files/**` (copied into the app when absent), optional `README.md`
(copied to `docs/shipkit/<module>.md`). Add your own.

Known upstream: `npm run lint` on a pristine SDK 57 create-expo-app fails on its own
`src/hooks/use-color-scheme.web.ts` (react-hooks/set-state-in-effect). Not ours;
`npm run typecheck` and `npm test` are green.

Verified on a fresh SDK 57 project with `--all --install` (17 modules, 58 deps):
expo-doctor 21/21, `prebuild` on both platforms succeeds, AndroidManifest gets the
AdMob `APPLICATION_ID`, Info.plist gets `GADApplicationIdentifier` and the nine
permission strings the chosen plugins declare.

| file | why |
|---|---|
| `eas.json` | channel ↔ branch ↔ profile triple (development / preview / production); `autoIncrement`; AAB for store |
| `.easignore` | **replaces** `.gitignore` for the archive — re-lists everything, plus project-side material the builder never reads |
| `i18n/native/*.json` | platform-split locale files (`ios.CFBundleDisplayName` / `android.app_name`); the flat form fails Android release lint with ExtraTranslation |
| `app.json.merge` | `locales`, `runtimeVersion: fingerprint`, `ITSAppUsesNonExemptEncryption: false` (skips the export-compliance prompt), `expo-localization` plugin |
| `package.json.merge` | `postinstall: patch-package`; `eas-build-post-install` hook raising Gradle Metaspace/heap with **`printf '\n…'`** (an `echo >>` onto gradle.properties' unterminated last line killed every Android build) |
| `scripts/check-lockfile.sh` | clean-directory `npm ci --dry-run` — the check that actually predicts the Linux builder |
| `scripts/check-ota.sh` | `eas update:list` vs `eas build:list` runtimeVersion; MISMATCH = nobody receives the update |
| `patches/` | the only sanctioned place for node_modules edits (`npx patch-package <pkg>`); ships `expo-modules-jsi+57.0.5.patch` for Xcode 26.3 (build-doctor case 5) |
| `store/` | canonical two-store copy skeleton (ASC + Play locales, release notes, minimal Data safety CSV) |

Not included on purpose: `ios/` and `android/` (CNG — never commit them),
credentials (`eas credentials`), and anything the official Expo plugin already
handles (`claude plugin install expo@claude-plugins-official`).
