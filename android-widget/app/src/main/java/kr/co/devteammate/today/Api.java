package kr.co.devteammate.today;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * 작업 관리(Supabase 서울 프로젝트)와 주고받는 일 - 로그인, 로그인 이어 가기, 오늘 마감 작업 읽기.
 *
 * 키는 웹 작업 관리와 같은 공개(publishable) 키다. 누가 무엇을 읽는지는 DB 의 RLS 가 정한다 -
 * 승인된 팀원만 작업을 읽는다(supabase/taskmanager.sql). service_role 키는 앱에 넣지 않는다.
 * 프로젝트를 옮기면 BASE · KEY 를 웹의 Vercel 값(NEXT_PUBLIC_SUPABASE_URL · ANON_KEY)과 같게 바꾼다.
 */
final class Api {
    static final String BASE = "https://duxqhatypwcjiqmddcmu.supabase.co";
    static final String KEY = "sb_publishable_f6jyYhExiCTRF-CBShXkwg_A2QZa9WP";
    /** 웹 작업 관리 - ?task=<id> 는 그 작업을, ?view=calendar 는 캘린더를 연다 */
    static final String WEB = "https://devteammate.co.kr/taskmanager/";

    private Api() {}

    /** 화면에 그대로 적는 실패. needLogin 이면 앱을 열어 다시 로그인해야 한다 */
    static final class ApiException extends Exception {
        final boolean needLogin;

        ApiException(String message, boolean needLogin) {
            super(message);
            this.needLogin = needLogin;
        }
    }

    static final class Task {
        String id;
        int num;
        String title;
        String status;
        String priority;
    }

    /** 위젯마다 따로 읽어도 로그인 이어 가기(토큰 갱신)는 한 번에 하나만 - 갱신 토큰은 한 번 쓰면 바뀐다 */
    private static final Object LOCK = new Object();

    /* ── 로그인 상태 ─────────────────────────────── */

