---
name: eas-ota-discipline
description: Discipline for publishing and verifying Expo EAS Update (OTA). Use when the agent is about to run `eas update`, when a user reports "the update went out but nobody got it", when deciding whether a change can ship OTA or needs a new binary, or when setting up the channel↔branch↔profile mapping in eas.json. The core is the runtimeVersion fingerprint rule: an update only reaches installs with the identical fingerprint, so every publish must be followed by comparing `eas update:list` against `eas build:list`. Includes the standard eas.json triple and the list of changes that break the fingerprint.
---

# eas-ota-discipline

OTA looks trivial: run `eas update` and done. Real case (a real project, Aug 2026): a
tester sat on the old build for a week while everyone assumed the update had shipped.
The command was not wrong — **the fingerprint did not match, so the update never
arrived**. This skill exists to prevent that.

## 1. Before publishing

- The working tree is **clean and committed**. EAS records the commit hash on the
  update; a dirty tree is untraceable.
- Non-interactive runs (agents, CI) must pass `--environment`, or they hang on an
  interactive menu:
  ```sh
  eas update --branch production --environment production --message "fix: <one line>"
  ```
- Confirm the change **does not break the fingerprint** (section 3). If it does, this
  is not an OTA — it is a rebuild.

## 2. The fingerprint rule (check after every publish)

> **An update is delivered only to installs whose runtimeVersion is identical.**

Compare immediately after publishing:

```sh
eas update:list --branch production --limit 3     # runtimeVersion of the update you just sent
eas build:list --platform all --limit 5            # runtimeVersion of the builds users have installed
```

The two `runtimeVersion` values must match exactly. A mismatch = **nobody receives
it**, and `eas update` will not complain.

With `runtimeVersion.policy = "fingerprint"` the value is a hash of the native layer;
compute it locally with:

```sh
npx expo-updates fingerprint:generate     # or npx @expo/fingerprint . --debug to see what went in
```

If the local value differs from the latest build, your native layer has already
changed and the OTA is shooting blanks.

## 3. What breaks the fingerprint (= new binary required)

| Change | Why |
|---|---|
| native config in app.json: icon, name, splash, `locales`, infoPlist, permissions | lands in the prebuild output |
| **adding any native package** (react-native-purchases, react-native-google-mobile-ads, any expo-* with native code) | new native module |
| upgrading Expo SDK / React Native | the whole native layer changes |
| node_modules edited by hand **without patch-package** | local fingerprint ≠ builder fingerprint (see eas-build-doctor case 3) |
| a stray local `ios/` or `android/` directory | bareNativeDir enters the fingerprint |

Pure JS / TS, image assets (other than icon/splash), copy, i18n strings → OTA is fine.

When unsure, compute the fingerprint once and compare with the previous build.

## 4. Delivery behaviour

- It takes effect on the **second cold start**: the first launch downloads, the second
  applies. Do not relaunch once and declare it missing.
- Icon / name / splash **never go OTA**, even when the fingerprint is unchanged — they
  are part of the installed package.
- To verify receipt, show `Updates.updateId` / `Updates.runtimeVersion` on an About
  screen; far more reliable than asking users "did you get the update?".

## 5. channel ↔ branch ↔ profile mapping (fixed in eas.json)

The triple: one build profile binds one channel; the channel maps to the branch of the
same name by default. Do not let the names diverge.

```json
{
  "cli": { "version": ">= 21.5.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "channel": "preview"
    },
    "production": {
      "distribution": "store",
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" },
      "channel": "production"
    }
  }
}
```

The matching `app.json`:

```json
{
  "expo": {
    "runtimeVersion": { "policy": "fingerprint" },
    "updates": { "url": "https://u.expo.dev/<projectId>" }
  }
}
```

Use the same name for `--branch` when publishing:

| Purpose | build | update |
|---|---|---|
| internal testing | `eas build --profile preview` | `eas update --branch preview --environment preview` |
| production | `eas build --profile production` | `eas update --branch production --environment production` |

To see which branch a channel points at: `eas channel:view production`.

## 6. Publish checklist (the agent reports each item)

1. `git status` clean and committed
2. the change is not in the section 3 list (or a rebuild has been agreed)
3. `eas update --branch <b> --environment <e> --message "..."`
4. runtimeVersion from `eas update:list` matches `eas build:list`
5. tell the user: two cold starts; icon/name/splash will not change

> 🧑 Human step: if step 4 mismatches, deciding to "cut a new binary and resubmit" is a
> human call — it moves store review timelines.

## Attachments

`template/scripts/check-ota.sh [branch] [platform]`: automates the section 2 comparison;
MISMATCH exits 1, suitable for CI or a post-update hook.
