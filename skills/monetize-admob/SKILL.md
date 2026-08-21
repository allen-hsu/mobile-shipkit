---
name: monetize-admob
description: Planned, not yet field-tested. Skeleton for wiring Google AdMob into an Expo app, centred on the privacy re-declaration checklist for both stores once ads are in — Play Data safety must declare device identifiers, the ASC privacy questionnaire must match, ASC age rating advertising flips to true, ATT and UMP consent flows, app-ads.txt. Use when the user wants to "add ads", "AdMob", "banner / interstitial ads", but tell the user this skill has not yet been verified on a real submission.
---

# monetize-admob (planned, awaiting field use)

> ⚠️ This skill has not been run end to end on a real app. Skeleton and known hard
> rules below; defer to the official docs and actual errors for details.

## First thing: this breaks OTA

`react-native-google-mobile-ads` is a native module; adding it means a new binary (see
eas-ota-discipline section 3).

## Skeleton

1. Create the app (one per platform) and ad units in the AdMob dashboard; get the App IDs.
   > 🧑 Human step: the AdMob account, payment details and app review are the human's.
2. `npx expo install react-native-google-mobile-ads`; fill the two App IDs and
   `userTrackingUsageDescription` (the ATT copy) in the app.json plugin.
3. **Consent flow**: iOS ATT (`requestTrackingPermissionsAsync`) + Google UMP (GDPR / US
   state laws), both before the first ad is shown.
4. **app-ads.txt** at the root of the website given in the store listing (GitHub Pages
   works); copy the content from the AdMob dashboard.
5. Develop with test ad unit IDs, switch to production IDs before release — **switch on
   `__DEV__`, not by hand**.

## Privacy re-declaration checklist (the easiest thing to miss)

The pre-ads "collects nothing" declarations are void; both stores must be refilled:

| Store | What changes | How |
|---|---|---|
| Play Data safety | declare **Device or other IDs** (advertising ID), possibly approximate location; purpose "Advertising or marketing"; shared with third parties = yes | `gpc datasafety push` with a new CSV (fill it once in Console and export as the template, see submit-google) |
| Play ads declaration | App content → Ads → contains ads | 🧑 Console |
| ASC privacy questionnaire (App Privacy) | add Identifiers (Device ID), Usage Data, possibly Coarse Location; purpose Third-Party Advertising; linked / tracking per the ATT setup | 🧑 ASC UI (no write API) |
| ASC age rating | `--advertising` to true ("Unrestricted Web Access" / "Advertising" items) | `asc age-rating`-style commands; trust `--help` |
| ASC ATT | Info.plist `NSUserTrackingUsageDescription`; review checks that the prompt really appears | app.json plugin |

> 🧑 Human step: privacy declarations are legal statements; a human confirms every
> answer before the agent fills it in.

## To verify

- [ ] whether the config plugin on Expo SDK 54 needs an extra `expo-build-properties`
- [ ] whether `eas build --local` for Android needs gradle memory raised again (eas-build-doctor case 6)
- [ ] the exact asc command name for age-rating advertising
- [ ] actual UMP display behaviour in Taiwan / Japan
