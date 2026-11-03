package kr.co.devteammate.today;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

/**
 * 위젯을 놓을 때 - '내 작업' 또는 '팀 전체'. 위젯을 길게 눌러 다시 고를 수도 있다(reconfigurable).
 * 고르지 않고 나가면 위젯을 놓지 않는다(RESULT_CANCELED).
 */
public class WidgetConfigActivity extends Activity {
    private int widgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setResult(RESULT_CANCELED);
        Bundle extras = getIntent().getExtras();
        if (extras != null) widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }
        setContentView(R.layout.activity_config);
        findViewById(R.id.mine).setOnClickListener(v -> choose(true));
        findViewById(R.id.all).setOnClickListener(v -> choose(false));
        findViewById(R.id.need_login).setVisibility(Api.signedIn(this) ? View.GONE : View.VISIBLE);
        findViewById(R.id.open_app).setOnClickListener(v ->
                startActivity(new Intent(this, MainActivity.class)));
    }

    @Override
    protected void onResume() {
        super.onResume();
        // 앱에서 로그인하고 돌아왔으면 안내를 거둔다
        View note = findViewById(R.id.need_login);
        if (note != null) note.setVisibility(Api.signedIn(this) ? View.GONE : View.VISIBLE);
    }

    private void choose(boolean mine) {
        TodayWidgetProvider.widgets(this).edit().putBoolean("mine_" + widgetId, mine).commit();
        AppWidgetManager m = AppWidgetManager.getInstance(this);
        m.updateAppWidget(widgetId, TodayWidgetProvider.build(this, widgetId));
        m.notifyAppWidgetViewDataChanged(new int[] {widgetId}, R.id.list);
        setResult(RESULT_OK, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId));
        finish();
    }
}
