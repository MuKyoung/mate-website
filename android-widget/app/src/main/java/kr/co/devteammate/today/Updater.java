package kr.co.devteammate.today;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.os.Build;
import android.util.Log;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

/**
 * 새 판 저절로 받기. 사이트의 public/downloads/mate-today.json 에 versionCode · 받을 주소 · SHA-256 을 둔다.
 *
 * - 위젯이 새로 읽을 때(30분마다) · 앱을 열 때 3시간에 한 번 확인하고, 새 판이면 받아 해시를 맞춰 본 뒤
 *   PackageInstaller 로 깐다(같은 키로 서명한 판만 덮어 깔린다).
 * - 안드로이드 12 부터는 이 앱이 스스로 깐 적이 있으면(설치한 앱 = 이 앱) 묻지 않고 바뀐다.
 *   처음 한 번(파일로 깐 앱) · 안드로이드 11 까지는 안드로이드가 '업데이트할까요?'를 묻는다 -
 *   그때는 위젯 · 앱 화면에 '업데이트 설치'를 띄우고, 누르면 확인 창이 뜬다(UpdateReceiver).
 * - 같은 판을 저절로 깔다 막혔으면 12시간 동안 다시 받지 않는다(누르면 바로).
 */
final class Updater {
    static final String MANIFEST = "https://devteammate.co.kr/downloads/mate-today.json";
    private static final String SITE = "https://devteammate.co.kr/";
    static final String ACTION_STATUS = "kr.co.devteammate.today.UPDATE_STATUS";
    private static final long CHECK_EVERY = 3L * 60 * 60 * 1000;
    private static final long RETRY_AFTER = 12L * 60 * 60 * 1000;
    private static final String TAG = "MateUpdate";

    private Updater() {}

    static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences("update", Context.MODE_PRIVATE);
    }

    static long currentCode(Context ctx) {
        try {
            PackageInfo pi = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
            return Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
        } catch (Exception e) {
            return 0;
        }
    }

    static String currentName(Context ctx) {
        try {
            String n = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0).versionName;
            return n == null ? "" : n;
        } catch (Exception e) {
            return "";
        }
    }

    /** 새 판이 나와 있는가(마지막 확인 기준) */
    static boolean available(Context ctx) {
        return prefs(ctx).getLong("availableCode", 0) > currentCode(ctx);
    }

    static String availableName(Context ctx) {
        return prefs(ctx).getString("availableName", "");
    }

    /** 저절로 깔려 했지만 안드로이드가 사람 확인을 기다린다 - 위젯 · 앱에 '업데이트 설치'를 띄운다 */
    static boolean needsConfirm(Context ctx) {
        return available(ctx) && prefs(ctx).getBoolean("needsConfirm", false);
    }

    /**
     * 일꾼 스레드에서 부른다. force 면(사람이 '업데이트 설치'를 눌렀다) 바로 확인하고 막힌 판도 다시 깐다.
     * 성공 여부는 UpdateReceiver 가 받는다
     */
    static synchronized void check(Context ctx, boolean force) {
        SharedPreferences p = prefs(ctx);
        long now = System.currentTimeMillis();
        if (!force && now - p.getLong("checkedAt", 0) < CHECK_EVERY) return;
        p.edit().putLong("checkedAt", now).apply();
        try {
            JSONObject m = new JSONObject(new String(get(MANIFEST + "?t=" + now), "UTF-8"));
            long code = m.getLong("versionCode");
            if (code <= currentCode(ctx)) {
                p.edit().remove("availableCode").remove("availableName").remove("needsConfirm").apply();
                return;
            }
            p.edit().putLong("availableCode", code).putString("availableName", m.optString("versionName", "")).apply();
            if (!force && p.getLong("triedCode", 0) == code && now - p.getLong("triedAt", 0) < RETRY_AFTER) return;
            install(ctx, m, code);
        } catch (Exception e) {
            Log.w(TAG, "update check: " + e);
        }
    }

    private static void install(Context ctx, JSONObject m, long code) throws Exception {
        String url = m.getString("url");
        if (url.startsWith("/")) url = "https://devteammate.co.kr" + url;
        // 우리 사이트에서만 받는다
        if (!url.startsWith(SITE)) throw new IOException("unexpected url " + url);
        byte[] apk = get(url);
        String sha = hex(MessageDigest.getInstance("SHA-256").digest(apk));
        if (!sha.equalsIgnoreCase(m.optString("sha256", ""))) throw new IOException("sha256 mismatch");
        prefs(ctx).edit().putLong("triedCode", code).putLong("triedAt", System.currentTimeMillis()).apply();

        PackageInstaller installer = ctx.getPackageManager().getPackageInstaller();
        PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
        params.setAppPackageName(ctx.getPackageName());
        params.setSize(apk.length);
        // 안드로이드 12+: 이 앱이 '설치한 앱'이면 묻지 않고 바꾼다. 아니면 안드로이드가 확인을 기다린다(STATUS_PENDING_USER_ACTION)
        if (Build.VERSION.SDK_INT >= 31) params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
        int id = installer.createSession(params);
        try (PackageInstaller.Session s = installer.openSession(id)) {
            try (OutputStream out = s.openWrite("base.apk", 0, apk.length)) {
                out.write(apk);
                s.fsync(out);
            }
            Intent status = new Intent(ctx, UpdateReceiver.class).setAction(ACTION_STATUS).putExtra("code", code);
            // 안드로이드가 결과(EXTRA_STATUS)를 채워 넣으므로 바꿀 수 있는(mutable) PendingIntent - 앱 안의 받는 곳을 가리킨다
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
            s.commit(PendingIntent.getBroadcast(ctx, 7, status, flags).getIntentSender());
        }
    }

    private static byte[] get(String url) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        try {
            c.setConnectTimeout(10000);
            c.setReadTimeout(30000);
            c.setRequestProperty("Cache-Control", "no-cache");
            int code = c.getResponseCode();
            if (code >= 300) throw new IOException("http " + code);
            try (InputStream in = c.getInputStream()) {
                ByteArrayOutputStream b = new ByteArrayOutputStream();
                byte[] buf = new byte[16384];
                int n;
                while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
                return b.toByteArray();
            }
        } finally {
            c.disconnect();
        }
    }

    private static String hex(byte[] d) {
        StringBuilder sb = new StringBuilder(d.length * 2);
        for (byte x : d) sb.append(String.format("%02x", x));
        return sb.toString();
    }
}
