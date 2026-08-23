import WidgetKit
import SwiftUI

// Reads what the app wrote through ExtensionStorage (App Group UserDefaults):
//   title: String, target: Double (unix seconds), theme: String
// Day-level number is recomputed per timeline entry at local midnight; the hour/minute/second
// view uses Text(date, style: .timer) so the system ticks it with zero timeline updates.
let appGroup = "group.shipkit.widgets"

struct Entry: TimelineEntry { let date: Date; let title: String; let target: Date? }

struct Provider: TimelineProvider {
  func load() -> Entry {
    let d = UserDefaults(suiteName: appGroup)
    let t = d?.double(forKey: "target") ?? 0
    return Entry(date: .now, title: d?.string(forKey: "title") ?? "Set a date in the app", target: t > 0 ? Date(timeIntervalSince1970: t) : nil)
  }
  func placeholder(in context: Context) -> Entry { Entry(date: .now, title: "Trip to Tokyo", target: Calendar.current.date(byAdding: .day, value: 12, to: .now)) }
  func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) { completion(load()) }
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    let e = load()
    // one entry now + one at the next local midnight; WidgetKit re-asks after that, so the day number never goes stale
    let midnight = Calendar.current.nextDate(after: .now, matching: DateComponents(hour: 0, minute: 0, second: 0), matchingPolicy: .nextTime) ?? .now.addingTimeInterval(3600)
    completion(Timeline(entries: [e, Entry(date: midnight, title: e.title, target: e.target)], policy: .after(midnight)))
  }
}

struct CountdownView: View {
  @Environment(\.widgetFamily) var family
  let entry: Entry
  var days: Int { guard let t = entry.target else { return 0 }
    return Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: entry.date), to: Calendar.current.startOfDay(for: t)).day ?? 0 }
  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(entry.title).font(.caption).foregroundStyle(.secondary).lineLimit(1)
      if let t = entry.target, abs(t.timeIntervalSince(entry.date)) < 86400, family != .accessoryCircular {
        Text(t, style: .timer).font(.system(size: 28, weight: .bold, design: .rounded)).monospacedDigit() // last 24 h: h:mm:ss, system-ticked
      } else {
        HStack(alignment: .lastTextBaseline, spacing: 4) {
          Text("\(abs(days))").font(.system(size: 40, weight: .bold, design: .rounded))
          Text(days >= 0 ? "days left" : "days since").font(.caption2).foregroundStyle(.secondary)
        }
      }
    }
    .containerBackground(for: .widget) { Color("$widgetBackground") }
  }
}

struct CountdownWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "Countdown", provider: Provider()) { CountdownView(entry: $0) }
      .configurationDisplayName("Countdown")
      .description("Days until / since a date, on your Home and Lock Screen.")
      .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryCircular, .accessoryInline])
  }
}

@main
struct WidgetBundle: SwiftUI.WidgetBundle {
  var body: some Widget { CountdownWidget() }   // add a Live Activity (ActivityConfiguration) here later
}
