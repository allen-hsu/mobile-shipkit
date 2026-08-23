// Local Expo Module (autolinked from ./modules). Android only: a home-screen widget whose h:mm:ss
// is ticked by the system (RemoteViews Chronometer, countDown=true) — zero updates, zero battery,
// never stale. iOS does the same thing with Text(date, style: .timer) in targets/widget.
import { requireNativeModule, Platform } from 'expo-modules-core';
type Native = { setTarget(title: string, targetUnixMs: number): void; clear(): void };
const native: Native | null = Platform.OS === 'android' ? requireNativeModule('WidgetChronometer') : null;
export function setChronometerTarget(title: string, targetUnixMs: number) { native?.setTarget(title, targetUnixMs); }
export function clearChronometer() { native?.clear(); }
