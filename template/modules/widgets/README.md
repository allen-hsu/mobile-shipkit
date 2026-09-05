# widgets module

Home-screen / Lock-Screen widgets for an Expo app without leaving CNG. Three pieces; use what the app needs.

| piece | where | what |
|---|---|---|
| iOS WidgetKit target | `targets/widget/` (`@bacons/apple-targets`) | SwiftUI widget bundle outside `ios/` — survives `prebuild --clean`. `Text(date, style: .timer)` ticks natively; day number refreshes at local midnight via the timeline. Home (small/medium) + Lock Screen (accessory) families. Add a Live Activity to the same bundle later. |
| Android day-level widget | `widgets/android/` (`react-native-android-widget`) | JSX → RemoteViews. Good for numbers and text; **no animation, no ticking**, system update ≥ 30 min. |
| Android live countdown | `modules/widget-chronometer/` (local Expo Module, Kotlin) | RemoteViews `Chronometer(countDown)` — the OS ticks h:mm:ss itself. ~120 lines; autolinked from `modules/`. |

Shared entry point: `widgets/shared.ts → publishWidgetData({ title, target })` writes App Group UserDefaults (iOS, `ExtensionStorage`) or AsyncStorage + `requestWidgetUpdate` (Android). For the Chronometer widget call `setChronometerTarget(title, targetMs)` from `modules/widget-chronometer`.

## After apply

1. **Rename the App Group** in three places: `app.json → ios.entitlements`, `targets/widget/expo-target.config.js`, `widgets/shared.ts`. Register the group on the Apple developer portal (EAS credentials does it on first build).
2. `app.json → ios.appleTeamId` must be set (apple-targets needs it).
3. Register the Android task handler once in the app entry (see the comment in `widgets/android/taskHandler.ts`), and add `assets/widget-preview.png` (or remove `previewImage`).
4. `npx expo prebuild` → `eas build --profile development` — **widgets never run in Expo Go**; a dev client is the minimum.
5. Midnight refresh on Android: `updatePeriodMillis` cannot be aligned to midnight. Schedule `requestWidgetUpdate` from a background task (`expo-background-task`, ≥ 15 min granularity, or a silent local notification at 00:00) and handle `ACTION_TIMEZONE_CHANGED` / `BOOT_COMPLETED` if the number must be exact — this is the #1 complaint on incumbent countdown apps, so do not skip it.
6. Toolchain: Xcode 16+, CocoaPods ≥ 1.16.2; `@bacons/apple-targets` is experimental (3.x) and may break across Expo SDKs — pin it.

## Verify on device

- iOS: add the widget, change the date in the app → widget updates within seconds (`reloadWidget`). Lock Screen accessory shows the day number. Set a target < 24 h away → `h:mm:ss` ticks with the screen locked.
- Android: add both widgets; the Chronometer one must tick with the app killed. Change the date → both update. Cross midnight (change device time) → the day-level widget must show the new number.

Field notes (2026-09-05, countdown-tw): CocoaPods **1.16.2 minimum is real** (1.15 dies parsing the pbxproj); build with `xcodebuild -jobs 4` if the machine is memory-tight (the default parallelism got the build OOM-killed); verify registration without the flaky simulator widget gallery via `xcrun simctl spawn <udid> pluginkit -m -p com.apple.widgetkit-extension`; inspect the shared data at the app-group container's `Library/Preferences/<group>.plist` (`simctl get_app_container <udid> <bundle> groups`). Remaining to verify on device: the widget actually rendering on Home/Lock Screen and the Android Chronometer ticking.
