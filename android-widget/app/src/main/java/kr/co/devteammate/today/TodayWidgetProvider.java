package kr.co.devteammate.today;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * 홈 화면 위젯 - 머리(오늘 마감 · 날짜 · 범위 · 건수 · 새로고침)와 그날 항목 목록.
 * 목록은 TodayWidgetService 가 채우고, 다 읽으면 showResult 로 건수 · 기준 시각을 고친다.
 * 30분마다(today_widget_info.xml), 새로고침을 누를 때, 앱에서 로그인 · 로그아웃할 때 새로 읽는다.
 */
public class TodayWidgetProvider extends AppWidgetProvider {
    static final String ACTION_REFRESH = "kr.co.devteammate.today.REFRESH";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) {
        for (int id : ids) m.updateAppWidget(id, build(ctx, id));
        m.notifyAppWidgetViewDataChanged(ids, R.id.list);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) refreshAll(ctx);
    }

    @Override
    public void onDeleted(Context ctx, int[] ids) {
        android.content.SharedPreferences.Editor e = widgets(ctx).edit();
        for (int id : ids) e.remove("mine_" + id);
        e.apply();
    }

    /** 놓인 위젯을 모두 다시 그리고 다시 읽는다 */
    static void refreshAll(Context ctx) {
        AppWidgetManager m = AppWidgetManager.getInstance(ctx);
        int[] ids = m.getAppWidgetIds(new ComponentName(ctx, TodayWidgetProvider.class));
        if (ids.length > 0) new TodayWidgetProvider().onUpdate(ctx, m, ids);
    }

    static android.content.SharedPreferences widgets(Context ctx) {
        return ctx.getSharedPreferences("widgets", Context.MODE_PRIVATE);
    }

    /** 이 위젯이 '내 작업'만 보이는가. 고르지 않았으면 팀 전체 */
    static boolean isMine(Context ctx, int id) {
        return widgets(ctx).getBoolean("mine_" + id, false);
    }

    static RemoteViews build(Context ctx, int id) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_today);
        String day = new SimpleDateFormat("M월 d일 (E)", Locale.KOREAN).format(new Date());
        v.setTextViewText(R.id.subtitle, day + " · " + (isMine(ctx, id) ? "내 작업" : "팀 전체"));
        v.setTextViewText(R.id.status, "불러오는 중…");

        // 목록 - 위젯마다 다른 서비스 Intent 여야 목록이 섞이지 않는다(extra 는 비교에 쓰이지 않아 data 에 싣는다)
        Intent svc = new Intent(ctx, TodayWidgetService.class);
        svc.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        svc.setData(Uri.parse(svc.toUri(Intent.URI_INTENT_SCHEME)));
        v.setRemoteAdapter(R.id.list, svc);
        v.setEmptyView(R.id.list, R.id.empty);

        // 머리 글자 → 웹 작업 관리의 캘린더
        v.setOnClickPendingIntent(R.id.title_area, PendingIntent.getActivity(ctx, 1,
                new Intent(Intent.ACTION_VIEW, Uri.parse(Api.WEB + "?view=calendar")),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

        // 새로고침
        Intent refresh = new Intent(ctx, TodayWidgetProvider.class).setAction(ACTION_REFRESH);
        v.setOnClickPendingIntent(R.id.refresh, PendingIntent.getBroadcast(ctx, 2, refresh,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

        // 항목 → 그 작업. 항목마다 주소를 채워 넣으므로 바꿀 수 있는(mutable) 틀 - 앱 안의 OpenActivity 를 가리킨다
        v.setPendingIntentTemplate(R.id.list, PendingIntent.getActivity(ctx, 3,
                new Intent(ctx, OpenActivity.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE));

        setEmptyClick(ctx, v, !Api.signedIn(ctx));
        return v;
    }

    /** 빈 칸을 누르면 - 로그인이 필요하면 앱, 아니면 웹 캘린더 */
    private static void setEmptyClick(Context ctx, RemoteViews v, boolean needLogin) {
        Intent target = needLogin
                ? new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                : new Intent(Intent.ACTION_VIEW, Uri.parse(Api.WEB + "?view=calendar"));
        v.setOnClickPendingIntent(R.id.empty, PendingIntent.getActivity(ctx, needLogin ? 4 : 5, target,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
    }

    /**
     * 목록을 다 읽은 뒤 머리를 고친다. count 가 0 이상이면 성공, error 가 있으면 실패 문구를 빈 칸에 적는다.
     * TodayWidgetService 의 일꾼 스레드에서 부른다.
     */
    static void showResult(Context ctx, int id, int count, String error, boolean needLogin) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_today);
        if (error == null) {
            v.setViewVisibility(R.id.count, View.VISIBLE);
            v.setTextViewText(R.id.count, count + "건");
            v.setTextViewText(R.id.empty, "오늘 마감인 작업이 없습니다");
            String at = new SimpleDateFormat("a h:mm", Locale.KOREAN).format(new Date());
            v.setTextViewText(R.id.status, at + " 기준");
        } else {
            v.setViewVisibility(R.id.count, View.GONE);
            v.setTextViewText(R.id.empty, error);
            v.setTextViewText(R.id.status, needLogin ? "로그인 필요" : "새로고침을 눌러 다시 읽기");
        }
        setEmptyClick(ctx, v, needLogin);
        AppWidgetManager.getInstance(ctx).partiallyUpdateAppWidget(id, v);
    }
}
