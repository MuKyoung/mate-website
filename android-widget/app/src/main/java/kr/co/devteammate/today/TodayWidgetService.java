package kr.co.devteammate.today;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import java.util.ArrayList;
import java.util.List;

/**
 * 위젯 목록을 채운다. onDataSetChanged 는 안드로이드가 일꾼 스레드에서 부르므로 여기서 바로 서버를 읽는다.
 */
public class TodayWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        int id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        return new Factory(getApplicationContext(), id);
    }

    static final class Factory implements RemoteViewsFactory {
        private final Context ctx;
        private final int widgetId;
        private List<Api.Task> items = new ArrayList<>();

        Factory(Context ctx, int widgetId) {
            this.ctx = ctx;
            this.widgetId = widgetId;
        }

        @Override
        public void onCreate() {}

        @Override
        public void onDataSetChanged() {
            try {
                items = Api.today(ctx, TodayWidgetProvider.isMine(ctx, widgetId));
                TodayWidgetProvider.showResult(ctx, widgetId, items.size(), null, false);
            } catch (Api.ApiException e) {
                // 읽지 못했으면 옛 목록을 남기지 않는다 - 다른 날 · 다른 계정의 항목이 오늘 것처럼 보이지 않게
                items = new ArrayList<>();
                TodayWidgetProvider.showResult(ctx, widgetId, -1, e.getMessage(), e.needLogin);
            }
        }

        @Override
        public void onDestroy() {
            items.clear();
        }

        @Override
        public int getCount() {
            return items.size();
        }

        @Override
        public RemoteViews getViewAt(int position) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_item);
            if (position < 0 || position >= items.size()) return v;
            Api.Task t = items.get(position);
            boolean done = "done".equals(t.status);

            v.setTextColor(R.id.dot, Api.statusColor(t.status));
            v.setTextViewText(R.id.key, "MATE-" + t.num);
            v.setTextViewText(R.id.state, Api.statusLabel(t.status));
            v.setTextColor(R.id.state, Api.statusColor(t.status));
            // 급함 · 높음만 적는다 - 보통 · 낮음까지 적으면 줄마다 글자가 늘어 눈에 안 띈다
            v.setTextViewText(R.id.priority, done ? "" : "urgent".equals(t.priority) ? "긴급" : "high".equals(t.priority) ? "높음" : "");
            v.setTextViewText(R.id.title, t.title.isEmpty() ? "(제목 없음)" : t.title);
            v.setTextColor(R.id.title, done ? 0xFF7F8B9E : 0xFF1B2430);

            // 누르면 웹 작업 관리에서 이 작업을 연다 - 틀(TodayWidgetProvider)의 OpenActivity 로 주소가 채워진다
            Intent fill = new Intent();
            fill.setData(Uri.parse(Api.WEB + "?task=" + Uri.encode(t.id)));
            v.setOnClickFillInIntent(R.id.item, fill);
            return v;
        }

        @Override
        public RemoteViews getLoadingView() {
            return null;
        }

        @Override
        public int getViewTypeCount() {
            return 1;
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public boolean hasStableIds() {
            return false;
        }
    }
}
