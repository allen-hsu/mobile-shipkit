package expo.modules.widgetchronometer

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// JS → SharedPreferences → every placed ChronometerWidgetProvider instance is re-bound once.
// After that the Chronometer itself counts; we never need to touch the widget again until the target changes.
class WidgetChronometerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WidgetChronometer")
    Function("setTarget") { title: String, targetUnixMs: Double ->
      val ctx = appContext.reactContext
      if (ctx != null) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY_TITLE, title).putLong(KEY_TARGET, targetUnixMs.toLong()).apply()
        refreshAll(ctx)
      }
    }
    Function("clear") {
      val ctx = appContext.reactContext
      if (ctx != null) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply()
        refreshAll(ctx)
      }
    }
  }
  private fun refreshAll(ctx: Context) {
    val mgr = AppWidgetManager.getInstance(ctx)
    val ids = mgr.getAppWidgetIds(ComponentName(ctx, ChronometerWidgetProvider::class.java))
    ChronometerWidgetProvider.bind(ctx, mgr, ids)
  }
  companion object { const val PREFS = "widget_chronometer"; const val KEY_TITLE = "title"; const val KEY_TARGET = "target" }
}
