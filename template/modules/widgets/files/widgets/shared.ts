// One call from the app updates every widget on both platforms.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const APP_GROUP = 'group.shipkit.widgets';       // must match app.json + targets/widget/expo-target.config.js
export const ANDROID_WIDGET_KEY = 'shipkit.widget.countdown';

export type WidgetData = { title: string; target: number /* unix seconds */; theme?: string };

export async function publishWidgetData(data: WidgetData) {
  if (Platform.OS === 'ios') {
    const { ExtensionStorage } = await import('@bacons/apple-targets');
    const s = new ExtensionStorage(APP_GROUP);
    s.set('title', data.title); s.set('target', data.target); s.set('theme', data.theme ?? 'default');
    ExtensionStorage.reloadWidget();                    // WidgetCenter.reloadAllTimelines
  } else {
    await AsyncStorage.setItem(ANDROID_WIDGET_KEY, JSON.stringify(data));
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    const { CountdownWidget } = await import('./android/CountdownWidget');
    await requestWidgetUpdate({ widgetName: 'Countdown', renderWidget: () => CountdownWidget(data), widgetNotFound: () => {} });
  }
}
