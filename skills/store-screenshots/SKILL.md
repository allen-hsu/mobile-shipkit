---
name: store-screenshots
description: Produce App Store and Google Play screenshots from the iOS simulator. Use when the user wants to "take store screenshots", "generate App Store screenshots", a "feature graphic", multi-locale screenshots, or when Expo Go's floating toolbar shows up in captures. Flow: run a standalone release-configuration app (not Expo Go), locate elements with sim-use describe-ui instead of blind coordinates, mark temporary staging tweaks DO NOT COMMIT and revert after the shoot, write per-locale directories to match asc screenshots upload, then frame. Includes the iOS 6.9" and Play size table.
---

# store-screenshots

Store screenshots are not "cmd+S and done". Lesson from a real project in Aug 2026:
the entire first round was reshot because it used Expo Go.

## 1. Run a standalone release build, not Expo Go

Expo Go / dev client has a **floating toolbar that cannot be removed**; it appears in
every capture.

```sh
npx expo run:ios --configuration Release --device "iPhone 16 Pro Max"
```

- The first run prebuilds; a few minutes. Delete the generated `ios/` afterwards (CNG
  projects never commit it; see eas-build-doctor case 3).
- If the release build fails, go to eas-build-doctor first (case 5's Swift error shows
  up here too).

## 2. Drive everything through sim-use, locate with describe-ui

Operate the app with `sim-use` (or an equivalent simulator driver). **Iron rule:
describe-ui first to get accessibility elements, tap by alias / label, never blind
coordinates.**

Real incident: a blind tap hit the primary action button, ran through an entire flow,
altered the staged scene, and the whole set had to be reshot.

A typical one-shot script:

```sh
sim-use describe-ui                      # what is on screen, get labels
sim-use tap --label "Home"               # by label, not (x,y)
sim-use wait 1
sim-use screenshot --out shots/zh-TW/01-home.png
```

For multi-step flows (e.g. "state changes after completing an action") **record once
with `sim-use record-video` to check the flow**, then take stills — saves tokens and
reshoots.

## 3. Staging: mark temporary tweaks, revert them

Store shots want "a populated screen" and "thirty days of data", but a fresh install is
empty. Approach:

1. Add temporary parameters in code (pre-filled data, skipped onboarding, accelerated
   state) with a comment **`// DO NOT COMMIT: screenshot staging`** at every site.
2. After the shoot, `git checkout -- .`; confirm with `git diff`.
3. Never commit staging parameters — they would ride out with the next OTA.

## 4. Sizes

| Store | Spec | Pixels | Notes |
|---|---|---|---|
| App Store iPhone 6.9" | iPhone 16 Pro Max | **1320×2868** | required; the simulator's native capture is exactly this |
| App Store iPad 13" | only if `supportsTablet: true` | 2064×2752 | the example project disabled tablet, so none needed |
| Play phone screenshots | same source as iOS | any 16:9–9:16, longest side ≤3840 | use the 1320×2868 files directly |
| Play feature graphic | composed separately, not a screenshot | **1024×500** | required; the listing is incomplete without it |
| Play icon | | 512×512 | |

ASC scales other iPhone sizes from 6.9"; `asc screenshots resize` (see
asc-screenshot-resize) fills the gaps.

## 5. Locales

Switch language in-app (a settings screen, or the simulator's language:
`xcrun simctl spawn booted defaults write .GlobalPreferences AppleLanguages -array ja`),
**rerun the same script**, write one directory per locale:

```
shots/
  zh-Hant/ 01-home.png 02-action.png ...
  en-US/
  ja/
```

Name directories with ASC locales (`zh-Hant`, `ja`) to line up with the
`asc screenshots upload` fan-out; for Play map them to `zh-TW` / `ja-JP`
(`--locale` of gpc images upload).

## 6. Framing and captions

- Automatic: `asc screenshots frame` (Koubou engine; see asc-shots-pipeline).
- Hand-polished: template projects such as `ParthJadhav/app-store-screenshots`, good
  for shots with large headline copy.
- One caption per shot, ≤ 8 CJK characters / 5 English words, rewritten per language
  (see store-listing).

## 7. Upload

```sh
asc screenshots upload --app <APP_ID> --version <VERSION_ID> --dir ./shots     # ASC
gpc images upload --type phoneScreenshots --locale zh-TW --path ./shots/zh-Hant/  # Play, per locale
```

## Checklist

1. standalone release build, no dev toolbar on screen
2. every interaction located via describe-ui
3. staging parameters reverted, `git diff` clean, `ios/` deleted
4. 1320×2868; Play additionally needs the 1024×500 feature graphic
5. one directory per locale
6. a human reviews the shots before upload

> 🧑 Human step: which shots, their order and the captions are product decisions; the
> agent delivers the set with a list and does not upload on its own.
