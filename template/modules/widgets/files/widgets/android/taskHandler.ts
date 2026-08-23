// Register once from the app entry (index.js / app/_layout.tsx):
//   import { registerWidgetTaskHandler } from 'react-native-android-widget';
//   import { widgetTaskHandler } from './widgets/android/taskHandler';
//   registerWidgetTaskHandler(widgetTaskHandler);
//
// Why the midnight alarm: the system's updatePeriodMillis is ≥ 30 min and not aligned to midnight,
// so a day counter can show yesterday's number for up to half an hour — the #1 complaint on the
// incumbent apps. We re-render on WIDGET_UPDATE *and* schedule our own refresh at the next local
// midnight via expo-background-task / a notification trigger (pick one; see docs/shipkit/widgets.md).
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CountdownWidget } from './CountdownWidget';
import { ANDROID_WIDGET_KEY, type WidgetData } from '../shared';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const raw = await AsyncStorage.getItem(ANDROID_WIDGET_KEY);
  const data: WidgetData | null = raw ? JSON.parse(raw) : null;
  switch (props.widgetAction) {
    case 'WIDGET_ADDED': case 'WIDGET_UPDATE': case 'WIDGET_RESIZED':
      props.renderWidget(CountdownWidget(data)); break;
    case 'WIDGET_CLICKED': break;   // clickAction OPEN_APP handled by the system
    case 'WIDGET_DELETED': break;
  }
}