    static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences("session", Context.MODE_PRIVATE);
    }

    static boolean signedIn(Context ctx) {
        return prefs(ctx).getString("refresh", null) != null;
    }

    /** 화면에 적는 이름 - 팀원 이름이 없으면 메일 */
    static String who(Context ctx) {
        SharedPreferences p = prefs(ctx);
        String name = p.getString("name", "");
        return name.isEmpty() ? p.getString("email", "") : name;
    }

    static void signOut(Context ctx) {
        synchronized (LOCK) {
            prefs(ctx).edit().clear().commit();
        }
    }

    private static void save(Context ctx, JSONObject s) throws JSONException {
        JSONObject user = s.getJSONObject("user");
        // commit - 바뀐 갱신 토큰이 바로 남아야 다음 갱신이 옛 토큰을 쓰지 않는다
        prefs(ctx).edit()
                .putString("access", s.getString("access_token"))
                .putString("refresh", s.getString("refresh_token"))
                .putLong("expiresAt", System.currentTimeMillis() / 1000 + s.optLong("expires_in", 3600))
                .putString("uid", user.getString("id"))
                .putString("email", user.optString("email", ""))
                .commit();
    }

    /* ── HTTP ─────────────────────────────────────── */

    private static final class Res {
        int code;
        String body;
    }

    private static Res call(String method, String path, String bearer, String json) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(BASE + path).openConnection();
        try {
            c.setConnectTimeout(10000);
            c.setReadTimeout(15000);
            c.setRequestMethod(method);
            c.setRequestProperty("apikey", KEY);
            c.setRequestProperty("Accept", "application/json");
            if (bearer != null) c.setRequestProperty("Authorization", "Bearer " + bearer);
            if (json != null) {
                c.setDoOutput(true);
                c.setRequestProperty("Content-Type", "application/json");
                try (OutputStream o = c.getOutputStream()) {
                    o.write(json.getBytes(StandardCharsets.UTF_8));
                }
            }
            Res r = new Res();
            r.code = c.getResponseCode();
            InputStream in = r.code >= 400 ? c.getErrorStream() : c.getInputStream();
            r.body = in == null ? "" : read(in);
            return r;
        } finally {
            c.disconnect();
        }
    }

    private static String read(InputStream in) throws IOException {
        try (InputStream s = in) {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = s.read(buf)) > 0) b.write(buf, 0, n);
            return b.toString("UTF-8");
        }
    }

    private static ApiException offline() {
        return new ApiException("서버에 닿지 않습니다. 인터넷 연결을 확인해 주세요.", false);
    }

    /* ── 로그인 ───────────────────────────────────── */

    /** 메일 · 비밀번호로 로그인하고 승인된 팀원인지 확인한다. 승인 전이면 로그인을 풀고 알린다 */
    static void signIn(Context ctx, String email, String password) throws ApiException {
        try {
            String body = new JSONObject().put("email", email).put("password", password).toString();
            Res r = call("POST", "/auth/v1/token?grant_type=password", null, body);
            if (r.code == 400 || r.code == 401) throw new ApiException("메일이나 비밀번호가 맞지 않습니다.", true);
            if (r.code == 429) throw new ApiException("잠시 너무 많이 시도했습니다. 조금 뒤 다시 해 주세요.", true);
            if (r.code >= 300) throw new ApiException("로그인하지 못했습니다(" + r.code + "). 잠시 뒤 다시 해 주세요.", true);
            synchronized (LOCK) {
                save(ctx, new JSONObject(r.body));
            }
            checkMember(ctx);
        } catch (IOException e) {
            throw offline();
        } catch (JSONException e) {
            throw new ApiException("서버 답을 읽지 못했습니다.", true);
        }
    }

    /** 팀원 줄을 읽어 이름을 남긴다. 승인 대기 · 취소면 로그인을 풀고 그 까닭을 알린다 */
    private static void checkMember(Context ctx) throws ApiException, IOException, JSONException {
        String uid = prefs(ctx).getString("uid", "");
        Res r = call("GET", "/rest/v1/tm_members?select=name,active&id=eq." + uid, access(ctx, false), null);
        if (r.code >= 300) throw new ApiException("팀원 정보를 읽지 못했습니다(" + r.code + ").", false);
        JSONArray rows = new JSONArray(r.body);
        if (rows.length() == 0 || !rows.getJSONObject(0).optBoolean("active", false)) {
            signOut(ctx);
            throw new ApiException("아직 승인되지 않은 계정입니다. 관리자에게 승인을 부탁해 주세요.", true);
        }
        prefs(ctx).edit().putString("name", rows.getJSONObject(0).optString("name", "")).commit();
    }

    /** 쓸 수 있는 접근 토큰. 1분 안에 끝나거나 force 면 갱신 토큰으로 새로 받는다 */
    private static String access(Context ctx, boolean force) throws ApiException, IOException, JSONException {
        synchronized (LOCK) {
            SharedPreferences p = prefs(ctx);
            String refresh = p.getString("refresh", null);
            if (refresh == null) throw new ApiException("앱을 열어 로그인해 주세요.", true);
            String access = p.getString("access", null);
            if (!force && access != null && p.getLong("expiresAt", 0) - 60 > System.currentTimeMillis() / 1000) return access;

            String body = new JSONObject().put("refresh_token", refresh).toString();
            Res r = call("POST", "/auth/v1/token?grant_type=refresh_token", null, body);
            if (r.code == 400 || r.code == 401) {
                signOut(ctx);
                throw new ApiException("로그인이 풀렸습니다. 앱을 열어 다시 로그인해 주세요.", true);
            }
            if (r.code >= 300) throw new ApiException("서버가 답하지 않습니다(" + r.code + ").", false);
            save(ctx, new JSONObject(r.body));
            return p.getString("access", null);
        }
    }

    /* ── 오늘 마감 ─────────────────────────────────── */

    /** 이 기기 날짜(한국) 기준 오늘 - 웹 캘린더처럼 마감일이 오늘인 작업 */
    static String todayISO() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    /**
     * 오늘이 마감일인 작업. mine 이면 내가 담당인 것만.
     * 끝나지 않은 것을 위로 - 진행 중 · 리뷰 · 할 일 · 백로그 순, 같으면 급한 순, 같으면 번호 순. 완료는 맨 아래.
     */
    static List<Task> today(Context ctx, boolean mine) throws ApiException {
        try {
            String q = "/rest/v1/tm_tasks?select=id,num,title,status,priority&due_date=eq." + todayISO();
            if (mine) q += "&assignee=eq." + prefs(ctx).getString("uid", "");
            Res r = call("GET", q, access(ctx, false), null);
            // 접근 토큰이 그사이 끝났으면 한 번만 새로 받아 다시 읽는다
            if (r.code == 401) r = call("GET", q, access(ctx, true), null);
            if (r.code == 401) throw new ApiException("로그인이 풀렸습니다. 앱을 열어 다시 로그인해 주세요.", true);
            if (r.code >= 300) throw new ApiException("작업을 읽지 못했습니다(" + r.code + ").", false);

            JSONArray rows = new JSONArray(r.body);
            // 승인이 취소되면 RLS 가 빈 목록을 준다 - '오늘 없음'으로 보이지 않게 비었을 때만 팀원 줄을 확인한다
            if (rows.length() == 0) checkMember(ctx);

            List<Task> out = new ArrayList<>();
            for (int i = 0; i < rows.length(); i++) {
                JSONObject o = rows.getJSONObject(i);
                Task t = new Task();
                t.id = o.getString("id");
                t.num = o.optInt("num");
                t.title = o.optString("title", "");
                t.status = o.optString("status", "todo");
                t.priority = o.optString("priority", "normal");
                out.add(t);
            }
            out.sort((a, b) -> {
                int d = statusRank(a.status) - statusRank(b.status);
                if (d != 0) return d;
                d = priorityRank(a.priority) - priorityRank(b.priority);
                return d != 0 ? d : Integer.compare(a.num, b.num);
            });
            return out;
        } catch (IOException e) {
            throw offline();
        } catch (JSONException e) {
            throw new ApiException("서버 답을 읽지 못했습니다.", false);
        }
    }

    static int statusRank(String s) {
        switch (s) {
            case "doing": return 0;
            case "review": return 1;
            case "todo": return 2;
            case "backlog": return 3;
            default: return 4; // done
        }
    }

    static int priorityRank(String p) {
        switch (p) {
            case "urgent": return 0;
            case "high": return 1;
            case "normal": return 2;
            default: return 3;
        }
    }

    /** 웹과 같은 이름 */
    static String statusLabel(String s) {
        switch (s) {
            case "backlog": return "백로그";
            case "todo": return "할 일";
            case "doing": return "진행 중";
            case "review": return "리뷰";
            case "done": return "완료";
            default: return s;
        }
    }

    /** 상태 점 색 */
    static int statusColor(String s) {
        switch (s) {
            case "todo": return 0xFF2644CB;
            case "doing": return 0xFFB45309;
            case "review": return 0xFF6A4C93;
            case "done": return 0xFF17805A;
            default: return 0xFF7F8B9E;
        }
    }
}
