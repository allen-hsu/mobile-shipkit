---
name: eas-build-doctor
description: Diagnose and fix Expo / EAS build failures (cloud or `eas build --local`) and native build problems in CNG projects. Use when the agent sees `npm ci` rejecting the lockfile, an unexpectedly large EAS archive, an expo-updates runtime/fingerprint mismatch, exhausted cloud build quota, a local iOS Swift compile error, Android OutOfMemoryError Metaspace, a gradle GlobalCacheLocations error, a swallowed "node exited 1", or Android release lint ExtraTranslation. Contains nine real cases (symptom → root cause → fix) observed on a real dual-store submission in Aug 2026, plus a diagnostic toolbox for decompressing EAS logs, keeping the working directory, and replaying gradle by hand.
---

# eas-build-doctor

A casebook of EAS build failures. Every entry was actually hit, and actually fixed,
during a real dual-store submission in Aug 2026 (Expo SDK 54 / expo-modules 57).
**Match the symptom first, read the root cause, then act.**

## Ground rules

1. **Get the full log before guessing.** Cloud logs are brotli-compressed; local builds
   need the working directory kept. See "Diagnostic toolbox".
2. **Local and cloud must match.** Most "only breaks in the cloud" cases come down to
   local node_modules drifting from the lockfile / patches.
3. **A fix must land in the repo.** Hand-editing node_modules or gradle.properties is
   not a fix — only patch-package, hooks and config files committed to git count.
4. After fixing, **write the symptom and the fix into the commit message** so the next
   person (or agent) can find it.

## Casebook

### 1. builder `npm ci` rejects the lockfile

- **Symptom**: the cloud install step fails with something like
  `npm error Invalid: lock file's @emnapi/wasi-threads@1.2.1 does not satisfy @emnapi/wasi-threads@1.2.3`.
  Local `npm install` is fine.
- **Root cause**: incremental `npm install` leaves platform-specific residue in the
  lockfile (optional / platform-specific package version drift). `npm ci` passing on
  macOS says nothing about the Linux builder.
- **Fix**: regenerate from scratch.
  ```sh
  rm -rf node_modules package-lock.json
  npm install
  # verify in a clean directory, not in place
  mkdir /tmp/ci-check && cp package.json package-lock.json /tmp/ci-check && cd /tmp/ci-check
  npm ci --dry-run --ignore-scripts
  ```
  The same project hit this twice; regeneration fixed it both times.
- **How to spot it**: grep the log for `npm error Invalid:` / `does not satisfy` — it
  names the drifted package.
- **Variant (regeneration does NOT fix it)**: `npm ls <pkg>` shows `invalid` and even an
  in-place `npm ci --dry-run` fails, e.g. `Missing: ajv@6.15.0 from lock file`. npm 11
  resolved an *optional peer* (`@hookform/resolvers` wants `ajv ^8`) by deduping it onto
  another package's `ajv@6` in a single resolution. Fix: install that package in a
  **separate** `npm install <pkg>` step after the rest — npm then nests the right major.
  The template's `.shipkit-install.sh` orders installs (expo → dev → npm → lockfile check)
  for this reason. Seen on a fresh SDK 57 project, Aug 2026.

### 2. Archive bloat, slow upload or over the limit

- **Symptom**: the `eas build` archive grows instead of shrinking (546 MB → 614 MB),
  even right after adding `.easignore`.
- **Root cause**: **once `.easignore` exists it fully replaces `.gitignore`**. The first
  version listed only generated-asset directories, so node_modules and .git were
  packed back in.
- **Fix**: `.easignore` must re-list everything `.gitignore` excluded:
  ```gitignore
  # the project's own large material
  tmp/
  docs/
  tools/
  # .easignore REPLACES .gitignore — below is what .gitignore already excluded
  node_modules/
  .git/
  /ios/
  /android/
  .expo/
  *.log
  .DS_Store
  ```
- **How to spot it**: `eas build` prints the archive size before upload; if it grew
  after adding `.easignore`, this is it.

### 3. Configure expo-updates: runtime / fingerprint mismatch

- **Symptom**: the cloud build fails at `Configure expo-updates` or the fingerprint
  step, or `eas update` computes a runtimeVersion different from the build's.
- **Root cause** (two variants, both seen):
  1. a stray local `ios/` or `android/` directory (bareNativeDir) — the fingerprint
     includes native directories.
  2. hand-edited node_modules (e.g. to get Swift compiling), so local and builder
     node_modules are no longer byte-identical.
- **Fix**:
  1. In a CNG project `ios/` and `android/` **never exist locally and never enter the
     repo**; clean with `rm -rf ios android`.
  2. Every node_modules edit goes through `npx patch-package <pkg>` into `patches/`,
     with `"postinstall": "patch-package"`, so both sides are byte-identical after
     install.
- **How to spot it**: run `npx expo-updates fingerprint:generate` locally and compare
  with the value in the cloud log; `npx @expo/fingerprint . --debug` lists which
  files went into the fingerprint.

### 4. Cloud build quota exhausted

- **Symptom**: `eas build` is refused from the queue or reports the quota is used up.
  The free tier counts iOS and Android **separately**.
- **Fix**: `eas build --local --platform <ios|android> --profile production`.
  Same pipeline, same credentials (pulled from EAS), runs locally; the resulting
  `.ipa` / `.aab` goes straight to `eas submit --path` or asc / gpc.
- **Cost**: every local toolchain problem surfaces — cases 5–8 were all triggered by
  `--local`.

### 5. Local iOS: Swift compile error (ambiguous `abs`)

