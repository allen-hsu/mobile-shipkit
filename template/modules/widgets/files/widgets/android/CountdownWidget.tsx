// Day-level Android widget (JSX → RemoteViews). No animation, no ticking: for h:mm:ss use modules/widget-chronometer.
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetData } from '../shared';

export function CountdownWidget(data?: WidgetData | null) {
  const days = data ? Math.round((startOfDay(data.target * 1000) - startOfDay(Date.now())) / 86400000) : null;
  return (
    <FlexWidget style={{ height: 'match_parent', width: 'match_parent', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, justifyContent: 'center' }} clickAction="OPEN_APP">
      <TextWidget text={data?.title ?? 'Set a date in the app'} style={{ fontSize: 12, color: '#6B7280' }} maxLines={1} />
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <TextWidget text={days == null ? '–' : String(Math.abs(days))} style={{ fontSize: 36, fontWeight: 'bold', color: '#111111' }} />
        <TextWidget text={days == null ? '' : days >= 0 ? '  days left' : '  days since'} style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }} />
      </FlexWidget>
    </FlexWidget>
  );
}
const startOfDay = (ms: number) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
