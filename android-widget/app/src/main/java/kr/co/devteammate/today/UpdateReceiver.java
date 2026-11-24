package kr.co.devteammate.today;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.os.Build;
import android.util.Log;

/**
 * 새 판 설치 결과와 '새 판으로 바뀜'을 받는다.
 * - 안드로이드가 사람 확인을 기다리면: 앱 화면이 떠 있으면 바로 확인 창을 열고, 아니면 위젯 · 앱에 '업데이트 설치'를 띄운다.
 * - 바뀐 뒤(MY_PACKAGE_REPLACED): 표시를 지우고 위젯을 다시 그린다.
 */
public class UpdateReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        if (Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction())) {
            Updater.prefs(ctx).edit().remove("needsConfirm").apply();
            TodayWidgetProvider.refreshAll(ctx);
            return;
        }
        if (!Updater.ACTION_STATUS.equals(intent.getAction())) return;

        int status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
        if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            Intent confirm = Build.VERSION.SDK_INT >= 33
                    ? intent.getParcelableExtra(Intent.EXTRA_INTENT, Intent.class)
                    : intent.getParcelableExtra(Intent.EXTRA_INTENT);
            if (MainActivity.visible && confirm != null) {
                confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                try {
                    ctx.startActivity(confirm);
                    return;
                } catch (Exception e) {
                    Log.w("MateUpdate", "confirm: " + e);
                }
            }
            Updater.prefs(ctx).edit().putBoolean("needsConfirm", true).apply();
            TodayWidgetProvider.refreshAll(ctx);
            MainActivity.notifyUpdateState();
        } else if (status != PackageInstaller.STATUS_SUCCESS) {
            Log.w("MateUpdate", "install status " + status + " " + intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE));
            MainActivity.notifyUpdateState();
        }
    }
}