- **Symptom**: `expo-modules-jsi` fails to compile with a message like
  `'abs' is ambiguous`.
- **Root cause**: the local Xcode 26 SDK's newly modularised libc++ puts the C shim's
  `abs` and Swift's `abs` in scope at once; `expo-modules-jsi` 57.0.4 is unfixed
  upstream.
- **Fix**: minimal change (use `.magnitude`, or qualify explicitly) →
  `npx patch-package expo-modules-jsi` → commit the patch. **Track the upstream issue
  and delete the patch when it lands.**
- **Why not edit node_modules directly**: that triggers case 3 (fingerprint mismatch).

### 6. Local Android: `OutOfMemoryError: Metaspace`

- **Symptom**: `./gradlew :app:bundleRelease` dies with
  `java.lang.OutOfMemoryError: Metaspace`.
- **Root cause**: the Expo prebuild template's `android/gradle.properties` allows only
  `MaxMetaspaceSize=512m`. `android/` is regenerated every time in a CNG project, so
  hand edits do not stick.
- **Fix**: sed it in an `eas-build-post-install` hook:
  ```json
  "eas-build-post-install": "test -f android/gradle.properties && { sed -i.bak -E 's/MaxMetaspaceSize=[0-9]+m/MaxMetaspaceSize=2048m/; s/-Xmx[0-9]+m/-Xmx4096m/' android/gradle.properties; printf '\\norg.gradle.daemon=false\\n' >> android/gradle.properties; } || true"
  ```
  Note the `printf '\n...'` — see case 8 for why.

### 7. gradle: `Cannot create service of type ... GlobalCacheLocations`

- **Symptom**: gradle fails at startup mentioning `GlobalCacheLocations` or a cache
  lock.
- **Root cause**: an earlier `pkill -f gradle` killed the daemon hard and corrupted
  `~/.gradle`.
- **Fix**: wipe and rebuild.
  ```sh
  rm -rf ~/.gradle/caches ~/.gradle/daemon
  ```
  The first rebuild re-downloads dependencies; a few minutes.

### 8. `node exited 1`, message swallowed, local + cloud both broken

- **Symptom**: the Android build fails at autolinking with a single line like
  `node exited 1` and no stack. Local and cloud fail **at the same time** — that is the
  key clue: the problem is in the repo, not the environment.
- **Root cause**: the hook appended to `gradle.properties` with `echo >>`, and the
  template-generated file **ends without a newline**. `org.gradle.daemon=false` fused
  onto the preceding `watchedDirectories=[]` line, the broken value was passed into
  expo-autolinking's `--watched-directories-serialized` argument, and node blew up.
- **Fix**: `printf '\norg.gradle.daemon=false\n' >> android/gradle.properties`.
- **General lesson / how to spot it**: rerun with `./gradlew --info` to see **the full
  command line of every node process gradle starts**; the bad argument is obvious.
  Any hook that appends to a config file should first check the trailing newline with
  `tail -c1 file | xxd`.

### 9. Android release lint: `ExtraTranslation`

- **Symptom**: `:app:lintVitalRelease` fails with
  `ExtraTranslation: "CFBundleDisplayName" is translated here but not found in default locale`.
- **Root cause**: `app.json` `locales` used the flat format, so the iOS key
  (`CFBundleDisplayName`) was written into Android `strings.xml`, where the default
  locale has no such key.
- **Fix**: split locale files by platform:
  ```json
  {
    "ios":     { "CFBundleDisplayName": "My App" },
    "android": { "app_name": "My App" }
  }
  ```
  Welcome side effect: the Android launcher label is localised too.

## Diagnostic toolbox

| Goal | How |
|---|---|
| Read the full cloud log | the EAS log download is brotli: `brotli -d build.log.br` or `python3 -c "import brotli,sys;sys.stdout.buffer.write(brotli.decompress(open(sys.argv[1],'rb').read()))" x.br` |
| Keep the working directory after a local failure | `EAS_LOCAL_BUILD_SKIP_CLEANUP=1 eas build --local ...`; the path is printed at the end of the log (`/var/folders/.../eas-build-local-nodejs/<id>/build/`) |
| Replay gradle by hand in that directory | `cd <kept dir>/android && EAS_BUILD_WORKINGDIR=<dir containing credentials.json> ./gradlew :app:bundleRelease --info --stacktrace` |
| See what went into the fingerprint | `npx @expo/fingerprint . --debug` |
| Verify the lockfile installs in a clean environment | the `/tmp/ci-check` flow from case 1 |
| Environment problem vs repo problem | local and cloud both fail → repo; only one side fails → environment (toolchain, cache, quota) |

## Preconditions for local builds

- iOS: the Xcode version may differ from the EAS image (case 5); fastlane installed;
  `eas credentials` can fetch credentials
- Android: JDK 17, Android SDK, a clean `~/.gradle` (case 7), enough gradle memory
  (case 6)
- Both: `ios/` and `android/` not in the repo (case 3), `patches/` complete, lockfile
  regenerated (case 1)

## A failure not listed here

Do three things first: (1) get the full log (not the EAS web summary); (2) ask "does it
fail locally too?"; (3) rerun with `--info` / `--stacktrace`. Then add the new case to
this file as symptom → root cause → fix.

## Attachments

- `template/scripts/check-lockfile.sh`: the clean-directory `npm ci --dry-run` check from case 1, one line.
- `template/package.json.merge`: the correct gradle hook from cases 6 and 8 (printf with newline).
- `template/.easignore`, `template/i18n/native/`: the finished fixes for cases 2 and 9.
