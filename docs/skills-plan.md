English | [繁體中文](skills-plan.zh-TW.md)

# Skills design

Each skill = one SKILL.md (< 500 lines, following the expo/skills CI conventions) +
attachments under scripts/. Principles: **teach how to find out, not just facts** (store
APIs change; teach the agent to iterate with `--help` / `asc search` / API error text);
**mark human steps explicitly** (2FA, Console forms, the submit button); **a failure
catalogue is worth more than the happy path**.

---

## eas-build-doctor

A casebook of real failures; each entry: symptom → root cause → fix.

| Symptom | Root cause | Fix |
|---|---|---|
| builder `npm ci` rejects the lockfile (@emnapi family version drift) | incremental `npm install` left platform-specific residue | regenerate from scratch: rm node_modules + lock → npm install → verify with `npm ci --dry-run --ignore-scripts` **in a clean directory** (passing on macOS ≠ passing on Linux, but regeneration fixed it both times) |
| archive bloat (546 MB → 614 MB) | **once `.easignore` exists it fully replaces `.gitignore`** | `.easignore` must re-list node_modules/.git and every other exclusion |
| Configure expo-updates: runtime fingerprint mismatch | ① a stray local `ios/` directory (bareNativeDir) ② hand-edited node_modules | ① CNG: ios/android never exist locally / never committed ② every hand edit goes through patch-package into the repo so both sides are byte-identical |
| cloud build quota exhausted | free tier counts iOS and Android separately | `eas build --local`: same pipeline, same credentials, runs locally, artifact submits directly |
| local iOS: Swift compile error (ambiguous `abs`) | the local Xcode 26 SDK's newly modularised libc++ vs expo-modules-jsi C++ interop, unfixed upstream | patch-package with the minimal fix (qualify, or `.magnitude`); track the upstream issue and drop the patch when it lands |
| local Android: OutOfMemoryError Metaspace | the Expo template's gradle.properties allows only 512m | raise it with sed in a post-install hook (2048m / 4G) |
| gradle: Cannot create service …GlobalCacheLocations | `pkill gradle` corrupted ~/.gradle | delete all of ~/.gradle/caches + daemon and start over |
| **node exit 1 (message swallowed), local and cloud alike** | the hook used `echo >>` on a gradle.properties **without a trailing newline**; the property fused onto the last line and poisoned an autolinking argument | `printf '\n...'`; general lesson: rerun with `--info` to see the full command line of every node process gradle starts |
| Android release lint: ExtraTranslation | the iOS key (CFBundleDisplayName) in app.json locales leaked into Android strings.xml | split locale files by platform: `{"ios":{"CFBundleDisplayName":..},"android":{"app_name":..}}` |

Diagnostic toolbox: EAS logs are brotli; `EAS_LOCAL_BUILD_SKIP_CLEANUP=1` keeps the
working directory; replay `./gradlew --info/--stacktrace` by hand in that directory
(set `EAS_BUILD_WORKINGDIR` to the directory containing credentials.json).

---

## eas-ota-discipline

1. Publish from a clean, committed tree; `eas update --branch B --environment E`
   (non-interactive runs must pass `--environment`).
2. **The fingerprint rule**: an update only reaches installs with the same
   fingerprint. After every publish compare the runtimeVersion from
   `eas update:list` vs `eas build:list` — a mismatch means nobody receives it
   (real case: a tester sat on the old build for a week while everyone assumed the
   update had shipped).
3. Things that break the fingerprint (= a new build is required): native config
   (icon / name / locales / plist), adding a native package (IAP / AdMob!), node_modules
   edits not captured in a patch.
4. Delivery: takes effect on the second cold start; icon / name / splash never go OTA.
5. The channel ↔ branch ↔ profile mapping is fixed in eas.json; the skill ships the
   standard triple.

---

## submit-google (with gpc)

Flow: create app in Console (human) → gpc listing / images / datasafety / details →
AAB (build doctor) → gpc bundle upload → gpc track set draft → Console-only forms
(human: IARC / target audience / health / category / countries) → send for review on
Publishing overview (human button).
The hard facts are all in docs/gpc-cli.md (draft-app rule, CSV header, edit conflicts).
Health apps: in the health declaration pick "Other" + a ≤150-character description
template (do not tick medical).

---

## submit-apple (thin layer; the body is the vendored asc skills)

Only what the asc skills do not say:
- `asc web apps create` needs a web session (2FA = human step; sessions expire)
- the version string must match the binary's marketing version (create gives 1.0 →
  `versions update 1.0.0`)
- **no emoji in the description** (a whole batch was rejected: 🌱💩📅🔒…); Play allows
  them → keep the two stores' copy separate
- pricing timezone trap: `schedule create --start-date` with "yesterday" to get around
  the Cupertino offset
- new required field: regulated medical device declaration
  (`asc web apps medical-device set --declared false`)
- review details' demoAccountRequired can unexpectedly be true; fix with details-update
- submission order: content-rights → medical device → submissions-create → items-add →
  submit --confirm (items-add's error tells you exactly what is missing; `asc review
  doctor` does the same)

---

## store-screenshots

1. **A standalone release build**, not Expo Go (its floating toolbar cannot be
   removed): `expo run:ios --configuration Release`
2. Drive everything through sim-use; **locate with describe-ui aliases, never blind
   coordinates** (a blind tap once walked through an entire logging flow by accident)
3. Staging: temporary tuning (accelerated growth etc.) carries a DO NOT COMMIT marker;
   `git checkout` after the shoot
4. Verify long flows with sim-use record-video to save tokens
5. Sizes: iOS 6.9" = 1320×2868 (16 Pro Max); Play phone shots share the source, plus
   a separately composed 1024×500 feature graphic
6. Locales: switch language in-app and rerun the same script; output per-locale
   directories (matches the asc screenshots upload fan-out)
7. Framing afterwards: asc screenshots frame (automatic) or
   ParthJadhav/app-store-screenshots (hand-polished)

---

## store-listing

Length table: ASC name/subtitle 30, keywords 100, promo 170, description 4000;
Play title 30, short 80, full 4000.
Rules: no emoji in ASC descriptions; keywords separated by ASCII commas; ja/zh
full-width characters count as 1; three-locale strategy and templates (zh source →
en/ja localised rewrites, not literal translation); canonical directory structure =
the asc metadata pull format, with the Play copy stored separately (emoji kept).

---

## monetize-revenuecat / monetize-admob (planned, awaiting field use)

RC: react-native-purchases is a native module → the "this breaks OTA" warning goes at
the top; ASC/Play products → RC offerings → reconcile with asc-revenuecat-catalog-sync;
Restore button (Apple rejects without it); sandbox testers.
AdMob: react-native-google-mobile-ads + app.json plugin; app-ads.txt on the website;
ATT + UMP; **privacy re-declaration checklist**: Play Data safety must now declare
device identifiers, the ASC privacy questionnaire must match, ASC age rating
`--advertising` flips to true.
