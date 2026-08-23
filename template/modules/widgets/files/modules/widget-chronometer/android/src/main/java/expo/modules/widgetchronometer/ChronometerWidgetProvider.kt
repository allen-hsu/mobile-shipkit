package expo.modules.widgetchronometer

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.os.SystemClock
import android.widget.RemoteViews

class ChronometerWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) = bind(context, manager, ids)

  companion object {
    fun bind(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val p = context.getSharedPreferences(WidgetChronometerModule.PREFS, Context.MODE_PRIVATE)
      val title = p.getString(WidgetChronometerModule.KEY_TITLE, null) ?: "Set a date in the app"
      val target = p.getLong(WidgetChronometerModule.KEY_TARGET, 0L)
      val pkg = context.packageName
      for (id in ids) {
        val rv = RemoteViews(pkg, context.resources.getIdentifier("chronometer_widget", "layout", pkg))
        val titleId = context.resources.getIdentifier("title", "id", pkg); val timerId = context.resources.getIdentifier("timer", "id", pkg)
        rv.setTextViewText(titleId, title)
        if (target > 0L) {
          // Chronometer base is in elapsedRealtime space: now_elapsed + (target_wall - now_wall)
          val base = SystemClock.elapsedRealtime() + (target - System.currentTimeMillis())
          rv.setChronometerCountDown(timerId, true)
          rv.setChronometer(timerId, base, "%s", true)
        } else {
          rv.setChronometer(timerId, SystemClock.elapsedRealtime(), "%s", false)
        }
        manager.updateAppWidget(id, rv)
      }
    }
  }
}
