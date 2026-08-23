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

Not yet field-tested by this kit beyond `prebuild`; report back into `skills/eas-build-doctor` when it bites.
